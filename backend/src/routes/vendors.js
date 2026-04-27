// backend/src/routes/vendors.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCover } = require('../config/cloudinary');

// ==================== ROUTES PUBLIQUES ====================
router.get('/', vendorController.getAllVendors);
router.get('/top', vendorController.getTopVendors);
router.get('/location/:location', vendorController.getVendorsByLocation);

// ⚠️ IMPORTANT : La route slug DOIT être AVANT la route /:id
router.get('/slug/:slug', vendorController.getVendorBySlug);

// Cette route doit aussi supporter le slug (pas seulement l'ID)
router.get('/:id', vendorController.getVendorByIdOrSlug);

router.get('/:id/products', vendorController.getVendorProducts);
router.get('/:id/followers', vendorController.getFollowers);

// ==================== ROUTES PROTÉGÉES ====================
router.use(protect);

router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.post('/:id/cover', uploadCover.single('cover'), vendorController.uploadCoverImage);
router.post('/:id/follow', vendorController.toggleFollow);
router.get('/:id/following', vendorController.checkFollowing);

// ==================== ROUTES ADMIN ====================
router.get('/admin/all', authorize('admin'), vendorController.getAllVendorsAdmin);
router.get('/admin/pending', authorize('admin'), vendorController.getPendingVendors);
router.put('/admin/:id/approve', authorize('admin'), vendorController.approveVendor);
router.delete('/admin/:id/reject', authorize('admin'), vendorController.rejectVendor);
router.delete('/admin/:id', authorize('admin'), vendorController.deleteVendor);

module.exports = router;