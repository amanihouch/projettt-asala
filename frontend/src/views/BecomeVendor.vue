<!-- frontend/src/views/BecomeVendor.vue -->
<template>
  <div class="become-vendor-page">
    <!-- Background Particles -->
    <div class="bg-particles"></div>

    <!-- Header -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">انضم كبائع</h1>
          <p class="page-subtitle">ابدأ رحلتك معنا وشارك إبداعاتك</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <div class="form-card glass-effect">
          <!-- Progress Steps -->
          <div class="progress-container">
            <div class="progress-steps">
              <div v-for="(step, index) in steps" :key="index" class="step-wrapper">
                <div
                  class="step"
                  :class="{
                    active: currentStep >= index + 1,
                    completed: currentStep > index + 1,
                  }"
                >
                  <div class="step-number">
                    <span v-if="currentStep > index + 1" class="check-icon">✓</span>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div class="step-label">{{ step }}</div>
                </div>
                <div
                  v-if="index < steps.length - 1"
                  class="step-line"
                  :class="{ active: currentStep > index + 1 }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Step 1: Personal Information -->
          <div v-if="currentStep === 1" class="form-step" key="step1">
            <h2 class="step-title">
              <span class="title-icon">👤</span>
              المعلومات الشخصية
            </h2>
            <p class="step-description">أدخل معلوماتك الأساسية لإنشاء الحساب</p>

            <form @submit.prevent="validateStep1" class="elegant-form">
              <!-- Full Name -->
              <div class="form-group" :class="{ 'has-error': errors.fullName }">
                <label class="form-label">
                  <span class="label-icon">👤</span>
                  الاسم الكامل
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    v-model="form.fullName"
                    class="form-input"
                    placeholder="أدخل اسمك الكامل"
                  />
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
              </div>

              <!-- Email -->
              <div class="form-group" :class="{ 'has-error': errors.email }">
                <label class="form-label">
                  <span class="label-icon">📧</span>
                  البريد الإلكتروني
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="email"
                    v-model="form.email"
                    class="form-input"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <!-- Phone -->
              <div class="form-group" :class="{ 'has-error': errors.phone }">
                <label class="form-label">
                  <span class="label-icon">📞</span>
                  رقم الهاتف
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper phone-input">
                  <span class="phone-code">+216</span>
                  <input
                    type="tel"
                    v-model="form.phone"
                    class="form-input phone-field"
                    placeholder="XX XXX XXX"
                    maxlength="8"
                  />
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>

              <!-- Address -->
              <div class="form-group" :class="{ 'has-error': errors.address }">
                <label class="form-label">
                  <span class="label-icon">📍</span>
                  العنوان
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    v-model="form.address"
                    class="form-input"
                    placeholder="أدخل عنوانك الكامل"
                  />
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
              </div>

              <!-- Password -->
              <div class="form-group" :class="{ 'has-error': errors.password }">
                <label class="form-label">
                  <span class="label-icon">🔒</span>
                  كلمة المرور
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper password-wrapper">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="form.password"
                    class="form-input"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  >
                    <span v-if="!showPassword">👁️</span>
                    <span v-else>👁️‍🗨️</span>
                  </button>
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>

              <!-- Confirm Password -->
              <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
                <label class="form-label">
                  <span class="label-icon">🔒</span>
                  تأكيد كلمة المرور
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper password-wrapper">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="form.confirmPassword"
                    class="form-input"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <span v-if="!showConfirmPassword">👁️</span>
                    <span v-else>👁️‍🗨️</span>
                  </button>
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.confirmPassword" class="error-message">{{
                  errors.confirmPassword
                }}</span>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-next">
                  <span class="btn-text">التالي</span>
                  <span class="btn-icon">←</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Store Information -->
          <div v-if="currentStep === 2" class="form-step" key="step2">
            <h2 class="step-title">
              <span class="title-icon">🏪</span>
              معلومات المتجر
            </h2>
            <p class="step-description">أخبرنا عن متجرك ومنتجاتك</p>

            <form @submit.prevent="validateStep2" class="elegant-form">
              <!-- Shop Name -->
              <div class="form-group" :class="{ 'has-error': errors.shopName }">
                <label class="form-label">
                  <span class="label-icon">🏷️</span>
                  اسم المتجر
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    v-model="form.shopName"
                    class="form-input"
                    placeholder="اختر اسماً مميزاً لمتجرك"
                  />
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.shopName" class="error-message">{{ errors.shopName }}</span>
              </div>

              <!-- Specialty -->
              <div class="form-group" :class="{ 'has-error': errors.specialty }">
                <label class="form-label">
                  <span class="label-icon">🎨</span>
                  التخصص
                  <span class="required">*</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="form.specialty" class="form-select">
                    <option value="" disabled selected>اختر تخصصك</option>
                    <option value="pottery">🏺 فخار وسيراميك</option>
                    <option value="textiles">🧵 منسوجات وسجاد</option>
                    <option value="jewelry">💍 مجوهرات</option>
                    <option value="woodwork">🪵 أعمال خشبية</option>
                    <option value="metalwork">⚒️ أعمال معدنية</option>
                    <option value="leather">👜 منتجات جلدية</option>
                    <option value="other">🎨 أخرى</option>
                  </select>
                  <div class="select-arrow">▼</div>
                </div>
                <span v-if="errors.specialty" class="error-message">{{ errors.specialty }}</span>
              </div>

              <!-- Experience & Products -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-icon">⏳</span>
                    سنوات الخبرة
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="form.experience"
                      class="form-input"
                      placeholder="0"
                      min="0"
                    />
                    <div class="input-border"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="label-icon">📦</span>
                    عدد المنتجات
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="number"
                      v-model.number="form.productsCount"
                      class="form-input"
                      placeholder="0"
                      min="1"
                    />
                    <div class="input-border"></div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="form-group" :class="{ 'has-error': errors.description }">
                <label class="form-label">
                  <span class="label-icon">📝</span>
                  وصف النشاط
                  <span class="required">*</span>
                </label>
                <div class="textarea-wrapper">
                  <textarea
                    v-model="form.description"
                    class="form-textarea"
                    rows="4"
                    placeholder="صف منتجاتك، تقنياتك، المواد التي تستخدمها..."
                  ></textarea>
                  <div class="input-border"></div>
                </div>
                <span v-if="errors.description" class="error-message">{{
                  errors.description
                }}</span>
                <div class="char-counter">{{ form.description.length }}/200</div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-prev" @click="currentStep = 1">
                  <span class="btn-icon">→</span>
                  <span class="btn-text">السابق</span>
                </button>
                <button type="submit" class="btn-next">
                  <span class="btn-text">التالي</span>
                  <span class="btn-icon">←</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Photos & Confirmation -->
          <div v-if="currentStep === 3" class="form-step" key="step3">
            <h2 class="step-title">
              <span class="title-icon">📸</span>
              الصور والتأكيد
            </h2>
            <p class="step-description">أضف صوراً لمتجرك (اختياري)</p>

            <form @submit.prevent="submitForm" class="elegant-form">
              <!-- Profile Photo Upload -->
              <div class="upload-section">
                <label class="form-label">
                  <span class="label-icon">👤</span>
                  الصورة الشخصية
                  <span class="optional">(اختياري)</span>
                </label>

                <div
                  class="upload-area profile-upload"
                  :class="{ 'has-preview': profilePreview }"
                  @click="triggerProfileUpload"
                >
                  <input
                    type="file"
                    ref="profileInput"
                    @change="handleProfileUpload"
                    accept="image/*"
                    style="display: none"
                  />

                  <div v-if="!profilePreview" class="upload-placeholder">
                    <div class="upload-icon">📸</div>
                    <p class="upload-text">انقر لإضافة الصورة</p>
                    <p class="upload-hint">PNG, JPG - حجم أقصى 2MB</p>
                  </div>

                  <div v-else class="upload-preview">
                    <img :src="profilePreview" alt="Profile" />
                    <button
                      type="button"
                      class="change-photo-btn"
                      @click.stop="triggerProfileUpload"
                    >
                      <span class="change-icon">✏️</span>
                      <span class="change-text">تغيير</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cover Photo Upload -->
              <div class="upload-section">
                <label class="form-label">
                  <span class="label-icon">🖼️</span>
                  صورة الغلاف
                  <span class="optional">(اختياري)</span>
                </label>

                <div
                  class="upload-area cover-upload"
                  :class="{ 'has-preview': coverPreview }"
                  @click="triggerCoverUpload"
                >
                  <input
                    type="file"
                    ref="coverInput"
                    @change="handleCoverUpload"
                    accept="image/*"
                    style="display: none"
                  />

                  <div v-if="!coverPreview" class="upload-placeholder">
                    <div class="upload-icon">🌄</div>
                    <p class="upload-text">انقر لإضافة الغلاف</p>
                    <p class="upload-hint">PNG, JPG - حجم أقصى 2MB</p>
                  </div>

                  <div
                    v-else
                    class="upload-preview cover-preview"
                    :style="{ backgroundImage: `url(${coverPreview})` }"
                  >
                    <button type="button" class="change-photo-btn" @click.stop="triggerCoverUpload">
                      <span class="change-icon">✏️</span>
                      <span class="change-text">تغيير</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Summary Cards -->
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-header">
                    <span class="summary-icon">👤</span>
                    <h3 class="summary-title">معلومات الحساب</h3>
                  </div>
                  <div class="summary-content">
                    <div class="summary-item">
                      <span class="item-label">الاسم:</span>
                      <span class="item-value">{{ form.fullName }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">البريد:</span>
                      <span class="item-value">{{ form.email }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">الهاتف:</span>
                      <span class="item-value">{{ form.phone }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">العنوان:</span>
                      <span class="item-value">{{ form.address }}</span>
                    </div>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-header">
                    <span class="summary-icon">🏪</span>
                    <h3 class="summary-title">معلومات المتجر</h3>
                  </div>
                  <div class="summary-content">
                    <div class="summary-item">
                      <span class="item-label">اسم المتجر:</span>
                      <span class="item-value">{{ form.shopName }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">التخصص:</span>
                      <span class="item-value">{{ getSpecialtyName(form.specialty) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">الخبرة:</span>
                      <span class="item-value">{{ form.experience || 0 }} سنوات</span>
                    </div>
                    <div class="summary-item">
                      <span class="item-label">الوصف:</span>
                      <span class="item-value description">{{
                        truncateText(form.description, 50)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Terms -->
              <div class="terms-section">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="form.acceptTerms" />
                  <span class="checkmark"></span>
                  <span class="checkbox-text">
                    أوافق على <a href="#" class="terms-link">الشروط والأحكام</a>
                    <span class="required">*</span>
                  </span>
                </label>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <button type="button" class="btn-prev" @click="currentStep = 2">
                  <span class="btn-icon">→</span>
                  <span class="btn-text">السابق</span>
                </button>
                <button type="submit" class="btn-submit" :disabled="isSubmitting">
                  <span v-if="!isSubmitting" class="btn-text">تأكيد التسجيل</span>
                  <div v-else class="loader"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <div class="toast-progress" :style="{ animationDuration: '3s' }"></div>
      </div>
    </transition>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p class="loading-text">جاري المعالجة...</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'

const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()

// ===== STATE =====
const currentStep = ref(1)
const isSubmitting = ref(false)
const isLoading = ref(false)
const errors = ref({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const steps = ['المعلومات الشخصية', 'معلومات المتجر', 'الصور والتأكيد']

// File inputs
const profileInput = ref(null)
const coverInput = ref(null)

// Previews
const profilePreview = ref(null)
const coverPreview = ref(null)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// Form Data
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '123456',
  confirmPassword: '123456',
  shopName: '',
  specialty: '',
  experience: 0,
  productsCount: 0,
  description: '',
  acceptTerms: false,
})

// ===== UTILS =====
const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: '🏺 فخار وسيراميك',
    textiles: '🧵 منسوجات وسجاد',
    jewelry: '💍 مجوهرات',
    woodwork: '🪵 أعمال خشبية',
    metalwork: '⚒️ أعمال معدنية',
    leather: '👜 منتجات جلدية',
    other: '🎨 أخرى',
  }
  return specialties[specialty] || specialty
}

// ===== NOTIFICATION =====
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

// ===== IMAGE COMPRESSION =====
const compressImage = (base64, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }
  })
}

// ===== UPLOAD HANDLERS =====
const triggerProfileUpload = () => {
  profileInput.value.click()
}

const triggerCoverUpload = () => {
  coverInput.value.click()
}

const handleProfileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن لا يتجاوز 5MB', 'error')
    return
  }

  isLoading.value = true

  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = async (e) => {
    try {
      const compressed = await compressImage(e.target.result, 300, 0.7)
      profilePreview.value = compressed
      showNotification('✅ تم تحميل الصورة بنجاح', 'success')
    } catch (error) {
      showNotification('❌ فشل تحميل الصورة', 'error')
    } finally {
      isLoading.value = false
    }
  }
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن لا يتجاوز 5MB', 'error')
    return
  }

  isLoading.value = true

  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = async (e) => {
    try {
      const compressed = await compressImage(e.target.result, 800, 0.8)
      coverPreview.value = compressed
      showNotification('✅ تم تحميل الغلاف بنجاح', 'success')
    } catch (error) {
      showNotification('❌ فشل تحميل الغلاف', 'error')
    } finally {
      isLoading.value = false
    }
  }
}

