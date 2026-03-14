<template>
  <div class="favorites-page dual-theme">
    <!-- Hero Section avec dégradé rouge-bleu -->
    <section class="hero-section">
      <div class="hero-particles"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="hero-badges">
          <span class="hero-badge">
            <span class="badge-icon">❤️</span>
            منتجاتي المفضلة
          </span>
          <span class="hero-badge">
            <span class="badge-icon">🌟</span>
            حرف يدوية تونسية
          </span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">منتجاتي</span>
          <span class="title-line gradient-text">المفضلة</span>
        </h1>

        <p class="hero-description">
          جميع المنتجات التي أعجبتك في مكان واحد. يمكنك العودة إليها في أي وقت ومشاركتها مع أصدقائك.
        </p>

        <!-- إحصائيات سريعة -->
        <div class="hero-stats" v-if="favoriteProducts.length > 0">
          <div class="stat-item">
            <span class="stat-value">{{ favoriteProducts.length }}</span>
            <span class="stat-label">منتج مفضل</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ uniqueVendors }}</span>
            <span class="stat-label">حرفي</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ totalValue }} د.ت</span>
            <span class="stat-label">قيمة السلة</span>
          </div>
        </div>
      </div>

      <!-- عناصر عائمة للديكور -->
      <div class="floating-heart heart-1">❤️</div>
      <div class="floating-heart heart-2">⭐</div>
      <div class="floating-heart heart-3">✨</div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="likesStore.loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">جاري تحميل المنتجات المفضلة...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="favoriteProducts.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
              <path
                d="M50 150C50 150 70 100 100 100C130 100 150 150 150 150"
                stroke="#08717f"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="8 4"
              />
              <circle cx="80" cy="70" r="14" fill="#d40025" opacity="0.8" />
              <circle cx="120" cy="70" r="14" fill="#d40025" opacity="0.8" />
              <path
                d="M30 50C30 30 170 30 170 50V130C170 150 30 150 30 130V50Z"
                stroke="#08717f"
                stroke-width="8"
                fill="white"
              />
              <path
                d="M70 90L100 110L130 90"
                stroke="#08717f"
                stroke-width="6"
                stroke-linecap="round"
                fill="none"
              />
            </svg>
            <div class="empty-heart">❤️</div>
          </div>
          <div class="empty-content">
            <h3>لا توجد منتجات مفضلة</h3>
            <p>قم بإضافة منتجات إلى المفضلة وستظهر هنا لتتمكن من العودة إليها بسهولة</p>
            <div class="empty-actions">
              <button class="btn-primary" @click="$router.push('/products')">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                استكشاف المنتجات
              </button>
              <button class="btn-outline" @click="$router.push('/vendors')">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                اكتشف الحرفيين
              </button>
            </div>
          </div>
        </div>

        <!-- Favorites Grid avec produits -->
        <div v-else class="favorites-content">
          <!-- Control Bar -->
          <div class="control-bar">
            <div class="results-info">
              <span class="results-count">{{ favoriteProducts.length }}</span>
              <span class="results-label">منتج مفضل</span>
              <span class="results-badge" v-if="hasNewItems">🆕 جديد</span>
            </div>

            <div class="controls-group">
              <!-- Select All / Clear All -->
              <div class="bulk-actions" v-if="viewMode === 'grid'">
                <button class="bulk-btn" @click="clearAllFavorites" title="حذف الكل">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              </div>

              <!-- Sort Dropdown -->
              <div class="sort-wrapper">
                <select v-model="sortBy" class="sort-select">
                  <option value="recent">الأحدث إضافة</option>
                  <option value="price-asc">السعر: الأقل أولاً</option>
                  <option value="price-desc">السعر: الأعلى أولاً</option>
                  <option value="name">الاسم</option>
                  <option value="rating">التقييم</option>
                </select>
                <div class="select-arrow">▼</div>
              </div>

              <!-- View Controls -->
              <div class="view-controls">
                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="عرض شبكي"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="عرض قائمة"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round" />
                    <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round" />
                    <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Active Filters (if any) -->
          <div v-if="activeFilter" class="active-filters-bar">
            <span class="filter-label">مرتب حسب:</span>
            <span class="filter-tag">
              {{ getSortLabel }}
              <button @click="resetSort" class="remove-filter">×</button>
            </span>
          </div>

          <!-- Products Grid/List -->
          <div class="products-container" :class="viewMode">
            <ProductCard
              v-for="product in sortedAndPaginatedProducts"
              :key="product.id"
              :product="product"
              @quick-view="openQuickView"
              @added-to-cart="handleAddToCart"
              @liked="handleProductLiked"
              @unliked="handleProductUnliked"
            />
          </div>

          <!-- Pagination -->
          <div v-if="favoriteProducts.length > itemsPerPage" class="pagination">
            <button
              class="pagination-btn prev"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              السابق
            </button>

            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-number"
                :class="{
                  active: page === currentPage,
                  dots: page === '...',
                  'teal-active': page === currentPage && page % 2 === 0,
                  'red-active': page === currentPage && page % 2 === 1,
                }"
                @click="page !== '...' && (currentPage = page)"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="pagination-btn next"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              التالي
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <!-- Share Favorites -->
          <div class="share-favorites">
            <span class="share-label">شارك مجموعتك المفضلة:</span>
            <div class="share-buttons">
              <button class="share-btn facebook" @click="shareOnFacebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </button>
              <button class="share-btn twitter" @click="shareOnTwitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                  />
                </svg>
              </button>
              <button class="share-btn whatsapp" @click="shareOnWhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
              </button>
              <button class="share-btn copy" @click="copyShareLink">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click="toast.show = false" class="toast-close">×</button>
        <div class="toast-progress" :style="{ animationDuration: '3s' }"></div>
      </div>
    </transition>

    <!-- Quick View Modal -->
    <QuickViewModal
      v-if="quickViewProduct"
      :product="quickViewProduct"
      :is-visible="showQuickView"
      @close="closeQuickView"
      @add-to-cart="addToCartFromModal"
    />

    <!-- Confirmation Modal for Clear All -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>تأكيد الحذف</h3>
          <button @click="showClearConfirm = false" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>هل أنت متأكد من حذف جميع المنتجات المفضلة؟</p>
          <p class="modal-warning">لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
        <div class="modal-footer">
          <button @click="showClearConfirm = false" class="btn-cancel">إلغاء</button>
          <button @click="confirmClearAll" class="btn-confirm">حذف الكل</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import QuickViewModal from '../components/QuickViewModal.vue'

