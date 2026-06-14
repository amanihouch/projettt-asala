<!-- frontend/src/views/Homepage.vue - Version finale complète avec alerte vendeur unique -->
<template>
  <div class="homepage" :class="{ 'dark-mode': isDarkMode }" dir="rtl">

    <!-- ===== PRELOADER ===== -->
    <transition name="preloader-fade">
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
    </transition>

    <!-- ===== SCROLL TO TOP ===== -->
    <transition name="fade">
      <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop" aria-label="العودة للأعلى">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5L12 19" stroke-width="2" stroke-linecap="round"/>
          <path d="M18 11L12 5L6 11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </transition>

    <!-- ============================= -->
    <!-- ===== HERO SLIDER ========== -->
    <!-- ============================= -->
    <section class="hero-section">
      <div
        v-for="(slide, index) in heroSlides"
        :key="index"
        class="hero-slide"
        :class="{ active: currentSlide === index }"
      >
        <div class="hero-bg">
          <video autoplay muted loop playsinline class="hero-video">
            <source :src="slide.video" type="video/mp4" />
          </video>
          <div class="hero-overlay-dark"></div>
          <div class="hero-overlay-gradient"></div>
        </div>

        <!-- ===== PHRASE CENTRALE ===== -->
        <div class="hero-center-tagline">
          <p>من قلب التراث العربي الأصيل، ننسج حكاياتٍ تحمل عبق التاريخ وجمال الهوية،</p>
          <p>لأن الأصالة ليست ماضيًا نرويه، بل قيمة نعيشها كل يوم</p>
        </div>

        <div class="hero-vendor-card" v-if="slide.vendor">
          <div class="vendor-card-inner">
            <div class="vendor-avatar-wrap">
              <img :src="slide.vendor.avatar || 'https://i.pravatar.cc/48?u=vendor'" :alt="slide.vendor.name" />
              <div class="vendor-online-dot"></div>
            </div>
            <div class="vendor-info">
              <span class="vendor-name">{{ slide.vendor.name }}</span>
              <span class="vendor-role">بائع موثوق</span>
            </div>
            <div class="vendor-sponsored-tag">SPONSORISÉE</div>
          </div>
        </div>
      </div>

      <button class="hero-nav prev" @click="prevSlide" aria-label="السابق">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18L9 12L15 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="hero-nav next" @click="nextSlide" aria-label="التالي">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="hero-dots">
        <span
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="hero-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </section>

    <!-- ============================= -->
    <!-- ===== SPONSORED SECTION ==== -->
    <!-- ============================= -->
    <section class="sponsored-section" v-if="sponsoredProducts.length > 0">
      <div class="sp-container">
        <div class="sp-shimmer-bar"></div>

        <div class="sp-header">
          <div class="sp-header-left">
            <div class="sp-title-block">
              <span class="sp-sponsored-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style="margin-left:4px">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                SPONSORISÉ
              </span>
              <h2 class="sp-title">المنتجات <span>المروّجة</span></h2>
            </div>
            <p class="sp-subtitle">اكتشف أفضل المنتجات المختارة من بائعين موثوقين · <strong>{{ sponsoredProducts.length }}</strong> منتج مميز</p>
          </div>

          <div class="sp-header-right">
            <div class="sp-nav-arrows">
              <button class="sp-nav-btn" @click="spScrollPrev" :disabled="spScrollPos <= 0" aria-label="السابق">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18L15 12L9 6" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="sp-nav-btn" @click="spScrollNext" aria-label="التالي">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18L9 12L15 6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span class="sp-view-all" @click="navigateTo('/products?sponsored=true')">عرض الكل</span>
          </div>
        </div>

        <div class="sp-carousel-wrap">
          <div class="sp-carousel" ref="spCarouselRef" @scroll="onSpScroll">
            <div
              v-for="(product, idx) in sponsoredProducts"
              :key="product.id || idx"
              class="sp-card"
              :style="{ '--idx': idx }"
              @click="goToProduct(product.postId || product.id)"
            >
              <div class="sp-card-badge">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                مميز
              </div>

              <button
                class="sp-wishlist-btn"
                :class="{ active: isWishlisted(product.id) }"
                @click.stop="toggleWishlist(product)"
                aria-label="إضافة للمفضلة"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" :fill="isWishlisted(product.id) ? '#d40025' : 'none'" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
                </svg>
              </button>

              <div class="sp-card-img">
                <img
                  :src="getProductImageSafe(product)"
                  :alt="product.name || product.productName || 'منتج'"
                  loading="lazy"
                  @error="handleSponsoredImageError($event, product)"
                />
                <div class="sp-card-hover">
                  <button class="sp-quick-btn" @click.stop="openSpQuickView(product)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    عرض سريع
                  </button>
                </div>
              </div>

              <div class="sp-card-body">
                <h4 class="sp-card-name">{{ truncate(product.name || product.productName, 22) }}</h4>

                <div class="sp-card-price-row">
                  <div class="sp-card-price">
                    {{ formatPrice(product.price) }}
                    <span class="sp-currency">د.ت</span>
                  </div>
                  <div v-if="product.oldPrice" class="sp-card-old-price">
                    {{ formatPrice(product.oldPrice) }}
                    <span class="sp-discount-badge">
                      -{{ Math.round((1 - product.price / product.oldPrice) * 100) }}%
                    </span>
                  </div>
                </div>

                <div class="sp-card-vendor">
                  <img
                    :src="product.vendorAvatar || `https://i.pravatar.cc/24?u=${product.vendorId || product.id}`"
                    @error="e => e.target.src = 'https://i.pravatar.cc/24?u=0'"
                    :alt="product.vendorName"
                  />
                  <span>{{ truncate(product.vendorName || 'دار الأصالة', 14) }}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#08717f">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sp-progress-dots" v-if="sponsoredProducts.length > 4">
          <span
            v-for="n in Math.ceil(sponsoredProducts.length / 4)"
            :key="n"
            class="sp-dot"
            :class="{ active: spActiveDot === n - 1 }"
            @click="spGoToDot(n - 1)"
          ></span>
        </div>
      </div>
    </section>

    <section class="sponsored-section sponsored-skeleton" v-else-if="isLoadingSponsored">
      <div class="sp-container">
        <div class="sp-header">
          <div class="skeleton-line w-200 h-24"></div>
          <div class="skeleton-line w-100 h-16"></div>
        </div>
        <div class="sp-carousel">
          <div v-for="i in 5" :key="i" class="sp-card skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line w-80 h-12"></div>
              <div class="skeleton-line w-60 h-18"></div>
              <div class="skeleton-line w-40 h-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= -->
    <!-- ===== CATEGORIES SECTION === -->
    <!-- ============================= -->
    <section class="categories-section" ref="categoriesSection">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">تصنيفات</span>
          <h2 class="section-title">تسوق حسب <span class="highlight">اهتمامك</span></h2>
          <p class="section-desc">اكتشف تشكيلتنا المتنوعة من المنتجات التقليدية التونسية</p>
        </div>

        <div class="categories-row-wrap">
          <button class="cat-nav prev" @click="scrollCatsLeft" v-if="categories.length > 5" aria-label="السابق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="categories-row" ref="catsContainer">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="cat-card"
              @click="navigateTo(`/products?category=${cat.slug}`)"
            >
              <div class="cat-img-wrap">
                <img :src="cat.imageUrl" :alt="cat.nameAr" loading="lazy" @error="e => e.target.src = 'https://placehold.co/160x160/f5f0eb/1a1a2e?text=تصنيف'" />
                <div class="cat-overlay">
                  <span class="cat-icon">{{ cat.icon }}</span>
                </div>
              </div>
              <h3 class="cat-name">{{ cat.nameAr }}</h3>
              <span class="cat-count">{{ cat.products_count }} منتج</span>
            </div>
          </div>
          <button class="cat-nav next" @click="scrollCatsRight" v-if="categories.length > 5" aria-label="التالي">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18L9 12L15 6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================= -->
    <!-- ===== PRODUCTS FEED ======== -->
    <!-- ============================= -->
    <section class="feed-section">
      <div class="container">
        <div class="feed-header">
          <div>
            <span class="section-tag">منتجات الحرفيين</span>
            <h2 class="section-title">أحدث <span class="highlight">المنتجات</span></h2>
          </div>
          <div class="feed-filters">
            <button
              v-for="f in feedFilters"
              :key="f.value"
              class="feed-filter-btn"
              :class="{ active: activeFilter === f.value }"
              @click="activeFilter = f.value"
            >{{ f.label }}</button>
          </div>
        </div>

        <div v-if="isLoadingPosts" class="feed-loading">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="activeFilter === 'videos'" class="reels-grid">
          <div
            v-for="reel in displayedReels"
            :key="reel.id"
            class="reel-card"
            @click="openReelModal(reel)"
          >
            <div class="reel-video-wrap">
              <video :src="reel.videoUrl" class="reel-video" muted loop playsinline
                @mouseenter="e => e.target.play()"
                @mouseleave="e => { e.target.pause(); e.target.currentTime = 0 }"
              ></video>
              <div class="reel-overlay">
                <div class="reel-play">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div class="reel-stats">
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {{ reel.likes || 0 }}
                  </span>
                </div>
              </div>
            </div>
            <div class="reel-info">
              <img :src="reel.vendorAvatar || 'https://i.pravatar.cc/32'" @error="handleAvatarError" />
              <div>
                <p class="reel-vendor">{{ truncate(reel.vendorName || 'حرفي', 14) }}</p>
                <p class="reel-title">{{ truncate(reel.title, 22) }}</p>
              </div>
            </div>
          </div>
          <div v-if="displayedReels.length === 0" class="feed-empty">
            <span>🎬</span>
            <p>لا توجد فيديوهات بعد</p>
          </div>
        </div>

        <div v-else-if="displayedPosts.length > 0" class="products-grid">
          <div
            v-for="post in displayedPosts"
            :key="post.id"
            class="product-card"
            @click="openQuickView(post)"
          >
            <div class="product-img-wrap">
              <img :src="getProductImage(post)" :alt="getProductName(post)" loading="lazy" @error="e => e.target.src = 'https://placehold.co/400x400/f5f0eb/1a1a2e?text=منتج'" />
              <div class="product-price-tag">{{ formatPrice(getPrice(post)) }} د.ت</div>
              <div v-if="isFeedProductSponsored(post.id)" class="feed-sponsored-badge">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                مميز
              </div>
              <div class="product-actions">
                <button class="pa-btn" @click.stop="handleAddToCart(post)" title="إضافة للسلة">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 6H21L19 16H5L3 6Z"/>
                    <circle cx="8" cy="20" r="1.5"/>
                    <circle cx="18" cy="20" r="1.5"/>
                  </svg>
                </button>
                <button class="pa-btn" @click.stop="togglePostLike(post)" :class="{ active: isPostLiked(post.id) }">
                  <svg width="15" height="15" viewBox="0 0 24 24" :fill="isPostLiked(post.id) ? '#d40025' : 'none'" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-vendor">
                <img :src="getPostVendorAvatar(post)" @error="handleAvatarError" />
                <span>{{ truncate(getVendorName(post), 12) }}</span>
              </div>
              <h4 class="product-name">{{ truncate(getProductName(post), 24) }}</h4>
            </div>
          </div>
        </div>

        <div v-else class="feed-empty">
          <span>✦</span>
          <p>لا توجد منتجات بعد</p>
        </div>

        <div class="feed-more" v-if="displayedPosts.length > 0 || displayedReels.length > 0">
          <button class="more-btn" @click="$router.push(activeFilter === 'videos' ? '/reels' : '/products')">
            <span>عرض المزيد</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12L19 12"/>
              <path d="M12 5L19 12L12 19" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================= -->
    <!-- ===== FEATURES BAR ========= -->
    <!-- ============================= -->
    <section class="features-bar">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 8L20 20L4 20L4 8"/>
                <path d="M22 6L12 3L2 6L12 9L22 6Z" stroke-linejoin="round"/>
                <path d="M12 12L12 21" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>توصيل سريع</h4>
              <p>لجميع أنحاء الجمهورية التونسية</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2"/>
                <path d="M8 10L12 14L16 10" stroke-linecap="round"/>
                <path d="M12 14L12 20" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>دفع آمن</h4>
              <p>معاملات مشفرة وحماية كاملة</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12L11 14L15 10" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>منتجات أصلية</h4>
              <p>حرف يدوية تونسية أصيلة</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="feature-text">
              <h4>دعم متواصل</h4>
              <p>خدمة عملاء على مدار الساعة</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= -->
    <!-- ===== MODALS =============== -->
    <!-- ============================= -->

    <!-- Sponsored Quick View Modal -->
    <transition name="modal-fade">
      <div v-if="spQuickViewProduct" class="modal-overlay" @click.self="spQuickViewProduct = null">
        <div class="quick-modal">
          <button class="modal-close" @click="spQuickViewProduct = null" aria-label="إغلاق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="quick-modal-grid" v-if="spQuickViewProduct">
            <div class="quick-modal-img">
              <div class="modal-sp-tag">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                منتج مميز
              </div>
              <img :src="spQuickViewProduct.image" :alt="spQuickViewProduct.name" @error="e => e.target.src = 'https://placehold.co/400x500/f5f0eb/1a1a2e?text=منتج'" />
            </div>
            <div class="quick-modal-info">
              <div class="modal-vendor-row">
                <img :src="spQuickViewProduct.vendorAvatar || `https://i.pravatar.cc/40?u=${spQuickViewProduct.vendorId}`" @error="handleAvatarError" />
                <div>
                  <strong>{{ spQuickViewProduct.vendorName || 'بائع موثوق' }}</strong>
                  <span class="modal-vendor-label">بائع موثوق</span>
                </div>
              </div>
              <h2 class="modal-product-title">{{ spQuickViewProduct.name || spQuickViewProduct.productName }}</h2>
              <p class="modal-product-desc">{{ spQuickViewProduct.description || 'منتج حرفي تونسي أصيل مصنوع يدوياً بأعلى معايير الجودة.' }}</p>
              <div class="modal-price-row">
                <span class="modal-price">{{ formatPrice(spQuickViewProduct.price) }} د.ت</span>
                <span v-if="spQuickViewProduct.oldPrice" class="modal-old-price">{{ formatPrice(spQuickViewProduct.oldPrice) }} د.ت</span>
                <span v-if="spQuickViewProduct.oldPrice" class="modal-discount">
                  -{{ Math.round((1 - spQuickViewProduct.price / spQuickViewProduct.oldPrice) * 100) }}%
                </span>
              </div>
              <div class="modal-actions">
                <button class="modal-btn-primary" @click="handleAddToCart(spQuickViewProduct); spQuickViewProduct = null">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6H21L19 16H5L3 6Z"/>
                    <circle cx="8" cy="20" r="1.5"/>
                    <circle cx="18" cy="20" r="1.5"/>
                  </svg>
                  أضف إلى السلة
                </button>
                <button class="modal-btn-secondary" @click="$router.push(`/product/${spQuickViewProduct.postId || spQuickViewProduct.id}`); spQuickViewProduct = null">
                  عرض التفاصيل الكاملة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Products Quick View Modal -->
    <transition name="modal-fade">
      <div v-if="showQuickView && selectedPost" class="modal-overlay" @click.self="closeQuickView">
        <div class="quick-modal">
          <button class="modal-close" @click="closeQuickView" aria-label="إغلاق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="quick-modal-grid">
            <div class="quick-modal-img">
              <img :src="getProductImage(selectedPost)" :alt="getProductName(selectedPost)" @error="e => e.target.src = 'https://placehold.co/400x500/f5f0eb/1a1a2e?text=منتج'" />
            </div>
            <div class="quick-modal-info">
              <div class="modal-vendor-row">
                <img :src="getPostVendorAvatar(selectedPost)" @error="handleAvatarError" />
                <div>
                  <strong>{{ getVendorName(selectedPost) }}</strong>
                  <span class="modal-vendor-label">حرفي تونسي</span>
                </div>
              </div>
              <h2 class="modal-product-title">{{ getProductName(selectedPost) }}</h2>
              <p class="modal-product-desc">{{ selectedPost.description || 'منتج حرفي تونسي أصيل مصنوع يدوياً بأعلى معايير الجودة.' }}</p>
              <div class="modal-price-row">
                <span class="modal-price">{{ formatPrice(getPrice(selectedPost)) }} د.ت</span>
              </div>
              <div class="modal-actions">
                <button class="modal-btn-primary" @click="handleAddToCart(selectedPost); closeQuickView()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6H21L19 16H5L3 6Z"/>
                    <circle cx="8" cy="20" r="1.5"/>
                    <circle cx="18" cy="20" r="1.5"/>
                  </svg>
                  أضف إلى السلة
                </button>
                <button class="modal-btn-secondary" @click="$router.push(`/product/${selectedPost.id}`); closeQuickView()">
                  عرض التفاصيل الكاملة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reel Modal -->
    <transition name="modal-fade">
      <div v-if="showReelModal && selectedReel" class="modal-overlay reel-overlay" @click.self="closeReelModal">
        <div class="reel-modal">
          <button class="modal-close" @click="closeReelModal" aria-label="إغلاق">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round"/>
            </svg>
          </button>
          <video :src="selectedReel.videoUrl" controls autoplay playsinline class="reel-modal-video"></video>
          <div class="reel-modal-info">
            <div class="modal-vendor-row">
              <img :src="selectedReel.vendorAvatar || 'https://i.pravatar.cc/40'" @error="handleAvatarError" />
              <div>
                <strong>{{ selectedReel.vendorName }}</strong>
                <span class="reel-handle">@{{ (selectedReel.vendorName || 'artisan').toLowerCase().replace(/\s/g, '') }}</span>
              </div>
            </div>
            <h3>{{ selectedReel.title }}</h3>
            <p>{{ selectedReel.description }}</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Promo Popup -->
    <PromoPopup
      :offers="activeOffers"
      :is-visible="showPromoPopup"
      @close="closePromoPopup"
      @remind="handleRemindLater"
    />

    <!-- Toast Notification -->
    <transition name="toast-anim">
      <div v-if="toast.show" class="toast-box" :class="toast.type">
        <div class="toast-icon-wrap" :class="toast.type">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
          </svg>
        </div>
        <span>{{ toast.message }}</span>
        <div class="toast-bar"></div>
      </div>
    </transition>

    <!-- ===== ALERTE VENDEUR UNIQUE ===== -->
    <transition name="alert-fade">
      <div v-if="vendorAlertVisible" class="vendor-alert-overlay" @click.self="closeVendorAlert">
        <div class="vendor-alert-card" :class="{ 'dark-mode': isDarkMode }">
          <div class="alert-icon-wrapper">
            <div class="alert-icon">⚠️</div>
          </div>

          <div class="alert-content">
            <h3 class="alert-title">تعذر إضافة المنتج</h3>

            <p class="alert-message">
              ⚠️ لا يمكنك إضافة منتجات من بائع آخر. السلة تحتوي حالياً على منتجات من <strong>{{ pendingVendorChange?.currentVendorName }}</strong>.
            </p>

            <div class="alert-divider"></div>

            <div class="alert-info">
              <div class="info-row">
                <span class="info-label">المنتج الحالي:</span>
                <span class="info-value">{{ pendingVendorChange?.newProductName || 'منتج' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">بائع المنتج الحالي:</span>
                <span class="info-value highlight">{{ pendingVendorChange?.newVendorName }}</span>
              </div>
              <div class="info-row" v-if="pendingVendorChange?.currentVendorName">
                <span class="info-label">منتجات في السلة من:</span>
                <span class="info-value highlight-warning">{{ pendingVendorChange?.currentVendorName }}</span>
              </div>
            </div>

            <div class="alert-actions">
              <button class="alert-btn secondary" @click="closeVendorAlert">
                <span>مواصلة التسوق</span>
              </button>
              <button class="alert-btn primary" @click="clearCartAndAddProduct">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>إفراغ السلة والمتابعة</span>
              </button>
            </div>

            <button class="alert-close" @click="closeVendorAlert" aria-label="إغلاق">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/postStore'
import { useCartStore } from '../stores/cart'
import { useLikesStore } from '../stores/likes'
import { useThemeStore } from '../stores/theme'
import { useOffersStore } from '../stores/offers'
import { useProductStore } from '../stores/productStore'
import api from '../services/api'
import PromoPopup from '../components/PromoPopup.vue'

const router = useRouter()
const authStore = useAuthStore()
const postStore = usePostStore()
const cartStore = useCartStore()
const likesStore = useLikesStore()
const themeStore = useThemeStore()
const offersStore = useOffersStore()
const productStore = useProductStore()

const { activeOffers } = storeToRefs(offersStore)
const isDarkMode = computed(() => themeStore.isDarkMode)

// ─── State ───
const showPreloader = ref(true)
const showScrollTop = ref(false)
const currentSlide = ref(0)
const slideInterval = ref(null)
const isLoadingPosts = ref(false)
const isLoadingSponsored = ref(false)
const categories = ref([])
const catsContainer = ref(null)
const categoriesSection = ref(null)
const showPromoPopup = ref(false)
const activeFilter = ref('all')
const showQuickView = ref(false)
const selectedPost = ref(null)
const showReelModal = ref(false)
const selectedReel = ref(null)
const reelsList = ref([])
const toast = ref({ show: false, message: '', type: 'success' })

// ─── Sponsored state ───
const spCarouselRef = ref(null)
const spScrollPos = ref(0)
const spActiveDot = ref(0)
const spQuickViewProduct = ref(null)

// ─── ALERTE VENDEUR UNIQUE ───
const vendorAlertVisible = ref(false)
const pendingVendorChange = ref(null)
let pendingProduct = null

// ─── Hero Slides ───
const heroSlides = ref([
  { video: '/src/assets/videos/slide3.mp4' },
  { video: '/src/assets/videos/slide2.mp4' },
  { video: '/src/assets/videos/slide1.mp4' }
])

// ─── Feed Filters ───
const feedFilters = [
  { value: 'products', label: 'منتجات' },
]

// ─── Computed ───
const sponsoredProducts = computed(() => {
  const products = productStore.sponsoredProducts || []
  return [...products].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
})

const feedPosts = computed(() => postStore.posts || [])

const filteredPosts = computed(() => {
  let posts = [...feedPosts.value]
  switch (activeFilter.value) {
    case 'products': return posts.filter(p => !hasVideo(p))
    case 'videos':   return posts.filter(p => hasVideo(p))
    case 'popular':  return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    default:         return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

const displayedPosts = computed(() => filteredPosts.value.slice(0, 12))

const filteredReels = computed(() => {
  let r = [...reelsList.value]
  if (activeFilter.value === 'popular') return r.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  return r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})
const displayedReels = computed(() => filteredReels.value.slice(0, 12))

// ─── Helpers ───
const getProductImage = (post) => post.images?.[0] || post.image || 'https://placehold.co/400x400/f5f0eb/1a1a2e?text=منتج'
const getPostVendorAvatar = (post) => post.vendor?.avatar || post.vendorAvatar || `https://i.pravatar.cc/32?u=${post.id}`
const getVendorName = (post) => post.vendor?.name || post.vendorName || post.vendor?.shopName || 'حرفي تونسي'
const getProductName = (post) => post.productName || post.name || 'منتج حرفي'
const getPrice = (post) => post.price || 0
const hasVideo = (post) => !!(post.hasVideo || post.video || post.videoUrl)
const truncate = (text, len) => text ? (text.length > len ? text.substring(0, len) + '...' : text) : ''
const formatPrice = (price) => new Intl.NumberFormat('ar-TN').format(price || 0)
const handleAvatarError = (e) => { e.target.src = 'https://i.pravatar.cc/32?u=' + Date.now() }

const isFeedProductSponsored = (postId) => {
  return sponsoredProducts.value.some(sp => sp.id === postId || sp.postId === postId)
}

// ⭐⭐ FONCTIONS POUR LES IMAGES SPONSORISÉES ⭐⭐
const getProductImageSafe = (product) => {
  if (!product) return 'https://placehold.co/400x400/f5f0eb/1a1a2e?text=منتج'
  if (product.imageUrl && isValidImageUrl(product.imageUrl)) return product.imageUrl
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (firstImage && isValidImageUrl(firstImage)) return firstImage
  }
  if (product.image && isValidImageUrl(product.image)) return product.image
  if (product.productImage && isValidImageUrl(product.productImage)) return product.productImage
  if (product.thumbnail && isValidImageUrl(product.thumbnail)) return product.thumbnail
  const productName = product.name || product.productName || 'produit'
  return `https://placehold.co/400x400/f5f0eb/1a1a2e?text=${encodeURIComponent(productName.substring(0, 20))}`
}

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http') || url.startsWith('https') || url.startsWith('/')
}

const handleSponsoredImageError = (event, product) => {
  const img = event.target
  if (img.dataset.retryCount === undefined) img.dataset.retryCount = '0'
  const retryCount = parseInt(img.dataset.retryCount)
  if (retryCount === 0 && product.imageUrl && product.imageUrl !== img.src) {
    setTimeout(() => { img.src = product.imageUrl; img.dataset.retryCount = '1' }, 100)
  } else if (retryCount === 1 && product.images && product.images.length > 0) {
    setTimeout(() => { img.src = product.images[0]; img.dataset.retryCount = '2' }, 100)
  } else {
    const productName = product.name || product.productName || 'produit'
    img.src = `https://placehold.co/400x400/f5f0eb/1a1a2e?text=${encodeURIComponent(productName.substring(0, 20))}`
  }
}

// ─── Toast ───
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ─── Hero ───
const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length; resetSlideInterval() }
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length; resetSlideInterval() }
const goToSlide = (i) => { currentSlide.value = i; resetSlideInterval() }
const startSlideInterval = () => {
  slideInterval.value = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length
  }, 6000)
}
const resetSlideInterval = () => {
  if (slideInterval.value) { clearInterval(slideInterval.value); startSlideInterval() }
}

