// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyCode,
  resetPassword,
  sendVerificationCode,
  verifyPhoneCode
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

console.log('✅ Routes auth chargées');

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// Routes protégées
router.get('/me', protect, getMe);
router.post('/send-verification-code', protect, sendVerificationCode);
router.post('/verify-phone', protect, verifyPhoneCode);

module.exports = router;