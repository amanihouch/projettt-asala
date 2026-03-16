<!-- src/views/admin/PendingPosts.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة المنشورات</h1>
      <p class="page-subtitle">مراجعة واعتماد منشورات البائعين</p>
    </header>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <span class="stat-icon">⏳</span>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">في انتظار المراجعة</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <div class="stat-info">
          <span class="stat-value">{{ approvedCount }}</span>
          <span class="stat-label">منشورات معتمدة</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">❌</span>
        <div class="stat-info">
          <span class="stat-value">{{ rejectedCount }}</span>
          <span class="stat-label">منشورات مرفوضة</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        في انتظار المراجعة
        <span class="tab-count">{{ pendingCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'approved' }"
        @click="activeTab = 'approved'"
      >
        منشورات معتمدة
        <span class="tab-count">{{ approvedCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'rejected' }"
        @click="activeTab = 'rejected'"
      >
        منشورات مرفوضة
        <span class="tab-count">{{ rejectedCount }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المنشورات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>حدث خطأ</h3>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadData">إعادة المحاولة</button>
    </div>

    <!-- Pending Posts -->
    <div v-else-if="activeTab === 'pending'" class="posts-grid">
      <div v-if="pendingPosts.length === 0" class="empty-state">
        <span class="empty-icon">✅</span>
        <h3>لا توجد منشورات في انتظار المراجعة</h3>
        <p>جميع المنشورات تمت مراجعتها</p>
      </div>

      <div v-else v-for="post in pendingPosts" :key="post.id" class="post-card pending">
        <div class="post-header">
          <div class="vendor-info">
            <img
              :src="post.vendorAvatar || 'https://i.pravatar.cc/100'"
              :alt="post.vendorName"
              class="vendor-avatar"
            />
            <div>
              <h4 class="vendor-name">{{ post.vendorName || 'بائع' }}</h4>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          <span class="status-badge pending">في انتظار المراجعة</span>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.productName || 'منتج' }}</h3>
          <p class="post-description">{{ post.description || 'لا يوجد وصف' }}</p>

          <div class="post-price">
            <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
          </div>

          <!-- Actions -->
          <div class="post-actions">
            <button class="action-btn approve" @click="approvePost(post)">
              <span class="btn-icon">✅</span>
              قبول
            </button>
            <button class="action-btn reject" @click="openRejectModal(post)">
              <span class="btn-icon">❌</span>
              رفض
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content">
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
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
            <button class="btn-reject" @click="confirmReject" :disabled="!rejectReason.trim()">
              تأكيد الرفض
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '../../stores/postStore'

const router = useRouter()
const postStore = usePostStore()

// ===== STATE =====
const activeTab = ref('pending')
const loading = ref(false)
const error = ref(null)
const showRejectModal = ref(false)
const currentPost = ref(null)
const rejectReason = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== COMPUTED =====
const pendingPosts = computed(() => postStore.pendingPosts || [])
const approvedPosts = computed(() => postStore.posts || [])
const rejectedPosts = computed(() => postStore.rejectedPosts || [])

const pendingCount = computed(() => pendingPosts.value.length)
const approvedCount = computed(() => approvedPosts.value.length)
const rejectedCount = computed(() => rejectedPosts.value.length)

// ===== METHODS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-TN')
}

const loadData = async () => {
  loading.value = true
  error.value = null
  try {
    await postStore.fetchPendingPosts()
    console.log('✅ Posts chargés:', {
      pending: pendingPosts.value.length,
      approved: approvedPosts.value.length,
      rejected: rejectedPosts.value.length
    })
  } catch (err) {
    console.error('❌ Erreur:', err)
    error.value = err.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

const approvePost = async (post) => {
  if (!confirm(`هل أنت متأكد من قبول المنشور "${post.productName}"؟`)) return
  try {
    await postStore.approvePost(post.id)
    showNotification('✅ تم قبول المنشور بنجاح')
  } catch (err) {
    showNotification('❌ ' + err.message, 'error')
  }
}

const openRejectModal = (post) => {
  currentPost.value = post
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  currentPost.value = null
  rejectReason.value = ''
}

const confirmReject = async () => {
  if (!currentPost.value || !rejectReason.value.trim()) return
  try {
    await postStore.rejectPost(currentPost.value.id, rejectReason.value)
    showNotification('❌ تم رفض المنشور')
    closeRejectModal()
  } catch (err) {
    showNotification('❌ ' + err.message, 'error')
  }
}

// ===== LIFECYCLE =====
onMounted(async () => {
  const token = localStorage.getItem('token')
  console.log('🔑 Token présent:', token ? 'Oui' : 'Non')

  if (!token) {
    error.value = '❌ يجب تسجيل الدخول أولاً'
    setTimeout(() => router.push('/login'), 2000)
    return
  }
  await loadData()
})
</script>

<style scoped>
.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 5px;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #08717f;
  line-height: 1.2;
}

.stat-label {
  color: #64748b;
  font-size: 0.85rem;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  background: white;
  padding: 10px;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 600px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 40px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
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
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.btn-retry {
  margin-top: 20px;
  padding: 12px 30px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-right: 4px solid transparent;
}

.post-card.pending {
  border-right-color: #f59e0b;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vendor-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.vendor-name {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 3px;
  font-weight: 700;
}

.post-date {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-title {
  font-size: 1.2rem;
  color: #1e293b;
}

.post-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.post-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: #d40025;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.approve {
  background: #d4edda;
  color: #155724;
}

.action-btn.approve:hover {
  background: #c3e6cb;
}

.action-btn.reject {
  background: #f8d7da;
  color: #721c24;
}

.action-btn.reject:hover {
  background: #f5c6cb;
}

.btn-icon {
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.3;
}

.empty-state h3 {
  color: #64748b;
  font-size: 1.2rem;
}

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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.2rem;
  color: #1e293b;
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

.close-btn:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px;
}

.reject-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.reject-textarea:focus {
  outline: none;
  border-color: #d40025;
}

.modal-footer {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
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
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-reject {
  background: #d40025;
  color: white;
}

.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
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
}
</style>
