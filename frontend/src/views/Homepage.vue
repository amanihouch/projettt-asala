<!-- frontend/src/views/Homepage.vue - POPUP POUR TOUS LES UTILISATEURS -->
<template>
  <div class="homepage" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <!-- ===== PRELOADER LUXUEUX ===== -->
    <div v-if="showPreloader" class="preloader">
      <div class="preloader-content">
        <div class="preloader-logo-wrapper">
          <img src="/src/assets/asala logo.svg" alt="أصالة" class="preloader-logo" />
        </div>
        <div class="preloader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="preloader-text">تحميل</p>
      </div>
    </div>

    <!-- ===== SCROLL TO TOP ===== -->
    <transition name="fade">
      <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5L12 19" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 11L12 5L6 11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </transition>

    <!-- ===== HERO SECTION ===== -->
    <section class="hero-cinematic">
      <div v-for="(slide, index) in heroSlides" :key="index" class="hero-slide" :class="{ active: currentSlide === index }">
        <div class="hero-media">
          <video autoplay muted loop playsinline class="hero-video">
            <source :src="slide.video" type="video/mp4" />
          </video>
          <div class="hero-overlay"></div>
          <div class="hero-gradient"></div>
        </div>
        <div class="hero-content">
          <div class="hero-tag" v-if="slide.badge">
            <span class="tag-line"></span>
            <span class="tag-text">{{ slide.badge }}</span>
            <span class="tag-line"></span>
          </div>
          <h1 class="hero-title">{{ slide.title }}</h1>
          <p class="hero-subtitle">{{ slide.subtitle }}</p>
          <div class="hero-price-wrapper" v-if="slide.price">
            <span class="hero-price">{{ slide.price }}</span>
            <span class="hero-old-price" v-if="slide.oldPrice">{{ slide.oldPrice }}</span>
          </div>
          <button class="hero-btn" @click="navigateTo(slide.link)">
            <span>{{ slide.buttonText }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12L19 12" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 5L19 12L12 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="hero-nav prev" @click="prevSlide">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18L9 12L15 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="hero-nav next" @click="nextSlide">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18L15 12L9 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="hero-dots">
        <span v-for="(slide, index) in heroSlides" :key="index" class="hero-dot" :class="{ active: currentSlide === index }" @click="currentSlide = index"></span>
      </div>
      <div class="hero-scroll-indicator" @click="scrollToCategories">
        <span class="scroll-text">استكشف</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5L12 19" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 13L12 19L6 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- ===== CATEGORIES SECTION ===== -->
    <section class="categories-minimal" ref="categoriesSection">
      <div class="container">
        <div class="categories-header">
          <span class="section-label">تصنيفات</span>
          <h2 class="section-title"><span class="title-accent"></span>تسوق حسب <span class="title-highlight">اهتمامك</span></h2>
          <p class="section-subtitle">اكتشف تشكيلتنا المتنوعة من المنتجات التقليدية التونسية</p>
        </div>
        <div class="categories-scroll-wrapper">
          <button class="scroll-nav prev" @click="scrollCategoriesLeft" v-if="categories.length > 5" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18L15 12L9 6" stroke-width="2"/></svg>
          </button>
          <div class="categories-container" ref="scrollContainer">
            <div v-for="category in categories" :key="category.id" class="category-card" @click="navigateTo(`/products?category=${category.slug}`)">
              <div class="category-image-wrapper">
                <img :src="category.imageUrl" :alt="category.nameAr" class="category-image" loading="lazy" />
                <div class="category-overlay"><span class="category-icon-text">{{ category.icon }}</span></div>
              </div>
              <div class="category-info">
                <h3 class="category-name">{{ category.nameAr }}</h3>
                <span class="category-count">{{ category.products_count }} منتج</span>
              </div>
            </div>
          </div>
          <button class="scroll-nav next" @click="scrollCategoriesRight" v-if="categories.length > 5" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18L9 12L15 6" stroke-width="2"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ===== SECTION PRODUITS & REELS ===== -->
    <section class="featured-products">
      <div class="container">
        <div class="section-header-compact">
          <div class="header-left">
            <span class="section-tag">منتجات الحرفيين</span>
            <h2 class="section-title-compact">أحدث <span>المنتجات</span></h2>
          </div>
          <div class="header-right">
            <div class="filter-tabs">
              <button v-for="filter in productFilters" :key="filter.value" class="filter-tab" :class="{ active: activeFilter === filter.value }" @click="activeFilter = filter.value">{{ filter.label }}</button>
            </div>
          </div>
        </div>
        <div v-if="isLoadingPosts || isLoadingReels" class="loading-minimal"><div class="spinner-elegant"></div></div>
        <div v-else-if="activeFilter === 'videos'" class="reels-grid-home">
          <div v-for="reel in displayedReels" :key="reel.id" class="reel-card-home" @click="openReelModal(reel)">
            <div class="reel-video-wrapper">
              <video :src="reel.videoUrl" class="reel-video-home" muted loop playsinline @mouseenter="(e) => { e.target.play() }" @mouseleave="(e) => { e.target.pause(); e.target.currentTime = 0 }"></video>
              <div class="reel-overlay-home">
                <div class="reel-play-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg></div>
                <div class="reel-stats-home">
                  <span class="reel-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> {{ reel.likes || 0 }}</span>
                  <span class="reel-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ reel.views || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="reel-info-home">
              <div class="reel-vendor-home"><img :src="reel.vendorAvatar || 'https://i.pravatar.cc/40'" :alt="reel.vendorName" /><span>{{ truncateText(reel.vendorName || reel.shopName || 'حرفي', 15) }}</span></div>
              <h4 class="reel-title-home">{{ truncateText(reel.title, 30) }}</h4>
            </div>
          </div>
          <div v-if="displayedReels.length === 0" class="empty-minimal"><div class="empty-content"><span class="empty-symbol">🎬</span><p>لا توجد فيديوهات بعد</p></div></div>
        </div>
        <div v-else-if="activeFilter !== 'videos' && filteredPosts.length > 0" class="products-grid">
          <div v-for="post in displayedPosts" :key="post.id" class="product-card-minimal" @click="openQuickView(post)">
            <div class="product-image-container">
              <img :src="getProductImage(post)" :alt="getProductName(post)" loading="lazy" />
              <div v-if="hasVideo(post)" class="video-indicator"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
              <div class="product-price-tag">{{ formatPrice(getPrice(post)) }} د.ت</div>
              <div class="product-hover-actions">
                <button class="hover-btn cart" @click.stop="buyProduct(post)" title="أضف إلى السلة"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6H21L19 16H5L3 6Z" stroke-width="1.5"/><circle cx="8" cy="20" r="1.5" stroke-width="1.5"/><circle cx="18" cy="20" r="1.5" stroke-width="1.5"/></svg></button>
                <button class="hover-btn wishlist" @click.stop="togglePostLike(post)" :class="{ active: isPostLiked(post.id) }" title="المفضلة"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke-width="1.5"/></svg></button>
              </div>
            </div>
            <div class="product-info-minimal">
              <div class="vendor-row"><img :src="getPostVendorAvatar(post)" :alt="getVendorName(post)" @error="handleAvatarError" class="vendor-avatar-mini" /><span class="vendor-name-mini">{{ truncateText(getVendorName(post), 12) }}</span></div>
              <h4 class="product-title-mini">{{ truncateText(getProductName(post), 25) }}</h4>
            </div>
          </div>
        </div>
        <div v-else-if="activeFilter !== 'videos'" class="empty-minimal"><div class="empty-content"><span class="empty-symbol">✦</span><p>لا توجد منتجات بعد</p></div></div>
        <div class="more-link-wrapper" v-if="(activeFilter === 'videos' ? displayedReels.length : filteredPosts.length) > 0">
          <button class="more-link" @click="$router.push(activeFilter === 'videos' ? '/reels' : '/products')"><span>عرض المزيد</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12L19 12" stroke-width="2" stroke-linecap="round"/><path d="M12 5L19 12L12 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
      </div>
    </section>

    <!-- ===== CARACTERISTIQUES PREMIUM ===== -->
    <section class="features-premium">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item"><div class="feature-icon-wrapper"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 8L20 20L4 20L4 8" stroke-width="1.5"/><path d="M22 6L12 3L2 6L12 9L22 6Z" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 12L12 21" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feature-content"><h4>توصيل سريع</h4><p>لجميع أنحاء الجمهورية التونسية</p></div></div>
          <div class="feature-item"><div class="feature-icon-wrapper"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" stroke-width="1.5"/><path d="M8 10L12 14L16 10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14L12 20" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feature-content"><h4>دفع آمن</h4><p>معاملات مشفرة وحماية كاملة</p></div></div>
          <div class="feature-item"><div class="feature-icon-wrapper"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 12L11 14L15 10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke-width="1.5"/><path d="M12 8L12 12" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feature-content"><h4>منتجات أصلية</h4><p>حرف يدوية تونسية أصيلة</p></div></div>
          <div class="feature-item"><div class="feature-icon-wrapper"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12H21M12 3V21" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke-width="1.5"/></svg></div><div class="feature-content"><h4>دعم متواصل</h4><p>خدمة عملاء على مدار الساعة</p></div></div>
        </div>
      </div>
    </section>

    <!-- ===== REEL MODAL ===== -->
    <transition name="modal-zoom">
      <div v-if="showReelModal" class="reel-modal-overlay-home" @click.self="closeReelModal">
        <div class="reel-modal-home">
          <button class="modal-close-btn" @click="closeReelModal"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6L18 18" stroke-width="2" stroke-linecap="round"/></svg></button>
          <div class="reel-modal-content-home" v-if="selectedReel">
            <video :src="selectedReel.videoUrl" class="reel-modal-video-home" controls autoplay playsinline loop></video>
            <div class="reel-modal-info-home">
              <div class="reel-modal-vendor"><img :src="selectedReel.vendorAvatar || 'https://i.pravatar.cc/50'" :alt="selectedReel.vendorName" /><div><h3>{{ selectedReel.vendorName || selectedReel.shopName }}</h3><span class="vendor-handle">@{{ (selectedReel.vendorName || selectedReel.shopName || 'artisan').toLowerCase().replace(/\s/g, '') }}</span></div></div>
              <h2 class="reel-modal-title">{{ selectedReel.title }}</h2>
              <p class="reel-modal-description">{{ selectedReel.description }}</p>
              <div class="reel-modal-stats"><span><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> {{ selectedReel.likes || 0 }} إعجاب</span><span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ selectedReel.views || 0 }} مشاهدة</span></div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== ✅ PROMO POPUP - POUR TOUS LES UTILISATEURS ===== -->
    <PromoPopup
      :offers="activeOffers"
      :is-visible="showPromoPopup"
      @close="closePromoPopup"
      @remind="handleRemindLater"
    />

    <!-- ===== QUICK VIEW MODAL ===== -->
    <transition name="modal-zoom">
      <div v-if="showQuickView" class="quick-view-overlay" @click.self="closeQuickView">
        <div class="quick-view-modal">
          <button class="modal-close-btn" @click="closeQuickView"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6L18 18" stroke-width="2" stroke-linecap="round"/></svg></button>
          <div class="modal-content-grid" v-if="selectedPost">
            <div class="modal-image"><img :src="getProductImage(selectedPost)" :alt="getProductName(selectedPost)" /></div>
            <div class="modal-info">
              <div class="modal-vendor"><img :src="getPostVendorAvatar(selectedPost)" :alt="getVendorName(selectedPost)" /><span>{{ getVendorName(selectedPost) }}</span></div>
              <h2>{{ getProductName(selectedPost) }}</h2>
              <div class="modal-price">{{ formatPrice(getPrice(selectedPost)) }} د.ت</div>
              <p class="modal-description">{{ selectedPost.description || 'منتج حرفي تونسي أصيل مصنوع يدوياً بأعلى معايير الجودة.' }}</p>
              <div class="modal-actions">
                <button class="modal-btn primary" @click="buyProduct(selectedPost); closeQuickView()">أضف إلى السلة</button>
                <button class="modal-btn secondary" @click="goToProduct(selectedPost.id)">عرض التفاصيل</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== TOAST NOTIFICATION ===== -->
    <transition name="toast-slide">
      <div v-if="toast.show" class="toast-elegant" :class="toast.type">
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useThemeStore } from '../stores/theme'
import { useOffersStore } from '../stores/offers'
import api from '../services/api'
import PromoPopup from '../components/PromoPopup.vue'

