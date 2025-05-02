import { Request, Response } from 'express';
import { AuthController } from '../src/controllers/auth.controller';
import { UserService } from '../src/services/user.service';
import { User } from '../src/models/user.model';
import {
  createMockRequest,
  createMockResponse,
  createMockUser
} from './helpers/test-utils';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token')
}));

// Mock UserService
jest.mock('../src/services/user.service');

describe('AuthController', () => {
  let authController: AuthController;
  let userService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    userService = new UserService() as jest.Mocked<UserService>;
    authController = new AuthController(userService);
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = createMockUser();
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userService.createUser.mockResolvedValue(mockUser);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(userService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mock.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email
        }
      });
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {};

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email and password are required'
      });
    });

    it('should handle user creation error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userService.createUser.mockRejectedValue(new Error('Failed to create user'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to create user'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = createMockUser();
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      userService.getUserByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mock.jwt.token',
        user: {
          id: mockUser.id,
          email: mockUser.email
        }
      });
    });

    it('should handle invalid credentials', async () => {
      const mockUser = createMockUser();
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      userService.getUserByEmail.mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should handle non-existent user', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      userService.getUserByEmail.mockResolvedValue(null);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should handle missing credentials', async () => {
      mockRequest.body = {};

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email and password are required'
      });
    });
  });
}); 