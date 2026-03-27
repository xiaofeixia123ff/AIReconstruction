<template>
  <div class="role-page">
    <!-- Table card -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>Role List</span>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">Add Role</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe row-key="id">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="Role Name" min-width="130" />
        <el-table-column prop="code" label="Role Code" min-width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="180">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="Menu Count" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.menus?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="Sort" width="80" align="center" />
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val: boolean) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" min-width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="openEditDialog(row)">Edit</el-button>
            <el-button type="success" link :icon="SetUp" @click="openPermDialog(row)">Permissions</el-button>
            <el-popconfirm
              title="Are you sure to delete this role?"
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
      :title="isEdit ? 'Edit Role' : 'Add Role'"
      width="480px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="Role Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter role name" />
        </el-form-item>
        <el-form-item label="Role Code" prop="code">
          <el-input v-model="form.code" placeholder="e.g. ROLE_ADMIN" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Enter description" />
        </el-form-item>
        <el-form-item label="Sort" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
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

    <!-- Permission (Menu) Dialog -->
    <el-dialog
      v-model="permDialogVisible"
      :title="`Assign Permissions - ${currentRole?.name}`"
      width="520px"
      destroy-on-close
    >
      <div class="perm-toolbar">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        >Select All</el-checkbox>
        <el-checkbox v-model="expandAll" @change="handleExpandAll">Expand All</el-checkbox>
      </div>
      <el-scrollbar height="400px">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedMenuIds"
          :default-expand-all="expandAll"
          class="perm-tree"
        />
      </el-scrollbar>
      <template #footer>
        <el-button @click="permDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSavePerm">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import { Plus, Edit, Delete, SetUp } from '@element-plus/icons-vue'
import {
  getRoleList, createRole, updateRole, deleteRole,
  type Role,
} from '@/api/role'
import { getMenuTree, type MenuItem } from '@/api/menu'

// ---- State ----
const loading = ref(false)
const tableData = ref<Role[]>([])

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  sort: 0,
  status: 1,
})

// Permission dialog
const permDialogVisible = ref(false)
const currentRole = ref<Role | null>(null)
const menuTree = ref<MenuItem[]>([])
const checkedMenuIds = ref<number[]>([])
const checkAll = ref(false)
const isIndeterminate = ref(false)
const expandAll = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeProps = { label: 'name', children: 'children' }

// ---- Rules ----
const formRules: FormRules = {
  name: [{ required: true, message: 'Role name is required', trigger: 'blur' }],
  code: [{ required: true, message: 'Role code is required', trigger: 'blur' }],
}

// ---- Methods ----
async function fetchList() {
  loading.value = true
  try {
    const res = await getRoleList()
    tableData.value = Array.isArray(res.data) ? res.data : []
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  isEdit.value = false
  Object.assign(form, { id: 0, name: '', code: '', description: '', sort: 0, status: 1 })
  dialogVisible.value = true
}

function openEditDialog(row: Role) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    sort: row.sort,
    status: row.status,
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
        await updateRole(form.id, {
          name: form.name,
          description: form.description || undefined,
          sort: form.sort,
          status: form.status,
        })
        ElMessage.success('Updated successfully')
      } else {
        await createRole({
          name: form.name,
          code: form.code,
          description: form.description || undefined,
          sort: form.sort,
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
  await deleteRole(id)
  ElMessage.success('Deleted successfully')
  fetchList()
}

async function handleStatusChange(row: Role, val: boolean) {
  await updateRole(row.id, { status: val ? 1 : 0 })
  row.status = val ? 1 : 0
  ElMessage.success('Status updated')
}

// Permission dialog
async function openPermDialog(row: Role) {
  currentRole.value = row
  checkedMenuIds.value = row.menus?.map((m) => m.id) || []
  // Load menu tree
  const res = await getMenuTree()
  menuTree.value = res.data || []
  permDialogVisible.value = true
}

function handleCheckAll(val: boolean) {
  const allIds = getAllMenuIds(menuTree.value)
  if (val) {
    treeRef.value?.setCheckedKeys(allIds)
  } else {
    treeRef.value?.setCheckedKeys([])
  }
  isIndeterminate.value = false
}

function handleExpandAll(val: boolean) {
  const nodes = treeRef.value?.store?.nodesMap
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = val
    })
  }
}

function getAllMenuIds(menus: MenuItem[]): number[] {
  const ids: number[] = []
  const traverse = (list: MenuItem[]) => {
    list.forEach((item) => {
      ids.push(item.id)
      if (item.children?.length) traverse(item.children)
    })
  }
  traverse(menus)
  return ids
}

async function handleSavePerm() {
  if (!currentRole.value) return
  submitLoading.value = true
  try {
    // Get checked keys (only leaf nodes to avoid duplicates)
    const checked = treeRef.value?.getCheckedKeys() as number[] || []
    const halfChecked = treeRef.value?.getHalfCheckedKeys() as number[] || []
    const menuIds = [...checked, ...halfChecked]
    await updateRole(currentRole.value.id, { menuIds })
    ElMessage.success('Permissions saved successfully')
    permDialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', { hour12: false })
}

// ---- Init ----
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.role-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.perm-toolbar {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.perm-tree {
  padding: 4px 0;
}
</style>
