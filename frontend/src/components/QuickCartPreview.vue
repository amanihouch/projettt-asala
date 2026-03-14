<!-- src/components/QuickCartPreview.vue -->
<template>
  <div v-if="showPreview" class="quick-cart-preview">
    <div class="preview-content">
      <div class="preview-header">
        <h4>تمت الإضافة إلى السلة</h4>
        <button @click="closePreview" class="close-btn">×</button>
      </div>
      <div class="preview-body">
        <img :src="productImage" :alt="productName" class="product-image" />
        <div class="product-info">
          <h5>{{ productName }}</h5>
          <p class="price">{{ productPrice }} د.ت</p>
        </div>
      </div>
      <div class="preview-actions">
        <button @click="goToCart" class="btn btn-primary">عرض السلة</button>
        <button @click="continueShopping" class="btn btn-outline">مواصلة التسوق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()
const showPreview = ref(false)

const lastItem = computed(() => {
  return cartStore.items[cartStore.items.length - 1]
})

const productName = computed(() => lastItem.value?.name || '')
const productPrice = computed(() => lastItem.value?.price || 0)
const productImage = computed(() => lastItem.value?.image || '')

const goToCart = () => {
  router.push('/cart')
  closePreview()
}

const continueShopping = () => {
  closePreview()
}

const closePreview = () => {
  showPreview.value = false
}

// Exposer pour utilisation depuis d'autres composants
defineExpose({
  show: () => {
    showPreview.value = true
    setTimeout(() => {
      closePreview()
    }, 5000)
  },
})
</script>

<style scoped>
.quick-cart-preview {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

.preview-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 350px;
  border: 1px solid #e5e7eb;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-header h4 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-body {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.product-info h5 {
  margin: 0 0 5px 0;
  color: #111827;
  font-size: 0.95rem;
}

.price {
  margin: 0;
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.1rem;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-actions .btn {
  flex: 1;
  padding: 8px 16px;
  font-size: 0.85rem;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .quick-cart-preview {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
