import { Request, Response } from 'express';
import { User } from '../../src/models/user.model';
import { QueryFailedError } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createMockRequest = (data: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...data
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockUser = (data: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  password: 'hashedPassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn().mockResolvedValue(undefined),
  ...data
} as unknown as User);

export const mockJwtToken = 'mock.jwt.token';

export const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
};

export const mockJwt = {
  sign: jest.fn().mockReturnValue(mockJwtToken),
  verify: jest.fn().mockReturnValue({ userId: '1' })
};

export const mockTypeOrm = {
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    getRepository: jest.fn(),
    entityMetadatas: [{
      name: 'User',
      tableName: 'users'
    }],
    manager: {
      getRepository: jest.fn()
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

export const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  count: jest.fn()
});

export const setupTestDatabase = () => {
  return {
    clearDatabase: async () => {
      // Add database cleanup logic here if needed
    },
    mockRepository: createMockRepository()
  };
};

export const mockError = {
  validation: (message: string, errors: any[] = []) => ({
    name: 'ValidationError',
    message,
    errors
  }),
  database: (message: string, code: string = '23505') => new QueryFailedError(message, [], { code }),
  authentication: (message: string = 'Invalid credentials') => new Error(message)
}; 