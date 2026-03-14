<!-- src/views/OrderTracking.vue -->
<template>
  <div class="order-tracking-page">
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
          <p>{{ order.delivery?.address }}</p>
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
        <h2>الطلب غير موجود</h2>
        <router-link to="/" class="btn-home">العودة للرئيسية</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const order = ref(null)

const orderStatus = computed(() => {
  if (!order.value) return 0
  const status = order.value.status
  const statusMap = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    completed: 4,
  }
  return statusMap[status] || 1
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('ar-TN', {
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
.order-tracking-page {
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

.page-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 30px;
  text-align: center;
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

.tracking-card {
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

.order-number {
  font-size: 1.2rem;
  color: #08717f;
  background: #e0f2f1;
  padding: 5px 15px;
  border-radius: 30px;
  font-weight: 700;
}

.order-date {
  color: #64748b;
  font-size: 0.9rem;
}

/* Timeline */
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
}

.timeline-content p {
  color: #64748b;
  font-size: 0.85rem;
}

.timeline-content .pending {
  color: #f59e0b;
}

/* Order Summary */
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
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 5px;
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

/* Delivery Address */
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
}

.address-title .icon {
  font-size: 1.2rem;
}

.delivery-address p {
  color: #475569;
  line-height: 1.6;
  padding-right: 28px;
}

/* Action Buttons */
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

/* Not Found */
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

/* Responsive */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 10px;
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
}
</style>
