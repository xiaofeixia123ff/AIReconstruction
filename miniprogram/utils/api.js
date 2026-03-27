// utils/api.js - 所有 API 接口定义

const { get, post, put, del } = require('./request')

// ==================== 认证 ====================
const authApi = {
  // 微信小程序登录
  wxLogin: (data) => post('/api/auth/wx-login', data, { auth: false }),
  // 管理员登录（测试用）
  login: (data) => post('/api/auth/login', data, { auth: false })
}

// ==================== 商品 ====================
const productApi = {
  // 获取商品列表
  getList: (params) => get('/api/product', params),
  // 获取商品详情
  getDetail: (id) => get(`/api/product/${id}`),
  // 按分类获取商品
  getByCategory: (categoryId, params) => get('/api/product', { categoryId, ...params })
}

// ==================== 分类 ====================
const categoryApi = {
  // 获取所有分类
  getList: () => get('/api/category'),
  // 获取分类详情
  getDetail: (id) => get(`/api/category/${id}`)
}

// ==================== 订单 ====================
const orderApi = {
  // 创建订单
  create: (data) => post('/api/order', data),
  // 获取订单列表
  getList: (params) => get('/api/order', params),
  // 获取订单详情
  getDetail: (id) => get(`/api/order/${id}`),
  // 更新订单状态
  updateStatus: (id, status) => put(`/api/order/${id}/status`, { status }),
  // 取消订单
  cancel: (id) => put(`/api/order/${id}/status`, { status: 'cancelled' })
}

// ==================== 会员 ====================
const memberApi = {
  // 获取会员信息（当前用户）
  getInfo: () => get('/api/member/me'),
  // 更新会员信息
  updateInfo: (data) => put('/api/member/me', data),
  // 获取会员列表（管理员）
  getList: (params) => get('/api/member', params)
}

// ==================== 优惠券 ====================
const couponApi = {
  // 获取可用优惠券
  getAvailable: () => get('/api/coupon/available'),
  // 获取我的优惠券
  getMyCoupons: (params) => get('/api/coupon/my', params),
  // 领取优惠券
  receive: (id) => post(`/api/coupon/${id}/receive`),
  // 获取优惠券列表（管理员）
  getList: (params) => get('/api/coupon', params)
}

module.exports = {
  authApi,
  productApi,
  categoryApi,
  orderApi,
  memberApi,
  couponApi
}
