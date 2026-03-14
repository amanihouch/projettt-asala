<template>
  <div class="category-page">
    <section class="category-hero">
      <div class="container">
        <h1>{{ categoryInfo.icon }} {{ categoryInfo.name }}</h1>
        <p>{{ categoryInfo.description }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="products-grid grid-4">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'

export default {
  name: 'Category',
  components: { ProductCard },
  setup() {
    const route = useRoute()
    const slug = computed(() => route.params.slug)

    const categories = {
      carpets: {
        name: 'السجاد والمنسوجات',
        icon: '🧵',
        description: 'سجاد ومنسوجات تقليدية تونسية أصيلة',
      },
      pottery: {
        name: 'الفخار والخزف',
        icon: '🏺',
        description: 'فخار وخزف مصنوع يدوياً بطرق تقليدية',
      },
      copperware: {
        name: 'النحاسيات',
        icon: '⚱️',
        description: 'منتجات نحاسية منقوشة بإتقان',
      },
      jewelry: {
        name: 'الحلي والمجوهرات',
        icon: '💍',
        description: 'مجوهرات تقليدية بتصاميم فريدة',
      },
      clothing: {
        name: 'الملابس التقليدية',
        icon: '👘',
        description: 'ملابس تقليدية تونسية أصيلة',
      },
      woodwork: {
        name: 'الخشبيات والنحت',
        icon: '🪵',
        description: 'منتجات خشبية منحوتة بإتقان',
      },
    }

    const categoryInfo = computed(() => {
      return (
        categories[slug.value] || {
          name: 'فئة غير موجودة',
          icon: '❓',
          description: 'الفئة المطلوبة غير متوفرة',
        }
      )
    })

    const products = ref([])

    const loadProducts = () => {
      // Simuler le chargement des produits
      products.value = [
        {
          id: 1,
          name: `منتج من ${categoryInfo.value.name}`,
          price: 150,
          image: 'https://via.placeholder.com/300',
          category: slug.value,
        },
        // Ajoutez plus de produits ici
      ]
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      categoryInfo,
      products,
    }
  },
}
</script>

<style scoped>
.category-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.category-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.section {
  padding: 3rem 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>
