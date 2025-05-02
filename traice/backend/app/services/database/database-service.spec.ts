import { expect } from 'chai';
import { DataBaseService } from './database-service';
import { TrainingStatus } from '../../../../common/enums/training-status';
import Container from 'typedi';
import { Logger } from '../logging/logging.service';
import { restore, stub } from 'sinon';
import * as MOCKS from './database.mocks';
import { DB_TEST_CONFIG } from '../../constants/database';
import { setUpTestDb } from './test-db-script';
import { Worker } from '../../../../common/interfaces/worker';

async function delay(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('DataBaseService', () => {
    let databaseService: DataBaseService;
    let logger: Logger;

    before(async () => {
        logger = Container.get(Logger);
        stub(logger);

        await setUpTestDb();
        await delay(7000); // Wait for container to be well init

        databaseService = new DataBaseService(logger, DB_TEST_CONFIG);

        await databaseService.addTraining(MOCKS.training1);

        const w1 = MOCKS.training1.workers.get('worker1') as Worker;
        const w2 = MOCKS.training1.workers.get('worker2') as Worker;

        await databaseService.addTraining(MOCKS.training1);

        await databaseService.addWorker(w1, MOCKS.training1.id);
        await databaseService.addWorker(w2, MOCKS.training1.id);

        await databaseService.addEpoch(w1.epochs[0], MOCKS.training1.id, w1.id);
        await databaseService.addEpoch(w1.epochs[1], MOCKS.training1.id, w1.id);
        await databaseService.addEpoch(w2.epochs[0], MOCKS.training1.id, w2.id);
        await databaseService.addEpoch(w2.epochs[1], MOCKS.training1.id, w2.id);
    });

    after(async () => {
        restore();
    });

    it('should get a training', async () => {
        expect((await databaseService.getTraining(MOCKS.training1.id))?.id).to.equal(MOCKS.training1.id);
    });

    it('should get all trainings', async () => {
        await databaseService.addTraining(MOCKS.trainingX);
        const trainings = await databaseService.getAllTrainings();
        expect(trainings[0].id).to.equal(MOCKS.training1.id);
        expect(trainings[1].id).to.equal(MOCKS.trainingX.id);
    });

    it('should add a training', async () => {
        await databaseService.addTraining(MOCKS.trainingX);
        expect((await databaseService.getTraining(MOCKS.trainingX.id))?.id).to.equal(MOCKS.trainingX.id);
    });

    it('should add a worker', async () => {
        await databaseService.addWorker(MOCKS.worker2, MOCKS.training1.id);
        const training = await databaseService.getTraining(MOCKS.training1.id);
        expect(training?.workers.get(MOCKS.worker2.id)?.id).to.equal(MOCKS.worker2.id);
    });

    it('should add an epoch', async () => {
        await databaseService.addEpoch(MOCKS.epoch4, MOCKS.training1.id, 'worker1');
        const training = await databaseService.getTraining(MOCKS.training1.id);
        expect(training?.workers.get('worker1')?.epochs.length).to.equal(3);
    });

    it('should update an existing training', async () => {
        const updated = { ...MOCKS.training1, status: TrainingStatus.UNKNOWN };
        await databaseService.updateTraining(updated);
        const training = await databaseService.getTraining(MOCKS.training1.id);
        expect(training?.status).to.equal(TrainingStatus.UNKNOWN);
    });

    it('should update an existing worker', async () => {
        const updated = { ...MOCKS.worker1, co2Emission: 100 };
        await databaseService.updateWorker(updated, MOCKS.training1.id);
        const training = await databaseService.getTraining(MOCKS.training1.id);
        expect(training?.workers.get(MOCKS.worker1.id)?.co2Emission).to.equal(100);
    });
});
