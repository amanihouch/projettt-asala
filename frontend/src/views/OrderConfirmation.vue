<!-- src/views/OrderConfirmation.vue -->
<template>
  <div class="order-confirmation-page" :class="{ 'dark-mode': isDarkMode }">
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
            <span class="detail-value">{{ order.paymentMethod || 'الدفع عند الاستلام' }}</span>
          </div>
          <div class="detail-row" v-if="order.shipping">
            <span class="detail-label">تكلفة التوصيل:</span>
            <span class="detail-value">{{ formatPrice(order.shipping) }} د.ت</span>
          </div>
        </div>

        <!-- Delivery Info -->
        <div v-if="order" class="delivery-info">
          <div class="delivery-icon">🚚</div>
          <div class="delivery-text">
            <strong>مدة التوصيل المتوقعة:</strong>
            <span>{{ order.estimatedDelivery || '2-5 أيام عمل' }}</span>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 class="steps-title">📋 الخطوات التالية</h3>
          <ul class="steps-list">
            <li class="step-item">
              <span class="step-number">1</span>
              <span class="step-text">سيتم تأكيد طلبك عبر البريد الإلكتروني</span>
            </li>
            <li class="step-item">
              <span class="step-number">2</span>
              <span class="step-text">سيتم تجهيز طلبك خلال 24-48 ساعة</span>
            </li>
            <li class="step-item">
              <span class="step-number">3</span>
              <span class="step-text">ستتلقى إشعاراً عند شحن الطلب</span>
            </li>
            <li class="step-item">
              <span class="step-number">4</span>
              <span class="step-text">يمكنك تتبع طلبك من خلال حسابك الشخصي</span>
            </li>
          </ul>
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

        <!-- Support Section -->
        <div class="support-section">
          <p class="support-text">
            لديك استفسار؟
            <router-link to="/contact" class="support-link">تواصل معنا</router-link>
          </p>
        </div>
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

// ===== FETCH ORDER =====
const fetchOrder = async () => {
  const orderId = route.params.id
  if (!orderId) {
    router.push('/')
    return
  }

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
      console.log('❌ Commande non trouvée, redirection')
      router.push('/')
    }
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

  // Afficher une notification de bienvenue
  setTimeout(() => {
    showNotification('🎉 شكراً لتسوقك معنا!', 'success')
  }, 500)
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
.order-confirmation-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Amiri', 'Cairo', sans-serif;
  direction: rtl;
  transition: background 0.3s ease;
}

.order-confirmation-page * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.container {
  max-width: 600px;
  width: 100%;
}

/* ===== DARK MODE ===== */
.order-confirmation-page.dark-mode {
  background: #0f172a;
}

.dark-mode .confirmation-card {
  background: #1f2937;
  border-color: #374151;
}

.dark-mode .confirmation-title {
  color: #f3f4f6;
}

.dark-mode .confirmation-message {
  color: #9ca3af;
}

