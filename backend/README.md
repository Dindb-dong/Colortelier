# Colortelier Backend

Backend API for the Colortelier application.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp env.example .env
```

3. Start development server:

```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information

## Deployment

This backend is configured to deploy on Render. Make sure to set the following environment variables in Render:

- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-url.netlify.app`
- `PORT=3001` (automatically set by Render)
