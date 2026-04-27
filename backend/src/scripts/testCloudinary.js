// backend/src/scripts/testCloudinary.js
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: 'djfj85bwe',
  api_key: '567175143566777',
  api_secret: 'KZ5x16io-jpLDqzDRZN4PmtWc04',
  secure: true
});

async function testCloudinary() {
  console.log('🔍 Test de connexion à Cloudinary...');
  console.log('📁 Cloud name:', cloudinary.config().cloud_name);
  
  try {
    // Test 1: Upload d'une image depuis une URL
    console.log('\n📤 Test 1: Upload d\'une image...');
    const result = await cloudinary.uploader.upload(
      'https://picsum.photos/200/300',
      { folder: 'turath/test' }
    );
    console.log('✅ Upload réussi !');
    console.log('📸 URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    
    // Test 2: Récupération des informations
    console.log('\n📥 Test 2: Récupération des infos...');
    const info = await cloudinary.api.resource(result.public_id);
    console.log('✅ Info récupérée:', {
      width: info.width,
      height: info.height,
      format: info.format,
      bytes: info.bytes
    });
    
    // Test 3: Suppression de l'image
    console.log('\n🗑️ Test 3: Suppression de l\'image...');
    const deleteResult = await cloudinary.uploader.destroy(result.public_id);
    if (deleteResult.result === 'ok') {
      console.log('✅ Image supprimée avec succès');
    } else {
      console.log('⚠️ Résultat suppression:', deleteResult);
    }
    
    console.log('\n🎉 Cloudinary fonctionne parfaitement !');
    
  } catch (error) {
    console.error('❌ Erreur Cloudinary:', error.message);
    if (error.http_code) {
      console.error('📡 Code HTTP:', error.http_code);
    }
  }
}

testCloudinary();