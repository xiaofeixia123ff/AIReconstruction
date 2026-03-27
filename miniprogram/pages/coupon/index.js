// pages/coupon/index.js - 我的优惠券页
const { couponApi } = require('../../utils/api')

Page({
  data: {
    tabs: [
      { key: 'unused', label: '可使用' },
      { key: 'used', label: '已使用' },
      { key: 'expired', label: '已过期' },
    ],
    activeTab: 0,
    coupons: [],
    loading: false,
    isEmpty: false,
  },

  onLoad() {
    this.loadCoupons()
  },

  // 切换 tab
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    if (index === this.data.activeTab) return
    this.setData({ activeTab: index, coupons: [] })
    this.loadCoupons()
  },

  // 加载优惠券列表
  async loadCoupons() {
    const { tabs, activeTab } = this.data
    const status = tabs[activeTab].key
    this.setData({ loading: true })
    try {
      const res = await couponApi.getMyCoupons({ status })
      const list = res.data?.list || res.data || res.list || []
      const now = Date.now()
      const coupons = list.map(c => ({
        ...c,
        valueStr: ((c.value || 0) / 100).toFixed(0),
        minAmountStr: ((c.minAmount || 0) / 100).toFixed(0),
        expireDateStr: c.expireTime ? c.expireTime.substring(0, 10) : '长期有效',
        isExpired: c.expireTime && new Date(c.expireTime).getTime() < now,
      }))
      this.setData({ coupons, isEmpty: coupons.length === 0 })
    } catch (err) {
      console.error('加载优惠券失败：', err)
      this.setData({ isEmpty: true })
    } finally {
      this.setData({ loading: false })
    }
  },
})
