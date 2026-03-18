<!-- frontend/src/components/Header.vue -->
<template>
  <header
    class="header"
    :class="{
      'header-scrolled': isScrolled,
      'header-hidden': !showHeader,
    }"
  >
    <!-- Top Bar avec changement de langue -->
    <div class="top-bar">
      <div class="container">
        <div class="top-bar-content">
          <div class="top-bar-right">
            <a href="tel:+21612345678" class="top-link">
              <span class="icon">📞</span>
              <span>+216 12 345 678</span>
            </a>
            <a href="mailto:contact@turath.tn" class="top-link">
              <span class="icon">✉️</span>
              <span>contact@turath.tn</span>
            </a>
          </div>
          <div class="top-bar-left">
            <button @click="toggleLanguage" class="top-link language-switcher">
              <span class="icon">🌐</span>
              <span>{{ currentLanguage === 'ar' ? 'Français' : 'العربية' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="main-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <router-link to="/" class="logo">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="logo-image" />
          </router-link>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-bar">
              <input
                type="text"
                v-model="searchQuery"
                @keyup.enter="performSearch"
                :placeholder="t('search.placeholder')"
                class="search-input"
              />
              <button @click="performSearch" class="search-btn">
                <span class="icon">🔍</span>
              </button>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="header-actions">
            <!-- Categories Dropdown -->
            <div
              class="categories-dropdown"
              @mouseenter="showCategories = true"
              @mouseleave="showCategories = false"
            >
              <button class="header-action categories-action" :title="t('nav.categories')">
                <div class="action-icon-wrapper">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <rect x="3" y="3" width="8" height="8" rx="2" />
                    <rect x="13" y="3" width="8" height="8" rx="2" />
                    <rect x="3" y="13" width="8" height="8" rx="2" />
                    <rect x="13" y="13" width="8" height="8" rx="2" />
                  </svg>
                </div>
              </button>

              <!-- Categories Dropdown Menu -->
              <transition name="dropdown">
                <div v-if="showCategories" class="categories-menu">
                  <div class="categories-header">
                    <h3>{{ t('nav.categories') }}</h3>
                  </div>
                  <div class="categories-grid">
                    <router-link
                      v-for="category in categories"
                      :key="category.id"
                      :to="`/products?category=${category.slug}`"
                      class="category-item"
                      @click="showCategories = false"
                    >
                      <span class="category-icon">{{ category.icon }}</span>
                      <span class="category-name">{{ category.name }}</span>
                      <span class="category-count">{{ category.count }}</span>
                    </router-link>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Favorites -->
            <button
              @click="toggleWishlist"
              class="header-action favorites-action"
              :title="t('actions.favorites')"
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
                <div class="heart-pulse" v-if="likesCount > 0"></div>
              </div>
              <span v-if="likesCount > 0" class="badge-count">
                {{ likesCount }}
              </span>
            </button>

            <!-- Cart -->
            <button @click="toggleCart" class="header-action cart-action" :title="t('actions.cart')">
              <div class="action-icon-wrapper">
                <svg class="cart-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M16 10a4 4 0 11-8 0" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <div class="cart-dot" v-if="cartCount > 0"></div>
              </div>
              <span v-if="cartCount > 0" class="badge-count">{{ cartCount }}</span>
            </button>

            <!-- Login Button -->
            <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
              <span class="login-icon">🔐</span>
              <span class="login-text">{{ t('actions.login') }}</span>
            </router-link>

            <!-- User Menu -->
            <div v-else class="user-menu" @click.stop="toggleUserMenu" ref="userMenu">
              <div class="user-avatar">
                {{ userInitials }}
              </div>
              <transition name="dropdown">
                <div v-if="showUserMenu" class="dropdown-menu modern-dropdown">
                  <div class="dropdown-header">
                    <div class="user-info">
                      <div class="user-avatar-small">{{ userInitials }}</div>
                      <div>
                        <div class="user-name">{{ userName }}</div>
                        <div class="user-email">{{ userEmail }}</div>
                        <div class="user-role" v-if="userRole === 'vendor'">{{ t('vendor.profile') }}</div>
                        <div class="user-role" v-else-if="userRole === 'customer'">{{ t('common.profile') }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="dropdown-body">
                    <!-- Pour les clients -->
                    <router-link
                      v-if="userRole === 'customer'"
                      to="/profile"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
                          <path
                            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                      <span class="item-text">{{ t('common.profile') }}</span>
                    </router-link>

                    <!-- Pour les vendeurs - CORRIGÉ: utilisation de vendorId -->
                    <router-link
                      v-if="userRole === 'vendor'"
                      :to="`/vendor/${vendorId}`"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
                          <path
                            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                      <span class="item-text">{{ t('vendor.shop') }}</span>
                    </router-link>

                    <!-- Commandes pour tous -->
                    <router-link
                      to="/orders"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                          <path
                            d="M3 9h18M9 21V9"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                      <span class="item-text">{{ t('common.orders') }}</span>
                    </router-link>

                    <!-- Favorites pour tous -->
                    <router-link
                      to="/favorites"
                      class="dropdown-item modern-item"
                      @click="closeUserMenu"
                    >
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                        </svg>
                      </div>
                      <span class="item-text">{{ t('actions.favorites') }}</span>
                    </router-link>
                  </div>

                  <div class="dropdown-footer">
                    <button @click="logout" class="dropdown-item modern-item logout-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                      <span class="item-text">{{ t('actions.logout') }}</span>
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

        <!-- Navigation -->
        <nav class="main-nav" :class="{ 'mobile-open': showMobileMenu }">
          <div class="mobile-nav-header">
            <router-link to="/" class="mobile-logo" @click="closeMobileMenu">
              <img src="/src/assets/asala logo.svg" alt="ASALA" class="mobile-logo-image" />
            </router-link>
            <button @click="closeMobileMenu" class="mobile-close-btn">✕</button>
          </div>

          <router-link to="/" class="nav-link" @click="closeMobileMenu">{{ t('nav.home') }}</router-link>

          <!-- Mobile Categories -->
          <div class="mobile-categories">
            <div class="mobile-categories-header" @click="toggleMobileCategories">
              <span>{{ t('nav.categories') }}</span>
              <span class="chevron" :class="{ rotated: showMobileCategories }">▼</span>
            </div>
            <transition name="slide">
              <div v-if="showMobileCategories" class="mobile-categories-list">
                <router-link
                  v-for="category in categories"
                  :key="category.id"
                  :to="`/products?category=${category.slug}`"
                  class="mobile-category-item"
                  @click="closeMobileMenu"
                >
                  <span class="category-icon">{{ category.icon }}</span>
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-count">{{ category.count }}</span>
                </router-link>
              </div>
            </transition>
          </div>

          <router-link to="/products" class="nav-link" @click="closeMobileMenu">{{ t('nav.products') }}</router-link>
          <router-link to="/artisans" class="nav-link" @click="closeMobileMenu">{{ t('nav.artisans') }}</router-link>
          <router-link to="/about" class="nav-link" @click="closeMobileMenu">{{ t('nav.about') }}</router-link>
          <router-link to="/contact" class="nav-link" @click="closeMobileMenu">{{ t('nav.contact') }}</router-link>
        </nav>
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '../stores/cart';
import { useLikesStore } from '../stores/likes';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const { t, locale } = useI18n();
const cartStore = useCartStore();
const likesStore = useLikesStore();
const authStore = useAuthStore();

// ===== STATE =====
const searchQuery = ref('');
const showUserMenu = ref(false);
const showMobileMenu = ref(false);
const showCategories = ref(false);
const showMobileCategories = ref(false);
const isScrolled = ref(false);
const showHeader = ref(true);
const lastScrollY = ref(0);
const userMenu = ref(null);

// ===== COMPUTED =====
const currentLanguage = computed(() => locale.value);

const cartCount = computed(() => cartStore.itemCount);
const likesCount = computed(() => likesStore.likesCount);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.userName || 'User');
const userEmail = computed(() => authStore.userEmail || '');
const userRole = computed(() => authStore.userRole);
const userId = computed(() => authStore.userId);

// ✅ CORRECTION: vendorId computed qui combine plusieurs sources
const vendorId = computed(() => {
  // Priorité: store vendorId > user.vendorId > localStorage
  return authStore.vendorId ||
         authStore.user?.vendorId ||
         localStorage.getItem('vendorId');
});

const userInitials = computed(() => {
  const name = userName.value;
  return name ? name.charAt(0).toUpperCase() : 'U';
});

// ===== CATEGORIES =====
const categories = ref([
  { id: 1, name: 'عطور', nameFr: 'Parfums', slug: 'perfumes', icon: '🌸', count: 87 },
  { id: 2, name: 'حلي و اكسسوارات', nameFr: 'Bijoux et accessoires', slug: 'jewelry', icon: '💍', count: 312 },
  { id: 3, name: 'ملابس', nameFr: 'Vêtements', slug: 'clothing', icon: '👗', count: 278 },
  { id: 4, name: 'ديكور', nameFr: 'Décoration', slug: 'decor', icon: '🏺', count: 156 },
  { id: 5, name: 'أقمشة وسجادات', nameFr: 'Tissus et tapis', slug: 'textiles', icon: '🧵', count: 234 },
  { id: 6, name: 'أواني', nameFr: 'Poterie', slug: 'pottery', icon: '🍽️', count: 189 },
  { id: 7, name: 'عناية وتجميل', nameFr: 'Soins et beauté', slug: 'beauty', icon: '🧴', count: 123 },
  { id: 8, name: 'أغذية', nameFr: 'Aliments', slug: 'food', icon: '🍯', count: 67 },
  { id: 9, name: 'أخرى', nameFr: 'Autres', slug: 'other', icon: '✨', count: 45 },
]);

// ===== METHODS =====
const toggleLanguage = () => {
  const newLocale = locale.value === 'ar' ? 'fr' : 'ar';
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
  document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = newLocale;
};

const toggleWishlist = () => {
  likesStore.toggleSidebar();
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/products',
      query: { search: searchQuery.value }
    });
  }
};

