<template>
  <transition name="toast-slide">
    <div
      v-if="visible"
      :class="['notification-toast', `toast-${type}`, { 'toast-with-action': actionText }]"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      :data-position="position"
    >
      <div class="toast-container">
        <!-- Icon -->
        <div class="toast-icon">
          <svg
            v-if="type === 'success'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg
            v-else-if="type === 'error'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg
            v-else-if="type === 'warning'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg
            v-else-if="type === 'cart'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <svg
            v-else-if="type === 'wishlist'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
          <svg
            v-else-if="type === 'order'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <!-- Content -->
        <div class="toast-content">
          <h4 v-if="title" class="toast-title">{{ title }}</h4>
          <p class="toast-message">{{ message }}</p>

          <!-- Action Button -->
          <button
            v-if="actionText"
            @click="handleAction"
            class="toast-action-btn"
            :aria-label="actionText"
          >
            {{ actionText }}
          </button>
        </div>

        <!-- Close Button -->
        <button v-if="showClose" @click="close" class="toast-close-btn" aria-label="إغلاق الإشعار">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Progress Bar -->
        <div v-if="autoClose" class="toast-progress">
          <div class="toast-progress-bar" :style="{ animationDuration: `${duration}ms` }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: String,
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  actionText: String,
  onAction: Function,
  duration: { type: Number, default: 5000 },
  autoClose: { type: Boolean, default: true },
  position: { type: String, default: 'top-right' },
  persistent: { type: Boolean, default: false },
  showClose: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'action'])

const visible = ref(true)
let timeoutId = null

// Auto-close functionality
const startAutoClose = () => {
  if (props.autoClose && !props.persistent) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const clearAutoClose = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

// Close notification
const close = () => {
  clearAutoClose()
  visible.value = false
  emit('close')
}

// Handle action button click
const handleAction = () => {
  if (props.onAction) {
    props.onAction()
  }
  emit('action')
  close()
}

// Lifecycle hooks
onMounted(() => {
  startAutoClose()
})

onUnmounted(() => {
  clearAutoClose()
})

// Expose methods for programmatic control
defineExpose({
  close,
  show: () => {
    visible.value = true
    startAutoClose()
  },
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  z-index: 99999;
  max-width: 400px;
  min-width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Position classes */
.notification-toast[data-position='top-right'] {
  top: 20px;
  right: 20px;
}

.notification-toast[data-position='top-left'] {
  top: 20px;
  left: 20px;
}

.notification-toast[data-position='bottom-right'] {
  bottom: 20px;
  right: 20px;
}

.notification-toast[data-position='bottom-left'] {
  bottom: 20px;
  left: 20px;
}

.notification-toast[data-position='top-center'] {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.notification-toast[data-position='bottom-center'] {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container {
  position: relative;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* Icon styling */
.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-cart .toast-icon {
  color: #06b6d4;
}

.toast-wishlist .toast-icon {
  color: #ec4899;
}

.toast-order .toast-icon {
  color: #1e3a8a;
}

/* Content styling */
.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.toast-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
}

.toast-message {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Close button */
.toast-close-btn {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s ease;
  padding: 0;
}

.toast-close-btn:hover {
  color: #4b5563;
  background: #f3f4f6;
}

.toast-close-btn svg {
  width: 16px;
  height: 16px;
}

/* Action button */
.toast-action-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-action-btn:hover {
  background: #e5e7eb;
  color: #111827;
  transform: translateY(-1px);
}

.toast-with-action .toast-container {
  padding-bottom: 3rem;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e5e7eb;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background: currentColor;
  animation: progress linear forwards;
  transform-origin: left;
}

.toast-success .toast-progress-bar {
  background: #10b981;
}

.toast-error .toast-progress-bar {
  background: #ef4444;
}

.toast-warning .toast-progress-bar {
  background: #f59e0b;
}

.toast-info .toast-progress-bar {
  background: #3b82f6;
}

.toast-cart .toast-progress-bar {
  background: #06b6d4;
}

.toast-wishlist .toast-progress-bar {
  background: #ec4899;
}

.toast-order .toast-progress-bar {
  background: #1e3a8a;
}

/* Animations */
@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition for Vue */
.toast-slide-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-slide-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .notification-toast {
    max-width: calc(100vw - 40px);
    min-width: 0;
    margin: 0 20px;
  }
}

/* Success toast specific styles */
.toast-success {
  border-left: 4px solid #10b981;
}

/* Error toast specific styles */
.toast-error {
  border-left: 4px solid #ef4444;
}

/* Warning toast specific styles */
.toast-warning {
  border-left: 4px solid #f59e0b;
}

/* Info toast specific styles */
.toast-info {
  border-left: 4px solid #3b82f6;
}

/* Cart toast specific styles */
.toast-cart {
  border-left: 4px solid #06b6d4;
}

/* Wishlist toast specific styles */
.toast-wishlist {
  border-left: 4px solid #ec4899;
}

/* Order toast specific styles */
.toast-order {
  border-left: 4px solid #1e3a8a;
}
</style>
