<!-- src/views/admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard" dir="rtl">
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h2 class="sidebar-title">لوحة التحكم</h2>
          <p class="sidebar-subtitle">توراث</p>
        </div>

        <nav class="sidebar-nav">
          <!-- الرئيسية -->
          <router-link to="/admin" class="nav-item" exact-active-class="active">
            <span class="nav-icon">📊</span>
            <span class="nav-text">الرئيسية</span>
          </router-link>

          <!-- المستخدمين -->
          <router-link to="/admin/users" class="nav-item" active-class="active">
            <span class="nav-icon">👥</span>
            <span class="nav-text">المستخدمين</span>
          </router-link>

          <!-- البائعين -->
          <router-link to="/admin/vendors" class="nav-item" active-class="active">
            <span class="nav-icon">🏪</span>
            <span class="nav-text">البائعين</span>
          </router-link>

          <!-- المنتجات -->
          <router-link to="/admin/products" class="nav-item" active-class="active">
            <span class="nav-icon">📦</span>
            <span class="nav-text">المنتجات</span>
          </router-link>

          <!-- ⭐ المنتجات المميزة (NOUVEAU) -->
          <router-link to="/admin/sponsored-products" class="nav-item" active-class="active">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">المنتجات المميزة</span>
          </router-link>

          <!-- الطلبات -->
          <router-link to="/admin/orders" class="nav-item" active-class="active">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">الطلبات</span>
          </router-link>

          <!-- التصنيفات -->
          <router-link to="/admin/categories" class="nav-item" active-class="active">
            <span class="nav-icon">📋</span>
            <span class="nav-text">التصنيفات</span>
          </router-link>

          <!-- المنشورات -->
          <router-link to="/admin/pending-posts" class="nav-item" active-class="active">
            <span class="nav-icon">📝</span>
            <span class="nav-text">المنشورات</span>
          </router-link>

          <!-- الإعدادات -->
          <router-link to="/admin/settings" class="nav-item" active-class="active">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">الإعدادات</span>
          </router-link>

          <div class="nav-divider"></div>

          <!-- العودة للموقع -->
          <router-link to="/" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">العودة للموقع</span>
          </router-link>

          <!-- تسجيل الخروج -->
          <button @click="logout" class="nav-item logout-btn">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="main-header">
          <div class="header-left">
            <button class="menu-toggle" @click="toggleSidebar">☰</button>
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>

          <div class="header-right">
            <div class="admin-profile">
              <img :src="adminAvatar" alt="Admin" class="admin-avatar" />
              <div class="admin-info">
                <span class="admin-name">{{ adminName }}</span>
                <span class="admin-role">مدير النظام</span>
              </div>
            </div>
          </div>
        </header>

        <div class="content-wrapper">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users">👥</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ stats.totalUsers }}</h3>
                <p class="stat-label">إجمالي المستخدمين</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon vendors">🏪</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ stats.totalVendors }}</h3>
                <p class="stat-label">البائعين</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon products">📦</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ stats.totalProducts }}</h3>
                <p class="stat-label">المنتجات</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon orders">🛒</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ stats.totalOrders }}</h3>
                <p class="stat-label">الطلبات</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon revenue">💰</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ formatPrice(stats.totalRevenue) }}</h3>
                <p class="stat-label">الإيرادات</p>
              </div>
            </div>
          </div>

          <!-- ⭐ Statistiques des produits sponsorisés (NOUVEAU) -->
          <div class="stats-row">
            <div class="stat-card mini">
              <div class="stat-icon sponsored">⭐</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ stats.sponsoredProducts }}</h3>
                <p class="stat-label">منتجات مميزة</p>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="recent-orders">
            <div class="section-header">
              <h3 class="section-title">أحدث الطلبات</h3>
              <router-link to="/admin/orders" class="view-all-link">عرض الكل ←</router-link>
            </div>

            <div class="table-responsive">
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
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    <td>{{ formatPrice(order.total) }} د.ت</td>
                    <td>
                      <span class="status-badge" :class="order.status">{{
                        getStatusText(order.status)
                      }}</span>
                    </td>
                    <td>
                      <button class="action-btn view" @click="viewOrder(order.id)">عرض</button>
                      <button class="action-btn edit" @click="editOrder(order.id)">تعديل</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Vendors -->
          <div class="recent-vendors">
            <div class="section-header">
              <h3 class="section-title">أحدث البائعين</h3>
              <router-link to="/admin/vendors" class="view-all-link">عرض الكل ←</router-link>
            </div>

            <div class="vendors-grid">
              <div v-for="vendor in recentVendors" :key="vendor.id" class="vendor-card">
                <img :src="vendor.avatar" :alt="vendor.shopName" class="vendor-avatar" />
                <div class="vendor-info">
                  <h4 class="vendor-name">{{ vendor.shopName }}</h4>
                  <p class="vendor-owner">{{ vendor.name }}</p>
                  <p class="vendor-products">{{ vendor.products || 0 }} منتج</p>
                </div>
                <div class="vendor-actions">
                  <button class="icon-btn" @click="viewVendor(vendor.id)">👁️</button>
                  <button class="icon-btn" @click="toggleVendorStatus(vendor)">
                    {{ vendor.verified ? '✅' : '⏳' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

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
import { useAuthStore } from '../../stores/auth'
import { useProductStore } from '../../stores/productStore'
import Chart from 'chart.js/auto'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

// ===== STATE =====
const pageTitle = ref('لوحة التحكم')
const sidebarCollapsed = ref(false)
const ordersChart = ref(null)
const categoriesChart = ref(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== COMPUTED =====
const adminName = computed(() => authStore.userName || 'مدير')
const adminAvatar = computed(() => authStore.userAvatar || 'https://i.pravatar.cc/300?img=8')

// ===== STATS DATA =====
const stats = ref({
  totalUsers: 0,
  totalVendors: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  sponsoredProducts: 0,
})

const recentOrders = ref([])
const recentVendors = ref([])

// ===== METHODS =====
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN')
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }
  return statusMap[status] || status
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
  setTimeout(() => (toast.value.show = false), 3000)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const viewOrder = (orderId) => {
  router.push(`/admin/orders/${orderId}`)
}

const editOrder = (orderId) => {
  router.push(`/admin/orders/edit/${orderId}`)
}

const viewVendor = (vendorId) => {
  window.open(`/vendor/${vendorId}`, '_blank')
}

const toggleVendorStatus = (vendor) => {
  vendor.verified = !vendor.verified
  // Save to localStorage
  const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
  const index = vendors.findIndex((v) => v.id === vendor.id)
  if (index !== -1) {
    vendors[index].verified = vendor.verified
    localStorage.setItem('vendors', JSON.stringify(vendors))
  }
  showNotification(`تم ${vendor.verified ? 'تفعيل' : 'تعطيل'} البائع`, 'success')
}

const loadDashboardData = async () => {
  try {
    // Charger les données depuis localStorage
    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
    const customers = JSON.parse(localStorage.getItem('customers') || '[]')
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')

    // Charger les produits sponsorisés
    await productStore.fetchSponsoredProducts()
    const sponsoredCount = productStore.sponsoredProducts?.length || 0

    // Calculer les statistiques
    stats.value = {
      totalUsers: customers.length,
      totalVendors: vendors.length,
      totalProducts: posts.length + pendingPosts.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      sponsoredProducts: sponsoredCount,
    }

    // Récents ordres
    recentOrders.value = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => ({
        ...order,
        customerName: order.customer?.fullName || 'عميل',
      }))

    // Récents vendeurs
    recentVendors.value = vendors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const initCharts = () => {
  if (!ordersChart.value || !categoriesChart.value) return

  // Données mensuelles
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
  const ordersData = [65, 59, 80, 81, 56, 55]

  // Graphique des commandes
  new Chart(ordersChart.value, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'عدد الطلبات',
          data: ordersData,
          borderColor: '#08717f',
          backgroundColor: 'rgba(8, 113, 127, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  })

  // Graphique des catégories
  new Chart(categoriesChart.value, {
    type: 'doughnut',
    data: {
      labels: ['فخار', 'منسوجات', 'مجوهرات', 'خشب', 'جلود'],
      datasets: [
        {
          data: [30, 25, 20, 15, 10],
          backgroundColor: ['#08717f', '#d40025', '#10b981', '#fbbf24', '#8b5cf6'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  })
}

// ===== LIFECYCLE =====
onMounted(() => {
  // Vérifier si l'utilisateur est admin
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }

  loadDashboardData()

  // Initialiser les graphiques après le rendu
  setTimeout(() => {
    initCharts()
  }, 100)
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: 'Cairo', sans-serif;
}

.admin-container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.admin-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.admin-sidebar.collapsed .nav-text,
.admin-sidebar.collapsed .sidebar-subtitle,
.admin-sidebar.collapsed .sidebar-title {
  display: none;
}

.sidebar-header {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 5px;
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-subtitle {
  font-size: 0.85rem;
  opacity: 0.7;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  border-right: 3px solid transparent;
  width: 100%;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  text-align: right;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(8, 113, 127, 0.2);
  color: white;
  border-right-color: #d40025;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  flex: 1;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 15px 20px;
}

.logout-btn {
  color: #f87171;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.1);
}

/* Main Content */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.main-header {
  background: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #1e293b;
}

.page-title {
  font-size: 1.3rem;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 15px;
  background: #f8fafc;
  border-radius: 40px;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.admin-role {
  font-size: 0.75rem;
  color: #64748b;
}

/* Content */
.content-wrapper {
  padding: 30px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card.mini {
  max-width: 300px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-icon.users {
  background: #e0f2f1;
  color: #08717f;
}

.stat-icon.vendors {
  background: #ffe8ed;
  color: #d40025;
}

.stat-icon.products {
  background: #e0f2fe;
  color: #0284c7;
}

.stat-icon.orders {
  background: #fef3c7;
  color: #b45309;
}

.stat-icon.revenue {
  background: #d1fae5;
  color: #059669;
}

.stat-icon.sponsored {
  background: #fef9c3;
  color: #ca8a04;
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 5px;
  line-height: 1;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Recent Orders */
.recent-orders,
.recent-vendors {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
}

.section-title {
  font-size: 1.1rem;
  color: #1e293b;
}

.view-all-link {
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Tables */
.table-responsive {
  overflow-x: auto;
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
  font-size: 0.9rem;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 15px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background: #cce5ff;
  color: #004085;
}

.status-badge.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.delivered,
.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.action-btn {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin: 0 3px;
  transition: all 0.3s ease;
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

/* Vendors Grid */
.vendors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.vendor-card:hover {
  background: white;
  border-color: #08717f;
  transform: translateY(-2px);
}

.vendor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 3px;
  font-weight: 700;
}

.vendor-owner {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 3px;
}

.vendor-products {
  font-size: 0.75rem;
  color: #08717f;
  font-weight: 600;
}

.vendor-actions {
  display: flex;
  gap: 5px;
}

.icon-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #08717f;
  color: white;
  transform: scale(1.1);
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
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .vendors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    right: -280px;
    height: 100vh;
    z-index: 1000;
    transition: right 0.3s ease;
  }

  .admin-sidebar:not(.collapsed) {
    right: 0;
  }

  .menu-toggle {
    display: block;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .vendors-grid {
    grid-template-columns: 1fr;
  }

  .main-header {
    padding: 15px 20px;
  }

  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .admin-profile .admin-info {
    display: none;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
