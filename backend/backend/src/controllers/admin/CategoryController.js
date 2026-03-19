// backend/src/controllers/admin/CategoryController.js
const Category = require('../../models/Category');

// Fonction pour générer un slug manuellement
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')           // Remplacer les espaces par _
    .replace(/[^\w\-]+/g, '')       // Enlever les caractères spéciaux
    .replace(/\-\-+/g, '_')         // Remplacer plusieurs - par un seul _
    .replace(/^-+/, '')              // Enlever - au début
    .replace(/-+$/, '');             // Enlever - à la fin
};

// @desc    Obtenir toutes les catégories
// @route   GET /api/v1/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('❌ Erreur getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des catégories',
      error: error.message
    });
  }
};

// @desc    Créer une catégorie
// @route   POST /api/v1/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, nameAr, icon, description, parentId, sortOrder } = req.body;

    // Générer le slug manuellement
    const slug = generateSlug(name);

    // Vérifier si le slug existe
    const exists = await Category.slugExists(slug);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }

    const category = await Category.create({
      name,
      nameAr,
      slug,
      icon: icon || '📦',
      description,
      parent_id: parentId,
      sortOrder: sortOrder || 0
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
      message: 'Erreur lors de la création',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une catégorie
// @route   PUT /api/v1/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, nameAr, icon, description, parentId, sortOrder, isActive } = req.body;

    const updates = {
      name,
      nameAr,
      icon,
      description,
      parent_id: parentId,
      sortOrder,
      isActive
    };

    if (name) {
      const slug = generateSlug(name);
      const exists = await Category.slugExists(slug, req.params.id);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
      updates.slug = slug;
    }

    const category = await Category.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: { category }
    });
  } catch (error) {
    console.error('❌ Erreur updateCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer une catégorie
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
      error: error.message
    });
  }
};