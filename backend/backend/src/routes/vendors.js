// backend/src/routes/vendors.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      vendors: [
        { id: 1, shopName: 'Vendeur 1', rating: 4.5 },
        { id: 2, shopName: 'Vendeur 2', rating: 4.8 }
      ]
    }
  });
});

router.get('/top', (req, res) => {
  res.json({
    success: true,
    data: {
      vendors: [
        { id: 2, shopName: 'Vendeur 2', rating: 4.8 }
      ]
    }
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      vendor: {
        id: req.params.id,
        shopName: 'Détail du vendeur',
        rating: 4.5,
        products: [
          { id: 1, name: 'Produit 1' }
        ]
      }
    }
  });
});

module.exports = router;