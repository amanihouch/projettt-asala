<!-- frontend/src/components/Footer.vue - DESIGN PREMIUM AVEC AMIRI -->
<template>
  <footer class="footer" :class="{ 'dark-mode': isDarkMode }">
    <!-- Wave decoration -->
    <div class="footer-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path fill="currentColor" fill-opacity="0.08" d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,37.3C672,32,768,32,864,37.3C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
      </svg>
    </div>

    <div class="footer-content">
      <div class="container">
        <!-- Footer Main -->
        <div class="footer-main">
          <!-- Brand Section -->
          <div class="footer-section brand-section">
            <div class="logo-wrapper">
              <img src="/src/assets/asala logo.svg" alt="ASALA" class="footer-logo" />
            </div>
            <p class="footer-description">
              منصة الحرف اليدوية التونسية الأصيلة، حيث تلتقي أصالة الماضي بإبداع الحاضر.
              نقدم لكم أفضل المنتجات التقليدية المصنوعة بأيدي حرفيين ماهرين.
            </p>

            <!-- Social Media - Facebook et Instagram uniquement -->
            <div class="social-links">
              <a href="https://facebook.com" target="_blank" class="social-link" title="فيسبوك">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" class="social-link" title="انستغرام">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                  <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                </svg>
              </a>
            </div>

            <!-- Contact Info -->
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 16.92v3a1.999 1.999 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <a href="tel:+21612345678">+216 12 345 678</a>
              </div>
              <div class="contact-item">
                <span class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <a href="mailto:infinity.tunisia@gmail.com">infinity.tunisia@gmail.com</a>
              </div>
              <div class="contact-item">
                <span class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span>تونس العاصمة، تونس</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h3 class="footer-title">
              <span class="title-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </span>
              روابط سريعة
            </h3>
            <ul class="footer-links">
              <li><router-link to="/products">المنتجات</router-link></li>
              <li><router-link to="/artisans">الحرفيون</router-link></li>
              <li><router-link to="/about">من نحن</router-link></li>
              <li><router-link to="/contact">اتصل بنا</router-link></li>
            </ul>
          </div>

          <!-- Categories -->
          <div class="footer-section">
            <h3 class="footer-title">
              <span class="title-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </span>
              التصنيفات
            </h3>
            <div class="categories-list">
              <router-link to="/products?category=textiles">
                <span class="cat-dot"></span>
                سجاد ومنسوجات
              </router-link>
              <router-link to="/products?category=pottery">
                <span class="cat-dot"></span>
                فخار وخزف
              </router-link>
              <router-link to="/products?category=jewelry">
                <span class="cat-dot"></span>
                مجوهرات وحلي
              </router-link>
              <router-link to="/products?category=clothing">
                <span class="cat-dot"></span>
                ملابس تقليدية
              </router-link>
              <router-link to="/products?category=woodwork">
                <span class="cat-dot"></span>
                أشغال خشبية
              </router-link>
              <router-link to="/products?category=metalwork">
                <span class="cat-dot"></span>
                مشغولات نحاسية
              </router-link>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="footer-section">
            <h3 class="footer-title">
              <span class="title-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              ساعات العمل
            </h3>
            <div class="hours-list">
              <div class="hour-item">
                <span class="day">الإثنين - الجمعة</span>
                <span class="time">09:00 - 18:00</span>
              </div>
              <div class="hour-item">
                <span class="day">السبت</span>
                <span class="time">10:00 - 14:00</span>
              </div>
              <div class="hour-item">
                <span class="day">الأحد</span>
                <span class="time">مغلق</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p class="copyright">© 2026 أصالة - جميع الحقوق محفوظة</p>
          <div class="footer-bottom-links">
            <router-link to="/privacy">سياسة الخصوصية</router-link>
            <span class="separator">•</span>
            <router-link to="/terms">الشروط والأحكام</router-link>
            <span class="separator">•</span>
            <router-link to="/shipping">الشحن والتوصيل</router-link>
            <span class="separator">•</span>
            <router-link to="/faq">الأسئلة الشائعة</router-link>
          </div>
          <div class="back-to-top" @click="scrollToTop">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  console.log('Footer mounted, dark mode:', isDarkMode.value)
})
</script>

<style scoped>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.footer {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-top: 1px solid rgba(8, 113, 127, 0.1);
  margin-top: 3rem;
  transition: all 0.3s ease;
  font-family: 'Amiri', 'Cairo', serif;
}

.footer.dark-mode {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-top-color: rgba(8, 113, 127, 0.2);
}

.footer-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.footer-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 50px;
  color: #08717f;
  animation: waveMove 10s ease-in-out infinite;
}

@keyframes waveMove {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-20px);
  }
}

