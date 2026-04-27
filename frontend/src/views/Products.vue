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

    <!-- Main Content avec Sidebar Filtres -->
    <main class="main-content">
      <div class="container">
        <div class="content-wrapper">
          <!-- Sidebar Filtres -->
          <aside class="filters-sidebar">
            <!-- Bouton toggle mobile -->
            <button class="filter-toggle" @click="showMobileFilters = !showMobileFilters">
              <span class="toggle-icon">⚙️</span>
              {{ $t('filters.title') }}
              <span class="toggle-arrow">{{ showMobileFilters ? '▲' : '▼' }}</span>
            </button>

            <!-- Contenu des filtres -->
            <div class="filters-content" :class="{ 'mobile-visible': showMobileFilters }">
              <!-- Filtre Catégorie -->
              <div class="filter-section">
                <h3 class="filter-title" @click="toggleFilterSection('category')">
                  <span class="title-text">{{ $t('filters.category') }}</span>
                  <span class="filter-arrow">{{ expandedSections.category ? '−' : '+' }}</span>
                </h3>
                <div v-show="expandedSections.category" class="filter-options">
                  <label class="filter-option" v-for="cat in categories" :key="cat.slug">
                    <input
                      type="checkbox"
                      :value="cat.slug"
                      v-model="filters.category"
                      @change="applyFilters"
                    />
                    <span class="option-text">{{ currentLanguage === 'ar' ? cat.name : cat.nameFr }}</span>
                    <span class="option-count">({{ cat.count }})</span>
                  </label>
                  <button v-if="categories.length > 6" class="see-more" @click="toggleSeeMore('categories')">
                    {{ showMore.categories ? '− ' + $t('filters.seeLess') : '+ ' + $t('filters.seeMore') }}
                  </button>
                </div>
              </div>

              <!-- Filtre Couleur -->
              <div class="filter-section">
                <h3 class="filter-title" @click="toggleFilterSection('color')">
                  <span class="title-text">{{ $t('filters.color') }}</span>
                  <span class="filter-arrow">{{ expandedSections.color ? '−' : '+' }}</span>
                </h3>
                <div v-show="expandedSections.color" class="filter-options color-options">
                  <label v-for="color in filterData.colors" :key="color.value" class="color-option">
                    <input
                      type="checkbox"
                      :value="color.value"
                      v-model="filters.color"
                      @change="applyFilters"
                    />
                    <span class="color-dot" :style="{ backgroundColor: color.hex }"></span>
                    <span class="color-name">{{ color.label }}</span>
                    <span class="color-count">({{ color.count }})</span>
                  </label>
                  <button v-if="filterData.colors.length > 6" class="see-more" @click="toggleSeeMore('colors')">
                    {{ showMore.colors ? '− ' + $t('filters.seeLess') : '+ ' + $t('filters.seeMore') }}
                  </button>
                </div>
              </div>

              <!-- Filtre Taille -->
              <div class="filter-section">
                <h3 class="filter-title" @click="toggleFilterSection('size')">
                  <span class="title-text">{{ $t('filters.size') }}</span>
                  <span class="filter-arrow">{{ expandedSections.size ? '−' : '+' }}</span>
                </h3>
                <div v-show="expandedSections.size" class="filter-options">
                  <label v-for="size in filterData.sizes" :key="size.value" class="filter-option">
                    <input
                      type="checkbox"
                      :value="size.value"
                      v-model="filters.size"
                      @change="applyFilters"
                    />
                    <span class="option-text">{{ size.label }}</span>
                    <span class="option-count">({{ size.count }})</span>
                  </label>
                  <button v-if="filterData.sizes.length > 6" class="see-more" @click="toggleSeeMore('sizes')">
                    {{ showMore.sizes ? '− ' + $t('filters.seeLess') : '+ ' + $t('filters.seeMore') }}
                  </button>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="filter-actions">
                <button class="btn-apply" @click="applyFilters">{{ $t('filters.apply') }}</button>
                <button class="btn-reset" @click="resetAllFilters">{{ $t('filters.reset') }}</button>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="products-content">
            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <span class="results-count">{{ filteredProducts.length }}</span>
                <span class="results-label">{{ $t('products.all') }}</span>
                <span v-if="activeFiltersCount > 0" class="results-filters">
                  ({{ activeFiltersCount }} {{ $t('filters.active') }})
                </span>
              </div>

              <div class="sort-wrapper">
                <label for="sort" class="sort-label">{{ $t('products.sortBy') }}:</label>
                <select id="sort" v-model="sortBy" class="sort-select" @change="applySort">
                  <option value="newest">{{ $t('products.newest') }}</option>
                  <option value="price-asc">{{ $t('products.priceAsc') }}</option>
                  <option value="price-desc">{{ $t('products.priceDesc') }}</option>
                  <option value="rating">{{ $t('products.topRated') }}</option>
                </select>
              </div>
            </div>

            <!-- Active Filters -->
            <div v-if="activeFiltersCount > 0" class="active-filters">
              <span class="active-label">{{ $t('filters.active') }}:</span>
              <div class="active-tags">
                <span
                  v-for="(filter, index) in activeFilterTags"
                  :key="index"
                  class="filter-tag"
                  @click="removeFilter(filter)"
                >
                  {{ filter.label }}
                  <span class="remove-icon">×</span>
                </span>
                <button class="clear-all" @click="resetAllFilters">
                  {{ $t('filters.clearAll') }}
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>{{ $t('common.loading') }}</p>
            </div>

            <!-- Products Grid (6 par ligne) -->
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
              <button class="btn-reset" @click="resetAllFilters">
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
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import QuickViewModal from '../components/QuickViewModal.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const productStore = useProductStore()
const cartStore = useCartStore()

