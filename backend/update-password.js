// update-password.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turath_ikbel'
  });

  // Mot de passe simple pour tester
  const password = 'test123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Mot de passe:', password);
  console.log('Hash généré:', hashedPassword);
  
  // Mettre à jour pour client@test.tn
  await connection.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, 'client@test.tn']
  );
  
  console.log('✅ Mot de passe mis à jour pour client@test.tn');
  
  // Mettre à jour aussi pour d'autres emails si nécessaire
  const emails = ['admin@turath.tn', 'vendor1@test.tn', 'sara@test.tn'];
  for (const email of emails) {
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
  }
  
  await connection.end();
}

updatePassword().catch(console.error);