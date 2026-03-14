import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userAvatar: (state) => state.user?.avatar || 'https://i.pravatar.cc/300',
    userId: (state) => state.user?.id || null,
    userPhone: (state) => state.user?.phone || '',
    userAddress: (state) => state.user?.address || '',
    userCreatedAt: (state) => state.user?.createdAt || null,
  },

  actions: {
    // ✅ Méthodes pour définir directement l'utilisateur et le token
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    async fetchProfile() {
      try {
        const response = await api.get('/auth/me')
        const user = response.data.user
        this.setUser(user)
        return user
      } catch (error) {
        if (error.response?.status === 401) this.logout()
        return null
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/login', {
          email: email.toLowerCase().trim(),
          password,
        })

        const { token, user } = response.data

        this.setToken(token)
        this.setUser(user)

        await this.fetchProfile()

        return { success: true }
      } catch (error) {
        let message = 'Erreur de connexion'
        if (error.response) {
          message = error.response.data?.message || 'Email ou mot de passe incorrect'
        } else if (error.request) {
          message = 'Serveur non accessible'
        }
        this.error = message
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    async registerCustomer(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/register', {
          name: userData.name,
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          phone: userData.phone || '',
          role: 'customer',
        })

        const { token, user } = response.data

        this.setToken(token)
        this.setUser(user)

        await this.fetchProfile()
        return { success: true }
      } catch (error) {
        let message = "Erreur lors de l'inscription"
        if (error.response) {
          if (error.response.status === 400) message = 'Cet email est déjà utilisé'
          else message = error.response.data?.message || message
        }
        this.error = message
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      try {
        const response = await api.put('/users/profile', profileData)
        const updatedUser = response.data.data.user
        this.setUser(updatedUser)
        return { success: true }
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    async updateAvatar(formData) {
      this.loading = true
      try {
        const response = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const updatedUser = response.data.data.user
        this.setUser(updatedUser)
        return { success: true, user: updatedUser }
      } catch (error) {
        let message = error.response?.data?.message || "Erreur lors de l'upload"
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.user = null
      this.token = null
    },

    async initAuth() {
      if (this.token && !this.user) {
        await this.fetchProfile()
      }
    },
  },
})
