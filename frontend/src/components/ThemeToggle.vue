<!-- frontend/src/components/ThemeToggle.vue -->
<template>
  <button
    class="theme-toggle-btn"
    @click="toggleTheme"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    :class="{
      'compact': compact,
      'dark-mode': isDarkMode,
      'animating': isAnimating
    }"
  >
    <!-- Animated icon wrapper -->
    <div class="toggle-icon-wrapper" :class="{ 'rotate': isAnimating }">
      <span class="toggle-icon">{{ currentIcon }}</span>
    </div>

    <!-- Optional text label -->
    <span class="toggle-text" v-if="!compact">{{ currentText }}</span>

    <!-- Ripple effect -->
    <span class="ripple-effect" v-if="showRipple" :style="rippleStyle"></span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  withRipple: {
    type: Boolean,
    default: true
  }
})

const themeStore = useThemeStore()
const isAnimating = ref(false)
const showRipple = ref(false)
const rippleStyle = ref({})

// Computed properties from global theme store
const isDarkMode = computed(() => themeStore.isDarkMode)

// Current icon based on theme state
const currentIcon = computed(() => {
  return isDarkMode.value ? '🌙' : '☀️'
})

// Current text based on theme state
const currentText = computed(() => {
  return isDarkMode.value ? 'ليلي' : 'نهاري'
})

// ARIA label for accessibility
const ariaLabel = computed(() => {
  return `Changer en mode ${isDarkMode.value ? 'clair' : 'sombre'}`
})

// Watch for theme changes to trigger animation
// (using a watcher on the store's isDarkMode)
const triggerAnimation = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 500)
}

// Create ripple effect
const createRipple = (event) => {
  if (!props.withRipple) return

  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  rippleStyle.value = {
    width: `${size}px`,
    height: `${size}px`,
    top: `${y}px`,
    left: `${x}px`
  }

  showRipple.value = true

  setTimeout(() => {
    showRipple.value = false
  }, 600)
}

// Toggle theme with ripple effect
const toggleTheme = (event) => {
  createRipple(event)
  themeStore.toggleTheme()
  triggerAnimation()
}

// Keyboard support
const handleKeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleTheme(event)
  }
}
</script>

<style scoped>
.theme-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #475569;
  font-family: inherit;
  font-weight: 600;
  overflow: hidden;
  outline: none;
  backdrop-filter: blur(4px);
}

/* Dark mode button styling */
.theme-toggle-btn.dark-mode {
  background: rgba(30, 41, 59, 0.8);
  border-color: #334155;
  color: #cbd5e1;
  backdrop-filter: blur(8px);
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  border-color: #08717f;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  background: #ffffff;
}

.theme-toggle-btn.dark-mode:hover {
  background: rgba(51, 65, 85, 0.9);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border-color: #2dd4bf;
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

/* Focus styles for accessibility */
.theme-toggle-btn:focus-visible {
  outline: 3px solid #08717f;
  outline-offset: 2px;
  border-color: transparent;
}

.theme-toggle-btn.dark-mode:focus-visible {
  outline-color: #2dd4bf;
}

/* Compact mode */
.theme-toggle-btn.compact {
  padding: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  justify-content: center;
  gap: 0;
}

.theme-toggle-btn.compact .toggle-icon {
  font-size: 1.3rem;
}

/* Icon wrapper with animation */
.toggle-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-icon-wrapper.rotate {
  animation: iconSpin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes iconSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.toggle-icon {
  font-size: 1.2rem;
  display: inline-block;
  transition: transform 0.2s ease;
}

.theme-toggle-btn:hover .toggle-icon {
  transform: scale(1.1);
}

.theme-toggle-btn.compact:hover .toggle-icon {
  transform: scale(1.15);
}

/* Text label */
.toggle-text {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover .toggle-text {
  transform: translateX(2px);
}

.theme-toggle-btn.dark-mode:hover .toggle-text {
  transform: translateX(2px);
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(8, 113, 127, 0.3) 0%, rgba(8, 113, 127, 0.1) 100%);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
  z-index: 1;
}

.theme-toggle-btn.dark-mode .ripple-effect {
  background: radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, rgba(45, 212, 191, 0.1) 100%);
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Pulse animation on theme change */
.theme-toggle-btn.animating .toggle-icon {
  animation: iconPulse 0.4s ease-in-out;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Glow effect on hover */
.theme-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(8, 113, 127, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.theme-toggle-btn:hover::before {
  opacity: 1;
}

.theme-toggle-btn.dark-mode::before {
  background: radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent);
}

/* Loading state (optional) */
.theme-toggle-btn.loading {
  pointer-events: none;
  opacity: 0.7;
}

.theme-toggle-btn.loading .toggle-icon {
  animation: loadingSpin 1s linear infinite;
}

@keyframes loadingSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .theme-toggle-btn {
    padding: 8px 16px;
  }

  .theme-toggle-btn.compact {
    width: 40px;
    height: 40px;
  }

  .toggle-text {
    font-size: 0.85rem;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-btn,
  .toggle-icon-wrapper,
  .toggle-icon,
  .toggle-text,
  .ripple-effect {
    transition: none;
    animation: none;
  }

  .theme-toggle-btn:hover {
    transform: none;
  }

  .toggle-icon-wrapper.rotate {
    animation: none;
  }

  .theme-toggle-btn.animating .toggle-icon {
    animation: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .theme-toggle-btn {
    border: 2px solid currentColor;
  }

  .theme-toggle-btn:focus-visible {
    outline: 2px solid currentColor;
  }
}

/* Touch device optimizations */
@media (hover: hover) {
  .theme-toggle-btn:hover {
    transform: translateY(-2px);
  }
}

@media (hover: none) {
  .theme-toggle-btn:active {
    transform: scale(0.95);
  }
}
</style>
