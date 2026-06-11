<!-- frontend/src/views/admin/Statistics.vue - VERSION FINALE 100% CORRIGÉE -->
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

    <!-- ===== SECTION PRÉDICTIONS IA ===== -->
    <div class="predictions-section">
      <h2 class="section-main-title">🤖 Prévisions basées sur l'analyse des ventes historiques</h2>
      <div class="chart-card full-width">
        <div class="chart-header"><h3>🏆 Top produits les plus vendus et prévisions</h3></div>
        <div class="top-products-grid">
          <div v-for="(product, index) in topProducts" :key="product.id || index" class="top-product-card" :style="{ borderRightColor: categoryColors[index % categoryColors.length] }">
            <div class="product-rank" :style="{ background: categoryColors[index % categoryColors.length] }">#{{ index + 1 }}</div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <span class="product-category">{{ product.category }}</span>
              <div class="product-stats">
                <div class="product-stat"><span class="stat-trend" :class="product.trend > 0 ? 'positive' : 'negative'">{{ product.trend > 0 ? '+' : '' }}{{ product.trend }}%</span><span class="stat-label">Tendance</span></div>
                <div class="product-stat"><span class="stat-value">{{ formatPrice(product.revenue) }}</span><span class="stat-label">Revenus</span></div>
                <div class="product-stat"><span class="stat-value">{{ product.sold }}</span><span class="stat-label">Vendus</span></div>
              </div>
              <div class="product-prediction"><span class="prediction-icon">📈</span><span class="prediction-text">Prév. semaine prochaine: <strong>{{ product.predictedNextWeek }}</strong> ventes</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card full-width">
        <div class="chart-header"><h3>📅 Prévisions des périodes où les achats augmentent</h3></div>
        <div class="peaks-container">
          <div class="peaks-section">
            <h4 class="peaks-title">📊 Pics historiques</h4>
            <div class="peaks-grid">
              <div v-for="peak in historicalPeaks" :key="peak.name" class="peak-card">
                <div class="peak-icon">{{ peak.icon }}</div><div class="peak-name">{{ peak.name }}</div>
                <div class="peak-trend positive">+{{ peak.trend }}%</div><div class="peak-orders">{{ peak.orders }} commandes</div>
                <div class="peak-confidence" :class="peak.confidenceLevel">{{ peak.confidenceLabel }} {{ peak.confidence }}%</div>
              </div>
            </div>
            <div class="average-info"><span class="average-label">📈 Moyenne mensuelle:</span><span class="average-value">{{ averageMonthlyOrders }} commandes</span></div>
          </div>
          <div class="peaks-section">
            <h4 class="peaks-title">🔮 Périodes de pic d'achat prévues</h4>
            <div class="upcoming-periods">
              <div v-for="period in upcomingPeaks" :key="period.month" class="upcoming-period-card">
                <div class="period-month">{{ period.month }}</div><div class="period-trend positive">+{{ period.trend }}%</div>
                <div class="period-expected">{{ period.expectedOrders }} ventes prévues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="apiLoading" class="loading-overlay"><div class="loading-spinner"></div><p>جاري تحميل البيانات...</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { aiService } from '../../services/api'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

const apiLoading = ref(false)
const currentPeriod = ref('week')

const visitsChartCanvas = ref(null)
const postsChartCanvas = ref(null)
const usersVendorsChartCanvas = ref(null)
const categoriesChartCanvas = ref(null)
const ordersRevenueChartCanvas = ref(null)

let visitsChart = null, postsChart = null, usersVendorsChart = null, categoriesChart = null, ordersRevenueChart = null

const realStats = ref({ total_users: 0, total_vendors: 0, total_products: 0, total_orders: 0, total_revenue: 0, total_visits: 0 })
const visitsData = ref([])
const postsEvolution = ref([])
const usersEvolution = ref({ months: [], clients: [], vendors: [] })
const ordersData = ref([])
const revenueData = ref([])
const categoryStats = ref([])

const topProducts = ref([])
const historicalPeaks = ref([])
const upcomingPeaks = ref([])
const averageMonthlyOrders = ref(0)

const categoryColors = ['#08717f', '#d40025', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7']
const colors = { clients: '#08717f', vendors: '#d40025', visits: '#f59e0b', approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444', orders: '#3b82f6', revenue: '#10b981' }

// ✅ CORRECTION: Formatage de date robuste
const formatChartDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    // Si c'est une date ISO "2026-05-11"
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2])
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          const date = new Date(y, m - 1, d)
          return date.toLocaleDateString('ar-TN', { month: 'short', day: 'numeric' })
        }
      }
    }
    // Si c'est déjà formaté, retourner tel quel
    return String(dateStr)
  } catch (e) { return String(dateStr) }
}

