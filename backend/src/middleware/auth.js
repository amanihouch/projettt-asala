// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Vérifier si le header Authorization existe
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token manquant'
        });
      }

      console.log('🔑 Token reçu:', token.substring(0, 20) + '...');

      // Vérifier le token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_2026'
      );

      console.log('✅ Token décodé:', decoded);

      // Récupérer l'utilisateur
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log('❌ Utilisateur non trouvé pour ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier si le compte est actif
      if (user.isActive === 0) {
        console.log('❌ Compte désactivé:', user.email);
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé. Veuillez contacter l\'administrateur.'
        });
      }

      // Attacher l'utilisateur à la requête
      req.user = user;
      console.log('✅ Authentification réussie pour:', user.email);
      
      next();
    } catch (error) {
      console.error('❌ Erreur auth:', error.message);
      
      // Gérer les différents types d'erreurs JWT
      let message = 'Non autorisé';
      if (error.name === 'JsonWebTokenError') {
        message = 'Token invalide';
      } else if (error.name === 'TokenExpiredError') {
        message = 'Token expiré';
      }
      
      return res.status(401).json({
        success: false,
        message,
        error: error.message
      });
    }
  }

  // Si pas de token
  if (!token) {
    console.log('❌ Token manquant dans la requête');
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, token manquant'
    });
  }
};

module.exports = { protect };