<!-- src/views/admin/SponsoredProducts.vue -->
<template>
  <div class="admin-sponsored" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <div class="admin-header">
      <h2 class="page-title">✨ إدارة المنتجات المميزة</h2>
      <p class="page-subtitle">اختر المنتجات من منشورات البائعين لتظهر في الصفحة الرئيسية</p>
      <button class="theme-toggle" @click="toggleDarkMode">
        <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e0f2f1; color: #08717f">📦</div>
        <div class="stat-content">
          <span class="stat-value">{{ formatNumber(allProducts.length) }}</span>
          <span class="stat-label">إجمالي المنتجات</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fff3cd; color: #d40025">⭐</div>
        <div class="stat-content">
          <span class="stat-value">{{ formatNumber(sponsoredCount) }}</span>
          <span class="stat-label">منتجات مميزة</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #e0f2fe; color: #0284c7">🏪</div>
        <div class="stat-content">
          <span class="stat-value">{{ formatNumber(vendors.length) }}</span>
          <span class="stat-label">بائعين</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <span>📋 جميع المنتجات</span>
        <span class="tab-count">{{ formatNumber(allProducts.length) }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'sponsored' }"
        @click="activeTab = 'sponsored'"
      >
        <span>⭐ المنتجات المميزة</span>
        <span class="tab-count">{{ formatNumber(sponsoredCount) }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="modern-spinner"></div>
      <p>جاري تحميل المنتجات...</p>
    </div>

    <template v-else>
      <!-- Search and Filters -->
      <div class="filters-bar">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="بحث عن منتج أو بائع..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">✕</button>
        </div>

        <div class="filter-wrapper">
          <select v-model="vendorFilter" class="filter-select">
            <option value="">جميع البائعين</option>
            <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
              {{ vendor.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="displayedProducts.length > 0" class="products-grid">
        <div
          v-for="product in displayedProducts"
          :key="product.id"
          class="product-card"
          :class="{ 'sponsored': isSponsored(product.id) }"
        >
          <!-- Image -->
          <div class="card-image">
            <img
              :src="getSafeImage(product)"
              :alt="getSafeName(product)"
              @error="handleImageError"
            />
            <div v-if="isSponsored(product.id)" class="sponsored-ribbon">
              <span>⭐ مميز</span>
            </div>
          </div>

          <!-- Content -->
          <div class="card-content">
            <h3 class="product-title">{{ getSafeName(product) }}</h3>

            <!-- Price -->
            <div class="price-tag">
              <span class="currency">د.ت</span>
              <span class="amount">{{ formatPrice(getSafePrice(product)) }}</span>
            </div>

            <!-- VENDOR SECTION -->
            <div class="vendor-section" @click.stop="goToVendorProfile(product.vendorId)">
              <div class="vendor-avatar">
                <img
                  :src="getSafeVendorAvatar(product)"
                  :alt="getSafeVendorName(product)"
                  @error="handleAvatarError"
                />
              </div>
              <div class="vendor-info">
                <span class="vendor-name">{{ getSafeVendorName(product) }}</span>
                <span v-if="product.vendorVerified" class="verified-badge" title="بائع موثوق">✓</span>
              </div>
              <span class="view-profile">عرض الملف</span>
            </div>

            <!-- Description -->
            <p v-if="getSafeDescription(product)" class="product-description">
              {{ truncateText(getSafeDescription(product), 60) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <button
              v-if="!isSponsored(product.id)"
              class="action-btn sponsor"
              @click="addToSponsored(product)"
            >
              <span class="btn-icon">⭐</span>
              <span>تمييز المنتج</span>
            </button>
            <button
              v-else
              class="action-btn unsponsor"
              @click="removeFromSponsored(product.id)"
            >
              <span class="btn-icon">🗑️</span>
              <span>إلغاء التمييز</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>لا توجد منتجات</h3>
        <p v-if="searchQuery || vendorFilter">لا توجد نتائج تطابق بحثك</p>
        <p v-else>لم يتم العثور على منتجات من البائعين</p>
        <button v-if="searchQuery || vendorFilter" class="reset-btn" @click="resetFilters">
          إعادة تعيين الفلاتر
        </button>
      </div>
    </template>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { usePostStore } from '../../stores/postStore'
import { useProductStore } from '../../stores/productStore'
import { useVendorStore } from '../../stores/vendorStore'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const postStore = usePostStore()
const productStore = useProductStore()
const vendorStore = useVendorStore()

// ===== DARK MODE - Synchronized with global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleDarkMode = () => {
  themeStore.toggleTheme()
}

// ===== STATE =====
const activeTab = ref('all')
const loading = ref(false)
const searchQuery = ref('')
const vendorFilter = ref('')
const allProducts = ref([])
const vendors = ref([])
const vendorsData = ref({}) // Cache des données des vendeurs
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== FONCTIONS DE SÉCURITÉ =====
const getSafeName = (product) => {
  if (!product) return 'منتج'
  return product.productName || product.name || 'منتج حرفي'
}

const getSafePrice = (product) => {
  if (!product) return 0
  const price = product.price || 0
  return typeof price === 'number' ? price : parseFloat(price) || 0
}

const getSafeImage = (product) => {
  if (!product) return 'https://via.placeholder.com/300?text=لا+توجد+صورة'
  return product.images?.[0] || product.image || 'https://via.placeholder.com/300?text=منتج'
}

const getSafeVendorName = (product) => {
  if (!product) return 'بائع'

  if (product.vendorId && vendorsData.value[product.vendorId]) {
    return vendorsData.value[product.vendorId].shopName ||
           vendorsData.value[product.vendorId].name ||
           'بائع'
  }

  return product.vendorName || product.vendor?.name || product.vendor?.shopName || 'بائع'
}

const getSafeVendorAvatar = (product) => {
  if (!product) return 'https://i.pravatar.cc/150'

  if (product.vendorId && vendorsData.value[product.vendorId]) {
    return vendorsData.value[product.vendorId].avatar ||
           vendorsData.value[product.vendorId].userAvatar ||
           `https://i.pravatar.cc/150?u=${product.vendorId}`
  }

  return product.vendorAvatar || product.vendor?.avatar || `https://i.pravatar.cc/150?u=${product.vendorId || Date.now()}`
}

const getSafeDescription = (product) => {
  if (!product) return ''
  return product.description || product.content || ''
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300?text=خطأ+في+الصورة'
}

const handleAvatarError = (e) => {
  e.target.src = 'https://i.pravatar.cc/150?u=' + Date.now()
}

// ===== COMPUTED =====
const sponsoredProducts = computed(() => productStore.sponsoredProducts || [])
const sponsoredCount = computed(() => sponsoredProducts.value.length)

const displayedProducts = computed(() => {
  let products = activeTab.value === 'all' ? allProducts.value : sponsoredProducts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p =>
      getSafeName(p).toLowerCase().includes(query) ||
      getSafeVendorName(p).toLowerCase().includes(query)
    )
  }

  if (vendorFilter.value) {
    products = products.filter(p => p.vendorId === parseInt(vendorFilter.value))
  }

  return products
})

// ===== METHODS =====
const formatNumber = (num) => {
  return new Intl.NumberFormat('ar-TN').format(num || 0)
}

const formatPrice = (price) => {
  if (price === undefined || price === null) return '0'
  return new Intl.NumberFormat('ar-TN').format(price)
}

const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const isSponsored = (productId) => {
  return sponsoredProducts.value.some(p => p.id === productId)
}

const addToSponsored = async (product) => {
  const result = await productStore.addToSponsored(product)
  if (result.success) {
    showNotification(`✅ تمت إضافة "${getSafeName(product)}" إلى المنتجات المميزة`, 'success')
  } else {
    showNotification('❌ حدث خطأ', 'error')
  }
}

const removeFromSponsored = async (productId) => {
  const product = allProducts.value.find(p => p.id === productId)
  const result = await productStore.removeFromSponsored(productId)
  if (result.success) {
    showNotification(`🗑️ تمت إزالة "${getSafeName(product)}" من المنتجات المميزة`, 'info')
  } else {
    showNotification('❌ حدث خطأ', 'error')
  }
}

const goToVendorProfile = (vendorId) => {
  if (vendorId) {
    window.open(`/vendor/${vendorId}`, '_blank')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  vendorFilter.value = ''
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ===== CHARGEMENT DES DONNÉES DES VENDEURS =====
const loadVendorData = async (vendorId) => {
  if (!vendorId || vendorsData.value[vendorId]) return

  try {
    const vendor = await vendorStore.fetchVendorById(vendorId)
    if (vendor) {
      vendorsData.value[vendorId] = vendor
    }
  } catch (error) {
    console.error(`Error loading vendor ${vendorId}:`, error)
  }
}

const extractVendors = async () => {
  const vendorsMap = new Map()
  const vendorIds = new Set()

  allProducts.value.forEach(product => {
    if (product.vendorId) {
      vendorIds.add(product.vendorId)
    }
  })

  for (const vendorId of vendorIds) {
    await loadVendorData(vendorId)
  }

  allProducts.value.forEach(product => {
    if (product.vendorId && !vendorsMap.has(product.vendorId)) {
      const vendorData = vendorsData.value[product.vendorId]
      vendorsMap.set(product.vendorId, {
        id: product.vendorId,
        name: vendorData?.shopName || vendorData?.name || getSafeVendorName(product)
      })
    }
  })

  vendors.value = Array.from(vendorsMap.values())
}

// ===== CHARGEMENT DES PRODUITS =====
const loadProducts = async () => {
  loading.value = true
  try {
    await postStore.fetchFeed()

    allProducts.value = (postStore.posts || [])
      .filter(post => post && post.id)
      .map(post => ({
        id: post.id,
        productName: post.productName || null,
        name: post.name || null,
        description: post.description || null,
        content: post.content || null,
        price: post.price || 0,
        image: post.image || null,
        images: Array.isArray(post.images) ? post.images : [],
        vendorId: post.vendorId || null,
        vendorName: post.vendorName || null,
        vendorAvatar: post.vendorAvatar || null,
        vendorVerified: post.vendorVerified || false,
        vendor: post.vendor || null
      }))
      .filter(product => product.productName || product.name)

    console.log('📦 Produits chargés:', allProducts.value.length)

    await extractVendors()
    await productStore.fetchSponsoredProducts()

    console.log('✅ Vendeurs trouvés:', vendors.value.length)

  } catch (error) {
    console.error('Error loading products:', error)
    showNotification('حدث خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}

// ===== WATCHERS =====
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark-mode')
    document.body.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }
  loadProducts()
})
</script>

<style scoped>
.admin-sponsored {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Cairo', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* Dark mode styles */
.admin-sponsored.dark-mode {
  background: #0f172a;
}

.admin-header {
  margin-bottom: 30px;
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  z-index: 10;
}

.dark-mode .theme-toggle {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.theme-toggle:hover {
  transform: rotate(15deg);
  border-color: #08717f;
}

.page-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 5px;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.dark-mode .page-subtitle {
  color: #94a3b8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
}

.dark-mode .stat-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 4px;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  background: white;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.dark-mode .tabs-container {
  background: #1e293b;
  border-color: #334155;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .tab-btn {
  color: #94a3b8;
}

.tab-btn.active {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  box-shadow: 0 4px 12px rgba(8, 113, 127, 0.2);
}

.dark-mode .tab-btn.active {
  background: linear-gradient(135deg, #0a94a6, #08717f);
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.modern-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #08717f;
  border-right: 3px solid #d40025;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dark-mode .modern-spinner {
  border-color: #334155;
  border-top-color: #0a94a6;
  border-right-color: #ff1744;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #64748b;
}

.dark-mode .loading-container p {
  color: #94a3b8;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 2;
  min-width: 300px;
  position: relative;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.dark-mode .search-wrapper {
  background: #1e293b;
  border-color: #334155;
}

.search-wrapper:focus-within {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.dark-mode .search-wrapper:focus-within {
  border-color: #0a94a6;
  box-shadow: 0 0 0 3px rgba(10, 148, 166, 0.2);
}

.search-icon {
  padding: 0 16px;
  color: #94a3b8;
  font-size: 1.1rem;
}

.search-input {
  flex: 1;
  padding: 14px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1e293b;
}

.dark-mode .search-input {
  color: #f1f5f9;
}

.dark-mode .search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
}

.clear-search {
  padding: 0 16px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.clear-search:hover {
  color: #d40025;
}

.dark-mode .clear-search:hover {
  color: #ff1744;
}

.filter-wrapper {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  color: #1e293b;
  transition: all 0.3s ease;
}

.dark-mode .filter-select {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.filter-select:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.dark-mode .filter-select:focus {
  border-color: #0a94a6;
  box-shadow: 0 0 0 3px rgba(10, 148, 166, 0.2);
}

.dark-mode .filter-select option {
  background: #1e293b;
  color: #f1f5f9;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.dark-mode .product-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.dark-mode .product-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.product-card.sponsored {
  border: 2px solid #fbbf24;
  box-shadow: 0 8px 30px rgba(251, 191, 36, 0.15);
}

.dark-mode .product-card.sponsored {
  border-color: #fbbf24;
  box-shadow: 0 8px 30px rgba(251, 191, 36, 0.2);
}

/* Card Image */
.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

.sponsored-ribbon {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

/* Card Content */
.card-content {
  padding: 20px;
  flex: 1;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  line-height: 1.4;
}

.dark-mode .product-title {
  color: #f1f5f9;
}

.price-tag {
  display: inline-flex;
  align-items: baseline;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 30px;
  margin-bottom: 16px;
  gap: 4px;
}

.dark-mode .price-tag {
  background: #0f172a;
}

.currency {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

.dark-mode .currency {
  color: #94a3b8;
}

.amount {
  font-size: 1.3rem;
  font-weight: 800;
  color: #d40025;
}

.dark-mode .amount {
  color: #ff1744;
}

/* Vendor Section */
.vendor-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  border-radius: 8px;
}

.dark-mode .vendor-section {
  background: #0f172a;
  border-top-color: #334155;
  border-bottom-color: #334155;
}

.vendor-section:hover {
  background: #f0f0f0;
  transform: translateX(-4px);
}

.dark-mode .vendor-section:hover {
  background: #334155;
}

.vendor-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 8px;
}

.dark-mode .vendor-avatar {
  border-color: #1e293b;
}

.vendor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vendor-name {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 700;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.verified-badge {
  width: 22px;
  height: 22px;
  background: #08717f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.dark-mode .verified-badge {
  background: #0a94a6;
}

.view-profile {
  color: #08717f;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  margin-left: 8px;
  white-space: nowrap;
}

.dark-mode .view-profile {
  color: #0a94a6;
}

.vendor-section:hover .view-profile {
  opacity: 1;
}

/* Product Description */
.product-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.dark-mode .product-description {
  color: #94a3b8;
}

/* Card Actions */
.card-actions {
  padding: 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.dark-mode .card-actions {
  background: #0f172a;
  border-top-color: #334155;
}

.action-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.action-btn.sponsor {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  box-shadow: 0 4px 15px rgba(8, 113, 127, 0.2);
}

.dark-mode .action-btn.sponsor {
  background: linear-gradient(135deg, #0a94a6, #08717f);
}

.action-btn.sponsor:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(8, 113, 127, 0.3);
}

.action-btn.unsponsor {
  background: #f1f5f9;
  color: #64748b;
}

.dark-mode .action-btn.unsponsor {
  background: #334155;
  color: #94a3b8;
}

.action-btn.unsponsor:hover {
  background: #fee2e2;
  color: #d40025;
  transform: translateY(-2px);
}

.dark-mode .action-btn.unsponsor:hover {
  background: rgba(255, 23, 68, 0.2);
  color: #ff1744;
}

.btn-icon {
  font-size: 1.2rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
}

.dark-mode .empty-state {
  background: #1e293b;
  border-color: #334155;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.3;
  margin-bottom: 20px;
  display: block;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.dark-mode .empty-state p {
  color: #94a3b8;
}

.reset-btn {
  padding: 12px 30px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .reset-btn {
  background: #0a94a6;
}

.reset-btn:hover {
  background: #065a69;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.dark-mode .reset-btn:hover {
  background: #08717f;
  box-shadow: 0 5px 15px rgba(10, 148, 166, 0.4);
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 320px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.dark-mode {
  background: #1e293b;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
}

.toast-notification.info {
  border-right-color: #08717f;
}

.dark-mode .toast-message {
  color: #f1f5f9;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-icon {
  font-size: 1.5rem;
}

.toast-message {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-sponsored {
    padding: 20px;
  }

  .page-header {
    margin-top: 50px;
  }

  .theme-toggle {
    top: -40px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-wrapper,
  .filter-wrapper {
    width: 100%;
  }

  .tabs-container {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>

<style>
/* Global dark mode styles */
html.dark-mode {
  background-color: #0f172a;
}

html.dark-mode body {
  background-color: #0f172a;
  color: #f1f5f9;
}

/* Smooth transitions for dark mode */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
