<!-- src/views/Products.vue - COMPLET AVEC SOUS-CATÉGORIES -->
<template>
  <div class="products-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- ===== SECTION ARTISANAT ===== -->
    <section class="artisan-showcase">
      <div class="container">
        <div class="showcase-header">
          <span class="showcase-badge">حرفنا</span>
          <h2 class="showcase-title">روعة <span class="gradient-text">الصناعات اليدوية</span></h2>
          <p class="showcase-subtitle">اكتشف روعة الصناعات اليدوية التونسية الأصيلة</p>
        </div>
        <div class="showcase-grid">
          <div class="showcase-card">
            <div class="showcase-image-wrapper">
              <img src="/src/assets/images/artisan/artisanat1.jpg" alt="فخار تونسي" class="showcase-image" @error="handleShowcaseImageError" />
              <div class="showcase-overlay"></div>
            </div>
          </div>
          <div class="showcase-card">
            <div class="showcase-image-wrapper">
              <img src="/src/assets/images/artisan/artisanat2.jpg" alt="نسيج تونسي" class="showcase-image" @error="handleShowcaseImageError" />
              <div class="showcase-overlay"></div>
            </div>
          </div>
          <div class="showcase-card">
            <div class="showcase-image-wrapper">
              <img src="/src/assets/images/artisan/artisanat3.jpg" alt="نحاس تونسي" class="showcase-image" @error="handleShowcaseImageError" />
              <div class="showcase-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== SECTION CATÉGORIES AVEC HIÉRARCHIE ===== -->
    <section class="categories-scroll-section">
      <div class="container">
        <div class="categories-scroll-header">
          <span class="scroll-badge">📚 تصنيفات</span>
          <h2 class="scroll-title">تسوق حسب <span class="gradient-text">اهتمامك</span></h2>
          <p class="scroll-subtitle">اكتشف منتجاتنا المتنوعة حسب الفئة التي تفضلها</p>
        </div>

        <!-- Catégories principales -->
        <div class="categories-scroll-wrapper">
          <button class="scroll-nav-btn prev-btn" @click="scrollCategories('left')" v-if="showScrollArrows">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2"/></svg>
          </button>
          <div class="categories-scroll-container" ref="scrollContainer">
            <div
              v-for="category in parentCategories"
              :key="'parent-' + category.id"
              class="category-scroll-card parent-category-card"
              :class="{
                active: selectedCategory?.id === category.id,
                'has-children': category.children && category.children.length > 0
              }"
              @click="selectCategory(category)"
            >
              <div class="category-scroll-image" :style="{ backgroundImage: `url(${category.imageUrl})` }">
                <div class="category-scroll-overlay"></div>
                <div class="category-active-indicator" v-if="selectedCategory?.id === category.id"><span>✓</span></div>
              </div>
              <div class="category-scroll-content">
                <span class="category-scroll-icon">{{ category.icon }}</span>
                <h3 class="category-scroll-name">{{ category.name_ar }}</h3>
                <span class="category-scroll-count">{{ getCategoryProductCount(category) }} منتج</span>
              </div>
            </div>
          </div>
          <button class="scroll-nav-btn next-btn" @click="scrollCategories('right')" v-if="showScrollArrows">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2"/></svg>
          </button>
        </div>

        <!-- Sous-catégories (affichées seulement quand une catégorie parente est sélectionnée) -->
        <div v-if="showSubCategories" class="subcategories-section">
          <div class="subcategories-header">
            <span class="subcategory-breadcrumb">
              <span class="parent-name">{{ selectedCategory?.name_ar }}</span>
              <span class="breadcrumb-separator">›</span>
              <span class="sub-title">التصنيفات الفرعية</span>
            </span>
            <button class="back-to-parent" @click="clearSubCategorySelection">
              <span>←</span>
              <span>عرض الكل</span>
            </button>
          </div>
          <div class="subcategories-grid">
            <div
              v-for="subCat in currentSubCategories"
              :key="'sub-' + subCat.id"
              class="subcategory-card"
              :class="{ active: selectedSubCategory?.id === subCat.id }"
              @click="selectSubCategory(subCat)"
            >
              <div class="subcategory-image" :style="{ backgroundImage: `url(${subCat.imageUrl})` }">
                <div class="subcategory-overlay"></div>
                <div class="subcategory-active-indicator" v-if="selectedSubCategory?.id === subCat.id">✓</div>
              </div>
              <div class="subcategory-info">
                <span class="subcategory-icon">{{ subCat.icon || '📁' }}</span>
                <h4 class="subcategory-name">{{ subCat.name_ar || subCat.name }}</h4>
                <span class="subcategory-count">{{ subCat.products_count || 0 }} منتج</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== BARRE DE TRI ===== -->
    <div class="sort-bar">
      <div class="container">
        <div class="sort-wrapper">
          <div class="results-info">
            <span class="results-count">{{ displayedProducts.length }}</span>
            <span class="results-label">منتج</span>
            <span v-if="selectedCategory || selectedSubCategory" class="active-filter">
              {{ selectedSubCategory ? selectedSubCategory.name_ar || selectedSubCategory.name : selectedCategory?.name_ar }}
              <button class="remove-filter" @click="clearCategorySelection">✕</button>
            </span>
            <span v-if="appliedPromoCode && canUsePromoCode" class="active-filter promo-active">
              🎟️ كود: {{ appliedPromoCode.code }}
              <button class="remove-filter" @click="removePromoCode">✕</button>
            </span>
          </div>
          <div class="sort-select-wrapper">
            <label class="sort-label">ترتيب حسب:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="newest">✨ الأحدث</option>
              <option value="price-asc">💰 السعر: من الأقل للأعلى</option>
              <option value="price-desc">💰 السعر: من الأعلى للأقل</option>
              <option value="popular">⭐ الأكثر شهرة</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== BARRE DE RECHERCHE ET FILTRES ===== -->
    <div class="search-filter-bar">
      <div class="container">
        <div class="search-filter-wrapper">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" type="text" placeholder="ابحث عن منتج أو حرفي..." class="search-input" @input="handleSearch" />
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">✕</button>
          </div>
          <div class="price-filter-wrapper">
            <label class="price-filter-label">السعر:</label>
            <div class="price-inputs">
              <input v-model.number="priceMin" type="number" placeholder="من" class="price-input" min="0" @change="handlePriceFilter" />
              <span class="price-separator">-</span>
              <input v-model.number="priceMax" type="number" placeholder="إلى" class="price-input" min="0" @change="handlePriceFilter" />
            </div>
            <button v-if="priceMin || priceMax" class="clear-price" @click="clearPriceFilter">✕</button>
          </div>
          <div class="search-results-count" v-if="searchQuery || priceMin || priceMax">
            <span class="results-found">{{ filteredResults.length }}</span>
            <span class="results-text">نتيجة</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== GRILLE DE PRODUITS ===== -->
    <div class="main-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>جاري التحميل...</span>
        </div>

        <div v-else-if="displayedProducts.length > 0" class="products-grid-6cols">
          <div v-for="product in displayedProducts" :key="'product-' + product.id" class="product-card">
            <div class="product-image-wrapper" @click="goToProduct(product.id)">
              <img :src="getProductImage(product)" :alt="product.name" class="product-image" @error="handleImageError" loading="lazy" />
              <button class="wishlist-btn" :class="{ active: isProductLiked(product.id) }" @click.stop="toggleProductLike(product)" :title="isProductLiked(product.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'">
                <svg viewBox="0 0 24 24" :fill="isProductLiked(product.id) ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="1.8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <div class="product-badge" v-if="product.isNew"><span>جديد</span></div>
              <div class="product-badge sale" v-else-if="getProductDiscount(product)"><span>-{{ getProductDiscount(product) }}%</span></div>
              <div class="product-badge promo-badge" v-if="getProductPromotion(product)"><span>🎁 عرض</span></div>
            </div>

            <div class="product-info-compact">
              <div class="vendor-info-mini" @click.stop="goToVendor(product)">
                <img :src="getVendorAvatar(product)" :alt="getVendorName(product)" class="vendor-avatar-mini" @error="(e) => e.target.src = 'https://i.pravatar.cc/30?u=' + product.id" />
                <span class="vendor-name-mini">{{ getVendorName(product) }}</span>
                <span v-if="product.vendorVerified || product.vendor?.verified" class="vendor-verified-badge">✓</span>
              </div>

              <h3 class="product-name" @click="goToProduct(product.id)">{{ truncateText(product.name, 25) }}</h3>

              <div class="product-rating" v-if="product.rating">
                <div class="stars-mini">
                  <span v-for="i in 5" :key="i" class="star-mini" :class="{ filled: i <= Math.floor(product.rating) }">★</span>
                </div>
                <span class="rating-count">({{ product.reviewsCount || 0 }})</span>
              </div>

              <div class="product-price-wrapper">
                <div class="product-price" v-if="getDiscountedPrice(product)">
                  <span class="current-price">{{ formatPrice(getDiscountedPrice(product)) }}</span>
                  <span class="old-price" v-if="product.price">{{ formatPrice(product.price) }}</span>
                </div>
                <div class="product-price" v-else>
                  <span class="current-price">{{ formatPrice(product.price) }}</span>
                </div>
                <span class="currency">د.ت</span>
              </div>

              <div class="product-actions-compact">
                <button class="quick-add-btn" @click.stop="addToCart(product)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  <span>أضف للسلة</span>
                </button>
              </div>

              <div class="promo-code-info" v-if="canUsePromoCode && getProductPromotion(product)?.type === 'code' && getProductPromotion(product)?.code">
                <span class="promo-code-label">🎟️ كود:</span>
                <span class="promo-code-value">{{ getProductPromotion(product).code }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-symbol">
            <span v-if="searchQuery || priceMin || priceMax">🔍</span>
            <span v-else>🌸</span>
          </div>
          <h3 v-if="searchQuery || priceMin || priceMax">لا توجد نتائج</h3>
          <h3 v-else>لا توجد منتجات</h3>
          <p v-if="searchQuery">لم يتم العثور على نتائج لـ "{{ searchQuery }}"</p>
          <p v-else-if="priceMin || priceMax">لم يتم العثور على منتجات في نطاق السعر المحدد</p>
          <p v-else>لم يتم العثور على منتجات في هذا التصنيف</p>
          <div class="empty-actions">
            <button class="btn-reset" @click="resetAllFilters" v-if="searchQuery || priceMin || priceMax">مسح جميع الفلاتر</button>
            <button class="btn-reset" @click="resetFilters" v-else>عرض جميع المنتجات</button>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
            <span>→</span>
          </button>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="'page-' + page"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="typeof page === 'number' ? currentPage = page : null"
            >
              {{ page }}
            </button>
          </div>
          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <span>←</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== WISHLIST SIDEBAR ===== -->
    <WishlistSidebar />

    <!-- ===== MODAL CODE PROMO (AUTORISÉ) ===== -->
    <transition name="modal-fade">
      <div v-if="showCodePromoModal && canUsePromoCode" class="code-promo-modal-overlay" @click.self="closeCodePromoModal">
        <div class="traditional-code-modal" dir="rtl">
          <div class="traditional-modal-bg">
            <img src="/src/assets/pop.png" alt="Artisanat Tunisien" class="modal-bg-image" @error="handleModalImageError" />
            <div class="modal-image-overlay"></div>
            <div class="modal-content-overlay">
              <button class="modal-close-btn traditional-close" @click="closeCodePromoModal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <div class="modal-badge">
                <span class="badge-icon">🎟️</span>
                <span>رمز خصم حصري</span>
                <span class="badge-icon">🎟️</span>
              </div>
              <h2 class="modal-main-title">أدخل رمز الخصم</h2>
              <p class="modal-subtitle">أدخل الرمز الخاص بك للحصول على خصم فوري</p>
              <div class="modal-input-section">
                <div class="traditional-input-wrapper">
                  <span class="input-prefix">🎫</span>
                  <input
                    type="text"
                    v-model="promoCodeInput"
                    placeholder="أدخل الرمز هنا..."
                    class="traditional-input"
                    :disabled="applyingPromoCode"
                    @keyup.enter="applyPromoCode"
                    dir="ltr"
                  />
                  <button v-if="promoCodeInput" class="clear-input" @click="promoCodeInput = ''">✕</button>
                </div>
              </div>
              <div v-if="appliedPromoCode" class="active-code-display">
                <div class="code-success-badge"><span>✅</span><span>تم التطبيق</span></div>
                <div class="code-info-row">
                  <span class="code-label">الرمز:</span>
                  <span class="code-value">{{ appliedPromoCode.code }}</span>
                </div>
                <div class="code-info-row">
                  <span class="code-label">الخصم:</span>
                  <span class="discount-value">{{ appliedPromoCode.discountValue }}{{ appliedPromoCode.discountType === 'percentage' ? '%' : ' د.ت' }}</span>
                </div>
                <button class="remove-code-btn" @click="removePromoCode">
                  <span>🗑️</span><span>إلغاء الرمز</span>
                </button>
              </div>
              <div class="modal-action-buttons">
                <button v-if="!appliedPromoCode" class="apply-btn traditional-primary" @click="applyPromoCode" :disabled="!promoCodeInput.trim() || applyingPromoCode">
                  <span v-if="!applyingPromoCode">
                    <span>تطبيق الرمز</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                  <span v-else class="loading-spinner"></span>
                </button>
                <button class="close-modal-btn traditional-secondary" @click="closeCodePromoModal">
                  <span>إغلاق</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== TOAST ===== -->
    <transition name="toast-slide">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress"></div>
      </div>
    </transition>

    <!-- ===== BOUTON FLOTTANT CODE PROMO ===== -->
    <div class="floating-promo-icons" v-if="canUsePromoCode">
      <button class="floating-promo-btn" @click="openCodePromoModal" title="أدخل رمز خصم">
        <span class="promo-icon">🎟️</span>
        <span class="promo-label">كود خصم</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import WishlistSidebar from '../components/WishlistSidebar.vue'

const router = useRouter()
const productStore = useProductStore()
const postStore = usePostStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const canUsePromoCode = computed(() => {
  if (authStore.isAuthenticated && authStore.userRole === 'admin') return true
  if (authStore.isAuthenticated) {
    const orderCount = authStore.userOrderCount || 0
    const totalSpent = authStore.userTotalSpent || 0
    const isLoyalCustomer = orderCount > 5 || totalSpent > 500
    const whitelist = JSON.parse(localStorage.getItem('promoCodeWhitelist') || '[]')
    const isWhitelisted = whitelist.includes(authStore.userId) || whitelist.includes(authStore.userEmail)
    return true || isLoyalCustomer || isWhitelisted
  }
  return true
})

const loading = ref(true)
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const categoriesList = ref([])
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 18
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })
const showScrollArrows = ref(false)
const scrollContainer = ref(null)
const allProductsData = ref([])
const allPromotions = ref([])
const showCodePromoModal = ref(false)
const promoCodeInput = ref('')
const applyingPromoCode = ref(false)
const appliedPromoCode = ref(null)
const searchQuery = ref('')
const priceMin = ref(null)
const priceMax = ref(null)
const filteredResults = ref([])

