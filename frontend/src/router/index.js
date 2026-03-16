// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Import des vues
import Homepage from '../views/Homepage.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Homepage,
    meta: {
      title: 'الرئيسية - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'تسجيل الدخول - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../views/Products.vue'),
    meta: {
      title: 'المنتجات - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/Favorites.vue'),
    meta: {
      title: 'المفضلة - توراث',
      requiresAuth: true,
    },
  },
  {
    path: '/vendor/:id',
    name: 'vendor',
    component: () => import('../views/VendorProfile.vue'),
    meta: {
      title: 'ملف الحرفي - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: 'الملف الشخصي - توراث',
      requiresAuth: true,
    },
  },
  {
    path: '/become-vendor',
    name: 'become-vendor',
    component: () => import('../views/BecomeVendor.vue'),
    meta: {
      title: 'انضم كبائع - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/artisans',
    name: 'artisans',
    component: () => import('../views/Artisans.vue'),
    meta: {
      title: 'الحرفيون - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'من نحن - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: 'اتصل بنا - توراث',
      requiresAuth: false,
    },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/Checkout.vue'),
    meta: {
      title: 'إتمام الطلب - توراث',
      requiresAuth: true,
    },
  },
  // ========== ADMIN ROUTES ==========
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: {
      title: 'لوحة التحكم - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/admin/users.vue'),
    meta: {
      title: 'إدارة المستخدمين - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/vendors',
    name: 'admin-vendors',
    component: () => import('../views/admin/Vendors.vue'),
    meta: {
      title: 'إدارة البائعين - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('../views/admin/Products.vue'),
    meta: {
      title: 'إدارة المنتجات - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('../views/admin/Orders.vue'),
    meta: {
      title: 'إدارة الطلبات - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('../views/admin/Categories.vue'),
    meta: {
      title: 'إدارة التصنيفات - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/pending-posts',
    name: 'admin-pending-posts',
    component: () => import('../views/admin/PendingPosts.vue'),
    meta: {
      title: 'المنشورات في انتظار المراجعة - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/post/:id',
    name: 'admin-post-detail',
    component: () => import('../views/admin/PostDetail.vue'),
    meta: {
      title: 'تفاصيل المنشور - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/post/edit/:id',
    name: 'admin-post-edit',
    component: () => import('../views/admin/PostEdit.vue'),
    meta: {
      title: 'تعديل المنشور - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('../views/admin/Settings.vue'),
    meta: {
      title: 'الإعدادات - توراث',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'الصفحة غير موجودة - توراث',
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Guard de navigation
router.beforeEach(async (to, from, next) => {
  // Mettre à jour le titre
  document.title = to.meta.title || 'توراث - منصة الحرف اليدوية';

  // Attendre que le store auth soit initialisé
  const authStore = useAuthStore();

  // Vérifier l'authentification
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  // Routes qui nécessitent une authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Routes qui nécessitent les droits admin
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ path: '/' });
    return;
  }

  // Rediriger les utilisateurs connectés depuis login
  if (to.path === '/login' && isAuthenticated) {
    next({ path: '/' });
    return;
  }

  next();
});

export default router;
