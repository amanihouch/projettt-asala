// backend/src/models/User.js
const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  async create(userData) {
    const { name, email, password, phone, role = 'customer', avatar } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (name, email, password, phone, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const userId = await db.insert(sql, [name, email, hashedPassword, phone || null, role, avatar || null]);
    return this.findById(userId);
  },

  async findById(id) {
    const sql = `
      SELECT id, name, email, phone, role, avatar, 
             isActive, lastLogin, createdAt, updatedAt
      FROM users WHERE id = ?
    `;
    return db.getOne(sql, [id]);
  },

  async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password, phone, role, avatar, 
             isActive, lastLogin, createdAt
      FROM users WHERE email = ?
    `;
    return db.getOne(sql, [email]);
  },

  async findByEmailWithPassword(email) {
    const sql = `
      SELECT id, name, email, password, phone, role, avatar, isActive
      FROM users WHERE email = ?
    `;
    return db.getOne(sql, [email]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'email', 'phone', 'avatar', 'isActive', 'lastLogin'];
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
    return db.getOne(sql, [token]);
  },

  async clearResetToken(id) {
    await db.query('UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?', [id]);
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  async getAll({ page = 1, limit = 20, search = null, role = null }) {
    let sql = `
      SELECT id, name, email, phone, role, avatar, isActive, createdAt
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
    return db.paginate(sql, params, page, limit);
  },

  async getUserWithStats(id) {
    const user = await this.findById(id);
    if (!user) return null;
    const orderStats = await db.getOne(
      'SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal FROM orders WHERE userId = ?',
      [id]
    );
    return { ...user, ordersCount: orderStats?.orderCount || 0, ordersTotal: orderStats?.orderTotal || 0 };
  },

  async delete(id) {
    const hasOrders = await db.exists('SELECT 1 FROM orders WHERE userId = ?', [id]);
    if (hasOrders) throw new Error('Impossible de supprimer un utilisateur avec des commandes');
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
    const result = await db.getOne(sql, params);
    return result?.count || 0;
  }
};

module.exports = User;