.footer.dark-mode .footer-wave svg {
  color: rgba(8, 113, 127, 0.3);
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

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.2fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.brand-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.logo-wrapper {
  animation: fadeInUp 0.6s ease;
}

.footer-logo {
  height: 45px;
  width: auto;
  transition: transform 0.3s ease;
}

.footer-logo:hover {
  transform: scale(1.05);
}

.footer-description {
  color: #64748b;
  line-height: 1.7;
  font-size: 0.85rem;
  margin: 0;
  max-width: 350px;
  transition: color 0.3s ease;
  animation: fadeInUp 0.6s ease 0.1s both;
}

.footer.dark-mode .footer-description {
  color: #94a3b8;
}

.social-links {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease 0.2s both;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 10px;
  color: #475569;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(8, 113, 127, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.social-link:hover::before {
  width: 100%;
  height: 100%;
}

.footer.dark-mode .social-link {
  background: #1e293b;
  color: #94a3b8;
}

.social-link:hover {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  animation: fadeInUp 0.6s ease 0.3s both;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #475569;
  font-size: 0.85rem;
  transition: transform 0.3s ease;
}

.contact-item:hover {
  transform: translateX(-5px);
}

.footer.dark-mode .contact-item {
  color: #94a3b8;
}

.contact-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #08717f, #d40025);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.contact-icon svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

.contact-item:hover .contact-icon {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(8, 113, 127, 0.3);
}

.contact-item a {
  color: #475569;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer.dark-mode .contact-item a {
  color: #94a3b8;
}

.contact-item a:hover {
  color: #08717f;
}

.footer-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.2rem;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
  font-family: 'Amiri', serif;
}

.footer.dark-mode .footer-title {
  color: #f1f5f9;
}

.title-icon {
  opacity: 0.8;
}

.title-icon svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #08717f, #d40025);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.footer-section:hover .footer-title::after {
  width: 60px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.7rem;
  animation: fadeInUp 0.4s ease both;
}

.footer-links li:nth-child(1) { animation-delay: 0.1s; }
.footer-links li:nth-child(2) { animation-delay: 0.15s; }
.footer-links li:nth-child(3) { animation-delay: 0.2s; }
.footer-links li:nth-child(4) { animation-delay: 0.25s; }

