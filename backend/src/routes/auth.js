// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const dns = require('dns').promises;
const db = require('../models/db');
const pool = require('../config/database').pool; // ✅ AJOUT : connexion directe

// Importer les services
const emailService = require('../services/emailService');
const { cloudinary } = require('../config/cloudinary');

console.log('✅ Routes auth chargées');

// ===== FONCTIONS DNS/SMTP =====
async function checkDomainMX(domain) {
  try { 
    const mxRecords = await dns.resolveMx(domain); 
    return mxRecords && mxRecords.length > 0; 
  }
  catch (error) { 
    return false; 
  }
}

async function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Format email invalide' };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  
  const trustedDomains = [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.fr', 
    'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr',
    'live.com', 'live.fr', 'icloud.com', 'me.com', 'mac.com',
    'orange.fr', 'sfr.fr', 'free.fr', 'laposte.net',
    'topnet.tn', 'planet.tn', 'hexabyte.tn', 'gnet.tn', 'tunet.tn'
  ];
  
  if (trustedDomains.includes(domain)) {
    return { valid: true, reason: 'Domaine de confiance' };
  }
  
  const hasMX = await checkDomainMX(domain);
  if (!hasMX) {
    return { valid: false, reason: `Le domaine "${domain}" n'accepte pas les emails` };
  }
  
  return { valid: true, reason: 'Domaine avec MX valide' };
}

// ===== MULTER CONFIGURATION =====
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Seules les images sont autorisées (JPEG, PNG, WebP, GIF)'));
  }
});

// ===== CLOUDINARY UPLOAD =====
const uploadToCloudinary = (buffer, folder, transformations) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation: transformations, quality: 'auto', fetch_format: 'auto' },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    uploadStream.end(buffer);
  });
};

// ===== GÉNÉRER SLUG UNIQUE =====
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

