// pages/profile/index.js - 我的页面
const { memberApi } = require('../../utils/api')
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
  },

  onShow() {
    const isLogin = app.isLogin()
    this.setData({ isLogin })
    if (isLogin) {
      this.loadUserInfo()
    } else {
      this.setData({ userInfo: null })
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 优先用本地缓存，后台静默刷新
      const cached = app.globalData.userInfo || wx.getStorageSync('userInfo')
      if (cached) this.setData({ userInfo: cached })

      const res = await memberApi.getInfo()
      const userInfo = res.data || res
      app.globalData.userInfo = userInfo
      wx.setStorageSync('userInfo', userInfo)
      this.setData({ userInfo })
    } catch (err) {
      console.log('加载用户信息失败：', err)
    }
  },

  // 去登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  },

  // 跳转我的订单
  goOrders(e) {
    const { tab = '' } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/list/index?tab=${tab}` })
  },

  // 跳转收货地址
  goAddress() {
    wx.navigateTo({ url: '/pages/address/index' })
  },

  // 跳转优惠券
  goCoupons() {
    wx.navigateTo({ url: '/pages/coupon/index' })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (!res.confirm) return
        app.logout()
        this.setData({ isLogin: false, userInfo: null })
        wx.showToast({ title: '已退出登录', icon: 'success' })
      }
    })
  },
})
