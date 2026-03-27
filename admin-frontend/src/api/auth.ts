import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: {
    id: number
    username: string
    nickname: string
    avatar: string
    roles: { id: number; name: string; code: string }[]
  }
}

/** Login */
export function login(data: LoginParams) {
  return request.post<any, { code: number; data: LoginResult }>('/auth/login', data)
}

/** Get current user info */
export function getUserInfo() {
  return request.get<any, any>('/auth/profile')
}
