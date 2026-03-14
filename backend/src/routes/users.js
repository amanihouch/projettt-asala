// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload'); // une seule fois

// Toutes les routes utilisateur nécessitent une authentification
router.use(protect);

// Routes existantes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/wishlist', userController.getWishlist);

// Nouvelle route pour l'avatar
router.post('/avatar', upload.single('avatar'), userController.updateAvatar);

module.exports = router;