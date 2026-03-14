// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const constants = require('../config/constants');

// S'assurer que le dossier de destination existe
const avatarPath = path.join(__dirname, '../../', constants.UPLOAD.PATHS.AVATARS);
if (!fs.existsSync(avatarPath)) {
  fs.mkdirSync(avatarPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour éviter les collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = constants.UPLOAD.ALLOWED_TYPES;
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Utilisez jpg, png ou webp.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: constants.UPLOAD.MAX_SIZE, // 5 Mo
  },
  fileFilter: fileFilter
});

module.exports = upload;