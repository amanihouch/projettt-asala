// frontend/src/stores/vendorStore.js - VERSION CORRIGÉE FINALE COMPLÈTE
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { DEFAULT_AVATAR, DEFAULT_COVER, formatAvatarUrl, formatCoverUrl, isValidImageValue } from '../utils/image.js'

export const useVendorStore = defineStore('vendor', () => {
  // ===== STATE =====
  const vendors = ref([])
  const currentVendor = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const totalCount = ref(0)

  // ===== COMPUTED =====
  const hasVendors = computed(() => vendors.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const getCurrentVendor = computed(() => currentVendor.value)
  const hasCurrentVendor = computed(() => currentVendor.value !== null)
  const verifiedVendors = computed(() => vendors.value.filter(v => v.approved === 1))
  const pendingVendors = computed(() => vendors.value.filter(v => v.approved === 0 || v.approved === false || v.approved === null))
  const rejectedVendors = computed(() => vendors.value.filter(v => v.approved === 2))

  // ===== UTILITAIRES =====
  const getFirstValidImage = (...sources) => {
    for (const source of sources) {
      if (isValidImageValue(source)) return source
    }
    return null
  }

  const formatVendorImages = (vendor) => {
    if (!vendor) return null
    const formatted = { ...vendor }
    const avatarSource = getFirstValidImage(
      vendor.userAvatar, vendor.avatar, vendor.avatar_url, vendor.user_avatar,
      vendor.profileImage, vendor.profile_image, vendor.image, vendor.logo
    )
    const formattedAvatar = formatAvatarUrl(avatarSource, DEFAULT_AVATAR)
    formatted.avatar = formattedAvatar || DEFAULT_AVATAR
    formatted.userAvatar = formattedAvatar || DEFAULT_AVATAR
    const coverSource = getFirstValidImage(
      vendor.coverImage, vendor.cover_image, vendor.cover, vendor.banner,
      vendor.shopCover, vendor.shop_cover, vendor.headerImage, vendor.header_image, vendor.background
    )
    formatted.coverImage = formatCoverUrl(coverSource, DEFAULT_COVER) || DEFAULT_COVER
    formatted.id = formatted.id || vendor.id
    formatted.userId = formatted.userId || vendor.userId || vendor.user_id
    formatted.shopName = formatted.shopName || vendor.shopName || vendor.shop_name || vendor.name || 'حرفي'
    formatted.name = formatted.name || vendor.name || vendor.userName || vendor.user_name || formatted.shopName
    formatted.description = formatted.description || vendor.description || vendor.bio || ''
    formatted.approved = formatted.approved ?? vendor.approved ?? 0
    formatted.verified = formatted.verified ?? vendor.verified ?? false
    formatted.followersCount = formatted.followersCount ?? vendor.followersCount ?? vendor.followers_count ?? 0
    formatted.followingCount = formatted.followingCount ?? vendor.followingCount ?? vendor.following_count ?? 0
    return formatted
  }

  // ===== STATISTIQUES =====
  const fetchVendorStats = async () => {
    try {
      const response = await api.get('/admin/vendors/stats')
      if (response.data.success) return response.data.data
      return { pending: 0, approved: 0, total: 0, rejected: 0, verified: 0 }
    } catch (error) {
      console.error('❌ Erreur fetchVendorStats:', error)
      return { pending: 0, approved: 0, total: 0, rejected: 0, verified: 0 }
    }
  }

  // ===== MÉTHODES API =====
  const fetchAllVendors = async () => {
    loading.value = true; error.value = null
    try {
      const response = await api.get('/admin/vendors')
      if (response.data.success) {
        let vendorsData = response.data.data?.data || response.data.data || []
        if (!Array.isArray(vendorsData)) vendorsData = []
        vendors.value = vendorsData.map(v => formatVendorImages(v))
        totalCount.value = vendors.value.length
        return vendors.value
      }
      return []
    } catch (err) {
      console.error('❌ Erreur chargement vendeurs:', err)
      error.value = err.response?.data?.message || err.message
      return []
    } finally { loading.value = false }
  }

  const fetchPendingVendors = async () => {
    loading.value = true
    try {
      const response = await api.get('/admin/vendors/pending')
      if (response.data.success) {
        let pending = response.data.data?.data || response.data.data || []
        if (!Array.isArray(pending)) pending = []
        return pending.map(v => formatVendorImages(v))
      }
      return []
    } catch (error) { console.error('❌ Erreur chargement vendeurs en attente:', error); return [] }
    finally { loading.value = false }
  }

  const fetchVendorById = async (id) => {
    if (!id) return null
    loading.value = true; error.value = null
    try {
      const numericId = parseInt(id)
      if (isNaN(numericId)) return null
      const response = await api.get(`/vendors/${numericId}`)
      if (response.data.success) {
        let vendor = response.data.data?.vendor || response.data.data
        // Si la réponse a une structure data.data (liste)
        if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          vendor = response.data.data.data[0]
        }
        if (vendor) {
          vendor = formatVendorImages(vendor)
          currentVendor.value = vendor
          const existingIndex = vendors.value.findIndex(v => String(v.id) === String(vendor.id))
          if (existingIndex === -1) vendors.value.push(vendor)
          else vendors.value[existingIndex] = vendor
          return vendor
        }
      }
      return null
    } catch (error) {
      console.error('❌ Erreur fetchVendorById:', error)
      error.value = error.response?.data?.message || error.message
      return null
    } finally { loading.value = false }
  }

  const fetchVendorBySlug = async (slug) => {
    if (!slug) return null
    loading.value = true; error.value = null
    try {
      const response = await api.get(`/vendors/slug/${encodeURIComponent(slug)}`)
      if (response.data.success) {
        let vendor = response.data.data?.vendor || response.data.data
        if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          vendor = response.data.data.data[0]
        }
        if (vendor) {
          vendor = formatVendorImages(vendor)
          currentVendor.value = vendor
          const existingIndex = vendors.value.findIndex(v => String(v.id) === String(vendor.id))
          if (existingIndex === -1) vendors.value.push(vendor)
          else vendors.value[existingIndex] = vendor
          return vendor
        }
      }
      return null
    } catch (error) {
      console.error('❌ Erreur fetchVendorBySlug:', error)
      error.value = error.response?.data?.message || error.message
      return null
    } finally { loading.value = false }
  }

  const fetchVendorByUserId = async (userId) => {
    if (!userId) return null
    loading.value = true
    try {
      const response = await api.get(`/vendors/user/${userId}`)
      if (response.data.success) {
        const vendor = response.data.data?.vendor || response.data.data
        if (vendor) {
          const formattedVendor = formatVendorImages(vendor)
          currentVendor.value = formattedVendor
          const existingIndex = vendors.value.findIndex(v => String(v.userId) === String(userId))
          if (existingIndex === -1) vendors.value.push(formattedVendor)
          else vendors.value[existingIndex] = formattedVendor
          return formattedVendor
        }
      }
      return null
    } catch (error) {
      if (error.response?.status === 404) { console.log(`ℹ️ L'utilisateur ${userId} n'est pas un vendeur`); return null }
      console.error('❌ Erreur fetchVendorByUserId:', error)
      return null
    } finally { loading.value = false }
  }

  const createVendor = async (vendorData) => {
    loading.value = true; error.value = null
    try {
      const response = await api.post('/vendors', vendorData)
      if (response.data.success) {
        const newVendor = response.data.data?.vendor || response.data.data
        const formattedVendor = formatVendorImages(newVendor)
        vendors.value.unshift(formattedVendor)
        currentVendor.value = formattedVendor
        return formattedVendor
      }
      throw new Error(response.data.message || 'Erreur création')
    } catch (error) {
      console.error('❌ Erreur createVendor:', error)
      error.value = error.response?.data?.message || error.message
      return null
    } finally { loading.value = false }
  }

  const updateVendor = async (id, updates) => {
    loading.value = true; error.value = null
    try {
      const response = await api.patch(`/vendors/${id}`, updates)
      if (response.data.success) {
        const updatedVendor = response.data.data?.vendor || response.data.data
        const formattedVendor = formatVendorImages(updatedVendor)
        const index = vendors.value.findIndex(v => String(v.id) === String(id))
        if (index !== -1) vendors.value[index] = { ...vendors.value[index], ...formattedVendor }
        if (currentVendor.value && String(currentVendor.value.id) === String(id)) {
          currentVendor.value = { ...currentVendor.value, ...formattedVendor }
        }
        return formattedVendor
      }
      throw new Error(response.data.message || 'Erreur mise à jour')
    } catch (error) {
      console.error('❌ Erreur updateVendor:', error)
      error.value = error.response?.data?.message || error.message
      return null
    } finally { loading.value = false }
  }

  const approveVendor = async (id) => {
    loading.value = true
    try {
      const response = await api.patch(`/admin/vendors/${id}/approve`)
      if (response.data.success) {
        const index = vendors.value.findIndex(v => String(v.id) === String(id))
        if (index !== -1) vendors.value[index].approved = 1
        if (currentVendor.value && String(currentVendor.value.id) === String(id)) currentVendor.value.approved = 1
        return true
      }
      return false
    } catch (error) { console.error('❌ Erreur approveVendor:', error); return false }
    finally { loading.value = false }
  }

  const rejectVendor = async (id, reason) => {
    loading.value = true
    try {
      const response = await api.patch(`/admin/vendors/${id}/reject`, { reason })
      if (response.data.success) {
        const index = vendors.value.findIndex(v => String(v.id) === String(id))
        if (index !== -1) vendors.value[index].approved = 2
        if (currentVendor.value && String(currentVendor.value.id) === String(id)) currentVendor.value.approved = 2
        return true
      }
      return false
    } catch (error) { console.error('❌ Erreur rejectVendor:', error); return false }
    finally { loading.value = false }
  }

  const deleteVendor = async (id) => {
    loading.value = true; error.value = null
    try {
      const response = await api.delete(`/vendors/${id}`)
      if (response.data.success) {
        vendors.value = vendors.value.filter(v => String(v.id) !== String(id))
        if (currentVendor.value && String(currentVendor.value.id) === String(id)) currentVendor.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Erreur deleteVendor:', error)
      error.value = error.response?.data?.message || error.message
      return false
    } finally { loading.value = false }
  }

  const toggleFollow = async (vendorId) => {
    try {
      const response = await api.post(`/vendors/${vendorId}/follow`)
      if (response.data.success) {
        const data = response.data.data
        const index = vendors.value.findIndex(v => String(v.id) === String(vendorId))
        if (index !== -1) { vendors.value[index].followersCount = data.followersCount; vendors.value[index].isFollowing = data.following }
        if (currentVendor.value && String(currentVendor.value.id) === String(vendorId)) {
          currentVendor.value.followersCount = data.followersCount
          currentVendor.value.isFollowing = data.following
        }
        return data
      }
      return null
    } catch (error) { console.error('❌ Erreur toggleFollow:', error); return null }
  }

  const fetchVendorProducts = async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/products`)
      if (response.data.success) return response.data.data?.products || response.data.data || []
      return []
    } catch (error) { console.error('❌ Erreur fetchVendorProducts:', error); return [] }
  }

  const fetchVendorPosts = async (vendorId) => {
    try {
      const response = await api.get(`/posts/vendor/${vendorId}`)
      if (response.data.success) return response.data.data?.posts || response.data.data || []
      return []
    } catch (error) { console.error('❌ Erreur fetchVendorPosts:', error); return [] }
  }

  const fetchTopVendors = async (limit = 5) => {
    try {
      const response = await api.get('/vendors/top', { params: { limit } })
      if (response.data.success) {
        let vendorsList = response.data.data?.vendors || response.data.data || []
        if (Array.isArray(vendorsList)) vendorsList = vendorsList.map(v => formatVendorImages(v))
        return vendorsList
      }
      return []
    } catch (error) { console.error('❌ Erreur fetchTopVendors:', error); return [] }
  }

  const fetchPublicVendors = async (params = {}) => {
    loading.value = true; error.value = null
    try {
      const response = await api.get('/vendors', { params })
      if (response.data.success) {
        let vendorsData = response.data.data?.data || response.data.data || []
        if (!Array.isArray(vendorsData)) vendorsData = []
        vendors.value = vendorsData.map(v => formatVendorImages(v))
        totalCount.value = vendors.value.length
        return vendors.value
      }
      return []
    } catch (err) {
      console.error('❌ Erreur chargement vendeurs publics:', err)
      error.value = err.response?.data?.message || err.message
      return []
    } finally { loading.value = false }
  }

  const clearStore = () => {
    vendors.value = []
    currentVendor.value = null
    error.value = null
    loading.value = false
    totalCount.value = 0
    currentPage.value = 1
    totalPages.value = 1
  }

  const init = async () => {
    if (vendors.value.length === 0) await fetchPublicVendors()
  }

  // ===== RETURN =====
  return {
    vendors, currentVendor, loading, error, totalPages, currentPage, totalCount,
    hasVendors, isLoading, hasError, getCurrentVendor, hasCurrentVendor,
    verifiedVendors, pendingVendors, rejectedVendors,
    fetchAllVendors, fetchPendingVendors, fetchVendorStats,
    fetchVendorById, fetchVendorBySlug, fetchVendorByUserId,
    fetchPublicVendors, createVendor, updateVendor,
    approveVendor, rejectVendor, deleteVendor, toggleFollow,
    fetchVendorProducts, fetchVendorPosts, fetchTopVendors,
    clearStore, init, formatVendorImages
  }
})
