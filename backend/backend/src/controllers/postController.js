// backend/src/controllers/postController.js
const Post = require('../models/Post');
const db = require('../models/db');

// @desc    Get feed posts
// @route   GET /api/v1/posts/feed
// @access  Public
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await db.paginate(`
      SELECT p.*, 
             v.shopName as vendorShop,
             v.verified as vendorVerified
      FROM posts p
      JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
    `, [], page, limit);

    // Parse JSON fields
    for (let post of posts.data) {
      if (post.images) post.images = JSON.parse(post.images);
      post.createdAt = post.createdAt;
    }

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('❌ Erreur getFeed:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du feed',
      error: error.message
    });
  }
};

// @desc    Get posts by vendor
// @route   GET /api/v1/posts/vendor/:vendorId
// @access  Public
exports.getVendorPosts = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const posts = await Post.getByVendor(vendorId);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('❌ Erreur getVendorPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des posts',
      error: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur getPostById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du post',
      error: error.message
    });
  }
};

// @desc    Create post (vendor only)
// @route   POST /api/v1/posts
// @access  Private/Vendor
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get vendor ID
    const vendor = await db.getOne(
      'SELECT id FROM vendors WHERE userId = ?',
      [userId]
    );

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être un vendeur pour créer un post'
      });
    }

    const {
      category, productName, description, content,
      price, oldPrice, colors, quantity, unit,
      inStock, images
    } = req.body;

    const post = await Post.create({
      vendor_id: vendor.id,
      vendor_name: req.user.name,
      vendor_avatar: req.user.avatar,
      vendor_verified: false,
      category,
      product_name: productName,
      description,
      content,
      price,
      old_price: oldPrice,
      colors,
      quantity,
      unit,
      in_stock: inStock !== false,
      images,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Post créé avec succès, en attente de validation',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur createPost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du post',
      error: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { comment } = req.body;

    if (!comment || comment.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Le commentaire doit contenir au moins 2 caractères'
      });
    }

    const newComment = await Post.addComment(
      postId,
      userId,
      req.user.name,
      req.user.avatar,
      comment
    );

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('❌ Erreur addComment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};