// backend/src/models/Vendor.js - Version COMPLÈTE
const db = require('./db');

class Vendor {
  // ===== CRÉATION =====
  static async create(vendorData) {
    const {
      userId, shopName, specialty, description,
      location, coverImage, experience, verified, approved,
      avatar, phone, email, website
    } = vendorData;

    // Générer un slug unique
    const slug = await this.createUniqueSlug(shopName);

    const result = await db.query(
      `INSERT INTO vendors 
       (userId, shopName, slug, specialty, description, location, coverImage, 
        experience, verified, approved, rating, totalReviews, createdAt,
        avatar, phone, email, website, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, 'pending')`,
      [userId, shopName, slug, specialty || null, description || null, location || null, 
       coverImage || null, experience || 0, verified || 0, approved || 0, 0, 0,
       avatar || null, phone || null, email || null, website || null]
    );

    return this.findById(result.insertId);
  }

  // ===== LECTURE =====
  static async findById(id) {
    const vendors = await db.query(
      `SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar, u.address
       FROM vendors v
       LEFT JOIN users u ON v.userId = u.id
       WHERE v.id = ?`,
      [id]
    );
    return vendors[0] || null;
  }

  static async findByUserId(userId) {
    const vendors = await db.query(
      `SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar, u.address
       FROM vendors v
       LEFT JOIN users u ON v.userId = u.id
       WHERE v.userId = ?`,
      [userId]
    );
    return vendors[0] || null;
  }

  static async findBySlug(slug) {
    const vendors = await db.query(
      `SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar, u.address
       FROM vendors v
       LEFT JOIN users u ON v.userId = u.id
       WHERE v.slug = ?`,
      [slug]
    );
    return vendors[0] || null;
  }

  static async findByIdOrSlug(identifier) {
    if (!isNaN(identifier)) {
      return this.findById(parseInt(identifier));
    }
    return this.findBySlug(identifier);
  }

  // ===== GESTION DES SLUGS =====
  static generateSlug(shopName) {
    if (!shopName) return '';
    return shopName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  static async slugExists(slug, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM vendors WHERE slug = ?';
    const params = [slug];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const result = await db.query(query, params);
    return result[0]?.count > 0;
  }

  static async createUniqueSlug(shopName, existingId = null) {
    let slug = this.generateSlug(shopName);
    if (!slug) slug = 'boutique';
    
    let counter = 1;
    let uniqueSlug = slug;
    
    while (await this.slugExists(uniqueSlug, existingId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  // ===== MISE À JOUR =====
  static async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = ['shopName', 'specialty', 'description', 'location', 
                           'coverImage', 'experience', 'verified', 'approved', 
                           'avatar', 'phone', 'website', 'status'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updates.shopName) {
      const currentVendor = await this.findById(id);
      if (currentVendor && currentVendor.shopName !== updates.shopName) {
        const newSlug = await this.createUniqueSlug(updates.shopName, id);
        fields.push('slug = ?');
        values.push(newSlug);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  // ===== LISTES =====
  static async getAll({ page = 1, limit = 20, search = '', specialty = null, 
                        verified = null, approved = true }) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let conditions = [];
      let params = [];

      if (approved !== null) {
        conditions.push('v.approved = ?');
        params.push(approved ? 1 : 0);
      }

      if (search) {
        conditions.push('(v.shopName LIKE ? OR u.name LIKE ? OR v.slug LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (specialty) {
        conditions.push('v.specialty = ?');
        params.push(specialty);
      }

      if (verified !== null) {
        conditions.push('v.verified = ?');
        params.push(verified ? 1 : 0);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM vendors v LEFT JOIN users u ON v.userId = u.id ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      const vendors = await db.query(
        `SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar,
                (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
                (SELECT COUNT(*) FROM followers WHERE vendor_id = v.id) as followersCount
         FROM vendors v
         LEFT JOIN users u ON v.userId = u.id
         ${whereClause}
         ORDER BY v.createdAt DESC
         LIMIT ${parseInt(limit)} OFFSET ${offset}`,
        params
      );

      return {
        data: vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans getAll:', error);
      throw error;
    }
  }

  static async getPending({ page = 1, limit = 20, search = '' }) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let conditions = ['v.approved = 0'];
      let params = [];

      if (search) {
        conditions.push('(v.shopName LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR v.slug LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM vendors v LEFT JOIN users u ON v.userId = u.id ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      const vendors = await db.query(
        `SELECT v.*, u.name, u.email, u.phone, u.avatar as userAvatar
         FROM vendors v
         LEFT JOIN users u ON v.userId = u.id
         ${whereClause}
         ORDER BY v.createdAt DESC
         LIMIT ${parseInt(limit)} OFFSET ${offset}`,
        params
      );

      return {
        data: vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans getPending:', error);
      throw error;
    }
  }

  // ===== STATISTIQUES =====
  static async count(verified = null) {
    let query = 'SELECT COUNT(*) as count FROM vendors';
    let params = [];
    if (verified !== null) {
      query += ' WHERE verified = ?';
      params.push(verified ? 1 : 0);
    }
    const result = await db.query(query, params);
    return result[0]?.count || 0;
  }

  static async countPending() {
    const result = await db.query('SELECT COUNT(*) as count FROM vendors WHERE approved = 0 AND status = "pending"');
    return result[0]?.count || 0;
  }

  static async countApproved() {
    const result = await db.query('SELECT COUNT(*) as count FROM vendors WHERE approved = 1');
    return result[0]?.count || 0;
  }

  static async countRejected() {
    const result = await db.query('SELECT COUNT(*) as count FROM vendors WHERE status = "rejected"');
    return result[0]?.count || 0;
  }

  // ===== FOLLOW =====
  static async toggleFollow(userId, vendorId) {
    const existing = await db.query(
      'SELECT * FROM followers WHERE user_id = ? AND vendor_id = ?',
      [userId, vendorId]
    );

    if (existing.length > 0) {
      await db.query('DELETE FROM followers WHERE user_id = ? AND vendor_id = ?', [userId, vendorId]);
      return { following: false };
    } else {
      await db.query('INSERT INTO followers (user_id, vendor_id, created_at) VALUES (?, ?, NOW())', 
                     [userId, vendorId]);
      return { following: true };
    }
  }

  static async getFollowersCount(vendorId) {
    const result = await db.query('SELECT COUNT(*) as count FROM followers WHERE vendor_id = ?', [vendorId]);
    return result[0]?.count || 0;
  }
}

module.exports = Vendor;