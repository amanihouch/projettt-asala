<!-- src/views/VendorProfile.vue -->
<template>
  <div class="vendor-profile-page" dir="rtl">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الملف الشخصي...</p>
    </div>

    <template v-else-if="vendor">
      <!-- Cover Image -->
      <div class="profile-cover">
        <img
          :src="
            vendor.coverImage ||
            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'
          "
          alt="Cover"
          class="cover-image"
        />
        <div class="cover-overlay"></div>
        <div class="cover-actions">
          <template v-if="isCurrentUser">
            <button class="btn-cover" @click="openCoverUpload">
              <span class="icon">📷</span> تغيير صورة الغلاف
            </button>
            <button class="btn-edit-profile" @click="goToEditProfile">
              <span class="icon">✏️</span> تعديل الملف
            </button>
          </template>
          <template v-else>
            <button class="btn-follow" :class="{ following: isFollowing }" @click="toggleFollow">
              <span class="icon">{{ isFollowing ? '✓' : '+' }}</span>
              {{ isFollowing ? 'متابع' : 'متابعة' }}
            </button>
            <button class="btn-message" @click="openMessageModal">
              <span class="icon">💬</span> مراسلة
            </button>
          </template>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="container">
          <div class="profile-info">
            <div class="avatar-wrapper">
              <img
                :src="vendor.userAvatar || vendor.avatar || 'https://i.pravatar.cc/300'"
                :alt="vendor.shopName"
                class="avatar"
              />
              <div v-if="vendor.verified" class="verified-badge">✓</div>
              <button v-if="isCurrentUser" class="avatar-edit" @click="openAvatarUpload">
                <span class="icon">📷</span>
              </button>
            </div>
            <div class="info-main">
              <h1 class="shop-name">{{ vendor.shopName }}</h1>
              <p class="vendor-name">بواسطة {{ vendor.name }}</p>
              <p class="vendor-specialty">{{ getSpecialtyName(vendor.specialty) }}</p>
              <div class="vendor-location" v-if="vendor.location">
                <span class="icon">📍</span> {{ vendor.location }}
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ vendor.productsCount || 0 }}</span>
                <span class="stat-label">منتجات</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ vendor.followersCount || 0 }}</span>
                <span class="stat-label">متابعون</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ vendor.followingCount || 0 }}</span>
                <span class="stat-label">يتابع</span>
              </div>
            </div>
          </div>
          <div class="profile-bio" v-if="vendor.description">
            <p>{{ vendor.description }}</p>
          </div>
          <div class="contact-info">
            <a v-if="vendor.phone" :href="`tel:${vendor.phone}`" class="contact-link">
              <span class="icon">📞</span> {{ vendor.phone }}
            </a>
            <a :href="`mailto:${vendor.email}`" class="contact-link">
              <span class="icon">📧</span> {{ vendor.email }}
            </a>
          </div>
          <div class="social-links" v-if="vendor.socialLinks">
            <a
              v-if="vendor.socialLinks.facebook"
              :href="vendor.socialLinks.facebook"
              target="_blank"
              class="social-link facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a
              v-if="vendor.socialLinks.instagram"
              :href="vendor.socialLinks.instagram"
              target="_blank"
              class="social-link instagram"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  ry="5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </a>
          </div>
          <div class="joined-date">
            <span class="icon">📅</span> انضم في {{ formatDate(vendor.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Create Post Section -->
      <div v-if="isCurrentUser" class="create-post-section">
        <div class="container">
          <div class="create-post-card">
            <div class="post-header">
              <img :src="vendor.userAvatar || vendor.avatar" alt="" class="post-avatar" />
              <div class="post-input" @click="openCreatePostModal">
                <span>ما الجديد في متجرك؟ انشر منتجك الجديد...</span>
              </div>
              <button class="post-photo-btn" @click="openCreatePostModal">
                <span class="icon">📷</span> <span>صورة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <div class="container">
          <div class="tabs-nav">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'posts' }"
              @click="activeTab = 'posts'"
            >
              المنشورات ({{ vendorPosts.length }})
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'products' }"
              @click="activeTab = 'products'"
            >
              المنتجات ({{ vendor.productsCount || 0 }})
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'about' }"
              @click="activeTab = 'about'"
            >
              معلومات
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <div class="container">
          <!-- Posts Tab -->
          <div v-if="activeTab === 'posts'" class="posts-tab">
            <div v-if="vendorPosts.length > 0" class="posts-feed">
              <div v-for="post in vendorPosts" :key="post.id" class="post-card">
                <!-- En-tête du post -->
                <div class="post-header">
                  <img :src="post.vendorAvatar || vendor.userAvatar || vendor.avatar" alt="" class="post-avatar" />
                  <div class="post-author">
                    <h4>{{ vendor.shopName }}</h4>
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  </div>
                  <div v-if="post.status === 'pending'" class="post-status-badge">⏳ قيد المراجعة</div>
                </div>

                <!-- Contenu -->
                <div class="post-content">
                  <h3 class="product-title">{{ post.productName }}</h3>
                  <p>{{ post.description }}</p>
                </div>

                <!-- Images -->
                <div v-if="post.images && post.images.length > 0" class="post-images" :class="{ multiple: post.images.length > 1 }">
                  <div
                    v-for="(image, index) in post.images.slice(0, 2)"
                    :key="index"
                    class="post-image"
                    @click="openImage(image)"
                  >
                    <img :src="image" :alt="post.productName" />
                  </div>
                  <div v-if="post.images.length > 2" class="more-images" @click="openImage(post.images[0])">
                    +{{ post.images.length - 2 }}
                  </div>
                </div>

                <!-- Prix -->
                <div class="post-price">
                  <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
                  <span v-if="post.oldPrice" class="old-price">{{ formatPrice(post.oldPrice) }} د.ت</span>
                </div>

                <!-- Couleurs -->
                <div v-if="post.colors && post.colors.length > 0" class="post-colors">
                  <span class="colors-label">الألوان المتاحة:</span>
                  <div class="colors-list">
                    <span
                      v-for="color in post.colors"
                      :key="color"
                      class="color-dot"
                      :style="{ backgroundColor: color }"
                      :title="color"
                    ></span>
                  </div>
                </div>

                <!-- Quantité -->
                <div v-if="post.quantity" class="post-quantity">
                  <span class="quantity-label">الكمية المتاحة:</span>
                  <span>{{ post.quantity }} {{ post.unit || 'قطعة' }}</span>
                </div>

                <!-- Actions -->
                <div class="post-actions">
                  <button class="action-btn like-btn" @click="togglePostLike(post)">
                    <span class="heart" :class="{ liked: isPostLiked(post.id) }">❤️</span>
                    <span>{{ post.likes || 0 }}</span>
                  </button>
                  <button class="action-btn comment-btn" @click="toggleComments(post.id)">
                    <span>💬</span>
                    <span>{{ post.commentsCount || 0 }}</span>
                  </button>
                  <button class="action-btn share-btn" @click="sharePost(post)">
                    <span>🔗</span>
                    <span>مشاركة</span>
                  </button>
                  <button class="action-btn buy-btn" @click="buyProduct(post)">
                    <span>🛒</span>
                    <span>شراء</span>
                  </button>
                </div>

                <!-- Comments Section -->
                <div v-if="showComments === post.id" class="comments-section">
                  <div class="add-comment">
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
            <div v-else class="empty-state">
              <p>لا توجد منشورات بعد</p>
              <button v-if="isCurrentUser" class="btn-create" @click="openCreatePostModal">
                أضف أول منشور
              </button>
            </div>
          </div>

          <!-- Products Tab -->
          <div v-if="activeTab === 'products'" class="products-tab">
            <div v-if="vendorProducts.length > 0" class="products-grid">
              <div v-for="product in vendorProducts" :key="product.id" class="product-card">
                <div class="product-image">
                  <img :src="product.mainImage || product.images?.[0] || 'https://via.placeholder.com/300'" :alt="product.name" />
                  <button class="quick-buy" @click="quickBuy(product)">شراء سريع</button>
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="product-price">{{ formatPrice(product.price) }} د.ت</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>لا توجد منتجات بعد</p>
              <button v-if="isCurrentUser" class="btn-create" @click="goToAddProduct">
                أضف أول منتج
              </button>
            </div>
          </div>

          <!-- About Tab -->
          <div v-if="activeTab === 'about'" class="about-tab">
            <div class="about-card">
              <h3>عن المتجر</h3>
              <p>{{ vendor.description || 'لا توجد معلومات' }}</p>
            </div>
            <div class="info-card">
              <h3>معلومات الاتصال</h3>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">البريد الإلكتروني:</span>
                  <span class="info-value">{{ vendor.email }}</span>
                </div>
                <div class="info-row" v-if="vendor.phone">
                  <span class="info-label">الهاتف:</span>
                  <span class="info-value">{{ vendor.phone }}</span>
                </div>
                <div class="info-row" v-if="vendor.location">
                  <span class="info-label">الموقع:</span>
                  <span class="info-value">{{ vendor.location }}</span>
                </div>
                <div class="info-row" v-if="vendor.experience">
                  <span class="info-label">سنوات الخبرة:</span>
                  <span class="info-value">{{ vendor.experience }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Post Modal -->
      <CreatePostModal
        :is-visible="showCreatePostModal"
        @close="showCreatePostModal = false"
        @post-created="handlePostCreated"
      />

      <!-- Image Modal -->
      <div v-if="showImageModal" class="modal-overlay" @click.self="showImageModal = false">
        <div class="image-modal-content">
          <img :src="selectedImage" alt="" />
          <button class="close-btn" @click="showImageModal = false">✕</button>
        </div>
      </div>

      <!-- Success Notification -->
      <transition name="notification">
        <div v-if="showNotification" class="success-notification">
          <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
              <strong>تم إنشاء المنشور بنجاح!</strong>
              <p>سيتم مراجعة منشورك من قبل الإدارة خلال 24 ساعة وسيتم نشرها بعد الموافقة</p>
            </div>
            <button class="notification-close" @click="showNotification = false">✕</button>
          </div>
        </div>
      </transition>
    </template>

    <div v-else class="not-found">
      <h2>المتجر غير موجود</h2>
      <router-link to="/" class="btn-home">العودة للرئيسية</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { usePostStore } from '../stores/postStore'
import { useProductStore } from '../stores/productStore'
import CreatePostModal from '../components/CreatePostModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const postStore = usePostStore()
const productStore = useProductStore()

// ===== STATE =====
const loading = ref(true)
const vendor = ref(null)
const vendorPosts = ref([])
const vendorProducts = ref([])
const activeTab = ref('posts')
const isFollowing = ref(false)
const showCreatePostModal = ref(false)
const showPostMenu = ref(null)
const showComments = ref(null)
const newComment = ref('')
const showImageModal = ref(false)
const selectedImage = ref('')
const showNotification = ref(false)

// ===== COMPUTED =====
const vendorId = computed(() => {
  const id = route.params.id
  if (id === 'dashboard') {
    return authStore.vendorId || localStorage.getItem('vendorId')
  }
  return id
})

const isCurrentUser = computed(() => {
  return authStore.isAuthenticated &&
         authStore.userRole === 'vendor' &&
         authStore.user?.id === vendor.value?.userId
})

// ===== FORMATAGE =====
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 7) return `منذ ${days} أيام`

  return date.toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const getSpecialtyName = (specialty) => {
  const specialties = {
    pottery: '🏺 فخار وسيراميك',
    textiles: '🧵 منسوجات وسجاد',
    jewelry: '💍 مجوهرات',
    woodwork: '🪵 أعمال خشبية',
    metalwork: '⚒️ أعمال معدنية',
    leather: '👜 منتجات جلدية',
    other: '🎨 أخرى',
  }
  return specialties[specialty] || specialty
}

