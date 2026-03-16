// backend/src/controllers/admin/PostController.js
const Post = require('../../models/Post');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES POSTS =====
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    
    let result;
    if (status) {
      result = await Post.getByStatus(status, { page, limit });
    } else {
      const sql = `
        SELECT p.*, 
               v.shopName,
               u.name as userName, 
               u.email
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        ORDER BY p.createdAt DESC
      `;
      result = await db.paginate(sql, [], page, limit);
      result.data.forEach(post => {
        try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
        try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllPosts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES POSTS EN ATTENTE =====
const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.getPending();
    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('❌ Erreur admin getPendingPosts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES STATISTIQUES =====
const getPostStats = async (req, res) => {
  try {
    const counts = await Post.countByStatus();
    const recent = await Post.getRecent(5);
    
    res.json({
      success: true,
      data: { 
        counts, 
        recent 
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getPostStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN POST PAR ID =====
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur admin getPostById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== APPROUVER UN POST =====
const approvePost = async (req, res) => {
  try {
    const post = await Post.approve(req.params.id);
    res.json({
      success: true,
      message: 'Post approuvé avec succès',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur admin approvePost:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== REJETER UN POST =====
const rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.reject(req.params.id, reason || 'Non conforme');
    res.json({
      success: true,
      message: 'Post rejeté',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur admin rejectPost:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN POST =====
const deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deletePost:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPosts,
  getPendingPosts,
  getPostById,
  getPostStats,
  approvePost,
  rejectPost,
  deletePost
};