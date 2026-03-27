import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor - attach token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - handle errors
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Request failed'

    if (status === 401) {
      ElMessage.error('Login expired, please login again')
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    } else if (status === 403) {
      ElMessage.error('No permission')
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  },
)

export default request
