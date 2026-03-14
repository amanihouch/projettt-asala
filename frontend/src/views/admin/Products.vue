<!-- src/views/admin/Products.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة المنتجات</h1>
      <p class="page-subtitle">عرض وإدارة جميع المنتجات المنشورة</p>
    </header>

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
              <th>الإعجابات</th>
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
                    <span class="product-name">{{ product.productName || product.name }}</span>
                    <span class="product-id">#{{ product.id.slice(-8) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="vendor-info">
                  <span class="vendor-name">{{ product.vendorName || 'غير معروف' }}</span>
                  <span v-if="product.vendorVerified" class="verified-badge" title="موثق">✓</span>
                </div>
              </td>
              <td>
                <span class="category-badge">{{ getCategoryName(product.category) }}</span>
              </td>
              <td>
                <div class="price-info">
                  <span class="current-price">{{ formatPrice(product.price) }} د.ت</span>
                  <span v-if="product.oldPrice" class="old-price"
                    >{{ formatPrice(product.oldPrice) }} د.ت</span
                  >
                </div>
              </td>
              <td>
                <span class="status-badge" :class="product.status || 'approved'">
                  {{ getStatusText(product.status) }}
                </span>
              </td>
              <td>{{ formatDate(product.createdAt) }}</td>
              <td>
                <div class="likes-info">
                  <span class="likes-icon">❤️</span>
                  <span class="likes-count">{{ product.likes || 0 }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn view"
                    @click="viewProduct(product)"
                    title="عرض التفاصيل"
                  >
                    <span class="btn-icon">👁️</span>
                  </button>
                  <button class="action-btn edit" @click="editProduct(product)" title="تعديل">
                    <span class="btn-icon">✏️</span>
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
        <div class="modal-content">
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

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ===== STATE =====
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const products = ref([])
const showDeleteModal = ref(false)
const productToDelete = ref(null)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// Categories list
const categories = [
  { value: 'perfumes', label: 'عطور', icon: '🌸' },
  { value: 'jewelry', label: 'حلي و اكسسوارات', icon: '💍' },
  { value: 'clothing', label: 'ملابس', icon: '👗' },
  { value: 'decoration', label: 'ديكور', icon: '🏺' },
  { value: 'textiles', label: 'أقمشة وسجادات', icon: '🧵' },
  { value: 'pottery', label: 'أواني', icon: '🍽️' },
  { value: 'beauty', label: 'عناية وتجميل', icon: '🧴' },
  { value: 'food', label: 'أغدية', icon: '🍯' },
  { value: 'other', label: 'أخرى', icon: '✨' },
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
        p.productName?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query) ||
        p.vendorName?.toLowerCase().includes(query),
    )
  }

  // Category filter
  if (categoryFilter.value) {
    result = result.filter((p) => p.category === categoryFilter.value)
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

// ===== METHODS =====
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
  return 'https://via.placeholder.com/300x300?text=لا+توجد+صورة'
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x300?text=خطأ+في+الصورة'
}

const viewProduct = (product) => {
  // Navigate to product detail page
  router.push(`/admin/post/${product.id}`)
}

const editProduct = (product) => {
  router.push(`/admin/post/edit/${product.id}`)
}

const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const deleteProduct = () => {
  if (!productToDelete.value) return

  try {
    // Remove from products array
    products.value = products.value.filter((p) => p.id !== productToDelete.value.id)

    // Update localStorage
    localStorage.setItem('posts', JSON.stringify(products.value))

    // Also remove from pending_posts if exists
    const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')
    const updatedPending = pendingPosts.filter((p) => p.id !== productToDelete.value.id)
    localStorage.setItem('pending_posts', JSON.stringify(updatedPending))

    showNotification('✅ تم حذف المنتج بنجاح')
    closeDeleteModal()

    // Reset to first page if current page is empty
    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    showNotification('❌ حدث خطأ أثناء الحذف', 'error')
    closeDeleteModal()
  }
}

const loadProducts = () => {
  loading.value = true

  try {
    // Load from posts (approved posts)
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')

    // Load from pending_posts
    const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')

    // Load vendors for vendor names
    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')

    // Combine all products
    let allProducts = [...posts, ...pendingPosts]

    // Add vendor info
    allProducts = allProducts.map((product) => {
      const vendor = vendors.find((v) => v.id === product.vendorId)
      return {
        ...product,
        vendorName: vendor?.shopName || product.vendorName || 'بائع',
        vendorVerified: vendor?.verified || false,
      }
    })

    // Sort by date (newest first)
    allProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    products.value = allProducts
    console.log('✅ Products loaded:', products.value.length)
  } catch (error) {
    console.error('Error loading products:', error)
    products.value = []
    showNotification('❌ خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-page {
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 5px;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.page-content {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: left 12px center;
}

.filter-select:focus {
  outline: none;
  border-color: #08717f;
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

.stat-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-divider {
  width: 2px;
  height: 40px;
  background: #e2e8f0;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.data-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
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

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.product-id {
  font-size: 0.7rem;
  color: #94a3b8;
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

.old-price {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
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

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

/* Likes Info */
.likes-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.likes-icon {
  font-size: 0.9rem;
}

.likes-count {
  font-weight: 600;
  color: #d40025;
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

.action-btn.view:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

.action-btn.edit {
  background: #08717f;
  color: white;
}

.action-btn.edit:hover {
  background: #065a69;
  transform: translateY(-2px);
}

.action-btn.delete {
  background: #fee2e2;
  color: #ef4444;
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

.modal-header h3 {
  font-size: 1.2rem;
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

.modal-body {
  padding: 25px;
  text-align: center;
}

.product-name-highlight {
  font-size: 1.2rem;
  font-weight: 700;
  color: #d40025;
  margin: 10px 0;
}

.warning-text {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-delete {
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
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.3);
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
  font-size: 0.95rem;
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
    flex-direction: column;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

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
