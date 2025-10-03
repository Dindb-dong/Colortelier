# Colortelier

A color palette and filter management application with frontend and backend components.

## Project Structure

```
colortelier/
├── frontend/          # React frontend (deployed on Netlify)
├── backend/           # Node.js backend (deployed on Render)
├── shared/            # Shared types and utilities
└── README.md
```

## Quick Start

1. Install all dependencies:

```bash
npm run install:all
```

2. Start development servers:

```bash
npm run dev
```

This will start both frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

## Individual Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Backend Development

```bash
cd backend
npm run dev
```

## Deployment

### Frontend (Netlify)

- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/dist`
- Root directory: `frontend/`

### Backend (Render)

- Build command: `cd backend && npm run build`
- Start command: `cd backend && npm start`
- Root directory: `backend/`

## Environment Variables

### Frontend

- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

### Backend

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

## Shared Types

The `shared/` folder contains TypeScript types that are used by both frontend and backend to ensure type safety across the application.
