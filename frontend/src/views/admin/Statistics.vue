<!-- frontend/src/views/admin/Statistics.vue - CORRECTION RENDU GRAPHIQUES -->
<template>
  <div class="statistics-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Périodes -->
    <div class="period-filters">
      <div class="filter-group">
        <label>📅 الفترة:</label>
        <div class="filter-buttons">
          <button class="period-btn" :class="{ active: currentPeriod === 'day' }" @click="changePeriod('day')">اليوم</button>
          <button class="period-btn" :class="{ active: currentPeriod === '3days' }" @click="changePeriod('3days')">3 أيام</button>
          <button class="period-btn" :class="{ active: currentPeriod === 'week' }" @click="changePeriod('week')">أسبوع</button>
          <button class="period-btn" :class="{ active: currentPeriod === 'month' }" @click="changePeriod('month')">شهر</button>
          <button class="period-btn" :class="{ active: currentPeriod === '3months' }" @click="changePeriod('3months')">3 أشهر</button>
          <button class="period-btn" :class="{ active: currentPeriod === 'year' }" @click="changePeriod('year')">سنة</button>
        </div>
      </div>
    </div>

    <!-- Cartes principales -->
    <div class="stats-overview-grid">
      <div class="overview-card users"><div class="card-icon">👥</div><div class="card-info"><span class="card-value">{{ formatNumber(realStats.total_users) }}</span><span class="card-label">إجمالي المستخدمين</span></div></div>
      <div class="overview-card vendors"><div class="card-icon">🏪</div><div class="card-info"><span class="card-value">{{ formatNumber(realStats.total_vendors) }}</span><span class="card-label">إجمالي البائعين</span></div></div>
      <div class="overview-card products"><div class="card-icon">📦</div><div class="card-info"><span class="card-value">{{ formatNumber(realStats.total_products) }}</span><span class="card-label">إجمالي المنتجات</span></div></div>
      <div class="overview-card visits"><div class="card-icon">👁️</div><div class="card-info"><span class="card-value">{{ formatNumber(realStats.total_visits) }}</span><span class="card-label">إجمالي الزيارات</span></div></div>
      <div class="overview-card orders"><div class="card-icon">🛒</div><div class="card-info"><span class="card-value">{{ formatNumber(realStats.total_orders) }}</span><span class="card-label">إجمالي الطلبات</span></div></div>
      <div class="overview-card revenue"><div class="card-icon">💰</div><div class="card-info"><span class="card-value">{{ formatPrice(realStats.total_revenue) }}</span><span class="card-label">إجمالي الإيرادات</span></div></div>
    </div>

    <!-- Graphique Commandes/Revenus -->
    <div class="chart-card full-width">
      <div class="chart-header"><h3>📊 Évolution des commandes et revenus ({{ getPeriodLabel() }})</h3></div>
      <div class="chart-container"><canvas ref="ordersRevenueChartCanvas"></canvas></div>
    </div>

    <!-- Graphique Utilisateurs -->
    <div class="chart-card full-width">
      <div class="chart-header"><h3>📈 Évolution des utilisateurs ({{ getPeriodLabel() }})</h3></div>
      <div class="chart-container"><canvas ref="usersVendorsChartCanvas"></canvas></div>
    </div>

    <!-- Graphique Visites -->
    <div class="chart-card full-width">
      <div class="chart-header"><h3>📈 Évolution des visites ({{ getPeriodLabel() }})</h3></div>
      <div class="chart-container"><canvas ref="visitsChartCanvas"></canvas></div>
    </div>

    <!-- Graphique Publications -->
    <div class="chart-card full-width">
      <div class="chart-header"><h3>📝 Évolution des publications ({{ getPeriodLabel() }})</h3></div>
      <div class="chart-container"><canvas ref="postsChartCanvas"></canvas></div>
    </div>

    <!-- Graphique Catégories -->
    <div class="chart-card full-width">
      <div class="chart-header"><h3>🏷️ Produits par catégorie</h3></div>
      <div class="chart-container" style="height: 450px"><canvas ref="categoriesChartCanvas"></canvas></div>
    </div>

    <div v-if="apiLoading" class="loading-overlay"><div class="loading-spinner"></div><p>جاري تحميل البيانات...</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { aiService } from '../../services/api'
