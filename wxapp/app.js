const { fetchMe } = require('./utils/api')

App({
  globalData: {
    me: null,
    /** 待办角标数，各页更新后回写到 tabBar */
    pendingCount: 0
  },

  onLaunch: function () {
    this.refreshMe()
  },

  refreshMe: function () {
    const self = this
    return fetchMe().then(function (me) {
      self.globalData.me = me
      return me
    }).catch(function () {
      return null
    })
  },

  setPendingBadge: function (n) {
    this.globalData.pendingCount = n || 0
    try {
      if (n > 0) {
        wx.setTabBarBadge({ index: 2, text: String(n > 99 ? '99+' : n) })
      } else {
        wx.removeTabBarBadge({ index: 2 })
      }
    } catch (e) { /* 非 tab 页调用会失败，忽略 */ }
  }
})
