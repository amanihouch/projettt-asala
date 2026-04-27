<!-- frontend/src/views/admin/AdminLayout.vue - VERSION CORRIGÉE ET COMPLÈTE -->
<template>
  <div class="admin-dashboard" dir="rtl">
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo-area">
            <div class="logo-icon">𐎚</div>
            <div class="logo-text">
              <h2 class="sidebar-title">توراث</h2>
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
          <!-- Dashboard -->
          <router-link to="/admin" class="nav-item" exact-active-class="active">
            <span class="nav-icon">📊</span>
            <span class="nav-text">الرئيسية</span>
          </router-link>

          <!-- Utilisateurs -->
          <router-link to="/admin/users" class="nav-item" active-class="active">
            <span class="nav-icon">👥</span>
            <span class="nav-text">المستخدمين</span>
          </router-link>

          <!-- Vendeurs -->
          <router-link to="/admin/vendors" class="nav-item" active-class="active">
            <span class="nav-icon">🏪</span>
            <span class="nav-text">البائعين</span>
          </router-link>

          <!-- Vendeurs en attente -->
          <router-link to="/admin/pending-vendors" class="nav-item" active-class="active">
            <span class="nav-icon">⏳</span>
            <span class="nav-text">طلبات البائعين</span>
            <span v-if="pendingVendorsCount > 0" class="badge-pending">{{ pendingVendorsCount }}</span>
          </router-link>

          <!-- Produits -->
          <router-link to="/admin/products" class="nav-item" active-class="active">
            <span class="nav-icon">📦</span>
            <span class="nav-text">المنتجات</span>
          </router-link>

          <!-- Offres -->
          <router-link to="/admin/offers" class="nav-item" active-class="active">
            <span class="nav-icon">🎁</span>
            <span class="nav-text">العروض الخاصة</span>
          </router-link>

          <!-- Commandes -->
          <router-link to="/admin/orders" class="nav-item" active-class="active">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">الطلبات</span>
          </router-link>

          <!-- Catégories -->
          <router-link to="/admin/categories" class="nav-item" active-class="active">
            <span class="nav-icon">📂</span>
            <span class="nav-text">التصنيفات</span>
          </router-link>

          <!-- Posts en attente -->
          <router-link to="/admin/pending-posts" class="nav-item" active-class="active">
            <span class="nav-icon">📝</span>
            <span class="nav-text">المنشورات للمراجعة</span>
          </router-link>

          <!-- Reels en attente -->
          <router-link to="/admin/pending-reels" class="nav-item" active-class="active">
            <span class="nav-icon">🎬</span>
            <span class="nav-text">Reels للمراجعة</span>
            <span v-if="pendingReelsCount > 0" class="badge-pending">{{ pendingReelsCount > 9 ? '9+' : pendingReelsCount }}</span>
          </router-link>

          <!-- Statistiques -->
          <router-link to="/admin/statistics" class="nav-item" active-class="active">
            <span class="nav-icon">📈</span>
            <span class="nav-text">الإحصائيات</span>
          </router-link>

          <!-- Messages contact -->
          <router-link to="/admin/contact-messages" class="nav-item" active-class="active">
            <span class="nav-icon">✉️</span>
            <span class="nav-text">رسائل الاتصال</span>
            <span v-if="unreadContactCount > 0" class="badge-pending">{{ unreadContactCount > 9 ? '9+' : unreadContactCount }}</span>
          </router-link>

          <div class="nav-divider"></div>

          <!-- Retour au site -->
          <router-link to="/" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">العودة للموقع</span>
          </router-link>

          <!-- Déconnexion -->
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

<!-- frontend/src/views/admin/AdminLayout.vue - Version CORRIGÉE -->
<!-- frontend/src/views/admin/AdminLayout.vue - Version FINALE CORRIGÉE -->
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
    '/admin/pending-vendors': 'طلبات البائعين',
    '/admin/products': 'إدارة المنتجات',
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

