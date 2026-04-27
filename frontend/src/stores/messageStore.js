// frontend/src/stores/messageStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useAuthStore } from './auth'
import { formatAvatarUrl } from '../utils/image.js'

export const useMessageStore = defineStore('messages', () => {
    const authStore = useAuthStore()

    // ===== STATE =====
    const conversations = ref([])
    const currentConversation = ref(null)
    const messages = ref([])
    const loading = ref(false)
    const unreadCount = ref(0)
    const isOpen = ref(false)
    const activeChat = ref(null)
    let pollingInterval = null

    // ===== CONSTANTES =====
    const DEFAULT_AVATAR = 'https://i.pravatar.cc/150'

    // ===== FORMATAGE DES AVATARS =====
    const formatAvatar = (avatar) => {
        if (!avatar || avatar === 'null' || avatar === 'undefined' || avatar === '') {
            return DEFAULT_AVATAR
        }

        // Si c'est déjà une URL complète
        if (avatar.startsWith('http') || avatar.startsWith('data:image')) {
            return avatar
        }

        // Utiliser la fonction utilitaire si disponible
        if (typeof formatAvatarUrl === 'function') {
            return formatAvatarUrl(avatar, DEFAULT_AVATAR)
        }

        return DEFAULT_AVATAR
    }

    // ===== VALIDATION =====
    const isValidId = (id) => {
        return id !== null && id !== undefined && !isNaN(parseInt(id)) && parseInt(id) > 0
    }

    // ===== CHARGEMENT DES CONVERSATIONS =====
    const loadConversations = async () => {
        if (!authStore.isAuthenticated) {
            console.log('ℹ️ Utilisateur non authentifié, conversations non chargées')
            return
        }

        loading.value = true
        try {
            const response = await api.get('/messages/conversations')
            if (response.data.success) {
                const rawConversations = response.data.data?.conversations || response.data.data || []
                conversations.value = rawConversations.map(conv => ({
                    ...conv,
                    other_user_avatar: formatAvatar(conv.other_user_avatar),
                    last_message: conv.last_message || conv.lastMessage || '',
                    last_message_at: conv.last_message_at || conv.lastMessageAt || null,
                    unread_count: conv.unread_count || conv.unreadCount || 0,
                    id: parseInt(conv.id)
                }))

                // Trier par date du dernier message (le plus récent en premier)
                conversations.value.sort((a, b) => {
                    const dateA = a.last_message_at ? new Date(a.last_message_at) : new Date(0)
                    const dateB = b.last_message_at ? new Date(b.last_message_at) : new Date(0)
                    return dateB - dateA
                })

                await loadUnreadCount()
                console.log('✅ Conversations chargées:', conversations.value.length)
            } else {
                console.error('❌ Réponse API invalide:', response.data)
                conversations.value = []
            }
        } catch (error) {
            console.error('❌ Erreur chargement conversations:', error.response?.data || error.message)
            conversations.value = []
        } finally {
            loading.value = false
        }
    }

    // ===== CHARGEMENT DES MESSAGES D'UNE CONVERSATION =====
    const loadMessages = async (conversationId) => {
        // Validation de l'ID
        if (!isValidId(conversationId)) {
            console.error('❌ conversationId invalide:', conversationId)
            return
        }

        const convId = parseInt(conversationId)

        loading.value = true
        try {
            const response = await api.get(`/messages/conversations/${convId}/messages`)
            if (response.data.success) {
                const rawMessages = response.data.data?.messages || response.data.data || []
                messages.value = rawMessages.map(msg => ({
                    ...msg,
                    id: parseInt(msg.id),
                    sender_id: parseInt(msg.sender_id),
                    conversation_id: parseInt(msg.conversation_id)
                }))

                // Mettre à jour le compteur non lu de la conversation
                const conv = conversations.value.find(c => c.id === convId)
                if (conv) {
                    conv.unread_count = 0
                    currentConversation.value = conv
                }

                await loadUnreadCount()
                console.log('✅ Messages chargés:', messages.value.length)
            }
        } catch (error) {
            console.error('❌ Erreur chargement messages:', error.response?.data || error.message)
            messages.value = []
        } finally {
            loading.value = false
        }
    }

    // ===== ENVOYER UN MESSAGE =====
    const sendMessage = async (receiverId, message, conversationId = null) => {
        if (!message?.trim()) {
            console.error('❌ Message vide')
            return false
        }

        if (!isValidId(receiverId)) {
            console.error('❌ receiverId invalide:', receiverId)
            return false
        }

        const numericReceiverId = parseInt(receiverId)
        const numericConversationId = conversationId ? parseInt(conversationId) : null

        try {
            const payload = {
                receiverId: numericReceiverId,
                message: message.trim()
            }

            if (isValidId(numericConversationId)) {
                payload.conversationId = numericConversationId
            }

            console.log('📤 Envoi message:', payload)
            const response = await api.post('/messages/send', payload)

            if (response.data.success) {
                const newMessage = response.data.data?.message
                const newConvId = response.data.data?.conversationId || response.data.data?.conversation_id

                if (newMessage) {
                    // Ajouter le nouveau message à la liste
                    const formattedMessage = {
                        ...newMessage,
                        id: parseInt(newMessage.id),
                        sender_id: parseInt(newMessage.sender_id),
                        conversation_id: parseInt(newMessage.conversation_id)
                    }
                    messages.value.push(formattedMessage)
                }

                // Recharger les conversations pour mettre à jour le dernier message
                await loadConversations()

                // Mettre à jour la conversation active si nouvelle
                if (isValidId(newConvId) && !activeChat.value?.id) {
                    const foundConv = conversations.value.find(c => c.id === parseInt(newConvId))
                    if (foundConv) {
                        activeChat.value = foundConv
                    }
                }

                return true
            } else {
                console.error('❌ Échec envoi message:', response.data.message)
                return false
            }
        } catch (error) {
            console.error('❌ Erreur envoi message:', error.response?.data || error.message)
            return false
        }
    }

    // ===== DÉMARRER UNE CONVERSATION =====
    const startConversation = async (otherUserId, otherUserRole = 'customer') => {
        if (!isValidId(otherUserId)) {
            console.error('❌ otherUserId invalide:', otherUserId)
            return null
        }

        try {
            console.log('📝 Démarrage conversation:', { otherUserId, otherUserRole })
            const response = await api.post('/messages/conversations', {
                otherUserId: parseInt(otherUserId),
                otherUserRole: otherUserRole
            })

            if (response.data.success) {
                const conversation = response.data.data?.conversation || response.data.data
                const formattedConversation = {
                    ...conversation,
                    id: parseInt(conversation.id),
                    other_user_avatar: formatAvatar(conversation.other_user_avatar),
                    unread_count: 0
                }

                // Ajouter ou mettre à jour dans la liste
                const existingIndex = conversations.value.findIndex(c => c.id === formattedConversation.id)
                if (existingIndex === -1) {
                    conversations.value.unshift(formattedConversation)
                } else {
                    conversations.value[existingIndex] = formattedConversation
                }

                await loadUnreadCount()
                return formattedConversation
            } else {
                console.error('❌ Réponse API invalide:', response.data)
                return null
            }
        } catch (error) {
            console.error('❌ Erreur démarrage conversation:', error.response?.data || error.message)
            return null
        }
    }

    // ===== CHARGER LE NOMBRE DE MESSAGES NON LUS =====
    const loadUnreadCount = async () => {
        if (!authStore.isAuthenticated) return

        try {
            const response = await api.get('/messages/unread')
            if (response.data.success) {
                unreadCount.value = response.data.data?.count || response.data.data?.unreadCount || 0
            }
        } catch (error) {
            // Gérer silencieusement l'erreur 404 (pas de messages non lus)
            if (error.response?.status === 404) {
                unreadCount.value = 0
                return
            }
            console.error('❌ Erreur chargement unread count:', error.response?.data || error.message)
        }
    }

    // ===== SUPPRIMER UN MESSAGE =====
    const deleteMessage = async (messageId) => {
        if (!isValidId(messageId)) {
            console.error('❌ messageId invalide:', messageId)
            return false
        }

        try {
            const response = await api.delete(`/messages/messages/${parseInt(messageId)}`)
            if (response.data.success) {
                messages.value = messages.value.filter(m => m.id !== parseInt(messageId))
                return true
            }
            return false
        } catch (error) {
            console.error('❌ Erreur suppression message:', error.response?.data || error.message)
            return false
        }
    }

    // ===== SUPPRIMER UNE CONVERSATION =====
    const deleteConversation = async (conversationId) => {
        if (!isValidId(conversationId)) {
            console.error('❌ conversationId invalide:', conversationId)
            return false
        }

        const convId = parseInt(conversationId)

        try {
            const response = await api.delete(`/messages/conversations/${convId}`)
            if (response.data.success) {
                conversations.value = conversations.value.filter(c => c.id !== convId)

                if (activeChat.value?.id === convId) {
                    activeChat.value = null
                    messages.value = []
                }

                await loadUnreadCount()
                return true
            }
            return false
        } catch (error) {
            console.error('❌ Erreur suppression conversation:', error.response?.data || error.message)
            return false
        }
    }

    // ===== OUVERTURE/FERMETURE DU CHAT =====
    const openChat = (conversation = null) => {
        isOpen.value = true

        if (conversation) {
            const formattedConv = {
                ...conversation,
                other_user_avatar: formatAvatar(conversation.other_user_avatar),
                id: conversation.id ? parseInt(conversation.id) : null
            }
            activeChat.value = formattedConv

            if (isValidId(formattedConv.id)) {
                loadMessages(formattedConv.id)
            }
        }
    }

    const closeChat = () => {
        isOpen.value = false
        activeChat.value = null
        messages.value = []
    }

    const toggleChat = () => {
        if (!authStore.isAuthenticated) {
            window.location.href = '/login'
            return
        }

        isOpen.value = !isOpen.value

        if (!isOpen.value) {
            activeChat.value = null
            messages.value = []
        } else if (conversations.value.length === 0) {
            loadConversations()
        }
    }

    // ===== VÉRIFIER LES MESSAGES EN ATTENTE =====
    const checkPendingChat = () => {
        const pendingChat = localStorage.getItem('pendingChat')
        if (!pendingChat) return

        try {
            const chatData = JSON.parse(pendingChat)
            localStorage.removeItem('pendingChat')

            if (!chatData.receiverId || !isValidId(chatData.receiverId)) {
                console.error('❌ pendingChat invalide:', chatData)
                return
            }

            const normalizedReceiverId = parseInt(chatData.receiverId)
            const existingConv = conversations.value.find(c => c.other_user_id === normalizedReceiverId)

            if (existingConv) {
                openChat(existingConv)
            } else {
                // Créer une conversation temporaire
                const tempConv = {
                    id: null,
                    other_user_id: normalizedReceiverId,
                    other_user_name: chatData.receiverName || 'مستخدم',
                    other_user_avatar: formatAvatar(chatData.receiverAvatar),
                    other_user_type: 'vendor',
                    last_message: '',
                    last_message_at: null,
                    unread_count: 0
                }
                openChat(tempConv)

                // Démarrer la conversation réelle en arrière-plan
                startConversation(normalizedReceiverId, 'vendor').then(conv => {
                    if (conv && isValidId(conv.id) && activeChat.value?.id === null) {
                        activeChat.value = conv
                        loadMessages(conv.id)
                    }
                })
            }
        } catch (e) {
            console.error('❌ Erreur pendingChat:', e)
            localStorage.removeItem('pendingChat')
        }
    }

    // ===== INITIALISATION =====
    const init = async () => {
        if (authStore.isAuthenticated) {
            await loadConversations()
            checkPendingChat()

            // Démarrer le polling
            if (pollingInterval) clearInterval(pollingInterval)
            pollingInterval = setInterval(async () => {
                if (authStore.isAuthenticated && isOpen.value) {
                    await loadUnreadCount()

                    // Recharger les messages de la conversation active toutes les 5 secondes
                    if (activeChat.value?.id && isValidId(activeChat.value.id)) {
                        await loadMessages(activeChat.value.id)
                    }
                }
            }, 5000)
        }
    }

    // ===== NETTOYAGE =====
    const cleanup = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = null
        }
    }

    // ===== COMPUTED =====
    const hasConversations = computed(() => conversations.value.length > 0)
    const isLoading = computed(() => loading.value)

    // ===== EXPORTS =====
    return {
        // State
        conversations,
        currentConversation,
        messages,
        loading,
        unreadCount,
        isOpen,
        activeChat,

        // Computed
        hasConversations,
        isLoading,

        // Méthodes
        loadConversations,
        loadMessages,
        sendMessage,
        startConversation,
        loadUnreadCount,
        deleteMessage,
        deleteConversation,
        openChat,
        closeChat,
        toggleChat,
        checkPendingChat,
        init,
        cleanup,
        formatAvatar
    }
})
