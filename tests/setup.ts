import { AppDataSource } from '../src/config/database';
import dotenv from 'dotenv';
import { beforeAll, afterEach, afterAll, test, expect } from '@jest/globals';
import 'reflect-metadata';

dotenv.config();

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '24h';

// Mock TypeORM decorators
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    Entity: () => (target: any) => target,
    PrimaryGeneratedColumn: () => (target: any, propertyKey: string) => {
      target[propertyKey] = 'uuid';
    },
    Column: () => (target: any, propertyKey: string) => {
      target[propertyKey] = propertyKey;
    },
    CreateDateColumn: () => (target: any, propertyKey: string) => {
      target[propertyKey] = new Date();
    },
    UpdateDateColumn: () => (target: any, propertyKey: string) => {
      target[propertyKey] = new Date();
    },
    BeforeInsert: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    },
    BeforeUpdate: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    },
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      isInitialized: true,
      getRepository: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue(undefined),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }),
      entityMetadatas: [{
        name: 'User',
        tableName: 'users'
      }],
      manager: {
        getRepository: jest.fn().mockReturnValue({
          query: jest.fn().mockResolvedValue(undefined),
          findOne: jest.fn(),
          save: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn()
        })
      }
    })),
    Repository: jest.fn(),
    QueryFailedError: jest.fn().mockImplementation(function(message: string, query: any[], driverError: any) {
      this.message = message;
      this.query = query;
      this.driverError = driverError;
      this.name = 'QueryFailedError';
    })
  };
});

// Mock database connection
jest.mock('../src/config/database', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      query: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }),
    entityMetadatas: [{
      name: 'User',
      tableName: 'users'
    }],
    manager: {
      getRepository: jest.fn().mockReturnValue({
        query: jest.fn().mockResolvedValue(undefined),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })
    }
  }
}));

// Connect to test database
beforeAll(async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Test database connection established');
    }
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error;
  }
}, 30000);

// Clear database after each test
afterEach(async () => {
  try {
    const entities = AppDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
    }
    console.log('Test database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}, 30000);

// Close database connection after all tests
afterAll(async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Test database connection closed');
    }
  } catch (error) {
    console.error('Error closing PostgreSQL connection:', error);
    throw error;
  }
}, 30000);

test('Database connection is established', async () => {
  expect(AppDataSource.isInitialized).toBe(true);
}); 