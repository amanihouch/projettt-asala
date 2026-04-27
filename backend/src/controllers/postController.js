// backend/src/controllers/postController.js
const db = require('../models/db');
const { deleteMultipleImages } = require('../config/cloudinary');

// ===== RÉCUPÉRER LES POSTS D'UN VENDEUR =====
exports.getVendorPosts = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!vendorId || isNaN(vendorId)) {
      return res.status(400).json({
        success: false,
        message: 'ID vendeur invalide'
      });
    }
    
    const posts = await db.query(`
      SELECT 
        p.id, p.productName, p.description, p.price, p.oldPrice,
        p.images, p.colors, p.sizes, p.quantity, p.unit, p.status, 
        p.likes, p.commentsCount, p.createdAt, p.isPinned,
        p.hasColors, p.hasShipping, p.shippingCost, p.shippingTime, p.stockStatus,
        p.categoryId,
        v.shopName as vendorName, u.name as userName, u.avatar AS vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.vendorId = ? AND p.status = 'approved'
      ORDER BY p.isPinned DESC, p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(vendorId), parseInt(limit), offset]);
    
    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total FROM posts 
      WHERE vendorId = ? AND status = 'approved'
    `, [parseInt(vendorId)]);
    
    const formattedPosts = (posts || []).map(post => ({
      ...post,
      images: post.images ? (typeof post.images === 'string' ? JSON.parse(post.images) : post.images) : [],
      colors: post.colors ? (typeof post.colors === 'string' ? JSON.parse(post.colors) : post.colors) : [],
      sizes: post.sizes ? (typeof post.sizes === 'string' ? JSON.parse(post.sizes) : post.sizes) : [],
      isPinned: post.isPinned === 1 || post.isPinned === true,
      hasColors: post.hasColors === 1 || post.hasColors === true,
      hasShipping: post.hasShipping === 1 || post.hasShipping === true,
      shippingCost: parseFloat(post.shippingCost) || 0,
      shippingTime: parseInt(post.shippingTime) || 0,
      stockStatus: post.stockStatus || 'in_stock',
      categoryId: post.categoryId || null
    }));
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getVendorPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostsByVendor = exports.getVendorPosts;

