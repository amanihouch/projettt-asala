// backend/src/models/Post.js
const db = require('./db');

const Post = {
  // Create post
  async create(postData) {
    const {
      vendor_id, vendor_name, vendor_avatar, vendor_verified,
      category, product_name, description, content,
      price, old_price, colors, quantity, unit, in_stock,
      images, status
    } = postData;

    const sql = `
      INSERT INTO posts 
      (vendor_id, vendor_name, vendor_avatar, vendor_verified, category,
       product_name, description, content, price, old_price, colors,
       quantity, unit, in_stock, images, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const postId = await db.insert(sql, [
      vendor_id, vendor_name, vendor_avatar, vendor_verified ? 1 : 0, category,
      product_name, description || null, content || null,
      price, old_price || null,
      colors ? JSON.stringify(colors) : null,
      quantity || 1, unit || 'piece', in_stock !== false ? 1 : 0,
      images ? JSON.stringify(images) : null,
      status || 'pending'
    ]);

    return this.findById(postId);
  },

  // Find by ID
  async findById(id) {
    const sql = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             v.shop_name, u.name as user_name, u.avatar as user_avatar
      FROM posts p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE p.id = ?
    `;
    const post = await db.getOne(sql, [id]);

    if (post) {
      // Parse JSON fields
      if (post.colors) post.colors = JSON.parse(post.colors);
      if (post.images) post.images = JSON.parse(post.images);

      // Get comments
      post.comments = await db.query(`
        SELECT c.*, u.name as user_name, u.avatar as user_avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `, [id]);

      // Format dates
      post.createdAt = post.created_at;
      post.updatedAt = post.updated_at;
      post.publishedAt = post.published_at;
      post.rejectedAt = post.rejected_at;
      
      delete post.created_at;
      delete post.updated_at;
      delete post.published_at;
      delete post.rejected_at;
    }

    return post;
  },

  // Get all posts
  async getAll({ page = 1, limit = 20, status = null }) {
    let sql = `
      SELECT p.*, v.shop_name as vendor_shop,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await db.paginate(sql, params, page, limit);

    // Parse JSON fields
    result.data.forEach(post => {
      if (post.colors) post.colors = JSON.parse(post.colors);
      if (post.images) post.images = JSON.parse(post.images);
      post.createdAt = post.created_at;
      post.updatedAt = post.updated_at;
      delete post.created_at;
      delete post.updated_at;
    });

    return result;
  },

  // Get pending posts
  async getPending() {
    const sql = `
      SELECT p.*, v.shop_name,
             u.name as user_name, u.email, u.avatar
      FROM posts p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `;
    const posts = await db.query(sql);

    posts.forEach(post => {
      if (post.colors) post.colors = JSON.parse(post.colors);
      if (post.images) post.images = JSON.parse(post.images);
      post.createdAt = post.created_at;
      post.updatedAt = post.updated_at;
      delete post.created_at;
      delete post.updated_at;
    });

    return posts;
  },

  // Get posts by vendor
  async getByVendor(vendorId) {
    const sql = `
      SELECT * FROM posts
      WHERE vendor_id = ?
      ORDER BY created_at DESC
    `;
    const posts = await db.query(sql, [vendorId]);

    posts.forEach(post => {
      if (post.colors) post.colors = JSON.parse(post.colors);
      if (post.images) post.images = JSON.parse(post.images);
      post.createdAt = post.created_at;
      post.updatedAt = post.updated_at;
      delete post.created_at;
      delete post.updated_at;
    });

    return posts;
  },

  // Update post
  async update(id, updates) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'category', 'product_name', 'description', 'content',
      'price', 'old_price', 'colors', 'quantity', 'unit',
      'in_stock', 'images', 'status', 'admin_notes'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updates[key];
        if (key === 'colors' || key === 'images') {
          value = JSON.stringify(value);
        }
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    return this.findById(id);
  },

  // Approve post
  async approve(id) {
    await db.query(
      'UPDATE posts SET status = ?, published_at = NOW() WHERE id = ?',
      ['approved', id]
    );
    return this.findById(id);
  },

  // Reject post
  async reject(id, reason) {
    await db.query(
      'UPDATE posts SET status = ?, admin_notes = ?, rejected_at = NOW() WHERE id = ?',
      ['rejected', reason, id]
    );
    return this.findById(id);
  },

  // Delete post
  async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  },

  // Add comment
  async addComment(postId, userId, userName, userAvatar, comment) {
    const sql = `
      INSERT INTO comments (user_id, post_id, user_name, user_avatar, comment)
      VALUES (?, ?, ?, ?, ?)
    `;
    const commentId = await db.insert(sql, [
      userId, postId, userName, userAvatar, comment
    ]);

    // Update comments count
    await db.query(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
      [postId]
    );

    return db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
  },

  // Get comments
  async getComments(postId) {
    const sql = `
      SELECT c.*, u.name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `;
    return db.query(sql, [postId]);
  },

  // Delete comment
  async deleteComment(commentId) {
    const comment = await db.getOne('SELECT post_id FROM comments WHERE id = ?', [commentId]);
    if (!comment) return false;

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    // Update comments count
    await db.query(
      'UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?',
      [comment.post_id]
    );

    return true;
  },

  // Count posts by status
  async countByStatus() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM posts
      GROUP BY status
    `;
    const results = await db.query(sql);

    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    results.forEach(row => {
      counts[row.status] = row.count;
    });

    return counts;
  }
};

module.exports = Post;