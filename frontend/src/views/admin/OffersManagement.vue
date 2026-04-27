<!-- frontend/src/views/admin/OffersManagement.vue - VERSION SIMPLIFIÉE AVEC PRODUITS -->
<template>
  <div class="offers-management" :class="{ 'dark-mode': isDarkMode }" dir="rtl">
    <div class="admin-container">
      <main class="admin-main">
        <div class="content-wrapper">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎁</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ offers.length }}</h3>
                <p class="stat-label">إجمالي العروض</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ activeOffersCount }}</h3>
                <p class="stat-label">عروض نشطة</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🌍</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ globalOffersCount }}</h3>
                <p class="stat-label">عروض عامة</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-details">
                <h3 class="stat-value">{{ productOffersCount }}</h3>
                <p class="stat-label">عروض منتجات</p>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="actions-bar">
            <button class="btn-add-offer" @click="openOfferModal()">
              <span class="offer-icon">🎁</span>
              إضافة عرض جديد
            </button>
          </div>

          <!-- Filters -->
          <div class="filters-bar">
            <label class="filter-checkbox">
              <input type="checkbox" v-model="showOnlyActive"> النشطة فقط
            </label>
            <select v-model="typeFilter" class="filter-select">
              <option value="all">جميع الأنواع</option>
              <option value="global">🌍 عام</option>
              <option value="vendor">🏪 بائع</option>
              <option value="product">📦 منتج</option>
            </select>
            <input type="text" v-model="searchQuery" placeholder="🔍 بحث..." class="search-input" />
          </div>

          <!-- Offers Table -->
          <div class="offers-table-container">
            <table class="offers-table">
              <thead>
                <tr>
                  <th>العرض</th>
                  <th>النوع</th>
                  <th>الخصم</th>
                  <th>البائع / المنتج</th>
                  <th>الصلاحية</th>
                  <th>الحالة</th>
                  <th>تلقائي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="offer in filteredOffers" :key="offer.id" :class="{ 'inactive': !offer.active }">
                  <td>
                    <strong>{{ offer.title }}</strong>
                    <p class="offer-desc-preview">{{ truncateText(offer.description, 40) }}</p>
                  </td>
                  <td>
                    <span class="type-badge" :class="offer.type">{{ getTypeLabel(offer.type) }}</span>
                  </td>
                  <td>
                    <div v-if="offer.discountValue" class="discount-info">
                      <span class="discount-value">{{ offer.discountValue }}{{ offer.discountType === 'percentage' ? '%' : ' د.ت' }}</span>
                    </div>
                    <span v-else class="no-discount">-</span>
                  </td>
                  <td>
                    <div class="scope-info">
                      <span v-if="offer.vendorName" class="vendor-name-display">🏪 {{ offer.vendorName }}</span>
                      <span v-if="offer.productNames && offer.productNames.length" class="product-names-display">
                        📦 {{ offer.productNames.slice(0, 2).join(', ') }}
                        <span v-if="offer.productNames.length > 2">+{{ offer.productNames.length - 2 }}</span>
                      </span>
                      <span v-if="!offer.vendorName && (!offer.productNames || !offer.productNames.length)" class="global-badge">🌍 عام</span>
                    </div>
                  </td>
                  <td>
                    <div class="validity-info">
                      <span v-if="offer.expiryDate" :class="{ expired: isExpired(offer.expiryDate) }">{{ formatDate(offer.expiryDate) }}</span>
                      <span v-else class="permanent">دائم</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" :class="offer.active ? 'active' : 'inactive'">{{ offer.active ? 'نشط' : 'غير نشط' }}</span>
                  </td>
                  <td>
                    <span class="auto-badge" :class="offer.autoApply ? 'auto' : ''">{{ offer.autoApply ? '✅ تلقائي' : '❌ يدوي' }}</span>
                  </td>
                  <td class="actions-cell">
                    <button class="action-btn edit" @click="openOfferModal(offer)" title="تعديل">✏️</button>
                    <button class="action-btn toggle" @click="toggleOfferStatus(offer)" :title="offer.active ? 'تعطيل' : 'تفعيل'">{{ offer.active ? '🔴' : '🟢' }}</button>
                    <button class="action-btn delete" @click="deleteOffer(offer.id)" title="حذف">🗑️</button>
                  </td>
                </tr>
                <tr v-if="filteredOffers.length === 0">
                  <td colspan="8" class="empty-state-cell">
                    <div class="empty-state">
                      <div class="empty-icon">🎁</div>
                      <p>لا توجد عروض حالياً</p>
                      <button class="btn-add-mini" @click="openOfferModal()">إضافة أول عرض</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- ========== MODAL OFFRE ========== -->
    <transition name="modal">
      <div v-if="showOfferModal" class="modal-overlay" @click.self="closeOfferModal">
        <div class="modal-content" :class="{ 'dark-mode': isDarkMode }">
          <div class="modal-header">
            <h3>{{ editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد' }}</h3>
            <button class="modal-close" @click="closeOfferModal">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveOffer">

              <!-- Titre -->
              <div class="form-group">
                <label class="form-label">عنوان العرض <span class="required">*</span></label>
                <input type="text" v-model="offerForm.title" class="form-input" placeholder="مثال: خصم الصيف 2024" required />
              </div>

              <!-- Description -->
              <div class="form-group">
                <label class="form-label">وصف العرض</label>
                <textarea v-model="offerForm.description" class="form-textarea" rows="2" placeholder="وصف مختصر للعرض..."></textarea>
              </div>

              <!-- Type d'offre -->
              <div class="form-group">
                <label class="form-label">نوع العرض <span class="required">*</span></label>
                <select v-model="offerForm.type" class="form-input" @change="onOfferTypeChange">
                  <option value="global">🌍 عام (كل المنتجات)</option>
                  <option value="vendor">🏪 بائع محدد</option>
                  <option value="product">📦 منتجات محددة</option>
                </select>
              </div>

              <!-- Type de remise -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">نوع الخصم <span class="required">*</span></label>
                  <select v-model="offerForm.discountType" class="form-input">
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (د.ت)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">قيمة الخصم <span class="required">*</span></label>
                  <input type="number" v-model="offerForm.discountValue" class="form-input" step="0.01" min="0" placeholder="0.00" required />
                </div>
              </div>

              <!-- Montant minimum -->
              <div class="form-group">
                <label class="form-label">الحد الأدنى للطلب (د.ت)</label>
                <input type="number" v-model="offerForm.minPurchase" class="form-input" step="0.01" min="0" placeholder="0.00" />
              </div>

              <!-- ✅ SÉLECTION VENDEUR -->
              <div class="form-group" v-if="offerForm.type === 'vendor'">
                <label class="form-label">اختر البائع <span class="required">*</span></label>
                <select v-model="offerForm.vendorId" class="form-input" :disabled="loadingVendors">
                  <option value="">-- اختر بائع --</option>
                  <option v-for="vendor in vendorsList" :key="vendor.id" :value="vendor.id">
                    {{ vendor.shopName || vendor.name }}
                  </option>
                </select>
                <small v-if="loadingVendors" class="loading-hint">⏳ جاري تحميل البائعين...</small>
              </div>

              <!-- ✅ SÉLECTION PRODUITS -->
              <div class="form-group" v-if="offerForm.type === 'product'">
                <label class="form-label">اختر المنتجات <span class="required">*</span></label>

                <!-- Barre de recherche produits -->
                <div class="product-search-wrapper">
                  <input
                    type="text"
                    v-model="productSearch"
                    placeholder="🔍 بحث عن منتج..."
                    class="form-input search-product-input"
                    @input="searchProducts"
                  />
                </div>

                <!-- Liste des produits -->
                <div class="products-checkbox-list" v-if="filteredProductsList.length > 0">
                  <label
                    v-for="product in filteredProductsList.slice(0, 30)"
                    :key="product.id"
                    class="product-checkbox"
                    :class="{ selected: offerForm.productIds.includes(product.id) }"
                  >
                    <input
                      type="checkbox"
                      :value="product.id"
                      v-model="offerForm.productIds"
                      @change="onProductSelect"
                    />
                    <div class="product-checkbox-info">
                      <img
                        :src="getProductImage(product)"
                        :alt="product.productName || product.name"
                        class="product-thumb"
                        @error="(e) => e.target.src = 'https://placehold.co/40x40/08717f/white?text=📦'"
                      />
                      <div class="product-details">
                        <span class="product-name">{{ product.productName || product.name }}</span>
                        <span class="product-price">{{ formatPrice(product.price) }} د.ت</span>
                      </div>
                      <span v-if="offerForm.productIds.includes(product.id)" class="selected-check">✓</span>
                    </div>
                  </label>
                </div>
                <div v-else class="no-products">
                  <p>لم يتم العثور على منتجات</p>
                </div>

                <!-- Compteur produits sélectionnés -->
                <div v-if="offerForm.productIds.length > 0" class="selected-count">
                  ✅ تم اختيار <strong>{{ offerForm.productIds.length }}</strong> منتج
                </div>

                <small v-if="loadingProducts" class="loading-hint">⏳ جاري تحميل المنتجات...</small>
              </div>

              <!-- Dates -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">تاريخ البداية</label>
                  <input type="date" v-model="offerForm.startDate" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">تاريخ النهاية</label>
                  <input type="date" v-model="offerForm.expiryDate" class="form-input" />
                </div>
              </div>

              <!-- Options -->
              <div class="form-row-checkbox">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="offerForm.active" />
                  <span>نشط</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="offerForm.autoApply" />
                  <span>تطبيق تلقائي على المنتجات</span>
                </label>
              </div>

              <!-- Actions -->
              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="closeOfferModal">إلغاء</button>
                <button type="submit" class="btn-save" :disabled="savingOffer">
                  <span v-if="!savingOffer">{{ editingOffer ? '💾 تحديث العرض' : '✅ إضافة العرض' }}</span>
                  <span v-else class="loading-spinner"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="[toast.type, { 'dark-mode': isDarkMode }]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { usePostStore } from '../../stores/postStore'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const postStore = usePostStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== STATE =====
const showOfferModal = ref(false)
const editingOffer = ref(null)
const savingOffer = ref(false)
const offers = ref([])
const showOnlyActive = ref(false)
const typeFilter = ref('all')
const searchQuery = ref('')

// Vendeurs & Produits
const vendorsList = ref([])
const allProducts = ref([])
const filteredProductsList = ref([])
const productSearch = ref('')
const loadingVendors = ref(false)
const loadingProducts = ref(false)

const toast = ref({ show: false, message: '', type: 'success', icon: '✅' })

// ===== FORM OFFRE =====
const offerForm = ref({
  id: null, title: '', description: '', type: 'global',
  discountType: 'percentage', discountValue: 0, minPurchase: 0,
  vendorId: null, productIds: [],
  startDate: '', expiryDate: '', active: true, autoApply: false
})

// ===== COMPUTED =====
const activeOffersCount = computed(() => offers.value.filter(o => o.active && !isExpired(o.expiryDate)).length)
const globalOffersCount = computed(() => offers.value.filter(o => o.type === 'global').length)
const productOffersCount = computed(() => offers.value.filter(o => o.type === 'product').length)

const filteredOffers = computed(() => {
  let result = [...offers.value]
  if (showOnlyActive.value) result = result.filter(o => o.active === true)
  if (typeFilter.value !== 'all') result = result.filter(o => o.type === typeFilter.value)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(o => o.title?.toLowerCase().includes(query) || o.description?.toLowerCase().includes(query))
  }
  return result
})

// ===== HELPERS =====
const truncateText = (text, length) => text ? (text.length > length ? text.substring(0, length) + '...' : text) : ''
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('ar-TN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const formatPrice = (price) => price === undefined || price === null ? '0' : new Intl.NumberFormat('ar-TN').format(price)
const isExpired = (dateStr) => dateStr ? new Date(dateStr) < new Date() : false
const getTypeLabel = (type) => ({ global: '🌍 عام', vendor: '🏪 بائع', product: '📦 منتج' })[type] || type

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) return product.images[0]
  if (product.image) return product.image
  return 'https://placehold.co/40x40/08717f/white?text=📦'
}

