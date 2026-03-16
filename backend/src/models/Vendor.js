// backend/src/models/Vendor.js
const db = require('./db');

const Vendor = {
  // ===== CRÉER UN VENDEUR =====
  async create(vendorData) {
    const {
      userId, shopName, specialty, description, location,
      coverImage, experience, totalProducts
    } = vendorData;

    console.log('📝 Création vendeur avec données:', { userId, shopName, specialty });

    // Requête SQL avec les bonnes colonnes de votre schema.sql
    const sql = `
      INSERT INTO vendors 
      (userId, shopName, specialty, description, location, coverImage, 
       verified, followers, rating, totalProducts, experience, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      shopName,
      specialty || null,
      description || null,
      location || 'تونس',
      coverImage || null,
      0, // verified (false)
      0, // followers
      0, // rating
      totalProducts || 0, // totalProducts
      experience || 0,
      1  // isActive (true)
    ];

    console.log('📝 SQL params:', params);

    const vendorId = await db.insert(sql, params);
    return this.findById(vendorId);
  },

  // ===== TROUVER PAR ID =====
  async findById(id) {
    const sql = `
      SELECT v.*, 
             u.name, u.email, u.phone, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.id = ?
    `;
    return db.getOne(sql, [id]);
  },

  // ===== TROUVER PAR USER ID =====
  async findByUserId(userId) {
    const sql = 'SELECT * FROM vendors WHERE userId = ?';
    return db.getOne(sql, [userId]);
  },

  // ===== RÉCUPÉRER TOUS LES VENDEURS =====
  async getAll({ page = 1, limit = 20, search = null, verified = null }) {
    let sql = `
      SELECT v.*, 
             u.name, u.email, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (verified !== null) {
      sql += ' AND v.verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (v.shopName LIKE ? OR v.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY v.createdAt DESC';
    return db.paginate(sql, params, page, limit);
  },

  // ===== METTRE À JOUR =====
  async update(id, updates) {
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'shopName', 'specialty', 'description', 'location',
      'coverImage', 'verified', 'rating', 'followers', 'totalProducts',
      'experience', 'isActive'
    ];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  },

  // ===== SUPPRIMER =====
  async delete(id) {
    await db.query('DELETE FROM vendors WHERE id = ?', [id]);
    return true;
  },

  // ===== RÉCUPÉRER LES PRODUITS =====
  async getProducts(vendorId, { page = 1, limit = 10 }) {
    const sql = `
      SELECT p.*,
             (SELECT COUNT(*) FROM likes WHERE productId = p.id) as totalLikes,
             (SELECT imageUrl FROM product_images WHERE productId = p.id ORDER BY displayOrder LIMIT 1) as mainImage
      FROM products p
      WHERE p.vendorId = ?
      ORDER BY p.createdAt DESC
    `;
    return db.paginate(sql, [vendorId], page, limit);
  },

  // ===== SUIVRE/NE PLUS SUIVRE =====
  async toggleFollow(followerId, vendorId) {
    const exists = await db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
    
    if (exists) {
      await db.query('DELETE FROM followers WHERE followerId = ? AND vendorId = ?', [followerId, vendorId]);
      await db.query('UPDATE vendors SET followers = followers - 1 WHERE id = ?', [vendorId]);
      return { following: false };
    } else {
      await db.insert('INSERT INTO followers (followerId, vendorId) VALUES (?, ?)', [followerId, vendorId]);
      await db.query('UPDATE vendors SET followers = followers + 1 WHERE id = ?', [vendorId]);
      return { following: true };
    }
  },

  // ===== VÉRIFIER SI L'UTILISATEUR SUIT =====
  async isFollowing(followerId, vendorId) {
    return db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
  },

  // ===== RÉCUPÉRER LES VENDEURS LES PLUS RÉCENTS =====
  async getRecent(limit = 4) {
    const sql = `
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      ORDER BY v.createdAt DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  },

  // ===== RÉCUPÉRER LES MEILLEURS VENDEURS =====
  async getTopRated(limit = 8) {
    const sql = `
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.verified = 1
      ORDER BY v.rating DESC, followersCount DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  }
};

module.exports = Vendor;