// utils/util.js - 通用工具函数

/**
 * 格式化价格：1000 -> ¥10.00
 */
const formatPrice = (price) => {
  if (!price && price !== 0) return '¥0.00'
  return `¥${(price / 100).toFixed(2)}`
}

/**
 * 格式化价格数字（不含符号）：1000 -> 10.00
 */
const formatPriceNum = (price) => {
  if (!price && price !== 0) return '0.00'
  return (price / 100).toFixed(2)
}

/**
 * 格式化日期：2024-01-01T00:00:00.000Z -> 2024-01-01 00:00:00
 */
const formatDate = (dateStr, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 订单状态映射
 */
const ORDER_STATUS = {
  pending: { label: '待付款', color: '#FF6B35' },
  paid: { label: '已付款', color: '#4CAF50' },
  shipped: { label: '已发货', color: '#2196F3' },
  delivered: { label: '已送达', color: '#9C27B0' },
  completed: { label: '已完成', color: '#607D8B' },
  cancelled: { label: '已取消', color: '#999999' }
}

const getOrderStatusLabel = (status) => {
  return ORDER_STATUS[status]?.label || status
}

const getOrderStatusColor = (status) => {
  return ORDER_STATUS[status]?.color || '#999999'
}

/**
 * 优惠券状态映射
 */
const COUPON_STATUS = {
  unused: { label: '可使用', color: '#FF6B35' },
  used: { label: '已使用', color: '#999999' },
  expired: { label: '已过期', color: '#CCCCCC' }
}

const getCouponStatusLabel = (status) => {
  return COUPON_STATUS[status]?.label || status
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 深拷贝对象
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 判断字符串是否为空
 */
const isEmpty = (str) => {
  return !str || str.trim() === ''
}

/**
 * 手机号格式校验
 */
const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

module.exports = {
  formatPrice,
  formatPriceNum,
  formatDate,
  ORDER_STATUS,
  getOrderStatusLabel,
  getOrderStatusColor,
  COUPON_STATUS,
  getCouponStatusLabel,
  debounce,
  deepClone,
  isEmpty,
  isValidPhone
}
