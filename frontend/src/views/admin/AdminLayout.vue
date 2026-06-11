<!-- frontend/src/views/admin/AdminLayout.vue - AVEC PRODUITS SPONSORISÉS ET VENDORS PASSWORDS -->
<template>
  <div class="admin-dashboard" dir="rtl">
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo-area">
            <div class="logo-icon">𐎚</div>
            <div class="logo-text">
              <h2 class="sidebar-title">Asala</h2>
              <p class="sidebar-subtitle">لوحة التحكم</p>
            </div>
          </div>
          <button class="collapse-btn" @click="toggleSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <router-link to="/admin" class="nav-item" exact-active-class="active">
            <span class="nav-icon">📊</span>
            <span class="nav-text">الرئيسية</span>
          </router-link>

          <router-link to="/admin/users" class="nav-item" active-class="active">
            <span class="nav-icon">👥</span>
            <span class="nav-text">المستخدمين</span>
          </router-link>

          <router-link to="/admin/vendors" class="nav-item" active-class="active">
            <span class="nav-icon">🏪</span>
            <span class="nav-text">البائعين</span>
          </router-link>

          <!-- ✅ NOUVEAU LIEN VENDEURS MOTS DE PASSE -->
          <router-link to="/admin/vendors-passwords" class="nav-item" active-class="active">
            <span class="nav-icon">🔐</span>
            <span class="nav-text">كلمات مرور البائعين</span>
          </router-link>

          <router-link to="/admin/pending-vendors" class="nav-item" active-class="active">
            <span class="nav-icon">⏳</span>
            <span class="nav-text">طلبات البائعين</span>
            <span v-if="pendingVendorsCount > 0" class="badge-pending">{{ pendingVendorsCount }}</span>
          </router-link>

          <router-link to="/admin/products" class="nav-item" active-class="active">
            <span class="nav-icon">📦</span>
            <span class="nav-text">المنتجات</span>
          </router-link>

          <router-link to="/admin/sponsored-products" class="nav-item" active-class="active">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">المنتجات المروّجة</span>
          </router-link>

          <router-link to="/admin/offers" class="nav-item" active-class="active">
            <span class="nav-icon">🎁</span>
            <span class="nav-text">العروض الخاصة</span>
          </router-link>

          <router-link to="/admin/orders" class="nav-item" active-class="active">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">الطلبات</span>
          </router-link>

          <router-link to="/admin/categories" class="nav-item" active-class="active">
            <span class="nav-icon">📂</span>
            <span class="nav-text">التصنيفات</span>
          </router-link>

          <router-link to="/admin/pending-posts" class="nav-item" active-class="active">
            <span class="nav-icon">📝</span>
            <span class="nav-text">المنشورات للمراجعة</span>
          </router-link>

          <router-link to="/admin/pending-reels" class="nav-item" active-class="active">
            <span class="nav-icon">🎬</span>
            <span class="nav-text">Reels للمراجعة</span>
            <span v-if="pendingReelsCount > 0" class="badge-pending">{{ pendingReelsCount > 9 ? '9+' : pendingReelsCount }}</span>
          </router-link>

          <router-link to="/admin/statistics" class="nav-item" active-class="active">
            <span class="nav-icon">📈</span>
            <span class="nav-text">الإحصائيات</span>
          </router-link>

          <router-link to="/admin/contact-messages" class="nav-item" active-class="active">
            <span class="nav-icon">✉️</span>
            <span class="nav-text">رسائل الاتصال</span>
            <span v-if="unreadContactCount > 0" class="badge-pending">{{ unreadContactCount > 9 ? '9+' : unreadContactCount }}</span>
          </router-link>

          <div class="nav-divider"></div>

          <router-link to="/" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">العودة للموقع</span>
          </router-link>

          <button @click="logout" class="nav-item logout-btn">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">تسجيل الخروج</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="main-header">
          <button class="menu-toggle" @click="toggleSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <div class="header-title">
            <h1>{{ pageTitle }}</h1>
          </div>

          <div class="header-right">
            <div class="admin-profile" @click="goToProfile">
              <div class="admin-info">
                <span class="admin-name">{{ adminName }}</span>
                <span class="admin-role">مدير النظام</span>
              </div>
              <div class="admin-avatar-wrapper">
                <img :src="adminAvatar" alt="Admin" class="admin-avatar" />
                <div class="avatar-status"></div>
              </div>
            </div>
          </div>
        </header>

        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ===== STATE =====
const sidebarCollapsed = ref(false)
const pendingVendorsCount = ref(0)
const pendingReelsCount = ref(0)
const unreadContactCount = ref(0)
let refreshInterval = null

