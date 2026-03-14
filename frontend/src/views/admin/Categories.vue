<!-- src/views/admin/Categories.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">إدارة التصنيفات</h1>
      <p class="page-subtitle">إضافة وتعديل وحذف التصنيفات</p>
    </header>

    <div class="page-content">
      <!-- Add Category Form -->
      <div class="add-category-form">
        <h3 class="form-title">إضافة تصنيف جديد</h3>
        <div class="form-row">
          <input
            type="text"
            v-model="newCategory.name"
            placeholder="اسم التصنيف"
            class="form-input"
          />
          <input
            type="text"
            v-model="newCategory.icon"
            placeholder="رمز التصنيف"
            class="form-input small"
          />
          <button class="btn-add" @click="addCategory">إضافة</button>
        </div>
      </div>

      <!-- Categories List -->
      <div class="categories-list">
        <div v-for="cat in categories" :key="cat.id" class="category-item">
          <span class="category-icon">{{ cat.icon }}</span>
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }} منتج</span>
          <div class="category-actions">
            <button class="icon-btn edit" @click="editCategory(cat)">✏️</button>
            <button class="icon-btn delete" @click="deleteCategory(cat)">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])
const newCategory = ref({ name: '', icon: '' })

const addCategory = () => {
  if (!newCategory.value.name || !newCategory.value.icon) return

  categories.value.push({
    id: Date.now(),
    name: newCategory.value.name,
    icon: newCategory.value.icon,
    count: 0,
  })

  newCategory.value = { name: '', icon: '' }
  localStorage.setItem('admin_categories', JSON.stringify(categories.value))
}

const editCategory = (cat) => {
  const newName = prompt('اسم التصنيف الجديد:', cat.name)
  if (newName) {
    cat.name = newName
    localStorage.setItem('admin_categories', JSON.stringify(categories.value))
  }
}

const deleteCategory = (cat) => {
  if (confirm(`حذف التصنيف ${cat.name}؟`)) {
    categories.value = categories.value.filter((c) => c.id !== cat.id)
    localStorage.setItem('admin_categories', JSON.stringify(categories.value))
  }
}

onMounted(() => {
  categories.value = JSON.parse(localStorage.getItem('admin_categories') || '[]')
})
</script>
