import request from '@/utils/request'

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: number
  lastLoginAt: string
  lastLoginIp: string
  createdAt: string
  updatedAt: string
  roles: { id: number; name: string; code: string }[]
}

export interface UserListResult {
  list: User[]
  total: number
  page: number
  pageSize: number
}

export interface CreateUserParams {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
  roleIds?: number[]
}

export interface UpdateUserParams {
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  status?: number
  roleIds?: number[]
}

/** Get user list */
export function getUserList(params: { page: number; pageSize: number; keyword?: string }) {
  return request.get<any, { code: number; data: UserListResult }>('/user', { params })
}

/** Get user by id */
export function getUserById(id: number) {
  return request.get<any, { code: number; data: User }>(`/user/${id}`)
}

/** Create user */
export function createUser(data: CreateUserParams) {
  return request.post<any, { code: number; data: User }>('/user', data)
}

/** Update user */
export function updateUser(id: number, data: UpdateUserParams) {
  return request.put<any, { code: number; data: User }>(`/user/${id}`, data)
}

/** Delete user */
export function deleteUser(id: number) {
  return request.delete<any, { code: number }>(`/user/${id}`)
}

/** Reset user password */
export function resetUserPassword(id: number, password: string) {
  return request.patch<any, { code: number }>(`/user/${id}/reset-password`, { password })
}