// ===== GESTION DES POSTS =====
const openCreatePostModal = () => {
  showCreatePostModal.value = true
}

const handlePostCreated = async (postData) => {
  if (!vendor.value?.id) return

  const newPost = {
    vendorId: vendor.value.id,
    vendorName: vendor.value.shopName,
    vendorAvatar: vendor.value.userAvatar || vendor.value.avatar,
    vendorVerified: vendor.value.verified || false,
    ...postData,
  }

  try {
    const savedPost = await postStore.createPost(newPost)
    console.log('✅ Post créé:', savedPost)

    showNotification.value = true
    setTimeout(() => {
      showNotification.value = false
    }, 5000)

    showCreatePostModal.value = false
    await loadVendorPosts(vendor.value.id)

  } catch (error) {
    console.error('❌ Erreur création post:', error)
  }
}

const loadVendorPosts = async (vendorId) => {
  try {
    if (vendorId) {
      vendorPosts.value = await postStore.fetchVendorPosts(vendorId)
      console.log(`📝 ${vendorPosts.value.length} posts chargés`)
    }
  } catch (error) {
    console.error('❌ Erreur chargement posts:', error)
    vendorPosts.value = []
  }
}

const loadVendorProducts = async (vendorId) => {
  try {
    if (vendorId) {
      vendorProducts.value = await productStore.fetchProductsByVendor(vendorId)
      console.log(`📦 ${vendorProducts.value.length} produits chargés`)
    }
  } catch (error) {
    console.error('❌ Erreur chargement produits:', error)
    vendorProducts.value = []
  }
}

