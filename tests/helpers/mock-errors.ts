import { QueryFailedError } from 'typeorm';

export class MockQueryFailedError extends Error {
    name = 'QueryFailedError';
    query: string;
    parameters: any[];
    driverError: any;

    constructor(message: string, query: string = '', parameters: any[] = [], driverError: any = {}) {
        super(message);
        this.query = query;
        this.parameters = parameters;
        this.driverError = driverError;
        Object.setPrototypeOf(this, QueryFailedError.prototype);
    }
} 