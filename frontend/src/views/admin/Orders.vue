<!-- src/views/admin/Orders.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة الطلبات</h1>
      <p class="page-subtitle">عرض وإدارة جميع طلبات العملاء</p>
    </header>

    <div class="page-content">
      <!-- Filters -->
      <div class="filters-bar">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="processing">قيد المعالجة</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التوصيل</option>
          <option value="cancelled">ملغي</option>
        </select>

        <input type="text" v-model="searchQuery" placeholder="بحث عن طلب..." class="search-input" />
      </div>

      <!-- Orders Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ order.customer?.fullName || order.customer?.name }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ order.total }} د.ت</td>
              <td>
                <select
                  v-model="order.status"
                  class="status-select"
                  @change="updateOrderStatus(order)"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </td>
              <td>
                <button class="action-btn view" @click="viewOrder(order)">تفاصيل</button>
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
const statusFilter = ref('all')
const orders = ref([])

const filteredOrders = computed(() => {
  let result = orders.value

  if (statusFilter.value !== 'all') {
    result = result.filter((o) => o.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (o) =>
        o.id?.toLowerCase().includes(query) ||
        o.customer?.fullName?.toLowerCase().includes(query) ||
        o.customer?.name?.toLowerCase().includes(query),
    )
  }

  return result
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-TN')
}

const updateOrderStatus = (order) => {
  localStorage.setItem('orders', JSON.stringify(orders.value))
}

const viewOrder = (order) => {
  alert(`عرض الطلب: ${order.id}`)
}

onMounted(() => {
  orders.value = JSON.parse(localStorage.getItem('orders') || '[]')
})
</script>
