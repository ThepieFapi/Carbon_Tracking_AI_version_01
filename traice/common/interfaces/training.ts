import { Worker } from './worker';
import { EnergyConsumption } from "./energy-consumption"
import { TrainingStatus } from '../enums/training-status';
import { EpochTraining } from './epoch-training';

export interface Training {
    id: string,
    status: TrainingStatus,
    co2Emission: number,
    energyConsumption: EnergyConsumption,
    accuracy: number,
    loss: number,
    cost: number,
    epochs: EpochTraining[],
    workers: Map<string, Worker>
}