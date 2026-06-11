<!-- frontend/src/views/Login.vue - Version COMPLÈTE CORRIGÉE -->
<template>
  <div class="login-page" dir="rtl">
    <!-- HONEYPOT FIELDS -->
    <div style="display: none;">
      <input type="text" name="fakeusername" autocomplete="username" />
      <input type="password" name="fakepassword" autocomplete="current-password" />
    </div>

    <!-- Two Columns Layout -->
    <div class="login-wrapper">
      <!-- Left Column - Branding -->
      <div class="brand-column">
        <div class="brand-content">
          <div class="logo-container">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="brand-logo" />
          </div>
          <div class="welcome-message">
            <h2 class="welcome-title">مرحباً بك!</h2>
            <p class="welcome-text">{{ currentView === 'login' ? 'سجل الدخول للوصول إلى حسابك' : 'أنشئ حساباً جديداً' }}</p>
            <p class="welcome-subtext">الوصول الكامل إلى جميع ميزات وخدمات منصتنا</p>
          </div>
        </div>
      </div>

      <!-- Right Column - Login/Register Form -->
      <div class="form-column">
        <div class="form-card">
          <!-- Tabs -->
          <div class="login-tabs">
            <button class="tab-btn" :class="{ active: currentView === 'login' }" @click="switchView('login')">
              <span class="tab-icon">🔐</span><span class="tab-text">تسجيل الدخول</span>
            </button>
            <button class="tab-btn" :class="{ active: currentView === 'register' }" @click="switchView('register')">
              <span class="tab-icon">📝</span><span class="tab-text">إنشاء حساب</span>
            </button>
          </div>

          <!-- Social Login -->
          <div v-if="currentView === 'login'" class="social-login">
            <button class="social-btn google" @click="handleGoogleLogin" :disabled="socialLoading === 'google'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>{{ socialLoading === 'google' ? 'جاري التحميل...' : 'Google' }}</span>
            </button>
            <button class="social-btn facebook" @click="handleFacebookLogin" :disabled="socialLoading === 'facebook'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.06 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.06 24 18.1 24 12.07z" fill="#1877F2"/></svg>
              <span>{{ socialLoading === 'facebook' ? 'جاري التحميل...' : 'Facebook' }}</span>
            </button>
          </div>

          <div v-if="currentView === 'login'" class="divider"><span>أو باستخدام البريد الإلكتروني</span></div>

          <!-- Login Form -->
          <div v-if="currentView === 'login'" class="form-container">
            <form @submit.prevent="handleLogin" class="auth-form" autocomplete="off" novalidate>
              <div class="form-group" :class="{ 'has-error': errors.email }">
                <label class="form-label">البريد الإلكتروني</label>
                <input :name="`email_${Date.now()}`" type="text" class="form-input" placeholder="example@email.com" required dir="ltr" autocomplete="new-password" v-model="loginForm.email" @focus="clearFieldOnFocus($event)" />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
              <div class="form-group" :class="{ 'has-error': errors.password }">
                <label class="form-label">كلمة المرور</label>
                <div class="password-wrapper">
                  <input :name="`password_${Date.now()}`" :type="showPassword ? 'text' : 'password'" class="form-input password-input" placeholder="••••••••" required dir="ltr" autocomplete="new-password" v-model="loginForm.password" @focus="clearFieldOnFocus($event)" />
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword"><span v-if="!showPassword">👁️</span><span v-else>👁️‍🗨️</span></button>
                </div>
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>
              <div class="form-options">
                <label class="checkbox-label"><input type="checkbox" v-model="loginForm.rememberMe" /><span>تذكرني</span></label>
                <button type="button" class="forgot-link" @click="openForgotPassword">نسيت كلمة المرور؟</button>
              </div>
              <button type="submit" class="submit-btn" :disabled="isLoading">
                <span v-if="!isLoading">تسجيل الدخول</span>
                <span v-else class="loading-spinner"><span class="spinner"></span>جاري التحميل...</span>
              </button>
            </form>
          </div>

          <!-- Register Form -->
          <div v-else class="form-container">
            <div class="register-progress">
              <div class="progress-steps">
                <div class="step" :class="{ active: registerStep >= 1, completed: registerStep > 1 }"><span class="step-number">1</span><span class="step-label">المعلومات</span></div>
                <div class="step-line" :class="{ active: registerStep > 1 }"></div>
                <div class="step" :class="{ active: registerStep >= 2 }"><span class="step-number">2</span><span class="step-label">الصورة</span></div>
              </div>
            </div>

            <!-- Step 1 -->
            <div v-if="registerStep === 1">
              <form @submit.prevent="goToStep2" class="auth-form" autocomplete="off" novalidate>
                <div class="form-group" :class="{ 'has-error': errors.fullName }">
                  <label class="form-label">الاسم الكامل</label>
                  <input :name="`fullname_${Date.now()}`" type="text" class="form-input" placeholder="أحمد العميل" required autocomplete="new-password" v-model="registerForm.fullName" />
                  <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
                </div>
                <div class="form-group" :class="{ 'has-error': errors.email, 'is-valid': emailValid }">
                  <label class="form-label">البريد الإلكتروني</label>
                  <div class="email-input-wrapper">
                    <input :name="`reg_email_${Date.now()}`" type="text" class="form-input" placeholder="example@email.com" required dir="ltr" autocomplete="new-password" v-model="registerForm.email" @blur="validateEmailFormat" @input="checkEmailAvailability" />
                    <span v-if="checkingEmail" class="email-check-spinner"></span>
                    <span v-else-if="emailValid" class="email-valid-icon">✅</span>
                    <span v-else-if="registerForm.email && emailFormatValid" class="email-invalid-icon">❌</span>
                  </div>
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                  <span v-else-if="emailValid" class="success-message">✓ البريد الإلكتروني متاح</span>
                  <span v-else-if="registerForm.email && emailFormatValid && !checkingEmail" class="error-message">❌ هذا البريد الإلكتروني مستخدم بالفعل</span>
                </div>
                <div class="form-group" :class="{ 'has-error': errors.phone }">
                  <label class="form-label">رقم الهاتف</label>
                  <input :name="`phone_${Date.now()}`" type="tel" class="form-input" placeholder="+216 XX XXX XXX" required dir="ltr" autocomplete="new-password" v-model="registerForm.phone" />
                  <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">العنوان (اختياري)</label>
                  <input :name="`address_${Date.now()}`" type="text" class="form-input" placeholder="العنوان" autocomplete="new-password" v-model="registerForm.address" />
                </div>
                <div class="form-group" :class="{ 'has-error': errors.password }">
                  <label class="form-label">كلمة المرور</label>
                  <div class="password-wrapper">
                    <input :name="`reg_password_${Date.now()}`" :type="showRegisterPassword ? 'text' : 'password'" class="form-input password-input" placeholder="••••••••" required dir="ltr" autocomplete="new-password" v-model="registerForm.password" />
                    <button type="button" class="toggle-password" @click="showRegisterPassword = !showRegisterPassword"><span v-if="!showRegisterPassword">👁️</span><span v-else>👁️‍🗨️</span></button>
                  </div>
                  <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                  <div class="password-strength" v-if="registerForm.password">
                    <div class="strength-bar"><div class="strength-fill" :style="{ width: passwordStrength + '%', background: strengthColor }"></div></div>
                    <span class="strength-text" :style="{ color: strengthColor }">{{ strengthText }}</span>
                  </div>
                </div>
                <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
                  <label class="form-label">تأكيد كلمة المرور</label>
                  <input :name="`confirm_password_${Date.now()}`" type="password" class="form-input" placeholder="••••••••" required dir="ltr" autocomplete="new-password" v-model="registerForm.confirmPassword" />
                  <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>
                <div class="form-checkbox">
                  <label class="checkbox-label"><input type="checkbox" v-model="registerForm.acceptTerms" required /><span>أوافق على الشروط والأحكام</span></label>
                </div>
                <div class="form-navigation">
                  <button type="button" class="nav-btn back-btn" @click="switchView('login')"><span>→</span><span>العودة</span></button>
                  <button type="submit" class="nav-btn next-btn" :disabled="!canProceedToStep2"><span>التالي</span><span>←</span></button>
                </div>
              </form>
            </div>

            <!-- Step 2 - Photo -->
            <div v-else-if="registerStep === 2">
              <form @submit.prevent="handleClientRegister" class="auth-form">
                <div class="photo-upload-section">
                  <div class="avatar-upload-container">
                    <div class="avatar-preview-wrapper">
                      <img :src="avatarPreview || defaultAvatarPath" alt="Profile Avatar" class="avatar-preview" @error="handleAvatarError" />
                      <button type="button" class="upload-avatar-btn" @click="triggerAvatarUpload"><span>📷</span></button>
                      <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*" style="display: none" />
                    </div>
                    <p class="upload-hint">أضف صورتك الشخصية (اختياري)</p>
                    <p class="default-hint">إذا لم تضف صورة، سيتم استخدام الصورة الافتراضية</p>
                  </div>
                </div>
                <div class="skip-option"><button type="button" class="skip-btn" @click="handleClientRegister">تخطي هذه الخطوة ←</button></div>
                <div class="form-navigation">
                  <button type="button" class="nav-btn back-btn" @click="registerStep = 1"><span>→</span><span>السابق</span></button>
                  <button type="submit" class="nav-btn next-btn" :disabled="isLoading">
                    <span v-if="!isLoading">إنشاء الحساب</span>
                    <span v-else class="loading-spinner"><span class="spinner"></span></span>
                    <span>←</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Step 3 - Vérification Code -->
            <div v-else-if="registerStep === 3" class="verification-step">
              <div class="modal-icon">📧</div>
              <h4>تأكيد البريد الإلكتروني</h4>
              <p>تم إرسال رمز التحقق إلى <strong>{{ registerForm.email }}</strong></p>
              <div class="code-inputs" dir="ltr">
                <input v-for="(_, index) in 6" :key="index" type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="code-input" v-model="verificationDigits[index]" @input="handleVerifyCodeInput($event, index)" @keydown.delete="handleVerifyCodeDelete($event, index)" @paste="handleVerifyCodePaste" dir="ltr" autocomplete="off" />
              </div>
              <div class="modal-actions" style="flex-direction: column; gap: 10px;">
                <button class="modal-btn primary" @click="verifyEmailAndActivate" :disabled="verifyingEmail">
                  <span v-if="!verifyingEmail">تأكيد</span>
                  <span v-else class="loading-spinner"><span class="spinner"></span></span>
                </button>
                <button class="modal-btn secondary" @click="resendVerificationCode" :disabled="verifyingEmail || resendingCode">
                  <span v-if="!resendingCode">إعادة إرسال الرمز</span><span v-else>جاري الإرسال...</span>
                </button>
                <button class="modal-btn secondary" @click="registerStep = 2">رجوع</button>
              </div>
            </div>

            <!-- Step 4 - Success -->
            <div v-else-if="registerStep === 4" class="success-container">
              <div class="success-icon">✅</div>
              <h3>تم إنشاء الحساب بنجاح!</h3>
              <p>مرحباً بك في مجتمع أصالة</p>
              <div class="success-actions">
                <button class="success-btn primary" @click="goToProfile">عرض الملف الشخصي ←</button>
                <button class="success-btn secondary" @click="router.push('/')">الذهاب للرئيسية</button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="action-btn artisan" @click="goToVendorRegister">
              <span>هل أنت حرفي؟</span><span class="btn-highlight">انضم كبائع</span><span class="btn-arrow">←</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <transition name="modal">
      <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header"><h3>استعادة كلمة المرور</h3><button class="modal-close" @click="closeForgotModal">✕</button></div>
          <div v-if="forgotStep === 1" class="modal-body">
            <div class="modal-icon">📧</div><h4>نسيت كلمة المرور؟</h4><p>أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
            <input v-model="forgotEmail" type="text" class="modal-input" placeholder="example@email.com" dir="ltr" autocomplete="new-password" />
            <div class="modal-actions"><button class="modal-btn primary" @click="sendResetCode" :disabled="modalLoading"><span v-if="!modalLoading">إرسال الرمز</span><span v-else class="loading-spinner"><span class="spinner"></span></span></button><button class="modal-btn secondary" @click="closeForgotModal">إلغاء</button></div>
          </div>
          <div v-else-if="forgotStep === 2" class="modal-body">
            <div class="modal-icon">📨</div><h4>تحقق من بريدك</h4><p>تم إرسال الرمز إلى {{ maskEmail(forgotEmail) }}</p>
            <div class="code-inputs" dir="ltr"><input v-for="(_, index) in 6" :key="index" type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*" class="code-input" v-model="codeDigits[index]" @input="handleCodeInput($event, index)" @keydown.delete="handleCodeDelete($event, index)" @paste="handleCodePaste" dir="ltr" autocomplete="off" /></div>
            <div class="modal-actions" style="flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 10px;"><button class="modal-btn primary" @click="verifyCode" :disabled="modalLoading" style="flex: 2;"><span v-if="!modalLoading">تحقق</span><span v-else class="loading-spinner"><span class="spinner"></span></span></button><button class="modal-btn secondary" @click="forgotStep = 1" style="flex: 1;">رجوع</button></div>
              <button class="modal-btn secondary" @click="sendResetCode" :disabled="modalLoading"><span v-if="!modalLoading">إعادة إرسال الرمز</span><span v-else class="loading-spinner"><span class="spinner"></span></span></button>
            </div>
          </div>
          <div v-else-if="forgotStep === 3" class="modal-body">
            <div class="modal-icon">🔒</div><h4>كلمة مرور جديدة</h4>
            <input v-model="newPassword" type="password" class="modal-input" placeholder="كلمة المرور الجديدة" autocomplete="new-password" />
            <input v-model="confirmPassword" type="password" class="modal-input" placeholder="تأكيد كلمة المرور" autocomplete="new-password" />
            <div class="modal-actions"><button class="modal-btn primary" @click="resetPassword" :disabled="modalLoading"><span v-if="!modalLoading">تغيير</span><span v-else class="loading-spinner"><span class="spinner"></span></span></button><button class="modal-btn secondary" @click="closeForgotModal">إلغاء</button></div>
          </div>
          <div v-else-if="forgotStep === 4" class="modal-body success">
            <div class="success-icon">✅</div><h4>تم بنجاح!</h4><p>تم تغيير كلمة المرور بنجاح</p>
            <button class="modal-btn primary" @click="closeForgotModalAndLogin">تسجيل الدخول</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
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
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

