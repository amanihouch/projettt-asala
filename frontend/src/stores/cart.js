// frontend/src/stores/cart.js - VERSION FINALE COMPLÈTE
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import api from '../services/api';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const isOpen = ref(false);
  const authStore = useAuthStore();
  const syncing = ref(false);

  // ===== ✅ TOUJOURS RETOURNER UN NOMBRE =====
  const getItemId = (item) => {
    if (!item) return null;
    let id = item.id || item.productId || item.product_id;
    if (id === undefined || id === null || id === 'unknown' || id === 'undefined' || id === 'null') return null;
    return parseInt(id, 10);
  };

  // ===== NOTIFICATION CHANGEMENT QUANTITÉ =====
  const notifyQuantityChange = (productId, change) => {
    window.dispatchEvent(new CustomEvent('cartQuantityChanged', {
      detail: { productId: parseInt(productId), change }
    }));
  };

  // ===== STORAGE =====
  const cleanupStorage = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filtered = orders.filter(o => new Date(o.createdAt).getTime() > thirtyDaysAgo);
      if (filtered.length !== orders.length) localStorage.setItem('orders', JSON.stringify(filtered));
    } catch (e) {}
  };

  const checkStorageQuota = () => {
    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k);
        size += (k.length + (v?.length || 0)) * 2;
      }
      if (size > 4 * 1024 * 1024) cleanupStorage();
    } catch (e) {}
  };

  const loadFromStorage = () => {
    try {
      checkStorageQuota();
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          items.value = parsed.filter(item => getItemId(item) !== null);
        }
      }
      console.log('✅ Panier chargé:', items.value.length);
    } catch (e) {
      items.value = [];
    }
  };

  const saveToStorage = () => {
    try {
      const valid = items.value.filter(item => getItemId(item) !== null);
      items.value = valid;
      localStorage.setItem('cart', JSON.stringify(valid.slice(0, 50)));
    } catch (e) {
      console.error('❌ Sauvegarde échouée');
    }
  };

  // ===== SYNC BACKEND =====
  const syncWithBackend = async () => {
    if (!authStore.isAuthenticated || syncing.value) return;
    syncing.value = true;
    try {
      await api.post('/cart/sync', {
        items: items.value.map(item => ({
          productId: getItemId(item),
          quantity: item.quantity || 1,
          price: item.price || 0
        }))
      });
    } catch (e) {} finally {
      syncing.value = false;
    }
  };

  const loadFromBackend = async () => {
    if (!authStore.isAuthenticated || items.value.length > 0) return;
    try {
      const res = await api.get('/cart');
      if (res.data?.data?.items?.length > 0) {
        items.value = res.data.data.items.map(item => ({
          id: parseInt(item.productId || item.id),
          productId: parseInt(item.productId || item.id),
          quantity: item.quantity || 1,
          price: item.price || 0,
          name: item.name || 'منتج',
          image: item.image || null,
          vendorName: item.vendorName || 'بائع'
        }));
        saveToStorage();
      }
    } catch (e) {}
  };

  // ===== GETTERS =====
  const itemCount = computed(() => items.value.reduce((t, i) => t + (i.quantity || 1), 0));
  const totalPrice = computed(() => items.value.reduce((t, i) => t + ((i.price || 0) * (i.quantity || 1)), 0));
  const isEmpty = computed(() => items.value.length === 0);

  // ===== IMAGE =====
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http') || url.startsWith('data:image') || url.includes('cloudinary.com');
  };

  const getProductImage = (product) => {
    if (product.image && isValidImageUrl(product.image)) return product.image;
    if (Array.isArray(product.images) && product.images[0] && isValidImageUrl(product.images[0])) return product.images[0];
    const id = product.id || product.productId;
    if (id) return `https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/posts/post_${id}.jpg`;
    return 'https://placehold.co/400x400/08717f/white?text=Produit';
  };

  // ===== ✅ ADD ITEM =====
  const addItem = async (product) => {
    const productId = getItemId(product);

    if (!productId) {
      console.error('❌ ID manquant');
      return;
    }

    const qty = Math.min(product.quantity || 1, 99);
    const existingIndex = items.value.findIndex(item => getItemId(item) === productId);

    if (existingIndex !== -1) {
      const oldQty = items.value[existingIndex].quantity || 1;
      items.value[existingIndex].quantity = Math.min(oldQty + qty, 99);
      const addedQty = items.value[existingIndex].quantity - oldQty;
      console.log('✅ Qté mise à jour:', items.value[existingIndex].quantity);
      // ✅ Notifier le changement de quantité (ajout au panier = diminution du stock)
      notifyQuantityChange(productId, -addedQty);
    } else {
      items.value.push({
        id: productId, productId: productId,
        name: product.name || product.productName || product.title || 'منتج',
        price: product.price || 0,
        image: getProductImage(product),
        quantity: qty,
        vendorName: product.vendorName || 'بائع',
        vendorId: product.vendorId || null,
        unit: product.unit || 'piece',
        color: product.color || null,
        size: product.size || null
      });
      console.log('✅ Nouvel article:', productId);
      // ✅ Notifier le changement de quantité
      notifyQuantityChange(productId, -qty);
    }

    saveToStorage();
    if (authStore.isAuthenticated) await syncWithBackend();
    isOpen.value = true;
  };

  // ===== ✅ REMOVE ITEM (restaure le stock) =====
  const removeItem = async (productId) => {
    const id = parseInt(productId, 10);
    console.log('🗑️ Suppression ID:', id);

    if (isNaN(id)) return;

    const index = items.value.findIndex(item => getItemId(item) === id);

    if (index !== -1) {
      const removedQty = items.value[index].quantity || 0;
      items.value.splice(index, 1);
      saveToStorage();
      if (authStore.isAuthenticated) await syncWithBackend();
      console.log('✅ Supprimé');
      // ✅ Notifier : restauration du stock (quantité positive)
      notifyQuantityChange(id, removedQty);
    } else {
      console.warn('⚠️ Non trouvé:', id);
    }
  };

  // ===== ✅ UPDATE QUANTITY =====
  const updateQuantity = async (productId, newQuantity) => {
    const id = parseInt(productId, 10);
    if (isNaN(id)) return;

    const index = items.value.findIndex(item => getItemId(item) === id);

    if (index !== -1) {
      const oldQty = items.value[index].quantity || 1;
      const qtyDiff = oldQty - newQuantity; // positif si diminution, négatif si augmentation

      if (newQuantity <= 0) {
        await removeItem(id);
      } else {
        items.value[index].quantity = Math.min(newQuantity, 99);
        saveToStorage();
        if (authStore.isAuthenticated) await syncWithBackend();
        console.log('✅ Qté:', oldQty, '→', items.value[index].quantity);
        // ✅ Notifier le changement (qtyDiff positif = rendu au stock, négatif = pris du stock)
        notifyQuantityChange(id, qtyDiff);
      }
    }
  };

  // ===== AUTRES =====
  const clearCart = async () => {
    // Restaurer le stock pour tous les articles avant de vider
    for (const item of items.value) {
      const id = getItemId(item);
      if (id !== null) {
        notifyQuantityChange(id, item.quantity || 0); // Restaure tout
      }
    }
    items.value = [];
    saveToStorage();
    if (authStore.isAuthenticated) await syncWithBackend();
    console.log('🗑️ Panier vidé (stock restauré)');
  };

  const toggleCart = () => { isOpen.value = !isOpen.value; };
  const closeCart = () => { isOpen.value = false; };
  const openCart = () => { isOpen.value = true; };

  const saveOrder = (orderData) => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({ id: 'CMD' + Date.now(), ...orderData, createdAt: new Date().toISOString() });
      localStorage.setItem('orders', JSON.stringify(orders.slice(-100)));
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  };

  // ===== INIT =====
  cleanupStorage();
  loadFromStorage();
  if (authStore.isAuthenticated) loadFromBackend();

  return {
    items, isOpen, syncing: computed(() => syncing.value),
    itemCount, totalPrice, isEmpty,
    addItem, removeItem, updateQuantity, clearCart,
    toggleCart, closeCart, openCart,
    syncWithBackend, loadFromBackend, loadFromStorage, saveToStorage,
    getItemId, saveOrder
  };
});
