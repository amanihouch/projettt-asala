<!-- src/components/CartSidebar.vue -->
<template>
  <transition name="overlay">
    <div v-if="cartStore.isOpen" class="cart-overlay" @click="cartStore.closeCart()"></div>
  </transition>

  <transition name="slide">
    <aside v-if="cartStore.isOpen" class="cart-sidebar">
      <div class="cart-header">
        <h3>🛒 سلة التسوق</h3>
        <button @click="cartStore.closeCart()" class="close-btn">✕</button>
      </div>

      <div v-if="cartStore.items.length === 0" class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>السلة فارغة</p>
        <button class="btn-primary" @click="cartStore.closeCart()">
          تسوق الآن
        </button>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p class="item-vendor">{{ item.vendorName || 'بائع' }}</p>
              <p class="item-price">{{ formatPrice(item.price) }} د.ت</p>
              <div class="quantity-controls">
                <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="qty-btn">-</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="qty-btn">+</button>
              </div>
            </div>
            <button @click="cartStore.removeItem(item.id)" class="remove-btn" title="حذف">🗑️</button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="cart-total">
            <span>المجموع:</span>
            <span class="total-price">{{ formatPrice(cartStore.totalPrice) }} د.ت</span>
          </div>
          <button class="btn-checkout" @click="goToCheckout">
            إتمام الطلب
          </button>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price)
}

const goToCheckout = () => {
  cartStore.closeCart()
  router.push('/checkout')
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9998;
}

.cart-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 20px rgba(0,0,0,0.1);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.cart-header h3 {
  font-size: 1.2rem;
  color: #1e293b;
}

.close-btn {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.btn-primary {
  padding: 12px 30px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 10px;
  position: relative;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 3px;
}

.item-vendor {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 5px;
}

.item-price {
  color: #d40025;
  font-weight: 700;
  margin-bottom: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.remove-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  opacity: 1;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 700;
}

.total-price {
  color: #d40025;
  font-size: 1.3rem;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-checkout:hover {
  background: #b00020;
  transform: translateY(-2px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>