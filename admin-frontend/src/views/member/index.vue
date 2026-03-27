<template>
  <div class="member-page">
    <!-- Stats Cards -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total"><el-icon><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Total Members</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">Active Members</div>
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
              <div class="stat-label">Disabled Members</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon today"><el-icon><Star /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayNew }}</div>
              <div class="stat-label">New Today</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Search & Filter -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="Keyword">
          <el-input
            v-model="searchForm.keyword"
            placeholder="Search nickname / phone"
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
    </el-card>

    <!-- Table -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="Member" min-width="180">
          <template #default="{ row }">
            <div class="member-info">
              <el-avatar :size="36" :src="row.avatar" icon="User" />
              <div class="member-detail">
                <div class="member-name">{{ row.nickname || 'No Nickname' }}</div>
                <div class="member-phone">{{ row.phone || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Gender" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === 1" type="primary" size="small">Male</el-tag>
            <el-tag v-else-if="row.gender === 2" type="danger" size="small">Female</el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Balance" width="100" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ Number(row.balance).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Points" width="80" align="center">
          <template #default="{ row }">
            <span class="points">{{ row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Last Login" width="160" align="center">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never' }}
          </template>
        </el-table-column>
        <el-table-column label="Register Time" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDetailDialog(row)">
              Detail
            </el-button>
            <el-button size="small" type="warning" link @click="openPointsDialog(row)">
              Points
            </el-button>
            <el-button size="small" type="success" link @click="openBalanceDialog(row)">
              Balance
            </el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? 'Disable' : 'Enable' }}
            </el-button>
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

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Member Detail" width="500px">
      <el-descriptions :column="2" border v-if="currentMember">
        <el-descriptions-item label="Nickname">{{ currentMember.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Phone">{{ currentMember.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Gender">
          {{ currentMember.gender === 1 ? 'Male' : currentMember.gender === 2 ? 'Female' : 'Unknown' }}
        </el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="currentMember.status === 1 ? 'success' : 'danger'" size="small">
            {{ currentMember.status === 1 ? 'Enabled' : 'Disabled' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Balance">¥{{ Number(currentMember.balance).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="Points">{{ currentMember.points }}</el-descriptions-item>
        <el-descriptions-item label="OpenID" :span="2">
          <span class="openid-text">{{ currentMember.openid }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Last Login" :span="2">
          {{ currentMember.lastLoginAt ? formatDate(currentMember.lastLoginAt) : 'Never' }}
        </el-descriptions-item>
        <el-descriptions-item label="Register Time" :span="2">
          {{ formatDate(currentMember.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">Close</el-button>
      </template>
    </el-dialog>

    <!-- Adjust Points Dialog -->
    <el-dialog v-model="pointsVisible" title="Adjust Points" width="400px">
      <el-form :model="pointsForm" label-width="80px">
        <el-form-item label="Member">
          <span>{{ currentMember?.nickname || 'No Nickname' }}</span>
          <el-tag size="small" style="margin-left: 8px">Current: {{ currentMember?.points }} pts</el-tag>
        </el-form-item>
        <el-form-item label="Adjust">
          <el-input-number v-model="pointsForm.points" :min="-99999" :max="99999" />
          <span class="hint">（positive = add, negative = deduct）</span>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="pointsForm.remark" placeholder="Optional remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointsVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAdjustPoints">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- Adjust Balance Dialog -->
    <el-dialog v-model="balanceVisible" title="Adjust Balance" width="400px">
      <el-form :model="balanceForm" label-width="80px">
        <el-form-item label="Member">
          <span>{{ currentMember?.nickname || 'No Nickname' }}</span>
          <el-tag size="small" style="margin-left: 8px">Current: ¥{{ Number(currentMember?.balance || 0).toFixed(2) }}</el-tag>
        </el-form-item>
        <el-form-item label="Adjust">
          <el-input-number v-model="balanceForm.amount" :precision="2" :step="10" :min="-99999" :max="99999" />
          <span class="hint">（positive = add, negative = deduct）</span>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="balanceForm.remark" placeholder="Optional remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAdjustBalance">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMemberList, getMemberStats, toggleMemberStatus,
  adjustMemberPoints, adjustMemberBalance,
  type Member
} from '@/api/member'

// Stats
const stats = reactive({ total: 0, active: 0, disabled: 0, todayNew: 0 })

// Table
const loading = ref(false)
const tableData = ref<Member[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// Search
const searchForm = reactive({ keyword: '', status: undefined as number | undefined })

// Dialogs
const detailVisible = ref(false)
const pointsVisible = ref(false)
const balanceVisible = ref(false)
const submitting = ref(false)
const currentMember = ref<Member | null>(null)
const pointsForm = reactive({ points: 0, remark: '' })
const balanceForm = reactive({ amount: 0, remark: '' })

async function loadStats() {
  const res = await getMemberStats()
  Object.assign(stats, res.data)
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMemberList({
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

function openDetailDialog(row: Member) {
  currentMember.value = row
  detailVisible.value = true
}

function openPointsDialog(row: Member) {
  currentMember.value = row
  pointsForm.points = 0
  pointsForm.remark = ''
  pointsVisible.value = true
}

function openBalanceDialog(row: Member) {
  currentMember.value = row
  balanceForm.amount = 0
  balanceForm.remark = ''
  balanceVisible.value = true
}

async function handleToggleStatus(row: Member) {
  const action = row.status === 1 ? 'disable' : 'enable'
  await ElMessageBox.confirm(`Are you sure to ${action} this member?`, 'Confirm', { type: 'warning' })
  await toggleMemberStatus(row.id)
  ElMessage.success('Status updated')
  loadData()
  loadStats()
}

async function handleAdjustPoints() {
  if (!currentMember.value) return
  submitting.value = true
  try {
    await adjustMemberPoints(currentMember.value.id, pointsForm)
    ElMessage.success('Points adjusted successfully')
    pointsVisible.value = false
    loadData()
    loadStats()
  } finally {
    submitting.value = false
  }
}

async function handleAdjustBalance() {
  if (!currentMember.value) return
  submitting.value = true
  try {
    await adjustMemberBalance(currentMember.value.id, balanceForm)
    ElMessage.success('Balance adjusted successfully')
    balanceVisible.value = false
    loadData()
  } finally {
    submitting.value = false
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
.member-page {
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

.stat-icon.total { background: #ecf5ff; color: #409eff; }
.stat-icon.active { background: #f0f9eb; color: #67c23a; }
.stat-icon.disabled { background: #fef0f0; color: #f56c6c; }
.stat-icon.today { background: #fdf6ec; color: #e6a23c; }

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

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.member-phone {
  font-size: 12px;
  color: #909399;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.points {
  color: #e6a23c;
  font-weight: 600;
}

.text-gray {
  color: #c0c4cc;
}

.openid-text {
  font-size: 12px;
  color: #909399;
  word-break: break-all;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>