.footer-links a,
.categories-list a {
  text-decoration: none;
  color: #64748b;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.footer.dark-mode .footer-links a,
.footer.dark-mode .categories-list a {
  color: #94a3b8;
}

.footer-links a:hover,
.categories-list a:hover {
  color: #08717f;
  transform: translateX(-5px);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.categories-list a {
  font-size: 0.85rem;
}

.cat-dot {
  width: 6px;
  height: 6px;
  background: #08717f;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.3s ease;
  opacity: 0;
}

.categories-list a:hover .cat-dot {
  opacity: 1;
  transform: scale(1.5);
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.hour-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.3rem 0;
  border-bottom: 1px dashed rgba(8, 113, 127, 0.1);
  transition: all 0.3s ease;
}

.hour-item:hover {
  transform: translateX(-5px);
  border-bottom-color: #08717f;
}

.day {
  color: #1e293b;
  font-weight: 600;
}

.footer.dark-mode .day {
  color: #f1f5f9;
}

.time {
  color: #08717f;
  font-weight: 500;
}

.footer.dark-mode .time {
  color: #2dd4bf;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.75rem;
  position: relative;
}

.footer.dark-mode .footer-bottom {
  border-top-color: #334155;
}

.copyright {
  color: #94a3b8;
  margin: 0;
  transition: color 0.3s ease;
}

.footer.dark-mode .copyright {
  color: #64748b;
}

.footer-bottom-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.footer-bottom-links a {
  text-decoration: none;
  color: #64748b;
  transition: all 0.3s ease;
}

.footer.dark-mode .footer-bottom-links a {
  color: #94a3b8;
}

.footer-bottom-links a:hover {
  color: #08717f;
  transform: translateY(-2px);
}

.separator {
  color: #cbd5e1;
  font-size: 0.5rem;
}

.footer.dark-mode .separator {
  color: #334155;
}

.back-to-top {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.back-to-top:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.4);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.8rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 0 1.5rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 1.8rem;
  }

  .brand-section {
    text-align: center;
    align-items: center;
  }

  .footer-description {
    max-width: 100%;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }

  .contact-info {
    align-items: center;
  }

  .footer-title {
    display: inline-flex;
    justify-content: center;
    text-align: center;
  }

  .footer-title::after {
    right: 50%;
    transform: translateX(50%);
  }

  .footer-links,
  .categories-list {
    text-align: center;
  }

  .footer-links a,
  .categories-list a {
    justify-content: center;
  }

  .footer-links a:hover,
  .categories-list a:hover {
    transform: translateX(0);
  }

  .hour-item {
    justify-content: center;
    gap: 1rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding-bottom: 1rem;
  }

  .footer-bottom-links {
    justify-content: center;
  }

  .back-to-top {
    position: static;
    transform: translateY(0);
    margin-top: 0.5rem;
  }

  .back-to-top:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 480px) {
  .footer-bottom-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .separator {
    display: none;
  }

  .hour-item {
    flex-direction: column;
    gap: 0.3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer,
  .social-link,
  .footer-links a,
  .categories-list a,
  .back-to-top,
  .footer-wave svg {
    transition: none;
    animation: none;
  }

  .social-link::before {
    display: none;
  }
}
/* ============================================
   📱 FOOTER - DESIGN MOBILE COMPLET
   Premium • Moderne • Parfaitement Aligné
============================================ */

/* ----- TABLETTE (max-width: 1024px) ----- */
@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 2rem !important;
  }

  .container {
    padding: 0 24px !important;
  }
}

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== WAVE ===== */
  .footer-wave svg {
    height: 35px !important;
  }

  /* ===== CONTENT ===== */
  .footer-content {
    padding: 2rem 0 1rem !important;
  }

  .container {
    padding: 0 20px !important;
  }

  /* ===== MAIN GRID ===== */
  .footer-main {
    grid-template-columns: 1fr !important;
    gap: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    text-align: center !important;
  }

  /* ===== BRAND SECTION ===== */
  .brand-section {
    text-align: center !important;
    align-items: center !important;
    gap: 1rem !important;
  }

  .logo-wrapper {
    display: flex !important;
    justify-content: center !important;
  }

  .footer-logo {
    height: 40px !important;
    max-width: 140px !important;
  }

  .footer-description {
    max-width: 100% !important;
    text-align: center !important;
    font-size: 14px !important;
    line-height: 1.8 !important;
    padding: 0 10px !important;
  }

  /* ===== SOCIAL LINKS ===== */
  .social-links {
    justify-content: center !important;
    gap: 12px !important;
  }

  .social-link {
    width: 40px !important;
    height: 40px !important;
    border-radius: 12px !important;
  }

  .social-link svg {
    width: 18px !important;
    height: 18px !important;
  }

  /* ===== CONTACT INFO ===== */
  .contact-info {
    align-items: center !important;
    gap: 12px !important;
  }

  .contact-item {
    justify-content: center !important;
    font-size: 14px !important;
    gap: 10px !important;
  }

  .contact-icon {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
    flex-shrink: 0 !important;
  }

  .contact-icon svg {
    width: 16px !important;
    height: 16px !important;
  }

  .contact-item a,
  .contact-item span {
    font-size: 14px !important;
  }

  /* ===== SECTION TITLES ===== */
  .footer-title {
    font-size: 16px !important;
    margin-bottom: 14px !important;
    justify-content: center !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    text-align: center !important;
  }

  .title-icon svg {
    width: 14px !important;
    height: 14px !important;
  }

  .footer-title::after {
    right: 50% !important;
    transform: translateX(50%) !important;
    width: 50px !important;
    height: 3px !important;
    bottom: -6px !important;
  }

  .footer-section:hover .footer-title::after {
    width: 70px !important;
  }

  /* ===== FOOTER LINKS ===== */
  .footer-links {
    list-style: none !important;
    padding: 0 !important;
    margin: 0 !important;
    text-align: center !important;
  }

  .footer-links li {
    margin-bottom: 10px !important;
  }

  .footer-links a,
  .categories-list a {
    font-size: 14px !important;
    justify-content: center !important;
    padding: 6px 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    transition: all 0.2s ease !important;
  }

  .footer-links a:active,
  .categories-list a:active {
    color: #08717f !important;
    transform: scale(0.97) !important;
  }

  /* ===== CATEGORIES LIST ===== */
  .categories-list {
    gap: 10px !important;
    text-align: center !important;
  }

  .cat-dot {
    width: 6px !important;
    height: 6px !important;
    opacity: 0.6 !important;
  }

  /* ===== HOURS LIST ===== */
  .hours-list {
    gap: 10px !important;
    max-width: 280px !important;
    margin: 0 auto !important;
  }

  .hour-item {
    font-size: 14px !important;
    padding: 8px 0 !important;
    justify-content: center !important;
    gap: 12px !important;
  }

  .day {
    font-size: 14px !important;
    font-weight: 600 !important;
  }

  .time {
    font-size: 14px !important;
    font-weight: 700 !important;
  }

  /* ===== FOOTER BOTTOM ===== */
  .footer-bottom {
    flex-direction: column !important;
    gap: 12px !important;
    text-align: center !important;
    padding-top: 1.2rem !important;
    padding-bottom: 0.5rem !important;
  }

  .copyright {
    font-size: 12px !important;
    order: 3 !important;
  }

  .footer-bottom-links {
    justify-content: center !important;
    gap: 10px !important;
    flex-wrap: wrap !important;
    order: 1 !important;
  }

  .footer-bottom-links a {
    font-size: 12px !important;
    padding: 4px 8px !important;
  }

  .separator {
    font-size: 10px !important;
    opacity: 0.5 !important;
  }

  /* ===== BACK TO TOP ===== */
  .back-to-top {
    width: 38px !important;
    height: 38px !important;
    position: static !important;
    transform: none !important;
    margin: 0 auto !important;
    order: 2 !important;
    border-radius: 12px !important;
  }

  .back-to-top svg {
    width: 18px !important;
    height: 18px !important;
  }

  .back-to-top:active {
    transform: scale(0.92) !important;
    box-shadow: 0 4px 12px rgba(8, 113, 127, 0.4) !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 480px) ----- */
