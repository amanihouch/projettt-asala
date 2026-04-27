// backend/src/controllers/admin/CategoryController.js

const Category = require('../../models/Category');
const cloudinary = require('../../config/cloudinary');

/**
 * @desc    Récupérer toutes les catégories (Admin)
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive = 'true' } = req.query;

    const categories = await Category.getAll({
      includeChildren: true,
      activeOnly: includeInactive !== 'true'
    });

    res.json({
      success: true,
      count: categories.length,
      data: { categories }
    });

  } catch (error) {
    console.error('❌ Erreur admin getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des catégories'
    });
  }
};

/**
 * @desc    Créer une catégorie (Admin)
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      nameAr,
      nameFr,
      slug,
      icon,
      imageUrl,
      description,
      parentId,
      sortOrder
    } = req.body;

    // Validation
    const errors = [];
    if (!name) errors.push('Le nom est requis');
    if (!nameAr) errors.push('Le nom arabe est requis');
    if (!slug) errors.push('Le slug est requis');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation échouée',
        errors
      });
    }

    // Vérifier le slug
    const slugExists = await Category.slugExists(slug);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug existe déjà'
      });
    }

    const category = await Category.create({
      name,
      nameAr: nameAr || name,
      nameFr: nameFr || name,
      slug,
      icon,
      imageUrl,
      description,
      parentId,
      sortOrder
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Erreur createCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création'
    });
  }
};

/**
 * @desc    Mettre à jour une catégorie (Admin)
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.update(id, updates);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Erreur updateCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
};

/**
 * @desc    Supprimer une catégorie (Admin)
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await Category.delete(id);

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur deleteCategory:', error);
    
    // Déterminer le code d'erreur approprié
    const statusCode = error.message.includes('Impossible') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression'
    });
  }
};