// ===== VALIDATION =====
const validateStep1 = () => {
  errors.value = {}

  if (!form.fullName) errors.value.fullName = 'الاسم الكامل مطلوب'
  if (!form.email) errors.value.email = 'البريد الإلكتروني مطلوب'
  else if (!form.email.includes('@')) errors.value.email = 'بريد إلكتروني غير صحيح'
  if (!form.phone) errors.value.phone = 'رقم الهاتف مطلوب'
  else if (form.phone.length < 8) errors.value.phone = '8 أرقام على الأقل'
  if (!form.address) errors.value.address = 'العنوان مطلوب'
  if (!form.password) errors.value.password = 'كلمة المرور مطلوبة'
  else if (form.password.length < 6) errors.value.password = '6 أحرف على الأقل'
  if (!form.confirmPassword) errors.value.confirmPassword = 'تأكيد كلمة المرور مطلوب'
  else if (form.password !== form.confirmPassword)
    errors.value.confirmPassword = 'كلمة المرور غير متطابقة'

  if (Object.keys(errors.value).length === 0) {
    currentStep.value = 2
  } else {
    showNotification('الرجاء تصحيح الأخطاء', 'error')
  }
}

const validateStep2 = () => {
  errors.value = {}

  if (!form.shopName) errors.value.shopName = 'اسم المتجر مطلوب'
  if (!form.specialty) errors.value.specialty = 'التخصص مطلوب'
  if (!form.description) errors.value.description = 'وصف النشاط مطلوب'
  else if (form.description.length < 10) errors.value.description = '10 أحرف على الأقل'

  if (Object.keys(errors.value).length === 0) {
    currentStep.value = 3
  } else {
    showNotification('الرجاء تصحيح الأخطاء', 'error')
  }
}

