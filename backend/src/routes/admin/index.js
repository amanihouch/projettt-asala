// backend/src/routes/admin/index.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const dashboardController = require('../../controllers/admin/DashboardController');

// Toutes les routes admin nécessitent authentification et rôle admin
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', dashboardController.getDashboardStats);

module.exports = router;