// backend/src/controllers/admin/OrderController.js
const Order = require('../../models/Order');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUTES LES COMMANDES =====
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query;

    const result = await Order.getAll({ page, limit, status, search });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UNE COMMANDE =====
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
    console.error('❌ Erreur admin getOrderById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR LE STATUT =====
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const updated = await Order.updateStatus(req.params.id, {
      status,
      trackingNumber,
      notes
    });

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: { order: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== STATISTIQUES DES COMMANDES =====
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats();

    const recent = await Order.getRecent(5);

    res.json({
      success: true,
      data: {
        stats,
        recent
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};