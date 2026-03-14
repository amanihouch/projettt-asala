<!-- src/views/Homepage.vue -->
<template>
  <div class="homepage dual-theme">
    <!-- HERO SECTION -->
    <section class="hero-section">
      <div class="video-background">
        <video autoplay muted loop playsinline class="bg-video">
          <source
            src="https://v1.pinimg.com/videos/mc/720p/86/64/68/8664683a894d0fbae34677dd78b8f862.mp4"
            type="video/mp4"
          />
          <img
            src="https://i.pinimg.com/736x/c1/b1/cc/c1b1cc82d0bbc97268c7f09b1c0baf7a.jpg"
            alt="Tunisie artisanat"
          />
        </video>
        <div class="video-overlay-light"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badges">
          <span class="hero-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
              <path d="M12 6v6l4 2" />
            </svg>
            مواد طبيعية مستدامة
          </span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">تراث تونس</span>
          <span class="title-line gradient-text-light">بين يديك</span>
          <span class="title-line">حكاية في كل قطعة</span>
        </h1>

        <p class="hero-description-light">
          اكتشف عالم الحرف اليدوية التونسية الأصيلة من خلال إبداعات حرفيينا الموهوبين
        </p>

        <div class="hero-actions">
          <button class="btn btn-primary-light btn-large" @click="$router.push('/products')">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            استكشف المنتجات
          </button>
          <button class="btn btn-outline-light btn-large" @click="$router.push('/favorites')">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            منتجاتي المفضلة
          </button>
        </div>
      </div>

      <div class="floating-elements-light">
        <div class="float-1">🏺</div>
        <div class="float-2">🧵</div>
        <div class="float-3">💍</div>
        <div class="float-4">🪵</div>
      </div>
    </section>

    <!-- SECTION DES POSTS -->
    <section class="posts-section">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">
            <span class="badge-icon">📰</span>
            آخر إبداعات حرفيينا
          </span>
          <h2 class="section-title">اكتشف الجديد <span class="gradient-text">من حرفيينا</span></h2>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingPosts" class="loading-state">
          <div class="loading-spinner"></div>
        </div>

        <!-- Posts Grid -->
        <div v-else-if="feedPosts.length > 0" class="posts-grid">
          <div v-for="post in feedPosts" :key="post.id" class="post-card">
            <!-- En-tête -->
            <div class="post-header">
              <img :src="post.vendorAvatar" :alt="post.vendorName" class="post-avatar" />
              <div class="post-author">
                <h4>{{ post.vendorName }}</h4>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <div v-if="post.vendorVerified" class="verified-badge" title="حرفي موثوق">✓</div>
            </div>

            <!-- Image du produit -->
            <div class="post-image-container" @click="openImage(post.images[0])">
              <img :src="post.images[0]" :alt="post.productName" class="post-image" />
              <div v-if="post.images.length > 1" class="image-count">
                +{{ post.images.length - 1 }}
              </div>
            </div>

            <!-- Contenu du post -->
            <div class="post-content" v-if="post.content">
              <p>{{ post.content }}</p>
            </div>

            <!-- Informations produit -->
            <div class="post-info">
              <h3 class="product-name">{{ post.productName }}</h3>
              <p class="product-desc">{{ post.description }}</p>

              <!-- Évaluation -->
              <div class="product-rating">
                <div class="stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ filled: i <= Math.floor(post.rating || 5) }"
                    >⭐</span
                  >
                </div>
                <span class="rating-text"
                  >{{ (post.rating || 5.0).toFixed(1) }} ({{ post.reviews || 156 }})</span
                >
              </div>

              <!-- Prix -->
              <div class="product-price">
                <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
                <span v-if="post.oldPrice" class="old-price"
                  >{{ formatPrice(post.oldPrice) }} د.ت</span
                >
              </div>

              <!-- Actions -->
              <div class="product-actions">
                <button
                  class="action-btn like-btn"
                  @click="togglePostLike(post)"
                  :class="{ liked: isPostLiked(post.id) }"
                >
                  <span class="heart-icon">❤️</span>
                  <span>{{ post.likes || 0 }}</span>
                </button>
                <button class="action-btn comment-btn" @click="toggleComments(post.id)">
                  <span>💬</span>
                  <span>{{ post.comments || 0 }}</span>
                </button>
                <button class="action-btn share-btn" @click="sharePost(post)">
                  <span>🔗</span>
                  <span>مشاركة</span>
                </button>
                <button class="action-btn cart-btn" @click="buyProduct(post)">
                  <span>🛒</span>
                  <span>شراء</span>
                </button>
              </div>
            </div>

            <!-- Comments Section -->
            <div v-if="showComments === post.id" class="comments-section">
              <div v-if="post.commentsList && post.commentsList.length > 0" class="comments-list">
                <div v-for="comment in post.commentsList" :key="comment.id" class="comment-item">
                  <img :src="comment.userAvatar" :alt="comment.userName" class="comment-avatar" />
                  <div class="comment-content">
                    <strong>{{ comment.userName }}</strong>
                    <p>{{ comment.comment }}</p>
                  </div>
                </div>
              </div>
              <div v-if="authStore.isAuthenticated" class="add-comment">
                <input
                  v-model="newComment"
                  @keyup.enter="addComment(post.id)"
                  placeholder="اكتب تعليقاً..."
                />
                <button @click="addComment(post.id)">نشر</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <span class="empty-icon">📝</span>
          <h3>لا توجد منشورات بعد</h3>
          <p>كن أول من يشارك إبداعاته!</p>
          <button
            v-if="authStore.userRole === 'vendor'"
            class="btn-primary"
            @click="goToVendorProfile"
          >
            أنشر منتجك
          </button>
          <router-link v-else to="/become-vendor" class="btn-primary"> انضم كحرفي </router-link>
        </div>
      </div>
    </section>

    <!-- SECTION PRODUITS SPONSORISÉS -->
    <section class="sponsored-section">
      <div class="container">
        <div class="section-header">
          <div class="section-header-left">
            <span class="section-badge">
              <span class="badge-icon">⭐</span>
              مميزة
            </span>
            <h2 class="section-title">منتجات <span class="gradient-text">مميزة</span></h2>
            <p class="section-subtitle">منتجات مختارة بعناية من حرفيينا المميزين</p>
          </div>
          <button class="section-view-all" @click="$router.push('/products?filter=sponsored')">
            عرض الكل
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="products-grid">
          <ProductCard
            v-for="product in sponsoredProducts"
            :key="product.id"
            :product="product"
            @liked="handleProductLiked"
            @unliked="handleProductUnliked"
            @added-to-cart="handleAddToCart"
            @quick-view="openQuickView"
          />
        </div>
      </div>
    </section>

    <!-- DELIVERY BANNER -->
    <section class="delivery-banner">
      <div class="container">
        <div class="banner-content">
          <div class="banner-icon-wrapper">
            <div class="banner-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
          <div class="banner-text">
            <h3>توصيل سريع لجميع أنحاء تونس 🚚</h3>
            <p>احصل على طلبك في غضون 2-5 أيام عمل</p>
          </div>
          <button class="btn btn-shipping" @click="$router.push('/shipping')">
            تفاصيل الشحن
            <span class="btn-icon">←</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import ProductCard from '../components/ProductCard.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const authStore = useAuthStore()
