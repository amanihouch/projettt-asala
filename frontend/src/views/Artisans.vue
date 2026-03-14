<!-- views/Artisans.vue -->
<template>
  <div class="artisans-page">
    <!-- Hero Section -->
    <section class="artisans-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-icon">👨‍🎨</span>
            <span class="title-text">الحرفيون</span>
          </h1>
          <p class="hero-subtitle">اكتشف أمهر الحرفيين التونسيين وتعرف على إبداعاتهم</p>
          
          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث عن حرفي، متجر، أو تخصص..."
                class="search-input"
                @input="handleSearch"
              />
              <button class="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" stroke-width="2"/>
                  <path d="M21 21l-4.35-4.35" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="quick-filters">
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              <span class="chip-icon">👥</span>
              <span class="chip-text">الجميع</span>
              <span class="chip-count">{{ vendors.length }}</span>
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'verified' }"
              @click="setFilter('verified')"
            >
              <span class="chip-icon">✓</span>
              <span class="chip-text">موثوقون</span>
              <span class="chip-count">{{ verifiedCount }}</span>
            </button>
            <button
              class="filter-chip"
              :class="{ active: activeFilter === 'new' }"
              @click="setFilter('new')"
            >
              <span class="chip-icon">🆕</span>
              <span class="chip-text">جدد</span>
              <span class="chip-count">{{ newVendorsCount }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="floating-element float-1">🏺</div>
      <div class="floating-element float-2">🧵</div>
      <div class="floating-element float-3">💍</div>
      <div class="floating-element float-4">🪵</div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>جاري تحميل الحرفيين...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredVendors.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="80" r="40" stroke="#08717f" stroke-width="8"/>
              <path d="M30 160c0-30 40-50 70-50s70 20 70 50" stroke="#08717f" stroke-width="8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="empty-content">
            <h3>لا يوجد حرفيون بعد</h3>
            <p v-if="searchQuery">لا توجد نتائج تطابق بحثك "{{ searchQuery }}"</p>
            <p v-else>كن أول من ينضم كحرفي في منصتنا</p>
            <router-link to="/become-vendor" class="btn-join">
              <span>انضم كحرفي</span>
              <span class="btn-icon">←</span>
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
                :src="vendor.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'"
                :alt="vendor.shopName"
                class="cover-image"
              />
              
              <!-- Verified Badge -->
              <div v-if="vendor.verified" class="verified-badge" title="حرفي موثوق">
                <span class="verified-icon">✓</span>
              </div>

              <!-- New Badge -->
              <div v-if="isNewVendor(vendor)" class="new-badge">
                <span class="badge-text">🆕 جديد</span>
              </div>
            </div>

            <!-- Vendor Info -->
            <div class="card-info">
              <div class="vendor-avatar-wrapper">
                <img
                  :src="vendor.avatar || 'https://i.pravatar.cc/150'"
                  :alt="vendor.shopName"
                  class="vendor-avatar"
                />
              </div>

              <h3 class="vendor-shop">{{ vendor.shopName || vendor.name }}</h3>
              <p class="vendor-name">{{ vendor.name }}</p>
              <p class="vendor-specialty">{{ vendor.specialty || 'حرفي' }}</p>

              <!-- Stats -->
              <div class="vendor-stats">
                <div class="stat">
                  <span class="stat-icon">📦</span>
                  <span class="stat-value">{{ vendor.products || 0 }}</span>
                </div>
                <div class="stat">
                  <span class="stat-icon">❤️</span>
                  <span class="stat-value">{{ vendor.followers || 0 }}</span>
                </div>
                <div class="stat">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-value">{{ vendor.rating || '0.0' }}</span>
                </div>
              </div>

              <!-- Location -->
              <div v-if="vendor.location" class="vendor-location">
                <span class="location-icon">📍</span>
                <span class="location-text">{{ vendor.location }}</span>
              </div>

              <!-- Join Date -->
              <div class="vendor-join-date">
                <span class="date-icon">📅</span>
                <span class="date-text">انضم في {{ formatDate(vendor.createdAt) }}</span>
              </div>

              <!-- View Profile Button -->
              <button class="view-profile-btn">
                <span>عرض الملف الشخصي</span>
                <span class="btn-arrow">←</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Results Info -->
        <div v-if="filteredVendors.length > 0" class="results-info">
          <p>عرض {{ filteredVendors.length }} من {{ vendors.length }} حرفي</p>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-icon">{{ toast.icon }}</div>
        <div class="toast-message">{{ toast.message }}</div>
        <button @click="toast.show = false" class="toast-close">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorStore } from '../stores/vendor'

const router = useRouter()
const vendorStore = useVendorStore()

// State
const loading = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅'
})

// Computed
const vendors = computed(() => vendorStore.vendors || [])

const filteredVendors = computed(() => {
  let result = [...vendors.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v => 
      v.shopName?.toLowerCase().includes(query) ||
      v.name?.toLowerCase().includes(query) ||
      v.specialty?.toLowerCase().includes(query) ||
      v.location?.toLowerCase().includes(query)
    )
  }

  // Category filter
  switch (activeFilter.value) {
    case 'verified':
      result = result.filter(v => v.verified)
      break
    case 'new':
      result = result.filter(v => isNewVendor(v))
      break
  }

  return result
})

const verifiedCount = computed(() => {
  return vendors.value.filter(v => v.verified).length
})

const newVendorsCount = computed(() => {
  return vendors.value.filter(v => isNewVendor(v)).length
})

