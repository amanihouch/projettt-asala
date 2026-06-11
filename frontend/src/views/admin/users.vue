<!-- src/views/admin/Users.vue -->
<template>
  <div class="admin-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المستخدمين...</p>
      </div>

      <template v-else>
        <!-- Search and Filter Bar -->
        <div class="search-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="بحث عن مستخدم بالاسم أو البريد الإلكتروني..."
              class="search-input"
            />
          </div>

          <div class="filter-wrapper">
            <select v-model="roleFilter" class="filter-select">
              <option value="all">جميع الأدوار</option>
              <option value="admin">مدير</option>
              <option value="vendor">حرفي</option>
              <option value="customer">عميل</option>
            </select>

            <select v-model="statusFilter" class="filter-select">
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ users.length }}</div>
              <div class="stat-label">إجمالي المستخدمين</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👑</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('admin') }}</div>
              <div class="stat-label">المدراء</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏪</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('vendor') }}</div>
              <div class="stat-label">الحرفيون</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-info">
              <div class="stat-value">{{ getRoleCount('customer') }}</div>
              <div class="stat-label">العملاء</div>
            </div>
          </div>
        </div>

        <!-- Export Button -->
        <div class="export-bar">
          <button class="btn-export" @click="exportUsersToCSV">
            📥 تصدير المستخدمين (CSV)
          </button>
          <button class="btn-export-passwords" @click="exportPasswordsToCSV">
            🔐 تصدير كلمات المرور (CSV)
          </button>
        </div>

        <!-- Users Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>كلمة المرور</th>
                <th>الهاتف</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>تاريخ التسجيل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>
                  <div class="user-info">
                    <img
                      :src="user.avatar || `https://i.pravatar.cc/300?u=${user.id}`"
                      :alt="user.name"
                      class="user-avatar"
                      @error="handleImageError"
                    />
                    <span class="user-name">{{ user.name }}</span>
                  </div>
                </td>
                <td class="user-email">{{ user.email }}</td>
                <td class="user-password">
                  <div class="password-cell">
                    <span :class="{ 'password-hidden': !showPasswords[user.id] }">
                      {{ showPasswords[user.id] ? (user.password || user.plainPassword || '••••••••') : '••••••••' }}
                    </span>
                    <button
                      class="toggle-password-btn"
                      @click="togglePasswordVisibility(user.id)"
                      :title="showPasswords[user.id] ? 'إخفاء' : 'إظهار'"
                    >
                      {{ showPasswords[user.id] ? '👁️' : '👁️‍🗨️' }}
                    </button>
                    <button
                      class="copy-password-btn"
                      @click="copyPassword(user)"
                      :title="'نسخ كلمة المرور'"
                      v-if="user.password || user.plainPassword"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td class="user-phone">{{ user.phone || '—' }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user.isActive ? 'active' : 'inactive'">
                    {{ user.isActive ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="user-date">{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view" @click="viewUser(user)" title="عرض التفاصيل">
                      👁️
                    </button>
                    <button
                      class="action-btn toggle"
                      :class="user.isActive ? 'deactivate' : 'activate'"
                      @click="toggleUserStatus(user)"
                      :title="user.isActive ? 'تعطيل' : 'تفعيل'"
                    >
                      {{ user.isActive ? '🔒' : '🔓' }}
                    </button>
                    <button class="action-btn delete" @click="deleteUser(user)" title="حذف">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>لا يوجد مستخدمون</h3>
          <p>لم يتم العثور على مستخدمين مطابقين لمعايير البحث</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ← السابق
          </button>
          <span class="page-info">صفحة {{ currentPage }} من {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            التالي →
          </button>
        </div>
      </template>
    </div>

    <!-- User Details Modal -->
    <transition name="modal">
      <div v-if="showUserModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تفاصيل المستخدم</h3>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="user-detail-header">
              <img
                :src="selectedUser.avatar || `https://i.pravatar.cc/300?u=${selectedUser.id}`"
                :alt="selectedUser.name"
                class="detail-avatar"
              />
              <div class="detail-info">
                <h4>{{ selectedUser.name }}</h4>
                <span class="detail-role" :class="selectedUser.role">{{ getRoleLabel(selectedUser.role) }}</span>
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <label>البريد الإلكتروني</label>
                <p>{{ selectedUser.email }}</p>
              </div>
              <div class="detail-item">
                <label>كلمة المرور</label>
                <p class="password-detail">
                  <span :class="{ 'password-hidden': !detailShowPassword }">
                    {{ detailShowPassword ? (selectedUser.password || selectedUser.plainPassword || 'غير محدد') : '••••••••' }}
                  </span>
                  <button class="toggle-password-detail" @click="detailShowPassword = !detailShowPassword">
                    {{ detailShowPassword ? 'إخفاء' : 'إظهار' }}
                  </button>
                  <button class="copy-password-detail" @click="copyPassword(selectedUser)" v-if="selectedUser.password || selectedUser.plainPassword">
                    نسخ
                  </button>
                </p>
              </div>
              <div class="detail-item">
                <label>رقم الهاتف</label>
                <p>{{ selectedUser.phone || 'غير محدد' }}</p>
              </div>
              <div class="detail-item">
                <label>العنوان</label>
                <p>{{ selectedUser.address || 'غير محدد' }}</p>
              </div>
              <div class="detail-item">
                <label>تاريخ التسجيل</label>
                <p>{{ formatDate(selectedUser.createdAt) }}</p>
              </div>
              <div class="detail-item">
                <label>آخر تسجيل دخول</label>
                <p>{{ formatDate(selectedUser.lastLogin) || 'غير معروف' }}</p>
              </div>
              <div class="detail-item">
                <label>الحالة</label>
                <p>
                  <span class="status-badge" :class="selectedUser.isActive ? 'active' : 'inactive'">
                    {{ selectedUser.isActive ? 'نشط' : 'غير نشط' }}
                  </span>
                </p>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-cancel" @click="closeModal">إغلاق</button>
              <button class="btn-edit" @click="editUser(selectedUser)">تعديل</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit User Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تعديل المستخدم</h3>
            <button class="modal-close" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body" v-if="editingUser">
            <form @submit.prevent="saveUserChanges">
              <div class="form-group">
                <label>الاسم الكامل</label>
                <input type="text" v-model="editForm.name" required class="form-input" />
              </div>
              <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" v-model="editForm.email" required class="form-input" dir="ltr" />
              </div>
              <div class="form-group">
                <label>كلمة المرور <span class="optional-label">(اترك فارغاً للحفاظ على نفس كلمة المرور)</span></label>
                <input type="text" v-model="editForm.password" class="form-input" dir="ltr" placeholder="أدخل كلمة مرور جديدة لتغييرها" />
                <small class="password-hint">📌 كلمة المرور الحالية: {{ editingUser.password || editingUser.plainPassword || 'غير محددة' }}</small>
              </div>
              <div class="form-group">
                <label>رقم الهاتف</label>
                <input type="tel" v-model="editForm.phone" class="form-input" />
              </div>
              <div class="form-group">
                <label>العنوان</label>
                <textarea v-model="editForm.address" class="form-textarea" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>الدور</label>
                <select v-model="editForm.role" class="form-select">
                  <option value="customer">عميل</option>
                  <option value="vendor">حرفي</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div class="form-group">
                <label>الحالة</label>
                <select v-model="editForm.isActive" class="form-select">
                  <option :value="true">نشط</option>
                  <option :value="false">غير نشط</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="closeEditModal">إلغاء</button>
                <button type="submit" class="btn-save" :disabled="saving">
                  {{ saving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click="toast.show = false" class="toast-close">×</button>
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '/src/stores/auth'
import { useThemeStore } from '/src/stores/theme'
import api from '/src/services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// ===== DARK MODE =====
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const saving = ref(false)
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
const showUserModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref(null)
const editingUser = ref(null)
const showPasswords = ref({})
const detailShowPassword = ref(false)

const editForm = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: 'customer',
  isActive: true
})

const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ===== COMPUTED =====
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      u => u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(u => u.role === roleFilter.value)
  }

  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(u => u.isActive === isActive)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

// ===== METHODS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getRoleLabel = (role) => {
  const labels = { admin: 'مدير', vendor: 'حرفي', customer: 'عميل' }
  return labels[role] || role
}

const getRoleCount = (role) => {
  return users.value.filter(u => u.role === role).length
}

const handleImageError = (e) => {
  e.target.src = 'https://i.pravatar.cc/300?u=default'
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getUserPassword = (user) => {
  return user.password || user.plainPassword || 'غير محدد'
}

const togglePasswordVisibility = (userId) => {
  showPasswords.value[userId] = !showPasswords.value[userId]
}

const copyPassword = async (user) => {
  const password = getUserPassword(user)
  if (!password || password === 'غير محدد') {
    showNotification('لا توجد كلمة مرور مسجلة لهذا المستخدم', 'warning')
    return
  }

  try {
    await navigator.clipboard.writeText(password)
    showNotification(`📋 تم نسخ كلمة مرور ${user.name}`, 'success')
  } catch (err) {
    showNotification('فشل نسخ كلمة المرور', 'error')
  }
}

const exportUsersToCSV = () => {
  const headers = ['الاسم', 'البريد الإلكتروني', 'كلمة المرور', 'الهاتف', 'الدور', 'الحالة', 'تاريخ التسجيل']
  const rows = filteredUsers.value.map(u => [
    u.name,
    u.email,
    getUserPassword(u),
    u.phone || '',
    getRoleLabel(u.role),
    u.isActive ? 'نشط' : 'غير نشط',
    formatDate(u.createdAt)
  ])

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showNotification('📥 تم تصدير المستخدمين بنجاح', 'success')
}

const exportPasswordsToCSV = () => {
  const headers = ['الاسم', 'البريد الإلكتروني', 'كلمة المرور', 'الدور']
  const rows = filteredUsers.value.map(u => [
    u.name,
    u.email,
    getUserPassword(u),
    getRoleLabel(u.role)
  ])

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mots_de_passe_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showNotification('🔐 تم تصدير كلمات المرور بنجاح', 'success')
}

// ===== API CALLS =====
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/users')
    if (response.data.success) {
      users.value = response.data.data.data || response.data.data || []
      console.log('✅ Utilisateurs chargés:', users.value.length)

      // Initialize showPasswords object for all users
      users.value.forEach(user => {
        showPasswords.value[user.id] = false
      })
    } else {
      showNotification(response.data.message || 'Erreur chargement', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur chargement utilisateurs:', error)
    showNotification('Erreur de chargement des utilisateurs', 'error')
    users.value = []
  } finally {
    loading.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    const response = await api.patch(`/admin/users/${user.id}/toggle-status`)
    if (response.data.success) {
      user.isActive = response.data.data.isActive
      showNotification(`✅ المستخدم ${user.isActive ? 'تم تفعيله' : 'تم تعطيله'} بنجاح`, 'success')
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur changement statut:', error)
    showNotification(error.response?.data?.message || 'Erreur lors du changement de statut', 'error')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
    return
  }

  try {
    const response = await api.delete(`/admin/users/${user.id}`)
    if (response.data.success) {
      users.value = users.value.filter(u => u.id !== user.id)
      showNotification(`✅ تم حذف المستخدم ${user.name} بنجاح`, 'success')
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    const message = error.response?.data?.message || 'Erreur lors de la suppression'
    showNotification(message, 'error')
  }
}

const viewUser = (user) => {
  selectedUser.value = user
  detailShowPassword.value = false
  showUserModal.value = true
}

const closeModal = () => {
  showUserModal.value = false
  selectedUser.value = null
  detailShowPassword.value = false
}

const editUser = (user) => {
  editingUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    password: '',
    phone: user.phone || '',
    address: user.address || '',
    role: user.role,
    isActive: user.isActive
  }
  showEditModal.value = true
  closeModal()
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  editForm.value.password = ''
}

const saveUserChanges = async () => {
  saving.value = true
  try {
    const dataToSend = { ...editForm.value }
    if (!dataToSend.password) {
      delete dataToSend.password
    }

    const response = await api.put(`/admin/users/${editingUser.value.id}`, dataToSend)
    if (response.data.success) {
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...response.data.data.user }
      }
      showNotification('✅ تم تحديث المستخدم بنجاح', 'success')
      closeEditModal()
    } else {
      showNotification(response.data.message || 'Erreur', 'error')
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error)
    showNotification(error.response?.data?.message || 'Erreur lors de la mise à jour', 'error')
  } finally {
    saving.value = false
  }
}

// ===== WATCHERS =====
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark-mode')
    document.body.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })

// ===== LIFECYCLE =====
onMounted(() => {
  if (authStore.userRole !== 'admin') {
    showNotification('غير مصرح لك بالوصول إلى هذه الصفحة', 'error')
    setTimeout(() => {
      router.push('/')
    }, 2000)
    return
  }
  loadUsers()
})
</script>

<style scoped>
/* [All existing styles remain the same - keeping all original CSS] */
/* ... (keep all existing styles from original file) ... */

/* ===== ADDITIONAL STYLES FOR PASSWORD COLUMN ===== */
.user-password {
  min-width: 140px;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  font-size: 13px;
}

.password-hidden {
  letter-spacing: 2px;
}

.toggle-password-btn,
.copy-password-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.toggle-password-btn:hover,
.copy-password-btn:hover {
  opacity: 1;
  background: #f1f5f9;
  transform: scale(1.05);
}

.dark-mode .toggle-password-btn:hover,
.dark-mode .copy-password-btn:hover {
  background: #2a2a40;
}

.password-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toggle-password-detail,
.copy-password-detail {
  background: #f1f5f9;
  border: none;
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.dark-mode .toggle-password-detail,
.dark-mode .copy-password-detail {
  background: #2a2a40;
  color: #e5e7eb;
}

.toggle-password-detail:hover,
.copy-password-detail:hover {
  background: #08717f;
  color: white;
}

.optional-label {
  font-size: 11px;
  font-weight: normal;
  color: #64748b;
}

.dark-mode .optional-label {
  color: #94a3b8;
}

.password-hint {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.dark-mode .password-hint {
  color: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-password {
    min-width: 120px;
  }

  .password-cell {
    flex-wrap: wrap;
  }
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== BASE STYLES ===== */
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 2rem;
  font-family: 'Amiri', 'Cairo', serif;
  transition: all 0.3s ease;
}

/* ===== PAGE CONTENT ===== */
.page-content {
  background: white;
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-mode .page-content {
  background: #1f2937;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.dark-mode .stat-card {
  background: #374151;
  border-color: #4b5563;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.1);
  border-color: #08717f;
}

.stat-icon {
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Light mode stats */
.stat-value {
  color: #1e293b;
}

.stat-label {
  color: #64748b;
}

/* Dark mode stats */
.dark-mode .stat-value {
  color: #f3f4f6;
}

.dark-mode .stat-label {
  color: #9ca3af;
}

/* ===== SEARCH BAR ===== */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.9rem 3rem 0.9rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  color: #1e293b;
}

.dark-mode .search-input {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark-mode .search-input::placeholder {
  color: #6b7280;
}

.search-input:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.filter-wrapper {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.9rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  color: #1e293b;
}

.dark-mode .filter-select {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.filter-select:focus {
  outline: none;
  border-color: #08717f;
}

/* ===== TABLE ===== */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: right;
  padding: 1rem;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark-mode .data-table th {
  background: #374151;
  color: #e5e7eb;
  border-bottom-color: #4b5563;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-mode .data-table td {
  border-bottom-color: #374151;
  color: #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.dark-mode .user-avatar {
  border-color: #4b5563;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .user-name {
  color: #f3f4f6;
}

.user-email,
.user-phone,
.user-date {
  color: #475569;
  font-size: 0.9rem;
}

.dark-mode .user-email,
.dark-mode .user-phone,
.dark-mode .user-date {
  color: #9ca3af;
}

/* ===== BADGES ===== */
.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: linear-gradient(135deg, #d40025, #ff1744);
  color: white;
}

.role-badge.vendor {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.role-badge.customer {
  background: linear-gradient(135deg, #08717f, #0a94a6);
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.dark-mode .status-badge.active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.dark-mode .status-badge.inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .action-btn {
  background: #374151;
  color: #9ca3af;
}

.action-btn.view:hover {
  background: #08717f;
  color: white;
  transform: scale(1.05);
}

.action-btn.toggle.deactivate:hover {
  background: #f59e0b;
  color: white;
  transform: scale(1.05);
}

.action-btn.toggle.activate:hover {
  background: #10b981;
  color: white;
  transform: scale(1.05);
}

.action-btn.delete:hover {
  background: #d40025;
  color: white;
  transform: scale(1.05);
}

.dark-mode .action-btn:hover {
  color: white;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
}

.dark-mode .empty-state {
  background: #1f2937;
  border-color: #374151;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dark-mode .empty-state h3 {
  color: #f3f4f6;
}

.empty-state p {
  color: #64748b;
}

.dark-mode .empty-state p {
  color: #9ca3af;
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .pagination {
  border-top-color: #374151;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}

.dark-mode .page-btn {
  background: #374151;
  color: #e5e7eb;
}

.page-btn:hover:not(:disabled) {
  background: #08717f;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
}

.dark-mode .page-info {
  color: #9ca3af;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

.modal-container.dark-mode {
  background: #1f2937;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #374151;
}

.modal-header h3 {
  font-size: 1.3rem;
  margin: 0;
  color: #1e293b;
}

.dark-mode .modal-header h3 {
  color: #f3f4f6;
}

.modal-close {
  width: 35px;
  height: 35px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.dark-mode .modal-close {
  background: #374151;
  color: #9ca3af;
}

.modal-close:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.user-detail-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .user-detail-header {
  border-bottom-color: #374151;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #08717f;
}

.detail-info h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.dark-mode .detail-info h4 {
  color: #f3f4f6;
}

.detail-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item label {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: #64748b;
}

.dark-mode .detail-item label {
  color: #9ca3af;
}

.detail-item p {
  font-weight: 500;
  margin: 0;
  color: #1e293b;
}

.dark-mode .detail-item p {
  color: #e5e7eb;
}

/* ===== FORM ===== */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.dark-mode .form-group label {
  color: #e5e7eb;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;
  color: #1e293b;
}

.dark-mode .form-input,
.dark-mode .form-textarea,
.dark-mode .form-select {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #08717f;
  box-shadow: 0 0 0 3px rgba(8, 113, 127, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-save,
.btn-edit {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-cancel {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.dark-mode .btn-cancel {
  background: #374151;
  color: #9ca3af;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.dark-mode .btn-cancel:hover {
  background: #4b5563;
}

.btn-save,
.btn-edit {
  background: linear-gradient(135deg, #08717f, #0a94a6);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled),
.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== LOADING ===== */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #08717f;
  border-right: 4px solid #d40025;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.dark-mode .spinner {
  border-color: #374151;
  border-top-color: #3b82f6;
  border-right-color: #ef4444;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
}

.dark-mode .loading-state p {
  color: #9ca3af;
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
}

.toast-notification.dark-mode {
  background: #1f2937;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }

.dark-mode .toast-message {
  color: #f3f4f6;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  font-size: 0.9rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.toast-close:hover {
  color: #1e293b;
  transform: scale(1.1);
}

.dark-mode .toast-close:hover {
  color: #f3f4f6;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: progress 3s linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
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

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .page-content {
    padding: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .filter-wrapper {
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  .data-table {
    font-size: 0.8rem;
  }

  .action-btn {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/USERS.VUE ===== */
/* Ajoutez à la fin du <style scoped> */

.admin-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

/* Stats Cards */
.dark-mode .stat-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .stat-value {
  color: #f1f5f9 !important;
}

.dark-mode .stat-label {
  color: #94a3b8 !important;
}

/* Search & Filters */
.dark-mode .search-input,
.dark-mode .filter-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .search-input::placeholder {
  color: #64748b !important;
}

.dark-mode .search-icon {
  color: #64748b !important;
}

/* Table */
.dark-mode .data-table th {
  background: #121220 !important;
  color: #e5e7eb !important;
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .data-table td {
  border-bottom-color: #2a2a40 !important;
  color: #cbd5e1 !important;
}

/* User Info */
.dark-mode .user-avatar {
  border-color: #2a2a40 !important;
}

.dark-mode .user-name {
  color: #f1f5f9 !important;
}

.dark-mode .user-email,
.dark-mode .user-phone,
.dark-mode .user-date {
  color: #94a3b8 !important;
}

/* Status Badges */
.dark-mode .status-badge.active {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.dark-mode .status-badge.inactive {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
}

/* Action Buttons */
.dark-mode .action-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .action-btn:hover {
  color: white !important;
}

/* Empty State */
.dark-mode .empty-state {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .empty-state h3 {
  color: #f1f5f9 !important;
}

.dark-mode .empty-state p {
  color: #94a3b8 !important;
}

/* Pagination */
.dark-mode .pagination {
  border-top-color: #2a2a40 !important;
}

.dark-mode .page-btn {
  background: #2a2a40 !important;
  color: #cbd5e1 !important;
}

.dark-mode .page-btn:hover:not(:disabled) {
  background: #2dd4bf !important;
  color: #161627 !important;
}

.dark-mode .page-info {
  color: #94a3b8 !important;
}

/* Modal */
.dark-mode .modal-container {
  background: #1e1e30 !important;
}

.dark-mode .modal-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .modal-close {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .modal-body {
  background: #1e1e30 !important;
}

.dark-mode .user-detail-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .detail-info h4 {
  color: #f1f5f9 !important;
}

.dark-mode .detail-item label {
  color: #94a3b8 !important;
}

.dark-mode .detail-item p {
  color: #cbd5e1 !important;
}

/* Form */
.dark-mode .form-group label {
  color: #cbd5e1 !important;
}

.dark-mode .form-input,
.dark-mode .form-textarea,
.dark-mode .form-select {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .form-input:focus,
.dark-mode .form-textarea:focus,
.dark-mode .form-select:focus {
  border-color: #2dd4bf !important;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15) !important;
}

.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
}

/* Loading */
.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
  border-right-color: #ef4444 !important;
}

/* Toast */
.dark-mode .toast-notification {
  background: #1e1e30 !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
