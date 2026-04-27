<!-- src/views/OrderTracking.vue -->
<template>
  <div class="order-tracking-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <h1 class="page-title">تتبع الطلب</h1>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل معلومات الطلب...</p>
      </div>

      <div v-else-if="order" class="tracking-card">
        <div class="order-header">
          <h2 class="order-number">طلب #{{ order.id }}</h2>
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div class="timeline-item" :class="{ completed: orderStatus >= 1 }">
            <div class="timeline-icon">📦</div>
            <div class="timeline-content">
              <h3>تم استلام الطلب</h3>
              <p>{{ formatDateTime(order.createdAt) }}</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: orderStatus >= 2 }">
            <div class="timeline-icon">⚙️</div>
            <div class="timeline-content">
              <h3>قيد المعالجة</h3>
              <p v-if="order.processingDate">{{ formatDateTime(order.processingDate) }}</p>
              <p v-else class="pending">في انتظار المعالجة</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: orderStatus >= 3 }">
            <div class="timeline-icon">🚚</div>
            <div class="timeline-content">
              <h3>تم الشحن</h3>
              <p v-if="order.shippedDate">{{ formatDateTime(order.shippedDate) }}</p>
              <p v-else class="pending">لم يتم الشحن بعد</p>
            </div>
          </div>

          <div class="timeline-item" :class="{ completed: orderStatus >= 4 }">
            <div class="timeline-icon">✅</div>
            <div class="timeline-content">
              <h3>تم التوصيل</h3>
              <p v-if="order.deliveredDate">{{ formatDateTime(order.deliveredDate) }}</p>
              <p v-else class="pending">في انتظار التوصيل</p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3 class="summary-title">ملخص الطلب</h3>

          <div class="summary-items">
            <div v-for="item in order.items" :key="item.id" class="summary-item">
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p class="item-price">{{ formatPrice(item.price) }} د.ت</p>
                <p class="item-quantity">الكمية: {{ item.quantity }}</p>
              </div>
              <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
            </div>
          </div>

          <div class="summary-totals">
            <div class="total-row">
              <span>المجموع الفرعي</span>
              <span>{{ formatPrice(order.subtotal) }} د.ت</span>
            </div>
            <div class="total-row">
              <span>تكلفة التوصيل</span>
              <span>{{ formatPrice(order.shipping) }} د.ت</span>
            </div>
            <div class="total-row final">
              <span>المجموع الكلي</span>
              <span>{{ formatPrice(order.total) }} د.ت</span>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="delivery-address">
          <h3 class="address-title">
            <span class="icon">📍</span>
            عنوان التوصيل
          </h3>
          <p>{{ order.delivery?.address || 'عنوان غير محدد' }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <router-link to="/profile?tab=orders" class="btn btn-secondary">
            <span class="btn-icon">←</span>
            العودة للطلبات
          </router-link>
          <button class="btn btn-primary" @click="contactSupport">
            <span class="btn-icon">💬</span>
            التواصل مع الدعم
          </button>
        </div>
      </div>

      <div v-else class="not-found">
        <div class="not-found-icon">📭</div>
        <h2>الطلب غير موجود</h2>
        <p>عذراً، لم نتمكن من العثور على الطلب المطلوب</p>
        <router-link to="/" class="btn-home">العودة للرئيسية</router-link>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ===== DARK MODE =====
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

// ===== STATE =====
const loading = ref(true)
const order = ref(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅'
})

// ===== COMPUTED =====
const orderStatus = computed(() => {
  if (!order.value) return 0
  const status = order.value.status
  const statusMap = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    completed: 4,
    cancelled: 0
  }
  return statusMap[status] || 1
})

// ===== UTILS =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const contactSupport = () => {
  router.push('/contact')
  showNotification('📞 جاري تحويلك إلى صفحة الدعم', 'info')
}

