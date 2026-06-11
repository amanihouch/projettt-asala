<!-- frontend/src/views/Artisans.vue -->
<template>
  <div class="artisans-page" :class="{ 'dark-mode': isDarkMode }">

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">

        <!-- MOBILE: layout vertical empilé -->
        <div class="hero-mobile">
          <div class="hero-text-block">
            <h1 class="hero-title">حرفيونا</h1>
            <p class="hero-subtitle">اكتشف نخبة من أمهر الحرفيين التونسيين وأعمالهم الفريدة</p>
          </div>
          <div class="hero-img-block">
            <img
              src="/src/assets/images/artisan/artisan-hero.jpg"
              alt="حرفي تونسي"
              class="hero-image"
              @error="handleHeroImageError"
            />
          </div>
          <div class="hero-search-block">
            <div class="search-wrapper">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="ابحث عن حرفي بالاسم أو التخصص أو الموقع"
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" stroke-width="2"/>
                  <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- DESKTOP: layout côte à côte -->
        <div class="hero-desktop">
          <div class="hero-content">
            <h1 class="hero-title">حرفيونا</h1>
            <p class="hero-subtitle">اكتشف نخبة من أمهر الحرفيين التونسيين وأعمالهم الفريدة</p>
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
    </section>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="filters-header">
          <span class="filters-label">تصفية حسب</span>
          <span class="results-info" v-if="filteredVendors.length > 0">
            <span class="results-count">{{ filteredVendors.length }}</span>
            <span> حرفي</span>
          </span>
        </div>
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
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>لا يوجد حرفيون</h3>
          <p v-if="searchQuery">لم نجد حرفيين يطابقون "{{ searchQuery }}"</p>
          <p v-else>لم يتم العثور على حرفيين حالياً</p>
          <div class="empty-actions">
            <button v-if="searchQuery || activeFilter !== 'all'" class="btn-reset" @click="resetFilters">
              <span>إعادة تعيين</span>
            </button>
            <router-link to="/become-vendor" class="btn-join">
              <span>انضم كحرفي</span>
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
            <!-- Cover -->
            <div class="card-cover">
              <img
                :src="getCoverImage(vendor)"
                :alt="vendor.shopName"
                class="cover-img"
                @error="handleCoverError"
              />
              <div class="cover-gradient"></div>
              <div v-if="vendor.verified || vendor.approved === 1" class="verified-mark">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

            <!-- Info -->
            <div class="card-info">
              <h3 class="shop-name">{{ vendor.shopName || 'حرفي' }}</h3>
              <p class="owner-name">{{ vendor.name || vendor.fullName || '' }}</p>
              <div class="specialty-tag">{{ getSpecialtyName(vendor.specialty) }}</div>
              <div v-if="vendor.location" class="location">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ vendor.location }}</span>
              </div>
              <button class="view-btn">
                <span>عرض الملف</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12L19 12" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 5L19 12L12 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span>{{ toast.message }}</span>
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
import { getCoverImage, getAvatarImage, DEFAULT_AVATAR, DEFAULT_COVER } from '../utils/image'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')
const vendorsList = ref([])

const filterOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'verified', label: 'موثوق' },
  { value: 'new', label: 'حديث' },
  { value: 'popular', label: 'الأكثر متابعة' }
]

const toast = ref({ show: false, message: '', type: 'success' })

const vendors = computed(() => vendorsList.value)

const filteredVendors = computed(() => {
  let result = [...vendors.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      (v.shopName && v.shopName.toLowerCase().includes(q)) ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.specialty && v.specialty.toLowerCase().includes(q)) ||
      (v.location && v.location.toLowerCase().includes(q))
    )
  }
  switch (activeFilter.value) {
    case 'verified': result = result.filter(v => v.verified || v.approved === 1); break
    case 'new': result = result.filter(v => isNewVendor(v)); break
    case 'popular': result = [...result].sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0)); break
  }
  return result
})

const getFilterCount = (filter) => {
  if (filter === 'verified') return vendors.value.filter(v => v.verified || v.approved === 1).length
  if (filter === 'new') return vendors.value.filter(v => isNewVendor(v)).length
  return vendors.value.length
}

const getSpecialtyName = (specialty) => {
  const map = {
    pottery: 'فخار وسيراميك', textiles: 'منسوجات وسجاد',
    jewelry: 'مجوهرات وحلي', woodwork: 'أعمال خشبية',
    metalwork: 'أعمال معدنية', leather: 'منتجات جلدية', other: 'حرف أخرى'
  }
  return map[specialty] || specialty || 'حرفي'
}

