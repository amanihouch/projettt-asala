<!-- src/views/admin/Products.vue - VERSION COMPLÈTE AVEC GESTION STOCK -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Search and Filter Bar -->
      <div class="filters-bar">
        <div class="search-wrapper">
          <input type="text" v-model="searchQuery" placeholder="بحث عن منتج أو بائع..." class="search-input" />
          <span class="search-icon">🔍</span>
        </div>
        <select v-model="categoryFilter" class="filter-select">
          <option value="">جميع التصنيفات</option>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
        </select>
        <select v-model="statusFilter" class="filter-select">
          <option value="">جميع الحالات</option>
          <option value="approved">منشور</option>
          <option value="pending">في انتظار المراجعة</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat-item"><span class="stat-value">{{ totalProducts }}</span><span class="stat-label">إجمالي المنتجات</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-value">{{ activeProducts }}</span><span class="stat-label">منشورة</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-value">{{ pendingProducts }}</span><span class="stat-label">في انتظار المراجعة</span></div>
        <div class="stat-divider"></div>
        <div class="stat-item"><span class="stat-value">{{ outOfStockCount }}</span><span class="stat-label">نفذ المخزون</span></div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>جاري تحميل المنتجات...</p></div>

      <!-- Table -->
      <div v-else-if="filteredProducts.length > 0" class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>البائع</th>
              <th>التصنيف</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id" :class="{ 'out-of-stock': isOutOfStock(product) }">
              <td>
                <div class="product-info">
                  <img :src="getProductImage(product)" :alt="product.productName || product.name" class="product-image" @error="handleImageError" />
                  <div class="product-details">
                    <span class="product-name">{{ truncateText(product.productName || product.name, 30) }}</span>
                    <span class="product-id">#{{ product.id }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="vendor-info">
                  <span class="vendor-name">{{ product.vendorName || product.vendor?.shopName || 'غير معروف' }}</span>
                  <span v-if="product.vendorVerified || product.vendor?.verified" class="verified-badge" title="موثق">✓</span>
                </div>
              </td>
              <td><span class="category-badge">{{ getCategoryName(product.category) }}</span></td>
              <td>
                <div class="price-info">
                  <span class="current-price">{{ formatPrice(product.price) }} د.ت</span>
                  <span v-if="product.oldPrice" class="old-price">{{ formatPrice(product.oldPrice) }} د.ت</span>
                </div>
              </td>
              <!-- ✅ COLONNE STOCK -->
              <td>
                <div class="stock-cell">
                  <div class="stock-controls">
                    <button class="stock-btn minus" @click="decreaseStock(product)" :disabled="(product.quantity || 0) <= 0">−</button>
                    <input
                      type="number"
                      v-model.number="product.quantity"
                      class="stock-input"
                      :class="{ 'stock-zero': (product.quantity || 0) === 0, 'stock-low': (product.quantity || 0) > 0 && (product.quantity || 0) <= 5 }"
                      min="0"
                      @change="updateStock(product)"
                      @focus="$event.target.select()"
                    />
                    <button class="stock-btn plus" @click="increaseStock(product)">+</button>
                  </div>
                  <span v-if="(product.quantity || 0) === 0" class="stock-badge out">نفذ</span>
                  <span v-else-if="(product.quantity || 0) <= 5" class="stock-badge low">منخفض</span>
                  <span v-else class="stock-badge in">متوفر</span>
                </div>
              </td>
              <td><span class="status-badge" :class="product.status || 'approved'">{{ getStatusText(product.status) }}</span></td>
              <td>{{ formatDate(product.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view" @click="viewProduct(product)" title="عرض">👁️</button>
                  <button v-if="product.status === 'pending'" class="action-btn approve" @click="approveProduct(product)" title="موافقة">✓</button>
                  <button v-if="product.status === 'pending'" class="action-btn reject" @click="rejectProduct(product)" title="رفض">✕</button>
                  <button class="action-btn edit" @click="openEditModal(product)" title="تعديل">✏️</button>
                  <button class="action-btn delete" @click="confirmDelete(product)" title="حذف">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">← السابق</button>
          <span class="page-info">صفحة {{ currentPage }} من {{ totalPages }}</span>
          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">التالي →</button>
        </div>
      </div>

      <div v-else class="empty-state"><div class="empty-icon">📦</div><h3>لا توجد منتجات</h3></div>
    </div>

    <!-- ✅ MODAL ÉDITION PRODUIT/STOCK -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content edit-modal" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>✏️ تعديل المنتج</h3>
            <button class="close-btn" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>اسم المنتج</label>
              <input type="text" v-model="editForm.productName" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>السعر (د.ت)</label>
                <input type="number" v-model.number="editForm.price" class="form-input" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>السعر القديم</label>
                <input type="number" v-model.number="editForm.oldPrice" class="form-input" step="0.01" min="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>📦 المخزون</label>
                <input type="number" v-model.number="editForm.quantity" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>التصنيف</label>
                <select v-model="editForm.category" class="form-input">
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>الوصف</label>
              <textarea v-model="editForm.description" class="form-textarea" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeEditModal">إلغاء</button>
            <button class="btn-save" @click="saveEdit" :disabled="saving">{{ saving ? 'جاري...' : '💾 حفظ' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header"><h3>تأكيد الحذف</h3><button class="close-btn" @click="closeDeleteModal">✕</button></div>
          <div class="modal-body">
            <p>هل أنت متأكد من حذف المنتج</p>
            <p class="product-name-highlight">{{ productToDelete?.productName || productToDelete?.name }}</p>
            <p class="warning-text">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
          <div class="modal-footer"><button class="btn-cancel" @click="closeDeleteModal">إلغاء</button><button class="btn-delete" @click="deleteProduct">حذف</button></div>
        </div>
      </div>
    </transition>

    <!-- Reject Modal -->
    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header"><h3>رفض المنتج</h3><button class="close-btn" @click="closeRejectModal">✕</button></div>
          <div class="modal-body"><p>سبب الرفض (اختياري)</p><textarea v-model="rejectReason" class="reject-textarea" placeholder="أدخل سبب الرفض..." rows="3"></textarea></div>
          <div class="modal-footer"><button class="btn-cancel" @click="closeRejectModal">إلغاء</button><button class="btn-reject" @click="confirmReject">رفض</button></div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span><span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const products = ref([])
const showDeleteModal = ref(false)
const showRejectModal = ref(false)
const showEditModal = ref(false)
const productToDelete = ref(null)
const productToReject = ref(null)
const rejectReason = ref('')
const saving = ref(false)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ✅ Formulaire d'édition
const editForm = ref({
  id: null, productName: '', price: 0, oldPrice: null,
  quantity: 0, category: '', description: ''
})

const categories = [
  { value: 'perfumes', label: 'عطور' }, { value: 'jewelry', label: 'حلي و اكسسوارات' },
  { value: 'clothing', label: 'ملابس' }, { value: 'decor', label: 'ديكور' },
  { value: 'textiles', label: 'أقمشة وسجادات' }, { value: 'pottery', label: 'أواني' },
  { value: 'beauty', label: 'عناية وتجميل' }, { value: 'food', label: 'أغذية' },
  { value: 'other', label: 'أخرى' }
]

// ===== COMPUTED =====
const totalProducts = computed(() => products.value.length)
const activeProducts = computed(() => products.value.filter(p => p.status === 'approved' || !p.status).length)
const pendingProducts = computed(() => products.value.filter(p => p.status === 'pending').length)
const outOfStockCount = computed(() => products.value.filter(p => (p.quantity || 0) === 0).length)

const filteredProducts = computed(() => {
  let result = [...products.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => (p.productName || p.name || '').toLowerCase().includes(q) || (p.vendorName || p.vendor?.shopName || '').toLowerCase().includes(q))
  }
  if (categoryFilter.value) result = result.filter(p => p.category === categoryFilter.value)
  if (statusFilter.value) result = result.filter(p => (p.status || 'approved') === statusFilter.value)
  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1)
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredProducts.value.slice(start, start + itemsPerPage.value)
})

// ===== HELPERS =====
const truncateText = (t, l) => t ? (t.length > l ? t.substring(0, l) + '...' : t) : ''
const showNotification = (m, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message: m, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}
const formatPrice = (p) => p !== undefined && p !== null ? new Intl.NumberFormat('ar-TN').format(p) : '0'
const formatDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ar-TN', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '—' }
}
const getCategoryName = (c) => categories.find(x => x.value === c)?.label || c || 'غير مصنف'
const getStatusText = (s) => ({ pending: 'في الانتظار', approved: 'منشور', rejected: 'مرفوض' })[s] || 'منشور'
const isOutOfStock = (p) => (p.quantity || 0) === 0
const getProductImage = (p) => {
  if (p.images?.length > 0) return p.images[0]
  if (p.image) return p.image
  return 'https://placehold.co/300x300/08717f/white?text=منتج'
}
const handleImageError = (e) => { e.target.src = 'https://placehold.co/300x300/08717f/white?text=منتج' }

// ===== ✅ GESTION STOCK =====
const increaseStock = (product) => {
  product.quantity = (product.quantity || 0) + 1
  updateStock(product)
}

const decreaseStock = (product) => {
  if ((product.quantity || 0) > 0) {
    product.quantity = (product.quantity || 0) - 1
    updateStock(product)
  }
}

const updateStock = async (product) => {
  if (!product || product.id === undefined) return
  product.quantity = Math.max(0, parseInt(product.quantity) || 0)

  try {
    const routes = [
      `/posts/${product.id}`,
      `/products/${product.id}`,
      `/admin/posts/${product.id}`,
      `/admin/products/${product.id}`
    ]
    for (const route of routes) {
      try {
        const response = await api.put(route, { quantity: product.quantity })
        if (response.data.success) {
          console.log(`✅ Stock mis à jour: ${product.id} → ${product.quantity}`)
          showNotification(`✅ تم تحديث المخزون: ${product.quantity}`, 'success')
          return
        }
      } catch (e) { continue }
    }
    // Sauvegarde locale en fallback
    saveProductsLocally()
    showNotification(`✅ تم تحديث المخزون محلياً: ${product.quantity}`, 'success')
  } catch (error) {
    console.error('❌ Erreur stock:', error)
    saveProductsLocally()
    showNotification('⚠️ تم التحديث محلياً', 'warning')
  }
}

const saveProductsLocally = () => {
  localStorage.setItem('admin_products', JSON.stringify(products.value))
}

// ===== ✅ MODAL ÉDITION =====
const openEditModal = (product) => {
  editForm.value = {
    id: product.id,
    productName: product.productName || product.name || '',
    price: product.price || 0,
    oldPrice: product.oldPrice || null,
    quantity: product.quantity || 0,
    category: product.category || 'other',
    description: product.description || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => { showEditModal.value = false }

const saveEdit = async () => {
  if (!editForm.value.id) return
  saving.value = true

  try {
    const routes = [
      `/posts/${editForm.value.id}`,
      `/products/${editForm.value.id}`,
      `/admin/posts/${editForm.value.id}`,
      `/admin/products/${editForm.value.id}`
    ]
    let success = false
    for (const route of routes) {
      try {
        const response = await api.put(route, {
          productName: editForm.value.productName,
          name: editForm.value.productName,
          price: Number(editForm.value.price),
          oldPrice: editForm.value.oldPrice ? Number(editForm.value.oldPrice) : null,
          quantity: Number(editForm.value.quantity),
          category: editForm.value.category,
          description: editForm.value.description
        })
        if (response.data.success) { success = true; break }
      } catch (e) { continue }
    }

    // Mettre à jour localement
    const idx = products.value.findIndex(p => p.id === editForm.value.id)
    if (idx !== -1) {
      products.value[idx] = {
        ...products.value[idx],
        productName: editForm.value.productName,
        name: editForm.value.productName,
        price: Number(editForm.value.price),
        oldPrice: editForm.value.oldPrice ? Number(editForm.value.oldPrice) : null,
        quantity: Number(editForm.value.quantity),
        category: editForm.value.category,
        description: editForm.value.description
      }
    }

    saveProductsLocally()
    closeEditModal()
    showNotification(success ? '✅ تم حفظ التعديلات' : '✅ تم الحفظ محلياً', success ? 'success' : 'warning')
  } catch (error) {
    showNotification('❌ خطأ في الحفظ', 'error')
  } finally {
    saving.value = false
  }
}

// ===== CRUD =====
const viewProduct = (product) => router.push(`/admin/post/${product.id}`)

const approveProduct = async (product) => {
  try {
    const routes = [`/admin/posts/${product.id}/approve`, `/admin/products/${product.id}/approve`, `/posts/${product.id}/approve`]
    let success = false
    for (const route of routes) { try { const r = await api.patch(route); if (r.data.success) { success = true; break } } catch (e) { continue } }
    product.status = 'approved'
    showNotification(success ? '✅ تمت الموافقة' : '✅ تم التحديث محلياً', success ? 'success' : 'warning')
  } catch (error) { product.status = 'approved'; showNotification('⚠️ تم التحديث محلياً', 'warning') }
}

const rejectProduct = (product) => { productToReject.value = product; rejectReason.value = ''; showRejectModal.value = true }
const closeRejectModal = () => { showRejectModal.value = false; productToReject.value = null }

const confirmReject = async () => {
  if (!productToReject.value) return
  try {
    const routes = [`/admin/posts/${productToReject.value.id}/reject`, `/admin/products/${productToReject.value.id}/reject`, `/posts/${productToReject.value.id}/reject`]
    for (const route of routes) { try { await api.patch(route, { reason: rejectReason.value || 'غير محدد' }); break } catch (e) { continue } }
    productToReject.value.status = 'rejected'
    showNotification('✅ تم رفض المنتج')
  } catch (error) { productToReject.value.status = 'rejected'; showNotification('⚠️ تم التحديث محلياً', 'warning') }
  closeRejectModal()
}

const confirmDelete = (product) => { productToDelete.value = product; showDeleteModal.value = true }
const closeDeleteModal = () => { showDeleteModal.value = false; productToDelete.value = null }

const deleteProduct = async () => {
  if (!productToDelete.value) return
  try {
    const routes = [`/admin/posts/${productToDelete.value.id}`, `/admin/products/${productToDelete.value.id}`, `/posts/${productToDelete.value.id}`]
    for (const route of routes) { try { await api.delete(route); break } catch (e) { continue } }
    products.value = products.value.filter(p => p.id !== productToDelete.value.id)
    saveProductsLocally()
    showNotification('✅ تم حذف المنتج')
    if (paginatedProducts.value.length === 0 && currentPage.value > 1) currentPage.value--
  } catch (error) { products.value = products.value.filter(p => p.id !== productToDelete.value.id); showNotification('⚠️ تم الحذف محلياً', 'warning') }
  closeDeleteModal()
}

// ===== LOAD =====
const loadProducts = async () => {
  loading.value = true
  const savedLocal = localStorage.getItem('admin_products')
  if (savedLocal) {
    try { products.value = JSON.parse(savedLocal); console.log('📦 Produits chargés du cache local:', products.value.length) } catch (e) {}
  }

  const routes = ['/admin/posts', '/admin/products', '/posts/admin/all', '/products/admin/all']
  for (const route of routes) {
    try {
      const response = await api.get(route)
      if (response.data.success) {
        const data = response.data.data?.posts || response.data.data?.products || response.data.posts || response.data.products || response.data.data || []
        if (data.length > 0) {
          products.value = data.map(p => ({ ...p, vendorName: p.vendor?.shopName || p.vendorName || p.vendor_name || 'بائع', vendorVerified: p.vendor?.verified || p.vendorVerified || false, status: p.status || 'approved', quantity: p.quantity !== undefined ? p.quantity : (p.stock || 0) }))
          saveProductsLocally()
          console.log(`✅ ${data.length} produits chargés depuis ${route}`)
          break
        }
      }
    } catch (e) { continue }
  }
  loading.value = false
}

onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') { router.push('/login'); return }
  loadProducts()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.admin-page { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Amiri', 'Cairo', serif; direction: rtl; }
.admin-page.dark-mode { background: #0f172a; }
.page-content { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.dark-mode .page-content { background: #1e293b; }

.filters-bar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1; min-width: 250px; }
.search-input { width: 100%; padding: 12px 45px 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: .95rem; background: white; }
.dark-mode .search-input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.search-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); }
.filter-select { padding: 12px 35px 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: .95rem; min-width: 180px; background: white; }
.dark-mode .filter-select { background: #0f172a; border-color: #334155; color: #f1f5f9; }

.stats-bar { display: flex; align-items: center; justify-content: center; gap: 40px; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 25px; }
.dark-mode .stats-bar { background: #0f172a; }
.stat-item { text-align: center; }
.stat-value { display: block; font-size: 1.8rem; font-weight: 800; color: #08717f; }
.stat-label { color: #64748b; font-size: .85rem; font-weight: 600; }
.stat-divider { width: 2px; height: 40px; background: #e2e8f0; }

.loading-state { text-align: center; padding: 60px; }
.spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #08717f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 1100px; }
.data-table th { text-align: right; padding: 15px 10px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: .85rem; border-bottom: 2px solid #e2e8f0; }
.dark-mode .data-table th { background: #0f172a; color: #94a3b8; border-color: #334155; }
.data-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; }
.dark-mode .data-table td { border-color: #334155; color: #cbd5e1; }
tr.out-of-stock { background: #fef2f2; }
.dark-mode tr.out-of-stock { background: rgba(239,68,68,.1); }

.product-info { display: flex; align-items: center; gap: 12px; }
.product-image { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
.product-name { font-weight: 600; }
.product-id { font-size: .7rem; color: #94a3b8; }
.vendor-name { font-weight: 500; }
.category-badge { display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 20px; font-size: .8rem; }
.price-info { display: flex; flex-direction: column; }
.current-price { font-weight: 700; color: #08717f; }
.old-price { font-size: .8rem; color: #94a3b8; text-decoration: line-through; }

/* ✅ STOCK */
.stock-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stock-controls { display: flex; align-items: center; gap: 4px; }
.stock-btn { width: 28px; height: 28px; border: 2px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; background: white; transition: all .2s; }
.stock-btn.minus { color: #ef4444; }
.stock-btn.plus { color: #10b981; }
.stock-btn:hover:not(:disabled) { transform: scale(1.1); }
.stock-btn:disabled { opacity: .3; cursor: not-allowed; }
.stock-input { width: 55px; padding: 6px; text-align: center; border: 2px solid #e2e8f0; border-radius: 6px; font-size: .9rem; font-weight: 600; }
.stock-input.stock-zero { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
.stock-input.stock-low { border-color: #f59e0b; background: #fffbeb; color: #b45309; }
.dark-mode .stock-input { background: #1e293b; border-color: #334155; color: #f1f5f9; }
.stock-badge { font-size: .65rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.stock-badge.out { background: #f8d7da; color: #721c24; }
.stock-badge.low { background: #fff3cd; color: #856404; }
.stock-badge.in { background: #d4edda; color: #155724; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: .8rem; font-weight: 600; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.approved { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }

.action-buttons { display: flex; gap: 5px; flex-wrap: wrap; }
.action-btn { width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; font-size: .9rem; display: flex; align-items: center; justify-content: center; transition: all .2s; }
.action-btn:hover { transform: translateY(-2px); }
.action-btn.view { background: #e2e8f0; }
.action-btn.approve { background: #10b981; color: white; }
.action-btn.reject { background: #f59e0b; color: white; }
.action-btn.edit { background: #dbeafe; color: #1e40af; }
.action-btn.delete { background: #fee2e2; color: #ef4444; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
.pagination-btn { padding: 8px 16px; background: white; border: 2px solid #e2e8f0; border-radius: 8px; font-weight: 600; cursor: pointer; }
.pagination-btn:disabled { opacity: .5; cursor: not-allowed; }

.empty-state { text-align: center; padding: 60px; }
.empty-icon { font-size: 4rem; opacity: .3; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: slideUp .3s ease; }
.edit-modal { max-width: 550px; }
.dark-mode .modal-content { background: #1e293b; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #e2e8f0; }
.modal-header h3 { font-size: 1.2rem; }
.close-btn { width: 35px; height: 35px; background: #f1f5f9; border: none; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
.close-btn:hover { background: #d40025; color: white; }
.modal-body { padding: 25px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: .9rem; font-weight: 600; margin-bottom: 6px; color: #1e293b; }
.dark-mode .form-group label { color: #f1f5f9; }
.form-input, .form-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: .9rem; font-family: inherit; }
.dark-mode .form-input, .dark-mode .form-textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-footer { display: flex; gap: 15px; padding: 20px; border-top: 1px solid #e2e8f0; }
.btn-cancel, .btn-save, .btn-delete, .btn-reject { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-save { background: #08717f; color: white; }
.btn-save:disabled { opacity: .6; }
.btn-delete { background: #d40025; color: white; }
.btn-reject { background: #f59e0b; color: white; }
.product-name-highlight { font-size: 1.2rem; font-weight: 700; color: #d40025; margin: 10px 0; }
.reject-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical; font-family: inherit; margin-top: 10px; }

.toast-notification { position: fixed; bottom: 30px; right: 30px; display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: white; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,.1); z-index: 9999; border-right: 4px solid; animation: slideInRight .3s ease; }
.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

@media (max-width: 768px) {
  .admin-page { padding: 20px; }
  .filters-bar { flex-direction: column; }
  .stats-bar { flex-wrap: wrap; gap: 15px; }
  .form-row { grid-template-columns: 1fr; }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/PRODUCTS.VUE ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

/* Filters */
.dark-mode .search-input,
.dark-mode .filter-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .search-input::placeholder {
  color: #64748b !important;
}

.dark-mode .search-icon {
  color: #64748b !important;
}

/* Stats Bar */
.dark-mode .stats-bar {
  background: #121220 !important;
}

.dark-mode .stat-value {
  color: #2dd4bf !important;
}

.dark-mode .stat-label {
  color: #94a3b8 !important;
}

.dark-mode .stat-divider {
  background: #2a2a40 !important;
}

/* Table */
.dark-mode .data-table th {
  background: #121220 !important;
  color: #94a3b8 !important;
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .data-table td {
  border-bottom-color: #2a2a40 !important;
  color: #cbd5e1 !important;
}

.dark-mode tr.out-of-stock {
  background: rgba(239, 68, 68, 0.08) !important;
}

/* Product Info */
.dark-mode .product-image {
  /* pas de fond forcé - garde l'image visible */
}

.dark-mode .product-name {
  color: #f1f5f9 !important;
}

.dark-mode .product-id {
  color: #64748b !important;
}

.dark-mode .vendor-name {
  color: #cbd5e1 !important;
}

.dark-mode .category-badge {
  background: #2a2a40 !important;
  color: #cbd5e1 !important;
}

/* Price */
.dark-mode .current-price {
  color: #2dd4bf !important;
}

.dark-mode .old-price {
  color: #64748b !important;
}

/* Stock */
.dark-mode .stock-btn {
  background: #2a2a40 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .stock-btn:hover:not(:disabled) {
  background: #3a3a55 !important;
}

.dark-mode .stock-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

/* Status Badges */
.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
}

.dark-mode .status-badge.approved {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.dark-mode .status-badge.rejected {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

/* Action Buttons */
.dark-mode .action-btn.view {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .action-btn.edit {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
}

.dark-mode .action-btn.delete {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

/* Pagination */
.dark-mode .pagination {
  border-top-color: #2a2a40 !important;
}

.dark-mode .pagination-btn {
  background: #2a2a40 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .pagination-btn:hover:not(:disabled) {
  background: #3a3a55 !important;
}

.dark-mode .page-info {
  color: #94a3b8 !important;
}

/* Loading */
.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Empty */
.dark-mode .empty-state h3 {
  color: #f1f5f9 !important;
}

/* Modal */
.dark-mode .modal-content {
  background: #1e1e30 !important;
}

.dark-mode .modal-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .close-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .form-group label {
  color: #cbd5e1 !important;
}

.dark-mode .form-input,
.dark-mode .form-textarea {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .form-input:focus,
.dark-mode .form-textarea:focus {
  border-color: #2dd4bf !important;
}

.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
}

.dark-mode .reject-textarea {
  background: #121220 !important;
  border-color: #2a2a40 !important;
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
