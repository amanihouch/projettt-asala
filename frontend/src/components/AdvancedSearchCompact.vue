<template>
  <div class="advanced-search-compact">
    <div class="search-filters">
      <div class="filter-group">
        <label>التصنيف</label>
        <select v-model="filters.category" class="filter-select">
          <option value="">جميع التصنيفات</option>
          <option value="carpets">السجاد والمنسوجات</option>
          <option value="pottery">الفخار والخزف</option>
          <option value="copperware">النحاسيات</option>
          <option value="jewelry">الحلي والمجوهرات</option>
          <option value="clothing">الملابس التقليدية</option>
          <option value="woodwork">الخشبيات والنحت</option>
        </select>
      </div>

      <div class="filter-group">
        <label>نطاق السعر</label>
        <div class="price-range">
          <input v-model="filters.minPrice" type="number" placeholder="من" class="price-input" />
          <span>-</span>
          <input v-model="filters.maxPrice" type="number" placeholder="إلى" class="price-input" />
        </div>
      </div>

      <div class="filter-group">
        <label>الترتيب حسب</label>
        <select v-model="filters.sortBy" class="filter-select">
          <option value="relevance">الأكثر صلة</option>
          <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
          <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
          <option value="rating">التقييم الأعلى</option>
          <option value="newest">الأحدث</option>
        </select>
      </div>
    </div>

    <div class="search-actions">
      <button @click="applyFilters" class="btn btn-primary">بحث</button>
      <button @click="resetFilters" class="btn btn-ghost">إعادة تعيين</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AdvancedSearchCompact',
  emits: ['search', 'close'],
  setup(props, { emit }) {
    const filters = ref({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance',
    })

    const applyFilters = () => {
      emit('search', filters.value)
    }

    const resetFilters = () => {
      filters.value = {
        category: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'relevance',
      }
    }

    return {
      filters,
      applyFilters,
      resetFilters,
    }
  },
}
</script>

<style scoped>
.advanced-search-compact {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  left: 0;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  padding: 1.5rem;
  z-index: 100;
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
}

.filter-select,
.price-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

.filter-select:focus,
.price-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  flex: 1;
}

.search-actions {
  display: flex;
  gap: 1rem;
}

.search-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .search-filters {
    grid-template-columns: 1fr;
  }
}
</style>
