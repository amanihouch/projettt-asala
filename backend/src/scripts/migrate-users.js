// backend/scripts/migrate-users.js
const db = require('../src/models/db');

async function migrateUsersTable() {
  try {
    console.log('🔧 Vérification et migration de la table users...');
    
    // Vérifier si la colonne avatar existe
    let columns = await db.query('SHOW COLUMNS FROM users LIKE ?', ['avatar']);
    if (!columns || columns.length === 0) {
      console.log('📝 Ajout de la colonne avatar...');
      await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL');
      console.log('✅ Colonne avatar ajoutée');
    } else {
      console.log('✅ Colonne avatar existe déjà');
    }
    
    // Vérifier si la colonne phone existe
    columns = await db.query('SHOW COLUMNS FROM users LIKE ?', ['phone']);
    if (!columns || columns.length === 0) {
      console.log('📝 Ajout de la colonne phone...');
      await db.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL');
      console.log('✅ Colonne phone ajoutée');
    } else {
      console.log('✅ Colonne phone existe déjà');
    }
    
    // Vérifier si la colonne address existe
    columns = await db.query('SHOW COLUMNS FROM users LIKE ?', ['address']);
    if (!columns || columns.length === 0) {
      console.log('📝 Ajout de la colonne address...');
      await db.query('ALTER TABLE users ADD COLUMN address TEXT NULL');
      console.log('✅ Colonne address ajoutée');
    } else {
      console.log('✅ Colonne address existe déjà');
    }
    
    // Vérifier si la colonne last_login existe
    columns = await db.query('SHOW COLUMNS FROM users LIKE ?', ['last_login']);
    if (!columns || columns.length === 0) {
      console.log('📝 Ajout de la colonne last_login...');
      await db.query('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL');
      console.log('✅ Colonne last_login ajoutée');
    } else {
      console.log('✅ Colonne last_login existe déjà');
    }
    
    // Vérifier si la colonne updated_at existe
    columns = await db.query('SHOW COLUMNS FROM users LIKE ?', ['updated_at']);
    if (!columns || columns.length === 0) {
      console.log('📝 Ajout de la colonne updated_at...');
      await db.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      console.log('✅ Colonne updated_at ajoutée');
    } else {
      console.log('✅ Colonne updated_at existe déjà');
    }
    
    console.log('\n✅ Migration terminée avec succès');
    console.log('📊 Structure de la table users:');
    
    // Afficher la structure de la table
    const structure = await db.query('DESCRIBE users');
    console.table(structure);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    process.exit();
  }
}

migrateUsersTable();