import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])
  const isOpen = ref(false)

  const itemCount = computed(() => items.value.length)

  const addItem = (product) => {
    if (!items.value.find((item) => item.id === product.id)) {
      items.value.push(product)
    }
  }

  const removeItem = (productId) => {
    items.value = items.value.filter((item) => item.id !== productId)
  }

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value
  }

  const closeSidebar = () => {
    isOpen.value = false
  }

  return {
    items,
    isOpen,
    itemCount,
    addItem,
    removeItem,
    toggleSidebar,
    closeSidebar,
  }
})
