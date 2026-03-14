<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="home-hero">
      <h1>مرحباً بك في تراث تونس</h1>
      <p>اكتشف أجمل المنتجات التقليدية والحرف اليدوية التونسية من أفضل الحرفيين</p>
      <div class="hero-buttons">
        <router-link to="/products" class="btn btn-primary"> تصفح المنتجات </router-link>
        <router-link to="/become-vendor" class="btn"> انضم كبائع </router-link>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <h2 style="text-align: center; margin-bottom: 40px; color: #1a365d">
        لماذا تختار تراث تونس؟
      </h2>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🏺</div>
          <h3>منتجات أصلية</h3>
          <p>منتجات تقليدية أصلية من الحرفيين التونسيين</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🚚</div>
          <h3>شحن سريع</h3>
          <p>توصيل سريع وآمن لجميع أنحاء تونس</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3>جودة مضمونة</h3>
          <p>نضمن جودة جميع المنتجات المعروضة</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Logique de la page d'accueil
</script>

<style scoped>
.home {
  padding: 20px 0;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #1a365d;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
