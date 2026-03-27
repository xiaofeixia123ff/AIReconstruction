// app.js
App({
  globalData: {
    token: '',
    userInfo: null,
    cartCount: 0,
    baseUrl: 'http://localhost:3000'
  },

  onLaunch() {
    // 读取本地存储的 token
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token) {
      this.globalData.token = token
    }
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    // 更新购物车数量
    this.updateCartCount()
  },

  // 更新购物车角标数量
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || []
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    this.globalData.cartCount = count
    // 更新 TabBar 角标
    if (count > 0) {
      wx.setTabBarBadge({ index: 2, text: String(count) })
    } else {
      wx.removeTabBarBadge({ index: 2 })
    }
  },

  // 检查登录状态
  isLogin() {
    return !!this.globalData.token
  },

  // 退出登录
  logout() {
    this.globalData.token = ''
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  }
})
