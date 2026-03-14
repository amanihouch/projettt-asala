const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

router.get('/', vendorController.getAllVendors);
router.get('/top', vendorController.getTopVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);
router.post('/', protect, vendorController.createVendor);
router.post('/:id/follow', protect, vendorController.toggleFollow);

module.exports = router;