// ✅ Imports des assets
import { DEFAULT_AVATAR } from '../utils/image'
import asalaLogo from '../assets/asala logo.svg'

// ✅ Image de fond optionnelle (ne crash pas si absente)
let brandBg = null
try {
  brandBg = new URL('../assets/Gemini_Generated_Image_il5b9til5b9til5b.png', import.meta.url).href
} catch (e) {
  brandBg = null
}

const router = useRouter()
const authStore = useAuthStore()
const defaultAvatarPath = DEFAULT_AVATAR

const currentView = ref('login')
const registerStep = ref(1)
const isLoading = ref(false)
const socialLoading = ref(null)
const modalLoading = ref(false)
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const errors = ref({})
let toastTimeout = null

const checkingEmail = ref(false)
const emailValid = ref(false)
const emailFormatValid = ref(false)
const verificationDigits = ref(['', '', '', '', '', ''])
const verifyingEmail = ref(false)
const resendingCode = ref(false)

const loginForm = reactive({ email: '', password: '', rememberMe: false })
const registerForm = reactive({ fullName: '', email: '', phone: '', address: '', password: '', confirmPassword: '', acceptTerms: false })

const showForgotModal = ref(false)
const forgotStep = ref(1)
const forgotEmail = ref('')
const codeDigits = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')
const devCode = ref(null)

