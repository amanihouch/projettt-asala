<!-- src/views/Profile.vue - Version améliorée avec police Amiri -->
<template>
  <div class="profile-page" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="instagram-loader">
        <div class="loader-ring"></div>
        <div class="loader-logo">📸</div>
        <p>جاري تحميل ملفك الشخصي...</p>
      </div>
    </div>

    <template v-else>
      <!-- Cover Photo -->
      <div class="cover-container">
        <div class="cover-wrapper">
          <img
            :src="coverImageUrl"
            alt="Cover"
            class="cover-photo"
            @error="handleCoverError"
            :key="coverImageKey"
          />
          <div class="cover-overlay"></div>
          <button v-if="isCurrentUser" class="edit-cover-btn" @click="openCoverUpload" :disabled="uploadingCover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>{{ uploadingCover ? 'جاري الرفع...' : 'تغيير الغلاف' }}</span>
          </button>
        </div>
        <input type="file" ref="coverInput" @change="handleCoverUpload" accept="image/*" style="display: none" />
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="container">
          <div class="profile-info-wrapper">
            <!-- Avatar -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img
                  :src="avatarUrl"
                  :alt="authStore.userName"
                  class="profile-avatar"
                  @error="handleAvatarError"
                  :key="avatarKey"
                />
                <button v-if="isCurrentUser" class="avatar-edit-btn" @click="triggerAvatarUpload" :disabled="uploadingAvatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                  </svg>
                </button>
                <div v-if="authStore.userRole === 'vendor'" class="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
              </div>
              <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*" style="display: none" />
            </div>

            <!-- Info -->
            <div class="info-section">
              <div class="username-row">
                <h1 class="username">{{ profileUser?.name || authStore.userName }}</h1>
                <div class="action-buttons">
                  <button
                    v-if="!isCurrentUser && profileUser?.role === 'vendor'"
                    class="message-btn"
                    @click="contactVendor"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>مراسلة</span>
                  </button>

                  <template v-if="isCurrentUser">
                    <button class="edit-profile-btn" @click="editProfile">تعديل الملف</button>
                    <button class="settings-btn" @click="openSettings">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </button>
                  </template>
                </div>
              </div>

              <div class="profile-stats">
                <div class="stat">
                  <span class="stat-number">{{ orders.length }}</span>
                  <span class="stat-label">طلبات</span>
                </div>
              </div>

              <div class="profile-bio">
                <div class="bio-name">{{ profileUser?.name || authStore.userName }}</div>
                <div class="bio-text">{{ userBio || 'مرحباً! أنا أستخدم تطبيق تراث' }}</div>
                <div class="bio-link" v-if="userWebsite">
                  <a :href="userWebsite" target="_blank">{{ userWebsite }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <div class="container">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-text">{{ tab.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content-container">
        <div class="container">
          <div v-if="activeTab === 'orders'" class="orders-tab">
            <div v-if="loadingOrders" class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <div v-else-if="orders.length > 0" class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card" @click="viewOrderDetails(order.id)">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-number">طلب #{{ order.orderNumber || order.id }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div class="order-status" :class="order.status">
                    {{ getOrderStatusText(order.status) }}
                  </div>
                </div>
                <div class="order-items-preview">
                  <div v-for="item in order.items?.slice(0, 3)" :key="item.id" class="order-item-preview">
                    <img :src="item.image || getDefaultImage()" :alt="item.name" class="item-thumb" @error="handleItemImageError" />
                  </div>
                  <div v-if="order.items?.length > 3" class="more-items">
                    +{{ order.items.length - 3 }}
                  </div>
                </div>
                <div class="order-footer">
                  <span class="order-total">{{ formatPrice(order.total) }} د.ت</span>
                  <span class="order-items-count">{{ order.items?.length || 0 }} منتج</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <p>لا توجد طلبات بعد</p>
              <router-link to="/products" class="shop-now-btn">تسوق الآن</router-link>
            </div>
          </div>

          <div v-else-if="activeTab === 'settings'" class="settings-tab">
            <div class="settings-list">
              <div class="setting-item" @click="changePassword">
                <div class="setting-icon">🔒</div>
                <div class="setting-content">
                  <h4>تغيير كلمة المرور</h4>
                  <p>تحديث كلمة المرور لحماية حسابك</p>
                </div>
                <div class="setting-arrow">←</div>
              </div>

              <div class="setting-item logout" @click="logout">
                <div class="setting-icon">🚪</div>
                <div class="setting-content">
                  <h4>تسجيل الخروج</h4>
                  <p>الخروج من حسابك</p>
                </div>
                <div class="setting-arrow">←</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals (same as before) -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-container">
          <div class="modal-header">
            <h3>تعديل الملف الشخصي</h3>
            <button class="close-modal" @click="showEditModal = false">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProfileChanges">
              <div class="form-group">
                <label>الاسم</label>
                <input type="text" v-model="editForm.fullName" class="form-input" required />
              </div>
              <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" v-model="editForm.email" class="form-input" dir="ltr" required />
              </div>
              <div class="form-group">
                <label>السيرة الذاتية</label>
                <textarea v-model="editForm.bio" class="form-textarea" rows="3" placeholder="اكتب شيئاً عن نفسك..."></textarea>
              </div>
              <div class="form-group">
                <label>الموقع الإلكتروني</label>
                <input type="url" v-model="editForm.website" class="form-input" dir="ltr" placeholder="https://..." />
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="showEditModal = false">إلغاء</button>
                <button type="submit" class="save-btn" :disabled="saving">
                  <span v-if="!saving">حفظ</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal-container">
          <div class="modal-header">
            <h3>تغيير كلمة المرور</h3>
            <button class="close-modal" @click="showPasswordModal = false">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePassword">
              <div class="form-group">
                <label>كلمة المرور الحالية</label>
                <input type="password" v-model="passwordForm.currentPassword" class="form-input" dir="ltr" required />
              </div>
              <div class="form-group">
                <label>كلمة المرور الجديدة</label>
                <input type="password" v-model="passwordForm.newPassword" class="form-input" dir="ltr" required minlength="6" />
              </div>
              <div class="form-group">
                <label>تأكيد كلمة المرور</label>
                <input type="password" v-model="passwordForm.confirmPassword" class="form-input" dir="ltr" required />
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="showPasswordModal = false">إلغاء</button>
                <button type="submit" class="save-btn" :disabled="changingPassword">
                  <span v-if="!changingPassword">تغيير</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showMessageModal" class="modal-overlay" @click.self="showMessageModal = false">
        <div class="modal-container message-modal">
          <div class="modal-header">
            <div class="message-header-info">
              <img :src="profileUser?.avatar || getDefaultAvatar()" class="message-avatar" />
              <div>
                <h3>{{ profileUser?.name }}</h3>
                <span class="vendor-badge">حرفي</span>
              </div>
            </div>
            <button class="close-modal" @click="showMessageModal = false">✕</button>
          </div>
          <div class="modal-body message-body">
            <div class="message-preview">
              <p>أرسل رسالة إلى {{ profileUser?.name }} للاستفسار عن المنتجات أو الخدمات</p>
            </div>
            <div class="message-input-wrapper">
              <textarea
                v-model="messageText"
                class="message-textarea"
                placeholder="اكتب رسالتك هنا..."
                rows="4"
              ></textarea>
            </div>
            <div class="message-actions">
              <button type="button" class="cancel-btn" @click="showMessageModal = false">إلغاء</button>
              <button type="button" class="send-message-btn" @click="sendMessageToVendor" :disabled="!messageText.trim() || sendingMessage">
                <span v-if="!sendingMessage">إرسال</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useMessageStore } from '../stores/messageStore'
