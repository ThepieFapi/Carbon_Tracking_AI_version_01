import { TrainingStatus } from "../../enums/training-status";
import { EnergyConsumption } from "../energy-consumption";

export interface MessageUpdateTraining {
    epoch: number,
    status: TrainingStatus,
    co2Emission: number,
    energyConsumption: EnergyConsumption,
    accuracy: number,
    loss: number,
    cost: number,
}