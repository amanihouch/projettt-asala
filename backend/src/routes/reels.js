// backend/src/routes/reels.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, vendorOnly, adminOnly } = require('../middleware/auth');
const db = require('../models/db');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration multer pour les vidéos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format vidéo non supporté. Utilisez MP4, MOV ou WEBM.'), false);
    }
  }
});

// ==================== ROUTES PUBLIQUES ====================

// Récupérer tous les reels approuvés (feed)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reels = await db.query(`
      SELECT r.*, v.shopName as vendorName, u.name as vendorRealName, u.avatar as vendorAvatar
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE r.status = 'approved'
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total FROM reels WHERE status = 'approved'
    `);

    res.json({
      success: true,
      data: {
        reels: reels || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les reels approuvés d'un vendeur
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reels = await db.query(`
      SELECT r.*, v.shopName, u.name as vendorName, u.avatar as vendorAvatar,
             p.name as productName, p.images as productImages, p.price as productPrice
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.vendorId = ? AND r.status = 'approved'
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `, [vendorId, parseInt(limit), offset]);

    const totalResult = await db.getOne(`
      SELECT COUNT(*) as total 
      FROM reels 
      WHERE vendorId = ? AND status = 'approved'
    `, [vendorId]);

    res.json({
      success: true,
      data: {
        reels: reels || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getReelsByVendor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les reels d'un produit spécifique (CORRIGÉ - utilise les posts)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Chercher les reels associés à ce produit (via productId)
    const reels = await db.query(`
      SELECT r.*, v.shopName, u.name as vendorName, u.avatar as vendorAvatar,
             p.name as productName, p.images as productImages, p.price as productPrice
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.productId = ? AND r.status = 'approved'
      ORDER BY r.createdAt DESC
    `, [productId]);

    // Si aucun reel trouvé, chercher les posts avec vidéos liés à ce produit
    if (reels.length === 0) {
      const videoPosts = await db.query(`
        SELECT 
          p.id, p.productName as title, p.description, p.videoUrl,
          p.likes, p.commentsCount as commentsCount,
          v.shopName as vendorName, u.avatar as vendorAvatar,
          p.createdAt
        FROM posts p
        LEFT JOIN vendors v ON p.vendorId = v.id
        LEFT JOIN users u ON v.userId = u.id
        WHERE p.id = ? AND p.videoUrl IS NOT NULL AND p.status = 'approved'
        ORDER BY p.createdAt DESC
      `, [productId]);
      
      const formattedVideoPosts = videoPosts.map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        videoUrl: post.videoUrl,
        vendorName: post.vendorName,
        vendorAvatar: post.vendorAvatar,
        likes: post.likes || 0,
        views: post.views || 0,
        commentsCount: post.commentsCount || 0,
        productId: parseInt(productId),
        createdAt: post.createdAt
      }));
      
      return res.json({ success: true, data: { reels: formattedVideoPosts } });
    }

    res.json({ success: true, data: { reels: reels || [] } });
  } catch (error) {
    console.error('❌ Erreur getProductReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer un reel par ID
router.get('/:id', async (req, res) => {
  try {
    const reel = await db.getOne(`
      SELECT r.*, v.shopName, u.name as vendorName, u.avatar as vendorAvatar,
             p.name as productName, p.images as productImages, p.price as productPrice
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel non trouvé' });
    }

    // Incrémenter les vues
    await db.query('UPDATE reels SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: reel });
  } catch (error) {
    console.error('❌ Erreur getReelById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les commentaires d'un reel
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await db.query(`
      SELECT rc.*, u.name as userName, u.avatar as userAvatar
      FROM reel_comments rc
      LEFT JOIN users u ON rc.userId = u.id
      WHERE rc.reelId = ?
      ORDER BY rc.createdAt DESC
    `, [req.params.id]);

    res.json({ success: true, data: { comments: comments || [] } });
  } catch (error) {
    console.error('❌ Erreur getReelComments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ROUTES VENDEUR (PROTÉGÉES) ====================

// Récupérer tous les reels du vendeur connecté
router.get('/my-reels', protect, vendorOnly, async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM reels WHERE vendorId = ?';
    const params = [vendorId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const reels = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM reels WHERE vendorId = ?';
    const countParams = [vendorId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const totalResult = await db.getOne(countQuery, countParams);

    res.json({
      success: true,
      data: {
        reels: reels || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getMyReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Créer un reel
router.post('/', protect, vendorOnly, upload.single('video'), async (req, res) => {
  try {
    const { title, description, productId, status = 'pending' } = req.body;
    const vendorId = req.user.vendorId;

    if (!title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et la vidéo sont requis'
      });
    }

    // Upload vidéo vers Cloudinary
    let videoUrl = null;
    let videoPublicId = null;
    
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'reels',
            eager: [
              { width: 480, height: 480, crop: 'pad', audio_codec: 'none' },
              { width: 240, height: 240, crop: 'pad', audio_codec: 'none' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      videoUrl = result.secure_url;
      videoPublicId = result.public_id;
    } catch (uploadError) {
      console.error('❌ Erreur upload Cloudinary:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload de la vidéo'
      });
    }

    // Vérifier si le produit existe et appartient au vendeur
    // Dans la route POST / (création de reel), modifiez la partie productId

// Vérifier si le produit existe et appartient au vendeur
let finalProductId = null;
if (productId && productId !== 'null' && productId !== '') {
  // Vérifier d'abord dans posts (vos produits sont dans posts)
  const post = await db.getOne(
    'SELECT id FROM posts WHERE id = ? AND vendorId = ?',
    [productId, vendorId]
  );
  if (post) {
    finalProductId = productId;
  } else {
    // Sinon vérifier dans products
    const product = await db.getOne(
      'SELECT id FROM products WHERE id = ? AND vendorId = ?',
      [productId, vendorId]
    );
    if (product) {
      finalProductId = productId;
    }
  }
}
    // Créer le reel
    const result = await db.query(`
      INSERT INTO reels (
        title, description, videoUrl, videoPublicId, productId, vendorId,
        status, approved, views, likes, commentsCount, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, NOW(), NOW())
    `, [title, description || '', videoUrl, videoPublicId, finalProductId, vendorId, status]);

    const newReel = await db.getOne(`
      SELECT r.*, p.name as productName, p.images as productImages
      FROM reels r
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Reel sauvegardé en brouillon' : 'Reel créé avec succès. En attente d\'approbation.',
      data: newReel
    });
  } catch (error) {
    console.error('❌ Erreur createReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mettre à jour un reel
router.put('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const { title, description, productId, status } = req.body;
    const reelId = req.params.id;
    const vendorId = req.user.vendorId;

    // Vérifier que le reel appartient au vendeur
    const reel = await db.getOne(
      'SELECT * FROM reels WHERE id = ? AND vendorId = ?',
      [reelId, vendorId]
    );

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel non trouvé'
      });
    }

    let updates = [];
    let params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (productId !== undefined) {
      if (productId && productId !== 'null' && productId !== '') {
        const product = await db.getOne(
          'SELECT id FROM products WHERE id = ? AND vendorId = ?',
          [productId, vendorId]
        );
        updates.push('productId = ?');
        params.push(product ? productId : null);
      } else {
        updates.push('productId = ?');
        params.push(null);
      }
    }

    if (updates.length > 0) {
      updates.push('updatedAt = NOW()');
      params.push(reelId);
      
      await db.query(
        `UPDATE reels SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    const updatedReel = await db.getOne(`
      SELECT r.*, p.name as productName, p.images as productImages, p.price as productPrice
      FROM reels r
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.id = ?
    `, [reelId]);

    res.json({
      success: true,
      message: 'Reel mis à jour avec succès',
      data: updatedReel
    });
  } catch (error) {
    console.error('❌ Erreur updateReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supprimer un reel
router.delete('/:id', protect, vendorOnly, async (req, res) => {
  try {
    const reelId = req.params.id;
    const vendorId = req.user.vendorId;

    // Récupérer le reel pour obtenir le videoPublicId
    const reel = await db.getOne(
      'SELECT videoPublicId FROM reels WHERE id = ? AND vendorId = ?',
      [reelId, vendorId]
    );

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel non trouvé'
      });
    }

    // Supprimer les likes et commentaires
    await db.query('DELETE FROM reel_likes WHERE reelId = ?', [reelId]);
    await db.query('DELETE FROM reel_comments WHERE reelId = ?', [reelId]);
    await db.query('DELETE FROM reels WHERE id = ?', [reelId]);

    // Supprimer la vidéo de Cloudinary
    if (reel.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(reel.videoPublicId, { resource_type: 'video' });
      } catch (cloudError) {
        console.error('Erreur suppression Cloudinary:', cloudError);
      }
    }

    res.json({
      success: true,
      message: 'Reel supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur deleteReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ajouter/supprimer un like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.user.id;

    // Vérifier que le reel existe
    const reel = await db.getOne('SELECT id FROM reels WHERE id = ?', [reelId]);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel non trouvé' });
    }

    const existingLike = await db.getOne(
      'SELECT * FROM reel_likes WHERE reelId = ? AND userId = ?',
      [reelId, userId]
    );

    if (existingLike) {
      // Unlike
      await db.query(
        'DELETE FROM reel_likes WHERE reelId = ? AND userId = ?',
        [reelId, userId]
      );
      await db.query(
        'UPDATE reels SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
        [reelId]
      );
      const newLikes = await db.getOne('SELECT likes FROM reels WHERE id = ?', [reelId]);
      res.json({ success: true, data: { liked: false, likes: newLikes?.likes || 0 } });
    } else {
      // Like
      await db.query(
        'INSERT INTO reel_likes (reelId, userId, createdAt) VALUES (?, ?, NOW())',
        [reelId, userId]
      );
      await db.query(
        'UPDATE reels SET likes = likes + 1 WHERE id = ?',
        [reelId]
      );
      const newLikes = await db.getOne('SELECT likes FROM reels WHERE id = ?', [reelId]);
      res.json({ success: true, data: { liked: true, likes: newLikes?.likes || 0 } });
    }
  } catch (error) {
    console.error('❌ Erreur toggleLike:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ajouter un commentaire
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Le commentaire ne peut pas être vide' });
    }

    // Vérifier que le reel existe
    const reel = await db.getOne('SELECT id FROM reels WHERE id = ?', [reelId]);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel non trouvé' });
    }

    const result = await db.query(`
      INSERT INTO reel_comments (reelId, userId, text, createdAt)
      VALUES (?, ?, ?, NOW())
    `, [reelId, userId, text.trim()]);

    await db.query(
      'UPDATE reels SET commentsCount = commentsCount + 1 WHERE id = ?',
      [reelId]
    );

    const newComment = await db.getOne(`
      SELECT rc.*, u.name as userName, u.avatar as userAvatar
      FROM reel_comments rc
      LEFT JOIN users u ON rc.userId = u.id
      WHERE rc.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('❌ Erreur addComment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Incrémenter les vues
router.post('/:id/view', async (req, res) => {
  try {
    await db.query('UPDATE reels SET views = views + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur incrementView:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ROUTES ADMIN ====================

// Récupérer tous les reels (admin)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reels = await db.query(`
      SELECT r.*, v.shopName, u.name as vendorName, u.avatar as vendorAvatar, u.email as vendorEmail,
             p.name as productName
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON r.productId = p.id
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const totalResult = await db.getOne('SELECT COUNT(*) as total FROM reels');

    res.json({
      success: true,
      data: {
        reels: reels || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult?.total || 0,
          pages: Math.ceil((totalResult?.total || 0) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur getAdminReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer le nombre de reels en attente (admin)
router.get('/admin/pending/count', protect, adminOnly, async (req, res) => {
  try {
    const result = await db.getOne(`
      SELECT COUNT(*) as count
      FROM reels
      WHERE status = 'pending'
    `);

    res.json({ success: true, data: { count: result?.count || 0 } });
  } catch (error) {
    console.error('❌ Erreur getPendingCount:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les reels en attente (admin)
router.get('/admin/pending', protect, adminOnly, async (req, res) => {
  try {
    const reels = await db.query(`
      SELECT r.*, v.shopName, u.name as vendorName, u.avatar as vendorAvatar, u.email as vendorEmail,
             p.name as productName
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN products p ON r.productId = p.id
      WHERE r.status = 'pending'
      ORDER BY r.createdAt ASC
    `);

    res.json({ success: true, data: { reels: reels || [] } });
  } catch (error) {
    console.error('❌ Erreur getPendingReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approuver un reel (admin)
router.put('/admin/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const reelId = req.params.id;

    const reel = await db.getOne('SELECT * FROM reels WHERE id = ?', [reelId]);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel non trouvé' });
    }

    await db.query(`
      UPDATE reels
      SET status = 'approved', approved = 1, approvedAt = NOW(), updatedAt = NOW()
      WHERE id = ?
    `, [reelId]);

    res.json({ success: true, message: 'Reel approuvé avec succès' });
  } catch (error) {
    console.error('❌ Erreur approveReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rejeter un reel (admin)
router.put('/admin/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const reelId = req.params.id;
    const { reason } = req.body;

    const reel = await db.getOne('SELECT * FROM reels WHERE id = ?', [reelId]);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel non trouvé' });
    }

    await db.query(`
      UPDATE reels
      SET status = 'rejected', approved = 0, rejectionReason = ?, updatedAt = NOW()
      WHERE id = ?
    `, [reason || 'Non spécifié', reelId]);

    res.json({ success: true, message: 'Reel rejeté avec succès' });
  } catch (error) {
    console.error('❌ Erreur rejectReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supprimer un reel (admin)
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const reelId = req.params.id;

    const reel = await db.getOne('SELECT videoPublicId FROM reels WHERE id = ?', [reelId]);
    
    await db.query('DELETE FROM reel_likes WHERE reelId = ?', [reelId]);
    await db.query('DELETE FROM reel_comments WHERE reelId = ?', [reelId]);
    await db.query('DELETE FROM reels WHERE id = ?', [reelId]);

    if (reel?.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(reel.videoPublicId, { resource_type: 'video' });
      } catch (cloudError) {
        console.error('Erreur suppression Cloudinary:', cloudError);
      }
    }

    res.json({ success: true, message: 'Reel supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur adminDeleteReel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;