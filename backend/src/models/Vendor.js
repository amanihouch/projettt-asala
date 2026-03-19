// backend/src/models/Vendor.js
const db = require('./db');

const Vendor = {
  // ===== CRÉER UN VENDEUR =====
  async create(vendorData) {
    const {
      userId, shopName, description, specialty, location,
      coverImage, experience, verified = false
    } = vendorData;

    console.log('📝 Vendor.create avec données:', { 
      userId, 
      shopName, 
      experience,
      coverImageLength: coverImage ? coverImage.length : 0 
    });

    // ✅ Vérifier que l'utilisateur existe
    const userExists = await db.getOne('SELECT id FROM users WHERE id = ?', [userId]);
    if (!userExists) {
      const error = new Error(`Utilisateur avec ID ${userId} non trouvé`);
      console.error('❌', error.message);
      throw error;
    }

    // ✅ Vérifier que le vendeur n'existe pas déjà
    const existingVendor = await this.findByUserId(userId);
    if (existingVendor) {
      const error = new Error(`Un vendeur existe déjà pour l'utilisateur ${userId}`);
      console.error('❌', error.message);
      throw error;
    }

    // ✅ Traitement de l'image de couverture
    let coverImageUrl = coverImage || null;
    
    // Si c'est une dataURL trop longue, on peut la logger
    if (coverImageUrl && coverImageUrl.length > 1000) {
      console.log(`⚠️ coverImage longue: ${coverImageUrl.length} caractères`);
      
      // Vérifier si c'est une dataURL (commence par data:image)
      if (coverImageUrl.startsWith('data:image')) {
        // Estimer la taille en KB
        const sizeInKB = Math.round(coverImageUrl.length * 0.75 / 1024);
        console.log(`📸 Taille estimée: ${sizeInKB}KB`);
        
        // Si trop grande, on peut la compresser côté backend (optionnel)
        if (sizeInKB > 500) {
          console.warn(`⚠️ Image très grande: ${sizeInKB}KB, risque d'erreur`);
        }
      }
    }

    const sql = `
      INSERT INTO vendors
      (userId, shopName, description, specialty, location,
       coverImage, experience, verified, rating, totalReviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `;

    try {
      const vendorId = await db.insert(sql, [
        userId,
        shopName,
        description,
        specialty,
        location || 'تونس',
        coverImageUrl,
        experience || 0,
        verified ? 1 : 0
      ]);

      console.log('✅ Vendeur créé avec ID:', vendorId);
      return this.findById(vendorId);
    } catch (error) {
      console.error('❌ Erreur Vendor.create:', error);
      console.log('📝 SQL:', sql);
      console.log('📦 Données:', [
        userId,
        shopName,
        description ? description.substring(0, 50) + '...' : null,
        specialty,
        location,
        coverImageUrl ? coverImageUrl.substring(0, 50) + '...' : null,
        experience,
        verified ? 1 : 0
      ]);
      
      // Gestion spécifique de l'erreur de taille
      if (error.code === 'ER_DATA_TOO_LONG') {
        console.error('💡 La colonne coverImage est trop petite. Exécutez cette commande SQL:');
        console.error('   ALTER TABLE vendors MODIFY coverImage TEXT;');
      }
      
      throw error;
    }
  },

  // ===== RECHERCHER PAR ID =====
  async findById(id) {
    const sql = `
      SELECT v.*, 
             u.name, u.email, u.phone, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'approved') as postsCount,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'pending') as pendingPostsCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.id = ?
    `;
    return db.getOne(sql, [id]);
  },

  // ===== RECHERCHER PAR USER ID =====
  async findByUserId(userId) {
    const sql = 'SELECT * FROM vendors WHERE userId = ?';
    return db.getOne(sql, [userId]);
  },

  // ===== RÉCUPÉRER TOUS LES VENDEURS =====
  async getAll({ page = 1, limit = 20, search = null, specialty = null, verified = null }) {
    try {
      console.log('📦 getAll vendors called with:', { page, limit, search, specialty, verified });
      
      const pool = db.pool;
      
      // 1. REQUÊTE DE COMPTAGE
      let countSql = `
        SELECT COUNT(*) as total
        FROM vendors v
        JOIN users u ON v.userId = u.id
        WHERE 1=1
      `;
      const countParams = [];

      if (verified !== null && verified !== undefined) {
        countSql += ' AND v.verified = ?';
        countParams.push(verified ? 1 : 0);
      }

      if (specialty && specialty !== '') {
        countSql += ' AND v.specialty = ?';
        countParams.push(specialty);
      }

      if (search && search !== '') {
        countSql += ' AND (v.shopName LIKE ? OR v.description LIKE ? OR u.name LIKE ?)';
        const term = `%${search}%`;
        countParams.push(term, term, term);
      }

      console.log('📝 Count SQL:', countSql);
      console.log('📦 Count params:', countParams);

      const [countRows] = await pool.query(countSql, countParams);
      const total = countRows[0]?.total || 0;
      console.log('✅ Total vendors:', total);

      // 2. REQUÊTE PRINCIPALE
      let dataSql = `
        SELECT v.*, 
               u.name, u.email, u.avatar as userAvatar,
               (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
               (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount,
               (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'approved') as postsCount
        FROM vendors v
        JOIN users u ON v.userId = u.id
        WHERE 1=1
      `;
      const dataParams = [];

      if (verified !== null && verified !== undefined) {
        dataSql += ' AND v.verified = ?';
        dataParams.push(verified ? 1 : 0);
      }

      if (specialty && specialty !== '') {
        dataSql += ' AND v.specialty = ?';
        dataParams.push(specialty);
      }

      if (search && search !== '') {
        dataSql += ' AND (v.shopName LIKE ? OR v.description LIKE ? OR u.name LIKE ?)';
        const term = `%${search}%`;
        dataParams.push(term, term, term);
      }

      dataSql += ' ORDER BY v.createdAt DESC LIMIT ? OFFSET ?';
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      dataParams.push(limitNum, offset);

      console.log('📝 Data SQL:', dataSql);
      console.log('📦 Data params (with pagination):', dataParams);

      const [vendors] = await pool.query(dataSql, dataParams);
      console.log('✅ Vendors found:', vendors.length);

      return {
        data: vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans Vendor.getAll:', error);
      throw error;
    }
  },

  // ===== METTRE À JOUR UN VENDEUR =====
  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = [
      'shopName', 'description', 'specialty', 'location',
      'coverImage', 'experience', 'verified', 'rating', 'totalReviews'
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

  // ===== METTRE À JOUR L'IMAGE DE COUVERTURE =====
  async updateCoverImage(id, coverImageUrl) {
    return this.update(id, { coverImage: coverImageUrl });
  },

  // ===== SUPPRIMER UN VENDEUR =====
  async delete(id) {
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE vendorId = ?', [id]);
    if (hasProducts) {
      throw new Error('Impossible de supprimer un vendeur avec des produits');
    }
    
    const hasPosts = await db.exists('SELECT 1 FROM posts WHERE vendorId = ?', [id]);
    if (hasPosts) {
      throw new Error('Impossible de supprimer un vendeur avec des posts');
    }
    
    await db.query('DELETE FROM vendors WHERE id = ?', [id]);
    return true;
  },

  // ===== RÉCUPÉRER LES PRODUITS D'UN VENDEUR =====
  async getProducts(vendorId, { page = 1, limit = 10 }) {
    try {
      const pool = db.pool;
      
      const [countRows] = await pool.query(
        'SELECT COUNT(*) as total FROM products WHERE vendorId = ?',
        [vendorId]
      );
      const total = countRows[0]?.total || 0;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      
      const sql = `
        SELECT p.*
        FROM products p
        WHERE p.vendorId = ?
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [products] = await pool.query(sql, [vendorId, limitNum, offset]);

      return {
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans Vendor.getProducts:', error);
      throw error;
    }
  },

  // ===== RÉCUPÉRER LES POSTS D'UN VENDEUR =====
  async getPosts(vendorId, { page = 1, limit = 10, status = null }) {
    try {
      const pool = db.pool;
      
      let countSql = 'SELECT COUNT(*) as total FROM posts WHERE vendorId = ?';
      let sql = 'SELECT * FROM posts WHERE vendorId = ?';
      const params = [vendorId];
      
      if (status) {
        countSql += ' AND status = ?';
        sql += ' AND status = ?';
        params.push(status);
      }
      
      const [countRows] = await pool.query(countSql, params);
      const total = countRows[0]?.total || 0;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      
      sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      
      const postsParams = status ? [vendorId, status, limitNum, offset] : [vendorId, limitNum, offset];
      const [posts] = await pool.query(sql, postsParams);

      return {
        data: posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans Vendor.getPosts:', error);
      throw error;
    }
  },

  // ===== SUIVRE / NE PLUS SUIVRE =====
  async toggleFollow(followerId, vendorId) {
    const exists = await db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
    
    if (exists) {
      await db.query(
        'DELETE FROM followers WHERE followerId = ? AND vendorId = ?', 
        [followerId, vendorId]
      );
      
      const count = await db.getOne(
        'SELECT COUNT(*) as count FROM followers WHERE vendorId = ?',
        [vendorId]
      );
      
      return { 
        following: false, 
        followersCount: count?.count || 0 
      };
    } else {
      await db.insert(
        'INSERT INTO followers (followerId, vendorId) VALUES (?, ?)', 
        [followerId, vendorId]
      );
      
      const count = await db.getOne(
        'SELECT COUNT(*) as count FROM followers WHERE vendorId = ?',
        [vendorId]
      );
      
      return { 
        following: true, 
        followersCount: count?.count || 0 
      };
    }
  },

  // ===== VÉRIFIER SI L'UTILISATEUR SUIT =====
  async isFollowing(followerId, vendorId) {
    return db.exists(
      'SELECT 1 FROM followers WHERE followerId = ? AND vendorId = ?',
      [followerId, vendorId]
    );
  },

  // ===== RÉCUPÉRER LES VENDEURS RÉCENTS =====
  async getRecent(limit = 4) {
    const pool = db.pool;
    const [vendors] = await pool.query(`
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'approved') as postsCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.verified = 1
      ORDER BY v.createdAt DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    return vendors;
  },

  // ===== RÉCUPÉRER LES MEILLEURS VENDEURS =====
  async getTopVendors(limit = 8) {
    const pool = db.pool;
    const [vendors] = await pool.query(`
      SELECT v.*, u.name, u.avatar as userAvatar,
             (SELECT COUNT(*) FROM products WHERE vendorId = v.id) as productsCount,
             (SELECT COUNT(*) FROM followers WHERE vendorId = v.id) as followersCount,
             (SELECT COUNT(*) FROM posts WHERE vendorId = v.id AND status = 'approved') as postsCount
      FROM vendors v
      JOIN users u ON v.userId = u.id
      WHERE v.verified = 1
      ORDER BY v.rating DESC, followersCount DESC, productsCount DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    return vendors;
  },

  // ===== COMPTER LES VENDEURS =====
  async count(verified = null) {
    const pool = db.pool;
    let sql = 'SELECT COUNT(*) as count FROM vendors';
    const params = [];
    
    if (verified !== null) {
      sql += ' WHERE verified = ?';
      params.push(verified ? 1 : 0);
    }
    
    const [rows] = await pool.query(sql, params);
    return rows[0]?.count || 0;
  }
};

module.exports = Vendor;