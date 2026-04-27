// backend/src/routes/users.js
const express = require('express');
const router = express.Router();

// Middleware simulé pour auth
const protect = (req, res, next) => {
  req.user = { id: 1, name: 'Test User', email: 'test@test.com', role: 'customer' };
  next();
};

router.use(protect);

router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'customer',
        avatar: 'https://i.pravatar.cc/300'
      }
    }
  });
});

router.put('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profil mis à jour',
    data: {
      user: {
        ...req.body,
        id: 1
      }
    }
  });
});

router.get('/wishlist', (req, res) => {
  res.json({
    success: true,
    data: {
      wishlist: [
        { id: 1, name: 'Produit favori 1', price: 120 },
        { id: 2, name: 'Produit favori 2', price: 85 }
      ]
    }
  });
});

module.exports = router;