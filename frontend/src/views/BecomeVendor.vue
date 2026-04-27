<!-- frontend/src/views/BecomeVendor.vue - Version avec champs complètement vides -->
<template>
  <div class="become-vendor-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="vendor-wrapper">
      <!-- Left Column - Branding -->
      <div class="brand-column">
        <div class="brand-content">
          <img src="/src/assets/asala logo.svg" alt="ASALA" class="brand-logo" />
          <div class="welcome-message">
            <h2 class="welcome-title">انضم إلينا كحرفي</h2>
            <p class="welcome-text">شارك إبداعاتك مع العالم</p>
            <p class="welcome-subtext">انضم إلى مجتمع الحرفيين التونسيين</p>
          </div>
        </div>
      </div>

      <!-- Right Column - Form -->
      <div class="form-column">
        <div class="form-card">
          <!-- Progress Steps -->
          <div class="progress-container">
            <div class="progress-steps">
              <div v-for="(step, idx) in steps" :key="idx" class="step-wrapper">
                <div class="step" :class="{ active: currentStep >= idx + 1, completed: currentStep > idx + 1 }">
                  <div class="step-number">
                    <span v-if="currentStep > idx + 1">✓</span>
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div class="step-label">{{ step }}</div>
                </div>
                <div v-if="idx < steps.length - 1" class="step-line" :class="{ active: currentStep > idx + 1 }"></div>
              </div>
            </div>
          </div>

          <!-- Step 1: Personal Info -->
          <!-- Step 1: Personal Info -->