const router = useRouter()
const authStore = useAuthStore()
const postStore = usePostStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const themeStore = useThemeStore()
const offersStore = useOffersStore()

const { activeOffers } = storeToRefs(offersStore)
const isDarkMode = computed(() => themeStore.isDarkMode)

// State
const showPreloader = ref(true)
const showScrollTop = ref(false)
const currentSlide = ref(0)
const slideInterval = ref(null)
const isLoadingPosts = ref(false)
const isLoadingReels = ref(false)
const categories = ref([])
const scrollContainer = ref(null)
const categoriesSection = ref(null)
const showPromoPopup = ref(false)
const activeFilter = ref('all')
const showQuickView = ref(false)
const selectedPost = ref(null)
const showReelModal = ref(false)
const selectedReel = ref(null)
const reelsList = ref([])
const toast = ref({ show: false, message: '', type: 'success' })

// Hero Slides
const heroSlides = ref([
  { video: '/src/assets/videos/slide2.mp4', title: 'ملابس تقليدية عصرية', subtitle: 'أناقة تونسية أصيلة تجمع بين التراث والحداثة', badge: 'تشكيلة جديدة', price: '89 د.ت', oldPrice: '120 د.ت', buttonText: 'اكتشف الآن', link: '/products?category=clothing' },
  { video: '/src/assets/videos/slide1.mp4', title: 'اكتشف العطور الفاخرة', subtitle: 'أجود العطور التونسية المستخلصة من الطبيعة', badge: 'خصم ٣٠٪', price: '120 د.ت', oldPrice: '170 د.ت', buttonText: 'تسوق الآن', link: '/products?category=perfumes' },
  { video: '/src/assets/videos/slide3.mp4', title: 'مجوهرات تقليدية فاخرة', subtitle: 'صناعة يدوية تونسية بتصاميم فريدة', badge: 'توصيل مجاني', price: '250 د.ت', buttonText: 'اكتشف المجموعة', link: '/products?category=jewelry' }
])