// ─── Sponsored carousel scroll ───
const onSpScroll = () => {
  if (spCarouselRef.value) {
    spScrollPos.value = spCarouselRef.value.scrollLeft
    const cardWidth = 167
    const visibleCards = 4
    spActiveDot.value = Math.round(spCarouselRef.value.scrollLeft / (cardWidth * visibleCards))
  }
}
const SP_SCROLL_AMOUNT = 167 * 3
const spScrollNext = () => spCarouselRef.value?.scrollBy({ left: SP_SCROLL_AMOUNT, behavior: 'smooth' })
const spScrollPrev = () => spCarouselRef.value?.scrollBy({ left: -SP_SCROLL_AMOUNT, behavior: 'smooth' })
const spGoToDot = (dotIndex) => {
  if (spCarouselRef.value) spCarouselRef.value.scrollTo({ left: dotIndex * 167 * 4, behavior: 'smooth' })
}

// ─── Wishlist / Likes ───
const isWishlisted = (id) => likesStore.isLiked(id)
const toggleWishlist = (product) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (isWishlisted(product.id)) { likesStore.removeLike(product.id); showToast('تمت إزالة المنتج من المفضلة', 'info') }
  else { likesStore.addLike({ id: product.id, ...product }); showToast('تمت إضافة المنتج إلى المفضلة', 'success') }
}

