// backend/test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('📧 Test d\'envoi d\'email...');
  console.log('📧 SMTP_USER:', process.env.SMTP_USER || 'Non défini');
  
  // Afficher la configuration
  console.log('📧 Configuration:');
  console.log('- Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('- Port:', process.env.SMTP_PORT || 587);
  console.log('- User:', process.env.SMTP_USER || 'Non défini');
  console.log('- Pass:', process.env.SMTP_PASS ? '******' : 'Non défini');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Erreur: SMTP_USER ou SMTP_PASS non définis dans .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Vérifier la connexion
    await transporter.verify();
    console.log('✅ Connexion SMTP établie');

    // Envoyer un email de test
    const info = await transporter.sendMail({
      from: `"Test Newsletter" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Envoyer à vous-même pour tester
      subject: '📧 Test Newsletter - ' + new Date().toLocaleString(),
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="color: #08717f;">✅ Test réussi!</h1>
          <p>La newsletter fonctionne correctement.</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        </body>
        </html>
      `,
    });
    
    console.log('✅ Email envoyé avec succès!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('❌ Erreur d\'authentification: Vérifiez votre mot de passe');
      console.log('   Pour Gmail, utilisez un "Mot de passe d\'application"');
    }
  }
}

testEmail();