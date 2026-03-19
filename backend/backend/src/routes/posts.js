// backend/src/routes/posts.js
const express = require('express');
const router = express.Router();

router.get('/feed', (req, res) => {
  res.json({
    success: true,
    data: {
      posts: [
        {
          id: 1,
          vendorName: 'فخاريات الفخراني',
          productName: 'إناء فخاري',
          price: 120,
          images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800']
        }
      ]
    }
  });
});

router.get('/vendor/:vendorId', (req, res) => {
  res.json({
    success: true,
    data: {
      posts: [
        {
          id: 1,
          productName: 'منتج 1',
          price: 100
        }
      ]
    }
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      post: {
        id: req.params.id,
        productName: 'Détail du post',
        price: 100,
        description: 'Description'
      }
    }
  });
});

module.exports = router;