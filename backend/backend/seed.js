// backend/seed.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const seedDatabase = async () => {
  let connection;
  
  try {
    // Connect without database to create it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Read and execute schema.sql
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (let stmt of statements) {
      if (stmt.trim()) {
        await connection.execute(stmt);
      }
    }

    console.log('✅ Schéma de base de données créé');

    // Switch to the database
    await connection.changeUser({ database: process.env.DB_NAME });

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [process.env.ADMIN_EMAIL]
    );

    if (existingAdmin.length === 0) {
      await connection.execute(
        `INSERT INTO users (name, email, password, role, email_verified, is_active) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hashedPassword, 'admin', 1, 1]
      );
      console.log('✅ Admin créé:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️ Admin existe déjà');
    }

    console.log('🎉 Base de données initialisée avec succès!');
    console.log('📧 Admin:', process.env.ADMIN_EMAIL);
    console.log('🔑 Mot de passe:', process.env.ADMIN_PASSWORD);

  } catch (error) {
    console.error('❌ Erreur seed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
};

seedDatabase();