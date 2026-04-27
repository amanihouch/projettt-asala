<!-- src/views/OrderDetails.vue -->
<template>
  <div class="order-details-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">تفاصيل الطلب</h1>
        <router-link to="/profile?tab=orders" class="back-link">
          <span class="back-icon">→</span>
          العودة للطلبات
        </router-link>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تفاصيل الطلب...</p>
      </div>

      <div v-else-if="order" class="order-details-card">
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-status" :class="order.status">
            {{ getOrderStatusText(order.status) }}
          </div>
        </div>

        <!-- Customer Information -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="title-icon">👤</span>
            معلومات العميل
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">الاسم:</span>
              <span class="info-value">{{ order.customer?.fullName || order.customer?.name || 'غير محدد' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">البريد الإلكتروني:</span>
              <span class="info-value">{{ order.customer?.email || 'غير محدد' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">رقم الهاتف 1:</span>
              <span class="info-value">{{ order.customer?.phone1 || order.customer?.phone || 'غير محدد' }}</span>
            </div>
            <div class="info-item" v-if="order.customer?.phone2">
              <span class="info-label">رقم الهاتف 2:</span>
              <span class="info-value">{{ order.customer?.phone2 }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="title-icon">📍</span>
            عنوان التوصيل
          </h2>
          <div class="address-details">
            <p class="address-line">{{ order.delivery?.address || order.address || 'عنوان غير محدد' }}</p>
            <p class="address-line" v-if="order.delivery?.postalCode">
              الرمز البريدي: {{ order.delivery?.postalCode }}
            </p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="title-icon">📦</span>
            المنتجات
          </h2>
          <div class="items-list">
            <div v-for="item in order.items" :key="item.id" class="item-card">
              <img :src="item.image || 'https://placehold.co/70x70/08717f/white?text=منتج'" :alt="item.name" class="item-image" />
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-price">{{ formatPrice(item.price) }} د.ت</p>
                <p class="item-quantity">الكمية: {{ item.quantity }}</p>
              </div>
              <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="info-section">
          <h2 class="section-title">
            <span class="title-icon">💳</span>
            معلومات الدفع
          </h2>
          <div class="payment-details">
            <div class="payment-row">
              <span>طريقة الدفع:</span>
              <span class="payment-method">{{ order.paymentMethod || 'الدفع عند الاستلام' }}</span>
            </div>
            <div class="payment-row">
              <span>حالة الدفع:</span>
              <span class="payment-status" :class="order.paymentStatus || 'pending'">
                {{ getPaymentStatusText(order.paymentStatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <div class="summary-row">
            <span>المجموع الفرعي</span>
            <span>{{ formatPrice(order.subtotal || order.total - order.shipping) }} د.ت</span>
          </div>
          <div class="summary-row">
            <span>تكلفة التوصيل</span>
            <span>{{ formatPrice(order.shipping || 0) }} د.ت</span>
          </div>
          <div class="summary-row total">
            <span>المجموع الكلي</span>
            <span>{{ formatPrice(order.total) }} د.ت</span>
          </div>
        </div>

        <!-- Notes -->
        <div class="notes-section" v-if="order.notes">
          <h3 class="notes-title">ملاحظات</h3>
          <p class="notes-text">{{ order.notes }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-primary" @click="trackOrder">
            <span class="btn-icon">🚚</span>
            تتبع الطلب
          </button>
          <button class="btn btn-secondary" @click="contactSupport">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE - Using global theme store =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// Watch pour synchroniser la classe sur le body
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })

// ===== STATE =====
const loading = ref(true)
const order = ref(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅'
})

// ===== UTILS =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
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

const getOrderStatusText = (status) => {
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

const getPaymentStatusText = (status) => {
  const statusMap = {
    pending: 'في انتظار الدفع',
    paid: 'تم الدفع',
    failed: 'فشل الدفع',
    refunded: 'تم الاسترجاع'
  }
  return statusMap[status] || 'في انتظار الدفع'
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const trackOrder = () => {
  router.push(`/order-tracking/${order.value.id}`)
  showNotification('📦 جاري تحويلك إلى صفحة التتبع', 'info')
}

const contactSupport = () => {
  router.push('/contact')
  showNotification('💬 جاري تحويلك إلى صفحة الدعم', 'info')
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
    // Essayer de récupérer depuis l'API
    const response = await api.get(`/orders/${orderId}`)
    if (response.data.success) {
      order.value = response.data.data.order || response.data.data
      console.log('✅ Commande chargée depuis API:', order.value.id)
    } else {
      throw new Error('Commande non trouvée')
    }
  } catch (error) {
    console.error('❌ Erreur chargement commande:', error)

    // Fallback: récupérer depuis localStorage
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
  // Synchroniser la classe dark-mode sur le body au montage
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }

  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  fetchOrder()
})

onUnmounted(() => {
  // Ne pas enlever la classe dark-mode ici car elle est partagée avec toute l'application
  // La classe sera gérée par le watch du store
})
</script>



<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');

/* ===== BASE STYLES ===== */
.order-details-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
  font-family: 'Amiri', 'Cairo', sans-serif;
  direction: rtl;
  transition: background 0.3s ease;
}

.order-details-page * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== DARK MODE ===== */
.order-details-page.dark-mode {
  background: #0f172a;
}

.dark-mode .order-details-card {
  background: #1f2937;
  border-color: #374151;
}

.dark-mode .order-header {
  border-bottom-color: #374151;
}

.dark-mode .order-id {
  background: #374151;
  color: #3b82f6;
}

.dark-mode .order-date {
  color: #9ca3af;
}

.dark-mode .info-section {
  border-bottom-color: #374151;
}

.dark-mode .section-title {
  color: #f3f4f6;
}

.dark-mode .info-item {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .info-label {
  color: #9ca3af;
}

.dark-mode .info-value {
  color: #f3f4f6;
}

.dark-mode .address-details {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .address-line {
  color: #e5e7eb;
}

.dark-mode .item-card {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .item-name {
  color: #f3f4f6;
}

.dark-mode .item-quantity {
  color: #9ca3af;
}

.dark-mode .payment-details {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .payment-row {
  border-bottom-color: #4b5563;
  color: #e5e7eb;
}

.dark-mode .payment-method {
  color: #3b82f6;
}

.dark-mode .order-summary {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .summary-row {
  color: #9ca3af;
}

.dark-mode .summary-row.total {
  border-top-color: #4b5563;
  color: #f3f4f6;
}

.dark-mode .notes-section {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.dark-mode .notes-title,
.dark-mode .notes-text {
  color: #fbbf24;
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

/* ===== PAGE HEADER ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  font-size: 2.2rem;
  color: #1e293b;
  margin: 0;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-weight: 700;
}

.dark-mode .page-title {
  color: #f3f4f6;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.1rem;
}

.dark-mode .back-link {
  color: #3b82f6;
}

.back-link:hover {
  transform: translateX(4px);
}

.back-icon {
  font-size: 1.2rem;
}

/* ===== LOADING STATE ===== */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  font-family: 'Amiri', serif;
  font-size: 1.1rem;
  color: #64748b;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  transition: border-color 0.3s ease;
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

/* ===== ORDER DETAILS CARD ===== */
.order-details-card {
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
  transition: border-color 0.3s ease;
}

.order-info {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.order-id {
  font-weight: 700;
  color: #08717f;
  background: #e0f2f1;
  padding: 5px 18px;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.order-date {
  color: #64748b;
  font-size: 1rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.order-status {
  padding: 6px 18px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.processing {
  background: #cce5ff;
  color: #004085;
}

.order-status.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.delivered,
.order-status.completed {
  background: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* ===== INFO SECTION ===== */
.info-section {
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e2e8f0;
  transition: border-color 0.3s ease;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 700;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.title-icon {
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.info-label {
  display: block;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 6px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.info-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

/* ===== ADDRESS DETAILS ===== */
.address-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.address-line {
  color: #475569;
  line-height: 1.8;
  margin-bottom: 8px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.05rem;
}

.address-line:last-child {
  margin-bottom: 0;
}

/* ===== ITEMS LIST ===== */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item-card {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.item-card:hover {
  border-color: #08717f;
  box-shadow: 0 2px 8px rgba(8, 113, 127, 0.1);
}

.dark-mode .item-card:hover {
  border-color: #3b82f6;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  transition: border-color 0.3s ease;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1.05rem;
  color: #1e293b;
  margin-bottom: 6px;
  font-weight: 600;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.item-price {
  color: #d40025;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
  font-family: 'Amiri', serif;
}

.item-quantity {
  color: #64748b;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.item-total {
  font-weight: 700;
  color: #08717f;
  font-size: 1.1rem;
  min-width: 110px;
  text-align: left;
  flex-shrink: 0;
  font-family: 'Amiri', serif;
}

/* ===== PAYMENT DETAILS ===== */
.payment-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.05rem;
}

.payment-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.payment-method {
  font-weight: 600;
  color: #08717f;
}

.payment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.payment-status.paid {
  background: #d4edda;
  color: #155724;
}

.payment-status.failed {
  background: #f8d7da;
  color: #721c24;
}

/* ===== ORDER SUMMARY ===== */
.order-summary {
  margin-top: 25px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #475569;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.05rem;
}

.summary-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #e2e8f0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  transition: all 0.3s ease;
}

/* ===== NOTES SECTION ===== */
.notes-section {
  margin-top: 25px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 12px;
  border: 1px solid #ffeeba;
  transition: all 0.3s ease;
}

.notes-title {
  font-size: 1.05rem;
  color: #856404;
  margin-bottom: 10px;
  font-weight: 700;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.notes-text {
  color: #856404;
  line-height: 1.7;
  font-size: 1rem;
  margin: 0;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
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
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
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
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ===== NOT FOUND ===== */
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.not-found-icon {
  font-size: 4.5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.not-found h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 15px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-weight: 700;
}

.not-found p {
  color: #64748b;
  margin-bottom: 30px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.1rem;
}

.btn-home {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  font-size: 1.1rem;
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
  transition: background 0.3s ease;
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

.toast-icon { font-size: 1.4rem; }

.toast-message {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .order-details-page {
    padding: 20px 0;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .item-card {
    flex-wrap: wrap;
  }

  .item-total {
    width: 100%;
    text-align: right;
    padding-right: 85px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .order-details-card {
    padding: 20px;
  }

  .toast-notification {
    right: 20px;
    left: 20px;
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-card {
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
    width: auto;
  }

  .payment-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