<div v-if="currentStep === 1" class="form-step">
  <div class="step-header">
    <div class="step-badge">
      <span>👤</span>
      <span>الخطوة 1/3</span>
    </div>
    <h2 class="step-title">المعلومات الشخصية</h2>
    <p class="step-description">أدخل معلوماتك الأساسية</p>
  </div>

  <form @submit.prevent="validateStep1" class="auth-form" autocomplete="off">
    <!-- Champ: الاسم الكامل -->
    <div class="form-group" :class="{ 'has-error': errors.fullName }">
      <label class="form-label">
        <span>👤</span>
        الاسم الكامل
        <span class="required">*</span>
      </label>
      <input
        type="text"
        v-model="form.fullName"
        class="form-input"
        autocomplete="off"
      />
      <span v-if="errors.fullName" class="error-message">
        {{ errors.fullName }}
      </span>
    </div>

    <!-- Champ: البريد الإلكتروني -->
    <div class="form-group" :class="{ 'has-error': errors.email }">
      <label class="form-label">
        <span>📧</span>
        البريد الإلكتروني
        <span class="required">*</span>
      </label>
      <input
        type="email"
        v-model="form.email"
        class="form-input"
        dir="ltr"
        autocomplete="off"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <!-- Champ: رقم الهاتف -->
    <div class="form-group" :class="{ 'has-error': errors.phone }">
      <label class="form-label">
        <span>📞</span>
        رقم الهاتف
        <span class="required">*</span>
      </label>
      <div class="phone-input-wrapper">
        <span class="country-code">+216</span>
        <input
          type="tel"
          v-model="form.phone"
          class="form-input phone-field"
          maxlength="8"
          autocomplete="off"
        />
      </div>
      <span v-if="errors.phone" class="error-message">
        {{ errors.phone }}
      </span>
    </div>

    <!-- Champ: العنوان -->
    <div class="form-group" :class="{ 'has-error': errors.address }">
      <label class="form-label">
        <span>📍</span>
        العنوان
        <span class="required">*</span>
      </label>
      <input
        type="text"
        v-model="form.address"
        class="form-input"
        autocomplete="off"
      />
      <span v-if="errors.address" class="error-message">
        {{ errors.address }}
      </span>
    </div>

    <!-- Champ: كلمة المرور -->
    <div class="form-group" :class="{ 'has-error': errors.password }">
      <label class="form-label">
        <span>🔒</span>
        كلمة المرور
        <span class="required">*</span>
      </label>
      <div class="password-wrapper">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password"
          class="form-input"
          autocomplete="new-password"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>

    <!-- Champ: تأكيد كلمة المرور -->
    <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
      <label class="form-label">
        <span>🔒</span>
        تأكيد كلمة المرور
        <span class="required">*</span>
      </label>
      <div class="password-wrapper">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="form.confirmPassword"
          class="form-input"
          autocomplete="new-password"
        />
        <button
          type="button"
          class="toggle-password"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          {{ showConfirmPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <span v-if="errors.confirmPassword" class="error-message">
        {{ errors.confirmPassword }}
      </span>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="submit" class="btn-next">
        <span>التالي</span>
        <span>←</span>
      </button>
    </div>
  </form>
</div>
          <!-- Step 2: Store Info -->
          <div v-if="currentStep === 2" class="form-step">
            <div class="step-header">
              <div class="step-badge"><span>🏪</span><span>الخطوة 2/3</span></div>
              <h2 class="step-title">معلومات المتجر</h2>
              <p class="step-description">أخبرنا عن متجرك</p>
            </div>
            <form @submit.prevent="validateStep2" class="auth-form">
              <div class="form-group" :class="{ 'has-error': errors.shopName }">
                <label class="form-label"><span>🏷️</span>اسم المتجر<span class="required">*</span></label>
                <input type="text" v-model="form.shopName" class="form-input" />
                <span v-if="errors.shopName" class="error-message">{{ errors.shopName }}</span>
              </div>

              <div class="form-group" :class="{ 'has-error': errors.specialty }">
                <label class="form-label"><span>🎨</span>التخصص<span class="required">*</span></label>
                <select v-model="form.specialty" class="form-select">
                  <option value="" disabled>اختر تخصصك</option>
                  <option value="pottery">🏺 فخار</option>
                  <option value="textiles">🧵 منسوجات</option>
                  <option value="jewelry">💍 مجوهرات</option>
                  <option value="woodwork">🪵 خشب</option>
                  <option value="metalwork">⚒️ معادن</option>
                  <option value="leather">👜 جلود</option>
                  <option value="other">🎨 أخرى</option>
                </select>
                <span v-if="errors.specialty" class="error-message">{{ errors.specialty }}</span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label"><span>⏳</span>سنوات الخبرة</label>
                  <input type="number" v-model.number="form.experience" class="form-input" min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label"><span>📦</span>عدد المنتجات</label>
                  <input type="number" v-model.number="form.productsCount" class="form-input" min="1" />
                </div>
              </div>

              <div class="form-group" :class="{ 'has-error': errors.description }">
                <label class="form-label"><span>📝</span>وصف النشاط<span class="required">*</span></label>
                <textarea v-model="form.description" class="form-textarea" rows="3"></textarea>
                <div class="char-counter">{{ form.description.length }}/200</div>
                <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-prev" @click="currentStep = 1"><span>→</span><span>السابق</span></button>
                <button type="submit" class="btn-next"><span>التالي</span><span>←</span></button>
              </div>
            </form>
          </div>

          <!-- Step 3: Photos & Confirmation -->
          <div v-if="currentStep === 3" class="form-step">
            <div class="step-header">
              <div class="step-badge"><span>📸</span><span>الخطوة 3/3</span></div>
              <h2 class="step-title">الصور والتأكيد</h2>
              <p class="step-description">أضف صوراً لمتجرك (اختياري)</p>
            </div>

            <form @submit.prevent="submitForm" class="auth-form">
              <!-- Profile Photo -->
              <div class="upload-section">
                <label class="form-label"><span>👤</span>الصورة الشخصية<span class="optional">(اختياري)</span></label>
                <div class="upload-area" :class="{ 'has-preview': profilePreview }" @click="triggerProfileUpload">
                  <input type="file" ref="profileInput" @change="handleProfileUpload" accept="image/*" style="display:none" />
                  <div v-if="!profilePreview" class="upload-placeholder">
                    <div class="upload-icon">📸</div>
                    <p class="upload-text">انقر لإضافة الصورة</p>
                    <p class="upload-hint">PNG, JPG - 5MB max</p>
                  </div>
                  <div v-else class="upload-preview">
                    <img :src="profilePreview" alt="Profile" />
                    <button type="button" class="change-photo-btn" @click.stop="triggerProfileUpload">✏️ تغيير</button>
                  </div>
                </div>
              </div>

              <!-- Cover Photo -->
              <div class="upload-section">
                <label class="form-label"><span>🖼️</span>صورة الغلاف<span class="optional">(اختياري)</span></label>
                <div class="upload-area" :class="{ 'has-preview': coverPreview }" @click="triggerCoverUpload">
                  <input type="file" ref="coverInput" @change="handleCoverUpload" accept="image/*" style="display:none" />
                  <div v-if="!coverPreview" class="upload-placeholder">
                    <div class="upload-icon">🌄</div>
                    <p class="upload-text">انقر لإضافة الغلاف</p>
                    <p class="upload-hint">PNG, JPG - 5MB max</p>
                  </div>
                  <div v-else class="upload-preview cover-preview" :style="{ backgroundImage: `url(${coverPreview})` }">
                    <button type="button" class="change-photo-btn" @click.stop="triggerCoverUpload">✏️ تغيير</button>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-header"><span>👤</span><h3>معلومات الحساب</h3></div>
                  <div class="summary-content">
                    <div class="summary-item"><span>الاسم:</span><span>{{ form.fullName || '—' }}</span></div>
                    <div class="summary-item"><span>البريد:</span><span>{{ form.email || '—' }}</span></div>
                    <div class="summary-item"><span>الهاتف:</span><span>{{ form.phone || '—' }}</span></div>
                    <div class="summary-item"><span>العنوان:</span><span>{{ truncateText(form.address, 25) || '—' }}</span></div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-header"><span>🏪</span><h3>معلومات المتجر</h3></div>
                  <div class="summary-content">
                    <div class="summary-item"><span>اسم المتجر:</span><span>{{ form.shopName || '—' }}</span></div>
                    <div class="summary-item"><span>التخصص:</span><span>{{ getSpecialtyName(form.specialty) || '—' }}</span></div>
                    <div class="summary-item"><span>الخبرة:</span><span>{{ form.experience || 0 }} سنوات</span></div>
                    <div class="summary-item"><span>الوصف:</span><span>{{ truncateText(form.description, 35) || '—' }}</span></div>
                  </div>
                </div>
              </div>

              <!-- Terms -->
              <div class="terms-section">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="form.acceptTerms" />
                  <span class="checkmark"></span>
                  <span class="checkbox-text">أوافق على <a href="#" class="terms-link">الشروط والأحكام</a><span class="required">*</span></span>
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-prev" @click="currentStep = 2"><span>→</span><span>السابق</span></button>
                <button type="submit" class="btn-submit" :disabled="isSubmitting">
                  <span v-if="!isSubmitting">تأكيد التسجيل</span>
                  <div v-else class="loader"></div>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="login-link">
          <p>لديك حساب بالفعل؟</p>
          <router-link to="/login" class="login-link-btn"><span>تسجيل الدخول</span><span>←</span></router-link>
        </div>
      </div>
    </div>

<!-- MODAL SUCCÈS STYLE POP-UP NOIR -->
<transition name="modal">
  <div v-if="showSuccessModal" class="pending-popup-overlay" @click.self="closeSuccessModal">
    <div class="pending-popup" dir="rtl">
      <button class="popup-close" @click="closeSuccessModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="popup-logo">
        <img src="/src/assets/asala logo.svg" alt="أصالة" class="logo-img" />
      </div>

      <div class="popup-icon">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      </div>

      <h2 class="popup-title">تم إنشاء الحساب بنجاح</h2>
      <p class="popup-subtitle">طلبك قيد المراجعة</p>

      <div class="popup-message">
        <span class="message-emoji">⏳</span>
        <p>نرجو منكم التكرّم بالانتظار ريثما تقوم الإدارة بمراجعة طلبكم والموافقة عليه في غضون <strong class="text-gold">24 ساعة</strong>.</p>
      </div>

      <div class="popup-email-section">
        <img src="/src/assets/img12.jpeg" alt="Success" class="email-image" @error="(e) => e.target.style.display = 'none'" />
        <div class="email-content">
          <div class="email-icon-row">
            <span class="email-emoji">📧</span>
            <p class="email-text">سيتم إشعاركم عبر البريد الإلكتروني</p>
          </div>
          <strong class="email-highlight">{{ form.email }}</strong>
          <p class="email-subtext">فور إتمام عملية التفعيل</p>
        </div>
      </div>

      <div class="popup-contact">
        <div class="contact-row">
          <span>📧</span><span>للتواصل مع الإدارة</span>
        </div>
        <a href="mailto:infinty.tunisia@gmail.com" class="contact-link">infinty.tunisia@gmail.com</a>
        <p class="contact-hint">في حال عدم تلقيكم لأي رد، يُرجى التواصل معنا عبر البريد الإلكتروني أعلاه.</p>
      </div>

      <button @click="closeSuccessModal" class="popup-btn">
        <span>🏠</span><span>العودة إلى الصفحة الرئيسية</span>
      </button>
    </div>
  </div>
</transition>
    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <div class="toast-content"><span>{{ toast.icon }}</span><span>{{ toast.message }}</span></div>
        <div class="toast-progress"></div>
      </div>
    </transition>

    <!-- Loading -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay"><div class="spinner"></div><p>جاري المعالجة...</p></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const currentStep = ref(1)
const isSubmitting = ref(false)
const isLoading = ref(false)
const errors = ref({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuccessModal = ref(false)
const steps = ['المعلومات الشخصية', 'معلومات المتجر', 'الصور والتأكيد']

// File handlers
const profileInput = ref(null)
const coverInput = ref(null)
const profilePreview = ref(null)
const coverPreview = ref(null)
const profileFile = ref(null)
const coverFile = ref(null)

// Toast
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// Form data - TOUTES LES VALEURS VIDES
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  shopName: '',
  specialty: '',
  experience: 0,
  description: '',
  acceptTerms: false
})

// ===== UTILS =====
const truncateText = (text, length) => {
  return text?.length > length ? text.substring(0, length) + '...' : text || '—'
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: '🏺 فخار',
    textiles: '🧵 منسوجات',
    jewelry: '💍 مجوهرات',
    woodwork: '🪵 خشب',
    metalwork: '⚒️ معادن',
    leather: '👜 جلود',
    perfumes: '🌸 عطور',
    other: '🎨 أخرى'
  }
  return specialties[specialty] || specialty
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => toast.value.show = false, 3000)
}

