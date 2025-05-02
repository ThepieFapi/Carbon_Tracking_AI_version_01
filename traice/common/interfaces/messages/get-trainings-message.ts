import { EnergyConsumption } from "../energy-consumption";
import { TrainingStatus } from "../../enums/training-status";


export interface GetTrainingsMessage {
    trainingId: string,
    nbWorkers: number;
    duration: number;
    status: TrainingStatus;
    co2Emission: number,
    energyConsumption: EnergyConsumption, // Easy fix for now
    accuracy: number,
    loss: number,
    cost: number,
}