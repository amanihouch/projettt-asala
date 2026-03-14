const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyCode,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

console.log('✅ Routes auth chargées');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

module.exports = router;