// backend/src/controllers/admin/OrderController.js
const Order = require('../../models/Order');

// @desc    Obtenir toutes les commandes
// @route   GET /api/v1/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, fromDate, toDate } = req.query;

    const result = await Order.getAll({ page, limit, search, status, fromDate, toDate });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des commandes',
      error: error.message
    });
  }
};

// @desc    Obtenir une commande par ID
// @route   GET /api/v1/admin/orders/:id
// @access  Private/Admin
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
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

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/v1/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes, cancellationReason } = req.body;

    const order = await Order.updateStatus(req.params.id, {
      status,
      trackingNumber,
      notes,
      cancellationReason
    });

    res.json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer une commande
// @route   DELETE /api/v1/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    await Order.delete(req.params.id);

    res.json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteOrder:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
      error: error.message
    });
  }
};