// frontend/src/utils/image.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DEFAULT_AVATAR = 'https://i.pravatar.cc/300';
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200';

/**
 * Vérifie si une valeur est une source d'image valide
 * @param {any} value - La valeur à vérifier
 * @returns {boolean}
 */
export const isValidImageValue = (value) => {
  if (!value || typeof value !== 'string') return false;
  const normalized = value.trim();
  return normalized !== '' && normalized !== 'null' && normalized !== 'undefined';
};

/**
 * Formate une URL d'image pour Cloudinary
 * @param {string} imagePath - Le chemin de l'image
 * @returns {string|null}
 */
export const formatImageUrl = (imagePath) => {
  if (!isValidImageValue(imagePath)) return null;

  // URL absolue déjà
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Image base64
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // URL Cloudinary
  if (imagePath.includes('cloudinary.com')) {
    return imagePath;
  }

  // Chemin relatif - construire l'URL complète
  let normalizedPath = imagePath.trim();
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }

  // Nettoyer les doubles slashes
  normalizedPath = normalizedPath.replace(/\/+/g, '/');

  // Construire l'URL complète
  const baseURL = API_BASE_URL.replace(/\/$/, '');
  return `${baseURL}/${normalizedPath}`;
};

/**
 * Trouve la première source d'image valide dans une liste
 * @param {...any} sources - Les sources à vérifier
 * @returns {string|null}
 */
export const getFirstValidImage = (...sources) => {
  for (const source of sources) {
    if (isValidImageValue(source)) {
      return source;
    }
  }
  return null;
};

/**
 * Formate les images d'un vendeur
 * @param {Object} vendor - L'objet vendeur
 * @returns {Object} - Le vendeur avec les images formatées
 */
export const formatVendorImages = (vendor) => {
  if (!vendor) return null;

  const formatted = { ...vendor };

  // Avatar - chercher dans tous les champs possibles
  const avatarSource = getFirstValidImage(
    vendor.userAvatar,
    vendor.avatar,
    vendor.avatar_url,
    vendor.user_avatar,
    vendor.profileImage,
    vendor.profile_image,
    vendor.image,
    vendor.user?.avatar
  );

  const formattedAvatar = formatImageUrl(avatarSource);
  formatted.avatar = formattedAvatar || DEFAULT_AVATAR;
  formatted.userAvatar = formattedAvatar || DEFAULT_AVATAR;

  // Cover image - chercher dans tous les champs possibles
  const coverSource = getFirstValidImage(
    vendor.coverImage,
    vendor.cover_image,
    vendor.cover,
    vendor.banner,
    vendor.shopCover,
    vendor.shop_cover,
    vendor.headerImage,
    vendor.header_image
  );

  formatted.coverImage = formatImageUrl(coverSource) || DEFAULT_COVER;

  return formatted;
};

/**
 * Formate les images d'un utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {Object} - L'utilisateur avec l'avatar formaté
 */
export const formatUserImages = (user) => {
  if (!user) return null;

  const formatted = { ...user };

  const avatarSource = getFirstValidImage(
    user.avatar,
    user.userAvatar,
    user.user_avatar,
    user.profileImage,
    user.profile_image,
    user.image
  );

  formatted.avatar = formatImageUrl(avatarSource) || DEFAULT_AVATAR;

  return formatted;
};

/**
 * Formate les images d'un post/produit
 * @param {Object} post - L'objet post
 * @returns {Object} - Le post avec les images formatées
 */
export const formatPostImages = (post) => {
  if (!post) return null;

  const formatted = { ...post };

  // Image principale
  const mainImageSource = getFirstValidImage(
    post.image,
    post.mainImage,
    post.main_image,
    post.thumbnail,
    post.images?.[0]
  );
  formatted.image = formatImageUrl(mainImageSource);

  // Toutes les images
  if (post.images && Array.isArray(post.images)) {
    formatted.images = post.images.map(img => formatImageUrl(img)).filter(Boolean);
  } else if (post.image) {
    formatted.images = [formatImageUrl(post.image)];
  } else {
    formatted.images = [];
  }

  // Avatar du vendeur
  const vendorAvatarSource = getFirstValidImage(
    post.vendorAvatar,
    post.vendor?.avatar,
    post.vendor?.userAvatar,
    post.user?.avatar,
    post.vendor_avatar
  );
  formatted.vendorAvatar = formatImageUrl(vendorAvatarSource) || DEFAULT_AVATAR;

  return formatted;
};

/**
 * Génère une URL Cloudinary avec transformations
 * @param {string} imageUrl - L'URL de l'image
 * @param {Object} options - Options de transformation
 * @returns {string}
 */
export const getCloudinaryUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return formatImageUrl(imageUrl);
  }

  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  if (transformations.length === 0) {
    return imageUrl;
  }

  const parts = imageUrl.split('/upload/');
  if (parts.length < 2) return imageUrl;
  
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

/**
 * Optimise une image pour l'affichage
 * @param {string} imageUrl - L'URL de l'image
 * @param {number} width - Largeur souhaitée
 * @param {number} height - Hauteur souhaitée
 * @returns {string}
 */
export const optimizeImage = (imageUrl, width = 400, height = 400) => {
  return getCloudinaryUrl(imageUrl, {
    width,
    height,
    crop: 'limit',
    quality: 'auto'
  });
};

/**
 * Vérifie si une URL est une image Cloudinary
 * @param {string} url - L'URL à vérifier
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};