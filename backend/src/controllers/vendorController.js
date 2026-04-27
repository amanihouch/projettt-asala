// backend/src/controllers/vendorController.js - Version CORRIGÉE
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const db = require('../models/db');
const { deleteImage, deleteMultipleImages } = require('../config/cloudinary');

// ===== UNE SEULE DÉCLARATION DE getVendorStats =====
const getVendorStats = async (vendorId) => {
  try {
    const postsCount = await db.getOne('SELECT COUNT(*) as count FROM posts WHERE vendorId = ? AND status = "approved"', [vendorId]);
    const productsCount = await db.getOne('SELECT COUNT(*) as count FROM products WHERE vendorId = ?', [vendorId]);
    const followersCount = await db.getOne('SELECT COUNT(*) as count FROM followers WHERE vendor_id = ?', [vendorId]);
    return { 
      posts: postsCount?.count || 0, 
      products: productsCount?.count || 0, 
      followers: followersCount?.count || 0 
    };
  } catch (error) {
    console.error('❌ getVendorStats:', error);
    return { posts: 0, products: 0, followers: 0 };
  }
};

// ===== CRÉATION =====
exports.createVendor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    
    const { shopName, specialty, description, location, experience, phone, email, website } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    
    const existingVendor = await Vendor.findByUserId(userId);
    if (existingVendor) return res.status(400).json({ success: false, message: 'Un profil vendeur existe déjà pour cet utilisateur' });
    
    const vendor = await Vendor.create({ 
      userId, shopName, specialty, description, location: location || 'تونس', 
      coverImage: null, experience: experience || 0, verified: false, approved: false, 
      rating: 0, totalReviews: 0, phone: phone || null, email: email || null, website: website || null 
    });
    res.status(201).json({ success: true, message: 'Profil vendeur créé avec succès. En attente de validation.', data: { vendor, pending: true } });
  } catch (error) {
    console.error('❌ Erreur createVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== LISTES =====
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, specialty, verified, sortBy = 'rating', order = 'DESC' } = req.query;
    const options = { 
      page: parseInt(page) || 1, limit: parseInt(limit) || 20, search: search || '', 
      specialty: specialty || null, verified: verified === 'true' ? true : verified === 'false' ? false : null, 
      approved: true, sortBy: sortBy, order: order.toUpperCase() 
    };
    const result = await Vendor.getAll(options);
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map(vendor => {
        const baseURL = `${req.protocol}://${req.get('host')}`;
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
        if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
        return vendor;
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ getAllVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await Vendor.getPending({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, search: search || '' });
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map(vendor => {
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${req.protocol}://${req.get('host')}${vendor.userAvatar}`;
        return vendor;
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ getPendingVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopVendors = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const vendors = await db.query(`
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'approved') as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendor_id = v.id) as followersCount
      FROM vendors v JOIN users u ON v.userId = u.id
      WHERE v.verified = 1 AND v.approved = 1
      ORDER BY v.rating DESC, followersCount DESC LIMIT ?
    `, [parseInt(limit)]);
    const formattedVendors = vendors.map(vendor => {
      const baseURL = `${req.protocol}://${req.get('host')}`;
      if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
      if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
      return vendor;
    });
    res.json({ success: true, data: { vendors: formattedVendors } });
  } catch (error) {
    console.error('❌ getTopVendors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// backend/src/controllers/vendorController.js

// ===== RECHERCHE PAR SLUG (CORRIGÉE) =====
// backend/src/controllers/vendorController.js

// ===== NOUVELLE MÉTHODE : Supporte ID ou slug =====
exports.getVendorByIdOrSlug = async (req, res) => {
  try {
    const identifier = req.params.id;
    
    console.log('🔍 getVendorByIdOrSlug - Identifier:', identifier);
    
    let vendor = null;
    
    // 1. Si c'est un nombre, chercher par ID
    if (!isNaN(identifier)) {
      console.log('📌 Recherche par ID:', identifier);
      vendor = await Vendor.findById(parseInt(identifier));
    }
    
    // 2. Si pas trouvé et que ça ressemble à un slug (contient des lettres ou tirets)
    if (!vendor) {
      console.log('📌 Recherche par slug:', identifier);
      vendor = await Vendor.findBySlug(identifier);
    }
    
    // 3. Si toujours pas trouvé, essayer d'extraire l'ID si format "123-nom"
    if (!vendor && identifier.includes('-')) {
      const idPart = identifier.split('-')[0];
      if (!isNaN(idPart)) {
        console.log('📌 Recherche par ID extrait:', idPart);
        vendor = await Vendor.findById(parseInt(idPart));
      }
    }
    
    if (!vendor) {
      console.log('❌ Vendeur non trouvé pour:', identifier);
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }
    
    console.log('✅ Vendeur trouvé:', vendor.id, vendor.shopName, vendor.slug);
    
    const isOwner = req.user && req.user.id === vendor.userId;
    const isAdmin = req.user && req.user.role === 'admin';
    
    // Permettre au propriétaire de voir son profil même en attente
    if (vendor.approved !== 1 && !isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Ce profil vendeur est en attente de validation' 
      });
    }
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) {
      vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
    }
    if (vendor.coverImage && !vendor.coverImage.startsWith('http')) {
      vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    }
    
    const stats = await getVendorStats(vendor.id);
    
    res.json({ 
      success: true, 
      data: { 
        vendor, 
        stats, 
        pending: vendor.approved !== 1 
      } 
    });
  } catch (error) {
    console.error('❌ getVendorByIdOrSlug:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== CORRECTION DE getVendorBySlug =====
exports.getVendorBySlug = async (req, res) => {
  try {
    let { slug } = req.params;
    
    console.log('🔍 getVendorBySlug - Slug reçu:', slug);
    
    // Si le slug est un nombre, chercher par ID
    if (!isNaN(slug)) {
      console.log('📌 Slug est un nombre, recherche par ID:', slug);
      const vendor = await Vendor.findById(parseInt(slug));
      if (vendor) {
        const baseURL = `${req.protocol}://${req.get('host')}`;
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
        if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
        const stats = await getVendorStats(vendor.id);
        return res.json({ success: true, data: { vendor, stats, pending: vendor.approved !== 1 } });
      }
    }
    
    // Chercher par slug exact
    console.log('📌 Recherche par slug exact:', slug);
    const vendor = await Vendor.findBySlug(slug);
    
    if (!vendor) {
      console.log('❌ Vendeur non trouvé pour slug:', slug);
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé' 
      });
    }
    
    console.log('✅ Vendeur trouvé par slug:', vendor.id, vendor.shopName);
    
    const isOwner = req.user && req.user.id === vendor.userId;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (vendor.approved !== 1 && !isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Ce profil vendeur est en attente de validation' 
      });
    }
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
    if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    
    const stats = await getVendorStats(vendor.id);
    
    res.json({ 
      success: true, 
      data: { 
        vendor, 
        stats, 
        pending: vendor.approved !== 1 
      } 
    });
  } catch (error) {
    console.error('❌ getVendorBySlug:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
// ===== RECHERCHE PAR ID (supporte aussi le slug) =====
exports.getVendorById = async (req, res) => {
  try {
    const identifier = req.params.id;
    
    // Détecter si c'est un ID numérique ou un slug
    const vendor = !isNaN(identifier) 
      ? await Vendor.findById(parseInt(identifier))
      : await Vendor.findBySlug(identifier);
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    }
    
    const isOwner = req.user && req.user.id === vendor.userId;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (vendor.approved !== 1 && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Ce profil vendeur est en attente de validation' });
    }
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
    if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    
    const stats = await getVendorStats(vendor.id);
    res.json({ success: true, data: { vendor, stats, pending: vendor.approved !== 1 } });
  } catch (error) {
    console.error('❌ getVendorById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorByUserId = async (req, res) => {
  try {
    const vendor = await Vendor.findByUserId(req.params.userId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé pour cet utilisateur' });
    
    const isOwner = req.user && req.user.id === vendor.userId;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (vendor.approved !== 1 && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Ce profil vendeur est en attente de validation' });
    }
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
    if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('❌ getVendorByUserId:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN =====
exports.approveVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    
    if (vendor.approved === 1) {
      return res.status(400).json({ success: false, message: 'Ce vendeur est déjà approuvé' });
    }
    
    await db.query('UPDATE vendors SET approved = 1, verified = 1, approvedAt = NOW() WHERE id = ?', [vendorId]);
    await db.query('UPDATE users SET role = "vendor" WHERE id = ?', [vendor.userId]);
    const updatedVendor = await Vendor.findById(vendorId);
    res.json({ success: true, message: 'Vendeur approuvé avec succès', data: { vendor: updatedVendor } });
  } catch (error) {
    console.error('❌ approveVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    if (vendor.approved === 1) return res.status(400).json({ success: false, message: 'Ce vendeur est déjà approuvé' });
    
    await db.query('UPDATE vendors SET approved = 0, status = "rejected", rejectionReason = ? WHERE id = ?', [req.body.reason || 'Non spécifié', req.params.id]);
    res.json({ success: true, message: 'Vendeur rejeté avec succès', data: { vendorId: req.params.id, reason: req.body.reason } });
  } catch (error) {
    console.error('❌ rejectVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    
    if (vendor.coverImage && vendor.coverImage.includes('cloudinary.com')) await deleteImage(vendor.coverImage);
    const products = await db.query('SELECT imageUrls FROM products WHERE vendorId = ?', [req.params.id]);
    for (const product of products) if (product.imageUrls) await deleteMultipleImages(JSON.parse(product.imageUrls));
    
    await db.query('DELETE FROM products WHERE vendorId = ?', [req.params.id]);
    await db.query('DELETE FROM posts WHERE vendorId = ?', [req.params.id]);
    await db.query('DELETE FROM followers WHERE vendor_id = ?', [req.params.id]);
    await db.query('DELETE FROM vendors WHERE id = ?', [req.params.id]);
    await db.query('UPDATE users SET role = "user" WHERE id = ?', [vendor.userId]);
    res.json({ success: true, message: 'Vendeur supprimé avec succès' });
  } catch (error) {
    console.error('❌ deleteVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllVendorsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `
      SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id) as postsCount,
             (SELECT COUNT(*) FROM followers WHERE vendor_id = v.id) as followersCount
      FROM vendors v LEFT JOIN users u ON v.userId = u.id WHERE 1=1
    `;
    const params = [];
    if (status === 'approved') sql += ' AND v.approved = 1';
    else if (status === 'pending') sql += ' AND v.approved = 0';
    else if (status === 'rejected') sql += ' AND v.status = "rejected"';
    if (search) { sql += ' AND (v.shopName LIKE ? OR u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    sql += ' ORDER BY v.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const vendors = await db.query(sql, params);
    const countResult = await db.getOne('SELECT COUNT(*) as total FROM vendors v LEFT JOIN users u ON v.userId = u.id WHERE 1=1');
    const baseURL = `${req.protocol}://${req.get('host')}`;
    vendors.forEach(vendor => {
      if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
      if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    });
    res.json({ success: true, data: { vendors, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult?.total || 0, pages: Math.ceil((countResult?.total || 0) / parseInt(limit)) } } });
  } catch (error) {
    console.error('❌ getAllVendorsAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorStatsAdmin = async (req, res) => {
  try {
    const total = await db.getOne('SELECT COUNT(*) as count FROM vendors');
    const approved = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE approved = 1');
    const pending = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE approved = 0');
    const rejected = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE status = "rejected"');
    const verified = await db.getOne('SELECT COUNT(*) as count FROM vendors WHERE verified = 1');
    res.json({ success: true, data: { total: total?.count || 0, approved: approved?.count || 0, pending: pending?.count || 0, rejected: rejected?.count || 0, verified: verified?.count || 0 } });
  } catch (error) {
    console.error('❌ getVendorStatsAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== MISE À JOUR =====
exports.updateVendor = async (req, res) => {
  try {
    const existingVendor = await Vendor.findById(req.params.id);
    if (!existingVendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    if (req.user.role !== 'admin' && existingVendor.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Non autorisé' });
    
    const updatedVendor = await Vendor.update(req.params.id, req.body);
    if (updatedVendor) {
      const baseURL = `${req.protocol}://${req.get('host')}`;
      if (updatedVendor.userAvatar && !updatedVendor.userAvatar.startsWith('http')) updatedVendor.userAvatar = `${baseURL}${updatedVendor.userAvatar}`;
      if (updatedVendor.coverImage && !updatedVendor.coverImage.startsWith('http')) updatedVendor.coverImage = `${baseURL}${updatedVendor.coverImage}`;
    }
    res.json({ success: true, message: 'Profil vendeur mis à jour', data: { vendor: updatedVendor } });
  } catch (error) {
    console.error('❌ updateVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadCoverImage = async (req, res) => {
  try {
    const existingVendor = await Vendor.findById(req.params.id);
    if (!existingVendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    if (existingVendor.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Non autorisé' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    
    if (existingVendor.coverImage && existingVendor.coverImage.includes('cloudinary.com')) await deleteImage(existingVendor.coverImage);
    await db.query('UPDATE vendors SET coverImage = ? WHERE id = ?', [req.file.path, req.params.id]);
    const updatedVendor = await Vendor.findById(req.params.id);
    res.json({ success: true, message: 'Image de couverture mise à jour', data: { coverImage: req.file.path, vendor: updatedVendor } });
  } catch (error) {
    console.error('❌ Erreur uploadCoverImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== PRODUITS =====
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const products = await db.query('SELECT * FROM products WHERE vendorId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [req.params.id, parseInt(limit), offset]);
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM products WHERE vendorId = ?', [req.params.id]);
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    products.forEach(product => {
      if (product.mainImage && !product.mainImage.startsWith('http')) product.mainImage = `${baseURL}${product.mainImage}`;
      if (product.images && Array.isArray(product.images)) product.images = product.images.map(img => img && !img.startsWith('http') ? `${baseURL}${img}` : img);
    });
    res.json({ success: true, data: { products, pagination: { page: parseInt(page), limit: parseInt(limit), total: totalResult?.total || 0, pages: Math.ceil((totalResult?.total || 0) / parseInt(limit)) } } });
  } catch (error) {
    console.error('❌ getVendorProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== FOLLOW =====
exports.toggleFollow = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    if (vendor.approved !== 1) return res.status(403).json({ success: false, message: 'Ce vendeur n\'est pas encore approuvé' });
    if (vendor.userId === req.user.id) return res.status(400).json({ success: false, message: 'Vous ne pouvez pas suivre votre propre boutique' });
    
    const existing = await db.getOne('SELECT * FROM followers WHERE user_id = ? AND vendor_id = ?', [req.user.id, req.params.id]);
    if (existing) {
      await db.query('DELETE FROM followers WHERE user_id = ? AND vendor_id = ?', [req.user.id, req.params.id]);
    } else {
      await db.query('INSERT INTO followers (user_id, vendor_id, created_at) VALUES (?, ?, NOW())', [req.user.id, req.params.id]);
    }
    const countResult = await db.getOne('SELECT COUNT(*) as count FROM followers WHERE vendor_id = ?', [req.params.id]);
    res.json({ success: true, data: { following: !existing, followersCount: countResult?.count || 0 } });
  } catch (error) {
    console.error('❌ Erreur toggleFollow:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkFollowing = async (req, res) => {
  try {
    const existing = await db.getOne('SELECT * FROM followers WHERE user_id = ? AND vendor_id = ?', [req.user.id, req.params.id]);
    res.json({ success: true, data: { following: !!existing } });
  } catch (error) {
    console.error('❌ checkFollowing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendeur non trouvé' });
    
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const followers = await db.query(`
      SELECT u.id, u.name, u.avatar, f.created_at as followedSince
      FROM followers f JOIN users u ON f.user_id = u.id
      WHERE f.vendor_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?
    `, [req.params.id, parseInt(limit), offset]);
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM followers WHERE vendor_id = ?', [req.params.id]);
    
    const baseURL = `${req.protocol}://${req.get('host')}`;
    followers.forEach(follower => { if (follower.avatar && !follower.avatar.startsWith('http')) follower.avatar = `${baseURL}${follower.avatar}`; });
    res.json({ success: true, data: { followers, pagination: { page: parseInt(page), limit: parseInt(limit), total: totalResult?.total || 0, pages: Math.ceil((totalResult?.total || 0) / parseInt(limit)) } } });
  } catch (error) {
    console.error('❌ getFollowers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorsByLocation = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const vendors = await db.query(`
      SELECT v.*, u.name, u.avatar as userAvatar
      FROM vendors v LEFT JOIN users u ON v.userId = u.id
      WHERE v.location LIKE ? AND v.approved = 1
      ORDER BY v.rating DESC LIMIT ? OFFSET ?
    `, [`%${req.params.location}%`, parseInt(limit), offset]);
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM vendors WHERE location LIKE ? AND approved = 1', [`%${req.params.location}%`]);
    const baseURL = `${req.protocol}://${req.get('host')}`;
    vendors.forEach(vendor => {
      if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
      if (vendor.coverImage && !vendor.coverImage.startsWith('http')) vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    });
    res.json({ success: true, data: { vendors, pagination: { page: parseInt(page), limit: parseInt(limit), total: totalResult?.total || 0, pages: Math.ceil((totalResult?.total || 0) / parseInt(limit)) } } });
  } catch (error) {
    console.error('❌ getVendorsByLocation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};