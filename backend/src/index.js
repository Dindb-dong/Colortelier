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
app.use(morgan('combined'));
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

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/cart', cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});
