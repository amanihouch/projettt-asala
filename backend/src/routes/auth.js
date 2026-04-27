// backend/src/routes/auth.js - Version COMPLÈTE et CORRIGÉE avec Cloudinary
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyCode,
  resetPassword,
  sendVerificationCode,
  verifyPhoneCode
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const db = require('../models/db');
const Vendor = require('../models/Vendor');
const emailService = require('../services/emailService');
const { cloudinary } = require('../config/cloudinary');

console.log('✅ Routes auth chargées');

// ===== CONFIGURATION MULTER AVEC STOCKAGE EN MÉMOIRE =====
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp, gif)'));
  }
});

// ===== FONCTION D'UPLOAD VERS CLOUDINARY =====
const uploadToCloudinary = (buffer, folder, transformations) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: transformations,
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// ===== ROUTE D'INSCRIPTION VENDEUR AVEC CLOUDINARY =====
router.post('/register-vendor', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📝 Body reçu:', req.body);
      console.log('📸 Fichiers reçus:', req.files ? Object.keys(req.files) : 'aucun');
      
      const {
        fullName, email, phone, address, password,
        shopName, specialty, description, location, experience
      } = req.body;
      
      // Validation des champs obligatoires
      const requiredFields = ['fullName', 'email', 'password', 'shopName', 'specialty'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Champs manquants: ${missingFields.join(', ')}`
        });
      }
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide'
        });
      }
      
      // Validation téléphone
      const cleanPhone = phone?.replace(/\s/g, '') || '';
      if (cleanPhone && !/^\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Numéro de téléphone invalide (8 chiffres requis)'
        });
      }
      
      // Validation mot de passe
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }
      
      // Vérifier si l'email existe déjà
      const existingUser = await db.getOne('SELECT id, email FROM users WHERE email = ?', [email.toLowerCase()]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
      
      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // ===== UPLOAD VERS CLOUDINARY =====
      let avatarUrl = null;
      let coverUrl = null;
      
      // Upload de l'avatar
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        try {
          const result = await uploadToCloudinary(
            req.files.avatar[0].buffer,
            'turath/avatars',
            [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }, { quality: 'auto', fetch_format: 'auto' }]
          );
          avatarUrl = result.secure_url;
          console.log('📸 Avatar uploadé:', avatarUrl);
        } catch (err) {
          console.error('❌ Erreur upload avatar:', err);
        }
      }
      
      // Upload de la cover
      if (req.files && req.files.coverImage && req.files.coverImage[0]) {
        try {
          const result = await uploadToCloudinary(
            req.files.coverImage[0].buffer,
            'turath/covers',
            [{ width: 1600, height: 800, crop: 'fill' }, { quality: 'auto', fetch_format: 'auto' }]
          );
          coverUrl = result.secure_url;
          console.log('🖼️ Cover uploadée:', coverUrl);
        } catch (err) {
          console.error('❌ Erreur upload cover:', err);
        }
      }
      
      // Créer l'utilisateur
      const userResult = await db.query(`
        INSERT INTO users (name, email, phone, address, password, role, avatar, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, 1, NOW())
      `, [fullName, email.toLowerCase(), cleanPhone || null, address || null, hashedPassword, avatarUrl]);
      
      const userId = userResult.insertId;
      console.log(`✅ Utilisateur créé ID: ${userId} avec rôle 'pending'`);
      
      // Générer le slug
      const slug = generateSlug(shopName);
      const uniqueSlug = await createUniqueSlug(slug);
      
      // Créer le vendeur
      const vendorResult = await db.query(`
        INSERT INTO vendors 
        (userId, shopName, slug, specialty, description, location, coverImage, 
         experience, verified, approved, status, avatar, phone, email, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'pending', ?, ?, ?, NOW())
      `, [userId, shopName, uniqueSlug, specialty, description || null, location || 'تونس', 
          coverUrl, parseInt(experience) || 0, avatarUrl, cleanPhone || null, email.toLowerCase()]);
      
      const vendorId = vendorResult.insertId;
      console.log(`✅ Vendeur créé ID: ${vendorId}, Slug: ${uniqueSlug}`);
      
      // Envoyer email de bienvenue
      try {
        if (emailService && typeof emailService.sendWelcomeEmail === 'function') {
          await emailService.sendWelcomeEmail(email, fullName, shopName);
          console.log('📧 Email de bienvenue envoyé');
        }
      } catch (emailError) {
        console.warn('⚠️ Email non envoyé:', emailError.message);
      }
      
      // Générer token JWT
      const token = jwt.sign(
        { id: userId, email: email.toLowerCase(), role: 'pending', vendorId: vendorId },
        process.env.JWT_SECRET || 'asala-secret-key-2024',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: '✅ Votre demande d\'inscription a été envoyée avec succès',
        token: token,
        user: {
          id: userId,
          name: fullName,
          email: email,
          role: 'pending',
          avatar: avatarUrl
        },
        data: {
          vendorId: vendorId,
          shopName: shopName,
          slug: uniqueSlug,
          pending: true
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur inscription vendeur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ===== FONCTIONS UTILITAIRES POUR LES SLUGS =====
function generateSlug(shopName) {
  if (!shopName) return 'boutique';
  return shopName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function createUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await db.getOne('SELECT id FROM vendors WHERE slug = ?', [slug]);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ===== ROUTE POUR VÉRIFIER LE STATUT VENDEUR =====
/**
 * @route   GET /api/auth/check-vendor-status
 * @desc    Vérifier le statut de la demande vendeur
 * @access  Private
 */
router.get('/check-vendor-status', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const vendor = await db.getOne(`
      SELECT id, shopName, approved, status, rejectionReason, slug, createdAt
      FROM vendors 
      WHERE userId = ?
    `, [userId]);
    
    if (!vendor) {
      return res.json({ 
        success: true, 
        hasPendingRequest: false,
        message: 'Aucune demande de vendeur trouvée'
      });
    }
    
    res.json({
      success: true,
      hasPendingRequest: true,
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        slug: vendor.slug,
        approved: vendor.approved === 1,
        status: vendor.status,
        rejectionReason: vendor.rejectionReason,
        createdAt: vendor.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur check vendor status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut'
    });
  }
});

// ============================================
// ROUTES OAuth (Google & Facebook)
// ============================================

router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=user_not_found`);
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      };
      
      const encodedUser = encodeURIComponent(JSON.stringify(userData));
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${token}&user=${encodedUser}`);
      
    } catch (error) {
      console.error('❌ Erreur callback Google:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email', 'public_profile'],
    authType: 'rerequest'
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=facebook_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=user_not_found`);
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      };
      
      const encodedUser = encodeURIComponent(JSON.stringify(userData));
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${token}&user=${encodedUser}`);
      
    } catch (error) {
      console.error('❌ Erreur callback Facebook:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// ===== ROUTE POUR VÉRIFIER L'EMAIL =====
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('❌ Erreur check-email:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROUTES PROTÉGÉES
// ============================================
router.get('/me', protect, getMe);
router.post('/send-verification-code', protect, sendVerificationCode);
router.post('/verify-phone', protect, verifyPhoneCode);

module.exports = router;