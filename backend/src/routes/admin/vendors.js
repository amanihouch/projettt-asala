// backend/src/routes/admin/vendors.js - Version COMPLÈTE et CORRIGÉE
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../models/db');
const emailService = require('../../services/emailService');
const { deleteImage } = require('../../config/cloudinary');

// @desc    Get all vendors
// @route   GET /api/v1/admin/vendors
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar
      FROM vendors v
      LEFT JOIN users u ON v.userId = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status === 'approved') {
      query += ` AND v.status = 'approved' AND v.approved = 1`;
    } else if (status === 'pending') {
      query += ` AND v.status = 'pending' AND v.approved = 0`;
    } else if (status === 'rejected') {
      query += ` AND v.status = 'rejected'`;
    }
    
    query += ` ORDER BY v.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const vendors = await db.query(query, params);
    
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM vendors WHERE 1=1
      ${status === 'approved' ? "AND status = 'approved' AND approved = 1" : 
        status === 'pending' ? "AND status = 'pending' AND approved = 0" : 
        status === 'rejected' ? "AND status = 'rejected'" : ''}
    `);
    const total = totalResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur get vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des vendeurs',
      error: error.message
    });
  }
});

// @desc    Get vendor stats
// @route   GET /api/v1/admin/vendors/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const total = await db.getOne('SELECT COUNT(*) as count FROM vendors');
    const approved = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE approved = 1');
    const pending = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE approved = 0');
    const rejected = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE status = "rejected"');
    const verified = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE verified = 1');
    
    res.json({
      success: true,
      data: {
        total: total?.count || 0,
        approved: approved?.count || 0,
        pending: pending?.count || 0,
        rejected: rejected?.count || 0,
        verified: verified?.count || 0
      }
    });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Approve vendor
// @route   POST /api/v1/admin/vendors/:id/approve
// @access  Private/Admin
router.post('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log(`🔍 Tentative d'approbation du vendeur ID: ${vendorId}`);
    
    const vendor = await db.getOne(
      `SELECT v.*, u.id as userId, u.email, u.name 
       FROM vendors v 
       LEFT JOIN users u ON v.userId = u.id 
       WHERE v.id = ?`,
      [vendorId]
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }
    
    console.log('📦 Vendeur trouvé:', { 
      id: vendor.id, 
      shopName: vendor.shopName, 
      approved: vendor.approved,
      userId: vendor.userId,
      email: vendor.email
    });
    
    if (vendor.approved === 1) {
      return res.status(400).json({
        success: false,
        message: 'Ce vendeur est déjà approuvé'
      });
    }
    
    await db.update(
      `UPDATE vendors SET status = 'approved', approved = 1, approvedAt = NOW() WHERE id = ?`,
      [vendorId]
    );
    console.log('✅ Vendeur mis à jour dans la base');
    
    if (vendor.userId) {
      await db.update(
        `UPDATE users SET role = 'vendor' WHERE id = ?`,
        [vendor.userId]
      );
      console.log('✅ Rôle utilisateur mis à jour');
    }
    
    let emailSent = false;
    if (vendor.email) {
      try {
        const emailResult = await emailService.sendVendorApprovalEmail(
          vendor.email,
          vendor.name || vendor.shopName,
          vendor.shopName
        );
        emailSent = emailResult.success;
        console.log(`📧 Résultat envoi email: ${emailSent ? 'Succès' : 'Échec'}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError);
        emailSent = false;
      }
    }
    
    res.json({
      success: true,
      message: `Vendeur approuvé avec succès${emailSent ? ' et email envoyé' : ''}`,
      data: {
        vendorId: vendor.id,
        shopName: vendor.shopName,
        emailSent
      }
    });
  } catch (error) {
    console.error('❌ Erreur approve vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
      error: error.message
    });
  }
});

