const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  // ===== MÉTHODES PRINCIPALES =====
  
  async create(userData) {
    const { name, email, password, phone, role = 'customer', avatar, address } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (name, email, password, phone, role, avatar, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      name, 
      email, 
      hashedPassword, 
      phone || null, 
      role, 
      avatar || null,
      address || null
    ]);
    
    const insertId = result.insertId;
    return this.findById(insertId);
  },

  async findById(id) {
    const sql = `
      SELECT id, name, email, phone, role, avatar, address, 
             isActive, lastLogin, createdAt, updatedAt
      FROM users WHERE id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  },

  async findByEmail(email) {
    const sql = `
      SELECT id, name, email, phone, role, avatar, address, 
             isActive, lastLogin, createdAt
      FROM users WHERE email = ?
    `;
    const results = await db.query(sql, [email]);
    return results[0] || null;
  },

  async findByEmailWithPassword(email) {
    const sql = `
      SELECT id, name, email, password, phone, role, avatar, address, isActive
      FROM users WHERE email = ?
    `;
    const results = await db.query(sql, [email]);
    return results[0] || null;
  },

  async findByPhone(phone) {
    const sql = `
      SELECT id, name, email, phone, role, avatar, address, isActive
      FROM users WHERE phone = ?
    `;
    const results = await db.query(sql, [phone]);
    return results[0] || null;
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'email', 'phone', 'avatar', 'address', 'isActive', 'lastLogin'];
    
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    return true;
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  // ===== GESTION DES TOKENS DE RÉINITIALISATION =====

  async setResetToken(email, token, expires) {
    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE email = ?',
      [token, expires, email]
    );
  },

  async findByResetToken(token) {
    const sql = `
      SELECT id, email, name 
      FROM users 
      WHERE reset_password_token = ? AND reset_password_expire > NOW()
    `;
    const results = await db.query(sql, [token]);
    return results[0] || null;
  },

  async clearResetToken(id) {
    await db.query(
      'UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?', 
      [id]
    );
  },

  // ===== WISHLIST =====

  async addToWishlist(userId, productId) {
    const sql = `
      INSERT INTO wishlist (userId, productId) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE createdAt = NOW()
    `;
    await db.query(sql, [userId, productId]);
    return true;
  },

  async removeFromWishlist(userId, productId) {
    const sql = 'DELETE FROM wishlist WHERE userId = ? AND productId = ?';
    await db.query(sql, [userId, productId]);
    return true;
  },

  async isInWishlist(userId, productId) {
    const sql = 'SELECT 1 FROM wishlist WHERE userId = ? AND productId = ?';
    const results = await db.query(sql, [userId, productId]);
    return results.length > 0;
  },

  async getWishlist(userId) {
    const sql = `
      SELECT p.*, w.createdAt as likedAt 
      FROM wishlist w
      JOIN products p ON w.productId = p.id
      WHERE w.userId = ?
      ORDER BY w.createdAt DESC
    `;
    return db.query(sql, [userId]);
  },

  // ===== PRODUCT LIKES (CORRIGÉ) =====

  async likeProduct(userId, productId) {
    const sql = `
      INSERT INTO product_likes (userId, productId) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE createdAt = NOW()
    `;
    await db.query(sql, [userId, productId]);
    return true;
  },

  async unlikeProduct(userId, productId) {
    const sql = 'DELETE FROM product_likes WHERE userId = ? AND productId = ?';
    await db.query(sql, [userId, productId]);
    return true;
  },

  async hasLikedProduct(userId, productId) {
    const sql = 'SELECT 1 FROM product_likes WHERE userId = ? AND productId = ?';
    const results = await db.query(sql, [userId, productId]);
    return results.length > 0;
  },

  async getProductLikes(userId) {
    // CORRECTION: Utiliser 'createdAt' au lieu de 'created_at'
    const sql = `
      SELECT p.*, pl.createdAt as likedAt 
      FROM product_likes pl
      JOIN products p ON pl.productId = p.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `;
    return db.query(sql, [userId]);
  },

  // ===== POST LIKES (CORRIGÉ) =====

  async likePost(userId, postId) {
    const sql = `
      INSERT INTO post_likes (userId, postId) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE createdAt = NOW()
    `;
    await db.query(sql, [userId, postId]);
    return true;
  },

  async unlikePost(userId, postId) {
    const sql = 'DELETE FROM post_likes WHERE userId = ? AND postId = ?';
    await db.query(sql, [userId, postId]);
    return true;
  },

  async hasLikedPost(userId, postId) {
    const sql = 'SELECT 1 FROM post_likes WHERE userId = ? AND postId = ?';
    const results = await db.query(sql, [userId, postId]);
    return results.length > 0;
  },

  async getPostLikes(userId) {
    // CORRECTION: Utiliser 'createdAt' au lieu de 'created_at'
    const sql = `
      SELECT p.*, pl.createdAt as likedAt 
      FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `;
    return db.query(sql, [userId]);
  },

  // ===== AVATAR =====

  async updateAvatar(id, avatarUrl) {
    return this.update(id, { avatar: avatarUrl });
  },

  // ===== STATISTIQUES ET ADMIN =====

  async getUserWithStats(id) {
    const user = await this.findById(id);
    if (!user) return null;
    
    const orderStats = await db.query(
      'SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal FROM orders WHERE userId = ?',
      [id]
    );
    
    const wishlistCount = await db.query(
      'SELECT COUNT(*) as count FROM wishlist WHERE userId = ?',
      [id]
    );
    
    const likesCount = await db.query(
      'SELECT COUNT(*) as count FROM product_likes WHERE userId = ?',
      [id]
    );
    
    return {
      ...user,
      ordersCount: orderStats[0]?.orderCount || 0,
      ordersTotal: orderStats[0]?.orderTotal || 0,
      wishlistCount: wishlistCount[0]?.count || 0,
      likesCount: likesCount[0]?.count || 0
    };
  },

  async getAll({ page = 1, limit = 20, search = null, role = null }) {
    let sql = `
      SELECT id, name, email, phone, role, avatar, address, isActive, createdAt
      FROM users
      WHERE 1=1
    `;
    const params = [];
    
    if (role && role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const users = await db.query(sql, params);
    
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (role && role !== 'all') {
      countSql += ' AND role = ?';
      countParams.push(role);
    }
    
    if (search) {
      countSql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s);
    }
    
    const countResult = await db.query(countSql, countParams);
    const total = countResult[0]?.total || 0;
    
    return {
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async delete(id) {
    const orders = await db.query('SELECT 1 FROM orders WHERE userId = ? LIMIT 1', [id]);
    if (orders.length > 0) {
      throw new Error('Impossible de supprimer un utilisateur avec des commandes');
    }
    
    await db.query('DELETE FROM wishlist WHERE userId = ?', [id]);
    await db.query('DELETE FROM product_likes WHERE userId = ?', [id]);
    await db.query('DELETE FROM post_likes WHERE userId = ?', [id]);
    await db.query('DELETE FROM phone_verifications WHERE user_id = ?', [id]);
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  },

  async count(role = null) {
    let sql = 'SELECT COUNT(*) as count FROM users';
    const params = [];
    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }
    const results = await db.query(sql, params);
    return results[0]?.count || 0;
  }
};

module.exports = User;