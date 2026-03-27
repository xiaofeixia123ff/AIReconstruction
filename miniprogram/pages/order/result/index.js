// pages/order/result/index.js
Page({
  data: {
    orderId: '',
    status: 'success', // success | fail
  },

  onLoad(options) {
    const { orderId = '', status = 'success' } = options
    this.setData({ orderId, status })
  },

  // 查看订单详情
  goOrderDetail() {
    const { orderId } = this.data
    if (!orderId) {
      this.goOrderList()
      return
    }
    wx.redirectTo({
      url: `/pages/order/detail/index?id=${orderId}`
    })
  },

  // 查看订单列表
  goOrderList() {
    wx.redirectTo({
      url: '/pages/order/list/index'
    })
  },

  // 继续购物
  goShopping() {
    wx.switchTab({
      url: '/pages/home/index'
    })
  },
})