.dark-mode .order-details {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .detail-row {
  border-bottom-color: #4b5563;
}

.dark-mode .detail-label {
  color: #9ca3af;
}

.dark-mode .detail-value {
  color: #f3f4f6;
}

.dark-mode .delivery-info {
  background: #374151;
  border-color: #4b5563;
}

.dark-mode .delivery-text strong {
  color: #f3f4f6;
}

.dark-mode .delivery-text span {
  color: #9ca3af;
}

.dark-mode .steps-title {
  color: #f3f4f6;
}

.dark-mode .step-item {
  border-bottom-color: #374151;
}

.dark-mode .step-number {
  background: #374151;
  color: #3b82f6;
}

.dark-mode .step-text {
  color: #e5e7eb;
}

.dark-mode .support-text {
  color: #9ca3af;
}

.dark-mode .support-link {
  color: #3b82f6;
}

.dark-mode .support-link:hover {
  color: #60a5fa;
}

.dark-mode .btn-secondary {
  background: #374151;
  color: #9ca3af;
}

.dark-mode .btn-secondary:hover {
  background: #4b5563;
}

.dark-mode .toast-notification {
  background: #1f2937;
}

.dark-mode .toast-message {
  color: #f3f4f6;
}

/* ===== CONFIRMATION CARD ===== */
.confirmation-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.success-icon {
  font-size: 5.5rem;
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
  font-size: 2.2rem;
  color: #1e293b;
  margin-bottom: 15px;
  font-weight: 800;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  line-height: 1.4;
}

.confirmation-message {
  color: #64748b;
  font-size: 1.2rem;
  margin-bottom: 30px;
  line-height: 1.8;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

/* ===== ORDER DETAILS ===== */
.order-details {
  background: #f8fafc;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  text-align: right;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #64748b;
  font-weight: 600;
  font-size: 1.05rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.detail-value {
  color: #1e293b;
  font-weight: 700;
  font-size: 1.1rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

/* ===== DELIVERY INFO ===== */
.delivery-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e2e8f0;
  text-align: right;
  transition: all 0.3s ease;
}

.delivery-icon {
  font-size: 2.2rem;
}

.delivery-text {
  flex: 1;
}

.delivery-text strong {
  display: block;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 5px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  font-weight: 700;
}

.delivery-text span {
  font-size: 0.95rem;
  color: #64748b;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

/* ===== NEXT STEPS ===== */
.next-steps {
  margin-bottom: 30px;
  text-align: right;
}

.steps-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: border-color 0.3s ease;
}

.step-item:last-child {
  border-bottom: none;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #08717f;
  flex-shrink: 0;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.step-text {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
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

/* ===== SUPPORT SECTION ===== */
.support-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 10px;
  transition: border-color 0.3s ease;
}

.dark-mode .support-section {
  border-top-color: #374151;
}

.support-text {
  color: #64748b;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.support-link {
  color: #08717f;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
  margin-right: 5px;
}

.support-link:hover {
  color: #0a94a6;
  text-decoration: underline;
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

.toast-icon {
  font-size: 1.4rem;
}

.toast-message {
  color: #1e293b;
  font-size: 1rem;
  font-weight:500;
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
  .order-confirmation-page {
    padding: 20px;
  }

  .confirmation-card {
    padding: 30px 20px;
  }

  .confirmation-title {
    font-size: 1.8rem;
  }

  .confirmation-message {
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .delivery-info {
    flex-direction: column;
    text-align: center;
  }

  .step-item {
    gap: 10px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }

  .step-text {
    font-size: 0.95rem;
  }

  .toast-notification {
    right: 20px;
    left: 20px;
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .steps-list {
    padding-right: 0;
  }

  .support-text {
    font-size: 0.9rem;
  }
}
/* ===== DARK MODE COMPLET POUR ORDER CONFIRMATION ===== */
/* Remplacez tous les styles .dark-mode existants par ceci : */

/* Fond général */
.order-confirmation-page.dark-mode {
  background: #161627 !important;
}

/* Carte de confirmation */
.order-confirmation-page.dark-mode .confirmation-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
}

/* Titre */
.order-confirmation-page.dark-mode .confirmation-title {
  color: #f1f5f9 !important;
}

/* Message */
.order-confirmation-page.dark-mode .confirmation-message {
  color: #94a3b8 !important;
}

/* Détails commande */
.order-confirmation-page.dark-mode .order-details {
  background: #121220 !important;
  border-color: #2a2a40 !important;
}

.order-confirmation-page.dark-mode .detail-row {
  border-bottom-color: #2a2a40 !important;
}

.order-confirmation-page.dark-mode .detail-label {
  color: #94a3b8 !important;
}

.order-confirmation-page.dark-mode .detail-value {
  color: #f1f5f9 !important;
}

/* Livraison */
.order-confirmation-page.dark-mode .delivery-info {
  background: #121220 !important;
  border-color: #2a2a40 !important;
}

.order-confirmation-page.dark-mode .delivery-text strong {
  color: #f1f5f9 !important;
}

.order-confirmation-page.dark-mode .delivery-text span {
  color: #94a3b8 !important;
}

/* Étapes */
.order-confirmation-page.dark-mode .steps-title {
  color: #f1f5f9 !important;
}

.order-confirmation-page.dark-mode .step-item {
  border-bottom-color: #2a2a40 !important;
}

.order-confirmation-page.dark-mode .step-number {
  background: #2a2a40 !important;
  color: #2dd4bf !important;
}

.order-confirmation-page.dark-mode .step-text {
  color: #cbd5e1 !important;
}

/* Support */
.order-confirmation-page.dark-mode .support-section {
  border-top-color: #2a2a40 !important;
}

.order-confirmation-page.dark-mode .support-text {
  color: #94a3b8 !important;
}

.order-confirmation-page.dark-mode .support-link {
  color: #2dd4bf !important;
}

.order-confirmation-page.dark-mode .support-link:hover {
  color: #5eeadb !important;
}

/* Bouton secondaire */
.order-confirmation-page.dark-mode .btn-secondary {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.order-confirmation-page.dark-mode .btn-secondary:hover {
  background: #3a3a55 !important;
  color: #f1f5f9 !important;
}

/* Toast */
.order-confirmation-page.dark-mode .toast-notification {
  background: #1e1e30 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.order-confirmation-page.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