const isPostLiked = (id) => likesStore.isLiked(id)
const togglePostLike = (post) => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (isPostLiked(post.id)) { likesStore.removeLike(post.id); showToast('تمت إزالة الإعجاب', 'info') }
  else { likesStore.addLike({ id: post.id, ...post }); showToast('تم الإعجاب بالمنتج', 'success') }
}

// ─── ALERTE VENDEUR UNIQUE ───
const closeVendorAlert = () => {
  vendorAlertVisible.value = false
  pendingProduct = null
  pendingVendorChange.value = null
}

const clearCartAndAddProduct = async () => {
  if (!pendingProduct) return
  vendorAlertVisible.value = false
  await cartStore.clearCart()
  const productVendorId = pendingProduct?.vendorId || pendingProduct?.vendor?.id || pendingProduct?.userId
  const productVendorName = getVendorName(pendingProduct)
  const result = await cartStore.addItem({
    id: pendingProduct.id,
    name: pendingProduct.name || pendingProduct.productName || getProductName(pendingProduct),
    price: pendingProduct.price || getPrice(pendingProduct),
    image: pendingProduct.image || getProductImage(pendingProduct),
    quantity: 1,
    vendorName: productVendorName,
    vendorId: productVendorId
  })
  if (result) {
    showToast(`✅ تمت إضافة "${truncate(pendingProduct.name || getProductName(pendingProduct), 30)}" إلى السلة`, 'success')
    cartStore.openCart()
  }
  pendingProduct = null
  pendingVendorChange.value = null
}