// ===== SOUS-CATÉGORIES =====
const showSubCategories = computed(() => {
  return selectedCategory.value &&
         selectedCategory.value.children &&
         selectedCategory.value.children.length > 0 &&
         !selectedSubCategory.value
})

const parentCategories = computed(() => {
  return categoriesList.value.filter(cat => !cat.parentId || cat.parentId === null)
})

const currentSubCategories = computed(() => {
  if (!selectedCategory.value || !selectedCategory.value.children) return []
  return selectedCategory.value.children
})

const selectSubCategory = (subCat) => {
  selectedSubCategory.value = subCat
  currentPage.value = 1
}

const clearSubCategorySelection = () => {
  selectedSubCategory.value = null
  currentPage.value = 1
}

const clearCategorySelection = () => {
  selectedCategory.value = null
  selectedSubCategory.value = null
  currentPage.value = 1
}

const availablePromoCodes = computed(() => {
  return allPromotions.value.filter(p =>
    p.type === 'code' &&
    p.active &&
    p.code &&
    (!p.expiryDate || new Date(p.expiryDate) >= new Date()) &&
    (!p.startDate || new Date(p.startDate) <= new Date())
  )
})

// ===== FONCTIONS UTILITAIRES =====
const handleModalImageError = (e) => {
  e.target.src = 'https://placehold.co/600x800/8b5e3c/f5e6d3?text=صناعة+تونسية'
}
const handleShowcaseImageError = (e) => {
  e.target.src = 'https://placehold.co/400x300/08717f/white?text=حرفة+تونسية'
}
const handleImageError = (e) => {
  if (!e.target.src.includes('placehold.co')) {
    e.target.src = 'https://placehold.co/400x400/08717f/white?text=Produit'
  }
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0'
  return new Intl.NumberFormat('ar-TN').format(Math.round(price * 1000) / 1000)
}

