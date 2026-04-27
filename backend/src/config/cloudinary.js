// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djfj85bwe',
  api_key: process.env.CLOUDINARY_API_KEY || '567175143566777',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'KZ5x16io-jpLDqzDRZN4PmtWc04',
  secure: true
});

// Vérifier la connexion
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connecté avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Cloudinary:', error.message);
    return false;
  }
};

// ===== STORAGE POUR LES CATÉGORIES (NOUVEAU) =====
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 400, height: 400, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const categoryName = req.body?.nameAr || req.body?.name || 'category';
      const safeName = categoryName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `category_${safeName}_${timestamp}_${random}`;
    }
  }
});

// Storage pour les avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      return `avatar_${req.user?.id || timestamp}_${random}`;
    }
  }
});

// Storage pour les couvertures
const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1600, height: 800, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const vendorId = req.params.id || req.user?.vendorId || 'unknown';
      return `cover_${vendorId}_${timestamp}`;
    }
  }
});

// Storage pour les produits (images multiples)
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const vendorId = req.user?.vendorId || 'unknown';
      return `product_${vendorId}_${timestamp}_${random}`;
    }
  }
});

// Storage pour les posts (images multiples)
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      return `post_${timestamp}_${random}`;
    }
  }
});

// ===== CONFIGURATION MULTER =====

// Upload pour les catégories (NOUVEAU)
const uploadCategoryImage = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ Image catégorie acceptée:', file.originalname);
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp, gif)'));
    }
  }
});

// Upload pour les avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp, gif)'));
    }
  }
});

// Upload pour les couvertures
const uploadCover = multer({
  storage: coverStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
    }
  }
});

// Upload pour les produits (images multiples)
const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Upload pour les posts (images multiples)
const uploadMultiple = multer({
  storage: postStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 [uploadMultiple] fileFilter appelé');
    console.log('   - originalname:', file.originalname);
    console.log('   - mimetype:', file.mimetype);
    console.log('   - size:', file.size);
    
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('   ✅ Fichier accepté');
      return cb(null, true);
    } else {
      console.log('   ❌ Fichier rejeté');
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Middleware de debug pour uploadMultiple
uploadMultiple.debug = (req, res, next) => {
  console.log('🔍 [uploadMultiple.debug] req.files avant traitement:', req.files);
  console.log('🔍 [uploadMultiple.debug] req.body:', req.body);
  next();
};

// ===== FONCTIONS UTILITAIRES =====

const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    
    // Extraire le public_id de l'URL Cloudinary
    let publicId = null;
    
    if (imageUrl.includes('cloudinary.com')) {
      const parts = imageUrl.split('/upload/');
      if (parts.length > 1) {
        let pathPart = parts[1];
        // Enlever les transformations
        if (pathPart.includes('/')) {
          const pathParts = pathPart.split('/');
          // Chercher le dossier et le nom du fichier
          publicId = pathParts.slice(pathParts.findIndex(p => p.includes('turath'))).join('/');
          // Enlever l'extension
          publicId = publicId.replace(/\.[^/.]+$/, '');
        } else {
          publicId = pathPart.replace(/\.[^/.]+$/, '');
        }
      }
    }
    
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ Image supprimée: ${publicId}`, result);
      return result.result === 'ok';
    }
    return false;
  } catch (error) {
    console.error('❌ Erreur suppression image:', error);
    return false;
  }
};

const deleteMultipleImages = async (imageUrls) => {
  const results = [];
  for (const url of imageUrls) {
    const result = await deleteImage(url);
    results.push(result);
  }
  return results;
};

const getOptimizedUrl = (publicId, options = {}) => {
  const { width, height, crop = 'limit', quality = 'auto' } = options;
  
  let transformation = [];
  if (width || height) {
    transformation.push({ width: width || 'auto', height: height || 'auto', crop });
  }
  transformation.push({ quality, fetch_format: 'auto' });
  
  return cloudinary.url(publicId, { transformation });
};
// backend/src/config/cloudinary.js
// Ajoutez ceci après les autres storages

// Storage pour les vidéos Reels
const reelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turath/reels',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm', 'avi', 'quicktime'],
    transformation: [
      { width: 1080, height: 1920, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const vendorId = req.body?.vendorId || req.user?.vendorId || 'unknown';
      return `reel_${vendorId}_${timestamp}_${random}`;
    }
  }
});

// Upload pour les vidéos Reels
const uploadReelVideo = multer({
  storage: reelStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|webm|avi|quicktime/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ Vidéo acceptée:', file.originalname);
      return cb(null, true);
    } else {
      cb(new Error('Seules les vidéos sont autorisées (MP4, MOV, WEBM, AVI)'));
    }
  }
});

// ===== EXPORTS =====
module.exports = {
  cloudinary,
  uploadCategoryImage,    // NOUVEAU
  uploadAvatar,
  uploadCover,
  uploadProductImages,
  uploadMultiple,
  deleteImage,
  deleteMultipleImages,
  getOptimizedUrl,
  testConnection,
  uploadReelVideo
};