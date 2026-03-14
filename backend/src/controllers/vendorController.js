const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const db = require('../models/db');

exports.createVendor = async (req, res) => {
  try {
    const {
      userId, shopName, specialty, description, location,
      coverImage
    } = req.body;

    console.log('📝 Création profil vendeur:', { userId, shopName });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const existingVendor = await Vendor.findByUserId(userId);
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Un profil vendeur existe déjà pour cet utilisateur' });
    }

    const vendorData = {
      userId,
      shopName,
      specialty,
      description,
      location: location || 'تونس',
      coverImage: coverImage || null,
      verified: false,
      followers: 0,
      totalProducts: 0,
      rating: 0,
      isActive: true
    };

    const vendor = await Vendor.create(vendorData);

    if (user.role !== 'vendor') {
      await User.update(userId, { role: 'vendor' });
    }

    res.status(201).json({
      success: true,
      message: 'Profil vendeur créé avec succès',
      data: { vendor }
    });

  } catch (error) {
    console.error('❌ Erreur createVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, specialty } = req.query;
    const result = await Vendor.getAll({ page, limit, search, specialty });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ getAllVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopVendors = async (req, res) => {
  try {
    const vendors = await db.query(`
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.verified = 1
      ORDER BY v.rating DESC, followersCount DESC
      LIMIT 8
    `);
    res.json({ success: true, data: { vendors } });
  } catch (error) {
    console.error('❌ getTopVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }

    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 10 });
    const posts = await db.query(`
      SELECT * FROM posts 
      WHERE vendorId = ? AND status = 'approved' 
      ORDER BY createdAt DESC 
      LIMIT 5
    `, [req.params.id]);

    res.json({
      success: true,
      data: { vendor, products: products.data, posts }
    });
  } catch (error) {
    console.error('❌ getVendorById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await Vendor.getProducts(req.params.id, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ getVendorProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorId = req.params.id;
    const result = await Vendor.toggleFollow(userId, vendorId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ toggleFollow:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};