const truncateText = (text, length = 25) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getProductImage = (product) => {
  if (product?.images?.[0] && product.images[0] !== 'default.jpg') return product.images[0]
  if (product?.image && product.image !== 'default.jpg') return product.image
  return `https://placehold.co/400x400/08717f/white?text=${encodeURIComponent(product?.name || 'Produit')}`
}

const getVendorName = (product) => {
  if (product?.vendor?.name) return product.vendor.name
  if (product?.vendor?.shopName) return product.vendor.shopName
  if (product?.vendorName) return product.vendorName
  if (product?.shopName) return product.shopName
  return 'حرفي'
}

const getVendorAvatar = (product) => {
  if (product?.vendor?.avatar && product.vendor.avatar !== 'null') return product.vendor.avatar
  if (product?.vendor?.userAvatar && product.vendor.userAvatar !== 'null') return product.vendor.userAvatar
  if (product?.vendorAvatar && product.vendorAvatar !== 'null') return product.vendorAvatar
  return `https://i.pravatar.cc/30?u=${product?.vendorId || product?.id || 'default'}`
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️', heart: '❤️' }
  toast.value = { show: true, message, type, icon: icons[type] || icons.success }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ===== CHARGEMENT DES CATÉGORIES AVEC SOUS-CATÉGORIES =====
const loadCategories = async () => {
  try {
    const response = await api.get('/categories?include=children')
    if (response.data.success) {
      const data = response.data.data?.categories || response.data.categories || []
      categoriesList.value = data.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        name_ar: cat.nameAr || cat.name_ar || cat.name,
        icon: cat.icon || '📦',
        imageUrl: cat.imageUrl || `https://placehold.co/100x100/08717f/white?text=${encodeURIComponent(cat.nameAr || cat.name)}`,
        isActive: cat.isActive === 1,
        parentId: cat.parentId || null,
        children: (cat.children || []).map(child => ({
          ...child,
          name_ar: child.nameAr || child.name_ar || child.name,
          imageUrl: child.imageUrl || `https://placehold.co/100x100/08717f/white?text=${encodeURIComponent(child.nameAr || child.name)}`,
          products_count: child.productsCount || child.products_count || 0
        })),
        products_count: cat.productsCount || cat.products_count || 0
      }))
    }
  } catch (error) {
    console.error('❌ Erreur chargement catégories:', error)
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
  selectedSubCategory.value = null
  currentPage.value = 1
}

const getCategoryProductCount = (category) => {
  if (!category || !category.id) return 0
  let count = allProductsData.value.filter(p => p.categoryId === category.id).length
  if (category.children) {
    category.children.forEach(child => {
      count += allProductsData.value.filter(p => p.categoryId === child.id).length
    })
  }
  return count
}

// ===== PROMOTIONS =====
const loadPromotions = () => {
  try {
    const saved = localStorage.getItem('specialOffers')
    if (saved) {
      const offers = JSON.parse(saved)
      allPromotions.value = offers.filter(o => {
        if (!o.active) return false
        if (o.expiryDate && new Date(o.expiryDate) < new Date()) return false
        if (o.startDate && new Date(o.startDate) > new Date()) return false
        return true
      })
    } else {
      allPromotions.value = []
    }
  } catch (error) {
    allPromotions.value = []
  }
}

const getProductPromotion = (product) => {
  if (!product || !product.price) return null
  return allPromotions.value.find(promo => {
    if (!promo.active) return false
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) return false
    if (promo.startDate && new Date(promo.startDate) > new Date()) return false
    if (promo.minPurchase && product.price < promo.minPurchase) return false
    if (promo.type === 'global' && promo.autoApply) return true
    if (promo.type === 'product' && promo.productIds && promo.productIds.includes(product.id)) return true
    if (promo.type === 'vendor' && promo.vendorId === product.vendorId) return true
    return false
  }) || null
}

