// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_2024');

      const [users] = await db.pool.execute(
        'SELECT id, name, email, role, avatar, isActive FROM users WHERE id = ?',
        [decoded.id]
      );

      const user = users[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Erreur d\'authentification:', error);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé',
        error: error.message
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token manquant'
    });
  }
};

module.exports = { protect };