<template>
  <transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner">
          <div class="spinner-inner"></div>
        </div>
        <p class="loading-text">جاري التحميل...</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  position: relative;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border: 3px solid var(--neutral-gray-200);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--neutral-gray-700);
  font-weight: 600;
  font-size: 1.1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
