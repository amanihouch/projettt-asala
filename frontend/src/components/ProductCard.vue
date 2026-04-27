<template>
  <div class="product-card" @click="viewProduct">
    <!-- Image Container -->
    <div class="product-image-container">
      <!-- Product Image -->
      <img
        :src="getProductImage"
        :alt="getProductName"
        class="product-image"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- Top Badges - Compacts -->
      <div class="top-badges">
        <span v-if="product.isSponsored" class="badge sponsored">⭐</span>
        <span v-if="isNew" class="badge new">🆕</span>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <!-- Like Button -->
        <button
          class="action-btn like-btn"
          :class="{ 'is-liked': isLiked }"
          @click.stop="toggleLike"
          :aria-label="$t('actions.addToFavorites')"
        >
          <svg class="heart-icon" viewBox="0 0 24 24" :class="{ 'animate-like': animateLike }">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              :fill="isLiked ? 'var(--primary-red)' : 'none'"
              :stroke="isLiked ? 'var(--primary-red)' : 'currentColor'"
              stroke-width="2"
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
        <div v-if="isLiked && showLikedIndicator" class="liked-indicator">
          <span class="liked-icon">❤️</span>
          <span class="liked-text">{{ $t('common.favorite') }}</span>
        </div>
      </transition>
    </div>

    <!-- Product Info -->
    <div class="product-info">
      <!-- Vendor Info - Compact -->
      <div class="vendor-info" @click.stop="goToVendor">
        <img
          :src="getVendorAvatar"
          :alt="getVendorName"
          class="vendor-avatar"
          @error="handleAvatarError"
        />
        <div class="vendor-details">
          <span class="vendor-name">{{ getVendorName }}</span>
          <span v-if="isVendorVerified" class="verified-badge">✓</span>
        </div>
      </div>

      <!-- Product Name -->
      <h3 class="product-name">{{ getProductName }}</h3>

      <!-- Product Description (optionnel) -->
      <p v-if="product.description && showDescription" class="product-description">
        {{ truncateDescription(product.description) }}
      </p>

      <!-- Rating Section - Compact -->
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
        <span class="rating-value">{{ (product.rating || 0).toFixed(1) }}</span>
        <span class="reviews-count">({{ product.reviews || 0 }})</span>
      </div>

      <!-- Price & Actions -->
      <div class="footer-section">
        <div class="price-section">
          <span class="current-price">{{ formatPrice(product.price) }} د.ت</span>
          <span v-if="hasDiscount" class="original-price">
            {{ formatPrice(product.originalPrice || product.oldPrice) }} د.ت
          </span>
        </div>

        <div class="actions-section">
          <div
            class="likes-counter"
            @click.stop="toggleLike"
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
      createdAt: null,
    }),
  },
  viewMode: {
    type: String,
    default: 'grid'
  },
  showDescription: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { t } = useI18n()
const likesStore = useLikesStore()
const cartStore = useCartStore()

const animateLike = ref(false)
const isAddingToCart = ref(false)
const showLikedIndicator = ref(false)
const likeAnimationTimeout = ref(null)
const likedIndicatorTimeout = ref(null)

// ===== COMPUTED PROPERTIES =====

// Nom du produit
const getProductName = computed(() => {
  return props.product.name || props.product.productName || t('products.unnamed')
})

// Image du produit
const getProductImage = computed(() => {
  return props.product.image ||
         props.product.images?.[0] ||
         'https://placehold.co/300x400/08717f/white?text=' + encodeURIComponent(getProductName.value)
})

// Nom du vendeur
const getVendorName = computed(() => {
  return props.product.vendor?.name ||
         props.product.vendorName ||
         t('vendor.artisan')
})

// Avatar du vendeur
const getVendorAvatar = computed(() => {
  return props.product.vendor?.avatar ||
         props.product.vendorAvatar ||
         'https://i.pravatar.cc/150?u=' + (props.product.vendorId || props.product.id)
})