// ===== GESTION DES IMAGES =====
const openImage = (img) => {
  selectedImage.value = img
  showImageModal.value = true
}

// ===== GESTION DES LIKES =====
const togglePostLike = (post) => {
  console.log('togglePostLike', post)
}

const isPostLiked = (postId) => {
  return false
}

// ===== GESTION DES COMMENTAIRES =====
const toggleComments = (postId) => {
  showComments.value = showComments.value === postId ? null : postId
}

const addComment = (postId) => {
  if (!newComment.value.trim()) return
  console.log('addComment', postId, newComment.value)
  newComment.value = ''
}

// ===== GESTION DES ACTIONS =====
const toggleFollow = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    const result = await vendorStore.toggleFollow(vendor.value.id)
    isFollowing.value = result.following

    if (result.following) {
      vendor.value.followersCount = (vendor.value.followersCount || 0) + 1
    } else {
      vendor.value.followersCount = Math.max(0, (vendor.value.followersCount || 0) - 1)
    }
  } catch (error) {
    console.error('❌ Erreur follow:', error)
  }
}

const goToEditProfile = () => {
  router.push(`/vendor/edit/${vendor.value?.id}`)
}

const goToAddProduct = () => {
  router.push(`/vendor/add-product/${vendor.value?.id}`)
}

