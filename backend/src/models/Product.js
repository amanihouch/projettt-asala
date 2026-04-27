// backend/src/models/Product.js
const db = require('./db');

const Product = {
  async create(productData) {
    const {
      vendorId, name, description, price, oldPrice, categoryId,
      colors, quantity, unit, inStock, status, isSponsored,
      isFeatured, tags
    } = productData;

    const sql = `
      INSERT INTO products 
      (vendorId, name, description, price, oldPrice, categoryId, colors,
       quantity, unit, inStock, status, isSponsored, isFeatured, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const productId = await db.insert(sql, [
      vendorId, name, description, price, oldPrice || null, categoryId,
      colors ? JSON.stringify(colors) : null,
      quantity || 1, unit || 'piece', inStock !== false ? 1 : 0,
      status || 'pending', isSponsored ? 1 : 0, isFeatured ? 1 : 0,
      tags ? JSON.stringify(tags) : null
    ]);
    return this.findById(productId);
  },

  async addImages(productId, images) {
    const values = images.map((url, index) => `(${productId}, '${url.replace(/'/g, "\\'")}', ${index})`).join(',');
    const sql = `INSERT INTO productImages (productId, imageUrl, displayOrder) VALUES ${values}`;
    await db.query(sql);
  },

  async findById(id) {
    const sql = `
      SELECT p.*, 
             v.shopName as vendorName,
             u.name as vendorUserName,
             u.avatar as vendorAvatar,
             (SELECT COUNT(*) FROM likes WHERE productId = p.id) as likesCount,
             (SELECT COUNT(*) FROM comments WHERE productId = p.id) as commentsCount,
             (SELECT JSON_ARRAYAGG(imageUrl) FROM productImages WHERE productId = p.id ORDER BY displayOrder) as images
      FROM products p
      JOIN vendors v ON p.vendorId = v.id
      JOIN users u ON v.userId = u.id
      WHERE p.id = ?
    `;
    const product = await db.getOne(sql, [id]);
    if (product) {
      try { product.colors = JSON.parse(product.colors); } catch { product.colors = []; }
      try { product.tags = JSON.parse(product.tags); } catch { product.tags = []; }
      try { product.images = JSON.parse(product.images); } catch { product.images = []; }
    }
    return product;
  },

  async getAll({ page = 1, limit = 20, search = null, categoryId = null, status = null, vendorId = null }) {
    let sql = `
      SELECT p.*, 
             v.shopName as vendorName,
             (SELECT COUNT(*) FROM likes WHERE productId = p.id) as likesCount,
             (SELECT COUNT(*) FROM comments WHERE productId = p.id) as commentsCount,
             (SELECT imageUrl FROM productImages WHERE productId = p.id ORDER BY displayOrder LIMIT 1) as mainImage
      FROM products p
      JOIN vendors v ON p.vendorId = v.id
      WHERE 1=1
    `;
    const params = [];
    if (categoryId) { sql += ' AND p.categoryId = ?'; params.push(categoryId); }
    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    if (vendorId) { sql += ' AND p.vendorId = ?'; params.push(vendorId); }
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }
    sql += ' ORDER BY p.createdAt DESC';
    const result = await db.paginate(sql, params, page, limit);
    result.data.forEach(product => {
      try { product.colors = JSON.parse(product.colors); } catch { product.colors = []; }
      try { product.tags = JSON.parse(product.tags); } catch { product.tags = []; }
    });
    return result;
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = [
      'name', 'description', 'price', 'oldPrice', 'categoryId',
      'colors', 'quantity', 'unit', 'inStock', 'status',
      'adminNotes', 'isSponsored', 'isFeatured', 'tags',
      'rating', 'reviewsCount'
    ];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        let value = updates[key];
        if (key === 'colors' || key === 'tags') value = JSON.stringify(value);
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async updateImages(productId, images) {
    await db.query('DELETE FROM productImages WHERE productId = ?', [productId]);
    if (images && images.length > 0) {
      const values = images.map((url, index) => `(${productId}, '${url.replace(/'/g, "\\'")}', ${index})`).join(',');
      const sql = `INSERT INTO productImages (productId, imageUrl, displayOrder) VALUES ${values}`;
      await db.query(sql);
    }
  },

  async approve(id) {
    await db.query('UPDATE products SET status = ? WHERE id = ?', ['approved', id]);
    return this.findById(id);
  },

  async reject(id, reason) {
    await db.query('UPDATE products SET status = ?, adminNotes = ? WHERE id = ?', ['rejected', reason, id]);
    return this.findById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM productImages WHERE productId = ?', [id]);
    await db.query('DELETE FROM likes WHERE productId = ?', [id]);
    await db.query('DELETE FROM comments WHERE productId = ?', [id]);
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  },

  async count(status = null) {
    let sql = 'SELECT COUNT(*) as count FROM products';
    const params = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    const result = await db.getOne(sql, params);
    return result?.count || 0;
  },

  async incrementViews(id) {
    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
  },

  async toggleLike(userId, productId) {
    const exists = await db.exists('SELECT 1 FROM likes WHERE userId = ? AND productId = ?', [userId, productId]);
    if (exists) {
      await db.query('DELETE FROM likes WHERE userId = ? AND productId = ?', [userId, productId]);
      return { liked: false };
    } else {
      await db.insert('INSERT INTO likes (userId, productId) VALUES (?, ?)', [userId, productId]);
      return { liked: true };
    }
  },

  async isLiked(userId, productId) {
    return db.exists('SELECT 1 FROM likes WHERE userId = ? AND productId = ?', [userId, productId]);
  },

  async getCategoryDistribution() {
    const sql = `SELECT categoryId, COUNT(*) as count FROM products WHERE status = 'approved' GROUP BY categoryId ORDER BY count DESC`;
    return db.query(sql);
  },

  // ===== GESTION DES COMMENTAIRES =====
  async addComment(userId, productId, text, rating = null) {
    const sql = 'INSERT INTO comments (userId, productId, text, rating, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())';
    const commentId = await db.insert(sql, [userId, productId, text, rating]);
    const comment = await db.getOne(`SELECT c.*, u.name as userName, u.avatar as userAvatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?`, [commentId]);
    await this.updateProductRating(productId);
    return comment;
  },

  async getComments(productId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `SELECT c.*, u.name as userName, u.avatar as userAvatar FROM comments c JOIN users u ON c.userId = u.id WHERE c.productId = ? ORDER BY c.createdAt DESC LIMIT ? OFFSET ?`;
    const comments = await db.query(sql, [productId, limit, offset]);
    const total = await db.getOne('SELECT COUNT(*) as count FROM comments WHERE productId = ?', [productId]);
    return { comments, total: total?.count || 0 };
  },

  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await db.getOne('SELECT id, userId, productId FROM comments WHERE id = ?', [commentId]);
    if (!comment) return false;
    if (!isAdmin && comment.userId !== userId) return false;
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    await this.updateProductRating(comment.productId);
    return true;
  },

  async updateProductRating(productId) {
    const stats = await db.getOne('SELECT COUNT(*) as commentsCount, AVG(rating) as averageRating FROM comments WHERE productId = ? AND rating IS NOT NULL', [productId]);
    await db.query('UPDATE products SET reviewsCount = ?, rating = ? WHERE id = ?', [stats.commentsCount || 0, stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : 0, productId]);
  }
};

module.exports = Product;