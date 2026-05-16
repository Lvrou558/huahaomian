const AUDIO_TRACKS = [
  {
    key: "wood",
    label: "轻木鱼",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    key: "water",
    label: "小流水",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    key: "wind",
    label: "晚风声",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
  }
];

const FORTUNE_POOL = {
  top: [
    {
      title: "安眠上上签",
      poem: "枕上清风无俗扰，深睡绵长到天明",
      interpretation: "今夜睡眠质量拉满，深睡占比可期，晨起神清气爽。"
    },
    {
      title: "安眠上上签",
      poem: "月色入窗心自静，一觉安然到晓星",
      interpretation: "身心都在放松通道里，今晚有望一夜少醒、睡得更沉。"
    },
    {
      title: "安眠上上签",
      poem: "香暖夜色柔，梦甜到晨头",
      interpretation: "今夜身心放松得更彻底，深睡质量和晨起状态都值得期待。"
    }
  ],
  good: [
    {
      title: "好梦吉签",
      poem: "星河伴枕眠，安睡无牵绊",
      interpretation: "今晚入睡顺畅，夜里节奏平稳，小梦温柔。"
    },
    {
      title: "好梦吉签",
      poem: "灯火渐收声，晚风送好眠",
      interpretation: "睡前情绪可逐步回稳，作息和顺，醒来精神在线。"
    },
    {
      title: "好梦吉签",
      poem: "云软夜更轻，枕畔梦初成",
      interpretation: "今夜睡意来得更自然，少翻来覆去，整体睡感更舒适。"
    },
    {
      title: "好梦吉签",
      poem: "月白窗前静，心安梦自来",
      interpretation: "入睡会更平顺，夜间节律安稳，醒来精神更在线。"
    },
    {
      title: "好梦吉签",
      poem: "茶香轻入夜，好梦慢慢开",
      interpretation: "今晚会是一段温柔睡程，压力感下降，睡意更友好。"
    }
  ],
  calm: [
    {
      title: "安睡平签",
      poem: "心静即是福，安睡自然来",
      interpretation: "今晚保持平常心就很好，不焦虑睡意反而更容易抵达。"
    },
    {
      title: "安睡平签",
      poem: "慢慢入夜色，轻轻到梦乡",
      interpretation: "睡眠状态稳中向好，放下手机后会更快进入休息节奏。"
    },
    {
      title: "安睡平签",
      poem: "不急不扰心，平安即好眠",
      interpretation: "今晚按自己的节奏就好，越放松越容易睡得踏实。"
    },
    {
      title: "安睡平签",
      poem: "云淡月也柔，静卧自安休",
      interpretation: "睡眠质量以稳定为主，保持平常心就是最好的助眠法。"
    }
  ]
};

