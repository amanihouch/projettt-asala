<template>
  <transition name="toast-slide">
    <div
      v-if="visible"
      :class="[
        'notification-toast',
        `toast-${type}`,
        { 'toast-with-action': actionText, 'toast-persistent': persistent, 'dark-mode': isDarkMode }
      ]"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      :data-position="position"
    >
      <div class="toast-container">
        <!-- Icon -->
        <div class="toast-icon">
          <component :is="typeIcon" />
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
        <div v-if="autoClose && !persistent" class="toast-progress">
          <div class="toast-progress-bar" :style="{ animationDuration: `${duration}ms` }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineExpose } from 'vue'
import { useThemeStore } from '../stores/theme'

// ===== DARK MODE - Synchronized with global theme store (header) =====
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const props = defineProps({
  // Message properties
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) =>
      ['success', 'error', 'warning', 'info', 'cart', 'wishlist', 'order'].includes(value),
  },

  // Action properties
  actionText: {
    type: String,
    default: '',
  },
  onAction: {
    type: Function,
    default: null,
  },

  // Display properties
  duration: {
    type: Number,
    default: 5000,
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) =>
      [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ].includes(value),
  },

  // Behavior properties
  persistent: {
    type: Boolean,
    default: false,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'action'])

const visible = ref(true)
let timeoutId = null

// Icônes SVG en ligne avec support dark mode
const icons = {
  success: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `,
  },
  error: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `,
  },
  warning: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
  },
  info: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `,
  },
  cart: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `,
  },
  wishlist: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `,
  },
  order: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    `,
  },
  default: {
    template: `
      <svg class="toast-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    `,
  },
}

// Icon mapping based on notification type
const typeIcon = computed(() => {
  return icons[props.type] || icons.default
})

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

// Keyboard navigation support
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    close()
  }
  if (event.key === 'Enter' && props.actionText) {
    handleAction()
  }
}

// Pause auto-close on hover
const pauseAutoClose = () => {
  clearAutoClose()
}

const resumeAutoClose = () => {
  if (props.autoClose && !props.persistent) {
    startAutoClose()
  }
}

// Lifecycle hooks
onMounted(() => {
  startAutoClose()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearAutoClose()
  window.removeEventListener('keydown', handleKeydown)
})

// Expose methods for programmatic control
defineExpose({
  close,
  show: () => {
    visible.value = true
    startAutoClose()
  },
  updateMessage: (newMessage) => {
    props.message = newMessage
  },
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  z-index: 99999;
  max-width: 400px;
  min-width: 300px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  font-family: 'Cairo', sans-serif;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
}

/* Dark mode - via class */
.notification-toast.dark-mode {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(51, 65, 85, 0.8);
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(51, 65, 85, 0.3);
  backdrop-filter: blur(12px);
}

/* Position classes */
.notification-toast[data-position='top-right'] {
  top: 20px;
  right: 20px;
  animation-name: slideInRight;
}

.notification-toast[data-position='top-left'] {
  top: 20px;
  left: 20px;
  animation-name: slideInLeft;
}

.notification-toast[data-position='bottom-right'] {
  bottom: 20px;
  right: 20px;
  animation-name: slideInRight;
}

.notification-toast[data-position='bottom-left'] {
  bottom: 20px;
  left: 20px;
  animation-name: slideInLeft;
}

.notification-toast[data-position='top-center'] {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation-name: slideInDown;
}

.notification-toast[data-position='bottom-center'] {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation-name: slideInUp;
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
  animation: iconPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes iconPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.toast-success .toast-icon {
  color: #10b981;
}

.notification-toast.dark-mode .toast-success .toast-icon {
  color: #34d399;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.notification-toast.dark-mode .toast-error .toast-icon {
  color: #f87171;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.notification-toast.dark-mode .toast-warning .toast-icon {
  color: #fbbf24;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.notification-toast.dark-mode .toast-info .toast-icon {
  color: #60a5fa;
}

.toast-cart .toast-icon {
  color: #06b6d4;
}

.notification-toast.dark-mode .toast-cart .toast-icon {
  color: #22d3ee;
}

.toast-wishlist .toast-icon {
  color: #ec4899;
}

.notification-toast.dark-mode .toast-wishlist .toast-icon {
  color: #f472b6;
}

.toast-order .toast-icon {
  color: #1e3a8a;
}

.notification-toast.dark-mode .toast-order .toast-icon {
  color: #3b82f6;
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
  color: #1e293b;
  line-height: 1.4;
}

.notification-toast.dark-mode .toast-title {
  color: #f1f5f9;
}

.toast-message {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

.notification-toast.dark-mode .toast-message {
  color: #cbd5e1;
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
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
  padding: 0;
}

.toast-close-btn:hover {
  color: #475569;
  background: #f1f5f9;
  transform: rotate(90deg);
}

.notification-toast.dark-mode .toast-close-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
}

.toast-close-btn svg {
  width: 16px;
  height: 16px;
}

/* Action button */
.toast-action-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.toast-action-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.notification-toast.dark-mode .toast-action-btn {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

.notification-toast.dark-mode .toast-action-btn:hover {
  background: #475569;
  color: #f1f5f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-with-action .toast-container {
  padding-bottom: 1rem;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-toast.dark-mode .toast-progress {
  background: rgba(255, 255, 255, 0.1);
}

.toast-progress-bar {
  height: 100%;
  background: currentColor;
  animation: progress linear forwards;
  transform-origin: left;
}

.toast-success .toast-progress-bar { background: #10b981; }
.toast-error .toast-progress-bar { background: #ef4444; }
.toast-warning .toast-progress-bar { background: #f59e0b; }
.toast-info .toast-progress-bar { background: #3b82f6; }
.toast-cart .toast-progress-bar { background: #06b6d4; }
.toast-wishlist .toast-progress-bar { background: #ec4899; }
.toast-order .toast-progress-bar { background: #1e3a8a; }

/* Border accent */
.toast-success { border-right: 4px solid #10b981; }
.toast-error { border-right: 4px solid #ef4444; }
.toast-warning { border-right: 4px solid #f59e0b; }
.toast-info { border-right: 4px solid #3b82f6; }
.toast-cart { border-right: 4px solid #06b6d4; }
.toast-wishlist { border-right: 4px solid #ec4899; }
.toast-order { border-right: 4px solid #1e3a8a; }

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition for Vue */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
  max-height: 0;
  margin: 0;
}

/* Responsive design */
@media (max-width: 640px) {
  .notification-toast {
    max-width: calc(100vw - 40px);
    min-width: 0;
    margin: 0 20px;
  }

  .notification-toast[data-position='top-right'],
  .notification-toast[data-position='top-left'],
  .notification-toast[data-position='bottom-right'],
  .notification-toast[data-position='bottom-left'] {
    right: 20px;
    left: 20px;
    animation-name: slideInUp;
  }
}

/* Accessibility improvements */
.notification-toast:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .notification-toast {
    display: none;
  }
}

/* Hover effects */
.notification-toast:hover {
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.notification-toast.dark-mode:hover {
  box-shadow: 0 25px 40px -12px rgba(0, 0, 0, 0.5);
}

/* Ripple effect for action button */
.toast-action-btn {
  position: relative;
  overflow: hidden;
}

.toast-action-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(8, 113, 127, 0.3);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.toast-action-btn:focus:not(:active)::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40);
  }
}

/* Multiple toasts stacking */
.notification-toast + .notification-toast {
  margin-top: 12px;
}

/* Pause animation on hover */
.notification-toast:hover .toast-progress-bar {
  animation-play-state: paused;
}
</style>
