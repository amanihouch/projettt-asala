// backend/src/models/User.js
const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  // Create user
  async create(userData) {
    const { name, email, password, phone, role = 'customer', avatar } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (name, email, password, phone, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const userId = await db.insert(sql, [
      name,
      email,
      hashedPassword,
      phone || null,
      role,
      avatar || null
    ]);
    
    return this.findById(userId);
  },

  // Find by ID
  async findById(id) {
    const sql = `
      SELECT id, name, email, phone, role, avatar, is_active as isActive,
             email_verified as emailVerified, last_login as lastLogin,
             created_at as createdAt, updated_at as updatedAt
      FROM users WHERE id = ?
    `;
    return db.getOne(sql, [id]);
  },

  // Find by email
  async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password, phone, role, avatar, 
             is_active as isActive, email_verified as emailVerified,
             last_login as lastLogin, created_at as createdAt
      FROM users WHERE email = ?
    `;
    return db.getOne(sql, [email]);
  },

  // Find by email with password
  async findByEmailWithPassword(email) {
    const sql = `
      SELECT id, name, email, password, phone, role, avatar,
             is_active as isActive, email_verified as emailVerified
      FROM users WHERE email = ?
    `;
    return db.getOne(sql, [email]);
  },

  // Update user
  async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'email', 'phone', 'avatar', 'is_active', 'email_verified', 'last_login'];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Update password
  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(sql, [hashedPassword, id]);
    return true;
  },

  // Set reset token
  async setResetToken(email, token, expires) {
    const sql = `
      UPDATE users 
      SET reset_password_token = ?, reset_password_expire = ?
      WHERE email = ?
    `;
    await db.query(sql, [token, expires, email]);
  },

  // Find by reset token
  async findByResetToken(token) {
    const sql = `
      SELECT id, email, name 
      FROM users 
      WHERE reset_password_token = ? AND reset_password_expire > NOW()
    `;
    return db.getOne(sql, [token]);
  },

  // Clear reset token
  async clearResetToken(id) {
    const sql = 'UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?';
    await db.query(sql, [id]);
  },

  // Verify password
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  // Get all users (admin)
  async getAll({ page = 1, limit = 20, search = null, role = null }) {
    let sql = `
      SELECT id, name, email, phone, role, avatar, is_active as isActive,
             email_verified as emailVerified, created_at as createdAt
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
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC';

    return db.paginate(sql, params, page, limit);
  },

  // Get user with stats
  async getUserWithStats(id) {
    const user = await this.findById(id);
    if (!user) return null;

    // Get order stats
    const orderStats = await db.getOne(`
      SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal
      FROM orders WHERE user_id = ?
    `, [id]);

    return {
      ...user,
      ordersCount: orderStats?.orderCount || 0,
      ordersTotal: orderStats?.orderTotal || 0
    };
  },

  // Delete user
  async delete(id) {
    // Check if user has orders
    const hasOrders = await db.exists('SELECT 1 FROM orders WHERE user_id = ?', [id]);
    if (hasOrders) {
      throw new Error('Impossible de supprimer un utilisateur avec des commandes');
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  },

  // Count users
  async count(role = null) {
    let sql = 'SELECT COUNT(*) as count FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    const result = await db.getOne(sql, params);
    return result?.count || 0;
  }
};

module.exports = User;