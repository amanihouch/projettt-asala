<!-- src/views/admin/Dashboard.vue - VERSION CORRIGÉE AVEC MODE SOMBRE UNIFIÉ -->
<template>
  <div class="admin-dashboard-content" :class="{ 'dark-mode': isDarkMode }">
    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalUsers) }}</span>
          <span class="stat-label">إجمالي المستخدمين</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏪</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalVendors) }}</span>
          <span class="stat-label">إجمالي البائعين</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalProducts) }}</span>
          <span class="stat-label">إجمالي المنتجات</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalOrders) }}</span>
          <span class="stat-label">إجمالي الطلبات</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <span class="stat-value">{{ formatPrice(stats.totalRevenue) }}</span>
          <span class="stat-label">إجمالي الإيرادات</span>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-orders">
      <div class="section-header">
        <h3 class="section-title">أحدث الطلبات</h3>
        <router-link to="/admin/orders" class="view-all-link">
          عرض الكل
          <span class="arrow">←</span>
        </router-link>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="order-id">#{{ order.id }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td class="order-amount">{{ formatPrice(order.total) }} د.ت</td>
              <td>
                <span class="status-badge" :class="order.status">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" class="empty-table">لا توجد طلبات حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Vendors -->
    <div class="recent-vendors">
      <div class="section-header">
        <h3 class="section-title">أحدث البائعين</h3>
        <router-link to="/admin/vendors" class="view-all-link">
          عرض الكل
          <span class="arrow">←</span>
        </router-link>
      </div>
      <div class="vendors-grid">
        <div v-for="vendor in recentVendors" :key="vendor.id" class="vendor-card">
          <div class="vendor-avatar-wrapper">
            <img :src="vendor.avatar" :alt="vendor.shopName" class="vendor-avatar" />
            <div class="vendor-verified" v-if="vendor.verified">✓</div>
          </div>
          <div class="vendor-info">
            <h4 class="vendor-name">{{ vendor.shopName }}</h4>
            <p class="vendor-owner">{{ vendor.ownerName }}</p>
            <div class="vendor-stats">
              <span class="vendor-products">{{ vendor.productsCount }} منتج</span>
            </div>
          </div>
        </div>
        <div v-if="recentVendors.length === 0" class="empty-vendors">
          <p>لا يوجد بائعين حالياً</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== DONNÉES DE DÉMONSTRATION =====
const DEMO_VENDORS = [
  {
    id: 1,
    shopName: 'متجر الحرف اليدوية',
    ownerName: 'أحمد بن علي',
    avatar: 'https://i.pravatar.cc/150?img=1',
    verified: true,
    productsCount: 12,
    createdAt: '2024-03-15T10:30:00'
  },
  {
    id: 2,
    shopName: 'المنسوجات التونسية',
    ownerName: 'فاطمة الزهراء',
    avatar: 'https://i.pravatar.cc/150?img=5',
    verified: true,
    productsCount: 8,
    createdAt: '2024-03-10T14:20:00'
  },
  {
    id: 3,
    shopName: 'مجوهرات الأصالة',
    ownerName: 'محمد رضا',
    avatar: 'https://i.pravatar.cc/150?img=3',
    verified: false,
    productsCount: 5,
    createdAt: '2024-03-05T09:15:00'
  },
  {
    id: 4,
    shopName: 'الفخار التقليدي',
    ownerName: 'سامية بن صالح',
    avatar: 'https://i.pravatar.cc/150?img=9',
    verified: true,
    productsCount: 15,
    createdAt: '2024-02-28T16:45:00'
  }
]

const DEMO_ORDERS = [
  {
    id: 'ORD-2024-001',
    customerName: 'كريم محمود',
    total: 156.500,
    status: 'pending',
    createdAt: '2024-03-20T10:30:00'
  },
  {
    id: 'ORD-2024-002',
    customerName: 'ليلى المناعي',
    total: 320.000,
    status: 'processing',
    createdAt: '2024-03-19T15:20:00'
  },
  {
    id: 'ORD-2024-003',
    customerName: 'سفيان الجويني',
    total: 89.900,
    status: 'shipped',
    createdAt: '2024-03-18T09:45:00'
  },
  {
    id: 'ORD-2024-004',
    customerName: 'نور الهدى',
    total: 450.000,
    status: 'delivered',
    createdAt: '2024-03-17T14:10:00'
  },
  {
    id: 'ORD-2024-005',
    customerName: 'ياسين التومي',
    total: 75.500,
    status: 'completed',
    createdAt: '2024-03-16T11:30:00'
  }
]

const DEMO_CUSTOMERS = [
  { id: 1, name: 'كريم محمود', email: 'karim@example.com' },
  { id: 2, name: 'ليلى المناعي', email: 'leila@example.com' },
  { id: 3, name: 'سفيان الجويني', email: 'sofiane@example.com' },
  { id: 4, name: 'نور الهدى', email: 'nour@example.com' },
  { id: 5, name: 'ياسين التومي', email: 'yassine@example.com' },
  { id: 6, name: 'سارة بن علي', email: 'sara@example.com' }
]

