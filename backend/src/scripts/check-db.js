const db = require('../src/models/db');

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données...\n');

  try {
    // Vérifier les utilisateurs
    const users = await db.query('SELECT id, name, email, role FROM users');
    console.log(`📋 UTILISATEURS (${users.length}):`);
    users.forEach(u => {
      console.log(`   ID: ${u.id} | ${u.name} | ${u.email} | Rôle: ${u.role}`);
    });

    console.log('\n');

    // Vérifier les vendeurs
    const vendors = await db.query(`
      SELECT v.id, v.userId, v.shopName, v.verified, u.name 
      FROM vendors v
      JOIN users u ON v.userId = u.id
    `);
    
    console.log(`📋 VENDEURS (${vendors.length}):`);
    vendors.forEach(v => {
      console.log(`   Vendor ID: ${v.id} | User ID: ${v.userId} | ${v.shopName} | ${v.name} | Vérifié: ${v.verified ? '✅' : '❌'}`);
    });

    console.log('\n');

    // Vérifier les posts
    const posts = await db.query(`
      SELECT p.id, p.vendorId, p.productName, p.status, v.shopName
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      ORDER BY p.createdAt DESC
      LIMIT 10
    `);
    
    console.log(`📋 POSTS (${posts.length}):`);
    posts.forEach(p => {
      console.log(`   ID: ${p.id} | Vendor: ${p.vendorId} (${p.shopName || '?'}) | ${p.productName} | Statut: ${p.status}`);
    });

    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit();
  }
}

checkDatabase();