const showNotification = (message, type = 'success') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  toast.value = { show: true, message, type, icon: icons[type] || icons.success }
  setTimeout(() => (toast.value.show = false), 3000)
}

// ===== LOAD DATA =====
const loadOffers = () => {
  try {
    const saved = localStorage.getItem('specialOffers')
    offers.value = saved ? JSON.parse(saved) : []
  } catch (error) { offers.value = [] }
}

const saveToStorage = () => {
  localStorage.setItem('specialOffers', JSON.stringify(offers.value))
  window.dispatchEvent(new CustomEvent('special-offers:updated', { detail: offers.value }))
}

const loadVendors = async () => {
  loadingVendors.value = true
  try {
    const response = await api.get('/vendors')
    if (response.data.success) {
      vendorsList.value = response.data.data?.data || response.data.data || []
    }
  } catch (error) { console.error('Erreur chargement vendeurs:', error) }
  finally { loadingVendors.value = false }
}

const loadProducts = async () => {
  loadingProducts.value = true
  try {
    await postStore.fetchFeed()
    allProducts.value = postStore.posts || []
    filteredProductsList.value = allProducts.value
  } catch (error) { console.error('Erreur chargement produits:', error) }
  finally { loadingProducts.value = false }
}

const searchProducts = () => {
  if (!productSearch.value.trim()) {
    filteredProductsList.value = allProducts.value
    return
  }
  const query = productSearch.value.toLowerCase()
  filteredProductsList.value = allProducts.value.filter(p =>
    (p.productName || p.name || '').toLowerCase().includes(query) ||
    (p.vendorName || p.vendor?.name || '').toLowerCase().includes(query)
  )
}

