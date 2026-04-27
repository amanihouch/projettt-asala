// backend/src/controllers/admin/VendorController.js
const Vendor = require('../../models/Vendor');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES VENDEURS (ADMIN) =====
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', verified = '' } = req.query;
    
    // Utiliser la méthode getAll du modèle Vendor avec approved = null pour admin
    const result = await Vendor.getAll({
      page,
      limit,
      search,
      verified: verified === 'true' ? true : (verified === 'false' ? false : null),
      approved: null // Admin voit tous les vendeurs
    });
    
    // Formater les URLs des images
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map(vendor => {
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) {
          const baseURL = `${req.protocol}://${req.get('host')}`;
          vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
        }
        if (vendor.coverImage && !vendor.coverImage.startsWith('http')) {
          const baseURL = `${req.protocol}://${req.get('host')}`;
          vendor.coverImage = `${baseURL}${vendor.coverImage}`;
        }
        return vendor;
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllVendors:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES VENDEURS EN ATTENTE =====
exports.getPendingVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const result = await Vendor.getPending({ page, limit, search });
    
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map(vendor => {
        if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) {
          const baseURL = `${req.protocol}://${req.get('host')}`;
          vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
        }
        return vendor;
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getPendingVendors:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES STATISTIQUES =====
exports.getVendorStats = async (req, res) => {
  try {
    const total = await Vendor.count();
    const approved = await Vendor.countApproved();
    const pending = await Vendor.countPending();
    const verified = await Vendor.count(true);
    
    res.json({
      success: true,
      data: {
        total,
        approved,
        pending,
        verified,
        rejected: total - approved - pending,
        pendingPercentage: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
        approvedPercentage: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getVendorStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN VENDEUR PAR ID =====
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    // Formater les URLs des images
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (vendor.userAvatar && !vendor.userAvatar.startsWith('http')) {
      vendor.userAvatar = `${baseURL}${vendor.userAvatar}`;
    }
    if (vendor.coverImage && !vendor.coverImage.startsWith('http')) {
      vendor.coverImage = `${baseURL}${vendor.coverImage}`;
    }

    // Récupérer les produits
    const products = await Vendor.getProducts(req.params.id, { page: 1, limit: 100 });

    // Récupérer les posts
    const posts = await db.query(
      'SELECT * FROM posts WHERE vendorId = ? ORDER BY createdAt DESC LIMIT 20',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        vendor,
        products: products.data,
        posts
      }
    });
  } catch (error) {
    console.error('❌ Erreur admin getVendorById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN VENDEUR =====
exports.updateVendor = async (req, res) => {
  try {
    const { shopName, specialty, description, location, verified, approved } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    const updated = await Vendor.update(req.params.id, {
      shopName,
      specialty,
      description,
      location,
      verified: verified !== undefined ? verified : vendor.verified,
      approved: approved !== undefined ? approved : vendor.approved
    });

    // Formater les URLs des images
    const baseURL = `${req.protocol}://${req.get('host')}`;
    if (updated.userAvatar && !updated.userAvatar.startsWith('http')) {
      updated.userAvatar = `${baseURL}${updated.userAvatar}`;
    }
    if (updated.coverImage && !updated.coverImage.startsWith('http')) {
      updated.coverImage = `${baseURL}${updated.coverImage}`;
    }

    res.json({
      success: true,
      message: 'Vendeur mis à jour avec succès',
      data: { vendor: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN VENDEUR =====
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    // Vérifier s'il a des produits
    const hasProducts = await db.exists('SELECT 1 FROM products WHERE vendorId = ?', [vendor.id]);
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un vendeur avec des produits'
      });
    }

    await db.query('DELETE FROM vendors WHERE id = ?', [vendor.id]);

    res.json({
      success: true,
      message: 'Vendeur supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deleteVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== ACTIVER/DÉSACTIVER LA VÉRIFICATION =====
exports.toggleVerification = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    const newStatus = !vendor.verified;
    await Vendor.update(req.params.id, { verified: newStatus });

    res.json({
      success: true,
      message: newStatus ? 'Vendeur vérifié' : 'Vérification retirée',
      data: { verified: newStatus }
    });
  } catch (error) {
    console.error('❌ Erreur admin toggleVerification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== APPROUVER UN VENDEUR =====
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    await Vendor.update(req.params.id, { approved: 1 });
    
    // Mettre à jour le rôle de l'utilisateur
    await db.query('UPDATE users SET role = ? WHERE id = ?', ['vendor', vendor.userId]);

    res.json({
      success: true,
      message: 'Vendeur approuvé avec succès',
      data: { vendor }
    });
  } catch (error) {
    console.error('❌ Erreur admin approveVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== REJETER UN VENDEUR =====
exports.rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    await Vendor.update(req.params.id, { approved: 2 });

    res.json({
      success: true,
      message: 'Vendeur rejeté',
      data: { vendor, reason }
    });
  } catch (error) {
    console.error('❌ Erreur admin rejectVendor:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};