// backend/routes/admin/reels.js
const express = require('express');
const router = express.Router();
const Reel = require('../../models/Reel'); // Si vous avez un modèle

// GET /api/v1/admin/reels - Récupérer tous les reels pour admin
router.get('/', async (req, res) => {
  try {
    // Récupérer depuis la base de données
    const reels = await Reel.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: reels
    });
  } catch (error) {
    console.error('❌ Erreur chargement reels:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des reels'
    });
  }
});

// PATCH /api/v1/admin/reels/:id/approve - Approuver un reel
router.patch('/:id/approve', async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: reel,
      message: 'Reel approuvé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation'
    });
  }
});

// PATCH /api/v1/admin/reels/:id/reject - Rejeter un reel
router.patch('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason || 'Non spécifié',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: reel,
      message: 'Reel rejeté avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet'
    });
  }
});

module.exports = router;