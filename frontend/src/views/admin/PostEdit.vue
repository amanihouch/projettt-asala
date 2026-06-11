<!-- src/views/admin/PostEdit.vue -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">→</span>
        العودة
      </button>
      <h1 class="page-title">تعديل المنشور</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المنشور...</p>
    </div>

    <div v-else-if="post" class="edit-form">
      <form @submit.prevent="savePost">
        <!-- Catégorie -->
        <div class="form-group">
          <label class="form-label">التصنيف</label>
          <select v-model="form.category" class="form-select" required>
            <option value="perfumes">عطور</option>
            <option value="jewelry">حلي و اكسسوارات</option>
            <option value="clothing">ملابس</option>
            <option value="decoration">ديكور</option>
            <option value="textiles">أقمشة وسجادات</option>
            <option value="pottery">أواني</option>
            <option value="beauty">عناية وتجميل</option>
            <option value="food">أغذية</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <!-- Titre -->
        <div class="form-group">
          <label class="form-label">اسم المنتج</label>
          <input v-model="form.productName" type="text" class="form-input" required />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea v-model="form.description" class="form-textarea" rows="4"></textarea>
        </div>

        <!-- Prix -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">السعر الحالي</label>
            <input v-model.number="form.price" type="number" class="form-input" required step="0.01" />
          </div>
          <div class="form-group">
            <label class="form-label">السعر القديم</label>
            <input v-model.number="form.oldPrice" type="number" class="form-input" step="0.01" />
          </div>
        </div>
        <div v-if="form.oldPrice && form.price > form.oldPrice" class="validation-error">
          ⚠️ السعر الحالي يجب أن يكون أقل من السعر القديم
        </div>

        <!-- Couleurs -->
        <div class="form-group">
          <label class="form-label">الألوان المتوفرة</label>
          <div class="colors-grid">
            <div
              v-for="color in availableColors"
              :key="color.name"
              class="color-option"
              :class="{ selected: form.colors.includes(color.name) }"
              @click="toggleColor(color.name)"
            >
              <span class="color-dot" :style="{ backgroundColor: color.code }"></span>
              <span class="color-name">{{ color.name }}</span>
            </div>
          </div>
        </div>

        <!-- Quantité et Unité -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الكمية</label>
            <input v-model.number="form.quantity" type="number" class="form-input" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">الوحدة</label>
            <select v-model="form.unit" class="form-select">
              <option value="piece">قطعة</option>
              <option value="set">طقم</option>
              <option value="kg">كيلو</option>
              <option value="gram">غرام</option>
              <option value="liter">لتر</option>
              <option value="meter">متر</option>
            </select>
          </div>
        </div>

        <!-- Disponibilité -->
        <div class="form-checkbox">
          <label>
            <input type="checkbox" v-model="form.inStock" />
            <span>المنتج متوفر في المخزون</span>
          </label>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label class="form-label">حالة المنشور</label>
          <select v-model="form.status" class="form-select">
            <option value="pending">في انتظار المراجعة</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <!-- Raison du rejet (si rejeté) -->
        <div v-if="form.status === 'rejected'" class="form-group">
          <label class="form-label">سبب الرفض</label>
          <textarea v-model="form.adminNotes" class="form-textarea" rows="3"></textarea>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="goBack">إلغاء</button>
          <button type="submit" class="btn-save" :disabled="saving">
            <span v-if="!saving">حفظ التعديلات</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </form>
    </div>

    <div v-else class="not-found">
      <h2>المنشور غير موجود</h2>
      <button class="back-btn" @click="goBack">العودة</button>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { usePostStore } from '../../stores/postStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const postStore = usePostStore()

// ===== DARK MODE - Synchronized with global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const saving = ref(false)
const post = ref(null)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

const form = reactive({
  category: '',
  productName: '',
  description: '',
  price: 0,
  oldPrice: null,
  colors: [],
  quantity: 1,
  unit: 'piece',
  inStock: true,
  status: 'pending',
  adminNotes: '',
})

const availableColors = [
  { name: 'Rouge', code: '#d40025' },
  { name: 'Bleu', code: '#08717f' },
  { name: 'Vert', code: '#10b981' },
  { name: 'Jaune', code: '#fbbf24' },
  { name: 'Violet', code: '#8b5cf6' },
  { name: 'Rose', code: '#ec4899' },
  { name: 'Marron', code: '#92400e' },
  { name: 'Noir', code: '#1e293b' },
  { name: 'Blanc', code: '#ffffff' },
  { name: 'Gris', code: '#64748b' },
]

// ===== METHODS =====
const showToast = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const toggleColor = (colorName) => {
  const index = form.colors.indexOf(colorName)
  if (index === -1) form.colors.push(colorName)
  else form.colors.splice(index, 1)
}

const goBack = () => router.push(`/admin/post/${route.params.id}`)

