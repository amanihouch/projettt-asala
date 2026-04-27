// backend/src/routes/admin/products.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/ProductController');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/approve', productController.approveProduct);
router.patch('/:id/reject', productController.rejectProduct);

module.exports = router;