// Vérification du vendeur
const isVendorVerified = computed(() => {
  return props.product.vendor?.verified || props.product.vendorVerified || false
})

// ID du vendeur
const getVendorId = computed(() => {
  return props.product.vendor?.id || props.product.vendorId || null
})

// Like status
const isLiked = computed(() => likesStore.isLiked(props.product.id))

// In cart status
const isInCart = computed(() => {
  return cartStore.isInCart(props.product.id)
})

// New product check
const isNew = computed(() => {
  if (props.product.isNew) return true
  if (!props.product.createdAt) return false
  const created = new Date(props.product.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})

// Discount check
const hasDiscount = computed(() => {
  const oldPrice = props.product.originalPrice || props.product.oldPrice
  return oldPrice && oldPrice > props.product.price
})

// Discount percentage
const discountPercentage = computed(() => {
  const oldPrice = props.product.originalPrice || props.product.oldPrice
  if (!oldPrice) return 0
  return Math.round(((oldPrice - props.product.price) / oldPrice) * 100)
})

// ===== METHODS =====
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const truncateDescription = (description) => {
  if (!description) return ''
  if (description.length > 60) {
    return description.substring(0, 60) + '...'
  }
  return description
}

const viewProduct = () => {
  router.push(`/product/${props.product.id}`)
}

const goToVendor = () => {
  const vendorId = getVendorId.value
  if (vendorId) {
    router.push(`/vendor/${vendorId}`)
  }
}

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/300x400/08717f/white?text=Produit'
}

const handleAvatarError = (e) => {
  e.target.src = 'https://i.pravatar.cc/150?u=' + (props.product.vendorId || props.product.id)
}

const toggleLike = async () => {
  // Clear existing timeouts
  if (likeAnimationTimeout.value) {
    clearTimeout(likeAnimationTimeout.value)
  }
  if (likedIndicatorTimeout.value) {
    clearTimeout(likedIndicatorTimeout.value)
  }

  const wasLiked = isLiked.value

  try {
    await likesStore.toggleLike(props.product)

    // Animation
    animateLike.value = true

    // Show indicator when liking
    if (!wasLiked) {
      showLikedIndicator.value = true
      likedIndicatorTimeout.value = setTimeout(() => {
        showLikedIndicator.value = false
      }, 1500)
    }

    // Emit events
    if (likesStore.isLiked(props.product.id)) {
      emit('liked', props.product)
    } else {
      emit('unliked', props.product.id)
    }

    // Reset animation
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
      name: getProductName.value,
      price: props.product.price,
      image: getProductImage.value,
      quantity: 1,
      vendorName: getVendorName.value,
      vendorId: getVendorId.value
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
  if (likedIndicatorTimeout.value) {
    clearTimeout(likedIndicatorTimeout.value)
  }
})
</script>

<style scoped>
/* === VARIABLES === */
.product-card {
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-teal-soft: #e0f5f7;
  --primary-teal-mist: #f0fafb;

  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --primary-red-soft: #ffe8ed;
  --primary-red-mist: #fff5f7;

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

  --card-radius: 12px;
  --card-shadow: 0 2px 8px rgba(8, 113, 127, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(8, 113, 127, 0.15);
  --transition-smooth: all 0.3s ease;
  --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* === BASE CARD === */
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
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--primary-teal);
}

/* === IMAGE CONTAINER (Ratio 3:4 comme SHEIN) === */
.product-image-container {
  position: relative;
  width: 100%;
  padding-top: 133.33%; /* 3:4 Aspect Ratio */
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
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* === BADGES - Compacts === */
.top-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
}

.badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge.sponsored {
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
}

.badge.new {
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
}

/* === QUICK ACTIONS === */
.quick-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  z-index: 2;
}

.product-card:hover .quick-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-bounce);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.action-btn:hover {
  transform: scale(1.15);
  background: white;
}

