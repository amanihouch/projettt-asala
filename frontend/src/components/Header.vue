<!-- frontend/src/components/Header.vue - VERSION COMPLÈTE AVEC MOBILE -->
<template>
  <header
    class="header"
    :class="{
      'header-scrolled': isScrolled,
      'header-hidden': !showHeader,
      'dark-mode': isDarkMode
    }"
  >
    <!-- ═══════════════════════════════════════
         MAIN HEADER
    ═══════════════════════════════════════ -->
    <div class="main-header">
      <div class="container">
        <div class="header-content">

          <!-- Logo -->
          <router-link to="/" class="logo">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="logo-image" />
          </router-link>

          <!-- Navigation Centrée (Desktop uniquement) -->
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
            <button @click="toggleDarkMode" class="header-action darkmode-action" :title="isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'">
              <div class="action-icon-wrapper">
                <svg v-if="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </div>
            </button>

            <!-- Favorites -->
            <button @click="toggleWishlist" class="header-action favorites-action" title="المفضلة" :class="{ 'has-items': likesCount > 0 }">
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
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M16 10a4 4 0 11-8 0" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <span v-if="cartCount > 0" class="badge-count">{{ cartCount }}</span>
            </button>

            <!-- Login Button (Desktop) -->
            <router-link v-if="!isAuthenticated" to="/login" class="login-btn desktop-only">
              <span class="login-icon">🔐</span>
              <span class="login-text">تسجيل الدخول</span>
            </router-link>

            <!-- User Menu (Desktop) -->
            <div v-else class="user-menu desktop-only" @click.stop="toggleUserMenu" ref="userMenu">
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
                    <router-link v-if="userRole === 'customer'" to="/profile" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      </div>
                      <span class="item-text">الملف الشخصي</span>
                    </router-link>
                    <router-link v-if="userRole === 'vendor' && vendorLink" :to="vendorLink" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      </div>
                      <span class="item-text">متجري</span>
                    </router-link>
                    <router-link to="/orders" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      </div>
                      <span class="item-text">طلباتي</span>
                    </router-link>
                    <router-link v-if="userRole === 'admin'" to="/admin" class="dropdown-item modern-item" @click="closeUserMenu">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83" stroke="currentColor" stroke-width="1.5"/></svg>
                      </div>
                      <span class="item-text">لوحة التحكم</span>
                    </router-link>
                  </div>
                  <div class="dropdown-footer">
                    <button @click="logout" class="dropdown-item modern-item logout-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      </div>
                      <span class="item-text">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Mobile Burger -->
          <button @click="toggleMobileMenu" class="mobile-menu-toggle" aria-label="القائمة">
            <span class="hamburger" :class="{ active: showMobileMenu }"></span>
          </button>

        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         MOBILE MENU PANEL
    ═══════════════════════════════════════ -->
    <transition name="mobile-slide">
      <div v-if="showMobileMenu" class="mobile-menu-panel">

        <!-- Header du panel -->
        <div class="mobile-menu-header">
          <router-link to="/" class="mobile-logo" @click="closeMobileMenu">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="mobile-logo-image"/>
          </router-link>
          <button @click="closeMobileMenu" class="mobile-close-btn" aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- User Info (si connecté) -->
        <div v-if="isAuthenticated" class="mobile-user-info">
          <div class="mobile-user-avatar">{{ userInitials }}</div>
          <div class="mobile-user-details">
            <div class="mobile-user-name">{{ userName }}</div>
            <div class="mobile-user-email">{{ userEmail }}</div>
            <div class="mobile-user-role" v-if="userRole === 'vendor'">حرفي</div>
            <div class="mobile-user-role" v-else-if="userRole === 'customer'">عميل</div>
            <div class="mobile-user-role" v-else-if="userRole === 'admin'">مدير</div>
          </div>
        </div>

        <!-- Navigation principale -->
        <nav class="mobile-nav">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>الرئيسية</span>
          </router-link>

          <router-link to="/products" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18"/>
              <path d="M16 10a4 4 0 11-8 0"/>
            </svg>
            <span>المنتجات</span>
          </router-link>

          <router-link to="/artisans" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="7" r="4"/>
              <path d="M5.5 21v-2a4.5 4.5 0 014.5-4.5h4a4.5 4.5 0 014.5 4.5v2"/>
            </svg>
            <span>الحرفيون</span>
          </router-link>

          <router-link to="/about" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>من نحن</span>
          </router-link>

          <router-link to="/contact" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            <span>اتصل بنا</span>
          </router-link>

          <!-- Séparateur si connecté -->
          <div v-if="isAuthenticated" class="mobile-nav-divider"></div>

          <router-link v-if="isAuthenticated && userRole === 'customer'" to="/profile" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="3"/>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            </svg>
            <span>الملف الشخصي</span>
          </router-link>

          <router-link v-if="isAuthenticated && userRole === 'vendor' && vendorLink" :to="vendorLink" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <span>متجري</span>
          </router-link>

          <router-link v-if="isAuthenticated" to="/orders" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <span>طلباتي</span>
          </router-link>

          <router-link v-if="isAuthenticated && userRole === 'admin'" to="/admin" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="nav-link-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83"/>
            </svg>
            <span>لوحة التحكم</span>
          </router-link>
        </nav>

        <!-- Footer du panel -->
        <div class="mobile-menu-footer">
          <!-- Dark mode -->
          <button @click="toggleDarkMode" class="mobile-footer-action">
            <svg v-if="!isDarkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <span>{{ isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن' }}</span>
          </button>

          <!-- Logout -->
          <button v-if="isAuthenticated" @click="logoutAndClose" class="mobile-footer-action logout-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span>تسجيل الخروج</span>
          </button>

          <!-- Login (si non connecté) -->
          <router-link v-if="!isAuthenticated" to="/login" class="mobile-login-btn" @click="closeMobileMenu">
            🔐 تسجيل الدخول
          </router-link>
        </div>
      </div>
    </transition>

    <!-- Overlay sombre derrière le menu mobile -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore }   from '../stores/cart'
