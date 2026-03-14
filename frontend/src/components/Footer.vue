<template>
  <footer class="footer">
    <div class="container">
      <!-- Footer Top - PLUS COMPACT -->
      <div class="footer-top">
        <!-- Logo & Social -->
        <div class="footer-brand">
          <router-link to="/" class="logo">
            <img src="/src/assets/asala logo.svg" alt="ASALA" class="logo-image" />
          </router-link>
          <p class="brand-desc">حرف يدوية تونسية أصيلة</p>
          <div class="social-links">
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📸</a>
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">📺</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-links">
          <h4>روابط سريعة</h4>
          <ul>
            <li><router-link to="/products">المنتجات</router-link></li>
            <li><router-link to="/about">من نحن</router-link></li>
            <li><router-link to="/contact">اتصل بنا</router-link></li>
          </ul>
        </div>

        <!-- Categories -->
        <div class="footer-categories">
          <h4>التصنيفات</h4>
          <div class="category-tags">
            <router-link to="/category/carpets" class="tag">🧵 سجاد</router-link>
            <router-link to="/category/pottery" class="tag">🏺 فخار</router-link>
            <router-link to="/category/jewelry" class="tag">💍 مجوهرات</router-link>
            <router-link to="/category/clothing" class="tag">👗 ملابس</router-link>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="footer-newsletter">
          <h4>النشرة البريدية</h4>
          <form @submit.prevent="subscribe" class="newsletter-form">
            <input
              type="email"
              v-model="email"
              placeholder="بريدك الإلكتروني"
              class="newsletter-input"
              required
            />
            <button type="submit" class="newsletter-btn">→</button>
          </form>
        </div>
      </div>

      <!-- Footer Bottom - PLUS COMPACT -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>© 2026 ASALA - جميع الحقوق محفوظة</p>
        </div>
        <div class="footer-bottom-links">
          <router-link to="/privacy">الخصوصية</router-link>
          <span class="separator">•</span>
          <router-link to="/terms">الشروط</router-link>
          <span class="separator">•</span>
          <router-link to="/shipping">الشحن</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Footer',
  setup() {
    const email = ref('')

    const subscribe = () => {
      if (email.value) {
        alert(`شكراً للاشتراك: ${email.value}`)
        email.value = ''
      }
    }

    return {
      email,
      subscribe,
    }
  },
}
</script>

<style scoped>
/* ========================================
   FOOTER - VERSION MINIMISÉE
   Couleurs du header en version blanche
   Taille réduite - Plus compact
======================================== */
.footer {
  background: white;
  color: #1e293b;
  padding: 1.5rem 0 0.8rem;  /* ← RÉDUIT : de 3rem à 1.5rem */
  margin-top: auto;
  border-top: 2px solid #d30025;  /* ← RÉDUIT : de 3px à 2px */
  box-shadow: 0 -2px 10px rgba(8, 113, 127, 0.05);  /* ← RÉDUIT */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ========== FOOTER TOP - ESPACES RÉDUITS ========== */
.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1.5fr;
  gap: 1.5rem;  /* ← RÉDUIT : de 2rem à 1.5rem */
  margin-bottom: 1.2rem;  /* ← RÉDUIT : de 2.5rem à 1.2rem */
}

/* ========== BRAND - PLUS COMPACT ========== */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;  /* ← RÉDUIT : de 0.75rem à 0.4rem */
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;  /* ← RÉDUIT */
  text-decoration: none;
}

.logo-symbol {
  width: 32px;  /* ← RÉDUIT : de 40px à 32px */
  height: 32px;  /* ← RÉDUIT : de 40px à 32px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #08717f;  /* ← Turquoise header */
  color: white;
  font-size: 1.2rem;  /* ← RÉDUIT : de 1.5rem à 1.2rem */
  font-weight: 800;
  border-radius: 8px;  /* ← RÉDUIT : de 10px à 8px */
  transition: transform 0.3s ease;
}

