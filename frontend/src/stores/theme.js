import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      isDarkMode.value = true
      document.body.classList.add('dark-mode')
    } else {
      isDarkMode.value = false
      document.body.classList.remove('dark-mode')
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value

    if (isDarkMode.value) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  initTheme()

  return { isDarkMode, toggleTheme, initTheme }
})
