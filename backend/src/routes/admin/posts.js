const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../models/db');

// @desc    Get all posts
// @route   GET /api/v1/admin/posts
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT p.*, u.name as vendor_name, u.email as vendor_email
      FROM posts p
      LEFT JOIN users u ON p.vendorId = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const posts = await db.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM posts WHERE 1=1`;
    const countParams = [];
    
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    
    const totalResult = await db.query(countQuery, countParams);
    const total = totalResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur get posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des publications',
      error: error.message
    });
  }
});

// @desc    Get pending posts
// @route   GET /api/v1/admin/posts/pending
// @access  Private/Admin
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const posts = await db.query(
      `SELECT p.*, u.name as vendor_name, u.email as vendor_email
       FROM posts p
       LEFT JOIN users u ON p.vendorId = u.id
       WHERE p.status = 'pending'
       ORDER BY p.createdAt DESC`
    );
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('❌ Erreur get pending posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des publications en attente',
      error: error.message
    });
  }
});

// @desc    Approve post
// @route   PATCH /api/v1/admin/posts/:id/approve
// @access  Private/Admin
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const result = await db.update(
      `UPDATE posts SET status = 'approved', publishedAt = NOW() WHERE id = ?`,
      [req.params.id]
    );
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Publication approuvée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur approve post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de la publication',
      error: error.message
    });
  }
});

// @desc    Reject post
// @route   PATCH /api/v1/admin/posts/:id/reject
// @access  Private/Admin
router.patch('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const result = await db.update(
      `UPDATE posts SET status = 'rejected', adminNotes = ? WHERE id = ?`,
      [reason || 'Rejeté par l\'administrateur', req.params.id]
    );
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publication non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Publication rejetée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur reject post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de la publication',
      error: error.message
    });
  }
});

module.exports = router;