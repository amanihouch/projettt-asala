<template>
  <div class="advanced-search-page">
    <!-- Hero avec search bar -->
    <section class="search-hero">
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-icon">🔍</span>
            <span class="title-text">البحث المتقدم</span>
          </h1>
          <p class="hero-subtitle">ابحث عن المنتج المثالي من بين آلاف الحرف اليدوية</p>

          <!-- Quick Search Bar -->
          <div class="quick-search">
            <div class="search-input-wrapper">
              <input
                v-model="quickSearch"
                type="text"
                placeholder="ما الذي تبحث عنه؟"
                class="search-input"
                @keyup.enter="performQuickSearch"
              />
              <button class="search-button" @click="performQuickSearch">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>
            <div class="search-tags">
              <span class="tag" v-for="tag in popularTags" :key="tag" @click="applyTag(tag)">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Search Section -->
    <section class="search-section">
      <div class="container">
        <div class="search-layout">
          <!-- Filters Sidebar avec accordéon -->
          <aside class="filters-sidebar" :class="{ collapsed: sidebarCollapsed }">
            <div class="sidebar-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" />
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" />
                  <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" />
                </svg>
                تصفية النتائج
              </h3>
              <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
                {{ sidebarCollapsed ? '←' : '→' }}
              </button>
            </div>

            <div class="filters-content" v-if="!sidebarCollapsed">
              <!-- Catégories avec search -->
              <div class="filter-group">
                <div class="filter-header" @click="toggleCategory">
                  <h4>التصنيف</h4>
                  <span class="toggle-icon">{{ categoriesExpanded ? '-' : '+' }}</span>
                </div>
                <div class="filter-body" v-if="categoriesExpanded">
                  <div class="category-search">
                    <input
                      v-model="categorySearch"
                      type="text"
                      placeholder="بحث في التصنيفات..."
                      class="search-input-sm"
                    />
                  </div>
                  <div class="filter-options">
                    <label
                      v-for="cat in filteredCategories"
                      :key="cat.value"
                      class="filter-option checkbox-modern"
                    >
                      <input
                        type="checkbox"
                        :value="cat.value"
                        v-model="filters.categories"
                        @change="applyFilters"
                      />
                      <span class="checkmark"></span>
                      <span class="option-text">
                        <span class="option-icon">{{ cat.icon }}</span>
                        {{ cat.label }}
                        <span class="option-count">({{ cat.count }})</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Price Range avec slider -->
              <div class="filter-group">
                <div class="filter-header" @click="togglePrice">
                  <h4>نطاق السعر (د.ت)</h4>
                  <span class="toggle-icon">{{ priceExpanded ? '-' : '+' }}</span>
                </div>
                <div class="filter-body" v-if="priceExpanded">
                  <div class="price-range">
                    <div class="price-slider">
                      <input
                        type="range"
                        v-model="priceSlider.min"
                        :min="priceLimits.min"
                        :max="priceLimits.max"
                        @input="updatePriceInputs"
                        class="slider"
                      />
                      <input
                        type="range"
                        v-model="priceSlider.max"
                        :min="priceLimits.min"
                        :max="priceLimits.max"
                        @input="updatePriceInputs"
                        class="slider"
                      />
                    </div>
                    <div class="price-inputs">
                      <div class="price-input">
                        <span class="input-label">من</span>
                        <input
                          v-model="filters.minPrice"
                          type="number"
                          :placeholder="priceLimits.min"
                          class="input-sm"
                        />
                      </div>
                      <div class="price-input">
                        <span class="input-label">إلى</span>
                        <input
                          v-model="filters.maxPrice"
                          type="number"
                          :placeholder="priceLimits.max"
                          class="input-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="price-display">
                    <span class="current-price">{{ formatPrice(priceSlider.min) }}</span>
                    <span class="price-separator">-</span>
                    <span class="current-price">{{ formatPrice(priceSlider.max) }}</span>
                  </div>
                </div>
              </div>

              <!-- Rating avec stars -->
              <div class="filter-group">
                <div class="filter-header" @click="toggleRating">
                  <h4>التقييم</h4>
                  <span class="toggle-icon">{{ ratingExpanded ? '-' : '+' }}</span>
                </div>
                <div class="filter-body" v-if="ratingExpanded">
                  <div class="rating-options">
                    <label
                      v-for="rating in [5, 4, 3, 2, 1]"
                      :key="rating"
                      class="rating-option"
                      @click="filters.minRating = rating"
                    >
                      <div class="rating-stars">
                        <span
                          v-for="star in 5"
                          :key="star"
                          class="star"
                          :class="{ filled: star <= rating }"
                        >
                          ⭐
                        </span>
                      </div>
                      <span class="rating-text">و أعلى</span>
                      <input
                        type="radio"
                        name="rating"
                        :value="rating"
                        v-model="filters.minRating"
                        @change="applyFilters"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Reset & Apply Buttons -->
              <div class="filter-actions">
                <button class="btn btn-outline" @click="resetFilters">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12a9 9 0 11-9-9" stroke="currentColor" stroke-width="2" />
                    <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" />
                  </svg>
                  إعادة تعيين
                </button>
                <button class="btn btn-primary" @click="applyFilters">تطبيق الفلاتر</button>
              </div>

              <!-- Active Filters -->
              <div class="active-filters" v-if="hasActiveFilters">
                <h5>الفلاتر النشطة:</h5>
                <div class="active-tags">
                  <span
                    v-for="filter in activeFilterTags"
                    :key="filter.label"
                    class="active-tag"
                    @click="removeFilter(filter.type, filter.value)"
                  >
                    {{ filter.label }}
                    <span class="remove-icon">×</span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <!-- Results Area -->
          <main class="search-results">
            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <h2 class="results-title">
                  <span class="results-count">{{ filteredProducts.length }}</span>
                  منتج
                  <span v-if="quickSearch" class="search-query">لـ "{{ quickSearch }}"</span>
                </h2>
                <div class="view-toggle">
                  <button
                    class="view-btn"
                    :class="{ active: viewMode === 'grid' }"
                    @click="viewMode = 'grid'"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="sort-options">
                <select v-model="sortBy" class="sort-select" @change="applySorting">
                  <option value="relevance">الأكثر صلة</option>
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: الأقل أولاً</option>
                  <option value="price_desc">السعر: الأعلى أولاً</option>
                  <option value="rating">التقييم الأعلى</option>
                  <option value="popular">الأكثر شعبية</option>
                </select>
              </div>
            </div>

            <!-- Results Grid/List -->
            <div class="results-container" :class="`view-${viewMode}`">
              <template v-if="filteredProducts.length > 0">
                <div
                  v-for="product in sortedProducts"
                  :key="product.id"
                  class="product-item"
                  :class="{ sponsored: product.isSponsored }"
                >
                  <ProductCard :product="product" :view-mode="viewMode" />
                </div>
              </template>
              <div v-else class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>لا توجد نتائج</h3>
                <p>جرب تغيير الفلاتر أو البحث عن شيء آخر</p>
                <button class="btn btn-outline" @click="resetFilters">عرض كل المنتجات</button>
              </div>
            </div>

            <!-- Pagination -->
            <div class="pagination" v-if="filteredProducts.length > 0">
              <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" />
                </svg>
                السابق
              </button>

              <div class="pagination-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="pagination-number"
                  :class="{ active: page === currentPage, dots: page === '...' }"
                  @click="page !== '...' && (currentPage = page)"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>

              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                التالي
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>

            <!-- Load More -->
            <div class="load-more" v-if="showLoadMore">
              <button class="btn btn-outline" @click="loadMore">
                تحميل المزيد
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" />
                </svg>
              </button>
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- Search Tips -->
    <section class="search-tips">
      <div class="container">
        <h3>نصائح للبحث</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-icon">🔍</div>
            <h4>استخدم كلمات مفتاحية محددة</h4>
            <p>مثل "سجادة تونسية" أو "فخار تقليدي"</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🏷️</div>
            <h4>تصفية حسب النطاق السعري</h4>
            <p>حدد ميزانيتك للحصول على نتائج مناسبة</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">⭐</div>
            <h4>انظر إلى التقييمات</h4>
            <p>المنتجات الأعلى تقييماً هي الأكثر جودة</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from '../components/ProductCard.vue'

