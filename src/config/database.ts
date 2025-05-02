import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: isTest ? 'nodejs_test_test' : process.env.DB_NAME || 'nodejs_test',
    synchronize: isTest,
    dropSchema: isTest,
    logging: isTest ? false : ['error', 'warn'],
    entities: [User],
    migrations: [],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    extra: {
        max: process.env.NODE_ENV === 'production' ? 20 : 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    }
}); 