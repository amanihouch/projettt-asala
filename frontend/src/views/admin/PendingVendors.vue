<!-- frontend/src/views/admin/PendingVendors.vue - Version CORRIGÉE -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <div class="stats-cards">
        <div class="stat-card pending">
          <span class="stat-icon">⏳</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">في انتظار المراجعة</span>
          </div>
        </div>
        <div class="stat-card approved">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.approved }}</span>
            <span class="stat-label">بائعين معتمدين</span>
          </div>
        </div>
        <div class="stat-card total">
          <span class="stat-icon">🏪</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">إجمالي البائعين</span>
          </div>
        </div>
      </div>

      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="🔍 بحث عن بائع..."
          class="search-input"
        />
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل البائعين...</p>
      </div>

      <div v-else-if="filteredVendors.length > 0" class="vendors-grid">
        <div v-for="vendor in filteredVendors" :key="vendor.id" class="vendor-card">
          <div class="vendor-header">
            <img
              :src="getVendorAvatar(vendor)"
              :alt="vendor.shopName"
              class="vendor-avatar"
              @error="handleAvatarError"
            />
            <div class="vendor-info">
              <h3 class="vendor-name">{{ vendor.shopName }}</h3>
              <p class="vendor-owner">بواسطة: {{ vendor.name }}</p>
              <p class="vendor-email">{{ vendor.email }}</p>
              <p class="vendor-phone" v-if="vendor.phone">{{ vendor.phone }}</p>
            </div>
            <span class="pending-badge">⏳ في انتظار المراجعة</span>
          </div>

          <div class="vendor-details">
            <div class="detail-row">
              <span class="detail-label">التخصص:</span>
              <span class="detail-value">{{ getSpecialtyName(vendor.specialty) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">الموقع:</span>
              <span class="detail-value">{{ vendor.location || 'تونس' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">سنوات الخبرة:</span>
              <span class="detail-value">{{ vendor.experience || 0 }} سنوات</span>
            </div>
            <div class="detail-row" v-if="vendor.description">
              <span class="detail-label">الوصف:</span>
              <p class="detail-value description">{{ vendor.description }}</p>
            </div>
            <div class="detail-row">
              <span class="detail-label">تاريخ التسجيل:</span>
              <span class="detail-value">{{ formatDate(vendor.createdAt) }}</span>
            </div>
          </div>

          <div class="vendor-actions">
            <button class="action-btn approve" @click="approveVendor(vendor)">
              <span class="btn-icon">✅</span>
              قبول
            </button>
            <button class="action-btn reject" @click="openRejectModal(vendor)">
              <span class="btn-icon">❌</span>
              رفض
            </button>
            <button class="action-btn view" @click="viewVendorDetails(vendor.id)">
              <span class="btn-icon">👁️</span>
              عرض التفاصيل
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>لا توجد بائعين في انتظار المراجعة</h3>
        <p>جميع طلبات البائعين تمت مراجعتها</p>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>رفض طلب البائع</h3>
            <button class="close-btn" @click="closeRejectModal">✕</button>
          </div>
          <div class="modal-body">
            <p>الرجاء إدخال سبب رفض هذا البائع:</p>
            <textarea
              v-model="rejectReason"
              class="reject-textarea"
              rows="4"
              placeholder="سبب الرفض..."
            ></textarea>
            <p class="hint">سيتم إرسال هذا السبب إلى البائع عبر البريد الإلكتروني</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
            <button class="btn-reject" @click="confirmReject" :disabled="submitting">
              {{ submitting ? 'جاري الرفض...' : 'تأكيد الرفض' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

// frontend/src/views/admin/PendingVendors.vue - Script COMPLET et CORRIGÉ
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const router = useRouter()
const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const vendors = ref([])
const approvedVendorsCount = ref(0)
const stats = ref({
  pending: 0,
  approved: 0,
  total: 0
})
const showRejectModal = ref(false)
const currentVendor = ref(null)
const rejectReason = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅'
})

// ===== COMPUTED =====
const filteredVendors = computed(() => {
  if (!searchQuery.value) return vendors.value
  const query = searchQuery.value.toLowerCase()
  return vendors.value.filter(v =>
    v.shopName?.toLowerCase().includes(query) ||
    v.name?.toLowerCase().includes(query) ||
    v.email?.toLowerCase().includes(query)
  )
})

// ===== UTILS =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: '🏺 فخار وسيراميك',
    textiles: '🧵 منسوجات وسجاد',
    jewelry: '💍 مجوهرات',
    woodwork: '🪵 أعمال خشبية',
    metalwork: '⚒️ أعمال معدنية',
    leather: '👜 منتجات جلدية',
    perfumes: '🌸 عطور',
    beauty: '🧴 عناية وتجميل',
    food: '🍯 منتجات غذائية',
    other: '🎨 أخرى',
  }
  return specialties[specialty] || specialty || 'عام'
}

// Formatage des URLs Cloudinary
const formatCloudinaryUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`
  }
  return url
}

const getVendorAvatar = (vendor) => {
  // Priorité: userAvatar (de l'utilisateur) > avatar (du vendeur) > avatar par défaut
  if (vendor.userAvatar && vendor.userAvatar !== 'null' && vendor.userAvatar !== 'undefined') {
    return formatCloudinaryUrl(vendor.userAvatar)
  }
  if (vendor.avatar && vendor.avatar !== 'null' && vendor.avatar !== 'undefined') {
    return formatCloudinaryUrl(vendor.avatar)
  }
  // Avatar par défaut avec UI Avatars
  return `https://ui-avatars.com/api/?background=08717f&color=fff&name=${encodeURIComponent(vendor.shopName || 'Vendor')}&size=100&length=2&bold=true`
}

const getCoverImage = (vendor) => {
  if (vendor.coverImage && vendor.coverImage !== 'null' && vendor.coverImage !== 'undefined') {
    return formatCloudinaryUrl(vendor.coverImage)
  }
  return null
}

const handleAvatarError = (event) => {
  event.target.src = `https://ui-avatars.com/api/?background=08717f&color=fff&name=VN&size=100&length=2&bold=true`
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const updateStats = () => {
  stats.value = {
    pending: vendors.value.length,
    approved: approvedVendorsCount.value,
    total: vendors.value.length + approvedVendorsCount.value
  }
}

// ===== ACTIONS API =====
const loadPendingVendors = async () => {
  loading.value = true

  try {
    // Appel API pour récupérer les vendeurs en attente
    const response = await api.get('/admin/vendors?status=pending')

    if (response.data.success) {
      let vendorsData = response.data.data || []
      if (!Array.isArray(vendorsData)) {
        vendorsData = []
      }

      // Formater les URLs Cloudinary pour chaque vendeur
      vendors.value = vendorsData.map(v => ({
        ...v,
        userAvatar: formatCloudinaryUrl(v.userAvatar),
        avatar: formatCloudinaryUrl(v.avatar),
        coverImage: formatCloudinaryUrl(v.coverImage)
      }))

      console.log('✅ Vendeurs en attente chargés depuis API:', vendors.value.length)
    } else {
      throw new Error('Erreur chargement API')
    }
  } catch (error) {
    console.error('❌ Erreur chargement vendeurs:', error)
    // Fallback localStorage
    const savedPending = localStorage.getItem('pending_vendors')
    if (savedPending) {
      try {
        vendors.value = JSON.parse(savedPending)
      } catch {
        vendors.value = []
      }
    } else {
      vendors.value = []
    }
  } finally {
    updateStats()
    loading.value = false
  }
}

const approveVendor = async (vendor) => {
  if (!confirm(`هل أنت متأكد من قبول البائع "${vendor.shopName}"؟`)) return

  submitting.value = vendor.id

  try {
    // Appel API pour approuver le vendeur
    const response = await api.post(`/admin/vendors/${vendor.id}/approve`)

    if (response.data.success) {
      // Retirer de la liste des en attente
      vendors.value = vendors.value.filter(v => v.id !== vendor.id)
      approvedVendorsCount.value++
      updateStats()
      showNotification(`✅ تم قبول البائع ${vendor.shopName} بنجاح`, 'success')
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('❌ Erreur approveVendor:', error)
    showNotification(`❌ فشل قبول البائع ${vendor.shopName}`, 'error')
  } finally {
    submitting.value = false
  }
}

const openRejectModal = (vendor) => {
  currentVendor.value = vendor
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  currentVendor.value = null
  rejectReason.value = ''
}

const confirmReject = async () => {
  if (!currentVendor.value) return
  if (!rejectReason.value.trim()) {
    showNotification('الرجاء إدخال سبب الرفض', 'warning')
    return
  }

  submitting.value = currentVendor.value.id

  try {
    // Appel API pour rejeter le vendeur
    const response = await api.post(`/admin/vendors/${currentVendor.value.id}/reject`, {
      reason: rejectReason.value
    })

    if (response.data.success) {
      vendors.value = vendors.value.filter(v => v.id !== currentVendor.value.id)
      updateStats()
      showNotification(`❌ تم رفض البائع ${currentVendor.value.shopName}`, 'info')
      closeRejectModal()
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('❌ Erreur rejectVendor:', error)
    showNotification(`❌ فشل رفض البائع ${currentVendor.value.shopName}`, 'error')
  } finally {
    submitting.value = false
  }
}

const viewVendorDetails = (vendorId) => {
  // Rediriger vers la page admin du vendeur
  router.push(`/admin/vendor/${vendorId}`)
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
  loadPendingVendors()
})
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.admin-page {
  font-family: 'Amiri', 'Cairo', serif;
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  direction: rtl;
  transition: all 0.3s ease;
}

.admin-page * {
  font-family: 'Amiri', 'Cairo', serif;
}

.admin-page.dark-mode {
  background: #0f172a;
}

.page-content {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-mode .page-content {
  background: #1e293b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-color: #334155;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-card.pending .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.dark-mode .stat-card.pending .stat-icon {
  background: rgba(254, 243, 199, 0.2);
  color: #fbbf24;
}

.stat-card.approved .stat-icon {
  background: #d4edda;
  color: #10b981;
}

.dark-mode .stat-card.approved .stat-icon {
  background: rgba(212, 237, 218, 0.2);
  color: #34d399;
}

.stat-card.total .stat-icon {
  background: #e0f2f1;
  color: #08717f;
}

.dark-mode .stat-card.total .stat-icon {
  background: rgba(8, 113, 127, 0.2);
  color: #2dd4bf;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* Search Bar */
.search-bar {
  margin-bottom: 25px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.dark-mode .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.search-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  font-size: 1.1rem;
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #cbd5e1;
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

.dark-mode .spinner {
  border-color: #334155;
  border-top-color: #2dd4bf;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Vendors Grid */
.vendors-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vendor-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dark-mode .vendor-card {
  background: #0f172a;
  border-color: #334155;
}

.vendor-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: #08717f;
}

.dark-mode .vendor-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: #2dd4bf;
}

.vendor-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.dark-mode .vendor-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.vendor-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .vendor-avatar {
  border-color: #0f172a;
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.vendor-owner {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.dark-mode .vendor-owner {
  color: #94a3b8;
}

.vendor-email {
  color: #475569;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.dark-mode .vendor-email {
  color: #cbd5e1;
}

.vendor-phone {
  color: #08717f;
  font-size: 0.85rem;
  font-weight: 600;
}

.dark-mode .vendor-phone {
  color: #2dd4bf;
}

.pending-badge {
  padding: 6px 15px;
  background: #fff3cd;
  color: #856404;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
}

.dark-mode .pending-badge {
  background: rgba(255, 243, 205, 0.2);
  color: #fbbf24;
}

.vendor-details {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.dark-mode .detail-label {
  color: #64748b;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
}

.dark-mode .detail-value {
  color: #cbd5e1;
}

.detail-value.description {
  line-height: 1.6;
  max-width: 300px;
}

.vendor-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dark-mode .vendor-actions {
  border-top-color: #334155;
  background: #1e293b;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 15px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.approve {
  background: #d4edda;
  color: #155724;
}

.dark-mode .action-btn.approve {
  background: rgba(212, 237, 218, 0.2);
  color: #34d399;
}

.action-btn.approve:hover {
  background: #c3e6cb;
  transform: translateY(-2px);
}

.action-btn.reject {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .action-btn.reject {
  background: rgba(248, 215, 218, 0.2);
  color: #f87171;
}

.action-btn.reject:hover {
  background: #f5c6cb;
  transform: translateY(-2px);
}

.action-btn.view {
  background: #e2e8f0;
  color: #475569;
}

.dark-mode .action-btn.view {
  background: #334155;
  color: #cbd5e1;
}

.action-btn.view:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

.dark-mode .empty-state p {
  color: #94a3b8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  animation: slideUp 0.3s ease;
}

.modal-content.dark-mode {
  background: #1e293b;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #1e293b;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.close-btn {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .close-btn {
  background: #334155;
  color: #f1f5f9;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px;
}

.modal-body p {
  color: #1e293b;
  font-size: 1rem;
}

.dark-mode .modal-body p {
  color: #f1f5f9;
}

.reject-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  margin-top: 10px;
  background: white;
  color: #1e293b;
}

.dark-mode .reject-textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.reject-textarea:focus {
  outline: none;
  border-color: #d40025;
}

.hint {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 8px;
}

.dark-mode .hint {
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .modal-footer {
  border-top-color: #334155;
}

.btn-cancel,
.btn-reject {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.dark-mode .btn-cancel {
  background: #334155;
  color: #cbd5e1;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-reject {
  background: #d40025;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: #b0001f;
  transform: translateY(-2px);
}

.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.dark-mode {
  background: #1e293b;
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.toast-icon { font-size: 1.3rem; }

.toast-message {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
}

.dark-mode .toast-message {
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .vendor-header {
    flex-direction: column;
    text-align: center;
  }

  .vendor-details {
    grid-template-columns: 1fr;
  }

  .vendor-actions {
    flex-direction: column;
  }

  .toast-notification {
    right: 20px;
    left: 20px;
  }
}
</style>
