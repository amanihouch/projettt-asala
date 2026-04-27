// backend/test-sms.js
require('dotenv').config();
const { sendSMS } = require('./src/services/sms');

async function testSMS() {
  console.log('📱 Test d\'envoi SMS...');
  console.log('📱 Compte Twilio:', process.env.TWILIO_ACCOUNT_SID);
  console.log('📱 Numéro source:', process.env.TWILIO_PHONE_NUMBER);
  
  // Votre vrai numéro (celui que vous voulez tester)
  const monNumero = '95325920'; // sans le +216
  
  try {
    const result = await sendSMS(
      monNumero,
      '🔐 Test: Votre code de vérification est 123456'
    );
    
    console.log('✅ Résultat:', result);
  } catch (error) {
    console.error('❌ Échec du test:', error.message);
  }
}

testSMS();