// backend/src/routes/reviews.js - VERSION CORRIGÉE FINALE
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

console.log('✅ Routes reviews chargées');

// GET /api/v1/reviews/products/:productId
router.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📥 Reviews pour produit ${productId}`);
    
    // ✅ CORRECTION : db.query retourne directement les résultats (pas de [])
    let reviews;
    try {
      reviews = await db.query(`
        SELECT r.*, u.name as userName, u.avatar as userAvatar
        FROM review r
        LEFT JOIN users u ON r.userId = u.id
        WHERE r.productId = ? AND r.status = 'approved'
        ORDER BY r.createdAt DESC
        LIMIT 50
      `, [productId]);
    } catch (dbError) {
      console.log('⚠️ Table review inexistante, retour vide');
      reviews = [];
    }
    
    res.json({
      success: true,
      data: {
        reviews: reviews || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur chargement reviews:', error.message);
    res.json({ success: true, data: { reviews: [] } });
  }
});

// POST /api/v1/reviews/products/:productId
router.post('/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    console.log(`📝 Review - Produit:${productId} User:${userId} Note:${rating}`);
    
    // Validations
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'تقييم غير صالح (1-5)' });
    }
    if (!comment || comment.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'التعليق قصير جداً' });
    }
    
    // ✅ CORRECTION : Pas de déstructuration []
    // Vérifier doublon
    let existing;
    try {
      existing = await db.query(
        'SELECT id FROM review WHERE productId = ? AND userId = ?',
        [productId, userId]
      );
    } catch (e) {
      existing = [];
    }
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'لقد قمت بالتقييم déjà' });
    }
    
    // ✅ CORRECTION : Insérer sans déstructuration
    const result = await db.query(
      'INSERT INTO review (rating, comment, productId, userId, status, helpfulCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, "approved", 0, NOW(), NOW())',
      [rating, comment.trim(), productId, userId]
    );
    
    const insertId = result.insertId || result;
    
    // ✅ Récupérer le commentaire créé
    const newReviews = await db.query(`
      SELECT r.*, u.name as userName, u.avatar as userAvatar
      FROM review r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.id = ?
    `, [insertId]);
    
    const newReview = newReviews && newReviews[0] ? newReviews[0] : null;
    
    // ✅ Calculer nouvelle moyenne
    const avgResult = await db.query(
      'SELECT AVG(rating) as avgRating, COUNT(*) as total FROM review WHERE productId = ? AND status = "approved"',
      [productId]
    );
    
    const avgData = avgResult && avgResult[0] ? avgResult[0] : { avgRating: rating, total: 1 };
    const averageRating = avgData.avgRating 
      ? Math.round(parseFloat(avgData.avgRating) * 10) / 10
      : rating;
    const reviewsCount = parseInt(avgData.total) || 1;
    
    // Essayer de mettre à jour posts ou products
    try {
      await db.query('UPDATE posts SET averageRating = ?, reviewsCount = ? WHERE id = ?', 
        [averageRating, reviewsCount, productId]);
    } catch (e) {
      try {
        await db.query('UPDATE products SET averageRating = ?, reviewsCount = ? WHERE id = ?', 
          [averageRating, reviewsCount, productId]);
      } catch (e2) {
        console.log('⚠️ Impossible MAJ stats produit');
      }
    }
    
    res.json({
      success: true,
      data: {
        review: newReview,
        averageRating,
        reviewsCount
      },
      message: 'تم إضافة تقييمك بنجاح 🌟'
    });
    
  } catch (error) {
    console.error('❌ Erreur ajout review:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم: ' + error.message });
  }
});

// POST /api/v1/reviews/:reviewId/helpful
router.post('/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    await db.query('UPDATE review SET helpfulCount = helpfulCount + 1 WHERE id = ?', [reviewId]);
    
    res.json({ success: true, message: 'شكراً لك! 👍' });
  } catch (error) {
    console.error('❌ Erreur helpful:', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;