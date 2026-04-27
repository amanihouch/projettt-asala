// backend/src/controllers/admin/DashboardController.js
const db = require('../../models/db');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Post = require('../../models/Post');

exports.getDashboardStats = async (req, res) => {
  try {
    // Statistiques utilisateurs
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'vendor' THEN 1 ELSE 0 END) as vendors,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers
      FROM users
    `);

    // Statistiques commandes
    const orderStats = await Order.getStats();
    
    // Commandes récentes
    const recentOrders = await Order.getRecent(5);
    
    // Produits récents
    const [recentProducts] = await db.execute(`
      SELECT p.*, u.name as vendor_name
      FROM posts p
      LEFT JOIN users u ON p.vendor_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        users: userStats[0],
        orders: orderStats,
        recentOrders,
        recentProducts
      }
    });
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};