const getProductDiscount = (product) => {
  const promo = getProductPromotion(product)
  return promo ? promo.discountValue : null
}

const getDiscountedPrice = (product) => {
  if (!product || !product.price) return null
  const promo = getProductPromotion(product)
  if (!promo || !promo.discountValue) return null
  let discountedPrice = product.price
  if (promo.discountType === 'percentage') {
    discountedPrice = product.price * (1 - promo.discountValue / 100)
  } else if (promo.discountType === 'fixed') {
    discountedPrice = Math.max(0, product.price - promo.discountValue)
  }
  if (canUsePromoCode.value && appliedPromoCode.value) {
    const codePromo = appliedPromoCode.value
    if (!codePromo.minPurchase || discountedPrice >= codePromo.minPurchase) {
      if (codePromo.discountType === 'percentage') {
        discountedPrice = discountedPrice * (1 - codePromo.discountValue / 100)
      } else if (codePromo.discountType === 'fixed') {
        discountedPrice = Math.max(0, discountedPrice - codePromo.discountValue)
      }
    }
  }
  return discountedPrice
}

const getProductPriceWithPromo = (product) => {
  const discounted = getDiscountedPrice(product)
  return discounted !== null ? discounted : product.price
}

// ===== CODE PROMO =====
const openCodePromoModal = () => {
  promoCodeInput.value = ''
  showCodePromoModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeCodePromoModal = () => {
  showCodePromoModal.value = false
  document.body.style.overflow = ''
}

const applyPromoCode = () => {
  if (!canUsePromoCode.value) {
    showNotification('❌ عذراً، هذه الميزة مخصصة للعملاء المميزين فقط', 'error')
    return
  }
  if (!promoCodeInput.value.trim()) {
    showNotification('الرجاء إدخال رمز الخصم', 'warning')
    return
  }
  applyingPromoCode.value = true
  const codeOffer = allPromotions.value.find(p =>
    p.type === 'code' &&
    p.code &&
    p.code.toUpperCase() === promoCodeInput.value.trim().toUpperCase() &&
    p.active
  )
  if (!codeOffer) {
    showNotification('❌ رمز الخصم غير صالح', 'error')
    applyingPromoCode.value = false
    return
  }
  if (codeOffer.expiryDate && new Date(codeOffer.expiryDate) < new Date()) {
    showNotification('❌ انتهت صلاحية هذا الرمز', 'error')
    applyingPromoCode.value = false
    return
  }
  appliedPromoCode.value = codeOffer
  localStorage.setItem('activePromoCode', JSON.stringify(codeOffer))
  showNotification(`✅ تم تطبيق رمز الخصم: ${codeOffer.code}`, 'success')
  closeCodePromoModal()
  applyingPromoCode.value = false
}

const removePromoCode = () => {
  appliedPromoCode.value = null
  localStorage.removeItem('activePromoCode')
  showNotification('🗑️ تم إلغاء رمز الخصم', 'info')
}

const loadActivePromoCode = () => {
  if (!canUsePromoCode.value) {
    appliedPromoCode.value = null
    localStorage.removeItem('activePromoCode')
    return
  }
  try {
    const saved = localStorage.getItem('activePromoCode')
    if (saved) {
      const code = JSON.parse(saved)
      const stillValid = allPromotions.value.find(p =>
        p.type === 'code' &&
        p.code === code.code &&
        p.active &&
        (!p.expiryDate || new Date(p.expiryDate) >= new Date())
      )
      if (stillValid) {
        appliedPromoCode.value = code
      } else {
        localStorage.removeItem('activePromoCode')
      }
    }
  } catch (error) {
    console.error('❌ Erreur chargement code promo actif:', error)
  }
}

// ===== PRODUITS =====
const updateProducts = () => {
  const storeProducts = productStore.products || []
  const posts = postStore.posts || []
  const allItems = [...storeProducts, ...posts]
  const uniqueMap = new Map()
  allItems.forEach(item => {
    if (item && item.id && !uniqueMap.has(item.id)) {
      if (item.categoryId) item.categoryId = parseInt(item.categoryId)
      uniqueMap.set(item.id, item)
    }
  })
  allProductsData.value = Array.from(uniqueMap.values())
}

// ===== FILTRAGE =====
const searchedProducts = computed(() => {
  let results = [...allProductsData.value]

  // Filtre par sous-catégorie ou catégorie
  if (selectedSubCategory.value && selectedSubCategory.value.id) {
    results = results.filter(product => product.categoryId === selectedSubCategory.value.id)
  } else if (selectedCategory.value && selectedCategory.value.id) {
    const categoryIds = [selectedCategory.value.id]
    if (selectedCategory.value.children) {
      selectedCategory.value.children.forEach(child => {
        categoryIds.push(child.id)
      })
    }
    results = results.filter(product => categoryIds.includes(product.categoryId))
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    results = results.filter(product => {
      const productName = (product.name || product.productName || '').toLowerCase()
      const vendorName = (product.vendorName || product.vendor?.name || product.vendor?.shopName || '').toLowerCase()
      const description = (product.description || '').toLowerCase()
      return productName.includes(query) || vendorName.includes(query) || description.includes(query)
    })
  }

  // Filtre par prix
  if (priceMin.value !== null && priceMin.value !== '' && !isNaN(priceMin.value)) {
    const minPrice = parseFloat(priceMin.value)
    results = results.filter(product => {
      const price = getProductPriceWithPromo(product)
      return price >= minPrice
    })
  }
  if (priceMax.value !== null && priceMax.value !== '' && !isNaN(priceMax.value)) {
    const maxPrice = parseFloat(priceMax.value)
    results = results.filter(product => {
      const price = getProductPriceWithPromo(product)
      return price <= maxPrice
    })
  }

  // Tri
  switch (sortBy.value) {
    case 'price-asc':
      results.sort((a, b) => (getProductPriceWithPromo(a) || 0) - (getProductPriceWithPromo(b) || 0))
      break
    case 'price-desc':
      results.sort((a, b) => (getProductPriceWithPromo(b) || 0) - (getProductPriceWithPromo(a) || 0))
      break
    case 'popular':
      results.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      break
    default: // newest
      results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }

  filteredResults.value = results
  return results
})

const displayedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return searchedProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(searchedProducts.value.length / itemsPerPage) || 1)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '...', total]
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

const resetFilters = () => {
  selectedCategory.value = null
  selectedSubCategory.value = null
  sortBy.value = 'newest'
  currentPage.value = 1
}

const resetAllFilters = () => {
  searchQuery.value = ''
  priceMin.value = null
  priceMax.value = null
  selectedCategory.value = null
  selectedSubCategory.value = null
  sortBy.value = 'newest'
  currentPage.value = 1
}