// ===== SUBMIT =====
const submitForm = async () => {
  if (!form.acceptTerms) {
    showNotification('يجب الموافقة على الشروط والأحكام', 'error')
    return
  }

  isSubmitting.value = true
  isLoading.value = true

  try {
    // Format phone
    let formattedPhone = form.phone
    if (!formattedPhone.startsWith('+') && !formattedPhone.startsWith('0')) {
      formattedPhone = '+216' + formattedPhone
    }

    // Prepare images
    const randomAvatarNum = Math.floor(Math.random() * 70)
    const defaultAvatar = `https://i.pravatar.cc/300?img=${randomAvatarNum}`
    const defaultCover = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'

    const avatar = profilePreview.value || defaultAvatar
    const coverImage = coverPreview.value || defaultCover

    // Register user
    const userData = {
      name: form.fullName,
      email: form.email,
      phone: formattedPhone,
      password: form.password,
      role: 'vendor',
      address: form.address,
      avatar,
    }

    console.log('📝 Tentative inscription:', userData.email)

    const registerResponse = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const registerResult = await registerResponse.json()
    console.log('📦 Réponse register:', registerResult)

    let token
    let backendUser

    if (!registerResponse.ok) {
      // Si l'utilisateur existe déjà, essayer de se connecter
      if (registerResult.message && registerResult.message.includes('existe déjà')) {
        console.log('🔄 Utilisateur existe, tentative de connexion...')

        const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        })

        const loginResult = await loginResponse.json()
        console.log('📦 Réponse login:', loginResult)

        if (!loginResponse.ok) {
          throw new Error(loginResult.message || 'Erreur de connexion')
        }

        token = loginResult.token
        backendUser = loginResult.user || loginResult.data?.user
      } else {
        throw new Error(registerResult.message || "Erreur d'inscription")
      }
    } else {
      token = registerResult.token
      backendUser = registerResult.user || registerResult.data?.user
    }

    if (!backendUser || !backendUser.id) {
      console.error('❌ Utilisateur invalide:', backendUser)
      throw new Error('Utilisateur non trouvé')
    }

    console.log('✅ Utilisateur connecté ID:', backendUser.id)

    // Create vendor profile
    const vendorData = {
      userId: backendUser.id,
      shopName: form.shopName,
      specialty: form.specialty,
      description: form.description,
      location: 'تونس',
      coverImage,
      experience: form.experience || 0,
    }

    console.log('📤 Création vendeur:', vendorData)

    const vendorResponse = await fetch('http://localhost:5000/api/v1/vendors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vendorData),
    })

    const vendorResult = await vendorResponse.json()
    console.log('📦 Réponse vendeur:', vendorResult)

    if (!vendorResponse.ok) {
      throw new Error(vendorResult.message || 'Erreur création vendeur')
    }

    // Extract vendor ID
    let vendorId = null

    if (vendorResult.data?.vendor?.id) {
      vendorId = vendorResult.data.vendor.id
    } else if (vendorResult.data?.id) {
      vendorId = vendorResult.data.id
    } else if (vendorResult.vendor?.id) {
      vendorId = vendorResult.vendor.id
    } else if (vendorResult.id) {
      vendorId = vendorResult.id
    }

    console.log('✅ ID vendeur extrait:', vendorId)

    if (!vendorId) {
      console.error('❌ Structure réponse:', vendorResult)
      throw new Error('ID du vendeur manquant')
    }

    // Save to auth store
    authStore.setToken(token)
    authStore.setUser(backendUser)

    // ✅ SAUVEGARDE DE L'ID DU VENDEUR
    console.log('🚀 Sauvegarde de vendorId:', vendorId)

    // Méthode 1: via l'action du store
    authStore.setVendorId(vendorId)

    // Méthode 2: direct dans l'état
    authStore.vendorId = vendorId

    // Méthode 3: localStorage direct
    localStorage.setItem('vendorId', vendorId)

    // Vérification
    console.log('✅ authStore.vendorId =', authStore.vendorId)
    console.log('✅ localStorage vendorId =', localStorage.getItem('vendorId'))

    // Create vendor in local store
    const newVendor = {
      id: vendorId,
      name: form.fullName,
      shopName: form.shopName,
      email: form.email,
      phone: formattedPhone,
      avatar,
      coverImage,
      specialty: form.specialty,
      description: form.description,
      location: 'تونس',
      experience: form.experience || 0,
      verified: false,
      productsCount: 0,
      followersCount: 0,
      createdAt: new Date().toISOString(),
    }

    console.log('📦 Sauvegarde du vendeur dans le store:', newVendor)
    vendorStore.createVendor(newVendor)

    showNotification('✅ تم إنشاء حسابك بنجاح!')

    setTimeout(() => {
      router.push(`/vendor/${vendorId}`)
    }, 2000)

  } catch (error) {
    console.error('❌ Erreur:', error)
    showNotification('❌ ' + (error.message || 'حدث خطأ'), 'error')
  } finally {
    isSubmitting.value = false
    isLoading.value = false
  }
}
</script>

