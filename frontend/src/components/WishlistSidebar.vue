<!-- src/components/WishlistSidebar.vue - DESIGN PREMIUM AVEC AMIRI - SANS EMOJI -->
<template>
  <div>
    <transition name="overlay">
      <div v-if="isSidebarOpen" class="wishlist-overlay" :class="{ 'dark-mode': isDarkMode }" @click="closeSidebar"></div>
    </transition>

    <transition name="slide">
      <aside v-if="isSidebarOpen" class="wishlist-sidebar" :class="{ 'dark-mode': isDarkMode }">
        <div class="wishlist-header">
          <h3>
            <span class="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="1.5"/>
              </svg>
            </span>
            المفضلة
          </h3>
          <button @click="closeSidebar" class="close-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="wishlist-loading">
          <div class="loading-spinner"></div>
          <p>جاري التحميل</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="likedProducts.length === 0" class="wishlist-empty">
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
            <div v-for="item in likedProducts" :key="item.id" class="wishlist-item">
              <!-- Product Image -->
              <div class="item-image-wrapper" @click="goToProduct(item.id)">
                <img
                  :src="getProductImage(item)"
                  :alt="getProductName(item)"
                  class="item-image"
                  @error="handleImageError"
                />
                <div v-if="getDiscountPercentage(item)" class="discount-badge">
                  -{{ getDiscountPercentage(item) }}%
                </div>
              </div>

              <!-- Product Details -->
              <div class="item-details">
                <h4 class="item-name" @click="goToProduct(item.id)">
                  {{ getProductName(item) }}
                </h4>

                <!-- Vendor Info -->
                <div class="item-vendor">
                  <span class="vendor-name">{{ getVendorName(item) }}</span>
                  <span v-if="isVendorVerified(item)" class="verified-badge" title="حرفي موثوق">✓</span>
                </div>

                <!-- Price -->
                <div class="item-price">
                  <span class="current-price">{{ formatPrice(item.price) }} <span class="currency">د.ت</span></span>
                  <span v-if="hasOriginalPrice(item)" class="original-price">
                    {{ formatPrice(getOriginalPrice(item)) }} <span class="currency">د.ت</span>
                  </span>
                </div>

                <!-- Rating -->
                <div class="item-rating" v-if="hasRating(item)">
                  <div class="stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= getFullStars(item.rating) }">★</span>
                  </div>
                  <span class="rating-text">{{ item.rating?.toFixed(1) || '0' }} ({{ getReviewsCount(item) }})</span>
                </div>

                <!-- Actions -->
                <div class="item-actions">
                  <button
                    class="btn-add-cart"
                    @click="addToCart(item)"
                    :disabled="isAddingToCart(item.id)"
                  >
                    <span v-if="!isAddingToCart(item.id)">
                      <span class="btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      </span>
                      أضف للسلة
                    </span>
                    <span v-else class="loading-spinner-small"></span>
                  </button>
                  <button
                    class="btn-remove"
                    @click="removeFromFavorites(item.id)"
                    title="إزالة من المفضلة"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Liked Date -->
              <div class="item-date" v-if="item.likedAt">
                <span class="date-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <span class="date-text">{{ formatDate(item.likedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="wishlist-footer">
            <div class="footer-stats">
              <div class="stat">
                <span class="stat-value">{{ likedProducts.length }}</span>
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
          <div class="confirm-content" :class="{ 'dark-mode': isDarkMode }">
            <div class="confirm-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const likesStore = useLikesStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const showClearConfirm = ref(false)
const isClearing = ref(false)
const addingToCartMap = ref({})
const loading = ref(false)

const isSidebarOpen = computed(() => {
  return likesStore?.isOpen || false
})

const likedProducts = computed(() => {
  return likesStore?.likedProducts || []
})

const uniqueVendors = computed(() => {
  const vendors = new Set()
  likedProducts.value.forEach(item => {
    const vendorId = item.vendorId || item.vendor?.id
    if (vendorId) {
      vendors.add(vendorId)
    }
  })
  return vendors.size
})

