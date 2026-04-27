// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/avatars s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier uploads/avatars créé');
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WEBP'), false);
  }
};

// Limite de taille (5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;