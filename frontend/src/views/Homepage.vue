<template>
  <div class="homepage">
    <!-- ===== HERO SLIDER SECTION ===== -->
    <section class="hero-slider-section">
      <div class="slider-container">
        <div
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="slide"
          :class="{ active: currentSlide === index }"
        >
          <video autoplay muted loop playsinline class="slide-video">
            <source :src="slide.video" type="video/mp4" />
          </video>
          <div class="slide-overlay"></div>

          <div class="slide-content">
            <div class="slide-badge" v-if="slide.badge">{{ slide.badge }}</div>
            <h2 class="slide-title">{{ slide.title }}</h2>
            <p class="slide-subtitle">{{ slide.subtitle }}</p>
            <div class="slide-price" v-if="slide.price">
              <span class="current-price">{{ slide.price }}</span>
              <span class="old-price" v-if="slide.oldPrice">{{ slide.oldPrice }}</span>
            </div>
            <button class="slide-btn" @click="navigateTo(slide.link)">
              {{ slide.buttonText || 'اكتشف الآن' }}
            </button>
          </div>
        </div>

        <button class="slider-control prev" @click="prevSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" stroke-width="2"/>
          </svg>
        </button>
        <button class="slider-control next" @click="nextSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2"/>
          </svg>
        </button>

        <div class="slider-dots">
          <span
            v-for="(slide, index) in heroSlides"
            :key="index"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>
    </section>

    <!-- ===== CATEGORIES SCROLL SECTION ===== -->
    <section class="categories-scroll-section">
      <div class="container">
        <div class="categories-scroll-header">
          <span class="scroll-badge">📚 الفئات</span>
          <h2 class="scroll-title">تسوق حسب <span class="gradient-text">اهتمامك</span></h2>
          <p class="scroll-subtitle">اكتشف منتجاتنا المتنوعة حسب الفئة التي تفضلها</p>
        </div>

        <div class="categories-scroll-wrapper">
          <button class="scroll-nav-btn prev-btn" @click="scrollCategories('left')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" stroke-width="2"/>
            </svg>
          </button>

          <div class="categories-scroll-container" ref="scrollContainer">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-scroll-card"
              @click="navigateTo(`/products?category=${category.slug}`)"
            >
              <div class="category-scroll-image" :style="{ backgroundImage: `url(${getCategoryImage(category.slug)})` }">
                <div class="category-scroll-overlay"></div>
              </div>
              <div class="category-scroll-content">
                <span class="category-scroll-icon">{{ category.icon }}</span>
                <h3 class="category-scroll-name">{{ currentLanguage === 'ar' ? category.name : category.nameFr }}</h3>
                <span class="category-scroll-count">{{ category.count }} منتج</span>
              </div>
            </div>
          </div>

          <button class="scroll-nav-btn next-btn" @click="scrollCategories('right')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== SPONSORED PRODUCTS SECTION ===== -->
    <section class="sponsored-section">
      <div class="container">
        <div class="sponsored-header">
          <div class="header-glow"></div>
          <div class="header-content">
            <div class="sponsored-badge">
              <span class="badge-icon">⭐</span>
              <span class="badge-text">منتجات مميزة</span>
            </div>
            <h2 class="sponsored-title">اختيار <span class="title-highlight">الإدارة</span></h2>
            <p class="sponsored-subtitle">منتجات مختارة بعناية فائقة من إدارة المنصة</p>
          </div>
          <button class="sponsored-view-all" @click="$router.push('/products?filter=sponsored')">
            <span>عرض الكل</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2.5"/>
            </svg>
          </button>
        </div>

        <div v-if="loadingSponsored" class="loading-state">
          <div class="premium-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
        </div>

        <div v-else-if="sponsoredProducts.length > 0" class="sponsored-grid">
          <div
            v-for="(product, index) in sponsoredProducts.slice(0, 6)"
            :key="product.id"
            class="sponsored-card-wrapper"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="sponsored-card">
              <div class="featured-badge">
                <span class="badge-star">⭐</span>
                <span class="badge-text">مميز</span>
              </div>
              <ProductCard
                :product="product"
                @liked="handleProductLiked"
                @unliked="handleProductUnliked"
                @added-to-cart="handleAddToCart"
                @quick-view="openQuickView"
              />
            </div>
          </div>
        </div>

        <div v-else class="sponsored-empty">
          <div class="empty-icon-wrapper">
            <span class="empty-icon">⭐</span>
          </div>
          <h3>لا توجد منتجات مميزة حالياً</h3>
          <p>سيتم إضافة منتجات حصرية قريباً</p>
        </div>
      </div>
    </section>

    <!-- ===== POSTS SECTION ===== -->
    <section class="posts-section">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-badge">📰 آخر الإبداعات</span>
            <h2 class="section-title">أحدث <span class="gradient-text">المنتجات</span> من الحرفيين</h2>
          </div>
          <button class="section-view-all" @click="$router.push('/feed')">
            عرض الكل
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div v-if="isLoadingPosts" class="loading-state">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="feedPosts.length > 0" class="posts-grid">
          <div v-for="post in feedPosts.slice(0, 8)" :key="post.id" class="post-card">
            <div class="post-header" @click="goToVendorProfile(getVendorId(post))">
              <img
                :src="getVendorAvatar(post)"
                :alt="getVendorName(post)"
                class="post-avatar"
                @error="handleAvatarError"
              />
              <div class="post-author">
                <h4>{{ truncateText(getVendorName(post), 15) }}</h4>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <div v-if="isVendorVerified(post)" class="verified-badge" title="حرفي موثوق">✓</div>
            </div>

            <div class="post-image-container" @click="openImage(getProductImage(post))">
              <img :src="getProductImage(post)" :alt="getProductName(post)" class="post-image" />
              <div v-if="post.images && post.images.length > 1" class="image-count">
                +{{ post.images.length - 1 }}
              </div>
            </div>

            <div class="post-info">
              <h3 class="product-name">{{ truncateText(getProductName(post), 20) }}</h3>
              <div class="product-price">
                <span class="current-price">{{ formatPrice(getPrice(post)) }} د.ت</span>
                <span v-if="getOldPrice(post)" class="old-price">{{ formatPrice(getOldPrice(post)) }} د.ت</span>
              </div>
              <div class="product-actions">
                <button
                  class="action-btn like-btn"
                  @click="togglePostLike(post)"
                  :class="{ liked: isPostLiked(post.id) }"
                >
                  <span>❤️</span>
                  <span>{{ getLikes(post) }}</span>
                </button>
                <button class="action-btn cart-btn" @click="buyProduct(post)">
                  <span>🛒</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="empty-icon">📝</span>
          <h3>لا توجد منشورات بعد</h3>
          <button
            v-if="authStore.userRole === 'vendor'"
            class="btn-primary"
            @click="goToMyVendorProfile"
          >
            أنشر منتجك
          </button>
        </div>
      </div>
    </section>

    <!-- ===== FEATURES BANNER ===== -->
    <section class="features-banner">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">🚚</span>
            <div>
              <h4>توصيل سريع</h4>
              <p>لجميع أنحاء تونس</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <div>
              <h4>دفع آمن</h4>
              <p>100% آمن</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔄</span>
            <div>
              <h4>إرجاع مجاني</h4>
              <p>في غضون 14 يوم</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎁</span>
            <div>
              <h4>عروض حصرية</h4>
              <p>طوال السنة</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== TOAST NOTIFICATION ===== -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>

    <!-- ===== IMAGE MODAL ===== -->
    <transition name="modal">
      <div v-if="showImageModal" class="modal-overlay" @click.self="showImageModal = false">
        <div class="image-modal-content">
          <img :src="selectedImage" alt="Agrandissement" />
          <button class="close-btn" @click="showImageModal = false">✕</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import heroVideo from '@/assets/nnnn.mp4'

