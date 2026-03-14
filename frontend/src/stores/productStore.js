// frontend/src/stores/productStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useProductStore = defineStore('products', () => {
  const products = ref([]);
  const featuredProducts = ref([]);
  const sponsoredProducts = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const totalCount = ref(0);

  // Récupérer tous les produits avec filtres
  const fetchProducts = async (params = {}) => {
    loading.value = true;
    try {
      console.log('📦 Chargement des produits...', params);
      
      // Données de démonstration pour le développement
      const demoProducts = [
        {
          id: 1,
          name: 'سجادة تونسية تقليدية',
          price: 450,
          originalPrice: 550,
          image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
          rating: 4.8,
          reviews: 45,
          category: 'carpets',
          isSponsored: true,
          inStock: true,
          vendor: {
            id: 1,
            name: 'فخاريات الفخراني',
            avatar: 'https://i.pravatar.cc/150?img=12',
            verified: true
          }
        },
        {
          id: 2,
          name: 'إناء فخاري زخرفي',
          price: 120,
          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
          rating: 4.6,
          reviews: 32,
          category: 'pottery',
          inStock: true,
          vendor: {
            id: 2,
            name: 'فخاريات تونس',
            avatar: 'https://i.pravatar.cc/150?img=25',
            verified: true
          }
        },
        {
          id: 3,
          name: 'صينية نحاسية مطرقة',
          price: 280,
          image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
          rating: 4.9,
          reviews: 28,
          category: 'copperware',
          inStock: true,
          vendor: {
            id: 3,
            name: 'نحاسيات تونس',
            avatar: 'https://i.pravatar.cc/150?img=33',
            verified: true
          }
        },
        {
          id: 4,
          name: 'عقد تونسي تقليدي',
          price: 350,
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
          rating: 4.7,
          reviews: 51,
          category: 'jewelry',
          isNew: true,
          inStock: true,
          vendor: {
            id: 4,
            name: 'مجوهرات تونس',
            avatar: 'https://i.pravatar.cc/150?img=9',
            verified: true
          }
        }
      ];
      
      products.value = demoProducts;
      totalCount.value = demoProducts.length;
      
      console.log('✅ Produits chargés:', products.value.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Récupérer les produits en vedette
  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured').catch(() => null);
      if (response && response.data.data.products) {
        featuredProducts.value = response.data.data.products;
      } else {
        // Données de démonstration
        featuredProducts.value = [
          {
            id: 1,
            name: 'سجادة تونسية تقليدية',
            price: 450,
            image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
            rating: 4.8,
            vendor: { name: 'فخاريات الفخراني' }
          },
          {
            id: 2,
            name: 'إناء فخاري زخرفي',
            price: 120,
            image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
            rating: 4.6,
            vendor: { name: 'فخاريات تونس' }
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      featuredProducts.value = [];
    }
  };

  // Récupérer les produits sponsorisés
  const fetchSponsoredProducts = async () => {
    try {
      const response = await api.get('/products/sponsored').catch(() => null);
      if (response && response.data.data.products) {
        sponsoredProducts.value = response.data.data.products;
      } else {
        sponsoredProducts.value = [
          {
            id: 1,
            name: 'سجادة تونسية تقليدية',
            price: 450,
            originalPrice: 550,
            image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
            rating: 4.8,
            isSponsored: true
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching sponsored products:', error);
      sponsoredProducts.value = [];
    }
  };

  // Récupérer un produit par ID
  const fetchProductById = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/products/${id}`).catch(() => null);
      if (response && response.data.data.product) {
        currentProduct.value = response.data.data.product;
      } else {
        // Produit de démonstration
        currentProduct.value = {
          id: parseInt(id),
          name: 'سجادة تونسية تقليدية',
          price: 450,
          description: 'سجادة تونسية تقليدية مصنوعة يدوياً من الصوف الطبيعي',
          images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'],
          rating: 4.8,
          reviews: 45,
          inStock: true,
          vendor: {
            id: 1,
            name: 'فخاريات الفخراني',
            avatar: 'https://i.pravatar.cc/150?img=12',
            verified: true
          }
        };
      }
      return currentProduct.value;
    } catch (error) {
      console.error('Error fetching product:', error);
      currentProduct.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Rechercher des produits
  const searchProducts = async (query) => {
    loading.value = true;
    try {
      const response = await api.get('/products/search', { params: { q: query } }).catch(() => null);
      if (response && response.data.data.products) {
        products.value = response.data.data.products;
      } else {
        // Filtrage des produits de démo
        const demoProducts = await fetchProducts({}, true);
        products.value = demoProducts.filter(p => 
          p.name.includes(query) || 
          p.category?.includes(query)
        );
      }
      return products.value;
    } catch (error) {
      console.error('Error searching products:', error);
      products.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Récupérer les produits par catégorie
  const fetchProductsByCategory = async (category) => {
    loading.value = true;
    try {
      const response = await api.get(`/products/category/${category}`).catch(() => null);
      if (response && response.data.data.products) {
        products.value = response.data.data.products;
      } else {
        // Filtrage des produits de démo
        const demoProducts = await fetchProducts({}, true);
        products.value = demoProducts.filter(p => p.category === category);
      }
      return products.value;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      products.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Récupérer les produits d'un vendeur
  const fetchProductsByVendor = async (vendorId) => {
    try {
      const response = await api.get(`/products?vendorId=${vendorId}`).catch(() => null);
      if (response && response.data.data.products) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      return [];
    }
  };

  // Créer un produit (vendeur)
  const createProduct = async (productData) => {
    try {
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'colors' && key !== 'tags') {
          formData.append(key, productData[key]);
        }
      });
      
      if (productData.colors) {
        formData.append('colors', JSON.stringify(productData.colors));
      }
      
      if (productData.tags) {
        formData.append('tags', JSON.stringify(productData.tags));
      }
      
      if (productData.images && productData.images.length) {
        productData.images.forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(() => null);
      
      if (response) {
        return response.data.data.product;
      }
      
      // Simulation
      console.log('✅ Produit créé (simulation):', productData);
      return { id: Date.now(), ...productData };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // Like/Unlike produit
  const toggleLike = async (productId) => {
    try {
      const response = await api.post(`/products/${productId}/like`).catch(() => null);
      return response ? response.data.data : { liked: true };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  // Initialisation
  fetchFeaturedProducts();
  fetchSponsoredProducts();

  return {
    products,
    featuredProducts,
    sponsoredProducts,
    currentProduct,
    loading,
    totalPages,
    currentPage,
    totalCount,
    fetchProducts,
    fetchFeaturedProducts,
    fetchSponsoredProducts,
    fetchProductById,
    searchProducts,
    fetchProductsByCategory,
    fetchProductsByVendor,
    createProduct,
    toggleLike
  };
});