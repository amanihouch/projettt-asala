<!-- frontend/src/components/CreatePostModal.vue - COMPLET AVEC SOUS-CATÉGORIES -->
<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div>
            <h3>إنشاء منشور جديد</h3>
            <p class="header-subtitle">شارك منتجاتك مع العملاء</p>
          </div>
        </div>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <div class="two-columns">
        <!-- ========== COLONNE GAUCHE ========== -->
        <div class="left-column">
          <!-- Images Section -->
          <div class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>صور المنتج</span>
              </div>
              <span class="image-count">{{ images.length }}/10</span>
            </div>

            <div class="upload-area" @click="triggerFileUpload">
              <div class="upload-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>انقر لرفع الصور</p>
                <span>PNG, JPG, WEBP (max 5MB)</span>
              </div>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style="display: none"
                @change="handleImageUpload"
              />
            </div>

            <div v-if="images.length > 0" class="image-grid">
              <div v-for="(img, idx) in images" :key="idx" class="image-preview">
                <img :src="img.preview" alt="Preview" />
                <button class="image-remove" @click.stop="removeImage(idx)">✕</button>
              </div>
            </div>

            <div v-if="uploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ uploadProgress }}%</div>
            </div>
          </div>

          <!-- ========== CATEGORIES AVEC SOUS-CATÉGORIES ========== -->
          <div class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span>اختر الفئة</span>
              </div>
              <span class="required-badge">مطلوب</span>
            </div>

            <!-- Catégories principales -->
            <div class="categories-grid">
              <div
                v-for="cat in parentCategoriesList"
                :key="'parent-' + cat.id"
                class="category-card"
                :class="{
                  selected: selectedCategory === cat.id,
                  'has-subcategories': cat.children && cat.children.length > 0
                }"
                @click="selectParentCategory(cat)"
              >
                <div class="category-image-wrapper">
                  <img
                    :src="cat.imageUrl || getCategoryImage(cat.slug)"
                    :alt="cat.nameAr || cat.name"
                    class="category-image"
                    @error="handleCategoryImageError"
                  />
                  <div class="category-overlay" v-if="selectedCategory === cat.id">
                    <span class="check-icon">✓</span>
                  </div>
                  <div class="subcategories-indicator" v-if="cat.children && cat.children.length > 0">
                    <span>{{ cat.children.length }}</span>
                  </div>
                </div>
                <div class="category-info">
                  <span class="category-icon">{{ cat.icon || getCategoryIcon(cat.slug) }}</span>
                  <span class="category-name">{{ cat.nameAr || cat.name }}</span>
                </div>
              </div>
            </div>

            <!-- Sous-catégories (affichées quand une catégorie parente est sélectionnée) -->
            <div v-if="showSubCategories" class="subcategories-section">
              <div class="subcategories-header">
                <span class="subcategories-title">
                  <span class="back-arrow" @click="clearCategorySelection">←</span>
                  تصنيفات فرعية لـ {{ selectedParentCategory?.nameAr || selectedParentCategory?.name }}
                </span>
              </div>
              <div class="subcategories-grid">
                <div
                  v-for="subCat in currentSubCategories"
                  :key="'sub-' + subCat.id"
                  class="subcategory-card"
                  :class="{ selected: selectedSubCategory === subCat.id }"
                  @click="selectSubCategory(subCat)"
                >
                  <div class="subcategory-image-wrapper">
                    <img
                      :src="subCat.imageUrl || getCategoryImage(subCat.slug)"
                      :alt="subCat.nameAr || subCat.name"
                      class="subcategory-image"
                      @error="handleCategoryImageError"
                    />
                    <div :class="{ selected: selectedSubCategory?.id === subCat.id }"
