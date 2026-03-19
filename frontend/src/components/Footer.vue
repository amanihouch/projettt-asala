<!-- frontend/src/components/Footer.vue -->
<template>
  <footer class="footer" :class="{ 'dark-mode': isDarkMode }">
    <!-- Dark Mode Toggle Button -->
    <button class="dark-mode-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'">
      <span class="toggle-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
    </button>

    <!-- Wave decoration -->
    <div class="footer-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#08717f" fill-opacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>

    <div class="footer-content">
      <div class="container">
        <!-- Main Footer -->
        <div class="footer-main">
          <!-- Logo & Info -->
          <div class="footer-section brand-section">
            <router-link to="/" class="footer-logo">
              <div class="logo-icon">
                <img src="@/assets/asala logo.svg" alt="أصالة" class="logo-svg" />
              </div>
              <span class="logo-text">أصالة</span>
            </router-link>
            <p class="footer-description">
              منصة الحرف اليدوية التونسية الأصيلة، حيث تلتقي أصالة الماضي بإبداع الحاضر
            </p>

            <!-- Social Media avec animations -->
            <div class="social-wrapper">
              <h4 class="social-title">تواصل معنا</h4>
              <div class="social-grid">
                <a href="https://facebook.com" target="_blank" class="social-btn facebook" title="فيسبوك">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" class="social-btn instagram" title="انستغرام">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://youtube.com" target="_blank" class="social-btn youtube" title="يوتيوب">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="currentColor"/>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" class="social-btn twitter" title="تويتر">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://pinterest.com" target="_blank" class="social-btn pinterest" title="بينتريست">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 0a12 12 0 0 0-4.5 23.1 10 10 0 0 1 .1-3.2l1.4-5.5a4 4 0 0 1-.4-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-.9 3.9a1.7 1.7 0 0 0 1.7 2.1c2.1 0 3.7-2.2 3.7-5.4 0-2.8-2-4.8-5-4.8a5.2 5.2 0 0 0-5.4 5.2 4.7 4.7 0 0 0 .9 2.8.4.4 0 0 1 .1.4c0 .2-.1.5-.2.6-.1.2-.2.2-.4.1-1.4-.6-2.3-2.5-2.3-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.8-2.4 6.8-5.7 6.8a3 3 0 0 1-2.6-1.3l-.7 2.7a11 11 0 0 1-1.3 2.7A12 12 0 1 0 12 0z" fill="currentColor"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-emoji">📞</span>
                <a href="tel:+21612345678">+216 12 345 678</a>
              </div>
              <div class="contact-item">
                <span class="contact-emoji">✉️</span>
                <a href="mailto:contact@asala.tn">contact@asala.tn</a>
              </div>
              <div class="contact-item">
                <span class="contact-emoji">📍</span>
                <span>تونس العاصمة</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h3 class="footer-title">
              <span class="title-icon">🔗</span>
              روابط سريعة
            </h3>
            <ul class="footer-links">
              <li><router-link to="/products" class="red-hover">المنتجات</router-link></li>
              <li><router-link to="/artisans" class="green-hover">الحرفيون</router-link></li>
              <li><router-link to="/about" class="red-hover">من نحن</router-link></li>
              <li><router-link to="/contact" class="green-hover">اتصل بنا</router-link></li>
              <li><router-link to="/blog" class="red-hover">المدونة</router-link></li>
            </ul>
          </div>

          <!-- Categories -->
          <div class="footer-section">
            <h3 class="footer-title">
              <span class="title-icon">🏷️</span>
              التصنيفات
            </h3>
            <div class="categories-grid">
              <router-link to="/products?category=textiles" class="category-chip red-chip">
                <span>🧵</span>
                <span>سجاد</span>
              </router-link>
              <router-link to="/products?category=pottery" class="category-chip green-chip">
                <span>🏺</span>
                <span>فخار</span>
              </router-link>
              <router-link to="/products?category=jewelry" class="category-chip red-chip">
                <span>💍</span>
                <span>مجوهرات</span>
              </router-link>
              <router-link to="/products?category=clothing" class="category-chip green-chip">
                <span>👗</span>
                <span>ملابس</span>
              </router-link>
              <router-link to="/products?category=woodwork" class="category-chip red-chip">
                <span>🪵</span>
                <span>خشب</span>
              </router-link>
              <router-link to="/products?category=metalwork" class="category-chip green-chip">
                <span>⚒️</span>
                <span>نحاس</span>
              </router-link>
              <router-link to="/products?category=perfumes" class="category-chip red-chip">
                <span>🌸</span>
                <span>عطور</span>
              </router-link>
              <router-link to="/products?category=decoration" class="category-chip green-chip">
                <span>✨</span>
                <span>ديكور</span>
              </router-link>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="footer-section newsletter-section">
            <h3 class="footer-title">
              <span class="title-icon">📧</span>
              النشرة البريدية
            </h3>
            <p class="newsletter-text">
              اشترك لتصلك أحدث العروض والمنتجات الحرفية
            </p>

            <!-- Message de notification -->
            <div v-if="message" class="newsletter-message" :class="messageType">
              {{ message }}
            </div>

            <form @submit.prevent="subscribeNewsletter" class="newsletter-form-enhanced">
              <div class="input-group">
                <input
                  type="email"
                  v-model="email"
                  placeholder="بريدك الإلكتروني"
                  :disabled="loading"
                  required
                />
                <button type="submit" :disabled="loading" class="red-gradient-btn">
                  <span v-if="!loading">اشترك</span>
                  <span v-else class="loading-spinner-small"></span>
                </button>
              </div>
            </form>

            <div class="newsletter-features">
              <div class="feature red-feature">
                <span class="feature-icon">🎁</span>
                <span class="feature-text">عروض حصرية</span>
              </div>
              <div class="feature green-feature">
                <span class="feature-icon">📦</span>
                <span class="feature-text">منتجات جديدة</span>
              </div>
              <div class="feature red-feature">
                <span class="feature-icon">💝</span>
                <span class="feature-text">هدايا مجانية</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="copyright">
            <p>© 2026 أصالة - جميع الحقوق محفوظة</p>
          </div>
          <div class="footer-bottom-links">
            <router-link to="/privacy" class="red-link">سياسة الخصوصية</router-link>
            <span class="dot">•</span>
            <router-link to="/terms" class="green-link">الشروط والأحكام</router-link>
            <span class="dot">•</span>
            <router-link to="/shipping" class="red-link">الشحن والتوصيل</router-link>
            <span class="dot">•</span>
            <router-link to="/faq" class="green-link">الأسئلة الشائعة</router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const isDarkMode = ref(false)

