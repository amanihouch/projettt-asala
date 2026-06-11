// frontend/src/composables/useVisitTracker.js
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { publicApi } from '../services/api'

// URL de base sans /api/v1
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Générer un ID de session unique
const generateSessionId = () => {
  const stored = sessionStorage.getItem('visit_session_id')
  if (stored) return stored
  const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem('visit_session_id', newId)
  return newId
}

export function useVisitTracker() {
  const route = useRoute()
  let visitId = null
  let startTime = null
  const sessionId = generateSessionId()

  const startVisit = async () => {
    try {
      console.log('📊 Démarrage visite...')

      // ✅ Utiliser publicApi au lieu de fetch avec URL complète
      const response = await publicApi.post('/visits/start', {
        sessionId: sessionId,
        pageUrl: window.location.pathname,
        pageTitle: document.title,
        referrer: document.referrer || 'direct',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      })

      if (response.data && response.data.success) {
        visitId = response.data.visitId
        startTime = Date.now()
        console.log('✅ Visite enregistrée:', visitId)
      } else if (response.data?.visitId) {
        visitId = response.data.visitId
        startTime = Date.now()
        console.log('✅ Visite enregistrée:', visitId)
      }
    } catch (error) {
      // Ignorer les erreurs pour les visiteurs (pas de token nécessaire)
      console.log('📊 Visiteur non authentifié - visite non enregistrée')
    }
  }

  const trackPageView = async (url) => {
    if (!visitId) return
    try {
      await publicApi.post('/visits/page-view', {
        visitId: visitId,
        pageUrl: url || window.location.pathname,
        pageTitle: document.title,
        timeSpent: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      })
    } catch (error) {
      // Ignorer silencieusement
      console.log('Page view non enregistré')
    }
  }

  const endVisit = async () => {
    if (!visitId) return
    try {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      await publicApi.post('/visits/end', {
        visitId: visitId,
        timeSpent: timeSpent,
        pagesViewed: 1
      })
      console.log('🏁 Visite terminée:', visitId, '-', timeSpent, 'secondes')
    } catch (error) {
      // Ignorer silencieusement
      console.log('Fin de visite non enregistrée')
    }
  }

  onMounted(() => {
    startVisit()
  })

  onUnmounted(() => {
    endVisit()
  })

  // Suivre les changements de page
  return {
    trackPageView,
    endVisit
  }
}
