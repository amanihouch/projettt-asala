// backend/src/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { protect, adminOnly } = require('../middleware/auth');

// Route de test pour vérifier l'email
router.get('/test-email', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔍 Test d\'envoi d\'email...');
    
    // Tester la connexion SMTP
    const connectionTest = await emailService.testConnection();
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur de connexion SMTP',
        error: connectionTest.error
      });
    }
    
    const testEmail = req.user.email;
    console.log(`📧 Envoi d'email de test à: ${testEmail}`);
    
    const result = await emailService.sendVendorApprovalEmail(
      testEmail,
      req.user.name || 'Admin Test',
      'Test Shop'
    );
    
    res.json({
      success: result.success,
      message: result.success ? '✅ Email de test envoyé avec succès' : '❌ Erreur lors de l\'envoi',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Route pour tester l'envoi d'email sans authentification (développement seulement)
router.get('/test-email-public', async (req, res) => {
  try {
    const result = await emailService.sendVendorApprovalEmail(
      'test@example.com',
      'Test User',
      'Test Shop'
    );
    res.json({ success: result.success, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;