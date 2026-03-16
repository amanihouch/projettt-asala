// frontend/src/stores/postStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([])           // ✅ posts approuvés (feed public)
  const pendingPosts = ref([])    // ✅ posts en attente (admin)
  const rejectedPosts = ref([])   // ✅ posts rejetés (admin)
  const vendorPostsMap = ref({})  // ✅ cache par vendorId
  const loading = ref(false)
  const error = ref(null)

  // URL de base pour fallback direct
  const API_URL = 'http://localhost:5000/api/v1'

  // ===== FETCH FEED (posts approuvés publics) =====
  const fetchFeed = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/posts/feed')
      posts.value = response.data.data?.data || response.data.data || []
      // ✅ Cache localStorage comme fallback
      localStorage.setItem('posts_feed_cache', JSON.stringify(posts.value))
      console.log(`✅ Feed chargé: ${posts.value.length} posts`)
    } catch (err) {
      console.error('❌ Erreur fetchFeed:', err)
      error.value = err.message
      // ✅ Fallback : utiliser le cache si le backend échoue
      const cached = localStorage.getItem('posts_feed_cache')
      posts.value = cached ? JSON.parse(cached) : []
    } finally {
      loading.value = false
    }
  }

  // ===== FETCH PENDING + REJECTED (admin) =====
  const fetchPendingPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token manquant')

      const response = await fetch(`${API_URL}/admin/posts/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()

      if (result.success) {
        const allPosts = result.data.posts || []
        // ✅ Séparer proprement pending et rejected
        pendingPosts.value = allPosts.filter(p => p.status === 'pending')
        rejectedPosts.value = allPosts.filter(p => p.status === 'rejected')
        console.log(`✅ ${pendingPosts.value.length} posts en attente, ${rejectedPosts.value.length} rejetés`)
      } else {
        throw new Error(result.message || 'Erreur chargement')
      }
    } catch (err) {
      console.error('❌ Erreur fetchPendingPosts:', err)
      error.value = err.message
      pendingPosts.value = []
      rejectedPosts.value = []
    } finally {
      loading.value = false
    }
  }

  // ===== CREATE POST =====
  const createPost = async (postData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.message)

      const newPost = result.data.post
      // ✅ Mise à jour optimiste : ajouter en pending immédiatement
      pendingPosts.value.unshift({ ...newPost, status: 'pending' })
      return newPost
    } catch (err) {
      console.error('❌ Erreur createPost:', err)
      throw err
    }
  }

  // ===== APPROVE (admin) =====
  const approvePost = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/posts/${postId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.message)

      const approved = result.data.post

      // ✅ Retirer de pending ET rejected
      pendingPosts.value = pendingPosts.value.filter(p => p.id !== postId)
      rejectedPosts.value = rejectedPosts.value.filter(p => p.id !== postId)

      // ✅ Ajouter au feed
      const existsInFeed = posts.value.find(p => p.id === postId)
      if (!existsInFeed) {
        posts.value.unshift(approved)
      } else {
        const idx = posts.value.findIndex(p => p.id === postId)
        posts.value[idx] = { ...posts.value[idx], status: 'approved' }
      }

      // ✅ Mettre à jour le cache vendeur
      _updateVendorCache(postId, { status: 'approved' })
      localStorage.setItem('posts_feed_cache', JSON.stringify(posts.value))

      return approved
    } catch (err) {
      console.error('❌ Erreur approvePost:', err)
      throw err
    }
  }

  // ===== REJECT (admin) =====
  const rejectPost = async (postId, reason) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/posts/${postId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.message)

      // ✅ Trouver le post dans pending AVANT de le supprimer
      const idx = pendingPosts.value.findIndex(p => p.id === postId)
      if (idx !== -1) {
        const rejectedPost = {
          ...pendingPosts.value[idx],
          status: 'rejected',
          adminNotes: reason,
        }
        pendingPosts.value.splice(idx, 1)
        // ✅ Le conserver dans rejectedPosts
        rejectedPosts.value.unshift(rejectedPost)
      }

      // ✅ Retirer du feed public
      posts.value = posts.value.filter(p => p.id !== postId)

      // ✅ Mettre à jour le cache vendeur
      _updateVendorCache(postId, { status: 'rejected', adminNotes: reason })

      return result.data.post
    } catch (err) {
      console.error('❌ Erreur rejectPost:', err)
      throw err
    }
  }

  // ===== FETCH VENDOR POSTS =====
  const fetchVendorPosts = async (vendorId, { onlyApproved = true } = {}) => {
    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/posts/vendor/${vendorId}`, { headers })
      const result = await response.json()

      if (result.success) {
        let fetchedPosts = result.data.data || []

        // ✅ Filtrer : profil public = approved seulement
        if (onlyApproved) {
          fetchedPosts = fetchedPosts.filter(p => p.status === 'approved')
        }

        // ✅ Stocker dans le cache Map par vendorId
        vendorPostsMap.value[vendorId] = fetchedPosts
        return fetchedPosts
      }
      return vendorPostsMap.value[vendorId] || []
    } catch (err) {
      console.error('❌ Erreur fetchVendorPosts:', err)
      // ✅ Retourner le cache si disponible
      return vendorPostsMap.value[vendorId] || []
    }
  }

  // ===== FETCH POST BY ID =====
  const fetchPostById = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`)
      const result = await response.json()
      if (result.success) return result.data.post
      throw new Error(result.message)
    } catch (err) {
      console.error('❌ Erreur fetchPostById:', err)
      // ✅ Fallback : chercher dans le state local
      return (
        posts.value.find(p => p.id === postId) ||
        pendingPosts.value.find(p => p.id === postId) ||
        rejectedPosts.value.find(p => p.id === postId) ||
        null
      )
    }
  }

  // ===== UPDATE POST =====
  const updatePost = async (postId, updates) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.message)

      const updated = result.data.post
      _syncPostInAllArrays(postId, updated)
      return updated
    } catch (err) {
      console.error('❌ Erreur updatePost:', err)
      throw err
    }
  }

  // ===== DELETE POST =====
  const deletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()

      if (!result.success) throw new Error(result.message)

      // ✅ Retirer de tous les tableaux
      posts.value = posts.value.filter(p => p.id !== postId)
      pendingPosts.value = pendingPosts.value.filter(p => p.id !== postId)
      rejectedPosts.value = rejectedPosts.value.filter(p => p.id !== postId)

      // ✅ Retirer du cache vendeur
      for (const vid in vendorPostsMap.value) {
        vendorPostsMap.value[vid] = vendorPostsMap.value[vid].filter(p => p.id !== postId)
      }

      localStorage.setItem('posts_feed_cache', JSON.stringify(posts.value))
      return true
    } catch (err) {
      console.error('❌ Erreur deletePost:', err)
      throw err
    }
  }

  // ===== HELPERS INTERNES =====
  const _syncPostInAllArrays = (postId, updated) => {
    const sync = (arr) => {
      const idx = arr?.findIndex(p => p.id === postId)
      if (idx !== -1) arr[idx] = updated
    }
    sync(posts.value)
    sync(pendingPosts.value)
    sync(rejectedPosts.value)
    for (const vid in vendorPostsMap.value) sync(vendorPostsMap.value[vid])
  }

  const _updateVendorCache = (postId, changes) => {
    for (const vid in vendorPostsMap.value) {
      const idx = vendorPostsMap.value[vid].findIndex(p => p.id === postId)
      if (idx !== -1) {
        vendorPostsMap.value[vid][idx] = { ...vendorPostsMap.value[vid][idx], ...changes }
      }
    }
  }

  return {
    // State
    posts: computed(() => posts.value),
    pendingPosts: computed(() => pendingPosts.value),
    rejectedPosts: computed(() => rejectedPosts.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Methods
    fetchFeed,
    fetchPendingPosts,
    createPost,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    fetchPostById,
    fetchVendorPosts
  }
})