const sharePost = (post) => {
  console.log('sharePost', post)
}

const buyProduct = (post) => {
  console.log('buyProduct', post)
}

const quickBuy = (product) => {
  console.log('quickBuy', product)
}

const openCoverUpload = () => {
  console.log('openCoverUpload')
}

const openAvatarUpload = () => {
  console.log('openAvatarUpload')
}

const openMessageModal = () => {
  console.log('openMessageModal')
}

const togglePostMenu = (postId) => {
  showPostMenu.value = showPostMenu.value === postId ? null : postId
}

const editPost = (post) => {
  console.log('editPost', post)
}

const deletePost = (post) => {
  console.log('deletePost', post)
}

// ===== CHARGEMENT INITIAL =====
const loadVendor = async () => {
  const id = vendorId.value
  console.log('🔍 Chargement du vendeur ID:', id)

  if (!id) {
    console.log('❌ ID vendeur manquant')
    vendor.value = null
    loading.value = false
    return
  }

  try {
    const vendorData = await vendorStore.fetchVendorById(id)

    if (vendorData) {
      vendor.value = vendorData
      console.log('✅ Vendeur trouvé:', vendorData)

      await Promise.all([
        loadVendorPosts(id),
        loadVendorProducts(id)
      ])

      if (authStore.isAuthenticated && authStore.userId !== vendorData.userId) {
        // Vérifier si l'utilisateur suit ce vendeur
        // isFollowing.value = await vendorStore.isFollowing(id)
      }
    } else {
      console.log('❌ Vendeur non trouvé')
      vendor.value = null
    }
  } catch (error) {
    console.error('❌ Erreur chargement vendeur:', error)
    vendor.value = null
  } finally {
    loading.value = false
  }
}

watch(vendorId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadVendor()
  }
})

onMounted(() => {
  console.log('VendorProfile mounted')
  console.log('AuthStore disponible:', !!authStore)
  console.log('VendorStore disponible:', !!vendorStore)
  loadVendor()
})
</script>

