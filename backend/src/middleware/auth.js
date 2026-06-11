// backend/src/middleware/auth.js - Version CORRIGÉE
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Normalize result helper
const normalizeResult = (result) => {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  if (result?.data) return result.data;
  return [];
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token reçu');

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Token décodé:', { id: decoded.id });

      // Get user from database
      const users = await db.query(
        'SELECT id, name, email, role, isActive FROM users WHERE id = ?',
        [decoded.id]
      );

      const normalizedUsers = normalizeResult(users);
      
      if (!normalizedUsers || normalizedUsers.length === 0) {
        console.log('❌ Utilisateur non trouvé');
        return res.status(401).json({
          success: false,
          message: 'Non autorisé, utilisateur non trouvé'
        });
      }

      const user = normalizedUsers[0];

      // Check if user is active
      if (!user.isActive) {
        console.log('❌ Compte désactivé');
        return res.status(401).json({
          success: false,
          message: 'Compte désactivé, veuillez contacter l\'administrateur'
        });
      }

      // Get vendor ID and approval status
      let vendorId = null;
      let vendorApproved = false;
      
      try {
        const vendors = await db.query('SELECT id, approved FROM vendors WHERE userId = ?', [user.id]);
        const normalizedVendors = normalizeResult(vendors);
        if (normalizedVendors.length > 0) {
          vendorId = normalizedVendors[0].id;
          vendorApproved = normalizedVendors[0].approved === 1;
          console.log('🏪 Vendor ID trouvé:', vendorId, 'Approuvé:', vendorApproved);
        }
      } catch (err) {
        console.log('⚠️ Erreur récupération vendor:', err.message);
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorId: vendorId,
        vendorApproved: vendorApproved
      };

      console.log('✅ Utilisateur authentifié:', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        vendorId: req.user.vendorId,
        vendorApproved: req.user.vendorApproved
      });
      
      next();
    } catch (error) {
      console.error('❌ Erreur auth:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide'
      });
    }
  } else {
    console.log('❌ Pas de token dans le header');
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, pas de token'
    });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  if (req.user.role === 'admin') {
    next();
  } else {
    console.log('❌ Accès refusé - utilisateur non admin:', req.user?.role);
    res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs'
    });
  }
};

// Middleware to check if user is vendor (any vendor status: pending or approved)
const vendorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  if (req.user.role === 'vendor' || req.user.role === 'admin') {
    next();
  } else if (req.user.role === 'pending') {
    res.status(403).json({
      success: false,
      message: 'Votre compte vendeur est en attente de validation'
    });
  } else {
    console.log('❌ Accès refusé - utilisateur non vendor:', req.user?.role);
    res.status(403).json({
      success: false,
      message: 'Accès réservé aux vendeurs'
    });
  }
};

// Middleware to check if user is approved vendor
const approvedVendorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role === 'vendor' && req.user.vendorApproved === true) {
    return next();
  }
  
  if (req.user.role === 'pending' || (req.user.role === 'vendor' && req.user.vendorApproved === false)) {
    console.log('⏳ Compte en attente de validation');
    return res.status(403).json({
      success: false,
      message: 'Votre compte vendeur est en attente de validation. Veuillez patienter.'
    });
  }
  
  console.log('❌ Accès refusé - vendeur non approuvé:', req.user?.vendorApproved);
  res.status(403).json({
    success: false,
    message: 'Accès réservé aux vendeurs approuvés'
  });
};

// Generic authorize middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Accès refusé - rôle ${req.user.role} non autorisé. Requis: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis: ${roles.join(', ')}`
      });
    }
    
    console.log(`✅ Autorisation accordée pour le rôle: ${req.user.role}`);
    next();
  };
};

// Middleware to check if user is the owner of a resource
const isOwner = (getResourceUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    try {
      const resourceUserId = await getResourceUserId(req);
      if (req.user.id === resourceUserId) {
        next();
      } else {
        console.log('❌ Accès refusé - utilisateur non propriétaire');
        res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier cette ressource'
        });
      }
    } catch (error) {
      console.error('❌ Erreur isOwner:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des droits'
      });
    }
  };
};

// Alias for compatibility
const isAdmin = adminOnly;
const isVendor = vendorOnly;
const checkRole = authorize;

module.exports = {
  protect,
  authorize,
  adminOnly,
  vendorOnly,
  approvedVendorOnly,
  isOwner,
  isAdmin,
  isVendor,
  checkRole};