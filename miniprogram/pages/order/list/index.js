// pages/order/list/index.js
const { orderApi } = require('../../../utils/api')
const { formatPriceNum, formatDate, getOrderStatusLabel, getOrderStatusColor } = require('../../../utils/util')

const app = getApp()

Page({
  data: {
    // tab 列表（key 对应后端 OrderStatus 枚举值：0=待付款,1=待发货,2=已发货,3=已完成,4=已取消）
    tabs: [
      { key: '', label: '全部' },
      { key: '0', label: '待付款' },
      { key: '1', label: '待发货' },
      { key: '2', label: '待收货' },
      { key: '3', label: '已完成' },
    ],
    activeTab: 0,
    // 订单列表
    orders: [],
    // 分页
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    // 加载状态
    loading: false,
    refreshing: false,
    // 空状态
    isEmpty: false,
  },

  onLoad(options) {
    // 支持从外部指定初始 tab（如从"我的"页面跳转）
    const { tab = '' } = options
    const tabIndex = this.data.tabs.findIndex(t => t.key === tab)
    if (tabIndex > 0) {
      this.setData({ activeTab: tabIndex })
    }
    this.loadOrders(true)
  },

  onShow() {
    // 每次显示时刷新（处理从详情页返回的情况）
    this.loadOrders(true)
  },

  // 切换 tab
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    if (index === this.data.activeTab) return
    this.setData({ activeTab: index, orders: [], page: 1, hasMore: true, isEmpty: false })
    this.loadOrders(true)
  },

  // 加载订单列表
  async loadOrders(reset = false) {
    if (this.data.loading) return
    if (!reset && !this.data.hasMore) return

    const { tabs, activeTab, pageSize } = this.data
    const status = tabs[activeTab].key
    const page = reset ? 1 : this.data.page

    this.setData({ loading: true })

    try {
      const params = { page, pageSize }
      if (status) params.status = status

      const res = await orderApi.getMyList(params)
      const resData = res.data || res
      const list = resData.list || resData.items || resData || []
      const total = resData.total || list.length

      // 格式化订单数据
      const formatted = list.map(order => this.formatOrder(order))

      const orders = reset ? formatted : [...this.data.orders, ...formatted]
      const hasMore = orders.length < total

      this.setData({
        orders,
        total,
        page: page + 1,
        hasMore,
        isEmpty: orders.length === 0,
      })
    } catch (err) {
      console.error('加载订单失败：', err)
    } finally {
      this.setData({ loading: false, refreshing: false })
    }
  },

  // 格式化单个订单
  formatOrder(order) {
    const totalAmount = order.totalAmount || order.total_amount || 0
    return {
      ...order,
      statusLabel: getOrderStatusLabel(order.status),
      statusColor: getOrderStatusColor(order.status),
      totalAmountStr: formatPriceNum(totalAmount),
      createdAtStr: formatDate(order.createdAt || order.created_at, 'YYYY-MM-DD HH:mm'),
      // 取第一件商品作为封面
      coverItem: (order.items || order.orderItems || [])[0] || null,
      itemCount: (order.items || order.orderItems || []).length,
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders(false)
    }
  },

  // 跳转订单详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order/detail/index?id=${id}`
    })
  },

  // 取消订单
  async cancelOrder(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderApi.cancel(id)
          wx.showToast({ title: '订单已取消', icon: 'success' })
          this.loadOrders(true)
        } catch (err) {
          console.error('取消订单失败：', err)
        }
      }
    })
  },

  // 确认收货
  async confirmReceive(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await orderApi.updateStatus(id, 'completed')
          wx.showToast({ title: '确认收货成功', icon: 'success' })
          this.loadOrders(true)
        } catch (err) {
          console.error('确认收货失败：', err)
        }
      }
    })
  },
})
