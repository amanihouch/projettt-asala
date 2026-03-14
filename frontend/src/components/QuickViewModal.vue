<!-- QuickViewModal.vue (version corrigée) -->
<template>
  <!-- Modal Overlay -->
  <transition name="modal-fade">
    <div v-if="isVisible" class="quick-view-modal" @click.self="closeModal">
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
                :alt="product.name"
                class="gallery-image"
                @load="imageLoaded"
              />
              <!-- Image Badges -->
              <div class="image-badges">
                <span v-if="product.isNew" class="badge new-badge">🆕 جديد</span>
                <span v-if="product.discount" class="badge discount-badge">
                  ⚡ {{ product.discount }}% خصم
                </span>
                <span v-if="product.isFeatured" class="badge featured-badge">✨ مميز</span>
              </div>
            </div>

            <!-- Thumbnails -->
            <div v-if="product.images && product.images.length > 1" class="thumbnails">
              <button
                v-for="(img, index) in product.images"
                :key="index"
                class="thumbnail-btn"
                :class="{ active: currentImageIndex === index }"
                @click="changeImage(index)"
                :aria-label="`عرض الصورة ${index + 1}`"
              >
                <img :src="img" :alt="`صورة ${index + 1} لـ ${product.name}`" />
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="product-details">
            <!-- Product Header -->
            <div class="product-header">
              <!-- Breadcrumb -->
              <div class="breadcrumb">
                <span class="breadcrumb-item">المنتجات</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item">{{ getCategoryName(product.category) }}</span>
              </div>

              <!-- Product Title -->
              <h1 class="product-title">{{ product.name }}</h1>

              <!-- Vendor Info -->
              <div class="vendor-section">
                <div class="vendor-info">
                  <img
                    :src="product.vendor?.avatar"
                    :alt="product.vendor?.name"
                    class="vendor-avatar"
                  />
                  <div class="vendor-details">
                    <span class="vendor-name">{{ product.vendor?.name || 'حرفي' }}</span>
                    <div class="vendor-verification">
                      <span v-if="product.vendor?.verified" class="verified-badge">
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
                      <span class="vendor-rating"> ⭐ {{ product.vendor?.rating || '4.5' }} </span>
                    </div>
                  </div>
                </div>
                <button class="visit-vendor-btn" @click="visitVendor" v-if="product.vendor?.id">
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
                      filled: i <= Math.floor(product.rating || 0),
                      half: i === Math.ceil(product.rating || 0) && (product.rating || 0) % 1 !== 0,
                    }"
                  >
                    ★
                  </span>
                </div>
                <div class="rating-details">
                  <span class="rating-value">{{ (product.rating || 0).toFixed(1) }}</span>
                  <span class="reviews-count">({{ product.reviews || 0 }} تقييم)</span>
                </div>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-icon">🔥</span>
                  <span class="stat-value">{{ product.sold || 0 }}</span>
                  <span class="stat-label">مبيع</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">📦</span>
                  <span class="stat-value">{{ product.stock || 10 }}</span>
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
                {{ product.fullDescription || product.description || 'لا يوجد وصف' }}
              </p>

              <!-- Product Features -->
              <div v-if="product.features && product.features.length" class="features-list">
                <h4 class="features-title">المميزات:</h4>
                <ul class="features">
                  <li
                    v-for="(feature, index) in product.features"
                    :key="index"
                    class="feature-item"
                  >
                    <span class="feature-icon">✓</span>
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Product Options -->
            <div v-if="product.options" class="options-section">
              <h3 class="section-title">خيارات المنتج</h3>

              <!-- Color Options -->
              <div v-if="product.options.colors" class="option-group">
                <label class="option-label">اللون:</label>
                <div class="color-options">
                  <button
                    v-for="color in product.options.colors"
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
              <div v-if="product.options.sizes" class="option-group">
                <label class="option-label">المقاس:</label>
                <div class="size-options">
                  <button
                    v-for="size in product.options.sizes"
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
                    :max="product.stock || 10"
                    class="quantity-input"
                    @change="validateQuantity"
                  />
                  <button
                    class="quantity-btn increase"
                    @click="increaseQuantity"
                    :disabled="quantity >= (product.stock || 10)"
                  >
                    +
                  </button>
                  <span class="stock-info"> {{ product.stock || 10 }} قطعة متوفرة </span>
                </div>
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="action-section">
              <div class="price-section">
                <div class="current-price">{{ formatPrice(calculateTotal()) }} د.ت</div>
                <div v-if="product.originalPrice" class="original-price">
                  {{ formatPrice(product.originalPrice) }} د.ت
                </div>
                <div v-if="product.discount" class="discount-info">
                  وفر {{ formatPrice(product.originalPrice - product.price) }} د.ت ({{
                    product.discount
                  }}%)
                </div>
              </div>

              <div class="action-buttons">
                <button
                  class="add-to-cart-btn primary-btn"
                  :class="{ added: isInCart }"
                  @click="addToCart"
                >
                  <span v-if="isInCart" class="btn-content">
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

            <!-- Product Specifications -->
            <div v-if="product.specifications" class="specifications-section">
              <h3 class="section-title">مواصفات المنتج</h3>
              <div class="specs-table">
                <div v-for="(spec, key) in product.specifications" :key="key" class="spec-row">
                  <span class="spec-key">{{ getSpecLabel(key) }}</span>
                  <span class="spec-value">{{ spec }}</span>
                </div>
              </div>
            </div>

            <!-- Customer Reviews Preview -->
            <div v-if="product.reviews > 0" class="reviews-preview">
              <div class="reviews-header">
                <h3 class="section-title">آراء العملاء</h3>
                <button class="view-all-reviews" @click="viewAllReviews">
                  عرض جميع التقييمات ({{ product.reviews }})
                </button>
              </div>

              <div class="review-summary">
                <div class="average-rating">
                  <div class="average-number">{{ (product.rating || 0).toFixed(1) }}</div>
                  <div class="rating-stars">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="star"
                      :class="{ filled: i <= Math.floor(product.rating || 0) }"
                    >
                      ★
                    </span>
                  </div>
                  <div class="total-reviews">{{ product.reviews || 0 }} تقييم</div>
                </div>

                <div class="rating-bars">
                  <div v-for="i in 5" :key="i" class="rating-bar">
                    <span class="star-count">{{ 6 - i }} ⭐</span>
                    <div class="bar-container">
                      <div
                        class="bar-fill"
                        :style="{ width: getRatingPercentage(6 - i) + '%' }"
                      ></div>
                    </div>
                    <span class="percentage">{{ getRatingPercentage(6 - i) }}%</span>
                  </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '../stores/likes'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'add-to-cart', 'buy-now'])

