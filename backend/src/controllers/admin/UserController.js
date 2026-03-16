// backend/src/controllers/admin/UserController.js
const User = require('../../models/User');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES UTILISATEURS =====
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;

    let sql = `
      SELECT id, name, email, phone, role, avatar, isActive, lastLogin, createdAt
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY createdAt DESC';

    const result = await db.paginate(sql, params, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN UTILISATEUR =====
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
    const orderStats = await db.getOne(
      'SELECT COUNT(*) as orderCount, COALESCE(SUM(total), 0) as orderTotal FROM orders WHERE userId = ?',
      [user.id]
    );

    const vendor = await db.getOne('SELECT * FROM vendors WHERE userId = ?', [user.id]);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          orderCount: orderStats?.orderCount || 0,
          orderTotal: orderStats?.orderTotal || 0,
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
    const { name, email, phone, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const updated = await User.update(req.params.id, {
      name,
      email,
      phone,
      role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

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
    const hasOrders = await db.exists('SELECT 1 FROM orders WHERE userId = ?', [user.id]);
    if (hasOrders) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un utilisateur avec des commandes'
      });
    }

    await User.delete(req.params.id);

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
    await User.update(req.params.id, { isActive: newStatus });

    res.json({
      success: true,
      message: newStatus ? 'Utilisateur activé' : 'Utilisateur désactivé',
      data: { isActive: newStatus }
    });
  } catch (error) {
    console.error('❌ Erreur admin toggleUserStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};