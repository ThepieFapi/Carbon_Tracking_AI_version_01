-- Set environment variables from Dockerfile
\set dbname `echo -n "$POSTGRES_DB"`
\set username `echo -n "$POSTGRES_USER"`
\set password `echo -n "$POSTGRES_PASSWORD"`

CREATE TABLE  IF NOT EXISTS Trainings (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50),
    co2Emission DECIMAL,
    energyConsumptionCpu DECIMAL,
    energyConsumptionGpu DECIMAL,
    energyConsumptionRam DECIMAL,
    accuracy DECIMAL,
    loss DECIMAL,
    cost DECIMAL
);

CREATE TABLE  IF NOT EXISTS Workers (
    id VARCHAR(255),
    trainingId VARCHAR(255), 
    FOREIGN KEY (trainingId) REFERENCES Trainings(id),
    PRIMARY KEY (id, trainingId),
    country VARCHAR(255),
    countryIso VARCHAR(255),
    region VARCHAR(255),
    latitude DECIMAL(10, 8),  
    longitude DECIMAL(11, 8),
    cloudProvider VARCHAR(255),   
    cloudRegion VARCHAR(255),
    os VARCHAR(255), 
    pythonVersion VARCHAR(50),  
    cpuModel VARCHAR(255),  
    cpuCount INTEGER,  
    gpuModel VARCHAR(255),  
    gpuCount INTEGER,  
    ram DECIMAL(10, 2),  
    co2Emission DECIMAL,
    energyConsumptionCpu DECIMAL,
    energyConsumptionGpu DECIMAL,
    energyConsumptionRam DECIMAL
);


CREATE TABLE  IF NOT EXISTS Epochs (
    id INTEGER,
    trainingId VARCHAR(255),
    workerId VARCHAR(255),
    FOREIGN KEY (trainingId, workerId) REFERENCES Workers(trainingId, id), 
    PRIMARY KEY (id, trainingId, workerId),
    duration DECIMAL,
    co2Emission DECIMAL,
    energyConsumptionCpu DECIMAL,
    energyConsumptionGpu DECIMAL,
    energyConsumptionRam DECIMAL,
    accuracy DECIMAL,
    loss DECIMAL,
    cost DECIMAL
);