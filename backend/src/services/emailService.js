// backend/src/services/emailService.js - Version COMPLÈTE
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    try {
      // Vérifier les variables d'environnement (utiliser SMTP_USER et SMTP_PASS)
      const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
      const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
      const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
      
      if (!emailUser || !emailPass) {
        console.warn('⚠️ Configuration email manquante dans .env');
        console.warn('📧 Les emails ne seront pas envoyés');
        console.warn('   Veuillez configurer SMTP_USER et SMTP_PASS');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      console.log('✅ Service email ASALA initialisé avec:', {
        host: emailHost,
        port: emailPort,
        user: emailUser
      });
    } catch (error) {
      console.error('❌ Erreur initialisation email ASALA:', error);
    }
  }

  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Transporteur non initialisé' };
    }

    try {
      await this.transporter.verify();
      console.log('✅ Connexion SMTP ASALA établie avec succès');
      return { success: true, message: 'Connexion SMTP OK' };
    } catch (error) {
      console.error('❌ Erreur de connexion SMTP ASALA:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== NOUVEAU : Email de bienvenue après inscription =====
  async sendWelcomeEmail(userEmail, userName, shopName) {
    if (!this.transporter) {
      console.error('❌ Transporteur email non initialisé');
      return { success: false, error: 'Email service not initialized' };
    }

    if (!userEmail || !userEmail.includes('@')) {
      console.error('❌ Email invalide:', userEmail);
      return { success: false, error: 'Invalid recipient email' };
    }

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = '📝 تأكيد طلب التسجيل كبائع - ASALA';
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد طلب التسجيل - ASALA</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            background: #f5f7fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #08717f, #065a69);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .info-box {
            background: #f0fdf4;
            border-right: 4px solid #08717f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .pending-badge {
            display: inline-block;
            background: #fef3c7;
            color: #d97706;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin: 10px 0;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .asala-signature {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 تأكيد طلب التسجيل</h1>
            <p>ASALA</p>
          </div>
          <div class="content">
            <div class="greeting">
              <strong>السلام عليكم ${userName}،</strong>
            </div>
            <p>شكراً لتسجيلك في منصة <strong>ASALA</strong>.</p>
            <div class="info-box">
              <p><strong>🏪 ${shopName}</strong></p>
              <p>تم استلام طلب التسجيل كبائع بنجاح.</p>
            </div>
            <div style="text-align: center;">
              <span class="pending-badge">⏳ قيد المراجعة</span>
            </div>
            <p>سيتم مراجعة طلبك من قبل الإدارة في أقرب وقت ممكن.</p>
            <p>📧 سنقوم بإشعارك عبر البريد الإلكتروني فور قبول الطلب.</p>
            <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
              ⏱️ وقت المراجعة المتوقع: 24-48 ساعة
            </p>
            <div class="asala-signature">
              <p>✨ ASALA - منصة التراث والتقاليد التونسية ✨</p>
            </div>
          </div>
          <div class="footer">
            <p>ASALA | منصة الحرف اليدوية التونسية</p>
            <p>لأي استفسار، تواصل معنا على support@asala.tn</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`📧 ASALA: Envoi email de bienvenue à: ${userEmail}`);
      const info = await this.transporter.sendMail({
        from: `"ASALA" <${emailUser}>`,
        to: userEmail,
        subject: subject,
        html: html,
      });
      console.log('✅ ASALA: Email de bienvenue envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ ASALA: Erreur envoi email bienvenue:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendVendorApprovalEmail(vendorEmail, vendorName, shopName) {
    if (!this.transporter) {
      console.error('❌ Transporteur email ASALA non initialisé');
      console.log('📧 Email non envoyé - Service email non configuré');
      return { success: false, error: 'Email service not initialized' };
    }

    if (!vendorEmail || !vendorEmail.includes('@')) {
      console.error('❌ Email invalide:', vendorEmail);
      return { success: false, error: 'Invalid recipient email' };
    }

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = '🎉 تم قبول طلب التسجيل كبائع - ASALA';
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تم قبول طلب التسجيل - ASALA</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #08717f, #065a69);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .shop-name {
            background: #f0fdf4;
            border-right: 4px solid #08717f;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .shop-name h3 { margin: 0 0 5px; color: #08717f; }
          .shop-name p { margin: 0; color: #475569; }
          .features {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .features h3 { color: #1e293b; margin-top: 0; margin-bottom: 15px; }
          .features ul { padding-right: 20px; margin: 0; }
          .features li { margin: 10px 0; color: #475569; }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #08717f, #065a69);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .asala-signature {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 مرحباً بك في ASALA</h1>
            <p>تم قبول طلب التسجيل كبائع</p>
          </div>
          <div class="content">
            <div class="greeting">
              <strong>السيد/السيدة ${vendorName}،</strong>
            </div>
            <p>يسرنا أن نعلن قبول طلب التسجيل الخاص بك كبائع في منصة <strong>ASALA</strong>.</p>
            <div class="shop-name">
              <h3>🏪 ${shopName}</h3>
              <p>تم تفعيل متجرك بنجاح وأصبح بإمكانك الآن عرض منتجاتك الفريدة.</p>
            </div>
            <div class="features">
              <h3>✨ ما يمكنك فعله الآن:</h3>
              <ul>
                <li>📦 إضافة منتجاتك وعرضها للبيع</li>
                <li>📝 إنشاء منشورات للمنتجات الحرفية</li>
                <li>💬 التواصل مع العملاء المهتمين</li>
                <li>📊 متابعة الطلبات وإدارة المخزون</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="${frontendUrl}/vendor/dashboard" class="button">
                🚀 اذهب إلى لوحة التحكم
              </a>
            </div>
            <div class="asala-signature">
              <p>✨ ASALA - منصة التراث والتقاليد التونسية ✨</p>
            </div>
          </div>
          <div class="footer">
            <p>ASALA | منصة الحرف اليدوية التونسية</p>
            <p>لأي استفسار، تواصل معنا على support@asala.tn</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`📧 ASALA: Envoi email d'approbation à: ${vendorEmail}`);
      const info = await this.transporter.sendMail({
        from: `"ASALA" <${emailUser}>`,
        to: vendorEmail,
        subject: subject,
        html: html,
      });
      console.log('✅ ASALA: Email envoyé avec succès:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ ASALA: Erreur envoi email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendVendorRejectionEmail(vendorEmail, vendorName, shopName, reason) {
    if (!this.transporter) {
      return { success: false, error: 'Email service not initialized' };
    }

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = '📝 تحديث بخصوص طلب التسجيل كبائع - ASALA';
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تحديث طلب التسجيل - ASALA</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', sans-serif;
            background: #f5f7fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .reason-box {
            background: #fef2f2;
            border-right: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .reason-box p { margin: 5px 0 0; color: #991b1b; }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #08717f, #065a69);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 تحديث طلب التسجيل</h1>
            <p>ASALA</p>
          </div>
          <div class="content">
            <div class="greeting">
              <strong>السيد/السيدة ${vendorName}،</strong>
            </div>
            <p>نشكرك على اهتمامك بالانضمام إلى منصة <strong>ASALA</strong>.</p>
            <p>بعد دراسة طلب التسجيل الخاص بمتجر "<strong>${shopName}</strong>"، نأسف لإبلاغك بأنه لم يتم قبوله.</p>
            <div class="reason-box">
              <strong>📝 سبب الرفض:</strong>
              <p>${reason || 'لم يتم تحديد سبب محدد'}</p>
            </div>
            <p>يمكنك إعادة تقديم طلبك بعد مراجعة المعلومات المطلوبة.</p>
            <div style="text-align: center;">
              <a href="${frontendUrl}/vendor/register" class="button">
                📝 إعادة تقديم الطلب
              </a>
            </div>
          </div>
          <div class="footer">
            <p>ASALA | منصة الحرف اليدوية التونسية</p>
            <p>لأي استفسار، تواصل معنا على support@asala.tn</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`📧 ASALA: Envoi email de refus à: ${vendorEmail}`);
      const info = await this.transporter.sendMail({
        from: `"ASALA" <${emailUser}>`,
        to: vendorEmail,
        subject: subject,
        html: html,
      });
      console.log('✅ ASALA: Email de refus envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ ASALA: Erreur envoi email de refus:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();