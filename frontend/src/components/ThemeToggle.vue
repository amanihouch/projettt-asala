<!-- frontend/src/components/ThemeToggle.vue -->
<template>
  <button
    class="theme-toggle-btn"
    @click="toggleTheme"
    :aria-label="themeStore.themeText"
    :title="themeStore.themeText"
    :class="{ 'compact': compact }"
  >
    <span class="toggle-icon">{{ themeStore.themeIcon }}</span>
    <span class="toggle-text" v-if="!compact">{{ themeStore.themeText }}</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const themeStore = useThemeStore()

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  font-family: inherit;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  border-color: var(--primary-teal);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.theme-toggle-btn.compact {
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
}

.toggle-icon {
  font-size: 1.2rem;
}

.toggle-text {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
