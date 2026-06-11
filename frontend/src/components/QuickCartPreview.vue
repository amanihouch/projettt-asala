<!-- src/components/QuickCartPreview.vue - AVEC POLICE AMIRI -->
<template>
  <transition name="preview-slide">
    <div v-if="showPreview" class="quick-cart-preview" :class="{ 'dark-mode': isDarkMode }">
      <div class="preview-content">
        <!-- Success Icon -->
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>

        <div class="preview-header">
          <h4>✅ تمت الإضافة إلى السلة</h4>
          <button @click="closePreview" class="close-btn" aria-label="إغلاق">×</button>
        </div>

        <div class="preview-body">
          <div class="product-image-wrapper">
            <img :src="productImage" :alt="productName" class="product-image" @error="handleImageError" />
            <div class="image-overlay">
              <span class="check-mark">✓</span>
            </div>
          </div>
          <div class="product-info">
            <h5>{{ truncateText(productName, 40) }}</h5>
            <div class="price-info">
              <p class="price">{{ formatPrice(productPrice) }} د.ت</p>
              <span v-if="productQuantity > 1" class="quantity-badge">×{{ productQuantity }}</span>
            </div>
            <div v-if="productVendor" class="vendor-info">
              <span class="vendor-icon">🏪</span>
              <span class="vendor-name">{{ productVendor }}</span>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-row">
            <span class="summary-label">إجمالي المنتجات:</span>
            <span class="summary-value">{{ cartTotalItems }} عناصر</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">المجموع الكلي:</span>
            <span class="summary-value">{{ formatPrice(cartTotalPrice) }} د.ت</span>
          </div>
        </div>

        <div class="preview-actions">
          <button @click="goToCart" class="btn btn-primary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18l-2 10H5L3 6z" stroke="currentColor" stroke-width="2" />
              <circle cx="9" cy="19" r="2" stroke="currentColor" stroke-width="2" />
              <circle cx="19" cy="19" r="2" stroke="currentColor" stroke-width="2" />
            </svg>
            عرض السلة ({{ cartTotalItems }})
          </button>
          <button @click="continueShopping" class="btn btn-outline">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 12h16M12 4v16" stroke="currentColor" stroke-width="2" />
            </svg>
            مواصلة التسوق
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const cartStore = useCartStore()
const themeStore = useThemeStore()

// ===== DARK MODE - Synchronized with global theme store (header) =====
const isDarkMode = computed(() => themeStore.isDarkMode)

const showPreview = ref(false)
const autoCloseTimer = ref(null)
const progressWidth = ref(100)

const lastItem = computed(() => {
  const items = cartStore.items
  return items[items.length - 1]
})

const productName = computed(() => lastItem.value?.name || lastItem.value?.productName || '')
const productPrice = computed(() => lastItem.value?.price || 0)
const productImage = computed(() => lastItem.value?.image || lastItem.value?.images?.[0] || '')
const productQuantity = computed(() => lastItem.value?.quantity || 1)
const productVendor = computed(() => lastItem.value?.vendorName || lastItem.value?.vendor?.name || '')

const cartTotalItems = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
})

const cartTotalPrice = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/100x100/08717f/white?text=منتج'
}

const startAutoCloseTimer = () => {
  if (autoCloseTimer.value) clearTimeout(autoCloseTimer.value)

  progressWidth.value = 100
  const duration = 5000
  const interval = 50
  const step = (interval / duration) * 100

  const timer = setInterval(() => {
    if (progressWidth.value > 0) {
      progressWidth.value = Math.max(0, progressWidth.value - step)
    } else {
      clearInterval(timer)
    }
  }, interval)

  autoCloseTimer.value = setTimeout(() => {
    closePreview()
    clearInterval(timer)
  }, duration)
}

const stopAutoCloseTimer = () => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
}

const goToCart = () => {
  stopAutoCloseTimer()
  closePreview()
  router.push('/cart')
}

const continueShopping = () => {
  stopAutoCloseTimer()
  closePreview()
}

const closePreview = () => {
  showPreview.value = false
  stopAutoCloseTimer()
  progressWidth.value = 100
}

