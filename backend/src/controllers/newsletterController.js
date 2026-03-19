// backend/src/controllers/newsletterController.js
const Newsletter = require('../models/Newsletter');
const { sendNewsletterEmail } = require('../services/email');

// ===== S'ABONNER À LA NEWSLETTER =====
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation de base
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'بريد إلكتروني غير صحيح'
      });
    }

    // Nettoyer l'email
    const cleanEmail = email.toLowerCase().trim();

    // Appel au modèle pour l'abonnement
    const result = await Newsletter.subscribe(cleanEmail);

    // Envoyer email de bienvenue si l'abonnement a réussi
    if (result.success) {
      try {
        // Envoyer email de bienvenue
        await sendNewsletterEmail(cleanEmail, 'welcome');
        console.log(`✅ Email de bienvenue envoyé à ${cleanEmail}`);
      } catch (emailError) {
        console.error('❌ Erreur envoi email bienvenue:', emailError);
        // On ne bloque pas la réponse même si l'email échoue
      }
    }

    // Réponse au client
    res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.message,
      isNew: result.isNew || false
    });

  } catch (error) {
    console.error('❌ Erreur subscribe:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ===== SE DÉSABONNER DE LA NEWSLETTER =====
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }

    // Nettoyer l'email
    const cleanEmail = email.toLowerCase().trim();

    // Appel au modèle pour le désabonnement
    const result = await Newsletter.unsubscribe(cleanEmail);

    res.json({
      success: result,
      message: result 
        ? 'تم إلغاء الاشتراك بنجاح' 
        : 'البريد الإلكتروني غير موجود'
    });

  } catch (error) {
    console.error('❌ Erreur unsubscribe:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ===== RÉCUPÉRER LA LISTE DES ABONNÉS (admin uniquement) =====
exports.getSubscribers = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بهذه العملية'
      });
    }

    const subscribers = await Newsletter.getActiveEmails();
    const total = await Newsletter.countSubscribers();

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur getSubscribers:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ===== ENVOYER UNE CAMPAGNE NEWSLETTER (admin uniquement) =====
exports.sendNewsletter = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بهذه العملية'
      });
    }

    const { subject, content, testEmail } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'الموضوع والمحتوى مطلوبان'
      });
    }

    // Mode test : envoyer seulement à une adresse test
    if (testEmail) {
      try {
        await sendNewsletterEmail(testEmail, 'campaign', { subject, content });
        return res.json({
          success: true,
          message: `تم إرسال النشرة التجريبية إلى ${testEmail}`,
          data: { sent: 1, total: 1, mode: 'test' }
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `فشل إرسال النشرة التجريبية: ${error.message}`
        });
      }
    }

    // Mode production : envoyer à tous les abonnés
    const subscribers = await Newsletter.getActiveEmails();
    const emails = subscribers.map(s => s.email);

    if (emails.length === 0) {
      return res.json({
        success: true,
        message: 'لا يوجد مشتركين حالياً',
        data: { sent: 0, total: 0 }
      });
    }

    // Envoyer à tous les abonnés
    let sentCount = 0;
    const errors = [];

    for (const email of emails) {
      try {
        await sendNewsletterEmail(email, 'campaign', { subject, content });
        sentCount++;
        // Petite pause pour ne pas surcharger le serveur SMTP
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Erreur envoi à ${email}:`, error);
        errors.push({ email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `تم إرسال النشرة إلى ${sentCount} من ${emails.length} مشترك`,
      data: { 
        sent: sentCount, 
        total: emails.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Erreur sendNewsletter:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ===== STATISTIQUES DE LA NEWSLETTER (admin uniquement) =====
exports.getNewsletterStats = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بهذه العملية'
      });
    }

    const stats = await Newsletter.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Erreur getNewsletterStats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// ===== SUPPRIMER UN ABONNÉ (admin uniquement) =====
exports.deleteSubscriber = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بهذه العملية'
      });
    }

    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }

    const result = await Newsletter.delete(email);

    res.json({
      success: result,
      message: result 
        ? 'تم حذف الاشتراك بنجاح' 
        : 'البريد الإلكتروني غير موجود'
    });

  } catch (error) {
    console.error('❌ Erreur deleteSubscriber:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};