const getProductImage = (item) => {
  if (item.image) return item.image
  if (item.images && Array.isArray(item.images) && item.images.length > 0) return item.images[0]
  if (item.mainImage) return item.mainImage
  if (item.thumbnail) return item.thumbnail
  if (item.picture) return item.picture
  if (item.product?.image) return item.product.image
  if (item.product?.images?.[0]) return item.product.images[0]
  if (item.post?.images?.[0]) return item.post.images[0]

  const productName = getProductName(item)
  return `https://placehold.co/300x400/08717f/white?text=${encodeURIComponent(productName.substring(0, 20))}`
}

const getProductName = (item) => {
  if (item.name) return item.name
  if (item.productName) return item.productName
  if (item.title) return item.title
  if (item.product?.name) return item.product.name
  if (item.product?.productName) return item.product.productName
  if (item.post?.productName) return item.post.productName
  if (item.post?.name) return item.post.name
  return 'منتج'
}

const getVendorName = (item) => {
  if (item.vendorName) return item.vendorName
  if (item.vendor?.name) return item.vendor.name
  if (item.vendor?.shopName) return item.vendor.shopName
  if (item.shopName) return item.shopName
  if (item.post?.vendorName) return item.post.vendorName
  if (item.post?.vendor?.name) return item.post.vendor.name
  return 'حرفي'
}

const getPrice = (item) => {
  if (item.price !== undefined && item.price !== null) return item.price
  if (item.product?.price !== undefined) return item.product.price
  if (item.post?.price !== undefined) return item.post.price
  return 0
}

const isVendorVerified = (item) => {
  return item.vendorVerified || item.vendor?.verified || false
}

const hasOriginalPrice = (item) => {
  const original = item.originalPrice || item.oldPrice || item.product?.originalPrice || item.post?.oldPrice
  const current = getPrice(item)
  return original && current && original > current
}

const getOriginalPrice = (item) => {
  return item.originalPrice || item.oldPrice || item.product?.originalPrice || item.post?.oldPrice
}

const hasRating = (item) => {
  const rating = item.rating || item.product?.rating || item.post?.rating
  return rating && rating > 0
}

const getFullStars = (rating) => {
  return Math.floor(rating || 0)
}

const getReviewsCount = (item) => {
  return item.reviews || item.reviewsCount || item.product?.reviews || item.post?.reviews || 0
}

const isAddingToCart = (productId) => {
  return addingToCartMap.value[productId] || false
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '0'
  return new Intl.NumberFormat('ar-TN').format(numPrice)
}

