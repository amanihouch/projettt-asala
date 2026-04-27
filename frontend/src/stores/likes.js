// frontend/src/stores/likes.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useAuthStore } from './auth'

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath === '') {
    return 'https://placehold.co/400x400/08717f/white?text=Produit'
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  if (imagePath.startsWith('data:image')) {
    return imagePath
  }
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  let normalizedPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath
  return `${API_BASE_URL}${normalizedPath}`
}

export const useLikesStore = defineStore('likes', () => {
  // ===== STATE =====
  const likedProductsMap = ref(new Map())
  const loading = ref(false)
  const isOpen = ref(false)

  const authStore = useAuthStore()

  // ===== HELPER FUNCTIONS =====

  // Sauvegarder dans localStorage
  const saveToStorage = () => {
    try {
      const products = Array.from(likedProductsMap.value.values())
      localStorage.setItem('wishlist', JSON.stringify(products))
      localStorage.setItem('favoriteProducts', JSON.stringify(products))
      console.log('💾 Favoris sauvegardés dans localStorage:', products.length)
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error)
    }
  }

  // Normaliser un produit pour le stockage
  const normalizeProduct = (product) => {
    return {
      id: product.id,
      name: product.name || product.productName || product.title || 'منتج',
      productName: product.productName || product.name || product.title,
      price: product.price || 0,
      oldPrice: product.oldPrice || product.originalPrice || null,
      image: formatImageUrl(product.image || product.images?.[0] || product.mainImage),
      images: Array.isArray(product.images) ? product.images : [],
      vendorName: product.vendorName || product.vendor?.name || product.vendor?.shopName || 'حرفي',
      vendorId: product.vendorId || product.vendor?.id || null,
      vendorVerified: product.vendorVerified || product.vendor?.verified || false,
      rating: product.rating || 0,
      reviewsCount: product.reviewsCount || product.reviews || 0,
      likedAt: product.likedAt || new Date().toISOString()
    }
  }

  // ===== BACKEND OPERATIONS =====

  // Charger depuis le backend
  const loadFromBackend = async () => {
    if (!authStore.isAuthenticated) {
      console.log('ℹ️ Utilisateur non connecté, chargement depuis localStorage')
      loadFromStorage()
      return
    }

    loading.value = true
    try {
      const response = await api.get('/users/likes').catch(() => null)

      if (response && response.data && response.data.success) {
        const likedProducts = response.data.data?.likes || response.data.likes || []

        likedProductsMap.value.clear()
        likedProducts.forEach(like => {
          const product = like.product || like
          if (product && product.id) {
            const normalized = normalizeProduct({
              ...product,
              likedAt: like.createdAt || new Date().toISOString()
            })
            likedProductsMap.value.set(product.id, normalized)
          }
        })

        console.log('✅ Favoris chargés depuis le backend:', likedProductsMap.value.size)
        saveToStorage()
      } else {
        console.log('ℹ️ Aucun favoris trouvé dans le backend')
        loadFromStorage()
      }
    } catch (error) {
      console.error('❌ Erreur chargement favoris backend:', error)
      loadFromStorage()
    } finally {
      loading.value = false
    }
  }

  // Charger depuis localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('wishlist') || localStorage.getItem('favoriteProducts')

      if (stored) {
        const products = JSON.parse(stored)
        likedProductsMap.value.clear()

        products.forEach((product) => {
          if (product && product.id) {
            const normalized = normalizeProduct(product)
            likedProductsMap.value.set(product.id, normalized)
          }
        })

        console.log('✅ Favoris chargés depuis localStorage:', likedProductsMap.value.size)
      } else {
        console.log('ℹ️ Aucun favoris dans localStorage')
      }
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error)
    }
  }

  // Synchroniser avec le backend après connexion
  const syncWithBackend = async () => {
    if (!authStore.isAuthenticated) return

    const localProducts = Array.from(likedProductsMap.value.values())

    if (localProducts.length === 0) {
      await loadFromBackend()
      return
    }

    // Envoyer les favoris locaux au backend
    try {
      for (const product of localProducts) {
        await api.post(`/users/likes/${product.id}`).catch(() => {})
      }
      console.log('✅ Favoris locaux synchronisés avec le backend')
      await loadFromBackend()
    } catch (error) {
      console.error('❌ Erreur synchronisation favoris:', error)
    }
  }

  // ===== GETTERS =====

  const likedProducts = computed(() => {
    return Array.from(likedProductsMap.value.values())
      .sort((a, b) => new Date(b.likedAt || 0) - new Date(a.likedAt || 0))
  })

  const likesCount = computed(() => likedProductsMap.value.size)

  const items = computed(() => likedProducts.value)

  const isLiked = (productId) => {
    if (!productId) return false
    return likedProductsMap.value.has(productId)
  }

  // ===== ACTIONS =====

  const addLike = async (product) => {
    if (!product || !product.id) {
      console.error('❌ Produit invalide pour addLike')
      return false
    }

    const productId = product.id

    if (!likedProductsMap.value.has(productId)) {
      const normalized = normalizeProduct({
        ...product,
        likedAt: new Date().toISOString()
      })

      likedProductsMap.value.set(productId, normalized)

      // Envoyer au backend si connecté
      if (authStore.isAuthenticated) {
        try {
          await api.post(`/users/likes/${productId}`).catch(() => {})
          console.log('📤 Favori envoyé au backend:', productId)
        } catch (error) {
          console.error('❌ Erreur envoi favori backend:', error)
        }
      }

      saveToStorage()
      console.log('❤️ Produit ajouté aux favoris:', normalized.name)
      return true
    }
    return false
  }

  const removeLike = async (productId) => {
    if (!productId) {
      console.error('❌ ID produit invalide pour removeLike')
      return false
    }

    if (likedProductsMap.value.has(productId)) {
      likedProductsMap.value.delete(productId)

      // Supprimer du backend si connecté
      if (authStore.isAuthenticated) {
        try {
          await api.delete(`/users/likes/${productId}`).catch(() => {})
          console.log('📤 Favori supprimé du backend:', productId)
        } catch (error) {
          console.error('❌ Erreur suppression favori backend:', error)
        }
      }

      saveToStorage()
      console.log('💔 Produit retiré des favoris')
      return true
    }
    return false
  }

  const toggleLike = async (product) => {
    const productId = typeof product === 'object' ? product.id : product

    if (isLiked(productId)) {
      await removeLike(productId)
      return false
    } else {
      if (typeof product === 'object') {
        await addLike(product)
        return true
      }
      return false
    }
  }

  const clearAllLikes = async () => {
    const count = likedProductsMap.value.size
    likedProductsMap.value.clear()

    // Supprimer tous les favoris du backend si connecté
    if (authStore.isAuthenticated) {
      try {
        await api.delete('/users/likes').catch(() => {})
        console.log('📤 Tous les favoris supprimés du backend')
      } catch (error) {
        console.error('❌ Erreur suppression tous les favoris:', error)
      }
    }

    saveToStorage()
    console.log(`🗑️ ${count} favoris ont été supprimés`)
  }

  // ===== SIDEBAR CONTROLS =====

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen.value ? 'hidden' : ''
    }
    console.log('📂 Sidebar favoris:', isOpen.value ? 'ouverte' : 'fermée')
  }

  const openSidebar = () => {
    isOpen.value = true
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
    console.log('📂 Sidebar favoris ouverte')
  }

  const closeSidebar = () => {
    isOpen.value = false
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
    console.log('📂 Sidebar favoris fermée')
  }

  // ===== INITIALIZATION =====

  const init = async () => {
    console.log('🚀 Initialisation du store likes...')

    if (authStore.isAuthenticated) {
      await loadFromBackend()
    } else {
      loadFromStorage()
    }

    // Écouter les changements d'authentification
    const unsubscribe = authStore.$subscribe(async (mutation, state) => {
      if (state.isAuthenticated) {
        console.log('🔐 Utilisateur connecté, synchronisation des favoris...')
        await syncWithBackend()
      }
    })

    // Nettoyer l'écouteur quand le store est détruit
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        unsubscribe()
      })
    }
  }

  // Démarrer l'initialisation
  init()

  // ===== RETURN =====

  return {
    // State
    likedProductsMap,
    likedProducts,
    loading,
    isOpen,

    // Getters
    likesCount,
    items,
    isLiked,

    // Actions
    loadFromBackend,
    loadFromStorage,
    syncWithBackend,
    addLike,
    removeLike,
    toggleLike,
    clearAllLikes,

    // Sidebar controls
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Init
    init
  }
})
