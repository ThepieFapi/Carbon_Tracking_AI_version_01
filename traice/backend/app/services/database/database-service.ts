import { Training } from 'common/interfaces/training';
import { Service } from 'typedi';
import { Worker } from 'common/interfaces/worker';
import { DB_CONFIG } from '../../constants/database';
import { EpochWorker } from 'common/interfaces/epoch-worker';
import { Logger } from '../logging/logging.service';
import * as pg from 'pg';
import { EpochTraining } from 'common/interfaces/epoch-training';
import { EpochDAO, TrainingDAO, WorkerDAO } from './DAO';
import { TrainingStatus } from '../../../../common/enums/training-status';
import * as queries from './queries';

const DATABASE_CONNEXION_ERROR = 'Database connection error';

type ParseRow<T> = (row: any) => T;

@Service()
export class DataBaseService {
    private pool: pg.Pool;

    constructor(
        private readonly logger: Logger,
        config = DB_CONFIG,
    ) {
        try {
            this.pool = new pg.Pool(config);
            this.logger.info('Connected to ' + config.database + ' on ' + config.host + ' as user ' + config.user + '.');
        } catch {
            this.logger.error(DATABASE_CONNEXION_ERROR);
            throw new Error(DATABASE_CONNEXION_ERROR);
        }
    }

    async getTraining(trainingId: string): Promise<Training | undefined> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(queries.GET_TRAINING_BY_ID, [trainingId]);

            if (result.rows.length === 0) {
                return undefined; // Return undefined if no training is found
            }

            let trainingDao = result.rows[0];

            trainingDao = this.parseTraining(trainingDao);
            const workersDao = await this.getWorkersFromTraining(trainingId);
            const epochsDao = await this.getEpochsFromTraining(trainingId);