const formatNumber = (n) => n === null || n === undefined ? '0' : new Intl.NumberFormat('ar-TN').format(n)
const formatPrice = (p) => {
  const value = p || 0
  return new Intl.NumberFormat('ar-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value) + ' TND'
}
const getPeriodLabel = () => {
  const labels = { day: 'اليوم', '3days': '3 أيام', week: 'أسبوع', month: 'شهر', '3months': '3 أشهر', year: 'سنة' }
  return labels[currentPeriod.value] || 'أسبوع'
}

const waitForCanvas = (canvasRef, maxRetries = 15) => {
  return new Promise((resolve) => {
    let retries = 0
    const check = () => {
      if (canvasRef.value && canvasRef.value.getContext('2d')) { resolve(true) }
      else if (retries < maxRetries) { retries++; setTimeout(check, 150) }
      else { resolve(false) }
    }
    check()
  })
}

const loadPredictions = async () => {
  try {
    const productsResponse = await fetch('http://localhost:5001/predictions/top-products')
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      if (productsData.success && productsData.data.length > 0) {
        topProducts.value = productsData.data
      }
    }
    const peaksResponse = await fetch('http://localhost:5001/predictions/peaks')
    if (peaksResponse.ok) {
      const peaksData = await peaksResponse.json()
      if (peaksData.success) {
        historicalPeaks.value = peaksData.data.historicalPeaks || []
        upcomingPeaks.value = peaksData.data.upcomingPeaks || []
        averageMonthlyOrders.value = peaksData.data.averageMonthlyOrders || 0
      }
    }
  } catch (error) { console.log('⚠️ Prédictions par défaut') }
}

const loadData = async () => {
  apiLoading.value = true
  let data
  try {
    const response = await aiService.getDashboardStats(currentPeriod.value)
    if (response?.success) { data = response }
    else { data = getEmptyData() }
  } catch (e) { data = getEmptyData() }

  realStats.value = {
    total_users: data.stats?.total_users || 0, total_vendors: data.stats?.total_vendors || 0,
    total_products: data.stats?.total_products || 0, total_orders: data.stats?.total_orders || 0,
    total_revenue: data.stats?.total_revenue || 0, total_visits: data.stats?.total_visits || 0
  }
  usersEvolution.value = data.evolution?.users || { months: [], clients: [], vendors: [] }
  ordersData.value = data.evolution?.orders || []
  revenueData.value = data.evolution?.revenue || []
  visitsData.value = data.evolution?.visits || []
  postsEvolution.value = data.evolution?.posts || []
  if (data.stats?.categories?.length) {
    const total = data.stats.categories.reduce((s, c) => s + (c.count || 0), 0) || 1
    categoryStats.value = data.stats.categories.map((c, i) => ({ name: c.name, count: c.count || 0, percent: Math.round(((c.count || 0) / total) * 100), color: categoryColors[i % categoryColors.length] }))
  }

  await loadPredictions()
  await nextTick()
  await new Promise(r => setTimeout(r, 200))

  const canvasesReady = await Promise.all([
    waitForCanvas(ordersRevenueChartCanvas), waitForCanvas(usersVendorsChartCanvas),
    waitForCanvas(visitsChartCanvas), waitForCanvas(postsChartCanvas), waitForCanvas(categoriesChartCanvas)
  ])

  if (canvasesReady.every(Boolean)) {
    destroyAllCharts()
    initOrdersRevenueChart()
    initUsersVendorsChart()
    initVisitsChart()
    initPostsChart()
    initCategoriesChart()
  }
  apiLoading.value = false
}

const getEmptyData = () => ({
  stats: { total_users: 0, total_vendors: 0, total_products: 0, total_orders: 0, total_revenue: 0, total_visits: 0, categories: [] },
  evolution: { users: { months: [], clients: [], vendors: [] }, orders: [], revenue: [], visits: [], posts: [] }
})

const destroyAllCharts = () => {
  [ordersRevenueChart, usersVendorsChart, visitsChart, postsChart, categoriesChart].forEach(c => { if (c) c.destroy() })
  ordersRevenueChart = usersVendorsChart = visitsChart = postsChart = categoriesChart = null
}

