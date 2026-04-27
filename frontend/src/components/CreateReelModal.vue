<!-- frontend/src/components/CreateReelModal.vue - VERSION COMPLÈTE AVEC FALLBACK -->
<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h3>{{ isEditing ? 'تعديل Reel' : 'إنشاء Reel جديد' }}</h3>
            <p class="header-subtitle">شارك فيديو قصير مع العملاء</p>
          </div>
        </div>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            عنوان الـ Reel <span class="required">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="أدخل عنوان الـ Reel..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">وصف الـ Reel</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="وصف الـ Reel..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group" v-if="!isEditing">
          <label class="form-label">
            فيديو الـ Reel <span class="required">*</span>
          </label>
          <div
            class="video-upload-area"
            @click="triggerFileUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="videoInput"
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              style="display: none"
              @change="handleVideoUpload"
            />
            <div v-if="!videoFile" class="upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
              <p>انقر أو اسحب الفيديو هنا</p>
              <span>MP4, MOV, WEBM (max 50MB)</span>
            </div>
            <div v-else class="video-preview">
              <video :src="videoPreviewUrl" controls class="preview-video"></video>
              <button class="remove-video-btn" @click.stop="removeVideo">✕</button>
            </div>
          </div>
        </div>

        <!-- PRODUIT ASSOCIÉ -->
        <div class="form-group">
          <label class="form-label">
            المنتج المرتبط (اختياري)
            <span class="optional-badge">اختياري</span>
          </label>

          <div v-if="isLoadingProducts" class="loading-products">
            <div class="spinner-small"></div>
            <span>جاري تحميل المنتجات...</span>
          </div>

          <div v-else-if="productsList.length > 0" class="product-select-wrapper">
            <select v-model="selectedProductId" class="form-select" @change="onProductSelect">
              <option :value="null">📦 -- بدون منتج --</option>
              <option
                v-for="product in productsList"
                :key="product.id"
                :value="product.id"
              >
                🛍️ {{ product.productName || product.name }} - {{ formatPrice(product.price) }}
              </option>
            </select>
          </div>

          <div v-if="selectedProductData" class="selected-product-card">
            <div class="selected-product-image">
              <img
                :src="getProductImageUrl(selectedProductData)"
                :alt="selectedProductData.productName || selectedProductData.name"
                @error="handleProductImageError"
              />
            </div>
            <div class="selected-product-info">
              <div class="selected-product-name">{{ selectedProductData.productName || selectedProductData.name }}</div>
              <div class="selected-product-price">{{ formatPrice(selectedProductData.price) }}</div>
              <button type="button" class="remove-product-btn" @click="removeSelectedProduct">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                إزالة
              </button>
            </div>
          </div>

          <div v-if="!isLoadingProducts && productsList.length === 0 && !errorProducts" class="no-products-message">
            <span>⚠️ لا توجد منتجات متاحة. قم بإضافة منتج أولاً.</span>
          </div>

          <div v-if="errorProducts" class="error-products-message">
            <span>❌ {{ errorProducts }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">حالة التوفر</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="form.status" value="published" />
              <span class="radio-custom"></span>
              منشور
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.status" value="draft" />
              <span class="radio-custom"></span>
              مسودة
            </label>
          </div>
          <p class="status-hint" v-if="form.status === 'published'">
            ⚠️ سيتم إرسال الـ Reel للمراجعة قبل النشر
          </p>
        </div>

        <div v-if="uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ uploadProgress }}%</div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="handleClose">إلغاء</button>
        <button class="btn-submit" @click="submitReel" :disabled="!isFormValid || uploading">
          <span v-if="uploading" class="loading-spinner"></span>
          <span v-else>{{ isSubmitting ? 'جاري النشر...' : (isEditing ? 'تحديث' : 'نشر') }}</span>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/postStore'
import api from '../services/api'

const props = defineProps({
  isVisible: { type: Boolean, default: false },
  initialProductId: { type: Number, default: null },
  reel: { type: Object, default: null }
})

const emit = defineEmits(['close', 'reel-created'])

const themeStore = useThemeStore()
const authStore = useAuthStore()
const postStore = usePostStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const isEditing = computed(() => !!props.reel?.id)

// Toast
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// Formulaire
const form = ref({
  title: '',
  description: '',
  status: 'published'
})

// Vidéo
const videoFile = ref(null)
const videoPreviewUrl = ref('')
const videoInput = ref(null)
const uploading = ref(false)
const isSubmitting = ref(false)
const uploadProgress = ref(0)

// Produits
const productsList = ref([])
const selectedProductId = ref(null)
const selectedProductData = ref(null)
const isLoadingProducts = ref(false)
const errorProducts = ref(null)

// Validation
const isFormValid = computed(() => {
  if (isEditing.value) {
    return form.value.title.trim().length > 0
  }
  return form.value.title.trim().length > 0 && videoFile.value !== null
})

// ========== UTILITAIRES ==========
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] || '✅' }
  setTimeout(() => (toast.value.show = false), 3000)
}

