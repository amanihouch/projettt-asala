// backend/src/services/sms.js
const twilio = require('twilio');

// Initialisation de Twilio avec vos identifiants
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Envoyer un SMS via Twilio
 * @param {string} to - Numéro du destinataire (8 chiffres)
 * @param {string} message - Contenu du message
 */
const sendSMS = async (to, message) => {
  try {
    // Formater le numéro (ajouter +216)
    const formattedNumber = to.startsWith('+') ? to : `+216${to}`;
    
    console.log(`📱 Envoi SMS à ${formattedNumber}: ${message}`);

    // Envoyer via Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log(`✅ SMS envoyé! SID: ${result.sid}`);
    console.log(`📱 Statut: ${result.status}`);
    
    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };
    
  } catch (error) {
    console.error('❌ Erreur détaillée Twilio:', error);
    
    // Gestion des erreurs spécifiques
    if (error.code === 21211) {
      console.error('❌ Numéro de téléphone invalide');
    } else if (error.code === 21610) {
      console.error('❌ Ce numéro est sur liste noire');
    } else if (error.code === 30007) {
      console.error('❌ Message trop long');
    }
    
    throw error;
  }
};

/**
 * Envoyer un code de vérification
 * @param {string} phone - Numéro de téléphone (8 chiffres)
 * @param {string} code - Code à 6 chiffres
 */
const sendVerificationCode = async (phone, code) => {
  const message = `🔐 ${code} est votre code de vérification TURATH. Valable 10 minutes.`;
  return sendSMS(phone, message);
};

/**
 * Envoyer une notification de commande
 * @param {string} phone - Numéro de téléphone
 * @param {object} order - Détails de la commande
 */
const sendOrderNotification = async (phone, order) => {
  const message = `✅ Commande #${order.id} confirmée! Total: ${order.total} DT. Merci pour votre confiance ♥`;
  return sendSMS(phone, message);
};

/**
 * Envoyer une mise à jour de statut
 * @param {string} phone - Numéro de téléphone
 * @param {string} status - Nouveau statut
 */
const sendStatusUpdate = async (phone, status) => {
  const statusMessages = {
    pending: '⏳ Votre commande est en attente de validation',
    processing: '⚙️ Votre commande est en cours de traitement',
    shipped: '📦 Votre commande a été expédiée!',
    delivered: '✅ Votre commande a été livrée!',
    cancelled: '❌ Votre commande a été annulée.'
  };
  
  const message = statusMessages[status] || `🔄 Statut de votre commande: ${status}`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendVerificationCode,
  sendOrderNotification,
  sendStatusUpdate
};