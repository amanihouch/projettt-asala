// backend/src/routes/admin/vendors.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const vendorController = require('../../controllers/admin/VendorController');

router.use(protect);
router.use(admin);

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);
router.patch('/:id/toggle-verification', vendorController.toggleVerification);

module.exports = router;