const getProductImageUrl = (product) => {
  if (!product) return 'https://placehold.co/60x60/08717f/white?text=🛍️'
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0]
  }
  if (product.image) return product.image
  return 'https://placehold.co/60x60/08717f/white?text=🛍️'
}

const handleProductImageError = (e) => {
  e.target.src = 'https://placehold.co/60x60/08717f/white?text=🛍️'
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0 د.ت'
  return new Intl.NumberFormat('ar-TN').format(price) + ' د.ت'
}

// ========== SAUVEGARDE LOCALSTORAGE ==========
const saveReelToLocalStorage = (reel) => {
  try {
    const saved = localStorage.getItem('admin_reels')
    let reels = saved ? JSON.parse(saved) : []

    // Ajouter le nouveau reel avec statut pending
    const newReel = {
      ...reel,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    reels.unshift(newReel)
    localStorage.setItem('admin_reels', JSON.stringify(reels))

    console.log('📹 Reel sauvegardé dans localStorage:', newReel.id)
    return newReel
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error)
    return null
  }
}

// ========== CHARGEMENT DES PRODUITS ==========
const loadVendorProducts = async () => {
  isLoadingProducts.value = true
  errorProducts.value = null

  try {
    let vendorId = authStore.user?.vendorId || authStore.vendorId || localStorage.getItem('vendorId')

    if (!vendorId) {
      productsList.value = []
      errorProducts.value = 'لا يمكن تحميل المنتجات. تأكد من أنك مسجل كبائع.'
      isLoadingProducts.value = false
      return
    }

    console.log('📦 Chargement des produits pour vendorId:', vendorId)

    let products = []
    const vendorPosts = await postStore.fetchVendorPosts(vendorId)

    if (vendorPosts && Array.isArray(vendorPosts)) {
      products = vendorPosts.map(post => ({
        id: post.id,
        name: post.productName,
        productName: post.productName,
        price: post.price,
        oldPrice: post.oldPrice,
        images: post.images || [],
        image: post.images?.[0] || null,
        description: post.description,
        createdAt: post.createdAt,
        vendorId: post.vendorId
      }))
    }

    productsList.value = products
    console.log('✅ Produits chargés:', productsList.value.length)

  } catch (error) {
    console.error('❌ Erreur chargement produits:', error)
    productsList.value = []
    errorProducts.value = error.message || 'Erreur lors du chargement des produits'
  } finally {
    isLoadingProducts.value = false
  }
}

// ========== GESTION PRODUIT ==========
const onProductSelect = () => {
  if (selectedProductId.value) {
    const product = productsList.value.find(p => p.id === selectedProductId.value)
    selectedProductData.value = product || null
  } else {
    selectedProductData.value = null
  }
}

const removeSelectedProduct = () => {
  selectedProductId.value = null
  selectedProductData.value = null
}

// ========== GESTION VIDÉO ==========
const triggerFileUpload = () => {
  videoInput.value?.click()
}

const handleVideoUpload = (e) => {
  const file = e.target.files[0]
  if (file) addVideo(file)
  e.target.value = ''
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) addVideo(file)
}

