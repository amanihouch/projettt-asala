// backend/src/routes/admin/categories.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const categoryController = require('../../controllers/admin/CategoryController');

router.use(protect);
router.use(admin);

router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;