const router = useRouter()
const likesStore = useLikesStore()
const cartStore = useCartStore()

// ============ STATE ============
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const sortBy = ref('recent')
const quickViewProduct = ref(null)
const showQuickView = ref(false)
const showClearConfirm = ref(false)
const hasNewItems = ref(true)

// Toast State
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ============ COMPUTED ============
const favoriteProducts = computed(() => likesStore.favoriteProducts)

const uniqueVendors = computed(() => {
  const vendors = new Set()
  favoriteProducts.value.forEach((p) => vendors.add(p.vendor?.id))
  return vendors.size
})

const totalValue = computed(() => {
  const total = favoriteProducts.value.reduce((sum, p) => sum + p.price, 0)
  return total.toFixed(1)
})

const sortedProducts = computed(() => {
  const products = [...favoriteProducts.value]

  switch (sortBy.value) {
    case 'recent':
      return products.sort((a, b) => new Date(b.likedAt || 0) - new Date(a.likedAt || 0))
    case 'price-asc':
      return products.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return products.sort((a, b) => b.price - a.price)
    case 'name':
      return products.sort((a, b) => a.name.localeCompare(b.name))
    case 'rating':
      return products.sort((a, b) => b.rating - a.rating)
    default:
      return products
  }
})

const sortedAndPaginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(favoriteProducts.value.length / itemsPerPage.value)
})

const activeFilter = computed(() => sortBy.value !== 'recent')

const getSortLabel = computed(() => {
  const labels = {
    recent: 'الأحدث إضافة',
    'price-asc': 'السعر: الأقل أولاً',
    'price-desc': 'السعر: الأعلى أولاً',
    name: 'الاسم',
    rating: 'التقييم',
  }
  return labels[sortBy.value]
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 3; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

// ============ METHODS ============
const showNotification = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    heart: '❤️',
    cart: '🛒',
    share: '🔗',
  }

  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type] || icons.info,
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const handleProductLiked = (product) => {
  showNotification(`تمت إضافة "${product.name}" إلى المفضلة`, 'heart')
}