const DEMO_POSTS = [
  { id: 1, productName: 'عطر فاخر', price: 150 },
  { id: 2, productName: 'مجوهرات فضة', price: 320 },
  { id: 3, productName: 'سجاد يدوي', price: 450 },
  { id: 4, productName: 'فخار تونسي', price: 89 },
  { id: 5, productName: 'زيت زيتون', price: 45 },
  { id: 6, productName: 'صابون تقليدي', price: 25 },
  { id: 7, productName: 'حنبل', price: 180 },
  { id: 8, productName: 'مرجان', price: 250 }
]

// ===== STATE =====
const stats = ref({
  totalUsers: 0,
  totalVendors: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0
})

const recentOrders = ref([])
const recentVendors = ref([])

// ===== UTILITIES =====
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('ar-TN').format(num)
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0 د.ت'
  return new Intl.NumberFormat('ar-TN').format(price) + ' د.ت'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  }
  return statusMap[status] || status
}

// ===== INITIALISATION DES DONNÉES =====
const initializeDemoData = () => {
  if (!localStorage.getItem('vendors')) {
    localStorage.setItem('vendors', JSON.stringify(DEMO_VENDORS))
  }
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(DEMO_CUSTOMERS))
  }
  if (!localStorage.getItem('posts')) {
    localStorage.setItem('posts', JSON.stringify(DEMO_POSTS))
  }
  if (!localStorage.getItem('pending_posts')) {
    localStorage.setItem('pending_posts', JSON.stringify([]))
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(DEMO_ORDERS))
  }
}

const loadDashboardData = () => {
  try {
    initializeDemoData()

    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
    const customers = JSON.parse(localStorage.getItem('customers') || '[]')
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')

    stats.value = {
      totalUsers: customers.length,
      totalVendors: vendors.length,
      totalProducts: posts.length + pendingPosts.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    }

    recentOrders.value = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    recentVendors.value = vendors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
  } catch (error) {
    console.error('❌ Erreur chargement dashboard:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== BASE ===== */
.admin-dashboard-content {
  font-family: 'Amiri', 'Cairo', serif;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  transition: background 0.3s ease;
}

/* ===== DARK MODE GLOBAL ===== */
.admin-dashboard-content.dark-mode {
  background: #0f172a;
  color: #e2e8f0;
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.dark-mode .stat-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.dark-mode .stat-icon {
  background: #334155;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 4px;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.dark-mode .section-title {
  color: #f1f5f9;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dark-mode .view-all-link {
  color: #60a5fa;
}

/* ===== RECENT ORDERS TABLE ===== */
.recent-orders {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.dark-mode .recent-orders {
  background: #1e293b;
  border-color: #334155;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 12px 16px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #0f172a;
  color: #94a3b8;
  border-bottom-color: #334155;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
}

.dark-mode .data-table td {
  border-bottom-color: #1e293b;
  color: #e2e8f0;
}

.order-id {
  font-weight: 600;
  color: #3b82f6;
}

.dark-mode .order-id {
  color: #60a5fa;
}

.order-amount {
  font-weight: 600;
}

/* Status Badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.dark-mode .status-badge.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-badge.processing {
  background: #dbeafe;
  color: #1e40af;
}

.dark-mode .status-badge.processing {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.status-badge.shipped {
  background: #e0e7ff;
  color: #3730a3;
}

.dark-mode .status-badge.shipped {
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
}

.status-badge.delivered,
.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.dark-mode .status-badge.delivered,
.dark-mode .status-badge.completed {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

/* ===== VENDORS GRID ===== */
.recent-vendors {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.dark-mode .recent-vendors {
  background: #1e293b;
  border-color: #334155;
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.dark-mode .vendor-card {
  background: #0f172a;
}

.vendor-card:hover {
  background: #f1f5f9;
}

.dark-mode .vendor-card:hover {
  background: #1a2332;
}

.vendor-avatar-wrapper {
  position: relative;
}

.vendor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.vendor-verified {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #10b981;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  border: 2px solid white;
}

.dark-mode .vendor-verified {
  border-color: #0f172a;
}

.vendor-name {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.vendor-owner {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 8px 0;
}

.dark-mode .vendor-owner {
  color: #94a3b8;
}

.vendor-products {
  font-size: 0.75rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 9999px;
}

.dark-mode .vendor-products {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}

/* Empty states */
.empty-table,
.empty-vendors {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.dark-mode .empty-table,
.dark-mode .empty-vendors {
  color: #94a3b8;
}

.empty-vendors {
  grid-column: 1 / -1;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
  .vendors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .vendors-grid {
    grid-template-columns: 1fr;
  }
  .admin-dashboard-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
