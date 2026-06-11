<!-- src/views/Orders.vue - Version complète et corrigée -->
<template>
  <div class="orders-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">الرئيسية</router-link>
        <span class="separator">›</span>
        <span class="current">طلباتي</span>
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" stroke-linecap="round" />
            </svg>
          </div>
          <div>
            <h1 class="page-title">طلباتي</h1>
            <p class="page-subtitle">تتبع حالة طلباتك وعمليات الشراء</p>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-value">{{ orders.length }}</span>
            <span class="stat-label">إجمالي الطلبات</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-label">قيد الانتظار</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ deliveredCount }}</span>
            <span class="stat-label">تم التوصيل</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            <span class="filter-icon">{{ filter.icon }}</span>
            <span class="filter-label">{{ filter.label }}</span>
            <span v-if="getFilterCount(filter.value) > 0" class="filter-count">{{ getFilterCount(filter.value) }}</span>
          </button>
        </div>

        <div class="filter-actions">
          <button class="refresh-btn" @click="loadOrders" :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{ spinning: loading }">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>جاري تحميل الطلبات...</p>
      </div>

      <!-- Orders List -->
      <div v-else-if="filteredOrders.length > 0" class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'order-expanded': expandedOrder === order.id }"
        >
          <!-- Order Header -->
          <div class="order-header" @click="toggleOrder(order.id)">
            <div class="order-main-info">
              <div class="order-number-wrapper">
                <span class="order-icon">📦</span>
                <span class="order-number">طلب #{{ order.orderNumber || order.id }}</span>
              </div>
              <div class="order-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ formatDate(order.createdAt) }}</span>
              </div>
            </div>

            <div class="order-status-wrapper">
              <span class="order-status" :class="order.status">
                <span class="status-dot"></span>
                {{ getOrderStatusText(order.status) }}
              </span>
              <span class="order-total">{{ formatPrice(order.total) }} د.ت</span>
            </div>

            <button class="expand-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{ rotated: expandedOrder === order.id }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          <!-- Order Details (Expanded) -->
          <transition name="slide-down">
            <div v-if="expandedOrder === order.id" class="order-details">
              <!-- Progress Tracker -->
              <div class="order-progress">
                <div class="progress-steps">
                  <div
                    v-for="(step, index) in orderSteps"
                    :key="step.key"
                    class="progress-step"
                    :class="{
                      completed: isStepCompleted(order.status, step.key),
                      active: isStepActive(order.status, step.key)
                    }"
                  >
                    <div class="step-icon">
                      <svg v-if="isStepCompleted(order.status, step.key)" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span v-else>{{ index + 1 }}</span>
                    </div>
                    <span class="step-label">{{ step.label }}</span>
                  </div>
                </div>
                <div class="progress-line">
                  <div class="progress-fill" :style="{ width: getProgressWidth(order.status) }"></div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="order-items">
                <h4 class="section-title">المنتجات</h4>
                <div class="items-list">
                  <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                    <div class="item-image">
                      <img
                        :src="item.image || 'https://placehold.co/80x80/08717f/white?text=منتج'"
                        :alt="item.name"
                        @error="handleItemImageError"
                      />
                    </div>
                    <div class="item-details">
                      <h5 class="item-name">{{ item.name || item.productName }}</h5>
                      <div class="item-meta">
                        <span v-if="item.size" class="item-size">المقاس: {{ item.size }}</span>
                        <span v-if="item.color" class="item-color">
                          اللون:
                          <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
                          {{ item.colorName || item.color }}
                        </span>
                      </div>
                      <div class="item-price-qty">
                        <span class="item-price">{{ formatPrice(item.price) }} د.ت</span>
                        <span class="item-quantity">الكمية: {{ item.quantity }}</span>
                      </div>
                    </div>
                    <div class="item-total">
                      {{ formatPrice((item.price || 0) * (item.quantity || 1)) }} د.ت
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="order-summary">
                <div class="summary-row">
                  <span>المجموع الفرعي</span>
                  <span>{{ formatPrice(order.subtotal || order.total) }} د.ت</span>
                </div>
                <div class="summary-row" v-if="order.shippingCost > 0">
                  <span>تكلفة التوصيل</span>
                  <span>{{ formatPrice(order.shippingCost) }} د.ت</span>
                </div>
                <div class="summary-row" v-if="order.discount > 0">
                  <span>الخصم</span>
                  <span class="discount">-{{ formatPrice(order.discount) }} د.ت</span>
                </div>
                <div class="summary-row total">
                  <span>الإجمالي</span>
                  <span>{{ formatPrice(order.total) }} د.ت</span>
                </div>
              </div>

              <!-- Shipping Info -->
              <div class="shipping-info" v-if="order.shippingAddress">
                <h4 class="section-title">معلومات التوصيل</h4>
                <div class="shipping-details">
                  <div class="shipping-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{{ order.shippingAddress.fullName || order.customerName }}</span>
                  </div>
                  <div class="shipping-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8 10a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <span>{{ order.customerPhone || order.customerPhone1 || 'غير متوفر' }}</span>
                  </div>
                  <div class="shipping-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{{ order.shippingAddress.address || order.address }}, {{ order.governorate || '' }} {{ order.delegation || '' }}</span>
                  </div>
                </div>
              </div>

              <!-- Order Actions -->
              <div class="order-actions">
                <button class="action-btn secondary" @click="contactSupport(order)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                  <span>تواصل مع الدعم</span>
                </button>
                <button
                  v-if="order.status === 'delivered' && !order.reviewed"
                  class="action-btn primary"
                  @click="writeReview(order)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>كتابة تقييم</span>
                </button>
                <button
                  v-if="order.status === 'pending' || order.status === 'processing'"
                  class="action-btn danger"
                  @click="cancelOrder(order)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                  </svg>
                  <span>إلغاء الطلب</span>
                </button>
                <button
                  v-if="order.status === 'shipped'"
                  class="action-btn success"
                  @click="trackOrder(order)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>تتبع الشحنة</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" stroke-linecap="round" />
          </svg>
        </div>
        <h2>لا توجد طلبات بعد</h2>
        <p>لم تقم بأي طلب حتى الآن. ابدأ التسوق واكتشف منتجاتنا المميزة!</p>
        <router-link to="/products" class="shop-now-btn">
          <span>تسوق الآن</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <transition name="modal-fade">
      <div v-if="showCancelModal" class="modal-overlay" @click.self="showCancelModal = false">
        <div class="modal-container">
          <div class="modal-header">
            <h3>إلغاء الطلب</h3>
            <button class="close-modal" @click="showCancelModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>هل أنت متأكد من رغبتك في إلغاء الطلب #{{ orderToCancel?.orderNumber || orderToCancel?.id }}؟</p>
            <div class="form-group">
              <label>سبب الإلغاء (اختياري)</label>
              <select v-model="cancelReason" class="form-select">
                <option value="">اختر سبب الإلغاء</option>
                <option value="changed_mind">غيرت رأيي</option>
                <option value="found_better_price">وجدت سعراً أفضل</option>
                <option value="shipping_delay">تأخر في التوصيل</option>
                <option value="other">سبب آخر</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="cancel-btn" @click="showCancelModal = false">تراجع</button>
              <button class="confirm-btn" @click="confirmCancelOrder" :disabled="cancelling">
                <span v-if="!cancelling">تأكيد الإلغاء</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast-slide">
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
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(true)
const orders = ref([])
const expandedOrder = ref(null)
const activeFilter = ref('all')
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const cancelReason = ref('')
const cancelling = ref(false)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// Filters
const filters = [
  { value: 'all', label: 'الكل', icon: '📋' },
  { value: 'pending', label: 'قيد الانتظار', icon: '⏳' },
  { value: 'processing', label: 'قيد المعالجة', icon: '🔄' },
  { value: 'shipped', label: 'تم الشحن', icon: '📮' },
  { value: 'delivered', label: 'تم التوصيل', icon: '✅' },
  { value: 'cancelled', label: 'ملغي', icon: '❌' }
]

