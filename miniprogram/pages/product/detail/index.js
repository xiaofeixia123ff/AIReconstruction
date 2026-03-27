// pages/product/detail/index.js
const { productApi } = require('../../../utils/api')
const { formatPrice, formatPriceNum } = require('../../../utils/util')

const app = getApp()

Page({
  data: {
    // 商品数据
    product: null,
    // 格式化后的价格
    priceStr: '',
    originalPriceStr: '',
    // 商品图片列表
    imageList: [],
    // 当前轮播图索引
    currentImage: 0,
    // 购买数量
    quantity: 1,
    // 加载状态
    loading: true,
    // 是否已加入购物车
    inCart: false,
    // 购物车中该商品数量
    cartQuantity: 0,
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '商品不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.productId = id
    this.loadProduct(id)
  },

  onShow() {
    // 刷新购物车状态
    this.refreshCartStatus()
  },

  // 加载商品详情
  async loadProduct(id) {
    this.setData({ loading: true })
    try {
      const res = await productApi.getDetail(id)
      const product = res.data || res

      // 解析图片列表
      let imageList = []
      if (product.images) {
        try {
          imageList = JSON.parse(product.images)
        } catch (e) {
          imageList = []
        }
      }
      // 主图放在第一位
      if (product.mainImage && !imageList.includes(product.mainImage)) {
        imageList.unshift(product.mainImage)
      }
      // Filter out empty strings, keep only valid URLs
      imageList = imageList.filter(img => img && img.trim() !== '')
      if (imageList.length === 0) {
        // No images: fill 3 placeholder items to show swiper effect
        imageList = ['__placeholder_1__', '__placeholder_2__', '__placeholder_3__']
      }

      this.setData({
        product,
        imageList,
        priceStr: formatPriceNum(product.price),
        originalPriceStr: product.originalPrice ? formatPriceNum(product.originalPrice) : '',
        loading: false
      })

      // 设置页面标题
      wx.setNavigationBarTitle({ title: product.name || '商品详情' })

      // 刷新购物车状态
      this.refreshCartStatus()
    } catch (err) {
      console.error('加载商品详情失败：', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  },

  // 刷新购物车状态
  refreshCartStatus() {
    const cart = wx.getStorageSync('cart') || []
    const cartItem = cart.find(item => item.id === Number(this.productId))
    this.setData({
      inCart: !!cartItem,
      cartQuantity: cartItem ? cartItem.quantity : 0
    })
  },

  // 轮播图切换
  onImageChange(e) {
    this.setData({ currentImage: e.detail.current })
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const { imageList } = this.data
    const validImages = imageList.filter(img => img && !img.startsWith('__placeholder_'))
    if (validImages.length === 0) return
    wx.previewImage({
      current: validImages[index] || validImages[0],
      urls: validImages
    })
  },

  // 减少数量
  decreaseQuantity() {
    const { quantity } = this.data
    if (quantity <= 1) return
    this.setData({ quantity: quantity - 1 })
  },

  // 增加数量
  increaseQuantity() {
    const { quantity, product } = this.data
    if (product && quantity >= product.stock) {
      wx.showToast({ title: '已达库存上限', icon: 'none' })
      return
    }
    this.setData({ quantity: quantity + 1 })
  },

  // 输入数量
  onQuantityInput(e) {
    const val = parseInt(e.detail.value)
    const { product } = this.data
    if (isNaN(val) || val < 1) {
      this.setData({ quantity: 1 })
      return
    }
    if (product && val > product.stock) {
      this.setData({ quantity: product.stock })
      wx.showToast({ title: '已达库存上限', icon: 'none' })
      return
    }
    this.setData({ quantity: val })
  },

  // 加入购物车
  addToCart() {
    const { product, quantity } = this.data
    if (!product) return
    if (product.stock <= 0) {
      wx.showToast({ title: '商品已售罄', icon: 'none' })
      return
    }

    const cart = wx.getStorageSync('cart') || []
    const existIndex = cart.findIndex(item => item.id === product.id)

    if (existIndex > -1) {
      // 已存在则增加数量
      const newQty = cart[existIndex].quantity + quantity
      cart[existIndex].quantity = Math.min(newQty, product.stock)
    } else {
      // 新增
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        mainImage: product.mainImage || '',
        stock: product.stock,
        quantity
      })
    }

    wx.setStorageSync('cart', cart)
    app.updateCartCount()
    this.refreshCartStatus()

    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  // 立即购买
  buyNow() {
    const { product, quantity } = this.data
    if (!product) return
    if (product.stock <= 0) {
      wx.showToast({ title: '商品已售罄', icon: 'none' })
      return
    }
    if (!app.isLogin()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    // 将当前商品临时存入，跳转确认订单页
    const buyItem = [{
      id: product.id,
      name: product.name,
      price: product.price,
      mainImage: product.mainImage || '',
      stock: product.stock,
      quantity
    }]
    wx.setStorageSync('buyNowItems', buyItem)
    wx.navigateTo({ url: '/pages/order/confirm/index?from=buyNow' })
  },

  // 跳转购物车
  goToCart() {
    wx.switchTab({ url: '/pages/cart/index' })
  }
})
