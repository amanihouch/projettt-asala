<!-- frontend/src/views/VendorEdit.vue - Version finale qui fonctionne -->
<template>
  <div class="vendor-edit-page" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <div class="container">
      <div class="page-header">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          العودة
        </button>
        <h1 class="page-title">تعديل الملف الشخصي</h1>
        <p class="page-subtitle">قم بتحديث معلومات متجرك</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المعلومات...</p>
      </div>

      <div v-else-if="vendor" class="edit-form">
        <form @submit.prevent="saveChanges">
          <div class="form-group">
            <label class="form-label">اسم المتجر *</label>
            <input type="text" v-model="form.shopName" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">التخصص *</label>
            <select v-model="form.specialty" class="form-select" required>
              <option value="pottery">🏺 فخار وسيراميك</option>
              <option value="textiles">🧵 منسوجات وسجاد</option>
              <option value="jewelry">💍 مجوهرات</option>
              <option value="woodwork">🪵 أعمال خشبية</option>
              <option value="metalwork">⚒️ أعمال معدنية</option>
              <option value="leather">👜 منتجات جلدية</option>
              <option value="other">🎨 أخرى</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">وصف المتجر</label>
            <textarea v-model="form.description" class="form-textarea" rows="4" placeholder="صف متجرك، منتجاتك، وتقنياتك..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">الموقع</label>
            <input type="text" v-model="form.location" class="form-input" placeholder="مثال: تونس، مدنين" />
          </div>

          <div class="form-group">
            <label class="form-label">سنوات الخبرة</label>
            <input type="number" v-model.number="form.experience" class="form-input" min="0" placeholder="0" />
          </div>

          <div class="form-group">
            <label class="form-label">رقم الهاتف</label>
            <div class="phone-input-wrapper">
              <span class="country-code">+216</span>
              <input type="tel" v-model="form.phone" class="form-input phone-field" placeholder="XX XXX XXX" maxlength="8" dir="ltr" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">العنوان</label>
            <textarea v-model="form.address" class="form-textarea" rows="2" placeholder="عنوانك الكامل"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="goBack">إلغاء</button>
            <button type="submit" class="btn-save" :disabled="isSaving">
              <span v-if="!isSaving">حفظ التغييرات</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </form>
      </div>

      <div v-else class="not-found">
        <h2>المتجر غير موجود</h2>
        <button class="back-btn" @click="goBack">العودة</button>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const loading = ref(true)
const isSaving = ref(false)
const vendor = ref(null)

const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

const form = reactive({
  shopName: '',
  specialty: '',
  description: '',
  location: '',
  experience: 0,
  phone: '',
  address: '',
})

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const goBack = () => {
  if (vendor.value?.id) {
    router.push(`/vendor/${vendor.value.id}`)
  } else {
    router.push('/')
  }
}

const loadVendorData = async () => {
  const vendorId = route.params.id

  if (!vendorId) {
    showNotification('معرف المتجر غير صحيح', 'error')
    setTimeout(() => router.push('/'), 1500)
    return
  }

  loading.value = true

  try {
    const vendorData = await vendorStore.fetchVendorById(vendorId)

    if (vendorData) {
      vendor.value = vendorData

      const vendorUserId = vendorData.userId || vendorData.user_id
      if (authStore.user?.id !== vendorUserId) {
        showNotification('غير مسموح لك بتعديل هذا الملف', 'error')
        setTimeout(() => router.push(`/vendor/${vendorId}`), 1500)
        return
      }

      form.shopName = vendorData.shopName || ''
      form.specialty = vendorData.specialty || ''
      form.description = vendorData.description || ''
      form.location = vendorData.location || ''
      form.experience = vendorData.experience || 0

      if (authStore.isAuthenticated && authStore.userId === vendorUserId) {
        form.phone = authStore.user?.phone || ''
        form.address = authStore.user?.address || ''
      }
    } else {
      showNotification('لم يتم العثور على المتجر', 'error')
      setTimeout(() => router.push('/'), 1500)
    }
  } catch (error) {
    console.error('❌ Erreur chargement vendeur:', error)
    showNotification('حدث خطأ في تحميل البيانات', 'error')
  } finally {
    loading.value = false
  }
}

