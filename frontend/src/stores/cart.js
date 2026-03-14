// frontend/src/stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);
  const isOpen = ref(false);
  const authStore = useAuthStore();

  // Load from localStorage on init
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        items.value = JSON.parse(saved);
        console.log('✅ Panier chargé:', items.value.length, 'articles');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(items.value));
      
      // Si utilisateur connecté, synchroniser avec le backend (optionnel)
      if (authStore.isAuthenticated) {
        // Implémentation future
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + (item.quantity || 1), 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  });

  const isInCart = (productId) => {
    return items.value.some(item => item.id === productId);
  };

  // Actions
  const addItem = (product) => {
    console.log('🛒 Ajout au panier:', product);
    
    // Vérifier si le produit existe déjà
    const existingItem = items.value.find(item => item.id === product.id);
    
    if (existingItem) {
      // Incrémenter la quantité
      existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
      console.log('✅ Quantité mise à jour:', existingItem.quantity);
    } else {
      // Ajouter le nouveau produit
      items.value.push({
        id: product.id,
        name: product.name || 'Produit',
        price: product.price || 0,
        image: product.image || 'https://via.placeholder.com/300',
        quantity: product.quantity || 1,
        vendorName: product.vendorName || 'بائع',
        vendorId: product.vendorId || null
      });
      console.log('✅ Nouvel article ajouté');
    }
    
    saveToStorage();
    // Ouvrir automatiquement le panier
    isOpen.value = true;
  };

  const removeItem = (productId) => {
    console.log('🗑️ Suppression du panier:', productId);
    const index = items.value.findIndex(item => item.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
      saveToStorage();
      console.log('✅ Article supprimé');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      if (newQuantity <= 0) {
        removeItem(productId);
      } else {
        item.quantity = newQuantity;
        saveToStorage();
        console.log('✅ Quantité mise à jour:', newQuantity);
      }
    }
  };

  const clearCart = () => {
    items.value = [];
    saveToStorage();
    console.log('🗑️ Panier vidé');
  };

  const toggleCart = () => {
    isOpen.value = !isOpen.value;
    console.log('🔄 Panier', isOpen.value ? 'ouvert' : 'fermé');
  };

  const closeCart = () => {
    isOpen.value = false;
  };

  const openCart = () => {
    isOpen.value = true;
  };

  // Initialize
  loadFromStorage();

  return {
    // State
    items,
    isOpen,
    
    // Getters
    itemCount,
    totalPrice,
    isInCart,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,
    loadFromStorage,
    saveToStorage
  };
});