const savePost = async () => {
  if (form.oldPrice && form.price > form.oldPrice) {
    showToast('⚠️ السعر الحالي يجب أن يكون أقل من السعر القديم', 'warning')
    return
  }

  if (!form.productName.trim()) {
    showToast('⚠️ الرجاء إدخال اسم المنتج', 'warning')
    return
  }

  if (!form.category) {
    showToast('⚠️ الرجاء اختيار التصنيف', 'warning')
    return
  }

  saving.value = true
  try {
    await postStore.updatePost(route.params.id, form)
    showToast('✅ تم حفظ التعديلات')
    setTimeout(() => router.push(`/admin/post/${route.params.id}`), 1500)
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error)
    showToast('❌ حدث خطأ أثناء الحفظ', 'error')
  } finally {
    saving.value = false
  }
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
onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }

  const postId = route.params.id
  try {
    const data = await postStore.fetchPostById(postId)
    post.value = data
    Object.assign(form, {
      category: data.category,
      productName: data.productName,
      description: data.description || '',
      price: data.price,
      oldPrice: data.oldPrice || null,
      colors: data.colors || [],
      quantity: data.quantity || 1,
      unit: data.unit || 'piece',
      inStock: data.inStock !== false,
      status: data.status || 'pending',
      adminNotes: data.adminNotes || '',
    })
  } catch (error) {
    console.error('❌ Erreur chargement post:', error)
    showToast('❌ حدث خطأ في تحميل المنشور', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* Base styles */
.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  transition: all 0.3s ease;
}

/* Dark mode styles */
.admin-page.dark-mode {
  background: #0f172a;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .back-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
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
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

/* Loading */
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

.dark-mode .spinner {
  border-color: #334155;
  border-top-color: #08717f;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #94a3b8;
}

/* Form */
.edit-form {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.dark-mode .edit-form {
  background: #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .form-label {
  color: #f1f5f9;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
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

.dark-mode .form-input::placeholder,
.dark-mode .form-textarea::placeholder {
  color: #64748b;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.dark-mode .form-input:focus,
.dark-mode .form-select:focus,
.dark-mode .form-textarea:focus {
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.validation-error {
  color: #d40025;
  font-size: 0.9rem;
  padding: 10px;
  background: #ffe8ed;
  border-radius: 8px;
  margin-top: -10px;
  margin-bottom: 20px;
}

.dark-mode .validation-error {
  background: rgba(212, 0, 37, 0.2);
  color: #ff6b6b;
}

/* Colors */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-mode .color-option {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.color-option:hover {
  border-color: #08717f;
}

.color-option.selected {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dark-mode .color-dot {
  border-color: #1e293b;
}

.color-name {
  font-size: 0.8rem;
}

/* Checkbox */
.form-checkbox {
  margin: 20px 0;
}

.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.dark-mode .form-checkbox label {
  color: #f1f5f9;
}

.form-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #08717f;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
}

.dark-mode .form-actions {
  border-top-color: #334155;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
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
  color: #cbd5e1;
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

/* Not Found */
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
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
}

/* Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .colors-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
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

/* Smooth transitions for dark mode */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/POST EDIT ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

/* Header */
.dark-mode .page-title {
  color: #f1f5f9 !important;
}

.dark-mode .back-btn {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .back-btn:hover {
  border-color: #2dd4bf !important;
  color: #2dd4bf !important;
}

/* Form */
.dark-mode .edit-form {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .form-label {
  color: #cbd5e1 !important;
}

/* Inputs */
.dark-mode .form-input,
.dark-mode .form-select,
.dark-mode .form-textarea {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .form-input:focus,
.dark-mode .form-select:focus,
.dark-mode .form-textarea:focus {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15) !important;
}

.dark-mode .form-input::placeholder,
.dark-mode .form-textarea::placeholder {
  color: #64748b !important;
}

/* Validation Error */
.dark-mode .validation-error {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #f87171 !important;
}

/* Colors Grid */
.dark-mode .color-option {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #cbd5e1 !important;
}

.dark-mode .color-option:hover {
  border-color: #2dd4bf !important;
}

.dark-mode .color-option.selected {
  background: #2dd4bf !important;
  border-color: #2dd4bf !important;
  color: #161627 !important;
}

.dark-mode .color-dot {
  border-color: #1e1e30 !important;
}

/* Checkbox */
.dark-mode .form-checkbox label {
  color: #cbd5e1 !important;
}

/* Actions */
.dark-mode .form-actions {
  border-top-color: #2a2a40 !important;
}

.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
}

/* Loading */
.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Not Found */
.dark-mode .not-found {
  background: #1e1e30 !important;
}

.dark-mode .not-found h2 {
  color: #f1f5f9 !important;
}

/* Toast */
.dark-mode .toast-notification {
  background: #1e1e30 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
