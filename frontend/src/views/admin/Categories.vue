<!-- src/views/admin/CategoriesAdmin.vue - SANS EMOJIS, AVEC SOUS-CATÉGORIES ET IMAGES CLOUDINARY -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل التصنيفات...</p>
      </div>

      <template v-else>
        <!-- Formulaire d'ajout -->
        <div class="add-category-form">
          <h3 class="form-title">إضافة تصنيف جديد</h3>

          <div class="form-row-grid">
            <div class="form-group">
              <label class="form-label">اسم التصنيف (عربي)</label>
              <input type="text" v-model="newCategory.nameAr" placeholder="مثال: العطور" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">اسم التصنيف (Français)</label>
              <input type="text" v-model="newCategory.nameFr" placeholder="Exemple: Parfums" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">الرمز (اختياري)</label>
              <input type="text" v-model="newCategory.icon" placeholder="مثال: عطور" class="form-input" />
            </div>
          </div>

          <!-- Parent category -->
          <div class="form-group">
            <label class="form-label">تصنيف رئيسي (اختياري - للتصنيفات الفرعية)</label>
            <select v-model="newCategory.parentId" class="form-input">
              <option :value="null">بدون (تصنيف رئيسي)</option>
              <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">
                {{ cat.nameAr || cat.name }}
              </option>
            </select>
          </div>

          <!-- Image upload -->
          <div class="form-group">
            <label class="form-label">صورة التصنيف</label>
            <div class="image-upload-area" @click="triggerImageUpload">
              <div v-if="newCategory.imagePreview" class="image-preview">
                <img :src="newCategory.imagePreview" alt="معاينة" />
                <button type="button" class="remove-image" @click.stop="clearNewImage">✕</button>
              </div>
              <div v-else class="upload-placeholder">
                <span class="upload-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </span>
                <span>انقر لاختيار صورة</span>
                <small>JPG, PNG, GIF - max 2MB</small>
              </div>
              <input type="file" ref="imageInput" @change="handleImageUpload" accept="image/*" style="display: none" />
            </div>
            <!-- Barre de progression upload -->
            <div v-if="uploading" class="upload-progress">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              <span>{{ uploadProgress }}%</span>
            </div>
          </div>

          <button class="btn-add" @click="addCategory" :disabled="adding || uploading">
            {{ adding ? 'جاري الإضافة...' : uploading ? 'جاري رفع الصورة...' : 'إضافة تصنيف جديد' }}
          </button>
        </div>

        <!-- Liste des catégories -->
        <div class="categories-container">
          <div v-for="parentCat in parentCategories" :key="parentCat.id" class="category-group">
            <!-- Catégorie parente -->
            <div class="category-item parent-category">
              <div class="category-image-wrapper">
                <img
                  :src="parentCat.imageUrl || getDefaultImage(parentCat.slug)"
                  :alt="parentCat.name"
                  class="category-image"
                  @error="handleImageError(parentCat)"
                />
              </div>
              <div class="category-info">
                <span class="category-icon-text">{{ parentCat.icon || parentCat.nameAr?.charAt(0) || 'ت' }}</span>
                <div class="category-details">
                  <span class="category-name">{{ parentCat.nameAr || parentCat.name }}</span>
                  <span class="category-name-fr">{{ parentCat.nameFr }}</span>
                </div>
              </div>
              <div class="category-stats">
                <span class="category-count">{{ parentCat.products_count || 0 }} منتج</span>
                <span v-if="parentCat.children && parentCat.children.length > 0" class="subcategory-count">
                  {{ parentCat.children.length }} تصنيف فرعي
                </span>
              </div>
              <div class="category-actions">
                <button class="icon-btn add-sub" @click="prepareAddSubcategory(parentCat)" title="إضافة تصنيف فرعي">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <button class="icon-btn edit" @click="editCategory(parentCat)" title="تعديل">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="icon-btn delete" @click="deleteCategory(parentCat)" title="حذف">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sous-catégories -->
            <div v-if="parentCat.children && parentCat.children.length > 0" class="subcategories-list">
              <div v-for="subCat in parentCat.children" :key="subCat.id" class="category-item subcategory-item">
                <div class="subcategory-indent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
                <div class="category-image-wrapper small">
                  <img
                    :src="subCat.imageUrl || getDefaultImage(subCat.slug)"
                    :alt="subCat.name"
                    class="category-image"
                    @error="handleImageError(subCat)"
                  />
                </div>
                <div class="category-info">
                  <span class="category-icon-text small">{{ subCat.icon || subCat.nameAr?.charAt(0) || 'ت' }}</span>
                  <div class="category-details">
                    <span class="category-name">{{ subCat.nameAr || subCat.name }}</span>
                    <span class="category-name-fr">{{ subCat.nameFr }}</span>
                  </div>
                </div>
                <span class="category-count">{{ subCat.products_count || 0 }} منتج</span>
                <div class="category-actions">
                  <button class="icon-btn edit" @click="editCategory(subCat)" title="تعديل">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="icon-btn delete" @click="deleteCategory(subCat)" title="حذف">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Catégories orphelines -->
          <div v-if="orphanCategories.length > 0" class="orphan-section">
            <h4 class="section-title">تصنيفات بدون رئيسية</h4>
            <div v-for="cat in orphanCategories" :key="cat.id" class="category-item">
              <div class="category-image-wrapper">
                <img :src="cat.imageUrl || getDefaultImage(cat.slug)" :alt="cat.name" class="category-image" @error="handleImageError(cat)" />
              </div>
              <div class="category-info">
                <span class="category-icon-text">{{ cat.icon || cat.nameAr?.charAt(0) || 'ت' }}</span>
                <div class="category-details">
                  <span class="category-name">{{ cat.nameAr || cat.name }}</span>
                  <span class="category-name-fr">{{ cat.nameFr }}</span>
                </div>
              </div>
              <span class="category-count">{{ cat.products_count || 0 }} منتج</span>
              <div class="category-actions">
                <button class="icon-btn edit" @click="editCategory(cat)" title="تعديل">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="icon-btn delete" @click="deleteCategory(cat)" title="حذف">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="categories.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>لا توجد تصنيفات</h3>
          <p>أضف تصنيفاً جديداً باستخدام النموذج أعلاه</p>
        </div>
      </template>
    </div>

    <!-- Modal Édition -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تعديل التصنيف</h3>
            <button class="modal-close" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">اسم التصنيف (عربي)</label>
              <input type="text" v-model="editForm.nameAr" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">اسم التصنيف (Français)</label>
              <input type="text" v-model="editForm.nameFr" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">الرمز (اختياري)</label>
              <input type="text" v-model="editForm.icon" class="form-input" placeholder="نص قصير للرمز" />
            </div>
            <div class="form-group">
              <label class="form-label">التصنيف الرئيسي</label>
              <select v-model="editForm.parentId" class="form-input">
                <option :value="null">بدون (تصنيف رئيسي)</option>
                <option
                  v-for="cat in availableParentCategories"
                  :key="cat.id"
                  :value="cat.id"
                  :disabled="cat.id === editingCategory?.id"
                >
                  {{ cat.nameAr || cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">صورة التصنيف</label>
              <div class="image-upload-area" @click="triggerEditImageUpload">
                <div v-if="editForm.imagePreview" class="image-preview">
                  <img :src="editForm.imagePreview" alt="معاينة" />
                  <button type="button" class="remove-image" @click.stop="clearEditImage">✕</button>
                </div>
                <div v-else-if="editForm.currentImage" class="image-preview">
                  <img :src="editForm.currentImage" alt="الصورة الحالية" />
                  <button type="button" class="remove-image" @click.stop="removeCurrentImage">✕</button>
                </div>
                <div v-else class="upload-placeholder">
                  <span class="upload-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </span>
                  <span>انقر لتغيير الصورة</span>
                </div>
                <input type="file" ref="editImageInput" @change="handleEditImageUpload" accept="image/*" style="display: none" />
              </div>
              <div v-if="editUploading" class="upload-progress">
                <div class="progress-bar" :style="{ width: editUploadProgress + '%' }"></div>
                <span>{{ editUploadProgress }}%</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeEditModal">إلغاء</button>
              <button type="button" class="btn-save" @click="saveEditCategory" :disabled="savingEdit || editUploading">
                {{ savingEdit ? 'جاري الحفظ...' : editUploading ? 'جاري رفع الصورة...' : 'حفظ التغييرات' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Sous-catégorie rapide -->
    <transition name="modal">
      <div v-if="showSubCategoryModal" class="modal-overlay" @click.self="closeSubCategoryModal">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>إضافة تصنيف فرعي لـ {{ parentForSub?.nameAr || parentForSub?.name }}</h3>
            <button class="modal-close" @click="closeSubCategoryModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">اسم التصنيف الفرعي (عربي)</label>
              <input type="text" v-model="subCategoryForm.nameAr" class="form-input" placeholder="مثال: عطور شرقية" />
            </div>
            <div class="form-group">
              <label class="form-label">اسم التصنيف الفرعي (Français)</label>
              <input type="text" v-model="subCategoryForm.nameFr" class="form-input" placeholder="Exemple: Parfums Orientaux" />
            </div>
            <div class="form-group">
              <label class="form-label">الرمز (اختياري)</label>
              <input type="text" v-model="subCategoryForm.icon" class="form-input" placeholder="نص قصير للرمز" />
            </div>

            <div class="form-group">
              <label class="form-label">صورة التصنيف الفرعي</label>
              <div class="image-upload-area" @click="triggerSubImageUpload">
                <div v-if="subCategoryForm.imagePreview" class="image-preview">
                  <img :src="subCategoryForm.imagePreview" alt="معاينة" />
                  <button type="button" class="remove-image" @click.stop="clearSubImage">✕</button>
                </div>
                <div v-else class="upload-placeholder">
                  <span class="upload-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </span>
                  <span>انقر لاختيار صورة (اختياري)</span>
                </div>
                <input type="file" ref="subImageInput" @change="handleSubImageUpload" accept="image/*" style="display: none" />
              </div>
              <div v-if="subUploading" class="upload-progress">
                <div class="progress-bar" :style="{ width: subUploadProgress + '%' }"></div>
                <span>{{ subUploadProgress }}%</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeSubCategoryModal">إلغاء</button>
              <button type="button" class="btn-save" @click="addSubCategory" :disabled="addingSub || subUploading">
                {{ addingSub ? 'جاري الإضافة...' : subUploading ? 'جاري رفع الصورة...' : 'إضافة تصنيف فرعي' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
import { ref, computed, onMounted } from 'vue'
import api from '/src/services/api'
import { useAuthStore } from '/src/stores/auth'
import { useThemeStore } from '/src/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// État
const loading = ref(true)
const adding = ref(false)
const addingSub = ref(false)
const savingEdit = ref(false)
const uploading = ref(false)
const editUploading = ref(false)
const subUploading = ref(false)
const uploadProgress = ref(0)
const editUploadProgress = ref(0)
const subUploadProgress = ref(0)
const categories = ref([])
const imageInput = ref(null)
const editImageInput = ref(null)
const subImageInput = ref(null)

// Formulaire nouvelle catégorie
const newCategory = ref({
  nameAr: '', nameFr: '', icon: '', parentId: null,
  imageFile: null, imagePreview: null
})

// Modal édition
const showEditModal = ref(false)
const editingCategory = ref(null)
const editForm = ref({
  nameAr: '', nameFr: '', icon: '', parentId: null,
  imageFile: null, imagePreview: null, currentImage: null
})

// Modal sous-catégorie rapide
const showSubCategoryModal = ref(false)
const parentForSub = ref(null)
const subCategoryForm = ref({
  nameAr: '', nameFr: '', icon: '',
  imageFile: null, imagePreview: null
})

// Toast
const toast = ref({ show: false, message: '', type: 'success', icon: '✓' })

// ===== COMPUTED =====
const parentCategories = computed(() => categories.value.filter(cat => !cat.parentId))

const orphanCategories = computed(() =>
  categories.value.filter(cat => {
    if (!cat.parentId) return false
    return !categories.value.some(c => c.id === cat.parentId)
  })
)

const availableParentCategories = computed(() =>
  categories.value.filter(cat => !cat.parentId && cat.id !== editingCategory.value?.id)
)

// ===== HELPERS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✓', error: '✕', info: 'i', warning: '!' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const getDefaultImage = (slug) => {
  // Utiliser des images placeholder fiables
  const map = {
    perfumes: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Parfums',
    jewelry: 'https://placehold.co/400x400/FFD700/000000?text=Jewelry',
    clothing: 'https://placehold.co/400x400/4169E1/FFFFFF?text=Clothing',
    decor: 'https://placehold.co/400x400/2E8B57/FFFFFF?text=Decor',
    textiles: 'https://placehold.co/400x400/8B0000/FFFFFF?text=Textiles',
    pottery: 'https://placehold.co/400x400/CD853F/FFFFFF?text=Pottery',
    beauty: 'https://placehold.co/400x400/FF69B4/FFFFFF?text=Beauty',
    food: 'https://placehold.co/400x400/FF8C00/FFFFFF?text=Food',
    default: 'https://placehold.co/400x400/08717f/FFFFFF?text=Category'
  }
  return map[slug] || map.default
}

const handleImageError = (cat) => {
  cat.imageUrl = getDefaultImage(cat.slug)
}

// ===== UPLOAD IMAGE VIA BACKEND =====
const uploadImageToBackend = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('image', file)

    const xhr = new XMLHttpRequest()
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

    xhr.open('POST', `${apiUrl}/admin/categories/upload-image`, true)

    const token = localStorage.getItem('token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.success && response.data?.url) {
            resolve(response.data.url)
          } else {
            reject(new Error('Echec upload: reponse invalide'))
          }
        } catch (e) {
          reject(new Error('Reponse JSON invalide'))
        }
      } else {
        reject(new Error(`Echec upload: ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Erreur reseau'))
    xhr.send(formData)
  })
}

// ===== TRIGGERS UPLOAD =====
const triggerImageUpload = () => imageInput.value?.click()
const triggerEditImageUpload = () => editImageInput.value?.click()
const triggerSubImageUpload = () => subImageInput.value?.click()

// ===== HANDLERS IMAGES =====
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showNotification('الصورة كبيرة جدا (الحد الاقصى 2 ميجابايت)', 'warning')
    return
  }
  newCategory.value.imageFile = file
  const reader = new FileReader()
  reader.onload = (e) => { newCategory.value.imagePreview = e.target.result }
  reader.readAsDataURL(file)
}

const handleEditImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showNotification('الصورة كبيرة جدا (الحد الاقصى 2 ميجابايت)', 'warning')
    return
  }
  editForm.value.imageFile = file
  editForm.value.currentImage = null
  const reader = new FileReader()
  reader.onload = (e) => { editForm.value.imagePreview = e.target.result }
  reader.readAsDataURL(file)
}

const handleSubImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showNotification('الصورة كبيرة جدا (الحد الاقصى 2 ميجابايت)', 'warning')
    return
  }
  subCategoryForm.value.imageFile = file
  const reader = new FileReader()
  reader.onload = (e) => { subCategoryForm.value.imagePreview = e.target.result }
  reader.readAsDataURL(file)
}

// ===== CLEAR IMAGES =====
const clearNewImage = () => {
  newCategory.value.imagePreview = null
  newCategory.value.imageFile = null
  uploadProgress.value = 0
  if (imageInput.value) imageInput.value.value = ''
}

const clearEditImage = () => {
  editForm.value.imagePreview = null
  editForm.value.imageFile = null
  editForm.value.currentImage = null
  editUploadProgress.value = 0
  if (editImageInput.value) editImageInput.value.value = ''
}

const removeCurrentImage = () => {
  editForm.value.currentImage = null
  editForm.value.imageFile = null
  editForm.value.imagePreview = null
}

const clearSubImage = () => {
  subCategoryForm.value.imagePreview = null
  subCategoryForm.value.imageFile = null
  subUploadProgress.value = 0
  if (subImageInput.value) subImageInput.value.value = ''
}

// ===== LOAD CATEGORIES =====
const loadCategories = async () => {
  loading.value = true
  try {
    const response = await api.get('/categories?include=children')
    let data = []
    if (response.data.success) {
      data = response.data.data?.categories || response.data.categories || []
    }

    categories.value = (Array.isArray(data) ? data : []).map(cat => ({
      id: cat.id,
      name: cat.name,
      nameAr: cat.nameAr || cat.name,
      nameFr: cat.nameFr || cat.name,
      icon: cat.icon || '',
      imageUrl: cat.imageUrl || getDefaultImage(cat.slug),
      products_count: cat.productsCount || cat.products_count || 0,
      slug: cat.slug,
      parentId: cat.parentId || null,
      children: (cat.children || []).map(child => ({
        ...child,
        nameAr: child.nameAr || child.name,
        nameFr: child.nameFr || child.name,
        icon: child.icon || '',
        imageUrl: child.imageUrl || getDefaultImage(child.slug),
        products_count: child.productsCount || child.products_count || 0
      }))
    }))
  } catch (error) {
    console.error('Error loading categories:', error)
    categories.value = [
      { id: 1, name: 'Parfums', nameAr: 'عطور', nameFr: 'Parfums', icon: 'ع', slug: 'perfumes', products_count: 0, parentId: null, children: [] },
      { id: 2, name: 'Jewelry', nameAr: 'مجوهرات', nameFr: 'Bijoux', icon: 'م', slug: 'jewelry', products_count: 0, parentId: null, children: [] },
      { id: 3, name: 'Clothing', nameAr: 'ملابس', nameFr: 'Vetements', icon: 'م', slug: 'clothing', products_count: 0, parentId: null, children: [] },
      { id: 4, name: 'Decor', nameAr: 'ديكور', nameFr: 'Decoration', icon: 'د', slug: 'decor', products_count: 0, parentId: null, children: [] }
    ]
    showNotification('تم تحميل تصنيفات افتراضية', 'info')
  } finally {
    loading.value = false
  }
}

// ===== ADD CATEGORY =====
const addCategory = async () => {
  if (!newCategory.value.nameAr.trim()) {
    showNotification('الرجاء ادخال اسم التصنيف بالعربية', 'warning')
    return
  }

  adding.value = true
  try {
    const slug = newCategory.value.nameAr.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    let imageUrl = null

    if (newCategory.value.imageFile) {
      uploading.value = true
      try {
        imageUrl = await uploadImageToBackend(newCategory.value.imageFile, (progress) => {
          uploadProgress.value = progress
        })
      } catch (uploadError) {
        console.warn('Upload failed:', uploadError)
        showNotification('فشل رفع الصورة، سيتم استخدام الصورة الافتراضية', 'warning')
      }
      uploading.value = false
    }

    try {
      const response = await api.post('/admin/categories', {
        name: newCategory.value.nameFr || newCategory.value.nameAr,
        nameAr: newCategory.value.nameAr.trim(),
        nameFr: newCategory.value.nameFr || newCategory.value.nameAr,
        slug: slug,
        icon: newCategory.value.icon || '',
        imageUrl: imageUrl || null,
        description: null,
        parentId: newCategory.value.parentId || null,
        sortOrder: 0
      })

      if (response.data.success) {
        await loadCategories()
        resetNewCategoryForm()
        showNotification('تم اضافة التصنيف بنجاح' + (imageUrl ? ' مع الصورة' : ''), 'success')
      }
    } catch (apiError) {
      console.error('API Error:', apiError)
      addCategoryLocally(slug, imageUrl || getDefaultImage(slug))
      resetNewCategoryForm()
      showNotification('تم اضافة التصنيف (محليا)', 'success')
    }
  } catch (error) {
    console.error('Error adding category:', error)
    showNotification('حدث خطا اثناء الاضافة', 'error')
  } finally {
    adding.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

const resetNewCategoryForm = () => {
  clearNewImage()
  newCategory.value = { nameAr: '', nameFr: '', icon: '', parentId: null, imageFile: null, imagePreview: null }
}

const addCategoryLocally = (slug, imageUrl) => {
  const newCat = {
    id: Date.now(),
    name: newCategory.value.nameFr || newCategory.value.nameAr,
    nameAr: newCategory.value.nameAr.trim(),
    nameFr: newCategory.value.nameFr || newCategory.value.nameAr,
    slug: slug,
    icon: newCategory.value.icon || '',
    imageUrl: imageUrl,
    products_count: 0,
    parentId: newCategory.value.parentId || null,
    children: []
  }

  if (newCategory.value.parentId) {
    const parent = categories.value.find(c => c.id === newCategory.value.parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newCat)
    }
  }
  categories.value.push(newCat)
}

// ===== SOUS-CATEGORIE RAPIDE =====
const prepareAddSubcategory = (parentCat) => {
  parentForSub.value = parentCat
  subCategoryForm.value = { nameAr: '', nameFr: '', icon: '', imageFile: null, imagePreview: null }
  showSubCategoryModal.value = true
}

const closeSubCategoryModal = () => {
  showSubCategoryModal.value = false
  parentForSub.value = null
  clearSubImage()
  subCategoryForm.value = { nameAr: '', nameFr: '', icon: '', imageFile: null, imagePreview: null }
}

const addSubCategory = async () => {
  if (!subCategoryForm.value.nameAr.trim()) {
    showNotification('الرجاء ادخال اسم التصنيف الفرعي', 'warning')
    return
  }

  addingSub.value = true
  const parentCat = parentForSub.value

  try {
    const slug = `${parentCat.slug}-${subCategoryForm.value.nameAr.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}`

    let imageUrl = null

    if (subCategoryForm.value.imageFile) {
      subUploading.value = true
      try {
        imageUrl = await uploadImageToBackend(subCategoryForm.value.imageFile, (progress) => {
          subUploadProgress.value = progress
        })
      } catch (uploadError) {
        console.warn('Upload failed:', uploadError)
      }
      subUploading.value = false
    }

    try {
      const response = await api.post('/admin/categories', {
        name: subCategoryForm.value.nameFr || subCategoryForm.value.nameAr,
        nameAr: subCategoryForm.value.nameAr.trim(),
        nameFr: subCategoryForm.value.nameFr || subCategoryForm.value.nameAr,
        slug: slug,
        icon: subCategoryForm.value.icon || '',
        parentId: parentCat.id,
        imageUrl: imageUrl || null,
        description: null,
        sortOrder: 0
      })

      if (response.data.success) {
        await loadCategories()
        showNotification('تم اضافة التصنيف الفرعي بنجاح' + (imageUrl ? ' مع الصورة' : ''), 'success')
        closeSubCategoryModal()
      }
    } catch (apiError) {
      const parent = categories.value.find(c => c.id === parentCat.id)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push({
          id: Date.now(),
          name: subCategoryForm.value.nameFr || subCategoryForm.value.nameAr,
          nameAr: subCategoryForm.value.nameAr.trim(),
          nameFr: subCategoryForm.value.nameFr || subCategoryForm.value.nameAr,
          slug: slug,
          icon: subCategoryForm.value.icon || '',
          imageUrl: imageUrl || getDefaultImage(slug),
          parentId: parentCat.id,
          products_count: 0
        })
      }
      showNotification('تم اضافة التصنيف الفرعي (محليا)', 'success')
      closeSubCategoryModal()
    }
  } catch (error) {
    console.error('Error adding subcategory:', error)
    showNotification('حدث خطا اثناء الاضافة', 'error')
  } finally {
    addingSub.value = false
    subUploading.value = false
    subUploadProgress.value = 0
  }
}

// ===== EDIT CATEGORY =====
const editCategory = (cat) => {
  editingCategory.value = cat
  editForm.value = {
    nameAr: cat.nameAr || cat.name,
    nameFr: cat.nameFr || cat.name,
    icon: cat.icon || '',
    parentId: cat.parentId || null,
    imageFile: null,
    imagePreview: null,
    currentImage: cat.imageUrl || null
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCategory.value = null
  clearEditImage()
  editForm.value = { nameAr: '', nameFr: '', icon: '', parentId: null, imageFile: null, imagePreview: null, currentImage: null }
}

const saveEditCategory = async () => {
  if (!editForm.value.nameAr.trim()) {
    showNotification('الرجاء ادخال اسم التصنيف', 'warning')
    return
  }

  savingEdit.value = true
  try {
    let imageUrl = editForm.value.currentImage

    if (editForm.value.imageFile) {
      editUploading.value = true
      try {
        imageUrl = await uploadImageToBackend(editForm.value.imageFile, (progress) => {
          editUploadProgress.value = progress
        })
      } catch (uploadError) {
        console.warn('Upload failed:', uploadError)
        showNotification('فشل رفع الصورة', 'warning')
      }
      editUploading.value = false
    }

    try {
      const response = await api.put(`/admin/categories/${editingCategory.value.id}`, {
        nameAr: editForm.value.nameAr.trim(),
        nameFr: editForm.value.nameFr || editForm.value.nameAr,
        icon: editForm.value.icon || '',
        imageUrl: imageUrl || null,
        parentId: editForm.value.parentId || null,
        isActive: true
      })

      if (response.data.success) {
        await loadCategories()
        showNotification('تم تعديل التصنيف بنجاح', 'success')
        closeEditModal()
      }
    } catch (apiError) {
      updateCategoryLocally(imageUrl)
      showNotification('تم تعديل التصنيف (محليا)', 'success')
      closeEditModal()
    }
  } catch (error) {
    console.error('Error updating category:', error)
    showNotification('حدث خطا اثناء التعديل', 'error')
  } finally {
    savingEdit.value = false
    editUploading.value = false
    editUploadProgress.value = 0
  }
}

const updateCategoryLocally = (imageUrl) => {
  const updateInList = (list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === editingCategory.value.id) {
        list[i] = {
          ...list[i],
          nameAr: editForm.value.nameAr.trim(),
          nameFr: editForm.value.nameFr || editForm.value.nameAr,
          icon: editForm.value.icon || '',
          imageUrl: imageUrl || list[i].imageUrl,
          parentId: editForm.value.parentId || null
        }
        return true
      }
      if (list[i].children && updateInList(list[i].children)) {
        return true
      }
    }
    return false
  }
  updateInList(categories.value)
}

// ===== DELETE CATEGORY =====
const deleteCategory = async (cat) => {
  const totalProducts = cat.products_count + (cat.children || []).reduce((sum, sub) => sum + (sub.products_count || 0), 0)

  if (totalProducts > 0) {
    showNotification(`لا يمكن حذف "${cat.nameAr}" لانه يحتوي على ${totalProducts} منتج`, 'warning')
    return
  }

  if (cat.children && cat.children.length > 0) {
    showNotification(`لا يمكن حذف "${cat.nameAr}" لانه يحتوي على ${cat.children.length} تصنيفات فرعية`, 'warning')
    return
  }

  if (!confirm(`هل انت متاكد من حذف التصنيف "${cat.nameAr}"؟`)) return

  try {
    try {
      const response = await api.delete(`/admin/categories/${cat.id}`)
      if (response.data.success) {
        await loadCategories()
        showNotification('تم حذف التصنيف بنجاح', 'success')
      }
    } catch (apiError) {
      removeCategoryLocally(cat.id)
      showNotification('تم حذف التصنيف (محليا)', 'success')
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    showNotification('حدث خطا اثناء الحذف', 'error')
  }
}

const removeCategoryLocally = (catId) => {
  const removeFromList = (list) => {
    const index = list.findIndex(c => c.id === catId)
    if (index !== -1) {
      list.splice(index, 1)
      return true
    }
    for (let item of list) {
      if (item.children && removeFromList(item.children)) {
        return true
      }
    }
    return false
  }
  removeFromList(categories.value)
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (authStore.userRole !== 'admin') {
    showNotification('غير مصرح لك بالوصول الى هذه الصفحة', 'error')
    setTimeout(() => { window.location.href = '/' }, 2000)
    return
  }
  loadCategories()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== BASE ===== */
.admin-page {
  font-family: 'Amiri', 'Cairo', serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 2rem;
  transition: all 0.3s ease;
}

.admin-page.dark-mode {
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
}

.page-content {
  background: white;
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.admin-page.dark-mode .page-content {
  background: #1e293b;
}

/* ===== LOADING ===== */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.loading-state p {
  font-size: 1.1rem;
  color: #64748b;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== FORM ===== */
.add-category-form {
  background: #f8fafc;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.admin-page.dark-mode .add-category-form {
  background: #0f172a;
  border-color: #334155;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.admin-page.dark-mode .form-title {
  color: #f1f5f9;
}

.form-row-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.admin-page.dark-mode .form-label {
  color: #cbd5e1;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1rem;
  background: white;
}

.admin-page.dark-mode .form-input {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.form-input:focus {
  outline: none;
  border-color: #08717f;
}

/* ===== IMAGE UPLOAD ===== */
.image-upload-area {
  width: 100%;
  height: 150px;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.admin-page.dark-mode .image-upload-area {
  border-color: #334155;
  background: #1e293b;
}

.image-upload-area:hover {
  border-color: #08717f;
  background: #f1f5f9;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-image:hover {
  background: #b00020;
  transform: scale(1.1);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: #94a3b8;
}

.upload-icon svg {
  stroke: #08717f;
  opacity: 0.7;
}

.upload-placeholder span {
  font-weight: 500;
}

.upload-placeholder small {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* ===== UPLOAD PROGRESS ===== */
.upload-progress {
  margin-top: 8px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.upload-progress span {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.75rem;
  color: #08717f;
}

/* ===== BUTTON ===== */
.btn-add {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== CATEGORIES CONTAINER ===== */
.categories-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-group {
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.admin-page.dark-mode .category-group {
  background: #0f172a;
  border-color: #334155;
}

/* ===== CATEGORY ITEM ===== */
.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.admin-page.dark-mode .category-item {
  background: #0f172a;
  border-color: #334155;
}

.parent-category {
  border-bottom: 1px solid #e2e8f0;
  border-radius: 0;
}

.admin-page.dark-mode .parent-category {
  border-bottom-color: #334155;
}

.category-item:hover {
  background: white;
  border-color: #08717f;
  transform: translateX(-5px);
}

.admin-page.dark-mode .category-item:hover {
  background: #1e293b;
}

/* ===== SUBCATEGORIES ===== */
.subcategories-list {
  border-top: 1px dashed #e2e8f0;
  padding: 0.5rem 0;
}

.admin-page.dark-mode .subcategories-list {
  border-top-color: #334155;
}

.subcategory-item {
  background: transparent;
  border: none;
  padding-right: 2.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.admin-page.dark-mode .subcategory-item {
  border-bottom-color: #1e293b;
}

.subcategory-item:last-child {
  border-bottom: none;
}

.subcategory-indent {
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.subcategory-indent svg {
  stroke: #94a3b8;
}

/* ===== CATEGORY IMAGE ===== */
.category-image-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.category-image-wrapper.small {
  width: 40px;
  height: 40px;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== CATEGORY INFO ===== */
.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.category-icon-text {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #08717f, #0a94a6);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
}

.category-icon-text.small {
  width: 32px;
  height: 32px;
  font-size: 1rem;
}

.category-details {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.admin-page.dark-mode .category-name {
  color: #f1f5f9;
}

.category-name-fr {
  font-size: 0.8rem;
  color: #64748b;
}

.admin-page.dark-mode .category-name-fr {
  color: #94a3b8;
}

/* ===== CATEGORY STATS ===== */
.category-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.category-count {
  color: #64748b;
  font-size: 0.9rem;
  background: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
}

.admin-page.dark-mode .category-count {
  background: #334155;
  color: #94a3b8;
}

.subcategory-count {
  display: block;
  font-size: 0.75rem;
  color: #08717f;
  margin-top: 2px;
}

.admin-page.dark-mode .subcategory-count {
  color: #2dd4bf;
}

/* ===== ACTIONS ===== */
.category-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.admin-page.dark-mode .icon-btn {
  background: #1e293b;
  color: #94a3b8;
}

.icon-btn.edit:hover {
  background: #f59e0b;
  color: white;
}

.icon-btn.delete:hover {
  background: #d40025;
  color: white;
}

.icon-btn.add-sub {
  background: #dbeafe;
  color: #2563eb;
}

.admin-page.dark-mode .icon-btn.add-sub {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

.icon-btn.add-sub:hover {
  background: #2563eb;
  color: white;
}

/* ===== ORPHAN SECTION ===== */
.orphan-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f59e0b;
}

.admin-page.dark-mode .section-title {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.admin-page.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  animation: modalSlideIn 0.3s ease;
}

.modal-container.dark-mode {
  background: #1e293b;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-container.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  color: #1e293b;
  font-size: 1.3rem;
  margin: 0;
}

.modal-container.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.modal-close {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
}

.modal-container.dark-mode .modal-close {
  background: #334155;
  color: #94a3b8;
}

.modal-close:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.modal-container.dark-mode .btn-cancel {
  background: #334155;
  color: #94a3b8;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.dark-mode {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.warning { border-right-color: #f59e0b; }
.toast-notification.info { border-right-color: #08717f; }

.toast-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

.toast-message {
  font-size: 1rem;
  font-weight: 500;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-page { padding: 1rem; }
  .page-content { padding: 1rem; }
  .form-row-grid { grid-template-columns: 1fr; }
  .category-item { flex-wrap: wrap; }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/CATEGORIES ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
}

/* Loading */
.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Formulaire */
.dark-mode .add-category-form {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .form-title {
  color: #f1f5f9 !important;
}

.dark-mode .form-label {
  color: #cbd5e1 !important;
}

.dark-mode .form-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .form-input:focus {
  border-color: #2dd4bf !important;
}

/* Image Upload */
.dark-mode .image-upload-area {
  background: #121220 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .image-upload-area:hover {
  border-color: #2dd4bf !important;
  background: #1a1a2e !important;
}

.dark-mode .upload-placeholder {
  color: #94a3b8 !important;
}

.dark-mode .upload-icon svg {
  stroke: #2dd4bf !important;
}

/* Upload Progress */
.dark-mode .upload-progress {
  background: #2a2a40 !important;
}

.dark-mode .upload-progress span {
  color: #2dd4bf !important;
}

/* Categories Container */
.dark-mode .category-group {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .category-item {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .category-item:hover {
  background: #252538 !important;
  border-color: #2dd4bf !important;
}

.dark-mode .parent-category {
  border-bottom-color: #2a2a40 !important;
}

/* Subcategories */
.dark-mode .subcategories-list {
  border-top-color: #2a2a40 !important;
}

.dark-mode .subcategory-item {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .subcategory-indent {
  color: #64748b !important;
}

.dark-mode .subcategory-indent svg {
  stroke: #64748b !important;
}

/* Category Info */
.dark-mode .category-name {
  color: #f1f5f9 !important;
}

.dark-mode .category-name-fr {
  color: #94a3b8 !important;
}

/* Category Stats */
.dark-mode .category-count {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .subcategory-count {
  color: #2dd4bf !important;
}

/* Action Buttons */
.dark-mode .icon-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

/* Orphan Section */
.dark-mode .section-title {
  color: #fbbf24 !important;
  border-bottom-color: #fbbf24 !important;
}

/* Empty State */
.dark-mode .empty-state h3 {
  color: #f1f5f9 !important;
}

.dark-mode .empty-state p {
  color: #94a3b8 !important;
}

/* Modal */
.dark-mode .modal-container {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
}

.dark-mode .modal-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .modal-close {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
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
