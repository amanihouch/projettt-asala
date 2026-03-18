// frontend/src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // ===== STATE =====
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const vendorId = ref(localStorage.getItem('vendorId') || null)
  const loading = ref(false)
  const error = ref(null)

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userId = computed(() => user.value?.id || null)
  const userName = computed(() => user.value?.name || '')
  const userFullName = computed(() => user.value?.name || '')
  const userInitials = computed(() => {
    const name = user.value?.name || ''
    return name ? name.charAt(0).toUpperCase() : 'U'
  })
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => {
    // Retourner l'avatar de l'utilisateur ou une image par défaut
    return user.value?.avatar || 'https://i.pravatar.cc/300?u=' + (user.value?.id || 'default')
  })
  const userPhone = computed(() => user.value?.phone || '')
  const userAddress = computed(() => user.value?.address || '')
  const userCreatedAt = computed(() => user.value?.createdAt || new Date().toISOString())
  const isVendor = computed(() => user.value?.role === 'vendor' || !!vendorId.value)

  // ===== MÉTHODES PRIVÉES =====
  const saveToStorage = () => {
    if (token.value) {
      localStorage.setItem('token', token.value)
    } else {
      localStorage.removeItem('token')
    }

    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('user')
    }

    if (vendorId.value) {
      localStorage.setItem('vendorId', vendorId.value)
    } else {
      localStorage.removeItem('vendorId')
    }
  }

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Définir le token manuellement
   */
  const setToken = (newToken) => {
    token.value = newToken
    saveToStorage()
    console.log('🔑 Token défini:', newToken ? 'présent' : 'null')
  }

  /**
   * Définir l'utilisateur manuellement
   */
  const setUser = (newUser) => {
    user.value = newUser
    saveToStorage()
    console.log('👤 Utilisateur défini:', newUser)
  }

  /**
   * Définir l'ID du vendeur manuellement
   */
  const setVendorId = (id) => {
    vendorId.value = id
    saveToStorage()
    console.log('🏪 Vendor ID défini:', id)
  }

  /**
   * Connexion utilisateur
   */
  const login = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Tentative de connexion:', email)

      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password
      })

      console.log('📦 Réponse login:', response.data)

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data

        token.value = newToken
        user.value = userData

        // Récupérer l'ID du vendeur si nécessaire
        if (userData?.role === 'vendor') {
          await fetchVendorId()
        }

        saveToStorage()
        console.log('✅ Connexion réussie pour:', userData.email)

        return { success: true, user: user.value }
      } else {
        throw new Error(response.data.message || 'Erreur de connexion')
      }
    } catch (err) {
      console.error('❌ Erreur login:', err)
      const message = err.response?.data?.message || err.message || 'Erreur de connexion'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription client
   */
  const registerCustomer = async (userData) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Inscription client:', userData.email)

      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        phone: userData.phone || '',
        address: userData.address || '',
        avatar: userData.avatar || null,
        role: 'customer'
      })

      console.log('📦 Réponse inscription:', response.data)

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data

        token.value = newToken
        user.value = userData
        vendorId.value = null

        saveToStorage()
        console.log('✅ Inscription réussie pour:', userData.email)

        return { success: true, user: user.value }
      } else {
        throw new Error(response.data.message || "Erreur d'inscription")
      }
    } catch (err) {
      console.error('❌ Erreur register:', err)
      let message = "Erreur lors de l'inscription"
      if (err.response?.data?.message) {
        message = err.response.data.message
      } else if (err.message) {
        message = err.message
      }
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription vendeur
   */
  const registerVendor = async (vendorData) => {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Inscription vendeur:', vendorData.email)

      // 1. Créer le compte utilisateur
      const registerResponse = await api.post('/auth/register', {
        name: vendorData.fullName,
        email: vendorData.email.toLowerCase().trim(),
        password: vendorData.password,
        phone: vendorData.phone,
        address: vendorData.address,
        avatar: vendorData.avatar,
        role: 'vendor'
      })

      console.log('📦 Réponse register:', registerResponse.data)

      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.message || "Erreur d'inscription")
      }

      const { token: newToken, user: userData } = registerResponse.data

      token.value = newToken
      user.value = userData

      // 2. Créer le profil vendeur
      const vendorProfileData = {
        userId: user.value.id,
        shopName: vendorData.shopName,
        specialty: vendorData.specialty,
        description: vendorData.description,
        location: vendorData.location || 'تونس',
        coverImage: vendorData.coverImage,
        experience: vendorData.experience || 0,
      }

      const vendorResponse = await api.post('/vendors', vendorProfileData, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      console.log('📦 Réponse vendeur:', vendorResponse.data)

      if (!vendorResponse.data.success) {
        throw new Error(vendorResponse.data.message || 'Erreur création vendeur')
      }

      // 3. Extraire et sauvegarder l'ID du vendeur
      const vendorResult = vendorResponse.data.data || vendorResponse.data
      let newVendorId = null

      if (vendorResult.vendor?.id) newVendorId = vendorResult.vendor.id
      else if (vendorResult.id) newVendorId = vendorResult.id

      if (newVendorId) {
        vendorId.value = newVendorId
      }

      saveToStorage()
      console.log('✅ Inscription vendeur réussie pour:', userData.email)
      console.log('🏪 Vendor ID:', vendorId.value)

      return {
        success: true,
        user: user.value,
        vendorId: vendorId.value
      }

    } catch (err) {
      console.error('❌ Erreur registerVendor:', err)
      const message = err.response?.data?.message || err.message || "Erreur lors de l'inscription"
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer l'ID du vendeur
   */
  const fetchVendorId = async () => {
    if (!token.value || !user.value) return null

    try {
      const response = await api.get(`/vendors/user/${user.value.id}`)

      if (response.data.success) {
        // Gérer les différentes structures de réponse
        const vendor = response.data.data?.vendor || response.data.vendor

        if (vendor && vendor.id) {
          vendorId.value = vendor.id
          saveToStorage()
          console.log('✅ Vendor ID récupéré:', vendor.id)
          return vendor.id
        }
      }
      return null
    } catch (err) {
      // Si 404, c'est normal (l'utilisateur n'est pas vendeur)
      if (err.response?.status === 404) {
        console.log('ℹ️ Utilisateur non vendeur')
        return null
      }
      console.error('❌ Erreur fetchVendorId:', err)
      return null
    }
  }

  /**
   * Récupérer le profil utilisateur
   */
  const fetchProfile = async () => {
    if (!token.value) return null

    loading.value = true

    try {
      const response = await api.get('/auth/me')

      if (response.data.success) {
        user.value = response.data.user

        if (response.data.user?.role === 'vendor') {
          await fetchVendorId()
        }

        saveToStorage()
        return user.value
      }

      return null
    } catch (err) {
      console.error('❌ Erreur fetchProfile:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour le profil
   */
  const updateProfile = async (updates) => {
    if (!token.value) return { success: false, error: 'Non authentifié' }

    loading.value = true

    try {
      const response = await api.patch('/users/profile', updates)

      if (response.data.success) {
        user.value = { ...user.value, ...response.data.user }
        saveToStorage()
        return { success: true, user: user.value }
      }

      return { success: false, error: response.data.message }
    } catch (err) {
      console.error('❌ Erreur updateProfile:', err)
      const message = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour l'avatar
   */
  const updateAvatar = async (formData) => {
    if (!token.value) return { success: false, error: 'Non authentifié' }

    loading.value = true

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('📦 Réponse upload avatar:', response.data)

      if (response.data.success) {
        // Mettre à jour l'utilisateur avec le nouvel avatar
        user.value = {
          ...user.value,
          avatar: response.data.avatar || response.data.user?.avatar
        }
        saveToStorage()
        return { success: true, user: user.value }
      }

      return { success: false, error: response.data.message }
    } catch (err) {
      console.error('❌ Erreur updateAvatar:', err)

      // Mode démo - Simuler un upload réussi
      if (err.code === 'ERR_NETWORK') {
        console.log('🎭 Mode démo: Simulation upload avatar')

        // Simuler un nouvel avatar (image data URL)
        const reader = new FileReader()
        const file = formData.get('avatar')

        return new Promise((resolve) => {
          reader.onload = (e) => {
            const avatarUrl = e.target.result
            user.value = {
              ...user.value,
              avatar: avatarUrl
            }
            saveToStorage()
            loading.value = false
            resolve({ success: true, user: user.value })
          }
          reader.readAsDataURL(file)
        })
      }

      const message = err.response?.data?.message || err.message || "Erreur lors de l'upload"
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion
   */
  const logout = () => {
    token.value = null
    user.value = null
    vendorId.value = null
    saveToStorage()
    console.log('👋 Déconnexion réussie')
  }

  /**
   * Vérifier si l'utilisateur est un vendeur
   */
  const checkVendorStatus = async () => {
    if (!token.value || !user.value) return false
    if (vendorId.value) return true
    const id = await fetchVendorId()
    return !!id
  }

  return {
    // State
    token,
    user,
    vendorId,
    loading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    userId,
    userName,
    userFullName,
    userInitials,
    userEmail,
    userAvatar,
    userPhone,
    userAddress,
    userCreatedAt,
    isVendor,

    // Actions
    setToken,
    setUser,
    setVendorId,
    login,
    registerCustomer,
    registerVendor,
    logout,
    fetchProfile,
    updateProfile,
    updateAvatar,
    fetchVendorId,
    checkVendorStatus,
  }
})
