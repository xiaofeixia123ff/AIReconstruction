import request from '@/utils/request'

/** Overview stats */
export function getOverview() {
  return request.get('/stats/overview')
}

/** Sales trend: past N days */
export function getSalesTrend(days: number = 7) {
  return request.get('/stats/sales-trend', { params: { days } })
}

/** Product sales ranking */
export function getProductRanking(limit: number = 10) {
  return request.get('/stats/product-ranking', { params: { limit } })
}

/** Order status distribution */
export function getOrderStatusDist() {
  return request.get('/stats/order-status')
}

/** Member growth trend */
export function getMemberTrend(days: number = 7) {
  return request.get('/stats/member-trend', { params: { days } })
}