// State
const quickSearch = ref('')
const sidebarCollapsed = ref(false)
const categoriesExpanded = ref(true)
const priceExpanded = ref(true)
const ratingExpanded = ref(true)
const categorySearch = ref('')
const viewMode = ref('grid')
const sortBy = ref('relevance')
const currentPage = ref(1)
const itemsPerPage = 12
const priceSlider = ref({ min: 0, max: 1000 })

// Filters
const filters = ref({
  categories: [],
  minPrice: '',
  maxPrice: '',
  minRating: null,
})

// Data
const popularTags = ref(['سجاد', 'فخار', 'نحاس', 'مجوهرات', 'ملابس تقليدية', 'خشب'])

const categories = ref([
  { value: 'carpets', label: 'السجاد والمنسوجات', icon: '🧵', count: 156 },
  { value: 'pottery', label: 'الفخار والخزف', icon: '🏺', count: 89 },
  { value: 'copperware', label: 'النحاسيات', icon: '✨', count: 67 },
  { value: 'jewelry', label: 'الحلي والمجوهرات', icon: '💍', count: 124 },
  { value: 'clothing', label: 'الملابس التقليدية', icon: '👗', count: 92 },
  { value: 'woodwork', label: 'الخشبيات والنحت', icon: '🪵', count: 58 },
])

