<!-- frontend/src/components/Header.vue - Version avec navigation centrée et police Amiri -->
<template>
  <header
    class="header"
    :class="{
      'header-scrolled': isScrolled,
      'header-hidden': !showHeader,
      'dark-mode': isDarkMode
    }"
  >
    <!-- Main Header -->
    <div class="main-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <router-link to="/" class="logo">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="logo-image" />
          </router-link>

          <!-- Navigation Centrée -->
          <nav class="main-nav-centered">
            <router-link to="/" class="nav-link">الرئيسية</router-link>
            <router-link to="/products" class="nav-link">المنتجات</router-link>
            <router-link to="/artisans" class="nav-link">الحرفيون</router-link>
            <router-link to="/about" class="nav-link">من نحن</router-link>
            <router-link to="/contact" class="nav-link">اتصل بنا</router-link>
          </nav>

          <!-- Header Actions -->
          <div class="header-actions">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="header-action darkmode-action"
              :title="isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'"
            >
              <div class="action-icon-wrapper">
                <svg v-if="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </button>

            <!-- Favorites -->
            <button
              @click="toggleWishlist"
              class="header-action favorites-action"
              title="المفضلة"
              :class="{ 'has-items': likesCount > 0 }"
            >
              <div class="action-icon-wrapper">
                <svg class="heart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    :stroke="likesCount > 0 ? '#ef4444' : '#6b7280'"
                    :fill="likesCount > 0 ? '#ef4444' : 'transparent'"
                    stroke-width="1.5"
                  />
                </svg>
              </div>
              <span v-if="likesCount > 0" class="badge-count">{{ likesCount }}</span>
            </button>

            <!-- Cart -->
            <button @click="toggleCart" class="header-action cart-action" title="السلة">
              <div class="action-icon-wrapper">
                <svg class="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M16 10a4 4 0 11-8 0" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </div>
              <span v-if="cartCount > 0" class="badge-count">{{ cartCount }}</span>
            </button>

            <!-- Login Button -->
            <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
              <span class="login-icon">🔐</span>
              <span class="login-text">تسجيل الدخول</span>
            </router-link>

            <!-- User Menu -->
            <div v-else class="user-menu" @click.stop="toggleUserMenu" ref="userMenu">
              <div class="user-avatar">{{ userInitials }}</div>
              <transition name="dropdown">
                <div v-if="showUserMenu" class="dropdown-menu modern-dropdown">
                  <div class="dropdown-header">
                    <div class="user-info">
                      <div class="user-avatar-small">{{ userInitials }}</div>
                      <div>
                        <div class="user-name">{{ userName }}</div>
                        <div class="user-email">{{ userEmail }}</div>
                        <div class="user-role" v-if="userRole === 'vendor'">حرفي</div>
                        <div class="user-role" v-else-if="userRole === 'customer'">عميل</div>
                        <div class="user-role" v-else-if="userRole === 'admin'">مدير</div>
                      </div>
                    </div>
                  </div>
                  <div class="dropdown-body">
                    <!-- Lien vers le profil selon le rôle -->
                    <router-link
                      v-if="userRole === 'customer'"
                      to="/profile"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                      <span class="item-text">الملف الشخصي</span>
                    </router-link>

                    <router-link
                      v-if="userRole === 'vendor' && vendorLink"
                      :to="vendorLink"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                      <span class="item-text">متجري</span>
                    </router-link>

                    <!-- Lien vers les commandes -->
                    <router-link to="/orders" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
                          <path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                      <span class="item-text">طلباتي</span>
                    </router-link>

                    <!-- Admin Dashboard -->
                    <router-link v-if="userRole === 'admin'" to="/admin" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                      </div>
                      <span class="item-text">لوحة التحكم</span>
                    </router-link>

                  </div>
                  <div class="dropdown-footer">
                    <button @click="logout" class="dropdown-item modern-item logout-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                      <span class="item-text">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button @click="toggleMobileMenu" class="mobile-menu-toggle">
            <span class="hamburger" :class="{ active: showMobileMenu }"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

const toggleDarkMode = () => {
  themeStore.toggleTheme()
}

// ===== STATE =====
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const isScrolled = ref(false)
const showHeader = ref(true)
const lastScrollY = ref(0)
const userMenu = ref(null)
const isMobile = ref(window.innerWidth <= 768)

// ===== COMPUTED =====
const cartCount = computed(() => cartStore.itemCount || 0)
const likesCount = computed(() => likesStore.likesCount || 0)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.userName || authStore.user?.name || 'مستخدم')
const userEmail = computed(() => authStore.userEmail || authStore.user?.email || '')
const userRole = computed(() => authStore.userRole || authStore.user?.role || 'customer')
const userId = computed(() => authStore.userId || authStore.user?.id)

const vendorId = computed(() => {
  if (authStore.vendorId) return authStore.vendorId
  if (authStore.user?.vendorId) return authStore.user.vendorId
  const localVendorId = localStorage.getItem('vendorId')
  if (localVendorId && localVendorId !== 'null' && localVendorId !== 'undefined') {
    return localVendorId
  }
  if (vendorStore.currentVendor?.id) return vendorStore.currentVendor.id
  return null
})