import api from '../services/api'

// Assets imports
import defaultProfileImage from '../assets/default-profil.jpg'
import defaultCoverImage from '../assets/default-cover.jpg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const messageStore = useMessageStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(true)
const loadingOrders = ref(false)
const activeTab = ref('orders')
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showMessageModal = ref(false)
const changingPassword = ref(false)
const uploadingAvatar = ref(false)
const uploadingCover = ref(false)
const saving = ref(false)
const sendingMessage = ref(false)
const messageText = ref('')
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

const avatarInput = ref(null)
const coverInput = ref(null)
const avatarKey = ref(Date.now())
const coverImageKey = ref(Date.now())

const orders = ref([])
const userBio = ref('')
const userWebsite = ref('')
const profileUser = ref(null)

// Default images
const getDefaultAvatar = () => defaultProfileImage
const getDefaultCover = () => defaultCoverImage
const getDefaultImage = () => 'https://placehold.co/48x48/08717f/white?text=+'

const avatarUrl = ref(authStore.userAvatar || defaultProfileImage)
const coverImageUrl = ref(defaultCoverImage)

const editForm = ref({
  fullName: '',
  email: '',
  bio: '',
  website: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const tabs = ref([
  { id: 'orders', label: 'طلباتي', icon: '🛒' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' }
])

const isCurrentUser = computed(() => {
  const routeUserId = route.params.id
  return !routeUserId || routeUserId === String(authStore.user?.id)
})

const contactVendor = () => {
  if (!authStore.isAuthenticated) {
    localStorage.setItem('redirectAfterLogin', router.currentRoute.value.fullPath)
    router.push('/login')
    return
  }

  if (!profileUser.value) return

  const existingConv = messageStore.conversations.find(c =>
    c.other_user_id === profileUser.value.id
  )

  if (existingConv) {
    messageStore.openChat(existingConv)
    showNotification('✅ تم فتح المحادثة', 'success')
  } else {
    showMessageModal.value = true
  }
}

const sendMessageToVendor = async () => {
  if (!messageText.value.trim() || !profileUser.value) return

  sendingMessage.value = true
  try {
    const conversation = await messageStore.startConversation(
      profileUser.value.id,
      'vendor'
    )

    if (conversation) {
      const success = await messageStore.sendMessage(
        profileUser.value.id,
        messageText.value.trim(),
        conversation.id
      )

      if (success) {
        showNotification('✅ تم إرسال الرسالة بنجاح', 'success')
        showMessageModal.value = false
        messageText.value = ''
        messageStore.openChat(conversation)
      } else {
        showNotification('❌ فشل إرسال الرسالة', 'error')
      }
    } else {
      showNotification('❌ فشل بدء المحادثة', 'error')
    }
  } catch (error) {
    console.error('Erreur envoi message:', error)
    showNotification('❌ حدث خطأ أثناء إرسال الرسالة', 'error')
  } finally {
    sendingMessage.value = false
  }
}

const formatImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('data:image')) return url
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60))
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)

