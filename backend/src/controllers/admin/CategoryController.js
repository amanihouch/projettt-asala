// backend/src/controllers/admin/CategoryController.js
const Category = require('../../models/Category');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUTES LES CATÉGORIES =====
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== CRÉER UNE CATÉGORIE =====
exports.createCategory = async (req, res) => {
  try {
    const { name, nameAr, slug, icon, description, parentId, sortOrder } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nom et slug requis'
      });
    }

    // Vérifier si le slug existe déjà
    const exists = await Category.slugExists(slug);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug existe déjà'
      });
    }

    const category = await Category.create({
      name,
      nameAr,
      slug,
      icon,
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
    console.error('❌ Erreur admin createCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UNE CATÉGORIE =====
exports.updateCategory = async (req, res) => {
  try {
    const { name, nameAr, icon, description, parentId, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    const updated = await Category.update(req.params.id, {
      name,
      nameAr,
      icon,
      description,
      parentId,
      sortOrder,
      isActive
    });

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: { category: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UNE CATÉGORIE =====
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    await Category.delete(req.params.id);

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};