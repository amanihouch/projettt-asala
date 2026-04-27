// backend/src/models/Category.js - VERSION CORRIGÉE ET ROBUSTE

const pool = require('../config/database');

class Category {
  
  /**
   * Helper : exécute une requête et retourne TOUTES les lignes dans un tableau
   */
  static async query(sql, params = []) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      // Garantir que rows est toujours un tableau
      return Array.isArray(rows) ? rows : (rows ? [rows] : []);
    } finally {
      connection.release();
    }
  }

  /**
   * Helper : retourne la première ligne ou null
   */
  static async getOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Helper : exécute un INSERT et retourne l'ID
   */
  static async insert(sql, params = []) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(sql, params);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // ================================================================
  // CRUD PRINCIPAL
  // ================================================================

  static async create(categoryData) {
    const {
      name, nameAr, nameFr, slug, 
      icon = '📦', imageUrl = null, 
      description = null, parentId = null, 
      sortOrder = 0
    } = categoryData;

    // Vérifier le parent si spécifié
    if (parentId) {
      const parent = await this.getOne(
        'SELECT id FROM categories WHERE id = ? AND isActive = 1', 
        [parentId]
      );
      if (!parent) {
        throw new Error('La catégorie parente n\'existe pas');
      }
    }

    const id = await this.insert(
      `INSERT INTO categories (name, nameAr, nameFr, slug, icon, imageUrl, description, parentId, sortOrder) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, nameAr || name, nameFr || name, slug, icon, imageUrl, description, parentId, sortOrder]
    );

    return this.findById(id);
  }

  static async findById(id, includeChildren = false) {
    const cat = await this.getOne(
      `SELECT 
        c.*,
        p.name AS parentName,
        p.nameAr AS parentNameAr,
        (SELECT COUNT(*) FROM posts WHERE category = c.slug AND status = 'approved') AS productsCount
      FROM categories c
      LEFT JOIN categories p ON c.parentId = p.id
      WHERE c.id = ? AND c.isActive = 1`,
      [id]
    );

    if (!cat) return null;

    cat.productsCount = Number(cat.productsCount) || 0;
    cat.products_count = cat.productsCount;
    cat.imageUrl = cat.imageUrl || Category.getDefaultImage(cat.slug);
    cat.nameAr = cat.nameAr || cat.name;
    cat.nameFr = cat.nameFr || cat.name;
    cat.icon = cat.icon || Category.getDefaultIcon(cat.slug);

    if (includeChildren) {
      cat.children = await this.getChildren(cat.id);
    } else {
      cat.children = [];
    }

    return cat;
  }

  static async findBySlug(slug, includeChildren = false) {
    const cat = await this.getOne(
      `SELECT 
        c.*,
        p.name AS parentName,
        p.nameAr AS parentNameAr,
        (SELECT COUNT(*) FROM posts WHERE category = c.slug AND status = 'approved') AS productsCount
      FROM categories c
      LEFT JOIN categories p ON c.parentId = p.id
      WHERE c.slug = ? AND c.isActive = 1`,
      [slug]
    );

    if (!cat) return null;

    cat.productsCount = Number(cat.productsCount) || 0;
    cat.products_count = cat.productsCount;
    cat.imageUrl = cat.imageUrl || Category.getDefaultImage(cat.slug);
    cat.nameAr = cat.nameAr || cat.name;
    cat.nameFr = cat.nameFr || cat.name;
    cat.icon = cat.icon || Category.getDefaultIcon(cat.slug);

    if (includeChildren) {
      cat.children = await this.getChildren(cat.id);
    } else {
      cat.children = [];
    }

    return cat;
  }

  static async getAll(options = {}) {
    const { 
      includeChildren = false, 
      parentOnly = false, 
      activeOnly = true 
    } = options;

    let sql = `
      SELECT 
        c.*,
        p.name AS parentName,
        p.nameAr AS parentNameAr,
        (SELECT COUNT(*) FROM posts WHERE category = c.slug AND status = 'approved') AS productsCount
      FROM categories c
      LEFT JOIN categories p ON c.parentId = p.id
    `;

    const conditions = [];
    const params = [];

    if (activeOnly) {
      conditions.push('c.isActive = 1');
    }
    if (parentOnly) {
      conditions.push('c.parentId IS NULL');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY c.parentId IS NULL DESC, COALESCE(c.parentId, c.id), c.sortOrder ASC, c.name ASC';

    const rows = await this.query(sql, params);
    
    console.log(`📊 Catégories brutes récupérées: ${rows.length}`);

    // Enrichir les catégories
    const categories = rows.map(cat => ({
      ...cat,
      productsCount: Number(cat.productsCount) || 0,
      products_count: Number(cat.productsCount) || 0,
      imageUrl: cat.imageUrl || Category.getDefaultImage(cat.slug),
      nameAr: cat.nameAr || cat.name,
      nameFr: cat.nameFr || cat.name,
      icon: cat.icon || Category.getDefaultIcon(cat.slug),
      children: []
    }));

    if (includeChildren) {
      // Construire la hiérarchie
      const categoryMap = {};
      
      // Premier passage : créer la map
      categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
      });

      // Deuxième passage : organiser en arbre
      const rootCategories = [];
      
      categories.forEach(cat => {
        const categoryWithRef = categoryMap[cat.id];
        
        if (cat.parentId && categoryMap[cat.parentId]) {
          // C'est une sous-catégorie
          categoryMap[cat.parentId].children.push(categoryWithRef);
        } else {
          // C'est une catégorie racine
          rootCategories.push(categoryWithRef);
        }
      });

      console.log(`🌳 Hiérarchie construite: ${rootCategories.length} catégories racines`);

      return rootCategories;
    }

    return categories;
  }

  static async getChildren(parentId) {
    const rows = await this.query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM posts WHERE category = c.slug AND status = 'approved') AS productsCount
      FROM categories c
      WHERE c.parentId = ? AND c.isActive = 1
      ORDER BY c.sortOrder ASC, c.name ASC`,
      [parentId]
    );

    return rows.map(child => ({
      ...child,
      productsCount: Number(child.productsCount) || 0,
      products_count: Number(child.productsCount) || 0,
      imageUrl: child.imageUrl || Category.getDefaultImage(child.slug),
      nameAr: child.nameAr || child.name,
      nameFr: child.nameFr || child.name,
      icon: child.icon || Category.getDefaultIcon(child.slug),
      children: []
    }));
  }

  static async getTree() {
    return this.getAll({ includeChildren: true });
  }

  static async getParentCategories() {
    return this.getAll({ parentOnly: true, includeChildren: true });
  }

  static async update(id, updates) {
    const allowed = [
      'name', 'nameAr', 'nameFr', 'slug', 'icon', 
      'imageUrl', 'description', 'parentId', 'sortOrder', 'isActive'
    ];
    
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      throw new Error('Aucun champ à mettre à jour');
    }

    // Vérifications de sécurité pour parentId
    if (updates.parentId !== undefined) {
      if (updates.parentId === id) {
        throw new Error('Une catégorie ne peut pas être son propre parent');
      }
      
      if (updates.parentId !== null) {
        // Vérifier que le parent existe
        const parent = await this.getOne(
          'SELECT id FROM categories WHERE id = ? AND isActive = 1',
          [updates.parentId]
        );
        if (!parent) {
          throw new Error('La catégorie parente n\'existe pas');
        }

        // Vérifier la circularité
        const descendants = await this.getAllDescendants(id);
        if (descendants.includes(Number(updates.parentId))) {
          throw new Error('Impossible : le parent sélectionné est un descendant de cette catégorie');
        }
      }
    }

    values.push(id);
    
    await this.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Vérifier les sous-catégories
    const children = await this.getChildren(id);
    if (children.length > 0) {
      throw new Error(
        `Impossible de supprimer : cette catégorie contient ${children.length} sous-catégorie(s). ` +
        `Veuillez d'abord supprimer ou déplacer les sous-catégories.`
      );
    }

    // Vérifier les produits associés
    const cat = await this.findById(id);
    if (cat && cat.productsCount > 0) {
      throw new Error(
        `Impossible de supprimer : ${cat.productsCount} produit(s) sont associés à cette catégorie.`
      );
    }

    await this.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }

  static async slugExists(slug, excludeId = null) {
    let sql = 'SELECT id FROM categories WHERE slug = ?';
    const params = [slug];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const row = await this.getOne(sql, params);
    return !!row;
  }

  static async getProductCount(slug) {
    const row = await this.getOne(
      'SELECT COUNT(*) AS count FROM posts WHERE category = ? AND status = ?',
      [slug, 'approved']
    );
    return row ? Number(row.count) : 0;
  }

  // ================================================================
  // FONCTIONS HIÉRARCHIQUES
  // ================================================================

  static async getAllDescendants(categoryId) {
    const descendants = [];
    const toCheck = [categoryId];
    const maxDepth = 50;
    let depth = 0;

    while (toCheck.length > 0 && depth < maxDepth) {
      const currentId = toCheck.shift();
      const children = await this.query(
        'SELECT id FROM categories WHERE parentId = ? AND isActive = 1',
        [currentId]
      );

      for (const child of children) {
        descendants.push(child.id);
        toCheck.push(child.id);
      }
      
      depth++;
    }

    return descendants;
  }

  static async moveCategory(categoryId, newParentId) {
    return this.update(categoryId, { parentId: newParentId });
  }

  static async getBreadcrumb(categoryId) {
    const breadcrumb = [];
    let currentId = categoryId;
    const maxDepth = 10;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      const cat = await this.getOne(
        'SELECT id, name, nameAr, slug, parentId FROM categories WHERE id = ? AND isActive = 1',
        [currentId]
      );

      if (!cat) break;

      breadcrumb.unshift({
        id: cat.id,
        name: cat.nameAr || cat.name,
        slug: cat.slug
      });

      currentId = cat.parentId;
      depth++;
    }

    return breadcrumb;
  }

  // ================================================================
  // DÉFAUTS
  // ================================================================

  static getDefaultImage(slug) {
    const imageMap = {
      'perfumes': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/perfumes.jpg',
      'jewelry': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/jewelry.jpg',
      'clothing': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/clothing.jpg',
      'decor': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/decor.jpg',
      'textiles': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/textiles.jpg',
      'pottery': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/pottery.jpg',
      'beauty': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/beauty.jpg',
      'food': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/food.jpg',
      'default': 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/default.jpg'
    };
    return imageMap[slug] || imageMap['default'];
  }

  static getDefaultIcon(slug) {
    const iconMap = {
      'perfumes': '🌸',
      'oriental-perfumes': '🕌',
      'floral-perfumes': '🌺',
      'woody-perfumes': '🪵',
      'jewelry': '💍',
      'rings': '💍',
      'necklaces': '📿',
      'bracelets': '⛓️',
      'clothing': '👗',
      'traditional-clothing': '👘',
      'modern-clothing': '👔',
      'decor': '🏺',
      'pottery-decor': '🏺',
      'wall-art': '🖼️',
      'textiles': '🧵',
      'pottery': '🍽️',
      'beauty': '🧴',
      'food': '🍯',
      'default': '📦'
    };
    return iconMap[slug] || iconMap['default'];
  }
}

module.exports = Category;