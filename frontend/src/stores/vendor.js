import api from '../services/api'\r\n// frontend/src/stores/vendor.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVendorStore = defineStore('vendor', () => {
  const vendors = ref([])
  const currentVendor = ref(null)
  const loading = ref(false)

  // ===== CRÉER UN VENDEUR =====
  const createVendor = (vendorData) => {
    try {
      console.log('📝 Création vendeur dans backend:', vendorData)

      // Récupérer la liste existante
      const vendorsList = JSON.parse(localStorage.getItem('vendors') || '[]')

      // Ajouter le nouveau vendeur
      vendorsList.push(vendorData)

      // Sauvegarder dans localStorage
      localStorage.setItem('vendors', JSON.stringify(vendorsList))

      // Mettre à jour la liste locale
      vendors.value = vendorsList

      console.log('✅ Vendeur créé dans localStorage')
      return vendorData
    } catch (error) {
      console.error('Error creating vendor:', error)
      throw error
    }
  }

  // ===== RÉCUPÉRER UN VENDEUR PAR ID =====
  const getVendorById = (id) => {
    console.log('🔍 Recherche vendeur avec ID:', id)
    const vendorsList = JSON.parse(localStorage.getItem('vendors') || '[]')
    const vendor = vendorsList.find((v) => v.id == id) // Note: == au lieu de === pour comparer string/number
    console.log('✅ Vendeur trouvé:', vendor ? 'Oui' : 'Non')
    return vendor || null
  }

  // ===== CHARGER LES VENDEURS =====
  const loadVendors = () => {
    vendors.value = JSON.parse(localStorage.getItem('vendors') || '[]')
    console.log('✅ Vendors chargés:', vendors.value.length)
  }

  // Initialisation
  loadVendors()

  return {
    vendors,
    currentVendor,
    loading,
    createVendor,
    getVendorById,
    loadVendors,
  }
})

