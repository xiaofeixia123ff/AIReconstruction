import request from '@/utils/request'

export interface Member {
  id: number
  openid: string
  unionid?: string
  nickname?: string
  avatar?: string
  gender: number
  phone?: string
  balance: number
  points: number
  status: number
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface MemberListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

export interface MemberStats {
  total: number
  active: number
  disabled: number
  todayNew: number
}

/** Get member list */
export function getMemberList(params: MemberListParams) {
  return request.get('/member', { params })
}

/** Get member stats */
export function getMemberStats() {
  return request.get('/member/stats')
}

/** Get member detail */
export function getMemberDetail(id: number) {
  return request.get(`/member/${id}`)
}

/** Update member info */
export function updateMember(id: number, data: Partial<Member>) {
  return request.put(`/member/${id}`, data)
}

/** Toggle member status */
export function toggleMemberStatus(id: number) {
  return request.patch(`/member/${id}/status`)
}

/** Adjust member points */
export function adjustMemberPoints(id: number, data: { points: number; remark?: string }) {
  return request.patch(`/member/${id}/points`, data)
}

/** Adjust member balance */
export function adjustMemberBalance(id: number, data: { amount: number; remark?: string }) {
  return request.patch(`/member/${id}/balance`, data)
}
