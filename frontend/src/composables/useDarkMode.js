// frontend/src/composables/useDarkMode.js
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

export function useDarkMode() {
  const themeStore = useThemeStore()

  const isDarkMode = computed(() => themeStore.isDarkMode)

  // Propriétés calculées basées sur isDarkMode
  const themeClass = computed(() => isDarkMode.value ? 'dark-mode' : 'light-mode')

  const themeIcon = computed(() => isDarkMode.value ? '🌙' : '☀️')

  const themeText = computed(() => isDarkMode.value ? 'ليلي' : 'نهاري')

  const toggleDarkMode = () => {
    themeStore.toggleTheme()
  }

  const setDarkMode = (isDark) => {
    themeStore.setTheme(isDark ? 'dark' : 'light')
  }

  const initTheme = () => {
    // Le store initialise déjà le thème automatiquement
    // Cette fonction est optionnelle
    if (themeStore.initTheme && typeof themeStore.initTheme === 'function') {
      themeStore.initTheme()
    }
  }

  return {
    isDarkMode,
    themeClass,
    themeIcon,
    themeText,
    toggleDarkMode,
    setDarkMode,
    initTheme
  }
}
