// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
  (response) => {
    console.log(`✅ Réponse reçue de: ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Erreur ${error.response.status} sur: ${error.config?.url}`)

      if (error.response.status === 401) {
        console.error('🔒 Session expirée - Token invalide')
        // Ne pas rediriger automatiquement pour éviter les boucles
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // window.location.href = '/login' // Décommentez si vous voulez la redirection auto
        }
      }
    } else {
      console.error('❌ Erreur réseau:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
