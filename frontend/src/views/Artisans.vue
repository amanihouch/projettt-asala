<!-- frontend/src/views/Artisans.vue - DESIGN AVANCÉ AVEC RECHERCHE ET ILLUSTRATION -->
<template>
  <div class="artisans-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Hero Section avec Illustration -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <h1 class="hero-title">حرفيونا</h1>
            <p class="hero-subtitle">اكتشف نخبة من أمهر الحرفيين التونسيين وأعمالهم الفريدة</p>

            <!-- Barre de Recherche dans le Hero -->
            <div class="hero-search">
              <div class="search-wrapper">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="ابحث عن حرفي بالاسم أو التخصص أو الموقع"
                  class="search-input"
                  @keyup.enter="handleSearch"
                />
                <button class="search-btn" @click="handleSearch">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" stroke-width="2"/>
                    <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <button v-if="searchQuery" class="clear-search" @click="clearSearch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="hero-illustration">
            <img
              src="/src/assets/images/artisan/artisan-hero.jpg"
              alt="حرفي تونسي"
              class="hero-image"
              @error="handleHeroImageError"
            />
            <div class="illustration-frame"></div>
          </div>
        </div>
      </div>
      <div class="hero-pattern"></div>
    </section>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="filters-header">
          <span class="filters-label">تصفية حسب</span>
          <span class="results-info" v-if="filteredVendors.length > 0">
            <span class="results-count">{{ filteredVendors.length }}</span>
            <span>حرفي</span>
          </span>
        </div>
        <div class="filters-wrapper">
          <div class="filters-list">
            <button
              v-for="filter in filterOptions"
              :key="filter.value"
              class="filter-chip"
              :class="{ active: activeFilter === filter.value }"
              @click="setFilter(filter.value)"
            >
              <span class="chip-label">{{ filter.label }}</span>
              <span class="filter-badge">{{ getFilterCount(filter.value) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>جاري تحميل الحرفيين</p>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredVendors.length === 0" class="empty-container">
          <div class="empty-symbol">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>لا يوجد حرفيون</h3>
          <p v-if="searchQuery">لم نجد حرفيين يطابقون "{{ searchQuery }}"</p>
          <p v-else>لم يتم العثور على حرفيين حالياً</p>
          <div class="empty-actions">
            <button v-if="searchQuery || activeFilter !== 'all'" class="btn-reset" @click="resetFilters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12L21 12M3 12L7 8M3 12L7 16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>إعادة تعيين</span>
            </button>
            <router-link to="/become-vendor" class="btn-join">
              <span>انضم كحرفي</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12L19 12" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 5L19 12L12 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Artisans Grid -->
        <div v-else class="artisans-grid">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            class="artisan-card"
            @click="goToVendor(vendor.id)"
          >
            <!-- Cover Image -->
            <div class="card-cover">
              <img
                :src="getCoverImage(vendor)"
                :alt="vendor.shopName"
                class="cover-img"
                @error="handleCoverError"
              />
              <div class="cover-gradient"></div>
              <div v-if="vendor.verified || vendor.approved === 1" class="verified-mark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <!-- Avatar -->
            <div class="avatar-wrapper">
              <img
                :src="getAvatarImage(vendor, authStore.user)"
                :alt="vendor.shopName"
                class="avatar-img"
                @error="handleAvatarError"
              />
            </div>

            <!-- Card Info -->
            <div class="card-info">
              <h3 class="shop-name">{{ vendor.shopName || 'حرفي' }}</h3>
              <p class="owner-name">{{ vendor.name || vendor.fullName || '' }}</p>

              <div class="specialty-tag">
                <span>{{ getSpecialtyName(vendor.specialty) }}</span>
              </div>

              <!-- Stats -->
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-value">{{ vendor.productsCount || 0 }}</span>
                  <span class="stat-label">منتج</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ vendor.followersCount || 0 }}</span>
                  <span class="stat-label">متابع</span>
                </div>
              </div>

              <!-- Location -->
              <div v-if="vendor.location" class="location">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ vendor.location }}</span>
              </div>

              <!-- View Profile Button -->
              <button class="view-btn">
                <span>عرض الملف</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12L19 12" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 5L19 12L12 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'
