// pages/address/edit/index.js - 地址编辑页
const { isValidPhone } = require('../../../utils/util')

Page({
  data: {
    editIndex: -1, // -1 表示新增，>=0 表示编辑
    form: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
    },
    // 省市区选择器数据
    regionValue: ['广东省', '广州市', '天河区'],
  },

  // 调用微信定位自动填充地址
  autoLocate() {
    wx.showLoading({ title: '定位中...' })
    wx.chooseLocation({
      success: (res) => {
        wx.hideLoading()
        // res.address 格式：省市区+街道，res.name 是地点名称
        // 尝试从 address 中解析省市区
        const address = res.address || ''
        const name = res.name || ''

        // 微信返回的 address 格式通常为 "广东省广州市天河区xxx路"
        // 用正则尝试解析省市区
        let province = '', city = '', district = '', detail = ''
        const reg = /^(.*?省|.*?自治区|.*?市)(.*?市|.*?自治州|.*?地区|.*?盟)?(.*?区|.*?县|.*?市)?(.*)/
        const match = address.match(reg)
        if (match) {
          province = match[1] || ''
          city = match[2] || ''
          district = match[3] || ''
          detail = (match[4] || '') + (name ? ' ' + name : '')
        } else {
          // 解析失败则直接填入详细地址
          detail = address + (name ? ' ' + name : '')
        }

        // 直辖市处理：北京市/上海市/天津市/重庆市
        if (!city && province) {
          const municipalities = ['北京市', '上海市', '天津市', '重庆市']
          if (municipalities.includes(province)) {
            city = province
          }
        }

        const regionValue = [province, city, district].filter(Boolean)
        this.setData({
          'form.province': province,
          'form.city': city,
          'form.district': district,
          'form.detail': detail.trim(),
          regionValue: regionValue.length === 3 ? regionValue : this.data.regionValue,
        })
        wx.showToast({ title: '定位成功', icon: 'success' })
      },
      fail: (err) => {
        wx.hideLoading()
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限，以便自动填写地址',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting()
            }
          })
        } else if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '定位失败，请手动填写', icon: 'none' })
        }
      }
    })
  },

  onLoad(options) {
    const { index } = options
    if (index !== undefined) {
      // 编辑模式：加载已有地址
      const editIndex = parseInt(index)
      const addresses = wx.getStorageSync('addressList') || []
      const addr = addresses[editIndex]
      if (addr) {
        this.setData({
          editIndex,
          form: { ...addr },
          regionValue: [addr.province || '', addr.city || '', addr.district || ''],
        })
      }
      wx.setNavigationBarTitle({ title: '编辑地址' })
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' })
    }
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ 'form.phone': e.detail.value })
  },

  // 省市区选择
  onRegionChange(e) {
    const [province, city, district] = e.detail.value
    this.setData({
      regionValue: e.detail.value,
      'form.province': province,
      'form.city': city,
      'form.district': district,
    })
  },

  // 详细地址输入
  onDetailInput(e) {
    this.setData({ 'form.detail': e.detail.value })
  },

  // 切换默认地址
  toggleDefault() {
    this.setData({ 'form.isDefault': !this.data.form.isDefault })
  },

  // 保存地址
  saveAddress() {
    const { form, editIndex } = this.data

    // 表单校验
    if (!form.name.trim()) {
      wx.showToast({ title: '请填写收货人姓名', icon: 'none' })
      return
    }
    if (!isValidPhone(form.phone)) {
      wx.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return
    }
    if (!form.province || !form.city || !form.district) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' })
      return
    }
    if (!form.detail.trim()) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }

    let addresses = wx.getStorageSync('addressList') || []

    const newAddr = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail.trim(),
      isDefault: form.isDefault,
    }

    if (editIndex >= 0) {
      // 编辑模式：替换
      addresses[editIndex] = newAddr
    } else {
      // 新增模式：追加
      addresses.push(newAddr)
    }

    // 如果设为默认，则取消其他地址的默认状态
    if (newAddr.isDefault) {
      const targetIndex = editIndex >= 0 ? editIndex : addresses.length - 1
      addresses = addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === targetIndex,
      }))
    }

    // 如果只有一个地址，自动设为默认
    if (addresses.length === 1) {
      addresses[0].isDefault = true
    }

    wx.setStorageSync('addressList', addresses)

    // 同步更新默认地址缓存
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0] || null
    wx.setStorageSync('defaultAddress', defaultAddr)

    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 800)
  },
})
