// frontend/src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
// frontend/src/main.js
import './assets/theme.css'  // <-- IMPORTANT


// Messages de traduction
const messages = {
  ar: {
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      categories: 'التصنيفات',
      artisans: 'الحرفيون',
      about: 'من نحن',
      contact: 'اتصل بنا'
    },
    actions: {
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      register: 'إنشاء حساب',
      cart: 'السلة',
      favorites: 'المفضلة',
      addToCart: 'أضف إلى السلة',
      removeFromCart: 'إزالة من السلة',
      quickView: 'عرض سريع'
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      save: 'حفظ',
      cancel: 'إلغاء',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      price: 'السعر',
      quantity: 'الكمية',
      total: 'المجموع',
      sponsored: 'مميز',
      new: 'جديد',
      favorite: 'المفضلة',
      vendor: 'حرفي',
      like: 'إعجاب',
      unlike: 'إزالة الإعجاب',
      share: 'مشاركة',
      copy: 'نسخ'
    },
    products: {
      title: 'المنتجات',
      subtitle: 'اكتشف منتجاتنا',
      all: 'جميع المنتجات',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      priceAsc: 'السعر: الأقل أولاً',
      priceDesc: 'السعر: الأعلى أولاً',
      topRated: 'الأعلى تقييماً',
      popular: 'الأكثر مبيعاً',
      inCart: 'في السلة',
      addToCart: 'أضف إلى السلة',
      outOfStock: 'غير متوفر'
    },
    vendor: {
      profile: 'الملف الشخصي',
      shop: 'المتجر',
      verified: 'موثوق',
      products: 'المنتجات',
      followers: 'المتابعون',
      following: 'يتابع',
      contact: 'اتصل بالبائع',
      message: 'رسالة',
      follow: 'متابعة',
      unfollow: 'إلغاء المتابعة'
    },
    search: {
      placeholder: 'ابحث عن منتج...',
      noResults: 'لا توجد نتائج',
      tryDifferent: 'جرب كلمات بحث مختلفة'
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Produits',
      categories: 'Catégories',
      artisans: 'Artisans',
      about: 'À propos',
      contact: 'Contact'
    },
    actions: {
      login: 'Connexion',
      logout: 'Déconnexion',
      register: 'Inscription',
      cart: 'Panier',
      favorites: 'Favoris',
      addToCart: 'Ajouter au panier',
      removeFromCart: 'Retirer du panier',
      quickView: 'Aperçu rapide'
    },
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      save: 'Enregistrer',
      cancel: 'Annuler',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      price: 'Prix',
      quantity: 'Quantité',
      total: 'Total',
      sponsored: 'Sponsorisé',
      new: 'Nouveau',
      favorite: 'Favori',
      vendor: 'Artisan',
      like: 'J\'aime',
      unlike: 'Je n\'aime plus',
      share: 'Partager',
      copy: 'Copier'
    },
    products: {
      title: 'Produits',
      subtitle: 'Découvrez nos produits',
      all: 'Tous les produits',
      sortBy: 'Trier par',
      newest: 'Plus récents',
      priceAsc: 'Prix: croissant',
      priceDesc: 'Prix: décroissant',
      topRated: 'Mieux notés',
      popular: 'Plus vendus',
      inCart: 'Dans le panier',
      addToCart: 'Ajouter au panier',
      outOfStock: 'Rupture de stock'
    },
    vendor: {
      profile: 'Profil',
      shop: 'Boutique',
      verified: 'Vérifié',
      products: 'Produits',
      followers: 'Abonnés',
      following: 'Abonnements',
      contact: 'Contacter',
      message: 'Message',
      follow: 'Suivre',
      unfollow: 'Ne plus suivre'
    },
    search: {
      placeholder: 'Rechercher un produit...',
      noResults: 'Aucun résultat',
      tryDifferent: 'Essayez différents mots-clés'
    }
  }
};

// Récupérer la langue sauvegardée ou utiliser l'arabe par défaut
const savedLocale = localStorage.getItem('locale') || 'ar';

// Créer l'instance i18n
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'ar',
  messages,
  globalInjection: true,
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n); // ← TRÈS IMPORTANT: installer i18n

// Rendre $t disponible globalement
app.config.globalProperties.$t = i18n.global.t;

app.mount('#app');