const router = useRouter()
const likesStore = useLikesStore()

// 🎯 State
const isLoading = ref(true)
const currentImageIndex = ref(0)
const selectedColor = ref(null)
const selectedSize = ref(null)
const quantity = ref(1)
const isInCart = ref(false)
const categories = {
  1: 'الفخار والخزف',
  2: 'السجاد والمنسوجات',
  3: 'المجوهرات والحلي',
  4: 'الأعمال الخشبية',
  5: 'النحاسيات',
  6: 'المنتجات الجلدية',
  7: 'الملابس التقليدية',
  8: 'ديكور المنزل',
}

// 🎯 Computed
const currentImage = computed(() => {
  if (!props.product) return ''
  if (props.product.images && props.product.images.length > 0) {
    return props.product.images[currentImageIndex.value]
  }
  return props.product.image
})

const isInWishlist = computed(() => {
  return props.product?.id ? likesStore.isLiked(props.product.id) : false
})

// 🎯 Methods
const closeModal = () => {
  emit('close')
}

const imageLoaded = () => {
  isLoading.value = false
}

const changeImage = (index) => {
  currentImageIndex.value = index
}

const getCategoryName = (categoryId) => {
  return categories[categoryId] || 'غير مصنف'
}

const visitVendor = () => {
  if (props.product?.vendor?.id) {
    router.push(`/vendor/${props.product.vendor.id}`)
    closeModal()
  }
}

const selectColor = (color) => {
  if (color.available) {
    selectedColor.value = color.name
  }
}

const selectSize = (size) => {
  if (isSizeAvailable(size)) {
    selectedSize.value = size
  }
}

const isSizeAvailable = (size) => {
  return true
}

const increaseQuantity = () => {
  if (quantity.value < (props.product?.stock || 10)) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const validateQuantity = () => {
  const maxStock = props.product?.stock || 10
  if (quantity.value < 1) quantity.value = 1
  if (quantity.value > maxStock) quantity.value = maxStock
}

const calculateTotal = () => {
  const basePrice = props.product?.price || 0
  return basePrice * quantity.value
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price)
}

const addToCart = () => {
  const cartItem = {
    product: props.product,
    color: selectedColor.value,
    size: selectedSize.value,
    quantity: quantity.value,
    total: calculateTotal(),
  }

  emit('add-to-cart', cartItem)
  isInCart.value = true

  // Show success message
  showNotification('تمت إضافة المنتج إلى السلة بنجاح')
}

