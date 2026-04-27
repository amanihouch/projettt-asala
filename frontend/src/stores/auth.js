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
    if (!user.value?.avatar) {
      return 'https://i.pravatar.cc/300?u=' + (user.value?.id || 'default')
    }

    // Si c'est déjà une URL complète
    if (user.value.avatar.startsWith('http')) {
      return user.value.avatar
    }

    // Si c'est une data URL (base64)
    if (user.value.avatar.startsWith('data:image')) {
      return user.value.avatar
    }

    // Si c'est un chemin relatif (/uploads/...)
    if (user.value.avatar.startsWith('/uploads')) {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      return `${baseURL}${user.value.avatar}`
    }

    return user.value.avatar
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
   * Mettre à jour le téléphone de l'utilisateur
   */
  const updatePhone = (newPhone) => {
    if (user.value) {
      user.value.phone = newPhone
      saveToStorage()
      console.log('📱 Téléphone mis à jour:', newPhone)
      return true
    }
    return false
  }

  /**
   * Mettre à jour l'utilisateur avec les données du backend
   */
  const updateUser = (userData) => {
    if (user.value && userData) {
      user.value = { ...user.value, ...userData }
      saveToStorage()
      console.log('👤 Utilisateur mis à jour:', userData)
      return true
    }
    return false
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

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data

        token.value = newToken
        user.value = userData

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

      const registerResponse = await api.post('/auth/register', {
        name: vendorData.fullName,
        email: vendorData.email.toLowerCase().trim(),
        password: vendorData.password,
        phone: vendorData.phone,
        address: vendorData.address,
        avatar: vendorData.avatar,
        role: 'vendor'
      })

      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.message || "Erreur d'inscription")
      }

      const { token: newToken, user: userData } = registerResponse.data

      token.value = newToken
      user.value = userData

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
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (!vendorResponse.data.success) {
        throw new Error(vendorResponse.data.message || 'Erreur création vendeur')
      }

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
   * Mettre à jour l'avatar - VERSION FINALE CORRIGÉE
   */
  const updateAvatar = async (avatarInput) => {
    if (!token.value) return { success: false, error: 'Non authentifié' }

    loading.value = true

    try {
      let response
      const formData = new FormData()

      // Cas 1: C'est un File
      if (avatarInput instanceof File) {
        formData.append('avatar', avatarInput)
        response = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      // Cas 2: C'est un objet avec propriété avatar
      else if (avatarInput && typeof avatarInput === 'object' && avatarInput.avatar) {
        const base64Data = avatarInput.avatar

        if (typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
          const fetchResponse = await fetch(base64Data)
          const blob = await fetchResponse.blob()
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

          formData.append('avatar', file)
          response = await api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          throw new Error("Format d'image invalide")
        }
      }
      // Cas 3: C'est une string base64
      else if (typeof avatarInput === 'string' && avatarInput.startsWith('data:image')) {
        const fetchResponse = await fetch(avatarInput)
        const blob = await fetchResponse.blob()
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

        formData.append('avatar', file)
        response = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      else {
        throw new Error('Format de fichier invalide')
      }

      console.log('📦 Réponse upload avatar:', response.data)

      if (response.data.success) {
        // Construire l'URL complète de l'avatar
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const avatarUrl = response.data.avatar
          ? `${baseURL}${response.data.avatar}`
          : response.data.user?.avatar

        user.value = {
          ...user.value,
          ...response.data.user,
          avatar: avatarUrl
        }
        saveToStorage()
        return { success: true, user: user.value }
      }

      return { success: false, error: response.data.message }

    } catch (err) {
      console.error('❌ Erreur updateAvatar:', err)

      // Mode démo
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        console.log('🎭 Mode démo: Simulation upload avatar')

        let avatarUrl
        if (avatarInput instanceof File) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              user.value = { ...user.value, avatar: e.target.result }
              saveToStorage()
              loading.value = false
              resolve({ success: true, user: user.value })
            }
            reader.readAsDataURL(avatarInput)
          })
        } else if (typeof avatarInput === 'string') {
          avatarUrl = avatarInput
        } else if (avatarInput?.avatar) {
          avatarUrl = avatarInput.avatar
        }

        if (avatarUrl) {
          user.value = { ...user.value, avatar: avatarUrl }
          saveToStorage()
          return { success: true, user: user.value }
        }
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
    token,
    user,
    vendorId,
    loading,
    error,
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
    setToken,
    setUser,
    setVendorId,
    updatePhone,
    updateUser,
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
