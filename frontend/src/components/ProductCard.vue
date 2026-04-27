<!--
  =============================================================
  COMPOSANT : ProductCard.vue
  DESCRIPTION : Carte produit réutilisable avec gestion des
                favoris, panier, badges, notations, dark mode
                et affichage du vendeur
  =============================================================
-->
<template>
  <div class="product-card" :class="{ 'dark-mode': isDarkMode }" @click="viewProduct">

    <!-- ===== CONTENEUR D'IMAGE ===== -->
    <div class="product-image-container">
      <img
        :src="getProductImage"
        :alt="getProductName"
        class="product-image"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- ===== BADGES EN HAUT À DROITE ===== -->
      <div class="top-badges">
        <span v-if="product.isSponsored" class="badge sponsored" title="منتج مميز">
          <span class="badge-icon">⭐</span>
        </span>
        <span v-if="isNew" class="badge new" title="جديد">
          <span class="badge-icon">🆕</span>
        </span>
        <span v-if="isBestSeller" class="badge best-seller" title="الأكثر مبيعاً">
          <span class="badge-icon">🏆</span>
        </span>
      </div>

      <!-- ===== ACTIONS RAPIDES EN HAUT À GAUCHE ===== -->
      <div class="quick-actions">
        <button
          class="action-btn like-btn"
          :class="{ 'is-liked': isLiked }"
          @click.stop="toggleLike"
          :aria-label="'إضافة إلى المفضلة'"
        >
          <svg class="heart-icon" viewBox="0 0 24 24">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              :fill="isLiked ? '#d40025' : 'none'"
              :stroke="isLiked ? '#d40025' : 'currentColor'"
              stroke-width="2"
            />
          </svg>
        </button>

        <button
          class="action-btn quick-view-btn"
          @click.stop="$emit('quick-view', product)"
          :aria-label="'عرض سريع'"
        >
          <span class="quick-view-icon">👁️</span>
        </button>
      </div>

      <!-- ===== BADGE DE RÉDUCTION ===== -->
      <div v-if="hasDiscount" class="discount-badge">
        -{{ discountPercentage }}%
      </div>

      <!-- ===== INDICATEUR "AJOUTÉ AUX FAVORIS" ===== -->
      <transition name="slide-fade">
        <div v-if="isLiked && showLikedIndicator" class="liked-indicator">
          <span class="liked-icon">❤️</span>
          <span class="liked-text">تمت الإضافة إلى المفضلة</span>
        </div>
      </transition>
    </div>

    <!-- ===== INFORMATIONS DU PRODUIT ===== -->
    <div class="product-info">

      <!-- ===== INFOS DU VENDEUR (BIEN VISIBLE) ===== -->
      <div class="vendor-info" @click.stop="goToVendor">
        <img
          :src="getVendorAvatar"
          :alt="getVendorName"
          class="vendor-avatar"
          @error="handleAvatarError"
        />
        <div class="vendor-details">
          <span class="vendor-name">{{ getVendorName }}</span>
          <span v-if="isVendorVerified" class="verified-badge" title="حرفي موثوق">✓</span>
        </div>
        <span class="vendor-arrow">←</span>
      </div>

      <!-- ===== NOM DU PRODUIT ===== -->
      <h3 class="product-name">{{ getProductName }}</h3>

      <!-- ===== SECTION NOTATION ===== -->
      <div class="rating-section">
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{
              filled: star <= getFullStars,
              half: star === getHalfStar,
            }"
          >
            <span class="star-icon">★</span>
          </span>
        </div>
        <span class="rating-value">{{ getAverageRating }}</span>
      </div>

      <!-- ===== PRIX ET ACTIONS ===== -->
      <div class="footer-section">
        <div class="price-section">
          <span class="current-price">{{ formatPrice(product.price) }} <span class="currency">د.ت</span></span>
          <span v-if="hasDiscount" class="original-price">
            {{ formatPrice(product.originalPrice || product.oldPrice) }} <span class="currency">د.ت</span>
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
            :title="isInCart ? 'تمت الإضافة إلى السلة' : 'إضافة إلى السلة'"
          >
            <span v-if="isAddingToCart" class="loading-spinner"></span>
            <span v-else-if="isInCart" class="cart-icon">✓</span>
            <span v-else class="cart-icon">🛒</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import { formatAvatarUrl, formatProductImageUrl } from '../utils/image.js'

// ===== PROPS =====
const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// ===== EMITS =====
const emit = defineEmits(['quick-view', 'added-to-cart', 'liked', 'unliked'])

// ===== ROUTER & STORES =====
const router = useRouter()
const likesStore = useLikesStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== ÉTAT LOCAL =====
const isAddingToCart = ref(false)
const showLikedIndicator = ref(false)
const likedIndicatorTimeout = ref(null)

// ===== FONCTIONS UTILITAIRES =====

const formatRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') return '0.0'
  if (typeof rating === 'string') {
    const parsed = parseFloat(rating)
    if (isNaN(parsed)) return '0.0'
    return parsed.toFixed(1)
  }
  if (typeof rating === 'number') return rating.toFixed(1)
  return '0.0'
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0'
  return new Intl.NumberFormat('ar-TN').format(price)
}

