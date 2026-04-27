// backend/src/controllers/reelController.js
const db = require('../models/db');

// Récupérer tous les reels (vidéos courtes)
exports.getAllReels = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Si vous avez une table 'reels'
    const reels = await db.query(`
      SELECT r.*, v.shopName as vendorName, u.avatar as vendorAvatar
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE r.status = 'approved'
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    res.json({
      success: true,
      data: { reels: reels || [] }
    });
  } catch (error) {
    console.error('❌ Erreur getAllReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer les reels d'un vendeur
exports.getVendorReels = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const reels = await db.query(`
      SELECT r.*, v.shopName as vendorName, u.avatar as vendorAvatar
      FROM reels r
      LEFT JOIN vendors v ON r.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE r.vendorId = ? AND r.status = 'approved'
      ORDER BY r.createdAt DESC
    `, [vendorId]);
    
    res.json({
      success: true,
      data: { reels: reels || [] }
    });
  } catch (error) {
    console.error('❌ Erreur getVendorReels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllReelsAdmin = async (req, res) => {
  // Récupérer tous les reels pour l'admin
  const reels = await Reel.findAll();
  res.json({ success: true, data: { reels } });
};

exports.approveReel = async (req, res) => {
  await Reel.update(req.params.id, { status: 'approved' });
  res.json({ success: true, message: 'Reel approuvé' });
};

exports.rejectReel = async (req, res) => {
  await Reel.update(req.params.id, { 
    status: 'rejected', 
    rejectionReason: req.body.reason 
  });
  res.json({ success: true, message: 'Reel rejeté' });
};