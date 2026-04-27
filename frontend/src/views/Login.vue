<template>
  <div class="login-page" dir="rtl">
    <!-- Background avec dégradé -->
    <div class="login-background">
      <div class="gradient-overlay"></div>
      <div class="floating-elements">
        <div class="float-1">🏺</div>
        <div class="float-2">🧵</div>
        <div class="float-3">💍</div>
        <div class="float-4">🪵</div>
      </div>
    </div>

    <!-- Login Card -->
    <div class="login-container">
      <div class="login-card">
        <!-- Logo -->
        <div class="login-header">
          <div class="logo-wrapper">
            <img src="/src/assets/asala logo.svg" alt="توراث" class="logo" />
          </div>
        </div>

        <!-- Tabs -->
        <div class="login-tabs">
          <button
            class="tab-btn"
            :class="{ active: currentView === 'login' }"
            @click="switchView('login')"
          >
            <span class="tab-icon">🔐</span>
            <span class="tab-text">تسجيل الدخول</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentView === 'register' }"
            @click="switchView('register')"
          >
            <span class="tab-icon">📝</span>
            <span class="tab-text">إنشاء حساب</span>
          </button>
        </div>

        <!-- Login Form -->
        <div v-if="currentView === 'login'" class="form-container">
          <form @submit.prevent="handleLogin" class="auth-form">
            <h2 class="form-title">مرحباً بعودتك!</h2>
            <p class="form-subtitle">سجل دخولك للمتابعة</p>

            <!-- Email -->
            <div class="form-group" :class="{ 'has-error': errors.email }">
              <label class="form-label">
                <span class="label-icon">📧</span>
                البريد الإلكتروني
              </label>
              <input
                v-model="loginForm.email"
                type="email"
                class="form-input"
                placeholder="example@email.com"
                required
                dir="ltr"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group" :class="{ 'has-error': errors.password }">
              <label class="form-label">
                <span class="label-icon">🔒</span>
                كلمة المرور
              </label>
              <div class="password-wrapper">
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <span v-if="!showPassword">👁️</span>
                  <span v-else>👁️‍🗨️</span>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="loginForm.rememberMe" />
                <span>تذكرني</span>
              </label>
              <button type="button" class="forgot-link" @click="openForgotPassword">
                نسيت كلمة المرور؟
              </button>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="!isLoading">
                <span class="btn-icon">🔑</span>
                تسجيل الدخول
              </span>
              <span v-else class="loading-spinner">
                <span class="spinner"></span>
                جاري التحميل...
              </span>
            </button>

            <!-- Demo Accounts -->
            <div class="demo-buttons">
              <button type="button" class="demo-btn" @click="fillDemoAccount('client@turath.tn', 'client123')">
                <span class="demo-icon">👤</span>
                <span>عميل</span>
              </button>
              <button type="button" class="demo-btn" @click="fillDemoAccount('vendor@turath.tn', 'vendor123')">
                <span class="demo-icon">🏪</span>
                <span>بائع</span>
              </button>
              <button type="button" class="demo-btn" @click="fillDemoAccount('admin@turath.tn', 'admin123')">
                <span class="demo-icon">⚙️</span>
                <span>مسؤول</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Register Form (CLIENT - 2 STEPS) -->
        <div v-else class="form-container">
          <!-- Progress Bar (2 steps) -->
          <div class="register-progress">
            <div class="progress-steps">
              <div class="step" :class="{ active: registerStep >= 1, completed: registerStep > 1 }">
                <span class="step-number">1</span>
                <span class="step-label">المعلومات الأساسية</span>
              </div>
              <div class="step-line" :class="{ active: registerStep > 1 }"></div>
              <div class="step" :class="{ active: registerStep >= 2 }">
                <span class="step-number">2</span>
                <span class="step-label">الصورة الشخصية</span>
              </div>
            </div>
          </div>

          <!-- Step 1: Basic Info (CLIENT) -->
          <div v-if="registerStep === 1">
            <form @submit.prevent="goToStep2" class="auth-form">
              <h2 class="form-title">إنشاء حساب عميل</h2>
              <p class="form-subtitle">انضم إلينا وابدأ التسوق</p>

              <!-- Full Name -->
              <div class="form-group" :class="{ 'has-error': errors.fullName }">
                <label class="form-label">
                  <span class="label-icon">👤</span>
                  الاسم الكامل
                </label>
                <input
                  v-model="registerForm.fullName"
                  type="text"
                  class="form-input"
                  placeholder="مثال: أحمد العميل"
                  required
                />
                <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
              </div>

              <!-- Email -->
              <div class="form-group" :class="{ 'has-error': errors.email }">
                <label class="form-label">
                  <span class="label-icon">📧</span>
                  البريد الإلكتروني
                </label>
                <input
                  v-model="registerForm.email"
                  type="email"
                  class="form-input"
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <!-- Phone -->
              <div class="form-group" :class="{ 'has-error': errors.phone }">
                <label class="form-label">
                  <span class="label-icon">📞</span>
                  رقم الهاتف
                </label>
                <input
                  v-model="registerForm.phone"
                  type="tel"
                  class="form-input"
                  placeholder="+216 XX XXX XXX"
                  required
                  dir="ltr"
                />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>

              <!-- Address (Optional) -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📍</span>
                  العنوان (اختياري)
                </label>
                <input
                  v-model="registerForm.address"
                  type="text"
                  class="form-input"
                  placeholder="العنوان"
                />
              </div>

              <!-- Password -->
              <div class="form-group" :class="{ 'has-error': errors.password }">
                <label class="form-label">
                  <span class="label-icon">🔒</span>
                  كلمة المرور
                </label>
                <div class="password-wrapper">
                  <input
                    v-model="registerForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input password-input"
                    placeholder="••••••••"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  >
                    <span v-if="!showPassword">👁️</span>
                    <span v-else>👁️‍🗨️</span>
                  </button>
                </div>
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>

              <!-- Confirm Password -->
              <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
                <label class="form-label">
                  <span class="label-icon">🔒</span>
                  تأكيد كلمة المرور
                </label>
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <span v-if="errors.confirmPassword" class="error-message">{{
                  errors.confirmPassword
                }}</span>
              </div>

              <!-- Terms -->
              <div class="form-checkbox">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="registerForm.acceptTerms" required />
                  <span>أوافق على الشروط والأحكام</span>
                </label>
              </div>

              <!-- Navigation -->
              <div class="form-navigation">
                <button type="button" class="nav-btn back-btn" @click="switchView('login')">
                  <span class="nav-icon">→</span>
                  <span>العودة</span>
                </button>
                <button type="submit" class="nav-btn next-btn" :disabled="!canProceedToStep2">
                  <span>التالي</span>
                  <span class="nav-icon">←</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Profile Photo (CLIENT - Optional) -->
          <div v-else-if="registerStep === 2">
            <form @submit.prevent="handleClientRegister" class="auth-form">
              <h2 class="form-title">الصورة الشخصية</h2>
              <p class="form-subtitle">أضف صورتك (اختياري)</p>

              <!-- Profile Avatar Upload -->
              <div class="photo-upload-section">
                <div class="avatar-upload-container">
                  <div class="avatar-preview-wrapper">
                    <img
                      :src="avatarPreview || 'https://i.pravatar.cc/300?u=' + Date.now()"
                      alt="Profile Avatar"
                      class="avatar-preview"
                    />
                    <button type="button" class="upload-avatar-btn" @click="triggerAvatarUpload">
                      <span>📷</span>
                      <span>تغيير</span>
                    </button>
                    <input
                      type="file"
                      ref="avatarInput"
                      @change="handleAvatarUpload"
                      accept="image/*"
                      style="display: none"
                    />
                  </div>
                  <p class="upload-hint">jpg, png - حجم أقصى 2MB</p>
                </div>
              </div>

              <!-- Skip Option -->
              <div class="skip-option">
                <button type="button" class="skip-btn" @click="handleClientRegister">
                  <span>تخطي هذه الخطوة</span>
                  <span class="skip-icon">←</span>
                </button>
              </div>

              <!-- Navigation -->
              <div class="form-navigation">
                <button type="button" class="nav-btn back-btn" @click="registerStep = 1">
                  <span class="nav-icon">→</span>
                  <span>السابق</span>
                </button>
                <button type="submit" class="nav-btn next-btn">
                  <span>إنشاء الحساب</span>
                  <span class="nav-icon">←</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Success Step -->
          <div v-else-if="registerStep === 3" class="success-container">
            <div class="success-icon">✅</div>
            <h2 class="success-title">تم إنشاء الحساب بنجاح!</h2>
            <p class="success-message">مرحباً بك في مجتمع توراث</p>

            <div class="success-actions">
              <button class="success-btn primary" @click="goToProfile">
                <span>عرض الملف الشخصي</span>
                <span class="btn-icon">←</span>
              </button>
              <button class="success-btn secondary" @click="router.push('/')">
                <span>الذهاب للرئيسية</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Vendor CTA Button -->
        <div class="vendor-cta">
          <button @click="goToVendorRegister" class="cta-button" :disabled="isLoading">
            <span class="btn-text">انضم كبائع</span>
            <span class="cta-arrow">←</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <transition name="modal">
      <div v-if="showForgotModal" class="modal-overlay" @click="closeForgotModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>استعادة كلمة المرور</h3>
            <button class="modal-close" @click="closeForgotModal">✕</button>
          </div>

          <div v-if="forgotStep === 1" class="modal-body">
            <div class="modal-icon">📧</div>
            <h4>نسيت كلمة المرور؟</h4>
            <p>أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
            <input
              v-model="forgotEmail"
              type="email"
              class="modal-input"
              placeholder="example@email.com"
              dir="ltr"
            />
            <div class="modal-actions">
              <button class="modal-btn primary" @click="sendResetCode" :disabled="modalLoading">
                <span v-if="!modalLoading">إرسال الرمز</span>
                <span v-else>جاري الإرسال...</span>
              </button>
              <button class="modal-btn secondary" @click="closeForgotModal">إلغاء</button>
            </div>
          </div>

          <div v-else-if="forgotStep === 2" class="modal-body">
            <div class="modal-icon">📨</div>
            <h4>تحقق من بريدك</h4>
            <p>تم إرسال الرمز إلى {{ maskEmail(forgotEmail) }}</p>
            <div class="code-inputs">
              <input
                v-for="(_, index) in 6"
                :key="index"
                type="text"
                maxlength="1"
                class="code-input"
                v-model="codeDigits[index]"
                @input="(e) => handleCodeInput(index, e)"
                @keydown="handleCodeKeydown"
              />
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" @click="verifyCode" :disabled="modalLoading">
                <span v-if="!modalLoading">تحقق</span>
                <span v-else>جاري التحقق...</span>
              </button>
              <button class="modal-btn secondary" @click="forgotStep = 1">رجوع</button>
            </div>
          </div>

          <div v-else-if="forgotStep === 3" class="modal-body">
            <div class="modal-icon">🔒</div>
            <h4>كلمة مرور جديدة</h4>
            <input
              v-model="newPassword"
              type="password"
              class="modal-input"
              placeholder="كلمة المرور الجديدة"
            />
            <input
              v-model="confirmPassword"
              type="password"
              class="modal-input"
              placeholder="تأكيد كلمة المرور"
            />
            <div class="modal-actions">
              <button class="modal-btn primary" @click="resetPassword" :disabled="modalLoading">
                <span v-if="!modalLoading">تغيير</span>
                <span v-else>جاري التغيير...</span>
              </button>
              <button class="modal-btn secondary" @click="closeForgotModal">إلغاء</button>
            </div>
          </div>

          <div v-else-if="forgotStep === 4" class="modal-body success">
            <div class="success-icon">✅</div>
            <h4>تم بنجاح!</h4>
            <p>تم تغيير كلمة المرور بنجاح</p>
            <button class="modal-btn primary" @click="closeForgotModalAndLogin">
              تسجيل الدخول
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

