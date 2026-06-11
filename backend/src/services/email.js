// backend/src/services/email.js - Version COMPLÈTE CORRIGÉE
const nodemailer = require('nodemailer');

// ============================================
// EMAIL TEMPLATES
// ============================================
const EMAIL_TEMPLATES = {
  // ===== Code de vérification =====
  verificationCode: (name, code) => ({
    subject: '🔐 رمز التحقق - أصالة',
    html: `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>رمز التحقق</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Cairo',sans-serif;background:linear-gradient(145deg,#0a1929,#1a2b3c);padding:40px 20px;direction:rtl;display:flex;align-items:center;justify-content:center;min-height:100vh}
        .container{max-width:500px;margin:0 auto;background:#fff;border-radius:36px;overflow:hidden;box-shadow:0 40px 80px -20px rgba(0,0,0,0.5);animation:floatIn 0.6s ease}
        @keyframes floatIn{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
        .header{background:linear-gradient(165deg,#08717f,#065a69);color:#fff;padding:40px 30px;text-align:center}
        .header h1{font-size:30px;font-weight:900;margin-bottom:8px}
        .content{padding:40px 30px;text-align:center}
        .greeting{font-size:20px;color:#1e293b;margin-bottom:15px;font-weight:700}
        .code-box{background:linear-gradient(145deg,#f0fdf4,#dcfce7);border:2px dashed #08717f;border-radius:20px;padding:30px;margin:25px 0}
        .code{font-size:50px;font-weight:900;letter-spacing:10px;color:#08717f;font-family:'Courier New',monospace}
        .timer{color:#64748b;font-size:13px;margin-top:12px}
        .warning{background:#fffbeb;border-right:4px solid #f59e0b;padding:12px 16px;border-radius:14px;color:#92400e;font-size:13px;margin:20px 0;text-align:right}
        .footer{background:#f8fafc;padding:20px;text-align:center;font-size:11px;color:#94a3b8}
      </style></head>
      <body><div class="container">
        <div class="header"><h1>🔐 تأكيد البريد الإلكتروني</h1><p>أصالة - ASALA</p></div>
        <div class="content">
          <div class="greeting">السلام عليكم ${name || 'المستخدم'}،</div>
          <p style="color:#475569;font-size:15px">رمز التحقق الخاص بك هو:</p>
          <div class="code-box"><div class="code">${code}</div></div>
          <p class="timer">⏱️ صالح لمدة <strong>10 دقائق</strong></p>
          <div class="warning"><strong>⚠️ تنبيه:</strong> إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد.</div>
        </div>
        <div class="footer"><p>© 2025 أصالة - منصة الحرف اليدوية التونسية</p></div>
      </div></body></html>`
  }),

  // ===== Reset Password (version simplifiée pour éviter les erreurs) =====
  resetPassword: (name, code) => ({
    subject: '🔐 استعادة كلمة المرور - أصالة',
    html: `<!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"><title>استعادة كلمة المرور</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        *{margin:0;padding:0}body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:30px}
        .container{max-width:550px;margin:0 auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.1)}
        .header{background:linear-gradient(135deg,#08717f,#d40025);color:#fff;padding:35px;text-align:center}
        .content{padding:35px}
        .code-box{background:#f0fdf4;border:2px dashed #08717f;border-radius:16px;padding:25px;text-align:center;margin:25px 0}
        .code{font-size:48px;font-weight:900;color:#08717f;letter-spacing:8px;font-family:'Courier New',monospace}
        .footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}
      </style></head>
      <body><div class="container">
        <div class="header"><h1>🔐 استعادة كلمة المرور</h1><p>أصالة - ASALA</p></div>
        <div class="content">
          <p style="font-size:18px;color:#1e293b;margin-bottom:15px">مرحباً ${name || 'المستخدم'}،</p>
          <p style="color:#475569;margin-bottom:20px">رمز التحقق الخاص بك هو:</p>
          <div class="code-box"><div class="code">${code}</div></div>
          <p style="color:#64748b;font-size:14px">صالح لمدة 24 ساعة</p>
        </div>
        <div class="footer"><p>© 2025 أصالة - جميع الحقوق محفوظة</p></div>
      </div></body></html>`,
    text: `رمز التحقق: ${code}\nصالح لمدة 24 ساعة`
  }),

  welcome: (name) => ({
    subject: '🎉 مرحباً بك في أصالة - ASALA',
    html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:30px}.container{max-width:500px;margin:0 auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#08717f,#d40025);color:#fff;padding:35px;text-align:center}.content{padding:35px;text-align:center}.button{display:inline-block;background:#08717f;color:#fff!important;padding:14px 30px;border-radius:30px;text-decoration:none;font-weight:700;margin-top:20px}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}</style></head><body><div class="container"><div class="header"><h1>🎉 مرحباً بك!</h1></div><div class="content"><h2>${name}</h2><p>نحن سعداء بانضمامك إلى عائلة أصالة.</p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">✨ استكشف المنتجات</a></div><div class="footer"><p>© 2025 أصالة</p></div></div></body></html>`
  }),

  orderConfirmation: (order) => ({
    subject: '✅ تأكيد الطلب - أصالة',
    html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:30px}.container{max-width:500px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden}.header{background:#08717f;color:#fff;padding:30px;text-align:center}.content{padding:30px}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}</style></head><body><div class="container"><div class="header"><h1>✅ تم تأكيد طلبك</h1></div><div class="content"><p>رقم الطلب: #${order.id || 'N/A'}</p><p>المجموع: ${order.total || 0} د.ت</p></div><div class="footer"><p>© 2025 أصالة</p></div></div></body></html>`
  }),

  newsletterWelcome: (email) => ({
    subject: '🎉 مرحباً بك في نشرة أصالة',
    html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:30px}.container{max-width:500px;margin:0 auto;background:#fff;border-radius:24px}.header{background:linear-gradient(135deg,#08717f,#d40025);color:#fff;padding:30px;text-align:center}.content{padding:30px;text-align:center}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}</style></head><body><div class="container"><div class="header"><h1>🎉 مرحباً بك!</h1></div><div class="content"><p>شكراً لاشتراكك في نشرتنا البريدية</p></div><div class="footer"><p>© 2025 أصالة</p></div></div></body></html>`
  }),

  newsletterCampaign: (data) => ({
    subject: data.subject || '📧 نشرة أصالة',
    html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>body{font-family:'Cairo',sans-serif;background:#f5f7fa;padding:30px}.container{max-width:500px;margin:0 auto;background:#fff;border-radius:24px}.header{background:linear-gradient(135deg,#08717f,#d40025);color:#fff;padding:30px;text-align:center}.content{padding:30px}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b}</style></head><body><div class="container"><div class="header"><h1>${data.subject || 'نشرة أصالة'}</h1></div><div class="content">${data.content || ''}</div><div class="footer"><p>© 2025 أصالة</p></div></div></body></html>`
  })
};

// ============================================
// TRANSPORTER
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

const verifyConnection = async () => {
  try { await transporter.verify(); console.log('✅ Email service ready!'); return true; }
  catch (error) { console.error('❌ Email error:', error.message); return false; }
};

const sendEmail = async (to, template) => {
  const mailOptions = {
    from: `"✨ أصالة - ASALA ✨" <${process.env.SMTP_USER}>`,
    to, subject: template.subject, html: template.html,
    text: template.text || template.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  };
  try {
    console.log(`📧 Sending to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) { console.error('❌ Send error:', error); throw error; }
};

// ===== FONCTIONS =====
const sendResetPasswordEmail = (email, code, name) => sendEmail(email, EMAIL_TEMPLATES.resetPassword(name, code));
const sendWelcomeEmail = (email, name) => sendEmail(email, EMAIL_TEMPLATES.welcome(name));
const sendOrderConfirmationEmail = (email, order) => sendEmail(email, EMAIL_TEMPLATES.orderConfirmation(order));
const sendNewsletterWelcomeEmail = (email) => sendEmail(email, EMAIL_TEMPLATES.newsletterWelcome(email));
const sendNewsletterCampaign = (email, data) => sendEmail(email, EMAIL_TEMPLATES.newsletterCampaign(data));
const sendVerificationCodeEmail = (email, name, code) => sendEmail(email, EMAIL_TEMPLATES.verificationCode(name, code));

const sendContactEmail = async (contactData) => {
  const { name, email, phone, subject, message, timestamp } = contactData;
  const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:25px}.header{border-bottom:3px solid #08717f;padding-bottom:15px;margin-bottom:20px}.header h1{color:#08717f}</style></head><body><div class="container"><div class="header"><h1>📩 رسالة من ${name}</h1><span>${new Date(timestamp).toLocaleString('ar-TN')}</span></div><p><strong>البريد:</strong> ${email}</p>${phone ? `<p><strong>الهاتف:</strong> ${phone}</p>` : ''}<p><strong>الموضوع:</strong> ${subject}</p><div style="background:#f8f9fa;padding:15px;border-right:4px solid #d40025;margin-top:15px"><p>${message.replace(/\n/g,'<br>')}</p></div></div></body></html>`;
  await transporter.sendMail({
    from: `"Turath" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'admin@turath.com',
    subject: `📩 رسالة من ${name} - ${subject}`, html
  });
};

// ===== EXPORTS =====
module.exports = {
  verifyConnection, sendResetPasswordEmail, sendWelcomeEmail,
  sendOrderConfirmationEmail, sendNewsletterWelcomeEmail,
  sendNewsletterCampaign, sendVerificationCodeEmail,
  sendContactEmail, EMAIL_TEMPLATES
};