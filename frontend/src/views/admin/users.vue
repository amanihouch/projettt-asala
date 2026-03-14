<!-- src/views/admin/Users.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة المستخدمين</h1>
      <p class="page-subtitle">عرض وإدارة جميع المستخدمين المسجلين</p>
    </header>

    <div class="page-content">
      <!-- Search Bar -->
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="بحث عن مستخدم..."
          class="search-input"
        />
      </div>

      <!-- Users Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-info">
                  <img :src="user.avatar" :alt="user.name" class="user-avatar" />
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || '—' }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button class="action-btn view" @click="viewUser(user)">عرض</button>
                <button class="action-btn delete" @click="deleteUser(user)">حذف</button>
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
const users = ref([])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query),
  )
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-TN')
}

const viewUser = (user) => {
  alert(`عرض المستخدم: ${user.name}`)
}

const deleteUser = (user) => {
  if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
    users.value = users.value.filter((u) => u.id !== user.id)
    localStorage.setItem('customers', JSON.stringify(users.value))
  }
}

onMounted(() => {
  users.value = JSON.parse(localStorage.getItem('customers') || '[]')
})
</script>