<style scoped>
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
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  position: relative;
  overflow-x: hidden;
}

/* Background Particles */
.bg-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 10% 20%, rgba(8, 113, 127, 0.03) 0%, transparent 30%),
    radial-gradient(circle at 90% 70%, rgba(212, 0, 37, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 30% 80%, rgba(8, 113, 127, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* ===== HEADER ===== */
.page-header {
  padding: 60px 0 30px;
  text-align: center;
  position: relative;
}

.header-content {
  animation: slideDown 0.8s ease;
}

.page-title {
  font-size: 3rem;
  font-weight: 900;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: var(--shadow-lg);
}

.page-subtitle {
  color: var(--neutral-600);
  font-size: 1.1rem;
  font-weight: 500;
}

/* ===== FORM CARD ===== */
.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  padding: 40px 30px;
  box-shadow: var(--shadow-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 60px;
  animation: slideUp 0.6s ease 0.2s both;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* ===== PROGRESS STEPS ===== */
.progress-container {
  margin-bottom: 40px;
  padding: 10px;
  background: var(--neutral-100);
  border-radius: 60px;
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
  border: 2px solid var(--neutral-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--neutral-600);
  margin-bottom: 8px;
  transition: var(--transition);
  box-shadow: var(--shadow-md);
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
  font-size: 0.75rem;
  color: var(--neutral-500);
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
  background: var(--neutral-300);
  margin: 0 5px;
  margin-bottom: 25px;
  border-radius: 2px;
}

.step-line.active {
  background: var(--gradient-primary);
  animation: progress 1s ease;
}

/* ===== FORM STEPS ===== */
.form-step {
  animation: fadeIn 0.5s ease;
}

.step-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--neutral-800);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 2rem;
}

.step-description {
  color: var(--neutral-500);
  margin-bottom: 30px;
  font-size: 0.95rem;
}

/* ===== FORM GROUPS ===== */
.elegant-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neutral-700);
  margin-bottom: 8px;
}