// ===== COMPUTED =====
const adminName = computed(() => authStore.user?.name || authStore.userName || 'مدير')
const adminAvatar = computed(() => {
  const avatar = authStore.user?.avatar || authStore.userAvatar
  if (avatar && avatar !== 'null' && avatar !== 'undefined') {
    return avatar
  }
  return 'https://i.pravatar.cc/300?img=8'
})

const pageTitle = computed(() => {
  const titles = {
    '/admin': 'لوحة التحكم',
    '/admin/users': 'إدارة المستخدمين',
    '/admin/vendors': 'إدارة البائعين',
    '/admin/vendors-passwords': 'كلمات مرور البائعين', // ✅ AJOUTÉ
    '/admin/pending-vendors': 'طلبات البائعين',
    '/admin/products': 'إدارة المنتجات',
    '/admin/sponsored-products': 'المنتجات المروّجة',
    '/admin/offers': 'العروض الخاصة',
    '/admin/orders': 'إدارة الطلبات',
    '/admin/categories': 'إدارة التصنيفات',
    '/admin/pending-posts': 'المنشورات للمراجعة',
    '/admin/pending-reels': 'Reels للمراجعة',
    '/admin/statistics': 'الإحصائيات',
    '/admin/contact-messages': 'رسائل الاتصال'
  }
  return titles[route.path] || 'لوحة التحكم'
})

// ===== FONCTIONS =====
const loadUnreadContactMessagesCount = () => {
  try {
    const saved = localStorage.getItem('contact_messages')
    if (saved) {
      const messages = JSON.parse(saved)
      const unreadCount = messages.filter(m => !m.isRead).length
      unreadContactCount.value = unreadCount
    } else {
      const demoMessages = [
        { isRead: false }, { isRead: false }, { isRead: true }, { isRead: false }, { isRead: true }
      ]
      unreadContactCount.value = demoMessages.filter(m => !m.isRead).length
    }
  } catch (error) {
    unreadContactCount.value = 0
  }
}

const handleContactMessagesUpdate = (event) => {
  if (event.detail && typeof event.detail.unreadCount === 'number') {
    unreadContactCount.value = event.detail.unreadCount
  } else {
    loadUnreadContactMessagesCount()
  }
}

const handleStorageChange = (e) => {
  if (e.key === 'contact_messages') {
    loadUnreadContactMessagesCount()
  }
}

const loadPendingVendorsCount = async () => {
  try {
    const response = await api.get('/vendors/admin/pending')
    if (response.data.success) {
      const data = response.data.data
      if (typeof data === 'number') {
        pendingVendorsCount.value = data
      } else if (data?.pagination?.total !== undefined) {
        pendingVendorsCount.value = data.pagination.total
      } else if (data?.length !== undefined) {
        pendingVendorsCount.value = data.length
      } else {
        pendingVendorsCount.value = 0
      }
    }
  } catch (error) {
    pendingVendorsCount.value = 0
  }
}