const onOfferTypeChange = () => {
  offerForm.value.vendorId = null
  offerForm.value.productIds = []
}

const onProductSelect = () => {
  // Mise à jour automatique
}

// ===== CRUD OFFRE =====
const openOfferModal = (offer = null) => {
  if (offer) {
    editingOffer.value = offer
    offerForm.value = {
      id: offer.id,
      title: offer.title || '',
      description: offer.description || '',
      type: offer.type || 'global',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || 0,
      minPurchase: offer.minPurchase || 0,
      vendorId: offer.vendorId || null,
      productIds: offer.productIds || [],
      startDate: offer.startDate || '',
      expiryDate: offer.expiryDate || '',
      active: offer.active !== false,
      autoApply: offer.autoApply || false
    }
    // Charger les produits si nécessaire
    if (offer.type === 'product') {
      searchProducts()
    }
  } else {
    editingOffer.value = null
    offerForm.value = {
      id: Date.now(), title: '', description: '', type: 'global',
      discountType: 'percentage', discountValue: 0, minPurchase: 0,
      vendorId: null, productIds: [],
      startDate: '', expiryDate: '', active: true, autoApply: false
    }
  }
  showOfferModal.value = true
}

const closeOfferModal = () => {
  showOfferModal.value = false
  editingOffer.value = null
}

