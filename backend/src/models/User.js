// backend/src/models/User.js
const db = require('./db');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Trouver un utilisateur par ID
   */
  static async findById(id) {
    try {
      const user = await db.getOne(
        `SELECT id, name, email, role, phone, address, avatar, googleId, facebookId, isActive, createdAt, updatedAt 
         FROM users WHERE id = ?`,
        [id]
      );
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findById:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par email avec mot de passe (pour login)
   */
  static async findByEmailWithPassword(email) {
    try {
      const user = await db.getOne(
        'SELECT id, name, email, password, role, phone, address, avatar, googleId, facebookId, isActive FROM users WHERE email = ?',
        [email.toLowerCase()]
      );
      console.log(`🔍 Recherche utilisateur ${email}:`, user ? 'trouvé' : 'non trouvé');
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findByEmailWithPassword:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par email (sans mot de passe)
   */
  static async findByEmail(email) {
    try {
      const user = await db.getOne(
        'SELECT id, name, email, role, phone, address, avatar, googleId, facebookId, isActive, createdAt FROM users WHERE email = ?',
        [email.toLowerCase()]
      );
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findByEmail:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par Google ID
   */
  static async findByGoogleId(googleId) {
    try {
      const user = await db.getOne(
        'SELECT id, name, email, role, phone, address, avatar, googleId, facebookId, isActive, createdAt FROM users WHERE googleId = ?',
        [googleId]
      );
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findByGoogleId:', error);
      return null;
    }
  }

  /**
   * Trouver un utilisateur par Facebook ID
   */
  static async findByFacebookId(facebookId) {
    try {
      const user = await db.getOne(
        'SELECT id, name, email, role, phone, address, avatar, googleId, facebookId, isActive, createdAt FROM users WHERE facebookId = ?',
        [facebookId]
      );
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findByFacebookId:', error);
      return null;
    }
  }

  /**
   * Trouver un utilisateur par téléphone
   */
  static async findByPhone(phone) {
    try {
      const user = await db.getOne(
        'SELECT id, name, email, role, phone, address, avatar, createdAt FROM users WHERE phone = ?',
        [phone]
      );
      return user || null;
    } catch (error) {
      console.error('❌ Erreur findByPhone:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel utilisateur (standard ou OAuth)
   */
  static async create(userData) {
    const { 
      name, 
      email, 
      password, 
      role = 'customer', 
      phone = null, 
      address = null, 
      avatar = null,
      googleId = null,
      facebookId = null
    } = userData;
    
    // Hasher le mot de passe seulement s'il est fourni
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    try {
      const userId = await db.insert(
        `INSERT INTO users (name, email, password, role, phone, address, avatar, googleId, facebookId, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [name, email.toLowerCase(), hashedPassword, role, phone, address, avatar, googleId, facebookId]
      );

      return await this.findById(userId);
    } catch (error) {
      console.error('❌ Erreur create:', error);
      throw error;
    }
  }

  /**
   * Créer ou récupérer un utilisateur Google (OAuth)
   */
  static async findOrCreateGoogleUser(profile) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const googleId = profile.id;
      const name = profile.displayName;
      const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      if (!email) {
        throw new Error('Email non fourni par Google');
      }

      // Chercher par email d'abord
      let user = await this.findByEmail(email);

      if (user) {
        // Si l'utilisateur existe mais n'a pas de googleId, le lier
        if (!user.googleId) {
          await this.update(user.id, { googleId: googleId, avatar: avatar || user.avatar });
          user = await this.findById(user.id);
          console.log('✅ Compte existant lié à Google:', email);
        }
        return user;
      }

      // Chercher par Google ID
      user = await this.findByGoogleId(googleId);
      if (user) {
        return user;
      }

      // Créer un nouvel utilisateur
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await this.create({
        name: name,
        email: email,
        password: randomPassword,
        role: 'customer',
        avatar: avatar,
        googleId: googleId
      });

      console.log('✅ Nouvel utilisateur Google créé:', email);
      return user;

    } catch (error) {
      console.error('❌ Erreur findOrCreateGoogleUser:', error);
      throw error;
    }
  }

  /**
   * Créer ou récupérer un utilisateur Facebook (OAuth)
   */
  static async findOrCreateFacebookUser(profile) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const facebookId = profile.id;
      const name = profile.displayName;
      const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      if (!email) {
        throw new Error('Email non fourni par Facebook');
      }

      // Chercher par email d'abord
      let user = await this.findByEmail(email);

      if (user) {
        // Si l'utilisateur existe mais n'a pas de facebookId, le lier
        if (!user.facebookId) {
          await this.update(user.id, { facebookId: facebookId, avatar: avatar || user.avatar });
          user = await this.findById(user.id);
          console.log('✅ Compte existant lié à Facebook:', email);
        }
        return user;
      }

      // Chercher par Facebook ID
      user = await this.findByFacebookId(facebookId);
      if (user) {
        return user;
      }

      // Créer un nouvel utilisateur
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await this.create({
        name: name,
        email: email,
        password: randomPassword,
        role: 'customer',
        avatar: avatar,
        facebookId: facebookId
      });

      console.log('✅ Nouvel utilisateur Facebook créé:', email);
      return user;

    } catch (error) {
      console.error('❌ Erreur findOrCreateFacebookUser:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && value !== null) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return await this.findById(id);

      values.push(id);
      await db.query(
        `UPDATE users SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('❌ Erreur update:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le mot de passe
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur updatePassword:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la date de dernière connexion
   */
  static async updateLastLogin(id) {
    try {
      await db.query('UPDATE users SET lastLogin = NOW() WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.log('⚠️ Colonne lastLogin non trouvée, mise à jour ignorée');
      return false;
    }
  }

  /**
   * Récupérer la wishlist
   */
  static async getWishlist(userId) {
    try {
      // Vérifier si la colonne created_at existe
      const columns = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'wishlist' AND COLUMN_NAME = 'created_at'
      `);
      
      const hasCreatedAt = columns && columns.length > 0;
      
      let sql;
      if (hasCreatedAt) {
        sql = `
          SELECT p.*, w.created_at as added_at
          FROM wishlist w
          JOIN products p ON w.product_id = p.id
          WHERE w.user_id = ?
          ORDER BY w.created_at DESC
        `;
      } else {
        sql = `
          SELECT p.*
          FROM wishlist w
          JOIN products p ON w.product_id = p.id
          WHERE w.user_id = ?
        `;
      }
      
      const rows = await db.query(sql, [userId]);
      return rows || [];
    } catch (error) {
      console.error('❌ Erreur getWishlist:', error);
      return [];
    }
  }

  /**
   * Vérifier si un produit est dans la wishlist
   */
  static async isInWishlist(userId, productId) {
    try {
      const result = await db.getOne(
        'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return !!result;
    } catch (error) {
      console.error('❌ Erreur isInWishlist:', error);
      return false;
    }
  }

  /**
   * Récupérer les likes de produits
   */
  static async getProductLikes(userId) {
    try {
      const likes = await db.query(
        `SELECT productId FROM product_likes WHERE userId = ?`,
        [userId]
      );
      return (likes || []).map(row => row.productId);
    } catch (error) {
      console.error('❌ Erreur getProductLikes:', error);
      return [];
    }
  }

  /**
   * Vérifier si un utilisateur a liké un produit
   */
  static async hasLikedProduct(userId, productId) {
    try {
      const result = await db.getOne(
        'SELECT * FROM product_likes WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
      return !!result;
    } catch (error) {
      console.error('❌ Erreur hasLikedProduct:', error);
      return false;
    }
  }

  /**
   * Liker un produit
   */
  static async likeProduct(userId, productId) {
    try {
      await db.insert(
        'INSERT INTO product_likes (userId, productId) VALUES (?, ?) ON DUPLICATE KEY UPDATE createdAt = NOW()',
        [userId, productId]
      );
      await db.query(
        'UPDATE products SET likes_count = likes_count + 1 WHERE id = ?',
        [productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur likeProduct:', error);
      throw error;
    }
  }

  /**
   * Enlever un like de produit
   */
  static async unlikeProduct(userId, productId) {
    try {
      await db.query(
        'DELETE FROM product_likes WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
      await db.query(
        'UPDATE products SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?',
        [productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur unlikeProduct:', error);
      throw error;
    }
  }

  /**
   * Récupérer les likes de posts
   */
  static async getPostLikes(userId) {
    try {
      const likes = await db.query(
        `SELECT postId FROM post_likes WHERE userId = ?`,
        [userId]
      );
      return (likes || []).map(row => row.postId);
    } catch (error) {
      console.error('❌ Erreur getPostLikes:', error);
      return [];
    }
  }

  /**
   * Vérifier si un utilisateur a liké un post
   */
  static async hasLikedPost(userId, postId) {
    try {
      const result = await db.getOne(
        'SELECT * FROM post_likes WHERE userId = ? AND postId = ?',
        [userId, postId]
      );
      return !!result;
    } catch (error) {
      console.error('❌ Erreur hasLikedPost:', error);
      return false;
    }
  }

  /**
   * Liker un post
   */
  static async likePost(userId, postId) {
    try {
      await db.insert(
        'INSERT INTO post_likes (userId, postId) VALUES (?, ?) ON DUPLICATE KEY UPDATE createdAt = NOW()',
        [userId, postId]
      );
      await db.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur likePost:', error);
      throw error;
    }
  }

  /**
   * Enlever un like de post
   */
  static async unlikePost(userId, postId) {
    try {
      await db.query(
        'DELETE FROM post_likes WHERE userId = ? AND postId = ?',
        [userId, postId]
      );
      await db.query(
        'UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?',
        [postId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur unlikePost:', error);
      throw error;
    }
  }

  /**
   * Compter le nombre total d'utilisateurs
   */
  static async count() {
    try {
      const result = await db.getOne('SELECT COUNT(*) as total FROM users');
      return result?.total || 0;
    } catch (error) {
      console.error('❌ Erreur count:', error);
      return 0;
    }
  }

  /**
   * Compter le nombre d'utilisateurs par rôle
   */
  static async countByRole(role) {
    try {
      const result = await db.getOne('SELECT COUNT(*) as total FROM users WHERE role = ?', [role]);
      return result?.total || 0;
    } catch (error) {
      console.error('❌ Erreur countByRole:', error);
      return 0;
    }
  }

  /**
   * Récupérer les utilisateurs récents
   */
  static async getRecent(limit = 10) {
    try {
      const users = await db.query(
        `SELECT id, name, email, role, avatar, createdAt 
         FROM users 
         ORDER BY createdAt DESC 
         LIMIT ?`,
        [limit]
      );
      return users || [];
    } catch (error) {
      console.error('❌ Erreur getRecent:', error);
      return [];
    }
  }

  /**
   * Supprimer un utilisateur
   */
  static async delete(id) {
    try {
      const orderCount = await db.getOne(
        'SELECT COUNT(*) as count FROM orders WHERE userId = ?',
        [id]
      );
      
      if (orderCount && orderCount.count > 0) {
        throw new Error('Impossible de supprimer un utilisateur avec des commandes');
      }
      
      const result = await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Erreur delete:', error);
      throw error;
    }
  }
}

module.exports = User;