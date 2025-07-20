# Interactive Branching Stories - Backend

This is the backend API for the Interactive Branching Stories platform, built with Node.js, Express, and TypeScript.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.ts       # Main application file
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Copy `.env.example` to `.env` and update the values
5. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## API Documentation

API documentation will be available at `/api/docs` once the server is running.

## Security Features

- HTTPS enforcement in production
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Error handling

## Database

The application uses PostgreSQL with Prisma ORM (to be implemented).

## Authentication

JWT-based authentication with refresh tokens (to be implemented).