import { useThemeStore } from '/src/stores/theme'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const apiLoading = ref(false)
const currentPeriod = ref('week')

const visitsChartCanvas = ref(null)
const postsChartCanvas = ref(null)
const usersVendorsChartCanvas = ref(null)
const categoriesChartCanvas = ref(null)
const ordersRevenueChartCanvas = ref(null)

let visitsChart = null
let postsChart = null
let usersVendorsChart = null
let categoriesChart = null
let ordersRevenueChart = null

const realStats = ref({ total_users: 0, total_vendors: 0, total_products: 0, total_orders: 0, total_revenue: 0, total_visits: 0 })
const visitsData = ref([])
const postsEvolution = ref([])
const usersEvolution = ref({ months: [], clients: [], vendors: [] })
const ordersData = ref([])
const revenueData = ref([])
const categoryStats = ref([])

const totalOrdersPeriod = computed(() => ordersData.value.reduce((s, i) => s + (i.count || 0), 0))
const totalRevenuePeriod = computed(() => revenueData.value.reduce((s, i) => s + (i.total || 0), 0))
const avgOrderValue = computed(() => totalOrdersPeriod.value === 0 ? 0 : totalRevenuePeriod.value / totalOrdersPeriod.value)

const categoryColors = ['#08717f', '#d40025', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7']
const colors = { clients: '#08717f', vendors: '#d40025', visits: '#f59e0b', approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444', orders: '#3b82f6', revenue: '#10b981' }

const formatNumber = (n) => n === null || n === undefined ? '0' : new Intl.NumberFormat('ar-TN').format(n)
const formatPrice = (p) => new Intl.NumberFormat('ar-TN').format(p || 0)
const getPeriodLabel = () => ({ day: 'اليوم', '3days': '3 أيام', week: 'أسبوع', month: 'شهر', '3months': '3 أشهر', year: 'سنة' })[currentPeriod.value] || 'أسبوع'

// ✅ FONCTION QUI ATTEND QUE LE CANVAS SOIT PRÊT
const waitForCanvas = (canvasRef, maxRetries = 10) => {
  return new Promise((resolve) => {
    let retries = 0
    const check = () => {
      if (canvasRef.value && canvasRef.value.getContext('2d')) {
        resolve(true)
      } else if (retries < maxRetries) {
        retries++
        setTimeout(check, 100)
      } else {
        resolve(false)
      }
    }
    check()
  })
}

const loadData = async () => {
  apiLoading.value = true
  try {
    const response = await aiService.getDashboardStats(currentPeriod.value)
    if (response?.success) {
      realStats.value = {
        total_users: response.stats?.total_users || 0,
        total_vendors: response.stats?.total_vendors || 0,
        total_products: response.stats?.total_products || 0,
        total_orders: response.stats?.total_orders || 0,
        total_revenue: response.stats?.total_revenue || 0,
        total_visits: response.stats?.total_visits || 0
      }
      usersEvolution.value = response.evolution?.users || { months: [], clients: [], vendors: [] }
      ordersData.value = response.evolution?.orders || []
      revenueData.value = response.evolution?.revenue || []
      visitsData.value = response.evolution?.visits || []
      postsEvolution.value = response.evolution?.posts || []
      if (response.stats?.categories?.length) {
        const total = response.stats.categories.reduce((s, c) => s + (c.count || 0), 0) || 1
        categoryStats.value = response.stats.categories.map((c, i) => ({ name: c.name, count: c.count || 0, percent: Math.round(((c.count || 0) / total) * 100), color: categoryColors[i % categoryColors.length] }))
      }
      console.log('✅ Données chargées:', { orders: ordersData.value.length, visits: visitsData.value.length, posts: postsEvolution.value.length, categories: categoryStats.value.length })

      // ✅ ATTENDRE LE RENDU DU DOM AVANT D'INITIALISER LES GRAPHIQUES
      await nextTick()

      // ✅ VÉRIFIER QUE LES CANVAS SONT PRÊTS
      const canvasesReady = await Promise.all([
        waitForCanvas(ordersRevenueChartCanvas),
        waitForCanvas(usersVendorsChartCanvas),
        waitForCanvas(visitsChartCanvas),
        waitForCanvas(postsChartCanvas),
        waitForCanvas(categoriesChartCanvas)
      ])

      if (canvasesReady.every(Boolean)) {
        destroyAllCharts()
        initOrdersRevenueChart()
        initUsersVendorsChart()
        initVisitsChart()
        initPostsChart()
        initCategoriesChart()
        console.log('✅ Graphiques initialisés')
      } else {
        console.warn('⚠️ Certains canvas ne sont pas prêts')
      }
    }
  } catch (e) {
    console.error('❌ Erreur:', e)
  } finally {
    apiLoading.value = false
  }
}

const destroyAllCharts = () => {
  [ordersRevenueChart, usersVendorsChart, visitsChart, postsChart, categoriesChart].forEach(c => { if (c) { c.destroy() } })
  ordersRevenueChart = usersVendorsChart = visitsChart = postsChart = categoriesChart = null
}

const initOrdersRevenueChart = () => {
  const canvas = ordersRevenueChartCanvas.value
  if (!canvas) { console.warn('⚠️ Canvas ordersRevenueChartCanvas non trouvé'); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (ordersRevenueChart) ordersRevenueChart.destroy()
  if (!ordersData.value.length && !revenueData.value.length) return

  const labels = ordersData.value.map(o => { try { return new Date(o.date).toLocaleDateString('ar-TN') } catch { return String(o.date) } })
  ordersRevenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Commandes', data: ordersData.value.map(o => o.count || 0), borderColor: colors.orders, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4, yAxisID: 'y' },
        { label: 'Revenus (TND)', data: revenueData.value.map(r => r.total || 0), borderColor: colors.revenue, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4, yAxisID: 'y1' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { type: 'linear', position: 'left', beginAtZero: true }, y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, beginAtZero: true } } }
  })
  console.log('✅ Graphique commandes/revenus créé')
}

