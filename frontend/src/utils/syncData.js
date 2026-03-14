// frontend/src/utils/syncData.js
import api from '../services/api';

export const syncLocalData = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Synchroniser les favoris
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
    if (favorites.length > 0) {
      console.log('🔄 Synchronisation des favoris...', favorites.length);
      await api.post('/users/sync/favorites', { favorites });
      localStorage.removeItem('favoriteProducts');
    }

    // Synchroniser le panier
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) {
      console.log('🔄 Synchronisation du panier...', cart.length);
      await api.post('/users/sync/cart', { cart });
      // On garde le panier en local pour l'instant
    }

    console.log('✅ Données synchronisées avec le backend');
  } catch (error) {
    console.error('Error syncing data:', error);
  }
};

// Fonction pour charger les données depuis le backend
export const loadUserData = async () => {
  try {
    const [favoritesRes, cartRes] = await Promise.all([
      api.get('/users/likes').catch(() => ({ data: { data: { likes: [] } } })),
      api.get('/users/cart').catch(() => ({ data: { data: { cart: [] } } }))
    ]);

    return {
      favorites: favoritesRes.data?.data?.likes || [],
      cart: cartRes.data?.data?.cart || []
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return { favorites: [], cart: [] };
  }
};