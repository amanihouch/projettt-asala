// frontend/src/stores/vendorStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useVendorStore = defineStore('vendor', () => {
  // ===== STATE =====
  const vendors = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentVendor = ref(null)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const totalCount = ref(0)

  // ===== COMPUTED =====
  const hasVendors = computed(() => vendors.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const getCurrentVendor = computed(() => currentVendor.value)
  const hasCurrentVendor = computed(() => currentVendor.value !== null) // AJOUT

  // ===== MÉTHODES PRIVÉES =====
  const saveToStorage = () => {
    try {
      localStorage.setItem('vendors', JSON.stringify(vendors.value))
      if (currentVendor.value) {
        localStorage.setItem('currentVendor', JSON.stringify(currentVendor.value))
      }
    } catch (err) {
      console.error('❌ Erreur sauvegarde localStorage:', err)
    }
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('vendors')
      if (saved) {
        vendors.value = JSON.parse(saved)
        console.log('✅ Vendeurs chargés depuis localStorage:', vendors.value.length)
      }

      const savedCurrent = localStorage.getItem('currentVendor')
      if (savedCurrent) {
        currentVendor.value = JSON.parse(savedCurrent)
        console.log('✅ Vendeur courant chargé depuis localStorage')
      }
    } catch (err) {
      console.error('❌ Erreur chargement localStorage:', err)
      vendors.value = []
    }
  }

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Récupère tous les vendeurs depuis l'API
   */
  const fetchVendors = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Chargement des vendeurs depuis API...')

      const response = await api.get('/vendors', { params })

      if (response.data.success) {
        vendors.value = response.data.data.vendors || response.data.data
        totalCount.value = response.data.data.total || vendors.value.length
        currentPage.value = response.data.data.page || 1
        totalPages.value = response.data.data.pages || 1

        console.log('✅ Vendeurs chargés depuis API:', vendors.value.length)
        saveToStorage()
      } else {
        throw new Error(response.data.message || 'Erreur chargement vendeurs')
      }
    } catch (err) {
      console.error('❌ Erreur fetchVendors:', err)
      error.value = err.response?.data?.message || err.message
      loadFromStorage()
    } finally {
      loading.value = false
    }

    return vendors.value
  }

  /**
   * Récupère un vendeur par ID
   */
  const fetchVendorById = async (id) => {
    if (!id) {
      console.warn('⚠️ ID vendeur manquant')
      return null
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      console.warn('⚠️ ID vendeur invalide:', id)
      return null
    }

    console.log('🔍 fetchVendorById:', numericId)
    loading.value = true
    error.value = null

    try {
      // Chercher d'abord dans le store local
      let vendor = vendors.value.find(v => String(v.id) === String(numericId))

      if (vendor) {
        console.log('✅ Vendeur trouvé dans store local:', vendor)
        currentVendor.value = vendor
        saveToStorage()
        return vendor
      }

      // Chercher via l'API
      console.log('📦 Chargement vendeur depuis API:', numericId)

      try {
        const response = await api.get(`/vendors/${numericId}`)

        if (response.data.success) {
          vendor = response.data.data.vendor || response.data.data
          console.log('✅ Vendeur trouvé via API:', vendor)

          const existingIndex = vendors.value.findIndex(v => String(v.id) === String(vendor.id))
          if (existingIndex === -1) {
            vendors.value.push(vendor)
          } else {
            vendors.value[existingIndex] = vendor
          }

          currentVendor.value = vendor
          saveToStorage()
          return vendor
        }
      } catch (apiErr) {
        if (apiErr.response?.status === 404) {
          console.log('⚠️ Vendeur non trouvé dans API (404)')

          // Fallback: chercher par userId
          const foundByUserId = vendors.value.find(v => String(v.userId) === String(numericId))
          if (foundByUserId) {
            console.log('✅ Vendeur trouvé par userId:', foundByUserId)
            currentVendor.value = foundByUserId
            saveToStorage()
            return foundByUserId
          }

          // Recharger tous les vendeurs
          await fetchVendors()
          const foundAfterReload = vendors.value.find(v => String(v.userId) === String(numericId))
          if (foundAfterReload) {
            console.log('✅ Vendeur trouvé après rechargement:', foundAfterReload)
            currentVendor.value = foundAfterReload
            saveToStorage()
            return foundAfterReload
          }
        } else {
          throw apiErr
        }
      }

      currentVendor.value = null
      return null

    } catch (err) {
      console.error('❌ Erreur fetchVendorById:', err)
      error.value = err.response?.data?.message || err.message

      // Dernier fallback
      const localVendor = vendors.value.find(v => String(v.id) === String(numericId))
      if (localVendor) {
        console.log('✅ Vendeur trouvé dans store local (fallback):', localVendor)
        currentVendor.value = localVendor
        return localVendor
      }

    } finally {
      loading.value = false
    }

    console.log('❌ Vendeur non trouvé avec ID:', id)
    currentVendor.value = null
    return null
  }

  /**
   * Récupère un vendeur par User ID (AJOUT)
   */
  const fetchVendorByUserId = async (userId) => {
    try {
      const response = await api.get(`/vendors/user/${userId}`)

      if (response.data.success) {
        const vendor = response.data.data.vendor

        // Mettre à jour le store local
        const existingIndex = vendors.value.findIndex(v => String(v.userId) === String(userId))
        if (existingIndex === -1) {
          vendors.value.push(vendor)
        } else {
          vendors.value[existingIndex] = vendor
        }

        return vendor
      }
      return null
    } catch (err) {
      if (err.response?.status === 404) {
        return null
      }
      console.error('❌ Erreur fetchVendorByUserId:', err)
      return null
    }
  }

  /**
   * Crée un nouveau vendeur
   */
  const createVendor = async (vendorData) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Création vendeur:', vendorData)

      const response = await api.post('/vendors', vendorData)

      if (response.data.success) {
        const newVendor = response.data.data.vendor || response.data.data
        console.log('✅ Vendeur créé:', newVendor)

        vendors.value.push(newVendor)
        currentVendor.value = newVendor
        saveToStorage()

        return newVendor
      } else {
        throw new Error(response.data.message || 'Erreur création vendeur')
      }
    } catch (err) {
      console.error('❌ Erreur createVendor:', err)
      error.value = err.response?.data?.message || err.message

      // Fallback local
      const fallbackVendor = {
        ...vendorData,
        id: String(Date.now()),
        verified: false,
        productsCount: 0,
        followersCount: 0,
        rating: 0,
        createdAt: new Date().toISOString()
      }

      console.log('⚠️ Fallback: création locale:', fallbackVendor)
      vendors.value.push(fallbackVendor)
      currentVendor.value = fallbackVendor
      saveToStorage()

      return fallbackVendor
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un vendeur
   */
  const updateVendor = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Mise à jour vendeur:', id, updates)

      const response = await api.patch(`/vendors/${id}`, updates)

      if (response.data.success) {
        const updatedVendor = response.data.data.vendor || response.data.data

        const index = vendors.value.findIndex(v => String(v.id) === String(id))
        if (index !== -1) {
          vendors.value[index] = { ...vendors.value[index], ...updatedVendor }
        }

        if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
          currentVendor.value = { ...currentVendor.value, ...updatedVendor }
        }

        saveToStorage()
        console.log('✅ Vendeur mis à jour:', updatedVendor)

        return updatedVendor
      } else {
        throw new Error(response.data.message || 'Erreur mise à jour vendeur')
      }
    } catch (err) {
      console.error('❌ Erreur updateVendor:', err)
      error.value = err.response?.data?.message || err.message

      // Fallback local
      const index = vendors.value.findIndex(v => String(v.id) === String(id))
      if (index !== -1) {
        vendors.value[index] = { ...vendors.value[index], ...updates }

        if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
          currentVendor.value = { ...currentVendor.value, ...updates }
        }

        saveToStorage()
        return vendors.value[index]
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un vendeur
   */
  const deleteVendor = async (id) => {
    loading.value = true
    error.value = null

    try {
      console.log('🗑️ Suppression vendeur:', id)

      const response = await api.delete(`/vendors/${id}`)

      if (response.data.success) {
        vendors.value = vendors.value.filter(v => String(v.id) !== String(id))

        if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
          currentVendor.value = null
        }

        saveToStorage()
        console.log('✅ Vendeur supprimé')

        return true
      } else {
        throw new Error(response.data.message || 'Erreur suppression vendeur')
      }
    } catch (err) {
      console.error('❌ Erreur deleteVendor:', err)
      error.value = err.response?.data?.message || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Suivre/ne plus suivre un vendeur
   */
  const toggleFollow = async (vendorId) => {
    try {
      const response = await api.post(`/vendors/${vendorId}/follow`)

      if (response.data.success) {
        const index = vendors.value.findIndex(v => String(v.id) === String(vendorId))
        if (index !== -1) {
          vendors.value[index].followersCount = response.data.data.followersCount
        }

        if (currentVendor.value && String(currentVendor.value.id) === String(vendorId)) {
          currentVendor.value.followersCount = response.data.data.followersCount
        }

        saveToStorage()
        return response.data.data
      }

      return null
    } catch (err) {
      console.error('❌ Erreur toggleFollow:', err)
      return null
    }
  }

  /**
   * Récupère les produits d'un vendeur
   */
  const fetchVendorProducts = async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/products`)

      if (response.data.success) {
        return response.data.data.products || response.data.data
      }

      return []
    } catch (err) {
      console.error('❌ Erreur fetchVendorProducts:', err)
      return []
    }
  }

  /**
   * Récupère les posts d'un vendeur
   */
  const fetchVendorPosts = async (vendorId) => {
    try {
      const response = await api.get(`/posts/vendor/${vendorId}`)

      if (response.data.success) {
        return response.data.data.posts || response.data.data
      }

      return []
    } catch (err) {
      console.error('❌ Erreur fetchVendorPosts:', err)
      return []
    }
  }

  /**
   * Récupère les vendeurs populaires
   */
  const fetchTopVendors = async (limit = 5) => {
    try {
      const response = await api.get('/vendors/top', { params: { limit } })

      if (response.data.success) {
        return response.data.data.vendors || response.data.data
      }

      return []
    } catch (err) {
      console.error('❌ Erreur fetchTopVendors:', err)
      return []
    }
  }

  /**
   * Vide le cache et recharge depuis l'API
   */
  const refreshVendors = async () => {
    vendors.value = []
    currentVendor.value = null
    return fetchVendors()
  }

  /**
   * Efface le store
   */
  const clearStore = () => {
    vendors.value = []
    currentVendor.value = null
    error.value = null
    loading.value = false
    localStorage.removeItem('vendors')
    localStorage.removeItem('currentVendor')
  }

  // ===== INITIALISATION =====
  loadFromStorage()

  // ===== RETURN =====
  return {
    // State
    vendors,
    currentVendor,
    loading,
    error,

    // Getters
    hasVendors,
    isLoading,
    hasError,
    getCurrentVendor,
    hasCurrentVendor, // AJOUT
    totalPages,
    currentPage,
    totalCount,

    // Méthodes CRUD
    fetchVendors,
    fetchVendorById,
    fetchVendorByUserId, // AJOUT
    createVendor,
    updateVendor,
    deleteVendor,

    // Méthodes spécifiques
    toggleFollow,
    fetchVendorProducts,
    fetchVendorPosts,
    fetchTopVendors,

    // Utilitaires
    refreshVendors,
    clearStore,
    loadFromStorage
  }
})
