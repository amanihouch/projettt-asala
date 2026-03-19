const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Middleware d'authentification pour toutes les routes
router.use(protect);

// ===== PROFIL =====
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);

// ===== AVATAR =====
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

// ===== WISHLIST / LIKES =====
router.get('/wishlist', userController.getWishlist);
router.get('/likes', userController.getUserLikes);
router.get('/post-likes', userController.getPostLikes);

module.exports = router;