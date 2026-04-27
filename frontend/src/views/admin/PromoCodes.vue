<!-- frontend/src/views/admin/PromoCodes.vue -->
<template>
  <div class="admin-promo-page" :class="{ 'dark-mode': isDarkMode }">
    <header class="page-header">
      <h1 class="page-title">إدارة أكواد الخصم</h1>
      <p class="page-subtitle">إنشاء وإدارة أكواد الخصم للمنتجات والمتاجر</p>
    </header>

    <div class="page-content">
      <!-- Formulaire d'ajout -->
      <div class="add-section">
        <div class="section-header">
          <h3 class="section-title">إضافة كود خصم جديد</h3>
          <button class="toggle-form-btn" @click="showAddForm = !showAddForm">
            <span>{{ showAddForm ? '−' : '+' }}</span>
          </button>
        </div>

        <transition name="slide-down">
          <form v-if="showAddForm" @submit.prevent="createPromo" class="promo-form">
            <div class="form-grid">
              <!-- Code -->
              <div class="form-group">
                <label>الكود <span class="required">*</span></label>
                <input v-model="form.code" type="text" placeholder="مثال: WELCOME10" required />
              </div>

              <!-- Type -->
              <div class="form-group">
                <label>نوع الخصم <span class="required">*</span></label>
                <select v-model="form.type" required>
                  <option value="percent">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (د.ت)</option>
                </select>
              </div>

              <!-- Valeur -->
              <div class="form-group">
                <label>القيمة <span class="required">*</span></label>
                <input v-model.number="form.value" type="number" step="0.01" min="0" required />
              </div>

              <!-- Description -->
              <div class="form-group">
                <label>الوصف</label>
                <input v-model="form.description" type="text" placeholder="خصم على المنتج" />
              </div>

              <!-- Sélection du vendeur -->
              <div class="form-group full-width">
                <label>البائع (اختياري - للكود الخاص بمتجر)</label>
                <select v-model="selectedVendorId" @change="onVendorSelect">
                  <option value="">كل المتاجر (كود عام)</option>
                  <option v-for="vendor in vendorsList" :key="vendor.id" :value="vendor.id">
                    {{ vendor.shopName }} ({{ vendor.products_count }} منتج)
                  </option>
                </select>
              </div>

              <!-- Sélection du produit -->
              <div class="form-group full-width" v-if="selectedVendorId">
                <label>المنتج (اختياري - للكود الخاص بمنتج محدد)</label>
                <select v-model="form.product_id" @change="onProductSelect" :disabled="loadingProducts">
                  <option value="">كل منتجات هذا المتجر</option>
                  <option v-for="product in vendorProducts" :key="product.id" :value="product.id">
                    {{ product.name }} - {{ formatPrice(product.price) }} د.ت
                  </option>
                </select>
                <small v-if="form.product_id" class="hint success">
                  الكود سيكون صالحاً فقط على هذا المنتج
                </small>
              </div>

              <!-- Aperçu du produit sélectionné -->
              <div v-if="selectedProduct" class="selected-product-preview full-width">
                <img :src="getProductImage(selectedProduct)" :alt="selectedProduct.name" />
                <div class="product-info">
                  <span class="product-name">{{ selectedProduct.name }}</span>
                  <span class="product-price">{{ formatPrice(selectedProduct.price) }} د.ت</span>
                  <span class="product-vendor">{{ selectedVendorName }}</span>
                </div>
                <button type="button" class="clear-product" @click="clearSelectedProduct">×</button>
              </div>

              <!-- Options supplémentaires -->
              <div class="form-group">
                <label>الحد الأدنى للطلب</label>
                <input v-model.number="form.min_order" type="number" step="0.01" min="0" placeholder="0" />
              </div>

              <div class="form-group">
                <label>الحد الأقصى للخصم</label>
                <input v-model.number="form.max_discount" type="number" step="0.01" min="0" placeholder="غير محدود" />
              </div>

              <div class="form-group">
                <label>عدد مرات الاستخدام</label>
                <input v-model.number="form.max_uses" type="number" min="1" placeholder="غير محدود" />
              </div>

              <div class="form-group">
                <label>تاريخ البداية</label>
                <input v-model="form.valid_from" type="datetime-local" />
              </div>

              <div class="form-group">
                <label>تاريخ النهاية</label>
                <input v-model="form.valid_until" type="datetime-local" />
              </div>

              <div class="form-group checkbox-group">
                <label>
                  <input v-model="form.highlighted" type="checkbox" />
                  <span>كود مميز</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetForm">إعادة تعيين</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'جاري الإضافة...' : 'إضافة الكود' }}
              </button>
            </div>
          </form>
        </transition>
      </div>

      <!-- Liste des codes -->
      <div class="list-section">
        <div class="section-header">
          <h3 class="section-title">الأكواد النشطة</h3>
          <button class="refresh-btn" @click="loadPromoCodes" :disabled="loadingList">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke-width="2"/>
            </svg>
            <span>تحديث</span>
          </button>
        </div>

        <div v-if="loadingList" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الأكواد...</p>
        </div>

        <div v-else-if="promoCodes.length === 0" class="empty-state">
          <span>🎯</span>
          <p>لا توجد أكواد خصم حالياً</p>
          <button class="btn-outline" @click="showAddForm = true">إضافة أول كود</button>
        </div>

        <div v-else class="promo-table-wrapper">
          <table class="promo-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>النوع</th>
                <th>القيمة</th>
                <th>البائع / المنتج</th>
                <th>الاستخدام</th>
                <th>الحالة</th>
                <th>صلاحية</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="promo in promoCodes" :key="promo.id" :class="{ inactive: !promo.is_active, highlighted: promo.highlighted }">
                <td class="code-cell">
                  <span class="code">{{ promo.code }}</span>
                  <span v-if="promo.highlighted" class="highlight-badge">★</span>
                </td>
                <td>{{ promo.type === 'percent' ? 'نسبة %' : 'مبلغ ثابت' }}</td>
                <td>{{ promo.type === 'percent' ? promo.value + '%' : promo.value + ' د.ت' }}</td>
                <td>
                  <div class="scope-info">
                    <span v-if="promo.scope === 'global'" class="scope-badge global">عام</span>
                    <span v-else-if="promo.vendor_name" class="scope-badge vendor">
                      {{ promo.vendor_name }}
                    </span>
                    <span v-if="promo.product_name" class="product-name-display">
                      ← {{ promo.product_name }}
                    </span>
                  </div>
                </td>
                <td>{{ promo.used_count || 0 }} / {{ promo.max_uses || '∞' }}</td>
                <td>
                  <span class="status-badge" :class="{ active: promo.is_active }">
                    <span class="status-dot"></span>
                    {{ promo.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td>
                  <span v-if="promo.valid_until" :class="{ expired: isExpired(promo.valid_until) }">
                    {{ formatDate(promo.valid_until) }}
                  </span>
                  <span v-else>دائم</span>
                </td>
                <td class="actions-cell">
                  <button class="icon-btn edit" @click="editPromo(promo)" title="تعديل">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke-width="1.5"/>
                    </svg>
                  </button>
                  <button class="icon-btn toggle" @click="togglePromo(promo)" :title="promo.is_active ? 'تعطيل' : 'تفعيل'">
                    <svg v-if="promo.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke-width="1.5"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke-width="1.5"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      <path d="M12 8v6" stroke-width="1.5"/>
                    </svg>
                  </button>
                  <button class="icon-btn delete" @click="deletePromo(promo)" title="حذف">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke-width="1.5"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تعديل كود الخصم</h3>
            <button class="modal-close" @click="closeEditModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6L18 18" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePromo">
              <div class="form-group">
                <label>الكود</label>
                <input v-model="editForm.code" type="text" required />
              </div>
              <div class="form-group">
                <label>نوع الخصم</label>
                <select v-model="editForm.type" required>
                  <option value="percent">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (د.ت)</option>
                </select>
              </div>
              <div class="form-group">
                <label>القيمة</label>
                <input v-model.number="editForm.value" type="number" step="0.01" min="0" required />
              </div>
              <div class="form-group">
                <label>الوصف</label>
                <input v-model="editForm.description" type="text" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>الحد الأدنى</label>
                  <input v-model.number="editForm.min_order" type="number" step="0.01" min="0" />
                </div>
                <div class="form-group">
                  <label>الحد الأقصى</label>
                  <input v-model.number="editForm.max_discount" type="number" step="0.01" min="0" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>عدد الاستخدامات</label>
                  <input v-model.number="editForm.max_uses" type="number" min="1" />
                </div>
                <div class="form-group checkbox-group">
                  <label>
                    <input v-model="editForm.highlighted" type="checkbox" />
                    <span>كود مميز</span>
                  </label>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ البداية</label>
                  <input v-model="editForm.valid_from" type="datetime-local" />
                </div>
                <div class="form-group">
                  <label>تاريخ النهاية</label>
                  <input v-model="editForm.valid_until" type="datetime-local" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="closeEditModal">إلغاء</button>
                <button type="submit" class="btn-save" :disabled="saving">
                  {{ saving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de confirmation de suppression -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-container confirm-modal" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تأكيد الحذف</h3>
            <button class="modal-close" @click="showDeleteModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6L18 18" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>هل أنت متأكد من حذف الكود:</p>
            <p class="delete-code">{{ promoToDelete?.code }}</p>
            <p class="warning-text">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">إلغاء</button>
            <button class="btn-delete" @click="confirmDelete" :disabled="deleting">
              {{ deleting ? 'جاري الحذف...' : 'حذف' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(false)
const loadingList = ref(false)
const loadingProducts = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showAddForm = ref(true)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const promoCodes = ref([])
const vendorsList = ref([])
const vendorProducts = ref([])
const selectedVendorId = ref('')
const promoToDelete = ref(null)

const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✓'
})

// Form
const form = ref({
  code: '',
  type: 'percent',
  value: 10,
  description: '',
  min_order: 0,
  max_discount: null,
  max_uses: null,
  valid_from: '',
  valid_until: '',
  highlighted: false,
  product_id: null,
  vendor_id: null
})

const editForm = ref({
  id: null,
  code: '',
  type: 'percent',
  value: 10,
  description: '',
  min_order: 0,
  max_discount: null,
  max_uses: null,
  valid_from: '',
  valid_until: '',
  highlighted: false
})

// Computed
const selectedProduct = computed(() => {
  if (!form.value.product_id) return null
  return vendorProducts.value.find(p => p.id === form.value.product_id)
})

const selectedVendorName = computed(() => {
  if (!selectedVendorId.value) return ''
  const vendor = vendorsList.value.find(v => v.id === selectedVendorId.value)
  return vendor?.shopName || ''
})

// Methods
const showNotification = (message, type = 'success') => {
  const icons = { success: '✓', error: '✗', info: 'i', warning: '!' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', { month: 'short', day: 'numeric', year: 'numeric' })
}

const isExpired = (dateStr) => {
  return new Date(dateStr) < new Date()
}

const getProductImage = (product) => {
  if (!product) return ''
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0]
  }
  return 'https://placehold.co/60x60/08717f/white?text=منتج'
}

const resetForm = () => {
  form.value = {
    code: '',
    type: 'percent',
    value: 10,
    description: '',
    min_order: 0,
    max_discount: null,
    max_uses: null,
    valid_from: '',
    valid_until: '',
    highlighted: false,
    product_id: null,
    vendor_id: null
  }
  selectedVendorId.value = ''
  vendorProducts.value = []
}

const clearSelectedProduct = () => {
  form.value.product_id = null
}

const onVendorSelect = async () => {
  form.value.vendor_id = selectedVendorId.value || null
  form.value.product_id = null
  vendorProducts.value = []

  if (selectedVendorId.value) {
    await loadVendorProducts(selectedVendorId.value)
  }
}

const onProductSelect = () => {
  // Le produit est déjà lié via v-model
}

const loadVendors = async () => {
  try {
    const response = await api.get('/admin/promo/vendors')
    if (response.data.success) {
      vendorsList.value = response.data.data || []
    }
  } catch (error) {
    console.error('Erreur chargement vendeurs:', error)
  }
}

const loadVendorProducts = async (vendorId) => {
  loadingProducts.value = true
  try {
    const response = await api.get(`/admin/promo/vendors/${vendorId}/products`)
    if (response.data.success) {
      vendorProducts.value = response.data.data || []
    }
  } catch (error) {
    console.error('Erreur chargement produits:', error)
    vendorProducts.value = []
  } finally {
    loadingProducts.value = false
  }
}

const loadPromoCodes = async () => {
  loadingList.value = true
  try {
    const response = await api.get('/admin/promo')
    if (response.data.success) {
      promoCodes.value = response.data.data || []
    }
  } catch (error) {
    console.error('Erreur chargement promos:', error)
    showNotification('فشل تحميل الأكواد', 'error')
  } finally {
    loadingList.value = false
  }
}

const createPromo = async () => {
  if (!form.value.code || !form.value.value) {
    showNotification('الرجاء ملء الحقول المطلوبة', 'warning')
    return
  }

  loading.value = true
  try {
    const response = await api.post('/admin/promo', {
      ...form.value,
      code: form.value.code.toUpperCase(),
      vendor_id: selectedVendorId.value || null
    })
    if (response.data.success) {
      showNotification('تم إنشاء الكود بنجاح')
      promoCodes.value.unshift(response.data.data)
      resetForm()
      showAddForm.value = false
    }
  } catch (error) {
    console.error('Erreur création:', error)
    showNotification(error.response?.data?.message || 'فشل إنشاء الكود', 'error')
  } finally {
    loading.value = false
  }
}

const editPromo = (promo) => {
  editForm.value = {
    id: promo.id,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    description: promo.description || '',
    min_order: promo.min_order || 0,
    max_discount: promo.max_discount || null,
    max_uses: promo.max_uses || null,
    valid_from: promo.valid_from ? promo.valid_from.slice(0, 16) : '',
    valid_until: promo.valid_until ? promo.valid_until.slice(0, 16) : '',
    highlighted: promo.highlighted || false
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updatePromo = async () => {
  if (!editForm.value.code || !editForm.value.value) {
    showNotification('الرجاء ملء الحقول المطلوبة', 'warning')
    return
  }

  saving.value = true
  try {
    const response = await api.put(`/admin/promo/${editForm.value.id}`, {
      ...editForm.value,
      code: editForm.value.code.toUpperCase()
    })
    if (response.data.success) {
      const index = promoCodes.value.findIndex(p => p.id === editForm.value.id)
      if (index !== -1) {
        promoCodes.value[index] = response.data.data
      }
      showNotification('تم تحديث الكود بنجاح')
      closeEditModal()
    }
  } catch (error) {
    console.error('Erreur mise à jour:', error)
    showNotification(error.response?.data?.message || 'فشل تحديث الكود', 'error')
  } finally {
    saving.value = false
  }
}

const togglePromo = async (promo) => {
  try {
    const response = await api.patch(`/admin/promo/${promo.id}/toggle`)
    if (response.data.success) {
      promo.is_active = !promo.is_active
      showNotification(response.data.message)
    }
  } catch (error) {
    showNotification('فشل تحديث الحالة', 'error')
  }
}

const deletePromo = (promo) => {
  promoToDelete.value = promo
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!promoToDelete.value) return

  deleting.value = true
  try {
    await api.delete(`/admin/promo/${promoToDelete.value.id}`)
    promoCodes.value = promoCodes.value.filter(p => p.id !== promoToDelete.value.id)
    showNotification('تم حذف الكود بنجاح')
    showDeleteModal.value = false
    promoToDelete.value = null
  } catch (error) {
    showNotification('فشل حذف الكود', 'error')
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadPromoCodes()
  loadVendors()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.admin-promo-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', sans-serif;
  transition: all 0.3s ease;
}

.admin-promo-page.dark-mode {
  background: #0f172a;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.dark-mode .page-subtitle {
  color: #94a3b8;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Add Section */
.add-section,
.list-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-mode .add-section,
.dark-mode .list-section {
  background: #1e293b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .section-title {
  color: #f1f5f9;
}

.toggle-form-btn {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.dark-mode .toggle-form-btn {
  background: #334155;
  color: #f1f5f9;
}

.toggle-form-btn:hover {
  background: #08717f;
  color: white;
}

/* Form */
.promo-form {
  margin-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
}

.dark-mode .form-group label {
  color: #cbd5e1;
}

.required {
  color: #d40025;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.3s ease;
}

.dark-mode .form-group input,
.dark-mode .form-group select {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #08717f;
}

.hint {
  font-size: 0.7rem;
  color: #64748b;
}

.hint.success {
  color: #10b981;
}

/* Selected Product Preview */
.selected-product-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 16px;
}

.dark-mode .selected-product-preview {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.selected-product-preview img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
}

.selected-product-preview .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-product-preview .product-name {
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .selected-product-preview .product-name {
  color: #f1f5f9;
}

.selected-product-preview .product-price {
  font-weight: 600;
  color: #d40025;
}

.selected-product-preview .product-vendor {
  font-size: 0.75rem;
  color: #64748b;
}

.clear-product {
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border: none;
  border-radius: 50%;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-product:hover {
  background: #dc2626;
  color: white;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  padding: 12px 24px;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.dark-mode .btn-secondary {
  background: #334155;
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-outline {
  background: transparent;
  border: 2px solid #08717f;
  color: #08717f;
}

.btn-outline:hover {
  background: #08717f;
  color: white;
}

/* List Section */
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .refresh-btn {
  background: #334155;
  color: #cbd5e1;
}

.refresh-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty-state span {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 16px;
}

/* Table */
.promo-table-wrapper {
  overflow-x: auto;
}

.promo-table {
  width: 100%;
  border-collapse: collapse;
}

.promo-table th,
.promo-table td {
  padding: 14px 12px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .promo-table th,
.dark-mode .promo-table td {
  border-bottom-color: #334155;
}

.promo-table th {
  font-weight: 600;
  color: #64748b;
  font-size: 0.8rem;
  white-space: nowrap;
}

.promo-table tr.inactive {
  opacity: 0.5;
}

.promo-table tr.highlighted {
  background: #fef3c7;
}

.dark-mode .promo-table tr.highlighted {
  background: rgba(245, 158, 11, 0.15);
}

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 700;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
}

.dark-mode .code {
  background: #334155;
  color: #fbbf24;
}

.highlight-badge {
  color: #f59e0b;
  font-size: 1rem;
}

.scope-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scope-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  width: fit-content;
}

.scope-badge.global {
  background: #dbeafe;
  color: #1d4ed8;
}

.scope-badge.vendor {
  background: #fef3c7;
  color: #b45309;
}

.product-name-display {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.expired {
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #475569;
}

.dark-mode .icon-btn {
  background: #334155;
  color: #cbd5e1;
}

.icon-btn.edit:hover {
  background: #08717f;
  color: white;
}

.icon-btn.toggle:hover {
  background: #f59e0b;
  color: white;
}

.icon-btn.delete:hover {
  background: #ef4444;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

.modal-container.dark-mode {
  background: #1e293b;
}

.confirm-modal {
  max-width: 400px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #1e293b;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.modal-close {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #64748b;
}

.dark-mode .modal-close {
  background: #334155;
  color: #cbd5e1;
}

.modal-close:hover {
  background: #ef4444;
  color: white;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel,
.btn-save,
.btn-delete {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
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

.btn-save {
  background: linear-gradient(135deg, #08717f, #065a69);
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

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #dc2626;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-code {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ef4444;
  text-align: center;
  padding: 12px;
  background: #fef2f2;
  border-radius: 10px;
  margin: 12px 0;
}

.warning-text {
  color: #64748b;
  font-size: 0.8rem;
  text-align: center;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.warning { border-right-color: #f59e0b; }
.toast-notification.info { border-right-color: #08717f; }

.dark-mode .toast-notification {
  background: #1e293b;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 500;
}

.dark-mode .toast-message {
  color: #f1f5f9;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: progress 3s linear forwards;
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
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

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-promo-page {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .promo-table th,
  .promo-table td {
    padding: 10px 8px;
    font-size: 0.8rem;
  }

  .actions-cell {
    flex-wrap: wrap;
  }

  .modal-container {
    width: 95%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>