// ===== STATE =====
const currentView = ref('login')
const registerStep = ref(1)
const isLoading = ref(false)
const modalLoading = ref(false)
const showPassword = ref(false)
const errors = ref({})
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// Login Form
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// Register Form
const registerForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

// Forgot Password
const showForgotModal = ref(false)
const forgotStep = ref(1)
const forgotEmail = ref('')
const codeDigits = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')

// Avatar
const avatarInput = ref(null)
const avatarPreview = ref(null)

// ===== COMPUTED =====
const canProceedToStep2 = computed(() => {
  return (
    registerForm.fullName?.trim() &&
    registerForm.email?.includes('@') &&
    registerForm.phone?.trim() &&
    registerForm.password?.length >= 6 &&
    registerForm.password === registerForm.confirmPassword &&
    registerForm.acceptTerms
  )
})

// ===== NOTIFICATION =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ===== SWITCH VIEW =====
const switchView = (view) => {
  currentView.value = view
  errors.value = {}
  if (view === 'register') {
    registerStep.value = 1
    // Réinitialiser le formulaire
    registerForm.fullName = ''
    registerForm.email = ''
    registerForm.phone = ''
    registerForm.address = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.acceptTerms = false
    avatarPreview.value = null
  }
}

// ===== LOGIN =====
const handleLogin = async () => {
  errors.value = {}

  if (!loginForm.email) {
    errors.value.email = 'البريد الإلكتروني مطلوب'
    return
  }
  if (!loginForm.password) {
    errors.value.password = 'كلمة المرور مطلوبة'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.login(loginForm.email, loginForm.password)

    if (result.success) {
      showNotification('✅ تم تسجيل الدخول بنجاح', 'success')

      setTimeout(() => {
        if (authStore.userRole === 'admin') {
          router.push('/admin')
        } else if (authStore.userRole === 'vendor') {
          router.push('/vendor/dashboard')
        } else {
          router.push('/')
        }
      }, 1000)
    } else {
      showNotification(result.error, 'error')
    }
  } catch (error) {
    console.error('❌ Erreur login:', error)
    showNotification(error.response?.data?.message || 'حدث خطأ غير متوقع', 'error')
  } finally {
    isLoading.value = false
  }
}

