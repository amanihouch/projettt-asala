<!-- frontend/src/views/Checkout.vue - VERSION FINALE CORRIGÉE -->
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
            <div class="step active"><span class="step-number">1</span><span class="step-label">المعلومات</span></div>
            <div class="step-line"></div>
            <div class="step"><span class="step-number">2</span><span class="step-label">التوصيل</span></div>
            <div class="step-line"></div>
            <div class="step"><span class="step-number">3</span><span class="step-label">الدفع</span></div>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <!-- Vendor Info Alert -->
        <div v-if="currentVendorId" class="vendor-alert">
          <span class="vendor-alert-icon">🛍️</span>
          <div class="vendor-alert-content">
            <strong>Commande auprès de : {{ currentVendorName }}</strong>
            <span>Tous les produits de cette commande proviennent du même vendeur</span>
          </div>
        </div>

        <div class="checkout-grid">
          <!-- Left Column -->
          <div class="checkout-forms">
            <!-- Contact -->
            <div class="form-card">
              <div class="card-header"><span class="card-icon">📞</span><h2 class="card-title">معلومات الاتصال</h2></div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الاسم الكامل <span class="required">*</span></label>
                  <input type="text" v-model="form.fullName" class="form-input" :class="{ 'error': errors.fullName }" placeholder="أدخل اسمك الكامل" />
                  <span v-if="errors.fullName" class="error-text">{{ errors.fullName }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">البريد الإلكتروني <span class="required">*</span></label>
                  <input type="email" v-model="form.email" class="form-input" :class="{ 'error': errors.email }" placeholder="example@email.com" dir="ltr" />
                  <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">رقم الهاتف 1 <span class="required">*</span></label>
                  <div class="phone-input-wrapper"><span class="phone-country">+216</span><input type="tel" v-model="form.phone1" class="form-input phone-input" :class="{ 'error': errors.phone1 }" placeholder="XX XXX XXX" maxlength="8" /></div>
                  <span v-if="errors.phone1" class="error-text">{{ errors.phone1 }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">رقم الهاتف 2 <span class="optional">(اختياري)</span></label>
                  <div class="phone-input-wrapper"><span class="phone-country">+216</span><input type="tel" v-model="form.phone2" class="form-input phone-input" placeholder="XX XXX XXX" maxlength="8" /></div>
                </div>
              </div>
            </div>

            <!-- Delivery -->
            <div class="form-card">
              <div class="card-header"><span class="card-icon">📍</span><h2 class="card-title">عنوان التوصيل</h2></div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الولاية <span class="required">*</span></label>
                  <select v-model="form.governorate" class="form-select" :class="{ 'error': errors.governorate }" @change="onGovernorateChange">
                    <option value="" disabled>اختر الولاية</option>
                    <option v-for="gov in tunisianGovernorates" :key="gov.code" :value="gov.code">{{ gov.name }}</option>
                  </select>
                  <span v-if="errors.governorate" class="error-text">{{ errors.governorate }}</span>
                </div>
                <div class="form-group" v-if="form.governorate">
                  <label class="form-label">المعتمدية <span class="required">*</span></label>
                  <select v-model="form.delegation" class="form-select" :class="{ 'error': errors.delegation }">
                    <option value="" disabled>اختر المعتمدية</option>
                    <option v-for="del in filteredDelegations" :key="del.code" :value="del.code">{{ del.name }}</option>
                  </select>
                  <span v-if="errors.delegation" class="error-text">{{ errors.delegation }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">الرمز البريدي</label><input type="text" v-model="form.postalCode" class="form-input" placeholder="4000" maxlength="4" /></div>
                <div class="form-group">
                  <label class="form-label">العنوان التفصيلي <span class="required">*</span></label>
                  <textarea v-model="form.address" class="form-textarea" :class="{ 'error': errors.address }" rows="2" placeholder="نهج الحبيب بورقيبة..."></textarea>
                  <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
                </div>
              </div>
            </div>

            <!-- CODE PROMO + OFFRES AUTO -->
            <div class="form-card">
              <div class="card-header"><span class="card-icon">🎟️</span><h2 class="card-title">رمز الخصم و العروض</h2></div>

              <div v-if="autoAppliedDiscounts.length > 0" class="auto-offers-section">
                <p class="auto-offers-title">🎁 عروض مطبقة تلقائياً:</p>
                <div v-for="offer in autoAppliedDiscounts" :key="offer.id" class="auto-offer-item">
                  <span class="auto-offer-icon">✅</span>
                  <div class="auto-offer-details">
                    <span class="auto-offer-title">{{ offer.title }}</span>
                    <span class="auto-offer-discount">خصم {{ offer.discountValue }}{{ offer.discountType === 'percentage' ? '%' : ' د.ت' }}</span>
                  </div>
                </div>
              </div>

              <div class="promo-input-group">
                <input type="text" v-model="promoCodeInput" placeholder="أدخل رمز الخصم" class="promo-input" :disabled="appliedPromoCode || applyingPromoCode" dir="ltr" @keyup.enter="applyPromoCode" />
                <button v-if="!appliedPromoCode" class="btn-apply-promo" @click="applyPromoCode" :disabled="!promoCodeInput.trim() || applyingPromoCode">{{ applyingPromoCode ? 'جاري...' : 'تطبيق' }}</button>
                <button v-else class="btn-remove-promo" @click="removePromoCode">إلغاء</button>
              </div>

              <div v-if="appliedPromoCode" class="applied-promo-info">
                <span class="promo-success-icon">✅</span>
                <div class="promo-details">
                  <span class="promo-code-text">{{ appliedPromoCode.code }}</span>
                  <span class="promo-discount-text">خصم {{ appliedPromoCode.discountValue }}{{ appliedPromoCode.discountType === 'percentage' ? '%' : ' د.ت' }}</span>
                </div>
              </div>

              <div v-if="availableCodes.length > 0 && !appliedPromoCode" class="available-promos">
                <p class="available-title">🏷️ أكواد الخصم المتاحة:</p>
                <div class="promo-chips">
                  <span v-for="code in availableCodes.slice(0, 5)" :key="code.id" class="promo-chip" @click="selectPromoCode(code)">
                    {{ code.code }} ({{ code.discountValue }}{{ code.discountType === 'percentage' ? '%' : ' د.ت' }})
                  </span>
                </div>
              </div>

              <div v-if="availableCodes.length === 0 && !appliedPromoCode && availablePromotions.length > 0" class="no-codes-message">
                <p>ℹ️ لا توجد أكواد خصم متاحة حالياً</p>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-card">
              <div class="card-header"><span class="card-icon">📝</span><h2 class="card-title">ملاحظات إضافية</h2></div>
              <div class="form-group"><textarea v-model="form.notes" class="form-textarea notes-textarea" rows="3" placeholder="أي ملاحظات إضافية..."></textarea></div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="order-summary">
            <div class="summary-card">
              <div class="summary-header"><span class="summary-icon">🛒</span><h2 class="summary-title">ملخص الطلب</h2><span class="items-count">{{ cartStore.items.length }} منتج</span></div>

              <div class="cart-items" v-if="cartStore.items.length > 0">
                <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                  <img :src="getSafeImageUrl(item.image, DEFAULT_PRODUCT_IMAGE)" :alt="item.name" class="item-image" @error="handleItemImageError" />
                  <div class="item-details">
                    <h4 class="item-name">{{ truncateText(item.name, 25) }}</h4>
                    <div class="item-meta">
                      <span class="item-price">{{ formatPrice(item.price) }} د.ت</span>
                      <span class="item-quantity">× {{ item.quantity }}</span>
                    </div>
                  </div>
                  <div class="item-total">{{ formatPrice(item.price * item.quantity) }} د.ت</div>
                </div>
              </div>
              <div v-else class="empty-cart"><span class="empty-icon">🛒</span><p>سلة التسوق فارغة</p><router-link to="/products" class="btn-shop">تسوق الآن</router-link></div>

              <div class="totals-section">
                <div class="total-row"><span>المجموع الفرعي</span><span>{{ formatPrice(subtotal) }} د.ت</span></div>
                <div class="total-row" v-if="codeDiscount > 0"><span>خصم الكود</span><span class="discount-amount">- {{ formatPrice(codeDiscount) }} د.ت</span></div>
                <div class="total-row"><span>تكلفة التوصيل</span><span>{{ formatPrice(shippingCost) }} د.ت</span></div>
                <div class="total-row final-total"><span>المجموع الكلي</span><span>{{ formatPrice(finalTotal) }} د.ت</span></div>
              </div>

              <div class="payment-section">
                <div class="payment-method active">
                  <div class="method-radio"><div class="radio-circle"></div></div>
                  <div class="method-content"><div class="method-header"><span class="method-icon">💵</span><strong class="method-title">الدفع عند الاستلام</strong></div><p class="method-description">ادفع نقداً عند استلام الطلب</p></div>
                </div>
                <div class="payment-info"><span class="info-icon">ℹ️</span><span>الدفع متوفر فقط نقداً عند الاستلام</span></div>
              </div>

              <button class="btn-confirm" @click="submitOrder" :disabled="isSubmitting || cartStore.items.length === 0">
                <span v-if="!isSubmitting"><span class="btn-icon">✓</span>تأكيد الطلب</span>
                <span v-else class="loading-spinner"></span>
              </button>
              <div class="secure-note"><span class="secure-icon">🔒</span><span>معلوماتك محمية ومشفرة</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span><span class="toast-message">{{ toast.message }}</span>
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

// VENDEUR ACTIF - Utiliser currentVendorId du store
const currentVendorId = computed(() => cartStore.currentVendorId)
const currentVendorName = computed(() => cartStore.currentVendorName)

const form = reactive({ fullName: '', email: '', phone1: '', phone2: '', governorate: '', delegation: '', postalCode: '', address: '', notes: '' })
const errors = reactive({ fullName: '', email: '', phone1: '', governorate: '', delegation: '', address: '' })

const shippingCost = computed(() => {
  const prices = { tunis: 7, ariana: 7, ben_arous: 7, manouba: 7, sousse: 8, sfax: 8, nabeul: 8, bizerte: 8, monastir: 8, mahdia: 9, kairouan: 9, kasserine: 10, gafsa: 10, tozeur: 12, kebili: 12, tataouine: 12, medenine: 10, gabes: 10, beja: 9, jendouba: 9, kef: 9, siliana: 9, zaghouan: 8 }
  return prices[form.governorate] || 10
})

const subtotal = computed(() => cartStore.items.reduce((t, i) => t + (i.price * i.quantity), 0))

const autoAppliedDiscounts = computed(() => {
  if (!cartStore.items.length) return []
  const now = new Date()
  const saved = localStorage.getItem('specialOffers')
  if (!saved) return []
  try {
    return JSON.parse(saved).filter(o => {
      if (!o.active || o.type === 'code' || !o.autoApply) return false
      if (o.expiryDate && new Date(o.expiryDate) < now) return false
      if (o.minPurchase && cartStore.totalPrice < o.minPurchase) return false
      return true
    })
  } catch (e) { return [] }
})

const availableCodes = computed(() => availablePromotions.value.filter(o => o.type === 'code' && o.code))

const codeDiscount = computed(() => {
  if (!appliedPromoCode.value) return 0
  const code = appliedPromoCode.value
  if (code.minPurchase && cartStore.totalPrice < code.minPurchase) return 0
  if (code.maxUses && code.maxUses > 0 && (code.usedCount || 0) >= code.maxUses) return 0
  let discount = 0
  if (code.discountType === 'percentage') discount = subtotal.value * (code.discountValue / 100)
  else if (code.discountType === 'fixed') discount = code.discountValue
  return Math.min(discount, subtotal.value)
})

const finalTotal = computed(() => Math.max(0, cartStore.totalPrice + shippingCost.value - codeDiscount.value))
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
    if (saved) {
      const now = new Date()
      const allOffers = JSON.parse(saved)
      availablePromotions.value = allOffers.filter(o => {
        const isCode = o.type === 'code' && o.active && o.code
        if (o.expiryDate && new Date(o.expiryDate) < now) return false
        if (o.maxUses && o.maxUses > 0 && (o.usedCount || 0) >= o.maxUses) return false
        return isCode
      })
    } else {
      availablePromotions.value = []
    }
  } catch (e) { console.error('❌ Erreur:', e); availablePromotions.value = [] }
}

const selectPromoCode = (promo) => { promoCodeInput.value = promo.code; applyPromoCode() }

const applyPromoCode = () => {
  if (!promoCodeInput.value.trim()) return showNotification('الرجاء إدخال رمز الخصم', 'warning')
  applyingPromoCode.value = true
  const codeOffer = availablePromotions.value.find(p => p.type === 'code' && p.code?.toUpperCase() === promoCodeInput.value.trim().toUpperCase())
  if (!codeOffer) { applyingPromoCode.value = false; return showNotification('❌ رمز الخصم غير صالح أو منتهي', 'error') }
  if (codeOffer.maxUses && codeOffer.maxUses > 0 && (codeOffer.usedCount || 0) >= codeOffer.maxUses) { applyingPromoCode.value = false; return showNotification('❌ تم تجاوز الحد الأقصى للكود', 'error') }
  appliedPromoCode.value = codeOffer
  localStorage.setItem('activePromoCode', JSON.stringify(codeOffer))
  showNotification(`✅ تم تطبيق: ${codeOffer.code}`, 'success')
  applyingPromoCode.value = false
}

const removePromoCode = () => { appliedPromoCode.value = null; promoCodeInput.value = ''; localStorage.removeItem('activePromoCode') }

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(k => errors[k] = '')
  if (!form.fullName.trim() || form.fullName.trim().length < 3) { errors.fullName = 'الاسم الكامل مطلوب'; isValid = false }
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'بريد إلكتروني غير صحيح'; isValid = false }
  if (!form.phone1 || !/^[0-9]{8}$/.test(form.phone1)) { errors.phone1 = 'رقم هاتف غير صحيح'; isValid = false }
  if (!form.governorate) { errors.governorate = 'الرجاء اختيار الولاية'; isValid = false }
  if (!form.delegation) { errors.delegation = 'الرجاء اختيار المعتمدية'; isValid = false }
  if (!form.address.trim()) { errors.address = 'العنوان التفصيلي مطلوب'; isValid = false }
  return isValid
}

