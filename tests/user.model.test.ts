import bcrypt from 'bcrypt';
import { User } from '../src/models/user.model';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password123'),
  compare: jest.fn().mockResolvedValue(true)
}));

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
  }
}));

describe('User Model', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = '1';
    user.email = 'test@example.com';
    user.password = 'password123';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password before save', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password123');

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(user.password).toBe('hashed_password123');
    });

    it('should not hash if password is already hashed', async () => {
      await user.hashPassword();
      jest.clearAllMocks();

      await user.hashPassword();

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(user.password).toBe('hashed_password123');
    });

    it('should handle empty password', async () => {
      user.setPassword('');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_empty');

      await user.hashPassword();

      expect(bcrypt.hash).toHaveBeenCalledWith('', 10);
      expect(user.password).toBe('hashed_empty');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await user.comparePassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await user.comparePassword('wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', user.password);
      expect(result).toBe(false);
    });
  });

  describe('data validation', () => {
    it('should have all required properties', () => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should have correct property types', () => {
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.password).toBe('string');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
}); 