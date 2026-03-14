// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import ar from '../locales/ar'
import fr from '../locales/fr'

// Détecter la langue du navigateur
const getBrowserLocale = () => {
  try {
    const navigatorLocale = navigator.languages && navigator.languages.length 
      ? navigator.languages[0] 
      : navigator.language
    
    if (!navigatorLocale) return 'ar'
    
    const locale = navigatorLocale.split('-')[0]
    return ['ar', 'fr'].includes(locale) ? locale : 'ar'
  } catch (e) {
    return 'ar'
  }
}

// Récupérer la langue sauvegardée ou utiliser celle du navigateur
let savedLocale = 'ar'
try {
  savedLocale = localStorage.getItem('locale') || getBrowserLocale()
} catch (e) {
  console.warn('Impossible d\'accéder à localStorage', e)
  savedLocale = 'ar'
}

// Configuration de i18n
const i18n = createI18n({
  legacy: false,           // Important: utiliser false pour Vue 3
  locale: savedLocale,     // Langue par défaut
  fallbackLocale: 'ar',    // Langue de secours si une traduction manque
  globalInjection: true,   // Permet d'utiliser $t dans les templates
  silentTranslationWarn: false, // Afficher les avertissements en développement
  missingWarn: true,       // Avertir quand une clé de traduction est manquante
  fallbackWarn: true,      // Avertir quand on utilise le fallback
  messages: {
    ar,
    fr
  }
})

export default i18n