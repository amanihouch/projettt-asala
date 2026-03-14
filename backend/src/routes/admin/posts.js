const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/PostController');
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

router.use(protect, admin);

router.get('/pending', postController.getPendingPosts);
router.patch('/:id/approve', postController.approvePost);
router.patch('/:id/reject', postController.rejectPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;