const saveOffer = () => {
  // Validation
  if (!offerForm.value.title.trim()) {
    showNotification('الرجاء إدخال عنوان العرض', 'warning'); return
  }
  if (!offerForm.value.discountValue || offerForm.value.discountValue <= 0) {
    showNotification('الرجاء إدخال قيمة الخصم', 'warning'); return
  }
  if (offerForm.value.type === 'vendor' && !offerForm.value.vendorId) {
    showNotification('الرجاء اختيار بائع', 'warning'); return
  }
  if (offerForm.value.type === 'product' && offerForm.value.productIds.length === 0) {
    showNotification('الرجاء اختيار منتج واحد على الأقل', 'warning'); return
  }

  savingOffer.value = true

  // Récupérer les infos vendeur/produits
  const vendor = vendorsList.value.find(v => v.id === offerForm.value.vendorId)
  const selectedProducts = allProducts.value.filter(p => offerForm.value.productIds.includes(p.id))

  const newOffer = {
    ...offerForm.value,
    discountValue: Number(offerForm.value.discountValue),
    minPurchase: Number(offerForm.value.minPurchase || 0),
    vendorName: vendor ? (vendor.shopName || vendor.name) : null,
    productIds: offerForm.value.productIds,
    productNames: selectedProducts.map(p => p.productName || p.name),
    usedCount: editingOffer.value ? (editingOffer.value.usedCount || 0) : 0,
    highlighted: editingOffer.value ? (editingOffer.value.highlighted || false) : false
  }

  if (editingOffer.value) {
    const index = offers.value.findIndex(o => o.id === editingOffer.value.id)
    if (index !== -1) offers.value[index] = newOffer
  } else {
    offers.value.unshift(newOffer)
  }

  saveToStorage()
  closeOfferModal()
  savingOffer.value = false
  showNotification(editingOffer.value ? '✅ تم تحديث العرض بنجاح' : '✅ تم إضافة العرض بنجاح')
}

