// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Route de test
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Route auth fonctionne',
    timestamp: new Date().toISOString()
  });
});

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;