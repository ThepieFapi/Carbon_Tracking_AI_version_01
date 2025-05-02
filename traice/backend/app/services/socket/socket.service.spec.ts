/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { SocketService } from './socket.service';
import { io as ioClient, Socket } from 'socket.io-client';
import { restore, stub } from 'sinon';
import { Container } from 'typedi';
import { Server } from '../../server';
import { assert } from 'chai';
import * as http from 'http';
import { TrainingService } from '../training/training.service';
import { Logger } from '../logging/logging.service';
import { WorkerEnvironment } from 'common/interfaces/worker-environment';
import { WorkerLocation } from 'common/interfaces/worker-location';
import { WorkerStartMessage } from 'app/interfaces/messages/worker-start-message';
import { WORKER_START } from '../../constants/events';
import { DataBaseService } from '../database/database-service';
import { TrainingManager } from '../training/training.manager';

const RESPONSE_DELAY = 150;

describe('SocketService', () => {
    let service: SocketService;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let env: WorkerEnvironment;
    let location: WorkerLocation;
    let trainingService: TrainingService;
    let trainingManager: TrainingManager;

    let logger: Logger;
    let db: DataBaseService;

    beforeEach(async () => {
        trainingService = Container.get(TrainingService);
        logger = Container.get(Logger);
        stub(logger);
        db = Container.get(DataBaseService);
        stub(db);

        server = Container.get(Server);
        server.init();
        service = server['socketService'];
        clientSocket = ioClient(urlString);

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
        clientSocket.close();
        service.sio.close();
        restore();
    });

    it('should call handler', () => {
        const spy = stub(service, 'handleWorkerStart' as any);
        const startMessage: WorkerStartMessage = {
            workerId: '',
            location,
            cloud: {
                provider: '',
                region: '',
            },
            environment: env,
        };
        clientSocket.emit(WORKER_START, startMessage);
        setTimeout(() => {
            assert(spy.calledOnce);
        }, RESPONSE_DELAY);
    });

    it('init training should create training and worker', () => {
        const startMessage: WorkerStartMessage = {
            workerId: '1',
            location,
            cloud: {
                provider: '',
                region: '',
            },
            environment: env,
        };
        clientSocket.emit(WORKER_START, startMessage);
        setTimeout(() => {
            const training = trainingManager.getLiveTraining();
            assert(training);
            assert(training.workers.get('1'));
        }, RESPONSE_DELAY);
    });

    it('init training should not create a training if there is already one and should add worker', () => {
        const startMessage: WorkerStartMessage = {
            workerId: '2',
            location,
            cloud: {
                provider: '',
                region: '',
            },
            environment: env,
        };
        clientSocket.emit(WORKER_START, startMessage);
        setTimeout(() => {
            const training = trainingManager.getLiveTraining();
            assert(training);
            assert(training.workers.get('2'));
        }, RESPONSE_DELAY);
    });
});
