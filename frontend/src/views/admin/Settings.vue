<!-- src/views/admin/Settings.vue -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <header class="page-header">
      <h1 class="page-title">الإعدادات</h1>
      <p class="page-subtitle">تخصيص إعدادات المنصة</p>
      <button class="theme-toggle" @click="toggleDarkMode">
        <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </button>
    </header>

    <div class="page-content">
      <div class="settings-grid">
        <!-- General Settings -->
        <div class="settings-card">
          <h3 class="card-title">الإعدادات العامة</h3>

          <div class="setting-item">
            <label class="setting-label">اسم الموقع</label>
            <input type="text" v-model="settings.siteName" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">وصف الموقع</label>
            <textarea v-model="settings.siteDescription" class="setting-textarea" rows="3"></textarea>
          </div>

          <div class="setting-item">
            <label class="setting-label">البريد الإلكتروني للتواصل</label>
            <input type="email" v-model="settings.contactEmail" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">رقم الهاتف</label>
            <input type="tel" v-model="settings.contactPhone" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">العنوان</label>
            <input type="text" v-model="settings.address" class="setting-input" />
          </div>
        </div>

        <!-- Shipping Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات الشحن</h3>

          <div class="setting-item">
            <label class="setting-label">تكلفة الشحن الافتراضية</label>
            <div class="input-group">
              <input type="number" v-model="settings.defaultShipping" class="setting-input" step="0.5" />
              <span class="input-suffix">د.ت</span>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">الشحن المجاني (من)</label>
            <div class="input-group">
              <input type="number" v-model="settings.freeShippingFrom" class="setting-input" step="1" />
              <span class="input-suffix">د.ت</span>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">مدة التوصيل المتوقعة</label>
            <input type="text" v-model="settings.shippingTime" class="setting-input" placeholder="مثال: 3-5 أيام" />
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات الدفع</h3>

          <div class="setting-item checkbox-item">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="settings.cashOnDelivery" />
              <span class="checkbox-label">الدفع عند الاستلام</span>
            </label>
          </div>

          <div class="setting-item checkbox-item">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="settings.onlinePayment" />
              <span class="checkbox-label">الدفع الإلكتروني</span>
            </label>
          </div>

          <div v-if="settings.onlinePayment" class="setting-item">
            <label class="setting-label">مفتاح API للدفع</label>
            <input type="password" v-model="settings.paymentApiKey" class="setting-input" />
            <span class="field-hint">سيتم تخزينه بشكل آمن</span>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات الإشعارات</h3>

          <div class="setting-item checkbox-item">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="settings.emailNotifications" />
              <span class="checkbox-label">إشعارات البريد الإلكتروني للطلبات الجديدة</span>
            </label>
          </div>

          <div class="setting-item checkbox-item">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="settings.smsNotifications" />
              <span class="checkbox-label">إشعارات SMS للطلبات المهمة</span>
            </label>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات المظهر</h3>

          <div class="setting-item checkbox-item">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="settings.rtlLayout" />
              <span class="checkbox-label">تخطيط من اليمين إلى اليسار (RTL)</span>
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label">لون الموقع الأساسي</label>
            <div class="color-input-group">
              <input type="color" v-model="settings.primaryColor" class="color-picker" />
              <span class="color-value">{{ settings.primaryColor }}</span>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="save-section">
          <button class="btn-save" @click="saveSettings" :disabled="saving">
            <span v-if="!saving">💾 حفظ الإعدادات</span>
            <span v-else class="loading-spinner"></span>
          </button>
          <button class="btn-reset" @click="resetSettings" :disabled="saving">
            ↺ إعادة تعيين
          </button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE - Synchronized with global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleDarkMode = () => {
  themeStore.toggleTheme()
}

// ===== STATE =====
const saving = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

const settings = ref({
  siteName: 'توراث',
  siteDescription: 'منصة الحرف اليدوية التونسية',
  contactEmail: 'contact@turath.tn',
  contactPhone: '+216 12 345 678',
  address: 'تونس، تونس',
  defaultShipping: 7,
  freeShippingFrom: 100,
  shippingTime: '3-5 أيام',
  cashOnDelivery: true,
  onlinePayment: false,
  paymentApiKey: '',
  emailNotifications: true,
  smsNotifications: false,
  rtlLayout: true,
  primaryColor: '#08717f',
})