// ===== STATE =====
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const sortBy = ref('newest')
const quickViewProduct = ref(null)
const showQuickView = ref(false)
const showMobileFilters = ref(false)

// Sections dépliées
const expandedSections = ref({
  category: true,
  color: true,
  size: true
})

const showMore = ref({
  categories: false,
  colors: false,
  sizes: false
})

// ===== FILTERS =====
const filters = ref({
  category: [],
  color: [],
  size: []
})

// ===== CATEGORIES (SYNCHRONISÉES AVEC HEADER) =====
const categories = ref([
  { id: 1, slug: 'perfumes', name: 'عطور', nameFr: 'Parfums', icon: '🌸', count: 87 },
  { id: 2, slug: 'jewelry', name: 'حلي و اكسسوارات', nameFr: 'Bijoux et accessoires', icon: '💍', count: 312 },
  { id: 3, slug: 'clothing', name: 'ملابس', nameFr: 'Vêtements', icon: '👗', count: 278 },
  { id: 4, slug: 'decor', name: 'ديكور', nameFr: 'Décoration', icon: '🏺', count: 156 },
  { id: 5, slug: 'textiles', name: 'أقمشة وسجادات', nameFr: 'Tissus et tapis', icon: '🧵', count: 234 },
  { id: 6, slug: 'pottery', name: 'أواني', nameFr: 'Poterie', icon: '🍽️', count: 189 },
  { id: 7, slug: 'beauty', name: 'عناية وتجميل', nameFr: 'Soins et beauté', icon: '🧴', count: 123 },
  { id: 8, slug: 'food', name: 'أغذية', nameFr: 'Aliments', icon: '🍯', count: 67 },
  { id: 9, slug: 'other', name: 'أخرى', nameFr: 'Autres', icon: '✨', count: 45 }
])

