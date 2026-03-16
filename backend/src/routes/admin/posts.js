const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/PostController');
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

router.use(protect, admin);

router.get('/', postController.getAllPosts);
router.get('/pending', postController.getPendingPosts);
router.patch('/:id/approve', postController.approvePost);
router.patch('/:id/reject', postController.rejectPost);

module.exports = router;