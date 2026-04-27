<!-- frontend/src/views/AboutPage.vue - Version avec Police Amiri -->
<template>
  <div class="about-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Platform Presentation Section avec Vidéo -->
    <section class="platform-hero">
      <div class="container">
        <div class="platform-grid">
          <div class="platform-content" data-aos="fade-right">
            <div class="hero-badge">
              <span class="badge-icon">✨</span>
              <span class="badge-text">آصالة | تراث تونس الأصيل</span>
            </div>
            <h1 class="platform-title">من نحن</h1>
            <p class="platform-subtitle">
              منصة رائدة للحرف اليدوية التونسية الأصيلة
            </p>
            <p class="platform-description">
              آصالة هي منصة إلكترونية متخصصة في عرض وبيع المنتجات الحرفية التونسية الأصيلة.
              نربط بين الحرفيين الموهوبين والعملاء الباحثين عن الجودة والأصالة في جميع أنحاء العالم.
            </p>
            <p class="platform-description">
              كل منتج على منصتنا يحكي قصة تراثية عريقة، صنع بأيادٍ ماهرة توارثت الحرفة جيلاً بعد جيل.
              نحن نؤمن بأن الحفاظ على التراث يبدأ بدعم الحرفيين وتمكينهم من الوصول إلى أسواق جديدة.
            </p>
            <div class="platform-buttons">
              <button class="btn-primary" @click="$router.push('/become-vendor')">
                انضم إلى رحلتنا
                <span class="btn-icon">←</span>
              </button>
              <button class="btn-outline" @click="$router.push('/products')">
                استكشف المنتجات
              </button>
            </div>
            <div class="platform-features">
              <div class="platform-feature">
                <span class="feature-check">✓</span>
                <span>منصة آمنة وموثوقة</span>
              </div>
              <div class="platform-feature">
                <span class="feature-check">✓</span>
                <span>شهادات أصالة للمنتجات</span>
              </div>
              <div class="platform-feature">
                <span class="feature-check">✓</span>
                <span>توصيل سريع إلى جميع الولايات</span>
              </div>
              <div class="platform-feature">
                <span class="feature-check">✓</span>
                <span>دعم مستمر للحرفيين</span>
              </div>
            </div>
          </div>

          <!-- Video Section avec Son -->
          <div class="platform-video" data-aos="fade-left">
            <div class="video-card">
              <div class="video-wrapper">
                <video
                  ref="videoPlayer"
                  :class="{ 'playing': isVideoPlaying }"
                  autoplay
                  loop
                  playsinline
                  @click="toggleVideo"
                >
                  <source src="/src/assets/nnnn.mp4" type="video/mp4">
                  متصفحك لا يدعم تشغيل الفيديو
                </video>

                <div class="video-overlay"></div>

                <button
                  class="video-control-btn"
                  @click="toggleVideo"
                  :class="{ 'hidden': isVideoPlaying }"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                    <polygon points="10,8 16,12 10,16" fill="white"/>
                  </svg>
                </button>

                <button
                  class="video-mute-btn"
                  @click.stop="toggleMute"
                >
                  <svg v-if="isMuted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>

                <div class="video-indicator" v-if="isVideoPlaying">
                  <span class="pulse-dot"></span>
                  <span>يتشغل الآن</span>
                </div>
              </div>

              <div class="video-badge">
                <span class="badge-icon">🎬</span>
                <span>شاهد قصتنا</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section-spacing mission-section">
      <div class="container">
        <div class="mission-grid">
          <div class="mission-image" data-aos="fade-right">
            <div class="image-wrapper">
              <img
                src="https://i.pinimg.com/736x/1d/e9/2a/1de92a0aa06addc7687a2a26c517a8ab.jpg"
                alt="حرفي تونسي يعمل"
                class="floating-image"
                loading="lazy"
              />
              <div class="image-overlay"></div>
              <div class="image-badge">
                <span class="badge-content">🇹🇳 حرفي تونسي</span>
              </div>
              <div class="image-shine"></div>
            </div>
          </div>
          <div class="mission-content" data-aos="fade-left">
            <div class="section-header text-right">
              <span class="section-badge pulse">
                <span class="badge-icon">🎯</span>
                رسالتنا
              </span>
              <h2 class="section-title gradient-text">نربط التراث بالحاضر</h2>
            </div>

            <div class="mission-texts">
              <p class="section-text">
                نحن منصة إلكترونية متخصصة في عرض وبيع المنتجات الحرفية التونسية الأصيلة. مهمتنا هي
                الحفاظ على التراث التونسي العريق ودعم الحرفيين المحليين من خلال توفير منصة حديثة
                تمكنهم من الوصول إلى عملاء جدد في جميع أنحاء العالم.
              </p>
              <p class="section-text delay-1">
                كل منتج على منصتنا يحكي قصة، قصة حرفي موهوب أمضى سنوات في إتقان حرفته، مستخدماً
                تقنيات تقليدية توارثها جيلاً بعد جيل.
              </p>
            </div>

            <div class="mission-cta">
              <button class="btn btn-outline-glow" @click="$router.push('/products')">
                استكشف منتجاتنا
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="section-spacing testimonials-section">
      <div class="container">
        <div class="section-header" data-aos="fade-up">
          <span class="section-badge">
            <span class="badge-icon">💬</span>
            شهادات
          </span>
          <h2 class="section-title">ماذا يقول <span class="gradient-text">حرفيونا</span></h2>
          <p class="section-subtitle">قصص نجاح من مجتمع آصالة</p>
        </div>

        <div class="testimonials-grid">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            class="testimonial-card"
            :class="{ 'featured': index === 0 }"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <div class="card-header">
              <div class="quote-icon">"</div>
              <div class="rating">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= testimonial.rating }">★</span>
              </div>
            </div>

            <p class="testimonial-text">"{{ testimonial.quote }}"</p>

            <div class="card-footer">
              <div class="author-info">
                <img :src="testimonial.avatar" :alt="testimonial.name" class="author-avatar">
                <div class="author-details">
                  <h4 class="author-name">{{ testimonial.name }}</h4>
                  <p class="author-specialty">{{ testimonial.specialty }}</p>
                </div>
              </div>
              <div class="product-badge">
                <span class="product-icon">🏺</span>
                <span>{{ testimonial.product }}</span>
              </div>
            </div>

            <div class="card-decoration"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type, { 'dark-mode': isDarkMode }]">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button @click="toast.show = false" class="toast-close">×</button>
        <div class="toast-progress" :style="{ animationDuration: '3s' }"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

