<!-- src/App.vue -->
<template>
  <div id="app" dir="rtl">
    <!-- En-tête -->
    <Header />

    <!-- Sidebars -->
    <CartSidebar />
    <WishlistSidebar />

    <!-- Contenu principal -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Pied de page -->
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CartSidebar from './components/CartSidebar.vue'
import WishlistSidebar from './components/WishlistSidebar.vue'
import './assets/admin.css'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    CartSidebar,
    WishlistSidebar,
  },
  mounted() {
    console.log('✅ App mounted successfully')
  },
}
</script>

<style>
/* ===== RESET & BASE STYLES ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Couleurs principales */
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-teal-soft: #e0f5f7;

  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --primary-red-soft: #ffe8ed;

  /* Dégradés */
  --gradient-teal: linear-gradient(135deg, #08717f 0%, #0a94a6 100%);
  --gradient-red: linear-gradient(135deg, #d40025 0%, #ff1744 100%);
  --gradient-dual: linear-gradient(135deg, #08717f 0%, #d40025 100%);

  /* Neutres */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(8, 113, 127, 0.08);
  --shadow-md: 0 4px 6px rgba(8, 113, 127, 0.1);
  --shadow-lg: 0 10px 15px rgba(212, 0, 37, 0.1);
  --shadow-xl: 0 20px 25px rgba(8, 113, 127, 0.15);
  --shadow-2xl: 0 25px 50px rgba(212, 0, 37, 0.2);

  /* Bordures */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;

  /* Transitions */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Typographie */
  --font-primary: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  background: var(--neutral-50);
  color: var(--neutral-800);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--neutral-50);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  min-height: calc(100vh - 80px - 300px);
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ===== CONTAINER ===== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

/* ===== PAGE TRANSITIONS ===== */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

.fade-in-up {
  animation: fadeInUp 0.5s ease;
}

.fade-in-down {
  animation: fadeInDown 0.5s ease;
}

.slide-in-right {
  animation: slideInRight 0.5s ease;
}

.slide-in-left {
  animation: slideInLeft 0.5s ease;
}

/* ===== UTILITY CLASSES ===== */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.mt-1 {
  margin-top: 0.5rem;
}
.mt-2 {
  margin-top: 1rem;
}
.mt-3 {
  margin-top: 1.5rem;
}
.mt-4 {
  margin-top: 2rem;
}
.mt-5 {
  margin-top: 2.5rem;
}

.mb-1 {
  margin-bottom: 0.5rem;
}
.mb-2 {
  margin-bottom: 1rem;
}
.mb-3 {
  margin-bottom: 1.5rem;
}
.mb-4 {
  margin-bottom: 2rem;
}
.mb-5 {
  margin-bottom: 2.5rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--neutral-100);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-teal);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-teal-dark);
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

:focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .main-content {
    min-height: calc(100vh - 60px - 250px);
  }

  .container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    min-height: calc(100vh - 50px - 200px);
  }

  .container {
    padding: 0 12px;
  }
}

/* ===== PRINT STYLES ===== */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
