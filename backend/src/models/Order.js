// backend/src/models/Order.js
const db = require('./db');

const Order = {
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  },

  async create(orderData) {
    const {
      userId, customerName, customerEmail, customerPhone1, customerPhone2,
      governorate, delegation, postalCode, address,
      subtotal, shipping, total, paymentMethod, notes
    } = orderData;

    const orderNumber = this.generateOrderNumber();
    const sql = `
      INSERT INTO orders 
      (orderNumber, userId, customerName, customerEmail, customerPhone1, customerPhone2,
       governorate, delegation, postalCode, address,
       subtotal, shippingCost, total, paymentMethod, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const orderId = await db.insert(sql, [
      orderNumber, userId, customerName, customerEmail, customerPhone1, customerPhone2 || null,
      governorate, delegation, postalCode || null, address,
      subtotal, shipping || 0, total, paymentMethod || 'cash', notes || null
    ]);
    return this.findById(orderId);
  },

  async addItems(orderId, items) {
    const values = items.map(item => 
      `(${orderId}, ${item.productId || 'NULL'}, '${item.name}', ${item.price}, ${item.quantity}, '${item.image || ''}')`
    ).join(',');
    const sql = `
      INSERT INTO orderItems (orderId, productId, productName, price, quantity, image)
      VALUES ${values}
    `;
    await db.query(sql);
  },

  async findById(id) {
    const sql = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM orders o
      JOIN users u ON o.userId = u.id
      WHERE o.id = ?
    `;
    const order = await db.getOne(sql, [id]);
    if (order) {
      order.items = await db.query('SELECT * FROM orderItems WHERE orderId = ?', [id]);
    }
    return order;
  },

  async getAll({ page = 1, limit = 20, search = null, status = null, fromDate = null, toDate = null }) {
    let sql = `
      SELECT o.*, u.name as userName
      FROM orders o
      JOIN users u ON o.userId = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (fromDate) {
      sql += ' AND o.createdAt >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      sql += ' AND o.createdAt <= ?';
      params.push(toDate);
    }
    if (search) {
      sql += ' AND (o.orderNumber LIKE ? OR o.customerName LIKE ? OR o.customerEmail LIKE ? OR o.customerPhone1 LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    sql += ' ORDER BY o.createdAt DESC';
    return db.paginate(sql, params, page, limit);
  },

  async updateStatus(id, { status, trackingNumber, notes, cancellationReason }) {
    const fields = ['status = ?'];
    const values = [status];
    if (trackingNumber) {
      fields.push('trackingNumber = ?');
      values.push(trackingNumber);
    }
    if (notes) {
      fields.push('adminNotes = ?');
      values.push(notes);
    }
    if (status === 'delivered') {
      fields.push('deliveredAt = NOW()');
    } else if (status === 'cancelled') {
      fields.push('cancelledAt = NOW()');
      fields.push('cancellationReason = ?');
      values.push(cancellationReason || null);
    }
    values.push(id);
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async getByUser(userId, { page = 1, limit = 10 }) {
    const sql = `
      SELECT o.*
      FROM orders o
      WHERE o.userId = ?
      ORDER BY o.createdAt DESC
    `;
    return db.paginate(sql, [userId], page, limit);
  },

  async delete(id) {
    const order = await this.findById(id);
    if (!order) return false;
    if (order.status !== 'cancelled') {
      throw new Error('Seules les commandes annulées peuvent être supprimées');
    }
    await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return true;
  },

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

  async getRecent(limit = 5) {
    const sql = `
      SELECT o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt,
             u.name as userName
      FROM orders o
      JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  },

  async getOrdersByDateRange(startDate, endDate, groupBy = 'day') {
    let format;
    if (groupBy === 'day') format = 'DATE(createdAt)';
    else if (groupBy === 'month') format = 'DATE_FORMAT(createdAt, "%Y-%m")';
    else format = 'DATE(createdAt)';
    const sql = `
      SELECT ${format} as date, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE createdAt BETWEEN ? AND ?
      GROUP BY ${format}
      ORDER BY date ASC
    `;
    return db.query(sql, [startDate, endDate]);
  }
};

module.exports = Order;