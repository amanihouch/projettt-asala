// backend/src/controllers/orderController.js - Version corrigée avec gestion robuste du vendorId
const Order = require('../models/Order');
const db = require('../models/db');

// ===== HELPER : résoudre le vendorId depuis req.user =====
const resolveVendorId = async (req) => {
  // 1. Disponible directement sur req.user (mis par le middleware auth)
  if (req.user.vendorId) return req.user.vendorId;

  // 2. Lookup DB par userId
  const vendor = await db.getOne('SELECT id FROM vendors WHERE userId = ?', [req.user.id]);
  return vendor ? vendor.id : null;
};

// ===== CRÉER UNE COMMANDE =====
exports.createOrder = async (req, res) => {
  try {
    console.log('📦 [createOrder] Données reçues:', req.body);

    const orderData = {
      vendorId: req.body.vendorId,
      vendorName: req.body.vendorName,
      userId: req.user?.id || req.body.userId || null,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone1: req.body.customerPhone1,
      customerPhone2: req.body.customerPhone2 || null,
      governorate: req.body.governorate,
      delegation: req.body.delegation,
      postalCode: req.body.postalCode || null,
      address: req.body.address,
      items: req.body.items,
      subtotal: req.body.subtotal || 0,
      shipping: req.body.shipping || 0,
      total: req.body.total || 0,
      paymentMethod: req.body.paymentMethod || 'cash_on_delivery',
      notes: req.body.notes || null,
      promoCode: req.body.promoCode || null,
      promoDiscount: req.body.promoDiscount || 0,
      status: 'pending'
    };

    if (!orderData.vendorId) {
      return res.status(400).json({ success: false, message: 'ID du vendeur requis' });
    }

    if (!orderData.customerName || !orderData.customerEmail || !orderData.customerPhone1) {
      return res.status(400).json({ success: false, message: 'Nom, email et téléphone sont obligatoires' });
    }

    if (!orderData.governorate || !orderData.delegation || !orderData.address) {
      return res.status(400).json({ success: false, message: 'Adresse complète requise (gouvernorat, délégation, adresse)' });
    }

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Au moins un produit requis' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      return res.status(400).json({ success: false, message: 'Format d\'email invalide' });
    }

    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(orderData.customerPhone1)) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide (8 chiffres requis)' });
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande',
      error: error.message
    });
  }
};

// ===== RÉCUPÉRER LES COMMANDES D'UN VENDEUR =====
exports.getVendorOrders = async (req, res) => {
  try {
    console.log('📦 [getVendorOrders] User:', req.user?.id, 'vendorId:', req.user?.vendorId);

    const vendorId = await resolveVendorId(req);

    if (!vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être un vendeur pour accéder à cette ressource'
      });
    }

    const { page = 1, limit = 20, status = null, search = '' } = req.query;

    const result = await Order.getByVendor(vendorId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status: status && status !== 'all' ? status : null,
      search: search || ''
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Erreur getVendorOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes du vendeur',
      error: error.message
    });
  }
};

// ===== RÉCUPÉRER UNE COMMANDE PAR ID =====
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isVendorOwner = req.user?.vendorId === order.vendor_id;
    const isOrderOwner = req.user?.id === order.user_id;

    if (!isAdmin && !isVendorOwner && !isOrderOwner) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à cette commande' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    console.error('❌ Erreur getOrderById:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la commande' });
  }
};

// ===== RÉCUPÉRER LES COMMANDES DE L'UTILISATEUR CONNECTÉ =====
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = null } = req.query;
    const userId = req.user.id;

    const result = await Order.getByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status: status && status !== 'all' ? status : null
    });

    res.json({
      success: true,
      data: result.data || result,
      pagination: result.pagination || { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 1 }
    });
  } catch (error) {
    console.error('❌ Erreur getMyOrders:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des commandes' });
  }
};

// ===== METTRE À JOUR LE STATUT D'UNE COMMANDE =====
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userRole = req.user.role;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    const isAdmin = userRole === 'admin';
    const vendorId = await resolveVendorId(req);
    const isVendorOwner = vendorId && (vendorId === order.vendorId || vendorId === order.vendor_id);

    if (!isAdmin && !isVendorOwner) {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à modifier cette commande' });
    }

    const updatedOrder = await Order.updateStatus(id, status, req.user.id, notes);

    res.json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('❌ Erreur updateOrderStatus:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut' });
  }
};

// ===== ANNULER UNE COMMANDE =====
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    const isAdmin = userRole === 'admin';
    const vendorId = await resolveVendorId(req);
    const isVendorOwner = vendorId && (vendorId === order.vendorId || vendorId === order.vendor_id);
    const isOrderOwner = (order.userId || order.user_id) === userId;

    if (!isAdmin && !isVendorOwner && !isOrderOwner) {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé à annuler cette commande' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Les commandes livrées ne peuvent pas être annulées' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cette commande est déjà annulée' });
    }

    const updatedOrder = await Order.updateStatus(id, 'cancelled', userId, reason || 'Annulée');

    res.json({ success: true, message: 'Commande annulée avec succès', data: { order: updatedOrder } });
  } catch (error) {
    console.error('❌ Erreur cancelOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'annulation de la commande' });
  }
};

// ===== STATISTIQUES POUR VENDEUR =====
exports.getVendorStats = async (req, res) => {
  try {
    const vendorId = await resolveVendorId(req);

    if (!vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être un vendeur pour accéder à cette ressource'
      });
    }

    const stats = await Order.getVendorStats(vendorId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Erreur getVendorStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

// ===== RÉCUPÉRER TOUTES LES COMMANDES (ADMIN) =====
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    const { page = 1, limit = 20, status = null, search = '', vendorId = null } = req.query;
    const result = await Order.getAll({ page, limit, status, search, vendorId });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Erreur getAllOrders:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des commandes' });
  }
};

// ===== STATISTIQUES GLOBALES (ADMIN) =====
exports.getGlobalStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    const stats = await Order.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Erreur getGlobalStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

// ===== SUPPRIMER UNE COMMANDE (ADMIN) =====
exports.deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }

    await Order.delete(req.params.id);
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur deleteOrder:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la commande' });
  }
};
