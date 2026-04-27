const Order = require('../models/Order');

const normalizeOrderPayload = (body, userId) => {
  return {
    userId,
    customerName: body.customerName ?? body.customer?.name ?? '',
    customerEmail: body.customerEmail ?? body.customer?.email ?? '',
    customerPhone1: body.customerPhone1 ?? body.customer?.phone1 ?? '',
    customerPhone2: body.customerPhone2 ?? body.customer?.phone2 ?? null,
    governorate: body.governorate ?? body.delivery?.governorate ?? '',
    delegation: body.delegation ?? body.delivery?.delegation ?? '',
    postalCode: body.postalCode ?? body.delivery?.postalCode ?? null,
    address: body.address ?? body.delivery?.address ?? '',
    items: Array.isArray(body.items) ? body.items : [],
    subtotal: Number(body.subtotal ?? 0),
    shipping: Number(body.shipping ?? body.shippingCost ?? 0),
    total: Number(body.total ?? 0),
    paymentMethod: body.paymentMethod ?? 'cash_on_delivery',
    notes: body.notes ?? null
  };
};

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const payload = normalizeOrderPayload(req.body, req.user.id);

    if (!payload.customerName || !payload.customerEmail || !payload.customerPhone1) {
      return res.status(400).json({
        success: false,
        message: 'Les informations client sont incomplètes'
      });
    }

    if (!payload.governorate || !payload.delegation || !payload.address) {
      return res.status(400).json({
        success: false,
        message: 'Les informations de livraison sont incomplètes'
      });
    }

    if (!payload.items.length) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article'
      });
    }

    const order = await Order.createWithItems(payload);

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

// @desc    Get user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Order.getByUser(req.user.id, { page, limit });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Erreur getMyOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des commandes',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir cette commande'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('❌ Erreur getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la commande',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler cette commande'
      });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut plus être annulée'
      });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, {
      status: 'cancelled',
      cancellationReason: req.body.reason || 'Annulé par le client'
    });

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('❌ Erreur cancelOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation',
      error: error.message
    });
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/v1/orders/admin/all
// @access  Private/Admin
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const result = await Order.getAll({ page, limit, status, search });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Erreur adminGetAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des commandes',
      error: error.message
    });
  }
};

// @desc    Admin: Update order status
// @route   PATCH /api/v1/orders/admin/:id/status
// @access  Private/Admin
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, {
      status,
      trackingNumber,
      adminNotes
    });

    res.json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('❌ Erreur adminUpdateOrderStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};