const toggleCart = () => {
  cartStore.toggleCart();
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showMobileMenu.value = false;
  }
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  document.body.style.overflow = showMobileMenu.value ? 'hidden' : '';
  if (!showMobileMenu.value) {
    showMobileCategories.value = false;
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  showMobileCategories.value = false;
  document.body.style.overflow = '';
};

const toggleMobileCategories = () => {
  showMobileCategories.value = !showMobileCategories.value;
};

const logout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push('/');
};

// ===== SCROLL HANDLER =====
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  isScrolled.value = currentScrollY > 30;

  if (currentScrollY > lastScrollY.value && currentScrollY > 80) {
    showHeader.value = false;
  } else {
    showHeader.value = true;
  }

  lastScrollY.value = currentScrollY;
};

const handleClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    showUserMenu.value = false;
  }
};

const handleRouteChange = () => {
  showMobileMenu.value = false;
  showUserMenu.value = false;
  showCategories.value = false;
  showMobileCategories.value = false;
  document.body.style.overflow = '';
  showHeader.value = true;
  lastScrollY.value = 0;
};

// ===== LOGGING POUR DEBUG =====
const logUserInfo = () => {
  console.log('👤 User ID:', userId.value);
  console.log('🏪 Vendor ID:', vendorId.value);
  console.log('🔗 Lien vers:', vendorId.value || userId.value);
  console.log('🎭 Rôle:', userRole.value);
  console.log('📦 localStorage vendorId:', localStorage.getItem('vendorId'));
};

