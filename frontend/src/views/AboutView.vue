<template>
  <div class="about-page dual-theme">
    <!-- Hero Section avec animation -->
    <section class="about-hero animated-hero">
      <div class="hero-particles"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">✨</span>
            <span class="badge-text">تراث تونس الأصيل</span>
          </div>
          <h1 class="page-title reveal-text">من نحن</h1>
          <p class="page-subtitle fade-in">منصة رائدة للحرف اليدوية التونسية الأصيلة</p>
          <div class="hero-cta fade-in-delay">
            <button class="btn btn-glow" @click="$router.push('/become-vendor')">
              انضم إلى رحلتنا
              <span class="btn-icon">←</span>
            </button>
          </div>
        </div>
        <div class="hero-scroll">
          <span class="scroll-text">اكتشف المزيد</span>
          <div class="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="floating-element float-1">🏺</div>
      <div class="floating-element float-2">🧵</div>
      <div class="floating-element float-3">💍</div>
      <div class="floating-element float-4">🪵</div>
    </section>

    <!-- Mission Section avec hover effects -->
    <section class="section-spacing mission-section">
      <div class="container">
        <div class="mission-grid">
          <div class="mission-image reveal-left">
            <div class="image-wrapper">
              <img
                src="https://i.pinimg.com/736x/1d/e9/2a/1de92a0aa06addc7687a2a26c517a8ab.jpg"
                alt="حرفي تونسي يعمل"
                class="floating-image"
              />
              <div class="image-overlay"></div>
              <div class="image-badge">
                <span class="badge-content">🇹🇳 حرفي تونسي</span>
              </div>
            </div>
          </div>
          <div class="mission-content reveal-right">
            <div class="section-header">
              <span class="section-badge pulse">
                <span class="badge-icon">🎯</span>
                رسالتنا
              </span>
              <h2 class="section-title gradient-text">نربط التراث بالحاضر</h2>
            </div>

            <div class="mission-texts">
              <p class="section-text fade-in-text">
                نحن منصة إلكترونية متخصصة في عرض وبيع المنتجات الحرفية التونسية الأصيلة. مهمتنا هي
                الحفاظ على التراث التونسي العريق ودعم الحرفيين المحليين من خلال توفير منصة حديثة
                تمكنهم من الوصول إلى عملاء جدد في جميع أنحاء العالم.
              </p>
              <p class="section-text fade-in-text delay-1">
                كل منتج على منصتنا يحكي قصة، قصة حرفي موهوب أمضى سنوات في إتقان حرفته، مستخدماً
                تقنيات تقليدية توارثها جيلاً بعد جيل.
              </p>
            </div>

            <!-- Stats avec animations -->
            <div class="mission-stats">
              <div class="stat-box hover-lift" v-for="stat in stats" :key="stat.label">
                <div class="stat-inner">
                  <span class="stat-number counter" :data-count="stat.number">{{
                    stat.number
                  }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                  <div class="stat-icon">{{ stat.icon }}</div>
                </div>
                <div class="stat-glow"></div>
              </div>
            </div>

            <!-- Call to Action -->
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

    <!-- Values Section avec cards interactives -->
    <section class="section-spacing values-section">
      <div class="container">
        <div class="section-header reveal-text">
          <span class="section-badge">
            <span class="badge-icon">💎</span>
            قيمنا
          </span>
          <h2 class="section-title">قيمنا <span class="gradient-text">الأساسية</span></h2>
          <p class="section-subtitle">المبادئ التي نؤمن بها ونعمل وفقها</p>
        </div>

        <div class="values-grid">
          <div
            class="value-card"
            v-for="(value, index) in values"
            :key="value.title"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @mouseenter="hoverValue = value.title"
            @mouseleave="hoverValue = null"
          >
            <div class="card-inner" :class="{ hovered: hoverValue === value.title }">
              <div class="value-icon-wrapper">
                <div class="value-icon">{{ value.icon }}</div>
                <div class="value-icon-back">{{ value.icon }}</div>
              </div>
              <h3 class="value-title">{{ value.title }}</h3>
              <p class="value-text">{{ value.text }}</p>
              <div class="card-footer">
                <span class="learn-more">اكتشف المزيد</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="section-spacing story-section">
      <div class="container">
        <div class="story-grid">
          <div class="story-content reveal-left">
            <div class="section-header">
              <span class="section-badge">
                <span class="badge-icon">📖</span>
                قصتنا
              </span>
              <h2 class="section-title gradient-text">من شغف إلى منصة</h2>
            </div>

            <div class="story-timeline">
              <div class="timeline-item" v-for="(item, index) in storyItems" :key="index">
                <div
                  class="timeline-marker"
                  :class="{ 'teal-marker': index % 2 === 0, 'red-marker': index % 2 === 1 }"
                >
                  <span class="marker-year">{{ item.year }}</span>
                </div>
                <div class="timeline-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="story-image reveal-right">
            <div class="image-collage">
              <div class="collage-item main">
                <img
                  src="https://i.pinimg.com/736x/b2/5b/0e/b25b0e8d5ec37e7a4e31aaf0083b2105.jpg"
                  alt="حرفي تونسي"
                />
              </div>
              <div class="collage-item small-1">
                <img
                  src="https://i.pinimg.com/736x/0b/14/4a/0b144a56e4420ee7720c3997dd70f391.jpg"
                  alt="منتجات تقليدية"
                />
              </div>
              <div class="collage-item small-2">
                <img
                  src="https://i.pinimg.com/736x/c1/b1/cc/c1b1cc82d0bbc97268c7f09b1c0baf7a.jpg"
                  alt="فخار تونسي"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section avec effet parallax -->
    <section class="section-spacing team-section parallax-section">
      <div class="container">
        <div class="section-header reveal-text">
          <span class="section-badge">
            <span class="badge-icon">👥</span>
            فريقنا
          </span>
          <h2 class="section-title">فريق <span class="gradient-text">الشغف</span></h2>
          <p class="section-subtitle">الأشخاص الذين يجعلون هذا ممكناً</p>
        </div>

        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.id" class="team-card">
            <div class="team-image">
              <img :src="member.image" :alt="member.name" />
              <div class="image-overlay"></div>
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                    />
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </a>
              </div>
            </div>
            <div class="team-info">
              <h3 class="team-name">{{ member.name }}</h3>
              <p class="team-role">{{ member.role }}</p>
              <p class="team-bio">{{ member.bio }}</p>
              <div class="team-contact">
                <a :href="`mailto:${member.email}`" class="contact-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" />
                  </svg>
                  {{ member.email }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="section-spacing testimonials-section">
      <div class="container">
        <div class="section-header reveal-text">
          <span class="section-badge">
            <span class="badge-icon">💬</span>
            شهادات
          </span>
          <h2 class="section-title">ماذا يقول <span class="gradient-text">حرفيونا</span></h2>
          <p class="section-subtitle">قصص نجاح من مجتمعنا</p>
        </div>

        <div class="testimonials-grid">
          <div v-for="testimonial in testimonials" :key="testimonial.id" class="testimonial-card">
            <div class="testimonial-header">
              <img :src="testimonial.avatar" :alt="testimonial.name" class="testimonial-avatar" />
              <div class="testimonial-info">
                <h4 class="testimonial-name">{{ testimonial.name }}</h4>
                <p class="testimonial-specialty">{{ testimonial.specialty }}</p>
              </div>
              <div class="testimonial-rating">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="star"
                  :class="{ filled: i <= testimonial.rating }"
                  >★</span
                >
              </div>
            </div>
            <blockquote class="testimonial-quote">"{{ testimonial.quote }}"</blockquote>
            <div class="testimonial-footer">
              <span class="testimonial-date">{{ testimonial.date }}</span>
              <span class="testimonial-product">{{ testimonial.product }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section avec gradient animé -->
    <section class="cta-section animated-gradient">
      <div class="container">
        <div class="cta-content">
          <div class="cta-icon">
            <span class="icon">✨</span>
          </div>
          <h2 class="cta-title">انضم إلى <span class="gradient-text-white">عائلتنا</span></h2>
          <p class="cta-description">
            سواء كنت حرفياً موهوباً أو عميلاً يبحث عن منتجات فريدة، نحن هنا لخدمتك
          </p>
          <div class="cta-buttons">
            <button class="btn btn-primary btn-glow" @click="$router.push('/become-vendor')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
              </svg>
              كن بائعاً
            </button>
            <button class="btn btn-outline-light" @click="$router.push('/contact')">
              تواصل معنا
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
          <div class="cta-stats">
            <div class="cta-stat">
              <span class="stat-number">500+</span>
              <span class="stat-label">حرفي</span>
            </div>
            <div class="cta-stat-divider"></div>
            <div class="cta-stat">
              <span class="stat-number">5000+</span>
              <span class="stat-label">منتج</span>
            </div>
            <div class="cta-stat-divider"></div>
            <div class="cta-stat">
              <span class="stat-number">10K+</span>
              <span class="stat-label">عميل</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast-notification', toast.type]">
      <div class="toast-content">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
      <button @click="toast.show = false" class="toast-close">×</button>
      <div class="toast-progress" :style="{ animationDuration: '3s' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hoverValue = ref(null)

// ============ STATS ============
const stats = [
  { number: '500+', label: 'حرفي موثوق', icon: '👨‍🎨' },
  { number: '5000+', label: 'منتج فريد', icon: '✨' },
  { number: '10K+', label: 'عميل سعيد', icon: '😊' },
]

// ============ VALUES ============
const values = [
  { icon: '🎨', title: 'الأصالة', text: 'نضمن أن جميع المنتجات 100% صناعة يدوية تونسية أصيلة' },
  { icon: '🤝', title: 'دعم الحرفيين', text: 'نوفر للحرفيين منصة عادلة وشفافة لعرض وبيع منتجاتهم' },
  { icon: '🌱', title: 'الاستدامة', text: 'نشجع استخدام المواد الطبيعية والممارسات المستدامة' },
  { icon: '✨', title: 'الجودة', text: 'نفحص كل منتج لضمان أعلى معايير الجودة والإتقان' },
  { icon: '📦', title: 'خدمة ممتازة', text: 'نلتزم بتوصيل سريع وآمن مع خدمة عملاء متميزة' },
  { icon: '💡', title: 'الابتكار', text: 'نجمع بين التقاليد العريقة والتكنولوجيا الحديثة' },
]

// ============ STORY ITEMS ============
const storyItems = [
  {
    year: '2018',
    title: 'بداية الفكرة',
    description: 'انطلقت الفكرة من شغف مجموعة من الشباب التونسي بالحفاظ على التراث',
  },
  {
    year: '2019',
    title: 'إطلاق المنصة',
    description: 'أطلقنا المنصة بـ 50 حرفي و 200 منتج من مختلف أنحاء تونس',
  },
  {
    year: '2020',
    title: 'توسع رقمي',
    description: 'طورنا المنصة وأضفنا خاصية الدفع الإلكتروني والتوصيل السريع',
  },
  {
    year: '2021',
    title: 'انتشار دولي',
    description: 'بدأنا التوصيل الدولي ووصلنا لعملاء في 30 دولة حول العالم',
  },
  {
    year: '2022',
    title: '500+ حرفي',
    description: 'وصل عدد الحرفيين المسجلين إلى أكثر من 500 حرفي موهوب',
  },
  {
    year: '2023',
    title: 'تطوير مستمر',
    description: 'نواصل التطوير والابتكار لخدمة مجتمع الحرفيين بشكل أفضل',
  },
]

// ============ TEAM MEMBERS ============
const teamMembers = ref([
  {
    id: 1,
    name: 'أحمد بن سالم',
    role: 'المؤسس والرئيس التنفيذي',
    bio: 'رائد أعمال شغوف بالتراث التونسي، قضى 15 عاماً في مجال الحرف التقليدية',
    email: 'ahmed@turath.tn',
    image: 'https://i.pravatar.cc/400?img=12',
  },
  {
    id: 2,
    name: 'سارة المنصوري',
    role: 'مديرة العمليات',
    bio: 'خبيرة في إدارة المنصات الإلكترونية، حاصلة على ماجستير في إدارة الأعمال',
    email: 'sara@turath.tn',
    image: 'https://i.pravatar.cc/400?img=47',
  },
  {
    id: 3,
    name: 'كريم الصغير',
    role: 'مدير التسويق',
    bio: 'متخصص في التسويق الرقمي والعلامات التجارية، خبرة 10 سنوات',
    email: 'karim@turath.tn',
    image: 'https://i.pravatar.cc/400?img=33',
  },
  {
    id: 4,
    name: 'ليلى بن علي',
    role: 'مسؤولة علاقات الحرفيين',
    bio: 'خبيرة في العلاقات المجتمعية، تواصل مباشر مع أكثر من 500 حرفي',
    email: 'layla@turath.tn',
    image: 'https://i.pravatar.cc/400?img=9',
  },
])

// ============ TESTIMONIALS ============
const testimonials = ref([
  {
    id: 1,
    name: 'فاطمة بن علي',
    specialty: 'فخارية تقليدية',
    avatar: 'https://i.pravatar.cc/150?img=25',
    rating: 5,
    quote: 'منصة رائعة غيرت حياتي المهنية. وصلت منتجاتي لعملاء من جميع أنحاء تونس',
    date: '٢٥ يناير ٢٠٢٤',
    product: 'طقم فخاري مزخرف',
  },
  {
    id: 2,
    name: 'محمد الطرابلسي',
    specialty: 'حرفي جلد',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    quote: 'الدعم الممتاز والواجهة السهلة جعلت تجربتي مع المنصة أكثر من رائعة',
    date: '١٢ فبراير ٢٠٢٤',
    product: 'حقيبة جلدية',
  },
  {
    id: 3,
    name: 'ليلى المنصوري',
    specialty: 'مصممة مجوهرات',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    quote: 'أفضل قرار كان الانضمام لهذه المنصة. المبيعات في تزايد مستمر',
    date: '٥ مارس ٢٠٢٤',
    product: 'قلادة فضة أمازيغية',
  },
])

// ============ TOAST ============
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ============ METHODS ============
const showNotification = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    heart: '❤️',
    share: '🔗',
  }

  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type] || icons.info,
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ============ ANIMATIONS ============
onMounted(() => {
  // Counter animation
  const counters = document.querySelectorAll('.counter')
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-count').replace('+', ''))
    let count = 0
    const updateCount = () => {
      if (count < target) {
        count += Math.ceil(target / 100)
        if (count > target) count = target
        counter.innerText = count + '+'
        setTimeout(updateCount, 10)
      } else {
        counter.innerText = target + '+'
      }
    }
    updateCount()
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated')
      }
    })
  }, observerOptions)

  document
    .querySelectorAll('.reveal-text, .reveal-left, .reveal-right, .fade-in-text')
    .forEach((el) => {
      observer.observe(el)
    })
})
</script>

