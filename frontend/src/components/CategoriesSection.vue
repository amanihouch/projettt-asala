<!-- src/components/CategoriesSection.vue -->
<template>
  <div class="categories-scroll-section" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <div class="categories-scroll-header">
        <span class="scroll-badge">📚 الفئات</span>
        <h2 class="scroll-title">تسوق حسب <span class="gradient-text">اهتمامك</span></h2>
        <p class="scroll-subtitle">اكتشف منتجاتنا المتنوعة حسب الفئة التي تفضلها</p>
      </div>

      <div class="categories-scroll-wrapper">
        <button class="scroll-nav-btn prev-btn" @click="scrollCategories('left')" v-if="showScrollArrows">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" stroke-width="2"/>
          </svg>
        </button>

        <div class="categories-scroll-container" ref="scrollContainer">
          <div
            v-for="category in categoriesList"
            :key="category.id"
            class="category-scroll-card"
            :class="{ active: selectedCategoryId === category.id }"
            @click="selectCategory(category)"
          >
            <div class="category-scroll-image" :style="{ backgroundImage: `url(${getCategoryImage(category.slug)})` }">
              <div class="category-scroll-overlay"></div>
              <div class="category-active-indicator" v-if="selectedCategoryId === category.id">
                <span>✓</span>
              </div>
            </div>
            <div class="category-scroll-content">
              <span class="category-scroll-icon">{{ category.icon || '📦' }}</span>
              <h3 class="category-scroll-name">{{ category.name_ar || category.name }}</h3>
              <span class="category-scroll-count">{{ getProductCount(category) }} منتج</span>
            </div>
          </div>
        </div>

        <button class="scroll-nav-btn next-btn" @click="scrollCategories('right')" v-if="showScrollArrows">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  categoriesList: {
    type: Array,
    default: () => []
  },
  getProductCount: {
    type: Function,
    default: () => 0
  },
  selectCategory: {
    type: Function,
    default: () => {}
  },
  selectedCategoryId: {
    type: [Number, String],
    default: null
  }
})

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const scrollContainer = ref(null)
const showScrollArrows = ref(false)

// Images locales depuis /src/assets/categories/
const getCategoryImage = (slug) => {
  const imageMap = {
    perfumes: new URL('/src/assets/categories/perfumes.jpg', import.meta.url).href,
    jewelry: new URL('/src/assets/categories/jewelry.jpg', import.meta.url).href,
    clothing: new URL('/src/assets/categories/clothing.jpg', import.meta.url).href,
    decor: new URL('/src/assets/categories/decor.jpg', import.meta.url).href,
    textiles: new URL('/src/assets/categories/textiles.jpg', import.meta.url).href,
    pottery: new URL('/src/assets/categories/pottery.jpg', import.meta.url).href,
    beauty: new URL('/src/assets/categories/beauty.jpg', import.meta.url).href,
    food: new URL('/src/assets/categories/food.jpg', import.meta.url).href,
    carpets: new URL('/src/assets/categories/textiles.jpg', import.meta.url).href,
    copperware: new URL('/src/assets/categories/decor.jpg', import.meta.url).href,
    woodwork: new URL('/src/assets/categories/decor.jpg', import.meta.url).href,
    leather: new URL('/src/assets/categories/clothing.jpg', import.meta.url).href,
    stainedglass: new URL('/src/assets/categories/decor.jpg', import.meta.url).href,
    other: new URL('/src/assets/categories/other.jpg', import.meta.url).href,
    default: new URL('/src/assets/categories/default.jpg', import.meta.url).href
  }
  return imageMap[slug] || imageMap.default
}

const scrollCategories = (direction) => {
  const container = scrollContainer.value
  if (container) {
    const scrollAmount = 300
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }
}

const checkScrollArrows = () => {
  const container = scrollContainer.value
  if (container) {
    showScrollArrows.value = container.scrollWidth > container.clientWidth
  }
}

onMounted(async () => {
  await nextTick()
  checkScrollArrows()
  window.addEventListener('resize', checkScrollArrows)
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', checkScrollArrows)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollArrows)
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', checkScrollArrows)
  }
})
</script>

<style scoped>
/* ===== CATEGORIES SCROLL SECTION ===== */
.categories-scroll-section {
  padding: 40px 0;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.categories-scroll-section.dark-mode {
  background: #1f2937;
  border-bottom-color: #374151;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.categories-scroll-header {
  text-align: center;
  margin-bottom: 30px;
}

.scroll-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #08717f, #d40025);
  color: white;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.dark-mode .scroll-badge {
  background: linear-gradient(135deg, #3b82f6, #ef4444);
}

.scroll-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .scroll-title {
  color: #f3f4f6;
}

.gradient-text {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark-mode .gradient-text {
  background: linear-gradient(135deg, #3b82f6, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.scroll-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.dark-mode .scroll-subtitle {
  color: #9ca3af;
}

.categories-scroll-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.categories-scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 20px;
  padding: 10px 5px;
  scrollbar-width: thin;
  flex: 1;
}

.categories-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.categories-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.dark-mode .categories-scroll-container::-webkit-scrollbar-track {
  background: #374151;
}

.categories-scroll-container::-webkit-scrollbar-thumb {
  background: #08717f;
  border-radius: 10px;
}

.dark-mode .categories-scroll-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
}

.category-scroll-card {
  flex: 0 0 180px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-scroll-card.active {
  box-shadow: 0 0 0 3px #08717f, 0 10px 30px rgba(8, 113, 127, 0.3);
  transform: scale(1.02);
}

.dark-mode .category-scroll-card.active {
  box-shadow: 0 0 0 3px #3b82f6, 0 10px 30px rgba(59, 130, 246, 0.3);
}

.category-scroll-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(8, 113, 127, 0.15);
}

.category-scroll-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.category-scroll-card:hover .category-scroll-image {
  transform: scale(1.1);
}

.category-scroll-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}

.category-active-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: #08717f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: pulse 1s ease infinite;
}

.dark-mode .category-active-indicator {
  background: #3b82f6;
}

.category-active-indicator span {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.category-scroll-content {
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  z-index: 2;
  text-align: right;
}

.category-scroll-icon {
  font-size: 1.8rem;
  margin-bottom: 5px;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.category-scroll-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 3px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.category-scroll-count {
  font-size: 0.7rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.scroll-nav-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #08717f;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.scroll-nav-btn:hover {
  background: #08717f;
  color: white;
  border-color: #08717f;
  transform: scale(1.1);
}

.dark-mode .scroll-nav-btn {
  background: #1f2937;
  border-color: #374151;
  color: #3b82f6;
}

.dark-mode .scroll-nav-btn:hover {
  background: #3b82f6;
  color: white;
}

/* Responsive */
@media (max-width: 992px) {
  .category-scroll-card {
    flex: 0 0 160px;
    height: 180px;
  }
}

@media (max-width: 768px) {
  .scroll-nav-btn {
    display: none;
  }

  .categories-scroll-container {
    overflow-x: auto;
  }

  .scroll-title {
    font-size: 1.5rem;
  }

  .category-scroll-card {
    flex: 0 0 140px;
    height: 160px;
  }

  .category-scroll-icon {
    font-size: 1.2rem;
  }

  .category-scroll-name {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .category-scroll-card {
    flex: 0 0 120px;
    height: 140px;
  }

  .category-scroll-icon {
    font-size: 1rem;
  }

  .category-scroll-name {
    font-size: 0.7rem;
  }

  .category-scroll-count {
    font-size: 0.6rem;
  }
}
</style>