const postStore = usePostStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()

// ===== STATE =====
const isLoadingPosts = ref(false)
const showComments = ref(null)
const newComment = ref('')
const showImageModal = ref(false)
const selectedImage = ref('')
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: '✅',
})

// ===== COMPUTED =====
// Les posts du feed sont dans postStore.posts (après fetchFeed)
const feedPosts = computed(() => {
  return (postStore.posts || []).map((post) => ({
    ...post,
    rating: post.rating || 5.0,
    reviews: post.reviews || Math.floor(Math.random() * 100) + 50,
  }))
})

// Produits sponsorisés (inchangé)
const sponsoredProducts = ref([
  {
    id: 101,
    name: 'طقم أواني فخارية تقليدية مزخرفة',
    price: 89.9,
    originalPrice: 129.9,
    image: 'https://i.pinimg.com/736x/a8/0c/d8/a80cd8f1bd6693ac537cc4dd4656f3c0.jpg',
    rating: 4.8,
    reviews: 124,
    likesCount: 45,
    isSponsored: true,
    isNew: false,
    description: 'طقم أواني فخارية تقليدية مصنوعة يدوياً',
    category: 'pottery',
    vendor: {
      id: 1,
      name: 'محمد الفخراني',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: true,
      followers: 1250,
    },
  },
  {
    id: 102,
    name: 'سجادة صوف تونسية منسوجة يدوياً',
    price: 250.0,
    originalPrice: 350.0,
    image: 'https://i.pinimg.com/736x/7e/0c/4d/7e0c4d0d2c7e269d6c976af79b4da637.jpg',
    rating: 4.9,
    reviews: 89,
    likesCount: 32,
    isSponsored: true,
    isNew: true,
    description: 'سجادة صوف مصنوعة يدوياً',
    category: 'textiles',
    vendor: {
      id: 2,
      name: 'فاطمة النساجة',
      avatar: 'https://i.pravatar.cc/150?img=25',
      verified: true,
      followers: 980,
    },
  },
  {
    id: 103,
    name: 'قلادة فضة أمازيغية',
    price: 120.0,
    originalPrice: null,
    image: 'https://i.pinimg.com/736x/ca/67/c7/ca67c7b4f1370e2606a3b3fadd821603.jpg',
    rating: 5.0,
    reviews: 156,
    likesCount: 78,
    isSponsored: true,
    isNew: false,
    description: 'قلادة فضة بتصميم أمازيغي',
    category: 'jewelry',
    vendor: {
      id: 3,
      name: 'يوسف الصائغ',
      avatar: 'https://i.pravatar.cc/150?img=33',
      verified: true,
      followers: 1560,
    },
  },
  {
    id: 104,
    name: 'صندوق خشبي محفور',
    price: 75.0,
    originalPrice: 95.0,
    image: 'https://i.pinimg.com/736x/bd/1a/d0/bd1ad022c1bda37a137a2365bf9eaa2a.jpg',
    rating: 4.7,
    reviews: 67,
    likesCount: 29,
    isSponsored: true,
    isNew: false,
    description: 'صندوق خشبي محفور يدوياً',
    category: 'woodwork',
    vendor: {
      id: 4,
      name: 'أحمد النجار',
      avatar: 'https://i.pravatar.cc/150?img=51',
      verified: true,
      followers: 720,
    },
  },
])