@media (max-width: 480px) {
  .container {
    padding: 0 16px !important;
  }

  .footer-logo {
    height: 36px !important;
  }

  .footer-description {
    font-size: 13px !important;
    padding: 0 4px !important;
  }

  .footer-title {
    font-size: 15px !important;
  }

  .footer-links a,
  .categories-list a {
    font-size: 13px !important;
  }

  .social-link {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
  }

  .contact-icon {
    width: 32px !important;
    height: 32px !important;
  }

  /* Footer bottom links en colonne */
  .footer-bottom-links {
    flex-direction: column !important;
    gap: 6px !important;
    align-items: center !important;
  }

  .footer-bottom-links a {
    font-size: 12px !important;
    padding: 6px 0 !important;
  }

  .separator {
    display: none !important;
  }

  /* Hours en colonne */
  .hour-item {
    flex-direction: column !important;
    gap: 4px !important;
    padding: 6px 0 !important;
  }

  .day {
    font-size: 13px !important;
  }

  .time {
    font-size: 13px !important;
  }

  .copyright {
    font-size: 11px !important;
  }
}

/* ===== TRÈS GRAND MOBILE (max-width: 600px) ----- */
@media (min-width: 481px) and (max-width: 600px) {
  .footer-main {
    gap: 1.8rem !important;
  }

  .brand-section {
    padding: 0 10px !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .footer {
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }

  .footer-bottom {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px)) !important;
  }
}

/* ===== OPTIMISATION TACTILE ===== */
@media (hover: none) and (pointer: coarse) {
  .social-link,
  .back-to-top {
    min-width: 44px !important;
    min-height: 44px !important;
  }

  .footer-links a,
  .categories-list a,
  .footer-bottom-links a,
  .contact-item a {
    min-height: 40px !important;
    display: inline-flex !important;
    align-items: center !important;
  }

  /* Supprimer les animations hover qui restent bloquées */
  .social-link:active,
  .back-to-top:active {
    transform: scale(0.94) !important;
  }

  .footer-links a:active,
  .categories-list a:active {
    color: #08717f !important;
    transform: scale(0.97) !important;
  }

  .contact-item:active {
    transform: scale(0.98) !important;
  }

  /* Désactiver les animations hover sur tactile */
  .social-link:hover,
  .footer-links a:hover,
  .categories-list a:hover,
  .contact-item:hover,
  .hour-item:hover {
    transform: none !important;
  }

  .social-link::before {
    display: none !important;
  }
}

/* ===== DARK MODE MOBILE ===== */
@media (max-width: 768px) {
  .footer.dark-mode {
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  }

  .footer.dark-mode .footer-bottom {
    border-top-color: #1e293b !important;
  }

  .footer.dark-mode .hour-item {
    border-bottom-color: rgba(255, 255, 255, 0.06) !important;
  }

  .footer.dark-mode .social-link:active {
    background: rgba(45, 212, 191, 0.2) !important;
    color: #2dd4bf !important;
  }

  .footer.dark-mode .footer-links a:active,
  .footer.dark-mode .categories-list a:active {
    color: #2dd4bf !important;
  }
}

/* ===== ANIMATIONS RÉDUITES ===== */
@media (prefers-reduced-motion: reduce) {
  .footer-wave svg {
    animation: none !important;
  }

  .footer-links li,
  .social-links,
  .contact-info,
  .logo-wrapper {
    animation: none !important;
    opacity: 1 !important;
  }
}

/* ===== SCROLLBAR (si nécessaire) ===== */
.footer::-webkit-scrollbar {
  width: 0 !important;
  display: none !important;
}
</style>
