// frontend/src/services/oauth.js
import api from './api'

// Configuration Google OAuth
const GOOGLE_CLIENT_ID = '249811703667-g9q79ulnhse1t08rjb8arpv2t8ae8g46.apps.googleusercontent.com'

// Configuration Facebook OAuth
const FACEBOOK_APP_ID = '1003681262777450' // À remplacer par votre ID Facebook

export const oauthService = {
  // Login avec Google
  loginWithGoogle: () => {
    return new Promise((resolve, reject) => {
      // Charger la bibliothèque Google
      if (!window.google) {
        reject(new Error('Google API non chargée'))
        return
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          try {
            // Envoyer le token au backend
            const response = await api.post('/auth/google', {
              token: tokenResponse.access_token
            })

            if (response.data.success) {
              resolve(response.data)
            } else {
              reject(new Error(response.data.message))
            }
          } catch (error) {
            reject(error)
          }
        }
      })

      client.requestAccessToken()
    })
  },

  // Login avec Facebook
  loginWithFacebook: () => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook API non chargée'))
        return
      }

      window.FB.login(async (response) => {
        if (response.authResponse) {
          try {
            // Envoyer le token Facebook au backend
            const fbResponse = await api.post('/auth/facebook', {
              access_token: response.authResponse.accessToken
            })

            if (fbResponse.data.success) {
              resolve(fbResponse.data)
            } else {
              reject(new Error(fbResponse.data.message))
            }
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('Connexion Facebook annulée'))
        }
      }, { scope: 'email,public_profile' })
    })
  }
}