// ===== COMPUTED PROPERTIES =====

const getProductName = computed(() => {
  return props.product.name || props.product.productName || 'منتج'
})

const getProductImage = computed(() => {
  let imageSource = null
  if (props.product.image && props.product.image !== 'null') imageSource = props.product.image
  else if (props.product.images?.[0] && props.product.images[0] !== 'null') imageSource = props.product.images[0]
  else if (props.product.productImage && props.product.productImage !== 'null') imageSource = props.product.productImage
  else if (props.product.mainImage && props.product.mainImage !== 'null') imageSource = props.product.mainImage

  if (imageSource) {
    const formatted = formatProductImageUrl(imageSource)
    if (formatted) return formatted
  }
  return `https://placehold.co/300x400/08717f/white?text=${encodeURIComponent(getProductName.value.substring(0, 20))}`
})

const getVendorName = computed(() => {
  if (props.product.vendor?.name) return props.product.vendor.name
  if (props.product.vendor?.shopName) return props.product.vendor.shopName
  if (props.product.vendorName) return props.product.vendorName
  if (props.product.shopName) return props.product.shopName
  return 'حرفي'
})

const getVendorAvatar = computed(() => {
  let avatarSource = null
  if (props.product.vendor?.avatar && props.product.vendor.avatar !== 'null') {
    avatarSource = props.product.vendor.avatar
  } else if (props.product.vendor?.userAvatar && props.product.vendor.userAvatar !== 'null') {
    avatarSource = props.product.vendor.userAvatar
  } else if (props.product.vendorAvatar && props.product.vendorAvatar !== 'null') {
    avatarSource = props.product.vendorAvatar
  }

  if (avatarSource) {
    const formatted = formatAvatarUrl(avatarSource)
    if (formatted) return formatted
  }
  return `https://i.pravatar.cc/150?u=${props.product.vendorId || props.product.id || 'default'}`
})

const isVendorVerified = computed(() => {
  if (props.product.vendor?.verified) return props.product.vendor.verified
  return props.product.vendorVerified || false
})

const getVendorId = computed(() => {
  if (props.product.vendor?.id) return props.product.vendor.id
  return props.product.vendorId || null
})

const isLiked = computed(() => {
  return likesStore?.isLiked?.(props.product.id) || false
})

const isInCart = computed(() => {
  return cartStore?.isInCart?.(props.product.id) || false
})

