// backend/src/routes/api.js  ✅ CORRIGÉ
const express = require('express');
const router = express.Router();

// Import des contrôleurs
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const vendorController = require('../controllers/vendorController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');
const cartController = require('../controllers/cartController');
const messageController = require('../controllers/messageController');
const newsletterController = require('../controllers/newsletterController');



// Import des routes séparées
const visitsRouter = require('./visits');
const adminRouter = require('./admin');
const authRouter = require('./auth');
const contactRouter = require('./contact');

// Import Cloudinary uploaders
const { uploadAvatar, uploadCover, uploadMultiple } = require('../config/cloudinary');

// Middleware d'authentification
const { protect, adminOnly, vendorOnly } = require('../middleware/auth');

// ===================================================
// ===== ROUTES PUBLIQUES (AVANT router.use(protect)) =====
// ===================================================

// Auth (délégué au router auth.js qui contient google-token, facebook-token, login, register…)
router.use('/auth', authRouter);

// Auth shortcuts (optionnel — déjà dans authRouter mais conservés pour compatibilité)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-code', authController.verifyCode);
router.post('/auth/reset-password', authController.resetPassword);

// Contact
router.use('/contact', contactRouter);

// Catégories
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/hierarchy', categoryController.getCategoriesHierarchy);
router.get('/categories/:slug', categoryController.getCategoryBySlug);

// Produits publics
router.get('/products', productController.getAllProducts);
router.get('/products/sponsored', productController.getSponsoredProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/vendor/:vendorId', productController.getProductsByVendor);
router.get('/products/category/:category', productController.getProductsByCategory);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProductById);

// ✅ SPONSORED PRODUCTS — public, AVANT protect
router.get('/sponsored-products', productController.getSponsoredProducts);

// ✅ REELS — public, AVANT protect
// ✅ REELS — public, AVANT protect
router.get('/reels', async (req, res) => {
  try {
    const db = require('../models/db');
    const limit = parseInt(req.query.limit) || 12;
    const reels = await db.query('SELECT * FROM reels ORDER BY createdAt DESC LIMIT ?', [limit]);
    res.json({ success: true, data: reels });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Vendeurs publics
router.get('/vendors', vendorController.getAllVendors);
router.get('/vendors/top', vendorController.getTopVendors);
router.get('/vendors/:id', vendorController.getVendorById);

// Posts publics
router.get('/posts/feed', postController.getFeed);
router.get('/posts/vendor/:vendorId', postController.getVendorPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/posts/:id/comments', postController.getComments);

// ✅ VISITES — public, AVANT protect
router.use('/visits', visitsRouter);

// Newsletter (subscribe public)
router.post('/newsletter/subscribe', newsletterController.subscribe);
router.get('/newsletter/unsubscribe/:email', newsletterController.unsubscribe);

// ===================================================
// ===== ROUTES PROTÉGÉES (APRÈS router.use(protect)) =====
// ===================================================
router.use(protect);

// Test upload
router.post('/test-upload', vendorOnly, uploadMultiple.array('images', 5), (req, res) => {
  console.log('🧪 TEST UPLOAD - Fichiers reçus:', req.files?.length);
  if (req.files && req.files.length > 0) {
    const urls = req.files.map(f => ({ path: f.path, filename: f.filename, size: f.size }));
    res.json({ success: true, files: urls });
  } else {
    res.json({ success: false, message: 'Aucun fichier reçu' });
  }
});

// Utilisateur
router.get('/user/profile', userController.getProfile);
router.put('/user/profile', userController.updateProfile);
router.post('/user/change-password', userController.changePassword);
router.patch('/user/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);

// Téléphone
router.post('/user/send-code', authController.sendPhoneVerificationCode);
router.post('/user/verify-phone', authController.verifyPhoneCode);

// Wishlist
router.get('/user/wishlist', userController.getWishlist);
router.post('/user/wishlist/:id', userController.addToWishlist);
router.delete('/user/wishlist/:id', userController.removeFromWishlist);

// Likes
router.get('/user/likes', userController.getUserLikes);
router.get('/user/product-likes', userController.getProductLikes);
router.post('/user/like-product/:productId', userController.toggleProductLike);
router.get('/user/post-likes', userController.getPostLikes);
router.post('/user/like-post/:postId', userController.togglePostLike);

// Vendeurs (protégés)
router.post('/vendors', vendorController.createVendor);
router.put('/vendors/:id', vendorController.updateVendor);
router.post('/vendors/:id/follow', vendorController.toggleFollow);
router.post('/vendors/:id/cover', uploadCover.single('cover'), vendorController.uploadCoverImage);
router.get('/vendors/pending', vendorController.getPendingVendors);
router.get('/vendors/user/:userId', vendorController.getVendorByUserId);

// Produits (protégés)
router.post('/products', vendorOnly, productController.createProduct);
router.put('/products/:id', vendorOnly, productController.updateProduct);
router.delete('/products/:id', vendorOnly, productController.deleteProduct);

// Commandes
router.post('/orders', orderController.createOrder);
router.get('/orders/my-orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getOrderById);
router.patch('/orders/:id/cancel', orderController.cancelOrder);

// Posts (protégés)
router.post('/posts', vendorOnly, uploadMultiple.array('images', 10), postController.createPost);
router.put('/posts/:id', vendorOnly, postController.updatePost);
router.delete('/posts/:id', vendorOnly, postController.deletePost);
router.post('/posts/:id/like', postController.toggleLike);
router.post('/posts/:id/comment', postController.addComment);
router.put('/posts/:id/pin', vendorOnly, postController.togglePinPost);

// Panier
router.get('/cart', cartController.getCart);
router.post('/cart/sync', cartController.syncCart);
router.post('/cart/refresh', cartController.refreshCart);

// Messages
router.get('/messages/conversations', messageController.getConversations);
router.post('/messages/conversation', messageController.startConversation);
router.get('/messages/conversation/:id', messageController.getMessages);
router.post('/messages/send', messageController.sendMessage);
router.delete('/messages/:id', messageController.deleteMessage);
router.delete('/messages/conversation/:id', messageController.deleteConversation);
router.get('/messages/unread', messageController.getUnreadCount);

// Routes admin
router.use('/admin', adminRouter);

module.exports = router;