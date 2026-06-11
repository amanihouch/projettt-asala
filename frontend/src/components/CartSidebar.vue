<!-- src/components/CartSidebar.vue - Version complètement corrigée -->
<template>
  <div class="cart-sidebar-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <transition name="overlay">
      <div v-if="cartStore.isOpen" class="cart-overlay" @click="cartStore.closeCart()"></div>
    </transition>

    <transition name="slide">
      <aside v-if="cartStore.isOpen" class="cart-sidebar">
        <div class="cart-header">
          <div class="header-title">
            <span class="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
            <h3>سلة التسوق</h3>
            <span v-if="validItems.length > 0" class="item-count">{{ validItems.length }} منتج</span>
            <!-- ✅ AFFICHAGE VENDEUR ACTIF -->
            <span v-if="currentVendorName" class="vendor-badge">{{ currentVendorName }}</span>
          </div>
          <button @click="cartStore.closeCart()" class="close-btn" aria-label="إغلاق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div v-if="validItems.length === 0" class="cart-empty">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <p class="empty-title">السلة فارغة</p>
          <p class="empty-subtitle">أضف منتجاتك المفضلة إلى السلة</p>
          <button class="btn-primary" @click="cartStore.closeCart()">
            <span>تسوق الآن</span>
            <span class="btn-arrow">←</span>
          </button>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="(item, index) in validItems" :key="`cart-${cartStore.getItemId(item)}-${index}`" class="cart-item">
              <img
                :src="getItemImageUrl(item)"
                :alt="item.name || 'منتج'"
                class="item-image"
                @error="(e) => handleImageError(e)"
              />
              <div class="item-details">
                <h4>{{ truncateText(item.name || 'منتج', 30) }}</h4>
                <p class="item-vendor">
                  <span class="vendor-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </span>
                  {{ item.vendorName || 'بائع' }}
                </p>
                <p class="item-price">{{ formatPrice(item.price || 0) }} د.ت</p>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity(item)" class="qty-btn" :disabled="(item.quantity || 1) <= 1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                    </svg>
                  </button>
                  <span class="qty-value">{{ item.quantity || 1 }}</span>
                  <button @click="increaseQuantity(item)" class="qty-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/>
                      <line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="item-total-price">{{ formatPrice((item.price || 0) * (item.quantity || 1)) }} د.ت</div>
              <button @click="removeItem(item)" class="remove-btn" title="حذف">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="cart-footer">
            <div class="cart-summary">
              <!-- ✅ AFFICHAGE VENDEUR DANS LE RÉSUMÉ -->
              <div class="summary-row" v-if="currentVendorName">
                <span>البائع</span>
                <span class="vendor-name">{{ currentVendorName }}</span>
              </div>
              <div class="summary-row">
                <span>المجموع الفرعي</span>
                <span>{{ formatPrice(subtotal) }} د.ت</span>
              </div>
              <div class="summary-row total">
                <span>الإجمالي</span>
                <span class="total-price">{{ formatPrice(validTotal) }} د.ت</span>
              </div>
            </div>
            <div class="cart-actions">
              <!-- ✅ BOUTON "إفراغ السلة" -->
              <button class="btn-clear-cart" @click="clearCartItems">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>إفراغ السلة</span>
              </button>
              <button class="btn-continue" @click="cartStore.closeCart()">
                <span>مواصلة التسوق</span>
              </button>
              <button class="btn-checkout" @click="goToCheckout">
                <span>إتمام الطلب</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </transition>

    <!-- ALERTE CONFLIT VENDEUR -->
    <transition name="alert-fade">
      <div v-if="vendorConflictMessage" class="vendor-conflict-alert" :class="{ 'dark-mode': isDarkMode }">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <p class="alert-title">تعذر إضافة المنتج</p>
          <p class="alert-message">{{ vendorConflictMessage }}</p>
          <div class="alert-actions">
            <button class="alert-action-primary" @click="clearVendorConflict">مواصلة التسوق</button>
            <button class="alert-action-secondary" @click="clearCartAndRetry">إفراغ السلة</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import api from '../services/api'