// ─── AJOUT AU PANIER ───
const handleAddToCart = async (product) => {
  if (!product) return
  if (!authStore.isAuthenticated) {
    showToast('⚠️ يرجى تسجيل الدخول أولاً', 'warning')
    router.push('/login')
    return
  }
  const productVendorId = product?.vendorId || product?.vendor?.id || product?.userId
  const productVendorName = getVendorName(product)
  const currentCartVendorId = cartStore.currentVendorId?.value ?? cartStore.currentVendorId
  const currentCartVendorName = cartStore.currentVendorName?.value ?? cartStore.currentVendorName

  if (currentCartVendorId && currentCartVendorId !== 0 && currentCartVendorId !== '0') {
    if (String(currentCartVendorId) !== String(productVendorId)) {
      pendingProduct = product
      pendingVendorChange.value = {
        currentVendorName: currentCartVendorName,
        newVendorName: productVendorName,
        newVendorId: productVendorId,
        newProductName: truncate(product.name || getProductName(product), 40)
      }
      vendorAlertVisible.value = true
      return
    }
  }

  const result = await cartStore.addItem({
    id: product.id,
    name: product.name || product.productName || getProductName(product),
    price: product.price || getPrice(product),
    image: product.image || getProductImage(product),
    quantity: 1,
    vendorName: productVendorName,
    vendorId: productVendorId
  })

  if (result) {
    showToast(`✅ تمت إضافة "${truncate(product.name || getProductName(product), 30)}" إلى السلة`, 'success')
    cartStore.openCart()
  }
}

// ─── Modals ───
const openSpQuickView = (product) => { spQuickViewProduct.value = product; document.body.style.overflow = 'hidden' }
const openQuickView = (p) => { selectedPost.value = p; showQuickView.value = true; document.body.style.overflow = 'hidden' }
const closeQuickView = () => { showQuickView.value = false; selectedPost.value = null; document.body.style.overflow = '' }
const openReelModal = (r) => { selectedReel.value = r; showReelModal.value = true; document.body.style.overflow = 'hidden' }
const closeReelModal = () => { showReelModal.value = false; selectedReel.value = null; document.body.style.overflow = '' }

watch(() => spQuickViewProduct.value, (val) => { if (!val) document.body.style.overflow = '' })

// ─── Navigation ───
const navigateTo = (path) => { if (path) router.push(path) }
const goToProduct = (id) => { if (id) router.push(`/product/${id}`) }
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// ─── Categories scroll ───
const scrollCatsLeft = () => catsContainer.value?.scrollBy({ left: -280, behavior: 'smooth' })
const scrollCatsRight = () => catsContainer.value?.scrollBy({ left: 280, behavior: 'smooth' })

// ─── Promo Popup ───
const closePromoPopup = () => { showPromoPopup.value = false }
const handleRemindLater = () => { showToast('سنذكرك لاحقاً', 'info'); showPromoPopup.value = false }

// ─── Category helpers ───
const getCategoryImage = (slug) => {
  const map = {
    carpets: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/carpets.jpg',
    perfumes: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/perfumes.jpg',
    jewelry: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/jewelry.jpg',
    clothing: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/clothing.jpg',
    decor: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/decor.jpg',
    pottery: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/pottery.jpg',
    beauty: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/beauty.jpg',
    food: 'https://res.cloudinary.com/djfj85bwe/image/upload/v1/turath/categories/food.jpg',
  }
  return map[slug] || 'https://placehold.co/160x160/f5f0eb/1a1a2e?text=تصنيف'
}
const getCategoryIcon = (slug) => {
  const icons = { carpets: 'ز', perfumes: 'ع', jewelry: 'م', clothing: 'خ', decor: 'د', pottery: 'ف', beauty: 'ت', food: 'غ' }
  return icons[slug] || 'ح'
}

// ─── API: Categories ───
const loadCategories = async () => {
  try {
    const res = await api.get('/categories')
    let data = []
    if (res.data.success) {
      data = res.data.data?.categories || res.data.categories || (Array.isArray(res.data.data) ? res.data.data : [])
    }
    categories.value = data.map(c => ({
      id: c.id, slug: c.slug, nameAr: c.nameAr || c.name,
      icon: getCategoryIcon(c.slug),
      imageUrl: c.imageUrl || getCategoryImage(c.slug),
      products_count: c.productsCount || c.count || 0
    }))
  } catch (e) { console.error('Categories error:', e) }
}

// ─── API: Sponsored Products ───
const loadSponsored = async () => {
  isLoadingSponsored.value = true
  try {
    await productStore.fetchSponsoredProducts()
  } catch (error) {
    console.error('Error loading sponsored:', error)
  } finally {
    isLoadingSponsored.value = false
  }
}

// ─── API: Reels ───
const loadReels = async () => {
  try {
    const res = await api.get('/reels?limit=12')
    if (res.data.success) reelsList.value = res.data.data?.reels || res.data.reels || []
  } catch (e) { reelsList.value = [] }
}

// ─── Scroll handler ───
const handleScroll = () => { showScrollTop.value = window.scrollY > 500 }

// ─── Keyboard support ───
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') nextSlide()
  if (e.key === 'ArrowRight') prevSlide()
  if (e.key === 'Escape') { closeQuickView(); closeReelModal(); spQuickViewProduct.value = null; closeVendorAlert() }
}

