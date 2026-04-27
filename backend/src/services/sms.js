// backend/src/services/sms.js
const twilio = require('twilio');

// Initialisation de Twilio
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

if (client) {
  console.log('✅ Twilio initialisé');
} else {
  console.log('⚠️ Twilio non configuré - SMS désactivés');
}

/**
 * Formater un numéro tunisien en format international
 * @param {string} phone - Numéro (8 chiffres ou avec +216)
 * @returns {string} Numéro formaté +216XXXXXXXX
 */
const formatPhoneNumber = (phone) => {
  const cleaned = String(phone || '').replace(/\D/g, '');
  
  // 8 chiffres = numéro local tunisien
  if (cleaned.length === 8) {
    return `+216${cleaned}`;
  }
  
  // 11 chiffres commençant par 216
  if (cleaned.startsWith('216') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  
  // Déjà au format +216
  if (String(phone).startsWith('+216') && cleaned.length === 11) {
    return phone;
  }
  
  throw new Error(`Format de numéro tunisien invalide: ${phone}`);
};

/**
 * Envoyer un SMS via Twilio
 * @param {string} to - Numéro du destinataire
 * @param {string} message - Contenu du message
 * @returns {Promise<object>} Résultat de l'envoi
 */
const sendSMS = async (to, message) => {
  // Si Twilio n'est pas configuré, on lance une vraie erreur
  if (!client) {
    throw new Error('Service SMS non configuré');
  }

  const formattedNumber = formatPhoneNumber(to);
  
  console.log(`📱 Envoi SMS à ${formattedNumber}`);
  
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log(`✅ SMS envoyé! SID: ${result.sid}, Status: ${result.status}`);
    
    return { 
      success: true, 
      sid: result.sid,
      status: result.status 
    };
    
  } catch (error) {
    console.error('❌ Erreur Twilio:', error.code, error.message);
    
    // Messages d'erreur traduits
    if (error.code === 21211) {
      throw new Error('رقم الهاتف غير صالح');
    } else if (error.code === 21608) {
      throw new Error('حساب Twilio في وضع التجربة - يجب ترقية الحساب لإرسال SMS لجميع الأرقام');
    } else if (error.code === 21610) {
      throw new Error('لا يمكن إرسال SMS إلى هذا الرقم (STOP)');
    } else if (error.code === 21408) {
      throw new Error('غير مصرح بالإرسال إلى هذا البلد');
    } else if (error.code === 30007) {
      throw new Error('الرسالة طويلة جداً');
    }
    
    throw new Error(`فشل إرسال SMS: ${error.message}`);
  }
};

/**
 * Envoyer un code de vérification
 * @param {string} phone - Numéro de téléphone
 * @param {string} code - Code à 6 chiffres
 */
const sendVerificationCode = async (phone, code) => {
  const message = `🔐 ${code} هو رمز التحقق الخاص بك في توراث. صالح لمدة 10 دقائق.`;
  return sendSMS(phone, message);
};

/**
 * Envoyer une notification de commande
 */
const sendOrderNotification = async (phone, order) => {
  const message = `✅ تم تأكيد طلبك #${order.id}! المجموع: ${order.total} د.ت. شكراً لثقتكم ♥`;
  return sendSMS(phone, message);
};

/**
 * Envoyer une mise à jour de statut
 */
const sendStatusUpdate = async (phone, status) => {
  const statusMessages = {
    pending: '⏳ طلبك قيد الانتظار',
    processing: '⚙️ جاري معالجة طلبك',
    shipped: '📦 تم شحن طلبك!',
    delivered: '✅ تم توصيل طلبك!',
    cancelled: '❌ تم إلغاء طلبك'
  };
  
  const message = statusMessages[status] || `🔄 حالة طلبك: ${status}`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendVerificationCode,
  sendOrderNotification,
  sendStatusUpdate,
  formatPhoneNumber
};