            return this.createTrainingObject(trainingDao, workersDao, epochsDao);
        } catch (error: any) {
            this.logger.error(`Error caught in getTraining: ${error.message}. Stack: ${error.stack}`);
            return undefined;
        } finally {
            client.release();
        }
    }

    async getAllTrainings(): Promise<Training[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(queries.GET_ALL_TRAINING);
            const trainingDaos: TrainingDAO[] = this.parseRows(result, this.parseTraining);

            const trainings: Training[] = [];

            await Promise.all(
                trainingDaos.map(async (trainingDao: TrainingDAO) => {
                    const workersDao = await this.getWorkersFromTraining(trainingDao.id);
                    const epochsDao = await this.getEpochsFromTraining(trainingDao.id);

                    const training: Training = this.createTrainingObject(trainingDao, workersDao, epochsDao);
                    trainings.push(training);
                }),
            );

            return trainings;
        } catch (error: any) {
            this.logger.error(`Error caught in getAllTrainings: ${error.message}. Stack: ${error.stack}`);
            return [];
        } finally {
            client.release();
        }
    }

    async addTraining(req: Training): Promise<void> {
        const client = await this.pool.connect();
        try {
            // Pg needs the param to be any to accept it. If we do not put any, it does not compile. Same thing holds for below calls.
            const values: any[] = [
                req.id,
                req.status,
                req.co2Emission,
                req.energyConsumption.cpu,
                req.energyConsumption.gpu,
                req.energyConsumption.ram,
                req.accuracy,
                req.loss,
                req.cost,
            ];
            await client.query(queries.INSERT_TRAINING, values);
            this.logger.info(`Added training ${req.id} in DB.`);
        } catch (error: any) {
            this.logger.error(`Error caught in addTraining: ${error.message}. Stack: ${error.stack}`);
        } finally {
            client.release();
        }
    }

    async addWorker(worker: Worker, trainingId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            const values: any[] = [
                worker.id,
                trainingId,
                worker.location.country,
                worker.location.countryIso,
                worker.location.region,
                worker.location.latitude,
                worker.location.longitude,
                worker.cloud.provider,
                worker.cloud.region,
                worker.environment.os,
                worker.environment.pythonVersion,
                worker.environment.cpu.model,
                worker.environment.cpu.count,
                worker.environment.gpu.model,
                worker.environment.gpu.count,
                worker.environment.ram,
                worker.co2Emission,
                worker.energyConsumption.cpu,
                worker.energyConsumption.gpu,
                worker.energyConsumption.ram,
            ];
            await client.query(queries.INSERT_WORKER, values);
            this.logger.info(`Added worker ${worker.id} in DB.`);
        } catch (error: any) {
            this.logger.error(`Error caught in addWorker: ${error.message}. Stack: ${error.stack}`);
        } finally {
            client.release();
        }
    }

    async addEpoch(req: EpochWorker, trainingId: string, workerId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            const values: any[] = [
                req.id,
                trainingId,
                workerId,
                req.duration,
                req.co2Emission,
                req.energyConsumption.cpu,
                req.energyConsumption.gpu,
                req.energyConsumption.ram,
                req.accuracy,
                req.loss,
                req.cost,
            ];
            await client.query(queries.INSERT_EPOCH, values);
        } catch (error: any) {
            this.logger.error(`Error caught in addEpoch: ${error.message}. Stack: ${error.stack}`);
        } finally {
            client.release();
        }
    }

    async updateTraining(training: Training): Promise<void> {
        const client = await this.pool.connect();
        try {
            const values: any[] = [
                training.status,
                training.co2Emission,
                training.energyConsumption.cpu,
                training.energyConsumption.gpu,
                training.energyConsumption.ram,
                training.accuracy,
                training.loss,
                training.cost,
                training.id,
            ];
            await client.query(queries.UPDATE_TRAINING, values);
        } catch (error: any) {
            this.logger.error(`Error caught in updateTraining: ${error.message}. Stack: ${error.stack}`);
        } finally {
            client.release();
        }
    }

    async updateWorker(worker: Worker, trainingId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            const values: any[] = [
                worker.location.country,
                worker.location.countryIso,
                worker.location.region,
                worker.location.latitude,
                worker.location.longitude,
                worker.cloud.provider,
                worker.cloud.region,
                worker.environment.os,
                worker.environment.pythonVersion,
                worker.environment.cpu.model,
                worker.environment.cpu.count,
                worker.environment.gpu.model,
                worker.environment.gpu.count,
                worker.environment.ram,
                worker.co2Emission,
                worker.energyConsumption.cpu,
                worker.energyConsumption.gpu,
                worker.energyConsumption.ram,
                worker.id,
                trainingId,
            ];
            await client.query(queries.UPDATE_WORKER, values);
        } catch (error: any) {
            this.logger.error(`Error caught in updateWorker: ${error.message}. Stack: ${error.stack}`);
        } finally {
            client.release();
        }
    }

    private async getWorkersFromTraining(trainingId: string): Promise<WorkerDAO[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(queries.GET_WORKER_BY_TRAINING_ID, [trainingId]);
            return this.parseRows(result, this.parseWorker);
        } catch (error: any) {
            this.logger.error(`Error caught in getWorkersFromTraining: ${error.message}. Stack: ${error.stack}`);
            return [];
        } finally {
            client.release();
        }
    }

    private async getEpochsFromTraining(trainingId: string): Promise<EpochDAO[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(queries.GET_EPOCH_BY_TRAINING_ID, [trainingId]);
            return this.parseRows(result, this.parseEpoch);
        } catch (error: any) {
            this.logger.error(`Error caught in getEpochsFromTraining: ${error.message}. Stack: ${error.stack}`);
            return [];
        } finally {
            client.release();
        }
    }

    private parseRows<T>(result: pg.QueryResult<any>, parser: ParseRow<T>): T[] {
        return result.rows.map((row: any) => parser(row));
    }

    private parseTraining(row: any): TrainingDAO {
        return {
            id: row.id,
            status: row.status,
            co2emission: parseFloat(row.co2emission),
            energyconsumptioncpu: parseFloat(row.energyconsumptioncpu),
            energyconsumptiongpu: parseFloat(row.energyconsumptiongpu),
            energyconsumptionram: parseFloat(row.energyconsumptionram),
            accuracy: parseFloat(row.accuracy),
            loss: parseFloat(row.loss),
            cost: parseFloat(row.cost),
        };
    }

    private parseWorker(row: any): WorkerDAO {
        return {
            id: row.id,
            trainingid: row.trainingid,
            country: row.country,
            countryiso: row.countryiso,
            region: row.region,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            cloudprovider: row.cloud_provider,
            cloudregion: row.cloud_region,
            os: row.os,
            pythonversion: row.pythonversion,
            cpumodel: row.cpumodel,
            cpucount: parseInt(row.cpucount, 10),
            gpumodel: row.gpumodel,
            gpucount: parseInt(row.gpucount, 10),
            ram: parseFloat(row.ram),
            co2emission: parseFloat(row.co2emission),
            energyconsumptioncpu: parseFloat(row.energyconsumptioncpu),
            energyconsumptiongpu: parseFloat(row.energyconsumptiongpu),
            energyconsumptionram: parseFloat(row.energyconsumptionram),
        };
    }

    private parseEpoch(row: any): EpochDAO {
        return {
            id: row.id,
            trainingid: row.trainingid,
            workerid: row.workerid,
            duration: parseFloat(row.duration),
            co2emission: parseFloat(row.co2emission),
            energyconsumptioncpu: parseFloat(row.energyconsumptioncpu),
            energyconsumptiongpu: parseFloat(row.energyconsumptiongpu),
            energyconsumptionram: parseFloat(row.energyconsumptionram),
            accuracy: parseFloat(row.accuracy),
            loss: parseFloat(row.loss),
            cost: parseFloat(row.cost),
        };
    }

    /**
     * Creates a map with all the epochs of a certain Worker.
     * The key is the workerId and the values the Epochs sorted.
     * Also transforms EpochDAO into EpochWorker.
     *
     * @param epochsDao A list of all the epochs that we got in the DB for a certain training.
     * @returns A map of workerId : EpochWorker[]
     */
    private createEpochsMapForEachWorker(epochsDao: EpochDAO[]): Map<string, EpochWorker[]> {
        const epochsMap: Map<string, EpochWorker[]> = new Map();

        epochsDao.forEach((epochDao: EpochDAO) => {
            const workerId = epochDao.workerid;
            if (!epochsMap.has(workerId)) {
                epochsMap.set(workerId, []);
            }
            epochsMap.get(workerId)?.push({
                id: epochDao.id,
                duration: epochDao.duration,
                co2Emission: epochDao.co2emission,
                energyConsumption: {
                    cpu: epochDao.energyconsumptioncpu,
                    gpu: epochDao.energyconsumptiongpu,
                    ram: epochDao.energyconsumptionram,
                },
                accuracy: epochDao.accuracy,
                loss: epochDao.loss,
                cost: epochDao.cost,
            });
        });

        // Sort each array of epochs by id
        epochsMap.forEach((epochs, _) => {
            epochs.sort((a, b) => a.id - b.id);
        });

        return epochsMap;
    }

    /**
     * Creates a map with all the workers.
     * Also transforms WorkerDAO into Worker.
     *
     * @param workersDao A list of all the workers that we got in the DB for a certain training.
     * @param epochsMap A Map of workersId and their associated epochs sorted.
     * @returns A map of workerID : Worker
     */
    private createWorkers(workersDao: WorkerDAO[], epochsMap: Map<string, EpochWorker[]>): Map<string, Worker> {
        const workersMap: Map<string, Worker> = new Map();

        workersDao.forEach((workerDao: WorkerDAO) => {
            const workerEpochs = epochsMap.get(workerDao.id) as EpochWorker[];
            const worker: Worker = {
                id: workerDao.id,
                location: {
                    country: workerDao.country,
                    countryIso: workerDao.countryiso,
                    region: workerDao.region,
                    latitude: workerDao.latitude,
                    longitude: workerDao.longitude,
                },
                cloud: {
                    provider: workerDao.cloudprovider,
                    region: workerDao.cloudregion,
                },
                environment: {
                    os: workerDao.os,
                    pythonVersion: workerDao.pythonversion,
                    cpu: {
                        model: workerDao.cpumodel,
                        count: workerDao.cpucount,
                    },
                    gpu: {
                        model: workerDao.gpumodel,
                        count: workerDao.gpucount,
                    },
                    ram: workerDao.ram,
                },
                co2Emission: workerDao.co2emission,
                energyConsumption: {
                    cpu: workerDao.energyconsumptioncpu,
                    gpu: workerDao.energyconsumptiongpu,
                    ram: workerDao.energyconsumptionram,
                },
                epochs: workerEpochs ?? [],
            };
            workersMap.set(worker.id, worker);
        });

        return workersMap;
    }

    /**
     * Agglomerates the epochs of all Workers by id.
     *
     * @param epochsDao A list of all the epochs that we got in the DB for a certain training.
     * @param nbWorkers: The number of Workers.
     * @returns A List of all the EpochTraining
     */
    private createEpochsTraining(epochsDao: EpochDAO[], nbWorkers: number): EpochTraining[] {
        const epochTraining: EpochTraining[] = [];
        const epochsMapPerEpoch: Map<number, EpochWorker[]> = new Map();

        epochsDao.forEach((epochDao: EpochDAO) => {
            const id = epochDao.id;
            if (!epochsMapPerEpoch.has(id)) {
                epochsMapPerEpoch.set(id, []);
            }
            epochsMapPerEpoch.get(id)?.push({
                id: epochDao.id,
                duration: epochDao.duration,
                co2Emission: epochDao.co2emission,
                energyConsumption: {
                    cpu: epochDao.energyconsumptioncpu,
                    gpu: epochDao.energyconsumptiongpu,
                    ram: epochDao.energyconsumptionram,
                },
                accuracy: epochDao.accuracy,
                loss: epochDao.loss,
                cost: epochDao.cost,
            });
        });

        // Get mean Epochs
        epochsMapPerEpoch.forEach((epochs, id) => {
            const cpu = epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.energyConsumption.cpu : 0), 0);
            const gpu = epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.energyConsumption.gpu : 0), 0);
            const ram = epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.energyConsumption.ram : 0), 0);

            const mediumEpoch: EpochTraining = {
                id: id,
                duration: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.duration : 0), 0),
                co2Emission: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.co2Emission : 0), 0),
                energyConsumption: { cpu, gpu, ram },
                accuracy: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.accuracy : 0), 0) / nbWorkers,
                loss: epochs.reduce((acc: number, epoch: EpochWorker) => acc + (epoch ? epoch.loss : 0), 0) / nbWorkers,
                cost: epochs.reduce((cost: number, epoch: EpochWorker) => cost + (epoch ? epoch.cost : 0), 0),
            };
            epochTraining.push(mediumEpoch);
        });

        return epochTraining.sort((a, b) => a.id - b.id);
    }

    /**
     * Creates a training object from the DB DAOs.
     *
     * @param trainingDao The training DAO
     * @param workersDao A list of all the workers that we got in the DB for a certain training.
     * @param epochsDao A list of all the epochs that we got in the DB for a certain training.
     * @returns The correct training object.
     */
    private createTrainingObject(trainingDao: TrainingDAO, workersDao: WorkerDAO[], epochsDao: EpochDAO[]): Training {
        const epochsWorkerMap: Map<string, EpochWorker[]> = this.createEpochsMapForEachWorker(epochsDao);
        const workers: Map<string, Worker> = this.createWorkers(workersDao, epochsWorkerMap);
        const epochsTraining: EpochTraining[] = this.createEpochsTraining(epochsDao, workersDao.length);

        const training: Training = {
            id: trainingDao.id,
            status: this.parseTrainingStatus(trainingDao.status),
            co2Emission: trainingDao.co2emission,
            energyConsumption: {
                cpu: trainingDao.energyconsumptioncpu,
                gpu: trainingDao.energyconsumptiongpu,
                ram: trainingDao.energyconsumptionram,
            },
            accuracy: trainingDao.accuracy,
            loss: trainingDao.loss,
            cost: trainingDao.cost,
            epochs: epochsTraining ?? [],
            workers: workers,
        };
        return training;
    }

    private parseTrainingStatus(statusString: string): TrainingStatus {
        switch (statusString) {
            case 'Running':
                return TrainingStatus.RUNNING;
            case 'Finished':
                return TrainingStatus.FINISHED;
            case 'Pending':
                return TrainingStatus.PENDING;
            default:
                return TrainingStatus.UNKNOWN;
        }
    }
}
