// backend/src/routes/products.js
const express = require('express');
const router = express.Router();

// Routes temporaires pour tester
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Route produits fonctionne',
    data: {
      products: [
        { id: 1, name: 'Produit 1', price: 100 },
        { id: 2, name: 'Produit 2', price: 200 }
      ]
    }
  });
});

router.get('/featured', (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        { id: 1, name: 'Produit vedette 1', price: 150 }
      ]
    }
  });
});

router.get('/sponsored', (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        { id: 2, name: 'Produit sponsorisé 1', price: 250 }
      ]
    }
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      product: {
        id: req.params.id,
        name: 'Détail du produit',
        price: 100,
        description: 'Description du produit'
      }
    }
  });
});

module.exports = router;