.label-icon {
  font-size: 1.1rem;
}

.required {
  color: var(--primary-red);
  font-size: 0.8rem;
  margin-right: 2px;
}

.optional {
  color: var(--neutral-400);
  font-size: 0.8rem;
  font-weight: normal;
  margin-right: 5px;
}

.input-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  transition: var(--transition);
  background: white;
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
.phone-input {
  display: flex;
  align-items: center;
}

.phone-code {
  padding: 14px 18px;
  background: var(--neutral-100);
  border: 2px solid var(--neutral-200);
  border-left: none;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  color: var(--primary-teal);
  font-weight: 700;
}

.phone-field {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  border-left: none;
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
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--neutral-400);
  transition: var(--transition);
  padding: 4px;
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
  color: var(--neutral-400);
  font-size: 0.8rem;
  pointer-events: none;
}

.form-select {
  appearance: none;
  padding-left: 40px;
}

/* Textarea */
.textarea-wrapper {
  position: relative;
}

.char-counter {
  text-align: left;
  font-size: 0.7rem;
  color: var(--neutral-400);
  margin-top: 5px;
}

/* Error States */
.has-error .form-input,
.has-error .form-select,
.has-error .form-textarea {
  border-color: var(--primary-red);
  background: #fff5f5;
}

.error-message {
  color: var(--primary-red);
  font-size: 0.75rem;
  margin-top: 5px;
  display: block;
  animation: shake 0.3s ease;
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* ===== UPLOAD AREAS ===== */
.upload-section {
  margin-bottom: 25px;
}

.upload-area {
  border: 2px dashed var(--neutral-300);
  border-radius: var(--radius-xl);
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--neutral-50);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.profile-upload {
  min-height: 200px;
}

.cover-upload {
  min-height: 150px;
}

.upload-area:hover {
  border-color: var(--primary-teal);
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.05), rgba(212, 0, 37, 0.05));
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
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

