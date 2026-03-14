// backend/src/models/Post.js
const db = require('./db');

const Post = {
async create(postData) {
  const {
    vendor_id, vendor_name, vendor_avatar, vendor_verified,
    category, product_name, description, content,
    price, old_price, colors, quantity, unit, in_stock,
    images, status
  } = postData;

  const sql = `
    INSERT INTO posts 
    (vendorId, vendorName, vendorAvatar, vendorVerified, category,
     productName, description, content, price, oldPrice, colors,
     quantity, unit, inStock, images, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    vendor_id,
    vendor_name || null,
    vendor_avatar || null,
    vendor_verified ? 1 : 0,
    category || null,
    product_name,
    description || null,
    content || null,
    price,
    old_price || null,
    colors ? JSON.stringify(colors) : null,
    quantity || null,
    unit || null,
    in_stock !== undefined ? (in_stock ? 1 : 0) : 1, // par défaut true
    images ? JSON.stringify(images) : null,
    status || 'pending'
  ];

  const postId = await db.insert(sql, params);
  return this.findById(postId);
},

  async findById(id) {
    const sql = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount,
             v.shopName, u.name as userName, u.avatar as userAvatar
      FROM posts p
      JOIN vendors v ON p.vendorId = v.id
      JOIN users u ON v.userId = u.id
      WHERE p.id = ?
    `;
    const post = await db.getOne(sql, [id]);
    if (post) {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
      post.comments = await db.query(`
        SELECT c.*, u.name as userName, u.avatar as userAvatar
        FROM comments c
        JOIN users u ON c.userId = u.id
        WHERE c.postId = ?
        ORDER BY c.createdAt DESC
      `, [id]);
    }
    return post;
  },

  async getAll({ page = 1, limit = 20, status = null }) {
    let sql = `
      SELECT p.*, v.shopName as vendorShop,
             (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentsCount
      FROM posts p
      JOIN vendors v ON p.vendorId = v.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY p.createdAt DESC';
    const result = await db.paginate(sql, params, page, limit);
    result.data.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });
    return result;
  },

  async getPending() {
    const sql = `
      SELECT p.*, v.shopName,
             u.name as userName, u.email, u.avatar
      FROM posts p
      JOIN vendors v ON p.vendorId = v.id
      JOIN users u ON v.userId = u.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
    `;
    const posts = await db.query(sql);
    posts.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });
    return posts;
  },

  async getByVendor(vendorId) {
    const sql = `
      SELECT * FROM posts
      WHERE vendorId = ?
      ORDER BY createdAt DESC
    `;
    const posts = await db.query(sql, [vendorId]);
    posts.forEach(post => {
      try { post.colors = JSON.parse(post.colors); } catch { post.colors = []; }
      try { post.images = JSON.parse(post.images); } catch { post.images = []; }
    });
    return posts;
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    const allowedFields = [
      'category', 'productName', 'description', 'content',
      'price', 'oldPrice', 'colors', 'quantity', 'unit',
      'inStock', 'images', 'status', 'adminNotes'
    ];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        let value = updates[key];
        if (key === 'colors' || key === 'images') {
          value = JSON.stringify(value);
        }
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  },

  async approve(id) {
    await db.query(
      'UPDATE posts SET status = ?, publishedAt = NOW() WHERE id = ?',
      ['approved', id]
    );
    return this.findById(id);
  },

  async reject(id, reason) {
    await db.query(
      'UPDATE posts SET status = ?, adminNotes = ?, rejectedAt = NOW() WHERE id = ?',
      ['rejected', reason, id]
    );
    return this.findById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  },

  async addComment(postId, userId, userName, userAvatar, comment) {
    const sql = `
      INSERT INTO comments (userId, postId, userName, userAvatar, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    const commentId = await db.insert(sql, [userId, postId, userName, userAvatar, comment]);
    await db.query('UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?', [postId]);
    return db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
  },

  async getComments(postId) {
    const sql = `
      SELECT c.*, u.name, u.avatar
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC
    `;
    return db.query(sql, [postId]);
  },

  async deleteComment(commentId) {
    const comment = await db.getOne('SELECT postId FROM comments WHERE id = ?', [commentId]);
    if (!comment) return false;
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    await db.query('UPDATE posts SET commentsCount = commentsCount - 1 WHERE id = ?', [comment.postId]);
    return true;
  },

  async countByStatus() {
    const sql = `SELECT status, COUNT(*) as count FROM posts GROUP BY status`;
    const results = await db.query(sql);
    const counts = { pending: 0, approved: 0, rejected: 0 };
    results.forEach(r => counts[r.status] = r.count);
    return counts;
  }
};

module.exports = Post;