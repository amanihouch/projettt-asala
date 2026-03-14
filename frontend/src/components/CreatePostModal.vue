<!-- src/components/CreatePostModal.vue -->
<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>إنشاء منشور جديد</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <form @submit.prevent="submitPost" class="create-post-form">
        <!-- Catégorie -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📦</span>
            التصنيف <span class="required">*</span>
          </label>
          <select v-model="form.category" class="form-select" required>
            <option value="" disabled selected>اختر التصنيف</option>
            <option value="perfumes">عطور</option>
            <option value="jewelry">حلي و اكسسوارات</option>
            <option value="clothing">ملابس</option>
            <option value="decoration">ديكور</option>
            <option value="textiles">أقمشة وسجادات</option>
            <option value="pottery">أواني</option>
            <option value="beauty">عناية وتجميل</option>
            <option value="food">أغدية</option>
            <option value="other">أخرى</option>
          </select>
          <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
        </div>

        <!-- Titre du produit -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🏷️</span>
            titre de produit <span class="required">*</span>
          </label>
          <input
            type="text"
            v-model="form.productName"
            class="form-input"
            placeholder="Ex: طبق فخاري مزخرف"
            required
          />
          <span v-if="errors.productName" class="error-message">{{ errors.productName }}</span>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📝</span>
            Description
          </label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            rows="3"
            placeholder="Écrivez une description détaillée du produit..."
          ></textarea>
        </div>

        <!-- Prix -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">💰</span>
              Prix actuel <span class="required">*</span>
            </label>
            <div class="price-input-wrapper">
              <input
                type="number"
                v-model.number="form.price"
                class="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
              <span class="currency">د.ت</span>
            </div>
            <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏷️</span>
              Prix ancien
            </label>
            <div class="price-input-wrapper">
              <input
                type="number"
                v-model.number="form.oldPrice"
                class="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <span class="currency">د.ت</span>
            </div>
          </div>
        </div>

        <!-- Validation prix -->
        <div v-if="form.oldPrice && form.price > form.oldPrice" class="validation-error">
          ⚠️ Le prix actuel doit être inférieur au prix ancien
        </div>

        <!-- Couleurs disponibles -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🎨</span>
            Couleurs disponibles
          </label>
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
            <label class="form-label">
              <span class="label-icon">📊</span>
              Quantité
            </label>
            <input
              type="number"
              v-model.number="form.quantity"
              class="form-input"
              min="0"
              placeholder="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">⚖️</span>
              Unité
            </label>
            <select v-model="form.unit" class="form-select">
              <option value="piece">Pièce</option>
              <option value="set">Set</option>
              <option value="kg">Kg</option>
              <option value="gram">Gramme</option>
              <option value="liter">Litre</option>
              <option value="meter">Mètre</option>
            </select>
          </div>
        </div>

        <!-- Photos -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📸</span>
            Photos
          </label>
          <div class="image-upload-area" @click="triggerFileUpload">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              multiple
              accept="image/*"
              style="display: none"
            />
            <div class="upload-placeholder">
              <span class="upload-icon">📸</span>
              <p>Cliquez pour ajouter des photos</p>
              <span class="upload-hint">PNG, JPG - Max 5MB</span>
            </div>
          </div>
          <span v-if="errors.images" class="error-message">{{ errors.images }}</span>

          <div v-if="form.images.length > 0" class="image-previews">
            <div v-for="(img, index) in form.images" :key="index" class="preview-item">
              <img :src="img" alt="Preview" />
              <button type="button" class="remove-image" @click="removeImage(index)">✕</button>
            </div>
          </div>
        </div>

        <!-- Disponibilité -->
        <div class="form-checkbox">
          <label>
            <input type="checkbox" v-model="form.inStock" />
            <span>Produit disponible en stock</span>
          </label>
        </div>

        <!-- Boutons -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Annuler</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Publier</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'post-created'])

const authStore = useAuthStore()

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

const form = reactive({
  category: '',
  productName: '',
  description: '',
  price: 0,
  oldPrice: null,
  colors: [],
  quantity: 1,
  unit: 'piece',
  images: [],
  inStock: true,
})

const errors = ref({})
const fileInput = ref(null)
const isSubmitting = ref(false)

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.images.push(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

const toggleColor = (colorName) => {
  const index = form.colors.indexOf(colorName)
  if (index === -1) {
    form.colors.push(colorName)
  } else {
    form.colors.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.category) {
    errors.value.category = 'الرجاء اختيار التصنيف'
    isValid = false
  }

  if (!form.productName) {
    errors.value.productName = 'الرجاء إدخال اسم المنتج'
    isValid = false
  }

  if (!form.price || form.price <= 0) {
    errors.value.price = 'الرجاء إدخال سعر صحيح'
    isValid = false
  }

  if (form.oldPrice && form.price > form.oldPrice) {
    errors.value.price = 'السعر الحالي يجب أن يكون أقل من السعر القديم'
    isValid = false
  }

  if (form.images.length === 0) {
    errors.value.images = 'الرجاء إضافة صورة واحدة على الأقل'
    isValid = false
  }

  return isValid
}

const closeModal = () => {
  form.category = ''
  form.productName = ''
  form.description = ''
  form.price = 0
  form.oldPrice = null
  form.colors = []
  form.quantity = 1
  form.unit = 'piece'
  form.images = []
  form.inStock = true
  errors.value = {}
  emit('close')
}

const submitPost = () => {
  console.log('📝 Formulaire soumis avec:', form)

  if (!validateForm()) {
    console.log('❌ Validation échouée')
    return
  }

  isSubmitting.value = true

  // ✅ Ajouter les informations du vendeur
  const postData = {
    category: form.category,
    productName: form.productName,
    description: form.description,
    price: Number(form.price),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
    colors: [...form.colors],
    quantity: Number(form.quantity) || 1,
    unit: form.unit,
    images: [...form.images],
    inStock: form.inStock,
    vendorId: authStore.user?.id,
    vendorName: authStore.user?.shopName || authStore.user?.name,
    vendorAvatar: authStore.user?.avatar,
    vendorVerified: authStore.user?.role === 'vendor' && false,
  }

  console.log('✅ Données à émettre:', postData)
  emit('post-created', postData)

  setTimeout(() => {
    isSubmitting.value = false
    closeModal()
  }, 500)
}
</script>

<style scoped>
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
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 25px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #1e293b;
}

.close-btn {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.create-post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.label-icon {
  font-size: 1.1rem;
}

.required {
  color: #d40025;
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
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.price-input-wrapper {
  position: relative;
}

.price-input-wrapper input {
  padding-left: 50px;
}

.currency {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-weight: 600;
}

.error-message {
  color: #d40025;
  font-size: 0.8rem;
  margin-top: 3px;
}

.validation-error {
  color: #d40025;
  font-size: 0.85rem;
  padding: 8px 12px;
  background: #ffe8ed;
  border-radius: 6px;
  margin-top: -10px;
}

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

.color-name {
  font-size: 0.8rem;
}

.image-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
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
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.form-checkbox {
  margin: 10px 0;
}

.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #08717f;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
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

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-submit:disabled {
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .colors-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
