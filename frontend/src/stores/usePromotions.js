// src/composables/usePromotions.js
// Composable central pour la gestion des promotions

import { ref, computed } from 'vue'

export function usePromotions() {
  // ==================== CHARGEMENT DES DONNÉES ====================
  const loadOffers = () => {
    try {
      const saved = localStorage.getItem('specialOffers')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const loadActivePromoCode = () => {
    try {
      const saved = localStorage.getItem('activePromoCode')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  const saveOffers = (offers) => {
    localStorage.setItem('specialOffers', JSON.stringify(offers))
    window.dispatchEvent(new Event('special-offers:updated'))
  }

  // ==================== VALIDATION DES OFFRES ====================
  const isValidOffer = (offer, user = null, cartTotal = null) => {
    if (!offer?.active) return false

    // Vérification des dates
    const now = new Date()
    if (offer.startDate && new Date(offer.startDate) > now) return false
    if (offer.expiryDate && new Date(offer.expiryDate) < now) return false

    // Vérification première commande
    if (offer.firstOrderOnly && user?.hasOrderedBefore) return false

    // Vérification minimum d'achat
    if (offer.minPurchase && cartTotal !== null && cartTotal < offer.minPurchase) return false

    return true
  }

  // ==================== CALCUL DES RÉDUCTIONS ====================
  const calculateDiscount = (basePrice, offer) => {
    if (!offer) return 0

    if (offer.discountType === 'percentage') {
      return (basePrice * Number(offer.discountValue || 0)) / 100
    }

    if (offer.discountType === 'fixed') {
      return Number(offer.discountValue || 0)
    }

    return 0
  }

  // ==================== PROMOS PAR PRODUIT ====================
  const getBestProductPromotion = (product, user = null) => {
    const offers = loadOffers()
    const codePromo = loadActivePromoCode()

    // Filtre les offres valides pour ce produit
    const validOffers = offers.filter(offer => {
      if (!isValidOffer(offer, user)) return false

      // Promo produit
      if (offer.type === 'product') {
        return Array.isArray(offer.productIds) && offer.productIds.includes(product.id)
      }

      // Promo vendeur
      if (offer.type === 'vendor') {
        return Number(offer.vendorId) === Number(product.vendorId || product.vendor?.id)
      }

      // Promo globale auto-appliquée
      if (offer.type === 'global' && offer.autoApply) {
        return true
      }

      return false
    })

    // Ajoute le code promo manuel s'il est valide
    if (codePromo && isValidOffer(codePromo, user)) {
      validOffers.push(codePromo)
    }

    if (!validOffers.length) return null

    // Retourne la meilleure offre (celle qui donne la plus grande réduction)
    return validOffers.sort((a, b) => {
      const aDiscount = calculateDiscount(product.price, a)
      const bDiscount = calculateDiscount(product.price, b)
      return bDiscount - aDiscount
    })[0]
  }

  const getProductFinalPrice = (product, user = null) => {
    const bestPromo = getBestProductPromotion(product, user)

    if (!bestPromo) {
      return {
        finalPrice: product.price,
        discount: 0,
        appliedPromotion: null
      }
    }

    const discount = Math.min(calculateDiscount(product.price, bestPromo), product.price)

    return {
      finalPrice: Math.max(0, product.price - discount),
      discount,
      appliedPromotion: bestPromo
    }
  }

  // ==================== PROMOS POUR LE PANIER ====================
  const getBestCartPromotion = (cartItems, subtotal, user = null) => {
    const offers = loadOffers()
    const codePromo = loadActivePromoCode()

    // Récupère toutes les promos globales auto-appliquées
    const globalAutoOffers = offers.filter(offer =>
      offer.type === 'global' && offer.autoApply && isValidOffer(offer, user, subtotal)
    )

    const candidates = [...globalAutoOffers]

    // Ajoute le code promo manuel s'il est valide
    if (codePromo && isValidOffer(codePromo, user, subtotal)) {
      candidates.push(codePromo)
    }

    if (!candidates.length) {
      return { discount: 0, appliedPromotion: null }
    }

    // Retourne la meilleure offre globale
    const bestPromo = candidates.sort((a, b) => {
      const aDiscount = calculateDiscount(subtotal, a)
      const bDiscount = calculateDiscount(subtotal, b)
      return bDiscount - aDiscount
    })[0]

    const discount = Math.min(calculateDiscount(subtotal, bestPromo), subtotal)

    return {
      discount,
      appliedPromotion: bestPromo
    }
  }

  // ==================== PROMOS SPÉCIFIQUES ====================
  const getVendorPromotions = (vendorId) => {
    const offers = loadOffers()
    return offers.filter(offer =>
      offer.type === 'vendor' &&
      Number(offer.vendorId) === Number(vendorId) &&
      isValidOffer(offer)
    )
  }

  const getProductPromotions = (productId) => {
    const offers = loadOffers()
    return offers.filter(offer =>
      offer.type === 'product' &&
      Array.isArray(offer.productIds) &&
      offer.productIds.includes(productId) &&
      isValidOffer(offer)
    )
  }

  const getGlobalPromotions = () => {
    const offers = loadOffers()
    return offers.filter(offer =>
      offer.type === 'global' &&
      isValidOffer(offer)
    )
  }

  const getCodePromotions = () => {
    const offers = loadOffers()
    return offers.filter(offer =>
      offer.type === 'code' &&
      isValidOffer(offer)
    )
  }

  // ==================== GESTION DES CODES PROMO ====================
  const applyPromoCode = (code, user = null) => {
    const offers = loadOffers()
    const promoCodeOffer = offers.find(offer =>
      offer.type === 'code' &&
      offer.code?.toUpperCase() === code.toUpperCase() &&
      isValidOffer(offer, user)
    )

    if (!promoCodeOffer) {
      return { success: false, message: 'رمز الخصم غير صالح' }
    }

    localStorage.setItem('activePromoCode', JSON.stringify(promoCodeOffer))
    window.dispatchEvent(new Event('promo-code:applied'))

    return {
      success: true,
      message: `تم تطبيق رمز الخصم: ${promoCodeOffer.code}`,
      promotion: promoCodeOffer
    }
  }

  const removePromoCode = () => {
    localStorage.removeItem('activePromoCode')
    window.dispatchEvent(new Event('promo-code:removed'))
  }

  const getActivePromoCode = () => {
    return loadActivePromoCode()
  }

  // ==================== CRUD OFFERS ====================
  const addOffer = (offer) => {
    const offers = loadOffers()
    const newOffer = { ...offer, id: Date.now() }
    offers.push(newOffer)
    saveOffers(offers)
    return newOffer
  }

  const updateOffer = (offerId, updatedData) => {
    const offers = loadOffers()
    const index = offers.findIndex(o => o.id === offerId)
    if (index !== -1) {
      offers[index] = { ...offers[index], ...updatedData }
      saveOffers(offers)
      return offers[index]
    }
    return null
  }

  const deleteOffer = (offerId) => {
    const offers = loadOffers()
    const filtered = offers.filter(o => o.id !== offerId)
    saveOffers(filtered)
    return true
  }

  const getOffer = (offerId) => {
    const offers = loadOffers()
    return offers.find(o => o.id === offerId) || null
  }

  return {
    // Lecture
    loadOffers,
    loadActivePromoCode,
    isValidOffer,
    calculateDiscount,

    // Promos produit
    getBestProductPromotion,
    getProductFinalPrice,

    // Promos panier
    getBestCartPromotion,

    // Filtrage
    getVendorPromotions,
    getProductPromotions,
    getGlobalPromotions,
    getCodePromotions,

    // Codes promo
    applyPromoCode,
    removePromoCode,
    getActivePromoCode,

    // CRUD
    addOffer,
    updateOffer,
    deleteOffer,
    getOffer
  }
}
