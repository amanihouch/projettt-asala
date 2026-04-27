// backend/src/routes/admin/products.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../config/database');

// Récupérer tous les produits
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, u.name as vendor_name
      FROM posts p
      LEFT JOIN users u ON p.vendor_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('❌ Erreur getProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;