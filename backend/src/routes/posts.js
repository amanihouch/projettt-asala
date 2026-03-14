// backend/src/routes/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.get('/feed', postController.getFeed);
router.get('/vendor/:vendorId', postController.getVendorPosts);
router.get('/:id', postController.getPostById);

// Route protégée (création de post)
router.post('/', protect, postController.createPost);

module.exports = router;