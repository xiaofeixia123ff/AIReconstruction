<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-logo">
        <img src="@/assets/vue.svg" alt="logo" class="logo-img" />
        <span v-if="!isCollapsed" class="logo-text">Admin</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="#1a1a2e"
        text-color="#c0c4cc"
        active-text-color="#409eff"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>Dashboard</template>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <template #title>User Management</template>
        </el-menu-item>
        <el-menu-item index="/role">
          <el-icon><UserFilled /></el-icon>
          <template #title>Role Management</template>
        </el-menu-item>
        <el-menu-item index="/menu">
          <el-icon><Menu /></el-icon>
          <template #title>Menu Management</template>
        </el-menu-item>

        <!-- Order Management -->
        <el-menu-item index="/order">
          <el-icon><List /></el-icon>
          <template #title>Order Management</template>
        </el-menu-item>

        <!-- Member Management -->
        <el-menu-item index="/member">
          <el-icon><Avatar /></el-icon>
          <template #title>Member Management</template>
        </el-menu-item>

        <!-- Coupon Management -->
        <el-menu-item index="/coupon">
          <el-icon><Ticket /></el-icon>
          <template #title>Coupon Management</template>
        </el-menu-item>

        <!-- Data Statistics -->
        <el-menu-item index="/stats">
          <el-icon><TrendCharts /></el-icon>
          <template #title>Data Statistics</template>
        </el-menu-item>

        <!-- Product Management Group -->
        <el-sub-menu index="/product-group">
          <template #title>
            <el-icon><ShoppingBag /></el-icon>
            <span>Product</span>
          </template>
          <el-menu-item index="/product">
            <el-icon><Goods /></el-icon>
            <template #title>Product List</template>
          </el-menu-item>
          <el-menu-item index="/product/category">
            <el-icon><Grid /></el-icon>
            <template #title>Categories</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar || ''" icon="UserFilled" />
              <span class="username">{{ userInfo?.nickname || userInfo?.username || 'Admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  Logout
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main content -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const userInfo = computed(() => authStore.userInfo)
const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta?.title as string) || '')

async function handleCommand(command: string) {
  if (command === 'logout') {
    await ElMessageBox.confirm('Are you sure to logout?', 'Confirm', {
      type: 'warning',
    })
    authStore.logout()
    ElMessage.success('Logged out')
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #1a1a2e;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 16px;
  overflow: hidden;
}

.logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.main-content {
  background: #f0f2f5;
  overflow-y: auto;
}
</style>
