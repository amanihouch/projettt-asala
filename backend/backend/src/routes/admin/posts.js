// backend/src/routes/admin/posts.js
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/PostController');

router.get('/', postController.getAllPosts);
router.get('/pending', postController.getPendingPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.patch('/:id/approve', postController.approvePost);
router.patch('/:id/reject', postController.rejectPost);

module.exports = router;