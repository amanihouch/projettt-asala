// backend/src/controllers/admin/PostController.js
const Post = require('../../models/Post');
const Product = require('../../models/Product');

// @desc    Obtenir tous les posts
// @route   GET /api/v1/admin/posts
// @access  Private/Admin
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await Post.getAll({ page, limit, status });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des posts',
      error: error.message
    });
  }
};

// @desc    Obtenir les posts en attente
// @route   GET /api/v1/admin/posts/pending
// @access  Private/Admin
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.getPending();

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('❌ Erreur getPendingPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des posts en attente',
      error: error.message
    });
  }
};

// @desc    Obtenir un post par ID
// @route   GET /api/v1/admin/posts/:id
// @access  Private/Admin
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

// @desc    Approuver un post
// @route   PATCH /api/v1/admin/posts/:id/approve
// @access  Private/Admin
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.approve(req.params.id);

    // Create product from post
    const productData = {
      vendor_id: post.vendor_id,
      name: post.product_name,
      description: post.description,
      price: post.price,
      old_price: post.old_price,
      category: post.category,
      colors: post.colors,
      quantity: post.quantity,
      unit: post.unit,
      in_stock: post.in_stock,
      status: 'approved'
    };

    const product = await Product.create(productData);
    
    if (post.images) {
      await Product.addImages(product.id, post.images);
    }

    res.json({
      success: true,
      message: 'Post approuvé avec succès',
      data: { post, product }
    });
  } catch (error) {
    console.error('❌ Erreur approvePost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
      error: error.message
    });
  }
};

// @desc    Rejeter un post
// @route   PATCH /api/v1/admin/posts/:id/reject
// @access  Private/Admin
exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La raison du rejet est requise'
      });
    }

    const post = await Post.reject(req.params.id, reason);

    res.json({
      success: true,
      message: 'Post rejeté',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur rejectPost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un post
// @route   PUT /api/v1/admin/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const {
      category, productName, description, content,
      price, oldPrice, colors, quantity, unit, inStock,
      images, status, adminNotes
    } = req.body;

    const updates = {
      category,
      product_name: productName,
      description,
      content,
      price,
      old_price: oldPrice,
      colors,
      quantity,
      unit,
      in_stock: inStock,
      images,
      status,
      admin_notes: adminNotes
    };

    const post = await Post.update(req.params.id, updates);

    res.json({
      success: true,
      message: 'Post mis à jour avec succès',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur updatePost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Supprimer un post
// @route   DELETE /api/v1/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);

    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deletePost:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};