const avatarInput = ref(null)
const avatarPreview = ref(null)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

const passwordStrength = computed(() => {
  const pwd = registerForm.password || ''; if (!pwd) return 0
  let s = 0; if (pwd.length >= 6) s += 20; if (pwd.length >= 8) s += 20
  if (/[a-z]/.test(pwd)) s += 15; if (/[A-Z]/.test(pwd)) s += 15
  if (/[0-9]/.test(pwd)) s += 15; if (/[^a-zA-Z0-9]/.test(pwd)) s += 15; return Math.min(s, 100)
})
const strengthColor = computed(() => passwordStrength.value < 30 ? '#ef4444' : passwordStrength.value < 60 ? '#f59e0b' : '#10b981')
const strengthText = computed(() => passwordStrength.value < 30 ? 'ضعيفة' : passwordStrength.value < 60 ? 'متوسطة' : 'قوية')
const canProceedToStep2 = computed(() => registerForm.fullName?.trim() && emailFormatValid.value && registerForm.phone?.trim() && registerForm.password?.length >= 6 && registerForm.password === registerForm.confirmPassword && registerForm.acceptTerms)

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  toast.value = { show: true, message, type, icon: icons[type] || 'ℹ️' }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toast.value.show = false }, 5000)
}

const validateEmailFormat = () => { const e = registerForm.email?.trim(); const r = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/; emailFormatValid.value = r.test(e); if (e && emailFormatValid.value) checkEmailAvailability(); else emailValid.value = false; return emailFormatValid.value }
const checkEmailAvailability = async () => {
  const e = registerForm.email?.trim(); if (!e || !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(e)) { emailValid.value = false; emailFormatValid.value = false; return }
  emailFormatValid.value = true; checkingEmail.value = true
  try { const r = await api.post('/auth/check-email', { email: e.toLowerCase() }); if (r.data.success) { emailValid.value = !r.data.exists; if (r.data.exists) errors.value.email = 'هذا البريد الإلكتروني مستخدم بالفعل'; else delete errors.value.email } else { emailValid.value = true; delete errors.value.email } } catch (er) { emailValid.value = true; delete errors.value.email } finally { checkingEmail.value = false }
}