// Methods
const isNewVendor = (vendor) => {
  if (!vendor.createdAt) return false
  const created = new Date(vendor.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return diffDays <= 30
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`
  return date.toLocaleDateString('ar-TN')
}

const handleSearch = () => {
  // Search is reactive via computed
}

const setFilter = (filter) => {
  activeFilter.value = filter
}

const goToVendor = (vendorId) => {
  router.push(`/vendor/${vendorId}`)
}

const showNotification = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }
  
  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type]
  }
  
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loading.value = true
  
  // Simulate loading
  setTimeout(() => {
    loading.value = false
    
    // Show welcome message if no vendors
    if (vendors.value.length === 0) {
      showNotification('لا يوجد حرفيين بعد', 'info')
    }
  }, 500)
})
</script>

<style scoped>
/* ===== CSS Variables ===== */
.artisans-page {
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-teal-soft: #e0f5f7;
  
  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --primary-red-soft: #ffe8ed;
  
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
  
  --shadow-sm: 0 1px 3px rgba(8, 113, 127, 0.08);
  --shadow-md: 0 4px 6px rgba(8, 113, 127, 0.1);
  --shadow-lg: 0 10px 15px rgba(212, 0, 37, 0.1);
  --shadow-xl: 0 20px 25px rgba(8, 113, 127, 0.15);
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.artisans-page {
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', sans-serif;
  background: var(--neutral-50);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== HERO SECTION ===== */
.artisans-hero {
  position: relative;
  background: var(--gradient-dual);
  padding: 80px 0 60px;
  color: white;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 3rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.95;
  margin-bottom: 30px;
}

/* Floating Elements */
.floating-element {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}

.float-1 { top: 20%; left: 10%; animation-delay: 0s; }
.float-2 { bottom: 20%; right: 10%; animation-delay: 2s; }
.float-3 { top: 30%; right: 20%; animation-delay: 4s; }
.float-4 { bottom: 30%; left: 15%; animation-delay: 6s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* Search */
.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-box {
  display: flex;
  background: white;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.search-input {
  flex: 1;
  padding: 16px 24px;
  border: none;
  font-size: 1rem;
  outline: none;
  font-family: 'Cairo', sans-serif;
}

.search-btn {
  padding: 0 28px;
  background: var(--primary-red);
  border: none;
  color: white;
  cursor: pointer;
  transition: var(--transition);
}

.search-btn:hover {
  background: var(--primary-red-dark);
}

/* Quick Filters */
.quick-filters {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  color: white;
  cursor: pointer;
  transition: var(--transition);
  backdrop-filter: blur(10px);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.filter-chip.active {
  background: white;
  color: var(--primary-teal-dark);
  border-color: white;
}

.chip-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.filter-chip.active .chip-count {
  background: var(--primary-teal-soft);
  color: var(--primary-teal);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  padding: 60px 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid var(--neutral-200);
  border-top: 4px solid var(--primary-teal);
  border-right: 4px solid var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-200);
}

.empty-illustration {
  margin-bottom: 30px;
}

.empty-illustration svg {
  stroke: var(--neutral-300);
}

.empty-content h3 {
  font-size: 1.8rem;
  color: var(--neutral-800);
  margin-bottom: 10px;
}

.empty-content p {
  color: var(--neutral-600);
  margin-bottom: 30px;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: var(--gradient-dual);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  transition: var(--transition);
}

.btn-join:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-join:hover .btn-icon {
  transform: translateX(5px);
}

/* Artisans Grid */
.artisans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* Artisan Card */
.artisan-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--neutral-200);
  position: relative;
}

.artisan-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-teal);
}

.card-cover {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artisan-card:hover .cover-image {
  transform: scale(1.1);
}

/* Badges */
.verified-badge,
.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.verified-badge {
  width: 30px;
  height: 30px;
  background: var(--primary-teal);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.new-badge {
  left: 10px;
  right: auto;
  padding: 4px 12px;
  background: var(--primary-red);
  border: 2px solid white;
  border-radius: 30px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Card Info */
.card-info {
  padding: 20px;
  text-align: center;
  position: relative;
}

.vendor-avatar-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  margin: -55px auto 10px;
}

.vendor-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: var(--shadow-md);
  object-fit: cover;
}

.vendor-shop {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--neutral-900);
  margin-bottom: 4px;
}

.vendor-name {
  color: var(--neutral-600);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.vendor-specialty {
  display: inline-block;
  padding: 4px 16px;
  background: var(--primary-teal-soft);
  color: var(--primary-teal-dark);
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Vendor Stats */
.vendor-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--neutral-700);
  font-size: 0.9rem;
}

.stat-icon {
  font-size: 1rem;
}

.stat-value {
  font-weight: 700;
}

/* Location */
.vendor-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--neutral-600);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.location-icon {
  font-size: 0.9rem;
}

/* Join Date */
.vendor-join-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--neutral-500);
  font-size: 0.8rem;
  margin-bottom: 15px;
}

.date-icon {
  font-size: 0.85rem;
}

/* View Profile Button */
.view-profile-btn {
  width: 100%;
  padding: 12px;
  background: var(--gradient-dual);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-arrow {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.view-profile-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* Results Info */
.results-info {
  text-align: center;
  color: var(--neutral-600);
  font-size: 0.9rem;
  padding: 20px 0;
}

/* Toast Notification */
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
  box-shadow: var(--shadow-xl);
  z-index: 9999;
  border: 1px solid var(--neutral-200);
  min-width: 350px;
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
  line-height: 1;
}

.toast-close:hover {
  color: var(--neutral-900);
}

/* Responsive */
@media (max-width: 768px) {
  .artisans-hero {
    padding: 60px 0 40px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .quick-filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px 0;
  }

  .filter-chip {
    flex-shrink: 0;
  }

  .artisans-grid {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .search-input {
    padding: 14px 18px;
  }

  .vendor-shop {
    font-size: 1.2rem;
  }

  .vendor-stats {
    gap: 15px;
  }
}

/* Accessibility */
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