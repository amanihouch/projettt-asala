<!-- src/views/NotificationSettings.vue -->
<template>
  <div class="notification-settings-page" dir="rtl">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">🔔 إعدادات الإشعارات</h1>
        <p class="page-subtitle">تحكم في كيفية تلقي الإشعارات من المنصة</p>
      </div>

      <div class="settings-card">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الإعدادات...</p>
        </div>

        <template v-else>
          <!-- Email Notifications -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="title-icon">📧</span>
              إشعارات البريد الإلكتروني
            </h2>

            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تأكيد الطلب</h3>
                  <p class="setting-desc">إرسال إشعار عند تأكيد طلبك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.email.orderConfirmation" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تحديث حالة الطلب</h3>
                  <p class="setting-desc">إرسال إشعار عند تغيير حالة طلبك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.email.orderUpdate" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تأكيد الشحن</h3>
                  <p class="setting-desc">إرسال إشعار عند شحن طلبك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.email.shippingConfirmation" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">العروض والتخفيضات</h3>
                  <p class="setting-desc">إرسال عروض وتخفيضات حصرية</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.email.promotions" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">النشرة البريدية</h3>
                  <p class="setting-desc">استقبل أخبار المنصة والمنتجات الجديدة</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.email.newsletter" />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Push Notifications -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="title-icon">📱</span>
              إشعارات المتصفح
            </h2>

            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تفعيل إشعارات المتصفح</h3>
                  <p class="setting-desc">استقبل إشعارات فورية على متصفحك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.push.enabled" @change="requestPushPermission" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item" v-if="settings.push.enabled">
                <div class="setting-info">
                  <h3 class="setting-name">تحديثات الطلبات</h3>
                  <p class="setting-desc">إشعارات فورية عند تحديث طلبك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.push.orderUpdates" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item" v-if="settings.push.enabled">
                <div class="setting-info">
                  <h3 class="setting-name">العروض الخاصة</h3>
                  <p class="setting-desc">إشعارات للعروض والتخفيضات</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.push.promotions" />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div v-if="pushSupported && !pushPermissionGranted && settings.push.enabled" class="push-warning">
              <span class="warning-icon">ℹ️</span>
              <span>الرجاء السماح بالإشعارات من المتصفح</span>
            </div>
          </div>

          <!-- SMS Notifications -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="title-icon">📨</span>
              إشعارات SMS
            </h2>

            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تأكيد الطلب</h3>
                  <p class="setting-desc">إرسال رسالة نصية عند تأكيد طلبك</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.sms.orderConfirmation" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">تحديث الشحن</h3>
                  <p class="setting-desc">إرسال رسالة عند شحن الطلب</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.sms.shippingUpdate" />
                  <span class="slider round"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-name">رمز التحقق</h3>
                  <p class="setting-desc">إرسال رموز التحقق عبر SMS</p>
                </div>
                <label class="switch">
                  <input type="checkbox" v-model="settings.sms.verification" />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div class="phone-number" v-if="authStore.userPhone">
              <span class="phone-label">رقم الهاتف:</span>
              <span class="phone-value">{{ authStore.userPhone }}</span>
              <button class="edit-phone" @click="editPhone">✏️</button>
            </div>
            <div v-else class="no-phone">
              <p>لم تقم بإضافة رقم هاتف بعد</p>
              <button class="add-phone-btn" @click="editPhone">➕ إضافة رقم هاتف</button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="save-section">
            <button class="save-btn" @click="saveSettings" :disabled="saving">
              <span v-if="!saving">💾 حفظ الإعدادات</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </template>
      </div>
    </div>

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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ===== STATE =====
const loading = ref(true)
const saving = ref(false)
const pushSupported = ref('Notification' in window)
const pushPermissionGranted = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== SETTINGS =====
const settings = reactive({
  email: {
    orderConfirmation: true,
    orderUpdate: true,
    shippingConfirmation: true,
    promotions: false,
    newsletter: false
  },
  push: {
    enabled: false,
    orderUpdates: true,
    promotions: false
  },
  sms: {
    orderConfirmation: true,
    shippingUpdate: true,
    verification: true
  }
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

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(`notification_settings_${authStore.userId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    }

    // Vérifier la permission push
    if (pushSupported.value && Notification.permission === 'granted') {
      pushPermissionGranted.value = true
      settings.push.enabled = true
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true

  try {
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000))

    localStorage.setItem(`notification_settings_${authStore.userId}`, JSON.stringify(settings))
    showNotification('✅ تم حفظ الإعدادات بنجاح')
  } catch (error) {
    showNotification('❌ حدث خطأ أثناء الحفظ', 'error')
  } finally {
    saving.value = false
  }
}

const requestPushPermission = async () => {
  if (!pushSupported.value) {
    showNotification('متصفحك لا يدعم الإشعارات', 'warning')
    return
  }

  if (settings.push.enabled) {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        pushPermissionGranted.value = true
        showNotification('✅ تم تفعيل الإشعارات', 'success')

        // إرسال إشعار تجريبي
        new Notification('🔔 إشعارات أصالة', {
          body: 'تم تفعيل الإشعارات بنجاح!',
          icon: '/src/assets/logo.png'
        })
      } else {
        pushPermissionGranted.value = false
        settings.push.enabled = false
        showNotification('❌ تم رفض الإشعارات', 'error')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
    }
  }
}


const editPhone = () => {
  router.push('/edit-phone')
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loadSettings()
})
</script>

<style scoped>
.notification-settings-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.settings-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.settings-section {
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e2e8f0;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}

.title-icon {
  font-size: 1.3rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: #f1f5f9;
}

.setting-info {
  flex: 1;
}

.setting-name {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
}

.setting-desc {
  font-size: 0.8rem;
  color: #64748b;
}

/* Switch Button */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 15px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background: linear-gradient(135deg, #08717f, #065a69);
}

input:focus + .slider {
  box-shadow: 0 0 1px #08717f;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Push Warning */
.push-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
  font-size: 0.85rem;
}

.warning-icon {
  font-size: 1.2rem;
}

/* Phone Number */
.phone-number {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.phone-label {
  color: #0369a1;
  font-weight: 600;
}

.phone-value {
  color: #0284c7;
  font-weight: 700;
  font-size: 1.1rem;
  direction: ltr;
}

.edit-phone {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.edit-phone:hover {
  background: #e2e8f0;
}

.no-phone {
  margin-top: 15px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 12px;
  text-align: center;
}

.no-phone p {
  color: #856404;
  margin-bottom: 10px;
}

.add-phone-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-phone-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* Save Section */
.save-section {
  margin-top: 30px;
  text-align: center;
}

.save-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(8, 113, 127, 0.3);
}

.save-btn:disabled {
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
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-settings-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .settings-card {
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .switch {
    align-self: flex-start;
  }

  .phone-number {
    flex-wrap: wrap;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