// ===== ACTIONS =====
const goToProduct = (id) => {
  if (id) router.push(`/product/${id}`)
}

const addToCart = (product) => {
  if (!product) return
  const finalPrice = getProductPriceWithPromo(product)
  cartStore.addItem({
    id: product.id,
    name: product.name || product.productName,
    price: finalPrice,
    originalPrice: product.price,
    discountApplied: finalPrice < product.price,
    image: getProductImage(product),
    quantity: 1,
    vendorName: product.vendorName,
    vendorId: product.vendorId
  })
  showNotification('✅ تمت إضافة المنتج إلى السلة')
}

const isProductLiked = (productId) => likesStore && likesStore.isLiked ? likesStore.isLiked(productId) : false

const toggleProductLike = (product) => {
  if (!product || !product.id) return
  if (isProductLiked(product.id)) {
    if (likesStore && likesStore.removeLike) likesStore.removeLike(product.id)
    showNotification('💔 تمت إزالة المنتج من المفضلة', 'info')
  } else {
    if (likesStore && likesStore.addLike) {
      likesStore.addLike({
        id: product.id,
        name: product.name || product.productName,
        price: product.price,
        image: getProductImage(product),
        vendorName: product.vendorName || product.vendor?.name
      })
    }
    showNotification('❤️ تمت إضافة المنتج إلى المفضلة', 'heart')
  }
}

const goToVendor = (product) => {
  if (!product) {
    console.warn('⚠️ Produit non défini pour goToVendor')
    return
  }
  const vendorId = product?.vendorId || product?.vendor?.id || product?.userId
  if (vendorId) {
    router.push(`/vendor/${vendorId}`)
  } else {
    const vendorName = getVendorName(product)
    if (vendorName && vendorName !== 'حرفي') {
      router.push(`/vendor/${encodeURIComponent(vendorName.toLowerCase().replace(/\s+/g, '-'))}`)
    } else {
      showNotification('❌ لم يتم العثور على صفحة الحرفي', 'warning')
    }
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    await postStore.fetchFeed()
    if (postStore.posts.length === 0) {
      try {
        const response = await api.get('/posts/feed')
        if (response.data.success) {
          postStore.posts = response.data.data?.posts || []
        }
      } catch (directError) {
        console.warn('Erreur chargement direct:', directError)
      }
    }
    updateProducts()
  } catch (error) {
    console.error('Erreur chargement produits:', error)
    allProductsData.value = []
  } finally {
    loading.value = false
  }
}

