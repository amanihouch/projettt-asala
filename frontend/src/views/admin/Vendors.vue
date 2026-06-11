<!-- src/views/admin/Vendors.vue -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل البائعين...</p>
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">🏪</div>
            <div class="stat-info">
              <div class="stat-value">{{ vendors.length }}</div>
              <div class="stat-label">إجمالي البائعين</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✓</div>
            <div class="stat-info">
              <div class="stat-value">{{ verifiedCount }}</div>
              <div class="stat-label">موثقون</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">قيد المراجعة</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <div class="stat-value">{{ totalProducts }}</div>
              <div class="stat-label">إجمالي المنتجات</div>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="بحث عن بائع بالاسم أو البريد الإلكتروني أو اسم المتجر..."
              class="search-input"
            />
          </div>
          <div class="filter-wrapper">
            <select v-model="statusFilter" class="filter-select">
              <option value="all">جميع الحالات</option>
              <option value="verified">موثقون</option>
              <option value="pending">قيد المراجعة</option>
              <option value="rejected">مرفوضون</option>
            </select>
          </div>
        </div>

        <!-- Vendors Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>المتجر</th>
                <th>البائع</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>التخصص</th>
                <th>المنتجات</th>
                <th>المتابعون</th>
                <th>الحالة</th>
                <th>تاريخ التسجيل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vendor in filteredVendors" :key="vendor.id">
                <td>
                  <div class="vendor-info">
                    <img
                      :src="vendor.avatar || vendor.userAvatar || `https://i.pravatar.cc/150?u=${vendor.id}`"
                      :alt="vendor.shopName"
                      class="vendor-avatar"
                      @error="handleImageError"
                    />
                    <span class="vendor-shop">{{ vendor.shopName || vendor.shop_name }}</span>
                  </div>
                </td>
                <td>{{ vendor.name || vendor.userName || '—' }}</td>
                <td class="vendor-email">{{ vendor.email }}</td>
                <td class="vendor-phone">{{ vendor.phone || '—' }}</td>
                <td>
                  <span class="specialty-badge">{{ getSpecialtyName(vendor.specialty) }}</span>
                </td>
                <td class="vendor-products">{{ vendor.productsCount || 0 }}</td>
                <td class="vendor-followers">{{ vendor.followersCount || 0 }}</td>
                <td>
                  <span class="status-badge" :class="{
                    verified: vendor.approved === 1 || vendor.approved === true,
                    pending: vendor.approved === 0 || vendor.approved === false,
                    rejected: vendor.approved === 2
                  }">
                    {{ getStatusLabel(vendor) }}
                  </span>
                </td>
                <td class="vendor-date">{{ formatDate(vendor.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view" @click="viewVendor(vendor)" title="عرض التفاصيل">
                      👁️
                    </button>
                    <button
                      v-if="vendor.approved !== 1"
                      class="action-btn approve"
                      @click="approveVendor(vendor)"
                      title="قبول"
                    >
                      ✓
                    </button>
                    <button
                      v-if="vendor.approved !== 1"
                      class="action-btn reject"
                      @click="rejectVendor(vendor)"
                      title="رفض"
                    >
                      ✗
                    </button>
                    <button
                      class="action-btn toggle"
                      :class="vendor.approved === 1 ? 'deactivate' : 'activate'"
                      @click="toggleVendorStatus(vendor)"
                      :title="vendor.approved === 1 ? 'تعطيل' : 'تفعيل'"
                    >
                      {{ vendor.approved === 1 ? '🔒' : '🔓' }}
                    </button>
                    <button class="action-btn delete" @click="deleteVendor(vendor)" title="حذف">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredVendors.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">🏪</div>
          <h3>لا يوجد بائعون</h3>
          <p>لم يتم العثور على بائعين مطابقين لمعايير البحث</p>
        </div>
      </template>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click="toast.show = false" class="toast-close">×</button>
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '/src/stores/auth'
import { useThemeStore } from '/src/stores/theme'
import api from '/src/services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE - Synchronized with global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const vendors = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅'
})

// ===== COMPUTED =====
const filteredVendors = computed(() => {
  let filtered = [...vendors.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v =>
      v.shopName?.toLowerCase().includes(query) ||
      v.name?.toLowerCase().includes(query) ||
      v.email?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value === 'verified') {
    filtered = filtered.filter(v => v.approved === 1)
  } else if (statusFilter.value === 'pending') {
    filtered = filtered.filter(v => v.approved === 0 || v.approved === false || v.approved === null)
  } else if (statusFilter.value === 'rejected') {
    filtered = filtered.filter(v => v.approved === 2)
  }

  return filtered
})

const verifiedCount = computed(() => vendors.value.filter(v => v.approved === 1).length)
const pendingCount = computed(() => vendors.value.filter(v => v.approved === 0 || v.approved === false || v.approved === null).length)
const totalProducts = computed(() => vendors.value.reduce((sum, v) => sum + (v.productsCount || 0), 0))

// ===== UTILS =====
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: 'فخار وسيراميك',
    textiles: 'منسوجات وسجاد',
    jewelry: 'مجوهرات',
    woodwork: 'أعمال خشبية',
    metalwork: 'أعمال معدنية',
    leather: 'منتجات جلدية',
    other: 'أخرى'
  }
  return specialties[specialty] || specialty || '—'
}

