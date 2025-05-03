import { Repository } from 'typeorm';
import { User } from '../models/user.model';

export class UserRepository {
    constructor(private repository: Repository<User>) {}

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email }
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id }
        });
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
        await this.repository.update(id, updateData);
        return this.findById(id);
    }

    async deleteUser(id: string): Promise<void> {
        await this.repository.delete(id);
    }
} 