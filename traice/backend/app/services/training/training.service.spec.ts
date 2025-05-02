/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-lines */
import { TrainingService } from './training.service';
import { assert, expect } from 'chai';
import { Training } from 'common/interfaces/training';
import { Worker } from 'common/interfaces/worker';
import { restore, stub } from 'sinon';
import { Container } from 'typedi';
import { EpochTraining } from 'common/interfaces/epoch-training';
import { WorkerEnvironment } from 'app/interfaces/worker-hardware';
import { WorkerLocation } from 'app/interfaces/worker-location';
import { DataBaseService } from '../database/database-service';
import { Logger } from '../logging/logging.service';
import { WorkerUpdateMessage } from 'app/interfaces/messages/worker-update-message';

describe('Training', () => {
    let trainingService: TrainingService;
    let dbService: DataBaseService;
    let env: WorkerEnvironment;
    let epoch: EpochTraining;
    let location: WorkerLocation;
    let logger: Logger;

    beforeEach(async () => {
        logger = Container.get(Logger);
        stub(logger);
        dbService = Container.get(DataBaseService);
        stub(dbService);
        trainingService = Container.get(TrainingService);
        epoch = {
            id: 1,
            duration: 1,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 1,
            loss: 1,
            cost: 0,
        };
        env = {
            os: 'Unknown',
            pythonVersion: 'Unknown',
            cpu: {
                model: 'Unknown',
                count: 0,
            },
            gpu: {
                model: 'Unknown',
                count: 0,
            },
            ram: 0,
        };
        location = { country: 'string', countryIso: 'string', region: 'string', latitude: 0, longitude: 0 };
    });

    afterEach(() => {
        restore();
    });

    it('should create a new Training object with correct properties', async () => {
        const generateUUIDStub = stub(trainingService, 'generateUUID' as any).returns('mocked-uuid');

        const training: Training = trainingService.createTraining();

        expect(training).to.deep.equal({
            id: 'mocked-uuid',
            status: 'Running',
            co2Emission: 0,
            energyConsumption: { cpu: 0, gpu: 0, ram: 0 },
            accuracy: 0,
            loss: 0,
            cost: 0,
            workers: new Map<string, Worker>(),
            epochs: [],
        });

        generateUUIDStub.restore();
    });

    it('should add a worker', async () => {
        stub(trainingService, 'generateUUID' as any).returns('mocked-uuid');

        const training = trainingService.createTraining();
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [],
        };
        trainingService.addWorker(training, worker);

        assert.isTrue(training.workers.size === 1);
        expect(training.workers.get('1')).to.deep.equal(worker);
    });

    it('should remove a worker', async () => {
        const training = trainingService.createTraining();
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [],
        };
        const worker2: Worker = {
            id: '2',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [],
        };

        trainingService.addWorker(training, worker);
        trainingService.addWorker(training, worker2);
        await trainingService.endWorker(training, '1');
        assert.isTrue(trainingService['finishedWorkers'].size === 1);

        await trainingService.endWorker(training, '2');

        assert.isTrue(trainingService['finishedWorkers'].size === 0);
    });

    it('should return the total time of all epochs', async () => {
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch, epoch, epoch],
        };

        const training = await trainingService.createTraining();
        training.workers.set('1', worker);
        training.workers.set('2', worker);

        const totalTime = trainingService['getTotalTime'](training);

        expect(totalTime).to.equal(6);
    });

    it('should return 0 if there are no workers', async () => {
        const training = await trainingService.createTraining();
        const totalTime = trainingService['getTotalTime'](training);

        expect(totalTime).to.equal(0);
    });

    it('should update training after worker update', async () => {
        const training = await trainingService.createTraining();
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [],
        };

        trainingService.addWorker(training, worker);

        const messageWorkerUpdate: WorkerUpdateMessage = {
            workerId: '1',
            epoch: 1,
            duration: 100,
            co2Emission: 10,
            energy: { cpu: 5, gpu: 3, ram: 2 },
            accuracy: 0.9,
            loss: 0.1,
        };

        trainingService.modifyWorker(training, messageWorkerUpdate);
        const workerTraining = training.workers.get('1') as Worker;

        expect(workerTraining.co2Emission).to.equal(10);
        expect(workerTraining.epochs.length).to.equal(1);
        expect(workerTraining.co2Emission).to.equal(10);
    });

    it('should return checkWorkersEpochFinished', async () => {
        const epoch1 = {
            id: 1,
            duration: 1,
            co2Emission: 5,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 1,
            cost: 1,
        };
        const epoch2 = {
            id: 2,
            duration: 2,
            co2Emission: 10,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 1,
            cost: 1,
        };
        const epoch3 = {
            id: 3,
            duration: 3,
            co2Emission: 15,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 1,
            cost: 1,
        };
        const training = await trainingService.createTraining();
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch1],
        };
        const worker2: Worker = {
            id: '2',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch1, epoch2],
        };
        const worker3: Worker = {
            id: '3',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch1, epoch2, epoch3],
        };

        trainingService.addWorker(training, worker);
        trainingService.addWorker(training, worker2);
        trainingService.addWorker(training, worker3);

        const trueCheck = trainingService.checkWorkersEpochFinished(training, 1);
        const falseCheck = trainingService.checkWorkersEpochFinished(training, 2);
        const falseCheck2 = trainingService.checkWorkersEpochFinished(training, 3);

        expect(trueCheck).to.be.true;
        expect(falseCheck).to.be.false;
        expect(falseCheck2).to.be.false;
    });

    it('should transformIntoEpochUpdateMessage', async () => {
        const epoch1 = {
            id: 0,
            duration: 1,
            co2Emission: 5,
            energyConsumption: { gpu: 2, cpu: 2, ram: 2 },
            accuracy: 0.7,
            loss: 1.1,
            cost: 1,
        };
        const epoch2 = {
            id: 0,
            duration: 2,
            co2Emission: 10,
            energyConsumption: { gpu: 6, cpu: 6, ram: 6 },
            accuracy: 0.8,
            loss: 1,
            cost: 1,
        };
        const epoch3 = {
            id: 0,
            duration: 3,
            co2Emission: 15,
            energyConsumption: { gpu: 4, cpu: 4, ram: 4 },
            accuracy: 0.9,
            loss: 1.2,
            cost: 1,
        };
        const training = await trainingService.createTraining();
        const worker: Worker = {
            id: '1',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch1],
        };
        const worker2: Worker = {
            id: '2',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch2],
        };
        const worker3: Worker = {
            id: '3',
            location,
            cloud: {
                provider: 'string',
                region: 'string',
            },
            environment: env,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            epochs: [epoch3],
        };

        const meanEpoch: EpochTraining = {
            id: 0,
            cost: 1,
            duration: 2,
            co2Emission: 30,
            energyConsumption: { gpu: 12, cpu: 12, ram: 12 },
            accuracy: 0.7999999999999999,
            loss: 1.0999999999999999,
        };

        trainingService.addWorker(training, worker);
        trainingService.addWorker(training, worker2);
        trainingService.addWorker(training, worker3);

        const message = trainingService.transformIntoEpochUpdateMessage(trainingService.aggregateWorkersInformationByEpoch(training, 0));

        expect(message.co2Emission).to.equal(meanEpoch.co2Emission);
        expect(message.energyConsumption).to.deep.equal(meanEpoch.energyConsumption);
        expect(message.id).to.deep.equal(meanEpoch.id);
    });
});
