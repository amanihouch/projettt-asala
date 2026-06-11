// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const db = require('../models/db');
const { sendResetPasswordEmail, sendVerificationCodeEmail, sendWelcomeEmail } = require('../services/email');
const { sendVerificationCode: sendSmsCode, formatPhoneNumber } = require('../services/sms');

// ===== GÉNÉRER TOKEN JWT =====
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_2026',
    { expiresIn: '7d' }
  );
};

// ===== FONCTION UTILITAIRE pour normaliser les résultats DB =====
const normalizeResult = (result) => {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  if (result?.data) return result.data;
  return [];
};

// =============================================
// VÉRIFIER EMAIL AVEC TOKEN (LIEN)
// =============================================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token manquant' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const result = await db.query('SELECT id, name, email, verification_token, verification_token_expires, email_verified FROM users WHERE verification_token = ?', [hashedToken]);
    const users = normalizeResult(result);
    
    const user = users[0];
    if (!user) return res.status(400).json({ success: false, message: 'Lien de vérification invalide' });
    if (user.email_verified === 1) {
      await db.query('UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
      return res.json({ success: true, message: 'Email déjà vérifié' });
    }
    if (new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Lien expiré, demandez un nouveau' });
    }

    await db.query('UPDATE users SET email_verified = 1, verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
    res.json({ success: true, message: 'Email vérifié avec succès !' });
  } catch (error) {
    console.error('❌ verifyEmail error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// =============================================
// RENVOYER EMAIL DE VÉRIFICATION (LIEN)
// =============================================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const result = await db.query('SELECT id, name, email, email_verified FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const users = normalizeResult(result);
    const user = users[0];
    if (!user) return res.status(404).json({ success: false, message: 'Email non trouvé' });
    if (user.email_verified === 1) return res.status(400).json({ success: false, message: 'Email déjà vérifié' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      'UPDATE users SET verification_token = ?, verification_token_expires = ?, last_verification_sent = NOW(), verification_attempts = verification_attempts + 1 WHERE id = ?',
      [hashedToken, expiresAt, user.id]
    );

    try {
      await sendVerificationCodeEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('❌ Erreur envoi email vérification:', emailError);
    }

    res.json({ success: true, message: 'Email de vérification renvoyé' });
  } catch (error) {
    console.error('❌ resendVerification error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// =============================================
// VÉRIFIER STATUT DE VÉRIFICATION
// =============================================
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const result = await db.query('SELECT email_verified, verified_at FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const users = normalizeResult(result);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.json({
      success: true,
      data: { email, isVerified: users[0].email_verified === 1, verifiedAt: users[0].verified_at }
    });
  } catch (error) {
    console.error('❌ checkVerificationStatus error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// =============================================
// ENVOYER CODE DE VÉRIFICATION EMAIL (6 chiffres)
// =============================================
exports.sendEmailVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📨 sendEmailVerificationCode appelé avec:', req.body);
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Vérifier si l'utilisateur existe
    const result = await db.query(
      'SELECT id, name, email, email_verified FROM users WHERE email = ?', 
      [cleanEmail]
    );
    const users = normalizeResult(result);
    
    let userName = 'مستخدم';
    let userId = null;
    
    if (users.length > 0) {
      userName = users[0].name || 'مستخدم';
      userId = users[0].id;
      if (users[0].email_verified === 1) {
        return res.json({ 
          success: true, 
          message: 'Email déjà vérifié', 
          alreadyVerified: true 
        });
      }
    } else {
      // Créer un utilisateur temporaire si non existant
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const insertResult = await db.query(
        'INSERT INTO users (name, email, password, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [userName, cleanEmail, hashedPassword, 'customer', 0]
      );
      userId = insertResult.insertId;
    }

    // Générer le code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Créer la table si elle n'existe pas
    await db.query(`CREATE TABLE IF NOT EXISTS email_verification_codes (
      id INT PRIMARY KEY AUTO_INCREMENT, 
      email VARCHAR(255) NOT NULL, 
      code VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL, 
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email), 
      INDEX idx_email_code (email, code)
    )`);

    // Supprimer les anciens codes
    await db.query('DELETE FROM email_verification_codes WHERE email = ?', [cleanEmail]);
    
    // Insérer le nouveau code
    await db.query(
      'INSERT INTO email_verification_codes (email, code, expires_at) VALUES (?, ?, ?)', 
      [cleanEmail, code, expiresAt]
    );

    console.log(`📧 Tentative d'envoi du code ${code} à ${cleanEmail}`);
    
    // Essayer d'envoyer l'email
    try {
      await sendVerificationCodeEmail(cleanEmail, userName, code);
      console.log(`✅ Code envoyé avec succès à ${cleanEmail}: ${code}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    // Retourner le code uniquement en développement
    const responseData = {
      success: true,
      message: 'Code envoyé par email'
    };
    
    if (process.env.NODE_ENV === 'development') {
      responseData.devCode = code;
    }
    
    console.log('📤 Réponse:', responseData);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ sendEmailVerificationCode error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message 
    });
  }
};

// =============================================
// VÉRIFIER CODE EMAIL (6 chiffres)
// =============================================
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('📧 verifyEmailCode:', { email, code });
    
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email et code requis' });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Vérifier dans email_verification_codes
    const codesResult = await db.query(
      'SELECT * FROM email_verification_codes WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW()',
      [cleanEmail, code]
    );
    const codes = normalizeResult(codesResult);
    console.log('📋 Codes trouvés:', codes.length);

    if (codes.length > 0) {
      await db.query('UPDATE email_verification_codes SET used = TRUE WHERE id = ?', [codes[0].id]);
      await db.query('UPDATE users SET email_verified = 1, verified_at = NOW() WHERE email = ?', [cleanEmail]);
      
      const usersResult = await db.query('SELECT id, name, email, role FROM users WHERE email = ?', [cleanEmail]);
      const users = normalizeResult(usersResult);
      
      // Générer un token pour l'utilisateur
      const token = generateToken(users[0].id);
      
      console.log('✅ Email vérifié:', cleanEmail);
      return res.json({ 
        success: true, 
        message: 'Email vérifié avec succès',
        token,
        user: users[0] || null 
      });
    }

    return res.status(400).json({ success: false, message: 'Code incorrect ou expiré' });

  } catch (error) {
    console.error('❌ verifyEmailCode error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
  }
};

// =============================================
// INSCRIPTION CLIENT
// =============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer', address, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'هذا البريد الإلكتروني مستخدم بالفعل' });
    }

    const user = await User.create({ name, email: cleanEmail, password, phone: phone ? formatPhoneNumber(phone) : null, role, address: address || '', avatar: avatar || null });
    const token = generateToken(user.id);

    try {
      await sendWelcomeEmail(cleanEmail, name);
    } catch (e) {
      console.log('⚠️ Erreur envoi email bienvenue:', e.message);
    }

    res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('duplicate')) {
      return res.status(400).json({ success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' });
    }
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء التسجيل' });
  }
};

// =============================================
// CONNEXION - VERSION CORRIGÉE
// =============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Tentative connexion:', { email, passwordProvided: !!password });
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Récupérer l'utilisateur avec son mot de passe
    const result = await db.query(
      'SELECT id, name, email, password, role, avatar, isActive FROM users WHERE email = ?',
      [cleanEmail]
    );
    
    const users = normalizeResult(result);
    
    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé:', cleanEmail);
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    const user = users[0];
    console.log('👤 Utilisateur trouvé:', { id: user.id, email: user.email, role: user.role });
    
    // Vérifier le mot de passe
    let isMatch = false;
    
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
        console.log('🔑 Comparaison bcrypt:', isMatch);
      } else {
        isMatch = password === user.password;
        console.log('🔑 Comparaison claire:', isMatch);
      }
    }
    
    if (!isMatch) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier si le compte est actif
    if (user.isActive !== 1) {
      console.log('❌ Compte désactivé');
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }
    
    // Générer le token
    const token = generateToken(user.id);
    
    console.log('✅ Connexion réussie pour:', user.email, 'Role:', user.role);
    
    // Mettre à jour lastLogin
    await db.query('UPDATE users SET lastLogin = NOW() WHERE id = ?', [user.id]);
    
    // Récupérer vendorId si nécessaire
    let vendorId = null;
    try {
      const vendors = await db.query('SELECT id FROM vendors WHERE userId = ?', [user.id]);
      if (vendors.length > 0) vendorId = vendors[0].id;
    } catch (err) {}
    
    // Préparer la réponse
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      vendorId: vendorId
    };
    
    res.json({
      success: true,
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur: ' + error.message });
  }
};

// =============================================
// PROFIL CONNECTÉ
// =============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    delete user.password;
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur getMe:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// MOT DE PASSE OUBLIÉ
// =============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(cleanEmail);
    if (!user) return res.json({ success: true, message: 'إذا كان هذا البريد مسجلاً، فسيتم إرسال رمز التحقق' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(`CREATE TABLE IF NOT EXISTS password_resets (
      id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(255), code VARCHAR(6),
      expires_at DATETIME, used BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query('DELETE FROM password_resets WHERE email = ?', [cleanEmail]);
    await db.query('INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)', [cleanEmail, code, expiresAt]);

    try {
      await sendResetPasswordEmail(cleanEmail, code, user.name);
    } catch (e) {
      console.log('⚠️ Erreur envoi email reset:', e.message);
    }

    const response = { success: true, message: 'تم إرسال رمز التحقق' };
    if (process.env.NODE_ENV === 'development') response.devCode = code;
    
    res.json(response);
  } catch (error) {
    console.error('❌ Erreur forgotPassword:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// VÉRIFIER CODE RÉINITIALISATION
// =============================================
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'البريد الإلكتروني والرمز مطلوبان' });

    const result = await db.query('SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()', [email.toLowerCase().trim(), code]);
    const resets = normalizeResult(result);
    if (resets.length === 0) return res.status(400).json({ success: false, message: 'الرمز غير صحيح' });

    res.json({ success: true, message: 'تم التحقق' });
  } catch (error) {
    console.error('❌ Erreur verifyCode:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// RÉINITIALISER MOT DE PASSE
// =============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: '6 أحرف minimum' });

    const cleanEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()', [cleanEmail, code]);
    const resets = normalizeResult(result);
    if (resets.length === 0) return res.status(400).json({ success: false, message: 'Code invalide' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, cleanEmail]);
    await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [resets[0].id]);

    res.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    console.error('❌ Erreur resetPassword:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// SMS - ENVOYER CODE VÉRIFICATION TÉLÉPHONE
// =============================================
exports.sendPhoneVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;
    if (!phone) return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

    const cleanPhone = String(phone).replace(/\D/g, '');
    if (!/^\d{8}$/.test(cleanPhone)) return res.status(400).json({ success: false, message: 'صيغة غير صالحة' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(`CREATE TABLE IF NOT EXISTS phone_verifications (
      id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, phone VARCHAR(20), code VARCHAR(6),
      expires_at DATETIME, verified BOOLEAN DEFAULT FALSE, attempts INT DEFAULT 0
    )`);
    await db.query('DELETE FROM phone_verifications WHERE user_id = ?', [userId]);
    await db.query('INSERT INTO phone_verifications (user_id, phone, code, expires_at) VALUES (?, ?, ?, ?)', [userId, cleanPhone, code, expiresAt]);

    try { await sendSmsCode(cleanPhone, code); } catch (e) {}

    const response = { success: true, message: 'SMS envoyé' };
    if (process.env.NODE_ENV === 'development') response.devCode = code;
    
    res.json(response);
  } catch (error) {
    console.error('❌ sendPhoneVerificationCode error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// SMS - VÉRIFIER CODE TÉLÉPHONE
// =============================================
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const userId = req.user.id;
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Tous les champs requis' });

    const cleanPhone = String(phone).replace(/\D/g, '');
    const result = await db.query('SELECT * FROM phone_verifications WHERE user_id = ? AND phone = ? AND expires_at > NOW() AND verified = FALSE', [userId, cleanPhone]);
    const verifications = normalizeResult(result);
    if (verifications.length === 0) return res.status(400).json({ success: false, message: 'Pas de vérification active' });

    const v = verifications[0];
    if (v.attempts >= 3) { await db.query('DELETE FROM phone_verifications WHERE id = ?', [v.id]); return res.status(400).json({ success: false, message: 'Max tentatives' }); }
    if (v.code !== code) { await db.query('UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = ?', [v.id]); return res.status(400).json({ success: false, message: 'Code incorrect' }); }

    await db.query('UPDATE phone_verifications SET verified = TRUE WHERE id = ?', [v.id]);
    await User.update(userId, { phone: formatPhoneNumber(cleanPhone) });
    await db.query('DELETE FROM phone_verifications WHERE user_id = ? AND id != ?', [userId, v.id]);

    const updatedUser = await User.findById(userId);
    delete updatedUser?.password;
    res.json({ success: true, message: 'Téléphone vérifié', user: updatedUser });
  } catch (error) {
    console.error('❌ verifyPhoneCode error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

// =============================================
// LOGOUT
// =============================================
exports.logout = async (req, res) => {
  try {
    // Le token est géré côté client, on peut juste renvoyer une réponse
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('❌ Erreur logout:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// =============================================
// CHANGER MOT DE PASSE
// =============================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = currentPassword === user.password;
    }
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};