.upload-text {
  color: var(--neutral-600);
  font-weight: 600;
  margin-bottom: 5px;
}

.upload-hint {
  color: var(--neutral-400);
  font-size: 0.8rem;
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
  max-height: 180px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.cover-preview {
  width: 100%;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-lg);
}

.change-photo-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: var(--transition);
  box-shadow: var(--shadow-lg);
  color: var(--neutral-700);
  font-weight: 600;
  font-size: 0.85rem;
}

.change-photo-btn:hover {
  background: white;
  transform: translateY(-2px);
  color: var(--primary-teal);
}

.change-icon {
  font-size: 0.9rem;
}

/* ===== SUMMARY CARDS ===== */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--neutral-200);
  transition: var(--transition);
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--primary-teal);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--neutral-200);
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-title {
  font-size: 1rem;
  color: var(--neutral-800);
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
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-200);
}

.summary-item:last-child {
  border-bottom: none;
}

.item-label {
  color: var(--neutral-500);
  font-size: 0.8rem;
  font-weight: 600;
}

.item-value {
  color: var(--neutral-800);
  font-size: 0.9rem;
  font-weight: 700;
}

.item-value.description {
  max-width: 150px;
  text-align: left;
}

/* ===== TERMS CHECKBOX ===== */
.terms-section {
  margin: 20px 0;
  padding: 15px;
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
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
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  width: 22px;
  height: 22px;
  border: 2px solid var(--neutral-300);
  border-radius: 6px;
  position: relative;
  transition: var(--transition);
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
  font-size: 0.8rem;
  font-weight: 700;
}

