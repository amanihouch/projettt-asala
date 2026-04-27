// backend/src/controllers/messageController.js
const db = require('../models/db');
const User = require('../models/User');

/**
 * Récupérer toutes les conversations de l'utilisateur connecté
 */
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('📝 Récupération conversations pour:', { userId, userRole });

        const conversations = await db.query(`
            SELECT 
                c.id,
                c.user1_id,
                c.user2_id,
                c.user1_type,
                c.user2_type,
                c.last_message,
                c.last_message_at,
                c.created_at,
                c.updated_at,
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_unread
                    ELSE c.user1_unread
                END as unread_count,
                CASE 
                    WHEN c.user1_id = ? THEN 
                        JSON_OBJECT(
                            'id', u2.id,
                            'name', u2.name,
                            'email', u2.email,
                            'role', c.user2_type,
                            'avatar', u2.avatar
                        )
                    ELSE 
                        JSON_OBJECT(
                            'id', u1.id,
                            'name', u1.name,
                            'email', u1.email,
                            'role', c.user1_type,
                            'avatar', u1.avatar
                        )
                END as other_user
            FROM conversations c
            LEFT JOIN users u1 ON u1.id = c.user1_id
            LEFT JOIN users u2 ON u2.id = c.user2_id
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.last_message_at DESC
        `, [userId, userId, userId, userId]);

        const formattedConversations = conversations.map(conv => {
            const otherUser = conv.other_user;
            
            return {
                id: conv.id,
                user1_id: conv.user1_id,
                user2_id: conv.user2_id,
                user1_type: conv.user1_type,
                user2_type: conv.user2_type,
                other_user_id: otherUser.id,
                other_user_name: otherUser.name,
                other_user_avatar: otherUser.avatar,
                other_user_type: otherUser.role,
                last_message: conv.last_message,
                last_message_at: conv.last_message_at,
                unread_count: conv.unread_count,
                created_at: conv.created_at,
                updated_at: conv.updated_at
            };
        });

        console.log(`✅ ${formattedConversations.length} conversations trouvées`);

        res.json({
            success: true,
            data: {
                conversations: formattedConversations
            }
        });
    } catch (error) {
        console.error('❌ Erreur getConversations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des conversations',
            error: error.message
        });
    }
};

/**
 * Démarrer une nouvelle conversation
 */
exports.startConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId, otherUserRole, initialMessage } = req.body;
        const userRole = req.user.role;

        console.log('📝 Démarrage conversation:', { userId, otherUserId, otherUserRole });

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: 'ID du destinataire requis'
            });
        }

        const otherUser = await User.findById(parseInt(otherUserId));
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        let user1Id, user2Id, user1Type, user2Type;

        if (userRole === 'vendor') {
            user1Id = userId;
            user1Type = 'vendor';
            user2Id = parseInt(otherUserId);
            user2Type = otherUserRole || 'customer';
        } else {
            user1Id = parseInt(otherUserId);
            user1Type = otherUserRole || 'vendor';
            user2Id = userId;
            user2Type = 'customer';
        }

        let conversation = await db.getOne(`
            SELECT * FROM conversations 
            WHERE (user1_id = ? AND user2_id = ?) 
               OR (user1_id = ? AND user2_id = ?)
        `, [user1Id, user2Id, user2Id, user1Id]);

        if (!conversation) {
            const result = await db.insert(`
                INSERT INTO conversations (user1_id, user2_id, user1_type, user2_type, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, [user1Id, user2Id, user1Type, user2Type]);

            conversation = await db.getOne(`SELECT * FROM conversations WHERE id = ?`, [result]);
            console.log('✅ Nouvelle conversation créée:', conversation.id);
        } else {
            console.log('✅ Conversation existante trouvée:', conversation.id);
        }

        if (initialMessage && initialMessage.trim()) {
            const messageId = await db.insert(`
                INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [conversation.id, userId, otherUserId, initialMessage.trim()]);

            const unreadField = conversation.user1_id === otherUserId ? 'user1_unread' : 'user2_unread';
            await db.query(`
                UPDATE conversations 
                SET last_message = ?, last_message_at = NOW(), ${unreadField} = ${unreadField} + 1
                WHERE id = ?
            `, [initialMessage.trim(), conversation.id]);
        }

        const convDetails = await db.getOne(`
            SELECT 
                c.*,
                u1.name as user1_name,
                u1.avatar as user1_avatar,
                u2.name as user2_name,
                u2.avatar as user2_avatar
            FROM conversations c
            LEFT JOIN users u1 ON u1.id = c.user1_id
            LEFT JOIN users u2 ON u2.id = c.user2_id
            WHERE c.id = ?
        `, [conversation.id]);

        const isUser1 = convDetails.user1_id === userId;
        
        res.json({
            success: true,
            data: {
                conversation: {
                    id: convDetails.id,
                    user1_id: convDetails.user1_id,
                    user2_id: convDetails.user2_id,
                    user1_type: convDetails.user1_type,
                    user2_type: convDetails.user2_type,
                    other_user_id: isUser1 ? convDetails.user2_id : convDetails.user1_id,
                    other_user_name: isUser1 ? convDetails.user2_name : convDetails.user1_name,
                    other_user_avatar: isUser1 ? convDetails.user2_avatar : convDetails.user1_avatar,
                    other_user_type: isUser1 ? convDetails.user2_type : convDetails.user1_type,
                    last_message: convDetails.last_message,
                    last_message_at: convDetails.last_message_at,
                    created_at: convDetails.created_at
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur startConversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du démarrage de la conversation',
            error: error.message
        });
    }
};

