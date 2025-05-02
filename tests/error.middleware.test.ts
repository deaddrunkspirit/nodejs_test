import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { QueryFailedError } from 'typeorm';
import { errorHandler } from '../src/middleware/error.middleware';
import { createMockRequest, createMockResponse } from './helpers/test-utils';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = jest.fn();
  });

  it('should handle JsonWebTokenError', () => {
    const error = new JsonWebTokenError('Invalid token');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = new TokenExpiredError('Token expired', new Date());

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Token expired'
    });
  });

  it('should handle duplicate key error', () => {
    const error = new QueryFailedError('duplicate key value violates unique constraint', [], {
      code: '23505'
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Email already in use'
    });
  });

  it('should handle foreign key constraint error', () => {
    const error = new QueryFailedError('foreign key violation', [], {
      code: '23503'
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'foreign key violation'
    });
  });

  it('should handle not null constraint error', () => {
    const error = new QueryFailedError('not null constraint violation', [], {
      code: '23502'
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not null constraint violation'
    });
  });

  it('should handle validation error', () => {
    const error = new Error('Validation error');
    error.name = 'ValidationError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Validation error'
    });
  });

  it('should handle generic database error', () => {
    const error = new QueryFailedError('Database error', [], {});

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Database error'
    });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unknown error'
    });
  });
}); 