const show = () => {
  if (showPreview.value) {
    stopAutoCloseTimer()
    progressWidth.value = 100
    startAutoCloseTimer()
  } else {
    showPreview.value = true
    startAutoCloseTimer()
  }
}

// Exposer pour utilisation depuis d'autres composants
defineExpose({
  show,
  close: closePreview
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoCloseTimer()
})
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.quick-cart-preview {
  font-family: 'Amiri', 'Cairo', serif;
}

.quick-cart-preview * {
  font-family: 'Amiri', 'Cairo', serif;
}

.quick-cart-preview {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 10000;
  max-width: 380px;
  width: calc(100% - 60px);
  animation: slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Dark mode */
.quick-cart-preview.dark-mode .preview-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.4);
}

.preview-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.2);
}

/* Success Icon */
.success-icon {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.success-icon svg {
  width: 32px;
  height: 32px;
  stroke: white;
  stroke-width: 2;
}

/* Preview Header */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.preview-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .preview-header h4 {
  color: #f1f5f9;
}

.close-btn {
  background: rgba(241, 245, 249, 0.8);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.quick-cart-preview.dark-mode .close-btn {
  background: rgba(51, 65, 85, 0.8);
  color: #94a3b8;
}

.close-btn:hover {
  background: #d40025;
  color: white;
  transform: rotate(90deg);
}

/* Preview Body */
.preview-body {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  background: rgba(248, 250, 252, 0.5);
  padding: 15px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.quick-cart-preview.dark-mode .preview-body {
  background: rgba(15, 23, 42, 0.5);
}

.product-image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.quick-cart-preview.dark-mode .product-image {
  border-color: #334155;
}

.product-image-wrapper:hover .product-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(8, 113, 127, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.check-mark {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  animation: scaleIn 0.3s ease;
}

.product-info {
  flex: 1;
}

.product-info h5 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .product-info h5 {
  color: #f1f5f9;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.price {
  margin: 0;
  color: #d40025;
  font-weight: 800;
  font-size: 1.15rem;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .price {
  color: #ff6b6b;
}

.quantity-badge {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .quantity-badge {
  background: #334155;
  color: #94a3b8;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

.vendor-icon {
  font-size: 0.75rem;
}

.vendor-name {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .vendor-name {
  color: #94a3b8;
}

/* Cart Summary */
.cart-summary {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 15px;
  margin-bottom: 20px;
}

.quick-cart-preview.dark-mode .cart-summary {
  background: #0f172a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-weight: 700;
}

.quick-cart-preview.dark-mode .summary-row.total {
  border-top-color: #334155;
}

.summary-label {
  color: #64748b;
  font-size: 0.9rem;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .summary-label {
  color: #94a3b8;
}

.summary-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: 'Amiri', serif;
}

.quick-cart-preview.dark-mode .summary-value {
  color: #f1f5f9;
}

.summary-row.total .summary-value {
  color: #d40025;
  font-size: 1.05rem;
}

.quick-cart-preview.dark-mode .summary-row.total .summary-value {
  color: #ff6b6b;
}

/* Preview Actions */
.preview-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.preview-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(8, 113, 127, 0.3);
}

.btn-outline {
  background: transparent;
  color: #08717f;
  border: 2px solid #e2e8f0;
}

.quick-cart-preview.dark-mode .btn-outline {
  color: #2dd4bf;
  border-color: #334155;
}

.btn-outline:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.quick-cart-preview.dark-mode .btn-outline:hover {
  background: #334155;
}

.btn-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* Progress Bar */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-radius: 0 0 24px 24px;
}

.quick-cart-preview.dark-mode .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #08717f, #d40025);
  width: 100%;
  transition: width 0.05s linear;
  border-radius: 3px;
}

/* Animations */
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

/* Transition for Vue */
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Hover effects */
.preview-content:hover .progress-fill {
  animation-play-state: paused;
}

/* Responsive */
@media (max-width: 640px) {
  .quick-cart-preview {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
    width: auto;
  }

  .preview-content {
    padding: 16px;
  }

  .preview-body {
    flex-direction: column;
    text-align: center;
  }

  .product-image-wrapper {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }

  .price-info {
    justify-content: center;
  }

  .vendor-info {
    justify-content: center;
  }

  .preview-actions {
    flex-direction: column;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/* ============================================
   📱 QUICK CART PREVIEW - DESIGN MOBILE COMPLET
   Ultra Moderne • Animations Fluides • WAAW
============================================ */

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== POSITIONNEMENT ===== */
  .quick-cart-preview {
    bottom: 16px !important;
    right: 12px !important;
    left: 12px !important;
    max-width: none !important;
    width: auto !important;
    z-index: 10000 !important;
  }

  /* ===== CONTENT ===== */
  .preview-content {
    padding: 16px !important;
    padding-top: 24px !important;
    border-radius: 20px !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid rgba(226, 232, 240, 0.6) !important;
  }

  .quick-cart-preview.dark-mode .preview-content {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    border-color: rgba(51, 65, 85, 0.6) !important;
  }

  /* Désactiver le hover sur mobile */
  .preview-content:hover {
    transform: none !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
  }

  /* ===== SUCCESS ICON ===== */
  .success-icon {
    top: -25px !important;
    width: 50px !important;
    height: 50px !important;
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3) !important;
  }

  .success-icon svg {
    width: 26px !important;
    height: 26px !important;
  }

  /* ===== PREVIEW HEADER ===== */
  .preview-header {
    margin-top: 16px !important;
    margin-bottom: 16px !important;
  }

  .preview-header h4 {
    font-size: 15px !important;
    font-weight: 700 !important;
  }

  .close-btn {
    width: 30px !important;
    height: 30px !important;
    font-size: 20px !important;
    border-radius: 8px !important;
  }

  .close-btn:active {
    background: #ef4444 !important;
    color: #ffffff !important;
    transform: rotate(90deg) scale(0.9) !important;
  }

  /* ===== PREVIEW BODY ===== */
  .preview-body {
    flex-direction: row !important;
    gap: 12px !important;
    padding: 12px !important;
    border-radius: 14px !important;
    margin-bottom: 16px !important;
    text-align: right !important;
    align-items: center !important;
  }

  .product-image-wrapper {
    width: 70px !important;
    height: 70px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
  }

  .product-image {
    border-radius: 10px !important;
    border-width: 1.5px !important;
  }

  .image-overlay {
    border-radius: 10px !important;
  }

  .check-mark {
    font-size: 20px !important;
  }

  /* ===== PRODUCT INFO ===== */
  .product-info {
    flex: 1 !important;
    min-width: 0 !important;
  }

  .product-info h5 {
    font-size: 14px !important;
    margin-bottom: 6px !important;
    line-height: 1.4 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .price-info {
    justify-content: flex-start !important;
    gap: 8px !important;
  }

  .price {
    font-size: 16px !important;
    font-weight: 800 !important;
  }

  .quantity-badge {
    padding: 2px 8px !important;
    font-size: 11px !important;
  }

  .vendor-info {
    justify-content: flex-start !important;
    margin-top: 4px !important;
    gap: 6px !important;
  }

  .vendor-icon {
    font-size: 12px !important;
  }

  .vendor-name {
    font-size: 12px !important;
  }

  /* ===== CART SUMMARY ===== */
  .cart-summary {
    padding: 10px 12px !important;
    border-radius: 10px !important;
    margin-bottom: 16px !important;
  }

  .summary-row {
    margin-bottom: 6px !important;
  }

  .summary-label {
    font-size: 13px !important;
  }

  .summary-value {
    font-size: 13px !important;
  }

  .summary-row.total {
    margin-top: 6px !important;
    padding-top: 6px !important;
  }

  .summary-row.total .summary-value {
    font-size: 16px !important;
  }

  /* ===== PREVIEW ACTIONS ===== */
  .preview-actions {
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 12px !important;
  }

  .preview-actions .btn {
    width: 100% !important;
    padding: 13px 16px !important;
    font-size: 14px !important;
    border-radius: 14px !important;
    min-height: 48px !important;
    font-weight: 700 !important;
  }

  .btn-primary {
    background: linear-gradient(135deg, #08717f, #065a69) !important;
    box-shadow: 0 4px 12px rgba(8, 113, 127, 0.25) !important;
  }

  .btn-primary:active {
    transform: scale(0.96) !important;
    box-shadow: 0 2px 6px rgba(8, 113, 127, 0.15) !important;
  }

  .btn-outline {
    border-width: 1.5px !important;
  }

  .btn-outline:active {
    background: #f1f5f9 !important;
    transform: scale(0.96) !important;
  }

  .quick-cart-preview.dark-mode .btn-outline:active {
    background: #334155 !important;
  }

  .btn-icon {
    width: 16px !important;
    height: 16px !important;
  }

  /* ===== PROGRESS BAR ===== */
  .progress-bar {
    height: 3px !important;
    border-radius: 0 0 20px 20px !important;
  }

  .progress-fill {
    border-radius: 0 0 0 3px !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 380px) ----- */
@media (max-width: 380px) {
  .quick-cart-preview {
    bottom: 10px !important;
    right: 8px !important;
    left: 8px !important;
  }

  .preview-content {
    padding: 12px !important;
    padding-top: 20px !important;
    border-radius: 16px !important;
  }

  .success-icon {
    top: -22px !important;
    width: 44px !important;
    height: 44px !important;
  }

  .success-icon svg {
    width: 22px !important;
    height: 22px !important;
  }

  .preview-header h4 {
    font-size: 14px !important;
  }

  .product-image-wrapper {
    width: 60px !important;
    height: 60px !important;
  }

  .product-info h5 {
    font-size: 13px !important;
  }

  .price {
    font-size: 15px !important;
  }

  .preview-actions .btn {
    padding: 11px 14px !important;
    font-size: 13px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
  }

  .summary-row.total .summary-value {
    font-size: 15px !important;
  }
}

/* ===== PAYSAGE MOBILE ===== */
@media (max-width: 768px) and (orientation: landscape) {
  .quick-cart-preview {
    bottom: 8px !important;
    right: 8px !important;
    left: auto !important;
    width: 340px !important;
    max-width: 90vw !important;
  }

  .preview-body {
    flex-direction: row !important;
  }

  .preview-actions {
    flex-direction: row !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .quick-cart-preview {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .preview-content {
    /* Empêcher le défilement */
    -webkit-overflow-scrolling: touch !important;
  }
}

/* ===== OPTIMISATION TACTILE ===== */
@media (hover: none) and (pointer: coarse) {
  .quick-cart-preview {
    -webkit-tap-highlight-color: transparent !important;
  }

  .preview-actions .btn,
  .close-btn {
    min-height: 44px !important;
    min-width: 44px !important;
    cursor: pointer !important;
  }

  /* Désactiver les animations hover */
  .preview-content:hover {
    transform: none !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
  }

  .product-image-wrapper:hover .product-image {
    transform: none !important;
  }

  .product-image-wrapper:hover .image-overlay {
    opacity: 0 !important;
  }

  .btn-primary:hover,
  .btn-outline:hover {
    transform: none !important;
  }
}

/* ===== DARK MODE MOBILE ===== */
@media (max-width: 768px) {
  .quick-cart-preview.dark-mode .preview-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    border-color: #334155 !important;
  }

  .quick-cart-preview.dark-mode .preview-body {
    background: rgba(15, 23, 42, 0.6) !important;
  }

  .quick-cart-preview.dark-mode .cart-summary {
    background: rgba(15, 23, 42, 0.8) !important;
  }

  .quick-cart-preview.dark-mode .btn-outline:active {
    background: #334155 !important;
  }

  .quick-cart-preview.dark-mode .close-btn:active {
    background: #ef4444 !important;
    color: #ffffff !important;
  }
}

/* ===== ANIMATIONS ===== */
@media (max-width: 768px) {
  @keyframes slideInUpMobile {
    from {
      transform: translateY(80px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .preview-slide-enter-active {
    animation: slideInUpMobile 0.35s cubic-bezier(0.34, 1.2, 0.64, 1) !important;
  }

  .preview-slide-leave-active {
    animation: slideOutDown 0.25s ease-in !important;
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(80px);
      opacity: 0;
    }
  }
}

/* ===== ANIMATIONS RÉDUITES ===== */
@media (prefers-reduced-motion: reduce) {
  .quick-cart-preview,
  .quick-cart-preview * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .success-icon {
    animation: none !important;
  }

  .progress-fill {
    transition: none !important;
  }
}
</style>
