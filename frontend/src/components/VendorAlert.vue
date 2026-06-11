<!-- src/components/VendorAlert.vue -->
<template>
  <transition name="alert-fade">
    <div v-if="visible" class="vendor-alert-overlay" @click.self="close">
      <div class="vendor-alert-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="alert-icon-wrapper">
          <div class="alert-icon">⚠️</div>
        </div>

        <div class="alert-content">
          <h3 class="alert-title">تعذر إضافة المنتج</h3>

          <p class="alert-message">
            {{ message }}
          </p>

          <div class="alert-divider"></div>

          <div class="alert-info">
            <div class="info-row">
              <span class="info-label">المنتج الحالي:</span>
              <span class="info-value">{{ newProductName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">بائع المنتج الحالي:</span>
              <span class="info-value highlight">{{ newVendorName }}</span>
            </div>
            <div class="info-row" v-if="currentVendorName">
              <span class="info-label">منتجات في السلة من:</span>
              <span class="info-value highlight-warning">{{ currentVendorName }}</span>
            </div>
          </div>

          <div class="alert-actions">
            <button class="alert-btn secondary" @click="close">
              <span>مواصلة التسوق</span>
            </button>
            <button class="alert-btn primary" @click="clearAndRetry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>إفراغ السلة والمتابعة</span>
            </button>
          </div>

          <button class="alert-close" @click="close" aria-label="إغلاق">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useCartStore } from '../stores/cart'

const themeStore = useThemeStore()
const cartStore = useCartStore()

const isDarkMode = computed(() => themeStore.isDarkMode)
const visible = ref(false)
const message = ref('')
const newProductName = ref('')
const newVendorName = ref('')
const currentVendorName = ref('')
let resolveCallback = null

const show = (options) => {
  message.value = options.message || '⚠️ Vous ne pouvez ajouter au panier que des produits provenant d\'un seul vendeur à la fois. Veuillez terminer votre commande actuelle ou vider votre panier pour continuer.'
  newProductName.value = options.newProductName || 'منتج'
  newVendorName.value = options.newVendorName || 'بائع'
  currentVendorName.value = options.currentVendorName || ''
  visible.value = true

  return new Promise((resolve) => {
    resolveCallback = resolve
  })
}

const close = () => {
  visible.value = false
  if (resolveCallback) {
    resolveCallback(false)
    resolveCallback = null
  }
}

const clearAndRetry = async () => {
  await cartStore.clearCart()
  visible.value = false
  if (resolveCallback) {
    resolveCallback(true)
    resolveCallback = null
  }
}

defineExpose({ show, close })
</script>

<style scoped>
.vendor-alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.vendor-alert-card {
  max-width: 450px;
  width: 100%;
  background: #fff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vendor-alert-card.dark-mode {
  background: #1e293b;
}

.alert-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 24px 0 16px;
  text-align: center;
}

.dark-mode .alert-icon-wrapper {
  background: linear-gradient(135deg, #3b2e00, #2a2500);
}

.alert-icon {
  font-size: 56px;
  animation: pulseWarning 0.6s ease-in-out;
}

@keyframes pulseWarning {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.alert-content {
  padding: 20px 24px 28px;
  position: relative;
}

.alert-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 12px;
}

.dark-mode .alert-title {
  color: #f1f5f9;
}

.alert-message {
  font-size: 0.9rem;
  color: #475569;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
}

.dark-mode .alert-message {
  color: #94a3b8;
}

.alert-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 16px 0;
}

.dark-mode .alert-divider {
  background: linear-gradient(90deg, transparent, #334155, transparent);
}

.alert-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 24px;
}

.dark-mode .alert-info {
  background: #0f172a;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.85rem;
}

.info-label {
  color: #64748b;
  font-weight: 500;
}

.dark-mode .info-label {
  color: #94a3b8;
}

.info-value {
  color: #1e293b;
  font-weight: 600;
}

.dark-mode .info-value {
  color: #f1f5f9;
}

.info-value.highlight {
  color: #d40025;
}

.dark-mode .info-value.highlight {
  color: #ff6b6b;
}

.info-value.highlight-warning {
  color: #f59e0b;
}

.dark-mode .info-value.highlight-warning {
  color: #fbbf24;
}

.alert-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.alert-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.alert-btn.primary {
  background: linear-gradient(135deg, #d40025, #b00020);
  color: white;
}

.alert-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 0, 37, 0.3);
}

.alert-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.dark-mode .alert-btn.secondary {
  background: #334155;
  color: #94a3b8;
}

.alert-btn.secondary:hover {
  background: #e2e8f0;
}

.dark-mode .alert-btn.secondary:hover {
  background: #475569;
  color: #f1f5f9;
}

.alert-close {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 32px;
  height: 32px;
  background: rgba(241, 245, 249, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dark-mode .alert-close {
  background: rgba(51, 65, 85, 0.9);
  color: #94a3b8;
}

.alert-close:hover {
  background: #d40025;
  color: white;
  transform: rotate(90deg);
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .vendor-alert-card {
    max-width: calc(100% - 20px);
  }

  .alert-actions {
    flex-direction: column;
  }

  .alert-content {
    padding: 16px 20px 22px;
  }

  .alert-title {
    font-size: 1.1rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
