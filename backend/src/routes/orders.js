const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Routes utilisateur connecté
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// Routes admin
router.get('/admin/all', protect, adminOnly, orderController.adminGetAllOrders);
router.patch('/admin/:id/status', protect, adminOnly, orderController.adminUpdateOrderStatus);

module.exports = router;