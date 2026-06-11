<!-- frontend/src/views/Profile.vue - VERSION FINALE CORRIGÉE 100% -->
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

                  <!-- ✅ Correction: Seulement le bouton تعديل الملف sans icône paramètre -->
<button
  v-if="isCurrentUser"
  class="edit-profile-btn"
  @click="() => { console.log('🖱️ Bouton cliqué!'); editProfile(); }"
>
  تعديل الملف
</button>
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
                <div class="bio-text">{{ userBio || 'مرحباً! أنا أستخدم تطبيق اصالة' }}</div>
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
                    <img :src="getImageUrl(item.image)" :alt="item.name" class="item-thumb" @error="handleItemImageError" />
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

          <!-- ✅ Onglet Paramètres conservé mais accessible uniquement via les tabs -->
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

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>تعديل الملف الشخصي</h3>
          <button class="close-modal" @click="showEditModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input v-model="editForm.fullName" class="form-input" type="text" />
          </div>
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input v-model="editForm.email" class="form-input" type="email" />
          </div>
          <div class="form-group">
            <label>نبذة تعريفية</label>
            <textarea v-model="editForm.bio" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>الموقع الإلكتروني</label>
            <input v-model="editForm.website" class="form-input" type="url" />
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="showEditModal = false">إلغاء</button>
            <button class="save-btn" @click="saveProfileChanges" :disabled="saving">
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>تغيير كلمة المرور</h3>
          <button class="close-modal" @click="showPasswordModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>كلمة المرور الحالية</label>
            <input v-model="passwordForm.currentPassword" class="form-input" type="password" />
          </div>
          <div class="form-group">
            <label>كلمة المرور الجديدة</label>
            <input v-model="passwordForm.newPassword" class="form-input" type="password" />
          </div>
          <div class="form-group">
            <label>تأكيد كلمة المرور الجديدة</label>
            <input v-model="passwordForm.confirmPassword" class="form-input" type="password" />
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="showPasswordModal = false">إلغاء</button>
            <button class="save-btn" @click="savePassword" :disabled="changingPassword">
              {{ changingPassword ? 'جاري التغيير...' : 'تغيير' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="modal-overlay" @click.self="showMessageModal = false">
      <div class="modal-container message-modal">
        <div class="modal-header">
          <div class="message-header-info">
            <img :src="getImageUrl(profileUser?.avatar)" class="message-avatar" />
            <div>
              <h3>{{ profileUser?.name }}</h3>
              <span class="vendor-badge">بائع</span>
            </div>
          </div>
          <button class="close-modal" @click="showMessageModal = false">✕</button>
        </div>
        <div class="message-body">
          <div class="message-preview">
            <p>💬 أرسل رسالة إلى {{ profileUser?.name }} للاستفسار عن المنتجات</p>
          </div>
          <textarea
            v-model="messageText"
            class="message-textarea"
            rows="4"
            placeholder="اكتب رسالتك هنا..."
          ></textarea>
          <div class="message-actions">
            <button class="cancel-btn" @click="showMessageModal = false">إلغاء</button>
            <button class="send-message-btn" @click="sendMessageToVendor" :disabled="sendingMessage || !messageText.trim()">
              {{ sendingMessage ? 'جاري الإرسال...' : 'إرسال' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
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

// ✅ UN SEUL import pour les images par défaut + formatImageUrl
import { DEFAULT_AVATAR, formatImageUrl } from '../utils/image'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const messageStore = useMessageStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ✅ Utiliser les constantes importées
const defaultProfileImage = DEFAULT_AVATAR

// ✅ Fonction getImageUrl qui utilise formatImageUrl de image.js
const getImageUrl = (url) => {
  if (!url) return defaultProfileImage

  // Utiliser formatImageUrl pour gérer tous les cas (Cloudinary, backend, local)
  const formatted = formatImageUrl(url, { fallback: defaultProfileImage, transformations: 'f_auto,q_auto' })
  return formatted || defaultProfileImage
}

const avatarUrl = ref(getImageUrl(authStore.userAvatar) || defaultProfileImage)

// State
const loading = ref(true)
const loadingOrders = ref(false)
const activeTab = ref('orders')
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const showMessageModal = ref(false)
const changingPassword = ref(false)
const uploadingAvatar = ref(false)
const saving = ref(false)
const sendingMessage = ref(false)
const messageText = ref('')
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })
const avatarInput = ref(null)
const avatarKey = ref(Date.now())
const orders = ref([])
const userBio = ref('')
const userWebsite = ref('')
const profileUser = ref(null)

const getDefaultImage = () => 'https://placehold.co/48x48/08717f/white?text=+'

const editForm = ref({ fullName: '', email: '', bio: '', website: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const tabs = ref([
  { id: 'orders', label: 'طلباتي', icon: '🛒' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' }
])

const isCurrentUser = computed(() => {
  const routeUserId = route.params.id
  return !routeUserId || routeUserId === String(authStore.user?.id)
})

// ✅ Toutes les fonctions utilitaires
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
    pending: 'قيد الانتظار', processing: 'قيد المعالجة', shipped: 'تم الشحن',
    delivered: 'تم التوصيل', completed: 'مكتمل', cancelled: 'ملغي'
  }
  return map[status] || status
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ✅ Fonctions de chargement de données
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
    showNotification('❌ فشل تحميل الملف الشخصي', 'error')
  }
}

// Dans Profile.vue - Remplacer la fonction loadOrders
const loadOrders = async () => {
  loadingOrders.value = true
  try {
    console.log('📦 [Profile] Chargement des commandes...')

    // ✅ 1. Essayer de charger depuis l'API
    let apiOrders = []
    try {
      const response = await api.get('/orders/my-orders')
      console.log('📦 [Profile] Réponse API:', response.data)

      if (response.data.success) {
        apiOrders = response.data.data || response.data.orders || []
        console.log('✅ [Profile] Commandes API:', apiOrders.length)
      }
    } catch (apiError) {
      console.error('❌ [Profile] Erreur API:', apiError.message)
    }

    // ✅ 2. Charger les commandes locales (si l'API a échoué)
    let localOrders = []
    try {
      const saved = localStorage.getItem('userOrders')
      if (saved) {
        localOrders = JSON.parse(saved)
        console.log('📦 [Profile] Commandes locales:', localOrders.length)
      }
    } catch (e) {
      console.error('❌ [Profile] Erreur localStorage:', e)
    }

    // ✅ 3. Fusionner les commandes (API + locales)
    const allOrders = [...apiOrders]

    // Ajouter les commandes locales qui ne sont pas déjà dans l'API
    for (const localOrder of localOrders) {
      const exists = allOrders.find(o =>
        o.orderNumber === localOrder.orderNumber ||
        o.id === localOrder.id
      )
      if (!exists) {
        allOrders.push(localOrder)
      }
    }

    // ✅ 4. Trier par date
    allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    orders.value = allOrders
    console.log('✅ [Profile] Total commandes:', orders.value.length)

  } catch (error) {
    console.error('❌ [Profile] Erreur chargement commandes:', error.message)
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}
// ✅ Fonctions de contact et messagerie
const contactVendor = () => {
  if (!authStore.isAuthenticated) {
    localStorage.setItem('redirectAfterLogin', router.currentRoute.value.fullPath)
    router.push('/login')
    return
  }
  if (!profileUser.value) return
  const existingConv = messageStore.conversations.find(c => c.other_user_id === profileUser.value.id)
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
    const conversation = await messageStore.startConversation(profileUser.value.id, 'vendor')
    if (conversation) {
      const success = await messageStore.sendMessage(profileUser.value.id, messageText.value.trim(), conversation.id)
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
    showNotification('❌ حدث خطأ', 'error')
  } finally {
    sendingMessage.value = false
  }
}

// ✅ Fonction de compression d'image
const compressImage = (file, maxWidth = 800, maxSizeKB = 500) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width, height = img.height, quality = 0.9
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth }
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        let compressed = canvas.toDataURL('image/jpeg', quality)
        while (compressed.length > maxSizeKB * 1024 && quality > 0.3) { quality -= 0.1; compressed = canvas.toDataURL('image/jpeg', quality) }
        resolve(compressed)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

// ✅ Upload avatar
const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning')
  if (!file.type.startsWith('image/')) return showNotification('الرجاء اختيار صورة صالحة', 'warning')

  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (response.data.success) {
      const newAvatarUrl = response.data.avatar || response.data.user?.avatar
      if (newAvatarUrl) {
        const resolved = getImageUrl(newAvatarUrl)
        avatarUrl.value = resolved || defaultProfileImage
        avatarKey.value = Date.now()
        localStorage.setItem('userAvatar', avatarUrl.value)
        showNotification('✅ تم تحديث الصورة الشخصية بنجاح')
      }
    } else {
      const compressedImage = await compressImage(file, 300, 500)
      avatarUrl.value = compressedImage
      avatarKey.value = Date.now()
      localStorage.setItem('userAvatar', avatarUrl.value)
      showNotification('✅ تم تحديث الصورة الشخصية (محلياً)', 'success')
    }
  } catch (error) {
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

// ✅ Édition du profil - FONCTIONNELLE MAINTENANT
// ✅ CORRECTION 1 : Mettre à jour la fonction editProfile
const editProfile = () => {
  console.log('🔄 [Profile] Ouverture du modal de modification...')

  // S'assurer que les données sont bien chargées
  editForm.value = {
    fullName: authStore.userName || authStore.user?.name || '',
    email: authStore.userEmail || authStore.user?.email || '',
    bio: userBio.value || localStorage.getItem('userBio') || '',
    website: userWebsite.value || localStorage.getItem('userWebsite') || ''
  }

  console.log('📝 [Profile] Formulaire initialisé:', editForm.value)
  showEditModal.value = true
}

// ✅ CORRECTION 2 : Améliorer saveProfileChanges
const saveProfileChanges = async () => {
  saving.value = true
  try {
    console.log('💾 [Profile] Sauvegarde du profil avec:', editForm.value)

    // Mettre à jour via le store
    const result = await authStore.updateProfile({
      name: editForm.value.fullName,
      email: editForm.value.email
    })

    if (result && result.success) {
      // Sauvegarder les données supplémentaires
      userBio.value = editForm.value.bio
      userWebsite.value = editForm.value.website

      localStorage.setItem('userBio', userBio.value)
      localStorage.setItem('userWebsite', userWebsite.value)

      showNotification('✅ تم حفظ التغييرات بنجاح')
      showEditModal.value = false
    } else {
      // Même si l'API échoue, sauvegarder localement
      userBio.value = editForm.value.bio
      userWebsite.value = editForm.value.website

      localStorage.setItem('userBio', userBio.value)
      localStorage.setItem('userWebsite', userWebsite.value)

      showNotification('⚠️ تم حفظ التغييرات محلياً', 'warning')
      showEditModal.value = false
    }
  } catch (error) {
    console.error('❌ [Profile] Erreur sauvegarde:', error)

    // Sauvegarder localement en cas d'erreur
    userBio.value = editForm.value.bio
    userWebsite.value = editForm.value.website

    localStorage.setItem('userBio', userBio.value)
    localStorage.setItem('userWebsite', userWebsite.value)

    showNotification('⚠️ تم حفظ التغييرات محلياً', 'warning')
    showEditModal.value = false
  } finally {
    saving.value = false
  }
}
// ✅ Changement de mot de passe
const changePassword = () => {
  showPasswordModal.value = true
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}

const savePassword = async () => {
  if (passwordForm.value.newPassword.length < 6) return showNotification('كلمة المرور 6 أحرف على الأقل', 'warning')
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) return showNotification('كلمة المرور غير متطابقة', 'warning')
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

// ✅ Navigation
const viewOrderDetails = (orderId) => router.push(`/order/${orderId}`)

// ✅ Fonction logout corrigée
const logout = () => {
  authStore.logout()
  localStorage.removeItem('userAvatar')
  showNotification('👋 تم تسجيل الخروج بنجاح')
  setTimeout(() => router.push('/login'), 1500)
}

// ✅ Gestionnaires d'erreurs d'images
const handleAvatarError = (e) => { e.target.src = defaultProfileImage }
const handleItemImageError = (e) => { e.target.src = getDefaultImage() }

// ✅ Initialisation
onMounted(async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  await messageStore.init()
  await loadProfileData()

  // ✅ Utiliser userAvatar du store (qui utilise déjà formatImageUrl)
  avatarUrl.value = authStore.userAvatar || defaultProfileImage

  userBio.value = localStorage.getItem('userBio') || ''
  userWebsite.value = localStorage.getItem('userWebsite') || ''

  if (isCurrentUser.value) await loadOrders()
  else tabs.value = []
  setTimeout(() => { loading.value = false }, 500)
})

watch(isDarkMode, (newValue) => {
  if (newValue) document.body.classList.add('dark-mode')
  else document.body.classList.remove('dark-mode')
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== BASE ===== */
.profile-page, .profile-page * { font-family: 'Amiri', 'Traditional Arabic', 'Segoe UI', serif; }
.profile-page { background: #fafafa; min-height: 100vh; }

/* ===== DARK MODE - FOND PRINCIPAL ===== */
.profile-page.dark-mode {
  background: #161627;
  color: #ffffff;
}

.container { max-width: 935px; margin: 0 auto; padding: 0 20px; }

/* ===== PROFILE HEADER ===== */
.profile-header { margin-top: 30px; margin-bottom: 24px; }
.profile-info-wrapper { display: flex; gap: 30px; align-items: flex-end; }

.avatar-section { position: relative; }
.avatar-wrapper { position: relative; width: 150px; height: 150px; }
.profile-avatar {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}
.profile-avatar:hover { transform: scale(1.02); }

/* Dark mode - bordure avatar */
.profile-page.dark-mode .profile-avatar {
  border-color: #161627;
}

.avatar-edit-btn {
  position: absolute; bottom: 5px; right: 5px; width: 32px; height: 32px;
  background: #0095f6; border: none; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s, transform 0.2s;
}
.avatar-wrapper:hover .avatar-edit-btn { opacity: 1; }
.avatar-edit-btn:hover { transform: scale(1.1); }
.avatar-edit-btn svg { stroke: white; width: 16px; height: 16px; }

.verified-badge {
  position: absolute; bottom: 5px; left: 5px; width: 24px; height: 24px;
  background: #0095f6; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; border: 2px solid white;
}
.verified-badge svg { width: 14px; height: 14px; fill: white; }

/* ===== INFO SECTION ===== */
.info-section { flex: 1; padding-bottom: 20px; }
.username-row { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.username { font-size: 28px; font-weight: 700; color: #262626; margin: 0; }

/* Dark mode - username */
.profile-page.dark-mode .username { color: #ffffff; }

.action-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

.message-btn {
  display: flex; align-items: center; gap: 8px; padding: 7px 16px;
  background: #0095f6; border: none; border-radius: 8px; color: white;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.message-btn:hover { background: #0077cc; transform: translateY(-1px); }

/* ✅ Bouton تعديل الملف - STYLE CORRIGÉ */
.edit-profile-btn {
  padding: 7px 16px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #262626;
}
.edit-profile-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* Dark mode - bouton تعديل الملف */
.profile-page.dark-mode .edit-profile-btn {
  background: #2a2a40;
  color: #ffffff;
}

/* ===== STATS ===== */
.profile-stats { display: flex; gap: 40px; margin-bottom: 20px; }
.stat { display: flex; align-items: center; gap: 5px; }
.stat-number { font-size: 18px; font-weight: 700; color: #262626; }

.profile-page.dark-mode .stat-number { color: #ffffff; }

.stat-label { font-size: 16px; color: #8e8e8e; }

.profile-page.dark-mode .stat-label { color: #94a3b8; }

/* ===== BIO ===== */
.profile-bio { margin-bottom: 10px; }
.bio-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #262626; }
.bio-text { font-size: 14px; color: #262626; margin-bottom: 4px; line-height: 1.5; }
.bio-link a { font-size: 14px; color: #00376b; text-decoration: none; }

.profile-page.dark-mode .bio-name,
.profile-page.dark-mode .bio-text { color: #ffffff; }
.profile-page.dark-mode .bio-link a { color: #2dd4bf; }

/* ===== TABS ===== */
.tabs-container { border-top: 1px solid #dbdbdb; }

.profile-page.dark-mode .tabs-container { border-top-color: #2a2a40; }

.tabs { display: flex; justify-content: center; gap: 60px; }
.tab-btn {
  display: flex; align-items: center; gap: 6px; padding: 16px 0;
  background: none; border: none; font-size: 13px; font-weight: 600;
  color: #8e8e8e; cursor: pointer; position: relative; transition: color 0.2s;
}
.tab-btn:hover { color: #262626; }
.tab-btn.active { color: #262626; }
.tab-btn.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 1px; background: #262626;
}

.profile-page.dark-mode .tab-btn { color: #94a3b8; }
.profile-page.dark-mode .tab-btn:hover,
.profile-page.dark-mode .tab-btn.active { color: #ffffff; }
.profile-page.dark-mode .tab-btn.active::after { background: #2dd4bf; }

/* ===== EMPTY STATE ===== */
.empty-state { text-align: center; padding: 80px 20px; }
.empty-state svg { width: 64px; height: 64px; stroke: #8e8e8e; margin-bottom: 20px; }
.empty-state p { color: #8e8e8e; font-size: 16px; margin-bottom: 20px; }

.profile-page.dark-mode .empty-state svg { stroke: #64748b; }
.profile-page.dark-mode .empty-state p { color: #94a3b8; }

.shop-now-btn {
  display: inline-block; padding: 8px 24px; background: #0095f6;
  color: white; text-decoration: none; border-radius: 8px; font-weight: 600;
}
.shop-now-btn:hover { background: #0077cc; }

/* ===== ORDERS ===== */
.orders-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
.order-card {
  background: white; border-radius: 12px; padding: 16px;
  cursor: pointer; transition: transform 0.2s; border: 1px solid #dbdbdb;
}

.profile-page.dark-mode .order-card {
  background: #1e1e30;
  border-color: #2a2a40;
}

.order-card:hover { transform: translateY(-2px); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-number { font-weight: 700; font-size: 14px; }

.profile-page.dark-mode .order-number { color: #ffffff; }

.order-date { font-size: 12px; color: #8e8e8e; }

.order-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.order-status.pending { background: #fff3cd; color: #856404; }
.order-status.processing { background: #cce5ff; color: #004085; }
.order-status.shipped { background: #d1ecf1; color: #0c5460; }
.order-status.delivered, .order-status.completed { background: #d4edda; color: #155724; }
.order-status.cancelled { background: #f8d7da; color: #721c24; }

.order-items-preview { display: flex; gap: 8px; margin-bottom: 12px; }
.item-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
.more-items {
  width: 48px; height: 48px; background: #efefef; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}

.profile-page.dark-mode .more-items {
  background: #2a2a40;
  color: #ffffff;
}

.order-footer { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #efefef; }

.profile-page.dark-mode .order-footer { border-top-color: #2a2a40; }

.order-total { font-weight: 700; color: #d40025; font-size: 16px; }

.profile-page.dark-mode .order-total { color: #2dd4bf; }

/* ===== SETTINGS ===== */
.settings-list { max-width: 600px; margin: 20px auto; }
.setting-item {
  display: flex; align-items: center; gap: 16px; padding: 16px;
  background: white; border-radius: 12px; cursor: pointer;
  margin-bottom: 8px; border: 1px solid #dbdbdb; transition: all 0.2s;
}

.profile-page.dark-mode .setting-item {
  background: #1e1e30;
  border-color: #2a2a40;
}

.setting-item:hover { transform: translateX(-4px); border-color: #0095f6; }
.setting-item.logout:hover { border-color: #ed4956; }
.setting-icon { font-size: 24px; }
.setting-content { flex: 1; }
.setting-content h4 { font-size: 14px; font-weight: 700; }

.profile-page.dark-mode .setting-content h4 { color: #ffffff; }

.setting-content p { font-size: 12px; color: #8e8e8e; margin: 0; }

.profile-page.dark-mode .setting-content p { color: #94a3b8; }

.setting-arrow { font-size: 18px; color: #8e8e8e; }

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-container {
  background: white; border-radius: 12px; width: 90%;
  max-width: 500px; max-height: 90vh; overflow-y: auto;
}

.profile-page.dark-mode .modal-container {
  background: #1e1e30;
  border: 1px solid #2a2a40;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; border-bottom: 1px solid #dbdbdb;
}

.profile-page.dark-mode .modal-header {
  border-bottom-color: #2a2a40;
}

.modal-header h3 { font-size: 18px; font-weight: 700; margin: 0; }

.profile-page.dark-mode .modal-header h3 { color: #ffffff; }

.close-modal {
  width: 32px; height: 32px; background: none; border: none;
  font-size: 20px; cursor: pointer; color: #64748b;
}

.profile-page.dark-mode .close-modal { color: #94a3b8; }

.close-modal:hover { transform: scale(1.1); color: #d40025; }

.modal-body { padding: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }

.profile-page.dark-mode .form-group label { color: #cbd5e1; }

.form-input, .form-textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #dbdbdb;
  border-radius: 8px; font-size: 14px;
}

.profile-page.dark-mode .form-input,
.profile-page.dark-mode .form-textarea {
  background: #121220;
  border-color: #2a2a40;
  color: #ffffff;
}

.form-input:focus, .form-textarea:focus { outline: none; border-color: #0095f6; }

.form-actions { display: flex; gap: 12px; margin-top: 20px; }
.cancel-btn, .save-btn {
  flex: 1; padding: 10px; border-radius: 8px;
  font-weight: 600; cursor: pointer; font-size: 14px;
}
.cancel-btn { background: #efefef; border: none; }

.profile-page.dark-mode .cancel-btn {
  background: #2a2a40;
  color: #ffffff;
}

.save-btn { background: #0095f6; border: none; color: white; }
.save-btn:disabled { opacity: 0.6; }

/* ===== MESSAGE MODAL ===== */
.message-modal { max-width: 450px; }
.message-header-info { display: flex; align-items: center; gap: 12px; }
.message-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
.vendor-badge { font-size: 12px; background: #08717f; color: white; padding: 2px 10px; border-radius: 20px; }
.message-body { padding: 20px; }
.message-preview { background: #f0fdf4; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center; }

.profile-page.dark-mode .message-preview {
  background: #1a2e1a;
}

.message-preview p { margin: 0; color: #15803d; }

.profile-page.dark-mode .message-preview p { color: #34d399; }

.message-textarea {
  width: 100%; padding: 14px; border: 1px solid #dbdbdb;
  border-radius: 12px; font-size: 14px; resize: vertical;
}

.profile-page.dark-mode .message-textarea {
  background: #121220;
  border-color: #2a2a40;
  color: #ffffff;
}

.message-actions { display: flex; gap: 12px; margin-top: 20px; }
.send-message-btn {
  flex: 1; padding: 12px; background: #0095f6; border: none;
  border-radius: 8px; color: white; font-weight: 600; cursor: pointer;
}
.send-message-btn:disabled { opacity: 0.6; }

/* ===== TOAST ===== */
.toast-notification {
  position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px; padding: 12px 20px;
  background: #262626; border-radius: 24px; color: white;
  z-index: 2000; animation: slideUp 0.3s ease;
}
.toast-notification.success { background: #262626; }
.toast-notification.error { background: #ed4956; }
.toast-progress {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: toastProgress 3s linear forwards;
}

/* ===== LOADING ===== */
.loading-state { display: flex; align-items: center; justify-content: center; height: 100vh; }

.profile-page.dark-mode .loading-state { background: #161627; }

.instagram-loader { text-align: center; }
.loader-ring {
  width: 44px; height: 44px; border: 3px solid #dbdbdb;
  border-top-color: #0095f6; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 16px;
}

.profile-page.dark-mode .loader-ring {
  border-color: #2a2a40;
  border-top-color: #2dd4bf;
}

.spinner {
  width: 32px; height: 32px; border: 3px solid #dbdbdb;
  border-top-color: #0095f6; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto;
}

.profile-page.dark-mode .spinner {
  border-color: #2a2a40;
  border-top-color: #2dd4bf;
}

.profile-page.dark-mode .loading-state p { color: #94a3b8; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toastProgress { from { width: 100%; } to { width: 0; } }

/* ===== RESPONSIVE ===== */
@media (max-width: 735px) {
  .profile-info-wrapper { flex-direction: column; align-items: center; text-align: center; gap: 16px; }
  .avatar-wrapper { width: 100px; height: 100px; }
  .profile-stats { justify-content: center; }
  .username-row { flex-direction: column; gap: 10px; }
  .tabs { gap: 30px; }
  .tab-text { display: none; }
}
</style>
