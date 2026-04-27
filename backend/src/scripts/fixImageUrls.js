// backend/scripts/fixImageUrls.js
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Asala123!',
  database: 'turath_ikbel'
};

async function fixImageUrls() {
  console.log('🔧 Correction des URLs d\'images...\n');
  
  let connection;
  let vendorsUpdated = 0;
  let usersUpdated = 0;
  let productsUpdated = 0;
  let postsUpdated = 0;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à la base de données\n');

    // 1. Vérifier la structure de la table vendors
    console.log('📌 1. Vérification de la table vendors...');
    const [vendorColumns] = await connection.execute('DESCRIBE vendors');
    const vendorColumnNames = vendorColumns.map(col => col.Field);
    console.log('   Colonnes vendors:', vendorColumnNames.join(', '));
    console.log('');

    // 2. Vérifier la structure de la table users
    console.log('📌 2. Vérification de la table users...');
    const [userColumns] = await connection.execute('DESCRIBE users');
    const userColumnNames = userColumns.map(col => col.Field);
    console.log('   Colonnes users:', userColumnNames.join(', '));
    console.log('');

    // 3. Vérifier la structure de la table products
    console.log('📌 3. Vérification de la table products...');
    const [productColumns] = await connection.execute('DESCRIBE products');
    const productColumnNames = productColumns.map(col => col.Field);
    console.log('   Colonnes products:', productColumnNames.join(', '));
    console.log('');

    // 4. Vérifier la structure de la table posts
    console.log('📌 4. Vérification de la table posts...');
    const [postColumns] = await connection.execute('DESCRIBE posts');
    const postColumnNames = postColumns.map(col => col.Field);
    console.log('   Colonnes posts:', postColumnNames.join(', '));
    console.log('');

    // 5. Correction des coverImage des vendeurs
    console.log('📌 5. Correction des coverImage des vendeurs...');
    
    const [vendors] = await connection.execute(`
      SELECT id, shopName, coverImage FROM vendors 
      WHERE coverImage IS NOT NULL AND coverImage != ''
    `);

    console.log(`   📊 ${vendors.length} vendeurs avec coverImage trouvés`);
    
    for (const vendor of vendors) {
      let cleanUrl = vendor.coverImage;
      let needsUpdate = false;
      
      if (cleanUrl && (cleanUrl.includes('\\') || cleanUrl.includes('C:'))) {
        cleanUrl = cleanUrl.replace(/\\/g, '/');
        cleanUrl = cleanUrl.replace(/^.*[\\/]uploads/, '/uploads');
        needsUpdate = true;
        console.log(`   ✅ coverImage corrigé pour ${vendor.shopName || vendor.id}`);
      }
      
      if (needsUpdate) {
        await connection.execute(
          'UPDATE vendors SET coverImage = ? WHERE id = ?',
          [cleanUrl, vendor.id]
        );
        vendorsUpdated++;
      }
    }
    console.log(`   ✅ ${vendorsUpdated} vendeurs mis à jour\n`);

    // 6. Correction des avatars des utilisateurs
    console.log('📌 6. Correction des avatars des utilisateurs...');
    
    const [users] = await connection.execute(`
      SELECT id, name, avatar FROM users 
      WHERE avatar IS NOT NULL AND avatar != ''
    `);

    console.log(`   📊 ${users.length} utilisateurs avec avatar trouvés`);
    
    for (const user of users) {
      let cleanAvatar = user.avatar;
      let needsUpdate = false;
      
      if (cleanAvatar && (cleanAvatar.includes('\\') || cleanAvatar.includes('C:'))) {
        cleanAvatar = cleanAvatar.replace(/\\/g, '/');
        cleanAvatar = cleanAvatar.replace(/^.*[\\/]uploads/, '/uploads');
        needsUpdate = true;
        console.log(`   ✅ Avatar corrigé pour ${user.name || user.id}`);
      }
      
      if (needsUpdate) {
        await connection.execute(
          'UPDATE users SET avatar = ? WHERE id = ?',
          [cleanAvatar, user.id]
        );
        usersUpdated++;
      }
    }
    console.log(`   ✅ ${usersUpdated} utilisateurs mis à jour\n`);

    // 7. Correction des images des produits
    console.log('📌 7. Correction des images des produits...');
    
    const [products] = await connection.execute(`
      SELECT id, name, images FROM products 
      WHERE images IS NOT NULL AND images != ''
    `);

    console.log(`   📊 ${products.length} produits avec images trouvés`);
    
    for (const product of products) {
      let needsUpdate = false;
      let cleanedImages = product.images;
      
      if (cleanedImages && typeof cleanedImages === 'string') {
        try {
          let imagesArray = JSON.parse(cleanedImages);
          let updated = false;
          
          const cleaned = imagesArray.map(img => {
            if (img && (img.includes('\\') || img.includes('C:'))) {
              updated = true;
              return img.replace(/\\/g, '/').replace(/^.*[\\/]uploads/, '/uploads');
            }
            return img;
          });
          
          if (updated) {
            cleanedImages = JSON.stringify(cleaned);
            needsUpdate = true;
            console.log(`   ✅ Images corrigées pour ${product.name || product.id}`);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, traiter comme une simple chaîne
          if (cleanedImages.includes('\\') || cleanedImages.includes('C:')) {
            cleanedImages = cleanedImages.replace(/\\/g, '/');
            cleanedImages = cleanedImages.replace(/^.*[\\/]uploads/, '/uploads');
            needsUpdate = true;
            console.log(`   ✅ Image corrigée pour ${product.name || product.id}`);
          }
        }
      }
      
      if (needsUpdate) {
        await connection.execute(
          'UPDATE products SET images = ? WHERE id = ?',
          [cleanedImages, product.id]
        );
        productsUpdated++;
      }
    }
    console.log(`   ✅ ${productsUpdated} produits mis à jour\n`);

    // 8. Correction des images des posts
    console.log('📌 8. Correction des images des posts...');
    
    const [posts] = await connection.execute(`
      SELECT id, images FROM posts 
      WHERE images IS NOT NULL AND images != ''
    `);

    console.log(`   📊 ${posts.length} posts avec images trouvés`);
    
    for (const post of posts) {
      let needsUpdate = false;
      let cleanedImages = post.images;
      
      if (cleanedImages && typeof cleanedImages === 'string') {
        try {
          let imagesArray = JSON.parse(cleanedImages);
          let updated = false;
          
          const cleaned = imagesArray.map(img => {
            if (img && (img.includes('\\') || img.includes('C:'))) {
              updated = true;
              return img.replace(/\\/g, '/').replace(/^.*[\\/]uploads/, '/uploads');
            }
            return img;
          });
          
          if (updated) {
            cleanedImages = JSON.stringify(cleaned);
            needsUpdate = true;
            console.log(`   ✅ Images corrigées pour le post ${post.id}`);
          }
        } catch (e) {
          // Si ce n'est pas du JSON, traiter comme une simple chaîne
          if (cleanedImages.includes('\\') || cleanedImages.includes('C:')) {
            cleanedImages = cleanedImages.replace(/\\/g, '/');
            cleanedImages = cleanedImages.replace(/^.*[\\/]uploads/, '/uploads');
            needsUpdate = true;
            console.log(`   ✅ Image corrigée pour le post ${post.id}`);
          }
        }
      }
      
      if (needsUpdate) {
        await connection.execute(
          'UPDATE posts SET images = ? WHERE id = ?',
          [cleanedImages, post.id]
        );
        postsUpdated++;
      }
    }
    console.log(`   ✅ ${postsUpdated} posts mis à jour\n`);

    // 9. Création des dossiers d'upload (vérification)
    console.log('📌 9. Vérification des dossiers d\'upload...');
    const uploadsDir = path.join(__dirname, '../uploads');
    const subDirs = ['avatars', 'covers', 'products', 'posts'];
    
    for (const subDir of subDirs) {
      const dirPath = path.join(uploadsDir, subDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   ✅ Dossier créé: ${subDir}`);
      } else {
        console.log(`   📁 Dossier existe: ${subDir}`);
      }
    }

    console.log('\n✅ Correction terminée avec succès !');
    
    // 10. Afficher un résumé
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log(`   - Vendeurs mis à jour: ${vendorsUpdated}`);
    console.log(`   - Utilisateurs mis à jour: ${usersUpdated}`);
    console.log(`   - Produits mis à jour: ${productsUpdated}`);
    console.log(`   - Posts mis à jour: ${postsUpdated}`);
    
    if (vendorsUpdated === 0 && usersUpdated === 0 && productsUpdated === 0 && postsUpdated === 0) {
      console.log('\n✨ Toutes les URLs d\'images sont déjà correctes !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Exécuter le script
fixImageUrls();