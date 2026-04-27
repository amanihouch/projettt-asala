// backend/src/controllers/productController.js - Version FINALE CORRIGÉE
const catchAsync = require('../utils/catchAsync');
const db = require('../models/db');
const { deleteImage, deleteMultipleImages } = require('../config/cloudinary');

// ===== ROUTES PUBLIQUES =====

exports.getAllProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT p.*, v.shopName, v.verified as vendorVerified,
           c.slug as categorySlug, c.name as categoryName
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE 1=1
  `;
  let countQuery = `SELECT COUNT(*) as total FROM products p WHERE 1=1`;
  const params = [];
  const countParams = [];

  query += ` AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')`;
  countQuery += ` AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')`;

  if (category) {
    query += ' AND c.slug = ?';
    countQuery += ' AND c.slug = ?';
    params.push(category);
    countParams.push(category);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY p.createdAt DESC LIMIT ? OFFSET ?';
  params.push(limitNum, offset);
  
  let total = 0;
  try {
    const countResult = await db.query(countQuery, countParams);
    total = countResult[0]?.total || 0;
  } catch (error) {
    console.error('❌ Erreur comptage:', error);
    total = 0;
  }
  
  let products = [];
  if (total > 0) {
    try {
      products = await db.query(query, params);
    } catch (error) {
      console.error('❌ Erreur requête paginée:', error);
      products = [];
    }
  }

  const baseURL = `${req.protocol}://${req.get('host')}`;
  products.forEach(product => {
    if (product.images) {
      try {
        let images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (Array.isArray(images)) {
          product.images = images.map(img => img && !img.startsWith('http') ? `${baseURL}${img}` : img);
          product.mainImage = product.images[0] || null;
        }
      } catch (e) {
        product.images = [];
      }
    }
  });

  res.json({
    success: true,
    data: { products, total, page: pageNum, pages: Math.ceil(total / limitNum) }
  });
});

exports.getSponsoredProducts = catchAsync(async (req, res) => {
  const products = await db.query(`
    SELECT p.*, v.shopName, c.slug as categorySlug
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.isSponsored = 1 AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')
    ORDER BY p.createdAt DESC LIMIT 12
  `);
  res.json({ success: true, data: { products: products || [] } });
});

exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await db.query(`
    SELECT p.*, v.shopName, c.slug as categorySlug
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.isFeatured = 1 AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')
    ORDER BY p.createdAt DESC LIMIT 10
  `);
  res.json({ success: true, data: { products: products || [] } });
});

exports.getProductsByVendor = catchAsync(async (req, res) => {
  const { vendorId } = req.params;
  if (!vendorId) return res.status(400).json({ success: false, message: 'ID vendeur requis' });
  const products = await db.query(`
    SELECT p.*, v.shopName, c.slug as categorySlug
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.vendorId = ? AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')
    ORDER BY p.createdAt DESC
  `, [vendorId]);
  res.json({ success: true, data: products || [] });
});

exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const categoryResult = await db.getOne('SELECT id FROM categories WHERE slug = ?', [category]);
  if (!categoryResult) return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
  const categoryId = categoryResult.id;

  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM products p WHERE p.categoryId = ? AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')`,
    [categoryId]
  );
  const total = countResult[0]?.total || 0;
  
  let products = [];
  if (total > 0) {
    products = await db.query(
      `SELECT p.*, v.shopName, c.slug as categorySlug
       FROM products p
       LEFT JOIN vendors v ON p.vendorId = v.id
       LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.categoryId = ? ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`,
      [categoryId, limitNum, offset]
    );
  }

  res.json({ success: true, data: { products, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

exports.searchProducts = catchAsync(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;
  if (!q) return res.status(400).json({ success: false, message: 'Terme de recherche requis' });

  const searchTerm = `%${q}%`;
  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM products p WHERE (p.name LIKE ? OR p.description LIKE ?) AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')`,
    [searchTerm, searchTerm]
  );
  const total = countResult[0]?.total || 0;
  
  let products = [];
  if (total > 0) {
    products = await db.query(
      `SELECT p.*, v.shopName, c.slug as categorySlug
       FROM products p
       LEFT JOIN vendors v ON p.vendorId = v.id
       LEFT JOIN categories c ON p.categoryId = c.id
       WHERE (p.name LIKE ? OR p.description LIKE ?) AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')
       ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, limitNum, offset]
    );
  }

  res.json({ success: true, data: { products, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await db.getOne(`
    SELECT p.*, v.shopName, v.verified as vendorVerified, v.userId as vendorUserId,
           c.slug as categorySlug, c.name as categoryName
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ?
  `, [id]);

  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);

  if (product.images) {
    try {
      let images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(images)) {
        product.images = images;
        product.mainImage = images[0] || null;
      }
    } catch (e) {
      product.images = [];
    }
  }

  res.json({ success: true, data: { product } });
});

exports.getSimilarProducts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await db.getOne('SELECT categoryId FROM products WHERE id = ?', [id]);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  
  const products = await db.query(`
    SELECT p.*, v.shopName FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    WHERE p.categoryId = ? AND p.id != ? AND (p.status IS NULL OR p.status = 'approved')
    ORDER BY RAND() LIMIT 4
  `, [product.categoryId, id]);
  
  res.json({ success: true, data: { products: products || [] } });
});

// ===== GESTION DES COMMENTAIRES =====

exports.getProductComments = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const productExists = await db.getOne('SELECT id FROM products WHERE id = ?', [id]);
  if (!productExists) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

  const countResult = await db.query('SELECT COUNT(*) as total FROM comments WHERE productId = ?', [id]);
  const total = countResult[0]?.total || 0;

  let comments = [];
  if (total > 0) {
    comments = await db.query(`
      SELECT c.*, u.name as userName, u.avatar as userAvatar
      FROM comments c JOIN users u ON c.userId = u.id
      WHERE c.productId = ? ORDER BY c.createdAt DESC LIMIT ? OFFSET ?
    `, [id, limitNum, offset]);
  }

  res.json({ success: true, data: { comments, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

exports.addProductComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { text, rating } = req.body;
  const userId = req.user.id;

  if (!text || text.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Commentaire trop court' });
  }

  const product = await db.getOne('SELECT id FROM products WHERE id = ?', [id]);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

  const commentId = await db.insert(
    'INSERT INTO comments (userId, productId, text, rating, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [userId, id, text.trim(), rating || null]
  );

  const comment = await db.getOne(`
    SELECT c.*, u.name as userName, u.avatar as userAvatar
    FROM comments c JOIN users u ON c.userId = u.id WHERE c.id = ?
  `, [commentId]);

  await db.query('UPDATE products SET reviewsCount = (SELECT COUNT(*) FROM comments WHERE productId = ?) WHERE id = ?', [id, id]);

  res.status(201).json({ success: true, message: 'Commentaire ajouté', data: { comment } });
});

exports.deleteProductComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const comment = await db.getOne('SELECT id, userId, productId FROM comments WHERE id = ?', [commentId]);
  if (!comment) return res.status(404).json({ success: false, message: 'Commentaire non trouvé' });
  if (!isAdmin && comment.userId !== userId) return res.status(403).json({ success: false, message: 'Non autorisé' });

  await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
  await db.query('UPDATE products SET reviewsCount = (SELECT COUNT(*) FROM comments WHERE productId = ?) WHERE id = ?', [comment.productId, comment.productId]);

  res.json({ success: true, message: 'Commentaire supprimé' });
});

// ===== LIKES =====

exports.toggleLike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const existing = await db.getOne('SELECT id FROM likes WHERE userId = ? AND productId = ?', [userId, id]);
  if (existing) {
    await db.query('DELETE FROM likes WHERE userId = ? AND productId = ?', [userId, id]);
    res.json({ success: true, data: { liked: false } });
  } else {
    await db.query('INSERT INTO likes (userId, productId, createdAt) VALUES (?, ?, NOW())', [userId, id]);
    res.json({ success: true, data: { liked: true } });
  }
});

exports.checkLikeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const like = await db.getOne('SELECT id FROM likes WHERE userId = ? AND productId = ?', [req.user.id, id]);
  res.json({ success: true, data: { liked: !!like } });
});

exports.getUserLikedProducts = catchAsync(async (req, res) => {
  const products = await db.query(`
    SELECT p.*, v.shopName FROM likes l
    JOIN products p ON l.productId = p.id
    LEFT JOIN vendors v ON p.vendorId = v.id
    WHERE l.userId = ? ORDER BY l.createdAt DESC
  `, [req.user.id]);
  res.json({ success: true, data: { products } });
});

// ===== PARTAGES =====

exports.incrementShares = catchAsync(async (req, res) => {
  await db.query('UPDATE products SET shares = shares + 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== ROUTES PROTÉGÉES (VENDEUR) =====

exports.createProduct = catchAsync(async (req, res) => {
  const { name, description, price, categoryId, colors, quantity, unit } = req.body;
  const vendorId = req.user.vendorId;
  
  if (!vendorId) return res.status(403).json({ success: false, message: 'Profil vendeur requis' });

  let images = [];
  if (req.files && req.files.length > 0) images = req.files.map(file => file.path);

  const productId = await db.insert(
    `INSERT INTO products (name, description, price, categoryId, images, vendorId, colors, quantity, unit, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [name, description, parseFloat(price), categoryId, JSON.stringify(images), vendorId, JSON.stringify(colors || []), quantity || 1, unit || 'piece']
  );

  const product = await db.getOne('SELECT * FROM products WHERE id = ?', [productId]);
  res.status(201).json({ success: true, message: 'Produit créé', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const product = await db.getOne('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  if (req.user.role !== 'admin' && product.vendorId !== req.user.vendorId) return res.status(403).json({ success: false, message: 'Non autorisé' });

  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== 'id') {
      if (key === 'colors' || key === 'images') { fields.push(`${key} = ?`); values.push(JSON.stringify(value)); }
      else { fields.push(`${key} = ?`); values.push(value); }
    }
  }
  if (fields.length > 0) {
    values.push(id);
    await db.query(`UPDATE products SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`, values);
  }

  const updatedProduct = await db.getOne('SELECT * FROM products WHERE id = ?', [id]);
  res.json({ success: true, message: 'Produit mis à jour', data: { product: updatedProduct } });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await db.getOne('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
  if (req.user.role !== 'admin' && product.vendorId !== req.user.vendorId) return res.status(403).json({ success: false, message: 'Non autorisé' });

  if (product.images) {
    try {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(images) && images.length > 0) await deleteMultipleImages(images);
    } catch (e) {}
  }

  await db.query('DELETE FROM products WHERE id = ?', [id]);
  res.json({ success: true, message: 'Produit supprimé' });
});

// Dans productController.js, vérifiez que ces fonctions existent :

exports.getMyProducts = catchAsync(async (req, res) => {
  const products = await db.query('SELECT * FROM products WHERE vendorId = ? ORDER BY createdAt DESC', [req.user.vendorId]);
  res.json({ success: true, data: { products } });
});

exports.getVendorProductStats = catchAsync(async (req, res) => {
  const stats = await db.getOne(`
    SELECT COUNT(*) as total, SUM(views) as totalViews,
    SUM(CASE WHEN status = 'approved' OR status = 'active' THEN 1 ELSE 0 END) as active
    FROM products WHERE vendorId = ?
  `, [req.user.vendorId]);
  res.json({ success: true, data: stats || { total: 0, totalViews: 0, active: 0 } });
});

// ===== ROUTES ADMIN =====

exports.getAllProductsAdmin = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status = 'all' } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT p.*, u.name as vendorName, v.shopName, c.slug as categorySlug
    FROM products p
    LEFT JOIN vendors v ON p.vendorId = v.id
    LEFT JOIN users u ON v.userId = u.id
    LEFT JOIN categories c ON p.categoryId = c.id WHERE 1=1
  `;
  const params = [];
  if (status !== 'all') { query += ' AND p.status = ?'; params.push(status); }

  const countQuery = query.replace(/SELECT p\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await db.query(countQuery, params);
  const total = countResult[0]?.total || 0;

  query += ' ORDER BY p.createdAt DESC LIMIT ? OFFSET ?';
  params.push(limitNum, offset);
  const products = await db.query(query, params);

  res.json({ success: true, data: { products, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

exports.approveProduct = catchAsync(async (req, res) => {
  await db.query('UPDATE products SET status = ? WHERE id = ?', ['approved', req.params.id]);
  res.json({ success: true });
});

exports.rejectProduct = catchAsync(async (req, res) => {
  await db.query('UPDATE products SET status = ?, adminNotes = ? WHERE id = ?', ['rejected', req.body.reason || null, req.params.id]);
  res.json({ success: true });
});

exports.toggleSponsored = catchAsync(async (req, res) => {
  const p = await db.getOne('SELECT isSponsored FROM products WHERE id = ?', [req.params.id]);
  await db.query('UPDATE products SET isSponsored = ? WHERE id = ?', [p.isSponsored ? 0 : 1, req.params.id]);
  res.json({ success: true });
});

exports.toggleFeatured = catchAsync(async (req, res) => {
  const p = await db.getOne('SELECT isFeatured FROM products WHERE id = ?', [req.params.id]);
  await db.query('UPDATE products SET isFeatured = ? WHERE id = ?', [p.isFeatured ? 0 : 1, req.params.id]);
  res.json({ success: true });
});

exports.getAdminProductStats = catchAsync(async (req, res) => {
  const stats = await db.getOne('SELECT COUNT(*) as total, SUM(views) as totalViews FROM products');
  res.json({ success: true, data: stats || {} });
});

exports.getCategoryDistribution = catchAsync(async (req, res) => {
  const data = await db.query('SELECT categoryId, COUNT(*) as count FROM products GROUP BY categoryId');
  res.json({ success: true, data });
});

exports.getPendingProducts = catchAsync(async (req, res) => {
  const products = await db.query('SELECT * FROM products WHERE status = ?', ['pending']);
  res.json({ success: true, data: { products } });
});

exports.getMostLikedProducts = catchAsync(async (req, res) => {
  const products = await db.query(`
    SELECT p.*, COUNT(l.id) as likesCount FROM products p
    LEFT JOIN likes l ON p.id = l.productId
    GROUP BY p.id ORDER BY likesCount DESC LIMIT 10
  `);
  res.json({ success: true, data: { products } });
});

exports.getProductWithLikeStatus = catchAsync(async (req, res) => {
  const product = await db.getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  let liked = false;
  if (req.user) {
    const like = await db.getOne('SELECT id FROM likes WHERE userId = ? AND productId = ?', [req.user.id, req.params.id]);
    liked = !!like;
  }
  res.json({ success: true, data: { product, liked } });
});

module.exports = exports;