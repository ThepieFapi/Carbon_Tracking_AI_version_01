import { EnergyConsumption } from 'common/interfaces/energy-consumption';

export interface WorkerUpdateMessage {
    workerId: string;
    epoch: number;
    duration: number;
    co2Emission: number;
    energy: EnergyConsumption;
    accuracy: number;
    loss: number;
}
