// pages/create/create.js
var Bmob = require('../../utils/Bmob-1.6.7.min.js')
Page({

  /**
   * Page initial data
   */
  data: {
    photoChoose: [],
    default: '',
    textNumber: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  gotoShow: function () {
    var _this = this
    wx.chooseImage({
      count: 9, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        // success
        console.log(res)
        _this.setData({
          photo: res.tempFilePaths
        })

        console.log(_this.data.photo[0])
        var tempFilePaths = res.tempFilePaths
        var file;
        for (let item of tempFilePaths) {
          console.log('itemn', item)
          file = Bmob.File(item.substr(-10), item);
        }
        file.save().then(res => {
          console.log(res.length);
          console.log(res);
          _this.setData({
            photoChoose: res
          })
          console.log(_this.data)
        })

      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },

  deletePhoto: function (e) {
    console.log(e);
    let idx = parseInt(e.target.id);
    let photos = this.data.photoChoose;
    photos.splice(idx, 1);
    this.setData({
      photoChoose: photos
    })
  },

  bindSubmit: function (e) {
    wx.showLoading({
      title: '请稍等',
    })
    let page = this
    wx.getStorage({
      key: 'userinfo',
      success: function(res) {
        const pointer = Bmob.Pointer('Users')
        const poiID = pointer.set(res.data.objectId)
        const moment = Bmob.Query('Moments')
        moment.set('user_id',poiID)
        moment.set('text',e.detail.value.text_input)
        moment.set('photos',page.data.photoChoose)
        moment.set('likes',[])
        moment.set('comments',[])
        moment.save().then(res => {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '发布成功！',
            icon: 'success',
            duration: 2000
          })
          page.setData({
            default: '',
            textNumber: 0,
            photoChoose: []
          })
          wx.switchTab({
            url: '../home/home',
          })
        }).catch(err => {
          console.log(err)
        })
      },
    })
  },

  countText: function (e) {
    this.setData({
      textNumber: e.detail.value.length
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})