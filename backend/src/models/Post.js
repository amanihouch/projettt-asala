// backend/src/models/Post.js
const db = require('./db');

const Post = {
  async create(data) {
    console.log('📝 Post.create avec données:', data);
    
    if (!data.vendorId) {
      throw new Error('vendorId est requis');
    }

    const vendorInfo = await db.getOne(`
      SELECT v.id, v.shopName, u.avatar 
      FROM vendors v
      LEFT JOIN users u ON v.userId = u.id
      WHERE v.id = ?
    `, [data.vendorId]);

    if (!vendorInfo) {
      throw new Error(`Vendeur avec ID ${data.vendorId} non trouvé`);
    }

    let categoryId = data.categoryId || data.category;
    
    if (categoryId && isNaN(categoryId)) {
      const category = await db.getOne(
        'SELECT id FROM categories WHERE slug = ? OR nameAr = ? OR name = ?',
        [categoryId, categoryId, categoryId]
      );
      if (category) {
        categoryId = category.id;
      } else {
        categoryId = null;
      }
    }

    let imagesJson = '[]';
    if (data.images) {
      if (Array.isArray(data.images)) {
        imagesJson = JSON.stringify(data.images);
      } else if (typeof data.images === 'string') {
        try {
          JSON.parse(data.images);
          imagesJson = data.images;
        } catch {
          imagesJson = JSON.stringify([data.images]);
        }
      }
    }

    let colorsJson = '[]';
    if (data.colors) {
      if (Array.isArray(data.colors)) {
        colorsJson = JSON.stringify(data.colors);
      } else if (typeof data.colors === 'string') {
        try {
          JSON.parse(data.colors);
          colorsJson = data.colors;
        } catch {
          colorsJson = JSON.stringify([data.colors]);
        }
      }
    }

    let sizesJson = '[]';
    if (data.sizes) {
      if (Array.isArray(data.sizes)) {
        sizesJson = JSON.stringify(data.sizes);
      } else if (typeof data.sizes === 'string') {
        try {
          JSON.parse(data.sizes);
          sizesJson = data.sizes;
        } catch {
          sizesJson = JSON.stringify([data.sizes]);
        }
      }
    }

    const sql = `
      INSERT INTO posts (
        vendorId, vendorName, vendorAvatar, vendorVerified,
        productName, description, content, categoryId,
        price, oldPrice, images, colors, sizes,
        quantity, unit, inStock, status,
        hasColors, hasShipping, shippingCost, shippingTime, stockStatus,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const params = [
      data.vendorId,
      vendorInfo.shopName || 'Vendeur',
      vendorInfo.avatar || null,
      0,
      data.productName,
      data.description || null,
      data.content || null,
      categoryId,
      data.price,
      data.oldPrice || null,
      imagesJson,
      colorsJson,
      sizesJson,
      data.quantity ?? 1,
      data.unit || 'piece',
      data.inStock !== false ? 1 : 0,
      data.status || 'pending',
      data.hasColors ? 1 : 0,
      data.hasShipping ? 1 : 0,
      data.shippingCost || null,
      data.shippingTime || null,
      data.stockStatus || 'in_stock'
    ];

    try {
      const postId = await db.insert(sql, params);
      console.log('✅ Post créé avec ID:', postId, 'CategoryId:', categoryId);
      return this.findById(postId);
    } catch (error) {
      console.error('❌ Erreur SQL insert:', error);
      throw error;
    }
  },

  async findById(id) {
    const sql = `
      SELECT 
        p.id, p.vendorId, p.productName, p.description, p.content, p.categoryId,
        p.price, p.oldPrice, p.images, p.colors, p.sizes,
        p.quantity, p.unit, p.inStock, p.status, p.adminNotes,
        p.likes, p.commentsCount, p.publishedAt, p.createdAt,
        p.hasColors, p.hasShipping, p.shippingCost, p.shippingTime, p.stockStatus,
        v.shopName as vendorName, u.avatar AS vendorAvatar,
        c.id as catId, c.name as categoryName, c.nameAr as categoryNameAr, c.slug as categorySlug, c.icon as categoryIcon
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `;
    
    const post = await db.getOne(sql, [id]);
    if (post) {
      try {
        post.images = typeof post.images === 'string' ? JSON.parse(post.images) : (post.images || []);
      } catch {
        post.images = post.images ? [post.images] : [];
      }
      try {
        post.colors = JSON.parse(post.colors || '[]');
      } catch {
        post.colors = [];
      }
      try {
        post.sizes = JSON.parse(post.sizes || '[]');
      } catch {
        post.sizes = [];
      }
      post.inStock = Boolean(post.inStock);
      post.hasColors = Boolean(post.hasColors);
      post.hasShipping = Boolean(post.hasShipping);
    }
    return post;
  },

  async getFeed(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT 
        p.id, p.productName, p.description, p.price, p.images, p.createdAt,
        p.categoryId,
        v.shopName, v.id as vendorId
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const posts = await db.query(sql, [limit, offset]);
    
    posts.forEach(p => {
      try {
        p.images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
      } catch {
        p.images = p.images ? [p.images] : [];
      }
    });
    
    return posts;
  },

  async getPending(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        p.id, p.vendorId, p.productName, p.description, p.price, p.images, p.colors, p.sizes,
        p.categoryId, p.quantity, p.unit, p.createdAt, p.hasColors, p.hasShipping,
        p.shippingCost, p.shippingTime, p.stockStatus,
        v.shopName, u.avatar as vendorAvatar, u.name as userName, u.email as userEmail
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const posts = await db.query(sql, [limit, offset]);
    
    posts.forEach(p => {
      try {
        p.images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
      } catch {
        p.images = p.images ? [p.images] : [];
      }
      try {
        p.colors = JSON.parse(p.colors || '[]');
      } catch {
        p.colors = [];
      }
      try {
        p.sizes = JSON.parse(p.sizes || '[]');
      } catch {
        p.sizes = [];
      }
    });
    
    return posts;
  },

  async getByVendor(vendorId, includePending = false, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        p.id, p.productName, p.description, p.content, p.price, p.oldPrice,
        p.images, p.colors, p.sizes, p.quantity, p.unit, p.status,
        p.likes, p.commentsCount, p.createdAt, p.categoryId,
        v.shopName, u.avatar AS vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.vendorId = ?
    `;
    
    if (!includePending) {
      sql += ` AND p.status = 'approved'`;
    }
    
    sql += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    
    const posts = await db.query(sql, [vendorId, limit, offset]);
    
    posts.forEach(p => {
      try {
        p.images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
      } catch {
        p.images = p.images ? [p.images] : [];
      }
      try {
        p.colors = JSON.parse(p.colors || '[]');
      } catch {
        p.colors = [];
      }
      try {
        p.sizes = JSON.parse(p.sizes || '[]');
      } catch {
        p.sizes = [];
      }
    });
    
    return posts;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['productName', 'description', 'content', 'categoryId', 'price', 'oldPrice', 'colors', 'sizes', 'quantity', 'unit', 'inStock', 'hasColors', 'hasShipping', 'shippingCost', 'shippingTime', 'stockStatus'];
    
    for (const key of allowed) {
      if (data[key] !== undefined) {
        let val = data[key];
        if (key === 'colors') val = JSON.stringify(val || []);
        if (key === 'sizes') val = JSON.stringify(val || []);
        if (key === 'inStock') val = val ? 1 : 0;
        if (key === 'hasColors') val = val ? 1 : 0;
        if (key === 'hasShipping') val = val ? 1 : 0;
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    
    if (data.images !== undefined) {
      let imagesJson = '[]';
      if (Array.isArray(data.images)) {
        imagesJson = JSON.stringify(data.images);
      } else if (typeof data.images === 'string') {
        try {
          JSON.parse(data.images);
          imagesJson = data.images;
        } catch {
          imagesJson = JSON.stringify([data.images]);
        }
      }
      fields.push('images = ?');
      values.push(imagesJson);
    }
    
    if (fields.length === 0) return null;
    
    fields.push('status = ?');
    values.push('pending');
    values.push(id);
    
    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  },

  async approve(id) {
    await db.query('UPDATE posts SET status = "approved", publishedAt = NOW() WHERE id = ?', [id]);
    return this.findById(id);
  },

  async reject(id, reason) {
    await db.query('UPDATE posts SET status = "rejected", adminNotes = ? WHERE id = ?', [reason, id]);
    return this.findById(id);
  },

  async countByStatus() {
    const rows = await db.query('SELECT status, COUNT(*) as count FROM posts GROUP BY status');
    const stats = { pending: 0, approved: 0, rejected: 0 };
    rows.forEach(r => { stats[r.status] = r.count; });
    return stats;
  },

  async toggleLike(postId, userId) {
    const exists = await db.getOne('SELECT id FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId]);
    if (exists) {
      await db.query('DELETE FROM post_likes WHERE id = ?', [exists.id]);
      await db.query('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
      return { liked: false, likes: await this.getLikesCount(postId) };
    } else {
      await db.insert('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      return { liked: true, likes: await this.getLikesCount(postId) };
    }
  },

  async getLikesCount(postId) {
    const result = await db.getOne('SELECT likes FROM posts WHERE id = ?', [postId]);
    return result?.likes || 0;
  },

  async addComment(postId, userId, userName, userAvatar, comment) {
    const commentId = await db.insert(
      'INSERT INTO comments (postId, userId, userName, userAvatar, comment) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, userName, userAvatar, comment]
    );
    await db.query('UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?', [postId]);
    return db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
  },

  async getComments(postId) {
    return db.query(`
      SELECT c.*, u.name as userName, u.avatar as userAvatar
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC
    `, [postId]);
  }
};

module.exports = Post;