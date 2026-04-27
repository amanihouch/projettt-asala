// frontend/src/services/api.js - VERSION COMPLÈTE CORRIGÉE
import axios from 'axios';

// ==================== URLS DE BASE ====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AI_API_URL = 'http://localhost:5001';

// ==================== INSTANCE AXIOS PRINCIPALE ====================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== INSTANCE POUR LES ROUTES CONTACT ====================
const contactApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== INTERCEPTEUR REQUÊTE (CORRIGÉ) ====================
const requestInterceptor = (config) => {
  const token = localStorage.getItem('token');
  // N'ajouter le token QUE s'il existe et n'est pas null/undefined
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
};

const requestErrorHandler = (error) => Promise.reject(error);

api.interceptors.request.use(requestInterceptor, requestErrorHandler);
contactApi.interceptors.request.use(requestInterceptor, requestErrorHandler);

// ==================== INTERCEPTEUR RÉPONSE (CORRIGÉ - NE REDIRIGE PLUS LES VISITEURS) ====================
const responseErrorHandler = (error) => {
  // ✅ CORRECTION : Vérifier si l'utilisateur ÉTAIT connecté avant de rediriger
  const token = localStorage.getItem('token');

  if (error.response?.status === 401) {
    // Si l'utilisateur avait un token (donc il était connecté)
    // Cela signifie que son token est expiré ou invalide
    if (token && token !== 'null' && token !== 'undefined') {
      console.warn('⚠️ Token expiré ou invalide, déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('vendorId');

      // Éviter les redirections en boucle
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // ✅ Si pas de token, l'utilisateur est un simple visiteur
    // On laisse l'erreur se propager sans rediriger
  }

  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, responseErrorHandler);
contactApi.interceptors.response.use((response) => response, responseErrorHandler);

// ==================== UTILITAIRES ====================
export const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${url}`;
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
  async updateAvatar(file) { const formData = new FormData(); formData.append('avatar', file); const response = await api.post('/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return response.data; },
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

// ==================== POST SERVICE ====================
export const postService = {
  async getFeed(page = 1, limit = 10) { const response = await api.get('/posts/feed', { params: { page, limit } }); return response.data; },
  async getPostsByVendor(vendorId, page = 1, limit = 20) { const response = await api.get(`/posts/vendor/${vendorId}`, { params: { page, limit } }); return response.data; },
  async getPostById(id) { const response = await api.get(`/posts/${id}`); return response.data; },
  async createPost(data) { const response = await api.post('/posts', data); return response.data; },
  async updatePost(id, data) { const response = await api.put(`/posts/${id}`, data); return response.data; },
  async deletePost(id) { const response = await api.delete(`/posts/${id}`); return response.data; },
  async toggleLike(postId) { const response = await api.post(`/posts/${postId}/like`); return response.data; },
  async addComment(postId, comment) { const response = await api.post(`/posts/${postId}/comment`, { text: comment }); return response.data; },
  async getComments(postId) { const response = await api.get(`/posts/${postId}/comments`); return response.data; }
};

// ==================== REEL SERVICE ====================
export const reelService = {
  getVendorReels: (vendorId, params = {}) => api.get(`/reels/vendor/${vendorId}`, { params }).then(res => res.data),
  getProductReels: (productId) => api.get(`/reels/product/${productId}`).then(res => res.data),
  getReelById: (id) => api.get(`/reels/${id}`).then(res => res.data),
  getMyReels: (params = {}) => api.get('/reels/my-reels', { params }).then(res => res.data),
  createReel: (formData, onUploadProgress) => api.post('/reels', formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress }).then(res => res.data),
  updateReel: (id, data) => api.put(`/reels/${id}`, data).then(res => res.data),
  deleteReel: (id) => api.delete(`/reels/${id}`).then(res => res.data),
  toggleLike: (id) => api.post(`/reels/${id}/like`).then(res => res.data),
  addComment: (id, text) => api.post(`/reels/${id}/comment`, { text }).then(res => res.data),
  getComments: (id) => api.get(`/reels/${id}/comments`).then(res => res.data),
  viewReel: (id) => api.post(`/reels/${id}/view`).then(res => res.data)
};

// ==================== CATEGORY SERVICE ====================
export const categoryService = {
  async getAllCategories() { const response = await api.get('/categories'); return response.data; },
  async getCategoryBySlug(slug) { const response = await api.get(`/categories/${slug}`); return response.data; },
  async getHierarchy() { const response = await api.get('/categories/hierarchy'); return response.data; },
  async getProductsByCategory(slug, params = {}) { const response = await api.get(`/categories/${slug}/products`, { params }); return response.data; }
};

// ==================== MESSAGE SERVICE ====================
export const messageService = {
  async getConversations() { const response = await api.get('/messages/conversations'); return response.data; },
  async startConversation(otherUserId, otherUserRole) { const response = await api.post('/messages/conversation', { otherUserId, otherUserRole }); return response.data; },
  async getMessages(conversationId) { const response = await api.get(`/messages/conversation/${conversationId}`); return response.data; },
  async sendMessage(receiverId, message, conversationId = null) { const response = await api.post('/messages/send', { receiverId, message, conversationId }); return response.data; },
  async deleteMessage(messageId) { const response = await api.delete(`/messages/${messageId}`); return response.data; },
  async deleteConversation(conversationId) { const response = await api.delete(`/messages/conversation/${conversationId}`); return response.data; },
  async getUnreadCount() { const response = await api.get('/messages/unread'); return response.data; },
  async markAsRead(conversationId) { const response = await api.post(`/messages/conversation/${conversationId}/read`); return response.data; }
};

// ==================== NEWSLETTER SERVICE ====================
export const newsletterService = {
  async subscribe(email) { const response = await api.post('/newsletter/subscribe', { email }); return response.data; },
  async unsubscribe(email) { const response = await api.get(`/newsletter/unsubscribe/${email}`); return response.data; },
  async getSubscribers() { const response = await api.get('/newsletter/subscribers'); return response.data; },
  async sendNewsletter(data) { const response = await api.post('/newsletter/send', data); return response.data; }
};

// ==================== CONTACT SERVICE ====================
export const contactService = {
  async sendMessage(data) { const response = await contactApi.post('/contact/send', data); return response.data; },
  async getMyMessages() { const response = await contactApi.get('/contact/my-messages'); return response.data; },
  async getMessageById(id) { const response = await contactApi.get(`/contact/messages/${id}`); return response.data; },
  async deleteMyMessage(id) { const response = await contactApi.delete(`/contact/messages/${id}`); return response.data; }
};

// ==================== ADMIN SERVICE ====================
export const adminService = {
  async getDashboardStats() { const response = await api.get('/admin/dashboard'); return response.data; },
  async getAllUsers(params = {}) { const response = await api.get('/admin/users', { params }); return response.data; },
  async getUserById(id) { const response = await api.get(`/admin/users/${id}`); return response.data; },
  async updateUser(id, data) { const response = await api.put(`/admin/users/${id}`, data); return response.data; },
  async toggleUserStatus(id) { const response = await api.patch(`/admin/users/${id}/toggle-status`); return response.data; },
  async deleteUser(id) { const response = await api.delete(`/admin/users/${id}`); return response.data; },
  async getAllVendors(params = {}) { const response = await api.get('/admin/vendors', { params }); return response.data; },
  async getVendorById(id) { const response = await api.get(`/admin/vendors/${id}`); return response.data; },
  async approveVendor(id) { const response = await api.post(`/admin/vendors/${id}/approve`); return response.data; },
  async rejectVendor(id, reason = '') { const response = await api.post(`/admin/vendors/${id}/reject`, { reason }); return response.data; },
  async getAllProducts(params = {}) { const response = await api.get('/admin/products', { params }); return response.data; },
  async approveProduct(id) { const response = await api.post(`/admin/products/${id}/approve`); return response.data; },
  async rejectProduct(id, reason = '') { const response = await api.post(`/admin/products/${id}/reject`, { reason }); return response.data; },
  async getAllPosts(params = {}) { const response = await api.get('/admin/posts', { params }); return response.data; },
  async approvePost(id) { const response = await api.patch(`/admin/posts/${id}/approve`); return response.data; },
  async rejectPost(id, reason = '') { const response = await api.patch(`/admin/posts/${id}/reject`, { reason }); return response.data; },
  async getAllReels(params = {}) { const response = await api.get('/admin/reels', { params }); return response.data; },
  async approveReel(id) { const response = await api.post(`/admin/reels/${id}/approve`); return response.data; },
  async rejectReel(id, reason = '') { const response = await api.post(`/admin/reels/${id}/reject`, { reason }); return response.data; },
  async getAllOrders(params = {}) { const response = await api.get('/admin/orders', { params }); return response.data; },
  async updateOrderStatus(id, status) { const response = await api.put(`/admin/orders/${id}/status`, { status }); return response.data; },
  async getAllCategories() { const response = await api.get('/admin/categories'); return response.data; },
  async createCategory(data) { const response = await api.post('/admin/categories', data); return response.data; },
  async updateCategory(id, data) { const response = await api.put(`/admin/categories/${id}`, data); return response.data; },
  async deleteCategory(id) { const response = await api.delete(`/admin/categories/${id}`); return response.data; },
  async getContactMessages(params = {}) { const query = new URLSearchParams(params).toString(); const response = await contactApi.get(`/contact/admin/messages${query ? `?${query}` : ''}`); return response.data; },
  async getContactStats() { const response = await contactApi.get('/contact/admin/stats'); return response.data; },
  async getContactMessageById(id) { const response = await contactApi.get(`/contact/admin/messages/${id}`); return response.data; },
  async updateContactMessageStatus(id, status, adminNotes = null) { const response = await contactApi.patch(`/contact/admin/messages/${id}/status`, { status, adminNotes }); return response.data; },
  async deleteContactMessage(id) { const response = await contactApi.delete(`/contact/admin/messages/${id}`); return response.data; }
};

// ==================== STATS SERVICE ====================
export const statsService = {
  async getGlobalStats() { const response = await api.get('/stats/global'); return response.data; },
  async getVendorStats(vendorId) { const response = await api.get(`/stats/vendor/${vendorId}`); return response.data; },
  async getProductStats(productId) { const response = await api.get(`/stats/product/${productId}`); return response.data; }
};

// ==================== EXPORT PAR DÉFAUT ====================
export default api;
