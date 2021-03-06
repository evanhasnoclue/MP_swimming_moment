// pages/home/home.js
var Bmob = require('../../utils/Bmob-1.6.7.min.js')
Page({
  /**
   * Page initial data
   */
  data: {
    moments: [],
    likes: [],
    comments: [],
    replies: [],
    default_input: "",
    comment: false,
    reply: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    let page = this;
    wx.getStorage({
      key: 'userinfo',
      success: function(res) {
        page.setData({
          userinfo: res.data
        })
      },
      fail: function(res) {
        wx.redirectTo({
          url: '../index/index',
        })
      }
    })
    const query_moments = Bmob.Query('Moments')
    query_moments.order("-createdAt")
    query_moments.limit(1000)
    query_moments.include('user_id')
    query_moments.find().then(res => {
      console.log(res)
      page.setData({
        moments: res
      })
    })
    const query_likes = Bmob.Query('Likes')
    query_likes.order("-createdAt")
    query_likes.limit(1000)
    query_likes.find().then(res => {
      console.log(res)
      page.setData({
        likes: res
      })
      wx.getStorage({
        key: 'userinfo',
        success: function(res) {
          let user_id = res.data.objectId
          query_likes.equalTo('user_id','==',user_id)
          query_likes.find().then(res => {
            let mylikes = res.map(x => x.objectId)
            page.setData({
              mylikes: mylikes.join(',')
            })
          })
        },
      })
    })
    const query_comments = Bmob.Query('Comments')
    query_comments.order("createdAt")
    query_comments.limit(1000)
    query_comments.find().then(res => {
      console.log(res)
      page.setData({
        comments: res
      })
    })
  },

  bindLike: function(e) {
    wx.showLoading({
      title: '请稍等',
    })
    console.log(e)
    let page = this
    let moment_id = e.target.id;
    let user_id = page.data.userinfo.objectId
    let user_name = page.data.userinfo.nickname
    const query = Bmob.Query('Likes')
    query.equalTo('moment_id', '==', moment_id)
    query.equalTo('user_id', '==', user_id)
    query.find().then(res => {
      if (res.length == 0) {
        const like = Bmob.Query('Likes')
        like.set('moment_id', moment_id)
        like.set('user_id', user_id)
        like.set('user_name', user_name)
        like.save().then(res => {
          console.log(res)
          const likes = Bmob.Query('Likes')
          likes.limit(1000)
          likes.order("-createdAt")
          likes.find().then(res => {
            wx.hideLoading()
            console.log(res)
            page.setData({
              likes: res
            })
          })
        }).catch(err => {
          console.log(err)
        })
      } else {
        const unlike = Bmob.Query('Likes')
        unlike.destroy(res[0].objectId).then(res => {
          console.log(res)
          const likes = Bmob.Query('Likes')
          likes.limit(1000)
          likes.order("-createdAt")
          likes.find().then(res => {
            wx.hideLoading()
            console.log(res)
            page.setData({
              likes: res
            })
          })
        }).catch(err => {
          console.log(err)
        })
      }

    })
  },

  bindComment: function(e) {
    let status = this.data.comment
    this.setData({
      comment: !status,
      moment_to_comment: e.target.id
    })
  },

  bindCancel: function() {
    this.setData({
      comment: false,
      reply: false
    })
  },

  bindSubmit: function(e) {
    wx.showLoading({
      title: '请稍等',
    })
    console.log(e)
    let moment_id = this.data.moment_to_comment
    let input = e.detail.value.text_input
    let page = this
    let user_id = page.data.userinfo.objectId;
    let user_name = page.data.userinfo.nickname;
    const comment = Bmob.Query('Comments')
    comment.set('moment_id', moment_id)
    comment.set('user_id', user_id)
    comment.set('user_name', user_name)
    comment.set('comment', input)
    comment.save().then(res => {
      const comments = Bmob.Query('Comments')
      comments.limit(1000)
      comments.order("-createdAt")
      comment.find().then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '回复成功！',
          icon: 'success',
          duration: 2000
        })
        page.setData({
          comments: res,
          comment: false,
          default_input: ''
        })
      })
    })
  },

  bindReply: function(e) {
    console.log(e)
    let page = this
    if (e.currentTarget.dataset.comment.user_id == page.data.userinfo.objectId) {

    } else {
      page.setData({
        reply: true,
        reply_to: e.currentTarget.dataset.comment
      })
    }
  },

  bindSubmitReply: function(e) {
    wx.showLoading({
      title: '请稍等',
    })
    let input = e.detail.value.text_input
    let moment_id = this.data.reply_to.moment_id
    let reply_to_id = this.data.reply_to.user_id
    let reply_to_name = this.data.reply_to.user_name
    let page = this
    let user_id = page.data.userinfo.objectId
    let user_name = page.data.userinfo.nickname
    const reply = Bmob.Query('Comments')
    reply.set('moment_id', moment_id)
    reply.set('user_id', user_id)
    reply.set('user_name', user_name)
    reply.set('comment', input)
    reply.set('reply_to_id', reply_to_id)
    reply.set('reply_to_name', reply_to_name)
    reply.save().then(res => {
      const replies = Bmob.Query('Comments')
      replies.limit(1000)
      replies.order("-createdAt")
      replies.find().then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '回复成功！',
          icon: 'success',
          duration: 2000
        })
        page.setData({
          comments: res,
          reply: false,
          default_input: ''
        })
      })
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    this.onLoad()
  },

  toRules: function() {
    wx.navigateTo({
      url: '../rules/rules',
    })
  },

  showPic: function(e) {
    console.log(e)
    let current = e.currentTarget.dataset.current
    let pics = e.currentTarget.dataset.pics.map(x => x.url)
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: pics // 需要预览的图片http链接列表
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {
 
  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})