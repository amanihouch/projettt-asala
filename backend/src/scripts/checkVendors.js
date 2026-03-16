// backend/src/scripts/checkVendors.js
const mysql = require('mysql2');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'turath_ikbel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const checkVendors = async () => {
  try {
    console.log('📦 Connexion à MySQL...');
    await promisePool.query('SELECT 1');
    console.log('✅ Connecté à MySQL\n');

    // Vérifier la structure
    console.log('🔍 Structure de la table vendors:');
    const [columns] = await promisePool.query('SHOW COLUMNS FROM vendors');
    columns.forEach(col => {
      console.log(`   ${col.Field.padEnd(20)} ${col.Type}`);
    });
    console.log('\n');

    // Vérifier les vendeurs existants
    console.log('📋 Liste des vendeurs:');
    const [vendors] = await promisePool.query(`
      SELECT v.id, v.userId, v.shopName, u.email, u.name 
      FROM vendors v
      JOIN users u ON v.userId = u.id
    `);
    
    if (vendors.length === 0) {
      console.log('   Aucun vendeur trouvé');
    } else {
      vendors.forEach(v => {
        console.log(`   ID: ${v.id} | UserID: ${v.userId} | ${v.shopName} | ${v.email}`);
      });
    }

    // Vérifier spécifiquement pour userId = 24
    console.log('\n🔍 Recherche pour userId = 24:');
    const [userVendor] = await promisePool.query(
      'SELECT * FROM vendors WHERE userId = 24'
    );
    
    if (userVendor.length > 0) {
      console.log('✅ Vendeur trouvé avec ID:', userVendor[0].id);
      console.log('   Détails:', userVendor[0]);
    } else {
      console.log('❌ Aucun vendeur pour userId = 24');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
};

checkVendors();