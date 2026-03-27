<template>
  <div class="user-page">
    <!-- Search bar -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Keyword">
          <el-input
            v-model="searchForm.keyword"
            placeholder="Search username"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">Search</el-button>
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table card -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>User List</span>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">Add User</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe row-key="id">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="username" label="Username" min-width="120" />
        <el-table-column prop="nickname" label="Nickname" min-width="120">
          <template #default="{ row }">{{ row.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column prop="email" label="Email" min-width="160">
          <template #default="{ row }">{{ row.email || '-' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="Phone" min-width="130">
          <template #default="{ row }">{{ row.phone || '-' }}</template>
        </el-table-column>
        <el-table-column label="Roles" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              style="margin-right: 4px"
            >{{ role.name }}</el-tag>
            <span v-if="!row.roles?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
          @change="(val: boolean) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="Last Login" min-width="170">
          <template #default="{ row }">{{ formatDate(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" min-width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">Edit</el-button>
            <el-button type="warning" link :icon="Key" @click="openResetPwdDialog(row)">Reset Pwd</el-button>
            <el-popconfirm
              title="Are you sure to delete this user?"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete">Delete</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="fetchList"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit User' : 'Add User'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="Enter username" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Password" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="Enter password" />
        </el-form-item>
        <el-form-item label="Nickname" prop="nickname">
          <el-input v-model="form.nickname" placeholder="Enter nickname" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" placeholder="Enter phone" />
        </el-form-item>
        <el-form-item label="Roles" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="Select roles" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="Status" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">Enabled</el-radio>
            <el-radio :value="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="resetPwdVisible" title="Reset Password" width="420px" destroy-on-close>
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="110px">
        <el-form-item label="Username">
          <span>{{ resetForm.username }}</span>
        </el-form-item>
        <el-form-item label="New Password" prop="password">
          <el-input v-model="resetForm.password" type="password" show-password placeholder="At least 6 characters" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleResetPwd">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import {
  getUserList, createUser, updateUser, deleteUser, resetUserPassword,
  type User,
} from '@/api/user'
import { getRoleList, type Role } from '@/api/role'

// ---- State ----
const loading = ref(false)
const tableData = ref<User[]>([])
const roleOptions = ref<Role[]>([])

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1,
  roleIds: [] as number[],
})

// Reset password dialog
const resetPwdVisible = ref(false)
const resetFormRef = ref<FormInstance>()
const resetForm = reactive({ id: 0, username: '', password: '' })

// ---- Rules ----
const formRules: FormRules = {
  username: [{ required: true, message: 'Username is required', trigger: 'blur' }],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'At least 6 characters', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: 'Invalid email format', trigger: 'blur' }],
}
const resetRules: FormRules = {
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'At least 6 characters', trigger: 'blur' },
  ],
}

// ---- Methods ----
async function fetchList() {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  const res = await getRoleList()
  roleOptions.value = Array.isArray(res.data) ? res.data : []
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  searchForm.keyword = ''
  pagination.page = 1
  fetchList()
}

function openCreateDialog() {
  isEdit.value = false
  Object.assign(form, { id: 0, username: '', password: '', nickname: '', email: '', phone: '', status: 1, roleIds: [] })
  dialogVisible.value = true
}

function openEditDialog(row: User) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname || '',
    email: row.email || '',
    phone: row.phone || '',
    status: row.status,
    roleIds: row.roles?.map((r: { id: number }) => r.id) || [],
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updateUser(form.id, {
          nickname: form.nickname || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          status: form.status,
          roleIds: form.roleIds,
        })
        ElMessage.success('Updated successfully')
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          nickname: form.nickname || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          roleIds: form.roleIds,
        })
        ElMessage.success('Created successfully')
      }
      dialogVisible.value = false
      fetchList()
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(id: number) {
  await deleteUser(id)
  ElMessage.success('Deleted successfully')
  fetchList()
}

async function handleStatusChange(row: User, val: boolean) {
  await updateUser(row.id, { status: val ? 1 : 0 })
  row.status = val ? 1 : 0
  ElMessage.success('Status updated')
}

function openResetPwdDialog(row: User) {
  Object.assign(resetForm, { id: row.id, username: row.username, password: '' })
  resetPwdVisible.value = true
}

async function handleResetPwd() {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      await resetUserPassword(resetForm.id, resetForm.password)
      ElMessage.success('Password reset successfully')
      resetPwdVisible.value = false
    } finally {
      submitLoading.value = false
    }
  })
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', { hour12: false })
}

// ---- Init ----
onMounted(() => {
  fetchList()
  fetchRoles()
})
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
