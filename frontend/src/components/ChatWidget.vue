<!-- frontend/src/components/ChatWidget.vue - VERSION CORRIGÉE -->
<template>
  <div class="chat-widget">
    <!-- Bouton flottant pour ouvrir le chat -->
    <button class="chat-toggle" @click="toggleChat" :class="{ 'has-unread': unreadCount > 0 }">
      <span class="chat-icon">💬</span>
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Fenêtre de chat -->
    <transition name="slide-up">
      <div v-if="isOpen" class="chat-window">
        <div class="chat-header">
          <div class="chat-header-info">
            <span class="chat-header-icon">💬</span>
            <h3>المحادثات</h3>
          </div>
          <button class="close-chat" @click="closeChat">✕</button>
        </div>

        <div class="chat-body">
          <!-- Liste des conversations -->
          <div v-if="!activeChat" class="conversations-list">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>جاري تحميل المحادثات...</p>
            </div>

            <div v-else-if="conversations.length === 0" class="empty-state">
              <div class="empty-icon">💬</div>
              <p>لا توجد محادثات بعد</p>
              <p class="empty-hint">ابدأ محادثة مع بائع أو عميل</p>
            </div>

            <div v-else class="conversations">
              <div
                v-for="conv in conversations"
                :key="conv.id"
                class="conversation-item"
                :class="{ active: activeChat?.id === conv.id }"
                @click="openConversation(conv)"
              >
                <div class="conv-avatar">
                  <img
                    :src="getAvatar(conv)"
                    :alt="conv.other_user_name"
                    @error="handleAvatarError"
                  />
                  <span v-if="conv.unread_count > 0" class="conv-unread">{{ conv.unread_count }}</span>
                </div>
                <div class="conv-info">
                  <div class="conv-name">{{ conv.other_user_name || conv.other_user?.name || 'مستخدم' }}</div>
                  <div class="conv-last-message">{{ truncateText(conv.last_message, 30) || 'لا توجد رسائل' }}</div>
                </div>
                <div class="conv-time">{{ formatTime(conv.last_message_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Messages d'une conversation -->
          <div v-else class="messages-area">
            <div class="messages-header">
              <button class="back-btn" @click="backToConversations">
                <span>←</span>
              </button>
              <div class="messages-header-info">
                <img
                  :src="getAvatar(activeChat)"
                  :alt="activeChat.other_user_name"
                  class="header-avatar"
                  @error="handleAvatarError"
                />
                <div>
                  <h4>{{ activeChat.other_user_name || activeChat.other_user?.name || 'مستخدم' }}</h4>
                  <span class="user-type">{{ getUserTypeLabel(activeChat.other_user_type) }}</span>
                </div>
              </div>
              <button class="delete-conv-btn" @click="confirmDeleteConversation" title="حذف المحادثة">
                🗑️
              </button>
            </div>

            <div class="messages-list" ref="messagesList">
              <div v-if="loadingMessages" class="loading-messages">
                <div class="spinner-small"></div>
              </div>

              <div v-else-if="messages.length === 0" class="empty-messages">
                <div class="empty-icon">💬</div>
                <p>لا توجد رسائل بعد</p>
                <p>ابدأ المحادثة الآن</p>
              </div>

              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-item"
                :class="{ 'sent': msg.sender_id === userId, 'received': msg.sender_id !== userId }"
              >
                <div class="message-bubble">
                  <div class="message-text">{{ msg.message }}</div>
                  <div class="message-time">{{ formatTime(msg.created_at) }}</div>
                </div>
                <button
                  v-if="msg.sender_id === userId"
                  class="delete-message-btn"
                  @click="deleteMessage(msg.id)"
                  title="حذف"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="message-input-area">
              <textarea
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="اكتب رسالتك..."
                rows="2"
                class="message-input"
              ></textarea>
              <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                <span>إرسال</span>
                <span class="send-icon">←</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal confirmation suppression -->
    <transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>تأكيد الحذف</h3>
            <button class="close-btn" @click="showDeleteConfirm = false">✕</button>
          </div>
          <div class="modal-body">
            <p>هل أنت متأكد من حذف هذه المحادثة؟</p>
            <p class="warning-text">سيتم حذف جميع الرسائل ولا يمكن التراجع عن هذا الإجراء</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteConfirm = false">إلغاء</button>
            <button class="btn-delete" @click="deleteCurrentConversation">حذف</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/messageStore'

const authStore = useAuthStore()
const messageStore = useMessageStore()

// ===== STATE =====
const newMessage = ref('')
const showDeleteConfirm = ref(false)
const messagesList = ref(null)
const loadingMessages = ref(false)

// ===== CONSTANTES =====
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150'

// ===== COMPUTED =====
const isOpen = computed(() => messageStore.isOpen)
const activeChat = computed(() => messageStore.activeChat)
const conversations = computed(() => messageStore.conversations)
const messages = computed(() => messageStore.messages)
const unreadCount = computed(() => messageStore.unreadCount)
const loading = computed(() => messageStore.loading)
const userId = computed(() => authStore.userId)

// ===== FORMATAGE DES IMAGES =====
const getAvatar = (conv) => {
  if (!conv) return DEFAULT_AVATAR

  const possibleUrls = [
    conv.other_user_avatar,
    conv.avatar,
    conv.image
  ]

  for (const url of possibleUrls) {
    if (url && url !== 'null' && url !== 'undefined' && url !== '') {
      return url
    }
  }

  return DEFAULT_AVATAR
}

const handleAvatarError = (event) => {
  event.target.src = DEFAULT_AVATAR
}

// ===== MÉTHODES =====
const toggleChat = () => {
  if (!authStore.isAuthenticated) {
    window.location.href = '/login'
    return
  }
  messageStore.toggleChat()
}

const closeChat = () => {
  messageStore.closeChat()
}

const openConversation = async (conv) => {
  if (!conv || !conv.id) {
    console.error('❌ Conversation invalide ou ID manquant:', conv)

    // Si la conversation n'a pas d'ID mais a un other_user_id, créer une nouvelle conversation
    if (conv && !conv.id && conv.other_user_id) {
      console.log('🔄 Création de la conversation pour:', conv.other_user_id)
      const newConv = await messageStore.startConversation(conv.other_user_id, 'vendor')
      if (newConv && newConv.id) {
        loadingMessages.value = true
        messageStore.openChat(newConv)
        await messageStore.loadMessages(newConv.id)
        loadingMessages.value = false
        await nextTick()
        scrollToBottom()
      }
    }
    return
  }

  const convId = parseInt(conv.id)
  if (isNaN(convId)) {
    console.error('❌ ID de conversation invalide:', conv.id)
    return
  }

  loadingMessages.value = true
  messageStore.openChat(conv)
  await messageStore.loadMessages(convId)
  loadingMessages.value = false
  await nextTick()
  scrollToBottom()
}

const backToConversations = () => {
  messageStore.activeChat = null
  messageStore.messages = []
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  if (!activeChat.value) return

  const currentUserId = userId.value
  let receiverId = null

  // Déterminer le destinataire
  if (activeChat.value.user1_id === currentUserId) {
    receiverId = activeChat.value.user2_id
  } else if (activeChat.value.user2_id === currentUserId) {
    receiverId = activeChat.value.user1_id
  } else if (activeChat.value.other_user_id) {
    receiverId = activeChat.value.other_user_id
  }

  if (!receiverId) {
    console.error('❌ Impossible de déterminer le destinataire')
    return
  }

  const success = await messageStore.sendMessage(
    receiverId,
    newMessage.value,
    activeChat.value.id
  )

  if (success) {
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  }
}

const deleteMessage = async (messageId) => {
  if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
    await messageStore.deleteMessage(messageId)
  }
}

const confirmDeleteConversation = () => {
  showDeleteConfirm.value = true
}

const deleteCurrentConversation = async () => {
  if (!activeChat.value) return
  await messageStore.deleteConversation(activeChat.value.id)
  showDeleteConfirm.value = false
  backToConversations()
}

const scrollToBottom = () => {
  if (messagesList.value) {
    messagesList.value.scrollTop = messagesList.value.scrollHeight
  }
}

const getUserTypeLabel = (type) => {
  return type === 'vendor' ? 'حرفي' : 'عميل'
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'أمس'
  } else if (days < 7) {
    return `منذ ${days} أيام`
  }
  return date.toLocaleDateString('ar-TN')
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// ===== WATCHERS =====
watch(messages, () => {
  nextTick(() => scrollToBottom())
})

// ===== LIFECYCLE =====
onMounted(() => {
  messageStore.init()
})

onUnmounted(() => {
  messageStore.cleanup()
  messageStore.closeChat()
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');

/* ===== BASE STYLES ===== */
.chat-widget {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  font-family: 'Amiri', 'Cairo', sans-serif;
}

.chat-widget * {
  font-family: 'Amiri', 'Cairo', sans-serif;
}

/* ===== CHAT TOGGLE BUTTON ===== */
.chat-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #08717f, #d40025);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.chat-toggle:hover {
  transform: scale(1.1);
}

.chat-icon {
  font-size: 28px;
  color: white;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #d40025;
  color: white;
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  animation: pulse 1s infinite;
  font-family: 'Amiri', serif;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* ===== CHAT WINDOW ===== */
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  direction: rtl;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ===== CHAT HEADER ===== */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header-icon {
  font-size: 20px;
}

.chat-header h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  font-family: 'Amiri', serif;
}

.close-chat {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-chat:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* ===== CHAT BODY ===== */
.chat-body {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

/* ===== CONVERSATIONS LIST ===== */
.conversations-list {
  height: 100%;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state p,
.empty-state p {
  font-family: 'Amiri', serif;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  color: #64748b;
  margin: 5px 0;
}

.empty-hint {
  font-size: 13px;
  font-family: 'Amiri', serif;
}

.conversations {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.conversation-item:hover {
  background: #f1f5f9;
}

.conversation-item.active {
  background: #e0f2f1;
}

.conv-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  margin-left: 12px;
}

.conv-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.conv-unread {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #d40025;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-family: 'Amiri', serif;
}

.conv-info {
  flex: 1;
}

.conv-name {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 15px;
  font-family: 'Amiri', serif;
}

.conv-last-message {
  font-size: 13px;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.conv-time {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'Amiri', serif;
}

/* ===== MESSAGES AREA ===== */
.messages-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  gap: 12px;
}

.back-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e2e8f0;
  transform: translateX(-3px);
}

.messages-header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.messages-header-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-family: 'Amiri', serif;
}

.user-type {
  font-size: 12px;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.delete-conv-btn {
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.delete-conv-btn:hover {
  background: #d40025;
  color: white;
}

/* ===== MESSAGES LIST ===== */
.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-messages {
  text-align: center;
  padding: 20px;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-messages p {
  font-family: 'Amiri', serif;
}

.message-item {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
}

.message-item.sent .message-bubble {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border-bottom-left-radius: 4px;
}

.message-item.received .message-bubble {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-right-radius: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  font-family: 'Amiri', serif;
}

.message-time {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
  font-family: 'Amiri', serif;
}

.message-item.received .message-time {
  color: #94a3b8;
}

.delete-message-btn {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.message-item:hover .delete-message-btn {
  opacity: 1;
}

.delete-message-btn:hover {
  background: #fee2e2;
  color: #d40025;
}

/* ===== MESSAGE INPUT ===== */
.message-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  font-family: 'Amiri', serif;
  resize: none;
  direction: rtl;
}

.message-input:focus {
  outline: none;
  border-color: #08717f;
}

.message-input::placeholder {
  color: #94a3b8;
  font-family: 'Amiri', serif;
}

.send-btn {
  padding: 0 20px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.send-btn:hover:not(:disabled) {
  transform: translateX(-3px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  z-index: 10000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  color: #1e293b;
  font-family: 'Amiri', serif;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  background: #d40025;
  color: white;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.modal-body p {
  color: #1e293b;
  font-family: 'Amiri', serif;
}

.warning-text {
  color: #d40025;
  font-size: 13px;
  margin-top: 10px;
  font-family: 'Amiri', serif;
}

.modal-footer {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-delete {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Amiri', serif;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-delete {
  background: #d40025;
  color: white;
}

.btn-delete:hover {
  background: #b00020;
}

/* ===== SCROLLBAR ===== */
.chat-body::-webkit-scrollbar,
.messages-list::-webkit-scrollbar {
  width: 5px;
}

.chat-body::-webkit-scrollbar-track,
.messages-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 5px;
}

.chat-body::-webkit-scrollbar-thumb,
.messages-list::-webkit-scrollbar-thumb {
  background: #08717f;
  border-radius: 5px;
}

.chat-body::-webkit-scrollbar-thumb:hover,
.messages-list::-webkit-scrollbar-thumb:hover {
  background: #d40025;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 40px);
    right: 20px;
    bottom: 80px;
  }

  .chat-toggle {
    width: 50px;
    height: 50px;
  }

  .chat-icon {
    font-size: 24px;
  }
}
</style>
