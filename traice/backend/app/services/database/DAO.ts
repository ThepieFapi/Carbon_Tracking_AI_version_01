export interface TrainingDAO {
    id: string;
    status: string;
    co2emission: number;
    energyconsumptioncpu: number;
    energyconsumptiongpu: number;
    energyconsumptionram: number;
    accuracy: number;
    loss: number;
    cost: number;
}

export interface WorkerDAO {
    id: string;
    trainingid: string;
    country: string;
    countryiso: string;
    region: string;
    latitude: number;
    longitude: number;
    cloudprovider: string;
    cloudregion: string;
    os: string;
    pythonversion: string;
    cpumodel: string;
    cpucount: number;
    gpumodel: string;
    gpucount: number;
    ram: number;
    co2emission: number;
    energyconsumptioncpu: number;
    energyconsumptiongpu: number;
    energyconsumptionram: number;
}

export interface EpochDAO {
    id: number;
    trainingid: string;
    workerid: string;
    duration: number;
    co2emission: number;
    energyconsumptioncpu: number;
    energyconsumptiongpu: number;
    energyconsumptionram: number;
    accuracy: number;
    loss: number;
    cost: number;
}
