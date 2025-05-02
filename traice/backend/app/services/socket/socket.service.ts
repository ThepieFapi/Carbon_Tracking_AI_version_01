import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { WorkerStartMessage } from 'app/interfaces/messages/worker-start-message';
import * as events from '../../../../common/constants/events';
import { Training } from 'common/interfaces/training';
import { Worker } from 'common/interfaces/worker';
import { WorkerStopMessage } from 'app/interfaces/messages/worker-stop-message';
import { WorkerUpdateMessage } from 'app/interfaces/messages/worker-update-message';
import { TrainingService } from '../training/training.service';
import { WorkerService } from '../worker/worker.service';
import { DataBaseService } from '../database/database-service';
import { MessageUpdateEpoch } from 'common/interfaces/messages/update-epoch';
import { MessageUpdateWorker } from 'common/interfaces/messages/update-worker';
import { WORKER_REFUSED, WORKER_START, WORKER_STOP, WORKER_UPDATE } from '../../constants/events';
import { MessageUpdateTraining } from 'common/interfaces/messages/update-training';
import { MessageStartTraining } from 'common/interfaces/messages/start-training';
import { Logger } from '../logging/logging.service';
import { EpochTraining } from 'common/interfaces/epoch-training';
import { GetTrainingsMessage } from 'common/interfaces/messages/get-trainings-message';
import { TRAININGS_ROOM } from '../../constants/rooms';
import { TrainingManager } from '../training/training.manager';

@Service()
export class SocketService {
    sio!: io.Server<events.ClientEvents, events.ServerEvents>;

    constructor(
        private readonly trainingService: TrainingService,
        private readonly trainingManager: TrainingManager,
        private readonly workerService: WorkerService,
        private readonly dataBaseService: DataBaseService,
        private readonly logger: Logger,
    ) {}

    init(server: http.Server) {
        this.createSocketServer(server);
    }

    handleEvents(): void {
        this.sio.on('connection', (socket: io.Socket) => this.configureSockets(socket));
    }