<style scoped>
/* ========================================
   DUAL THEME - #08717f & #d40025
======================================== */
.dual-theme {
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-teal-soft: #e0f5f7;
  --primary-teal-mist: #f0fafb;

  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
  --primary-red-soft: #ffe8ed;
  --primary-red-mist: #fff5f7;

  --gradient-teal: linear-gradient(135deg, #08717f 0%, #0a94a6 100%);
  --gradient-red: linear-gradient(135deg, #d40025 0%, #ff1744 100%);
  --gradient-dual: linear-gradient(135deg, #08717f 0%, #d40025 100%);
  --gradient-dual-horizontal: linear-gradient(90deg, #08717f 0%, #d40025 100%);

  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;

  --shadow-sm: 0 1px 3px rgba(8, 113, 127, 0.08);
  --shadow-md: 0 4px 6px rgba(8, 113, 127, 0.1);
  --shadow-lg: 0 10px 15px rgba(212, 0, 37, 0.1);
  --shadow-xl: 0 20px 25px rgba(8, 113, 127, 0.15);
  --shadow-2xl: 0 25px 50px rgba(212, 0, 37, 0.2);

  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.about-page {
  overflow-x: hidden;
  direction: rtl;
  text-align: right;
  font-family: 'Cairo', 'Segoe UI', sans-serif;
  background: var(--neutral-50);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-spacing {
  padding: 100px 0;
}

/* ========================================
   BUTTONS
======================================== */
.btn {
  padding: 14px 32px;
  border-radius: 50px;
  font-weight: 700;
  font-family: 'Cairo', sans-serif;
  cursor: pointer;
  transition: var(--transition-bounce);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--gradient-teal);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(8, 113, 127, 0.4);
}

.btn-outline-glow {
  background: transparent;
  border: 2px solid var(--primary-teal);
  color: var(--primary-teal);
}

.btn-outline-glow:hover {
  background: var(--primary-teal);
  color: white;
  box-shadow: 0 0 20px rgba(8, 113, 127, 0.5);
  transform: translateY(-3px);
}

.btn-glow {
  position: relative;
  overflow: hidden;
  z-index: 1;
  background: white;
  color: var(--primary-teal-dark);
  padding: 16px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
}

.btn-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: 0.5s;
  z-index: -1;
}

.btn-glow:hover::before {
  left: 100%;
}

.btn-glow:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(8, 113, 127, 0.3);
  color: var(--primary-red-dark);
}

.btn-outline-light {
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  background: transparent;
  backdrop-filter: blur(5px);
}

.btn-outline-light:hover {
  background: white;
  color: var(--primary-teal-dark);
  border-color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ========================================
   SECTION HEADER
======================================== */
.section-header {
  margin-bottom: 60px;
  text-align: center;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--gradient-dual);
  color: white;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
}

.badge-icon {
  font-size: 1.1rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 16px;
  font-family: 'Amiri', 'Cairo', serif;
  font-weight: 900;
  color: var(--neutral-900);
}

.gradient-text {
  background: var(--gradient-dual);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-white {
  background: linear-gradient(135deg, #fff, #ffe0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--neutral-600);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ========================================
   HERO SECTION
======================================== */
.about-hero {
  background: var(--gradient-dual);
  padding: 160px 0 100px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 40%);
  animation: particlesMove 25s infinite alternate;
}

@keyframes particlesMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(30px, 30px);
  }
}

.hero-content {
  position: relative;
  z-index: 5;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  margin-bottom: 30px;
  animation: fadeInDown 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: clamp(3rem, 6vw, 5rem);
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff, #ffe0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGlow 3s ease-in-out infinite alternate;
  font-family: 'Amiri', serif;
  font-weight: 900;
}

@keyframes titleGlow {
  0% {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
  }
}

.page-subtitle {
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  opacity: 0.95;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-cta {
  margin-top: 40px;
}

/* Floating Elements */
.floating-element {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
  z-index: 2;
}

.float-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
  font-size: 3rem;
}

.float-2 {
  bottom: 20%;
  right: 10%;
  animation-delay: 2s;
  font-size: 3.5rem;
}

.float-3 {
  top: 30%;
  right: 20%;
  animation-delay: 4s;
  font-size: 2.8rem;
}

.float-4 {
  bottom: 30%;
  left: 15%;
  animation-delay: 6s;
  font-size: 3.2rem;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* Hero Scroll */
.hero-scroll {
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: bounce 2s infinite;
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}

.scroll-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

.scroll-arrow svg {
  animation: float 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

/* ========================================
   MISSION SECTION
======================================== */
.mission-section {
  background: white;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.mission-image .image-wrapper {
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.floating-image {
  width: 100%;
  height: 600px;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.image-wrapper:hover .floating-image {
  transform: scale(1.08);
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
  bottom: 30px;
  right: 30px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: var(--primary-teal);
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid var(--primary-teal-light);
}

.mission-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.mission-texts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--neutral-700);
}

/* Stats */
.mission-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 40px 0;
}

.stat-box {
  position: relative;
  padding: 30px 20px;
  background: white;
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: var(--transition-bounce);
  border: 1px solid var(--neutral-200);
  overflow: hidden;
  z-index: 1;
}

.stat-box:hover {
  transform: translateY(-10px);
  border-color: var(--primary-teal);
  box-shadow: var(--shadow-xl);
}

.stat-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(8, 113, 127, 0.2), transparent);
  border-radius: 50%;
  transition:
    width 0.5s ease,
    height 0.5s ease;
  z-index: -1;
}

.stat-box:hover .stat-glow {
  width: 200px;
  height: 200px;
}

.stat-number {
  display: block;
  font-size: 2.8rem;
  font-weight: 900;
  font-family: 'Amiri', serif;
  color: var(--primary-teal);
  margin-bottom: 8px;
  line-height: 1;
}

.stat-box:hover .stat-number {
  color: var(--primary-red);
}

.stat-label {
  font-size: 0.95rem;
  color: var(--neutral-600);
  display: block;
  font-weight: 600;
}

.stat-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.stat-box:hover .stat-icon {
  opacity: 0.2;
}

/* ========================================
   VALUES SECTION
======================================== */
.values-section {
  background: var(--neutral-50);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.value-card {
  perspective: 1000px;
  height: 340px;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out both;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px 30px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.value-card:hover .card-inner {
  transform: translateY(-10px) rotateX(5deg);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-teal);
}

.value-icon-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 30px;
}

.value-icon {
  font-size: 4rem;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  transition: transform 0.3s ease;
}

.value-icon-back {
  font-size: 4rem;
  position: absolute;
  top: 8px;
  left: 8px;
  opacity: 0.1;
  color: var(--primary-teal);
}

.card-inner.hovered .value-icon {
  transform: scale(1.2) rotate(15deg);
  color: var(--primary-red);
}

.value-title {
  font-size: 1.6rem;
  margin-bottom: 15px;
  color: var(--neutral-900);
  font-family: 'Amiri', serif;
  font-weight: 700;
}

.value-text {
  color: var(--neutral-600);
  line-height: 1.7;
  margin-bottom: 20px;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: var(--primary-teal);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  justify-content: center;
  font-weight: 700;
}

.value-card:hover .card-footer {
  opacity: 1;
  transform: translateY(0);
}

/* ========================================
   STORY SECTION
======================================== */
.story-section {
  background: white;
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.story-timeline {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.timeline-marker {
  min-width: 80px;
  padding: 12px 8px;
  background: var(--primary-teal-soft);
  border-radius: var(--radius-lg);
  text-align: center;
  font-weight: 800;
  color: var(--primary-teal);
  position: relative;
}

.timeline-marker.teal-marker {
  background: var(--primary-teal-soft);
  color: var(--primary-teal-dark);
}

.timeline-marker.red-marker {
  background: var(--primary-red-soft);
  color: var(--primary-red-dark);
}

.marker-year {
  font-size: 1.1rem;
}

.timeline-content {
  flex: 1;
}

.timeline-content h4 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--neutral-900);
  margin-bottom: 8px;
}

.timeline-content p {
  color: var(--neutral-600);
  line-height: 1.6;
}

/* Image Collage */
.image-collage {
  position: relative;
  height: 500px;
}

.collage-item {
  position: absolute;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: var(--transition-bounce);
}

.collage-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-2xl);
}

.collage-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collage-item.main {
  top: 0;
  right: 0;
  width: 70%;
  height: 70%;
  z-index: 3;
}

.collage-item.small-1 {
  bottom: 0;
  right: 0;
  width: 50%;
  height: 40%;
  z-index: 2;
  border: 4px solid white;
}

.collage-item.small-2 {
  top: 20%;
  left: 0;
  width: 45%;
  height: 35%;
  z-index: 4;
  border: 4px solid white;
}

/* ========================================
   TEAM SECTION
======================================== */
.team-section {
  background: var(--neutral-50);
  position: relative;
}

.parallax-section {
  background:
    linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)),
    url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920') no-repeat center;
  background-size: cover;
  background-attachment: fixed;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: var(--transition-bounce);
  border: 1px solid var(--neutral-200);
}