import { useLikesStore }  from '../stores/likes'
import { useAuthStore }   from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { useThemeStore }  from '../stores/theme'

const router      = useRouter()
const cartStore   = useCartStore()
const likesStore  = useLikesStore()
const authStore   = useAuthStore()
const vendorStore = useVendorStore()
const themeStore  = useThemeStore()

// ── Dark mode ──────────────────────────────────
const isDarkMode    = computed(() => themeStore.isDarkMode)
const toggleDarkMode = () => themeStore.toggleTheme()

// ── State ──────────────────────────────────────
const showUserMenu  = ref(false)
const showMobileMenu = ref(false)
const isScrolled    = ref(false)
const showHeader    = ref(true)
const lastScrollY   = ref(0)
const userMenu      = ref(null)

// ── Computed ───────────────────────────────────
const cartCount       = computed(() => cartStore.itemCount || 0)
const likesCount      = computed(() => likesStore.likesCount || 0)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName        = computed(() => authStore.userName || authStore.user?.name || 'مستخدم')
const userEmail       = computed(() => authStore.userEmail || authStore.user?.email || '')
const userRole        = computed(() => authStore.userRole  || authStore.user?.role  || 'customer')
const userId          = computed(() => authStore.userId    || authStore.user?.id)

const vendorId = computed(() => {
  if (authStore.vendorId) return authStore.vendorId
  if (authStore.user?.vendorId) return authStore.user.vendorId
  const local = localStorage.getItem('vendorId')
  if (local && local !== 'null' && local !== 'undefined') return local
  if (vendorStore.currentVendor?.id) return vendorStore.currentVendor.id
  return null
})

const vendorLink = computed(() => vendorId.value ? `/vendor/${vendorId.value}` : null)

const userInitials = computed(() => {
  const n = userName.value
  return (n && n !== 'مستخدم') ? n.charAt(0).toUpperCase() : 'U'
})

