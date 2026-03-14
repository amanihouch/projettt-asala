// backend/src/controllers/admin/VendorController.js
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');

// ===== LISTE ADMIN DES VENDEURS =====
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, verified } = req.query;
    const result = await Vendor.getAll({ page, limit, search, verified });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ admin getAllVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// backend/src/controllers/vendorController.js
// AJOUTEZ cette méthode (si elle n'existe pas déjà)

exports.createVendor = async (req, res) => {
  try {
    const {
      userId, shopName, specialty, description, location,
      experience, coverImage
    } = req.body;

    // Vérifier que l'utilisateur existe
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que le vendeur n'existe pas déjà
    const Vendor = require('../models/Vendor');
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
      experience: experience || 0,
      coverImage: coverImage || null,
      verified: false,
      followersCount: 0,
      productsCount: 0,
      rating: 0
    };

    const vendor = await Vendor.create(vendorData);

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

// ===== DÉTAIL ADMIN D'UN VENDEUR =====
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 20 });
    res.json({ success: true, data: { vendor, products: products.data } });
  } catch (error) {
    console.error('❌ admin getVendorById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== METTRE À JOUR UN VENDEUR (admin) =====
exports.updateVendor = async (req, res) => {
  try {
    const {
      shopName, description, specialty, location, verified,
      facebookUrl, instagramUrl, websiteUrl
    } = req.body;

    const updates = {
      shopName,
      description,
      specialty,
      location,
      verified: verified !== undefined ? (verified ? 1 : 0) : undefined,
      facebookUrl,
      instagramUrl,
      websiteUrl
    };

    const vendor = await Vendor.update(req.params.id, updates);
    res.json({ success: true, message: 'Vendeur mis à jour', data: { vendor } });
  } catch (error) {
    console.error('❌ admin updateVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== SUPPRIMER UN VENDEUR (admin) =====
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    await Vendor.delete(req.params.id);
    // Optionnel : supprimer aussi l'utilisateur associé
    await User.delete(vendor.userId);
    res.json({ success: true, message: 'Vendeur supprimé' });
  } catch (error) {
    console.error('❌ admin deleteVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ACTIVER/DÉSACTIVER LA VÉRIFICATION =====
exports.toggleVerification = async (req, res) => {
  try {
    const result = await Vendor.toggleVerification(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ admin toggleVerification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};