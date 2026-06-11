<!-- frontend/src/views/admin/ContactMessages.vue - VERSION CORRIGÉE DARK MODE -->
<template>
  <div class="contact-messages-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-content">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card unread">
          <span class="stat-icon">📧</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.unread || 0 }}</span>
            <span class="stat-label">رسائل غير مقروءة</span>
          </div>
        </div>
        <div class="stat-card total">
          <span class="stat-icon">💬</span>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total || 0 }}</span>
            <span class="stat-label">إجمالي الرسائل</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input type="text" v-model="searchQuery" placeholder="🔍 بحث عن رسالة..." class="search-input" />
        <select v-model="statusFilter" class="status-filter">
          <option value="all">جميع الرسائل</option>
          <option value="unread">غير مقروءة</option>
          <option value="read">مقروءة</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل الرسائل...</p>
      </div>

      <!-- Messages List -->
      <div v-else-if="filteredMessages.length > 0" class="messages-list">
        <div v-for="message in filteredMessages" :key="message.id" class="message-card" :class="{ 'unread': !message.isRead }" @click="viewMessage(message)">
          <div class="message-header">
            <div class="sender-info">
              <div class="sender-avatar">{{ getInitials(message.name) }}</div>
              <div class="sender-details">
                <h3 class="sender-name">{{ message.name }}</h3>
                <p class="sender-email">{{ message.email }}</p>
              </div>
            </div>
            <div class="message-meta">
              <span class="message-date">{{ formatDate(message.createdAt) }}</span>
              <span v-if="!message.isRead" class="unread-badge">جديد</span>
            </div>
          </div>
          <div class="message-subject"><strong>الموضوع:</strong> {{ message.subject }}</div>
          <div class="message-preview">{{ truncateText(message.message, 150) }}</div>
          <div class="message-actions">
            <button class="action-btn view-btn" @click.stop="viewMessage(message)"><span class="btn-icon">👁️</span>عرض التفاصيل</button>
            <button v-if="!message.isRead" class="action-btn mark-read-btn" @click.stop="markAsRead(message)"><span class="btn-icon">✓</span>تعيين كمقروء</button>
            <button class="action-btn delete-btn" @click.stop="deleteMessage(message)"><span class="btn-icon">🗑️</span>حذف</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>لا توجد رسائل</h3>
        <p>لم يتم استلام أي رسائل بعد</p>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <transition name="modal">
      <div v-if="showMessageModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content message-modal" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>تفاصيل الرسالة</h3>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body" v-if="selectedMessage">
            <div class="detail-section"><label>الاسم:</label><p>{{ selectedMessage.name }}</p></div>
            <div class="detail-section"><label>البريد الإلكتروني:</label><p>{{ selectedMessage.email }}</p></div>
            <div class="detail-section"><label>الموضوع:</label><p>{{ selectedMessage.subject }}</p></div>
            <div class="detail-section"><label>تاريخ الإرسال:</label><p>{{ formatDate(selectedMessage.createdAt) }}</p></div>
            <div class="detail-section"><label>الرسالة:</label><div class="message-content">{{ selectedMessage.message }}</div></div>
          </div>
          <div class="modal-footer">
            <button class="btn-reply" @click="replyToMessage" v-if="selectedMessage"><span class="btn-icon">✉️</span>رد على الرسالة</button>
            <button class="btn-close" @click="closeModal">إغلاق</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reply Modal -->
    <transition name="modal">
      <div v-if="showReplyModal" class="modal-overlay" @click.self="closeReplyModal">
        <div class="modal-content reply-modal" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>رد على الرسالة</h3>
            <button class="close-btn" @click="closeReplyModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-section"><label>إلى:</label><p>{{ replyToEmail }}</p></div>
            <div class="detail-section"><label>الموضوع:</label><input type="text" v-model="replySubject" class="reply-input" /></div>
            <div class="detail-section"><label>الرسالة:</label><textarea v-model="replyMessage" rows="6" class="reply-textarea"></textarea></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeReplyModal">إلغاء</button>
            <button class="btn-send" @click="sendReply" :disabled="sendingReply">{{ sendingReply ? 'جاري الإرسال...' : 'إرسال الرد' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '../../stores/theme'

// ✅ CORRECTION : Utiliser le ThemeStore global
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== DONNÉES DE DÉMONSTRATION =====
const DEMO_MESSAGES = [
  { id: 1, name: 'أحمد بن علي', email: 'ahmed@example.com', subject: 'استفسار عن منتج', message: 'السلام عليكم، أود الاستفسار عن منتج معين في متجركم...', isRead: false, createdAt: new Date('2024-03-20T10:30:00').toISOString() },
  { id: 2, name: 'فاطمة الزهراء', email: 'fatma@example.com', subject: 'طلب شراء بالجملة', message: 'مرحباً، نحن شركة مهتمة بشراء منتجاتكم بالجملة...', isRead: false, createdAt: new Date('2024-03-19T15:45:00').toISOString() },
  { id: 3, name: 'محمد رضا', email: 'mohamed@example.com', subject: 'شكوى حول طلب', message: 'لدي شكوى بخصوص الطلب رقم #12345...', isRead: true, createdAt: new Date('2024-03-18T09:15:00').toISOString() },
  { id: 4, name: 'سارة بن سالم', email: 'sara@example.com', subject: 'اقتراح تعاون', message: 'نحن منصة تسويقية ونود التعاون معكم...', isRead: false, createdAt: new Date('2024-03-17T14:20:00').toISOString() },
  { id: 5, name: 'كريم المحمودي', email: 'karim@example.com', subject: 'سؤال عن سياسة الإرجاع', message: 'السلام عليكم، أود الاستفسار عن سياسة الإرجاع...', isRead: true, createdAt: new Date('2024-03-16T11:00:00').toISOString() }
]

// ===== STATE =====
const loading = ref(false)
const messages = ref([])
const stats = ref({ unread: 0, total: 0 })
const searchQuery = ref('')
const statusFilter = ref('all')
const showMessageModal = ref(false)
const showReplyModal = ref(false)
const selectedMessage = ref(null)
const replyToEmail = ref('')
const replySubject = ref('')
const replyMessage = ref('')
const sendingReply = ref(false)
const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ===== COMPUTED =====
const filteredMessages = computed(() => {
  let filtered = [...messages.value]
  if (statusFilter.value === 'unread') filtered = filtered.filter(m => !m.isRead)
  else if (statusFilter.value === 'read') filtered = filtered.filter(m => m.isRead)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => m.name?.toLowerCase().includes(query) || m.email?.toLowerCase().includes(query) || m.subject?.toLowerCase().includes(query) || m.message?.toLowerCase().includes(query))
  }
  return filtered
})