// Order progress steps
const orderSteps = [
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'processing', label: 'قيد المعالجة' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivered', label: 'تم التوصيل' }
]

// Computed
const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  return orders.value.filter(order => order.status === activeFilter.value)
})

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length)
const deliveredCount = computed(() => orders.value.filter(o => o.status === 'delivered').length)

const getFilterCount = (filterValue) => {
  if (filterValue === 'all') return orders.value.length
  return orders.value.filter(o => o.status === filterValue).length
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)

const getOrderStatusText = (status) => {
  const map = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  }
  return map[status] || status
}

const isStepCompleted = (orderStatus, stepKey) => {
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(orderStatus)
  const stepIndex = statusOrder.indexOf(stepKey)
  return stepIndex < currentIndex
}

const isStepActive = (orderStatus, stepKey) => {
  return orderStatus === stepKey
}

const getProgressWidth = (orderStatus) => {
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const index = statusOrder.indexOf(orderStatus)
  if (index === -1) return '0%'
  return `${(index / (statusOrder.length - 1)) * 100}%`
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const handleItemImageError = (e) => {
  e.target.src = 'https://placehold.co/80x80/08717f/white?text=منتج'
}

// Actions
const toggleOrder = (orderId) => {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}

// ✅ LOAD ORDERS - avec fallback localStorage
const loadOrders = async () => {
  loading.value = true
  try {
    const response = await api.get('/orders/my-orders')
    if (response.data.success) {
      const apiOrders = response.data.data || response.data.orders || []
      orders.value = apiOrders.map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : (order.order_items || []),
        shippingAddress: order.shippingAddress || order.address,
        customerName: order.customerName || order.customer_name,
        customerPhone: order.customerPhone || order.customerPhone1,
        customerEmail: order.customerEmail || order.customer_email
      }))
      console.log('✅ Orders loaded from API:', orders.value.length)

      // Sauvegarder dans localStorage
      localStorage.setItem('userOrders', JSON.stringify(orders.value))
    } else {
      throw new Error('Invalid response')
    }
  } catch (error) {
    console.error('Error loading orders from API:', error)

    // ✅ Fallback: Charger depuis localStorage
    const localOrders = localStorage.getItem('userOrders')
    if (localOrders) {
      try {
        orders.value = JSON.parse(localOrders)
        console.log('📦 Orders loaded from localStorage:', orders.value.length)
        showNotification('📦 تم تحميل الطلبات من التخزين المحلي', 'info')
      } catch (e) {
        orders.value = []
      }
    } else {
      orders.value = []
      showNotification('❌ فشل تحميل الطلبات', 'error')
    }
  } finally {
    loading.value = false
  }
}

