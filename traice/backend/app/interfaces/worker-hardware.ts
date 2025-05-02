export interface WorkerEnvironment {
    os: string;
    pythonVersion: string;
    cpu: {
        model: string;
        count: number;
    };
    gpu: {
        model: string;
        count: number;
    };
    ram: number;
}
