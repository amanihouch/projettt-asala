<!-- QuickViewModal.vue - Version Finale avec Police Amiri -->
<template>
  <!-- Modal Overlay -->
  <transition name="modal-fade">
    <div v-if="isVisible" class="quick-view-modal" :class="{ 'dark-mode': isDarkMode }" @click.self="closeModal">
      <!-- Modal Content -->
      <div class="modal-container" :class="{ 'modal-loading': isLoading }">
        <!-- Close Button -->
        <button class="modal-close-btn" @click="closeModal" aria-label="إغلاق">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>جاري تحميل المنتج...</p>
        </div>

        <!-- Product Content -->
        <div v-else-if="product" class="product-content">
          <!-- Product Gallery -->
          <div class="product-gallery">
            <!-- Main Image -->
            <div class="main-image">
              <img
                :src="currentImage"
                :alt="product.name || product.productName"
                class="gallery-image"
                @load="imageLoaded"
              />
              <!-- Image Badges -->
              <div class="image-badges">
                <span v-if="isNewProduct" class="badge new-badge">🆕 جديد</span>
                <span v-if="hasDiscount" class="badge discount-badge">
                  ⚡ {{ discountPercentage }}% خصم
                </span>
                <span v-if="product.isSponsored" class="badge featured-badge">✨ مميز</span>
              </div>
            </div>

            <!-- Thumbnails -->
            <div v-if="productImages.length > 1" class="thumbnails">
              <button
                v-for="(img, index) in productImages"
                :key="index"
                class="thumbnail-btn"
                :class="{ active: currentImageIndex === index }"
                @click="changeImage(index)"
                :aria-label="`عرض الصورة ${index + 1}`"
              >
                <img :src="img" :alt="`صورة ${index + 1}`" />
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="product-details">
            <!-- Product Header -->
            <div class="product-header">
              <!-- Breadcrumb -->
              <div class="breadcrumb">
                <span class="breadcrumb-item" @click="goToProducts">المنتجات</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item" @click="goToCategory(product.category)">
                  {{ getCategoryName(product.category) }}
                </span>
              </div>

              <!-- Product Title -->
              <h1 class="product-title">{{ product.name || product.productName }}</h1>

              <!-- Vendor Info -->
              <div class="vendor-section">
                <div class="vendor-info" @click="visitVendor">
                  <img
                    :src="getVendorAvatar()"
                    :alt="getVendorName()"
                    class="vendor-avatar"
                    @error="handleAvatarError"
                  />
                  <div class="vendor-details">
                    <span class="vendor-name">{{ getVendorName() }}</span>
                    <div class="vendor-verification">
                      <span v-if="isVendorVerified" class="verified-badge">
                        <svg viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                          <path
                            d="M8 12l3 3 5-6"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </svg>
                        حرفي موثوق
                      </span>
                      <span class="vendor-rating"> ⭐ {{ vendorRating }} </span>
                    </div>
                  </div>
                </div>
                <button v-if="vendorId" class="visit-vendor-btn" @click="visitVendor">
                  زيارة المتجر
                </button>
              </div>
            </div>

            <!-- Product Rating & Stats -->
            <div class="product-stats">
              <div class="rating-section">
                <div class="rating-stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{
                      filled: i <= Math.floor(productRating),
                      half: i === Math.ceil(productRating) && productRating % 1 !== 0,
                    }"
                  >
                    ★
                  </span>
                </div>
                <div class="rating-details">
                  <span class="rating-value">{{ productRating.toFixed(1) }}</span>
                  <span class="reviews-count">({{ productReviews || 0 }} تقييم)</span>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-icon">🔥</span>
                  <span class="stat-value">{{ productSold || 0 }}</span>
                  <span class="stat-label">مبيع</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">📦</span>
                  <span class="stat-value">{{ productStock || 'متوفر' }}</span>
                  <span class="stat-label">متوفر</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">🚚</span>
                  <span class="stat-value">2-3</span>
                  <span class="stat-label">أيام شحن</span>
                </div>
              </div>
            </div>

            <!-- Product Description -->
            <div class="description-section">
              <h3 class="section-title">وصف المنتج</h3>
              <p class="product-description">
                {{ product.description || product.fullDescription || 'لا يوجد وصف' }}
              </p>
            </div>

            <!-- Product Options -->
            <div v-if="hasOptions" class="options-section">
              <h3 class="section-title">خيارات المنتج</h3>

              <!-- Color Options -->
              <div v-if="productColors.length > 0" class="option-group">
                <label class="option-label">اللون:</label>
                <div class="color-options">
                  <button
                    v-for="color in productColors"
                    :key="color.name"
                    class="color-option"
                    :class="{
                      selected: selectedColor === color.name,
                      unavailable: !color.available,
                    }"
                    :style="{ backgroundColor: color.code }"
                    @click="selectColor(color)"
                    :title="color.name"
                    :disabled="!color.available"
                  >
                    <span class="color-check" v-if="selectedColor === color.name">✓</span>
                  </button>
                </div>
              </div>

              <!-- Size Options -->
              <div v-if="productSizes.length > 0" class="option-group">
                <label class="option-label">المقاس:</label>
                <div class="size-options">
                  <button
                    v-for="size in productSizes"
                    :key="size"
                    class="size-option"
                    :class="{
                      selected: selectedSize === size,
                      unavailable: !isSizeAvailable(size),
                    }"
                    @click="selectSize(size)"
                    :disabled="!isSizeAvailable(size)"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div class="quantity-section">
                <label class="option-label">الكمية:</label>
                <div class="quantity-selector">
                  <button
                    class="quantity-btn decrease"
                    @click="decreaseQuantity"
                    :disabled="quantity <= 1"
                  >
                    -
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="productStock || 99"
                    class="quantity-input"
                    @change="validateQuantity"
                  />
                  <button
                    class="quantity-btn increase"
                    @click="increaseQuantity"
                    :disabled="quantity >= (productStock || 99)"
                  >
                    +
                  </button>
                  <span class="stock-info">{{ productStock || 'متوفر' }} قطعة متوفرة</span>
                </div>
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="action-section">
              <div class="price-section">
                <div class="current-price">{{ formatPrice(calculateTotal()) }} د.ت</div>
                <div v-if="hasDiscount" class="original-price">
                  {{ formatPrice(product.originalPrice || product.oldPrice) }} د.ت
                </div>
                <div v-if="hasDiscount" class="discount-info">
                  وفر {{ formatPrice((product.originalPrice || product.oldPrice) - product.price) }} د.ت ({{
                    discountPercentage
                  }}%)
                </div>
              </div>

              <div class="action-buttons">
                <button
                  class="add-to-cart-btn primary-btn"
                  :class="{ added: isInCart }"
                  @click="addToCart"
                  :disabled="isAddingToCart"
                >
                  <span v-if="isAddingToCart" class="btn-content">
                    <div class="loading-spinner-small"></div>
                    جاري الإضافة...
                  </span>
                  <span v-else-if="isInCart" class="btn-content">
                    <svg class="check-icon" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                    مضافة إلى السلة
                  </span>
                  <span v-else class="btn-content">
                    <svg class="cart-icon" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                      <path d="M16 10a4 4 0 11-8 0" stroke="currentColor" stroke-width="2" />
                    </svg>
                    أضف إلى السلة
                  </span>
                </button>

                <button class="buy-now-btn secondary-btn" @click="buyNow">
                  <svg class="bolt-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  شراء الآن
                </button>

                <button
                  class="wishlist-btn"
                  :class="{ active: isInWishlist }"
                  @click="toggleWishlist"
                  :title="isInWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'"
                >
                  <svg class="heart-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                      :stroke="isInWishlist ? 'currentColor' : 'none'"
                      :fill="isInWishlist ? 'currentColor' : 'none'"
                      stroke-width="2"
                    />
                  </svg>
                </button>

                <button class="share-btn" @click="shareProduct" title="مشاركة المنتج">
                  <svg class="share-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <!-- Additional Info -->
              <div class="additional-info">
                <div class="info-item">
                  <svg class="info-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M12 16v-4M12 8h.01"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>ضمان استرجاع لمدة 14 يوم</span>
                </div>
                <div class="info-item">
                  <svg class="info-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>شحن مجاني للطلبات فوق 200 د.ت</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>حدث خطأ</h3>
          <p>تعذر تحميل معلومات المنتج</p>
          <button class="retry-btn" @click="retryLoad">إعادة المحاولة</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
