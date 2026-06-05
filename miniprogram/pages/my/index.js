const BED_AWAY_OPTIONS = ["1分钟", "3分钟", "5分钟", "10分钟", "15分钟", "30分钟"];
const HR_STAT_OPTIONS = ["5分钟", "10分钟", "15分钟", "30分钟", "60分钟"];
const HR_LOW_OPTIONS = Array.from({ length: 31 }, (_, i) => `${i + 35}`); // 35-65
const HR_HIGH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${i + 100}`); // 100-140
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "15", "30", "45"];

Page({
  data: {
    deviceInfo: {
      name: "睡眠监测仪X2",
      connected: true,
      battery: 82,
      lastSync: "今早 07:48"
    },
    activeTab: "settings",
    currentView: "main",
    // 子页返回上一级用：记录进入子页时的父视图（main / deviceDetail）
    parentView: "main",

    currentDeviceId: "X2LTE_S01B02N847",
    currentDevice: null, // 由 onLoad / enterDeviceDetail 计算填充

    // 账号信息（手机号登录；未设置昵称时显示脱敏手机号）
    accountInfo: {
      phone: "13800138000",       // 完整手机号（仅本地存储）
      maskPhone: "138****8000",
      nickname: "138****8000",    // 默认显示脱敏手机号，用户可编辑为自定义昵称
      avatar: "👤",
      gender: "未设置",            // 男 / 女 / 不便透露 / 未设置
      birthday: "",                 // YYYY-MM-DD
      wechatBound: false
    },

    // 头像可选 emoji 池
    avatarOptions: ["👤", "😀", "😎", "🧑", "👨", "👩", "👴", "👵", "🧓", "🐱", "🐶", "🦊", "🌸", "🌟", "💪"],

    // 编辑昵称底部弹层
    editingNickname: false,
    nicknameDraft: "",

    // 头像选择弹层
    avatarPicker: { visible: false },

    // 性别 actionsheet
    genderPicker: { visible: false },

    // 修改手机号 3 步流程
    phoneChange: {
      visible: false,
      step: 1,          // 1=验证旧号 2=输入新号 3=验证新号
      currentCode: "",
      newPhone: "",
      newCode: "",
      countdown: 0      // 验证码倒计时秒数（0 = 可发送）
    },

    // 注销账号 二次确认
    accountClose: { visible: false, step: 1 },

    // 会员状态（从 globalData 同步）
    member: { isMember: false, isTrial: false, planType: '', expireAt: 0, autoRenew: true },
    memberStatusText: '',
    memberExpireText: '',

    // 设备菜单：Level 2 设备详情页内展示（精简为 3 项核心 + 底部解绑按钮）
    deviceMenu: [
      { key: "realtime", icon: "📡", iconBg: "#dff4ff", title: "实时" },
      { key: "user",     icon: "👤", iconBg: "#ece7ff", title: "被监测人信息" },
      { key: "sim",      icon: "📅", iconBg: "#ffe1e1", title: "4G卡信息" }
    ],
    // 通用菜单：Level 1 主页（账号级别，与具体设备无关）
    generalMenu: [
      { key: "account",  icon: "🔐", iconBg: "#fff1de", title: "账号与服务", subtitle: "账号管理、会员服务等" },
      { key: "contact",  icon: "☎️", iconBg: "#e8f4ec", title: "联系我们",   subtitle: "电话、邮箱、在线客服等" },
      { key: "feedback", icon: "💬", iconBg: "#e3f0ff", title: "问题反馈",   subtitle: "意见反馈与建议" },
      { key: "logout",   icon: "↩️", iconBg: "#fde7e7", title: "退出登录",   subtitle: "安全退出当前账号" }
    ],

    // 实时监测（demo 数据：连接 API 后实时推送替换 series）
    realtimeData: {
      onlineStatus: "在线",
      inBed: "在床",          // 离床 / 在床
      radarSignal: 10,        // 0-10
      breathRate: 7,
      breathStatus: "正常",   // 正常 / 偏低 / 偏高
      heartRate: 68,
      heartStatus: "正常",
      // 60 秒滚动窗口：每秒一个采样
      breathSeries: [12,11,11,12,11,10,10,11,11,10,10,9,9,10,9,8,8,9,9,10,11,11,12,12,11,11,10,10,11,10,9,8,8,7,7,7,8,8,9,8,7,7,8,9,10,9,8,8,7,7,8,8,7,7,8,8,7,7,7,8],
      heartSeries: [64,64,64,64,65,65,64,64,65,65,65,65,64,65,65,66,66,65,66,66,66,67,67,66,67,67,67,67,67,68,67,67,68,68,67,68,68,68,68,68,67,68,68,68,68,68,68,68,68,67,67,68,68,68,68,68,68,68,68,68]
    },

    // 我的设备（支持多台，currentDeviceId 标识当前选中）
    boundDevices: [
      {
        id: "X2LTE_S01B02N847",
        name: "睡眠监测仪X2",
        alias: "",         // 用户自定义昵称（空则用 name）
        sn: "X2LTE_S01B02N847",
        userName: "吕柔",
        userAge: 19,
        online: true
      }
    ],

    // 添加设备
    addDeviceState: {
      step: "checkBluetooth", // checkBluetooth / searching / found / error
      bluetoothOpen: false,
      searching: false,
      foundDevices: []
    },

    // 设备自适应
    adaptData: {
      noPersonValue: 4095,
      noPersonTime: "2026/04/26 20:11:58",
      withPersonValue: 4095,
      withPersonTime: "2026/05/19 06:54:25"
    },
    adapting: false,

    // 监测参数
    monitorParams: {
      reportStartHour: "19", reportStartMin: "00",
      reportEndHour: "11",  reportEndMin: "30",
      bedAwayTime: "1分钟",
      hrStatLength: "10分钟"
    },

    // 被监测人信息
    userInfo: {
      // 基础信息
      name: "吕柔",
      age: 19,
      gender: "女",
      birthDate: "2006-08",
      height: 152,
      weight: 45,
      bmi: "19.5",        // 自动计算 BMI = 体重 / (身高/100)^2
      bmiLevel: "正常",   // 偏瘦 <18.5 / 正常 18.5-24 / 超重 24-28 / 肥胖 >28

      // 健康史
      chronic: "--",           // 慢性疾病
      cardiovascular: "无",    // 心血管病史（高血压/冠心病/心律失常等）
      familyHistory: "无",     // 家族病史
      allergyHistory: "无",    // 过敏史
      surgeryHistory: "无",    // 手术史
      currentMedication: "无", // 当前用药

      // 生活习惯（影响睡眠/心脏）
      smokingHabit: "不吸烟",  // 不吸烟 / 偶尔 / 经常
      drinkingHabit: "不饮酒", // 不饮酒 / 偶尔 / 经常
      caffeineHabit: "偶尔",   // 不喝咖啡因 / 偶尔 / 每日
      exerciseFreq: "每周 1-2 次", // 不运动 / 每周 1-2 次 / 每周 3+ 次

      // 睡眠环境
      isDisabled: "否",
      sleepEnv: "单人睡",
      mattressThickness: 10,
      mattressWidth: 200
    },
    editingUser: false,
    userEditDraft: null,

    // 4G 卡（物联卡）
    simInfo: {
      iccid: "8986112521009047015",
      operator: "电信",
      status: "正常",
      remainingTraffic: "247MB",
      remainingDays: 346
    },

    // 设备详情
    deviceDetail: {
      firmware: "11.2.83",
      alias: "睡眠监测仪X2"
    },

    // 预警设置（3 类预警）
    alertConfig: {
      emergencyPhone: "",
      // 心率预警
      hrEnabled: false,
      hrStartHour: "22", hrStartMin: "00",
      hrEndHour: "07",   hrEndMin: "00",
      hrLow: 50,
      hrHigh: 125,
      hrWechat: false,
      hrCall: false,
      hrSms: false,
      // 呼吸率预警
      brEnabled: false,
      brStartHour: "22", brStartMin: "00",
      brEndHour: "07",   brEndMin: "00",
      brLow: 6,
      brHigh: 25,
      brWechat: false,
      brCall: false,
      brSms: false,
      // 夜间离床预警
      bedEnabled: false,
      bedStartHour: "00", bedStartMin: "00",
      bedStartDay: "次日",
      bedEndHour: "05",   bedEndMin: "00",
      bedDuration: "离床时长 30 分钟",
      bedWechat: false,
      bedCall: false,
      bedSms: false
    },

    // 分享设备
    shareList: [
      { id: "s1", avatar: "👨", name: "爸爸", phone: "138****8821", joinedAt: "2025-12-15" },
      { id: "s2", avatar: "👩", name: "妈妈", phone: "139****0042", joinedAt: "2025-12-15" }
    ],

    // 通用单列选择器（自定义底部弹层）
    picker: {
      visible: false, field: "", title: "", options: [], value: ""
    },

    // 时间选择器（小时×分钟两列）
    timePicker: {
      visible: false, field: "", title: "", hour: "00", minute: "00"
    }
  },

  onLoad() {
    this.refreshAge();
    // 首次同步 userInfo 到 storage（供长期页心脏年龄等使用）
    wx.setStorageSync('userInfo', this.data.userInfo);
    // 初始化全局当前设备
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.currentDeviceId = this.data.currentDeviceId;
    }
    // 同步设备菜单徽章「已绑定 N 台」 + 当前设备 + 会员状态
    this.refreshAccountMenuBadge();
    this.refreshCurrentDevice();
    this.refreshMemberState();
  },

  onShow() {
    this.refreshMemberState();
  },

  refreshMemberState() {
    const app = getApp();
    const m = (app && app.globalData && app.globalData.member) || {
      isMember: false, isTrial: false, planType: '', expireAt: 0, autoRenew: true
    };
    let statusText = '未开通 · 解锁完整长期数据与声音监测';
    let expireText = '';
    if (m.isTrial) {
      const daysLeft = Math.max(0, Math.ceil((m.expireAt - Date.now()) / 86400000));
      statusText = `✨ 免费试用中（剩 ${daysLeft} 天）`;
      expireText = `试用至 ${this.formatDate(m.expireAt)}`;
    } else if (m.isMember) {
      const planName = m.planType === 'yearly' ? '年度会员' : '月度会员';
      statusText = `👑 ${planName} · 已开通`;
      expireText = `到期 ${this.formatDate(m.expireAt)}`;
    }
    this.setData({ member: m, memberStatusText: statusText, memberExpireText: expireText });
  },

  formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 进入会员订阅页（账号级别 → 返回回主页）
  gotoMembership() {
    this.setData({ currentView: 'membership', parentView: 'main' });
  },

  // ========== 实时页：进入时绘制曲线 ==========
  // navigateTo 调用前先存原逻辑，进入 realtime 时延迟绘图
  onCurrentViewChange(view) {
    if (view === 'realtime') {
      // 等 DOM 渲染后绘制
      setTimeout(() => {
        this.drawRtBreathChart();
        this.drawRtHeartChart();
      }, 80);
    }
  },

  // 绘制实时呼吸曲线
  drawRtBreathChart() {
    this.drawRtLineChart('#rtBreathChart', this.data.realtimeData.breathSeries, {
      yMin: 5, yMax: 25, ySteps: [5, 10, 15, 20, 25],
      lineColor: '#58c7f5', fillColor: 'rgba(88, 199, 245, 0.18)'
    });
  },
  drawRtHeartChart() {
    this.drawRtLineChart('#rtHeartChart', this.data.realtimeData.heartSeries, {
      yMin: 60, yMax: 80, ySteps: [60, 65, 70, 75, 80],
      lineColor: '#58c7f5', fillColor: 'rgba(88, 199, 245, 0.18)'
    });
  },

  // 通用实时折线图绘制（60s 滚动窗口 · Catmull-Rom 平滑 · 渐变填充）
  drawRtLineChart(selector, series, opt) {
    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const cssW = res[0].width;
        const cssH = res[0].height;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);

        // 内边距
        const padL = 40, padR = 12, padT = 8, padB = 28;
        const plotW = cssW - padL - padR;
        const plotH = cssH - padT - padB;
        const { yMin, yMax, ySteps, lineColor, fillColor } = opt;

        // Y 轴标签 + 网格虚线
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#9aa8a2';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#e8eef0';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ySteps.forEach((val) => {
          const y = padT + plotH - ((val - yMin) / (yMax - yMin)) * plotH;
          ctx.fillText(String(val), padL - 6, y);
          ctx.beginPath();
          ctx.moveTo(padL, y);
          ctx.lineTo(cssW - padR, y);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // X 轴标签
        const xTicks = [{ t: '60s', i: 0 }, { t: '50s', i: 10 }, { t: '40s', i: 20 },
                       { t: '30s', i: 30 }, { t: '20s', i: 40 }, { t: '10s', i: 50 }, { t: '0s', i: 59 }];
        ctx.fillStyle = '#9aa8a2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const n = series.length;
        xTicks.forEach(({ t, i }) => {
          const x = padL + (i / (n - 1)) * plotW;
          ctx.fillText(t, x, cssH - 8);
        });

        // 计算所有数据点
        const points = series.map((v, i) => ({
          x: padL + (i / (n - 1)) * plotW,
          y: padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH
        }));

        // 填充渐变（曲线下方半透明蓝）
        const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
        grad.addColorStop(0, fillColor);
        grad.addColorStop(1, 'rgba(88, 199, 245, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(points[0].x, padT + plotH);
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          // Catmull-Rom → Bezier
          const p0 = points[i - 2] || points[i - 1];
          const p1 = points[i - 1];
          const p2 = points[i];
          const p3 = points[i + 1] || points[i];
          const c1x = p1.x + (p2.x - p0.x) / 6;
          const c1y = p1.y + (p2.y - p0.y) / 6;
          const c2x = p2.x - (p3.x - p1.x) / 6;
          const c2y = p2.y - (p3.y - p1.y) / 6;
          ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
        }
        ctx.lineTo(points[points.length - 1].x, padT + plotH);
        ctx.closePath();
        ctx.fill();

        // 描边曲线
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 2] || points[i - 1];
          const p1 = points[i - 1];
          const p2 = points[i];
          const p3 = points[i + 1] || points[i];
          const c1x = p1.x + (p2.x - p0.x) / 6;
          const c1y = p1.y + (p2.y - p0.y) / 6;
          const c2x = p2.x - (p3.x - p1.x) / 6;
          const c2y = p2.y - (p3.y - p1.y) / 6;
          ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
        }
        ctx.stroke();
      });
  },

  // 刷新"我的设备"菜单右侧的"已绑定 N 台"徽章
  refreshAccountMenuBadge() {
    const count = (this.data.boundDevices || []).length;
    const accountMenu = this.data.accountMenu.map((it) =>
      it.key === 'myDevice' ? { ...it, badge: `已绑定 ${count} 台` } : it
    );
    this.setData({ accountMenu });
  },

  // 根据 currentDeviceId 同步 currentDevice 对象
  refreshCurrentDevice() {
    const cur = (this.data.boundDevices || []).find((d) => d.id === this.data.currentDeviceId);
    this.setData({ currentDevice: cur || null });
  },

  // ====== 主页 Tab / 导航 ======
  selectTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  navigateTo(e) {
    const view = e.currentTarget.dataset.view;
    if (view === "logout") return this.confirmLogout();
    if (view === "feedback") {
      wx.showToast({ title: '该功能开发中', icon: 'none' });
      return;
    }
    // 记住当前父视图，方便子页返回
    // 设备级子页（deviceMenu 中的项 + device 设备信息页）父级为 deviceDetail
    // 账号级子页（account/contact/membership 等）父级为 main
    const deviceLevelViews = ['realtime', 'user', 'adapt', 'params', 'sim', 'alert', 'share', 'more', 'device'];
    const parentView = deviceLevelViews.includes(view) ? 'deviceDetail' : 'main';
    this.setData({ currentView: view, parentView }, () => {
      this.onCurrentViewChange(view);
    });
  },

  // 通用返回上一级
  goBack() {
    const { currentView, parentView } = this.data;
    if (currentView === 'deviceDetail') {
      this.setData({ currentView: 'main' });
      return;
    }
    // 子页返回到记录的 parentView（main 或 deviceDetail）
    this.setData({
      currentView: parentView || 'main',
      editingUser: false,
      userEditDraft: null
    });
  },

  // 兼容旧调用：backToMain 强制回主页
  backToMain() {
    this.setData({ currentView: "main", parentView: "main", editingUser: false, userEditDraft: null });
  },

  // 主页点击设备卡 → 进入 Level 2 设备详情
  enterDeviceDetail(e) {
    const id = e.currentTarget.dataset.id;
    const target = this.data.boundDevices.find((d) => d.id === id);
    if (!target) return;
    this.setData({
      currentDeviceId: id,
      currentDevice: target,
      currentView: 'deviceDetail',
      parentView: 'main'
    });
    // 同步全局，让 每日 / 长期 tab 下次进入时使用此设备
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.currentDeviceId = id;
      app.globalData.needRefreshDeviceData = true;
    }
  },

  // 旧 selectDevice 保留（myDevice 子页使用，仅切换 currentDeviceId）
  selectDevice(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentDeviceId) return;
    const target = this.data.boundDevices.find((d) => d.id === id);
    if (!target) return;
    this.setData({
      currentDeviceId: id,
      currentDevice: target
    });
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.currentDeviceId = id;
      app.globalData.needRefreshDeviceData = true;
    }
    const displayName = (target.alias || target.name) + (target.userName ? ` · ${target.userName}` : '');
    wx.showToast({ title: `已切换到 ${displayName}`, icon: 'none', duration: 1800 });
  },

  // ========== 我的账户编辑 ==========

  // 主页账号卡 → 进入"我的账户"编辑页（Level 3，从 main 进入）
  editAccountName() {
    this.setData({ currentView: 'accountEdit', parentView: 'main' });
  },

  // —— 头像选择 ——
  openAvatarPicker() {
    this.setData({ 'avatarPicker.visible': true });
  },
  closeAvatarPicker() {
    this.setData({ 'avatarPicker.visible': false });
  },
  selectAvatar(e) {
    this.setData({
      'accountInfo.avatar': e.currentTarget.dataset.avatar,
      'avatarPicker.visible': false
    });
    wx.showToast({ title: '头像已更换', icon: 'success', duration: 1200 });
  },

  // —— 昵称编辑 ——
  openNicknameEdit() {
    this.setData({
      editingNickname: true,
      nicknameDraft: this.data.accountInfo.nickname
    });
  },
  onNicknameDraftInput(e) {
    this.setData({ nicknameDraft: e.detail.value });
  },
  cancelNicknameEdit() {
    this.setData({ editingNickname: false });
  },
  saveNickname() {
    const v = (this.data.nicknameDraft || '').trim();
    if (v.length < 2) {
      wx.showToast({ title: '昵称至少 2 个字符', icon: 'none' });
      return;
    }
    if (v.length > 20) {
      wx.showToast({ title: '昵称最多 20 个字符', icon: 'none' });
      return;
    }
    this.setData({
      'accountInfo.nickname': v,
      editingNickname: false
    });
    wx.showToast({ title: '昵称已更新', icon: 'success', duration: 1200 });
  },

  // —— 性别 ActionSheet ——
  openGenderPicker() {
    wx.showActionSheet({
      itemList: ['男', '女', '不便透露'],
      success: (res) => {
        const g = ['男', '女', '不便透露'][res.tapIndex];
        this.setData({ 'accountInfo.gender': g });
        wx.showToast({ title: '已保存', icon: 'success', duration: 1000 });
      }
    });
  },

  // —— 生日 picker change ——
  onBirthdayChange(e) {
    this.setData({ 'accountInfo.birthday': e.detail.value });
    wx.showToast({ title: '生日已保存', icon: 'success', duration: 1000 });
  },

  // —— 微信绑定（占位）——
  openWechatBind() {
    if (this.data.accountInfo.wechatBound) {
      wx.showModal({
        title: '解绑微信',
        content: '解绑后将无法用微信快捷登录，确定继续？',
        confirmColor: '#c43a2c',
        success: (res) => {
          if (res.confirm) {
            this.setData({ 'accountInfo.wechatBound': false });
            wx.showToast({ title: '已解绑', icon: 'success' });
          }
        }
      });
    } else {
      wx.showToast({ title: '微信绑定功能开发中', icon: 'none' });
    }
  },

  // —— 修改手机号：3 步流程 ——
  openPhoneChange() {
    this.setData({
      phoneChange: {
        visible: true, step: 1,
        currentCode: '', newPhone: '', newCode: '', countdown: 0
      }
    });
  },
  cancelPhoneChange() {
    this._stopCountdown();
    this.setData({ 'phoneChange.visible': false });
  },
  _stopCountdown() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }
  },
  _startCountdown() {
    this._stopCountdown();
    this.setData({ 'phoneChange.countdown': 60 });
    this._countdownTimer = setInterval(() => {
      const c = this.data.phoneChange.countdown - 1;
      if (c <= 0) {
        this._stopCountdown();
        this.setData({ 'phoneChange.countdown': 0 });
      } else {
        this.setData({ 'phoneChange.countdown': c });
      }
    }, 1000);
  },
  // 发送验证码（mock：直接进入倒计时）
  sendVerifyCode(e) {
    const target = e.currentTarget.dataset.target; // 'current' 或 'new'
    if (this.data.phoneChange.countdown > 0) return;
    if (target === 'new') {
      const p = this.data.phoneChange.newPhone;
      if (!/^1[3-9]\d{9}$/.test(p)) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
    }
    this._startCountdown();
    wx.showToast({ title: '验证码已发送', icon: 'success' });
  },
  // 输入旧验证码 / 新手机号 / 新验证码
  onPhoneChangeInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`phoneChange.${field}`]: e.detail.value });
  },
  // 下一步 / 完成
  nextPhoneChangeStep() {
    const pc = this.data.phoneChange;
    if (pc.step === 1) {
      // 验证旧号
      if (!/^\d{6}$/.test(pc.currentCode)) {
        wx.showToast({ title: '请输入 6 位验证码', icon: 'none' });
        return;
      }
      this._stopCountdown();
      this.setData({
        'phoneChange.step': 2,
        'phoneChange.countdown': 0,
        'phoneChange.currentCode': ''
      });
    } else if (pc.step === 2) {
      // 输入新号 → 进入验证
      if (!/^1[3-9]\d{9}$/.test(pc.newPhone)) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
      if (!/^\d{6}$/.test(pc.newCode)) {
        wx.showToast({ title: '请输入 6 位验证码', icon: 'none' });
        return;
      }
      // 完成
      const newP = pc.newPhone;
      const mask = newP.slice(0, 3) + '****' + newP.slice(-4);
      this._stopCountdown();
      this.setData({
        'accountInfo.phone': newP,
        'accountInfo.maskPhone': mask,
        // 若昵称之前是脱敏号，也更新
        'accountInfo.nickname': this.data.accountInfo.nickname.includes('****')
          ? mask : this.data.accountInfo.nickname,
        'phoneChange.visible': false
      });
      wx.showToast({ title: '手机号已更新', icon: 'success', duration: 1500 });
    }
  },

  // —— 注销账号 ——
  openAccountClose() {
    this.setData({ accountClose: { visible: true, step: 1 } });
  },
  cancelAccountClose() {
    this.setData({ 'accountClose.visible': false });
  },
  confirmAccountCloseStep1() {
    this.setData({ 'accountClose.step': 2 });
  },
  confirmAccountCloseFinal() {
    this.setData({ 'accountClose.visible': false });
    wx.showToast({ title: '账号注销已提交', icon: 'success', duration: 1500 });
    setTimeout(() => {
      // 模拟退出登录
      this.confirmLogout && this.confirmLogout();
    }, 1500);
  },

  // ========== 会员订阅相关 ==========
  // 开启 7 天免费试用（结束后自动转月付 ¥19.9）
  startFreeTrial() {
    const app = getApp();
    const now = Date.now();
    const newState = {
      isMember: true,
      isTrial: true,
      planType: 'trial',
      trialStartAt: now,
      expireAt: now + 7 * 86400000,
      autoRenew: true,
      nextPlanAfterTrial: 'monthly'  // 试用结束自动转月付
    };
    app.saveMemberState(newState);
    this.refreshMemberState();
    wx.showToast({ title: '7 天免费试用已开启，结束后将按月付 ¥19.9 自动续费', icon: 'none', duration: 2500 });
  },

  // 订阅月付
  subscribeMonthly() {
    wx.showModal({
      title: '确认订阅',
      content: '月度会员 ¥19.9 / 月，到期自动续费',
      confirmText: '确认订阅',
      confirmColor: '#c0850f',
      success: (res) => {
        if (!res.confirm) return;
        const app = getApp();
        const now = Date.now();
        app.saveMemberState({
          isMember: true,
          isTrial: false,
          planType: 'monthly',
          trialStartAt: 0,
          expireAt: now + 30 * 86400000,
          autoRenew: true
        });
        this.refreshMemberState();
        wx.showToast({ title: '订阅成功', icon: 'success' });
      }
    });
  },

  // 订阅年付
  subscribeYearly() {
    wx.showModal({
      title: '确认订阅',
      content: '年度会员 首年 ¥98（原价 ¥168），续费 ¥168 / 年',
      confirmText: '确认订阅',
      confirmColor: '#c0850f',
      success: (res) => {
        if (!res.confirm) return;
        const app = getApp();
        const now = Date.now();
        app.saveMemberState({
          isMember: true,
          isTrial: false,
          planType: 'yearly',
          trialStartAt: 0,
          expireAt: now + 365 * 86400000,
          autoRenew: true
        });
        this.refreshMemberState();
        wx.showToast({ title: '订阅成功', icon: 'success' });
      }
    });
  },

  // 切换自动续费
  toggleAutoRenew() {
    const app = getApp();
    const cur = app.globalData.member;
    const next = !cur.autoRenew;
    if (!next) {
      wx.showModal({
        title: '关闭自动续费',
        content: '关闭后将在到期日停止扣费，已生效的订阅会持续到当前周期结束。',
        confirmText: '确认关闭',
        success: (r) => {
          if (r.confirm) {
            app.saveMemberState({ ...cur, autoRenew: false });
            this.refreshMemberState();
            wx.showToast({ title: '已关闭自动续费', icon: 'none' });
          }
        }
      });
    } else {
      app.saveMemberState({ ...cur, autoRenew: true });
      this.refreshMemberState();
      wx.showToast({ title: '已开启自动续费', icon: 'success' });
    }
  },

  // 取消订阅
  cancelSubscription() {
    wx.showModal({
      title: '取消订阅',
      content: '取消后当前周期会员仍然有效，到期后不再自动续费。',
      confirmText: '确认取消',
      confirmColor: '#d97757',
      success: (r) => {
        if (r.confirm) {
          const app = getApp();
          app.saveMemberState({ ...app.globalData.member, autoRenew: false });
          this.refreshMemberState();
          wx.showToast({ title: '已取消，到期后不再续费', icon: 'none' });
        }
      }
    });
  },

  // ========== 联系我们 ==========
  copyContactWechat() {
    wx.setClipboardData({
      data: 'huahaomian-cs',
      success: () => wx.showToast({ title: '客服微信已复制', icon: 'success' })
    });
  },
  callContactPhone() {
    wx.makePhoneCall({ phoneNumber: '4001008888' });
  },
  copyContactEmail() {
    wx.setClipboardData({
      data: 'support@huahaomian.com',
      success: () => wx.showToast({ title: '客服邮箱已复制', icon: 'success' })
    });
  },

  // ========== 退出登录 ==========
  confirmLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号？',
      confirmText: '退出',
      confirmColor: '#d97757',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // ====== 我的设备列表 → 进入添加设备 ======
  goAddDevice() {
    this.bluetoothTipShown = false; // 每次重新进入页面允许提醒一次
    this.setData({
      currentView: "addDevice",
      "addDeviceState.step": "checkBluetooth",
      "addDeviceState.searching": false,
      "addDeviceState.foundDevices": []
    });
    this.checkBluetoothAvailable();
  },

  // 检查手机蓝牙是否打开（点击"知道了"后不再循环弹窗）
  checkBluetoothAvailable() {
    wx.openBluetoothAdapter({
      success: () => {
        this.setData({
          "addDeviceState.bluetoothOpen": true,
          "addDeviceState.step": "searching"
        });
        this.startSearchDevice();
      },
      fail: () => {
        // 切到"等待蓝牙"状态，仅在首次未提醒过时弹窗一次
        this.setData({
          "addDeviceState.bluetoothOpen": false,
          "addDeviceState.step": "waitBluetooth"
        });
        if (!this.bluetoothTipShown) {
          this.bluetoothTipShown = true;
          wx.showModal({
            title: '提示',
            content: '请打开手机蓝牙',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#4cb6ec'
            // 不再在 success 里重新检测，避免循环
          });
        }
      }
    });
  },

  // 用户手动点击底部"搜索设备"按钮再次尝试（允许再次弹窗提醒）
  retrySearchDevice() {
    this.bluetoothTipShown = false;
    this.checkBluetoothAvailable();
  },

  // 开始搜索蓝牙设备（模拟实现，等接入硬件 SDK 后替换）
  startSearchDevice() {
    this.setData({ "addDeviceState.searching": true });
    wx.startBluetoothDevicesDiscovery({
      success: () => {
        wx.onBluetoothDeviceFound((res) => {
          const list = (res.devices || []).filter((d) => d.name && d.name.includes("X2"));
          if (list.length > 0) {
            this.setData({
              "addDeviceState.foundDevices": list,
              "addDeviceState.step": "found",
              "addDeviceState.searching": false
            });
          }
        });
      },
      fail: () => {
        this.setData({
          "addDeviceState.step": "error",
          "addDeviceState.searching": false
        });
      }
    });
  },

  // 点击我的设备列表项进入设备详情
  openBoundDevice(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentView: "device" });
  },

  // 点击 ">" 解绑设备（弹二次确认）
  confirmUnbindDevice(e) {
    const id = e.currentTarget.dataset.id;
    const device = this.data.boundDevices.find((d) => d.id === id);
    if (!device) return;
    const isCurrent = id === this.data.currentDeviceId;
    wx.showModal({
      title: '解绑设备',
      content: `确认解绑「${device.alias || device.name}」？\n解绑后该设备的历史数据将无法访问。`,
      confirmText: '确认解绑',
      confirmColor: '#d97757',
      success: (r) => {
        if (!r.confirm) return;
        const remaining = this.data.boundDevices.filter((d) => d.id !== id);
        let newCurrentId = this.data.currentDeviceId;
        if (isCurrent) {
          newCurrentId = remaining.length > 0 ? remaining[0].id : "";
        }
        this.setData({
          boundDevices: remaining,
          currentDeviceId: newCurrentId
        }, () => {
          this.refreshCurrentDevice();
          this.refreshAccountMenuBadge();
          const app = getApp();
          if (app && app.globalData) {
            app.globalData.currentDeviceId = newCurrentId;
          }
          wx.showToast({ title: '已解绑设备', icon: 'success' });
        });
      }
    });
  },

  // ====== 设备自适应 ======
  startAdaptation() {
    if (this.data.adapting) return;
    this.setData({ adapting: true });
    wx.showLoading({ title: "自适应中..." });
    setTimeout(() => {
      wx.hideLoading();
      const now = new Date();
      const ts =
        `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ` +
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      this.setData({
        adapting: false,
        "adaptData.noPersonTime": ts,
        "adaptData.noPersonValue": 4090 + Math.floor(Math.random() * 10)
      });
      wx.showToast({ title: "自适应完成", icon: "success" });
    }, 1800);
  },

  refreshAdapt() {
    wx.showToast({ title: "数据已刷新", icon: "none" });
  },

  // ====== 通用选择器（field + options） ======
  openPicker(e) {
    const { field, title } = e.currentTarget.dataset;
    const options = this.resolvePickerOptions(field);
    if (!options.length) return;
    let curr = "";
    if (field === "bedAwayTime") curr = this.data.monitorParams.bedAwayTime;
    else if (field === "hrStatLength") curr = this.data.monitorParams.hrStatLength;
    else if (["hrLow", "hrHigh", "brLow", "brHigh"].includes(field)) curr = String(this.data.alertConfig[field]);
    else if (field === "bedDuration") curr = this.data.alertConfig.bedDuration;
    else if (this.data.editingUser && this.data.userEditDraft && field in this.data.userEditDraft) {
      curr = String(this.data.userEditDraft[field]);
    }
    this.setData({
      picker: { visible: true, field, title: title || "请选择", options, value: curr || options[0] }
    });
  },

  resolvePickerOptions(field) {
    if (field === "bedAwayTime") return BED_AWAY_OPTIONS;
    if (field === "hrStatLength") return HR_STAT_OPTIONS;
    if (field === "hrLow")  return HR_LOW_OPTIONS;
    if (field === "hrHigh") return HR_HIGH_OPTIONS;
    if (field === "brLow")  return Array.from({ length: 11 }, (_, i) => `${i + 4}`);  // 4-14
    if (field === "brHigh") return Array.from({ length: 16 }, (_, i) => `${i + 18}`); // 18-33
    if (field === "bedDuration") return ["离床时长 15 分钟", "离床时长 30 分钟", "离床时长 45 分钟", "离床时长 60 分钟", "离床时长 90 分钟"];
    if (field === "sleepEnv") return ["独自睡", "双人睡"];
    if (field === "isDisabled") return ["否", "是"];
    if (field === "gender") return ["男", "女"];
    if (field === "smokingHabit") return ["不吸烟", "偶尔", "经常"];
    if (field === "drinkingHabit") return ["不饮酒", "偶尔", "经常"];
    if (field === "caffeineHabit") return ["不喝咖啡因", "偶尔", "每日"];
    if (field === "exerciseFreq") return ["不运动", "每周 1-2 次", "每周 3+ 次"];
    return [];
  },

  onPickerColumnChange(e) {
    const idx = e.detail.value[0];
    const options = this.data.picker.options;
    this.setData({ "picker.value": options[idx] });
  },

  pickerConfirm() {
    const { field, value } = this.data.picker;
    const updates = {};
    if (field === "bedAwayTime" || field === "hrStatLength") {
      updates[`monitorParams.${field}`] = value;
    } else if (["hrLow", "hrHigh", "brLow", "brHigh"].includes(field)) {
      updates[`alertConfig.${field}`] = Number(value);
    } else if (field === "bedDuration") {
      updates[`alertConfig.${field}`] = value;
    } else if (this.data.editingUser && this.data.userEditDraft && field in this.data.userEditDraft) {
      updates[`userEditDraft.${field}`] = value;
    }
    this.setData({ ...updates, "picker.visible": false });
  },

  pickerCancel() {
    this.setData({ "picker.visible": false });
  },

  // ====== 时间选择器 ======
  openTimePicker(e) {
    const { field, title } = e.currentTarget.dataset;
    const a = this.data.alertConfig;
    const p = this.data.monitorParams;
    const map = {
      reportStart: [p.reportStartHour, p.reportStartMin],
      reportEnd:   [p.reportEndHour,   p.reportEndMin],
      hrStart:     [a.hrStartHour,     a.hrStartMin],
      hrEnd:       [a.hrEndHour,       a.hrEndMin],
      brStart:     [a.brStartHour,     a.brStartMin],
      brEnd:       [a.brEndHour,       a.brEndMin],
      bedStart:    [a.bedStartHour,    a.bedStartMin],
      bedEnd:      [a.bedEndHour,      a.bedEndMin]
    };
    const [h, m] = map[field] || ["00", "00"];
    this.setData({
      timePicker: { visible: true, field, title: title || "请选择时间", hour: h, minute: m }
    });
  },

  onTimeColumnChange(e) {
    const [hi, mi] = e.detail.value;
    this.setData({
      "timePicker.hour": HOUR_OPTIONS[hi],
      "timePicker.minute": MINUTE_OPTIONS[mi]
    });
  },

  timePickerConfirm() {
    const { field, hour, minute } = this.data.timePicker;
    const updates = {};
    const fieldMap = {
      reportStart: ["monitorParams.reportStartHour", "monitorParams.reportStartMin"],
      reportEnd:   ["monitorParams.reportEndHour",   "monitorParams.reportEndMin"],
      hrStart:     ["alertConfig.hrStartHour",       "alertConfig.hrStartMin"],
      hrEnd:       ["alertConfig.hrEndHour",         "alertConfig.hrEndMin"],
      brStart:     ["alertConfig.brStartHour",       "alertConfig.brStartMin"],
      brEnd:       ["alertConfig.brEndHour",         "alertConfig.brEndMin"],
      bedStart:    ["alertConfig.bedStartHour",      "alertConfig.bedStartMin"],
      bedEnd:      ["alertConfig.bedEndHour",        "alertConfig.bedEndMin"]
    };
    const [hk, mk] = fieldMap[field] || [];
    if (hk && mk) {
      updates[hk] = hour;
      updates[mk] = minute;
    }
    this.setData({ ...updates, "timePicker.visible": false });
  },

  timePickerCancel() {
    this.setData({ "timePicker.visible": false });
  },

  // ====== 被监测人信息 ======
  refreshAge() {
    const bd = this.data.userInfo.birthDate || "";
    const m = /^(\d{4})-(\d{2})$/.exec(bd);
    if (!m) return;
    const birth = new Date(Number(m[1]), Number(m[2]) - 1, 1);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth()) age -= 1;
    this.setData({ "userInfo.age": Math.max(0, age) });
  },

  startEditUser() {
    this.setData({
      editingUser: true,
      userEditDraft: { ...this.data.userInfo }
    });
  },

  cancelEditUser() {
    this.setData({ editingUser: false, userEditDraft: null });
  },

  saveEditUser() {
    if (!this.data.userEditDraft) return;
    this.setData(
      { userInfo: { ...this.data.userEditDraft }, editingUser: false, userEditDraft: null },
      () => {
        this.refreshAge();
        // 同步到 storage，供长期页心脏年龄等计算使用
        wx.setStorageSync('userInfo', this.data.userInfo);
      }
    );
    wx.showToast({ title: "已保存", icon: "success" });
  },

  onDraftInput(e) {
    const field = e.currentTarget.dataset.field;
    let val = e.detail.value;
    if (["height", "weight", "mattressThickness", "mattressWidth"].includes(field)) {
      val = Number(val) || 0;
    }
    this.setData({ [`userEditDraft.${field}`]: val });
  },

  onDraftDateChange(e) {
    this.setData({ "userEditDraft.birthDate": e.detail.value.slice(0, 7) });
  },

  // ====== 预警设置 ======
  // 总开关
  toggleAlert(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`alertConfig.${field}`]: e.detail.value });
  },
  // 通知渠道勾选
  toggleNotify(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`alertConfig.${field}`]: !this.data.alertConfig[field] });
  },

  onEmergencyPhoneInput(e) {
    this.setData({ "alertConfig.emergencyPhone": e.detail.value });
  },

  editEmergencyPhone() {
    wx.showToast({ title: "点击下方输入框即可编辑", icon: "none", duration: 1500 });
  },

  saveAlertConfig() {
    wx.showToast({ title: "预警已保存", icon: "success" });
  },

  openSubscribeAccount() {
    wx.showToast({ title: "请在微信中搜索关注「护心宝」公众号", icon: "none", duration: 2200 });
  },

  // ====== 设备详情 ======
  openDeviceDetail() {
    this.setData({ currentView: "device" });
  },

  editDeviceAlias() {
    wx.showModal({
      title: "重命名设备",
      editable: true,
      placeholderText: this.data.deviceDetail.alias,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            "deviceDetail.alias": res.content,
            "deviceInfo.name": res.content
          });
        }
      }
    });
  },

  unbindDevice() {
    wx.showModal({
      title: "解绑设备",
      content: "解绑后将不再接收该设备的睡眠监测数据，是否确认？",
      confirmText: "解绑",
      confirmColor: "#ff5252",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "已解绑", icon: "success" });
        }
      }
    });
  },

  // ====== 分享设备 ======
  inviteShare() {
    wx.showToast({ title: "邀请链接已生成，可分享给家人", icon: "success" });
  },

  removeShareUser(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "移除共享",
      content: "确认移除该成员的设备访问权限？",
      success: (res) => {
        if (res.confirm) {
          const next = (this.data.shareList || []).filter((u) => u.id !== id);
          this.setData({ shareList: next });
        }
      }
    });
  },

  // ====== 更多设置 ======
  onMoreItemTap(e) {
    const key = e.currentTarget.dataset.key;
    const titleMap = {
      firmware: "已是最新固件版本 v2.4.1",
      reset:    "请长按设备实体按键 5 秒恢复出厂设置",
      log:      "权限调用记录将在下一版本上线",
      privacy:  "隐私政策详见 about:privacy",
      contact:  "客服热线：400-880-9911",
      logout:   "已退出登录"
    };
    wx.showToast({ title: titleMap[key] || "敬请期待", icon: "none", duration: 2000 });
  },

  // 给蒙层用的空 handler，防止冒泡到弹层下方
  noop() {}
});