// ===== ROUTER & STORES =====
const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const postStore = usePostStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const productStore = useProductStore()

// ===== STATE =====
const currentSlide = ref(0)
const slideInterval = ref(null)
const isLoadingPosts = ref(false)
const loadingSponsored = ref(false)
const sponsoredProducts = ref([])
const showImageModal = ref(false)
const selectedImage = ref('')
const scrollContainer = ref(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== COMPUTED =====
const currentLanguage = computed(() => locale.value)
const feedPosts = computed(() => postStore.posts || [])

// ===== HERO SLIDES =====
const heroSlides = ref([
  {
    video: heroVideo,
    title: 'ملابس تقليدية عصرية',
    subtitle: 'أناقة تونسية',
    badge: 'تشكيلة جديدة',
    price: '89 د.ت',
    oldPrice: '120 د.ت',
    buttonText: 'اكتشف الآن',
    link: '/products?category=clothing'
  },
  {
    video: heroVideo,
    title: 'اكتشف العطور الفاخرة',
    subtitle: 'أجود العطور التونسية',
    badge: 'خصم 30%',
    price: '120 د.ت',
    oldPrice: '170 د.ت',
    link: '/products?category=perfumes'
  },
  {
    video: heroVideo,
    title: 'مجوهرات تقليدية',
    subtitle: 'صناعة يدوية فاخرة',
    badge: 'توصيل مجاني',
    price: '250 د.ت',
    link: '/products?category=jewelry'
  }
])

// ===== CATEGORIES =====
const categories = ref([
  { id: 1, slug: 'perfumes', name: 'عطور', nameFr: 'Parfums', icon: '🌸', count: 87 },
  { id: 2, slug: 'jewelry', name: 'حلي و اكسسوارات', nameFr: 'Bijoux et accessoires', icon: '💍', count: 312 },
  { id: 3, slug: 'clothing', name: 'ملابس', nameFr: 'Vêtements', icon: '👗', count: 278 },
  { id: 4, slug: 'decor', name: 'ديكور', nameFr: 'Décoration', icon: '🏺', count: 156 },
  { id: 5, slug: 'textiles', name: 'أقمشة وسجادات', nameFr: 'Tissus et tapis', icon: '🧵', count: 234 },
  { id: 6, slug: 'pottery', name: 'أواني', nameFr: 'Poterie', icon: '🍽️', count: 189 },
  { id: 7, slug: 'beauty', name: 'عناية وتجميل', nameFr: 'Soins et beauté', icon: '🧴', count: 123 },
  { id: 8, slug: 'food', name: 'أغذية', nameFr: 'Aliments', icon: '🍯', count: 67 },
  { id: 9, slug: 'other', name: 'أخرى', nameFr: 'Autres', icon: '✨', count: 45 }
])

const getCategoryImage = (slug) => {
  const images = {
    perfumes: '/src/assets/categories/perfumes.jpg',
    jewelry: '/src/assets/categories/jewelry.jpg',
    clothing: '/src/assets/categories/clothing.jpg',
    decor: '/src/assets/categories/decor.jpg',
    textiles: '/src/assets/categories/textiles.jpg',
    pottery: '/src/assets/categories/pottery.jpg',
    beauty: '/src/assets/categories/beauty.jpg',
    food: '/src/assets/categories/food.jpg',
    other: '/src/assets/categories/other.jpg'
  }
  return images[slug] || '/src/assets/categories/default.jpg'
}

// ===== SCROLL CATEGORIES =====
const scrollCategories = (direction) => {
  const container = scrollContainer.value
  if (container) {
    const scrollAmount = 300
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
}

// ===== POST HELPERS =====
const getVendorAvatar = (post) => post.vendor?.avatar || post.vendorAvatar || 'https://i.pravatar.cc/150?u=' + (post.vendorId || post.id)
const getVendorName = (post) => post.vendor?.name || post.vendorName || 'حرفي'
const isVendorVerified = (post) => post.vendor?.verified || post.vendorVerified || false
const getVendorId = (post) => post.vendor?.id || post.vendorId || null
const getProductName = (post) => post.productName || post.name || 'منتج حرفي'
const getProductImage = (post) => (post.images && post.images[0]) || post.image || 'https://placehold.co/300x400/08717f/white?text=منتج'
const getPrice = (post) => post.price || 0
const getOldPrice = (post) => post.oldPrice || post.originalPrice || null
const getLikes = (post) => post.likes || post.likesCount || 0
const truncateText = (text, length) => !text ? '' : text.length > length ? text.substring(0, length) + '...' : text
const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return 'اليوم'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 7) return `منذ ${days} أيام`
  return date.toLocaleDateString('ar-TN')
}

