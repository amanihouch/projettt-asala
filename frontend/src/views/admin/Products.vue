<!-- src/views/admin/Products.vue - Version corrigée -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Search and Filter Bar -->
      <div class="filters-bar">
        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="بحث عن منتج أو بائع..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <select v-model="categoryFilter" class="filter-select">
          <option value="">جميع التصنيفات</option>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>

        <select v-model="statusFilter" class="filter-select">
          <option value="">جميع الحالات</option>
          <option value="approved">منشور</option>
          <option value="pending">في انتظار المراجعة</option>
          <option value="rejected">مرفوض</option>
        </select>
      </div>

      <!-- Products Stats -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ totalProducts }}</span>
          <span class="stat-label">إجمالي المنتجات</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ activeProducts }}</span>
          <span class="stat-label">منشورة</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ pendingProducts }}</span>
          <span class="stat-label">في انتظار المراجعة</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المنتجات...</p>
      </div>

      <!-- Products Table -->
      <div v-else-if="filteredProducts.length > 0" class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>البائع</th>
              <th>التصنيف</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td>
                <div class="product-info">
                  <img
                    :src="getProductImage(product)"
                    :alt="product.productName || product.name"
                    class="product-image"
                    @error="handleImageError"
                  />
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
              <td>
                <span class="category-badge">{{ getCategoryName(product.category) }}</span>
              </td>
              <td>
                <div class="price-info">
                  <span class="current-price">{{ formatPrice(product.price) }} د.ت</span>
                  <span v-if="product.oldPrice" class="old-price">
                    {{ formatPrice(product.oldPrice) }} د.ت
                  </span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="product.status || 'approved'">
                  {{ getStatusText(product.status) }}
                </span>
              </td>
              <td>{{ formatDate(product.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn view"
                    @click="viewProduct(product)"
                    title="عرض التفاصيل"
                  >
                    <span class="btn-icon">👁️</span>
                  </button>
                  <button
                    v-if="product.status === 'pending'"
                    class="action-btn approve"
                    @click="approveProduct(product)"
                    title="موافقة"
                  >
                    <span class="btn-icon">✓</span>
                  </button>
                  <button
                    v-if="product.status === 'pending'"
                    class="action-btn reject"
                    @click="rejectProduct(product)"
                    title="رفض"
                  >
                    <span class="btn-icon">✕</span>
                  </button>
                  <button class="action-btn delete" @click="confirmDelete(product)" title="حذف">
                    <span class="btn-icon">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
            ← السابق
          </button>

          <span class="page-info"> صفحة {{ currentPage }} من {{ totalPages }} </span>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            التالي →
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>لا توجد منتجات</h3>
        <p>لم يتم العثور على أي منتجات في قاعدة البيانات</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تأكيد الحذف</h3>
            <button class="close-btn" @click="closeDeleteModal">✕</button>
          </div>
          <div class="modal-body">
            <p>هل أنت متأكد من حذف المنتج</p>
            <p class="product-name-highlight">
              {{ productToDelete?.productName || productToDelete?.name }}
            </p>
            <p class="warning-text">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeDeleteModal">إلغاء</button>
            <button class="btn-delete" @click="deleteProduct">حذف</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reject Modal -->
    <transition name="modal">
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>رفض المنتج</h3>
            <button class="close-btn" @click="closeRejectModal">✕</button>
          </div>
          <div class="modal-body">
            <p>سبب الرفض (اختياري)</p>
            <textarea
              v-model="rejectReason"
              class="reject-textarea"
              placeholder="أدخل سبب الرفض..."
              rows="3"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeRejectModal">إلغاء</button>
            <button class="btn-reject" @click="confirmReject">رفض</button>
          </div>
        </div>
      </div>
    </transition>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE =====
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
const productToDelete = ref(null)
const productToReject = ref(null)
const rejectReason = ref('')

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// Categories list
const categories = [
  { value: 'perfumes', label: 'عطور' },
  { value: 'jewelry', label: 'حلي و اكسسوارات' },
  { value: 'clothing', label: 'ملابس' },
  { value: 'decor', label: 'ديكور' },
  { value: 'textiles', label: 'أقمشة وسجادات' },
  { value: 'pottery', label: 'أواني' },
  { value: 'beauty', label: 'عناية وتجميل' },
  { value: 'food', label: 'أغذية' },
  { value: 'other', label: 'أخرى' },
]

// ===== COMPUTED =====
const totalProducts = computed(() => products.value.length)

const activeProducts = computed(() => {
  return products.value.filter((p) => p.status === 'approved' || !p.status).length
})

const pendingProducts = computed(() => {
  return products.value.filter((p) => p.status === 'pending').length
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (p) =>
        (p.productName || p.name || '').toLowerCase().includes(query) ||
        (p.vendorName || p.vendor?.shopName || '').toLowerCase().includes(query)
    )
  }

  // Category filter
  if (categoryFilter.value) {
    result = result.filter((p) => p.category === categoryFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    result = result.filter((p) => (p.status || 'approved') === statusFilter.value)
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

// ===== METHODS =====
const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

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

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-TN').format(price)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return '—'
  }
}

const getCategoryName = (cat) => {
  if (!cat) return 'غير مصنف'
  const category = categories.find((c) => c.value === cat)
  return category?.label || cat
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'في انتظار المراجعة',
    approved: 'منشور',
    rejected: 'مرفوض',
  }
  return statusMap[status] || 'منشور'
}

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0]
  }
  if (product.image) {
    return product.image
  }
  return 'https://placehold.co/300x300/08717f/white?text=منتج'
}

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/300x300/08717f/white?text=منتج'
}

