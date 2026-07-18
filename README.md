# DevPulse

A GitHub analytics and career-insights platform.

## Project Structure

This repository contains both the frontend and backend of DevPulse:

- `/frontend` - React + TypeScript + Vite + Tailwind CSS frontend application
- `/backend` - Node.js + Express + TypeScript + MongoDB + BullMQ backend API

## Getting Started

### 1. Start the Backend
See the [Backend README](./backend/README.md) for detailed instructions on setting up environment variables, starting Docker (MongoDB + Redis), and running the server.

```bash
cd backend
npm install
docker-compose up -d
npm run seed
npm run dev
```

### 2. Start the Frontend
In a new terminal:

```bash
cd frontend
npm install
# Set VITE_API_URL in .env if your backend is running somewhere else (defaults to http://localhost:5000/api in frontend if not set)
npm run dev
```

The frontend will be available at http://localhost:5173.
