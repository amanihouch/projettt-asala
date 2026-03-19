// backend/src/models/Vendor.js
const db = require('./db');

const Vendor = {
  // Create vendor
  async create(vendorData) {
    const {
      user_id, shop_name, description, specialty, location,
      experience, cover_image, facebook_url, instagram_url, website_url
    } = vendorData;

    const sql = `
      INSERT INTO vendors 
      (user_id, shop_name, description, specialty, location, experience, 
       cover_image, facebook_url, instagram_url, website_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const vendorId = await db.insert(sql, [
      user_id, shop_name, description, specialty, location, experience || 0,
      cover_image, facebook_url, instagram_url, website_url
    ]);

    return this.findById(vendorId);
  },

  // Find by ID
  async findById(id) {
    const sql = `
      SELECT v.*, u.name, u.email, u.phone, u.avatar,
             (SELECT COUNT(*) FROM products WHERE vendor_id = v.id) as products_count,
             (SELECT COUNT(*) FROM followers WHERE vendor_id = v.id) as followers_count
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `;
    const vendor = await db.getOne(sql, [id]);

    if (vendor) {
      // Format dates
      vendor.createdAt = vendor.created_at;
      vendor.updatedAt = vendor.updated_at;
      delete vendor.created_at;
      delete vendor.updated_at;
    }

    return vendor;
  },

  // Find by user ID
  async findByUserId(userId) {
    const sql = 'SELECT * FROM vendors WHERE user_id = ?';
    return db.getOne(sql, [userId]);
  },

  // Get all vendors
  async getAll({ page = 1, limit = 20, search = null, verified = null }) {
    let sql = `
      SELECT v.*, u.name, u.email, u.avatar,
             (SELECT COUNT(*) FROM products WHERE vendor_id = v.id) as products_count,
             (SELECT COUNT(*) FROM followers WHERE vendor_id = v.id) as followers_count
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (verified !== null) {
      sql += ' AND v.verified = ?';
      params.push(verified === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (v.shop_name LIKE ? OR v.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY v.created_at DESC';

    return db.paginate(sql, params, page, limit);
  },

  // Update vendor
  async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'shop_name', 'description', 'specialty', 'location', 'experience',
      'verified', 'cover_image', 'rating', 'total_reviews',
      'facebook_url', 'instagram_url', 'website_url'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Toggle verification
  async toggleVerification(id) {
    const vendor = await this.findById(id);
    if (!vendor) return null;

    const newStatus = vendor.verified ? 0 : 1;
    await db.query('UPDATE vendors SET verified = ? WHERE id = ?', [newStatus, id]);

    return { verified: newStatus === 1 };
  },

  // Delete vendor
  async delete(id) {
    // Check if vendor has products
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE vendor_id = ?', [id]);
    if (hasProducts) {
      throw new Error('Impossible de supprimer un vendeur avec des produits');
    }

    const sql = 'DELETE FROM vendors WHERE id = ?';
    await db.query(sql, [id]);
    return true;
  },

  // Count vendors
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

  // Get vendor products
  async getProducts(vendorId, { page = 1, limit = 10 }) {
    const sql = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as likes_count,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as main_image
      FROM products p
      WHERE p.vendor_id = ?
      ORDER BY p.created_at DESC
    `;
    return db.paginate(sql, [vendorId], page, limit);
  },

  // Follow/unfollow vendor
  async toggleFollow(followerId, vendorId) {
    const exists = await db.exists(
      'SELECT 1 FROM followers WHERE follower_id = ? AND vendor_id = ?',
      [followerId, vendorId]
    );

    if (exists) {
      await db.query('DELETE FROM followers WHERE follower_id = ? AND vendor_id = ?', [
        followerId, vendorId
      ]);
      return { following: false };
    } else {
      await db.insert('INSERT INTO followers (follower_id, vendor_id) VALUES (?, ?)', [
        followerId, vendorId
      ]);
      return { following: true };
    }
  },

  // Check if user follows vendor
  async isFollowing(followerId, vendorId) {
    return db.exists(
      'SELECT 1 FROM followers WHERE follower_id = ? AND vendor_id = ?',
      [followerId, vendorId]
    );
  },

  // Get recent vendors
  async getRecent(limit = 4) {
    const sql = `
      SELECT v.*, u.name, u.avatar,
             (SELECT COUNT(*) FROM products WHERE vendor_id = v.id) as products_count
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  }
};

module.exports = Vendor;