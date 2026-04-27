// backend/src/routes/admin/orders.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../config/database');

// Récupérer toutes les commandes
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    // Structure de la table orders d'après votre DESCRIBE:
    // - userId (camelCase, pas user_id)
    // - customerName, customerEmail, customerPhone1, customerPhone2
    // - createdAt, updatedAt
    const orders = await db.execute(`
      SELECT 
        o.id,
        o.orderNumber,
        o.userId,
        o.customerName,
        o.customerEmail,
        o.customerPhone1,
        o.customerPhone2,
        o.governorate,
        o.delegation,
        o.postalCode,
        o.address,
        o.subtotal,
        o.shippingCost,
        o.total,
        o.paymentMethod,
        o.status,
        o.notes,
        o.adminNotes,
        o.trackingNumber,
        o.cancellationReason,
        o.deliveredAt,
        o.cancelledAt,
        o.createdAt,
        o.updatedAt,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
    `);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('❌ Erreur getAllOrders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Statistiques des commandes
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(total), 0) as total_revenue
      FROM orders
    `);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('❌ Erreur getOrderStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer une commande par ID
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const orders = await db.execute(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    
    // Récupérer les items de la commande
    const items = await db.execute(`
      SELECT oi.*, p.name as product_name, p.price as product_price, p.image as product_image
      FROM order_items oi
      LEFT JOIN posts p ON oi.productId = p.id
      WHERE oi.orderId = ?
    `, [req.params.id]);
    
    res.json({
      success: true,
      data: {
        order: orders[0],
        items
      }
    });
  } catch (error) {
    console.error('❌ Erreur getOrderById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mettre à jour le statut d'une commande
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur updateOrderStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;