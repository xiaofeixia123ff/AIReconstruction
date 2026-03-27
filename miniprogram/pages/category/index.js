// pages/category/index.js
const { categoryApi, productApi } = require('../../utils/api')
const { formatPriceNum } = require('../../utils/util')

Page({
  data: {
    categories: [],
    activeCategory: 0,
    products: [],
    loading: false,
    productsLoading: false,
  },

  onLoad() {
    this.loadCategories()
  },

  // 加载分类列表
  async loadCategories() {
    this.setData({ loading: true })
    try {
      const res = await categoryApi.getList()
      const list = res.data || res.list || res || []
      const categories = Array.isArray(list) ? list : []
      this.setData({ categories })
      if (categories.length > 0) {
        this.loadProducts(categories[0].id)
      }
    } catch (err) {
      console.error('加载分类失败：', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换分类
  switchCategory(e) {
    const { index } = e.currentTarget.dataset
    if (index === this.data.activeCategory) return
    const categoryId = this.data.categories[index]?.id
    this.setData({ activeCategory: index, products: [] })
    this.loadProducts(categoryId)
  },

  // 加载该分类下的商品
  async loadProducts(categoryId) {
    if (!categoryId) return
    this.setData({ productsLoading: true })
    try {
      const res = await productApi.getByCategory(categoryId, { pageSize: 50 })
      const resData = res.data || res
      const list = resData.list || resData.items || resData || []
      const products = list.map(p => ({
        ...p,
        priceStr: formatPriceNum(p.price),
      }))
      this.setData({ products })
    } catch (err) {
      console.error('加载商品失败：', err)
    } finally {
      this.setData({ productsLoading: false })
    }
  },

  // 跳转商品详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  },
})
