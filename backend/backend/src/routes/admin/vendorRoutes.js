const express = require('express');
const router = express.Router();
const vendorController = require('../../controllers/admin/vendors');
const { protect } = require('../../middleware/auth');
const { adminOnly } = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.patch('/:id', vendorController.updateVendor);
router.patch('/:id/verify', vendorController.toggleVerify);

module.exports = router;