// backend/src/controllers/categoryController.js

const Category = require('../models/Category');

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { 
      includeChildren = 'true', 
      parentOnly = 'false',
      flat = 'false'
    } = req.query;

    console.log('📋 Récupération des catégories', { includeChildren, parentOnly, flat });

    let categories;

    if (includeChildren === 'true' && flat !== 'true') {
      // Retourne l'arbre hiérarchique
      categories = await Category.getTree();
    } else if (parentOnly === 'true') {
      // Retourne uniquement les catégories parentes avec leurs enfants
      categories = await Category.getParentCategories();
    } else {
      // Retourne la liste à plat
      categories = await Category.getAll({ includeChildren: false });
    }

    // Statistiques
    const totalCategories = categories.length;
    const parentCount = categories.filter(c => !c.parentId).length;
    const childCount = categories.filter(c => c.parentId).length;

    console.log(`✅ ${totalCategories} catégories trouvées (${parentCount} principales, ${childCount} sous-catégories)`);

    res.json({
      success: true,
      count: totalCategories,
      stats: {
        total: totalCategories,
        parentCategories: parentCount,
        subCategories: childCount
      },
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('❌ Erreur getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des catégories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Récupérer la hiérarchie des catégories
 * @route   GET /api/categories/hierarchy
 * @access  Public
 */
exports.getCategoriesHierarchy = async (req, res) => {
  try {
    console.log('🌳 Récupération de la hiérarchie des catégories');

    const tree = await Category.getTree();

    // Compter récursivement
    const countNodes = (nodes) => {
      let count = 0;
      nodes.forEach(node => {
        count++;
        if (node.children && node.children.length > 0) {
          count += countNodes(node.children);
        }
      });
      return count;
    };

    const totalNodes = countNodes(tree);

    console.log(`✅ Hiérarchie construite: ${totalNodes} nœuds`);

    res.json({
      success: true,
      count: totalNodes,
      data: {
        categories: tree
      }
    });

  } catch (error) {
    console.error('❌ Erreur getCategoriesHierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la hiérarchie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Récupérer une catégorie par slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeChildren = 'true' } = req.query;

    console.log(`🔍 Recherche catégorie: ${slug}`);

    const category = await Category.findBySlug(
      slug, 
      includeChildren === 'true'
    );

    if (!category) {
      console.log(`❌ Catégorie non trouvée: ${slug}`);
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Récupérer le fil d'Ariane
    const breadcrumb = await Category.getBreadcrumb(category.id);

    console.log(`✅ Catégorie trouvée: ${category.nameAr || category.name}`);

    res.json({
      success: true,
      data: {
        category: {
          ...category,
          breadcrumb
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur getCategoryBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Récupérer les produits d'une catégorie
 * @route   GET /api/categories/:slug/products
 * @access  Public
 */
exports.getCategoryProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      page = 1, 
      limit = 12,
      includeSubcategories = 'true',
      sort = 'newest'
    } = req.query;

    console.log(`🛍️ Produits de la catégorie: ${slug}`);

    const category = await Category.findBySlug(slug, includeSubcategories === 'true');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Récupérer tous les slugs de la catégorie et ses sous-catégories
    let categorySlugs = [slug];
    
    if (includeSubcategories === 'true' && category.children) {
      const collectSlugs = (children) => {
        children.forEach(child => {
          categorySlugs.push(child.slug);
          if (child.children) {
            collectSlugs(child.children);
          }
        });
      };
      collectSlugs(category.children);
    }

    console.log(`🔍 Recherche dans ${categorySlugs.length} catégorie(s):`, categorySlugs);

    const db = require('../config/database');
    
    // Construire la requête
    const placeholders = categorySlugs.map(() => '?').join(',');
    let sql = `
      SELECT p.*, 
        u.name as vendorName, 
        u.avatar as vendorAvatar,
        u.id as vendorId,
        v.shopName,
        v.verified as vendorVerified
      FROM posts p
      LEFT JOIN users u ON p.userId = u.id
      LEFT JOIN vendors v ON u.id = v.userId
      WHERE p.category IN (${placeholders})
        AND p.status = 'approved'
    `;

    // Tri
    switch (sort) {
      case 'price-asc':
        sql += ' ORDER BY CAST(p.price AS DECIMAL) ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY CAST(p.price AS DECIMAL) DESC';
        break;
      case 'popular':
        sql += ' ORDER BY p.likesCount DESC';
        break;
      case 'oldest':
        sql += ' ORDER BY p.createdAt ASC';
        break;
      default: // newest
        sql += ' ORDER BY p.createdAt DESC';
    }

    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;

    const params = [...categorySlugs, parseInt(limit), parseInt(offset)];
    const products = await db.all(sql, params);

    // Compter le total
    const countSql = `
      SELECT COUNT(*) as total
      FROM posts
      WHERE category IN (${placeholders})
        AND status = 'approved'
    `;
    const countResult = await db.get(countSql, categorySlugs);
    const total = countResult ? countResult.total : 0;

    console.log(`✅ ${products.length} produits trouvés (total: ${total})`);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        category,
        products: products.map(p => ({
          ...p,
          vendorName: p.vendorName || p.shopName || 'Artisan',
          vendorAvatar: p.vendorAvatar || null,
          vendorVerified: p.vendorVerified === 1
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erreur getCategoryProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le slug sont requis'
      });
    }

    // Vérifier l'unicité du slug
    const existingCategory = await Category.slugExists(slug);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ce slug est déjà utilisé'
      });
    }

    // Vérifier le parent si spécifié
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'La catégorie parente spécifiée n\'existe pas'
        });
      }
    }

    const category = await Category.create({
      name,
      nameAr: nameAr || name,
      nameFr: nameFr || name,
      slug,
      icon: icon || Category.getDefaultIcon(slug),
      imageUrl: imageUrl || Category.getDefaultImage(slug),
      description,
      parentId,
      sortOrder: sortOrder || 0
    });

    console.log(`✅ Catégorie créée: ${category.nameAr || category.name} (ID: ${category.id})`);

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Erreur createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Vérifier l'existence
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Vérifier l'unicité du slug si modifié
    if (updates.slug && updates.slug !== existingCategory.slug) {
      const slugExists = await Category.slugExists(updates.slug, id);
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug est déjà utilisé par une autre catégorie'
        });
      }
    }

    // Empêcher la suppression du parent si des enfants existent
    if (updates.parentId === null && existingCategory.parentId) {
      const children = await Category.getChildren(id);
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de transformer en catégorie principale : ${children.length} sous-catégorie(s) existante(s)`
        });
      }
    }

    const category = await Category.update(id, updates);

    console.log(`✅ Catégorie mise à jour: ${category.nameAr || category.name}`);

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Erreur updateCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { force = 'false' } = req.query;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Vérifications avant suppression
    const children = await Category.getChildren(id);
    const productCount = category.productsCount || 0;

    if (force !== 'true') {
      if (children.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer : ${children.length} sous-catégorie(s) existante(s). Utilisez ?force=true pour forcer.`,
          childrenCount: children.length,
          children: children.map(c => ({ id: c.id, name: c.nameAr || c.name }))
        });
      }

      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer : ${productCount} produit(s) associé(s)`,
          productCount
        });
      }
    }

    // Suppression forcée : déplacer les enfants au niveau parent
    if (force === 'true' && children.length > 0) {
      const parentId = category.parentId || null;
      for (const child of children) {
        await Category.update(child.id, { parentId });
      }
    }

    await Category.delete(id);

    console.log(`🗑️ Catégorie supprimée: ${category.nameAr || category.name} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Déplacer une catégorie (changer son parent)
 * @route   PATCH /api/admin/categories/:id/move
 * @access  Private/Admin
 */
exports.moveCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId } = req.body;

    const category = await Category.moveCategory(id, newParentId || null);

    console.log(`📦 Catégorie déplacée: ${category.nameAr || category.name}`);

    res.json({
      success: true,
      message: 'Catégorie déplacée avec succès',
      data: { category }
    });

  } catch (error) {
    console.error('❌ Erreur moveCategory:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du déplacement'
    });
  }
};

/**
 * @desc    Récupérer le fil d'Ariane d'une catégorie
 * @route   GET /api/categories/:id/breadcrumb
 * @access  Public
 */
exports.getBreadcrumb = async (req, res) => {
  try {
    const { id } = req.params;
    const breadcrumb = await Category.getBreadcrumb(id);

    res.json({
      success: true,
      data: { breadcrumb }
    });

  } catch (error) {
    console.error('❌ Erreur getBreadcrumb:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du fil d\'Ariane'
    });
  }
};