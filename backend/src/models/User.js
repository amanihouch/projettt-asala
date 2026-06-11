// backend/src/models/User.js - VERSION COMPLÈTE CORRIGÉE (COPY/PASTE)
const db = require('./db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = {
  // =============================================
  // MÉTHODES DE VÉRIFICATION EMAIL
  // =============================================

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  },

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  async saveVerificationToken(userId) {
    const rawToken = this.generateVerificationToken();
    const hashedToken = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const sql = `UPDATE users SET verification_token = ?, verification_token_expires = ?, last_verification_sent = NOW(), verification_attempts = verification_attempts + 1 WHERE id = ?`;
    await db.query(sql, [hashedToken, expiresAt, userId]);
    return rawToken;
  },

  async verifyEmail(token) {
    const hashedToken = this.hashToken(token);
    const user = await db.getOne(`SELECT id, name, email, verification_token, verification_token_expires, email_verified FROM users WHERE verification_token = ?`, [hashedToken]);
    if (!user) return { success: false, message: 'رابط التحقق غير صحيح', reason: 'invalid_token' };
    if (user.email_verified === 1) {
      await db.query(`UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE id = ?`, [user.id]);
      return { success: true, message: 'البريد الإلكتروني مؤكد بالفعل', alreadyVerified: true, user: { id: user.id, name: user.name, email: user.email } };
    }
    if (new Date(user.verification_token_expires) < new Date()) return { success: false, message: 'انتهت صلاحية رابط التحقق', reason: 'token_expired' };
    await db.query(`UPDATE users SET email_verified = 1, verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL WHERE id = ?`, [user.id]);
    console.log(`✅ Email vérifié: ${user.email}`);
    return { success: true, message: 'تم تأكيد البريد الإلكتروني بنجاح', user: { id: user.id, name: user.name, email: user.email } };
  },

  async isEmailVerified(email) {
    const user = await db.getOne('SELECT email_verified FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    return user ? user.email_verified === 1 : false;
  },

  async canResendVerification(userId) {
    const user = await db.getOne(`SELECT email_verified, verification_attempts, last_verification_sent FROM users WHERE id = ?`, [userId]);
    if (!user) return { canResend: false, reason: 'المستخدم غير موجود' };
    if (user.email_verified === 1) return { canResend: false, reason: 'البريد مؤكد بالفعل' };
    if (user.verification_attempts >= 5) return { canResend: false, reason: 'تم تجاوز الحد الأقصى' };
    if (user.last_verification_sent) {
      const diffSeconds = Math.floor((new Date() - new Date(user.last_verification_sent)) / 1000);
      if (diffSeconds < 60) return { canResend: false, reason: `يرجى الانتظار ${60 - diffSeconds} ثانية`, retryAfter: 60 - diffSeconds };
    }
    return { canResend: true };
  },

  async findByVerificationToken(token) {
    const hashedToken = this.hashToken(token);
    return db.getOne(`SELECT id, name, email, verification_token_expires FROM users WHERE verification_token = ?`, [hashedToken]);
  },

  // =============================================
  // MÉTHODES CRUD (COLONNES CORRIGÉES)
  // =============================================

  async create(userData) {
    const { name, email, password, phone, role = 'customer', avatar } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password, phone, role, avatar) VALUES (?, ?, ?, ?, ?, ?)`;
    const userId = await db.insert(sql, [name, email.toLowerCase().trim(), hashedPassword, phone || null, role, avatar || null]);
    return this.findById(userId);
  },

  async findById(id) {
    const sql = `SELECT id, name, email, phone, role, avatar, isActive, email_verified as emailVerified, lastLogin, createdAt, updatedAt FROM users WHERE id = ?`;
    return db.getOne(sql, [id]);
  },

  async findByEmail(email) {
    const sql = `SELECT id, name, email, password, phone, role, avatar, isActive, email_verified as emailVerified, lastLogin, createdAt FROM users WHERE email = ?`;
    return db.getOne(sql, [email.toLowerCase().trim()]);
  },

  async findByEmailWithPassword(email) {
    const sql = `SELECT id, name, email, password, phone, role, avatar, isActive, email_verified as emailVerified FROM users WHERE email = ?`;
    return db.getOne(sql, [email.toLowerCase().trim()]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'email', 'phone', 'avatar', 'isActive', 'email_verified', 'lastLogin'];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) { fields.push(`${key} = ?`); values.push(updates[key]); }
    });
    if (fields.length === 0) return null;
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(sql, [hashedPassword, id]);
    return true;
  },

  async setResetToken(email, token, expires) {
    const sql = `UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE email = ?`;
    await db.query(sql, [token, expires, email.toLowerCase().trim()]);
  },

  async findByResetToken(token) {
    const sql = `SELECT id, email, name FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW()`;
    return db.getOne(sql, [token]);
  },

  async clearResetToken(id) {
    const sql = `UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = ?`;
    await db.query(sql, [id]);
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  async getAll({ page = 1, limit = 20, search = null, role = null }) {
    let sql = `SELECT id, name, email, phone, role, avatar, isActive, email_verified as emailVerified, createdAt FROM users WHERE 1=1`;
    const params = [];
    if (role && role !== 'all') { sql += ' AND role = ?'; params.push(role); }
    if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
    sql += ' ORDER BY createdAt DESC';
    return db.paginate(sql, params, page, limit);
  },

  async getUserWithStats(id) {
    const user = await this.findById(id);
    if (!user) return null;
    const orderStats = await db.getOne(`SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal FROM orders WHERE user_id = ?`, [id]);
    return { ...user, ordersCount: orderStats?.orderCount || 0, ordersTotal: orderStats?.orderTotal || 0 };
  },

  async delete(id) {
    const hasOrders = await db.exists('SELECT 1 FROM orders WHERE user_id = ?', [id]);
    if (hasOrders) throw new Error('Impossible de supprimer un utilisateur avec des commandes');
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  },

  async count(role = null) {
    let sql = 'SELECT COUNT(*) as count FROM users';
    const params = [];
    if (role) { sql += ' WHERE role = ?'; params.push(role); }
    const result = await db.getOne(sql, params);
    return result?.count || 0;
  },

  async cleanExpiredTokens() {
    const sql = `UPDATE users SET verification_token = NULL, verification_token_expires = NULL WHERE verification_token_expires IS NOT NULL AND verification_token_expires < NOW()`;
    const result = await db.query(sql);
    console.log(`🧹 ${result.affectedRows || 0} tokens expirés nettoyés`);
    return result.affectedRows || 0;
  }
};

module.exports = User;