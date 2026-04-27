// backend/src/routes/categories.js

const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoriesHierarchy,
  getCategoryBySlug,
  getCategoryProducts,
  getBreadcrumb
} = require('../controllers/categoryController');

// Routes publiques
router.get('/', getAllCategories);
router.get('/hierarchy', getCategoriesHierarchy);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/products', getCategoryProducts);
router.get('/:id/breadcrumb', getBreadcrumb);

module.exports = router;