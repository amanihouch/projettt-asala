// backend/src/routes/admin/index.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');

// Sous-routes
const userRoutes = require('./users');
const vendorRoutes = require('./vendors');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const postRoutes = require('./posts');
const categoryRoutes = require('./categories');

// Dashboard
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin dashboard'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Monter les sous-routes
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;