// ── Methods ────────────────────────────────────
const toggleWishlist = () => { if (typeof likesStore.toggleSidebar === 'function') likesStore.toggleSidebar() }
const toggleCart     = () => { if (typeof cartStore.toggleCart === 'function') cartStore.toggleCart() }

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) showMobileMenu.value = false
}
const closeUserMenu = () => { showUserMenu.value = false }

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  document.body.style.overflow = showMobileMenu.value ? 'hidden' : ''
  if (showMobileMenu.value) showUserMenu.value = false
}
const closeMobileMenu = () => {
  showMobileMenu.value = false
  document.body.style.overflow = ''
}

const logout = async () => {
  await authStore.logout()
  showUserMenu.value = false
  router.push('/')
}
const logoutAndClose = async () => {
  await authStore.logout()
  closeMobileMenu()
  showUserMenu.value = false
  router.push('/')
}

const loadVendorData = async () => {
  if (userRole.value === 'vendor' && userId.value) {
    try {
      const existingId = authStore.vendorId || localStorage.getItem('vendorId')
      if (existingId && existingId !== 'null' && existingId !== 'undefined') {
        await vendorStore.fetchVendorById(existingId)
      } else {
        const vendor = await vendorStore.fetchVendorByUserId(userId.value)
        if (vendor?.id) {
          authStore.setVendorId(vendor.id)
          localStorage.setItem('vendorId', vendor.id)
        }
      }
    } catch (e) { console.error('❌ Erreur vendeur:', e) }
  }
}

// ── Scroll ─────────────────────────────────────
const handleScroll = () => {
  const y = window.scrollY
  isScrolled.value = y > 30
  showHeader.value = !(y > lastScrollY.value && y > 80)
  lastScrollY.value = y
}

const handleClickOutside = (e) => {
  if (userMenu.value && !userMenu.value.contains(e.target)) showUserMenu.value = false
}

const handleResize = () => {
  if (window.innerWidth > 768) closeMobileMenu()
}

// ── Lifecycle ──────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  router.afterEach(() => {
    closeMobileMenu()
    showUserMenu.value = false
    showHeader.value = true
    lastScrollY.value = 0
  })
  if (typeof likesStore.loadFromStorage === 'function') likesStore.loadFromStorage()
  if (typeof cartStore.loadFromStorage  === 'function') cartStore.loadFromStorage()
  loadVendorData()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ══════════════════════════════════════
   BASE HEADER
