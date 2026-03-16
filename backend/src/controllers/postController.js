// backend/src/controllers/postController.js
const Post = require('../models/Post');
const Vendor = require('../models/Vendor');
const db = require('../models/db');

// ===== RÉCUPÉRER LE FEED =====
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Post.getFeed({ page, limit });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getFeed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER LES POSTS D'UN VENDEUR =====
exports.getVendorPosts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    console.log('📦 Récupération des posts pour le vendeur:', vendorId);

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendeur non trouvé'
      });
    }

    const userId = req.user?.id;
    const isOwner = userId && vendor.userId === userId;
    const includePending = isOwner || req.user?.role === 'admin';

    const result = await Post.getByVendor(vendorId, { 
      page, 
      limit, 
      includePending 
    });

    console.log(`✅ ${result.data.length} posts trouvés`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur getVendorPosts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN POST PAR ID =====
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
      message: error.message
    });
  }
};

// ===== CRÉER UN POST =====
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📝 Création de post par utilisateur:', userId);

    const vendor = await Vendor.findByUserId(userId);
    
    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être un vendeur pour créer un post'
      });
    }

    console.log('🏪 Vendeur trouvé:', vendor.id, vendor.shopName);

    const {
      productName, description, content, category,
      price, oldPrice, colors, quantity, unit,
      inStock, images
    } = req.body;

    if (!productName || !price) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du produit et le prix sont requis'
      });
    }

    const postData = {
      vendorId: vendor.id,
      vendorName: vendor.shopName,
      vendorAvatar: vendor.avatar || req.user.avatar,
      vendorVerified: vendor.verified || false,
      category: category || null,
      productName,
      description: description || null,
      content: content || null,
      price,
      oldPrice: oldPrice || null,
      colors: colors || [],
      quantity: quantity || 1,
      unit: unit || 'piece',
      inStock: inStock !== false,
      images: images || [],
      status: 'pending'
    };

    console.log('📦 Données du post:', postData);

    const post = await Post.create(postData);
    
    console.log('✅ Post créé avec ID:', post.id);

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

// ===== METTRE À JOUR UN POST =====
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }
    
    const vendor = await Vendor.findByUserId(userId);
    if (req.user.role !== 'admin' && (!vendor || vendor.id !== post.vendorId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce post'
      });
    }
    
    const {
      category, productName, description, content,
      price, oldPrice, colors, quantity, unit,
      inStock, images
    } = req.body;
    
    const updated = await Post.update(postId, {
      category,
      productName,
      description,
      content,
      price,
      oldPrice,
      colors,
      quantity,
      unit,
      inStock,
      images,
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Post mis à jour avec succès',
      data: { post: updated }
    });
  } catch (error) {
    console.error('❌ Erreur updatePost:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN POST =====
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }
    
    const vendor = await Vendor.findByUserId(userId);
    if (req.user.role !== 'admin' && (!vendor || vendor.id !== post.vendorId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce post'
      });
    }
    
    await Post.delete(postId);
    
    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deletePost:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== AJOUTER UN COMMENTAIRE =====
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;
    
    if (!comment || comment.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Le commentaire doit contenir au moins 2 caractères'
      });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }
    
    if (post.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Ce post n\'est pas encore publié'
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
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN COMMENTAIRE =====
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    
    const comment = await db.getOne('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }
    
    if (req.user.role !== 'admin' && comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire'
      });
    }
    
    await Post.deleteComment(commentId);
    
    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteComment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== AIMER/NE PLUS AIMER UN POST =====
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }
    
    const like = await db.getOne(
      'SELECT id FROM post_likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );
    
    if (like) {
      await db.query('DELETE FROM post_likes WHERE id = ?', [like.id]);
      await db.query('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
      res.json({ success: true, data: { liked: false } });
    } else {
      await db.insert('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      res.json({ success: true, data: { liked: true } });
    }
  } catch (error) {
    console.error('❌ Erreur toggleLike:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};