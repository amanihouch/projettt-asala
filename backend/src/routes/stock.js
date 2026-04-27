// backend/src/routes/stock.js
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

console.log('✅ Routes stock chargées');

// ============================================
// PUT /api/v1/stock/:productId
// Met à jour le stock après commande ou annulation
// quantity > 0 = diminution du stock
// quantity < 0 = restauration du stock
// ============================================
router.put('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity: quantityChange, size } = req.body;
    
    const qtyChange = parseInt(quantityChange) || 0;
    
    console.log(`📊 Stock - Produit:${productId}, Changement:${qtyChange > 0 ? '-' : '+'}${Math.abs(qtyChange)}, Taille:${size || 'N/A'}`);
    
    // Chercher dans la table posts d'abord
    const posts = await db.query('SELECT id, quantity, sizes FROM posts WHERE id = ?', [productId]);
    
    if (posts && posts.length > 0) {
      const post = posts[0];
      // qtyChange > 0 = diminution, qtyChange < 0 = augmentation
      let newQuantity = Math.max(0, (post.quantity || 0) - qtyChange);
      
      // Mettre à jour la quantité
      await db.query('UPDATE posts SET quantity = ? WHERE id = ?', [newQuantity, productId]);
      
      // Mettre à jour les tailles si nécessaire
      if (size && post.sizes) {
        let sizes = typeof post.sizes === 'string' ? JSON.parse(post.sizes) : post.sizes;
        if (Array.isArray(sizes)) {
          const sizeIndex = sizes.findIndex(s => s.name === size);
          if (sizeIndex !== -1) {
            sizes[sizeIndex].stock = Math.max(0, (sizes[sizeIndex].stock || 0) - qtyChange);
            await db.query('UPDATE posts SET sizes = ? WHERE id = ?', [JSON.stringify(sizes), productId]);
          }
        }
      }
      
      // Récupérer les nouvelles valeurs
      const updated = await db.query('SELECT quantity, sizes FROM posts WHERE id = ?', [productId]);
      
      return res.json({
        success: true,
        message: '✅ Stock mis à jour',
        data: {
          productId: parseInt(productId),
          quantity: updated[0]?.quantity || newQuantity,
          previousQuantity: post.quantity || 0,
          newQuantity: newQuantity
        }
      });
    }
    
    // Fallback: chercher dans products
    const products = await db.query('SELECT id, quantity FROM products WHERE id = ?', [productId]);
    
    if (products && products.length > 0) {
      const product = products[0];
      let newQuantity = Math.max(0, (product.quantity || 0) - qtyChange);
      
      await db.query('UPDATE products SET quantity = ?, inStock = ? WHERE id = ?', 
        [newQuantity, newQuantity > 0 ? 1 : 0, productId]);
      
      return res.json({
        success: true,
        message: '✅ Stock mis à jour',
        data: {
          productId: parseInt(productId),
          quantity: newQuantity,
          previousQuantity: product.quantity || 0,
          newQuantity: newQuantity
        }
      });
    }
    
    // Produit non trouvé
    return res.json({
      success: true,
      message: '⚠️ Produit non trouvé, stock non modifié',
      data: { productId: parseInt(productId) }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message 
    });
  }
});

// ============================================
// GET /api/v1/stock/:productId
// Récupère le stock actuel d'un produit
// ============================================
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Chercher dans posts
    const posts = await db.query('SELECT id, quantity, sizes FROM posts WHERE id = ?', [productId]);
    
    if (posts && posts.length > 0) {
      return res.json({
        success: true,
        data: {
          productId: parseInt(productId),
          quantity: posts[0].quantity || 0,
          sizes: posts[0].sizes || []
        }
      });
    }
    
    // Chercher dans products
    const products = await db.query('SELECT id, quantity FROM products WHERE id = ?', [productId]);
    
    if (products && products.length > 0) {
      return res.json({
        success: true,
        data: {
          productId: parseInt(productId),
          quantity: products[0].quantity || 0
        }
      });
    }
    
    res.json({
      success: true,
      data: { productId: parseInt(productId), quantity: 0 }
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération stock:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/v1/stock/bulk-update
// Met à jour le stock pour plusieurs produits en une fois
// ============================================
router.post('/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity, size }]
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Format invalide' });
    }
    
    const results = [];
    
    for (const item of items) {
      const { productId, quantity: qtySold, size } = item;
      
      if (!productId) continue;
      
      const qty = parseInt(qtySold) || 0;
      
      // Chercher dans posts
      const posts = await db.query('SELECT id, quantity FROM posts WHERE id = ?', [productId]);
      
      if (posts && posts.length > 0) {
        let newQuantity = Math.max(0, (posts[0].quantity || 0) - qty);
        await db.query('UPDATE posts SET quantity = ? WHERE id = ?', [newQuantity, productId]);
        results.push({ productId, success: true, newQuantity });
      } else {
        const products = await db.query('SELECT id, quantity FROM products WHERE id = ?', [productId]);
        if (products && products.length > 0) {
          let newQuantity = Math.max(0, (products[0].quantity || 0) - qty);
          await db.query('UPDATE products SET quantity = ?, inStock = ? WHERE id = ?', [newQuantity, newQuantity > 0 ? 1 : 0, productId]);
          results.push({ productId, success: true, newQuantity });
        } else {
          results.push({ productId, success: false, message: 'Produit non trouvé' });
        }
      }
    }
    
    res.json({
      success: true,
      message: '✅ Stock mis à jour pour ' + results.length + ' produits',
      data: { results }
    });
    
  } catch (error) {
    console.error('❌ Erreur bulk update:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;