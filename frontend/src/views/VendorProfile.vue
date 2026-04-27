<!-- src/views/VendorProfile.vue -->
<template>
  <div class="vendor-profile-page" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>جاري تحميل الملف الشخصي...</p>
      </div>
    </div>

    <template v-else-if="vendor">
      <!-- Cover Photo Section -->
      <div class="cover-photo-container">
        <div class="cover-photo-wrapper">
          <img
            :src="getCoverImage()"
            alt="صورة الغلاف"
            class="cover-photo"
            @error="handleCoverImageError"
            :key="coverImageKey"
          />
          <div class="cover-overlay-gradient"></div>
          <button v-if="isCurrentUser" class="change-cover-btn" @click="openCoverUpload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>تغيير الغلاف</span>
          </button>
        </div>
      </div>

      <!-- Instagram Style Header -->
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img
                :src="getAvatarImage()"
                :alt="vendor.shopName"
                class="profile-avatar"
                @error="handleAvatarImageError"
                :key="avatarKey"
              />
              <button v-if="isCurrentUser" class="avatar-edit-btn" @click="openAvatarUpload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                </svg>
              </button>
              <div v-if="vendor.verified" class="verified-badge-instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="profile-info-section">
            <div class="profile-actions-row">
              <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="profile-username-link">
                <h1 class="profile-username">{{ vendor.shopName || vendor.shop_name }}</h1>
              </router-link>
              <div class="action-buttons">
                <template v-if="isCurrentUser">
                  <button class="btn-edit-profile" @click="goToEditProfile">تعديل الملف</button>
                  <button class="btn-settings" @click="openSettings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <button class="btn-message-instagram" @click="contactVendor">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <div class="profile-stats-instagram">
              <div class="stat-item">
                <span class="stat-number">{{ vendorPosts.length }}</span>
                <span class="stat-label">منشورات</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ vendorReels.length }}</span>
                <span class="stat-label">Reels</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ vendor.followersCount || vendor.followers_count || 0 }}</span>
                <span class="stat-label">متابعون</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ vendor.followingCount || 0 }}</span>
                <span class="stat-label">يتابع</span>
              </div>
            </div>

            <div class="profile-bio-instagram">
              <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="bio-name-link">
                <div class="bio-name">{{ vendor.name || vendor.userName || vendor.user_name }}</div>
              </router-link>
              <div class="bio-text">{{ vendor.description || 'لا يوجد وصف بعد' }}</div>
              <div class="bio-link" v-if="vendor.website">
                <a :href="vendor.website" target="_blank">{{ vendor.website }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de publication style Facebook -->
        <div v-if="isCurrentUser" class="facebook-create-post-section">
          <div class="facebook-post-card">
            <div class="facebook-post-header">
              <img :src="getAvatarImage()" alt="Avatar" class="facebook-avatar" />
              <button class="facebook-post-button" @click="openCreatePostModal">
                ما الذي يدور في ذهنك يا {{ vendor.shopName }}؟
              </button>
            </div>
            <div class="facebook-post-actions">
              <button class="facebook-action-btn" @click="openCreatePostModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>صورة/فيديو</span>
              </button>
              <button class="facebook-action-btn" @click="openCreateReelModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                </svg>
                <span>Reel</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button class="tab-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
            <span>المنشورات</span>
          </button>
          <button class="tab-link" :class="{ active: activeTab === 'reels' }" @click="activeTab = 'reels'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
            <span>Reels</span>
          </button>
        </div>

        <!-- Posts Grid -->
        <div v-if="activeTab === 'posts'" class="posts-grid-instagram">
          <div v-if="vendorPosts.length > 0" class="instagram-grid">
            <div v-for="post in vendorPosts" :key="post.id" class="grid-post" @click="openPostModal(post)">
              <div class="post-image-container">
                <img :src="getPostImage(post)" :alt="post.productName" class="grid-post-image" @error="handlePostImageError" />
                <button
                  class="grid-wishlist-btn"
                  :class="{ active: isPostInWishlist(post.id) }"
                  @click.stop="togglePostWishlist(post)"
                >
                  <svg viewBox="0 0 24 24" :fill="isPostInWishlist(post.id) ? '#ef4444' : 'none'" stroke="white" stroke-width="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <div class="post-overlay-instagram">
                  <div class="post-stats">
                    <div class="stat">
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{{ post.likes || 0 }}</span>
                    </div>
                    <div class="stat">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>{{ post.commentsCount || 0 }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="post.isPinned" class="pinned-badge-instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
            <p>لا توجد منشورات بعد</p>
            <button v-if="isCurrentUser" class="btn-create-instagram" @click="openCreatePostModal">أنشئ أول منشور</button>
          </div>
        </div>

        <!-- Reels Grid -->
        <div v-if="activeTab === 'reels'" class="reels-section">
          <div class="reels-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
              Reels
            </h2>
            <button v-if="isCurrentUser" class="reels-more-btn" @click="openCreateReelModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Créer
            </button>
          </div>
          <div v-if="vendorReels.length > 0" class="instagram-reels-grid">
            <div v-for="reel in vendorReels" :key="reel.id" class="reel-card-instagram" @click="openReelModal(reel)">
              <div class="reel-video-container">
                <video :src="getReelVideo(reel)" class="reel-video-instagram" muted loop playsinline
                  @mouseenter="(e) => { e.target.play(); }"
                  @mouseleave="(e) => { e.target.pause(); e.target.currentTime = 0; }"
                ></video>
                <button
                  class="reel-wishlist-btn"
                  :class="{ active: isReelInWishlist(reel.id) }"
                  @click.stop="toggleReelWishlist(reel)"
                >
                  <svg viewBox="0 0 24 24" :fill="isReelInWishlist(reel.id) ? '#ef4444' : 'none'" stroke="white" stroke-width="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <div class="reel-overlay-instagram">
                  <div class="reel-top-info">
                    <img :src="getAvatarImage()" class="reel-avatar" />
                    <span class="reel-username">{{ vendor.shopName }}</span>
                  </div>
                  <div class="reel-play-icon">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg>
                  </div>
                  <div class="reel-stats-instagram">
                    <div class="reel-stat-instagram">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{{ reel.likes || 0 }}</span>
                    </div>
                    <div class="reel-stat-instagram">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>{{ reel.commentsCount || 0 }}</span>
                    </div>
                  </div>
                </div>
                <div class="reel-title-instagram">{{ reel.title || reel.productName }}</div>
                <div v-if="reel.isNew" class="reel-badge">Nouveau</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
            <p>لا توجد Reels بعد</p>
            <button v-if="isCurrentUser" class="btn-create-instagram" @click="openCreateReelModal">أنشئ أول Reel</button>
          </div>
        </div>
      </div>

      <!-- Post Modal -->
      <transition name="modal-fade">
        <div v-if="selectedPost" class="post-modal-overlay" @click.self="closePostModal">
          <div class="post-modal-container">
            <div class="post-modal-content">
              <div class="post-modal-image">
                <img :src="getPostImage(selectedPost, currentImageIndex)" :alt="selectedPost.productName" />
                <div v-if="selectedPost.images && selectedPost.images.length > 1" class="image-navigation">
                  <button class="nav-btn prev" @click="prevPostImage">‹</button>
                  <button class="nav-btn next" @click="nextPostImage">›</button>
                </div>
              </div>
              <div class="post-modal-info">
                <div class="modal-post-header">
                  <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="modal-avatar-link">
                    <img :src="getAvatarImage()" alt="" class="modal-avatar" />
                  </router-link>
                  <div class="modal-author">
                    <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="author-link">
                      <span class="author-name">{{ vendor.shopName }}</span>
                      <span class="author-handle">@{{ vendor.shopName?.toLowerCase().replace(/\s/g, '') }}</span>
                    </router-link>
                  </div>
                  <button v-if="isCurrentUser" class="modal-menu-btn" @click="togglePostMenu(selectedPost.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      <circle cx="12" cy="5" r="2" fill="currentColor"/>
                      <circle cx="12" cy="19" r="2" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div class="modal-post-caption">
                  <div class="caption-author">{{ vendor.shopName }}</div>
                  <div class="caption-text">
                    <h3>{{ selectedPost.productName }}</h3>
                    <p>{{ selectedPost.description }}</p>
                  </div>
                </div>
                <div class="modal-post-price">
                  <span class="current-price">{{ formatPrice(selectedPost.price) }} د.ت</span>
                  <span v-if="selectedPost.oldPrice" class="old-price">{{ formatPrice(selectedPost.oldPrice) }} د.ت</span>
                </div>
                <div class="modal-post-actions">
                  <button class="action-btn" @click="togglePostLike(selectedPost)">
                    <svg class="like-icon" :class="{ liked: isPostLikedByStore(selectedPost.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>{{ selectedPost.likes || 0 }}</span>
                  </button>
                  <button class="action-btn" @click="togglePostWishlist(selectedPost)">
                    <svg class="wishlist-icon" :class="{ liked: isPostInWishlist(selectedPost.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{{ isPostInWishlist(selectedPost.id) ? 'محفوظ' : 'حفظ' }}</span>
                  </button>
                  <button class="action-btn" @click="focusComment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{{ selectedPost.commentsCount || 0 }}</span>
                  </button>
                  <button class="action-btn" @click="sharePost(selectedPost)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </button>
                  <button class="action-btn buy-btn-modal" @click="buyProduct(selectedPost)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span>شراء</span>
                  </button>
                </div>
                <div class="modal-post-comments">
                  <div class="comments-list" ref="commentsList">
                    <div v-for="comment in postComments" :key="comment.id" class="comment-item">
                      <span class="comment-author">{{ comment.userName }}</span>
                      <span class="comment-text">{{ comment.text }}</span>
                    </div>
                  </div>
                  <div class="comment-input-wrapper">
                    <input v-model="newComment" type="text" placeholder="أضف تعليقاً..." class="comment-input" @keyup.enter="addComment" />
                    <button class="post-comment-btn" @click="addComment" :disabled="!newComment.trim()">نشر</button>
                  </div>
                </div>
                <div class="modal-post-date">{{ formatDate(selectedPost.createdAt) }}</div>
              </div>
            </div>
            <button class="close-modal-btn" @click="closePostModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>

      <!-- Reel Modal -->
      <transition name="modal-fade">
        <div v-if="selectedReel" class="reel-modal-overlay" @click.self="closeReelModal">
          <div class="reel-modal-container">
            <video :src="getReelVideo(selectedReel)" class="reel-modal-video" controls autoplay playsinline loop></video>
            <div class="reel-side-info">
              <div class="reel-side-action" @click="toggleReelLike(selectedReel)">
                <svg :class="{ liked: false }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ selectedReel.likes || 0 }}</span>
              </div>
              <div class="reel-side-action" @click="toggleReelWishlist(selectedReel)">
                <svg :class="{ liked: isReelInWishlist(selectedReel.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ isReelInWishlist(selectedReel.id) ? 'محفوظ' : 'حفظ' }}</span>
              </div>
              <div class="reel-side-action" @click="focusReelComment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ selectedReel.commentsCount || 0 }}</span>
              </div>
              <div class="reel-side-action" @click="shareReel(selectedReel)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="reel-side-action">
                <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="avatar-link">
                  <div class="avatar-circle"><img :src="getAvatarImage()" /></div>
                </router-link>
              </div>
            </div>
            <div class="reel-bottom-info">
              <div class="reel-author-info">
                <img :src="getAvatarImage()" class="reel-author-avatar" />
                <div>
                  <router-link :to="`/vendor/${vendor.slug || vendor.id}`" class="reel-author-link">
                    <div class="reel-author-name">{{ vendor.shopName }}</div>
                    <div class="reel-author-handle">@{{ vendor.shopName?.toLowerCase().replace(/\s/g, '') }}</div>
                  </router-link>
                </div>
              </div>
              <div class="reel-caption">{{ selectedReel.description || selectedReel.title }}</div>
              <div class="reel-music">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <span>Musique originale</span>
              </div>
            </div>
            <div class="reel-comment-input-container">
              <input v-model="newReelComment" type="text" placeholder="Ajouter un commentaire..." @keyup.enter="addReelComment" />
              <button @click="addReelComment" :disabled="!newReelComment.trim()">Publier</button>
            </div>
            <button class="close-reel-btn" @click="closeReelModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>

      <!-- Edit Menu Dropdown -->
      <transition name="fade">
        <div v-if="activePostMenu" class="post-menu-dropdown" @click.stop>
          <button class="menu-item" @click="togglePinPost(selectedPost)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2z"/>
            </svg>
            <span>{{ selectedPost?.isPinned ? 'إلغاء التثبيت' : 'تثبيت' }}</span>
          </button>
          <button class="menu-item" @click="openEditPostModal(selectedPost)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
            <span>تعديل</span>
          </button>
          <button class="menu-item delete" @click="confirmDeletePost(selectedPost)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>حذف</span>
          </button>
        </div>
      </transition>

      <!-- Create Post Modal -->
      <CreatePostModal :isVisible="showCreatePostModal" @close="showCreatePostModal = false" @post-created="handlePostCreated" />
      <!-- Create Reel Modal -->
      <CreateReelModal :isVisible="showCreateReelModal" @close="showCreateReelModal = false" @reel-created="handleReelCreated" />

      <!-- ✅ Modal Édition Produit (à l'intérieur du root !) -->
     <!-- Remplacer le modal d'édition existant par celui-ci -->
<div v-if="showEditModal" class="edit-modal-overlay" @click.self="closeEditModal">
  <div class="edit-modal">
    <div class="edit-modal-header">
      <h3>تعديل المنتج</h3>
      <button class="edit-modal-close" @click="closeEditModal">✕</button>
    </div>
    <div class="edit-modal-body">
      <div class="edit-form-group">
        <label class="edit-form-label">اسم المنتج</label>
        <input type="text" v-model="editForm.productName" class="edit-form-input" maxlength="100" />
      </div>

      <!-- Sélection de catégorie avec sous-catégories -->
      <div class="edit-form-group">
        <label class="edit-form-label">الفئة</label>

        <!-- Catégories principales -->
        <div class="edit-categories-grid">
          <div
            v-for="cat in editParentCategories"
            :key="'edit-parent-' + cat.id"
            class="edit-category-card"
            :class="{
              selected: editSelectedCategory === cat.id,
              'has-children': cat.children && cat.children.length > 0
            }"
            @click="selectEditParentCategory(cat)"
          >
            <div class="edit-category-image-wrapper">
              <img
                :src="cat.imageUrl || 'https://placehold.co/100x100/08717f/FFFFFF?text=' + encodeURIComponent(cat.nameAr || cat.name)"
                :alt="cat.nameAr || cat.name"
                class="edit-category-image"
              />
              <div class="edit-category-overlay" v-if="editSelectedCategory === cat.id">
                <span>✓</span>
              </div>
            </div>
            <div class="edit-category-info">
              <span class="edit-category-name">{{ cat.nameAr || cat.name }}</span>
            </div>
          </div>
        </div>

        <!-- Sous-catégories -->
        <div v-if="editShowSubCategories" class="edit-subcategories-section">
          <div class="edit-subcategories-header">
            <span>تصنيفات فرعية لـ {{ editSelectedParentCategory?.nameAr }}</span>
            <button class="edit-back-btn" @click="clearEditCategorySelection">← رجوع</button>
          </div>
          <div class="edit-subcategories-grid">
            <div
              v-for="subCat in editCurrentSubCategories"
              :key="'edit-sub-' + subCat.id"
              class="edit-subcategory-card"
              :class="{ selected: editSelectedSubCategory?.id === subCat.id }"
              @click="selectEditSubCategory(subCat)"
            >
              <div class="edit-subcategory-image-wrapper">
                <img
                  :src="subCat.imageUrl || 'https://placehold.co/100x100/08717f/FFFFFF?text=' + encodeURIComponent(subCat.nameAr || subCat.name)"
                  :alt="subCat.nameAr || subCat.name"
                  class="edit-subcategory-image"
                />
              </div>
              <div class="edit-subcategory-info">
                <span class="edit-subcategory-name">{{ subCat.nameAr || subCat.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Catégorie sélectionnée -->
        <div v-if="editSelectedCategory" class="edit-selected-category">
          <span class="edit-selected-label">الفئة المختارة:</span>
          <span class="edit-selected-value">
            {{ editSelectedSubCategory ? editSelectedParentCategory?.nameAr + ' › ' + editSelectedSubCategory.nameAr : editSelectedParentCategory?.nameAr }}
          </span>
          <button class="edit-clear-category" @click="clearEditCategorySelection">✕</button>
        </div>
      </div>

      <div class="edit-form-row">
        <div class="edit-form-group">
          <label class="edit-form-label">السعر (د.ت)</label>
          <input type="number" v-model.number="editForm.price" class="edit-form-input" min="0" step="0.01" />
        </div>
        <div class="edit-form-group">
          <label class="edit-form-label">السعر القديم</label>
          <input type="number" v-model.number="editForm.oldPrice" class="edit-form-input" min="0" step="0.01" />
        </div>
      </div>

      <div class="edit-form-group">
        <label class="edit-form-label">الكمية</label>
        <input type="number" v-model.number="editForm.quantity" class="edit-form-input" min="0" />
      </div>

      <div class="edit-form-group">
        <label class="edit-form-label">الوصف</label>
        <textarea v-model="editForm.description" class="edit-form-textarea" rows="3" maxlength="500"></textarea>
      </div>
    </div>
    <div class="edit-modal-footer">
      <button class="btn-cancel" @click="closeEditModal">إلغاء</button>
      <button class="btn-save" @click="saveEditedPost" :disabled="isSaving || !editForm.productName.trim() || !editForm.price">
        {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
      </button>
    </div>
  </div>
</div>

      <!-- ✅ Modal Confirmation Suppression (à l'intérieur du root !) -->
      <div v-if="showDeleteConfirm" class="confirm-modal-overlay" @click.self="cancelDelete">
        <div class="confirm-modal">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <h3>حذف المنتج</h3>
          <p>هل أنت متأكد من حذف "{{ postToDelete?.productName }}"؟</p>
          <div class="confirm-modal-actions">
            <button class="btn-cancel" @click="cancelDelete">إلغاء</button>
            <button class="btn-delete-confirm" @click="executeDelete" :disabled="isDeleting">
              {{ isDeleting ? 'جاري الحذف...' : 'حذف' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="not-found-instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>الملف الشخصي غير موجود</h2>
      <router-link to="/" class="btn-home-instagram">العودة للرئيسية</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { usePostStore } from '../stores/postStore'
import { useMessageStore } from '../stores/messageStore'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'
import { useThemeStore } from '../stores/theme'
import CreatePostModal from '../components/CreatePostModal.vue'
import CreateReelModal from '../components/CreateReelModal.vue'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const postStore = usePostStore()
const messageStore = useMessageStore()
const likesStore = useLikesStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const loading = ref(true)
const vendor = ref(null)
const vendorPosts = ref([])
const vendorReels = ref([])
const activeTab = ref('posts')
const showCreatePostModal = ref(false)
const showCreateReelModal = ref(false)
const selectedPost = ref(null)
const selectedReel = ref(null)
const activePostMenu = ref(null)
const postComments = ref([])
const reelComments = ref([])
const newComment = ref('')
const newReelComment = ref('')
const currentImageIndex = ref(0)
const coverImageKey = ref(Date.now())
const avatarKey = ref(Date.now())

// ÉTATS ÉDITION/SUPPRESSION/ÉPINGLE
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const postToDelete = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)
const pinnedCount = ref(0)

// Catégories pour l'édition
const categoriesList = ref([])
const editSelectedCategory = ref(null)
const editSelectedSubCategory = ref(null)
const editSelectedParentCategory = ref(null)

const editForm = reactive({
  postId: null,
  productName: '',
  price: 0,
  oldPrice: null,
  quantity: 0,
  category: '',
  description: ''
})

// ===== CONSTANTS =====
const DEFAULT_AVATAR = 'https://i.pravatar.cc/300'
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'
const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x400/e2e8f0/475569?text=لا+توجد+صورة'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ===== COMPUTED =====
const isCurrentUser = computed(() => {
  const vendorUserId = vendor.value?.userId || vendor.value?.user_id
  return authStore.isAuthenticated && authStore.user?.id === vendorUserId
})

// Computed pour les catégories d'édition
const editParentCategories = computed(() => categoriesList.value.filter(cat => !cat.parentId))

const editShowSubCategories = computed(() => {
  return editSelectedParentCategory.value &&
         editSelectedParentCategory.value.children &&
         editSelectedParentCategory.value.children.length > 0 &&
         !editSelectedSubCategory.value
})

const editCurrentSubCategories = computed(() => {
  if (!editSelectedParentCategory.value?.children) return []
  return editSelectedParentCategory.value.children
})

// ===== IMAGES =====
const formatImageUrl = (path) => {
  if (!path || path === 'null' || path === 'undefined' || path === '') return DEFAULT_PRODUCT_IMAGE
  if (path.startsWith('http') || path.startsWith('data:image')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
}

const getPostImage = (post, index = 0) => {
  if (!post) return DEFAULT_PRODUCT_IMAGE
  if (Array.isArray(post.images) && post.images.length > 0) return formatImageUrl(post.images[index] || post.images[0])
  if (post.image) return formatImageUrl(post.image)
  return DEFAULT_PRODUCT_IMAGE
}

const getReelVideo = (reel) => reel?.videoUrl || reel?.video || ''

const getAvatarImage = () => {
  if (!vendor.value) return DEFAULT_AVATAR
  const sources = [vendor.value.userAvatar, vendor.value.avatar, authStore.user?.avatar]
  for (const src of sources) {
    if (src && typeof src === 'string' && src !== 'null' && src !== '') {
      if (src.startsWith('http') || src.startsWith('data:image')) return src
      return `${API_BASE_URL}${src.startsWith('/') ? src : '/' + src}`
    }
  }
  return DEFAULT_AVATAR
}

const getCoverImage = () => {
  if (!vendor.value) return DEFAULT_COVER
  const cached = localStorage.getItem(`vendor_cover_${vendor.value.id}`)
  if (cached && cached !== 'null') return cached
  if (vendor.value.coverImage && vendor.value.coverImage !== 'null' && vendor.value.coverImage !== '')
    return formatImageUrl(vendor.value.coverImage)
  return DEFAULT_COVER
}

const handleCoverImageError = (e) => { e.target.src = DEFAULT_COVER }
const handleAvatarImageError = (e) => { e.target.src = DEFAULT_AVATAR }
const handlePostImageError = (e) => { e.target.src = DEFAULT_PRODUCT_IMAGE }

// ===== UTILITIES =====
const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const diff = Math.floor((new Date() - date) / 60000)
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`
  return date.toLocaleDateString('ar-SA')
}

const formatPrice = (p) => p !== undefined && p !== null ? new Intl.NumberFormat('ar-TN').format(p) : '0'

const showToast = (msg, type = 'success') => {
  const div = document.createElement('div')
  div.className = `custom-toast ${type}`
  div.innerHTML = `<div class="toast-content">${msg}</div>`
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

// ===== WISHLIST =====
const isPostInWishlist = (id) => likesStore?.isLiked ? likesStore.isLiked(id) : false
const isReelInWishlist = (id) => likesStore?.isLiked ? likesStore.isLiked(id) : false
const isPostLikedByStore = (id) => postStore.likedPosts?.includes(id) || false

const togglePostWishlist = (post) => {
  if (!post?.id) return
  if (isPostInWishlist(post.id)) {
    likesStore?.removeLike?.(post.id)
    showToast('تمت الإزالة من المفضلة')
  } else {
    likesStore?.addLike?.({
      id: post.id,
      name: post.productName || 'منتج',
      price: post.price || 0,
      image: getPostImage(post),
      vendorName: vendor.value?.shopName || 'حرفي'
    })
    showToast('تمت الإضافة إلى المفضلة')
  }
}

const togglePostLike = async (post) => {
  if (!post) return
  try {
    const result = await postStore.toggleLike(post.id)
    if (result) {
      post.likes = result.likes
      const index = vendorPosts.value.findIndex(p => p.id === post.id)
      if (index !== -1) vendorPosts.value[index].likes = result.likes
    }
  } catch (error) {
    console.error('Erreur togglePostLike:', error)
  }
}

// ===== FONCTIONS REELS =====
const openReelModal = (reel) => {
  selectedReel.value = reel
  document.body.style.overflow = 'hidden'
}

const closeReelModal = () => {
  selectedReel.value = null
  document.body.style.overflow = ''
}

const toggleReelWishlist = (reel) => {
  if (!reel?.id) return
  if (isReelInWishlist(reel.id)) {
    likesStore?.removeLike?.(reel.id)
    showToast('Reel retiré des favoris')
  } else {
    likesStore?.addLike?.({
      id: reel.id,
      name: reel.title || reel.productName || 'Reel',
      image: getAvatarImage(),
      vendorName: vendor.value?.shopName || 'Vendeur'
    })
    showToast('Reel ajouté aux favoris')
  }
}

const toggleReelLike = async (reel) => {
  if (!reel) return
  reel.likes = (reel.likes || 0) + 1
  showToast('Like ajouté')
}

const shareReel = (reel) => {
  if (!reel) return
  navigator.clipboard.writeText(`${window.location.origin}/reel/${reel.id}`).catch(() => {})
  showToast('Lien du reel copié')
}

const addComment = async () => {
  if (!newComment.value.trim() || !selectedPost.value) return
  postComments.value.push({
    id: Date.now(),
    userName: authStore.user?.name || 'Utilisateur',
    text: newComment.value.trim()
  })
  selectedPost.value.commentsCount = (selectedPost.value.commentsCount || 0) + 1
  newComment.value = ''
}

const addReelComment = async () => {
  if (!newReelComment.value.trim() || !selectedReel.value) return
  reelComments.value.push({
    id: Date.now(),
    userName: authStore.user?.name || 'Utilisateur',
    text: newReelComment.value.trim()
  })
  selectedReel.value.commentsCount = (selectedReel.value.commentsCount || 0) + 1
  newReelComment.value = ''
}

const focusComment = () => {
  const input = document.querySelector('.comment-input')
  input?.focus()
}

const focusReelComment = () => {
  const input = document.querySelector('.reel-comment-input-container input')
  input?.focus()
}

// ===== POST ACTIONS =====
const normalizePost = (post) => ({
  ...post,
  isPinned: Boolean(
    post.isPinned === true ||
    post.isPinned === 1 ||
    post.isPinned === '1' ||
    post.is_pinned === true ||
    post.is_pinned === 1 ||
    post.is_pinned === '1'
  )
})

const sortPosts = (posts) => {
  if (!Array.isArray(posts)) return []
  return [...posts].sort((a, b) => {
    const aPinned = Boolean(a.isPinned)
    const bPinned = Boolean(b.isPinned)
    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

const countPinnedPosts = () => {
  pinnedCount.value = vendorPosts.value.filter(p => Boolean(p.isPinned)).length
}

const openPostModal = (post) => {
  selectedPost.value = post
  currentImageIndex.value = 0
  document.body.style.overflow = 'hidden'
}

const closePostModal = () => {
  selectedPost.value = null
  activePostMenu.value = null
  document.body.style.overflow = ''
}

const prevPostImage = () => {
  if (selectedPost.value?.images && currentImageIndex.value > 0) currentImageIndex.value--
}

const nextPostImage = () => {
  if (selectedPost.value?.images && currentImageIndex.value < selectedPost.value.images.length - 1)
    currentImageIndex.value++
}

const togglePostMenu = (id) => {
  activePostMenu.value = activePostMenu.value === id ? null : id
}

const sharePost = (post) => {
  if (!post) return
  navigator.clipboard.writeText(`${window.location.origin}/product/${post.id}`).catch(() => {})
  showToast('تم نسخ الرابط')
}

const buyProduct = (post) => {
  if (!post) return
  cartStore?.addItem?.({
    id: post.id,
    name: post.productName,
    price: post.price,
    image: getPostImage(post),
    quantity: 1,
    vendorName: vendor.value?.shopName
  })
  showToast('تمت الإضافة إلى السلة')
}

const openCreatePostModal = () => { showCreatePostModal.value = true }
const openCreateReelModal = () => { showCreateReelModal.value = true }

// ===== ÉPINGLER =====
const togglePinPost = async (post) => {
  if (!post?.id) return
  const currentPinned = Boolean(post.isPinned)
  if (!currentPinned && pinnedCount.value >= 3) {
    showToast('الحد الأقصى 3 منتجات', 'warning')
    activePostMenu.value = null
    return
  }
  try {
    const response = await api.put(`/posts/${post.id}/pin`)
    const newPinnedState =
      response?.data?.isPinned ??
      response?.data?.data?.isPinned ??
      response?.data?.post?.isPinned ??
      !currentPinned
    const normalizedPinned = Boolean(
      newPinnedState === true || newPinnedState === 1 || newPinnedState === '1'
    )
    vendorPosts.value = vendorPosts.value.map((p) =>
      p.id === post.id ? { ...p, isPinned: normalizedPinned } : p
    )
    if (selectedPost.value?.id === post.id) {
      selectedPost.value = { ...selectedPost.value, isPinned: normalizedPinned }
    }
    vendorPosts.value = sortPosts(vendorPosts.value)
    countPinnedPosts()
    showToast(normalizedPinned ? 'تم تثبيت المنتج' : 'تم إلغاء التثبيت')
  } catch (error) {
    console.error('Erreur toggle pin:', error)
    showToast('فشل تحديث التثبيت', 'error')
  } finally {
    activePostMenu.value = null
  }
}

// ===== CHARGEMENT DES CATÉGORIES POUR L'ÉDITION =====
const loadCategoriesForEdit = async () => {
  try {
    const response = await api.get('/categories?include=children')
    if (response.data.success) {
      const data = response.data.data?.categories || response.data.categories || []
      categoriesList.value = data.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        nameAr: cat.nameAr || cat.name,
        icon: cat.icon || '📁',
        imageUrl: cat.imageUrl || `https://placehold.co/100x100/08717f/FFFFFF?text=${encodeURIComponent(cat.nameAr || cat.name)}`,
        parentId: cat.parentId || null,
        children: (cat.children || []).map(child => ({
          ...child,
          nameAr: child.nameAr || child.name,
          icon: child.icon || '📁',
          imageUrl: child.imageUrl || `https://placehold.co/100x100/08717f/FFFFFF?text=${encodeURIComponent(child.nameAr || child.name)}`
        }))
      }))
    }
  } catch (error) {
    console.error('Erreur chargement catégories pour édition:', error)
  }
}

// ===== SÉLECTION DE CATÉGORIES POUR L'ÉDITION =====
const selectEditParentCategory = (cat) => {
  editSelectedParentCategory.value = cat
  editSelectedSubCategory.value = null

  if (cat.children && cat.children.length > 0) {
    editSelectedCategory.value = null
  } else {
    editSelectedCategory.value = cat.id
  }
}

const selectEditSubCategory = (subCat) => {
  editSelectedSubCategory.value = subCat
  editSelectedCategory.value = subCat.id
}

const clearEditCategorySelection = () => {
  editSelectedCategory.value = null
  editSelectedSubCategory.value = null
  editSelectedParentCategory.value = null
}

// ===== OUVERTURE DU MODAL D'ÉDITION =====
const openEditPostModal = async (post) => {
  if (!post) return
  activePostMenu.value = null

  // Charger les catégories si pas déjà fait
  if (categoriesList.value.length === 0) {
    await loadCategoriesForEdit()
  }

  // Réinitialiser la sélection
  clearEditCategorySelection()

  // Préselectionner la catégorie du post
  const postCategoryId = post.categoryId || post.category_id
  if (postCategoryId) {
    // Chercher dans les catégories principales
    const parentCat = categoriesList.value.find(c => c.id === postCategoryId)
    if (parentCat) {
      editSelectedParentCategory.value = parentCat
      editSelectedCategory.value = parentCat.id
      editSelectedSubCategory.value = null
    } else {
      // Chercher dans les sous-catégories
      for (const cat of categoriesList.value) {
        if (cat.children && cat.children.length > 0) {
          const subCat = cat.children.find(c => c.id === postCategoryId)
          if (subCat) {
            editSelectedParentCategory.value = cat
            editSelectedSubCategory.value = subCat
            editSelectedCategory.value = subCat.id
            break
          }
        }
      }
    }
  }

  editForm.postId = post.id
  editForm.productName = post.productName || ''
  editForm.price = post.price || 0
  editForm.oldPrice = post.oldPrice || null
  editForm.quantity = post.quantity || 0
  editForm.category = post.category || ''
  editForm.description = post.description || ''
  showEditModal.value = true
}

// ===== FERMETURE DU MODAL D'ÉDITION =====
const closeEditModal = () => {
  showEditModal.value = false
  clearEditCategorySelection()
  Object.assign(editForm, {
    postId: null, productName: '', price: 0, oldPrice: null,
    quantity: 0, category: '', description: ''
  })
}

// ===== SAUVEGARDE DE L'ÉDITION =====
const saveEditedPost = async () => {
  if (!editForm.postId || !editForm.productName.trim() || !editForm.price) return
  isSaving.value = true
  try {
    const payload = {
      productName: editForm.productName.trim(),
      price: parseFloat(editForm.price),
      oldPrice: editForm.oldPrice ? parseFloat(editForm.oldPrice) : null,
      quantity: parseInt(editForm.quantity) || 0,
      category: editForm.category,
      description: editForm.description.trim()
    }

    // Ajouter le categoryId sélectionné
    if (editSelectedCategory.value) {
      payload.categoryId = editSelectedCategory.value
      // Mettre à jour le slug de catégorie si disponible
      const selectedCat = editSelectedSubCategory.value || editSelectedParentCategory.value
      if (selectedCat) {
        payload.category = selectedCat.slug
      }
    }

    const r = await api.put(`/posts/${editForm.postId}`, payload)
    if (r.data?.success) {
      const idx = vendorPosts.value.findIndex(p => p.id === editForm.postId)
      if (idx !== -1) {
        Object.assign(vendorPosts.value[idx], {
          productName: editForm.productName.trim(),
          price: parseFloat(editForm.price),
          oldPrice: editForm.oldPrice ? parseFloat(editForm.oldPrice) : null,
          quantity: parseInt(editForm.quantity) || 0,
          category: payload.category,
          categoryId: payload.categoryId,
          description: editForm.description.trim()
        })
      }
      closeEditModal()
      showToast('تم تعديل المنتج بنجاح')
    }
  } catch (e) {
    closeEditModal()
    showToast('تم تعديل المنتج (محلياً)')
  } finally {
    isSaving.value = false
  }
}

// ===== SUPPRESSION =====
const confirmDeletePost = (post) => {
  if (!post) return
  activePostMenu.value = null
  postToDelete.value = post
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  postToDelete.value = null
}

const executeDelete = async () => {
  if (!postToDelete.value) return
  isDeleting.value = true
  try {
    await api.delete(`/posts/${postToDelete.value.id}`)
    vendorPosts.value = vendorPosts.value.filter(p => p.id !== postToDelete.value.id)
    showToast('تم حذف المنتج بنجاح')
  } catch (e) {
    vendorPosts.value = vendorPosts.value.filter(p => p.id !== postToDelete.value.id)
    showToast('تم حذف المنتج')
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
    postToDelete.value = null
  }
}

// ===== DATA LOADING =====
const loadVendorPosts = async (vendorId) => {
  if (!vendorId) {
    vendorPosts.value = []
    return
  }
  try {
    const posts = await postStore.fetchVendorPosts(vendorId)
    const normalizedPosts = Array.isArray(posts) ? posts.map(normalizePost) : []
    vendorPosts.value = sortPosts(normalizedPosts)
    countPinnedPosts()
  } catch (e) {
    console.error('Erreur chargement posts:', e)
    vendorPosts.value = []
  }
}

const loadVendorReels = async (vendorId) => {
  if (!vendorId) { vendorReels.value = []; return }
  try {
    const r = await api.get(`/reels/vendor/${vendorId}`)
    vendorReels.value = r.data?.data?.reels || []
  } catch (e) { vendorReels.value = [] }
}

const loadVendor = async () => {
  let id = route.params.name || route.params.id || route.query.id || route.query.slug

  if (id === 'dashboard') {
    loading.value = false
    const realVendorId = authStore.vendorId || localStorage.getItem('vendorId')
    if (realVendorId) {
      router.replace(`/vendor/${realVendorId}`)
    } else {
      try {
        const fetchedId = await authStore.fetchVendorId()
        if (fetchedId) {
          router.replace(`/vendor/${fetchedId}`)
        } else {
          router.replace('/')
        }
      } catch (e) {
        router.replace('/')
      }
    }
    return
  }

  if (!id || id === 'undefined' || id === 'null') {
    loading.value = false
    return
  }

  loading.value = true
  try {
    let data = null
    if (!isNaN(id)) {
      data = await vendorStore.fetchVendorById(parseInt(id))
    } else {
      data = await vendorStore.fetchVendorBySlug(id)
    }

    if (data) {
      vendor.value = data
      await Promise.all([loadVendorPosts(data.id), loadVendorReels(data.id)])
      avatarKey.value = Date.now()
      coverImageKey.value = Date.now()
    } else {
      vendor.value = null
    }
  } catch (e) {
    console.error('Erreur loadVendor:', e)
    vendor.value = null
  } finally {
    loading.value = false
  }
}

// ===== CONTACT VENDOR =====
const contactVendor = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!vendor.value) {
    showToast('معلومات البائع غير متوفرة', 'error')
    return
  }
  const vendorUserId = vendor.value.userId || vendor.value.user_id
  if (!vendorUserId) {
    showToast('لا يمكن بدء المحادثة', 'error')
    return
  }

  localStorage.setItem('pendingChat', JSON.stringify({
    receiverId: vendorUserId,
    receiverName: vendor.value.shopName || vendor.value.name || 'حرفي',
    receiverAvatar: getAvatarImage()
  }))

  const existingConv = messageStore.conversations.find(
    c => c.other_user_id === vendorUserId
  )

  messageStore.isOpen = true

  if (existingConv) {
    messageStore.openChat(existingConv)
    showToast('جاري فتح المحادثة...')
  } else {
    const tempConv = {
      id: null,
      other_user_id: vendorUserId,
      other_user_name: vendor.value.shopName || 'حرفي',
      other_user_avatar: getAvatarImage(),
      other_user_type: 'vendor',
      last_message: '',
      last_message_at: null,
      unread_count: 0
    }
    messageStore.openChat(tempConv)
    messageStore.startConversation(vendorUserId, 'vendor').then(conv => {
      if (conv && conv.id) {
        messageStore.activeChat = conv
        messageStore.loadMessages(conv.id)
      }
    })
    showToast('جاري بدء المحادثة...')
  }

  setTimeout(() => {
    localStorage.removeItem('pendingChat')
  }, 3000)
}

