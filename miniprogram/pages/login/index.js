// pages/login/index.js
const { authApi } = require('../../utils/api')

const app = getApp()

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 已登录则返回上一页
    if (app.isLogin()) {
      wx.navigateBack()
    }
  },

  // 微信一键登录
  async handleWxLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      // 第一步：获取 wx.login code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })

      // 第二步：发送 code 到后端换取 token
      const res = await authApi.wxLogin({
        code: loginRes.code,
      })

      // 第三步：保存 token 和用户信息
      const loginData = res.data || res
      if (loginData.access_token) {
        app.globalData.token = loginData.access_token
        app.globalData.userInfo = loginData.user || {}
        wx.setStorageSync('token', loginData.access_token)
        wx.setStorageSync('userInfo', loginData.user || {})

        wx.showToast({ title: '登录成功', icon: 'success' })

        setTimeout(() => {
          // 返回上一页或跳转到个人中心
          const pages = getCurrentPages()
          if (pages.length > 1) {
            wx.navigateBack()
          } else {
            wx.switchTab({ url: '/pages/profile/index' })
          }
        }, 1000)
      } else {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    } catch (err) {
      console.error('登录失败完整信息：', JSON.stringify(err), err)
      wx.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳过登录（游客模式）
  handleSkip() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({ url: '/pages/home/index' })
    }
  }
})
