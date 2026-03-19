// backend/src/controllers/productController.js
const Product = require('../models/Product');
const db = require('../models/db');

// @desc    Get all products (public)
// @route   GET /api/v1/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      sort = 'newest',
      minPrice,
      maxPrice,
      featured,
      sponsored
    } = req.query;

    let sql = `
      SELECT p.*, 
             v.shopName as vendor_shop,
             v.verified as vendor_verified,
             (SELECT COUNT(*) FROM likes WHERE productId = p.id) as likesCount,
             (SELECT imageUrl FROM product_images WHERE productId = p.id ORDER BY displayOrder LIMIT 1) as mainImage
      FROM products p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (category) {
      sql += ' AND p.categoryId = ?';
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND p.isFeatured = 1';
    }

    if (sponsored === 'true') {
      sql += ' AND p.isSponsored = 1';
    }

    if (minPrice) {
      sql += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ' ORDER BY p.price ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC';
        break;
      case 'popular':
        sql += ' ORDER BY p.likesCount DESC';
        break;
      default:
        sql += ' ORDER BY p.createdAt DESC';
    }

    const result = await db.paginate(sql, params, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Increment views
    await Product.incrementViews(req.params.id);

    // Get related products (same category)
    const related = await db.query(`
      SELECT p.*, 
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM products p
      WHERE p.categoryId = ? AND p.id != ? AND p.status = 'active'
      LIMIT 4
    `, [product.categoryId, product.id]);

    res.json({
      success: true,
      data: {
        product,
        related
      }
    });
  } catch (error) {
    console.error('❌ Erreur getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du produit',
      error: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, 
             v.shopName as vendor_shop,
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM products p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.isFeatured = 1 AND p.status = 'active'
      ORDER BY p.createdAt DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('❌ Erreur getFeaturedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits vedettes',
      error: error.message
    });
  }
};

// @desc    Get sponsored products
// @route   GET /api/v1/products/sponsored
// @access  Public
exports.getSponsoredProducts = async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, 
             v.shopName as vendor_shop,
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM products p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.isSponsored = 1 AND p.status = 'active'
      ORDER BY RAND()
      LIMIT 4
    `);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('❌ Erreur getSponsoredProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits sponsorisés',
      error: error.message
    });
  }
};

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await db.paginate(`
      SELECT p.*, 
             (SELECT imageUrl FROM product_images WHERE productId = p.id LIMIT 1) as mainImage
      FROM products p
      WHERE p.categoryId = ? AND p.status = 'active'
      ORDER BY p.createdAt DESC
    `, [categoryId], page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits',
      error: error.message
    });
  }
};

// @desc    Toggle like on product
// @route   POST /api/v1/products/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const result = await Product.toggleLike(userId, productId);

    // Update likes count in products table
    const likesCount = await db.count(
      'SELECT COUNT(*) as count FROM likes WHERE productId = ?',
      [productId]
    );

    await db.query(
      'UPDATE products SET likesCount = ? WHERE id = ?',
      [likesCount, productId]
    );

    res.json({
      success: true,
      message: result.liked ? 'Produit ajouté aux favoris' : 'Produit retiré des favoris',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur toggleLike:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du like',
      error: error.message
    });
  }
};