.team-card:hover {
  transform: translateY(-15px);
  box-shadow: var(--shadow-2xl);
  border-color: var(--primary-teal);
}

.team-image {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.team-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.team-card:hover .team-image img {
  transform: scale(1.1);
}

.team-image .image-overlay {
  background: linear-gradient(to top, rgba(8, 113, 127, 0.5), transparent);
}

.social-links {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s ease;
}

.team-card:hover .social-links {
  transform: translateY(0);
  opacity: 1;
}

.social-link {
  width: 42px;
  height: 42px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--primary-teal);
  transition: var(--transition-bounce);
  box-shadow: var(--shadow-md);
}

.social-link:hover {
  background: var(--primary-teal);
  color: white;
  transform: scale(1.1);
}

.team-info {
  padding: 30px;
  text-align: center;
}

.team-name {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--neutral-900);
  font-family: 'Amiri', serif;
  font-weight: 800;
}

.team-role {
  color: var(--primary-red);
  font-weight: 700;
  margin-bottom: 15px;
}

.team-bio {
  color: var(--neutral-600);
  line-height: 1.7;
  margin-bottom: 20px;
}

.team-contact {
  margin-top: 20px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--neutral-600);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
  font-weight: 600;
}

.contact-link:hover {
  color: var(--primary-teal);
}

