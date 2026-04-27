// backend/src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, vendorOnly } = require('../middleware/auth');
const { uploadMultiple } = require('../config/cloudinary');

// Routes publiques
router.get('/feed', postController.getFeed);
router.get('/vendor/:vendorId', postController.getPostsByVendor);

// ✅ Routes avec sous-chemins DOIVENT être AVANT /:id
router.get('/:id/comments', postController.getComments);
router.put('/:id/pin', protect, vendorOnly, postController.togglePinPost);  // ✅ AVANT /:id
router.post('/:id/like', protect, postController.toggleLike);
router.post('/:id/comment', protect, postController.addComment);

// ✅ Route /:id APRÈS les sous-routes
router.get('/:id', postController.getPostById);
router.put('/:id', protect, vendorOnly, postController.updatePost);
router.delete('/:id', protect, vendorOnly, postController.deletePost);

// Création
router.post('/', protect, vendorOnly, uploadMultiple.array('images', 10), postController.createPost);

module.exports = router;