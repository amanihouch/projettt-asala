// backend/src/controllers/categoryController.js
const Category = require('../models/Category');
const db = require('../models/db');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getActive();

    // Get product count for each category
    for (let cat of categories) {
      const count = await db.count(
        'SELECT COUNT(*) as count FROM products WHERE categoryId = ? AND status = "active"',
        [cat.id]
      );
      cat.productsCount = count;
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('❌ Erreur getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des catégories',
      error: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('❌ Erreur getCategoryBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la catégorie',
      error: error.message
    });
  }
};