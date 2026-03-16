<!-- src/views/VendorProfile.vue -->
<template>
  <div class="vendor-profile-page" dir="rtl">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الملف الشخصي...</p>
    </div>

    <template v-else-if="vendor">
      <!-- Cover Image -->
      <div class="profile-cover">
        <img
          :src="vendor.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'"
          alt="Cover"
          class="cover-image"
        />
        <div class="cover-overlay"></div>

        <!-- Cover Actions -->
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
                :src="vendor.avatar || 'https://i.pravatar.cc/300'"
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
              <p class="vendor-specialty">{{ vendor.specialty }}</p>
              <div class="vendor-location" v-if="vendor.location">
                <span class="icon">📍</span> {{ vendor.location }}
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item" @click="activeTab = 'posts'">
                <span class="stat-value">{{ vendorPosts.length }}</span>
                <span class="stat-label">منشورات</span>
              </div>
              <div class="stat-item" @click="activeTab = 'products'">
                <span class="stat-value">{{ vendor.productsCount || 0 }}</span>
                <span class="stat-label">منتجات</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ vendor.followersCount || 0 }}</span>
                <span class="stat-label">متابعون</span>
              </div>
            </div>
          </div>
          <div class="profile-bio" v-if="vendor.description">
            <p>{{ vendor.description }}</p>
          </div>
          <div class="contact-info">
            <a v-if="vendor.phone" :href="`tel:${vendor.phone}`" class="contact-link"
              ><span class="icon">📞</span> {{ vendor.phone }}</a
            >
            <a :href="`mailto:${vendor.email}`" class="contact-link"
              ><span class="icon">📧</span> {{ vendor.email }}</a
            >
          </div>
          <div class="social-links" v-if="vendor.socialLinks">
            <a v-if="vendor.socialLinks.facebook" :href="vendor.socialLinks.facebook" target="_blank" class="social-link facebook">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/>
              </svg>
            </a>
            <a v-if="vendor.socialLinks.instagram" :href="vendor.socialLinks.instagram" target="_blank" class="social-link instagram">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
              </svg>
            </a>
          </div>
          <div class="joined-date">
            <span class="icon">📅</span> انضم في {{ formatDate(vendor.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Create Post Section (for current user only) -->
      <div v-if="isCurrentUser" class="create-post-section">
        <div class="container">
          <div class="create-post-card">
            <div class="post-header">
              <img :src="vendor.avatar" alt="" class="post-avatar" />
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
              <span class="tab-icon">📝</span>
              المنشورات ({{ vendorPosts.length }})
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'products' }"
              @click="activeTab = 'products'"
            >
              <span class="tab-icon">🛍️</span>
              المنتجات ({{ vendor.productsCount || 0 }})
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'about' }"
              @click="activeTab = 'about'"
            >
              <span class="tab-icon">ℹ️</span>
              معلومات
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <div class="container">
          <!-- POSTS TAB - Design moderne -->
          <div v-if="activeTab === 'posts'" class="posts-tab">
            <!-- Loading posts -->
            <div v-if="loadingPosts" class="loading-posts">
              <div class="small-spinner"></div>
              <p>جاري تحميل المنشورات...</p>
            </div>

            <!-- Posts Feed -->
            <div v-else-if="vendorPosts.length > 0" class="posts-feed">
              <div v-for="post in vendorPosts" :key="post.id" class="post-card">
                <!-- Status badge for owner -->
                <div v-if="isCurrentUser && post.status !== 'approved'" class="post-status-badge" :class="post.status">
                  <span v-if="post.status === 'pending'">⏳ في انتظار المراجعة</span>
                  <span v-else-if="post.status === 'rejected'">❌ مرفوض</span>
                </div>

                <!-- Post Header -->
                <div class="post-header">
                  <div class="post-author">
                    <img :src="post.vendorAvatar || vendor.avatar" :alt="post.vendorName" class="post-avatar" />
                    <div class="post-author-info">
                      <h4>{{ post.vendorName || vendor.shopName }}</h4>
                      <div class="post-meta">
                        <span class="post-date">{{ formatTimeAgo(post.createdAt) }}</span>
                        <span class="post-privacy" v-if="post.status === 'approved'">
                          <span class="privacy-icon">🌐</span> عام
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Post Options (for owner) -->
                  <div v-if="isCurrentUser" class="post-options">
                    <button class="options-btn" @click="togglePostMenu(post.id)">⋯</button>
                    <div v-if="showPostMenu === post.id" class="options-menu">
                      <button @click="editPost(post)">
                        <span class="menu-icon">✏️</span> تعديل
                      </button>
                      <button @click="deletePost(post)">
                        <span class="menu-icon">🗑️</span> حذف
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Post Content -->
                <div class="post-content" v-if="post.content">
                  <p>{{ post.content }}</p>
                </div>

                <!-- Product in Post -->
                <div class="post-product">
                  <h3 class="product-title">{{ post.productName }}</h3>
                  <p class="product-desc">{{ post.description }}</p>

                  <!-- Product Images Gallery -->
                  <div class="product-gallery" v-if="post.images && post.images.length">
                    <div
                      v-for="(img, index) in post.images"
                      :key="index"
                      class="gallery-item"
                      :class="{ active: activeImage === index }"
                      @click="activeImage = index"
                    >
                      <img :src="img" :alt="post.productName" />
                    </div>
                  </div>

                  <!-- Main Image Display -->
                  <div class="product-main-image" @click="openImage(post.images[activeImage])" v-if="post.images && post.images.length">
                    <img :src="post.images[activeImage]" :alt="post.productName" />
                    <div v-if="post.images.length > 1" class="image-counter">
                      <button class="nav-btn prev" @click.stop="prevImage">❮</button>
                      <span>{{ activeImage + 1 }}/{{ post.images.length }}</span>
                      <button class="nav-btn next" @click.stop="nextImage">❯</button>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="post-price">
                    <span class="current-price">{{ formatPrice(post.price) }} د.ت</span>
                    <span v-if="post.oldPrice" class="old-price">
                      {{ formatPrice(post.oldPrice) }} د.ت
                    </span>
                  </div>

                  <!-- Colors -->
                  <div v-if="post.colors && post.colors.length" class="post-colors">
                    <span class="colors-label">الألوان:</span>
                    <div class="colors-list">
                      <span
                        v-for="color in post.colors"
                        :key="color"
                        class="color-dot"
                        :style="{ backgroundColor: getColorCode(color) }"
                        :title="color"
                      ></span>
                    </div>
                  </div>

                  <!-- Quantity/Unit -->
                  <div class="post-quantity" v-if="post.quantity">
                    <span class="quantity-label">الكمية:</span>
                    <span>{{ post.quantity }} {{ getUnitLabel(post.unit) }}</span>
                  </div>
                </div>

                <!-- Post Stats -->
                <div class="post-stats" v-if="post.status === 'approved'">
                  <div class="stat">
                    <span class="stat-icon">❤️</span>
                    <span>{{ post.likes || 0 }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">💬</span>
                    <span>{{ post.comments || 0 }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🔄</span>
                    <span>{{ post.shares || 0 }}</span>
                  </div>
                </div>

                <!-- Post Actions -->
                <div class="post-actions" v-if="post.status === 'approved'">
                  <button class="action-btn like" :class="{ liked: isPostLiked(post.id) }" @click="togglePostLike(post)">
                    <span class="btn-icon">{{ isPostLiked(post.id) ? '❤️' : '🤍' }}</span>
                    <span>إعجاب</span>
                  </button>
                  <button class="action-btn comment" @click="toggleComments(post.id)">
                    <span class="btn-icon">💬</span>
                    <span>تعليق</span>
                  </button>
                  <button class="action-btn share" @click="sharePost(post)">
                    <span class="btn-icon">🔗</span>
                    <span>مشاركة</span>
                  </button>
                  <button v-if="!isCurrentUser" class="action-btn buy" @click="buyProduct(post)">
                    <span class="btn-icon">🛒</span>
                    <span>شراء</span>
                  </button>
                </div>

                <!-- Comments Section -->
                <div v-if="showComments === post.id && post.status === 'approved'" class="comments-section">
                  <div v-if="post.commentsList && post.commentsList.length > 0" class="comments-list">
                    <div v-for="comment in post.commentsList" :key="comment.id" class="comment-item">
                      <img :src="comment.userAvatar" :alt="comment.userName" class="comment-avatar" />
                      <div class="comment-content">
                        <div class="comment-header">
                          <strong>{{ comment.userName }}</strong>
                          <span class="comment-date">{{ formatTimeAgo(comment.createdAt) }}</span>
                        </div>
                        <p>{{ comment.comment }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Add Comment -->
                  <div v-if="authStore.isAuthenticated" class="add-comment">
                    <img :src="authStore.userAvatar" alt="" class="comment-avatar" />
                    <div class="comment-input-wrapper">
                      <input
                        v-model="newComment"
                        @keyup.enter="addComment(post.id)"
                        type="text"
                        placeholder="اكتب تعليقاً..."
                      />
                      <button @click="addComment(post.id)" :disabled="!newComment.trim()">نشر</button>
                    </div>
                  </div>
                  <div v-else class="login-to-comment">
                    <router-link :to="`/login?redirect=/vendor/${vendor.id}`">
                      سجل الدخول
                    </router-link>
                    للمشاركة بتعليق
                  </div>
                </div>

                <!-- Rejection Reason (for owner) -->
                <div v-if="isCurrentUser && post.status === 'rejected' && post.rejectionReason" class="rejection-reason">
                  <strong>سبب الرفض:</strong>
                  <p>{{ post.rejectionReason }}</p>
                </div>
              </div>
            </div>

            <!-- Empty Posts State -->
            <div v-else class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>لا توجد منشورات بعد</h3>
              <p v-if="isCurrentUser">
                انشر أول منتج في متجرك بالضغط على "ما الجديد في متجرك؟"
              </p>
            </div>
          </div>

          <!-- PRODUCTS TAB -->
          <div v-if="activeTab === 'products'" class="products-tab">
            <div v-if="vendor.productsList && vendor.productsList.length > 0" class="products-grid">
              <div v-for="product in vendor.productsList" :key="product.id" class="product-card">
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                  <div class="product-badges">
                    <span v-if="product.isNew" class="badge new">جديد</span>
                  </div>
                  <button v-if="!isCurrentUser" class="quick-buy" @click="quickBuy(product)">
                    🛒 أضف للسلة
                  </button>
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="product-price">{{ formatPrice(product.price) }} د.ت</p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>لا توجد منتجات بعد</h3>
            </div>
          </div>

          <!-- ABOUT TAB -->
          <div v-if="activeTab === 'about'" class="about-tab">
            <div class="about-card">
              <h3>عن المتجر</h3>
              <p>{{ vendor.description || 'لا توجد معلومات متاحة' }}</p>
            </div>

            <div class="info-card">
              <h3>معلومات الاتصال</h3>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-label">📧 البريد الإلكتروني</span>
                  <span class="info-value">{{ vendor.email }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍 الموقع</span>
                  <span class="info-value">{{ vendor.location || 'غير محدد' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📞 الهاتف</span>
                  <span class="info-value">{{ vendor.phone || 'غير محدد' }}</span>
                </div>
              </div>
            </div>

            <div class="stats-card">
              <h3>إحصائيات</h3>
              <div class="stats-grid">
                <div class="stat-box">
                  <span class="stat-big">{{ vendor.productsCount || 0 }}</span>
                  <span>منتج</span>
                </div>
                <div class="stat-box">
                  <span class="stat-big">{{ vendor.followersCount || 0 }}</span>
                  <span>متابع</span>
                </div>
                <div class="stat-box">
                  <span class="stat-big">{{ vendor.rating || 0 }}</span>
                  <span>تقييم</span>
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
              <p>سيتم مراجعة منشورك من قبل الإدارة خلال 24 ساعة وسيتم نشره بعد الموافقة</p>
            </div>
            <button class="notification-close" @click="showNotification = false">✕</button>
          </div>
        </div>
      </transition>
    </template>

    <!-- Vendor Not Found -->
    <div v-else class="not-found">
      <h2>المتجر غير موجود</h2>
      <router-link to="/" class="btn-home">العودة للرئيسية</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import CreatePostModal from '../components/CreatePostModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const postStore = usePostStore()
const cartStore = useCartStore()

// ===== STATE =====
const loading = ref(true)
const loadingPosts = ref(false)
const vendor = ref(null)
const vendorPosts = ref([])
const activeTab = ref('posts')
const isFollowing = ref(false)
const showCreatePostModal = ref(false)
const showPostMenu = ref(null)
const showComments = ref(null)
const newComment = ref('')
const showImageModal = ref(false)
const selectedImage = ref('')
const showNotification = ref(false)
const activeImage = ref(0)

// ===== COMPUTED =====
const isCurrentUser = computed(() => {
  return (
    authStore.isAuthenticated &&
    authStore.userRole === 'vendor' &&
    String(authStore.user?.id) === String(vendor.value?.userId)
  )
})

// ===== METHODS =====
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-TN').format(price || 0)
}

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'الآن'
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} ي`
  return date.toLocaleDateString('ar-TN')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getColorCode = (colorName) => {
  const colors = {
    أحمر: '#d40025',
    أزرق: '#08717f',
    أخضر: '#10b981',
    أصفر: '#fbbf24',
    بنفسجي: '#8b5cf6',
    وردي: '#ec4899',
    بني: '#92400e',
    أسود: '#1e293b',
    أبيض: '#ffffff',
    رمادي: '#64748b',
    Rouge: '#d40025',
    Bleu: '#08717f',
    Vert: '#10b981',
    Jaune: '#fbbf24',
    Violet: '#8b5cf6',
    Rose: '#ec4899',
    Marron: '#92400e',
    Noir: '#1e293b',
    Blanc: '#ffffff',
    Gris: '#64748b',
  }
  return colors[colorName] || '#64748b'
}

const getUnitLabel = (unit) => {
  const units = {
    piece: 'قطعة',
    set: 'طقم',
    kg: 'كغ',
    gram: 'غ',
    liter: 'لتر',
    meter: 'م'
  }
  return units[unit] || 'قطعة'
}

// Image Gallery
const prevImage = () => {
  activeImage.value = activeImage.value > 0 ? activeImage.value - 1 : activeImage.value
}

const nextImage = () => {
  const post = vendorPosts.value.find(p => showComments.value === p.id)
  if (post && activeImage.value < post.images.length - 1) {
    activeImage.value++
  }
}

// ===== POST METHODS (CORRIGÉES AVEC postStore) =====
const loadVendorPosts = async (vendorId) => {
  if (!vendorId) return

  loadingPosts.value = true
  try {
    // ✅ Utilisation du postStore avec onlyApproved: true
    const posts = await postStore.fetchVendorPosts(vendorId, { onlyApproved: true })
    vendorPosts.value = posts
    console.log(`✅ ${vendorPosts.value.length} posts approuvés chargés`)
  } catch (error) {
    console.error('❌ Erreur chargement posts:', error)
    vendorPosts.value = []
  } finally {
    loadingPosts.value = false
  }
}

const openCreatePostModal = () => {
  showCreatePostModal.value = true
}

// ✅ Méthode corrigée pour créer un post via le store
const handlePostCreated = async (postData) => {
  console.log('📝 handlePostCreated reçu:', postData);

  try {
    // Préparer les données du post
    const newPost = {
      productName: postData.productName,
      description: postData.description,
      content: postData.content || '',
      category: postData.category,
      price: parseFloat(postData.price),
      oldPrice: postData.oldPrice ? parseFloat(postData.oldPrice) : null,
      colors: postData.colors || [],
      quantity: postData.quantity || 1,
      unit: postData.unit || 'piece',
      inStock: postData.inStock !== false,
      images: postData.images || []
    };

    console.log('🆕 Création du post:', newPost);

    // ✅ Utiliser le postStore pour créer le post
    const createdPost = await postStore.createPost(newPost);
    console.log('✅ Post créé avec succès:', createdPost);

    // Recharger les posts pour voir le nouveau post en attente
    await loadVendorPosts(vendor.value.id);

    showCreatePostModal.value = false;
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  } catch (error) {
    console.error('❌ Erreur création post:', error);
    alert('❌ Erreur lors de la création du post: ' + (error.message || ''));
  }
};

const isPostLiked = (postId) => {
  const likes = JSON.parse(localStorage.getItem('post_likes') || '[]')
  return likes.includes(postId)
}

const togglePostLike = async (post) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    // ✅ Utiliser le postStore pour le like/unlike
    const result = await postStore.toggleLike(post.id)

    if (result.liked) {
      post.likes = (post.likes || 0) + 1
    } else {
      post.likes = (post.likes || 0) - 1
    }

    // Mettre à jour le localStorage local
    const likes = JSON.parse(localStorage.getItem('post_likes') || '[]')
    if (result.liked) {
      likes.push(post.id)
    } else {
      const index = likes.indexOf(post.id)
      if (index !== -1) likes.splice(index, 1)
    }
    localStorage.setItem('post_likes', JSON.stringify(likes))
  } catch (error) {
    console.error('❌ Erreur like:', error)
  }
}

const toggleComments = (postId) => {
  showComments.value = showComments.value === postId ? null : postId
  activeImage.value = 0
}

const addComment = async (postId) => {
  if (!newComment.value.trim() || !authStore.isAuthenticated) return

  try {
    // ✅ Utiliser le postStore pour ajouter un commentaire
    const comment = await postStore.addComment(postId, newComment.value)

    const post = vendorPosts.value.find(p => p.id === postId)
    if (post) {
      if (!post.commentsList) post.commentsList = []
      post.commentsList.unshift(comment)
      post.comments = (post.comments || 0) + 1
    }

    newComment.value = ''
  } catch (error) {
    console.error('❌ Erreur commentaire:', error)
    alert('Erreur lors de l\'ajout du commentaire')
  }
}

const sharePost = async (post) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.productName,
        text: post.description,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('تم نسخ الرابط')
  }
}

const buyProduct = (post) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  cartStore.addItem({
    id: post.id,
    name: post.productName,
    price: post.price,
    image: post.images?.[0] || '',
    quantity: 1,
    vendorName: post.vendorName
  })
}

const editPost = (post) => {
  console.log('editPost', post)
  showPostMenu.value = null
}

const deletePost = async (post) => {
  if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return

  try {
    // ✅ Utiliser le postStore pour supprimer le post
    await postStore.deletePost(post.id)
    vendorPosts.value = vendorPosts.value.filter(p => p.id !== post.id)
    showPostMenu.value = null
    alert('✅ تم حذف المنشور')
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    alert('❌ Erreur lors de la suppression')
  }
}

const togglePostMenu = (id) => {
  showPostMenu.value = showPostMenu.value === id ? null : id
}

// ===== INTERACTIONS =====
const openCoverUpload = () => {
  console.log('openCoverUpload - À implémenter')
}

const goToEditProfile = () => {
  if (vendor.value?.id) {
    router.push(`/vendor/edit/${vendor.value.id}`)
  }
}

const openAvatarUpload = () => {
  console.log('openAvatarUpload - À implémenter')
}

const toggleFollow = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  isFollowing.value = !isFollowing.value
}

const openMessageModal = () => {
  console.log('openMessageModal - À implémenter')
}

const openImage = (img) => {
  selectedImage.value = img
  showImageModal.value = true
}

const quickBuy = (product) => {
  console.log('quickBuy', product)
}

// ===== LIFECYCLE =====
onMounted(async () => {
  try {
    loading.value = true
    const vendorId = route.params.id
    console.log('🔍 Chargement du vendeur ID:', vendorId)

    // Récupérer le vendeur
    if (vendorStore.getVendorById) {
      vendor.value = await vendorStore.getVendorById(vendorId)
    }

    if (vendor.value) {
      console.log('✅ Vendeur trouvé:', vendor.value)

      // ✅ CHARGER LES POSTS (seulement ceux approuvés)
      await loadVendorPosts(vendorId)

      // Vérifier si l'utilisateur suit ce vendeur
      const following = JSON.parse(localStorage.getItem('following') || '[]')
      isFollowing.value = following.includes(vendorId)
    } else {
      console.log('❌ Vendeur non trouvé avec ID:', vendorId)
    }

    setTimeout(() => {
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('❌ Erreur dans VendorProfile:', error)
    loading.value = false
  }
})
</script>

<style scoped>
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.post-options {
  position: relative;
}

.options-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0 5px;
}

.options-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
  min-width: 120px;
}

.options-menu button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  text-align: right;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e293b;
}

.options-menu button:hover {
  background: #f1f5f9;
}

.post-content {
  margin-bottom: 15px;
}

.post-content p {
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-product {
  background: #f8fafc;
  border-radius: 12px;
  padding: 15px;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
}

.product-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.post-images {
  display: grid;
  gap: 5px;
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
}

.post-images.multiple {
  grid-template-columns: repeat(2, 1fr);
}

.post-image {
  cursor: pointer;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1/1;
}

.post-price {
  display: flex;
  align-items: center;
  gap: 10px;
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

.out-of-stock {
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 600;
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

.action-btn.like .heart.liked {
  color: #d40025;
}

.action-btn.buy {
  margin-right: auto;
  background: #d40025;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
}

.action-btn.buy:hover {
  background: #b00020;
  transform: translateY(-2px);
}

/* ===== COMMENTS ===== */
.comments-section {
  padding-top: 15px;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.comment-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  background: #f0f2f5;
  padding: 10px 15px;
  border-radius: 18px;
}

.comment-content strong {
  font-size: 0.9rem;
  color: #1e293b;
  margin-bottom: 3px;
  display: block;
}

.comment-content p {
  color: #1e293b;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.comment-date {
  color: #64748b;
  font-size: 0.7rem;
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

.login-to-comment {
  text-align: center;
  color: #64748b;
  padding: 15px;
}

.login-to-comment a {
  color: #d40025;
  text-decoration: none;
  font-weight: 600;
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

.product-badges {
  position: absolute;
  top: 10px;
  right: 10px;
}

.badge.new {
  background: #d40025;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
}

.stat-big {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #d40025;
  margin-bottom: 5px;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 10px;
}

.empty-state p {
  color: #64748b;
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
  /* Ajoutez ces styles dans la section <style> de VendorProfile.vue */

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
    from {
      transform: scale(0);
    }
    70% {
      transform: scale(1.2);
    }
    to {
      transform: scale(1);
    }
  }
}
.loading-posts {
  text-align: center;
  padding: 40px 20px;
}

.small-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #08717f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

.post-status-badge {
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: inline-block;
}

.post-status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.post-status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.rejection-reason {
  margin-top: 15px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #991b1b;
  border-right: 3px solid #dc2626;
}

.tab-icon {
  margin-left: 5px;
}

/* Product Gallery */
.product-gallery {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding: 5px 0;
}

.product-gallery::-webkit-scrollbar {
  height: 4px;
}

.product-gallery::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.gallery-item {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.gallery-item.active {
  opacity: 1;
  border: 2px solid #d40025;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-main-image {
  position: relative;
  height: 250px;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.product-main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-counter {
  position: absolute;
  bottom: 10px;
  right: 50%;
  transform: translateX(50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 30px;
  font-size: 0.8rem;
}

.image-counter .nav-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.image-counter .nav-btn:hover {
  background: rgba(255,255,255,0.2);
}

.post-stats {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.9rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 1rem;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f0f2f5;
  border-radius: 30px;
  overflow: hidden;
}

.comment-input-wrapper input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
}

.comment-input-wrapper input:focus {
  outline: none;
}

.comment-input-wrapper button {
  padding: 8px 20px;
  background: #d40025;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.comment-input-wrapper button:hover:not(:disabled) {
  background: #b00020;
}

.comment-input-wrapper button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
