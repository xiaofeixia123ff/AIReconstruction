<template>
  <div class="coupon-page">
    <!-- Stats Cards -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total"><el-icon><Ticket /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Total Coupons</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.enabled }}</div>
              <div class="stat-label">Enabled</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon disabled"><el-icon><CircleClose /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.disabled }}</div>
              <div class="stat-label">Disabled</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon used"><el-icon><DocumentChecked /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsed }}</div>
              <div class="stat-label">Total Used</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Search & Actions -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="Keyword">
            <el-input
              v-model="searchForm.keyword"
              placeholder="Search coupon name"
              clearable
              style="width: 220px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="Status">
            <el-select v-model="searchForm.status" placeholder="All" clearable style="width: 120px">
              <el-option label="Enabled" :value="1" />
              <el-option label="Disabled" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> Search
            </el-button>
            <el-button @click="handleReset">Reset</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon> New Coupon
        </el-button>
      </div>
    </el-card>

    <!-- Table -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="Coupon Name" min-width="160">
          <template #default="{ row }">
            <div class="coupon-name">{{ row.name }}</div>
            <div class="coupon-desc" v-if="row.description">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'danger' : 'warning'" size="small">
              {{ row.type === 1 ? 'Fixed Amount' : 'Percentage' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Discount" width="110" align="center">
          <template #default="{ row }">
            <span class="discount-value">
              {{ row.type === 1 ? `¥${Number(row.value).toFixed(2)}` : `${row.value}% OFF` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Min Order" width="100" align="center">
          <template #default="{ row }">
            {{ Number(row.minAmount) > 0 ? `¥${Number(row.minAmount).toFixed(2)}` : 'No limit' }}
          </template>
        </el-table-column>
        <el-table-column label="Qty (Used/Total)" width="130" align="center">
          <template #default="{ row }">
            <span>{{ row.usedQty }} / {{ row.totalQty === 0 ? '∞' : row.totalQty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Valid Period" min-width="200" align="center">
          <template #default="{ row }">
            <span v-if="row.startTime && row.endTime">
              {{ formatDate(row.startTime) }} ~ {{ formatDate(row.endTime) }}
            </span>
            <span v-else class="text-gray">No limit</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditDialog(row)">Edit</el-button>
            <el-button size="small" type="info" link @click="openRecordsDialog(row)">Records</el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? 'Disable' : 'Enable' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">Delete</el-button>
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
          layout="total, sizes, prev, pager, next"
          @change="loadData"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? 'Edit Coupon' : 'New Coupon'"
      width="560px"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="110px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="formData.name" placeholder="Coupon name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="1">Fixed Amount (¥)</el-radio>
            <el-radio :value="2">Percentage (%)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Discount Value" prop="value">
          <el-input-number
            v-model="formData.value"
            :min="0"
            :max="formData.type === 1 ? 99999 : 99"
            :precision="formData.type === 1 ? 2 : 0"
            :step="formData.type === 1 ? 10 : 5"
          />
          <span class="unit-hint">{{ formData.type === 1 ? '元' : '%' }}</span>
        </el-form-item>
        <el-form-item label="Min Order Amount">
          <el-input-number v-model="formData.minAmount" :min="0" :precision="2" :step="10" />
          <span class="unit-hint">元（0 = no limit）</span>
        </el-form-item>
        <el-form-item label="Total Quantity">
          <el-input-number v-model="formData.totalQty" :min="0" :step="100" />
          <span class="unit-hint">（0 = unlimited）</span>
        </el-form-item>
        <el-form-item label="Per User Limit">
          <el-input-number v-model="formData.perUserLimit" :min="0" :step="1" />
          <span class="unit-hint">（0 = unlimited）</span>
        </el-form-item>
        <el-form-item label="Valid Period">
          <el-date-picker
            v-model="formData.dateRange"
            type="datetimerange"
            range-separator="~"
            start-placeholder="Start time"
            end-placeholder="End time"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="Optional description"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? 'Save' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Records Dialog -->
    <el-dialog v-model="recordsVisible" :title="`Coupon Records — ${currentCoupon?.name}`" width="700px">
      <el-table :data="recordsData" v-loading="recordsLoading" stripe size="small">
        <el-table-column label="Member" prop="memberNickname" width="120">
          <template #default="{ row }">{{ row.memberNickname || `Member#${row.memberId}` }}</template>
        </el-table-column>
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'warning'"
              size="small"
            >
              {{ row.status === 0 ? 'Unused' : row.status === 1 ? 'Used' : 'Expired' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Received At" width="160" align="center">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Used At" width="160" align="center">
          <template #default="{ row }">{{ row.usedAt ? formatDate(row.usedAt) : '-' }}</template>
        </el-table-column>
        <el-table-column label="Order ID" width="100" align="center">
          <template #default="{ row }">{{ row.orderId || '-' }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="recordsPagination.page"
          v-model:page-size="recordsPagination.pageSize"
          :total="recordsPagination.total"
          layout="total, prev, pager, next"
          @change="loadRecords"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  getCouponList, getCouponStats, createCoupon, updateCoupon,
  toggleCouponStatus, deleteCoupon, getCouponRecords,
  type Coupon, type CouponRecord,
} from '@/api/coupon'

// Stats
const stats = reactive({ total: 0, enabled: 0, disabled: 0, totalUsed: 0 })

// Table
const loading = ref(false)
const tableData = ref<Coupon[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// Search
const searchForm = reactive({ keyword: '', status: undefined as number | undefined })

// Form dialog
const formVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const currentCoupon = ref<Coupon | null>(null)

const formData = reactive({
  name: '',
  type: 1,
  value: 0,
  minAmount: 0,
  totalQty: 0,
  perUserLimit: 1,
  dateRange: null as [string, string] | null,
  description: '',
})

const formRules = {
  name: [{ required: true, message: 'Please enter coupon name', trigger: 'blur' }],
  type: [{ required: true, message: 'Please select coupon type', trigger: 'change' }],
  value: [{ required: true, message: 'Please enter discount value', trigger: 'blur' }],
}

// Records dialog
const recordsVisible = ref(false)
const recordsLoading = ref(false)
const recordsData = ref<CouponRecord[]>([])
const recordsPagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function loadStats() {
  const res = await getCouponStats()
  Object.assign(stats, res.data)
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCouponList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = undefined
  pagination.page = 1
  loadData()
}

function openCreateDialog() {
  isEdit.value = false
  currentCoupon.value = null
  resetForm()
  formVisible.value = true
}

function openEditDialog(row: Coupon) {
  isEdit.value = true
  currentCoupon.value = row
  formData.name = row.name
  formData.type = row.type
  formData.value = Number(row.value)
  formData.minAmount = Number(row.minAmount)
  formData.totalQty = row.totalQty
  formData.perUserLimit = row.perUserLimit
  formData.description = row.description || ''
  formData.dateRange = row.startTime && row.endTime ? [row.startTime as string, row.endTime as string] : null
  formVisible.value = true
}

function resetForm() {
  formData.name = ''
  formData.type = 1
  formData.value = 0
  formData.minAmount = 0
  formData.totalQty = 0
  formData.perUserLimit = 1
  formData.dateRange = null
  formData.description = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload: any = {
      name: formData.name,
      type: formData.type,
      value: formData.value,
      minAmount: formData.minAmount,
      totalQty: formData.totalQty,
      perUserLimit: formData.perUserLimit,
      description: formData.description || undefined,
      startTime: formData.dateRange?.[0] || undefined,
      endTime: formData.dateRange?.[1] || undefined,
    }
    if (isEdit.value && currentCoupon.value) {
      await updateCoupon(currentCoupon.value.id, payload)
      ElMessage.success('Coupon updated successfully')
    } else {
      await createCoupon(payload)
      ElMessage.success('Coupon created successfully')
    }
    formVisible.value = false
    loadData()
    loadStats()
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(row: Coupon) {
  const action = row.status === 1 ? 'disable' : 'enable'
  await ElMessageBox.confirm(`Are you sure to ${action} this coupon?`, 'Confirm', { type: 'warning' })
  await toggleCouponStatus(row.id)
  ElMessage.success('Status updated')
  loadData()
  loadStats()
}

async function handleDelete(row: Coupon) {
  await ElMessageBox.confirm(`Delete coupon "${row.name}"? This cannot be undone.`, 'Confirm Delete', { type: 'warning' })
  await deleteCoupon(row.id)
  ElMessage.success('Deleted successfully')
  loadData()
  loadStats()
}

async function openRecordsDialog(row: Coupon) {
  currentCoupon.value = row
  recordsPagination.page = 1
  recordsVisible.value = true
  await loadRecords()
}

async function loadRecords() {
  if (!currentCoupon.value) return
  recordsLoading.value = true
  try {
    const res = await getCouponRecords(currentCoupon.value.id, {
      page: recordsPagination.page,
      pageSize: recordsPagination.pageSize,
    })
    recordsData.value = res.data.list
    recordsPagination.total = res.data.total
  } finally {
    recordsLoading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

onMounted(() => {
  loadStats()
  loadData()
})
</script>

<style scoped>
.coupon-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.total    { background: #ecf5ff; color: #409eff; }
.stat-icon.active   { background: #f0f9eb; color: #67c23a; }
.stat-icon.disabled { background: #fef0f0; color: #f56c6c; }
.stat-icon.used     { background: #fdf6ec; color: #e6a23c; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.search-card {
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.coupon-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.coupon-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.discount-value {
  font-size: 15px;
  font-weight: 700;
  color: #f56c6c;
}

.text-gray {
  color: #c0c4cc;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.unit-hint {
  margin-left: 8px;
  font-size: 13px;
  color: #909399;
}
</style>