.logo:hover .logo-symbol {
  transform: scale(1.1);
  background: #065a69;
}

.logo-text {
  font-size: 1.2rem;  /* ← RÉDUIT : de 1.5rem à 1.2rem */
  font-weight: 800;
  color: #08717f;  /* ← Turquoise header */
  letter-spacing: 0.5px;  /* ← RÉDUIT */
  transition: color 0.3s ease;
}

.logo:hover .logo-text {
  color: #065a69;
}

.brand-desc {
  color: #64748b;
  font-size: 0.8rem;  /* ← RÉDUIT : de 0.9rem à 0.8rem */
  margin: 0;
  line-height: 1.4;  /* ← RÉDUIT : de 1.6 à 1.4 */
}

/* ========== SOCIAL LINKS - PLUS PETITS ========== */
.social-links {
  display: flex;
  gap: 0.4rem;  /* ← RÉDUIT */
  margin-top: 0.3rem;  /* ← RÉDUIT */
}

.social-link {
  width: 30px;  /* ← RÉDUIT : de 36px à 30px */
  height: 30px;  /* ← RÉDUIT : de 36px à 30px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 6px;  /* ← RÉDUIT : de 8px à 6px */
  font-size: 0.95rem;  /* ← RÉDUIT : de 1.1rem à 0.95rem */
  text-decoration: none;
  color: #475569;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #d30025;  /* ← ROUGE */
  color: white;
  transform: translateY(-2px);  /* ← RÉDUIT : de -3px à -2px */
  box-shadow: 0 3px 10px rgba(211, 0, 37, 0.3);  /* ← RÉDUIT */
}

/* ========== SECTION TITLES - PLUS COMPACTS ========== */
.footer-links h4,
.footer-categories h4,
.footer-newsletter h4 {
  color: #08717f;  /* ← Turquoise header */
  font-size: 0.9rem;  /* ← RÉDUIT : de 1rem à 0.9rem */
  font-weight: 700;
  margin: 0 0 0.6rem 0;  /* ← RÉDUIT : de 1rem à 0.6rem */
  position: relative;
  padding-bottom: 0.3rem;  /* ← RÉDUIT : de 0.5rem à 0.3rem */
}

.footer-links h4::after,
.footer-categories h4::after,
.footer-newsletter h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25px;  /* ← RÉDUIT : de 30px à 25px */
  height: 2px;
  background: #d30025;  /* ← ROUGE */
  border-radius: 2px;
}

/* ========== LINKS - PLUS COMPACTS ========== */
.footer-links ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.3rem;  /* ← RÉDUIT : de 0.5rem à 0.3rem */
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 0.8rem;  /* ← RÉDUIT : de 0.9rem à 0.8rem */
  transition: all 0.3s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: #08717f;  /* ← Turquoise header */
  transform: translateX(-3px);  /* ← RÉDUIT : de -4px à -3px */
}

/* ========== CATEGORY TAGS - PLUS PETITS ========== */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;  /* ← RÉDUIT */
}

.tag {
  padding: 0.25rem 0.6rem;  /* ← RÉDUIT : de 0.4rem 0.75rem à 0.25rem 0.6rem */
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;  /* ← RÉDUIT : de 20px à 16px */
  color: #475569;
  text-decoration: none;
  font-size: 0.7rem;  /* ← RÉDUIT : de 0.8rem à 0.7rem */
  transition: all 0.3s ease;
}

.tag:hover {
  background: #d30025;  /* ← ROUGE */
  border-color: #d30025;
  color: white;
  transform: translateY(-1px);  /* ← RÉDUIT : de -2px à -1px */
  box-shadow: 0 2px 8px rgba(211, 0, 37, 0.3);  /* ← RÉDUIT */
}

/* ========== NEWSLETTER - PLUS COMPACT ========== */
.newsletter-form {
  display: flex;
  gap: 0.4rem;  /* ← RÉDUIT */
}