const getOrderStatusText = (status) => {
  const map = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return map[status] || status
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const compressImage = (file, maxWidth = 800, maxSizeKB = 500) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        let quality = 0.9

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let compressed = canvas.toDataURL('image/jpeg', quality)
        while (compressed.length > maxSizeKB * 1024 && quality > 0.3) {
          quality -= 0.1
          compressed = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(compressed)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    return showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning')
  }
  if (!file.type.startsWith('image/')) {
    return showNotification('الرجاء اختيار صورة صالحة', 'warning')
  }

  uploadingAvatar.value = true
  try {
    const compressedImage = await compressImage(file, 300, 500)
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.success) {
      const newAvatarUrl = response.data.avatar || response.data.user?.avatar
      if (newAvatarUrl) {
        avatarUrl.value = formatImageUrl(newAvatarUrl)
        avatarKey.value = Date.now()
        localStorage.setItem('userAvatar', avatarUrl.value)
        showNotification('✅ تم تحديث الصورة الشخصية بنجاح')
      }
    } else {
      avatarUrl.value = compressedImage
      avatarKey.value = Date.now()
      localStorage.setItem('userAvatar', avatarUrl.value)
      showNotification('✅ تم تحديث الصورة الشخصية (محلياً)', 'success')
    }
  } catch (error) {
    console.error('Upload error:', error)
    const compressedImage = await compressImage(file, 300, 500)
    avatarUrl.value = compressedImage
    avatarKey.value = Date.now()
    localStorage.setItem('userAvatar', avatarUrl.value)
    showNotification('⚠️ تم حفظ الصورة محلياً', 'warning')
  } finally {
    uploadingAvatar.value = false
    event.target.value = ''
  }
}

const openCoverUpload = () => coverInput.value?.click()

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    return showNotification('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'warning')
  }

  uploadingCover.value = true
  try {
    const compressedImage = await compressImage(file, 1200, 500)
    coverImageUrl.value = compressedImage
    coverImageKey.value = Date.now()
    localStorage.setItem('userCover', coverImageUrl.value)
    showNotification('✅ تم تحديث صورة الغلاف بنجاح')
  } catch (error) {
    console.error('Cover upload error:', error)
    showNotification('❌ فشل تحديث صورة الغلاف', 'error')
  } finally {
    uploadingCover.value = false
    event.target.value = ''
  }
}