const handleAvatarError = (e) => {
  e.target.src = 'https://i.pravatar.cc/150?u=' + Date.now()
}

// ===== NOTIFICATIONS =====
const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', heart: '❤️', cart: '🛒' }
  toast.value = { show: true, message, type, icon: icons[type] || icons.info }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ===== SPONSORED PRODUCTS =====
const loadSponsoredProducts = async () => {
  loadingSponsored.value = true
  try {
    await productStore.fetchSponsoredProducts()
    sponsoredProducts.value = productStore.sponsoredProducts || []
    console.log('⭐ Produits sponsorisés chargés:', sponsoredProducts.value.length)
  } catch (error) {
    console.error('❌ Erreur chargement produits sponsorisés:', error)
    sponsoredProducts.value = []
  } finally {
    loadingSponsored.value = false
  }
}

// ===== POST ACTIONS =====
const isPostLiked = (postId) => likesStore.isLiked(postId)

const togglePostLike = (post) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (isPostLiked(post.id)) {
    likesStore.removeLike(post.id)
    post.likes = (post.likes || 0) - 1
    showNotification('تمت إزالة الإعجاب', 'info')
  } else {
    likesStore.addLike({ id: post.id, ...post })
    post.likes = (post.likes || 0) + 1
    showNotification('تم الإعجاب بالمنتج', 'heart')
  }
}

