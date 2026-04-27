// backend/src/routes/contact.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// ✅ Route PUBLIQUE - Pas besoin d'authentification
router.post('/', contactController.sendContactMessage);

// Routes admin (avec authentification)
const { protect, adminOnly } = require('../middleware/auth');

// ✅ Routes CORRIGÉES pour l'admin
router.get('/admin/unread', protect, adminOnly, contactController.getUnreadCount);
router.get('/admin/messages', protect, adminOnly, contactController.getAdminMessages);
router.get('/admin/stats', protect, adminOnly, contactController.getAdminStats);
router.get('/admin/messages/:id', protect, adminOnly, contactController.getAdminMessageById);
router.put('/admin/messages/:id/read', protect, adminOnly, contactController.markAsRead);
router.put('/admin/messages/:id/status', protect, adminOnly, contactController.updateMessageStatus);
router.delete('/admin/messages/:id', protect, adminOnly, contactController.deleteMessage);
router.post('/admin/reply', protect, adminOnly, contactController.replyToMessage);

module.exports = router;