// ===== FONCTION PRINCIPALE POUR CHARGER LE COMPTEUR =====
const loadUnreadContactMessagesCount = () => {
  try {
    // Charger depuis localStorage (même clé que ContactMessages.vue)
    const saved = localStorage.getItem('contact_messages')
    if (saved) {
      const messages = JSON.parse(saved)
      const unreadCount = messages.filter(m => !m.isRead).length
      unreadContactCount.value = unreadCount
      console.log('📧 Messages non lus (localStorage):', unreadCount)
    } else {
      // Données de démo par défaut
      const demoMessages = [
        { isRead: false }, { isRead: false }, { isRead: true }, { isRead: false }, { isRead: true }
      ]
      const unreadCount = demoMessages.filter(m => !m.isRead).length
      unreadContactCount.value = unreadCount
      console.log('📧 Messages non lus (démo):', unreadCount)
    }
  } catch (error) {
    console.error('❌ Erreur chargement messages:', error)
    unreadContactCount.value = 0
  }
}

// ✅ Handler pour les mises à jour en temps réel
const handleContactMessagesUpdate = (event) => {
  console.log('🔄 Événement contact-messages-updated reçu:', event.detail)

  if (event.detail && typeof event.detail.unreadCount === 'number') {
    unreadContactCount.value = event.detail.unreadCount
    console.log('📧 Compteur mis à jour par événement:', unreadContactCount.value)
  } else {
    // Recharger depuis localStorage
    loadUnreadContactMessagesCount()
  }
}

// ✅ Écouter les changements de localStorage (pour les onglets)
const handleStorageChange = (e) => {
  if (e.key === 'contact_messages') {
    console.log('🔄 Changement localStorage détecté, rechargement...')
    loadUnreadContactMessagesCount()
  }
}

// Charger les autres compteurs
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
    console.error('❌ Erreur chargement vendeurs en attente:', error)
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
    console.log('ℹ️ Route reels admin/pending/count non disponible')
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

  // Charger tous les compteurs
  loadPendingVendorsCount()
  loadPendingReelsCount()
  loadUnreadContactMessagesCount()

  // Ajouter les écouteurs
  window.addEventListener('contact-messages-updated', handleContactMessagesUpdate)
  window.addEventListener('storage', handleStorageChange)

  // Rafraîchissement périodique
  refreshInterval = setInterval(() => {
    loadPendingVendorsCount()
    loadPendingReelsCount()
    loadUnreadContactMessagesCount()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  window.removeEventListener('contact-messages-updated', handleContactMessagesUpdate)
  window.removeEventListener('storage', handleStorageChange)
})
</script>
<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.admin-dashboard {
  font-family: 'Amiri', 'Cairo', serif;
}

.admin-dashboard * {
  font-family: 'Amiri', 'Cairo', serif;
}

.admin-dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.admin-container {
  display: flex;
  min-height: 100vh;
}

/* ===== SIDEBAR ===== */
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

.nav-text {
  flex: 1;
}

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

/* ===== MAIN CONTENT ===== */
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

.menu-toggle:hover {
  background: #f1f5f9;
}

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

.admin-profile:hover {
  background: #f1f5f9;
}

.admin-info {
  text-align: right;
}

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

.admin-avatar-wrapper {
  position: relative;
}

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

.content-wrapper {
  padding: 32px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    right: -260px;
    z-index: 1000;
    transition: right 0.3s ease;
  }

  .admin-sidebar:not(.collapsed) {
    right: 0;
  }

  .menu-toggle {
    display: block;
  }

  .header-title h1 {
    font-size: 1.2rem;
  }

  .content-wrapper {
    padding: 20px;
  }

  .admin-info {
    display: none;
  }

  .admin-profile {
    padding: 4px;
    background: transparent;
  }

  .admin-profile:hover {
    background: transparent;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 12px 16px;
  }

  .header-title h1 {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 16px;
  }
}
</style>
