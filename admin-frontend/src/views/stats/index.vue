<template>
  <div class="stats-page">
    <!-- Overview Cards -->
    <el-row :gutter="16" class="overview-row">
      <el-col :span="6" v-for="card in overviewCards" :key="card.key">
        <el-card class="overview-card" :style="{ borderTop: `3px solid ${card.color}` }">
          <div class="card-content">
            <div class="card-icon" :style="{ background: card.bg, color: card.color }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Sales Trend + Order Status -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span class="chart-title">Sales Trend</span>
              <el-radio-group v-model="trendDays" size="small" @change="loadSalesTrend">
                <el-radio-button :value="7">7 Days</el-radio-button>
                <el-radio-button :value="15">15 Days</el-radio-button>
                <el-radio-button :value="30">30 Days</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span class="chart-title">Order Status Distribution</span>
          </template>
          <div ref="orderStatusChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Product Ranking + Member Trend -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span class="chart-title">Product Sales Ranking</span>
              <el-select v-model="rankingLimit" size="small" style="width: 90px" @change="loadProductRanking">
                <el-option label="Top 5" :value="5" />
                <el-option label="Top 10" :value="10" />
                <el-option label="Top 20" :value="20" />
              </el-select>
            </div>
          </template>
          <div ref="rankingChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span class="chart-title">New Member Trend</span>
              <el-radio-group v-model="memberDays" size="small" @change="loadMemberTrend">
                <el-radio-button :value="7">7 Days</el-radio-button>
                <el-radio-button :value="15">15 Days</el-radio-button>
                <el-radio-button :value="30">30 Days</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="memberChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getOverview, getSalesTrend, getProductRanking, getOrderStatusDist, getMemberTrend } from '@/api/stats'

// ---- Overview ----
const overview = reactive({ totalOrders: 0, totalRevenue: 0, totalMembers: 0, totalProducts: 0 })

const overviewCards = computed(() => [
  { key: 'orders',   label: 'Total Orders',   value: overview.totalOrders,                          icon: 'List',          color: '#409eff', bg: '#ecf5ff' },
  { key: 'revenue',  label: 'Total Revenue',  value: `¥${overview.totalRevenue.toFixed(2)}`,         icon: 'Money',         color: '#67c23a', bg: '#f0f9eb' },
  { key: 'members',  label: 'Total Members',  value: overview.totalMembers,                          icon: 'Avatar',        color: '#e6a23c', bg: '#fdf6ec' },
  { key: 'products', label: 'Active Products',value: overview.totalProducts,                         icon: 'Goods',         color: '#f56c6c', bg: '#fef0f0' },
])

// ---- Chart refs ----
const salesChartRef = ref<HTMLElement>()
const orderStatusChartRef = ref<HTMLElement>()
const rankingChartRef = ref<HTMLElement>()
const memberChartRef = ref<HTMLElement>()

let salesChart: echarts.ECharts | null = null
let orderStatusChart: echarts.ECharts | null = null
let rankingChart: echarts.ECharts | null = null
let memberChart: echarts.ECharts | null = null

// ---- Controls ----
const trendDays = ref(7)
const rankingLimit = ref(10)
const memberDays = ref(7)

// ---- Load data ----
async function loadOverview() {
  const res = await getOverview()
  Object.assign(overview, res.data)
}

async function loadSalesTrend() {
  const res = await getSalesTrend(trendDays.value)
  const { dates, orderCounts, revenues } = res.data
  salesChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['Orders', 'Revenue (¥)'], bottom: 0 },
    grid: { left: 50, right: 60, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: [
      { type: 'value', name: 'Orders', minInterval: 1 },
      { type: 'value', name: 'Revenue', axisLabel: { formatter: '¥{value}' } },
    ],
    series: [
      {
        name: 'Orders', type: 'bar', data: orderCounts,
        itemStyle: { color: '#409eff', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: 'Revenue (¥)', type: 'line', yAxisIndex: 1, data: revenues,
        smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: '#67c23a', width: 2 },
        itemStyle: { color: '#67c23a' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.3)' }, { offset: 1, color: 'rgba(103,194,58,0)' }] } },
      },
    ],
  })
}

async function loadOrderStatusDist() {
  const res = await getOrderStatusDist()
  const data = res.data as { status: number; label: string; count: number }[]
  orderStatusChart?.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: data.map((d) => ({ name: d.label, value: d.count })),
    }],
  })
}

async function loadProductRanking() {
  const res = await getProductRanking(rankingLimit.value)
  const list = res.data as { name: string; sales: number }[]
  const names = list.map((p) => p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name).reverse()
  const sales = list.map((p) => p.sales).reverse()
  rankingChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar', data: sales,
      itemStyle: {
        color: (params: any) => {
          const colors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#909399']
          return colors[params.dataIndex % colors.length]
        },
        borderRadius: [0, 4, 4, 0],
      },
      label: { show: true, position: 'right', fontSize: 11 },
    }],
  })
}

async function loadMemberTrend() {
  const res = await getMemberTrend(memberDays.value)
  const { dates, counts } = res.data
  memberChart?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'line', data: counts, smooth: true,
      symbol: 'circle', symbolSize: 6,
      lineStyle: { color: '#e6a23c', width: 2 },
      itemStyle: { color: '#e6a23c' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(230,162,60,0.3)' }, { offset: 1, color: 'rgba(230,162,60,0)' }] } },
    }],
  })
}

// ---- Resize handler ----
function handleResize() {
  salesChart?.resize()
  orderStatusChart?.resize()
  rankingChart?.resize()
  memberChart?.resize()
}

onMounted(async () => {
  await loadOverview()
  await nextTick()

  salesChart = echarts.init(salesChartRef.value!)
  orderStatusChart = echarts.init(orderStatusChartRef.value!)
  rankingChart = echarts.init(rankingChartRef.value!)
  memberChart = echarts.init(memberChartRef.value!)

  await Promise.all([
    loadSalesTrend(),
    loadOrderStatusDist(),
    loadProductRanking(),
    loadMemberTrend(),
  ])

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  orderStatusChart?.dispose()
  rankingChart?.dispose()
  memberChart?.dispose()
})
</script>

<style scoped>
.stats-page {
  padding: 0;
}

.overview-row {
  margin-bottom: 16px;
}

.overview-card {
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.overview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.card-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.chart-row {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
