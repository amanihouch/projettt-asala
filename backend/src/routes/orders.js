// backend/src/routes/orderRoutes.js - Version finale
const express = require('express');
const router = express.Router();
const { protect, adminOnly, approvedVendorOnly } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// ===== TOUTES LES ROUTES SONT PROTÉGÉES =====
router.use(protect);

// ===== ROUTES UTILISATEUR =====
router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);

// ✅ Support des deux méthodes pour l'annulation (compatibilité)
router.post('/cancel/:id', orderController.cancelOrder);
router.put('/:id/cancel', orderController.cancelOrder);  // Ajout pour compatibilité REST

// ===== ROUTES VENDEUR =====
router.get('/vendor/my-orders', approvedVendorOnly, orderController.getVendorOrders);
router.get('/vendor', approvedVendorOnly, orderController.getVendorOrders);
router.get('/vendor/stats', approvedVendorOnly, orderController.getVendorStats);
router.patch('/vendor/:id/status', approvedVendorOnly, orderController.updateOrderStatus);

// ===== ROUTES ADMIN =====
router.get('/admin/all', adminOnly, orderController.getAllOrders);
router.get('/admin/stats', adminOnly, orderController.getGlobalStats);
router.delete('/admin/:id', adminOnly, orderController.deleteOrder);
router.patch('/admin/:id/status', adminOnly, orderController.updateOrderStatus);

module.exports = router;