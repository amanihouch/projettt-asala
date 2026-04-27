// backend/src/routes/products.js - AVEC ROUTES COMMENTAIRES
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, vendorOnly, adminOnly } = require('../middleware/auth');
const { uploadProductImages } = require('../config/cloudinary');

// ==================== ROUTES PUBLIQUES ====================
router.get('/', productController.getAllProducts);
router.get('/sponsored', productController.getSponsoredProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/vendor/:vendorId', productController.getProductsByVendor);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/similar', productController.getSimilarProducts);

// ==================== COMMENTAIRES (LECTURE PUBLIQUE) ====================
router.get('/:id/comments', productController.getProductComments);

// ==================== ROUTES PROTÉGÉES ====================
router.use(protect);

// Likes
router.post('/:id/like', productController.toggleLike);
router.get('/:id/like/status', productController.checkLikeStatus);
router.get('/user/likes', productController.getUserLikedProducts);

// Commentaires (écriture)
router.post('/:id/comments', productController.addProductComment);
router.delete('/comments/:commentId', productController.deleteProductComment);

// Partages
router.post('/:id/share', productController.incrementShares);

// Vendeur
router.post('/', vendorOnly, uploadProductImages.array('images', 10), productController.createProduct);
router.put('/:id', vendorOnly, productController.updateProduct);
router.delete('/:id', vendorOnly, productController.deleteProduct);
router.get('/vendor/my-products', vendorOnly, productController.getMyProducts);
router.get('/vendor/stats', vendorOnly, productController.getVendorProductStats);

// ==================== ROUTES ADMIN ====================
router.get('/admin/all', adminOnly, productController.getAllProductsAdmin);
router.patch('/admin/:id/approve', adminOnly, productController.approveProduct);
router.patch('/admin/:id/reject', adminOnly, productController.rejectProduct);
router.patch('/admin/:id/sponsor', adminOnly, productController.toggleSponsored);
router.patch('/admin/:id/featured', adminOnly, productController.toggleFeatured);
router.get('/admin/stats', adminOnly, productController.getAdminProductStats);
router.get('/admin/distribution', adminOnly, productController.getCategoryDistribution);
router.get('/admin/pending', adminOnly, productController.getPendingProducts);
router.get('/admin/popular', adminOnly, productController.getMostLikedProducts);

module.exports = router;