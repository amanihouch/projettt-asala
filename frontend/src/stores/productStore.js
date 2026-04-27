import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePostStore } from './postStore'
import api from '../services/api'

export const useProductStore = defineStore('products', () => {
  // ===== ACCÈS AU POST STORE =====
  const postStore = usePostStore()

  // ===== STATE =====
  const products = ref([])
  const sponsoredProducts = ref([])
  const featuredProducts = ref([])
  const newProducts = ref([])
  const discountedProducts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(12)

  // ===== INITIALISATION =====
  const initFromStorage = () => {
    // Charger les produits sponsorisés depuis localStorage
    const savedSponsored = localStorage.getItem('sponsoredProducts')
    if (savedSponsored) {
      try {
        sponsoredProducts.value = JSON.parse(savedSponsored)
        console.log('✅ Produits sponsorisés chargés depuis localStorage:', sponsoredProducts.value.length)
      } catch (e) {
        console.error('❌ Erreur parsing sponsoredProducts:', e)
        sponsoredProducts.value = []
      }
    }
  }

  // ===== COMPUTED - Utilise les données du postStore =====
  const getAllProducts = computed(() => {
    // Récupérer les posts et les transformer en produits
    const posts = postStore.getAllPosts() || []

    // Transformer les posts en format produit standardisé
    return posts.map(post => ({
      id: post.id,
      name: post.productName || post.name || 'منتج حرفي',
      productName: post.productName || post.name || 'منتج حرفي',
      price: post.price || 0,
      originalPrice: post.originalPrice || post.oldPrice || null,
      oldPrice: post.oldPrice || post.originalPrice || null,
      image: post.images?.[0] || post.image || 'https://placehold.co/300x400/08717f/white?text=منتج',
      images: post.images || (post.image ? [post.image] : []),
      rating: post.rating || 5.0,
      reviews: post.reviews || post.reviewCount || 0,
      likesCount: post.likes || post.likesCount || 0,
      likes: post.likes || post.likesCount || 0,
      isNew: post.isNew || false,
      isSponsored: post.isSponsored || false,
      description: post.description || post.content || '',
      category: post.category || null,
      color: post.color || null,
      material: post.material || null,
      size: post.size || null,
      vendor: post.vendor || {
        id: post.vendorId,
        name: post.vendorName,
        avatar: post.vendorAvatar,
        verified: post.vendorVerified
      },
      vendorId: post.vendorId || null,
      vendorName: post.vendorName || 'حرفي',
      vendorAvatar: post.vendorAvatar || null,
      vendorVerified: post.vendorVerified || false,
      createdAt: post.createdAt || new Date().toISOString()
    }))
  })

  const getSponsoredProducts = computed(() => {
    return sponsoredProducts.value
  })

  const getFeaturedProducts = computed(() => {
    if (featuredProducts.value.length > 0) return featuredProducts.value
    return getAllProducts.value.filter(p => p.isSponsored).slice(0, 8)
  })

  const getNewProducts = computed(() => {
    if (newProducts.value.length > 0) return newProducts.value
    return getAllProducts.value.filter(p => p.isNew).slice(0, 8)
  })

  const getDiscountedProducts = computed(() => {
    if (discountedProducts.value.length > 0) return discountedProducts.value
    return getAllProducts.value.filter(p => p.originalPrice).slice(0, 8)
  })

  const getProductById = (id) => {
    return getAllProducts.value.find(p => p.id === id) || null
  }

  const getProductsByCategory = (category) => {
    return getAllProducts.value.filter(p => p.category === category)
  }

  const getProductsByVendor = (vendorId) => {
    return getAllProducts.value.filter(p => p.vendorId === vendorId)
  }

  // ===== MÉTHODES POUR LES PRODUITS SPONSORISÉS =====

  /**
   * Récupérer les produits sponsorisés
   */
  const fetchSponsoredProducts = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Récupération des produits sponsorisés...')

      // 1. Toujours charger d'abord depuis localStorage pour la réactivité
      const saved = localStorage.getItem('sponsoredProducts')
      if (saved) {
        sponsoredProducts.value = JSON.parse(saved)
        console.log(`✅ ${sponsoredProducts.value.length} produits sponsorisés chargés depuis localStorage`)
      }

      // 2. Essayer l'API en parallèle pour synchroniser
      try {
        const response = await api.get('/products/sponsored')
        if (response.data.success) {
          const apiProducts = response.data.products || []

          // Si l'API a des produits, on les utilise (ils sont la source de vérité)
          if (apiProducts.length > 0) {
            sponsoredProducts.value = apiProducts
            localStorage.setItem('sponsoredProducts', JSON.stringify(apiProducts))
            console.log(`✅ ${apiProducts.length} produits sponsorisés chargés depuis API`)
          } else if (sponsoredProducts.value.length > 0) {
            // Si l'API est vide mais qu'on a des produits en local, on les garde
            console.log(`ℹ️ API vide, conservation des ${sponsoredProducts.value.length} produits locaux`)
          }
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, utilisation localStorage uniquement')
      }

      return { success: true, products: sponsoredProducts.value }
    } catch (err) {
      console.error('❌ Erreur fetchSponsoredProducts:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ajouter un produit aux sponsorisés
   */
  const addToSponsored = async (product) => {
    loading.value = true
    error.value = null

    try {
      console.log('⭐ Ajout aux produits sponsorisés:', product.id)

      // Vérifier si déjà sponsorisé
      if (sponsoredProducts.value.some(p => p.id === product.id)) {
        return { success: false, error: 'Produit déjà sponsorisé' }
      }

      // Préparer le produit avec des infos supplémentaires
      const sponsoredProduct = {
        ...product,
        sponsoredAt: new Date().toISOString(),
        sponsoredBy: 'admin'
      }

      // Essayer l'API
      let apiSuccess = false
      try {
        const response = await api.post('/products/sponsored', {
          productId: product.id,
          product: sponsoredProduct
        })
        if (response.data.success) {
          apiSuccess = true
          console.log('✅ Produit ajouté via API')
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, sauvegarde locale uniquement')
      }

      // Sauvegarde locale (toujours faire)
      sponsoredProducts.value.push(sponsoredProduct)
      localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))

      console.log(`✅ Produit ${product.id} ajouté aux sponsorisés. Total: ${sponsoredProducts.value.length}`)

      return {
        success: true,
        product: sponsoredProduct,
        synced: apiSuccess
      }
    } catch (err) {
      console.error('❌ Erreur addToSponsored:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Retirer un produit des sponsorisés
   */
  const removeFromSponsored = async (productId) => {
    loading.value = true
    error.value = null

    try {
      console.log('🗑️ Retrait des produits sponsorisés:', productId)

      // Essayer l'API
      let apiSuccess = false
      try {
        const response = await api.delete(`/products/sponsored/${productId}`)
        if (response.data.success) {
          apiSuccess = true
          console.log('✅ Produit retiré via API')
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, suppression locale')
      }

      // Suppression locale
      const removedProduct = sponsoredProducts.value.find(p => p.id === productId)
      sponsoredProducts.value = sponsoredProducts.value.filter(p => p.id !== productId)
      localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))

      console.log(`✅ Produit ${productId} retiré des sponsorisés. Restants: ${sponsoredProducts.value.length}`)

      return {
        success: true,
        product: removedProduct,
        synced: apiSuccess
      }
    } catch (err) {
      console.error('❌ Erreur removeFromSponsored:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sauvegarder les produits sponsorisés dans localStorage
   */
  const saveSponsoredToStorage = () => {
    localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))
  }

  // ===== MÉTHODES API =====

  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Récupération des produits...', params)

      // D'abord, charger les posts si nécessaire
      if (postStore.posts.length === 0) {
        await postStore.fetchFeed()
      }

      // Récupérer les produits depuis l'API
      const response = await api.get('/products', { params })

      if (response.data.success) {
        const { products: productsData, total, page, limit } = response.data

        // Fusionner avec les données des posts
        const postsAsProducts = getAllProducts.value
        const mergedProducts = [...postsAsProducts, ...productsData]
          .filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
          )

        products.value = mergedProducts
        totalProducts.value = total || mergedProducts.length
        currentPage.value = page || 1
        itemsPerPage.value = limit || 12

        featuredProducts.value = mergedProducts.filter(p => p.isSponsored)
        newProducts.value = mergedProducts.filter(p => p.isNew)
        discountedProducts.value = mergedProducts.filter(p => p.originalPrice)

        console.log(`✅ ${mergedProducts.length} produits chargés (${productsData.length} depuis API, ${postsAsProducts.length} depuis posts)`)
        return { success: true, products: mergedProducts }
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement des produits')
      }
    } catch (err) {
      console.error('❌ Erreur fetchProducts:', err)
      error.value = err.response?.data?.message || err.message

      // Fallback: utiliser uniquement les posts
      if (postStore.posts.length > 0) {
        const postsAsProducts = getAllProducts.value
        products.value = postsAsProducts
        featuredProducts.value = postsAsProducts.filter(p => p.isSponsored)
        newProducts.value = postsAsProducts.filter(p => p.isNew)
        discountedProducts.value = postsAsProducts.filter(p => p.originalPrice)
        totalProducts.value = postsAsProducts.length
        console.log(`🎭 Fallback: ${postsAsProducts.length} produits chargés depuis posts`)
        return { success: true, products: postsAsProducts }
      }

      // En développement, utiliser des données mock
      if (import.meta.env.DEV) {
        console.log('🎭 Mode développement: utilisation de données mock')
        const mockProducts = generateMockProducts(50)
        products.value = mockProducts
        featuredProducts.value = mockProducts.filter(p => p.isSponsored)
        newProducts.value = mockProducts.filter(p => p.isNew)
        discountedProducts.value = mockProducts.filter(p => p.originalPrice)
        totalProducts.value = mockProducts.length
        return { success: true, products: mockProducts }
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null

    try {
      console.log(`📦 Récupération du produit ${id}...`)

      // Chercher d'abord dans les posts transformés
      const postProduct = getAllProducts.value.find(p => p.id === id)
      if (postProduct) {
        return { success: true, product: postProduct }
      }

      // Sinon, appeler l'API
      const response = await api.get(`/products/${id}`)

      if (response.data.success) {
        return { success: true, product: response.data.product }
      } else {
        throw new Error(response.data.message || 'Produit non trouvé')
      }
    } catch (err) {
      console.error(`❌ Erreur fetchProductById ${id}:`, err)
      error.value = err.response?.data?.message || err.message

      if (import.meta.env.DEV) {
        const product = getAllProducts.value.find(p => p.id === id)
        if (product) {
          return { success: true, product }
        }
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchProductsByCategory = async (category, params = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log(`📦 Récupération des produits de la catégorie: ${category}`)

      // D'abord filtrer depuis les posts
      const postsInCategory = getAllProducts.value.filter(p => p.category === category)

      // Ensuite appeler l'API
      try {
        const response = await api.get(`/products/category/${category}`, { params })
        if (response.data.success) {
          const apiProducts = response.data.products || []
          const merged = [...postsInCategory, ...apiProducts]
            .filter((product, index, self) =>
              index === self.findIndex(p => p.id === product.id)
            )
          return { success: true, products: merged }
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, utilisation des posts uniquement')
      }

      return { success: true, products: postsInCategory }
    } catch (err) {
      console.error(`❌ Erreur fetchProductsByCategory ${category}:`, err)
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchProductsByVendor = async (vendorId, params = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log(`📦 Récupération des produits du vendeur: ${vendorId}`)

      // Utiliser la méthode du postStore
      const vendorPosts = await postStore.fetchVendorPosts(vendorId)

      // Transformer les posts en produits
      const productsFromPosts = vendorPosts.map(post => ({
        id: post.id,
        name: post.productName || post.name || 'منتج حرفي',
        productName: post.productName || post.name || 'منتج حرفي',
        price: post.price || 0,
        originalPrice: post.originalPrice || post.oldPrice || null,
        image: post.images?.[0] || post.image || 'https://placehold.co/300x400/08717f/white?text=منتج',
        rating: post.rating || 5.0,
        reviews: post.reviews || 0,
        isSponsored: post.isSponsored || false,
        description: post.description || post.content || '',
        vendorId: vendorId,
        vendorName: post.vendorName || 'حرفي',
        vendorAvatar: post.vendorAvatar || null,
        vendorVerified: post.vendorVerified || false
      }))

      return { success: true, products: productsFromPosts }
    } catch (err) {
      console.error(`❌ Erreur fetchProductsByVendor ${vendorId}:`, err)
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchProducts = async (query, params = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log(`📦 Recherche de produits: "${query}"`)

      // Rechercher d'abord dans les posts
      const postsResults = postStore.searchPosts(query)
      const productsFromPosts = postsResults.map(post => ({
        id: post.id,
        name: post.productName || post.name || 'منتج حرفي',
        productName: post.productName || post.name || 'منتج حرفي',
        price: post.price || 0,
        originalPrice: post.originalPrice || post.oldPrice || null,
        image: post.images?.[0] || post.image || 'https://placehold.co/300x400/08717f/white?text=منتج',
        rating: post.rating || 5.0,
        reviews: post.reviews || 0,
        isSponsored: post.isSponsored || false,
        description: post.description || post.content || '',
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'حرفي'
      }))

      // Appeler l'API
      try {
        const response = await api.get('/products/search', {
          params: { q: query, ...params }
        })
        if (response.data.success) {
          const apiProducts = response.data.products || []
          const merged = [...productsFromPosts, ...apiProducts]
            .filter((product, index, self) =>
              index === self.findIndex(p => p.id === product.id)
            )
          return { success: true, products: merged }
        }
      } catch (apiError) {
        console.log('⚠️ API non disponible, utilisation des posts uniquement')
      }

      return { success: true, products: productsFromPosts }
    } catch (err) {
      console.error('❌ Erreur searchProducts:', err)
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ===== HELPER FUNCTIONS =====
  const generateMockSponsoredProducts = () => {
    return [
      {
        id: 1,
        name: 'زربية تقليدية',
        price: 450,
        originalPrice: 600,
        image: 'https://placehold.co/300x400/08717f/white?text=زربية',
        rating: 4.8,
        reviews: 124,
        isSponsored: true,
        vendorName: 'دار الصنعة',
        vendorId: 1,
        vendor: {
          id: 1,
          name: 'دار الصنعة',
          avatar: 'https://i.pravatar.cc/150?u=1',
          verified: true
        }
      },
      {
        id: 2,
        name: 'فخار مطلي',
        price: 120,
        originalPrice: 180,
        image: 'https://placehold.co/300x400/d40025/white?text=فخار',
        rating: 4.6,
        reviews: 89,
        isSponsored: true,
        vendorName: 'فخار نابل',
        vendorId: 2,
        vendor: {
          id: 2,
          name: 'فخار نابل',
          avatar: 'https://i.pravatar.cc/150?u=2',
          verified: true
        }
      },
      {
        id: 3,
        name: 'حلي فضة',
        price: 350,
        originalPrice: 450,
        image: 'https://placehold.co/300x400/065a69/white?text=حلي',
        rating: 4.9,
        reviews: 56,
        isSponsored: true,
        vendorName: 'صياغة تونس',
        vendorId: 3,
        vendor: {
          id: 3,
          name: 'صياغة تونس',
          avatar: 'https://i.pravatar.cc/150?u=3',
          verified: true
        }
      },
      {
        id: 4,
        name: 'سجادة صوف',
        price: 580,
        originalPrice: 750,
        image: 'https://placehold.co/300x400/08717f/white?text=سجادة',
        rating: 4.7,
        reviews: 92,
        isSponsored: true,
        vendorName: 'نسيج القيروان',
        vendorId: 4,
        vendor: {
          id: 4,
          name: 'نسيج القيروان',
          avatar: 'https://i.pravatar.cc/150?u=4',
          verified: true
        }
      },
      {
        id: 5,
        name: 'تحفة نحاسية',
        price: 220,
        image: 'https://placehold.co/300x400/d40025/white?text=نحاس',
        rating: 4.5,
        reviews: 34,
        isSponsored: true,
        vendorName: 'نقاش تونس',
        vendorId: 5,
        vendor: {
          id: 5,
          name: 'نقاش تونس',
          avatar: 'https://i.pravatar.cc/150?u=5',
          verified: false
        }
      },
      {
        id: 6,
        name: 'شاشية',
        price: 85,
        originalPrice: 120,
        image: 'https://placehold.co/300x400/065a69/white?text=شاشية',
        rating: 4.4,
        reviews: 67,
        isSponsored: true,
        vendorName: 'حرفي تونسي',
        vendorId: 6,
        vendor: {
          id: 6,
          name: 'حرفي تونسي',
          avatar: 'https://i.pravatar.cc/150?u=6',
          verified: false
        }
      }
    ]
  }

  const generateMockProducts = (count) => {
    const categories = ['beauty', 'nail', 'personal', 'wig', 'makeup', 'tools', 'skin', 'hair']
    const categoryLabels = {
      beauty: 'أدوات التجميل',
      nail: 'العناية بالأظافر',
      personal: 'أدوات العناية الشخصية',
      wig: 'الشعر المستعار',
      makeup: 'المكياج',
      tools: 'أدوات العناية',
      skin: 'العناية بالبشرة',
      hair: 'العناية بالشعر'
    }

    const vendors = [
      { id: 1, name: 'EMERY ROSE', verified: true },
      { id: 2, name: 'SHEIN LUNE CURVE', verified: true },
      { id: 3, name: 'SHEIN LUNE', verified: false },
      { id: 4, name: 'Rusticease', verified: true },
      { id: 5, name: 'حرفي تونسي', verified: true },
      { id: 6, name: 'صنع في تونس', verified: false }
    ]

    const colors = ['أسود', 'أبيض', 'وردي', 'أزرق', 'رمادي', 'أخضر', 'أحمر']
    const materials = ['بوليستر', 'قطن', 'حرير', 'صوف', 'أكريليك', 'نايلون']
    const sizes = ['S', 'M', 'L', 'XL', 'مقاس واحد']

    const products = []

    for (let i = 1; i <= count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const vendor = vendors[Math.floor(Math.random() * vendors.length)]
      const price = Math.floor(Math.random() * 150) + 10
      const hasDiscount = Math.random() > 0.7
      const originalPrice = hasDiscount ? Math.floor(price * (1 + Math.random() * 0.5)) : null
      const rating = (Math.random() * 2 + 3).toFixed(1)
      const reviews = Math.floor(Math.random() * 200) + 10
      const isNew = Math.random() > 0.8
      const isSponsored = Math.random() > 0.9

      products.push({
        id: i,
        name: `Produit ${i} - ${categoryLabels[category]}`,
        productName: `Produit ${i} - ${categoryLabels[category]}`,
        price: price,
        originalPrice: originalPrice,
        oldPrice: originalPrice,
        image: `https://placehold.co/300x400/08717f/white?text=Produit+${i}`,
        images: [
          `https://placehold.co/300x400/08717f/white?text=Produit+${i}`,
          `https://placehold.co/300x400/d40025/white?text=Produit+${i}`,
          `https://placehold.co/300x400/065a69/white?text=Produit+${i}`
        ],
        rating: parseFloat(rating),
        reviews: reviews,
        likesCount: Math.floor(Math.random() * 500),
        likes: Math.floor(Math.random() * 500),
        isNew: isNew,
        isSponsored: isSponsored,
        description: `وصف المنتج ${i} - هذا منتج رائع من فئة ${categoryLabels[category]}`,
        category: category,
        categoryLabel: categoryLabels[category],
        color: colors[Math.floor(Math.random() * colors.length)],
        material: materials[Math.floor(Math.random() * materials.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        vendor: {
          id: vendor.id,
          name: vendor.name,
          avatar: `https://i.pravatar.cc/150?u=${vendor.id}`,
          verified: vendor.verified
        },
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorAvatar: `https://i.pravatar.cc/150?u=${vendor.id}`,
        vendorVerified: vendor.verified,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return products
  }

  // Initialiser au chargement
  initFromStorage()

  return {
    // State
    products,
    sponsoredProducts,
    featuredProducts,
    newProducts,
    discountedProducts,
    loading,
    error,
    totalProducts,
    currentPage,
    itemsPerPage,

    // Getters
    getAllProducts,
    getSponsoredProducts,
    getFeaturedProducts,
    getNewProducts,
    getDiscountedProducts,
    getProductById,
    getProductsByCategory,
    getProductsByVendor,

    // Actions API
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    fetchProductsByVendor,
    searchProducts,

    // Actions pour produits sponsorisés
    fetchSponsoredProducts,
    addToSponsored,
    removeFromSponsored,
    saveSponsoredToStorage,
    initFromStorage
  }
})
