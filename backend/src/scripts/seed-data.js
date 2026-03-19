const db = require('../src/models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  console.log('🌱 Ajout de données de test...\n');

  try {
    // 1. Créer un utilisateur admin
    console.log('📝 Création admin...');
    const adminId = uuidv4().replace(/-/g, '').substring(0, 10);
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    await db.query(
      `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'admin', NOW(), NOW())
       ON DUPLICATE KEY UPDATE id = id`,
      [adminId, 'مدير المنصة', 'admin@turath.tn', hashedPassword]
    );
    console.log(`✅ Admin créé avec ID: ${adminId}`);

    // 2. Créer un utilisateur vendeur
    console.log('\n📝 Création vendeur...');
    const vendorUserId = uuidv4().replace(/-/g, '').substring(0, 10);
    const vendorPassword = await bcrypt.hash('123456', 10);
    
    await db.query(
      `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'vendor', NOW(), NOW())
       ON DUPLICATE KEY UPDATE id = id`,
      [vendorUserId, 'محمد الفخراني', 'vendor@test.tn', vendorPassword]
    );
    console.log(`✅ Utilisateur vendeur créé avec ID: ${vendorUserId}`);

    // 3. Créer le profil vendeur
    console.log('\n📝 Création profil vendeur...');
    const vendorId = uuidv4().replace(/-/g, '').substring(0, 10);
    
    await db.query(
      `INSERT INTO vendors (id, userId, shopName, specialty, description, location, verified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE id = id`,
      [vendorId, vendorUserId, 'فخاريات الفخراني', 'pottery', 'فخار تونسي تقليدي أصيل', 'مدنين']
    );
    console.log(`✅ Vendeur créé avec ID: ${vendorId}`);

    // 4. Créer des posts
    console.log('\n📝 Création posts...');
    
    const post1Id = uuidv4().replace(/-/g, '').substring(0, 10);
    await db.query(
      `INSERT INTO posts (id, vendorId, productName, description, price, images, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'approved', NOW(), NOW())`,
      [post1Id, vendorId, 'طبق فخاري مزخرف', 'طبق فخاري تقليدي مصنوع يدوياً', 45, JSON.stringify(['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'])]
    );
    console.log(`✅ Post 1 créé avec ID: ${post1Id}`);

    const post2Id = uuidv4().replace(/-/g, '').substring(0, 10);
    await db.query(
      `INSERT INTO posts (id, vendorId, productName, description, price, images, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'approved', NOW(), NOW())`,
      [post2Id, vendorId, 'زير فخاري كبير', 'زير فخاري تقليدي لحفظ الماء', 120, JSON.stringify(['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'])]
    );
    console.log(`✅ Post 2 créé avec ID: ${post2Id}`);

    // 5. Créer un utilisateur client
    console.log('\n📝 Création client...');
    const clientId = uuidv4().replace(/-/g, '').substring(0, 10);
    const clientPassword = await bcrypt.hash('123456', 10);
    
    await db.query(
      `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'customer', NOW(), NOW())
       ON DUPLICATE KEY UPDATE id = id`,
      [clientId, 'عميل تجريبي', 'client@test.tn', clientPassword]
    );
    console.log(`✅ Client créé avec ID: ${clientId}`);

    console.log('\n🎉 Données de test ajoutées avec succès !');
    console.log('\n📧 Identifiants de test:');
    console.log('   Admin: admin@turath.tn / Admin@123456');
    console.log('   Vendeur: vendor@test.tn / 123456');
    console.log('   Client: client@test.tn / 123456');
    console.log(`\n🆔 Vendor ID: ${vendorId}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit();
  }
}

seedData();