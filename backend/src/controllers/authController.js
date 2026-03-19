// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../services/email');
const db = require('../models/db');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_2026',
    { expiresIn: '7d' }
  );
};

// ===== INSCRIPTION =====
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer', address, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom, un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      address,
      avatar
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// ===== CONNEXION =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Mettre à jour la date de dernière connexion
    await User.update(user.id, { lastLogin: new Date() });

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// ===== PROFIL CONNECTÉ =====
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Erreur getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du profil',
      error: error.message
    });
  }
};

// ===== MOT DE PASSE OUBLIÉ (VERSION CORRIGÉE) =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un code vous a été envoyé.'
      });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    console.log(`🔐 Code généré pour ${email}: ${code}`);
    console.log(`⏰ Expire le: ${expiresAt}`);

    // Vérifier si la table password_resets existe
    try {
      // Essayer d'insérer directement
      await db.query(
        'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?, used = FALSE',
        [email, code, expiresAt, code, expiresAt]
      );
    } catch (tableError) {
      console.log('⚠️ Table password_resets non trouvée, création...');
      
      // Créer la table si elle n'existe pas
      await db.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(100) NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (code)
        )
      `);
      
      // Réessayer l'insertion
      await db.query(
        'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt]
      );
    }

    console.log(`🔐 Code pour ${email}: ${code}`);

    // Envoyer l'email
    try {
      await sendResetPasswordEmail(email, code, user.name);
      console.log(`📧 Email envoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: 'Code envoyé à votre adresse email'
    });
  } catch (error) {
    console.error('❌ Erreur forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== VÉRIFIER LE CODE =====
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email et code requis'
      });
    }

    const reset = await db.getOne(
      'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    );

    if (!reset) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide ou expiré'
      });
    }

    res.json({
      success: true,
      message: 'Code vérifié'
    });
  } catch (error) {
    console.error('❌ Erreur verifyCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== RÉINITIALISER LE MOT DE PASSE =====
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const reset = await db.getOne(
      'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    );

    if (!reset) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide ou expiré'
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Marquer le code comme utilisé
    await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [reset.id]);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};