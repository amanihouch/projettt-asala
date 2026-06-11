const db = require('./db');

const normalizeItem = (item) => ({
  productId: item.productId ?? item.id ?? null,
  productName: item.productName ?? item.name ?? 'Produit',
  price: Number(item.price ?? 0),
  quantity: Number(item.quantity ?? 1),
  image: item.image ?? null
});

const attachItemsToOrders = async (orders, pool = null) => {
  if (!orders.length) return orders;

  const ids = orders.map(o => o.id);
  const placeholders = ids.map(() => '?').join(',');

  const query = `SELECT id, order_id as orderId, product_id as productId, 
            product_name as productName, price, quantity, image
     FROM order_items
     WHERE order_id IN (${placeholders})
     ORDER BY id ASC`;

  const items = pool 
    ? (await pool.execute(query, ids))[0]
    : await db.query(query, ids);

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

      const [result] = await connection.execute(
        `INSERT INTO orders
        (orderNumber, userId, customerName, customerEmail, customerPhone1, customerPhone2,
         governorate, delegation, postalCode, address, subtotal, shipping, total, 
         paymentMethod, notes, status, vendorId, vendorName)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          orderData.userId || null,
          orderData.customerName,
          orderData.customerEmail,
          orderData.customerPhone1,
          orderData.customerPhone2 || null,
          orderData.governorate,
          orderData.delegation,
          orderData.postalCode || null,
          orderData.address,
          orderData.subtotal || 0,
          orderData.shipping || 0,
          orderData.total || 0,
          orderData.paymentMethod || 'cash_on_delivery',
          orderData.notes || null,
          'pending',
          orderData.vendorId || null,
          orderData.vendorName || null
        ]
      );

      const orderId = result.insertId;

      for (const rawItem of orderData.items) {
        const item = normalizeItem(rawItem);

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

  // ✅ Alias pour compatibilité avec orderController
  async create(orderData) {
    return this.createWithItems(orderData);
  },

  async findById(id) {
    const pool = db.getPool();
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders.length) return null;

    const [items] = await pool.execute(
      `SELECT id, order_id, product_id, product_name, price, quantity, image
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [id]
    );

    const order = orders[0];
    order.items = items.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      productName: item.product_name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image
    }));

    // ✅ Formatage pour compatibilité
    order.customer_name = order.customerName;
    order.customer_phone = order.customerPhone1;
    order.customer_email = order.customerEmail;
    order.vendor_id = order.vendorId;
    order.user_id = order.userId;

    return order;
  },

  async getByUser(userId, { page = 1, limit = 10, status = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    console.log('📦 Order.getByUser - userId:', userId);
    
    try {
      const pool = db.getPool();
      
      // Construire la requête avec filtre de statut
      let countSql = `SELECT COUNT(*) as total FROM orders WHERE userId = ?`;
      let querySql = `SELECT * FROM orders WHERE userId = ?`;
      const params = [userId];
      
      if (status && status !== 'all') {
        countSql += ` AND status = ?`;
        querySql += ` AND status = ?`;
        params.push(status);
      }
      
      const [countRows] = await pool.execute(countSql, params);
      const total = Number(countRows[0]?.total || 0);
      
      console.log('📊 Total commandes:', total);

      if (total === 0) {
        return { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } };
      }

      querySql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      const [rows] = await pool.execute(querySql, [...params, String(limitNum), String(offset)]);

      const orders = await attachItemsToOrders(rows, pool);

      return {
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error('❌ Erreur Order.getByUser:', error.message);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  },

  // ✅ Alias pour compatibilité
  async getMyOrders(userId, options) {
    return this.getByUser(userId, options);
  },

  async getByVendor(vendorId, { page = 1, limit = 20, status = null, search = '' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    try {
      const pool = db.getPool();
      let countSql = `SELECT COUNT(*) as total FROM orders WHERE vendorId = ?`;
      let querySql = `SELECT * FROM orders WHERE vendorId = ?`;
      const params = [vendorId];
      
      if (status && status !== 'all') {
        countSql += ` AND status = ?`;
        querySql += ` AND status = ?`;
        params.push(status);
      }
      
      if (search) {
        countSql += ` AND (orderNumber LIKE ? OR customerName LIKE ? OR customerEmail LIKE ? OR customerPhone1 LIKE ?)`;
        querySql += ` AND (orderNumber LIKE ? OR customerName LIKE ? OR customerEmail LIKE ? OR customerPhone1 LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const [countRows] = await pool.execute(countSql, params);
      const total = Number(countRows[0]?.total || 0);

      if (total === 0) {
        return { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 } };
      }

      querySql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      const [rows] = await pool.execute(querySql, [...params, String(limitNum), String(offset)]);

      const orders = await attachItemsToOrders(rows, pool);

      return {
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error('❌ Order.getByVendor error:', error);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  },

  async getAll({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const pool = db.getPool();
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

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.userId = u.id ${where}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);

    const [rows] = await pool.execute(
      `SELECT o.*, u.name as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ${where}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, String(limitNum), String(offset)]
    );

    const orders = await attachItemsToOrders(rows, pool);

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

  async updateStatus(id, { status, trackingNumber, adminNotes, cancellationReason } = {}) {
    const pool = db.getPool();
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
      if (cancellationReason) {
        fields.push('cancellationReason = ?');
        values.push(cancellationReason);
      }
    }

    if (!fields.length) return this.findById(id);

    values.push(id);

    await pool.execute(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  },

  async cancelOrder(id, reason = null) {
    return this.updateStatus(id, {
      status: 'cancelled',
      cancellationReason: reason || 'طلب من العميل'
    });
  },

  async getStats() {
    const pool = db.getPool();
    const [rows] = await pool.execute(
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
    
    const row = rows[0];
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

  async getVendorStats(vendorId) {
    const pool = db.getPool();
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_count,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_count,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 0) as total_revenue
       FROM orders
       WHERE vendorId = ?`,
      [vendorId]
    );
    
    const row = rows[0];
    return {
      total_orders: Number(row?.total_orders || 0),
      pending_count: Number(row?.pending_count || 0),
      processing_count: Number(row?.processing_count || 0),
      shipped_count: Number(row?.shipped_count || 0),
      delivered_count: Number(row?.delivered_count || 0),
      cancelled_count: Number(row?.cancelled_count || 0),
      total_revenue: Number(row?.total_revenue || 0)
    };
  },

  async getRecent(limit = 5) {
    const pool = db.getPool();
    const limitNum = Math.max(1, parseInt(limit, 10) || 5);
    const [rows] = await pool.execute(
      `SELECT o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt,
              u.name as userName
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC
       LIMIT ?`,
      [String(limitNum)]
    );
    return rows;
  }
};

module.exports = Order;