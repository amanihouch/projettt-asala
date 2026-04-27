// stores/wishlist.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])
  const isOpen = ref(false)

  const itemCount = computed(() => items.value.length)

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('wishlist') || localStorage.getItem('favoriteProducts')
      if (stored) {
        items.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      items.value = []
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items.value))
      localStorage.setItem('favoriteProducts', JSON.stringify(items.value))
    } catch (error) {
      console.error('Error saving wishlist:', error)
    }
  }

  const addItem = (product) => {
    if (!items.value.find((item) => item.id === product.id)) {
      items.value.unshift({
        ...product,
        likedAt: new Date().toISOString()
      })
      saveToStorage()
    }
  }

  const removeItem = (productId) => {
    items.value = items.value.filter((item) => item.id !== productId)
    saveToStorage()
  }

  const isLiked = (productId) => {
    return items.value.some((item) => item.id === productId)
  }

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen.value ? 'hidden' : ''
    }
  }

  const closeSidebar = () => {
    isOpen.value = false
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }

  const openSidebar = () => {
    isOpen.value = true
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  }

  const clearAll = () => {
    items.value = []
    saveToStorage()
  }

  // Initialisation
  loadFromStorage()

  return {
    items,
    isOpen,
    itemCount,
    addItem,
    removeItem,
    isLiked,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    clearAll,
    loadFromStorage
  }
})