// ===== UTILS =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?'
const truncateText = (text, length) => text && text.length > length ? text.substring(0, length) + '...' : text || ''

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ===== ACTIONS =====
const loadMessages = () => {
  const saved = localStorage.getItem('contact_messages')
  if (saved) {
    try { messages.value = JSON.parse(saved) } catch { messages.value = [...DEMO_MESSAGES] }
  } else {
    messages.value = [...DEMO_MESSAGES]
    localStorage.setItem('contact_messages', JSON.stringify(DEMO_MESSAGES))
  }
  updateStats()
}

const updateStats = () => {
  stats.value = { unread: messages.value.filter(m => !m.isRead).length, total: messages.value.length }
}

const saveMessages = () => {
  localStorage.setItem('contact_messages', JSON.stringify(messages.value))
  updateStats()
  window.dispatchEvent(new CustomEvent('contact-messages-updated', { detail: { unreadCount: stats.value.unread } }))
}

const markAsRead = (message) => { message.isRead = true; saveMessages(); showNotification('✓ تم تعيين الرسالة كمقروءة', 'success') }
const deleteMessage = (message) => {
  if (!confirm(`هل أنت متأكد من حذف رسالة "${message.subject}"؟`)) return
  messages.value = messages.value.filter(m => m.id !== message.id)
  saveMessages()
  showNotification('🗑️ تم حذف الرسالة بنجاح', 'success')
}
const viewMessage = (message) => { selectedMessage.value = message; showMessageModal.value = true; if (!message.isRead) markAsRead(message) }
const closeModal = () => { showMessageModal.value = false; selectedMessage.value = null }
const replyToMessage = () => {
  if (selectedMessage.value) {
    replyToEmail.value = selectedMessage.value.email
    replySubject.value = `RE: ${selectedMessage.value.subject}`
    replyMessage.value = `\n\n---\nالرسالة الأصلية:\n${selectedMessage.value.message}`
    showReplyModal.value = true
    closeModal()
  }
}
const closeReplyModal = () => { showReplyModal.value = false; replyToEmail.value = ''; replySubject.value = ''; replyMessage.value = '' }
const sendReply = () => {
  if (!replySubject.value.trim() || !replyMessage.value.trim()) { showNotification('الرجاء إدخال الموضوع والرسالة', 'warning'); return }
  sendingReply.value = true
  setTimeout(() => { showNotification('✉️ تم إرسال الرد بنجاح', 'success'); closeReplyModal(); sendingReply.value = false }, 1000)
}

watch(() => messages.value.length, () => updateStats())