const loadPendingReelsCount = async () => {
  try {
    const response = await api.get('/reels/admin/pending/count')
    if (response.data.success) {
      pendingReelsCount.value = response.data.data?.count || response.data.count || 0
    }
  } catch (error) {
    pendingReelsCount.value = 0
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const goToProfile = () => {
  router.push('/profile')
}

const logout = () => {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    authStore.logout()
    router.push('/login')
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }

  loadPendingVendorsCount()
  loadPendingReelsCount()
  loadUnreadContactMessagesCount()

  window.addEventListener('contact-messages-updated', handleContactMessagesUpdate)
  window.addEventListener('storage', handleStorageChange)

  refreshInterval = setInterval(() => {
    loadPendingVendorsCount()
    loadPendingReelsCount()
    loadUnreadContactMessagesCount()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  window.removeEventListener('contact-messages-updated', handleContactMessagesUpdate)
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style>
/* [All styles remain the same as original] */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* [All scoped styles remain the same as original] */
.admin-dashboard {
  font-family: 'Amiri', 'Cairo', serif;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-dashboard * { font-family: 'Amiri', 'Cairo', serif; }

.admin-container { display: flex; min-height: 100vh; }

/* ... rest of the styles remain identical to your original ... */
</style>
<style scoped>
.admin-dashboard {
  font-family: 'Amiri', 'Cairo', serif;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-dashboard * { font-family: 'Amiri', 'Cairo', serif; }

.admin-container { display: flex; min-height: 100vh; }

.admin-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.admin-sidebar.collapsed .nav-text,
.admin-sidebar.collapsed .sidebar-subtitle,
.admin-sidebar.collapsed .logo-text {
  display: none;
}

.admin-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-header {
  padding: 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.sidebar-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.sidebar-subtitle {
  font-size: 0.75rem;
  opacity: 0.7;
  margin: 0;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 12px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: right;
  width: 100%;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.3), rgba(8, 113, 127, 0.1));
  color: white;
  border-right: 3px solid #08717f;
}

.nav-icon {
  width: 24px;
  flex-shrink: 0;
  font-size: 1.2rem;
  text-align: center;
}

.nav-text { flex: 1; }

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 12px;
}

.logout-btn {
  color: #f87171;
  margin-top: auto;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  color: #fecaca;
}

.badge-pending {
  background: #d40025;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 22px;
  text-align: center;
}

/* Main Content */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.main-header {
  background: white;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #1e293b;
  padding: 8px;
  border-radius: 8px;
}

.menu-toggle:hover { background: #f1f5f9; }

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 16px;
  background: #f8fafc;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-profile:hover { background: #f1f5f9; }

.admin-info { text-align: right; }

.admin-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
  display: block;
}

.admin-role {
  font-size: 0.75rem;
  color: #64748b;
}

.admin-avatar-wrapper { position: relative; }

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #08717f;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
}

.content-wrapper { padding: 32px; }

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    right: -260px;
    z-index: 1000;
    transition: right 0.3s ease;
  }

  .admin-sidebar:not(.collapsed) { right: 0; }

  .menu-toggle { display: block; }

  .header-title h1 { font-size: 1.2rem; }

  .content-wrapper { padding: 20px; }

  .admin-info { display: none; }

  .admin-profile {
    padding: 4px;
    background: transparent;
  }

  .admin-profile:hover { background: transparent; }
}

@media (max-width: 480px) {
  .main-header { padding: 12px 16px; }

  .header-title h1 { font-size: 1rem; }

  .content-wrapper { padding: 16px; }
}

/* Dark mode */
.main-header.dark-mode,
.admin-dashboard.dark-mode .main-header {
  background: #1e1e30 !important;
  border-bottom: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

.main-header.dark-mode .header-title h1,
.admin-dashboard.dark-mode .header-title h1 {
  color: #f1f5f9 !important;
}

.main-header.dark-mode .menu-toggle,
.admin-dashboard.dark-mode .menu-toggle {
  color: #f1f5f9 !important;
}

.main-header.dark-mode .menu-toggle:hover,
.admin-dashboard.dark-mode .menu-toggle:hover {
  background: #2a2a40 !important;
}

.main-header.dark-mode .admin-profile,
.admin-dashboard.dark-mode .admin-profile {
  background: #121220 !important;
}

.main-header.dark-mode .admin-profile:hover,
.admin-dashboard.dark-mode .admin-profile:hover {
  background: #1a1a2e !important;
}

.main-header.dark-mode .admin-name,
.admin-dashboard.dark-mode .admin-name {
  color: #f1f5f9 !important;
}

.main-header.dark-mode .admin-role,
.admin-dashboard.dark-mode .admin-role {
  color: #94a3b8 !important;
}

.main-header.dark-mode .avatar-status,
.admin-dashboard.dark-mode .avatar-status {
  border-color: #1e1e30 !important;
}

.admin-dashboard.dark-mode .content-wrapper {
  background: #161627 !important;
}

.admin-dashboard.dark-mode {
  background: #161627 !important;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column !important;
    position: relative !important;
  }

  .admin-sidebar {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 280px !important;
    max-width: 85vw !important;
    z-index: 1001 !important;
    transform: translateX(100%) !important;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: -4px 0 30px rgba(0, 0, 0, 0.3) !important;
    border-radius: 20px 0 0 20px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    height: 100vh !important;
    height: 100dvh !important;
  }

  .admin-sidebar:not(.collapsed) {
    transform: translateX(0) !important;
  }

  .sidebar-header {
    padding: 20px 16px !important;
    border-radius: 20px 0 0 0 !important;
    position: sticky !important;
    top: 0 !important;
    background: #0f172a !important;
    z-index: 10 !important;
  }

  .logo-icon {
    width: 36px !important;
    height: 36px !important;
    font-size: 1.3rem !important;
    border-radius: 10px !important;
  }

  .sidebar-title {
    font-size: 1.2rem !important;
  }

  .sidebar-subtitle {
    font-size: 0.7rem !important;
  }

  .collapse-btn {
    width: 36px !important;
    height: 36px !important;
    border-radius: 8px !important;
  }

  .sidebar-nav {
    padding: 16px 10px !important;
    gap: 2px !important;
  }

  .nav-item {
    padding: 12px 14px !important;
    gap: 12px !important;
    border-radius: 10px !important;
    font-size: 14px !important;
    min-height: 48px !important;
    cursor: pointer !important;
  }

  .nav-item:active {
    background: rgba(255, 255, 255, 0.1) !important;
  }

  .nav-item.active {
    border-right-width: 3px !important;
  }

  .nav-icon {
    width: 22px !important;
    font-size: 18px !important;
  }

  .nav-divider {
    margin: 12px 10px !important;
  }

  .badge-pending {
    font-size: 10px !important;
    padding: 2px 7px !important;
    border-radius: 12px !important;
    min-width: 20px !important;
  }

  .logout-btn {
    margin-top: auto !important;
    color: #f87171 !important;
  }

  .logout-btn:active {
    background: rgba(248, 113, 113, 0.2) !important;
  }

  .admin-sidebar:not(.collapsed) ~ .admin-main::before,
  .admin-container:has(.admin-sidebar:not(.collapsed))::after {
    content: '' !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
    z-index: 1000 !important;
  }

  .admin-main {
    width: 100% !important;
  }

  .main-header {
    padding: 12px 16px !important;
    min-height: 56px !important;
    gap: 12px !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    background: #ffffff !important;
  }

  .admin-dashboard.dark-mode .main-header {
    background: #1e1e30 !important;
    border-bottom-color: #2a2a40 !important;
  }

  .menu-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    border-radius: 10px !important;
    background: #f1f5f9 !important;
    border: 1px solid #e2e8f0 !important;
    cursor: pointer !important;
  }

  .admin-dashboard.dark-mode .menu-toggle {
    background: #2a2a40 !important;
    border-color: #2a2a40 !important;
    color: #94a3b8 !important;
  }

  .menu-toggle:active {
    background: #e2e8f0 !important;
    transform: scale(0.95) !important;
  }

  .menu-toggle svg {
    width: 22px !important;
    height: 22px !important;
  }

  .header-title {
    flex: 1 !important;
    min-width: 0 !important;
  }

  .header-title h1 {
    font-size: 16px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    color: #1e293b !important;
  }

  .admin-dashboard.dark-mode .header-title h1 {
    color: #f1f5f9 !important;
  }

  .header-right {
    gap: 8px !important;
  }

  .admin-profile {
    padding: 4px !important;
    background: transparent !important;
    border-radius: 50% !important;
    gap: 0 !important;
    cursor: pointer !important;
  }

  .admin-profile:hover {
    background: transparent !important;
  }

  .admin-info {
    display: none !important;
  }

  .admin-avatar-wrapper {
    width: 38px !important;
    height: 38px !important;
    flex-shrink: 0 !important;
  }

  .admin-avatar {
    width: 38px !important;
    height: 38px !important;
    border-width: 2px !important;
    border-radius: 50% !important;
  }

  .avatar-status {
    width: 8px !important;
    height: 8px !important;
    bottom: 1px !important;
    left: 1px !important;
    border-width: 1.5px !important;
  }

  .content-wrapper {
    padding: 16px !important;
    min-height: calc(100vh - 56px) !important;
  }
}

