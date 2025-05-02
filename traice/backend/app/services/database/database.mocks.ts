import { Training } from '../../../../common/interfaces/training';
import { TrainingStatus } from '../../../../common/enums/training-status';
import { Worker } from '../../../../common/interfaces/worker';
import { EnergyConsumption } from '../../../../common/interfaces/energy-consumption';
import { WorkerEnvironment } from '../../../../common/interfaces/worker-environment';
import { WorkerLocation } from '../../../../common/interfaces/worker-location';
import { EpochWorker } from 'common/interfaces/epoch-worker';
import { EpochTraining } from 'common/interfaces/epoch-training';

export const location1: WorkerLocation = {
    country: 'Germany',
    countryIso: 'DE',
    region: 'Europe',
    latitude: 52.52,
    longitude: 13.405,
};

export const cloud1 = {
    provider: 'AWS',
    region: 'eu-central-1',
};

export const environment1: WorkerEnvironment = {
    os: 'Linux',
    pythonVersion: '3.8',
    cpu: {
        model: 'Intel Xeon',
        count: 4,
    },
    gpu: {
        model: 'Nvidia Tesla T4',
        count: 1,
    },
    ram: 16,
};

export const energyConsumption1: EnergyConsumption = {
    cpu: 0,
    gpu: 0,
    ram: 0,
};

export const epochTraining1: EpochTraining = {
    id: 1,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.5,
    loss: 0.2,
    cost: 12,
};

export const epochTraining2: EpochTraining = {
    id: 2,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.6,
    loss: 0.25,
    cost: 1,
};

export const epochTraining3: EpochTraining = {
    id: 3,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0.5,
        gpu: 0.2,
        ram: 0.3,
    },
    accuracy: 0.9,
    loss: 0.28,
    cost: 1,
};

export const epochX: EpochWorker = {
    id: 1,
    duration: 100,
    co2Emission: 0,
    energyConsumption: energyConsumption1,
    accuracy: 0.8,
    cost: 12,
    loss: 0.2,
};

export const workerX: Worker = {
    id: 'worker4',
    location: location1,
    cloud: cloud1,
    environment: environment1,
    co2Emission: 0,
    energyConsumption: energyConsumption1,
    epochs: [epochX],
};

export const trainingX: Training = {
    id: '4',
    status: TrainingStatus.FINISHED,
    co2Emission: 0,
    energyConsumption: energyConsumption1,
    accuracy: 0,
    loss: 0,
    cost: 0,
    epochs: [epochTraining1, epochTraining2, epochTraining3],
    workers: new Map([['1', workerX]]),
};

export const epoch1: EpochWorker = {
    id: 1,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.8,
    loss: 0.2,
    cost: 12,
};

export const epoch2: EpochWorker = {
    id: 2,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.9,
    loss: 0.1,
    cost: 13,
};

export const epoch3: EpochWorker = {
    id: 3,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.95,
    loss: 0.05,
    cost: 13,
};

export const epoch4: EpochWorker = {
    id: 4,
    duration: 100,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0.99,
    loss: 0.01,
    cost: 13,
};

export const worker1: Worker = {
    id: 'worker1',
    location: {
        country: 'Germany',
        countryIso: 'DE',
        region: 'Europe',
        latitude: 52.52,
        longitude: 13.405,
    },
    cloud: {
        provider: 'AWS',
        region: 'eu-central-1',
    },
    environment: {
        os: 'Linux',
        pythonVersion: '3.8',
        cpu: {
            model: 'Intel Xeon',
            count: 4,
        },
        gpu: {
            model: 'Nvidia Tesla T4',
            count: 1,
        },
        ram: 16,
    },
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    epochs: [epoch1, epoch2],
};

export const worker2: Worker = {
    id: 'worker2',
    location: {
        country: 'Germany',
        countryIso: 'DE',
        region: 'Europe',
        latitude: 52.52,
        longitude: 13.405,
    },
    cloud: {
        provider: 'AWS',
        region: 'eu-central-1',
    },
    environment: {
        os: 'Linux',
        pythonVersion: '3.8',
        cpu: {
            model: 'Intel Xeon',
            count: 4,
        },
        gpu: {
            model: 'Nvidia Tesla T4',
            count: 1,
        },
        ram: 16,
    },
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    epochs: [epoch3, epoch4],
};

export const training1: Training = {
    id: '1',
    status: TrainingStatus.RUNNING,
    co2Emission: 0,
    energyConsumption: {
        cpu: 0,
        gpu: 0,
        ram: 0,
    },
    accuracy: 0,
    loss: 0,
    cost: 0,
    epochs: [epochTraining1, epochTraining2],
    workers: new Map([
        ['worker1', worker1],
        ['worker2', worker2],
    ]),
};
