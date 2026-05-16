const CHART_META = {
  duration: { name: "睡眠时长", yType: "number", min: 6, max: 10, reference: 8, healthyRange: [7, 9], unit: "h", decimals: 1, color: "#59d7cd", fill: "rgba(89,215,205,0.18)", referenceLabel: "健康参考线(7-9h)" },
  efficiency: { name: "睡眠效率", yType: "number", min: 70, max: 100, reference: 80, healthyRange: [80, 100], unit: "%", decimals: 0, color: "#78bdf7", referenceLabel: "健康参考线(80%)" },
  prep: { name: "入睡准备时长", yType: "number", min: 0, max: 50, reference: 20, healthyRange: [0, 20], unit: "min", decimals: 0, color: "#f2b26b", referenceLabel: "健康参考线(20min)" },
  deep: { name: "深睡占比", yType: "number", min: 10, max: 30, reference: 20, healthyRange: [15, 25], unit: "%", decimals: 0, color: "#84a7f8", referenceLabel: "健康参考线(20%)" },
  breathRate: { name: "平均夜间呼吸频率", yType: "number", min: 8, max: 22, reference: 15, healthyRange: [12, 20], unit: "次/分", decimals: 0, color: "#58cfd0", referenceLabel: "健康参考线(12-20次/分)" },
  ahi: { name: "AHI呼吸暂停指数", yType: "number", min: 0, max: 10, reference: 5, warningRange: [5, 10], unit: "次/小时", decimals: 1, color: "#ff8b8b", isWarning: true, referenceLabel: "健康警戒线(5次/小时)" },
  apnea: { name: "最长呼吸暂停时长", yType: "number", min: 0, max: 30, reference: 10, warningRange: [10, 30], unit: "秒", decimals: 0, color: "#ff9a85", isWarning: true, referenceLabel: "健康警戒线(10秒)" },
  heartRate: {
    name: "夜间平均心率",
    yType: "number",
    min: 40,
    max: 100,
    reference: 60,
    healthyRange: [45, 70],
    unit: "bpm",
    decimals: 0,
    color: "#ff8fb5",
    referenceLabel: "健康参考线(45-70bpm)",
    barMode: "floating"
  },
  hrv: {
    name: "HRV心率变异性",
    yType: "number",
    min: 0,
    max: 150,
    reference: 100,
    healthyRange: [30, 100],
    unit: "",
    decimals: 0,
    color: "#ca92ff",
    referenceLabel: "健康参考线(30-100)",
    barMode: "baseline"
  },
  heartIndex: {
    name: "心脏健康指数",
    yType: "number",
    min: 0,
    max: 100,
    reference: 80,
    healthyRange: [80, 100],
    unit: "分",
    decimals: 0,
    color: "#9f9bff",
    referenceLabel: "健康参考线(80分)",
    barMode: "baseline"
  },
  noise: { name: "环境平均噪音", yType: "number", min: 0, max: 60, reference: 35, warningRange: [35, 60], unit: "dB", decimals: 0, color: "#ffbe72", isWarning: true, referenceLabel: "健康警戒线(35分贝)" },
  snore: { name: "鼾声总频次", yType: "number", min: 0, max: 20, reference: 5, warningRange: [5, 20], unit: "次", decimals: 0, color: "#ffb086", isWarning: true, referenceLabel: "健康警戒线(5次)" },
  noiseImpact: { name: "噪音睡眠影响占比", yType: "number", min: 0, max: 50, reference: 15, warningRange: [15, 50], unit: "%", decimals: 0, color: "#d3b0a0", isWarning: true, referenceLabel: "健康警戒线(15%)" }
};

const CHART_SELECTOR = {
  duration: "#durationChart",
  efficiency: "#efficiencyChart",
  prep: "#prepChart",
  deep: "#deepChart",
  breathRate: "#breathRateChart",
  ahi: "#ahiChart",
  apnea: "#apneaChart",
  heartRate: "#heartRateChart",
  hrv: "#hrvChart",
  heartIndex: "#heartIndexChart",
  noise: "#noiseChart",
  snore: "#snoreChart",
  noiseImpact: "#noiseImpactChart"
};

const WEEKDAY_CN = ["日", "一", "二", "三", "四", "五", "六"];
const KLINE_BED_WAKE = [
  ["23:10", "07:36"], ["23:28", "07:49"], ["00:42", "08:56"], ["23:26", "07:52"], ["23:35", "07:58"],
  ["23:22", "07:41"], ["23:18", "07:44"], ["23:31", "07:57"], ["00:55", "08:42"], ["23:20", "07:50"],
  ["23:36", "07:59"], ["23:42", "08:06"], ["23:24", "07:43"], ["23:29", "07:55"], ["00:38", "08:35"],
  ["23:34", "08:02"], ["23:19", "07:47"], ["23:16", "07:43"], ["23:27", "07:52"], ["23:41", "08:03"],
  ["23:30", "07:58"], ["00:48", "08:47"], ["23:24", "07:49"], ["23:35", "08:01"], ["23:15", "07:42"],
  ["23:22", "07:46"], ["23:31", "07:56"], ["23:39", "08:07"], ["00:43", "08:39"], ["23:26", "07:51"]
];

function formatKlineDateLabel(date) {
  return `${date.getMonth() + 1}.${date.getDate()}（${WEEKDAY_CN[date.getDay()]}）`;
}

function createKlineSource() {
  const start = new Date(2026, 4, 3); // 2026-05-03
  return KLINE_BED_WAKE.map(([bedTime, wakeTime], index) => {
    const current = new Date(start.getTime());
    current.setDate(start.getDate() + index);
    return {
      date: formatKlineDateLabel(current),
      bedTime,
      wakeTime
    };
  });
}

const KLINE_SOURCE = createKlineSource();

