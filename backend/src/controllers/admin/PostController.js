// backend/src/controllers/admin/PostController.js
const db = require('../../models/db');

// ========== GET ALL POSTS ==========
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await db.query('SELECT * FROM posts ORDER BY createdAt DESC');
    res.json({ success: true, data: { posts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== GET PENDING POSTS ==========
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await db.query(`
      SELECT p.*, v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
    `);
    res.json({ success: true, data: { posts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== APPROVE POST ==========
exports.approvePost = async (req, res) => {
  try {
    await db.query('UPDATE posts SET status = ? WHERE id = ?', ['approved', req.params.id]);
    res.json({ success: true, message: 'Post approuvé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== REJECT POST ==========
exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query('UPDATE posts SET status = ?, adminNotes = ? WHERE id = ?', ['rejected', reason, req.params.id]);
    res.json({ success: true, message: 'Post rejeté' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== EXPORT ==========
module.exports = {
  getAllPosts,
  getPendingPosts,
  approvePost,
  rejectPost
};