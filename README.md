# User Authentication API

A Node.js backend application that provides user authentication and management functionality.

## Features

- User registration and login
- JWT-based authentication
- Protected user listing endpoint
- Swagger API documentation
- PostgreSQL database integration
- TypeScript support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (local or remote)
- npm or yarn
- Docker and Docker Compose (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nodejs_test
JWT_SECRET=your-super-secret-key-change-in-production
```

## Running the Application

### Using Docker (Recommended)
```bash
docker-compose up --build
```

### Without Docker
Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users` - Get list of users (requires authentication)
- `GET /api/users/:id` - Get user by ID (requires authentication)
- `PUT /api/users/:id` - Update user (requires authentication)
- `DELETE /api/users/:id` - Delete user (requires authentication)

## Testing

To run tests:
```bash
npm test
```

This will:
1. Create a test database
2. Run all tests
3. Drop the test database

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Protected routes require valid JWT token
- Error handling middleware for consistent error responses
- PostgreSQL prepared statements for SQL injection prevention

## License

ISC 