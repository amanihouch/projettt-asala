// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ===== PROFIL =====
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

// ===== METTRE À JOUR LE PROFIL =====
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name && !email && !phone && !address) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    // Vérifier si l'email est déjà utilisé
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Mettre à jour l'utilisateur
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

// ===== METTRE À JOUR L'AVATAR =====
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Récupérer l'utilisateur pour avoir l'ancien avatar
    const user = await User.findById(req.user.id);
    
    // Supprimer l'ancien avatar s'il existe et n'est pas une URL externe
    if (user && user.avatar && !user.avatar.includes('pravatar') && !user.avatar.includes('http')) {
      const oldPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('🗑️ Ancien avatar supprimé');
      }
    }

    // Construire l'URL de l'avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(req.user.id, { avatar: avatarUrl });

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

    // Récupérer l'utilisateur avec son mot de passe
    const user = await User.findByEmailWithPassword(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
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

// ===== WISHLIST =====
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await User.getWishlist(req.user.id);
    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('❌ Erreur getWishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== LIKES PRODUITS =====
exports.getProductLikes = async (req, res) => {
  try {
    const likes = await User.getProductLikes(req.user.id);
    res.json({
      success: true,
      data: likes
    });
  } catch (error) {
    console.error('❌ Erreur getProductLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
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

    res.json({
      success: true,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('❌ Erreur toggleProductLike:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===== LIKES POSTS =====
exports.getPostLikes = async (req, res) => {
  try {
    const likes = await User.getPostLikes(req.user.id);
    res.json({
      success: true,
      data: likes
    });
  } catch (error) {
    console.error('❌ Erreur getPostLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
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

    res.json({
      success: true,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('❌ Erreur togglePostLike:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};