const loadProfileData = async () => {
  const userId = route.params.id

  if (!userId || userId === String(authStore.user?.id)) {
    profileUser.value = {
      id: authStore.user?.id,
      name: authStore.userName,
      email: authStore.userEmail,
      avatar: authStore.userAvatar,
      role: authStore.userRole
    }
    return
  }

  try {
    const response = await api.get(`/users/${userId}`)
    if (response.data.success) {
      profileUser.value = response.data.data.user || response.data.data
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    showNotification('❌ فشل تحميل الملف الشخصي', 'error')
  }
}

const loadOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await api.get('/orders/my-orders')
    if (response.data.success) {
      orders.value = response.data.data || response.data.orders || []
    }
  } catch (error) {
    console.error('Error loading orders:', error)
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}

const editProfile = () => {
  editForm.value = {
    fullName: authStore.userName || '',
    email: authStore.userEmail || '',
    bio: userBio.value,
    website: userWebsite.value
  }
  showEditModal.value = true
}

const saveProfileChanges = async () => {
  saving.value = true
  try {
    await authStore.updateProfile({
      name: editForm.value.fullName,
      email: editForm.value.email
    })
    userBio.value = editForm.value.bio
    userWebsite.value = editForm.value.website
    localStorage.setItem('userBio', userBio.value)
    localStorage.setItem('userWebsite', userWebsite.value)
    showNotification('✅ تم حفظ التغييرات بنجاح')
    showEditModal.value = false
  } catch (error) {
    showNotification('❌ حدث خطأ أثناء الحفظ', 'error')
  } finally {
    saving.value = false
  }
}

const changePassword = () => {
  showPasswordModal.value = true
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}

const savePassword = async () => {
  if (passwordForm.value.newPassword.length < 6) {
    return showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning')
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return showNotification('كلمة المرور غير متطابقة', 'warning')
  }

  changingPassword.value = true
  try {
    await api.patch('/users/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    showNotification('✅ تم تغيير كلمة المرور بنجاح')
    showPasswordModal.value = false
  } catch (error) {
    showNotification('❌ كلمة المرور الحالية غير صحيحة', 'error')
  } finally {
    changingPassword.value = false
  }
}

const viewOrderDetails = (orderId) => router.push(`/order/${orderId}`)
const openSettings = () => (activeTab.value = 'settings')

const logout = () => {
  authStore.logout()
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('userCover')
  showNotification('👋 تم تسجيل الخروج بنجاح')
  setTimeout(() => router.push('/login'), 1500)
}

const handleAvatarError = (e) => { e.target.src = defaultProfileImage }
const handleCoverError = (e) => { e.target.src = defaultCoverImage }
const handleItemImageError = (e) => { e.target.src = getDefaultImage() }

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await messageStore.init()
  await loadProfileData()

  const savedAvatar = localStorage.getItem('userAvatar')
  if (savedAvatar) avatarUrl.value = savedAvatar
  else avatarUrl.value = defaultProfileImage

  const savedCover = localStorage.getItem('userCover')
  if (savedCover) coverImageUrl.value = savedCover
  else coverImageUrl.value = defaultCoverImage

  userBio.value = localStorage.getItem('userBio') || ''
  userWebsite.value = localStorage.getItem('userWebsite') || ''

  if (isCurrentUser.value) {
    await loadOrders()
  } else {
    tabs.value = []
  }

  setTimeout(() => { loading.value = false }, 500)
})

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })
</script>

<style scoped>
/* Import Amiri font */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* Base styles with Amiri font */
.profile-page,
.profile-page * {
  font-family: 'Amiri', 'Traditional Arabic', 'Segoe UI', serif;
}

.profile-page {
  background: #fafafa;
  min-height: 100vh;
}

.profile-page.dark-mode {
  background: #000000;
  color: #ffffff;
}

/* Container */
.container {
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Cover styles */
.cover-container {
  position: relative;
  height: 200px;
  background: #efefef;
}

.dark-mode .cover-container {
  background: #1a1a1a;
}

.cover-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
}

