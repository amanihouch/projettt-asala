// backend/src/routes/reviews.js - VERSION SIMPLIFIÉE ET FONCTIONNELLE
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Créer une connexion directe à la BDD
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'turath'
});

console.log('✅ Routes reviews chargées');

// GET /api/v1/reviews/products/:productId
router.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`📥 Reviews pour produit ${productId}`);
    
    // Utiliser directement la pool mysql2
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as userName, u.avatar as userAvatar
      FROM review r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.productId = ? AND r.status = 'approved'
      ORDER BY r.createdAt DESC
      LIMIT 50
    `, [productId]);
    
    console.log(`📊 ${reviews.length} reviews trouvées`);
    
    res.json({
      success: true,
      data: { reviews }
    });
    
  } catch (error) {
    console.error('❌ Erreur reviews:', error.message);
    
    // Si la table n'existe pas, renvoyer un tableau vide
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Table review inexistante, création...');
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS review (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rating INT NOT NULL,
            comment TEXT NOT NULL,
            productId INT NOT NULL,
            userId INT NOT NULL,
            status VARCHAR(20) DEFAULT 'approved',
            helpfulCount INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_product (productId),
            INDEX idx_user (userId)
          )
        `);
        console.log('✅ Table review créée');
      } catch (createError) {
        console.error('❌ Erreur création table:', createError.message);
      }
      
      return res.json({
        success: true,
        data: { reviews: [] }
      });
    }
    
    // Pour les autres erreurs, renvoyer quand même un tableau vide
    // pour ne pas bloquer l'affichage du produit
    res.json({
      success: true,
      data: { reviews: [] }
    });
  }
});

module.exports = router;
