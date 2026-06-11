<!-- src/views/admin/PendingPosts.vue - Version FINALE avec bouton Modifier -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card pending">
        <span class="stat-icon">⏳</span>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">في انتظار المراجعة</span>
        </div>
      </div>
      <div class="stat-card approved">
        <span class="stat-icon">✅</span>
        <div class="stat-info">
          <span class="stat-value">{{ approvedCount }}</span>
          <span class="stat-label">منشورات معتمدة</span>
        </div>
      </div>
      <div class="stat-card rejected">
        <span class="stat-icon">❌</span>
        <div class="stat-info">
          <span class="stat-value">{{ rejectedCount }}</span>
          <span class="stat-label">منشورات مرفوضة</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
        في انتظار المراجعة
        <span class="tab-count">{{ pendingCount }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'approved' }" @click="activeTab = 'approved'">
        منشورات معتمدة
        <span class="tab-count">{{ approvedCount }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">
        منشورات مرفوضة
        <span class="tab-count">{{ rejectedCount }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المنشورات...</p>
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
            <img :src="post.vendorAvatar || 'https://i.pravatar.cc/100'" :alt="post.vendorName" class="vendor-avatar" />
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

          <div v-if="post.images && post.images.length" class="post-images">
            <img v-for="(img, idx) in post.images.slice(0, 3)" :key="idx" :src="img" class="post-thumb" />
            <span v-if="post.images.length > 3" class="more-images">+{{ post.images.length - 3 }}</span>
          </div>

          <div class="post-actions">
            <!-- ✅ Bouton Modifier -->
            <button class="action-btn edit" @click="openEditModal(post)" :disabled="submitting === post.id">
              <span class="btn-icon">✏️</span>
              تعديل
            </button>
            <button class="action-btn approve" @click="approvePost(post)" :disabled="submitting === post.id">
              <span class="btn-icon">✅</span>
              {{ submitting === post.id ? 'جاري...' : 'قبول' }}
            </button>
            <button class="action-btn reject" @click="openRejectModal(post)" :disabled="submitting === post.id">
              <span class="btn-icon">❌</span>
              رفض
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approved Posts -->
    <div v-else-if="activeTab === 'approved'" class="posts-grid">
      <div v-if="approvedPosts.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <h3>لا توجد منشورات معتمدة</h3>
        <p>سيتم عرض المنشورات المعتمدة هنا</p>
      </div>

      <div v-else v-for="post in approvedPosts" :key="post.id" class="post-card approved">
        <div class="post-header">
          <div class="vendor-info">
            <img :src="post.vendorAvatar || 'https://i.pravatar.cc/100'" :alt="post.vendorName" class="vendor-avatar" />
            <div>
              <h4 class="vendor-name">{{ post.vendorName || 'بائع' }}</h4>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          <span class="status-badge approved">معتمد</span>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.productName || 'منتج' }}</h3>
          <p class="post-description">{{ post.description || 'لا يوجد وصف' }}</p>
          <div class="post-price">
            <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
          </div>
          <div class="post-actions">
            <!-- ✅ Bouton Modifier -->
            <button class="action-btn edit" @click="openEditModal(post)">
              <span class="btn-icon">✏️</span>
              تعديل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejected Posts -->
    <div v-else-if="activeTab === 'rejected'" class="posts-grid">
      <div v-if="rejectedPosts.length === 0" class="empty-state">
        <span class="empty-icon">✅</span>
        <h3>لا توجد منشورات مرفوضة</h3>
        <p>سيتم عرض المنشورات المرفوضة هنا</p>
      </div>

      <div v-else v-for="post in rejectedPosts" :key="post.id" class="post-card rejected">
        <div class="post-header">
          <div class="vendor-info">
            <img :src="post.vendorAvatar || 'https://i.pravatar.cc/100'" :alt="post.vendorName" class="vendor-avatar" />
            <div>
              <h4 class="vendor-name">{{ post.vendorName || 'بائع' }}</h4>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          <span class="status-badge rejected">مرفوض</span>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.productName || 'منتج' }}</h3>
          <p class="post-description">{{ post.description || 'لا يوجد وصف' }}</p>
          <div class="post-price">
            <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
          </div>
          <div v-if="post.rejectionReason" class="rejection-reason">
            <span class="reason-label">سبب الرفض:</span>
            <span class="reason-text">{{ post.rejectionReason }}</span>
          </div>
          <div class="post-actions">
            <!-- ✅ Bouton Modifier -->
            <button class="action-btn edit" @click="openEditModal(post)">
              <span class="btn-icon">✏️</span>
              تعديل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Edit Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>✏️ تعديل المنشور</h3>
            <button class="close-btn" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>اسم المنتج</label>
              <input type="text" v-model="editForm.productName" class="form-input" />
            </div>
            <div class="form-group">
              <label>الوصف</label>
              <textarea v-model="editForm.description" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>السعر (د.ت)</label>
              <input type="number" v-model.number="editForm.price" class="form-input" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>الفئة</label>
              <select v-model="editForm.category" class="form-input">
                <option value="pottery">🏺 فخار</option>
                <option value="textiles">🧵 منسوجات</option>
                <option value="jewelry">💍 مجوهرات</option>
                <option value="woodwork">🪵 خشب</option>
                <option value="metalwork">⚒️ معادن</option>
                <option value="leather">👜 جلود</option>
                <option value="other">🎨 أخرى</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeEditModal">إلغاء</button>
            <button class="btn-save" @click="savePostEdit" :disabled="savingEdit">
              {{ savingEdit ? 'جاري الحفظ...' : '💾 حفظ التعديلات' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reject Modal -->
    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>رفض المنشور</h3>
            <button class="close-btn" @click="closeRejectModal">✕</button>
          </div>
          <div class="modal-body">
            <p>الرجاء إدخال سبب رفض هذا المنشور:</p>
            <textarea v-model="rejectReason" class="reject-textarea" rows="4" placeholder="سبب الرفض..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
            <button class="btn-reject" @click="confirmReject" :disabled="!rejectReason.trim() || submitting">
              {{ submitting ? 'جاري...' : 'تأكيد الرفض' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { usePostStore } from '../../stores/postStore'
import api from '../../services/api'

const themeStore = useThemeStore()
const postStore = usePostStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const activeTab = ref('pending')
const showRejectModal = ref(false)
const showEditModal = ref(false)
const currentPost = ref(null)
const rejectReason = ref('')
const submitting = ref(null)
const savingEdit = ref(false)
const loading = ref(false)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ✅ Formulaire d'édition
const editForm = reactive({
  productName: '',
  description: '',
  price: 0,
  category: ''
})

// ===== COMPUTED =====
const pendingPosts = computed(() => postStore.pendingPosts || [])
const approvedPosts = computed(() => postStore.approvedPosts || [])
const rejectedPosts = computed(() => postStore.rejectedPosts || [])
const pendingCount = computed(() => pendingPosts.value.length)
const approvedCount = computed(() => approvedPosts.value.length)
const rejectedCount = computed(() => rejectedPosts.value.length)

// ===== METHODS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] || '✅' }
  setTimeout(() => (toast.value.show = false), 3000)
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-TN').format(price)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try { return new Date(dateStr).toLocaleDateString('ar-TN') }
  catch { return dateStr }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      postStore.fetchPendingPosts(),
      postStore.fetchApprovedPosts(),
      postStore.fetchRejectedPosts()
    ])
    console.log('✅ Toutes les données chargées')
  } catch (error) {
    console.error('❌ Erreur chargement:', error)
    showNotification('حدث خطأ أثناء تحميل البيانات', 'error')
  } finally {
    loading.value = false
  }
}

