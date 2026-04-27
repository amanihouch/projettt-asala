// backend/src/models/Category.js
const db = require('./db');

const Category = {
  // Créer une catégorie
  async create(categoryData) {
    const { name, nameAr, slug, icon, description, parent_id, sortOrder } = categoryData;

    const sql = `
      INSERT INTO categories (name, nameAr, slug, icon, description, parent_id, sortOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const categoryId = await db.insert(sql, [
      name,
      nameAr || null,
      slug,
      icon || '📦',
      description || null,
      parent_id || null,
      sortOrder || 0
    ]);

    return this.findById(categoryId);
  },

  // Trouver par ID
  async findById(id) {
    const sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productsCount
      FROM categories c
      WHERE c.id = ?
    `;
    const category = await db.getOne(sql, [id]);

    if (category) {
      category.createdAt = category.createdAt;
      category.updatedAt = category.updatedAt;
    }

    return category;
  },

  // Trouver par slug
  async findBySlug(slug) {
    const sql = 'SELECT id FROM categories WHERE slug = ?';
    const result = await db.getOne(sql, [slug]);
    if (result) {
      return this.findById(result.id);
    }
    return null;
  },

  // Obtenir toutes les catégories
  async getAll() {
    const sql = `
      SELECT c.*, 
             p.name as parentName,
             (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productsCount
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.isActive = 1
      ORDER BY c.sortOrder, c.name
    `;
    return db.query(sql);
  },

  // Obtenir les catégories actives
  async getActive() {
    const sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productsCount
      FROM categories c
      WHERE c.isActive = 1
      ORDER BY c.sortOrder, c.name
    `;
    return db.query(sql);
  },

  // Mettre à jour une catégorie
  async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'name', 'nameAr', 'slug', 'icon', 'description',
      'parent_id', 'sortOrder', 'isActive'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Supprimer une catégorie
  async delete(id) {
    // Vérifier si la catégorie a des sous-catégories
    const hasSubs = await db.exists('SELECT 1 FROM categories WHERE parent_id = ?', [id]);
    if (hasSubs) {
      throw new Error('Impossible de supprimer une catégorie avec des sous-catégories');
    }

    // Vérifier si la catégorie a des produits
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE categoryId = ?', [id]);
    if (hasProducts) {
      throw new Error('Impossible de supprimer une catégorie avec des produits');
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  },

  // Vérifier si un slug existe
  async slugExists(slug, excludeId = null) {
    let sql = 'SELECT 1 FROM categories WHERE slug = ?';
    const params = [slug];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await db.getOne(sql, params);
    return !!result;
  },

  // Obtenir l'arborescence des catégories
  async getTree() {
    const categories = await this.getAll();
    
    const tree = [];
    const map = {};

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  }
};

module.exports = Category;