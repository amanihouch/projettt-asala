// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: [
        { id: 1, name: 'الفخار', icon: '🏺', slug: 'pottery' },
        { id: 2, name: 'النسيج', icon: '🧵', slug: 'textiles' },
        { id: 3, name: 'المجوهرات', icon: '💍', slug: 'jewelry' }
      ]
    }
  });
});

router.get('/:slug', (req, res) => {
  res.json({
    success: true,
    data: {
      category: {
        id: 1,
        name: 'الفخار',
        slug: req.params.slug,
        icon: '🏺'
      }
    }
  });
});

module.exports = router;