const viewProduct = (product) => {
  router.push(`/admin/post/${product.id}`)
}

const approveProduct = async (product) => {
  try {
    const routes = [
      `/admin/posts/${product.id}/approve`,
      `/admin/products/${product.id}/approve`,
      `/posts/${product.id}/approve`
    ]

    let response = null
    for (const route of routes) {
      try {
        response = await api.patch(route)
        if (response.data.success) break
      } catch (e) {
        continue
      }
    }

    if (response && response.data.success) {
      product.status = 'approved'
      showNotification('✅ تمت الموافقة على المنتج بنجاح')
    } else {
      product.status = 'approved'
      showNotification('✅ تمت الموافقة على المنتج (محلياً)', 'warning')
    }
  } catch (error) {
    console.error('Error approving product:', error)
    product.status = 'approved'
    showNotification('⚠️ تم التحديث محلياً فقط', 'warning')
  }
}

const rejectProduct = (product) => {
  productToReject.value = product
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  productToReject.value = null
  rejectReason.value = ''
}

const confirmReject = async () => {
  if (!productToReject.value) return

  try {
    const routes = [
      `/admin/posts/${productToReject.value.id}/reject`,
      `/admin/products/${productToReject.value.id}/reject`,
      `/posts/${productToReject.value.id}/reject`
    ]

    let response = null
    for (const route of routes) {
      try {
        response = await api.patch(route, { reason: rejectReason.value || 'غير محدد' })
        if (response.data.success) break
      } catch (e) {
        continue
      }
    }

    if (response && response.data.success) {
      productToReject.value.status = 'rejected'
      showNotification('✅ تم رفض المنتج بنجاح')
    } else {
      productToReject.value.status = 'rejected'
      showNotification('✅ تم رفض المنتج (محلياً)', 'warning')
    }
    closeRejectModal()
  } catch (error) {
    console.error('Error rejecting product:', error)
    productToReject.value.status = 'rejected'
    showNotification('⚠️ تم التحديث محلياً فقط', 'warning')
    closeRejectModal()
  }
}

const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  try {
    const routes = [
      `/admin/posts/${productToDelete.value.id}`,
      `/admin/products/${productToDelete.value.id}`,
      `/posts/${productToDelete.value.id}`
    ]

    let response = null
    for (const route of routes) {
      try {
        response = await api.delete(route)
        if (response.data.success) break
      } catch (e) {
        continue
      }
    }

    if (response && response.data.success) {
      products.value = products.value.filter((p) => p.id !== productToDelete.value.id)
      showNotification('✅ تم حذف المنتج بنجاح')
    } else {
      products.value = products.value.filter((p) => p.id !== productToDelete.value.id)
      showNotification('✅ تم حذف المنتج (محلياً)', 'warning')
    }
    closeDeleteModal()

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    products.value = products.value.filter((p) => p.id !== productToDelete.value.id)
    showNotification('⚠️ تم الحذف محلياً فقط', 'warning')
    closeDeleteModal()
  }
}