const scrollCategories = (direction) => {
  if (scrollContainer.value) {
    const scrollAmount = direction === 'left' ? -250 : 250
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const checkScrollArrows = () => {
  if (scrollContainer.value) {
    showScrollArrows.value = scrollContainer.value.scrollWidth > scrollContainer.value.clientWidth
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const handlePriceFilter = () => {
  if (priceMin.value !== null && priceMax.value !== null &&
      priceMin.value !== '' && priceMax.value !== '' &&
      !isNaN(priceMin.value) && !isNaN(priceMax.value)) {
    if (parseFloat(priceMin.value) > parseFloat(priceMax.value)) {
      const temp = priceMin.value
      priceMin.value = priceMax.value
      priceMax.value = temp
    }
  }
  currentPage.value = 1
}

const clearPriceFilter = () => {
  priceMin.value = null
  priceMax.value = null
  currentPage.value = 1
}

// ===== LIFECYCLE =====
watch([() => productStore.products, () => postStore.posts], () => {
  updateProducts()
}, { deep: true })

watch([selectedCategory, sortBy], () => {
  currentPage.value = 1
})

onMounted(async () => {
  loadPromotions()
  await loadCategories()
  await loadProducts()
  updateProducts()
  loadActivePromoCode()
  await nextTick()
  checkScrollArrows()
  window.addEventListener('resize', checkScrollArrows)
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', checkScrollArrows)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollArrows)
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', checkScrollArrows)
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
</style>

<style scoped>
/* ===== STYLES EXISTANTS CONSERVÉS ===== */
.products-page { background: #f8fafc; min-height: 100vh; direction: rtl; font-family: 'Amiri', 'Cairo', serif; position: relative; }
.products-page * { font-family: 'Amiri', 'Cairo', serif; }
.container { max-width: 1600px; margin: 0 auto; padding: 0 24px; }

/* ===== NOUVEAUX STYLES POUR SOUS-CATÉGORIES ===== */
.subcategories-section {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  animation: slideDown 0.3s ease;
}

.dark-mode .subcategories-section {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.subcategories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .subcategories-header {
  border-bottom-color: #334155;
}

.subcategory-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parent-name {
  font-size: 1rem;
  font-weight: 700;
  color: #08717f;
}

.breadcrumb-separator {
  color: #94a3b8;
  font-size: 1.2rem;
  font-weight: 300;
}

.sub-title {
  color: #64748b;
  font-size: 0.9rem;
}

.back-to-parent {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.dark-mode .back-to-parent {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.back-to-parent:hover {
  background: #08717f;
  color: white;
  border-color: #08717f;
  transform: translateX(-4px);
}

.subcategories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.subcategory-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 4/3;
  border: 2px solid transparent;
}

.subcategory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.subcategory-card.active {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.2);
}

.subcategory-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s ease;
}

.subcategory-card:hover .subcategory-image {
  transform: scale(1.05);
}

.subcategory-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
}

.subcategory-active-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 10;
}

.subcategory-info {
  position: absolute;
  bottom: 8px;
  right: 8px;
  left: 8px;
  color: white;
  z-index: 2;
}

.subcategory-icon {
  font-size: 1.4rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.subcategory-name {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 4px 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.subcategory-count {
  font-size: 0.7rem;
  opacity: 0.9;
}

.category-scroll-card.has-children::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  z-index: 3;
}

/* ===== TOUS LES STYLES EXISTANTS CONSERVÉS ===== */
/* [Gardez tous vos styles existants ici, je ne les répète pas pour la concision] */
</style>
<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
</style>

<style scoped>
.products-page { background: #f8fafc; min-height: 100vh; direction: rtl; font-family: 'Amiri', 'Cairo', serif; position: relative; }
.products-page * { font-family: 'Amiri', 'Cairo', serif; }
.container { max-width: 1600px; margin: 0 auto; padding: 0 24px; }
.artisan-showcase { padding: 60px 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); position: relative; overflow: hidden; }
.dark-mode .artisan-showcase { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
.showcase-header { text-align: center; margin-bottom: 48px; }
.showcase-badge { display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #08717f, #d40025); color: white; border-radius: 40px; font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; letter-spacing: 1px; }
.showcase-title { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
.dark-mode .showcase-title { color: #f1f5f9; }
.gradient-text { background: linear-gradient(135deg, #08717f, #d40025); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.showcase-subtitle { color: #64748b; font-size: 1rem; max-width: 600px; margin: 0 auto; }
.dark-mode .showcase-subtitle { color: #94a3b8; }
.showcase-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.showcase-card { position: relative; border-radius: 24px; overflow: hidden; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
.showcase-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); }
.showcase-image-wrapper { position: relative; aspect-ratio: 4/3; overflow: hidden; }
.showcase-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.showcase-card:hover .showcase-image { transform: scale(1.08); }
.showcase-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%); opacity: 0; transition: opacity 0.4s ease; }
.showcase-card:hover .showcase-overlay { opacity: 1; }
.categories-scroll-section { padding: 60px 0; background: white; }
.dark-mode .categories-scroll-section { background: #1e293b; }
.categories-scroll-header { text-align: center; margin-bottom: 40px; }
.scroll-badge { display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #08717f, #d40025); color: white; border-radius: 40px; font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; }
.scroll-title { font-size: 2.2rem; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.dark-mode .scroll-title { color: #f1f5f9; }
.scroll-subtitle { color: #64748b; font-size: 0.95rem; }
.dark-mode .scroll-subtitle { color: #94a3b8; }
.categories-scroll-wrapper { position: relative; display: flex; align-items: center; gap: 16px; }
.categories-scroll-container { display: flex; overflow-x: auto; gap: 20px; padding: 8px 4px; scrollbar-width: thin; flex: 1; scroll-behavior: smooth; }
.categories-scroll-container::-webkit-scrollbar { height: 6px; }
.categories-scroll-container::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
.categories-scroll-container::-webkit-scrollbar-thumb { background: #08717f; border-radius: 10px; }
.category-scroll-card { flex: 0 0 160px; height: 180px; border-radius: 20px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s ease; }
.category-scroll-card.active { box-shadow: 0 0 0 3px #08717f; transform: scale(1.02); }
.category-scroll-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform 0.4s ease; }
.category-scroll-card:hover .category-scroll-image { transform: scale(1.05); }
.category-scroll-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 100%); }
.category-active-indicator { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; background: #08717f; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; animation: pulse 1s infinite; }
.category-active-indicator span { color: white; font-size: 16px; font-weight: bold; }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.9; } }
.category-scroll-content { position: absolute; bottom: 12px; right: 12px; color: white; z-index: 2; display: flex; flex-direction: column; gap: 4px; }
.category-scroll-icon { font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)); }
.category-scroll-name { font-size: 0.9rem; font-weight: 700; margin: 0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
.category-scroll-count { font-size: 0.7rem; opacity: 0.9; }
.scroll-nav-btn { width: 44px; height: 44px; background: white; border: 1px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #08717f; flex-shrink: 0; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
.scroll-nav-btn:hover { background: #08717f; color: white; border-color: #08717f; transform: scale(1.05); }
.dark-mode .scroll-nav-btn { background: #1e293b; border-color: #334155; color: #0a94a6; }
.dark-mode .scroll-nav-btn:hover { background: #0a94a6; color: white; }
.sort-bar { padding: 16px 0; background: white; border-bottom: 1px solid #e4e6eb; position: sticky; top: 0; z-index: 100; }
.dark-mode .sort-bar { background: #1e293b; border-bottom-color: #334155; }
.sort-wrapper { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.results-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.results-count { font-size: 1rem; font-weight: 700; color: #d40025; }
.results-label { color: #64748b; }
.active-filter { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: #f1f5f9; border-radius: 30px; color: #1e293b; font-size: 0.8rem; }
.dark-mode .active-filter { background: #334155; color: #f1f5f9; }
.active-filter.promo-active { background: linear-gradient(135deg, #f59e0b20, #d9770620); border: 1px solid #f59e0b; }
.remove-filter { background: none; border: none; color: #d40025; cursor: pointer; font-size: 1rem; padding: 0; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.remove-filter:hover { background: #fee2e2; }
.sort-select-wrapper { display: flex; align-items: center; gap: 12px; }
.sort-label { color: #64748b; font-size: 0.85rem; }
.sort-select { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 30px; background: white; color: #1e293b; font-size: 0.85rem; cursor: pointer; outline: none; }
.dark-mode .sort-select { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.sort-select:focus { border-color: #08717f; }
.main-content { padding: 40px 0 60px; }
.products-grid-6cols { display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; }
.product-card { background: white; border-radius: 16px; overflow: hidden; transition: all 0.3s ease; border: 1px solid #e4e6eb; }
.dark-mode .product-card { background: #1e293b; border-color: #334155; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
.product-image-wrapper { position: relative; aspect-ratio: 1; overflow: hidden; cursor: pointer; background: #f5f5f5; }
.product-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.product-card:hover .product-image { transform: scale(1.05); }
.wishlist-btn { position: absolute; top: 12px; left: 12px; width: 36px; height: 36px; background: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; z-index: 10; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); color: #94a3b8; }
.wishlist-btn:hover { transform: scale(1.1); background: white; }
.wishlist-btn.active { color: #ef4444; }
.wishlist-btn svg { width: 18px; height: 18px; }
.product-badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; color: white; background: #10b981; z-index: 10; }
.product-badge.sale { background: #d40025; }
.product-badge.promo-badge { background: linear-gradient(135deg, #f59e0b, #d97706); top: 50px; }
.product-info-compact { padding: 14px; }
.vendor-info-mini { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; border: 1px solid #e2e8f0; margin-bottom: 8px; }
.dark-mode .vendor-info-mini { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-color: #334155; }
.vendor-info-mini:hover { background: linear-gradient(135deg, #e0f2f1 0%, #f0fafb 100%); border-color: #08717f; transform: translateX(-4px); }
.dark-mode .vendor-info-mini:hover { background: linear-gradient(135deg, #0f766e20 0%, #0e749020 100%); border-color: #0a94a6; }
.vendor-avatar-mini { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #08717f; flex-shrink: 0; }
.vendor-name-mini { font-size: 0.8rem; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.dark-mode .vendor-name-mini { color: #f1f5f9; }
.vendor-verified-badge { width: 16px; height: 16px; background: linear-gradient(135deg, #08717f, #065a69); color: white; border-radius: 50%; font-size: 0.6rem; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.product-name { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.dark-mode .product-name { color: #f1f5f9; }
.product-name:hover { color: #08717f; }
.product-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.stars-mini { display: flex; gap: 2px; }
.star-mini { font-size: 0.7rem; color: #cbd5e1; }
.star-mini.filled { color: #fbbf24; }
.rating-count { font-size: 0.65rem; color: #64748b; }
.product-price-wrapper { margin-bottom: 12px; }
.product-price { font-size: 1rem; font-weight: 700; color: #d40025; }
.current-price { color: #d40025; }
.old-price { font-size: 0.7rem; color: #94a3b8; text-decoration: line-through; margin-right: 6px; }
.currency { font-size: 0.7rem; }
.product-actions-compact { display: flex; gap: 8px; }
.quick-add-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; background: #f1f5f9; border: none; border-radius: 10px; font-size: 0.7rem; font-weight: 600; color: #08717f; cursor: pointer; transition: all 0.3s ease; }
.dark-mode .quick-add-btn { background: #334155; color: #0a94a6; }
.quick-add-btn:hover { background: #08717f; color: white; }
.promo-code-info { margin-top: 8px; padding: 4px 8px; background: #fef3c7; border-radius: 8px; font-size: 0.65rem; display: flex; align-items: center; gap: 6px; justify-content: center; }
.promo-code-label { color: #b45309; font-weight: 600; }
.promo-code-value { font-family: monospace; font-weight: 700; color: #d97706; letter-spacing: 1px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 50px; padding-top: 30px; border-top: 1px solid #e4e6eb; }
.dark-mode .pagination { border-top-color: #334155; }
.pagination-btn, .page-number { min-width: 40px; height: 40px; padding: 0 12px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
.dark-mode .pagination-btn, .dark-mode .page-number { background: #1e293b; border-color: #334155; color: #f1f5f9; }
.pagination-btn:hover:not(:disabled), .page-number:hover:not(.active) { background: #08717f; color: white; border-color: #08717f; transform: translateY(-2px); }
.page-number.active { background: #08717f; border-color: #08717f; color: white; }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading-state { text-align: center; padding: 80px 20px; }
.spinner { width: 50px; height: 50px; border: 3px solid #e2e8f0; border-top-color: #08717f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state span { color: #64748b; }
.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 20px; }
.dark-mode .empty-state { background: #1e293b; }
.empty-symbol { font-size: 4rem; margin-bottom: 20px; opacity: 0.5; }
.empty-state h3 { font-size: 1.3rem; color: #1e293b; margin-bottom: 8px; }
.dark-mode .empty-state h3 { color: #f1f5f9; }
.empty-state p { color: #64748b; margin-bottom: 24px; }
.btn-reset { padding: 12px 32px; background: linear-gradient(135deg, #08717f, #d40025); border: none; border-radius: 40px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-reset:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3); }
.floating-promo-icons { position: fixed; bottom: 30px; left: 30px; display: flex; flex-direction: column; gap: 12px; z-index: 1000; }
.floating-promo-btn { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #08717f, #065a69); border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
.floating-promo-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); }
.promo-icon { font-size: 1.5rem; }
.promo-label { font-size: 0.55rem; color: white; font-weight: 600; }
.toast-notification { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 50px; color: white; font-size: 0.9rem; z-index: 10000; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); animation: slideUpToast 0.3s ease; }
@keyframes slideUpToast { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
.toast-notification.success { background: linear-gradient(135deg, #10b981, #059669); }
.toast-notification.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
.toast-notification.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.toast-notification.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.toast-message { font-weight: 500; }
.toast-progress { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255, 255, 255, 0.5); border-radius: 0 0 50px 50px; animation: progress 3s linear forwards; }
@keyframes progress { from { width: 100%; } to { width: 0; } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.code-promo-modal-overlay { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); }
.traditional-code-modal { position: relative; width: 100%; max-width: 420px; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(210, 180, 140, 0.3); font-family: 'Amiri', 'Cairo', serif; }
.traditional-modal-bg { position: relative; width: 100%; min-height: 580px; background: #2c1810; }
.modal-bg-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.02); transition: transform 8s ease; }
.traditional-code-modal:hover .modal-bg-image { transform: scale(1.08); }
.modal-image-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.2) 30%, rgba(0, 0, 0, 0.55) 100%); }
.modal-content-overlay { position: relative; z-index: 10; display: flex; flex-direction: column; min-height: 580px; padding: 24px 20px 28px; color: #f5e6d3; text-align: center; }
.traditional-close { position: absolute; top: 16px; left: 16px; width: 40px; height: 40px; border: none; border-radius: 50%; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); color: #f5e6d3; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; border: 1px solid rgba(210, 180, 140, 0.3); }
.traditional-close:hover { background: rgba(200, 160, 120, 0.3); transform: rotate(90deg); border-color: #d2b48c; }
.modal-badge { display: inline-flex; align-items: center; justify-content: center; gap: 10px; margin: 30px auto 20px; padding: 8px 20px; background: rgba(139, 94, 60, 0.3); backdrop-filter: blur(8px); border-radius: 50px; border: 1px solid rgba(210, 180, 140, 0.4); font-size: 0.95rem; font-weight: 600; color: #f5e6d3; }
.modal-badge .badge-icon { font-size: 1rem; }
.modal-main-title { margin: 0 0 12px; font-size: 2rem; font-weight: 800; color: #ffffff; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); font-family: 'Amiri', serif; letter-spacing: 1px; }
.modal-subtitle { margin: 0 0 24px; font-size: 1rem; color: #f0d5b5; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); opacity: 0.95; }
.modal-input-section { margin-bottom: 20px; }
.traditional-input-wrapper { position: relative; display: flex; align-items: center; background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); border-radius: 50px; border: 1px solid rgba(210, 180, 140, 0.3); padding: 4px; }
.input-prefix { padding: 0 12px; font-size: 1.2rem; }
.traditional-input { flex: 1; padding: 14px 8px 14px 40px; background: transparent; border: none; color: #ffffff; font-size: 1rem; text-align: center; font-family: 'Courier New', monospace; letter-spacing: 2px; outline: none; }
.traditional-input::placeholder { color: rgba(245, 230, 211, 0.6); font-family: 'Amiri', serif; letter-spacing: normal; font-size: 0.9rem; }
.traditional-input:disabled { opacity: 0.6; }
.clear-input { position: absolute; left: 12px; width: 28px; height: 28px; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; color: #f5e6d3; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s ease; }
.clear-input:hover { background: rgba(239, 68, 68, 0.6); }
.active-code-display { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3); }
.code-success-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; color: #6ee7b7; font-weight: 600; }
.code-info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 8px; }
.code-info-row .code-label { color: #d4c4b0; font-size: 0.9rem; }
.code-info-row .code-value { font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 700; color: #ffffff; letter-spacing: 2px; }
.code-info-row .discount-value { font-size: 1.2rem; font-weight: 700; color: #fbbf24; }
.remove-code-btn { width: 100%; margin-top: 8px; padding: 12px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; color: #fca5a5; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; }
.remove-code-btn:hover { background: rgba(239, 68, 68, 0.4); color: #ffffff; }
.suggested-codes-section { margin-bottom: 20px; }
.suggested-codes-section .suggested-title { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; color: #f0d5b5; font-size: 0.95rem; font-weight: 600; }
.suggested-codes-section .title-decoration { color: #d4a574; font-size: 0.9rem; }
.suggested-codes-list { display: flex; flex-direction: column; gap: 8px; }
.suggested-code-chip { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(8px); border-radius: 50px; border: 1px solid rgba(210, 180, 140, 0.25); cursor: pointer; transition: all 0.3s ease; }
.suggested-code-chip:hover { background: rgba(210, 180, 140, 0.2); border-color: #d2b48c; transform: translateY(-2px); }
.chip-discount-badge { padding: 4px 10px; background: #d40025; color: white; border-radius: 30px; font-size: 0.75rem; font-weight: 700; }
.chip-code-text { flex: 1; font-family: 'Courier New', monospace; font-size: 1rem; font-weight: 600; color: #ffffff; letter-spacing: 1.5px; text-align: right; }
.chip-arrow { color: #d2b48c; font-size: 1rem; transition: transform 0.3s ease; }
.suggested-code-chip:hover .chip-arrow { transform: translateX(-4px); }
.no-codes-message { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); border-radius: 16px; border: 1px dashed rgba(210, 180, 140, 0.3); }
.no-codes-message .message-icon { font-size: 1.8rem; opacity: 0.7; }
.no-codes-message p { margin: 0; color: #d4c4b0; font-size: 0.9rem; }
.loyalty-message-traditional { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; margin: 20px 0; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); border-radius: 20px; border: 1px solid rgba(210, 180, 140, 0.2); }
.loyalty-icon-large { font-size: 3rem; margin-bottom: 8px; opacity: 0.8; }
.loyalty-message-traditional h4 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #ffffff; }
.loyalty-message-traditional p { margin: 0; font-size: 0.85rem; color: #d4c4b0; line-height: 1.5; }
.modal-action-buttons { display: flex; gap: 12px; margin-top: auto; margin-bottom: 16px; }
.apply-btn, .close-modal-btn { padding: 14px 20px; border: none; border-radius: 50px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Amiri', serif; }
.traditional-primary { flex: 2; background: linear-gradient(135deg, #8b5e3c, #6b4226); color: #f5e6d3; border: 1px solid rgba(210, 180, 140, 0.5); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
.traditional-primary:hover:not(:disabled) { background: linear-gradient(135deg, #a07048, #7a5030); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); gap: 12px; }
.traditional-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.traditional-secondary { flex: 1; background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); color: #f5e6d3; border: 1px solid rgba(210, 180, 140, 0.3); }
.traditional-secondary:hover { background: rgba(210, 180, 140, 0.2); border-color: #d2b48c; transform: translateY(-2px); }
.modal-footer-note { margin: 0; font-size: 0.75rem; color: #d4c4b0; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2); opacity: 0.9; letter-spacing: 0.5px; }
.loading-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
.search-filter-bar { padding: 16px 0; background: white; border-bottom: 1px solid #e4e6eb; position: sticky; top: 68px; z-index: 99; }
.dark-mode .search-filter-bar { background: #1e293b; border-bottom-color: #334155; }
.search-filter-wrapper { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.search-input-wrapper { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; right: 14px; color: #94a3b8; pointer-events: none; }
.dark-mode .search-icon { color: #64748b; }
.search-input { width: 100%; padding: 12px 44px 12px 40px; border: 2px solid #e2e8f0; border-radius: 30px; font-size: 0.9rem; font-family: 'Amiri', serif; background: #f8fafc; color: #1e293b; transition: all 0.3s ease; outline: none; }
.dark-mode .search-input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.search-input:focus { border-color: #08717f; box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.15); background: white; }
.dark-mode .search-input:focus { background: #1e293b; }
.search-input::placeholder { color: #94a3b8; font-size: 0.85rem; }
.clear-search { position: absolute; left: 12px; width: 28px; height: 28px; background: #e2e8f0; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; font-size: 0.8rem; transition: all 0.2s ease; }
.dark-mode .clear-search { background: #334155; color: #94a3b8; }
.clear-search:hover { background: #ef4444; color: white; }
.price-filter-wrapper { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 30px; padding: 4px 16px; }
.dark-mode .price-filter-wrapper { background: #0f172a; border-color: #334155; }
.price-filter-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
.dark-mode .price-filter-label { color: #94a3b8; }
.price-inputs { display: flex; align-items: center; gap: 6px; }
.price-input { width: 80px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.8rem; text-align: center; background: white; color: #1e293b; outline: none; font-family: 'Amiri', serif; }
.dark-mode .price-input { background: #1e293b; border-color: #334155; color: #f1f5f9; }
.price-input:focus { border-color: #08717f; }
.price-input::placeholder { color: #94a3b8; font-size: 0.75rem; }
.price-separator { color: #64748b; font-weight: 600; }
.clear-price { width: 24px; height: 24px; background: #e2e8f0; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; font-size: 0.7rem; transition: all 0.2s ease; }
.dark-mode .clear-price { background: #334155; color: #94a3b8; }
.clear-price:hover { background: #ef4444; color: white; }
.type-filter-wrapper { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 30px; padding: 4px 16px; }
.dark-mode .type-filter-wrapper { background: #0f172a; border-color: #334155; }
.type-filter-label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
.dark-mode .type-filter-label { color: #94a3b8; }
.type-select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.8rem; background: white; color: #1e293b; cursor: pointer; outline: none; font-family: 'Amiri', serif; }
.dark-mode .type-select { background: #1e293b; border-color: #334155; color: #f1f5f9; }
.type-select:focus { border-color: #08717f; }
.search-results-count { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #08717f, #065a69); border-radius: 30px; color: white; }
.results-found { font-size: 1.1rem; font-weight: 800; }
.results-text { font-size: 0.8rem; opacity: 0.9; }
@media (max-width: 1400px) { .products-grid-6cols { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 1200px) { .products-grid-6cols { grid-template-columns: repeat(4, 1fr); } .showcase-grid { gap: 20px; } }
@media (max-width: 992px) { .products-grid-6cols { grid-template-columns: repeat(3, 1fr); } .showcase-grid { grid-template-columns: repeat(2, 1fr); } .container { padding: 0 20px; } }
@media (max-width: 768px) { .products-grid-6cols { grid-template-columns: repeat(2, 1fr); } .showcase-grid { grid-template-columns: 1fr; } .category-scroll-card { flex: 0 0 130px; height: 150px; } .scroll-nav-btn { display: none; } .sort-wrapper { flex-direction: column; align-items: flex-start; } .showcase-title { font-size: 1.8rem; } .scroll-title { font-size: 1.5rem; } .search-filter-wrapper { flex-direction: column; align-items: stretch; } .search-input-wrapper { min-width: 100%; } .price-filter-wrapper, .type-filter-wrapper { width: 100%; justify-content: space-between; } .price-input { width: 60px; } .search-results-count { justify-content: center; } }
@media (max-width: 480px) { .products-grid-6cols { grid-template-columns: 1fr; } .container { padding: 0 16px; } .product-actions-compact { flex-direction: column; } .category-scroll-card { flex: 0 0 110px; height: 130px; } .traditional-code-modal { max-width: 100%; border-radius: 28px; } .traditional-modal-bg, .modal-content-overlay { min-height: 540px; } .modal-main-title { font-size: 1.8rem; } .modal-subtitle { font-size: 0.9rem; } .modal-badge { margin-top: 20px; font-size: 0.85rem; } .modal-action-buttons { flex-direction: column; } .apply-btn, .close-modal-btn { width: 100%; } }
</style>
