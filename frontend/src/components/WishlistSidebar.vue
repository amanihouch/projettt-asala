<!-- src/components/WishlistSidebar.vue -->
<template>
  <transition name="overlay">
    <div v-if="likesStore.isOpen" class="wishlist-overlay" @click="likesStore.closeSidebar()"></div>
  </transition>

  <transition name="slide">
    <aside v-if="likesStore.isOpen" class="wishlist-sidebar">
      <div class="wishlist-header">
        <h3>
          <span class="header-icon">❤️</span>
          المفضلة
        </h3>
        <button @click="likesStore.closeSidebar()" class="close-btn">✕</button>
      </div>

      <!-- Loading State -->
      <div v-if="likesStore.loading" class="wishlist-loading">
        <div class="loading-spinner"></div>
        <p>جاري التحميل...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="likesStore.likedProducts.length === 0" class="wishlist-empty">
        <div class="empty-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h4>المفضلة فارغة</h4>
        <p>أضف منتجات إلى المفضلة وستظهر هنا</p>
        <button class="btn-shop" @click="goToProducts">
          تصفح المنتجات
        </button>
      </div>

      <!-- Favorites List -->
      <div v-else class="wishlist-content">
        <div class="wishlist-items">
          <div v-for="item in likesStore.likedProducts" :key="item.id" class="wishlist-item">
            <!-- Product Image -->
            <div class="item-image-wrapper" @click="goToProduct(item.id)">
              <img :src="item.image || 'https://via.placeholder.com/300'" :alt="item.name" class="item-image" />
              <div v-if="item.discount" class="discount-badge">-{{ item.discount }}%</div>
            </div>

            <!-- Product Details -->
            <div class="item-details">
              <h4 class="item-name" @click="goToProduct(item.id)">{{ item.name }}</h4>
              
              <!-- Vendor Info -->
              <div class="item-vendor" v-if="item.vendor">
                <span class="vendor-name">{{ item.vendor.name || 'بائع' }}</span>
                <span v-if="item.vendor.verified" class="verified-badge" title="حرفي موثوق">✓</span>
              </div>

              <!-- Price -->
              <div class="item-price">
                <span class="current-price">{{ formatPrice(item.price) }} د.ت</span>
                <span v-if="item.originalPrice" class="original-price">{{ formatPrice(item.originalPrice) }} د.ت</span>
              </div>

              <!-- Rating -->
              <div class="item-rating" v-if="item.rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.floor(item.rating) }">⭐</span>
                </div>
                <span class="rating-text">{{ item.rating.toFixed(1) }} ({{ item.reviews || 0 }})</span>
              </div>

              <!-- Actions -->
              <div class="item-actions">
                <button class="btn-add-cart" @click="addToCart(item)" :disabled="isAddingToCart[item.id]">
                  <span v-if="!isAddingToCart[item.id]">
                    <span class="btn-icon">🛒</span>
                    أضف للسلة
                  </span>
                  <span v-else class="loading-spinner-small"></span>
                </button>
                <button class="btn-remove" @click="removeFromFavorites(item.id)" title="إزالة من المفضلة">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Liked Date -->
            <div class="item-date" v-if="item.likedAt">
              <span class="date-icon">📅</span>
              <span class="date-text">{{ formatDate(item.likedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="wishlist-footer">
          <div class="footer-stats">
            <div class="stat">
              <span class="stat-value">{{ likesStore.likesCount }}</span>
              <span class="stat-label">منتج مفضل</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ uniqueVendors }}</span>
              <span class="stat-label">حرفي</span>
            </div>
          </div>

          <div class="footer-actions">
            <button class="btn-clear" @click="confirmClearAll" :disabled="isClearing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>مسح الكل</span>
            </button>
            <button class="btn-share" @click="shareFavorites">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Clear All Confirmation Modal -->
      <div v-if="showClearConfirm" class="confirm-modal" @click.self="showClearConfirm = false">
        <div class="confirm-content">
          <div class="confirm-icon">⚠️</div>
          <h4>تأكيد الحذف</h4>
          <p>هل أنت متأكد من حذف جميع المنتجات المفضلة؟</p>
          <div class="confirm-actions">
            <button class="btn-confirm-cancel" @click="showClearConfirm = false">إلغاء</button>
            <button class="btn-confirm-delete" @click="clearAllFavorites">حذف الكل</button>
          </div>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const likesStore = useLikesStore()
const cartStore = useCartStore()

// ===== STATE =====
const showClearConfirm = ref(false)
const isClearing = ref(false)
const isAddingToCart = ref({})

// ===== COMPUTED =====
const uniqueVendors = computed(() => {
  const vendors = new Set()
  likesStore.likedProducts.forEach(item => {
    if (item.vendor?.id) {
      vendors.add(item.vendor.id)
    } else if (item.vendorName) {
      vendors.add(item.vendorName)
    }
  })
  return vendors.size
})

// ===== METHODS =====
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 7) return `منذ ${days} أيام`
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`
  return date.toLocaleDateString('ar-TN')
}

const goToProducts = () => {
  likesStore.closeSidebar()
  router.push('/products')
}

const goToProduct = (productId) => {
  likesStore.closeSidebar()
  router.push(`/product/${productId}`)
}

const addToCart = async (item) => {
  // Marquer comme en cours d'ajout
  isAddingToCart.value[item.id] = true

  // Créer l'objet pour le panier
  const cartItem = {
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: 1,
    vendorName: item.vendor?.name || item.vendorName || 'بائع'
  }

  // Ajouter au panier
  cartStore.addItem(cartItem)
  
  // Réinitialiser l'état après un délai
  setTimeout(() => {
    isAddingToCart.value[item.id] = false
  }, 500)
}

const removeFromFavorites = (productId) => {
  likesStore.removeLike(productId)
}

const confirmClearAll = () => {
  showClearConfirm.value = true
}

const clearAllFavorites = async () => {
  isClearing.value = true
  showClearConfirm.value = false
  
  // Simuler un délai pour l'animation
  setTimeout(() => {
    likesStore.clearAllLikes()
    isClearing.value = false
  }, 300)
}

const shareFavorites = async () => {
  const text = `لدي ${likesStore.likesCount} منتجات مفضلة على منصة توراث!`
  const url = window.location.origin + '/favorites'
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'منتجاتي المفضلة',
        text: text,
        url: url
      })
    } catch (err) {
      console.log('Share cancelled:', err)
    }
  } else {
    // Fallback: copier le lien
    try {
      await navigator.clipboard.writeText(url)
      alert('تم نسخ الرابط')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}
</script>

<style scoped>
/* ===== OVERLAY ===== */
.wishlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

/* ===== SIDEBAR ===== */
.wishlist-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-width: 450px;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

/* ===== HEADER ===== */
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #fff5f7 0%, #f8fafc 100%);
  border-bottom: 2px solid #fecdd3;
}

.wishlist-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.header-icon {
  font-size: 1.5rem;
  animation: heartBeat 1.5s ease infinite;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.close-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #fecdd3;
  border-radius: 12px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.close-btn:hover {
  background: #d40025;
  border-color: #d40025;
  color: white;
  transform: rotate(90deg);
}

/* ===== LOADING STATE ===== */
.wishlist-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #d40025;
  border-right: 4px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== EMPTY STATE ===== */
.wishlist-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 30px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  margin-bottom: 25px;
  color: #cbd5e1;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.empty-icon svg {
  width: 60px;
  height: 60px;
}

.wishlist-empty h4 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.wishlist-empty p {
  color: #64748b;
  margin-bottom: 30px;
  font-size: 0.95rem;
  max-width: 250px;
}

.btn-shop {
  padding: 14px 35px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-shop:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(8, 113, 127, 0.4);
}

/* ===== WISHLIST CONTENT ===== */
.wishlist-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* ===== WISHLIST ITEM ===== */
.wishlist-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.wishlist-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #d40025;
}

/* Image */
.item-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.item-image-wrapper:hover .item-image {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #d40025;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(212, 0, 37, 0.3);
}

/* Details */
.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.item-name:hover {
  color: #d40025;
}

.item-vendor {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.vendor-name {
  font-size: 0.8rem;
  color: #64748b;
}

.verified-badge {
  width: 16px;
  height: 16px;
  background: #08717f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

/* Price */
.item-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.current-price {
  font-size: 1.1rem;
  font-weight: 800;
  color: #d40025;
}

.original-price {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
}

/* Rating */
.item-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
  color: #fbbf24;
}

.rating-text {
  font-size: 0.75rem;
  color: #64748b;
}

/* Actions */
.item-actions {
  display: flex;
  gap: 8px;
}

.btn-add-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-cart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-add-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 0.9rem;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.btn-remove {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: #fee2e2;
  border-color: #d40025;
  color: #d40025;
  transform: rotate(90deg);
}

/* Item Date */
.item-date {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.9);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.date-icon {
  font-size: 0.7rem;
}

/* ===== FOOTER ===== */
.wishlist-footer {
  padding: 20px 25px;
  background: white;
  border-top: 2px solid #f1f5f9;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.03);
}

.footer-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #d40025;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.stat-divider {
  width: 2px;
  height: 30px;
  background: #e2e8f0;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-clear,
.btn-share {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-clear:hover:not(:disabled) {
  background: #fee2e2;
  color: #d40025;
  border-color: #d40025;
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-share {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-share:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* ===== CONFIRM MODAL ===== */
.confirm-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.confirm-content {
  background: white;
  border-radius: 24px;
  padding: 30px;
  max-width: 320px;
  text-align: center;
  animation: slideUp 0.3s ease;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: bounce 0.5s ease;
}

.confirm-content h4 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.confirm-content p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-confirm-cancel,
.btn-confirm-delete {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-confirm-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm-delete {
  background: #d40025;
  color: white;
}

.btn-confirm-delete:hover {
  background: #b00020;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.3);
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* ===== TRANSITIONS ===== */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* ===== SCROLLBAR ===== */
.wishlist-items::-webkit-scrollbar {
  width: 6px;
}

.wishlist-items::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.wishlist-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.wishlist-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .wishlist-sidebar {
    max-width: 100%;
  }
  
  .wishlist-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .item-image-wrapper {
    width: 150px;
    height: 150px;
  }
  
  .item-details {
    width: 100%;
  }
  
  .item-vendor {
    justify-content: center;
  }
  
  .item-price {
    justify-content: center;
  }
  
  .item-rating {
    justify-content: center;
  }
  
  .item-actions {
    flex-direction: column;
  }
  
  .btn-remove {
    width: 100%;
  }
  
  .footer-stats {
    gap: 20px;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .item-date {
    position: static;
    margin-top: 10px;
    justify-content: center;
  }
}
</style>