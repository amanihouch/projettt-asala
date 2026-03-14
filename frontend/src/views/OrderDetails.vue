<!-- src/views/OrderDetails.vue -->
<template>
  <div class="order-details-page">
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
              <span class="info-value">{{ order.customer?.fullName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">البريد الإلكتروني:</span>
              <span class="info-value">{{ order.customer?.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">رقم الهاتف 1:</span>
              <span class="info-value">{{ order.customer?.phone1 }}</span>
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
            <p class="address-line">{{ order.delivery?.address }}</p>
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
              <img :src="item.image" :alt="item.name" class="item-image" />
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
              <span class="payment-method">الدفع عند الاستلام</span>
            </div>
            <div class="payment-row">
              <span>حالة الدفع:</span>
              <span class="payment-status pending">في انتظار الدفع</span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <div class="summary-row">
            <span>المجموع الفرعي</span>
            <span>{{ formatPrice(order.subtotal) }} د.ت</span>
          </div>
          <div class="summary-row">
            <span>تكلفة التوصيل</span>
            <span>{{ formatPrice(order.shipping) }} د.ت</span>
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
        <h2>الطلب غير موجود</h2>
        <router-link to="/" class="btn-home">العودة للرئيسية</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const order = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const trackOrder = () => {
  router.push(`/order-tracking/${order.value.id}`)
}

const contactSupport = () => {
  router.push('/contact')
}

onMounted(() => {
  const orderId = route.params.id
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  order.value = orders.find((o) => o.id === orderId)

  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.order-details-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 0;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #1e293b;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-link:hover {
  transform: translateX(4px);
}

.back-icon {
  font-size: 1.1rem;
}

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

.order-details-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.order-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.order-id {
  font-weight: 700;
  color: #08717f;
  background: #e0f2f1;
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.9rem;
}

.order-date {
  color: #64748b;
  font-size: 0.9rem;
}

.order-status {
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
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

.info-section {
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.title-icon {
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 5px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.address-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.address-line {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 5px;
}

.address-line:last-child {
  margin-bottom: 0;
}

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

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
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
  font-size: 1rem;
  min-width: 100px;
  text-align: left;
}

.payment-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
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
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-summary {
  margin-top: 25px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #475569;
}

.summary-row.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #e2e8f0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.notes-section {
  margin-top: 25px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 12px;
  border: 1px solid #ffeeba;
}

.notes-title {
  font-size: 0.95rem;
  color: #856404;
  margin-bottom: 8px;
}

.notes-text {
  color: #856404;
  line-height: 1.6;
  font-size: 0.9rem;
}

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
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
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

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.btn-home {
  display: inline-block;
  padding: 12px 30px;
  background: #08717f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    gap: 10px;
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
}
</style>
