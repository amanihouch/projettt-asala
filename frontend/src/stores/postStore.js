// frontend/src/stores/postStore.js - Version CORRIGÉE COMPLÈTE
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const usePostStore = defineStore('posts', () => {
  // ==================== STATE ====================
  const posts = ref([])
  const pendingPosts = ref([])
  const approvedPosts = ref([])
  const rejectedPosts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const likedPosts = ref([])

  // ==================== COMPUTED ====================
  const totalPosts = computed(() => posts.value.length)
  const totalPendingPosts = computed(() => pendingPosts.value.length)
  const totalApprovedPosts = computed(() => approvedPosts.value.length)
  const totalRejectedPosts = computed(() => rejectedPosts.value.length)

  // ==================== ACTIONS ====================

  /**
   * ✅ CORRIGÉ : Charge TOUS les posts du feed public
   * Envoie un paramètre limit élevé pour éviter la limite par défaut de 10
   */
  const fetchFeed = async () => {
    loading.value = true
    try {
      // 🔧 Ajouter un paramètre limit pour charger plus de posts
      const response = await api.get('/posts/feed', {
        params: {
          limit: 2000,  // ✅ Charger jusqu'à 2000 posts
          page: 1
        }
      })

      let fetchedPosts = response.data.data?.posts || response.data.data || []

      // Si la réponse est paginée avec data.data
      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        fetchedPosts = response.data.data.data
      }

      if (!Array.isArray(fetchedPosts)) {
        fetchedPosts = []
      }

      posts.value = fetchedPosts.map(post => ({
        ...post,
        images: post.images || [],
        likes: post.likes || 0,
        commentsCount: post.commentsCount || 0,
        vendorId: post.vendorId || post.vendor_id || post.userId || post.user_id || null,
        vendorName: post.vendorName || post.vendor?.name || post.shopName || post.vendor?.shopName || 'حرفي',
        vendorAvatar: post.vendorAvatar || post.vendor?.avatar || post.vendor?.userAvatar || null,
        vendorVerified: post.vendorVerified || post.vendor?.verified || false
      }))

      console.log('✅ Feed chargé:', posts.value.length, 'posts')
    } catch (error) {
      console.error('❌ Erreur fetchFeed:', error)
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Retourne tous les posts (utilisé par productStore)
   */
  const getAllPosts = () => {
    return posts.value
  }

  /**
   * Recherche des posts par mot-clé
   */
  const searchPosts = (query) => {
    if (!query) return []
    const searchTerm = query.toLowerCase()
    return posts.value.filter(post =>
      (post.productName || '').toLowerCase().includes(searchTerm) ||
      (post.description || '').toLowerCase().includes(searchTerm) ||
      (post.vendorName || '').toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Récupère les posts d'un vendeur spécifique
   */
  const fetchVendorPosts = async (vendorId) => {
    if (!vendorId) {
      console.warn('⚠️ fetchVendorPosts: vendorId manquant')
      return []
    }

    try {
      console.log(`📡 Appel API: /posts/vendor/${vendorId}`)
      const response = await api.get(`/posts/vendor/${vendorId}`)

      if (response.data.success) {
        let postsData = response.data.data?.posts || response.data.data || []

        // Si structure paginée
        if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          postsData = response.data.data.data
        }

        if (!Array.isArray(postsData)) {
          postsData = []
        }

        const formattedPosts = postsData.map(post => {
          let imagesArray = []

          if (post.images) {
            if (Array.isArray(post.images)) {
              imagesArray = post.images
            } else if (typeof post.images === 'string') {
              try {
                const parsed = JSON.parse(post.images)
                imagesArray = Array.isArray(parsed) ? parsed : []
              } catch(e) {
                imagesArray = [post.images]
              }
            }
          }

          return {
            id: post.id,
            productName: post.productName || post.name || 'Produit',
            description: post.description || '',
            price: post.price || 0,
            oldPrice: post.oldPrice || post.originalPrice || null,
            images: imagesArray,
            image: imagesArray[0] || post.image || null,
            likes: post.likes || 0,
            commentsCount: post.commentsCount || 0,
            createdAt: post.createdAt,
            isPinned: post.isPinned === true || post.isPinned === 1 || post.isPinned === '1',
            shopName: post.shopName || post.vendorName || null,
            vendorAvatar: post.vendorAvatar || post.vendor?.avatar || null,
            vendorId: post.vendorId || post.vendor_id || null,
            vendorName: post.vendorName || post.shopName || post.vendor?.name || 'حرفي',
            vendorVerified: post.vendorVerified || post.vendor?.verified || false
          }
        })

        console.log(`✅ ${formattedPosts.length} posts récupérés pour vendeur ${vendorId}`)
        return formattedPosts
      }
      return []
    } catch (error) {
      console.error('❌ Erreur fetchVendorPosts:', error)
      return []
    }
  }

  // ==================== ADMIN ====================

  const fetchPendingPosts = async () => {
    loading.value = true
    try {
      const response = await api.get('/admin/posts/pending')
      let postsData = response.data.data?.posts || response.data.data || []

      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        postsData = response.data.data.data
      }

      pendingPosts.value = postsData.map(post => ({
        id: post.id,
        vendorId: post.vendorId || post.vendor_id,
        vendorName: post.vendorName || post.shopName || 'حرفي',
        vendorAvatar: post.vendorAvatar || post.vendor?.avatar,
        productName: post.productName || post.name,
        description: post.description,
        price: post.price,
        oldPrice: post.oldPrice,
        images: post.images || [],
        status: post.status,
        createdAt: post.createdAt,
        quantity: post.quantity,
        unit: post.unit,
        stockStatus: post.stockStatus
      }))

      console.log('✅ Posts en attente:', pendingPosts.value.length)
      return pendingPosts.value
    } catch (error) {
      console.error('❌ Erreur fetchPendingPosts:', error)
      pendingPosts.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchApprovedPosts = async () => {
    loading.value = true
    try {
      const response = await api.get('/admin/posts/approved')
      let postsData = response.data.data?.posts || response.data.data || []

      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        postsData = response.data.data.data
      }

      approvedPosts.value = postsData.map(post => ({
        id: post.id,
        vendorId: post.vendorId || post.vendor_id,
        vendorName: post.vendorName || post.shopName || 'حرفي',
        vendorAvatar: post.vendorAvatar || post.vendor?.avatar,
        productName: post.productName || post.name,
        description: post.description,
        price: post.price,
        oldPrice: post.oldPrice,
        images: post.images || [],
        status: post.status,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        quantity: post.quantity,
        unit: post.unit,
        stockStatus: post.stockStatus
      }))

      console.log('✅ Posts approuvés:', approvedPosts.value.length)
      return approvedPosts.value
    } catch (error) {
      console.error('❌ Erreur fetchApprovedPosts:', error)
      approvedPosts.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchRejectedPosts = async () => {
    loading.value = true
    try {
      const response = await api.get('/admin/posts/rejected')
      let postsData = response.data.data?.posts || response.data.data || []

      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        postsData = response.data.data.data
      }

      rejectedPosts.value = postsData.map(post => ({
        id: post.id,
        vendorId: post.vendorId || post.vendor_id,
        vendorName: post.vendorName || post.shopName || 'حرفي',
        vendorAvatar: post.vendorAvatar || post.vendor?.avatar,
        productName: post.productName || post.name,
        description: post.description,
        price: post.price,
        oldPrice: post.oldPrice,
        images: post.images || [],
        status: post.status,
        createdAt: post.createdAt,
        rejectionReason: post.rejectionReason,
        rejectionDate: post.rejectionDate
      }))

      console.log('✅ Posts rejetés:', rejectedPosts.value.length)
      return rejectedPosts.value
    } catch (error) {
      console.error('❌ Erreur fetchRejectedPosts:', error)
      rejectedPosts.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const createPost = async (formData) => {
    try {
      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const newPost = response.data.data?.post || response.data
      console.log('✅ Post créé:', newPost.id)
      return newPost
    } catch (error) {
      console.error('❌ Erreur createPost:', error)
      throw error
    }
  }

  const approvePost = async (postId) => {
    try {
      const response = await api.put(`/admin/posts/${postId}/approve`)
      if (response.data.success) {
        const approvedPostIndex = pendingPosts.value.findIndex(p => p.id === postId)
        if (approvedPostIndex !== -1) {
          const approvedPost = { ...pendingPosts.value[approvedPostIndex], status: 'approved' }
          pendingPosts.value.splice(approvedPostIndex, 1)
          approvedPosts.value.unshift(approvedPost)
        }
        console.log('✅ Post approuvé:', postId)
        return { success: true }
      }
      throw new Error(response.data.message || 'Erreur lors de l\'approbation')
    } catch (error) {
      console.error('❌ Erreur approvePost:', error)
      throw error
    }
  }

  const rejectPost = async (postId, reason) => {
    try {
      const response = await api.put(`/admin/posts/${postId}/reject`, { reason })
      if (response.data.success) {
        const rejectedPostIndex = pendingPosts.value.findIndex(p => p.id === postId)
        if (rejectedPostIndex !== -1) {
          const rejectedPost = {
            ...pendingPosts.value[rejectedPostIndex],
            status: 'rejected',
            rejectionReason: reason
          }
          pendingPosts.value.splice(rejectedPostIndex, 1)
          rejectedPosts.value.unshift(rejectedPost)
        }
        console.log('❌ Post rejeté:', postId)
        return { success: true }
      }
      throw new Error(response.data.message || 'Erreur lors du rejet')
    } catch (error) {
      console.error('❌ Erreur rejectPost:', error)
      throw error
    }
  }

  const deletePost = async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`)
      if (response.data.success) {
        posts.value = posts.value.filter(p => p.id !== postId)
        pendingPosts.value = pendingPosts.value.filter(p => p.id !== postId)
        approvedPosts.value = approvedPosts.value.filter(p => p.id !== postId)
        rejectedPosts.value = rejectedPosts.value.filter(p => p.id !== postId)
        console.log('🗑️ Post supprimé:', postId)
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('❌ Erreur deletePost:', error)
      throw error
    }
  }

  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      if (response.data.success) {
        return response.data.data?.comments || response.data.comments || []
      }
      return []
    } catch (error) {
      console.error('❌ Erreur fetchComments:', error)
      return []
    }
  }

  const addComment = async (postId, text) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text })
      if (response.data.success) {
        const newComment = response.data.data?.comment || response.data.comment
        return newComment
      }
      return null
    } catch (error) {
      console.error('❌ Erreur addComment:', error)
      throw error
    }
  }

  const toggleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      if (response.data.success) {
        const likes = response.data.data?.likes || 0
        const liked = response.data.data?.liked || false

        if (liked && !likedPosts.value.includes(postId)) {
          likedPosts.value.push(postId)
        } else if (!liked && likedPosts.value.includes(postId)) {
          likedPosts.value = likedPosts.value.filter(id => id !== postId)
        }

        saveLikesToStorage()
        return { likes, liked }
      }
      return null
    } catch (error) {
      console.error('❌ Erreur toggleLike:', error)
      return null
    }
  }

  const togglePinPost = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}/pin`)
      if (response.data.success) {
        const isPinned = response.data.data?.isPinned || false

        // Mettre à jour le post dans la liste locale
        const postIndex = posts.value.findIndex(p => p.id === postId)
        if (postIndex !== -1) {
          posts.value[postIndex].isPinned = isPinned
        }

        return { success: true, isPinned }
      }
      return { success: false }
    } catch (error) {
      console.error('❌ Erreur togglePinPost:', error)
      return { success: false }
    }
  }

  const fetchPostById = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`)
      if (response.data.success) {
        return response.data.data?.post || response.data
      }
      return null
    } catch (error) {
      console.error('❌ Erreur fetchPostById:', error)
      return null
    }
  }

  const isPostLiked = (postId) => {
    return likedPosts.value.includes(postId)
  }

  const loadLikesFromStorage = () => {
    const saved = localStorage.getItem('likedPosts')
    if (saved) {
      try {
        likedPosts.value = JSON.parse(saved)
        console.log('❤️ Likes chargés:', likedPosts.value.length)
      } catch (e) {
        console.error('Erreur chargement likes:', e)
        likedPosts.value = []
      }
    }
  }

  const saveLikesToStorage = () => {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts.value))
  }

  // ==================== EXPORTS ====================
  return {
    // State
    posts,
    pendingPosts,
    approvedPosts,
    rejectedPosts,
    loading,
    error,
    likedPosts,

    // Computed
    totalPosts,
    totalPendingPosts,
    totalApprovedPosts,
    totalRejectedPosts,

    // Actions
    fetchFeed,
    getAllPosts,
    searchPosts,
    fetchVendorPosts,
    fetchPendingPosts,
    fetchApprovedPosts,
    fetchRejectedPosts,
    createPost,
    approvePost,
    rejectPost,
    deletePost,
    fetchComments,
    addComment,
    toggleLike,
    togglePinPost,
    fetchPostById,
    isPostLiked,
    loadLikesFromStorage,
    saveLikesToStorage
  }
})
