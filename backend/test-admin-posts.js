// backend/test-admin-posts.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Générer un token admin pour tester
const generateTestToken = () => {
  const payload = {
    id: 1,
    email: 'admin@turath.tn',
    role: 'admin'
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'votre_secret_jwt',
    { expiresIn: '1h' }
  );
  
  console.log('🔑 Token admin de test:');
  console.log(token);
  console.log('\n📝 Pour tester la route:');
  console.log(`curl -X GET http://localhost:5000/api/v1/admin/posts/pending \\
  -H "Authorization: Bearer ${token}"`);
};

generateTestToken();