const contactSupport = (order) => {
  router.push(`/contact?order=${order.id}`)
}

const writeReview = (order) => {
  router.push(`/orders/${order.id}/review`)
}

const trackOrder = (order) => {
  if (order.trackingNumber) {
    window.open(`https://www.rapidposte.tn/suivi/${order.trackingNumber}`, '_blank')
  } else {
    showNotification('🔍 رقم التتبع غير متوفر بعد', 'info')
  }
}

const cancelOrder = (order) => {
  orderToCancel.value = order
  showCancelModal.value = true
}

// ✅ CONFIRM CANCEL ORDER - avec fallback localStorage
const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return

  cancelling.value = true
  try {
    const response = await api.put(`/orders/${orderToCancel.value.id}/cancel`, {
      reason: cancelReason.value || 'طلب من العميل'
    })

    if (response.data.success) {
      const index = orders.value.findIndex(o => o.id === orderToCancel.value.id)
      if (index !== -1) {
        orders.value[index].status = 'cancelled'
      }
      // Sauvegarder dans localStorage
      localStorage.setItem('userOrders', JSON.stringify(orders.value))
      showNotification('✅ تم إلغاء الطلب بنجاح', 'success')
      showCancelModal.value = false
      cancelReason.value = ''
    } else {
      throw new Error('API returned error')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)

    // ✅ Fallback: Mise à jour locale uniquement
    const index = orders.value.findIndex(o => o.id === orderToCancel.value.id)
    if (index !== -1) {
      orders.value[index].status = 'cancelled'
      // Sauvegarder dans localStorage
      localStorage.setItem('userOrders', JSON.stringify(orders.value))
      showNotification('✅ تم إلغاء الطلب محلياً', 'success')
      showCancelModal.value = false
      cancelReason.value = ''
    } else {
      showNotification('❌ فشل إلغاء الطلب', 'error')
    }
  } finally {
    cancelling.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadOrders()
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');

/* ===== BASE STYLES ===== */
.orders-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 30px 0 60px;
  font-family: 'Amiri', 'Cairo', sans-serif;
  direction: rtl;
}

.orders-page * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.orders-page.dark-mode {
  background: #0f172a;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  font-size: 15px;
  color: #64748b;
}

.breadcrumb a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #08717f;
}

.separator {
  color: #cbd5e1;
  font-size: 18px;
}

.current {
  color: #1e293b;
  font-weight: 700;
}

.dark-mode .current {
  color: #f1f5f9;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.dark-mode .page-header {
  background: #1e293b;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.1), rgba(211, 0, 37, 0.1));
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #08717f;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 5px;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.stats-summary {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #08717f;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .filter-tab {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.filter-tab:hover {
  border-color: #08717f;
  color: #08717f;
}