// ===== OTHER =====
const goToEditProfile = () => router.push(`/vendor/edit/${vendor.value?.id}`)
const openSettings = () => showToast('الإعدادات قريباً')

const handlePostCreated = async () => {
  showCreatePostModal.value = false
  await loadVendorPosts(vendor.value.id)
  showToast('تم إنشاء المنشور')
}

const handleReelCreated = async () => {
  showCreateReelModal.value = false
  await loadVendorReels(vendor.value.id)
  showToast('تم إنشاء Reel')
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.post-menu-dropdown') && !e.target.closest('.modal-menu-btn'))
    activePostMenu.value = null
}

const openAvatarUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (vendor.value) vendor.value.userAvatar = ev.target.result
      avatarKey.value = Date.now()
      showToast('تم تحديث الصورة')
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

const openCoverUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      localStorage.setItem(`vendor_cover_${vendor.value?.id}`, ev.target.result)
      coverImageKey.value = Date.now()
      showToast('تم تحديث الغلاف')
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// ===== WATCHER =====
watch(
  () => [route.params.name, route.params.id, route.query.id, route.query.slug],
  ([newName, newId, newQueryId, newQuerySlug], [oldName, oldId, oldQueryId, oldQuerySlug]) => {
    if (newName !== oldName || newId !== oldId || newQueryId !== oldQueryId || newQuerySlug !== oldQuerySlug) {
      loadVendor()
    }
  }
)

