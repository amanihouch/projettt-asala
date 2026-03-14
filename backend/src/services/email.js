/**
 * Email Configuration - Enhanced Version
 * ASALA - منصة الحرف اليدوية التونسية
 * INFINITY Marketing & Production
 */

const nodemailer = require('nodemailer');

// قالب البريد الإلكتروني (منفصل للصيانة)
const EMAIL_TEMPLATES = {
  resetPassword: (name, code) => ({
    subject: '🔐 استعادة كلمة المرور - أصالة',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>استعادة كلمة المرور - أصالة</title>
        <style>
          /* (gardez votre style existant) */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 استعادة كلمة المرور</h1>
            <p>أصالة - ASALA</p>
          </div>
          <div class="content">
            <div class="greeting">
              مرحباً <span>${name || 'المستخدم'}</span> 👋
            </div>
            <div class="message">
              لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>أصالة (ASALA)</strong>، منصة الحرف اليدوية التونسية.
            </div>
            <div class="code-wrapper">
              <div class="code-label">رمز التحقق الخاص بك هو:</div>
              <div class="code">${code}</div>
              <div class="timer">⏳ صالح لمدة 24 ساعة</div>
            </div>
            <div class="instructions">
              <h3>📝 خطوات إعادة تعيين كلمة المرور:</h3>
              <p>انسخ الرمز المكون من 6 أرقام</p>
              <p>الصق الرمز في صفحة إعادة تعيين كلمة المرور</p>
              <p>أدخل كلمة مرور جديدة (6 أحرف على الأقل)</p>
              <p>قم بتأكيد كلمة المرور الجديدة</p>
              <p>سيتم تحويلك إلى صفحة تسجيل الدخول</p>
            </div>
            <div class="warning">
              هذا الرمز صالح لمدة 24 ساعة فقط. لا تشاركه مع أي شخص لأسباب أمنية.
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password" class="button">
              إعادة تعيين كلمة المرور
            </a>
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
            </p>
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="#" class="social-link">📘</a>
              <a href="#" class="social-link">📷</a>
              <a href="#" class="social-link">🐦</a>
            </div>
            <p>© 2024 أصالة (ASALA) - منصة الحرف اليدوية التونسية</p>
            <p class="note">هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      أصالة - ASALA
      ================
      
      مرحباً ${name || 'المستخدم'} 👋
      
      لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أصالة (ASALA).
      
      رمز التحقق الخاص بك هو: ${code}
      
      هذا الرمز صالح لمدة 24 ساعة.
      
      خطوات إعادة تعيين كلمة المرور:
      1. انسخ الرمز: ${code}
      2. افتح الرابط: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password
      3. أدخل الرمز
      4. أدخل كلمة مرور جديدة (6 أحرف على الأقل)
      5. قم بتأكيد كلمة المرور
      
      إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
      
      شكراً لك،
      فريق أصالة
      
      © 2024 أصالة (ASALA) - منصة الحرف اليدوية التونسية
    `,
  }),
};

// Configuration du transporteur email
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  
  const config = {
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  };

  if (host.includes('gmail')) config.service = 'gmail';
  else if (host.includes('outlook')) config.service = 'outlook';
  else if (host.includes('yahoo')) config.service = 'yahoo';

  return nodemailer.createTransport(config);
};

const transporter = getTransporter();

// التحقق من الاتصال
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready (SMTP)');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Using ethereal email for testing');
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return testTransporter;
    }
    return false;
  }
};

// إرسال البريد الإلكتروني
const sendEmail = async (to, template, data = {}) => {
  const { subject, html, text } = template;
  
  const mailOptions = {
    from: `"أصالة - ASALA" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// دوال مساعدة لأنواع البريد المختلفة
const sendResetPasswordEmail = async (email, code, name) => {
  const template = EMAIL_TEMPLATES.resetPassword(name, code);
  return sendEmail(email, template);
};

const sendWelcomeEmail = async (email, name) => {
  console.log(`📧 Welcome email would be sent to ${email}`);
};

const sendOrderConfirmationEmail = async (email, orderDetails) => {
  console.log(`📧 Order confirmation email would be sent to ${email}`);
};

module.exports = {
  transporter,
  verifyConnection,
  generateVerificationCode: () => Math.floor(100000 + Math.random() * 900000).toString(),
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  EMAIL_TEMPLATES,
};