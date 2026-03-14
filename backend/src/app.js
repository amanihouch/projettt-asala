// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { testConnection } = require('./src/config/database');

// Import des routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const categoryRoutes = require('./src/routes/categories');
const postRoutes = require('./src/routes/posts');
const orderRoutes = require('./src/routes/orders');

// Import routes admin
const adminRoutes = require('./src/routes/admin/index');
const adminUserRoutes = require('./src/routes/admin/users');
const adminVendorRoutes = require('./src/routes/admin/vendors');
const adminProductRoutes = require('./src/routes/admin/products');
const adminOrderRoutes = require('./src/routes/admin/orders');
const adminPostRoutes = require('./src/routes/admin/posts');
const adminCategoryRoutes = require('./src/routes/admin/categories');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration CORS
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

// ===== REQUEST LOGGING =====
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
      users: '/api/v1/users',
      products: '/api/v1/products',
      vendors: '/api/v1/vendors',
      categories: '/api/v1/categories',
      posts: '/api/v1/posts',
      orders: '/api/v1/orders',
      admin: '/api/v1/admin',
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
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/orders', orderRoutes);

// ===== ADMIN ROUTES =====
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/vendors', adminVendorRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/admin/posts', adminPostRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);

// ===== 404 HANDLER =====
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route non trouvée: ${req.originalUrl}`,
    method: req.method
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  
  // Erreurs MySQL
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

  // Erreurs JWT
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

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

module.exports = app;