const initUsersVendorsChart = () => {
  const canvas = usersVendorsChartCanvas.value
  if (!canvas) { console.warn('⚠️ Canvas usersVendorsChartCanvas non trouvé'); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (usersVendorsChart) usersVendorsChart.destroy()
  const { months = [], clients = [], vendors = [] } = usersEvolution.value
  if (!months.length) return
  usersVendorsChart = new Chart(ctx, {
    type: 'line',
    data: { labels: months, datasets: [{ label: 'Clients', data: clients, borderColor: colors.clients, borderWidth: 3, tension: 0.3, fill: false, pointRadius: 4 }, { label: 'Vendeurs', data: vendors, borderColor: colors.vendors, borderWidth: 3, tension: 0.3, fill: false, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
  console.log('✅ Graphique utilisateurs créé')
}

const initVisitsChart = () => {
  const canvas = visitsChartCanvas.value
  if (!canvas) { console.warn('⚠️ Canvas visitsChartCanvas non trouvé'); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (visitsChart) visitsChart.destroy()
  if (!visitsData.value.length) return
  const labels = visitsData.value.map(v => { try { return new Date(v.date).toLocaleDateString('ar-TN') } catch { return String(v.date) } })
  visitsChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Visites', data: visitsData.value.map(v => v.count || 0), borderColor: colors.visits, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
  console.log('✅ Graphique visites créé')
}

const initPostsChart = () => {
  const canvas = postsChartCanvas.value
  if (!canvas) { console.warn('⚠️ Canvas postsChartCanvas non trouvé'); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (postsChart) postsChart.destroy()
  if (!postsEvolution.value.length) return
  const dates = [...new Set(postsEvolution.value.map(i => i.date))].sort()
  const approved = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'approved')?.count || 0)
  const pending = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'pending')?.count || 0)
  const rejected = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'rejected')?.count || 0)
  const labels = dates.map(d => { try { return new Date(d).toLocaleDateString('ar-TN') } catch { return String(d) } })
  postsChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Approuvées', data: approved, borderColor: colors.approved, borderWidth: 2, tension: 0.3, pointRadius: 3 }, { label: 'En attente', data: pending, borderColor: colors.pending, borderWidth: 2, tension: 0.3, pointRadius: 3 }, { label: 'Rejetées', data: rejected, borderColor: colors.rejected, borderWidth: 2, tension: 0.3, pointRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
  console.log('✅ Graphique publications créé')
}

const initCategoriesChart = () => {
  const canvas = categoriesChartCanvas.value
  if (!canvas) { console.warn('⚠️ Canvas categoriesChartCanvas non trouvé'); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (categoriesChart) categoriesChart.destroy()
  if (!categoryStats.value.length) return
  const sorted = [...categoryStats.value].sort((a, b) => b.count - a.count)
  categoriesChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(c => c.name), datasets: [{ label: 'Produits', data: sorted.map(c => c.count), backgroundColor: sorted.map((_, i) => categoryColors[i % categoryColors.length]), borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  })
  console.log('✅ Graphique catégories créé')
}

const changePeriod = (p) => { currentPeriod.value = p; loadData() }

onMounted(async () => {
  console.log('📊 Statistics.vue monté')
  // ✅ Délai pour laisser le DOM se rendre complètement
  setTimeout(() => loadData(), 300)
})

onUnmounted(() => { destroyAllCharts() })
</script>

<style scoped>
.statistics-page { padding: 0; min-height: 100vh; background: #f5f7fa; }
.statistics-page.dark-mode { background: #0f172a; }
.period-filters { margin-bottom: 32px; padding: 16px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; }
.dark-mode .period-filters { background: #1f2937; border-color: #374151; }
.filter-group { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.filter-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.period-btn { padding: 8px 20px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 30px; cursor: pointer; font-size: 0.85rem; color: #1e293b; }
.dark-mode .period-btn { background: #374151; border-color: #4b5563; color: #e5e7eb; }
.period-btn:hover { background: #e2e8f0; }
.period-btn.active { background: #08717f; color: white; border-color: transparent; }
.stats-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
.overview-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #f1f5f9; }
.dark-mode .overview-card { background: #1f2937; border-color: #374151; }
.card-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
.overview-card.users .card-icon { background: #e0f2fe; color: #0284c7; }
.overview-card.vendors .card-icon { background: #ffe8ed; color: #d40025; }
.overview-card.products .card-icon { background: #e0f2f1; color: #08717f; }
.overview-card.visits .card-icon { background: #fef3c7; color: #f59e0b; }
.overview-card.orders .card-icon { background: #dbeafe; color: #3b82f6; }
.overview-card.revenue .card-icon { background: #d4edda; color: #10b981; }
.card-info { flex: 1; }
.card-value { display: block; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.dark-mode .card-value { color: #f3f4f6; }
.card-label { font-size: 0.8rem; color: #64748b; }
.dark-mode .card-label { color: #9ca3af; }
.chart-card { background: white; border-radius: 24px; padding: 20px; margin-bottom: 32px; border: 1px solid #f1f5f9; }
.dark-mode .chart-card { background: #1f2937; border-color: #374151; }
.chart-card.full-width { width: 100%; }
.chart-header { margin-bottom: 20px; }
.chart-header h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.dark-mode .chart-header h3 { color: #f3f4f6; }
.chart-container { height: 300px; position: relative; }
.loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; gap: 16px; color: white; }
.loading-spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #d40025; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1024px) { .stats-overview-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .stats-overview-grid { grid-template-columns: 1fr; } }
</style>
