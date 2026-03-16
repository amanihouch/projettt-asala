// backend/src/controllers/vendorController.js
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Product = require('../models/Product');
const db = require('../models/db');

// ===== CRÉER UN VENDEUR =====
exports.createVendor = async (req, res) => {
  try {
    const { userId, shopName, specialty, description, location, coverImage, experience } = req.body;

    console.log('📝 Création vendeur avec données:', { userId, shopName, specialty });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const existingVendor = await Vendor.findByUserId(userId);
    if (existingVendor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un profil vendeur existe déjà pour cet utilisateur' 
      });
    }

    const vendor = await Vendor.create({
      userId,
      shopName,
      specialty,
      description,
      location: location || 'تونس',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200',
      experience: experience || 0,
      totalProducts: 0
    });

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
      message: error.message || 'Erreur lors de la création du vendeur' 
    });
  }
};

// ===== GET ALL VENDORS =====
exports.getAllVendors = async (req, res) => {
  try {
    console.log('📦 Récupération de tous les vendeurs...');
    const vendors = await Vendor.getAll({});
    res.json({ 
      success: true, 
      data: { vendors: vendors.data },
      pagination: vendors.pagination
    });
  } catch (error) {
    console.error('❌ Erreur getAllVendors:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du chargement des vendeurs' 
    });
  }
};

// ===== GET VENDOR BY ID (CORRIGÉ AVEC FALLBACK) =====
exports.getVendorById = async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log('🔍 Recherche vendeur ID:', vendorId);

    // 1️⃣ Chercher d'abord par vendor.id (cas normal)
    let vendor = await Vendor.findById(vendorId);

    // 2️⃣ Fallback : chercher par userId (cas où le header passe userId au lieu de vendor.id)
    if (!vendor) {
      console.log('⚠️ Vendeur non trouvé par ID, tentative par userId:', vendorId);
      vendor = await Vendor.findByUserId(vendorId);
      
      if (vendor) {
        console.log('✅ Vendeur trouvé par userId:', vendor);
      }
    }

    if (!vendor) {
      console.log('❌ Vendeur non trouvé avec ID:', vendorId);
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }

    // Récupérer les produits du vendeur
    const products = await Vendor.getProducts(vendor.id, { page: 1, limit: 10 });
    
    // Récupérer les posts du vendeur
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
        products: products.data,
        posts 
      } 
    });
  } catch (error) {
    console.error('❌ Erreur getVendorById:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du chargement du vendeur' 
    });
  }
};

// ===== GET VENDOR PRODUCTS =====
exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }
    
    const products = await Vendor.getProducts(req.params.id, { page, limit });
    
    res.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('❌ Erreur getVendorProducts:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du chargement des produits' 
    });
  }
};

// ===== UPDATE VENDOR =====
exports.updateVendor = async (req, res) => {
  try {
    const { shopName, specialty, description, location, coverImage } = req.body;
    
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
      coverImage
    });
    
    res.json({ 
      success: true, 
      message: 'Vendeur mis à jour avec succès',
      data: { vendor: updated } 
    });
  } catch (error) {
    console.error('❌ Erreur updateVendor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour' 
    });
  }
};

// ===== DELETE VENDOR =====
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }
    
    await Vendor.delete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Vendeur supprimé avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur deleteVendor:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la suppression' 
    });
  }
};

// ===== TOGGLE FOLLOW =====
exports.toggleFollow = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Vous devez être connecté' 
      });
    }
    
    const result = await Vendor.toggleFollow(req.user.id, req.params.id);
    
    res.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('❌ Erreur toggleFollow:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du follow/unfollow' 
    });
  }
};

// ===== GET TOP VENDORS =====
exports.getTopVendors = async (req, res) => {
  try {
    const limit = req.query.limit || 8;
    
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
    console.error('❌ Erreur getTopVendors:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors du chargement des meilleurs vendeurs' 
    });
  }
};

module.exports = exports;