const vendorLink = computed(() => {
  if (vendorId.value) return `/vendor/${vendorId.value}`
  return null
})

const userInitials = computed(() => {
  const name = userName.value
  if (name && name !== 'مستخدم') {
    return name.charAt(0).toUpperCase()
  }
  return 'U'
})

// ===== METHODS =====

// ✅ CORRECTION : Ouvre la WishlistSidebar
const toggleWishlist = () => {
  console.log('🛒 Toggle Wishlist clicked')
  if (likesStore && typeof likesStore.toggleSidebar === 'function') {
    likesStore.toggleSidebar()
  } else {
    console.error('❌ likesStore.toggleSidebar non disponible')
  }
}

// ✅ CORRECTION : Ouvre la CartSidebar
const toggleCart = () => {
  console.log('🛒 Toggle Cart clicked')
  if (cartStore && typeof cartStore.toggleCart === 'function') {
    cartStore.toggleCart()
  } else {
    console.error('❌ cartStore.toggleCart non disponible')
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showMobileMenu.value = false
  }
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (typeof document !== 'undefined') {
    document.body.style.overflow = showMobileMenu.value ? 'hidden' : ''
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

const completeVendorProfile = async () => {
  try {
    const vendor = await vendorStore.fetchVendorByUserId(userId.value)
    if (vendor && vendor.id) {
      authStore.setVendorId(vendor.id)
      localStorage.setItem('vendorId', vendor.id)
      router.push(`/vendor/${vendor.id}`)
    } else {
      router.push('/become-vendor')
    }
  } catch (error) {
    console.error('❌ Erreur récupération vendeur:', error)
    router.push('/become-vendor')
  }
  closeUserMenu()
}

const logout = async () => {
  await authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

const loadVendorData = async () => {
  if (userRole.value === 'vendor' && userId.value) {
    try {
      let existingVendorId = authStore.vendorId || localStorage.getItem('vendorId')
      if (existingVendorId && existingVendorId !== 'null' && existingVendorId !== 'undefined') {
        await vendorStore.fetchVendorById(existingVendorId)
      } else {
        const vendor = await vendorStore.fetchVendorByUserId(userId.value)
        if (vendor && vendor.id) {
          authStore.setVendorId(vendor.id)
          localStorage.setItem('vendorId', vendor.id)
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement vendeur:', error)
    }
  }
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// ===== SCROLL HANDLER =====
const handleScroll = () => {
  const currentScrollY = window.scrollY
  isScrolled.value = currentScrollY > 30
  if (currentScrollY > lastScrollY.value && currentScrollY > 80) {
    showHeader.value = false
  } else {
    showHeader.value = true
  }
  lastScrollY.value = currentScrollY
}

const handleClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

const handleRouteChange = () => {
  showMobileMenu.value = false
  showUserMenu.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  showHeader.value = true
  lastScrollY.value = 0
}

// ===== LIFECYCLE =====
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  router.afterEach(handleRouteChange)

  // Charger les données des stores
  if (likesStore && typeof likesStore.loadFromStorage === 'function') {
    likesStore.loadFromStorage()
  }
  if (cartStore && typeof cartStore.loadFromStorage === 'function') {
    cartStore.loadFromStorage()
  }

  loadVendorData()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>
<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== STYLES DU HEADER ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.4s ease, box-shadow 0.3s ease, background 0.3s ease;
  font-family: 'Amiri', 'Cairo', serif;
}

.header * {
  font-family: 'Amiri', 'Cairo', serif;
}

/* FOND COMPLÈTEMENT NOIR EN MODE SOMBRE */
.header.dark-mode {
  background: #000000;
  box-shadow: 0 2px 15px rgba(255, 255, 255, 0.05);
}

.header-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header.dark-mode.header-scrolled {
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
}

.header-hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Main Header */
.main-header {
  padding: 0.8rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  height: 50px;
  min-width: 130px;
  text-decoration: none;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.logo:hover {
  transform: scale(1.03);
}

.logo-image {
  height: 100%;
  width: auto;
  max-height: 50px;
}

/* Navigation Centrée */
.main-nav-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex: 1;
}

.nav-link {
  color: #475569;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
  white-space: nowrap;
}

/* NAVIGATION EN MODE SOMBRE - TEXTE BLANC */
.header.dark-mode .nav-link {
  color: #ffffff;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #08717f, #d30025);
  transition: width 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #08717f;
}

.header.dark-mode .nav-link:hover,
.header.dark-mode .nav-link.router-link-active {
  color: #2dd4bf;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-action {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #1e293b;
}

/* BOUTONS D'ACTION EN MODE SOMBRE - FOND NOIR */
.header.dark-mode .header-action {
  background: #0a0a0a;
  color: #ffffff;
  border: 1px solid #2a2a2a;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.05);
}

.header-action:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header.dark-mode .header-action:hover {
  background: #1a1a1a;
  color: white;
  border-color: #3a3a3a;
}

/* Dark Mode Button */
.darkmode-action {
  background: #f8fafc;
  color: #1e293b;
}

.header.dark-mode .darkmode-action {
  background: #0a0a0a;
  color: #fbbf24;
  border: 1px solid #2a2a2a;
}

.darkmode-action:hover {
  background: #08717f;
  color: white;
}

.header.dark-mode .darkmode-action:hover {
  background: #1a1a1a;
  color: #fbbf24;
}

.action-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-icon,
.cart-icon {
  width: 20px;
  height: 20px;
}

.badge-count {
  position: absolute;
  top: -5px;
  left: -5px;
  background: linear-gradient(135deg, #d30025, #b00020);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 0.25rem;
  box-shadow: 0 2px 6px rgba(211, 0, 37, 0.3);
  z-index: 2;
}

/* Login Button */
.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.2rem;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(8, 113, 127, 0.25);
  height: 44px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(8, 113, 127, 0.35);
}

.login-icon {
  font-size: 1rem;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 3px 10px rgba(8, 113, 127, 0.25);
}

.user-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* Dropdown - FOND NOIR COMPLET */
.modern-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  padding: 0;
  min-width: 280px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  animation: dropdown-appear 0.2s ease;
}

.header.dark-mode .modern-dropdown {
  background: #000000;
  border-color: #2a2a2a;
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.05);
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header.dark-mode .dropdown-header {
  background: #050505;
  border-bottom-color: #2a2a2a;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 10px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.user-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.header.dark-mode .user-name {
  color: #ffffff;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.header.dark-mode .user-email {
  color: #aaaaaa;
}

.user-role {
  font-size: 0.7rem;
  color: #08717f;
  font-weight: 600;
}

.header.dark-mode .user-role {
  color: #2dd4bf;
}

.dropdown-body {
  padding: 0.5rem;
}

.modern-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.8rem;
  text-decoration: none;
  color: #475569;
  border-radius: 10px;
  transition: all 0.3s ease;
  width: 100%;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: right;
}

.header.dark-mode .modern-item {
  color: #dddddd;
}

.modern-item:hover {
  background: #f8fafc;
  color: #1e293b;
  transform: translateX(-4px);
}

.header.dark-mode .modern-item:hover {
  background: #111111;
  color: #ffffff;
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.3s ease;
}

.header.dark-mode .item-icon {
  background: #111111;
  color: #dddddd;
}

.modern-item:hover .item-icon {
  background: #08717f;
  color: white;
}

.header.dark-mode .modern-item:hover .item-icon {
  background: #08717f;
  color: white;
}

.item-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.dropdown-footer {
  padding: 0.5rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.header.dark-mode .dropdown-footer {
  background: #050505;
  border-top-color: #2a2a2a;
}

.logout-item:hover {
  background: rgba(211, 0, 37, 0.1);
  color: #d30025;
}

.header.dark-mode .logout-item:hover {
  background: rgba(211, 0, 37, 0.25);
  color: #ff4444;
}

.logout-item:hover .item-icon {
  background: #d30025;
  color: white;
}

.header.dark-mode .logout-item:hover .item-icon {
  background: #d30025;
  color: white;
}

/* Mobile Elements */
.mobile-menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.header.dark-mode .mobile-menu-toggle {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
}

.mobile-menu-toggle:hover {
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.header.dark-mode .mobile-menu-toggle:hover {
  background: #1a1a1a;
}

.hamburger {
  position: absolute;
  width: 22px;
  height: 2px;
  background: #08717f;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  transition: all 0.3s ease;
}

.header.dark-mode .hamburger {
  background: #ffffff;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 2px;
  background: #08717f;
  right: 0;
  transition: all 0.3s ease;
}

.header.dark-mode .hamburger::before,
.header.dark-mode .hamburger::after {
  background: #ffffff;
}

.hamburger::before {
  top: -7px;
}

.hamburger::after {
  bottom: -7px;
}

.hamburger.active {
  background: transparent;
}

.hamburger.active::before {
  top: 0;
  transform: rotate(45deg);
}

.hamburger.active::after {
  bottom: 0;
  transform: rotate(-45deg);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

.header.dark-mode ~ .mobile-overlay {
  background: rgba(0, 0, 0, 0.9);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-nav-centered {
    gap: 1.5rem;
  }
  .nav-link {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .main-nav-centered {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .logo {
    height: 45px;
    min-width: 110px;
  }

  .logo-image {
    max-height: 45px;
  }

  .header-actions {
    gap: 8px;
  }

  .login-btn .login-text {
    display: none;
  }

  .login-btn {
    padding: 0 1rem;
    width: 44px;
    justify-content: center;
  }

  .login-icon {
    margin: 0;
  }

  .modern-dropdown {
    min-width: 240px;
    left: -80px;
  }

  .header-action {
    width: 40px;
    height: 40px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }

  .login-btn {
    height: 40px;
    width: 40px;
  }

  .logo {
    height: 40px;
    min-width: 100px;
  }

  .logo-image {
    max-height: 40px;
  }
}

@media (max-width: 480px) {
  .modern-dropdown {
    min-width: 240px;
    left: -80px;
  }
}
</style>
