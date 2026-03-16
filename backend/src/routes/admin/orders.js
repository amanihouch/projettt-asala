// backend/src/routes/admin/orders.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const orderController = require('../../controllers/admin/OrderController');

router.use(protect);
router.use(admin);

router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;