/* ========================================
   TESTIMONIALS SECTION
======================================== */
.testimonials-section {
  background: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.testimonial-card {
  background: white;
  padding: 40px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  border: 1px solid var(--neutral-200);
  position: relative;
  overflow: hidden;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-teal);
}

.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: var(--gradient-dual);
  transition: height 0.3s ease;
}

.testimonial-card:hover::before {
  height: 100%;
}

.testimonial-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.testimonial-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid transparent;
  background: var(--gradient-dual) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 3px;
}

.testimonial-info {
  flex: 1;
}

.testimonial-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--neutral-900);
  margin-bottom: 4px;
}

.testimonial-specialty {
  font-size: 0.85rem;
  color: var(--neutral-500);
  font-weight: 600;
}

.testimonial-rating {
  display: flex;
  gap: 4px;
}

.star {
  color: var(--neutral-300);
  font-size: 1.2rem;
}

.star.filled {
  color: #fbbf24;
}

.testimonial-quote {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--neutral-700);
  font-style: italic;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border-right: 4px solid var(--primary-red);
  position: relative;
}

.testimonial-quote::before {
  content: '"';
  position: absolute;
  top: -10px;
  right: 20px;
  font-size: 4rem;
  color: var(--primary-red-light);
  opacity: 0.2;
  font-family: serif;
}

