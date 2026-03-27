<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-title">{{ card.title }}</p>
              <p class="stat-value">
                <span v-if="statsLoading">--</span>
                <span v-else>{{ card.value }}</span>
              </p>
            </div>
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="28" color="#fff">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- Login Trend Chart -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>近7天登录趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container" />
        </el-card>
      </el-col>

      <!-- Quick Info -->
      <el-col :span="10">
        <el-card shadow="hover" style="height: 100%">
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前用户">
              {{ userInfo?.nickname || userInfo?.username || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户角色">
              <el-tag
                v-for="role in userInfo?.roles"
                :key="role.id"
                size="small"
                style="margin-right: 4px"
              >{{ role.name }}</el-tag>
              <span v-if="!userInfo?.roles?.length">--</span>
            </el-descriptions-item>
            <el-descriptions-item label="当前时间">{{ currentTime }}</el-descriptions-item>
            <el-descriptions-item label="用户总数">{{ stats?.totalUsers ?? '--' }}</el-descriptions-item>
            <el-descriptions-item label="角色总数">{{ stats?.totalRoles ?? '--' }}</el-descriptions-item>
            <el-descriptions-item label="菜单总数">{{ stats?.totalMenus ?? '--' }}</el-descriptions-item>
            <el-descriptions-item label="今日登录">{{ stats?.todayLogins ?? '--' }} 次</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Logs -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>最近操作日志</span>
          </template>
          <el-table :data="recentLogs" size="small" stripe v-loading="logsLoading">
            <el-table-column prop="username" label="操作用户" width="120" />
            <el-table-column prop="module" label="模块" width="100" />
            <el-table-column prop="description" label="操作描述" min-width="160" />
            <el-table-column prop="method" label="方法" width="80">
              <template #default="{ row }">
                <el-tag :type="methodTagType(row.method)" size="small">{{ row.method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态码" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status < 400 ? 'success' : 'danger'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="耗时(ms)" width="90" />
            <el-table-column prop="ip" label="IP" width="130" />
            <el-table-column prop="createdAt" label="时间" width="170">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useAuthStore } from '@/stores/auth'
import {
  getDashboardStats,
  getLoginTrend,
  getRecentLogs,
  type DashboardStats,
  type RecentLog,
} from '@/api/dashboard'

const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

// ---- Stats ----
const statsLoading = ref(true)
const stats = ref<DashboardStats | null>(null)

const statCards = computed(() => [
  { title: '用户总数', value: stats.value?.totalUsers ?? '--', icon: 'User', color: '#409eff' },
  { title: '角色总数', value: stats.value?.totalRoles ?? '--', icon: 'UserFilled', color: '#67c23a' },
  { title: '菜单总数', value: stats.value?.totalMenus ?? '--', icon: 'Menu', color: '#e6a23c' },
  { title: '今日登录', value: stats.value?.todayLogins ?? '--', icon: 'Monitor', color: '#f56c6c' },
])

async function loadStats() {
  try {
    statsLoading.value = true
    const res = await getDashboardStats()
    stats.value = res.data
  } finally {
    statsLoading.value = false
  }
}

// ---- Login Trend Chart ----
const trendChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null

async function loadTrendChart() {
  const res = await getLoginTrend()
  const trendData = res.data
  await nextTick()
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.date),
      boundaryGap: false,
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '登录次数',
        type: 'line',
        smooth: true,
        data: trendData.map((d) => d.count),
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#409eff' },
      },
    ],
  })
}

// ---- Recent Logs ----
const logsLoading = ref(true)
const recentLogs = ref<RecentLog[]>([])

async function loadRecentLogs() {
  try {
    logsLoading.value = true
    const res = await getRecentLogs(10)
    recentLogs.value = res.data
  } finally {
    logsLoading.value = false
  }
}

// ---- Current Time ----
const currentTime = ref('')
let timer: ReturnType<typeof setInterval>

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// ---- Helpers ----
function methodTagType(method: string) {
  const map: Record<string, string> = {
    GET: 'info',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'warning',
  }
  return map[method] || 'info'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

// ---- Resize ----
function handleResize() {
  trendChart?.resize()
}

onMounted(() => {
  loadStats()
  loadTrendChart()
  loadRecentLogs()
  updateTime()
  timer = setInterval(updateTime, 1000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 4px;
}

.stat-card {
  border-radius: 10px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: 260px;
  width: 100%;
}
</style>
