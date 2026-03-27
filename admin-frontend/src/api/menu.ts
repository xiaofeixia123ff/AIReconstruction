import request from '@/utils/request'

export interface MenuItem {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  permission: string
  icon: string
  type: number   // 0=directory, 1=menu, 2=button
  sort: number
  status: number
  visible: number
  createdAt: string
  children?: MenuItem[]
}

/** Get all menus (flat list) */
export function getMenuList() {
  return request.get<any, { code: number; data: MenuItem[] }>('/menu')
}

/** Get menu tree */
export function getMenuTree() {
  return request.get<any, { code: number; data: MenuItem[] }>('/menu/tree')
}

/** Create menu */
export function createMenu(data: Partial<MenuItem>) {
  return request.post<any, { code: number; data: MenuItem }>('/menu', data)
}

/** Update menu */
export function updateMenu(id: number, data: Partial<MenuItem>) {
  return request.put<any, { code: number; data: MenuItem }>(`/menu/${id}`, data)
}

/** Delete menu */
export function deleteMenu(id: number) {
  return request.delete<any, { code: number }>(`/menu/${id}`)
}
