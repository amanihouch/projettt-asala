// backend/src/controllers/admin/VendorController.js
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');

// @desc    Obtenir tous les vendeurs
// @route   GET /api/v1/admin/vendors
// @access  Private/Admin
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, verified } = req.query;

    const result = await Vendor.getAll({ page, limit, search, verified });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getVendors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des vendeurs',
      error: error.message
    });
  }
};

// @desc    Obtenir un vendeur par ID
// @route   GET /api/v1/admin/vendors/:id
// @access  Private/Admin
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
    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 20 });

    res.json({
      success: true,
      data: {
        vendor,
        products: products.data
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

// @desc    Mettre à jour un vendeur
// @route   PUT /api/v1/admin/vendors/:id
// @access  Private/Admin
exports.updateVendor = async (req, res) => {
  try {
    const {
      shopName, description, specialty, location, verified,
      facebookUrl, instagramUrl, websiteUrl
    } = req.body;

    const updates = {
      shop_name: shopName,
      description,
      specialty,
      location,
      verified: verified !== undefined ? (verified ? 1 : 0) : undefined,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      website_url: websiteUrl
    };

    const vendor = await Vendor.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'Vendeur mis à jour avec succès',
      data: { vendor }
    });
  } catch (error) {
    console.error('❌ Erreur updateVendor:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer un vendeur
// @route   DELETE /api/v1/admin/vendors/:id
// @access  Private/Admin
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

    // Optionally delete the user account
    await User.delete(vendor.user_id);

    res.json({
      success: true,
      message: 'Vendeur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// @desc    Basculer le statut de vérification
// @route   PATCH /api/v1/admin/vendors/:id/toggle-verification
// @access  Private/Admin
exports.toggleVerification = async (req, res) => {
  try {
    const result = await Vendor.toggleVerification(req.params.id);

    res.json({
      success: true,
      message: result.verified ? 'Vendeur vérifié' : 'Vérification retirée',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur toggleVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};