// ✅ CORRECTION: Toutes les fonctions init*Chart utilisent formatChartDate
const initOrdersRevenueChart = () => {
  const canvas = ordersRevenueChartCanvas.value
  if (!canvas || !ordersData.value.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (ordersRevenueChart) ordersRevenueChart.destroy()
  ordersRevenueChart = new Chart(ctx, {
    type: 'line', data: {
      labels: ordersData.value.map(o => formatChartDate(o.date)),
      datasets: [
        { label: 'Commandes', data: ordersData.value.map(o => o.count || 0), borderColor: colors.orders, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4, yAxisID: 'y' },
        { label: 'Revenus (TND)', data: revenueData.value.map(r => r.total || 0), borderColor: colors.revenue, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4, yAxisID: 'y1' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { type: 'linear', position: 'left', beginAtZero: true }, y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, beginAtZero: true } } }
  })
}

const initUsersVendorsChart = () => {
  const canvas = usersVendorsChartCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (usersVendorsChart) usersVendorsChart.destroy()
  const { months = [], clients = [], vendors = [] } = usersEvolution.value
  if (!months.length) return
  usersVendorsChart = new Chart(ctx, {
    type: 'line', data: { labels: months.map(d => formatChartDate(d)), datasets: [
      { label: 'Clients', data: clients, borderColor: colors.clients, borderWidth: 3, tension: 0.3, fill: false, pointRadius: 4 },
      { label: 'Vendeurs', data: vendors, borderColor: colors.vendors, borderWidth: 3, tension: 0.3, fill: false, pointRadius: 4 }
    ]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
}

const initVisitsChart = () => {
  const canvas = visitsChartCanvas.value
  if (!canvas || !visitsData.value.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (visitsChart) visitsChart.destroy()
  visitsChart = new Chart(ctx, {
    type: 'line', data: { labels: visitsData.value.map(v => formatChartDate(v.date)), datasets: [{ label: 'Visites', data: visitsData.value.map(v => v.count || 0), borderColor: colors.visits, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 3, fill: true, tension: 0.3, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
}

const initPostsChart = () => {
  const canvas = postsChartCanvas.value
  if (!canvas || !postsEvolution.value.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (postsChart) postsChart.destroy()
  const dates = [...new Set(postsEvolution.value.map(i => i.date))].sort()
  const approved = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'approved')?.count || 0)
  const pending = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'pending')?.count || 0)
  const rejected = dates.map(d => postsEvolution.value.find(p => p.date === d && p.status === 'rejected')?.count || 0)
  postsChart = new Chart(ctx, {
    type: 'line', data: { labels: dates.map(d => formatChartDate(d)), datasets: [
      { label: 'Approuvées', data: approved, borderColor: colors.approved, borderWidth: 2, tension: 0.3, pointRadius: 3 },
      { label: 'En attente', data: pending, borderColor: colors.pending, borderWidth: 2, tension: 0.3, pointRadius: 3 },
      { label: 'Rejetées', data: rejected, borderColor: colors.rejected, borderWidth: 2, tension: 0.3, pointRadius: 3 }
    ]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  })
}

const initCategoriesChart = () => {
  const canvas = categoriesChartCanvas.value
  if (!canvas || !categoryStats.value.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (categoriesChart) categoriesChart.destroy()
  const sorted = [...categoryStats.value].sort((a, b) => b.count - a.count)
  categoriesChart = new Chart(ctx, {
    type: 'bar', data: { labels: sorted.map(c => c.name), datasets: [{ label: 'Produits', data: sorted.map(c => c.count), backgroundColor: sorted.map((_, i) => categoryColors[i % categoryColors.length]), borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  })
}

const changePeriod = (p) => { currentPeriod.value = p; loadData() }

onMounted(() => { setTimeout(() => loadData(), 500) })
onUnmounted(() => { destroyAllCharts() })
</script>

<style scoped>
.statistics-page { padding: 0; min-height: 100vh; background: #f5f7fa; }
.statistics-page.dark-mode { background: #161627; }
.period-filters { margin-bottom: 32px; padding: 16px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; }
.dark-mode .period-filters { background: #1e1e30; border-color: #2a2a40; }
.filter-group { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.filter-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.period-btn { padding: 8px 20px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 30px; cursor: pointer; font-size: 0.85rem; color: #1e293b; }
.dark-mode .period-btn { background: #2a2a40; border-color: #2a2a40; color: #94a3b8; }
.period-btn:hover { background: #e2e8f0; }
.period-btn.active { background: #08717f; color: white; border-color: transparent; }
.stats-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
.overview-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #f1f5f9; }
.dark-mode .overview-card { background: #1e1e30; border-color: #2a2a40; }
.card-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
.overview-card.users .card-icon { background: #e0f2fe; color: #0284c7; }
.overview-card.vendors .card-icon { background: #ffe8ed; color: #d40025; }
.overview-card.products .card-icon { background: #e0f2f1; color: #08717f; }
.overview-card.visits .card-icon { background: #fef3c7; color: #f59e0b; }
.overview-card.orders .card-icon { background: #dbeafe; color: #3b82f6; }
.overview-card.revenue .card-icon { background: #d4edda; color: #10b981; }
.card-info { flex: 1; }
.card-value { display: block; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.dark-mode .card-value { color: #f1f5f9; }
.card-label { font-size: 0.8rem; color: #64748b; }
.dark-mode .card-label { color: #94a3b8; }
.chart-card { background: white; border-radius: 24px; padding: 20px; margin-bottom: 32px; border: 1px solid #f1f5f9; }
.dark-mode .chart-card { background: #1e1e30; border-color: #2a2a40; }
.chart-card.full-width { width: 100%; }
.chart-header { margin-bottom: 20px; }
.chart-header h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.dark-mode .chart-header h3 { color: #f1f5f9; }
.chart-container { height: 300px; position: relative; }
.predictions-section { margin-top: 40px; }
.section-main-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 24px; text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(8, 113, 127, 0.1), rgba(211, 0, 37, 0.1)); border-radius: 16px; }
.dark-mode .section-main-title { color: #f1f5f9; background: linear-gradient(135deg, rgba(45, 212, 191, 0.1), rgba(239, 68, 68, 0.1)); }
.top-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; padding: 10px 0; }
.top-product-card { display: flex; gap: 16px; padding: 20px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; border-right: 5px solid #08717f; transition: all 0.3s ease; }
.dark-mode .top-product-card { background: #1e1e30; border-color: #2a2a40; }
.top-product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
.product-rank { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; color: white; flex-shrink: 0; }
.product-info { flex: 1; }
.product-name { font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
.dark-mode .product-name { color: #f1f5f9; }
.product-category { display: inline-block; font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 3px 10px; border-radius: 20px; margin-bottom: 12px; }
.dark-mode .product-category { background: #2a2a40; color: #94a3b8; }
.product-stats { display: flex; gap: 20px; margin-bottom: 12px; }
.product-stat { display: flex; flex-direction: column; gap: 2px; }
.stat-trend { font-size: 1rem; font-weight: 700; }
.stat-trend.positive { color: #10b981; }
.stat-trend.negative { color: #ef4444; }
.stat-label { font-size: 0.7rem; color: #64748b; }
.dark-mode .stat-label { color: #94a3b8; }
.product-prediction { display: flex; align-items: center; gap: 8px; padding: 10px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0; }
.dark-mode .product-prediction { background: #0a1f1a; border-color: #14532d; }
.prediction-icon { font-size: 1.1rem; }
.prediction-text { font-size: 0.85rem; color: #15803d; }
.dark-mode .prediction-text { color: #34d399; }
.peaks-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 10px 0; }
.peaks-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
.dark-mode .peaks-title { color: #f1f5f9; }
.peaks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
.peak-card { background: #ffffff; border-radius: 14px; padding: 16px; text-align: center; border: 1px solid #e2e8f0; transition: all 0.2s ease; }
.dark-mode .peak-card { background: #1e1e30; border-color: #2a2a40; }
.peak-card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
.peak-icon { font-size: 2rem; margin-bottom: 8px; }
.peak-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
.dark-mode .peak-name { color: #f1f5f9; }
.peak-trend { font-size: 1rem; font-weight: 700; color: #10b981; margin-bottom: 4px; }
.peak-orders { font-size: 0.85rem; color: #64748b; margin-bottom: 8px; }
.dark-mode .peak-orders { color: #94a3b8; }
.peak-confidence { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.confidence-high { background: #d1fae5; color: #065f46; }
.confidence-medium { background: #fef3c7; color: #92400e; }
.average-info { text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px; margin-top: 12px; }
.dark-mode .average-info { background: #121220; }
.average-label { font-size: 0.9rem; color: #64748b; }
.average-value { font-size: 1.1rem; font-weight: 700; color: #08717f; margin-right: 8px; }
.upcoming-periods { display: flex; flex-direction: column; gap: 12px; }
.upcoming-period-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; transition: all 0.2s ease; }
.dark-mode .upcoming-period-card { background: #1e1e30; border-color: #2a2a40; }
.upcoming-period-card:hover { transform: translateX(-4px); border-color: #08717f; }
.period-month { font-size: 1.1rem; font-weight: 700; color: #1e293b; min-width: 60px; }
.dark-mode .period-month { color: #f1f5f9; }
.period-trend { font-size: 1rem; font-weight: 700; color: #10b981; }
.period-expected { font-size: 0.85rem; color: #64748b; }
.dark-mode .period-expected { color: #94a3b8; }
.loading-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; gap: 16px; color: white; }
.loading-spinner { width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #2dd4bf; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1024px) { .stats-overview-grid { grid-template-columns: repeat(2, 1fr); } .top-products-grid { grid-template-columns: 1fr; } .peaks-container { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .stats-overview-grid { grid-template-columns: 1fr; } .peaks-grid { grid-template-columns: 1fr; } }
</style>
