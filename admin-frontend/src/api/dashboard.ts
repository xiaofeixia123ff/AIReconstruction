import request from '@/utils/request'

export interface DashboardStats {
  totalUsers: number
  totalRoles: number
  totalMenus: number
  todayLogins: number
}

export interface LoginTrendItem {
  date: string
  count: number
}

export interface RecentLog {
  id: number
  userId: number
  username: string
  module: string
  description: string
  method: string
  url: string
  status: number
  duration: number
  ip: string
  createdAt: string
}

/** Get overview statistics */
export function getDashboardStats() {
  return request.get<any, { code: number; data: DashboardStats }>('/dashboard/stats')
}

/** Get login trend for last 7 days */
export function getLoginTrend() {
  return request.get<any, { code: number; data: LoginTrendItem[] }>('/dashboard/login-trend')
}

/** Get recent operation logs */
export function getRecentLogs(limit = 10) {
  return request.get<any, { code: number; data: RecentLog[] }>('/dashboard/recent-logs', {
    params: { limit },
  })
}
