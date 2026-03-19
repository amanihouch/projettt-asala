// backend/src/models/Product.js
const db = require('./db');

const Product = {
  // Create product
  async create(productData) {
    const {
      vendor_id, name, description, price, old_price, category,
      colors, quantity, unit, in_stock, status, is_sponsored,
      is_featured, tags
    } = productData;

    const sql = `
      INSERT INTO products 
      (vendor_id, name, description, price, old_price, category, colors,
       quantity, unit, in_stock, status, is_sponsored, is_featured, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const productId = await db.insert(sql, [
      vendor_id, name, description, price, old_price || null, category,
      colors ? JSON.stringify(colors) : null,
      quantity || 1, unit || 'piece', in_stock !== false ? 1 : 0,
      status || 'pending', is_sponsored ? 1 : 0, is_featured ? 1 : 0,
      tags ? JSON.stringify(tags) : null
    ]);

    return this.findById(productId);
  },

  // Add product images
  async addImages(productId, images) {
    const values = images.map((url, index) => `(${productId}, '${url}', ${index})`).join(',');
    const sql = `INSERT INTO product_images (product_id, image_url, display_order) VALUES ${values}`;
    await db.query(sql);
  },

  // Find by ID
  async findById(id) {
    const sql = `
      SELECT p.*, 
             v.shop_name as vendor_name,
             u.name as vendor_user_name,
             u.avatar as vendor_avatar,
             (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as likes_count,
             (SELECT JSON_ARRAYAGG(image_url) FROM product_images WHERE product_id = p.id ORDER BY display_order) as images
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE p.id = ?
    `;
    const product = await db.getOne(sql, [id]);

    if (product) {
      // Parse JSON fields
      if (product.colors) product.colors = JSON.parse(product.colors);
      if (product.tags) product.tags = JSON.parse(product.tags);
      if (product.images) product.images = JSON.parse(product.images);

      // Format dates
      product.createdAt = product.created_at;
      product.updatedAt = product.updated_at;
      delete product.created_at;
      delete product.updated_at;
    }

    return product;
  },

  // Get all products
  async getAll({ page = 1, limit = 20, search = null, category = null, status = null, vendor = null }) {
    let sql = `
      SELECT p.*, 
             v.shop_name as vendor_name,
             (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as likes_count,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as main_image
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (vendor) {
      sql += ' AND p.vendor_id = ?';
      params.push(vendor);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await db.paginate(sql, params, page, limit);

    // Parse JSON fields
    result.data.forEach(product => {
      if (product.colors) product.colors = JSON.parse(product.colors);
      if (product.tags) product.tags = JSON.parse(product.tags);
      product.createdAt = product.created_at;
      product.updatedAt = product.updated_at;
      delete product.created_at;
      delete product.updated_at;
    });

    return result;
  },

  // Update product
  async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'name', 'description', 'price', 'old_price', 'category',
      'colors', 'quantity', 'unit', 'in_stock', 'status',
      'admin_notes', 'is_sponsored', 'is_featured', 'tags',
      'rating', 'reviews'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updates[key];
        if (key === 'colors' || key === 'tags') {
          value = JSON.stringify(value);
        }
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Update product images
  async updateImages(productId, images) {
    await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    
    if (images && images.length > 0) {
      const values = images.map((url, index) => `(${productId}, '${url}', ${index})`).join(',');
      const sql = `INSERT INTO product_images (product_id, image_url, display_order) VALUES ${values}`;
      await db.query(sql);
    }
  },

  // Approve product
  async approve(id) {
    await db.query('UPDATE products SET status = ? WHERE id = ?', ['approved', id]);
    return this.findById(id);
  },

  // Reject product
  async reject(id, reason) {
    await db.query('UPDATE products SET status = ?, admin_notes = ? WHERE id = ?', [
      'rejected', reason, id
    ]);
    return this.findById(id);
  },

  // Delete product
  async delete(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  },

  // Count products
  async count(status = null) {
    let sql = 'SELECT COUNT(*) as count FROM products';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    const result = await db.getOne(sql, params);
    return result?.count || 0;
  },

  // Increment views
  async incrementViews(id) {
    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
  },

  // Toggle like
  async toggleLike(userId, productId) {
    const exists = await db.exists(
      'SELECT 1 FROM likes WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (exists) {
      await db.query('DELETE FROM likes WHERE user_id = ? AND product_id = ?', [
        userId, productId
      ]);
      return { liked: false };
    } else {
      await db.insert('INSERT INTO likes (user_id, product_id) VALUES (?, ?)', [
        userId, productId
      ]);
      return { liked: true };
    }
  },

  // Check if user liked product
  async isLiked(userId, productId) {
    return db.exists(
      'SELECT 1 FROM likes WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
  },

  // Get category distribution
  async getCategoryDistribution() {
    const sql = `
      SELECT category, COUNT(*) as count
      FROM products
      WHERE status = 'approved'
      GROUP BY category
      ORDER BY count DESC
    `;
    return db.query(sql);
  }
};

module.exports = Product;