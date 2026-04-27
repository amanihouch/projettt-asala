import { defineStore } from 'pinia'

const STORAGE_KEY = 'specialOffers'
const FALLBACK_IMAGE = 'https://placehold.co/800x520/08717f/white?text=Offre'

const normalizeOffer = (offer = {}) => ({
  id: offer.id ?? Date.now(),
  image: offer.image || FALLBACK_IMAGE,
  title: offer.title || '',
  description: offer.description || '',
  price: offer.price || '',
  oldPrice: offer.oldPrice || '',
  badge: offer.badge || '',
  tags: Array.isArray(offer.tags) ? offer.tags : [],
  link: offer.link || '/products',
  active: offer.active !== false,
  highlighted: Boolean(offer.highlighted),
  updatedAt: offer.updatedAt || Date.now()
})

const sortOffers = (offers = []) => {
  return [...offers].sort((a, b) => {
    if (a.highlighted !== b.highlighted) return Number(b.highlighted) - Number(a.highlighted)
    return Number(b.updatedAt || 0) - Number(a.updatedAt || 0)
  })
}

export const useOffersStore = defineStore('offers', {
  state: () => ({
    offers: []
  }),

  getters: {
    activeOffers: (state) => {
      return sortOffers(state.offers.filter(offer => offer.active !== false))
    },

    highlightedOffers: (state) => {
      return state.offers.filter(offer => offer.highlighted && offer.active)
    },

    totalOffers: (state) => state.offers.length,

    activeOffersCount: (state) => state.offers.filter(o => o.active).length,

    highlightedOffersCount: (state) => state.offers.filter(o => o.highlighted).length
  },

  actions: {
    loadOffers() {
      if (typeof window === 'undefined') return

      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          this.offers = sortOffers(JSON.parse(saved).map(normalizeOffer))
        } else {
          // Initialiser avec des offres par défaut
          this.offers = sortOffers([
            {
              id: 1,
              image: 'https://placehold.co/600x400/08717f/white?text=عرض+حصري',
              title: 'Livraison gratuite dès 39 € d\'achat',
              description: 'Retours gratuits sous 30 jours',
              price: '29,73€',
              oldPrice: '49,99€',
              badge: 'حصري',
              tags: ['Livraison gratuite', 'Retours gratuits'],
              link: '/products?offer=free-shipping',
              active: true,
              highlighted: true,
              updatedAt: Date.now()
            },
            {
              id: 2,
              image: 'https://placehold.co/600x400/d40025/white?text=Offre+Spéciale',
              title: 'Coupon valable sur tout le site',
              description: 'Plafonné à 10€',
              price: '10€',
              oldPrice: '',
              badge: 'Coupon',
              tags: ['Plafonné à 10€', 'Affilié à la liste limitée'],
              link: '/products?offer=coupon',
              active: true,
              highlighted: false,
              updatedAt: Date.now()
            },
            {
              id: 3,
              image: 'https://placehold.co/600x400/065a69/white?text=Expédition+Gratuite',
              title: 'Expédition gratuite',
              description: 'Empilable - Offre à durée limitée',
              price: '',
              oldPrice: '',
              badge: 'Gratuit',
              tags: ['Commandes 19€+', 'À cumuler avec des bons de réduction'],
              link: '/products?offer=free-shipping',
              active: true,
              highlighted: false,
              updatedAt: Date.now()
            }
          ])
          this.persistOffers()
        }
      } catch (error) {
        console.error('❌ Erreur chargement offres:', error)
        this.offers = []
      }
    },

    persistOffers() {
      if (typeof window === 'undefined') return

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.offers))

      // Émettre un événement pour la synchronisation entre onglets
      window.dispatchEvent(
        new CustomEvent('special-offers:updated', {
          detail: this.offers
        })
      )
    },

    upsertOffer(payload) {
      const offer = normalizeOffer({
        ...payload,
        updatedAt: Date.now()
      })

      const index = this.offers.findIndex(item => item.id === offer.id)

      if (index !== -1) {
        this.offers[index] = offer
      } else {
        this.offers.unshift(offer)
      }

      this.offers = sortOffers(this.offers)
      this.persistOffers()

      return offer
    },

    deleteOffer(id) {
      this.offers = this.offers.filter(offer => offer.id !== id)
      this.persistOffers()
    },

    toggleOfferStatus(id) {
      const offer = this.offers.find(item => item.id === id)
      if (!offer) return

      offer.active = !offer.active
      offer.updatedAt = Date.now()
      this.offers = sortOffers(this.offers)
      this.persistOffers()

      return offer
    },

    getOfferById(id) {
      return this.offers.find(offer => offer.id === id)
    }
  }
})