// Script identique à la version précédente
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useThemeStore } from '../stores/theme'
import { formatAvatarUrl, formatProductImageUrl } from '../utils/image.js'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const props = defineProps({
  product: { type: Object, default: null },
  isVisible: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'add-to-cart', 'buy-now'])

const isLoading = ref(true)
const isAddingToCart = ref(false)
const currentImageIndex = ref(0)
const selectedColor = ref(null)
const selectedSize = ref(null)
const quantity = ref(1)
const isInCart = ref(false)

const productImages = computed(() => {
  if (props.product?.images && props.product.images.length > 0) {
    return props.product.images.map(image => formatProductImageUrl(image)).filter(Boolean)
  }
  if (props.product?.image) return [formatProductImageUrl(props.product.image)].filter(Boolean)
  return []
})

const currentImage = computed(() => {
  if (productImages.value.length > 0) return productImages.value[currentImageIndex.value]
  return 'https://placehold.co/600x600/08717f/white?text=منتج'
})

const productRating = computed(() => props.product?.rating || 4.5)
const productReviews = computed(() => props.product?.reviewsCount || props.product?.reviews || 0)
const productSold = computed(() => props.product?.soldCount || props.product?.sold || 0)
const productStock = computed(() => props.product?.stock || props.product?.quantity || null)
const hasDiscount = computed(() => {
  const oldPrice = props.product?.originalPrice || props.product?.oldPrice
  return oldPrice && oldPrice > props.product?.price
})
const discountPercentage = computed(() => {
  const oldPrice = props.product?.originalPrice || props.product?.oldPrice
  if (!oldPrice || oldPrice <= props.product?.price) return 0
  return Math.round(((oldPrice - props.product.price) / oldPrice) * 100)
})
const isNewProduct = computed(() => {
  if (props.product?.isNew) return true
  if (!props.product?.createdAt) return false
  const created = new Date(props.product.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})
const hasOptions = computed(() => productColors.value.length > 0 || productSizes.value.length > 0)

const vendorId = computed(() => props.product?.vendor?.id || props.product?.vendorId)
const getVendorName = () => props.product?.vendor?.name || props.product?.vendorName || 'حرفي'
const getVendorAvatar = () => {
  const avatarSource = props.product?.vendor?.avatar || props.product?.vendorAvatar
  return formatAvatarUrl(avatarSource, `https://i.pravatar.cc/100?u=${vendorId.value || 'default'}`)
}
const isVendorVerified = computed(() => props.product?.vendor?.verified || props.product?.vendorVerified || false)
const vendorRating = computed(() => props.product?.vendor?.rating || '4.5')

const productColors = computed(() => {
  if (props.product?.colors && Array.isArray(props.product.colors)) {
    return props.product.colors.map(c => ({ name: c, code: getColorCode(c), available: true }))
  }
  if (props.product?.options?.colors) return props.product.options.colors
  return []
})

const productSizes = computed(() => {
  if (props.product?.sizes && Array.isArray(props.product.sizes)) {
    return props.product.sizes.map(s => s.name || s)
  }
  if (props.product?.options?.sizes) return props.product.options.sizes
  return []
})

const getColorCode = (colorName) => {
  const colorMap = {
    أحمر: '#d40025', أزرق: '#08717f', أخضر: '#10b981', أصفر: '#fbbf24',
    بنفسجي: '#8b5cf6', وردي: '#ff69b4', أسود: '#1e293b', أبيض: '#ffffff',
    رمادي: '#64748b', بني: '#92400e',
  }
  return colorMap[colorName] || '#64748b'
}

const isSizeAvailable = (size) => {
  if (!props.product?.sizes) return true
  const sizeObj = props.product.sizes.find(s => s.name === size || s === size)
  return sizeObj ? (sizeObj.stock > 0) : true
}

const categories = {
  perfumes: 'عطور', jewelry: 'حلي و اكسسوارات', clothing: 'ملابس', decor: 'ديكور',
  textiles: 'أقمشة وسجادات', pottery: 'أواني', beauty: 'عناية وتجميل', food: 'أغذية', other: 'أخرى'
}

const getCategoryName = (category) => categories[category] || category || 'منتجات'

const goToProducts = () => { router.push('/products'); closeModal() }
const goToCategory = (category) => { if (category) { router.push(`/products?category=${category}`); closeModal() } }

const isInWishlist = computed(() => props.product?.id ? likesStore.isLiked(props.product.id) : false)

const closeModal = () => emit('close')
const imageLoaded = () => { isLoading.value = false }
const changeImage = (index) => { currentImageIndex.value = index }
const visitVendor = () => { if (vendorId.value) { router.push(`/vendor/${vendorId.value}`); closeModal() } }
const selectColor = (color) => { if (color.available) selectedColor.value = color.name }
const selectSize = (size) => { if (isSizeAvailable(size)) selectedSize.value = size }
const increaseQuantity = () => { const maxStock = productStock.value || 99; if (quantity.value < maxStock) quantity.value++ }
const decreaseQuantity = () => { if (quantity.value > 1) quantity.value-- }
const validateQuantity = () => { const maxStock = productStock.value || 99; if (quantity.value < 1) quantity.value = 1; if (quantity.value > maxStock) quantity.value = maxStock }
const calculateTotal = () => (props.product?.price || 0) * quantity.value
const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)