import {
  getCoverImage,
  getAvatarImage,
  DEFAULT_AVATAR,
  DEFAULT_COVER
} from '../utils/image'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')
const vendorsList = ref([])

// Filter options
const filterOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'verified', label: 'موثوق' },
  { value: 'new', label: 'حديث' },
  { value: 'popular', label: 'الأكثر متابعة' }
]

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

// Computed
const vendors = computed(() => vendorsList.value)

const filteredVendors = computed(() => {
  let result = [...vendors.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      (v.shopName && v.shopName.toLowerCase().includes(query)) ||
      (v.name && v.name.toLowerCase().includes(query)) ||
      (v.specialty && v.specialty.toLowerCase().includes(query)) ||
      (v.location && v.location.toLowerCase().includes(query))
    )
  }

  switch (activeFilter.value) {
    case 'verified':
      result = result.filter(v => v.verified === true || v.verified === 1 || v.approved === 1)
      break
    case 'new':
      result = result.filter(v => isNewVendor(v))
      break
    case 'popular':
      result = [...result].sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
      break
  }

  return result
})

// Methods
const getFilterCount = (filter) => {
  switch (filter) {
    case 'verified': return vendors.value.filter(v => v.verified === true || v.verified === 1 || v.approved === 1).length
    case 'new': return vendors.value.filter(v => isNewVendor(v)).length
    default: return vendors.value.length
  }
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: 'فخار وسيراميك',
    textiles: 'منسوجات وسجاد',
    jewelry: 'مجوهرات وحلي',
    woodwork: 'أعمال خشبية',
    metalwork: 'أعمال معدنية',
    leather: 'منتجات جلدية',
    other: 'حرف أخرى'
  }
  return specialties[specialty] || specialty || 'حرفي'
}

const isNewVendor = (vendor) => {
  if (!vendor.createdAt) return false
  try {
    const created = new Date(vendor.createdAt)
    const now = new Date()
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  } catch (e) {
    return false
  }
}

const handleSearch = () => {
  // La recherche est déjà réactive via computed
}

const clearSearch = () => {
  searchQuery.value = ''
}

const setFilter = (filter) => {
  activeFilter.value = filter
}

const resetFilters = () => {
  searchQuery.value = ''
  activeFilter.value = 'all'
}

const goToVendor = (vendorId) => {
  if (vendorId) router.push(`/vendor/${vendorId}`)
}

const handleAvatarError = (event) => {
  event.target.src = DEFAULT_AVATAR
}

const handleCoverError = (event) => {
  event.target.src = DEFAULT_COVER
}

const handleHeroImageError = (event) => {
  event.target.src = 'https://placehold.co/600x400/08717f/ffffff?text=حرفي+تونسي'
}

