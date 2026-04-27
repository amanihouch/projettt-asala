// backend/test-products.js
const db = require('./src/models/db');

async function testProducts() {
  console.log('🔍 Test de la table products...\n');
  
  try {
    // 1. Vérifier si la table existe
    const tables = await db.query('SHOW TABLES LIKE "products"');
    console.log('📊 Table products existe:', tables.length > 0);
    
    if (tables.length === 0) {
      console.log('❌ La table products n\'existe pas!');
      console.log('📝 Exécutez d\'abord la requête SQL pour créer la table.');
      return;
    }
    
    // 2. Compter les produits
    const count = await db.query('SELECT COUNT(*) as total FROM products');
    console.log('📊 Nombre de produits:', count[0]?.total || 0);
    
    // 3. Récupérer les produits
    const products = await db.query('SELECT * FROM products LIMIT 5');
    console.log('📦 Produits:', products);
    
    // 4. Tester la requête avec LIMIT et OFFSET
    console.log('\n📝 Test avec LIMIT 20 OFFSET 0...');
    const paginated = await db.query('SELECT * FROM products ORDER BY createdAt DESC LIMIT 20 OFFSET 0');
    console.log('✅ Résultat:', paginated.length, 'produits trouvés');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit();
  }
}

testProducts();