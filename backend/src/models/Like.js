// backend/src/models/Like.js
const db = require('./db');

const Like = {
  async add(userId, productId) {
    const sql = 'INSERT INTO likes (userId, productId) VALUES (?, ?)';
    await db.insert(sql, [userId, productId]);
    return { liked: true };
  },

  async remove(userId, productId) {
    const sql = 'DELETE FROM likes WHERE userId = ? AND productId = ?';
    await db.query(sql, [userId, productId]);
    return { liked: false };
  },

  async isLiked(userId, productId) {
    const sql = 'SELECT 1 FROM likes WHERE userId = ? AND productId = ?';
    const result = await db.getOne(sql, [userId, productId]);
    return !!result;
  },

  async countByProduct(productId) {
    const sql = 'SELECT COUNT(*) as count FROM likes WHERE productId = ?';
    const result = await db.getOne(sql, [productId]);
    return result?.count || 0;
  },

  async getUserLikes(userId) {
    const sql = `
      SELECT p.*, 
             (SELECT imageUrl FROM productImages WHERE productId = p.id LIMIT 1) as mainImage
      FROM likes l
      JOIN products p ON l.productId = p.id
      WHERE l.userId = ?
      ORDER BY l.createdAt DESC
    `;
    return db.query(sql, [userId]);
  },

  async deleteByProduct(productId) {
    await db.query('DELETE FROM likes WHERE productId = ?', [productId]);
  },

  async deleteByUser(userId) {
    await db.query('DELETE FROM likes WHERE userId = ?', [userId]);
  }
};

module.exports = Like;