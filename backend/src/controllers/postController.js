// backend/src/controllers/postController.js
const Post = require('../models/Post');
const db = require('../models/db');

// ===== CRÉER UN POST =====
exports.createPost = async (req, res) => {
  try {
    console.log('📝 Création post:', req.body);
    
    // ✅ Vérifier que les images sont bien formatées
    if (req.body.images && !Array.isArray(req.body.images)) {
      req.body.images = [req.body.images];
    }
    
    const post = await Post.create(req.body);
    
    res.status(201).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur createPost:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== RÉCUPÉRER LE FEED =====
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.getFeed(page, limit);
    
    res.json({
      success: true,
      data: { posts }
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
exports.getPostsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Vérifier si l'utilisateur est le propriétaire du vendeur
    let includePending = false;
    if (req.user) {
      const vendor = await db.getOne(
        'SELECT userId FROM vendors WHERE id = ?',
        [vendorId]
      );
      includePending = vendor && vendor.userId === req.user.id;
      console.log(`👤 Propriétaire: ${includePending ? 'Oui' : 'Non'}`);
    }
    
    const posts = await Post.getByVendor(vendorId, includePending, page, limit);
    
    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('❌ Erreur getPostsByVendor:', error);
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

// ===== METTRE À JOUR UN POST =====
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.update(req.params.id, req.body);
    
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
    await Post.delete(req.params.id);
    
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

// ===== APPROUVER UN POST (admin) =====
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.approve(req.params.id);
    
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur approvePost:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== REJETER UN POST (admin) =====
exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.reject(req.params.id, reason);
    
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('❌ Erreur rejectPost:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== TOGGLE LIKE =====
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    
    const result = await Post.toggleLike(postId, userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur toggleLike:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== AJOUTER UN COMMENTAIRE =====
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { comment } = req.body;
    
    const user = await db.getOne(
      'SELECT name, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    const newComment = await Post.addComment(
      postId, 
      userId, 
      user.name, 
      user.avatar, 
      comment
    );
    
    res.status(201).json({
      success: true,
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

// ===== RÉCUPÉRER LES COMMENTAIRES =====
exports.getComments = async (req, res) => {
  try {
    const comments = await Post.getComments(req.params.id);
    
    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('❌ Erreur getComments:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};