const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../models/db');

// GET /api/v1/cart - Récupérer le panier
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🛒 Getting cart for user:', userId);
    
    const cart = await db.query(
      'SELECT items FROM cart WHERE userId = ?',
      [userId]
    );
    
    let items = [];
    if (cart.length > 0 && cart[0].items) {
      try {
        items = typeof cart[0].items === 'string' ? JSON.parse(cart[0].items) : cart[0].items;
        console.log('📦 Cart items loaded:', items.length);
      } catch (e) {
        console.error('Error parsing cart items:', e);
      }
    }
    
    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading cart',
      error: error.message
    });
  }
});

// POST /api/v1/cart/sync - Synchroniser le panier
router.post('/sync', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    console.log('🛒 Syncing cart for user:', userId, 'items:', items?.length || 0);
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data'
      });
    }
    
    const existing = await db.query(
      'SELECT id FROM cart WHERE userId = ?',
      [userId]
    );
    
    const cartItems = JSON.stringify(items);
    
    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET items = ?, updatedAt = NOW() WHERE userId = ?',
        [cartItems, userId]
      );
      console.log('✅ Cart updated for user:', userId);
    } else {
      await db.query(
        'INSERT INTO cart (userId, items) VALUES (?, ?)',
        [userId, cartItems]
      );
      console.log('✅ Cart created for user:', userId);
    }
    
    res.json({
      success: true,
      message: 'Cart synced successfully',
      data: { items }
    });
  } catch (error) {
    console.error('❌ Error syncing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing cart',
      error: error.message
    });
  }
});

// POST /api/v1/cart/refresh - Rafraîchir les prix
router.post('/refresh', protect, async (req, res) => {
  try {
    const { productIds } = req.body;
    console.log('🔄 Refreshing cart items:', productIds);
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.json({
        success: true,
        data: { products: [] }
      });
    }
    
    const placeholders = productIds.map(() => '?').join(',');
    const products = await db.query(
      `SELECT id, productName as name, price, inStock 
       FROM posts 
       WHERE id IN (${placeholders})`,
      productIds
    );
    
    console.log('✅ Refreshed products:', products.length);
    
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('❌ Error refreshing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing cart',
      error: error.message
    });
  }
});

module.exports = router;