// Charger la préférence depuis localStorage
onMounted(() => {
  const savedMode = localStorage.getItem('footer-dark-mode')
  if (savedMode !== null) {
    isDarkMode.value = savedMode === 'true'
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('footer-dark-mode', isDarkMode.value)
}

const subscribeNewsletter = async () => {
  if (!email.value) {
    showMessage('الرجاء إدخال البريد الإلكتروني', 'error')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    showMessage('بريد إلكتروني غير صحيح', 'error')
    return
  }

  loading.value = true
  console.log('📧 Abonnement newsletter:', email.value)

  try {
    const response = await api.post('/newsletter/subscribe', {
      email: email.value
    })

    console.log('📦 Réponse newsletter:', response.data)

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      email.value = ''
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    console.error('❌ Erreur newsletter:', error)
    showMessage(error.response?.data?.message || 'حدث خطأ', 'error')
  } finally {
    loading.value = false
  }
}

const showMessage = (msg, type) => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>

<style scoped>
.footer {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #334155;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  border-top: 1px solid rgba(8, 113, 127, 0.1);
  transition: all 0.3s ease;
}

/* ===== MODE SOMBRE ===== */
.footer.dark-mode {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #e0e0e0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-mode .footer-description,
.dark-mode .footer-links a,
.dark-mode .contact-item,
.dark-mode .contact-item a,
.dark-mode .feature-text,
.dark-mode .newsletter-text,
.dark-mode .copyright p,
.dark-mode .footer-bottom-links a {
  color: #b0b0b0;
}

.dark-mode .footer-title {
  color: #ffffff;
}

.dark-mode .social-title {
  color: #e0e0e0;
}

.dark-mode .social-btn {
  background: #333 !important;
  color: #e0e0e0 !important;
}

.dark-mode .social-btn:hover {
  filter: brightness(1.2);
}

.dark-mode .category-chip {
  background: #2a2a2a;
  border-color: #444;
  color: #ccc;
}

.dark-mode .category-chip:hover {
  color: white;
}

.dark-mode .newsletter-section {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .input-group {
  background: #2a2a2a;
  border-color: #444;
}

.dark-mode .input-group input {
  color: #e0e0e0;
  background: transparent;
}

.dark-mode .input-group input::placeholder {
  color: #666;
}

.dark-mode .red-gradient-btn {
  background: linear-gradient(135deg, #b00020, #8b0000);
}

.dark-mode .footer-bottom {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .title-icon,
.dark-mode .contact-emoji {
  background: #333;
  color: #e0e0e0;
}

.dark-mode .dot {
  color: #444;
}

.dark-mode .logo-text {
  background: linear-gradient(135deg, #0a94a6, #ff1744);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-mode .newsletter-message.success {
  background: #1e3a2a;
  color: #a3d8b0;
  border-color: #2a5a3a;
}

.dark-mode .newsletter-message.error {
  background: #3a1e1e;
  color: #ffb3b3;
  border-color: #5a2a2a;
}

/* ===== BOUTON DE BASCULE MODE SOMBRE ===== */
.dark-mode-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
  border-color: #08717f;
}

.dark-mode .dark-mode-toggle {
  background: #2d2d2d;
  border-color: #444;
}

.dark-mode .dark-mode-toggle:hover {
  border-color: #d40025;
}

.toggle-icon {
  font-size: 1.2rem;
}

/* Wave decoration */
.footer-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: rotate(180deg);
}

.footer-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 60px;
}

.dark-mode .footer-wave svg path {
  fill: #1a1a1a;
  fill-opacity: 0.3;
}

.footer-content {
  position: relative;
  padding: 3rem 0 1.5rem;
  z-index: 2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Main Footer Grid */
.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Logo Section - Agrandi */
.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #08717f, #d40025);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-5deg);
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(212, 0, 37, 0.2);
}

.logo-icon:hover {
  transform: rotate(0deg) scale(1.15);
  box-shadow: 0 15px 30px rgba(8, 113, 127, 0.3);
}

.logo-svg {
  width: 45px;
  height: 45px;
  filter: brightness(0) invert(1);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.logo-text {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-description {
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

/* Social Section */
.social-wrapper {
  margin-bottom: 1.5rem;
}

.social-title {
  font-size: 0.9rem;
  color: #1e293b;
  margin-bottom: 0.8rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.social-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.social-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.social-btn.facebook {
  background: #1877f2;
  color: white;
}

.social-btn.instagram {
  background: linear-gradient(45deg, #f09433, #d62976, #962fbf);
  color: white;
}

.social-btn.youtube {
  background: #ff0000;
  color: white;
}

.social-btn.twitter {
  background: #1da1f2;
  color: white;
}

.social-btn.pinterest {
  background: #e60023;
  color: white;
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.contact-emoji {
  font-size: 1rem;
  width: 24px;
  height: 24px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.contact-item a {
  color: #475569;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: #08717f;
}

/* Footer Titles */
.footer-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.title-icon {
  font-size: 1.1rem;
  background: #f1f5f9;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* Links avec couleurs */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.6rem;
}

.footer-links a {
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  padding-right: 0;
}

.footer-links a::before {
  content: '←';
  position: absolute;
  right: -15px;
  opacity: 0;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  transform: translateX(-5px);
  padding-right: 5px;
}

.footer-links a:hover::before {
  opacity: 1;
}

/* Couleurs rouges et vertes pour les liens */
.red-hover {
  color: #d40025;
}

.red-hover::before {
  color: #d40025;
}

.red-hover:hover {
  color: #a0001c;
}

.green-hover {
  color: #2e7d32;
}

.green-hover::before {
  color: #2e7d32;
}

.green-hover:hover {
  color: #1b5e20;
}

.dark-mode .red-hover {
  color: #ff6b6b;
}

.dark-mode .red-hover:hover {
  color: #ff4444;
}

.dark-mode .green-hover {
  color: #6b9e6b;
}

.dark-mode .green-hover:hover {
  color: #4caf50;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-chip span:first-child {
  font-size: 0.9rem;
}

/* Chips rouges */
.red-chip {
  color: #d40025;
  border-color: #ffcdd2;
}

.red-chip:hover {
  background: linear-gradient(135deg, #d40025, #a0001c);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.2);
}

/* Chips vertes */
.green-chip {
  color: #2e7d32;
  border-color: #c8e6c9;
}

.green-chip:hover {
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 125, 50, 0.2);
}

.dark-mode .red-chip {
  color: #ff6b6b;
  border-color: #5a2a2a;
  background: #2a1a1a;
}

.dark-mode .green-chip {
  color: #6b9e6b;
  border-color: #1e3a2a;
  background: #1a2a1a;
}

/* Newsletter Section */
.newsletter-section {
  background: rgba(8, 113, 127, 0.03);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(8, 113, 127, 0.1);
  transition: all 0.3s ease;
}

.newsletter-text {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.newsletter-form-enhanced {
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.3rem;
  border-radius: 50px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #d40025;
  box-shadow: 0 0 0 3px rgba(212, 0, 37, 0.1);
}

.input-group input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  outline: none;
  color: #1e293b;
}

.input-group input::placeholder {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Bouton avec dégradé rouge */
.red-gradient-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #d40025, #a0001c);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.red-gradient-btn:hover:not(:disabled) {
  transform: translateX(-2px);
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.3);
}

.red-gradient-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #d40025, #a0001c);
}

.loading-spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Newsletter Features avec couleurs */
.newsletter-features {
  display: flex;
  gap: 0.8rem;
  justify-content: space-around;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.feature-icon {
  font-size: 1.1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.feature-text {
  font-size: 0.65rem;
  font-weight: 500;
}

.red-feature .feature-text {
  color: #d40025;
}

.green-feature .feature-text {
  color: #2e7d32;
}

.red-feature .feature-icon {
  color: #d40025;
}

.green-feature .feature-icon {
  color: #2e7d32;
}

.dark-mode .red-feature .feature-text,
.dark-mode .red-feature .feature-icon {
  color: #ff6b6b;
}

.dark-mode .green-feature .feature-text,
.dark-mode .green-feature .feature-icon {
  color: #6b9e6b;
}

/* Footer Bottom avec couleurs */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(8, 113, 127, 0.1);
  font-size: 0.75rem;
  transition: border-color 0.3s ease;
}

.copyright p {
  color: #64748b;
  margin: 0;
  transition: color 0.3s ease;
}

.footer-bottom-links {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.footer-bottom-links a {
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.75rem;
}

.red-link {
  color: #d40025;
}

.red-link:hover {
  color: #a0001c;
  text-decoration: underline;
}

.green-link {
  color: #2e7d32;
}

.green-link:hover {
  color: #1b5e20;
  text-decoration: underline;
}

.dark-mode .red-link {
  color: #ff6b6b;
}

.dark-mode .red-link:hover {
  color: #ff4444;
}

.dark-mode .green-link {
  color: #6b9e6b;
}

.dark-mode .green-link:hover {
  color: #4caf50;
}

.dot {
  color: #cbd5e1;
  font-size: 0.5rem;
  transition: color 0.3s ease;
}

/* Newsletter Message */
.newsletter-message {
  font-size: 0.8rem;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.newsletter-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.newsletter-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 0 1rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .brand-section {
    text-align: center;
  }

  .footer-logo {
    justify-content: center;
  }

  .social-grid {
    justify-content: center;
  }

  .contact-item {
    justify-content: center;
  }

  .footer-title {
    justify-content: center;
  }

  .footer-links a:hover {
    transform: translateX(0);
    padding-right: 0;
  }

  .footer-links a::before {
    display: none;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
  }

  .dark-mode-toggle {
    top: 10px;
    left: 10px;
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .newsletter-section {
    padding: 1rem;
  }

  .input-group {
    flex-direction: column;
    background: transparent;
    border: none;
    padding: 0;
  }

  .input-group input {
    border: 2px solid #e2e8f0;
    border-radius: 30px;
    padding: 0.8rem 1rem;
  }

  .input-group button {
    width: 100%;
    padding: 0.8rem;
  }

  .newsletter-features {
    flex-wrap: wrap;
  }

  .footer-bottom-links {
    flex-direction: column;
    gap: 0.3rem;
  }

  .dot {
    display: none;
  }
}
</style>