const syncStockAfterOrder = async () => {
  for (const item of cartStore.items) {
    const pid = cartStore.getItemId(item)
    if (!pid) continue
    try {
      await api.put(`/stock/${pid}`, { quantity: -(item.quantity || 1) })
    } catch (e) {}
  }
  window.dispatchEvent(new CustomEvent('orderPlaced'))
}

// ✅ submitOrder CORRIGÉE - Redirection vers la page des commandes
const submitOrder = async () => {
  if (!validateForm()) return
  if (cartStore.items.length === 0) return showNotification('سلة التسوق فارغة', 'error')

  // Vérifier qu'il y a un vendeur associé au panier
  if (!currentVendorId.value) {
    showNotification('⚠️ لا يمكن تحديد البائع لهذه الطلبية', 'error')
    return
  }

  isSubmitting.value = true

  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        productId: cartStore.getItemId(item) || item.id,
        productName: item.name || 'منتج',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || null
      })),
      customerName: form.fullName.trim(),
      customerEmail: form.email.trim(),
      customerPhone1: form.phone1.trim(),
      customerPhone2: form.phone2 || null,
      governorate: form.governorate,
      delegation: form.delegation,
      postalCode: form.postalCode || null,
      address: form.address.trim(),
      subtotal: subtotal.value,
      shipping: shippingCost.value,
      total: finalTotal.value,
      paymentMethod: 'cash_on_delivery',
      notes: form.notes || null,
      vendorId: parseInt(currentVendorId.value),
      vendorName: currentVendorName.value
    }

    console.log('📦 [Checkout] Envoi commande pour vendeur:', currentVendorName.value)

    let response
    try {
      response = await api.post('/orders', orderData)
      console.log('✅ [Checkout] Réponse API:', response.data)
    } catch (apiError) {
      console.error('❌ [Checkout] Erreur API:', apiError.message)

      const localOrder = {
        ...orderData,
        id: Date.now(),
        orderNumber: `LOCAL-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
      savedOrders.unshift(localOrder)
      localStorage.setItem('userOrders', JSON.stringify(savedOrders))

      const vendorOrders = JSON.parse(localStorage.getItem(`vendor_orders_${currentVendorId.value}`) || '[]')
      vendorOrders.unshift(localOrder)
      localStorage.setItem(`vendor_orders_${currentVendorId.value}`, JSON.stringify(vendorOrders))

      showNotification('✅ تم حفظ الطلب محلياً (سيتم المزامنة لاحقاً)', 'warning')
      cartStore.clearCart()

      // ✅ Redirection UNIVERSELLE vers la page des commandes
      setTimeout(() => {
        router.push('/orders')
      }, 2000)

      isSubmitting.value = false
      return
    }

    if (response.data.success) {
      if (appliedPromoCode.value) {
        try {
          const saved = localStorage.getItem('specialOffers')
          if (saved) {
            const offers = JSON.parse(saved)
            const idx = offers.findIndex(o => o.id === appliedPromoCode.value.id)
            if (idx !== -1) {
              offers[idx].usedCount = (offers[idx].usedCount || 0) + 1
              localStorage.setItem('specialOffers', JSON.stringify(offers))
            }
          }
        } catch (e) { console.error('Erreur mise à jour promo:', e) }
      }

      await syncStockAfterOrder()
      cartStore.clearCart()
      showNotification('✅ تم تأكيد الطلب بنجاح')

      // ✅ Redirection UNIVERSELLE vers la page des commandes
      setTimeout(() => {
        router.push('/orders')
      }, 2000)
    } else {
      showNotification(response.data.message || '❌ حدث خطأ', 'error')
    }
  } catch (error) {
    console.error('❌ [Checkout] Erreur globale:', error)
    showNotification('❌ حدث خطأ غير متوقع', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleOffersUpdated = () => { loadAvailablePromotions() }

onMounted(() => {
  if (cartStore.items.length === 0) {
    showNotification('سلة التسوق فارغة', 'warning')
    setTimeout(() => router.push('/products'), 2000)
    return
  }

  if (!cartStore.currentVendorId && cartStore.items.length > 0) {
    console.warn('⚠️ Panier sans vendeur associé')
  }

  cartStore.loadFromStorage()
  loadAvailablePromotions()
  window.addEventListener('special-offers:updated', handleOffersUpdated)

  if (authStore.isAuthenticated) {
    form.fullName = authStore.userName || ''
    form.email = authStore.userEmail || ''
    form.phone1 = authStore.userPhone || ''
    form.address = authStore.userAddress || ''
  }
})

onUnmounted(() => {
  window.removeEventListener('special-offers:updated', handleOffersUpdated)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
.checkout-page{min-height:100vh;background:#f8fafc;font-family:'Amiri','Cairo',sans-serif;direction:rtl}
.checkout-page.dark-mode{background:#0f172a}
.container{max-width:1200px;margin:0 auto;padding:0 20px}
.page-header{background:linear-gradient(135deg,#08717f,#d40025);color:#fff;padding:40px 0;margin-bottom:40px}
.header-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.page-title{font-size:2.2rem;font-weight:800}
.header-steps{display:flex;align-items:center;gap:15px}
.step{display:flex;flex-direction:column;align-items:center;gap:5px}
.step-number{width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
.step.active .step-number{background:#fff;color:#08717f}
.step-line{width:40px;height:2px;background:rgba(255,255,255,.3)}
.main-content{padding-bottom:60px}

.vendor-alert{display:flex;align-items:center;gap:15px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;padding:15px 20px;margin-bottom:25px;border:1px solid #f59e0b}
.vendor-alert-icon{font-size:1.5rem}
.vendor-alert-content{display:flex;flex-direction:column;gap:4px}
.vendor-alert-content strong{color:#b45309;font-size:1rem}
.vendor-alert-content span{color:#92400e;font-size:0.85rem}
.dark-mode .vendor-alert{background:linear-gradient(135deg,#3b2e00,#2a2500);border-color:#f59e0b}
.dark-mode .vendor-alert-content strong{color:#fbbf24}
.dark-mode .vendor-alert-content span{color:#fcd34d}

.checkout-grid{display:grid;grid-template-columns:1fr 380px;gap:30px}
.form-card{background:#fff;border-radius:20px;padding:25px;margin-bottom:25px;box-shadow:0 4px 15px rgba(0,0,0,.05);border:1px solid #e2e8f0}
.dark-mode .form-card,.dark-mode .summary-card{background:#1f2937;border-color:#374151}
.card-header{display:flex;align-items:center;gap:12px;margin-bottom:25px;padding-bottom:15px;border-bottom:2px solid #f1f5f9}
.card-title{font-size:1.3rem;font-weight:700;color:#1e293b}
.dark-mode .card-title{color:#f3f4f6}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.form-label{display:block;font-size:.95rem;font-weight:600;margin-bottom:8px}
.required{color:#d40025}
.optional{color:#64748b;font-size:.8rem}
.form-input,.form-select,.form-textarea{width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:1rem;background:#fff}
.dark-mode .form-input,.dark-mode .form-select,.dark-mode .form-textarea{background:#374151;border-color:#4b5563;color:#f3f4f6}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:#08717f}
.error-text{color:#ef4444;font-size:.8rem;margin-top:4px}
.phone-input-wrapper{display:flex;border:2px solid #e2e8f0;border-radius:12px;overflow:hidden}
.phone-country{padding:12px 16px;background:#f1f5f9;color:#08717f;font-weight:700;border-left:2px solid #e2e8f0}
.phone-input{flex:1;border:none!important}

.auto-offers-section{margin-bottom:15px;padding:12px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0}
.auto-offers-title{font-size:.85rem;font-weight:600;color:#15803d;margin-bottom:8px}
.auto-offer-item{display:flex;align-items:center;gap:8px;padding:8px;background:#fff;border-radius:8px;margin-bottom:6px;border:1px solid #e2e8f0}
.auto-offer-details{display:flex;justify-content:space-between;flex:1}
.auto-offer-discount{font-size:.8rem;color:#10b981;font-weight:700}

.promo-input-group{display:flex;gap:10px;margin-bottom:15px}
.promo-input{flex:1;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:1rem}
.promo-input:disabled{background:#f1f5f9}
.btn-apply-promo,.btn-remove-promo{padding:12px 24px;border:none;border-radius:12px;font-weight:600;cursor:pointer;white-space:nowrap}
.btn-apply-promo{background:linear-gradient(135deg,#08717f,#065a69);color:#fff}
.btn-remove-promo{background:#ef4444;color:#fff}
.btn-apply-promo:disabled{opacity:.6}
.applied-promo-info{display:flex;align-items:center;gap:12px;padding:15px;background:#f0fdf4;border:1px solid #10b981;border-radius:12px;margin-bottom:15px}
.promo-code-text{font-weight:700;font-size:1.1rem;font-family:monospace}
.promo-discount-text{color:#10b981;font-weight:600}

.available-promos{margin-top:15px}
.available-title{font-size:.85rem;color:#64748b;margin-bottom:10px}
.promo-chips{display:flex;flex-wrap:wrap;gap:8px}
.promo-chip{display:inline-block;padding:6px 14px;background:#fef3c7;color:#b45309;border-radius:30px;font-size:.8rem;font-weight:600;cursor:pointer;border:1px solid #f59e0b;transition:all .2s}
.promo-chip:hover{background:#f59e0b;color:#fff;transform:scale(1.02)}
.no-codes-message{padding:10px;text-align:center;color:#64748b;font-size:.85rem}

.order-summary{position:sticky;top:100px}
.summary-card{background:#fff;border-radius:20px;padding:25px;box-shadow:0 4px 15px rgba(0,0,0,.05);border:1px solid #e2e8f0}
.summary-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #f1f5f9}
.summary-title{flex:1;font-size:1.3rem;font-weight:700}
.items-count{font-size:.85rem;color:#64748b;background:#f1f5f9;padding:4px 10px;border-radius:20px}

.cart-items{max-height:350px;overflow-y:auto;margin-bottom:20px}
.cart-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}
.item-image{width:60px;height:60px;border-radius:10px;object-fit:cover;border:1px solid #e2e8f0}
.item-details{flex:1}
.item-name{font-size:.95rem;font-weight:600;margin-bottom:5px}
.item-meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.item-price{color:#d40025;font-weight:700;font-size:.9rem}
.item-total{font-weight:700;color:#08717f;font-size:.95rem;min-width:70px;text-align:left}

.empty-cart{text-align:center;padding:30px;background:#f8fafc;border-radius:16px;margin-bottom:20px}
.btn-shop{display:inline-block;padding:10px 25px;background:linear-gradient(135deg,#08717f,#065a69);color:#fff;text-decoration:none;border-radius:30px;font-weight:600}

.totals-section{margin:20px 0;padding:20px 0;border-top:2px solid #f1f5f9;border-bottom:2px solid #f1f5f9}
.total-row{display:flex;justify-content:space-between;margin-bottom:12px;color:#475569}
.discount-amount{color:#10b981}
.total-row.final-total{margin-top:12px;padding-top:12px;border-top:2px solid #f1f5f9;font-size:1.2rem;font-weight:800;color:#1e293b}

.payment-method{display:flex;align-items:center;gap:15px;padding:18px;background:#f0f9ff;border:2px solid #08717f;border-radius:16px;margin:20px 0}
.method-radio{width:22px;height:22px;background:#fff;border:2px solid #08717f;border-radius:50%;display:flex;align-items:center;justify-content:center}
.radio-circle{width:12px;height:12px;background:#08717f;border-radius:50%}

.btn-confirm{width:100%;padding:16px;background:linear-gradient(135deg,#d40025,#b00020);color:#fff;border:none;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:pointer;margin:15px 0 10px;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-confirm:disabled{opacity:.5;cursor:not-allowed}
.secure-note{text-align:center;color:#64748b;font-size:.85rem}

.toast-notification{position:fixed;bottom:30px;right:30px;display:flex;align-items:center;gap:12px;padding:14px 24px;background:#fff;border-radius:50px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:9999;border-right:4px solid;animation:slideInRight .3s ease}
.toast-notification.success{border-right-color:#10b981}
.toast-notification.error{border-right-color:#ef4444}
.toast-progress{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#08717f,#d40025);animation:progress 3s linear forwards}
@keyframes progress{from{width:0}to{width:100%}}
@keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}

@media(max-width:992px){.checkout-grid{grid-template-columns:1fr}.order-summary{position:static}}
@media(max-width:768px){.form-row{grid-template-columns:1fr}.page-title{font-size:1.8rem}}

.checkout-page.dark-mode .vendor-alert{background:linear-gradient(135deg,#3b2e00,#2a2500);border-color:#f59e0b}
.checkout-page.dark-mode .vendor-alert-content strong{color:#fbbf24}
.checkout-page.dark-mode .vendor-alert-content span{color:#fcd34d}
.checkout-page.dark-mode .form-card,.checkout-page.dark-mode .summary-card{background:#1e1e30;border-color:#2a2a40}
.checkout-page.dark-mode .card-header{border-bottom-color:#2a2a40}
.checkout-page.dark-mode .card-title{color:#f1f5f9}
.checkout-page.dark-mode .form-label{color:#cbd5e1}
.checkout-page.dark-mode .form-input,.checkout-page.dark-mode .form-select,.checkout-page.dark-mode .form-textarea{background:#121220;border-color:#2a2a40;color:#f1f5f9}
.checkout-page.dark-mode .form-input:focus,.checkout-page.dark-mode .form-select:focus,.checkout-page.dark-mode .form-textarea:focus{border-color:#2dd4bf}
.checkout-page.dark-mode .phone-input-wrapper{background:#121220;border-color:#2a2a40}
.checkout-page.dark-mode .phone-country{background:#1e1e30;color:#2dd4bf;border-left-color:#2a2a40}
.checkout-page.dark-mode .auto-offers-section{background:#0a1f1a;border-color:#14532d}
.checkout-page.dark-mode .auto-offers-title{color:#34d399}
.checkout-page.dark-mode .auto-offer-item{background:#121220;border-color:#2a2a40}
.checkout-page.dark-mode .auto-offer-discount{color:#34d399}
.checkout-page.dark-mode .promo-input{background:#121220;border-color:#2a2a40;color:#f1f5f9}
.checkout-page.dark-mode .promo-chip{background:#3b2e00;color:#fbbf24;border-color:#f59e0b}
.checkout-page.dark-mode .promo-chip:hover{background:#f59e0b;color:#161627}
.checkout-page.dark-mode .cart-item{border-bottom-color:#2a2a40}
.checkout-page.dark-mode .item-name{color:#f1f5f9}
.checkout-page.dark-mode .item-price{color:#ef4444}
.checkout-page.dark-mode .item-total{color:#2dd4bf}
.checkout-page.dark-mode .empty-cart{background:#121220}
.checkout-page.dark-mode .totals-section{border-top-color:#2a2a40;border-bottom-color:#2a2a40}
.checkout-page.dark-mode .total-row{color:#94a3b8}
.checkout-page.dark-mode .total-row.final-total{color:#f1f5f9}
.checkout-page.dark-mode .payment-method{background:#0c1a2e;border-color:#2dd4bf}
.checkout-page.dark-mode .method-radio{background:#1e1e30;border-color:#2dd4bf}
.checkout-page.dark-mode .radio-circle{background:#2dd4bf}
.checkout-page.dark-mode .method-title{color:#f1f5f9}
.checkout-page.dark-mode .method-description{color:#94a3b8}
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; gap: 12px; }
  .page-title { font-size: 1.5rem; }
  .checkout-page .header-content { flex-direction: column; gap: 16px; }
  .header-steps { overflow-x: auto; padding-bottom: 4px; white-space: nowrap; }
  .toast-notification { right: 16px; left: 16px; bottom: 16px; border-radius: 16px; }
}
@media (max-width: 480px) {
  input, select, textarea { font-size: 16px !important; }
}
</style>
