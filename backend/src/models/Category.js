// backend/src/models/Category.js
const db = require('./db');

const Category = {
  async create(categoryData) {
    const { name, nameAr, slug, icon, description, parentId, sortOrder } = categoryData;
    const sql = `
      INSERT INTO categories (name, nameAr, slug, icon, description, parentId, sortOrder, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const categoryId = await db.insert(sql, [
      name,
      nameAr || null,
      slug,
      icon || '📦',
      description || null,
      parentId || null,
      sortOrder || 0
    ]);
    return this.findById(categoryId);
  },

  async findById(id) {
    const sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productsCount
      FROM categories c
      WHERE c.id = ?
    `;
    return db.getOne(sql, [id]);
  },

  async findBySlug(slug) {
    const sql = 'SELECT id FROM categories WHERE slug = ?';
    const result = await db.getOne(sql, [slug]);
    return result ? this.findById(result.id) : null;
  },

  async getAll() {
    const sql = `
      SELECT c.*, 
             p.name as parentName,
             (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productsCount
      FROM categories c
      LEFT JOIN categories p ON c.parentId = p.id
      WHERE c.isActive = 1
      ORDER BY c.sortOrder, c.name
    `;
    return db.query(sql);
  },

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

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'nameAr', 'slug', 'icon', 'description', 'parentId', 'sortOrder', 'isActive'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async delete(id) {
    const hasSubs = await db.exists('SELECT 1 FROM categories WHERE parentId = ?', [id]);
    if (hasSubs) throw new Error('Impossible de supprimer une catégorie avec des sous-catégories');
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE categoryId = ?', [id]);
    if (hasProducts) throw new Error('Impossible de supprimer une catégorie avec des produits');
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  },

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

  async getTree() {
    const categories = await this.getAll();
    const map = {};
    categories.forEach(c => map[c.id] = { ...c, children: [] });
    const tree = [];
    categories.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c.id]);
      } else {
        tree.push(map[c.id]);
      }
    });
    return tree;
  }
};

module.exports = Category;