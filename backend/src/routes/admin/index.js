// backend/src/routes/admin/index.js
const express = require('express');
const router = express.Router();

// Route de test admin
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalUsers: 150,
        totalVendors: 25,
        totalProducts: 320,
        totalOrders: 45,
        totalRevenue: 12500
      }
    }
  });
});

module.exports = router;