<!-- src/views/admin/Dashboard.vue - VERSION CORRIGÉE AVEC DONNÉES DE DÉMO ET AMIRI -->
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
  // Sauvegarder dans localStorage si vide
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
    // Initialiser les données de démo si nécessaire
    initializeDemoData()

    // Charger depuis localStorage
    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
    const customers = JSON.parse(localStorage.getItem('customers') || '[]')
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const pendingPosts = JSON.parse(localStorage.getItem('pending_posts') || '[]')
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')

    // Calculer les statistiques
    stats.value = {
      totalUsers: customers.length,
      totalVendors: vendors.length,
      totalProducts: posts.length + pendingPosts.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    }

    // Commandes récentes (5 dernières)
    recentOrders.value = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    // Vendeurs récents (4 derniers)
    recentVendors.value = vendors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)

    console.log('✅ Dashboard chargé:', {
      users: stats.value.totalUsers,
      vendors: stats.value.totalVendors,
      products: stats.value.totalProducts,
      orders: stats.value.totalOrders,
      revenue: stats.value.totalRevenue
    })
  } catch (error) {
    console.error('❌ Erreur chargement dashboard:', error)
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  loadDashboardData()
})
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.admin-dashboard-content {
  font-family: 'Amiri', 'Cairo', serif;
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.admin-dashboard-content * {
  font-family: 'Amiri', 'Cairo', serif;
}

.admin-dashboard-content.dark-mode {
  background: #0f172a;
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.dark-mode .stat-card {
  background: #1e293b;
  border-color: #334155;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e0f2f1, #c5e8e7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.dark-mode .stat-icon {
  background: linear-gradient(135deg, #0a94a6, #08717f);
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 6px;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
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
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dark-mode .section-title {
  color: #f1f5f9;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.dark-mode .view-all-link {
  color: #2dd4bf;
}

.view-all-link:hover {
  gap: 12px;
  color: #d40025;
}

.dark-mode .view-all-link:hover {
  color: #ff6b6b;
}

.arrow {
  font-size: 1.2rem;
}

/* ===== RECENT ORDERS ===== */
.recent-orders {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.dark-mode .recent-orders {
  background: #1e293b;
  border-color: #334155;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 16px 12px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #0f172a;
  color: #94a3b8;
  border-bottom-color: #334155;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 0.95rem;
}

.dark-mode .data-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.order-id {
  font-weight: 700;
  color: #08717f;
}

.dark-mode .order-id {
  color: #2dd4bf;
}

.order-amount {
  font-weight: 700;
  color: #d40025;
}

.dark-mode .order-amount {
  color: #ff6b6b;
}

.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.dark-mode .status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-badge.processing {
  background: #dbeafe;
  color: #2563eb;
}

.dark-mode .status-badge.processing {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

.status-badge.shipped {
  background: #e0e7ff;
  color: #4f46e5;
}

.dark-mode .status-badge.shipped {
  background: rgba(79, 70, 229, 0.2);
  color: #a78bfa;
}

.status-badge.delivered,
.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.dark-mode .status-badge.delivered,
.dark-mode .status-badge.completed {
  background: rgba(5, 150, 105, 0.2);
  color: #34d399;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.dark-mode .status-badge.cancelled {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
}

.empty-table {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1rem;
}

/* ===== RECENT VENDORS ===== */
.recent-vendors {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.dark-mode .recent-vendors {
  background: #1e293b;
  border-color: #334155;
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.dark-mode .vendor-card {
  background: #0f172a;
}

.vendor-card:hover {
  background: white;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.dark-mode .vendor-card:hover {
  background: #1e293b;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.vendor-avatar-wrapper {
  position: relative;
}

.vendor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .vendor-avatar {
  border-color: #1e293b;
}

.vendor-verified {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border: 2px solid white;
}

.dark-mode .vendor-verified {
  border-color: #0f172a;
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.dark-mode .vendor-name {
  color: #f1f5f9;
}

.vendor-owner {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 8px 0;
}

.dark-mode .vendor-owner {
  color: #94a3b8;
}

.vendor-stats {
  display: flex;
}

.vendor-products {
  font-size: 0.8rem;
  color: #08717f;
  font-weight: 600;
  background: #e0f2f1;
  padding: 4px 12px;
  border-radius: 20px;
}

.dark-mode .vendor-products {
  background: rgba(8, 113, 127, 0.2);
  color: #2dd4bf;
}

.empty-vendors {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #64748b;
  font-size: 1.1rem;
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

@media (max-width: 900px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-dashboard-content {
    padding: 16px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .vendors-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .vendor-card {
    flex-direction: column;
    text-align: center;
  }
}
/* ===== BASE STYLES ===== */
.admin-dashboard-content {
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* Dark mode */
.admin-dashboard-content.dark-mode {
  background: #0f172a;
}

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  transition: color 0.3s ease;
}

.dark-mode .section-title {
  color: #f3f4f6;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 6px;
  transition: color 0.3s ease;
}

.dark-mode .section-subtitle {
  color: #9ca3af;
}

.view-all-link {
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  color: #d40025;
  gap: 10px;
}

.dark-mode .view-all-link {
  color: #2dd4bf;
}

.dark-mode .view-all-link:hover {
  color: #f87171;
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.dark-mode .stat-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.dark-mode .stat-icon {
  background: rgba(2, 132, 199, 0.2);
}

.stat-info {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.dark-mode .stat-value {
  color: #f3f4f6;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  transition: color 0.3s ease;
}

.dark-mode .stat-label {
  color: #9ca3af;
}

/* ===== OFFERS SECTION ===== */
.offers-management-section {
  margin-bottom: 40px;
}

.btn-add {
  padding: 10px 24px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.offer-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-mode .offer-card {
  background: #1f2937;
  border-color: #374151;
}

.offer-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
}

.offer-card.inactive {
  opacity: 0.7;
}

.offer-card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.offer-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.offer-card:hover .offer-card-image img {
  transform: scale(1.05);
}

.offer-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #d40025, #b0001f);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 1;
}

.offer-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.offer-status.active {
  background: rgba(16, 185, 129, 0.9);
}

.offer-status.inactive {
  background: rgba(239, 68, 68, 0.9);
}

.offer-card-content {
  padding: 20px;
}

.offer-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.dark-mode .offer-card-title {
  color: #f3f4f6;
}

.offer-card-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px 0;
  transition: color 0.3s ease;
}

.dark-mode .offer-card-desc {
  color: #9ca3af;
}

.offer-card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.price-current {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d40025;
}

.price-old {
  font-size: 0.8rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.offer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.offer-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.dark-mode .offer-tag {
  background: #374151;
  color: #9ca3af;
}

.offer-card-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  margin-top: 8px;
}

.dark-mode .offer-card-actions {
  border-top-color: #374151;
}

.action-btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn-icon.edit {
  background: #e0f2fe;
  color: #0284c7;
}

.dark-mode .action-btn-icon.edit {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

.action-btn-icon.edit:hover {
  background: #0284c7;
  color: white;
  transform: translateY(-2px);
}

.action-btn-icon.delete {
  background: #fee2e2;
  color: #dc2626;
}

.dark-mode .action-btn-icon.delete {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
}

.action-btn-icon.delete:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-2px);
}

.action-btn-icon.toggle {
  background: #fef3c7;
  color: #d97706;
}

.dark-mode .action-btn-icon.toggle {
  background: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
}

.action-btn-icon.toggle:hover {
  background: #d97706;
  color: white;
  transform: translateY(-2px);
}

/* ===== RECENT ORDERS ===== */
.recent-orders {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-mode .recent-orders {
  background: #1f2937;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 16px 12px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #374151;
  color: #9ca3af;
  border-bottom-color: #4b5563;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 0.9rem;
}

.dark-mode .data-table td {
  border-bottom-color: #374151;
  color: #e5e7eb;
}

.order-id {
  font-weight: 700;
  color: #08717f;
}

.dark-mode .order-id {
  color: #2dd4bf;
}

.order-amount {
  font-weight: 600;
  color: #0f172a;
}

.dark-mode .order-amount {
  color: #f3f4f6;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
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

.status-badge.processing {
  background: #cce5ff;
  color: #004085;
}

.dark-mode .status-badge.processing {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-badge.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.dark-mode .status-badge.shipped {
  background: rgba(6, 182, 212, 0.2);
  color: #67e8f9;
}

.status-badge.delivered,
.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.delivered,
.dark-mode .status-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-badge.cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* ===== RECENT VENDORS ===== */
.recent-vendors {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-mode .recent-vendors {
  background: #1f2937;
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.vendor-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.dark-mode .vendor-card {
  background: #374151;
}

.vendor-card:hover {
  background: white;
  border-color: #e2e8f0;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.dark-mode .vendor-card:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.vendor-avatar-wrapper {
  position: relative;
}

.vendor-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vendor-verified {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #10b981;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  font-size: 1rem;
  color: #0f172a;
  margin: 0 0 4px 0;
  font-weight: 700;
  transition: color 0.3s ease;
}

.dark-mode .vendor-name {
  color: #f3f4f6;
}

.vendor-owner {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.dark-mode .vendor-owner {
  color: #9ca3af;
}

.vendor-stats {
  display: flex;
  gap: 12px;
}

.vendor-products {
  font-size: 0.7rem;
  color: #08717f;
  font-weight: 600;
  background: #e0f2fe;
  padding: 2px 8px;
  border-radius: 20px;
}

.dark-mode .vendor-products {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.dark-mode .icon-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #9ca3af;
}

.icon-btn:hover {
  background: #08717f;
  color: white;
  border-color: #08717f;
  transform: translateY(-2px);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

.modal-content.dark-mode {
  background: #1f2937;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #374151;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #0f172a;
  margin: 0;
}

.dark-mode .modal-header h3 {
  color: #f3f4f6;
}

.modal-close {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.dark-mode .modal-close {
  background: #374151;
  color: #9ca3af;
}

.modal-close:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.dark-mode .form-label {
  color: #f3f4f6;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.dark-mode .form-input,
.dark-mode .form-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.image-upload-area {
  width: 100%;
  height: 140px;
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  cursor: pointer;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.dark-mode .image-upload-area {
  border-color: #4b5563;
  background: #374151;
}

.image-upload-area:hover {
  border-color: #08717f;
  background: #f1f5f9;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-row-checkbox {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #475569;
  font-size: 0.9rem;
}

.dark-mode .checkbox-label {
  color: #9ca3af;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #08717f;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.dark-mode .btn-cancel {
  background: #374151;
  color: #9ca3af;
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
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.empty-state,
.empty-vendors {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 24px;
}

.dark-mode .empty-state,
.dark-mode .empty-vendors {
  background: #1f2937;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.dark-mode .empty-state p {
  color: #9ca3af;
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .offers-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 992px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  .vendors-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .offers-grid {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .vendors-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row-checkbox {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .recent-orders,
  .recent-vendors {
    padding: 16px;
  }

  .data-table th,
  .data-table td {
    padding: 12px 8px;
    font-size: 0.8rem;
  }

  .offer-card-title {
    font-size: 1rem;
  }
}
</style>