const handleProductUnliked = (productId) => {
  showNotification('تمت إزالة المنتج من المفضلة', 'info')

  // Adjust current page if needed
  if (favoriteProducts.value.length === 0) {
    currentPage.value = 1
  } else {
    const maxPage = Math.ceil(favoriteProducts.value.length / itemsPerPage.value)
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  }
}

const handleAddToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
  })
  showNotification(`تمت إضافة "${product.name}" إلى السلة`, 'cart')
}

const openQuickView = (product) => {
  quickViewProduct.value = product
  showQuickView.value = true
}

const closeQuickView = () => {
  showQuickView.value = false
  setTimeout(() => {
    quickViewProduct.value = null
  }, 300)
}

const addToCartFromModal = (cartItem) => {
  cartStore.addItem({
    id: cartItem.product.id,
    name: cartItem.product.name,
    price: cartItem.product.price,
    image: cartItem.product.image,
    quantity: cartItem.quantity || 1,
  })
  closeQuickView()
  showNotification('تمت إضافة المنتج إلى السلة بنجاح', 'cart')
}

const clearAllFavorites = () => {
  showClearConfirm.value = true
}

const confirmClearAll = () => {
  likesStore.clearAllLikes()
  showClearConfirm.value = false
  showNotification('تم حذف جميع المنتجات من المفضلة', 'info')
  currentPage.value = 1
}

const resetSort = () => {
  sortBy.value = 'recent'
}

// Share functions
const shareOnFacebook = () => {
  const url = window.location.href
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  showNotification('تم فتح نافذة المشاركة', 'share')
}

const shareOnTwitter = () => {
  const text = 'اكتشف منتجاتي المفضلة على منصة الحرفيين!'
  const url = window.location.href
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank',
  )
  showNotification('تم فتح نافذة المشاركة', 'share')
}

