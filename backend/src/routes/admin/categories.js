// backend/src/routes/admin/categories.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const { uploadCategoryImage } = require('../../config/cloudinary');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../../controllers/admin/CategoryController');
const { moveCategory } = require('../../controllers/categoryController');

// Middleware d'authentification pour toutes les routes
router.use(protect);
router.use(authorize('admin'));

// Upload d'image
router.post('/upload-image', uploadCategoryImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie'
      });
    }

    res.json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Erreur upload image:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload'
    });
  }
});

// CRUD
router.route('/')
  .get(getAllCategories)
  .post(createCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Déplacement
router.patch('/:id/move', moveCategory);

module.exports = router;