const allProducts = ref([
  {
    id: 1,
    name: 'سجادة تونسية تقليدية',
    price: 450,
    originalPrice: 550,
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
    rating: 4.8,
    reviews: 45,
    category: 'carpets',
    isSponsored: true,
    tags: ['سجاد', 'يدوي', 'صوف'],
  },
  {
    id: 2,
    name: 'إناء فخاري زخرفي',
    price: 120,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
    rating: 4.6,
    reviews: 32,
    category: 'pottery',
    tags: ['فخار', 'زخرفة', 'تقليدي'],
  },
  {
    id: 3,
    name: 'صينية نحاسية مطرقة',
    price: 280,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    rating: 4.9,
    reviews: 28,
    category: 'copperware',
    tags: ['نحاس', 'مطرقة', 'تقليدي'],
  },
  {
    id: 4,
    name: 'عقد تونسي تقليدي',
    price: 350,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    rating: 4.7,
    reviews: 51,
    category: 'jewelry',
    isNew: true,
    tags: ['مجوهرات', 'فضة', 'تقليدي'],
  },
])

// Computed
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value
  return categories.value.filter((cat) =>
    cat.label.toLowerCase().includes(categorySearch.value.toLowerCase()),
  )
})

const priceLimits = computed(() => {
  const prices = allProducts.value.map((p) => p.price)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
})

const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // Quick search
  if (quickSearch.value) {
    const searchTerm = quickSearch.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchTerm))),
    )
  }

  // Category filter
  if (filters.value.categories.length > 0) {
    result = result.filter((p) => filters.value.categories.includes(p.category))
  }

  // Price filter
  if (filters.value.minPrice) {
    result = result.filter((p) => p.price >= parseInt(filters.value.minPrice))
  }
  if (filters.value.maxPrice) {
    result = result.filter((p) => p.price <= parseInt(filters.value.maxPrice))
  }

  // Rating filter
  if (filters.value.minRating) {
    result = result.filter((p) => p.rating >= filters.value.minRating)
  }

  return result
})

const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return sorted.reverse()
    case 'popular':
      return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    default:
      return sorted
  }
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const delta = 2

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
})

const hasActiveFilters = computed(() => {
  return (
    filters.value.categories.length > 0 ||
    filters.value.minPrice ||
    filters.value.maxPrice ||
    filters.value.minRating ||
    quickSearch.value
  )
})

const activeFilterTags = computed(() => {
  const tags = []

  filters.value.categories.forEach((cat) => {
    const category = categories.value.find((c) => c.value === cat)
    if (category) {
      tags.push({
        type: 'category',
        value: cat,
        label: category.label,
      })
    }
  })

  if (filters.value.minPrice) {
    tags.push({
      type: 'minPrice',
      value: filters.value.minPrice,
      label: `من ${filters.value.minPrice} د.ت`,
    })
  }

  if (filters.value.maxPrice) {
    tags.push({
      type: 'maxPrice',
      value: filters.value.maxPrice,
      label: `إلى ${filters.value.maxPrice} د.ت`,
    })
  }

  if (filters.value.minRating) {
    tags.push({
      type: 'rating',
      value: filters.value.minRating,
      label: `${filters.value.minRating}+ ⭐`,
    })
  }

  return tags
})

