// frontend/src/stores/auth.js - VERSION CORRIGÉE FINALE COMPLÈTE
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { formatImageUrl, DEFAULT_AVATAR } from '../utils/image.js'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // ===== STATE =====
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const vendorId = ref(localStorage.getItem('vendorId') || null)
  const loading = ref(false)
  const error = ref(null)

  // ===== INITIALISER LE HEADER AUTHORIZATION =====
  const initAuthHeader = () => {
    if (token.value && api && api.defaults) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      console.log('✅ Header Authorization initialisé')
    }
  }
  initAuthHeader()

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'customer')
  const userId = computed(() => user.value?.id || null)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhone = computed(() => user.value?.phone || '')
  const userAddress = computed(() => user.value?.address || '')
  const isVendor = computed(() => user.value?.role === 'vendor' || !!vendorId.value)
  const isPending = computed(() => user.value?.role === 'pending')

  const userAvatar = computed(() => {
    if (!user.value?.avatar) return DEFAULT_AVATAR
    const formatted = formatImageUrl(user.value.avatar)
    return formatted || DEFAULT_AVATAR
  })

  const userInitials = computed(() => {
    const name = user.value?.name || ''
    return name ? name.charAt(0).toUpperCase() : 'U'
  })

  const userFullName = computed(() => user.value?.name || '')

  const userCreatedAt = computed(() => user.value?.createdAt || null)

  // ===== MÉTHODES PRIVÉES =====
  const saveToStorage = () => {
    if (token.value) localStorage.setItem('token', token.value)
    else localStorage.removeItem('token')

    if (user.value) localStorage.setItem('user', JSON.stringify(user.value))
    else localStorage.removeItem('user')

    if (vendorId.value) localStorage.setItem('vendorId', vendorId.value)
    else localStorage.removeItem('vendorId')
  }

  // ===== MÉTHODES PUBLIQUES =====
  const setAuth = (newToken, userData) => {
    token.value = newToken
    user.value = userData
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      if (api && api.defaults) {
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      }
    } else {
      localStorage.removeItem('token')
      if (api && api.defaults) {
        delete api.defaults.headers.common['Authorization']
      }
    }
  }

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const setVendorId = (id) => {
    vendorId.value = id
    if (id) {
      localStorage.setItem('vendorId', id)
    } else {
      localStorage.removeItem('vendorId')
    }
  }

  // ===== LOGIN =====
  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', { email, password })

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data
        setAuth(newToken, userData)

        // Si c'est un vendeur, récupérer son vendorId
        if (userData.role === 'vendor') {
          try {
            const vendorResponse = await api.get(`/vendors/user/${userData.id}`)
            if (vendorResponse.data.success) {
              const vendor = vendorResponse.data.data?.vendor || vendorResponse.data.data
              if (vendor?.id) {
                setVendorId(vendor.id)
              }
            }
          } catch (err) {
            console.log('⚠️ Aucun vendeur trouvé pour cet utilisateur')
          }
        }

        return { success: true, user: userData }
      }

      return { success: false, error: response.data.message || 'فشل تسجيل الدخول' }
    } catch (err) {
      console.error('❌ Erreur login:', err)
      error.value = err.response?.data?.message || 'حدث خطأ غير متوقع'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        setAuth(response.data.token, response.data.user)
        return { success: true, user: response.data.user }
      }
      return { success: false, error: response.data.message }
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur d'inscription"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const registerCustomer = async (userData) => {
    loading.value = true
    error.value = null
    try {
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
        setAuth(response.data.token, response.data.user)
        return { success: true, user: response.data.user }
      }
      return { success: false, error: response.data.message }
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur d'inscription"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const registerVendor = async (vendorData) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('fullName', vendorData.fullName)
      formData.append('email', vendorData.email.toLowerCase().trim())
      formData.append('phone', vendorData.phone)
      formData.append('address', vendorData.address)
      formData.append('password', vendorData.password)
      formData.append('shopName', vendorData.shopName)
      formData.append('specialty', vendorData.specialty)
      formData.append('description', vendorData.description)
      formData.append('location', vendorData.location || 'تونس')
      formData.append('experience', vendorData.experience || 0)

      if (vendorData.avatar) {
        formData.append('avatar', vendorData.avatar)
      }
      if (vendorData.coverImage) {
        formData.append('coverImage', vendorData.coverImage)
      }

      const response = await api.post('/auth/register-vendor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        const { token: newToken, user: userData, data } = response.data

        token.value = newToken
        localStorage.setItem('token', newToken)
        if (api && api.defaults) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        }

        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))

        if (data?.vendorId) {
          setVendorId(data.vendorId)
        }

        return {
          success: true,
          user: userData,
          vendorId: data?.vendorId,
          pending: true
        }
      }

      return { success: false, error: response.data.message }

    } catch (err) {
      console.error('❌ Erreur registerVendor:', err)
      error.value = err.response?.data?.message || err.message || "Erreur lors de l'inscription"
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    vendorId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('vendorId')
    if (api && api.defaults) {
      delete api.defaults.headers.common['Authorization']
    }
    console.log('👋 Déconnexion réussie')
  }

  const updateProfile = async (updates) => {
    loading.value = true
    try {
      const response = await api.put('/user/profile', updates)
      if (response.data.success) {
        user.value = { ...user.value, ...response.data.user }
        saveToStorage()
        return { success: true, user: user.value }
      }
      return { success: false, error: response.data.message }
    } catch (err) {
      return { success: false, error: err.response?.data?.message }
    } finally {
      loading.value = false
    }
  }

  const updateAvatar = async (avatarData) => {
    loading.value = true
    try {
      let formData = new FormData()
      let blob

      if (avatarData instanceof File) {
        formData.append('avatar', avatarData)
      } else if (typeof avatarData === 'string' && avatarData.startsWith('data:image')) {
        blob = await fetch(avatarData).then(r => r.blob())
        formData.append('avatar', blob, 'avatar.jpg')
      } else {
        throw new Error('Format de fichier invalide')
      }

      const response = await api.patch('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        const newAvatar = response.data.avatar || response.data.user?.avatar
        if (newAvatar) {
          user.value = { ...user.value, avatar: newAvatar }
          saveToStorage()
        }
        return { success: true, avatar: newAvatar }
      }

      // Fallback local
      if (typeof avatarData === 'string' && avatarData.startsWith('data:image')) {
        user.value = { ...user.value, avatar: avatarData }
        saveToStorage()
        return { success: true, avatar: avatarData, local: true }
      }

      return { success: false, error: response.data.message }
    } catch (err) {
      console.error('❌ Erreur updateAvatar:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    loading.value = true
    try {
      const response = await api.patch('/user/change-password', { currentPassword, newPassword })
      return { success: response.data.success, message: response.data.message }
    } catch (err) {
      return { success: false, error: err.response?.data?.message }
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    loading.value = true
    try {
      const response = await api.get('/user/profile')
      if (response.data.success) {
        user.value = response.data.user
        saveToStorage()
      }
    } catch (err) {
      console.error('Erreur fetchUser:', err)
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  const fetchVendorId = async () => {
    if (!token.value || !user.value) return null
    try {
      const response = await api.get(`/vendors/user/${user.value.id}`)
      if (response.data.success) {
        const vendor = response.data.data?.vendor || response.data.data
        if (vendor?.id) {
          setVendorId(vendor.id)
          return vendor.id
        }
      }
      return null
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('❌ Erreur fetchVendorId:', err)
      }
      return null
    }
  }

  const checkVendorStatus = async () => {
    if (!token.value || !user.value) return false
    if (vendorId.value) return true
    const id = await fetchVendorId()
    return !!id
  }

  // Initialisation
  if (token.value && !user.value) {
    fetchUser()
  }

  return {
    // State
    token,
    user,
    vendorId,
    loading,
    error,
    // Computed
    isAuthenticated,
    userRole,
    userId,
    userName,
    userFullName,
    userInitials,
    userEmail,
    userPhone,
    userAddress,
    userAvatar,
    userCreatedAt,
    isVendor,
    isPending,
    // Actions
    setAuth,
    setToken,
    setUser,
    setVendorId,
    login,
    register,
    registerCustomer,
    registerVendor,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    fetchUser,
    fetchVendorId,
    checkVendorStatus,
    initAuthHeader,
    saveToStorage
  }
})