const router = useRouter()
const cartStore = useCartStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const isOrderPlaced = ref(false)
const isOrderCancelled = ref(false)
const vendorConflictMessage = ref(null)

// ✅ Récupérer le vendeur actuel depuis le store
const currentVendorId = computed(() => cartStore.currentVendorId?.value || cartStore.currentVendorId)
const currentVendorName = computed(() => cartStore.currentVendorName?.value || cartStore.currentVendorName)

// ✅ ITEMS VALIDES
const validItems = computed(() => cartStore.items.filter(item => cartStore.getItemId(item) !== null))

// ✅ SOUS-TOTAL (prix × quantité de chaque article)
const subtotal = computed(() => {
  return validItems.value.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0)
})

// ✅ TOTAL (alias subtotal)
const validTotal = computed(() => subtotal.value)

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http') || url.startsWith('data:image') || url.includes('cloudinary.com')
}

const getItemImageUrl = (item) => {
  if (item?.image && isValidImageUrl(item.image)) return item.image
  if (Array.isArray(item?.images) && item.images[0] && isValidImageUrl(item.images[0])) return item.images[0]
  const id = cartStore.getItemId(item)
  if (id) return `https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/posts/post_${id}.jpg`
  return `https://placehold.co/400x400/08717f/white?text=Produit`
}

const handleImageError = (e) => {
  if (e.target.src.includes('placehold.co')) return
  e.target.src = `https://placehold.co/400x400/08717f/white?text=Produit`
}

const formatPrice = (price) => {
  const num = parseFloat(price) || 0
  return new Intl.NumberFormat('ar-TN').format(num.toFixed(3))
}
const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const increaseQuantity = (item) => {
  const id = cartStore.getItemId(item)
  if (id === null) return
  const newQty = (item.quantity || 1) + 1
  cartStore.updateQuantity(id, newQty)
}

const decreaseQuantity = (item) => {
  const id = cartStore.getItemId(item)
  if (id === null) return
  const newQty = (item.quantity || 1) - 1
  if (newQty < 1) return
  cartStore.updateQuantity(id, newQty)
}

const removeItem = (item) => {
  const id = cartStore.getItemId(item)
  if (id === null) return
  cartStore.removeItem(id)
}

// ✅ BOUTON "إفراغ السلة"
const clearCartItems = async () => {
  if (validItems.value.length === 0) return
  if (confirm('هل أنت متأكد من تفريغ سلة التسوق؟')) {
    await cartStore.clearCart()
    showToast('🗑️ تم تفريغ السلة بنجاح', 'success')
  }
}

const showToast = (msg, type = 'success') => {
  const toastDiv = document.createElement('div')
  toastDiv.className = `custom-toast ${type}`
  toastDiv.innerHTML = `<div class="toast-content">${msg}</div>`
  document.body.appendChild(toastDiv)
  setTimeout(() => toastDiv.remove(), 3000)
}

const syncStockAfterOrder = async () => {
  if (isOrderPlaced.value) return
  isOrderPlaced.value = true
  for (const item of validItems.value) {
    const productId = cartStore.getItemId(item)
    if (productId === null) continue
    try {
      await api.put(`/stock/${productId}`, { quantity: item.quantity || 1, size: item.size || null })
    } catch (error) {}
  }
}

const restoreStockAfterCancel = async () => {
  if (isOrderCancelled.value) return
  isOrderCancelled.value = true
  for (const item of validItems.value) {
    const productId = cartStore.getItemId(item)
    if (productId === null) continue
    try {
      await api.put(`/stock/${productId}`, { quantity: -(item.quantity || 1), size: item.size || null })
    } catch (error) {}
  }
}

const goToCheckout = () => {
  cartStore.closeCart()
  router.push('/checkout')
}

