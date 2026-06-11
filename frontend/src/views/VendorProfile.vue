<!-- src/views/VendorProfile.vue - Version finale 100% fonctionnelle -->
<template>
  <div class="vendor-profile-page" dir="rtl">

    <!-- ===== LOADING ===== -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>جاري تحميل الملف الشخصي...</p>
      </div>
    </div>

    <template v-else-if="vendor">
      <div class="app-layout">

        <!-- ===== SIDEBAR ===== -->
        <nav v-if="isCurrentUser" class="sidebar" :class="{ collapsed: sidebarCollapsed }">
          <div class="sidebar-logo">
            <div class="logo-icon">🛍</div>
            <span class="logo-text" v-if="!sidebarCollapsed">حرفتي</span>
          </div>

          <div class="sidebar-section" v-if="!sidebarCollapsed">القائمة</div>
          <div class="sidebar-item" :class="{ active: activeView === 'profile' }" @click="setView('profile')">
            <span class="s-icon">👤</span>
            <span v-if="!sidebarCollapsed">الملف الشخصي</span>
          </div>
          <div class="sidebar-item" @click="goToEditProfile">
            <span class="s-icon">✏️</span>
            <span v-if="!sidebarCollapsed">تعديل الملف</span>
          </div>
          <div class="sidebar-item" :class="{ active: activeView === 'orders' }" @click="setView('orders')">
            <span class="s-icon">📦</span>
            <span v-if="!sidebarCollapsed">الطلبات</span>
            <span class="sidebar-badge" v-if="!sidebarCollapsed && pendingOrdersCount > 0">{{ pendingOrdersCount }}</span>
          </div>
          <div class="sidebar-item" :class="{ active: activeView === 'stats' }" @click="setView('stats')">
            <span class="s-icon">📈</span>
            <span v-if="!sidebarCollapsed">الإحصائيات</span>
          </div>
          <div class="sidebar-item" :class="{ active: activeView === 'inbox' }" @click="setView('inbox')">
            <span class="s-icon">📥</span>
            <span v-if="!sidebarCollapsed">البريد الوارد</span>
            <span class="sidebar-badge" v-if="!sidebarCollapsed && unreadMessages > 0">{{ unreadMessages }}</span>
          </div>

          <div class="sidebar-collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
            {{ sidebarCollapsed ? '◀' : '▶' }}
          </div>
        </nav>

        <!-- ===== MAIN CONTENT ===== -->
        <div class="main-content" :class="{ 'full-width': !isCurrentUser }">

          <!-- Vendor Cart Info Bar -->
          <div v-if="!isCurrentUser && currentCartVendorId && cartItemsCount > 0" class="vendor-cart-info-bar">
            <div class="cart-info-content">
              <span class="cart-icon">🛒</span>
              <span class="cart-text">سلة التسوق: <strong>{{ cartItemsCount }}</strong> منتج | المجموع: <strong>{{ formatPrice(cartTotal) }} د.ت</strong></span>
              <span class="cart-vendor">من <strong>{{ currentCartVendorName }}</strong></span>
              <button class="btn-view-cart" @click="openCart">عرض السلة</button>
              <button class="btn-clear-cart" @click="clearCart" title="تفريغ السلة">🗑️</button>
            </div>
          </div>

          <!-- ===================== VIEW: PROFILE ===================== -->
          <div v-if="activeView === 'profile'" class="view-content" :class="{ 'no-header': !isCurrentUser }">
            <!-- Cover Photo -->
            <div class="cover-photo-container">
              <div class="cover-photo-wrapper">
                <img :src="getCoverImage()" alt="صورة الغلاف" class="cover-photo" @error="handleCoverImageError" :key="coverImageKey" />
                <div class="cover-overlay-gradient"></div>
                <button v-if="isCurrentUser" class="change-cover-btn" @click="openCoverUpload">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span>تغيير الغلاف</span>
                </button>
              </div>
              <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverFileChange" />
              <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarFileChange" />
            </div>

            <!-- Profile Header -->
            <div class="profile-header">
              <div class="profile-avatar-section">
                <div class="avatar-container">
                  <img :src="getAvatarImage()" :alt="vendor.shopName" class="profile-avatar" @error="handleAvatarImageError" :key="avatarKey" />
                  <button v-if="isCurrentUser" class="avatar-edit-btn" @click="openAvatarUpload" title="تغيير الصورة">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
                  </button>
                  <div v-if="vendor.verified" class="verified-badge-instagram">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                </div>
              </div>

              <div class="profile-info-section">
                <div class="profile-actions-row">
                  <h1 class="profile-username">{{ vendor.shopName || vendor.shop_name }}</h1>
                  <div class="action-buttons">
                    <template v-if="isCurrentUser">
                      <button class="btn-edit-profile" @click="goToEditProfile">✏️ تعديل الملف</button>
                      <button class="btn-share-profile" @click="shareProfile" title="مشاركة الملف">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn-follow" :class="{ following: isFollowing }" @click="toggleFollow">
                        <span v-if="isFollowing">✓ تتابع</span><span v-else>+ متابعة</span>
                      </button>
                      <button class="btn-message-instagram" @click="contactVendor" title="إرسال رسالة">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </button>
                      <button class="btn-share-profile" @click="shareProfile" title="مشاركة">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      </button>
                    </template>
                  </div>
                </div>

                <div class="profile-stats-instagram">
                  <div class="stat-item" @click="scrollToPosts">
                    <span class="stat-number">{{ vendorPosts.length }}</span>
                    <span class="stat-label">منشورات</span>
                  </div>
                  <div class="stat-item" @click="showFollowersModal = true">
                    <span class="stat-number">{{ followers.length }}</span>
                    <span class="stat-label">متابعون</span>
                  </div>
                  <div class="stat-item" @click="showFollowingModal = true">
                    <span class="stat-number">{{ following.length }}</span>
                    <span class="stat-label">يتابع</span>
                  </div>
                  <div class="stat-item stat-purchase-rate" @click="goToReviews">
                    <div class="stars-display-green">
                      <div class="stars-row-big">
                        <span v-for="s in 5" :key="s" :class="s <= Math.round(vendorAvgRating) ? 'star-filled-green' : 'star-empty-green'">★</span>
                      </div>
                      <div class="rating-stats">
                        <span class="stat-number rating-number">{{ vendorAvgRating.toFixed(1) }}</span>
                        <span class="stat-label">تقييم ({{ totalReviewsCount }})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="profile-bio-instagram">
                  <div class="bio-name">{{ vendor.name || vendor.userName || vendor.user_name }}</div>
                  <div class="bio-text">{{ vendor.description || 'لا يوجد وصف بعد' }}</div>
                  <div class="bio-link" v-if="vendor.website">
                    <a :href="vendor.website" target="_blank">🔗 {{ vendor.website }}</a>
                  </div>
                  <div class="bio-meta">
                    <span v-if="vendor.location">📍 {{ vendor.location }}</span>
                    <span v-if="vendor.phone">📞 {{ vendor.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Create Post -->
            <div v-if="isCurrentUser" class="facebook-create-post-section">
              <div class="facebook-post-card">
                <div class="facebook-post-header">
                  <img :src="getAvatarImage()" alt="Avatar" class="facebook-avatar" />
                  <button class="facebook-post-button" @click="openCreatePostModal">ما الذي يدور في ذهنك يا {{ vendor.shopName }}؟</button>
                </div>
                <div class="facebook-post-actions">
                  <button class="facebook-action-btn" @click="openCreatePostModal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>صورة/فيديو</span>
                  </button>
                  <button class="facebook-action-btn" @click="openCreatePostModal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    <span>منتج</span>
                  </button>
                  <button class="facebook-action-btn" @click="openCreatePostModal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>عرض خاص</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Posts Filter -->
            <div v-if="isCurrentUser && vendorPosts.length > 0" class="posts-filter-bar">
              <button class="filter-pill" :class="{ active: postsFilter === 'all' }" @click="postsFilter = 'all'">الكل ({{ vendorPosts.length }})</button>
              <button class="filter-pill" :class="{ active: postsFilter === 'pinned' }" @click="postsFilter = 'pinned'">📌 المثبتة ({{ pinnedCount }})</button>
              <button class="filter-pill" :class="{ active: postsFilter === 'available' }" @click="postsFilter = 'available'">متاح</button>
            </div>

            <!-- Posts Grid -->
            <div class="posts-grid-instagram" ref="postsSection">
              <div v-if="filteredPosts.length > 0" class="instagram-grid">
                <div v-for="post in filteredPosts" :key="post.id" class="grid-post" @click="openPostModal(post)">
                  <div class="post-image-container">
                    <img :src="getPostImage(post)" :alt="post.productName" class="grid-post-image" @error="handlePostImageError" />
                    <button class="grid-wishlist-btn" :class="{ active: isPostInWishlist(post.id) }" @click.stop="togglePostWishlist(post)" title="إضافة للمفضلة">
                      <svg viewBox="0 0 24 24" :fill="isPostInWishlist(post.id) ? '#ef4444' : 'none'" stroke="white" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    <button class="grid-cart-btn" @click.stop="addToCartFromGrid(post)" :disabled="post.quantity === 0" title="إضافة للسلة">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                    <div class="post-overlay-instagram">
                      <div class="post-stats">
                        <div class="stat"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><span>{{ post.likes || 0 }}</span></div>
                        <div class="stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>{{ post.commentsCount || 0 }}</span></div>
                        <div class="stat post-price-overlay">{{ formatPrice(post.price) }} د.ت</div>
                      </div>
                    </div>
                    <div class="post-rating-badge" v-if="getPostRating(post.id) > 0">
                      <span class="post-rating-star">⭐</span>
                      <span class="post-rating-value">{{ getPostRating(post.id).toFixed(1) }}</span>
                      <span class="post-rating-count">({{ getPostReviewCount(post.id) }})</span>
                    </div>
                    <div v-if="post.isPinned" class="pinned-badge-instagram" title="منشور مثبت">📌</div>
                    <div v-if="post.quantity === 0" class="out-of-stock-badge">نفد المخزون</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="60" height="60"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                <p>لا توجد منشورات بعد</p>
                <button v-if="isCurrentUser" class="btn-create-instagram" @click="openCreatePostModal">+ أنشئ أول منشور</button>
              </div>
            </div>
          </div>
          <!-- END PROFILE VIEW -->

          <!-- ===================== VIEW: ORDERS ===================== -->
          <div v-if="activeView === 'orders'" class="view-content orders-view">
            <div class="orders-page-header">
              <h2>📦 إدارة الطلبات</h2>
              <div class="header-actions">
                <button class="btn-export" @click="exportOrders" title="تصدير CSV">📥 تصدير</button>
                <button class="btn-refresh" @click="loadVendorOrders" :disabled="ordersLoading">
                  {{ ordersLoading ? '⏳' : '🔄' }} {{ ordersLoading ? 'جاري التحميل...' : 'تحديث' }}
                </button>
              </div>
            </div>

            <div class="stats-cards">
              <div class="stat-card-order pending" @click="orderStatusFilter = 'pending'">
                <span class="stat-icon">⏳</span>
                <div class="stat-info"><span class="stat-value">{{ getOrdersStatusCount('pending') }}</span><span class="stat-label">قيد الانتظار</span></div>
              </div>
              <div class="stat-card-order processing" @click="orderStatusFilter = 'processing'">
                <span class="stat-icon">⚙️</span>
                <div class="stat-info"><span class="stat-value">{{ getOrdersStatusCount('processing') }}</span><span class="stat-label">قيد المعالجة</span></div>
              </div>
              <div class="stat-card-order shipped" @click="orderStatusFilter = 'shipped'">
                <span class="stat-icon">📦</span>
                <div class="stat-info"><span class="stat-value">{{ getOrdersStatusCount('shipped') }}</span><span class="stat-label">تم الشحن</span></div>
              </div>
              <div class="stat-card-order delivered" @click="orderStatusFilter = 'delivered'">
                <span class="stat-icon">✅</span>
                <div class="stat-info"><span class="stat-value">{{ getOrdersStatusCount('delivered') }}</span><span class="stat-label">تم التوصيل</span></div>
              </div>
              <div class="stat-card-order cancelled" @click="orderStatusFilter = 'cancelled'">
                <span class="stat-icon">❌</span>
                <div class="stat-info"><span class="stat-value">{{ getOrdersStatusCount('cancelled') }}</span><span class="stat-label">ملغي</span></div>
              </div>
            </div>

            <div class="filters-bar">
              <select v-model="orderStatusFilter" class="filter-select">
                <option value="all">جميع الحالات ({{ vendorOrders.length }})</option>
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغي</option>
              </select>
              <input v-model="orderSearchQuery" type="text" placeholder="🔍 بحث بالاسم أو رقم الطلب..." class="search-input" />
              <button v-if="orderStatusFilter !== 'all' || orderSearchQuery" class="btn-clear-filter" @click="orderStatusFilter = 'all'; orderSearchQuery = ''">✕ مسح الفلتر</button>
            </div>

            <div v-if="ordersLoading" class="loading-state-inline">
              <div class="spinner-ring small"></div>
              <p>جاري تحميل الطلبات...</p>
            </div>
            <div v-else-if="filteredVendorOrders.length > 0" class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in filteredVendorOrders" :key="order.id" :class="{ 'row-pending': order.status === 'pending' }">
                    <td data-label="رقم الطلب"><strong>#{{ order.id || order.orderNumber }}</strong></td>
                    <td data-label="العميل">{{ order.customerName || order.customer_name || order.user?.name || 'عميل' }}</td>
                    <td data-label="التاريخ">{{ formatOrderDate(order.createdAt || order.created_at) }}</td>
                    <td data-label="المبلغ" class="price-cell">{{ formatPrice(order.total) }} د.ت</td>
                    <td data-label="الحالة">
                      <select v-model="order.status" class="status-select" :class="order.status" @focus="order._previousStatus = order.status" @change="updateVendorOrderStatus(order, order._previousStatus)">
                        <option value="pending">⏳ قيد الانتظار</option>
                        <option value="processing">⚙️ قيد المعالجة</option>
                        <option value="shipped">📦 تم الشحن</option>
                        <option value="delivered">✅ تم التوصيل</option>
                        <option value="cancelled">❌ ملغي</option>
                      </select>
                    </td>
                    <td data-label="الإجراءات">
                      <div class="row-actions">
                        <button class="action-btn view" @click="viewVendorOrder(order)" title="عرض التفاصيل">👁️ تفاصيل</button>
                        <button class="action-btn print" @click="printOrder(order)" title="طباعة">🖨️</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>لا توجد طلبات</h3>
              <p>لم يتم العثور على طلبات تطابق البحث</p>
              <button class="btn-clear-filter" @click="orderStatusFilter = 'all'; orderSearchQuery = ''">عرض جميع الطلبات</button>
            </div>
          </div>

          <!-- ===================== VIEW: STATS ===================== -->
          <div v-if="activeView === 'stats'" class="view-content stats-view">
            <h2>📊 الإحصائيات</h2>
            <div class="stats-overview-grid">
              <div class="overview-card blue">
                <div class="overview-icon">💰</div>
                <div class="overview-info">
                  <div class="overview-value">{{ formatPrice(totalRevenue) }} د.ت</div>
                  <div class="overview-label">إجمالي الإيرادات</div>
                </div>
              </div>
              <div class="overview-card green">
                <div class="overview-icon">📦</div>
                <div class="overview-info">
                  <div class="overview-value">{{ vendorOrders.length }}</div>
                  <div class="overview-label">إجمالي الطلبات</div>
                </div>
              </div>
              <div class="overview-card orange">
                <div class="overview-icon">👥</div>
                <div class="overview-info">
                  <div class="overview-value">{{ followers.length }}</div>
                  <div class="overview-label">المتابعون</div>
                </div>
              </div>
              <div class="overview-card purple">
                <div class="overview-icon">🛍</div>
                <div class="overview-info">
                  <div class="overview-value">{{ vendorPosts.length }}</div>
                  <div class="overview-label">المنتجات</div>
                </div>
              </div>
              <div class="overview-card teal">
                <div class="overview-icon">⭐</div>
                <div class="overview-info">
                  <div class="overview-value">{{ vendorAvgRating.toFixed(1) }}</div>
                  <div class="overview-label">متوسط التقييم</div>
                </div>
              </div>
              <div class="overview-card red">
                <div class="overview-icon">🎯</div>
                <div class="overview-info">
                  <div class="overview-value">{{ purchaseRate }}%</div>
                  <div class="overview-label">معدل التحويل</div>
                </div>
              </div>
            </div>

            <div class="top-products-section">
              <h3>المنتجات الأكثر مبيعاً</h3>
              <div class="top-products-list">
                <div v-for="(post, i) in topProducts" :key="post.id" class="top-product-item">
                  <span class="rank-badge" :class="['rank-' + (i+1)]">{{ i + 1 }}</span>
                  <img :src="getPostImage(post)" :alt="post.productName" class="top-product-img" @error="handlePostImageError" />
                  <div class="top-product-info">
                    <div class="top-product-name">{{ post.productName }}</div>
                    <div class="top-product-stats">{{ formatPrice(post.price) }} د.ت &nbsp;·&nbsp; ❤️ {{ post.likes || 0 }}</div>
                  </div>
                  <button class="btn-view-product" @click="openPostModal(post)">عرض</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ===================== VIEW: INBOX ===================== -->
          <div v-if="activeView === 'inbox'" class="view-content inbox-view">
            <div class="inbox-header">
              <h2>📥 البريد الوارد</h2>
              <button class="btn-mark-all-read" @click="markAllAsRead" :disabled="inboxMessages.length === 0">تحديد الكل كمقروء</button>
            </div>
            <div class="messages-list">
              <div v-for="msg in inboxMessages" :key="msg.id" class="message-item" :class="{ unread: !msg.read }" @click="openMessage(msg)">
                <img :src="msg.avatar" alt="" class="msg-avatar" />
                <div class="msg-content">
                  <div class="msg-top">
                    <span class="msg-sender">{{ msg.sender }}</span>
                    <span class="msg-time">{{ formatDate(msg.time) }}</span>
                  </div>
                  <div class="msg-preview">{{ msg.preview }}</div>
                </div>
                <div class="msg-unread-dot" v-if="!msg.read"></div>
              </div>
            </div>
            <div v-if="inboxMessages.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>لا توجد رسائل</h3>
            </div>
          </div>

        </div>
        <!-- END MAIN CONTENT -->
      </div>

      <!-- ===== MODALS ===== -->

      <!-- Post Modal -->
      <Teleport to="body">
        <div v-if="selectedPost" class="post-modal-overlay" @click.self="closePostModal">
          <div class="post-modal-container">
            <button class="close-modal-btn" @click="closePostModal">✕</button>
            <div class="post-modal-content">
              <div class="post-modal-image">
                <img :src="getPostImage(selectedPost, currentImageIndex)" :alt="selectedPost.productName" @error="handlePostImageError" />
                <div v-if="selectedPost.images?.length > 1" class="image-navigation">
                  <button class="nav-btn prev" @click="prevPostImage">❮</button>
                  <button class="nav-btn next" @click="nextPostImage">❯</button>
                </div>
                <div v-if="selectedPost.images?.length > 1" class="image-dots">
                  <span v-for="(_, idx) in selectedPost.images" :key="idx" class="image-dot" :class="{ active: currentImageIndex === idx }" @click="currentImageIndex = idx"></span>
                </div>
              </div>
              <div class="post-modal-info">
                <div class="modal-post-header">
                  <img :src="getAvatarImage()" class="modal-avatar" />
                  <div class="modal-author">
                    <span class="author-name">{{ vendor.shopName || vendor.shop_name }}</span>
                    <span class="author-handle">@{{ vendor.slug || vendor.id }}</span>
                  </div>
                  <button v-if="isCurrentUser" class="modal-menu-btn" @click.stop="togglePostMenu(selectedPost.id)">⋯</button>
                  <div v-if="activePostMenu === selectedPost.id && isCurrentUser" class="post-menu-inline">
                    <button class="menu-item" @click="togglePinPost(selectedPost)">{{ selectedPost.isPinned ? '📌 إلغاء التثبيت' : '📌 تثبيت المنشور' }}</button>
                    <button class="menu-item" @click="openEditPostModal(selectedPost)">✏️ تعديل</button>
                    <button class="menu-item delete" @click="confirmDeletePost(selectedPost)">🗑️ حذف</button>
                  </div>
                </div>
                <div class="modal-post-caption">
                  <h3>{{ selectedPost.productName }}</h3>
                  <p>{{ selectedPost.description || 'لا يوجد وصف' }}</p>
                  <div class="stock-info">
                    <span :class="(selectedPost.quantity || 0) > 0 ? 'in-stock' : 'out-stock'">
                      {{ (selectedPost.quantity || 0) > 0 ? '✓ متوفر' : '✗ غير متوفر' }}
                    </span>
                  </div>
                </div>
                <div class="modal-post-price">
                  <span class="current-price">{{ formatPrice(selectedPost.price) }} د.ت</span>
                  <span v-if="selectedPost.oldPrice" class="old-price">{{ formatPrice(selectedPost.oldPrice) }} د.ت</span>
                  <span v-if="selectedPost.oldPrice" class="discount-badge">-{{ Math.round((1 - selectedPost.price / selectedPost.oldPrice) * 100) }}%</span>
                </div>
                <div class="modal-post-actions">
                  <button class="action-btn like-btn" @click="togglePostLike(selectedPost)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'liked': isPostLikedByStore(selectedPost.id) }"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>{{ selectedPost.likes || 0 }}</span>
                  </button>
                  <button class="action-btn comment-btn" @click="focusComment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>{{ selectedPost.commentsCount || 0 }}</span>
                  </button>
                  <button class="action-btn share-btn" @click="sharePost(selectedPost)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  </button>
                  <button class="action-btn wishlist-btn" @click="togglePostWishlist(selectedPost)">
                    <svg viewBox="0 0 24 24" :fill="isPostInWishlist(selectedPost.id) ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </button>
                  <button v-if="(selectedPost.quantity || 0) !== 0" class="action-btn buy-btn-modal" @click="buyProduct(selectedPost)">شراء</button>
                </div>
                <div class="modal-post-comments">
                  <div class="comments-list">
                    <div v-if="postComments.length === 0" class="no-comments">لا توجد تعليقات بعد. كن أول من يعلق!</div>
                    <div v-for="comment in postComments" :key="comment.id" class="comment-item">
                      <span class="comment-author">{{ comment.userName }}:</span>
                      <span class="comment-text">{{ comment.text }}</span>
                    </div>
                  </div>
                  <div class="comment-input-wrapper">
                    <input ref="commentInput" v-model="newComment" type="text" class="comment-input" placeholder="أضف تعليقاً..." @keyup.enter="addComment" />
                    <button class="post-comment-btn" @click="addComment" :disabled="!newComment.trim()">نشر</button>
                  </div>
                </div>
                <div class="modal-post-date">{{ formatDate(selectedPost.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Followers Modal -->
      <Teleport to="body">
        <div v-if="showFollowersModal" class="followers-modal-overlay" @click.self="showFollowersModal = false">
          <div class="followers-modal">
            <div class="followers-modal-header">
              <h3>المتابعون</h3>
              <button class="modal-close-btn" @click="showFollowersModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="followers-list">
                <div v-for="follower in followers" :key="follower.id" class="follower-item">
                  <img :src="follower.avatar" class="follower-avatar" />
                  <div class="follower-info">
                    <span class="follower-name">{{ follower.name }}</span>
                    <span class="follower-username">@{{ follower.username }}</span>
                  </div>
                  <button v-if="follower.isFollowing" class="btn-unfollow" @click="unfollowUser(follower)">إلغاء المتابعة</button>
                  <button v-else class="btn-follow-action" @click="followUser(follower)">متابعة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Following Modal -->
      <Teleport to="body">
        <div v-if="showFollowingModal" class="followers-modal-overlay" @click.self="showFollowingModal = false">
          <div class="followers-modal">
            <div class="followers-modal-header">
              <h3>يتابع</h3>
              <button class="modal-close-btn" @click="showFollowingModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="followers-list">
                <div v-for="user in following" :key="user.id" class="follower-item">
                  <img :src="user.avatar" class="follower-avatar" />
                  <div class="follower-info">
                    <span class="follower-name">{{ user.name }}</span>
                    <span class="follower-username">@{{ user.username }}</span>
                  </div>
                  <button class="btn-unfollow" @click="unfollowUser(user)">إلغاء المتابعة</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Order Details Modal -->
      <Teleport to="body">
        <div v-if="showVendorOrderModal" class="followers-modal-overlay" @click.self="showVendorOrderModal = false">
          <div class="followers-modal order-modal">
            <div class="followers-modal-header">
              <h3>تفاصيل الطلب #{{ selectedVendorOrder?.orderNumber || selectedVendorOrder?.id }}</h3>
              <div class="modal-header-actions">
                <button class="modal-action-btn" @click="printOrder(selectedVendorOrder)" title="طباعة">🖨️</button>
                <button class="modal-close-btn" @click="showVendorOrderModal = false">✕</button>
              </div>
            </div>
            <div class="modal-body">
              <div class="order-info-card">
                <div class="info-row"><span class="info-label">العميل:</span><span class="info-value">{{ selectedVendorOrder?.customerName || 'غير محدد' }}</span></div>
                <div class="info-row"><span class="info-label">الهاتف:</span><span class="info-value">{{ selectedVendorOrder?.customerPhone || 'غير متوفر' }}</span></div>
                <div class="info-row"><span class="info-label">البريد الإلكتروني:</span><span class="info-value">{{ selectedVendorOrder?.customerEmail || 'غير متوفر' }}</span></div>
                <div class="info-row"><span class="info-label">عنوان التوصيل:</span><span class="info-value">{{ selectedVendorOrder?.shippingAddress || 'غير محدد' }}</span></div>
                <div class="info-row"><span class="info-label">تاريخ الطلب:</span><span class="info-value">{{ formatOrderDate(selectedVendorOrder?.createdAt) }}</span></div>
                <div class="info-row"><span class="info-label">الحالة:</span><span class="info-value"><span :class="['status-badge', selectedVendorOrder?.status]">{{ getOrderStatusText(selectedVendorOrder?.status) }}</span></span></div>
              </div>
              <div class="order-items-section">
                <h4>المنتجات</h4>
                <table class="items-table">
                  <thead>
                    <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in (selectedVendorOrder?.items || [])" :key="idx">
                      <td>{{ item.productName || item.name }}</td>
                      <td>{{ item.quantity || 1 }}</td>
                      <td>{{ formatPrice(item.price) }} د.ت</td>
                      <td>{{ formatPrice((item.price || 0) * (item.quantity || 1)) }} د.ت</td>
                    </tr>
                    <tr class="total-row"><td colspan="3"><strong>المجموع الكلي</strong></td><td class="total-price"><strong>{{ formatPrice(selectedVendorOrder?.total) }} د.ت</strong></td></tr>
                  </tbody>
                </table>
              </div>
              <div class="modal-footer-actions">
                <select v-model="selectedVendorOrder.status" class="status-select" :class="selectedVendorOrder?.status" @focus="selectedVendorOrder._previousStatus = selectedVendorOrder.status" @change="updateVendorOrderStatus(selectedVendorOrder, selectedVendorOrder._previousStatus)">
                  <option value="pending">⏳ قيد الانتظار</option>
                  <option value="processing">⚙️ قيد المعالجة</option>
                  <option value="shipped">📦 تم الشحن</option>
                  <option value="delivered">✅ تم التوصيل</option>
                  <option value="cancelled">❌ ملغي</option>
                </select>
                <button class="btn-cancel" @click="showVendorOrderModal = false">إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Message Modal -->
      <Teleport to="body">
        <div v-if="selectedMessage" class="followers-modal-overlay" @click.self="selectedMessage = null">
          <div class="followers-modal order-modal">
            <div class="followers-modal-header">
              <h3>رسالة من {{ selectedMessage.sender }}</h3>
              <button class="modal-close-btn" @click="selectedMessage = null">✕</button>
            </div>
            <div class="modal-body">
              <div class="full-message">{{ selectedMessage.fullText }}</div>
              <textarea v-model="replyText" class="reply-textarea" rows="3" placeholder="اكتب ردك..."></textarea>
              <div class="modal-footer-actions">
                <button class="btn-save" @click="sendReply">إرسال الرد</button>
                <button class="btn-cancel" @click="selectedMessage = null">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Edit Post Modal -->
      <Teleport to="body">
        <div v-if="showEditModal" class="edit-modal-overlay" @click.self="closeEditModal">
          <div class="edit-modal">
            <div class="edit-modal-header">
              <h3>✏️ تعديل المنتج</h3>
              <button class="edit-modal-close" @click="closeEditModal">✕</button>
            </div>
            <div class="edit-modal-body">
              <div class="edit-form-group">
                <label class="edit-form-label">اسم المنتج</label>
                <input v-model="editForm.productName" type="text" class="edit-form-input" maxlength="50" />
              </div>
              <div class="edit-form-row">
                <div class="edit-form-group">
                  <label class="edit-form-label">السعر (د.ت)</label>
                  <input v-model.number="editForm.price" type="number" step="0.001" class="edit-form-input" />
                </div>
                <div class="edit-form-group">
                  <label class="edit-form-label">الكمية</label>
                  <input v-model.number="editForm.quantity" type="number" class="edit-form-input" />
                </div>
              </div>
              <div class="edit-form-group">
                <label class="edit-form-label">الوصف</label>
                <textarea v-model="editForm.description" rows="3" class="edit-form-textarea" maxlength="200"></textarea>
                <span class="char-count">{{ editForm.description.length }}/200</span>
              </div>
            </div>
            <div class="edit-modal-footer">
              <button class="btn-cancel" @click="closeEditModal">إلغاء</button>
              <button class="btn-save" @click="saveEditedPost" :disabled="isSaving || !editForm.productName.trim() || !editForm.price">{{ isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div v-if="showDeleteConfirm" class="confirm-modal-overlay" @click.self="cancelDelete">
          <div class="confirm-modal">
            <div class="confirm-icon">🗑️</div>
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف "{{ postToDelete?.productName }}"؟<br>لا يمكن التراجع عن هذا الإجراء.</p>
            <div class="confirm-modal-actions">
              <button class="btn-delete-confirm" @click="executeDelete" :disabled="isDeleting">{{ isDeleting ? 'جاري الحذف...' : 'نعم، احذف' }}</button>
              <button class="btn-cancel" @click="cancelDelete">إلغاء</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Logout Confirmation Modal -->
      <Teleport to="body">
        <div v-if="showLogoutConfirm" class="confirm-modal-overlay" @click.self="showLogoutConfirm = false">
          <div class="confirm-modal">
            <div class="confirm-icon">🚪</div>
            <h3>تسجيل الخروج</h3>
            <p>هل أنت متأكد من رغبتك في تسجيل الخروج؟</p>
            <div class="confirm-modal-actions">
              <button class="btn-delete-confirm" @click="doLogout">نعم، تسجيل خروج</button>
              <button class="btn-cancel" @click="showLogoutConfirm = false">إلغاء</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Create Post Modal -->
      <CreatePostModal :isVisible="showCreatePostModal" @close="showCreatePostModal = false" @post-created="handlePostCreated" />

      <!-- Cart Sidebar -->
      <CartSidebar />

      <!-- ===== MOBILE SIDEBAR / DRAWER ===== -->
      <Teleport to="body">
        <transition name="asala-mobile-sidebar-fade">
          <div
            v-if="isCurrentUser && mobileSidebarOpen"
            class="asala-mobile-sidebar-overlay"
            @click.self="closeMobileSidebar"
          >
            <aside class="asala-mobile-sidebar-panel">
              <div class="asala-mobile-sidebar-header">
                <div class="asala-mobile-sidebar-brand">
                  <div class="asala-mobile-sidebar-logo">🛍</div>
                  <div>
                    <div class="asala-mobile-sidebar-brand-title">حرفتي</div>
                    <div class="asala-mobile-sidebar-brand-subtitle">لوحة البائع</div>
                  </div>
                </div>

                <button class="asala-mobile-sidebar-close" @click="closeMobileSidebar" aria-label="إغلاق القائمة">✕</button>
              </div>

              <div class="asala-mobile-sidebar-section">القائمة</div>

              <button class="asala-mobile-sidebar-item" :class="{ active: activeView === 'profile' }" @click="setView('profile')">
                <span class="asala-mobile-sidebar-icon">👤</span>
                <span>الملف الشخصي</span>
              </button>

              <button class="asala-mobile-sidebar-item" @click="goToEditProfile">
                <span class="asala-mobile-sidebar-icon">✏️</span>
                <span>تعديل الملف</span>
              </button>

              <button class="asala-mobile-sidebar-item" :class="{ active: activeView === 'orders' }" @click="setView('orders')">
                <span class="asala-mobile-sidebar-icon">📦</span>
                <span>الطلبات</span>
                <span class="asala-mobile-sidebar-badge" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</span>
              </button>

              <button class="asala-mobile-sidebar-item" :class="{ active: activeView === 'stats' }" @click="setView('stats')">
                <span class="asala-mobile-sidebar-icon">📈</span>
                <span>الإحصائيات</span>
              </button>

              <button class="asala-mobile-sidebar-item" :class="{ active: activeView === 'inbox' }" @click="setView('inbox')">
                <span class="asala-mobile-sidebar-icon">📥</span>
                <span>البريد الوارد</span>
                <span class="asala-mobile-sidebar-badge" v-if="unreadMessages > 0">{{ unreadMessages }}</span>
              </button>

              <div class="asala-mobile-sidebar-footer">
                <span class="asala-mobile-sidebar-footer-dot"></span>
                <span>نفس ألوان وهوية الواجهة الأصلية</span>
              </div>
            </aside>
          </div>
        </transition>
      </Teleport>

      <!-- ===== BARRE DE NAVIGATION MOBILE — téléportée dans body ===== -->
      <Teleport to="body">
        <nav v-if="isCurrentUser" class="asala-mobile-bottom-nav">
          <button
            class="asala-nav-btn"
            :class="{ active: activeView === 'profile' }"
            @click="setView('profile')"
          >
            <span class="asala-nav-icon">👤</span>
            <span class="asala-nav-label">ملفي</span>
          </button>

          <button class="asala-nav-btn" @click="goToEditProfile">
            <span class="asala-nav-icon">✏️</span>
            <span class="asala-nav-label">تعديل</span>
          </button>

          <button
            class="asala-nav-btn"
            :class="{ active: activeView === 'orders' }"
            @click="setView('orders')"
          >
            <span class="asala-nav-icon">📦</span>
            <span class="asala-nav-label">الطلبات</span>
            <span class="asala-nav-badge" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</span>
          </button>

          <button
            class="asala-nav-btn"
            :class="{ active: activeView === 'stats' }"
            @click="setView('stats')"
          >
            <span class="asala-nav-icon">📈</span>
            <span class="asala-nav-label">الإحصاء</span>
          </button>

          <button
            class="asala-nav-btn"
            :class="{ active: activeView === 'inbox' }"
            @click="setView('inbox')"
          >
            <span class="asala-nav-icon">📥</span>
            <span class="asala-nav-label">الرسائل</span>
            <span class="asala-nav-badge" v-if="unreadMessages > 0">{{ unreadMessages }}</span>
          </button>
        </nav>
      </Teleport>

    </template>

    <!-- Not Found -->
    <div v-else class="not-found-instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h2>الملف الشخصي غير موجود</h2>
      <router-link to="/" class="btn-home-instagram">العودة للرئيسية</router-link>
    </div>

  </div>
</template>

<!-- ==================== SCRIPT SECTION ==================== -->
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVendorStore } from '../stores/vendorStore'
import { usePostStore } from '../stores/postStore'
import { useMessageStore } from '../stores/messageStore'
import { useLikesStore } from '../stores/likes'
import { useCartStore } from '../stores/cart'
import CreatePostModal from '../components/CreatePostModal.vue'
import CartSidebar from '../components/CartSidebar.vue'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const vendorStore = useVendorStore()
const postStore = usePostStore()
const messageStore = useMessageStore()
const likesStore = useLikesStore()
const cartStore = useCartStore()

// ===== CONSTANTS =====
const DEFAULT_AVATAR = 'https://i.pravatar.cc/300'
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'
const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x400/e2e8f0/475569?text=لا+توجد+صورة'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ===== STATE =====
const activeView = ref('profile')
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const loading = ref(true)
const vendor = ref(null)
const vendorPosts = ref([])
const showCreatePostModal = ref(false)
const selectedPost = ref(null)
const activePostMenu = ref(null)
const postComments = ref([])
const newComment = ref('')
const currentImageIndex = ref(0)
const coverImageKey = ref(Date.now())
const avatarKey = ref(Date.now())
const postsFilter = ref('all')
const postsSection = ref(null)
const commentInput = ref(null)
const coverInput = ref(null)
const avatarInput = ref(null)

// ===== ORDERS STATE =====
const orderStatusFilter = ref('all')
const orderSearchQuery = ref('')
const vendorOrders = ref([])
const ordersLoading = ref(false)
const showVendorOrderModal = ref(false)
const selectedVendorOrder = ref(null)
const pendingOrdersCount = ref(0)

// ===== INBOX STATE =====
const inboxMessages = ref([
  { id: 1, sender: 'أحمد محمد', avatar: 'https://i.pravatar.cc/150?img=1', preview: 'السلام عليكم، هل المنتج متوفر؟', fullText: 'السلام عليكم، هل المنتج متوفر؟ أرغب في شراء 3 قطع.', time: new Date(), read: false },
  { id: 2, sender: 'سارة علي', avatar: 'https://i.pravatar.cc/150?img=5', preview: 'شكراً على المنتج الرائع...', fullText: 'شكراً على المنتج الرائع، لقد وصلني بحالة ممتازة.', time: new Date(Date.now() - 86400000), read: true },
  { id: 3, sender: 'محمد حسن', avatar: 'https://i.pravatar.cc/150?img=8', preview: 'هل يمكنني الحصول على خصم؟', fullText: 'هل يمكنني الحصول على خصم للكميات الكبيرة؟ أرغب في شراء 10 قطع.', time: new Date(Date.now() - 172800000), read: false }
])
const selectedMessage = ref(null)
const replyText = ref('')
const showLogoutConfirm = ref(false)

// ===== FOLLOW =====
const isFollowing = ref(false)
const showFollowersModal = ref(false)
const showFollowingModal = ref(false)
const followers = ref([
  { id: 1, name: 'أحمد محمد', username: 'ahmed_m', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: true },
  { id: 2, name: 'سارة علي', username: 'sara_ali', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: false }
])
const following = ref([
  { id: 1, name: 'متجر الزهور', username: 'flowers_shop', avatar: 'https://i.pravatar.cc/150?img=11' }
])

// ===== REVIEWS =====
const reviews = ref([
  { id: 1, userId: 1, userName: 'أحمد محمد', rating: 5, productId: 1, comment: 'منتجات رائعة', date: '2024-01-15' }
])

// ===== EDIT / DELETE / PIN =====
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const postToDelete = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)
const pinnedCount = ref(0)

const editForm = reactive({ postId: null, productName: '', price: 0, oldPrice: null, quantity: 0, category: '', description: '' })

// ===== CART =====
const cartItemsCount = computed(() => cartStore.itemCount)
const cartTotal = computed(() => cartStore.totalPrice)
const currentCartVendorId = computed(() => cartStore.currentVendorId)
const currentCartVendorName = computed(() => cartStore.currentVendorName)

// ===== COMPUTED =====
const unreadMessages = computed(() => inboxMessages.value.filter(m => !m.read).length)

const filteredVendorOrders = computed(() => {
  let result = [...vendorOrders.value]
  if (orderStatusFilter.value !== 'all') {
    result = result.filter(o => o.status === orderStatusFilter.value)
  }
  if (orderSearchQuery.value.trim()) {
    const q = orderSearchQuery.value.toLowerCase()
    result = result.filter(o =>
      o.id?.toString().includes(q) ||
      (o.orderNumber || '').toString().toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    )
  }
  return result
})

const isCurrentUser = computed(() => {
  const vendorUserId = vendor.value?.userId || vendor.value?.user_id
  return authStore.isAuthenticated && authStore.user?.id === vendorUserId
})

const filteredPosts = computed(() => {
  if (postsFilter.value === 'pinned') return vendorPosts.value.filter(p => p.isPinned)
  if (postsFilter.value === 'available') return vendorPosts.value.filter(p => (p.quantity || 0) > 0)
  return vendorPosts.value
})

const vendorAvgRating = computed(() => {
  if (vendorPosts.value.length === 0) return 0
  let total = 0, count = 0
  for (const post of vendorPosts.value) {
    const rating = getPostRating(post.id)
    if (rating > 0) { total += rating; count++ }
  }
  return count === 0 ? 0 : total / count
})

const totalReviewsCount = computed(() => {
  return vendorPosts.value.reduce((sum, post) => sum + getPostReviewCount(post.id), 0)
})

const totalRevenue = computed(() => {
  return vendorOrders.value.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)
})

const topProducts = computed(() => {
  return [...vendorPosts.value].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
})

const purchaseRate = computed(() => {
  if (totalVisitors.value === 0) return 0
  return ((totalPurchases.value / totalVisitors.value) * 100).toFixed(1)
})

const totalPurchases = ref(156)
const totalVisitors = ref(2450)

// ===== FUNCTIONS ORDERS =====
const getOrdersStatusCount = (status) => {
  return vendorOrders.value.filter(o => o.status === status).length
}

const formatOrderDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getOrderStatusText = (s) => {
  const map = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  }
  return map[s] || s
}

const updatePendingCount = () => {
  pendingOrdersCount.value = vendorOrders.value.filter(o => o.status === 'pending').length
}

const exportOrders = () => {
  const headers = ['رقم الطلب', 'العميل', 'التاريخ', 'المبلغ', 'الحالة']
  const rows = filteredVendorOrders.value.map(o => [
    o.orderNumber || o.id,
    o.customerName || 'عميل',
    formatOrderDate(o.createdAt),
    o.total,
    getOrderStatusText(o.status)
  ])
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `commandes_vendeur_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showToast('📥 تم تصدير الطلبات بنجاح')
}

const printOrder = (order) => {
  if (!order) return
  const win = window.open('', '_blank')
  if (!win) {
    showToast('⚠️ يرجى السماح للنوافذ المنبثقة', 'warning')
    return
  }
  win.document.write(`
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Commande #${order.id}</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; direction: rtl; }
        h2 { color: #1e293b; border-bottom: 2px solid #08717f; padding-bottom: 10px; }
        .info { margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 8px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; }
        th { background: #f1f5f9; }
        .total { font-size: 18px; font-weight: bold; color: #d40025; text-align: left; }
      </style>
    </head>
    <body>
      <h2>طلب #${order.orderNumber || order.id}</h2>
      <div class="info">
        <p><strong>العميل:</strong> ${order.customerName || 'غير معروف'}</p>
        <p><strong>الهاتف:</strong> ${order.customerPhone || 'غير متوفر'}</p>
        <p><strong>البريد الإلكتروني:</strong> ${order.customerEmail || 'غير متوفر'}</p>
        <p><strong>التاريخ:</strong> ${formatOrderDate(order.createdAt)}</p>
        <p><strong>الحالة:</strong> ${getOrderStatusText(order.status)}</p>
        <p><strong>عنوان التوصيل:</strong> ${order.shippingAddress || 'غير محدد'}</p>
      </div>
      <h3>المنتجات</h3>
      <table>
        <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
        <tbody>
          ${(order.items || []).map(i => `
            <tr>
              <td>${i.productName || i.name || 'منتج'}</td>
              <td>${i.quantity || 1}</td>
              <td>${formatPrice(i.price)} د.ت</td>
              <td>${formatPrice((i.price || 0) * (i.quantity || 1))} د.ت</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">المجموع الكلي: ${formatPrice(order.total)} د.ت</div>
    </body>
    </html>
  `)
  win.document.close()
  win.print()
}

const viewVendorOrder = (order) => {
  selectedVendorOrder.value = { ...order }
  showVendorOrderModal.value = true
}

const updateVendorOrderStatus = async (order, previousStatus = null) => {
  if (!order?.id) return

  const idx = vendorOrders.value.findIndex(o => o.id === order.id)
  const newStatus = order.status

  try {
    const response = await api.patch(`/orders/vendor/${order.id}/status`, { status: newStatus })

    if (response.data?.success) {
      if (idx !== -1) vendorOrders.value[idx].status = newStatus
      if (selectedVendorOrder.value?.id === order.id) selectedVendorOrder.value.status = newStatus

      if (vendor.value?.id) {
        localStorage.setItem(`vendor_orders_${vendor.value.id}`, JSON.stringify(vendorOrders.value))
      }

      updatePendingCount()
      showToast(`✅ تم تحديث حالة الطلب #${order.id || order.orderNumber} إلى ${getOrderStatusText(newStatus)}`)
    } else {
      throw new Error('API update failed')
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error)

    if (idx !== -1) vendorOrders.value[idx].status = newStatus
    if (selectedVendorOrder.value?.id === order.id) selectedVendorOrder.value.status = newStatus

    if (vendor.value?.id) {
      localStorage.setItem(`vendor_orders_${vendor.value.id}`, JSON.stringify(vendorOrders.value))
    }

    updatePendingCount()
    showToast(`⚠️ تم تحديث حالة الطلب #${order.id || order.orderNumber} محلياً`, 'warning')
  }
}

const loadVendorOrders = async () => {
  ordersLoading.value = true

  if (vendor.value?.id) {
    const cachedOrders = localStorage.getItem(`vendor_orders_${vendor.value.id}`)
    if (cachedOrders) {
      try {
        const parsed = JSON.parse(cachedOrders)
        if (Array.isArray(parsed) && parsed.length > 0) {
          vendorOrders.value = parsed
          console.log('📦 Commandes chargées depuis localStorage:', vendorOrders.value.length)
          updatePendingCount()
        }
      } catch (e) {}
    }
  }

  try {
    const response = await api.get('/orders/vendor/my-orders')

    if (response.data?.success) {
      let ordersData = response.data.data?.data || response.data.data || []

      if (Array.isArray(ordersData) && ordersData.length > 0) {
        vendorOrders.value = ordersData.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber || `ORD-${o.id}`,
          customerName: o.customerName || o.customer_name || o.user?.name || 'عميل',
          customerEmail: o.customerEmail || o.customer_email || o.user?.email,
          customerPhone: o.customerPhone || o.customerPhone1 || o.customer_phone,
          total: parseFloat(o.total) || 0,
          status: o.status || 'pending',
          createdAt: o.createdAt || o.created_at,
          items: Array.isArray(o.items) ? o.items : (o.order_items || []).map(item => ({
            productName: item.productName || item.product_name || item.name,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1
          })),
          shippingAddress: o.shippingAddress || o.address || `${o.governorate || ''} ${o.delegation || ''} ${o.address || ''}`.trim()
        }))

        console.log('✅ Commandes vendeur chargées depuis API:', vendorOrders.value.length)

        if (vendor.value?.id) {
          localStorage.setItem(`vendor_orders_${vendor.value.id}`, JSON.stringify(vendorOrders.value))
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur API orders vendeur:', error)
  } finally {
    ordersLoading.value = false
    updatePendingCount()
  }
}

// ===== INBOX FUNCTIONS =====
const openMessage = (msg) => {
  if (!msg.read) {
    msg.read = true
  }
  selectedMessage.value = msg
  replyText.value = ''
}

const sendReply = () => {
  if (!replyText.value.trim() || !selectedMessage.value) return
  showToast(`✅ تم إرسال الرد إلى ${selectedMessage.value.sender}`)
  selectedMessage.value = null
  replyText.value = ''
}

const markAllAsRead = () => {
  inboxMessages.value.forEach(msg => { msg.read = true })
  showToast('✓ تم تحديد جميع الرسائل كمقروءة')
}

const doLogout = async () => {
  showLogoutConfirm.value = false
  await authStore.logout()
  router.push('/login')
  showToast('تم تسجيل الخروج بنجاح')
}

// ===== AUTRES FONCTIONS =====
const getPostRating = (postId) => {
  const pr = reviews.value.filter(r => r.productId === postId)
  if (pr.length === 0) return 0
  return pr.reduce((a, r) => a + (r.rating || 0), 0) / pr.length
}

const getPostReviewCount = (postId) => reviews.value.filter(r => r.productId === postId).length

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

const formatImageUrl = (p) => {
  if (!p || p === 'null' || p === 'undefined' || p === '') return DEFAULT_PRODUCT_IMAGE
  if (p.startsWith('http') || p.startsWith('data:image')) return p
  return `${API_BASE_URL}${p.startsWith('/') ? p : '/' + p}`
}

const getPostImage = (post, index = 0) => {
  if (!post) return DEFAULT_PRODUCT_IMAGE
  if (Array.isArray(post.images) && post.images.length > 0) return formatImageUrl(post.images[index] || post.images[0])
  if (post.image) return formatImageUrl(post.image)
  return DEFAULT_PRODUCT_IMAGE
}

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
  if (vendor.value.coverImage && vendor.value.coverImage !== 'null') return formatImageUrl(vendor.value.coverImage)
  return DEFAULT_COVER
}

const handleCoverImageError = (e) => { e.target.src = DEFAULT_COVER }
const handleAvatarImageError = (e) => { e.target.src = DEFAULT_AVATAR }
const handlePostImageError = (e) => { e.target.src = DEFAULT_PRODUCT_IMAGE }

const showToast = (msg, type = 'success') => {
  const div = document.createElement('div')
  div.className = `custom-toast ${type}`
  div.innerHTML = `<div class="toast-content">${msg}</div>`
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

const openCart = () => {
  if (cartItemsCount.value === 0) { showToast('🛒 سلة التسوق فارغة'); return }
  cartStore.openCart()
}

const clearCart = () => {
  if (cartItemsCount.value === 0) return
  if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
    cartStore.clearCart()
    showToast('🗑️ تم تفريغ السلة')
  }
}

const addToCart = async (product) => {
  if (!authStore.isAuthenticated) { showToast('⚠️ يرجى تسجيل الدخول أولاً', 'warning'); router.push('/login'); return false }
  if (product.quantity === 0) { showToast('⚠️ عذراً، المنتج غير متوفر حالياً', 'warning'); return false }

  const productVendorId = vendor.value?.id
  const productVendorName = vendor.value?.shopName

  if (currentCartVendorId.value && currentCartVendorId.value !== productVendorId) {
    if (confirm(`⚠️ سلة التسوق تحتوي حالياً على منتجات من "${currentCartVendorName.value}".\n\nإضافة منتج من "${productVendorName}" سيؤدي إلى تفريغ السلة الحالية. هل تريد المتابعة؟`)) {
      await cartStore.clearCart()
    } else { return false }
  }

  const result = await cartStore.addItem({
    id: product.id,
    name: product.productName || product.name,
    price: product.price,
    image: getPostImage(product),
    quantity: 1,
    vendorName: productVendorName,
    vendorId: productVendorId
  })

  if (result) {
    showToast(`✅ تمت إضافة "${product.productName}" إلى السلة`)
    cartStore.openCart()
  }
  return result
}

const addToCartFromGrid = (post) => addToCart(post)
const buyProduct = (post) => addToCart(post)

const setView = (view) => {
  activeView.value = view
  closeMobileSidebar()
  if (view === 'orders') {
    loadVendorOrders()
  }
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
  document.body.style.overflow = ''
}

const openMobileSidebar = () => {
  mobileSidebarOpen.value = true
  document.body.style.overflow = 'hidden'
}

const toggleMobileSidebar = () => {
  if (mobileSidebarOpen.value) closeMobileSidebar()
  else openMobileSidebar()
}

const scrollToPosts = () => postsSection.value?.scrollIntoView({ behavior: 'smooth' })

const goToEditProfile = () => {
  closeMobileSidebar()
  router.push(`/vendor/edit/${vendor.value?.id}`).catch(() => showToast('✏️ تعديل الملف الشخصي'))
}

const goToReviews = () => showToast(`⭐ تقييم البائع: ${vendorAvgRating.value.toFixed(1)} / 5 من ${totalReviewsCount.value} تقييم`)

const shareProfile = () => {
  const url = `${window.location.origin}/vendor/${vendor.value?.slug || vendor.value?.id}`
  navigator.clipboard.writeText(url).then(() => showToast('✓ تم نسخ رابط الملف الشخصي')).catch(() => showToast('تعذر نسخ الرابط', 'error'))
}

const contactVendor = () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  if (!vendor.value) { showToast('معلومات البائع غير متوفرة', 'error'); return }
  const vendorUserId = vendor.value.userId || vendor.value.user_id
  if (!vendorUserId) { showToast('لا يمكن بدء المحادثة', 'error'); return }
  localStorage.setItem('pendingChat', JSON.stringify({ receiverId: vendorUserId, receiverName: vendor.value.shopName || 'حرفي', receiverAvatar: getAvatarImage() }))
  const existingConv = messageStore.conversations?.find(c => c.other_user_id === vendorUserId)
  messageStore.isOpen = true
  if (existingConv) { messageStore.openChat(existingConv); showToast('💬 جاري فتح المحادثة...') }
  else {
    const tempConv = { id: null, other_user_id: vendorUserId, other_user_name: vendor.value.shopName || 'حرفي', other_user_avatar: getAvatarImage(), other_user_type: 'vendor', last_message: '', last_message_at: null, unread_count: 0 }
    messageStore.openChat(tempConv)
    if (messageStore.startConversation) {
      messageStore.startConversation(vendorUserId, 'vendor').then(conv => { if (conv?.id) { messageStore.activeChat = conv; messageStore.loadMessages?.(conv.id) } })
    }
    showToast('💬 جاري بدء المحادثة...')
  }
  setTimeout(() => localStorage.removeItem('pendingChat'), 3000)
}

const toggleFollow = () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  const vendorUserId = vendor.value.userId || vendor.value.user_id
  const followingList = JSON.parse(localStorage.getItem('following_list') || '[]')
  if (isFollowing.value) {
    const index = followingList.indexOf(vendorUserId)
    if (index > -1) followingList.splice(index, 1)
    isFollowing.value = false
    showToast('تم إلغاء المتابعة')
  } else {
    followingList.push(vendorUserId)
    isFollowing.value = true
    showToast('تمت المتابعة بنجاح ✓')
  }
  localStorage.setItem('following_list', JSON.stringify(followingList))
}

const checkFollowStatus = () => {
  if (!authStore.isAuthenticated || !vendor.value) return
  const followingList = JSON.parse(localStorage.getItem('following_list') || '[]')
  isFollowing.value = followingList.includes(vendor.value.userId || vendor.value.user_id)
}

const unfollowUser = (user) => {
  following.value = following.value.filter(f => f.id !== user.id)
  showToast(`تم إلغاء متابعة ${user.name}`)
}

const followUser = (user) => showToast(`تمت متابعة ${user.name}`)

const isPostInWishlist = (id) => likesStore?.isLiked ? likesStore.isLiked(id) : false
const isPostLikedByStore = (id) => postStore.likedPosts?.includes(id) || false

const togglePostWishlist = (post) => {
  if (!post?.id) return
  if (isPostInWishlist(post.id)) {
    likesStore?.removeLike?.(post.id)
    showToast('تمت الإزالة من المفضلة')
  } else {
    likesStore?.addLike?.({ id: post.id, name: post.productName || 'منتج', price: post.price || 0, image: getPostImage(post), vendorName: vendor.value?.shopName || 'حرفي' })
    showToast('❤️ تمت الإضافة إلى المفضلة')
  }
}

const togglePostLike = async (post) => {
  if (!post) return
  try {
    const result = await postStore.toggleLike(post.id)
    if (result) post.likes = result.likes
  } catch { post.likes = (post.likes || 0) + 1 }
}

const normalizePost = (post) => ({ ...post, isPinned: Boolean(post.isPinned === true || post.isPinned === 1 || post.isPinned === '1') })

const sortPosts = (posts) => {
  if (!Array.isArray(posts)) return []
  return [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
}

const countPinnedPosts = () => { pinnedCount.value = vendorPosts.value.filter(p => p.isPinned).length }

const openPostModal = (post) => {
  selectedPost.value = post
  currentImageIndex.value = 0
  postComments.value = []
  activePostMenu.value = null
  document.body.style.overflow = 'hidden'
}

const closePostModal = () => {
  selectedPost.value = null
  activePostMenu.value = null
  document.body.style.overflow = ''
}

const prevPostImage = () => { if (selectedPost.value?.images && currentImageIndex.value > 0) currentImageIndex.value-- }
const nextPostImage = () => { if (selectedPost.value?.images && currentImageIndex.value < selectedPost.value.images.length - 1) currentImageIndex.value++ }
const togglePostMenu = (id) => { activePostMenu.value = activePostMenu.value === id ? null : id }
const sharePost = (post) => { if (post) navigator.clipboard.writeText(`${window.location.origin}/product/${post.id}`).then(() => showToast('✓ تم نسخ رابط المنتج')) }
const openCreatePostModal = () => { showCreatePostModal.value = true }

const addComment = () => {
  if (!newComment.value.trim() || !selectedPost.value) return
  postComments.value.push({ id: Date.now(), userName: authStore.user?.name || 'مستخدم', text: newComment.value.trim() })
  selectedPost.value.commentsCount = (selectedPost.value.commentsCount || 0) + 1
  newComment.value = ''
  setTimeout(() => { const list = document.querySelector('.comments-list'); if (list) list.scrollTop = list.scrollHeight }, 50)
}

const focusComment = () => commentInput.value?.focus()

const togglePinPost = (post) => {
  if (!post?.id) return
  const currentPinned = Boolean(post.isPinned)
  if (!currentPinned && pinnedCount.value >= 3) { showToast('الحد الأقصى للتثبيت هو 3 منتجات', 'warning'); activePostMenu.value = null; return }
  const newState = !currentPinned
  vendorPosts.value = vendorPosts.value.map(p => p.id === post.id ? { ...p, isPinned: newState } : p)
  if (selectedPost.value?.id === post.id) selectedPost.value.isPinned = newState
  vendorPosts.value = sortPosts(vendorPosts.value)
  countPinnedPosts()
  showToast(newState ? '📌 تم تثبيت المنتج' : 'تم إلغاء التثبيت')
  activePostMenu.value = null
}

const openEditPostModal = (post) => {
  if (!post) return
  activePostMenu.value = null
  editForm.postId = post.id
  editForm.productName = post.productName || ''
  editForm.price = post.price || 0
  editForm.oldPrice = post.oldPrice || null
  editForm.quantity = post.quantity || 0
  editForm.category = post.category || ''
  editForm.description = post.description || ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  Object.assign(editForm, { postId: null, productName: '', price: 0, oldPrice: null, quantity: 0, category: '', description: '' })
}

const saveEditedPost = () => {
  if (!editForm.postId || !editForm.productName.trim() || !editForm.price) return
  const idx = vendorPosts.value.findIndex(p => p.id === editForm.postId)
  if (idx !== -1) {
    Object.assign(vendorPosts.value[idx], {
      productName: editForm.productName.trim(),
      price: parseFloat(editForm.price),
      quantity: editForm.quantity,
      description: editForm.description.trim()
    })
  }
  closeEditModal()
  showToast('✅ تم تعديل المنتج بنجاح')
}

const confirmDeletePost = (post) => { if (post) { activePostMenu.value = null; postToDelete.value = post; showDeleteConfirm.value = true } }
const cancelDelete = () => { showDeleteConfirm.value = false; postToDelete.value = null }

const executeDelete = () => {
  if (!postToDelete.value) return
  vendorPosts.value = vendorPosts.value.filter(p => p.id !== postToDelete.value.id)
  closePostModal()
  showToast('🗑️ تم حذف المنتج بنجاح')
  showDeleteConfirm.value = false
  postToDelete.value = null
}

const openAvatarUpload = () => avatarInput.value?.click()
const openCoverUpload = () => coverInput.value?.click()

const onAvatarFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    if (vendor.value) vendor.value.userAvatar = ev.target.result
    avatarKey.value = Date.now()
    showToast('✅ تم تحديث صورة الملف الشخصي')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const onCoverFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    localStorage.setItem(`vendor_cover_${vendor.value?.id}`, ev.target.result)
    coverImageKey.value = Date.now()
    showToast('✅ تم تحديث صورة الغلاف')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// ===== LOAD VENDOR =====
const loadVendorPosts = async (vendorId) => {
  if (!vendorId) { vendorPosts.value = []; return }
  try {
    const posts = await postStore.fetchVendorPosts(vendorId)
    const normalizedPosts = Array.isArray(posts) ? posts.map(post => normalizePost({
      ...post,
      vendorId: vendor.value?.id,
      vendorName: vendor.value?.shopName || vendor.value?.name
    })) : []
    vendorPosts.value = sortPosts(normalizedPosts)
    countPinnedPosts()
  } catch (e) {
    console.error('Erreur chargement posts:', e)
    vendorPosts.value = []
  }
}

const loadVendor = async () => {
  loading.value = true
  try {
    let paramId = route.params.name || route.params.id || route.query.id || route.query.slug
    let vendorData = null

    if (!paramId || paramId === 'me' || paramId === 'undefined' || paramId === 'null') {
      if (authStore.isAuthenticated && authStore.isVendor) {
        if (authStore.vendorId) {
          vendorData = await vendorStore.fetchVendorById(parseInt(authStore.vendorId))
        } else if (authStore.userId) {
          vendorData = await vendorStore.fetchVendorByUserId(authStore.userId)
        }
      }
    }
    else if (!isNaN(paramId)) {
      vendorData = await vendorStore.fetchVendorById(parseInt(paramId))
    }
    else {
      vendorData = await vendorStore.fetchVendorBySlug(paramId)
    }

    if (vendorData && vendorData.id) {
      vendor.value = vendorData
      console.log('✅ Vendeur chargé:', vendorData.shopName, 'ID:', vendorData.id)
      await loadVendorPosts(vendorData.id)
      await loadVendorOrders()
      avatarKey.value = Date.now()
      coverImageKey.value = Date.now()
      checkFollowStatus()
    } else {
      console.warn('⚠️ Aucun vendeur trouvé')
      vendor.value = null
    }
  } catch (error) {
    console.error('❌ Erreur loadVendor:', error)
    vendor.value = null
  } finally {
    loading.value = false
  }
}

const handlePostCreated = async () => {
  showCreatePostModal.value = false
  await loadVendorPosts(vendor.value.id)
  showToast('✅ تم إنشاء المنشور بنجاح')
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.post-menu-inline') && !e.target.closest('.modal-menu-btn')) activePostMenu.value = null
}

// ===== WATCHERS & LIFECYCLE =====
watch(() => [route.params.name, route.params.id, route.query.id, route.query.slug], () => loadVendor())

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (authStore.user?.role === 'pending') { router.push('/pending-vendor'); return }
  loadVendor()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>




<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;500;600;700;800&display=swap');

/* =================================================================
   ASALA — MOBILE BOTTOM NAV
   Téléportée dans <body> via Teleport, donc styles globaux requis.
   Nom de classe unique pour éviter tout conflit.
================================================================= */

/* Cachées par défaut sur desktop */
.asala-mobile-bottom-nav,
.asala-mobile-topbar,
.asala-mobile-sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .asala-mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    background: #ffffff;
    border-top: 1.5px solid #e2e8f0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.10);
    z-index: 99999;
    padding: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    direction: rtl;
  }

  .asala-nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 10px 4px 8px;
    background: none;
    border: none;
    border-top: 2.5px solid transparent;
    cursor: pointer;
    color: #94a3b8;
    font-family: 'Cairo', 'Amiri', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 1;
    position: relative;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .asala-nav-btn:active {
    background: #f0f9ff;
  }

  .asala-nav-btn.active {
    color: #0284c7;
    border-top-color: #0284c7;
  }

  .asala-nav-icon {
    font-size: 1.4rem;
    line-height: 1;
    display: block;
    transition: transform 0.15s;
  }

  .asala-nav-btn.active .asala-nav-icon {
    transform: scale(1.12);
  }

  .asala-nav-label {
    display: block;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .asala-nav-badge {
    position: absolute;
    top: 6px;
    right: calc(50% - 18px);
    background: #ef4444;
    color: #ffffff;
    font-size: 9px;
    font-weight: 800;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 99px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    border: 1.5px solid #fff;
    pointer-events: none;
  }

  .asala-mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 40;
    margin: -12px -14px 12px;
    padding: 12px 14px;
    background: rgba(255,255,255,.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
  }

  .asala-mobile-topbar-menu,
  .asala-mobile-topbar-action {
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2dd4bf, #1d4ed8);
    color: #fff;
    font-size: 1.15rem;
    box-shadow: 0 12px 24px rgba(29, 78, 216, 0.18);
    -webkit-tap-highlight-color: transparent;
  }

  .asala-mobile-topbar-title {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
  }

  .asala-mobile-topbar-kicker {
    font-size: .7rem;
    font-weight: 700;
    color: #64748b;
  }

  .asala-mobile-topbar-title strong {
    color: #0f172a;
    font-size: .98rem;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .asala-mobile-sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.48);
    z-index: 100000;
    display: flex;
    justify-content: flex-end;
  }

  .asala-mobile-sidebar-panel {
    width: min(320px, 86vw);
    height: 100dvh;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: -20px 0 50px rgba(15, 23, 42, 0.20);
    padding: 18px 14px calc(24px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    border-left: 1px solid rgba(226, 232, 240, 0.9);
  }

  .asala-mobile-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .asala-mobile-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .asala-mobile-sidebar-logo {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2dd4bf, #1d4ed8);
    color: #fff;
    font-size: 1.3rem;
    box-shadow: 0 14px 24px rgba(29, 78, 216, 0.18);
  }

  .asala-mobile-sidebar-brand-title {
    color: #0f172a;
    font-size: 1rem;
    font-weight: 800;
  }

  .asala-mobile-sidebar-brand-subtitle {
    color: #64748b;
    font-size: .78rem;
    font-weight: 600;
  }

  .asala-mobile-sidebar-close {
    width: 38px;
    height: 38px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    color: #334155;
    font-size: 1rem;
  }

  .asala-mobile-sidebar-section {
    margin: 8px 4px 10px;
    color: #94a3b8;
    font-size: .7rem;
    font-weight: 800;
    letter-spacing: .08em;
  }

  .asala-mobile-sidebar-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    margin-bottom: 8px;
    border: 1px solid transparent;
    border-radius: 16px;
    background: #fff;
    color: #475569;
    font-size: .95rem;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(148, 163, 184, 0.08);
    text-align: right;
  }

  .asala-mobile-sidebar-item.active {
    color: #0284c7;
    border-color: #bae6fd;
    background: linear-gradient(135deg, #eff6ff, #ecfeff);
  }

  .asala-mobile-sidebar-icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    flex-shrink: 0;
    font-size: 1.05rem;
  }

  .asala-mobile-sidebar-item.active .asala-mobile-sidebar-icon {
    background: #dbeafe;
  }

  .asala-mobile-sidebar-badge {
    margin-right: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 99px;
    background: #ef4444;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: .72rem;
    font-weight: 800;
  }

  .asala-mobile-sidebar-footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 10px 4px;
    color: #64748b;
    font-size: .8rem;
    font-weight: 600;
  }

  .asala-mobile-sidebar-footer-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2dd4bf, #1d4ed8);
    box-shadow: 0 0 0 6px rgba(45, 212, 191, 0.12);
  }

  .asala-mobile-sidebar-fade-enter-active,
  .asala-mobile-sidebar-fade-leave-active {
    transition: opacity .22s ease;
  }

  .asala-mobile-sidebar-fade-enter-from,
  .asala-mobile-sidebar-fade-leave-to {
    opacity: 0;
  }
}
</style>

<style scoped>
/* ===== BASE ===== */
.vendor-profile-page { font-family:'Amiri','Cairo',serif; background:#f5f5f5; min-height:100vh }
.vendor-profile-page * { font-family:'Amiri','Cairo',serif; box-sizing:border-box }

/* ===== LAYOUT ===== */
.app-layout { display:flex; min-height:100vh; overflow:hidden }

/* ===== SIDEBAR ===== */
.sidebar { width:220px; min-width:220px; background:#fff; border-left:1px solid #e5e7eb; display:flex; flex-direction:column; overflow-y:auto; transition:width .25s ease; flex-shrink:0 }
.sidebar.collapsed { width:56px; min-width:56px }
.sidebar-logo { padding:16px 12px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #e5e7eb; flex-shrink:0 }
.logo-icon { width:32px; height:32px; background:linear-gradient(135deg,#2dd4bf,#1d4ed8); border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0 }
.logo-text { font-size:14px; font-weight:700; color:#1e293b; white-space:nowrap }
.sidebar-section { padding:10px 12px 4px; font-size:9px; font-weight:700; color:#94a3b8; letter-spacing:1.5px; text-transform:uppercase }
.sidebar-item { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:6px; margin:2px 6px; cursor:pointer; transition:all .2s; color:#64748b; font-size:12px; font-weight:500; white-space:nowrap }
.sidebar-item:hover { background:#f1f5f9; color:#1e293b }
.sidebar-item.active { background:#e0f2fe; color:#0284c7 }
.s-icon { font-size:15px; width:18px; flex-shrink:0 }
.sidebar-badge { margin-right:auto; background:#ef4444; color:#fff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:99px }
.sidebar-collapse-btn { margin-top:auto; padding:12px; text-align:center; cursor:pointer; color:#94a3b8; font-size:11px; border-top:1px solid #e5e7eb; transition:color .2s; flex-shrink:0 }
.sidebar-collapse-btn:hover { color:#64748b }

/* ===== MAIN CONTENT ===== */
.main-content { flex:1; display:flex; flex-direction:column; overflow-x:hidden; min-width:0 }

/* ===== VIEW CONTENT ===== */
.view-content { flex:1; padding:16px 20px; background:#f8fafc }
.view-content.no-header { padding-top:20px }

/* ===== LOADING ===== */
.loading-state { display:flex; align-items:center; justify-content:center; height:100vh; background:#f8fafc }
.loading-spinner { text-align:center }
.spinner-ring { width:40px; height:40px; border:3px solid #e5e7eb; border-top-color:#0284c7; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto }
.spinner-ring.small { width:24px; height:24px }
.loading-state-inline { display:flex; align-items:center; gap:10px; justify-content:center; padding:40px; color:#64748b }
@keyframes spin { to { transform:rotate(360deg) } }

/* ===== COVER ===== */
.cover-photo-container { position:relative; width:100%; height:220px; overflow:hidden; background:#e2e8f0 }
.cover-photo { width:100%; height:100%; object-fit:cover }
.cover-overlay-gradient { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.3), transparent 60%) }
.change-cover-btn { position:absolute; bottom:14px; left:14px; display:flex; align-items:center; gap:7px; padding:7px 14px; background:rgba(0,0,0,.6); backdrop-filter:blur(8px); border:none; border-radius:18px; color:#fff; font-size:.85rem; font-weight:600; cursor:pointer; z-index:10; transition:background .2s }
.change-cover-btn:hover { background:rgba(0,0,0,.8) }
.change-cover-btn svg { width:14px; height:14px; stroke:#fff }

/* ===== PROFILE HEADER ===== */
.profile-header { display:flex; gap:28px; padding:0 16px; margin-top:-36px; margin-bottom:16px; position:relative; z-index:5 }
.avatar-container { position:relative; width:130px; height:130px }
.profile-avatar { width:100%; height:100%; border-radius:50%; object-fit:cover; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.15) }
.avatar-edit-btn { position:absolute; bottom:4px; left:4px; width:28px; height:28px; background:#0284c7; border:2px solid #fff; border-radius:50%; cursor:pointer; opacity:0; transition:all .2s; display:flex; align-items:center; justify-content:center }
.avatar-edit-btn svg { width:12px; height:12px; stroke:#fff }
.avatar-container:hover .avatar-edit-btn { opacity:1 }
.verified-badge-instagram { position:absolute; bottom:4px; right:4px; width:22px; height:22px; background:#0284c7; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff }
.profile-info-section { flex:1 }
.profile-actions-row { display:flex; align-items:center; gap:16px; margin-bottom:16px; flex-wrap:wrap }
.profile-username { font-size:1.8rem; font-weight:700; color:#1e293b; margin:0 }
.action-buttons { display:flex; gap:7px; align-items:center }
.btn-edit-profile { padding:6px 14px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:7px; font-size:.85rem; font-weight:600; cursor:pointer; color:#1e293b; transition:all .2s }
.btn-edit-profile:hover { background:#e2e8f0 }
.btn-share-profile,.btn-settings,.btn-message-instagram { width:32px; height:32px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s }
.btn-share-profile:hover,.btn-settings:hover,.btn-message-instagram:hover { background:#e2e8f0 }
.btn-share-profile svg,.btn-settings svg,.btn-message-instagram svg { width:15px; height:15px; stroke:#64748b }
.btn-follow { padding:7px 18px; background:#0284c7; color:#fff; border:none; border-radius:8px; font-size:.85rem; font-weight:600; cursor:pointer; transition:all .3s }
.btn-follow:hover { background:#0369a1; transform:translateY(-1px); box-shadow:0 2px 8px rgba(2,132,199,.3) }
.btn-follow.following { background:#f1f5f9; color:#64748b; border:1px solid #e5e7eb }
.btn-follow.following:hover { background:#fee2e2; color:#ef4444; border-color:#fecaca }

/* ===== STARS DISPLAY GREEN ===== */
.stars-display-green { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; transition:opacity .2s; padding:4px 8px; background:#f0fdf4; border-radius:12px; border:1px solid #bbf7d0 }
.stars-display-green:hover { opacity:.8; background:#dcfce7 }
.stars-row-big { display:flex; gap:2px }
.star-filled-green { color:#22c55e; font-size:1rem; text-shadow:0 1px 2px rgba(34,197,94,.3) }
.star-empty-green { color:#d1d5db; font-size:1rem }
.rating-stats { display:flex; align-items:baseline; gap:6px }
.rating-number { font-size:1rem; font-weight:800; color:#166534 }
.stat-purchase-rate { cursor:pointer }

.profile-stats-instagram { display:flex; gap:32px; margin-bottom:16px; flex-wrap:wrap }
.stat-item { text-align:right; cursor:pointer; transition:opacity .2s }
.stat-item:hover { opacity:.7 }
.stat-number { font-size:1.1rem; font-weight:700; color:#1e293b; display:block }
.stat-label { font-size:.9rem; color:#94a3b8 }
.stat-purchase-rate .stat-number { color:#f59e0b }
.profile-bio-instagram { margin-bottom:8px }
.bio-name { font-weight:700; font-size:.95rem; color:#1e293b }
.bio-text { font-size:.9rem; color:#475569; line-height:1.6 }
.bio-link a { color:#0284c7; text-decoration:none; font-size:.85rem }
.bio-meta { display:flex; gap:12px; margin-top:4px; flex-wrap:wrap }
.bio-meta span { font-size:.8rem; color:#94a3b8 }

/* ===== CREATE POST ===== */
.facebook-create-post-section { margin:0 16px 16px; background:#fff; border-radius:10px; padding:12px 14px; border:1px solid #e5e7eb }
.facebook-post-header { display:flex; align-items:center; gap:10px; margin-bottom:10px }
.facebook-avatar { width:36px; height:36px; border-radius:50%; object-fit:cover }
.facebook-post-button { flex:1; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:24px; padding:10px 14px; text-align:right; font-size:.85rem; color:#94a3b8; cursor:pointer; transition:background .2s }
.facebook-post-button:hover { background:#e2e8f0 }
.facebook-post-actions { display:flex; gap:4px; border-top:1px solid #e5e7eb; padding-top:8px }
.facebook-action-btn { display:flex; align-items:center; gap:6px; background:none; border:none; padding:7px 12px; border-radius:6px; color:#64748b; font-size:.8rem; cursor:pointer; transition:background .2s }
.facebook-action-btn:hover { background:#f1f5f9 }
.facebook-action-btn svg { width:16px; height:16px }

/* ===== POSTS FILTER ===== */
.posts-filter-bar { padding:0 16px 12px; display:flex; gap:8px; flex-wrap:wrap }
.filter-pill { padding:5px 14px; border:1px solid #e5e7eb; border-radius:20px; background:#fff; font-size:.8rem; color:#64748b; cursor:pointer; transition:all .2s }
.filter-pill.active { background:#0284c7; color:#fff; border-color:#0284c7 }
.filter-pill:hover:not(.active) { background:#f1f5f9 }

/* ===== POSTS GRID ===== */
.posts-grid-instagram { padding:0 16px 16px }
.instagram-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:3px }
.grid-post { position:relative; aspect-ratio:1/1; cursor:pointer; overflow:hidden }
.post-image-container { width:100%; height:100%; position:relative }
.grid-post-image { width:100%; height:100%; object-fit:cover; transition:transform .3s }
.grid-post:hover .grid-post-image { transform:scale(1.04) }
.grid-wishlist-btn { position:absolute; top:7px; left:7px; width:28px; height:28px; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); border:none; border-radius:50%; cursor:pointer; z-index:10; display:flex; align-items:center; justify-content:center; transition:background .2s }
.grid-wishlist-btn:hover { background:rgba(0,0,0,.65) }
.grid-wishlist-btn svg { width:14px; height:14px }
.post-overlay-instagram { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s }
.grid-post:hover .post-overlay-instagram { opacity:1 }
.post-stats { display:flex; gap:14px; flex-wrap:wrap; justify-content:center }
.stat { display:flex; align-items:center; gap:5px; color:#fff; font-size:.85rem; font-weight:600 }
.post-price-overlay { background:rgba(2,132,199,.8); padding:2px 8px; border-radius:10px; font-size:.75rem }
.post-rating-badge { position:absolute; bottom:8px; left:8px; display:flex; align-items:center; gap:3px; background:rgba(0,0,0,.7); backdrop-filter:blur(4px); padding:3px 8px; border-radius:12px; font-size:.65rem; color:#fff; z-index:5 }
.post-rating-value { font-weight:700; color:#fbbf24 }
.post-rating-count { color:#94a3b8; font-size:.6rem }
.pinned-badge-instagram { position:absolute; top:8px; right:8px; font-size:14px }
.out-of-stock-badge { position:absolute; bottom:8px; right:8px; background:rgba(239,68,68,.85); color:#fff; padding:2px 8px; border-radius:10px; font-size:.65rem; font-weight:700 }
.empty-state-instagram { text-align:center; padding:60px 16px; color:#94a3b8 }
.empty-state-instagram p { margin:12px 0 20px }
.btn-create-instagram { padding:9px 24px; background:#0284c7; border:none; border-radius:8px; color:#fff; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .2s }
.btn-create-instagram:hover { background:#0369a1; transform:translateY(-1px) }

/* ===== ORDERS VIEW ===== */
.orders-view { background:#f8fafc }
.orders-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px }
.orders-page-header h2 { font-size:1.5rem; font-weight:700; color:#1e293b; margin:0 }
.header-actions { display:flex; gap:8px }
.btn-refresh { padding:8px 16px; background:#0284c7; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.85rem; font-weight:600; transition:background .2s }
.btn-refresh:hover:not(:disabled) { background:#0369a1 }
.btn-refresh:disabled { opacity:.6; cursor:not-allowed }
.btn-export { padding:8px 16px; background:#10b981; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.85rem; font-weight:600; transition:background .2s }
.btn-export:hover { background:#059669 }
.stats-cards { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:20px }
.stat-card-order { background:#fff; border-radius:12px; padding:14px; display:flex; align-items:center; gap:10px; border:1px solid #e5e7eb; cursor:pointer; transition:all .2s }
.stat-card-order:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.08) }
.stat-card-order .stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; background:#f1f5f9 }
.stat-card-order .stat-value { font-size:1.4rem; font-weight:700; display:block }
.stat-card-order .stat-label { font-size:.75rem; color:#64748b }
.stat-card-order.pending .stat-value { color:#f59e0b }
.stat-card-order.processing .stat-value { color:#3b82f6 }
.stat-card-order.shipped .stat-value { color:#8b5cf6 }
.stat-card-order.delivered .stat-value { color:#10b981 }
.stat-card-order.cancelled .stat-value { color:#ef4444 }
.filters-bar { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; align-items:center }
.filter-select,.search-input { padding:10px 14px; border:2px solid #e2e8f0; border-radius:8px; font-size:.9rem; background:#fff; color:#1e293b; outline:none; transition:border-color .2s }
.filter-select:focus,.search-input:focus { border-color:#0284c7 }
.search-input { flex:1; max-width:300px }
.btn-clear-filter { padding:8px 14px; background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:8px; cursor:pointer; font-size:.85rem; font-weight:600; white-space:nowrap; transition:all .2s }
.btn-clear-filter:hover { background:#fee2e2 }
.table-responsive { overflow-x:auto; border-radius:10px; border:1px solid #e5e7eb; background:#fff }
.data-table { width:100%; border-collapse:collapse }
.data-table th { padding:12px 14px; text-align:right; font-weight:600; font-size:.85rem; color:#64748b; background:#f8fafc; border-bottom:2px solid #e5e7eb }
.data-table td { padding:12px 14px; border-bottom:1px solid #e5e7eb; color:#1e293b; font-size:.85rem }
.data-table tbody tr:hover { background:#f8fafc }
.data-table tbody tr:last-child td { border-bottom:none }
.row-pending { border-right:3px solid #f59e0b }
.price-cell { font-weight:700; color:#d40025 }
.status-select { padding:6px 10px; border:1.5px solid #e5e7eb; border-radius:6px; font-size:.8rem; cursor:pointer; background:#fff; outline:none; transition:border-color .2s }
.status-select:focus { border-color:#0284c7 }
.status-select.pending { border-right:3px solid #f59e0b }
.status-select.processing { border-right:3px solid #3b82f6 }
.status-select.shipped { border-right:3px solid #8b5cf6 }
.status-select.delivered { border-right:3px solid #10b981 }
.status-select.cancelled { border-right:3px solid #ef4444 }
.row-actions { display:flex; gap:6px }
.action-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border:none; border-radius:6px; font-size:.8rem; font-weight:600; cursor:pointer; transition:all .2s }
.action-btn.view { background:#e0f2fe; color:#0284c7 }
.action-btn.view:hover { background:#0284c7; color:#fff }
.action-btn.print { background:#f1f5f9; color:#64748b; padding:6px 8px }
.action-btn.print:hover { background:#e2e8f0 }
.empty-state { text-align:center; padding:60px 20px }
.empty-icon { font-size:3rem; margin-bottom:10px; opacity:.3 }
.empty-state h3 { font-size:1.2rem; color:#1e293b; margin-bottom:6px }
.empty-state p { color:#64748b; margin-bottom:12px }

/* ===== STATS VIEW ===== */
.stats-view h2 { font-size:1.5rem; font-weight:700; color:#1e293b; margin-bottom:20px }
.stats-overview-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px }
.overview-card { background:#fff; border-radius:12px; padding:20px; display:flex; align-items:center; gap:16px; border:1px solid #e5e7eb; transition:all .2s }
.overview-card:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.08) }
.overview-icon { font-size:2rem }
.overview-value { font-size:1.6rem; font-weight:800; color:#1e293b }
.overview-label { font-size:.8rem; color:#64748b; margin-top:2px }
.overview-card.blue .overview-value { color:#0284c7 }
.overview-card.green .overview-value { color:#10b981 }
.overview-card.orange .overview-value { color:#f59e0b }
.overview-card.purple .overview-value { color:#8b5cf6 }
.overview-card.teal .overview-value { color:#2dd4bf }
.overview-card.red .overview-value { color:#ef4444 }
.top-products-section h3 { font-size:1.1rem; font-weight:700; color:#1e293b; margin-bottom:16px }
.top-products-list { background:#fff; border-radius:10px; border:1px solid #e5e7eb; overflow:hidden }
.top-product-item { display:flex; align-items:center; gap:14px; padding:12px 16px; border-bottom:1px solid #e5e7eb }
.top-product-item:last-child { border-bottom:none }
.rank-badge { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; color:#fff; flex-shrink:0 }
.rank-1 { background:#f59e0b }
.rank-2 { background:#94a3b8 }
.rank-3 { background:#cd7c2e }
.rank-4,.rank-5 { background:#e2e8f0; color:#64748b }
.top-product-img { width:44px; height:44px; border-radius:8px; object-fit:cover }
.top-product-info { flex:1 }
.top-product-name { font-size:.9rem; font-weight:600; color:#1e293b }
.top-product-stats { font-size:.8rem; color:#64748b; margin-top:2px }
.btn-view-product { padding:5px 12px; background:#e0f2fe; color:#0284c7; border:none; border-radius:6px; cursor:pointer; font-size:.8rem; font-weight:600; transition:all .2s }
.btn-view-product:hover { background:#0284c7; color:#fff }

/* ===== INBOX VIEW ===== */
.inbox-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px }
.inbox-header h2 { font-size:1.5rem; font-weight:700; color:#1e293b; margin:0 }
.btn-mark-all-read { padding:8px 16px; background:#f1f5f9; color:#64748b; border:1px solid #e5e7eb; border-radius:8px; cursor:pointer; font-size:.85rem; font-weight:600; transition:all .2s }
.btn-mark-all-read:hover:not(:disabled) { background:#e2e8f0 }
.btn-mark-all-read:disabled { opacity:.5; cursor:not-allowed }
.messages-list { background:#fff; border-radius:10px; border:1px solid #e5e7eb; overflow:hidden }
.message-item { display:flex; align-items:center; gap:14px; padding:14px 16px; border-bottom:1px solid #e5e7eb; cursor:pointer; transition:background .2s; position:relative }
.message-item:hover { background:#f8fafc }
.message-item:last-child { border-bottom:none }
.message-item.unread { background:#fafeff }
.msg-avatar { width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0 }
.msg-content { flex:1; min-width:0 }
.msg-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px }
.msg-sender { font-size:.9rem; font-weight:600; color:#1e293b }
.msg-time { font-size:.75rem; color:#94a3b8 }
.msg-preview { font-size:.85rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.message-item.unread .msg-preview { color:#1e293b; font-weight:500 }
.msg-unread-dot { width:8px; height:8px; border-radius:50%; background:#0284c7; flex-shrink:0 }

/* ===== MODALS ===== */
.followers-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px) }
.followers-modal { background:#fff; border-radius:14px; width:90%; max-width:420px; max-height:75vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,.2) }
.followers-modal.order-modal { max-width:600px }
.followers-modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid #e5e7eb; position:sticky; top:0; background:#fff; z-index:1 }
.followers-modal-header h3 { margin:0; font-size:1rem; font-weight:700; color:#1e293b }
.modal-header-actions { display:flex; gap:8px; align-items:center }
.modal-action-btn { width:30px; height:30px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:6px; cursor:pointer; font-size:14px; transition:background .2s }
.modal-action-btn:hover { background:#e2e8f0 }
.modal-close-btn { width:28px; height:28px; background:#f1f5f9; border:none; border-radius:50%; cursor:pointer; font-size:.9rem; color:#64748b; transition:background .2s }
.modal-close-btn:hover { background:#e2e8f0 }
.modal-body { padding:20px }
.followers-list { padding:8px }
.follower-item { display:flex; align-items:center; gap:10px; padding:10px; border-radius:8px; transition:background .2s }
.follower-item:hover { background:#f8fafc }
.follower-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover }
.follower-info { flex:1 }
.follower-name { font-size:.85rem; font-weight:600; color:#1e293b; display:block }
.follower-username { font-size:.75rem; color:#94a3b8 }
.btn-follow-action { padding:5px 14px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:6px; cursor:pointer; font-size:.75rem; font-weight:600; color:#64748b; transition:all .2s }
.btn-follow-action.following { background:#e0f2fe; color:#0284c7; border-color:#bae6fd }
.btn-unfollow { padding:5px 14px; background:#fef2f2; border:1px solid #fecaca; border-radius:6px; cursor:pointer; font-size:.75rem; font-weight:600; color:#ef4444; transition:all .2s }
.btn-unfollow:hover { background:#fee2e2 }
.order-info-card { background:#f8fafc; border-radius:10px; padding:14px; margin-bottom:16px }
.info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e5e7eb }
.info-row:last-child { border-bottom:none }
.info-label { font-weight:600; color:#64748b; font-size:.85rem }
.info-value { color:#1e293b; font-size:.85rem }
.status-badge { padding:4px 12px; border-radius:20px; font-size:.8rem; font-weight:600 }
.status-badge.pending { background:#fff3cd; color:#856404 }
.status-badge.processing { background:#cce5ff; color:#004085 }
.status-badge.shipped { background:#e2d5ff; color:#5e3a9e }
.status-badge.delivered { background:#d4edda; color:#155724 }
.status-badge.cancelled { background:#f8d7da; color:#721c24 }
.order-items-section h4 { color:#1e293b; margin-bottom:12px; font-size:1rem }
.items-table { width:100%; border-collapse:collapse }
.items-table th,.items-table td { padding:8px; text-align:right; border-bottom:1px solid #e5e7eb; font-size:.85rem }
.items-table th { font-weight:600; color:#64748b; background:#f8fafc }
.total-row { font-weight:700 }
.total-price { color:#d40025; font-size:1rem }
.modal-footer-actions { display:flex; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb }
.full-message { background:#f8fafc; border-radius:8px; padding:14px; font-size:.9rem; color:#1e293b; line-height:1.6; margin-bottom:14px }
.reply-textarea { width:100%; padding:10px; border:2px solid #e5e7eb; border-radius:8px; font-size:.9rem; font-family:inherit; resize:vertical; outline:none; margin-bottom:10px; transition:border-color .2s }
.reply-textarea:focus { border-color:#0284c7 }

/* ===== POST MODAL ===== */
.post-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.92); display:flex; align-items:center; justify-content:center; z-index:2000; padding:16px }
.post-modal-container { position:relative; width:100%; max-width:1000px; border-radius:10px; overflow:hidden }
.post-modal-content { display:flex; background:#fff; border-radius:10px; overflow:hidden; max-height:90vh }
.post-modal-image { flex:1.2; position:relative; background:#000; display:flex; align-items:center; justify-content:center; min-height:400px }
.post-modal-image img { width:100%; height:100%; object-fit:contain }
.image-navigation { position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; pointer-events:none }
.nav-btn { pointer-events:all; background:rgba(0,0,0,.5); border:none; color:#fff; font-size:1.8rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:50%; transition:background .2s }
.nav-btn:hover { background:rgba(0,0,0,.75) }
.image-dots { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); display:flex; gap:6px; pointer-events:all }
.image-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.5); cursor:pointer; transition:background .2s }
.image-dot.active { background:#fff }
.post-modal-info { flex:0.85; display:flex; flex-direction:column; background:#fff; max-height:90vh; overflow-y:auto }
.modal-post-header { display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid #e5e7eb; flex-shrink:0; position:relative }
.modal-avatar { width:32px; height:32px; border-radius:50%; object-fit:cover }
.modal-author { flex:1 }
.author-name { font-size:.9rem; font-weight:700; color:#1e293b; display:block }
.author-handle { font-size:.75rem; color:#94a3b8 }
.modal-menu-btn { width:28px; height:28px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background .2s }
.modal-menu-btn:hover { background:#f1f5f9 }
.post-menu-inline { background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.12); overflow:hidden; position:absolute; top:48px; left:14px; min-width:180px; z-index:10 }
.menu-item { display:flex; align-items:center; gap:10px; width:100%; padding:10px 16px; background:none; border:none; text-align:right; cursor:pointer; color:#1e293b; font-size:.85rem; font-family:inherit; transition:background .2s }
.menu-item:hover { background:#f1f5f9 }
.menu-item.delete { color:#ef4444 }
.modal-post-caption { padding:12px 14px; border-bottom:1px solid #e5e7eb; flex-shrink:0 }
.modal-post-caption h3 { font-size:1rem; font-weight:700; color:#1e293b; margin:0 0 6px }
.modal-post-caption p { font-size:.85rem; color:#475569; line-height:1.6; margin:0 }
.stock-info { margin-top:8px }
.in-stock { color:#10b981; font-size:.8rem; font-weight:600 }
.out-stock { color:#ef4444; font-size:.8rem; font-weight:600 }
.modal-post-price { padding:10px 14px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; gap:8px; flex-shrink:0 }
.current-price { font-size:17px; font-weight:700; color:#0284c7 }
.old-price { font-size:13px; color:#94a3b8; text-decoration:line-through }
.discount-badge { background:#fee2e2; color:#ef4444; padding:2px 8px; border-radius:10px; font-size:.75rem; font-weight:700 }
.modal-post-actions { display:flex; gap:10px; padding:10px 14px; border-bottom:1px solid #e5e7eb; flex-shrink:0; flex-wrap:wrap }
.modal-post-actions .action-btn { background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:13px; color:#1e293b; padding:6px 8px; border-radius:6px; transition:background .2s }
.modal-post-actions .action-btn:hover { background:#f1f5f9 }
.modal-post-actions .action-btn svg { width:18px; height:18px }
.like-icon.liked { stroke:#ef4444; fill:#ef4444 }
.wishlist-icon.liked { stroke:#ef4444; fill:#ef4444 }
.buy-btn-modal { background:#0284c7 !important; color:#fff !important; border-radius:8px !important; padding:6px 14px !important }
.buy-btn-modal:hover:not(:disabled) { background:#0369a1 !important }
.buy-btn-modal:disabled { opacity:.5; cursor:not-allowed }
.modal-post-comments { flex:1; display:flex; flex-direction:column; padding:10px 14px; min-height:120px }
.comments-list { flex:1; overflow-y:auto; max-height:120px; margin-bottom:8px }
.no-comments { text-align:center; color:#94a3b8; font-size:.8rem; padding:16px }
.comment-item { margin-bottom:8px; font-size:.85rem }
.comment-author { font-weight:700; color:#1e293b; margin-left:6px }
.comment-text { color:#475569 }
.comment-input-wrapper { display:flex; gap:8px; border-top:1px solid #e5e7eb; padding-top:8px }
.comment-input { flex:1; background:none; border:none; padding:6px 0; font-size:13px; color:#1e293b; outline:none; font-family:inherit }
.post-comment-btn { background:none; border:none; color:#0284c7; font-size:.85rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:opacity .2s }
.post-comment-btn:disabled { opacity:.4; cursor:not-allowed }
.modal-post-date { padding:8px 14px; font-size:.75rem; color:#94a3b8; flex-shrink:0; border-top:1px solid #e5e7eb }
.close-modal-btn { position:absolute; top:-44px; left:0; background:none; border:none; cursor:pointer; color:#fff; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background .2s }
.close-modal-btn:hover { background:rgba(255,255,255,.1) }

/* ===== EDIT MODAL ===== */
.edit-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:3000 }
.edit-modal { background:#fff; border-radius:14px; width:90%; max-width:480px; max-height:85vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,.2) }
.edit-modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid #e5e7eb; position:sticky; top:0; background:#fff; z-index:1 }
.edit-modal-header h3 { margin:0; font-size:1rem; font-weight:700; color:#1e293b }
.edit-modal-close { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background .2s }
.edit-modal-close:hover { background:#f1f5f9 }
.edit-modal-body { padding:18px }
.edit-form-group { margin-bottom:14px }
.edit-form-label { display:block; font-size:.85rem; font-weight:600; color:#475569; margin-bottom:6px }
.edit-form-input,.edit-form-textarea { width:100%; padding:10px 12px; border:2px solid #e5e7eb; border-radius:8px; font-size:13px; font-family:inherit; outline:none; transition:border-color .2s }
.edit-form-input:focus,.edit-form-textarea:focus { border-color:#0284c7 }
.edit-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px }
.char-count { font-size:.75rem; color:#94a3b8; float:left }
.edit-modal-footer { display:flex; gap:10px; padding:14px 18px; border-top:1px solid #e5e7eb; position:sticky; bottom:0; background:#fff }
.btn-cancel { flex:1; padding:10px; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:8px; cursor:pointer; font-size:.9rem; font-weight:600; color:#1e293b; transition:background .2s; font-family:inherit }
.btn-cancel:hover { background:#e2e8f0 }
.btn-save { flex:1; padding:10px; background:linear-gradient(135deg,#0284c7,#0369a1); border:none; border-radius:8px; color:#fff; cursor:pointer; font-size:.9rem; font-weight:600; transition:all .2s; font-family:inherit }
.btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(2,132,199,.3) }
.btn-save:disabled { opacity:.6; cursor:not-allowed; transform:none }

/* ===== CONFIRM MODAL ===== */
.confirm-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:3000; backdrop-filter:blur(4px) }
.confirm-modal { background:#fff; border-radius:14px; width:90%; max-width:360px; padding:28px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,.2) }
.confirm-icon { font-size:2.5rem; margin-bottom:14px }
.confirm-modal h3 { font-size:1.1rem; font-weight:700; color:#1e293b; margin:0 0 8px }
.confirm-modal p { color:#64748b; font-size:.9rem; line-height:1.5; margin:0 0 20px }
.confirm-modal-actions { display:flex; gap:10px }
.btn-delete-confirm { flex:1; padding:10px; background:#ef4444; border:none; border-radius:8px; color:#fff; cursor:pointer; font-size:.9rem; font-weight:600; transition:all .2s; font-family:inherit }
.btn-delete-confirm:hover:not(:disabled) { background:#dc2626; transform:translateY(-1px) }
.btn-delete-confirm:disabled { opacity:.6; cursor:not-allowed }

/* ===== NOT FOUND ===== */
.not-found-instagram { text-align:center; padding:80px 16px; background:#f8fafc; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; color:#94a3b8 }
.not-found-instagram h2 { font-size:1.5rem; font-weight:700; color:#1e293b }
.btn-home-instagram { padding:9px 24px; background:#0284c7; color:#fff; text-decoration:none; border-radius:8px; font-size:.9rem; font-weight:600; transition:all .2s }
.btn-home-instagram:hover { background:#0369a1; transform:translateY(-1px) }

/* ===== TOAST ===== */
.custom-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); z-index:10000; animation:slideUp .3s ease }
.custom-toast.fade-out { animation:fadeOut .5s ease forwards }
.toast-content { background:#1e293b; color:#fff; padding:10px 20px; border-radius:24px; font-size:.9rem; box-shadow:0 4px 16px rgba(0,0,0,.25); white-space:nowrap }
.custom-toast.error .toast-content { background:#ef4444 }
.custom-toast.warning .toast-content { background:#f59e0b }
@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
@keyframes fadeOut { from { opacity:1 } to { opacity:0 } }

/* ===== TRANSITIONS ===== */
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .2s ease }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0 }
.fade-enter-active,.fade-leave-active { transition:opacity .15s ease }
.fade-enter-from,.fade-leave-to { opacity:0 }

/* ===== CART BUTTON ===== */
.cart-btn { position:relative }
.cart-badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:9px; font-weight:700; padding:1px 4px; border-radius:99px; min-width:16px }

/* ===== VENDOR CART INFO BAR ===== */
.vendor-cart-info-bar { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-bottom:2px solid #22c55e; padding:8px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px }
.cart-info-content { display:flex; align-items:center; gap:16px; flex-wrap:wrap; width:100%; justify-content:space-between }
.cart-icon { font-size:1.2rem }
.cart-text { font-size:.85rem; color:#166534 }
.cart-vendor { font-size:.8rem; color:#15803d; background:#bbf7d0; padding:2px 10px; border-radius:20px }
.btn-view-cart { background:#22c55e; color:#fff; border:none; padding:5px 16px; border-radius:20px; cursor:pointer; font-size:.8rem; font-weight:600; transition:all .2s }
.btn-view-cart:hover { background:#16a34a; transform:translateY(-1px) }
.btn-clear-cart { background:#fef2f2; color:#ef4444; border:1px solid #fecaca; padding:5px 12px; border-radius:20px; cursor:pointer; font-size:.8rem; transition:all .2s }
.btn-clear-cart:hover { background:#fee2e2 }

/* ===== GRID CART BUTTON ===== */
.grid-cart-btn { position:absolute; top:7px; right:7px; width:28px; height:28px; background:rgba(34,197,94,.9); backdrop-filter:blur(4px); border:none; border-radius:50%; cursor:pointer; z-index:10; display:flex; align-items:center; justify-content:center; transition:all .2s }
.grid-cart-btn:hover:not(:disabled) { background:#16a34a; transform:scale(1.05) }
.grid-cart-btn:disabled { background:rgba(100,116,139,.7); cursor:not-allowed }
.grid-cart-btn svg { width:14px; height:14px }

/* ===== RESPONSIVE ===== */

/* ── 1024px ── */
@media (max-width:1024px) {
  .stats-overview-grid { grid-template-columns:repeat(3,1fr) }
  .stats-cards { grid-template-columns:repeat(3,1fr) }
}

/* ── 768px ── */
@media (max-width:768px) {
  /* Sidebar masquée → barre de nav en bas */
  .sidebar { display:none }

  /* Layout: colonne unique, scrollable */
  .app-layout { flex-direction:column }
  .main-content { width:100%; min-height:0 }
  .view-content { padding:12px 14px; padding-bottom:calc(72px + env(safe-area-inset-bottom, 0px)) }

  /* Cover photo */
  .cover-photo-container { height:160px }
  .change-cover-btn { padding:5px 10px; font-size:.78rem }

  /* Profile header */
  .profile-header {
    flex-direction:column;
    align-items:center;
    text-align:center;
    margin-top:-32px;
    margin-bottom:12px;
    gap:0
  }
  .avatar-container { width:100px; height:100px }
  .profile-info-section { width:100%; padding:0 12px }
  .profile-actions-row { justify-content:center; flex-wrap:wrap; gap:8px }
  .profile-username { font-size:1.4rem; text-align:center }
  .profile-stats-instagram { justify-content:center; gap:20px; flex-wrap:wrap }
  .profile-bio-instagram { text-align:center }
  .bio-meta { justify-content:center }
  .action-buttons { justify-content:center }

  /* Create post */
  .facebook-create-post-section { margin:0 0 12px; border-radius:10px }
  .facebook-post-actions { justify-content:space-around }
  .facebook-action-btn span { display:none }

  /* Posts filter */
  .posts-filter-bar { padding:0 0 10px; overflow-x:auto; flex-wrap:nowrap; -webkit-overflow-scrolling:touch }
  .filter-pill { flex-shrink:0; white-space:nowrap }

  /* Instagram grid */
  .instagram-grid { gap:2px }
  .posts-grid-instagram { padding:0 0 12px }

  /* Post modal: full-screen slide-up */
  .post-modal-overlay { align-items:flex-end; padding:0 }
  .post-modal-container {
    position:relative;
    width:100%;
    max-width:100%;
    max-height:97dvh;
    border-radius:20px 20px 0 0;
    overflow:hidden
  }
  .close-modal-btn { top:-40px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,.2); border-radius:50% }
  .post-modal-content { flex-direction:column }
  .post-modal-image { min-height:52vw; max-height:60vw }
  .post-modal-info { max-height:50dvh; overflow-y:auto }

  /* Orders stats cards */
  .stats-cards { grid-template-columns:repeat(3,1fr); gap:8px }
  .stat-card-order { padding:10px 8px; gap:6px }
  .stat-card-order .stat-value { font-size:1.1rem }
  .stat-card-order .stat-icon { width:32px; height:32px; font-size:1rem }

  /* Filters bar */
  .filters-bar { flex-direction:column; gap:8px }
  .search-input { max-width:100%; width:100% }
  .filter-select { width:100% }

  /* Responsive table */
  .data-table thead { display:none }
  .data-table tbody tr { display:block; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:10px; padding:4px 0; background:#fff }
  .data-table td {
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px 14px;
    border-bottom:1px solid #f1f5f9;
    font-size:.82rem
  }
  .data-table td:last-child { border-bottom:none }
  .data-table td::before { content:attr(data-label); font-weight:600; color:#64748b; margin-left:8px }
  .row-pending { border-right:3px solid #f59e0b }
  .row-actions { flex-wrap:wrap; gap:4px }
  .orders-page-header { flex-wrap:wrap; gap:8px }
  .orders-page-header h2 { font-size:1.2rem }
  .header-actions { gap:6px }
  .btn-refresh, .btn-export { padding:6px 12px; font-size:.78rem }

  /* Stats overview */
  .stats-overview-grid { grid-template-columns:repeat(2,1fr); gap:12px }
  .overview-card { padding:14px; gap:10px }
  .overview-icon { font-size:1.6rem }
  .overview-value { font-size:1.3rem }

  /* Inbox */
  .inbox-header { flex-wrap:wrap; gap:8px }
  .inbox-header h2 { font-size:1.2rem }
  .btn-mark-all-read { padding:6px 12px; font-size:.78rem }

  /* Cart info bar */
  .vendor-cart-info-bar { padding:8px 12px }
  .cart-info-content { gap:8px; justify-content:flex-start }
  .cart-text { font-size:.75rem }
  .cart-vendor { display:none /* masqué sur petit écran */ }

  /* Followers modal */
  .followers-modal-overlay { align-items:flex-end; padding:0 }
  .followers-modal {
    width:100%;
    max-width:100%;
    border-radius:20px 20px 0 0;
    max-height:85dvh
  }
  .followers-modal.order-modal { max-width:100% }

  /* Edit modal */
  .edit-modal {
    width:100%;
    max-width:100%;
    border-radius:20px 20px 0 0;
    max-height:92dvh
  }
  .edit-modal-overlay { align-items:flex-end; padding:0 }

  /* Items table in order modal */
  .items-table { font-size:.78rem }
  .modal-footer-actions { flex-direction:column; gap:8px }
  .status-select.modal-select { width:100% }
}

/* ── 480px ── */
@media (max-width:480px) {
  /* Cover */
  .cover-photo-container { height:130px }
  .change-cover-btn span { display:none }
  .change-cover-btn { padding:5px 8px }

  /* Avatar */
  .avatar-container { width:84px; height:84px }
  .profile-username { font-size:1.2rem }

  /* Stats bar */
  .profile-stats-instagram { gap:14px }
  .stat-number { font-size:.95rem }
  .stat-label { font-size:.78rem }
  .stars-display-green { padding:3px 6px }
  .stars-row-big span { font-size:.85rem }

  /* Action buttons */
  .btn-edit-profile { padding:5px 10px; font-size:.78rem }
  .btn-follow { padding:5px 14px; font-size:.78rem }

  /* Stats cards */
  .stats-cards { grid-template-columns:repeat(2,1fr) }

  /* Stats overview */
  .stats-overview-grid { grid-template-columns:1fr 1fr }

  /* Facebook post */
  .facebook-action-btn { padding:5px 8px }

  /* Prevent iOS zoom on inputs */
  input, select, textarea { font-size:16px !important }

  /* Post modal image ratio */
  .post-modal-image { min-height:56vw; max-height:56vw }

  /* Toast */
  .custom-toast { left:12px; right:12px; transform:none; width:auto }
  .toast-content { text-align:center; white-space:normal; font-size:.82rem }
}

/* ── Bottom navigation bar — styles gérés dans le bloc <style> global via Teleport ── */
/* ============================================
   📱 VENDOR PROFILE - DESIGN MOBILE ORGANISÉ
   Premium • Structuré • WAAW
============================================ */

/* ----- MOBILE (max-width: 768px) ----- */
@media (max-width: 768px) {

  /* ===== LAYOUT ===== */
  .app-layout {
    flex-direction: column !important;
  }

  .main-content {
    width: 100% !important;
    min-height: 0 !important;
    padding-bottom: 80px !important; /* Espace pour la barre de navigation */
  }

  .view-content {
    padding: 12px 14px !important;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
  }

  /* ===== COVER PHOTO ===== */
  .cover-photo-container {
    height: 150px !important;
    border-radius: 0 !important;
  }

  .cover-photo {
    object-fit: cover !important;
  }

  .change-cover-btn {
    bottom: 10px !important;
    left: 10px !important;
    padding: 6px 12px !important;
    font-size: 12px !important;
    border-radius: 20px !important;
  }

  .change-cover-btn span {
    display: inline !important;
    font-size: 11px !important;
  }

  .change-cover-btn svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* ===== PROFILE HEADER - CENTRÉ ET ORGANISÉ ===== */
  .profile-header {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    margin-top: -40px !important;
    margin-bottom: 16px !important;
    gap: 12px !important;
    padding: 0 12px !important;
  }

  .profile-avatar-section {
    margin-bottom: 4px !important;
  }

  .avatar-container {
    width: 100px !important;
    height: 100px !important;
  }

  .profile-avatar {
    border-width: 3px !important;
  }

  .avatar-edit-btn {
    width: 28px !important;
    height: 28px !important;
    bottom: 2px !important;
    left: 2px !important;
    opacity: 1 !important; /* Toujours visible */
    background: #0284c7 !important;
  }

  .avatar-edit-btn svg {
    width: 12px !important;
    height: 12px !important;
  }

  .verified-badge-instagram {
    width: 22px !important;
    height: 22px !important;
    bottom: 2px !important;
    right: 2px !important;
  }

  .verified-badge-instagram svg {
    width: 14px !important;
    height: 14px !important;
  }

  /* ===== PROFILE INFO ===== */
  .profile-info-section {
    width: 100% !important;
    padding: 0 !important;
    text-align: center !important;
  }

  .profile-actions-row {
    flex-direction: column !important;
    align-items: center !important;
    gap: 10px !important;
    margin-bottom: 12px !important;
  }

  .profile-username {
    font-size: 20px !important;
    text-align: center !important;
    margin: 0 !important;
  }

  .action-buttons {
    justify-content: center !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    width: 100% !important;
  }

  .btn-edit-profile {
    padding: 8px 16px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
    width: 100% !important;
    max-width: 280px !important;
    text-align: center !important;
  }

  .btn-share-profile,
  .btn-message-instagram {
    width: 38px !important;
    height: 38px !important;
    border-radius: 8px !important;
  }

  .btn-follow {
    padding: 8px 20px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
    width: 100% !important;
    max-width: 280px !important;
    text-align: center !important;
  }

  /* ===== STATS - EN LIGNE CENTRÉES ===== */
  .profile-stats-instagram {
    display: flex !important;
    justify-content: center !important;
    gap: 20px !important;
    margin-bottom: 14px !important;
    flex-wrap: wrap !important;
    padding: 10px 0 !important;
    border-top: 1px solid #e2e8f0 !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .stat-item {
    text-align: center !important;
    cursor: pointer !important;
    padding: 4px 8px !important;
  }

  .stat-number {
    font-size: 16px !important;
    font-weight: 800 !important;
  }

  .stat-label {
    font-size: 11px !important;
  }

  /* Stars */
  .stars-display-green {
    padding: 4px 8px !important;
    border-radius: 10px !important;
  }

  .stars-row-big span {
    font-size: 14px !important;
  }

  .rating-number {
    font-size: 14px !important;
  }

  /* ===== BIO ===== */
  .profile-bio-instagram {
    text-align: center !important;
    margin-bottom: 12px !important;
    padding: 0 8px !important;
  }

  .bio-name {
    font-size: 15px !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
  }

  .bio-text {
    font-size: 13px !important;
    line-height: 1.5 !important;
  }

  .bio-link a {
    font-size: 12px !important;
  }

  .bio-meta {
    justify-content: center !important;
    gap: 10px !important;
    margin-top: 6px !important;
    flex-wrap: wrap !important;
  }

  .bio-meta span {
    font-size: 12px !important;
  }

  /* ===== CREATE POST ===== */
  .facebook-create-post-section {
    margin: 0 0 14px !important;
    border-radius: 12px !important;
    padding: 10px 12px !important;
  }

  .facebook-post-header {
    gap: 8px !important;
    margin-bottom: 8px !important;
  }

  .facebook-avatar {
    width: 36px !important;
    height: 36px !important;
  }

  .facebook-post-button {
    padding: 10px 14px !important;
    font-size: 13px !important;
    border-radius: 20px !important;
  }

  .facebook-post-actions {
    justify-content: space-around !important;
    padding-top: 6px !important;
  }

  .facebook-action-btn {
    padding: 6px 10px !important;
    font-size: 12px !important;
    gap: 4px !important;
  }

  .facebook-action-btn svg {
    width: 14px !important;
    height: 14px !important;
  }

  .facebook-action-btn span {
    display: inline !important;
    font-size: 11px !important;
  }

  /* ===== POSTS FILTER ===== */
  .posts-filter-bar {
    padding: 0 0 10px !important;
    gap: 6px !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
  }

  .filter-pill {
    padding: 6px 14px !important;
    font-size: 12px !important;
    border-radius: 20px !important;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }

  /* ===== POSTS GRID ===== */
  .posts-grid-instagram {
    padding: 0 0 16px !important;
  }

  .instagram-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 4px !important;
  }

  .grid-post {
    border-radius: 4px !important;
  }

  .grid-post-image {
    transition: none !important;
  }

  .grid-wishlist-btn {
    width: 26px !important;
    height: 26px !important;
    top: 6px !important;
    left: 6px !important;
  }

  .grid-wishlist-btn svg {
    width: 12px !important;
    height: 12px !important;
  }

  .grid-cart-btn {
    width: 26px !important;
    height: 26px !important;
    top: 6px !important;
    right: 6px !important;
  }

  .grid-cart-btn svg {
    width: 12px !important;
    height: 12px !important;
  }

  /* Overlay */
  .post-overlay-instagram {
    background: rgba(0, 0, 0, 0.4) !important;
  }

  .post-stats {
    gap: 8px !important;
  }

  .stat {
    font-size: 12px !important;
  }

  .stat svg {
    width: 12px !important;
    height: 12px !important;
  }

  .post-price-overlay {
    font-size: 11px !important;
    padding: 2px 6px !important;
  }

  .post-rating-badge {
    bottom: 6px !important;
    left: 6px !important;
    padding: 2px 6px !important;
    font-size: 10px !important;
  }

  .pinned-badge-instagram {
    top: 6px !important;
    right: 6px !important;
    font-size: 12px !important;
  }

  .out-of-stock-badge {
    bottom: 6px !important;
    right: 6px !important;
    padding: 2px 6px !important;
    font-size: 10px !important;
  }

  /* ===== EMPTY STATE ===== */
  .empty-state-instagram {
    padding: 40px 16px !important;
  }

  .empty-state-instagram svg {
    width: 48px !important;
    height: 48px !important;
  }

  .empty-state-instagram p {
    font-size: 14px !important;
    margin: 8px 0 16px !important;
  }

  .btn-create-instagram {
    padding: 8px 20px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
  }

  /* ===== ORDERS VIEW ===== */
  .orders-page-header {
    flex-wrap: wrap !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }

  .orders-page-header h2 {
    font-size: 18px !important;
  }

  .header-actions {
    gap: 6px !important;
    width: 100% !important;
  }

  .btn-refresh,
  .btn-export {
    padding: 8px 14px !important;
    font-size: 12px !important;
    border-radius: 8px !important;
    flex: 1 !important;
    text-align: center !important;
    justify-content: center !important;
  }

  /* Stats Cards */
  .stats-cards {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }

  .stat-card-order {
    padding: 10px 8px !important;
    border-radius: 10px !important;
    gap: 6px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .stat-card-order .stat-icon {
    width: 32px !important;
    height: 32px !important;
    border-radius: 8px !important;
    font-size: 16px !important;
  }

  .stat-card-order .stat-value {
    font-size: 18px !important;
  }

  .stat-card-order .stat-label {
    font-size: 11px !important;
  }

  /* Filters */
  .filters-bar {
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }

  .filter-select {
    width: 100% !important;
    padding: 10px 14px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
  }

  .search-input {
    max-width: 100% !important;
    width: 100% !important;
    padding: 10px 14px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
  }

  .btn-clear-filter {
    width: 100% !important;
    text-align: center !important;
    justify-content: center !important;
    padding: 8px !important;
    font-size: 12px !important;
  }

  /* Table */
  .data-table thead {
    display: none !important;
  }

  .data-table tbody tr {
    display: block !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    margin-bottom: 10px !important;
    padding: 4px 0 !important;
    background: #ffffff !important;
  }

  .data-table td {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 10px 14px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    font-size: 13px !important;
  }

  .data-table td:last-child {
    border-bottom: none !important;
  }

  .data-table td::before {
    content: attr(data-label) !important;
    font-weight: 600 !important;
    color: #64748b !important;
    font-size: 11px !important;
  }

  .row-pending {
    border-right: 3px solid #f59e0b !important;
  }

  .price-cell {
    color: #ef4444 !important;
    font-weight: 700 !important;
  }

  .status-select {
    padding: 6px 10px !important;
    font-size: 12px !important;
    border-radius: 6px !important;
  }

  .row-actions {
    flex-wrap: wrap !important;
    gap: 6px !important;
    justify-content: flex-end !important;
    width: 100% !important;
  }

  .action-btn.view,
  .action-btn.print {
    padding: 6px 10px !important;
    font-size: 12px !important;
    border-radius: 6px !important;
  }

  /* ===== STATS VIEW ===== */
  .stats-view h2 {
    font-size: 18px !important;
    margin-bottom: 14px !important;
  }

  .stats-overview-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
    margin-bottom: 20px !important;
  }

  .overview-card {
    padding: 12px !important;
    border-radius: 12px !important;
    gap: 10px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .overview-icon {
    font-size: 24px !important;
  }

  .overview-value {
    font-size: 18px !important;
  }

  .overview-label {
    font-size: 11px !important;
  }

  /* Top Products */
  .top-products-section h3 {
    font-size: 16px !important;
    margin-bottom: 12px !important;
  }

  .top-product-item {
    padding: 10px 12px !important;
    gap: 10px !important;
  }

  .top-product-img {
    width: 40px !important;
    height: 40px !important;
    border-radius: 8px !important;
  }

  .top-product-name {
    font-size: 13px !important;
  }

  .top-product-stats {
    font-size: 11px !important;
  }

  .btn-view-product {
    padding: 4px 10px !important;
    font-size: 11px !important;
  }

  /* ===== INBOX ===== */
  .message-item {
    padding: 12px !important;
    gap: 10px !important;
  }

  .msg-avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .msg-sender {
    font-size: 14px !important;
  }

  .msg-time {
    font-size: 11px !important;
  }

  .msg-preview {
    font-size: 12px !important;
  }

  /* ===== MODALS ===== */
  .followers-modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .followers-modal {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    max-height: 85dvh !important;
  }

  .followers-modal.order-modal {
    max-width: 100% !important;
  }

  .modal-footer-actions {
    flex-direction: column !important;
    gap: 8px !important;
  }

  .modal-footer-actions select,
  .modal-footer-actions .btn-cancel {
    width: 100% !important;
  }

  /* Post Modal */
  .post-modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .post-modal-container {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    max-height: 95dvh !important;
  }

  .post-modal-content {
    flex-direction: column !important;
  }

  .post-modal-image {
    min-height: 50vw !important;
    max-height: 55vw !important;
  }

  .post-modal-info {
    max-height: 50dvh !important;
    overflow-y: auto !important;
  }

  .close-modal-btn {
    top: -40px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
  }

  /* Edit Modal */
  .edit-modal-overlay {
    align-items: flex-end !important;
    padding: 0 !important;
  }

  .edit-modal {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    max-height: 90dvh !important;
  }

  .edit-form-row {
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }

  /* Confirm Modal */
  .confirm-modal {
    width: 90% !important;
    max-width: 340px !important;
    padding: 24px !important;
  }

  /* ===== CART INFO BAR ===== */
  .vendor-cart-info-bar {
    padding: 8px 12px !important;
    flex-wrap: wrap !important;
  }

  .cart-info-content {
    gap: 8px !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }

  .cart-icon {
    font-size: 18px !important;
  }

  .cart-text {
    font-size: 12px !important;
  }

  .cart-vendor {
    display: none !important;
  }

  .btn-view-cart {
    padding: 6px 12px !important;
    font-size: 12px !important;
    border-radius: 16px !important;
  }

  .btn-clear-cart {
    padding: 6px 10px !important;
    font-size: 12px !important;
  }

  /* ===== TOAST ===== */
  .custom-toast {
    left: 12px !important;
    right: 12px !important;
    bottom: 90px !important; /* Au-dessus de la barre de navigation */
    transform: none !important;
    width: auto !important;
  }

  .toast-content {
    text-align: center !important;
    white-space: normal !important;
    font-size: 13px !important;
    padding: 10px 16px !important;
  }

  /* ===== BOTTOM NAV SPACING ===== */
  .view-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

/* ===== TRÈS PETIT MOBILE (max-width: 400px) ----- */
@media (max-width: 400px) {
  .cover-photo-container {
    height: 120px !important;
  }

  .avatar-container {
    width: 80px !important;
    height: 80px !important;
  }

  .profile-username {
    font-size: 18px !important;
  }

  .profile-stats-instagram {
    gap: 14px !important;
  }

  .stat-number {
    font-size: 14px !important;
  }

  .stat-label {
    font-size: 10px !important;
  }

  .instagram-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 3px !important;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .stats-overview-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .overview-value {
    font-size: 16px !important;
  }

  .btn-edit-profile,
  .btn-follow {
    max-width: 100% !important;
  }
}

/* ===== FIX iOS SAFARI ===== */
@supports (-webkit-touch-callout: none) {
  .view-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .custom-toast {
    bottom: calc(90px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

/* ===== DARK MODE SUPPORT ===== */
@media (max-width: 768px) {
  .vendor-profile-page.dark-mode .profile-stats-instagram {
    border-color: #334155 !important;
  }

  .vendor-profile-page.dark-mode .data-table tbody tr {
    background: #1e293b !important;
    border-color: #334155 !important;
  }
}
</style>
