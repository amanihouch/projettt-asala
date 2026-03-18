// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 10000,
})

// Intercepteur pour AJOUTER le token à CHAQUE requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`🔑 Token ajouté pour: ${config.url}`)
    } else {
      console.warn(`⚠️ Pas de token pour: ${config.url}`)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Session expirée - Token invalide')
      if (!error.config.url.includes('/auth/')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
