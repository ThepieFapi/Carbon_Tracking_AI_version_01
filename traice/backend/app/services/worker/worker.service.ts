import { Worker } from 'common/interfaces/worker';
import { WorkerUpdateMessage } from 'app/interfaces/messages/worker-update-message';
import { Service } from 'typedi';
import { WorkerStartMessage } from 'app/interfaces/messages/worker-start-message';
import { Training } from 'common/interfaces/training';
import { EpochWorker } from 'common/interfaces/epoch-worker';
import { Logger } from '../logging/logging.service';
import { CostService } from '../cost/cost.service';

@Service()
export class WorkerService {
    constructor(
        private readonly logger: Logger,
        private readonly costService: CostService,
    ) {}

    createWorker(workerStart: WorkerStartMessage): Worker {
        const worker: Worker = {
            id: workerStart.workerId,
            location: workerStart.location,
            cloud: workerStart.cloud,
            environment: workerStart.environment,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [],
        };
        this.logger.info(`Created worker ${workerStart.workerId}.`);
        return worker;
    }

    addEpoch(training: Training, messageWorkerUpdate: WorkerUpdateMessage) {
        const worker: Worker = training.workers.get(messageWorkerUpdate.workerId) as Worker;

        worker.energyConsumption.cpu += messageWorkerUpdate.energy.cpu;
        worker.energyConsumption.gpu += messageWorkerUpdate.energy.gpu;
        worker.energyConsumption.ram += messageWorkerUpdate.energy.ram;
        worker.co2Emission += messageWorkerUpdate.co2Emission;
        const epoch: EpochWorker = {
            id: messageWorkerUpdate.epoch,
            duration: messageWorkerUpdate.duration,
            co2Emission: messageWorkerUpdate.co2Emission,
            energyConsumption: messageWorkerUpdate.energy,
            accuracy: messageWorkerUpdate.accuracy,
            loss: messageWorkerUpdate.loss,
            cost: this.costService.calulateEnergyCost(
                messageWorkerUpdate.energy.cpu + messageWorkerUpdate.energy.gpu + messageWorkerUpdate.energy.ram,
                worker.location.country,
            ),
        };
        worker.epochs.push(epoch);
    }

    getTotalTime(worker: Worker): number {
        const epochs = worker.epochs;

        if (!epochs) return 0;

        return worker.epochs.reduce((accumulator: number, epoch: EpochWorker): number => {
            return epoch ? accumulator + epoch.duration : accumulator;
        }, 0);
    }

    getCurrentEpoch(worker: Worker): number {
        return worker.epochs[worker.epochs.length - 1].id;
    }
    getCurrentAcc(worker: Worker): number {
        return worker.epochs[worker.epochs.length - 1].accuracy;
    }

    getCurrentLoss(worker: Worker): number {
        return worker.epochs[worker.epochs.length - 1].loss;
    }
}