v-if="selectedSubCategory?.id === subCat.id">
                      <span class="check-icon small">✓</span>
                    </div>
                  </div>
                  <div class="subcategory-info">
                    <span class="subcategory-icon">{{ subCat.icon || '📁' }}</span>
                    <span class="subcategory-name">{{ subCat.nameAr || subCat.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Catégorie sélectionnée affichée -->
            <div v-if="selectedCategoryName" class="selected-category-display">
              <div class="selected-category-badge">
                <span class="selected-icon">📌</span>
                <span>{{ selectedCategoryName }}</span>
                <button class="clear-category-btn" @click="clearCategorySelection">✕</button>
              </div>
            </div>
          </div>

          <!-- Sizes Section -->
          <div v-if="form.unit === 'piece'" class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span>المقاسات المتاحة</span>
              </div>
              <button type="button" class="add-btn" @click="addNewSize">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                إضافة
              </button>
            </div>

            <div class="sizes-list">
              <div v-for="(size, index) in sizes" :key="index" class="size-item">
                <input type="text" v-model="size.name" class="size-name" placeholder="مثال: S, M, L, 38, 40..." />
                <div class="size-stock">
                  <button type="button" class="stock-btn" @click="decrementSizeStock(index)" :disabled="size.stock <= 0">−</button>
                  <input type="number" v-model.number="size.stock" class="stock-input" min="0" />
                  <button type="button" class="stock-btn" @click="incrementSizeStock(index)">+</button>
                </div>
                <button type="button" class="remove-btn" @click="removeSize(index)" v-if="sizes.length > 1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Shipping Section -->
          <div class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
                <span>الشحن والتوصيل</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="hasShipping" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div v-if="hasShipping" class="shipping-details">
              <div class="shipping-row">
                <label>تكلفة التوصيل</label>
                <div class="price-input-wrapper small">
                  <input type="number" v-model.number="shippingCost" class="form-input" min="0" step="0.01" placeholder="0.00" />
                  <span class="currency">د.ت</span>
                </div>
              </div>
              <div class="shipping-row">
                <label>مدة التوصيل</label>
                <div class="select-wrapper small">
                  <select v-model="shippingTime" class="form-select">
                    <option value="1">يوم واحد</option>
                    <option value="2">يومان</option>
                    <option value="3">3 أيام</option>
                    <option value="4">4 أيام</option>
                    <option value="5">5 أيام</option>
                    <option value="7">أسبوع</option>
                    <option value="10">10 أيام</option>
                    <option value="14">أسبوعان</option>
                  </select>
                  <span class="select-arrow">▼</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== COLONNE DROITE ========== -->
        <div class="right-column">
          <div class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
                <span>معلومات المنتج</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">اسم المنتج <span class="required">*</span></label>
              <input v-model="form.productName" type="text" class="form-input" placeholder="أدخل اسم المنتج..." />
            </div>

            <div class="form-group">
              <label class="form-label">وصف المنتج</label>
              <textarea v-model="form.description" class="form-textarea" placeholder="وصف المنتج..." rows="3"></textarea>
              <div class="char-counter">{{ form.description.length }}/500</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">السعر <span class="required">*</span></label>
                <div class="price-input-wrapper">
                  <input v-model.number="form.price" type="number" step="0.5" min="0" class="form-input" placeholder="0.00" />
                  <span class="currency">د.ت</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">السعر القديم</label>
                <div class="price-input-wrapper">
                  <input v-model.number="form.oldPrice" type="number" step="0.5" min="0" class="form-input" placeholder="0.00" />
                  <span class="currency">د.ت</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">الكمية</label>
                <div class="quantity-wrapper">
                  <button class="qty-btn" @click="decrementQuantity" :disabled="form.quantity <= 1">−</button>
                  <input v-model.number="form.quantity" type="number" class="quantity-input" min="1" />
                  <button class="qty-btn" @click="incrementQuantity">+</button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">الوحدة</label>
                <select v-model="form.unit" class="form-select" @change="onUnitChange">
                  <option value="piece">قطعة</option>
                  <option value="set">مجموعة</option>
                  <option value="kg">كيلوغرام</option>
                  <option value="gram">غرام</option>
                  <option value="liter">لتر</option>
                  <option value="meter">متر</option>
                  <option value="pair">زوج</option>
                  <option value="box">علبة</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">حالة التوفر</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="stockStatus" value="in_stock" />
                  <span class="radio-custom"></span> متوفر
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="stockStatus" value="low_stock" />
                  <span class="radio-custom"></span> كمية محدودة
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="stockStatus" value="out_of_stock" />
                  <span class="radio-custom"></span> غير متوفر
                </label>
              </div>
            </div>
          </div>

          <!-- Couleurs Section (inchangée) -->
          <div class="card-section">
            <div class="card-header">
              <div class="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>الألوان المتوفرة</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="hasColors" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div v-if="hasColors" class="colors-container">
              <div class="color-filters">
                <button type="button" class="filter-btn" :class="{ active: colorFilter === 'all' }" @click="colorFilter = 'all'">الكل</button>
                <button type="button" class="filter-btn" :class="{ active: colorFilter === 'basic' }" @click="colorFilter = 'basic'">أساسية</button>
                <button type="button" class="filter-btn" :class="{ active: colorFilter === 'pastel' }" @click="colorFilter = 'pastel'">باستيل</button>
                <button type="button" class="filter-btn" :class="{ active: colorFilter === 'dark' }" @click="colorFilter = 'dark'">داكنة</button>
              </div>

              <div class="color-palette">
                <div
                  v-for="color in filteredColors"
                  :key="color.code"
                  class="color-swatch"
                  :class="{ selected: selectedColors.includes(color.code) }"
                  :style="{ backgroundColor: color.code }"
                  @click="toggleColor(color.code)"
                  :title="color.name"
                >
                  <span v-if="selectedColors.includes(color.code)" class="check-mark">✓</span>
                </div>
              </div>

              <div class="custom-color-row">
                <input type="color" v-model="customColorValue" class="custom-color-picker" />
                <input type="text" v-model="customColorName" class="custom-color-name" placeholder="اسم اللون" />
                <button type="button" class="add-color-btn" @click="addCustomColor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  أضف
                </button>
              </div>

              <div v-if="selectedColors.length > 0" class="selected-colors">
                <div class="selected-header">
                  <span>الألوان المختارة ({{ selectedColors.length }})</span>
                  <button type="button" class="clear-btn" @click="clearAllColors">مسح الكل</button>
                </div>
                <div class="selected-tags">
                  <span v-for="code in selectedColors" :key="code" class="color-tag">
                    <span class="color-dot" :style="{ backgroundColor: code }"></span>
                    <span>{{ getColorNameFromCode(code) }}</span>
                    <button type="button" class="tag-remove" @click="removeColor(code)">×</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="handleClose">إلغاء</button>
        <button class="btn-submit" @click="submitPost" :disabled="!isFormValid || uploading">
          <span v-if="uploading" class="loading-spinner"></span>
          <span v-else>{{ isSubmitting ? 'جاري النشر...' : 'نشر' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const props = defineProps({
  isVisible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'post-created'])

const themeStore = useThemeStore()
const authStore = useAuthStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== FORM DATA =====
const form = ref({
  productName: '',
  description: '',
  price: 0,
  oldPrice: null,
  quantity: 1,
  unit: 'piece'
})

// ===== IMAGES =====
const images = ref([])
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const isSubmitting = ref(false)

// ===== CATEGORIES AVEC SOUS-CATÉGORIES =====
const categories = ref([])
const selectedCategory = ref(null)
const selectedSubCategory = ref(null)
const selectedParentCategory = ref(null)

const parentCategoriesList = computed(() => {
  return categories.value.filter(cat => !cat.parentId)
})

const showSubCategories = computed(() => {
  return selectedParentCategory.value &&
         selectedParentCategory.value.children &&
         selectedParentCategory.value.children.length > 0 &&
         !selectedSubCategory.value
})

const currentSubCategories = computed(() => {
  if (!selectedParentCategory.value || !selectedParentCategory.value.children) return []
  return selectedParentCategory.value.children
})

const selectedCategoryName = computed(() => {
  if (selectedSubCategory.value) {
    return `${selectedParentCategory.value?.nameAr || ''} › ${selectedSubCategory.value.nameAr || selectedSubCategory.value.name}`
  }
  if (selectedParentCategory.value) {
    return selectedParentCategory.value.nameAr || selectedParentCategory.value.name
  }
  return ''
})

const selectParentCategory = (cat) => {
  selectedParentCategory.value = cat
  selectedSubCategory.value = null

  // Si la catégorie a des sous-catégories, on ne sélectionne pas encore
  if (cat.children && cat.children.length > 0) {
    selectedCategory.value = null
  } else {
    // Si pas de sous-catégories, on sélectionne directement
    selectedCategory.value = cat.id
  }
}

const selectSubCategory = (subCat) => {
  selectedSubCategory.value = subCat
  selectedCategory.value = subCat.id
}

const clearCategorySelection = () => {
  selectedCategory.value = null
  selectedSubCategory.value = null
  selectedParentCategory.value = null
}

// ===== COULEURS =====
const hasColors = ref(false)
const selectedColors = ref([])
const colorFilter = ref('all')
const customColorValue = ref('#08717f')
const customColorName = ref('')
const customColors = ref([])

// ===== TAILLES =====
const sizes = ref([{ name: '', stock: 1 }])

// ===== SHIPPING =====
const hasShipping = ref(false)
const shippingCost = ref(0)
const shippingTime = ref(3)

// ===== STOCK =====
const stockStatus = ref('in_stock')

// ===== CLOUDINARY =====
const CLOUDINARY_CLOUD_NAME = 'djfj85bwe'

// ===== PALETTE DE COULEURS =====
const allColors = [
  { name: 'أحمر', code: '#EF4444' },
  { name: 'أزرق', code: '#08717F' },
  { name: 'أخضر', code: '#10B981' },
  { name: 'أصفر', code: '#FBBF24' },
  { name: 'أسود', code: '#1E293B' },
  { name: 'أبيض', code: '#FFFFFF' },
  { name: 'وردي', code: '#F472B6' },
  { name: 'برتقالي', code: '#F97316' },
  { name: 'بنفسجي', code: '#8B5CF6' },
  { name: 'بني', code: '#78350F' },
  { name: 'رمادي', code: '#64748B' },
  { name: 'ذهبي', code: '#F59E0B' },
  { name: 'فيروزي', code: '#14B8A6' },
  { name: 'نيلي', code: '#4F46E5' },
  { name: 'لافندر', code: '#C4B5FD' },
  { name: 'نعناعي', code: '#A7F3D0' },
  { name: 'مرجاني', code: '#FB7185' },
  { name: 'خوخي', code: '#FDE68A' },
  { name: 'بيج', code: '#F5F5DC' },
  { name: 'كريمي', code: '#FEF3C7' }
]

// ===== FONCTIONS CATÉGORIES =====
const getCategoryImage = (slug) => {
  const images = {
    'perfumes': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/perfumes.jpg`,
    'jewelry': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/jewelry.jpg`,
    'clothing': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/clothing.jpg`,
    'decor': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/decor.jpg`,
    'textiles': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/textiles.jpg`,
    'pottery': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/pottery.jpg`,
    'beauty': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/beauty.jpg`,
    'food': `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/turath/categories/food.jpg`
  }
  return images[slug] || `https://placehold.co/400x400/08717f/white?text=${encodeURIComponent(slug || 'categorie')}`
}

const getCategoryIcon = (slug) => {
  const icons = {
    'perfumes': '🌸', 'oriental-perfumes': '🕌', 'floral-perfumes': '🌺',
    'jewelry': '💍', 'rings': '💍', 'necklaces': '📿', 'bracelets': '⛓️',
    'clothing': '👗', 'decor': '🏺', 'textiles': '🧵',
    'pottery': '🍽️', 'beauty': '🧴', 'food': '🍯'
  }
  return icons[slug] || '📦'
}

const handleCategoryImageError = (e) => {
  e.target.src = 'https://placehold.co/400x400/08717f/white?text=فئة'
}

// ===== FONCTIONS COULEURS =====
const filteredColors = computed(() => {
  let filtered = [...allColors, ...customColors.value]
  if (colorFilter.value === 'basic') {
    filtered = filtered.filter(c => ['أسود', 'أبيض', 'رمادي', 'بيج', 'بني'].includes(c.name))
  } else if (colorFilter.value === 'pastel') {
    filtered = filtered.filter(c => ['وردي', 'خوخي', 'لافندر', 'نعناعي', 'كريمي'].includes(c.name))
  } else if (colorFilter.value === 'dark') {
    filtered = filtered.filter(c => ['أسود', 'بني', 'نيلي', 'بنفسجي'].includes(c.name))
  }
  return filtered
})

const getColorNameFromCode = (code) => {
  const color = allColors.find(c => c.code === code)
  if (color) return color.name
  const custom = customColors.value.find(c => c.code === code)
  return custom ? custom.name : code
}

const toggleColor = (code) => {
  const index = selectedColors.value.indexOf(code)
  if (index === -1) selectedColors.value.push(code)
  else selectedColors.value.splice(index, 1)
}

const removeColor = (code) => {
  const index = selectedColors.value.indexOf(code)
  if (index !== -1) selectedColors.value.splice(index, 1)
}

const clearAllColors = () => { selectedColors.value = [] }

const addCustomColor = () => {
  if (customColorName.value.trim()) {
    customColors.value.push({ name: customColorName.value, code: customColorValue.value })
    selectedColors.value.push(customColorValue.value)
    customColorName.value = ''
  }
}

// ===== FONCTIONS TAILLES =====
const addNewSize = () => sizes.value.push({ name: '', stock: 1 })
const removeSize = (index) => sizes.value.splice(index, 1)
const decrementSizeStock = (index) => { if (sizes.value[index].stock > 0) sizes.value[index].stock-- }
const incrementSizeStock = (index) => sizes.value[index].stock++
const onUnitChange = () => { if (form.value.unit !== 'piece') sizes.value = [{ name: '', stock: 1 }] }

// ===== FONCTIONS QUANTITÉ =====
const incrementQuantity = () => form.value.quantity++
const decrementQuantity = () => { if (form.value.quantity > 1) form.value.quantity-- }

// ===== CHARGEMENT DES CATÉGORIES =====
const loadCategories = async () => {
  try {
    console.log('🔄 Chargement des catégories avec sous-catégories...')
    const response = await api.get('/categories?include=children')

    let data = []
    if (response.data.success) {
      data = response.data.data?.categories || response.data.categories || []
    }

    categories.value = (Array.isArray(data) ? data : []).map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      nameAr: cat.nameAr || cat.name,
      icon: cat.icon || getCategoryIcon(cat.slug),
      imageUrl: cat.imageUrl || getCategoryImage(cat.slug),
      parentId: cat.parentId || null,
      children: (cat.children || []).map(child => ({
        ...child,
        nameAr: child.nameAr || child.name,
        icon: child.icon || getCategoryIcon(child.slug),
        imageUrl: child.imageUrl || getCategoryImage(child.slug)
      }))
    }))

    console.log('✅ Catégories chargées:', categories.value.length)
  } catch (error) {
    console.error('❌ Erreur chargement catégories:', error)
  }
}

// ===== GESTION IMAGES =====
const triggerFileUpload = () => fileInput.value?.click()

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  if (images.value.length + files.length > 10) {
    alert('لا يمكنك رفع أكثر من 10 صور')
    return
  }
  for (const file of files) {
    if (!file.type.startsWith('image/')) { alert('الرجاء اختيار صور فقط'); continue }
    if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة يجب أن يكون أقل من 5MB'); continue }
    images.value.push({ file, preview: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
}

// ===== VALIDATION =====
const isFormValid = computed(() => {
  return form.value.productName.trim().length > 0 &&
         form.value.price > 0 &&
         images.value.length > 0 &&
         selectedCategory.value !== null
})

// ===== RÉINITIALISATION =====
const resetForm = () => {
  form.value = { productName: '', description: '', price: 0, oldPrice: null, quantity: 1, unit: 'piece' }
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
  images.value = []
  selectedColors.value = []
  selectedCategory.value = null
  selectedSubCategory.value = null
  selectedParentCategory.value = null
  sizes.value = [{ name: '', stock: 1 }]
  hasColors.value = false
  hasShipping.value = false
  shippingCost.value = 0
  shippingTime.value = 3
  stockStatus.value = 'in_stock'
  customColors.value = []
}

// ===== SOUMISSION =====
const submitPost = async () => {
  if (!isFormValid.value || uploading.value || isSubmitting.value) return

  isSubmitting.value = true
  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('productName', form.value.productName)
    formData.append('description', form.value.description)
    formData.append('price', form.value.price)
    if (form.value.oldPrice) formData.append('oldPrice', form.value.oldPrice)
    formData.append('quantity', form.value.quantity)
    formData.append('unit', form.value.unit)
    formData.append('stockStatus', stockStatus.value)
    formData.append('hasColors', hasColors.value)
    formData.append('colors', JSON.stringify(selectedColors.value))
    formData.append('hasShipping', hasShipping.value)
    const chosenCategory = selectedSubCategory.value || selectedParentCategory.value

if (chosenCategory) {
  formData.append('categoryId', chosenCategory.id)
  formData.append('categorySlug', chosenCategory.slug)
  formData.append('category', chosenCategory.slug)
  formData.append('categoryName', chosenCategory.nameAr || chosenCategory.name)
}

    if (hasShipping.value) {
      formData.append('shippingCost', shippingCost.value)
      formData.append('shippingTime', shippingTime.value)
    }

    if (form.value.unit === 'piece') {
      formData.append('sizes', JSON.stringify(sizes.value.filter(s => s.name.trim())))
    }

    for (let i = 0; i < images.value.length; i++) {
      formData.append('images', images.value[i].file)
    }

    const vendorId = authStore.vendorId || localStorage.getItem('vendorId')
    if (vendorId) formData.append('vendorId', vendorId)

    const interval = setInterval(() => {
      if (uploadProgress.value < 90) uploadProgress.value += 10
    }, 200)

    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    clearInterval(interval)
    uploadProgress.value = 100

    if (response.data.success) {
      emit('post-created', response.data.data?.post || response.data)
      resetForm()
      handleClose()
    } else {
      throw new Error(response.data.message || 'Erreur lors de la création')
    }
  } catch (error) {
    console.error('❌ Error submitting post:', error)
    alert(error.response?.data?.message || error.message || 'حدث خطأ أثناء نشر المنشور')
  } finally {
    isSubmitting.value = false
    uploading.value = false
    uploadProgress.value = 0
  }
}

const handleClose = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');

.modal-content, .modal-content * {
  font-family: 'Amiri', 'Cairo', serif !important;
}
</style>

<style scoped>
/* ===== BASE ===== */
.modal-content { font-family: 'Amiri', 'Cairo', serif; }
.modal-content h3 { font-family: 'Amiri', serif; font-weight: 700; font-size: 1.3rem; }
.header-subtitle { font-family: 'Amiri', serif; font-size: 0.9rem; }
.card-title span { font-family: 'Amiri', serif; font-weight: 600; font-size: 1rem; }

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 10000;
}
.modal-content {
  background: #fff; border-radius: 28px; width: 90%; max-width: 1100px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.modal-content.dark-mode { background: #1e293b; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 28px; border-bottom: 1px solid #eef2f6;
  position: sticky; top: 0; background: white; z-index: 10;
}
.modal-content.dark-mode .modal-header { background: #1e293b; border-bottom-color: #334155; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon svg { stroke: #08717f; }
.header-left h3 { margin: 0; font-weight: 700; color: #1e293b; }
.modal-content.dark-mode .header-left h3 { color: #f1f5f9; }
.header-subtitle { margin: 0; color: #64748b; }
.close-btn {
  width: 38px; height: 38px; background: #f8fafc; border: none;
  border-radius: 12px; cursor: pointer; font-size: 1.2rem; transition: all 0.2s;
}
.close-btn:hover { background: #d40025; color: white; transform: rotate(90deg); }

/* ===== TWO COLUMNS ===== */
.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 28px; direction: rtl; }

/* ===== CARD SECTION ===== */
.card-section {
  background: #f8fafc; border-radius: 20px; padding: 16px;
  margin-bottom: 20px; border: 1px solid #eef2f6;
}
.modal-content.dark-mode .card-section { background: #0f172a; border-color: #334155; }
.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;
}
.card-title { display: flex; align-items: center; gap: 10px; color: #1e293b; }
.modal-content.dark-mode .card-title { color: #f1f5f9; }
.image-count { color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 20px; }
.required-badge {
  background: #fee2e2; color: #d40025; padding: 2px 10px;
  border-radius: 20px; font-size: 0.7rem; font-weight: 600;
}

/* ===== UPLOAD ===== */
.upload-area {
  border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px;
  text-align: center; cursor: pointer; transition: all 0.2s; background: #fff;
}
.modal-content.dark-mode .upload-area { background: #1e293b; border-color: #334155; }
.upload-area:hover { border-color: #08717f; background: #f8fafc; }
.upload-placeholder svg { stroke: #08717f; margin-bottom: 8px; }
.upload-placeholder p { margin: 8px 0 4px; color: #1e293b; }
.upload-placeholder span { color: #64748b; font-size: 0.8rem; }
.image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; margin-top: 16px; }
.image-preview { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
  background: rgba(212,0,37,0.9); border: none; border-radius: 50%;
  cursor: pointer; color: white; opacity: 0; transition: opacity 0.2s;
}
.image-preview:hover .image-remove { opacity: 1; }
.upload-progress { background: #f0fdf4; border-radius: 14px; padding: 12px 16px; margin-top: 16px; border: 1px solid #bbf7d0; }
.progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #08717f, #d40025); transition: width 0.3s; }
.progress-text { color: #08717f; margin-top: 8px; text-align: center; }

/* ===== CATEGORIES GRID ===== */
.categories-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}
.category-card {
  position: relative; cursor: pointer; border-radius: 16px; overflow: hidden;
  transition: all 0.3s ease; background: white; border: 2px solid #e2e8f0;
}
.modal-content.dark-mode .category-card { background: #0f172a; border-color: #334155; }
.category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-color: #08717f; }
.category-card.selected { border-color: #08717f; box-shadow: 0 0 0 2px rgba(8,113,127,0.2); }
.category-card.has-subcategories { border-style: solid; }
.category-image-wrapper { position: relative; width: 100%; height: 100px; overflow: hidden; }
.category-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.category-card:hover .category-image { transform: scale(1.05); }
.category-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8,113,127,0.8); display: flex; align-items: center; justify-content: center;
}
.check-icon {
  width: 30px; height: 30px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #08717f; font-size: 1.2rem; font-weight: bold; animation: scaleIn 0.2s ease;
}
.check-icon.small { width: 22px; height: 22px; font-size: 0.9rem; }
@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
.subcategories-indicator {
  position: absolute; top: 8px; left: 8px;
  background: rgba(245,158,11,0.9); color: white;
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: bold;
}
.category-info { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; text-align: center; }
.category-icon { font-size: 1rem; }
.category-name { font-family: 'Amiri', serif; font-weight: 600; font-size: 0.85rem; color: #1e293b; }
.modal-content.dark-mode .category-name { color: #f1f5f9; }

/* ===== SOUS-CATÉGORIES ===== */
.subcategories-section {
  margin-top: 16px; padding: 16px;
  background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
  animation: slideDown 0.3s ease;
}
.modal-content.dark-mode .subcategories-section { background: #1e293b; border-color: #334155; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.subcategories-header { margin-bottom: 12px; }
.subcategories-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #08717f; }
.back-arrow { cursor: pointer; font-size: 1.2rem; color: #64748b; transition: color 0.2s; }
.back-arrow:hover { color: #d40025; }
.subcategories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; }
.subcategory-card {
  position: relative; cursor: pointer; border-radius: 14px; overflow: hidden;
  transition: all 0.3s ease; border: 2px solid #e2e8f0;
}
.subcategory-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.1); border-color: #08717f; }
.subcategory-card.selected { border-color: #10b981; }
.subcategory-image-wrapper { position: relative; width: 100%; height: 80px; overflow: hidden; }
.subcategory-image { width: 100%; height: 100%; object-fit: cover; }
.subcategory-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(16,185,129,0.7); display: flex; align-items: center; justify-content: center;
}
.subcategory-info { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; }
.subcategory-icon { font-size: 0.9rem; }
.subcategory-name { font-size: 0.8rem; font-weight: 600; color: #1e293b; }
.modal-content.dark-mode .subcategory-name { color: #f1f5f9; }

/* ===== SELECTED CATEGORY DISPLAY ===== */
.selected-category-display { margin-top: 16px; }
.selected-category-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; background: linear-gradient(135deg, #08717f, #065a69);
  color: white; border-radius: 30px; font-weight: 600; font-size: 0.9rem;
}
.selected-icon { font-size: 1rem; }
.clear-category-btn {
  width: 22px; height: 22px; background: rgba(255,255,255,0.2);
  border: none; border-radius: 50%; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
}
.clear-category-btn:hover { background: rgba(255,255,255,0.4); }

/* ===== FORM ELEMENTS ===== */
.form-group { margin-bottom: 20px; }
.form-label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #1e293b; font-weight: 600; font-size: 0.9rem; }
.modal-content.dark-mode .form-label { color: #f1f5f9; }
.required { color: #d40025; }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0;
  border-radius: 12px; background: white; font-size: 0.95rem;
}
.modal-content.dark-mode .form-input, .modal-content.dark-mode .form-select, .modal-content.dark-mode .form-textarea {
  background: #0f172a; border-color: #334155; color: #f1f5f9;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #08717f; }
.char-counter { text-align: left; color: #94a3b8; margin-top: 4px; font-size: 0.75rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.price-input-wrapper { position: relative; }
.price-input-wrapper input { padding-left: 60px; }
.currency { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.85rem; }
.quantity-wrapper { display: flex; align-items: center; gap: 8px; background: #f8fafc; border-radius: 40px; padding: 4px; border: 1px solid #e2e8f0; width: fit-content; }
.qty-btn { width: 34px; height: 34px; background: white; border: none; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: 600; color: #08717f; }
.qty-btn:hover:not(:disabled) { background: #08717f; color: white; }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.quantity-input { width: 60px; text-align: center; border: none; background: transparent; font-size: 1rem; font-weight: 500; }
.radio-group { display: flex; gap: 24px; flex-wrap: wrap; }
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #334155; font-size: 0.9rem; }
.radio-label input { display: none; }
.radio-custom { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; position: relative; }
.radio-label input:checked + .radio-custom { border-color: #d40025; }
.radio-label input:checked + .radio-custom::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 8px; height: 8px; background: #d40025; border-radius: 50%;
}

/* ===== TOGGLE ===== */
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 24px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: 0.3s; border-radius: 34px; }
.toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 2px; bottom: 2px; background-color: white; transition: 0.3s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background-color: #d40025; }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(24px); }

/* ===== SIZES ===== */
.sizes-list { display: flex; flex-direction: column; gap: 12px; }
.size-item {
  display: flex; gap: 12px; align-items: center; background: white;
  padding: 10px; border-radius: 14px; border: 1px solid #e2e8f0;
}
.modal-content.dark-mode .size-item { background: #1e293b; border-color: #334155; }
.size-name { flex: 2; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
.size-stock { display: flex; align-items: center; gap: 6px; background: #f8fafc; border-radius: 30px; padding: 4px; }
.stock-btn { width: 30px; height: 30px; background: white; border: none; border-radius: 50%; cursor: pointer; font-weight: 600; color: #08717f; }
.stock-btn:hover { background: #08717f; color: white; }
.stock-input { width: 50px; text-align: center; border: none; background: transparent; font-weight: 500; }
.remove-btn { width: 32px; height: 32px; background: #fee2e2; border: none; border-radius: 10px; cursor: pointer; color: #d40025; display: flex; align-items: center; justify-content: center; }
.remove-btn:hover { background: #d40025; color: white; }
.add-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: white; border: 1px solid #08717f; border-radius: 30px; color: #08717f; cursor: pointer; font-weight: 500; }
.add-btn:hover { background: #08717f; color: white; }

/* ===== SHIPPING ===== */
.select-wrapper { position: relative; }
.select-arrow { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #94a3b8; pointer-events: none; }
.shipping-details { display: flex; flex-direction: column; gap: 12px; }
.shipping-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.shipping-row label { color: #475569; font-weight: 600; font-size: 0.85rem; }
.price-input-wrapper.small { width: 140px; }
.select-wrapper.small { width: 140px; }

/* ===== COLORS ===== */
.colors-container { margin-top: 8px; }
.color-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-btn { padding: 5px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 30px; cursor: pointer; font-size: 0.75rem; font-weight: 500; }
.filter-btn.active { background: #08717f; border-color: #08717f; color: white; }
.color-palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)); gap: 10px; margin-bottom: 16px; max-height: 200px; overflow-y: auto; }
.color-swatch { aspect-ratio: 1; border-radius: 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.color-swatch:hover { transform: scale(1.05); }
.color-swatch.selected { border-color: #1e293b; box-shadow: 0 0 0 2px white, 0 0 0 4px #1e293b; }
.check-mark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1rem; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.5); }
.custom-color-row { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.custom-color-picker { width: 48px; height: 48px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; }
.custom-color-name { flex: 1; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; }
.add-color-btn { padding: 8px 16px; background: #08717f; border: none; border-radius: 30px; color: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 500; }
.selected-colors { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.selected-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.selected-header span { font-weight: 600; font-size: 0.8rem; }
.clear-btn { background: none; border: none; color: #d40025; cursor: pointer; font-size: 0.75rem; }
.selected-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.color-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; background: white; border-radius: 30px; border: 1px solid #e2e8f0; }
.color-dot { width: 14px; height: 14px; border-radius: 50%; }
.color-tag span { font-size: 0.8rem; }
.tag-remove { background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 0 2px; }
.tag-remove:hover { color: #d40025; }

/* ===== FORM ACTIONS ===== */
.form-actions { display: flex; gap: 16px; padding: 20px 28px; border-top: 1px solid #eef2f6; background: white; position: sticky; bottom: 0; }
.modal-content.dark-mode .form-actions { background: #1e293b; border-top-color: #334155; }
.btn-cancel, .btn-submit { flex: 1; padding: 14px 20px; border-radius: 40px; cursor: pointer; transition: all 0.2s; text-align: center; font-weight: 600; font-size: 1.05rem; }
.btn-cancel { background: #f1f5f9; border: none; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; transform: translateY(-1px); }
.btn-submit { background: linear-gradient(135deg, #08717f, #065a69); border: none; color: white; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(8,113,127,0.3); }
.loading-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) { .two-columns { grid-template-columns: 1fr; gap: 20px; } .modal-content { max-width: 95%; } }
@media (max-width: 768px) {
  .categories-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  .category-image-wrapper { height: 80px; }
  .category-name { font-size: 0.75rem; }
  .subcategories-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
  .subcategory-image-wrapper { height: 60px; }
}
@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; gap: 12px; }
  .color-palette { grid-template-columns: repeat(auto-fill, minmax(36px, 1fr)); }
  .size-item { flex-wrap: wrap; }
  .form-actions { flex-wrap: wrap; }
  .btn-cancel, .btn-submit { flex: auto; min-width: 100px; }
}
@media (max-width: 480px) {
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
}
/* ============================================
   📱 CREATE POST MODAL - DESIGN MOBILE COMPLET
============================================ */

/* ----- TABLETTE (max-width: 900px) ----- */
@media (max-width: 900px) {
  .two-columns {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
    padding: 20px !important;
  }

  .modal-content {
    max-width: 95% !important;
    border-radius: 24px !important;
  }
}

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== MODAL PLEIN ÉCRAN ===== */
  .modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .modal-content {
    width: 100% !important;
    max-width: 100% !important;
    height: 92vh !important;
    height: 92dvh !important;
    max-height: 92dvh !important;
    border-radius: 24px 24px 0 0 !important;
    overflow-y: auto !important;
    animation: modalSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  @keyframes modalSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* ===== HEADER ===== */
  .modal-header {
    padding: 16px 20px !important;
    border-radius: 24px 24px 0 0 !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
    background: #ffffff !important;
    min-height: 60px !important;
  }

  .modal-content.dark-mode .modal-header {
    background: #1e293b !important;
  }

  .header-left h3 {
    font-size: 18px !important;
  }

  .header-subtitle {
    font-size: 12px !important;
    display: none !important; /* Caché sur mobile pour gagner de l'espace */
  }

  .header-icon svg {
    width: 22px !important;
    height: 22px !important;
  }

  .close-btn {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
    font-size: 18px !important;
  }

  /* ===== TWO COLUMNS ===== */
  .two-columns {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
    padding: 14px !important;
  }

  /* ===== CARD SECTIONS ===== */
  .card-section {
    padding: 14px !important;
    border-radius: 16px !important;
    margin-bottom: 14px !important;
  }

  .card-header {
    margin-bottom: 12px !important;
    padding-bottom: 10px !important;
  }

  .card-title span {
    font-size: 15px !important;
  }

  .card-title svg {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== UPLOAD AREA ===== */
  .upload-area {
    padding: 20px 16px !important;
    border-radius: 14px !important;
    border-width: 1.5px !important;
  }

  .upload-placeholder svg {
    width: 36px !important;
    height: 36px !important;
  }

  .upload-placeholder p {
    font-size: 14px !important;
  }

  .upload-placeholder span {
    font-size: 11px !important;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)) !important;
    gap: 8px !important;
  }

  .image-preview {
    border-radius: 10px !important;
  }

  .image-remove {
    width: 22px !important;
    height: 22px !important;
    top: 3px !important;
    right: 3px !important;
    font-size: 10px !important;
    opacity: 0.8 !important;
  }

  /* ===== CATEGORIES GRID ===== */
  .categories-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }

  .category-card {
    border-radius: 14px !important;
    border-width: 1.5px !important;
  }

  .category-image-wrapper {
    height: 90px !important;
  }

  .category-info {
    padding: 10px 8px !important;
    gap: 6px !important;
  }

  .category-name {
    font-size: 13px !important;
  }

  .category-icon {
    font-size: 14px !important;
  }

  .subcategories-indicator {
    width: 20px !important;
    height: 20px !important;
    top: 6px !important;
    left: 6px !important;
    font-size: 10px !important;
  }

  /* ===== SUBCATEGORIES ===== */
  .subcategories-section {
    padding: 12px !important;
    border-radius: 14px !important;
  }

  .subcategories-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .subcategory-card {
    border-radius: 12px !important;
  }

  .subcategory-image-wrapper {
    height: 70px !important;
  }

  .subcategory-info {
    padding: 8px 6px !important;
  }

  .subcategory-name {
    font-size: 12px !important;
  }

  .back-arrow {
    font-size: 18px !important;
  }

  /* ===== SELECTED CATEGORY ===== */
  .selected-category-badge {
    padding: 8px 14px !important;
    font-size: 13px !important;
    border-radius: 24px !important;
  }

  .clear-category-btn {
    width: 20px !important;
    height: 20px !important;
    font-size: 12px !important;
  }

  /* ===== FORM ELEMENTS ===== */
  .form-group {
    margin-bottom: 16px !important;
  }

  .form-label {
    font-size: 13px !important;
    margin-bottom: 6px !important;
  }

  .form-input,
  .form-select,
  .form-textarea {
    padding: 11px 14px !important;
    border-radius: 10px !important;
    font-size: 15px !important;
    border-width: 1.5px !important;
  }

  .form-textarea {
    min-height: 80px !important;
  }

  .form-row {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  /* Price input */
  .price-input-wrapper input {
    padding-left: 55px !important;
  }

  .currency {
    left: 12px !important;
    font-size: 13px !important;
  }

  /* Quantity */
  .quantity-wrapper {
    padding: 3px !important;
    border-radius: 30px !important;
  }

  .qty-btn {
    width: 32px !important;
    height: 32px !important;
    font-size: 18px !important;
  }

  .quantity-input {
    width: 50px !important;
    font-size: 15px !important;
  }

  /* Radio group */
  .radio-group {
    gap: 16px !important;
  }

  .radio-label {
    font-size: 13px !important;
  }

  .radio-custom {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== TOGGLE ===== */
  .toggle-switch {
    width: 44px !important;
    height: 22px !important;
  }

  .toggle-slider:before {
    height: 18px !important;
    width: 18px !important;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px) !important;
  }

  /* ===== SIZES ===== */
  .sizes-list {
    gap: 8px !important;
  }

  .size-item {
    padding: 8px !important;
    border-radius: 12px !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }

  .size-name {
    flex: 1 1 100% !important;
    padding: 8px 10px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
  }

  .size-stock {
    flex: 1 !important;
    justify-content: center !important;
  }

  .stock-btn {
    width: 28px !important;
    height: 28px !important;
  }

  .stock-input {
    width: 40px !important;
  }

  .remove-btn {
    width: 30px !important;
    height: 30px !important;
    border-radius: 8px !important;
  }

  .add-btn {
    padding: 6px 12px !important;
    font-size: 13px !important;
    border-radius: 20px !important;
  }

  /* ===== SHIPPING ===== */
  .shipping-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }

  .shipping-row label {
    font-size: 13px !important;
  }

  .price-input-wrapper.small,
  .select-wrapper.small {
    width: 100% !important;
  }

  /* ===== COLORS ===== */
  .color-palette {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)) !important;
    gap: 8px !important;
    max-height: 180px !important;
  }

  .color-swatch {
    border-radius: 10px !important;
  }

  .color-filters {
    gap: 6px !important;
  }

  .filter-btn {
    padding: 5px 12px !important;
    font-size: 11px !important;
  }

  .custom-color-row {
    flex-wrap: wrap !important;
    gap: 8px !important;
  }

  .custom-color-picker {
    width: 44px !important;
    height: 44px !important;
    border-radius: 10px !important;
  }

  .custom-color-name {
    flex: 1 1 120px !important;
    padding: 8px 10px !important;
    font-size: 13px !important;
  }

  .add-color-btn {
    padding: 8px 14px !important;
    font-size: 12px !important;
  }

  .selected-tags {
    gap: 6px !important;
  }

  .color-tag {
    padding: 4px 8px !important;
    font-size: 12px !important;
  }

  .color-dot {
    width: 12px !important;
    height: 12px !important;
  }

  /* ===== FORM ACTIONS ===== */
  .form-actions {
    padding: 14px 16px !important;
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)) !important;
    gap: 10px !important;
    position: sticky !important;
    bottom: 0 !important;
    background: #ffffff !important;
    border-top: 1px solid #e2e8f0 !important;
  }

  .modal-content.dark-mode .form-actions {
    background: #1e293b !important;
    border-top-color: #334155 !important;
  }

  .btn-cancel,
  .btn-submit {
    padding: 14px 16px !important;
    font-size: 15px !important;
    border-radius: 14px !important;
    min-height: 48px !important;
  }

  .btn-cancel {
    flex: 1 !important;
  }

  .btn-submit {
    flex: 2 !important;
  }

  /* ===== LOADING SPINNER ===== */
  .loading-spinner {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== PROGRESS BAR ===== */
  .upload-progress {
    padding: 10px 14px !important;
    border-radius: 12px !important;
  }

  .progress-bar {
    height: 5px !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 400px) ----- */
@media (max-width: 400px) {
  .modal-header {
    padding: 12px 14px !important;
    min-height: 54px !important;
  }

  .header-left h3 {
    font-size: 16px !important;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .category-image-wrapper {
    height: 75px !important;
  }

  .category-name {
    font-size: 12px !important;
  }

  .subcategories-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 6px !important;
  }

  .subcategory-image-wrapper {
    height: 60px !important;
  }

  .color-palette {
    grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)) !important;
  }

  .btn-cancel,
  .btn-submit {
    padding: 12px !important;
    font-size: 14px !important;
    min-height: 44px !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .modal-content {
    height: -webkit-fill-available !important;
  }

  .form-actions {
    padding-bottom: calc(14px + 34px) !important;
  }

  .modal-header {
    padding-top: calc(16px + env(safe-area-inset-top, 0px)) !important;
  }
}

/* ===== OPTIMISATION TACTILE ===== */
@media (hover: none) and (pointer: coarse) {
  .category-card,
  .subcategory-card,
  .color-swatch,
  .image-preview {
    cursor: pointer !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .category-card:active,
  .subcategory-card:active {
    transform: scale(0.97) !important;
  }

  .btn-cancel:active,
  .btn-submit:active {
    transform: scale(0.96) !important;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 16px !important; /* Empêche le zoom iOS */
  }
}

/* ===== SCROLLBAR MOBILE ===== */
@media (max-width: 768px) {
  .modal-content::-webkit-scrollbar {
    width: 3px !important;
  }

  .modal-content::-webkit-scrollbar-track {
    background: transparent !important;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: #cbd5e1 !important;
    border-radius: 3px !important;
  }

  .modal-content.dark-mode::-webkit-scrollbar-thumb {
    background: #334155 !important;
  }

  .color-palette::-webkit-scrollbar {
    width: 2px !important;
  }

  .color-palette::-webkit-scrollbar-thumb {
    background: #cbd5e1 !important;
    border-radius: 2px !important;
  }
}
</style>
