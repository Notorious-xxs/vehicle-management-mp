/**
 * 请求封装
 *
 * 后端用签名 Cookie（vh_sess）做会话，小程序 wx.request 不会自动维护 Cookie，
 * 所以这里自己把 Set-Cookie 里的 vh_sess 存下来，之后每个请求手动带上 Cookie 头。
 * 后端代码无需任何改动。
 */
const { API_BASE } = require('./config')

const COOKIE_KEY = 'vh_sess'
const USER_KEY = 'vh_me'

function getCookie() {
  try {
    return wx.getStorageSync(COOKIE_KEY) || ''
  } catch (e) {
    return ''
  }
}

function setCookieFromHeader(header) {
  if (!header) return
  // header 的 key 大小写不固定，统一小写找
  const lower = {}
  Object.keys(header).forEach(function (k) {
    lower[k.toLowerCase()] = header[k]
  })
  const raw = lower['set-cookie']
  if (!raw) return
  const list = Array.isArray(raw) ? raw : String(raw).split(/,(?=[^;]+=[^;]+)/)
  list.forEach(function (item) {
    const m = String(item).match(/(?:^|;\s*)vh_sess=([^;]+)/)
    if (m) {
      try {
        wx.setStorageSync(COOKIE_KEY, m[1])
      } catch (e) { /* 忽略 */ }
    }
  })
}

function clearSession() {
  try {
    wx.removeStorageSync(COOKIE_KEY)
    wx.removeStorageSync(USER_KEY)
  } catch (e) { /* 忽略 */ }
}

function api(path, options) {
  const opt = options || {}
  const method = opt.method || 'GET'
  const header = { 'Content-Type': 'application/json' }
  const cookie = getCookie()
  if (cookie) header.Cookie = 'vh_sess=' + cookie

  return new Promise(function (resolve, reject) {
    wx.request({
      url: API_BASE + '/api' + path,
      method: method,
      data: opt.data,
      header: header,
      timeout: 20000,
      success: function (res) {
        setCookieFromHeader(res.header)

        // 401 = 会话没有了，交给调用方跳登录
        if (res.statusCode === 401) {
          const err = new Error('未登录')
          err.needLogin = true
          reject(err)
          return
        }

        const body = res.data || {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body)
          return
        }

        // FastAPI 的报错在 detail 里，可能是字符串也可能是校验错误数组
        let msg = body.detail || body.message || ('HTTP ' + res.statusCode)
        if (Array.isArray(msg)) {
          msg = msg.map(function (x) { return x.msg || '' }).join('；') || '参数不合法'
        }
        reject(new Error(msg))
      },
      fail: function (e) {
        let msg = (e && e.errMsg) || '网络请求失败'
        if (msg.indexOf('domain list') >= 0 || msg.indexOf('not in domain') >= 0) {
          msg = '请求域名未配置：请把小程序的 request 合法域名加上，或开发工具里勾选「不校验合法域名」'
        } else if (msg.indexOf('timeout') >= 0) {
          msg = '请求超时，检查网络或服务器'
        }
        reject(new Error(msg))
      }
    })
  })
}

/** 取当前用户；未登录时返回 null（不抛错） */
function fetchMe() {
  return api('/me').then(function (me) {
    try {
      wx.setStorageSync(USER_KEY, me)
    } catch (e) { /* 忽略 */ }
    return me
  }).catch(function (e) {
    if (e.needLogin) return null
    throw e
  })
}

/** 页面级守卫：有会话返回 me，没有就自动跳登录页并返回 null */
function requireLogin() {
  return fetchMe().then(function (me) {
    if (!me) {
      wx.reLaunch({ url: '/pages/login/login' })
      return null
    }
    return me
  }).catch(function (e) {
    wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    return null
  })
}

function toast(msg) {
  wx.showToast({ title: String(msg || '').slice(0, 60), icon: 'none', duration: 2400 })
}

function confirm(content, title) {
  return new Promise(function (resolve) {
    wx.showModal({
      title: title || '确认',
      content: content,
      confirmColor: '#094828',
      success: function (r) { resolve(!!r.confirm) },
      fail: function () { resolve(false) }
    })
  })
}

module.exports = {
  API_BASE: API_BASE,
  api: api,
  fetchMe: fetchMe,
  requireLogin: requireLogin,
  clearSession: clearSession,
  toast: toast,
  confirm: confirm,
  USER_KEY: USER_KEY
}