const getDiscountPercentage = (item) => {
  const original = item.originalPrice || item.oldPrice || item.product?.originalPrice || item.post?.oldPrice
  const current = getPrice(item)
  if (original && current && original > current) {
    return Math.round(((original - current) / original) * 100)
  }
  return null
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'اليوم'
    if (days === 1) return 'أمس'
    if (days < 7) return `منذ ${days} أيام`
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`
    return date.toLocaleDateString('ar-TN')
  } catch (e) {
    return ''
  }
}

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/300x400/08717f/white?text=منتج'
}

const closeSidebar = () => {
  if (likesStore && typeof likesStore.closeSidebar === 'function') {
    likesStore.closeSidebar()
  }
}

const goToProducts = () => {
  closeSidebar()
  router.push('/products')
}

const goToProduct = (productId) => {
  closeSidebar()
  if (productId) {
    router.push(`/product/${productId}`)
  }
}

const addToCart = async (item) => {
  if (!item || !item.id) return
  if (isAddingToCart(item.id)) return

  addingToCartMap.value[item.id] = true

  const cartItem = {
    id: item.id,
    name: getProductName(item),
    price: getPrice(item),
    image: getProductImage(item),
    quantity: 1,
    vendorName: getVendorName(item),
    vendorId: item.vendorId || item.vendor?.id
  }

  if (cartStore && typeof cartStore.addItem === 'function') {
    cartStore.addItem(cartItem)
  }

  setTimeout(() => {
    addingToCartMap.value[item.id] = false
  }, 500)
}

const removeFromFavorites = (productId) => {
  if (!productId) return

  if (likesStore && typeof likesStore.removeLike === 'function') {
    likesStore.removeLike(productId)
  }
}

const confirmClearAll = () => {
  if (likedProducts.value.length === 0) return
  showClearConfirm.value = true
}

const clearAllFavorites = async () => {
  isClearing.value = true
  showClearConfirm.value = false

  if (likesStore && typeof likesStore.clearAllLikes === 'function') {
    likesStore.clearAllLikes()
  }

  setTimeout(() => {
    isClearing.value = false
  }, 300)
}

const shareFavorites = async () => {
  const count = likedProducts.value.length
  const text = `لدي ${count} منتج${count > 1 ? 'ات' : ''} مفضل على منصة آصالة`
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
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      alert('تم نسخ الرابط')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}

onMounted(async () => {
  if (likesStore && typeof likesStore.loadFromStorage === 'function') {
    loading.value = true
    await likesStore.loadFromStorage()
    loading.value = false
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

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

.wishlist-overlay.dark-mode {
  background: rgba(0, 0, 0, 0.7);
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
  font-family: 'Amiri', 'Cairo', serif;
}

.wishlist-sidebar.dark-mode {
  background: #1e293b;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5);
}

/* ===== HEADER ===== */
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #fff5f7 0%, #f8fafc 100%);
  border-bottom: 2px solid #fecdd3;
  flex-shrink: 0;
}

.wishlist-sidebar.dark-mode .wishlist-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom-color: #334155;
}

.wishlist-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  font-family: 'Amiri', serif;
}

.wishlist-sidebar.dark-mode .wishlist-header h3 {
  color: #f1f5f9;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: heartBeat 1.5s ease infinite;
}

.header-icon svg {
  width: 24px;
  height: 24px;
  stroke: #d40025;
  fill: none;
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
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.wishlist-sidebar.dark-mode .close-btn {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.close-btn svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
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

.wishlist-sidebar.dark-mode .wishlist-loading p {
  color: #cbd5e1;
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

.wishlist-sidebar.dark-mode .loading-spinner {
  border-color: #334155;
  border-top-color: #ff6b6b;
  border-right-color: #2dd4bf;
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

.wishlist-sidebar.dark-mode .empty-icon {
  background: #0f172a;
  color: #475569;
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
  font-family: 'Amiri', serif;
}

.wishlist-sidebar.dark-mode .wishlist-empty h4 {
  color: #f1f5f9;
}

.wishlist-empty p {
  color: #64748b;
  margin-bottom: 30px;
  font-size: 0.95rem;
  max-width: 250px;
}

.wishlist-sidebar.dark-mode .wishlist-empty p {
  color: #94a3b8;
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
  font-family: 'Amiri', serif;
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

.wishlist-sidebar.dark-mode .wishlist-item {
  background: #0f172a;
  border-color: #334155;
}

.wishlist-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #d40025;
}

.wishlist-sidebar.dark-mode .wishlist-item:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border-color: #ff6b6b;
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
  font-family: 'Amiri', serif;
}

.wishlist-sidebar.dark-mode .item-name {
  color: #f1f5f9;
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

.wishlist-sidebar.dark-mode .vendor-name {
  color: #94a3b8;
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

.wishlist-sidebar.dark-mode .current-price {
  color: #ff6b6b;
}

.original-price {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.currency {
  font-size: 0.7rem;
  font-weight: 500;
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
  color: #cbd5e1;
}

.wishlist-sidebar.dark-mode .star {
  color: #475569;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.75rem;
  color: #64748b;
}

.wishlist-sidebar.dark-mode .rating-text {
  color: #94a3b8;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
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

.wishlist-sidebar.dark-mode .btn-remove {
  background: #334155;
  border-color: #475569;
  color: #94a3b8;
}

.btn-remove svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.btn-remove:hover {
  background: #fee2e2;
  border-color: #d40025;
  color: #d40025;
  transform: rotate(90deg);
}

.wishlist-sidebar.dark-mode .btn-remove:hover {
  background: rgba(212, 0, 37, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
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

.wishlist-sidebar.dark-mode .item-date {
  background: rgba(15, 23, 42, 0.9);
  border-color: #334155;
  color: #94a3b8;
}

.date-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-icon svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}

/* ===== FOOTER ===== */
.wishlist-footer {
  padding: 20px 25px;
  background: white;
  border-top: 2px solid #f1f5f9;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
}

.wishlist-sidebar.dark-mode .wishlist-footer {
  background: #1e293b;
  border-top-color: #334155;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.2);
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

.wishlist-sidebar.dark-mode .stat-value {
  color: #ff6b6b;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.wishlist-sidebar.dark-mode .stat-label {
  color: #94a3b8;
}

.stat-divider {
  width: 2px;
  height: 30px;
  background: #e2e8f0;
}

.wishlist-sidebar.dark-mode .stat-divider {
  background: #334155;
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
  font-family: 'Amiri', serif;
}

.btn-clear {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.wishlist-sidebar.dark-mode .btn-clear {
  background: #334155;
  border-color: #475569;
  color: #94a3b8;
}

.btn-clear:hover:not(:disabled) {
  background: #fee2e2;
  color: #d40025;
  border-color: #d40025;
}

.wishlist-sidebar.dark-mode .btn-clear:hover:not(:disabled) {
  background: rgba(212, 0, 37, 0.2);
  color: #ff6b6b;
  border-color: #ff6b6b;
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

.confirm-content.dark-mode {
  background: #1e293b;
}

.confirm-icon {
  margin-bottom: 15px;
  animation: bounce 0.5s ease;
  display: flex;
  justify-content: center;
}

.confirm-icon svg {
  width: 40px;
  height: 40px;
  stroke: #f59e0b;
}

.confirm-content h4 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
  font-family: 'Amiri', serif;
}

.confirm-content.dark-mode h4 {
  color: #f1f5f9;
}

.confirm-content p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.confirm-content.dark-mode p {
  color: #94a3b8;
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
  font-family: 'Amiri', serif;
}

.btn-confirm-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-content.dark-mode .btn-confirm-cancel {
  background: #334155;
  color: #cbd5e1;
}

.btn-confirm-cancel:hover {
  background: #e2e8f0;
}

.confirm-content.dark-mode .btn-confirm-cancel:hover {
  background: #475569;
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

.wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-track {
  background: #0f172a;
}

.wishlist-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-thumb {
  background: #475569;
}

.wishlist-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-thumb:hover {
  background: #64748b;
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
/* ===== DARK MODE UNIFORMISÉ POUR WISHLIST SIDEBAR ===== */
/* Ajoutez à la fin du <style scoped> */

/* Sidebar */
.wishlist-sidebar.dark-mode {
  background: #1e1e30 !important;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5) !important;
}

/* Header */
.wishlist-sidebar.dark-mode .wishlist-header {
  background: linear-gradient(135deg, #121220 0%, #1a1a2e 100%) !important;
  border-bottom-color: #2a2a40 !important;
}

.wishlist-sidebar.dark-mode .wishlist-header h3 {
  color: #f1f5f9 !important;
}

.wishlist-sidebar.dark-mode .close-btn {
  background: #2a2a40 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .close-btn:hover {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
}

/* Loading */
.wishlist-sidebar.dark-mode .wishlist-loading p {
  color: #94a3b8 !important;
}

/* Empty */
.wishlist-sidebar.dark-mode .empty-icon {
  background: #121220 !important;
  color: #2a2a40 !important;
}

.wishlist-sidebar.dark-mode .wishlist-empty h4 {
  color: #f1f5f9 !important;
}

.wishlist-sidebar.dark-mode .wishlist-empty p {
  color: #94a3b8 !important;
}

/* Items */
.wishlist-sidebar.dark-mode .wishlist-item {
  background: #121220 !important;
  border-color: #2a2a40 !important;
}

.wishlist-sidebar.dark-mode .wishlist-item:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3) !important;
  border-color: #ef4444 !important;
}

.wishlist-sidebar.dark-mode .item-name {
  color: #f1f5f9 !important;
}

.wishlist-sidebar.dark-mode .item-name:hover {
  color: #ef4444 !important;
}

.wishlist-sidebar.dark-mode .vendor-name {
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .current-price {
  color: #ef4444 !important;
}

.wishlist-sidebar.dark-mode .star {
  color: #2a2a40 !important;
}

.wishlist-sidebar.dark-mode .rating-text {
  color: #94a3b8 !important;
}

/* Bouton supprimer */
.wishlist-sidebar.dark-mode .btn-remove {
  background: #2a2a40 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .btn-remove:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

/* Date */
.wishlist-sidebar.dark-mode .item-date {
  background: rgba(18, 18, 32, 0.95) !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

/* Footer */
.wishlist-sidebar.dark-mode .wishlist-footer {
  background: #121220 !important;
  border-top-color: #2a2a40 !important;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3) !important;
}

.wishlist-sidebar.dark-mode .stat-value {
  color: #ef4444 !important;
}

.wishlist-sidebar.dark-mode .stat-label {
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .stat-divider {
  background: #2a2a40 !important;
}

/* Footer buttons */
.wishlist-sidebar.dark-mode .btn-clear {
  background: #2a2a40 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .btn-clear:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #ef4444 !important;
  border-color: #ef4444 !important;
}

/* Confirm modal */
.wishlist-sidebar.dark-mode .confirm-content {
  background: #1e1e30 !important;
}

.wishlist-sidebar.dark-mode .confirm-content h4 {
  color: #f1f5f9 !important;
}

.wishlist-sidebar.dark-mode .confirm-content p {
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .btn-confirm-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.wishlist-sidebar.dark-mode .btn-confirm-cancel:hover {
  background: #3a3a55 !important;
}

/* Scrollbar */
.wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-track {
  background: #121220 !important;
}

.wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-thumb {
  background: #2a2a40 !important;
}

/* Overlay */
.wishlist-sidebar.dark-mode .wishlist-overlay {
  background: rgba(0, 0, 0, 0.8) !important;
}
/* ============================================
   📱 WISHLIST SIDEBAR - DESIGN MOBILE COMPLET
   Ultra Moderne • Premium • WAAW
============================================ */

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== SIDEBAR PLEINE LARGEUR ===== */
  .wishlist-sidebar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 100vh !important;
    height: 100dvh !important;
    border-radius: 0 !important;
    animation: slideInMobile 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  @keyframes slideInMobile {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  /* ===== OVERLAY ===== */
  .wishlist-overlay {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(6px) !important;
    -webkit-backdrop-filter: blur(6px) !important;
  }

  .wishlist-overlay.dark-mode {
    background: rgba(0, 0, 0, 0.8) !important;
  }

  /* ===== HEADER ===== */
  .wishlist-header {
    padding: 16px 20px !important;
    padding-top: calc(16px + env(safe-area-inset-top, 0px)) !important;
    min-height: 60px !important;
  }

  .wishlist-header h3 {
    font-size: 18px !important;
    gap: 8px !important;
  }

  .header-icon svg {
    width: 22px !important;
    height: 22px !important;
  }

  .close-btn {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
    border-width: 1.5px !important;
  }

  .close-btn svg {
    width: 16px !important;
    height: 16px !important;
  }

  .close-btn:active {
    background: #ef4444 !important;
    color: #ffffff !important;
    transform: rotate(90deg) scale(0.9) !important;
  }

  /* ===== LOADING ===== */
  .wishlist-loading {
    padding: 60px 20px !important;
  }

  .loading-spinner {
    width: 44px !important;
    height: 44px !important;
    border-width: 3px !important;
  }

  /* ===== EMPTY STATE ===== */
  .wishlist-empty {
    padding: 40px 24px !important;
  }

  .empty-icon {
    width: 100px !important;
    height: 100px !important;
    margin-bottom: 20px !important;
  }

  .empty-icon svg {
    width: 50px !important;
    height: 50px !important;
  }

  .wishlist-empty h4 {
    font-size: 20px !important;
  }

  .wishlist-empty p {
    font-size: 14px !important;
  }

  .btn-shop {
    padding: 12px 28px !important;
    font-size: 15px !important;
    border-radius: 30px !important;
    min-height: 48px !important;
  }

  .btn-shop:active {
    transform: scale(0.96) !important;
  }

  /* ===== WISHLIST ITEMS ===== */
  .wishlist-items {
    padding: 14px !important;
    gap: 12px !important;
  }

  .wishlist-item {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    padding: 14px !important;
    border-radius: 14px !important;
    gap: 12px !important;
  }

  .wishlist-item:active {
    transform: scale(0.98) !important;
    background: #f1f5f9 !important;
  }

  .wishlist-sidebar.dark-mode .wishlist-item:active {
    background: #1a1a2e !important;
  }

  /* Image */
  .item-image-wrapper {
    width: 140px !important;
    height: 140px !important;
    border-radius: 12px !important;
    margin: 0 auto !important;
  }

  .discount-badge {
    top: 6px !important;
    right: 6px !important;
    padding: 3px 8px !important;
    font-size: 11px !important;
    border-radius: 10px !important;
  }

  /* Details */
  .item-details {
    width: 100% !important;
    text-align: center !important;
  }

  .item-name {
    font-size: 15px !important;
    white-space: normal !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-align: center !important;
  }

  .item-vendor {
    justify-content: center !important;
    margin-bottom: 6px !important;
  }

  .vendor-name {
    font-size: 13px !important;
  }

  .item-price {
    justify-content: center !important;
    gap: 8px !important;
    margin-bottom: 6px !important;
  }

  .current-price {
    font-size: 18px !important;
  }

  .original-price {
    font-size: 13px !important;
  }

  /* Rating */
  .item-rating {
    justify-content: center !important;
    margin-bottom: 10px !important;
  }

  .star {
    font-size: 14px !important;
  }

  .rating-text {
    font-size: 12px !important;
  }

  /* Actions */
  .item-actions {
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
  }

  .btn-add-cart {
    width: 100% !important;
    padding: 12px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    min-height: 44px !important;
    justify-content: center !important;
  }

  .btn-add-cart:active:not(:disabled) {
    transform: scale(0.96) !important;
  }

  .btn-remove {
    width: 100% !important;
    height: 40px !important;
    border-radius: 10px !important;
    min-height: 40px !important;
  }

  .btn-remove:active {
    background: #ef4444 !important;
    color: #ffffff !important;
    transform: scale(0.96) !important;
  }

  .btn-remove svg {
    width: 16px !important;
    height: 16px !important;
  }

  /* Date */
  .item-date {
    position: static !important;
    margin-top: 6px !important;
    justify-content: center !important;
    padding: 4px 10px !important;
    border-radius: 20px !important;
    font-size: 11px !important;
  }

  /* ===== FOOTER ===== */
  .wishlist-footer {
    padding: 14px 16px !important;
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .footer-stats {
    gap: 20px !important;
    margin-bottom: 14px !important;
  }

  .stat-value {
    font-size: 22px !important;
  }

  .stat-label {
    font-size: 12px !important;
  }

  .stat-divider {
    height: 24px !important;
  }

  .footer-actions {
    flex-direction: column !important;
    gap: 8px !important;
  }

  .btn-clear,
  .btn-share {
    width: 100% !important;
    padding: 12px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    min-height: 44px !important;
  }

  .btn-clear:active:not(:disabled) {
    background: #fee2e2 !important;
    color: #ef4444 !important;
    transform: scale(0.96) !important;
  }

  .btn-share:active {
    transform: scale(0.96) !important;
  }

  /* ===== CONFIRM MODAL ===== */
  .confirm-modal {
    padding: 20px !important;
  }

  .confirm-content {
    width: 90% !important;
    max-width: 320px !important;
    padding: 24px !important;
    border-radius: 20px !important;
  }

  .confirm-icon svg {
    width: 36px !important;
    height: 36px !important;
  }

  .confirm-content h4 {
    font-size: 18px !important;
  }

  .confirm-content p {
    font-size: 14px !important;
  }

  .confirm-actions {
    gap: 10px !important;
  }

  .btn-confirm-cancel,
  .btn-confirm-delete {
    padding: 12px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    min-height: 44px !important;
  }

  .btn-confirm-delete:active {
    transform: scale(0.96) !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 400px) ----- */
@media (max-width: 400px) {
  .wishlist-header {
    padding: 12px 14px !important;
  }

  .wishlist-header h3 {
    font-size: 16px !important;
  }

  .item-image-wrapper {
    width: 120px !important;
    height: 120px !important;
  }

  .item-name {
    font-size: 14px !important;
  }

  .current-price {
    font-size: 16px !important;
  }

  .empty-icon {
    width: 80px !important;
    height: 80px !important;
  }

  .empty-icon svg {
    width: 40px !important;
    height: 40px !important;
  }

  .wishlist-empty h4 {
    font-size: 18px !important;
  }

  .footer-stats {
    gap: 14px !important;
  }

  .stat-value {
    font-size: 20px !important;
  }
}

/* ===== PAYSAGE MOBILE ===== */
@media (max-width: 768px) and (orientation: landscape) {
  .wishlist-item {
    flex-direction: row !important;
    align-items: flex-start !important;
    text-align: right !important;
  }

  .item-image-wrapper {
    width: 100px !important;
    height: 100px !important;
    margin: 0 !important;
  }

  .item-details {
    text-align: right !important;
  }

  .item-vendor,
  .item-price,
  .item-rating {
    justify-content: flex-start !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .wishlist-sidebar {
    height: -webkit-fill-available !important;
  }

  .wishlist-header {
    padding-top: calc(16px + env(safe-area-inset-top, 0px)) !important;
  }

  .wishlist-footer {
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

/* ===== OPTIMISATION TACTILE ===== */
@media (hover: none) and (pointer: coarse) {
  .wishlist-item,
  .close-btn,
  .btn-add-cart,
  .btn-remove,
  .btn-shop,
  .btn-clear,
  .btn-share,
  .btn-confirm-cancel,
  .btn-confirm-delete {
    cursor: pointer !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .btn-add-cart,
  .btn-remove,
  .btn-shop,
  .btn-clear,
  .btn-share {
    min-height: 44px !important;
  }

  /* Désactiver les animations hover */
  .wishlist-item:hover {
    transform: none !important;
  }

  .item-image-wrapper:hover .item-image {
    transform: none !important;
  }

  .close-btn:hover {
    transform: none !important;
  }
}

/* ===== SCROLLBAR MOBILE ===== */
@media (max-width: 768px) {
  .wishlist-items::-webkit-scrollbar {
    width: 3px !important;
  }

  .wishlist-items::-webkit-scrollbar-track {
    background: transparent !important;
  }

  .wishlist-items::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1) !important;
    border-radius: 3px !important;
  }

  .wishlist-sidebar.dark-mode .wishlist-items::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

/* ===== ANIMATIONS RÉDUITES ===== */
@media (prefers-reduced-motion: reduce) {
  .wishlist-sidebar,
  .wishlist-sidebar * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .empty-icon {
    animation: none !important;
  }

  .header-icon {
    animation: none !important;
  }
}
</style>