// ===== FETCH ORDER =====
const fetchOrder = async () => {
  const orderId = route.params.id
  if (!orderId) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/orders/${orderId}`)
    if (response.data.success) {
      order.value = response.data.data.order || response.data.data
      console.log('✅ Commande chargée depuis API:', order.value.id)
    } else {
      throw new Error('Commande non trouvée')
    }
  } catch (error) {
    console.error('❌ Erreur chargement commande:', error)

    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    order.value = orders.find(o => o.id === parseInt(orderId) || o.id === orderId)

    if (order.value) {
      console.log('✅ Commande chargée depuis localStorage')
    } else {
      console.log('❌ Commande non trouvée')
    }
  } finally {
    loading.value = false
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  }

  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  fetchOrder()
})

onUnmounted(() => {
  document.body.classList.remove('dark-mode')
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI (Optimisé) ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700&display=swap');

/* ===== BASE STYLES ===== */
.order-tracking-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
  font-family: 'Amiri', 'Cairo', sans-serif;
  direction: rtl;
  transition: all 0.3s ease;
}

.order-tracking-page * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== DARK MODE ===== */
.order-tracking-page.dark-mode {
  background: #0f172a;
}

.dark-mode .tracking-card {
  background: #1f2937;
  border-color: #374151;
}

.dark-mode .order-header {
  border-bottom-color: #374151;
}

.dark-mode .order-number {
  background: #374151;
  color: #3b82f6;
}

.dark-mode .order-date {
  color: #9ca3af;
}

.dark-mode .timeline-item:not(:last-child)::after {
  background: #374151;
}

.dark-mode .timeline-item.completed:not(:last-child)::after {
  background: #10b981;
}

.dark-mode .timeline-icon {
  background: #374151;
  color: #9ca3af;
}

.dark-mode .timeline-item.completed .timeline-icon {
  background: #10b981;
  color: white;
}

.dark-mode .timeline-content h3 {
  color: #f3f4f6;
}

.dark-mode .timeline-content p {
  color: #9ca3af;
}

.dark-mode .order-summary {
  background: #374151;
}

.dark-mode .summary-title {
  color: #f3f4f6;
  border-bottom-color: #4b5563;
}

.dark-mode .summary-item {
  border-bottom-color: #4b5563;
}

.dark-mode .item-details h4 {
  color: #f3f4f6;
}

.dark-mode .item-quantity {
  color: #9ca3af;
}

.dark-mode .summary-totals {
  border-top-color: #4b5563;
}

.dark-mode .total-row {
  color: #9ca3af;
}

.dark-mode .total-row.final {
  border-top-color: #4b5563;
  color: #f3f4f6;
}

.dark-mode .delivery-address {
  background: #374151;
}

.dark-mode .address-title {
  color: #f3f4f6;
}

.dark-mode .delivery-address p {
  color: #9ca3af;
}

.dark-mode .btn-secondary {
  background: #374151;
  color: #9ca3af;
}

.dark-mode .btn-secondary:hover {
  background: #4b5563;
}

.dark-mode .not-found {
  background: #1f2937;
}

.dark-mode .not-found h2 {
  color: #f3f4f6;
}

.dark-mode .not-found p {
  color: #9ca3af;
}

.dark-mode .toast-notification {
  background: #1f2937;
}

.dark-mode .toast-message {
  color: #f3f4f6;
}

/* ===== PAGE TITLE ===== */
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30px;
  text-align: center;
  font-family: 'Amiri', serif;
}

.dark-mode .page-title {
  color: #f3f4f6;
}

/* ===== LOADING STATE ===== */
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
  border-color: #374151;
  border-top-color: #3b82f6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== TRACKING CARD ===== */
.tracking-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

/* ===== ORDER HEADER ===== */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 15px;
}

.order-number {
  font-size: 1.2rem;
  color: #08717f;
  background: #e0f2f1;
  padding: 5px 15px;
  border-radius: 30px;
  font-weight: 700;
  margin: 0;
  font-family: 'Amiri', serif;
}

.order-date {
  color: #64748b;
  font-size: 0.9rem;
}

/* ===== TIMELINE ===== */
.timeline {
  margin-bottom: 40px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 45px;
  right: 20px;
  width: 2px;
  height: calc(100% + 5px);
  background: #e2e8f0;
  z-index: 1;
}

.timeline-item.completed:not(:last-child)::after {
  background: #10b981;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 2;
  position: relative;
  flex-shrink: 0;
}

.timeline-item.completed .timeline-icon {
  background: #10b981;
  color: white;
}

.timeline-content {
  flex: 1;
}

.timeline-content h3 {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.timeline-content p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.timeline-content .pending {
  color: #f59e0b;
}

/* ===== ORDER SUMMARY ===== */
.order-summary {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.summary-title {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-family: 'Amiri', serif;
}

.summary-items {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.item-price {
  color: #d40025;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 3px;
}

.item-quantity {
  color: #64748b;
  font-size: 0.8rem;
}

.item-total {
  font-weight: 700;
  color: #08717f;
  font-size: 0.95rem;
  min-width: 80px;
  text-align: left;
  flex-shrink: 0;
}

.summary-totals {
  padding-top: 15px;
  border-top: 2px solid #e2e8f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #475569;
}

.total-row.final {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #e2e8f0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

/* ===== DELIVERY ADDRESS ===== */
.delivery-address {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.address-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 10px;
  font-weight: 700;
  font-family: 'Amiri', serif;
}

.address-title .icon {
  font-size: 1.2rem;
}

.delivery-address p {
  color: #475569;
  line-height: 1.6;
  padding-right: 28px;
  margin: 0;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.btn-primary {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1rem;
}

/* ===== NOT FOUND ===== */
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.not-found h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 10px;
  font-family: 'Amiri', serif;
}

.not-found p {
  color: #64748b;
  margin-bottom: 30px;
}

.btn-home {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* ===== TOAST NOTIFICATION ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 60px;
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

.toast-icon { font-size: 1.3rem; }
.toast-message { color: #1e293b; font-size: 0.9rem; font-weight: 500; }
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .order-tracking-page {
    padding: 20px 0;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
  }

  .summary-item {
    flex-wrap: wrap;
  }

  .item-total {
    width: 100%;
    text-align: right;
    padding-right: 75px;
  }

  .tracking-card {
    padding: 20px;
  }

  .timeline-item {
    gap: 12px;
  }

  .timeline-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .timeline-item:not(:last-child)::after {
    top: 36px;
    right: 16px;
  }

  .timeline-content h3 {
    font-size: 0.9rem;
  }

  .timeline-content p {
    font-size: 0.75rem;
  }

  .toast-notification {
    right: 20px;
    left: 20px;
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    width: 100%;
    height: 150px;
  }

  .item-total {
    padding-right: 0;
    text-align: right;
  }

  .delivery-address p {
    padding-right: 0;
  }

  .address-title {
    justify-content: center;
  }
}
</style>
