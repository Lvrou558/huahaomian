Page({
  data: {
    voiceMonitor: false,
    firstVisit: true,
    privacyModalVisible: false,
    localData: {
      audioSize: 12.4,
      lastCleanup: '2026-04-01',
      permissionCount: 7
    },
    deviceInfo: {
      connected: true,
      name: '床头监测仪 Pro',
      battery: 78,
      lastSync: '07:15'
    }
  },

  onShow() {
    // 首次进入时显示隐私承诺弹窗
    if (this.data.firstVisit) {
      this.setData({ privacyModalVisible: true });
    }
  },

  onVoiceSwitchChange(e) {
    const value = e.detail.value;
    if (value && this.data.firstVisit) {
      // 首次开启声音监测，显示隐私承诺
      this.setData({ privacyModalVisible: true });
    } else {
      this.setData({ voiceMonitor: value });
    }
  },

  closePrivacyModal() {
    this.setData({ privacyModalVisible: false });
  },

  agreePrivacy() {
    this.setData({ 
      voiceMonitor: true,
      firstVisit: false,
      privacyModalVisible: false
    });
    wx.setStorageSync('voiceMonitorEnabled', true);
    wx.setStorageSync('privacyAgreed', true);
  },

  disagreePrivacy() {
    this.setData({ 
      voiceMonitor: false,
      privacyModalVisible: false
    });
  },

  clearLocalData() {
    wx.showModal({
      title: '清除本地音频数据',
      content: '这将删除所有本地存储的音频识别数据，不影响睡眠监测核心功能。',
      confirmText: '清除',
      confirmColor: '#E57373',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'localData.audioSize': 0,
            'localData.lastCleanup': new Date().toISOString().split('T')[0]
          });
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  viewPermissionLog() {
    wx.showModal({
      title: '最近7天权限调用记录',
      content: '04/08 23:00-07:00 睡眠监测\n04/07 23:05-07:12 睡眠监测\n04/06 22:58-06:45 睡眠监测\n04/05 23:15-07:30 睡眠监测\n04/04 22:45-06:20 睡眠监测\n04/03 23:02-07:05 睡眠监测\n04/02 23:10-07:08 睡眠监测',
      showCancel: false
    });
  },

  disconnectDevice() {
    wx.showModal({
      title: '断开设备连接',
      content: '确定要断开与床头监测仪的连接吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'deviceInfo.connected': false
          });
          wx.showToast({
            title: '已断开',
            icon: 'success'
          });
        }
      }
    });
  },

  reconnectDevice() {
    wx.showLoading({ title: '搜索设备...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        'deviceInfo.connected': true
      });
      wx.showToast({
        title: '已连接',
        icon: 'success'
      });
    }, 1500);
  }
});