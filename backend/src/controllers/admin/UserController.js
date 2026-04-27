const User = require('../../models/User');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES UTILISATEURS - VERSION CORRIGÉE =====
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';

    console.log('📊 Paramètres:', { page, limit, search, role });

    // Construire la requête de base
    let sql = `
      SELECT id, name, email, phone, role, avatar, isActive, lastLogin, createdAt
      FROM users
      WHERE 1=1
    `;
    const params = [];

    // Ajouter les filtres
    if (role && role !== 'all' && role !== '') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    // Compter le total
    let countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    console.log('📊 Count SQL:', countSql);
    console.log('📊 Count params:', params);
    
    let total = 0;
    try {
      const countResult = await db.getOne(countSql, params);
      total = countResult?.total || 0;
    } catch (err) {
      console.error('❌ Erreur count:', err.message);
      // Si erreur, essayer sans les filtres
      const fallbackCount = await db.getOne('SELECT COUNT(*) as total FROM users');
      total = fallbackCount?.total || 0;
    }

    // Calculer l'offset
    const offset = (page - 1) * limit;
    
    // Récupérer les données avec pagination
    let dataSql = sql + ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const dataParams = [...params, limit, offset];
    
    console.log('📊 Data SQL:', dataSql);
    console.log('📊 Data params:', dataParams);
    
    let users = [];
    try {
      users = await db.query(dataSql, dataParams);
    } catch (err) {
      console.error('❌ Erreur data:', err.message);
      // Fallback: récupérer sans pagination
      users = await db.query(sql + ' ORDER BY createdAt DESC', params);
    }

    console.log('✅ Utilisateurs trouvés:', users.length);

    res.json({
      success: true,
      data: {
        data: users,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// ===== RÉCUPÉRER UN UTILISATEUR PAR ID (fonctionne déjà) =====
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les statistiques
    let orderStats = { orderCount: 0, orderTotal: 0 };
    try {
      const result = await db.getOne(
        'SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal FROM orders WHERE userId = ?',
        [user.id]
      );
      if (result) {
        orderStats = result;
      }
    } catch (err) {
      console.log('⚠️ Erreur récupération commandes:', err.message);
    }

    let vendor = null;
    try {
      vendor = await db.getOne('SELECT * FROM vendors WHERE userId = ?', [user.id]);
    } catch (err) {
      console.log('⚠️ Erreur récupération vendeur:', err.message);
    }

    res.json({
      success: true,
      data: {
        user,
        stats: {
          orderCount: orderStats.orderCount || 0,
          orderTotal: orderStats.orderTotal || 0,
          isVendor: !!vendor,
          vendorId: vendor?.id
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getUserById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN UTILISATEUR =====
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive, address } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== parseInt(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (address !== undefined) updates.address = address;

    const updated = await User.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateUser:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN UTILISATEUR =====
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier s'il a des commandes
    let hasOrders = false;
    try {
      const orderResult = await db.getOne('SELECT 1 FROM orders WHERE userId = ? LIMIT 1', [user.id]);
      hasOrders = !!orderResult;
    } catch (err) {
      console.log('⚠️ Erreur vérification commandes:', err.message);
    }
    
    if (hasOrders) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un utilisateur avec des commandes'
      });
    }

    // Supprimer les relations de wishlist
    try {
      await db.query('DELETE FROM wishlist WHERE user_id = ?', [user.id]);
    } catch (err) {
      console.log('⚠️ Erreur suppression wishlist:', err.message);
    }

    // Supprimer les likes
    try {
      await db.query('DELETE FROM product_likes WHERE userId = ?', [user.id]);
      await db.query('DELETE FROM post_likes WHERE userId = ?', [user.id]);
    } catch (err) {
      console.log('⚠️ Erreur suppression likes:', err.message);
    }

    // Supprimer l'utilisateur
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deleteUser:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== ACTIVER/DÉSACTIVER UN UTILISATEUR =====
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const newStatus = !user.isActive;
    const updated = await User.update(req.params.id, { isActive: newStatus });

    res.json({
      success: true,
      message: newStatus ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès',
      data: { isActive: newStatus, user: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin toggleUserStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};