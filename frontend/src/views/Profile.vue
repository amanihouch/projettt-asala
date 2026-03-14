<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page" dir="rtl">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الملف الشخصي...</p>
    </div>

    <template v-else>
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="container">
          <div class="profile-info">
            <div class="avatar-section">
              <img :src="authStore.userAvatar" :alt="authStore.userName" class="profile-avatar" />
              <button class="change-avatar-btn" @click="triggerAvatarUpload" :disabled="uploading">
                <span class="icon">{{ uploading ? '⏳' : '📷' }}</span>
              </button>
              <input
                type="file"
                ref="avatarInput"
                @change="handleAvatarUpload"
                accept="image/*"
                style="display: none"
              />
            </div>

            <div class="profile-details">
              <h1 class="profile-name">{{ authStore.userName }}</h1>
              <p class="profile-email">{{ authStore.userEmail }}</p>
              <p class="profile-phone" v-if="authStore.userPhone">{{ authStore.userPhone }}</p>
              <span class="profile-role" :class="authStore.userRole">
                {{
                  authStore.userRole === 'admin'
                    ? 'مدير'
                    : authStore.userRole === 'vendor'
                      ? 'بائع'
                      : 'عميل'
                }}
              </span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ orders.length }}</span>
              <span class="stat-label">إجمالي الطلبات</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ pendingOrders }}</span>
              <span class="stat-label">قيد الانتظار</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ completedOrders }}</span>
              <span class="stat-label">مكتملة</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tabs -->
      <div class="profile-tabs">
        <div class="container">
          <div class="tabs-nav">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'account' }"
              @click="activeTab = 'account'"
            >
              <span class="tab-icon">👤</span>
              <span class="tab-text">حسابي</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'orders' }"
              @click="activeTab = 'orders'"
            >
              <span class="tab-icon">📦</span>
              <span class="tab-text">طلباتي</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <div class="container">
          <!-- ACCOUNT TAB -->
          <div v-if="activeTab === 'account'" class="account-tab">
            <div class="account-card">
              <h2 class="card-title">
                <span class="title-icon">👤</span>
                المعلومات الشخصية
              </h2>

              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">الاسم الكامل</span>
                  <span class="info-value">{{ authStore.userName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">البريد الإلكتروني</span>
                  <span class="info-value">{{ authStore.userEmail }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">رقم الهاتف</span>
                  <span class="info-value">{{ authStore.userPhone || 'غير محدد' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">العنوان</span>
                  <span class="info-value">{{ authStore.userAddress || 'غير محدد' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">الدور</span>
                  <span class="info-value role-badge" :class="authStore.userRole">
                    {{
                      authStore.userRole === 'admin'
                        ? 'مدير'
                        : authStore.userRole === 'vendor'
                          ? 'بائع'
                          : 'عميل'
                    }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">تاريخ التسجيل</span>
                  <span class="info-value">{{ formatDate(authStore.userCreatedAt) }}</span>
                </div>
              </div>

              <button class="btn-edit" @click="editProfile">
                <span class="btn-icon">✏️</span>
                تعديل المعلومات
              </button>
            </div>

            <div class="account-card">
              <h2 class="card-title">
                <span class="title-icon">⚙️</span>
                إعدادات الحساب
              </h2>

              <div class="settings-list">
                <button class="setting-item" @click="changePassword">
                  <span class="setting-icon">🔒</span>
                  <span class="setting-text">تغيير كلمة المرور</span>
                  <span class="setting-arrow">←</span>
                </button>
                <button class="setting-item" @click="notificationSettings">
                  <span class="setting-icon">🔔</span>
                  <span class="setting-text">إعدادات الإشعارات</span>
                  <span class="setting-arrow">←</span>
                </button>
                <button class="setting-item" @click="privacySettings">
                  <span class="setting-icon">🛡️</span>
                  <span class="setting-text">الخصوصية والأمان</span>
                  <span class="setting-arrow">←</span>
                </button>
                <button class="setting-item logout" @click="logout">
                  <span class="setting-icon logout-icon">🚪</span>
                  <span class="setting-text logout-text">تسجيل الخروج</span>
                  <span class="setting-arrow">←</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ORDERS TAB -->
          <div v-if="activeTab === 'orders'" class="orders-tab">
            <div class="orders-header">
              <h2 class="orders-title">طلباتي</h2>
              <p class="orders-count">إجمالي {{ orders.length }} طلب</p>
            </div>

            <!-- Loading Orders -->
            <div v-if="loadingOrders" class="loading-orders">
              <div class="spinner-small"></div>
              <p>جاري تحميل الطلبات...</p>
            </div>

            <!-- Orders List -->
            <div v-else-if="orders.length > 0" class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-id">#{{ order.id }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div class="order-status" :class="order.status">
                    {{ getOrderStatusText(order.status) }}
                  </div>
                </div>

                <div class="order-items">
                  <div v-for="item in order.items" :key="item.id" class="order-item">
                    <img
                      :src="item.image || '/placeholder.jpg'"
                      :alt="item.name"
                      class="item-image"
                    />
                    <div class="item-details">
                      <h4 class="item-name">{{ item.name }}</h4>
                      <p class="item-price">{{ formatPrice(item.price) }} د.ت</p>
                      <p class="item-quantity">الكمية: {{ item.quantity }}</p>
                    </div>
                    <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
                  </div>
                </div>

                <div class="order-footer">
                  <div class="delivery-info">
                    <span class="info-icon">📍</span>
                    <span>{{
                      order.delivery?.address || authStore.userAddress || 'عنوان غير محدد'
                    }}</span>
                  </div>
                  <div class="order-total">
                    <span>المجموع:</span>
                    <span class="total-price">{{ formatPrice(order.total) }} د.ت</span>
                  </div>
                </div>

                <div class="order-actions">
                  <button class="btn-track" @click="trackOrder(order.id)">
                    <span>تتبع الطلب</span>
                    <span class="btn-icon">←</span>
                  </button>
                  <button class="btn-details" @click="viewOrderDetails(order.id)">
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty Orders -->
            <div v-else class="empty-orders">
              <div class="empty-icon">📦</div>
              <h3>لا توجد طلبات بعد</h3>
              <p>عندما تقوم بطلب منتجات، ستظهر هنا</p>
              <router-link to="/products" class="btn-shop"> تسوق الآن </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Profile Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>تعديل المعلومات الشخصية</h3>
            <button class="modal-close" @click="showEditModal = false">✕</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveProfileChanges">
              <div class="form-group">
                <label class="form-label">الاسم الكامل</label>
                <input type="text" v-model="editForm.fullName" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  v-model="editForm.email"
                  class="form-input"
                  dir="ltr"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">رقم الهاتف</label>
                <input type="tel" v-model="editForm.phone" class="form-input" dir="ltr" />
              </div>
              <div class="form-group">
                <label class="form-label">العنوان</label>
                <textarea v-model="editForm.address" class="form-textarea" rows="2"></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="showEditModal = false">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="authStore.loading">
                  <span v-if="!authStore.loading">حفظ التغييرات</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Change Password Modal -->
    <transition name="modal">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>تغيير كلمة المرور</h3>
            <button class="modal-close" @click="showPasswordModal = false">✕</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="savePassword">
              <div class="form-group">
                <label class="form-label">كلمة المرور الحالية</label>
                <input
                  type="password"
                  v-model="passwordForm.currentPassword"
                  class="form-input"
                  dir="ltr"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  v-model="passwordForm.newPassword"
                  class="form-input"
                  dir="ltr"
                  required
                  minlength="6"
                />
              </div>
              <div class="form-group">
                <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  v-model="passwordForm.confirmPassword"
                  class="form-input"
                  dir="ltr"
                  required
                />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="showPasswordModal = false">
                  إلغاء
                </button>
                <button type="submit" class="btn-save" :disabled="changingPassword">
                  <span v-if="!changingPassword">تغيير كلمة المرور</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </form>
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
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ===== STATE =====
const loading = ref(true)
const loadingOrders = ref(false)
const activeTab = ref('account')
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const changingPassword = ref(false)
const uploading = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// Avatar
const avatarInput = ref(null)

// Edit Form
const editForm = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
})

// Password Form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// ===== ORDERS =====
const orders = ref([])

// ===== COMPUTED =====
const pendingOrders = computed(() => {
  return orders.value.filter((o) => o.status === 'pending' || o.status === 'processing').length
})

const completedOrders = computed(() => {
  return orders.value.filter((o) => o.status === 'delivered' || o.status === 'completed').length
})

// ===== METHODS =====
const showNotification = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type],
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'غير محدد'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const getOrderStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }
  return statusMap[status] || status
}

// ===== AVATAR =====
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Vérifier la taille (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning')
    return
  }

  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    showNotification('الرجاء اختيار صورة صالحة', 'warning')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const result = await authStore.updateAvatar(formData)

    if (result.success) {
      showNotification('✅ تم تحديث الصورة بنجاح')
    } else {
      showNotification(result.error, 'error')
    }
  } catch (error) {
    showNotification('حدث خطأ أثناء رفع الصورة', 'error')
  } finally {
    uploading.value = false
    // Reset input
    event.target.value = ''
  }
}

// ===== LOAD ORDERS =====
const loadOrders = () => {
  loadingOrders.value = true

  try {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    // Filtrer les commandes de l'utilisateur connecté
    orders.value = allOrders
      .filter((order) => order.customer?.email === authStore.userEmail)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    console.log('📦 Commandes chargées:', orders.value.length)
  } catch (error) {
    console.error('Error loading orders:', error)
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}

// ===== PROFILE ACTIONS =====
const editProfile = () => {
  editForm.value = {
    fullName: authStore.userName,
    email: authStore.userEmail,
    phone: authStore.userPhone || '',
    address: authStore.userAddress || '',
  }
  showEditModal.value = true
}

const saveProfileChanges = async () => {
  try {
    const result = await authStore.updateProfile({
      name: editForm.value.fullName,
      email: editForm.value.email,
      phone: editForm.value.phone,
      address: editForm.value.address,
    })

    if (result.success) {
      showNotification('✅ تم حفظ التغييرات بنجاح')
      showEditModal.value = false
    } else {
      showNotification(result.error, 'error')
    }
  } catch (error) {
    showNotification('حدث خطأ أثناء الحفظ', 'error')
  }
}

// ===== PASSWORD =====
const changePassword = () => {
  showPasswordModal.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const savePassword = async () => {
  // Validation
  if (passwordForm.value.newPassword.length < 6) {
    showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showNotification('كلمة المرور غير متطابقة', 'warning')
    return
  }

  changingPassword.value = true

  try {
    // Simulation - à remplacer par un appel API réel
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showNotification('✅ تم تغيير كلمة المرور بنجاح')
    showPasswordModal.value = false
  } catch (error) {
    showNotification('حدث خطأ', 'error')
  } finally {
    changingPassword.value = false
  }
}

// ===== SETTINGS ACTIONS =====
const notificationSettings = () => {
  showNotification('إعدادات الإشعارات - قريباً', 'info')
}

const privacySettings = () => {
  showNotification('الخصوصية والأمان - قريباً', 'info')
}

const logout = () => {
  authStore.logout()
  showNotification('👋 تم تسجيل الخروج', 'info')
  setTimeout(() => {
    router.push('/login')
  }, 1500)
}

// ===== ORDER ACTIONS =====
const trackOrder = (orderId) => {
  router.push(`/order-tracking/${orderId}`)
}

const viewOrderDetails = (orderId) => {
  router.push(`/order-details/${orderId}`)
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loadOrders()

  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-right: 4px solid #d40025;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

/* Profile Header */
.profile-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
}

.avatar-section {
  position: relative;
  width: 120px;
  height: 120px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.change-avatar-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 35px;
  height: 35px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: #08717f;
  color: white;
  transform: scale(1.1);
}

.profile-details {
  flex: 1;
}

.profile-name {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 5px;
}

.profile-email,
.profile-phone {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 5px;
}

.profile-stats {
  display: flex;
  gap: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #08717f;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Tabs */
.profile-tabs {
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.tabs-nav {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #08717f;
}

.tab-btn.active {
  color: #d40025;
  border-bottom-color: #d40025;
}

.tab-icon {
  font-size: 1.2rem;
}

/* Tab Content */
.tab-content {
  padding: 40px 0;
}

/* Account Card */
.account-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
}

.title-icon {
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.info-item {
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.info-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* Settings */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.setting-item:hover {
  background: white;
  border-color: #08717f;
  transform: translateX(-4px);
}

.setting-icon {
  font-size: 1.2rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #08717f;
}

.logout-icon {
  color: #d40025;
}

.setting-text {
  flex: 1;
  text-align: right;
  font-size: 0.95rem;
  color: #1e293b;
}

.logout-text {
  color: #d40025;
}

.setting-arrow {
  color: #94a3b8;
  font-size: 1rem;
}

/* Orders Tab */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.orders-title {
  font-size: 1.5rem;
  color: #1e293b;
}

.orders-count {
  color: #64748b;
  font-size: 0.95rem;
}

.loading-orders {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #08717f;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.order-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.order-id {
  font-weight: 700;
  color: #08717f;
  background: #e0f2f1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.order-date {
  color: #64748b;
  font-size: 0.9rem;
}

.order-status {
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.processing {
  background: #cce5ff;
  color: #004085;
}

.order-status.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.delivered,
.order-status.completed {
  background: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
}

.item-price {
  color: #d40025;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 3px;
}

.item-quantity {
  color: #64748b;
  font-size: 0.8rem;
}

.item-total {
  font-weight: 700;
  color: #08717f;
  font-size: 0.95rem;
  min-width: 100px;
  text-align: left;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.delivery-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  font-size: 0.9rem;
}

.info-icon {
  font-size: 1rem;
}

.order-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.total-price {
  color: #d40025;
  margin-right: 8px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.btn-track,
.btn-details {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-track {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-track:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-details {
  background: #f1f5f9;
  color: #64748b;
}

.btn-details:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* Empty Orders */
.empty-orders {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 20px;
  display: block;
}

.empty-orders h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.empty-orders p {
  color: #64748b;
  margin-bottom: 25px;
}

.btn-shop {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
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
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
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

.modal-header h3 {
  font-size: 1.2rem;
  color: #1e293b;
}

.modal-close {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.btn-cancel,
.btn-save {
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

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
}

.toast-notification.info {
  border-right-color: #08717f;
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
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .tabs-nav {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .order-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .order-actions {
    flex-direction: column;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .profile-name {
    font-size: 1.5rem;
  }

  .stat-item {
    flex: 1;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .order-item {
    flex-wrap: wrap;
  }

  .item-total {
    width: 100%;
    text-align: right;
    padding-right: 75px;
  }
}
.profile-role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 8px;
}

.profile-role.admin {
  background: #d40025;
  color: white;
}

.profile-role.vendor {
  background: #08717f;
  color: white;
}

.profile-role.customer {
  background: #10b981;
  color: white;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.role-badge.admin {
  background: #d40025;
  color: white;
}

.role-badge.vendor {
  background: #08717f;
  color: white;
}

.role-badge.customer {
  background: #10b981;
  color: white;
}

.setting-item.logout {
  border-color: #fecdd3;
  background: #fff5f7;
}

.setting-item.logout:hover {
  background: #fee2e2;
  border-color: #d40025;
}

.logout-icon {
  color: #d40025 !important;
}

.logout-text {
  color: #d40025 !important;
  font-weight: 700;
}

.change-avatar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