.testimonial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--neutral-200);
}

.testimonial-date {
  font-size: 0.8rem;
  color: var(--neutral-500);
}

.testimonial-product {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-teal);
}

/* ========================================
   CTA SECTION
======================================== */
.cta-section {
  padding: 120px 0;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.animated-gradient {
  background: linear-gradient(-45deg, #08717f, #d40025, #065a69, #b00020);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.cta-icon {
  margin-bottom: 24px;
}

.cta-icon .icon {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.cta-title {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  margin-bottom: 20px;
  font-weight: 900;
  font-family: 'Amiri', serif;
}

.cta-description {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  opacity: 0.95;
  margin-bottom: 40px;
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 60px;
}

.cta-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-stat .stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin-bottom: 5px;
}

.cta-stat .stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.cta-stat-divider {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

/* ========================================
   TOAST NOTIFICATION
======================================== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: var(--shadow-2xl);
  z-index: 9999;
  border: 1px solid var(--neutral-200);
  min-width: 350px;
  max-width: 90vw;
  overflow: hidden;
}

.toast-notification.success {
  border-right: 4px solid var(--primary-teal);
}

.toast-notification.error {
  border-right: 4px solid var(--primary-red);
}

.toast-notification.info {
  border-right: 4px solid var(--primary-teal-light);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 1.3rem;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.toast-close {
  background: none;
  border: none;
  color: var(--neutral-500);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  line-height: 1;
  transition: var(--transition);
}

.toast-close:hover {
  color: var(--neutral-900);
  transform: scale(1.2);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-teal), var(--primary-red));
  animation: progress 3s linear;
}

@keyframes progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}

/* ========================================
   ANIMATIONS
======================================== */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation Classes */
.reveal-text {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.reveal-text.animated {
  opacity: 1;
  transform: translateY(0);
}

.reveal-left {
  opacity: 0;
  transform: translateX(-50px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.reveal-left.animated {
  opacity: 1;
  transform: translateX(0);
}

.reveal-right {
  opacity: 0;
  transform: translateX(50px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.reveal-right.animated {
  opacity: 1;
  transform: translateX(0);
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.3s;
}

.fade-in-delay {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.6s;
}

.fade-in-text {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.fade-in-text.animated {
  opacity: 1;
  transform: translateY(0);
}

.delay-1 {
  transition-delay: 0.2s;
}

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 992px) {
  .mission-grid {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .story-grid {
    grid-template-columns: 1fr;
    gap: 60px;
  }

  .mission-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-spacing {
    padding: 80px 0;
  }

  .image-collage {
    height: 450px;
  }
}

@media (max-width: 768px) {
  .about-hero {
    padding: 120px 0 80px;
    min-height: 80vh;
  }

  .page-title {
    font-size: 2.8rem;
  }

  .mission-stats {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-buttons .btn {
    width: 100%;
    max-width: 300px;
  }

  .hero-scroll {
    bottom: 20px;
  }

  .cta-stats {
    flex-direction: column;
    gap: 20px;
  }

  .cta-stat-divider {
    width: 60px;
    height: 2px;
  }

  .image-collage {
    height: 400px;
  }

  .collage-item.main {
    width: 80%;
    height: 60%;
  }

  .collage-item.small-1,
  .collage-item.small-2 {
    width: 55%;
    height: 35%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2.2rem;
  }

  .page-subtitle {
    font-size: 1.2rem;
  }

  .btn {
    padding: 12px 24px;
    font-size: 0.95rem;
  }

  .mission-stats {
    gap: 16px;
  }

  .stat-box {
    padding: 20px 15px;
  }

  .stat-number {
    font-size: 2.2rem;
  }

  .value-card {
    height: 300px;
  }

  .team-image {
    height: 280px;
  }

  .testimonial-card {
    padding: 30px 20px;
  }

  .image-collage {
    height: 350px;
  }

  .toast-notification {
    min-width: auto;
    width: calc(100% - 32px);
    padding: 12px 16px;
  }
}

/* ========================================
   ACCESSIBILITY
======================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
