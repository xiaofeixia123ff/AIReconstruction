// pages/address/index.js - 地址列表页
Page({
  data: {
    addresses: [],
    mode: 'manage', // manage: 管理模式 | select: 选择模式（从确认订单页跳入）
    isEmpty: false,
  },

  onLoad(options) {
    const { mode = 'manage' } = options
    this.setData({ mode })
  },

  onShow() {
    this.loadAddresses()
  },

  // 加载地址列表
  loadAddresses() {
    const addresses = wx.getStorageSync('addressList') || []
    this.setData({ addresses, isEmpty: addresses.length === 0 })
  },

  // 新增地址
  goAdd() {
    wx.navigateTo({ url: '/pages/address/edit/index' })
  },

  // 编辑地址
  goEdit(e) {
    const { index } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/address/edit/index?index=${index}` })
  },

  // 删除地址
  deleteAddress(e) {
    const { index } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (!res.confirm) return
        const addresses = [...this.data.addresses]
        addresses.splice(index, 1)
        // 如果删除的是默认地址，则将第一个设为默认
        if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
          addresses[0].isDefault = true
        }
        wx.setStorageSync('addressList', addresses)
        // 同步更新默认地址缓存
        const defaultAddr = addresses.find(a => a.isDefault) || null
        wx.setStorageSync('defaultAddress', defaultAddr)
        this.setData({ addresses, isEmpty: addresses.length === 0 })
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  // 设为默认地址
  setDefault(e) {
    const { index } = e.currentTarget.dataset
    const addresses = this.data.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }))
    wx.setStorageSync('addressList', addresses)
    wx.setStorageSync('defaultAddress', addresses[index])
    this.setData({ addresses })
    wx.showToast({ title: '已设为默认', icon: 'success' })
  },

  // 选择地址（select 模式下）
  selectAddress(e) {
    if (this.data.mode !== 'select') return
    const { index } = e.currentTarget.dataset
    const address = this.data.addresses[index]
    // 通过 eventChannel 回传给确认订单页
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('selectAddress', address)
    wx.navigateBack()
  },
})
