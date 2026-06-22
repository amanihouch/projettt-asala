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
// ===== GESTION GLOBALE DES ERREURS (AVANT TOUT) =====
// ============================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('   Stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
  // ✅ Ne pas crasher sauf pour les erreurs critiques
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Port déjà utilisé, arrêt du serveur');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason?.message || reason);
  if (reason?.stack) {
    console.error('   Stack:', reason.stack.split('\n').slice(0, 3).join('\n'));
  }
  // ✅ Ne pas crasher le serveur
});

// ===== IMPORT DES ROUTES =====
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');
const reelRoutes = require('./src/routes/reels');
const contactRoutes = require('./src/routes/contact');
const adminRoutes = require('./src/routes/admin');
const adminUserRoutes = require('./src/routes/admin/users');
const adminVendorRoutes = require('./src/routes/admin/vendors');
const adminProductRoutes = require('./src/routes/admin/products');
const adminOrderRoutes = require('./src/routes/admin/orders');
const adminPostRoutes = require('./src/routes/admin/posts');
const adminCategoryRoutes = require('./src/routes/admin/categories');
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const categoryRoutes = require('./src/routes/categories');
const postRoutes = require('./src/routes/posts');
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');
const testRoutes = require('./src/routes/testRoutes');
const cartRoutes = require('./src/routes/cart');
const reviewRoutes = require('./src/routes/reviews');
const stockRoutes = require('./src/routes/stock');
const messageRoutes = require('./src/routes/messages');
const newsletterRoutes = require('./src/routes/newsletter');
const aiRoutes = require('./src/routes/ai');

// ===== ROUTES SPONSORISÉES =====
const sponsoredProductsRoutes = require('./src/routes/sponsoredProducts');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== CRÉER LES DOSSIERS UPLOADS =====
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

// ============================================
// ===== CORS — CORRIGÉ =====
// ============================================
// ⚠️ AVANT : en production, "origin" ne pouvait valoir QU'UNE seule valeur
// (process.env.CLIENT_URL OU le placeholder 'https://votre-domaine.com').
// Si CLIENT_URL n'était pas défini exactement comme l'origine appelante,
// Express renvoyait une réponse SANS header Access-Control-Allow-Origin,
// et le navigateur bloquait toutes les requêtes venant de asala.tn.
//
// ✅ MAINTENANT : on utilise une liste blanche d'origines, vérifiée dans
// une fonction. Toute origine présente dans la liste reçoit le header
// CORS correct, qu'on soit en dev ou en prod.

const allowedOrigins = [
  // Domaine de production
  'http://asala.tn',
  'https://asala.tn',
  'http://www.asala.tn',
  'https://www.asala.tn',
  // Accès direct par IP (utile pour tes tests sur le VPS)
  'http://213.32.65.154',
  'http://213.32.65.154:5000',
  // Environnements de développement local
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

// Permet d'ajouter facilement d'autres origines via le .env, sans
// retoucher le code (ex: CLIENT_URL=https://staging.asala.tn)
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // "origin" est undefined pour les requêtes sans navigateur
    // (Postman, curl, requêtes serveur-à-serveur) → on les autorise
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqué pour l'origine: ${origin}`);
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ✅ Middleware pour les requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));

// ===== SESSION + PASSPORT =====
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

app.use(passport.initialize());
app.use(passport.session());

// ✅ Protéger le chargement de Passport
try {
  require('./src/config/passport');
  console.log('✅ Passport configuré');
} catch (error) {
  console.warn('⚠️ Erreur configuration Passport:', error.message);
}

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
// ===== ROUTES =====
// ============================================

// Routes publiques
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1/reels', reelRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/ai', aiRoutes);

// Routes admin
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/vendors', adminVendorRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/admin/posts', adminPostRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);

// ============================================
// ⭐ ROUTES SPONSORISÉES (AJOUTÉES)
// ============================================
app.use('/api/v1/sponsored-products', sponsoredProductsRoutes);
app.use('/api/v1/admin/sponsored-products', sponsoredProductsRoutes);


// Afficher les routes disponibles pour le debug
console.log('\n📋 Routes sponsorisées configurées:');
console.log('   ✅ GET    /api/v1/sponsored-products');
console.log('   ✅ GET    /api/v1/sponsored-products?active=true');
console.log('   ✅ GET    /api/v1/admin/sponsored-products');
console.log('   ✅ POST   /api/v1/admin/sponsored-products');
console.log('   ✅ PUT    /api/v1/admin/sponsored-products/:id');
console.log('   ✅ PATCH  /api/v1/admin/sponsored-products/:id/toggle');
console.log('   ✅ PATCH  /api/v1/admin/sponsored-products/:id/order');
console.log('   ✅ DELETE /api/v1/admin/sponsored-products/:id\n');

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
  console.error('❌ Erreur:', err.message);

  // ✅ Erreur CORS interceptée proprement au lieu de planter en 500
  if (err.message && err.message.startsWith('Origine non autorisée par CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Le fichier est trop volumineux. Maximum 10MB'
    });
  }
  
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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

// ===== DEMARRAGE =====
const startServer = async () => {
  try {
    console.log('\n📦 Démarrage du serveur...');
    
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // ✅ Vérification du service email (sans crasher)
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
      console.log(`🚀 ✅ Origines CORS autorisées: ${allowedOrigins.join(', ')}`);
      console.log('🚀 ==========================================\n');
    });
  } catch (error) {
    console.error('❌ Erreur démarrage:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
