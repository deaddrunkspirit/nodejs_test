import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { QueryFailedError } from 'typeorm';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
    return res.status(401).json({
      message: error instanceof TokenExpiredError ? 'Token expired' : 'Invalid token'
    });
  }

  if (error instanceof QueryFailedError) {
    const { code } = error.driverError;
    
    switch (code) {
      case '23505':
        return res.status(409).json({
          message: 'Email already in use'
        });
      case '23502':
        return res.status(400).json({
          message: 'Not null constraint violation'
        });
      default:
        return res.status(500).json({
          message: error.message || 'Database error'
        });
    }
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: error.message,
      errors: error.errors
    });
  }

  return res.status(500).json({
    message: error.message || 'Unknown error'
  });
}; 