.newsletter-input {
  flex: 1;
  padding: 0.4rem 0.8rem;  /* ← RÉDUIT : de 0.6rem 1rem à 0.4rem 0.8rem */
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;  /* ← RÉDUIT : de 8px à 6px */
  color: #1e293b;
  font-size: 0.8rem;  /* ← RÉDUIT : de 0.9rem à 0.8rem */
  transition: all 0.3s ease;
}

.newsletter-input::placeholder {
  color: #94a3b8;
  font-size: 0.75rem;  /* ← AJOUTÉ */
}

.newsletter-input:focus {
  outline: none;
  border-color: #08717f;  /* ← Turquoise header */
  background: white;
  box-shadow: 0 0 0 2px rgba(8, 113, 127, 0.1);  /* ← RÉDUIT : de 3px à 2px */
}

.newsletter-btn {
  width: 36px;  /* ← RÉDUIT : de 42px à 36px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d30025;  /* ← ROUGE */
  border: none;
  border-radius: 6px;  /* ← RÉDUIT : de 8px à 6px */
  color: white;
  font-size: 1rem;  /* ← RÉDUIT : de 1.2rem à 1rem */
  cursor: pointer;
  transition: all 0.3s ease;
}

.newsletter-btn:hover {
  background: #b00020;
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(211, 0, 37, 0.4);  /* ← RÉDUIT */
}

/* ========== FOOTER BOTTOM - PLUS COMPACT ========== */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.8rem;  /* ← RÉDUIT : de 1.5rem à 0.8rem */
  border-top: 1px solid #e2e8f0;
  font-size: 0.75rem;  /* ← RÉDUIT : de 0.85rem à 0.75rem */
}

.copyright p {
  color: #64748b;
  margin: 0;
  font-size: 0.75rem;  /* ← RÉDUIT */
}

.footer-bottom-links {
  display: flex;
  gap: 0.4rem;  /* ← RÉDUIT : de 0.5rem à 0.4rem */
  align-items: center;
  flex-wrap: wrap;
}

.footer-bottom-links a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.75rem;  /* ← RÉDUIT */
}

.footer-bottom-links a:hover {
  color: #08717f;  /* ← Turquoise header */
}

.separator {
  color: #cbd5e1;
  font-size: 0.6rem;  /* ← RÉDUIT : de 0.7rem à 0.6rem */
}

/* ========== RESPONSIVE - AJUSTÉ ========== */
@media (max-width: 1024px) {
  .footer-top {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;  /* ← RÉDUIT */
  }
  
  .footer {
    padding: 1.2rem 0 0.6rem;  /* ← RÉDUIT */
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 1rem 0 0.5rem;  /* ← RÉDUIT */
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 1.2rem;  /* ← RÉDUIT */
  }

  .footer-brand {
    text-align: center;
    align-items: center;
  }

  .logo {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }

  .footer-links h4::after,
  .footer-categories h4::after,
  .footer-newsletter h4::after {
    right: 50%;
    transform: translateX(50%);
  }

  .footer-links {
    text-align: center;
  }

  .category-tags {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;  /* ← RÉDUIT */
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 0.8rem 0 0.4rem;  /* ← RÉDUIT */
  }

  .footer-top {
    gap: 1rem;  /* ← RÉDUIT */
  }

  .logo-symbol {
    width: 28px;  /* ← RÉDUIT : de 35px à 28px */
    height: 28px;  /* ← RÉDUIT : de 35px à 28px */
    font-size: 1rem;  /* ← RÉDUIT : de 1.3rem à 1rem */
  }

  .logo-text {
    font-size: 1rem;  /* ← RÉDUIT : de 1.3rem à 1rem */
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-btn {
    width: 100%;
    padding: 0.4rem;  /* ← RÉDUIT : de 0.6rem à 0.4rem */
  }

  .footer-bottom-links {
    flex-direction: column;
    gap: 0.3rem;  /* ← RÉDUIT */
  }

  .separator {
    display: none;
  }
}
</style>