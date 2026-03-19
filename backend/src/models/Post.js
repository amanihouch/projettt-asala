// backend/src/models/Post.js
const db = require('./db');

const Post = {
  // ===== CREATE =====
  async create(data) {
    console.log('📝 Post.create avec données:', data);
    
    // ✅ Vérifier que vendorId existe
    if (!data.vendorId) {
      const error = new Error('vendorId est requis');
      console.error('❌', error.message);
      throw error;
    }

    // ✅ Vérifier que le vendeur existe dans la base
    const vendorExists = await db.getOne('SELECT id FROM vendors WHERE id = ?', [data.vendorId]);
    if (!vendorExists) {
      const error = new Error(`Vendeur avec ID ${data.vendorId} non trouvé`);
      console.error('❌', error.message);
      throw error;
    }

    // ✅ Vérifier les champs obligatoires
    if (!data.productName) {
      const error = new Error('productName est requis');
      console.error('❌', error.message);
      throw error;
    }

    if (!data.price && data.price !== 0) {
      const error = new Error('price est requis');
      console.error('❌', error.message);
      throw error;
    }

    // ✅ Traitement des images
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

    // ✅ Traitement des couleurs
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

    const sql = `
      INSERT INTO posts (
        vendorId, productName, description, content, category,
        price, oldPrice, images, colors, quantity, unit, inStock, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      data.vendorId,
      data.productName,
      data.description || null,
      data.content || null,
      data.category || null,
      data.price,
      data.oldPrice || null,
      imagesJson,
      colorsJson,
      data.quantity ?? 1,
      data.unit || 'piece',
      data.inStock !== false ? 1 : 0,
      'pending'
    ];

    console.log('📦 Paramètres SQL:', params);
    
    try {
      const postId = await db.insert(sql, params);
      console.log('✅ Post créé avec ID:', postId);
      return this.findById(postId);
    } catch (error) {
      console.error('❌ Erreur SQL insert:', error);
      console.error('📝 SQL:', sql);
      console.error('📦 Params:', params);
      throw error;
    }
  },

  // ===== FIND BY ID =====
  async findById(id) {
    const sql = `
      SELECT 
        p.id,
        p.vendorId,
        p.productName,
        p.description,
        p.content,
        p.category,
        p.price,
        p.oldPrice,
        p.images,
        p.colors,
        p.quantity,
        p.unit,
        p.inStock,
        p.status,
        p.adminNotes,
        p.likes,
        p.commentsCount,
        p.publishedAt,
        p.createdAt,
        v.shopName,
        u.avatar AS vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.id = ?
    `;
    
    const post = await db.getOne(sql, [id]);
    if (post) {
      // ✅ Parser les images
      try {
        post.images = typeof post.images === 'string' 
          ? JSON.parse(post.images) 
          : (post.images || []);
      } catch {
        post.images = post.images ? [post.images] : [];
      }
      
      // ✅ Parser les couleurs
      try {
        post.colors = JSON.parse(post.colors || '[]');
      } catch {
        post.colors = [];
      }
      
      post.inStock = Boolean(post.inStock);
    }
    return post;
  },

  // ===== GET FEED (public, seulement approuvés) =====
  async getFeed(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT 
        p.id,
        p.productName,
        p.description,
        p.price,
        p.images,
        p.createdAt,
        v.shopName,
        v.id as vendorId
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT ${offset}, ${limit}
    `;
    
    const posts = await db.query(sql);
    
    // ✅ Parser les images pour chaque post
    posts.forEach(p => {
      try {
        p.images = typeof p.images === 'string' 
          ? JSON.parse(p.images) 
          : (p.images || []);
      } catch {
        p.images = p.images ? [p.images] : [];
      }
    });
    
    return posts;
  },

  // ===== GET PENDING (admin) =====
  async getPending(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        p.id,
        p.vendorId,
        p.productName,
        p.description,
        p.price,
        p.images,
        p.colors,
        p.category,
        p.quantity,
        p.unit,
        p.createdAt,
        v.shopName,
        u.avatar as vendorAvatar,
        u.name as userName,
        u.email as userEmail
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
      LIMIT ${offset}, ${limit}
    `;
    
    const posts = await db.query(sql);
    
    // ✅ Parser les images et couleurs
    posts.forEach(p => {
      try {
        p.images = typeof p.images === 'string' 
          ? JSON.parse(p.images) 
          : (p.images || []);
      } catch {
        p.images = p.images ? [p.images] : [];
      }
      
      try {
        p.colors = JSON.parse(p.colors || '[]');
      } catch {
        p.colors = [];
      }
    });
    
    return posts;
  },

  // ===== GET BY VENDOR =====
  async getByVendor(vendorId, includePending = false, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        p.id,
        p.productName,
        p.description,
        p.content,
        p.price,
        p.oldPrice,
        p.images,
        p.colors,
        p.quantity,
        p.unit,
        p.status,
        p.likes,
        p.commentsCount,
        p.createdAt,
        v.shopName,
        u.avatar AS vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.vendorId = ?
    `;
    
    if (!includePending) {
      sql += ` AND p.status = 'approved'`;
    }
    
    sql += ` ORDER BY p.createdAt DESC LIMIT ${offset}, ${limit}`;
    
    try {
      console.log('📝 SQL getByVendor:', sql);
      console.log('📦 Params:', [vendorId]);
      
      const posts = await db.query(sql, [vendorId]);
      
      // ✅ Parser les images et couleurs pour chaque post
      posts.forEach(p => {
        try {
          p.images = typeof p.images === 'string' 
            ? JSON.parse(p.images) 
            : (p.images || []);
        } catch {
          p.images = p.images ? [p.images] : [];
        }
        
        try {
          p.colors = JSON.parse(p.colors || '[]');
        } catch {
          p.colors = [];
        }
      });
      
      return posts;
    } catch (error) {
      console.error('❌ Erreur getByVendor:', error);
      return [];
    }
  },

  // ===== UPDATE =====
  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['productName', 'description', 'content', 'category', 'price', 'oldPrice', 'colors', 'quantity', 'unit', 'inStock'];
    
    for (const key of allowed) {
      if (data[key] !== undefined) {
        let val = data[key];
        if (key === 'colors') {
          val = JSON.stringify(val || []);
        }
        if (key === 'inStock') {
          val = val ? 1 : 0;
        }
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    
    // ✅ Traitement des images
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

  // ===== DELETE =====
  async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  },

  // ===== APPROVE =====
  async approve(id) {
    await db.query('UPDATE posts SET status = "approved", publishedAt = NOW() WHERE id = ?', [id]);
    return this.findById(id);
  },

  // ===== REJECT =====
  async reject(id, reason) {
    await db.query('UPDATE posts SET status = "rejected", adminNotes = ? WHERE id = ?', [reason, id]);
    return this.findById(id);
  },

  // ===== COUNT BY STATUS =====
  async countByStatus() {
    const sql = `SELECT status, COUNT(*) as count FROM posts GROUP BY status`;
    const rows = await db.query(sql);
    const stats = { pending: 0, approved: 0, rejected: 0 };
    rows.forEach(r => { stats[r.status] = r.count; });
    return stats;
  },

  // ===== TOGGLE LIKE =====
  async toggleLike(postId, userId) {
    const exists = await db.getOne('SELECT id FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId]);
    if (exists) {
      await db.query('DELETE FROM post_likes WHERE id = ?', [exists.id]);
      await db.query('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
      return { liked: false };
    } else {
      await db.insert('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      return { liked: true };
    }
  },

  // ===== ADD COMMENT =====
  async addComment(postId, userId, userName, userAvatar, comment) {
    const sql = 'INSERT INTO comments (postId, userId, userName, userAvatar, comment) VALUES (?, ?, ?, ?, ?)';
    const commentId = await db.insert(sql, [postId, userId, userName, userAvatar, comment]);
    await db.query('UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?', [postId]);
    return db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
  },

  // ===== GET COMMENTS =====
  async getComments(postId) {
    const sql = `
      SELECT c.*, u.name as userName, u.avatar as userAvatar
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC
    `;
    return db.query(sql, [postId]);
  }
};

module.exports = Post;