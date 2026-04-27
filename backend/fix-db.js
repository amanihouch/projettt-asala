// fix-db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Correction de la base de données...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turath_db'
  });

  try {
    // Vérifier d'abord la structure actuelle
    console.log('📊 Structure actuelle de la table users:');
    const [currentStructure] = await connection.execute('DESCRIBE users');
    console.table(currentStructure);
    
    console.log('\n📝 Ajout des colonnes manquantes...\n');
    
    // Liste des colonnes à ajouter
    const columnsToAdd = [
      { name: 'avatar', type: 'VARCHAR(255) NULL' },
      { name: 'phone', type: 'VARCHAR(20) NULL' },
      { name: 'address', type: 'TEXT NULL' },
      { name: 'last_login', type: 'TIMESTAMP NULL' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];
    
    let addedCount = 0;
    
    for (const column of columnsToAdd) {
      try {
        // Vérifier si la colonne existe
        const [exists] = await connection.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'turath_db', column.name]
        );
        
        if (exists.length === 0) {
          console.log(`➕ Ajout de la colonne ${column.name}...`);
          await connection.execute(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Colonne ${column.name} ajoutée avec succès`);
          addedCount++;
        } else {
          console.log(`✅ Colonne ${column.name} existe déjà`);
        }
      } catch (err) {
        console.error(`❌ Erreur pour ${column.name}:`, err.message);
      }
    }
    
    if (addedCount === 0) {
      console.log('\n✨ Aucune colonne à ajouter - tout est déjà en place!');
    } else {
      console.log(`\n✅ ${addedCount} colonne(s) ajoutée(s) avec succès`);
    }
    
    // Afficher la nouvelle structure
    console.log('\n📊 Nouvelle structure de la table users:');
    const [newStructure] = await connection.execute('DESCRIBE users');
    console.table(newStructure);
    
    console.log('\n✅ Correction terminée!');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Vérifiez vos identifiants de connexion MySQL dans le fichier .env');
    console.log('   DB_HOST:', process.env.DB_HOST);
    console.log('   DB_USER:', process.env.DB_USER);
    console.log('   DB_NAME:', process.env.DB_NAME);
  }
}

fixDatabase();