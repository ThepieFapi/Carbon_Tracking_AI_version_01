import { EnergyConsumption } from "./energy-consumption";

export interface EpochTraining {
    id: number,
    duration: number,
    co2Emission: number,
    energyConsumption: EnergyConsumption,
    accuracy: number,
    loss: number,
    cost: number
}