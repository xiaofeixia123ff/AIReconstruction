// pages/home/index.js
const { productApi, categoryApi, couponApi } = require('../../utils/api')
const { formatPrice } = require('../../utils/util')

const app = getApp()

Page({
  data: {
    // 轮播图列表
    banners: [
      { id: 1, imageUrl: '', linkUrl: '' },
      { id: 2, imageUrl: '', linkUrl: '' },
    ],
    // 分类导航（前8个）
    categories: [],
    // 限时特惠商品
    flashSaleProducts: [],
    // 推荐商品
    recommendProducts: [],
    // 优惠券横幅
    couponBanner: null,
    // 加载状态
    loading: false,
    // 当前轮播图索引
    currentBanner: 0,
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 刷新购物车数量
    app.updateCartCount()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载所有数据
  async loadData() {
    this.setData({ loading: true })
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadProducts(),
      ])
    } catch (err) {
      console.error('首页数据加载失败：', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载分类
  async loadCategories() {
    try {
      const res = await categoryApi.getList()
      const data = res.data || res
      const list = (data.list || data || []).slice(0, 8)
      this.setData({ categories: list })
    } catch (err) {
      console.error('分类加载失败：', err)
    }
  },

  // 加载商品
  async loadProducts() {
    try {
      const res = await productApi.getList({ page: 1, pageSize: 10, status: 1 })
      const data = res.data || res
      const list = data.list || data || []
      // 格式化价格
      const formatted = list.map(item => ({
        ...item,
        priceStr: formatPrice(item.price),
        originalPriceStr: item.originalPrice ? formatPrice(item.originalPrice) : ''
      }))
      this.setData({
        flashSaleProducts: formatted.slice(0, 4),
        recommendProducts: formatted
      })
    } catch (err) {
      console.error('商品加载失败：', err)
    }
  },

  // 轮播图切换
  onBannerChange(e) {
    this.setData({ currentBanner: e.detail.current })
  },

  // 跳转分类页
  goToCategory(e) {
    const { id } = e.currentTarget.dataset
    wx.switchTab({ url: '/pages/category/index' })
    // 通过全局数据传递分类 id
    if (id) {
      app.globalData.selectedCategoryId = id
    }
  },

  // 跳转商品详情
  goToProduct(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  },

  // 跳转优惠券页
  goToCoupon() {
    if (!app.isLogin()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }
    wx.navigateTo({ url: '/pages/coupon/index' })
  },

  // 跳转搜索（分类页）
  goToSearch() {
    wx.switchTab({ url: '/pages/category/index' })
  }
})