// ===== LIFECYCLE =====
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  if (authStore.user?.role === 'pending') {
    router.push('/pending-vendor')
    return
  }
  loadVendor()
  loadCategoriesForEdit() // Charger les catégories pour l'édition
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== BASE & FONTS ===== */
.vendor-profile-page {
  font-family: 'Amiri', 'Cairo', serif;
  background: #fafafa;
  min-height: 100vh;
}
.vendor-profile-page * {
  font-family: 'Amiri', 'Cairo', serif;
}
.vendor-profile-page.dark-mode {
  background: #000000;
  color: #ffffff;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #fafafa;
}
.dark-mode .loading-state {
  background: #000000;
}
.loading-spinner {
  text-align: center;
}
.loading-spinner p {
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 16px;
}
.spinner-ring {
  width: 44px;
  height: 44px;
  border: 3px solid #dbdbdb;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Cover */
.cover-photo-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #efefef;
}
.dark-mode .cover-photo-container { background: #1a1a1a; }
.cover-photo-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.cover-overlay-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
}
.change-cover-btn {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}
.change-cover-btn svg { width: 16px; height: 16px; stroke: white; }
.change-cover-btn:hover { background: rgba(0, 0, 0, 0.8); transform: translateY(-1px); }

/* Profile Container */
.profile-container {
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px;
}
.profile-header {
  display: flex;
  gap: 30px;
  margin-top: -40px;
  margin-bottom: 20px;
  position: relative;
  z-index: 5;
}
.profile-avatar-section {
  flex-shrink: 0;
}
.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
}
.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.dark-mode .profile-avatar { border-color: #000000; }
.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 32px;
  height: 32px;
  background: #0095f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}
.avatar-container:hover .avatar-edit-btn { opacity: 1; }
.avatar-edit-btn svg { width: 16px; height: 16px; stroke: white; }
.verified-badge-instagram {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: #0095f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
.verified-badge-instagram svg { width: 14px; height: 14px; fill: white; }

/* Profile Info */
.profile-info-section { flex: 1; }
.profile-actions-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.profile-username-link { text-decoration: none; color: inherit; }
.profile-username-link:hover .profile-username { text-decoration: underline; opacity: 0.8; }
.profile-username { font-size: 2rem; font-weight: 700; color: #262626; }
.dark-mode .profile-username { color: #ffffff; }
.action-buttons { display: flex; gap: 8px; }
.btn-edit-profile {
  padding: 7px 16px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #262626;
}
.dark-mode .btn-edit-profile { background: #363636; color: #ffffff; }
.btn-edit-profile:hover { background: #dbdbdb; }
.btn-settings {
  width: 32px;
  height: 32px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.btn-settings svg { width: 18px; height: 18px; stroke: #262626; }
.dark-mode .btn-settings svg { stroke: #ffffff; }
.btn-message-instagram {
  width: 32px;
  height: 32px;
  background: #efefef;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.btn-message-instagram svg { width: 18px; height: 18px; stroke: #262626; }
.dark-mode .btn-message-instagram svg { stroke: #ffffff; }

/* Stats */
.profile-stats-instagram { display: flex; gap: 40px; margin-bottom: 20px; }
.stat-item { text-align: right; cursor: pointer; }
.stat-number { font-size: 1.2rem; font-weight: 700; color: #262626; }
.dark-mode .stat-number { color: #ffffff; }
.stat-label { font-size: 1rem; color: #8e8e8e; margin-right: 5px; }

/* Bio */
.profile-bio-instagram { margin-bottom: 10px; }
.bio-name-link { text-decoration: none; color: inherit; }
.bio-name-link:hover .bio-name { text-decoration: underline; opacity: 0.8; }
.bio-name { font-weight: 700; font-size: 1rem; color: #262626; margin-bottom: 4px; }
.dark-mode .bio-name { color: #ffffff; }
.bio-text { font-size: 1rem; color: #262626; margin-bottom: 4px; line-height: 1.6; }
.dark-mode .bio-text { color: #ffffff; }
.bio-link a { font-size: 0.95rem; color: #00376b; text-decoration: none; }
.dark-mode .bio-link a { color: #0095f6; }

/* Facebook Create Post */
.facebook-create-post-section {
  margin: 16px 0 20px 0;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #dbdbdb;
}
.dark-mode .facebook-create-post-section { background: #1a1a1a; border-color: #262626; }
.facebook-post-card { display: flex; flex-direction: column; gap: 12px; }
.facebook-post-header { display: flex; align-items: center; gap: 12px; }
.facebook-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid #dbdbdb; }
.dark-mode .facebook-avatar { border-color: #262626; }
.facebook-post-button {
  flex: 1;
  background: #f0f2f5;
  border: none;
  border-radius: 30px;
  padding: 12px 16px;
  text-align: right;
  font-size: 0.95rem;
  color: #65676b;
  cursor: pointer;
  transition: background 0.2s ease;
}
.dark-mode .facebook-post-button { background: #3a3b3c; color: #b0b3b8; }
.facebook-post-button:hover { background: #e4e6eb; }
.dark-mode .facebook-post-button:hover { background: #4e4f50; }
.facebook-post-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid #dbdbdb;
}
.dark-mode .facebook-post-actions { border-top-color: #262626; }
.facebook-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  color: #65676b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}
.dark-mode .facebook-action-btn { color: #b0b3b8; }
.facebook-action-btn:hover { background: #f0f2f5; }
.dark-mode .facebook-action-btn:hover { background: #3a3b3c; }
.facebook-action-btn svg { width: 22px; height: 22px; stroke: currentColor; }

/* Tab Navigation */
.tab-navigation { display: flex; justify-content: center; gap: 60px; border-top: 1px solid #dbdbdb; margin-top: 20px; }
.dark-mode .tab-navigation { border-top-color: #262626; }
.tab-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #8e8e8e;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.tab-link svg { width: 12px; height: 12px; stroke: #8e8e8e; }
.tab-link.active { color: #262626; }
.tab-link.active svg { stroke: #262626; }
.tab-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: #262626;
}
.dark-mode .tab-link.active { color: #ffffff; }
.dark-mode .tab-link.active svg { stroke: #ffffff; }
.dark-mode .tab-link.active::after { background: #ffffff; }

/* Posts Grid */
.posts-grid-instagram { margin-top: 20px; }
.instagram-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.grid-post { position: relative; aspect-ratio: 1 / 1; cursor: pointer; overflow: hidden; }
.post-image-container { position: relative; width: 100%; height: 100%; }
.grid-post-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.grid-post:hover .grid-post-image { transform: scale(1.02); }
.grid-wishlist-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  color: white;
}
.grid-wishlist-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.6); }
.grid-wishlist-btn.active { background: rgba(239, 68, 68, 0.8); }
.grid-wishlist-btn svg { width: 18px; height: 18px; }
.post-overlay-instagram {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.grid-post:hover .post-overlay-instagram { opacity: 1; }
.post-stats { display: flex; gap: 30px; }
.stat { display: flex; align-items: center; gap: 6px; color: white; font-size: 1rem; font-weight: 600; }
.stat svg { width: 20px; height: 20px; }
.pinned-badge-instagram {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  padding: 4px 8px;
}
.pinned-badge-instagram svg { width: 14px; height: 14px; fill: white; }

/* Empty State */
.empty-state-instagram { text-align: center; padding: 80px 20px; }
.empty-state-instagram svg { width: 64px; height: 64px; stroke: #8e8e8e; margin-bottom: 20px; }
.empty-state-instagram p { color: #8e8e8e; font-size: 1.1rem; margin-bottom: 20px; }
.btn-create-instagram {
  padding: 8px 24px;
  background: #0095f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-create-instagram:hover { background: #0081d6; }

/* Not Found */
.not-found-instagram {
  text-align: center;
  padding: 100px 20px;
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dark-mode .not-found-instagram { background: #000000; }
.not-found-instagram svg { width: 80px; height: 80px; stroke: #8e8e8e; margin-bottom: 20px; }
.not-found-instagram h2 { font-size: 1.5rem; font-weight: 700; color: #262626; margin-bottom: 20px; }
.dark-mode .not-found-instagram h2 { color: #ffffff; }
.btn-home-instagram {
  padding: 8px 24px;
  background: #0095f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-home-instagram:hover { background: #0081d6; }

/* Toast */
.custom-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10000; animation: slideUp 0.3s ease; }
.toast-content { background: #262626; color: white; padding: 10px 20px; border-radius: 24px; font-size: 0.95rem; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15); }
.custom-toast.success .toast-content { background: #262626; }
.custom-toast.error .toast-content { background: #ed4956; }
@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

/* ===== REELS SECTIONS ===== */
.reels-section { margin-top: 20px; }
.reels-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 0 8px; }
.reels-header h2 { font-size: 1.1rem; font-weight: 600; color: #262626; display: flex; align-items: center; gap: 8px; }
.dark-mode .reels-header h2 { color: #ffffff; }
.reels-header h2 svg { width: 22px; height: 22px; stroke: #262626; }
.dark-mode .reels-header h2 svg { stroke: #ffffff; }
.reels-more-btn { background: none; border: none; color: #0095f6; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.reels-more-btn svg { stroke: #0095f6; }
.instagram-reels-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #000; border-radius: 8px; overflow: hidden; }
.reel-card-instagram { position: relative; aspect-ratio: 9 / 16; cursor: pointer; overflow: hidden; background: #000; }
.reel-video-container { position: relative; width: 100%; height: 100%; }
.reel-video-instagram { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.reel-card-instagram:hover .reel-video-instagram { transform: scale(1.02); }
.reel-wishlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  color: white;
}
.reel-wishlist-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.6); }
.reel-wishlist-btn.active { background: rgba(239, 68, 68, 0.8); }
.reel-wishlist-btn svg { width: 18px; height: 18px; }
.reel-overlay-instagram {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}
.reel-card-instagram:hover .reel-overlay-instagram { opacity: 1; }
.reel-top-info { display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease; }
.reel-card-instagram:hover .reel-top-info { opacity: 1; transform: translateY(0); }
.reel-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid white; }
.reel-username { color: white; font-size: 0.7rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.reel-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.reel-card-instagram:hover .reel-play-icon { opacity: 1; }
.reel-play-icon svg { width: 24px; height: 24px; fill: white; margin-left: 3px; }
.reel-stats-instagram { display: flex; gap: 16px; justify-content: flex-end; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
.reel-card-instagram:hover .reel-stats-instagram { opacity: 1; transform: translateY(0); }
.reel-stat-instagram { display: flex; align-items: center; gap: 4px; color: white; font-size: 0.7rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.reel-stat-instagram svg { width: 14px; height: 14px; stroke: white; }
.reel-title-instagram {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}
.reel-card-instagram:hover .reel-title-instagram { opacity: 1; transform: translateY(0); }
.reel-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #0095f6;
  color: white;
  font-size: 0.55rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  z-index: 5;
}

/* ===== REEL MODAL ===== */
.reel-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000000; display: flex; align-items: center; justify-content: center; z-index: 2000; }
.reel-modal-container { width: 100%; height: 100%; max-width: 400px; background: #000; position: relative; display: flex; flex-direction: column; }
.reel-modal-video { flex: 1; width: 100%; height: 100%; object-fit: contain; background: #000; }
.reel-side-info { position: absolute; bottom: 80px; right: 12px; display: flex; flex-direction: column; gap: 20px; z-index: 10; }
.reel-side-action { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; transition: transform 0.2s ease; }
.reel-side-action:hover { transform: scale(1.05); }
.reel-side-action svg { width: 28px; height: 28px; stroke: white; fill: none; }
.reel-side-action .liked svg { fill: #ed4956; stroke: #ed4956; }
.reel-side-action span { color: white; font-size: 0.7rem; font-weight: 600; }
.reel-side-action .avatar-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; overflow: hidden; }
.reel-side-action .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.reel-bottom-info { position: absolute; bottom: 20px; left: 16px; right: 80px; z-index: 10; }
.reel-author-info { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.reel-author-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #0095f6; }
.reel-author-name { color: white; font-weight: 700; font-size: 0.9rem; }
.reel-author-handle { color: #8e8e8e; font-size: 0.7rem; }
.reel-caption { color: white; font-size: 0.8rem; margin-bottom: 8px; line-height: 1.4; }
.reel-music { display: flex; align-items: center; gap: 6px; color: white; font-size: 0.7rem; opacity: 0.8; }
.reel-music svg { width: 14px; height: 14px; fill: white; }
.reel-comment-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  z-index: 10;
}
.reel-comment-input-container input { flex: 1; background: #1a1a1a; border: none; border-radius: 24px; padding: 10px 16px; color: white; font-size: 0.85rem; }
.reel-comment-input-container input::placeholder { color: #8e8e8e; }
.reel-comment-input-container button { background: #0095f6; border: none; border-radius: 24px; padding: 10px 20px; color: white; font-weight: 600; cursor: pointer; }
.reel-comment-input-container button:disabled { opacity: 0.5; cursor: not-allowed; }
.close-reel-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  backdrop-filter: blur(5px);
}
.close-reel-btn svg { width: 20px; height: 20px; stroke: white; }

/* ===== POST MODAL ===== */
.post-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.92); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.post-modal-container { position: relative; max-width: 90vw; max-height: 90vh; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.post-modal-content { display: flex; background: white; border-radius: 12px; overflow: hidden; max-width: 1100px; width: 100%; max-height: 90vh; }
.dark-mode .post-modal-content { background: #000000; }
.post-modal-image { flex: 1.2; position: relative; background: #000; display: flex; align-items: center; justify-content: center; min-height: 500px; }
.post-modal-image img { max-width: 100%; max-height: 85vh; object-fit: contain; }
.image-navigation { position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: space-between; padding: 0 16px; }
.nav-btn { width: 32px; height: 32px; background: rgba(0, 0, 0, 0.6); border: none; border-radius: 50%; color: white; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.nav-btn:hover { background: rgba(0, 0, 0, 0.8); }
.post-modal-info { flex: 0.8; display: flex; flex-direction: column; background: white; }
.dark-mode .post-modal-info { background: #000000; }
.modal-post-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #efefef; }
.dark-mode .modal-post-header { border-bottom-color: #262626; }
.modal-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.modal-author { flex: 1; }
.author-name { font-weight: 600; font-size: 14px; color: #262626; display: block; }
.dark-mode .author-name { color: #ffffff; }
.author-handle { font-size: 12px; color: #8e8e8e; }
.modal-menu-btn { background: none; border: none; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; }
.modal-menu-btn svg { width: 20px; height: 20px; stroke: #262626; }
.dark-mode .modal-menu-btn svg { stroke: #ffffff; }
.modal-post-caption { padding: 12px 16px; border-bottom: 1px solid #efefef; max-height: 200px; overflow-y: auto; }
.dark-mode .modal-post-caption { border-bottom-color: #262626; }
.caption-author { font-weight: 600; font-size: 14px; color: #262626; margin-bottom: 4px; }
.dark-mode .caption-author { color: #ffffff; }
.caption-text h3 { font-size: 15px; font-weight: 600; color: #262626; margin-bottom: 6px; }
.caption-text p { font-size: 14px; color: #8e8e8e; line-height: 1.4; }
.dark-mode .caption-text h3 { color: #ffffff; }
.modal-post-price { padding: 12px 16px; border-bottom: 1px solid #efefef; }
.dark-mode .modal-post-price { border-bottom-color: #262626; }
.current-price { font-size: 18px; font-weight: 700; color: #0095f6; }
.old-price { font-size: 14px; color: #8e8e8e; text-decoration: line-through; margin-right: 8px; }
.modal-post-actions { display: flex; gap: 16px; padding: 12px 16px; border-bottom: 1px solid #efefef; }
.dark-mode .modal-post-actions { border-bottom-color: #262626; }
.action-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; color: #262626; transition: all 0.2s ease; }
.dark-mode .action-btn { color: #ffffff; }
.action-btn svg { width: 22px; height: 22px; stroke: #262626; }
.dark-mode .action-btn svg { stroke: #ffffff; }
.like-icon.liked { fill: #ed4956; stroke: #ed4956; }
.wishlist-icon.liked { fill: #ef4444; stroke: #ef4444; }
.buy-btn-modal { margin-right: auto; background: #0095f6; padding: 6px 16px; border-radius: 8px; color: white; }
.buy-btn-modal svg { stroke: white; }
.buy-btn-modal:hover { background: #0081d6; }
.modal-post-comments { flex: 1; display: flex; flex-direction: column; padding: 12px 16px; min-height: 200px; }
.comments-list { flex: 1; overflow-y: auto; margin-bottom: 12px; }
.comment-item { margin-bottom: 12px; font-size: 14px; }
.comment-author { font-weight: 600; color: #262626; margin-left: 8px; }
.dark-mode .comment-author { color: #ffffff; }
.comment-text { color: #262626; }
.dark-mode .comment-text { color: #ffffff; }
.comment-input-wrapper { display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid #efefef; }
.dark-mode .comment-input-wrapper { border-top-color: #262626; }
.comment-input { flex: 1; background: none; border: none; padding: 8px 0; font-size: 14px; color: #262626; outline: none; }
.dark-mode .comment-input { color: #ffffff; }
.comment-input::placeholder { color: #8e8e8e; }
.post-comment-btn { background: none; border: none; color: #0095f6; font-weight: 600; cursor: pointer; opacity: 0.7; }
.post-comment-btn:enabled { opacity: 1; }
.modal-post-date { padding: 12px 16px; font-size: 10px; color: #8e8e8e; border-top: 1px solid #efefef; }
.dark-mode .modal-post-date { border-top-color: #262626; }
.close-modal-btn { position: absolute; top: 20px; left: 20px; background: none; border: none; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; color: white; }
.close-modal-btn svg { width: 24px; height: 24px; stroke: white; }

/* Post Menu Dropdown */
.post-menu-dropdown { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); min-width: 280px; z-index: 2100; overflow: hidden; animation: fadeInScale 0.2s ease; }
.dark-mode .post-menu-dropdown { background: #262626; }
@keyframes fadeInScale { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
.menu-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 20px; background: none; border: none; text-align: right; cursor: pointer; transition: background 0.2s ease; color: #262626; font-size: 14px; }
.dark-mode .menu-item { color: #ffffff; }
.menu-item:hover { background: #efefef; }
.dark-mode .menu-item:hover { background: #363636; }
.menu-item.delete { color: #ed4956; }
.menu-item svg { width: 20px; height: 20px; stroke: currentColor; }

/* Edit Modal */
.edit-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.edit-modal { background: white; border-radius: 16px; width: 90%; max-width: 500px; max-height: 85vh; overflow-y: auto; }
.dark-mode .edit-modal { background: #1a1a1a; color: #fff; }
.edit-modal-header { display: flex; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
.dark-mode .edit-modal-header { border-color: #333; }
.edit-modal-header h3 { font-size: 18px; font-weight: 700; }
.edit-modal-close { width: 32px; height: 32px; background: #f1f5f9; border: none; border-radius: 50%; cursor: pointer; font-size: 18px; }
.dark-mode .edit-modal-close { background: #333; color: #fff; }
.edit-modal-body { padding: 20px; }
.edit-form-group { margin-bottom: 16px; }
.edit-form-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.edit-form-input, .edit-form-textarea { width: 100%; padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
.dark-mode .edit-form-input, .dark-mode .edit-form-textarea { background: #333; border-color: #444; color: #fff; }
.edit-modal-footer { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid #e2e8f0; }
.dark-mode .edit-modal-footer { border-color: #333; }

/* Confirm Modal */
.confirm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.confirm-modal { background: white; border-radius: 16px; width: 90%; max-width: 400px; padding: 24px; text-align: center; }
.dark-mode .confirm-modal { background: #1a1a1a; color: #fff; }
.confirm-icon { width: 56px; height: 56px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.dark-mode .confirm-icon { background: #3b1a1a; }
.confirm-icon svg { width: 28px; height: 28px; stroke: #ef4444; }
.confirm-modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.confirm-modal p { font-size: 14px; color: #64748b; margin-bottom: 20px; }
.dark-mode .confirm-modal p { color: #aaa; }
.confirm-modal-actions { display: flex; gap: 12px; }
.btn-cancel { flex: 1; padding: 12px; background: #f1f5f9; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
.dark-mode .btn-cancel { background: #333; color: #fff; }
.btn-save { flex: 1; padding: 12px; background: linear-gradient(135deg, #08717f, #065a69); border: none; border-radius: 10px; color: #fff; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-save:disabled { opacity: 0.6; }
.btn-delete-confirm { flex: 1; padding: 12px; background: #ef4444; border: none; border-radius: 10px; color: #fff; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-delete-confirm:disabled { opacity: 0.6; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Links */
.profile-username-link, .bio-name-link, .modal-avatar-link, .author-link, .avatar-link, .reel-author-link { text-decoration: none; color: inherit; }
.profile-username-link:hover .profile-username,
.bio-name-link:hover .bio-name,
.author-link:hover .author-name,
.reel-author-link:hover .reel-author-name { text-decoration: underline; opacity: 0.8; }
.modal-avatar-link:hover .modal-avatar,
.avatar-link:hover .avatar-circle { opacity: 0.8; transform: scale(1.02); transition: all 0.2s ease; }

/* Responsive */
@media (max-width: 735px) {
  .cover-photo-container { height: 200px; }
  .profile-container { padding: 0 16px; }
  .profile-header { flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-top: -30px; margin-bottom: 24px; }
  .profile-stats-instagram { justify-content: center; gap: 30px; }
  .profile-actions-row { justify-content: center; }
  .stat-item { text-align: center; }
  .tab-navigation { gap: 30px; }
  .instagram-grid { gap: 2px; }
  .instagram-reels-grid { grid-template-columns: repeat(2, 1fr); }
  .post-modal-content { flex-direction: column; max-height: 90vh; }
  .post-modal-image { min-height: 300px; }
  .post-modal-info { max-height: 300px; }
}
@media (max-width: 480px) {
  .avatar-container { width: 100px; height: 100px; }
  .profile-username { font-size: 1.5rem; }
  .tab-link span { display: none; }
  .tab-navigation { gap: 20px; }
  .change-cover-btn span { display: none; }
  .change-cover-btn { padding: 8px; }
  .facebook-action-btn span { display: none; }
  .facebook-action-btn { padding: 8px; }
  .instagram-grid { gap: 2px; }
  .instagram-reels-grid { grid-template-columns: 1fr; }
  .reel-side-action svg { width: 24px; height: 24px; }
  .reel-author-avatar { width: 32px; height: 32px; }
  .reel-modal-container { max-width: 100%; }
}
/* Ajouter ces styles dans la section <style scoped> */

/* Edit Categories Grid */
.edit-categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.edit-category-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dark-mode .edit-category-card {
  border-color: #444;
}

.edit-category-card:hover {
  border-color: #08717f;
  transform: translateY(-2px);
}

.edit-category-card.selected {
  border-color: #08717f;
}

.edit-category-image-wrapper {
  position: relative;
  width: 100%;
  height: 70px;
  overflow: hidden;
}

.edit-category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-category-overlay {
  position: absolute;
  inset: 0;
  background: rgba(8, 113, 127, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.edit-category-info {
  padding: 6px;
  text-align: center;
}

.edit-category-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .edit-category-name {
  color: #f1f5f9;
}

/* Edit Subcategories */
.edit-subcategories-section {
  margin: 8px 0 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  animation: slideDown 0.2s ease;
}

.dark-mode .edit-subcategories-section {
  background: #1a1a1a;
  border-color: #444;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.edit-subcategories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #08717f;
}

.edit-back-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-back-btn:hover {
  color: #d40025;
}

.edit-subcategories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 6px;
}

.edit-subcategory-card {
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dark-mode .edit-subcategory-card {
  border-color: #444;
}

.edit-subcategory-card:hover {
  border-color: #10b981;
}

.edit-subcategory-card.selected {
  border-color: #10b981;
}

.edit-subcategory-image-wrapper {
  width: 100%;
  height: 55px;
  overflow: hidden;
}

.edit-subcategory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-subcategory-info {
  padding: 4px;
  text-align: center;
}

.edit-subcategory-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .edit-subcategory-name {
  color: #f1f5f9;
}

/* Selected Category Display */
.edit-selected-category {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 8px;
  margin-top: 8px;
}

.dark-mode .edit-selected-category {
  background: #1a2e1a;
}

.edit-selected-label {
  font-size: 0.8rem;
  color: #64748b;
}

.edit-selected-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #08717f;
}

.edit-clear-category {
  width: 22px;
  height: 22px;
  background: #fee2e2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #d40025;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  margin-right: auto;
}

.edit-clear-category:hover {
  background: #d40025;
  color: white;
}

/* Form Row */
.edit-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