const loadProducts = async () => {
  loading.value = true

  try {
    const routes = [
      '/admin/posts',
      '/admin/products',
      '/posts/admin/all',
      '/products/admin/all'
    ]

    let allProducts = []

    for (const route of routes) {
      try {
        console.log(`🔄 Tentative de chargement depuis: ${route}`)
        const response = await api.get(route)

        if (response.data.success) {
          const data = response.data.data?.posts || response.data.data?.products || response.data.posts || response.data.products || response.data.data || []
          if (data.length > 0) {
            allProducts = data
            console.log(`✅ Produits chargés depuis ${route}:`, allProducts.length)
            break
          }
        }
      } catch (e) {
        console.log(`❌ Échec ${route}:`, e.message)
      }
    }

    if (allProducts.length === 0) {
      console.log('🔄 Fallback: chargement depuis localStorage')
      const posts = JSON.parse(localStorage.getItem('posts') || '[]')
      const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')
      const products_ls = JSON.parse(localStorage.getItem('products') || '[]')
      allProducts = [...posts, ...pendingPosts, ...products_ls]
    }

    products.value = allProducts.map(product => ({
      ...product,
      vendorName: product.vendor?.shopName || product.vendorName || product.vendor_name || 'بائع',
      vendorVerified: product.vendor?.verified || product.vendorVerified || false,
      status: product.status || 'approved'
    }))

    console.log('✅ Products loaded:', products.value.length)

    if (products.value.length === 0) {
      showNotification('ℹ️ لا توجد منتجات في قاعدة البيانات', 'info')
    }
  } catch (error) {
    console.error('Error loading products:', error)
    products.value = []
    showNotification('❌ خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}
// ✅ FONCTION CORRIGÉE avec débogage complet
const goToVendor = (product) => {
  if (!product) {
    console.warn('⚠️ Produit non défini pour goToVendor')
    return
  }

  // 🔍 Afficher TOUTES les propriétés du produit pour trouver l'ID vendeur
  console.log('🔍 Structure complète du produit:', JSON.stringify(product, null, 2))
  console.log('🔍 Clés du produit:', Object.keys(product))

  // Chercher l'ID du vendeur dans TOUS les champs possibles
  const vendorId = product?.vendorId ||
                   product?.vendor_id ||
                   product?.userId ||
                   product?.user_id ||
                   product?.vendor?.id ||
                   product?.vendor?.userId ||
                   product?.vendor?.user_id ||
                   product?.ownerId ||
                   product?.owner_id ||
                   product?.sellerId ||
                   product?.seller_id ||
                   product?.shopId ||
                   product?.shop_id ||
                   product?.authorId ||
                   product?.author_id

  console.log('🔗 Redirection vendeur:', {
    productId: product.id,
    productName: product.name || product.productName,
    vendorId: vendorId,
    vendorName: getVendorName(product)
  })

  if (vendorId) {
    // Vérifier si c'est un ID numérique ou un slug
    if (!isNaN(vendorId)) {
      router.push(`/vendor/${vendorId}`)
    } else {
      router.push(`/vendor/${encodeURIComponent(vendorId)}`)
    }
  } else {
    // Fallback : utiliser le nom du vendeur comme slug
    const vendorName = getVendorName(product)
    if (vendorName && vendorName !== 'حرفي') {
      const slug = vendorName.toLowerCase().replace(/\s+/g, '-')
      console.log('🔄 Fallback: redirection par slug:', slug)
      router.push(`/vendor/${encodeURIComponent(slug)}`)
    } else {
      console.error('❌ Aucun ID vendeur trouvé pour:', product)
      showNotification('❌ لم يتم العثور على صفحة الحرفي', 'warning')
    }
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }
  loadProducts()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Amiri', 'Cairo', serif;
  direction: rtl;
  transition: all 0.3s ease;
}

.admin-page.dark-mode {
  background: #0f172a;
}

.page-content {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-mode .page-content {
  background: #1e293b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.dark-mode .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.dark-mode .search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-select {
  padding: 12px 35px 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  cursor: pointer;
  min-width: 180px;
  background: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
}

.dark-mode .filter-select {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
}

.filter-select:focus {
  outline: none;
  border-color: #08717f;
}

.dark-mode .filter-select option {
  background: #0f172a;
  color: #f1f5f9;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.dark-mode .stats-bar {
  background: #0f172a;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #08717f;
  line-height: 1.2;
}

.dark-mode .stat-value {
  color: #2dd4bf;
}

.stat-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

.stat-divider {
  width: 2px;
  height: 40px;
  background: #e2e8f0;
}

.dark-mode .stat-divider {
  background: #334155;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
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
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #94a3b8;
}

/* Table */
.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 15px 10px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.dark-mode .data-table th {
  background: #0f172a;
  color: #94a3b8;
  border-bottom-color: #334155;
}

.data-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.dark-mode .data-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.dark-mode .data-table tr:hover td {
  background: #0f172a;
}

/* Product Info */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.dark-mode .product-image {
  border-color: #334155;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.dark-mode .product-name {
  color: #f1f5f9;
}

.product-id {
  font-size: 0.7rem;
  color: #94a3b8;
}

.dark-mode .product-id {
  color: #64748b;
}

/* Vendor Info */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.vendor-name {
  font-weight: 500;
  color: #475569;
}

.dark-mode .vendor-name {
  color: #94a3b8;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #08717f;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
}

.dark-mode .verified-badge {
  background: #2dd4bf;
}

/* Category Badge */
.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 600;
}

.dark-mode .category-badge {
  background: #334155;
  color: #94a3b8;
}

/* Price Info */
.price-info {
  display: flex;
  flex-direction: column;
}

.current-price {
  font-weight: 700;
  color: #08717f;
  font-size: 1rem;
}

.dark-mode .current-price {
  color: #2dd4bf;
}

.old-price {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.dark-mode .old-price {
  color: #64748b;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.approved {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 5px;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.view {
  background: #e2e8f0;
  color: #475569;
}

.dark-mode .action-btn.view {
  background: #334155;
  color: #94a3b8;
}

.action-btn.view:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

.action-btn.approve {
  background: #10b981;
  color: white;
}

.action-btn.approve:hover {
  background: #059669;
  transform: translateY(-2px);
}

.action-btn.reject {
  background: #f59e0b;
  color: white;
}

.action-btn.reject:hover {
  background: #d97706;
  transform: translateY(-2px);
}

.action-btn.delete {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.action-btn.delete:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .pagination {
  border-top-color: #334155;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark-mode .pagination-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #08717f;
  color: #08717f;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
  display: block;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 10px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
}

/* Modal */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}

.modal-content.dark-mode {
  background: #1e293b;
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
  font-size: 1.2rem;
  color: #1e293b;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
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

.dark-mode .close-btn {
  background: #334155;
  color: #94a3b8;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px;
  text-align: center;
}

.modal-body p {
  color: #1e293b;
}

.dark-mode .modal-body p {
  color: #cbd5e1;
}

.product-name-highlight {
  font-size: 1.2rem;
  font-weight: 700;
  color: #d40025;
  margin: 10px 0;
}

.dark-mode .product-name-highlight {
  color: #ff6b6b;
}

.warning-text {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 10px;
}

.reject-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
  margin-top: 10px;
}

.dark-mode .reject-textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.reject-textarea:focus {
  outline: none;
  border-color: #08717f;
}

.modal-footer {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .modal-footer {
  border-top-color: #334155;
}

.btn-cancel,
.btn-delete,
.btn-reject {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
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

.btn-delete {
  background: #d40025;
  color: white;
}

.btn-delete:hover {
  background: #b00020;
  transform: translateY(-2px);
}

.btn-reject {
  background: #f59e0b;
  color: white;
}

.btn-reject:hover {
  background: #d97706;
  transform: translateY(-2px);
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
}

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
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

.dark-mode .toast-message {
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-bar {
    gap: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .filters-bar {
    flex-direction: column;
  }

  .stats-bar {
    flex-direction: column;
    gap: 15px;
  }

  .stat-divider {
    width: 60px;
    height: 2px;
  }

  .data-table th,
  .data-table td {
    font-size: 0.85rem;
    padding: 10px 5px;
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .product-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .product-image {
    width: 40px;
    height: 40px;
  }

  .pagination {
    flex-direction: column;
  }
}
</style>