const saveChanges = async () => {
  if (!form.shopName.trim()) {
    showNotification('الرجاء إدخال اسم المتجر', 'warning')
    return
  }

  if (!form.specialty) {
    showNotification('الرجاء اختيار التخصص', 'warning')
    return
  }

  isSaving.value = true

  try {
    // ✅ UTILISER PUT AU LIEU DE PATCH - c'est la correction principale !
    const vendorUpdateData = {
      shopName: form.shopName,
      specialty: form.specialty,
      description: form.description,
      location: form.location,
      experience: form.experience,
    }

    console.log('📤 Mise à jour vendeur ID:', vendor.value.id)
    console.log('📤 Données:', vendorUpdateData)
    console.log('📤 Méthode: PUT /vendors/', vendor.value.id)

    // ✅ Utiliser PUT (existe dans votre backend)
    const response = await api.put(`/vendors/${vendor.value.id}`, vendorUpdateData)

    console.log('📥 Réponse:', response.data)

    if (response.data.success) {
      const updatedVendor = response.data.data?.vendor || response.data.data
      if (updatedVendor) {
        vendor.value = { ...vendor.value, ...updatedVendor }
        // Mettre à jour le store si nécessaire
        if (vendorStore.currentVendor?.id === vendor.value.id) {
          vendorStore.currentVendor = vendor.value
        }
      }

      // Mettre à jour les informations utilisateur (téléphone et adresse)
      const userUpdateData = {}
      if (form.phone && form.phone !== authStore.user?.phone) userUpdateData.phone = form.phone
      if (form.address && form.address !== authStore.user?.address) userUpdateData.address = form.address

      if (Object.keys(userUpdateData).length > 0) {
        try {
          await api.put('/users/profile', userUpdateData)
          if (authStore.user) {
            authStore.user.phone = form.phone
            authStore.user.address = form.address
          }
          console.log('✅ Utilisateur mis à jour')
        } catch (userError) {
          console.warn('⚠️ Erreur mise à jour utilisateur (non bloquante):', userError)
        }
      }

      showNotification('✅ تم حفظ التغييرات بنجاح')
      setTimeout(() => {
        router.push(`/vendor/${vendor.value.id}`)
      }, 1500)
    } else {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error)

    let errorMessage = 'حدث خطأ أثناء الحفظ'

    if (error.response?.status === 404) {
      errorMessage = '⚠️ نقطة النهاية غير موجودة على الخادم'
    } else if (error.response?.status === 403) {
      errorMessage = '⚠️ غير مسموح لك بتعديل هذا المتجر'
    } else if (error.response?.status === 401) {
      errorMessage = '⚠️ يرجى تسجيل الدخول مرة أخرى'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    showNotification(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    showNotification('❌ يجب تسجيل الدخول أولاً', 'error')
    setTimeout(() => router.push('/login'), 1500)
    return
  }

  if (authStore.userRole !== 'vendor') {
    showNotification('❌ هذه الصفحة مخصصة للبائعين فقط', 'error')
    setTimeout(() => router.push('/'), 1500)
    return
  }

  loadVendorData()
})
</script>

<style scoped>
/* Tous les styles restent identiques à votre version originale */
.vendor-edit-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}
.vendor-edit-page.dark-mode {
  background: #0f172a;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}
.page-header {
  margin-bottom: 30px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}
.dark-mode .back-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}
.back-btn:hover {
  border-color: #08717f;
  color: #08717f;
  transform: translateX(-5px);
}
.back-icon {
  font-size: 1.2rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
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
.loading-state {
  text-align: center;
  padding: 60px;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.edit-form {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}
.dark-mode .edit-form {
  background: #1e293b;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}
.form-group {
  margin-bottom: 24px;
}
.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.dark-mode .form-label {
  color: #cbd5e1;
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;
  color: #1e293b;
}
.dark-mode .form-input,
.dark-mode .form-select,
.dark-mode .form-textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 100px;
}
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}
.dark-mode .phone-input-wrapper {
  background: #0f172a;
  border-color: #334155;
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
.dark-mode .country-code {
  background: #1e293b;
  color: #0a94a6;
  border-left-color: #334155;
}
.phone-field {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
}
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}
.dark-mode .form-actions {
  border-top-color: #334155;
}
.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}
.dark-mode .btn-cancel {
  background: #334155;
  color: #94a3b8;
}
.btn-cancel:hover {
  background: #e2e8f0;
}
.dark-mode .btn-cancel:hover {
  background: #475569;
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
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
}
.dark-mode .not-found {
  background: #1e293b;
}
.not-found h2 {
  color: #1e293b;
  margin-bottom: 20px;
}
.dark-mode .not-found h2 {
  color: #f1f5f9;
}
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
.dark-mode .toast-notification {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.toast-notification.success {
  border-right-color: #10b981;
}
.toast-notification.error {
  border-right-color: #ef4444;
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
.toast-icon {
  font-size: 1.3rem;
}
.toast-message {
  color: #1e293b;
  font-size: 0.95rem;
}
.dark-mode .toast-message {
  color: #f1f5f9;
}
@media (max-width: 768px) {
  .vendor-edit-page {
    padding: 20px 0;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .edit-form {
    padding: 20px;
  }
  .form-actions {
    flex-direction: column;
  }
  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
