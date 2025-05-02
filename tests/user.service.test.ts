import { UserService } from '../src/services/user.service';
import { UserRepository } from '../src/repositories/user.repository';
import { User } from '../src/models/user.model';
import { QueryFailedError } from 'typeorm';
import { createMockUser } from './helpers/test-utils';
import { AppDataSource } from '../src/config/database';

// Mock AppDataSource
jest.mock('../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn().mockReturnValue({})
    }
}));

// Mock UserRepository
jest.mock('../src/repositories/user.repository');

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        mockUserRepository = new UserRepository({} as any) as jest.Mocked<UserRepository>;
        (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockUser = createMockUser();
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(mockUser);

            const result = await userService.createUser(userData);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockUserRepository.createUser).toHaveBeenCalledWith(userData);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when email is missing', async () => {
            const userData = {
                password: 'password123'
            };

            await expect(userService.createUser(userData)).rejects.toThrow('Email is required');
        });

        it('should throw error when password is missing', async () => {
            const userData = {
                email: 'test@example.com'
            };

            await expect(userService.createUser(userData)).rejects.toThrow('Password is required');
        });

        it('should throw error when email already exists', async () => {
            const mockUser = createMockUser();
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
        });

        it('should handle database unique constraint error', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(
                new QueryFailedError('violates unique constraint', [], {})
            );

            await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
        });

        it('should handle database not-null constraint error', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(
                new QueryFailedError('violates not-null constraint', [], {})
            );

            await expect(userService.createUser(userData)).rejects.toThrow('Required fields are missing');
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser();
            mockUserRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById('1');

            expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            const result = await userService.getUserById('1');

            expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
            expect(result).toBeNull();
        });

        it('should handle database error', async () => {
            mockUserRepository.findById.mockRejectedValue(
                new QueryFailedError('Database error', [], {})
            );

            await expect(userService.getUserById('1')).rejects.toThrow('Database error occurred');
        });
    });

    describe('getUserByEmail', () => {
        it('should return user when found', async () => {
            const mockUser = createMockUser();
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            const result = await userService.getUserByEmail('test@example.com');

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            const result = await userService.getUserByEmail('test@example.com');

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(result).toBeNull();
        });

        it('should handle database error', async () => {
            mockUserRepository.findByEmail.mockRejectedValue(
                new QueryFailedError('Database error', [], {})
            );

            await expect(userService.getUserByEmail('test@example.com')).rejects.toThrow('Database error occurred');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const mockUser = createMockUser();
            const updateData = {
                email: 'new@example.com'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.updateUser.mockResolvedValue(mockUser);

            const result = await userService.updateUser('1', updateData);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(updateData.email);
            expect(mockUserRepository.updateUser).toHaveBeenCalledWith('1', updateData);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when email already exists', async () => {
            const existingUser = createMockUser();
            existingUser.id = '2';
            const updateData = {
                email: 'existing@example.com'
            };

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(userService.updateUser('1', updateData)).rejects.toThrow('Email already exists');
        });

        it('should handle database unique constraint error', async () => {
            const updateData = {
                email: 'test@example.com'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.updateUser.mockRejectedValue(
                new QueryFailedError('violates unique constraint', [], {})
            );

            await expect(userService.updateUser('1', updateData)).rejects.toThrow('Email already exists');
        });

        it('should handle database not-null constraint error', async () => {
            const updateData = {
                email: 'test@example.com'
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.updateUser.mockRejectedValue(
                new QueryFailedError('violates not-null constraint', [], {})
            );

            await expect(userService.updateUser('1', updateData)).rejects.toThrow('Required fields are missing');
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            mockUserRepository.deleteUser.mockResolvedValue(undefined);

            await userService.deleteUser('1');

            expect(mockUserRepository.deleteUser).toHaveBeenCalledWith('1');
        });

        it('should handle database error', async () => {
            mockUserRepository.deleteUser.mockRejectedValue(
                new QueryFailedError('Database error', [], {})
            );

            await expect(userService.deleteUser('1')).rejects.toThrow('Database error occurred');
        });
    });
}); 