const addToCart = async () => {
  if (isAddingToCart.value) return
  isAddingToCart.value = true
  try {
    const cartItem = {
      id: props.product.id, name: props.product.name || props.product.productName,
      price: props.product.price, image: productImages.value[0], quantity: quantity.value,
      vendorName: getVendorName(), vendorId: vendorId.value,
      color: selectedColor.value, size: selectedSize.value,
    }
    await cartStore.addItem(cartItem)
    isInCart.value = true
    showNotification('✅ تمت إضافة المنتج إلى السلة بنجاح', 'success')
    emit('add-to-cart', cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    showNotification('❌ حدث خطأ أثناء إضافة المنتج إلى السلة', 'error')
  } finally {
    setTimeout(() => { isAddingToCart.value = false }, 500)
  }
}

const buyNow = () => {
  const cartItem = { product: props.product, color: selectedColor.value, size: selectedSize.value, quantity: quantity.value, total: calculateTotal() }
  emit('buy-now', cartItem)
  closeModal()
  router.push('/checkout')
}

const toggleWishlist = () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (props.product?.id) {
    likesStore.toggleLike(props.product)
    showNotification(isInWishlist.value ? '💔 تمت إزالة المنتج من المفضلة' : '❤️ تمت إضافة المنتج إلى المفضلة', isInWishlist.value ? 'info' : 'success')
  }
}

const shareProduct = async () => {
  const shareData = { title: props.product?.name || props.product?.productName, text: props.product?.description, url: `${window.location.origin}/product/${props.product?.id}` }
  try {
    if (navigator.share) await navigator.share(shareData)
    else { await navigator.clipboard.writeText(shareData.url); showNotification('📋 تم نسخ رابط المنتج إلى الحافظة', 'success') }
  } catch (err) { console.log('Error sharing:', err) }
}

const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div')
  notification.className = `notification-toast ${type}`
  notification.textContent = message
  notification.style.cssText = `position:fixed;top:20px;right:20px;background:${type==='success'?'#10B981':type==='error'?'#EF4444':'#3B82F6'};color:white;padding:12px 24px;border-radius:8px;z-index:10000;animation:slideIn 0.3s ease;font-family:'Amiri','Cairo',serif;`
  document.body.appendChild(notification)
  setTimeout(() => { notification.style.animation = 'slideOut 0.3s ease'; setTimeout(() => notification.remove(), 300) }, 3000)
}

