// backend/src/controllers/admin/UserController.js
const User = require('../../models/User');
const Order = require('../../models/Order');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const result = await User.getAll({ page, limit, search, role });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.getUserWithStats(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Get user orders
    const orders = await Order.getByUser(req.params.id, { page: 1, limit: 10 });

    res.json({
      success: true,
      data: {
        user,
        orders: orders.data
      }
    });
  } catch (error) {
    console.error('❌ Erreur getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;

    // Check if email exists
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id != req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    const updates = {
      name,
      email,
      phone,
      role,
      is_active: isActive
    };

    const user = await User.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Erreur updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
      error: error.message
    });
  }
};