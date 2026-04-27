// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { deleteImage } = require('../config/cloudinary');

// ===== METTRE À JOUR LE PROFIL =====
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    if (!name && !email && !phone && !address) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    const updatedUser = await User.update(userId, updates);
    
    res.json({
      success: true,
      user: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== METTRE À JOUR L'AVATAR AVEC CLOUDINARY =====
// backend/src/controllers/userController.js - Remplacer updateAvatar
// backend/src/controllers/userController.js - Modifiez updateAvatar

exports.updateAvatar = async (req, res) => {
  try {
    console.log('📸 Upload avatar - req.file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Si l'image vient de Cloudinary, stocker l'URL Cloudinary
    // Si c'est un upload local, stocker le chemin
    let avatarUrl = req.file.path;
    
    // Si c'est une image Cloudinary, garder l'URL complète
    if (avatarUrl.includes('cloudinary.com')) {
      console.log('☁️ Avatar Cloudinary:', avatarUrl);
    } else {
      console.log('📁 Avatar local:', avatarUrl);
    }
    
    await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, userId]
    );
    
    const updatedUser = await User.findById(userId);
    
    res.json({
      success: true,
      avatar: avatarUrl,
      user: updatedUser,
      message: 'Avatar mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur updateAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload: ' + error.message,
      error: error.message
    });
  }
};
// ===== GET PROFILE =====
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== CHANGER LE MOT DE PASSE =====
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ancien et le nouveau mot de passe'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    const user = await User.findByEmailWithPassword(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    await User.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== RÉCUPÉRER TOUS LES LIKES =====
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const productLikes = await db.query(`
      SELECT 
        pl.productId as item_id,
        p.productName as name,
        p.price,
        p.images as image,
        'product' as type,
        pl.createdAt
      FROM product_likes pl
      JOIN posts p ON pl.productId = p.id
      WHERE pl.userId = ?
    `, [userId]);
    
    const postLikes = await db.query(`
      SELECT 
        pl.postId as item_id,
        p.productName as name,
        p.price,
        p.images as image,
        'post' as type,
        pl.createdAt
      FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      WHERE pl.userId = ?
    `, [userId]);
    
    const formatItems = (items) => {
      return items.map(item => {
        let imageUrl = item.image;
        if (imageUrl) {
          try {
            if (typeof imageUrl === 'string') {
              const parsed = JSON.parse(imageUrl);
              if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
              }
            }
          } catch (e) {}
        }
        return {
          id: item.item_id,
          name: item.name || `Produit ${item.item_id}`,
          price: parseFloat(item.price) || 0,
          image: imageUrl || 'https://placehold.co/200x200/08717f/white?text=Produit',
          type: item.type,
          likedAt: item.createdAt
        };
      });
    };
    
    const allLikes = [...formatItems(productLikes), ...formatItems(postLikes)];
    allLikes.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
    
    res.json({
      success: true,
      data: allLikes
    });
  } catch (error) {
    console.error('❌ Erreur getUserLikes:', error);
    res.json({ success: true, data: [] });
  }
};

// ===== WISHLIST =====
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlistItems = await db.query(`
      SELECT 
        w.productId as id,
        p.productName as name,
        p.price,
        p.images as image
      FROM wishlist w
      LEFT JOIN posts p ON w.productId = p.id
      WHERE w.userId = ?
      ORDER BY w.createdAt DESC
    `, [userId]);
    
    const processedData = wishlistItems.map(item => {
      let imageUrl = item.image;
      if (imageUrl) {
        try {
          if (typeof imageUrl === 'string') {
            const parsed = JSON.parse(imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imageUrl = parsed[0];
            }
          }
        } catch (e) {}
      }
      
      return {
        id: item.id,
        name: item.name || `Product ${item.id}`,
        price: parseFloat(item.price) || 0,
        image: imageUrl || 'https://placehold.co/200x200/08717f/white?text=منتج'
      };
    });
    
    res.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('❌ Erreur getWishlist:', error);
    res.json({ success: true, data: [] });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    
    const existing = await db.query(
      'SELECT * FROM wishlist WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO wishlist (userId, productId) VALUES (?, ?)',
        [userId, productId]
      );
    }
    
    res.json({ success: true, message: 'Ajouté à la wishlist' });
  } catch (error) {
    console.error('❌ Erreur addToWishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    
    await db.query(
      'DELETE FROM wishlist WHERE userId = ? AND productId = ?',
      [userId, productId]
    );
    
    res.json({ success: true, message: 'Retiré de la wishlist' });
  } catch (error) {
    console.error('❌ Erreur removeFromWishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== LIKES PRODUITS =====
exports.getProductLikes = async (req, res) => {
  try {
    const likes = await User.getProductLikes(req.user.id);
    res.json({ success: true, data: likes });
  } catch (error) {
    console.error('❌ Erreur getProductLikes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

exports.toggleProductLike = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const hasLiked = await User.hasLikedProduct(userId, productId);

    if (hasLiked) {
      await User.unlikeProduct(userId, productId);
    } else {
      await User.likeProduct(userId, productId);
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('❌ Erreur toggleProductLike:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ===== LIKES POSTS =====
exports.getPostLikes = async (req, res) => {
  try {
    const likes = await User.getPostLikes(req.user.id);
    res.json({ success: true, data: likes });
  } catch (error) {
    console.error('❌ Erreur getPostLikes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const hasLiked = await User.hasLikedPost(userId, postId);

    if (hasLiked) {
      await User.unlikePost(userId, postId);
    } else {
      await User.likePost(userId, postId);
    }

    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    console.error('❌ Erreur togglePostLike:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};