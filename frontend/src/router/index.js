import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../views/Homepage.vue'
import Login from '../views/Login.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import PendingReels from '../views/admin/PendingReels.vue'
import Orders from '../views/Orders.vue'
import SponsoredProducts from '../views/admin/SponsoredProducts.vue'
import VendorPasswords from '../views/admin/VendorPasswords.vue'
const routes = [
  // ===== ROUTES PUBLIQUES (accessibles SANS connexion) =====
  { path: '/', name: 'home', component: Homepage },
  { path: '/login', name: 'login', component: Login },
  { path: '/products', name: 'products', component: () => import('../views/Products.vue') },
  { path: '/artisans', name: 'artisans', component: () => import('../views/Artisans.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/Contact.vue') },
  { path: '/product/:id', name: 'product-detail', component: () => import('../views/ProductDetail.vue') },
  { path: '/become-vendor', name: 'become-vendor', component: () => import('../views/BecomeVendor.vue') },
  { path: '/vendor/:name', name: 'vendor', component: () => import('../views/VendorProfile.vue') },

  // ===== ROUTES PROTÉGÉES (connexion requise) =====
  { path: '/vendor/edit/:id', name: 'VendorEdit', component: () => import('../views/VendorEdit.vue'), meta: { auth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue'), meta: { auth: true } },
  { path: '/orders', name: 'Orders', component: Orders, meta: { auth: true } },
  { path: '/checkout', name: 'checkout', component: () => import('../views/Checkout.vue'), meta: { auth: true } },
  { path: '/order-details/:id', name: 'OrderDetails', component: () => import('../views/OrderDetails.vue'), meta: { auth: true } },
  { path: '/order-tracking/:id', name: 'OrderTracking', component: () => import('../views/OrderTracking.vue'), meta: { auth: true } },
  { path: '/order-confirmation/:id', name:
    'OrderConfirmation', component: () => import('../views/OrderConfirmation.vue'), meta: { auth: true } },
  { path: '/notification-settings', name: 'NotificationSettings', component: () => import('../views/NotificationSettings.vue'), meta: { auth: true } },

  // ===== ADMIN =====
  {
    path: '/admin', component: AdminLayout, meta: { auth: true, admin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/users.vue') },
      { path: 'pending-reels', name: 'PendingReels', component: PendingReels },
      { path: 'vendors', name: 'admin-vendors', component: () => import('../views/admin/Vendors.vue') },
      { path: 'products', name: 'admin-products', component: () => import('../views/admin/Products.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('../views/admin/Orders.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('../views/admin/Categories.vue') },
      { path: 'offers', name: 'admin-offers', component: () => import('../views/admin/OffersManagement.vue') },
      { path: 'pending-posts', name: 'admin-pending-posts', component: () => import('../views/admin/PendingPosts.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('../views/admin/Settings.vue') },
      { path: 'pending-vendors', name: 'admin-pending-vendors', component: () => import('../views/admin/PendingVendors.vue') },
      { path: 'statistics', name: 'admin-statistics', component: () => import('../views/admin/Statistics.vue') },
      { path: 'contact-messages', name: 'AdminContactMessages', component: () => import('../views/admin/ContactMessages.vue') },
      // Dans router/index.js
// Dans votre router/index.js


// Dans les routes admin
{
  path: '/admin/vendors-passwords',
  name: 'AdminVendorPasswords',
  component: VendorPasswords,
  meta: { requiresAuth: true, role: 'admin' }
},

// Dans le tableau routes, ajoutez :
{
  path: '/admin/sponsored-products',
  name: 'SponsoredProducts',
  component: SponsoredProducts,
  meta: { requiresAuth: true, role: 'admin' }
},
    ],
  },

  // 404
  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

// ✅ GUARD SIMPLE
router.beforeEach((to, from, next) => {
  // Vérifier le localStorage au lieu du store Pinia
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const isLoggedIn = !!(token && userStr)

  let role = 'customer'
  if (userStr) {
    try { role = JSON.parse(userStr).role || 'customer' } catch (e) {}
  }

  // Si la route nécessite auth
  if (to.meta.auth) {
    if (!isLoggedIn) {
      return next('/login')
    }
    if (to.meta.admin && role !== 'admin') {
      return next('/')
    }
  }

  // Si connecté et va sur /login → rediriger
  if (to.path === '/login' && isLoggedIn) {
    if (role === 'pending') return next('/pending-vendor')
    if (role === 'admin') return next('/admin')
    return next('/')
  }

  // Sinon laisser passer
  next()
})

export default router
