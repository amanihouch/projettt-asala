<!-- frontend/src/views/ProductDetail.vue - VERSION COMPLÈTE -->
<template>
  <div class="product-detail-page" :class="{ 'dark-mode': isDarkMode }">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>جاري تحميل المنتج...</p>
    </div>

    <div v-else-if="product" class="product-detail">
      <div class="container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <router-link to="/">الرئيسية</router-link>
          <span class="separator">›</span>
          <router-link :to="`/products?category=${product.category}`">{{ getCategoryName(product.category) }}</router-link>
          <span class="separator">›</span>
          <span class="current">{{ truncateText(product.productName, 40) }}</span>
        </div>

        <!-- Product Main -->
        <div class="product-main-large">
          <!-- LEFT: Gallery -->
          <div class="product-gallery-large">
            <div class="main-image-container-large">
              <img :src="currentImage" :alt="product.productName" class="main-image-large" @error="handleImageError" />
              <button v-if="product.images?.length > 1" class="nav-btn-large prev" @click="prevImage">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button v-if="product.images?.length > 1" class="nav-btn-large next" @click="nextImage">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <div v-if="getDiscount() > 0" class="discount-flag-large">-{{ getDiscount() }}%</div>
              <!-- Quantité réelle disponible (mise à jour automatique) -->
              <div v-if="getAvailableStock() === 0" class="stock-flag-large out">نفد من المخزون</div>
              <div v-else-if="getAvailableStock() < 5" class="stock-flag-large low">⚡ {{ getAvailableStock() }} قطع فقط متبقية</div>
            </div>

            <div v-if="product.images?.length > 1" class="thumbnail-list-large">
              <div
                v-for="(img, idx) in product.images"
                :key="idx"
                class="thumbnail-large"
                :class="{ active: currentImageIndex === idx }"
                @click="selectImage(idx)"
              >
                <img :src="img" :alt="product.productName" @error="handleThumbnailError" />
              </div>
            </div>
          </div>

          <!-- RIGHT: Product Info -->
          <div class="product-info-large">
            <h1 class="product-title-large">{{ product.productName }}</h1>

            <!-- Avis et notes (affichage direct sans bouton) -->
            <div class="rating-section" @click="scrollToReviews">
              <div class="stars-container">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= product.averageRating }">★</span>
              </div>
              <span class="rating-count">({{ product.reviewsCount || 0 }} تقييم)</span>
              <span class="view-reviews">شاهد التقييمات →</span>
            </div>

            <!-- Vendor Info -->
            <div class="vendor-section-large" @click="goToVendor">
              <div class="vendor-avatar-large">
                <img :src="product.vendorAvatar || defaultAvatar" alt="" @error="handleAvatarError" />
              </div>
              <div class="vendor-info-large">
                <div class="vendor-name-large">{{ product.vendorName || 'حرفي' }}</div>
                <div class="vendor-meta-large">
                  <span v-if="product.vendorVerified" class="verified-large">✓ موثق</span>
                </div>
              </div>
              <button class="follow-vendor-btn-large" :class="{ active: isFollowing }" @click.stop="toggleFollowVendor">
                {{ isFollowing ? 'متابع' : 'متابعة' }}
              </button>
            </div>

            <!-- Price Section -->
            <div class="price-section-large">
              <div class="current-price-large">{{ formatPrice(product.price) }} <span class="currency-large">د.ت</span></div>
              <div v-if="product.oldPrice" class="old-price-large">{{ formatPrice(product.oldPrice) }} <span class="currency-large">د.ت</span></div>
              <div v-if="getDiscount() > 0" class="discount-badge-large">تخفيض {{ getDiscount() }}%</div>
            </div>

            <p class="product-description-large">{{ truncateText(product.description || 'لا يوجد وصف للمنتج', 200) }}</p>

            <!-- Couleurs -->
            <div v-if="product.hasColors && product.colors && product.colors.length > 0" class="option-section-large">
              <div class="option-label-large">
                <span class="option-icon-large">🎨</span>
                <span>اللون</span>
                <span class="required-star-large">*</span>
              </div>
              <div class="color-options-large">
                <button
                  v-for="color in product.colors"
                  :key="color"
                  class="color-btn-large"
                  :class="{ active: selectedColor === color }"
                  :style="{ backgroundColor: getColorCode(color) }"
                  @click="selectColor(color)"
                  :title="getColorName(color)"
                >
                  <span v-if="selectedColor === color" class="check-icon-large">✓</span>
                </button>
              </div>
              <div v-if="selectedColor" class="selected-info-large">
                <span>اللون المختار: <strong>{{ getColorName(selectedColor) }}</strong></span>
              </div>
            </div>

            <!-- Tailles -->
            <div v-if="product.unit === 'piece' && product.sizes && product.sizes.length > 0" class="option-section-large">
              <div class="option-label-large">
                <span class="option-icon-large">📏</span>
                <span>المقاس</span>
                <span class="required-star-large">*</span>
              </div>
              <div class="size-options-large">
                <button
                  v-for="size in product.sizes"
                  :key="size.name"
                  class="size-btn-large"
                  :class="{ active: selectedSize === size.name, disabled: size.stock === 0 }"
                  @click="selectSize(size.name)"
                  :disabled="size.stock === 0"
                >
                  {{ size.name }}
                  <span v-if="size.stock === 0" class="out-stock-badge-large">(نفد)</span>
                  <span v-else-if="size.stock < 10" class="low-stock-badge-large">({{ size.stock }} متبقية)</span>
                </button>
              </div>
              <div v-if="selectedSize" class="selected-info-large">
                <span>المقاس المختار: <strong>{{ selectedSize }}</strong></span>
              </div>
            </div>

            <!-- Quantité avec mise à jour automatique -->
            <div class="option-section-large">
              <div class="option-label-large">
                <span class="option-icon-large">🔢</span>
                <span>الكمية</span>
                <span class="required-star-large">*</span>
              </div>
              <div class="quantity-selector-large">
                <button class="qty-btn-large" @click="decrementQty" :disabled="quantity <= 1">-</button>
                <input
                  type="number"
                  v-model.number="quantity"
                  class="qty-input-large"
                  min="1"
                  :max="getAvailableStock()"
                  @input="validateQuantity"
                />
                <button class="qty-btn-large" @click="incrementQty" :disabled="quantity >= getAvailableStock()">+</button>
                <span class="unit-text-large">{{ getUnitLabel(product.unit) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="actions-section-large">
              <button class="add-to-cart-btn-large" @click="addToCart" :disabled="!isProductAvailable()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span>إضافة إلى السلة</span>
              </button>

              <button class="wishlist-btn-large" :class="{ active: isFavorite }" @click="toggleFavorite">
                <svg width="24" height="24" viewBox="0 0 24 24" :fill="isFavorite ? '#ef4444' : 'none'" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ isFavorite ? 'تمت الإضافة إلى المفضلة' : 'أضف إلى المفضلة' }}</span>
              </button>
            </div>

            <!-- Secure Payment -->
            <div class="secure-payment-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>دفع آمن ومضمون</span>
            </div>

            <!-- Livraison -->
            <div v-if="product.hasShipping && product.shippingCost > 0" class="shipping-info-large">
              <div class="shipping-header-large">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span>معلومات التوصيل</span>
              </div>
              <div class="shipping-details-large">
                <div class="shipping-row-large">
                  <span class="shipping-label-large">تكلفة التوصيل:</span>
                  <span class="shipping-value-large">{{ formatPrice(product.shippingCost) }} د.ت</span>
                </div>
                <div class="shipping-row-large">
                  <span class="shipping-label-large">مدة التوصيل:</span>
                  <span class="shipping-value-large">{{ product.shippingTime }} {{ product.shippingTime === 1 ? 'يوم' : 'أيام' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="free-shipping-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>توصيل مجاني لجميع أنحاء تونس</span>
            </div>
          </div>
        </div>

        <!-- Description Détaillée -->
        <div class="detail-description-large">
          <h3 class="detail-title-large">وصف المنتج</h3>
          <p class="detail-text-large">{{ product.description || 'لا يوجد وصف لهذا المنتج.' }}</p>
        </div>

        <!-- ===== SECTION COMMENTAIRES ET NOTES (INTÉGRÉE DIRECTEMENT) ===== -->
        <div class="reviews-section" ref="reviewsSection">
          <div class="reviews-header">
            <div class="reviews-title-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h3 class="reviews-title">تقييمات العملاء</h3>
            </div>
            <div class="reviews-summary">
              <div class="average-rating">
                <span class="rating-number">{{ product.averageRating || 0 }}</span>
                <span class="rating-out">/5</span>
                <div class="stars-large">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= (product.averageRating || 0) }">★</span>
                </div>
                <span class="total-reviews">بناءً على {{ product.reviewsCount || 0 }} تقييم</span>
              </div>
            </div>
          </div>

          <!-- Formulaire d'évaluation intégré directement -->
          <div class="review-form-inline">
            <h4 class="review-form-title">قيم هذا المنتج</h4>

            <div class="rating-input-inline">
              <label>تقييمك:</label>
              <div class="rating-stars-input-inline">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star-input-inline"
                  :class="{ active: star <= newReview.rating }"
                  @click="newReview.rating = star"
                  @mouseover="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  {{ (hoverRating || newReview.rating) >= star ? '★' : '☆' }}
                </span>
              </div>
              <span class="rating-label-inline">
                {{ getRatingLabel(hoverRating || newReview.rating) }}
              </span>
            </div>

            <div class="comment-input-inline">
              <textarea
                v-model="newReview.comment"
                rows="3"
                placeholder="اكتب تجربتك مع هذا المنتج..."
                class="review-textarea-inline"
              ></textarea>
            </div>

            <button
              class="submit-review-inline-btn"
              @click="submitReviewInline"
              :disabled="submittingReview || !newReview.comment.trim()"
            >
              {{ submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم ✨' }}
            </button>
          </div>

          <!-- Liste des commentaires -->
          <div class="reviews-divider"></div>

          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <img :src="review.userAvatar || defaultAvatar" class="reviewer-avatar" />
                  <div>
                    <div class="reviewer-name">{{ review.userName }}</div>
                    <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                  </div>
                </div>
                <div class="review-stars">
                  <span v-for="i in 5" :key="i" class="star small" :class="{ filled: i <= review.rating }">★</span>
                </div>
              </div>
              <div class="review-content">
                <p>{{ review.comment }}</p>
              </div>
              <div class="review-footer">
                <button class="helpful-btn" @click="markHelpful(review.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                  <span>{{ review.helpfulCount || 0 }} مفيد</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="no-reviews">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <p>لا توجد تقييمات بعد</p>
            <p class="be-first">كن أول من يقيم هذا المنتج</p>
          </div>
        </div>

        <!-- ===== REELS LIÉS À CE PRODUIT ===== -->
        <div v-if="productReels.length > 0" class="product-reels-section">
          <div class="section-header-large">
            <div class="header-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
            </div>
            <h2 class="section-title-large">فيديوهات قصيرة (Reels) لهذا المنتج</h2>
          </div>

          <div class="reels-grid">
            <div
              v-for="reel in productReels"
              :key="reel.id"
              class="reel-card"
              @click="openReelModal(reel)"
            >
              <div class="reel-thumbnail">
                <video :src="reel.videoUrl" class="reel-video-thumb" preload="metadata" muted></video>
                <div class="reel-play-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                    <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
                  </svg>
                </div>
                <div class="reel-views">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"/>
                  </svg>
                  <span>{{ reel.views || 0 }}</span>
                </div>
              </div>
              <div class="reel-info">
                <h4 class="reel-title">{{ truncateText(reel.title, 30) }}</h4>
                <p class="reel-description">{{ truncateText(reel.description || '', 50) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Produits Similaires -->
        <div v-if="similarProducts.length > 0" class="similar-section-large">
          <div class="section-header-large">
            <div class="header-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h2 class="section-title-large">منتجات مشابهة قد تعجبك</h2>
          </div>

          <div class="similar-grid-large">
            <div v-for="item in similarProducts" :key="item.id" class="similar-card-large" @click="goToProduct(item.id)">
              <div class="card-image-large">
                <img :src="getProductImage(item)" :alt="item.productName || item.name" @error="handleSimilarImageError" />
                <div v-if="item.oldPrice && item.oldPrice > item.price" class="card-discount">-{{ Math.round((1 - item.price/item.oldPrice) * 100) }}%</div>
              </div>
              <div class="card-info-large">
                <h4>{{ truncateText(item.productName || item.name, 35) }}</h4>
                <div class="card-price-large">
                  <span class="current-price-card">{{ formatPrice(item.price) }} د.ت</span>
                  <span v-if="item.oldPrice" class="old-price-card">{{ formatPrice(item.oldPrice) }} د.ت</span>
                </div>
                <div class="card-vendor">
                  <img :src="item.vendorAvatar || defaultAvatar" class="vendor-avatar-small" />
                  <span>{{ truncateText(item.vendorName || 'حرفي', 15) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <div class="container">
        <h2>المنتج غير موجود</h2>
        <router-link to="/" class="back-home">العودة إلى الرئيسية</router-link>
      </div>
    </div>

    <!-- Reel Modal -->
    <transition name="modal-fade">
      <div v-if="showReelModal" class="reel-modal-overlay" @click.self="closeReelModal">
        <div class="reel-modal-content">
          <button class="reel-modal-close" @click="closeReelModal">✕</button>
          <div class="reel-modal-video-container">
            <video :src="selectedReel?.videoUrl" class="reel-modal-video" controls autoplay loop></video>
          </div>
          <div class="reel-modal-info">
            <h3>{{ selectedReel?.title }}</h3>
            <p>{{ selectedReel?.description }}</p>
            <div class="reel-modal-stats">
              <span>👁️ {{ selectedReel?.views || 0 }} مشاهدة</span>
              <span>❤️ {{ selectedReel?.likes || 0 }} إعجاب</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { usePostStore } from '../stores/postStore'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const postStore = usePostStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(true)
const product = ref(null)
const similarProducts = ref([])
const productReels = ref([])
const currentImage = ref('')
const currentImageIndex = ref(0)
const selectedColor = ref(null)
const selectedSize = ref(null)
const quantity = ref(1)
const isFollowing = ref(false)
const defaultAvatar = 'https://i.pravatar.cc/100'
const showReelModal = ref(false)
const selectedReel = ref(null)

// États pour les commentaires
const reviews = ref([])
const submittingReview = ref(false)
const hoverRating = ref(0)
const newReview = ref({ rating: 5, comment: '' })
const reviewsSection = ref(null)

const toast = ref({ show: false, message: '', type: 'success', icon: '✓' })

// Computed
const isFavorite = computed(() => {
  if (!product.value?.id) return false
  return likesStore.isLiked(product.value.id)
})

// ===== FONCTIONS STOCK =====
const getAvailableStock = () => {
  if (!product.value) return 0
  if (product.value.sizes?.length > 0 && selectedSize.value) {
    const size = product.value.sizes.find(s => s.name === selectedSize.value)
    if (size) return size.stock
  }
  return product.value.quantity || 0
}

const getDiscount = () => {
  if (!product.value?.oldPrice || product.value?.oldPrice <= product.value?.price) return 0
  return Math.round(((product.value.oldPrice - product.value.price) / product.value.oldPrice) * 100)
}

const isProductAvailable = () => {
  if (!product.value) return false
  if (getAvailableStock() <= 0) return false
  if (product.value.hasColors && product.value.colors?.length > 0 && !selectedColor.value) return false
  if (product.value.unit === 'piece' && product.value.sizes?.length > 0 && !selectedSize.value) return false
  return true
}

const getColorCode = (color) => {
  const colorMap = {
    '#FF0000': '#FF0000', '#0000FF': '#0000FF', '#00FF00': '#00FF00',
    '#FFFF00': '#FFFF00', '#000000': '#000000', '#FFFFFF': '#FFFFFF',
    '#FFC0CB': '#FFC0CB', '#FFA500': '#FFA500', '#800080': '#800080',
    '#8B4513': '#8B4513', '#808080': '#808080', '#FFD700': '#FFD700',
    'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00',
    'yellow': '#FFFF00', 'black': '#000000', 'white': '#FFFFFF',
    'pink': '#FFC0CB', 'orange': '#FFA500', 'purple': '#800080',
    'brown': '#8B4513', 'gray': '#808080', 'gold': '#FFD700'
  }
  return colorMap[color] || color || '#64748b'
}

const getColorName = (color) => {
  const nameMap = {
    '#FF0000': 'أحمر', '#0000FF': 'أزرق', '#00FF00': 'أخضر',
    '#FFFF00': 'أصفر', '#000000': 'أسود', '#FFFFFF': 'أبيض',
    '#FFC0CB': 'وردي', '#FFA500': 'برتقالي', '#800080': 'بنفسجي',
    '#8B4513': 'بني', '#808080': 'رمادي', '#FFD700': 'ذهبي',
    'red': 'أحمر', 'blue': 'أزرق', 'green': 'أخضر',
    'yellow': 'أصفر', 'black': 'أسود', 'white': 'أبيض',
    'pink': 'وردي', 'orange': 'برتقالي', 'purple': 'بنفسجي',
    'brown': 'بني', 'gray': 'رمادي', 'gold': 'ذهبي'
  }
  return nameMap[color] || color
}

const getUnitLabel = (unit) => {
  const units = {
    piece: 'قطعة', set: 'مجموعة', kg: 'كغ', gram: 'غ',
    liter: 'لتر', milliliter: 'مل', meter: 'متر', centimeter: 'سم',
    pair: 'زوج', box: 'علبة', pack: 'باقة'
  }
  return units[unit] || unit
}

const getCategoryName = (cat) => {
  const categories = {
    perfumes: 'عطور', jewelry: 'حلي و اكسسوارات', clothing: 'ملابس',
    decoration: 'ديكور', textiles: 'أقمشة وسجادات', pottery: 'أواني',
    beauty: 'عناية وتجميل', food: 'أغذية', other: 'أخرى'
  }
  return categories[cat] || cat
}

const getProductImage = (item) => {
  if (Array.isArray(item.images) && item.images.length > 0) return item.images[0]
  if (typeof item.images === 'string') {
    try { const parsed = JSON.parse(item.images); return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : item.images }
    catch { return item.images }
  }
  const id = item.id || item.productId
  if (id) return `https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/posts/post_${id}.jpg`
  return 'https://placehold.co/400x400/08717f/white?text=+'
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-TN').format(price)
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getRatingLabel = (rating) => {
  const labels = { 1: 'سيء جداً', 2: 'سيء', 3: 'مقبول', 4: 'جيد', 5: 'ممتاز' }
  return labels[rating] || ''
}

const showToast = (message, type = 'success') => {
  const icons = { success: '✓', warning: '⚠', error: '✗', info: 'ℹ' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Selection
const selectColor = (color) => { selectedColor.value = color; quantity.value = 1 }
const selectSize = (size) => { selectedSize.value = size; quantity.value = 1 }
const selectImage = (index) => {
  if (product.value.images && product.value.images[index]) {
    currentImageIndex.value = index
    currentImage.value = product.value.images[index]
  }
}

const validateQuantity = () => {
  if (quantity.value < 1) quantity.value = 1
  const maxQty = getAvailableStock()
  if (quantity.value > maxQty) quantity.value = maxQty
}

const incrementQty = () => { if (quantity.value < getAvailableStock()) quantity.value++ }
const decrementQty = () => { if (quantity.value > 1) quantity.value-- }
const nextImage = () => {
  if (product.value.images && currentImageIndex.value < product.value.images.length - 1) {
    currentImageIndex.value++
    currentImage.value = product.value.images[currentImageIndex.value]
  }
}
const prevImage = () => {
  if (product.value.images && currentImageIndex.value > 0) {
    currentImageIndex.value--
    currentImage.value = product.value.images[currentImageIndex.value]
  }
}

const scrollToReviews = () => {
  if (reviewsSection.value) reviewsSection.value.scrollIntoView({ behavior: 'smooth' })
}

// ===== COMMENTAIRES =====
const submitReviewInline = async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (!newReview.value.comment.trim()) { showToast('الرجاء كتابة تعليق', 'warning'); return }
  submittingReview.value = true
  try {
    const response = await api.post(`/reviews/products/${product.value.id}`, {
      rating: newReview.value.rating,
      comment: newReview.value.comment
    })
    if (response.data.success) {
      showToast('تم إضافة تقييمك بنجاح 🌟', 'success')
      newReview.value = { rating: 5, comment: '' }
      await loadReviews()
      if (product.value && response.data.data) {
        product.value.averageRating = response.data.data.averageRating
        product.value.reviewsCount = response.data.data.reviewsCount
      }
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'حدث خطأ', 'error')
  } finally {
    submittingReview.value = false
  }
}

const loadReviews = async () => {
  if (!product.value?.id) return
  try {
    const response = await api.get(`/reviews/products/${product.value.id}`)
    if (response.data.success) reviews.value = response.data.data.reviews || []
  } catch (error) { reviews.value = [] }
}

const markHelpful = async (reviewId) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  try {
    await api.post(`/reviews/${reviewId}/helpful`)
    const review = reviews.value.find(r => r.id === reviewId)
    if (review) review.helpfulCount = (review.helpfulCount || 0) + 1
    showToast('شكراً لتقييمك 👍', 'success')
  } catch (error) { showToast(error.response?.data?.message || 'حدث خطأ', 'warning') }
}

// Reel Modal
const openReelModal = (reel) => { selectedReel.value = reel; showReelModal.value = true; document.body.style.overflow = 'hidden' }
const closeReelModal = () => { showReelModal.value = false; selectedReel.value = null; document.body.style.overflow = '' }

// Image Error Handlers
const handleImageError = (e) => {
  const id = product.value?.id
  e.target.src = id ? `https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/posts/post_${id}.jpg` : `https://placehold.co/800x800/08717f/white?text=Produit`
}
const handleThumbnailError = (e) => { e.target.src = 'https://placehold.co/100x100/08717f/white?text=+' }
const handleAvatarError = (e) => { e.target.src = defaultAvatar }
const handleSimilarImageError = (e) => { e.target.src = 'https://placehold.co/400x400/08717f/white?text=+' }

// ===== ✅ ADD TO CART =====
const addToCart = () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (!isProductAvailable()) {
    if (product.value?.hasColors && product.value.colors?.length > 0 && !selectedColor.value) showToast('⚠️ الرجاء اختيار لون', 'warning')
    else if (product.value?.unit === 'piece' && product.value.sizes?.length > 0 && !selectedSize.value) showToast('⚠️ الرجاء اختيار مقاس', 'warning')
    else showToast('⚠️ هذا المنتج غير متوفر حالياً', 'warning')
    return
  }

  const qty = quantity.value
  cartStore.addItem({
    id: parseInt(product.value.id),
    productId: parseInt(product.value.id),
    name: product.value.productName, price: product.value.price,
    image: currentImage.value, images: product.value.images,
    quantity: qty, vendorName: product.value.vendorName,
    vendorId: product.value.vendorId, size: selectedSize.value,
    color: selectedColor.value, unit: product.value.unit,
    oldPrice: product.value.oldPrice, discount: getDiscount()
  })

  quantity.value = 1
  showToast('✅ تمت إضافة المنتج إلى السلة', 'success')
}

const syncStockWithBackend = async (qtySold) => {
  try {
    await api.put(`/stock/${product.value.id}`, { quantity: qtySold, size: selectedSize.value || null })
  } catch (error) {}
}

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  likesStore.toggleLike(product.value)
  showToast(isFavorite.value ? '🗑️ تمت الإزالة من المفضلة' : '❤️ تمت الإضافة إلى المفضلة')
}

const toggleFollowVendor = async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  try {
    const res = await api.post(`/vendors/${product.value.vendorId}/follow`)
    if (res.data.success) { isFollowing.value = res.data.data.following; showToast(isFollowing.value ? '✅ تمت المتابعة' : '👋 تم إلغاء المتابعة') }
  } catch (err) { isFollowing.value = !isFollowing.value }
}

const goToVendor = () => { if (product.value?.vendorId) router.push(`/vendor/${product.value.vendorId}`) }
const goToProduct = (id) => { if (id) router.push(`/product/${id}`) }

// Load Product Reels
const loadProductReels = async (productId) => {
  if (!productId) { productReels.value = []; return }
  try {
    const response = await api.get('/reels')
    if (response.data?.success) {
      const allReels = response.data.data?.reels || response.data.reels || []
      productReels.value = allReels.filter(r => r && r.videoUrl && r.productId == productId)
    }
  } catch (error) { productReels.value = [] }
}

// Load Product
const loadProduct = async () => {
  const id = route.params.id
  if (!id) return
  loading.value = true
  try {
    let productData = null
    try {
      const response = await api.get(`/posts/${id}`)
      if (response.data.success) productData = response.data.data.post || response.data.data
    } catch (err) {}
    if (!productData) productData = await postStore.fetchPostById(id)

    if (productData) {
      product.value = {
        id: parseInt(productData.id),
        vendorId: productData.vendorId || productData.vendor_id,
        productName: productData.productName || productData.product_name || productData.title || 'منتج حرفي',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
        category: productData.category || null,
        images: (() => {
          if (Array.isArray(productData.images)) return productData.images
          if (typeof productData.images === 'string') { try { return JSON.parse(productData.images) } catch { return productData.images ? [productData.images] : [] } }
          return []
        })(),
        colors: (() => {
          if (Array.isArray(productData.colors)) return productData.colors
          if (typeof productData.colors === 'string') { try { return JSON.parse(productData.colors) } catch { return [] } }
          return []
        })(),
        hasColors: productData.hasColors === true || productData.hasColors === 1,
        sizes: (() => {
          if (Array.isArray(productData.sizes)) return productData.sizes
          if (typeof productData.sizes === 'string') { try { return JSON.parse(productData.sizes) } catch { return [] } }
          return []
        })(),
        unit: productData.unit || 'piece',
        quantity: parseInt(productData.quantity) || 1,
        hasShipping: productData.hasShipping === true || productData.hasShipping === 1,
        shippingCost: parseFloat(productData.shippingCost || 0),
        shippingTime: parseInt(productData.shippingTime) || 3,
        vendorName: productData.vendorName || productData.shopName || productData.userName || 'حرفي',
        vendorAvatar: productData.vendorAvatar || productData.userAvatar || null,
        vendorVerified: productData.vendorVerified === true || productData.vendorVerified === 1,
        likes: parseInt(productData.likes) || 0,
        averageRating: parseFloat(productData.averageRating) || 0,
        reviewsCount: parseInt(productData.reviewsCount) || 0,
        status: productData.status || 'pending',
        createdAt: productData.createdAt || new Date().toISOString()
      }

      if (product.value.images?.length > 0) { currentImage.value = product.value.images[0]; currentImageIndex.value = 0 }
      if (product.value.hasColors && product.value.colors?.length > 0) selectedColor.value = product.value.colors[0]
      if (product.value.sizes?.length > 0) {
        const availableSize = product.value.sizes.find(s => s.stock > 0)
        if (availableSize) selectedSize.value = availableSize.name
      }

      await Promise.all([loadProductReels(product.value.id), loadReviews()])

      try {
        const similarRes = await api.get('/posts/feed?limit=4')
        if (similarRes.data.success) {
          const posts = similarRes.data.data?.posts || similarRes.data.data || []
          similarProducts.value = posts.filter(p => p.id !== product.value.id).slice(0, 4)
        }
      } catch (err) {}
    } else {
      showToast('المنتج غير موجود', 'error')
      setTimeout(() => router.push('/'), 2000)
    }
  } catch (err) {
    showToast('حدث خطأ في تحميل المنتج', 'error')
  } finally {
    loading.value = false
  }
}

// ===== ✅ ÉCOUTER LES CHANGEMENTS DE QUANTITÉ DU PANIER =====
const handleCartQuantityChange = (event) => {
  const { productId, change } = event.detail
  if (product.value && parseInt(product.value.id) === parseInt(productId)) {
    if (product.value.quantity !== undefined) {
      const oldQty = product.value.quantity
      product.value.quantity = Math.max(0, product.value.quantity + change)
      console.log(`📊 Stock: ${oldQty} → ${product.value.quantity} (${change > 0 ? '+' : ''}${change})`)
    }
  }
}

onMounted(() => {
  console.log('📄 ProductDetail monté, ID:', route.params.id)
  loadProduct()
  window.addEventListener('cartQuantityChanged', handleCartQuantityChange)
})

onUnmounted(() => {
  window.removeEventListener('cartQuantityChanged', handleCartQuantityChange)
})
</script>
<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.product-detail-page,
.product-detail-page * {
  font-family: 'Amiri', 'Cairo', 'Segoe UI', serif;
}

.product-detail-page {
  background: #fafbfc;
  direction: rtl;
  min-height: 100vh;
  padding: 40px 0 80px;
}

.product-detail-page.dark-mode {
  background: #0f172a;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 30px;
  font-size: 15px;
  color: #64748b;
}

.breadcrumb a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #08717f;
}

.separator {
  color: #cbd5e1;
}

.current {
  color: #1e293b;
  font-weight: 500;
}

.dark-mode .current {
  color: #f1f5f9;
}

/* Product Main */
.product-main-large {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  background: white;
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.dark-mode .product-main-large {
  background: #1e293b;
}

/* Gallery */
.product-gallery-large {
  position: sticky;
  top: 100px;
}

.main-image-container-large {
  position: relative;
  aspect-ratio: 1;
  background: #f8fafc;
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 24px;
}

.main-image-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-btn-large {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  color: #1e293b;
}

.nav-btn-large:hover {
  background: #08717f;
  color: white;
}

.nav-btn-large.prev {
  left: 20px;
}

.nav-btn-large.next {
  right: 20px;
}

.discount-flag-large {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #d40025;
  color: white;
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 700;
  z-index: 10;
}

.stock-flag-large {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10;
}

.stock-flag-large.out {
  background: #1e293b;
  color: white;
}

.stock-flag-large.low {
  background: #f59e0b;
  color: white;
}

.thumbnail-list-large {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumbnail-large {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.thumbnail-large.active {
  border-color: #08717f;
}

.thumbnail-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info */
.product-info-large {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-title-large {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.dark-mode .product-title-large {
  color: #f1f5f9;
}

/* Rating Section */
.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  border-top: 1px solid #eef2f6;
  border-bottom: 1px solid #eef2f6;
  margin-bottom: 16px;
}

.dark-mode .rating-section {
  border-color: #334155;
}

.stars-container {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 18px;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s;
}

.star.filled {
  color: #fbbf24;
}

.rating-count {
  color: #64748b;
  font-size: 14px;
}

.view-reviews {
  color: #08717f;
  font-size: 14px;
  font-weight: 500;
}

/* Vendor Section */
.vendor-section-large {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .vendor-section-large {
  background: #0f172a;
}

.vendor-section-large:hover {
  background: #f1f5f9;
}

.vendor-avatar-large {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
}

.vendor-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-info-large {
  flex: 1;
}

.vendor-name-large {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.dark-mode .vendor-name-large {
  color: #f1f5f9;
}

.vendor-meta-large {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
}

.verified-large {
  color: #10b981;
  font-weight: 600;
}

.follow-vendor-btn-large {
  padding: 12px 28px;
  background: white;
  border: 2px solid #08717f;
  border-radius: 40px;
  color: #08717f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-vendor-btn-large:hover {
  background: #08717f;
  color: white;
}

.follow-vendor-btn-large.active {
  background: #08717f;
  color: white;
}

/* Price Section */
.price-section-large {
  display: flex;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid #eef2f6;
}

.dark-mode .price-section-large {
  border-bottom-color: #334155;
}

.current-price-large {
  font-size: 42px;
  font-weight: 800;
  color: #d40025;
}

.currency-large {
  font-size: 20px;
  font-weight: 500;
}

.old-price-large {
  font-size: 22px;
  color: #94a3b8;
  text-decoration: line-through;
}

.discount-badge-large {
  background: #fff3cd;
  color: #b45f06;
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 700;
}

.product-description-large {
  font-size: 16px;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
}

/* Options */
.option-section-large {
  margin-bottom: 8px;
}

.option-label-large {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.dark-mode .option-label-large {
  color: #f1f5f9;
}

.option-icon-large {
  font-size: 24px;
}

.required-star-large {
  color: #d40025;
  margin-right: auto;
}

/* Colors */
.color-options-large {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.color-btn-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 4px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.color-btn-large:hover {
  transform: scale(1.1);
  border-color: #08717f;
}

.color-btn-large.active {
  border-color: #08717f;
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.3);
}

.check-icon-large {
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* Sizes */
.size-options-large {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.size-btn-large {
  min-width: 80px;
  padding: 14px 24px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #1e293b;
}

.size-btn-large:hover:not(.disabled) {
  border-color: #08717f;
  color: #08717f;
}

.size-btn-large.active {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.size-btn-large.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-info-large {
  margin-top: 12px;
  font-size: 15px;
  color: #64748b;
}

.selected-info-large strong {
  color: #1e293b;
}

/* Quantity */
.quantity-selector-large {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 60px;
  padding: 8px;
  width: fit-content;
}

.qty-btn-large {
  width: 48px;
  height: 48px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  color: #08717f;
}

.qty-btn-large:hover:not(:disabled) {
  background: #08717f;
  color: white;
}

.qty-btn-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input-large {
  width: 100px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
}

.unit-text-large {
  background: #e2e8f0;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
}

.stock-available-large {
  margin-top: 12px;
  font-size: 14px;
  color: #10b981;
}

.stock-unavailable-large {
  margin-top: 12px;
  font-size: 14px;
  color: #d40025;
}

/* Actions */
.actions-section-large {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.add-to-cart-btn-large {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: #08717f;
  border: none;
  border-radius: 60px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.add-to-cart-btn-large:hover:not(:disabled) {
  background: #065a69;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(8, 113, 127, 0.3);
}

.add-to-cart-btn-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-btn-large {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 60px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.wishlist-btn-large:hover {
  border-color: #d40025;
  color: #d40025;
}

.wishlist-btn-large.active {
  background: #ffe8ed;
  border-color: #d40025;
  color: #d40025;
}

/* Secure Payment */
.secure-payment-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 60px;
  font-size: 15px;
  color: #1e293b;
}

/* Shipping */
.shipping-info-large {
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 20px;
  padding: 24px;
}

.shipping-header-large {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  color: #0284c7;
  font-weight: 700;
  font-size: 18px;
}

.shipping-details-large {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shipping-row-large {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #e0f2fe;
}

.shipping-label-large {
  font-size: 16px;
  color: #64748b;
}

.shipping-value-large {
  font-size: 18px;
  font-weight: 700;
  color: #0c4a6e;
}

.free-shipping-large {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  border-radius: 20px;
  color: #15803d;
  font-weight: 600;
  font-size: 16px;
}

/* Description */
.detail-description-large {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark-mode .detail-description-large {
  background: #1e293b;
}

.detail-title-large {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.dark-mode .detail-title-large {
  color: #f1f5f9;
}

.detail-text-large {
  font-size: 18px;
  color: #475569;
  line-height: 2;
}

.dark-mode .detail-text-large {
  color: #94a3b8;
}

/* ===== STYLES POUR LES COMMENTAIRES INTÉGRÉS ===== */

/* Reviews Section */
.reviews-section {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark-mode .reviews-section {
  background: #1e293b;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}

.reviews-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviews-title-wrapper svg {
  color: #08717f;
}

.reviews-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dark-mode .reviews-title {
  color: #f1f5f9;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 40px;
}

.dark-mode .average-rating {
  background: #0f172a;
}

.rating-number {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
}

.dark-mode .rating-number {
  color: #f1f5f9;
}

.rating-out {
  font-size: 16px;
  color: #64748b;
}

.stars-large {
  display: flex;
  gap: 4px;
}

.stars-large .star {
  font-size: 16px;
}

.total-reviews {
  font-size: 14px;
  color: #64748b;
}

/* Formulaire d'évaluation intégré */
.review-form-inline {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
}

.dark-mode .review-form-inline {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.review-form-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;
}

.dark-mode .review-form-title {
  color: #f1f5f9;
}

.rating-input-inline {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.rating-input-inline label {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.dark-mode .rating-input-inline label {
  color: #f1f5f9;
}

.rating-stars-input-inline {
  display: flex;
  gap: 8px;
}

.star-input-inline {
  font-size: 32px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.star-input-inline.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.star-input-inline:hover {
  color: #f59e0b;
  transform: scale(1.2);
}

.rating-label-inline {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
}

.comment-input-inline {
  margin-bottom: 20px;
}

.review-textarea-inline {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  background: white;
}

.dark-mode .review-textarea-inline {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.review-textarea-inline:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.submit-review-inline-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #08717f, #065a69);
  border: none;
  border-radius: 40px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-review-inline-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #065a69, #044a5e);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(8, 113, 127, 0.3);
}

.submit-review-inline-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reviews-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 32px 0;
}

.dark-mode .reviews-divider {
  background: linear-gradient(to right, transparent, #334155, transparent);
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s;
}

.dark-mode .review-card {
  background: #0f172a;
}

.review-card:hover {
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .reviewer-name {
  color: #f1f5f9;
}

.review-date {
  font-size: 12px;
  color: #94a3b8;
}

.review-stars {
  display: flex;
  gap: 4px;
}

.review-stars .star.small {
  font-size: 14px;
}

.review-content {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 16px;
}

.dark-mode .review-content {
  color: #94a3b8;
}

.review-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.dark-mode .review-footer {
  border-top-color: #334155;
}

.helpful-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.helpful-btn:hover {
  color: #08717f;
}

/* No Reviews */
.no-reviews {
  text-align: center;
  padding: 60px 20px;
}

.no-reviews svg {
  margin-bottom: 16px;
}

.no-reviews p {
  color: #64748b;
  font-size: 16px;
}

.be-first {
  margin-top: 8px;
  font-size: 14px;
  color: #94a3b8;
}

/* Reels Section */
.product-reels-section {
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark-mode .product-reels-section {
  background: #1e293b;
}

.section-header-large {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.header-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #08717f, #0d9488);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.section-title-large {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dark-mode .section-title-large {
  color: #f1f5f9;
}

.reels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.reel-card {
  background: #f8fafc;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.dark-mode .reel-card {
  background: #0f172a;
}

.reel-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.reel-thumbnail {
  position: relative;
  aspect-ratio: 9/16;
  background: #000;
  overflow: hidden;
}

.reel-video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reel-views {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 30px;
  color: white;
  font-size: 13px;
}

.reel-info {
  padding: 20px;
}

.reel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .reel-title {
  color: #f1f5f9;
}

.reel-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

/* Similar Products */
.similar-section-large {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark-mode .similar-section-large {
  background: #1e293b;
}

.similar-grid-large {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.similar-card-large {
  background: #f8fafc;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.dark-mode .similar-card-large {
  background: #0f172a;
}

.similar-card-large:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-image-large {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.similar-card-large:hover .card-image-large img {
  transform: scale(1.08);
}

.card-discount {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #d40025;
  color: white;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
}

.card-info-large {
  padding: 20px;
}

.card-info-large h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.dark-mode .card-info-large h4 {
  color: #f1f5f9;
}

.card-price-large {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.current-price-card {
  font-size: 18px;
  font-weight: 700;
  color: #d40025;
}

.old-price-card {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.card-vendor {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vendor-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.card-vendor span {
  font-size: 13px;
  color: #64748b;
}

/* Reel Modal */
.reel-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.reel-modal-content {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalPop 0.3s ease;
}

.dark-mode .reel-modal-content {
  background: #1e293b;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.reel-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
}

.reel-modal-video-container {
  aspect-ratio: 9/16;
  background: #000;
}

.reel-modal-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-modal-info {
  padding: 24px;
}

.reel-modal-info h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .reel-modal-info h3 {
  color: #f1f5f9;
}

.reel-modal-info p {
  color: #64748b;
  margin-bottom: 20px;
}

.reel-modal-stats {
  display: flex;
  gap: 24px;
  color: #64748b;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 100px 20px;
}

.not-found h2 {
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 24px;
}

.back-home {
  display: inline-block;
  padding: 16px 40px;
  background: #08717f;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 30px;
  background: white;
  border-radius: 60px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  border-right: 5px solid;
  font-size: 16px;
  font-weight: 500;
}

.toast.success {
  border-right-color: #10b981;
}

.toast.warning {
  border-right-color: #f59e0b;
}

.toast.error {
  border-right-color: #ef4444;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .product-main-large {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .product-gallery-large {
    position: relative;
    top: 0;
  }

  .similar-grid-large {
    grid-template-columns: repeat(3, 1fr);
  }

  .reels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .similar-grid-large {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .product-main-large {
    padding: 24px;
  }

  .product-title-large {
    font-size: 28px;
  }

  .current-price-large {
    font-size: 32px;
  }

  .actions-section-large {
    flex-direction: column;
  }

  .similar-grid-large {
    grid-template-columns: 1fr;
  }

  .reels-grid {
    grid-template-columns: 1fr;
  }

  .thumbnail-large {
    width: 70px;
    height: 70px;
  }

  .reviews-header {
    flex-direction: column;
  }

  .reviews-summary {
    width: 100%;
    justify-content: space-between;
  }

  .average-rating {
    flex: 1;
  }

  .rating-input-inline {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .product-title-large {
    font-size: 24px;
  }

  .section-title-large {
    font-size: 22px;
  }

  .reviews-summary {
    flex-direction: column;
  }

  .average-rating {
    width: 100%;
  }
}
/* ===== DARK MODE POUR PRODUCT DETAIL ===== */
/* Ajoutez ces styles à la fin de votre section <style scoped> */

/* Fond général */
.product-detail-page.dark-mode {
  background: #161627 !important;
}

/* Breadcrumb */
.product-detail-page.dark-mode .breadcrumb a {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .breadcrumb a:hover {
  color: #2dd4bf !important;
}

.product-detail-page.dark-mode .current {
  color: #f1f5f9 !important;
}

/* Product Main Card */
.product-detail-page.dark-mode .product-main-large {
  background: #1e1e30 !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2) !important;
}

/* Gallery */
.product-detail-page.dark-mode .main-image-container-large {
  background: #121220 !important;
}

.product-detail-page.dark-mode .nav-btn-large {
  background: #1e1e30 !important;
  color: #f1f5f9 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.product-detail-page.dark-mode .nav-btn-large:hover {
  background: #2dd4bf !important;
  color: #161627 !important;
}

/* Product Title */
.product-detail-page.dark-mode .product-title-large {
  color: #f1f5f9 !important;
}

/* Rating Section */
.product-detail-page.dark-mode .rating-section {
  border-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .rating-count {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .view-reviews {
  color: #2dd4bf !important;
}

/* Vendor Section */
.product-detail-page.dark-mode .vendor-section-large {
  background: #121220 !important;
}

.product-detail-page.dark-mode .vendor-section-large:hover {
  background: #1a1a2e !important;
}

.product-detail-page.dark-mode .vendor-name-large {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .vendor-meta-large {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .follow-vendor-btn-large {
  background: #1e1e30 !important;
  border-color: #2dd4bf !important;
  color: #2dd4bf !important;
}

.product-detail-page.dark-mode .follow-vendor-btn-large:hover,
.product-detail-page.dark-mode .follow-vendor-btn-large.active {
  background: #2dd4bf !important;
  color: #161627 !important;
}

/* Price Section */
.product-detail-page.dark-mode .price-section-large {
  border-bottom-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .old-price-large {
  color: #64748b !important;
}

.product-detail-page.dark-mode .discount-badge-large {
  background: #3b2e00 !important;
  color: #fbbf24 !important;
}

/* Description */
.product-detail-page.dark-mode .product-description-large {
  color: #94a3b8 !important;
}

/* Options */
.product-detail-page.dark-mode .option-label-large {
  color: #f1f5f9 !important;
}

/* Color Buttons */
.product-detail-page.dark-mode .color-btn-large {
  border-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .color-btn-large.active {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.3) !important;
}

/* Size Buttons */
.product-detail-page.dark-mode .size-btn-large {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .size-btn-large:hover:not(.disabled) {
  border-color: #2dd4bf !important;
  color: #2dd4bf !important;
}

.product-detail-page.dark-mode .size-btn-large.active {
  background: #2dd4bf !important;
  border-color: #2dd4bf !important;
  color: #161627 !important;
}

/* Quantity Selector */
.product-detail-page.dark-mode .quantity-selector-large {
  background: #121220 !important;
  border-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .qty-btn-large {
  background: #1e1e30 !important;
  color: #2dd4bf !important;
}

.product-detail-page.dark-mode .qty-btn-large:hover:not(:disabled) {
  background: #2dd4bf !important;
  color: #161627 !important;
}

.product-detail-page.dark-mode .qty-input-large {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .unit-text-large {
  background: #2a2a40 !important;
  color: #f1f5f9 !important;
}

/* Wishlist Button */
.product-detail-page.dark-mode .wishlist-btn-large {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .wishlist-btn-large:hover {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.product-detail-page.dark-mode .wishlist-btn-large.active {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

/* Secure Payment */
.product-detail-page.dark-mode .secure-payment-large {
  background: #121220 !important;
  color: #f1f5f9 !important;
}

/* Shipping */
.product-detail-page.dark-mode .shipping-info-large {
  background: #0c1a2e !important;
  border-color: #1e3a5f !important;
}

.product-detail-page.dark-mode .shipping-header-large {
  color: #38bdf8 !important;
}

.product-detail-page.dark-mode .shipping-row-large {
  border-bottom-color: #1e3a5f !important;
}

.product-detail-page.dark-mode .shipping-label-large {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .shipping-value-large {
  color: #7dd3fc !important;
}

.product-detail-page.dark-mode .free-shipping-large {
  background: #0a1f1a !important;
  border-color: #14532d !important;
  color: #34d399 !important;
}

/* Detail Description */
.product-detail-page.dark-mode .detail-description-large {
  background: #1e1e30 !important;
}

.product-detail-page.dark-mode .detail-title-large {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .detail-text-large {
  color: #94a3b8 !important;
}

/* Reviews Section */
.product-detail-page.dark-mode .reviews-section {
  background: #1e1e30 !important;
}

.product-detail-page.dark-mode .reviews-title {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .average-rating {
  background: #121220 !important;
}

.product-detail-page.dark-mode .rating-number {
  color: #f1f5f9 !important;
}

/* Review Form */
.product-detail-page.dark-mode .review-form-inline {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
  border-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .review-form-title {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .rating-input-inline label {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .rating-label-inline {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .review-textarea-inline {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .review-textarea-inline:focus {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2) !important;
}

/* Reviews Divider */
.product-detail-page.dark-mode .reviews-divider {
  background: linear-gradient(to right, transparent, #2a2a40, transparent) !important;
}

/* Review Cards */
.product-detail-page.dark-mode .review-card {
  background: #121220 !important;
}

.product-detail-page.dark-mode .reviewer-name {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .review-content {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .review-footer {
  border-top-color: #2a2a40 !important;
}

.product-detail-page.dark-mode .helpful-btn {
  color: #94a3b8 !important;
}

.product-detail-page.dark-mode .helpful-btn:hover {
  color: #2dd4bf !important;
}

/* No Reviews */
.product-detail-page.dark-mode .no-reviews p {
  color: #94a3b8 !important;
}

/* Reels Section */
.product-detail-page.dark-mode .product-reels-section {
  background: #1e1e30 !important;
}

.product-detail-page.dark-mode .section-title-large {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .reel-card {
  background: #121220 !important;
}

.product-detail-page.dark-mode .reel-title {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .reel-description {
  color: #94a3b8 !important;
}

/* Similar Products */
.product-detail-page.dark-mode .similar-section-large {
  background: #1e1e30 !important;
}

.product-detail-page.dark-mode .similar-card-large {
  background: #121220 !important;
}

.product-detail-page.dark-mode .card-info-large h4 {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .old-price-card {
  color: #64748b !important;
}

.product-detail-page.dark-mode .card-vendor span {
  color: #94a3b8 !important;
}

/* Reel Modal */
.product-detail-page.dark-mode .reel-modal-content {
  background: #1e1e30 !important;
}

.product-detail-page.dark-mode .reel-modal-info h3 {
  color: #f1f5f9 !important;
}

.product-detail-page.dark-mode .reel-modal-info p,
.product-detail-page.dark-mode .reel-modal-stats {
  color: #94a3b8 !important;
}

/* Not Found */
.product-detail-page.dark-mode .not-found h2 {
  color: #f1f5f9 !important;
}

/* Toast */
.product-detail-page.dark-mode .toast {
  background: #1e1e30 !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
}

/* Loading */
.product-detail-page.dark-mode .loading-spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

.product-detail-page.dark-mode .loading-container p {
  color: #94a3b8 !important;
}
@media (max-width: 768px) {
  .actions-section-large { flex-direction: column; gap: 12px; }
  .add-to-cart-btn-large,
  .buy-now-btn-large,
  .wishlist-btn-large { width: 100%; justify-content: center; }
  .breadcrumb { flex-wrap: wrap; gap: 4px; font-size: 0.78rem; }
}

@media (max-width: 480px) {
  .similar-grid-large { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .thumbnail-list-large { display: flex; overflow-x: auto; gap: 8px; }
  .thumbnail-large { flex-shrink: 0; width: 56px; height: 56px; }
}
/* ============================================
   OPTIMISATIONS MOBILES - PRODUCT DETAIL
============================================ */

/* ----- BASE MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {
  /* Container */
  .product-detail-page .container {
    padding: 0 12px !important;
  }

  /* Breadcrumb */
  .breadcrumb {
    flex-wrap: wrap !important;
    gap: 6px !important;
    font-size: 13px !important;
    padding: 12px 0 !important;
  }

  .breadcrumb a,
  .breadcrumb .current {
    font-size: 13px !important;
  }

  /* Product Main - Passage en colonne */
  .product-main-large {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
    padding: 16px !important;
    border-radius: 20px !important;
    margin-bottom: 20px !important;
  }

  /* Gallery - Plus compacte */
  .product-gallery-large {
    position: relative !important;
    top: 0 !important;
    width: 100% !important;
  }

  .main-image-container-large {
    aspect-ratio: 1 !important;
    border-radius: 16px !important;
    margin-bottom: 12px !important;
  }

  .main-image-large {
    border-radius: 16px !important;
  }

  /* Navigation buttons */
  .nav-btn-large {
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.9) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  }

  .nav-btn-large svg {
    width: 20px !important;
    height: 20px !important;
  }

  .nav-btn-large.prev {
    left: 8px !important;
  }

  .nav-btn-large.next {
    right: 8px !important;
  }

  /* Discount/Stock flags */
  .discount-flag-large {
    top: 12px !important;
    left: 12px !important;
    padding: 6px 14px !important;
    font-size: 13px !important;
    border-radius: 30px !important;
  }

  .stock-flag-large {
    bottom: 12px !important;
    left: 12px !important;
    padding: 6px 14px !important;
    font-size: 12px !important;
    border-radius: 30px !important;
  }

  /* Thumbnails */
  .thumbnail-list-large {
    gap: 8px !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 4px !important;
  }

  .thumbnail-large {
    width: 64px !important;
    height: 64px !important;
    border-radius: 14px !important;
    border-width: 2px !important;
    flex-shrink: 0 !important;
  }

  /* Product Info */
  .product-info-large {
    gap: 16px !important;
  }

  .product-title-large {
    font-size: 22px !important;
    line-height: 1.4 !important;
    margin-bottom: 4px !important;
  }

  /* Rating Section */
  .rating-section {
    flex-wrap: wrap !important;
    gap: 8px !important;
    padding: 10px 0 !important;
  }

  .stars-container .star {
    font-size: 16px !important;
  }

  .rating-count {
    font-size: 13px !important;
  }

  .view-reviews {
    font-size: 13px !important;
  }

  /* Vendor Section */
  .vendor-section-large {
    padding: 14px !important;
    border-radius: 16px !important;
    gap: 12px !important;
  }

  .vendor-avatar-large {
    width: 50px !important;
    height: 50px !important;
  }

  .vendor-name-large {
    font-size: 15px !important;
  }

  .follow-vendor-btn-large {
    padding: 8px 18px !important;
    font-size: 13px !important;
    border-radius: 30px !important;
  }

  /* Price Section */
  .price-section-large {
    gap: 12px !important;
    padding-bottom: 16px !important;
  }

  .current-price-large {
    font-size: 28px !important;
  }

  .currency-large {
    font-size: 16px !important;
  }

  .old-price-large {
    font-size: 18px !important;
  }

  .discount-badge-large {
    padding: 6px 14px !important;
    font-size: 13px !important;
  }

  /* Description */
  .product-description-large {
    font-size: 14px !important;
    line-height: 1.7 !important;
  }

  /* Options - Couleurs */
  .option-section-large {
    margin-bottom: 4px !important;
  }

  .option-label-large {
    font-size: 14px !important;
    gap: 8px !important;
    margin-bottom: 10px !important;
  }

  .option-icon-large {
    font-size: 20px !important;
  }

  .color-options-large {
    gap: 10px !important;
    margin-bottom: 8px !important;
  }

  .color-btn-large {
    width: 44px !important;
    height: 44px !important;
    border-width: 3px !important;
  }

  .check-icon-large {
    font-size: 22px !important;
  }

  /* Options - Tailles */
  .size-options-large {
    gap: 8px !important;
    margin-bottom: 8px !important;
  }

  .size-btn-large {
    min-width: 60px !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
  }

  .selected-info-large {
    font-size: 13px !important;
    margin-top: 8px !important;
  }

  /* Quantity */
  .quantity-selector-large {
    gap: 8px !important;
    padding: 6px !important;
    border-radius: 50px !important;
  }

  .qty-btn-large {
    width: 40px !important;
    height: 40px !important;
    font-size: 20px !important;
  }

  .qty-input-large {
    width: 60px !important;
    font-size: 18px !important;
  }

  .unit-text-large {
    padding: 6px 14px !important;
    font-size: 13px !important;
  }

  /* Actions - Empilées verticalement */
  .actions-section-large {
    flex-direction: column !important;
    gap: 10px !important;
    margin: 12px 0 !important;
  }

  .add-to-cart-btn-large {
    width: 100% !important;
    padding: 16px !important;
    font-size: 16px !important;
    border-radius: 50px !important;
    justify-content: center !important;
  }

  .add-to-cart-btn-large svg {
    width: 20px !important;
    height: 20px !important;
  }

  .wishlist-btn-large {
    width: 100% !important;
    padding: 14px !important;
    font-size: 14px !important;
    border-radius: 50px !important;
    justify-content: center !important;
  }

  .wishlist-btn-large svg {
    width: 20px !important;
    height: 20px !important;
  }

  /* Secure Payment */
  .secure-payment-large {
    padding: 12px !important;
    font-size: 13px !important;
    border-radius: 50px !important;
  }

  .secure-payment-large svg {
    width: 16px !important;
    height: 16px !important;
  }

  /* Shipping */
  .shipping-info-large {
    padding: 16px !important;
    border-radius: 16px !important;
  }

  .shipping-header-large {
    font-size: 15px !important;
    gap: 10px !important;
    margin-bottom: 14px !important;
  }

  .shipping-header-large svg {
    width: 20px !important;
    height: 20px !important;
  }

  .shipping-row-large {
    padding: 8px 0 !important;
  }

  .shipping-label-large {
    font-size: 13px !important;
  }

  .shipping-value-large {
    font-size: 15px !important;
  }

  .free-shipping-large {
    padding: 14px 16px !important;
    font-size: 14px !important;
    border-radius: 16px !important;
  }

  .free-shipping-large svg {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== Description ===== */
  .detail-description-large {
    padding: 20px !important;
    border-radius: 16px !important;
    margin: 20px 0 !important;
  }

  .detail-title-large {
    font-size: 20px !important;
    margin-bottom: 14px !important;
  }

  .detail-text-large {
    font-size: 15px !important;
    line-height: 1.8 !important;
  }

  /* ===== Reviews Section ===== */
  .reviews-section {
    padding: 20px !important;
    border-radius: 16px !important;
    margin: 20px 0 !important;
  }

  .reviews-header {
    flex-direction: column !important;
    gap: 16px !important;
    margin-bottom: 20px !important;
  }

  .reviews-title-wrapper {
    gap: 8px !important;
  }

  .reviews-title-wrapper svg {
    width: 22px !important;
    height: 22px !important;
  }

  .reviews-title {
    font-size: 18px !important;
  }

  .reviews-summary {
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .average-rating {
    width: 100% !important;
    justify-content: center !important;
    padding: 10px 16px !important;
  }

  .rating-number {
    font-size: 22px !important;
  }

  .stars-large .star {
    font-size: 14px !important;
  }

  /* Review Form */
  .review-form-inline {
    padding: 16px !important;
    border-radius: 14px !important;
  }

  .review-form-title {
    font-size: 15px !important;
    margin-bottom: 14px !important;
  }

  .rating-input-inline {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
    margin-bottom: 14px !important;
  }

  .rating-input-inline label {
    font-size: 13px !important;
  }

  .star-input-inline {
    font-size: 28px !important;
  }

  .comment-input-inline {
    margin-bottom: 14px !important;
  }

  .review-textarea-inline {
    padding: 12px !important;
    font-size: 14px !important;
    border-radius: 12px !important;
  }

  .submit-review-inline-btn {
    padding: 14px !important;
    font-size: 15px !important;
    border-radius: 30px !important;
  }

  /* Review Cards */
  .review-card {
    padding: 16px !important;
    border-radius: 14px !important;
  }

  .review-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }

  .reviewer-avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .reviewer-name {
    font-size: 14px !important;
  }

  .review-stars .star.small {
    font-size: 12px !important;
  }

  .review-content {
    font-size: 14px !important;
  }

  /* No Reviews */
  .no-reviews {
    padding: 40px 16px !important;
  }

  .no-reviews svg {
    width: 36px !important;
    height: 36px !important;
  }

  /* ===== Reels Section ===== */
  .product-reels-section {
    padding: 20px !important;
    border-radius: 16px !important;
    margin: 20px 0 !important;
  }

  .section-header-large {
    gap: 10px !important;
    margin-bottom: 20px !important;
  }

  .header-icon-wrapper {
    width: 44px !important;
    height: 44px !important;
    border-radius: 14px !important;
  }

  .header-icon-wrapper svg {
    width: 22px !important;
    height: 22px !important;
  }

  .section-title-large {
    font-size: 20px !important;
  }

  .reels-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .reel-card {
    border-radius: 14px !important;
  }

  .reel-thumbnail {
    aspect-ratio: 16/9 !important;
  }

  .reel-play-icon {
    width: 48px !important;
    height: 48px !important;
  }

  .reel-play-icon svg {
    width: 32px !important;
    height: 32px !important;
  }

  .reel-views {
    bottom: 8px !important;
    left: 8px !important;
    padding: 4px 10px !important;
    font-size: 11px !important;
  }

  .reel-info {
    padding: 14px !important;
  }

  .reel-title {
    font-size: 14px !important;
  }

  .reel-description {
    font-size: 12px !important;
    margin-bottom: 10px !important;
  }

  /* ===== Similar Products ===== */
  .similar-section-large {
    padding: 20px !important;
    border-radius: 16px !important;
  }

  .similar-grid-large {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .similar-card-large {
    border-radius: 14px !important;
  }

  .card-image-large {
    border-radius: 14px 14px 0 0 !important;
  }

  .card-discount {
    top: 8px !important;
    left: 8px !important;
    padding: 4px 10px !important;
    font-size: 11px !important;
  }

  .card-info-large {
    padding: 12px !important;
  }

  .card-info-large h4 {
    font-size: 13px !important;
    margin-bottom: 8px !important;
  }

  .card-price-large {
    gap: 8px !important;
    margin-bottom: 10px !important;
  }

  .current-price-card {
    font-size: 14px !important;
  }

  .old-price-card {
    font-size: 11px !important;
  }

  .card-vendor {
    gap: 6px !important;
  }

  .vendor-avatar-small {
    width: 22px !important;
    height: 22px !important;
  }

  .card-vendor span {
    font-size: 11px !important;
  }

  /* ===== Reel Modal ===== */
  .reel-modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .reel-modal-content {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    max-height: 85vh !important;
    animation: slideUpMobile 0.3s ease !important;
    overflow-y: auto !important;
  }

  .reel-modal-close {
    top: 12px !important;
    right: 12px !important;
    width: 32px !important;
    height: 32px !important;
    font-size: 16px !important;
  }

  .reel-modal-video-container {
    aspect-ratio: 16/9 !important;
    max-height: 50vh !important;
  }

  .reel-modal-info {
    padding: 16px !important;
  }

  .reel-modal-info h3 {
    font-size: 16px !important;
  }

  .reel-modal-info p {
    font-size: 13px !important;
  }

  .reel-modal-stats {
    gap: 16px !important;
    font-size: 13px !important;
  }

  /* ===== Toast ===== */
  .toast {
    left: 12px !important;
    right: 12px !important;
    bottom: 16px !important;
    padding: 12px 20px !important;
    font-size: 14px !important;
    border-radius: 40px !important;
    text-align: center !important;
    justify-content: center !important;
  }

  /* ===== Loading ===== */
  .loading-container {
    min-height: 300px !important;
  }

  .loading-spinner {
    width: 44px !important;
    height: 44px !important;
  }
}

/* ===== TRÈS PETIT MOBILE (< 480px) ===== */
@media (max-width: 480px) {
  .product-title-large {
    font-size: 20px !important;
  }

  .current-price-large {
    font-size: 24px !important;
  }

  .old-price-large {
    font-size: 16px !important;
  }

  .similar-grid-large {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .thumbnail-large {
    width: 52px !important;
    height: 52px !important;
  }

  .color-btn-large {
    width: 38px !important;
    height: 38px !important;
  }

  .size-btn-large {
    min-width: 50px !important;
    padding: 8px 12px !important;
    font-size: 12px !important;
  }

  .add-to-cart-btn-large {
    padding: 14px !important;
    font-size: 14px !important;
  }

  .wishlist-btn-large {
    padding: 12px !important;
    font-size: 13px !important;
  }

  .detail-title-large,
  .section-title-large {
    font-size: 18px !important;
  }

  .detail-text-large {
    font-size: 14px !important;
  }

  .review-card {
    padding: 12px !important;
  }
}

/* ===== ANIMATION SLIDE UP POUR MODALS ===== */
@keyframes slideUpMobile {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .reel-modal-content {
    padding-bottom: env(safe-area-inset-bottom, 16px) !important;
  }

  .toast {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .add-to-cart-btn-large,
  .wishlist-btn-large,
  .submit-review-inline-btn {
    -webkit-appearance: none !important;
  }
}

/* ===== OPTIMISATION SCROLL HORIZONTAL ===== */
.thumbnail-list-large {
  scroll-snap-type: x mandatory !important;
}

.thumbnail-large {
  scroll-snap-align: start !important;
}

/* ===== DARK MODE MOBILE ===== */
@media (max-width: 768px) {
  .product-detail-page.dark-mode .product-main-large {
    background: #1a1a2e !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  }

  .product-detail-page.dark-mode .nav-btn-large {
    background: rgba(30, 30, 48, 0.9) !important;
    color: #f1f5f9 !important;
  }

  .product-detail-page.dark-mode .nav-btn-large:hover {
    background: #2dd4bf !important;
    color: #161627 !important;
  }

  .product-detail-page.dark-mode .review-card {
    background: #121220 !important;
  }

  .product-detail-page.dark-mode .similar-card-large {
    background: #121220 !important;
  }

  .product-detail-page.dark-mode .reel-modal-content {
    background: #1a1a2e !important;
  }
}
</style>
