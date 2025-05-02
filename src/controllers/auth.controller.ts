import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthController {
    constructor(private userService: UserService) {}

    async register(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email and password are required'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await this.userService.createUser({
                email,
                password: hashedPassword
            });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'default-secret'
            );

            return res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(400).json({
                message: error instanceof Error ? error.message : 'Failed to create user'
            });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email and password are required'
                });
            }

            const user = await this.userService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({
                    message: 'Invalid credentials'
                });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid credentials'
                });
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'default-secret'
            );

            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(500).json({
                message: error instanceof Error ? error.message : 'An error occurred'
            });
        }
    }
} 