// Dark mode
const isDarkMode = computed(() => themeStore.isDarkMode)

// Video state
const videoPlayer = ref(null)
const isVideoPlaying = ref(true)
const isMuted = ref(false)

const toggleVideo = () => {
  if (!videoPlayer.value) return
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
    isVideoPlaying.value = true
  } else {
    videoPlayer.value.pause()
    isVideoPlaying.value = false
  }
}

const toggleMute = () => {
  if (!videoPlayer.value) return
  videoPlayer.value.muted = !videoPlayer.value.muted
  isMuted.value = videoPlayer.value.muted
}

// Testimonials
const testimonials = ref([
  {
    id: 1,
    name: 'فاطمة بن علي',
    specialty: 'فخّارة تقليدية',
    avatar: 'https://i.pravatar.cc/150?img=25',
    rating: 5,
    quote: 'منصة آصالة غيرت حياتي المهنية. الآن منتوجاتي تسافر للعالم بأسره وأستطيع العيش من شغفي.',
    product: 'طقم فخاري',
  },
  {
    id: 2,
    name: 'محمد الطرابلسي',
    specialty: 'حرفي جلود',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    quote: 'منصة استثنائية تثمن عملنا الحرفي حقاً. الدعم الذي تقدمه آصالة للحرفيين لا يضاهى.',
    product: 'حقيبة جلدية',
  },
  {
    id: 3,
    name: 'ليلى المنصوري',
    specialty: 'مصممة مجوهرات',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    quote: 'أفضل قرار كان الانضمام لهذه المنصة. المبيعات في تزايد مستمر والوصول لعملاء جدد أصبح سهلاً.',
    product: 'مجوهرات فضة',
  },
  {
    id: 4,
    name: 'نادية بن سالم',
    specialty: 'نساجة تقليدية',
    avatar: 'https://i.pravatar.cc/150?img=29',
    rating: 5,
    quote: 'مجتمع رائع يحتفل بالحرف التونسية. فخورة بكوني جزء من هذه العائلة.',
    product: 'زرابي تقليدية',
  },
  {
    id: 5,
    name: 'حسن بن عمر',
    specialty: 'نحات على الخشب',
    avatar: 'https://i.pravatar.cc/150?img=41',
    rating: 5,
    quote: 'آصالة مكنتني من العيش بشغفي ومشاركته مع العالم. شكراً لثقتكم بي.',
    product: 'تحف خشبية',
  },
  {
    id: 6,
    name: 'سنية بن شيخة',
    specialty: 'خزافة',
    avatar: 'https://i.pravatar.cc/150?img=52',
    rating: 5,
    quote: 'المنصة المثالية لاكتشاف الأصالة التونسية. عمل متقن وتواصل ممتاز.',
    product: 'أواني خزفية',
  },
])

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

onMounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.play().catch(e => {
      console.log('Auto-play prevented:', e)
      isVideoPlaying.value = false
    })
    videoPlayer.value.muted = false
    isMuted.value = false
  }
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
})
</script>

<style>
/* ===== GOOGLE FONTS - AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
</style>

<style scoped>
/* ========================================
   DESIGN PREMIUM - صفحة من نحن
   Colors: #08717f (Teal) & #d40025 (Red)
======================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.about-page {
  direction: rtl;
  font-family: 'Amiri', 'Cairo', 'Tajawal', serif;
  background: #ffffff;
  transition: background 0.3s ease;
  overflow-x: hidden;
}

.about-page * {
  font-family: 'Amiri', 'Cairo', 'Tajawal', serif;
}

.about-page.dark-mode {
  background: #0a0a0f;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-spacing {
  padding: 100px 0;
}

/* ========================================
   PLATFORM HERO SECTION
======================================== */
.platform-hero {
  padding: 120px 0 80px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f5 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.about-page.dark-mode .platform-hero {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

.platform-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(8, 113, 127, 0.1);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #08717f;
  margin-bottom: 24px;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .hero-badge {
  background: rgba(8, 113, 127, 0.2);
  color: #0a94a6;
}

.badge-icon {
  font-size: 1rem;
}

.platform-title {
  font-size: 3.5rem;
  font-weight: 800;
  font-family: 'Amiri', serif;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.about-page.dark-mode .platform-title {
  color: #ffffff;
}

.platform-subtitle {
  font-size: 1.3rem;
  color: #4a5568;
  margin-bottom: 24px;
  font-weight: 500;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .platform-subtitle {
  color: #a0aec0;
}

.platform-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 20px;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .platform-description {
  color: #cbd5e1;
}

.platform-buttons {
  display: flex;
  gap: 16px;
  margin: 32px 0;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 14px 32px;
  background: linear-gradient(135deg, #08717f, #065a69);
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(8, 113, 127, 0.3);
}

.btn-outline {
  padding: 14px 32px;
  background: transparent;
  border: 2px solid #08717f;
  border-radius: 50px;
  color: #08717f;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .btn-outline {
  border-color: #0a94a6;
  color: #0a94a6;
}

.btn-outline:hover {
  background: #08717f;
  color: white;
  transform: translateY(-3px);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(-5px);
}

.platform-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 32px;
}

.platform-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .platform-feature {
  background: #1e293b;
  border-color: #334155;
}

.platform-feature:hover {
  transform: translateX(-5px);
  border-color: #08717f;
}

.feature-check {
  width: 24px;
  height: 24px;
  background: #08717f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
}

/* ========================================
   STYLES VIDÉO AVEC SON
======================================== */
.platform-video {
  position: relative;
}

.video-card {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 55px rgba(8, 113, 127, 0.25);
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
}

.video-wrapper video {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
}

.video-wrapper:hover video {
  transform: scale(1.02);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.15), rgba(212, 0, 37, 0.15));
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.video-wrapper:hover .video-overlay {
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.25), rgba(212, 0, 37, 0.25));
}

.video-control-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.video-control-btn svg {
  width: 30px;
  height: 30px;
  margin-right: 3px;
}

.video-control-btn:hover {
  background: rgba(8, 113, 127, 0.8);
  border-color: white;
  transform: translate(-50%, -50%) scale(1.1);
}

.video-control-btn.hidden {
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, -50%) scale(0.8);
}

