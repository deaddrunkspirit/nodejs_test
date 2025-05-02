import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../src/middleware/auth.middleware';
import { UserService } from '../src/services/user.service';
import { User } from '../src/models/user.model';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  JsonWebTokenError: jest.fn().mockImplementation(function(message: string) {
    this.message = message;
    this.name = 'JsonWebTokenError';
  }),
  TokenExpiredError: jest.fn().mockImplementation(function(message: string) {
    this.message = message;
    this.name = 'TokenExpiredError';
  })
}));

// Mock UserService
jest.mock('../src/services/user.service');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    userService = new UserService() as jest.Mocked<UserService>;

    jest.clearAllMocks();
  });

  it('should authenticate valid token', async () => {
    const mockUser = new User();
    mockUser.id = '1';
    mockUser.email = 'test@example.com';
    mockUser.password = 'hashedPassword';
    mockUser.createdAt = new Date();
    mockUser.updatedAt = new Date();
    mockUser.comparePassword = jest.fn();
    mockUser.hashPassword = jest.fn();

    mockRequest.headers = {
      authorization: 'Bearer valid.jwt.token'
    };

    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    userService.getUserById.mockResolvedValue(mockUser);

    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', expect.any(String));
    expect(userService.getUserById).toHaveBeenCalledWith('1');
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject request without token', async () => {
    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'No token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject invalid token format', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token'
    };

    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token format'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle invalid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid.token'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new (jwt.JsonWebTokenError as any)('Invalid token');
    });

    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle user not found', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid.jwt.token'
    };

    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    userService.getUserById.mockResolvedValue(null);

    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'User not found'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle database error', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid.jwt.token'
    };

    (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
    userService.getUserById.mockRejectedValue(new Error('Database error'));

    await authMiddleware(userService)(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication failed'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 