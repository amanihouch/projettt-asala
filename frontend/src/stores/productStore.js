// frontend/src/stores/productStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePostStore } from './postStore'
import api from '../services/api'
import { formatAvatarUrl, formatProductImageUrl } from '../utils/image.js'

// Helper pour normaliser la catégorie d'un produit
const normalizeProductCategory = (product) => {
  let category = null

  // Chercher la catégorie dans différentes sources possibles
  if (product.categorySlug) {
    category = product.categorySlug
  } else if (product.category_slug) {
    category = product.category_slug
  } else if (product.category) {
    category = product.category
  } else if (product.categoryName) {
    category = product.categoryName
  } else if (product.category_name) {
    category = product.category_name
  }

  return {
    ...product,
    category: category,
    categorySlug: product.categorySlug || product.category_slug || category,
    categoryId: product.categoryId || product.category_id || null,
    categoryName: product.categoryName || product.category_name || null
  }
}

export const useProductStore = defineStore('products', () => {
  const postStore = usePostStore()

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

  const initFromStorage = () => {
    const savedSponsored = localStorage.getItem('sponsoredProducts')
    if (savedSponsored) {
      try {
        const parsed = JSON.parse(savedSponsored)
        sponsoredProducts.value = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        sponsoredProducts.value = []
      }
    }
  }

  // Récupérer tous les produits depuis les posts
  const getAllProducts = computed(() => {
    const posts = postStore.getAllPosts() || []
    return posts.map(post => normalizeProductCategory({
      id: post.id,
      name: post.productName || post.name || 'منتج حرفي',
      productName: post.productName || post.name || 'منتج حرفي',
      price: post.price || 0,
      originalPrice: post.originalPrice || post.oldPrice || null,
      oldPrice: post.oldPrice || post.originalPrice || null,
      image: formatProductImageUrl(post.images?.[0] || post.image) || 'https://placehold.co/300x400/08717f/white?text=منتج',
      images: (post.images || []).map(img => formatProductImageUrl(img)).filter(Boolean),
      rating: post.rating || 5.0,
      reviews: post.reviews || post.reviewCount || 0,
      likesCount: post.likes || post.likesCount || 0,
      likes: post.likes || post.likesCount || 0,
      isNew: post.isNew || false,
      isSponsored: post.isSponsored || false,
      description: post.description || post.content || '',
      category: post.category || post.categorySlug || post.categoryName,
      categorySlug: post.categorySlug || post.category_slug,
      categoryId: post.categoryId || post.category_id,
      categoryName: post.categoryName || post.category_name,
      color: post.color || null,
      material: post.material || null,
      size: post.size || null,
      vendor: {
        id: post.vendorId || post.vendor?.id,
        name: post.vendorName || post.vendor?.name || post.shopName || 'حرفي',
        avatar: formatAvatarUrl(post.vendorAvatar || post.vendor?.avatar),
        verified: post.vendorVerified || post.vendor?.verified || false
      },
      vendorId: post.vendorId || post.vendor?.id || null,
      vendorName: post.vendorName || post.vendor?.name || post.shopName || 'حرفي',
      vendorAvatar: formatAvatarUrl(post.vendorAvatar || post.vendor?.avatar),
      vendorVerified: post.vendorVerified || post.vendor?.verified || false,
      createdAt: post.createdAt || new Date().toISOString()
    }))
  })

  const getSponsoredProducts = computed(() => sponsoredProducts.value)
  const getFeaturedProducts = computed(() => featuredProducts.value.length > 0 ? featuredProducts.value : getAllProducts.value.filter(p => p.isSponsored).slice(0, 8))
  const getNewProducts = computed(() => newProducts.value.length > 0 ? newProducts.value : getAllProducts.value.filter(p => p.isNew).slice(0, 8))
  const getDiscountedProducts = computed(() => discountedProducts.value.length > 0 ? discountedProducts.value : getAllProducts.value.filter(p => p.originalPrice).slice(0, 8))

  const getProductById = (id) => getAllProducts.value.find(p => p.id === id) || null
  const getProductsByCategory = (category) => getAllProducts.value.filter(p => p.category === category)

  const fetchProductsByVendor = async (vendorId) => {
    if (!vendorId) return []

    try {
      const response = await api.get(`/products/vendor/${vendorId}`)

      if (response.data.success) {
        let productsData = response.data.data || response.data.products || []
        if (!Array.isArray(productsData)) productsData = []
        productsData = productsData.map(product => normalizeProductCategory({
          ...product,
          image: formatProductImageUrl(product.image || product.images?.[0]),
          images: (product.images || []).map(img => formatProductImageUrl(img))
        }))
        return productsData
      }
      return []
    } catch (error) {
      console.error('❌ Erreur fetchProductsByVendor:', error)
      return []
    }
  }

  const fetchSponsoredProducts = async () => {
    loading.value = true
    error.value = null

    try {
      const saved = localStorage.getItem('sponsoredProducts')
      if (saved) {
        const parsed = JSON.parse(saved)
        sponsoredProducts.value = Array.isArray(parsed) ? parsed : []
      }

      try {
        const response = await api.get('/sponsored-products?active=true')
        if (response.data.success) {
          let apiProducts = response.data.data || response.data.products || []
          if (!Array.isArray(apiProducts)) apiProducts = []
          apiProducts = apiProducts.map(product => normalizeProductCategory({
            ...product,
            image: formatImageUrl(product.image || product.images?.[0]),
            images: (product.images || []).map(img => formatImageUrl(img))
          }))
          if (apiProducts.length > 0) {
            sponsoredProducts.value = apiProducts
            localStorage.setItem('sponsoredProducts', JSON.stringify(apiProducts))
          }
        }
      } catch (apiError) {
        // API non disponible, on garde localStorage
      }

      return { success: true, products: sponsoredProducts.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const addToSponsored = async (product) => {
    loading.value = true
    error.value = null

    try {
      if (sponsoredProducts.value.some(p => p.id === product.id)) {
        return { success: false, error: 'Produit déjà sponsorisé' }
      }

      const sponsoredProduct = { ...product, sponsoredAt: new Date().toISOString(), sponsoredBy: 'admin' }

      try {
        await api.post('/sponsored-products/admin', { postId: product.id })
      } catch (apiError) {
        // API non disponible
      }

      sponsoredProducts.value.push(sponsoredProduct)
      localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))

      return { success: true, product: sponsoredProduct }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const removeFromSponsored = async (productId) => {
    loading.value = true
    error.value = null

    try {
      try {
        await api.delete(`/sponsored-products/admin/${productId}`)
      } catch (apiError) {
        // API non disponible
      }

      const removedProduct = sponsoredProducts.value.find(p => p.id === productId)
      sponsoredProducts.value = sponsoredProducts.value.filter(p => p.id !== productId)
      localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))

      return { success: true, product: removedProduct }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const saveSponsoredToStorage = () => {
    localStorage.setItem('sponsoredProducts', JSON.stringify(sponsoredProducts.value))
  }

  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      if (postStore.posts.length === 0) {
        await postStore.fetchFeed()
      }

      try {
        const response = await api.get('/products', { params })

        if (response.data.success) {
          let productsData = response.data.data || response.data.products || []
          if (!Array.isArray(productsData)) productsData = []

          productsData = productsData.map(product => normalizeProductCategory({
            ...product,
            image: formatImageUrl(product.image || product.images?.[0]),
            images: (product.images || []).map(img => formatImageUrl(img))
          }))

          const postsAsProducts = getAllProducts.value
          const mergedProducts = [...postsAsProducts, ...productsData].filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
          )

          products.value = mergedProducts
          totalProducts.value = response.data.total || mergedProducts.length
          currentPage.value = response.data.page || params.page || 1
          itemsPerPage.value = response.data.limit || params.limit || 12
          featuredProducts.value = mergedProducts.filter(p => p.isSponsored)
          newProducts.value = mergedProducts.filter(p => p.isNew)
          discountedProducts.value = mergedProducts.filter(p => p.originalPrice)

          return { success: true, products: mergedProducts }
        } else {
          throw new Error(response.data.message || 'Erreur')
        }
      } catch (apiError) {
        const postsAsProducts = getAllProducts.value
        products.value = postsAsProducts
        featuredProducts.value = postsAsProducts.filter(p => p.isSponsored)
        newProducts.value = postsAsProducts.filter(p => p.isNew)
        discountedProducts.value = postsAsProducts.filter(p => p.originalPrice)
        totalProducts.value = postsAsProducts.length

        return { success: true, products: postsAsProducts }
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message

      if (postStore.posts.length > 0) {
        const postsAsProducts = getAllProducts.value
        products.value = postsAsProducts
        featuredProducts.value = postsAsProducts.filter(p => p.isSponsored)
        newProducts.value = postsAsProducts.filter(p => p.isNew)
        discountedProducts.value = postsAsProducts.filter(p => p.originalPrice)
        totalProducts.value = postsAsProducts.length
        return { success: true, products: postsAsProducts }
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
      const postProduct = getAllProducts.value.find(p => p.id === id)
      if (postProduct) {
        return { success: true, product: postProduct }
      }

      const response = await api.get(`/products/${id}`)
      if (response.data.success) {
        let productData = response.data.data || response.data.product
        if (productData) {
          productData = normalizeProductCategory({
            ...productData,
            image: formatImageUrl(productData.image || productData.images?.[0]),
            images: (productData.images || []).map(img => formatImageUrl(img))
          })
        }
        return { success: true, product: productData }
      }
      throw new Error('Produit non trouvé')
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchProductsByCategory = async (category, params = {}) => {
    loading.value = true
    error.value = null

    try {
      const postsInCategory = getAllProducts.value.filter(p => p.category === category)

      try {
        const response = await api.get(`/categories/${category}/products`, { params })
        if (response.data.success) {
          let apiProducts = response.data.data || response.data.products || []
          if (!Array.isArray(apiProducts)) apiProducts = []
          apiProducts = apiProducts.map(product => normalizeProductCategory({
            ...product,
            image: formatImageUrl(product.image || product.images?.[0]),
            images: (product.images || []).map(img => formatImageUrl(img))
          }))
          const merged = [...postsInCategory, ...apiProducts].filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
          )
          return { success: true, products: merged }
        }
      } catch (apiError) {
        // API non disponible
      }

      return { success: true, products: postsInCategory }
    } catch (err) {
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
      const postsResults = postStore.searchPosts(query)
      const productsFromPosts = postsResults.map(post => normalizeProductCategory({
        id: post.id,
        name: post.productName || post.name || 'منتج حرفي',
        productName: post.productName || post.name || 'منتج حرفي',
        price: post.price || 0,
        originalPrice: post.originalPrice || post.oldPrice || null,
        image: formatProductImageUrl(post.images?.[0] || post.image) || 'https://placehold.co/300x400/08717f/white?text=منتج',
        rating: post.rating || 5.0,
        reviews: post.reviews || 0,
        isSponsored: post.isSponsored || false,
        description: post.description || post.content || '',
        vendorId: post.vendorId,
        vendorName: post.vendorName || 'حرفي'
      }))

      try {
        const response = await api.get('/products/search', { params: { q: query, ...params } })
        if (response.data.success) {
          let apiProducts = response.data.data || response.data.products || []
          if (!Array.isArray(apiProducts)) apiProducts = []
          apiProducts = apiProducts.map(product => normalizeProductCategory({
            ...product,
            image: formatImageUrl(product.image || product.images?.[0]),
            images: (product.images || []).map(img => formatImageUrl(img))
          }))
          const merged = [...productsFromPosts, ...apiProducts].filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
          )
          return { success: true, products: merged }
        }
      } catch (apiError) {
        // API non disponible
      }

      return { success: true, products: productsFromPosts }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  initFromStorage()

  return {
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
    getAllProducts,
    getSponsoredProducts,
    getFeaturedProducts,
    getNewProducts,
    getDiscountedProducts,
    getProductById,
    getProductsByCategory,
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    fetchProductsByVendor,
    searchProducts,
    fetchSponsoredProducts,
    addToSponsored,
    removeFromSponsored,
    saveSponsoredToStorage,
    initFromStorage,
  }
})
