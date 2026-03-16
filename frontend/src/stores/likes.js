// frontend/src/stores/likes.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from './auth';

export const useLikesStore = defineStore('likes', () => {
  const likedProductsMap = ref(new Map());
  const loading = ref(false);
  const isOpen = ref(false);
  const authStore = useAuthStore();

  // Charger depuis le backend
  const loadFromBackend = async () => {
    if (!authStore.isAuthenticated) return;

    loading.value = true;
    try {
      const response = await api.get('/users/likes').catch(() => null);
      if (response && response.data.data.likes) {
        const likedProducts = response.data.data.likes || [];

        likedProductsMap.value.clear();
        likedProducts.forEach(like => {
          likedProductsMap.value.set(like.productId, {
            ...like.product,
            likedAt: like.createdAt
          });
        });
        console.log('✅ Favoris chargés depuis le backend:', likedProducts.length);
      }
    } catch (error) {
      console.error('Error loading likes from backend:', error);
    } finally {
      loading.value = false;
    }
  };

  // Fallback: charger depuis localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('favoriteProducts');
      if (stored) {
        const products = JSON.parse(stored);
        likedProductsMap.value.clear();
        products.forEach((product) => {
          likedProductsMap.value.set(product.id, product);
        });
        console.log('✅ Favoris chargés depuis localStorage:', products.length);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Sauvegarder dans localStorage (fallback)
  const saveToStorage = () => {
    try {
      const products = Array.from(likedProductsMap.value.values());
      localStorage.setItem('favoriteProducts', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Get all favorite products as array
  const favoriteProducts = computed(() => {
    return Array.from(likedProductsMap.value.values())
      .sort((a, b) => new Date(b.likedAt || 0) - new Date(a.likedAt || 0));
  });

  // Get count of liked products
  const likesCount = computed(() => likedProductsMap.value.size);

  // Check if product is liked
  const isLiked = (productId) => {
    return likedProductsMap.value.has(productId);
  };

  // Toggle like status
  const toggleLike = async (product) => {
    const productId = typeof product === 'object' ? product.id : product;
    const productData = typeof product === 'object' ? product : null;

    if (likedProductsMap.value.has(productId)) {
      // Unlike
      likedProductsMap.value.delete(productId);

      if (authStore.isAuthenticated) {
        try {
          await api.delete(`/users/likes/${productId}`).catch(() => {});
        } catch (error) {
          console.error('Error removing like:', error);
        }
      }
      console.log('👎 Produit retiré des favoris');
    } else {
      // Like
      if (productData) {
        likedProductsMap.value.set(productId, {
          ...productData,
          likedAt: new Date().toISOString(),
        });

        if (authStore.isAuthenticated) {
          try {
            await api.post(`/users/likes/${productId}`).catch(() => {});
          } catch (error) {
            console.error('Error adding like:', error);
          }
        }
        console.log('❤️ Produit ajouté aux favoris');
      }
    }

    // Fallback storage
    saveToStorage();
  };

  // Add like
  const addLike = async (product) => {
    const productId = product.id;
    if (!likedProductsMap.value.has(productId)) {
      likedProductsMap.value.set(productId, {
        ...product,
        likedAt: new Date().toISOString(),
      });

      if (authStore.isAuthenticated) {
        try {
          await api.post(`/users/likes/${productId}`).catch(() => {});
        } catch (error) {
          console.error('Error adding like:', error);
        }
      }

      saveToStorage();
    }
  };

  // Remove like
  const removeLike = async (productId) => {
    if (likedProductsMap.value.has(productId)) {
      likedProductsMap.value.delete(productId);

      if (authStore.isAuthenticated) {
        try {
          await api.delete(`/users/likes/${productId}`).catch(() => {});
        } catch (error) {
          console.error('Error removing like:', error);
        }
      }

      saveToStorage();
    }
  };

  // Clear all likes
  const clearAllLikes = async () => {
    likedProductsMap.value.clear();

    if (authStore.isAuthenticated) {
      try {
        await api.delete('/users/likes').catch(() => {});
      } catch (error) {
        console.error('Error clearing likes:', error);
      }
    }

    saveToStorage();
  };

  // Sidebar controls
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const openSidebar = () => {
    isOpen.value = true;
  };

  const closeSidebar = () => {
    isOpen.value = false;
  };

  // Initialize
  if (authStore.isAuthenticated) {
    loadFromBackend();
  } else {
    loadFromStorage();
  }

  return {
    likedProducts: likedProductsMap,
    favoriteProducts,
    loading,
    isOpen,
    likesCount,
    isLiked,
    toggleLike,
    addLike,
    removeLike,
    clearAllLikes,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    loadFromStorage
  };
});