.edit-cover-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0,0,0,0.6);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  font-family: 'Amiri', serif;
}

.edit-cover-btn:hover {
  background: rgba(0,0,0,0.8);
  transform: scale(1.02);
}

/* Profile Header */
.profile-header {
  margin-top: -60px;
  margin-bottom: 24px;
}

.profile-info-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-end;
}

/* Avatar Section */
.avatar-section {
  position: relative;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.profile-avatar:hover {
  transform: scale(1.02);
}

.dark-mode .profile-avatar {
  border-color: #000000;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 32px;
  height: 32px;
  background: #0095f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

.avatar-wrapper:hover .avatar-edit-btn {
  opacity: 1;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

.avatar-edit-btn svg {
  stroke: white;
  width: 16px;
  height: 16px;
}

.verified-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 24px;
  height: 24px;
  background: #0095f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.verified-badge svg {
  width: 14px;
  height: 14px;
  fill: white;
}

/* Info Section */
.info-section {
  flex: 1;
  padding-bottom: 20px;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.username {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  margin: 0;
  font-family: 'Amiri', serif;
}

.dark-mode .username {
  color: #ffffff;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.message-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  background: #0095f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Amiri', serif;
}

.message-btn:hover {
  background: #0077cc;
  transform: translateY(-1px);
}

.edit-profile-btn {
  padding: 7px 16px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Amiri', serif;
}

.edit-profile-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.dark-mode .edit-profile-btn {
  background: #363636;
  color: white;
}

.dark-mode .edit-profile-btn:hover {
  background: #404040;
}

.settings-btn {
  width: 32px;
  height: 32px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.dark-mode .settings-btn {
  background: #363636;
}

.dark-mode .settings-btn:hover {
  background: #404040;
}

/* Stats */
.profile-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
}

.dark-mode .stat-number {
  color: #ffffff;
}

.stat-label {
  font-size: 16px;
  color: #8e8e8e;
}

/* Bio */
.profile-bio {
  margin-bottom: 10px;
}

.bio-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
  color: #262626;
}

.dark-mode .bio-name {
  color: #ffffff;
}

.bio-text {
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
  line-height: 1.5;
}

.dark-mode .bio-text {
  color: #ffffff;
}

.bio-link a {
  font-size: 14px;
  color: #00376b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.bio-link a:hover {
  text-decoration: underline;
}

.dark-mode .bio-link a {
  color: #0095f6;
}

/* Tabs */
.tabs-container {
  border-top: 1px solid #dbdbdb;
}

.dark-mode .tabs-container {
  border-top-color: #262626;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #8e8e8e;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  font-family: 'Amiri', serif;
}

.tab-btn:hover {
  color: #262626;
}

.dark-mode .tab-btn:hover {
  color: #ffffff;
}

.tab-btn.active {
  color: #262626;
}

.dark-mode .tab-btn.active {
  color: #ffffff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: #262626;
}

.dark-mode .tab-btn.active::after {
  background: #ffffff;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  stroke: #8e8e8e;
  margin-bottom: 20px;
}

.empty-state p {
  color: #8e8e8e;
  font-size: 16px;
  margin-bottom: 20px;
}

.shop-now-btn {
  display: inline-block;
  padding: 8px 24px;
  background: #0095f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  font-family: 'Amiri', serif;
}

.shop-now-btn:hover {
  background: #0077cc;
  transform: translateY(-1px);
}

/* Orders */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #dbdbdb;
}

.dark-mode .order-card {
  background: #1a1a1a;
  border-color: #262626;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.order-number {
  font-weight: 700;
  font-size: 14px;
}

.order-date {
  font-size: 12px;
  color: #8e8e8e;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.order-status.pending { background: #fff3cd; color: #856404; }
.order-status.processing { background: #cce5ff; color: #004085; }
.order-status.shipped { background: #d1ecf1; color: #0c5460; }
.order-status.delivered { background: #d4edda; color: #155724; }
.order-status.completed { background: #d4edda; color: #155724; }
.order-status.cancelled { background: #f8d7da; color: #721c24; }

.order-items-preview {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.item-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.more-items {
  width: 48px;
  height: 48px;
  background: #efefef;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.dark-mode .more-items {
  background: #262626;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #efefef;
}

.dark-mode .order-footer {
  border-top-color: #262626;
}

.order-total {
  font-weight: 700;
  color: #d40025;
  font-size: 16px;
}

.order-items-count {
  font-size: 12px;
  color: #8e8e8e;
}

/* Settings */
.settings-list {
  max-width: 600px;
  margin: 20px auto;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  border: 1px solid #dbdbdb;
}

.dark-mode .setting-item {
  background: #1a1a1a;
  border-color: #262626;
}

.setting-item:hover {
  transform: translateX(-4px);
  border-color: #0095f6;
}

.setting-item.logout:hover {
  border-color: #ed4956;
}

.setting-icon {
  font-size: 24px;
}

.setting-content {
  flex: 1;
}

.setting-content h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 2px;
  font-family: 'Amiri', serif;
}

.setting-content p {
  font-size: 12px;
  color: #8e8e8e;
  margin: 0;
}

.setting-arrow {
  font-size: 18px;
  color: #8e8e8e;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.dark-mode .modal-container {
  background: #1a1a1a;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dbdbdb;
}

.dark-mode .modal-header {
  border-bottom-color: #262626;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  font-family: 'Amiri', serif;
}

.close-modal {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-modal:hover {
  transform: scale(1.1);
}

.modal-body {
  padding: 20px;
}

/* Forms */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: 'Amiri', serif;
}

.dark-mode .form-input,
.dark-mode .form-textarea {
  background: #262626;
  border-color: #363636;
  color: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0095f6;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Amiri', serif;
  font-size: 14px;
}

.cancel-btn {
  background: #efefef;
  border: none;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.dark-mode .cancel-btn {
  background: #363636;
  color: white;
}

.dark-mode .cancel-btn:hover {
  background: #404040;
}

.save-btn {
  background: #0095f6;
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0077cc;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message Modal */
.message-modal {
  max-width: 450px;
}

.message-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.vendor-badge {
  font-size: 12px;
  background: #08717f;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  display: inline-block;
}

.message-body {
  padding: 20px;
}

.message-preview {
  background: #f0fdf4;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.message-preview p {
  margin: 0;
  color: #15803d;
  font-size: 14px;
}

.dark-mode .message-preview {
  background: #1a3a2a;
}

.dark-mode .message-preview p {
  color: #4ade80;
}

.message-textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: 'Amiri', serif;
  transition: border-color 0.2s;
}

.dark-mode .message-textarea {
  background: #262626;
  border-color: #363636;
  color: white;
}

.message-textarea:focus {
  outline: none;
  border-color: #0095f6;
}

.message-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.send-message-btn {
  flex: 1;
  padding: 12px;
  background: #0095f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Amiri', serif;
}

.send-message-btn:hover:not(:disabled) {
  background: #0077cc;
}

.send-message-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #262626;
  border-radius: 24px;
  color: white;
  z-index: 2000;
  animation: slideUp 0.3s ease;
  font-family: 'Amiri', serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-notification.success { background: #262626; }
.toast-notification.error { background: #ed4956; }
.toast-notification.warning { background: #f5a623; }
.toast-notification.info { background: #0095f6; }

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: toastProgress 3s linear forwards;
  border-radius: 0 0 24px 24px;
}

/* Loaders */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.instagram-loader {
  text-align: center;
}

.loader-ring {
  width: 44px;
  height: 44px;
  border: 3px solid #dbdbdb;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loader-logo {
  font-size: 24px;
  margin-bottom: 16px;
}

.loading-spinner {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dbdbdb;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0; }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive Design */
@media (max-width: 735px) {
  .profile-info-wrapper {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .profile-stats {
    justify-content: center;
  }

  .username-row {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons {
    justify-content: center;
  }

  .tabs {
    gap: 30px;
  }

  .tab-text {
    display: none;
  }

  .tab-icon {
    font-size: 20px;
  }

  .container {
    padding: 0 16px;
  }

  .cover-container {
    height: 150px;
  }

  .edit-cover-btn span {
    display: none;
  }

  .edit-cover-btn svg {
    margin: 0;
  }

  .edit-cover-btn {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .profile-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 16px;
  }

  .stat-label {
    font-size: 14px;
  }

  .username {
    font-size: 22px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