const isNewVendor = (v) => {
  if (!v.createdAt) return false
  try { return Math.floor((new Date() - new Date(v.createdAt)) / 86400000) <= 30 }
  catch { return false }
}

const handleSearch = () => {}
const clearSearch = () => { searchQuery.value = '' }
const setFilter = (f) => { activeFilter.value = f }
const resetFilters = () => { searchQuery.value = ''; activeFilter.value = 'all' }
const goToVendor = (id) => { if (id) router.push(`/vendor/${id}`) }
const handleAvatarError = (e) => { e.target.src = DEFAULT_AVATAR }
const handleCoverError = (e) => { e.target.src = DEFAULT_COVER }
const handleHeroImageError = (e) => { e.target.src = 'https://placehold.co/600x400/08717f/ffffff?text=حرفي+تونسي' }

const showNotification = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchVendors = async () => {
  loading.value = true
  try {
    const response = await api.get('/vendors')
    if (response.data.success) {
      let data = response.data.data?.data || response.data.data || []
      if (!Array.isArray(data)) data = []
      vendorsList.value = data.map(v => ({
        ...v,
        id: v.id || v.vendorId,
        shopName: v.shopName || v.shop_name || v.name || 'حرفي',
        name: v.name || v.fullName || v.user_name || '',
        productsCount: v.productsCount || v.products_count || 0,
        followersCount: v.followersCount || v.followers_count || 0,
        verified: v.verified === 1 || v.verified === true,
        approved: v.approved === 1 || v.approved === true,
        location: v.location || 'تونس',
        createdAt: v.createdAt || v.created_at,
        avatar: v.avatar,
        coverImage: v.coverImage || v.cover_image,
      }))
    }
  } catch (e) {
    console.error(e)
    showNotification('حدث خطأ', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchVendors)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

/* ===================== BASE ===================== */
* { box-sizing: border-box; }

.artisans-page {
  background: #fafbfc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  overflow-x: hidden;
}

.artisans-page.dark-mode { background: #161627; color: #e4e6eb; }

.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===================== HERO ===================== */
.hero-section {
  padding: 36px 0 32px;
  background: linear-gradient(135deg, rgba(8,113,127,0.04) 0%, rgba(212,0,37,0.02) 100%);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.dark-mode .hero-section {
  background: linear-gradient(135deg, rgba(8,113,127,0.1) 0%, rgba(212,0,37,0.06) 100%);
  border-bottom-color: rgba(255,255,255,0.05);
}

/* MOBILE layout: caché sur desktop */
.hero-mobile { display: none; }

/* DESKTOP layout: caché sur mobile */
.hero-desktop {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 48px;
  align-items: center;
}

.hero-content { text-align: right; }

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px;
  font-family: 'Amiri', serif;
  line-height: 1.2;
}

.dark-mode .hero-title { color: #f1f5f9; }

.hero-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  margin: 0 0 28px;
  line-height: 1.8;
}

.dark-mode .hero-subtitle { color: #94a3b8; }

.hero-search {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 480px;
}

/* Image desktop */
.hero-illustration { position: relative; }

.hero-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 24px;
  border: 4px solid white;
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
  display: block;
}

.dark-mode .hero-image {
  border-color: #1e1e30;
  box-shadow: 0 16px 40px rgba(0,0,0,0.25);
}

.illustration-frame {
  position: absolute;
  inset: -10px;
  border: 2px dashed rgba(8,113,127,0.2);
  border-radius: 32px;
  pointer-events: none;
  z-index: -1;
}

/* Search components */
.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  border: 1.5px solid rgba(8,113,127,0.18);
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
  min-width: 0;
}

.dark-mode .search-wrapper {
  background: #1e1e30;
  border-color: rgba(45,212,191,0.2);
}

.search-wrapper:focus-within {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8,113,127,0.1);
}

.dark-mode .search-wrapper:focus-within {
  border-color: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45,212,191,0.1);
}

.search-input {
  flex: 1;
  padding: 13px 18px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1a1a2e;
  font-family: 'Amiri', serif;
  direction: rtl;
  min-width: 0;
  width: 100%;
}