const isNew = computed(() => {
  if (props.product.isNew) return true
  if (!props.product.createdAt) return false
  const created = new Date(props.product.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})

const isBestSeller = computed(() => {
  if (props.product.isBestSeller) return true
  const likes = props.product.likesCount || props.product.likes || 0
  return likes > 50
})

const hasDiscount = computed(() => {
  const oldPrice = props.product.originalPrice || props.product.oldPrice
  return oldPrice && oldPrice > props.product.price
})

const discountPercentage = computed(() => {
  const oldPrice = props.product.originalPrice || props.product.oldPrice
  if (!oldPrice || oldPrice <= props.product.price) return 0
  return Math.round(((oldPrice - props.product.price) / oldPrice) * 100)
})

const getFullStars = computed(() => {
  const rating = props.product.rating || 0
  return Math.floor(rating)
})

const getHalfStar = computed(() => {
  const rating = props.product.rating || 0
  return (rating % 1) >= 0.5 ? Math.ceil(rating) : 0
})

const getAverageRating = computed(() => {
  return formatRating(props.product.rating || 0)
})

// ===== MÉTHODES =====

const viewProduct = () => {
  if (props.product.id) router.push(`/product/${props.product.id}`)
}

const goToVendor = () => {
  const vendorId = getVendorId.value
  if (vendorId) router.push(`/vendor/${vendorId}`)
}

const handleImageError = (e) => {
  e.target.src = `https://placehold.co/300x400/08717f/white?text=${encodeURIComponent(getProductName.value.substring(0, 20))}`
}

const handleAvatarError = (e) => {
  e.target.src = `https://i.pravatar.cc/150?u=${props.product.vendorId || props.product.id || 'default'}`
}

const toggleLike = async () => {
  if (likedIndicatorTimeout.value) clearTimeout(likedIndicatorTimeout.value)

  const wasLiked = isLiked.value

  try {
    if (likesStore?.toggleLike) await likesStore.toggleLike(props.product)

    if (!wasLiked) {
      showLikedIndicator.value = true
      likedIndicatorTimeout.value = setTimeout(() => {
        showLikedIndicator.value = false
      }, 1500)
    }

    emit(wasLiked ? 'unliked' : 'liked', wasLiked ? props.product.id : props.product)
  } catch (error) {
    console.error('❌ Erreur toggle like:', error)
  }
}

const addToCart = async () => {
  if (isAddingToCart.value) return
  isAddingToCart.value = true

  try {
    if (cartStore?.addItem) {
      await cartStore.addItem({
        id: props.product.id,
        name: getProductName.value,
        price: props.product.price,
        image: getProductImage.value,
        quantity: 1,
        vendorName: getVendorName.value,
        vendorId: getVendorId.value
      })
    }
    emit('added-to-cart', props.product)
  } catch (error) {
    console.error('❌ Erreur ajout panier:', error)
  } finally {
    isAddingToCart.value = false
  }
}

// ===== NETTOYAGE =====
onUnmounted(() => {
  if (likedIndicatorTimeout.value) clearTimeout(likedIndicatorTimeout.value)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== POLICE AMIRI ===== */
.product-card,
.product-card * {
  font-family: 'Amiri', 'Cairo', serif;
}

/* ===== CARTE PRINCIPALE ===== */
.product-card {
  --primary-teal: #08717f;
  --primary-teal-dark: #065a69;
  --primary-red: #d40025;
  --primary-red-dark: #b00020;
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;

  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(8, 113, 127, 0.08);
  border: 1px solid var(--neutral-200);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.product-card.dark-mode {
  background: #1e293b;
  border-color: #334155;
  --neutral-50: #0f172a;
  --neutral-100: #1e293b;
  --neutral-200: #334155;
  --neutral-800: #f1f5f9;
  --neutral-600: #cbd5e1;
  --neutral-500: #94a3b8;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(8, 113, 127, 0.15);
  border-color: var(--primary-teal);
}

/* ===== CONTENEUR D'IMAGE ===== */
.product-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f0fafb 0%, #fff5f7 100%);
}

.product-card.dark-mode .product-image-container {
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.2) 0%, rgba(212, 0, 37, 0.2) 100%);
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

/* ===== BADGES ===== */
.top-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}

.badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge-icon { font-size: 14px; }

.badge.sponsored { background: linear-gradient(135deg, #08717f, #065a69); color: white; }
.badge.new { background: linear-gradient(135deg, #d40025, #b00020); color: white; }
.badge.best-seller { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #78350f; }

/* ===== ACTIONS RAPIDES ===== */
.quick-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.product-card.dark-mode .action-btn {
  background: rgba(30, 41, 59, 0.95);
  color: #94a3b8;
}

.action-btn:hover {
  transform: scale(1.15);
  background: white;
}

.like-btn.is-liked {
  background: #ffe8ed;
  border: 2px solid #d40025;
}

.heart-icon { width: 18px; height: 18px; }
.quick-view-icon { font-size: 16px; }

/* ===== BADGE RÉDUCTION ===== */
.discount-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  z-index: 2;
}

/* ===== INDICATEUR FAVORI ===== */
.liked-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 600;
  z-index: 3;
  animation: bounceIn 0.4s ease;
  white-space: nowrap;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  70% { transform: translate(-50%, -50%) scale(1.1); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
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

/* ===== INFORMATIONS PRODUIT ===== */
.product-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

/* ===== VENDEUR (BIEN VISIBLE) ===== */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.product-card.dark-mode .vendor-info {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.vendor-info:hover {
  background: linear-gradient(135deg, #e0f2f1 0%, #f0fafb 100%);
  border-color: #08717f;
  transform: translateX(-4px);
}

.product-card.dark-mode .vendor-info:hover {
  background: linear-gradient(135deg, #0f766e20 0%, #0e749020 100%);
  border-color: #0a94a6;
}

.vendor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #08717f;
  flex-shrink: 0;
}

.vendor-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.vendor-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card.dark-mode .vendor-name {
  color: #f1f5f9;
}

.verified-badge {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vendor-arrow {
  color: #08717f;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.vendor-info:hover .vendor-arrow {
  transform: translateX(-4px);
}

/* ===== NOM DU PRODUIT ===== */
.product-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.product-card.dark-mode .product-name {
  color: #f1f5f9;
}

/* ===== SECTION NOTATION ===== */
.rating-section {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.stars { display: flex; gap: 2px; }
.star { font-size: 14px; color: #d1d5db; }
.star.filled { color: #fbbf24; }

.rating-value {
  font-weight: 700;
  color: #334155;
}

.product-card.dark-mode .rating-value {
  color: #cbd5e1;
}

/* ===== FOOTER (PRIX + ACTIONS) ===== */
.footer-section {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.product-card.dark-mode .footer-section {
  border-top-color: #334155;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.current-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: #08717f;
}

.currency { font-size: 0.75rem; }

.original-price {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.actions-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.likes-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff5f7;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.likes-counter:hover {
  background: #ffe8ed;
}

.likes-count {
  font-weight: 600;
  color: #d40025;
}

.add-to-cart-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  transform: scale(1.05);
}

.add-to-cart-btn.in-cart {
  background: linear-gradient(135deg, #d40025, #b00020);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .product-info { padding: 10px; }
  .product-name { font-size: 0.9rem; }
  .current-price { font-size: 1.2rem; }
  .quick-actions { opacity: 1; transform: translateX(0); }
  .vendor-avatar { width: 30px; height: 30px; }
  .vendor-name { font-size: 0.8rem; }
}

@media (max-width: 480px) {
  .product-card:hover { transform: translateY(-2px); }
  .vendor-info { padding: 6px 10px; }
  .vendor-avatar { width: 28px; height: 28px; }
}
</style>
