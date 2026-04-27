<!-- src/views/Checkout.vue - Version complète avec synchro stock -->
<template>
  <div class="checkout-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Header -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <div>
            <h1 class="page-title">إتمام الطلب</h1>
            <p class="page-subtitle">أكمل معلوماتك لتأكيد الطلب</p>
          </div>
          <div class="header-steps">
            <div class="step active">
              <span class="step-number">1</span>
              <span class="step-label">المعلومات</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <span class="step-number">2</span>
              <span class="step-label">التوصيل</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <span class="step-number">3</span>
              <span class="step-label">الدفع</span>
            </div>
          </div>
        </div>
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
              <div class="card-header">
                <span class="card-icon">📞</span>
                <h2 class="card-title">معلومات الاتصال</h2>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    الاسم الكامل <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="form.fullName"
                    class="form-input"
                    :class="{ 'error': errors.fullName }"
                    placeholder="أدخل اسمك الكامل"
                  />
                  <span v-if="errors.fullName" class="error-text">{{ errors.fullName }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    البريد الإلكتروني <span class="required">*</span>
                  </label>
                  <input
                    type="email"
                    v-model="form.email"
                    class="form-input"
                    :class="{ 'error': errors.email }"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                  <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    رقم الهاتف 1 <span class="required">*</span>
                  </label>
                  <div class="phone-input-wrapper">
                    <span class="phone-country">+216</span>
                    <input
                      type="tel"
                      v-model="form.phone1"
                      class="form-input phone-input"
                      :class="{ 'error': errors.phone1 }"
                      placeholder="XX XXX XXX"
                      maxlength="8"
                    />
                  </div>
                  <span v-if="errors.phone1" class="error-text">{{ errors.phone1 }}</span>
                </div>

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
            </div>

            <!-- Delivery Address -->
            <div class="form-card">
              <div class="card-header">
                <span class="card-icon">📍</span>
                <h2 class="card-title">عنوان التوصيل</h2>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    الولاية <span class="required">*</span>
                  </label>
                  <select
                    v-model="form.governorate"
                    class="form-select"
                    :class="{ 'error': errors.governorate }"
                    @change="onGovernorateChange"
                  >
                    <option value="" disabled>اختر الولاية</option>
                    <option v-for="gov in tunisianGovernorates" :key="gov.code" :value="gov.code">
                      {{ gov.name }}
                    </option>
                  </select>
                  <span v-if="errors.governorate" class="error-text">{{ errors.governorate }}</span>
                </div>

                <div class="form-group" v-if="form.governorate">
                  <label class="form-label">
                    المعتمدية <span class="required">*</span>
                  </label>
                  <select v-model="form.delegation" class="form-select" :class="{ 'error': errors.delegation }">
                    <option value="" disabled>اختر المعتمدية</option>
                    <option v-for="del in filteredDelegations" :key="del.code" :value="del.code">
                      {{ del.name }}
                    </option>
                  </select>
                  <span v-if="errors.delegation" class="error-text">{{ errors.delegation }}</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الرمز البريدي</label>
                  <input
                    type="text"
                    v-model="form.postalCode"
                    class="form-input"
                    placeholder="مثال: 4000"
                    maxlength="4"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    العنوان التفصيلي <span class="required">*</span>
                  </label>
                  <textarea
                    v-model="form.address"
                    class="form-textarea"
                    :class="{ 'error': errors.address }"
                    rows="2"
                    placeholder="مثال: نهج الحبيب بورقيبة، مقابل المدرسة الابتدائية"
                  ></textarea>
                  <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
                </div>
              </div>
            </div>

            <!-- Code Promo Section -->
            <div class="form-card">
              <div class="card-header">
                <span class="card-icon">🎟️</span>
                <h2 class="card-title">رمز الخصم</h2>
              </div>

              <div class="promo-code-section">
                <div class="promo-input-group">
                  <input
                    type="text"
                    v-model="promoCodeInput"
                    placeholder="أدخل رمز الخصم"
                    class="promo-input"
                    :disabled="appliedPromoCode || applyingPromoCode"
                    dir="ltr"
                    @keyup.enter="applyPromoCode"
                  />
                  <button
                    v-if="!appliedPromoCode"
                    class="btn-apply-promo"
                    @click="applyPromoCode"
                    :disabled="!promoCodeInput.trim() || applyingPromoCode"
                  >
                    {{ applyingPromoCode ? 'جاري...' : 'تطبيق' }}
                  </button>
                  <button
                    v-else
                    class="btn-remove-promo"
                    @click="removePromoCode"
                  >
                    إلغاء
                  </button>
                </div>

                <div v-if="appliedPromoCode" class="applied-promo-info">
                  <span class="promo-success-icon">✅</span>
                  <div class="promo-details">
                    <span class="promo-code-text">{{ appliedPromoCode.code }}</span>
                    <span class="promo-discount-text">
                      خصم {{ appliedPromoCode.discountValue }}{{ appliedPromoCode.discountType === 'percentage' ? '%' : ' د.ت' }}
                    </span>
                  </div>
                </div>

                <div v-if="availablePromotions.length > 0 && !appliedPromoCode" class="available-promos">
                  <p class="available-title">العروض المتاحة:</p>
                  <div class="promo-chips">
                    <span
                      v-for="promo in availablePromotions.slice(0, 3)"
                      :key="promo.id"
                      class="promo-chip"
                      @click="selectPromoCode(promo)"
                    >
                      {{ promo.code }} ({{ promo.discountValue }}{{ promo.discountType === 'percentage' ? '%' : ' د.ت' }})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Notes -->
            <div class="form-card">
              <div class="card-header">
                <span class="card-icon">📝</span>
                <h2 class="card-title">ملاحظات إضافية</h2>
              </div>

              <div class="form-group">
                <textarea
                  v-model="form.notes"
                  class="form-textarea notes-textarea"
                  rows="3"
                  placeholder="أي ملاحظات إضافية بخصوص الطلب..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column - Order Summary -->
          <div class="order-summary">
            <div class="summary-card">
              <div class="summary-header">
                <span class="summary-icon">🛒</span>
                <h2 class="summary-title">ملخص الطلب</h2>
                <span class="items-count">{{ cartStore.items.length }} منتج</span>
              </div>

              <div class="cart-items" v-if="cartStore.items.length > 0">
                <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                  <img :src="getSafeImageUrl(item.image, DEFAULT_PRODUCT_IMAGE)" :alt="item.name" class="item-image" @error="handleItemImageError" />
                  <div class="item-details">
                    <h4 class="item-name">{{ truncateText(item.name, 25) }}</h4>
                    <div class="item-meta">
                      <span class="item-price" :class="{ 'discounted': item.discountApplied }">
                        {{ formatPrice(item.price) }} د.ت
                      </span>
                      <span v-if="item.discountApplied && item.originalPrice" class="item-original-price">
                        {{ formatPrice(item.originalPrice) }} د.ت
                      </span>
                      <span class="item-quantity">× {{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
                </div>
              </div>

              <div v-else class="empty-cart">
                <span class="empty-icon">🛒</span>
                <p>سلة التسوق فارغة</p>
                <router-link to="/products" class="btn-shop">تسوق الآن</router-link>
              </div>

              <div class="totals-section">
                <div class="total-row">
                  <span>المجموع الفرعي</span>
                  <span>{{ formatPrice(subtotal) }} د.ت</span>
                </div>
                <div class="total-row" v-if="totalDiscount > 0">
                  <span>الخصم</span>
                  <span class="discount-amount">- {{ formatPrice(totalDiscount) }} د.ت</span>
                </div>
                <div class="total-row">
                  <span>تكلفة التوصيل</span>
                  <span>{{ formatPrice(shippingCost) }} د.ت</span>
                </div>
                <div class="total-row final-total">
                  <span>المجموع الكلي</span>
                  <span>{{ formatPrice(finalTotal) }} د.ت</span>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="payment-section">
                <div class="payment-method active">
                  <div class="method-radio">
                    <div class="radio-circle"></div>
                  </div>
                  <div class="method-content">
                    <div class="method-header">
                      <span class="method-icon">💵</span>
                      <strong class="method-title">الدفع عند الاستلام</strong>
                    </div>
                    <p class="method-description">ادفع نقداً عند استلام الطلب</p>
                  </div>
                </div>
                <div class="payment-info">
                  <span class="info-icon">ℹ️</span>
                  <span>الدفع متوفر فقط نقداً عند الاستلام</span>
                </div>
              </div>

              <button
                class="btn-confirm"
                @click="submitOrder"
                :disabled="isSubmitting || cartStore.items.length === 0"
              >
                <span v-if="!isSubmitting">
                  <span class="btn-icon">✓</span>
                  تأكيد الطلب
                </span>
                <span v-else class="loading-spinner"></span>
              </button>

              <div class="secure-note">
                <span class="secure-icon">🔒</span>
                <span>معلوماتك محمية ومشفرة</span>
              </div>
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
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { tunisianGovernorates, getDelegationsByGovernorate } from '../data/tunisia'
import { getSafeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/image'
import api from '../services/api'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

const isSubmitting = ref(false)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

const promoCodeInput = ref('')
const applyingPromoCode = ref(false)
const appliedPromoCode = ref(null)
const availablePromotions = ref([])

const form = reactive({
  fullName: '', email: '', phone1: '', phone2: '',
  governorate: '', delegation: '', postalCode: '', address: '', notes: ''
})

const errors = reactive({
  fullName: '', email: '', phone1: '', governorate: '', delegation: '', address: ''
})

const shippingCost = computed(() => {
  const prices = {
    tunis: 7, ariana: 7, ben_arous: 7, manouba: 7,
    sousse: 8, sfax: 8, nabeul: 8, bizerte: 8,
    monastir: 8, mahdia: 9, kairouan: 9, kasserine: 10,
    gafsa: 10, tozeur: 12, kebili: 12, tataouine: 12,
    medenine: 10, gabes: 10, beja: 9, jendouba: 9,
    kef: 9, siliana: 9, zaghouan: 8
  }
  return prices[form.governorate] || 10
})

const subtotal = computed(() => cartStore.items.reduce((t, i) => t + ((i.originalPrice || i.price) * i.quantity), 0))
const totalDiscount = computed(() => cartStore.items.reduce((t, i) => t + (((i.originalPrice || i.price) - i.price) * i.quantity), 0))

const finalTotal = computed(() => {
  let total = cartStore.totalPrice + shippingCost.value
  if (appliedPromoCode.value) {
    const code = appliedPromoCode.value
    if (!code.minPurchase || cartStore.totalPrice >= code.minPurchase) {
      if (code.discountType === 'percentage') total = total * (1 - code.discountValue / 100)
      else if (code.discountType === 'fixed') total = Math.max(0, total - code.discountValue)
    }
  }
  return total
})

const filteredDelegations = computed(() => form.governorate ? getDelegationsByGovernorate(form.governorate) : [])

const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(Math.round(price * 100) / 100 || 0)
const truncateText = (text, length) => text ? (text.length > length ? text.substring(0, length) + '...' : text) : ''
const handleItemImageError = (e) => { e.target.src = DEFAULT_PRODUCT_IMAGE }

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const onGovernorateChange = () => { form.delegation = ''; errors.delegation = '' }

const loadAvailablePromotions = () => {
  try {
    const saved = localStorage.getItem('specialOffers')
    if (saved) availablePromotions.value = JSON.parse(saved).filter(o => o.type === 'code' && o.active && o.code)
    else availablePromotions.value = []
  } catch (e) { availablePromotions.value = [] }
}

const selectPromoCode = (promo) => { promoCodeInput.value = promo.code; applyPromoCode() }

const applyPromoCode = () => {
  if (!promoCodeInput.value.trim()) return showNotification('الرجاء إدخال رمز الخصم', 'warning')
  applyingPromoCode.value = true
  const codeOffer = availablePromotions.value.find(p => p.code?.toUpperCase() === promoCodeInput.value.trim().toUpperCase())
  if (!codeOffer) { applyingPromoCode.value = false; return showNotification('❌ رمز الخصم غير صالح', 'error') }
  appliedPromoCode.value = codeOffer
  localStorage.setItem('activePromoCode', JSON.stringify(codeOffer))
  showNotification(`✅ تم تطبيق رمز الخصم: ${codeOffer.code}`, 'success')
  applyingPromoCode.value = false
}

const removePromoCode = () => {
  appliedPromoCode.value = null; promoCodeInput.value = ''
  localStorage.removeItem('activePromoCode')
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(k => errors[k] = '')
  if (!form.fullName.trim() || form.fullName.trim().length < 3) { errors.fullName = 'الاسم الكامل مطلوب (3 أحرف على الأقل)'; isValid = false }
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'بريد إلكتروني غير صحيح'; isValid = false }
  if (!form.phone1 || !/^[0-9]{8}$/.test(form.phone1)) { errors.phone1 = 'رقم هاتف غير صحيح (8 أرقام)'; isValid = false }
  if (!form.governorate) { errors.governorate = 'الرجاء اختيار الولاية'; isValid = false }
  if (!form.delegation) { errors.delegation = 'الرجاء اختيار المعتمدية'; isValid = false }
  if (!form.address.trim()) { errors.address = 'العنوان التفصيلي مطلوب'; isValid = false }
  return isValid
}

// ===== ✅ SUBMIT ORDER AVEC SYNCHRO STOCK =====
const submitOrder = async () => {
  if (!validateForm()) return
  if (cartStore.items.length === 0) return showNotification('سلة التسوق فارغة', 'error')
  if (!authStore.isAuthenticated) { router.push('/login'); return }

  isSubmitting.value = true

  // Incrémenter le compteur du code promo
  if (appliedPromoCode.value) {
    try {
      const saved = localStorage.getItem('specialOffers')
      if (saved) {
        const offers = JSON.parse(saved)
        const idx = offers.findIndex(o => o.id === appliedPromoCode.value.id)
        if (idx !== -1) { offers[idx].usedCount = (offers[idx].usedCount || 0) + 1; localStorage.setItem('specialOffers', JSON.stringify(offers)) }
      }
    } catch (e) {}
  }

  const orderData = {
    customer: { id: authStore.userId, name: form.fullName.trim(), email: form.email, phone1: form.phone1, phone2: form.phone2 || null },
    delivery: { governorate: form.governorate, delegation: form.delegation, postalCode: form.postalCode, address: form.address.trim() },
    items: cartStore.items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image, vendorName: item.vendorName })),
    subtotal: subtotal.value, discount: totalDiscount.value, shipping: shippingCost.value, total: finalTotal.value,
    paymentMethod: 'cash', notes: form.notes, status: 'pending', createdAt: new Date().toISOString()
  }

  try {
    // Essayer d'envoyer au backend
    const response = await api.post('/orders', orderData)
    if (response.data.success) {
      // ✅ SYNCHRONISER LE STOCK POUR CHAQUE ARTICLE
      await syncStockAfterOrder()
      showNotification('✅ تم تأكيد الطلب بنجاح')
      localStorage.removeItem('activePromoCode')
      cartStore.clearCart()
      setTimeout(() => router.push('/profile?tab=orders'), 2000)
    } else {
      showNotification(response.data.message || '❌ حدث خطأ', 'error')
    }
  } catch (error) {
    console.error('Error creating order:', error)
    // Fallback: sauvegarde locale
    const result = cartStore.saveOrder(orderData)
    if (result.success) {
      // ✅ SYNCHRONISER LE STOCK MÊME EN FALLBACK
      await syncStockAfterOrder()
      showNotification('✅ تم تأكيد الطلب بنجاح')
      localStorage.removeItem('activePromoCode')
      cartStore.clearCart()
      setTimeout(() => router.push('/profile?tab=orders'), 2000)
    } else {
      showNotification('❌ حدث خطأ أثناء إنشاء الطلب', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// ===== ✅ SYNCHRONISATION STOCK AVEC LE BACKEND =====
const syncStockAfterOrder = async () => {
  console.log('📦 Synchronisation du stock après commande...')

  for (const item of cartStore.items) {
    const productId = cartStore.getItemId(item)
    const qty = item.quantity || 1
    const size = item.size || null

    if (!productId) continue

    try {
      await api.put(`/stock/${productId}`, { quantity: qty, size: size })
      console.log(`✅ Stock mis à jour: Produit ${productId} -${qty}`)
    } catch (error) {
      console.error(`❌ Erreur stock produit ${productId}:`, error.message)
    }
  }

  // Déclencher l'événement pour CartSidebar
  window.dispatchEvent(new CustomEvent('orderPlaced'))
}

onMounted(() => {
  cartStore.loadFromStorage()
  loadAvailablePromotions()
  if (authStore.isAuthenticated) {
    form.fullName = authStore.userName || ''
    form.email = authStore.userEmail || ''
    form.phone1 = authStore.userPhone || ''
    form.address = authStore.userAddress || ''
  }
})

onUnmounted(() => {})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.checkout-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Amiri', 'Cairo', sans-serif;
  direction: rtl;
  transition: all 0.3s ease;
}

.checkout-page * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Dark Mode */
.checkout-page.dark-mode {
  background: #0f172a;
}

.checkout-page.dark-mode .page-header {
  background: linear-gradient(135deg, #065a69, #b00020);
}

.checkout-page.dark-mode .form-card,
.checkout-page.dark-mode .summary-card {
  background: #1f2937;
  border-color: #374151;
}

.checkout-page.dark-mode .card-title,
.checkout-page.dark-mode .summary-title {
  color: #f3f4f6;
}

.checkout-page.dark-mode .form-label {
  color: #e5e7eb;
}

.checkout-page.dark-mode .form-input,
.checkout-page.dark-mode .form-select,
.checkout-page.dark-mode .form-textarea,
.checkout-page.dark-mode .promo-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.checkout-page.dark-mode .form-input:focus,
.checkout-page.dark-mode .form-select:focus,
.checkout-page.dark-mode .form-textarea:focus,
.checkout-page.dark-mode .promo-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.checkout-page.dark-mode .phone-country {
  background: #374151;
  border-left-color: #4b5563;
  color: #3b82f6;
}

.checkout-page.dark-mode .cart-item {
  border-bottom-color: #374151;
}

.checkout-page.dark-mode .item-name {
  color: #f3f4f6;
}

.checkout-page.dark-mode .empty-cart {
  background: #374151;
}

.checkout-page.dark-mode .total-row {
  color: #9ca3af;
}

.checkout-page.dark-mode .total-row.final-total {
  border-top-color: #374151;
  color: #f3f4f6;
}

.checkout-page.dark-mode .payment-method {
  background: #374151;
  border-color: #3b82f6;
}

.checkout-page.dark-mode .method-title {
  color: #f3f4f6;
}

.checkout-page.dark-mode .payment-info {
  border-top-color: #4b5563;
  color: #9ca3af;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  padding: 40px 0;
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-family: 'Amiri', serif;
}

.header-steps {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.step-number {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-family: 'Amiri', serif;
}

.step.active .step-number {
  background: white;
  color: #08717f;
}

.step-label {
  font-size: 0.85rem;
  opacity: 0.8;
  font-family: 'Amiri', serif;
}

.step.active .step-label {
  opacity: 1;
  font-weight: 600;
}

.step-line {
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
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
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Amiri', serif;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.required {
  color: #d40025;
}

.optional {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: normal;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Amiri', serif;
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

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
  font-family: 'Amiri', serif;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.notes-textarea {
  min-height: 100px;
}

/* Phone Input */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
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
  font-family: 'Amiri', serif;
}

.phone-input {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
}

.phone-input:focus {
  box-shadow: none !important;
}

/* Promo Code Section */
.promo-code-section {
  padding: 10px 0;
}

.promo-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.promo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Amiri', serif;
  transition: all 0.3s ease;
  background: white;
}

.promo-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.promo-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.btn-apply-promo,
.btn-remove-promo {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  white-space: nowrap;
}

.btn-apply-promo {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-apply-promo:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-apply-promo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-promo {
  background: #ef4444;
  color: white;
}

.btn-remove-promo:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.applied-promo-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f0fdf4;
  border: 1px solid #10b981;
  border-radius: 12px;
  margin-bottom: 15px;
}

.promo-success-icon {
  font-size: 1.3rem;
}

.promo-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.promo-code-text {
  font-weight: 700;
  color: #1e293b;
  font-family: monospace;
  font-size: 1.1rem;
}

.promo-discount-text {
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
}

.available-promos {
  margin-top: 15px;
}

.available-title {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 10px;
}

.promo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.promo-chip {
  display: inline-block;
  padding: 6px 14px;
  background: #fef3c7;
  color: #b45309;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f59e0b;
}

.promo-chip:hover {
  background: #f59e0b;
  color: white;
  transform: scale(1.02);
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f5f9;
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-title {
  flex: 1;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Amiri', serif;
}

.items-count {
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: 'Amiri', serif;
}

/* Cart Items */
.cart-items {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.cart-items::-webkit-scrollbar {
  width: 5px;
}

.cart-items::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 5px;
  font-family: 'Amiri', serif;
}

.item-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.item-price {
  color: #d40025;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Amiri', serif;
}

.item-price.discounted {
  color: #10b981;
}

.item-original-price {
  color: #94a3b8;
  font-size: 0.75rem;
  text-decoration: line-through;
}

.item-quantity {
  color: #64748b;
  font-size: 0.85rem;
  font-family: 'Amiri', serif;
}

.item-total {
  font-weight: 700;
  color: #08717f;
  font-size: 0.95rem;
  min-width: 70px;
  text-align: left;
  font-family: 'Amiri', serif;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 30px 20px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 20px;
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
  font-family: 'Amiri', serif;
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
  font-family: 'Amiri', serif;
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
  font-size: 1rem;
  font-family: 'Amiri', serif;
}

.discount-amount {
  color: #10b981;
}

.total-row.final-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #f1f5f9;
  font-size: 1.2rem;
  font-weight: 800;
  color: #1e293b;
}

/* Payment Section */
.payment-section {
  margin: 20px 0;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  background: #f0f9ff;
  border: 2px solid #08717f;
  border-radius: 16px;
}

.method-radio {
  width: 22px;
  height: 22px;
  background: white;
  border: 2px solid #08717f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle {
  width: 12px;
  height: 12px;
  background: #08717f;
  border-radius: 50%;
}

.method-content {
  flex: 1;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.method-icon {
  font-size: 1.3rem;
}

.method-title {
  font-size: 1.1rem;
  color: #1e293b;
  font-family: 'Amiri', serif;
}

.method-description {
  font-size: 0.9rem;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.payment-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Amiri', serif;
}

.info-icon {
  font-size: 1rem;
}

/* Confirm Button */
.btn-confirm {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 15px 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Amiri', serif;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(212, 0, 37, 0.2);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
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
  font-family: 'Amiri', serif;
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
  to { transform: rotate(360deg); }
}

/* Toast Notification */
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 280px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
}

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.error {
  border-right-color: #ef4444;
}

.toast-notification.warning {
  border-right-color: #f59e0b;
}

.toast-notification.info {
  border-right-color: #08717f;
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
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  font-family: 'Amiri', serif;
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

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .header-steps {
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
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
    padding-right: 72px;
  }

  .promo-input-group {
    flex-direction: column;
  }

  .btn-apply-promo,
  .btn-remove-promo {
    width: 100%;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .phone-input-wrapper {
    flex-direction: column;
  }

  .phone-country {
    width: 100%;
    text-align: center;
    border-left: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .step-line {
    width: 20px;
  }

  .step-number {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .step-label {
    font-size: 0.7rem;
  }
}
</style>
