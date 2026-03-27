import request from '@/utils/request'

export interface Coupon {
  id: number
  name: string
  type: number       // 1=fixed amount, 2=percentage
  value: number
  minAmount: number
  totalQty: number
  usedQty: number
  perUserLimit: number
  startTime?: string
  endTime?: string
  status: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CouponRecord {
  id: number
  couponId: number
  memberId: number
  memberNickname?: string
  status: number     // 0=unused, 1=used, 2=expired
  usedAt?: string
  orderId?: number
  createdAt: string
}

export interface CreateCouponData {
  name: string
  type: number
  value: number
  minAmount?: number
  totalQty?: number
  perUserLimit?: number
  startTime?: string
  endTime?: string
  description?: string
}

/** Get coupon list */
export function getCouponList(params: { page?: number; pageSize?: number; keyword?: string; status?: number }) {
  return request.get('/coupon', { params })
}

/** Get coupon stats */
export function getCouponStats() {
  return request.get('/coupon/stats')
}

/** Get coupon detail */
export function getCouponDetail(id: number) {
  return request.get(`/coupon/${id}`)
}

/** Create coupon */
export function createCoupon(data: CreateCouponData) {
  return request.post('/coupon', data)
}

/** Update coupon */
export function updateCoupon(id: number, data: Partial<CreateCouponData> & { status?: number }) {
  return request.put(`/coupon/${id}`, data)
}

/** Toggle coupon status */
export function toggleCouponStatus(id: number) {
  return request.patch(`/coupon/${id}/status`)
}

/** Delete coupon */
export function deleteCoupon(id: number) {
  return request.delete(`/coupon/${id}`)
}

/** Get coupon records */
export function getCouponRecords(id: number, params: { page?: number; pageSize?: number }) {
  return request.get(`/coupon/${id}/records`, { params })
}
