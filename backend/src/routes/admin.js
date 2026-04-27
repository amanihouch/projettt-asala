// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const db = require('../models/db');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const contactController = require('../controllers/contactController');

// Toutes les routes admin nécessitent authentification et rôle admin
router.use(protect, adminOnly);

// ===== STATISTIQUES GÉNÉRALES =====
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

// ===== VENDEURS EN ATTENTE =====
router.get('/vendors/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await Vendor.getPending({ page, limit, search });
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map(vendor => {
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) {
          vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
        }
        return vendor;
      });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Erreur pending vendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== STATISTIQUES VENDEURS =====
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
        total, approved, pending, rejected, verified,
        pendingPercentage: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
        approvedPercentage: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('❌ Erreur vendor stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== APPROUVER UN VENDEUR =====
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    if (vendor.approved) {
      return res.status(400).json({ success: false, message: 'Vendeur déjà approuvé' });
    }
    
    await db.query('UPDATE vendors SET approved = 1, verified = 1 WHERE id = ?', [vendorId]);
    await db.query('UPDATE users SET role = "vendor" WHERE id = ?', [vendor.userId]);
    
    const updatedVendor = await Vendor.findById(vendorId);
    res.json({ success: true, message: 'Vendeur approuvé avec succès', data: { vendor: updatedVendor } });
  } catch (error) {
    console.error('❌ Erreur approve vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== REJETER UN VENDEUR =====
router.put('/vendors/:id/reject', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { reason } = req.body;
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    
    await db.query('UPDATE vendors SET approved = 0, status = "rejected", rejectionReason = ? WHERE id = ?', [reason || 'Non spécifié', vendorId]);
    res.json({ success: true, message: 'Vendeur rejeté', data: { vendorId, reason } });
  } catch (error) {
    console.error('❌ Erreur reject vendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== MESSAGES CONTACT =====
router.get('/contact/messages', contactController.getAdminMessages);
router.get('/contact/stats', contactController.getAdminStats);
router.get('/contact/messages/:id', contactController.getAdminMessageById);
router.put('/contact/messages/:id/read', contactController.markAsRead);
router.put('/contact/messages/:id/status', contactController.updateMessageStatus);
router.delete('/contact/messages/:id', contactController.deleteMessage);
router.post('/contact/reply', contactController.replyToMessage);

// backend/src/routes/admin.js - Remplacez la section des posts par ceci

// ===== POSTS APPROUVÉS (VERSION SIMPLIFIÉE) =====
router.get('/posts/approved', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    console.log('📊 Chargement posts approuvés - page:', pageNum, 'limit:', limitNum);
    
    // Requête simplifiée sans jointures complexes
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
    
    console.log(`📊 ${posts.length} posts approuvés trouvés`);
    
    // Compter le total
    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total 
      FROM posts 
      WHERE status = 'approved'
    `);
    
    const total = totalResult?.total || 0;
    
    // Formater les résultats
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
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ===== POSTS EN ATTENTE (VERSION SIMPLIFIÉE) =====
router.get('/posts/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    console.log('📊 Chargement posts en attente - page:', pageNum, 'limit:', limitNum);
    
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
    
    console.log(`📊 ${posts.length} posts en attente trouvés`);
    
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

// ===== POSTS REJETÉS (VERSION SIMPLIFIÉE) =====
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

// ===== STATISTIQUES DES POSTS =====
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

// ===== APPROUVER UN POST =====
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

// ===== REJETER UN POST =====
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