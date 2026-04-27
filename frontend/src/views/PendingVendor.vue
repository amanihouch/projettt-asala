<!-- src/views/PendingVendor.vue - POP-UP NOIR GRAND FORMAT -->
<template>
  <div class="pending-popup-overlay">
    <div class="pending-popup" dir="rtl">
      <!-- Bouton fermer -->
      <button class="popup-close" @click="goToHome" title="إغلاق">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Logo -->
      <div class="popup-logo">
        <img src="/src/assets/asala logo.svg" alt="أصالة" class="logo-img" />
      </div>

      <!-- Icône succès -->
      <div class="popup-icon">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="icon-sparkles">
          <span class="sparkle sparkle-1">✦</span>
          <span class="sparkle sparkle-2">✧</span>
          <span class="sparkle sparkle-3">✦</span>
          <span class="sparkle sparkle-4">✧</span>
        </div>
      </div>

      <!-- Titre -->
      <h2 class="popup-title">تم إنشاء الحساب بنجاح</h2>
      <p class="popup-subtitle">طلبك قيد المراجعة من قبل الإدارة</p>

      <!-- Message -->
      <div class="popup-message">
        <span class="message-emoji">⏳</span>
        <p>
          نرجو منكم التكرّم بالانتظار ريثما تقوم الإدارة بمراجعة طلبكم والموافقة عليه في غضون
          <strong class="text-gold">24 ساعة</strong>.
        </p>
      </div>

      <!-- ✅ SECTION EMAIL AVEC IMAGE -->
      <div class="popup-email-section">
        <div class="email-image-wrapper">
          <img
            src="/src/assets/img12.jpeg"
            alt="Success"
            class="email-image"
            @error="(e) => e.target.style.display = 'none'"
          />
          <div class="email-image-glow"></div>
        </div>
        <div class="email-content">
          <div class="email-icon-row">
            <span class="email-emoji">📧</span>
            <p class="email-text">سيتم إشعاركم عبر البريد الإلكتروني</p>
          </div>
          <strong class="email-highlight">{{ userEmail }}</strong>
          <p class="email-subtext">فور إتمام عملية التفعيل</p>
        </div>
      </div>

      <!-- Contact -->
      <div class="popup-contact">
        <div class="contact-row">
          <span class="contact-emoji">📧</span>
          <span>للتواصل مع الإدارة</span>
        </div>
        <a href="mailto:infinty.tunisia@gmail.com" class="contact-link">
          infinty.tunisia@gmail.com
        </a>
        <p class="contact-hint">
          في حال عدم تلقيكم لأي رد، يُرجى التواصل معنا عبر البريد الإلكتروني أعلاه.
        </p>
      </div>

      <!-- Bouton -->
      <button @click="goToHome" class="popup-btn">
        <span class="btn-icon">🏠</span>
        <span>العودة إلى الصفحة الرئيسية</span>
        <span class="btn-arrow">←</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const userEmail = ref('')

