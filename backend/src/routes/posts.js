// backend/src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.get('/feed', postController.getFeed);
router.get('/vendor/:vendorId', postController.getPostsByVendor);
router.get('/:id', postController.getPostById);
router.get('/:id/comments', postController.getComments);

// Routes protégées (vendeur / admin)
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.patch('/:id/like', protect, postController.toggleLike);
router.post('/:id/comments', protect, postController.addComment);

// Routes admin uniquement
router.patch('/:id/approve', protect, postController.approvePost);
router.patch('/:id/reject', protect, postController.rejectPost);

module.exports = router;