const buyProduct = (post) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  cartStore.addItem({
    id: post.id,
    name: getProductName(post),
    price: getPrice(post),
    image: getProductImage(post),
    quantity: 1,
    vendorName: getVendorName(post),
  })
  showNotification('تمت إضافة المنتج إلى السلة', 'cart')
}

// ===== PRODUCT ACTIONS =====
const handleProductLiked = (product) => showNotification(`تمت إضافة "${product.name}" إلى المفضلة`, 'heart')
const handleProductUnliked = () => showNotification('تمت إزالة المنتج من المفضلة', 'info')
const handleAddToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    vendorName: product.vendor?.name,
  })
  showNotification(`تمت إضافة "${product.name}" إلى السلة`, 'cart')
}
const openQuickView = (product) => console.log('Quick view:', product)

// ===== NAVIGATION =====
const navigateTo = (path) => router.push(path)
const goToVendorProfile = (vendorId) => { if (vendorId) router.push(`/vendor/${vendorId}`) }
const goToMyVendorProfile = () => { if (authStore.userRole === 'vendor') router.push(`/vendor/${authStore.user.id}`) }
const openImage = (img) => { if (img) { selectedImage.value = img; showImageModal.value = true } }

// ===== SLIDER =====
const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length; resetInterval() }
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length; resetInterval() }
const startSlideInterval = () => { slideInterval.value = setInterval(() => { currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length }, 5000) }
const resetInterval = () => { if (slideInterval.value) { clearInterval(slideInterval.value); startSlideInterval() } }

// ===== LIFECYCLE =====
onMounted(async () => {
  console.log('🚀 Homepage mounted')
  likesStore.loadFromStorage()
  cartStore.loadFromStorage()
  await loadSponsoredProducts()
  isLoadingPosts.value = true
  try {
    await postStore.fetchFeed()
    console.log('📊 Posts chargés:', postStore.posts?.length || 0)
  } catch (error) {
    console.error('❌ Erreur chargement feed:', error)
  } finally {
    isLoadingPosts.value = false
  }
  startSlideInterval()
})

onUnmounted(() => { if (slideInterval.value) clearInterval(slideInterval.value) })
</script>

<style scoped>
/* ===== RESET & VARIABLES ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  font-family: 'Cairo', sans-serif;
  background: #f8fafc;
  direction: rtl;
  overflow-x: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== HERO SLIDER SECTION ===== */
.hero-slider-section {
  position: relative;
  height: 90vh;
  min-height: 600px;
  overflow: hidden;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease;
  z-index: 1;
}

.slide.active {
  opacity: 1;
  z-index: 2;
}

.slide-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide.active .slide-video {
  transform: scale(1.1);
  transition: transform 8s ease;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%);
  z-index: 2;
}

.slide-content {
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  color: white;
  z-index: 3;
  max-width: 500px;
  text-align: right;
  animation: slideInRight 0.8s ease;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translate(50px, -50%); }
  to { opacity: 1; transform: translate(0, -50%); }
}

.slide-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.slide-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 15px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.slide-subtitle {
  font-size: 1.2rem;
  margin-bottom: 20px;
  opacity: 0.95;
}

.slide-price {
  margin-bottom: 30px;
}

.current-price {
  font-size: 2rem;
  font-weight: 800;
  color: #ffd700;
  margin-left: 10px;
}

.old-price {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
}

.slide-btn {
  padding: 15px 40px;
  background: white;
  color: #000;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-btn:hover {
  transform: translateY(-3px);
  background: #ffd700;
}

.slider-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.slider-control:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.slider-control.prev { left: 30px; }
.slider-control.next { right: 30px; }

.slider-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

/* ===== CATEGORIES SCROLL SECTION ===== */
.categories-scroll-section {
  padding: 40px 0;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}

.categories-scroll-header {
  text-align: center;
  margin-bottom: 30px;
}

.scroll-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.scroll-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.scroll-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.categories-scroll-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.categories-scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 20px;
  padding: 10px 5px;
  scrollbar-width: thin;
  flex: 1;
}

.categories-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.categories-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.categories-scroll-container::-webkit-scrollbar-thumb {
  background: #08717f;
  border-radius: 10px;
}

.category-scroll-card {
  flex: 0 0 180px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-scroll-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(8, 113, 127, 0.15);
}

.category-scroll-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.category-scroll-card:hover .category-scroll-image {
  transform: scale(1.1);
}

