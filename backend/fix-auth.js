// backend/fix-auth.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAuthentication() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'turath_ikbel'
    });
    
    console.log('✅ Connecté à la base de données\n');

    // 1. Vérifier les utilisateurs existants
    console.log('📋 1. Vérification des utilisateurs...');
    const [users] = await connection.execute(
      'SELECT id, name, email, role, LENGTH(password) as pwd_len FROM users WHERE email IN ("admin@turath.tn", "client@test.tn", "vendor1@test.tn")'
    );
    
    for (const user of users) {
      console.log(`   - ${user.email} (${user.role}) - password length: ${user.pwd_len || 0}`);
    }

    // 2. Mettre à jour le mot de passe admin
    console.log('\n🔐 2. Mise à jour du mot de passe admin...');
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminHash, 'admin@turath.tn']
    );
    console.log(`   ✅ admin@turath.tn -> mot de passe: ${adminPassword}`);

    // 3. Mettre à jour le mot de passe client
    const clientPassword = 'client123';
    const clientHash = await bcrypt.hash(clientPassword, 10);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [clientHash, 'client@test.tn']
    );
    console.log(`   ✅ client@test.tn -> mot de passe: ${clientPassword}`);

    // 4. Mettre à jour le mot de passe vendeur
    const vendorPassword = 'vendor123';
    const vendorHash = await bcrypt.hash(vendorPassword, 10);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [vendorHash, 'vendor1@test.tn']
    );
    console.log(`   ✅ vendor1@test.tn -> mot de passe: ${vendorPassword}`);

    // 5. Vérifier le vendeur avec ID 26
    console.log('\n📊 3. Vérification du vendeur ID 26...');
    const [vendors] = await connection.execute(
      `SELECT v.*, u.email, u.name 
       FROM vendors v 
       JOIN users u ON v.userId = u.id 
       WHERE v.id = 26`
    );
    
    if (vendors.length > 0) {
      const vendor = vendors[0];
      console.log(`   - Nom du magasin: ${vendor.shopName}`);
      console.log(`   - Email vendeur: ${vendor.email}`);
      console.log(`   - Approuvé: ${vendor.approved === 1 ? '✅ Oui' : '❌ Non'}`);
      
      if (vendor.approved !== 1) {
        console.log('\n⚠️ Vendeur non approuvé! Approbation...');
        await connection.execute(
          'UPDATE vendors SET approved = 1, verified = 1 WHERE id = 26'
        );
        console.log('   ✅ Vendeur ID 26 approuvé avec succès!');
      }
    } else {
      console.log('   ❌ Vendeur ID 26 non trouvé');
    }

    // 6. Vérification finale
    console.log('\n🔍 4. Vérification finale...');
    const [testAdmin] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@turath.tn']
    );
    
    if (testAdmin.length > 0) {
      console.log(`   ✅ Admin trouvé: ${testAdmin[0].email} (${testAdmin[0].role})`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ TOUT EST CORRECT !');
    console.log('='.repeat(50));
    console.log('\n🔑 Identifiants de connexion:');
    console.log('   📧 admin@turath.tn  ->  🔑 admin123 (Administrateur)');
    console.log('   📧 client@test.tn   ->  🔑 client123 (Client)');
    console.log('   📧 vendor1@test.tn  ->  🔑 vendor123 (Vendeur)');
    console.log('\n🚀 Vous pouvez maintenant vous connecter !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixAuthentication();