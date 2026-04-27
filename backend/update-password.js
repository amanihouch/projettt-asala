// backend/update-password.js - Version corrigée
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePassword() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'turath_ikbel'
    });
    
    console.log('✅ Connecté à la base de données');
    
    // Nouveau mot de passe (à modifier selon vos besoins)
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log(`🔐 Nouveau hash pour "${plainPassword}": ${hashedPassword}`);
    
    // Mettre à jour le mot de passe admin
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@turath.tn']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Mot de passe admin mis à jour avec succès!');
      console.log('📧 Email: admin@turath.tn');
      console.log('🔑 Nouveau mot de passe: admin123');
    } else {
      console.log('❌ Utilisateur admin non trouvé, création...');
      
      // Créer l'utilisateur admin s'il n'existe pas
      const [insertResult] = await connection.execute(
        `INSERT INTO users (name, email, password, role, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        ['Administrateur', 'admin@turath.tn', hashedPassword, 'admin']
      );
      
      console.log('✅ Utilisateur admin créé avec succès!');
      console.log('📧 Email: admin@turath.tn');
      console.log('🔑 Mot de passe: admin123');
    }
    
    // Vérifier le vendeur
    const [vendors] = await connection.execute(
      'SELECT * FROM vendors WHERE id = 26'
    );
    
    if (vendors.length > 0) {
      console.log('\n📊 Informations vendeur ID 26:');
      console.log(`   - Nom du magasin: ${vendors[0].shopName}`);
      console.log(`   - Approuvé: ${vendors[0].approved === 1 ? 'Oui' : 'Non'}`);
      
      if (vendors[0].approved !== 1) {
        console.log('⚠️ Ce vendeur n\'est pas encore approuvé!');
        console.log('   Pour l\'approuver, exécutez:');
        console.log('   UPDATE vendors SET approved = 1 WHERE id = 26;');
      }
    } else {
      console.log('\n❌ Vendeur avec ID 26 non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

updatePassword();