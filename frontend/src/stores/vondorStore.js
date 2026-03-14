import { defineStore } from 'pinia'
import api from '../services/api'

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    vendors: [],
    currentVendor: null,
    topVendors: [],
    loading: false,
    totalPages: 1,
    currentPage: 1,
    totalCount: 0,
  }),

  actions: {
    async fetchVendors(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/vendors', { params })
        this.vendors = response.data.data.vendors || response.data.data
        this.totalCount = response.data.data.total || this.vendors.length
        this.currentPage = response.data.data.page || 1
        this.totalPages = response.data.data.pages || 1
      } catch (error) {
        console.error('Erreur fetchVendors:', error)
        this.vendors = []
      } finally {
        this.loading = false
      }
    },

    async fetchVendorById(id) {
      this.loading = true
      try {
        const response = await api.get(`/vendors/${id}`)
        this.currentVendor = response.data.data.vendor
        return this.currentVendor
      } catch (error) {
        console.error('Erreur fetchVendorById:', error)
        this.currentVendor = null
        return null
      } finally {
        this.loading = false
      }
    },

    async createVendor(vendorData) {
      try {
        const response = await api.post('/vendors', vendorData)
        const newVendor = response.data.data.vendor
        this.vendors.push(newVendor)
        return newVendor
      } catch (error) {
        console.error('Erreur createVendor:', error)
        throw error
      }
    },

    async updateVendor(id, updates) {
      try {
        const response = await api.patch(`/vendors/${id}`, updates)
        const updatedVendor = response.data.data.vendor
        if (this.currentVendor?.id === id) this.currentVendor = updatedVendor
        const index = this.vendors.findIndex((v) => v.id === id)
        if (index !== -1) this.vendors[index] = updatedVendor
        return updatedVendor
      } catch (error) {
        console.error('Erreur updateVendor:', error)
        throw error
      }
    },

    async toggleFollow(vendorId) {
      try {
        const response = await api.post(`/vendors/${vendorId}/follow`)
        return response.data.data
      } catch (error) {
        console.error('Erreur toggleFollow:', error)
        throw error
      }
    },
  },
})
