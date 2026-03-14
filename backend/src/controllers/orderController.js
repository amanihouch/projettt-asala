// backend/src/controllers/orderController.js
const Order = require('../models/Order');
const db = require('../models/db');

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      customerName, customerEmail, customerPhone1, customerPhone2,
      governorate, delegation, postalCode, address,
      items, subtotal, shipping, total, notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article'
      });
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone1: customerPhone1,
      customer_phone2: customerPhone2,
      governorate,
      delegation,
      postal_code: postalCode,
      address,
      subtotal,
      shipping,
      total,
      payment_method: 'cash_on_delivery',
      notes
    });

    // Add items
    await Order.addItems(order.id, items);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.getByUser(userId, { page, limit });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Erreur getMyOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des commandes',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Check if order belongs to user
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir cette commande'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la commande',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Check if order belongs to user
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler cette commande'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut plus être annulée'
      });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, {
      status: 'cancelled',
      cancellationReason: req.body.reason || 'Annulé par le client'
    });

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('❌ Erreur cancelOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation',
      error: error.message
    });
  }
};