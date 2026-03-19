// backend/src/routes/newsletter.js
const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

// ===== ROUTES PUBLIQUES =====

/**
 * @route   POST /api/v1/newsletter/subscribe
 * @desc    S'abonner à la newsletter
 * @access  Public
 */
router.post('/subscribe', newsletterController.subscribe);

/**
 * @route   GET /api/v1/newsletter/unsubscribe/:email
 * @desc    Se désabonner de la newsletter
 * @access  Public
 */
router.get('/unsubscribe/:email', newsletterController.unsubscribe);

/**
 * @route   GET /api/v1/newsletter/verify/:email
 * @desc    Vérifier si un email est abonné
 * @access  Public
 */
router.get('/verify/:email', async (req, res) => {
  try {
    const Newsletter = require('../models/Newsletter');
    const { email } = req.params;
    const isSubscribed = await Newsletter.isSubscribed(email);
    
    res.json({
      success: true,
      data: { isSubscribed }
    });
  } catch (error) {
    console.error('❌ Erreur verify:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ROUTES PROTÉGÉES (admin uniquement) =====
// Toutes les routes suivantes nécessitent un token admin

/**
 * @route   GET /api/v1/newsletter/subscribers
 * @desc    Récupérer tous les abonnés actifs
 * @access  Admin
 */
router.get('/subscribers', protect, newsletterController.getSubscribers);

/**
 * @route   GET /api/v1/newsletter/all
 * @desc    Récupérer tous les emails (actifs et inactifs)
 * @access  Admin
 */
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const Newsletter = require('../models/Newsletter');
    const subscribers = await Newsletter.getAllEmails();
    const stats = await Newsletter.getStats();

    res.json({
      success: true,
      data: {
        subscribers,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Erreur getAll:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/v1/newsletter/stats
 * @desc    Obtenir les statistiques de la newsletter
 * @access  Admin
 */
router.get('/stats', protect, newsletterController.getNewsletterStats);

/**
 * @route   POST /api/v1/newsletter/send
 * @desc    Envoyer une campagne newsletter
 * @access  Admin
 */
router.post('/send', protect, newsletterController.sendNewsletter);

/**
 * @route   DELETE /api/v1/newsletter/:email
 * @desc    Supprimer définitivement un abonné
 * @access  Admin
 */
router.delete('/:email', protect, newsletterController.deleteSubscriber);

/**
 * @route   PATCH /api/v1/newsletter/:email/status
 * @desc    Activer/désactiver un abonné
 * @access  Admin
 */
router.patch('/:email/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { email } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le statut est requis'
      });
    }

    const Newsletter = require('../models/Newsletter');
    const result = await Newsletter.updateStatus(email, isActive);

    res.json({
      success: result,
      message: result ? 'Statut mis à jour' : 'Email non trouvé'
    });
  } catch (error) {
    console.error('❌ Erreur updateStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/v1/newsletter/export
 * @desc    Exporter les emails au format CSV
 * @access  Admin
 */
router.get('/export/csv', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const Newsletter = require('../models/Newsletter');
    const csv = await Newsletter.exportToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter.csv');
    res.send(csv);
  } catch (error) {
    console.error('❌ Erreur export:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;