const shareOnWhatsApp = () => {
  const text = `اكتشف منتجاتي المفضلة على منصة الحرفيين! ${window.location.href}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  showNotification('تم فتح نافذة المشاركة', 'share')
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showNotification('تم نسخ الرابط', 'share')
  } catch (err) {
    showNotification('فشل نسخ الرابط', 'error')
  }
}

// Watchers
watch(sortBy, () => {
  currentPage.value = 1
})

// ============ LIFECYCLE ============
onMounted(() => {
  likesStore.loadFromStorage()
  cartStore.loadFromStorage()

  // Reset "new" indicator after 3 seconds
  setTimeout(() => {
    hasNewItems.value = false
  }, 3000)
})
</script>

<style scoped>
/* ========================================
   متغيرات CSS - ثنائي اللون (#08717f & #d40025)
======================================== */
.dual-theme {
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

  --gradient-teal: linear-gradient(135deg, #08717f 0%, #0a94a6 100%);
  --gradient-red: linear-gradient(135deg, #d40025 0%, #ff1744 100%);
  --gradient-dual: linear-gradient(135deg, #08717f 0%, #d40025 100%);

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

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;

  --shadow-sm: 0 1px 3px rgba(8, 113, 127, 0.08);
  --shadow-md: 0 4px 6px rgba(8, 113, 127, 0.1);
  --shadow-lg: 0 10px 15px rgba(212, 0, 37, 0.1);
  --shadow-xl: 0 20px 25px rgba(8, 113, 127, 0.15);
  --shadow-2xl: 0 25px 50px rgba(212, 0, 37, 0.2);

  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.favorites-page {
  overflow-x: hidden;
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', 'Segoe UI', sans-serif;
  background: var(--neutral-50);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ========================================
   HERO SECTION - تدرج أحمر-أزرق
======================================== */
.hero-section {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-red) 0%, var(--primary-teal) 100%);
  color: white;
  overflow: hidden;
  padding: 80px 20px 60px;
}

.hero-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 40%);
  animation: particlesMove 25s infinite alternate;
}

@keyframes particlesMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(30px, 30px);
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
}

.hero-content {
  position: relative;
  z-index: 5;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  animation: fadeInDown 0.8s ease-out;
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  margin-bottom: 20px;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.title-line {
  display: block;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 900;
  line-height: 1.2;
  color: white;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff, #ffe0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  max-width: 650px;
  margin: 0 auto 30px;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  margin: 0 auto;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 600;
}

.stat-divider {
  width: 2px;
  height: 35px;
  background: rgba(255, 255, 255, 0.3);
}

/* Floating Hearts */
.floating-heart {
  position: absolute;
  font-size: 1.8rem;
  opacity: 0.2;
  animation: float 6s ease-in-out infinite;
  z-index: 2;
}

.heart-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.heart-2 {
  bottom: 20%;
  right: 10%;
  animation-delay: 2s;
  font-size: 2.2rem;
}

.heart-3 {
  top: 40%;
  right: 15%;
  animation-delay: 4s;
  font-size: 1.6rem;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* ========================================
   MAIN CONTENT
======================================== */
.main-content {
  padding: 60px 0;
  background: var(--neutral-50);
}

/* ========================================
   LOADING STATE
======================================== */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-200);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border: 4px solid var(--neutral-200);
  border-top: 4px solid var(--primary-teal);
  border-right: 4px solid var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  color: var(--neutral-600);
  font-weight: 600;
}

/* ========================================
   EMPTY STATE
======================================== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--neutral-200);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-dual);
}

.empty-illustration {
  position: relative;
  margin-bottom: 30px;
}

.empty-heart {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.empty-content h3 {
  font-size: 2rem;
  font-weight: 900;
  color: var(--neutral-900);
  margin-bottom: 15px;
}

.empty-content p {
  font-size: 1.1rem;
  color: var(--neutral-600);
  margin-bottom: 30px;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-bounce);
  border: none;
}

.btn-primary {
  background: var(--gradient-teal);
  color: white;
  box-shadow: var(--shadow-lg);
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(8, 113, 127, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--primary-teal);
  border: 2px solid var(--primary-teal);
}

.btn-outline:hover {
  background: var(--primary-teal);
  color: white;
  transform: translateY(-4px);
}

/* ========================================
   CONTROL BAR
======================================== */
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
  padding: 16px 24px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-200);
  flex-wrap: wrap;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-count {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary-teal);
  line-height: 1;
}

.results-label {
  font-size: 1rem;
  color: var(--neutral-600);
  font-weight: 600;
}

.results-badge {
  padding: 4px 12px;
  background: var(--primary-red-soft);
  color: var(--primary-red);
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 10px;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neutral-100);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  color: var(--neutral-600);
  cursor: pointer;
  transition: var(--transition);
}

.bulk-btn:hover {
  background: var(--primary-red-soft);
  color: var(--primary-red);
  border-color: var(--primary-red);
  transform: scale(1.1);
}

.sort-wrapper {
  position: relative;
}

.sort-select {
  padding: 10px 36px 10px 16px;
  background: white;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  color: var(--neutral-700);
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  min-width: 160px;
  transition: var(--transition);
  font-size: 0.9rem;
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.select-arrow {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--neutral-500);
  font-size: 0.8rem;
}

.view-controls {
  display: flex;
  gap: 6px;
  background: var(--neutral-100);
  padding: 4px;
  border-radius: var(--radius-md);
}

.view-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--neutral-500);
  cursor: pointer;
  transition: var(--transition);
}

.view-btn:hover {
  background: white;
  color: var(--neutral-700);
}

.view-btn.active {
  background: white;
  color: var(--primary-teal);
  box-shadow: var(--shadow-sm);
}

/* ========================================
   ACTIVE FILTERS BAR
======================================== */
.active-filters-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 20px;
  background: var(--primary-teal-mist);
  border: 1px solid var(--primary-teal-light);
  border-radius: var(--radius-lg);
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-teal);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: white;
  border: 1px solid var(--primary-teal);
  border-radius: 50px;
  font-size: 0.85rem;
  color: var(--primary-teal-dark);
  font-weight: 600;
}

.remove-filter {
  background: none;
  border: none;
  color: var(--neutral-500);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  transition: var(--transition);
}

.remove-filter:hover {
  color: var(--primary-red);
  transform: scale(1.2);
}

/* ========================================
   PRODUCTS CONTAINER
======================================== */
.products-container {
  transition: var(--transition);
  margin-bottom: 40px;
}

.products-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.products-container.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========================================
   PAGINATION
======================================== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid var(--neutral-200);
  flex-wrap: wrap;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  color: var(--neutral-700);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-teal);
  color: var(--primary-teal);
  background: var(--primary-teal-mist);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  color: var(--neutral-700);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.page-number:hover:not(.dots) {
  border-color: var(--primary-teal);
  color: var(--primary-teal);
  background: var(--primary-teal-mist);
  transform: scale(1.1);
}

.page-number.active {
  background: var(--primary-teal);
  border-color: var(--primary-teal);
  color: white;
}

.page-number.red-active {
  background: var(--primary-red);
  border-color: var(--primary-red);
  color: white;
}

.page-number.dots {
  border: none;
  background: transparent;
  cursor: default;
}

/* ========================================
   SHARE FAVORITES
======================================== */
.share-favorites {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 60px;
  padding: 24px;
  background: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--neutral-200);
  flex-wrap: wrap;
}

.share-label {
  font-size: 0.95rem;
  color: var(--neutral-600);
  font-weight: 600;
}

.share-buttons {
  display: flex;
  gap: 12px;
}

.share-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: var(--transition-bounce);
}

.share-btn:hover {
  transform: translateY(-5px) scale(1.1);
}

.share-btn.facebook {
  background: #1877f2;
}

.share-btn.twitter {
  background: #1da1f2;
}

.share-btn.whatsapp {
  background: #25d366;
}

.share-btn.copy {
  background: var(--gradient-teal);
}

/* ========================================
   TOAST NOTIFICATION
======================================== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: var(--shadow-2xl);
  z-index: 9999;
  border: 1px solid var(--neutral-200);
  min-width: 350px;
  max-width: 90vw;
  overflow: hidden;
}

.toast-notification.success {
  border-right: 4px solid var(--primary-teal);
}

.toast-notification.error {
  border-right: 4px solid var(--primary-red);
}

.toast-notification.info {
  border-right: 4px solid var(--primary-teal-light);
}

.toast-notification.heart {
  border-right: 4px solid var(--primary-red);
}

.toast-notification.cart {
  border-right: 4px solid var(--primary-teal);
}

.toast-notification.share {
  border-right: 4px solid var(--primary-teal);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 1.3rem;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.toast-close {
  background: none;
  border: none;
  color: var(--neutral-500);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  line-height: 1;
  transition: var(--transition);
}

.toast-close:hover {
  color: var(--neutral-900);
  transform: scale(1.2);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-teal), var(--primary-red));
  animation: progress 3s linear;
}

@keyframes progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}

/* ========================================
   MODAL
======================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  width: 90%;
  max-width: 450px;
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--primary-teal-mist), var(--primary-red-mist));
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--neutral-900);
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 50%;
  color: var(--neutral-600);
  font-size: 1.2rem;
  cursor: pointer;
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--neutral-100);
  color: var(--neutral-900);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.modal-body p {
  font-size: 1rem;
  color: var(--neutral-700);
  margin-bottom: 12px;
}

.modal-warning {
  color: var(--primary-red) !important;
  font-weight: 700;
  font-size: 0.9rem !important;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: var(--neutral-50);
  border-top: 1px solid var(--neutral-200);
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-cancel {
  background: var(--neutral-200);
  color: var(--neutral-700);
}

.btn-cancel:hover {
  background: var(--neutral-300);
}

.btn-confirm {
  background: var(--primary-red);
  color: white;
}

.btn-confirm:hover {
  background: var(--primary-red-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ========================================
   ANIMATIONS
======================================== */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 992px) {
  .hero-stats {
    gap: 20px;
    padding: 15px 25px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 40vh;
    padding: 60px 20px 40px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-divider {
    width: 60px;
    height: 2px;
  }

  .control-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .controls-group {
    justify-content: space-between;
  }

  .sort-select {
    min-width: 140px;
  }

  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .share-favorites {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .hero-badges {
    flex-direction: column;
    align-items: center;
  }

  .hero-badge {
    width: 100%;
    justify-content: center;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .results-count {
    font-size: 1.2rem;
  }

  .controls-group {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-wrapper {
    width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .view-controls {
    width: 100%;
    justify-content: center;
  }

  .products-container.grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
    padding: 12px 16px;
  }

  .empty-content h3 {
    font-size: 1.5rem;
  }

  .empty-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-outline {
    width: 100%;
    justify-content: center;
  }
}

/* ========================================
   ACCESSIBILITY
======================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
