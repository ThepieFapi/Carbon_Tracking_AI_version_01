/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-lines */
import { TrainingService } from './training.service';
import { expect } from 'chai';
import { Training } from 'common/interfaces/training';
import { restore, stub } from 'sinon';
import { Container } from 'typedi';
import { DataBaseService } from '../database/database-service';
import { Logger } from '../logging/logging.service';
import { TrainingManager } from './training.manager';

describe('Training', () => {
    let trainingService: TrainingService;
    let dbService: DataBaseService;
    let logger: Logger;
    let training: Training;
    let trainingManager: TrainingManager;

    before(() => {
        trainingService = Container.get(TrainingService);
        training = trainingService.createTraining();
    });

    beforeEach(async () => {
        logger = Container.get(Logger);
        stub(logger);
        dbService = Container.get(DataBaseService);
        stub(dbService);
        trainingManager = Container.get(TrainingManager);
    });

    afterEach(() => {
        restore();
    });

    it('should addLiveTraining', async () => {
        trainingManager.addLiveTraining(training);
        expect(trainingManager.getLiveTraining()).to.be.deep.equal(training);
        expect(trainingManager.getTrainingById(training.id)).to.be.deep.equal(training);
    });

    it('should removeLiveTraining', async () => {
        trainingManager.addLiveTraining(training);
        trainingManager.removeLiveTraining();

        expect(trainingManager.getLiveTraining()).to.be.undefined;
        // We still need the training in all the trainings
        expect(trainingManager.getTrainingById(training.id)).to.not.be.undefined;
    });

    it('should updateTraining', async () => {
        trainingManager.addLiveTraining(training);
        training.cost = 8;
        trainingManager.updateTraining(training);

        expect(trainingManager.getLiveTraining()).to.be.deep.equal(training);
        expect(trainingManager.getTrainingById(training.id)).to.be.deep.equal(training);
    });

    it('should getAllTrainings', async () => {
        const training2 = training;
        trainingManager.addLiveTraining(training);
        training2.id = 'new';
        trainingManager.addLiveTraining(training2);

        expect(trainingManager.getAllTrainings()).to.be.deep.equal([training, training2]);
    });
});