const toggleOfferStatus = (offer) => {
  offer.active = !offer.active
  saveToStorage()
  showNotification(`تم ${offer.active ? 'تفعيل' : 'تعطيل'} العرض`)
}

const deleteOffer = (offerId) => {
  if (confirm('هل أنت متأكد من حذف هذا العرض؟')) {
    offers.value = offers.value.filter(o => o.id !== offerId)
    saveToStorage()
    showNotification('🗑️ تم حذف العرض بنجاح', 'info')
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'admin') {
    router.push('/login')
    return
  }
  loadOffers()
  loadVendors()
  loadProducts()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
.offers-management { font-family: 'Amiri', 'Cairo', serif; min-height: 100vh; background: #f5f7fa; transition: all 0.3s ease; }
.offers-management * { font-family: 'Amiri', 'Cairo', serif; }
.offers-management.dark-mode { background: #0f172a; }
.admin-container { display: flex; min-height: 100vh; }
.admin-main { flex: 1; display: flex; flex-direction: column; overflow-x: hidden; }
.content-wrapper { padding: 30px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.dark-mode .stat-card { background: #1e293b; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.stat-icon { width: 60px; height: 60px; background: #e0f2f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
.dark-mode .stat-icon { background: rgba(8,113,127,0.2); }
.stat-details { flex: 1; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0 0 5px 0; }
.dark-mode .stat-value { color: #f1f5f9; }
.stat-label { color: #64748b; font-size: 0.9rem; margin: 0; }

.actions-bar { margin-bottom: 25px; display: flex; gap: 12px; flex-wrap: wrap; }
.btn-add-offer { padding: 14px 28px; background: linear-gradient(135deg, #08717f, #065a69); color: white; border: none; border-radius: 30px; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
.btn-add-offer:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(8,113,127,0.3); }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: white; border-radius: 12px; align-items: center; flex-wrap: wrap; }
.dark-mode .filters-bar { background: #1e293b; }
.filter-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #475569; }
.filter-select { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; font-family: inherit; cursor: pointer; }
.dark-mode .filter-select { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.search-input { flex: 1; min-width: 200px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; }
.dark-mode .search-input { background: #0f172a; border-color: #334155; color: #f1f5f9; }

.offers-table-container { background: white; border-radius: 16px; overflow-x: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.dark-mode .offers-table-container { background: #1e293b; }
.offers-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.offers-table th { text-align: right; padding: 15px; background: #f8fafc; color: #475569; font-weight: 600; font-size: 0.85rem; border-bottom: 2px solid #e2e8f0; }
.dark-mode .offers-table th { background: #0f172a; color: #94a3b8; border-bottom-color: #334155; }
.offers-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #1e293b; }
.dark-mode .offers-table td { border-bottom-color: #334155; color: #cbd5e1; }

.discount-value { font-weight: 700; color: #ef4444; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }
.type-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; color: white; }
.type-badge.global { background: #3b82f6; }
.type-badge.vendor { background: #8b5cf6; }
.type-badge.product { background: #10b981; }
.auto-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: #f1f5f9; color: #64748b; }
.auto-badge.auto { background: #d4edda; color: #155724; }

.actions-cell { display: flex; gap: 6px; flex-wrap: wrap; }
.action-btn { width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; }
.dark-mode .action-btn { background: #334155; color: #94a3b8; }
.action-btn.edit:hover { background: #08717f; color: white; }
.action-btn.toggle:hover { background: #f59e0b; color: white; }
.action-btn.delete:hover { background: #ef4444; color: white; }

tr.inactive { opacity: 0.6; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.dark-mode .modal-content { background: #1e293b; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
.dark-mode .modal-header { border-bottom-color: #334155; }
.modal-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0; }
.dark-mode .modal-header h3 { color: #f1f5f9; }
.modal-close { width: 32px; height: 32px; background: #f1f5f9; border: none; border-radius: 8px; cursor: pointer; font-size: 1.2rem; }
.modal-close:hover { background: #ef4444; color: white; }
.modal-body { padding: 20px; }

.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.dark-mode .form-label { color: #cbd5e1; }
.required { color: #d40025; }
.form-input, .form-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; background: white; font-family: inherit; }
.dark-mode .form-input, .dark-mode .form-textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #08717f; }
.form-textarea { resize: vertical; min-height: 60px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-row-checkbox { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }

.product-search-wrapper { margin-bottom: 10px; }
.search-product-input { background: #f8fafc; }
.dark-mode .search-product-input { background: #1e293b; }

.products-checkbox-list { max-height: 250px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-top: 8px; }
.dark-mode .products-checkbox-list { border-color: #334155; }
.product-checkbox { display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 6px; transition: background 0.2s; }
.product-checkbox:hover { background: #f8fafc; }
.dark-mode .product-checkbox:hover { background: #1e293b; }
.product-checkbox.selected { background: #e0f2f1; }
.dark-mode .product-checkbox.selected { background: rgba(8,113,127,0.2); }
.product-checkbox input[type="checkbox"] { margin-left: 10px; width: 18px; height: 18px; accent-color: #08717f; }
.product-checkbox-info { display: flex; align-items: center; gap: 10px; flex: 1; }
.product-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
.product-details { display: flex; flex-direction: column; }
.product-name { font-size: 0.85rem; font-weight: 600; }
.product-price { font-size: 0.75rem; color: #08717f; font-weight: 600; }
.selected-check { color: #08717f; font-weight: 700; font-size: 1.1rem; }

.selected-count { margin-top: 10px; padding: 8px 12px; background: #f0fdf4; border-radius: 8px; color: #15803d; font-size: 0.85rem; }
.no-products { padding: 20px; text-align: center; color: #64748b; }
.loading-hint { display: block; margin-top: 5px; color: #64748b; font-size: 0.8rem; }

.modal-actions { display: flex; gap: 15px; margin-top: 25px; }
.btn-cancel, .btn-save { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.dark-mode .btn-cancel { background: #334155; color: #cbd5e1; }
.btn-save { background: linear-gradient(135deg, #08717f, #065a69); color: white; }
.btn-save:hover:not(:disabled) { transform: translateY(-2px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-notification { position: fixed; bottom: 30px; right: 30px; display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: white; border-radius: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 9999; border-right: 4px solid; animation: slideInRight 0.3s ease; overflow: hidden; }
.toast-notification.success { border-right-color: #10b981; }
.toast-notification.error { border-right-color: #ef4444; }
.toast-progress { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #08717f, #d40025); animation: progress 3s linear forwards; }
@keyframes progress { from { width: 0; } to { width: 100%; } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

.empty-state-cell { text-align: center; padding: 40px !important; }
.empty-icon { font-size: 3rem; opacity: 0.5; margin-bottom: 15px; }
.btn-add-mini { padding: 10px 20px; background: linear-gradient(135deg, #08717f, #065a69); color: white; border: none; border-radius: 30px; font-weight: 600; cursor: pointer; }

@media (max-width: 768px) {
  .content-wrapper { padding: 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .filters-bar { flex-direction: column; align-items: stretch; }
}
</style>
