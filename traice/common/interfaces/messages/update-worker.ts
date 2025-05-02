import {EnergyConsumption} from "../energy-consumption"
import { EpochWorker } from "../epoch-worker";

export interface MessageUpdateWorker {
    workerId: string,
    co2Emission: number,
    energyConsumption: EnergyConsumption,
    epoch: EpochWorker,
}