// ===== METHODS =====
const isPostLiked = (postId) => {
  return likesStore.isLiked(postId)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 7) return `منذ ${days} أيام`
  return date.toLocaleDateString('ar-TN')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price)
}

const togglePostLike = (post) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

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

const toggleComments = (postId) => {
  showComments.value = showComments.value === postId ? null : postId
}

const addComment = (postId) => {
  if (!newComment.value.trim() || !authStore.isAuthenticated) return

  postStore.addComment(
    postId,
    authStore.user.id,
    authStore.userName,
    authStore.userAvatar,
    newComment.value,
  )

  newComment.value = ''

  const post = feedPosts.value.find((p) => p.id === postId)
  if (post) {
    post.comments = (post.comments || 0) + 1
  }
}

const sharePost = (post) => {
  if (navigator.share) {
    navigator.share({
      title: post.productName,
      text: post.content,
      url: window.location.origin + `/vendor/${post.vendorId}`,
    })
  } else {
    navigator.clipboard.writeText(window.location.origin + `/vendor/${post.vendorId}`)
    showNotification('تم نسخ الرابط', 'success')
  }
}

const buyProduct = (post) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  const cartItem = {
    id: post.id,
    name: post.productName,
    price: post.price,
    image: post.images && post.images[0] ? post.images[0] : 'https://via.placeholder.com/300',
    quantity: 1,
    vendorName: post.vendorName,
  }

  cartStore.addItem(cartItem)
  showNotification('✅ تمت إضافة المنتج إلى السلة', 'cart')
}

const openImage = (img) => {
  selectedImage.value = img
  showImageModal.value = true
}

const goToVendorProfile = () => {
  if (authStore.userRole === 'vendor') {
    router.push(`/vendor/${authStore.user.id}`)
  }
}

const showNotification = (message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    heart: '❤️',
    cart: '🛒',
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

// ProductCard handlers
const handleProductLiked = (product) => {
  showNotification(`تمت إضافة "${product.name}" إلى المفضلة`, 'heart')
}

const handleProductUnliked = (productId) => {
  showNotification('تمت إزالة المنتج من المفضلة', 'info')
}

const handleAddToCart = (product) => {
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    vendorName: product.vendor?.name,
  }

  cartStore.addItem(cartItem)
  showNotification(`تمت إضافة "${product.name}" إلى السلة`, 'cart')
}

const openQuickView = (product) => {
  console.log('Quick view:', product)
}

// ===== LIFECYCLE =====
onMounted(async () => {
  likesStore.loadFromStorage()
  cartStore.loadFromStorage()
  isLoadingPosts.value = true
  await postStore.fetchFeed() // Charger les posts depuis l'API
  isLoadingPosts.value = false
})
</script>

<style scoped>
/* ===== DUAL THEME ===== */
.dual-theme {
  --primary-teal: #08717f;
  --primary-teal-light: #0a94a6;
  --primary-teal-dark: #065a69;
  --primary-red: #d40025;
  --primary-red-light: #ff1744;
  --primary-red-dark: #b00020;
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
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  --transition: all 0.3s ease;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  font-family: 'Cairo', sans-serif;
  background: #f5f5f5;
  direction: rtl;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== HERO SECTION ===== */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #08717f, #d40025);
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  object-fit: cover;
}

.video-overlay-light {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(8, 113, 127, 0.2), rgba(212, 0, 37, 0.2));
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  padding: 0 20px;
  max-width: 900px;
}

