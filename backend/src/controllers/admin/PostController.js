const Post = require('../../models/Post');
const Product = require('../../models/Product');

// @desc    Obtenir tous les posts en attente
// @route   GET /api/v1/admin/posts/pending
// @access  Private/Admin
exports.getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.getPending();
    res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('❌ getPendingPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approuver un post
// @route   PATCH /api/v1/admin/posts/:id/approve
// @access  Private/Admin
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    // Mettre à jour le statut
    const updated = await Post.update(req.params.id, {
      status: 'approved',
      publishedAt: new Date()
    });

    // Optionnel : créer un produit à partir du post
    // (selon votre logique métier)

    res.json({ success: true, message: 'Post approuvé', data: { post: updated } });
  } catch (error) {
    console.error('❌ approvePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rejeter un post
// @route   PATCH /api/v1/admin/posts/:id/reject
// @access  Private/Admin
exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'La raison du rejet est requise' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }

    const updated = await Post.update(req.params.id, {
      status: 'rejected',
      adminNotes: reason
    });

    res.json({ success: true, message: 'Post rejeté', data: { post: updated } });
  } catch (error) {
    console.error('❌ rejectPost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mettre à jour un post (admin)
// @route   PUT /api/v1/admin/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const updates = req.body;
    const post = await Post.update(req.params.id, updates);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    res.json({ success: true, message: 'Post mis à jour', data: { post } });
  } catch (error) {
    console.error('❌ updatePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un post (admin)
// @route   DELETE /api/v1/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    await Post.delete(req.params.id);
    res.json({ success: true, message: 'Post supprimé' });
  } catch (error) {
    console.error('❌ deletePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};