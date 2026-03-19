// backend/src/routes/vendors.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

// Routes publiques (sans authentification)
router.get('/', vendorController.getAllVendors);
router.get('/top', vendorController.getTopVendors);
router.get('/user/:userId', vendorController.getVendorByUserId);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

// Routes protégées (avec authentification)
router.post('/', protect, vendorController.createVendor);
router.post('/:id/follow', protect, vendorController.toggleFollow);
router.patch('/:id', protect, vendorController.updateVendor);

module.exports = router;