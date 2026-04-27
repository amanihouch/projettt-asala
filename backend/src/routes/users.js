// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Middleware de debug
router.use((req, res, next) => {
  console.log(`📨 ${req.method} /api/v1/users${req.url}`);
  next();
});

// Toutes les routes nécessitent une authentification
router.use(protect);

// ===== PROFIL =====
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.put('/profile', userController.updateProfile);

// ===== AVATAR =====
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

// ===== MOT DE PASSE =====
router.post('/change-password', userController.changePassword);

// ===== WISHLIST / LIKES =====
router.get('/wishlist', userController.getWishlist);
router.get('/likes', userController.getProductLikes);
router.post('/likes/:productId', userController.toggleProductLike);
router.delete('/likes/:productId', userController.toggleProductLike);

router.get('/post-likes', userController.getPostLikes);
router.post('/post-likes/:postId', userController.togglePostLike);
router.delete('/post-likes/:postId', userController.togglePostLike);

module.exports = router;