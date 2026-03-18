// frontend/src/stores/postStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([]) // posts approuvés (feed)
  const pendingPosts = ref([]) // posts en attente (admin)
  const loading = ref(false)

  // Catégories pour Products.vue
  const categories = ref([
    { id: 1, slug: 'carpets', name: 'السجاد والمنسوجات', nameFr: 'Tapis et textiles', icon: '🧵', count: 0 },
    { id: 2, slug: 'pottery', name: 'الفخار والخزف', nameFr: 'Poterie et céramique', icon: '🏺', count: 0 },
    { id: 3, slug: 'copperware', name: 'النحاسيات', nameFr: 'Articles en cuivre', icon: '⚱️', count: 0 },
    { id: 4, slug: 'jewelry', name: 'الحلي والمجوهرات', nameFr: 'Bijoux', icon: '💍', count: 0 },
    { id: 5, slug: 'clothing', name: 'الملابس التقليدية', nameFr: 'Vêtements traditionnels', icon: '👘', count: 0 },
    { id: 6, slug: 'woodwork', name: 'الخشبيات والنحت', nameFr: 'Travail du bois', icon: '🪵', count: 0 },
  ])

  // ===== MÉTHODES EXISTANTES =====
  const fetchFeed = async () => {
    loading.value = true
    try {
      const response = await api.get('/posts/feed')
      posts.value = response.data.data.posts || response.data.data
      updateCategoriesCount()
    } catch (error) {
      console.error('❌ Erreur fetchFeed:', error)
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchPendingPosts = async () => {
    loading.value = true
    try {
      const response = await api.get('/admin/posts/pending')
      pendingPosts.value = response.data.data.posts || response.data.data
    } catch (error) {
      console.error('❌ Erreur fetchPendingPosts:', error)
      pendingPosts.value = []
    } finally {
      loading.value = false
    }
  }

  const createPost = async (postData) => {
    try {
      const response = await api.post('/posts', postData)
      const newPost = response.data.data.post

      if (newPost.status === 'pending') {
        pendingPosts.value.unshift(newPost)
      } else {
        posts.value.unshift(newPost)
        updateCategoriesCount()
      }

      return newPost
    } catch (error) {
      console.error('❌ Erreur createPost:', error)
      throw error
    }
  }

  const approvePost = async (postId) => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/approve`)
      const approved = response.data.data.post

      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      posts.value.unshift(approved)
      updateCategoriesCount()

      return approved
    } catch (error) {
      console.error('❌ Erreur approvePost:', error)
      throw error
    }
  }

  const rejectPost = async (postId, reason) => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/reject`, { reason })
      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      return response.data.data.post
    } catch (error) {
      console.error('❌ Erreur rejectPost:', error)
      throw error
    }
  }

  const updatePost = async (postId, updates) => {
    try {
      const response = await api.put(`/admin/posts/${postId}`, updates)
      const updated = response.data.data.post

      const indexPending = pendingPosts.value.findIndex((p) => p.id === postId)
      if (indexPending !== -1) pendingPosts.value[indexPending] = updated

      const indexApproved = posts.value.findIndex((p) => p.id === postId)
      if (indexApproved !== -1) {
        posts.value[indexApproved] = updated
        updateCategoriesCount()
      }

      return updated
    } catch (error) {
      console.error('❌ Erreur updatePost:', error)
      throw error
    }
  }

  const deletePost = async (postId) => {
    try {
      await api.delete(`/admin/posts/${postId}`)
      posts.value = posts.value.filter((p) => p.id !== postId)
      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      updateCategoriesCount()
      return true
    } catch (error) {
      console.error('❌ Erreur deletePost:', error)
      throw error
    }
  }

  const fetchPostById = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`)
      return response.data.data.post
    } catch (error) {
      console.error('❌ Erreur fetchPostById:', error)
      return null
    }
  }

  const fetchVendorPosts = async (vendorId) => {
    try {
      const response = await api.get(`/posts/vendor/${vendorId}`)
      console.log('📦 Réponse posts vendeur:', response.data)
      return response.data.data.posts || []
    } catch (error) {
      console.error('❌ Erreur fetchVendorPosts:', error)
      return []
    }
  }

  // ===== MÉTHODES POUR Products.vue =====
  const getAllPosts = () => posts.value

  const updateCategoriesCount = () => {
    const counts = {}
    posts.value.forEach(post => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1
      }
    })

    categories.value = categories.value.map(cat => ({
      ...cat,
      count: counts[cat.slug] || 0
    }))
  }

  const getPostsByCategory = (categorySlug) => {
    return posts.value.filter(post => post.category === categorySlug)
  }

  const getPopularPosts = (limit = 10) => {
    return [...posts.value]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, limit)
  }

  const getRecentPosts = (limit = 10) => {
    return [...posts.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }

  const searchPosts = (query) => {
    if (!query) return posts.value

    const searchTerm = query.toLowerCase()
    return posts.value.filter(post =>
      post.productName?.toLowerCase().includes(searchTerm) ||
      post.description?.toLowerCase().includes(searchTerm) ||
      post.vendorName?.toLowerCase().includes(searchTerm)
    )
  }

  // ===== COMPUTED =====
  const totalPosts = computed(() => posts.value.length)
  const totalPendingPosts = computed(() => pendingPosts.value.length)
  const isPostLiked = (postId) => false

  return {
    // State
    posts,
    pendingPosts,
    loading,
    categories,

    // Computed
    totalPosts,
    totalPendingPosts,

    // Méthodes existantes
    fetchFeed,
    fetchPendingPosts,
    createPost,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    fetchPostById,
    fetchVendorPosts,

    // Méthodes pour Products.vue
    getAllPosts,
    getPostsByCategory,
    getPopularPosts,
    getRecentPosts,
    searchPosts,
    updateCategoriesCount,
    isPostLiked,
  }
})
