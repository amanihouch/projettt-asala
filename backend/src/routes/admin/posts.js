// backend/src/routes/admin/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/PostController');
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Toutes les routes nécessitent authentification et rôle admin
router.use(protect);
router.use(admin);

// Routes pour les posts
// Dans votre fichier de routes admin
router.get('/posts', adminController.getAllPosts);
router.get('/posts/stats', adminController.getPostsStats);
router.get('/posts/pending', adminController.getPendingPosts);
router.get('/posts/:id', adminController.getPostById);
router.post('/posts', adminController.createPost);
router.put('/posts/:id', adminController.updatePost);
router.patch('/posts/:id/approve', adminController.approvePost);
router.patch('/posts/:id/reject', adminController.rejectPost);
router.delete('/posts/:id', adminController.deletePost);
router.get('/posts/:id/comments', adminController.getPostComments);
router.delete('/comments/:id', adminController.deleteComment);
router.post('/posts/bulk-status', adminController.bulkUpdateStatus);

module.exports = router;