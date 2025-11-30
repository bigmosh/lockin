# Lockin Platform

A virtual coworking platform that enables users to create, discover, and join recurring Google Meet study/build/focus rooms.

## Contributors
Sanni Moshood - Team Lead/Cordinator Backend engineer
Ashaolu Oluwatobiloba - Frontend developer
Jo-ann Obewe - Ui design
Naimot Yekini - Ui design
Omofolarin Adebola - Frontend developer

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