const showVendorConflict = (event) => {
  vendorConflictMessage.value = event.detail.reason
  setTimeout(() => {
    vendorConflictMessage.value = null
  }, 8000)
}

const clearVendorConflict = () => {
  vendorConflictMessage.value = null
}

const clearCartAndRetry = async () => {
  await cartStore.clearCart()
  vendorConflictMessage.value = null
  cartStore.closeCart()
}

onMounted(() => {
  console.log('🛒 CartSidebar monté')
  console.log('📦 Vendeur actuel:', currentVendorName.value)
  console.log('📦 Items dans le panier:', validItems.value.length)

  window.addEventListener('orderPlaced', syncStockAfterOrder)
  window.addEventListener('orderCancelled', restoreStockAfterCancel)
  window.addEventListener('cartVendorConflict', showVendorConflict)
})

onUnmounted(() => {
  window.removeEventListener('orderPlaced', syncStockAfterOrder)
  window.removeEventListener('orderCancelled', restoreStockAfterCancel)
  window.removeEventListener('cartVendorConflict', showVendorConflict)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.cart-sidebar-wrapper { position: relative; z-index: 9999; font-family: 'Amiri', 'Cairo', serif; }
.cart-sidebar-wrapper.dark-mode .cart-sidebar { background: #1e293b; }
.cart-sidebar-wrapper.dark-mode .cart-header { background: #1e293b; border-bottom-color: #334155; }
.cart-sidebar-wrapper.dark-mode .cart-header h3 { color: #f1f5f9; }
.cart-sidebar-wrapper.dark-mode .item-count { background: #334155; color: #2dd4bf; }
.cart-sidebar-wrapper.dark-mode .vendor-badge { background: #334155; color: #fbbf24; }
.cart-sidebar-wrapper.dark-mode .close-btn { background: #334155; color: #94a3b8; }
.cart-sidebar-wrapper.dark-mode .cart-item { background: #0f172a; border-color: #334155; }
.cart-sidebar-wrapper.dark-mode .item-details h4 { color: #f1f5f9; }
.cart-sidebar-wrapper.dark-mode .item-vendor { color: #94a3b8; }
.cart-sidebar-wrapper.dark-mode .item-price { color: #ff6b6b; }
.cart-sidebar-wrapper.dark-mode .cart-footer { background: #1e293b; border-top-color: #334155; }
.cart-sidebar-wrapper.dark-mode .summary-row { color: #94a3b8; }
.cart-sidebar-wrapper.dark-mode .summary-row.total { border-top-color: #334155; color: #f1f5f9; }
.cart-sidebar-wrapper.dark-mode .total-price { color: #ff6b6b; }
.cart-sidebar-wrapper.dark-mode .btn-continue { background: #334155; color: #94a3b8; }
.cart-sidebar-wrapper.dark-mode .btn-clear-cart { background: #7f1a1a; color: #fecaca; border-color: #991b1b; }
.cart-sidebar-wrapper.dark-mode .btn-clear-cart:hover { background: #991b1b; }

.cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(3px); z-index: 9998; }
.cart-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 100%; max-width: 420px; background: #fff; z-index: 9999; display: flex; flex-direction: column; box-shadow: -5px 0 30px rgba(0,0,0,0.1); direction: rtl; }
.cart-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #eef2f6; background: #fff; }
.header-title { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-icon svg { width: 24px; height: 24px; stroke: #08717f; }
.cart-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0; }
.item-count { background: #eef2f6; padding: 4px 10px; border-radius: 30px; font-size: 0.7rem; font-weight: 600; color: #08717f; }
.vendor-badge { background: #eef2f6; padding: 4px 10px; border-radius: 30px; font-size: 0.7rem; font-weight: 600; color: #d40025; }
.close-btn { width: 36px; height: 36px; background: #f1f5f9; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.2s; }
.close-btn:hover { background: #d40025; color: white; transform: rotate(90deg); }

.cart-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
.empty-icon { margin-bottom: 20px; opacity: 0.3; }
.empty-title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.empty-subtitle { font-size: 0.85rem; color: #64748b; margin-bottom: 25px; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #08717f, #065a69); color: white; border: none; border-radius: 40px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(8,113,127,0.3); }

.cart-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.cart-items { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 16px; position: relative; border: 1px solid #eef2f6; align-items: center; }
.cart-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.item-image { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; background: #e2e8f0; }
.item-details { flex: 2; }
.item-details h4 { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
.item-vendor { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: #64748b; margin-bottom: 6px; }
.item-price { color: #d40025; font-weight: 700; font-size: 0.85rem; margin-bottom: 8px; }
.quantity-controls { display: flex; align-items: center; gap: 8px; }
.qty-btn { width: 28px; height: 28px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.qty-btn:hover:not(:disabled) { background: #08717f; border-color: #08717f; }
.qty-btn:hover:not(:disabled) svg { stroke: white; }
.qty-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.qty-value { min-width: 30px; text-align: center; font-weight: 600; }
.item-total-price { font-weight: 700; font-size: 0.85rem; color: #08717f; min-width: 80px; text-align: left; }
.remove-btn { position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: white; border: 1px solid #eef2f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s; }
.cart-item:hover .remove-btn { opacity: 1; }
.remove-btn:hover { background: #d40025; border-color: #d40025; }
.remove-btn:hover svg { stroke: white; }

.cart-footer { padding: 20px; border-top: 1px solid #eef2f6; background: #fff; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; color: #64748b; }
.summary-row.total { padding-top: 12px; margin-top: 8px; border-top: 1px solid #eef2f6; font-size: 1rem; font-weight: 700; color: #1e293b; }
.total-price { color: #d40025; font-size: 1.2rem; font-weight: 800; }
.cart-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.btn-continue, .btn-checkout, .btn-clear-cart { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: none; border-radius: 40px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-continue { background: #f1f5f9; color: #64748b; }
.btn-continue:hover { background: #e2e8f0; }
.btn-checkout { background: linear-gradient(135deg, #d40025, #b00020); color: white; }
.btn-checkout:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212,0,37,0.3); }
.btn-clear-cart { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.btn-clear-cart:hover { background: #fee2e2; transform: translateY(-2px); }

/* Alert Vendor Conflict */
.vendor-conflict-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 28px;
  text-align: center;
  z-index: 10001;
  max-width: 360px;
  width: 90%;
  direction: rtl;
  animation: slideUpAlert 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vendor-conflict-alert.dark-mode {
  background: #1e293b;
  border: 1px solid #334155;
}

.alert-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.alert-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .alert-title {
  color: #f1f5f9;
}

.alert-message {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.dark-mode .alert-message {
  color: #94a3b8;
}

.alert-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.alert-action-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.alert-action-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8,113,127,0.3);
}

.alert-action-secondary {
  padding: 10px 24px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .alert-action-secondary {
  background: #334155;
  color: #94a3b8;
}

.alert-action-secondary:hover {
  background: #e2e8f0;
}

.dark-mode .alert-action-secondary:hover {
  background: #475569;
  color: #f1f5f9;
}

@keyframes slideUpAlert {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.alert-fade-enter-active, .alert-fade-leave-active {
  transition: all 0.3s ease;
}
.alert-fade-enter-from, .alert-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.3s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }

.custom-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  animation: slideUp 0.3s ease;
}
.custom-toast .toast-content {
  background: #1e293b;
  color: white;
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.custom-toast.success .toast-content { background: #10b981; }
.custom-toast.error .toast-content { background: #ef4444; }
.custom-toast.warning .toast-content { background: #f59e0b; }
@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 480px) {
  .cart-sidebar { max-width: 100%; }
  .cart-item { flex-wrap: wrap; }
  .item-total-price { width: 100%; text-align: right; margin-top: 8px; }
  .cart-actions { flex-direction: column; }
}
</style>