onMounted(() => {
  userEmail.value = authStore.user?.email || authStore.userEmail || 'بريدك الإلكتروني'
  document.body.style.overflow = 'hidden'

  if (authStore.userRole !== 'pending') {
    router.push('/')
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const goToHome = () => {
  document.body.style.overflow = ''
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* ===== OVERLAY ===== */
.pending-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 30px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== POPUP ===== */
.pending-popup {
  position: relative;
  background: linear-gradient(160deg, #030303 0%, #0a0a0f 25%, #111827 50%, #0f0f1a 75%, #050510 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 36px;
  padding: 55px 40px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow:
    0 40px 100px rgba(0, 0, 0, 0.7),
    0 0 150px rgba(8, 113, 127, 0.08),
    0 0 60px rgba(8, 113, 127, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  direction: rtl;
  font-family: 'Amiri', 'Cairo', serif;
  max-height: 92vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== SCROLLBAR ===== */
.pending-popup::-webkit-scrollbar {
  width: 4px;
}
.pending-popup::-webkit-scrollbar-track {
  background: transparent;
}
.pending-popup::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* ===== BOUTON FERMER ===== */
.popup-close {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  transition: all 0.3s ease;
  z-index: 10;
}

.popup-close svg {
  width: 20px;
  height: 20px;
}

.popup-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
  transform: rotate(90deg);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
}

/* ===== LOGO ===== */
.popup-logo {
  margin-bottom: 28px;
}

.logo-img {
  height: 60px;
  width: auto;
  filter: brightness(1.3) drop-shadow(0 0 15px rgba(8, 113, 127, 0.4));
  transition: all 0.3s ease;
}

.logo-img:hover {
  filter: brightness(1.5) drop-shadow(0 0 25px rgba(8, 113, 127, 0.6));
}

/* ===== ICÔNE SUCCÈS ===== */
.popup-icon {
  margin-bottom: 22px;
  display: flex;
  justify-content: center;
  position: relative;
}

.icon-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669, #047857);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.6s ease 0.1s both;
  box-shadow:
    0 0 60px rgba(16, 185, 129, 0.3),
    0 0 120px rgba(16, 185, 129, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.icon-circle svg {
  width: 42px;
  height: 42px;
  stroke: white;
}

@keyframes scaleIn {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.15) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* ===== SPARKLES ===== */
.icon-sparkles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  color: #fbbf24;
  font-size: 1.2rem;
  animation: sparkleFloat 2s ease-in-out infinite;
  opacity: 0;
}

.sparkle-1 { top: 0; left: 50%; animation-delay: 0s; }
.sparkle-2 { top: 50%; right: 0; animation-delay: 0.5s; }
.sparkle-3 { bottom: 0; left: 50%; animation-delay: 1s; }
.sparkle-4 { top: 50%; left: 0; animation-delay: 1.5s; }

@keyframes sparkleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px) scale(1.1);
  }
}

/* ===== TITRES ===== */
.popup-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 6px;
  font-family: 'Amiri', serif;
  letter-spacing: 0.5px;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

.popup-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 28px;
  letter-spacing: 0.3px;
}

/* ===== MESSAGE ===== */
.popup-message {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 22px 20px;
  margin-bottom: 20px;
  text-align: right;
  transition: all 0.3s ease;
}

.popup-message:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.message-emoji {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 14px;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.popup-message p {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 2;
  margin: 0;
}

.text-gold {
  color: #fbbf24;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

/* ===== SECTION EMAIL AVEC IMAGE ===== */
.popup-email-section {
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(8, 113, 127, 0.08);
  border: 1px solid rgba(8, 113, 127, 0.15);
  border-radius: 20px;
  padding: 22px 20px;
  margin-bottom: 20px;
  text-align: right;
  transition: all 0.3s ease;
}

.popup-email-section:hover {
  background: rgba(8, 113, 127, 0.12);
  border-color: rgba(8, 113, 127, 0.25);
  box-shadow: 0 0 30px rgba(8, 113, 127, 0.08);
}

.email-image-wrapper {
  position: relative;
  flex-shrink: 0;
}

.email-image {
  width: 65px;
  height: 65px;
  border-radius: 16px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 25px rgba(8, 113, 127, 0.2);
  transition: all 0.3s ease;
}

.email-image:hover {
  transform: scale(1.05);
  box-shadow: 0 0 35px rgba(8, 113, 127, 0.35);
}

.email-image-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: transparent;
  box-shadow: 0 0 20px rgba(8, 113, 127, 0.15);
  pointer-events: none;
}

.email-content {
  flex: 1;
}

.email-icon-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
}

.email-emoji {
  font-size: 1.2rem;
}

.email-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.email-highlight {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2dd4bf;
  margin-bottom: 4px;
  word-break: break-all;
  text-shadow: 0 0 15px rgba(45, 212, 191, 0.2);
}

.email-subtext {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* ===== CONTACT ===== */
.popup-contact {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 28px;
  transition: all 0.3s ease;
}

.popup-contact:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.contact-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
}

.contact-emoji {
  font-size: 1.1rem;
}

.contact-link {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #60a5fa;
  text-decoration: none;
  direction: ltr;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  text-shadow: 0 0 15px rgba(96, 165, 250, 0.2);
}

.contact-link:hover {
  color: #93c5fd;
  text-decoration: underline;
  text-shadow: 0 0 25px rgba(96, 165, 250, 0.4);
}

.contact-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.7;
  margin: 0;
}

/* ===== BOUTON ===== */
.popup-btn {
  width: 100%;
  padding: 18px 28px;
  background: linear-gradient(135deg, #08717f, #065a69, #044a54);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
  letter-spacing: 0.5px;
  box-shadow:
    0 8px 30px rgba(8, 113, 127, 0.25),
    0 0 50px rgba(8, 113, 127, 0.08);
}

.popup-btn:hover {
  background: linear-gradient(135deg, #0891a2, #08717f, #065a69);
  transform: translateY(-3px);
  box-shadow:
    0 12px 40px rgba(8, 113, 127, 0.4),
    0 0 80px rgba(8, 113, 127, 0.15);
  gap: 16px;
}

.popup-btn:active {
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.popup-btn:hover .btn-arrow {
  transform: translateX(-4px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .pending-popup-overlay {
    padding: 16px;
  }

  .pending-popup {
    padding: 40px 24px 28px;
    border-radius: 28px;
  }

  .popup-title {
    font-size: 1.6rem;
  }

  .popup-subtitle {
    font-size: 0.95rem;
  }

  .icon-circle {
    width: 72px;
    height: 72px;
  }

  .icon-circle svg {
    width: 34px;
    height: 34px;
  }

  .popup-email-section {
    flex-direction: column;
    text-align: center;
  }

  .email-image {
    width: 55px;
    height: 55px;
    margin-bottom: 8px;
  }

  .email-content {
    text-align: center;
  }

  .email-icon-row {
    justify-content: center;
  }

  .popup-btn {
    font-size: 1rem;
    padding: 16px 20px;
  }
}

@media (max-width: 380px) {
  .pending-popup {
    padding: 30px 16px 20px;
  }

  .popup-title {
    font-size: 1.4rem;
  }

  .logo-img {
    height: 45px;
  }
}
</style>
