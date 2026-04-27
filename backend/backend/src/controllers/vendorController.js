// backend/src/controllers/vendorController.js
const Vendor = require('../models/Vendor');
const db = require('../models/db');

// @desc    Get all vendors (public)
// @route   GET /api/v1/vendors
// @access  Public
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, specialty } = req.query;

    let sql = `
      SELECT v.*, u.name, u.email, u.avatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.isActive = 1
    `;
    const params = [];

    if (specialty) {
      sql += ' AND v.specialty = ?';
      params.push(specialty);
    }

    if (search) {
      sql += ' AND (v.shopName LIKE ? OR v.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY v.verified DESC, v.rating DESC';

    const result = await db.paginate(sql, params, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getAllVendors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des vendeurs',
      error: error.message
    });
  }
};

// @desc    Get vendor by ID
// @route   GET /api/v1/vendors/:id
// @access  Public
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    // Get vendor products
    const products = await db.query(`
      SELECT p.*, 
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM products p
      WHERE p.vendorId = ? AND p.status = 'active'
      ORDER BY p.createdAt DESC
      LIMIT 10
    `, [vendor.id]);

    // Get vendor posts
    const posts = await db.query(`
      SELECT * FROM posts
      WHERE vendorId = ? AND status = 'approved'
      ORDER BY createdAt DESC
      LIMIT 5
    `, [vendor.id]);

    res.json({
      success: true,
      data: {
        vendor,
        products,
        posts
      }
    });
  } catch (error) {
    console.error('❌ Erreur getVendorById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du vendeur',
      error: error.message
    });
  }
};

// @desc    Get top vendors
// @route   GET /api/v1/vendors/top
// @access  Public
exports.getTopVendors = async (req, res) => {
  try {
    const vendors = await db.query(`
      SELECT v.*, u.name, u.avatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.isActive = 1
      ORDER BY v.rating DESC, v.followers DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      data: { vendors }
    });
  } catch (error) {
    console.error('❌ Erreur getTopVendors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des meilleurs vendeurs',
      error: error.message
    });
  }
};

// @desc    Follow/unfollow vendor
// @route   POST /api/v1/vendors/:id/follow
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorId = req.params.id;

    const result = await Vendor.toggleFollow(userId, vendorId);

    // Update followers count
    const followersCount = await db.count(
      'SELECT COUNT(*) as count FROM followers WHERE vendorId = ?',
      [vendorId]
    );

    await db.query(
      'UPDATE vendors SET followers = ? WHERE id = ?',
      [followersCount, vendorId]
    );

    res.json({
      success: true,
      message: result.following ? 'Vendeur suivi' : 'Vendeur non suivi',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur toggleFollow:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du follow',
      error: error.message
    });
  }
};