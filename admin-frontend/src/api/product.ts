import request from '@/utils/request'

// ==================== Category ====================

export interface Category {
  id: number
  name: string
  parentId: number | null
  sort: number
  icon: string
  status: number
  createdAt: string
  updatedAt: string
  children?: Category[]
}

export interface CategoryListResult {
  list: Category[]
  total: number
  page: number
  pageSize: number
}

export interface CreateCategoryParams {
  name: string
  parentId?: number
  sort?: number
  icon?: string
  status?: number
}

export interface UpdateCategoryParams {
  name?: string
  parentId?: number
  sort?: number
  icon?: string
  status?: number
}

/** Get category tree */
export function getCategoryTree() {
  return request.get<any, { code: number; data: Category[] }>('/category/tree')
}

/** Get category list */
export function getCategoryList(params: { page: number; pageSize: number; keyword?: string }) {
  return request.get<any, { code: number; data: CategoryListResult }>('/category', { params })
}

/** Create category */
export function createCategory(data: CreateCategoryParams) {
  return request.post<any, { code: number; data: Category }>('/category', data)
}

/** Update category */
export function updateCategory(id: number, data: UpdateCategoryParams) {
  return request.put<any, { code: number; data: Category }>(`/category/${id}`, data)
}

/** Delete category */
export function deleteCategory(id: number) {
  return request.delete<any, { code: number }>(`/category/${id}`)
}

// ==================== Product ====================

export interface Product {
  id: number
  name: string
  categoryId: number | null
  code: string
  price: number
  originalPrice: number
  stock: number
  mainImage: string
  images: string
  description: string
  detail: string
  sales: number
  sort: number
  status: number
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface ProductListResult {
  list: Product[]
  total: number
  page: number
  pageSize: number
}

export interface CreateProductParams {
  name: string
  categoryId?: number
  code?: string
  price?: number
  originalPrice?: number
  stock?: number
  mainImage?: string
  images?: string
  description?: string
  detail?: string
  sort?: number
  status?: number
}

export type UpdateProductParams = Partial<CreateProductParams>

/** Get product list */
export function getProductList(params: {
  page: number
  pageSize: number
  keyword?: string
  categoryId?: number
  status?: number
}) {
  return request.get<any, { code: number; data: ProductListResult }>('/product', { params })
}

/** Get product by id */
export function getProductById(id: number) {
  return request.get<any, { code: number; data: Product }>(`/product/${id}`)
}

/** Create product */
export function createProduct(data: CreateProductParams) {
  return request.post<any, { code: number; data: Product }>('/product', data)
}

/** Update product */
export function updateProduct(id: number, data: UpdateProductParams) {
  return request.put<any, { code: number; data: Product }>(`/product/${id}`, data)
}

/** Delete product */
export function deleteProduct(id: number) {
  return request.delete<any, { code: number }>(`/product/${id}`)
}

/** Toggle product status */
export function toggleProductStatus(id: number) {
  return request.patch<any, { code: number; data: Product }>(`/product/${id}/toggle-status`)
}
