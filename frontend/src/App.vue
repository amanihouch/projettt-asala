<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <Header />
    <CartSidebar />
    <WishlistSidebar />
    <ChatWidget />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CartSidebar from './components/CartSidebar.vue'
import WishlistSidebar from './components/WishlistSidebar.vue'
import ChatWidget from './components/ChatWidget.vue'
import { useThemeStore } from './stores/theme'
import { useVisitTracker } from './composables/useVisitTracker'

const route = useRoute()
const { trackPageView } = useVisitTracker()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ✅ Suivre les changements de page
watch(() => route.path, (newPath) => {
  trackPageView(newPath)
}, { immediate: false })

onMounted(() => {
  themeStore.initTheme()
  console.log('🎨 Thème actuel:', themeStore.theme)
})
</script>


<style>
/* ===== STYLES GLOBAUX ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Cairo', 'Segoe UI', sans-serif;
  background: #f8fafc;
  color: #475569;
  transition: all 0.3s ease;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* ===== MODE SOMBRE SUR #app ===== */
#app.dark-mode {
  background-color: #0f172a;
  color: #cbd5e1;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
