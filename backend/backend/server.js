// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { testConnection } = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');

// Import client routes
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const categoryRoutes = require('./src/routes/categories');
const postRoutes = require('./src/routes/posts');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== REQUEST LOGGING MIDDLEWARE =====
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// ===== ROUTES DE BASE =====
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ API Turath Backend', 
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v1/auth',
      api: '/api/v1',
      admin: '/api/v1/admin',
      products: '/api/v1/products',
      vendors: '/api/v1/vendors',
      categories: '/api/v1/categories',
      posts: '/api/v1/posts',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ===== API ROUTES =====
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/admin', adminRoutes);

// ===== CLIENT ROUTES =====
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);

// ===== 404 HANDLER =====
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route non trouvée: ${req.originalUrl}`,
    method: req.method,
    availableRoutes: [
      '/',
      '/health',
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/me',
      '/api/v1/products',
      '/api/v1/vendors',
      '/api/v1/categories',
      '/api/v1/posts',
      '/api/v1/orders',
      '/api/v1/users',
      '/api/v1/admin/dashboard'
    ]
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  
  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Cette entrée existe déjà'
    });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack,
      code: err.code
    } : {}
  });
});

// ===== DATABASE CONNECTION AND SERVER START =====
const startServer = async () => {
  try {
    console.log('📦 Tentative de connexion à la base de données...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données');
      console.error('📝 Vérifiez vos identifiants dans le fichier .env');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('\n');
      console.log('🚀 ==========================================');
      console.log(`🚀 ✅ Serveur démarré sur http://localhost:${PORT}`);
      console.log('🚀 ==========================================\n');
      
      console.log('📚 Routes disponibles:');
      console.log('   📌 Base:');
      console.log(`   - GET  http://localhost:${PORT}/`);
      console.log(`   - GET  http://localhost:${PORT}/health\n`);
      
      console.log('   📌 Authentification:');
      console.log(`   - POST http://localhost:${PORT}/api/v1/auth/login`);
      console.log(`   - POST http://localhost:${PORT}/api/v1/auth/register`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/auth/me\n`);
      
      console.log('   📌 Client:');
      console.log(`   - GET  http://localhost:${PORT}/api/v1/products`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/vendors`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/categories`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/posts/feed`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/orders/my-orders`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/users/profile\n`);
      
      console.log('   📌 Admin:');
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/dashboard`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/users`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/vendors`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/products`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/orders`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/posts/pending\n`);
      
      console.log('🔑 Comptes de test:');
      console.log('   - Admin  : admin@turath.tn / admin123');
      console.log('   - Vendeur: vendor1@test.tn / vendor123');
      console.log('   - Client : client@test.tn / client123\n');
    });
  } catch (error) {
    console.error('❌ Erreur démarrage:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal reçu');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal reçu');
  process.exit(0);
});

startServer();

module.exports = app;