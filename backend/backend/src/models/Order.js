// backend/src/models/Order.js
const db = require('./db');

const Order = {
  // Generate order number
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  },

  // Create order
  async create(orderData) {
    const {
      user_id, customer_name, customer_email, customer_phone1, customer_phone2,
      governorate, delegation, postal_code, address,
      subtotal, shipping, total, payment_method, notes
    } = orderData;

    const orderNumber = this.generateOrderNumber();

    const sql = `
      INSERT INTO orders 
      (order_number, user_id, customer_name, customer_email, customer_phone1, customer_phone2,
       governorate, delegation, postal_code, address,
       subtotal, shipping, total, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderId = await db.insert(sql, [
      orderNumber, user_id, customer_name, customer_email, customer_phone1, customer_phone2 || null,
      governorate, delegation, postal_code || null, address,
      subtotal, shipping || 0, total, payment_method || 'cash', notes || null
    ]);

    return this.findById(orderId);
  },

  // Add order items
  async addItems(orderId, items) {
    const values = items.map(item => 
      `(${orderId}, ${item.product_id || 'NULL'}, '${item.name}', ${item.price}, ${item.quantity}, '${item.image || ''}')`
    ).join(',');

    const sql = `
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
      VALUES ${values}
    `;
    
    await db.query(sql);
  },

  // Find by ID
  async findById(id) {
    const sql = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    const order = await db.getOne(sql, [id]);

    if (order) {
      // Get items
      order.items = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );

      // Format dates
      order.createdAt = order.created_at;
      order.updatedAt = order.updated_at;
      order.deliveredAt = order.delivered_at;
      order.cancelledAt = order.cancelled_at;
      order.estimatedDelivery = order.estimated_delivery;
      
      delete order.created_at;
      delete order.updated_at;
      delete order.delivered_at;
      delete order.cancelled_at;
      delete order.estimated_delivery;
    }

    return order;
  },

  // Find by order number
  async findByOrderNumber(orderNumber) {
    const sql = 'SELECT id FROM orders WHERE order_number = ?';
    const result = await db.getOne(sql, [orderNumber]);
    if (result) {
      return this.findById(result.id);
    }
    return null;
  },

  // Get all orders
  async getAll({ page = 1, limit = 20, search = null, status = null, fromDate = null, toDate = null }) {
    let sql = `
      SELECT o.*, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (fromDate) {
      sql += ' AND o.created_at >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      sql += ' AND o.created_at <= ?';
      params.push(toDate);
    }

    if (search) {
      sql += ' AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone1 LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY o.created_at DESC';

    const result = await db.paginate(sql, params, page, limit);

    // Format dates
    result.data.forEach(order => {
      order.createdAt = order.created_at;
      order.updatedAt = order.updated_at;
      delete order.created_at;
      delete order.updated_at;
    });

    return result;
  },

  // Update order status
  async updateStatus(id, { status, trackingNumber, notes, cancellationReason }) {
    const fields = ['status = ?'];
    const values = [status];

    if (trackingNumber) {
      fields.push('tracking_number = ?');
      values.push(trackingNumber);
    }

    if (notes) {
      fields.push('admin_notes = ?');
      values.push(notes);
    }

    if (status === 'delivered') {
      fields.push('delivered_at = NOW()');
    } else if (status === 'cancelled') {
      fields.push('cancelled_at = NOW()');
      fields.push('cancellation_reason = ?');
      values.push(cancellationReason || null);
    }

    values.push(id);
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Get orders by user
  async getByUser(userId, { page = 1, limit = 10 }) {
    const sql = `
      SELECT o.*
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    return db.paginate(sql, [userId], page, limit);
  },

  // Delete order (only cancelled)
  async delete(id) {
    const order = await this.findById(id);
    if (!order) return false;

    if (order.status !== 'cancelled') {
      throw new Error('Seules les commandes annulées peuvent être supprimées');
    }

    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return true;
  },

  // Get order stats
  async getStats() {
    const [total, pending, processing, shipped, delivered, cancelled, revenue] = await Promise.all([
      db.count('SELECT COUNT(*) as count FROM orders'),
      db.count('SELECT COUNT(*) as count FROM orders WHERE status = "pending"'),
      db.count('SELECT COUNT(*) as count FROM orders WHERE status = "processing"'),
      db.count('SELECT COUNT(*) as count FROM orders WHERE status = "shipped"'),
      db.count('SELECT COUNT(*) as count FROM orders WHERE status = "delivered"'),
      db.count('SELECT COUNT(*) as count FROM orders WHERE status = "cancelled"'),
      db.getOne('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != "cancelled"')
    ]);

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue: revenue?.total || 0
    };
  },

  // Get recent orders
  async getRecent(limit = 5) {
    const sql = `
      SELECT o.id, o.order_number, o.customer_name, o.total, o.status, o.created_at,
             u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  },

  // Get orders by date range for charts
  async getOrdersByDateRange(startDate, endDate, groupBy = 'day') {
    let groupFormat;
    if (groupBy === 'day') {
      groupFormat = 'DATE(created_at)';
    } else if (groupBy === 'month') {
      groupFormat = 'DATE_FORMAT(created_at, "%Y-%m")';
    } else {
      groupFormat = 'DATE_FORMAT(created_at, "%Y-%m-%d")';
    }

    const sql = `
      SELECT ${groupFormat} as date, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at BETWEEN ? AND ?
      GROUP BY ${groupFormat}
      ORDER BY date ASC
    `;
    return db.query(sql, [startDate, endDate]);
  }
};

module.exports = Order;