Page({
  data: {
    period: "7",
    windowStart: 0,
    windowSize: 7,
    visibleLabels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    lineAxisLabels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    longLabels: ["首次使用", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "当前"],
    pointTips: {},
    activePointIndexByChart: {},
    expanded: {
      sleep: false,
      breath: false,
      heart: false,
      sound: false
    },
    focusModule: "",
    focusMetric: "",
    summary: {
      trendText: "睡眠稳定性上升，波动幅度下降约18%",
      avgDuration: "8小时12分",
      avgScore: 84
    },
    periodLabel: {
      "7": "近7天",
      "30": "近30天",
      "90": "近90天"
    },
    klineSeries: KLINE_SOURCE,
    klineSummary: {
      avgBed: "23:25",
      avgWake: "07:49",
      healthyBedRate: 77,
      regularity: 81
    },
    klineScrollbarWidth: 100,
    klineScrollbarOffset: 0,
    klineControlState: {
      canJumpStart: false,
      canPrev: false,
      canNext: false,
      canJumpEnd: false,
      canZoomIn: false,
      canZoomOut: false
    },
    // 睡眠趋势数据
    durationSeries: {
      "7": [7.8, 8.2, 8.0, 8.3, 8.1, 8.4, 8.2],
      "30": [7.2, 7.5, 7.8, 8.1, 8.3, 8.0, 8.2, 7.9, 8.1, 8.4, 8.5, 8.2, 8.3, 8.6, 8.4, 8.5, 8.3, 8.4, 8.6, 8.5, 8.4, 8.5, 8.6, 8.4, 8.5, 8.3, 8.4, 8.5, 8.6, 8.4],
      "90": [6.8, 6.9, 7.0, 7.1, 7.3, 7.5, 7.6, 7.8, 7.9, 8.0, 8.1, 8.2, 8.1, 8.2, 8.3, 8.4, 8.3, 8.4, 8.5, 8.4, 8.5, 8.6, 8.5, 8.6, 8.5, 8.6, 8.7, 8.6, 8.7, 8.8]
    },
    efficiencySeries: {
      "7": [83, 85, 84, 86, 84, 85, 85],
      "30": [80, 81, 82, 83, 82, 84, 85, 84, 83, 85, 86, 85, 84, 86, 85, 84, 85, 86, 85, 84, 85, 86, 85, 84, 85, 86, 85, 84, 85, 86],
      "90": [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 91, 92, 92, 93, 93, 94, 94]
    },
    prepSeries: {
      "7": [32, 28, 35, 24, 40, 26, 30],
      "30": [38, 36, 34, 32, 31, 30, 28, 35, 32, 27, 29, 30, 24, 28, 33, 31, 29, 26, 24, 30, 28, 35, 40, 36, 32, 28, 24, 25, 27, 30],
      "90": [45, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    },
    deepSeries: {
      "7": [19, 20, 21, 19, 22, 20, 20],
      "30": [18, 18, 19, 20, 21, 20, 19, 20, 21, 20, 19, 20, 21, 22, 20, 19, 20, 21, 22, 21, 20, 21, 22, 21, 20, 21, 22, 21, 20, 20],
      "90": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25]
    },
    // 呼吸健康数据
    breathRateSeries: {
      "7": [14, 15, 13, 14, 15, 14, 14],
      "30": [16, 15, 15, 14, 14, 14, 13, 14, 15, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14],
      "90": [18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13]
    },
    ahiSeries: {
      "7": [1.2, 1.0, 1.3, 0.9, 1.1, 0.8, 1.0],
      "30": [2.5, 2.3, 2.1, 1.9, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.7, 0.7, 0.6, 0.6, 0.5, 0.5, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.1],
      "90": [4.5, 4.3, 4.1, 3.9, 3.7, 3.5, 3.3, 3.1, 2.9, 2.7, 2.5, 2.3, 2.1, 1.9, 1.7, 1.5, 1.3, 1.1, 0.9, 0.7, 0.5, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
    },
    apneaSeries: {
      "7": [8, 7, 9, 6, 8, 5, 7],
      "30": [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
      "90": [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0]
    },
    // 心肺健康数据
    heartRateSeries: {
      "7": [68, 67, 69, 66, 68, 65, 67],
      "30": [72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43],
      "90": [75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46]
    },
    heartRateMinSeries: {
      "7": [62, 70, 58, 68, 78, 64, 60],
      "30": [72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43],
      "90": [75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46]
    },
    heartRate14DayAvg: {
      "7": [76, 75, 74, 73, 72.5, 72, 72],
      "30": [72, 72, 71, 71, 70, 70, 69, 68, 68, 67, 66, 65, 64, 63, 62, 61, 60, 60, 59, 58, 57, 56, 55, 54, 54, 53, 52, 51, 50, 50],
      "90": [75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46]
    },
    hrvSeries: {
      "7": [45, 48, 46, 50, 47, 52, 49],
      "30": [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88],
      "90": [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78]
    },
    hrvMinSeries: {
      "7": [32, 25, 45, 95, 40, 55, 60],
      "30": [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88],
      "90": [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78]
    },
    hrv14DayAvg: {
      "7": [55, 57, 59, 61, 62, 65, 68],
      "30": [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88],
      "90": [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78]
    },
    heartIndexSeries: {
      "7": [92, 93, 91, 94, 92, 95, 93],
      "30": [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97, 97, 98, 98, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      "90": [70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
    },
    // 睡眠声音数据
    noiseSeries: {
      "7": [32, 30, 35, 28, 33, 29, 31],
      "30": [42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13],
      "90": [50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21]
    },
    snoreSeries: {
      "7": [5, 4, 6, 3, 5, 4, 4],
      "30": [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      "90": [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    noiseImpactSeries: {
      "7": [12, 10, 15, 8, 13, 9, 11],
      "30": [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
      "90": [35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6]
    }
  },

  onLoad(options) {
    if (options && options.module && options.metric) {
      wx.setStorageSync("longterm-focus-target", {
        module: options.module,
        metric: options.metric,
        ts: Date.now()
      });
    }
  },

  onShow() {
    this.consumeLongtermFocus();
  },

  onUnload() {
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
  },

  onReady() {
    this.resetWindowByPeriod();
    this.resetPointTips(() => this.renderAll());
  },

  consumeLongtermFocus() {
    const target = wx.getStorageSync("longterm-focus-target");
    if (!target || !target.module || !target.metric) return;
    wx.removeStorageSync("longterm-focus-target");
    this.applyLongtermFocus(target.module, target.metric);
  },

  applyLongtermFocus(module, metric) {
    const expanded = { ...this.data.expanded, [module]: true };
    this.setData(
      {
        expanded,
        focusModule: module,
        focusMetric: metric
      },
      () => {
        setTimeout(() => this.renderModuleCharts(module), 100);
        if (this.focusTimer) clearTimeout(this.focusTimer);
        this.focusTimer = setTimeout(() => {
          this.setData({ focusModule: "", focusMetric: "" });
        }, 3000);
      }
    );
  },

  // 展开/收起模块
  toggleModule(e) {
    const module = e.currentTarget.dataset.module;
    const expanded = { ...this.data.expanded };
    expanded[module] = !expanded[module];
    this.setData({ expanded }, () => {
      // 展开后重新渲染该模块的图表
      if (expanded[module]) {
        setTimeout(() => this.renderModuleCharts(module), 100);
      }
    });
  },

  // 渲染指定模块的图表
  renderModuleCharts(module) {
    switch(module) {
      case 'sleep':
        this.drawDurationTrend();
        this.drawEfficiencyTrend();
        this.drawPrepTrend();
        this.drawDeepTrend();
        break;
      case 'breath':
        this.drawBreathRateTrend();
        this.drawAhiTrend();
        this.drawApneaTrend();
        break;
      case 'heart':
        this.drawHeartRateTrend();
        this.drawHrvTrend();
        this.drawHeartIndexTrend();
        break;
      case 'sound':
        this.drawNoiseTrend();
        this.drawSnoreTrend();
        this.drawNoiseImpactTrend();
        break;
    }
  },

  switchPeriod(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ period }, () => {
      this.resetWindowByPeriod();
      this.resetPointTips(() => this.renderAll());
    });
  },

  panLeft() {
    if (!this.data.klineControlState.canPrev) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 2));
    this.shiftWindow(-step);
  },

  panRight() {
    if (!this.data.klineControlState.canNext) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 2));
    this.shiftWindow(step);
  },

  shiftWindow(delta) {
    const maxStart = this.getMaxWindowStart(this.data.windowSize);
    const next = Math.max(0, Math.min(maxStart, this.data.windowStart + delta));
    if (next === this.data.windowStart) return;
    this.setData({ windowStart: next }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  jumpToStart() {
    if (!this.data.klineControlState.canJumpStart) return;
    this.setData({ windowStart: 0 }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  jumpToEnd() {
    if (!this.data.klineControlState.canJumpEnd) return;
    const start = this.getMaxWindowStart(this.data.windowSize);
    this.setData({ windowStart: start }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  zoomIn() {
    const total = this.getPeriodLength();
    const minSize = this.getMinWindowSize(total);
    if (this.data.windowSize <= minSize || !this.data.klineControlState.canZoomIn) return;
    const nextSize = Math.max(minSize, this.data.windowSize - Math.max(1, Math.floor(this.data.windowSize / 4)));
    const center = this.data.windowStart + Math.floor(this.data.windowSize / 2);
    let nextStart = center - Math.floor(nextSize / 2);
    const maxStart = this.getMaxWindowStart(nextSize);
    nextStart = Math.max(0, Math.min(maxStart, nextStart));
    this.setData({ windowSize: nextSize, windowStart: nextStart }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  zoomOut() {
    const total = this.getPeriodLength();
    if (this.data.windowSize >= total || !this.data.klineControlState.canZoomOut) return;
    const nextSize = Math.min(total, this.data.windowSize + Math.max(1, Math.floor(this.data.windowSize / 3)));
    const center = this.data.windowStart + Math.floor(this.data.windowSize / 2);
    let nextStart = center - Math.floor(nextSize / 2);
    const maxStart = this.getMaxWindowStart(nextSize);
    nextStart = Math.max(0, Math.min(maxStart, nextStart));
    this.setData({ windowSize: nextSize, windowStart: nextStart }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  getPeriodLength() {
    const lineTotal = this.data.durationSeries[this.data.period].length;
    const klineTotal = this.getPeriodKlineSeries().length;
    return Math.min(lineTotal, klineTotal);
  },

  getMinWindowSize(total) {
    const baseline = this.data.period === "7" ? 4 : 7;
    return Math.max(3, Math.min(baseline, total));
  },

  getMaxWindowStart(windowSize = this.data.windowSize) {
    return Math.max(0, this.getPeriodLength() - windowSize);
  },

  resetWindowByPeriod() {
    const total = this.getPeriodLength();
    let size = Math.min(7, total);
    if (this.data.period === "30") size = Math.min(14, total);
    if (this.data.period === "90") size = total;
    const start = Math.max(0, total - size);
    this.setData({ windowSize: size, windowStart: start }, () => {
      this.updateVisibleLabels();
    });
  },

  updateVisibleLabels() {
    const start = this.data.windowStart;
    const size = this.data.windowSize;
    const labels = this.getPeriodKlineSeries()
      .slice(start, start + size)
      .map((item) => item.date);
    const maxStart = this.getMaxWindowStart(size);
    const minSize = this.getMinWindowSize(this.getPeriodLength());
    this.setData({
      visibleLabels: labels,
      lineAxisLabels: this.buildSparseLabels(labels),
      klineScrollbarWidth: this.getPeriodLength() ? (size / this.getPeriodLength()) * 100 : 100,
      klineScrollbarOffset: this.getPeriodLength() ? (start / this.getPeriodLength()) * 100 : 0,
      klineControlState: {
        canJumpStart: start > 0,
        canPrev: start > 0,
        canNext: start < maxStart,
        canJumpEnd: start < maxStart,
        canZoomIn: size > minSize,
        canZoomOut: size < this.getPeriodLength()
      }
    });
    this.updateKlineSummary();
  },

  getVisibleSeries(map) {
    const all = map[this.data.period];
    const start = this.data.windowStart;
    return all.slice(start, start + this.data.windowSize);
  },

  getPeriodKlineSeries() {
    const source = this.data.klineSeries || [];
    if (this.data.period === "7") {
      return source.slice(Math.max(0, source.length - 7));
    }
    return source;
  },

  getVisibleKlineSeries() {
    const source = this.getPeriodKlineSeries();
    return source.slice(this.data.windowStart, this.data.windowStart + this.data.windowSize);
  },

  parseClockToMinutes(text) {
    const [hh, mm] = text.split(":").map((v) => Number(v) || 0);
    return hh * 60 + mm;
  },

  minutesToClock(minutes) {
    const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  },

  clockToAxisValue(text) {
    const minutes = this.parseClockToMinutes(text);
    const total = minutes >= 18 * 60 ? minutes - 18 * 60 : minutes + 6 * 60;
    return total / 60;
  },

  axisToClock(value) {
    const totalMinutes = Math.round(value * 60);
    const clockMinutes = totalMinutes < 360 ? totalMinutes + 18 * 60 : totalMinutes - 6 * 60;
    return this.minutesToClock(clockMinutes);
  },

  isBedHealthy(bedTime) {
    const minutes = this.parseClockToMinutes(bedTime);
    return minutes >= 22 * 60 + 30 && minutes <= 23 * 60 + 30;
  },

  updateKlineSummary() {
    const visible = this.getVisibleKlineSeries();
    if (!visible.length) return;
    const bedMinutes = visible.map((item) => this.parseClockToMinutes(item.bedTime));
    const wakeMinutes = visible.map((item) => this.parseClockToMinutes(item.wakeTime));
    const avgBed = bedMinutes.reduce((sum, value) => sum + value, 0) / bedMinutes.length;
    const avgWake = wakeMinutes.reduce((sum, value) => sum + value, 0) / wakeMinutes.length;
    const healthyCount = visible.filter((item) => this.isBedHealthy(item.bedTime)).length;
    const normalizedBed = bedMinutes.map((value) => (value >= 18 * 60 ? value : value + 24 * 60));
    const mean = normalizedBed.reduce((sum, value) => sum + value, 0) / normalizedBed.length;
    const variance = normalizedBed.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / normalizedBed.length;
    const std = Math.sqrt(variance);
    const regularity = Math.max(55, Math.min(100, Math.round(100 - std / 2.2)));
    this.setData({
      klineSummary: {
        avgBed: this.minutesToClock(avgBed),
        avgWake: this.minutesToClock(avgWake),
        healthyBedRate: Math.round((healthyCount / visible.length) * 100),
        regularity
      }
    });
  },

  onKlineTouchStart(e) {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    this.klinePanStartX = touch.clientX;
    this.klinePanMoved = false;
  },

  onKlineTouchMove(e) {
    const touch = e.touches && e.touches[0];
    if (!touch || typeof this.klinePanStartX !== "number") return;
    const delta = touch.clientX - this.klinePanStartX;
    if (Math.abs(delta) < 34) return;
    if (delta > 0) this.panLeft();
    else this.panRight();
    this.klinePanMoved = true;
    this.klinePanStartX = touch.clientX;
  },

  onKlineTouchEnd() {
    this.klinePanStartX = null;
    this.klinePanMoved = false;
  },

  onScrollbarTouchStart(e) {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    this.klineThumbDragging = true;
    this.klineThumbStartX = touch.clientX;
    this.klineThumbStartOffset = this.data.klineScrollbarOffset;
    this.cacheScrollbarRect();
  },

  onScrollbarTouchMove(e) {
    if (!this.klineThumbDragging) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const trackWidth = this.klineScrollbarRect ? this.klineScrollbarRect.width : 0;
    if (!trackWidth) return;
    const deltaPx = touch.clientX - this.klineThumbStartX;
    const deltaPercent = (deltaPx / trackWidth) * 100;
    const maxOffset = Math.max(0, 100 - this.data.klineScrollbarWidth);
    const nextOffset = Math.max(0, Math.min(maxOffset, this.klineThumbStartOffset + deltaPercent));
    this.syncWindowByScrollbarOffset(nextOffset, true);
  },

  onScrollbarTouchEnd() {
    if (!this.klineThumbDragging) return;
    this.klineThumbDragging = false;
    this.klineThumbStartX = null;
    this.klineThumbStartOffset = null;
    this.resetPointTips(() => this.renderAll());
  },

  onScrollbarTrackTap(e) {
    const touch = this.getChartTouchPoint(e);
    if (!touch) return;
    this.cacheScrollbarRect(() => {
      if (!this.klineScrollbarRect) return;
      const left = this.klineScrollbarRect.left;
      const width = this.klineScrollbarRect.width || 1;
      const tapPercent = ((touch.clientX - left) / width) * 100;
      const targetOffset = tapPercent - this.data.klineScrollbarWidth / 2;
      this.syncWindowByScrollbarOffset(targetOffset, false);
    });
  },

  cacheScrollbarRect(done) {
    const query = wx.createSelectorQuery();
    query.select("#klineScrollbarTrack").boundingClientRect((rect) => {
      this.klineScrollbarRect = rect || null;
      if (done) done();
    }).exec();
  },

  syncWindowByScrollbarOffset(offsetPercent, silent) {
    const maxStart = this.getMaxWindowStart();
    const maxOffset = Math.max(0, 100 - this.data.klineScrollbarWidth);
    const safeOffset = Math.max(0, Math.min(maxOffset, offsetPercent));
    const ratio = maxOffset > 0 ? safeOffset / maxOffset : 0;
    const start = Math.round(ratio * maxStart);
    const apply = () => {
      this.updateVisibleLabels();
      this.drawKlineSchedule();
      if (!silent) {
        this.resetPointTips(() => this.renderAll());
      }
    };
    if (silent) {
      this.setData({ windowStart: start }, apply);
    } else {
      this.setData({ windowStart: start }, apply);
    }
  },

  buildSparseLabels(labels) {
    if (labels.length <= 8) return labels;
    const step = Math.max(1, Math.ceil(labels.length / 6));
    return labels.map((item, index) => {
      if (index === 0 || index === labels.length - 1) return item;
      return index % step === 0 ? item : "";
    });
  },

  buildDefaultPointTips() {
    return {
      duration: "点击节点查看当日睡眠时长",
      efficiency: "点击节点查看当日睡眠效率",
      prep: "点击节点查看当日入睡准备时长",
      deep: "点击节点查看当日深睡占比",
      breathRate: "点击节点查看当日呼吸频率",
      ahi: "点击节点查看当日AHI",
      apnea: "点击节点查看当日最长呼吸暂停时长",
      heartRate: "点击节点查看当日平均心率",
      hrv: "点击节点查看当日HRV",
      heartIndex: "点击节点查看当日心脏健康指数",
      noise: "点击节点查看当日环境噪音",
      snore: "点击节点查看当日鼾声频次",
      noiseImpact: "点击节点查看当日噪音影响占比"
    };
  },

  resetPointTips(callback) {
    this.setData(
      {
        pointTips: this.buildDefaultPointTips(),
        activePointIndexByChart: {}
      },
      callback
    );
  },

  renderAll() {
    this.drawKlineSchedule();
    // 只渲染已展开的模块
    if (this.data.expanded.sleep) {
      this.drawDurationTrend();
      this.drawEfficiencyTrend();
      this.drawPrepTrend();
      this.drawDeepTrend();
    }
    if (this.data.expanded.breath) {
      this.drawBreathRateTrend();
      this.drawAhiTrend();
      this.drawApneaTrend();
    }
    if (this.data.expanded.heart) {
      this.drawHeartRateTrend();
      this.drawHrvTrend();
      this.drawHeartIndexTrend();
    }
    if (this.data.expanded.sound) {
      this.drawNoiseTrend();
      this.drawSnoreTrend();
      this.drawNoiseImpactTrend();
    }
  },

  formatChartValue(meta, value) {
    if (meta.yType === "time") {
      const total = ((Math.round(value) % 1440) + 1440) % 1440;
      const hh = String(Math.floor(total / 60)).padStart(2, "0");
      const mm = String(total % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    const decimals = typeof meta.decimals === "number" ? meta.decimals : 0;
    const number = Number(value).toFixed(decimals);
    return meta.unit ? `${number}${meta.unit}` : `${number}`;
  },

  formatAxisTick(meta, value) {
    if (meta.yType === "time") return this.formatChartValue(meta, value);
    if (meta.max <= 10) return Number(value).toFixed(1);
    return `${Math.round(value)}`;
  },

  drawBackgroundZones(ctx, meta, toY, left, right) {
    const drawZone = (from, to) => {
      const top = Math.min(toY(from), toY(to));
      const bottom = Math.max(toY(from), toY(to));
      ctx.fillRect(left, top, right - left, bottom - top);
    };
    if (Array.isArray(meta.healthyRange)) {
      const [hMin, hMax] = meta.healthyRange;
      ctx.fillStyle = "rgba(124, 95, 146, 0.18)";
      drawZone(meta.min, hMin);
      drawZone(hMax, meta.max);
      return;
    }
    if (Array.isArray(meta.warningRange)) {
      const [wMin, wMax] = meta.warningRange;
      ctx.fillStyle = "rgba(145, 80, 104, 0.20)";
      drawZone(wMin, wMax);
    }
  },

  getChartTouchPoint(event) {
    if (event.changedTouches && event.changedTouches[0]) {
      const t = event.changedTouches[0];
      return {
        x: t.x,
        y: t.y,
        clientX: t.clientX || t.pageX || t.x,
        clientY: t.clientY || t.pageY || t.y
      };
    }
    if (event.detail && typeof event.detail.x === "number") {
      return {
        x: event.detail.x,
        y: event.detail.y,
        clientX: event.detail.x,
        clientY: event.detail.y
      };
    }
    return null;
  },

  onTapChartPoint(e) {
    const chartId = e.currentTarget.dataset.chart;
    if (!chartId || !this.chartHitAreas || !this.chartHitAreas[chartId]) return;
    const area = this.chartHitAreas[chartId];
    const touch = this.getChartTouchPoint(e);
    if (!touch) return;
    const scoreForPoint = (point, x, y) => {
      if (point.barHit) {
        const dx = Math.abs(point.x - x);
        if (dx > point.hitHalfW) return 1e9;
        const tmin = Math.min(point.hitY0, point.hitY1);
        const tmax = Math.max(point.hitY0, point.hitY1);
        if (y < tmin - 6 || y > tmax + 6) return 1e9;
        return dx * 0.2 + Math.abs(y - point.y);
      }
      const dx = point.x - x;
      const dy = point.y - y;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const pickNearest = (x, y) =>
      area.points.reduce((acc, point) => {
        const score = scoreForPoint(point, x, y);
        if (!acc || score < acc.score) return { ...point, score };
        return acc;
      }, null);
    const nearestByRaw = pickNearest(touch.x, touch.y);
    const nearestByOffset = pickNearest(touch.x - area.left, touch.y - area.top);
    const nearest =
      !nearestByRaw || (nearestByOffset && nearestByOffset.score < nearestByRaw.score)
        ? nearestByOffset
        : nearestByRaw;
    const hitLimit = nearest && nearest.barHit ? 80 : 42;
    if (!nearest || nearest.score > hitLimit) return;
    const meta = CHART_META[chartId];
    const tipText = `${nearest.label} · ${meta.name}：${this.formatChartValue(meta, nearest.value)}`;
    this.setData(
      {
        [`pointTips.${chartId}`]: tipText,
        [`activePointIndexByChart.${chartId}`]: nearest.index
      },
      () => this.renderSingleChart(chartId)
    );
  },

  renderSingleChart(chartId) {
    const map = {
      duration: () => this.drawDurationTrend(),
      efficiency: () => this.drawEfficiencyTrend(),
      prep: () => this.drawPrepTrend(),
      deep: () => this.drawDeepTrend(),
      breathRate: () => this.drawBreathRateTrend(),
      ahi: () => this.drawAhiTrend(),
      apnea: () => this.drawApneaTrend(),
      heartRate: () => this.drawHeartRateTrend(),
      hrv: () => this.drawHrvTrend(),
      heartIndex: () => this.drawHeartIndexTrend(),
      noise: () => this.drawNoiseTrend(),
      snore: () => this.drawSnoreTrend(),
      noiseImpact: () => this.drawNoiseImpactTrend()
    };
    if (map[chartId]) map[chartId]();
  },

  drawLine(chartId, data) {
    const selector = CHART_SELECTOR[chartId];
    const meta = CHART_META[chartId];
    if (!selector || !meta) return;
    const query = wx.createSelectorQuery();
    query
      .select(selector)
      .fields({ node: true, size: true, rect: true })
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

        const safeData = Array.isArray(data) && data.length ? data : [meta.reference];
        const nums = safeData.map((v) => Number(v));
        const leftPad = 42;
        const rightPad = 14;
        const topPad = 14;
        const bottomPad = 20;
        const plotLeft = leftPad;
        const plotRight = width - rightPad;
        const plotTop = topPad;
        const plotBottom = height - bottomPad;
        const plotWidth = Math.max(1, plotRight - plotLeft);

        const traceRoundRect = (x, y, w, h, r) => {
          const rr = Math.max(0, Math.min(r, w / 2, h / 2));
          if (rr <= 0) {
            ctx.rect(x, y, w, h);
            return;
          }
          ctx.moveTo(x + rr, y);
          ctx.arcTo(x + w, y, x + w, y + h, rr);
          ctx.arcTo(x + w, y + h, x, y + h, rr);
          ctx.arcTo(x, y + h, x, y, rr);
          ctx.arcTo(x, y, x + w, y, rr);
          ctx.closePath();
        };

        const fillRoundRect = (x, y, w, h, r) => {
          ctx.beginPath();
          traceRoundRect(x, y, w, h, r);
          ctx.fill();
        };

        const barMode = meta.barMode;
        let yAxisMin = meta.min;
        let yAxisMax = meta.max;
        let floatDelta = 4;

        if (barMode === "baseline") {
          yAxisMin = 0;
          const hi = Math.max(...nums, 1);
          const pad = Math.max(hi * 0.14, 6);
          yAxisMax = Math.ceil((hi + pad) / 5) * 5;
          if (chartId === "hrv") {
            yAxisMax = Math.max(yAxisMax, 35);
            yAxisMax = Math.min(yAxisMax, 120);
          } else if (chartId === "heartIndex") {
            yAxisMax = Math.min(100, Math.max(yAxisMax, Math.ceil((hi + 4) / 5) * 5));
            if (yAxisMax - yAxisMin < 18) yAxisMax = Math.min(100, yAxisMin + 20);
          }
        } else if (barMode === "floating") {
          const lo = Math.min(...nums);
          const hi = Math.max(...nums);
          const spread = Math.max(1, hi - lo);
          floatDelta = Math.max(2.8, Math.min(6, spread * 0.12 + 2));
          const pad = Math.max(5, spread * 0.32, 8);
          yAxisMin = Math.floor((lo - floatDelta - pad) / 5) * 5;
          yAxisMax = Math.ceil((hi + floatDelta + pad) / 5) * 5;
          if (yAxisMax - yAxisMin < 28) yAxisMax = yAxisMin + 30;
          yAxisMin = Math.max(35, yAxisMin);
          yAxisMax = Math.min(110, yAxisMax);
        }

        const span = Math.max(1, yAxisMax - yAxisMin);
        const toY = (v) => plotBottom - ((v - yAxisMin) / span) * (plotBottom - plotTop);
        const yMid = Math.round((yAxisMin + yAxisMax) / 2);
        const refClamped = Math.min(yAxisMax, Math.max(yAxisMin, meta.reference));

        const panelGradient = ctx.createLinearGradient(0, 0, 0, height);
        panelGradient.addColorStop(0, "rgba(14, 23, 43, 0.95)");
        panelGradient.addColorStop(1, "rgba(11, 18, 34, 0.92)");
        ctx.fillStyle = panelGradient;
        ctx.fillRect(0, 0, width, height);

        if (barMode) {
          this.drawBackgroundZones(ctx, { ...meta, min: yAxisMin, max: yAxisMax }, toY, plotLeft, plotRight);
        } else {
          this.drawBackgroundZones(ctx, meta, toY, plotLeft, plotRight);
        }

        const yTicks =
          barMode === "baseline" || barMode === "floating"
            ? [yAxisMax, yMid, yAxisMin]
            : [meta.max, meta.reference, meta.min];
        yTicks.forEach((tick, index) => {
          const y = toY(tick);
          const isRefMid =
            !barMode && index === 1;
          const isRefLine =
            isRefMid ||
            (barMode && index === 1 && Math.abs(tick - refClamped) < 0.01);
          ctx.strokeStyle =
            isRefLine && !barMode
              ? "rgba(89, 216, 132, 0.45)"
              : "rgba(167, 181, 212, 0.18)";
          ctx.setLineDash(isRefLine && !barMode ? [8, 8] : [6, 8]);
          ctx.beginPath();
          ctx.moveTo(plotLeft, y);
          ctx.lineTo(plotRight, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(202, 214, 234, 0.78)";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(this.formatAxisTick(meta, tick), leftPad - 6, y + 4);
        });

        const refY = toY(refClamped);
        if (barMode) {
          ctx.strokeStyle = "rgba(89, 216, 132, 0.5)";
          ctx.setLineDash([8, 6]);
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(plotLeft, refY);
          ctx.lineTo(plotRight - 72, refY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = meta.isWarning ? "rgba(255, 174, 174, 0.9)" : "rgba(142, 228, 174, 0.9)";
        ctx.textAlign = "left";
        ctx.font = "12px sans-serif";
        ctx.fillText(meta.referenceLabel, width - 118, refY + 4);

        if (barMode === "baseline" || barMode === "floating") {
          const n = safeData.length;
          const xAt = (i) => (n > 1 ? plotLeft + (i / (n - 1)) * plotWidth : plotLeft + plotWidth / 2);
          const slot = n > 1 ? plotWidth / (n - 1) : plotWidth;
          const barW = Math.min(18, slot * 0.5);
          const activeIndex = this.data.activePointIndexByChart[chartId];
          const points = [];
          const baseLineY = toY(yAxisMin);

          safeData.forEach((raw, i) => {
            const v = Number(raw);
            const cx = xAt(i);
            let hitY0;
            let hitY1;
            let rCap;
            let x;
            let y;
            let w;
            let h;

            if (barMode === "baseline") {
              const yVal = toY(v);
              y = Math.min(yVal, baseLineY - 0.5);
              h = Math.max(baseLineY - y, 6);
              x = cx - barW / 2;
              w = barW;
              rCap = Math.min(barW / 2, 9, h / 2);
              hitY0 = y;
              hitY1 = baseLineY;
            } else {
              const yHi = toY(v + floatDelta);
              const yLo = toY(v - floatDelta);
              const top = Math.min(yHi, yLo);
              h = Math.max(Math.abs(yLo - yHi), 8);
              x = cx - barW / 2;
              w = barW;
              y = top;
              rCap = Math.min(barW / 2, h / 2);
              hitY0 = top;
              hitY1 = top + h;
            }

            const isActive = activeIndex === i;
            const g = ctx.createLinearGradient(x, y, x, y + h);
            g.addColorStop(0, `${meta.color}ee`);
            g.addColorStop(1, `${meta.color}99`);
            ctx.fillStyle = g;
            fillRoundRect(x, y, w, h, rCap);
            ctx.beginPath();
            traceRoundRect(x, y, w, h, rCap);
            ctx.strokeStyle = isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.14)";
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.stroke();

            points.push({
              x: cx,
              y: barMode === "baseline" ? y + h / 2 : y + h / 2,
              index: i,
              value: v,
              label: this.data.visibleLabels[i] || `D${i + 1}`,
              barHit: true,
              hitHalfW: barW * 0.65 + 6,
              hitY0,
              hitY1
            });
          });

          this.chartHitAreas = this.chartHitAreas || {};
          this.chartHitAreas[chartId] = {
            left: res[0].left,
            top: res[0].top,
            width,
            height,
            points
          };
          return;
        }

        if (meta.fill) {
          const fillGradient = ctx.createLinearGradient(0, plotTop, 0, plotBottom);
          fillGradient.addColorStop(0, meta.fill);
          fillGradient.addColorStop(1, "rgba(38, 55, 88, 0.04)");
          ctx.beginPath();
          safeData.forEach((v, i) => {
            const step = safeData.length > 1 ? i / (safeData.length - 1) : 0.5;
            const x = plotLeft + step * plotWidth;
            const y = toY(v);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.lineTo(plotRight, plotBottom);
          ctx.lineTo(plotLeft, plotBottom);
          ctx.closePath();
          ctx.fillStyle = fillGradient;
          ctx.fill();
        }

        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        const points = [];
        safeData.forEach((v, i) => {
          const step = safeData.length > 1 ? i / (safeData.length - 1) : 0.5;
          const x = plotLeft + step * plotWidth;
          const y = toY(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          points.push({
            x,
            y,
            index: i,
            value: v,
            label: this.data.visibleLabels[i] || `D${i + 1}`
          });
        });
        ctx.stroke();

        const activeIndex = this.data.activePointIndexByChart[chartId];
        points.forEach((point) => {
          const isActive = activeIndex === point.index;
          ctx.beginPath();
          ctx.fillStyle = "#d7e7ff";
          ctx.arc(point.x, point.y, isActive ? 5 : 3.2, 0, Math.PI * 2);
          ctx.fill();
          if (isActive) {
            ctx.beginPath();
            ctx.strokeStyle = meta.color;
            ctx.lineWidth = 2;
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        this.chartHitAreas = this.chartHitAreas || {};
        this.chartHitAreas[chartId] = {
          left: res[0].left,
          top: res[0].top,
          width,
          height,
          points
        };
      });
  },

  // 睡眠趋势图表
  drawDurationTrend() {
    this.drawLine("duration", this.getVisibleSeries(this.data.durationSeries));
  },

  drawEfficiencyTrend() {
    this.drawLine("efficiency", this.getVisibleSeries(this.data.efficiencySeries));
  },

  drawPrepTrend() {
    this.drawLine("prep", this.getVisibleSeries(this.data.prepSeries));
  },

  drawDeepTrend() {
    this.drawLine("deep", this.getVisibleSeries(this.data.deepSeries));
  },

  // 呼吸健康图表
  drawBreathRateTrend() {
    this.drawLine("breathRate", this.getVisibleSeries(this.data.breathRateSeries));
  },

  drawAhiTrend() {
    this.drawLine("ahi", this.getVisibleSeries(this.data.ahiSeries));
  },

  drawApneaTrend() {
    this.drawLine("apnea", this.getVisibleSeries(this.data.apneaSeries));
  },

  // 心肺健康图表
  drawHeartRateTrend() {
    const query = wx.createSelectorQuery();
    query.select("#heartRateChart")
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

        // 获取数据
        const period = this.data.period || "7";
        const maxSeries = this.getVisibleSeries(this.data.heartRateSeries);
        const minSeries = this.getVisibleSeries(this.data.heartRateMinSeries);
        const avg14Day = this.getVisibleSeries(this.data.heartRate14DayAvg);
        
        if (!maxSeries || maxSeries.length < 1) return;

        // 绘图区配置
        const plotLeft = 42;
        const plotRight = 348;
        const plotTop = 50;
        const plotBottom = 290;
        const plotWidth = plotRight - plotLeft;
        const plotHeight = plotBottom - plotTop;
        
        const yMin = 40, yMax = 100;
        const refLine = 78; // 同龄人参考线

        // Y轴坐标转换
        const toY = (value) => plotBottom - ((value - yMin) / (yMax - yMin)) * plotHeight;

        // 绘制健康区间背景
        ctx.fillStyle = "#F5B5A4";
        ctx.globalAlpha = 0.25;
        ctx.fillRect(plotLeft, toY(90), plotWidth, toY(40) - toY(90));
        
        ctx.fillStyle = "#FFE5CC";
        ctx.fillRect(plotLeft, toY(75), plotWidth, toY(90) - toY(75));
        
        ctx.fillStyle = "#A8E6DA";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(plotLeft, toY(55), plotWidth, toY(75) - toY(55));
        ctx.globalAlpha = 1.0;

        // 绘制柱子
        const barWidth = 14;
        const barGap = (plotWidth - barWidth * maxSeries.length) / (maxSeries.length + 1);
        
        maxSeries.forEach((max, i) => {
          const min = minSeries[i] || max;
          const x = plotLeft + barGap + i * (barWidth + barGap) + barWidth / 2;
          const yMax = toY(max);
          const yMin = toY(min);
          
          // 判断柱子状态
          let isGreen = (i === 2 || i === 6); // 见效日期
          let isRed = (i === 4); // 警示日期
          
          // 绘制柱子（区间柱）
          let gradient = ctx.createLinearGradient(0, yMax, 0, yMin);
          if (isRed) {
            gradient.addColorStop(0, "#E97F65");
            gradient.addColorStop(1, "#F5B5A4");
            ctx.strokeStyle = "#D85A30";
            ctx.lineWidth = 1.5;
          } else if (isGreen) {
            gradient.addColorStop(0, "#1D9E75");
            gradient.addColorStop(1, "#7FD4B3");
          } else {
            gradient.addColorStop(0, "#3DB9F0");
            gradient.addColorStop(1, "#A8DEF5");
          }
          
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(x - barWidth / 2, yMax);
          ctx.lineTo(x + barWidth / 2, yMax);
          ctx.lineTo(x + barWidth / 2, yMin);
          ctx.lineTo(x - barWidth / 2, yMin);
          ctx.closePath();
          ctx.fill();
          
          if (isRed) ctx.stroke();
          ctx.globalAlpha = 1.0;
        });

        // 绘制14天均值曲线
        ctx.strokeStyle = "#4A4842";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 3]);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        avg14Day.forEach((v, i) => {
          const step = avg14Day.length > 1 ? i / (avg14Day.length - 1) : 0.5;
          const x = plotLeft + step * plotWidth;
          const y = toY(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // 绘制同龄人参考线
        ctx.strokeStyle = "#7A7770";
        ctx.lineWidth = 0.9;
        ctx.setLineDash([5, 3]);
        ctx.globalAlpha = 0.75;
        const refY = toY(refLine);
        ctx.beginPath();
        ctx.moveTo(plotLeft, refY);
        ctx.lineTo(plotRight, refY);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([]);

        // 绘制标签胶囊（心率图）
        // 左侧标签
        const leftLabels = [
          { y: toY(92), text: "不健康 >90", color: "#F5B5A4", textColor: "#B5391A" },
          { y: toY(82.5), text: "亚健康 75-90", color: "#E5C66B", textColor: "#8C6C12" },
          { y: toY(65), text: "健康区 55-75", color: "#7FD4B3", textColor: "#0F6E56" },
          { y: toY(47.5), text: "亚健康 40-55", color: "#E5C66B", textColor: "#8C6C12" }
        ];
        
        this.drawLabelCapsule(ctx, plotLeft - 80, leftLabels[0].y, leftLabels[0].text, leftLabels[0].color, leftLabels[0].textColor, 9, 500);

        // 右侧参考线标签
        this.drawLabelCapsule(ctx, plotRight + 8, refY, "同龄人 78bpm", "#C5C2B8", "#666", 9, 500);
        this.drawLabelCapsule(ctx, plotRight + 8, toY(72), "14天 72bpm", "#A6A39A", "#666", 9, 500);

        // X轴日期
        ctx.fillStyle = "#4a5a60";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        const dateLabels = ["5/26", "5/27", "5/28", "5/29", "5/30", "5/31", "6/01"];
        maxSeries.forEach((_, i) => {
          const x = plotLeft + barGap + i * (barWidth + barGap) + barWidth / 2;
          ctx.fillText(dateLabels[i] || `D${i+1}`, x, plotBottom + 20);
        });
      });
  },

  drawHrvTrend() {
    const query = wx.createSelectorQuery();
    query.select("#hrvChart")
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

        // 获取数据
        const period = this.data.period || "7";
        const maxSeries = this.getVisibleSeries(this.data.hrvSeries);
        const minSeries = this.getVisibleSeries(this.data.hrvMinSeries);
        const avg14Day = this.getVisibleSeries(this.data.hrv14DayAvg);
        
        if (!maxSeries || maxSeries.length < 1) return;

        // 绘图区配置
        const plotLeft = 42;
        const plotRight = 348;
        const plotTop = 50;
        const plotBottom = 290;
        const plotWidth = plotRight - plotLeft;
        const plotHeight = plotBottom - plotTop;
        
        const yMin = 0, yMax = 150;
        const refLine = 42; // 同龄人参考线

        // Y轴坐标转换
        const toY = (value) => plotBottom - ((value - yMin) / (yMax - yMin)) * plotHeight;

        // 绘制健康区间背景
        ctx.fillStyle = "#A8E6DA";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(plotLeft, toY(50), plotWidth, toY(150) - toY(50));
        
        ctx.fillStyle = "#FFE5CC";
        ctx.globalAlpha = 0.25;
        ctx.fillRect(plotLeft, toY(20), plotWidth, toY(50) - toY(20));
        
        ctx.fillStyle = "#F5B5A4";
        ctx.globalAlpha = 0.25;
        ctx.fillRect(plotLeft, toY(0), plotWidth, toY(20) - toY(0));
        ctx.globalAlpha = 1.0;

        // 绘制柱子
        const barWidth = 14;
        const barGap = (plotWidth - barWidth * maxSeries.length) / (maxSeries.length + 1);
        
        maxSeries.forEach((max, i) => {
          const min = minSeries[i] || max;
          const x = plotLeft + barGap + i * (barWidth + barGap) + barWidth / 2;
          const yMax = toY(max);
          const yMin = toY(min);
          
          // 判断柱子状态
          let isGreen = (i === 3 || i === 6); // 见效日期
          let isRed = (i === 1); // 警示日期
          
          // 绘制柱子（区间柱）
          let gradient = ctx.createLinearGradient(0, yMax, 0, yMin);
          if (isRed) {
            gradient.addColorStop(0, "#E97F65");
            gradient.addColorStop(1, "#F5B5A4");
            ctx.strokeStyle = "#D85A30";
            ctx.lineWidth = 1.5;
          } else if (isGreen) {
            gradient.addColorStop(0, "#1D9E75");
            gradient.addColorStop(1, "#7FD4B3");
          } else {
            gradient.addColorStop(0, "#3DB9F0");
            gradient.addColorStop(1, "#A8DEF5");
          }
          
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(x - barWidth / 2, yMax);
          ctx.lineTo(x + barWidth / 2, yMax);
          ctx.lineTo(x + barWidth / 2, yMin);
          ctx.lineTo(x - barWidth / 2, yMin);
          ctx.closePath();
          ctx.fill();
          
          if (isRed) ctx.stroke();
          ctx.globalAlpha = 1.0;
        });

        // 绘制14天均值曲线
        ctx.strokeStyle = "#4A4842";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 3]);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        avg14Day.forEach((v, i) => {
          const step = avg14Day.length > 1 ? i / (avg14Day.length - 1) : 0.5;
          const x = plotLeft + step * plotWidth;
          const y = toY(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // 绘制同龄人参考线
        ctx.strokeStyle = "#7A7770";
        ctx.lineWidth = 0.9;
        ctx.setLineDash([5, 3]);
        ctx.globalAlpha = 0.75;
        const refY = toY(refLine);
        ctx.beginPath();
        ctx.moveTo(plotLeft, refY);
        ctx.lineTo(plotRight, refY);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([]);

        // 绘制标签胶囊（HRV图）
        // 左侧标签
        this.drawLabelCapsule(ctx, plotLeft - 75, toY(100), "健康区 >50ms", "#7FD4B3", "#0F6E56", 9, 500);

        // 右侧参考线标签
        this.drawLabelCapsule(ctx, plotRight + 8, refY, "同龄人 42ms", "#C5C2B8", "#666", 9, 500);
        this.drawLabelCapsule(ctx, plotRight + 8, toY(65), "14天 65ms", "#A6A39A", "#666", 9, 500);

        // X轴日期
        ctx.fillStyle = "#4a5a60";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        const dateLabels = ["5/26", "5/27", "5/28", "5/29", "5/30", "5/31", "6/01"];
        maxSeries.forEach((_, i) => {
          const x = plotLeft + barGap + i * (barWidth + barGap) + barWidth / 2;
          ctx.fillText(dateLabels[i] || `D${i+1}`, x, plotBottom + 20);
        });
      });
  },

  // 绘制标签胶囊辅助函数
  drawLabelCapsule(ctx, x, y, text, borderColor, textColor, fontSize = 9, fontWeight = 400) {
    const padding = 4;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.4;
    const capsuleWidth = textWidth + padding * 2;
    const capsuleHeight = textHeight + padding;

    // 绘制胶囊背景
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(x - capsuleWidth / 2 + 3, y - capsuleHeight / 2);
    ctx.lineTo(x + capsuleWidth / 2 - 3, y - capsuleHeight / 2);
    ctx.quadraticCurveTo(x + capsuleWidth / 2, y - capsuleHeight / 2, x + capsuleWidth / 2, y - capsuleHeight / 2 + 3);
    ctx.lineTo(x + capsuleWidth / 2, y + capsuleHeight / 2 - 3);
    ctx.quadraticCurveTo(x + capsuleWidth / 2, y + capsuleHeight / 2, x + capsuleWidth / 2 - 3, y + capsuleHeight / 2);
    ctx.lineTo(x - capsuleWidth / 2 + 3, y + capsuleHeight / 2);
    ctx.quadraticCurveTo(x - capsuleWidth / 2, y + capsuleHeight / 2, x - capsuleWidth / 2, y + capsuleHeight / 2 - 3);
    ctx.lineTo(x - capsuleWidth / 2, y - capsuleHeight / 2 + 3);
    ctx.quadraticCurveTo(x - capsuleWidth / 2, y - capsuleHeight / 2, x - capsuleWidth / 2 + 3, y - capsuleHeight / 2);
    ctx.fill();

    // 绘制胶囊边框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制文字
    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  },

  drawHeartIndexTrend() {
    this.drawLine("heartIndex", this.getVisibleSeries(this.data.heartIndexSeries));
  },

  // 睡眠声音图表
  drawNoiseTrend() {
    this.drawLine("noise", this.getVisibleSeries(this.data.noiseSeries));
  },

  drawSnoreTrend() {
    this.drawLine("snore", this.getVisibleSeries(this.data.snoreSeries));
  },

  drawNoiseImpactTrend() {
    this.drawLine("noiseImpact", this.getVisibleSeries(this.data.noiseImpactSeries));
  },

  // K线式作息图
  drawKlineSchedule() {
    const query = wx.createSelectorQuery();
    query.select("#klineChart")
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
        const rows = this.getVisibleKlineSeries();
        if (!rows.length) return;

        const panelGradient = ctx.createLinearGradient(0, 0, 0, height);
        panelGradient.addColorStop(0, "#0f1b35");
        panelGradient.addColorStop(1, "#0b1427");
        ctx.fillStyle = panelGradient;
        ctx.fillRect(0, 0, width, height);

        const leftPad = 72;
        const rightPad = 14;
        const topPad = 36;
        const bottomPad = 18;
        const plotLeft = leftPad;
        const plotRight = width - rightPad;
        const plotTop = topPad;
        const plotBottom = height - bottomPad;
        const plotWidth = plotRight - plotLeft;
        const rowHeight = (plotBottom - plotTop) / rows.length;
        const xMin = 0;
        const xMax = 18;
        const toX = (value) => plotLeft + ((value - xMin) / (xMax - xMin)) * plotWidth;

        // 不健康区域背景
        const unsafeZones = [
          { from: this.clockToAxisValue("00:30"), to: this.clockToAxisValue("03:00") },
          { from: this.clockToAxisValue("08:00"), to: this.clockToAxisValue("10:30") }
        ];
        ctx.fillStyle = "rgba(134, 78, 96, 0.18)";
        unsafeZones.forEach((zone) => {
          const x1 = toX(zone.from);
          const x2 = toX(zone.to);
          ctx.fillRect(x1, plotTop, x2 - x1, plotBottom - plotTop);
        });

        // 健康窗口
        const healthyZones = [
          { from: this.clockToAxisValue("22:30"), to: this.clockToAxisValue("23:30"), label: "健康早睡窗口 22:30-23:30" },
          { from: this.clockToAxisValue("07:00"), to: this.clockToAxisValue("08:00"), label: "健康早起窗口 07:00-08:00" }
        ];
        ctx.fillStyle = "rgba(78, 206, 141, 0.12)";
        healthyZones.forEach((zone, index) => {
          const x1 = toX(zone.from);
          const x2 = toX(zone.to);
          ctx.fillRect(x1, plotTop, x2 - x1, plotBottom - plotTop);
          ctx.strokeStyle = "rgba(126, 221, 168, 0.48)";
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(x1, plotTop);
          ctx.lineTo(x1, plotBottom);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x2, plotTop);
          ctx.lineTo(x2, plotBottom);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(172, 233, 196, 0.92)";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          const labelX = (x1 + x2) / 2;
          const labelY = index === 0 ? plotBottom - 6 : plotTop + 12;
          ctx.fillText(zone.label, labelX, labelY);
        });

        // 顶部时间轴
        const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
        ticks.forEach((tick) => {
          const x = toX(tick);
          ctx.strokeStyle = "rgba(170, 188, 214, 0.18)";
          ctx.beginPath();
          ctx.moveTo(x, plotTop);
          ctx.lineTo(x, plotBottom);
          ctx.stroke();
          ctx.fillStyle = "rgba(197, 210, 230, 0.82)";
          ctx.textAlign = "center";
          ctx.font = "11px sans-serif";
          ctx.fillText(this.axisToClock(tick), x, 14);
        });

        const summary = this.data.klineSummary || {};
        const avgBedX = toX(this.clockToAxisValue(summary.avgBed || "23:25"));
        const avgWakeX = toX(this.clockToAxisValue(summary.avgWake || "07:49"));
        ctx.strokeStyle = "rgba(122, 196, 255, 0.72)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.moveTo(avgBedX, plotTop);
        ctx.lineTo(avgBedX, plotBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(avgWakeX, plotTop);
        ctx.lineTo(avgWakeX, plotBottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(166, 214, 255, 0.92)";
        ctx.textAlign = "left";
        ctx.fillText(`平均上床 ${summary.avgBed || "--:--"}`, avgBedX + 4, 28);
        ctx.fillText(`平均起床 ${summary.avgWake || "--:--"}`, avgWakeX + 4, 28);

        const radiusRect = (x, y, w, h, r) => {
          const rr = Math.min(r, h / 2, w / 2);
          ctx.beginPath();
          ctx.moveTo(x + rr, y);
          ctx.arcTo(x + w, y, x + w, y + h, rr);
          ctx.arcTo(x + w, y + h, x, y + h, rr);
          ctx.arcTo(x, y + h, x, y, rr);
          ctx.arcTo(x, y, x + w, y, rr);
          ctx.closePath();
        };

        rows.forEach((item, index) => {
          const centerY = plotTop + rowHeight * index + rowHeight / 2;
          const barH = Math.max(10, rowHeight * 0.52);
          const bedX = toX(this.clockToAxisValue(item.bedTime));
          const wakeX = toX(this.clockToAxisValue(item.wakeTime));
          const healthy = this.isBedHealthy(item.bedTime);

          // 日期
          ctx.fillStyle = "rgba(203, 214, 232, 0.9)";
          ctx.textAlign = "right";
          ctx.font = "12px sans-serif";
          ctx.fillText(item.date, plotLeft - 8, centerY + 4);

          // 轨道
          ctx.fillStyle = "rgba(108, 128, 165, 0.18)";
          radiusRect(plotLeft, centerY - barH / 2, plotWidth, barH, barH / 2);
          ctx.fill();

          // 作息条
          const color = healthy ? "#37bf87" : "#ffb347";
          ctx.fillStyle = color;
          radiusRect(bedX, centerY - barH / 2, Math.max(4, wakeX - bedX), barH, barH / 2);
          ctx.fill();

          ctx.fillStyle = "#d8e8ff";
          ctx.beginPath();
          ctx.arc(bedX, centerY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(wakeX, centerY, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });
  }
});