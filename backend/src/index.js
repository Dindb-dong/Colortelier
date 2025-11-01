import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import colorRoutes from './routes/colors.js';
import themeRoutes from './routes/themes.js';
import filterRoutes from './routes/filters.js';
import likeRoutes from './routes/likes.js';
import cartRoutes from './routes/cart.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Enhanced logging middleware (skip detailed logs for health checks)
app.use((req, res, next) => {
  // Skip detailed logging for health check requests
  if (req.path === '/health') {
    // Simple log for health checks
    console.log('✅ Health check OK');
    return next();
  }
  
  console.log(`\n🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`📍 Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
  console.log(`🔗 Query:`, JSON.stringify(req.query, null, 2));
  next();
});

// Skip morgan logging for health checks
app.use(morgan('combined', {
  skip: (req, res) => req.path === '/health'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Colortelier API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      colors: '/api/colors',
      themes: '/api/themes',
      filters: '/api/filters',
      likes: '/api/likes',
      cart: '/api/cart'
    }
  });
});

// Route handlers with detailed logging
console.log('🚀 Setting up routes...');

app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth route: ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes);

app.use('/api/colors', (req, res, next) => {
  console.log(`🎨 Colors route: ${req.method} ${req.originalUrl}`);
  next();
}, colorRoutes);

app.use('/api/themes', (req, res, next) => {
  console.log(`🎭 Themes route: ${req.method} ${req.originalUrl}`);
  next();
}, themeRoutes);

app.use('/api/filters', (req, res, next) => {
  console.log(`🔍 Filters route: ${req.method} ${req.originalUrl}`);
  next();
}, filterRoutes);

app.use('/api/likes', (req, res, next) => {
  console.log(`❤️ Likes route: ${req.method} ${req.originalUrl}`);
  next();
}, likeRoutes);

app.use('/api/cart', (req, res, next) => {
  console.log(`🛒 Cart route: ${req.method} ${req.originalUrl}`);
  next();
}, cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler with detailed logging
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:');
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.originalUrl}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Base URL: ${req.baseUrl}`);
  console.log(`   Available routes:`);
  console.log(`   - GET /health`);
  console.log(`   - GET /api`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET /api/auth/profile`);
  console.log(`   - PUT /api/auth/profile`);
  console.log(`   - GET /api/colors`);
  console.log(`   - GET /api/themes`);
  console.log(`   - GET /api/filters`);
  console.log(`   - GET /api/likes`);
  console.log(`   - GET /api/cart`);
  
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'GET /api/colors',
      'GET /api/themes',
      'GET /api/filters',
      'GET /api/likes',
      'GET /api/cart'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});
