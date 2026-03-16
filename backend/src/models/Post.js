// backend/src/models/Post.js
const db = require('./db');

const Post = {
  // ===== CRÉER UN POST =====
  async create(postData) {
    try {
      const {
        vendorId, vendorName, vendorAvatar, vendorVerified,
        category, productName, description, content,
        price, oldPrice, colors, quantity, unit, inStock,
        images, status
      } = postData;

      if (!vendorId || !productName || !price) {
        throw new Error('vendorId, productName et price sont requis');
      }

      const sql = `
        INSERT INTO posts 
        (vendorId, vendorName, vendorAvatar, vendorVerified, category,
         productName, description, content, price, oldPrice, colors,
         quantity, unit, inStock, images, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        vendorId,
        vendorName || null,
        vendorAvatar || null,
        vendorVerified ? 1 : 0,
        category || null,
        productName,
        description || null,
        content || null,
        price,
        oldPrice || null,
        colors ? JSON.stringify(colors) : null,
        quantity || 1,
        unit || 'piece',
        inStock !== undefined ? (inStock ? 1 : 0) : 1,
        images ? JSON.stringify(images) : null,
        status || 'pending'
      ];

      const postId = await db.insert(sql, params);
      return this.findById(postId);
    } catch (error) {
      console.error('❌ Erreur create:', error);
      throw error;
    }
  },

  // ===== TROUVER UN POST PAR ID =====
  async findById(id) {
    try {
      const sql = `
        SELECT p.*, 
               (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount,
               v.shopName,
               u.name as userName, 
               u.avatar as userAvatar
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        WHERE p.id = ?
      `;
      const post = await db.getOne(sql, [id]);
      if (post) {
        try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
        try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      }
      return post;
    } catch (error) {
      console.error('❌ Erreur findById:', error);
      return null;
    }
  },

  // ===== RÉCUPÉRER LE FEED =====
  async getFeed({ page = 1, limit = 10 }) {
    try {
      const sql = `
        SELECT p.*, 
               v.shopName,
               (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        WHERE p.status = 'approved'
        ORDER BY p.createdAt DESC
      `;
      const result = await db.paginate(sql, [], page, limit);
      result.data.forEach(post => {
        try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
        try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      });
      return result;
    } catch (error) {
      console.error('❌ Erreur getFeed:', error);
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  },

  // ===== RÉCUPÉRER LES POSTS EN ATTENTE =====
  // Dans backend/src/models/Post.js - ajoutez cette méthode si elle manque

// ===== RÉCUPÉRER LES POSTS EN ATTENTE =====
async getPending() {
  try {
    const sql = `
      SELECT p.*, 
             v.shopName,
             u.name as userName, 
             u.email, 
             u.avatar as userAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
    `;
    const posts = await db.query(sql);
    
    // Parser les JSON
    posts.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });
    
    return posts;
  } catch (error) {
    console.error('❌ Erreur getPending:', error);
    return [];
  }
},

  // ===== RÉCUPÉRER LES POSTS PAR STATUT =====
  async getByStatus(status, { page = 1, limit = 20 }) {
    try {
      const sql = `
        SELECT p.*, 
               v.shopName,
               u.name as userName, 
               u.email, 
               u.avatar as userAvatar
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        WHERE p.status = ?
        ORDER BY p.createdAt DESC
      `;
      const result = await db.paginate(sql, [status], page, limit);
      result.data.forEach(post => {
        try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
        try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      });
      return result;
    } catch (error) {
      console.error('❌ Erreur getByStatus:', error);
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  },

  // ===== RÉCUPÉRER LES POSTS D'UN VENDEUR =====
  async getByVendor(vendorId, { page = 1, limit = 20, includePending = false }) {
    try {
      let sql = `
        SELECT p.*, 
               v.shopName,
               u.name as userName
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        WHERE p.vendorId = ?
      `;
      if (!includePending) {
        sql += ' AND p.status = "approved"';
      }
      sql += ' ORDER BY p.createdAt DESC';
      
      const result = await db.paginate(sql, [vendorId], page, limit);
      result.data.forEach(post => {
        try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
        try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      });
      return result;
    } catch (error) {
      console.error('❌ Erreur getByVendor:', error);
      return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
    }
  },

  // ===== METTRE À JOUR UN POST =====
  async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      
      const allowedFields = [
        'category', 'productName', 'description', 'content',
        'price', 'oldPrice', 'colors', 'quantity', 'unit',
        'inStock', 'images', 'status', 'adminNotes', 'rejectionReason'
      ];
      
      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          let value = updates[key];
          if (key === 'colors' || key === 'images') {
            value = JSON.stringify(value);
          }
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) return null;
      
      values.push(id);
      const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
      await db.query(sql, values);
      return this.findById(id);
    } catch (error) {
      console.error('❌ Erreur update:', error);
      return null;
    }
  },

  // ===== APPROUVER UN POST =====
  async approve(id) {
    try {
      await db.query(
        'UPDATE posts SET status = ?, publishedAt = NOW() WHERE id = ?',
        ['approved', id]
      );
      return this.findById(id);
    } catch (error) {
      console.error('❌ Erreur approve:', error);
      return null;
    }
  },

  // ===== REJETER UN POST =====
  async reject(id, reason) {
    try {
      await db.query(
        'UPDATE posts SET status = ?, rejectionReason = ?, rejectedAt = NOW() WHERE id = ?',
        ['rejected', reason || null, id]
      );
      return this.findById(id);
    } catch (error) {
      console.error('❌ Erreur reject:', error);
      return null;
    }
  },

  // ===== SUPPRIMER UN POST =====
  async delete(id) {
    try {
      await db.query('DELETE FROM posts WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('❌ Erreur delete:', error);
      return false;
    }
  },

  // ===== AJOUTER UN COMMENTAIRE =====
  async addComment(postId, userId, userName, userAvatar, comment) {
    try {
      const sql = `
        INSERT INTO comments (postId, userId, userName, userAvatar, comment)
        VALUES (?, ?, ?, ?, ?)
      `;
      const commentId = await db.insert(sql, [postId, userId, userName, userAvatar, comment]);
      await db.query('UPDATE posts SET comments = comments + 1 WHERE id = ?', [postId]);
      return db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
    } catch (error) {
      console.error('❌ Erreur addComment:', error);
      return null;
    }
  },

  // ===== SUPPRIMER UN COMMENTAIRE =====
  async deleteComment(commentId) {
    try {
      const comment = await db.getOne('SELECT postId FROM comments WHERE id = ?', [commentId]);
      if (!comment) return false;
      await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
      await db.query('UPDATE posts SET comments = comments - 1 WHERE id = ?', [comment.postId]);
      return true;
    } catch (error) {
      console.error('❌ Erreur deleteComment:', error);
      return false;
    }
  },

  // ===== RÉCUPÉRER LES COMMENTAIRES =====
  async getComments(postId) {
    try {
      const sql = `
        SELECT c.*, u.name as userName, u.avatar as userAvatar
        FROM comments c
        LEFT JOIN users u ON c.userId = u.id
        WHERE c.postId = ?
        ORDER BY c.createdAt DESC
      `;
      return db.query(sql, [postId]);
    } catch (error) {
      console.error('❌ Erreur getComments:', error);
      return [];
    }
  },

  // ===== COMPTER LES POSTS PAR STATUT =====
  async countByStatus() {
    try {
      const sql = `SELECT status, COUNT(*) as count FROM posts GROUP BY status`;
      const results = await db.query(sql);
      
      const counts = { pending: 0, approved: 0, rejected: 0 };
      
      if (Array.isArray(results)) {
        results.forEach(r => {
          const count = parseInt(r.count) || 0;
          if (r.status === 'pending') counts.pending = count;
          else if (r.status === 'approved') counts.approved = count;
          else if (r.status === 'rejected') counts.rejected = count;
        });
      }
      
      return counts;
    } catch (error) {
      console.error('❌ Erreur countByStatus:', error);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  },

  // ===== RÉCUPÉRER LES POSTS RÉCENTS (VERSION CORRIGÉE) =====
  async getRecent(limit = 5) {
    try {
      let limitInt = parseInt(limit);

      if (isNaN(limitInt) || limitInt <= 0) {
        console.warn('⚠️ Limit invalide, utilisation de 5 par défaut');
        limitInt = 5;
      }

      const sql = `
        SELECT p.*, 
               v.shopName,
               u.name as userName
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        ORDER BY p.createdAt DESC
        LIMIT ${limitInt}
      `;

      console.log('📝 SQL getRecent limit:', limitInt);

      const results = await db.query(sql);
      return results;

    } catch (error) {
      console.error('❌ Erreur getRecent:', error);
      return [];
    }
  }
};

module.exports = Post;