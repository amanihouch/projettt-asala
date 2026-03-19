// backend/src/controllers/admin/AdminController.js
const User = require('../../models/User');
const Vendor = require('../../models/Vendor');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Post = require('../../models/Post');

// @desc    Obtenir les statistiques du dashboard
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      orderStats,
      postStats,
      recentOrders,
      recentVendors
    ] = await Promise.all([
      User.count('customer'),
      Vendor.count(),
      Product.count('approved'),
      Order.getStats(),
      Post.countByStatus(),
      Order.getRecent(5),
      Vendor.getRecent(4)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVendors,
          totalProducts,
          totalOrders: orderStats.total,
          pendingOrders: orderStats.pending,
          totalRevenue: orderStats.revenue,
          pendingPosts: postStats.pending
        },
        recentOrders,
        recentVendors
      }
    });
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des statistiques',
      error: error.message
    });
  }
};

// @desc    Obtenir les données pour les graphiques
// @route   GET /api/v1/admin/charts
// @access  Private/Admin
exports.getChartData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();

    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const [ordersData, categoryData] = await Promise.all([
      Order.getOrdersByDateRange(startDate, endDate, period === 'year' ? 'month' : 'day'),
      Product.getCategoryDistribution()
    ]);

    res.json({
      success: true,
      data: {
        orders: ordersData,
        categories: categoryData
      }
    });
  } catch (error) {
    console.error('❌ Erreur charts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des graphiques',
      error: error.message
    });
  }
};

// @desc    Recherche globale
// @route   GET /api/v1/admin/search
// @access  Private/Admin
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
      SELECT v.id, v.shop_name as name, u.email, u.phone, 'vendor' as type,
             u.avatar, v.verified
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.shop_name LIKE ? OR v.description LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm]);

    // Search products
    const products = await db.query(`
      SELECT p.id, p.name, p.price, 'product' as type,
             (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image
      FROM products p
      WHERE p.name LIKE ? OR p.description LIKE ?
      LIMIT 5
    `, [searchTerm, searchTerm]);

    // Search orders
    const orders = await db.query(`
      SELECT id, order_number as name, customer_name, total, status, 'order' as type
      FROM orders
      WHERE order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?
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