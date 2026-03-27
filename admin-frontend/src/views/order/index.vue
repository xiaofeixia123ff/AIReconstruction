<template>
  <div class="order-page">
    <!-- Statistics Cards -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="4" v-for="item in statsCards" :key="item.key">
        <el-card class="stat-card" shadow="hover" :body-style="{ padding: '16px' }">
          <div class="stat-content">
            <div class="stat-num" :style="{ color: item.color }">{{ stats[item.key] ?? 0 }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Search Bar -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="Keyword">
          <el-input
            v-model="searchForm.keyword"
            placeholder="Order No / Name / Phone"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All" clearable style="width: 150px">
            <el-option
              v-for="(val, key) in ORDER_STATUS_MAP"
              :key="key"
              :label="val.label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="Start"
            end-placeholder="End"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">Search</el-button>
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="orderNo" label="Order No" width="180" />
        <el-table-column label="Buyer" width="140">
          <template #default="{ row }">
            <div>{{ row.nickname || '-' }}</div>
            <div class="sub-text">{{ row.phone || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Receiver" width="160">
          <template #default="{ row }">
            <div>{{ row.receiverName || '-' }}</div>
            <div class="sub-text">{{ row.receiverPhone || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="130">
          <template #default="{ row }">
            <div class="amount-text">¥{{ Number(row.payAmount).toFixed(2) }}</div>
            <div class="sub-text" v-if="row.freightAmount > 0">Freight: ¥{{ Number(row.freightAmount).toFixed(2) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="ORDER_STATUS_MAP[row.status]?.type as any" size="small">
              {{ ORDER_STATUS_MAP[row.status]?.label || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Express" width="160">
          <template #default="{ row }">
            <template v-if="row.expressNo">
              <div>{{ row.expressCompany }}</div>
              <div class="sub-text">{{ row.expressNo }}</div>
            </template>
            <span v-else class="sub-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :icon="View" @click="handleDetail(row)">Detail</el-button>
            <el-button
              v-if="row.status === OrderStatus.PENDING_SHIPMENT"
              size="small"
              type="primary"
              :icon="Promotion"
              @click="handleShip(row)"
            >Ship</el-button>
            <el-button
              v-if="[OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_SHIPMENT].includes(row.status)"
              size="small"
              type="warning"
              @click="handleCancel(row)"
            >Cancel</el-button>
            <el-button
              v-if="row.status === OrderStatus.SHIPPED"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >Complete</el-button>
            <el-button
              v-if="[OrderStatus.SHIPPED, OrderStatus.COMPLETED].includes(row.status)"
              size="small"
              type="info"
              @click="handleRefund(row)"
            >Refund</el-button>
            <el-button
              v-if="[OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(row.status)"
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(row)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="loadList"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Order Detail" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="Order No" :span="2">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="ORDER_STATUS_MAP[currentOrder.status]?.type as any">
            {{ ORDER_STATUS_MAP[currentOrder.status]?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Created At">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="Buyer">{{ currentOrder.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Buyer Phone">{{ currentOrder.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Receiver">{{ currentOrder.receiverName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Receiver Phone">{{ currentOrder.receiverPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Address" :span="2">{{ currentOrder.receiverAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Total Amount">¥{{ Number(currentOrder.totalAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="Pay Amount">¥{{ Number(currentOrder.payAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="Freight">¥{{ Number(currentOrder.freightAmount).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="Pay Time">{{ formatDate(currentOrder.payTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Express Company">{{ currentOrder.expressCompany || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Express No">{{ currentOrder.expressNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Ship Time">{{ formatDate(currentOrder.shipTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Complete Time">{{ formatDate(currentOrder.completeTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Remark" :span="2">{{ currentOrder.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- Items Snapshot -->
      <div v-if="currentOrder?.itemsSnapshot" style="margin-top: 16px">
        <div class="items-title">Order Items</div>
        <el-table :data="parsedItems" border size="small">
          <el-table-column prop="name" label="Product" />
          <el-table-column prop="price" label="Price" width="100">
            <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="Qty" width="80" align="center" />
          <el-table-column label="Subtotal" width="100">
            <template #default="{ row }">¥{{ (Number(row.price) * Number(row.quantity)).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">Close</el-button>
      </template>
    </el-dialog>

    <!-- Ship Dialog -->
    <el-dialog v-model="shipVisible" title="Ship Order" width="440px" destroy-on-close>
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="130px">
        <el-form-item label="Express Company" prop="expressCompany">
          <el-select v-model="shipForm.expressCompany" placeholder="Select" style="width: 100%">
            <el-option v-for="c in expressList" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="Tracking Number" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="Enter tracking number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="submitShip">Confirm Ship</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Delete, Promotion } from '@element-plus/icons-vue'
import {
  getOrderList, getOrderStats, shipOrder, cancelOrder, completeOrder, refundOrder, deleteOrder,
  ORDER_STATUS_MAP, OrderStatus,
  type Order,
} from '@/api/order'

// ---- Stats ----
const stats = ref<Record<string, number>>({})
const statsCards = [
  { key: 'total', label: 'Total', color: '#303133' },
  { key: 'pendingPayment', label: 'Pending Payment', color: '#e6a23c' },
  { key: 'pendingShipment', label: 'Pending Shipment', color: '#409eff' },
  { key: 'shipped', label: 'Shipped', color: '#67c23a' },
  { key: 'completed', label: 'Completed', color: '#909399' },
  { key: 'refunded', label: 'Refunded', color: '#f56c6c' },
]

async function loadStats() {
  const res = await getOrderStats()
  stats.value = (res as any).data || res
}

// ---- Search ----
const searchForm = reactive({ keyword: '', status: '' as number | string })
const dateRange = ref<[string, string] | null>(null)

function handleSearch() {
  pagination.page = 1
  loadList()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  dateRange.value = null
  pagination.page = 1
  loadList()
}

// ---- Table ----
const loading = ref(false)
const tableData = ref<Order[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function loadList() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getOrderList(params)
    const data = (res as any).data || res
    tableData.value = data.list || []
    pagination.total = data.total || 0
  } finally {
    loading.value = false
  }
}

function formatDate(val: string | Date | null) {
  if (!val) return ''
  return new Date(val).toLocaleString('zh-CN', { hour12: false })
}

// ---- Detail ----
const detailVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const parsedItems = computed(() => {
  try {
    return JSON.parse(currentOrder.value?.itemsSnapshot || '[]')
  } catch {
    return []
  }
})

function handleDetail(row: Order) {
  currentOrder.value = row
  detailVisible.value = true
}

// ---- Ship ----
const shipVisible = ref(false)
const submitting = ref(false)
const shipFormRef = ref()
const shipForm = reactive({ expressCompany: '', expressNo: '' })
const shipRules = {
  expressCompany: [{ required: true, message: 'Please select express company', trigger: 'change' }],
  expressNo: [{ required: true, message: 'Please enter tracking number', trigger: 'blur' }],
}
const expressList = [
  'SF Express', 'ZTO Express', 'YTO Express', 'STO Express',
  'Yunda Express', 'JD Logistics', 'EMS', 'DHL', 'FedEx',
]
let shipOrderId = 0

function handleShip(row: Order) {
  shipOrderId = row.id
  shipForm.expressCompany = ''
  shipForm.expressNo = ''
  shipVisible.value = true
}

async function submitShip() {
  await shipFormRef.value.validate()
  submitting.value = true
  try {
    await shipOrder(shipOrderId, { expressCompany: shipForm.expressCompany, expressNo: shipForm.expressNo })
    ElMessage.success('Shipped successfully')
    shipVisible.value = false
    loadList()
    loadStats()
  } finally {
    submitting.value = false
  }
}

// ---- Cancel ----
async function handleCancel(row: Order) {
  await ElMessageBox.confirm(`Cancel order ${row.orderNo}?`, 'Confirm', { type: 'warning' })
  await cancelOrder(row.id)
  ElMessage.success('Order cancelled')
  loadList()
  loadStats()
}

// ---- Complete ----
async function handleComplete(row: Order) {
  await ElMessageBox.confirm(`Mark order ${row.orderNo} as completed?`, 'Confirm', { type: 'warning' })
  await completeOrder(row.id)
  ElMessage.success('Order completed')
  loadList()
  loadStats()
}

// ---- Refund ----
async function handleRefund(row: Order) {
  await ElMessageBox.confirm(`Refund order ${row.orderNo}?`, 'Confirm', { type: 'warning' })
  await refundOrder(row.id)
  ElMessage.success('Order refunded')
  loadList()
  loadStats()
}

// ---- Delete ----
async function handleDelete(row: Order) {
  await ElMessageBox.confirm(`Delete order ${row.orderNo}? This cannot be undone.`, 'Warning', { type: 'error' })
  await deleteOrder(row.id)
  ElMessage.success('Deleted')
  loadList()
  loadStats()
}

onMounted(() => {
  loadList()
  loadStats()
})
</script>

<style scoped>
.order-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  cursor: default;
}

.stat-content {
  text-align: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.search-card {
  margin-bottom: 0;
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.items-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
</style>