<style scoped>
/* ===== VOS STYLES EXISTANTS (conservés) ===== */
.vendor-profile-page {
  background: #f0f2f5;
  min-height: 100vh;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== LOADING ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #d40025;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== COVER ===== */
.profile-cover {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}

.cover-actions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.btn-cover,
.btn-follow,
.btn-message,
.btn-edit-profile {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-cover,
.btn-edit-profile {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
}

.btn-cover:hover,
.btn-edit-profile:hover {
  background: white;
}

.btn-follow {
  background: #d40025;
  color: white;
}

.btn-follow.following {
  background: #10b981;
}

.btn-message {
  background: white;
  color: #1e293b;
}

.btn-follow:hover,
.btn-message:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* ===== PROFILE HEADER ===== */
.profile-header {
  background: white;
  padding: 20px 0 30px;
  margin-top: -50px;
  position: relative;
  z-index: 5;
  border-radius: 30px 30px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 5px solid white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  background: #d40025;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  border: 3px solid white;
}

.avatar-edit {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-edit:hover {
  transform: scale(1.1);
  background: #d40025;
  color: white;
}

.info-main {
  flex: 1;
}

.shop-name {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 5px;
}

.vendor-name {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 5px;
}

.vendor-specialty {
  display: inline-block;
  padding: 5px 15px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #d40025;
  font-weight: 600;
  margin: 10px 0;
}

.vendor-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  font-size: 0.95rem;
}

.profile-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.profile-bio {
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.profile-bio p {
  color: #334155;
  line-height: 1.7;
  font-size: 1rem;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #d40025;
}

.social-links {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.social-link {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
}

.social-link.facebook {
  background: #1877f2;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433, #d62976, #962fbf);
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.joined-date {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* ===== CREATE POST SECTION ===== */
.create-post-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
}

.create-post-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-input {
  flex: 1;
  background: #f0f2f5;
  border-radius: 30px;
  padding: 10px 15px;
  cursor: pointer;
  color: #64748b;
}

.post-input:hover {
  background: #e4e6e9;
}

.post-photo-btn {
  padding: 8px 15px;
  background: #f0f2f5;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #1e293b;
}

.post-photo-btn:hover {
  background: #e4e6e9;
}

/* ===== TABS ===== */
.profile-tabs {
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.tabs-nav {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.tab-btn {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #d40025;
}

.tab-btn.active {
  color: #d40025;
  border-bottom-color: #d40025;
}

/* ===== TAB CONTENT ===== */
.tab-content {
  padding: 30px 0;
}

/* ===== POSTS FEED ===== */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  position: relative;
}

.post-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author {
  flex: 1;
}

.post-author h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.post-date {
  color: #64748b;
  font-size: 0.8rem;
}

.post-status-badge {
  padding: 4px 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.post-images {
  display: grid;
  gap: 5px;
  margin: 15px 0;
  border-radius: 12px;
  overflow: hidden;
}

.post-images.multiple {
  grid-template-columns: repeat(2, 1fr);
}

.post-image {
  cursor: pointer;
  aspect-ratio: 1/1;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-image:hover img {
  transform: scale(1.05);
}

.more-images {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  aspect-ratio: 1/1;
}

.post-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}

.current-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: #d40025;
}

.old-price {
  color: #94a3b8;
  text-decoration: line-through;
  font-size: 1rem;
}

.post-colors {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.colors-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.colors-list {
  display: flex;
  gap: 5px;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post-quantity {
  font-size: 0.9rem;
  color: #08717f;
  margin: 10px 0;
}

.quantity-label {
  color: #64748b;
  margin-left: 5px;
}

.post-actions {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.action-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #d40025;
}

.action-btn.buy-btn {
  margin-right: auto;
  background: #d40025;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
}

.action-btn.buy-btn:hover {
  background: #b00020;
  transform: translateY(-2px);
}

/* ===== COMMENTS ===== */
.comments-section {
  padding-top: 15px;
}

.add-comment {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.add-comment input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.9rem;
}

.add-comment input:focus {
  outline: none;
  border-color: #d40025;
}

.add-comment button {
  padding: 8px 20px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
}

.add-comment button:hover {
  background: #b00020;
}

/* ===== PRODUCTS GRID ===== */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-buy {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  background: #d40025;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  transition: bottom 0.3s ease;
  font-weight: 600;
}

.product-card:hover .quick-buy {
  bottom: 0;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.product-price {
  color: #d40025;
  font-weight: 700;
  font-size: 1.1rem;
}

/* ===== ABOUT TAB ===== */
.about-card,
.info-card,
.stats-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.about-card h3,
.info-card h3,
.stats-card h3 {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #64748b;
  font-weight: 600;
}

.info-value {
  color: #1e293b;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.btn-create {
  padding: 12px 25px;
  background: #d40025;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: 600;
}

.btn-create:hover {
  background: #b00020;
  transform: translateY(-2px);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
}

/* ===== NOT FOUND ===== */
.not-found {
  text-align: center;
  padding: 100px 20px;
}

.not-found h2 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 20px;
}

.btn-home {
  display: inline-block;
  padding: 12px 30px;
  background: #d40025;
  color: white;
  text-decoration: none;
  border-radius: 8px;
}

.btn-home:hover {
  background: #b00020;
}

/* ===== SUCCESS NOTIFICATION ===== */
.success-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  animation: slideDown 0.5s ease;
  max-width: 90%;
  width: 450px;
}

.notification-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 15px;
  border-right: 4px solid #08717f;
  position: relative;
}

.notification-icon {
  font-size: 2.5rem;
  animation: scaleIn 0.5s ease;
}

.notification-text {
  flex: 1;
}

.notification-text strong {
  display: block;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 5px;
}

.notification-text p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.notification-close {
  background: #f1f5f9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: #d40025;
  color: white;
  transform: rotate(90deg);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes scaleIn {
  from { transform: scale(0); }
  70% { transform: scale(1.2); }
  to { transform: scale(1); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .tabs-nav {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    padding: 10px;
  }
}
</style>
