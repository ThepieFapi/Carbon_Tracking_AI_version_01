import { EnergyConsumption } from "./energy-consumption"
import { EpochWorker } from "./epoch-worker"
import { WorkerCloud } from "./worker-cloud"
import { WorkerEnvironment } from "./worker-environment"
import { WorkerLocation } from "./worker-location"

export interface Worker {
    id: string,
    location: WorkerLocation,
    cloud: WorkerCloud,
    environment: WorkerEnvironment,
    co2Emission: number,
    energyConsumption: EnergyConsumption,
    epochs: EpochWorker[],
}