// ===== FILTER DATA (Couleurs et Tailles) =====
const filterData = ref({
  colors: [
    { value: 'multicolor', label: 'متعدد الألوان', hex: 'linear-gradient(45deg, red, blue, green, yellow)', count: 89 },
    { value: 'black', label: 'أسود', hex: '#000000', count: 234 },
    { value: 'white', label: 'أبيض', hex: '#FFFFFF', count: 167 },
    { value: 'pink', label: 'وردي', hex: '#FFC0CB', count: 145 },
    { value: 'blue', label: 'أزرق', hex: '#0000FF', count: 123 },
    { value: 'gray', label: 'رمادي', hex: '#808080', count: 98 },
    { value: 'green', label: 'أخضر', hex: '#008000', count: 87 },
    { value: 'red', label: 'أحمر', hex: '#FF0000', count: 112 },
    { value: 'purple', label: 'بنفسجي', hex: '#800080', count: 76 },
    { value: 'yellow', label: 'أصفر', hex: '#FFFF00', count: 65 }
  ],
  sizes: [
    { value: 'one-size', label: 'مقاس واحد', count: 234 },
    { value: 's', label: 'S', count: 145 },
    { value: 'm', label: 'M', count: 167 },
    { value: 'l', label: 'L', count: 156 },
    { value: 'xl', label: 'XL', count: 89 },
    { value: '2', label: '2', count: 45 },
    { value: '4', label: '4', count: 43 },
    { value: '6', label: '6', count: 38 },
    { value: '8', label: '8', count: 32 }
  ]
})

// ===== COMPUTED =====
const currentLanguage = computed(() => locale.value)

const allProducts = computed(() => {
  return productStore.getAllProducts || []
})

const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  // Appliquer les filtres
  if (filters.value.category.length > 0) {
    products = products.filter(p => filters.value.category.includes(p.category))
  }

  if (filters.value.color.length > 0) {
    products = products.filter(p => filters.value.color.includes(p.color))
  }

  if (filters.value.size.length > 0) {
    products = products.filter(p => filters.value.size.includes(p.size))
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
    default:
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return products
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).reduce((acc, curr) => acc + curr.length, 0)
})

const activeFilterTags = computed(() => {
  const tags = []

  Object.entries(filters.value).forEach(([key, values]) => {
    values.forEach(value => {
      if (key === 'category') {
        const cat = categories.value.find(c => c.slug === value)
        if (cat) {
          tags.push({
            key,
            value,
            label: currentLanguage.value === 'ar' ? cat.name : cat.nameFr
          })
        }
      } else {
        const filterSection = filterData.value[`${key}s`]
        if (filterSection) {
          const item = filterSection.find(i => i.value === value)
          if (item) {
            tags.push({
              key,
              value,
              label: item.label
            })
          }
        }
      }
    })
  })

  return tags
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

// ===== MÉTHODES =====
const toggleFilterSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const toggleSeeMore = (section) => {
  showMore.value[section] = !showMore.value[section]
}

const applyFilters = () => {
  currentPage.value = 1
  showMobileFilters.value = false

  // Sauvegarder les filtres dans l'URL
  const query = {}
  Object.entries(filters.value).forEach(([key, values]) => {
    if (values.length > 0) {
      query[key] = values.join(',')
    }
  })
  router.replace({ query })
}

const applySort = () => {
  currentPage.value = 1
}

const removeFilter = (filter) => {
  const index = filters.value[filter.key].indexOf(filter.value)
  if (index > -1) {
    filters.value[filter.key].splice(index, 1)
    applyFilters()
  }
}

const resetAllFilters = () => {
  filters.value = {
    category: [],
    color: [],
    size: []
  }
  sortBy.value = 'newest'
  applyFilters()
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
    name: product.productName || product.name,
    price: product.price,
    image: product.images?.[0] || product.image,
    quantity: 1,
    vendorName: product.vendorName
  })
}

