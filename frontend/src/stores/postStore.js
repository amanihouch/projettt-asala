import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([]) // posts approuvés (feed)
  const pendingPosts = ref([]) // posts en attente (admin)
  const loading = ref(false)

  const fetchFeed = async () => {
    loading.value = true
    try {
      const response = await api.get('/posts/feed')
      posts.value = response.data.data.posts || response.data.data
    } catch (error) {
      console.error('Erreur fetchFeed:', error)
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
      console.error('Erreur fetchPendingPosts:', error)
      pendingPosts.value = []
    } finally {
      loading.value = false
    }
  }

  const createPost = async (postData) => {
    try {
      const response = await api.post('/posts', postData)
      return response.data.data.post
    } catch (error) {
      console.error('Erreur createPost:', error)
      throw error
    }
  }

  const approvePost = async (postId) => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/approve`)
      const approved = response.data.data.post
      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      posts.value.unshift(approved)
      return approved
    } catch (error) {
      console.error('Erreur approvePost:', error)
      throw error
    }
  }

  const rejectPost = async (postId, reason) => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/reject`, { reason })
      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      return response.data.data.post
    } catch (error) {
      console.error('Erreur rejectPost:', error)
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
      if (indexApproved !== -1) posts.value[indexApproved] = updated
      return updated
    } catch (error) {
      console.error('Erreur updatePost:', error)
      throw error
    }
  }

  const deletePost = async (postId) => {
    try {
      await api.delete(`/admin/posts/${postId}`)
      posts.value = posts.value.filter((p) => p.id !== postId)
      pendingPosts.value = pendingPosts.value.filter((p) => p.id !== postId)
      return true
    } catch (error) {
      console.error('Erreur deletePost:', error)
      throw error
    }
  }

  const fetchPostById = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`)
      return response.data.data.post
    } catch (error) {
      console.error('Erreur fetchPostById:', error)
      return null
    }
  }

  const fetchVendorPosts = async (vendorId) => {
    try {
      const response = await api.get(`/posts/vendor/${vendorId}`)
      return response.data.data.posts || []
    } catch (error) {
      console.error('Erreur fetchVendorPosts:', error)
      return []
    }
  }

  return {
    posts,
    pendingPosts,
    loading,
    fetchFeed,
    fetchPendingPosts,
    createPost,
    approvePost,
    rejectPost,
    updatePost,
    deletePost,
    fetchPostById,
    fetchVendorPosts,
  }
})
