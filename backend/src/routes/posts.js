// backend/src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

console.log('📦 postController chargé:', Object.keys(postController));

// Routes publiques
router.get('/feed', postController.getFeed);
router.get('/vendor/:vendorId', postController.getVendorPosts);
router.get('/:id', postController.getPostById);

// Routes protégées
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments', protect, postController.addComment);
router.delete('/comments/:commentId', protect, postController.deleteComment);
router.post('/:id/like', protect, postController.toggleLike);

module.exports = router;