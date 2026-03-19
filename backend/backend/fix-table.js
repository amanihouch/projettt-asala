// fix-table.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turath_ikbel'
  });

  console.log('✅ Connecté à MySQL');

  try {
    // Vérifier la structure actuelle
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('📊 Structure actuelle:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Extra}`);
    });

    // Corriger AUTO_INCREMENT si nécessaire
    await connection.execute(`
      ALTER TABLE users 
      MODIFY id INT NOT NULL AUTO_INCREMENT
    `);
    console.log('✅ AUTO_INCREMENT ajouté sur id');

    // Vérifier les noms des colonnes
    const hasIsActive = columns.some(col => col.Field === 'is_active');
    const hasCreatedAt = columns.some(col => col.Field === 'created_at');

    console.log(`\n📌 Colonnes trouvées:`);
    console.log(`   - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`   - created_at: ${hasCreatedAt ? '✅' : '❌'}`);

    if (!hasIsActive) {
      console.log('⚠️ is_active manquant, ajout...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER avatar
      `);
    }

    if (!hasCreatedAt) {
      console.log('⚠️ created_at manquant, ajout...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      `);
    }

    // Vérifier un utilisateur existant
    const [users] = await connection.execute(
      'SELECT id, email, is_active, created_at FROM users LIMIT 1'
    );
    
    if (users.length > 0) {
      console.log('\n✅ Test lecture OK:', users[0]);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

fixTable();