.dark-mode .search-input { color: #f1f5f9; }
.search-input::placeholder { color: #94a3b8; }
.search-input:focus { outline: none; }

.search-btn {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #08717f;
  cursor: pointer;
  transition: color 0.2s;
}

.dark-mode .search-btn { color: #2dd4bf; }
.search-btn:hover { color: #065a69; }

.clear-search {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.05);
  border: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .clear-search { background: rgba(255,255,255,0.06); color: #94a3b8; }
.clear-search:hover { background: rgba(212,0,37,0.1); color: #d40025; }

/* ===================== FILTERS ===================== */
.filters-section {
  background: rgba(255,255,255,0.96);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark-mode .filters-section {
  background: rgba(22,22,39,0.96);
  border-bottom-color: rgba(255,255,255,0.05);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.filters-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #08717f;
}

.dark-mode .filters-label { color: #2dd4bf; }

.results-info { font-size: 0.85rem; color: #64748b; }
.dark-mode .results-info { color: #94a3b8; }

.results-count {
  font-weight: 700;
  color: #08717f;
  font-size: 1rem;
}

.dark-mode .results-count { color: #2dd4bf; }

.filters-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.filters-list::-webkit-scrollbar { display: none; }

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Amiri', serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.dark-mode .filter-chip { background: #1e293b; color: #94a3b8; }
.filter-chip:hover { background: #e2e8f0; color: #1a1a2e; }
.dark-mode .filter-chip:hover { background: #2a2a40; color: #f1f5f9; }

.filter-chip.active {
  background: #08717f;
  color: white;
  box-shadow: 0 4px 12px rgba(8,113,127,0.25);
}

.dark-mode .filter-chip.active { background: #08717f; }

.filter-badge {
  background: rgba(0,0,0,0.07);
  padding: 1px 7px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 700;
}

.filter-chip.active .filter-badge { background: rgba(255,255,255,0.25); }

/* ===================== MAIN ===================== */
.main-content { padding: 28px 0 60px; }

/* Loading */
.loading-container { text-align: center; padding: 80px 20px; }

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(8,113,127,0.1);
  border-top-color: #08717f;
  border-right-color: #d40025;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-container p { color: #64748b; font-size: 0.9rem; }
.dark-mode .loading-container p { color: #94a3b8; }

/* Empty */
.empty-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

.dark-mode .empty-container { background: #1e1e30; border-color: #2a2a40; }

.empty-symbol { margin-bottom: 16px; color: #cbd5e1; }

.empty-container h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px;
  font-family: 'Amiri', serif;
}

.dark-mode .empty-container h3 { color: #f1f5f9; }
.empty-container p { color: #64748b; margin: 0 0 24px; }
.dark-mode .empty-container p { color: #94a3b8; }

.empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-reset, .btn-join {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Amiri', serif;
  border: none;
  text-decoration: none;
}

.btn-reset { background: #f1f5f9; color: #475569; }
.dark-mode .btn-reset { background: #2a2a40; color: #94a3b8; }
.btn-reset:hover { background: #e2e8f0; color: #1a1a2e; }

.btn-join { background: #08717f; color: white; }
.btn-join:hover { background: #065a69; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(8,113,127,0.25); }

/* ===================== GRID ===================== */
.artisans-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

/* ===================== CARD ===================== */
.artisan-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s, border-color 0.35s;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.dark-mode .artisan-card {
  background: #1e1e30;
  border-color: #2a2a40;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.artisan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.08);
  border-color: rgba(8,113,127,0.2);
}

.dark-mode .artisan-card:hover {
  box-shadow: 0 16px 32px rgba(0,0,0,0.35);
  border-color: rgba(45,212,191,0.3);
}

/* Cover */
.card-cover {
  position: relative;
  height: 90px;
  overflow: hidden;
  background: #f1f5f9;
}

.dark-mode .card-cover { background: #2a2a40; }

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artisan-card:hover .cover-img { transform: scale(1.06); }

.cover-gradient {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 36px;
  background: linear-gradient(to top, rgba(0,0,0,0.25), transparent);
}

.verified-mark {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 22px;
  height: 22px;
  background: #08717f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.dark-mode .verified-mark { border-color: #1e1e30; }

/* Avatar */
.avatar-wrapper {
  width: 52px;
  height: 52px;
  margin: -26px auto 8px;
  position: relative;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.dark-mode .avatar-img { border-color: #1e1e30; }

/* Card Info */
.card-info {
  padding: 0 10px 14px;
  text-align: center;
}

.shop-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Amiri', serif;
}

.dark-mode .shop-name { color: #f1f5f9; }

.owner-name {
  font-size: 0.68rem;
  color: #64748b;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-mode .owner-name { color: #94a3b8; }

.specialty-tag {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(8,113,127,0.08);
  border-radius: 20px;
  font-size: 0.58rem;
  font-weight: 700;
  color: #08717f;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.dark-mode .specialty-tag { background: rgba(45,212,191,0.08); color: #2dd4bf; }

.location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 0.6rem;
  color: #64748b;
  margin-bottom: 10px;
}

.location svg { stroke: #08717f; flex-shrink: 0; }
.dark-mode .location { color: #94a3b8; }
.dark-mode .location svg { stroke: #2dd4bf; }

.view-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 0;
  background: rgba(8,113,127,0.07);
  border: none;
  border-radius: 28px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #08717f;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Amiri', serif;
  letter-spacing: 0.2px;
}

.dark-mode .view-btn { background: rgba(45,212,191,0.07); color: #2dd4bf; }

.view-btn:hover { background: #08717f; color: white; }
.dark-mode .view-btn:hover { background: #2dd4bf; color: #161627; }

/* ===================== TOAST ===================== */
.toast-notification {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: white;
  padding: 12px 22px;
  border-radius: 40px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.12);
  z-index: 9999;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1a1a2e;
  border-right: 4px solid #08717f;
  overflow: hidden;
}

.dark-mode .toast-notification { background: #1e1e30; color: #f1f5f9; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.success { border-right-color: #10b981; }

.toast-progress {
  position: absolute;
  bottom: 0; left: 0;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: toastProgress 3s linear forwards;
  width: 0;
}

@keyframes toastProgress { to { width: 100%; } }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(16px); }

/* ===================== RESPONSIVE ===================== */

/* <= 1280px: 5 cols */
@media (max-width: 1280px) {
  .artisans-grid { grid-template-columns: repeat(5, 1fr); }
}

/* <= 1024px: 4 cols */
@media (max-width: 1024px) {
  .artisans-grid { grid-template-columns: repeat(4, 1fr); }
  .hero-desktop { gap: 32px; }
  .hero-title { font-size: 2.5rem; }
}

/* <= 860px: passer en mobile layout */
@media (max-width: 860px) {
  /* Cacher desktop hero, montrer mobile hero */
  .hero-desktop { display: none; }
  .hero-mobile {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Texte en haut */
  .hero-text-block {
    text-align: center;
    padding-bottom: 20px;
  }

  .hero-text-block .hero-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 10px;
    font-family: 'Amiri', serif;
    line-height: 1.3;
  }

  .dark-mode .hero-text-block .hero-title { color: #f1f5f9; }

  .hero-text-block .hero-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0;
    line-height: 1.7;
  }

  .dark-mode .hero-text-block .hero-subtitle { color: #94a3b8; }

  /* Image au milieu */
  .hero-img-block {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 18px;
    overflow: hidden;
    height: 190px;
    flex-shrink: 0;
  }

  .hero-img-block .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    border-radius: 18px;
    border: 3px solid white;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    display: block;
    max-width: 100%;
  }

  .dark-mode .hero-img-block .hero-image {
    border-color: #1e1e30;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  /* Search en bas */
  .hero-search-block {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .hero-search-block .search-wrapper {
    flex: 1;
    min-width: 0;
  }

  .artisans-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }

  .hero-section { padding: 24px 0 28px; }
}

/* <= 640px: 2 cols grid */
@media (max-width: 640px) {
  .hero-section { padding: 20px 0 24px; }

  .hero-text-block .hero-title { font-size: 1.75rem; }

  .hero-img-block { height: 170px; }
  .hero-img-block .hero-image { height: 100%; }

  .artisans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .card-cover { height: 80px; }

  .container { padding: 0 14px; }

  .main-content { padding: 20px 0 50px; }

  .filters-header { flex-direction: column; align-items: flex-start; gap: 6px; }

  .toast-notification {
    bottom: 70px;
    right: 14px;
    left: 14px;
    border-radius: 14px;
    text-align: center;
  }
}

/* <= 420px: encore plus compact */
@media (max-width: 420px) {
  .hero-text-block .hero-title { font-size: 1.55rem; }
  .hero-text-block .hero-subtitle { font-size: 0.88rem; }
  .hero-img-block { height: 155px; border-radius: 14px; }
  .hero-img-block .hero-image { border-radius: 14px; height: 100%; }

  .container { padding: 0 12px; }

  .artisans-grid { gap: 10px; }

  .card-cover { height: 75px; }

  .avatar-wrapper { width: 46px; height: 46px; margin-top: -23px; }

  .shop-name { font-size: 0.8rem; }

  .filter-chip { padding: 6px 12px; font-size: 0.8rem; }

  .empty-actions { flex-direction: column; }
  .btn-reset, .btn-join { width: 100%; justify-content: center; }
}
</style>