// ===== RESET FORM - Vide tous les champs =====
const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.password = ''
  form.confirmPassword = ''
  form.shopName = ''
  form.specialty = ''
  form.experience = 0
  form.description = ''
  form.acceptTerms = false

  profileFile.value = null
  coverFile.value = null
  profilePreview.value = null
  coverPreview.value = null
  currentStep.value = 1
  errors.value = {}
}

// ===== CRÉATION D'UN APERÇU LOCAL =====
const createPreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ===== UPLOAD HANDLERS =====
const triggerProfileUpload = () => profileInput.value?.click()
const triggerCoverUpload = () => coverInput.value?.click()

const handleProfileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    return showNotification('حجم الصورة يجب أن لا يتجاوز 5MB', 'error')
  }
  if (!file.type.startsWith('image/')) {
    return showNotification('الرجاء اختيار صورة صالحة', 'error')
  }

  isLoading.value = true
  try {
    profileFile.value = file
    profilePreview.value = await createPreview(file)
    showNotification('✅ تم تحميل الصورة بنجاح', 'success')
  } catch (error) {
    console.error('❌ Erreur preview:', error)
    showNotification('❌ فشل تحميل الصورة', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    return showNotification('حجم الصورة يجب أن لا يتجاوز 5MB', 'error')
  }
  if (!file.type.startsWith('image/')) {
    return showNotification('الرجاء اختيار صورة صالحة', 'error')
  }

  isLoading.value = true
  try {
    coverFile.value = file
    coverPreview.value = await createPreview(file)
    showNotification('✅ تم تحميل الغلاف بنجاح', 'success')
  } catch (error) {
    console.error('❌ Erreur preview:', error)
    showNotification('❌ فشل تحميل الغلاف', 'error')
  } finally {
    isLoading.value = false
  }
}

// ===== VALIDATION =====
const validateStep1 = () => {
  errors.value = {}

  if (!form.fullName?.trim()) errors.value.fullName = 'الاسم الكامل مطلوب'
  if (!form.email?.trim()) errors.value.email = 'البريد الإلكتروني مطلوب'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.value.email = 'بريد إلكتروني غير صحيح'

  if (!form.phone?.trim()) errors.value.phone = 'رقم الهاتف مطلوب'
  else if (!/^\d{8,}$/.test(form.phone.replace(/\s/g, ''))) errors.value.phone = '8 أرقام على الأقل'

  if (!form.address?.trim()) errors.value.address = 'العنوان مطلوب'

  if (!form.password) errors.value.password = 'كلمة المرور مطلوبة'
  else if (form.password.length < 6) errors.value.password = '6 أحرف على الأقل'

  if (!form.confirmPassword) errors.value.confirmPassword = 'تأكيد كلمة المرور مطلوب'
  else if (form.password !== form.confirmPassword) errors.value.confirmPassword = 'كلمة المرور غير متطابقة'

  if (Object.keys(errors.value).length === 0) {
    currentStep.value = 2
  } else {
    showNotification('الرجاء تصحيح الأخطاء', 'error')
  }
}

const validateStep2 = () => {
  errors.value = {}

  if (!form.shopName?.trim()) errors.value.shopName = 'اسم المتجر مطلوب'
  if (!form.specialty) errors.value.specialty = 'التخصص مطلوب'
  if (!form.description?.trim()) errors.value.description = 'وصف النشاط مطلوب'
  else if (form.description.length < 10) errors.value.description = '10 أحرف على الأقل'

  if (Object.keys(errors.value).length === 0) {
    currentStep.value = 3
  } else {
    showNotification('الرجاء تصحيح الأخطاء', 'error')
  }
}

