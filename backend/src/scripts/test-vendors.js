const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testVendors() {
  console.log('🔍 Test de l\'API des vendeurs...\n');

  // Tester GET /vendors
  console.log('📡 GET /vendors');
  http.get(`${BASE_URL}/vendors`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log(`   ✅ Succès: ${result.data?.vendors?.length || 0} vendeurs trouvés`);
        } catch (e) {
          console.log('   ❌ Erreur parsing JSON');
        }
      } else {
        console.log(`   ❌ Erreur: ${data}`);
      }
      console.log();
      
      // Tester GET /vendors/1
      console.log('📡 GET /vendors/1');
      http.get(`${BASE_URL}/vendors/1`, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log(`   Status: ${res2.statusCode}`);
          if (res2.statusCode === 200) {
            console.log('   ✅ Vendeur trouvé');
          } else if (res2.statusCode === 404) {
            console.log('   ⚠️ Vendeur non trouvé (normal si ID 1 n\'existe pas)');
          } else {
            console.log(`   ❌ Erreur: ${data2}`);
          }
          console.log('\n✅ Test terminé');
        });
      });
    });
  }).on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
    console.log('💡 Assurez-vous que le serveur est démarré sur http://localhost:5000');
  });
}

testVendors();