// ============================================
// ===== ROUTE D'INSCRIPTION VENDEUR COMPLÈTE =====
// ============================================
router.post(
  '/register-vendor',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📝 Données reçues:', req.body);
      console.log('📁 Fichiers reçus:', req.files ? Object.keys(req.files) : 'aucun');

      const { 
        fullName, email, phone, address, password, 
        shopName, specialty, description, location, experience 
      } = req.body;

      // ===== VALIDATION =====
      const requiredFields = ['fullName', 'email', 'password', 'shopName', 'specialty'];
      const missingFields = requiredFields.filter(f => !req.body[f]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Champs manquants: ${missingFields.join(', ')}` 
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Format email invalide' });
      }

      const emailCheck = await isEmailValid(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ 
          success: false, 
          message: `البريد الإلكتروني غير صالح: ${emailCheck.reason}`,
          emailValid: false 
        });
      }

      const cleanPhone = phone?.replace(/\s/g, '') || '';
      if (cleanPhone && !/^\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Numéro de téléphone invalide (8 chiffres attendus)' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mot de passe trop court (6 caractères minimum)' 
        });
      }

      // ===== VÉRIFIER SI L'EMAIL EXISTE =====
      const existingUser = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
      }

      // ===== HASHER LE MOT DE PASSE =====
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ===== UPLOAD DES IMAGES =====
      let avatarUrl = null;
      let coverUrl = null;

      if (req.files?.avatar?.[0]) {
        try {
          const result = await uploadToCloudinary(
            req.files.avatar[0].buffer,
            'turath/avatars',
            [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
          );
          avatarUrl = result.secure_url;
        } catch (uploadError) {
          console.error('❌ Erreur upload avatar:', uploadError);
        }
      }

      if (req.files?.coverImage?.[0]) {
        try {
          const result = await uploadToCloudinary(
            req.files.coverImage[0].buffer,
            'turath/covers',
            [{ width: 1600, height: 800, crop: 'fill' }]
          );
          coverUrl = result.secure_url;
        } catch (uploadError) {
          console.error('❌ Erreur upload cover:', uploadError);
        }
      }

      // ===== CRÉER L'UTILISATEUR =====
      const userResult = await db.query(
        `INSERT INTO users (name, email, phone, address, password, role, avatar, isActive, createdAt) 
         VALUES (?, ?, ?, ?, ?, 'pending', ?, 1, NOW())`,
        [fullName, email.toLowerCase(), cleanPhone || null, address || null, hashedPassword, avatarUrl]
      );
      
      const userId = userResult.insertId;
      console.log(`✅ Utilisateur créé: ID=${userId}`);

      // ===== ENVOYER L'EMAIL DE VÉRIFICATION =====
      try {
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
          'UPDATE users SET verification_token = ?, verification_token_expires = ?, last_verification_sent = NOW(), verification_attempts = 1 WHERE id = ?',
          [hashedToken, expiresAt, userId]
        );

        if (emailService?.sendVerificationEmail) {
          await emailService.sendVerificationEmail(email, fullName, verifyToken);
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email vérification:', emailError);
      }

      // ===== CRÉER LE VENDEUR =====
      const slug = generateSlug(shopName);
      const uniqueSlug = await createUniqueSlug(slug);

      const vendorResult = await db.query(
        `INSERT INTO vendors (userId, shopName, slug, specialty, description, location, coverImage, experience, verified, approved, status, avatar, phone, email, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'pending', ?, ?, ?, NOW())`,
        [
          userId, shopName, uniqueSlug, specialty, 
          description || null, location || 'تونس', coverUrl, 
          parseInt(experience) || 0, avatarUrl, cleanPhone || null, 
          email.toLowerCase()
        ]
      );
      
      const vendorId = vendorResult.insertId;
      console.log(`✅ Vendeur créé: ID=${vendorId}`);

      // ============================================
      // ===== ✅ SAUVEGARDER LE MOT DE PASSE EN CLAIR =====
      // ============================================
      if (vendorId && password) {
        try {
          // Créer la table si elle n'existe pas
          await db.query(`
            CREATE TABLE IF NOT EXISTS vendor_passwords (
              id INT PRIMARY KEY AUTO_INCREMENT,
              vendor_id INT NOT NULL,
              user_id INT NOT NULL,
              plain_password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_vendor_id (vendor_id),
              INDEX idx_user_id (user_id)
            )
          `);
          
          // Insérer le mot de passe en clair
          await db.query(
            `INSERT INTO vendor_passwords (vendor_id, user_id, plain_password) 
             VALUES (?, ?, ?)`,
            [vendorId, userId, password]
          );
          console.log(`🔐 Mot de passe en clair sauvegardé pour ${shopName}: ${password}`);
        } catch (err) {
          console.error('❌ Erreur sauvegarde mot de passe en clair:', err.message);
        }
      }

      // ===== ENVOYER L'EMAIL DE BIENVENUE =====
      try {
        if (emailService?.sendWelcomeEmail) {
          await emailService.sendWelcomeEmail(email, fullName, shopName);
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email bienvenue:', emailError);
      }

      // ===== GÉNÉRER LE TOKEN JWT =====
      const token = jwt.sign(
        { id: userId, email: email.toLowerCase(), role: 'pending', vendorId },
        process.env.JWT_SECRET || 'asala-secret-key-2024',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: '✅ Votre demande a été envoyée. Vérifiez votre email pour activer votre compte.',
        token,
        user: {
          id: userId,
          name: fullName,
          email: email.toLowerCase(),
          role: 'pending',
          avatar: avatarUrl,
          emailVerified: false
        },
        data: {
          vendorId,
          shopName,
          slug: uniqueSlug,
          pending: true
        }
      });

    } catch (error) {
      console.error('❌ Erreur register-vendor:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'inscription: ' + error.message 
      });
    }
  }
);

// ============================================
// ===== ROUTE LOGIN CORRIGÉE =====
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    // Utilisation directe du pool pour éviter les problèmes avec db.getOne()
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, role, avatar, isActive FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (user.isActive === 0) {
      return res.status(401).json({ success: false, message: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'asala-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ===== ROUTE REGISTER CLASSIQUE =====
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nom, email et mot de passe requis' });
    }
    
    const existing = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (name, email, password, phone, address, role, createdAt) VALUES (?, ?, ?, ?, ?, "customer", NOW())',
      [name, email.toLowerCase(), hashedPassword, phone || null, address || null]
    );
    
    const token = jwt.sign(
      { id: result.insertId, email: email.toLowerCase(), role: 'customer' },
      process.env.JWT_SECRET || 'asala-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        name,
        email: email.toLowerCase(),
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTES POUR L'ENVOI ET LA VÉRIFICATION DU CODE EMAIL
// ============================================

/**
 * @route   POST /api/v1/auth/send-email-verification-code
 * @desc    Envoyer un code de vérification par email
 * @access  Public
 */
router.post('/send-email-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('📧 [send-email-verification-code] Appel reçu pour:', email);
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        
        // Vérifier si l'utilisateur existe
        const user = await db.getOne(
            'SELECT id, name, email, email_verified FROM users WHERE email = ?',
            [cleanEmail]
        );
        
        let userName = 'مستخدم';
        if (user) {
            userName = user.name || 'مستخدم';
            if (user.email_verified === 1) {
                return res.json({
                    success: true,
                    message: 'Email déjà vérifié',
                    alreadyVerified: true
                });
            }
        }

        // Générer un code à 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Créer la table si elle n'existe pas
        await db.query(`
            CREATE TABLE IF NOT EXISTS email_verification_codes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_email_code (email, code)
            )
        `);

        // Supprimer les anciens codes
        await db.query('DELETE FROM email_verification_codes WHERE email = ?', [cleanEmail]);
        
        // Insérer le nouveau code
        await db.query(
            'INSERT INTO email_verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [cleanEmail, code, expiresAt]
        );

        // Essayer d'envoyer l'email
        let emailSent = false;
        try {
            const emailService = require('../services/emailService');
            const result = await emailService.sendVerificationCode(cleanEmail, userName, code);
            emailSent = result.success;
            console.log(`📧 Email envoyé à ${cleanEmail}: ${emailSent ? 'SUCCÈS' : 'ÉCHEC'}`);
        } catch (emailError) {
            console.error('❌ Erreur envoi email:', emailError.message);
        }

        // Toujours retourner le code en développement
        res.json({
            success: true,
            message: emailSent ? 'Code envoyé par email' : 'Code généré (email non envoyé)',
            devCode: code, // ⚠️ UNIQUEMENT EN DÉVELOPPEMENT
            emailSent: emailSent
        });

    } catch (error) {
        console.error('❌ Erreur send-email-verification-code:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur: ' + error.message
        });
    }
});

/**
 * @route   POST /api/v1/auth/verify-email-code
 * @desc    Vérifier le code de validation email
 * @access  Public
 */
router.post('/verify-email-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        console.log('📧 [verify-email-code] Vérification pour:', email, 'Code:', code);
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email et code requis'
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        
        // Vérifier dans email_verification_codes
        const validCode = await db.getOne(
            `SELECT * FROM email_verification_codes 
             WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW()`,
            [cleanEmail, code]
        );
        
        if (validCode) {
            // Marquer le code comme utilisé
            await db.query('UPDATE email_verification_codes SET used = TRUE WHERE id = ?', [validCode.id]);
            
            // Mettre à jour l'utilisateur comme vérifié
            await db.query(
                'UPDATE users SET email_verified = 1, verified_at = NOW() WHERE email = ?',
                [cleanEmail]
            );
            
            // Récupérer l'utilisateur
            const user = await db.getOne(
                'SELECT id, name, email, role FROM users WHERE email = ?',
                [cleanEmail]
            );
            
            console.log('✅ Email vérifié avec succès:', cleanEmail);
            
            return res.json({
                success: true,
                message: 'Email vérifié avec succès',
                user: user
            });
        }
        
        // Vérifier si l'email est déjà vérifié
        const user = await db.getOne(
            'SELECT id, email_verified FROM users WHERE email = ?',
            [cleanEmail]
        );
        
        if (user && user.email_verified === 1) {
            return res.json({
                success: true,
                message: 'Email déjà vérifié',
                alreadyVerified: true
            });
        }
        
        return res.status(400).json({
            success: false,
            message: 'Code invalide ou expiré'
        });
        
    } catch (error) {
        console.error('❌ Erreur verify-email-code:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur: ' + error.message
        });
    }
});

// Route pour vérifier le statut du vendeur
router.get('/check-vendor-status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ success: true, hasPendingRequest: false });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'asala-secret-key-2024');
    
    const vendor = await db.getOne(
      'SELECT id, shopName, approved, status FROM vendors WHERE userId = ?',
      [decoded.id]
    );
    
    if (!vendor) {
      return res.json({ success: true, hasPendingRequest: false });
    }
    
    res.json({
      success: true,
      hasPendingRequest: true,
      vendor: {
        id: vendor.id,
        shopName: vendor.shopName,
        approved: vendor.approved === 1,
        status: vendor.status
      }
    });
  } catch (error) {
    res.json({ success: true, hasPendingRequest: false });
  }
});


// ============================================
// ===== ROUTES OAuth TOKEN (CLIENT-SIDE) =====
// ============================================

const axios = require('axios');

/**
 * @route   POST /api/v1/auth/google-token
 * @desc    Authentifier avec un token d'accès Google (flux client-side)
 * @access  Public
 */
router.post('/google-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token Google manquant' });
    }

    // Récupérer les infos utilisateur depuis Google
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { sub: googleId, email, name, picture } = googleRes.data;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email non fourni par Google' });
    }

    // Chercher ou créer l'utilisateur
    let user = await db.getOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      const bcrypt = require('bcryptjs');
      const randomPwd = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPwd = await bcrypt.hash(randomPwd, 10);

      const result = await db.query(
        `INSERT INTO users (name, email, avatar, role, password, googleId, isActive, createdAt)
         VALUES (?, ?, ?, 'customer', ?, ?, 1, NOW())`,
        [name, email.toLowerCase(), picture || null, hashedPwd, googleId]
      );
      user = await db.getOne('SELECT * FROM users WHERE id = ?', [result.insertId]);
      console.log('✅ Nouvel utilisateur Google créé:', email);
    } else {
      // Mettre à jour googleId si manquant
      if (!user.googleId) {
        await db.query('UPDATE users SET googleId = ? WHERE id = ?', [googleId, user.id]);
      }
      if (!user.avatar && picture) {
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
        user.avatar = picture;
      }
      console.log('✅ Utilisateur Google existant:', email);
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'asala-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    console.error('❌ Erreur google-token:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Erreur d\'authentification Google: ' + error.message });
  }
});

/**
 * @route   POST /api/v1/auth/facebook-token
 * @desc    Authentifier avec un token d'accès Facebook (flux client-side)
 * @access  Public
 */
router.post('/facebook-token', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ success: false, message: 'Token Facebook manquant' });
    }

    // Récupérer les infos utilisateur depuis Facebook
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture.width(300)&access_token=${access_token}`
    );

    const { id: facebookId, name, email: fbEmail, picture } = fbRes.data;

    // Facebook ne donne pas toujours l'email
    const email = fbEmail || `fb_${facebookId}@facebook.com`;
    const avatar = picture?.data?.url || null;

    let user = await db.getOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      const bcrypt = require('bcryptjs');
      const randomPwd = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPwd = await bcrypt.hash(randomPwd, 10);

      const result = await db.query(
        `INSERT INTO users (name, email, avatar, role, password, facebookId, isActive, createdAt)
         VALUES (?, ?, ?, 'customer', ?, ?, 1, NOW())`,
        [name, email.toLowerCase(), avatar, hashedPwd, facebookId]
      );
      user = await db.getOne('SELECT * FROM users WHERE id = ?', [result.insertId]);
      console.log('✅ Nouvel utilisateur Facebook créé:', email);
    } else {
      if (!user.facebookId) {
        await db.query('UPDATE users SET facebookId = ? WHERE id = ?', [facebookId, user.id]);
      }
      if (!user.avatar && avatar) {
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, user.id]);
        user.avatar = avatar;
      }
      console.log('✅ Utilisateur Facebook existant:', email);
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'asala-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    console.error('❌ Erreur facebook-token:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Erreur d\'authentification Facebook: ' + error.message });
  }
});


// ============================================
// ===== ROUTES OAUTH PASSPORT (REDIRECT) =====
// ============================================
// ✅ Ces routes font une REDIRECTION — elles n'ont pas besoin de token
// Le frontend appelle window.location.href = '/api/v1/auth/google' pour initier le flux

// ----- GOOGLE -----
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || 'asala-secret-key-2024',
        { expiresIn: '7d' }
      );
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      // Rediriger vers le frontend avec le token dans l'URL
      res.redirect(`${frontendURL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }))}`);
    } catch (error) {
      console.error('❌ Erreur callback Google:', error);
      res.redirect('/login?error=google_callback_failed');
    }
  }
);

// ----- FACEBOOK -----
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook_failed' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || 'asala-secret-key-2024',
        { expiresIn: '7d' }
      );
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }))}`);
    } catch (error) {
      console.error('❌ Erreur callback Facebook:', error);
      res.redirect('/login?error=facebook_callback_failed');
    }
  }
);

module.exports = router;
