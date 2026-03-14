<!-- src/components/ProductCard.vue -->
<template>
  <div class="product-card" @click="viewProduct">
    <!-- Image Container -->
    <div class="product-image-container">
      <!-- Product Image -->
      <img 
        :src="product.image || product.images?.[0] || 'https://via.placeholder.com/300'" 
        :alt="product.name || product.productName" 
        class="product-image" 
        loading="lazy" 
      />

      <!-- Top Badges -->
      <div class="top-badges">
        <span v-if="product.isSponsored" class="badge badge-sponsored">⭐ {{ $t('common.sponsored') }}</span>
        <span v-if="isNew" class="badge badge-new">🆕 {{ $t('common.new') }}</span>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <!-- Like Button -->
        <button
          class="action-btn like-btn"
          :class="{ 'is-liked': isLiked }"
          @click.stop="toggleLike"
          :aria-label="$t('actions.addToFavorites')"
          :title="isLiked ? $t('actions.removeFromFavorites') : $t('actions.addToFavorites')"
        >
          <svg class="heart-icon" viewBox="0 0 24 24" :class="{ 'animate-like': animateLike }">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              :fill="isLiked ? '#d40025' : 'none'"
              :stroke="isLiked ? '#d40025' : 'currentColor'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Quick View Button -->
        <button 
          class="action-btn quick-view-btn" 
          @click.stop="$emit('quick-view', product)" 
          :aria-label="$t('actions.quickView')"
        >
          👁️
        </button>
      </div>

      <!-- Discount Badge -->
      <div v-if="hasDiscount" class="discount-badge">-{{ discountPercentage }}%</div>

      <!-- Liked Badge with Animation -->
      <transition name="slide-fade">
        <div v-if="isLiked" class="liked-indicator">
          <span class="liked-icon">❤️</span>
          <span class="liked-text">{{ $t('common.favorite') }}</span>
        </div>
      </transition>
    </div>

    <!-- Product Info -->
    <div class="product-info">
      <!-- Vendor Info -->
      <div class="vendor-info" @click.stop="goToVendor">
        <img
          :src="product.vendor?.avatar || product.vendorAvatar || '/default-avatar.png'"
          :alt="product.vendor?.name || product.vendorName"
          class="vendor-avatar"
        />
        <div class="vendor-details">
          <span class="vendor-name">{{ product.vendor?.name || product.vendorName || $t('common.vendor') }}</span>
          <span v-if="product.vendor?.verified || product.vendorVerified" class="verified-badge" :title="$t('vendor.verified')"> ✓ </span>
        </div>
      </div>

      <!-- Product Name -->
      <h3 class="product-name">{{ product.name || product.productName }}</h3>

      <!-- Product Description -->
      <p v-if="product.description" class="product-description">
        {{ truncateDescription(product.description) }}
      </p>

      <!-- Rating Section -->
      <div class="rating-section">
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{
              filled: star <= Math.floor(product.rating || 0),
              half: star === Math.ceil(product.rating || 0) && (product.rating || 0) % 1 !== 0,
            }"
          >
            ⭐
          </span>
        </div>
        <div class="rating-info">
          <span class="rating-value">{{ (product.rating || 0).toFixed(1) }}</span>
          <span class="reviews-count">({{ product.reviews || 0 }})</span>
        </div>
      </div>

      <!-- Price & Actions -->
      <div class="footer-section">
        <div class="price-section">
          <span class="current-price">{{ formatPrice(product.price) }} د.ت</span>
          <span v-if="product.originalPrice || product.oldPrice" class="original-price">
            {{ formatPrice(product.originalPrice || product.oldPrice) }} د.ت
          </span>
        </div>

        <div class="actions-section">
          <div
            class="likes-counter"
            @click.stop="toggleLike"
            :title="isLiked ? $t('common.unlike') : $t('common.like')"
            :class="{ liked: isLiked }"
          >
            <span class="likes-icon">❤️</span>
            <span class="likes-count">{{ product.likesCount || product.likes || 0 }}</span>
          </div>

          <button
            class="add-to-cart-btn"
            @click.stop="addToCart"
            :disabled="isAddingToCart"
            :class="{ 'in-cart': isInCart }"
            :title="isInCart ? $t('products.inCart') : $t('products.addToCart')"
          >
            <span v-if="isAddingToCart" class="loading-spinner"></span>
            <span v-else-if="isInCart">✓</span>
            <span v-else>🛒</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      productName: '',
      price: 0,
      originalPrice: null,
      oldPrice: null,
      image: '',
      images: [],
      rating: 0,
      reviews: 0,
      likesCount: 0,
      likes: 0,
      isNew: false,
      isSponsored: false,
      discount: 0,
      description: '',
      vendor: {
        id: null,
        name: '',
        avatar: '',
        verified: false,
      },
      vendorId: null,
      vendorName: '',
      vendorAvatar: '',
      vendorVerified: false,
    }),
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
})

const router = useRouter()
const { t } = useI18n()
const likesStore = useLikesStore()
const cartStore = useCartStore()