// ─── Lifecycle ───
onMounted(async () => {
  setTimeout(() => { showPreloader.value = false }, 1800)
  likesStore.loadFromStorage?.()
  cartStore.loadFromStorage?.()
  offersStore.loadOffers?.()
  await loadCategories()
  await loadSponsored()
  await loadReels()
  await nextTick()
  isLoadingPosts.value = true
  try { await postStore.fetchFeed() } catch (e) { console.error(e) } finally { isLoadingPosts.value = false }
  startSlideInterval()
  setTimeout(() => { if (activeOffers.value?.length > 0) showPromoPopup.value = true }, 800)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (slideInterval.value) clearInterval(slideInterval.value)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;600;700;800&display=swap');

/* ───────────────────────────────────────── */
/* CSS CUSTOM PROPERTIES */
/* ───────────────────────────────────────── */
.homepage {
  --color-teal: #08717f;
  --color-teal-dark: #065a69;
  --color-teal-light: rgba(8,113,127,0.08);
  --color-red: #d40025;
  --color-red-light: #fef2f2;
  --color-gold: #c9a04a;
  --color-dark: #1a1a2e;
  --color-mid: #64748b;
  --color-light: #f8f5f0;
  --color-border: #f0ede8;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --shadow-sm: 0 2px 10px rgba(0,0,0,0.04);
  --shadow-md: 0 6px 20px rgba(0,0,0,0.07);
  --shadow-lg: 0 14px 40px rgba(0,0,0,0.10);
  --transition: 0.3s cubic-bezier(0.4,0,0.2,1);
}

/* ───────────────────────────────────────── */
/* BASE */
/* ───────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

.homepage {
  font-family: 'Cairo', 'Amiri', sans-serif;
  background: #fafaf8;
  direction: rtl;
  overflow-x: hidden;
  color: var(--color-dark);
}
.homepage.dark-mode {
  background: #0f0f1a;
  color: #f0efe8;
  --color-border: #2a2a3e;
  --color-light: #12121e;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
}

/* ───────────────────────────────────────── */
/* PRELOADER */
/* ───────────────────────────────────────── */
.preloader {
  position: fixed; inset: 0;
  background: #0a0a14;
  display: flex; align-items: center; justify-content: center;
  z-index: 99999;
}
.preloader-fade-leave-active { transition: opacity 0.5s ease 0.1s; }
.preloader-fade-leave-to { opacity: 0; }

.preloader-content { text-align: center; }
.preloader-logo-wrapper { margin-bottom: 28px; animation: floatLogo 2s ease-in-out infinite; }
@keyframes floatLogo { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.preloader-logo { height: 72px; filter: brightness(0) invert(1); }

.preloader-spinner { position: relative; width: 52px; height: 52px; margin: 0 auto 20px; }
.spinner-ring {
  position: absolute; inset: 0;
  border-radius: 50%; border: 2px solid transparent;
}
.spinner-ring:nth-child(1) { border-top-color: var(--color-teal); animation: spinR 1.1s linear infinite; }
.spinner-ring:nth-child(2) { border-right-color: var(--color-red); animation: spinR 1.5s linear infinite reverse; }
.spinner-ring:nth-child(3) { border-bottom-color: var(--color-gold); animation: spinR 0.85s linear infinite; }
@keyframes spinR { to { transform: rotate(360deg); } }

.preloader-text {
  color: rgba(255,255,255,0.5); font-size: 0.9rem; letter-spacing: 8px;
  animation: pulseTxt 1.5s ease-in-out infinite;
}
@keyframes pulseTxt { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

/* ───────────────────────────────────────── */
/* SCROLL TO TOP */
/* ───────────────────────────────────────── */
.scroll-top-btn {
  position: fixed; bottom: 32px; right: 32px;
  width: 48px; height: 48px;
  background: var(--color-teal); color: white;
  border: none; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 999;
  box-shadow: 0 6px 20px rgba(8,113,127,0.35);
  transition: all var(--transition);
}
.scroll-top-btn:hover { transform: translateY(-4px); background: var(--color-teal-dark); }

/* ───────────────────────────────────────── */
/* HERO SECTION */
/* ───────────────────────────────────────── */
.hero-section {
  position: relative;
  height: 72vh; min-height: 480px;
  overflow: hidden; background: #1a0a0a;
}

.hero-slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.2s cubic-bezier(0.4,0,0.2,1);
  z-index: 1;
}
.hero-slide.active { opacity: 1; z-index: 2; }

.hero-bg { position: absolute; inset: 0; }
.hero-video { width: 100%; height: 100%; object-fit: cover; }
.hero-slide.active .hero-video {
  transform: scale(1.06);
  transition: transform 12s ease-out;
}

.hero-overlay-dark {
  position: absolute; inset: 0;
  background: rgba(10, 5, 5, 0.52);
}
.hero-overlay-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

/* ───────────────────────────────────────── */
/* HERO CENTER TAGLINE */
/* ───────────────────────────────────────── */
.hero-center-tagline {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 6;
  text-align: center;
  width: 92%;
  max-width: 1000px;
  pointer-events: none;
  animation: taglineReveal 1.2s ease 0.4s both;
}

@keyframes taglineReveal {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}

.hero-center-tagline p {
  font-family: 'Amiri', serif;
  font-size: 2.6rem;
  font-weight: 700;
  font-style: italic;
  color: rgba(255, 255, 255, 0.97);
  line-height: 1.9;
  margin: 0;
  text-shadow:
    0 2px 24px rgba(0, 0, 0, 0.7),
    0 0 80px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.4px;
}

.hero-center-tagline p:last-child {
  color: var(--color-gold);
  font-size: 2.3rem;
  text-shadow:
    0 2px 24px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(201, 160, 74, 0.3);
}

/* Vendor card */
.hero-vendor-card {
  position: absolute; bottom: 40px; left: 40px; z-index: 5;
  animation: vendorSlideIn 0.8s ease 0.6s both;
}
@keyframes vendorSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.vendor-card-inner {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(12px);
  border-radius: 18px; padding: 12px 18px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
  min-width: 200px;
}
.vendor-avatar-wrap { position: relative; flex-shrink: 0; }
.vendor-avatar-wrap img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-teal); }
.vendor-online-dot {
  position: absolute; bottom: 1px; right: 1px;
  width: 10px; height: 10px;
  background: #10b981; border-radius: 50%; border: 2px solid white;
}
.vendor-info { flex: 1; }
.vendor-name { display: block; font-size: 0.88rem; font-weight: 700; color: var(--color-dark); }
.vendor-role { display: block; font-size: 0.7rem; color: var(--color-mid); }
.vendor-sponsored-tag {
  font-size: 0.58rem; font-weight: 800; letter-spacing: 1px; color: white;
  background: linear-gradient(135deg, var(--color-red), #ff4d6d);
  padding: 3px 8px; border-radius: 10px; white-space: nowrap;
}

/* Nav arrows */
.hero-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 50px; height: 50px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; z-index: 10;
  transition: all var(--transition);
}
.hero-nav:hover { background: rgba(255,255,255,0.25); }
.hero-nav.prev { left: 28px; }
.hero-nav.next { right: 28px; }

/* Dots */
.hero-dots {
  position: absolute; bottom: 28px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 10px; z-index: 10;
}
.hero-dot {
  width: 8px; height: 8px;
  background: rgba(255,255,255,0.4);
  border-radius: 4px; cursor: pointer;
  transition: all 0.35s ease;
}
.hero-dot.active { width: 32px; background: white; }

/* ───────────────────────────────────────── */
/* SPONSORED SECTION */
/* ───────────────────────────────────────── */
.sponsored-section {
  background: #ffffff;
  padding: 18px 0 22px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}
.dark-mode .sponsored-section { background: #12121e; }

.sp-shimmer-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--color-red), var(--color-gold), var(--color-teal), var(--color-gold), var(--color-red));
  background-size: 300% 100%;
  animation: shimmerLine 4s linear infinite;
}
@keyframes shimmerLine { 0% { background-position: 0%; } 100% { background-position: 300%; } }

.sp-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
}

.sp-header {
  display: flex; justify-content: space-between;
  align-items: flex-end; margin-bottom: 14px;
  flex-wrap: wrap; gap: 12px;
}
.sp-header-left { display: flex; flex-direction: column; gap: 4px; }
.sp-title-block { display: flex; align-items: center; gap: 10px; }

