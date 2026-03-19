// generate-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'client123';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Mot de passe:', password);
  console.log('Nouveau hash:', hash);
  
  // Tester le hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Test de comparaison:', isValid);
}

generateHash();