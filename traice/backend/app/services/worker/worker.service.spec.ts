/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai';
import { WorkerService } from './worker.service';
import { WorkerStartMessage } from 'app/interfaces/messages/worker-start-message';
import { WorkerUpdateMessage } from 'app/interfaces/messages/worker-update-message';
import { Worker } from 'common/interfaces/worker';
import { EpochWorker } from 'common/interfaces/epoch-worker';
import { WorkerEnvironment } from 'app/interfaces/worker-hardware';
import { WorkerLocation } from 'app/interfaces/worker-location';
import { TrainingService } from '../training/training.service';
import Container from 'typedi';
import { Logger } from '../logging/logging.service';
import { restore, stub } from 'sinon';
import { DataBaseService } from '../database/database-service';

describe('WorkerService', () => {
    let workerService: WorkerService;
    let env: WorkerEnvironment;
    let epoch: EpochWorker;
    let location: WorkerLocation;
    let trainingService: TrainingService;
    let logger: Logger;
    let db: DataBaseService;

    beforeEach(() => {
        logger = Container.get(Logger);
        stub(logger);
        db = Container.get(DataBaseService);
        stub(db);
        trainingService = Container.get(TrainingService);
        workerService = Container.get(WorkerService);
        epoch = {
            id: 1,
            duration: 1,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 1,
            loss: 1,
            cost: 5,
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

    describe('createWorker', () => {
        it('should create a new worker with correct properties', async () => {
            const workerStart: WorkerStartMessage = {
                workerId: '1',
                location,
                cloud: {
                    provider: 'string',
                    region: 'string',
                },
                environment: env,
            };

            const worker: Worker = await workerService.createWorker(workerStart);

            expect(worker).to.deep.equal({
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
            });
        });
    });

    describe('addEpoch', () => {
        it('should add an epoch to the worker', async () => {
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

            const messageWorkerUpdate: WorkerUpdateMessage = {
                workerId: '1',
                epoch: 1,
                duration: 100,
                co2Emission: 10,
                energy: { cpu: 5, gpu: 3, ram: 2 },
                accuracy: 0.9,
                loss: 0.1,
            };

            const training = trainingService.createTraining();
            trainingService.addWorker(training, worker);

            workerService.addEpoch(training, messageWorkerUpdate);

            expect(worker.epochs).to.have.lengthOf(1);
            expect(worker.epochs[0]).to.deep.equal({
                id: 1,
                duration: 100,
                co2Emission: 10,
                energyConsumption: { cpu: 5, gpu: 3, ram: 2 },
                accuracy: 0.9,
                loss: 0.1,
                cost: 2,
            });
            expect(worker.energyConsumption.cpu).to.equal(5);
            expect(worker.energyConsumption.gpu).to.equal(3);
            expect(worker.energyConsumption.ram).to.equal(2);
            expect(worker.co2Emission).to.equal(10);

            workerService.addEpoch(training, messageWorkerUpdate);

            expect(worker.epochs).to.have.lengthOf(2);
            expect(worker.epochs[1]).to.deep.equal({
                id: 1,
                duration: 100,
                co2Emission: 10,
                energyConsumption: { cpu: 5, gpu: 3, ram: 2 },
                accuracy: 0.9,
                loss: 0.1,
                cost: 2,
            });
            expect(worker.energyConsumption.cpu).to.equal(10);
            expect(worker.energyConsumption.gpu).to.equal(6);
            expect(worker.energyConsumption.ram).to.equal(4);
            expect(worker.co2Emission).to.equal(20);
        });
    });

    describe('getTotalTime', () => {
        it('should return the total time of all epochs', () => {
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

            const totalTime = workerService.getTotalTime(worker);

            expect(totalTime).to.equal(3);
        });

        it('should return 0 if there are no epochs', () => {
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

            const totalTime = workerService.getTotalTime(worker);

            expect(totalTime).to.equal(0);
        });
    });

    it('should get current acc', () => {
        epoch = {
            id: 1,
            duration: 1,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 1,
            cost: 5,
        };

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
            epochs: [epoch],
        };

        const acc = workerService.getCurrentAcc(worker);

        expect(acc).to.equal(0.9);
    });

    it('should get current loss', () => {
        epoch = {
            id: 1,
            duration: 1,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 2,
            cost: 5,
        };

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
            epochs: [epoch],
        };

        const loss = workerService.getCurrentLoss(worker);

        expect(loss).to.equal(2);
    });

    it('should get current epoch id', () => {
        epoch = {
            id: 1,
            duration: 1,
            co2Emission: 0,
            energyConsumption: { gpu: 0, cpu: 0, ram: 0 },
            accuracy: 0.9,
            loss: 2,
            cost: 5,
        };

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
            epochs: [epoch],
        };

        const id = workerService.getCurrentEpoch(worker);

        expect(id).to.equal(1);
    });
});
