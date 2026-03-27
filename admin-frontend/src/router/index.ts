import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: 'Dashboard', icon: 'Odometer' },
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/user/index.vue'),
          meta: { title: 'User Management', icon: 'User' },
        },
        {
          path: 'role',
          name: 'Role',
          component: () => import('@/views/role/index.vue'),
          meta: { title: 'Role Management', icon: 'UserFilled' },
        },
        {
          path: 'menu',
          name: 'Menu',
          component: () => import('@/views/menu/index.vue'),
          meta: { title: 'Menu Management', icon: 'Menu' },
        },
        {
          path: 'product',
          name: 'Product',
          component: () => import('@/views/product/index.vue'),
          meta: { title: 'Product Management', icon: 'Goods' },
        },
        {
          path: 'product/category',
          name: 'ProductCategory',
          component: () => import('@/views/product/category.vue'),
          meta: { title: 'Category Management', icon: 'Grid' },
        },
        {
          path: 'order',
          name: 'Order',
          component: () => import('@/views/order/index.vue'),
          meta: { title: 'Order Management', icon: 'List' },
        },
        {
          path: 'member',
          name: 'Member',
          component: () => import('@/views/member/index.vue'),
          meta: { title: 'Member Management', icon: 'Avatar' },
        },
        {
          path: 'coupon',
          name: 'Coupon',
          component: () => import('@/views/coupon/index.vue'),
          meta: { title: 'Coupon Management', icon: 'Ticket' },
        },
        {
          path: 'stats',
          name: 'Stats',
          component: () => import('@/views/stats/index.vue'),
          meta: { title: 'Data Statistics', icon: 'TrendCharts' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn()) {
    return '/login'
  }
  if (to.path === '/login' && authStore.isLoggedIn()) {
    return '/'
  }
})

export default router
