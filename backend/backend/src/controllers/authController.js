const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Helper pour générer token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    let { name, email, password, phone, role = 'customer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    email = email.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    const [existing] = await db.pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Formater le téléphone
    if (phone && !phone.startsWith('+')) {
      phone = '+216' + phone.replace(/\D/g, '');
    }

    // Avatar par défaut
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=08717f&color=fff&size=200`;

    // Insérer l'utilisateur
    const [result] = await db.pool.execute(
      `INSERT INTO users (name, email, password, phone, role, avatar, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [name, email, hashedPassword, phone || null, role, avatar]
    );

    const userId = result.insertId;

    // Récupérer l'utilisateur créé
    const [newUser] = await db.pool.execute(
      `SELECT id, name, email, phone, role, avatar, isActive, createdAt 
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = newUser[0];

    res.status(201).json({
      success: true,
      token: generateToken(user),
      data: { user }
    });

  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    // Admin hardcodé pour test
    if (email === 'admin@turath.tn' && password === 'admin123') {
      return res.json({
        success: true,
        token: generateToken({ id: 1, email, role: 'admin' }),
        data: {
          user: {
            id: 1,
            name: 'مدير النظام',
            email,
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin+Turath&background=7c3aed&color=fff'
          }
        }
      });
    }

    // Chercher l'utilisateur dans la base
    const [users] = await db.pool.execute(
      `SELECT id, name, email, password, phone, role, avatar, isActive 
       FROM users WHERE email = ?`,
      [email]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    // Mettre à jour lastLogin
    await db.pool.execute('UPDATE users SET lastLogin = NOW() WHERE id = ?', [user.id]);

    res.json({
      success: true,
      token: generateToken(user),
      data: { user }
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.pool.execute(
      `SELECT id, name, email, phone, role, avatar, isActive, createdAt 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, data: { user } });

  } catch (error) {
    console.error('❌ Erreur getMe:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du profil' });
  }
};