.filter-tab.active {
  background: #08717f;
  border-color: #08717f;
  color: white;
}

.filter-icon {
  font-size: 16px;
}

.filter-count {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.filter-tab.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .refresh-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.refresh-btn:hover {
  border-color: #08717f;
  color: #08717f;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px;
  background: white;
  border-radius: 24px;
}

.dark-mode .loading-state {
  background: #1e293b;
}

.loading-state p {
  font-size: 16px;
  color: #64748b;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-top-color: #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  border: 1px solid #f1f5f9;
}

.dark-mode .order-card {
  background: #1e293b;
  border-color: #334155;
}

.order-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* Order Header */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  cursor: pointer;
  transition: background 0.2s;
}

.order-header:hover {
  background: #fafbfc;
}

.dark-mode .order-header:hover {
  background: #1a2533;
}

.order-main-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-number-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-icon {
  font-size: 24px;
}

.order-number {
  font-weight: 700;
  font-size: 17px;
  color: #1e293b;
}

.dark-mode .order-number {
  color: #f1f5f9;
}

.order-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.order-status-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.order-status.pending {
  background: #fef3c7;
  color: #d97706;
}
.order-status.pending .status-dot {
  background: #d97706;
}

.order-status.processing {
  background: #dbeafe;
  color: #2563eb;
}
.order-status.processing .status-dot {
  background: #2563eb;
}

.order-status.shipped {
  background: #e0e7ff;
  color: #4f46e5;
}
.order-status.shipped .status-dot {
  background: #4f46e5;
}

.order-status.delivered {
  background: #d1fae5;
  color: #059669;
}
.order-status.delivered .status-dot {
  background: #059669;
}

.order-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
}
.order-status.cancelled .status-dot {
  background: #dc2626;
}

.order-total {
  font-weight: 700;
  font-size: 17px;
  color: #d30025;
}