const retryLoad = () => { isLoading.value = true; setTimeout(() => { isLoading.value = false }, 500) }
const handleAvatarError = (e) => { e.target.src = `https://i.pravatar.cc/100?u=${Date.now()}` }

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    isLoading.value = true
    selectedColor.value = null; selectedSize.value = null; quantity.value = 1; currentImageIndex.value = 0
    isInCart.value = cartStore.isInCart(newProduct.id)
    setTimeout(() => { isLoading.value = false }, 300)
  }
}, { immediate: true })

const handleKeydown = (e) => { if (e.key === 'Escape' && props.isVisible) closeModal() }

onMounted(() => { document.addEventListener('keydown', handleKeydown); if (props.isVisible) document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.removeEventListener('keydown', handleKeydown); document.body.style.overflow = 'auto' })
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.quick-view-modal {
  font-family: 'Amiri', 'Cairo', serif;
}

.quick-view-modal * {
  font-family: 'Amiri', 'Cairo', serif;
}

/* Base Modal Styles */
.quick-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.quick-view-modal.dark-mode {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  background: white;
  border-radius: 28px;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quick-view-modal.dark-mode .modal-container {
  background: #1e293b;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.quick-view-modal.dark-mode .modal-close-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: #334155;
  color: #f1f5f9;
}

.modal-close-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.modal-close-btn:hover {
  background: #d40025;
  border-color: #d40025;
  color: white;
  transform: rotate(90deg) scale(1.05);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  text-align: center;
}

.quick-view-modal.dark-mode .loading-state p {
  color: #cbd5e1;
}

.loading-state p {
  font-size: 1.1rem;
  font-weight: 500;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.quick-view-modal.dark-mode .loading-spinner {
  border-color: #334155;
  border-top-color: #2dd4bf;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 500px;
}

.product-gallery {
  padding: 30px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
}

.quick-view-modal.dark-mode .product-gallery {
  background: #0f172a;
  border-left-color: #334155;
}

.main-image {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  aspect-ratio: 1;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.quick-view-modal.dark-mode .main-image {
  background: #1e293b;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.main-image:hover .gallery-image {
  transform: scale(1.05);
}

.image-badges {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: flex-end;
}

.badge {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(8px);
  animation: slideInRight 0.3s ease;
}

.new-badge {
  background: linear-gradient(135deg, #08717f, #065a69);
}

.discount-badge {
  background: linear-gradient(135deg, #d40025, #b00020);
}

.featured-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
}

.thumbnail-btn {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.quick-view-modal.dark-mode .thumbnail-btn {
  border-color: #334155;
  background: #0f172a;
}

.thumbnail-btn.active {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.2);
}

.quick-view-modal.dark-mode .thumbnail-btn.active {
  border-color: #2dd4bf;
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-btn:hover {
  transform: translateY(-2px);
  border-color: #08717f;
}

.product-details {
  padding: 30px;
  overflow-y: auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  transition: color 0.3s ease;
  font-weight: 500;
}

.quick-view-modal.dark-mode .breadcrumb-item {
  color: #94a3b8;
}

.breadcrumb-item:hover {
  color: #08717f;
}

.breadcrumb-separator {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.product-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 20px;
  line-height: 1.4;
}

.quick-view-modal.dark-mode .product-title {
  color: #f1f5f9;
}

.vendor-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.quick-view-modal.dark-mode .vendor-section {
  border-color: #334155;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.vendor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-view-modal.dark-mode .vendor-avatar {
  border-color: #1e293b;
}

.vendor-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
}

.quick-view-modal.dark-mode .vendor-name {
  color: #f1f5f9;
}

.vendor-verification {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

.verified-badge svg {
  width: 14px;
  height: 14px;
}

.vendor-rating {
  font-size: 0.8rem;
  color: #f59e0b;
}

.visit-vendor-btn {
  padding: 10px 20px;
  background: transparent;
  border: 2px solid #08717f;
  border-radius: 30px;
  color: #08717f;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-view-modal.dark-mode .visit-vendor-btn {
  border-color: #2dd4bf;
  color: #2dd4bf;
}

.visit-vendor-btn:hover {
  background: #08717f;
  color: white;
}

.quick-view-modal.dark-mode .visit-vendor-btn:hover {
  background: #2dd4bf;
  color: #0f172a;
}

.product-stats {
  margin-bottom: 25px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 1.1rem;
  color: #cbd5e1;
}

.quick-view-modal.dark-mode .star {
  color: #475569;
}

.star.filled {
  color: #fbbf24;
}

.rating-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
}

.quick-view-modal.dark-mode .rating-value {
  color: #f1f5f9;
}

.reviews-count {
  font-size: 0.85rem;
  color: #64748b;
}

.quick-view-modal.dark-mode .reviews-count {
  color: #94a3b8;
}

.stats-grid {
  display: flex;
  gap: 20px;
  background: #f8fafc;
  padding: 14px 20px;
  border-radius: 16px;
}

.quick-view-modal.dark-mode .stats-grid {
  background: #0f172a;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.quick-view-modal.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.quick-view-modal.dark-mode .stat-label {
  color: #94a3b8;
}

.description-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.quick-view-modal.dark-mode .section-title {
  color: #f1f5f9;
}

.product-description {
  color: #475569;
  line-height: 1.8;
  font-size: 0.95rem;
}

.quick-view-modal.dark-mode .product-description {
  color: #cbd5e1;
}

.options-section {
  margin-bottom: 25px;
}

.option-group {
  margin-bottom: 20px;
}

.option-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.quick-view-modal.dark-mode .option-label {
  color: #f1f5f9;
}

.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.quick-view-modal.dark-mode .color-option {
  border-color: #334155;
}

.color-option.selected {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.2);
  transform: scale(1.1);
}

.quick-view-modal.dark-mode .color-option.selected {
  border-color: #2dd4bf;
}

.color-option.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

.color-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1rem;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.size-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.size-option {
  min-width: 48px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
}

.quick-view-modal.dark-mode .size-option {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.size-option.selected {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.quick-view-modal.dark-mode .size-option.selected {
  background: #2dd4bf;
  border-color: #2dd4bf;
  color: #0f172a;
}

.size-option.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}

.quantity-section {
  margin-top: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
}

.quick-view-modal.dark-mode .quantity-btn {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.quantity-btn:hover:not(:disabled) {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.quick-view-modal.dark-mode .quantity-btn:hover:not(:disabled) {
  background: #2dd4bf;
  border-color: #2dd4bf;
  color: #0f172a;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 70px;
  height: 36px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.quick-view-modal.dark-mode .quantity-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.stock-info {
  font-size: 0.85rem;
  color: #64748b;
}

.quick-view-modal.dark-mode .stock-info {
  color: #94a3b8;
}

.action-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.quick-view-modal.dark-mode .action-section {
  border-top-color: #334155;
}

.price-section {
  margin-bottom: 20px;
}

.current-price {
  font-size: 1.9rem;
  font-weight: 800;
  color: #d40025;
  line-height: 1.2;
}

.quick-view-modal.dark-mode .current-price {
  color: #ff6b6b;
}

.original-price {
  font-size: 1.05rem;
  color: #94a3b8;
  text-decoration: line-through;
  margin-right: 12px;
  display: inline-block;
}

.discount-info {
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 600;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.primary-btn.added {
  background: #10b981;
  cursor: default;
}

.secondary-btn {
  background: #f1f5f9;
  color: #1e293b;
  border: 2px solid #e2e8f0;
}

.quick-view-modal.dark-mode .secondary-btn {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.secondary-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.quick-view-modal.dark-mode .secondary-btn:hover {
  background: #475569;
}

.wishlist-btn,
.share-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-view-modal.dark-mode .wishlist-btn,
.quick-view-modal.dark-mode .share-btn {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}

.wishlist-btn:hover,
.share-btn:hover {
  transform: translateY(-2px);
  border-color: #d40025;
  color: #d40025;
}

.quick-view-modal.dark-mode .wishlist-btn:hover,
.quick-view-modal.dark-mode .share-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.wishlist-btn.active {
  background: #fee2e2;
  border-color: #d40025;
  color: #d40025;
}

.quick-view-modal.dark-mode .wishlist-btn.active {
  background: rgba(212, 0, 37, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-icon,
.check-icon,
.bolt-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.additional-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 15px 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.quick-view-modal.dark-mode .additional-info {
  background: #0f172a;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
}

.quick-view-modal.dark-mode .info-item {
  color: #94a3b8;
}

.info-icon {
  width: 18px;
  height: 18px;
  stroke: #08717f;
}

.quick-view-modal.dark-mode .info-icon {
  stroke: #2dd4bf;
}

.error-state {
  text-align: center;
  padding: 80px;
}

.quick-view-modal.dark-mode .error-state h3 {
  color: #f1f5f9;
  font-size: 1.5rem;
  font-weight: 700;
}

.quick-view-modal.dark-mode .error-state p {
  color: #cbd5e1;
  font-size: 1rem;
}

.error-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 32px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #065a69;
  transform: translateY(-2px);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
  }

  .product-gallery {
    border-left: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 20px;
  }

  .quick-view-modal.dark-mode .product-gallery {
    border-bottom-color: #334155;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .wishlist-btn,
  .share-btn {
    width: 100%;
  }

  .vendor-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .visit-vendor-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-container {
    max-height: 95vh;
  }

  .stats-grid {
    flex-direction: column;
    gap: 12px;
  }

  .thumbnails {
    justify-content: center;
  }

  .thumbnail-btn {
    width: 60px;
    height: 60px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/* ===== DARK MODE COMPLÉTÉ POUR QUICK VIEW MODAL ===== */
/* Ajoutez à la fin du <style scoped> */

/* Fond modal */
.quick-view-modal.dark-mode .modal-container {
  background: #1e1e30 !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

/* Close button */
.quick-view-modal.dark-mode .modal-close-btn {
  background: rgba(30, 30, 48, 0.95) !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

/* Gallery */
.quick-view-modal.dark-mode .product-gallery {
  background: #121220 !important;
  border-left-color: #2a2a40 !important;
}

.quick-view-modal.dark-mode .main-image {
  background: #1e1e30 !important;
}

.quick-view-modal.dark-mode .thumbnail-btn {
  border-color: #2a2a40 !important;
  background: #121220 !important;
}

.quick-view-modal.dark-mode .thumbnail-btn.active {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2) !important;
}

/* Product Details */
.quick-view-modal.dark-mode .product-title {
  color: #f1f5f9 !important;
}

/* Vendor */
.quick-view-modal.dark-mode .vendor-section {
  border-color: #2a2a40 !important;
}

.quick-view-modal.dark-mode .vendor-avatar {
  border-color: #1e1e30 !important;
}

.quick-view-modal.dark-mode .vendor-name {
  color: #f1f5f9 !important;
}

/* Rating */
.quick-view-modal.dark-mode .star {
  color: #2a2a40 !important;
}

.quick-view-modal.dark-mode .rating-value {
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .reviews-count {
  color: #94a3b8 !important;
}

/* Stats */
.quick-view-modal.dark-mode .stats-grid {
  background: #121220 !important;
}

.quick-view-modal.dark-mode .stat-value {
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .stat-label {
  color: #94a3b8 !important;
}

/* Section title */
.quick-view-modal.dark-mode .section-title {
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .product-description {
  color: #cbd5e1 !important;
}

/* Options */
.quick-view-modal.dark-mode .option-label {
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .color-option {
  border-color: #2a2a40 !important;
}

.quick-view-modal.dark-mode .color-option.selected {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2) !important;
}

.quick-view-modal.dark-mode .size-option {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .size-option.selected {
  background: #2dd4bf !important;
  border-color: #2dd4bf !important;
  color: #161627 !important;
}

/* Quantity */
.quick-view-modal.dark-mode .quantity-btn {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .quantity-btn:hover:not(:disabled) {
  background: #2dd4bf !important;
  border-color: #2dd4bf !important;
  color: #161627 !important;
}

.quick-view-modal.dark-mode .quantity-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .stock-info {
  color: #94a3b8 !important;
}

/* Action section */
.quick-view-modal.dark-mode .action-section {
  border-top-color: #2a2a40 !important;
}

/* Price */
.quick-view-modal.dark-mode .current-price {
  color: #ef4444 !important;
}

.quick-view-modal.dark-mode .discount-info {
  color: #34d399 !important;
}

/* Secondary button */
.quick-view-modal.dark-mode .secondary-btn {
  background: #2a2a40 !important;
  color: #f1f5f9 !important;
  border-color: #2a2a40 !important;
}

.quick-view-modal.dark-mode .secondary-btn:hover {
  background: #3a3a55 !important;
}

/* Wishlist & Share */
.quick-view-modal.dark-mode .wishlist-btn,
.quick-view-modal.dark-mode .share-btn {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.quick-view-modal.dark-mode .wishlist-btn:hover,
.quick-view-modal.dark-mode .share-btn:hover {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

/* Additional info */
.quick-view-modal.dark-mode .additional-info {
  background: #121220 !important;
}

.quick-view-modal.dark-mode .info-item {
  color: #94a3b8 !important;
}

.quick-view-modal.dark-mode .info-icon {
  stroke: #2dd4bf !important;
}

/* Loading */
.quick-view-modal.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

/* Breadcrumb */
.quick-view-modal.dark-mode .breadcrumb-item {
  color: #94a3b8 !important;
}

.quick-view-modal.dark-mode .breadcrumb-item:hover {
  color: #2dd4bf !important;
}

/* Error */
.quick-view-modal.dark-mode .error-state h3 {
  color: #f1f5f9 !important;
}

.quick-view-modal.dark-mode .error-state p {
  color: #94a3b8 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .quick-view-modal.dark-mode .product-gallery {
    border-bottom-color: #2a2a40 !important;
  }
}
/* ============================================
   📱 QUICK VIEW MODAL - DESIGN MOBILE COMPLET
   Ultra Moderne • Animations Fluides • WAAW
============================================ */

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== MODAL OVERLAY ===== */
  .quick-view-modal {
    padding: 0 !important;
    align-items: flex-end !important;
  }

  /* ===== MODAL CONTAINER ===== */
  .modal-container {
    max-width: 100% !important;
    max-height: 92vh !important;
    max-height: 92dvh !important;
    border-radius: 24px 24px 0 0 !important;
    width: 100% !important;
    animation: modalSlideUpMobile 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  @keyframes modalSlideUpMobile {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* ===== CLOSE BUTTON ===== */
  .modal-close-btn {
    top: 14px !important;
    left: 14px !important;
    width: 38px !important;
    height: 38px !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid #e2e8f0 !important;
    z-index: 20 !important;
  }

  .modal-close-btn svg {
    width: 18px !important;
    height: 18px !important;
  }

  .modal-close-btn:active {
    background: #ef4444 !important;
    color: #ffffff !important;
    transform: rotate(90deg) scale(0.9) !important;
  }

  /* Dark mode close button */
  .quick-view-modal.dark-mode .modal-close-btn {
    background: rgba(30, 30, 48, 0.95) !important;
    border-color: #2a2a40 !important;
    color: #94a3b8 !important;
  }

  .quick-view-modal.dark-mode .modal-close-btn:active {
    background: #ef4444 !important;
    color: #ffffff !important;
  }

  /* ===== PRODUCT CONTENT ===== */
  .product-content {
    grid-template-columns: 1fr !important;
    min-height: auto !important;
  }

  /* ===== PRODUCT GALLERY ===== */
  .product-gallery {
    padding: 16px !important;
    border-left: none !important;
    border-bottom: 1px solid #e2e8f0 !important;
    position: relative !important;
  }

  .quick-view-modal.dark-mode .product-gallery {
    border-bottom-color: #2a2a40 !important;
  }

  .main-image {
    border-radius: 14px !important;
    margin-bottom: 12px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  }

  .image-badges {
    top: 10px !important;
    right: 10px !important;
    gap: 6px !important;
  }

  .badge {
    padding: 5px 12px !important;
    font-size: 12px !important;
    border-radius: 20px !important;
  }

  /* Thumbnails */
  .thumbnails {
    gap: 8px !important;
    padding: 4px 0 !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scroll-snap-type: x mandatory !important;
  }

  .thumbnail-btn {
    width: 64px !important;
    height: 64px !important;
    border-radius: 10px !important;
    border-width: 2px !important;
    scroll-snap-align: start !important;
    flex-shrink: 0 !important;
    min-width: 64px !important;
  }

  .thumbnail-btn.active {
    box-shadow: 0 0 0 2px rgba(8, 113, 127, 0.3) !important;
  }

  .quick-view-modal.dark-mode .thumbnail-btn.active {
    box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.3) !important;
  }

  /* ===== PRODUCT DETAILS ===== */
  .product-details {
    padding: 16px !important;
    overflow-y: visible !important;
  }

  /* Breadcrumb */
  .breadcrumb {
    gap: 6px !important;
    margin-bottom: 10px !important;
  }

  .breadcrumb-item {
    font-size: 13px !important;
  }

  .breadcrumb-separator {
    font-size: 13px !important;
  }

  /* Product Title */
  .product-title {
    font-size: 20px !important;
    margin-bottom: 12px !important;
    line-height: 1.4 !important;
  }

  /* Vendor Section */
  .vendor-section {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 12px 0 !important;
    gap: 10px !important;
    margin-bottom: 14px !important;
  }

  .vendor-info {
    gap: 10px !important;
    width: 100% !important;
  }

  .vendor-avatar {
    width: 42px !important;
    height: 42px !important;
  }

  .vendor-name {
    font-size: 15px !important;
  }

  .vendor-verification {
    gap: 8px !important;
  }

  .verified-badge {
    font-size: 11px !important;
  }

  .verified-badge svg {
    width: 12px !important;
    height: 12px !important;
  }

  .vendor-rating {
    font-size: 12px !important;
  }

  .visit-vendor-btn {
    width: 100% !important;
    padding: 10px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    text-align: center !important;
    min-height: 44px !important;
  }

  .visit-vendor-btn:active {
    background: #08717f !important;
    color: #ffffff !important;
  }

  .quick-view-modal.dark-mode .visit-vendor-btn:active {
    background: #2dd4bf !important;
    color: #161627 !important;
  }

  /* ===== PRODUCT STATS ===== */
  .product-stats {
    margin-bottom: 16px !important;
  }

  .rating-section {
    gap: 8px !important;
    margin-bottom: 10px !important;
    flex-wrap: wrap !important;
  }

  .star {
    font-size: 16px !important;
  }

  .rating-value {
    font-size: 15px !important;
  }

  .reviews-count {
    font-size: 12px !important;
  }

  .stats-grid {
    flex-direction: row !important;
    gap: 10px !important;
    padding: 10px 14px !important;
    border-radius: 12px !important;
    flex-wrap: wrap !important;
  }

  .stat-item {
    gap: 6px !important;
  }

  .stat-icon {
    font-size: 16px !important;
  }

  .stat-value {
    font-size: 13px !important;
  }

  .stat-label {
    font-size: 10px !important;
  }

  /* ===== DESCRIPTION ===== */
  .description-section {
    margin-bottom: 16px !important;
  }

  .section-title {
    font-size: 15px !important;
    margin-bottom: 8px !important;
  }

  .product-description {
    font-size: 14px !important;
    line-height: 1.7 !important;
  }

  /* ===== OPTIONS ===== */
  .options-section {
    margin-bottom: 16px !important;
  }

  .option-group {
    margin-bottom: 14px !important;
  }

  .option-label {
    font-size: 14px !important;
    margin-bottom: 8px !important;
  }

  /* Color options */
  .color-options {
    gap: 10px !important;
  }

  .color-option {
    width: 38px !important;
    height: 38px !important;
    min-width: 38px !important;
    min-height: 38px !important;
  }

  .color-option:active {
    transform: scale(1.1) !important;
  }

  /* Size options */
  .size-options {
    gap: 8px !important;
  }

  .size-option {
    min-width: 44px !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    min-height: 44px !important;
  }

  .size-option:active:not(.unavailable) {
    background: #08717f !important;
    color: #ffffff !important;
    transform: scale(0.95) !important;
  }

  /* Quantity */
  .quantity-section {
    margin-top: 14px !important;
  }

  .quantity-selector {
    gap: 8px !important;
  }

  .quantity-btn {
    width: 34px !important;
    height: 34px !important;
    border-radius: 8px !important;
    font-size: 18px !important;
    min-width: 34px !important;
    min-height: 34px !important;
  }

  .quantity-btn:active:not(:disabled) {
    background: #08717f !important;
    color: #ffffff !important;
    transform: scale(0.9) !important;
  }

  .quick-view-modal.dark-mode .quantity-btn:active:not(:disabled) {
    background: #2dd4bf !important;
    color: #161627 !important;
  }

  .quantity-input {
    width: 60px !important;
    height: 34px !important;
    font-size: 15px !important;
    border-radius: 8px !important;
  }

  .stock-info {
    font-size: 12px !important;
    width: 100% !important;
    margin-top: 4px !important;
  }

  /* ===== ACTION SECTION ===== */
  .action-section {
    margin-top: 16px !important;
    padding-top: 14px !important;
  }

  .price-section {
    margin-bottom: 14px !important;
  }

  .current-price {
    font-size: 24px !important;
  }

  .original-price {
    font-size: 14px !important;
    margin-right: 8px !important;
  }

  .discount-info {
    font-size: 12px !important;
  }

  /* Action buttons */
  .action-buttons {
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }

  .primary-btn,
  .secondary-btn {
    width: 100% !important;
    flex: none !important;
    padding: 14px 20px !important;
    font-size: 15px !important;
    border-radius: 12px !important;
    min-height: 50px !important;
  }

  .primary-btn:active:not(:disabled) {
    transform: scale(0.97) !important;
    box-shadow: 0 4px 12px rgba(8, 113, 127, 0.3) !important;
  }

  .secondary-btn:active {
    transform: scale(0.97) !important;
  }

  .wishlist-btn,
  .share-btn {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
    min-height: 48px !important;
  }

  .wishlist-btn:active,
  .share-btn:active {
    transform: scale(0.97) !important;
    border-color: #ef4444 !important;
    color: #ef4444 !important;
  }

  .btn-content {
    justify-content: center !important;
    font-size: 14px !important;
  }

  .cart-icon,
  .check-icon,
  .bolt-icon {
    width: 18px !important;
    height: 18px !important;
  }

  /* Additional info */
  .additional-info {
    flex-direction: column !important;
    gap: 10px !important;
    padding: 12px 14px !important;
    border-radius: 12px !important;
  }

  .info-item {
    font-size: 13px !important;
    gap: 8px !important;
  }

  .info-icon {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== LOADING STATE ===== */
  .loading-state {
    padding: 60px 20px !important;
  }

  .loading-spinner {
    width: 40px !important;
    height: 40px !important;
    border-width: 3px !important;
  }

  .loading-state p {
    font-size: 15px !important;
  }

  /* ===== ERROR STATE ===== */
  .error-state {
    padding: 60px 20px !important;
  }

  .error-icon {
    font-size: 48px !important;
  }

  .error-state h3 {
    font-size: 18px !important;
  }

  .error-state p {
    font-size: 14px !important;
  }

  .retry-btn {
    padding: 10px 24px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 400px) ----- */
@media (max-width: 400px) {
  .modal-container {
    border-radius: 20px 20px 0 0 !important;
    max-height: 90vh !important;
  }

  .product-gallery {
    padding: 12px !important;
  }

  .product-details {
    padding: 12px !important;
  }

  .product-title {
    font-size: 18px !important;
  }

  .current-price {
    font-size: 22px !important;
  }

  .thumbnail-btn {
    width: 54px !important;
    height: 54px !important;
    min-width: 54px !important;
  }

  .primary-btn,
  .secondary-btn {
    padding: 12px 16px !important;
    font-size: 14px !important;
    min-height: 46px !important;
  }

  .stats-grid {
    flex-direction: column !important;
    gap: 8px !important;
  }

  .badge {
    padding: 4px 10px !important;
    font-size: 11px !important;
  }
}

/* ===== PAYSAGE MOBILE ===== */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-container {
    max-height: 85vh !important;
  }

  .main-image {
    max-height: 45vh !important;
  }

  .thumbnails {
    max-height: 60px !important;
  }

  .product-details {
    max-height: 50vh !important;
    overflow-y: auto !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .modal-container {
    padding-bottom: env(safe-area-inset-bottom, 16px) !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .modal-close-btn {
    top: calc(14px + env(safe-area-inset-top, 0px)) !important;
  }

  .action-buttons {
    padding-bottom: env(safe-area-inset-bottom, 8px) !important;
  }
}

/* ===== OPTIMISATION TACTILE ===== */
@media (hover: none) and (pointer: coarse) {
  .modal-close-btn,
  .visit-vendor-btn,
  .primary-btn,
  .secondary-btn,
  .wishlist-btn,
  .share-btn,
  .color-option,
  .size-option,
  .quantity-btn {
    min-height: 44px !important;
    min-width: 44px !important;
    cursor: pointer !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .thumbnail-btn {
    min-width: 54px !important;
    min-height: 54px !important;
  }

  /* Désactiver les animations hover */
  .main-image:hover .gallery-image {
    transform: none !important;
  }

  .thumbnail-btn:hover,
  .primary-btn:hover,
  .secondary-btn:hover,
  .visit-vendor-btn:hover,
  .wishlist-btn:hover,
  .share-btn:hover {
    transform: none !important;
  }

  .modal-close-btn:hover {
    transform: none !important;
  }

  .color-option:hover,
  .size-option:hover {
    transform: none !important;
  }

  .quantity-btn:hover {
    transform: none !important;
  }
}

/* ===== NOTIFICATION TOAST ===== */
@media (max-width: 768px) {
  .notification-toast {
    top: 16px !important;
    right: 12px !important;
    left: 12px !important;
    width: auto !important;
    text-align: center !important;
    font-size: 14px !important;
    padding: 10px 16px !important;
    border-radius: 10px !important;
    font-family: 'Amiri', 'Cairo', serif !important;
  }
}

/* ===== ANIMATIONS RÉDUITES ===== */
@media (prefers-reduced-motion: reduce) {
  .quick-view-modal,
  .quick-view-modal * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