const addToCartFromModal = (cartItem) => {
  cartStore.addItem({
    id: cartItem.product.id,
    name: cartItem.product.productName || cartItem.product.name,
    price: cartItem.product.price,
    image: cartItem.product.images?.[0] || cartItem.product.image,
    quantity: cartItem.quantity || 1,
    vendorName: cartItem.product.vendorName
  })
  closeQuickView()
}

// ===== FONCTION POUR METTRE À JOUR LES COMPTEURS =====
const updateCategoryCounts = () => {
  const counts = {}
  allProducts.value.forEach(product => {
    if (product.category) {
      counts[product.category] = (counts[product.category] || 0) + 1
    }
  })

  categories.value = categories.value.map(cat => ({
    ...cat,
    count: counts[cat.slug] || 0
  }))
}

// ===== WATCHERS =====
watch(
  () => route.query,
  (newQuery) => {
    Object.keys(filters.value).forEach(key => {
      if (newQuery[key]) {
        filters.value[key] = newQuery[key].split(',')
      } else {
        filters.value[key] = []
      }
    })
  },
  { immediate: true }
)

// Watcher pour mettre à jour les compteurs quand les produits changent
watch(
  () => allProducts.value,
  () => {
    updateCategoryCounts()
  },
  { deep: true }
)

// ===== LIFECYCLE =====
onMounted(async () => {
  loading.value = true

  // Charger les produits si le store n'en a pas
  if (productStore.products?.length === 0) {
    await productStore.fetchProducts()
  }

  // Mettre à jour les compteurs des catégories
  updateCategoryCounts()

  loading.value = false
})
</script>

<style scoped>
/* === TOUS LES STYLES RESTENT IDENTIQUES === */
.products-page {
  min-height: 100vh;
  background: #f8fafc;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.products-hero {
  background: linear-gradient(135deg, #08717f, #d40025);
  padding: 60px 0 40px;
  color: white;
  text-align: center;
}

.hero-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 15px;
}

.hero-description {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.95;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  gap: 30px;
  margin: 40px 0;
}

/* Sidebar Filtres */
.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.filter-toggle {
  display: none;
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  margin-bottom: 15px;
}

.filters-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-section {
  border-bottom: 1px solid #f1f5f9;
  padding: 15px 0;
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
  cursor: pointer;
}

.filter-arrow {
  color: #08717f;
  font-size: 1.2rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.filter-options::-webkit-scrollbar {
  width: 4px;
}

.filter-options::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.filter-options::-webkit-scrollbar-thumb {
  background: #08717f;
  border-radius: 4px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #08717f;
}

.option-text {
  flex: 1;
}

.option-count {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Color Options */
.color-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.color-name {
  flex: 1;
  font-size: 0.85rem;
}

.color-count {
  color: #94a3b8;
  font-size: 0.75rem;
}

.see-more {
  background: none;
  border: none;
  color: #08717f;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-align: right;
  padding: 5px 0;
}

.see-more:hover {
  color: #d40025;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-apply,
.btn-reset {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-apply {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 113, 127, 0.3);
}

.btn-reset {
  background: #f1f5f9;
  color: #64748b;
}

.btn-reset:hover {
  background: #e2e8f0;
}

/* Products Content */
.products-content {
  flex: 1;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d40025;
}

.results-filters {
  color: #64748b;
  font-size: 0.9rem;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #08717f;
}

/* Active Filters */
.active-filters {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 12px;
}

.active-label {
  font-weight: 600;
  color: #0369a1;
  margin-left: 10px;
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: white;
  border: 1px solid #bae6fd;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #0369a1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  background: #fee2e2;
  border-color: #d40025;
  color: #d40025;
}

.remove-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.clear-all {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
}

.clear-all:hover {
  color: #d40025;
}

/* Products Grid - 6 par ligne */
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
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
  background: white;
  border-radius: 16px;
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
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
  }

  .filter-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filters-content {
    display: none;
  }

  .filters-content.mobile-visible {
    display: block;
  }

  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
}

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
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .pagination {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .color-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
