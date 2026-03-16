// backend/src/controllers/userController.js
const User = require('../models/User');
const db = require('../models/db');

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.getUserWithStats(req.user.id);

    // Get user's wishlist (products liked)
    const wishlist = await db.query(`
      SELECT p.*, 
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM likes l
      JOIN products p ON l.productId = p.id
      WHERE l.userId = ?
      ORDER BY l.createdAt DESC
    `, [req.user.id]);

    // Get user's post likes
    const postLikes = await db.query(`
      SELECT p.*, 
             v.shopName,
             pl.createdAt as likedAt
      FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `, [req.user.id]);

    // Parse JSON fields for posts
    postLikes.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });

    res.json({
      success: true,
      data: {
        user,
        wishlist,
        postLikes
      }
    });
  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du profil',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const updates = {
      name,
      phone,
      avatar
    };

    const user = await User.update(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   POST /api/v1/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByEmailWithPassword(req.user.email);

    // Verify current password
    const isValid = await User.verifyPassword(user, currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// @desc    Get user wishlist (products)
// @route   GET /api/v1/users/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await db.query(`
      SELECT p.*, 
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage,
             l.createdAt as likedAt
      FROM likes l
      JOIN products p ON l.productId = p.id
      WHERE l.userId = ?
      ORDER BY l.createdAt DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    console.error('❌ Erreur getWishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des favoris',
      error: error.message
    });
  }
};

// @desc    Get user's liked posts
// @route   GET /api/v1/users/likes
// @access  Private
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const posts = await db.query(`
      SELECT p.*, 
             v.shopName,
             pl.createdAt as likedAt
      FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `, [userId]);

    // Parser les JSON
    posts.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('❌ Erreur getUserLikes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user post likes
// @route   GET /api/v1/users/post-likes
// @access  Private
exports.getPostLikes = async (req, res) => {
  try {
    const postLikes = await db.query(`
      SELECT p.*, 
             v.shopName,
             u.name as vendorName,
             pl.createdAt as likedAt
      FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `, [req.user.id]);

    // Parse JSON fields
    postLikes.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });

    res.json({
      success: true,
      data: { postLikes }
    });
  } catch (error) {
    console.error('❌ Erreur getPostLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des likes de posts',
      error: error.message
    });
  }
};

// @desc    Mettre à jour l'avatar de l'utilisateur
// @route   POST /api/v1/users/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier envoyé'
      });
    }

    // Construire l'URL accessible publiquement
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Mettre à jour l'utilisateur
    const user = await User.update(req.user.id, { avatar: avatarUrl });

    res.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Erreur updateAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'avatar',
      error: error.message
    });
  }
};