// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../services/email');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_2026',
    { expiresIn: '1d' }
  );
};

// ==================== FONCTIONS EXISTANTES ====================

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom, un email et un mot de passe'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const user = await User.create({ name, email, password, phone, role });
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
        phone: user.phone
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

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

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
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('❌ Erreur login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ==================== FONCTIONS DE RÉINITIALISATION ====================

// Générer un code aléatoire à 6 chiffres (toujours en string)
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Demander un code de réinitialisation (étape 1)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }
    email = email.trim().toLowerCase();

    const [users] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Ne pas révéler l'existence du compte
      return res.status(200).json({ success: true, message: 'Si cet email existe, un code vous a été envoyé.' });
    }

    const user = users[0];

    // Supprimer les anciens codes pour cet email
    await pool.execute('DELETE FROM password_resets WHERE email = ?', [email]);

    // Générer un code et définir une expiration (24h)
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Sauvegarder le code en base
    await pool.execute(
      'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );

    // Log pour débogage (à retirer en production)
    console.log(`🔐 Code généré pour ${email} : ${code}`);

    // Envoyer l'email
    try {
      await sendResetPasswordEmail(email, code, user.name);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // On ne bloque pas la réponse pour ne pas révéler l'échec
    }

    res.status(200).json({
      success: true,
      message: 'Code envoyé à votre adresse email'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Vérifier le code (étape 2)
// @route   POST /api/v1/auth/verify-code
// @access  Public
const verifyCode = async (req, res) => {
  try {
    let { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email et code requis' });
    }
    email = email.trim().toLowerCase();
    code = code.trim(); // Supprimer les espaces éventuels

    // Récupérer la demande la plus récente non utilisée et non expirée
    const [resets] = await pool.execute(
      'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (resets.length === 0) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    res.status(200).json({ success: true, message: 'Code vérifié' });
  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Réinitialiser le mot de passe (étape 3)
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    let { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }
    email = email.trim().toLowerCase();
    code = code.trim();

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le code une dernière fois
    const [resets] = await pool.execute(
      'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (resets.length === 0) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Marquer le code comme utilisé
    await pool.execute('UPDATE password_resets SET used = TRUE WHERE id = ?', [resets[0].id]);

    // Supprimer tous les anciens codes pour cet email (optionnel)
    await pool.execute('DELETE FROM password_resets WHERE email = ?', [email]);

    res.status(200).json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  verifyCode,
  resetPassword
};