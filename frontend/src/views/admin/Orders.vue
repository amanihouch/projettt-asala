<!-- src/views/admin/Orders.vue - AVEC POLICE AMIRI ET CORRECTIONS -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card pending">
          <span class="stat-icon">⏳</span>
          <div class="stat-info">
            <span class="stat-value">{{ getStatusCount('pending') }}</span>
            <span class="stat-label">قيد الانتظار</span>
          </div>
        </div>
        <div class="stat-card processing">
          <span class="stat-icon">⚙️</span>
          <div class="stat-info">
            <span class="stat-value">{{ getStatusCount('processing') }}</span>
            <span class="stat-label">قيد المعالجة</span>
          </div>
        </div>
        <div class="stat-card shipped">
          <span class="stat-icon">📦</span>
          <div class="stat-info">
            <span class="stat-value">{{ getStatusCount('shipped') }}</span>
            <span class="stat-label">تم الشحن</span>
          </div>
        </div>
        <div class="stat-card delivered">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ getStatusCount('delivered') }}</span>
            <span class="stat-label">تم التوصيل</span>
          </div>
        </div>
        <div class="stat-card cancelled">
          <span class="stat-icon">❌</span>
          <div class="stat-info">
            <span class="stat-value">{{ getStatusCount('cancelled') }}</span>
            <span class="stat-label">ملغي</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="processing">قيد المعالجة</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التوصيل</option>
          <option value="cancelled">ملغي</option>
        </select>

        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="🔍 بحث عن طلب..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل الطلبات...</p>
      </div>

      <!-- Orders Table -->
      <div v-else-if="filteredOrders.length > 0" class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td data-label="رقم الطلب">#{{ order.id || order.orderNumber || 'N/A' }}</td>
              <td data-label="العميل">{{ getCustomerName(order) }}</td>
              <td data-label="التاريخ">{{ formatDate(order.createdAt || order.created_at) }}</td>
              <td data-label="المبلغ" class="price-cell">{{ formatPrice(order.total) }} د.ت</td>
              <td data-label="الحالة">
                <select
                  v-model="order.status"
                  class="status-select"
                  :class="order.status"
                  @change="updateOrderStatus(order)"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </td>
              <td data-label="الإجراءات">
                <button class="action-btn view" @click="viewOrder(order)">
                  <span class="btn-icon">👁️</span>
                  تفاصيل
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>لا توجد طلبات</h3>
        <p>لم يتم العثور على طلبات تطابق معايير البحث</p>
      </div>
    </div>

    <!-- Order Details Modal -->
    <transition name="modal">
      <div v-if="showOrderModal" class="modal-overlay" @click.self="closeOrderModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تفاصيل الطلب #{{ selectedOrder?.id || selectedOrder?.orderNumber }}</h3>
            <button class="close-btn" @click="closeOrderModal">✕</button>
          </div>
          <div class="modal-body" v-if="selectedOrder">
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">العميل:</span>
                <span class="info-value">{{ getCustomerName(selectedOrder) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">البريد الإلكتروني:</span>
                <span class="info-value">{{ getCustomerEmail(selectedOrder) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">الهاتف:</span>
                <span class="info-value">{{ getCustomerPhone(selectedOrder) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">تاريخ الطلب:</span>
                <span class="info-value">{{ formatDate(selectedOrder.createdAt || selectedOrder.created_at) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">حالة الطلب:</span>
                <span class="status-badge" :class="selectedOrder.status">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">عنوان التوصيل:</span>
                <span class="info-value">{{ selectedOrder.shippingAddress || selectedOrder.shipping_address || 'غير متوفر' }}</span>
              </div>
            </div>

            <div class="order-items">
              <h4>المنتجات</h4>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedOrder.items" :key="index">
                    <td>{{ item.productName || item.name || 'منتج' }}</td>
                    <td>{{ item.quantity || 1 }}</td>
                    <td>{{ formatPrice(item.price) }} د.ت</td>
                    <td>{{ formatPrice((item.price || 0) * (item.quantity || 1)) }} د.ت</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="3" class="total-label">المجموع الكلي:</td>
                    <td class="total-price">{{ formatPrice(selectedOrder.total) }} د.ت</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-close" @click="closeOrderModal">إغلاق</button>
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

// src/views/admin/Orders.vue - SECTION SCRIPT CORRIGÉE
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'  // ✅ Utiliser votre service API existant

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== DONNÉES DE DÉMONSTRATION (FALLBACK UNIQUEMENT) =====
const DEMO_ORDERS = [
  {
    id: 'DEMO001',
    orderNumber: 'DEMO-2024-001',
    customer_name: 'أحمد المحمدي',
    customer_email: 'ahmed@example.com',
    customer_phone: '20123456',
    createdAt: new Date().toISOString(),
    total: 156.500,
    status: 'pending',
    shippingAddress: 'تونس، شارع الحبيب بورقيبة 45',
    items: [
      { productName: 'عطر فاخر', price: 89.900, quantity: 1 },
      { productName: 'صابون تقليدي', price: 25.500, quantity: 2 }
    ]
  }
]

// ===== STATE =====
const searchQuery = ref('')
const statusFilter = ref('all')
const orders = ref([])
const loading = ref(false)
const showOrderModal = ref(false)
const selectedOrder = ref(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== UTILS =====
const getCustomerName = (order) => {
  return order.customerName || order.customer_name || order.user?.name || order.userName || 'غير معروف'
}

const getCustomerEmail = (order) => {
  return order.customerEmail || order.customer_email || order.user?.email || order.userEmail || 'غير متوفر'
}

const getCustomerPhone = (order) => {
  return order.customerPhone || order.customerPhone1 || order.customer_phone || order.user?.phone || 'غير متوفر'
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }
  return statusMap[status] || status
}

const getStatusCount = (status) => {
  return orders.value.filter((o) => o.status === status).length
}

const filteredOrders = computed(() => {
  let result = orders.value

  if (statusFilter.value !== 'all') {
    result = result.filter((o) => o.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (o) =>
        (o.id?.toString().toLowerCase().includes(query) ||
         o.orderNumber?.toString().toLowerCase().includes(query)) ||
        getCustomerName(o).toLowerCase().includes(query) ||
        getCustomerEmail(o).toLowerCase().includes(query)
    )
  }

  return result
})

// ===== CHARGEMENT DES DONNÉES (CORRIGÉ - UTILISE L'API) =====
const loadOrders = async () => {
  loading.value = true

  try {
    // ✅ Utiliser votre API service avec la route admin correcte
    const response = await api.get('/orders/admin/all')

    if (response.data.success && Array.isArray(response.data.data)) {
      const apiOrders = response.data.data

      if (apiOrders.length > 0) {
        // Normaliser les données pour correspondre au format attendu par le template
        orders.value = apiOrders.map(order => ({
          ...order,
          id: order.id,
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          customer_name: getCustomerName(order),
          customer_email: getCustomerEmail(order),
          customer_phone: getCustomerPhone(order),
          total: parseFloat(order.total) || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt || order.created_at,
          items: Array.isArray(order.items) ? order.items.map(item => ({
            productName: item.productName || item.product_name || item.name || 'منتج',
            name: item.productName || item.product_name || item.name || 'منتج',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
          })) : [],
          shippingAddress: order.shippingAddress || order.address || 'غير متوفر'
        }))

        console.log('📦 Commandes chargées depuis l\'API:', orders.value.length)

        // Sauvegarder dans localStorage comme cache
        localStorage.setItem('admin_orders_cache', JSON.stringify(orders.value))
      } else {
        // Aucune commande trouvée dans l'API
        orders.value = []
        console.log('📦 Aucune commande trouvée dans l\'API')
      }
    } else {
      // Format de réponse invalide
      console.warn('⚠️ Format de réponse API invalide, tentative de chargement du cache...')
      loadOrdersFromCache()
    }
  } catch (error) {
    console.error('❌ Erreur chargement commandes depuis l\'API:', error.message)

    // Si l'erreur est 404 (route non trouvée), essayer d'autres routes
    if (error.response?.status === 404) {
      console.warn('⚠️ Route /orders/admin/all non trouvée, tentative de routes alternatives...')
      await tryAlternativeRoutes()
    } else {
      // Charger depuis le cache localStorage
      loadOrdersFromCache()
    }
  } finally {
    loading.value = false
  }
}

// Fonction pour essayer des routes alternatives si la route principale échoue
const tryAlternativeRoutes = async () => {
  const alternativeRoutes = [
    '/admin/orders',
    '/orders/admin',
    '/admin/orders/all'
  ]

  for (const route of alternativeRoutes) {
    try {
      console.log(`🔄 Tentative de la route: ${route}`)
      const response = await api.get(route)

      if (response.data.success && Array.isArray(response.data.data)) {
        orders.value = response.data.data.map(order => ({
          ...order,
          id: order.id || order._id,
          orderNumber: order.orderNumber || `ORD-${order.id || order._id}`,
          customer_name: getCustomerName(order),
          customer_email: getCustomerEmail(order),
          customer_phone: getCustomerPhone(order),
          total: parseFloat(order.total) || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt || order.created_at,
          items: Array.isArray(order.items) ? order.items : [],
          shippingAddress: order.shippingAddress || order.address || 'غير متوفر'
        }))

        console.log(`✅ Commandes chargées via la route ${route}:`, orders.value.length)
        localStorage.setItem('admin_orders_cache', JSON.stringify(orders.value))
        return
      }
    } catch (err) {
      console.warn(`❌ Route ${route} échouée:`, err.message)
    }
  }

  // Si toutes les routes échouent, charger depuis le cache
  loadOrdersFromCache()
}

// Fonction de fallback pour charger depuis le cache localStorage
const loadOrdersFromCache = () => {
  try {
    const cached = localStorage.getItem('admin_orders_cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) {
        orders.value = parsed
        console.log('📦 Commandes chargées depuis le cache localStorage:', orders.value.length)
        return
      }
    }

    // Si pas de cache, utiliser les données de démo
    orders.value = DEMO_ORDERS
    console.log('📦 Données de démonstration chargées (fallback)')
  } catch (error) {
    console.error('❌ Erreur chargement cache:', error)
    orders.value = DEMO_ORDERS
  }
}

// ===== MISE À JOUR DU STATUT (CORRIGÉ - UTILISE L'API) =====
const updateOrderStatus = async (order) => {
  if (!order || !order.id) return

  const oldStatus = order.status
  const previousStatus = orders.value.find(o => o.id === order.id)?.status || oldStatus

  try {
    // ✅ Essayer la route admin principale
    const response = await api.patch(`/orders/admin/${order.id}/status`, {
      status: order.status
    })

    if (response.data.success) {
      // Mise à jour réussie via l'API
      // Sauvegarder dans le cache localStorage
      localStorage.setItem('admin_orders_cache', JSON.stringify(orders.value))
      showNotification(`✅ تم تحديث حالة الطلب #${order.id || order.orderNumber} إلى ${getStatusText(order.status)}`, 'success')
      console.log('✅ Statut mis à jour via API pour la commande:', order.id)
      return
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour statut via API:', error.message)

    // Si la route principale échoue, essayer des routes alternatives
    try {
      const alternativeResponse = await api.put(`/admin/orders/${order.id}/status`, {
        status: order.status
      })

      if (alternativeResponse.data.success) {
        localStorage.setItem('admin_orders_cache', JSON.stringify(orders.value))
        showNotification(`✅ تم تحديث حالة الطلب #${order.id || order.orderNumber} إلى ${getStatusText(order.status)}`, 'success')
        return
      }
    } catch (altError) {
      console.error('❌ Routes alternatives échouées aussi:', altError.message)
    }
  }

  // Si l'API échoue complètement, sauvegarder localement
  localStorage.setItem('admin_orders_cache', JSON.stringify(orders.value))
  showNotification(`⚠️ تم تحديث حالة الطلب محلياً فقط #${order.id || order.orderNumber}`, 'warning')
}

const viewOrder = (order) => {
  selectedOrder.value = { ...order }
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedOrder.value = null
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
onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }
  loadOrders()
})
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.admin-page {
  font-family: 'Amiri', 'Cairo', serif;
  padding: 30px;
  background: #f8fafc;
  min-height: 100vh;
  direction: rtl;
  transition: all 0.3s ease;
}

.admin-page * {
  font-family: 'Amiri', 'Cairo', serif;
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

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  padding: 18px 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-color: #334155;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.stat-card.pending .stat-value { color: #f59e0b; }
.stat-card.processing .stat-value { color: #3b82f6; }
.stat-card.shipped .stat-value { color: #8b5cf6; }
.stat-card.delivered .stat-value { color: #10b981; }
.stat-card.cancelled .stat-value { color: #ef4444; }

.dark-mode .stat-card.pending .stat-value { color: #fbbf24; }
.dark-mode .stat-card.processing .stat-value { color: #60a5fa; }
.dark-mode .stat-card.shipped .stat-value { color: #a78bfa; }
.dark-mode .stat-card.delivered .stat-value { color: #34d399; }
.dark-mode .stat-card.cancelled .stat-value { color: #f87171; }

.stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(8, 113, 127, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.2;
}

.stat-label {
  color: #64748b;
  font-size: 0.8rem;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.filter-select,
.search-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.dark-mode .filter-select,
.dark-mode .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #08717f;
}

.filter-select {
  min-width: 160px;
  cursor: pointer;
}

.search-wrapper {
  flex: 1;
  max-width: 350px;
}

.search-input {
  width: 100%;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  font-size: 1.1rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 15px;
}

.dark-mode .spinner {
  border-color: #334155;
  border-top-color: #2dd4bf;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
}

.data-table thead {
  background: #f8fafc;
}

.dark-mode .data-table thead {
  background: #1e293b;
}

.data-table th {
  padding: 15px;
  text-align: right;
  font-weight: 600;
  font-size: 1rem;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 0.95rem;
}

.dark-mode .data-table td {
  color: #cbd5e1;
  border-bottom-color: #334155;
}

.data-table tr:hover {
  background: #f8fafc;
}

.dark-mode .data-table tr:hover {
  background: #1e293b;
}

.price-cell {
  font-weight: 700;
  color: #d40025;
}

.dark-mode .price-cell {
  color: #ff6b6b;
}

.status-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
}

.dark-mode .status-select {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.status-select.pending { border-right: 3px solid #f59e0b; }
.status-select.processing { border-right: 3px solid #3b82f6; }
.status-select.shipped { border-right: 3px solid #8b5cf6; }
.status-select.delivered { border-right: 3px solid #10b981; }
.status-select.cancelled { border-right: 3px solid #ef4444; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.view {
  background: #e2e8f0;
  color: #475569;
}

.dark-mode .action-btn.view {
  background: #334155;
  color: #cbd5e1;
}

.action-btn.view:hover {
  background: #08717f;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

.dark-mode .empty-state p {
  color: #94a3b8;
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 1.3rem;
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
  color: #f1f5f9;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 25px;
}

.order-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
}

.dark-mode .order-info {
  background: #0f172a;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .info-row {
  border-bottom-color: #334155;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.95rem;
}

.dark-mode .info-label {
  color: #94a3b8;
}

.info-value {
  color: #1e293b;
  font-size: 0.95rem;
}

.dark-mode .info-value {
  color: #f1f5f9;
}

.status-badge {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.processing { background: #cce5ff; color: #004085; }
.status-badge.shipped { background: #e2d5ff; color: #5e3a9e; }
.status-badge.delivered { background: #d4edda; color: #155724; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }

.dark-mode .status-badge.pending { background: rgba(255, 243, 205, 0.2); color: #ffd966; }
.dark-mode .status-badge.processing { background: rgba(204, 229, 255, 0.2); color: #6ea8fe; }
.dark-mode .status-badge.shipped { background: rgba(226, 213, 255, 0.2); color: #b794f4; }
.dark-mode .status-badge.delivered { background: rgba(212, 237, 218, 0.2); color: #6fbf4c; }
.dark-mode .status-badge.cancelled { background: rgba(248, 215, 218, 0.2); color: #ff6b6b; }

.order-items h4 {
  color: #1e293b;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.dark-mode .order-items h4 {
  color: #f1f5f9;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 10px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
}

.dark-mode .items-table th,
.dark-mode .items-table td {
  border-bottom-color: #334155;
}

.items-table th {
  font-weight: 600;
  color: #64748b;
}

.dark-mode .items-table th {
  color: #94a3b8;
}

.items-table td {
  color: #1e293b;
}

.dark-mode .items-table td {
  color: #cbd5e1;
}

.total-row {
  font-weight: 700;
}

.total-label {
  text-align: left;
  color: #1e293b;
}

.dark-mode .total-label {
  color: #f1f5f9;
}

.total-price {
  color: #d40025;
  font-size: 1.2rem;
}

.dark-mode .total-price {
  color: #ff6b6b;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.dark-mode .modal-footer {
  border-top-color: #334155;
}

.btn-close {
  padding: 10px 30px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #065a69;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

.dark-mode .toast-message {
  color: #f1f5f9;
}

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

/* Responsive */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .data-table thead {
    display: none;
  }

  .data-table tbody tr {
    display: block;
    margin-bottom: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px;
  }

  .dark-mode .data-table tbody tr {
    border-color: #334155;
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .dark-mode .data-table td {
    border-bottom-color: #334155;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    margin-left: 10px;
  }

  .dark-mode .data-table td::before {
    color: #94a3b8;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .info-row {
    flex-direction: column;
    gap: 5px;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/ORDERS.VUE ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

/* Stats Cards */
.dark-mode .stat-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .stat-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
}

.dark-mode .stat-icon {
  background: rgba(45, 212, 191, 0.1) !important;
}

.dark-mode .stat-label {
  color: #94a3b8 !important;
}

/* Filters */
.dark-mode .filter-select,
.dark-mode .search-input {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .filter-select:focus,
.dark-mode .search-input:focus {
  border-color: #2dd4bf !important;
}

.dark-mode .search-input::placeholder {
  color: #64748b !important;
}

/* Table */
.dark-mode .data-table thead {
  background: #121220 !important;
}

.dark-mode .data-table th {
  color: #f1f5f9 !important;
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .data-table td {
  color: #cbd5e1 !important;
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .data-table tr:hover {
  background: #1a1a2e !important;
}

/* Price */
.dark-mode .price-cell {
  color: #ef4444 !important;
}

/* Status Select */
.dark-mode .status-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .status-select.pending { border-right-color: #fbbf24 !important; }
.dark-mode .status-select.processing { border-right-color: #60a5fa !important; }
.dark-mode .status-select.shipped { border-right-color: #a78bfa !important; }
.dark-mode .status-select.delivered { border-right-color: #34d399 !important; }
.dark-mode .status-select.cancelled { border-right-color: #f87171 !important; }

/* Action Button */
.dark-mode .action-btn.view {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .action-btn.view:hover {
  background: #2dd4bf !important;
  color: #161627 !important;
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

.dark-mode .empty-state p {
  color: #94a3b8 !important;
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

.dark-mode .order-info {
  background: #121220 !important;
}

.dark-mode .info-row {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .info-label {
  color: #94a3b8 !important;
}

.dark-mode .info-value {
  color: #f1f5f9 !important;
}

.dark-mode .order-items h4 {
  color: #f1f5f9 !important;
}

.dark-mode .items-table th,
.dark-mode .items-table td {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .items-table th {
  color: #94a3b8 !important;
}

.dark-mode .items-table td {
  color: #cbd5e1 !important;
}

.dark-mode .total-label {
  color: #f1f5f9 !important;
}

.dark-mode .total-price {
  color: #ef4444 !important;
}

.dark-mode .modal-footer {
  border-top-color: #2a2a40 !important;
}

/* Toast */
.dark-mode .toast-notification {
  background: #1e1e30 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}

/* Status badges in modal */
.dark-mode .status-badge.pending { background: rgba(245, 158, 11, 0.15) !important; color: #fbbf24 !important; }
.dark-mode .status-badge.processing { background: rgba(59, 130, 246, 0.15) !important; color: #60a5fa !important; }
.dark-mode .status-badge.shipped { background: rgba(139, 92, 246, 0.15) !important; color: #a78bfa !important; }
.dark-mode .status-badge.delivered { background: rgba(16, 185, 129, 0.15) !important; color: #34d399 !important; }
.dark-mode .status-badge.cancelled { background: rgba(239, 68, 68, 0.15) !important; color: #f87171 !important; }
</style>
