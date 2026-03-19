const Post = require('../../models/Post');
const db = require('../../models/db');

// ===== GET ALL POSTS (admin) =====
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await db.query(`
      SELECT p.*, v.shopName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      ORDER BY p.createdAt DESC
    `);
    res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('❌ getAllPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET PENDING POSTS =====
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await db.query(`
      SELECT p.*, v.shopName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
    `);
    res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('❌ getPendingPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET POST STATS =====
exports.getPostsStats = async (req, res) => {
  try {
    const stats = await Post.countByStatus();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ getPostsStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== APPROVE POST =====
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.approve(req.params.id);
    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('❌ approvePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== REJECT POST =====
exports.rejectPost = async (req, res) => {
  try {
    const post = await Post.reject(req.params.id);
    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('❌ rejectPost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== DELETE POST =====
exports.deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ deletePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET POST BY ID (admin) =====
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('❌ getPostById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== UPDATE POST (admin) =====
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.update(req.params.id, req.body);
    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('❌ updatePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};