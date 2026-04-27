// frontend/src/stores/theme.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      isDarkMode.value = true
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
    } else {
      isDarkMode.value = false
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
    }
  }

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
  }

  const setTheme = (mode) => {
    isDarkMode.value = mode === 'dark'
    applyTheme()
  }

  initTheme()

  return {
    isDarkMode,
    initTheme,
    applyTheme,
    toggleTheme,
    setTheme
  }
})