.expand-btn {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dark-mode .expand-btn {
  background: #334155;
}

.expand-btn:hover {
  background: #e2e8f0;
}

.expand-btn svg {
  transition: transform 0.3s;
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

/* Order Details */
.order-details {
  padding: 0 25px 25px;
  border-top: 1px solid #f1f5f9;
}

.dark-mode .order-details {
  border-top-color: #334155;
}

/* Progress Tracker */
.order-progress {
  padding: 30px 0;
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-icon {
  width: 36px;
  height: 36px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  transition: all 0.3s;
}

.dark-mode .step-icon {
  background: #1e293b;
  border-color: #334155;
}

.progress-step.completed .step-icon {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.progress-step.active .step-icon {
  background: #08717f;
  border-color: #08717f;
  color: white;
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.2);
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.progress-step.active .step-label,
.progress-step.completed .step-label {
  color: #1e293b;
  font-weight: 600;
}

.dark-mode .progress-step.active .step-label,
.dark-mode .progress-step.completed .step-label {
  color: #f1f5f9;
}

.progress-line {
  position: absolute;
  top: 18px;
  left: 12%;
  right: 12%;
  height: 3px;
  background: #e2e8f0;
  z-index: 1;
}

.dark-mode .progress-line {
  background: #334155;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #08717f, #10b981);
  transition: width 0.5s ease;
}

/* Order Items */
.order-items {
  margin: 20px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
}

.dark-mode .section-title {
  color: #f1f5f9;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
}

.dark-mode .order-item {
  background: #0f172a;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
}

.dark-mode .item-name {
  color: #f1f5f9;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 4px;
  vertical-align: middle;
}

.item-price-qty {
  display: flex;
  gap: 16px;
}

.item-price {
  font-weight: 600;
  color: #d30025;
}

.item-quantity {
  color: #64748b;
}

.item-total {
  font-weight: 700;
  font-size: 17px;
  color: #1e293b;
}

.dark-mode .item-total {
  color: #f1f5f9;
}

/* Order Summary */
.order-summary {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin: 20px 0;
}

.dark-mode .order-summary {
  background: #0f172a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 15px;
  color: #64748b;
}

.summary-row.total {
  border-top: 1px solid #e2e8f0;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .summary-row.total {
  border-top-color: #334155;
  color: #f1f5f9;
}

.discount {
  color: #10b981;
}

/* Shipping Info */
.shipping-info {
  margin: 20px 0;
}

.shipping-details {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}

.dark-mode .shipping-details {
  background: #0f172a;
}

.shipping-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #475569;
  font-size: 15px;
}

.dark-mode .shipping-row {
  color: #cbd5e1;
}

/* Order Actions */
.order-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.dark-mode .order-actions {
  border-top-color: #334155;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.primary {
  background: #08717f;
  color: white;
}

.action-btn.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.success {
  background: #d1fae5;
  color: #059669;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 24px;
}

.dark-mode .empty-state {
  background: #1e293b;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.dark-mode .empty-state h2 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 30px;
  font-size: 17px;
}

.shop-now-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 700;
  font-size: 18px;
  transition: all 0.3s;
}

.shop-now-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(8, 113, 127, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
}

.dark-mode .modal-container {
  background: #1e293b;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #f1f5f9;
}

.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.close-modal {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.close-modal:hover {
  background: #d30025;
  color: white;
}

.modal-body {
  padding: 25px;
}

.modal-body p {
  margin: 0 0 20px;
  color: #475569;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .form-group label {
  color: #f1f5f9;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
}

.dark-mode .form-select {
  background: #0f172a;
  border-color: #334155;
  color: white;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.cancel-btn {
  background: #f1f5f9;
  border: none;
  color: #475569;
}

.confirm-btn {
  background: #dc2626;
  border: none;
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #1e293b;
  border-radius: 40px;
  color: white;
  z-index: 2000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.toast-message {
  font-size: 15px;
}

.toast-notification.success {
  background: #059669;
}

.toast-notification.error {
  background: #dc2626;
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .stats-summary {
    width: 100%;
    justify-content: space-around;
  }

  .filter-tabs {
    width: 100%;
    justify-content: center;
  }

  .filter-tab {
    padding: 8px 14px;
    font-size: 13px;
  }

  .filter-label {
    display: none;
  }

  .order-header {
    flex-wrap: wrap;
    gap: 15px;
  }

  .order-main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-status-wrapper {
    width: 100%;
    justify-content: space-between;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 15px;
  }

  .progress-line {
    display: none;
  }

  .order-item {
    flex-wrap: wrap;
  }

  .item-total {
    width: 100%;
    text-align: left;
    margin-top: 10px;
  }

  .order-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 26px;
  }

  .stats-summary {
    gap: 15px;
  }

  .stat-value {
    font-size: 20px;
  }

  .filter-tab {
    padding: 8px 12px;
  }
}

/* Dark mode styles */
.orders-page.dark-mode {
  background: #161627 !important;
}

.orders-page.dark-mode .breadcrumb a {
  color: #94a3b8 !important;
}

.orders-page.dark-mode .breadcrumb a:hover {
  color: #2dd4bf !important;
}

.orders-page.dark-mode .page-header {
  background: #1e1e30 !important;
}

.orders-page.dark-mode .page-title {
  color: #f1f5f9 !important;
}

.orders-page.dark-mode .stat-value {
  color: #2dd4bf !important;
}

.orders-page.dark-mode .stat-label {
  color: #94a3b8 !important;
}

.orders-page.dark-mode .filter-tab {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
  color: #94a3b8 !important;
}

.orders-page.dark-mode .filter-tab.active {
  background: #08717f !important;
  color: white !important;
}

.orders-page.dark-mode .order-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.orders-page.dark-mode .order-number {
  color: #f1f5f9 !important;
}

.orders-page.dark-mode .order-total {
  color: #ef4444 !important;
}

.orders-page.dark-mode .order-status.pending {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
}

.orders-page.dark-mode .order-status.processing {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
}

.orders-page.dark-mode .order-status.shipped {
  background: rgba(139, 92, 246, 0.15) !important;
  color: #a78bfa !important;
}

.orders-page.dark-mode .order-status.delivered {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.orders-page.dark-mode .order-status.cancelled {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

.orders-page.dark-mode .modal-container {
  background: #1e1e30 !important;
}

.orders-page.dark-mode .close-modal {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.orders-page.dark-mode .close-modal:hover {
  background: #ef4444 !important;
  color: white !important;
}

.orders-page.dark-mode .form-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.orders-page.dark-mode .cancel-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.orders-page.dark-mode .empty-state {
  background: #1e1e30 !important;
}

.orders-page.dark-mode .empty-state h2 {
  color: #f1f5f9 !important;
}

.orders-page.dark-mode .toast-notification {
  background: #1e1e30 !important;
}
</style>