// @desc    Reject vendor
// @route   POST /api/v1/admin/vendors/:id/reject
// @access  Private/Admin
router.post('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { reason } = req.body;
    
    console.log(`🔍 Tentative de rejet du vendeur ID: ${vendorId}`);
    
    const vendor = await db.getOne(
      `SELECT v.*, u.id as userId, u.email, u.name 
       FROM vendors v 
       LEFT JOIN users u ON v.userId = u.id 
       WHERE v.id = ?`,
      [vendorId]
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }
    
    await db.update(
      `UPDATE vendors SET status = 'rejected', approved = 0, rejectionReason = ?, rejectedAt = NOW() WHERE id = ?`,
      [reason || 'Rejeté par l\'administrateur', vendorId]
    );
    console.log('✅ Vendeur mis à jour dans la base');
    
    let emailSent = false;
    if (vendor.email) {
      try {
        const emailResult = await emailService.sendVendorRejectionEmail(
          vendor.email,
          vendor.name || vendor.shopName,
          vendor.shopName,
          reason
        );
        emailSent = emailResult.success;
      } catch (emailError) {
        console.error('❌ Erreur envoi email de refus:', emailError);
        emailSent = false;
      }
    }
    
    res.json({
      success: true,
      message: `Vendeur rejeté avec succès${emailSent ? ' et email envoyé' : ''}`,
      data: {
        vendorId: vendor.id,
        shopName: vendor.shopName,
        emailSent
      }
    });
  } catch (error) {
    console.error('❌ Erreur reject vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet',
      error: error.message
    });
  }
});

// ==================== ROUTE DE SUPPRESSION (CORRIGÉE) ====================
// @desc    Delete vendor (permanent)
// @route   DELETE /api/v1/admin/vendors/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log(`🔍 Tentative de suppression du vendeur ID: ${vendorId}`);
    
    // Récupérer le vendeur
    const vendor = await db.getOne(
      `SELECT v.*, u.id as userId, u.email, u.name 
       FROM vendors v 
       LEFT JOIN users u ON v.userId = u.id 
       WHERE v.id = ?`,
      [vendorId]
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }
    
    console.log('📦 Suppression du vendeur:', vendor.shopName);
    
    // 1. Supprimer les followers
    await db.query('DELETE FROM followers WHERE vendor_id = ?', [vendorId]);
    console.log('✅ Followers supprimés');
    
    // 2. Supprimer les produits
    await db.query('DELETE FROM products WHERE vendorId = ?', [vendorId]);
    console.log('✅ Produits supprimés');
    
    // 3. Supprimer les posts et leurs likes
    await db.query('DELETE FROM post_likes WHERE postId IN (SELECT id FROM posts WHERE vendorId = ?)', [vendorId]);
    await db.query('DELETE FROM posts WHERE vendorId = ?', [vendorId]);
    console.log('✅ Posts supprimés');
    
    // 4. Supprimer les reels et leurs données associées (si existent)
    try {
      await db.query('DELETE FROM reel_likes WHERE reelId IN (SELECT id FROM reels WHERE vendorId = ?)', [vendorId]);
      await db.query('DELETE FROM reel_comments WHERE reelId IN (SELECT id FROM reels WHERE vendorId = ?)', [vendorId]);
      await db.query('DELETE FROM reels WHERE vendorId = ?', [vendorId]);
      console.log('✅ Reels supprimés');
    } catch(e) {
      console.log('ℹ️ Table reels non trouvée ou déjà supprimée');
    }
    
    // 5. Supprimer les commentaires (si existent)
    try {
      await db.query('DELETE FROM comments WHERE vendor_id = ?', [vendorId]);
      console.log('✅ Commentaires supprimés');
    } catch(e) {
      console.log('ℹ️ Table comments non trouvée');
    }
    
    // 6. Supprimer l'image de couverture de Cloudinary
    if (vendor.coverImage && vendor.coverImage.includes('cloudinary.com')) {
      await deleteImage(vendor.coverImage);
      console.log('✅ Cover image supprimée de Cloudinary');
    }
    
    // 7. Supprimer l'avatar de Cloudinary
    if (vendor.userAvatar && vendor.userAvatar.includes('cloudinary.com')) {
      await deleteImage(vendor.userAvatar);
      console.log('✅ Avatar supprimé de Cloudinary');
    }
    
    // 8. Supprimer le vendeur
    await db.query('DELETE FROM vendors WHERE id = ?', [vendorId]);
    console.log('✅ Vendeur supprimé de la base');
    
    // 9. Mettre à jour le rôle de l'utilisateur
    if (vendor.userId) {
      const otherVendors = await db.query('SELECT id FROM vendors WHERE userId = ?', [vendor.userId]);
      if (otherVendors.length === 0) {
        await db.update(`UPDATE users SET role = 'user' WHERE id = ?`, [vendor.userId]);
        console.log('✅ Rôle utilisateur mis à jour (vendor -> user)');
      }
    }
    
    res.json({
      success: true,
      message: `✅ Le vendeur "${vendor.shopName}" a été supprimé avec succès`,
      data: {
        vendorId: vendor.id,
        shopName: vendor.shopName
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur delete vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du vendeur: ' + error.message,
      error: error.message
    });
  }
});

module.exports = router;