.sp-sponsored-badge {
  display: inline-flex; align-items: center;
  font-size: 0.55rem; font-weight: 800; letter-spacing: 1.5px; color: white;
  background: linear-gradient(135deg, var(--color-red), #ff4d6d);
  padding: 3px 9px; border-radius: 16px;
  box-shadow: 0 2px 8px rgba(212,0,37,0.3);
}

.sp-title {
  font-family: 'Amiri', serif;
  font-size: 1.3rem; font-weight: 700;
  color: var(--color-dark); margin: 0; line-height: 1;
}
.dark-mode .sp-title { color: #f0efe8; }
.sp-title span { color: var(--color-red); }

.sp-subtitle { font-size: 0.8rem; color: var(--color-mid); margin: 0; }
.sp-subtitle strong { color: var(--color-teal); }

.sp-header-right { display: flex; align-items: center; gap: 16px; }

.sp-nav-arrows {
  display: flex; gap: 6px;
  background: #f8f7f4; border: 1px solid #e8e4dc;
  border-radius: 30px; padding: 4px 7px;
}
.dark-mode .sp-nav-arrows { background: #1e1e30; border-color: #2a2a40; }

.sp-nav-btn {
  width: 30px; height: 30px;
  background: none; border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-teal); cursor: pointer;
  transition: all 0.2s ease;
}
.sp-nav-btn:hover:not(:disabled) { background: var(--color-teal); color: white; }
.sp-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.dark-mode .sp-nav-btn { color: #2dd4bf; }

.sp-view-all {
  font-size: 0.82rem; font-weight: 600;
  color: var(--color-teal); cursor: pointer;
  border-bottom: 1px solid var(--color-teal);
  padding-bottom: 1px; transition: color 0.2s;
  white-space: nowrap;
}
.sp-view-all:hover { color: var(--color-red); border-bottom-color: var(--color-red); }

.sp-carousel-wrap { position: relative; }

.sp-carousel {
  display: flex; gap: 12px;
  overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none;
  padding: 6px 2px 14px;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}
.sp-carousel::-webkit-scrollbar { display: none; }

.sp-progress-dots {
  display: flex; justify-content: center; gap: 8px;
  margin-top: 8px;
}
.sp-dot {
  width: 6px; height: 6px;
  background: #e2e0db; border-radius: 3px;
  cursor: pointer; transition: all 0.3s ease;
}
.sp-dot.active { width: 24px; background: var(--color-teal); }

/* ── SP Card ── */
.sp-card {
  flex: 0 0 155px;
  background: #ffffff;
  border-radius: var(--radius-md);
  overflow: hidden; cursor: pointer;
  position: relative;
  scroll-snap-align: start;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
  animation: cardIn 0.5s ease both;
  animation-delay: calc(var(--idx, 0) * 0.07s);
}
@keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.sp-card:hover { transform: translateY(-7px); box-shadow: 0 16px 36px rgba(212,0,37,0.1); border-color: rgba(212,0,37,0.18); }
.dark-mode .sp-card { background: #1e1e30; border-color: #2a2a40; }

.sp-card-badge {
  position: absolute; top: 8px; right: 8px; z-index: 5;
  display: flex; align-items: center; gap: 4px;
  font-size: 0.58rem; font-weight: 800; letter-spacing: 1px; color: white;
  background: linear-gradient(135deg, var(--color-red), #ff4d6d);
  padding: 3px 9px; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(212,0,37,0.35);
}

.sp-wishlist-btn {
  position: absolute; top: 8px; left: 8px; z-index: 5;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.92); border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8; cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.sp-wishlist-btn:hover, .sp-wishlist-btn.active { background: #fef2f2; color: var(--color-red); }

.sp-card-img { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #f8f5f0; }
.sp-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.sp-card:hover .sp-card-img img { transform: scale(1.07); }

.sp-card-hover {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.42);
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 14px;
  opacity: 0; transition: opacity 0.3s ease;
}
.sp-card:hover .sp-card-hover { opacity: 1; }
.sp-quick-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 16px;
  background: white; color: var(--color-dark);
  border: none; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.sp-quick-btn:hover { background: var(--color-teal); color: white; }

.sp-card-body { padding: 8px 10px 10px; }
.sp-card-name {
  font-size: 0.76rem; font-weight: 700;
  color: var(--color-dark); margin: 0 0 5px; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.dark-mode .sp-card-name { color: #e0ddd6; }

.sp-card-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 5px; flex-wrap: wrap; }
.sp-card-price { font-size: 0.9rem; font-weight: 800; color: var(--color-red); }
.sp-currency { font-size: 0.68rem; font-weight: 600; }
.sp-card-old-price {
  font-size: 0.68rem; color: #94a3b8;
  text-decoration: line-through;
  display: flex; align-items: center; gap: 4px;
}
.sp-discount-badge {
  font-size: 0.58rem; font-weight: 700;
  background: #fef2f2; color: var(--color-red);
  padding: 1px 5px; border-radius: 8px;
}

.sp-card-vendor { display: flex; align-items: center; gap: 5px; }
.sp-card-vendor img { width: 16px; height: 16px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(8,113,127,0.2); }
.sp-card-vendor span { font-size: 0.65rem; color: var(--color-mid); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dark-mode .sp-card-vendor span { color: #8a8a9a; }

/* Skeleton loading */
.sponsored-skeleton .sp-card { background: #f8f6f2; pointer-events: none; }
.dark-mode .sponsored-skeleton .sp-card { background: #1a1a28; }
.skeleton-img { aspect-ratio: 4/3; background: linear-gradient(90deg, #f0ede8 25%, #e8e4dc 50%, #f0ede8 75%); background-size: 200%; animation: skeleton 1.5s infinite; }
.skeleton-body { padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.skeleton-line {
  height: var(--h, 12px); border-radius: 6px;
  background: linear-gradient(90deg, #f0ede8 25%, #e8e4dc 50%, #f0ede8 75%);
  background-size: 200%; animation: skeleton 1.5s infinite;
}
.skeleton-line.w-200 { width: 200px; }
.skeleton-line.w-100 { width: 100px; }
.skeleton-line.w-80 { width: 80%; }
.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-40 { width: 40%; }
.skeleton-line.h-24 { height: 24px; }
.skeleton-line.h-18 { height: 18px; }
.skeleton-line.h-16 { height: 16px; }
.skeleton-line.h-12 { height: 12px; }
.skeleton-line.h-10 { height: 10px; }
@keyframes skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ───────────────────────────────────────── */
/* CATEGORIES SECTION */
/* ───────────────────────────────────────── */
.categories-section {
  padding: 60px 0;
  background: white;
  border-bottom: 1px solid var(--color-border);
}
.dark-mode .categories-section { background: #12121e; }

.section-head { text-align: center; margin-bottom: 40px; }
.section-tag {
  display: inline-block;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--color-teal);
  margin-bottom: 10px; display: block;
}
.dark-mode .section-tag { color: #2dd4bf; }

.section-title {
  font-family: 'Amiri', serif;
  font-size: 2rem; font-weight: 700;
  color: var(--color-dark); margin: 0 0 10px;
}
.dark-mode .section-title { color: #f0efe8; }
.section-title .highlight { color: var(--color-red); }
.section-desc { font-size: 0.9rem; color: var(--color-mid); margin: 0; }
.dark-mode .section-desc { color: #8a8a9a; }

.categories-row-wrap { display: flex; align-items: center; gap: 12px; }
.categories-row {
  display: flex; overflow-x: auto; gap: 20px;
  padding: 8px 4px; scrollbar-width: none; flex: 1;
  scroll-behavior: smooth; -webkit-overflow-scrolling: touch;
}
.categories-row::-webkit-scrollbar { display: none; }

.cat-nav {
  width: 42px; height: 42px;
  background: white; border: 1px solid #e8e4dc;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-teal); cursor: pointer; flex-shrink: 0;
  transition: all 0.25s ease; box-shadow: var(--shadow-sm);
}
.cat-nav:hover { background: var(--color-teal); color: white; }
.dark-mode .cat-nav { background: #1e1e30; border-color: #2a2a40; color: #2dd4bf; }
.dark-mode .cat-nav:hover { background: #2dd4bf; color: #12121e; }

.cat-card { flex: 0 0 155px; cursor: pointer; text-align: center; transition: all 0.35s ease; }
.cat-card:hover { transform: translateY(-6px); }

.cat-img-wrap {
  position: relative; width: 155px; height: 155px;
  border-radius: 20px; overflow: hidden;
  box-shadow: var(--shadow-md); margin-bottom: 12px;
}
.cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.cat-card:hover .cat-img-wrap img { transform: scale(1.07); }

.cat-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(8,113,127,0.35), rgba(212,0,37,0.35));
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.35s ease;
}
.cat-card:hover .cat-overlay { opacity: 1; }
.cat-icon { font-size: 2.5rem; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }

.cat-name {
  font-family: 'Amiri', serif;
  font-size: 1rem; font-weight: 700;
  color: var(--color-dark); margin: 0 0 3px;
}
.dark-mode .cat-name { color: #e0ddd6; }
.cat-count { font-size: 0.72rem; color: #94a3b8; }

/* ───────────────────────────────────────── */
/* FEED SECTION */
/* ───────────────────────────────────────── */
.feed-section {
  padding: 60px 0;
  background: #fafaf8;
}
.dark-mode .feed-section { background: #0f0f1a; }

.feed-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 32px; flex-wrap: wrap; gap: 20px;
}

.feed-filters {
  display: flex; gap: 6px;
  background: white; border: 1px solid #e8e4dc;
  border-radius: 40px; padding: 5px;
}
.dark-mode .feed-filters { background: #1e1e30; border-color: #2a2a40; }

.feed-filter-btn {
  padding: 8px 20px;
  background: none; border: none; border-radius: 32px;
  font-size: 0.85rem; font-weight: 600;
  color: var(--color-mid); cursor: pointer;
  transition: all 0.25s ease; font-family: inherit;
}
.dark-mode .feed-filter-btn { color: #8a8a9a; }
.feed-filter-btn.active { background: var(--color-teal); color: white; box-shadow: 0 3px 10px rgba(8,113,127,0.25); }

.feed-loading { display: flex; justify-content: center; padding: 80px; }
.loading-spinner {
  width: 40px; height: 40px;
  border: 2px solid rgba(8,113,127,0.1);
  border-top-color: var(--color-teal);
  border-right-color: var(--color-red);
  border-radius: 50%; animation: spinR 0.8s linear infinite;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

.product-card {
  background: white; border-radius: var(--radius-md);
  overflow: hidden; cursor: pointer;
  border: 1px solid var(--color-border);
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}
.dark-mode .product-card { background: #1e1e30; border-color: #2a2a40; }
.product-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }

.product-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f5f0; }
.product-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.product-card:hover .product-img-wrap img { transform: scale(1.06); }

.product-price-tag {
  position: absolute; bottom: 8px; right: 8px;
  padding: 5px 12px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  font-size: 0.82rem; font-weight: 800; color: var(--color-red);
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.feed-sponsored-badge {
  position: absolute; top: 8px; left: 8px;
  display: flex; align-items: center; gap: 3px;
  background: linear-gradient(135deg, var(--color-gold), #e8b54e);
  color: white; font-size: 0.56rem; font-weight: 800;
  padding: 3px 7px; border-radius: 10px;
  box-shadow: 0 2px 6px rgba(201,160,74,0.4);
  z-index: 2;
}

.product-actions {
  position: absolute; top: 8px; right: 8px;
  display: flex; flex-direction: column; gap: 6px;
  opacity: 0; transform: translateX(-6px);
  transition: all 0.25s ease;
}
.product-card:hover .product-actions { opacity: 1; transform: translateX(0); }

.pa-btn {
  width: 32px; height: 32px;
  background: white; border: none; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-dark); cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}
.pa-btn:hover { background: var(--color-teal); color: white; }
.pa-btn.active { background: var(--color-red); color: white; }

.product-info { padding: 12px; }
.product-vendor { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.product-vendor img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.product-vendor span { font-size: 0.7rem; color: #94a3b8; }

.product-name {
  font-size: 0.82rem; font-weight: 700; color: var(--color-dark);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.4; margin: 0;
}
.dark-mode .product-name { color: #e0ddd6; }

.reels-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 18px; }

.reel-card {
  background: white; border-radius: var(--radius-md); overflow: hidden; cursor: pointer;
  border: 1px solid var(--color-border); transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}
.dark-mode .reel-card { background: #1e1e30; border-color: #2a2a40; }
.reel-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }

.reel-video-wrap { position: relative; aspect-ratio: 9/16; overflow: hidden; background: #000; }
.reel-video { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.reel-card:hover .reel-video { transform: scale(1.04); }

.reel-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%);
  display: flex; flex-direction: column;
  justify-content: space-between; padding: 10px;
  opacity: 0; transition: opacity 0.3s ease;
}
.reel-card:hover .reel-overlay { opacity: 1; }

.reel-play {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 44px; height: 44px; background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.reel-stats {
  display: flex; gap: 10px; justify-content: flex-end;
  color: white; font-size: 0.72rem; font-weight: 600;
}
.reel-stats span { display: flex; align-items: center; gap: 3px; }

.reel-info { padding: 10px; display: flex; align-items: center; gap: 8px; }
.reel-info img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.reel-vendor { font-size: 0.7rem; color: #94a3b8; margin: 0; }
.reel-title { font-size: 0.8rem; font-weight: 700; color: var(--color-dark); margin: 2px 0 0; }
.dark-mode .reel-title { color: #e0ddd6; }

.feed-empty { text-align: center; padding: 80px; }
.feed-empty span { font-size: 2.5rem; display: block; margin-bottom: 12px; color: #cbd5e1; }
.feed-empty p { color: var(--color-mid); }

.feed-more { text-align: center; margin-top: 40px; }
.more-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 13px 34px;
  background: transparent;
  border: 1.5px solid var(--color-teal); border-radius: 40px;
  color: var(--color-teal); font-weight: 700; font-size: 0.95rem;
  cursor: pointer; font-family: inherit;
  transition: all var(--transition);
}
.more-btn:hover { background: var(--color-teal); color: white; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(8,113,127,0.2); }
.dark-mode .more-btn { border-color: #2dd4bf; color: #2dd4bf; }
.dark-mode .more-btn:hover { background: #2dd4bf; color: #0f0f1a; }

/* ───────────────────────────────────────── */
/* FEATURES BAR */
/* ───────────────────────────────────────── */
.features-bar {
  padding: 48px 0;
  background: white;
  border-top: 1px solid var(--color-border);
}
.dark-mode .features-bar { background: #12121e; }

.features-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px;
}

.feature-item { display: flex; align-items: center; gap: 16px; }
.feature-icon {
  width: 56px; height: 56px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-teal-light), rgba(212,0,37,0.04));
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-teal); transition: all var(--transition);
}
.feature-item:hover .feature-icon { background: var(--color-teal); color: white; transform: scale(1.05); }

.feature-text h4 {
  font-family: 'Amiri', serif;
  font-size: 1rem; font-weight: 700;
  color: var(--color-dark); margin: 0 0 3px;
}
.dark-mode .feature-text h4 { color: #f0efe8; }
.feature-text p { font-size: 0.78rem; color: var(--color-mid); margin: 0; }
.dark-mode .feature-text p { color: #8a8a9a; }

/* ───────────────────────────────────────── */
/* MODALS */
/* ───────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  z-index: 99999; padding: 24px;
}
.reel-overlay { background: rgba(0,0,0,0.92); }

.quick-modal {
  background: white; border-radius: var(--radius-xl);
  width: 100%; max-width: 860px;
  max-height: 85vh; overflow: hidden;
  position: relative;
  animation: modalIn 0.35s cubic-bezier(0.4,0,0.2,1);
}
.dark-mode .quick-modal { background: #1e1e30; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 38px; height: 38px;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(6px);
  border: none; border-radius: var(--radius-sm);
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: all 0.2s ease;
}
.modal-close:hover { background: var(--color-red); transform: rotate(90deg); }

.quick-modal-grid { display: grid; grid-template-columns: 1.1fr 1fr; }

.quick-modal-img { position: relative; overflow: hidden; max-height: 78vh; }
.quick-modal-img img { width: 100%; height: 100%; object-fit: cover; }

.modal-sp-tag {
  position: absolute; top: 14px; right: 14px;
  display: flex; align-items: center; gap: 5px;
  background: linear-gradient(135deg, var(--color-red), #ff4d6d);
  color: white; font-size: 0.72rem; font-weight: 700;
  padding: 5px 12px; border-radius: 18px;
  box-shadow: 0 3px 10px rgba(212,0,37,0.4); z-index: 5;
}

.quick-modal-info {
  padding: 28px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto; max-height: 78vh;
}

.modal-vendor-row { display: flex; align-items: center; gap: 10px; }
.modal-vendor-row img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(8,113,127,0.2); }
.modal-vendor-row strong { display: block; font-size: 0.88rem; color: var(--color-dark); font-weight: 700; }
.dark-mode .modal-vendor-row strong { color: #f0efe8; }
.modal-vendor-label { font-size: 0.7rem; color: var(--color-teal); display: block; }

.modal-product-title {
  font-family: 'Amiri', serif;
  font-size: 1.5rem; font-weight: 700;
  color: var(--color-dark); margin: 0; line-height: 1.3;
}
.dark-mode .modal-product-title { color: #f0efe8; }

.modal-product-desc {
  font-size: 0.85rem; color: var(--color-mid);
  line-height: 1.7; margin: 0;
}
.dark-mode .modal-product-desc { color: #8a8a9a; }

.modal-price-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.modal-price { font-size: 1.8rem; font-weight: 800; color: var(--color-red); }
.modal-old-price { font-size: 0.95rem; color: #94a3b8; text-decoration: line-through; }
.modal-discount {
  background: #fef2f2; color: var(--color-red);
  font-size: 0.75rem; font-weight: 700;
  padding: 2px 8px; border-radius: 15px;
}

.modal-actions { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }

.modal-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px;
  background: linear-gradient(135deg, var(--color-teal), var(--color-teal-dark));
  color: white; border: none; border-radius: var(--radius-sm);
  font-weight: 700; font-size: 0.9rem;
  cursor: pointer; font-family: inherit;
  transition: all var(--transition);
  box-shadow: 0 5px 14px rgba(8,113,127,0.28);
}
.modal-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(8,113,127,0.38); }

.modal-btn-secondary {
  padding: 13px; background: #f8f6f2;
  color: var(--color-dark); border: 1px solid #e8e4dc;
  border-radius: var(--radius-sm); font-weight: 600; font-size: 0.9rem;
  cursor: pointer; font-family: inherit;
  transition: all 0.25s ease;
}
.dark-mode .modal-btn-secondary { background: #2a2a40; color: #f0efe8; border-color: #3a3a55; }
.modal-btn-secondary:hover { background: #f0ede8; transform: translateY(-2px); }

.reel-modal {
  background: #000; border-radius: var(--radius-lg);
  width: 100%; max-width: 420px;
  max-height: 88vh; overflow: hidden;
  position: relative;
  animation: modalIn 0.3s ease;
}
.reel-modal-video { width: 100%; max-height: 65vh; object-fit: contain; background: #000; display: block; }
.reel-modal-info { padding: 18px; background: white; }
.dark-mode .reel-modal-info { background: #1e1e30; }
.reel-modal-info h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-dark); margin: 8px 0 4px; }
.dark-mode .reel-modal-info h3 { color: #f0efe8; }
.reel-modal-info p { font-size: 0.8rem; color: var(--color-mid); margin: 0; }
.reel-handle { font-size: 0.7rem; color: var(--color-teal); display: block; }

/* ───────────────────────────────────────── */
/* TOAST */
/* ───────────────────────────────────────── */
.toast-box {
  position: fixed; bottom: 28px; right: 28px;
  display: flex; align-items: center; gap: 10px;
  background: white; color: var(--color-dark);
  padding: 11px 20px 11px 16px; border-radius: 40px;
  font-weight: 600; font-size: 0.88rem;
  box-shadow: 0 10px 28px rgba(0,0,0,0.12);
  z-index: 99998; overflow: hidden;
}
.dark-mode .toast-box { background: #1e1e30; color: #f0efe8; }

.toast-icon-wrap {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.toast-icon-wrap.success { background: #10b981; }
.toast-icon-wrap.error { background: #ef4444; }
.toast-icon-wrap.info { background: var(--color-teal); }

.toast-bar {
  position: absolute; bottom: 0; left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-teal), var(--color-red));
  animation: toastBar 3s linear forwards;
}
@keyframes toastBar { from { width: 0; } to { width: 100%; } }

/* ───────────────────────────────────────── */
/* ALERTE VENDEUR UNIQUE */
/* ───────────────────────────────────────── */
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity 0.3s ease; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; }

.vendor-alert-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100000; padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.vendor-alert-card {
  max-width: 450px; width: 100%;
  background: #fff; border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.vendor-alert-card.dark-mode { background: #1e293b; }

.alert-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 24px 0 16px; text-align: center;
}
.dark-mode .alert-icon-wrapper { background: linear-gradient(135deg, #3b2e00, #2a2500); }

.alert-icon {
  font-size: 56px;
  animation: pulseWarning 0.6s ease-in-out;
}
@keyframes pulseWarning {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.alert-content { padding: 20px 24px 28px; position: relative; }

.alert-title {
  font-size: 1.3rem; font-weight: 800;
  color: #1e293b; text-align: center; margin-bottom: 12px;
}
.dark-mode .alert-title { color: #f1f5f9; }

.alert-message {
  font-size: 0.9rem; color: #475569;
  text-align: center; line-height: 1.6; margin-bottom: 20px;
}
.dark-mode .alert-message { color: #94a3b8; }

.alert-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 16px 0;
}
.dark-mode .alert-divider { background: linear-gradient(90deg, transparent, #334155, transparent); }

.alert-info {
  background: #f8fafc; border-radius: 16px;
  padding: 12px 16px; margin-bottom: 24px;
}
.dark-mode .alert-info { background: #0f172a; }

.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; font-size: 0.85rem;
}
.info-label { color: #64748b; font-weight: 500; }
.dark-mode .info-label { color: #94a3b8; }
.info-value { color: #1e293b; font-weight: 600; }
.dark-mode .info-value { color: #f1f5f9; }
.info-value.highlight { color: #d40025; }
.dark-mode .info-value.highlight { color: #ff6b6b; }
.info-value.highlight-warning { color: #f59e0b; }
.dark-mode .info-value.highlight-warning { color: #fbbf24; }

.alert-actions { display: flex; gap: 12px; margin-top: 8px; }

.alert-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 20px; border: none; border-radius: 40px;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s ease; font-family: inherit;
}
.alert-btn.primary { background: linear-gradient(135deg, #d40025, #b00020); color: white; }
.alert-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 0, 37, 0.3); }
.alert-btn.secondary { background: #f1f5f9; color: #64748b; }
.dark-mode .alert-btn.secondary { background: #334155; color: #94a3b8; }
.alert-btn.secondary:hover { background: #e2e8f0; }
.dark-mode .alert-btn.secondary:hover { background: #475569; color: #f1f5f9; }

.alert-close {
  position: absolute; top: 16px; left: 16px;
  width: 32px; height: 32px;
  background: rgba(241, 245, 249, 0.9); border: none; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.dark-mode .alert-close { background: rgba(51, 65, 85, 0.9); color: #94a3b8; }
.alert-close:hover { background: #d40025; color: white; transform: rotate(90deg); }

/* ───────────────────────────────────────── */
/* TRANSITIONS */
/* ───────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.28s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.3s ease; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateX(24px); }

/* ───────────────────────────────────────── */
/* REDUCED MOTION */
/* ───────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ───────────────────────────────────────── */
/* RESPONSIVE */
/* ───────────────────────────────────────── */
@media (max-width: 1280px) {
  .products-grid, .reels-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1024px) {
  .products-grid, .reels-grid { grid-template-columns: repeat(3, 1fr); }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-modal-grid { grid-template-columns: 1fr; }
  .quick-modal-img { max-height: 300px; }
  .hero-center-tagline p { font-size: 2rem; }
  .hero-center-tagline p:last-child { font-size: 1.8rem; }
}

@media (max-width: 768px) {
  .container, .sp-container { padding: 0 20px; }
  .hero-section { height: 85vh; min-height: 480px; }
  .hero-nav { display: none; }
  .hero-vendor-card { display: none; }
  .hero-center-tagline { width: 94%; }
  .hero-center-tagline p { font-size: 1.5rem; line-height: 1.7; }
  .hero-center-tagline p:last-child { font-size: 1.35rem; }

  .sp-header { flex-direction: column; align-items: flex-start; }
  .sp-header-right { width: 100%; justify-content: space-between; }
  .sp-card { flex: 0 0 148px; }

  .categories-section { padding: 40px 0; }
  .cat-card { flex: 0 0 130px; }
  .cat-img-wrap { width: 130px; height: 130px; border-radius: 16px; }
  .cat-nav { display: none; }

  .products-grid, .reels-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .feed-header { flex-direction: column; align-items: flex-start; gap: 14px; }
  .feed-filters { width: 100%; justify-content: center; }
  .features-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .feature-icon { width: 46px; height: 46px; }

  .modal-overlay { padding: 0; align-items: flex-end; }
  .quick-modal { border-radius: 22px 22px 0 0; max-height: 90vh; max-width: 100%; }
  .quick-modal-grid { grid-template-columns: 1fr; overflow-y: auto; max-height: 85vh; }
  .quick-modal-img { max-height: 260px; }
  .quick-modal-info { padding: 20px; max-height: none; }
  .modal-product-title { font-size: 1.2rem; }

  .scroll-top-btn { bottom: 20px; right: 18px; width: 42px; height: 42px; }
  .toast-box { right: 12px; left: 12px; bottom: 16px; border-radius: 30px; }
}

@media (max-width: 480px) {
  .hero-section { height: 80vh; min-height: 380px; }
  .hero-center-tagline p { font-size: 1.15rem; line-height: 1.65; }
  .hero-center-tagline p:last-child { font-size: 1.05rem; }

  .sp-card { flex: 0 0 138px; }
  .sp-card-body { padding: 8px 9px; }
  .cat-card { flex: 0 0 112px; }
  .cat-img-wrap { width: 112px; height: 112px; border-radius: 14px; }
  .products-grid, .reels-grid { gap: 10px; }
  .features-grid { grid-template-columns: 1fr; gap: 14px; }
  .section-title { font-size: 1.6rem; }
  .feed-filter-btn { padding: 7px 14px; font-size: 0.8rem; }

  .vendor-alert-card { max-width: calc(100% - 20px); }
  .alert-actions { flex-direction: column; }
  .alert-content { padding: 16px 20px 22px; }
  .alert-title { font-size: 1.1rem; }
  .info-row { flex-direction: column; align-items: flex-start; gap: 4px; }
}

/* iOS safe area */
@supports (-webkit-touch-callout: none) {
  .hero-section { height: -webkit-fill-available; }
  .quick-modal { padding-bottom: env(safe-area-inset-bottom, 16px); }
  .scroll-top-btn { bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
  .toast-box { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
}
</style>
