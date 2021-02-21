//index.js
//获取应用实例
var Bmob = require('../../utils/Bmob-1.6.7.min.js')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() {
    wx.getStorage({
      key: 'userinfo',
      success: function(res) {
        wx.switchTab({
          url: '../home/home'
        })
      },
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        console.log('openid', res)
        let open_id = res.data
        const query = Bmob.Query('Users')
        query.equalTo('openid', '==', open_id)
        query.find().then(res => {
          if (res.length == 0) {
            const create_user = Bmob.Query('Users')
            create_user.set('openid', open_id)
            create_user.set('nickname', e.detail.userInfo.nickName)
            create_user.set('gender', e.detail.userInfo.gender ? '男' : '女')
            create_user.set('province', e.detail.userInfo.province)
            create_user.set('city', e.detail.userInfo.city)
            create_user.set('avatar', e.detail.userInfo.avatarUrl)
            create_user.save().then(res => {
              console.log(res);
              let user_id = res.objectId
              create_user.get(user_id).then(res => {
                console.log(res)
                wx.setStorage({
                  key: 'userinfo',
                  data: res
                })
                wx.switchTab({
                  url: '../home/home'
                })
              })
            }).catch(err => {
              console.log(err)
            })
          } else {
            let user_id = res[0].objectId
            const update_user = Bmob.Query('Users')
            update_user.set('id', user_id)
            update_user.set('nickname', e.detail.userInfo.nickName)
            update_user.set('gender', e.detail.userInfo.gender ? '男' : '女')
            update_user.set('province', e.detail.userInfo.province)
            update_user.set('city', e.detail.userInfo.city)
            update_user.set('avatar', e.detail.userInfo.avatarUrl)
            update_user.save().then(res => {
              console.log(res);
              update_user.get(user_id).then(res => {
                console.log(res)
                wx.setStorage({
                  key: 'userinfo',
                  data: res
                })
                wx.switchTab({
                  url: '../home/home'
                })
              })
            }).catch(err => {
              console.log(err)
            })
          }
        })
      },
    })
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})