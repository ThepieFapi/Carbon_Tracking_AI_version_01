/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Worker } from 'common/interfaces/worker';
import { WorkerUpdateMessage } from 'app/interfaces/messages/worker-update-message';
import { Service } from 'typedi';
import { EnergyConsumption } from 'common/interfaces/energy-consumption';
import { Training } from 'common/interfaces/training';
import { GetTrainingsMessage } from 'common/interfaces/messages/get-trainings-message';
import { WorkerService } from '../worker/worker.service';
import { TrainingStatus } from '../../../../common/enums/training-status';
import { MessageUpdateEpoch } from 'common/interfaces/messages/update-epoch';
import { EpochTraining } from 'common/interfaces/epoch-training';
import { EpochWorker } from 'common/interfaces/epoch-worker';
import { MessageUpdateWorker } from 'common/interfaces/messages/update-worker';
import { MessageUpdateTraining } from 'common/interfaces/messages/update-training';
import { Logger } from '../logging/logging.service';
import { TrainingManager } from './training.manager';
import { TRAININGS_ROOM } from 'app/constants/rooms';

@Service()
export class TrainingService {
    private finishedWorkers!: Set<string>;

    constructor(
        private readonly workerService: WorkerService,
        private readonly logger: Logger,
        private readonly trainingManager: TrainingManager,
    ) {
        this.finishedWorkers = new Set<string>();
    }

    createTraining(): Training {
        const training: Training = {
            id: this.generateUUID(),
            status: TrainingStatus.RUNNING,
            co2Emission: 0,
            energyConsumption: { cpu: 0, gpu: 0, ram: 0 },
            accuracy: 0,
            loss: 0,
            cost: 0,
            epochs: [],
            workers: new Map<string, Worker>(),
        };

        this.trainingManager.addLiveTraining(training);
        this.logger.info(`Created training ${training.id}.`);

        return training;
    }

    /**
     * Modifies a worker in a training after reception of a new update message for that worker.
     *
     * @param training - The training object to modify.
     * @param workerUpdate - The WorkerUpdateMessage containing the information.
     * @returns A WorkerUpdateMessage with the worker's epoch information for the client.
     */
    modifyWorker(training: Training, workerUpdate: WorkerUpdateMessage) {
        this.workerService.addEpoch(training, workerUpdate);
        return this.transformIntoWorkerUpdateMessage(training, workerUpdate);
    }

    addWorker(training: Training, worker: Worker) {
        training.workers.set(worker.id, worker);
        this.logger.info(`Added worker ${worker.id} to training ${training.id}.`);
    }

    /**
     * Marks a training as finished for a training and performs necessary actions if all workers are done.
     * @param training - The training object.
     * @param workerId - The ID of the worker.
     * @returns If there are any workers still active.
     */
    endWorker(training: Training, workerId: string): boolean {
        let workersLeft: boolean = true;

        this.finishedWorkers.add(workerId);
        this.logger.info(`End of worker ${workerId} in training ${training.id}.`);

        // If all workers are done
        if (training.workers.size === this.finishedWorkers.size) {
            // Training is over
            training.status = TrainingStatus.FINISHED;

            // Reset
            this.trainingManager.updateTraining(training);
            this.trainingManager.removeLiveTraining(); // TODO: Remove when we accept many live trainings
            this.finishedWorkers = new Set<string>();

            workersLeft = false;
            this.logger.info(`End of training ${training.id}.`);
        }

        return workersLeft;
    }

    /**
     * Transforms a Training object into a GetTrainingsMessage object.
     * GetTrainingsMessage object contains only the necessary data of a Training object to be sent to the client.
     * @param training The Training object to transform.
     * @returns The transformed GetTrainingsMessage object.
     */
    transformIntoGetTrainingsMessage(training: Training): GetTrainingsMessage {
        const message: GetTrainingsMessage = {
            trainingId: training.id,
            nbWorkers: training.workers.size,
            duration: this.getTotalTime(training),
            status: training.status,
            co2Emission: training.co2Emission,
            energyConsumption: training.energyConsumption,
            accuracy: training.accuracy,
            loss: training.loss,
            cost: training.cost,
        };

        return message;
    }

    /**
     * Transforms a training object and a worker update message into a message to update a worker.
     * @param training - The training object.
     * @param workerUpdateMessage - The worker update message.
     * @returns The message to update a worker.
     */
    transformIntoWorkerUpdateMessage(training: Training, workerUpdateMessage: WorkerUpdateMessage): MessageUpdateWorker {
        const worker: Worker = training.workers.get(workerUpdateMessage.workerId) as Worker;
        const lastEpoch = worker.epochs[worker.epochs.length - 1];

        const message: MessageUpdateWorker = {
            workerId: workerUpdateMessage.workerId,
            co2Emission: worker.co2Emission,
            epoch: lastEpoch,
            energyConsumption: { cpu: worker.energyConsumption.cpu, gpu: worker.energyConsumption.gpu, ram: worker.energyConsumption.ram },
        };

        return message;
    }

