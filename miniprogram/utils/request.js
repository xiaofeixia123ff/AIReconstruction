// utils/request.js - 统一网络请求封装

const app = getApp()

// loading 计数器，解决并发请求时 showLoading/hideLoading 不配对问题
let loadingCount = 0

const showLoading = () => {
  if (loadingCount === 0) {
    wx.showLoading({ title: '加载中...', mask: true })
  }
  loadingCount++
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    wx.hideLoading()
  }
}

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（不含 baseUrl）
 * @param {string} options.method - 请求方法（GET/POST/PUT/DELETE）
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.auth - 是否需要鉴权（默认：true）
 * @param {boolean} options.loading - 是否显示加载中（默认：true）
 */
const request = (options = {}) => {
  const {
    url,
    method = 'GET',
    data = {},
    auth = true,
    loading = true
  } = options

  if (loading) {
    showLoading()
  }

  const header = {
    'Content-Type': 'application/json'
  }

  // 如果需要鉴权则添加 token
  if (auth) {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header,
      success(res) {
        if (loading) hideLoading()

        const { statusCode, data: resData } = res
        console.log(`[Request] ${method} ${url} → ${statusCode}`, resData)

        if (statusCode === 200 || statusCode === 201) {
          resolve(resData)
        } else if (statusCode === 401) {
          // token 过期，跳转登录
          wx.hideLoading()
          loadingCount = 0
          app.logout()
          wx.navigateTo({ url: '/pages/login/index' })
          reject(new Error('登录已过期，请重新登录'))
        } else {
          const msg = resData?.message || '请求失败'
          wx.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail(err) {
        if (loading) hideLoading()
        const isTimeout = err?.errMsg?.includes('timeout')
        wx.showToast({ title: isTimeout ? '请求超时，请检查网络' : '网络错误，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

// GET 请求
const get = (url, data = {}, options = {}) => {
  return request({ url, method: 'GET', data, ...options })
}

// POST 请求
const post = (url, data = {}, options = {}) => {
  return request({ url, method: 'POST', data, ...options })
}

// PUT 请求
const put = (url, data = {}, options = {}) => {
  return request({ url, method: 'PUT', data, ...options })
}

// DELETE 请求
const del = (url, data = {}, options = {}) => {
  return request({ url, method: 'DELETE', data, ...options })
}

module.exports = { request, get, post, put, del }