// ===== REGISTER =====
const goToStep2 = () => {
  if (!validateStep1()) return
  registerStep.value = 2
}

const validateStep1 = () => {
  errors.value = {}

  if (!registerForm.fullName?.trim()) {
    errors.value.fullName = 'الاسم مطلوب'
    return false
  }
  if (!registerForm.email?.includes('@')) {
    errors.value.email = 'بريد إلكتروني غير صحيح'
    return false
  }
  if (!registerForm.phone?.trim()) {
    errors.value.phone = 'رقم الهاتف مطلوب'
    return false
  }
  if (!registerForm.password || registerForm.password.length < 6) {
    errors.value.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return false
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.value.confirmPassword = 'كلمة المرور غير متطابقة'
    return false
  }
  if (!registerForm.acceptTerms) {
    showNotification('⚠️ يجب الموافقة على الشروط', 'warning')
    return false
  }
  return true
}

const handleClientRegister = async () => {
  if (!validateStep1()) return

  isLoading.value = true

  try {
    const result = await authStore.registerCustomer({
      name: registerForm.fullName,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      address: registerForm.address || '',
      avatar: avatarPreview.value || null
    })

    if (result.success) {
      registerStep.value = 3
      showNotification('✅ تم إنشاء الحساب بنجاح', 'success')
    } else {
      showNotification(result.error, 'error')
    }
  } catch (error) {
    console.error('❌ Erreur register:', error)
    showNotification(error.response?.data?.message || 'حدث خطأ أثناء التسجيل', 'error')
  } finally {
    isLoading.value = false
  }
}

