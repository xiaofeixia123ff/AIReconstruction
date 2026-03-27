<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="page-title">
        <el-icon><Grid /></el-icon>
        <span>Category Management</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog()">Add Category</el-button>
    </div>

    <!-- Search bar -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="Keyword">
          <el-input v-model="searchForm.keyword" placeholder="Category name" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">Search</el-button>
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Category Name" min-width="160" />
        <el-table-column label="Parent" width="140">
          <template #default="{ row }">
            <span>{{ row.parentId ? getCategoryName(row.parentId) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="Sort" width="80" align="center" />
        <el-table-column label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openCreateDialog(row.id)">Add Sub</el-button>
            <el-button type="warning" link size="small" @click="openEditDialog(row)">Edit</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="loadData"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? 'Add Category' : 'Edit Category'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Category name" />
        </el-form-item>
        <el-form-item label="Parent">
          <el-select v-model="form.parentId" placeholder="Top-level category" clearable style="width: 100%">
            <el-option
              v-for="item in flatCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.id === editingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">Enabled</el-radio>
            <el-radio :value="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Grid } from '@element-plus/icons-vue'
import {
  getCategoryList, createCategory, updateCategory, deleteCategory,
  type Category,
} from '@/api/product'

// ---- State ----
const loading = ref(false)
const submitting = ref(false)
const tableData = ref<Category[]>([])
const allCategories = ref<Category[]>([])

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  parentId: undefined as number | undefined,
  sort: 0,
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: 'Please enter category name', trigger: 'blur' }],
}

// Flat list for parent selector
const flatCategories = computed(() => allCategories.value)

// ---- Methods ----
function getCategoryName(id: number): string {
  return allCategories.value.find((c) => c.id === id)?.name || String(id)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-CN', { hour12: false })
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCategoryList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
    allCategories.value = res.data.list
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
  pagination.page = 1
  loadData()
}

function openCreateDialog(parentId?: number) {
  dialogMode.value = 'create'
  editingId.value = null
  form.name = ''
  form.parentId = parentId
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

function openEditDialog(row: Category) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.name = row.name
  form.parentId = row.parentId ?? undefined
  form.sort = row.sort
  form.status = row.status
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  editingId.value = null
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (dialogMode.value === 'create') {
      await createCategory({ ...form })
      ElMessage.success('Category created successfully')
    } else {
      await updateCategory(editingId.value!, { ...form })
      ElMessage.success('Category updated successfully')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Category) {
  await ElMessageBox.confirm(`Delete category "${row.name}"?`, 'Confirm', { type: 'warning' })
  await deleteCategory(row.id)
  ElMessage.success('Deleted successfully')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.search-card :deep(.el-card__body) {
  padding: 16px 20px 0;
}

.table-card :deep(.el-card__body) {
  padding: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
