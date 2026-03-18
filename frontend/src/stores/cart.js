// frontend/src/stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import api from '../services/api';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);
  const isOpen = ref(false);
  const authStore = useAuthStore();
  const syncing = ref(false);

  // ===== MÉTHODES PRIVÉES =====

  // Charger depuis localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        items.value = JSON.parse(saved);
        console.log('✅ Panier chargé depuis localStorage:', items.value.length, 'articles');
      }
    } catch (error) {
      console.error('❌ Erreur chargement panier:', error);
      items.value = [];
    }
  };

  // Sauvegarder dans localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(items.value));
    } catch (error) {
      console.error('❌ Erreur sauvegarde panier:', error);
    }
  };

  // Synchroniser avec le backend
  const syncWithBackend = async () => {
    if (!authStore.isAuthenticated || syncing.value) return;

    syncing.value = true;

    try {
      const response = await api.post('/cart/sync', {
        items: items.value.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (response.data.success) {
        console.log('✅ Panier synchronisé avec le backend');
        if (response.data.data?.items) {
          items.value = response.data.data.items;
          saveToStorage();
        }
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation backend:', error.response?.data?.message || error.message);

      // Si erreur 404, c'est que les routes du panier n'existent pas encore
      if (error.response?.status === 404) {
        console.log('ℹ️ Routes du panier non implémentées dans le backend');
      }
    } finally {
      syncing.value = false;
    }
  };

  // Charger depuis le backend
  const loadFromBackend = async () => {
    if (!authStore.isAuthenticated) return;

    try {
      const response = await api.get('/cart');

      if (response.data.success) {
        if (response.data.data?.items && response.data.data.items.length > 0) {
          items.value = response.data.data.items;
          saveToStorage();
          console.log('✅ Panier chargé depuis backend:', items.value.length, 'articles');
        }
      }
    } catch (error) {
      // Ignorer l'erreur 404 (routes non implémentées)
      if (error.response?.status === 404) {
        console.log('ℹ️ Routes du panier non implémentées dans le backend');
      } else {
        console.error('❌ Erreur chargement panier backend:', error.response?.data?.message || error.message);
      }
      console.log('⚠️ Utilisation du panier local');
    }
  };

  // ===== GETTERS =====
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

  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.id === productId);
    return item?.quantity || 0;
  };

  const isEmpty = computed(() => items.value.length === 0);

  // ===== ACTIONS =====
  const addItem = async (product) => {
    console.log('🛒 Ajout au panier:', product);

    const existingItem = items.value.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
      console.log('✅ Quantité mise à jour:', existingItem.quantity);
    } else {
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

    if (authStore.isAuthenticated) {
      await syncWithBackend();
    }

    isOpen.value = true;
  };

  const removeItem = async (productId) => {
    console.log('🗑️ Suppression du panier:', productId);
    const index = items.value.findIndex(item => item.id === productId);

    if (index !== -1) {
      items.value.splice(index, 1);
      saveToStorage();

      if (authStore.isAuthenticated) {
        await syncWithBackend();
      }

      console.log('✅ Article supprimé');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    const item = items.value.find(item => item.id === productId);

    if (item) {
      if (newQuantity <= 0) {
        await removeItem(productId);
      } else {
        item.quantity = newQuantity;
        saveToStorage();

        if (authStore.isAuthenticated) {
          await syncWithBackend();
        }

        console.log('✅ Quantité mise à jour:', newQuantity);
      }
    }
  };

  const clearCart = async () => {
    items.value = [];
    saveToStorage();

    if (authStore.isAuthenticated) {
      await syncWithBackend();
    }

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

  // Rafraîchir le panier
  const refreshCart = async () => {
    if (items.value.length === 0) return;

    try {
      const productIds = items.value.map(item => item.id);
      const response = await api.post('/cart/refresh', { productIds });

      if (response.data.success) {
        const updatedProducts = response.data.data.products;

        items.value = items.value.map(item => {
          const updated = updatedProducts.find(p => p.id === item.id);
          if (updated) {
            return {
              ...item,
              price: updated.price,
              inStock: updated.inStock
            };
          }
          return item;
        }).filter(item => item.inStock !== false);

        saveToStorage();
        console.log('✅ Panier rafraîchi');
      }
    } catch (error) {
      // Ignorer l'erreur 404
      if (error.response?.status !== 404) {
        console.error('❌ Erreur rafraîchissement panier:', error);
      }
    }
  };

  // ===== GESTION DES COMMANDES =====
  const saveOrder = (orderData) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');

      const newOrder = {
        id: 'CMD' + Date.now(),
        ...orderData,
        createdAt: new Date().toISOString(),
        status: orderData.status || 'pending'
      };

      existingOrders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      console.log('✅ Commande sauvegardée:', newOrder.id);
      return { success: true, order: newOrder };
    } catch (error) {
      console.error('❌ Erreur sauvegarde commande:', error);
      return { success: false, error: error.message };
    }
  };

  const getOrdersByUser = (userEmail) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');

      const userOrders = allOrders
        .filter(order => order.customer?.email === userEmail)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log(`📦 ${userOrders.length} commandes trouvées pour ${userEmail}`);
      return userOrders;
    } catch (error) {
      console.error('❌ Erreur chargement commandes:', error);
      return [];
    }
  };

  // ===== INITIALISATION =====
  loadFromStorage();

  if (authStore.isAuthenticated) {
    loadFromBackend();
  }

  // Écouter les changements d'authentification
  const unsubscribe = authStore.$subscribe((mutation, state) => {
    if (state.isAuthenticated) {
      loadFromBackend();
    }
  });

  const cleanup = () => {
    if (unsubscribe) unsubscribe();
  };

  // ===== RETURN =====
  return {
    // State
    items,
    isOpen,
    syncing: computed(() => syncing.value),

    // Getters
    itemCount,
    totalPrice,
    isInCart,
    getItemQuantity,
    isEmpty,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,

    // Synchronisation
    syncWithBackend,
    loadFromBackend,
    refreshCart,

    // Utilitaires
    loadFromStorage,
    saveToStorage,
    cleanup,

    // Commandes
    saveOrder,
    getOrdersByUser
  };
});
