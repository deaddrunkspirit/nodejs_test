import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/database';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository(AppDataSource.getRepository(User));
    }

    async createUser(userData: Partial<User>): Promise<User> {
        try {
            if (!userData.email) {
                throw new Error('Email is required');
            }

            if (!userData.password) {
                throw new Error('Password is required');
            }

            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            return await this.userRepository.createUser(userData);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Email is required' || 
                    error.message === 'Password is required' ||
                    error.message === 'Email already exists') {
                    throw error;
                }
            }
            if (error instanceof QueryFailedError) {
                const message = error.message.toLowerCase();
                if (message.includes('unique constraint') || message.includes('duplicate key')) {
                    throw new Error('Email already exists');
                }
                if (message.includes('not null') || message.includes('violates not-null constraint')) {
                    throw new Error('Required fields are missing');
                }
            }
            throw error;
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await this.userRepository.findById(id);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new Error('Database error occurred');
            }
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new Error('Database error occurred');
            }
            throw error;
        }
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        try {
            if (userData.email) {
                const existingUser = await this.userRepository.findByEmail(userData.email);
                if (existingUser && existingUser.id !== id) {
                    throw new Error('Email already exists');
                }
            }

            return await this.userRepository.updateUser(id, userData);
        } catch (error) {
            if (error instanceof Error && error.message === 'Email already exists') {
                throw error;
            }
            if (error instanceof QueryFailedError) {
                const message = error.message.toLowerCase();
                if (message.includes('unique constraint') || message.includes('duplicate key')) {
                    throw new Error('Email already exists');
                }
                if (message.includes('not null') || message.includes('violates not-null constraint')) {
                    throw new Error('Required fields are missing');
                }
            }
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.userRepository.deleteUser(id);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                throw new Error('Database error occurred');
            }
            throw error;
        }
    }
} 