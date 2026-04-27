<!-- src/components/PromoFloatingIcons.vue -->
<template>
  <div class="promo-floating-icons" :class="{ 'dark-mode': isDarkMode }">
    <!-- Floating Promo Icon - Style Messenger -->
    <div class="floating-promo-icon" @click="handlePromoClick">
      <div class="promo-icon-wrapper">
        <div class="promo-icon-animation">
          <svg class="messenger-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 14.13 2.78 16.08 4 17.56V21L7.44 19.56C8.9 20.46 10.53 21 12 21C17.52 21 22 16.52 22 11C22 5.48 17.52 2 12 2Z" fill="white"/>
            <path d="M7 9L11 13L17 9" stroke="#0084ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <span class="promo-icon-sparkle">✨</span>
        </div>
        <span class="promo-notif-badge" v-if="activePromotionsCount > 0">
          {{ activePromotionsCount > 9 ? '9+' : activePromotionsCount }}
        </span>
      </div>
      <span class="promo-tooltip">العروض</span>
    </div>

    <!-- Floating Code Promo Icon -->
    <div class="floating-code-icon" @click="handleCodePromoClick">
      <div class="code-icon-wrapper">
        <div class="code-icon-animation">
          <svg class="ticket-icon" viewBox="0 0 24 24" fill="none">
            <path d="M20 12C20 10.9 20.9 10 22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V10C3.1 10 4 10.9 4 12C4 13.1 3.1 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12Z" fill="white"/>
            <path d="M9 8L15 16" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="9" cy="12" r="1.5" fill="#8b5cf6"/>
            <circle cx="15" cy="12" r="1.5" fill="#8b5cf6"/>
          </svg>
          <span class="code-icon-sparkle">✨</span>
        </div>
      </div>
      <span class="code-tooltip">رمز خصم</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props
defineProps({
  activePromotionsCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['open-promotions', 'open-code-promo'])

// ===== DARK MODE =====
const isDarkMode = ref(false)

const loadDarkMode = () => {
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    isDarkMode.value = saved === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

const handlePromoClick = () => {
  console.log('🔄 Clic sur icône promotions')
  emit('open-promotions')
}

const handleCodePromoClick = () => {
  console.log('🔄 Clic sur icône code promo')
  emit('open-code-promo')
}

onMounted(() => {
  loadDarkMode()
})
</script>

<style scoped>
.promo-floating-icons {
  position: fixed;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.floating-promo-icon,
.floating-code-icon {
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-promo-icon:hover,
.floating-code-icon:hover {
  transform: scale(1.05);
}

.promo-icon-wrapper,
.code-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.promo-icon-wrapper {
  background: linear-gradient(135deg, #0084ff, #00c6ff);
  box-shadow: 0 4px 15px rgba(0, 132, 255, 0.4);
}

.code-icon-wrapper {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.promo-icon-animation,
.code-icon-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.messenger-icon,
.ticket-icon {
  width: 32px;
  height: 32px;
}

.promo-icon-sparkle,
.code-icon-sparkle {
  position: absolute;
  top: -8px;
  right: -10px;
  font-size: 14px;
  animation: sparkleFloat 2s infinite;
}

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(20deg); }
}

.promo-notif-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  animation: pulse-badge 1.5s infinite;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.promo-tooltip,
.code-tooltip {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.promo-floating-icons.dark-mode .promo-tooltip,
.promo-floating-icons.dark-mode .code-tooltip {
  background: rgba(30, 41, 59, 0.95);
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .promo-floating-icons {
    bottom: 20px;
    right: 16px;
    gap: 12px;
  }
  .promo-icon-wrapper,
  .code-icon-wrapper {
    width: 50px;
    height: 50px;
  }
  .messenger-icon,
  .ticket-icon {
    width: 26px;
    height: 26px;
  }
  .promo-tooltip,
  .code-tooltip {
    font-size: 10px;
    padding: 3px 8px;
  }
  .promo-notif-badge {
    font-size: 9px;
    min-width: 18px;
    height: 18px;
    top: -5px;
    right: -6px;
  }
}
</style>