const approvePost = async (post) => {
  if (!post || !post.id) return
  if (!confirm(`هل أنت متأكد من قبول المنشور "${post.productName}"؟`)) return
  submitting.value = post.id
  try {
    await postStore.approvePost(post.id)
    showNotification('✅ تم قبول المنشور بنجاح')
  } catch (error) {
    showNotification(error?.response?.data?.message || 'حدث خطأ', 'error')
  } finally {
    submitting.value = null
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
  submitting.value = currentPost.value.id
  try {
    await postStore.rejectPost(currentPost.value.id, rejectReason.value)
    showNotification('❌ تم رفض المنشور')
    closeRejectModal()
  } catch (error) {
    showNotification(error?.response?.data?.message || 'حدث خطأ', 'error')
  } finally {
    submitting.value = null
  }
}

// ✅ Ouvrir le modal d'édition
const openEditModal = (post) => {
  currentPost.value = post
  editForm.productName = post.productName || ''
  editForm.description = post.description || ''
  editForm.price = post.price || 0
  editForm.category = post.category || 'other'
  showEditModal.value = true
}

// ✅ Fermer le modal d'édition
const closeEditModal = () => {
  showEditModal.value = false
  currentPost.value = null
  editForm.productName = ''
  editForm.description = ''
  editForm.price = 0
  editForm.category = ''
}

// ✅ Sauvegarder les modifications
const savePostEdit = async () => {
  if (!currentPost.value) return

  savingEdit.value = true
  try {
    const response = await api.put(`/posts/${currentPost.value.id}`, {
      productName: editForm.productName,
      description: editForm.description,
      price: editForm.price,
      category: editForm.category
    })

    if (response.data.success) {
      showNotification('✅ تم حفظ التعديلات بنجاح')
      closeEditModal()
      await loadData() // Recharger les données
    } else {
      showNotification(response.data.message || 'حدث خطأ', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur modification:', error)
    showNotification(error?.response?.data?.message || 'حدث خطأ أثناء حفظ التعديلات', 'error')
  } finally {
    savingEdit.value = false
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
onMounted(() => { loadData() })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== BASE ===== */
.admin-page { font-family: 'Amiri', 'Cairo', serif; padding: 30px; background: #f8fafc; min-height: 100vh; direction: rtl; transition: all 0.3s ease; }
.admin-page * { font-family: 'Amiri', 'Cairo', serif; }
.admin-page.dark-mode { background: #0f172a; }

/* ===== LOADING ===== */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: white; border-radius: 16px; }
.dark-mode .loading-state { background: #1e293b; }
.spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #08717f; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: #64748b; font-size: 1rem; }
.dark-mode .loading-state p { color: #94a3b8; }

/* ===== STATS ===== */
.stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s ease; }
.dark-mode .stat-card { background: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.stat-card.pending .stat-value { color: #f59e0b; }
.stat-card.approved .stat-value { color: #10b981; }
.stat-card.rejected .stat-value { color: #ef4444; }
.stat-icon { font-size: 2.5rem; }
.stat-info { flex: 1; }
.stat-value { display: block; font-size: 1.8rem; font-weight: 800; line-height: 1.2; }
.stat-label { color: #64748b; font-size: 0.9rem; }
.dark-mode .stat-label { color: #94a3b8; }

/* ===== TABS ===== */
.tabs { display: flex; gap: 10px; margin-bottom: 25px; background: white; padding: 10px; border-radius: 50px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); max-width: 600px; }
.dark-mode .tabs { background: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 40px; font-size: 1rem; font-weight: 600; color: #64748b; background: transparent; cursor: pointer; transition: all 0.3s ease; }
.dark-mode .tab-btn { color: #94a3b8; }
.tab-btn.active { background: linear-gradient(135deg, #08717f, #065a69); color: white; }
.tab-count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 20px; font-size: 0.8rem; }

/* ===== POSTS ===== */
.posts-grid { display: flex; flex-direction: column; gap: 20px; }
.post-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-right: 4px solid transparent; transition: all 0.3s ease; }
.dark-mode .post-card { background: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.post-card.pending { border-right-color: #f59e0b; }
.post-card.approved { border-right-color: #10b981; }
.post-card.rejected { border-right-color: #ef4444; }
.post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
.dark-mode .post-header { border-bottom-color: #334155; }
.vendor-info { display: flex; align-items: center; gap: 12px; }
.vendor-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
.vendor-name { font-size: 1.1rem; color: #1e293b; margin-bottom: 3px; font-weight: 700; }
.dark-mode .vendor-name { color: #f1f5f9; }
.post-date { font-size: 0.8rem; color: #64748b; }
.status-badge { padding: 5px 15px; border-radius: 30px; font-size: 0.85rem; font-weight: 600; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.approved { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.post-content { display: flex; flex-direction: column; gap: 15px; }
.post-title { font-size: 1.3rem; color: #1e293b; }
.dark-mode .post-title { color: #f1f5f9; }
.post-description { color: #64748b; font-size: 1rem; line-height: 1.6; }
.post-price { font-size: 1.4rem; font-weight: 800; color: #d40025; }
.post-images { display: flex; gap: 10px; flex-wrap: wrap; }
.post-thumb { width: 70px; height: 70px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
.more-images { display: flex; align-items: center; justify-content: center; width: 70px; height: 70px; background: #f1f5f9; border-radius: 8px; font-weight: 600; color: #64748b; }
.rejection-reason { background: #fef2f2; padding: 12px; border-radius: 8px; border-right: 3px solid #ef4444; }
.reason-label { font-weight: 600; color: #991b1b; margin-left: 8px; }
.reason-text { color: #dc2626; }

/* ===== ACTIONS ===== */
.post-actions { display: flex; gap: 10px; margin-top: 10px; padding-top: 15px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; }
.dark-mode .post-actions { border-top-color: #334155; }
.action-btn { flex: 1; min-width: 80px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.approve { background: #d4edda; color: #155724; }
.action-btn.reject { background: #f8d7da; color: #721c24; }
.action-btn.edit { background: #dbeafe; color: #1e40af; }
.dark-mode .action-btn.edit { background: rgba(219, 234, 254, 0.2); color: #93c5fd; }
.action-btn.edit:hover:not(:disabled) { background: #bfdbfe; transform: translateY(-2px); }

/* ===== EMPTY ===== */
.empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 16px; }
.dark-mode .empty-state { background: #1e293b; }
.empty-icon { font-size: 4rem; display: block; margin-bottom: 15px; opacity: 0.3; }
.empty-state h3 { color: #64748b; font-size: 1.3rem; }

/* ===== MODAL ===== */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
.dark-mode .modal-content { background: #1e293b; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
.dark-mode .modal-header { border-bottom-color: #334155; }
.modal-header h3 { font-size: 1.3rem; color: #1e293b; }
.dark-mode .modal-header h3 { color: #f1f5f9; }
.close-btn { width: 35px; height: 35px; background: #f1f5f9; border: none; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
.close-btn:hover { background: #d40025; color: white; }
.modal-body { padding: 25px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.dark-mode .form-group label { color: #f1f5f9; }
.form-input, .form-textarea { width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; font-family: inherit; background: white; color: #1e293b; transition: all 0.3s; }
.dark-mode .form-input, .dark-mode .form-textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #08717f; }
.form-textarea { resize: vertical; }
.reject-textarea { width: 100%; padding: 15px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit; }
.modal-footer { display: flex; gap: 15px; padding: 20px; border-top: 1px solid #e2e8f0; }
.dark-mode .modal-footer { border-top-color: #334155; }
.btn-cancel, .btn-save, .btn-reject { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.dark-mode .btn-cancel { background: #334155; color: #cbd5e1; }
.btn-save { background: #08717f; color: white; }
.btn-save:hover:not(:disabled) { background: #065a69; transform: translateY(-2px); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-reject { background: #d40025; color: white; }

/* ===== TOAST ===== */
.toast-notification { position: fixed; bottom: 30px; right: 30px; display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: white; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 9999; min-width: 280px; border-right: 4px solid; animation: slideInRight 0.3s ease; }
.dark-mode .toast-notification { background: #1e293b; }
.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
.toast-icon { font-size: 1.3rem; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page { padding: 20px; }
  .stats-cards { grid-template-columns: 1fr; }
  .tabs { flex-direction: column; border-radius: 16px; padding: 5px; }
  .tab-btn { justify-content: center; }
  .post-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .post-actions { flex-direction: column; }
  .action-btn { width: 100%; }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/PENDING POSTS ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

/* Loading */
.dark-mode .loading-state {
  background: #1e1e30 !important;
}

.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Stats Cards */
.dark-mode .stat-card {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .stat-value {
  color: #f1f5f9 !important;
}

.dark-mode .stat-label {
  color: #94a3b8 !important;
}

.dark-mode .stat-card.pending .stat-value {
  color: #fbbf24 !important;
}

.dark-mode .stat-card.approved .stat-value {
  color: #34d399 !important;
}

.dark-mode .stat-card.rejected .stat-value {
  color: #f87171 !important;
}

/* Tabs */
.dark-mode .tabs {
  background: #1e1e30 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .tab-btn {
  color: #94a3b8 !important;
}

.dark-mode .tab-btn.active {
  background: linear-gradient(135deg, #08717f, #065a69) !important;
  color: white !important;
}

/* Posts */
.dark-mode .post-card {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .post-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .vendor-name {
  color: #f1f5f9 !important;
}

.dark-mode .post-date {
  color: #94a3b8 !important;
}

/* Status Badges */
.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
}

.dark-mode .status-badge.approved {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.dark-mode .status-badge.rejected {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

/* Post Content */
.dark-mode .post-title {
  color: #f1f5f9 !important;
}

.dark-mode .post-description {
  color: #cbd5e1 !important;
}

.dark-mode .post-price {
  color: #ef4444 !important;
}

.dark-mode .post-thumb {
  border-color: #2a2a40 !important;
}

.dark-mode .more-images {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

/* Rejection Reason */
.dark-mode .rejection-reason {
  background: rgba(239, 68, 68, 0.08) !important;
  border-right-color: #ef4444 !important;
}

.dark-mode .reason-label {
  color: #f87171 !important;
}

.dark-mode .reason-text {
  color: #fca5a5 !important;
}

/* Post Actions */
.dark-mode .post-actions {
  border-top-color: #2a2a40 !important;
}

.dark-mode .action-btn.approve {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.dark-mode .action-btn.approve:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.25) !important;
}

.dark-mode .action-btn.reject {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

.dark-mode .action-btn.reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25) !important;
}

.dark-mode .action-btn.edit {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
}

.dark-mode .action-btn.edit:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25) !important;
}

/* Empty */
.dark-mode .empty-state {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
}

.dark-mode .empty-state h3 {
  color: #94a3b8 !important;
}

.dark-mode .empty-state p {
  color: #94a3b8 !important;
}

/* Modal */
.dark-mode .modal-content {
  background: #1e1e30 !important;
}

.dark-mode .modal-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .close-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .form-group label {
  color: #cbd5e1 !important;
}

.dark-mode .form-input,
.dark-mode .form-textarea,
.dark-mode .reject-textarea {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .form-input:focus,
.dark-mode .form-textarea:focus {
  border-color: #2dd4bf !important;
}

.dark-mode .modal-footer {
  border-top-color: #2a2a40 !important;
}

.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
}

.dark-mode .btn-save {
  background: #08717f !important;
}

.dark-mode .btn-reject {
  background: #d40025 !important;
}

/* Toast */
.dark-mode .toast-notification {
  background: #1e1e30 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