.video-mute-btn {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.video-mute-btn:hover {
  background: rgba(8, 113, 127, 0.8);
  transform: scale(1.1);
}

.video-indicator {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 30px;
  font-size: 0.7rem;
  color: white;
  z-index: 10;
  animation: fadeInUp 0.5s ease;
  font-family: 'Amiri', serif;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.video-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: 'Amiri', serif;
}

.video-badge .badge-icon {
  font-size: 1rem;
}

.video-wrapper video.playing {
  animation: videoReveal 0.8s ease;
}

@keyframes videoReveal {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ========================================
   MISSION SECTION
======================================== */
.mission-section {
  background: white;
}

.about-page.dark-mode .mission-section {
  background: #0f172a;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 20px;
  font-family: 'Amiri', serif;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #1a1a2e;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .section-title {
  color: #ffffff;
}

.gradient-text {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 20px;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .section-text {
  color: #cbd5e1;
}

.mission-image .image-wrapper {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.floating-image {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-wrapper:hover .floating-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(8, 113, 127, 0.3), transparent);
}

.image-badge {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50px;
  font-weight: 700;
  color: #08717f;
  font-family: 'Amiri', serif;
}

.image-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: 0.5s;
}

.image-wrapper:hover .image-shine {
  left: 100%;
}

.btn-outline-glow {
  padding: 14px 32px;
  background: transparent;
  border: 2px solid #08717f;
  border-radius: 50px;
  color: #08717f;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-family: 'Amiri', serif;
}

.btn-outline-glow:hover {
  background: #08717f;
  color: white;
  transform: translateY(-3px);
}

/* ========================================
   TESTIMONIALS SECTION
======================================== */
.testimonials-section {
  background: #f8fafc;
}

.about-page.dark-mode .testimonials-section {
  background: #0f172a;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin-top: 16px;
  font-family: 'Amiri', serif;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.testimonial-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
}

.about-page.dark-mode .testimonial-card {
  background: #1e293b;
  border-color: #334155;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  border-color: #08717f;
  box-shadow: 0 20px 35px rgba(8, 113, 127, 0.1);
}

.testimonial-card.featured {
  border-top: 4px solid #08717f;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.quote-icon {
  font-size: 3rem;
  color: #08717f;
  opacity: 0.3;
  font-family: serif;
}

.rating {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 0.9rem;
  color: #cbd5e0;
}

.star.filled {
  color: #fbbf24;
}

.testimonial-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 28px;
  font-style: italic;
  min-height: 100px;
  font-family: 'Amiri', serif;
}

.about-page.dark-mode .testimonial-text {
  color: #cbd5e1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #08717f;
}

.author-name {
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 4px;
  font-family: 'Amiri', serif;
}

.author-specialty {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Amiri', serif;
}

.product-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(8, 113, 127, 0.1);
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #08717f;
  font-family: 'Amiri', serif;
}

.card-decoration {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(8, 113, 127, 0.05), transparent);
  border-radius: 50%;
  pointer-events: none;
}

/* ========================================
   TOAST
======================================== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease;
  font-family: 'Amiri', serif;
}

.toast-notification.dark-mode {
  background: #1e293b;
}

.toast-notification.success {
  border-right: 4px solid #08717f;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #08717f, #d40025);
  animation: progress 3s linear;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 100%); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 992px) {
  .platform-grid,
  .mission-grid {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .section-spacing {
    padding: 80px 0;
  }

  .platform-title {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .platform-hero {
    padding: 80px 0 60px;
  }

  .platform-title {
    font-size: 2.2rem;
  }

  .platform-subtitle {
    font-size: 1.1rem;
  }

  .platform-features {
    grid-template-columns: 1fr;
  }

  .platform-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-outline {
    width: 100%;
    justify-content: center;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .video-mute-btn {
    bottom: 15px;
    left: 15px;
    width: 35px;
    height: 35px;
  }

  .video-indicator {
    bottom: 15px;
    right: 15px;
    padding: 4px 10px;
    font-size: 0.6rem;
  }

  .video-badge {
    top: 15px;
    left: 15px;
    padding: 6px 12px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .platform-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .testimonial-card {
    padding: 24px;
  }

  .testimonial-text {
    min-height: auto;
  }

  .video-control-btn {
    width: 50px;
    height: 50px;
  }

  .video-control-btn svg {
    width: 22px;
    height: 22px;
  }
}

.about-page.dark-mode ::-webkit-scrollbar {
  width: 8px;
}

.about-page.dark-mode ::-webkit-scrollbar-track {
  background: #1e293b;
}

.about-page.dark-mode ::-webkit-scrollbar-thumb {
  background: #08717f;
  border-radius: 4px;
}

.about-page.dark-mode ::selection {
  background: #0a94a6;
  color: white;
}
</style>