const buyNow = () => {
  const cartItem = {
    product: props.product,
    color: selectedColor.value,
    size: selectedSize.value,
    quantity: quantity.value,
    total: calculateTotal(),
  }

  emit('buy-now', cartItem)
  closeModal()
}

const toggleWishlist = () => {
  if (props.product?.id) {
    likesStore.toggleLike(props.product.id)
    showNotification(
      isInWishlist.value ? 'تمت إضافة المنتج إلى المفضلة' : 'تمت إزالة المنتج من المفضلة',
    )
  }
}

const shareProduct = async () => {
  const shareData = {
    title: props.product?.name,
    text: props.product?.description,
    url: window.location.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      showNotification('تم نسخ رابط المنتج إلى الحافظة')
    }
  } catch (err) {
    console.log('Error sharing:', err)
  }
}

const viewAllReviews = () => {
  if (props.product?.id) {
    router.push(`/product/${props.product.id}/reviews`)
    closeModal()
  }
}

const getRatingPercentage = (rating) => {
  const ratings = { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 }
  return ratings[rating] || 0
}

const getSpecLabel = (key) => {
  const labels = {
    material: 'المادة',
    dimensions: 'الأبعاد',
    weight: 'الوزن',
    origin: 'بلد المنشأ',
    warranty: 'الضمان',
    care: 'طرق العناية',
  }
  return labels[key] || key
}

const showNotification = (message) => {
  const notification = document.createElement('div')
  notification.className = 'notification-toast'
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

const retryLoad = () => {
  isLoading.value = true
  // Implement retry logic
}

// 🎯 Watchers
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      isLoading.value = true
      selectedColor.value = null
      selectedSize.value = null
      quantity.value = 1
      currentImageIndex.value = 0

      // Check if product is in cart
      isInCart.value = false
    }
  },
  { immediate: true },
)

// 🎯 Keyboard Events
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isVisible) {
    closeModal()
  }
}

// 🎯 Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
/* 🎨 CSS Variables */
:root {
  --modal-overlay-bg: rgba(0, 0, 0, 0.8);
  --modal-bg: #ffffff;
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --border-color: #e2e8f0;
  --primary-color: #1e3a8a;
  --primary-light: #3b82f6;
  --secondary-color: #fbbf24;
  --accent-color: #10b981;
  --danger-color: #ef4444;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --bg-secondary: #f8fafc;
  --border-radius: 12px;
  --border-radius-lg: 20px;
  --transition-fast: all 0.2s ease;
  --transition-base: all 0.3s ease;
  --transition-slow: all 0.5s ease;
}

/* 🎯 Modal Container */
.quick-view-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--modal-overlay-bg);
  backdrop-filter: blur(8px);
}

.modal-container {
  position: relative;
  background: var(--modal-bg);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--modal-shadow);
  animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-loading {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 🎯 Close Button */
.modal-close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-close-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.modal-close-btn svg {
  width: 20px;
  height: 20px;
  stroke: var(--text-primary);
}

/* 🎯 Loading State */
.loading-state {
  text-align: center;
  padding: 80px 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 🎯 Product Content Layout */
.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  height: 100%;
  overflow-y: auto;
}

/* 🖼️ Gallery Section */
.product-gallery {
  padding: 40px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: white;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: var(--transition-base);
}

.image-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-align: center;
  white-space: nowrap;
}

.new-badge {
  background: var(--accent-color);
}

.discount-badge {
  background: var(--danger-color);
}

.featured-badge {
  background: var(--primary-light);
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-base);
  background: white;
  padding: 0;
}

.thumbnail-btn:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
}

.thumbnail-btn.active {
  border-color: var(--primary-color);
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 📋 Details Section */
.product-details {
  padding: 40px;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.product-header {
  margin-bottom: 8px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.breadcrumb-item {
  cursor: pointer;
  transition: var(--transition-fast);
}

.breadcrumb-item:hover {
  color: var(--primary-light);
}

.breadcrumb-separator {
  opacity: 0.5;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  line-height: 1.3;
}

.vendor-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vendor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vendor-name {
  font-weight: 600;
  color: var(--text-primary);
}

.vendor-verification {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-color);
  font-size: 0.85rem;
  font-weight: 600;
}

.verified-badge svg {
  width: 14px;
  height: 14px;
}

.vendor-rating {
  color: var(--secondary-color);
  font-weight: 600;
  font-size: 0.85rem;
}

.visit-vendor-btn {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid var(--primary-light);
  color: var(--primary-light);
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-base);
}

.visit-vendor-btn:hover {
  background: var(--primary-light);
  color: white;
}

/* ⭐ Rating & Stats */
.product-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--border-color);
  font-size: 1.2rem;
}

