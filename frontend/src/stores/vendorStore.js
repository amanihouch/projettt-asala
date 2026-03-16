// frontend/src/stores/vendorStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVendorStore = defineStore('vendor', () => {
  const vendors = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentVendor = ref(null)

  // URL de base de l'API
  const API_URL = 'http://localhost:5000/api/v1'

  // Charger tous les vendeurs depuis l'API
  const fetchVendors = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('📦 Chargement des vendeurs depuis API...')
      const response = await fetch(`${API_URL}/vendors`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        vendors.value = result.data.vendors
        console.log('✅ Vendeurs chargés depuis API:', vendors.value.length)

        // Sauvegarder aussi dans localStorage pour fallback
        localStorage.setItem('vendors', JSON.stringify(vendors.value))
      } else {
        throw new Error(result.message || 'Erreur chargement vendeurs')
      }
    } catch (err) {
      console.error('❌ Erreur fetchVendors:', err)
      error.value = err.message

      // Fallback: charger depuis localStorage
      loadFromStorage()
    } finally {
      loading.value = false
    }
  }

  // Charger depuis localStorage (fallback)
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('vendors')
      if (saved) {
        vendors.value = JSON.parse(saved)
        console.log('✅ Vendeurs chargés depuis localStorage (fallback):', vendors.value.length)
      } else {
        vendors.value = []
      }
    } catch (err) {
      console.error('❌ Erreur chargement localStorage:', err)
      vendors.value = []
    }
  }

  // Récupérer un vendeur par ID (VERSION CORRIGÉE AVEC FALLBACK)
  const getVendorById = async (id) => {
    if (!id) return null

    console.log('🔍 getVendorById:', id)
    loading.value = true

    try {
      // 1️⃣ Chercher d'abord dans le store local
      let vendor = vendors.value.find(v => String(v.id) === String(id))

      if (vendor) {
        console.log('✅ Vendeur trouvé dans store:', vendor)
        currentVendor.value = vendor
        return vendor
      }

      // 2️⃣ Sinon, chercher via l'API
      console.log('📦 Chargement vendeur depuis API:', id)
      const response = await fetch(`${API_URL}/vendors/${id}`)

      if (response.status === 404) {
        console.log('⚠️ Vendeur non trouvé dans API (404)')

        // 🔁 FALLBACK: Si 404, l'ID est peut-être un userId, chercher dans la liste locale
        if (vendors.value.length > 0) {
          const foundByUserId = vendors.value.find(v => String(v.userId) === String(id))
          if (foundByUserId) {
            console.log('✅ Vendeur trouvé par userId dans la liste locale:', foundByUserId)
            currentVendor.value = foundByUserId
            return foundByUserId
          }
        }

        // Si pas dans la liste locale, recharger tous les vendeurs
        await fetchVendors()
        const foundByUserId = vendors.value.find(v => String(v.userId) === String(id))
        if (foundByUserId) {
          console.log('✅ Vendeur trouvé par userId après rechargement:', foundByUserId)
          currentVendor.value = foundByUserId
          return foundByUserId
        }

        currentVendor.value = null
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        vendor = result.data.vendor
        console.log('✅ Vendeur trouvé via API:', vendor)

        // Mettre à jour le store local
        vendors.value.push(vendor)
        localStorage.setItem('vendors', JSON.stringify(vendors.value))
        currentVendor.value = vendor

        return vendor
      }
    } catch (err) {
      console.error('❌ Erreur getVendorById API:', err)

      // 3️⃣ Fallback: chercher encore dans vendors (au cas où)
      const localVendor = vendors.value.find(v => String(v.id) === String(id))
      if (localVendor) {
        console.log('✅ Vendeur trouvé dans store (fallback):', localVendor)
        currentVendor.value = localVendor
        return localVendor
      }

      // Fallback par userId
      const foundByUserId = vendors.value.find(v => String(v.userId) === String(id))
      if (foundByUserId) {
        console.log('✅ Vendeur trouvé par userId (fallback):', foundByUserId)
        currentVendor.value = foundByUserId
        return foundByUserId
      }
    } finally {
      loading.value = false
    }

    console.log('❌ Vendeur non trouvé avec ID:', id)
    currentVendor.value = null
    return null
  }

  // Créer un nouveau vendeur
  const createVendor = (vendorData) => {
    try {
      console.log('📝 Création vendeur dans store:', vendorData)

      const newVendor = {
        ...vendorData,
        id: String(vendorData.id),
        verified: vendorData.verified || false,
        productsCount: vendorData.productsCount || 0,
        followersCount: vendorData.followersCount || 0,
        rating: vendorData.rating || 0,
        createdAt: vendorData.createdAt || new Date().toISOString()
      }

      vendors.value.push(newVendor)
      localStorage.setItem('vendors', JSON.stringify(vendors.value))
      console.log('✅ Vendeur ajouté au store:', newVendor)
      return newVendor
    } catch (error) {
      console.error('❌ Erreur création vendeur:', error)
      return null
    }
  }

  // Mettre à jour un vendeur
  const updateVendor = (id, updates) => {
    try {
      const index = vendors.value.findIndex(v => String(v.id) === String(id))
      if (index === -1) return null

      vendors.value[index] = { ...vendors.value[index], ...updates }
      localStorage.setItem('vendors', JSON.stringify(vendors.value))

      if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
        currentVendor.value = vendors.value[index]
      }

      return vendors.value[index]
    } catch (error) {
      console.error('❌ Erreur mise à jour vendeur:', error)
      return null
    }
  }

  // Supprimer un vendeur
  const deleteVendor = (id) => {
    try {
      vendors.value = vendors.value.filter(v => String(v.id) !== String(id))
      localStorage.setItem('vendors', JSON.stringify(vendors.value))

      if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
        currentVendor.value = null
      }

      return true
    } catch (error) {
      console.error('❌ Erreur suppression vendeur:', error)
      return false
    }
  }

  // Initialiser: charger les vendeurs
  fetchVendors()

  return {
    vendors: computed(() => vendors.value),
    currentVendor: computed(() => currentVendor.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    fetchVendors,
    loadFromStorage
  }
})
