import request from '@/utils/request'

export enum OrderStatus {
  PENDING_PAYMENT = 0,
  PENDING_SHIPMENT = 1,
  SHIPPED = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  REFUNDED = 5,
}

export const ORDER_STATUS_MAP: Record<number, { label: string; type: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { label: 'Pending Payment', type: 'warning' },
  [OrderStatus.PENDING_SHIPMENT]: { label: 'Pending Shipment', type: 'primary' },
  [OrderStatus.SHIPPED]: { label: 'Shipped', type: 'success' },
  [OrderStatus.COMPLETED]: { label: 'Completed', type: 'info' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', type: 'danger' },
  [OrderStatus.REFUNDED]: { label: 'Refunded', type: 'info' },
}

export interface Order {
  id: number
  orderNo: string
  userId: number
  nickname: string
  phone: string
  totalAmount: number
  payAmount: number
  freightAmount: number
  status: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  expressCompany: string
  expressNo: string
  payTime: string
  shipTime: string
  completeTime: string
  remark: string
  itemsSnapshot: string
  createdAt: string
  updatedAt: string
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number | string
  startDate?: string
  endDate?: string
}

export interface ShipParams {
  expressCompany: string
  expressNo: string
}

/** Get order list */
export function getOrderList(params: OrderListParams) {
  return request.get('/order', { params })
}

/** Get order detail */
export function getOrderDetail(id: number) {
  return request.get(`/order/${id}`)
}

/** Create order */
export function createOrder(data: Partial<Order>) {
  return request.post('/order', data)
}

/** Update order */
export function updateOrder(id: number, data: Partial<Order>) {
  return request.put(`/order/${id}`, data)
}

/** Delete order */
export function deleteOrder(id: number) {
  return request.delete(`/order/${id}`)
}

/** Ship order */
export function shipOrder(id: number, data: ShipParams) {
  return request.patch(`/order/${id}/ship`, data)
}

/** Cancel order */
export function cancelOrder(id: number) {
  return request.patch(`/order/${id}/cancel`)
}

/** Complete order */
export function completeOrder(id: number) {
  return request.patch(`/order/${id}/complete`)
}

/** Refund order */
export function refundOrder(id: number) {
  return request.patch(`/order/${id}/refund`)
}

/** Get order statistics */
export function getOrderStats() {
  return request.get('/order/stats')
}