onMounted(() => { loadMessages() })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
.contact-messages-page { font-family: 'Amiri', 'Cairo', serif; padding: 30px; background: #f8fafc; min-height: 100vh; direction: rtl; transition: all 0.3s ease; }
.contact-messages-page * { font-family: 'Amiri', 'Cairo', serif; }
.contact-messages-page.dark-mode { background: #0f172a; }
.page-content { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s ease; }
.dark-mode .page-content { background: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.stats-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid #e2e8f0; transition: all 0.3s ease; }
.dark-mode .stat-card { background: linear-gradient(135deg, #0f172a, #1e293b); border-color: #334155; }
.stat-card.unread .stat-icon { background: #fee2e2; color: #ef4444; }
.dark-mode .stat-card.unread .stat-icon { background: rgba(239,68,68,0.2); color: #f87171; }
.stat-card.total .stat-icon { background: #e0f2f1; color: #08717f; }
.dark-mode .stat-card.total .stat-icon { background: rgba(8,113,127,0.2); color: #2dd4bf; }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.stat-info { flex: 1; }
.stat-value { display: block; font-size: 1.8rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
.dark-mode .stat-value { color: #f1f5f9; }
.stat-label { color: #64748b; font-size: 0.9rem; }
.dark-mode .stat-label { color: #94a3b8; }
.filters-bar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
.search-input { flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background: white; color: #1e293b; }
.dark-mode .search-input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.search-input:focus { outline: none; border-color: #08717f; box-shadow: 0 0 0 3px rgba(8,113,127,0.1); }
.status-filter { padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background: white; color: #1e293b; cursor: pointer; }
.dark-mode .status-filter { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.loading-state { text-align: center; padding: 60px 20px; }
.loading-state p { font-size: 1.1rem; color: #64748b; }
.spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #08717f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.messages-list { display: flex; flex-direction: column; gap: 15px; }
.message-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.3s ease; cursor: pointer; }
.message-card.unread { border-right: 4px solid #08717f; background: #f0fdfa; }
.dark-mode .message-card { background: #0f172a; border-color: #334155; }
.dark-mode .message-card.unread { background: rgba(8,113,127,0.1); border-right-color: #2dd4bf; }
.message-card:hover { transform: translateX(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.sender-info { display: flex; align-items: center; gap: 12px; }
.sender-avatar { width: 45px; height: 45px; background: linear-gradient(135deg, #08717f, #0a8a9a); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem; }
.sender-details h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
.dark-mode .sender-details h3 { color: #f1f5f9; }
.sender-email { font-size: 0.85rem; color: #64748b; }
.dark-mode .sender-email { color: #94a3b8; }
.message-meta { text-align: left; }
.message-date { font-size: 0.8rem; color: #94a3b8; display: block; }
.unread-badge { background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-top: 5px; display: inline-block; }
.message-subject { margin-bottom: 10px; color: #1e293b; font-size: 1rem; }
.dark-mode .message-subject { color: #cbd5e1; }
.message-preview { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 15px; }
.dark-mode .message-preview { color: #94a3b8; }
.message-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.action-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 5px; }
.view-btn { background: #08717f; color: white; }
.view-btn:hover { background: #065c66; transform: translateY(-2px); }
.mark-read-btn { background: #10b981; color: white; }
.mark-read-btn:hover { background: #059669; transform: translateY(-2px); }
.delete-btn { background: #ef4444; color: white; }
.delete-btn:hover { background: #dc2626; transform: translateY(-2px); }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 15px; opacity: 0.3; }
.empty-state h3 { font-size: 1.3rem; color: #1e293b; margin-bottom: 8px; }
.dark-mode .empty-state h3 { color: #f1f5f9; }
.empty-state p { color: #64748b; font-size: 1rem; }
.dark-mode .empty-state p { color: #94a3b8; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s ease; }
.modal-content.dark-mode { background: #1e293b; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
.dark-mode .modal-header { border-bottom-color: #334155; }
.modal-header h3 { font-size: 1.3rem; color: #1e293b; }
.dark-mode .modal-header h3 { color: #f1f5f9; }
.close-btn { width: 35px; height: 35px; background: #f1f5f9; border: none; border-radius: 8px; font-size: 1.2rem; cursor: pointer; transition: all 0.3s ease; }
.dark-mode .close-btn { background: #334155; color: #f1f5f9; }
.close-btn:hover { background: #d40025; color: white; }
.modal-body { padding: 25px; }
.detail-section { margin-bottom: 20px; }
.detail-section label { display: block; font-weight: 600; color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; }
.dark-mode .detail-section label { color: #94a3b8; }
.detail-section p { color: #1e293b; line-height: 1.6; font-size: 1rem; }
.dark-mode .detail-section p { color: #cbd5e1; }
.message-content { background: #f8fafc; padding: 15px; border-radius: 12px; margin-top: 5px; line-height: 1.8; font-size: 1rem; }
.dark-mode .message-content { background: #0f172a; }
.reply-input, .reply-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease; }
.dark-mode .reply-input, .dark-mode .reply-textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.reply-textarea { resize: vertical; font-family: inherit; }
.modal-footer { display: flex; gap: 15px; padding: 20px; border-top: 1px solid #e2e8f0; }
.dark-mode .modal-footer { border-top-color: #334155; }
.btn-reply, .btn-send, .btn-close, .btn-cancel { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-reply, .btn-send { background: #08717f; color: white; }
.btn-reply:hover, .btn-send:hover:not(:disabled) { background: #065c66; transform: translateY(-2px); }
.btn-close, .btn-cancel { background: #f1f5f9; color: #64748b; }
.dark-mode .btn-close, .dark-mode .btn-cancel { background: #334155; color: #cbd5e1; }
.btn-close:hover, .btn-cancel:hover { background: #e2e8f0; }
.btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
.toast-notification { position: fixed; bottom: 30px; right: 30px; display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: white; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 9999; border-right: 4px solid; animation: slideInRight 0.3s ease; }
.toast-notification.dark-mode { background: #1e293b; }
.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-notification.info { border-right-color: #08717f; }
.toast-notification.warning { border-right-color: #f59e0b; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
.toast-icon { font-size: 1.3rem; }
.toast-message { color: #1e293b; font-size: 1rem; font-weight: 500; }
.dark-mode .toast-message { color: #f1f5f9; }
@media (max-width: 768px) { .contact-messages-page { padding: 20px; } .stats-cards { grid-template-columns: 1fr; } .filters-bar { flex-direction: column; } .message-header { flex-direction: column; align-items: flex-start; } .message-meta { text-align: right; } .modal-footer { flex-direction: column; } }
/* ===== DARK MODE UNIFORMISÉ POUR ADMIN/CONTACT MESSAGES ===== */
/* Ajoutez à la fin du <style scoped> */

.contact-messages-page.dark-mode {
  background: #161627 !important;
}

.dark-mode .page-content {
  background: #1e1e30 !important;
  border: 1px solid #2a2a40 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
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

/* Filters */
.dark-mode .search-input,
.dark-mode .status-filter {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .search-input::placeholder {
  color: #64748b !important;
}

.dark-mode .search-input:focus,
.dark-mode .status-filter:focus {
  border-color: #2dd4bf !important;
}

/* Messages Cards */
.dark-mode .message-card {
  background: #1e1e30 !important;
  border-color: #2a2a40 !important;
}

.dark-mode .message-card.unread {
  background: rgba(45, 212, 191, 0.05) !important;
  border-right-color: #2dd4bf !important;
}

.dark-mode .message-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
}

/* Sender */
.dark-mode .sender-avatar {
  background: linear-gradient(135deg, #08717f, #2dd4bf) !important;
}

.dark-mode .sender-details h3 {
  color: #f1f5f9 !important;
}

.dark-mode .sender-email {
  color: #94a3b8 !important;
}

/* Message */
.dark-mode .message-subject {
  color: #cbd5e1 !important;
}

.dark-mode .message-preview {
  color: #94a3b8 !important;
}

/* Loading */
.dark-mode .loading-state p {
  color: #94a3b8 !important;
}

.dark-mode .spinner {
  border-color: #2a2a40 !important;
  border-top-color: #2dd4bf !important;
}

/* Empty */
.dark-mode .empty-state h3 {
  color: #f1f5f9 !important;
}

.dark-mode .empty-state p {
  color: #94a3b8 !important;
}

/* Modal */
.dark-mode .modal-content {
  background: #1e1e30 !important;
}

.dark-mode .modal-header {
  border-bottom-color: #2a2a40 !important;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9 !important;
}

.dark-mode .close-btn {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .detail-section label {
  color: #94a3b8 !important;
}

.dark-mode .detail-section p {
  color: #cbd5e1 !important;
}

.dark-mode .message-content {
  background: #121220 !important;
  color: #cbd5e1 !important;
}

.dark-mode .reply-input,
.dark-mode .reply-textarea {
  background: #121220 !important;
  border-color: #2a2a40 !important;
  color: #f1f5f9 !important;
}

.dark-mode .reply-input:focus,
.dark-mode .reply-textarea:focus {
  border-color: #2dd4bf !important;
}

.dark-mode .modal-footer {
  border-top-color: #2a2a40 !important;
}

.dark-mode .btn-close,
.dark-mode .btn-cancel {
  background: #2a2a40 !important;
  color: #94a3b8 !important;
}

.dark-mode .btn-close:hover,
.dark-mode .btn-cancel:hover {
  background: #3a3a55 !important;
}

/* Toast */
.dark-mode .toast-notification {
  background: #1e1e30 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .toast-message {
  color: #f1f5f9 !important;
}
</style>