.like-btn.is-liked {
  background: var(--primary-red-soft);
  border-color: var(--primary-red);
}

.quick-view-btn {
  font-size: 16px;
}

.quick-view-btn:hover {
  background: var(--primary-teal);
  color: white;
  border-color: var(--primary-teal);
}

.heart-icon {
  width: 18px;
  height: 18px;
}

/* === HEART ANIMATION === */
@keyframes heartBeatPulse {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(0.9); }
  50% { transform: scale(1.2); }
  70% { transform: scale(1.1); }
}

.like-btn.is-liked {
  animation: heartBeatPulse 0.5s ease;
}

.animate-like {
  animation: likePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes likePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

/* === DISCOUNT BADGE === */
.discount-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(212, 0, 37, 0.3);
  z-index: 2;
}

/* === LIKED INDICATOR === */
.liked-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  color: white;
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(212, 0, 37, 0.4);
  z-index: 3;
  animation: bounceIn 0.4s ease;
  white-space: nowrap;
}

.liked-icon {
  font-size: 1rem;
  animation: heartBeat 1.5s infinite;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  70% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

/* === PRODUCT INFO - Compact === */
.product-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  background: white;
}

/* Vendor Info */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.vendor-info:hover {
  opacity: 0.8;
}

.vendor-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--neutral-200);
  transition: var(--transition-smooth);
}

.vendor-info:hover .vendor-avatar {
  border-color: var(--primary-teal);
}

.vendor-details {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vendor-name {
  font-size: 0.75rem;
  color: var(--neutral-600);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 700;
}

/* Product Name */
.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neutral-800);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5em;
  margin: 0;
}

/* Product Description */
.product-description {
  font-size: 0.75rem;
  color: var(--neutral-500);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 2px 0;
}

/* Rating Section - Compact */
.rating-section {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 12px;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.filled {
  opacity: 1;
  color: #fbbf24;
}

.star.half {
  opacity: 1;
  background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.rating-value {
  font-weight: 600;
  color: var(--neutral-700);
}

.reviews-count {
  color: var(--neutral-400);
}

/* Footer Section */
.footer-section {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--neutral-100);
}

.price-section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-teal);
  line-height: 1;
}

.original-price {
  font-size: 0.75rem;
  color: var(--neutral-400);
  text-decoration: line-through;
}

.actions-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.likes-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--primary-red-mist);
  border-radius: 20px;
  border: 1px solid var(--primary-red-soft);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.likes-counter:hover {
  background: var(--primary-red-soft);
  transform: translateY(-1px);
  border-color: var(--primary-red);
}

.likes-counter.liked {
  background: var(--primary-red-soft);
  border-color: var(--primary-red);
}

.likes-icon {
  font-size: 12px;
}

.likes-count {
  font-weight: 600;
  color: var(--primary-red);
}

.add-to-cart-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark));
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: var(--transition-bounce);
  box-shadow: 0 2px 8px rgba(8, 113, 127, 0.3);
  padding: 0;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 4px 12px rgba(8, 113, 127, 0.4);
}

.add-to-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-to-cart-btn.in-cart {
  background: linear-gradient(135deg, var(--primary-red), var(--primary-red-dark));
  box-shadow: 0 2px 8px rgba(212, 0, 37, 0.3);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .product-info {
    padding: 10px;
  }

  .product-name {
    font-size: 0.85rem;
  }

  .current-price {
    font-size: 1.1rem;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

  .add-to-cart-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .quick-actions {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .badge {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .vendor-name {
    max-width: 70px;
  }

  .product-card:hover {
    transform: translateY(-2px);
  }
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .product-image,
  .action-btn,
  .likes-counter,
  .add-to-cart-btn,
  .liked-indicator {
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
  .actions-section,
  .discount-badge {
    display: none;
  }

  .product-card {
    box-shadow: none;
    border: 1px solid var(--neutral-300);
    page-break-inside: avoid;
  }
}
</style>
