// frontend/src/services/oauth.js
import api from './api'

// ============================================
// CONFIGURATION OAuth
// ============================================

// Configuration Google OAuth
const GOOGLE_CLIENT_ID = '249811703667-g9q79ulnhse1t08rjb8arpv2t8ae8g46.apps.googleusercontent.com'

// Configuration Facebook OAuth
const FACEBOOK_APP_ID = '1003681262777450'

// ============================================
// SERVICE OAUTH
// ============================================

export const oauthService = {
  /**
   * Charger le SDK Google
   */
  loadGoogleSDK: () => {
    return new Promise((resolve, reject) => {
      // Si déjà chargé
      if (window.google) {
        resolve(window.google)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('✅ Google SDK chargé')
        resolve(window.google)
      }
      script.onerror = (error) => {
        console.error('❌ Erreur chargement Google SDK:', error)
        reject(new Error('Impossible de charger Google SDK'))
      }
      document.head.appendChild(script)
    })
  },

  /**
   * Charger le SDK Facebook
   */
  loadFacebookSDK: () => {
    return new Promise((resolve, reject) => {
      // Si déjà chargé
      if (window.FB) {
        resolve(window.FB)
        return
      }

      // Initialisation asynchrone de Facebook
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
        console.log('✅ Facebook SDK chargé')
        resolve(window.FB)
      }

      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js'
      script.async = true
      script.defer = true
      script.onerror = (error) => {
        console.error('❌ Erreur chargement Facebook SDK:', error)
        reject(new Error('Impossible de charger Facebook SDK'))
      }
      document.head.appendChild(script)
    })
  },

  /**
   * Login avec Google (Client-Side)
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  loginWithGoogle: async () => {
    try {
      // Charger le SDK Google
      await oauthService.loadGoogleSDK()

      return new Promise((resolve, reject) => {
        // Créer le client OAuth2
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            // Vérifier les erreurs
            if (tokenResponse.error) {
              console.error('❌ Erreur Google:', tokenResponse.error)
              reject(new Error(tokenResponse.error_description || 'Erreur d\'authentification Google'))
              return
            }

            try {
              // Envoyer le token au backend
              const response = await api.post('/auth/google-token', {
                token: tokenResponse.access_token
              })

              if (response.data.success) {
                const { token, user } = response.data

                // Sauvegarder dans localStorage
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))

                // Configurer axios
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                console.log('✅ Connexion Google réussie pour:', user.email)
                resolve(response.data)
              } else {
                reject(new Error(response.data.message || 'Erreur lors de la connexion Google'))
              }
            } catch (error) {
              console.error('❌ Erreur API Google:', error)
              reject(new Error(error.response?.data?.message || 'Erreur de communication avec le serveur'))
            }
          }
        })

        // Demander le token
        client.requestAccessToken()
      })
    } catch (error) {
      console.error('❌ Erreur loginWithGoogle:', error)
      throw error
    }
  },

  /**
   * Login avec Facebook (Client-Side)
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  loginWithFacebook: async () => {
    try {
      // Charger le SDK Facebook
      await oauthService.loadFacebookSDK()

      return new Promise((resolve, reject) => {
        // Vérifier le statut de connexion Facebook
        window.FB.getLoginStatus(async (statusResponse) => {
          // Si déjà connecté à Facebook
          if (statusResponse.status === 'connected') {
            try {
              const result = await oauthService.handleFacebookToken(statusResponse.authResponse.accessToken)
              resolve(result)
              return
            } catch (error) {
              reject(error)
              return
            }
          }

          // Sinon, demander la connexion
          window.FB.login(
            async (loginResponse) => {
              if (loginResponse.authResponse) {
                try {
                  const result = await oauthService.handleFacebookToken(loginResponse.authResponse.accessToken)
                  resolve(result)
                } catch (error) {
                  reject(error)
                }
              } else {
                console.error('❌ Connexion Facebook annulée ou refusée')
                reject(new Error('Connexion Facebook annulée'))
              }
            },
            { scope: 'email,public_profile' }
          )
        })
      })
    } catch (error) {
      console.error('❌ Erreur loginWithFacebook:', error)
      throw error
    }
  },

  /**
   * Gérer le token Facebook côté backend
   * @param {string} accessToken - Token d'accès Facebook
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  handleFacebookToken: async (accessToken) => {
    try {
      const response = await api.post('/auth/facebook-token', {
        access_token: accessToken
      })

      if (response.data.success) {
        const { token, user } = response.data

        // Sauvegarder dans localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Configurer axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        console.log('✅ Connexion Facebook réussie pour:', user.email)
        return response.data
      } else {
        throw new Error(response.data.message || 'Erreur lors de la connexion Facebook')
      }
    } catch (error) {
      console.error('❌ Erreur API Facebook:', error)
      throw new Error(error.response?.data?.message || 'Erreur de communication avec le serveur')
    }
  },

  /**
   * Déconnexion OAuth (optionnelle)
   */
  logout: () => {
    // Nettoyer les tokens
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']

    // Optionnel: se déconnecter de Facebook
    if (window.FB) {
      window.FB.logout()
    }

    console.log('👋 Déconnexion OAuth réussie')
  }
}

export default oauthService
