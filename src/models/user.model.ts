import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    private _isPasswordHashed: boolean = false;

    isPasswordHashed(): boolean {
        return this._isPasswordHashed;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password !== undefined && !this._isPasswordHashed) {
            this.password = await bcrypt.hash(this.password, 10);
            this._isPasswordHashed = true;
        }
    }

    setPassword(password: string) {
        this.password = password;
        this._isPasswordHashed = false;
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
} 