// pages/order/detail/index.js
const { orderApi } = require('../../../utils/api')
const { formatPriceNum, formatDate, getOrderStatusLabel, getOrderStatusColor } = require('../../../utils/util')

Page({
  data: {
    orderId: '',
    order: null,
    loading: true,
    // 格式化后的数据
    statusLabel: '',
    statusColor: '',
    totalAmountStr: '',
    createdAtStr: '',
    items: [],
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({ orderId: id })
    this.loadDetail(id)
  },

  // 加载订单详情
  async loadDetail(id) {
    this.setData({ loading: true })
    try {
      const res = await orderApi.getDetail(id)
      const order = res.data || res
      this.setData({
        order,
        statusLabel: getOrderStatusLabel(order.status),
        statusColor: getOrderStatusColor(order.status),
        totalAmountStr: formatPriceNum(order.totalAmount || order.total_amount || 0),
        createdAtStr: formatDate(order.createdAt || order.created_at, 'YYYY-MM-DD HH:mm:ss'),
        items: this.formatItems(order.items || order.orderItems || []),
      })
    } catch (err) {
      console.error('加载订单详情失败：', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化商品列表
  formatItems(items) {
    return items.map(item => {
      const price = item.price || (item.product && item.product.price) || 0
      const name = item.name || (item.product && item.product.name) || '商品'
      const image = item.image || (item.product && item.product.mainImage) || ''
      return {
        ...item,
        name,
        image,
        priceStr: formatPriceNum(price),
        subtotalStr: formatPriceNum(price * (item.quantity || 1)),
      }
    })
  },

  // 取消订单
  cancelOrder() {
    const { orderId } = this.data
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderApi.cancel(orderId)
          wx.showToast({ title: '订单已取消', icon: 'success' })
          this.loadDetail(orderId)
        } catch (err) {
          console.error('取消订单失败：', err)
        }
      }
    })
  },

  // 确认收货
  confirmReceive() {
    const { orderId } = this.data
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderApi.updateStatus(orderId, 'completed')
          wx.showToast({ title: '确认收货成功', icon: 'success' })
          this.loadDetail(orderId)
        } catch (err) {
          console.error('确认收货失败：', err)
        }
      }
    })
  },

  // 复制订单号
  copyOrderNo() {
    const { order } = this.data
    const no = order?.orderNo || order?.id || ''
    wx.setClipboardData({
      data: String(no),
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  },
})
