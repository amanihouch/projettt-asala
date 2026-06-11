<!-- frontend/src/views/admin/VendorPasswords.vue -->
<template>
  <div class="admin-passwords-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <span class="title-icon">🔐</span>
            Gestion des mots de passe des vendeurs
          </h1>
          <p class="page-subtitle">Consultez et réinitialisez les mots de passe en cas d'urgence</p>
        </div>
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>Ces informations sont confidentielles - Accès réservé aux administrateurs</span>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- Search and Actions Bar -->
      <div class="actions-bar">
        <div class="search-wrapper">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher par nom, email ou magasin..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">✕</button>
          </div>
        </div>

        <div class="action-buttons-group">
          <button class="action-btn export-btn" @click="exportToCSV" :disabled="vendors.length === 0">
            <span class="btn-icon">📥</span>
            <span class="btn-text">Exporter CSV</span>
          </button>
          <button class="action-btn refresh-btn" @click="loadVendors" :disabled="loading">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">{{ loading ? 'Chargement...' : 'Actualiser' }}</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ vendors.length }}</div>
            <div class="stat-label">Total vendeurs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon approved">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ vendors.filter(v => v.approved === 1).length }}</div>
            <div class="stat-label">Approuvés</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-info">
            <div class="stat-value">{{ vendors.filter(v => v.approved === 0).length }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon passwords">🔐</div>
          <div class="stat-info">
            <div class="stat-value">{{ vendors.filter(v => v.password).length }}</div>
            <div class="stat-label">Mots de passe</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring-secondary"></div>
        </div>
        <p>Chargement des vendeurs...</p>
      </div>

      <!-- Table -->
      <div v-else-if="filteredVendors.length > 0" class="table-container">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-index">#</th>
                <th class="col-shop">Magasin</th>
                <th class="col-name">Nom du vendeur</th>
                <th class="col-email">Email</th>
                <th class="col-phone">Téléphone</th>
                <th class="col-password">Mot de passe</th>
                <th class="col-status">Statut</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vendor, index) in paginatedVendors" :key="vendor.id">
                <td class="col-index" data-label="#">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="col-shop" data-label="Magasin">
                  <div class="shop-info">
                    <img
                      :src="vendor.userAvatar || `https://i.pravatar.cc/40?u=${vendor.id}`"
                      class="shop-avatar"
                      @error="handleImageError"
                    />
                    <strong class="shop-name">{{ vendor.shopName || vendor.shop_name || '—' }}</strong>
                  </div>
                </td>
                <td class="col-name" data-label="Nom">{{ vendor.name || vendor.userName || '—' }}</td>
                <td class="col-email" data-label="Email">{{ vendor.email }}</td>
                <td class="col-phone" data-label="Téléphone">{{ vendor.phone || '—' }}</td>
                <td class="col-password" data-label="Mot de passe">
                  <div class="password-cell">
                    <div class="password-wrapper">
                      <code :class="{ 'password-hidden': !showPassword[vendor.id] }" class="password-value">
                        {{ showPassword[vendor.id] ? (vendor.password || 'Non défini') : '••••••••' }}
                      </code>
                      <button
                        class="icon-btn toggle-btn"
                        @click="togglePassword(vendor.id)"
                        :title="showPassword[vendor.id] ? 'Masquer' : 'Afficher'"
                      >
                        {{ showPassword[vendor.id] ? '🙈' : '👁️' }}
                      </button>
                      <button
                        v-if="vendor.password"
                        class="icon-btn copy-btn"
                        @click="copyPassword(vendor.password, vendor.shopName || vendor.shop_name)"
                        title="Copier"
                      >
                        📋
                      </button>
                    </div>
                    <span v-if="!vendor.password" class="no-password-badge">
                      <span class="badge-icon">⚠️</span> Non enregistré
                    </span>
                  </div>
                </td>
                <td class="col-status" data-label="Statut">
                  <span class="status-badge" :class="{
                    'status-approved': vendor.approved === 1,
                    'status-pending': vendor.approved === 0,
                    'status-rejected': vendor.approved === 2
                  }">
                    <span class="status-icon">
                      {{ vendor.approved === 1 ? '✅' : vendor.approved === 0 ? '⏳' : '❌' }}
                    </span>
                    {{ vendor.approved === 1 ? 'Approuvé' : vendor.approved === 0 ? 'En attente' : 'Rejeté' }}
                  </span>
                </td>
                <td class="col-actions" data-label="Actions">
                  <div class="action-buttons">
                    <button class="action-icon reset" @click="resetPassword(vendor)" title="Réinitialiser">
                      🔑
                    </button>
                    <button class="action-icon view" @click="goToVendor(vendor.id)" title="Voir profil">
                      👤
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-nav" :disabled="currentPage === 1" @click="currentPage--">
            <span>←</span> Précédent
          </button>
          <div class="page-numbers">
            <button
              v-for="page in displayedPages"
              :key="page"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          <button class="page-nav" :disabled="currentPage === totalPages" @click="currentPage++">
            Suivant <span>→</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔐</div>
        <h3>Aucun vendeur trouvé</h3>
        <p>Aucun vendeur ne correspond à votre recherche</p>
        <button class="reload-btn" @click="loadVendors">
          <span>🔄</span> Recharger
        </button>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="resetModal.show" class="modal-overlay" @click.self="closeResetModal">
          <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
            <div class="modal-header">
              <div class="modal-header-content">
                <span class="modal-icon">🔑</span>
                <h3>Réinitialisation du mot de passe</h3>
              </div>
              <button class="modal-close" @click="closeResetModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="vendor-detail-card">
                <img :src="resetModal.vendor?.userAvatar || `https://i.pravatar.cc/60?u=${resetModal.vendor?.id}`" class="vendor-avatar" />
                <div class="vendor-detail">
                  <h4>{{ resetModal.vendor?.shopName || resetModal.vendor?.shop_name }}</h4>
                  <p class="vendor-email">{{ resetModal.vendor?.email }}</p>
                </div>
              </div>

              <div class="form-field">
                <label>Nouveau mot de passe</label>
                <div class="password-input-group">
                  <input
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="resetModal.newPassword"
                    class="form-input"
                    placeholder="Laisser vide pour générer automatiquement"
                  />
                  <button class="password-toggle" @click="showNewPassword = !showNewPassword">
                    {{ showNewPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <p class="field-hint">💡 Un mot de passe sécurisé sera généré automatiquement si vous laissez le champ vide</p>
              </div>

              <div class="modal-actions">
                <button class="btn-secondary" @click="closeResetModal">Annuler</button>
                <button class="btn-primary" @click="confirmResetPassword" :disabled="resetModal.loading">
                  <span v-if="resetModal.loading" class="loading-spinner-small"></span>
                  <span v-else>✅ Confirmer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button @click="toast.show = false" class="toast-close">×</button>
          <div class="toast-progress"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const loading = ref(true)
const searchQuery = ref('')
const vendors = ref([])
const showPassword = ref({})
const currentPage = ref(1)
const itemsPerPage = ref(15)
const showNewPassword = ref(false)

const resetModal = ref({
  show: false,
  vendor: null,
  newPassword: '',
  loading: false
})

const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// Computed
const filteredVendors = computed(() => {
  let filtered = [...vendors.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(v =>
      (v.shopName || v.shop_name)?.toLowerCase().includes(q) ||
      (v.name || v.userName)?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q)
    )
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredVendors.value.length / itemsPerPage.value))

const paginatedVendors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredVendors.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const handleImageError = (e) => {
  e.target.src = 'https://i.pravatar.cc/40?u=default'
}

const togglePassword = (vendorId) => {
  showPassword.value[vendorId] = !showPassword.value[vendorId]
}

const copyPassword = async (password, shopName) => {
  try {
    await navigator.clipboard.writeText(password)
    showNotification(`📋 Mot de passe de "${shopName}" copié !`, 'success')
  } catch (err) {
    showNotification('Erreur lors de la copie', 'error')
  }
}

const goToVendor = (vendorId) => {
  window.open(`/vendor/${vendorId}`, '_blank')
}

const openResetModal = (vendor) => {
  resetModal.value = {
    show: true,
    vendor: vendor,
    newPassword: '',
    loading: false
  }
  showNewPassword.value = false
}

const closeResetModal = () => {
  resetModal.value.show = false
  resetModal.value.vendor = null
  resetModal.value.newPassword = ''
  showNewPassword.value = false
}

const resetPassword = (vendor) => {
  openResetModal(vendor)
}

const confirmResetPassword = async () => {
  if (!resetModal.value.vendor) return
  resetModal.value.loading = true

  try {
    const payload = {}
    if (resetModal.value.newPassword && resetModal.value.newPassword.trim()) {
      payload.newPassword = resetModal.value.newPassword.trim()
    }

    const response = await api.post(`/admin/vendors/${resetModal.value.vendor.id}/reset-password`, payload)

    if (response.data.success) {
      const newPassword = response.data.data.newPassword
      const index = vendors.value.findIndex(v => v.id === resetModal.value.vendor.id)
      if (index !== -1) {
        vendors.value[index].password = newPassword
      }
      showPassword.value[resetModal.value.vendor.id] = true
      showNotification(`✅ Nouveau mot de passe: ${newPassword}`, 'success')
      await navigator.clipboard.writeText(newPassword)
      showNotification(`📋 Mot de passe copié dans le presse-papier`, 'info')
      closeResetModal()
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('Erreur reset:', error)
    showNotification(error.response?.data?.message || 'Erreur lors de la réinitialisation', 'error')
  } finally {
    resetModal.value.loading = false
  }
}

const exportToCSV = () => {
  const headers = ['Magasin', 'Nom du vendeur', 'Email', 'Téléphone', 'Mot de passe', 'Statut']
  const rows = filteredVendors.value.map(v => [
    v.shopName || v.shop_name || '',
    v.name || v.userName || '',
    v.email,
    v.phone || '',
    v.password || 'Non défini',
    v.approved === 1 ? 'Approuvé' : v.approved === 0 ? 'En attente' : 'Rejeté'
  ])

  const csv = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vendeurs_mots_de_passe_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showNotification('📥 Export CSV réussi', 'success')
}

const loadVendors = async () => {
  loading.value = true
  try {
    let vendorsData = []

    try {
      const response = await api.get('/admin/vendors')
      if (response.data.success && response.data.data) {
        vendorsData = response.data.data.data || response.data.data || []
        console.log('✅ Vendeurs chargés:', vendorsData.length)
      }
    } catch (e) {
      console.warn('Endpoint /admin/vendors failed:', e.message)
    }

    vendors.value = vendorsData
    vendors.value.forEach(vendor => {
      showPassword.value[vendor.id] = false
    })

    if (vendors.value.length === 0) {
      showNotification('Aucun vendeur trouvé', 'warning')
    }
  } catch (error) {
    console.error('Erreur chargement vendeurs:', error)
    showNotification('Erreur lors du chargement des vendeurs', 'error')
    vendors.value = []
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  if (authStore.userRole !== 'admin') {
    router.push('/')
    return
  }
  loadVendors()
})
</script>

<style scoped>
/* ===== BASE ===== */
.admin-passwords-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 24px;
  font-family: 'Cairo', 'Amiri', sans-serif;
}

.admin-passwords-page.dark-mode {
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
}

/* ===== HEADER ===== */
.page-header {
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .page-title {
  color: #f1f5f9;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.dark-mode .page-subtitle {
  color: #94a3b8;
}

.warning-banner {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  border-right: 4px solid #f59e0b;
  padding: 12px 20px;
  border-radius: 12px;
  color: #92400e;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
}

.dark-mode .warning-banner {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

/* ===== PAGE CONTENT ===== */
.page-content {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark-mode .page-content {
  background: #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* ===== ACTIONS BAR ===== */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  right: 14px;
  font-size: 1rem;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 36px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
  color: #1e293b;
}

.dark-mode .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.search-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.clear-search {
  position: absolute;
  left: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1rem;
  padding: 4px;
}

.action-buttons-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.export-btn {
  background: #10b981;
  color: white;
}

.export-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.refresh-btn {
  background: #08717f;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #065a69;
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s;
}

.dark-mode .stat-card {
  background: #0f172a;
  border-color: #334155;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px -10px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-icon.total { background: linear-gradient(135deg, #08717f, #0a94a6); }
.stat-icon.approved { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.passwords { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  color: #1e293b;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* ===== LOADING ===== */
.loading-state {
  text-align: center;
  padding: 60px;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
}

.spinner-ring,
.spinner-ring-secondary {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring {
  border: 3px solid #e2e8f0;
  border-top-color: #08717f;
}

.spinner-ring-secondary {
  border: 3px solid transparent;
  border-right-color: #d40025;
  animation-duration: 1.5s;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #94a3b8;
}

/* ===== TABLE ===== */
.table-container {
  overflow-x: auto;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th {
  text-align: right;
  padding: 14px 16px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #0f172a;
  color: #94a3b8;
  border-bottom-color: #334155;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  font-size: 0.85rem;
}

.dark-mode .data-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.data-table tr:hover {
  background: #f8fafc;
}

.dark-mode .data-table tr:hover {
  background: #0f172a;
}

/* Shop Info */
.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.dark-mode .shop-avatar {
  border-color: #334155;
}

.shop-name {
  font-weight: 600;
}

/* Password Cell */
.password-cell {
  min-width: 180px;
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.password-value {
  font-family: monospace;
  font-size: 0.85rem;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 8px;
}

.dark-mode .password-value {
  background: #0f172a;
}

.password-hidden {
  letter-spacing: 2px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .icon-btn {
  background: #334155;
}

.icon-btn:hover {
  background: #08717f;
  transform: scale(1.05);
}

.no-password-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 20px;
  font-size: 0.75rem;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-approved {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.dark-mode .status-pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.reset {
  background: #f59e0b;
  color: white;
}

.action-icon.reset:hover {
  background: #d97706;
  transform: scale(1.05);
}

.action-icon.view {
  background: #08717f;
  color: white;
}

.action-icon.view:hover {
  background: #065a69;
  transform: scale(1.05);
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.dark-mode .pagination {
  border-top-color: #334155;
}

.page-nav {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.dark-mode .page-nav {
  background: #334155;
  color: #cbd5e1;
}

.page-nav:hover:not(:disabled) {
  background: #08717f;
  color: white;
}

.page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-number {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.dark-mode .page-number {
  background: #334155;
  color: #cbd5e1;
}

.page-number:hover {
  background: #08717f;
  color: white;
}

.page-number.active {
  background: #08717f;
  color: white;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.dark-mode .empty-state p {
  color: #94a3b8;
}

.reload-btn {
  padding: 10px 24px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reload-btn:hover {
  background: #065a69;
  transform: translateY(-2px);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 450px;
  animation: modalSlideIn 0.3s ease;
  overflow: hidden;
}

.dark-mode .modal-container {
  background: #1e293b;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #08717f, #065a69);
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-weight: 700;
}

.modal-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  color: white;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #ef4444;
  transform: scale(1.05);
}

.modal-body {
  padding: 24px;
}

.vendor-detail-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .vendor-detail-card {
  border-bottom-color: #334155;
}

.vendor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #08717f;
}

.vendor-detail h4 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: #1e293b;
}

.dark-mode .vendor-detail h4 {
  color: #f1f5f9;
}

.vendor-email {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .form-field label {
  color: #cbd5e1;
}

.password-input-group {
  display: flex;
  gap: 10px;
}

.form-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
}

.dark-mode .form-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.password-toggle {
  padding: 0 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
}

.field-hint {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary, .btn-primary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #08717f, #0a94a6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.dark-mode .toast-notification {
  background: #1e293b;
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

.toast-icon { font-size: 1.2rem; }
.toast-message { font-size: 0.9rem; font-weight: 500; }

.dark-mode .toast-message {
  color: #f1f5f9;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
  padding: 0 5px;
}

.toast-close:hover {
  color: #1e293b;
}

.dark-mode .toast-close:hover {
  color: #f1f5f9;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: progress 3s linear forwards;
  border-radius: 0 0 0 50px;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-passwords-page {
    padding: 16px;
  }

  .page-content {
    padding: 16px;
  }

  .actions-bar {
    flex-direction: column;
  }

  .search-wrapper {
    max-width: 100%;
    width: 100%;
  }

  .action-buttons-group {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.4rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  /* Mobile table */
  .data-table thead {
    display: none;
  }

  .data-table tbody tr {
    display: block;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    margin-bottom: 12px;
    background: white;
  }

  .dark-mode .data-table tbody tr {
    border-color: #334155;
    background: #1e293b;
  }

  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.8rem;
  }

  .dark-mode .data-table td {
    border-bottom-color: #334155;
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    margin-left: 10px;
  }

  .shop-info {
    flex-direction: column;
    text-align: center;
  }

  .password-wrapper {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .toast-notification {
    right: 16px;
    left: 16px;
    bottom: 16px;
    width: auto;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
  }

  .warning-banner {
    font-size: 0.75rem;
    padding: 10px 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
    border-radius: 20px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }
}
</style>
