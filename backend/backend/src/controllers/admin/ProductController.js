// backend/src/controllers/admin/ProductController.js
const Product = require('../../models/Product');

// @desc    Obtenir tous les produits
// @route   GET /api/v1/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status, vendor } = req.query;

    const result = await Product.getAll({ page, limit, search, category, status, vendor });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits',
      error: error.message
    });
  }
};

// @desc    Obtenir un produit par ID
// @route   GET /api/v1/admin/products/:id
// @access  Private/Admin
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erreur getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du produit',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un produit
// @route   PUT /api/v1/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, oldPrice, category,
      colors, quantity, unit, inStock, status,
      adminNotes, isSponsored, isFeatured, tags
    } = req.body;

    const updates = {
      name,
      description,
      price,
      old_price: oldPrice,
      category,
      colors,
      quantity,
      unit,
      in_stock: inStock,
      status,
      admin_notes: adminNotes,
      is_sponsored: isSponsored,
      is_featured: isFeatured,
      tags
    };

    const product = await Product.update(req.params.id, updates);

    // Update images if provided
    if (req.body.images) {
      await Product.updateImages(req.params.id, req.body.images);
    }

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erreur updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/v1/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// @desc    Approuver un produit
// @route   PATCH /api/v1/admin/products/:id/approve
// @access  Private/Admin
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.approve(req.params.id);

    res.json({
      success: true,
      message: 'Produit approuvé avec succès',
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erreur approveProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
      error: error.message
    });
  }
};

// @desc    Rejeter un produit
// @route   PATCH /api/v1/admin/products/:id/reject
// @access  Private/Admin
exports.rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est requise'
      });
    }

    const product = await Product.reject(req.params.id, reason);

    res.json({
      success: true,
      message: 'Produit rejeté',
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erreur rejectProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet',
      error: error.message
    });
  }
};