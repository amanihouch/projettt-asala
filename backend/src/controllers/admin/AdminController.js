// backend/src/controllers/admin/AdminController.js
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Post = require('../../models/Post');
const db = require('../../models/db'); // pour les requêtes directes

// ... (getDashboardStats, getChartData inchangés)

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q}%`;

    // Search users
    const users = await db.query(`
      SELECT id, name, email, phone, role, avatar, 'user' as type
      FROM users
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm, searchTerm]);

    // Search vendors
    const vendors = await db.query(`
      SELECT v.id, v.shopName as name, u.email, u.phone, 'vendor' as type,
             u.avatar, v.verified
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.shopName LIKE ? OR v.description LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm]);

    // Search products
    const products = await db.query(`
      SELECT p.id, p.name, p.price, 'product' as type,
             (SELECT imageUrl FROM productImages WHERE productId = p.id LIMIT 1) as image
      FROM products p
      WHERE p.name LIKE ? OR p.description LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm]);

    // Search orders
    const orders = await db.query(`
      SELECT id, orderNumber as name, customerName, total, status, 'order' as type
      FROM orders
      WHERE orderNumber LIKE ? OR customerName LIKE ? OR customerEmail LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      data: {
        users,
        vendors,
        products,
        orders
      }
    });
  } catch (error) {
    console.error('❌ Erreur recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};