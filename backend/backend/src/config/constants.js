// backend/src/config/constants.js
module.exports = {
  // Rôles utilisateur
  ROLES: {
    ADMIN: 'admin',
    VENDOR: 'vendor',
    CUSTOMER: 'customer'
  },

  // Statuts de commande
  ORDER_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Statuts de post
  POST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // Catégories de produits
  CATEGORIES: [
    { value: 'perfumes', label: 'عطور', icon: '🌸' },
    { value: 'jewelry', label: 'حلي و اكسسوارات', icon: '💍' },
    { value: 'clothing', label: 'ملابس', icon: '👗' },
    { value: 'decoration', label: 'ديكور', icon: '🏺' },
    { value: 'textiles', label: 'أقمشة وسجادات', icon: '🧵' },
    { value: 'pottery', label: 'أواني', icon: '🍽️' },
    { value: 'beauty', label: 'عناية وتجميل', icon: '🧴' },
    { value: 'food', label: 'أغدية', icon: '🍯' },
    { value: 'other', label: 'أخرى', icon: '✨' }
  ],

  // Unités de mesure
  UNITS: {
    PIECE: 'piece',
    SET: 'set',
    KG: 'kg',
    GRAM: 'gram',
    LITER: 'liter',
    METER: 'meter'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Upload
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    PATHS: {
      AVATARS: 'uploads/avatars/',
      PRODUCTS: 'uploads/products/',
      COVERS: 'uploads/covers/'
    }
  }
};