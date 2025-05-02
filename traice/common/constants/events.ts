import { MessageUpdateTraining } from '../interfaces/messages/update-training';
import { MessageUpdateWorker } from '../interfaces/messages/update-worker';
import { MessageUpdateEpoch } from '../interfaces/messages/update-epoch';
import { MessageStartTraining } from '../interfaces/messages/start-training';
import { MessageStopWorker } from '../interfaces/messages/stop-worker';
import { GetTrainingsMessage } from '../interfaces/messages/get-trainings-message';

// Client -> Server
export const CLIENT_CONNECT = 'client:connect';
export const LEAVE_ROOM = 'client:leave';
export const REQUEST_TRAININGS = 'client:request:trainings'

// Server -> Client
export const START_TRAINING = 'server:start';
export const UPDATE_TRAINING = 'server:update:training';
export const UPDATE_WORKER = 'server:update:worker';
export const UPDATE_EPOCH = 'server:update:epoch';
export const STOP_WORKER = 'server:stop:worker';
export const GET_TRAININGS = 'server:update:trainings';

// Client -> Client
export const START_WORKER = 'client:start:worker';
export const UPDATE_EPOCH_BULK = 'client:update:epoch:bulk'
export const UPDATE_TRAINING_BULK = 'client:update:training:bulk'

export interface ClientEvents {
    [CLIENT_CONNECT]: (trainingId: string) => void;
    [LEAVE_ROOM]: (trainingId: string) => void;
    [REQUEST_TRAININGS]: () => void;
}
export interface ServerEvents {
    [START_TRAINING]: (message: MessageStartTraining) => void;
    [UPDATE_TRAINING]: (message: MessageUpdateTraining) => void;
    [UPDATE_WORKER]: (message: MessageUpdateWorker) => void;
    [UPDATE_EPOCH]: (message: MessageUpdateEpoch) => void;
    [STOP_WORKER]: (message: MessageStopWorker) => void;
    [GET_TRAININGS]: (message: GetTrainingsMessage[]) => void;
}
