<template>
  <div class="menu-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>Menu Management</span>
          <div class="header-actions">
            <el-button :icon="Refresh" @click="fetchList">Refresh</el-button>
            <el-button
              :icon="expandAll ? 'FolderOpened' : 'Folder'"
              @click="toggleExpand"
            >{{ expandAll ? 'Collapse All' : 'Expand All' }}</el-button>
            <el-button type="primary" :icon="Plus" @click="openCreateDialog(0)">Add Menu</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="expandAll"
      >
        <el-table-column prop="name" label="Menu Name" min-width="180">
          <template #default="{ row }">
            <el-icon v-if="row.icon" class="menu-icon"><component :is="row.icon" /></el-icon>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Type" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]?.type" size="small">
              {{ typeTagMap[row.type]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="Route Path" min-width="160">
          <template #default="{ row }">{{ row.path || '-' }}</template>
        </el-table-column>
        <el-table-column prop="component" label="Component" min-width="180">
          <template #default="{ row }">{{ row.component || '-' }}</template>
        </el-table-column>
        <el-table-column prop="permission" label="Permission Code" min-width="180">
          <template #default="{ row }">
            <el-tag v-if="row.permission" type="warning" size="small">{{ row.permission }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="Sort" width="70" align="center" />
        <el-table-column label="Visible" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible === 1 ? 'success' : 'info'" size="small">
              {{ row.visible === 1 ? 'Show' : 'Hide' }}
            </el-tag>
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
        <el-table-column label="Actions" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type !== 2"
              type="success"
              link
              :icon="Plus"
              @click="openCreateDialog(row.id)"
            >Add Child</el-button>
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">Edit</el-button>
            <el-popconfirm
              title="Are you sure to delete this menu?"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete">Delete</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Menu' : 'Add Menu'"
      width="580px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="Parent Menu" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentMenuOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="Select parent menu (empty = top level)"
            clearable
            check-strictly
            :render-after-expand="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Menu Type" prop="type">
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio :value="0">Directory</el-radio>
            <el-radio :value="1">Menu</el-radio>
            <el-radio :value="2">Button</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Menu Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter menu name" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="Icon" prop="icon">
          <el-input v-model="form.icon" placeholder="Element Plus icon name, e.g. User" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="Route Path" prop="path">
          <el-input v-model="form.path" placeholder="e.g. /user or user" />
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="Component" prop="component">
          <el-input v-model="form.component" placeholder="e.g. views/user/index" />
        </el-form-item>
        <el-form-item label="Permission Code" prop="permission">
          <el-input v-model="form.permission" placeholder="e.g. sys:user:list" />
        </el-form-item>
        <el-form-item label="Sort" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="Visible" prop="visible">
          <el-radio-group v-model="form.visible">
            <el-radio :value="1">Show</el-radio>
            <el-radio :value="0">Hide</el-radio>
          </el-radio-group>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import {
  getMenuTree, createMenu, updateMenu, deleteMenu,
  type MenuItem,
} from '@/api/menu'

// ---- State ----
const loading = ref(false)
const tableData = ref<MenuItem[]>([])
const expandAll = ref(true)
const tableRef = ref()

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  parentId: null as number | null,
  name: '',
  type: 0,
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  visible: 1,
  status: 1,
})

// ---- Constants ----
const typeTagMap: Record<number, { label: string; type: 'primary' | 'success' | 'warning' | 'info' }> = {
  0: { label: 'Directory', type: 'primary' },
  1: { label: 'Menu', type: 'success' },
  2: { label: 'Button', type: 'warning' },
}

// ---- Computed ----
// Build parent menu options (only directory and menu types, not button)
const parentMenuOptions = computed(() => {
  const topOption = { id: 0, name: 'Top Level', children: [] as MenuItem[] }
  const filterTree = (list: MenuItem[]): MenuItem[] =>
    list
      .filter((item) => item.type !== 2)
      .map((item) => ({
        ...item,
        children: item.children ? filterTree(item.children) : [],
      }))
  return [{ ...topOption, children: filterTree(tableData.value) }]
})

// ---- Rules ----
const formRules: FormRules = {
  name: [{ required: true, message: 'Menu name is required', trigger: 'blur' }],
  type: [{ required: true, message: 'Menu type is required', trigger: 'change' }],
}

// ---- Methods ----
async function fetchList() {
  loading.value = true
  try {
    const res = await getMenuTree()
    tableData.value = res.data || []
  } finally {
    loading.value = false
  }
}

function toggleExpand() {
  expandAll.value = !expandAll.value
  // Manually toggle all rows
  const toggleRows = (rows: MenuItem[]) => {
    rows.forEach((row) => {
      tableRef.value?.toggleRowExpansion(row, expandAll.value)
      if (row.children?.length) toggleRows(row.children)
    })
  }
  toggleRows(tableData.value)
}

function resetForm() {
  Object.assign(form, {
    id: 0,
    parentId: null,
    name: '',
    type: 0,
    icon: '',
    path: '',
    component: '',
    permission: '',
    sort: 0,
    visible: 1,
    status: 1,
  })
}

function openCreateDialog(parentId: number) {
  isEdit.value = false
  resetForm()
  form.parentId = parentId || null
  dialogVisible.value = true
}

function openEditDialog(row: MenuItem) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId || null,
    name: row.name,
    type: row.type,
    icon: row.icon || '',
    path: row.path || '',
    component: row.component || '',
    permission: row.permission || '',
    sort: row.sort,
    visible: row.visible,
    status: row.status,
  })
  dialogVisible.value = true
}

function handleTypeChange() {
  // Clear irrelevant fields when type changes
  if (form.type === 2) {
    form.path = ''
    form.component = ''
    form.icon = ''
    form.visible = 1
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload: Partial<MenuItem> = {
        parentId: form.parentId ?? 0,
        name: form.name,
        type: form.type,
        icon: form.icon || undefined,
        path: form.path || undefined,
        component: form.component || undefined,
        permission: form.permission || undefined,
        sort: form.sort,
        visible: form.visible,
      }
      if (isEdit.value) {
        await updateMenu(form.id, { ...payload, status: form.status })
        ElMessage.success('Updated successfully')
      } else {
        await createMenu(payload)
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
  await deleteMenu(id)
  ElMessage.success('Deleted successfully')
  fetchList()
}

async function handleStatusChange(row: MenuItem, val: boolean) {
  await updateMenu(row.id, { status: val ? 1 : 0 })
  row.status = val ? 1 : 0
  ElMessage.success('Status updated')
}

// ---- Init ----
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.menu-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.menu-icon {
  margin-right: 4px;
  vertical-align: middle;
}
</style>