// ===== RÉCUPÉRER LE FEED (CORRIGÉ AVEC categoryId) =====
// backend/src/controllers/postController.js
// ===== METTRE À JOUR UN POST (VERSION CORRIGÉE) =====
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updates = req.body;
    
    console.log('📝 Mise à jour post:', postId, updates);
    
    // Vérifier que le post existe
    const existingPost = await db.getOne('SELECT id, vendorId FROM posts WHERE id = ?', [postId]);
    if (!existingPost) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    
    // Vérifier que le vendeur est propriétaire
    const vendorId = req.user?.vendorId;
    if (vendorId && existingPost.vendorId !== vendorId) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    // Champs autorisés pour la mise à jour
    if (updates.productName !== undefined) {
      updateFields.push('productName = ?');
      updateValues.push(updates.productName);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(parseFloat(updates.price));
    }
    if (updates.oldPrice !== undefined) {
      updateFields.push('oldPrice = ?');
      updateValues.push(updates.oldPrice ? parseFloat(updates.oldPrice) : null);
    }
    if (updates.quantity !== undefined) {
      updateFields.push('quantity = ?');
      updateValues.push(parseInt(updates.quantity) || 0);
      // Mettre à jour le statut du stock
      const qty = parseInt(updates.quantity) || 0;
      if (!updateFields.includes('stockStatus = ?')) {
        updateFields.push('stockStatus = ?');
        updateValues.push(qty > 5 ? 'in_stock' : qty > 0 ? 'low_stock' : 'out_of_stock');
      }
      if (!updateFields.includes('inStock = ?')) {
        updateFields.push('inStock = ?');
        updateValues.push(qty > 0 ? 1 : 0);
      }
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }
    if (updates.categoryId !== undefined) {
      updateFields.push('categoryId = ?');
      updateValues.push(updates.categoryId ? parseInt(updates.categoryId) : null);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }
    
    updateFields.push('updatedAt = NOW()');
    updateValues.push(postId);
    
    const sql = `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('📝 SQL:', sql);
    console.log('📝 Values:', updateValues);
    
    await db.query(sql, updateValues);
    
    // Récupérer le post mis à jour
    const updatedPost = await db.getOne('SELECT * FROM posts WHERE id = ?', [postId]);
    
    // Formater la réponse
    const response = {
      ...updatedPost,
      images: updatedPost?.images ? (typeof updatedPost.images === 'string' ? JSON.parse(updatedPost.images) : updatedPost.images) : [],
      colors: updatedPost?.colors ? (typeof updatedPost.colors === 'string' ? JSON.parse(updatedPost.colors) : updatedPost.colors) : [],
      sizes: updatedPost?.sizes ? (typeof updatedPost.sizes === 'string' ? JSON.parse(updatedPost.sizes) : updatedPost.sizes) : []
    };
    
    res.json({
      success: true,
      data: { post: response }
    });
  } catch (error) {
    console.error('❌ Erreur updatePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ===== RÉCUPÉRER LE FEED (VERSION CORRIGÉE) =====
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Requête simplifiée - enlever les colonnes qui peuvent poser problème
    const posts = await db.query(`
      SELECT 
        p.id, 
        p.productName, 
        p.description, 
        p.price, 
        p.images, 
        p.likes, 
        p.commentsCount, 
        p.createdAt,
        p.categoryId,
        v.id as vendorId, 
        v.shopName as vendorName, 
        u.avatar as vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    // Formater les posts
    const formattedPosts = (posts || []).map(post => {
      let imagesArray = [];
      if (post.images) {
        try {
          imagesArray = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
        } catch(e) {
          imagesArray = [];
        }
      }
      
      return {
        id: post.id,
        productName: post.productName || 'Produit',
        description: post.description || '',
        price: parseFloat(post.price) || 0,
        images: imagesArray,
        likes: post.likes || 0,
        commentsCount: post.commentsCount || 0,
        createdAt: post.createdAt,
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'Vendeur',
        vendorAvatar: post.vendorAvatar || null,
        categoryId: post.categoryId || null
      };
    });
    
    res.json({ 
      success: true, 
      data: { 
        posts: formattedPosts
      } 
    });
  } catch (error) {
    console.error('❌ Erreur getFeed:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ===== CRÉER UN POST (CORRIGÉ AVEC categoryId) =====
exports.createPost = async (req, res) => {
  try {
    let vendorId = req.user?.vendorId || req.body.vendorId;
    
    console.log('📝 Création post - Début');
    console.log('📝 vendorId:', vendorId);
    console.log('📝 categoryId reçu:', req.body.categoryId);
    
    if (!vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez avoir un profil vendeur pour créer des posts'
      });
    }
    
    const vendorInfo = await db.getOne(`
      SELECT v.shopName, u.name, u.avatar 
      FROM vendors v 
      LEFT JOIN users u ON v.userId = u.id 
      WHERE v.id = ?
    `, [vendorId]);
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }
    
    if (imageUrls.length === 0) {
      imageUrls = ['https://placehold.co/600x400/08717f/white?text=Produit'];
    }
    
    let colors = [];
    if (req.body.colors) {
      try {
        colors = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors;
      } catch(e) {
        colors = [];
      }
    }
    
    let sizes = [];
    if (req.body.sizes) {
      try {
        sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
      } catch(e) {
        sizes = [];
      }
    }
    
    let categoryId = req.body.categoryId;
    if (categoryId && isNaN(categoryId)) {
      const category = await db.getOne(
        'SELECT id FROM categories WHERE slug = ? OR id = ?',
        [categoryId, categoryId]
      );
      if (category) {
        categoryId = category.id;
      } else {
        categoryId = null;
      }
    } else if (categoryId && !isNaN(categoryId)) {
      categoryId = parseInt(categoryId);
    } else {
      categoryId = null;
    }
    
    console.log('📝 categoryId final:', categoryId);
    
    const MAX_PRICE = 99999999.99;
    let price = parseFloat(req.body.price) || 0;
    if (price > MAX_PRICE) price = MAX_PRICE;
    
    let oldPrice = null;
    if (req.body.oldPrice && req.body.oldPrice !== 'null' && req.body.oldPrice !== '') {
      oldPrice = parseFloat(req.body.oldPrice);
      if (oldPrice > MAX_PRICE) oldPrice = MAX_PRICE;
    }
    
    const hasColors = req.body.hasColors === 'true' || req.body.hasColors === true;
    const hasShipping = req.body.hasShipping === 'true' || req.body.hasShipping === true;
    const shippingCost = hasShipping ? (parseFloat(req.body.shippingCost) || 0) : 0;
    const shippingTime = hasShipping ? (parseInt(req.body.shippingTime) || 3) : 3;
    const stockStatus = req.body.stockStatus || 'in_stock';
    
    const result = await db.query(
      `INSERT INTO posts 
       (vendorId, vendorName, vendorAvatar, vendorVerified, categoryId, productName, 
        description, content, price, oldPrice, colors, sizes, quantity, unit, inStock, 
        images, status, hasColors, hasShipping, shippingCost, shippingTime, stockStatus,
        adminNotes, publishedAt, likes, commentsCount, createdAt, isPinned, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
      [
        vendorId,
        vendorInfo?.shopName || 'Vendeur',
        vendorInfo?.avatar || null,
        0,
        categoryId,
        req.body.productName,
        req.body.description || '',
        req.body.content || '',
        price,
        oldPrice,
        JSON.stringify(colors),
        JSON.stringify(sizes),
        parseInt(req.body.quantity) || 1,
        req.body.unit || 'piece',
        1,
        JSON.stringify(imageUrls),
        'pending',
        hasColors ? 1 : 0,
        hasShipping ? 1 : 0,
        shippingCost,
        shippingTime,
        stockStatus,
        null,
        null,
        0,
        0,
        0
      ]
    );
    
    console.log('✅ Post créé avec ID:', result.insertId, 'CategoryId:', categoryId);
    
    const newPost = await db.getOne(`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, c.icon as categoryIcon
      FROM posts p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Post créé avec succès. En attente d\'approbation.',
      data: { post: newPost }
    });
  } catch (error) {
    console.error('❌ Erreur createPost:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN POST =====
// ===== METTRE À JOUR UN POST (VERSION SIMPLIFIÉE ET ROBUSTE) =====
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updates = req.body;
    
    console.log('📝 Update post ID:', postId);
    console.log('📝 Data reçues:', JSON.stringify(updates));
    
    // Vérifier que le post existe
    const existingPost = await db.getOne('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!existingPost) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    
    // Construire la requête UPDATE dynamiquement
    const fields = [];
    const values = [];
    
    // Mapper les champs du frontend vers les colonnes de la BDD
    const fieldMap = {
      productName: 'productName',
      description: 'description',
      price: 'price',
      oldPrice: 'oldPrice',
      quantity: 'quantity',
      category: 'category'
    };
    
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(updates[key]);
      }
    }
    
    if (fields.length === 0) {
      return res.json({ success: true, message: 'Aucune modification' });
    }
    
    fields.push('updatedAt = NOW()');
    values.push(postId);
    
    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.query(sql, values);
    
    // Récupérer le post mis à jour
    const updatedPost = await db.getOne('SELECT * FROM posts WHERE id = ?', [postId]);
    
    res.json({
      success: true,
      data: { 
        post: {
          ...updatedPost,
          images: updatedPost?.images ? (typeof updatedPost.images === 'string' ? JSON.parse(updatedPost.images) : updatedPost.images) : [],
          colors: updatedPost?.colors ? (typeof updatedPost.colors === 'string' ? JSON.parse(updatedPost.colors) : updatedPost.colors) : [],
          sizes: updatedPost?.sizes ? (typeof updatedPost.sizes === 'string' ? JSON.parse(updatedPost.sizes) : updatedPost.sizes) : []
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur updatePost:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message 
    });
  }
};
// ===== SUPPRIMER UN POST =====
exports.deletePost = async (req, res) => {
  try {
    const post = await db.getOne('SELECT images FROM posts WHERE id = ?', [req.params.id]);
    
    if (post && post.images) {
      try {
        const images = JSON.parse(post.images);
        if (images && images.length > 0) {
          const cloudinaryImages = images.filter(img => img && img.includes('cloudinary.com'));
          if (cloudinaryImages.length > 0) {
            await deleteMultipleImages(cloudinaryImages);
            console.log(`🗑️ ${cloudinaryImages.length} images supprimées de Cloudinary`);
          }
        }
      } catch(e) {
        console.error('Erreur parsing images:', e);
      }
    }
    
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    await db.query('DELETE FROM post_likes WHERE postId = ?', [req.params.id]);
    await db.query('DELETE FROM post_comments WHERE postId = ?', [req.params.id]);
    
    res.json({ success: true, message: 'Post supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur deletePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== TOGGLE PIN POST =====
exports.togglePinPost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await db.getOne('SELECT isPinned FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post non trouvé' });
    }
    
    const newPinState = post.isPinned === 1 ? 0 : 1;
    
    await db.query('UPDATE posts SET isPinned = ?, updatedAt = NOW() WHERE id = ?', [newPinState, postId]);
    
    res.json({ success: true, data: { isPinned: newPinState === 1 } });
  } catch (error) {
    console.error('❌ Erreur togglePinPost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== TOGGLE LIKE =====
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    
    const existing = await db.getOne(
      'SELECT * FROM post_likes WHERE postId = ? AND userId = ?',
      [postId, userId]
    );
    
    let likes;
    
    if (existing) {
      await db.query('DELETE FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId]);
      await db.query('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
      const result = await db.getOne('SELECT likes FROM posts WHERE id = ?', [postId]);
      likes = result?.likes || 0;
      res.json({ success: true, data: { liked: false, likes } });
    } else {
      await db.query('INSERT INTO post_likes (postId, userId, createdAt) VALUES (?, ?, NOW())', [postId, userId]);
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      const result = await db.getOne('SELECT likes FROM posts WHERE id = ?', [postId]);
      likes = result?.likes || 0;
      res.json({ success: true, data: { liked: true, likes } });
    }
  } catch (error) {
    console.error('❌ Erreur toggleLike:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== AJOUTER UN COMMENTAIRE =====
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le commentaire ne peut pas être vide' 
      });
    }
    
    const post = await db.getOne('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }
    
    const user = await db.getOne('SELECT name, avatar FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    const result = await db.query(
      `INSERT INTO post_comments (postId, userId, userName, userAvatar, text, createdAt) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [postId, userId, user.name, user.avatar, text.trim()]
    );
    
    await db.query(
      'UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?',
      [postId]
    );
    
    const newComment = {
      id: result.insertId,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    
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
    const postId = req.params.id;
    const comments = await db.query(`
      SELECT * FROM post_comments 
      WHERE postId = ? 
      ORDER BY createdAt DESC
    `, [postId]);
    res.json({ success: true, data: { comments: comments || [] } });
  } catch (error) {
    console.error('❌ Erreur getComments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== RÉCUPÉRER UN POST PAR ID =====
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!postId || isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de post invalide'
      });
    }
    
    const post = await db.getOne(`
      SELECT 
        p.*, 
        v.shopName as vendorName, 
        u.name as userName, 
        u.avatar as vendorAvatar,
        v.verified as vendorVerified,
        c.name as categoryName, c.slug as categorySlug
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [postId]);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }
    
    let images = [];
    let colors = [];
    let sizes = [];
    
    try {
      if (post.images) {
        images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
      }
      if (post.colors) {
        colors = typeof post.colors === 'string' ? JSON.parse(post.colors) : post.colors;
      }
      if (post.sizes) {
        sizes = typeof post.sizes === 'string' ? JSON.parse(post.sizes) : post.sizes;
      }
    } catch(e) {
      console.error('Erreur parsing JSON:', e);
    }
    
    const responseData = {
      id: post.id,
      vendorId: post.vendorId,
      vendorName: post.vendorName || post.shopName,
      vendorAvatar: post.vendorAvatar,
      vendorVerified: post.vendorVerified === 1,
      productName: post.productName,
      description: post.description,
      price: parseFloat(post.price),
      oldPrice: post.oldPrice ? parseFloat(post.oldPrice) : null,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      categorySlug: post.categorySlug,
      images: images,
      colors: colors,
      sizes: sizes,
      unit: post.unit || 'piece',
      quantity: parseInt(post.quantity) || 1,
      stockStatus: post.stockStatus || (post.quantity > 0 ? 'in_stock' : 'out_of_stock'),
      hasColors: (colors && colors.length > 0) || post.hasColors === 1,
      hasShipping: post.hasShipping === 1,
      shippingCost: post.shippingCost ? parseFloat(post.shippingCost) : 0,
      shippingTime: post.shippingTime || 3,
      likes: post.likes || 0,
      commentsCount: post.commentsCount || 0,
      status: post.status,
      createdAt: post.createdAt,
      isPinned: post.isPinned === 1
    };
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Erreur getPostById:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};

// ===== ADMIN: APPROUVER UN POST =====
exports.approvePost = async (req, res) => {
  try {
    await db.query('UPDATE posts SET status = "approved", publishedAt = NOW(), updatedAt = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Post approuvé avec succès' });
  } catch (error) {
    console.error('❌ Erreur approvePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: REJETER UN POST =====
exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query('UPDATE posts SET status = "rejected", adminNotes = ?, updatedAt = NOW() WHERE id = ?', [reason || 'Non spécifié', req.params.id]);
    res.json({ success: true, message: 'Post rejeté avec succès' });
  } catch (error) {
    console.error('❌ Erreur rejectPost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: RÉCUPÉRER LES POSTS EN ATTENTE =====
exports.getPendingPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await db.query(`
      SELECT p.*, v.shopName as vendorName, u.email as vendorEmail
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.status = 'pending'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "pending"');
    
    const formattedPosts = (posts || []).map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : []
    }));
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getPendingPostsAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: RÉCUPÉRER LES POSTS APPROUVÉS =====
exports.getApprovedPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await db.query(`
      SELECT p.*, v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "approved"');
    
    const formattedPosts = (posts || []).map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : []
    }));
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getApprovedPostsAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ADMIN: RÉCUPÉRER LES POSTS REJETÉS =====
exports.getRejectedPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await db.query(`
      SELECT p.*, v.shopName as vendorName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      WHERE p.status = 'rejected'
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM posts WHERE status = "rejected"');
    
    const formattedPosts = (posts || []).map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : []
    }));
    
    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getRejectedPostsAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};