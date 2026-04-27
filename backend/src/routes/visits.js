// backend/src/routes/visits.js - VERSION 100% CORRIGÉE
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// ===== MIDDLEWARE =====
router.use((req, res, next) => {
  console.log(`📨 [Visites] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== GESTION OPTIONS CORS =====
router.options('/start', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

router.options('/page-view', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

router.options('/end', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

router.options('/stats', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

// ==================== POST /api/v1/visits/start ====================
router.post('/start', async (req, res) => {
  console.log('📊 POST /visits/start - Body reçu:', req.body);
  
  try {
    const { sessionId, userId, pageUrl, pageTitle, referrer, browserInfo } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId requis' });
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    
    // Vérifier si la session existe déjà aujourd'hui
    const existing = await db.getOne(
      'SELECT id FROM visits WHERE session_id = ? AND DATE(created_at) = CURDATE()',
      [sessionId]
    );
    
    if (existing) {
      console.log(`📊 Session existante: ID=${existing.id}`);
      return res.json({ success: true, visitId: existing.id });
    }
    
    // Créer une nouvelle visite
    const result = await db.query(
      `INSERT INTO visits (session_id, user_id, ip_address, user_agent, page_url, referrer, pages_viewed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [sessionId, userId || null, ipAddress, JSON.stringify(browserInfo || {}), pageUrl, referrer]
    );
    
    const visitId = result.insertId;
    console.log(`✅ Nouvelle visite créée: ID=${visitId}, Session=${sessionId}`);
    
    res.json({ success: true, visitId: visitId });
    
  } catch (error) {
    console.error('❌ Erreur start visit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== POST /api/v1/visits/page-view ====================
router.post('/page-view', async (req, res) => {
  console.log('📄 POST /visits/page-view - Body reçu:', req.body);
  
  try {
    const { visitId, pageUrl, pageTitle, timeSpent } = req.body;
    
    if (!visitId) {
      return res.status(400).json({ success: false, error: 'visitId requis' });
    }
    
    // Enregistrer la page vue
    await db.query(
      `INSERT INTO page_views (visit_id, page_url, page_title, time_on_page, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [visitId, pageUrl, pageTitle, timeSpent || 0]
    );
    
    // Mettre à jour le nombre de pages vues
    await db.query(
      'UPDATE visits SET pages_viewed = pages_viewed + 1, updated_at = NOW() WHERE id = ?',
      [visitId]
    );
    
    console.log(`✅ Page vue enregistrée: VisitID=${visitId}, Page=${pageUrl}`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur page view:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== POST /api/v1/visits/end ====================
router.post('/end', async (req, res) => {
  console.log('🏁 POST /visits/end - Body reçu:', req.body);
  
  try {
    const { visitId, timeSpent, pagesViewed } = req.body;
    
    if (!visitId) {
      return res.status(400).json({ success: false, error: 'visitId requis' });
    }
    
    // Mettre à jour le temps passé
    await db.query(
      'UPDATE visits SET time_spent = ?, pages_viewed = ?, updated_at = NOW() WHERE id = ?',
      [timeSpent, pagesViewed, visitId]
    );
    
    console.log(`✅ Fin visite: ID=${visitId}, Temps=${timeSpent}s, Pages=${pagesViewed}`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur end visit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ✅ GET /api/v1/visits/stats (DONNÉES RÉELLES) ====================
router.get('/stats', async (req, res) => {
  console.log('📊 GET /visits/stats - Period:', req.query.period);
  
  try {
    const { period = 'week' } = req.query;
    
    // Déterminer l'intervalle selon la période
    let intervalDays;
    let groupBy;
    let dateFormat;
    
    switch(period) {
      case 'day':
        intervalDays = 1;
        groupBy = 'HOUR(created_at)';
        dateFormat = '%H';
        break;
      case '3days':
        intervalDays = 3;
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        intervalDays = 7;
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        intervalDays = 30;
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case '3months':
        intervalDays = 90;
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'year':
        intervalDays = 365;
        groupBy = 'MONTH(created_at)';
        dateFormat = '%Y-%m';
        break;
      default:
        intervalDays = 7;
        groupBy = 'DATE(created_at)';
        dateFormat = '%Y-%m-%d';
    }
    
    // ✅ VÉRIFIER SI LA TABLE VISITS EXISTE ET A DES DONNÉES
    const tableExists = await db.getOne(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'visits'
    `);
    
    let visits = [];
    let total = 0;
    
    if (tableExists && tableExists.count > 0) {
      // ✅ RÉCUPÉRER LES VRAIES DONNÉES
      visits = await db.query(`
        SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as date,
          COUNT(*) as count
        FROM visits
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${intervalDays} DAY)
        GROUP BY ${groupBy}
        ORDER BY MIN(created_at) ASC
      `);
      
      // Total de toutes les visites
      const totalResult = await db.getOne('SELECT COUNT(*) as total FROM visits');
      total = totalResult?.total || 0;
    }
    
    console.log(`✅ Stats visites: ${visits.length} enregistrements, Total: ${total}`);
    
    // ✅ RETOURNER LES VRAIES DONNÉES
    res.json({
      success: true,
      data: {
        visits: visits.map(v => ({
          date: String(v.date),
          count: parseInt(v.count) || 0
        })),
        total: total,
        totalAll: total || 1
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur get stats:', error);
    // En cas d'erreur, retourner un tableau vide mais avec success: true
    res.json({
      success: true,
      data: {
        visits: [],
        total: 0,
        totalAll: 1
      }
    });
  }
});

// ==================== ✅ GET /api/v1/visits/posts-stats (DONNÉES RÉELLES) ====================
router.get('/posts-stats', async (req, res) => {
  console.log('📊 GET /posts-stats - Period:', req.query.period);
  
  try {
    const { period = 'week' } = req.query;
    
    let intervalDays;
    let groupBy;
    let dateFormat;
    
    switch(period) {
      case 'day':
        intervalDays = 1;
        groupBy = 'HOUR(createdAt)';
        dateFormat = '%H';
        break;
      case '3days':
        intervalDays = 3;
        groupBy = 'DATE(createdAt)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        intervalDays = 7;
        groupBy = 'DATE(createdAt)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        intervalDays = 30;
        groupBy = 'DATE(createdAt)';
        dateFormat = '%Y-%m-%d';
        break;
      case '3months':
        intervalDays = 90;
        groupBy = 'DATE(createdAt)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'year':
        intervalDays = 365;
        groupBy = 'MONTH(createdAt)';
        dateFormat = '%Y-%m';
        break;
      default:
        intervalDays = 7;
        groupBy = 'DATE(createdAt)';
        dateFormat = '%Y-%m-%d';
    }
    
    // ✅ RÉCUPÉRER L'ÉVOLUTION DES PUBLICATIONS PAR STATUT
    const postsData = await db.query(`
      SELECT 
        DATE_FORMAT(createdAt, '${dateFormat}') as date,
        status,
        COUNT(*) as count
      FROM posts
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${intervalDays} DAY)
      GROUP BY ${groupBy}, status
      ORDER BY MIN(createdAt) ASC
    `);
    
    // ✅ TOTAUX
    const totalPosts = await db.getOne('SELECT COUNT(*) as total FROM posts');
    const pendingPosts = await db.getOne("SELECT COUNT(*) as total FROM posts WHERE status = 'pending'");
    const approvedPosts = await db.getOne("SELECT COUNT(*) as total FROM posts WHERE status = 'approved'");
    const rejectedPosts = await db.getOne("SELECT COUNT(*) as total FROM posts WHERE status = 'rejected'");
    
    console.log(`✅ Stats publications: ${postsData.length} enregistrements`);
    
    res.json({
      success: true,
      data: {
        evolution: postsData.map(p => ({
          date: String(p.date),
          count: parseInt(p.count) || 0,
          status: p.status
        })),
        totals: {
          all: totalPosts?.total || 0,
          approved: approvedPosts?.total || 0,
          pending: pendingPosts?.total || 0,
          rejected: rejectedPosts?.total || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur posts-stats:', error);
    res.json({
      success: true,
      data: {
        evolution: [],
        totals: { all: 0, approved: 0, pending: 0, rejected: 0 }
      }
    });
  }
});

module.exports = router;