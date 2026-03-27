import request from '@/utils/request'

export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  sort: number
  createdAt: string
  updatedAt: string
  menus: { id: number; name: string; type: number }[]
}

export interface CreateRoleParams {
  name: string
  code: string
  description?: string
  sort?: number
  menuIds?: number[]
}

export interface UpdateRoleParams {
  name?: string
  code?: string
  description?: string
  sort?: number
  status?: number
  menuIds?: number[]
}

/** Get all roles */
export function getRoleList() {
  return request.get<any, { code: number; data: Role[] }>('/role')
}

/** Get role by id */
export function getRoleById(id: number) {
  return request.get<any, { code: number; data: Role }>(`/role/${id}`)
}

/** Create role */
export function createRole(data: CreateRoleParams) {
  return request.post<any, { code: number; data: Role }>('/role', data)
}

/** Update role */
export function updateRole(id: number, data: UpdateRoleParams) {
  return request.put<any, { code: number; data: Role }>(`/role/${id}`, data)
}

/** Delete role */
export function deleteRole(id: number) {
  return request.delete<any, { code: number }>(`/role/${id}`)
}
