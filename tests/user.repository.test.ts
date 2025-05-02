import { Repository } from 'typeorm';
import { User } from '../src/models/user.model';
import { UserRepository } from '../src/repositories/user.repository';
import { createMockUser } from './helpers/test-utils';

// Mock TypeORM decorators
jest.mock('typeorm', () => ({
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
  Repository: jest.fn()
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockTypeOrmRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<Repository<User>>;

    userRepository = new UserRepository(mockTypeOrmRepository);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = createMockUser();
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockTypeOrmRepository.create.mockReturnValue(mockUser);
      mockTypeOrmRepository.save.mockResolvedValue(mockUser);

      const result = await userRepository.createUser(userData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(userData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should handle creation error', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockTypeOrmRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(userRepository.createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = createMockUser();
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = createMockUser();
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById('1');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById('999');

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' }
      });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const mockUser = createMockUser();
      const updateData = {
        email: 'updated@example.com'
      };

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue({
        ...mockUser,
        ...updateData
      });

      const result = await userRepository.updateUser('1', updateData);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(result).toEqual({
        ...mockUser,
        ...updateData
      });
    });

    it('should handle update error', async () => {
      const updateData = {
        email: 'updated@example.com'
      };

      mockTypeOrmRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(userRepository.updateUser('1', updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      await userRepository.deleteUser('1');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should handle delete error', async () => {
      mockTypeOrmRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(userRepository.deleteUser('1')).rejects.toThrow('Delete failed');
    });
  });
}); 