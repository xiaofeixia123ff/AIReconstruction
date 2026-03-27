// pages/cart/index.js
const { formatPriceNum } = require('../../utils/util')

const app = getApp()

Page({
  data: {
    // 购物车列表
    cartList: [],
    // 是否全选
    allChecked: false,
    // 选中商品总价（分）
    totalPrice: 0,
    // 选中商品总数量
    totalCount: 0,
    // 是否处于编辑模式（显示删除按钮）
    editMode: false,
  },

  onShow() {
    this.loadCart()
  },

  // 从本地存储加载购物车
  loadCart() {
    const cart = wx.getStorageSync('cart') || []
    // 为每个商品添加 checked 状态（默认全选）
    const cartList = cart.map(item => ({
      ...item,
      checked: item.checked !== false, // 保留上次选中状态
      priceStr: formatPriceNum(item.price),
      subtotalStr: formatPriceNum(item.price * item.quantity),
    }))
    this.setData({ cartList })
    this.calcTotal()
  },

  // 计算总价和总数量
  calcTotal() {
    const { cartList } = this.data
    let totalPrice = 0
    let totalCount = 0
    cartList.forEach(item => {
      if (item.checked) {
        totalPrice += item.price * item.quantity
        totalCount += item.quantity
      }
    })
    const allChecked = cartList.length > 0 && cartList.every(item => item.checked)
    this.setData({
      totalPrice,
      totalCount,
      allChecked,
      totalPriceStr: formatPriceNum(totalPrice)
    })
  },

  // 切换单个商品选中状态
  toggleCheck(e) {
    const { index } = e.currentTarget.dataset
    const { cartList } = this.data
    cartList[index].checked = !cartList[index].checked
    this.setData({ cartList })
    this.calcTotal()
    this.saveCart()
  },

  // 切换全选
  toggleAllCheck() {
    const { cartList, allChecked } = this.data
    const newChecked = !allChecked
    const newList = cartList.map(item => ({ ...item, checked: newChecked }))
    this.setData({ cartList: newList, allChecked: newChecked })
    this.calcTotal()
    this.saveCart()
  },

  // 减少数量
  decreaseQty(e) {
    const { index } = e.currentTarget.dataset
    const { cartList } = this.data
    const item = cartList[index]
    if (item.quantity <= 1) {
      // 数量为1时再减，提示是否删除
      wx.showModal({
        title: '提示',
        content: '是否将该商品从购物车移除？',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) {
            this.removeItem(index)
          }
        }
      })
      return
    }
    cartList[index].quantity -= 1
    cartList[index].subtotalStr = formatPriceNum(item.price * cartList[index].quantity)
    this.setData({ cartList })
    this.calcTotal()
    this.saveCart()
  },

  // 增加数量
  increaseQty(e) {
    const { index } = e.currentTarget.dataset
    const { cartList } = this.data
    const item = cartList[index]
    if (item.quantity >= item.stock) {
      wx.showToast({ title: '已达库存上限', icon: 'none' })
      return
    }
    cartList[index].quantity += 1
    cartList[index].subtotalStr = formatPriceNum(item.price * cartList[index].quantity)
    this.setData({ cartList })
    this.calcTotal()
    this.saveCart()
  },

  // 删除单个商品
  removeItem(index) {
    const { cartList } = this.data
    cartList.splice(index, 1)
    this.setData({ cartList })
    this.calcTotal()
    this.saveCart()
    app.updateCartCount()
  },

  // 滑动删除
  onSlideDelete(e) {
    const { index } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确认删除该商品？',
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          this.removeItem(index)
        }
      }
    })
  },

  // 删除选中商品
  deleteChecked() {
    const { cartList } = this.data
    const checkedCount = cartList.filter(item => item.checked).length
    if (checkedCount === 0) {
      wx.showToast({ title: '请先选择商品', icon: 'none' })
      return
    }
    wx.showModal({
      title: '提示',
      content: `确认删除选中的 ${checkedCount} 件商品？`,
      confirmColor: '#FF4444',
      success: (res) => {
        if (res.confirm) {
          const newList = cartList.filter(item => !item.checked)
          this.setData({ cartList: newList })
          this.calcTotal()
          this.saveCart()
          app.updateCartCount()
        }
      }
    })
  },

  // 切换编辑模式
  toggleEditMode() {
    this.setData({ editMode: !this.data.editMode })
  },

  // 保存购物车到本地存储
  saveCart() {
    const { cartList } = this.data
    // 只保存必要字段
    const toSave = cartList.map(({ id, name, price, mainImage, stock, quantity, checked }) => ({
      id, name, price, mainImage, stock, quantity, checked
    }))
    wx.setStorageSync('cart', toSave)
  },

  // 去结算
  goCheckout() {
    const { cartList, totalCount } = this.data
    if (totalCount === 0) {
      wx.showToast({ title: '请选择要结算的商品', icon: 'none' })
      return
    }
    if (!app.isLogin()) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }
    // 将选中商品存入临时存储，跳转确认订单页
    const checkedItems = cartList.filter(item => item.checked).map(
      ({ id, name, price, mainImage, stock, quantity }) => ({ id, name, price, mainImage, stock, quantity })
    )
    wx.setStorageSync('buyNowItems', checkedItems)
    wx.navigateTo({ url: '/pages/order/confirm/index?from=cart' })
  },

  // 跳转商品详情
  goToProduct(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/product/detail/index?id=${id}` })
  },

  // 去逛逛（跳首页）
  goShopping() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