.hero-badges {
  margin-bottom: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
}

.hero-title {
  margin-bottom: 30px;
}

.title-line {
  display: block;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.2;
}

.gradient-text-light {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description-light {
  max-width: 700px;
  margin: 0 auto 40px;
  font-size: 1.2rem;
  opacity: 0.95;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-large {
  padding: 16px 40px;
  font-size: 1.1rem;
}

.btn-primary-light {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary-light:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-outline-light {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-shipping {
  background: white;
  color: #08717f;
  padding: 12px 24px;
  font-weight: 700;
}

.btn-shipping:hover {
  background: #08717f;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

.floating-elements-light div {
  position: absolute;
  font-size: 3rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  z-index: 5;
}

.float-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.float-2 {
  top: 70%;
  right: 10%;
  animation-delay: 2s;
}
.float-3 {
  top: 40%;
  right: 20%;
  animation-delay: 4s;
}
.float-4 {
  bottom: 20%;
  left: 15%;
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
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

.section-header-left {
  text-align: right;
}

.section-badge {
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
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  color: #64748b;
  font-size: 1rem;
  max-width: 500px;
}

.section-view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: white;
  color: #08717f;
  border: 2px solid #08717f;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-view-all:hover {
  background: #08717f;
  color: white;
  transform: translateX(-5px);
}

/* ===== POSTS SECTION ===== */
.posts-section {
  padding: 40px 0;
  background: white;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #08717f;
}

/* En-tête */
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.post-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post-author {
  flex: 1;
}

.post-author h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.post-date {
  font-size: 0.75rem;
  color: #64748b;
}

.verified-badge {
  width: 22px;
  height: 22px;
  background: #08717f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid white;
}

/* Image */
.post-image-container {
  position: relative;
  width: 100%;
  height: 250px;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Contenu */
.post-content {
  padding: 15px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.post-content p {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Info produit */
.post-info {
  padding: 15px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
}

.product-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
}

/* Évaluation */
.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.9rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
  color: #fbbf24;
}

.rating-text {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Prix */
.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d40025;
}

.old-price {
  font-size: 0.9rem;
  color: #94a3b8;
  text-decoration: line-through;
}

/* Actions */
.product-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.like-btn {
  background: #f1f5f9;
  color: #64748b;
}

.like-btn.liked {
  background: #ffe8ed;
  color: #d40025;
}

.like-btn:hover {
  background: #ffe8ed;
}

.comment-btn {
  background: #f1f5f9;
  color: #64748b;
}

.comment-btn:hover {
  background: #e2e8f0;
}

.share-btn {
  background: #f1f5f9;
  color: #64748b;
}

.share-btn:hover {
  background: #e2e8f0;
}

.cart-btn {
  background: #08717f;
  color: white;
}

.cart-btn:hover {
  background: #065a69;
  transform: scale(1.05);
}

/* Comments Section */
.comments-section {
  padding: 15px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.comment-item {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  background: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.comment-content strong {
  color: #1e293b;
  margin-left: 5px;
}

.comment-content p {
  color: #334155;
  margin: 2px 0 0 0;
}

.add-comment {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.add-comment input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.85rem;
}

.add-comment button {
  padding: 8px 16px;
  background: #08717f;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
}

/* ===== SPONSORED SECTION ===== */
.sponsored-section {
  padding: 40px 0;
  background: #f8fafc;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

/* ===== DELIVERY BANNER ===== */
.delivery-banner {
  background: linear-gradient(135deg, #08717f 0%, #065a69 100%);
  padding: 60px 0;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  color: white;
  flex-wrap: wrap;
}

.banner-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.banner-text p {
  font-size: 1rem;
  opacity: 0.95;
}

/* ===== LOADING STATE ===== */
.loading-state {
  text-align: center;
  padding: 50px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: 15px;
  display: block;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8, 113, 127, 0.3);
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 280px;
  border-right: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-notification.heart {
  border-right-color: #d40025;
}

.toast-notification.cart {
  border-right-color: #08717f;
}

.toast-notification.success {
  border-right-color: #10b981;
}

.toast-notification.info {
  border-right-color: #3b82f6;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-icon {
  font-size: 1.3rem;
}

.toast-message {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
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
  width: 40px;
  height: 40px;
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
@media (max-width: 992px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description-light {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-btn span:last-child {
    display: none;
  }
}

@media (max-width: 480px) {
  .toast-notification {
    min-width: auto;
    width: calc(100% - 40px);
    right: 20px;
  }

  .post-image-container {
    height: 200px;
  }

  .floating-elements-light div {
    font-size: 2rem;
  }
}
</style>