const showNotification = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Fetch vendors
const fetchVendors = async () => {
  loading.value = true
  try {
    const response = await api.get('/vendors')
    if (response.data.success) {
      let vendorsData = response.data.data?.data || response.data.data || []
      if (!Array.isArray(vendorsData)) vendorsData = []

      vendorsData = vendorsData.map(vendor => ({
        ...vendor,
        id: vendor.id || vendor.vendorId,
        shopName: vendor.shopName || vendor.shop_name || vendor.name || 'حرفي',
        name: vendor.name || vendor.fullName || vendor.user_name || '',
        rating: parseFloat(vendor.rating) || 0,
        productsCount: vendor.productsCount || vendor.products_count || 0,
        followersCount: vendor.followersCount || vendor.followers_count || 0,
        verified: vendor.verified === 1 || vendor.verified === true,
        approved: vendor.approved === 1 || vendor.approved === true,
        location: vendor.location || 'تونس',
        createdAt: vendor.createdAt || vendor.created_at,
        avatar: vendor.avatar,
        coverImage: vendor.coverImage || vendor.cover_image,
      }))

      vendorsList.value = vendorsData
    }
  } catch (error) {
    console.error('Error fetching vendors:', error)
    showNotification('حدث خطأ', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVendors()
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== ARTISANS PAGE - DESIGN AVANCÉ ===== */
.artisans-page {
  background: #fafbfc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  transition: all 0.3s ease;
}

.artisans-page.dark-mode {
  background: #0a0e14;
  color: #e4e6eb;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== HERO SECTION AVEC ILLUSTRATION ===== */
.hero-section {
  position: relative;
  padding: 48px 0 40px;
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.03) 0%, rgba(212, 0, 37, 0.02) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.dark-mode .hero-section {
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.08) 0%, rgba(212, 0, 37, 0.05) 100%);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 30%, rgba(8, 113, 127, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  text-align: right;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 12px;
  font-family: 'Amiri', serif;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.dark-mode .hero-title {
  color: #f0f0f0;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 300;
  margin-bottom: 32px;
}

.dark-mode .hero-subtitle {
  color: #94a3b8;
}

/* Barre de Recherche dans Hero */
.hero-search {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 500px;
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 60px;
  border: 1.5px solid rgba(8, 113, 127, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.dark-mode .search-wrapper {
  background: #1f2937;
  border-color: rgba(45, 212, 191, 0.15);
}

.search-wrapper:focus-within {
  border-color: #08717f;
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.08);
}

.dark-mode .search-wrapper:focus-within {
  border-color: #2dd4bf;
  box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.08);
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #1a1a2e;
  font-family: 'Amiri', serif;
}

.dark-mode .search-input {
  color: #f0f0f0;
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 300;
}

.search-input:focus {
  outline: none;
}

.search-btn {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #08717f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  color: #065a69;
}

.clear-search {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .clear-search {
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
}

.clear-search:hover {
  background: rgba(212, 0, 37, 0.1);
  color: #d40025;
}

/* Illustration */
.hero-illustration {
  position: relative;
}

.hero-image {
  width: 100%;
  height: auto;
  border-radius: 32px;
  object-fit: cover;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border: 4px solid white;
}

.dark-mode .hero-image {
  border-color: #1a1a2e;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.illustration-frame {
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  border: 2px dashed rgba(8, 113, 127, 0.2);
  border-radius: 40px;
  pointer-events: none;
  z-index: -1;
}

/* ===== FILTERS SECTION ===== */
.filters-section {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
}

.dark-mode .filters-section {
  background: rgba(10, 14, 20, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filters-label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #08717f;
}

.results-info {
  font-size: 0.85rem;
  color: #64748b;
}

.dark-mode .results-info {
  color: #94a3b8;
}

.results-count {
  font-weight: 700;
  color: #08717f;
  margin-left: 4px;
  font-size: 1.1rem;
}

.filters-wrapper {
  display: flex;
  justify-content: center;
}

.filters-list {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.dark-mode .filter-chip {
  background: #1e293b;
  color: #94a3b8;
}

.filter-chip:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.dark-mode .filter-chip:hover {
  background: #334155;
  color: #f0f0f0;
}

.filter-chip.active {
  background: #08717f;
  color: white;
  box-shadow: 0 4px 12px rgba(8, 113, 127, 0.2);
}

.chip-label {
  font-weight: 500;
}

.filter-badge {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.filter-chip.active .filter-badge {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  padding: 32px 0 64px;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 2px solid rgba(8, 113, 127, 0.1);
  border-top-color: #08717f;
  border-right-color: #d40025;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #64748b;
  font-size: 0.95rem;
}

.dark-mode .loading-container p {
  color: #94a3b8;
}

/* Empty */
.empty-container {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark-mode .empty-container {
  background: #111827;
  border-color: rgba(255, 255, 255, 0.04);
}

.empty-symbol {
  margin-bottom: 20px;
  color: #cbd5e1;
}

.empty-container h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.dark-mode .empty-container h3 {
  color: #f0f0f0;
}

.empty-container p {
  color: #64748b;
  margin-bottom: 24px;
}

.dark-mode .empty-container p {
  color: #94a3b8;
}

.empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #f1f5f9;
  border: none;
  border-radius: 40px;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.dark-mode .btn-reset {
  background: #1e293b;
  color: #94a3b8;
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #08717f;
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.btn-join:hover {
  background: #065a69;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.2);
}

/* ===== ARTISANS GRID ===== */
.artisans-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

/* Card */
.artisan-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.dark-mode .artisan-card {
  background: #111827;
  border-color: rgba(255, 255, 255, 0.04);
}

.artisan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: rgba(8, 113, 127, 0.2);
}

/* Cover */
.card-cover {
  position: relative;
  height: 100px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artisan-card:hover .cover-img {
  transform: scale(1.05);
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
}

/* Verified Badge */
.verified-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #08717f;
  border-radius: 50%;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

.dark-mode .verified-mark {
  border-color: #111827;
}

/* Avatar */
.avatar-wrapper {
  width: 56px;
  height: 56px;
  margin: -28px auto 8px;
  position: relative;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dark-mode .avatar-img {
  border-color: #111827;
}

/* Card Info */
.card-info {
  padding: 0 12px 16px;
  text-align: center;
}

.shop-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Amiri', serif;
}

.dark-mode .shop-name {
  color: #f0f0f0;
}

.owner-name {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-mode .owner-name {
  color: #94a3b8;
}

/* Specialty Tag */
.specialty-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(8, 113, 127, 0.08);
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 600;
  color: #08717f;
  margin-bottom: 10px;
}

.dark-mode .specialty-tag {
  background: rgba(45, 212, 191, 0.08);
  color: #2dd4bf;
}

/* Stats */
.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
}

.dark-mode .stats-row {
  border-color: rgba(255, 255, 255, 0.04);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a1a2e;
}

.dark-mode .stat-value {
  color: #f0f0f0;
}

.stat-label {
  font-size: 0.5rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

.stat-divider {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.06);
}

.dark-mode .stat-divider {
  background: rgba(255, 255, 255, 0.06);
}

/* Location */
.location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.6rem;
  color: #64748b;
  margin-bottom: 10px;
}

.location svg {
  stroke: #08717f;
}

.dark-mode .location svg {
  stroke: #2dd4bf;
}

/* View Button */
.view-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(8, 113, 127, 0.06);
  border: none;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #08717f;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.dark-mode .view-btn {
  background: rgba(45, 212, 191, 0.06);
  color: #2dd4bf;
}

.view-btn:hover {
  background: #08717f;
  color: white;
  gap: 10px;
}

.dark-mode .view-btn:hover {
  background: #2dd4bf;
  color: #0a0e14;
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: white;
  padding: 12px 24px;
  border-radius: 40px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  font-size: 0.85rem;
  border-right: 4px solid #08717f;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.dark-mode .toast-notification {
  background: #1f2937;
}

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
}

.toast-message {
  color: #1a1a2e;
  font-weight: 500;
}

.dark-mode .toast-message {
  color: #f0f0f0;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: toastProgress 3s linear forwards;
}

@keyframes toastProgress {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== TRANSITIONS ===== */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .artisans-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1000px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-illustration {
    max-width: 400px;
    margin: 0 auto;
  }

  .hero-content {
    text-align: center;
  }

  .hero-search {
    margin: 0 auto;
  }

  .artisans-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .artisans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filters-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 4px;
  }

  .filter-chip {
    flex-shrink: 0;
  }

  .container {
    padding: 0 16px;
  }

  .hero-section {
    padding: 32px 0 32px;
  }

  .hero-search {
    max-width: 100%;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .artisans-grid {
    grid-template-columns: 1fr;
  }

  .card-cover {
    height: 120px;
  }

  .avatar-wrapper {
    width: 64px;
    height: 64px;
    margin-top: -32px;
  }

  .shop-name {
    font-size: 1rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .empty-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-reset,
  .btn-join {
    width: 100%;
    justify-content: center;
  }
}
</style>
