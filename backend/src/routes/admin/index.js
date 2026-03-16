const express = require('express');
const router = express.Router();

// Import des sous-routes
const userRoutes = require('./users');
const vendorRoutes = require('./vendors');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const postRoutes = require('./posts');    // ✅ Assurez-vous que cette ligne existe
const categoryRoutes = require('./categories');

// Montage des routes
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/posts', postRoutes);          // ✅ Et celle-ci
router.use('/categories', categoryRoutes);

// Route dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, data: { message: 'Admin dashboard' } });
});

module.exports = router;