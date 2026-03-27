<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="page-title">
        <el-icon><Goods /></el-icon>
        <span>Product Management</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">Add Product</el-button>
    </div>

    <!-- Search bar -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="Keyword">
          <el-input v-model="searchForm.keyword" placeholder="Product name / code" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="searchForm.categoryId" placeholder="All categories" clearable style="width: 160px">
            <el-option v-for="c in allCategories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All" clearable style="width: 120px">
            <el-option label="On Sale" :value="1" />
            <el-option label="Off Sale" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">Search</el-button>
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="Image" width="80" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.mainImage"
              :src="row.mainImage"
              :preview-src-list="[row.mainImage]"
              fit="cover"
              style="width: 48px; height: 48px; border-radius: 4px"
            />
            <el-icon v-else size="32" color="#c0c4cc"><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Product Name" min-width="160" show-overflow-tooltip />
        <el-table-column prop="code" label="Code" width="120" />
        <el-table-column label="Category" width="120">
          <template #default="{ row }">{{ row.category?.name || '—' }}</template>
        </el-table-column>
        <el-table-column label="Price" width="110" align="right">
          <template #default="{ row }">
            <span class="price">¥{{ Number(row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="Stock" width="80" align="center" />
        <el-table-column prop="sales" label="Sales" width="80" align="center" />
        <el-table-column label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? 'On Sale' : 'Off Sale' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">Edit</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? 'Off Sale' : 'On Sale' }}
            </el-button>
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
      :title="dialogMode === 'create' ? 'Add Product' : 'Edit Product'"
      width="680px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="Product Name" prop="name">
              <el-input v-model="form.name" placeholder="Product name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Category">
              <el-select v-model="form.categoryId" placeholder="Select category" clearable style="width: 100%">
                <el-option v-for="c in allCategories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Code">
              <el-input v-model="form.code" placeholder="Product code / SKU" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Price (¥)" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Original (¥)">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Stock" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sort">
              <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Main Image">
              <el-input v-model="form.mainImage" placeholder="Main image URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Description">
              <el-input v-model="form.description" type="textarea" :rows="2" placeholder="Short description" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Detail">
              <el-input v-model="form.detail" type="textarea" :rows="4" placeholder="Product detail content" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">On Sale</el-radio>
                <el-radio :value="0">Off Sale</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Goods, Picture } from '@element-plus/icons-vue'
import {
  getProductList, createProduct, updateProduct, deleteProduct, toggleProductStatus,
  getCategoryList,
  type Product, type Category,
} from '@/api/product'

// ---- State ----
const loading = ref(false)
const submitting = ref(false)
const tableData = ref<Product[]>([])
const allCategories = ref<Category[]>([])

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined,
})
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  code: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  mainImage: '',
  description: '',
  detail: '',
  sort: 0,
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: 'Please enter product name', trigger: 'blur' }],
  price: [{ required: true, message: 'Please enter price', trigger: 'blur' }],
  stock: [{ required: true, message: 'Please enter stock', trigger: 'blur' }],
}

// ---- Methods ----
function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-CN', { hour12: false })
}

async function loadCategories() {
  const res = await getCategoryList({ page: 1, pageSize: 200 })
  allCategories.value = res.data.list
}

async function loadData() {
  loading.value = true
  try {
    const res = await getProductList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      categoryId: searchForm.categoryId,
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
  searchForm.categoryId = undefined
  searchForm.status = undefined
  pagination.page = 1
  loadData()
}

function openCreateDialog() {
  dialogMode.value = 'create'
  editingId.value = null
  Object.assign(form, {
    name: '', categoryId: undefined, code: '', price: 0,
    originalPrice: 0, stock: 0, mainImage: '', description: '',
    detail: '', sort: 0, status: 1,
  })
  dialogVisible.value = true
}

function openEditDialog(row: Product) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    categoryId: row.categoryId ?? undefined,
    code: row.code || '',
    price: Number(row.price),
    originalPrice: Number(row.originalPrice) || 0,
    stock: row.stock,
    mainImage: row.mainImage || '',
    description: row.description || '',
    detail: row.detail || '',
    sort: row.sort,
    status: row.status,
  })
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
    const payload = { ...form }
    if (dialogMode.value === 'create') {
      await createProduct(payload)
      ElMessage.success('Product created successfully')
    } else {
      await updateProduct(editingId.value!, payload)
      ElMessage.success('Product updated successfully')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(row: Product) {
  const action = row.status === 1 ? 'take off sale' : 'put on sale'
  await ElMessageBox.confirm(`Are you sure to ${action} "${row.name}"?`, 'Confirm', { type: 'warning' })
  await toggleProductStatus(row.id)
  ElMessage.success('Status updated successfully')
  loadData()
}

async function handleDelete(row: Product) {
  await ElMessageBox.confirm(`Delete product "${row.name}"?`, 'Confirm', { type: 'warning' })
  await deleteProduct(row.id)
  ElMessage.success('Deleted successfully')
  loadData()
}

onMounted(() => {
  loadCategories()
  loadData()
})
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

.price {
  color: #f56c6c;
  font-weight: 600;
}
</style>