// ===== SUBMIT =====
// Dans BecomeVendor.vue, remplacer la fonction submitForm existante
// ✅ REMPLACE toute la fonction submitForm par celle-ci
const submitForm = async () => {
  if (!form.acceptTerms) {
    return showNotification('يجب الموافقة على الشروط والأحكام', 'error')
  }

  isSubmitting.value = true
  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('fullName', form.fullName)
    formData.append('email', form.email.toLowerCase().trim())
    formData.append('phone', form.phone.replace(/\s/g, ''))
    formData.append('address', form.address)
    formData.append('password', form.password)
    formData.append('shopName', form.shopName)
    formData.append('specialty', form.specialty)
    formData.append('description', form.description)
    formData.append('location', 'تونس')
    formData.append('experience', form.experience || 0)

    if (profileFile.value) formData.append('avatar', profileFile.value)
    if (coverFile.value) formData.append('coverImage', coverFile.value)

    const response = await api.post('/auth/register-vendor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        authStore.user = response.data.user
        authStore.userRole = response.data.user.role || 'pending'
      }

      resetForm()

      // ✅ AFFICHER LE POP-UP NOIR INTÉGRÉ
      showSuccessModal.value = true
      document.body.style.overflow = 'hidden'

    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'inscription')
    }

  } catch (error) {
    console.error('❌ Erreur submitForm:', error)
    let errorMessage = 'حدث خطأ غير متوقع'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message?.includes('duplicate') || error.message?.includes('already used')) {
      errorMessage = '⚠️ هذا البريد الإلكتروني مسجل بالفعل'
    }
    showNotification(errorMessage, 'error')
    resetForm()
    currentStep.value = 1
  } finally {
    isSubmitting.value = false
    isLoading.value = false
  }
}

// ✅ MODIFIER closeSuccessModal pour le pop-up intégré
const closeSuccessModal = () => {
  showSuccessModal.value = false
  document.body.style.overflow = ''
  router.push('/')
}

// ✅ SUPPRIMER goToHome ou le laisser comme alias
const goToHome = () => {
  closeSuccessModal()
}

// ===== LIFECYCLE =====
onMounted(() => {
  resetForm()

  if (authStore.isAuthenticated) {
    const userRole = authStore.user?.role
    if (userRole === 'vendor') {
      router.push(`/vendor/${authStore.user?.vendorId}`)
    } else if (userRole === 'pending') {
      router.push('/pending-vendor')
    } else {
      router.push('/')
    }
  }
})
</script>

<style scoped>
/* Import Amiri font */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.become-vendor-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* All text uses Amiri font */
.become-vendor-page,
.become-vendor-page * {
  font-family: 'Amiri', 'Cairo', serif;
}

/* Layout */
.vendor-wrapper {
  display: flex;
  max-width: 1400px;
  width: 100%;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
}

/* Left Column */
.brand-column {
  flex: 1;
  background: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-column::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/src/assets/Gemini_Generated_Image_il5b9til5b9til5b.png');
  background-size: cover;
  opacity: 0.15;
  animation: slowZoom 20s infinite alternate;
}

.brand-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.brand-logo { width: 120px; margin-bottom: 32px; filter: brightness(0) invert(1); animation: floatLogo 3s infinite; }

