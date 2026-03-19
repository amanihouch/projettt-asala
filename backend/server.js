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

// Import admin routes
const adminRoutes = require('./src/routes/admin');
const adminUserRoutes = require('./src/routes/admin/users');
const adminVendorRoutes = require('./src/routes/admin/vendors');
const adminProductRoutes = require('./src/routes/admin/products');
const adminOrderRoutes = require('./src/routes/admin/orders');
const adminPostRoutes = require('./src/routes/admin/posts');
const adminCategoryRoutes = require('./src/routes/admin/categories');

// Import client routes
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const categoryRoutes = require('./src/routes/categories');
const postRoutes = require('./src/routes/posts');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');

// ✅ IMPORT NEWSLETTER ROUTES
const newsletterRoutes = require('./src/routes/newsletter');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://votre-domaine.com'
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
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
      newsletter: '/api/v1/newsletter',
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

// ===== ADMIN ROUTES =====
app.use('/api/v1/admin', adminRoutes);                    // Dashboard
app.use('/api/v1/admin/users', adminUserRoutes);          // Gestion utilisateurs
app.use('/api/v1/admin/vendors', adminVendorRoutes);      // Gestion vendeurs
app.use('/api/v1/admin/products', adminProductRoutes);    // Gestion produits
app.use('/api/v1/admin/orders', adminOrderRoutes);        // Gestion commandes
app.use('/api/v1/admin/posts', adminPostRoutes);          // Gestion posts
app.use('/api/v1/admin/categories', adminCategoryRoutes); // Gestion catégories

// ===== CLIENT ROUTES =====
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);

// ✅ NEWSLETTER ROUTES
app.use('/api/v1/newsletter', newsletterRoutes);

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
      '/api/v1/newsletter',
      '/api/v1/newsletter/subscribe',
      '/api/v1/newsletter/unsubscribe/:email',
      '/api/v1/admin/dashboard',
      '/api/v1/admin/users',
      '/api/v1/admin/vendors',
      '/api/v1/admin/products',
      '/api/v1/admin/orders',
      '/api/v1/admin/posts',
      '/api/v1/admin/categories'
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
    message: err.message || 'Erreur interne du serveur'
  });
});

// ===== DATABASE CONNECTION AND SERVER START =====
const startServer = async () => {
  try {
    console.log('\n📦 Démarrage du serveur...');
    console.log('📦 Tentative de connexion à la base de données...');
    
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // ✅ Vérification du service email
    const { verifyConnection } = require('./src/services/email');
    await verifyConnection();

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
      console.log(`   - GET  http://localhost:${PORT}/api/v1/auth/me (token requis)\n`);
      
      console.log('   📌 Client:');
      console.log(`   - GET  http://localhost:${PORT}/api/v1/products`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/vendors`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/categories`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/posts/feed`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/orders/my-orders (token requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/users/profile (token requis)\n`);
      
      console.log('   📌 Newsletter:');
      console.log(`   - POST http://localhost:${PORT}/api/v1/newsletter/subscribe`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/newsletter/unsubscribe/:email`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/newsletter/subscribers (token admin requis)`);
      console.log(`   - POST http://localhost:${PORT}/api/v1/newsletter/send (token admin requis)\n`);
      
      console.log('   📌 Admin:');
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/dashboard (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/users (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/vendors (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/products (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/orders (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/posts (token admin requis)`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/admin/categories (token admin requis)\n`);
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

startServer();

module.exports = app;