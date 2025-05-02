import * as pg from 'pg';

// Get environment variables or use default values
const { POSTGRES_USER = 'postgres', POSTGRES_DB = 'traice_db', POSTGRES_PASSWORD = 'traice', POSTGRES_HOST = '0.0.0.0' } = process.env;

export const DB_CONFIG: pg.ConnectionConfig = {
    user: POSTGRES_USER,
    database: POSTGRES_DB,
    password: POSTGRES_PASSWORD,
    port: 8001,
    host: POSTGRES_HOST,
    keepAlive: true,
};

export const DB_TEST_CONFIG: pg.ConnectionConfig = {
    user: 'postgres',
    database: 'test_db',
    password: 'test',
    port: 8002,
    host: '0.0.0.0',
    keepAlive: true,
};