const getStatusLabel = (vendor) => {
  if (vendor.approved === 1) return 'موثق'
  if (vendor.approved === 2) return 'مرفوض'
  return 'قيد المراجعة'
}

const handleImageError = (e) => {
  e.target.src = `https://i.pravatar.cc/150?u=${Date.now()}`
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ===== API CALLS =====
const loadVendors = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/vendors')
    console.log('📦 Réponse API vendors:', response.data)

    if (response.data.success) {
      // Essayer plusieurs formats possibles
      let vendorsData = response.data.data?.data ||
                        response.data.data?.vendors ||
                        response.data.data ||
                        response.data.vendors ||
                        []

      // Si c'est un objet avec des clés numériques, le convertir en tableau
      if (vendorsData && typeof vendorsData === 'object' && !Array.isArray(vendorsData)) {
        vendorsData = Object.values(vendorsData)
      }

      // Formater les données
      vendors.value = vendorsData.map(vendor => ({
        ...vendor,
        id: vendor.id || vendor.vendorId,
        shopName: vendor.shopName || vendor.shop_name || vendor.name || '—',
        name: vendor.name || vendor.userName || vendor.user_name || '—',
        email: vendor.email || vendor.userEmail || vendor.user_email || '—',
        phone: vendor.phone || vendor.userPhone || vendor.user_phone || null,
        specialty: vendor.specialty || vendor.speciality || 'other',
        productsCount: vendor.productsCount || vendor.products_count || 0,
        followersCount: vendor.followersCount || vendor.followers_count || 0,
        approved: vendor.approved ?? vendor.status ?? 0,
        isActive: vendor.isActive !== undefined ? vendor.isActive : true,
        createdAt: vendor.createdAt || vendor.created_at,
        avatar: vendor.avatar || vendor.userAvatar || vendor.user_avatar || null
      }))

      console.log('✅ Vendeurs chargés:', vendors.value.length)
    } else {
      showNotification(response.data.message || 'Erreur chargement', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur chargement vendeurs:', error)
    showNotification('Erreur de chargement des vendeurs', 'error')
    vendors.value = []
  } finally {
    loading.value = false
  }
}
const toggleVendorStatus = async (vendor) => {
  try {
    const response = await api.patch(`/admin/vendors/${vendor.id}/toggle-status`)
    if (response.data.success) {
      vendor.isActive = response.data.data.isActive
      showNotification(`✅ المتجر ${vendor.isActive ? 'تم تفعيله' : 'تم تعطيله'} بنجاح`, 'success')
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur changement statut:', error)
    showNotification(error.response?.data?.message || 'Erreur lors du changement de statut', 'error')
  }
}

const deleteVendor = async (vendor) => {
  if (!confirm(`هل أنت متأكد من حذف المتجر "${vendor.shopName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
    return
  }

  try {
    const response = await api.delete(`/admin/vendors/${vendor.id}`)
    if (response.data.success) {
      vendors.value = vendors.value.filter(v => v.id !== vendor.id)
      showNotification(`✅ تم حذف المتجر "${vendor.shopName}" بنجاح`, 'success')
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    const message = error.response?.data?.message || 'Erreur lors de la suppression'
    showNotification(message, 'error')
  }
}

const viewVendor = (vendor) => {
  router.push(`/vendor/${vendor.id}`)
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (authStore.userRole !== 'admin') {
    showNotification('غير مصرح لك بالوصول إلى هذه الصفحة', 'error')
    setTimeout(() => {
      router.push('/')
    }, 2000)
    return
  }

  loadVendors()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== BASE STYLES ===== */
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 2rem;
  font-family: 'Amiri', 'Cairo', serif;
  transition: all 0.3s ease;
}

/* ===== PAGE CONTENT ===== */
.page-content {
  background: white;
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-mode .page-content {
  background: #1f2937;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: #374151;
  border-color: #4b5563;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.1);
  border-color: #08717f;
}

.stat-icon {
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: #1e293b;
}

.stat-label {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  color: #64748b;
}

/* Dark mode stats */
.dark-mode .stat-value {
  color: #f3f4f6;
}

.dark-mode .stat-label {
  color: #9ca3af;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.9rem 3rem 0.9rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  color: #1e293b;
}

.dark-mode .search-input {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark-mode .search-input::placeholder {
  color: #6b7280;
}

.search-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.filter-wrapper {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.9rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  color: #1e293b;
}

.dark-mode .filter-select {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.filter-select:focus {
  outline: none;
  border-color: #08717f;
}

/* ===== TABLE ===== */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 1rem;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #374151;
  color: #e5e7eb;
  border-bottom-color: #4b5563;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-mode .data-table td {
  border-bottom-color: #374151;
  color: #e5e7eb;
}

/* Vendor Info */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vendor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.dark-mode .vendor-avatar {
  border-color: #4b5563;
}

.vendor-shop {
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .vendor-shop {
  color: #f3f4f6;
}

.vendor-email,
.vendor-phone,
.vendor-products,
.vendor-followers,
.vendor-date {
  color: #475569;
}

.dark-mode .vendor-email,
.dark-mode .vendor-phone,
.dark-mode .vendor-products,
.dark-mode .vendor-followers,
.dark-mode .vendor-date {
  color: #9ca3af;
}

/* Badges */
.specialty-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.dark-mode .specialty-badge {
  background: #4b5563;
  color: #e5e7eb;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.verified {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f1f5f9;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .action-btn {
  background: #374151;
  color: #9ca3af;
}

.action-btn.view:hover {
  background: #08717f;
  color: white;
  transform: scale(1.05);
}

.action-btn.approve:hover {
  background: #10b981;
  color: white;
  transform: scale(1.05);
}

.action-btn.reject:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.05);
}

.action-btn.toggle.deactivate:hover {
  background: #f59e0b;
  color: white;
  transform: scale(1.05);
}

.action-btn.toggle.activate:hover {
  background: #10b981;
  color: white;
  transform: scale(1.05);
}

.action-btn.delete:hover {
  background: #d40025;
  color: white;
  transform: scale(1.05);
}

.dark-mode .action-btn:hover {
  color: white;
}

/* ===== LOADING STATE ===== */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-right: 4px solid #d40025;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.dark-mode .spinner {
  border-color: #374151;
  border-top-color: #3b82f6;
  border-right-color: #ef4444;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #9ca3af;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
}

.dark-mode .empty-state {
  background: #1f2937;
  border-color: #374151;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dark-mode .empty-state h3 {
  color: #f3f4f6;
}

.empty-state p {
  color: #64748b;
}

.dark-mode .empty-state p {
  color: #9ca3af;
}

/* ===== TOAST NOTIFICATION ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
}

.toast-notification.dark-mode {
  background: #1f2937;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

.dark-mode .toast-message {
  color: #f3f4f6;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.toast-close:hover {
  color: #1e293b;
  transform: scale(1.1);
}

.dark-mode .toast-close:hover {
  color: #f3f4f6;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: progress 3s linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
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

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-content {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .filter-wrapper {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem;
  }

  .vendor-info {
    flex-direction: column;
    text-align: center;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.3rem;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .action-btn {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/VENDORS.VUE ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
}

.dark-mode .stat-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .stat-value {
  color: #f1f5f9 !important;
}

.dark-mode .stat-label {
  color: #94a3b8 !important;
}

.dark-mode .search-input,
.dark-mode .filter-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .data-table th {
  background: #121220 !important;
  color: #e5e7eb !important;
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .data-table td {
  border-bottom-color: #2a2a40 !important;
  color: #cbd5e1 !important;
}

.dark-mode .vendor-shop {
  color: #f1f5f9 !important;
}

.dark-mode .vendor-email,
.dark-mode .vendor-phone,
.dark-mode .vendor-products,
.dark-mode .vendor-followers,
.dark-mode .vendor-date {
  color: #94a3b8 !important;
}

.dark-mode .specialty-badge {
  background: #2a2a40 !important;
  color: #cbd5e1 !important;
}

.dark-mode .status-badge.verified {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
}

.dark-mode .status-badge.rejected {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

.dark-mode .action-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
  border-right-color: #ef4444 !important;
}

.dark-mode .empty-state {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9 !important;
}

.dark-mode .empty-state p {
  color: #94a3b8 !important;
}

.dark-mode .toast-notification {
  background: #1e1e30 !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