const showLoadMore = computed(() => {
  return filteredProducts.value.length > itemsPerPage * currentPage.value
})

// Methods
const toggleCategory = () => {
  categoriesExpanded.value = !categoriesExpanded.value
}

const togglePrice = () => {
  priceExpanded.value = !priceExpanded.value
}

const toggleRating = () => {
  ratingExpanded.value = !ratingExpanded.value
}

const updatePriceInputs = () => {
  filters.value.minPrice = priceSlider.value.min
  filters.value.maxPrice = priceSlider.value.max
}

const formatPrice = (price) => {
  return `${price} د.ت`
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  // Sorting is applied reactively
}

const resetFilters = () => {
  filters.value = {
    categories: [],
    minPrice: '',
    maxPrice: '',
    minRating: null,
  }
  quickSearch.value = ''
  priceSlider.value = { min: priceLimits.value.min, max: priceLimits.value.max }
  currentPage.value = 1
}

const removeFilter = (type, value) => {
  switch (type) {
    case 'category':
      filters.value.categories = filters.value.categories.filter((cat) => cat !== value)
      break
    case 'minPrice':
      filters.value.minPrice = ''
      break
    case 'maxPrice':
      filters.value.maxPrice = ''
      break
    case 'rating':
      filters.value.minRating = null
      break
  }
}

const performQuickSearch = () => {
  currentPage.value = 1
}

const applyTag = (tag) => {
  quickSearch.value = tag
  performQuickSearch()
}

const loadMore = () => {
  currentPage.value++
}

// Watch price limits
watch(
  priceLimits,
  (newVal) => {
    priceSlider.value = { min: newVal.min, max: newVal.max }
  },
  { immediate: true },
)
</script>

<style scoped>
.advanced-search-page {
  width: 100%;
  min-height: 100vh;
  background: var(--neutral-gray-50);
}

/* Hero Section */
.search-hero {
  background: linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-blue) 100%);
  padding: 120px 0 80px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path fill="rgba(255,255,255,0.05)" d="M0,0 C250,100 750,100 1000,0 L1000,1000 L0,1000 Z"/></svg>')
    no-repeat bottom;
  background-size: cover;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.title-icon {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
}

.title-text {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  background: linear-gradient(45deg, #fff, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

/* Quick Search */
.quick-search {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-top: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  border-color: white;
  background: rgba(255, 255, 255, 0.15);
}

.search-button {
  padding: 0 30px;
  background: var(--primary-gold);
  color: var(--primary-navy);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: #fbbf24;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.tag {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Search Layout */
.search-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  margin-top: 40px;
}

/* Filters Sidebar */
.filters-sidebar {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--neutral-gray-200);
  transition: all 0.3s ease;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.filters-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: var(--gradient-primary);
  color: white;
}

.sidebar-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.2rem;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.filters-content {
  padding: 24px;
}

.filter-group {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--neutral-gray-200);
  padding-bottom: 24px;
}

.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 0;
}

.filter-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--neutral-gray-900);
}

.toggle-icon {
  color: var(--primary-blue);
  font-weight: 700;
  font-size: 1.2rem;
}

.filter-body {
  padding-top: 16px;
}

.category-search {
  margin-bottom: 16px;
}

.search-input-sm {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--neutral-gray-200);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input-sm:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.filter-options {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.filter-options::-webkit-scrollbar {
  width: 6px;
}

.filter-options::-webkit-scrollbar-track {
  background: var(--neutral-gray-100);
  border-radius: 3px;
}

.filter-options::-webkit-scrollbar-thumb {
  background: var(--neutral-gray-300);
  border-radius: 3px;
}

.checkbox-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-modern:hover {
  background: var(--neutral-gray-50);
}

.checkbox-modern input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--neutral-gray-300);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-modern input:checked + .checkmark {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
}

.checkbox-modern input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.option-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-icon {
  font-size: 1.2rem;
}

.option-count {
  margin-right: auto;
  color: var(--neutral-gray-400);
  font-size: 0.85rem;
}

/* Price Range */
.price-range {
  padding: 16px 0;
}