// ===== METHODS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const saveSettings = async () => {
  saving.value = true
  try {
    localStorage.setItem('admin_settings', JSON.stringify(settings.value))

    // Also apply RTL layout if changed
    if (settings.value.rtlLayout) {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }

    // Apply primary color to CSS variable
    document.documentElement.style.setProperty('--primary-color', settings.value.primaryColor)

    showNotification('✅ تم حفظ الإعدادات بنجاح', 'success')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('❌ Error saving settings:', error)
    showNotification('❌ حدث خطأ أثناء حفظ الإعدادات', 'error')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
    settings.value = {
      siteName: 'توراث',
      siteDescription: 'منصة الحرف اليدوية التونسية',
      contactEmail: 'contact@turath.tn',
      contactPhone: '+216 12 345 678',
      address: 'تونس، تونس',
      defaultShipping: 7,
      freeShippingFrom: 100,
      shippingTime: '3-5 أيام',
      cashOnDelivery: true,
      onlinePayment: false,
      paymentApiKey: '',
      emailNotifications: true,
      smsNotifications: false,
      rtlLayout: true,
      primaryColor: '#08717f',
    }
    showNotification('🔄 تم إعادة تعيين الإعدادات', 'info')
  }
}

const loadSettings = () => {
  const saved = localStorage.getItem('admin_settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      settings.value = { ...settings.value, ...parsed }
    } catch (error) {
      console.error('Error parsing settings:', error)
    }
  }

  // Apply saved settings to document
  if (settings.value.rtlLayout) {
    document.documentElement.dir = 'rtl'
  }
  document.documentElement.style.setProperty('--primary-color', settings.value.primaryColor)
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
  // Check authentication
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }

  loadSettings()
})
</script>

<style scoped>
.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  transition: all 0.3s ease;
}

/* Dark mode styles */
.admin-page.dark-mode {
  background: #0f172a;
}

.page-header {
  margin-bottom: 30px;
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  z-index: 10;
}

.dark-mode .theme-toggle {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.theme-toggle:hover {
  transform: rotate(15deg);
  border-color: #08717f;
}

.page-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 5px;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.dark-mode .page-subtitle {
  color: #94a3b8;
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

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

/* Settings Card */
.settings-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.dark-mode .settings-card {
  background: #0f172a;
  border-color: #334155;
}

.card-title {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.dark-mode .card-title {
  color: #f1f5f9;
  border-bottom-color: #334155;
}

/* Setting Items */
.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.dark-mode .setting-label {
  color: #cbd5e1;
}

.setting-input,
.setting-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.dark-mode .setting-input,
.dark-mode .setting-textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.dark-mode .setting-input::placeholder,
.dark-mode .setting-textarea::placeholder {
  color: #64748b;
}

.setting-input:focus,
.setting-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.dark-mode .setting-input:focus,
.dark-mode .setting-textarea:focus {
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.3);
}

.setting-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Input Group */
.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group .setting-input {
  flex: 1;
}

.input-suffix {
  color: #64748b;
  font-weight: 600;
  min-width: 40px;
}

.dark-mode .input-suffix {
  color: #94a3b8;
}

/* Checkbox Items */
.checkbox-item {
  margin-bottom: 12px;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.setting-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #08717f;
}

.checkbox-label {
  color: #1e293b;
  font-size: 0.95rem;
}

.dark-mode .checkbox-label {
  color: #cbd5e1;
}

/* Color Input */
.color-input-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-picker {
  width: 50px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
}

.dark-mode .color-picker {
  border-color: #334155;
}

.color-value {
  font-family: monospace;
  color: #64748b;
  font-size: 0.9rem;
}

.dark-mode .color-value {
  color: #94a3b8;
}

/* Field Hint */
.field-hint {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 5px;
}

.dark-mode .field-hint {
  color: #64748b;
}

/* Save Section */
.save-section {
  grid-column: 1 / -1;
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.dark-mode .save-section {
  border-top-color: #334155;
}

.btn-save,
.btn-reset {
  padding: 12px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.btn-save {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-reset {
  background: #f1f5f9;
  color: #64748b;
}

.dark-mode .btn-reset {
  background: #334155;
  color: #cbd5e1;
}

.btn-reset:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.dark-mode .btn-reset:hover:not(:disabled) {
  background: #475569;
}

.btn-save:disabled,
.btn-reset:disabled {
  opacity: 0.6;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .page-header {
    margin-top: 50px;
  }

  .theme-toggle {
    top: -40px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .save-section {
    flex-direction: column;
  }

  .btn-save,
  .btn-reset {
    width: 100%;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .settings-card {
    padding: 15px;
  }
}
</style>

<style>
/* Global dark mode styles */
html.dark-mode {
  background-color: #0f172a;
}

html.dark-mode body {
  background-color: #0f172a;
  color: #f1f5f9;
}

/* CSS Variable for primary color */
:root {
  --primary-color: #08717f;
}

/* Smooth transitions for dark mode */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
