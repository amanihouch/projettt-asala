// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { uploadAvatar } = require('../config/cloudinary');

// ===== PROFIL =====
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.patch('/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.patch('/change-password', protect, userController.changePassword);

// ===== ROUTES ADDITIONNELLES POUR L'AVATAR (alias) =====
router.post('/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.patch('/users/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.post('/users/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.patch('/profile/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.post('/profile/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.patch('/upload/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);
router.post('/upload/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);

// ===== WISHLIST =====
router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist/:id', protect, userController.addToWishlist);
router.delete('/wishlist/:id', protect, userController.removeFromWishlist);

// ===== LIKES =====
router.get('/likes', protect, userController.getUserLikes);
router.get('/likes/products', protect, userController.getProductLikes);
router.post('/likes/products/:productId', protect, userController.toggleProductLike);
router.get('/likes/posts', protect, userController.getPostLikes);
router.post('/likes/posts/:postId', protect, userController.togglePostLike);

module.exports = router;