.checkbox-text {
  color: var(--neutral-700);
  font-size: 0.9rem;
}

.terms-link {
  color: var(--primary-teal);
  text-decoration: none;
  font-weight: 700;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: var(--primary-red);
  text-decoration: underline;
}

/* ===== BUTTONS ===== */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-prev,
.btn-next,
.btn-submit {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.btn-prev {
  background: white;
  color: var(--neutral-700);
  border: 2px solid var(--neutral-300);
}

.btn-prev:hover {
  background: var(--neutral-100);
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
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(212, 0, 37, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-next:hover .btn-icon {
  transform: translateX(-5px);
}

.btn-prev:hover .btn-icon {
  transform: translateX(5px);
}

/* Loader */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== TOAST ===== */
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
  color: var(--neutral-800);
  font-size: 0.95rem;
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
  border-right: 4px solid var(--primary-red);
}

.toast-notification.info {
  border-right: 4px solid var(--primary-teal);
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
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
  border: 4px solid var(--neutral-200);
  border-top: 4px solid var(--primary-teal);
  border-right: 4px solid var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: var(--neutral-700);
  font-size: 1.1rem;
  font-weight: 600;
}

/* ===== ANIMATIONS ===== */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(8, 113, 127, 0.1);
  }
}

@keyframes progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.2rem;
  }

  .form-card {
    padding: 30px 20px;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .step-number {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
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

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .step-title {
    font-size: 1.5rem;
  }

  .phone-input {
    flex-direction: column;
    gap: 10px;
  }

  .phone-code {
    border-radius: var(--radius-lg);
    border: 2px solid var(--neutral-200);
    text-align: center;
  }

  .phone-field {
    border-radius: var(--radius-lg);
    border: 2px solid var(--neutral-200);
  }

  .upload-area {
    padding: 20px;
  }

  .change-photo-btn {
    position: static;
    margin-top: 10px;
  }
}
</style>