// ===== WATCHERS =====
watch([userId, vendorId, userRole], () => {
  logUserInfo();
});

// ===== LIFECYCLE =====
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('click', handleClickOutside);
  router.afterEach(handleRouteChange);

  // Charger les données
  likesStore.loadFromStorage();
  cartStore.loadFromStorage();

  // Log initial
  setTimeout(() => {
    logUserInfo();
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* ===== TOUS VOS STYLES EXISTANTS ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.4s ease,
    box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.header-scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Top Bar */
.top-bar {
  background: linear-gradient(135deg, #065a69, #08717f);
  color: white;
  padding: 0.3rem 0;
  font-size: 0.8rem;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar-right,
.top-bar-left {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.top-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.top-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

/* Main Header */
.main-header {
  padding: 0.5rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 0 15px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  height: 45px;
  min-width: 120px;
  margin-right: 10px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.03);
}

.logo-image {
  height: 100%;
  width: auto;
  max-height: 45px;
}

/* Search Bar - Simplifiée */
.search-bar {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 40px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  height: 42px;
}

.search-bar:focus-within {
  border-color: #08717f;
  background: white;
  box-shadow: 0 3px 10px rgba(8, 113, 127, 0.1);
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-input {
  flex: 1;
  padding: 0 18px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  direction: rtl;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
  font-size: 0.9rem;
}

.search-btn {
  padding: 0 1.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  height: 100%;
}

.search-btn:hover {
  color: #d30025;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-action {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-action:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Categories Dropdown */
.categories-dropdown {
  position: relative;
}

.categories-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 450px;
  z-index: 100;
  border: 1px solid #f1f5f9;
  animation: dropdown-appear 0.2s ease;
}

.categories-header {
  padding: 0.5rem 0 1rem 0;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 1rem;
}

.categories-header h3 {
  color: #08717f;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  text-decoration: none;
  color: #475569;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transform: translateX(-5px);
}

.category-icon {
  font-size: 1.2rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
}

.category-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
}

.category-count {
  font-size: 0.7rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 20px;
  min-width: 32px;
  text-align: center;
}

/* Categories Action Button */
.categories-action {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.categories-action:hover {
  background: linear-gradient(135deg, #065a69, #043b44);
}

.favorites-action:hover {
  background: linear-gradient(135deg, rgba(211, 0, 37, 0.1), rgba(255, 77, 109, 0.1));
}

.cart-action:hover {
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.1), rgba(42, 157, 143, 0.1));
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

.heart-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: rgba(211, 0, 37, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 0;
}

.cart-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #08717f;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse-blue 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
}

@keyframes pulse-blue {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(8, 113, 127, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(8, 113, 127, 0);
  }
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
  gap: 0.4rem;
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(8, 113, 127, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 40px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(8, 113, 127, 0.35);
}

.login-icon {
  font-size: 1rem;
}

.login-text {
  font-weight: 700;
  font-size: 0.9rem;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-avatar {
  width: 42px;
  height: 42px;
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

/* Dropdown */
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
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
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

.user-email {
  font-size: 0.75rem;
  color: #64748b;
}

.user-role {
  font-size: 0.7rem;
  color: #08717f;
  font-weight: 600;
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

.modern-item:hover {
  background: #f8fafc;
  color: #1e293b;
  transform: translateX(-4px);
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

.modern-item:hover .item-icon {
  background: linear-gradient(135deg, #08717f, #065a69);
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

.logout-item:hover {
  background: rgba(211, 0, 37, 0.1);
  color: #d30025;
}

.logout-item:hover .item-icon {
  background: #d30025;
  color: white;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
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

/* Navigation */
.main-nav {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.nav-link {
  color: #475569;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0;
  position: relative;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
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

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* Mobile Categories */
.mobile-categories {
  width: 100%;
}

.mobile-categories-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  color: #475569;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: color 0.3s ease;
}

.mobile-categories-header:hover {
  color: #08717f;
}

.chevron {
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.mobile-categories-list {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin: 0.5rem 0;
}

.mobile-category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  text-decoration: none;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.mobile-category-item:last-child {
  border-bottom: none;
}

.mobile-category-item:hover {
  background: white;
  transform: translateX(-5px);
  border-radius: 10px;
}

.mobile-category-item .category-icon {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}

.mobile-category-item .category-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.mobile-category-item .category-count {
  font-size: 0.75rem;
  color: #94a3b8;
  background: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

/* Mobile Navigation */
.mobile-nav-header {
  display: none;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .search-container {
    max-width: 350px;
  }

  .main-nav {
    gap: 1.2rem;
  }

  .categories-menu {
    min-width: 380px;
  }
}

@media (max-width: 768px) {
  .top-bar {
    display: none;
  }

  .header-content {
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0 10px;
  }

  .logo {
    height: 40px;
    min-width: 100px;
    margin-right: 5px;
  }

  .logo-image {
    max-height: 40px;
  }

  .search-container {
    order: 3;
    flex-basis: 100%;
    margin: 0;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .main-nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    max-width: 350px;
    height: 100vh;
    background: white;
    flex-direction: column;
    padding: 1.5rem;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
    margin: 0;
    border-top: none;
    transition: right 0.3s ease;
    z-index: 9999;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .main-nav.mobile-open {
    right: 0;
  }

  .mobile-nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .mobile-logo-image {
    height: 40px;
    width: auto;
  }

  .mobile-close-btn {
    width: 38px;
    height: 38px;
    background: #f8fafc;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #64748b;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-close-btn:hover {
    background: #d30025;
    color: white;
  }

  .main-nav .nav-link {
    padding: 0.8rem 0;
    width: 100%;
    border-bottom: 1px solid #f1f5f9;
    font-size: 1rem;
  }

  .header-actions {
    order: 2;
    gap: 10px;
  }

  .login-btn .login-text {
    display: none;
  }

  .login-btn {
    padding: 0 1rem;
    width: 42px;
    justify-content: center;
  }

  .login-icon {
    margin: 0;
  }

  .categories-dropdown {
    display: none;
  }
}

@media (max-width: 480px) {
  .modern-dropdown {
    min-width: 240px;
    left: -80px;
  }

  .header-action {
    width: 38px;
    height: 38px;
  }

  .user-avatar {
    width: 38px;
    height: 38px;
  }

  .login-btn {
    height: 38px;
    width: 38px;
  }

  .logo {
    height: 35px;
    min-width: 90px;
  }

  .logo-image {
    max-height: 35px;
  }

  .categories-menu {
    min-width: 300px;
    right: -80px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .mobile-categories {
    display: none;
  }
}
</style>
