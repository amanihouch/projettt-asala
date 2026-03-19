const User = require('../models/User');
const db = require('../models/db');

// ===== PROFIL =====

/**
 * Récupérer le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
  try {
    // req.user est déjà disponible grâce au middleware protect
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive === 1,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Mettre à jour le profil utilisateur
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(userId, {
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone,
      address: address || req.user.address
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Changer le mot de passe
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
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

    // Vérifier l'ancien mot de passe
    const isMatch = await User.verifyPassword(user, currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    await User.updatePassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Mettre à jour l'avatar
 */
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir une image'
      });
    }

    const userId = req.user.id;
    
    // Construire l'URL de l'avatar
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.update(userId, { avatar: avatarUrl });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Avatar mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur updateAvatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ===== WISHLIST / LIKES =====

/**
 * Récupérer la wishlist de l'utilisateur
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await db.query(`
      SELECT p.* FROM wishlist w
      JOIN products p ON w.productId = p.id
      WHERE w.userId = ?
      ORDER BY w.createdAt DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      data: {
        wishlist: wishlist || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur getWishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Récupérer les likes de l'utilisateur (produits)
 */
const getUserLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const likes = await db.query(`
      SELECT p.* FROM product_likes pl
      JOIN products p ON pl.productId = p.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      data: {
        likes: likes || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur getUserLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Récupérer les likes de l'utilisateur (posts)
 */
const getPostLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const likedPosts = await db.query(`
      SELECT p.* FROM post_likes pl
      JOIN posts p ON pl.postId = p.id
      WHERE pl.userId = ?
      ORDER BY pl.createdAt DESC
    `, [userId]);

    res.status(200).json({
      success: true,
      data: {
        likedPosts: likedPosts || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur getPostLikes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
  getWishlist,
  getUserLikes,
  getPostLikes
};