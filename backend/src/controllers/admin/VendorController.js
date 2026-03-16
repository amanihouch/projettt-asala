// backend/src/controllers/admin/VendorController.js
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES VENDEURS =====
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', verified = '' } = req.query;

    let sql = `
      SELECT v.*, 
             u.name, u.email, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (verified === 'true' || verified === 'false') {
      sql += ' AND v.verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (v.shopName LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY v.createdAt DESC';

    const result = await db.paginate(sql, params, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllVendors:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN VENDEUR =====
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    // Récupérer les produits
    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 100 });

    // Récupérer les posts
    const posts = await db.query(
      'SELECT * FROM posts WHERE vendorId = ? ORDER BY createdAt DESC LIMIT 20',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        vendor,
        products: products.data,
        posts
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getVendorById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN VENDEUR =====
exports.updateVendor = async (req, res) => {
  try {
    const { shopName, specialty, description, location, verified } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    const updated = await Vendor.update(req.params.id, {
      shopName,
      specialty,
      description,
      location,
      verified: verified !== undefined ? verified : vendor.verified
    });

    res.json({
      success: true,
      message: 'Vendeur mis à jour avec succès',
      data: { vendor: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN VENDEUR =====
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    // Vérifier s'il a des produits
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE vendorId = ?', [vendor.id]);
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un vendeur avec des produits'
      });
    }

    await Vendor.delete(req.params.id);

    res.json({
      success: true,
      message: 'Vendeur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deleteVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== ACTIVER LA VÉRIFICATION =====
exports.toggleVerification = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    const newStatus = !vendor.verified;
    await Vendor.update(req.params.id, { verified: newStatus });

    res.json({
      success: true,
      message: newStatus ? 'Vendeur vérifié' : 'Vérification retirée',
      data: { verified: newStatus }
    });
  } catch (error) {
    console.error('❌ Erreur admin toggleVerification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};