    /**
     * Transforms training current epoch data to a message that will be sent to the client.
     * @param training - The training object.
     * @param epoch - The epoch number.
     * @returns The message to update an epoch.
     */
    transformIntoEpochUpdateMessage(meanEpoch: EpochTraining): MessageUpdateEpoch {
        const epochMessage: MessageUpdateEpoch = meanEpoch;
        return epochMessage;
    }
    /**
     * Transforms a Training object into a MessageUpdateTraining object.
     * @param training The Training object.
     * @returns The transformed MessageUpdateTraining object.
     */
    transformIntoTrainingUpdateMessage(training: Training): MessageUpdateTraining {
        return {
            epoch: training.epochs[training.epochs.length - 1].id,
            status: training.status,
            co2Emission: training.co2Emission,
            energyConsumption: training.energyConsumption,
            accuracy: training.accuracy,
            loss: training.loss,
            cost: training.cost,
        };
    }

    /**
     * Updates the training data for a specific training epoch after that all workers finished that epoch.
     *
     * @param training - The training object.
     * @param epoch - The epoch number.
     * @returns The updated training data.
     */
    updateTraining(training: Training, meanEpoch: EpochTraining) {
        training.epochs.push(meanEpoch);
        training.co2Emission += meanEpoch.co2Emission;
        training.energyConsumption.cpu += meanEpoch.energyConsumption.cpu;
        training.energyConsumption.gpu += meanEpoch.energyConsumption.gpu;
        training.energyConsumption.ram += meanEpoch.energyConsumption.ram;
        training.accuracy = meanEpoch.accuracy;
        training.loss = meanEpoch.loss;
        training.cost += meanEpoch.cost;
        return training;
    }

    /**
     * Aggregates the workers information for a specific epoch of training.
     *
     * @param training - The training object.
     * @param epoch - The epoch number.
     * @returns The aggregated data for the specified epoch.
     */
    aggregateWorkersInformationByEpoch(training: Training, epoch: number) {
        const epochs: EpochWorker[] = this.getAllWorkersDataByEpoch(training, epoch);

        const { cpu, gpu, ram } = this.getTotalEnergyConsumption(epochs);
        const meanEpoch: EpochTraining = {
            id: epoch,
            duration: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.duration : 0), 0),
            co2Emission: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.co2Emission : 0), 0),
            energyConsumption: { cpu, gpu, ram },
            accuracy: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.accuracy : 0), 0) / training.workers.size,
            loss: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.loss : 0), 0) / training.workers.size,
            cost: epochs.reduce((cost: number, epoch: EpochWorker) => cost + (epoch ? epoch.cost : 0), 0),
        };
        return meanEpoch;
    }
    /**
     * Checks if all workers have finished the specified epoch in a training.
     * @param training - The training object.
     * @param currEpoch - The current epoch number.
     * @returns True if all workers have finished the specified epoch, false otherwise.
     */
    checkWorkersEpochFinished(training: Training, currEpoch: number): boolean {
        let check = true;
        [...training.workers.values()].forEach((worker: Worker) => {
            let lastEpochId = -1;
            if (worker.epochs.length) lastEpochId = this.workerService.getCurrentEpoch(worker);
            if (lastEpochId < currEpoch) check = false;
        });

        return check;
    }

    /**
     * Converts a Training object to a structure suitable for JSON serialization.
     * This method handles the serialization of the Workers Map manually.
     * @param training The Training object to be converted.
     * @returns The serialized Training object.
     */
    trainingToJson(training: Training) {
        // Convert the training object to a structure suitable for JSON serialization,
        // specifically handling the Map serialization manually
        const serializedTraining: Training = {
            ...training,
            workers: Array.from(training.workers).reduce(
                (obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                },
                {} as { [k: string]: Worker },
            ) as unknown as Map<string, Worker>,
        };

        // Convert the modified training object to a JSON string
        return serializedTraining;
    }

    private getTotalTime(training: Training): number {
        return this.reduce(training, this.workerService.getTotalTime);
    }

    private generateUUID(): string {
        let timestamp = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (timestamp + Math.random() * 16) % 16 | 0;
            timestamp = Math.floor(timestamp / 16);
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    private reduce(training: Training, adder: Function): number {
        return [...training.workers.values()].reduce((accumulator, worker): number => {
            return worker.epochs?.length ? accumulator + adder(worker) : accumulator;
        }, 0);
    }

    private getAllWorkersDataByEpoch(training: Training, epoch: number): EpochWorker[] {
        return Array.from(training.workers.values(), (worker: Worker) => worker.epochs[epoch]);
    }

    /**
     * Calculates the total energy consumption for a given property(cpu, gpu or ram) across all workers epochs .
     * @param property - The property to calculate the total for.
     * @param epochs - An array of workers epochs (ex: epoch 1 of every worker).
     * @returns The total energy consumption for the specified property.
     */
    private calculateTotalEnergyConsumption(property: keyof EnergyConsumption, epochs: EpochWorker[]) {
        return epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.energyConsumption[property] : 0), 0);
    }

    private getTotalEnergyConsumption(epochs: EpochWorker[]): EnergyConsumption {
        const cpu = this.calculateTotalEnergyConsumption('cpu', epochs);
        const gpu = this.calculateTotalEnergyConsumption('gpu', epochs);
        const ram = this.calculateTotalEnergyConsumption('ram', epochs);
        return { cpu, gpu, ram };
    }
}
