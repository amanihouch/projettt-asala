<!-- src/views/OrderConfirmation.vue -->
<template>
  <div class="order-confirmation-page">
    <div class="container">
      <div class="confirmation-card">
        <div class="success-icon">✅</div>
        <h1 class="confirmation-title">تم تأكيد طلبك بنجاح!</h1>
        <p class="confirmation-message">شكراً لتسوقك معنا. سنقوم بتجهيز طلبك وشحنه في أقرب وقت.</p>

        <div class="order-details" v-if="order">
          <div class="detail-row">
            <span class="detail-label">رقم الطلب:</span>
            <span class="detail-value">#{{ order.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">تاريخ الطلب:</span>
            <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">المبلغ الإجمالي:</span>
            <span class="detail-value">{{ formatPrice(order.total) }} د.ت</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">طريقة الدفع:</span>
            <span class="detail-value">الدفع عند الاستلام</span>
          </div>
        </div>

        <div class="action-buttons">
          <router-link to="/" class="btn btn-primary">
            <span class="btn-icon">🏠</span>
            العودة للرئيسية
          </router-link>
          <router-link to="/profile?tab=orders" class="btn btn-secondary">
            <span class="btn-icon">📦</span>
            متابعة طلباتي
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const order = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

onMounted(() => {
  const orderId = route.params.id
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  order.value = orders.find((o) => o.id === orderId)

  if (!order.value) {
    router.push('/')
  }
})
</script>

<style scoped>
.order-confirmation-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 600px;
  width: 100%;
}

.confirmation-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  70% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
}

.confirmation-title {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 15px;
  font-weight: 800;
}

.confirmation-message {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.7;
}

.order-details {
  background: #f8fafc;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: right;
  border: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
}

.detail-value {
  color: #1e293b;
  font-weight: 700;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
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
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .confirmation-card {
    padding: 30px 20px;
  }

  .confirmation-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
