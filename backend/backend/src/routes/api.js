// backend/src/routes/api.js
const express = require('express');
const router = express.Router();

// Route de test
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'API fonctionne',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;