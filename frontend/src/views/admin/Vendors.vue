<!-- src/views/admin/Vendors.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة البائعين</h1>
      <p class="page-subtitle">عرض وإدارة جميع البائعين المسجلين</p>
    </header>

    <div class="page-content">
      <!-- Search Bar -->
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="بحث عن بائع..."
          class="search-input"
        />
      </div>

      <!-- Vendors Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>المتجر</th>
              <th>البائع</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>التخصص</th>
              <th>المنتجات</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vendor in filteredVendors" :key="vendor.id">
              <td>
                <div class="vendor-info">
                  <img :src="vendor.avatar" :alt="vendor.shopName" class="vendor-avatar" />
                  <span>{{ vendor.shopName }}</span>
                </div>
              </td>
              <td>{{ vendor.name }}</td>
              <td>{{ vendor.email }}</td>
              <td>{{ vendor.phone || '—' }}</td>
              <td>{{ vendor.specialty || '—' }}</td>
              <td>{{ vendor.products || 0 }}</td>
              <td>
                <span class="status-badge" :class="{ verified: vendor.verified }">
                  {{ vendor.verified ? 'موثق' : 'غير موثق' }}
                </span>
              </td>
              <td>
                <button class="action-btn view" @click="viewVendor(vendor)">عرض</button>
                <button class="action-btn toggle" @click="toggleVerification(vendor)">
                  {{ vendor.verified ? 'إلغاء التوثيق' : 'توثيق' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const searchQuery = ref('')
const vendors = ref([])

const filteredVendors = computed(() => {
  if (!searchQuery.value) return vendors.value
  const query = searchQuery.value.toLowerCase()
  return vendors.value.filter(
    (v) =>
      v.shopName?.toLowerCase().includes(query) ||
      v.name?.toLowerCase().includes(query) ||
      v.email?.toLowerCase().includes(query),
  )
})

const viewVendor = (vendor) => {
  window.open(`/vendor/${vendor.id}`, '_blank')
}

const toggleVerification = (vendor) => {
  vendor.verified = !vendor.verified
  localStorage.setItem('vendors', JSON.stringify(vendors.value))
}

onMounted(() => {
  vendors.value = JSON.parse(localStorage.getItem('vendors') || '[]')
})
</script>
