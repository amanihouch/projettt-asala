// backend/src/services/emailService.js - VERSION COMPLÈTE CORRIGÉE (ENCODAGE FIXÉ)
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    try {
      const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
      const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
      const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
      
      if (!emailUser || !emailPass) {
        console.warn('⚠️ Configuration email manquante dans .env');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailHost, port: emailPort, secure: emailPort === 465,
        auth: { user: emailUser, pass: emailPass },
        tls: { rejectUnauthorized: false }
      });
      
      console.log('✅ Service email ASALA initialisé avec:', { host: emailHost, port: emailPort, user: emailUser });
    } catch (error) {
      console.error('❌ Erreur initialisation email:', error);
    }
  }

  async testConnection() {
    if (!this.transporter) return { success: false, error: 'Transporteur non initialisé' };
    try { await this.transporter.verify(); console.log('✅ Connexion SMTP OK'); return { success: true, message: 'OK' }; }
    catch (error) { return { success: false, error: error.message }; }
  }

  // ===== EMAIL DE BIENVENUE (INSCRIPTION VENDEUR) =====
  async sendWelcomeEmail(userEmail, userName, shopName) {
    if (!this.transporter) return { success: false, error: 'Email service not initialized' };
    if (!userEmail || !userEmail.includes('@')) return { success: false, error: 'Invalid email' };
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const subject = '📝 تأكيد طلب التسجيل كبائع - ASALA';
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}.header{background:linear-gradient(135deg,#08717f,#065a69);color:#fff;padding:30px;text-align:center}.content{padding:30px}.info-box{background:#f0fdf4;border-right:4px solid #08717f;padding:15px;margin:20px 0;border-radius:8px}.pending-badge{display:inline-block;background:#fef3c7;color:#d97706;padding:5px 15px;border-radius:20px}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}</style></head><body><div class="container"><div class="header"><h1>📝 تأكيد طلب التسجيل</h1><p>ASALA</p></div><div class="content"><div class="greeting"><strong>السلام عليكم ${userName}،</strong></div><p>شكراً لتسجيلك في منصة <strong>ASALA</strong>.</p><div class="info-box"><p><strong>🏪 ${shopName}</strong></p><p>تم استلام طلب التسجيل كبائع بنجاح.</p></div><div style="text-align:center"><span class="pending-badge">⏳ قيد المراجعة</span></div><p>سيتم مراجعة طلبك من قبل الإدارة في أقرب وقت ممكن.</p><p>📧 سنقوم بإشعارك عبر البريد الإلكتروني فور قبول الطلب.</p></div><div class="footer"><p>ASALA | منصة الحرف اليدوية التونسية</p></div></div></body></html>`;
    try {
      const info = await this.transporter.sendMail({ from: `"ASALA" <${emailUser}>`, to: userEmail, subject, html });
      console.log('✅ Email bienvenue envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) { return { success: false, error: error.message }; }
  }

  // ===== EMAIL D'APPROBATION VENDEUR =====
  async sendVendorApprovalEmail(vendorEmail, vendorName, shopName) {
    if (!this.transporter) return { success: false, error: 'Email service not initialized' };
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const subject = '🎉 تم قبول طلب التسجيل كبائع - ASALA';
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px}.header{background:linear-gradient(135deg,#08717f,#065a69);color:#fff;padding:30px;text-align:center}.content{padding:30px}.shop-name{background:#f0fdf4;border-right:4px solid #08717f;padding:15px;margin:20px 0}.button{display:inline-block;background:#08717f;color:#fff!important;text-decoration:none;padding:12px 30px;border-radius:30px;font-weight:600}</style></head><body><div class="container"><div class="header"><h1>🎉 مرحباً بك في ASALA</h1></div><div class="content"><div class="greeting"><strong>السيد/السيدة ${vendorName}،</strong></div><p>تم قبول طلب التسجيل كبائع!</p><div class="shop-name"><h3>🏪 ${shopName}</h3></div><div style="text-align:center"><a href="${frontendUrl}/vendor/dashboard" class="button">🚀 لوحة التحكم</a></div></div></div></body></html>`;
    try {
      const info = await this.transporter.sendMail({ from: `"ASALA" <${emailUser}>`, to: vendorEmail, subject, html });
      console.log('✅ Email approbation envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) { return { success: false, error: error.message }; }
  }

  // ===== EMAIL DE REFUS VENDEUR =====
  async sendVendorRejectionEmail(vendorEmail, vendorName, shopName, reason) {
    if (!this.transporter) return { success: false, error: 'Email service not initialized' };
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const subject = '📝 تحديث بخصوص طلب التسجيل - ASALA';
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px}.header{background:#dc2626;color:#fff;padding:30px;text-align:center}.content{padding:30px}.reason-box{background:#fef2f2;border-right:4px solid #dc2626;padding:15px;margin:20px 0}.button{display:inline-block;background:#08717f;color:#fff!important;text-decoration:none;padding:12px 30px;border-radius:30px;font-weight:600}</style></head><body><div class="container"><div class="header"><h1>📝 تحديث طلب التسجيل</h1></div><div class="content"><div class="greeting"><strong>السيد/السيدة ${vendorName}،</strong></div><p>بعد دراسة طلب التسجيل لمتجر "<strong>${shopName}</strong>"، لم يتم قبوله.</p><div class="reason-box"><strong>سبب الرفض:</strong><p>${reason || 'غير محدد'}</p></div><div style="text-align:center"><a href="${frontendUrl}/vendor/register" class="button">📝 إعادة التقديم</a></div></div></div></body></html>`;
    try {
      const info = await this.transporter.sendMail({ from: `"ASALA" <${emailUser}>`, to: vendorEmail, subject, html });
      console.log('✅ Email refus envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) { return { success: false, error: error.message }; }
  }



  // ===== 📧 EMAIL CODE DE VÉRIFICATION (6 CHIFFRES) - CORRIGÉ =====
  async sendVerificationCode(userEmail, userName, code) {
    if (!this.transporter) {
      console.error('❌ Service email non configuré');
      return { success: false, error: 'Service email non configuré' };
    }

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const subject = `=${subject}?utf-8?B?${Buffer.from('🔐 رمز التحقق - ASALA', 'utf-8').toString('base64')}?=`;

    const mailOptions = {
      from: {
        name: 'ASALA',
        address: emailUser
      },
      to: userEmail,
      subject: '🔐 رمز التحقق - ASALA',
      replyTo: emailUser,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Transfer-Encoding': 'base64'
      },
      html: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد البريد الإلكتروني</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Amiri:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Amiri', 'Tahoma', sans-serif;
      background: #f5f7fa;
      padding: 30px;
      direction: rtl;
      -webkit-text-size-adjust: 100%;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #08717f, #065a69);
      color: #ffffff;
      padding: 35px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .header p {
      font-size: 0.9rem;
      opacity: 0.9;
      font-family: 'Amiri', serif;
    }
    .body {
      padding: 35px 30px;
      text-align: center;
    }
    .greeting {
      font-size: 1.1rem;
      color: #1e293b;
      margin-bottom: 20px;
      font-family: 'Amiri', serif;
    }
    .code-box {
      background: #f0fdf4;
      border: 2px dashed #10b981;
      border-radius: 16px;
      padding: 25px 20px;
      margin: 25px 0;
      text-align: center;
    }
    .code {
      font-size: 3rem;
      font-weight: 900;
      color: #08717f;
      letter-spacing: 10px;
      font-family: 'Courier New', 'Consolas', monospace;
      direction: ltr;
      display: inline-block;
    }
    .timer {
      color: #64748b;
      font-size: 0.85rem;
      margin-top: 10px;
      font-family: 'Amiri', serif;
    }
    .warning {
      background: #fffbeb;
      border-right: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 12px;
      color: #92400e;
      font-size: 0.8rem;
      text-align: right;
      margin-top: 20px;
      font-family: 'Amiri', serif;
    }
    .footer {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      font-family: 'Amiri', serif;
    }
    .footer strong {
      color: #08717f;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 تأكيد البريد الإلكتروني</h1>
      <p>ASALA | منصة الحرف اليدوية التونسية</p>
    </div>
    <div class="body">
      <div class="greeting">
        <strong>السلام عليكم ${userName || 'المستخدم'}،</strong>
      </div>
      <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">
        شكراً لتسجيلك في منصة <strong>ASALA</strong>!<br>
        رمز التحقق الخاص بك هو:
      </p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="timer">⏱️ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط</p>
      <div class="warning">
        <strong>⚠️ تنبيه:</strong><br>
        إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
      </div>
    </div>
    <div class="footer">
      <p>© 2025 <strong>ASALA</strong> - جميع الحقوق محفوظة</p>
      <p>منصة الحرف اليدوية التونسية</p>
    </div>
  </div>
</body>
</html>`,
      text: `السلام عليكم ${userName || 'المستخدم'}،\n\nرمز التحقق الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق.\n\nASALA - منصة الحرف اليدوية التونسية`
    };

    try {
      console.log(`📧 Envoi code à: ${userEmail}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Code envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi code:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();