const addVideo = (file) => {
  if (file.size > 50 * 1024 * 1024) {
    showNotification('حجم الفيديو يجب أن يكون أقل من 50MB', 'error')
    return
  }
  videoFile.value = file
  videoPreviewUrl.value = URL.createObjectURL(file)
}

const removeVideo = () => {
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value)
  videoFile.value = null
  videoPreviewUrl.value = ''
}

// ========== SOUMISSION ==========
const submitReel = async () => {
  if (!isFormValid.value || uploading.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    if (isEditing.value && props.reel) {
      // Mise à jour
      showNotification('✅ تم تحديث الـ Reel بنجاح (محلياً)')
      emit('reel-created', props.reel)
      resetForm()
      handleClose()
    } else {
      uploading.value = true

      // Simuler la progression
      const interval = setInterval(() => {
        if (uploadProgress.value < 90) uploadProgress.value += 10
      }, 200)

      // Créer l'objet reel
      const vendorName = authStore.user?.vendorName || authStore.user?.shopName ||
                        authStore.user?.name || 'بائع'

      const vendorId = authStore.user?.vendorId ||
                      authStore.vendorId ||
                      localStorage.getItem('vendorId')

      const newReel = {
        title: form.value.title,
        description: form.value.description || '',
        videoUrl: videoPreviewUrl.value,
        productId: selectedProductId.value,
        productName: selectedProductData.value?.productName || selectedProductData.value?.name || null,
        productPrice: selectedProductData.value?.price || null,
        shopName: vendorName,
        vendorName: vendorName,
        vendorAvatar: authStore.user?.avatar || 'https://i.pravatar.cc/40',
        vendorId: vendorId,
        likes: 0,
        commentsCount: 0,
        views: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      // Essayer d'envoyer à l'API d'abord
      let apiSuccess = false
      try {
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('description', form.value.description || '')
        if (selectedProductId.value) formData.append('productId', selectedProductId.value)
        formData.append('video', videoFile.value)

        const response = await api.post('/reels', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (response.data?.success) {
          apiSuccess = true
          clearInterval(interval)
          uploadProgress.value = 100
          showNotification('✅ تم إرسال الـ Reel للمراجعة بنجاح')
          emit('reel-created', response.data.data)
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, utilisation du stockage local')
      }

      // Fallback localStorage
      if (!apiSuccess) {
        const savedReel = saveReelToLocalStorage(newReel)
        clearInterval(interval)
        uploadProgress.value = 100
        showNotification('✅ تم حفظ الـ Reel محلياً (في انتظار المراجعة)')
        emit('reel-created', savedReel)

        // Déclencher un événement pour informer les autres composants
        window.dispatchEvent(new CustomEvent('reels-updated'))
      }

      resetForm()
      handleClose()
    }
  } catch (error) {
    console.error('❌ Error submitting reel:', error)
    showNotification('❌ حدث خطأ أثناء نشر الـ Reel', 'error')
  } finally {
    isSubmitting.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

// ========== RÉINITIALISATION ==========
const resetForm = () => {
  form.value = { title: '', description: '', status: 'published' }
  selectedProductId.value = props.initialProductId || null
  selectedProductData.value = null

  if (props.initialProductId) {
    const product = productsList.value.find(p => p.id === props.initialProductId)
    if (product) selectedProductData.value = product
  }

  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value)
  videoFile.value = null
  videoPreviewUrl.value = ''

  if (props.reel && isEditing.value) {
    form.value.title = props.reel.title || ''
    form.value.description = props.reel.description || ''
    form.value.status = props.reel.status || 'published'
    selectedProductId.value = props.reel.productId || null
    if (props.reel.productId) {
      const product = productsList.value.find(p => p.id === props.reel.productId)
      if (product) selectedProductData.value = product
    }
  }
}

// ========== FERMETURE ==========
const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

// ========== WATCHERS ==========
watch(() => props.isVisible, async (visible) => {
  if (visible) {
    await loadVendorProducts()
    resetForm()
  }
})

watch(() => props.initialProductId, (productId) => {
  if (productId && props.isVisible) {
    selectedProductId.value = productId
    const product = productsList.value.find(p => p.id === productId)
    if (product) selectedProductData.value = product
  }
})

// ========== LIFECYCLE ==========
onMounted(() => {
  loadVendorProducts()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
.modal-content,
.modal-content * {
  font-family: 'Amiri', 'Cairo', serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: #ffffff;
  border-radius: 28px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-content.dark-mode {
  background: #1e293b;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid #eef2f6;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-content.dark-mode .modal-header {
  background: #1e293b;
  border-bottom-color: #334155;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon svg {
  stroke: #08717f;
}

.modal-content.dark-mode .header-icon svg {
  stroke: #2dd4bf;
}

.header-left h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-content.dark-mode .header-left h3 {
  color: #f1f5f9;
}

.header-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

.close-btn {
  width: 38px;
  height: 38px;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #d40025;
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.modal-content.dark-mode .form-label {
  color: #f1f5f9;
}

.required {
  color: #d40025;
  margin-right: 4px;
}

.optional-badge {
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: normal;
  margin-left: 8px;
  color: #475569;
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
  background: white;
  color: #1e293b;
}

.modal-content.dark-mode .form-input,
.modal-content.dark-mode .form-select,
.modal-content.dark-mode .form-textarea {
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
  min-height: 80px;
}

.video-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.modal-content.dark-mode .video-upload-area {
  background: #0f172a;
  border-color: #334155;
}

.video-upload-area:hover {
  border-color: #08717f;
  background: #f1f5f9;
}

.upload-placeholder svg {
  stroke: #08717f;
  margin-bottom: 12px;
}

.upload-placeholder p {
  margin: 8px 0 4px;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.upload-placeholder span {
  font-size: 0.8rem;
  color: #64748b;
}

.video-preview {
  position: relative;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  border-radius: 12px;
}

.remove-video-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(212, 0, 37, 0.9);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.selected-product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}

.modal-content.dark-mode .selected-product-card {
  background: #0f172a;
  border-color: #334155;
}

.selected-product-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.selected-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-product-info {
  flex: 1;
}

.selected-product-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 4px;
}

.modal-content.dark-mode .selected-product-name {
  color: #f1f5f9;
}

.selected-product-price {
  font-size: 0.85rem;
  color: #08717f;
  font-weight: 500;
}

.remove-product-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fee2e2;
  border: none;
  border-radius: 20px;
  color: #dc2626;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-product-btn:hover {
  background: #fecaca;
}

.loading-products {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 12px;
  color: #64748b;
  font-size: 0.85rem;
}

.no-products-message {
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
  color: #d97706;
  font-size: 0.8rem;
  text-align: center;
}

.error-products-message {
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.8rem;
  text-align: center;
}

.radio-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #334155;
}

.radio-label input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  position: relative;
}

.radio-label input:checked + .radio-custom {
  border-color: #d40025;
}

.radio-label input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  background: #d40025;
  border-radius: 50%;
}

.status-hint {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #f59e0b;
}

.upload-progress {
  background: #f0fdf4;
  border-radius: 14px;
  padding: 12px 16px;
  margin-top: 16px;
  border: 1px solid #bbf7d0;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #08717f, #d40025);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.8rem;
  color: #08717f;
  margin-top: 8px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 16px;
  padding: 20px 28px;
  border-top: 1px solid #eef2f6;
  background: white;
  position: sticky;
  bottom: 0;
}

.modal-content.dark-mode .form-actions {
  background: #1e293b;
  border-top-color: #334155;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 14px 20px;
  border-radius: 40px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-cancel {
  background: #f1f5f9;
  border: none;
  color: #475569;
}

.modal-content.dark-mode .btn-cancel {
  background: #334155;
  color: #94a3b8;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: linear-gradient(135deg, #08717f, #065a69);
  border: none;
  color: white;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(8, 113, 127, 0.3);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  z-index: 99999;
  min-width: 280px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
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
  z-index: 99999;
  min-width: 280px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.dark-mode {
  background: #1e293b;
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.toast-icon { font-size: 1.3rem; }

.toast-message {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
}

.dark-mode .toast-message {
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    border-radius: 20px;
  }
  .modal-header,
  .modal-body,
  .form-actions {
    padding: 16px 20px;
  }
}
</style>