.price-slider {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: var(--neutral-gray-200);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-blue);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.price-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.price-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.85rem;
  color: var(--neutral-gray-600);
}

.input-sm {
  padding: 10px 12px;
  border: 2px solid var(--neutral-gray-200);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.input-sm:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.price-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--neutral-gray-50);
  border-radius: 8px;
}

.current-price {
  font-weight: 700;
  color: var(--primary-navy);
}

.price-separator {
  color: var(--neutral-gray-400);
}

/* Rating Options */
.rating-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-option:hover {
  background: var(--neutral-gray-50);
}

.rating-option input {
  display: none;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.star.filled {
  opacity: 1;
  color: #fbbf24;
}

.rating-text {
  color: var(--neutral-gray-600);
  font-size: 0.9rem;
}

/* Filter Actions */
.filter-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.filter-actions .btn {
  padding: 12px;
  font-size: 0.9rem;
}

/* Active Filters */
.active-filters {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--neutral-gray-200);
}

.active-filters h5 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: var(--neutral-gray-600);
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary-blue);
  color: white;
  border-radius: 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.active-tag:hover {
  background: var(--primary-navy);
  transform: translateY(-2px);
}

.remove-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Results Header */
.results-header {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.results-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.results-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--neutral-gray-900);
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count {
  color: var(--primary-blue);
  font-weight: 900;
  font-size: 2rem;
}

.search-query {
  color: var(--primary-gold);
  font-weight: 600;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--neutral-gray-100);
  padding: 4px;
  border-radius: 8px;
}

.view-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--neutral-gray-600);
  transition: all 0.3s ease;
}

.view-btn.active {
  background: white;
  color: var(--primary-blue);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sort-options {
  min-width: 200px;
}

.sort-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--neutral-gray-200);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--neutral-gray-900);
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-blue);
}

/* Results Container */
.results-container {
  min-height: 400px;
}

.results-container.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.results-container.view-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item.sponsored {
  position: relative;
}

.product-item.sponsored::before {
  content: 'مميز';
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: var(--primary-gold);
  color: var(--primary-navy);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.no-results {
  text-align: center;
  padding: 80px 20px;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results h3 {
  margin: 0 0 12px 0;
  color: var(--neutral-gray-900);
}

.no-results p {
  color: var(--neutral-gray-600);
  margin-bottom: 24px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid var(--neutral-gray-200);
  border-radius: 8px;
  font-weight: 600;
  color: var(--neutral-gray-700);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:not(:disabled):hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--neutral-gray-200);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-number.active {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  color: white;
}

.pagination-number:not(.active):not(.dots):hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.pagination-number.dots {
  border: none;
  background: transparent;
  cursor: default;
}

/* Load More */
.load-more {
  text-align: center;
  margin-top: 24px;
}

.load-more .btn {
  padding: 14px 32px;
  font-size: 1rem;
  border-radius: 12px;
}

/* Search Tips */
.search-tips {
  margin-top: 60px;
  padding: 60px 0;
  background: white;
  border-top: 1px solid var(--neutral-gray-200);
}

.search-tips h3 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
  color: var(--neutral-gray-900);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.tip-card {
  text-align: center;
  padding: 30px;
  background: var(--neutral-gray-50);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.tip-card h4 {
  margin: 0 0 12px 0;
  color: var(--neutral-gray-900);
}

.tip-card p {
  margin: 0;
  color: var(--neutral-gray-600);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 1200px) {
  .search-layout {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 992px) {
  .search-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: fixed;
    top: 0;
    right: -100%;
    width: 90%;
    max-width: 400px;
    height: 100vh;
    z-index: 1001;
    transition: right 0.3s ease;
  }

  .filters-sidebar:not(.collapsed) {
    right: 0;
  }

  .results-header {
    flex-direction: column;
    align-items: stretch;
  }

  .results-info {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .search-hero {
    padding: 80px 0 40px;
  }

  .hero-title {
    flex-direction: column;
    gap: 10px;
  }

  .quick-search {
    padding: 20px;
  }

  .search-input-wrapper {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }

  .results-container.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .pagination {
    flex-direction: column;
  }

  .pagination-numbers {
    order: 2;
  }

  .pagination-btn {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .filter-actions {
    grid-template-columns: 1fr;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
