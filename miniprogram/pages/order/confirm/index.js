// pages/order/confirm/index.js
const { orderApi, couponApi } = require('../../../utils/api')
const { formatPriceNum, formatPrice } = require('../../../utils/util')

const app = getApp()

Page({
  data: {
    // 来源：buyNow 或 cart
    from: 'cart',
    // 商品列表
    items: [],
    // 收货地址
    address: null,
    // 优惠券列表
    coupons: [],
    // 当前选中的优惠券
    selectedCoupon: null,
    // 优惠券弹窗
    showCouponPicker: false,
    // 备注
    remark: '',
    // 价格计算
    totalPrice: 0,       // 商品总价（分）
    discountAmount: 0,   // 优惠金额（分）
    payPrice: 0,         // 实付金额（分）
    // 格式化价格字符串
    totalPriceStr: '0.00',
    discountAmountStr: '0.00',
    payPriceStr: '0.00',
    // 提交中
    submitting: false,
  },

  onLoad(options) {
    const { from = 'cart' } = options
    this.setData({ from })

    // 读取商品数据
    let items = []
    if (from === 'buyNow') {
      items = wx.getStorageSync('buyNowItems') || []
    } else {
      // 从购物车读取选中商品
      const cart = wx.getStorageSync('cart') || []
      items = cart.filter(item => item.selected !== false)
      if (items.length === 0) items = cart // 兼容未设置selected的情况
    }

    if (items.length === 0) {
      wx.showToast({ title: '没有可结算的商品', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    // 预处理商品数据，添加格式化字段
    const processedItems = items.map(item => ({
      ...item,
      priceStr: formatPriceNum(item.price),
    }))

    this.setData({ items: processedItems })
    this.calcPrice()
    this.loadAddress()
    this.loadCoupons()
  },

  // 加载收货地址（读取本地存储的默认地址）
  loadAddress() {
    const address = wx.getStorageSync('defaultAddress') || null
    this.setData({ address })
  },

  // 加载可用优惠券
  async loadCoupons() {
    try {
      const res = await couponApi.getMyCoupons({ status: 'unused' })
      const list = res.data?.list || res.data || res.list || []
      // 过滤出可用的优惠券（未过期）
      const now = Date.now()
      const available = list.filter(c => {
        if (c.status !== 'unused') return false
        if (c.expireTime && new Date(c.expireTime).getTime() < now) return false
        return true
      }).map(c => ({
        ...c,
        valueStr: Math.floor((c.value || 0) / 100).toString(),
        minAmountStr: Math.floor((c.minAmount || 0) / 100).toString(),
        expireDateStr: c.expireTime ? c.expireTime.substring(0, 10) : '',
      }))
      this.setData({ coupons: available })
    } catch (err) {
      // 未登录或接口异常时忽略
      console.log('加载优惠券失败：', err)
    }
  },

  // 计算价格
  calcPrice() {
    const { items, selectedCoupon } = this.data
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let discountAmount = 0
    if (selectedCoupon) {
      if (selectedCoupon.type === 'fixed') {
        discountAmount = selectedCoupon.value || 0
      } else if (selectedCoupon.type === 'percent') {
        discountAmount = Math.floor(totalPrice * (1 - (selectedCoupon.value || 100) / 100))
      }
    }
    const payPrice = Math.max(0, totalPrice - discountAmount)
    this.setData({
      totalPrice,
      discountAmount,
      payPrice,
      totalPriceStr: formatPriceNum(totalPrice),
      discountAmountStr: formatPriceNum(discountAmount),
      payPriceStr: formatPriceNum(payPrice),
    })
  },

  // 跳转选择地址
  goSelectAddress() {
    wx.navigateTo({
      url: '/pages/address/index?mode=select',
      events: {
        // 监听地址选择回调
        selectAddress: (address) => {
          this.setData({ address })
        }
      }
    })
  },

  // 打开优惠券选择弹窗
  openCouponPicker() {
    if (this.data.coupons.length === 0) {
      wx.showToast({ title: '暂无可用优惠券', icon: 'none' })
      return
    }
    this.setData({ showCouponPicker: true })
  },

  // 关闭优惠券弹窗
  closeCouponPicker() {
    this.setData({ showCouponPicker: false })
  },

  // 选择优惠券
  selectCoupon(e) {
    const { coupon } = e.currentTarget.dataset
    const { selectedCoupon } = this.data
    // 再次点击已选中的则取消
    if (selectedCoupon && selectedCoupon.id === coupon.id) {
      this.setData({ selectedCoupon: null, showCouponPicker: false })
    } else {
      this.setData({ selectedCoupon: coupon, showCouponPicker: false })
    }
    this.calcPrice()
  },

  // 不使用优惠券
  clearCoupon() {
    this.setData({ selectedCoupon: null, showCouponPicker: false })
    this.calcPrice()
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // 提交订单
  async submitOrder() {
    const { address, items, selectedCoupon, remark, submitting, payPrice } = this.data

    if (submitting) return

    if (!address) {
      wx.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }

    if (!app.isLogin()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }

    this.setData({ submitting: true })

    try {
      const orderData = {
        items: items.map(item => ({
          productId: Number(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        address: {
          name: address.name,
          phone: address.phone,
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detail: address.detail,
        },
        couponId: selectedCoupon ? Number(selectedCoupon.id) : undefined,
        remark: remark || '',
        totalAmount: Number(payPrice),
      }

      const res = await orderApi.create(orderData)
      const order = res.data || res

      // 清除立即购买缓存
      if (this.data.from === 'buyNow') {
        wx.removeStorageSync('buyNowItems')
      } else {
        // 从购物车移除已结算商品
        const cart = wx.getStorageSync('cart') || []
        const itemIds = items.map(i => i.id)
        const newCart = cart.filter(c => !itemIds.includes(c.id))
        wx.setStorageSync('cart', newCart)
        app.updateCartCount()
      }

      // 跳转结果页
      wx.redirectTo({
        url: `/pages/order/result/index?orderId=${order.id}&status=success`
      })
    } catch (err) {
      console.error('提交订单失败：', err)
      wx.showToast({ title: err.message || '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
