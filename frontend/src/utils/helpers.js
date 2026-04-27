// src/utils/helpers.js

/**
 * Convertit un texte en slug URL-friendly
 * Supporte l'arabe, le français et les caractères spéciaux
 *
 * @param {string} text - Le texte à convertir
 * @returns {string} - Le slug nettoyé
 */
export const slugify = (text) => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                       // Décompose les accents (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '')        // Supprime les marques d'accent
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '') // Garde latin + arabe + chiffres
    .replace(/\s+/g, '-')                   // Remplace les espaces par des tirets
    .replace(/-+/g, '-')                    // Évite les tirets multiples
    .replace(/^-+|-+$/g, '');               // Supprime les tirets au début et à la fin
};

/**
 * Crée un slug complet pour un vendeur
 * Format: "123-nom-de-la-boutique" ou juste "nom-de-la-boutique"
 *
 * @param {number|string} id - L'ID du vendeur
 * @param {string} shopName - Le nom de la boutique
 * @returns {string} - Le slug complet
 */
export const createVendorSlug = (id, shopName) => {
  const nameSlug = slugify(shopName);
  if (!id) return nameSlug;
  return `${id}-${nameSlug}`;
};

/**
 * Extrait l'ID d'un slug de type "123-nom-de-la-boutique"
 *
 * @param {string} slug - Le slug complet
 * @returns {number|null} - L'ID ou null si non trouvé
 */
export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Formate un prix pour l'affichage en TND
 *
 * @param {number} price - Le prix à formater
 * @returns {string} - Le prix formaté
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  return new Intl.NumberFormat('ar-TN').format(Math.round(price * 100) / 100) + ' د.ت';
};

/**
 * Tronque un texte à une longueur donnée
 *
 * @param {string} text - Le texte à tronquer
 * @param {number} length - La longueur maximale
 * @returns {string} - Le texte tronqué
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Formate une date pour l'affichage
 *
 * @param {string|Date} dateStr - La date à formater
 * @returns {string} - La date formatée
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Obtient le nom d'une spécialité en arabe
 *
 * @param {string} specialty - Le code de la spécialité
 * @returns {string} - Le nom en arabe
 */
export const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: 'فخار وسيراميك',
    textiles: 'منسوجات وسجاد',
    jewelry: 'مجوهرات',
    woodwork: 'أعمال خشبية',
    metalwork: 'أعمال معدنية',
    leather: 'منتجات جلدية',
    perfumes: 'عطور',
    beauty: 'عناية وتجميل',
    food: 'منتجات غذائية',
    other: 'أخرى'
  };
  return specialties[specialty] || specialty || 'غير محدد';
};

/**
 * Obtient le nom d'une catégorie en arabe
 *
 * @param {string} cat - Le code de la catégorie
 * @returns {string} - Le nom en arabe
 */
export const getCategoryName = (cat) => {
  const categories = {
    perfumes: 'عطور',
    jewelry: 'حلي و اكسسوارات',
    clothing: 'ملابس',
    decoration: 'ديكور',
    textiles: 'أقمشة وسجادات',
    pottery: 'أواني',
    beauty: 'عناية وتجميل',
    food: 'أغذية',
    other: 'أخرى'
  };
  return categories[cat] || cat || 'غير مصنف';
};
