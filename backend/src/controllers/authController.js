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

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
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

    console.log('📝 Tentative de connexion:', email);

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

    console.log('✅ Utilisateur trouvé, vérification mot de passe...');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe correct');

    // ❌ SUPPRIMEZ CE BLOC - La colonne is_active n'existe pas
    // if (!user.is_active) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Compte désactivé'
    //   });
    // }

    // Mettre à jour last_login
    try {
      await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    } catch (updateError) {
      console.warn('⚠️ Erreur mise à jour last_login:', updateError);
      // Non bloquant, on continue
    }

    const token = generateToken(user.id);

    console.log('✅ Connexion réussie pour:', email);

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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    console.log(`🔐 Code généré pour ${email}: ${code}`);

    try {
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
      
      // Supprimer les anciens codes
      await db.query('DELETE FROM password_resets WHERE email = ?', [email]);
      
      // Insérer le nouveau code
      await db.query(
        'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt]
      );

      console.log('✅ Code enregistré en base');
      
    } catch (dbError) {
      console.error('❌ Erreur DB:', dbError);
      // En développement, on continue
    }

    // Envoyer l'email
    try {
      await sendResetPasswordEmail(email, code, user.name);
      console.log(`📧 Email envoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      message: 'Code envoyé à votre adresse email',
      // En développement, renvoyer le code pour faciliter les tests
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

// ===== SERVICE SMS AVEC TWILIO =====
const twilio = require('twilio');

// Initialisation de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Envoyer un SMS via Twilio
 */
const sendSMS = async (to, message) => {
  try {
    // Formater le numéro (ajouter +216 si nécessaire)
    const formattedNumber = to.startsWith('+') ? to : `+216${to}`;
    
    console.log(`📱 Envoi SMS à ${formattedNumber}: ${message}`);

    // Envoyer via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log(`✅ SMS envoyé! SID: ${result.sid}`);
    console.log(`📱 Statut: ${result.status}`);
    
    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };
    
  } catch (error) {
    console.error('❌ Erreur Twilio:', error);
    
    // Gestion des erreurs spécifiques
    if (error.code === 21211) {
      console.error('❌ Numéro de téléphone invalide');
    } else if (error.code === 21610) {
      console.error('❌ Ce numéro est sur liste noire');
    } else if (error.code === 30007) {
      console.error('❌ Message trop long');
    }
    
    throw error;
  }
};

// ===== ENVOYER CODE DE VÉRIFICATION SMS =====
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    console.log(`📱 Demande de code pour utilisateur ${userId}, téléphone: +216${phone}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    // Vérifier le format (8 chiffres)
    if (!/^\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Format de numéro invalide (8 chiffres requis)'
      });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`📱 Code généré: ${code}`);

    // Créer la table phone_verifications si elle n'existe pas
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
          INDEX idx_phone (phone),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } catch (err) {
      console.log('ℹ️ Table phone_verifications déjà existante');
    }

    // Supprimer les anciens codes pour cet utilisateur
    await db.query('DELETE FROM phone_verifications WHERE user_id = ?', [userId]);

    // Insérer le nouveau code
    await db.query(
      'INSERT INTO phone_verifications (user_id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, phone, code, expiresAt]
    );

    // ENVOI SMS AVEC TWILIO
    try {
      await sendSMS(phone, `🔐 Votre code de vérification TURATH est: ${code}`);
      console.log(`✅ SMS envoyé avec succès à +216${phone}`);
    } catch (smsError) {
      console.error('❌ Erreur envoi SMS:', smsError);
      
      // En développement, on continue même si le SMS échoue
      if (process.env.NODE_ENV !== 'development') {
        throw smsError;
      }
    }

    res.json({
      success: true,
      message: 'Code de vérification envoyé par SMS',
      devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });

  } catch (error) {
    console.error('❌ Erreur sendVerificationCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du code',
      error: error.message
    });
  }
};

// ===== VÉRIFIER LE CODE SMS =====
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const userId = req.user.id;

    console.log(`🔐 Vérification code pour utilisateur ${userId}, téléphone: +216${phone}`);

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Numéro et code requis'
      });
    }

    // Vérifier le format du code
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide (6 chiffres requis)'
      });
    }

    // Récupérer la vérification
    const verification = await db.getOne(
      `SELECT * FROM phone_verifications 
       WHERE user_id = ? AND phone = ? 
       AND expires_at > NOW() AND verified = FALSE`,
      [userId, phone]
    );

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Aucune demande de vérification active pour ce numéro'
      });
    }

    // Vérifier le nombre de tentatives
    if (verification.attempts >= 3) {
      await db.query('DELETE FROM phone_verifications WHERE id = ?', [verification.id]);
      return res.status(400).json({
        success: false,
        message: 'Trop de tentatives. Veuillez renvoyer un nouveau code.'
      });
    }

    // Vérifier le code
    if (verification.code !== code) {
      await db.query(
        'UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = ?',
        [verification.id]
      );
      
      const remainingAttempts = 2 - verification.attempts;
      return res.status(400).json({
        success: false,
        message: `Code incorrect. Il vous reste ${remainingAttempts} tentative(s)`
      });
    }

    // Vérifier si le numéro est déjà utilisé par un autre utilisateur
    const existingUser = await User.findByPhone(`+216${phone}`);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro est déjà utilisé par un autre compte'
      });
    }

    // Marquer comme vérifié
    await db.query(
      'UPDATE phone_verifications SET verified = TRUE WHERE id = ?',
      [verification.id]
    );

    // Mettre à jour le numéro de téléphone de l'utilisateur
    const formattedPhone = `+216${phone}`;
    await User.update(userId, { phone: formattedPhone });

    // Supprimer les anciens codes
    await db.query('DELETE FROM phone_verifications WHERE user_id = ? AND id != ?', [userId, verification.id]);

    // Générer un nouveau token avec les infos mises à jour
    const token = generateToken(userId);
    const updatedUser = await User.findById(userId);

    console.log('✅ Numéro vérifié et mis à jour pour utilisateur:', userId);

    res.json({
      success: true,
      message: 'Numéro de téléphone vérifié et mis à jour avec succès',
      token,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur verifyPhoneCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
};

// ===== RENVOYER LE CODE SMS =====
exports.resendVerificationCode = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    console.log(`📱 Renvoi de code pour utilisateur ${userId}, téléphone: +216${phone}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone requis'
      });
    }

    // Supprimer l'ancien code
    await db.query('DELETE FROM phone_verifications WHERE user_id = ? AND phone = ?', [userId, phone]);

    // Renvoyer un nouveau code
    return exports.sendVerificationCode(req, res);

  } catch (error) {
    console.error('❌ Erreur resendVerificationCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi du code',
      error: error.message
    });
  }
};