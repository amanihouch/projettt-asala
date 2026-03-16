// backend/src/routes/admin/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const userController = require('../../controllers/admin/UserController');

router.use(protect);
router.use(admin);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;