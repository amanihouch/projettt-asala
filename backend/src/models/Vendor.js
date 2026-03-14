const db = require('./db');

const Vendor = {
  // ===== CRÉER UN VENDEUR =====
  async create(vendorData) {
    const {
      userId, shopName, description, specialty, location,
      coverImage, facebookUrl, instagramUrl, websiteUrl,
    } = vendorData;

    const socialLinks = {};
    if (facebookUrl) socialLinks.facebook = facebookUrl;
    if (instagramUrl) socialLinks.instagram = instagramUrl;
    if (websiteUrl) socialLinks.website = websiteUrl;

    const sql = `
      INSERT INTO vendors
      (userId, shopName, description, specialty, location,
       coverImage, socialLinks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const vendorId = await db.insert(sql, [
      userId,
      shopName,
      description,
      specialty,
      location,
      coverImage || null,
      Object.keys(socialLinks).length ? JSON.stringify(socialLinks) : null,
    ]);

    return this.findById(vendorId);
  },

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

  async findByUserId(userId) {
    const sql = 'SELECT * FROM vendors WHERE userId = ?';
    return db.getOne(sql, [userId]);
  },

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

  async update(id, updates) {
    let socialLinks = null;
    if (updates.facebookUrl || updates.instagramUrl || updates.websiteUrl) {
      socialLinks = {};
      if (updates.facebookUrl) socialLinks.facebook = updates.facebookUrl;
      if (updates.instagramUrl) socialLinks.instagram = updates.instagramUrl;
      if (updates.websiteUrl) socialLinks.website = updates.websiteUrl;
    }

    const fields = [];
    const values = [];
    const allowedFields = [
      'shopName', 'description', 'specialty', 'location',
      'verified', 'coverImage', 'rating', 'totalReviews',
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (socialLinks) {
      fields.push('socialLinks = ?');
      values.push(JSON.stringify(socialLinks));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async toggleVerification(id) {
    const vendor = await this.findById(id);
    if (!vendor) return null;
    const newStatus = vendor.verified ? 0 : 1;
    await db.query('UPDATE vendors SET verified = ? WHERE id = ?', [newStatus, id]);
    return { verified: newStatus === 1 };
  },

  async delete(id) {
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE vendorId = ?', [id]);
    if (hasProducts) {
      throw new Error('Impossible de supprimer un vendeur avec des produits');
    }
    await db.query('DELETE FROM vendors WHERE id = ?', [id]);
    return true;
  },

  async count(verified = null) {
    let sql = 'SELECT COUNT(*) as count FROM vendors';
    const params = [];
    if (verified !== null) {
      sql += ' WHERE verified = ?';
      params.push(verified ? 1 : 0);
    }
    const result = await db.getOne(sql, params);
    return result?.count || 0;
  },

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

  async toggleFollow(followerId, vendorId) {
    const exists = await db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
    if (exists) {
      await db.query('DELETE FROM followers WHERE followerId = ? AND vendorId = ?', [followerId, vendorId]);
      return { following: false };
    } else {
      await db.insert('INSERT INTO followers (followerId, vendorId) VALUES (?, ?)', [followerId, vendorId]);
      return { following: true };
    }
  },

  async isFollowing(followerId, vendorId) {
    return db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
  },

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
};

module.exports = Vendor;