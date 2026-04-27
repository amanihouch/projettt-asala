require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');

const { testConnection } = require('./src/config/database');

// ============================================
// ===== IMPORT DES ROUTES =====
// ============================================

// Routes principales
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');

// Routes reels (UNE SEULE FOIS)
const reelRoutes = require('./src/routes/reels');

// Routes contact
const contactRoutes = require('./src/routes/contact');

// Routes admin
const adminRoutes = require('./src/routes/admin');
const adminUserRoutes = require('./src/routes/admin/users');
const adminVendorRoutes = require('./src/routes/admin/vendors');
const adminProductRoutes = require('./src/routes/admin/products');
const adminOrderRoutes = require('./src/routes/admin/orders');
const adminPostRoutes = require('./src/routes/admin/posts');
const adminCategoryRoutes = require('./src/routes/admin/categories');

// Routes client
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const categoryRoutes = require('./src/routes/categories');
const postRoutes = require('./src/routes/posts');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');
const testRoutes = require('./src/routes/testRoutes');
const cartRoutes = require('./src/routes/cart');

// ✅ Routes reviews
const reviewRoutes = require('./src/routes/reviews');

// ✅ Routes stock
const stockRoutes = require('./src/routes/stock');

// Routes messagerie
const messageRoutes = require('./src/routes/messages');

// Routes newsletter
const newsletterRoutes = require('./src/routes/newsletter');

// Routes IA
const aiRoutes = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== CRÉER LES DOSSIERS UPLOADS SI NÉCESSAIRE =====
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/covers'),
  path.join(__dirname, 'uploads/products'),
  path.join(__dirname, 'uploads/avatars'),
  path.join(__dirname, 'uploads/posts')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created upload directory: ${dir}`);
  }
});

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

// ===== SESSION MIDDLEWARE (pour Passport) =====
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ===== PASSPORT INITIALIZATION =====
app.use(passport.initialize());
app.use(passport.session());

// ===== CHARGER LA CONFIGURATION PASSPORT =====
require('./src/config/passport');

// ===== STATIC FILES - SERVIR LES FICHIERS UPLOADS =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== REQUEST LOGGING MIDDLEWARE =====
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// ============================================
// ===== ROUTES DE BASE =====
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ API ASALA Backend', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
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

// ============================================
// ===== ROUTES PUBLIQUES (SANS AUTH) =====
// ============================================
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/reels', reelRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/reviews', reviewRoutes);    // ✅ Route reviews
app.use('/api/v1/stock', stockRoutes);       // ✅ Route stock (DÉPLACÉE ICI)

// ============================================
// ===== ROUTES PROTÉGÉES (AVEC AUTH) =====
// ============================================
app.use('/api/v1/admin', adminRoutes);                    
app.use('/api/v1/admin/users', adminUserRoutes);          
app.use('/api/v1/admin/vendors', adminVendorRoutes);      
app.use('/api/v1/admin/products', adminProductRoutes);    
app.use('/api/v1/admin/orders', adminOrderRoutes);        
app.use('/api/v1/admin/posts', adminPostRoutes);          
app.use('/api/v1/admin/categories', adminCategoryRoutes); 
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/ai', aiRoutes);

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
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Le fichier est trop volumineux. Maximum 10MB'
    });
  }
  
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

    // Vérification du service email
    try {
      const { verifyConnection } = require('./src/services/email');
      await verifyConnection();
    } catch (emailError) {
      console.warn('⚠️ Service email non configuré:', emailError.message);
    }

    app.listen(PORT, () => {
      console.log('\n');
      console.log('🚀 ==========================================');
      console.log(`🚀 ✅ Serveur démarré sur http://localhost:${PORT}`);
      console.log('🚀 ==========================================\n');
      
      console.log('📚 Routes disponibles:');
      console.log(`   - GET  http://localhost:${PORT}/`);
      console.log(`   - GET  http://localhost:${PORT}/health`);
      console.log(`   - PUT  http://localhost:${PORT}/api/v1/stock/:id`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/reviews/products/:id`);
      console.log(`   - POST http://localhost:${PORT}/api/v1/reviews/products/:id`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/reels`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/categories`);
      console.log(`   - GET  http://localhost:${PORT}/api/v1/posts/feed`);
      console.log(`   - POST http://localhost:${PORT}/api/v1/auth/login`);
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

// Démarrer le serveur
startServer();

module.exports = app;