.star.filled {
  color: var(--secondary-color);
}

.star.half {
  position: relative;
  color: var(--border-color);
}

.star.half::after {
  content: '★';
  position: absolute;
  left: 0;
  width: 50%;
  overflow: hidden;
  color: var(--secondary-color);
}

.rating-details {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.reviews-count {
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.stats-grid {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

/* 📝 Description */
.description-section {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.product-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.features-list {
  margin-top: 20px;
}

.features-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: var(--text-secondary);
}

.feature-icon {
  color: var(--accent-color);
  font-weight: 700;
}

/* 🎨 Product Options */
.options-section {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.option-group {
  margin-bottom: 24px;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 1rem;
}

.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option:hover:not(.unavailable) {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--primary-color);
}

.color-option.unavailable {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-option.unavailable::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 2px;
  background: var(--danger-color);
  transform: translate(-50%, -50%) rotate(-45deg);
}

.color-check {
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.size-option {
  padding: 10px 20px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  font-weight: 600;
  color: var(--text-primary);
  min-width: 50px;
  text-align: center;
}

.size-option:hover:not(.unavailable) {
  border-color: var(--primary-light);
  color: var(--primary-light);
}

.size-option.selected {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.size-option.unavailable {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

.quantity-section {
  margin-top: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  border-color: var(--primary-light);
  color: var(--primary-light);
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-input {
  width: 70px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: inherit;
  transition: var(--transition-base);
}

.quantity-input:focus {
  outline: none;
  border-color: var(--primary-light);
}

.stock-info {
  margin-right: auto;
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

/* 💰 Price & Actions */
.action-section {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.price-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-color);
}

.current-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.original-price {
  font-size: 1.2rem;
  color: var(--text-tertiary);
  text-decoration: line-through;
  margin-bottom: 8px;
}

.discount-info {
  font-size: 0.9rem;
  color: var(--accent-color);
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  min-width: 200px;
  padding: 16px 24px;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-btn {
  background: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.primary-btn.added {
  background: var(--accent-color);
}

.secondary-btn {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.secondary-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
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

.wishlist-btn,
.share-btn {
  width: 56px;
  height: 56px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
}

.wishlist-btn:hover,
.share-btn:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
}

.wishlist-btn.active {
  background: var(--danger-color);
  border-color: var(--danger-color);
  color: white;
}

.wishlist-btn.active .heart-icon {
  stroke: white;
}

.heart-icon,
.share-icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  flex-shrink: 0;
}

/* 📊 Specifications */
.specifications-section {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.specs-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.spec-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.spec-key {
  font-weight: 600;
  color: var(--text-primary);
}

.spec-value {
  color: var(--text-secondary);
  text-align: left;
}

/* 💬 Reviews Preview */
.reviews-preview {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-all-reviews {
  background: transparent;
  border: none;
  color: var(--primary-light);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-base);
}

.view-all-reviews:hover {
  text-decoration: underline;
}

.review-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.average-rating {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.average-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.total-reviews {
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-count {
  width: 50px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--secondary-color);
  transition: width 1s ease;
}

.percentage {
  width: 40px;
  text-align: left;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* ⚠️ Error State */
.error-state {
  text-align: center;
  padding: 80px 40px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.retry-btn {
  padding: 12px 32px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
}

.retry-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}

/* 🎯 Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 📱 Responsive Design */
@media (max-width: 1024px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 30px;
    max-height: 85vh;
  }

  .product-gallery {
    padding: 30px;
  }

  .product-details {
    padding: 30px;
    padding-top: 0;
  }

  .main-image {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .product-content {
    gap: 20px;
  }

  .product-gallery,
  .product-details {
    padding: 20px;
  }

  .product-stats {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .stats-grid {
    justify-content: space-between;
  }

  .review-summary {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    min-width: 100%;
  }

  .wishlist-btn,
  .share-btn {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .modal-container {
    border-radius: var(--border-radius);
  }

  .product-title {
    font-size: 1.4rem;
  }

  .vendor-section {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .visit-vendor-btn {
    align-self: stretch;
  }

  .quantity-selector {
    flex-wrap: wrap;
  }

  .stock-info {
    width: 100%;
    text-align: center;
    margin-top: 8px;
  }

  .modal-close-btn {
    width: 36px;
    height: 36px;
    top: 12px;
    left: 12px;
  }
}
</style>
