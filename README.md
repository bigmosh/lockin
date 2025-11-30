# Lockin Platform

A virtual coworking platform that enables users to create, discover, and join recurring Google Meet study/build/focus rooms.

## Project Structure

```
lockin-platform/
├── backend/          # NestJS backend API
├── frontend/         # React frontend application
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Start the application:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MySQL: localhost:3306

## Services

- **backend**: NestJS API server (port 3000)
- **frontend**: React application with Vite (port 5173)
- **db**: MySQL 8.0 database (port 3306)

## Environment Variables

### Backend (.env)
- `DATABASE_HOST`: MySQL host (default: db)
- `DATABASE_PORT`: MySQL port (default: 3306)
- `DATABASE_USER`: Database user
- `DATABASE_PASSWORD`: Database password
- `DATABASE_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRATION`: Token expiration time (default: 24h)
- `PORT`: Backend server port (default: 3000)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)

## Development

The Docker setup includes volume mounts for hot-reloading during development:
- Backend changes will trigger automatic restart
- Frontend changes will trigger automatic rebuild

## Stopping the Application

```bash
docker-compose down
```

To remove volumes (including database data):
```bash
docker-compose down -v
```