@media (max-width: 400px) {
  .admin-sidebar {
    width: 260px !important;
    max-width: 90vw !important;
  }

  .main-header {
    padding: 10px 12px !important;
  }

  .header-title h1 {
    font-size: 14px !important;
  }

  .content-wrapper {
    padding: 12px !important;
  }

  .nav-item {
    padding: 10px 12px !important;
    font-size: 13px !important;
    min-height: 44px !important;
  }

  .nav-icon {
    font-size: 16px !important;
  }
}

@media (max-width: 768px) and (orientation: landscape) {
  .admin-sidebar {
    width: 300px !important;
    max-width: 50vw !important;
  }

  .sidebar-nav {
    max-height: 60vh !important;
    overflow-y: auto !important;
  }
}

@supports (-webkit-touch-callout: none) {
  .admin-sidebar {
    height: -webkit-fill-available !important;
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }

  .sidebar-header {
    padding-top: calc(20px + env(safe-area-inset-top, 0px)) !important;
  }

  .content-wrapper {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

@media (max-width: 768px) {
  .admin-sidebar::-webkit-scrollbar {
    width: 3px !important;
  }

  .admin-sidebar::-webkit-scrollbar-track {
    background: transparent !important;
  }

  .admin-sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15) !important;
    border-radius: 3px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar {
    transition: none !important;
  }
}
</style>
