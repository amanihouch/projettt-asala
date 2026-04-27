// backend/src/controllers/cartController.js
const db = require('../models/db');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await db.query(
      'SELECT items FROM cart WHERE userId = ?',
      [userId]
    );
    
    let items = [];
    if (cart.length > 0 && cart[0].items) {
      try {
        items = typeof cart[0].items === 'string' ? JSON.parse(cart[0].items) : cart[0].items;
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
};

// @desc    Sync cart with backend
// @route   POST /api/v1/cart/sync
// @access  Private
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data'
      });
    }
    
    // Check if cart exists
    const existing = await db.query(
      'SELECT id FROM cart WHERE userId = ?',
      [userId]
    );
    
    const cartItems = JSON.stringify(items);
    
    if (existing.length > 0) {
      // Update existing cart
      await db.query(
        'UPDATE cart SET items = ?, updatedAt = NOW() WHERE userId = ?',
        [cartItems, userId]
      );
    } else {
      // Create new cart
      await db.query(
        'INSERT INTO cart (userId, items) VALUES (?, ?)',
        [userId, cartItems]
      );
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
};

// @desc    Refresh cart items (check prices, availability)
// @route   POST /api/v1/cart/refresh
// @access  Private
exports.refreshCart = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.json({
        success: true,
        data: { products: [] }
      });
    }
    
    // Get updated product information
    const placeholders = productIds.map(() => '?').join(',');
    const products = await db.query(
      `SELECT id, productName as name, price, inStock 
       FROM posts 
       WHERE id IN (${placeholders})`,
      productIds
    );
    
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
};