// backend/src/routes/admin.js - VERSION COMPLÈTE CORRIGÉE
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const db = require('../models/db');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const contactController = require('../controllers/contactController');

// Toutes les routes admin nécessitent authentification et rôle admin
router.use(protect, adminOnly);

// ============================================
// STATISTIQUES GÉNÉRALES
// ============================================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const customersCount = await User.countByRole('customer');
    const vendorsCount = await User.countByRole('vendor');
    const adminsCount = await User.countByRole('admin');
    const pendingVendors = await Vendor.countPending();
    
    const totalPosts = await db.getOne('SELECT COUNT(*) as total FROM posts');
    const pendingPosts = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "pending"');
    const approvedPosts = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "approved"');
    
    const totalOrders = await db.getOne('SELECT COUNT(*) as total FROM orders');
    const pendingOrders = await db.getOne('SELECT COUNT(*) as total FROM orders WHERE status = "pending"');
    const completedOrders = await db.getOne('SELECT COUNT(*) as total FROM orders WHERE status = "delivered"');
    const totalRevenue = await db.getOne('SELECT SUM(total) as total FROM orders WHERE status != "cancelled"');
    
    const unreadMessages = await db.getOne(`
      SELECT COUNT(*) as total FROM contact_messages WHERE status = 'pending' OR status = 'read'
    `);
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: customersCount,
          vendors: vendorsCount,
          admins: adminsCount,
          pendingVendors: pendingVendors
        },
        products: {
          total: totalPosts?.total || 0,
          pending: pendingPosts?.total || 0,
          approved: approvedPosts?.total || 0
        },
        orders: {
          total: totalOrders?.total || 0,
          pending: pendingOrders?.total || 0,
          completed: completedOrders?.total || 0,
          revenue: totalRevenue?.total || 0
        },
        contact: {
          unread: unreadMessages?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur stats admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LISTE COMPLÈTE DES VENDEURS (AVEC FILTRE STATUS)
// ============================================
router.get('/vendors', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', status = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];

    console.log('📋 Paramètres reçus:', { status, page, limit, search });

    let whereSql = '';
    
    // Filtre par statut (approved)
    if (status === 'pending') {
      whereSql = ' WHERE v.approved = 0';
      console.log('🔍 Filtre: vendeurs en attente (approved = 0)');
    } else if (status === 'approved') {
      whereSql = ' WHERE v.approved = 1';
      console.log('🔍 Filtre: vendeurs approuvés (approved = 1)');
    } else if (status === 'rejected') {
      whereSql = ' WHERE v.approved = 2';
      console.log('🔍 Filtre: vendeurs rejetés (approved = 2)');
    } else {
      console.log('🔍 Filtre: tous les vendeurs');
    }
    
    // Filtre par recherche
    if (search) {
      if (whereSql) {
        whereSql += ' AND (v.shopName LIKE ? OR u.name LIKE ? OR v.email LIKE ?)';
      } else {
        whereSql = ' WHERE (v.shopName LIKE ? OR u.name LIKE ? OR v.email LIKE ?)';
      }
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const sql = `
      SELECT 
        v.id,
        v.shopName,
        v.approved,
        v.status as vendorStatus,
        v.phone as vendorPhone,
        v.email as vendorEmail,
        v.createdAt,
        u.id as userId,
        u.name as userName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        vp.plain_password as password
      FROM vendors v
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN vendor_passwords vp ON vp.vendor_id = v.id
      ${whereSql}
      ORDER BY v.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const vendors = await db.query(sql, [...params, parseInt(limit), offset]);
    
    console.log(`✅ ${vendors.length} vendeurs trouvés`);
    
    // Compter le total
    let countSql = `SELECT COUNT(*) as total FROM vendors v LEFT JOIN users u ON v.userId = u.id`;
    let countParams = [...params];
    
    if (whereSql) {
      countSql += whereSql;
    }
    
    const countRow = await db.getOne(countSql, countParams);
    console.log(`📊 Total avec filtre: ${countRow?.total || 0}`);

    res.json({
      success: true,
      data: {
        data: vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow?.total || 0,
          pages: Math.ceil((countRow?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur liste vendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// VENDEURS EN ATTENTE - ROUTE SPÉCIFIQUE
// ============================================
router.get('/vendors/pending', async (req, res) => {
  try {
    console.log('📋 Route /vendors/pending appelée');
    
    const { page = 1, limit = 100, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    
    let whereSql = ' WHERE v.approved = 0';
    
    if (search) {
      whereSql += ' AND (v.shopName LIKE ? OR u.name LIKE ? OR v.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const vendors = await db.query(`
      SELECT 
        v.id,
        v.shopName,
        v.approved,
        v.status as vendorStatus,
        v.phone as vendorPhone,
        v.email as vendorEmail,
        v.createdAt,
        u.id as userId,
        u.name as userName,
        u.email as userEmail,
        u.phone as userPhone,
        u.avatar as userAvatar,
        vp.plain_password as password
      FROM vendors v
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN vendor_passwords vp ON vp.vendor_id = v.id
      ${whereSql}
      ORDER BY v.createdAt DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    // Compter le total
    let countSql = `SELECT COUNT(*) as total FROM vendors v LEFT JOIN users u ON v.userId = u.id WHERE v.approved = 0`;
    if (search) {
      countSql += ' AND (v.shopName LIKE ? OR u.name LIKE ? OR v.email LIKE ?)';
    }
    const countRow = await db.getOne(countSql, params);
    
    console.log(`✅ ${vendors.length} vendeurs en attente trouvés (total: ${countRow?.total || 0})`);
    
    res.json({
      success: true,
      data: {
        data: vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow?.total || 0,
          pages: Math.ceil((countRow?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur pending vendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STATISTIQUES VENDEURS
// ============================================
router.get('/vendors/stats', async (req, res) => {
  try {
    const total = await Vendor.count();
    const approved = await Vendor.countApproved();
    const pending = await Vendor.countPending();
    const rejected = await Vendor.countRejected();
    const verified = await Vendor.count(true);
    
    res.json({
      success: true,
      data: {
        total, 
        approved, 
        pending, 
        rejected, 
        verified,
        pendingPercentage: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
        approvedPercentage: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('❌ Erreur vendor stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// APPROUVER UN VENDEUR
// ============================================
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    if (vendor.approved === 1) {
      return res.status(400).json({ success: false, message: 'Vendeur déjà approuvé' });
    }
    
    await db.query('UPDATE vendors SET approved = 1, verified = 1, status = "approved" WHERE id = ?', [vendorId]);
    await db.query('UPDATE users SET role = "vendor" WHERE id = ?', [vendor.userId]);
    
    const updatedVendor = await Vendor.findById(vendorId);
    res.json({ success: true, message: 'Vendeur approuvé avec succès', data: { vendor: updatedVendor } });
  } catch (error) {
    console.error('❌ Erreur approve vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REJETER UN VENDEUR
// ============================================
router.put('/vendors/:id/reject', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { reason } = req.body;
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    
    await db.query('UPDATE vendors SET approved = 2, status = "rejected", rejectionReason = ? WHERE id = ?', [reason || 'Non spécifié', vendorId]);
    res.json({ success: true, message: 'Vendeur rejeté', data: { vendorId, reason } });
  } catch (error) {
    console.error('❌ Erreur reject vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RÉINITIALISER MOT DE PASSE VENDEUR
// ============================================
router.post('/vendors/:id/reset-password', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const vendor = await db.getOne(
      `SELECT v.id, v.userId, v.shopName, u.email
       FROM vendors v 
       LEFT JOIN users u ON v.userId = u.id
       WHERE v.id = ?`,
      [vendorId]
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }

    // Générer un mot de passe si non fourni
    const plainPassword = newPassword?.trim() ||
      Math.random().toString(36).slice(-4).toUpperCase() +
      Math.random().toString(36).slice(-4) +
      Math.floor(Math.random() * 90 + 10);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Mettre à jour le mot de passe hashé dans users
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, vendor.userId]);

    // Mettre à jour ou créer l'entrée dans vendor_passwords
    const existing = await db.getOne('SELECT id FROM vendor_passwords WHERE vendor_id = ?', [vendorId]);
    if (existing) {
      await db.query(
        'UPDATE vendor_passwords SET plain_password = ?, updated_at = NOW() WHERE vendor_id = ?',
        [plainPassword, vendorId]
      );
    } else {
      await db.query(
        'INSERT INTO vendor_passwords (vendor_id, user_id, plain_password) VALUES (?, ?, ?)',
        [vendorId, vendor.userId, plainPassword]
      );
    }

    console.log(`🔑 Mot de passe réinitialisé: vendeur ${vendorId} (${vendor.shopName})`);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data: { newPassword: plainPassword, vendorId, shopName: vendor.shopName }
    });
  } catch (error) {
    console.error('❌ Erreur reset password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// MESSAGES CONTACT
// ============================================
router.get('/contact/messages', contactController.getAdminMessages);
router.get('/contact/stats', contactController.getAdminStats);
router.get('/contact/messages/:id', contactController.getAdminMessageById);
router.put('/contact/messages/:id/read', contactController.markAsRead);
router.put('/contact/messages/:id/status', contactController.updateMessageStatus);
router.delete('/contact/messages/:id', contactController.deleteMessage);
router.post('/contact/reply', contactController.replyToMessage);

// ============================================
// POSTS APPROUVÉS
// ============================================
router.get('/posts/approved', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const posts = await db.query(`
      SELECT 
        p.id,
        p.vendorId,
        p.productName,
        p.description,
        p.price,
        p.images,
        p.status,
        p.publishedAt,
        p.createdAt,
        p.adminNotes,
        v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [limitNum, offset]);
    
    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total FROM posts WHERE status = 'approved'
    `);
    
    const total = totalResult?.total || 0;
    
    const formattedPosts = posts.map(post => {
      let images = [];
      if (post.images) {
        try {
          images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
        } catch(e) {
          images = [post.images];
        }
      }
      
      return {
        id: post.id,
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'Vendeur',
        productName: post.productName,
        description: post.description,
        price: parseFloat(post.price),
        images: images,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        adminNotes: post.adminNotes
      };
    });
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur approved posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POSTS EN ATTENTE
// ============================================
router.get('/posts/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const posts = await db.query(`
      SELECT 
        p.id,
        p.vendorId,
        p.productName,
        p.description,
        p.price,
        p.images,
        p.status,
        p.createdAt,
        v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [limitNum, offset]);
    
    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total FROM posts WHERE status = 'pending'
    `);
    
    const total = totalResult?.total || 0;
    
    const formattedPosts = posts.map(post => {
      let images = [];
      if (post.images) {
        try {
          images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
        } catch(e) {
          images = [post.images];
        }
      }
      
      return {
        id: post.id,
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'Vendeur',
        productName: post.productName,
        description: post.description,
        price: parseFloat(post.price),
        images: images,
        status: post.status,
        createdAt: post.createdAt
      };
    });
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur pending posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POSTS REJETÉS
// ============================================
router.get('/posts/rejected', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const posts = await db.query(`
      SELECT 
        p.id,
        p.vendorId,
        p.productName,
        p.description,
        p.price,
        p.images,
        p.status,
        p.createdAt,
        p.adminNotes,
        v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'rejected'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [limitNum, offset]);
    
    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total FROM posts WHERE status = 'rejected'
    `);
    
    const total = totalResult?.total || 0;
    
    const formattedPosts = posts.map(post => {
      let images = [];
      if (post.images) {
        try {
          images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
        } catch(e) {
          images = [post.images];
        }
      }
      
      return {
        id: post.id,
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'Vendeur',
        productName: post.productName,
        description: post.description,
        price: parseFloat(post.price),
        images: images,
        status: post.status,
        createdAt: post.createdAt,
        rejectionReason: post.adminNotes
      };
    });
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur rejected posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STATISTIQUES DES POSTS
// ============================================
router.get('/posts/stats', async (req, res) => {
  try {
    const pending = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "pending"');
    const approved = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "approved"');
    const rejected = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "rejected"');
    
    res.json({
      success: true,
      data: {
        pending: pending?.total || 0,
        approved: approved?.total || 0,
        rejected: rejected?.total || 0,
        total: (pending?.total || 0) + (approved?.total || 0) + (rejected?.total || 0)
      }
    });
  } catch (error) {
    console.error('❌ Erreur posts stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// APPROUVER UN POST
// ============================================
router.put('/posts/:id/approve', async (req, res) => {
  try {
    const postId = req.params.id;
    await db.query('UPDATE posts SET status = "approved", publishedAt = NOW() WHERE id = ?', [postId]);
    res.json({ success: true, message: 'Post approuvé avec succès' });
  } catch (error) {
    console.error('❌ Erreur approve post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REJETER UN POST
// ============================================
router.put('/posts/:id/reject', async (req, res) => {
  try {
    const postId = req.params.id;
    const { reason } = req.body;
    await db.query('UPDATE posts SET status = "rejected", adminNotes = ? WHERE id = ?', [reason || 'Non spécifié', postId]);
    res.json({ success: true, message: 'Post rejeté' });
  } catch (error) {
    console.error('❌ Erreur reject post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;