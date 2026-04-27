<!-- src/views/admin/PostDetail.vue -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">→</span>
        العودة
      </button>
      <h1 class="page-title">تفاصيل المنشور</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المنشور...</p>
    </div>

    <div v-else-if="post" class="post-card">
      <!-- En-tête avec statut -->
      <div class="post-header">
        <div class="vendor-info">
          <img :src="post.vendorAvatar" :alt="post.vendorName" class="vendor-avatar" />
          <div>
            <h3 class="vendor-name">{{ post.vendorName }}</h3>
            <p class="post-date">{{ formatDate(post.createdAt) }}</p>
          </div>
        </div>
        <div class="status-section">
          <span class="status-badge" :class="post.status">
            {{ getStatusText(post.status) }}
          </span>
        </div>
      </div>

      <!-- Informations produit -->
      <div class="product-section">
        <h2 class="product-title">{{ post.productName }}</h2>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">التصنيف</span>
            <span class="info-value">{{ getCategoryName(post.category) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">السعر الحالي</span>
            <span class="info-value price">{{ post.price }} د.ت</span>
          </div>

          <div v-if="post.oldPrice" class="info-item">
            <span class="info-label">السعر القديم</span>
            <span class="info-value old-price">{{ post.oldPrice }} د.ت</span>
            <span class="discount"
              >(توفير {{ calculateDiscount(post.price, post.oldPrice) }}%)</span
            >
          </div>

          <div class="info-item">
            <span class="info-label">الكمية</span>
            <span class="info-value">{{ post.quantity || 1 }} {{ getUnitLabel(post.unit) }}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="post.description" class="description-section">
        <h4 class="section-title">الوصف</h4>
        <p class="description-text">{{ post.description }}</p>
      </div>

      <!-- Couleurs -->
      <div v-if="post.colors && post.colors.length" class="colors-section">
        <h4 class="section-title">الألوان المتوفرة</h4>
        <div class="colors-list">
          <span
            v-for="color in post.colors"
            :key="color"
            class="color-dot"
            :style="{ backgroundColor: getColorCode(color) }"
            :title="color"
          ></span>
          <span class="color-names">{{ post.colors.join('، ') }}</span>
        </div>
      </div>

      <!-- Images -->
      <div v-if="post.images && post.images.length" class="images-section">
        <h4 class="section-title">الصور</h4>
        <div class="images-grid">
          <div
            v-for="(img, index) in post.images"
            :key="index"
            class="image-item"
            @click="openImage(img)"
          >
            <img :src="img" :alt="post.productName" />
          </div>
        </div>
      </div>

      <!-- Raison du rejet (si rejeté) -->
      <div v-if="post.status === 'rejected' && post.adminNotes" class="rejection-reason">
        <h4 class="section-title">سبب الرفض</h4>
        <p>{{ post.adminNotes }}</p>
      </div>

      <!-- Actions Admin -->
      <div class="admin-actions">
        <template v-if="post.status === 'pending'">
          <button class="action-btn approve" @click="approvePost">
            <span class="btn-icon">✅</span>
            <span>قبول المنشور</span>
          </button>
          <button class="action-btn reject" @click="openRejectModal">
            <span class="btn-icon">❌</span>
            <span>رفض المنشور</span>
          </button>
          <button class="action-btn edit" @click="goToEdit">
            <span class="btn-icon">✏️</span>
            <span>تعديل المنشور</span>
          </button>
        </template>
        <template v-else>
          <button class="action-btn edit" @click="goToEdit">
            <span class="btn-icon">✏️</span>
            <span>تعديل المنشور</span>
          </button>
          <button class="action-btn delete" @click="deletePost">
            <span class="btn-icon">🗑️</span>
            <span>حذف المنشور</span>
          </button>
          <button v-if="post.status === 'rejected'" class="action-btn approve" @click="approvePost">
            <span class="btn-icon">✅</span>
            <span>قبول المنشور</span>
          </button>
        </template>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>المنشور غير موجود</h2>
      <button class="back-btn" @click="goBack">العودة</button>
    </div>

    <!-- Modal de rejet -->
    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>رفض المنشور</h3>
            <button class="close-btn" @click="closeRejectModal">✕</button>
          </div>
          <div class="modal-body">
            <p>الرجاء إدخال سبب رفض هذا المنشور:</p>
            <textarea
              v-model="rejectReason"
              class="reject-textarea"
              rows="4"
              placeholder="سبب الرفض..."
            ></textarea>
            <div class="modal-actions">
              <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
              <button class="btn-reject" @click="confirmReject" :disabled="!rejectReason.trim()">
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal d'image -->
    <transition name="modal">
      <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
        <div class="image-modal-content">
          <img :src="selectedImage" alt="" />
          <button class="close-btn" @click="closeImageModal">✕</button>
        </div>
      </div>
    </transition>

    <!-- Toast -->
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { usePostStore } from '../../stores/postStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const postStore = usePostStore()

// ===== DARK MODE - Synchronized with global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const post = ref(null)
const showRejectModal = ref(false)
const showImageModal = ref(false)
const selectedImage = ref('')
const rejectReason = ref('')
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ===== UTILS =====
const showToast = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const getStatusText = (status) => {
  const statusMap = { pending: 'في انتظار المراجعة', approved: 'معتمد', rejected: 'مرفوض' }
  return statusMap[status] || status
}

const getCategoryName = (cat) => {
  const categories = {
    perfumes: 'عطور',
    jewelry: 'حلي و اكسسوارات',
    clothing: 'ملابس',
    decoration: 'ديكور',
    textiles: 'أقمشة وسجادات',
    pottery: 'أواني',
    beauty: 'عناية وتجميل',
    food: 'أغذية',
    other: 'أخرى',
  }
  return categories[cat] || cat
}

const getUnitLabel = (unit) => {
  const units = { piece: 'قطعة', set: 'طقم', kg: 'كيلو', gram: 'غرام', liter: 'لتر', meter: 'متر' }
  return units[unit] || 'قطعة'
}

const getColorCode = (colorName) => {
  const colors = {
    Rouge: '#d40025',
    Bleu: '#08717f',
    Vert: '#10b981',
    Jaune: '#fbbf24',
    Violet: '#8b5cf6',
    Rose: '#ec4899',
    Marron: '#92400e',
    Noir: '#1e293b',
    Blanc: '#ffffff',
    Gris: '#64748b',
  }
  return colors[colorName] || '#64748b'
}

const calculateDiscount = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const goBack = () => router.push('/admin/pending-posts')
const goToEdit = () => router.push(`/admin/post/edit/${post.value.id}`)

const approvePost = async () => {
  if (confirm('هل أنت متأكد من قبول هذا المنشور؟')) {
    try {
      await postStore.approvePost(post.value.id)
      showToast('✅ تم قبول المنشور بنجاح')
      post.value.status = 'approved'
      setTimeout(() => router.push('/admin/pending-posts'), 1500)
    } catch (error) {
      console.error('❌ Erreur approbation:', error)
      showToast('❌ حدث خطأ', 'error')
    }
  }
}

const openRejectModal = () => {
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  rejectReason.value = ''
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) return
  try {
    await postStore.rejectPost(post.value.id, rejectReason.value)
    showToast('❌ تم رفض المنشور')
    closeRejectModal()
    post.value.status = 'rejected'
    post.value.adminNotes = rejectReason.value
    setTimeout(() => router.push('/admin/pending-posts'), 1500)
  } catch (error) {
    console.error('❌ Erreur rejet:', error)
    showToast('❌ حدث خطأ', 'error')
  }
}

const deletePost = async () => {
  if (confirm('هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.')) {
    try {
      await postStore.deletePost(post.value.id)
      showToast('🗑️ تم حذف المنشور')
      setTimeout(() => router.push('/admin/pending-posts'), 1500)
    } catch (error) {
      console.error('❌ Erreur suppression:', error)
      showToast('❌ حدث خطأ', 'error')
    }
  }
}

const openImage = (img) => {
  selectedImage.value = img
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = ''
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
onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }

  const postId = route.params.id
  try {
    const data = await postStore.fetchPostById(postId)
    post.value = data
  } catch (error) {
    console.error('❌ Erreur chargement post:', error)
    showToast('❌ حدث خطأ في تحميل المنشور', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  transition: all 0.3s ease;
}

/* Dark mode styles */
.admin-page.dark-mode {
  background: #0f172a;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .back-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.back-btn:hover {
  border-color: #08717f;
  color: #08717f;
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.2rem;
}

.page-title {
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

/* Loading */
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

.dark-mode .spinner {
  border-color: #334155;
  border-top-color: #08717f;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #94a3b8;
}

/* Post Card */
.post-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 900px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.dark-mode .post-card {
  background: #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.dark-mode .post-header {
  border-bottom-color: #334155;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.vendor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode .vendor-avatar {
  border-color: #1e293b;
}

.vendor-name {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 700;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.post-date {
  color: #64748b;
  font-size: 0.85rem;
}

.dark-mode .post-date {
  color: #94a3b8;
}

.status-badge {
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.dark-mode .status-badge.pending {
  background: rgba(255, 243, 205, 0.2);
  color: #ffd966;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.approved {
  background: rgba(212, 237, 218, 0.2);
  color: #6fbf4c;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-badge.rejected {
  background: rgba(248, 215, 218, 0.2);
  color: #ff6b6b;
}

/* Product Section */
.product-section {
  margin-bottom: 25px;
}

.product-title {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.dark-mode .product-title {
  color: #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.dark-mode .info-grid {
  background: #0f172a;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-mode .info-label {
  color: #94a3b8;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .info-value {
  color: #f1f5f9;
}

.info-value.price {
  color: #d40025;
  font-size: 1.4rem;
}

.dark-mode .info-value.price {
  color: #ff6b6b;
}

.info-value.old-price {
  color: #94a3b8;
  text-decoration: line-through;
  font-size: 1rem;
}

.discount {
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 600;
}

/* Section Title */
.section-title {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}

.dark-mode .section-title {
  color: #f1f5f9;
  border-bottom-color: #334155;
}

/* Description */
.description-section {
  margin-bottom: 25px;
}

.description-text {
  color: #475569;
  line-height: 1.8;
  padding: 0 10px;
  font-size: 1rem;
}

.dark-mode .description-text {
  color: #cbd5e1;
}

/* Colors */
.colors-section {
  margin-bottom: 25px;
}

.colors-list {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.color-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dark-mode .color-dot {
  border-color: #1e293b;
}

.color-names {
  color: #64748b;
  font-size: 0.95rem;
}

.dark-mode .color-names {
  color: #94a3b8;
}

/* Images */
.images-section {
  margin-bottom: 25px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .image-item {
  border-color: #334155;
}

.image-item:hover {
  transform: scale(1.05);
  border-color: #08717f;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Rejection Reason */
.rejection-reason {
  background: #fee2e2;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  border-right: 4px solid #dc2626;
}

.dark-mode .rejection-reason {
  background: rgba(220, 38, 38, 0.1);
  border-right-color: #ef4444;
}

.rejection-reason p {
  color: #991b1b;
  line-height: 1.7;
  font-size: 1rem;
  margin: 0;
}

.dark-mode .rejection-reason p {
  color: #ff6b6b;
}

/* Admin Actions */
.admin-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #f1f5f9;
}

.dark-mode .admin-actions {
  border-top-color: #334155;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
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
  color: #6fbf4c;
}

.action-btn.approve:hover {
  background: #c3e6cb;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(21, 87, 36, 0.2);
}

.dark-mode .action-btn.approve:hover {
  background: rgba(212, 237, 218, 0.3);
}

.action-btn.reject {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .action-btn.reject {
  background: rgba(248, 215, 218, 0.2);
  color: #ff6b6b;
}

.action-btn.reject:hover {
  background: #f5c6cb;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(114, 28, 36, 0.2);
}

.dark-mode .action-btn.reject:hover {
  background: rgba(248, 215, 218, 0.3);
}

.action-btn.edit {
  background: #cce5ff;
  color: #004085;
}

.dark-mode .action-btn.edit {
  background: rgba(204, 229, 255, 0.2);
  color: #6ea8fe;
}

.action-btn.edit:hover {
  background: #b8daff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 64, 133, 0.2);
}

.dark-mode .action-btn.edit:hover {
  background: rgba(204, 229, 255, 0.3);
}

.action-btn.delete {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .action-btn.delete {
  background: rgba(248, 215, 218, 0.2);
  color: #ff6b6b;
}

.action-btn.delete:hover {
  background: #f5c6cb;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(114, 28, 36, 0.2);
}

.dark-mode .action-btn.delete:hover {
  background: rgba(248, 215, 218, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.dark-mode .not-found {
  background: #1e293b;
}

.not-found h2 {
  color: #1e293b;
  margin-bottom: 20px;
}

.dark-mode .not-found h2 {
  color: #f1f5f9;
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

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
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
  font-size: 1.2rem;
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
  margin-bottom: 15px;
}

.dark-mode .modal-body p {
  color: #f1f5f9;
}

.reject-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  margin: 15px 0;
  resize: vertical;
  font-family: inherit;
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
  border-color: #08717f;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancel,
.btn-reject {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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

.dark-mode .btn-cancel:hover {
  background: #475569;
}

.btn-reject {
  background: #d40025;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: #b00020;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.3);
}

.btn-reject:disabled {
  opacity: 0.5;
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
  min-width: 280px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.dark-mode {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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

.toast-notification.warning {
  border-right-color: #f59e0b;
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
  font-size: 1.3rem;
}

.toast-message {
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .admin-actions {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
