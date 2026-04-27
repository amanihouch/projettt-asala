<!-- src/views/EditPhone.vue -->
<template>
  <div class="edit-phone-page" dir="rtl">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">📱 تعديل رقم الهاتف</h1>
        <p class="page-subtitle">أدخل رقم هاتفك الجديد للتواصل وتحديث الطلبات</p>
      </div>

      <div class="form-card">
        <form @submit.prevent="savePhoneNumber">
          <!-- Current Phone -->
          <div class="form-group" v-if="currentPhone">
            <label class="form-label">رقم الهاتف الحالي</label>
            <div class="current-phone">
              <span class="phone-icon">📞</span>
              <span class="phone-number">{{ currentPhone }}</span>
            </div>
          </div>

          <!-- New Phone -->
          <div class="form-group">
            <label class="form-label">
              رقم الهاتف الجديد
              <span class="required">*</span>
            </label>
            <div class="phone-input-wrapper">
              <span class="country-code">+216</span>
              <input
                type="tel"
                v-model="phoneNumber"
                class="form-input phone-input"
                placeholder="XX XXX XXX"
                maxlength="8"
                required
                dir="ltr"
              />
            </div>
            <p class="input-hint">أدخل 8 أرقام بدون مفتاح الدولة</p>
          </div>

          <!-- Confirm Phone -->
          <div class="form-group">
            <label class="form-label">
              تأكيد رقم الهاتف
              <span class="required">*</span>
            </label>
            <div class="phone-input-wrapper">
              <span class="country-code">+216</span>
              <input
                type="tel"
                v-model="confirmPhone"
                class="form-input phone-input"
                placeholder="XX XXX XXX"
                maxlength="8"
                required
                dir="ltr"
              />
            </div>
          </div>

          <!-- Verification Code (SMS) -->
          <div v-if="showVerification" class="verification-section">
            <div class="verification-header">
              <span class="verification-icon">📨</span>
              <h3>رمز التحقق</h3>
            </div>
            <p class="verification-text">تم إرسال رمز التحقق إلى {{ maskedPhone }}</p>

            <div class="code-inputs">
              <input
                v-for="(_, index) in 6"
                :key="index"
                type="text"
                maxlength="1"
                class="code-input"
                v-model="codeDigits[index]"
                @input="(e) => handleCodeInput(index, e)"
                ref="codeInputs"
              />
            </div>

            <div class="timer">
              <span v-if="timeLeft > 0">
                {{ Math.floor(timeLeft / 60) }}:{{ (timeLeft % 60).toString().padStart(2, '0') }}
              </span>
              <button v-else class="resend-btn" @click="resendCode">إعادة إرسال</button>
            </div>

            <!-- Dev hint (afficher le code en développement) -->
            <div v-if="devCode" class="dev-hint">
              ⚡ رمز التطوير: <strong>{{ devCode }}</strong>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <span class="btn-icon">→</span>
              إلغاء
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || (showVerification && !isCodeValid)"
            >
              <span v-if="!isSubmitting">
                <span class="btn-icon">✓</span>
                {{ showVerification ? 'تأكيد' : 'حفظ' }}
              </span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <!-- Info Box -->
      <div class="info-box">
        <div class="info-icon">ℹ️</div>
        <div class="info-content">
          <h4>لماذا تحتاج رقم هاتفك؟</h4>
          <ul>
            <li>تأكيد الطلبات عبر رسائل SMS</li>
            <li>تحديث حالة الشحن</li>
            <li>استعادة كلمة المرور</li>
            <li>تواصل فريق الدعم معك</li>
          </ul>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

// ===== STATE =====
const phoneNumber = ref('')
const confirmPhone = ref('')
const currentPhone = ref(authStore.userPhone || '')
const isSubmitting = ref(false)
const showVerification = ref(false)
const timeLeft = ref(120) // 2 minutes
const timerInterval = ref(null)
const codeDigits = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const devCode = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== COMPUTED =====
const maskedPhone = computed(() => {
  if (!phoneNumber.value) return ''
  const last4 = phoneNumber.value.slice(-4)
  return `+216 ****${last4}`
})

const isCodeValid = computed(() => {
  return codeDigits.value.every(d => d !== '')
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

const validatePhone = (phone) => {
  return /^\d{8}$/.test(phone)
}

const sendVerificationCode = async () => {
  try {
    const response = await api.post('/auth/send-verification-code', {
      phone: phoneNumber.value
    })

    if (response.data.success) {
      // En développement, le code peut être retourné pour faciliter les tests
      if (response.data.devCode) {
        devCode.value = response.data.devCode
      }
      console.log('📨 Code de vérification envoyé à +216' + phoneNumber.value)
      return true
    } else {
      showNotification(response.data.message, 'error')
      return false
    }
  } catch (error) {
    console.error('❌ Erreur envoi code:', error)
    showNotification(error.response?.data?.message || '❌ فشل إرسال رمز التحقق', 'error')
    return false
  }
}

const startTimer = () => {
  timeLeft.value = 120
  if (timerInterval.value) clearInterval(timerInterval.value)

  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timerInterval.value)
    }
  }, 1000)
}