.category-scroll-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}

.category-scroll-content {
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  z-index: 2;
  text-align: right;
}

.category-scroll-icon {
  font-size: 1.8rem;
  margin-bottom: 5px;
  display: block;
}

.category-scroll-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 3px;
}

.category-scroll-count {
  font-size: 0.7rem;
  opacity: 0.9;
}

.scroll-nav-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #08717f;
  flex-shrink: 0;
}

.scroll-nav-btn:hover {
  background: #08717f;
  color: white;
  border-color: #08717f;
  transform: scale(1.1);
}

/* ===== SPONSORED SECTION ===== */
.sponsored-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.sponsored-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
  flex-wrap: wrap;
  gap: 20px;
}

.header-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(8, 113, 127, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(40px);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

.sponsored-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(212, 0, 37, 0.2);
  overflow: hidden;
}

.sponsored-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.title-highlight {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sponsored-subtitle {
  color: #64748b;
  font-size: 1rem;
  max-width: 500px;
  line-height: 1.6;
}

.sponsored-view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #08717f;
  border: 2px solid #08717f;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sponsored-view-all:hover {
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-color: transparent;
  transform: translateX(-5px);
}

.sponsored-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.sponsored-card-wrapper {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.sponsored-card {
  position: relative;
  transition: all 0.3s ease;
}

.sponsored-card:hover {
  transform: translateY(-8px) scale(1.02);
  z-index: 10;
}

.featured-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  z-index: 20;
  animation: badgeFloat 3s ease-in-out infinite;
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* ===== POSTS SECTION ===== */
.posts-section {
  padding: 60px 0;
  background: white;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(8, 113, 127, 0.1);
  border-color: #08717f;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.post-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author {
  flex: 1;
}

.post-author h4 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.post-date {
  font-size: 0.65rem;
  color: #64748b;
}

.verified-badge {
  width: 16px;
  height: 16px;
  background: #08717f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
}

.post-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
}

.post-info {
  padding: 10px;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1.3;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 1rem;
  font-weight: 800;
  color: #d40025;
}

.old-price {
  font-size: 0.75rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.product-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f1f5f9;
  color: #64748b;
}

.like-btn.liked {
  background: #ffe8ed;
  color: #d40025;
}

.cart-btn {
  background: #08717f;
  color: white;
}

.cart-btn:hover {
  background: #065a69;
}

/* ===== FEATURES BANNER ===== */
.features-banner {
  background: linear-gradient(135deg, #08717f, #065a69);
  padding: 40px 0;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-icon {
  font-size: 2rem;
}

.feature-item h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.feature-item p {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.gradient-text {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  color: #08717f;
  border: 2px solid #08717f;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-view-all:hover {
  background: #08717f;
  color: white;
  transform: translateX(-5px);
}

/* ===== LOADING STATES ===== */
.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.premium-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
}

.spinner-ring:nth-child(1) { border-top-color: #08717f; animation: spin 1s linear infinite; }
.spinner-ring:nth-child(2) { border-right-color: #d40025; animation: spin 1.2s linear infinite reverse; }
.spinner-ring:nth-child(3) { border-bottom-color: #fbbf24; animation: spin 0.8s linear infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== EMPTY STATES ===== */
.sponsored-empty {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 30px;
  border: 2px dashed #e2e8f0;
}

.empty-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 3rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* ===== TOAST & MODAL ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 9999;
  min-width: 250px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.cart { border-right-color: #08717f; }
.toast-notification.heart { border-right-color: #d40025; }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
  background: #d40025;
  color: white;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .sponsored-grid { grid-template-columns: repeat(4, 1fr); }
  .posts-grid { grid-template-columns: repeat(3, 1fr); }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 992px) {
  .hero-slider-section { height: 70vh; }
  .slide-title { font-size: 2.5rem; }
  .sponsored-grid { grid-template-columns: repeat(3, 1fr); }
  .posts-grid { grid-template-columns: repeat(2, 1fr); }
  .category-scroll-card { flex: 0 0 160px; height: 180px; }
}

@media (max-width: 768px) {
  .hero-slider-section { height: 60vh; }
  .slide-title { font-size: 2rem; }
  .slide-content { right: 5%; left: 5%; max-width: none; }
  .slider-control { width: 40px; height: 40px; }
  .sponsored-grid { grid-template-columns: repeat(2, 1fr); }
  .posts-grid { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .category-scroll-card { flex: 0 0 140px; height: 160px; }
  .scroll-nav-btn { display: none; }
  .categories-scroll-container { overflow-x: auto; }
}
</style>