const animateLike = ref(false)
const isAddingToCart = ref(false)
const likeAnimationTimeout = ref(null)

// Computed properties
const isLiked = computed(() => likesStore.isLiked(props.product.id))

const isInCart = computed(() => {
  return cartStore.isInCart(props.product.id)
})

const isNew = computed(() => {
  if (props.product.isNew) return true
  if (!props.product.createdAt) return false
  const created = new Date(props.product.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})

const hasDiscount = computed(() => {
  return (props.product.originalPrice || props.product.oldPrice) && 
         (props.product.originalPrice || props.product.oldPrice) > props.product.price
})

const discountPercentage = computed(() => {
  const oldPrice = props.product.originalPrice || props.product.oldPrice
  if (!oldPrice) return 0
  return Math.round(((oldPrice - props.product.price) / oldPrice) * 100)
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price)
}

const truncateDescription = (description) => {
  if (!description) return ''
  if (description.length > 100) {
    return description.substring(0, 100) + '...'
  }
  return description
}

const viewProduct = () => {
  router.push(`/product/${props.product.id}`)
}

const goToVendor = () => {
  const vendorId = props.product.vendor?.id || props.product.vendorId
  if (vendorId) {
    router.push(`/vendor/${vendorId}`)
  }
}

const toggleLike = async () => {
  if (likeAnimationTimeout.value) {
    clearTimeout(likeAnimationTimeout.value)
  }

  try {
    await likesStore.toggleLike(props.product)
    animateLike.value = true

    if (likesStore.isLiked(props.product.id)) {
      emit('liked', props.product)
    } else {
      emit('unliked', props.product.id)
    }

    likeAnimationTimeout.value = setTimeout(() => {
      animateLike.value = false
    }, 600)
  } catch (error) {
    console.error('Error toggling like:', error)
  }
}

const addToCart = async () => {
  if (isAddingToCart.value) return

  isAddingToCart.value = true

  try {
    await cartStore.addItem({
      id: props.product.id,
      name: props.product.name || props.product.productName,
      price: props.product.price,
      image: props.product.image || props.product.images?.[0],
      quantity: 1,
      vendorName: props.product.vendor?.name || props.product.vendorName
    })

    emit('added-to-cart', props.product)
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

// Emit events
const emit = defineEmits(['quick-view', 'added-to-cart', 'liked', 'unliked'])

// Cleanup
onUnmounted(() => {
  if (likeAnimationTimeout.value) {
    clearTimeout(likeAnimationTimeout.value)
  }
})
</script>

<style scoped>
/* === CSS VARIABLES - HARMONIZED WITH FAVORITES (#08717f & #d40025) === */
.product-card {
  /* Primary Teal Theme (#08717f) */
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-teal-soft: #e0f5f7;
  --primary-teal-mist: #f0fafb;

  /* Primary Red Theme (#d40025) */
  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --primary-red-soft: #ffe8ed;
  --primary-red-mist: #fff5f7;

  /* Neutral Colors */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;

  /* Card Styling */
  --card-radius: 16px;
  --card-shadow: 0 4px 20px rgba(8, 113, 127, 0.08);
  --card-shadow-hover: 0 12px 40px rgba(8, 113, 127, 0.18);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* === BASE CARD STYLES === */
.product-card {
  background: white;
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--neutral-200);
  transition: var(--transition-smooth);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--primary-teal);
}

/* === IMAGE CONTAINER === */
.product-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-teal-mist) 0%, var(--primary-red-mist) 100%);
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

/* === BADGES === */
.top-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(12px);
  animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.badge-sponsored {
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-new {
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* === QUICK ACTIONS === */
.quick-actions {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 2;
}

.product-card:hover .quick-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-bounce);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-btn:hover {
  transform: scale(1.2);
  background: white;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.like-btn {
  color: var(--neutral-600);
}

.like-btn.is-liked {
  background: var(--primary-red-soft);
  border-color: var(--primary-red);
  animation: heartBeatPulse 0.8s ease;
}

.quick-view-btn {
  font-size: 20px;
}

.quick-view-btn:hover {
  background: var(--primary-teal);
  color: white;
  border-color: var(--primary-teal);
}

/* === HEART ANIMATION === */
.heart-icon {
  width: 22px;
  height: 22px;
  transition: all 0.3s ease;
}

@keyframes heartBeatPulse {
  0%,
  100% {
    transform: scale(1);
  }
  10%,
  30% {
    transform: scale(0.85);
  }
  20%,
  40%,
  60%,
  80% {
    transform: scale(1.15);
  }
  50%,
  70% {
    transform: scale(1.05);
  }
}

.animate-like {
  animation: likePopAnimation 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes likePopAnimation {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.4) rotate(15deg);
  }
  50% {
    transform: scale(0.95) rotate(-15deg);
  }
  75% {
    transform: scale(1.25) rotate(8deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* === DISCOUNT BADGE === */
.discount-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
  border-radius: 24px;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 0 4px 20px rgba(212, 0, 37, 0.4);
  animation: discountPulse 2.5s infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

@keyframes discountPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(212, 0, 37, 0.4);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(212, 0, 37, 0.6);
  }
}

/* === LIKED INDICATOR === */
.liked-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 6px 24px rgba(212, 0, 37, 0.5);
  z-index: 3;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.liked-icon {
  animation: badgeHeartPulse 2s infinite;
  font-size: 1.1em;
}

@keyframes badgeHeartPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
  70% {
    transform: translate(-50%, -50%) scale(0.95);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

/* === PRODUCT INFO === */
.product-info {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  background: white;
}

/* Vendor Info */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  padding: 6px 0;
}

.vendor-info:hover {
  opacity: 0.75;
}

.vendor-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--neutral-200);
  transition: var(--transition-smooth);
}

