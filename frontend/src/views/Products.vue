<!-- src/views/Products.vue -->
<template>
  <div class="products-page">
    <!-- Hero Section -->
    <section class="products-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-line">{{ $t('products.title') }}</span>
          </h1>
          <p class="hero-description">{{ $t('products.subtitle') }}</p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Categories Pills -->
        <div class="categories-wrapper">
          <div class="categories-scroll">
            <button
              class="category-pill"
              :class="{ active: selectedCategory === null }"
              @click="selectCategory(null)"
            >
              <span class="pill-icon">📋</span>
              <span class="pill-text">{{ $t('products.all') }}</span>
              <span class="pill-count">{{ totalProducts }}</span>
            </button>

            <button
              v-for="category in categories"
              :key="category.id"
              class="category-pill"
              :class="{ active: selectedCategory === category.slug }"
              @click="selectCategory(category.slug)"
            >
              <span class="pill-icon">{{ category.icon }}</span>
              <span class="pill-text">{{ getCategoryName(category) }}</span>
              <span class="pill-count">{{ category.count }}</span>
            </button>
          </div>
        </div>

        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <span class="results-count">{{ filteredProducts.length }}</span>
            <span class="results-label">{{ $t('products.all') }}</span>
            <span v-if="selectedCategory" class="results-category">
              {{ $t('common.in') }} {{ getCategoryNameById(selectedCategory) }}
            </span>
            <span v-if="searchQuery" class="results-query">
              {{ $t('common.for') }} "{{ searchQuery }}"
            </span>
          </div>

          <div class="sort-wrapper">
            <label for="sort" class="sort-label">{{ $t('products.sortBy') }}:</label>
            <select id="sort" v-model="sortBy" class="sort-select">
              <option value="newest">{{ $t('products.newest') }}</option>
              <option value="price-asc">{{ $t('products.priceAsc') }}</option>
              <option value="price-desc">{{ $t('products.priceDesc') }}</option>
              <option value="rating">{{ $t('products.topRated') }}</option>
              <option value="popular">{{ $t('products.popular') }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="paginatedProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            @quick-view="openQuickView"
            @added-to-cart="handleAddToCart"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>{{ $t('search.noResults') }}</h3>
          <p>{{ $t('common.tryDifferent') }}</p>
          <button class="btn-reset" @click="resetFilters">
            {{ $t('common.viewAll') }}
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" stroke-width="2"/>
            </svg>
            {{ $t('common.previous') }}
          </button>

          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="page-number"
              :class="{ 
                active: page === currentPage,
                dots: page === '...'
              }"
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
            {{ $t('common.next') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </main>

    <!-- Quick View Modal -->
    <QuickViewModal
      v-if="quickViewProduct"
      :product="quickViewProduct"
      :is-visible="showQuickView"
      @close="closeQuickView"
      @add-to-cart="addToCartFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import QuickViewModal from '../components/QuickViewModal.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const postStore = usePostStore()
const cartStore = useCartStore()

// ===== STATE =====
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12
const quickViewProduct = ref(null)
const showQuickView = ref(false)

// ===== COMPUTED =====
const categories = computed(() => postStore.categories)

const allProducts = computed(() => {
  return postStore.getAllPosts()
})

const totalProducts = computed(() => allProducts.value.length)

const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  // Filter by category
  if (selectedCategory.value) {
    products = products.filter(p => p.category === selectedCategory.value)
  }

  // Filter by search from URL
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.productName.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.vendorName.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      products.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      products.sort((a, b) => b.rating - a.rating)
      break
    case 'popular':
      products.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      break
    default: // newest
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return products
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
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

// ===== METHODS =====
const getCategoryName = (category) => {
  return locale.value === 'ar' ? category.name : category.nameFr
}

const getCategoryNameById = (slug) => {
  const category = categories.value.find(c => c.slug === slug)
  if (!category) return slug
  return locale.value === 'ar' ? category.name : category.nameFr
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
  const query = { ...route.query }
  if (categoryId) {
    query.category = categoryId
  } else {
    delete query.category
  }
  router.replace({ query })
}

const resetFilters = () => {
  selectedCategory.value = null
  searchQuery.value = ''
  sortBy.value = 'newest'
  currentPage.value = 1
  router.replace({ query: {} })
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

const handleAddToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.productName,
    price: product.price,
    image: product.images?.[0],
    quantity: 1,
    vendorName: product.vendorName
  })
}

const addToCartFromModal = (cartItem) => {
  cartStore.addItem({
    id: cartItem.product.id,
    name: cartItem.product.productName,
    price: cartItem.product.price,
    image: cartItem.product.images?.[0],
    quantity: cartItem.quantity || 1,
    vendorName: cartItem.product.vendorName
  })
  closeQuickView()
}

// ===== WATCHERS =====
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.category) {
      selectedCategory.value = newQuery.category
    }
    if (newQuery.search) {
      searchQuery.value = newQuery.search
    }
  },
  { immediate: true }
)

watch([selectedCategory, searchQuery, sortBy], () => {
  currentPage.value = 1
})

// ===== LIFECYCLE =====
onMounted(() => {
  loading.value = false
})
</script>

<style scoped>
/* Tous les styles CSS restent exactement les mêmes que dans votre Products.vue original */
</style>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8fafc;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section - simplifiée */
.products-hero {
  background: linear-gradient(135deg, #08717f, #d40025);
  padding: 60px 0 40px;
  color: white;
  text-align: center;
}

.hero-title {
  margin-bottom: 15px;
}

.title-line {
  display: block;
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.95;
}

/* Categories Pills - Design épuré */
.categories-wrapper {
  margin: 30px 0 20px;
  background: white;
  border-radius: 50px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.categories-scroll {
  display: flex;
  gap: 8px;
  padding: 2px;
  min-width: min-content;
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-pill:hover {
  background: #edf2f7;
  border-color: #08717f;
}

.category-pill.active {
  background: linear-gradient(135deg, #08717f, #065a69);
  border-color: #08717f;
  color: white;
}

.pill-icon {
  font-size: 1rem;
}

.pill-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 20px;
  font-size: 0.7rem;
  margin-right: 4px;
}

.category-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Results Header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 15px 0;
  border-bottom: 1px solid #e2e8f0;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.results-count {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d40025;
}

.results-category,
.results-query {
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  color: #64748b;
  font-size: 0.9rem;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: #08717f;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.btn-reset {
  padding: 12px 30px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 40px 0 20px;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #08717f;
  color: #08717f;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover:not(.dots):not(:disabled) {
  border-color: #08717f;
  color: #08717f;
}

.page-number.active {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.page-number.dots {
  border: none;
  cursor: default;
}

/* Responsive */
@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .sort-wrapper {
    width: 100%;
  }

  .sort-select {
    flex: 1;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .pagination {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .category-pill {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>