const productFilters = [
  { value: 'all', label: 'الكل' },
  { value: 'products', label: 'منتجات' },
  { value: 'videos', label: 'فيديو' },
  { value: 'popular', label: 'الأكثر شهرة' }
]

// Computed
const feedPosts = computed(() => postStore.posts || [])

const filteredPosts = computed(() => {
  let posts = [...feedPosts.value]
  switch (activeFilter.value) {
    case 'products': return posts.filter(p => !hasVideo(p))
    case 'videos': return posts.filter(p => hasVideo(p))
    case 'popular': return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    default: return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

const displayedPosts = computed(() => filteredPosts.value.slice(0, 12))

const filteredReels = computed(() => {
  let reels = [...reelsList.value]
  if (activeFilter.value === 'popular') return reels.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  return reels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const displayedReels = computed(() => filteredReels.value.slice(0, 12))

// Helpers
const getProductImage = (post) => post.images?.[0] || post.image || 'https://placehold.co/600x600/08717f/f5f5f5?text=منتج'
const getPostVendorAvatar = (post) => post.vendor?.avatar || post.vendorAvatar || `https://i.pravatar.cc/150?u=${post.id}`
const getVendorName = (post) => post.vendor?.name || post.vendorName || post.vendor?.shopName || 'حرفي تونسي'
const getProductName = (post) => post.productName || post.name || 'منتج حرفي'
const getPrice = (post) => post.price || 0
const hasVideo = (post) => post.hasVideo || post.video || false
const truncateText = (text, length) => text ? (text.length > length ? text.substring(0, length) + '...' : text) : ''
const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)
const handleAvatarError = (e) => { e.target.src = 'https://i.pravatar.cc/150?u=' + Date.now() }

// Category Images
const getCategoryImage = (slug) => {
  const images = { carpets: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/carpets.jpg', perfumes: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/perfumes.jpg', jewelry: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/jewelry.jpg', clothing: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/clothing.jpg', decor: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/decor.jpg', textiles: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/textiles.jpg', pottery: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/pottery.jpg', beauty: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/beauty.jpg', food: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/food.jpg', copperware: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/copperware.jpg', default: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/default.jpg' }
  return images[slug] || images.default
}

const getCategoryIcon = (slug) => {
  const icons = { carpets: 'ز', perfumes: 'ع', jewelry: 'م', clothing: 'م', decor: 'د', textiles: 'ن', pottery: 'ف', beauty: 'ت', food: 'غ', copperware: 'ن' }
  return icons[slug] || 'ح'
}

const loadCategories = async () => {
  try {
    const response = await api.get('/categories')
    let data = []
    if (response.data.success) {
      if (response.data.data?.categories) data = response.data.data.categories
      else if (response.data.categories) data = response.data.categories
      else if (Array.isArray(response.data.data)) data = response.data.data
    }
    categories.value = (Array.isArray(data) ? data : []).map(cat => ({ id: cat.id, slug: cat.slug, name: cat.name, nameAr: cat.nameAr || cat.name, icon: getCategoryIcon(cat.slug), imageUrl: cat.imageUrl || getCategoryImage(cat.slug), products_count: cat.productsCount || cat.count || 0 }))
  } catch (error) { console.error('Erreur chargement categories:', error) }
}

const loadReels = async () => {
  isLoadingReels.value = true
  try {
    const response = await api.get('/reels?limit=12')
    if (response.data.success) {
      reelsList.value = response.data.data?.reels || response.data.reels || []
    } else {
      const postsResponse = await api.get('/posts/feed')
      if (postsResponse.data.success) {
        const posts = postsResponse.data.data?.posts || postsResponse.data.posts || []
        reelsList.value = posts.filter(post => post.videoUrl || post.hasVideo).map(post => ({ id: post.id, title: post.productName || post.name, description: post.description, videoUrl: post.videoUrl || post.video, vendorName: post.vendorName || post.vendor?.shopName, vendorAvatar: post.vendorAvatar || post.vendor?.avatar, likes: post.likes || 0, views: post.views || 0, createdAt: post.createdAt, status: post.status || 'approved' }))
      }
    }
  } catch (error) { reelsList.value = getMockReels() }
  finally { isLoadingReels.value = false }
}

const getMockReels = () => [
  { id: 1, title: 'صناعة الفخار التقليدي', description: 'شاهد الحرفي التونسي وهو يصنع أجمل التحف الفخارية', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', vendorName: 'حرفي الفخار', vendorAvatar: 'https://i.pravatar.cc/150?img=1', likes: 245, views: 1280, createdAt: new Date().toISOString() },
  { id: 2, title: 'تطريز يدوي تونسي', description: 'فن التطريز التقليدي التونسي', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', vendorName: 'فن التطريز', vendorAvatar: 'https://i.pravatar.cc/150?img=2', likes: 189, views: 950, createdAt: new Date().toISOString() },
  { id: 3, title: 'عطر تونسي أصيل', description: 'تحضير العطر التونسي التقليدي', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', vendorName: 'دار العطور', vendorAvatar: 'https://i.pravatar.cc/150?img=3', likes: 567, views: 3420, createdAt: new Date().toISOString() }
]

const showNotification = (message, type = 'success') => { toast.value = { show: true, message, type }; setTimeout(() => { toast.value.show = false }, 3000) }

const isPostLiked = (postId) => likesStore.isLiked(postId)
const togglePostLike = (post) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (isPostLiked(post.id)) { likesStore.removeLike(post.id); showNotification('تمت إزالة الإعجاب', 'info') }
  else { likesStore.addLike({ id: post.id, ...post }); showNotification('تم الإعجاب بالمنتج', 'success') }
}

const buyProduct = (post) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  cartStore.addItem({ id: post.id, name: getProductName(post), price: getPrice(post), image: getProductImage(post), quantity: 1 })
  showNotification('تمت إضافة المنتج إلى السلة', 'success')
}

const openQuickView = (post) => { selectedPost.value = post; showQuickView.value = true; document.body.style.overflow = 'hidden' }
const closeQuickView = () => { showQuickView.value = false; selectedPost.value = null; document.body.style.overflow = '' }
const openReelModal = (reel) => { selectedReel.value = reel; showReelModal.value = true; document.body.style.overflow = 'hidden' }
const closeReelModal = () => { showReelModal.value = false; selectedReel.value = null; document.body.style.overflow = '' }
const goToProduct = (id) => { if (id) router.push(`/product/${id}`) }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const scrollToCategories = () => { categoriesSection.value?.scrollIntoView({ behavior: 'smooth' }) }

// ✅ GESTION POPUP - POUR TOUS LES UTILISATEURS
const openPromoPopup = () => {
  if (activeOffers.value.length > 0) {
    showPromoPopup.value = true
  }
}
const closePromoPopup = () => { showPromoPopup.value = false }
const handleRemindLater = () => { showNotification('سنذكرك لاحقاً', 'info'); showPromoPopup.value = false }
const navigateTo = (path) => { if (path) router.push(path) }

const scrollCategoriesLeft = () => { scrollContainer.value?.scrollBy({ left: -300, behavior: 'smooth' }) }
const scrollCategoriesRight = () => { scrollContainer.value?.scrollBy({ left: 300, behavior: 'smooth' }) }

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length; resetInterval() }
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length; resetInterval() }
const startSlideInterval = () => { slideInterval.value = setInterval(() => { currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length }, 6000) }
const resetInterval = () => { if (slideInterval.value) { clearInterval(slideInterval.value); startSlideInterval() } }
const handleScroll = () => { showScrollTop.value = window.scrollY > 500 }

onMounted(async () => {
  setTimeout(() => { showPreloader.value = false }, 1800)
  likesStore.loadFromStorage()
  cartStore.loadFromStorage()
  offersStore.loadOffers()
  await loadCategories()
  await loadReels()
  await nextTick()
  isLoadingPosts.value = true
  try { await postStore.fetchFeed() } catch (error) { console.error('Erreur chargement feed:', error) } finally { isLoadingPosts.value = false }
  startSlideInterval()
  // ✅ OUVERTURE POPUP APRÈS 800ms POUR TOUS
  setTimeout(() => { openPromoPopup() }, 800)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (slideInterval.value) clearInterval(slideInterval.value)
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>
<style scoped>
/* ===== IMPORT DE LA POLICE ARABE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');

/* ===== HOMEPAGE - DESIGN EXTRAORDINAIRE AVEC AMIRI ===== */
.homepage {
  font-family: 'Amiri', 'Cairo', 'Tajawal', serif;
  background: #fafbfc;
  direction: rtl;
  overflow-x: hidden;
}

.homepage.dark-mode { background: #0a0e14; }
.container { max-width: 1440px; margin: 0 auto; padding: 0 32px; }

/* ===== PRELOADER ===== */
.preloader {
  position: fixed;
  inset: 0;
  background: #0a0e14;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeOut 0.6s ease 1.8s forwards;
}

@keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
.preloader-content { text-align: center; }
.preloader-logo-wrapper { margin-bottom: 32px; animation: logoFloat 2s ease-in-out infinite; }
@keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.preloader-logo { height: 80px; width: auto; filter: brightness(0) invert(1); }
.preloader-spinner { position: relative; width: 56px; height: 56px; margin: 0 auto 24px; }
.preloader-spinner .spinner-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; }
.preloader-spinner .spinner-ring:nth-child(1) { border-top-color: #08717f; animation: spin 1.2s linear infinite; }
.preloader-spinner .spinner-ring:nth-child(2) { border-right-color: #d40025; animation: spin 1.6s linear infinite reverse; }
.preloader-spinner .spinner-ring:nth-child(3) { border-bottom-color: #c9a04a; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.preloader-text { color: rgba(255, 255, 255, 0.7); font-size: 1.2rem; font-weight: 300; letter-spacing: 8px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ===== SCROLL TO TOP ===== */
.scroll-top-btn {
  position: fixed;
  bottom: 36px;
  right: 36px;
  width: 52px;
  height: 52px;
  background: rgba(8, 113, 127, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  color: white;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(8, 113, 127, 0.3);
}
.scroll-top-btn:hover { transform: translateY(-6px) scale(1.02); background: #08717f; box-shadow: 0 16px 32px rgba(8, 113, 127, 0.4); border-radius: 20px; }

/* ===== HERO CINEMATIC ===== */
.hero-cinematic { position: relative; height: 100vh; min-height: 680px; overflow: hidden; }
.hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1; }
.hero-slide.active { opacity: 1; z-index: 2; }
.hero-media { position: absolute; inset: 0; }
.hero-video { width: 100%; height: 100%; object-fit: cover; }
.hero-slide.active .hero-video { transform: scale(1.08); transition: transform 10s ease-out; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8, 113, 127, 0.75) 0%, rgba(212, 0, 37, 0.4) 50%, rgba(0, 0, 0, 0.2) 100%); }
.hero-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 200px; background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent); }
.hero-content { position: absolute; top: 50%; right: 8%; transform: translateY(-50%); color: white; z-index: 3; max-width: 650px; animation: contentReveal 1s ease 0.3s both; }
@keyframes contentReveal { from { opacity: 0; transform: translate(40px, -50%); } to { opacity: 1; transform: translate(0, -50%); } }
.hero-tag { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.tag-line { width: 48px; height: 2px; background: rgba(255, 255, 255, 0.5); }
.tag-text { font-size: 0.9rem; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: rgba(255, 255, 255, 0.9); }
.hero-title { font-size: 4.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 20px; text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); letter-spacing: -0.02em; font-family: 'Amiri', serif; }
.hero-subtitle { font-size: 1.3rem; margin-bottom: 28px; opacity: 0.95; font-weight: 300; line-height: 1.6; max-width: 500px; }
.hero-price-wrapper { display: flex; align-items: baseline; gap: 16px; margin-bottom: 36px; }
.hero-price { font-size: 2.4rem; font-weight: 800; color: #c9a04a; text-shadow: 0 2px 12px rgba(201, 160, 74, 0.3); }
.hero-old-price { font-size: 1.2rem; color: rgba(255, 255, 255, 0.6); text-decoration: line-through; }
.hero-btn { display: inline-flex; align-items: center; gap: 14px; padding: 16px 40px; background: white; color: #1a1a2e; border: none; border-radius: 60px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15); }
.hero-btn:hover { transform: translateY(-4px); background: #c9a04a; color: white; box-shadow: 0 16px 40px rgba(201, 160, 74, 0.3); gap: 20px; }
.hero-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 56px; height: 56px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; z-index: 10; transition: all 0.4s ease; }
.hero-nav:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-50%) scale(1.05); border-radius: 24px; }
.hero-nav.prev { left: 32px; }
.hero-nav.next { right: 32px; }
.hero-dots { position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; z-index: 10; }
.hero-dot { width: 10px; height: 10px; background: rgba(255, 255, 255, 0.4); border-radius: 6px; cursor: pointer; transition: all 0.4s ease; }
.hero-dot.active { width: 36px; background: white; box-shadow: 0 0 16px rgba(255, 255, 255, 0.5); }
.hero-scroll-indicator { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: white; cursor: pointer; z-index: 10; animation: bounce 2s infinite; }
@keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); } 40% { transform: translateX(-50%) translateY(-12px); } 60% { transform: translateX(-50%) translateY(-6px); } }
.scroll-text { font-size: 0.8rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; }

/* ===== CATEGORIES MINIMAL ===== */
.categories-minimal { padding: 80px 0; background: white; border-bottom: 1px solid rgba(0, 0, 0, 0.04); }
.dark-mode .categories-minimal { background: #111827; border-bottom-color: rgba(255, 255, 255, 0.04); }
.categories-header { text-align: center; margin-bottom: 48px; }
.section-label { display: inline-block; font-size: 0.8rem; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #08717f; margin-bottom: 16px; }
.section-title { font-size: 2.2rem; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 16px; font-family: 'Amiri', serif; }
.dark-mode .section-title { color: #f0f0f0; }
.title-accent { width: 60px; height: 3px; background: linear-gradient(90deg, #08717f, #d40025); border-radius: 2px; }
.title-highlight { color: #d40025; position: relative; }
.section-subtitle { color: #64748b; font-size: 1rem; }
.dark-mode .section-subtitle { color: #94a3b8; }
.categories-scroll-wrapper { position: relative; display: flex; align-items: center; gap: 16px; }
.categories-container { display: flex; overflow-x: auto; scroll-behavior: smooth; gap: 24px; padding: 12px 4px; scrollbar-width: none; flex: 1; }
.categories-container::-webkit-scrollbar { display: none; }
.category-card { flex: 0 0 170px; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.category-card:hover { transform: translateY(-8px); }
.category-image-wrapper { position: relative; width: 170px; height: 170px; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); margin-bottom: 14px; }
.category-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.category-card:hover .category-image { transform: scale(1.08); }
.category-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(8, 113, 127, 0.3), rgba(212, 0, 37, 0.3)); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; }
.category-card:hover .category-overlay { opacity: 1; }
.category-icon-text { font-size: 2.8rem; font-weight: 700; color: white; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3); }
.category-info { text-align: center; }
.category-name { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; font-family: 'Amiri', serif; }
.dark-mode .category-name { color: #e0e0e0; }
.category-count { font-size: 0.8rem; color: #64748b; }
.scroll-nav { width: 44px; height: 44px; background: white; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #08717f; flex-shrink: 0; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); }
.dark-mode .scroll-nav { background: #1f2937; border-color: rgba(255, 255, 255, 0.08); color: #2dd4bf; }
.scroll-nav:hover { background: #08717f; color: white; transform: scale(1.05); }

/* ===== FEATURED PRODUCTS ===== */
.featured-products { padding: 80px 0; background: #fafbfc; }
.dark-mode .featured-products { background: #0a0e14; }
.section-header-compact { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 24px; }
.section-tag { font-size: 0.8rem; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #08717f; margin-bottom: 8px; display: block; }
.section-title-compact { font-size: 1.8rem; font-weight: 700; color: #1a1a2e; font-family: 'Amiri', serif; }
.dark-mode .section-title-compact { color: #f0f0f0; }
.section-title-compact span { color: #d40025; }
.filter-tabs { display: flex; gap: 8px; background: white; padding: 6px; border-radius: 48px; border: 1px solid rgba(0, 0, 0, 0.06); }
.dark-mode .filter-tabs { background: #1f2937; border-color: rgba(255, 255, 255, 0.06); }
.filter-tab { padding: 10px 24px; background: none; border: none; border-radius: 40px; font-size: 0.9rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.3s ease; font-family: inherit; }
.dark-mode .filter-tab { color: #94a3b8; }
.filter-tab.active { background: #08717f; color: white; box-shadow: 0 4px 12px rgba(8, 113, 127, 0.2); }

/* ===== PRODUCTS GRID ===== */
.products-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
.product-card-minimal { background: white; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0, 0, 0, 0.04); }
.dark-mode .product-card-minimal { background: #111827; border-color: rgba(255, 255, 255, 0.04); }
.product-card-minimal:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); }
.product-image-container { position: relative; aspect-ratio: 1; overflow: hidden; background: #f5f5f5; }
.product-image-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.product-card-minimal:hover .product-image-container img { transform: scale(1.06); }
.video-indicator { position: absolute; top: 12px; left: 12px; width: 28px; height: 28px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
.product-price-tag { position: absolute; bottom: 12px; right: 12px; padding: 6px 14px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); border-radius: 30px; font-weight: 700; color: #d40025; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.product-hover-actions { position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 8px; opacity: 0; transform: translateX(-8px); transition: all 0.3s ease; }
.product-card-minimal:hover .product-hover-actions { opacity: 1; transform: translateX(0); }
.hover-btn { width: 36px; height: 36px; background: white; border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1a1a2e; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.hover-btn:hover { transform: scale(1.08); }
.hover-btn.cart:hover { background: #08717f; color: white; }
.hover-btn.wishlist:hover { background: #d40025; color: white; }
.hover-btn.wishlist.active { background: #d40025; color: white; }
.product-info-minimal { padding: 16px; }
.vendor-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.vendor-avatar-mini { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.vendor-name-mini { font-size: 0.75rem; color: #64748b; }
.product-title-mini { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.dark-mode .product-title-mini { color: #e0e0e0; }

/* ===== REELS GRID HOME ===== */
.reels-grid-home { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
.reel-card-home { background: white; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0, 0, 0, 0.04); }
.dark-mode .reel-card-home { background: #111827; border-color: rgba(255, 255, 255, 0.04); }
.reel-card-home:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); }
.reel-video-wrapper { position: relative; aspect-ratio: 9 / 16; overflow: hidden; background: #000; }
.reel-video-home { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.reel-card-home:hover .reel-video-home { transform: scale(1.04); }
.reel-overlay-home { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%); display: flex; flex-direction: column; justify-content: space-between; padding: 12px; opacity: 0; transition: opacity 0.3s ease; }
.reel-card-home:hover .reel-overlay-home { opacity: 1; }
.reel-play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.reel-stats-home { display: flex; gap: 16px; justify-content: flex-end; }
.reel-stat { display: flex; align-items: center; gap: 4px; color: white; font-size: 0.8rem; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.reel-info-home { padding: 14px; }
.reel-vendor-home { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.reel-vendor-home img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.reel-vendor-home span { font-size: 0.75rem; color: #64748b; }
.reel-title-home { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.dark-mode .reel-title-home { color: #e0e0e0; }

/* ===== LOADING & EMPTY ===== */
.loading-minimal { display: flex; justify-content: center; padding: 80px; }
.spinner-elegant { width: 44px; height: 44px; border: 2px solid rgba(8, 113, 127, 0.1); border-top-color: #08717f; border-right-color: #d40025; border-radius: 50%; animation: spin 0.8s linear infinite; }
.empty-minimal { text-align: center; padding: 80px; }
.empty-symbol { font-size: 3rem; color: #cbd5e1; display: block; margin-bottom: 16px; }
.empty-minimal p { color: #64748b; }

/* ===== MORE LINK ===== */
.more-link-wrapper { text-align: center; margin-top: 48px; }
.more-link { display: inline-flex; align-items: center; gap: 12px; padding: 14px 36px; background: transparent; border: 1.5px solid #08717f; border-radius: 40px; color: #08717f; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.4s ease; }
.more-link:hover { background: #08717f; color: white; gap: 18px; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(8, 113, 127, 0.2); }

/* ===== FEATURES PREMIUM ===== */
.features-premium { padding: 64px 0; background: white; border-top: 1px solid rgba(0, 0, 0, 0.04); }
.dark-mode .features-premium { background: #111827; border-top-color: rgba(255, 255, 255, 0.04); }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.feature-item { display: flex; align-items: center; gap: 20px; }
.feature-icon-wrapper { width: 60px; height: 60px; background: linear-gradient(135deg, rgba(8, 113, 127, 0.08), rgba(212, 0, 37, 0.04)); border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #08717f; transition: all 0.3s ease; }
.feature-item:hover .feature-icon-wrapper { background: #08717f; color: white; transform: scale(1.05); }
.feature-content h4 { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; font-family: 'Amiri', serif; }
.dark-mode .feature-content h4 { color: #f0f0f0; }
.feature-content p { font-size: 0.85rem; color: #64748b; margin: 0; }
.dark-mode .feature-content p { color: #94a3b8; }

/* ===== REEL MODAL HOME ===== */
.reel-modal-overlay-home { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 24px; }
.reel-modal-home { background: #000; border-radius: 24px; width: 100%; max-width: 450px; max-height: 90vh; overflow: hidden; position: relative; animation: modalZoomIn 0.3s ease; }
.reel-modal-content-home { display: flex; flex-direction: column; height: 100%; }
.reel-modal-video-home { width: 100%; height: auto; max-height: 70vh; object-fit: contain; background: #000; }
.reel-modal-info-home { padding: 20px; background: white; }
.dark-mode .reel-modal-info-home { background: #1f2937; }
.reel-modal-vendor { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.reel-modal-vendor img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.reel-modal-vendor h3 { font-size: 1rem; font-weight: 700; color: #1a1a2e; }
.dark-mode .reel-modal-vendor h3 { color: #f0f0f0; }
.vendor-handle { font-size: 0.75rem; color: #64748b; }
.reel-modal-title { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.dark-mode .reel-modal-title { color: #f0f0f0; }
.reel-modal-description { font-size: 0.85rem; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
.reel-modal-stats { display: flex; gap: 24px; color: #64748b; font-size: 0.8rem; }
.reel-modal-stats span { display: flex; align-items: center; gap: 6px; }

/* ===== QUICK VIEW MODAL ===== */
.quick-view-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 24px; }
.quick-view-modal { background: white; border-radius: 32px; width: 100%; max-width: 1000px; max-height: 85vh; overflow: hidden; position: relative; animation: modalZoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.dark-mode .quick-view-modal { background: #1f2937; }
@keyframes modalZoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
.modal-close-btn { position: absolute; top: 20px; right: 20px; width: 44px; height: 44px; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); border: none; border-radius: 14px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s ease; }
.modal-close-btn:hover { background: #d40025; transform: rotate(90deg); }
.modal-content-grid { display: grid; grid-template-columns: 1.2fr 1fr; }
.modal-image { aspect-ratio: 1; overflow: hidden; }
.modal-image img { width: 100%; height: 100%; object-fit: cover; }
.modal-info { padding: 36px; display: flex; flex-direction: column; }
.modal-vendor { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.modal-vendor img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.modal-vendor span { color: #64748b; font-size: 0.9rem; }
.modal-info h2 { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; font-family: 'Amiri', serif; }
.dark-mode .modal-info h2 { color: #f0f0f0; }
.modal-price { font-size: 2rem; font-weight: 800; color: #d40025; margin-bottom: 20px; }
.modal-description { color: #64748b; line-height: 1.7; margin-bottom: 32px; flex: 1; }
.modal-actions { display: flex; gap: 16px; }
.modal-btn { flex: 1; padding: 16px; border: none; border-radius: 16px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; }
.modal-btn.primary { background: #08717f; color: white; }
.modal-btn.primary:hover { background: #065a69; transform: translateY(-2px); }
.modal-btn.secondary { background: #f1f5f9; color: #1a1a2e; }
.dark-mode .modal-btn.secondary { background: #374151; color: #f0f0f0; }
.modal-btn.secondary:hover { background: #e2e8f0; transform: translateY(-2px); }

/* ===== TOAST ELEGANT ===== */
.toast-elegant { position: fixed; bottom: 32px; right: 32px; background: white; padding: 14px 28px; border-radius: 48px; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12); z-index: 9999; border-right: 4px solid #08717f; animation: toastSlideIn 0.3s ease; overflow: hidden; }
.dark-mode .toast-elegant { background: #1f2937; }
.toast-elegant.success { border-right-color: #10b981; }
.toast-elegant.error { border-right-color: #ef4444; }
.toast-message { color: #1a1a2e; font-weight: 500; }
.dark-mode .toast-message { color: #f0f0f0; }
.toast-progress { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #08717f, #d40025); animation: toastProgress 3s linear forwards; }
@keyframes toastProgress { from { width: 0; } to { width: 100%; } }
@keyframes toastSlideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }

/* ===== TRANSITIONS ===== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-zoom-enter-active, .modal-zoom-leave-active { transition: opacity 0.3s ease; }
.modal-zoom-enter-from, .modal-zoom-leave-to { opacity: 0; }
.modal-zoom-enter-from .quick-view-modal, .modal-zoom-leave-to .quick-view-modal { transform: scale(0.92); }

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) { .products-grid, .reels-grid-home { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 992px) { .hero-title { font-size: 3.5rem; } .products-grid, .reels-grid-home { grid-template-columns: repeat(3, 1fr); } .features-grid { grid-template-columns: repeat(2, 1fr); } .modal-content-grid { grid-template-columns: 1fr; } .modal-image { max-height: 350px; } }
@media (max-width: 768px) { .container { padding: 0 20px; } .hero-title { font-size: 2.5rem; } .hero-content { right: 5%; left: 5%; } .products-grid, .reels-grid-home { grid-template-columns: repeat(2, 1fr); } .section-header-compact { flex-direction: column; align-items: flex-start; } .filter-tabs { width: 100%; justify-content: center; } .features-grid { grid-template-columns: 1fr; } .scroll-nav { display: none; } .hero-nav { display: none; } .category-card { flex: 0 0 150px; } .category-image-wrapper { width: 150px; height: 150px; } }
@media (max-width: 480px) { .hero-title { font-size: 2rem; } .hero-subtitle { font-size: 1rem; } .products-grid, .reels-grid-home { grid-template-columns: 1fr; } .section-title { font-size: 1.6rem; } .category-card { flex: 0 0 130px; } .category-image-wrapper { width: 130px; height: 130px; } .category-name { font-size: 1rem; } }
</style>
