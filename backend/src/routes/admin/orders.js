// backend/src/routes/admin/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/OrderController');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;