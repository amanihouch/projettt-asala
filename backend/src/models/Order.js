const db = require('./db');

const normalizeItem = (item) => ({
  productId: item.productId ?? item.id ?? null,
  productName: item.productName ?? item.name ?? 'Produit',
  price: Number(item.price ?? 0),
  quantity: Number(item.quantity ?? 1),
  image: item.image ?? null
});

const attachItemsToOrders = async (orders) => {
  if (!orders.length) return orders;

  const ids = orders.map(o => o.id);
  const placeholders = ids.map(() => '?').join(',');

  // CORRECTION: Utiliser order_items au lieu de orderItems
  const items = await db.query(
    `SELECT id, order_id as orderId, product_id as productId, 
            product_name as productName, price, quantity, image
     FROM order_items
     WHERE order_id IN (${placeholders})
     ORDER BY id ASC`,
    ids
  );

  const grouped = {};
  for (const item of items) {
    if (!grouped[item.orderId]) grouped[item.orderId] = [];
    grouped[item.orderId].push({
      id: item.id,
      productId: item.productId,
      name: item.productName,
      productName: item.productName,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image
    });
  }

  return orders.map(order => ({
    ...order,
    items: grouped[order.id] || []
  }));
};

const Order = {
  generateOrderNumber() {
    const d = new Date();
    const y = d.getFullYear().toString().slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `ORD-${y}${m}${day}-${rand}`;
  },

  async createWithItems(orderData) {
    const pool = db.getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const orderNumber = this.generateOrderNumber();

      // CORRECTION: Utiliser les noms de colonnes corrects (snake_case)
      const [result] = await connection.execute(
        `INSERT INTO orders
        (orderNumber, userId, customerName, customerEmail, customerPhone1, customerPhone2,
         governorate, delegation, postalCode, address, subtotal, shippingCost, total, paymentMethod, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          orderData.userId,
          orderData.customerName,
          orderData.customerEmail,
          orderData.customerPhone1,
          orderData.customerPhone2 || null,
          orderData.governorate,
          orderData.delegation,
          orderData.postalCode || null,
          orderData.address,
          orderData.subtotal,
          orderData.shipping,
          orderData.total,
          orderData.paymentMethod || 'cash_on_delivery',
          orderData.notes || null,
          'pending'
        ]
      );

      const orderId = result.insertId;

      for (const rawItem of orderData.items) {
        const item = normalizeItem(rawItem);

        // CORRECTION: Utiliser order_items au lieu de orderItems
        await connection.execute(
          `INSERT INTO order_items
          (order_id, product_id, product_name, price, quantity, image)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.price,
            item.quantity,
            item.image || null
          ]
        );
      }

      await connection.commit();
      return this.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findById(id) {
    // CORRECTION: Utiliser les noms de colonnes corrects
    const order = await db.getOne(
      `SELECT o.*, u.name as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) return null;

    // CORRECTION: Utiliser order_items
    const items = await db.query(
      `SELECT id, order_id, product_id, product_name, price, quantity, image
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [id]
    );

    order.items = items.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      productName: item.product_name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image
    }));

    return order;
  },

  async getByUser(userId, { page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const countRow = await db.getOne(
      `SELECT COUNT(*) as total FROM orders WHERE userId = ?`,
      [userId]
    );
    const total = Number(countRow?.total || 0);

    const rows = await db.query(
      `SELECT *
       FROM orders
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [userId, limitNum, offset]
    );

    const orders = await attachItemsToOrders(rows);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  async getAll({ page = 1, limit = 20, status = '', search = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    let where = ' WHERE 1=1 ';
    const params = [];

    if (status) {
      where += ' AND o.status = ? ';
      params.push(status);
    }

    if (search) {
      where += ` AND (
        o.orderNumber LIKE ? OR
        o.customerName LIKE ? OR
        o.customerEmail LIKE ? OR
        o.customerPhone1 LIKE ?
      ) `;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const countRow = await db.getOne(
      `SELECT COUNT(*) as total
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ${where}`,
      params
    );
    const total = Number(countRow?.total || 0);

    const rows = await db.query(
      `SELECT o.*, u.name as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ${where}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const orders = await attachItemsToOrders(rows);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  async updateStatus(id, { status, trackingNumber, adminNotes, cancellationReason }) {
    const fields = [];
    const values = [];

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (trackingNumber !== undefined) {
      fields.push('trackingNumber = ?');
      values.push(trackingNumber);
    }

    if (adminNotes !== undefined) {
      fields.push('adminNotes = ?');
      values.push(adminNotes);
    }

    if (status === 'delivered') {
      fields.push('deliveredAt = NOW()');
    }

    if (status === 'cancelled') {
      fields.push('cancelledAt = NOW()');
      fields.push('cancellationReason = ?');
      values.push(cancellationReason || null);
    }

    if (!fields.length) return this.findById(id);

    values.push(id);

    await db.update(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  async getStats() {
    const row = await db.getOne(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as revenue
       FROM orders`
    );

    return {
      total: Number(row?.total || 0),
      pending: Number(row?.pending || 0),
      processing: Number(row?.processing || 0),
      shipped: Number(row?.shipped || 0),
      delivered: Number(row?.delivered || 0),
      cancelled: Number(row?.cancelled || 0),
      revenue: Number(row?.revenue || 0)
    };
  },

  async getRecent(limit = 5) {
    const limitNum = Math.max(1, parseInt(limit, 10) || 5);
    return db.query(
      `SELECT o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt,
              u.name as userName
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC
       LIMIT ?`,
      [limitNum]
    );
  }
};

module.exports = Order;