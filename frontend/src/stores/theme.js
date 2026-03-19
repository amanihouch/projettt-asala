// frontend/src/stores/theme.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // ===== STATE =====
  const isDarkMode = ref(false)
  const initialized = ref(false)

  // ===== COMPUTED =====
  const themeClass = computed(() => isDarkMode.value ? 'dark-theme' : 'light-theme')
  const themeIcon = computed(() => isDarkMode.value ? '☀️' : '🌙')
  const themeText = computed(() => isDarkMode.value ? 'الوضع النهاري' : 'الوضع الليلي')

  // ===== METHODS =====
  const initTheme = () => {
    try {
      const savedTheme = localStorage.getItem('site-theme')

      if (savedTheme === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDarkMode.value = prefersDark
      } else {
        isDarkMode.value = savedTheme === 'dark'
      }

      applyThemeToDocument()
      initialized.value = true
      console.log('🎨 Thème initialisé:', isDarkMode.value ? 'sombre' : 'clair')
    } catch (error) {
      console.error('❌ Erreur initialisation thème:', error)
      isDarkMode.value = false
      initialized.value = true
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    saveTheme()
    applyThemeToDocument()
    console.log('🎨 Thème basculé:', isDarkMode.value ? 'sombre' : 'clair')
  }

  const setTheme = (dark) => {
    isDarkMode.value = dark
    saveTheme()
    applyThemeToDocument()
  }

  const saveTheme = () => {
    try {
      localStorage.setItem('site-theme', isDarkMode.value ? 'dark' : 'light')
    } catch (error) {
      console.error('❌ Erreur sauvegarde thème:', error)
    }
  }

  const applyThemeToDocument = () => {
    const html = document.documentElement

    if (isDarkMode.value) {
      html.classList.add('dark-theme')
      html.classList.remove('light-theme')
      html.style.colorScheme = 'dark'

      // Appliquer les couleurs dark mode au body
      document.body.style.backgroundColor = '#1a1a1a'
      document.body.style.color = '#e0e0e0'
    } else {
      html.classList.add('light-theme')
      html.classList.remove('dark-theme')
      html.style.colorScheme = 'light'

      // Appliquer les couleurs light mode au body
      document.body.style.backgroundColor = '#f8fafc'
      document.body.style.color = '#1e293b'
    }
  }

  const listenToSystemChanges = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e) => {
      if (localStorage.getItem('site-theme') === null) {
        isDarkMode.value = e.matches
        applyThemeToDocument()
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  return {
    isDarkMode,
    initialized,
    themeClass,
    themeIcon,
    themeText,
    initTheme,
    toggleTheme,
    setTheme,
    saveTheme,
    applyThemeToDocument,
    listenToSystemChanges
  }
})
