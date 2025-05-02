import { WorkerCloud } from 'app/interfaces/worker-cloud';
import { WorkerEnvironment } from 'app/interfaces/worker-hardware';
import { WorkerLocation } from 'app/interfaces/worker-location';

export interface WorkerStartMessage {
    workerId: string;
    location: WorkerLocation;
    cloud: WorkerCloud;
    environment: WorkerEnvironment;
}