const getVerifyCode = () => verificationDigits.value.join('')
const handleVerifyCodeInput = (event, index) => { let v = event.target.value.replace(/\D/g, ''); if (!v) { verificationDigits.value[index] = ''; return } v = v.slice(-1); verificationDigits.value[index] = v; if (index < 5) { const n = document.querySelectorAll('.verification-step .code-input')[index + 1]; if (n) n.focus() } }
const handleVerifyCodeDelete = (event, index) => { if (!verificationDigits.value[index] && index > 0) { const p = document.querySelectorAll('.verification-step .code-input')[index - 1]; if (p) p.focus() } }
const handleVerifyCodePaste = (event) => { const p = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!p) return; event.preventDefault(); for (let i = 0; i < 6; i++) verificationDigits.value[i] = p[i] || '' }

const sendVerificationCode = async () => {
  try {
    await api.post('/auth/send-email-verification-code', { email: registerForm.email.toLowerCase().trim() })
    verificationDigits.value = ['', '', '', '', '', '']
  } catch (error) { console.error('Erreur envoi code:', error) }
}
const resendVerificationCode = async () => { resendingCode.value = true; try { await sendVerificationCode(); showNotification('📨 تم إرسال رمز جديد', 'success') } catch (error) { showNotification('❌ خطأ', 'error') } finally { resendingCode.value = false } }
const verifyEmailAndActivate = async () => {
  const code = getVerifyCode(); if (code.length !== 6) { showNotification('الرجاء إدخال الرمز كاملاً', 'warning'); return }
  verifyingEmail.value = true
  try { const r = await api.post('/auth/verify-email-code', { email: registerForm.email.toLowerCase().trim(), code }); if (r.data.success) { registerStep.value = 4; showNotification('✅ تم تأكيد البريد الإلكتروني', 'success') } else showNotification(r.data.message || 'رمز غير صحيح', 'error') } catch (error) { showNotification(error.response?.data?.message || 'خطأ في التحقق', 'error') } finally { verifyingEmail.value = false }
}

const clearFieldOnFocus = (event) => { if (event.target.value) { event.target.value = ''; if (event.target.name?.startsWith('email')) loginForm.email = ''; if (event.target.name?.startsWith('password')) loginForm.password = '' } }
const resetAllForms = () => { loginForm.email = ''; loginForm.password = ''; loginForm.rememberMe = false; registerForm.fullName = ''; registerForm.email = ''; registerForm.phone = ''; registerForm.address = ''; registerForm.password = ''; registerForm.confirmPassword = ''; registerForm.acceptTerms = false; avatarPreview.value = null; errors.value = {}; emailValid.value = false; emailFormatValid.value = false; verificationDigits.value = ['', '', '', '', '', ''] }
const switchView = async (view) => { currentView.value = view; errors.value = {}; emailValid.value = false; emailFormatValid.value = false; if (view === 'register') { registerStep.value = 1; registerForm.fullName = ''; registerForm.email = ''; registerForm.phone = ''; registerForm.address = ''; registerForm.password = ''; registerForm.confirmPassword = ''; registerForm.acceptTerms = false; avatarPreview.value = null; verificationDigits.value = ['', '', '', '', '', ''] } else if (view === 'login') { await nextTick(); resetAllForms() } }

const handleLogin = async () => {
  errors.value = {}; const email = loginForm.email?.trim(); const password = loginForm.password
  if (!email) { errors.value.email = 'البريد الإلكتروني مطلوب'; return }; if (!password) { errors.value.password = 'كلمة المرور مطلوبة'; return }
  isLoading.value = true
  try { const r = await authStore.login(email.toLowerCase(), password); if (r.success) { if (loginForm.rememberMe && email) localStorage.setItem('rememberedEmail', email.toLowerCase()); else localStorage.removeItem('rememberedEmail'); showNotification('✅ تم تسجيل الدخول بنجاح', 'success'); setTimeout(async () => { const u = authStore.user; const role = u?.role || authStore.userRole; if (role === 'admin') router.push('/admin'); else if (role === 'vendor') { const id = authStore.vendorId || await authStore.fetchVendorId(); router.push(id ? `/vendor/${id}` : '/become-vendor') } else if (role === 'pending') router.push('/pending-vendor'); else router.push('/') }, 1000) } else showNotification(r.error || 'فشل تسجيل الدخول', 'error') } catch (error) { showNotification(error.response?.data?.message || 'حدث خطأ غير متوقع', 'error') } finally { isLoading.value = false }
}

const handleGoogleLogin = () => { socialLoading.value = 'google'; try { const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, ''); window.location.href = `${base}/api/v1/auth/google` } catch (error) { showNotification('حدث خطأ', 'error'); socialLoading.value = null } }
const handleFacebookLogin = () => { socialLoading.value = 'facebook'; try { const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, ''); window.location.href = `${base}/api/v1/auth/facebook` } catch (error) { showNotification('حدث خطأ', 'error'); socialLoading.value = null } }

const goToStep2 = () => { if (!validateStep1()) return; registerStep.value = 2 }
const validateStep1 = () => {
  errors.value = {}; if (!registerForm.fullName?.trim()) { errors.value.fullName = 'الاسم مطلوب'; return false }
  if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(registerForm.email)) { errors.value.email = 'بريد إلكتروني غير صحيح'; return false }
  if (!/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/.test(registerForm.phone)) { errors.value.phone = 'رقم هاتف غير صحيح'; return false }
  if (!registerForm.password || registerForm.password.length < 6) { errors.value.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'; return false }
  if (registerForm.password !== registerForm.confirmPassword) { errors.value.confirmPassword = 'كلمة المرور غير متطابقة'; return false }
  if (!registerForm.acceptTerms) { showNotification('⚠️ يجب الموافقة على الشروط', 'warning'); return false }; return true
}

