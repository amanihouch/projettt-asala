<!-- frontend/src/views/admin/PendingReels.vue - VERSION COMPLÈTE ET CORRIGÉE -->
<template>
  <div class="pending-reels-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon pending">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingReels.length }}</span>
          <span class="stat-label">في انتظار المراجعة</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon approved">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ approvedReels.length }}</span>
          <span class="stat-label">تم قبولها</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rejected">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ rejectedReels.length }}</span>
          <span class="stat-label">تم رفضها</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
        في انتظار المراجعة
        <span class="count">{{ pendingReels.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'approved' }" @click="activeTab = 'approved'">
        المقبولة
        <span class="count">{{ approvedReels.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">
        المرفوضة
        <span class="count">{{ rejectedReels.length }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل Reels...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentReels.length === 0" class="empty-state">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
      </svg>
      <h3>لا توجد Reels</h3>
      <p>لا توجد Reels في هذه الفئة</p>
    </div>

    <!-- Reels Grid -->
    <div v-else class="reels-grid">
      <div v-for="reel in currentReels" :key="reel.id" class="reel-card">
        <div class="reel-video-container">
          <video :src="reel.videoUrl" class="reel-video" controls></video>
          <div class="reel-overlay">
            <div class="reel-duration">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>15s</span>
            </div>
          </div>
        </div>

        <div class="reel-info">
          <div class="reel-header">
            <div class="vendor-info">
              <img :src="reel.vendorAvatar || 'https://i.pravatar.cc/40'" class="vendor-avatar" />
              <div class="vendor-details">
                <span class="vendor-name">{{ reel.shopName || reel.vendorName }}</span>
                <span class="reel-title">{{ reel.title }}</span>
              </div>
            </div>
            <div class="reel-stats">
              <div class="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ reel.likes || 0 }}</span>
              </div>
              <div class="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ reel.commentsCount || 0 }}</span>
              </div>
              <div class="stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>{{ reel.views || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="reel-description">{{ reel.description || 'لا يوجد وصف' }}</div>

          <!-- Actions pour les reels en attente -->
          <div class="reel-actions" v-if="activeTab === 'pending'">
            <button class="action-btn approve" @click="approveReel(reel)" :disabled="submitting === reel.id">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17L4 12"/>
              </svg>
              {{ submitting === reel.id ? 'جاري...' : 'قبول' }}
            </button>
            <button class="action-btn reject" @click="showRejectModal(reel)" :disabled="submitting === reel.id">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6L18 18"/>
              </svg>
              رفض
            </button>
            <button class="action-btn view" @click="viewReel(reel)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/>
              </svg>
              معاينة
            </button>
          </div>

          <!-- Statut pour les reels approuvés -->
          <div class="reel-status" v-else-if="activeTab === 'approved'">
            <span class="status-badge approved">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17L4 12"/>
              </svg>
              مقبول
            </span>
            <span class="approved-date">{{ formatDate(reel.approvedAt || reel.updatedAt) }}</span>
          </div>

          <!-- Statut pour les reels rejetés -->
          <div class="reel-status" v-else-if="activeTab === 'rejected'">
            <span class="status-badge rejected">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6L18 18"/>
              </svg>
              مرفوض
            </span>
            <span class="reject-reason" v-if="reel.rejectionReason">السبب: {{ reel.rejectionReason }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModalFlag" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3>رفض Reel</h3>
          <button class="close-btn" @click="closeRejectModal">✕</button>
        </div>
        <div class="modal-body">
          <p>هل أنت متأكد من رفض هذا الـ Reel؟</p>
          <textarea
            v-model="rejectionReason"
            class="form-textarea"
            placeholder="السبب (اختياري)..."
            rows="3"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
          <button class="btn-confirm" @click="confirmReject" :disabled="submitting">
            {{ submitting ? 'جاري...' : 'تأكيد الرفض' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

// frontend/src/views/admin/PendingReels.vue - Version corrigée du script

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== DONNÉES DE DÉMONSTRATION (FALLBACK) =====
const DEMO_REELS = [
  {
    id: 1,
    title: 'صناعة الفخار التقليدي',
    description: 'فيديو يوضح مراحل صناعة الفخار التونسي التقليدي',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    shopName: 'دار الفخار',
    vendorName: 'دار الفخار',
    vendorAvatar: 'https://i.pravatar.cc/40?img=1',
    likes: 45,
    commentsCount: 12,
    views: 230,
    status: 'pending',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString()
  },
  {
    id: 2,
    title: 'نسج السجاد اليدوي',
    description: 'طريقة نسج السجاد التقليدي بألوان طبيعية',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    shopName: 'المنسوجات التقليدية',
    vendorName: 'المنسوجات التقليدية',
    vendorAvatar: 'https://i.pravatar.cc/40?img=5',
    likes: 32,
    commentsCount: 8,
    views: 156,
    status: 'pending',
    createdAt: new Date('2024-03-19').toISOString(),
    updatedAt: new Date('2024-03-19').toISOString()
  },
  {
    id: 3,
    title: 'مجوهرات فضية يدوية',
    description: 'تصميم وتصنيع المجوهرات الفضية التقليدية',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    shopName: 'مجوهرات الأصالة',
    vendorName: 'مجوهرات الأصالة',
    vendorAvatar: 'https://i.pravatar.cc/40?img=3',
    likes: 28,
    commentsCount: 5,
    views: 98,
    status: 'pending',
    createdAt: new Date('2024-03-18').toISOString(),
    updatedAt: new Date('2024-03-18').toISOString()
  }
]

// ===== STATE =====
const loading = ref(false)
const activeTab = ref('pending')
const allReels = ref([])
const showRejectModalFlag = ref(false)
const selectedReel = ref(null)
const rejectionReason = ref('')
const submitting = ref(null)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ===== COMPUTED =====
const pendingReels = computed(() => allReels.value.filter(r => r.status === 'pending'))
const approvedReels = computed(() => allReels.value.filter(r => r.status === 'approved'))
const rejectedReels = computed(() => allReels.value.filter(r => r.status === 'rejected'))

const currentReels = computed(() => {
  if (activeTab.value === 'pending') return pendingReels.value
  if (activeTab.value === 'approved') return approvedReels.value
  return rejectedReels.value
})

// ===== UTILITAIRES =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] || '✅' }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ========== CHARGEMENT DEPUIS LOCALSTORAGE ==========
const loadFromLocalStorage = () => {
  try {
    const savedReels = localStorage.getItem('admin_reels')
    if (savedReels) {
      const localReels = JSON.parse(savedReels)
      if (localReels.length > 0) {
        allReels.value = localReels
        console.log('📹 Reels chargés depuis localStorage:', allReels.value.length)
        return true
      }
    }
    return false
  } catch (error) {
    console.error('❌ Erreur lecture localStorage:', error)
    return false
  }
}

// ========== SAUVEGARDE DANS LOCALSTORAGE ==========
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('admin_reels', JSON.stringify(allReels.value))
    console.log('💾 Reels sauvegardés dans localStorage')
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error)
  }
}

// ========== CHARGEMENT DES REELS DEPUIS API ==========
const loadReels = async () => {
  loading.value = true

  try {
    // Utiliser le bon endpoint: /admin/all (comme dans votre backend)
    const response = await api.get('/reels/admin/all')

    if (response.data && response.data.success) {
      const apiReels = response.data.data?.reels || response.data.data || []

      if (apiReels.length > 0) {
        // Transformer les données API pour correspondre au format attendu
        allReels.value = apiReels.map(reel => ({
          ...reel,
          shopName: reel.shopName || reel.vendorName,
          vendorAvatar: reel.vendorAvatar || 'https://i.pravatar.cc/40',
          commentsCount: reel.commentsCount || reel.comments?.length || 0
        }))

        saveToLocalStorage()
        console.log('📹 Reels chargés depuis API:', allReels.value.length)
        loading.value = false
        return
      }
    }

    // Fallback: Si API retourne vide ou erreur
    loadFromLocalStorage()

    if (allReels.value.length === 0) {
      allReels.value = [...DEMO_REELS]
      saveToLocalStorage()
      console.log('📹 Données de démo chargées:', allReels.value.length)
    }

  } catch (error) {
    console.error('❌ Erreur chargement reels:', error)

    // Fallback complet
    const hasLocal = loadFromLocalStorage()
    if (!hasLocal) {
      allReels.value = [...DEMO_REELS]
      saveToLocalStorage()
      console.log('📹 Fallback données de démo:', allReels.value.length)
    }
  } finally {
    loading.value = false
  }
}

// ========== CHARGEMENT DES REELS EN ATTENTE SPÉCIFIQUEMENT ==========
const loadPendingReels = async () => {
  try {
    const response = await api.get('/reels/admin/pending')

    if (response.data && response.data.success) {
      const pendingReelsData = response.data.data?.reels || response.data.data || []

      // Mettre à jour uniquement les reels en attente dans allReels
      pendingReelsData.forEach(pendingReel => {
        const index = allReels.value.findIndex(r => r.id === pendingReel.id)
        if (index !== -1) {
          allReels.value[index] = { ...allReels.value[index], ...pendingReel }
        } else {
          allReels.value.push(pendingReel)
        }
      })

      saveToLocalStorage()
      console.log('📹 Reels en attente chargés:', pendingReelsData.length)
    }
  } catch (error) {
    console.log('ℹ️ Impossible de charger les reels en attente spécifiquement')
  }
}

// ========== APPROUVER UN REEL ==========
const approveReel = async (reel) => {
  if (!reel || !reel.id) return

  submitting.value = reel.id
  try {
    // Utiliser le bon endpoint: /admin/:id/approve
    const response = await api.put(`/reels/admin/${reel.id}/approve`)

    if (response.data && response.data.success) {
      // Mettre à jour localement
      const index = allReels.value.findIndex(r => r.id === reel.id)
      if (index !== -1) {
        allReels.value[index].status = 'approved'
        allReels.value[index].approvedAt = new Date().toISOString()
        allReels.value[index].updatedAt = new Date().toISOString()
        saveToLocalStorage()
      }

      showNotification('✅ تم قبول الـ Reel بنجاح')
    } else {
      throw new Error('Réponse API invalide')
    }

  } catch (error) {
    console.error('❌ Erreur approveReel:', error)

    // Fallback local
    const index = allReels.value.findIndex(r => r.id === reel.id)
    if (index !== -1) {
      allReels.value[index].status = 'approved'
      allReels.value[index].approvedAt = new Date().toISOString()
      allReels.value[index].updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
    showNotification('✅ تم قبول الـ Reel بنجاح (محلياً)')
  } finally {
    submitting.value = null
  }
}

// ========== REFUSER UN REEL ==========
const showRejectModal = (reel) => {
  selectedReel.value = reel
  rejectionReason.value = ''
  showRejectModalFlag.value = true
}

const closeRejectModal = () => {
  showRejectModalFlag.value = false
  selectedReel.value = null
  rejectionReason.value = ''
}

const confirmReject = async () => {
  if (!selectedReel.value) return

  submitting.value = selectedReel.value.id
  try {
    // Utiliser le bon endpoint: /admin/:id/reject
    const response = await api.put(`/reels/admin/${selectedReel.value.id}/reject`, {
      reason: rejectionReason.value || 'غير محدد'
    })

    if (response.data && response.data.success) {
      // Mettre à jour localement
      const index = allReels.value.findIndex(r => r.id === selectedReel.value.id)
      if (index !== -1) {
        allReels.value[index].status = 'rejected'
        allReels.value[index].rejectionReason = rejectionReason.value || 'غير محدد'
        allReels.value[index].updatedAt = new Date().toISOString()
        saveToLocalStorage()
      }

      showNotification('❌ تم رفض الـ Reel بنجاح')
      closeRejectModal()
    } else {
      throw new Error('Réponse API invalide')
    }

  } catch (error) {
    console.error('❌ Erreur rejectReel:', error)

    // Fallback local
    const index = allReels.value.findIndex(r => r.id === selectedReel.value.id)
    if (index !== -1) {
      allReels.value[index].status = 'rejected'
      allReels.value[index].rejectionReason = rejectionReason.value || 'غير محدد'
      allReels.value[index].updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
    showNotification('❌ تم رفض الـ Reel بنجاح (محلياً)')
    closeRejectModal()
  } finally {
    submitting.value = null
  }
}

// ========== SUPPRIMER UN REEL ==========
const deleteReel = async (reel) => {
  if (!confirm('هل أنت متأكد من حذف هذا الـ Reel؟')) return

  submitting.value = reel.id
  try {
    // Utiliser le bon endpoint: /admin/:id
    const response = await api.delete(`/reels/admin/${reel.id}`)

    if (response.data && response.data.success) {
      // Supprimer localement
      const index = allReels.value.findIndex(r => r.id === reel.id)
      if (index !== -1) {
        allReels.value.splice(index, 1)
        saveToLocalStorage()
      }

      showNotification('🗑️ تم حذف الـ Reel بنجاح')
    } else {
      throw new Error('Réponse API invalide')
    }

  } catch (error) {
    console.error('❌ Erreur deleteReel:', error)

    // Fallback local
    const index = allReels.value.findIndex(r => r.id === reel.id)
    if (index !== -1) {
      allReels.value.splice(index, 1)
      saveToLocalStorage()
    }
    showNotification('🗑️ تم حذف الـ Reel بنجاح (محلياً)')
  } finally {
    submitting.value = null
  }
}

// ========== معاينة الفيديو ==========
const viewReel = (reel) => {
  if (reel.videoUrl) {
    window.open(reel.videoUrl, '_blank')
  }
}

// ========== GESTIONNAIRE D'ÉVÉNEMENT POUR REELS-UPDATED ==========
const handleReelsUpdated = () => {
  console.log('🔄 Événement reels-updated détecté, rechargement...')
  loadReels()
}

// ========== WATCHERS ==========
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark-mode')
    document.body.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })

// ========== LIFECYCLE ==========
onMounted(() => {
  loadReels()
  loadPendingReels()

  // Écouter les mises à jour des reels
  window.addEventListener('reels-updated', handleReelsUpdated)

  // Écouter les changements dans localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'admin_reels') {
      console.log('🔄 Changement détecté dans localStorage, rechargement...')
      loadReels()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('reels-updated', handleReelsUpdated)
})
</script>
<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.pending-reels-page {
  font-family: 'Amiri', 'Cairo', serif;
  padding: 30px;
  min-height: 100vh;
  background: #f8fafc;
  direction: rtl;
  transition: all 0.3s ease;
}

.pending-reels-page * {
  font-family: 'Amiri', 'Cairo', serif;
}

.pending-reels-page.dark-mode {
  background: #0f172a;
}

/* Stats Cards */
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
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: #1e293b;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.approved {
  background: #d1fae5;
  color: #10b981;
}

.stat-icon.rejected {
  background: #fee2e2;
  color: #ef4444;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.dark-mode .tabs {
  border-bottom-color: #334155;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .tab-btn {
  color: #94a3b8;
}

.tab-btn.active {
  background: #08717f;
  color: white;
}

.dark-mode .tab-btn.active {
  background: #0a94a6;
}

.tab-btn .count {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.tab-btn.active .count {
  background: rgba(255,255,255,0.2);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px;
}

.loading-state p {
  font-size: 1.1rem;
  color: #64748b;
  margin-top: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
}

.dark-mode .empty-state {
  background: #1e293b;
}

.empty-state svg {
  stroke: #cbd5e1;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

/* Reels Grid */
.reels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.reel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dark-mode .reel-card {
  background: #1e293b;
}

.reel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.reel-video-container {
  position: relative;
  aspect-ratio: 9 / 16;
  background: #000;
}

.reel-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

.reel-duration {
  background: rgba(0,0,0,0.7);
  padding: 4px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 0.75rem;
}

.reel-info {
  padding: 16px;
}

.reel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.vendor-info {
  display: flex;
  gap: 10px;
}

.vendor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.vendor-details {
  display: flex;
  flex-direction: column;
}

.vendor-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.reel-title {
  font-size: 0.85rem;
  color: #64748b;
}

.dark-mode .reel-title {
  color: #94a3b8;
}

.reel-stats {
  display: flex;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

.reel-description {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 16px;
  line-height: 1.5;
}

.dark-mode .reel-description {
  color: #cbd5e1;
}

.reel-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.approve {
  background: #10b981;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #059669;
}

.action-btn.reject {
  background: #ef4444;
  color: white;
}

.action-btn.reject:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn.view {
  background: #f1f5f9;
  color: #475569;
}

.dark-mode .action-btn.view {
  background: #334155;
  color: #cbd5e1;
}

.action-btn.view:hover {
  background: #e2e8f0;
}

.reel-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.approved {
  background: #d1fae5;
  color: #10b981;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #ef4444;
}

.approved-date {
  font-size: 0.8rem;
  color: #64748b;
}

.reject-reason {
  font-size: 0.8rem;
  color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
}

.modal-content.dark-mode {
  background: #1e293b;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
}

.close-btn:hover {
  color: #d40025;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  color: #1e293b;
  margin-bottom: 15px;
  font-size: 1rem;
}

.dark-mode .modal-body p {
  color: #cbd5e1;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  margin-top: 12px;
  background: white;
}

.dark-mode .form-textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .modal-footer {
  border-top-color: #334155;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.dark-mode .btn-cancel {
  background: #334155;
  color: #cbd5e1;
}

.btn-confirm {
  background: #ef4444;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #dc2626;
}

.btn-confirm:disabled {
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 9999;
  min-width: 280px;
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
  .pending-reels-page {
    padding: 20px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .reels-grid {
    grid-template-columns: 1fr;
  }
}
</style>
