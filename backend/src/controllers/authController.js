// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../services/email');
const db = require('../models/db');

// ===== IMPORTER LE SERVICE SMS =====
const { sendVerificationCode: sendSmsCode, formatPhoneNumber } = require('../services/sms');

// Supprimer la fonction formatPhoneNumber locale car elle est importée
// Supprimer la fonction sendSMS locale car elle est dans sms.js
// Supprimer l'initialisation Twilio locale car elle est dans sms.js

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

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    let formattedPhone = null;
    if (phone) {
      formattedPhone = formatPhoneNumber(phone);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: formattedPhone,
      role,
      address: address || '',
      avatar: avatar || null
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

    console.log('📝 Tentative de connexion:', { email, password: '***' });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const user = await User.findByEmailWithPassword(email);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Utilisateur trouvé, vérification du mot de passe...');

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe correct');

    const token = generateToken(user.id);
    delete user.password;

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
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

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

// ===== MOT DE PASSE OUBLIÉ =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📝 Demande de réinitialisation pour:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('ℹ️ Utilisateur non trouvé, mais on continue pour la sécurité');
      return res.status(200).json({
        success: true,
        message: 'Si cet email existe, un code vous a été envoyé.'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log(`🔐 Code généré pour ${email}: ${code}`);

    try {
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
      
      await db.query('DELETE FROM password_resets WHERE email = ?', [email]);
      
      await db.query(
        'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt]
      );

      console.log('✅ Code enregistré en base');
      
    } catch (dbError) {
      console.error('❌ Erreur DB:', dbError);
    }

    try {
      await sendResetPasswordEmail(email, code, user.name);
      console.log(`📧 Email envoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: 'Code envoyé à votre adresse email',
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
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

// ===== VÉRIFIER LE CODE EMAIL =====
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
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

// ===== ENVOYER CODE DE VÉRIFICATION SMS =====
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    console.log(`📱 Demande de code pour utilisateur ${userId}, téléphone: ${phone}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    
    if (!/^\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'صيغة رقم الهاتف غير صالحة (8 أرقام مطلوبة)'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`📱 Code généré: ${code}`);

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS phone_verifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at DATETIME NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          attempts INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user (user_id),
          INDEX idx_phone (phone)
        )
      `);
    } catch (err) {
      console.log('ℹ️ Table déjà existante');
    }

    await db.query('DELETE FROM phone_verifications WHERE user_id = ?', [userId]);

    await db.query(
      'INSERT INTO phone_verifications (user_id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, cleanPhone, code, expiresAt]
    );

    // === ENVOI SMS RÉEL ===
    try {
      await sendSmsCode(cleanPhone, code);
      console.log(`✅ SMS envoyé avec succès à +216${cleanPhone}`);
    } catch (smsError) {
      console.error('❌ Échec envoi SMS:', smsError.message);
      
      return res.status(500).json({
        success: false,
        message: smsError.message || 'فشل إرسال SMS. يرجى المحاولة لاحقاً.'
      });
    }

    res.json({
      success: true,
      message: 'تم إرسال رمز التحقق عبر SMS'
    });

  } catch (error) {
    console.error('❌ Erreur sendVerificationCode:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال الرمز'
    });
  }
};

// ===== VÉRIFIER LE CODE SMS =====
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const userId = req.user.id;

    console.log(`🔐 Vérification pour utilisateur ${userId}`);

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف والرمز مطلوبان'
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');

    const verification = await db.getOne(
      `SELECT * FROM phone_verifications 
       WHERE user_id = ? AND phone = ? 
       AND expires_at > NOW() AND verified = FALSE`,
      [userId, cleanPhone]
    );

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد محاولة تحقق نشطة. يرجى طلب رمز جديد.'
      });
    }

    if (verification.attempts >= 3) {
      await db.query('DELETE FROM phone_verifications WHERE id = ?', [verification.id]);
      return res.status(400).json({
        success: false,
        message: 'تجاوزت الحد الأقصى للمحاولات. يرجى طلب رمز جديد.'
      });
    }

    if (verification.code !== code) {
      await db.query(
        'UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = ?',
        [verification.id]
      );
      
      const remaining = 2 - verification.attempts;
      return res.status(400).json({
        success: false,
        message: `الرمز غير صحيح. متبقي ${remaining} محاولة`
      });
    }

    await db.query(
      'UPDATE phone_verifications SET verified = TRUE WHERE id = ?',
      [verification.id]
    );

    const formattedPhone = formatPhoneNumber(cleanPhone);
    await User.update(userId, { phone: formattedPhone });

    await db.query('DELETE FROM phone_verifications WHERE user_id = ? AND id != ?', [userId, verification.id]);

    const updatedUser = await User.findById(userId);
    delete updatedUser?.password;

    console.log('✅ Numéro vérifié pour utilisateur:', userId);

    res.json({
      success: true,
      message: 'تم التحقق من رقم الهاتف وتحديثه بنجاح',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur verifyPhoneCode:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق'
    });
  }
};

// ===== RENVOYER LE CODE SMS =====
exports.resendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    console.log(`📱 Renvoi de code pour utilisateur ${userId}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');

    await db.query('DELETE FROM phone_verifications WHERE user_id = ? AND phone = ?', [userId, cleanPhone]);

    return exports.sendVerificationCode(req, res);

  } catch (error) {
    console.error('❌ Erreur resendVerificationCode:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إعادة إرسال الرمز'
    });
  }
};