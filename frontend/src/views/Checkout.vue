<!-- src/views/Checkout.vue -->
<template>
  <div class="checkout-page">
    <!-- Header -->
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">إتمام الطلب</h1>
        <p class="page-subtitle">أكمل معلوماتك لتأكيد الطلب</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <div class="checkout-grid">
          <!-- Left Column - Forms -->
          <div class="checkout-forms">
            <!-- Contact Information -->
            <div class="form-card">
              <h2 class="card-title">
                <span class="title-icon">📞</span>
                معلومات الاتصال
              </h2>

              <div class="form-group">
                <label class="form-label"> الاسم الكامل <span class="required">*</span> </label>
                <input
                  type="text"
                  v-model="form.fullName"
                  class="form-input"
                  placeholder="مثال: محمد الفلاني"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  البريد الإلكتروني <span class="required">*</span>
                </label>
                <input
                  type="email"
                  v-model="form.email"
                  class="form-input"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </div>

              <!-- Premier numéro de téléphone -->
              <div class="form-group">
                <label class="form-label"> رقم الهاتف 1 <span class="required">*</span> </label>
                <div class="phone-input-wrapper">
                  <span class="phone-country">+216</span>
                  <input
                    type="tel"
                    v-model="form.phone1"
                    class="form-input phone-input"
                    placeholder="XX XXX XXX"
                    maxlength="8"
                    required
                  />
                </div>
              </div>

              <!-- Deuxième numéro de téléphone (optionnel) -->
              <div class="form-group">
                <label class="form-label">
                  رقم الهاتف 2 <span class="optional">(اختياري)</span>
                </label>
                <div class="phone-input-wrapper">
                  <span class="phone-country">+216</span>
                  <input
                    type="tel"
                    v-model="form.phone2"
                    class="form-input phone-input"
                    placeholder="XX XXX XXX"
                    maxlength="8"
                  />
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="form-card">
              <h2 class="card-title">
                <span class="title-icon">📍</span>
                عنوان التوصيل
              </h2>

              <!-- Gouvernorat (ولاية) -->
              <div class="form-group">
                <label class="form-label"> الولاية <span class="required">*</span> </label>
                <select
                  v-model="form.governorate"
                  class="form-select"
                  @change="onGovernorateChange"
                  required
                >
                  <option value="" disabled selected>اختر الولاية</option>
                  <option v-for="gov in tunisianGovernorates" :key="gov.code" :value="gov.code">
                    {{ gov.name }}
                  </option>
                </select>
              </div>

              <!-- Délégation (معتمدية) -->
              <div class="form-group" v-if="form.governorate">
                <label class="form-label"> المعتمدية <span class="required">*</span> </label>
                <select v-model="form.delegation" class="form-select" required>
                  <option value="" disabled selected>اختر المعتمدية</option>
                  <option v-for="del in filteredDelegations" :key="del.code" :value="del.code">
                    {{ del.name }}
                  </option>
                </select>
              </div>

              <!-- Code Postal -->
              <div class="form-group">
                <label class="form-label"> الرمز البريدي </label>
                <input
                  type="text"
                  v-model="form.postalCode"
                  class="form-input"
                  placeholder="مثال: 4000"
                  maxlength="4"
                />
              </div>

              <!-- Adresse détaillée -->
              <div class="form-group">
                <label class="form-label"> العنوان التفصيلي <span class="required">*</span> </label>
                <textarea
                  v-model="form.address"
                  class="form-textarea"
                  rows="3"
                  placeholder="مثال: نهج الحبيب بورقيبة، مقابل المدرسة الابتدائية"
                  required
                ></textarea>
              </div>
            </div>

            <!-- Additional Notes -->
            <div class="form-card">
              <h2 class="card-title">
                <span class="title-icon">📝</span>
                ملاحظات إضافية
              </h2>

              <div class="form-group">
                <label class="form-label">ملاحظات (اختياري)</label>
                <textarea
                  v-model="form.notes"
                  class="form-textarea"
                  rows="3"
                  placeholder="أي ملاحظات إضافية بخصوص الطلب..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column - Order Summary -->
          <div class="order-summary">
            <div class="summary-card">
              <h2 class="card-title">
                <span class="title-icon">🛒</span>
                ملخص الطلب
              </h2>

              <!-- Cart Items -->
              <div class="cart-items" v-if="cartStore.items.length > 0">
                <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                  <img :src="item.image" :alt="item.name" class="item-image" />
                  <div class="item-details">
                    <h4 class="item-name">{{ item.name }}</h4>
                    <p class="item-price">{{ formatPrice(item.price) }} د.ت</p>
                    <div class="item-quantity">
                      <span>الكمية: {{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
                </div>
              </div>

              <!-- Empty Cart -->
              <div v-else class="empty-cart">
                <span class="empty-icon">🛒</span>
                <p>سلة التسوق فارغة</p>
                <router-link to="/products" class="btn-shop"> تسوق الآن </router-link>
              </div>

              <!-- Totals -->
              <div class="totals-section">
                <div class="total-row">
                  <span>المجموع الفرعي</span>
                  <span>{{ formatPrice(cartStore.totalPrice) }} د.ت</span>
                </div>
                <div class="total-row">
                  <span>تكلفة التوصيل</span>
                  <span>{{ formatPrice(shippingCost) }} د.ت</span>
                </div>
                <div class="total-row final-total">
                  <span>المجموع الكلي</span>
                  <span>{{ formatPrice(cartStore.totalPrice + shippingCost) }} د.ت</span>
                </div>
              </div>

              <!-- Payment Method (Cash only) -->
              <div class="payment-section">
                <h3 class="payment-title">
                  <span class="title-icon">💳</span>
                  طريقة الدفع
                </h3>
                <div class="payment-cash">
                  <div class="cash-option selected">
                    <span class="cash-icon">💵</span>
                    <div class="cash-details">
                      <strong>الدفع عند الاستلام</strong>
                      <span class="cash-note">ادفع نقداً عند استلام الطلب</span>
                    </div>
                  </div>
                  <p class="payment-note">
                    <span class="note-icon">ℹ️</span>
                    الدفع متوفر فقط نقداً عند الاستلام
                  </p>
                </div>
              </div>

              <!-- Confirm Button -->
              <button
                class="btn-confirm"
                @click="submitOrder"
                :disabled="isSubmitting || cartStore.items.length === 0"
              >
                <span v-if="!isSubmitting">تأكيد الطلب</span>
                <span v-else class="loading-spinner"></span>
              </button>

              <!-- Secure Checkout Note -->
              <p class="secure-note">
                <span class="secure-icon">🔒</span>
                معلوماتك محمية ومشفرة
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { tunisianGovernorates, getDelegationsByGovernorate } from '../data/tunisia'

const router = useRouter()
const cartStore = useCartStore()

// ===== STATE =====
const isSubmitting = ref(false)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== FORM DATA =====
const form = reactive({
  fullName: '',
  email: '',
  phone1: '',
  phone2: '',
  governorate: '',
  delegation: '',
  postalCode: '',
  address: '',
  notes: '',
})

// ===== COMPUTED =====
const shippingCost = computed(() => {
  // Calcul des frais de livraison selon la région
  const governoratePrices = {
    tunis: 7,
    ariana: 7,
    ben_arous: 7,
    manouba: 7,
    sousse: 8,
    sfax: 8,
    nabeul: 8,
    bizerte: 8,
    monastir: 8,
    mahdia: 9,
    kairouan: 9,
    kasserine: 10,
    gafsa: 10,
    tozeur: 12,
    kebili: 12,
    tataouine: 12,
    medenine: 10,
    gabes: 10,
    beja: 9,
    jendouba: 9,
    kef: 9,
    siliana: 9,
    zaghouan: 8,
  }

  return governoratePrices[form.governorate] || 10
})

const filteredDelegations = computed(() => {
  if (!form.governorate) return []
  return getDelegationsByGovernorate(form.governorate)
})

// ===== METHODS =====
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
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

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const onGovernorateChange = () => {
  form.delegation = '' // Reset delegation when governorate changes
}

const validateForm = () => {
  if (!form.fullName) {
    showNotification('الرجاء إدخال الاسم الكامل', 'error')
    return false
  }

  if (!form.email || !form.email.includes('@')) {
    showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error')
    return false
  }

  if (!form.phone1 || form.phone1.length < 8) {
    showNotification('الرجاء إدخال رقم هاتف صحيح (8 أرقام)', 'error')
    return false
  }

  if (!form.governorate) {
    showNotification('الرجاء اختيار الولاية', 'error')
    return false
  }

  if (!form.delegation) {
    showNotification('الرجاء اختيار المعتمدية', 'error')
    return false
  }

  if (!form.address) {
    showNotification('الرجاء إدخال العنوان التفصيلي', 'error')
    return false
  }

  return true
}

const submitOrder = () => {
  if (!validateForm()) return

  if (cartStore.items.length === 0) {
    showNotification('سلة التسوق فارغة', 'error')
    return
  }

  isSubmitting.value = true

  // Simuler l'envoi de la commande
  setTimeout(() => {
    const orderData = {
      id: 'CMD' + Date.now(),
      customer: {
        fullName: form.fullName,
        email: form.email,
        phone1: form.phone1,
        phone2: form.phone2 || null,
      },
      delivery: {
        governorate: form.governorate,
        delegation: form.delegation,
        postalCode: form.postalCode,
        address: form.address,
      },
      items: cartStore.items,
      subtotal: cartStore.totalPrice,
      shipping: shippingCost.value,
      total: cartStore.totalPrice + shippingCost.value,
      paymentMethod: 'cash',
      notes: form.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    console.log('✅ Commande créée:', orderData)

    // Sauvegarder la commande dans localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(orderData)
    localStorage.setItem('orders', JSON.stringify(orders))

    showNotification('✅ تم تأكيد الطلب بنجاح')

    // Vider le panier
    cartStore.clearCart()

    // Rediriger vers la page de confirmation
    setTimeout(() => {
      router.push('/order-confirmation/' + orderData.id)
    }, 2000)
  }, 1500)
}

// ===== LIFECYCLE =====
onMounted(() => {
  cartStore.loadFromStorage()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.checkout-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  padding: 40px 0;
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
}

/* Main Content */
.main-content {
  padding-bottom: 60px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
}

/* Form Cards */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
}

.title-icon {
  font-size: 1.5rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.required {
  color: #d40025;
}

.optional {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: normal;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Phone Input */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-input-wrapper:focus-within {
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.phone-country {
  padding: 12px 16px;
  background: #f1f5f9;
  color: #08717f;
  font-weight: 700;
  border-left: 2px solid #e2e8f0;
}

.phone-input {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
}

.phone-input:focus {
  box-shadow: none !important;
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* Cart Items */
.cart-items {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-left: 5px;
}

.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f1f5f9;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 10px;
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
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.item-quantity {
  color: #64748b;
  font-size: 0.8rem;
}

.item-total {
  font-weight: 700;
  color: #08717f;
  font-size: 1rem;
  min-width: 80px;
  text-align: left;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 30px 20px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.3;
  display: block;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #64748b;
  margin-bottom: 15px;
}

.btn-shop {
  display: inline-block;
  padding: 10px 25px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* Totals */
.totals-section {
  margin: 20px 0;
  padding: 20px 0;
  border-top: 2px solid #f1f5f9;
  border-bottom: 2px solid #f1f5f9;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #475569;
}

.total-row.final-total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #f1f5f9;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

/* Payment Section */
.payment-section {
  margin: 25px 0;
}

.payment-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 15px;
}

.payment-cash {
  background: #f0f9ff;
  border: 2px solid #08717f;
  border-radius: 12px;
  padding: 20px;
}

.cash-option {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cash-icon {
  font-size: 2rem;
}

.cash-details {
  flex: 1;
}

.cash-details strong {
  display: block;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 3px;
}

.cash-note {
  font-size: 0.85rem;
  color: #64748b;
}

.payment-note {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #cbd5e1;
  font-size: 0.85rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 5px;
}

.note-icon {
  font-size: 1rem;
}

/* Confirm Button */
.btn-confirm {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 15px 0 10px;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(212, 0, 37, 0.2);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Secure Note */
.secure-note {
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.secure-icon {
  font-size: 1rem;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 992px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 30px 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 20px;
  }

  .cart-item {
    flex-wrap: wrap;
  }

  .item-total {
    width: 100%;
    text-align: right;
    padding-right: 85px;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }
}
</style>
