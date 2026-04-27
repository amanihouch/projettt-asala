// backend/src/routes/api.js
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

// Import Cloudinary uploaders (UNE SEULE FOIS)
const { uploadAvatar, uploadCover, uploadMultiple } = require('../config/cloudinary');

// Middleware d'authentification
const { protect, adminOnly, vendorOnly } = require('../middleware/auth');

// ===== ROUTE DE TEST (Ajoutée une seule fois) =====
router.post('/test-upload', protect, vendorOnly, uploadMultiple.array('images', 5), (req, res) => {
  console.log('🧪 TEST UPLOAD - Fichiers reçus:', req.files?.length);
  if (req.files && req.files.length > 0) {
    const urls = req.files.map(f => ({ path: f.path, filename: f.filename, size: f.size }));
    console.log('📸 URLs Cloudinary:', urls);
    res.json({ success: true, files: urls });
  } else {
    console.log('❌ Aucun fichier reçu');
    res.json({ success: false, message: 'Aucun fichier reçu' });
  }
});

// ===== ROUTES D'AUTHENTIFICATION =====
router.use('/auth', authRouter);

// ===== ROUTES PUBLIQUES =====
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-code', authController.verifyCode);
router.post('/auth/reset-password', authController.resetPassword);

// ===== ROUTES CONTACT =====
router.use('/contact', contactRouter);

// ===== ROUTES CATÉGORIES =====
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/hierarchy', categoryController.getCategoriesHierarchy);
router.get('/categories/:slug', categoryController.getCategoryBySlug);

// ===== ROUTES PRODUITS =====
router.get('/products', productController.getAllProducts);
router.get('/products/sponsored', productController.getSponsoredProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/vendor/:vendorId', productController.getProductsByVendor);
router.get('/products/category/:category', productController.getProductsByCategory);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProductById);

// ===== ROUTES VENDEURS =====
router.get('/vendors', vendorController.getAllVendors);
router.get('/vendors/top', vendorController.getTopVendors);
router.get('/vendors/:id', vendorController.getVendorById);

// ===== ROUTES POSTS (publiques) =====
router.get('/posts/feed', postController.getFeed);
router.get('/posts/vendor/:vendorId', postController.getVendorPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/posts/:id/comments', postController.getComments);

// ===== ROUTES PROTÉGÉES =====
router.use(protect);

// Utilisateur
router.get('/user/profile', userController.getProfile);
router.put('/user/profile', userController.updateProfile);
router.post('/user/change-password', userController.changePassword);
router.patch('/user/avatar', protect, uploadAvatar.single('avatar'), userController.updateAvatar);

// Téléphone
router.post('/user/send-code', authController.sendVerificationCode);
router.post('/user/verify-phone', authController.verifyPhoneCode);
router.post('/user/resend-code', authController.resendVerificationCode);

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
router.post('/vendors/:id/cover', protect, uploadCover.single('cover'), vendorController.uploadCoverImage);
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

// Posts (protégés) avec upload multiple
router.post('/posts', protect, vendorOnly, uploadMultiple.array('images', 10), postController.createPost);
router.put('/posts/:id', protect, vendorOnly, postController.updatePost);
router.delete('/posts/:id', protect, vendorOnly, postController.deletePost);
router.post('/posts/:id/like', protect, postController.toggleLike);
router.post('/posts/:id/comment', protect, postController.addComment);
router.put('/posts/:id/pin', protect, vendorOnly, postController.togglePinPost);

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
// backend/src/routes/api.js
// Cette ligne doit être présente
router.post('/posts/:id/comment', protect, postController.addComment);
// Newsletter
router.post('/newsletter/subscribe', newsletterController.subscribe);
router.get('/newsletter/unsubscribe/:email', newsletterController.unsubscribe);

// Visites
router.use('/visits', visitsRouter);

// Routes admin
router.use('/admin', adminRouter);

module.exports = router;