.welcome-title { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 12px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.welcome-text { font-size: 1.1rem; color: white; opacity: 0.95; margin-bottom: 8px; }
.welcome-subtext { font-size: 0.9rem; color: white; opacity: 0.85; }

/* Right Column */
.form-column { flex: 1; padding: 48px 40px; background: white; }

/* Progress */
.progress-container { margin-bottom: 40px; padding: 10px; background: #f1f5f9; border-radius: 60px; }
.progress-steps { display: flex; align-items: center; justify-content: space-between; }
.step-wrapper { display: flex; align-items: center; flex: 1; }
.step { display: flex; flex-direction: column; align-items: center; }
.step-number {
  width: 44px; height: 44px; background: white; border: 2px solid #e2e8f0;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.1rem; color: #64748b; margin-bottom: 8px;
  transition: all 0.3s;
}
.step.active .step-number { background: linear-gradient(135deg, #08717f, #d40025); border-color: transparent; color: white; }
.step.completed .step-number { background: #10b981; border-color: transparent; color: white; }
.step-label { font-size: 0.7rem; color: #64748b; font-weight: 600; white-space: nowrap; }
.step.active .step-label { color: #08717f; font-weight: 700; }
.step-line { flex: 1; height: 2px; background: #e2e8f0; margin: 0 5px; margin-bottom: 25px; border-radius: 2px; }
.step-line.active { background: linear-gradient(135deg, #08717f, #d40025); }

/* Step Header */
.step-header { margin-bottom: 30px; }
.step-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #f1f5f9; border-radius: 30px; font-size: 0.8rem; font-weight: 600; color: #08717f; margin-bottom: 15px; }
.step-title { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
.step-description { color: #64748b; font-size: 0.9rem; }

/* Forms */
.auth-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.required { color: #d40025; font-size: 0.75rem; }
.optional { color: #64748b; font-size: 0.75rem; font-weight: normal; }

.form-input, .form-select, .form-textarea {
  width: 100%; padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 16px;
  font-size: 0.95rem; transition: all 0.3s; background: white; color: #1e293b;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none; border-color: #08717f; box-shadow: 0 0 0 4px rgba(8,113,127,0.1);
}

.phone-input-wrapper { display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.phone-input-wrapper:focus-within { border-color: #08717f; box-shadow: 0 0 0 4px rgba(8,113,127,0.1); }
.country-code { padding: 14px 18px; background: #f1f5f9; color: #08717f; font-weight: 700; border-left: 2px solid #e2e8f0; }
.phone-field { flex: 1; border: none !important; }

.password-wrapper { position: relative; }
.toggle-password { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; }

.select-wrapper { position: relative; }
.select-arrow { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.form-select { appearance: none; padding-left: 40px; }

.char-counter { text-align: left; font-size: 0.7rem; color: #64748b; margin-top: 5px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.has-error .form-input, .has-error .form-select, .has-error .form-textarea, .has-error .phone-input-wrapper { border-color: #ef4444; }
.error-message { color: #ef4444; font-size: 0.75rem; margin-top: 4px; }

/* Upload */
.upload-section { margin-bottom: 20px; }
.upload-area {
  border: 2px dashed #e2e8f0; border-radius: 24px; padding: 30px; text-align: center;
  cursor: pointer; transition: all 0.3s; background: #f8fafc; min-height: 160px;
  display: flex; align-items: center; justify-content: center;
}
.upload-area:hover { border-color: #08717f; background: #f1f5f9; transform: translateY(-2px); }
.upload-area.has-preview { border-style: solid; border-color: #08717f; }
.upload-icon { font-size: 2.5rem; margin-bottom: 12px; animation: float 3s infinite; }
.upload-text { color: #1e293b; font-weight: 600; margin-bottom: 5px; }
.upload-hint { color: #64748b; font-size: 0.75rem; }
.upload-preview { width: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.upload-preview img { max-width: 100%; max-height: 150px; border-radius: 16px; }
.cover-preview { width: 100%; height: 120px; background-size: cover; background-position: center; border-radius: 16px; }
.change-photo-btn {
  position: absolute; bottom: 10px; right: 10px; padding: 6px 12px;
  background: rgba(255,255,255,0.9); border: none; border-radius: 30px;
  cursor: pointer; display: flex; align-items: center; gap: 5px;
  font-weight: 600; font-size: 0.75rem;
}
.change-photo-btn:hover { background: #08717f; color: white; }

/* Summary */
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
.summary-card { background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; transition: all 0.3s; }
.summary-card:hover { border-color: #08717f; transform: translateY(-2px); }
.summary-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
.summary-header h3 { font-size: 0.9rem; color: #1e293b; font-weight: 700; }
.summary-content { display: flex; flex-direction: column; gap: 10px; }
.summary-item { display: flex; justify-content: space-between; font-size: 0.8rem; }
.summary-item span:first-child { color: #64748b; font-weight: 600; }
.summary-item span:last-child { color: #1e293b; font-weight: 600; }

/* Terms */
.terms-section { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; }
.checkbox-label input { position: absolute; opacity: 0; }
.checkmark { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 5px; background: white; transition: all 0.3s; }
.checkbox-label input:checked ~ .checkmark { background: linear-gradient(135deg, #08717f, #d40025); border-color: transparent; }
.checkbox-label input:checked ~ .checkmark::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.7rem; }
.checkbox-text { color: #334155; font-size: 0.85rem; }
.terms-link { color: #08717f; text-decoration: none; font-weight: 600; }
.terms-link:hover { color: #d40025; }

/* Buttons */
.form-actions { display: flex; gap: 15px; margin-top: 20px; }
.btn-prev, .btn-next, .btn-submit {
  flex: 1; padding: 14px; border: none; border-radius: 50px;
  font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-prev { background: #f1f5f9; color: #475569; }
.btn-prev:hover { background: #e2e8f0; transform: translateX(5px); }
.btn-next { background: linear-gradient(135deg, #08717f, #0a94a6); color: white; }
.btn-next:hover { transform: translateX(-5px); }
.btn-submit { background: linear-gradient(135deg, #d40025, #ff1744); color: white; }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.login-link { margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; }
.login-link p { color: #64748b; margin-bottom: 10px; }
.login-link-btn { display: inline-flex; align-items: center; gap: 8px; color: #08717f; text-decoration: none; font-weight: 600; transition: all 0.3s; }
.login-link-btn:hover { color: #d40025; transform: translateX(-5px); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.success-modal { max-width: 550px; width: 90%; background: white; border-radius: 40px; overflow: hidden; text-align: center; padding: 0 30px 40px; }
.success-logo { width: 80px; margin: 20px auto; }
.success-gemini-image { width: 280px; max-width: 100%; border-radius: 20px; margin: 20px 0; }
.success-title { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #08717f, #d40025); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
.success-message-arabic { background: #f8fafc; border-radius: 24px; padding: 20px; margin: 20px 0; border-right: 4px solid #08717f; text-align: right; }
.success-message-arabic p { margin-bottom: 12px; color: #1e293b; }
.contact-info { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 15px 0; padding: 10px; background: white; border-radius: 50px; }
.contact-note { font-size: 0.8rem; color: #64748b; }
.modal-close { position: absolute; top: 15px; left: 15px; width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.05); border: none; cursor: pointer; }
.btn-home { background: linear-gradient(135deg, #08717f, #065a69); color: white; border: none; padding: 14px 32px; border-radius: 50px; font-size: 1rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 12px; margin-top: 20px; }

/* Toast & Loader */
.toast-notification { position: fixed; bottom: 30px; right: 30px; background: white; border-radius: 50px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); z-index: 9999; min-width: 300px; overflow: hidden; }
.toast-content { display: flex; align-items: center; gap: 12px; padding: 16px 24px; }
.toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #10b981, #08717f); animation: progress 3s linear; }
.toast-notification.success { border-right: 4px solid #10b981; }
.toast-notification.error { border-right: 4px solid #ef4444; }

.loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000; }
.spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #08717f; border-right: 4px solid #d40025; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
.loader { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }

/* Animations */
@keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
@keyframes floatLogo { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes progress { from { width: 0; } to { width: 100%; } }

/* Dark Mode */
.become-vendor-page.dark-mode { background: linear-gradient(135deg, #065a69 0%, #b00020 100%); }
.dark-mode .vendor-wrapper { background: #1f2937; }
.dark-mode .brand-column { background: linear-gradient(135deg, #065a69 0%, #b00020 100%); }
.dark-mode .form-column { background: #1f2937; }
.dark-mode .progress-container { background: #374151; }
.dark-mode .step-number { background: #1f2937; border-color: #4b5563; color: #9ca3af; }
.dark-mode .step.active .step-number { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.dark-mode .step.completed .step-number { background: #10b981; }
.dark-mode .step-label, .dark-mode .step-description, .dark-mode .char-counter { color: #9ca3af; }
.dark-mode .step-title, .dark-mode .summary-header h3, .dark-mode .summary-item span:last-child { color: #f3f4f6; }
.dark-mode .form-label, .dark-mode .upload-text { color: #e5e7eb; }
.dark-mode .form-input, .dark-mode .form-select, .dark-mode .form-textarea { background: #374151; border-color: #4b5563; color: #f3f4f6; }
.dark-mode .phone-input-wrapper, .dark-mode .upload-area { background: #374151; border-color: #4b5563; }
.dark-mode .country-code { background: #374151; border-left-color: #4b5563; color: #3b82f6; }
.dark-mode .summary-card, .dark-mode .terms-section { background: #374151; border-color: #4b5563; }
.dark-mode .btn-prev { background: #374151; color: #9ca3af; }
.dark-mode .btn-prev:hover { background: #4b5563; }
.dark-mode .success-modal { background: #1f2937; }
.dark-mode .success-message-arabic { background: #374151; }
.dark-mode .success-message-arabic p { color: #e5e7eb; }
.dark-mode .contact-info { background: #1f2937; }
.dark-mode .toast-notification { background: #1f2937; }
.dark-mode .toast-message { color: #f3f4f6; }

/* Responsive */
@media (max-width: 1024px) { .vendor-wrapper { flex-direction: column; max-width: 600px; } .brand-column, .form-column { padding: 40px 30px; } }
@media (max-width: 768px) {
  .become-vendor-page { padding: 16px; }
  .step-label { font-size: 0.6rem; }
  .step-number { width: 36px; height: 36px; font-size: 0.9rem; }
  .step-title { font-size: 1.4rem; }
  .form-row, .summary-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .btn-prev, .btn-next, .btn-submit { width: 100%; }
  .success-title { font-size: 1.4rem; }
  .toast-notification { width: calc(100% - 32px); right: 16px; bottom: 16px; }
}
@media (max-width: 480px) {
  .welcome-title { font-size: 1.5rem; }
  .step-title { font-size: 1.2rem; }
  .phone-input-wrapper { flex-direction: column; }
  .country-code { border-left: none; border-bottom: 2px solid #e2e8f0; text-align: center; }
  .summary-item { flex-direction: column; align-items: flex-start; gap: 5px; }
  .success-gemini-image { width: 220px; }
}
/* ===== VARIABLES ===== */
:root {
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --gradient-primary: linear-gradient(135deg, #08717f, #d40025);
  --gradient-teal: linear-gradient(135deg, #08717f, #0a94a6);
  --gradient-red: linear-gradient(135deg, #d40025, #ff1744);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.2);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.become-vendor-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
}

/* ===== DARK MODE STYLES ===== */
.become-vendor-page.dark-mode {
  background: linear-gradient(135deg, #065a69 0%, #b00020 100%);
}

.dark-mode .vendor-wrapper {
  background: #1f2937;
}

.dark-mode .brand-column {
  background: linear-gradient(135deg, #065a69 0%, #b00020 100%);
}

.dark-mode .form-column {
  background: #1f2937;
}

.dark-mode .progress-container {
  background: #374151;
}

.dark-mode .step-number {
  background: #1f2937;
  border-color: #4b5563;
  color: #9ca3af;
}

.dark-mode .step.active .step-number {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.dark-mode .step.completed .step-number {
  background: #10b981;
}

.dark-mode .step-label {
  color: #9ca3af;
}

.dark-mode .step.active .step-label {
  color: #3b82f6;
}

.dark-mode .step-line {
  background: #4b5563;
}

.dark-mode .step-badge {
  background: #374151;
  color: #3b82f6;
}

.dark-mode .step-title {
  color: #f3f4f6;
}

.dark-mode .step-description {
  color: #9ca3af;
}

.dark-mode .form-label {
  color: #e5e7eb;
}

.dark-mode .form-input,
.dark-mode .form-select,
.dark-mode .form-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark-mode .form-input:focus,
.dark-mode .form-select:focus,
.dark-mode .form-textarea:focus {
  border-color: #3b82f6;
}

.dark-mode .phone-input-wrapper {
  border-color: #4b5563;
}

.dark-mode .country-code {
  background: #374151;
  border-left-color: #4b5563;
  color: #3b82f6;
}

.dark-mode .toggle-password {
  color: #9ca3af;
}

.dark-mode .upload-area {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .upload-area:hover {
  border-color: #3b82f6;
  background: #4b5563;
}

.dark-mode .upload-text {
  color: #e5e7eb;
}

.dark-mode .upload-hint {
  color: #9ca3af;
}

.dark-mode .summary-card {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .summary-header {
  border-bottom-color: #4b5563;
}

.dark-mode .summary-title {
  color: #f3f4f6;
}

.dark-mode .item-label {
  color: #9ca3af;
}

.dark-mode .item-value {
  color: #e5e7eb;
}

.dark-mode .terms-section {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .checkbox-text {
  color: #e5e7eb;
}

.dark-mode .checkmark {
  background: #1f2937;
  border-color: #4b5563;
}

.dark-mode .login-link {
  border-top-color: #4b5563;
}

.dark-mode .login-link p {
  color: #9ca3af;
}

.dark-mode .login-link-btn {
  color: #3b82f6;
}

.dark-mode .btn-prev {
  background: #374151;
  color: #9ca3af;
}

.dark-mode .btn-prev:hover {
  background: #4b5563;
}

.dark-mode .success-modal {
  background: #1f2937;
}

.dark-mode .success-title {
  background: linear-gradient(135deg, #3b82f6, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-mode .success-message-arabic {
  background: #374151;
  border-right-color: #3b82f6;
}

.dark-mode .message-text {
  color: #e5e7eb;
}

.dark-mode .highlight {
  color: #3b82f6;
}

.dark-mode .email-highlight {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.dark-mode .contact-info {
  background: #1f2937;
}

.dark-mode .contact-email {
  color: #3b82f6;
}

.dark-mode .contact-note {
  color: #9ca3af;
}

.dark-mode .toast-notification {
  background: #1f2937;
}

.dark-mode .toast-message {
  color: #f3f4f6;
}

/* ===== TWO COLUMNS LAYOUT ===== */
.vendor-wrapper {
  display: flex;
  max-width: 1400px;
  width: 100%;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  transition: all 0.3s ease;
}

/* ===== LEFT COLUMN - BRANDING ===== */
.brand-column {
  flex: 1;
  background: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.brand-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/src/assets/Gemini_Generated_Image_il5b9til5b9til5b.png');
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  pointer-events: none;
  animation: slowZoom 20s ease-in-out infinite alternate;
}

@keyframes slowZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.brand-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}

.logo-container {
  margin-bottom: 32px;
}

.brand-logo {
  width: 120px;
  height: auto;
  margin-bottom: 16px;
  filter: brightness(0) invert(1);
  animation: floatLogo 3s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.welcome-message {
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.welcome-text {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 8px;
}

.welcome-subtext {
  font-size: 0.9rem;
  opacity: 0.85;
}

/* ===== RIGHT COLUMN - FORM ===== */
.form-column {
  flex: 1;
  padding: 48px 40px;
  background: white;
  transition: all 0.3s ease;
}

.form-card {
  width: 100%;
}

/* Progress Steps */
.progress-container {
  margin-bottom: 40px;
  padding: 10px;
  background: #f1f5f9;
  border-radius: 60px;
  transition: all 0.3s ease;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 8px;
  transition: var(--transition);
}

.step.active .step-number {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.2);
  animation: pulse 2s infinite;
}

.step.completed .step-number {
  background: #10b981;
  border-color: transparent;
  color: white;
}

.check-icon {
  font-size: 1.2rem;
}

.step-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.step.active .step-label {
  color: var(--primary-teal);
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 5px;
  margin-bottom: 25px;
  border-radius: 2px;
}

.step-line.active {
  background: var(--gradient-primary);
  animation: progress 1s ease;
}

/* Step Header */
.step-header {
  margin-bottom: 30px;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #f1f5f9;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-teal);
  margin-bottom: 15px;
}

.step-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.step-description {
  color: #64748b;
  font-size: 0.9rem;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.label-icon {
  font-size: 1rem;
}

.required {
  color: var(--primary-red);
  font-size: 0.75rem;
}

.optional {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: normal;
}

.input-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  transition: var(--transition);
  background: white;
  color: #1e293b;
  font-family: 'Cairo', sans-serif;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.1);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.form-input:focus ~ .input-border,
.form-select:focus ~ .input-border,
.form-textarea:focus ~ .input-border {
  width: 100%;
}

/* Phone Input */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-input-wrapper:focus-within {
  border-color: var(--primary-teal);
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.1);
}

.country-code {
  padding: 14px 18px;
  background: #f1f5f9;
  color: var(--primary-teal);
  font-weight: 700;
  border-left: 2px solid #e2e8f0;
}

.phone-field {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
}

/* Password Toggle */
.password-wrapper {
  position: relative;
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
  transition: var(--transition);
}

.toggle-password:hover {
  color: var(--primary-teal);
}

/* Select */
.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.8rem;
  pointer-events: none;
}

.form-select {
  appearance: none;
  padding-left: 40px;
}

/* Textarea */
.char-counter {
  text-align: left;
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 5px;
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Error States */
.has-error .form-input,
.has-error .form-select,
.has-error .form-textarea,
.has-error .phone-input-wrapper {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  animation: shake 0.3s ease;
}

/* Upload Area */
.upload-section {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: var(--radius-xl);
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: #f8fafc;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--primary-teal);
  background: #f1f5f9;
  transform: translateY(-2px);
}

.upload-area.has-preview {
  border-style: solid;
  border-color: var(--primary-teal);
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

.upload-text {
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 5px;
}

.upload-hint {
  color: #64748b;
  font-size: 0.75rem;
}

.upload-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-preview img {
  max-width: 100%;
  max-height: 150px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.cover-preview {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-lg);
}

.change-photo-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(5px);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  color: #334155;
  font-weight: 600;
  font-size: 0.75rem;
}

.change-photo-btn:hover {
  background: var(--primary-teal);
  color: white;
  transform: scale(1.05);
}

/* Summary Cards */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.summary-card {
  background: #f8fafc;
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: var(--transition);
}

.summary-card:hover {
  border-color: var(--primary-teal);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.summary-icon {
  font-size: 1.2rem;
}

.summary-title {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 700;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.item-label {
  color: #64748b;
  font-weight: 600;
}

.item-value {
  color: #1e293b;
  font-weight: 600;
}

.item-value.description {
  max-width: 120px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Terms Section */
.terms-section {
  margin: 15px 0;
  padding: 15px;
  background: #f8fafc;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  position: relative;
  transition: var(--transition);
  background: white;
}

.checkbox-label input:checked ~ .checkmark {
  background: var(--gradient-primary);
  border-color: transparent;
}

.checkbox-label input:checked ~ .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.7rem;
}

.checkbox-text {
  color: #334155;
  font-size: 0.85rem;
}

.terms-link {
  color: var(--primary-teal);
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  color: var(--primary-red);
  text-decoration: underline;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-prev,
.btn-next,
.btn-submit {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-prev {
  background: #f1f5f9;
  color: #475569;
}

.btn-prev:hover {
  background: #e2e8f0;
  transform: translateX(5px);
}

.btn-next {
  background: var(--gradient-teal);
  color: white;
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.btn-next:hover {
  transform: translateX(-5px);
  box-shadow: 0 12px 30px rgba(8, 113, 127, 0.4);
}

.btn-submit {
  background: var(--gradient-red);
  color: white;
  box-shadow: 0 8px 20px rgba(212, 0, 37, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(212, 0, 37, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Login Link */
.login-link {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.login-link p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.login-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-teal);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
}

.login-link-btn:hover {
  color: var(--primary-red);
  transform: translateX(-5px);
}

/* ===== SUCCESS MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.success-modal {
  max-width: 550px;
  width: 90%;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  background: transparent;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.modal-close:hover {
  background: #d40025;
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 30px 40px;
  text-align: center;
}

.success-logo-wrapper {
  margin-bottom: 20px;
}

.success-logo {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(8, 113, 127, 0.3));
  animation: bounceLogo 0.6s ease;
}

.success-icon-wrapper {
  margin-bottom: 20px;
}

.success-gemini-image {
  width: 280px;
  max-width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: scaleUp 0.5s ease;
}

.success-content {
  margin-top: 20px;
}

.success-title {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  animation: fadeInUp 0.5s ease;
}

.success-message-arabic {
  background: #f8fafc;
  border-radius: 24px;
  padding: 20px;
  margin: 20px 0;
  border-right: 4px solid #08717f;
  text-align: right;
}

.message-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #1e293b;
  margin-bottom: 12px;
}

.message-text:last-child {
  margin-bottom: 0;
}

.highlight {
  color: #08717f;
  font-weight: 800;
  font-size: 1.1rem;
}

.email-highlight {
  color: #d40025;
  font-weight: 700;
  background: rgba(212, 0, 37, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.contact-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
  padding: 10px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  font-size: 1.2rem;
}

.contact-email {
  color: #08717f;
  font-weight: 600;
  font-size: 0.9rem;
  direction: ltr;
}

.contact-note {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 10px;
}

.modal-actions {
  margin-top: 30px;
}

.btn-home {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(8, 113, 127, 0.4);
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: white;
  border-radius: 50px;
  box-shadow: var(--shadow-2xl);
  z-index: 9999;
  min-width: 300px;
  overflow: hidden;
  animation: slideInRight 0.3s ease;
  border: 1px solid #e2e8f0;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
}

.toast-icon {
  font-size: 1.3rem;
}

.toast-message {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  flex: 1;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, var(--primary-teal));
  animation: progress 3s linear;
}

.toast-notification.success {
  border-right: 4px solid #10b981;
}

.toast-notification.error {
  border-right: 4px solid #ef4444;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid var(--primary-teal);
  border-right: 4px solid var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 1rem;
}

/* Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes bounceLogo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(8, 113, 127, 0.1); }
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive */
@media (max-width: 1024px) {
  .vendor-wrapper {
    flex-direction: column;
    max-width: 600px;
  }

  .brand-column {
    padding: 40px 30px;
  }

  .form-column {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .become-vendor-page {
    padding: 16px;
  }

  .brand-column {
    padding: 30px 24px;
  }

  .form-column {
    padding: 30px 24px;
  }

  .step-label {
    font-size: 0.6rem;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .step-title {
    font-size: 1.4rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-prev,
  .btn-next,
  .btn-submit {
    width: 100%;
  }

  .success-title {
    font-size: 1.4rem;
  }

  .success-modal {
    width: 95%;
  }

  .modal-body {
    padding: 0 20px 30px;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
    right: 16px;
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-text {
    font-size: 0.9rem;
  }

  .step-badge {
    font-size: 0.7rem;
  }

  .step-title {
    font-size: 1.2rem;
  }

  .phone-input-wrapper {
    flex-direction: column;
  }

  .country-code {
    border-left: none;
    border-bottom: 2px solid #e2e8f0;
    text-align: center;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .item-value.description {
    max-width: 100%;
    text-align: right;
  }

  .success-gemini-image {
    width: 220px;
  }

  .message-text {
    font-size: 0.85rem;
  }
}
/* ===== BOUTON SUIVANT / NEXT BUTTON ===== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 15px;
}

.btn-next {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #08717f 0%, #0a94a6 100%);
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Cairo', sans-serif;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(8, 113, 127, 0.3);
}

/* Effet de brillance au survol */
.btn-next::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-next:hover::before {
  left: 100%;
}

.btn-next:hover {
  transform: translateX(-5px);
  box-shadow: 0 8px 25px rgba(8, 113, 127, 0.4);
  background: linear-gradient(135deg, #0a94a6 0%, #08717f 100%);
}

.btn-next:active {
  transform: translateX(-2px) scale(0.98);
}

/* Texte du bouton */
.btn-text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Icône du bouton */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-next:hover .btn-icon {
  transform: translateX(-4px);
}

/* ===== MODE SOMBRE ===== */
.dark-mode .btn-next {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.dark-mode .btn-next:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

/* ===== VARIANTE POUR LE BOUTON PRÉCÉDENT ===== */
.btn-prev {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 32px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Cairo', sans-serif;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-prev:hover {
  background: #e2e8f0;
  transform: translateX(5px);
  color: #1e293b;
}

.btn-prev:active {
  transform: translateX(2px) scale(0.98);
}

.dark-mode .btn-prev {
  background: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.dark-mode .btn-prev:hover {
  background: #4b5563;
  color: #f3f4f6;
}

/* ===== BOUTON DE SOUMISSION (SUBMIT) ===== */
.btn-submit {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #d40025 0%, #ff1744 100%);
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Cairo', sans-serif;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 0, 37, 0.3);
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 0, 37, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0px) scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dark-mode .btn-submit {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* ===== ANIMATION DE CHARGEMENT ===== */
.loader {
  width: 20px;
  height: 20px;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-next,
  .btn-prev,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .btn-next:hover {
    transform: translateY(-2px);
  }

  .btn-prev:hover {
    transform: translateY(-2px);
  }
}

@media (max-width: 480px) {
  .btn-next,
  .btn-prev,
  .btn-submit {
    padding: 12px 24px;
    font-size: 0.9rem;
  }

  .btn-icon {
    font-size: 1rem;
  }
}
/* ===== POP-UP NOIR (styles du PendingVendor) ===== */
.pending-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.pending-popup {
  position: relative;
  background: linear-gradient(160deg, #0a0a0a 0%, #111827 30%, #1a1a2e 60%, #0f0f1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 40px 28px 28px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  direction: rtl;
  font-family: 'Amiri', 'Cairo', serif;
}

.popup-close {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.popup-close:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  transform: rotate(90deg);
}

.popup-logo { margin-bottom: 20px; }
.logo-img { height: 45px; filter: brightness(1.2); }

.popup-icon { margin-bottom: 16px; display: flex; justify-content: center; }
.icon-circle {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.25);
}
.icon-circle svg { width: 32px; height: 32px; stroke: white; }

.popup-title { font-size: 1.5rem; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
.popup-subtitle { font-size: 0.9rem; color: rgba(255, 255, 255, 0.45); margin-bottom: 20px; }

.popup-message {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: right;
}
.message-emoji { font-size: 1.6rem; display: block; margin-bottom: 10px; text-align: center; }
.popup-message p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); line-height: 1.8; margin: 0; }
.text-gold { color: #fbbf24; font-weight: 700; }

.popup-email-section {
  display: flex; align-items: center; gap: 14px;
  background: rgba(8, 113, 127, 0.1);
  border: 1px solid rgba(8, 113, 127, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: right;
}
.email-image { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
.email-content { flex: 1; }
.email-icon-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.email-emoji { font-size: 1rem; }
.email-text { font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); margin: 0; }
.email-highlight { display: block; font-size: 0.95rem; font-weight: 700; color: #2dd4bf; }
.email-subtext { font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); margin: 0; }

.popup-contact {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 20px;
}
.contact-row { display: flex; align-items: center; justify-content: center; gap: 6px; color: rgba(255, 255, 255, 0.55); margin-bottom: 8px; }
.contact-link { display: block; font-weight: 700; color: #60a5fa; text-decoration: none; direction: ltr; margin-bottom: 8px; }
.contact-hint { font-size: 0.75rem; color: rgba(255, 255, 255, 0.35); margin: 0; }

.popup-btn {
  width: 100%; padding: 14px 20px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white; border: none; border-radius: 14px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.3s ease;
}
.popup-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(8, 113, 127, 0.35); }
</style>
