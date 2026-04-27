/**
 * Email Configuration - ULTRA DESIGN VERSION with Newsletter
 * ASALA - منصة الحرف اليدوية التونسية
 * INFINITY Marketing & Production
 */

const nodemailer = require('nodemailer');

// ============================================
// EMAIL TEMPLATES - DESIGN WAOUW
// ============================================
const EMAIL_TEMPLATES = {
  // ===== قالب استعادة كلمة المرور - تصميم فاخر =====
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
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Tajawal:wght@400;500;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Cairo', 'Tajawal', sans-serif;
            background: linear-gradient(145deg, #0a1929 0%, #1a2b3c 100%);
            margin: 0;
            padding: 40px 20px;
            direction: rtl;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .container {
            max-width: 650px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-radius: 48px;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(8,113,127,0.5);
            overflow: hidden;
            animation: floatIn 0.8s ease;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          @keyframes floatIn {
            0% { opacity: 0; transform: translateY(40px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .header {
            background: linear-gradient(165deg, #08717f 0%, #0a8a9a 30%, #d40025 70%, #ff1a4d 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
            animation: rotate 25s linear infinite;
          }
          
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, transparent, rgba(255,215,0,0.8), white, rgba(255,215,0,0.8), transparent);
            animation: shine 3s infinite;
          }
          
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .header h1 {
            margin: 0;
            font-size: 42px;
            font-weight: 900;
            margin-bottom: 15px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3), 0 0 30px rgba(255,215,0,0.3);
          }
          
          .header p {
            margin: 0;
            opacity: 0.95;
            font-size: 20px;
            font-weight: 600;
            text-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          
          .header-icon {
            font-size: 60px;
            margin-bottom: 20px;
            display: inline-block;
            animation: bounce 2s infinite;
          }
          
          @keyframes bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .content {
            padding: 60px 45px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
          }
          
          .greeting {
            font-size: 28px;
            color: #1e293b;
            margin-bottom: 30px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 15px;
            border-bottom: 3px dashed #08717f;
            padding-bottom: 20px;
          }
          
          .greeting span {
            color: #d40025;
            background: linear-gradient(135deg, #fff1f3, #ffe4e8);
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(212,0,37,0.2);
          }
          
          .message {
            color: #334155;
            line-height: 1.9;
            margin-bottom: 40px;
            font-size: 18px;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 25px;
            border-radius: 30px;
            border-right: 6px solid #08717f;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          
          .code-wrapper {
            background: linear-gradient(145deg, #1a2a3a, #0f1a24);
            border-radius: 40px;
            padding: 45px;
            text-align: center;
            margin: 40px 0;
            position: relative;
            box-shadow: 0 30px 40px -20px rgba(0,0,0,0.5), inset 0 0 30px rgba(8,113,127,0.3);
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          .code-wrapper::before {
            content: '🔐';
            position: absolute;
            top: -25px;
            right: 50%;
            transform: translateX(50%);
            background: linear-gradient(135deg, #08717f, #d40025);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 28px;
            box-shadow: 0 15px 30px rgba(8,113,127,0.4);
            border: 3px solid white;
            z-index: 10;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%,100% { transform: translateX(50%) scale(1); }
            50% { transform: translateX(50%) scale(1.05); }
          }
          
          .code-wrapper::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #08717f, #d40025, #08717f);
            border-radius: 42px;
            z-index: -1;
            animation: borderGlow 3s linear infinite;
          }
          
          @keyframes borderGlow {
            0%,100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          
          .code-label {
            color: rgba(255,255,255,0.7);
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          
          .code {
            font-size: 72px;
            font-weight: 900;
            letter-spacing: 15px;
            color: white;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #1e2f3f, #0a141e);
            padding: 20px 30px;
            border-radius: 30px;
            display: inline-block;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            margin: 15px 0;
            text-shadow: 0 0 20px #08717f;
          }
          
          .timer {
            color: #ffd700;
            font-size: 18px;
            margin-top: 25px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: rgba(0,0,0,0.3);
            padding: 12px 25px;
            border-radius: 50px;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
          }
          
          .timer::before {
            content: '⏳';
            font-size: 22px;
            animation: spin 3s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .instructions {
            background: rgba(8,113,127,0.05);
            border-radius: 30px;
            padding: 30px;
            margin: 40px 0;
            border: 1px solid rgba(8,113,127,0.2);
            backdrop-filter: blur(5px);
          }
          
          .instructions h3 {
            color: #08717f;
            font-size: 24px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .instructions h3::before {
            content: '✨';
            font-size: 28px;
            animation: twinkle 1.5s infinite;
          }
          
          @keyframes twinkle {
            0%,100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
          }
          
          .steps-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .step-item {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid rgba(8,113,127,0.1);
            transition: all 0.3s ease;
          }
          
          .step-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 30px rgba(8,113,127,0.15);
            border-color: #08717f;
          }
          
          .step-number {
            width: 45px;
            height: 45px;
            background: linear-gradient(145deg, #08717f, #065a69);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 22px;
            box-shadow: 0 8px 15px rgba(8,113,127,0.3);
          }
          
          .step-text {
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
            flex: 1;
          }
          
          .warning {
            background: linear-gradient(135deg, #fffbeb, #fff3cd);
            border-right: 6px solid #f97316;
            padding: 22px 28px;
            border-radius: 20px;
            color: #9a3412;
            font-size: 16px;
            margin: 30px 0;
            display: flex;
            align-items: center;
            gap: 15px;
            font-weight: 500;
            box-shadow: 0 10px 25px rgba(249,115,22,0.2);
          }
          
          .warning::before {
            content: '⚠️';
            font-size: 32px;
            animation: shake 2s infinite;
          }
          
          @keyframes shake {
            0%,100% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
          }
          
          .button-container {
            text-align: center;
            margin: 45px 0 25px;
          }
          
          .button-group {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: linear-gradient(145deg, #08717f, #043b44);
            color: white;
            text-decoration: none;
            padding: 20px 45px;
            border-radius: 60px;
            font-weight: 800;
            font-size: 18px;
            transition: all 0.4s ease;
            box-shadow: 0 20px 30px -10px rgba(8,113,127,0.4);
            border: 1px solid rgba(255,255,255,0.2);
            min-width: 250px;
          }
          
          .button:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 30px 40px -10px rgba(8,113,127,0.5);
            background: linear-gradient(145deg, #065a69, #032f35);
          }
          
          .button-secondary {
            background: white;
            color: #08717f;
            border: 2px solid #08717f;
            box-shadow: 0 10px 20px -5px rgba(8,113,127,0.2);
          }
          
          .button-secondary:hover {
            background: #f0f9ff;
            color: #043b44;
          }
          
          .button-icon {
            font-size: 24px;
            animation: wiggle 2s infinite;
          }
          
          @keyframes wiggle {
            0%,100% { transform: rotate(0deg); }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
          }
          
          .footer {
            background: rgba(241,245,249,0.8);
            backdrop-filter: blur(20px);
            padding: 50px 40px;
            text-align: center;
            border-top: 1px solid rgba(8,113,127,0.2);
          }
          
          .social-links {
            margin-bottom: 30px;
            display: flex;
            justify-content: center;
            gap: 15px;
          }
          
          .social-link {
            width: 55px;
            height: 55px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #08717f;
            font-size: 28px;
            transition: all 0.4s ease;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .social-link:hover {
            transform: translateY(-8px) rotate(360deg);
            background: linear-gradient(145deg, #08717f, #d40025);
            color: white;
            box-shadow: 0 20px 30px rgba(8,113,127,0.3);
          }
          
          .footer-text {
            color: #334155;
            font-size: 16px;
            line-height: 1.9;
          }
          
          .footer-text strong {
            color: #08717f;
            font-size: 18px;
            font-weight: 900;
          }
          
          .note {
            color: #64748b;
            font-size: 13px;
            margin-top: 25px;
            padding-top: 25px;
            border-top: 2px dashed rgba(8,113,127,0.2);
          }
          
          @media (max-width: 768px) {
            .content { padding: 35px 25px; }
            .code { font-size: 48px; letter-spacing: 8px; }
            .steps-grid { grid-template-columns: 1fr; }
            .button-group { flex-direction: column; }
            .button { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🔐</div>
            <h1>استعادة كلمة المرور</h1>
            <p>أصالة - ASALA · منصة الحرف اليدوية التونسية</p>
          </div>
          <div class="content">
            <div class="greeting">مرحباً <span>${name || 'المستخدم'}</span> ✨</div>
            <div class="message">
              <strong>لا تقلق!</strong> نحن هنا لمساعدتك في استعادة الوصول إلى حسابك في <strong>أصالة (ASALA)</strong>.
            </div>
            <div class="code-wrapper">
              <div class="code-label">رمز التحقق الخاص بك</div>
              <div class="code">${code}</div>
              <div class="timer">صالح لمدة 24 ساعة</div>
            </div>
            <div class="instructions">
              <h3>خطوات إعادة تعيين كلمة المرور</h3>
              <div class="steps-grid">
                <div class="step-item"><span class="step-number">١</span><span class="step-text">انسخ الرمز أعلاه</span></div>
                <div class="step-item"><span class="step-number">٢</span><span class="step-text">اضغط على زر إعادة التعيين</span></div>
                <div class="step-item"><span class="step-number">٣</span><span class="step-text">أدخل الرمز في الصفحة</span></div>
                <div class="step-item"><span class="step-number">٤</span><span class="step-text">أدخل كلمة مرور جديدة</span></div>
              </div>
            </div>
            <div class="warning">
              <strong>⚠️ تنبيه أمني:</strong> هذا الرمز صالح لمدة 24 ساعة فقط. لا تشاركه مع أي شخص.
            </div>
            <div class="button-container">
              <div class="button-group">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?code=${code}" class="button">
                  <span class="button-icon">🔐</span> إعادة تعيين كلمة المرور
                </a>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button button-secondary">
                  <span class="button-icon">🏠</span> العودة للرئيسية
                </a>
              </div>
            </div>
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="#" class="social-link">📘</a>
              <a href="#" class="social-link">📷</a>
              <a href="#" class="social-link">🐦</a>
              <a href="#" class="social-link">📱</a>
            </div>
            <div class="footer-text">
              <p>© 2025 <strong>أصالة (ASALA)</strong> - منصة الحرف اليدوية التونسية</p>
            </div>
            <p class="note">هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `✨ أصالة - ASALA ✨\n\nمرحباً ${name || 'المستخدم'} 👋\n\nرمز التحقق: ${code}\n\nصالح لمدة 24 ساعة.\n\nرابط إعادة التعيين:\n${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?code=${code}`
  }),

  // ===== قالب الترحيب =====
  welcome: (name) => ({
    subject: '🎉 مرحباً بك في أصالة - ASALA',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مرحباً بك في أصالة</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
          
          body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(145deg, #0a1929, #1a2b3c);
            padding: 40px 20px;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 48px;
            overflow: hidden;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
            animation: floatIn 0.8s ease;
          }
          
          @keyframes floatIn {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          .header {
            background: linear-gradient(165deg, #08717f, #d40025);
            padding: 60px 40px;
            text-align: center;
            color: white;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
          }
          
          .header h1 { font-size: 48px; margin-bottom: 15px; }
          .header p { font-size: 18px; opacity: 0.9; }
          
          .content {
            padding: 50px 40px;
            text-align: center;
          }
          
          .welcome-icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }
          
          @keyframes bounce {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          
          h2 {
            color: #08717f;
            font-size: 32px;
            margin-bottom: 20px;
          }
          
          p {
            color: #334155;
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          
          .button {
            display: inline-block;
            background: linear-gradient(145deg, #08717f, #065a69);
            color: white;
            padding: 18px 40px;
            border-radius: 60px;
            text-decoration: none;
            font-weight: 700;
            font-size: 18px;
            margin: 20px 0;
            box-shadow: 0 20px 30px -10px rgba(8,113,127,0.4);
            transition: all 0.3s ease;
          }
          
          .button:hover {
            transform: translateY(-5px);
            box-shadow: 0 30px 40px -10px rgba(8,113,127,0.5);
          }
          
          .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 مرحباً بك!</h1>
            <p>أصالة - ASALA · منصة الحرف اليدوية التونسية</p>
          </div>
          <div class="content">
            <div class="welcome-icon">✨</div>
            <h2>${name}</h2>
            <p>نحن سعداء بانضمامك إلى <strong>عائلة أصالة</strong>.<br>استعد لاكتشاف أجمل الحرف اليدوية التونسية.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
              <span>✨ استكشف المنتجات</span>
            </a>
          </div>
          <div class="footer">
            <p>© 2025 أصالة - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ===== قالب تأكيد الطلب =====
  orderConfirmation: (order) => ({
    subject: '✅ تأكيد الطلب - أصالة',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تأكيد الطلب</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Cairo', sans-serif;
            background: #f0f9ff;
            padding: 30px;
            margin: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #08717f, #065a69);
            padding: 40px;
            text-align: center;
            color: white;
          }
          
          .header h1 { font-size: 32px; margin: 0; }
          
          .content {
            padding: 40px;
          }
          
          .order-details {
            background: #f8fafc;
            padding: 25px;
            border-radius: 16px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .total {
            font-size: 20px;
            font-weight: 700;
            color: #d40025;
          }
          
          .button {
            display: inline-block;
            background: #08717f;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ تم تأكيد طلبك</h1>
          </div>
          <div class="content">
            <p>شكراً لك على طلبك! سنقوم بمعالجته في أقرب وقت.</p>
            <div class="order-details">
              <div class="detail-row">
                <span>رقم الطلب:</span>
                <strong>#${order.id || 'N/A'}</strong>
              </div>
              <div class="detail-row">
                <span>التاريخ:</span>
                <strong>${new Date().toLocaleDateString('ar-TN')}</strong>
              </div>
              <div class="detail-row">
                <span>المجموع:</span>
                <strong class="total">${order.total || 0} د.ت</strong>
              </div>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order.id}" class="button">
              تتبع طلبي
            </a>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ===== قالب الترحيب بالنشرة البريدية =====
  newsletterWelcome: (email) => ({
    subject: '🎉 مرحباً بك في نشرة أصالة البريدية',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>مرحباً بك في نشرتنا البريدية</title>
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background: #f8fafc;
            padding: 30px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #08717f, #d40025);
            padding: 40px;
            text-align: center;
            color: white;
          }
          
          .header h1 { font-size: 32px; margin: 0; }
          
          .content {
            padding: 40px;
            text-align: center;
          }
          
          .button {
            display: inline-block;
            background: #08717f;
            color: white;
            padding: 12px 30px;
            border-radius: 30px;
            text-decoration: none;
            margin-top: 20px;
          }
          
          .footer {
            background: #f1f5f9;
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
            <h1>🎉 مرحباً بك!</h1>
          </div>
          <div class="content">
            <p>شكراً لاشتراكك في نشرتنا البريدية</p>
            <p>ستصلك أحدث العروض والمنتجات الحرفية التونسية.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${email}" class="button">
              إلغاء الاشتراك
            </a>
          </div>
          <div class="footer">
            يمكنك إلغاء الاشتراك في أي وقت.
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // ===== قالب حملة النشرة البريدية =====
  newsletterCampaign: (data) => ({
    subject: data.subject || '📧 نشرة أصالة البريدية',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${data.subject || 'نشرة أصالة'}</title>
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background: #f8fafc;
            padding: 30px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #08717f, #d40025);
            padding: 40px;
            text-align: center;
            color: white;
          }
          
          .content {
            padding: 40px;
          }
          
          .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
          }
          
          .unsubscribe {
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 ${data.subject || 'نشرة أصالة'}</h1>
          </div>
          <div class="content">
            ${data.content || ''}
          </div>
          <div class="footer">
            <p class="unsubscribe">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe">إلغاء الاشتراك</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// ============================================
// EMAIL TRANSPORTER
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// ============================================
// VERIFY CONNECTION
// ============================================
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅✨ Email service ready with WAOUW design!');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
};

// ============================================
// SEND EMAIL
// ============================================
const sendEmail = async (to, template) => {
  const mailOptions = {
    from: `"✨ أصالة - ASALA ✨" <${process.env.SMTP_USER}>`,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text || template.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  };

  try {
    console.log(`📧✨ Sending email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development' && nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview:', nodemailer.getTestMessageUrl(info));
    }
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// ============================================
// EMAIL FUNCTIONS
// ============================================
const sendResetPasswordEmail = (email, code, name) => 
  sendEmail(email, EMAIL_TEMPLATES.resetPassword(name, code));

const sendWelcomeEmail = (email, name) => 
  sendEmail(email, EMAIL_TEMPLATES.welcome(name));

const sendOrderConfirmationEmail = (email, order) => 
  sendEmail(email, EMAIL_TEMPLATES.orderConfirmation(order));

const sendNewsletterWelcomeEmail = (email) => 
  sendEmail(email, EMAIL_TEMPLATES.newsletterWelcome(email));

const sendNewsletterCampaign = (email, data) => 
  sendEmail(email, EMAIL_TEMPLATES.newsletterCampaign(data));

// ============================================
// EXPORTS
// ============================================
module.exports = {
  verifyConnection,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendNewsletterWelcomeEmail,
  sendNewsletterCampaign,
  EMAIL_TEMPLATES
};