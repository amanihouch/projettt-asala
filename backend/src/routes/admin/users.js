const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../models/db');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // CORRECTION: Utiliser les colonnes qui existent dans la table users
    let query = `
      SELECT id, name, email, phone, role, isActive, avatar, address, createdAt, lastLogin
      FROM users
      WHERE 1=1
    `;
    const params = [];
    
    if (role && role !== 'all') {
      query += ` AND role = ?`;
      params.push(role);
    }
    
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const users = await db.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];
    
    if (role && role !== 'all') {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const totalResult = await db.query(countQuery, countParams);
    const total = totalResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur get users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des utilisateurs',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await db.getOne(
      `SELECT id, name, email, phone, role, isActive, avatar, address, createdAt, updatedAt, lastLogin
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Erreur get user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'utilisateur',
      error: error.message
    });
  }
});

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/v1/admin/users/:id/toggle-status
// @access  Private/Admin
router.patch('/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await db.getOne('SELECT isActive FROM users WHERE id = ?', [req.params.id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const newStatus = user.isActive === 1 ? 0 : 1;
    
    await db.update(
      `UPDATE users SET isActive = ? WHERE id = ?`,
      [newStatus, req.params.id]
    );
    
    res.json({
      success: true,
      message: `Utilisateur ${newStatus === 1 ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive: newStatus === 1 }
    });
  } catch (error) {
    console.error('❌ Erreur update user status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, address, role, isActive } = req.body;
    
    const user = await db.getOne('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    await db.update(
      `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, role = ?, isActive = ? WHERE id = ?`,
      [name, email, phone || null, address || null, role, isActive ? 1 : 0, req.params.id]
    );
    
    const updatedUser = await db.getOne(
      `SELECT id, name, email, phone, role, isActive, avatar, address, createdAt FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('❌ Erreur update user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await db.getOne('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Empêcher la suppression d'un admin par un autre admin
    if (user.role === 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer un autre administrateur'
      });
    }
    
    await db.update('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur delete user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

module.exports = router;