══════════════════════════════════════ */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
  transition: transform 0.4s ease, box-shadow 0.3s ease, background 0.3s ease;
  font-family: 'Amiri', 'Cairo', serif;
}
.header * { font-family: 'Amiri', 'Cairo', serif; }
.header.dark-mode { background: #000; box-shadow: 0 2px 15px rgba(255,255,255,0.05); }
.header-scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.header.dark-mode.header-scrolled { box-shadow: 0 4px 20px rgba(255,255,255,0.1); }
.header-hidden { transform: translateY(-100%); }

.container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
.main-header { padding: 0.8rem 0; }

.header-content {
  display: flex; align-items: center;
  justify-content: space-between; gap: 20px;
}

/* ── Logo ── */
.logo {
  display: flex; align-items: center;
  height: 50px; min-width: 130px;
  text-decoration: none; flex-shrink: 0;
  transition: transform 0.3s ease;
}
.logo:hover { transform: scale(1.03); }
.logo-image { height: 100%; width: auto; max-height: 50px; }

/* ── Nav desktop ── */
.main-nav-centered {
  display: flex; align-items: center;
  justify-content: center; gap: 2rem; flex: 1;
}
.nav-link {
  color: #475569; text-decoration: none;
  font-weight: 600; font-size: 1rem;
  padding: 0.5rem 0; position: relative;
  transition: color 0.3s ease; white-space: nowrap;
}
.header.dark-mode .nav-link { color: #fff; }
.nav-link::after {
  content: ''; position: absolute; bottom: 0; right: 0;
  width: 0; height: 2px;
  background: linear-gradient(135deg, #08717f, #d30025);
  transition: width 0.3s ease;
}
.nav-link:hover, .nav-link.router-link-active { color: #08717f; }
.header.dark-mode .nav-link:hover, .header.dark-mode .nav-link.router-link-active { color: #2dd4bf; }
.nav-link:hover::after, .nav-link.router-link-active::after { width: 100%; }

/* ── Actions ── */
.header-actions {
  display: flex; align-items: center;
  gap: 12px; flex-shrink: 0;
}
.header-action {
  position: relative; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; border: none; border-radius: 12px;
  cursor: pointer; transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); color: #1e293b;
}
.header.dark-mode .header-action { background: #0a0a0a; color: #fff; border: 1px solid #2a2a2a; }
.header-action:hover { background: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.header.dark-mode .header-action:hover { background: #1a1a1a; border-color: #3a3a3a; }

.darkmode-action { background: #f8fafc; color: #1e293b; }
.header.dark-mode .darkmode-action { background: #0a0a0a; color: #fbbf24; border: 1px solid #2a2a2a; }
.darkmode-action:hover { background: #08717f; color: white; }
.header.dark-mode .darkmode-action:hover { background: #1a1a1a; color: #fbbf24; }

.action-icon-wrapper { display: flex; align-items: center; justify-content: center; }
.heart-icon, .cart-icon { width: 20px; height: 20px; }

.badge-count {
  position: absolute; top: -5px; left: -5px;
  background: linear-gradient(135deg, #d30025, #b00020); color: white;
  font-size: 0.65rem; font-weight: 700;
  min-width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 9px; padding: 0 0.25rem;
  box-shadow: 0 2px 6px rgba(211,0,37,0.3); z-index: 2;
}

/* ── Login btn ── */
.login-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0 1.2rem; height: 44px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white; text-decoration: none;
  border-radius: 40px; font-weight: 700; font-size: 0.9rem;
  transition: all 0.3s ease; box-shadow: 0 3px 8px rgba(8,113,127,0.25);
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 12px rgba(8,113,127,0.35); }

/* ── User menu ── */
.user-menu { position: relative; }
.user-avatar {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 12px; cursor: pointer; transition: all 0.3s ease;
  color: white; font-weight: 700; font-size: 1.1rem;
  box-shadow: 0 3px 10px rgba(8,113,127,0.25);
}
.user-avatar:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(8,113,127,0.3); }

/* ── Dropdown ── */
.modern-dropdown {
  position: absolute; top: calc(100% + 0.5rem); left: 0;
  background: white; border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  min-width: 280px; z-index: 100; overflow: hidden;
  border: 1px solid #f1f5f9;
  animation: dropdownAppear 0.2s ease;
}
.header.dark-mode .modern-dropdown { background: #000; border-color: #2a2a2a; box-shadow: 0 15px 40px rgba(255,255,255,0.05); }
@keyframes dropdownAppear { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

.dropdown-header { padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.header.dark-mode .dropdown-header { background: #050505; border-bottom-color: #2a2a2a; }
.user-info { display: flex; align-items: center; gap: 0.8rem; }
.user-avatar-small {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 10px; color: white; font-weight: 700;
}
.user-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.header.dark-mode .user-name { color: #fff; }
.user-email { font-size: 0.75rem; color: #64748b; }
.header.dark-mode .user-email { color: #aaa; }
.user-role { font-size: 0.7rem; color: #08717f; font-weight: 600; }
.header.dark-mode .user-role { color: #2dd4bf; }

.dropdown-body { padding: 0.5rem; }
.modern-item {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.7rem 0.8rem; text-decoration: none; color: #475569;
  border-radius: 10px; transition: all 0.3s ease;
  width: 100%; border: none; background: none;
  font-family: inherit; font-size: 0.9rem; cursor: pointer; text-align: right;
}
.header.dark-mode .modern-item { color: #ddd; }
.modern-item:hover { background: #f8fafc; color: #1e293b; transform: translateX(-4px); }
.header.dark-mode .modern-item:hover { background: #111; color: #fff; }

.item-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 8px; color: #64748b; transition: all 0.3s ease;
}
.header.dark-mode .item-icon { background: #111; color: #ddd; }
.modern-item:hover .item-icon { background: #08717f; color: white; }
.item-text { font-size: 0.9rem; font-weight: 600; }

.dropdown-footer { padding: 0.5rem; border-top: 1px solid #f1f5f9; background: #f8fafc; }
.header.dark-mode .dropdown-footer { background: #050505; border-top-color: #2a2a2a; }
.logout-item:hover { background: rgba(211,0,37,0.1); color: #d30025; }
.header.dark-mode .logout-item:hover { background: rgba(211,0,37,0.25); color: #f44; }
.logout-item:hover .item-icon { background: #d30025; color: white; }

/* ── Burger (caché sur desktop) ── */
.mobile-menu-toggle { display: none; }

/* ══════════════════════════════════════
   MOBILE PANEL
══════════════════════════════════════ */
.mobile-menu-panel {
  position: fixed; top: 0; right: 0;
  width: 85%; max-width: 360px;
  height: 100vh; height: 100dvh;
  background: white; z-index: 1001;
  display: flex; flex-direction: column;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0,0,0,0.12);
}
.header.dark-mode .mobile-menu-panel { background: #0f172a; box-shadow: -4px 0 20px rgba(0,0,0,0.4); }

/* Animations panel */
.mobile-slide-enter-active { animation: slideIn 0.3s ease; }
.mobile-slide-leave-active  { animation: slideOut 0.3s ease; }
@keyframes slideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideOut { from { transform: translateX(0);    } to { transform: translateX(100%); } }

/* Header du panel */
.mobile-menu-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 16px; min-height: 56px;
  border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
  direction: rtl;
}
.header.dark-mode .mobile-menu-header { border-bottom-color: #1e293b; }

.mobile-logo { height: 36px; display: flex; align-items: center; }
.mobile-logo-image { height: 36px; width: auto; display: block; }

.mobile-close-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #475569; transition: all 0.2s ease;
}
.header.dark-mode .mobile-close-btn { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.mobile-close-btn:active { background: #ef4444 !important; color: white !important; }

/* User info mobile */
.mobile-user-info {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  direction: rtl; flex-shrink: 0;
}
.header.dark-mode .mobile-user-info { background: #1e293b; border-bottom-color: #334155; }

.mobile-user-avatar {
  width: 48px; height: 48px; border-radius: 12px;
  background: #08717f; color: white;
  font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mobile-user-details { flex: 1; min-width: 0; }
.mobile-user-name { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.header.dark-mode .mobile-user-name { color: #f1f5f9; }
.mobile-user-email { font-size: 13px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mobile-user-role {
  display: inline-block; font-size: 11px; font-weight: 600;
  color: #08717f; background: #e0f2fe;
  padding: 2px 10px; border-radius: 20px; margin-top: 4px;
}
.header.dark-mode .mobile-user-role { color: #2dd4bf; background: #042f2e; }

/* Navigation mobile */
.mobile-nav {
  flex: 1; padding: 12px;
  display: flex; flex-direction: column; gap: 4px;
  overflow-y: auto; direction: rtl;
}
.mobile-nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px; border-radius: 10px;
  text-decoration: none; color: #475569;
  font-size: 15px; font-weight: 600;
  transition: all 0.2s ease; min-height: 48px;
}
.header.dark-mode .mobile-nav-link { color: #cbd5e1; }
.mobile-nav-link:active { background: #f1f5f9; }
.header.dark-mode .mobile-nav-link:active { background: #1e293b; }
.mobile-nav-link.router-link-active { background: #e0f2fe; color: #08717f; }
.header.dark-mode .mobile-nav-link.router-link-active { background: #042f2e; color: #2dd4bf; }
.nav-link-icon { width: 20px; height: 20px; flex-shrink: 0; }
.mobile-nav-divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
.header.dark-mode .mobile-nav-divider { background: #1e293b; }

/* Footer mobile */
.mobile-menu-footer {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  display: flex; flex-direction: column; gap: 8px;
  flex-shrink: 0; direction: rtl;
}
.header.dark-mode .mobile-menu-footer { border-top-color: #1e293b; }

.mobile-footer-action {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 10px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  cursor: pointer; color: #475569;
  font-size: 14px; font-weight: 600;
  font-family: inherit; text-align: right;
  width: 100%; transition: all 0.2s ease; min-height: 44px;
}
.header.dark-mode .mobile-footer-action { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.mobile-footer-action:active { background: #f1f5f9; }
.header.dark-mode .mobile-footer-action:active { background: #334155; }
.logout-action { color: #ef4444 !important; }
.logout-action:active { background: #fef2f2 !important; }
.header.dark-mode .logout-action:active { background: #450a0a !important; }

.mobile-login-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px; background: #08717f; color: white;
  text-decoration: none; border-radius: 10px;
  font-size: 15px; font-weight: 700;
  transition: all 0.2s ease; min-height: 48px;
}
.mobile-login-btn:active { background: #065a69; transform: scale(0.98); }

/* Overlay */
.mobile-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000; animation: fadeInOverlay 0.3s ease;
}
@keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }

/* ══════════════════════════════════════
   RESPONSIVE — TABLET
══════════════════════════════════════ */
@media (max-width: 1024px) {
  .main-nav-centered { gap: 1.5rem; }
  .nav-link { font-size: 0.9rem; }
}

/* ══════════════════════════════════════
   RESPONSIVE — MOBILE ≤ 768px
══════════════════════════════════════ */
@media (max-width: 768px) {

  /* Masquer nav et boutons desktop */
  .main-nav-centered,
  .desktop-only { display: none !important; }

  /* Header compact */
  .header {
    background: rgba(255,255,255,0.95) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(0,0,0,0.06) !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
  }
  .header.dark-mode {
    background: rgba(15,23,42,0.95) !important;
    border-bottom-color: rgba(255,255,255,0.06) !important;
  }
  .header-scrolled {
    background: rgba(255,255,255,0.98) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  }
  .header.dark-mode.header-scrolled {
    background: rgba(15,23,42,0.99) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25) !important;
  }

  .main-header { padding: 0 !important; height: 56px !important; display: flex !important; align-items: center !important; }
  .container   { padding: 0 14px !important; max-width: 100% !important; }

  /*
   * RTL : logo à droite, burger à gauche
   * direction:rtl sur header-content pousse le logo (1er) à droite
   * les header-actions restent en direction:ltr pour garder l'ordre des icônes
   */
  .header-content {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    flex-direction: row !important;
    height: 56px !important;
    direction: rtl !important;
    gap: 0 !important;
  }

  /* Logo */
  .logo { height: 40px !important; min-width: auto !important; }
  .logo-image { height: 36px !important; max-height: 36px !important; }

  /* Actions : direction ltr pour conserver l'ordre interne */
  .header-actions {
    display: flex !important; align-items: center !important;
    gap: 6px !important; direction: ltr !important;
    flex-shrink: 0 !important; margin: 0 !important; padding: 0 !important;
  }

  .header-action {
    width: 38px !important; height: 38px !important;
    min-width: 38px !important; min-height: 38px !important;
    border-radius: 10px !important;
    background: rgba(241,245,249,0.8) !important;
    border: 1px solid rgba(226,232,240,0.6) !important;
    box-shadow: none !important; margin: 0 !important; padding: 0 !important;
  }
  .header.dark-mode .header-action {
    background: rgba(30,41,59,0.8) !important;
    border-color: rgba(51,65,85,0.6) !important;
    color: #cbd5e1 !important;
  }
  .header-action:active { transform: scale(0.94) !important; }
  .header-action svg, .action-icon-wrapper svg { width: 18px !important; height: 18px !important; }

  .darkmode-action { color: #475569 !important; }
  .header.dark-mode .darkmode-action { color: #fbbf24 !important; }

  /* Badge : à droite (RTL corrigé) */
  .badge-count {
    top: -5px !important; right: -5px !important; left: auto !important;
    font-size: 10px !important; min-width: 18px !important; height: 18px !important;
    border: 2px solid white !important; box-shadow: none !important;
  }
  .header.dark-mode .badge-count { border-color: #0f172a !important; }

  /* Avatar user mobile */
  .user-avatar {
    width: 38px !important; height: 38px !important;
    min-width: 38px !important; min-height: 38px !important;
    border-radius: 10px !important; font-size: 15px !important;
    box-shadow: none !important; margin: 0 !important;
  }
  .user-avatar:active { transform: scale(0.94) !important; }

  /* Burger visible */
  .mobile-menu-toggle {
    display: flex !important; align-items: center !important; justify-content: center !important;
    width: 38px !important; height: 38px !important;
    min-width: 38px !important; min-height: 38px !important;
    border-radius: 10px !important;
    background: rgba(241,245,249,0.8) !important;
    border: 1px solid rgba(226,232,240,0.6) !important;
    cursor: pointer !important; flex-shrink: 0 !important;
    position: relative !important; margin: 0 !important; padding: 0 !important;
  }
  .header.dark-mode .mobile-menu-toggle {
    background: rgba(30,41,59,0.8) !important;
    border-color: rgba(51,65,85,0.6) !important;
  }
  .mobile-menu-toggle:active { transform: scale(0.94) !important; }

  /* Barres burger */
  .hamburger {
    display: block !important; width: 18px !important; height: 2px !important;
    background: #475569 !important; border-radius: 2px !important;
    position: absolute !important; top: 50% !important; left: 50% !important;
    transform: translate(-50%, -50%) !important; transition: all 0.3s ease !important;
  }
  .header.dark-mode .hamburger { background: #cbd5e1 !important; }
  .hamburger::before, .hamburger::after {
    content: '' !important; position: absolute !important;
    width: 18px !important; height: 2px !important;
    background: #475569 !important; border-radius: 2px !important;
    left: 0 !important; transition: all 0.3s ease !important;
  }
  .header.dark-mode .hamburger::before,
  .header.dark-mode .hamburger::after { background: #cbd5e1 !important; }
  .hamburger::before { top: -6px !important; }
  .hamburger::after  { bottom: -6px !important; }
  .hamburger.active { background: transparent !important; }
  .hamburger.active::before { top: 0 !important; transform: rotate(45deg) !important; }
  .hamburger.active::after  { bottom: 0 !important; transform: rotate(-45deg) !important; }

  /* Dropdown centré sur mobile */
  .modern-dropdown {
    position: fixed !important;
    top: 50% !important; left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90% !important; max-width: 320px !important;
    direction: rtl !important; animation: none !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
  }
  .header.dark-mode .modern-dropdown {
    background: #1e293b !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
  }
  .dropdown-header { padding: 14px 16px !important; }
  .header.dark-mode .dropdown-header { background: #0f172a !important; border-bottom-color: #334155 !important; }
  .user-name  { font-size: 15px !important; }
  .user-email { font-size: 12px !important; }
  .user-role  { font-size: 11px !important; }
  .header.dark-mode .user-name  { color: #f1f5f9 !important; }
  .header.dark-mode .user-email { color: #94a3b8 !important; }
  .header.dark-mode .user-role  { color: #2dd4bf !important; }
  .dropdown-body, .dropdown-footer { padding: 8px !important; }
  .header.dark-mode .dropdown-footer { background: #0f172a !important; border-top-color: #334155 !important; }
  .modern-item { padding: 12px 14px !important; font-size: 14px !important; }
  .modern-item:hover { transform: none !important; }
  .modern-item:active { background: #f1f5f9 !important; }
  .header.dark-mode .modern-item:active { background: #334155 !important; }
  .header.dark-mode .modern-item { color: #cbd5e1 !important; }
  .item-icon { width: 32px !important; height: 32px !important; border-radius: 8px !important; }
  .header.dark-mode .item-icon { background: #334155 !important; color: #cbd5e1 !important; }
  .logout-item { color: #ef4444 !important; }
  .logout-item:active { background: #fef2f2 !important; }
  .header.dark-mode .logout-item:active { background: #450a0a !important; }
}

/* ══════════════════════════════════════
   FIX iOS Safari
══════════════════════════════════════ */
@supports (-webkit-touch-callout: none) {
  .header { position: -webkit-sticky; position: sticky; }
  .mobile-menu-footer { padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important; }
}
</style>