Page({
  data: {
    soundOn: true,
    tracks: AUDIO_TRACKS,
    currentTrack: "wood",
    isPlaying: false,
    wishText: "",
    incenseDone: false,
    bowDone: false,
    drawnToday: false,
    fortune: null,
    incenseAnimating: false,
    bowAnimating: false,
    drawAnimating: false,
    progressText: "完成 0/3 步"
  },

  onLoad() {
    this.restoreTodayFortune();
  },

  onShow() {
    this.ensureAudio();
    this.syncAudioState();
  },

  onHide() {
    if (this.audioCtx) {
      this.audioCtx.pause();
      this.setData({ isPlaying: false });
    }
  },

  onUnload() {
    this.destroyAudio();
  },

  ensureAudio() {
    if (this.audioCtx) return;
    const ctx = wx.createInnerAudioContext();
    ctx.loop = true;
    ctx.autoplay = false;
    ctx.volume = 0.15;
    ctx.obeyMuteSwitch = false;
    ctx.onPlay(() => this.setData({ isPlaying: true }));
    ctx.onPause(() => this.setData({ isPlaying: false }));
    ctx.onStop(() => this.setData({ isPlaying: false }));
    ctx.onError(() => {
      this.setData({ isPlaying: false });
      wx.showToast({ title: "轻音加载失败", icon: "none" });
    });
    this.audioCtx = ctx;
  },

  destroyAudio() {
    if (!this.audioCtx) return;
    this.audioCtx.stop();
    this.audioCtx.destroy();
    this.audioCtx = null;
  },

  syncAudioState() {
    if (!this.audioCtx) return;
    const currentTrack = AUDIO_TRACKS.find((item) => item.key === this.data.currentTrack) || AUDIO_TRACKS[0];
    if (this.audioCtx.src !== currentTrack.url) {
      this.audioCtx.src = currentTrack.url;
    }
    if (this.data.soundOn) {
      this.audioCtx.play();
    } else {
      this.audioCtx.pause();
    }
  },

  updateProgress() {
    const stepsDone = [
      this.data.incenseDone,
      this.data.bowDone,
      this.data.drawnToday
    ].filter(Boolean).length;
    this.setData({
      progressText: `完成 ${stepsDone}/3 步`
    });
  },

  getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  restoreTodayFortune() {
    const key = `temple-fortune-${this.getTodayKey()}`;
    const saved = wx.getStorageSync(key);
    if (!saved) return;
    this.setData({
      incenseDone: true,
      bowDone: true,
      drawnToday: true,
      fortune: saved
    }, () => this.updateProgress());
  },

  onWishInput(e) {
    const input = (e.detail.value || "").trim();
    this.setData({
      wishText: input.slice(0, 10)
    });
  },

  toggleSound() {
    const next = !this.data.soundOn;
    this.setData({ soundOn: next }, () => {
      this.syncAudioState();
    });
  },

  switchTrack(e) {
    const key = e.currentTarget.dataset.key;
    if (!key || key === this.data.currentTrack) return;
    this.setData({ currentTrack: key }, () => {
      this.syncAudioState();
      wx.showToast({ title: "已切换轻音", icon: "none" });
    });
  },

  offerIncense() {
    if (this.data.incenseDone) {
      wx.showToast({ title: "安眠香已点好", icon: "none" });
      return;
    }
    this.setData({
      incenseDone: true,
      incenseAnimating: true
    }, () => {
      this.updateProgress();
    });
    setTimeout(() => {
      this.setData({ incenseAnimating: false });
    }, 1300);
  },

  doBow() {
    if (!this.data.incenseDone) {
      wx.showToast({ title: "先上一炷安眠香", icon: "none" });
      return;
    }
    if (this.data.bowDone) {
      wx.showToast({ title: "礼成，心已静", icon: "none" });
      return;
    }
    this.setData({
      bowDone: true,
      bowAnimating: true
    }, () => {
      this.updateProgress();
    });
    setTimeout(() => {
      this.setData({ bowAnimating: false });
    }, 1000);
  },

  pickFortuneLevel() {
    const roll = Math.random();
    if (roll < 0.1) return "top";
    if (roll < 0.7) return "good";
    return "calm";
  },

  drawFortune() {
    if (!this.data.bowDone) {
      wx.showToast({ title: "先轻轻拜一拜", icon: "none" });
      return;
    }
    if (this.data.drawnToday) {
      wx.showToast({ title: "今天已经抽过签啦", icon: "none" });
      return;
    }

    const level = this.pickFortuneLevel();
    const pool = FORTUNE_POOL[level];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const wishText = this.data.wishText || "愿今夜安睡，无梦无醒，晨起精神";
    const result = {
      ...picked,
      level,
      wishText
    };

    this.setData({
      drawnToday: true,
      drawAnimating: true,
      fortune: result
    }, () => {
      this.updateProgress();
    });

    wx.setStorageSync(`temple-fortune-${this.getTodayKey()}`, result);
    setTimeout(() => {
      this.setData({ drawAnimating: false });
    }, 1200);
  },

  startSleepMonitor() {
    wx.showToast({
      title: "放下手机，安心入睡吧",
      icon: "none"
    });
    setTimeout(() => {
      wx.navigateBack({
        fail: () => {
          wx.switchTab({ url: "/pages/daily/index" });
        }
      });
    }, 500);
  }
});
