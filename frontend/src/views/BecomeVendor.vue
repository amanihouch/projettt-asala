<!-- frontend/src/views/BecomeVendor.vue -->
<template>
  <div class="become-vendor-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">إنشاء حساب بائع</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="form-card">
          <!-- Progress Steps -->
          <div class="progress-steps">
            <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <span class="step-number">1</span>
              <span class="step-label">المعلومات الشخصية</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
            <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <span class="step-number">2</span>
              <span class="step-label">معلومات المتجر</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
            <div class="step" :class="{ active: currentStep >= 3 }">
              <span class="step-number">3</span>
              <span class="step-label">التأكيد</span>
            </div>
          </div>

          <!-- Step 1 -->
          <div v-if="currentStep === 1" class="form-step">
            <h2 class="step-title">المعلومات الشخصية</h2>
            <div class="form-group">
              <label class="form-label">الاسم الكامل <span class="required">*</span></label>
              <input
                type="text"
                v-model="form.fullName"
                class="form-input"
                placeholder="مثال: أحمد البائع"
              />
              <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني <span class="required">*</span></label>
              <input
                type="email"
                v-model="form.email"
                class="form-input"
                placeholder="example@email.com"
                dir="ltr"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">رقم الهاتف <span class="required">*</span></label>
              <input
                type="tel"
                v-model="form.phone"
                class="form-input"
                placeholder="XX XXX XXX"
                dir="ltr"
              />
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">العنوان <span class="required">*</span></label>
              <input
                type="text"
                v-model="form.address"
                class="form-input"
                placeholder="العنوان الكامل"
              />
              <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">كلمة المرور <span class="required">*</span></label>
              <input
                type="password"
                v-model="form.password"
                class="form-input"
                placeholder="********"
              />
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">تأكيد كلمة المرور <span class="required">*</span></label>
              <input
                type="password"
                v-model="form.confirmPassword"
                class="form-input"
                placeholder="********"
              />
              <span v-if="errors.confirmPassword" class="error-message">{{
                errors.confirmPassword
              }}</span>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-next" @click="validateStep1">
                التالي <span class="btn-icon">←</span>
              </button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-if="currentStep === 2" class="form-step">
            <h2 class="step-title">معلومات المتجر</h2>
            <div class="form-group">
              <label class="form-label">اسم المتجر <span class="required">*</span></label>
              <input
                type="text"
                v-model="form.shopName"
                class="form-input"
                placeholder="اختر اسماً لمتجرك"
              />
              <span v-if="errors.shopName" class="error-message">{{ errors.shopName }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">التخصص <span class="required">*</span></label>
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
              <span v-if="errors.specialty" class="error-message">{{ errors.specialty }}</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">سنوات الخبرة</label>
                <input
                  type="number"
                  v-model.number="form.experience"
                  class="form-input"
                  placeholder="عدد السنوات"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">عدد المنتجات</label>
                <input
                  type="number"
                  v-model.number="form.productsCount"
                  class="form-input"
                  placeholder="تقريباً"
                  min="1"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">وصف النشاط <span class="required">*</span></label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                rows="4"
                placeholder="صف منتجاتك، تقنياتك، موادك..."
              ></textarea>
              <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-prev" @click="currentStep = 1">
                <span class="btn-icon">→</span> السابق
              </button>
              <button type="button" class="btn-next" @click="validateStep2">
                التالي <span class="btn-icon">←</span>
              </button>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-if="currentStep === 3" class="form-step">
            <h2 class="step-title">الصور والتأكيد</h2>
            <!-- Uploads -->
            <div class="form-group">
              <label class="form-label"
                ><span class="label-icon">👤</span>الصورة الشخصية
                <span class="optional">(اختياري)</span></label
              >
              <div class="profile-upload-area" @click="triggerProfileUpload">
                <input
                  type="file"
                  ref="profileInput"
                  @change="handleProfileUpload"
                  accept="image/*"
                  style="display: none"
                />
                <div v-if="!profilePreview" class="upload-placeholder">
                  <span class="upload-icon">📸</span>
                  <p>انقر لإضافة الصورة الشخصية</p>
                  <span class="upload-hint">PNG, JPG - حجم أقصى 2MB</span>
                </div>
                <div v-else class="profile-preview">
                  <img :src="profilePreview" alt="Profile" />
                  <button type="button" class="change-photo-btn" @click.stop="triggerProfileUpload">
                    تغيير
                  </button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label"
                ><span class="label-icon">🖼️</span>صورة الغلاف
                <span class="optional">(اختياري)</span></label
              >
              <div class="cover-upload-area" @click="triggerCoverUpload">
                <input
                  type="file"
                  ref="coverInput"
                  @change="handleCoverUpload"
                  accept="image/*"
                  style="display: none"
                />
                <div v-if="!coverPreview" class="upload-placeholder">
                  <span class="upload-icon">🌄</span>
                  <p>انقر لإضافة صورة الغلاف</p>
                  <span class="upload-hint">PNG, JPG - حجم أقصى 2MB</span>
                </div>
                <div
                  v-else
                  class="cover-preview"
                  :style="{ backgroundImage: `url(${coverPreview})` }"
                >
                  <button type="button" class="change-photo-btn" @click.stop="triggerCoverUpload">
                    تغيير
                  </button>
                </div>
              </div>
            </div>
            <!-- Résumé -->
            <div class="summary-card">
              <h3 class="summary-title">معلومات الحساب</h3>
              <div class="summary-item">
                <span class="summary-label">الاسم:</span
                ><span class="summary-value">{{ form.fullName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">البريد الإلكتروني:</span
                ><span class="summary-value">{{ form.email }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">الهاتف:</span
                ><span class="summary-value">{{ form.phone }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">العنوان:</span
                ><span class="summary-value">{{ form.address }}</span>
              </div>
            </div>
            <div class="summary-card">
              <h3 class="summary-title">معلومات المتجر</h3>
              <div class="summary-item">
                <span class="summary-label">اسم المتجر:</span
                ><span class="summary-value">{{ form.shopName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">التخصص:</span
                ><span class="summary-value">{{ getSpecialtyName(form.specialty) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">سنوات الخبرة:</span
                ><span class="summary-value">{{ form.experience || 0 }} سنوات</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">الوصف:</span
                ><span class="summary-value">{{ form.description.substring(0, 50) }}...</span>
              </div>
            </div>
            <div class="form-checkbox">
              <label
                ><input type="checkbox" v-model="form.acceptTerms" /><span
                  >أوافق على الشروط والأحكام <span class="required">*</span></span
                ></label
              >
            </div>
            <div class="form-actions">
              <button type="button" class="btn-prev" @click="currentStep = 2">
                <span class="btn-icon">→</span> السابق
              </button>
              <button type="button" class="btn-submit" @click="submitForm" :disabled="isSubmitting">
                <span v-if="!isSubmitting">تأكيد التسجيل</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vondorStore' // Assurez-vous que le nom correspond

const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()

const currentStep = ref(1)
const isSubmitting = ref(false)
const errors = ref({})
const profileInput = ref(null)
const coverInput = ref(null)
const profilePreview = ref(null)
const coverPreview = ref(null)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

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

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
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

const validateStep1 = () => {
  errors.value = {}
  if (!form.fullName) errors.value.fullName = 'الاسم الكامل مطلوب'
  if (!form.email) errors.value.email = 'البريد الإلكتروني مطلوب'
  else if (!form.email.includes('@')) errors.value.email = 'بريد إلكتروني غير صحيح'
  if (!form.phone) errors.value.phone = 'رقم الهاتف مطلوب'
  else if (form.phone.length < 8) errors.value.phone = 'رقم الهاتف يجب أن يكون 8 أرقام'
  if (!form.address) errors.value.address = 'العنوان مطلوب'
  if (!form.password) errors.value.password = 'كلمة المرور مطلوبة'
  else if (form.password.length < 6)
    errors.value.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  if (!form.confirmPassword) errors.value.confirmPassword = 'تأكيد كلمة المرور مطلوب'
  else if (form.password !== form.confirmPassword)
    errors.value.confirmPassword = 'كلمة المرور غير متطابقة'

  if (Object.keys(errors.value).length === 0) currentStep.value = 2
  else showNotification('الرجاء تصحيح الأخطاء', 'error')
}

const validateStep2 = () => {
  errors.value = {}
  if (!form.shopName) errors.value.shopName = 'اسم المتجر مطلوب'
  if (!form.specialty) errors.value.specialty = 'التخصص مطلوب'
  if (!form.description) errors.value.description = 'وصف النشاط مطلوب'
  else if (form.description.length < 10)
    errors.value.description = 'الوصف قصير جداً (10 أحرف على الأقل)'

  if (Object.keys(errors.value).length === 0) currentStep.value = 3
  else showNotification('الرجاء تصحيح الأخطاء', 'error')
}

const triggerProfileUpload = () => profileInput.value.click()
const handleProfileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن لا يتجاوز 2MB', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => (profilePreview.value = e.target.result)
  reader.readAsDataURL(file)
}

const triggerCoverUpload = () => coverInput.value.click()
const handleCoverUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showNotification('حجم الصورة يجب أن لا يتجاوز 2MB', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => (coverPreview.value = e.target.result)
  reader.readAsDataURL(file)
}

const submitForm = async () => {
  if (!form.acceptTerms) {
    showNotification('يجب الموافقة على الشروط والأحكام', 'error')
    return
  }
  isSubmitting.value = true

  try {
    let formattedPhone = form.phone
    if (!formattedPhone.startsWith('+') && !formattedPhone.startsWith('0'))
      formattedPhone = '+216' + formattedPhone

    const randomAvatarNum = Math.floor(Math.random() * 70)
    const defaultAvatar = `https://i.pravatar.cc/300?img=${randomAvatarNum}`
    const defaultCover = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'
    const avatar = profilePreview.value || defaultAvatar
    const coverImage = coverPreview.value || defaultCover

    // 1. Register user
    const registerResponse = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.fullName,
        email: form.email,
        phone: formattedPhone,
        password: form.password,
        role: 'vendor',
        avatar,
      }),
    })
    const registerResult = await registerResponse.json()
    let token, backendUser

    if (!registerResponse.ok) {
      if (registerResult.message === 'Un utilisateur avec cet email existe déjà') {
        const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        const loginResult = await loginResponse.json()
        if (!loginResponse.ok) throw new Error('Impossible de se connecter')
        token = loginResult.token
        backendUser = loginResult.user
      } else {
        throw new Error(registerResult.message || "Erreur d'inscription")
      }
    } else {
      token = registerResult.token
      backendUser = registerResult.user
    }

    // 2. Auth store
    authStore.setToken(token)
    authStore.setUser(backendUser)

    // 3. Create vendor profile
    const vendorData = {
      userId: backendUser.id,
      shopName: form.shopName,
      specialty: form.specialty,
      description: form.description,
      location: 'تونس',
      coverImage,
      // experience n'est pas inclus
    }
    // Après la création du vendeur
    const createdVendor = await vendorStore.createVendor(vendorData)
    console.log('✅ Vendeur créé :', createdVendor)
    console.log('✅ ID du vendeur (à utiliser) :', createdVendor.id)

    // Redirection vers le profil vendeur avec l'ID du vendeur
    showNotification('✅ تم إنشاء حسابك بنجاح!')
    setTimeout(() => {
      router.push(`/vendor/${createdVendor.id}`)
    }, 2000)
  } catch (error) {
    console.error('❌ Erreur :', error)
    showNotification('❌ ' + (error.message || 'حدث خطأ'), 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* ===== (votre style existant, gardez-le) ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.become-vendor-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  padding: 40px 0;
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 0 10px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 1.1rem;
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
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-align: center;
}

.step.active .step-label {
  color: #d40025;
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 10px;
  margin-top: -20px;
}

.step-line.active {
  background: #d40025;
}

/* Form Steps */
.form-step {
  animation: fadeIn 0.3s ease;
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

.step-title {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 30px;
  text-align: center;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.label-icon {
  font-size: 1.1rem;
}

.required {
  color: #d40025;
}

.optional {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: normal;
  margin-right: 5px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 16px center;
  padding-left: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.error-message {
  color: #d40025;
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Upload Areas */
.profile-upload-area,
.cover-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-upload-area {
  min-height: 200px;
}

.cover-upload-area {
  min-height: 150px;
}

.profile-upload-area:hover,
.cover-upload-area:hover {
  border-color: #08717f;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 10px;
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
}

/* Previews */
.profile-preview {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-preview {
  width: 100%;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
}

.change-photo-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px 15px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-photo-btn:hover {
  background: white;
  transform: translateY(-2px);
}

/* Summary Cards */
.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.summary-title {
  font-size: 1.1rem;
  color: #08717f;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #64748b;
  font-weight: 600;
}

.summary-value {
  color: #1e293b;
  font-weight: 600;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-prev,
.btn-next,
.btn-submit {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-prev {
  background: #f1f5f9;
  color: #64748b;
}

.btn-prev:hover {
  background: #e2e8f0;
}

.btn-next {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-submit {
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

/* Checkbox */
.form-checkbox {
  margin: 15px 0;
}

.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1e293b;
  font-size: 0.95rem;
}

.form-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #d40025;
}

/* Loading Spinner */
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
  .page-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 30px 20px;
  }

  .progress-steps .step-label {
    font-size: 0.7rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .summary-item {
    flex-direction: column;
    gap: 5px;
    text-align: right;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
