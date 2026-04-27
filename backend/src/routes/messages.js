// backend/src/routes/messages.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getConversations,
    startConversation,
    getMessages,
    sendMessage,
    deleteMessage,
    deleteConversation,
    getUnreadCount
} = require('../controllers/messageController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes des conversations
router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.delete('/conversations/:id', deleteConversation);

// Routes des messages
router.get('/conversations/:id/messages', getMessages);
router.post('/send', sendMessage);
router.delete('/messages/:id', deleteMessage);

// Compteur de messages non lus
router.get('/unread', getUnreadCount);

module.exports = router;