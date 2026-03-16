// backend/src/routes/vendors.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

// Vérifier que le contrôleur est bien chargé
console.log('📦 vendorController chargé:', Object.keys(vendorController));

// Routes publiques
router.get('/', vendorController.getAllVendors);
router.get('/top', vendorController.getTopVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

// Routes protégées
router.post('/', protect, vendorController.createVendor);
router.put('/:id', protect, vendorController.updateVendor);
router.delete('/:id', protect, vendorController.deleteVendor);
router.post('/:id/follow', protect, vendorController.toggleFollow);

module.exports = router;