const handleClientRegister = async () => {
  if (!validateStep1()) return
  isLoading.value = true
  try {
    const payload = {
      name: registerForm.fullName,
      email: registerForm.email.toLowerCase(),
      phone: registerForm.phone,
      password: registerForm.password,
      address: registerForm.address || ''
    }
    if (avatarPreview.value && avatarPreview.value.startsWith('data:image')) {
      payload.avatar = avatarPreview.value
    }
    const r = await authStore.registerCustomer(payload)
    if (r.success) {
      registerStep.value = 3
      await sendVerificationCode()
      showNotification('📧 تم إرسال رمز التحقق إلى بريدك الإلكتروني', 'success')
    } else {
      showNotification(r.error || 'حدث خطأ أثناء التسجيل', 'error')
    }
  } catch (error) {
    showNotification(error.response?.data?.message || 'حدث خطأ أثناء التسجيل', 'error')
  } finally {
    isLoading.value = false
  }
}

const triggerAvatarUpload = () => avatarInput.value?.click()
const handleAvatarUpload = (event) => { const f = event.target.files[0]; if (f) { if (f.size > 2 * 1024 * 1024) { showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning'); return } if (!f.type.startsWith('image/')) { showNotification('الرجاء اختيار صورة صالحة', 'warning'); return } const r = new FileReader(); r.onload = (e) => { avatarPreview.value = e.target.result; showNotification('✅ تم تحميل الصورة بنجاح', 'success') }; r.onerror = () => showNotification('❌ فشل تحميل الصورة', 'error'); r.readAsDataURL(f) } }
const handleAvatarError = (e) => { e.target.src = defaultAvatarPath }
const goToVendorRegister = () => router.push('/become-vendor')
const goToProfile = () => router.push('/profile')

const getEnteredCode = () => codeDigits.value.join('').replace(/\D/g, '').trim()
const openForgotPassword = () => { forgotEmail.value = ''; codeDigits.value = ['', '', '', '', '', '']; newPassword.value = ''; confirmPassword.value = ''; forgotStep.value = 1; devCode.value = null; showForgotModal.value = true }
const closeForgotModal = () => { showForgotModal.value = false; modalLoading.value = false; forgotEmail.value = ''; codeDigits.value = ['', '', '', '', '', '']; newPassword.value = ''; confirmPassword.value = ''; forgotStep.value = 1; devCode.value = null }
const handleCodeInput = (event, index) => { let v = event.target.value.replace(/\D/g, ''); if (!v) { codeDigits.value[index] = ''; return } v = v.slice(-1); codeDigits.value[index] = v; if (index < 5) { const n = document.querySelectorAll('.code-input')[index + 1]; if (n) n.focus() } }
const handleCodeDelete = (event, index) => { if (!codeDigits.value[index] && index > 0) { const p = document.querySelectorAll('.code-input')[index - 1]; if (p) p.focus() } }
const handleCodePaste = (event) => { const p = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!p) return; event.preventDefault(); for (let i = 0; i < 6; i++) codeDigits.value[i] = p[i] || '' }
const sendResetCode = async () => { if (!forgotEmail.value || !forgotEmail.value.includes('@')) { showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'warning'); return } modalLoading.value = true; try { const r = await api.post('/auth/forgot-password', { email: forgotEmail.value.trim().toLowerCase() }); if (r.data.success) { forgotStep.value = 2; if (r.data.devCode) devCode.value = r.data.devCode; else showNotification('📨 تم إرسال رمز التحقق إلى بريدك', 'success') } else showNotification(r.data.message || 'حدث خطأ', 'error') } catch (error) { if (error.response?.status === 404) showNotification('البريد الإلكتروني غير مسجل', 'error'); else showNotification(error.response?.data?.message || 'خطأ في الاتصال بالخادم', 'error') } finally { modalLoading.value = false } }
const verifyCode = async () => { const code = getEnteredCode(); const edc = String(devCode.value || '').trim(); if (code.length !== 6) { showNotification('الرجاء إدخال رمز التحقق كاملاً', 'warning'); return } if (edc && code === edc) { forgotStep.value = 3; showNotification('✅ تم التحقق من الرمز بنجاح', 'success'); return } modalLoading.value = true; try { const r = await api.post('/auth/verify-code', { email: forgotEmail.value.trim().toLowerCase(), code }); if (r.data.success) { forgotStep.value = 3; showNotification('✅ تم التحقق من الرمز بنجاح', 'success') } else showNotification(r.data.message || 'رمز غير صحيح', 'error') } catch (error) { if (edc && code === edc) { forgotStep.value = 3; showNotification('✅ تم التحقق من الرمز بنجاح', 'success') } else if (error.response?.status === 400) showNotification(error.response?.data?.message || 'رمز غير صحيح أو منتهي الصلاحية', 'error'); else showNotification('خطأ في الاتصال بالخادم', 'error') } finally { modalLoading.value = false } }
const resetPassword = async () => { if (!newPassword.value || newPassword.value.length < 6) { showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning'); return } if (newPassword.value !== confirmPassword.value) { showNotification('كلمة المرور غير متطابقة', 'warning'); return } const code = getEnteredCode(); modalLoading.value = true; try { const r = await api.post('/auth/reset-password', { email: forgotEmail.value.trim().toLowerCase(), code, newPassword: newPassword.value }); if (r.data.success) { forgotStep.value = 4; showNotification('✅ تم تغيير كلمة المرور بنجاح', 'success') } else showNotification(r.data.message || 'حدث خطأ', 'error') } catch (error) { if (devCode.value && code === String(devCode.value).trim()) { forgotStep.value = 4; showNotification('✅ تم تغيير كلمة المرور بنجاح', 'success') } else showNotification(error.response?.data?.message || 'خطأ في الاتصال بالخادم', 'error') } finally { modalLoading.value = false } }
const closeForgotModalAndLogin = () => { const e = forgotEmail.value; closeForgotModal(); loginForm.email = e; loginForm.password = ''; switchView('login'); showNotification('يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة', 'success') }
const maskEmail = (email) => { if (!email) return ''; const [n, d] = email.split('@'); if (n.length <= 3) return '***@' + d; return n.slice(0, 3) + '***@' + d }

onMounted(async () => {
  resetAllForms(); const se = localStorage.getItem('rememberedEmail'); if (se) { loginForm.email = se; loginForm.rememberMe = true }
  const up = new URLSearchParams(window.location.search); const t = up.get('token'); const u = up.get('user'); const er = up.get('error')
  if (er) { showNotification(decodeURIComponent(er), 'error'); window.history.replaceState({}, document.title, window.location.pathname); return }
  if (t && u) { try { const user = JSON.parse(decodeURIComponent(u)); localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(user)); api.defaults.headers.common['Authorization'] = `Bearer ${t}`; authStore.setToken(t); authStore.setUser(user); showNotification('✅ تم تسجيل الدخول بنجاح', 'success'); setTimeout(async () => { if (user.role === 'admin') router.push('/admin'); else if (user.role === 'vendor') { const id = authStore.vendorId || await authStore.fetchVendorId(); router.push(id ? `/vendor/${id}` : '/become-vendor') } else if (user.role === 'pending') router.push('/pending-vendor'); else router.push('/') }, 1000); window.history.replaceState({}, document.title, window.location.pathname) } catch (e) { showNotification('حدث خطأ في تسجيل الدخول', 'error') } }
})
onUnmounted(() => { if (toastTimeout) clearTimeout(toastTimeout) })
</script>

<style>@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');</style>
<style scoped>
*{margin:0;padding:0;box-sizing:border-box}
.login-page{min-height:100vh;background:linear-gradient(135deg,#08717f 0%,#d40025 100%);font-family:'Amiri','Cairo',serif;direction:rtl;display:flex;align-items:center;justify-content:center;padding:20px}
.login-page *{font-family:'Amiri','Cairo',serif}
.login-wrapper{display:flex;max-width:1200px;width:100%;background:white;border-radius:32px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)}
.brand-column{flex:1;background:linear-gradient(135deg,#08717f 0%,#d40025 100%);padding:48px 40px;display:flex;align-items:center;justify-content:center;color:white;position:relative;overflow:hidden}
.brand-column::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:url('/src/assets/Gemini_Generated_Image_il5b9til5b9til5b.png');background-size:cover;background-position:center;opacity:0.1;pointer-events:none}
.brand-content{position:relative;z-index:2;text-align:center;width:100%}
.logo-container{margin-bottom:32px}.brand-logo{width:120px;height:auto;margin-bottom:16px}
.welcome-message{margin-bottom:48px}.welcome-title{font-size:2rem;font-weight:700;margin-bottom:16px}.welcome-text{font-size:1rem;opacity:0.95;margin-bottom:8px}.welcome-subtext{font-size:0.9rem;opacity:0.85}
.form-column{flex:1;padding:48px 40px;background:white}.form-card{width:100%}
.login-tabs{display:flex;gap:8px;margin-bottom:32px;background:#f1f5f9;padding:4px;border-radius:16px}
.tab-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:transparent;border:none;border-radius:12px;font-size:0.95rem;font-weight:600;color:#64748b;cursor:pointer;transition:all 0.3s ease}
.tab-btn.active{background:white;color:#d40025;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
.social-login{display:flex;gap:12px;margin-bottom:24px}
.social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:white;font-size:0.9rem;font-weight:500;cursor:pointer;transition:all 0.3s ease}
.social-btn:hover{border-color:#d40025;transform:translateY(-2px);box-shadow:0 5px 15px rgba(0,0,0,0.05)}
.social-btn.google{color:#ea4335}.social-btn.facebook{color:#1877f2}
.divider{text-align:center;margin:24px 0;position:relative}
.divider::before,.divider::after{content:'';position:absolute;top:50%;width:calc(50% - 80px);height:1px;background:#e2e8f0}
.divider::before{right:0}.divider::after{left:0}
.divider span{background:white;padding:0 16px;color:#94a3b8;font-size:0.85rem}
.form-container{width:100%}.auth-form{display:flex;flex-direction:column;gap:20px}
.form-group{display:flex;flex-direction:column;gap:6px}.form-label{font-size:0.85rem;font-weight:600;color:#1e293b}
.form-input{width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:0.95rem;transition:all 0.3s ease;background:white}
.form-input:focus{outline:none;border-color:#d40025;box-shadow:0 0 0 3px rgba(212,0,37,0.1)}
.has-error .form-input{border-color:#ef4444}.is-valid .form-input{border-color:#10b981}
.error-message{color:#ef4444;font-size:0.75rem}.success-message{color:#10b981;font-size:0.75rem}
.email-input-wrapper{position:relative;display:flex;align-items:center}
.email-check-spinner{position:absolute;left:12px;width:16px;height:16px;border:2px solid #e2e8f0;border-top:2px solid #08717f;border-radius:50%;animation:spin 0.8s linear infinite}
.email-valid-icon,.email-invalid-icon{position:absolute;left:12px;font-size:1rem}
.password-strength{margin-top:6px}.strength-bar{height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden}.strength-fill{height:100%;transition:width 0.3s ease}.strength-text{font-size:0.7rem;margin-top:4px;display:block}
.password-wrapper{position:relative}.password-input{padding-left:45px}
.toggle-password{position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748b}.toggle-password:hover{color:#d40025}
.form-options{display:flex;align-items:center;justify-content:space-between;margin:5px 0}
.checkbox-label{display:flex;align-items:center;gap:8px;cursor:pointer;color:#475569;font-size:0.85rem}
.checkbox-label input[type='checkbox']{width:16px;height:16px;accent-color:#d40025}
.forgot-link{background:none;border:none;color:#08717f;font-size:0.85rem;font-weight:600;cursor:pointer}.forgot-link:hover{color:#d40025}
.submit-btn{width:100%;padding:14px;background:linear-gradient(135deg,#08717f,#d40025);color:white;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.3s ease;margin-top:10px}
.submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 20px rgba(212,0,37,0.3)}.submit-btn:disabled{opacity:0.6;cursor:not-allowed}
.loading-spinner{display:flex;align-items:center;justify-content:center;gap:8px}
.spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.register-progress{margin-bottom:24px}.progress-steps{display:flex;align-items:center;justify-content:space-between}
.step{display:flex;flex-direction:column;align-items:center}
.step-number{width:32px;height:32px;background:#e2e8f0;color:#64748b;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;margin-bottom:6px;transition:all 0.3s ease}
.step.active .step-number{background:#d40025;color:white}.step.completed .step-number{background:#10b981;color:white}
.step-label{font-size:0.7rem;color:#64748b}.step.active .step-label{color:#d40025;font-weight:600}
.step-line{flex:1;height:2px;background:#e2e8f0;margin:0 8px;margin-top:-12px}.step-line.active{background:#d40025}
.photo-upload-section{text-align:center;margin:20px 0}.avatar-upload-container{display:flex;flex-direction:column;align-items:center;gap:12px}
.avatar-preview-wrapper{position:relative;width:100px;height:100px;border-radius:50%;overflow:hidden;border:3px solid #e2e8f0}.avatar-preview{width:100%;height:100%;object-fit:cover}
.upload-avatar-btn{position:absolute;bottom:5px;right:5px;width:32px;height:32px;background:linear-gradient(135deg,#08717f,#d40025);color:white;border:none;border-radius:50%;cursor:pointer;font-size:1rem;transition:transform 0.3s ease}.upload-avatar-btn:hover{transform:scale(1.1)}
.upload-hint{color:#94a3b8;font-size:0.75rem}.default-hint{color:#08717f;font-size:0.7rem;margin-top:4px}
.skip-option{text-align:center;margin:15px 0}.skip-btn{background:none;border:none;color:#64748b;font-size:0.85rem;cursor:pointer;transition:color 0.3s ease}.skip-btn:hover{color:#d40025}
.form-navigation{display:flex;gap:12px;margin-top:20px}
.nav-btn{flex:1;padding:12px;border:none;border-radius:10px;font-size:0.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s ease}
.back-btn{background:#f1f5f9;color:#64748b}.back-btn:hover{background:#e2e8f0}
.next-btn{background:linear-gradient(135deg,#d40025,#b00020);color:white}.next-btn:hover:not(:disabled){transform:translateX(2px)}.next-btn:disabled{opacity:0.5;cursor:not-allowed}
.form-checkbox{margin:10px 0}
.success-container{text-align:center;padding:20px}.success-icon{font-size:3rem;margin-bottom:16px}
.success-container h3{font-size:1.3rem;color:#1e293b;margin-bottom:8px}.success-container p{color:#64748b;margin-bottom:24px}
.success-actions{display:flex;gap:12px;justify-content:center}
.success-btn{flex:1;padding:12px;border:none;border-radius:10px;font-weight:600;cursor:pointer;transition:all 0.3s ease}
.success-btn.primary{background:linear-gradient(135deg,#08717f,#d40025);color:white}.success-btn.primary:hover{transform:translateY(-2px)}
.success-btn.secondary{background:#f1f5f9;color:#64748b}.success-btn.secondary:hover{background:#e2e8f0}
.action-buttons{display:flex;flex-direction:column;gap:16px;margin-top:32px}
.action-btn{width:100%;padding:14px 20px;border:2px solid #e2e8f0;background:white;border-radius:16px;color:#1e293b;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:space-between}
.action-btn:hover{border-color:#d40025;transform:translateY(-2px);box-shadow:0 5px 15px rgba(0,0,0,0.05)}
.create-account{background:linear-gradient(135deg,#08717f,#065a69);color:white;border:none}.create-account:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(8,113,127,0.3)}
.artisan{display:flex;justify-content:space-between;align-items:center;background:#f8fafc}.btn-highlight{color:#d40025;font-weight:700}.btn-arrow{font-size:1.2rem}
.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000}
.modal-content{background:white;border-radius:28px;width:90%;max-width:420px;animation:modalSlideIn 0.3s ease;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:none}
@keyframes modalSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #e2e8f0;background:white}
.modal-header h3{font-size:1.2rem;font-weight:700;color:#1e293b;margin:0}
.modal-close{width:32px;height:32px;background:#f1f5f9;border:none;border-radius:50%;cursor:pointer;transition:all 0.3s ease;font-size:16px;display:flex;align-items:center;justify-content:center}.modal-close:hover{background:#d40025;color:white;transform:rotate(90deg)}
.modal-body{padding:28px 24px;text-align:center;background:white}.modal-icon{font-size:48px;margin-bottom:16px}
.modal-body h4{font-size:1.3rem;margin-bottom:8px;color:#1e293b;font-weight:700}.modal-body p{color:#64748b;margin-bottom:24px;font-size:0.9rem}
.modal-input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:14px;margin-bottom:20px;font-size:1rem;transition:all 0.3s ease;background:white;direction:ltr}
.modal-input:focus{outline:none;border-color:#d40025;box-shadow:0 0 0 3px rgba(212,0,37,0.1)}
.code-inputs{display:flex;gap:12px;justify-content:center;margin:24px 0;direction:ltr}
.code-input{width:48px;height:56px;border:2px solid #e2e8f0;border-radius:14px;text-align:center;font-size:1.4rem;font-weight:700;direction:ltr;background:white;transition:all 0.3s ease}
.code-input:focus{outline:none;border-color:#d40025;box-shadow:0 0 0 3px rgba(212,0,37,0.1)}
.modal-actions{display:flex;gap:12px;margin-top:20px}
.modal-btn{flex:1;padding:14px;border:none;border-radius:14px;font-weight:600;cursor:pointer;transition:all 0.3s ease;font-size:0.95rem}
.modal-btn.primary{background:linear-gradient(135deg,#08717f,#d40025);color:white}.modal-btn.primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 20px rgba(212,0,37,0.3)}.modal-btn.primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.modal-btn.secondary{background:#f1f5f9;color:#64748b}.modal-btn.secondary:hover{background:#e2e8f0;transform:translateY(-2px)}
.toast-notification{position:fixed;bottom:30px;right:30px;display:flex;align-items:center;gap:12px;padding:14px 24px;background:white;border-radius:50px;box-shadow:0 10px 30px rgba(0,0,0,0.15);z-index:9999;border-right:4px solid;animation:slideInRight 0.3s ease;overflow:hidden}
.toast-notification.success{border-right-color:#10b981}.toast-notification.error{border-right-color:#ef4444}.toast-notification.warning{border-right-color:#f59e0b}.toast-notification.info{border-right-color:#08717f}
@keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.toast-icon{font-size:1.3rem}.toast-message{color:#1e293b;font-size:0.9rem;font-weight:500}
.toast-progress{position:absolute;bottom:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#08717f,#d40025);animation:progress 3s linear forwards}@keyframes progress{from{width:0}to{width:100%}}
.verification-step{text-align:center;padding:20px}
@media(max-width:768px){.login-wrapper{flex-direction:column}.brand-column{padding:32px 24px}.form-column{padding:32px 24px}.social-login{flex-direction:column}.action-buttons{flex-direction:column}.brand-logo{width:100px}.toast-notification{right:20px;left:20px;bottom:16px}}
@media(max-width:480px){.success-actions{flex-direction:column}.code-inputs{gap:6px}.code-input{width:35px;height:40px;font-size:1rem}}
/* ===== DARK MODE POUR LOGIN.VUE ===== */
/* Ajoutez ces styles à la fin de votre section <style scoped> */

/* Fond du formulaire en dark mode */
.login-page.dark-mode .form-column {
  background: #1e1e30 !important;
}

.login-page.dark-mode .form-card {
  background: transparent !important;
}

/* Tabs */
.login-page.dark-mode .login-tabs {
  background: #121220 !important;
}

.login-page.dark-mode .tab-btn {
  color: #94a3b8 !important;
}

.login-page.dark-mode .tab-btn.active {
  background: #2a2a40 !important;
  color: #2dd4bf !important;
}

/* Social buttons */
.login-page.dark-mode .social-btn {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.login-page.dark-mode .social-btn:hover {
  border-color: #2dd4bf !important;
  background: #1a1a2e !important;
}

/* Divider */
.login-page.dark-mode .divider::before,
.login-page.dark-mode .divider::after {
  background: #2a2a40 !important;
}

.login-page.dark-mode .divider span {
  background: #1e1e30 !important;
  color: #94a3b8 !important;
}

/* Labels */
.login-page.dark-mode .form-label {
  color: #cbd5e1 !important;
}

/* Inputs */
.login-page.dark-mode .form-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.login-page.dark-mode .form-input:focus {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15) !important;
}

.login-page.dark-mode .form-input::placeholder {
  color: #64748b !important;
}

/* Password toggle */
.login-page.dark-mode .toggle-password {
  color: #94a3b8 !important;
}

.login-page.dark-mode .toggle-password:hover {
  color: #2dd4bf !important;
}

/* Checkbox */
.login-page.dark-mode .checkbox-label {
  color: #94a3b8 !important;
}

/* Forgot link */
.login-page.dark-mode .forgot-link {
  color: #2dd4bf !important;
}

.login-page.dark-mode .forgot-link:hover {
  color: #5eeadb !important;
}

/* Buttons */
.login-page.dark-mode .back-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.login-page.dark-mode .back-btn:hover {
  background: #3a3a55 !important;
}

.login-page.dark-mode .action-btn {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.login-page.dark-mode .action-btn:hover {
  border-color: #2dd4bf !important;
}

.login-page.dark-mode .action-btn.artisan {
  background: #121220 !important;
}

.login-page.dark-mode .btn-highlight {
  color: #2dd4bf !important;
}

/* Progress steps */
.login-page.dark-mode .step-number {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.login-page.dark-mode .step-label {
  color: #94a3b8 !important;
}

.login-page.dark-mode .step-line {
  background: #2a2a40 !important;
}

/* Avatar upload */
.login-page.dark-mode .avatar-preview-wrapper {
  border-color: #2a2a40 !important;
}

.login-page.dark-mode .upload-hint {
  color: #94a3b8 !important;
}

.login-page.dark-mode .default-hint {
  color: #2dd4bf !important;
}

.login-page.dark-mode .skip-btn {
  color: #94a3b8 !important;
}

.login-page.dark-mode .skip-btn:hover {
  color: #2dd4bf !important;
}

/* Success container */
.login-page.dark-mode .success-container h3 {
  color: #f1f5f9 !important;
}

.login-page.dark-mode .success-container p {
  color: #94a3b8 !important;
}

.login-page.dark-mode .success-btn.secondary {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

/* Modal */
.login-page.dark-mode .modal-content {
  background: #1e1e30 !important;
}

.login-page.dark-mode .modal-header {
  background: #1e1e30 !important;
  border-bottom-color: #2a2a40 !important;
}

.login-page.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.login-page.dark-mode .modal-body {
  background: #1e1e30 !important;
}

.login-page.dark-mode .modal-body h4 {
  color: #f1f5f9 !important;
}

.login-page.dark-mode .modal-body p {
  color: #94a3b8 !important;
}

.login-page.dark-mode .modal-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.login-page.dark-mode .modal-input:focus {
  border-color: #2dd4bf !important;
}

.login-page.dark-mode .modal-close {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.login-page.dark-mode .modal-close:hover {
  background: #ef4444 !important;
  color: white !important;
}

.login-page.dark-mode .modal-btn.secondary {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.login-page.dark-mode .modal-btn.secondary:hover {
  background: #3a3a55 !important;
}

/* Code inputs */
.login-page.dark-mode .code-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.login-page.dark-mode .code-input:focus {
  border-color: #2dd4bf !important;
}

/* Password strength */
.login-page.dark-mode .strength-bar {
  background: #2a2a40 !important;
}

/* Toast */
.login-page.dark-mode .toast-notification {
  background: #1e1e30 !important;
}

.login-page.dark-mode .toast-message {
  color: #f1f5f9 !important;
}

/* Email check spinner */
.login-page.dark-mode .email-check-spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Verification step */
.login-page.dark-mode .verification-step {
  color: #f1f5f9 !important;
}
</style>
