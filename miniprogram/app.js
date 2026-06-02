// app.js
App({
  onLaunch: function () {
    this.globalData = {
      env: "",
      // 会员状态（demo 用本地缓存，后续接 API 后改为云端）
      member: this.loadMemberState()
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
  // 读取会员状态（含 7 天试用 + 订阅 + 自动续费）
  loadMemberState() {
    const saved = wx.getStorageSync('memberState') || {};
    let state = {
      isMember: saved.isMember || false,
      isTrial: saved.isTrial || false,
      trialStartAt: saved.trialStartAt || 0,
      planType: saved.planType || '',
      expireAt: saved.expireAt || 0,
      autoRenew: saved.autoRenew !== false,
      nextPlanAfterTrial: saved.nextPlanAfterTrial || 'monthly' // 试用结束默认转月付
    };
    // 自动转换：试用期结束 + 开启自动续费 → 转为月付订阅
    const now = Date.now();
    if (state.isTrial && now > state.expireAt) {
      if (state.autoRenew) {
        state = {
          ...state,
          isMember: true,
          isTrial: false,
          planType: state.nextPlanAfterTrial || 'monthly',
          expireAt: now + 30 * 86400000  // 月付从此刻起 30 天
        };
      } else {
        // 试用结束 + 关了自动续费 → 退回非会员
        state = { ...state, isMember: false, isTrial: false, planType: '', expireAt: 0 };
      }
      wx.setStorageSync('memberState', state);
    }
    // 普通订阅到期 + 关了续费 → 退回非会员
    if (!state.isTrial && state.isMember && state.expireAt > 0 && now > state.expireAt && !state.autoRenew) {
      state = { ...state, isMember: false, planType: '', expireAt: 0 };
      wx.setStorageSync('memberState', state);
    }
    return state;
  },
  saveMemberState(state) {
    this.globalData.member = state;
    wx.setStorageSync('memberState', state);
  },
  onPageNotFound() {
    wx.switchTab({
      url: "/pages/daily/index",
      fail() {
        wx.reLaunch({
          url: "/pages/daily/index",
        });
      },
    });
  },
});
