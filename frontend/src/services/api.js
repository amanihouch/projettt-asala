// frontend/src/services/api.js  ✅ CORRIGÉ
import axios from 'axios';

// ==================== URLS DE BASE ====================
// BASE_URL = http://localhost:5000  (PAS de /api/v1)
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '');

// ✅ API_URL ajoute /api/v1 une seule fois
const API_URL = `${BASE_URL}/api/v1`;
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5001';

// ==================== INSTANCE AXIOS PRINCIPALE ====================
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ==================== INSTANCE PUBLIQUE (SANS TOKEN) ====================
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ==================== INTERCEPTEUR REQUÊTE ====================
const requestInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
};

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

// ✅ publicApi n'a PAS d'intercepteur token

// ==================== INTERCEPTEUR RÉPONSE ====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    const url = error.config?.url || '';

    const publicRoutes = ['/visits/start', '/visits/heartbeat', '/sponsored-products', '/reels', '/posts/feed', '/categories'];
    const isPublicRoute = publicRoutes.some(route => url.includes(route));
    const isOAuthRoute = url.includes('/auth/google') || url.includes('/auth/facebook');

    if (error.response?.status === 401 && !isPublicRoute && !isOAuthRoute) {
      if (token && token !== 'null' && token !== 'undefined') {
        console.warn('⚠️ Token expiré, redirection vers login...');
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ==================== UTILITAIRES ====================
export const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/uploads/${url}`;
};

// ==================== SERVICE IA ====================
export const aiService = {
  async getDashboardStats(period = 'week') {
    try {
      const response = await fetch(`${AI_API_URL}/dashboard-stats?period=${period}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur IA:', error);
      return {
        success: true,
        stats: { total_users: 0, total_vendors: 0, total_products: 0, total_orders: 0, total_revenue: 0, total_visits: 0, categories: [] },
        evolution: { visits: [], posts: [], users: { months: [], clients: [], vendors: [] }, orders: [], revenue: [] }
      };
    }
  },
  async predictUserBehavior(userData) {
    try {
      const response = await fetch(`${AI_API_URL}/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) { return { success: false, error: error.message }; }
  },
  async healthCheck() {
    try { const response = await fetch(`${AI_API_URL}/health`); return await response.json(); }
    catch (error) { return { status: 'OFFLINE' }; }
  }
};

// ==================== AUTH SERVICE ====================
export const authService = {
  async login(email, password) { const response = await api.post('/auth/login', { email, password }); return response.data; },
  async register(userData) { const response = await api.post('/auth/register', userData); return response.data; },
  async getMe() { const response = await api.get('/auth/me'); return response.data; },
  async forgotPassword(email) { const response = await api.post('/auth/forgot-password', { email }); return response.data; },
  async resetPassword(email, code, newPassword) { const response = await api.post('/auth/reset-password', { email, code, newPassword }); return response.data; },
  async sendVerificationCode(phone) { const response = await api.post('/auth/send-verification-code', { phone }); return response.data; },
  async verifyPhone(phone, code) { const response = await api.post('/auth/verify-phone', { phone, code }); return response.data; }
};

// ==================== USER SERVICE ====================
export const userService = {
  async getProfile() { const response = await api.get('/user/profile'); return response.data; },
  async updateProfile(data) { const response = await api.put('/user/profile', data); return response.data; },
  async changePassword(currentPassword, newPassword) { const response = await api.post('/user/change-password', { currentPassword, newPassword }); return response.data; },
  async updateAvatar(file) { const formData = new FormData(); formData.append('avatar', file); const response = await api.post('/user/avatar', formData); return response.data; },
  async getWishlist() { const response = await api.get('/user/wishlist'); return response.data; },
  async addToWishlist(productId) { const response = await api.post(`/user/wishlist/${productId}`); return response.data; },
  async removeFromWishlist(productId) { const response = await api.delete(`/user/wishlist/${productId}`); return response.data; }
};

// ==================== VENDOR SERVICE ====================
export const vendorService = {
  async getAllVendors(params = {}) { const response = await api.get('/vendors', { params }); return response.data; },
  async getVendorById(id) { const response = await api.get(`/vendors/${id}`); return response.data; },
  async createVendor(data) { const response = await api.post('/vendors', data); return response.data; },
  async updateVendor(id, data) { const response = await api.put(`/vendors/${id}`, data); return response.data; },
  async toggleFollow(vendorId) { const response = await api.post(`/vendors/${vendorId}/follow`); return response.data; },
  async getVendorProducts(vendorId) { const response = await api.get(`/products/vendor/${vendorId}`); return response.data; },
  async getVendorStats(vendorId) { const response = await api.get(`/vendors/${vendorId}/stats`); return response.data; }
};

// ==================== PRODUCT SERVICE ====================
export const productService = {
  async getAllProducts(params = {}) { const response = await api.get('/products', { params }); return response.data; },
  async getProductById(id) { const response = await api.get(`/products/${id}`); return response.data; },
  async createProduct(data) { const response = await api.post('/products', data); return response.data; },
  async updateProduct(id, data) { const response = await api.put(`/products/${id}`, data); return response.data; },
  async deleteProduct(id) { const response = await api.delete(`/products/${id}`); return response.data; },
  async toggleLike(productId) { const response = await api.post(`/user/like-product/${productId}`); return response.data; },
  getVendorProducts: (vendorId) => api.get(`/products/vendor/${vendorId}`).then(res => res.data),
  getProduct: (id) => api.get(`/products/${id}`).then(res => res.data)
};

// ==================== CART SERVICE ====================
export const cartService = {
  async getCart() { const response = await api.get('/cart'); return response.data; },
  async syncCart(items) { const response = await api.post('/cart/sync', { items }); return response.data; },
  async refreshCart(productIds) { const response = await api.post('/cart/refresh', { productIds }); return response.data; },
  async addToCart(productId, quantity = 1, variantId = null) { const response = await api.post('/cart/add', { productId, quantity, variantId }); return response.data; },
  async updateCartItem(itemId, quantity) { const response = await api.put(`/cart/items/${itemId}`, { quantity }); return response.data; },
  async removeCartItem(itemId) { const response = await api.delete(`/cart/items/${itemId}`); return response.data; },
  async clearCart() { const response = await api.delete('/cart/clear'); return response.data; }
};

// ==================== ORDER SERVICE ====================
export const orderService = {
  async createOrder(orderData) { const response = await api.post('/orders', orderData); return response.data; },
  async getMyOrders(page = 1, limit = 10) { const response = await api.get('/orders/my-orders', { params: { page, limit } }); return response.data; },
  async getOrderById(id) { const response = await api.get(`/orders/${id}`); return response.data; },
  async cancelOrder(id, reason = '') { const response = await api.patch(`/orders/${id}/cancel`, { reason }); return response.data; },
  async trackOrder(orderNumber) { const response = await api.get(`/orders/track/${orderNumber}`); return response.data; }
};

// ==================== PUBLIC SERVICE ====================
export const publicService = {
  async getCategories() { const response = await publicApi.get('/categories'); return response.data; },
  async getCategoryBySlug(slug) { const response = await publicApi.get(`/categories/${slug}`); return response.data; },
  async getCategoryHierarchy() { const response = await publicApi.get('/categories/hierarchy'); return response.data; },

  async getFeed(page = 1, limit = 2000) {
    const response = await publicApi.get('/posts/feed', { params: { page, limit } });
    return response.data;
  },

  async getReels(limit = 12) {
    const response = await publicApi.get('/reels', { params: { limit } });
    return response.data;
  },

  async getSponsoredProducts() {
    const response = await publicApi.get('/sponsored-products?active=true');
    return response.data;
  },

  async startVisit(payload) {
    const response = await publicApi.post('/visits/start', payload);
    return response.data;
  },
  async sendHeartbeat(payload) {
    const response = await publicApi.post('/visits/heartbeat', payload);
    return response.data;
  }
};

export default api;