/**
 * Récupérer les messages d'une conversation
 */
exports.getMessages = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.id;

        // Validation de l'ID
        if (isNaN(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de conversation invalide'
            });
        }

        console.log(`📝 Récupération messages pour conversation ${conversationId}`);

        const conversation = await db.getOne(`
            SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)
        `, [conversationId, userId, userId]);

        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette conversation'
            });
        }

        const unreadField = conversation.user1_id === userId ? 'user1_unread' : 'user2_unread';
        await db.query(`
            UPDATE conversations SET ${unreadField} = 0 WHERE id = ?
        `, [conversationId]);

        const messages = await db.query(`
            SELECT 
                id,
                conversation_id,
                sender_id,
                receiver_id,
                message,
                is_read,
                created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        `, [conversationId]);

        console.log(`✅ ${messages.length} messages récupérés`);

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('❌ Erreur getMessages:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des messages',
            error: error.message
        });
    }
};

/**
 * Envoyer un message
 */
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId, message, conversationId } = req.body;

        console.log('📝 Envoi message:', { userId, receiverId, message, conversationId });

        if (!receiverId || !message) {
            return res.status(400).json({
                success: false,
                message: 'Destinataire et message requis'
            });
        }

        let convId = conversationId;

        if (!convId) {
            const otherUser = await User.findById(receiverId);
            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Destinataire non trouvé'
                });
            }

            const userRole = req.user.role;
            let user1Id, user2Id, user1Type, user2Type;

            if (userRole === 'vendor') {
                user1Id = userId;
                user1Type = 'vendor';
                user2Id = receiverId;
                user2Type = 'customer';
            } else {
                user1Id = receiverId;
                user1Type = 'vendor';
                user2Id = userId;
                user2Type = 'customer';
            }

            let conversation = await db.getOne(`
                SELECT * FROM conversations 
                WHERE (user1_id = ? AND user2_id = ?) 
                   OR (user1_id = ? AND user2_id = ?)
            `, [user1Id, user2Id, user2Id, user1Id]);

            if (!conversation) {
                const result = await db.insert(`
                    INSERT INTO conversations (user1_id, user2_id, user1_type, user2_type, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [user1Id, user2Id, user1Type, user2Type]);
                convId = result;
            } else {
                convId = conversation.id;
            }
        }

        const messageId = await db.insert(`
            INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [convId, userId, receiverId, message]);

        const conversation = await db.getOne(`SELECT * FROM conversations WHERE id = ?`, [convId]);
        
        let unreadField;
        if (conversation.user1_id === receiverId) {
            unreadField = 'user1_unread';
        } else if (conversation.user2_id === receiverId) {
            unreadField = 'user2_unread';
        } else {
            unreadField = conversation.user1_id === userId ? 'user2_unread' : 'user1_unread';
        }
        
        await db.query(`
            UPDATE conversations 
            SET last_message = ?, last_message_at = NOW(), ${unreadField} = COALESCE(${unreadField}, 0) + 1
            WHERE id = ?
        `, [message, convId]);

        const newMessage = await db.getOne(`SELECT * FROM messages WHERE id = ?`, [messageId]);

        console.log('✅ Message envoyé:', newMessage.id);

        res.json({
            success: true,
            data: {
                message: newMessage,
                conversationId: convId
            }
        });
    } catch (error) {
        console.error('❌ Erreur sendMessage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message',
            error: error.message
        });
    }
};

/**
 * Supprimer un message
 */
exports.deleteMessage = async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const userId = req.user.id;

        const message = await db.getOne(`
            SELECT * FROM messages WHERE id = ? AND sender_id = ?
        `, [messageId, userId]);

        if (!message) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres messages'
            });
        }

        await db.query('DELETE FROM messages WHERE id = ?', [messageId]);

        res.json({
            success: true,
            message: 'Message supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur deleteMessage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du message',
            error: error.message
        });
    }
};

/**
 * Supprimer une conversation
 */
exports.deleteConversation = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.id;

        const conversation = await db.getOne(`
            SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)
        `, [conversationId, userId, userId]);

        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: 'Conversation non trouvée'
            });
        }

        await db.query('DELETE FROM conversations WHERE id = ?', [conversationId]);

        res.json({
            success: true,
            message: 'Conversation supprimée avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur deleteConversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la conversation',
            error: error.message
        });
    }
};

/**
 * Récupérer le nombre de messages non lus
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.getOne(`
            SELECT 
                SUM(CASE WHEN user1_id = ? THEN user1_unread ELSE user2_unread END) as total_unread
            FROM conversations
            WHERE user1_id = ? OR user2_id = ?
        `, [userId, userId, userId]);

        res.json({
            success: true,
            data: {
                count: result?.total_unread || 0
            }
        });
    } catch (error) {
        console.error('❌ Erreur getUnreadCount:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement',
            error: error.message
        });
    }
};