const verifyCode = async () => {
  const code = codeDigits.value.join('')

  try {
    const response = await api.post('/auth/verify-phone', {
      phone: phoneNumber.value,
      code: code
    })

    if (response.data.success) {
      // Mettre à jour le store auth
      authStore.user.phone = phoneNumber.value

      showNotification('✅ تم تحديث رقم الهاتف بنجاح')
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
      return true
    } else {
      showNotification(response.data.message, 'error')
      return false
    }
  } catch (error) {
    console.error('❌ Erreur vérification:', error)
    showNotification(error.response?.data?.message || '❌ رمز التحقق غير صحيح', 'error')
    return false
  }
}

const savePhoneNumber = async () => {
  // Validation
  if (!validatePhone(phoneNumber.value)) {
    showNotification('الرجاء إدخال رقم هاتف صحيح (8 أرقام)', 'warning')
    return
  }

  if (phoneNumber.value !== confirmPhone.value) {
    showNotification('رقم الهاتف غير متطابق', 'warning')
    return
  }

  if (phoneNumber.value === currentPhone.value) {
    showNotification('رقم الهاتف مطابق للرقم الحالي', 'info')
    return
  }

  if (!showVerification.value) {
    // Première étape - envoyer le code
    isSubmitting.value = true

    try {
      const success = await sendVerificationCode()
      if (success) {
        showVerification.value = true
        startTimer()
        showNotification('📨 تم إرسال رمز التحقق', 'success')

        // Focus sur le premier input du code
        setTimeout(() => {
          codeInputs.value[0]?.focus()
        }, 100)
      }
    } catch (error) {
      showNotification('❌ فشل إرسال الرمز', 'error')
    } finally {
      isSubmitting.value = false
    }
  } else {
    // Deuxième étape - vérifier le code
    isSubmitting.value = true
    await verifyCode()
    isSubmitting.value = false
  }
}

const handleCodeInput = (index, event) => {
  const value = event.target.value
  if (value && index < 5) {
    codeInputs.value[index + 1]?.focus()
  }
}

const resendCode = async () => {
  isSubmitting.value = true
  const success = await sendVerificationCode()
  if (success) {
    startTimer()
    showNotification('📨 تم إعادة إرسال الرمز', 'success')
  }
  isSubmitting.value = false
}

const goBack = () => {
  if (showVerification.value) {
    showVerification.value = false
    clearInterval(timerInterval.value)
    devCode.value = ''
  } else {
    router.push('/profile')
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.edit-phone-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  padding: 40px 0;
}

.container {
  max-width: 600px;
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

.form-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.required {
  color: #d40025;
  margin-right: 2px;
}

.current-phone {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.phone-icon {
  font-size: 1.2rem;
}

.phone-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: #08717f;
  direction: ltr;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-input-wrapper:focus-within {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.country-code {
  padding: 12px 16px;
  background: #f1f5f9;
  color: #08717f;
  font-weight: 700;
  border-left: 2px solid #e2e8f0;
}

.phone-input {
  flex: 1;
  padding: 12px 16px;
  border: none !important;
  box-shadow: none !important;
  direction: ltr;
}

.phone-input:focus {
  box-shadow: none !important;
}

.input-hint {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #64748b;
}

/* Verification Section */
.verification-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #f1f5f9;
}

.verification-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.verification-icon {
  font-size: 1.5rem;
}

.verification-header h3 {
  font-size: 1.1rem;
  color: #1e293b;
}

.verification-text {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 15px;
  direction: ltr;
}

.code-input {
  width: 45px;
  height: 55px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.timer {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 10px;
}

.resend-btn {
  background: none;
  border: none;
  color: #08717f;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.resend-btn:hover {
  color: #d40025;
}

.dev-hint {
  margin-top: 15px;
  padding: 10px;
  background: #f1f5f9;
  border: 1px dashed #08717f;
  border-radius: 8px;
  text-align: center;
  color: #08717f;
  font-size: 0.9rem;
}

.dev-hint strong {
  font-size: 1.2rem;
  background: white;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 5px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

.loading-spinner {
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

/* Info Box */
.info-box {
  background: #f0f9ff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 15px;
  border: 1px solid #bae6fd;
}

.info-icon {
  font-size: 2rem;
  color: #0284c7;
}

.info-content h4 {
  color: #0369a1;
  font-size: 1rem;
  margin-bottom: 10px;
}

.info-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-content li {
  color: #0284c7;
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.info-content li::before {
  content: '✓';
  font-weight: 700;
  color: #059669;
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
  .edit-phone-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 20px;
  }

  .code-inputs {
    gap: 5px;
  }

  .code-input {
    width: 40px;
    height: 50px;
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .info-box {
    flex-direction: column;
    text-align: center;
  }

  .info-icon {
    margin-bottom: 10px;
  }

  .info-content ul {
    text-align: right;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