.vendor-info:hover .vendor-avatar {
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px var(--primary-teal-soft);
}

.vendor-details {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vendor-name {
  font-size: 0.875rem;
  color: var(--neutral-600);
  font-weight: 600;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(8, 113, 127, 0.3);
}

/* Product Name */
.product-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3em;
  margin: 4px 0;
}

/* Product Description */
.product-description {
  font-size: 0.875rem;
  color: var(--neutral-500);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 4px 0;
}

/* Rating Section */
.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.stars {
  display: flex;
  gap: 3px;
}

.star {
  font-size: 16px;
  opacity: 0.2;
  transition: opacity 0.2s ease;
}

.star.filled {
  opacity: 1;
  color: #fbbf24;
  filter: drop-shadow(0 1px 2px rgba(251, 191, 36, 0.3));
}

.star.half {
  opacity: 1;
  background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.rating-value {
  font-weight: 700;
  color: var(--neutral-900);
  font-size: 0.9rem;
}

.reviews-count {
  color: var(--neutral-400);
  font-size: 0.75rem;
}

/* === FOOTER SECTION === */
.footer-section {
  margin-top: auto;
  padding-top: 18px;
  border-top: 2px solid var(--neutral-100);
}

.price-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.current-price {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary-teal);
  font-family: 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -0.5px;
}

.original-price {
  font-size: 1rem;
  color: var(--neutral-400);
  text-decoration: line-through;
  font-weight: 500;
}

.actions-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.likes-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--primary-red-mist);
  border-radius: 24px;
  border: 2px solid var(--primary-red-soft);
  cursor: pointer;
  transition: var(--transition-bounce);
  min-width: 85px;
}

.likes-counter:hover {
  background: var(--primary-red-soft);
  transform: translateY(-3px);
  border-color: var(--primary-red);
  box-shadow: 0 6px 20px rgba(212, 0, 37, 0.2);
}

.likes-counter.liked {
  background: var(--primary-red-soft);
  border-color: var(--primary-red);
  box-shadow: 0 4px 16px rgba(212, 0, 37, 0.25);
}

.likes-counter.liked .likes-icon {
  animation: heartPulseLoop 1.5s infinite;
}

.likes-icon {
  font-size: 16px;
}

@keyframes heartPulseLoop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

.likes-count {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-red);
}

.add-to-cart-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  transition: var(--transition-bounce);
  box-shadow: 0 4px 20px rgba(8, 113, 127, 0.35);
  position: relative;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 8px 30px rgba(8, 113, 127, 0.45);
  background: linear-gradient(135deg, var(--primary-teal-light), var(--primary-teal));
}

.add-to-cart-btn:active:not(:disabled) {
  transform: translateY(-1px) scale(1.05);
}

.add-to-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-to-cart-btn.in-cart {
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  box-shadow: 0 4px 20px rgba(212, 0, 37, 0.35);
}

.add-to-cart-btn.in-cart:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(212, 0, 37, 0.45);
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* === RESPONSIVE DESIGN === */
@media (max-width: 768px) {
  .product-card {
    border-radius: 14px;
  }

  .product-info {
    padding: 18px;
  }

  .product-name {
    font-size: 1.05rem;
  }

  .current-price {
    font-size: 1.4rem;
  }

  .action-btn {
    width: 42px;
    height: 42px;
  }

  .quick-actions {
    opacity: 1;
    transform: translateX(0);
  }

  .likes-counter {
    padding: 8px 14px;
    min-width: 75px;
  }

  .add-to-cart-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
}

@media (max-width: 480px) {
  .badge {
    font-size: 0.7rem;
    padding: 5px 10px;
  }

  .discount-badge {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .vendor-name {
    max-width: 90px;
  }

  .product-card:hover {
    transform: translateY(-4px);
  }
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-image,
  .action-btn,
  .likes-counter,
  .add-to-cart-btn {
    transition: none;
    animation: none;
  }

  .product-card:hover {
    transform: none;
  }
}

/* === PRINT STYLES === */
@media print {
  .quick-actions,
  .actions-section {
    display: none;
  }

  .product-card {
    box-shadow: none;
    border: 1px solid var(--neutral-300);
  }
}
</style>