// ===== DEMO ACCOUNTS =====
const fillDemoAccount = (email, password) => {
  loginForm.email = email
  loginForm.password = password
}

const goToVendorRegister = () => {
  router.push('/become-vendor')
}

const goToProfile = () => router.push('/profile')

// ===== FORGOT PASSWORD =====
const openForgotPassword = () => {
  forgotEmail.value = ''
  codeDigits.value = ['', '', '', '', '', '']
  newPassword.value = ''
  confirmPassword.value = ''
  forgotStep.value = 1
  showForgotModal.value = true
}

const closeForgotModal = () => {
  showForgotModal.value = false
  modalLoading.value = false
}

const sendResetCode = async () => {
  if (!forgotEmail.value) {
    showNotification('الرجاء إدخال البريد الإلكتروني', 'warning')
    return
  }

  modalLoading.value = true
  try {
    const response = await api.post('/auth/forgot-password', {
      email: forgotEmail.value
    })

    if (response.data.success) {
      forgotStep.value = 2
      showNotification('📨 تم إرسال رمز التحقق إلى بريدك', 'success')
    } else {
      showNotification(response.data.message || 'حدث خطأ', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur sendResetCode:', error)
    showNotification(error.response?.data?.message || 'خطأ في الاتصال بالخادم', 'error')
  } finally {
    modalLoading.value = false
  }
}

const verifyCode = async () => {
  const code = codeDigits.value.join('')
  if (code.length !== 6) {
    showNotification('الرجاء إدخال رمز التحقق كاملاً', 'warning')
    return
  }

  modalLoading.value = true
  try {
    const response = await api.post('/auth/verify-code', {
      email: forgotEmail.value,
      code: code
    })

    if (response.data.success) {
      forgotStep.value = 3
    } else {
      showNotification(response.data.message || 'رمز غير صحيح', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur verifyCode:', error)
    showNotification(error.response?.data?.message || 'خطأ في الاتصال بالخادم', 'error')
  } finally {
    modalLoading.value = false
  }
}

const resetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    showNotification('كلمة المرور غير متطابقة', 'warning')
    return
  }

  const code = codeDigits.value.join('')

  modalLoading.value = true
  try {
    const response = await api.post('/auth/reset-password', {
      email: forgotEmail.value,
      code: code,
      newPassword: newPassword.value
    })

    if (response.data.success) {
      forgotStep.value = 4
    } else {
      showNotification(response.data.message || 'حدث خطأ', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur resetPassword:', error)
    showNotification(error.response?.data?.message || 'خطأ في الاتصال بالخادم', 'error')
  } finally {
    modalLoading.value = false
  }
}

const closeForgotModalAndLogin = () => {
  closeForgotModal()
  switchView('login')
}

const handleCodeInput = (index, event) => {
  const input = event.target
  if (input.value && index < 5) {
    const nextInput = document.querySelectorAll('.code-input')[index + 1]
    if (nextInput) nextInput.focus()
  }
}

const handleCodeKeydown = (event) => {
  const target = event.target
  const index = Number(target.dataset.index)

  if (event.key === 'Backspace' && !target.value && index > 0) {
    const prevInput = document.querySelectorAll('.code-input')[index - 1]
    if (prevInput) {
      prevInput.focus()
    }
  }
}

// Ajouter data-index aux inputs de code
onMounted(() => {
  document.querySelectorAll('.code-input').forEach((input, index) => {
    input.dataset.index = index
  })
})

const maskEmail = (email) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  return name.slice(0, 3) + '***@' + domain
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
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

    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
      showNotification('✅ تم تحميل الصورة بنجاح', 'success')
    }
    reader.onerror = () => {
      showNotification('❌ فشل تحميل الصورة', 'error')
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  position: relative;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-elements div {
  position: absolute;
  font-size: 3rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.float-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.float-2 {
  top: 70%;
  right: 15%;
  animation-delay: 2s;
}
.float-3 {
  top: 30%;
  right: 25%;
  animation-delay: 4s;
}
.float-4 {
  bottom: 20%;
  left: 20%;
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  margin: 0 auto;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.logo {
  height: 60px;
  width: auto;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 5px;
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #d40025;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-icon {
  font-size: 1.1rem;
}

/* Progress Bar */
.register-progress {
  margin-bottom: 30px;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 36px;
  height: 36px;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #d40025;
  color: white;
  box-shadow: 0 0 0 3px rgba(212, 0, 37, 0.2);
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  max-width: 80px;
}

.step.active .step-label {
  color: #d40025;
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 5px;
  margin-top: -15px;
}

.step-line.active {
  background: #d40025;
}

/* Form styles */
.form-container {
  width: 100%;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 5px;
}

.form-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.label-icon {
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #d40025;
  box-shadow: 0 0 0 3px rgba(212, 0, 37, 0.1);
}

.has-error .form-input {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 2px;
}

.password-wrapper {
  position: relative;
}

.password-input {
  padding-left: 45px;
}

.toggle-password {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
}

.toggle-password:hover {
  color: #d40025;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #475569;
  font-size: 0.85rem;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #d40025;
}

.forgot-link {
  background: none;
  border: none;
  color: #08717f;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #d40025;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 0, 37, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.demo-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.demo-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.demo-btn:hover {
  border-color: #08717f;
  background: white;
  transform: translateY(-1px);
}

.demo-icon {
  font-size: 1.2rem;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  color: #64748b;
  font-size: 0.85rem;
}

.link {
  background: none;
  border: none;
  color: #d40025;
  font-weight: 700;
  margin-right: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: #08717f;
  text-decoration: underline;
}

.vendor-cta {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f7 0%, #f8fafc 100%);
  border: 2px solid #fecdd3;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.cta-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cta-icon {
  font-size: 2rem;
}

.cta-text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.cta-text p {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

.cta-button {
  padding: 10px 18px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.cta-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-text {
  font-size: 0.9rem;
}

.cta-arrow {
  font-size: 1rem;
}

.form-checkbox {
  margin: 10px 0;
}

.form-checkbox .checkbox-label span {
  font-size: 0.85rem;
}

.form-navigation {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.nav-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-btn {
  background: #f1f5f9;
  color: #64748b;
}

.back-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateX(-2px);
}

.next-btn {
  background: linear-gradient(135deg, #d40025 0%, #b00020 100%);
  color: white;
}

.next-btn:hover:not(:disabled) {
  transform: translateX(2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.2);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 1rem;
}

.photo-upload-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 20px;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-avatar-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 0.7rem;
  transition: all 0.3s ease;
}

.upload-avatar-btn:hover {
  transform: scale(1.1);
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
}

.skip-option {
  text-align: center;
  margin: 15px 0;
}

.skip-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  color: #d40025;
  background: #f1f5f9;
}

.skip-icon {
  font-size: 1rem;
}

.success-container {
  text-align: center;
  padding: 20px 10px;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  70% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.success-message {
  color: #64748b;
  margin-bottom: 25px;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.success-btn {
  flex: 1;
  padding: 12px 16px;
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

.success-btn.primary {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.success-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.success-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.success-btn.secondary:hover {
  background: #e2e8f0;
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
  max-width: 380px;
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
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.1rem;
  color: #1e293b;
}

.modal-close {
  width: 30px;
  height: 30px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px 20px;
  text-align: center;
}

.modal-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.modal-body h4 {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.modal-body p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.modal-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.modal-input:focus {
  outline: none;
  border-color: #d40025;
}

.code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 20px 0;
  direction: ltr;
}

.code-input {
  width: 40px;
  height: 45px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
}

.code-input:focus {
  outline: none;
  border-color: #d40025;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
}

.modal-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.2);
}

.modal-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.modal-btn.secondary:hover {
  background: #e2e8f0;
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

.toast-notification.warning {
  border-right-color: #f59e0b;
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
  font-weight: 500;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    padding: 25px 20px;
  }

  .tab-text {
    font-size: 0.85rem;
  }

  .demo-buttons {
    flex-direction: column;
  }

  .vendor-cta {
    flex-direction: column;
    text-align: center;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
  }

  .progress-steps .step-label {
    font-size: 0.65rem;
    max-width: 60px;
  }

  .code-input {
    width: 35px;
    height: 40px;
    font-size: 1rem;
  }

  .success-actions {
    flex-direction: column;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }
}
</style>
