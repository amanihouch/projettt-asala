// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Toutes les routes utilisateur nécessitent une authentification
router.use(protect);

// Routes principales
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);

// Wishlist / Likes
router.get('/wishlist', userController.getWishlist);
router.get('/likes', userController.getUserLikes);
router.get('/post-likes', userController.getPostLikes);

// Avatar
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

module.exports = router;