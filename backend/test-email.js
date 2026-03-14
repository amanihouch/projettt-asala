require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour 465, false pour les autres
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false } // pour éviter les erreurs de certificat en dev
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de connexion SMTP :', error);
  } else {
    console.log('✅ Serveur SMTP prêt');
    // Envoyer un email test
    transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: 'admin@turath.tn', // remplacez par un email que vous pouvez vérifier
      subject: 'Test email',
      text: 'Ceci est un test'
    }, (err, info) => {
      if (err) console.error('❌ Erreur envoi :', err);
      else console.log('✅ Email envoyé :', info.response);
    });
  }
});