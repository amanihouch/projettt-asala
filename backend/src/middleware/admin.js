// backend/src/middleware/admin.js
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé - Réservé aux administrateurs'
    });
  }
};

module.exports = { admin };