import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, type LoginParams, type LoginResult } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<LoginResult['userInfo'] | null>(null)

  async function loginAction(params: LoginParams) {
    const res = await loginApi(params)
    token.value = res.data.token
    userInfo.value = res.data.userInfo
    localStorage.setItem('token', res.data.token)
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  function isLoggedIn() {
    return !!token.value
  }

  return { token, userInfo, loginAction, logout, isLoggedIn }
})
