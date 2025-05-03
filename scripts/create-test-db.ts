import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createTestDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'postgres'
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
        
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'test'"
        );
        
        if (result.rows.length > 0) {
            await client.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = 'test'
                AND pid <> pg_backend_pid();
            `);
            
            await client.query('DROP DATABASE IF EXISTS test');
            console.log('Existing test database dropped');
        }
        
        await client.query('CREATE DATABASE test');
        console.log('Test database created successfully');
        
        const testClient = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: 'test'
        });
        
        await testClient.connect();
        console.log('Connected to test database');
        
        await testClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('UUID extension enabled');
        
        await testClient.end();
    } catch (error) {
        console.error('Error creating test database:', error);
        throw error;
    } finally {
        await client.end();
    }
}

createTestDatabase().catch((error) => {
    console.error('Failed to create test database:', error);
    process.exit(1);
}); 