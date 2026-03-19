// backend/src/controllers/vendorController.js
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const db = require('../models/db');

// ===== CRÉER UN VENDEUR =====
exports.createVendor = async (req, res) => {
  try {
    const {
      userId, shopName, specialty, description, location,
      coverImage, experience
    } = req.body;

    console.log('📝 Création profil vendeur:', { userId, shopName });

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier si un profil vendeur existe déjà
    const existingVendor = await Vendor.findByUserId(userId);
    if (existingVendor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un profil vendeur existe déjà pour cet utilisateur' 
      });
    }

    // Créer le vendeur
    const vendorData = {
      userId,
      shopName,
      specialty,
      description,
      location: location || 'تونس',
      coverImage: coverImage || null,
      experience: experience || 0,
      verified: false,
      rating: 0,
      totalReviews: 0
    };

    const vendor = await Vendor.create(vendorData);

    // Mettre à jour le rôle de l'utilisateur si nécessaire
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER TOUS LES VENDEURS =====
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, specialty, verified } = req.query;
    
    const result = await Vendor.getAll({ 
      page, 
      limit, 
      search, 
      specialty,
      verified: verified === 'true' ? true : verified === 'false' ? false : null
    });
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('❌ getAllVendors:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER LES MEILLEURS VENDEURS =====
exports.getTopVendors = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const vendors = await db.query(`
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.verified = 1
      ORDER BY v.rating DESC, followersCount DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ 
      success: true, 
      data: { vendors } 
    });
  } catch (error) {
    console.error('❌ getTopVendors:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER UN VENDEUR PAR ID UTILISATEUR =====
exports.getVendorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const vendor = await Vendor.findByUserId(userId);
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé pour cet utilisateur' 
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    console.error('❌ getVendorByUserId:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER UN VENDEUR PAR ID =====
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
    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 10 });
    
    // Récupérer les posts
    const posts = await db.query(`
      SELECT * FROM posts 
      WHERE vendorId = ? AND status = 'approved' 
      ORDER BY createdAt DESC 
      LIMIT 5
    `, [req.params.id]);

    res.json({
      success: true,
      data: { 
        vendor, 
        products: products.data, 
        posts 
      }
    });
  } catch (error) {
    console.error('❌ getVendorById:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER LES PRODUITS D'UN VENDEUR =====
exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await Vendor.getProducts(req.params.id, { page, limit });
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('❌ getVendorProducts:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== METTRE À JOUR UN VENDEUR =====
exports.updateVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const updates = req.body;
    
    // Vérifier si le vendeur existe
    const existingVendor = await Vendor.findById(vendorId);
    if (!existingVendor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }

    // Mettre à jour
    const updatedVendor = await Vendor.update(vendorId, updates);

    res.json({
      success: true,
      message: 'Profil vendeur mis à jour avec succès',
      data: { vendor: updatedVendor }
    });
  } catch (error) {
    console.error('❌ updateVendor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== SUIVRE / NE PLUS SUIVRE UN VENDEUR =====
exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorId = req.params.id;
    
    const result = await Vendor.toggleFollow(userId, vendorId);
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('❌ toggleFollow:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};