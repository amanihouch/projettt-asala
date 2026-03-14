// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();

// Middleware simulé pour auth (à remplacer plus tard)
const protect = (req, res, next) => {
  req.user = { id: 1, role: 'customer' };
  next();
};

router.use(protect);

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Commande créée avec succès',
    data: {
      order: {
        id: 1,
        orderNumber: 'ORD-2024-001',
        total: 127,
        status: 'pending'
      }
    }
  });
});

router.get('/my-orders', (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          total: 127,
          status: 'delivered',
          createdAt: new Date()
        }
      ]
    }
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      order: {
        id: req.params.id,
        orderNumber: 'ORD-2024-001',
        total: 127,
        status: 'pending',
        items: [
          { name: 'Produit 1', price: 120, quantity: 1 }
        ]
      }
    }
  });
});

module.exports = router;