    createSocketServer(server: http.Server): void {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    private async configureSockets(socket: io.Socket): Promise<void> {
        // Client
        socket.on(events.CLIENT_CONNECT, async (trainingId: string) => {
            await this.initClient(socket, trainingId);
        });
        socket.on(events.LEAVE_ROOM, (trainingId: string) => {
            this.handleLeaveRoom(socket, trainingId);
        });
        socket.on(events.REQUEST_TRAININGS, async () => {
            socket.join(TRAININGS_ROOM);
            this.handleUpdateTrainings();
        });

        // Library
        socket.on(WORKER_START, async (workerStart: WorkerStartMessage) => {
            await this.handleWorkerStart(socket, workerStart);
            this.handleUpdateTrainings();
        });

        socket.on(WORKER_UPDATE, async (WorkerUpdateMessage) => {
            await this.handleWorkerUpdate(WorkerUpdateMessage);
            this.handleUpdateTrainings();
        });

        socket.on(WORKER_STOP, async (workerStop: WorkerStopMessage) => {
            await this.handleWorkerStop(socket, workerStop);
            this.handleUpdateTrainings();
        });
    }

    private handleUpdateTrainings() {
        this.sio.to(TRAININGS_ROOM).emit(events.GET_TRAININGS, this.getTrainings());
    }

    private handleLeaveRoom(socket: io.Socket, trainingId: string) {
        socket.leave(trainingId);
    }

    private async handleWorkerStart(socket: io.Socket, messageStart: WorkerStartMessage): Promise<void> {
        try {
            // ATTENTION: this works only if we have a single training, ok for the prototype but will have to fix.
            let trainingCreated = false;
            let training: Training | undefined = this.trainingManager.getLiveTraining();

            if (!training) {
                trainingCreated = true;
                training = this.trainingService.createTraining();
            }

            if (training.epochs.length > 0) {
                // In this case, we already started a training with a subset of workers.
                // We will not accept any more workers.
                // This means we consider federated learning to be static and synchronous.
                // In the case where this hypothesis changes (if the project evolves), this logic will have to change.

                // Stop connection with library, this worker should not be able to connect.
                socket.emit(WORKER_REFUSED, 'Connection refused by server because the training had already started.');
                socket.disconnect(true);

                this.logger.warn(
                    `Worker ${messageStart.workerId} tried to connect to training ${training.id} but it had already started. The connection has been refused.`,
                );
            }

            const worker: Worker = this.workerService.createWorker(messageStart);
            this.trainingService.addWorker(training, worker);

            // Since this code is async, we put it here at the end of the task.
            // This ensures that in the event where we receive updates really quickly (quicker then the time it takes to add in the database),
            // then at least in our memory everything will be well instantiated, the application will continue to work normally and only the DB calls will get queued, which is fine.
            // We want the services to act quickly, not await anything, and the awaiting will occur in the socket service.
            if (trainingCreated) {
                await this.dataBaseService.addTraining(training);
            }
            await this.dataBaseService.addWorker(worker, training.id);
        } catch (error: any) {
            this.logger.error(`Error caught in handleWorkerStart: ${error.message}. Stack: ${error.stack}`);
        }
    }

    private async handleWorkerUpdate(workerUpdate: WorkerUpdateMessage): Promise<void> {
        try {
            const training: Training | undefined = this.trainingManager.getLiveTraining();
            if (!training) {
                this.logger.warn(
                    `Tried to get worker ${workerUpdate.workerId} in handleWorkerUpdate but could not resolve the corresponding training.`,
                );
                return;
            }

            // Modify worker in training
            // We do not modify the training's information, this will be done in bulk for an epoch when all workers have finished the same epoch
            const messageWorkerUpdate: MessageUpdateWorker = this.trainingService.modifyWorker(training, workerUpdate);

            // Send to room
            this.sio.to(training.id).emit(events.UPDATE_WORKER, messageWorkerUpdate);

            if (this.trainingService.checkWorkersEpochFinished(training, workerUpdate.epoch)) {
                await this.handleWorkerEpochUpdate(training, workerUpdate);
            }

            // Modify DB at the end of the treatment
            const worker: Worker = training.workers.get(messageWorkerUpdate.workerId) as Worker;
            await this.dataBaseService.updateWorker(worker, training.id);
            await this.dataBaseService.addEpoch(messageWorkerUpdate.epoch, training.id, worker.id);
        } catch (error: any) {
            this.logger.error(`Error caught in handleWorkerUpdate: ${error.message}. Stack: ${error.stack}`);
        }
    }

    /**
     * This runs when all the workers finish the same epoch.
     * Sends events.UPDATE_EPOCH and events.UPDATE_TRAINING to the client.
     * This respectively send to the client the common epoch of all the workers and the cumulative information on the training.
     * @param training - The training object.
     * @param workerUpdateMessage - The worker update message.
     */
    private async handleWorkerEpochUpdate(training: Training, workerUpdateMessage: WorkerUpdateMessage): Promise<void> {
        const meanEpoch: EpochTraining = this.trainingService.aggregateWorkersInformationByEpoch(training, workerUpdateMessage.epoch);
        const messageEpochUpdate: MessageUpdateEpoch = meanEpoch;

        // Update the client with the epoch data
        this.sio.to(training.id).emit(events.UPDATE_EPOCH, messageEpochUpdate);
        this.logger.info(`Emitted event events.UPDATE_EPOCH with epoch #${workerUpdateMessage.epoch} for training ${training.id} to clients.`);

        const updatedTraining: Training = this.trainingService.updateTraining(training, meanEpoch);
        const messageTrainingUpdate: MessageUpdateTraining = this.trainingService.transformIntoTrainingUpdateMessage(updatedTraining);
        // Update the client with the cumulative data of the training
        this.sio.to(training.id).emit(events.UPDATE_TRAINING, messageTrainingUpdate);
        this.logger.info(`Emitted event events.UPDATE_TRAINING with epoch #${workerUpdateMessage.epoch} for training ${training.id} to clients.`);

        // Modify DB at the end of the treatment
        await this.dataBaseService.updateTraining(training);
    }

    private async handleWorkerStop(socket: io.Socket, workerStop: WorkerStopMessage): Promise<void> {
        try {
            const training: Training | undefined = this.trainingManager.getLiveTraining();

            if (!training) {
                this.logger.warn(`Tried to get worker ${workerStop.workerId} in handleWorkerStop but could not resolve the corresponding training.`);
                return;
            }
            const id = training.id;
            const workersLeft = this.trainingService.endWorker(training, workerStop.workerId);

            // Emit stop to room
            this.sio.to(id).emit(events.STOP_WORKER, { id: workerStop.workerId });

            // We close the room if the training is done, we will not need to send any more events.
            // We also update the training to mark that it is finished
            if (!workersLeft) {
                this.sio.of('/').adapter.rooms.delete(id);
                await this.dataBaseService.updateTraining(training);
            }

            // Stop connection with library (the library process will wait for our disconnection to end)
            socket.disconnect(true);
        } catch (error: any) {
            this.logger.error(`Error caught in handleWorkerStop: ${error.message}. Stack: ${error.stack}`);
        }
    }

    private getTrainings(): GetTrainingsMessage[] {
        try {
            const trainings: Training[] = this.trainingManager.getAllTrainings();
            const allMessages: GetTrainingsMessage[] = trainings
                .map((training: Training) => {
                    const message = this.trainingService.transformIntoGetTrainingsMessage(training);
                    return message;
                })
                .reverse();
            return allMessages;
        } catch (error: any) {
            this.logger.error(`Error caught in getTrainings: ${error.message}. Stack: ${error.stack}`);
            return [];
        }
    }

    private async initClient(socket: io.Socket, trainingId: string) {
        try {
            const training: Training | undefined = this.trainingManager.getTrainingById(trainingId);

            if (training == undefined) {
                this.logger.warn(`Tried to get training ${trainingId} in initClient but could not resolve the corresponding training.`);
                return;
            }
            // By default, this creates the room if it does not exist
            socket.join(training.id);

            // Send only to specific client, not room
            this.sio.to(socket.id).emit(events.START_TRAINING, this.trainingService.trainingToJson(training) as unknown as MessageStartTraining);

            this.logger.info(`Client connection to training ${training.id}.`);
        } catch (error: any) {
            this.logger.error(`Error caught in initClient: ${error.message}. Stack: ${error.stack}`);
        }
    }
}
