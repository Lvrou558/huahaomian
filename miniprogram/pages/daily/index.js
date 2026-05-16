Page({
  data: {
    // 日期相关
    weekDays: [
      { short: '日', full: '日' },
      { short: '一', full: '一' },
      { short: '二', full: '二' },
      { short: '三', full: '三' },
      { short: '四', full: '四' },
      { short: '五', full: '五' },
      { short: '六', full: '六' }
    ],
    selectedDay: 1,
    currentWeekDay: '一',
    currentDateRange: '4月13日-14',
    currentDate: '2026-03-30',
    showCalendarModal: false,
    calendarYearMonth: '2026年03月',
    calendarDays: [],
    
    showAdvanced: false,
    showBreathing: false,
    showHeart: false,
    showMovement: false,
    monitorEnabled: false,
    summary: {
      bodyRecovery: 92,
      mindRecovery: 90,
      score: 87,
      duration: "8h36m"
    },
    // 时间数轴数据
    sleepTimeline: {
      previousNight: { bedTime: '23:05', wakeTime: '06:55', duration: '7h50m' },
      lastNight: { bedTime: '23:15', wakeTime: '07:51', duration: '8h36m' },
      suggestedTonight: { bedTime: '23:00', wakeTime: '06:30', duration: '7h30m' }
    },
    timeAxisTicks: ["08:00", "05:00", "02:00", "23:00"],
    timeAxisRange: {
      start: 23 * 60,
      end: 32 * 60
    },
    // 恢复程度分数
    recoveryScores: {
      body: { score: 87, label: '充分恢复', status: '睡的超稳' },
      mind: { score: 87, label: '完美恢复', status: '睡的超稳' }
    },
    // 核心睡眠数据
    coreSleepData: [
      { label: '上床时间', value: '23:15' },
      { label: '起床时间', value: '08:35' },
      { label: '睡眠时长', value: '8h36m' },
      { label: '深睡时长', value: '1h21m' }
    ],
    // 睡眠评价
    sleepEvaluation: '昨晚睡眠超稳，深睡充足，心肺全程平稳。',
    sleepWins: [
      { icon: "🌙", title: "上床时间超稳定", desc: "已连续坚持10天" },
      { icon: "☀️", title: "起床节奏在进步", desc: "最近起床越来越规律" },
      { icon: "📱", title: "睡前专注小胜利", desc: "提前放下手机30分钟" }
    ],
    phaseSummary: "整夜分期节律清晰，深睡与梦境切换有序，恢复效率稳定。",
    sleepPhaseMeta: {
      startLabel: "入睡23:15",
      endLabel: "起床08:35",
      startTime: "23:15",
      endTime: "08:35"
    },
    phaseTimeTicks: [
      { label: "23:00" },
      { label: "00:00" },
      { label: "01:00" },
      { label: "02:00" },
      { label: "03:00" },
      { label: "04:00" },
      { label: "05:00" },
      { label: "06:00" },
      { label: "07:00" },
      { label: "08:00" }
    ],
    activeStageKey: null,
    phaseLegend: [
      { key: "awake", label: "清醒时间", duration: "0小时35分钟", color: "#cfd9e8" },
      { key: "dream", label: "梦", duration: "1小时31分钟", color: "#b15dff" },
      { key: "light", label: "浅睡眠", duration: "3小时50分钟", color: "#71bfd1" },
      { key: "deep", label: "深度睡眠", duration: "1小时21分钟", color: "#00a6a0" }
    ],
    sleepCycles: [],
    sleepPhasePoints: [
      { level: 0.78, stage: "light" }, { level: 0.68, stage: "light" }, { level: 0.58, stage: "deep" }, { level: 0.48, stage: "deep" },
      { level: 0.42, stage: "deep" }, { level: 0.46, stage: "deep" }, { level: 0.52, stage: "light" }, { level: 0.57, stage: "light" },
      { level: 0.62, stage: "light" }, { level: 0.54, stage: "light" }, { level: 0.70, stage: "dream" }, { level: 0.88, stage: "dream" },
      { level: 0.84, stage: "dream" }, { level: 0.64, stage: "light" }, { level: 0.56, stage: "light" }, { level: 0.52, stage: "deep" },
      { level: 0.62, stage: "light" }, { level: 0.44, stage: "deep" }, { level: 0.40, stage: "deep" }, { level: 0.50, stage: "deep" },
      { level: 0.66, stage: "dream" }, { level: 0.84, stage: "dream" }, { level: 0.80, stage: "dream" }, { level: 0.72, stage: "light" },
      { level: 0.60, stage: "light" }, { level: 0.58, stage: "light" }, { level: 0.60, stage: "light" }, { level: 0.62, stage: "light" },
      { level: 0.66, stage: "light" }, { level: 0.61, stage: "light" }, { level: 0.58, stage: "light" }, { level: 0.62, stage: "light" },
      { level: 0.70, stage: "dream" }, { level: 0.82, stage: "dream" }, { level: 0.90, stage: "dream" }, { level: 0.92, stage: "dream" },
      { level: 0.84, stage: "dream" }, { level: 0.76, stage: "dream" }, { level: 0.78, stage: "dream" }, { level: 0.64, stage: "light" },
      { level: 0.60, stage: "light" }, { level: 0.58, stage: "light" }, { level: 0.54, stage: "light" }, { level: 0.56, stage: "light" },
      { level: 0.62, stage: "light" }, { level: 0.60, stage: "light" }, { level: 0.66, stage: "awake" }, { level: 0.94, stage: "awake" }
    ],
    cycleInfo: "整夜4次完整睡眠循环，深睡峰值在03:00-04:00，给身体充饱了电",
    breathingCards: [
      { label: "平均呼吸频率", value: "13次/分", level: "参考10-18次/分" },
      { label: "最长呼吸暂停时长", value: "13秒", level: "观察阈值10秒" },
      { label: "暂停呼吸事件", value: "13", level: "轻度需关注" },
      { label: "平均呼吸暂停", value: "8秒", level: "轻度波动" }
    ],
    heartCards: [
      { label: "心率范围", value: "65-72次/分", level: "夜间平稳" },
      { label: "HRV值", value: "33", level: "恢复中等偏好" },
      { label: "平均心率", value: "69bpm", level: "参考45-70bpm" },
      { label: "rMSSD", value: "892ms", level: "参考600-1200ms" }
    ],
    breathingSeries: [
      13.4, 13.5, 13.5, 13.6, 13.5, 13.4, 13.5, 13.6, 13.5, 13.6, 13.7, 13.5,
      13.4, 13.3, 13.4, 13.5, 13.6, 13.8, 14.6, 13.9, 13.6, 13.5, 13.4, 13.5,
      13.6, 13.7, 13.6, 13.5, 13.4, 13.5, 13.6, 13.5, 13.6, 13.7, 14.1, 13.8,
      13.6, 13.5, 13.4, 13.5, 13.6, 13.7, 13.6, 13.5, 13.4, 13.5, 13.6, 13.6
    ],
    heartSeries: [
      60, 61, 59, 60, 61, 60, 61, 62, 61, 63, 62, 64,
      63, 64, 63, 65, 64, 66, 67, 66, 68, 67, 68, 66,
      60, 61, 63, 62, 59, 57, 60, 61, 58, 60, 62, 61,
      60, 61, 62, 60, 61, 62, 60, 61, 62, 61, 60, 62,
      59, 58, 60, 61, 60, 58, 57, 59, 60, 62, 61, 60,
      59, 58, 57, 59, 60, 58, 57, 56, 57, 59, 60, 58,
      56, 57, 60, 63, 62, 60, 58, 59, 60, 58, 59, 60,
      62, 64, 67, 68, 66, 67, 64, 66, 63, 65, 62, 61
    ],
    heartRangeDisplay: "55-69",
    movementCount: 93,
    movementSeries: [
      4, 2, 3, 1, 2, 3, 0, 0, 1, 3, 2, 0,
      1, 2, 5, 4, 1, 0, 0, 1, 4, 2, 0, 0,
      1, 4, 2, 0, 0, 1, 5, 3, 3, 1, 0, 4,
      3, 2, 0, 1, 1, 1, 0, 0, 0, 2, 3, 4
    ],
    turnoverSeries: [
      1, 3, 3, 0, 0, 0, 2, 3, 0, 3, 0, 0,
      0, 2, 0, 3, 0, 0, 0, 0, 4, 0, 0, 2,
      0, 4, 4, 0, 0, 3, 1, 4, 4, 2, 3, 5,
      0, 4, 6, 4, 6, 4, 4, 2, 0, 0, 0, 2
    ],
    ecgSeries: [
      0.50, 0.46, 0.42, 0.58, 0.90, 0.34, 0.42, 0.50, 0.62, 0.62, 0.54, 0.44,
      0.38, 0.42, 0.52, 0.48, 0.44, 0.58, 0.98, 0.36, 0.44, 0.56, 0.62, 0.56,
      0.44, 0.39, 0.42, 0.52, 0.48, 0.44, 0.56, 0.88, 0.40, 0.46, 0.58, 0.64,
      0.52, 0.42, 0.36, 0.48, 0.52, 0.46, 0.44, 0.60, 0.90, 0.34, 0.48, 0.60
    ],
    heartIndexValue: 78,
    heartIndexLevel: "优秀",
    trendTimeTicks: [
      "23:00", "00:00", "01:00", "02:00", "03:00",
      "04:00", "05:00", "06:00", "07:00", "08:00"
    ],
    heartTimeTicks: ["01:00", "03:00", "05:00"],
    movementTimeTicks: [
      "23:00", "01:00", "03:00", "05:00", "07:00", "09:00"
    ],
    breathingTrendConfig: {
      metricName: "呼吸频率",
      unit: "次/分钟"
    },
    heartTrendConfig: {
      metricName: "心跳频率",
      unit: "次/分钟",
      yMin: 50,
      yMax: 80,
      horizontalTicks: 3,
      showVerticalGrid: false,
      smooth: false,
      lineWidth: 3.4,
      fillUnder: true,
      fillColor: "rgba(88, 199, 245, 0.10)",
      gridColor: "rgba(222, 236, 235, 0.95)",
      tickColor: "#2f343c"
    },
    soundEnvCards: [
      { label: "环境平均噪音", value: "32分贝", level: "超安静" },
      { label: "峰值噪音", value: "62分贝", level: "轻度干扰" },
      { label: "噪音干扰时长", value: "8分钟", level: "正常范围" },
      { label: "睡眠影响占比", value: "12%", level: "影响较低" }
    ],
    soundEventCards: [
      { label: "鼾声总次数", value: "5次", level: "轻度频发" },
      { label: "最长鼾声时长", value: "18秒", level: "需关注" },
      { label: "咳嗽声总次数", value: "0次", level: "无异常" },
      { label: "梦话记录次数", value: "2次", level: "-" }
    ]
  },

  onLoad() {
    this.initDateData();
    this.updateDynamicTimeAxis();
    this.setData({
      sleepCycles: this.buildSleepCycles()
    });
  },

  onReady() {
    this.drawTimeAxes();
    this.drawSleepCycle();
    this.drawBreathingTrend();
    this.drawHeartTrendChart();
    this.drawMovementTrend();
    this.drawEcgChart();
    this.drawIndexGaugeMini();
    this.drawSoundTrend();
  },

  // 初始化日期数据
  buildSleepCycles() {
    const phaseColors = {
      deep: "#00a6a0",
      light: "#71bfd1",
      dream: "#b15dff"
    };
    const baseCycles = [
      { index: 1, start: "23:30", end: "01:00", deep: 20, light: 30, dream: 50, bodyRecovery: 14, mindRecovery: 65 },
      { index: 2, start: "01:00", end: "02:30", deep: 40, light: 40, dream: 20, bodyRecovery: 42, mindRecovery: 82 },
      { index: 3, start: "02:30", end: "04:00", deep: 35, light: 50, dream: 15, bodyRecovery: 78, mindRecovery: 90 },
      { index: 4, start: "04:00", end: "08:35", deep: 10, light: 40, dream: 50, bodyRecovery: 92, mindRecovery: 100 }
    ];

    return baseCycles.map((cycle) => {
      const total = Math.max(1, cycle.deep + cycle.light + cycle.dream);
      const deepPct = Math.round((cycle.deep / total) * 100);
      const lightPct = Math.round((cycle.light / total) * 100);
      const dreamPct = Math.max(0, 100 - deepPct - lightPct);
      const buildSegment = (key, label, pct, color) => {
        const isNarrow = pct < 18;
        return {
          key,
          label,
          pct,
          color,
          displayText: isNarrow ? `${pct}%` : `${label}${pct}%`
        };
      };
      const segments = [
        buildSegment("deep", "深睡", deepPct, phaseColors.deep),
        buildSegment("light", "浅睡", lightPct, phaseColors.light),
        buildSegment("dream", "REM", dreamPct, phaseColors.dream)
      ];
      return {
        ...cycle,
        deepPct,
        lightPct,
        dreamPct,
        segments
      };
    });
  },

  initDateData() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const weekDay = now.getDay();
    
    // 格式化日期
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    // 获取当天日期范围
    const yesterday = new Date(now);
    yesterday.setDate(day - 1);
    const dateRange = `${month + 1}月${yesterday.getDate()}日-${day}`;
    
    this.setData({
      selectedDay: weekDay,
      currentWeekDay: this.data.weekDays[weekDay].full,
      currentDateRange: dateRange,
      currentDate: formatDate(now),
      calendarYearMonth: `${year}年${String(month + 1).padStart(2, '0')}月`,
      calendarDays: this.generateCalendarDays(year, month)
    });
  },

  // 生成日历天数
  generateCalendarDays(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        isToday: date.toDateString() === today.toDateString(),
        hasData: i <= today.getDate() // 今天及之前有数据
      });
    }
    return days;
  },

  // 选择星期
  selectDay(e) {
    const index = e.currentTarget.dataset.index;
    const now = new Date();
    const today = now.getDay();
    const diff = index - today;
    
    const selectedDate = new Date(now);
    selectedDate.setDate(now.getDate() + diff);
    
    const month = selectedDate.getMonth() + 1;
    const date = selectedDate.getDate();
    
    this.setData({
      selectedDay: index,
      currentWeekDay: this.data.weekDays[index].full,
      currentDate: this.formatDate(selectedDate),
      currentDateRange: diff === 0 ? `${month}月${date-1}日-${date}` : `${month}月${date}日`
    });
  },

  // 格式化日期
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 显示日历弹窗
  showCalendar() {
    this.setData({ showCalendarModal: true });
  },

  // 隐藏日历弹窗
  hideCalendar() {
    this.setData({ showCalendarModal: false });
  },

  // 选择日历日期
  selectCalendarDay(e) {
    const day = e.currentTarget.dataset.day;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const selectedDate = new Date(year, month, day);
    const weekDay = selectedDate.getDay();
    
    this.setData({
      selectedDay: weekDay,
      currentWeekDay: this.data.weekDays[weekDay].full,
      currentDate: this.formatDate(selectedDate),
      currentDateRange: `${month + 1}月${day}日`,
      showCalendarModal: false
    });
  },

  goTemplePage() {
    wx.navigateTo({
      url: "/pages/temple/index"
    });
  },

  // ★ 术语解释提示
  showTermTooltip(e) {
    const term = e.currentTarget.dataset.term;
    const tooltips = {
      "交感神经": "兴奋时心率上升，抑制时心率下降，主要调节睡眠时的心脏活动",
      "R波": "心搏中最高的尖峰，反映心室收缩力量，是心电图中最显著的波形",
      "pqrst": "心电周期的三个波群：P波(心房收缩) / QRS波群(心室收缩) / T波(心室复极)",
      "窦性心律": "由窦房结主导的正常心跳节律，是健康成人的标准心律模式",
      "rr间期": "两次心跳之间的时间间隔，反映心率规律性，间期越均匀说明心律越稳定",
      "R波": "心电图中最高的尖峰，反映心室快速除极，是判断心率的关键标志"
    };
    
    const msg = tooltips[term] || "专业术语";
    wx.showToast({
      title: msg,
      icon: "none",
      duration: 3000,
      mask: false
    });
  },

  toggleAdvanced() {
    this.setData(
      { showAdvanced: !this.data.showAdvanced },
      () => {
        if (this.data.showAdvanced) {
          this.drawBreathingTrend();
          this.drawHeartTrendChart();
          this.drawMovementTrend();
          this.drawSoundTrend();
        }
      }
    );
  },

  toggleBreathing() {
    this.setData(
      { showBreathing: !this.data.showBreathing },
      () => {
        if (this.data.showBreathing) {
          this.drawBreathingTrend();
        }
      }
    );
  },

  toggleHeart() {
    this.setData(
      { showHeart: !this.data.showHeart },
      () => {
        if (this.data.showHeart) {
          this.drawHeartTrendChart();
          this.drawEcgChart();
        }
      }
    );
  },

  toggleMovement() {
    this.setData(
      { showMovement: !this.data.showMovement },
      () => {
        if (this.data.showMovement) {
          this.drawMovementTrend();
        }
      }
    );
  },

  drawBreathingTrend() {
    this.drawTrendLine({
      selector: "#breathingTrend",
      color: "#46a38f",
      series: this.data.breathingSeries,
      config: this.data.breathingTrendConfig
    });
  },

  drawHeartTrend() {
    this.drawTrendLine({
      selector: "#heartTrend",
      color: "#58c7f5",
      series: this.data.heartSeries,
      config: this.data.heartTrendConfig
    });
  },

  // ★ 新增：心率数据卡的图表
  drawHeartTrendChart() {
    const query = wx.createSelectorQuery();
    query.select("#heartTrendChart")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        
        const series = this.data.heartSeries || [];
        if (series.length < 2) return;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Y轴范围：50-80
        const yMin = 50, yMax = 80;
        const paddingLeft = 40;
        const paddingRight = 12;
        const paddingTop = 12;
        const paddingBottom = 20;
        const chartW = width - paddingLeft - paddingRight;
        const chartH = height - paddingTop - paddingBottom;

        // 绘制网格
        ctx.strokeStyle = "rgba(222, 236, 235, 0.6)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i <= 3; i++) {
          const y = paddingTop + (chartH / 3) * i;
          ctx.beginPath();
          ctx.moveTo(paddingLeft, y);
          ctx.lineTo(width - paddingRight, y);
          ctx.stroke();
        }

        // Y轴刻度标签
        ctx.fillStyle = "#8ca6a0";
        ctx.font = "12rpx sans-serif";
        ctx.textAlign = "right";
        for (let i = 0; i <= 3; i++) {
          const value = yMax - ((yMax - yMin) / 3) * i;
          const y = paddingTop + (chartH / 3) * i;
          ctx.fillText(String(Math.round(value)), paddingLeft - 8, y + 4);
        }

        // 绘制数据曲线
        const len = series.length;
        const step = chartW / (len - 1);
        
        // 绘制渐变填充
        const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
        gradient.addColorStop(0, "rgba(61, 185, 240, 0.20)");
        gradient.addColorStop(1, "rgba(61, 185, 240, 0.02)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, height - paddingBottom);
        series.forEach((val, i) => {
          const x = paddingLeft + i * step;
          const normalized = (val - yMin) / (yMax - yMin);
          const y = paddingTop + chartH * (1 - normalized);
          if (i === 0) ctx.lineTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.lineTo(width - paddingRight, height - paddingBottom);
        ctx.closePath();
        ctx.fill();

        // 绘制折线
        ctx.strokeStyle = "#3DB9F0";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        series.forEach((val, i) => {
          const x = paddingLeft + i * step;
          const normalized = (val - yMin) / (yMax - yMin);
          const y = paddingTop + chartH * (1 - normalized);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
  },

  // ★ 新增：心动图卡的ECG波形
  drawEcgChart() {
    const query = wx.createSelectorQuery();
    query.select("#ecgChart")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // 浅色网格背景
        ctx.strokeStyle = "rgba(220, 210, 200, 0.45)";
        ctx.lineWidth = 0.8;
        const gridSize = 10;
        for (let x = 0; x <= width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 生成PQRST波形（3个完整心搏）
        const drawPQRST = (startX) => {
          const points = [];
          const width_pqrst = 80; // 单个心搏宽度
          
          for (let i = 0; i < width_pqrst; i++) {
            const t = i / width_pqrst;
            let y = 0.5;
            
            // P波（小峰）0-0.1
            if (t < 0.1) {
              y = 0.5 + 0.08 * Math.sin(t * Math.PI / 0.1);
            }
            // Q波（小凹）0.1-0.2
            else if (t < 0.2) {
              const q = (t - 0.1) / 0.1;
              y = 0.5 - 0.05 * Math.sin(q * Math.PI);
            }
            // R波（大尖峰）0.2-0.35
            else if (t < 0.35) {
              const r = (t - 0.2) / 0.15;
              y = 0.5 + 0.4 * Math.sin(r * Math.PI);
            }
            // S波（小凹）0.35-0.5
            else if (t < 0.5) {
              const s = (t - 0.35) / 0.15;
              y = 0.5 - 0.08 * Math.sin(s * Math.PI);
            }
            // T波（圆峰）0.5-0.75
            else if (t < 0.75) {
              const t_wave = (t - 0.5) / 0.25;
              y = 0.5 + 0.12 * Math.sin(t_wave * Math.PI);
            }
            // 基线恢复 0.75-1
            else {
              const recover = (t - 0.75) / 0.25;
              y = 0.5 + 0.12 * Math.sin(Math.PI) * (1 - recover);
            }
            
            points.push({
              x: startX + i,
              y: y * height
            });
          }
          return points;
        };

        // 绘制3个完整心搏
        const paddingLeft = 20;
        const totalWidth = width - paddingLeft - 20;
        const heartbeatWidth = totalWidth / 3;
        
        ctx.strokeStyle = "#D89B5C";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        for (let beat = 0; beat < 3; beat++) {
          const beatPoints = drawPQRST(0);
          const scale = heartbeatWidth / 80;
          
          ctx.beginPath();
          beatPoints.forEach((point, i) => {
            const x = paddingLeft + beat * heartbeatWidth + point.x * scale;
            const y = point.y;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      });
  },

  // ★ 新增：顶部封面指数仪表
  drawIndexGaugeMini() {
    // CSS实现，无需canvas绘图
    return;
  },

  drawMovementTrend() {
    const query = wx.createSelectorQuery();
    query.select("#movementTrend")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        const movement = (this.data.movementSeries || []).map((v) => Number(v));
        const turnover = (this.data.turnoverSeries || []).map((v) => Number(v));
        if (movement.length < 2 || turnover.length < 2) return;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const paddingX = 8;
        const paddingTop = 12;
        const paddingBottom = 10;
        const chartW = width - paddingX * 2;
        const chartH = height - paddingTop - paddingBottom;
        const tickCount = (this.data.movementTimeTicks || []).length;
        const len = Math.min(movement.length, turnover.length);
        const merged = movement.slice(0, len).concat(turnover.slice(0, len));
        const min = Math.min(0, ...merged);
        const max = Math.max(1, ...merged);
        const range = Math.max(1, max - min);

        ctx.strokeStyle = "#d8e7e2";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        [0.2, 0.45, 0.7, 0.92].forEach((r) => {
          const y = paddingTop + chartH * r;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        if (tickCount > 1) {
          ctx.strokeStyle = "rgba(140, 166, 160, 0.22)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 7]);
          for (let i = 0; i < tickCount; i += 1) {
            const x = paddingX + (chartW / (tickCount - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, paddingTop);
            ctx.lineTo(x, paddingTop + chartH);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        const drawSeries = (series, color, fillColor) => {
          const step = chartW / (len - 1);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.shadowColor = `${color}55`;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          series.slice(0, len).forEach((v, i) => {
            const x = paddingX + i * step;
            const t = (v - min) / range;
            const y = paddingTop + (1 - t) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (!fillColor) return;
          ctx.beginPath();
          series.slice(0, len).forEach((v, i) => {
            const x = paddingX + i * step;
            const t = (v - min) / range;
            const y = paddingTop + (1 - t) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.lineTo(paddingX + (len - 1) * step, paddingTop + chartH);
          ctx.lineTo(paddingX, paddingTop + chartH);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
        };

        drawSeries(movement, "#4fc3d8", "rgba(79, 195, 216, 0.10)");
        drawSeries(turnover, "#c95b77", "rgba(201, 91, 119, 0.12)");
      });
  },

  enableMonitor() {
    this.setData({ monitorEnabled: true });
    wx.showToast({ title: "已开启", icon: "success" });
  },

  managePermission() {
    wx.showToast({ title: "请在系统设置中管理权限", icon: "none" });
  },

  onTapStageLegend(e) {
    const key = e.currentTarget.dataset.key;
    const next = this.data.activeStageKey === key ? null : key;
    this.setData({ activeStageKey: next }, () => this.drawSleepCycle());
  },

  getPhaseStrokeColor(stage, alpha = 1) {
    const colorMap = {
      awake: `rgba(207, 217, 232, ${alpha})`,
      dream: `rgba(177, 93, 255, ${alpha})`,
      light: `rgba(113, 191, 209, ${alpha})`,
      deep: `rgba(0, 166, 160, ${alpha})`
    };
    return colorMap[stage] || `rgba(113, 191, 209, ${alpha})`;
  },

  drawSleepCycle() {
    const query = wx.createSelectorQuery();
    query.select("#sleepCycle")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const points = this.data.sleepPhasePoints || [];
        if (points.length < 2) return;

        const activeStage = this.data.activeStageKey;
        const paddingX = 10;
        const paddingTop = 18;
        const paddingBottom = 18;
        const chartW = width - paddingX * 2;
        const chartH = height - paddingTop - paddingBottom;
        const tickCount = (this.data.phaseTimeTicks || []).length;

        // 深色背景下的虚线网格
        ctx.strokeStyle = "rgba(129, 168, 185, 0.24)";
        ctx.lineWidth = 1;
        ctx.setLineDash([7, 8]);
        [0.2, 0.5, 0.8].forEach((r) => {
          const y = paddingTop + chartH * r;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // 与下方时间刻度对齐的竖向虚线，向上延伸到折线图
        if (tickCount > 1) {
          ctx.strokeStyle = "rgba(129, 168, 185, 0.16)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 8]);
          for (let i = 0; i < tickCount; i += 1) {
            const x = paddingX + (chartW / (tickCount - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, paddingTop);
            ctx.lineTo(x, paddingTop + chartH);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // 分段着色折线，按图例点击高亮
        const step = chartW / (points.length - 1);
        for (let i = 0; i < points.length - 1; i += 1) {
          const curr = points[i];
          const next = points[i + 1];
          const isFocus = !activeStage || activeStage === curr.stage;
          const alpha = isFocus ? 1 : 0.28;
          const lineW = activeStage && isFocus ? 4 : 2.2;
          const x1 = paddingX + i * step;
          const x2 = paddingX + (i + 1) * step;
          const y1 = paddingTop + (1 - curr.level) * chartH;
          const y2 = paddingTop + (1 - next.level) * chartH;

          ctx.strokeStyle = this.getPhaseStrokeColor(curr.stage, alpha);
          ctx.lineWidth = lineW;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          if (activeStage && isFocus) {
            ctx.shadowColor = this.getPhaseStrokeColor(curr.stage, 0.65);
            ctx.shadowBlur = 10;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      });
  },

  drawTrendLine({ selector, color, series = [], config = {} } = {}) {
    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !series || series.length < 2) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const cleanSeries = series.map((v) => Number(v)).filter((v) => Number.isFinite(v));
        if (cleanSeries.length < 2) return;

        const leftPad = 40;
        const rightPad = 10;
        const paddingTop = 18;
        const paddingBottom = 12;
        const chartW = width - leftPad - rightPad;
        const chartH = height - paddingTop - paddingBottom;
        const tickCount = (config.timeTicks || this.data.trendTimeTicks || []).length;

        const rawMin = Math.min(...cleanSeries);
        const rawMax = Math.max(...cleanSeries);
        const baseRange = Math.max(1, rawMax - rawMin);
        const axisMin = Number.isFinite(config.yMin) ? config.yMin : Math.floor(rawMin - baseRange * 0.18);
        const axisMax = Number.isFinite(config.yMax) ? config.yMax : Math.ceil(rawMax + baseRange * 0.18);
        const axisRange = Math.max(1, axisMax - axisMin);
        const valueToY = (v) => paddingTop + ((axisMax - v) / axisRange) * chartH;
        const formatTick = (v) => {
          const rounded = Math.round(v);
          if (Math.abs(v - rounded) < 0.08) return `${rounded}`;
          return v.toFixed(1);
        };

        // 横向网格 + 纵轴刻度值
        ctx.strokeStyle = config.gridColor || "#d8e7e2";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        const horizontalTicks = Number.isFinite(config.horizontalTicks) ? Math.max(2, config.horizontalTicks) : 4;
        for (let i = 0; i <= horizontalTicks; i += 1) {
          const ratio = i / horizontalTicks;
          const y = paddingTop + chartH * ratio;
          const tickValue = axisMax - axisRange * ratio;
          ctx.beginPath();
          ctx.moveTo(leftPad, y);
          ctx.lineTo(width - rightPad, y);
          ctx.stroke();
          ctx.fillStyle = config.tickColor || "#89a29b";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(formatTick(tickValue), 2, y);
        }
        ctx.setLineDash([]);

        // 与时间刻度对齐的竖向虚线
        const showVerticalGrid = config.showVerticalGrid !== false;
        if (showVerticalGrid && tickCount > 1) {
          ctx.strokeStyle = "rgba(140, 166, 160, 0.22)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 7]);
          for (let i = 0; i < tickCount; i += 1) {
            const x = leftPad + (chartW / (tickCount - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, paddingTop);
            ctx.lineTo(x, paddingTop + chartH);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // 折线主体
        const step = chartW / (cleanSeries.length - 1);
        const points = cleanSeries.map((v, i) => ({
          x: leftPad + i * step,
          y: valueToY(v)
        }));

        if (config.fillUnder) {
          ctx.beginPath();
          points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
          ctx.lineTo(points[0].x, paddingTop + chartH);
          ctx.closePath();
          ctx.fillStyle = config.fillColor || "rgba(88, 199, 245, 0.08)";
          ctx.fill();
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = Number(config.lineWidth) || 2.6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = `${color}66`;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        if (config.smooth) {
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < points.length - 1; i += 1) {
            const current = points[i];
            const next = points[i + 1];
            const cx = (current.x + next.x) / 2;
            const cy = (current.y + next.y) / 2;
            ctx.quadraticCurveTo(current.x, current.y, cx, cy);
          }
          const last = points[points.length - 1];
          ctx.lineTo(last.x, last.y);
        } else {
          cleanSeries.forEach((v, i) => {
            const x = leftPad + i * step;
            const y = valueToY(v);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
  },

  drawEcgTrend() {
    const query = wx.createSelectorQuery();
    query.select("#ecgTrend")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        const series = this.data.ecgSeries || [];
        if (series.length < 2) return;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // ECG 网格背景
        ctx.strokeStyle = "#edf1ef";
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "#dfe7e4";
        for (let x = 0; x <= width; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += 48) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // ECG 橙色折线
        const paddingX = 8;
        const chartW = width - paddingX * 2;
        const step = chartW / (series.length - 1);
        ctx.strokeStyle = "#d8a063";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        series.forEach((v, i) => {
          const x = paddingX + i * step;
          const y = (1 - v) * (height - 16) + 8;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
  },

  drawHeartIndexGauge() {
    const query = wx.createSelectorQuery();
    query.select("#heartIndexGauge")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        const value = Math.max(0, Math.min(100, Number(this.data.heartIndexValue) || 0));
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const barY = height * 0.52;
        const left = 16;
        const right = width - 16;
        const barH = 18;
        const barW = right - left;

        const gradient = ctx.createLinearGradient(left, 0, right, 0);
        gradient.addColorStop(0, "#f4a8a8");
        gradient.addColorStop(0.5, "#f8f5f5");
        gradient.addColorStop(1, "#8ed8fb");
        ctx.fillStyle = gradient;
        const r = 9;
        const yTop = barY - barH / 2;
        const yBottom = barY + barH / 2;
        ctx.beginPath();
        ctx.moveTo(left + r, yTop);
        ctx.lineTo(right - r, yTop);
        ctx.quadraticCurveTo(right, yTop, right, yTop + r);
        ctx.lineTo(right, yBottom - r);
        ctx.quadraticCurveTo(right, yBottom, right - r, yBottom);
        ctx.lineTo(left + r, yBottom);
        ctx.quadraticCurveTo(left, yBottom, left, yBottom - r);
        ctx.lineTo(left, yTop + r);
        ctx.quadraticCurveTo(left, yTop, left + r, yTop);
        ctx.closePath();
        ctx.fill();

        // 刻度线
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i <= 10; i += 1) {
          const x = left + (barW / 10) * i;
          ctx.beginPath();
          ctx.moveTo(x, barY - 6);
          ctx.lineTo(x, barY + 6);
          ctx.stroke();
        }

        // 指针
        const pointerX = left + (value / 100) * barW;
        ctx.strokeStyle = "#38454a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pointerX, barY - 16);
        ctx.lineTo(pointerX, barY + 16);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(pointerX, barY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38454a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
  },

  drawSimpleBars(selector, color, series = []) {
    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = "#d8e7e2";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.35);
        ctx.lineTo(width, height * 0.35);
        ctx.stroke();
        ctx.setLineDash([]);

        const bars = series.length > 0 ? series.length : 48;
        const bw = width / bars;
        for (let i = 0; i < bars; i += 1) {
          const norm = series.length > 0 ? Math.max(0.08, Math.min(1, Number(series[i]) || 0)) : (0.28 + Math.abs(Math.sin(i * 0.35)) * 0.52);
          const h = 10 + norm * (height * 0.46);
          ctx.fillStyle = `${color}b3`;
          ctx.fillRect(i * bw, height - h - 4, bw - 2, h);
        }
      });
  },

  drawSoundTrend() {
    const query = wx.createSelectorQuery();
    query.select("#soundTrend")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = "#d8e7e2";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.35);
        ctx.lineTo(width, height * 0.35);
        ctx.stroke();
        ctx.setLineDash([]);

        const bars = 56;
        const bw = width / bars;
        for (let i = 0; i < bars; i += 1) {
          const base = 12 + Math.abs(Math.sin(i * 0.23)) * 18;
          let color = "#90a4ae";
          if (i % 17 === 0) color = "#ef5350";
          if (i % 11 === 0) color = "#f6b04f";
          ctx.fillStyle = color;
          ctx.fillRect(i * bw, height - base - 4, bw - 2, base);
        }
      });
  },

  // 绘制三个独立时间数轴
  drawTimeAxes() {
    const axisMeta = this.buildDynamicTimeAxisMeta();
    this.setData({
      timeAxisTicks: axisMeta.ticks,
      timeAxisRange: {
        start: axisMeta.start,
        end: axisMeta.end
      }
    });

    const axisConfigs = [
      {
        selector: "#timeAxis0",
        duration: this.data.sleepTimeline.previousNight.duration,
        bedTime: this.data.sleepTimeline.previousNight.bedTime,
        wakeTime: this.data.sleepTimeline.previousNight.wakeTime,
        color: "#b88c56",
        lineStyle: "solid",
        axisStart: axisMeta.start,
        axisEnd: axisMeta.end
      },
      {
        selector: "#timeAxis1",
        duration: this.data.sleepTimeline.lastNight.duration,
        bedTime: this.data.sleepTimeline.lastNight.bedTime,
        wakeTime: this.data.sleepTimeline.lastNight.wakeTime,
        color: "#d39a4b",
        lineStyle: "solid",
        axisStart: axisMeta.start,
        axisEnd: axisMeta.end
      },
      {
        selector: "#timeAxis2",
        duration: this.data.sleepTimeline.suggestedTonight.duration,
        bedTime: this.data.sleepTimeline.suggestedTonight.bedTime,
        wakeTime: this.data.sleepTimeline.suggestedTonight.wakeTime,
        color: "#7ea8d7",
        lineStyle: "dashed",
        axisStart: axisMeta.start,
        axisEnd: axisMeta.end
      }
    ];

    axisConfigs.forEach((config) => this.drawSingleTimeAxis(config));
  },

  updateDynamicTimeAxis() {
    const axisMeta = this.buildDynamicTimeAxisMeta();
    this.setData({
      timeAxisTicks: axisMeta.ticks,
      timeAxisRange: {
        start: axisMeta.start,
        end: axisMeta.end
      }
    });
  },

  parseClockMinutes(timeText = "") {
    const match = /^(\d{1,2}):(\d{2})$/.exec(timeText);
    if (!match) return NaN;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return NaN;
    return hour * 60 + minute;
  },

  normalizeSleepWindow(bedTime, wakeTime) {
    const bedAbs = this.parseClockMinutes(bedTime);
    const wakeRaw = this.parseClockMinutes(wakeTime);
    if (!Number.isFinite(bedAbs) || !Number.isFinite(wakeRaw)) {
      return null;
    }
    let wakeAbs = wakeRaw;
    if (wakeAbs <= bedAbs) {
      wakeAbs += 24 * 60;
    }
    return { bedAbs, wakeAbs };
  },

  formatAxisLabel(minutesAbs) {
    const dayMinutes = 24 * 60;
    let normalized = Math.round(minutesAbs) % dayMinutes;
    if (normalized < 0) normalized += dayMinutes;
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  },

  buildDynamicTimeAxisMeta() {
    const timeline = this.data.sleepTimeline || {};
    const windows = Object.keys(timeline)
      .map((key) => this.normalizeSleepWindow(timeline[key].bedTime, timeline[key].wakeTime))
      .filter((item) => item && item.wakeAbs > item.bedAbs);

    if (!windows.length) {
      return {
        start: 23 * 60,
        end: 32 * 60,
        ticks: ["08:00", "05:00", "02:00", "23:00"]
      };
    }

    const padMinutes = 30;
    const snapMinutes = 30;
    const rawStart = Math.min(...windows.map((w) => w.bedAbs)) - padMinutes;
    const rawEnd = Math.max(...windows.map((w) => w.wakeAbs)) + padMinutes;
    const minSpan = 6 * 60;
    const center = (rawStart + rawEnd) / 2;
    const expandedStart = rawEnd - rawStart >= minSpan ? rawStart : center - minSpan / 2;
    const expandedEnd = rawEnd - rawStart >= minSpan ? rawEnd : center + minSpan / 2;
    const axisStart = Math.floor(expandedStart / snapMinutes) * snapMinutes;
    const axisEnd = Math.ceil(expandedEnd / snapMinutes) * snapMinutes;
    const tickCount = 4;
    const ticks = Array.from({ length: tickCount }, (_, index) => {
      const ratio = index / (tickCount - 1);
      const value = axisEnd - (axisEnd - axisStart) * ratio;
      return this.formatAxisLabel(value);
    });

    return { start: axisStart, end: axisEnd, ticks };
  },

  parseDurationHours(durationText) {
    const match = /(\d+)h(\d+)m/i.exec(durationText || "");
    if (!match) return 0;
    const hours = Number(match[1]) || 0;
    const mins = Number(match[2]) || 0;
    return hours + mins / 60;
  },

  drawSingleTimeAxis(config) {
    const query = wx.createSelectorQuery();
    query.select(config.selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const top = 12;
        const bottom = height - 12;
        const centerX = width / 2;
        const barWidth = Math.max(16, Math.min(26, width * 0.36));
        const rangeMin = Number(config.axisStart);
        const rangeMax = Number(config.axisEnd);
        const range = Math.max(1, rangeMax - rangeMin);
        const sleepWindow = this.normalizeSleepWindow(config.bedTime, config.wakeTime);
        if (!sleepWindow) return;

        const valueToY = (minutesAbs) => {
          const y = top + ((rangeMax - minutesAbs) / range) * (bottom - top);
          return Math.max(top, Math.min(bottom, y));
        };

        const barTop = valueToY(sleepWindow.wakeAbs);
        const barBottom = valueToY(sleepWindow.bedAbs);
        const barHeight = Math.max(2, barBottom - barTop);

        // 轻背景辅助线，降低存在感
        ctx.strokeStyle = "rgba(141, 168, 184, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        const gridCount = 5;
        for (let i = 0; i < gridCount; i += 1) {
          const y = top + ((bottom - top) / (gridCount - 1)) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // 主柱体：平面化分组柱
        ctx.fillStyle = config.color;
        const x = centerX - barWidth / 2;
        const y = barTop;
        const w = barWidth;
        const h = barHeight;
        const r = Math.min(4, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();

        // 建议值维持轻量虚线语义
        if (config.lineStyle === "dashed") {
          ctx.strokeStyle = "rgba(126, 168, 215, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(centerX, top);
          ctx.lineTo(centerX, barTop);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 顶底端点提示，增强起床/入睡位置辨识度
        ctx.strokeStyle = "rgba(91, 107, 115, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX - barWidth / 2 - 4, barTop);
        ctx.lineTo(centerX + barWidth / 2 + 4, barTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX - barWidth / 2 - 4, barBottom);
        ctx.lineTo(centerX + barWidth / 2 + 4, barBottom);
        ctx.stroke();
      });
  }
});