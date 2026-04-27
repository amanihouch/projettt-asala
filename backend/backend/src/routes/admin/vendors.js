// backend/src/routes/admin/vendors.js
const express = require('express');
const router = express.Router();
const vendorController = require('../../controllers/admin/VendorController');

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);
router.patch('/:id/toggle-verification', vendorController.toggleVerification);

module.exports = router;