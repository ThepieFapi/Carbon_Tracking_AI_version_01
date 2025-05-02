// GET
export const GET_TRAINING_BY_ID = 'SELECT * FROM Trainings WHERE id = $1';
export const GET_ALL_TRAINING = 'SELECT * FROM Trainings;';
export const GET_WORKER_BY_TRAINING_ID = 'SELECT * FROM Workers WHERE trainingId = $1';
export const GET_EPOCH_BY_TRAINING_ID = 'SELECT * FROM Epochs WHERE trainingId = $1';

// INSERT
export const INSERT_TRAINING = `INSERT INTO Trainings VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
export const INSERT_WORKER =
    'INSERT INTO Workers VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20);';
export const INSERT_EPOCH = 'INSERT INTO Epochs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);';

// UPDATE
export const UPDATE_TRAINING = `
                                UPDATE Trainings
                                SET
                                    status = $1,
                                    co2Emission = $2,
                                    energyConsumptionCpu = $3,
                                    energyConsumptionGpu = $4,
                                    energyConsumptionRam = $5,
                                    accuracy = $6,
                                    loss = $7,
                                    cost = $8
                                WHERE
                                    id = $9
                                `;
export const UPDATE_WORKER = `
                                UPDATE Workers
                                SET
                                    country = $1,
                                    countryIso = $2,
                                    region = $3,
                                    latitude = $4,
                                    longitude = $5,
                                    cloudProvider = $6,
                                    cloudRegion = $7,
                                    os = $8,
                                    pythonVersion = $9,
                                    cpuModel = $10,
                                    cpuCount = $11,
                                    gpuModel = $12,
                                    gpuCount = $13,
                                    ram = $14,
                                    co2Emission = $15,
                                    energyConsumptionCpu = $16,
                                    energyConsumptionGpu = $17,
                                    energyConsumptionRam = $18
                                WHERE
                                    id = $19 AND
                                    trainingId = $20
                                `;
