// backend/src/controllers/admin/DashboardController.js
const db = require('../../models/db');

// ===== STATISTIQUES DU TABLEAU DE BORD =====
exports.getDashboardStats = async (req, res) => {
  try {
    // Statistiques générales
    const [totalUsers, totalVendors, totalCustomers, totalProducts, totalOrders, totalRevenue, pendingPosts] = await Promise.all([
      db.count('SELECT COUNT(*) as count FROM users'),
      db.count('SELECT COUNT(*) as count FROM users WHERE role = "vendor"'),
      db.count('SELECT COUNT(*) as count FROM users WHERE role = "customer"'),
      db.count('SELECT COUNT(*) as count FROM products WHERE status = "active"'),
      db.count('SELECT COUNT(*) as count FROM orders'),
      db.getOne('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = "delivered"'),
      db.count('SELECT COUNT(*) as count FROM posts WHERE status = "pending"')
    ]);

    // Évolution des commandes (7 derniers jours)
    const weeklyOrders = await db.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM orders
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `);

    // Top vendeurs
    const topVendors = await db.query(`
      SELECT v.id, v.shopName, u.avatar, 
             COUNT(DISTINCT p.id) as productsCount,
             COALESCE(AVG(p.rating), 0) as avgRating
      FROM vendors v
      JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON v.id = p.vendorId
      GROUP BY v.id
      ORDER BY avgRating DESC, productsCount DESC
      LIMIT 5
    `);

    // Dernières commandes
    const recentOrders = await Order.getRecent(5);

    // Derniers utilisateurs
    const recentUsers = await db.query(`
      SELECT id, name, email, role, avatar, createdAt
      FROM users
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVendors,
          totalCustomers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue?.total || 0,
          pendingPosts
        },
        charts: {
          weeklyOrders
        },
        topVendors,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};