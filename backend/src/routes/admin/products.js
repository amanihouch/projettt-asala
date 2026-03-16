// backend/src/routes/admin/products.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const productController = require('../../controllers/admin/ProductController');

// Vérifier que le contrôleur existe
if (!productController) {
  console.error('❌ productController non trouvé!');
}

router.use(protect);
router.use(admin);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;