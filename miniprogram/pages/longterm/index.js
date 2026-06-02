const CHART_META = {
  duration: { name: "睡眠时长", yType: "number", min: 6, max: 10, reference: 8, healthyRange: [7, 9], unit: "h", decimals: 1, color: "#59d7cd", fill: "rgba(89,215,205,0.18)", referenceLabel: "健康参考线(7-9h)" },
  efficiency: { name: "睡眠效率", yType: "number", min: 70, max: 100, reference: 80, healthyRange: [80, 100], unit: "%", decimals: 0, color: "#78bdf7", referenceLabel: "健康参考线(80%)" },
  prep: { name: "入睡准备时长", yType: "number", min: 0, max: 50, reference: 20, healthyRange: [0, 20], unit: "min", decimals: 0, color: "#f2b26b", referenceLabel: "健康参考线(20min)" },
  deep: { name: "深睡占比", yType: "number", min: 10, max: 30, reference: 20, healthyRange: [15, 25], unit: "%", decimals: 0, color: "#84a7f8", referenceLabel: "健康参考线(20%)" },
  breathRate: { name: "平均夜间呼吸频率", yType: "number", min: 6, max: 24, reference: 16, healthyRange: [12, 20], unit: "次/分", decimals: 0, color: "#58cfd0", referenceLabel: "健康参考线(12-20次/分)", barMode: "floating" },
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
  snore: { name: "鼾声总频次", yType: "number", min: 0, max: 20, reference: 5, warningRange: [5, 20], unit: "次", decimals: 0, color: "#ffb086", isWarning: true, referenceLabel: "健康警戒线(5次)" },
  sleeptalk: { name: "梦话总频次", yType: "number", min: 0, max: 10, reference: 3, warningRange: [3, 10], unit: "次", decimals: 0, color: "#b15dff", isWarning: true, referenceLabel: "健康警戒线(3次)" }
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
  snore: "#snoreChart",
  sleeptalk: "#sleeptalkChart"
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

// 心率/HRV 图 X 轴日期格式：05-26（一），9px
function formatHeartDateLabel(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}（${WEEKDAY_CN[date.getDay()]}）`;
}

function createKlineSource() {
  const start = new Date(2026, 4, 3); // 2026-05-03
  return KLINE_BED_WAKE.map(([bedTime, wakeTime], index) => {
    const current = new Date(start.getTime());
    current.setDate(start.getDate() + index);
    return {
      dateObj: current,
      date: formatKlineDateLabel(current),
      heartDate: formatHeartDateLabel(current),
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
    // 付费弹窗状态
    paywall: { visible: false, icon: '', title: '', sub: '', features: [] },

    // 坚持有回报 HERO（情绪锚点）
    rewardHero: {
      streakDays: 12,
      improvedCount: 3,
      weekScore: 87,
      weekDelta: 5,
      goalDays: 5,
      message: '你这周坚持的侧卧和睡前深呼吸正在见效——呼吸暂停和静息心率都在往好的方向走。继续保持！'
    },

    // 3 张好转亮点卡（accent 三档：green/blue/coral）
    rewardWins: [
      {
        id: 'apnea',
        accent: 'green',
        icon: '🌬️',
        title: '最长呼吸暂停在缩短',
        deltaText: '↓ 23%',
        action: '侧卧睡姿',
        flowText: '坚持 6 天 → 最长呼吸暂停从 22 秒 降到 17 秒',
        progressPct: 71,
        goalText: '<12 秒',
        currentText: '17 秒'
      },
      {
        id: 'hrv',
        accent: 'blue',
        icon: '💓',
        title: 'HRV 自主神经在回升',
        deltaText: '↑ +3ms',
        action: '睡前 10 分钟腹式呼吸',
        flowText: '本周 HRV 均值从 30ms 升到 33ms',
        progressPct: 73,
        goalText: '>45ms',
        currentText: '33ms'
      },
      {
        id: 'rhr',
        accent: 'coral',
        icon: '❤️',
        title: '夜间静息心率在下降',
        deltaText: '↓ 2bpm',
        action: '规律作息 + 睡前不剧烈活动',
        flowText: '静息心率从 70 降到 68 bpm',
        progressPct: 96,
        goalText: '<65 bpm',
        currentText: '68'
      }
    ],

    // 本周健康评分（87 分 ≈ 313 度）
    weekScore: {
      value: 87,
      ringDeg: Math.round(87 * 3.6),
      trendText: '稳中有升 ↑5',
      summary: '近 7 天评分整体上行，多数指标处于健康区。',
      spark: [
        { h: 55, up: false },
        { h: 60, up: false },
        { h: 52, up: false },
        { h: 68, up: false },
        { h: 72, up: true },
        { h: 80, up: true },
        { h: 88, up: true }
      ]
    },

    // 每张图独立 period 状态（升级版交互）
    chartPeriods: {
      duration: "7", efficiency: "7", prep: "7", deep: "7", schedule: "7",
      breathRate: "7", ahi: "7", apnea: "7",
      heartRate: "7", hrv: "7", heartIndex: "7",
      snore: "7", sleeptalk: "7"
    },
    // 每张图独立的窗口起点（仅在月/全周期视图下使用，单位 = 数据点序号）
    chartWindowStarts: {
      duration: 0, efficiency: 0, prep: 0, deep: 0, schedule: 0,
      breathRate: 0, ahi: 0, apnea: 0,
      heartRate: 0, hrv: 0, heartIndex: 0,
      snore: 0, sleeptalk: 0
    },
    // 每张图当前可见窗口的日期范围（"5/10 - 5/16"，仅月/全周期下显示）
    chartDateRanges: {},
    // chartId → 对应的 draw 方法名
    chartDrawMap: {
      duration: "drawDurationTrend",
      efficiency: "drawEfficiencyTrend",
      prep: "drawPrepTrend",
      deep: "drawDeepTrend",
      breathRate: "drawBreathRateTrend",
      ahi: "drawAhiTrend",
      apnea: "drawApneaTrend",
      heartRate: "drawHeartRateTrend",
      hrv: "drawHrvTrend",
      heartIndex: "drawHeartIndexTrend",
      snore: "drawSnoreTrend",
      sleeptalk: "drawSleeptalkTrend"
    },
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
      "7": [6.8, 8.4, 7.2, 8.6, 6.5, 9.1, 7.9],
      "30": [7.2, 7.5, 7.8, 8.1, 8.3, 8.0, 8.2, 7.9, 8.1, 8.4, 8.5, 8.2, 8.3, 8.6, 8.4, 8.5, 8.3, 8.4, 8.6, 8.5, 8.4, 8.5, 8.6, 8.4, 8.5, 8.3, 8.4, 8.5, 8.6, 8.4],
      "90": [6.8, 6.9, 7.0, 7.1, 7.3, 7.5, 7.6, 7.8, 7.9, 8.0, 8.1, 8.2, 8.1, 8.2, 8.3, 8.4, 8.3, 8.4, 8.5, 8.4, 8.5, 8.6, 8.5, 8.6, 8.5, 8.6, 8.7, 8.6, 8.7, 8.8]
    },
    efficiencySeries: {
      "7": [78, 88, 82, 92, 76, 90, 85],
      "30": [80, 81, 82, 83, 82, 84, 85, 84, 83, 85, 86, 85, 84, 86, 85, 84, 85, 86, 85, 84, 85, 86, 85, 84, 85, 86, 85, 84, 85, 86],
      "90": [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 91, 92, 92, 93, 93, 94, 94]
    },
    prepSeries: {
      "7": [42, 22, 38, 15, 47, 18, 28],
      "30": [38, 36, 34, 32, 31, 30, 28, 35, 32, 27, 29, 30, 24, 28, 33, 31, 29, 26, 24, 30, 28, 35, 40, 36, 32, 28, 24, 25, 27, 30],
      "90": [45, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    },
    deepSeries: {
      "7": [14, 22, 17, 26, 12, 28, 19],
      "30": [18, 18, 19, 20, 21, 20, 19, 20, 21, 20, 19, 20, 21, 22, 20, 19, 20, 21, 22, 21, 20, 21, 22, 21, 20, 21, 22, 21, 20, 20],
      "90": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25]
    },
    // 呼吸健康数据
    breathRateSeries: {
      "7": [14, 15, 13, 14, 15, 14, 14],
      "30": [16, 15, 15, 14, 14, 14, 13, 14, 15, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14, 13, 13, 14, 14],
      "90": [18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13, 13, 13, 14, 14, 14, 14, 13, 13]
    },
    // 呼吸频率区间柱：每日最高/最低（band chart 模板）
    breathRateMaxSeries: {
      "7": [17, 18, 16, 17, 18, 17, 17],
      "30": [19, 18, 18, 17, 17, 17, 16, 17, 18, 17, 16, 16, 17, 17, 16, 16, 17, 17, 16, 16, 17, 17, 16, 16, 17, 17, 16, 16, 17, 17],
      "90": [21, 20, 20, 19, 19, 18, 18, 18, 17, 17, 17, 17, 16, 16, 16, 16, 17, 17, 17, 17, 16, 16, 16, 16, 17, 17, 17, 17, 16, 16]
    },
    breathRateMinSeries: {
      "7": [12, 13, 11, 12, 13, 12, 12],
      "30": [14, 13, 13, 12, 12, 12, 11, 12, 13, 12, 11, 11, 12, 12, 11, 11, 12, 12, 11, 11, 12, 12, 11, 11, 12, 12, 11, 11, 12, 12],
      "90": [16, 15, 15, 14, 14, 13, 13, 13, 12, 12, 12, 12, 11, 11, 11, 11, 12, 12, 12, 12, 11, 11, 11, 11, 12, 12, 12, 12, 11, 11]
    },
    breathRate14DayAvg: {
      "7": [15.0, 14.9, 14.8, 14.7, 14.6, 14.5, 14.4],
      "30": [15.5, 15.3, 15.1, 14.9, 14.8, 14.7, 14.6, 14.5, 14.5, 14.4, 14.3, 14.3, 14.2, 14.2, 14.1, 14.1, 14.0, 14.0, 14.0, 13.9, 13.9, 13.9, 13.8, 13.8, 13.8, 13.8, 13.7, 13.7, 13.7, 13.7],
      "90": [17.5, 17.2, 17.0, 16.7, 16.4, 16.2, 16.0, 15.8, 15.6, 15.4, 15.3, 15.1, 15.0, 14.9, 14.7, 14.6, 14.5, 14.4, 14.3, 14.2, 14.1, 14.0, 13.9, 13.9, 13.8, 13.8, 13.8, 13.7, 13.7, 13.7]
    },
    ahiSeries: {
      "7": [3.8, 1.2, 5.5, 0.8, 7.2, 1.5, 3.0],
      "30": [2.5, 2.3, 2.1, 1.9, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.7, 0.7, 0.6, 0.6, 0.5, 0.5, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.1],
      "90": [4.5, 4.3, 4.1, 3.9, 3.7, 3.5, 3.3, 3.1, 2.9, 2.7, 2.5, 2.3, 2.1, 1.9, 1.7, 1.5, 1.3, 1.1, 0.9, 0.7, 0.5, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
    },
    // AHI 真实 14 天均值（平滑趋势，非数据复制）
    ahiAvg14: {
      "7": [1.6, 1.5, 1.4, 1.3, 1.2, 1.2, 1.1],
      "30": [2.4, 2.3, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 1.0, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7, 0.6, 0.6, 0.5, 0.5, 0.4, 0.4, 0.3, 0.3, 0.3],
      "90": [3.8, 3.6, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4, 2.2, 2.0, 1.8, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]
    },
    apneaSeries: {
      "7": [12, 6, 18, 4, 25, 5, 8],
      "30": [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0],
      "90": [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0]
    },
    // 最长呼吸暂停真实 14 天均值
    apneaAvg14: {
      "7": [11, 10, 10, 9, 9, 8, 8],
      "30": [13, 12, 12, 11, 11, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1],
      "90": [22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1]
    },
    // 心脏健康指数真实 14 天均值
    heartIndexAvg14: {
      "7": [86, 87, 88, 89, 90, 91, 92],
      "30": [84, 84, 85, 85, 86, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 91, 92, 92, 93, 93, 94, 94, 94, 95, 95, 95, 95, 95, 95, 95],
      "90": [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 94, 95, 95, 95, 95, 95, 95]
    },
    // 心肺健康数据（区间柱：每日"最高/最低"两端，差值约 10-25 单位，确保视觉清晰）
    heartRateSeries: {
      "7": [72, 70, 65, 71, 92, 73, 67],
      "30": [82, 80, 78, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50],
      "90": [88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 40, 40, 40, 40, 40]
    },
    heartRateMinSeries: {
      "7": [60, 58, 53, 59, 68, 61, 55],
      "30": [68, 66, 64, 62, 60, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 40, 40, 40, 40],
      "90": [72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40]
    },
    heartRate14DayAvg: {
      "7": [76, 75, 74, 73, 72.5, 72, 72],
      "30": [76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47],
      "90": [80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40]
    },
    hrvSeries: {
      "7": [38, 18, 55, 128, 42, 95, 70],
      "30": [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 60, 70, 80, 90, 95, 100, 105, 110, 115, 120, 125, 128, 130, 132, 135, 138, 140, 142, 145],
      "90": [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50, 60, 70, 80, 90, 100, 110, 120, 125, 130, 135, 138, 140, 142, 145, 148, 148, 148, 148]
    },
    hrvMinSeries: {
      "7": [18, 12, 28, 65, 25, 36, 42],
      "30": [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 88, 90, 92, 95, 98, 100, 102, 105],
      "90": [5, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 108, 110, 112]
    },
    hrv14DayAvg: {
      "7": [55, 57, 60, 65, 68, 70, 72],
      "30": [25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 108, 110, 112, 115, 118, 120, 122, 125],
      "90": [15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 122, 125, 128]
    },
    heartIndexSeries: {
      "7": [82, 90, 78, 94, 76, 96, 88],
      "30": [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97, 97, 98, 98, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      "90": [70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
    },
    // 睡眠声音数据
    // 鼾声总频次（每日次数）
    snoreSeries: {
      "7": [5, 4, 6, 3, 5, 4, 4],
      "30": [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      "90": [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    snoreAvg14: {
      "7": [5.2, 5.0, 4.8, 4.6, 4.4, 4.3, 4.3],
      "30": [11, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      "90": [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    // 梦话总频次（每日次数）
    sleeptalkSeries: {
      "7": [2, 1, 3, 2, 1, 2, 2],
      "30": [3, 2, 3, 2, 1, 2, 2, 3, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2],
      "90": [4, 3, 3, 2, 3, 2, 3, 2, 2, 3, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1]
    },
    sleeptalkAvg14: {
      "7": [2.2, 2.1, 2.0, 2.0, 1.9, 1.9, 1.9],
      "30": [2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 2.0, 1.9, 1.9, 1.8, 1.8, 1.7, 1.7, 1.6, 1.6, 1.6, 1.5, 1.5, 1.5, 1.4, 1.4, 1.4, 1.3, 1.3, 1.3, 1.2, 1.2, 1.2, 1.2, 1.2],
      "90": [3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.8, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4, 1.3, 1.3, 1.3, 1.2, 1.2, 1.2, 1.2, 1.1, 1.1]
    },
    // 心脏年龄总览数据（age 由 computeHeartAge() 根据被监测人年龄 + HRV 动态算出）
    heartAgeSummary: {
      age: 18,
      actualAge: 19,
      diff: 1,
      youngerThanActual: true,
      hrvAvg: 65,
      hrvDelta: 5,
      restingHr: 73,
      hrDelta: 3
    },
    heartRateHealthDays: "5/7",
    hrvHealthDays: "6/7",
    heartChartDateLabels: ["05-26", "05-27", "05-28", "05-29", "05-30", "05-31", "06-01"],
    // 健康关注中心 Dashboard 数据
    dashboard: {
      summary: { totalRisks: 3, improved: 1, healthScore: 87 },
      riskIndicators: [
        { id: 'hrv', icon: '💓', name: 'HRV 变异性', value: '33', unit: 'ms', trendIcon: '↑', trendValue: '+3', trendDir: 'improving', severity: 'warn', severityLabel: '偏低' },
        { id: 'apnea', icon: '🌬️', name: '最长呼吸暂停', value: '17', unit: '秒', trendIcon: '→', trendValue: '', trendDir: 'stable', severity: 'caution', severityLabel: '需关注' },
        { id: 'resting-hr', icon: '❤️', name: '静息心率', value: '68', unit: 'bpm', trendIcon: '↓', trendValue: '-2', trendDir: 'improving', severity: 'ok', severityLabel: '改善中' }
      ],
      advices: [
        { num: 1, title: '提升 HRV 至健康区间', desc: '每天 10-15 分钟腹式呼吸或冥想，激活副交感神经；每周 3-4 次有氧运动', target: 'HRV > 45ms', current: 33, goal: 45, progressPct: 73 },
        { num: 2, title: '缩短最长呼吸暂停时间', desc: '坚持侧卧睡姿代替仰卧，睡前 3 小时避免饮酒和镇静类药物', target: '最长暂停 < 12秒', current: 17, goal: 12, progressPct: 71 },
        { num: 3, title: '降低夜间静息心率', desc: '规律有氧运动 + 固定上床/起床时间，睡前 1 小时避免剧烈活动', target: '心率 < 65bpm', current: 68, goal: 65, progressPct: 96 }
      ]
    },

    // 睡眠：14天均值（折线图升级版用）
    durationAvg14: {
      "7": [7.5, 7.6, 7.6, 7.7, 7.8, 7.8, 7.8],
      "30": [7.0, 7.1, 7.2, 7.3, 7.4, 7.4, 7.5, 7.6, 7.7, 7.7, 7.8, 7.8, 7.8, 7.9, 7.9, 7.9, 8.0, 8.0, 8.0, 8.1, 8.1, 8.1, 8.2, 8.2, 8.2, 8.3, 8.3, 8.3, 8.4, 8.4],
      "90": [6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.0, 8.1, 8.1, 8.2, 8.2, 8.3, 8.3, 8.4, 8.4, 8.5, 8.5, 8.6, 8.6, 8.7]
    },
    efficiencyAvg14: {
      "7": [83, 84, 84, 84.5, 85, 85, 85],
      "30": [79, 80, 80, 81, 81, 82, 82, 83, 83, 84, 84, 84, 85, 85, 85, 86, 86, 86, 87, 87, 87, 88, 88, 88, 89, 89, 89, 90, 90, 90],
      "90": [74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 91, 92, 92, 93, 93, 94]
    },
    deepAvg14: {
      "7": [19, 19.5, 20, 20, 20.5, 20.5, 20.5],
      "30": [17, 17, 18, 18, 19, 19, 19, 20, 20, 20, 19, 20, 20, 21, 21, 20, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 20],
      "90": [11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 20, 21, 21, 22, 22, 22, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24]
    },
    // 入睡准备时长：区间柱 max/min
    prepMaxSeries: {
      "7": [38, 33, 41, 28, 47, 31, 35],
      "30": [42, 40, 38, 36, 35, 34, 32, 39, 36, 31, 33, 34, 28, 32, 37, 35, 33, 30, 28, 34, 32, 39, 44, 40, 36, 32, 28, 29, 31, 34],
      "90": [50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6]
    },
    prepMinSeries: {
      "7": [26, 22, 29, 18, 33, 20, 24],
      "30": [34, 32, 30, 28, 27, 26, 24, 31, 28, 23, 25, 26, 20, 24, 29, 27, 25, 22, 20, 26, 24, 31, 36, 32, 28, 24, 20, 21, 23, 26],
      "90": [40, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0]
    },
    prepAvg14: {
      "7": [33, 32, 31, 30, 29, 28, 28],
      "30": [40, 38, 36, 34, 33, 32, 31, 30, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 24, 24, 23, 23, 22, 22, 21, 21, 20, 20, 19, 19],
      "90": [48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5]
    },

    // 各图按周/月/全周期切换的趋势分析文字
    trendTexts: {
      duration: {
        "7":  "本周睡眠时长在 6.5-9.1h 间起伏，14 天均值升至 7.8h，周日峰值受补眠影响，整体作息趋稳。",
        "30": "近 30 天睡眠时长波动收窄，月均 7.8h，较初期延长 0.7h，作息规律性提升 22%。",
        "90": "全周期睡眠时长持续上升，较首次使用提升 1.2h，长期作息稳定性提升 60%。"
      },
      efficiency: {
        "7":  "本周睡眠效率在 76-92% 之间，14 天均值升至 84%，周末效率峰值显著高于工作日。",
        "30": "近 30 天效率稳步攀升，月均 84%，较初期提升 5%，卧床利用率持续优化。",
        "90": "全周期睡眠效率提升 7.2%，长期保持优秀水平，卧床有效率显著优化。"
      },
      prep: {
        "7":  "本周入睡耗时在 15-47 min 间波动，14 天均值降至 28 min。腹式呼吸第 3 天见效，但 5/30 受睡前刷屏影响明显延长。",
        "30": "近 30 天入睡耗时整体下降，月均 25 min，较初期缩短 10 min，入睡能力稳步改善。",
        "90": "全周期入睡耗时波动下降，较初期平均缩短 12 min，入睡能力逐步改善。"
      },
      deep: {
        "7":  "本周深睡占比在 12-28% 间起伏，14 天均值 20%。规律运动日深睡显著上升，咖啡因日下降。",
        "30": "近 30 天深睡稳定在 18-25%，月均 20%，整体处于健康区间。",
        "90": "全周期深睡占比长期稳定在 15-25% 理想区间，身体恢复能力持续稳定。"
      },
      ahi: {
        "7":  "本周 AHI 在 0.8-7.2 次/小时间波动，5/30 出现峰值 7.2 次，需关注饮酒/饱食对气道的影响。",
        "30": "近 30 天 AHI 月均 1.8 次/小时，5 天进入亚健康区间，整体仍优于同龄人。",
        "90": "全周期 AHI 长期低于 5 次/小时健康警戒线，无明显睡眠呼吸暂停风险。"
      },
      apnea: {
        "7":  "本周最长呼吸暂停在 4-25 秒间波动，5/30 峰值 25 秒需关注。侧卧睡眠日明显改善。",
        "30": "近 30 天最长呼吸暂停均值 11 秒，较初期缩短 4 秒，气道阻塞改善中。",
        "90": "全周期最长呼吸暂停持续下降，较初期缩短 8 秒，气道阻塞风险持续降低。"
      },
      hrv: {
        "7":  "本周 HRV 在 18-128 ms 间大幅波动，14 天均值升至 65 ms。5/29 腹式呼吸第 4 天见效达峰，但 5/27 出现警示低点（与前日饮酒相关）。",
        "30": "近 30 天 HRV 月均 58 ms，整体稳定在健康区间，自主神经调节能力改善。",
        "90": "全周期 HRV 长期稳定在健康区间，身体压力水平持续下降，自主神经调节良好。"
      },
      heartIndex: {
        "7":  "本周心脏健康指数在 76-96 分间起伏，14 天均值 89 分。心率稳定日得分最高。",
        "30": "近 30 天心脏健康指数月均 91 分，较初期提升 6 分，心脏综合状态稳步向好。",
        "90": "全周期心脏健康指数全程稳定在 90 分以上，无异常下滑，心脏状态持续稳定。"
      }
    },

    // 板块综合评分摘要
    moduleSummaries: {
      sleep: { score: 82, status: "良好", statusKey: "good", total: 4, healthy: 3, warn: 1, alert: 0, focus: "入睡准备时长 7/14 天偏长" },
      breath: { score: 90, status: "优秀", statusKey: "excellent", total: 3, healthy: 3, warn: 0, alert: 0, focus: "近 14 天均处健康区" },
      heart: { score: 88, status: "良好", statusKey: "good", total: 3, healthy: 2, warn: 1, alert: 0, focus: "HRV 连续 5 天偏低" },
      sound: { score: 88, status: "良好", statusKey: "good", total: 2, healthy: 2, warn: 0, alert: 0, focus: "鼾声 14 天均值 4 次/晚" }
    },

    // 12 张图表的图例文案（移到数据层，规避 WXML 内 &gt;/&lt; HTML 转义符无法渲染的问题）
    chartLegends: {
      heartRate:  { h: "健康区 (55-75bpm)",     sh: "亚健康区 (>75bpm)",      avg: "14天 72bpm",     peer: "同龄人 78bpm" },
      hrv:        { h: "健康区 (>50ms)",         sh: "亚健康 (<50ms)",          avg: "14天 65ms",      peer: "同龄人 42ms" },
      heartIndex: { h: "健康区 (>80)",           sh: "亚健康 (60-80)",          avg: "14天 92分",      peer: "同龄人 75分" },
      breathRate: { h: "健康区 (12-20次/分)",    sh: "亚健康 (<12 或 >20)",     avg: "14天 14.5次/分", peer: "同龄人 16次/分" },
      ahi:        { h: "健康区 (<5)",            sh: "亚健康 (5-10)",           avg: "14天 1.1次/h",   peer: "同龄人 2次/h" },
      apnea:      { h: "健康区 (<10秒)",         sh: "亚健康 (10-30秒)",        avg: "14天 8秒",       peer: "同龄人 5秒" },
      duration:   { h: "健康区 (7-9h)",          sh: "亚健康 (<7 或 >9h)",      avg: "14天 7.8h",      peer: "同龄人 7.5h" },
      efficiency: { h: "健康区 (>85%)",          sh: "亚健康 (<85%)",           avg: "14天 84%",       peer: "同龄人 80%" },
      prep:       { h: "健康区 (<20min)",        sh: "亚健康 (>20min)",         avg: "14天 28min",     peer: "同龄人 18min" },
      deep:       { h: "健康区 (15-25%)",        sh: "亚健康 (<15 或 >25%)",    avg: "14天 20%",       peer: "同龄人 18%" },
      snore:      { h: "健康区 (<5次)",          sh: "亚健康 (5-20次)",         avg: "14天 4次",       peer: "同龄人 5次" },
      sleeptalk:  { h: "健康区 (<3次)",          sh: "亚健康 (3-10次)",         avg: "14天 2次",       peer: "同龄人 3次" }
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
    this.computeHeartAge();
  },

  // 心脏年龄 = 被监测人年龄 +- HRV 偏离量
  // 公式：HRV<50 → 心脏年龄 = 实际年龄 + (50-HRV)/5
  //       HRV>=50 → 心脏年龄 = 实际年龄 - (HRV-50)/10
  computeHeartAge() {
    const userInfo = wx.getStorageSync('userInfo') || { age: 19 };
    const actualAge = userInfo.age || 19;
    const hrv = this.data.heartAgeSummary.hrvAvg || 65;
    let heartAge;
    if (hrv >= 50) {
      heartAge = Math.max(actualAge - 5, actualAge - Math.round((hrv - 50) / 10));
    } else {
      heartAge = Math.min(actualAge + 10, actualAge + Math.round((50 - hrv) / 5));
    }
    const diff = Math.abs(heartAge - actualAge);
    const youngerThanActual = heartAge < actualAge;
    this.setData({
      'heartAgeSummary.age': heartAge,
      'heartAgeSummary.actualAge': actualAge,
      'heartAgeSummary.diff': diff,
      'heartAgeSummary.youngerThanActual': youngerThanActual
    });
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
    // 付费拦截：非会员展开声音模块时弹窗
    if (module === 'sound' && !this.data.expanded.sound && !this.isMember()) {
      this.openPaywall('sound');
      return;
    }
    const expanded = { ...this.data.expanded };
    expanded[module] = !expanded[module];
    this.setData({ expanded }, () => {
      // 展开后重新渲染该模块的图表
      if (expanded[module]) {
        setTimeout(() => this.renderModuleCharts(module), 100);
      }
    });
  },

  // ===== 付费弹窗 =====
  isMember() {
    const app = getApp();
    return !!(app && app.globalData && app.globalData.member && app.globalData.member.isMember);
  },
  openPaywall(scene) {
    // scene: 'longterm' | 'sound'
    const content = scene === 'sound' ? {
      icon: '🔊',
      title: '解锁睡眠声音监测',
      sub: '听见昨晚发生的一切',
      features: [
        { icon: '🎙️', title: '鼾声 / 梦话 / 咳嗽 录音回放', sub: '每条事件可点击试听，标注准确发生时间' },
        { icon: '🌙', title: '整夜声音事件详细记录', sub: '8 项核心指标 + 联动趋势图' },
        { icon: '📈', title: '长期声音趋势', sub: '鼾声 / 梦话 30 天 / 全周期频次变化，看到改善' }
      ]
    } : {
      icon: '📊',
      title: '解锁完整长期趋势',
      sub: '看到你的健康指标真实变化',
      features: [
        { icon: '📈', title: '30 天 / 全周期 完整趋势', sub: '免费版仅 7 天，开通后看到长期的真实改善' },
        { icon: '🎯', title: '14 天均值 + 同龄人对比', sub: '不只是看数字，而是知道自己处于什么水平' },
        { icon: '💡', title: '行为见效分析', sub: '看到你打卡的腹式呼吸真的让 HRV 提升了多少' }
      ]
    };
    this.setData({ paywall: { visible: true, ...content } });
  },
  closePaywall() {
    this.setData({ 'paywall.visible': false });
  },
  // 弹窗内点击 7 天试用（结束后自动转月付）
  paywallTrial() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: true, planType: 'trial',
      trialStartAt: now, expireAt: now + 7 * 86400000, autoRenew: true,
      nextPlanAfterTrial: 'monthly'
    });
    this.setData({ 'paywall.visible': false });
    wx.showToast({ title: '7 天免费试用已开启，结束后将按月付 ¥19.9 自动续费', icon: 'none', duration: 2500 });
  },
  paywallSubscribeYearly() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: false, planType: 'yearly',
      trialStartAt: 0, expireAt: now + 365 * 86400000, autoRenew: true
    });
    this.setData({ 'paywall.visible': false });
    wx.showToast({ title: '订阅成功', icon: 'success' });
  },
  paywallSubscribeMonthly() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: false, planType: 'monthly',
      trialStartAt: 0, expireAt: now + 30 * 86400000, autoRenew: true
    });
    this.setData({ 'paywall.visible': false });
    wx.showToast({ title: '订阅成功', icon: 'success' });
  },
  paywallSeeMore() {
    this.setData({ 'paywall.visible': false });
    wx.switchTab({ url: '/pages/my/index' });
    setTimeout(() => {
      const pages = getCurrentPages();
      const myPage = pages[pages.length - 1];
      if (myPage && myPage.gotoMembership) myPage.gotoMembership();
    }, 300);
  },

  // 渲染指定模块的图表
  renderModuleCharts(module) {
    switch(module) {
      case 'sleep':
        this.drawScheduleBarChart();
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
        this.drawSnoreTrend();
        this.drawSleeptalkTrend();
        break;
    }
  },

  switchPeriod(e) {
    const period = e.currentTarget.dataset.period;
    const chart = e.currentTarget.dataset.chart;
    // 付费拦截：非会员切到月/全周期时弹窗
    if (period !== '7' && !this.isMember()) {
      this.openPaywall('longterm');
      return;
    }
    if (chart) {
      // 每图独立切换 period；切到月/全周期时定位到最新数据末端
      const chartPeriods = { ...this.data.chartPeriods, [chart]: period };
      let newStart = 0;
      if (period !== '7') {
        // 先切 period 再计算 maxStart（使用新 size）
        this.data.chartPeriods = chartPeriods;
        const all = this.getRawSeriesForChart(chart);
        if (all) {
          const size = this.getWindowSizeForPeriod(period);
          newStart = Math.max(0, all.length - size);
        }
      }
      const chartWindowStarts = { ...this.data.chartWindowStarts, [chart]: newStart };
      this.setData({ chartPeriods, chartWindowStarts }, () => {
        this.updateChartDateRange(chart);
        const drawFn = (this.data.chartDrawMap || {})[chart];
        if (drawFn && typeof this[drawFn] === 'function') {
          this[drawFn]();
        } else {
          this.renderAll();
        }
      });
      return;
    }
    // 兼容旧调用（全局切换）
    this.setData({ period }, () => {
      this.resetWindowByPeriod();
      this.resetPointTips(() => this.renderAll());
    });
  },

  panLeft(e) {
    const chart = e && e.currentTarget && e.currentTarget.dataset.chart;
    if (chart) return this.panChart(chart, -1);
    if (!this.data.klineControlState.canPrev) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 2));
    this.shiftWindow(-step);
  },

  panRight(e) {
    const chart = e && e.currentTarget && e.currentTarget.dataset.chart;
    if (chart) return this.panChart(chart, 1);
    if (!this.data.klineControlState.canNext) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 2));
    this.shiftWindow(step);
  },

  // 单图翻页（以 7 天为单位 = 周）
  panChart(chartId, direction) {
    const period = this.data.chartPeriods[chartId];
    if (period === '7') return;
    const all = this.getRawSeriesForChart(chartId);
    if (!all) return;
    const size = this.getWindowSizeForPeriod(period);
    const step = Math.max(1, Math.floor(size / 2)); // 翻半屏
    const cur = this.data.chartWindowStarts[chartId] || 0;
    const maxStart = Math.max(0, all.length - size);
    const next = Math.max(0, Math.min(maxStart, cur + direction * step));
    if (next === cur) return;
    const chartWindowStarts = { ...this.data.chartWindowStarts, [chartId]: next };
    this.setData({ chartWindowStarts }, () => {
      this.updateChartDateRange(chartId);
      const drawFn = (this.data.chartDrawMap || {})[chartId];
      if (drawFn && typeof this[drawFn] === 'function') this[drawFn]();
    });
  },

  // 单图拖动（任意像素步长，可单日精度）
  dragChart(chartId, dayDelta) {
    const period = this.data.chartPeriods[chartId];
    if (period === '7') return;
    const all = this.getRawSeriesForChart(chartId);
    if (!all) return;
    const size = this.getWindowSizeForPeriod(period);
    const cur = this.data.chartWindowStarts[chartId] || 0;
    const maxStart = Math.max(0, all.length - size);
    const next = Math.max(0, Math.min(maxStart, cur + dayDelta));
    if (next === cur) return;
    const chartWindowStarts = { ...this.data.chartWindowStarts, [chartId]: next };
    this.setData({ chartWindowStarts }, () => {
      this.updateChartDateRange(chartId);
      const drawFn = (this.data.chartDrawMap || {})[chartId];
      if (drawFn && typeof this[drawFn] === 'function') this[drawFn]();
    });
  },

  // 获取某图原始数据数组（用于计算 maxStart）
  getRawSeriesForChart(chartId) {
    const period = this.data.chartPeriods[chartId];
    const map = {
      duration: this.data.durationSeries,
      efficiency: this.data.efficiencySeries,
      prep: this.data.prepSeries,
      deep: this.data.deepSeries,
      breathRate: this.data.breathRateSeries,
      ahi: this.data.ahiSeries,
      apnea: this.data.apneaSeries,
      heartRate: this.data.heartRateSeries,
      hrv: this.data.hrvSeries,
      heartIndex: this.data.heartIndexSeries
    };
    const src = map[chartId];
    return src ? src[period] : null;
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

  jumpToStart(e) {
    const chart = e && e.currentTarget && e.currentTarget.dataset.chart;
    if (chart) return this.jumpChartToStart(chart);
    if (!this.data.klineControlState.canJumpStart) return;
    this.setData({ windowStart: 0 }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  jumpToEnd(e) {
    const chart = e && e.currentTarget && e.currentTarget.dataset.chart;
    if (chart) return this.jumpChartToEnd(chart);
    if (!this.data.klineControlState.canJumpEnd) return;
    const start = this.getMaxWindowStart(this.data.windowSize);
    this.setData({ windowStart: start }, () => {
      this.updateVisibleLabels();
      this.resetPointTips(() => this.renderAll());
    });
  },

  // 单图跳到最早 / 最新
  jumpChartToStart(chartId) {
    const period = this.data.chartPeriods[chartId];
    if (period === '7') return;
    if ((this.data.chartWindowStarts[chartId] || 0) === 0) return;
    const chartWindowStarts = { ...this.data.chartWindowStarts, [chartId]: 0 };
    this.setData({ chartWindowStarts }, () => {
      this.updateChartDateRange(chartId);
      const drawFn = (this.data.chartDrawMap || {})[chartId];
      if (drawFn && typeof this[drawFn] === 'function') this[drawFn]();
    });
  },
  jumpChartToEnd(chartId) {
    const period = this.data.chartPeriods[chartId];
    if (period === '7') return;
    const all = this.getRawSeriesForChart(chartId);
    if (!all) return;
    const size = this.getWindowSizeForPeriod(period);
    const maxStart = Math.max(0, all.length - size);
    if ((this.data.chartWindowStarts[chartId] || 0) === maxStart) return;
    const chartWindowStarts = { ...this.data.chartWindowStarts, [chartId]: maxStart };
    this.setData({ chartWindowStarts }, () => {
      this.updateChartDateRange(chartId);
      const drawFn = (this.data.chartDrawMap || {})[chartId];
      if (drawFn && typeof this[drawFn] === 'function') this[drawFn]();
    });
  },

  // 更新某图当前可见窗口的日期范围徽章
  updateChartDateRange(chartId) {
    const period = this.data.chartPeriods[chartId];
    const size = this.getWindowSizeForPeriod(period);
    const start = period === '7' ? 0 : (this.data.chartWindowStarts[chartId] || 0);
    // periodLength
    const all = this.getRawSeriesForChart(chartId) || [];
    const total = all.length;
    if (!total) return;
    // 起止 index → 日期：以"今天"为锚点，倒推 total 天
    const today = new Date();
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - (total - 1));
    const winStartDate = new Date(firstDay);
    winStartDate.setDate(firstDay.getDate() + start);
    const winEndDate = new Date(winStartDate);
    winEndDate.setDate(winStartDate.getDate() + size - 1);
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    const label = `${fmt(winStartDate)} - ${fmt(winEndDate)}`;
    const ranges = { ...(this.data.chartDateRanges || {}), [chartId]: label };
    this.setData({ chartDateRanges: ranges });
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
    // 视图统一为 7 根柱子/屏（周 = 全部、月 = 7 天/屏、全周期 = 7 周/屏）
    const size = Math.min(7, total);
    // 切换到月/全周期 时，默认定位到最新数据（最右屏）
    const start = Math.max(0, total - size);
    this.setData({ windowSize: size, windowStart: start }, () => {
      this.updateVisibleLabels();
    });
  },

  updateVisibleLabels() {
    const start = this.data.windowStart;
    const size = this.data.windowSize;
    const visibleSlice = this.getPeriodKlineSeries().slice(start, start + size);
    const labels = visibleSlice.map((item) => item.date);
    // 心率/HRV 图 X 轴标签：05-26（一）格式
    const heartLabels = visibleSlice.map((item) => item.heartDate || item.date);
    const maxStart = this.getMaxWindowStart(size);
    const minSize = this.getMinWindowSize(this.getPeriodLength());
    this.setData({
      visibleLabels: labels,
      lineAxisLabels: this.buildSparseLabels(labels),
      heartChartDateLabels: heartLabels,
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

  // 取该图当前 period 下的可见序列；chartId 可选，传入则使用该图独立 period+window
  // 每种周期对应的可见数据点数
  getWindowSizeForPeriod(period) {
    if (period === '7') return 7;
    if (period === '30') return 14;
    if (period === '90') return 30;
    return 7;
  },

  getVisibleSeries(map, chartId) {
    const period = chartId && this.data.chartPeriods[chartId]
      ? this.data.chartPeriods[chartId]
      : this.data.period;
    const all = map[period] || [];
    if (chartId && this.data.chartPeriods[chartId]) {
      const size = this.getWindowSizeForPeriod(period);
      if (period === "7") return all.slice(-size);
      const start = this.data.chartWindowStarts[chartId] || 0;
      return all.slice(start, start + size);
    }
    // 兼容旧调用（无 chartId）
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
    // 上床时间跨天：00:43 这种凌晨值要 +24h 后再求均值，否则会把 22 点-23 点的均值拉到 20 点附近
    const normalizedBed = bedMinutes.map((value) => (value >= 18 * 60 ? value : value + 24 * 60));
    const meanBedNorm = normalizedBed.reduce((sum, value) => sum + value, 0) / normalizedBed.length;
    const avgBed = meanBedNorm % (24 * 60); // 回到 [0,24h) 区间显示
    const avgWake = wakeMinutes.reduce((sum, value) => sum + value, 0) / wakeMinutes.length;
    const healthyCount = visible.filter((item) => this.isBedHealthy(item.bedTime)).length;
    const variance = normalizedBed.reduce((sum, value) => sum + Math.pow(value - meanBedNorm, 2), 0) / normalizedBed.length;
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

  // 心率/HRV 图手势翻页（月/全周期）
  onHeartTouchStart(e) {
    if (this.data.period === "7") return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    this.heartPanStartX = touch.clientX;
  },

  onHeartTouchMove(e) {
    if (this.data.period === "7") return;
    const touch = e.touches && e.touches[0];
    if (!touch || typeof this.heartPanStartX !== "number") return;
    const delta = touch.clientX - this.heartPanStartX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) this.panLeft();
    else this.panRight();
    this.heartPanStartX = touch.clientX;
  },

  onHeartTouchEnd() {
    this.heartPanStartX = null;
  },

  // ===== 新版：图表自由拖动（任意单日精度） =====
  // 每个 hc-canvas-wrap 自带 data-chart，拖动只影响该图
  onChartDragStart(e) {
    const chart = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.chart;
    if (!chart) return;
    const period = this.data.chartPeriods[chart];
    if (!period || period === '7') return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    // 计算每天对应的像素：以 hc-canvas 的宽度 / 当前窗口数据点数
    const size = this.getWindowSizeForPeriod(period);
    const cardWidth = (e.currentTarget && e.currentTarget.offsetLeft != null && e.currentTarget.offsetWidth)
      ? e.currentTarget.offsetWidth
      : 350;
    const pxPerDay = Math.max(8, cardWidth / size);
    this.chartDragState = {
      chart,
      startX: touch.clientX,
      startWindowStart: this.data.chartWindowStarts[chart] || 0,
      pxPerDay,
      lastAppliedDelta: 0
    };
  },

  onChartDragMove(e) {
    if (!this.chartDragState) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const { chart, startX, startWindowStart, pxPerDay, lastAppliedDelta } = this.chartDragState;
    const totalDx = touch.clientX - startX;
    // 累积总滑动距离 → 总天数差（向左滑 = 看更新数据 = +）
    const dayOffset = -Math.round(totalDx / pxPerDay);
    if (dayOffset === lastAppliedDelta) return;
    // 计算目标 windowStart
    const all = this.getRawSeriesForChart(chart);
    if (!all) return;
    const size = this.getWindowSizeForPeriod(this.data.chartPeriods[chart]);
    const maxStart = Math.max(0, all.length - size);
    const target = Math.max(0, Math.min(maxStart, startWindowStart + dayOffset));
    const cur = this.data.chartWindowStarts[chart] || 0;
    if (target === cur) {
      this.chartDragState.lastAppliedDelta = dayOffset;
      return;
    }
    const chartWindowStarts = { ...this.data.chartWindowStarts, [chart]: target };
    this.setData({ chartWindowStarts }, () => {
      this.updateChartDateRange(chart);
      const drawFn = (this.data.chartDrawMap || {})[chart];
      if (drawFn && typeof this[drawFn] === 'function') this[drawFn]();
    });
    this.chartDragState.lastAppliedDelta = dayOffset;
  },

  onChartDragEnd() {
    this.chartDragState = null;
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
      snore: "点击节点查看当日鼾声频次",
      sleeptalk: "点击节点查看当日梦话频次"
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
    // 只渲染已展开的模块（顶部 K线 卡片已移入睡眠板块）
    if (this.data.expanded.sleep) {
      this.drawScheduleBarChart();
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
      this.drawSnoreTrend();
      this.drawSleeptalkTrend();
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
      // 非健康区填充：紫色改 design-system warning 暖橙（淡）
      ctx.fillStyle = "rgba(212, 165, 72, 0.16)";
      drawZone(meta.min, hMin);
      drawZone(hMax, meta.max);
      return;
    }
    if (Array.isArray(meta.warningRange)) {
      const [wMin, wMax] = meta.warningRange;
      // 警示区填充：酒红改 design-system danger 淡红
      ctx.fillStyle = "rgba(196, 58, 44, 0.18)";
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
    // schedule 等没有 meta 的图表，只设置选中态，tooltip 在 canvas 内绘制
    if (!meta) {
      this.setData(
        { [`activePointIndexByChart.${chartId}`]: nearest.index },
        () => this.renderSingleChart(chartId)
      );
      return;
    }
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
      schedule: () => this.drawScheduleBarChart(),
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
      snore: () => this.drawSnoreTrend(),
      sleeptalk: () => this.drawSleeptalkTrend()
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

        // 趋势图背景：从深蓝紫改品牌深绿，与 hd-banner / K线 / 整页色调统一
        const panelGradient = ctx.createLinearGradient(0, 0, 0, height);
        panelGradient.addColorStop(0, "rgba(13, 58, 48, 0.96)");
        panelGradient.addColorStop(1, "rgba(20, 68, 58, 0.94)");
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
              ? "rgba(70, 199, 158, 0.5)"   /* 健康参考线：品牌亮绿 #46C79E */
              : "rgba(255, 255, 255, 0.12)"; /* 网格虚线：白色带透明，配深绿底 */
          ctx.setLineDash(isRefLine && !barMode ? [8, 8] : [6, 8]);
          ctx.beginPath();
          ctx.moveTo(plotLeft, y);
          ctx.lineTo(plotRight, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(255, 255, 255, 0.78)"; /* Y轴刻度：白色配深绿底 */
          ctx.font = "13px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(this.formatAxisTick(meta, tick), leftPad - 6, y + 4);
        });

        const refY = toY(refClamped);
        if (barMode) {
          ctx.strokeStyle = "rgba(70, 199, 158, 0.55)"; /* 参考线：品牌亮绿 #46C79E */
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
        ctx.font = "13px sans-serif";
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
          // 数据点：淡蓝改品牌亮绿，与深绿背景对比清晰、色系统一
          ctx.fillStyle = "#46C79E";
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

  // 睡眠趋势图表（新模板：折线图升级版 / 区间柱）
  // ====== 长期睡眠趋势 · 作息走势（柱形图：每天一根 上床→起床 圆角柱） ======
  drawScheduleBarChart() {
    const query = wx.createSelectorQuery();
    query.select("#scheduleBarChart")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const cssW = res[0].width;
        const cssH = res[0].height;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);

        const rows = this.getVisibleKlineSeries();
        if (!rows.length) return;

        const VB_W = 420, VB_H = 345;
        const scale = Math.min(cssW / VB_W, cssH / VB_H);
        const offsetX = (cssW - VB_W * scale) / 2;
        const offsetY = (cssH - VB_H * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // 绘图区
        const plotL = 50, plotR = 400, plotT = 26, plotB = 260;
        const plotW = plotR - plotL;
        const plotH = plotB - plotT;
        const n = Math.min(rows.length, 7);
        const xCenters = [];
        for (let i = 0; i < n; i++) {
          xCenters.push(plotL + plotW * (i + 0.5) / n);
        }

        // 背景：从冷米色改为品牌冷调白，跟整页绿调呼应
        const bg = ctx.createLinearGradient(0, 0, 0, VB_H);
        bg.addColorStop(0, "#F4FBF9");
        bg.addColorStop(1, "#ffffff");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, VB_W, VB_H);

        // Y 轴反转：22:00 在底部、10:00 在顶部（12 小时跨度，每 2 小时一档）
        const ySpan = 12;
        const valueToY = (v) => plotB - (v / ySpan) * plotH;
        const marks = [
          { v: 0,  label: "22:00" },
          { v: 2,  label: "00:00" },
          { v: 4,  label: "02:00" },
          { v: 6,  label: "04:00" },
          { v: 8,  label: "06:00" },
          { v: 10, label: "08:00" },
          { v: 12, label: "10:00" }
        ];

        // 横向虚线网格
        ctx.strokeStyle = "rgba(170,170,170,0.22)";
        ctx.lineWidth = 0.6;
        ctx.setLineDash([4, 4]);
        marks.forEach((m) => {
          const y = valueToY(m.v);
          ctx.beginPath();
          ctx.moveTo(plotL, y);
          ctx.lineTo(plotR, y);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Y 轴刻度
        ctx.fillStyle = "#9aa8a2";
        ctx.font = "13px sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        marks.forEach((m) => {
          ctx.fillText(m.label, plotL - 6, valueToY(m.v));
        });

        // 时间字符串 → y 值（22:00→0, 10:00→12）
        const timeToValue = (t) => {
          const [hh, mm] = t.split(":").map(Number);
          if (hh >= 22) return (hh - 22) + mm / 60;
          if (hh <= 10) return (hh + 2) + mm / 60;
          return NaN;
        };

        // 柱形（统一淡蓝色，无端点缺口）
        const barW = Math.min(28, plotW / n * 0.5);
        const activeIdx = (this.data.activePointIndexByChart || {}).schedule;
        const points = [];
        for (let i = 0; i < n; i++) {
          const row = rows[i];
          const bedV  = timeToValue(row.bedTime);
          const wakeV = timeToValue(row.wakeTime);
          if (!Number.isFinite(bedV) || !Number.isFinite(wakeV)) continue;
          // 反转后：上床(22:00)在底部 → yBed 数值大；起床(10:00)在顶部 → yWake 数值小
          const yBed  = valueToY(bedV);   // 柱子底部
          const yWake = valueToY(wakeV);  // 柱子顶部
          const yTop = Math.min(yBed, yWake);
          const yBot = Math.max(yBed, yWake);
          const cx = xCenters[i];
          const isActive = activeIdx === i;

          // 统一品牌绿渐变（从淡蓝改绿，与整页色调协调）
          const grad = ctx.createLinearGradient(0, yTop, 0, yBot);
          grad.addColorStop(0, "#46C79E");
          grad.addColorStop(1, "#1F8A6F");
          ctx.fillStyle = grad;
          ctx.globalAlpha = isActive ? 1 : 0.95;
          this.roundedRectPath(ctx, cx - barW / 2, yTop, barW, yBot - yTop, barW / 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          // 选中态描边：深蓝改品牌强调绿
          if (isActive) {
            ctx.strokeStyle = "#0F6E56";
            ctx.lineWidth = 2;
            this.roundedRectPath(ctx, cx - barW / 2, yTop, barW, yBot - yTop, barW / 2);
            ctx.stroke();
          }

          points.push({
            x: cx, y: (yTop + yBot) / 2, index: i,
            bedTime: row.bedTime, wakeTime: row.wakeTime, date: row.date,
            barHit: true, hitHalfW: barW * 0.7,
            hitY0: yTop, hitY1: yBot,
            yBed, yWake,
            value: row.bedTime, label: row.date
          });
        }

        // 选中态 Tooltip（深色气泡，显示上床+起床时间）
        if (typeof activeIdx === "number" && points[activeIdx]) {
          const ap = points[activeIdx];
          this.drawScheduleTooltip(ctx, ap.x, ap.hitY0, ap.hitY1, ap.bedTime, ap.wakeTime, ap.date);
        }

        // X 轴日期（两行：MM-DD / (周X)；密集时跳显）
        const schedLabelStep = Math.max(1, Math.ceil(n / 7));
        for (let i = 0; i < n; i++) {
          if (i % schedLabelStep !== 0 && i !== n - 1) continue;
          const row = rows[i];
          const m = /^(\d+)\.(\d+)（(.)）$/.exec(row.date);
          let mm = "", dd = "", wk = "";
          if (m) {
            mm = String(m[1]).padStart(2, "0");
            dd = String(m[2]).padStart(2, "0");
            wk = m[3];
          } else {
            mm = row.date;
          }
          // 2 行格式：上行星期，下行 MM-DD
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          if (wk) {
            ctx.fillStyle = "#5a6b65";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(wk, xCenters[i], plotB + 17);
            ctx.fillStyle = "#9aa8a2";
            ctx.font = "13px sans-serif";
            ctx.fillText(`${mm}-${dd}`, xCenters[i], plotB + 34);
          } else {
            ctx.fillStyle = "#5a6b65";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(mm, xCenters[i], plotB + 22);
          }
        }

        // 命中区
        const hitPoints = points.map((p) => ({
          ...p,
          x: offsetX + p.x * scale,
          y: offsetY + p.y * scale,
          hitHalfW: p.hitHalfW * scale,
          hitY0: offsetY + p.hitY0 * scale,
          hitY1: offsetY + p.hitY1 * scale
        }));
        this.chartHitAreas = this.chartHitAreas || {};
        this.chartHitAreas.schedule = {
          left: res[0].left, top: res[0].top,
          width: cssW, height: cssH,
          points: hitPoints
        };
      });
  },

  // 作息柱状图专用 tooltip（同时显示入睡和起床时间）
  drawScheduleTooltip(ctx, px, yTop, yBot, bedTime, wakeTime, dateStr) {
    const title = `${bedTime}  →  ${wakeTime}`;
    const sub = dateStr.replace(/（.*?）$/, "");
    ctx.font = "bold 13px sans-serif";
    const tw = ctx.measureText(title).width;
    ctx.font = "13px sans-serif";
    const sw = ctx.measureText(sub).width;
    const padX = 10;
    const w = Math.max(120, Math.max(tw, sw) + padX * 2);
    const h = 42;
    const tail = 7;
    // 优先放在柱顶上方
    let placeAbove = yTop - h - tail - 4 >= 4;
    let y = placeAbove ? yTop - h - tail - 4 : yBot + tail + 4;
    let x = px - w / 2;
    if (x < 4) x = 4;
    if (x + w > 416) x = 416 - w;

    // K线交互气泡：深灰蓝改为品牌深绿，与 hd-banner / kline-wrap 协调
    ctx.fillStyle = "#14443A";
    this.roundedRectPath(ctx, x, y, w, h, 7);
    ctx.fill();
    ctx.beginPath();
    if (placeAbove) {
      ctx.moveTo(px - 6, y + h);
      ctx.lineTo(px + 6, y + h);
      ctx.lineTo(px, y + h + tail);
    } else {
      ctx.moveTo(px - 6, y);
      ctx.lineTo(px + 6, y);
      ctx.lineTo(px, y - tail);
    }
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(title, x + w / 2, y + 14);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "13px sans-serif";
    ctx.fillText(sub, x + w / 2, y + 29);
  },

  drawDurationTrend() {
    // 数据 6.5-9.1，收窄到 5-11
    this.drawHealthLineChart({
      selector: "#durationChart",
      chartId: "duration",
      yMin: 5, yMax: 11,
      unit: "h", decimals: 1,
      refLine: 7.5,
      refLabel: "同龄人 7.5h",
      avg14Label: "14天 7.8h", avg14Value: 7.8,
      series: this.getVisibleSeries(this.data.durationSeries, "duration"),
      avg14Day: this.getVisibleSeries(this.data.durationAvg14, "duration"),
      lineColor: "#5b9ac9",
      greenIndices: [5, 6],
      redIndices: [],
      zones: [
        { from: 11, to: 9, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: ">9h", labelY: 10, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 9,  to: 7, color: "#C7E8DC", alpha: 0.42, chinese: "健康区", threshold: "7-9h", labelY: 8, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 7,  to: 5, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "<7h", labelY: 6, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 6.8,
      avgLabelY: 8.5,
      annotations: [
        { index: 5, anchorX: 280, title: "规律早睡·第3天", sub: "睡眠↑0.6h", emoji: "😴", bgColor: "#0F6E56" }
      ]
    });
  },

  drawEfficiencyTrend() {
    // 数据 76-92，收窄到 70-100，去掉极低的不健康区
    this.drawHealthLineChart({
      selector: "#efficiencyChart",
      chartId: "efficiency",
      yMin: 70, yMax: 100,
      unit: "%", decimals: 0,
      refLine: 80,
      refLabel: "同龄人 80%",
      avg14Label: "14天 84%", avg14Value: 84,
      series: this.getVisibleSeries(this.data.efficiencySeries, "efficiency"),
      avg14Day: this.getVisibleSeries(this.data.efficiencyAvg14, "efficiency"),
      lineColor: "#5b9ac9",
      greenIndices: [3, 5],
      redIndices: [],
      zones: [
        { from: 100, to: 85, color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: ">85%", labelY: 92, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 85,  to: 70, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "<85%", labelY: 77, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 78,
      avgLabelY: 88,
      annotations: [
        { index: 3, anchorX: 140, title: "卧室遮光·第2天", sub: "效率↑2.5%", emoji: "🌙", bgColor: "#0F6E56" }
      ]
    });
  },

  drawPrepTrend() {
    // 数据 15-47，收窄到 0-50
    this.drawHealthLineChart({
      selector: "#prepChart",
      chartId: "prep",
      yMin: 0, yMax: 50,
      unit: "min", decimals: 0,
      refLine: 18,
      refLabel: "同龄人 18min",
      avg14Label: "14天 28min", avg14Value: 28,
      series: this.getVisibleSeries(this.data.prepSeries, "prep"),
      avg14Day: this.getVisibleSeries(this.data.prepAvg14, "prep"),
      lineColor: "#5b9ac9",
      greenIndices: [3],
      redIndices: [4],
      zones: [
        { from: 50, to: 20, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: ">20", labelY: 35, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 20, to: 0,  color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: "<20", labelY: 10, borderColor: "#7FCBA3", textColor: "#0F6E56" }
      ],
      refLabelY: 15,
      avgLabelY: 33,
      annotations: [
        { index: 3, anchorX: 160, title: "腹式呼吸·第3天", sub: "入睡↓7min", emoji: "💨", bgColor: "#3C3489" },
        { index: 4, anchorX: 290, title: "睡前刷屏·警示", sub: "入睡 47min", emoji: "📱", bgColor: "#712B13" }
      ]
    });
  },

  drawDeepTrend() {
    // 数据 12-28，收窄到 5-32
    this.drawHealthLineChart({
      selector: "#deepChart",
      chartId: "deep",
      yMin: 5, yMax: 32,
      unit: "%", decimals: 0,
      refLine: 18,
      refLabel: "同龄人 18%",
      avg14Label: "14天 20%", avg14Value: 20,
      series: this.getVisibleSeries(this.data.deepSeries, "deep"),
      avg14Day: this.getVisibleSeries(this.data.deepAvg14, "deep"),
      lineColor: "#5b9ac9",
      greenIndices: [4],
      redIndices: [],
      zones: [
        { from: 32, to: 25, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: ">25%", labelY: 28, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 25, to: 15, color: "#C7E8DC", alpha: 0.42, chinese: "健康区", threshold: "15-25", labelY: 20, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 15, to: 5,  color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "<15%", labelY: 9, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 16,
      avgLabelY: 23,
      annotations: [
        { index: 4, anchorX: 230, title: "规律运动·第3天", sub: "深睡↑3%", emoji: "🏃", bgColor: "#712B13" }
      ]
    });
  },

  // 呼吸健康图表 — 升级为区间柱形图（与心率柱形图同模板）
  drawBreathRateTrend() {
    this.drawHealthBandChart({
      selector: "#breathRateChart",
      chartId: "breathRate",
      yMin: 6,
      yMax: 24,
      refLine: 16,
      refLabel: "同龄人 16次/分",
      avg14Label: "14天 14.5次/分",
      avg14Value: 14.5,
      maxSeries: this.getVisibleSeries(this.data.breathRateMaxSeries, "breathRate"),
      minSeries: this.getVisibleSeries(this.data.breathRateMinSeries, "breathRate"),
      avg14Day: this.getVisibleSeries(this.data.breathRate14DayAvg, "breathRate"),
      greenIndices: [1, 4],
      redIndices: [],
      zones: [
        { from: 24, to: 20, color: "#F5C8BD", alpha: 0.45, chinese: "亚健康", threshold: ">20", labelY: 22, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 20, to: 12, color: "#C7E8DC", alpha: 0.42, chinese: "健康区", threshold: "12-20", labelY: 16, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 12, to: 6,  color: "#F5C8BD", alpha: 0.45, chinese: "亚健康", threshold: "<12",  labelY: 9, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 18,
      avgLabelY: 13,
      annotations: [
        { index: 1, anchorX: 100, title: "腹式呼吸·第1天", sub: "呼吸节律↓1次", emoji: "💨", bgColor: "#6c5ce7" },
        { index: 4, anchorX: 270, title: "侧卧睡眠·第3天", sub: "呼吸更平稳", emoji: "🛌", bgColor: "#1d6855" }
      ]
    });
  },

  drawAhiTrend() {
    // 数据 0.8-7.2，集中在健康区/亚健康下沿，yMax 收窄到 10
    this.drawHealthLineChart({
      selector: "#ahiChart",
      chartId: "ahi",
      yMin: 0, yMax: 10,
      unit: "", decimals: 1,
      refLine: 2,
      refLabel: "同龄人 2",
      avg14Label: "14天 1.1", avg14Value: 1.1,
      series: this.getVisibleSeries(this.data.ahiSeries, "ahi"),
      avg14Day: this.getVisibleSeries(this.data.ahiAvg14, "ahi"),
      lineColor: "#5b9ac9",
      greenIndices: [5],
      redIndices: [],
      zones: [
        { from: 10, to: 5, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "5-15", labelY: 7.5, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 5,  to: 0, color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: "<5", labelY: 2.5, borderColor: "#7FCBA3", textColor: "#0F6E56" }
      ],
      refLabelY: 1.6,
      avgLabelY: 0.6,
      annotations: [
        { index: 5, anchorX: 280, title: "侧卧睡眠·第2天", sub: "AHI ↓ 0.5", emoji: "🛌", bgColor: "#0F6E56" }
      ]
    });
  },

  drawApneaTrend() {
    // 数据 4-25，集中在 0-30，yMax 收窄到 30
    this.drawHealthLineChart({
      selector: "#apneaChart",
      chartId: "apnea",
      yMin: 0, yMax: 30,
      unit: "秒", decimals: 0,
      refLine: 5,
      refLabel: "同龄人 5秒",
      avg14Label: "14天 8秒", avg14Value: 8,
      series: this.getVisibleSeries(this.data.apneaSeries, "apnea"),
      avg14Day: this.getVisibleSeries(this.data.apneaAvg14, "apnea"),
      lineColor: "#5b9ac9",
      greenIndices: [5, 6],
      redIndices: [2],
      zones: [
        { from: 30, to: 10, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "10-30", labelY: 22, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 10, to: 0,  color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: "<10", labelY: 5, borderColor: "#7FCBA3", textColor: "#0F6E56" }
      ],
      refLabelY: 3.5,
      avgLabelY: 12,
      annotations: [
        { index: 2, anchorX: 130, title: "饱食晚餐·警示", sub: "暂停 18秒", emoji: "🍴", bgColor: "#712B13" },
        { index: 5, anchorX: 290, title: "侧卧睡眠·第3天", sub: "降至 5秒", emoji: "🛌", bgColor: "#0F6E56" }
      ]
    });
  },

  // ---------- 心肺健康：浅色主题 + 健康分区图 ----------
  // 使用逻辑坐标体系 360×320 (viewBox)，所有元素按比例缩放到实际画布
  drawHealthBandChart(opt) {
    const {
      selector, chartId, yMin, yMax, refLine, refLabel, avg14Label, avg14Value,
      maxSeries, minSeries, avg14Day, greenIndices, redIndices,
      zones, annotations
    } = opt;

    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const cssW = res[0].width;
        const cssH = res[0].height;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);

        if (!maxSeries || maxSeries.length < 1) return;

        // === 逻辑坐标系（viewBox 420×320：左右各 30/40px 极窄边距给竖排胶囊，柱形占据画面 83% ） ===
        const VB_W = 420, VB_H = 345;
        const scale = Math.min(cssW / VB_W, cssH / VB_H);
        const offsetX = (cssW - VB_W * scale) / 2;
        const offsetY = (cssH - VB_H * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // 绘图区拓宽到 30→380（width 350），柱中心均布 50px 间距
        const plotL = 30, plotR = 380, plotT = 50, plotB = 290;
        const plotW = plotR - plotL; // 350
        const plotH = plotB - plotT; // 240
        const toY = (v) => plotB - ((v - yMin) / (yMax - yMin)) * plotH;
        const xCenters = [55, 105, 155, 205, 255, 305, 355];
        const n = Math.min(maxSeries.length, xCenters.length);
        const barW = 16;
        const barR = 8;

        // ===== Layer 1: 背景（淡米白） =====
        const bg = ctx.createLinearGradient(0, 0, 0, VB_H);
        bg.addColorStop(0, "#F4FBF9");
        bg.addColorStop(1, "#ffffff");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, VB_W, VB_H);

        // ===== Layer 2: 健康分区背景色块 =====
        zones.forEach((z) => {
          ctx.globalAlpha = z.alpha || 0.4;
          ctx.fillStyle = z.color;
          const y1 = toY(z.from);
          const y2 = toY(z.to);
          ctx.fillRect(plotL, Math.min(y1, y2), plotW, Math.abs(y2 - y1));
        });
        ctx.globalAlpha = 1.0;

        // ===== Layer 3: 网格线（淡虚线） =====
        ctx.strokeStyle = "rgba(170, 170, 170, 0.18)";
        ctx.lineWidth = 0.6;
        ctx.setLineDash([3, 4]);
        const ySteps = 6;
        const yStepVal = (yMax - yMin) / ySteps;
        for (let i = 0; i <= ySteps; i++) {
          const v = yMin + yStepVal * i;
          const y = toY(v);
          ctx.beginPath();
          ctx.moveTo(plotL, y);
          ctx.lineTo(plotR, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // ===== Layer 4: Y轴刻度（极简：max/mid/min 三个，靠紧 plotL 内侧） =====
        ctx.fillStyle = "#8A978F";
        ctx.font = "13px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const keyTicks = [yMax, Math.round((yMax + yMin) / 2), yMin];
        keyTicks.forEach((v) => {
          ctx.fillText(`${v}`, plotL + 3, toY(v));
        });

        // ===== Layer 5: 区间柱 =====
        const points = [];
        const greenDayDots = []; // 缓存绿日光晕位置，柱子上方画
        const redWarnDots = [];  // 缓存红日 ⚠️ 位置
        for (let i = 0; i < n; i++) {
          const maxV = Number(maxSeries[i]);
          const minV = (typeof minSeries[i] === "number") ? Number(minSeries[i]) : maxV - 8;
          const cx = xCenters[i];
          const yHi = toY(Math.max(maxV, minV));
          const yLo = toY(Math.min(maxV, minV));
          const h = Math.max(barW, yLo - yHi);

          const isGreen = greenIndices && greenIndices.indexOf(i) >= 0;
          const isRed = redIndices && redIndices.indexOf(i) >= 0;
          let topC, botC, strokeC = null;
          if (isRed) { topC = "#C43A2C"; botC = "#F4CECE"; strokeC = "#C43A2C"; } // design-system danger
          else { topC = "#1F8A6F"; botC = "#46C79E"; }  // 健康日：品牌绿主→亮绿

          const grad = ctx.createLinearGradient(0, yHi, 0, yHi + h);
          grad.addColorStop(0, topC);
          grad.addColorStop(1, botC);
          ctx.globalAlpha = 0.88;
          ctx.fillStyle = grad;
          this.roundedRectPath(ctx, cx - barW / 2, yHi, barW, h, barR);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          if (strokeC) {
            ctx.strokeStyle = strokeC;
            ctx.lineWidth = 1.4;
            this.roundedRectPath(ctx, cx - barW / 2, yHi, barW, h, barR);
            ctx.stroke();
            redWarnDots.push({ cx, yHi });
          }
          if (isGreen) {
            greenDayDots.push({ cx, yHi });
          }

          points.push({
            x: cx, y: (yHi + yLo) / 2,
            index: i, value: maxV,
            label: (this.data.heartChartDateLabels && this.data.heartChartDateLabels[i]) || `D${i + 1}`,
            barHit: true,
            hitHalfW: barW * 0.7 + 6,
            hitY0: yHi,
            hitY1: yLo
          });
        }

        // 绿日光晕（柱顶半透明圆）
        greenDayDots.forEach(({ cx, yHi }) => {
          const r = 9;
          const halo = ctx.createRadialGradient(cx, yHi, 1, cx, yHi, r);
          // 健康日光晕：哑光绿改品牌亮绿 #46C79E
          halo.addColorStop(0, "rgba(70, 199, 158, 0.85)");
          halo.addColorStop(1, "rgba(70, 199, 158, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(cx, yHi, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // ===== Layer 6: 14天均值曲线（背景已为品牌深绿，改用亮绿虚线确保可见性） =====
        if (avg14Day && avg14Day.length > 1) {
          ctx.strokeStyle = "rgba(70, 199, 158, 0.9)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([5, 4]);
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          const m = Math.min(avg14Day.length, n);
          for (let i = 0; i < m; i++) {
            const x = xCenters[i];
            const y = toY(Number(avg14Day[i]));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0;
          ctx.setLineDash([]);
        }

        // ===== Layer 7: 同龄人参考线（深绿底改用淡白虚线，跟均值线绿色区分） =====
        const refY = toY(refLine);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(plotL, refY);
        ctx.lineTo(plotR, refY);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([]);

        // ===== Layer 8: ⚠️ 警示标记（柱顶上方） =====
        redWarnDots.forEach(({ cx, yHi }) => {
          ctx.font = "13px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#C43A2C"; // 警示色改 design-system danger
          ctx.fillText("⚠", cx, yHi - 10);  // 不带 ️ 变体选择符，避免小程序 canvas 渲染为 tofu
        });

        // ===== Layer 9 & 10: 区间标签 + 参考线标签 已移到图例区（hc-legend），画布内不再绘制 =====
        // （原 drawVerticalZoneLabel 调用已删除，避免与图例信息重复）

        // ===== Layer 11: 归因气泡（仅稀疏视图下显示，避免月/全周期视图杂乱） =====
        if (annotations && annotations.length && points.length <= 10) {
          annotations.forEach((a) => {
            const point = points[a.index];
            if (!point) return;
            this.drawAnnotationBubble(ctx, {
              point,
              title: a.title,
              sub: a.sub,
              emoji: a.emoji,
              bgColor: a.bgColor,
              anchorX: typeof a.anchorX === "number" ? a.anchorX : point.x,
              topY: 14,
              maxWidth: VB_W
            });
          });
        }

        // ===== Layer 12: X 轴日期（2 行：星期在上，MM-DD 在下；密集时自动跳显） =====
        const dateLabels = this.data.heartChartDateLabels || [];
        const labelStep = Math.max(1, Math.ceil(n / 7));
        for (let i = 0; i < n; i++) {
          if (i % labelStep !== 0 && i !== n - 1) continue;
          this.drawTwoLineDateLabel(ctx, dateLabels[i] || `D${i + 1}`, xCenters[i], plotB);
        }

        // 命中区缓存（注意：实际命中坐标需考虑 scale 和 offset）
        const hitPoints = points.map((p) => ({
          ...p,
          x: offsetX + p.x * scale,
          y: offsetY + p.y * scale,
          hitHalfW: p.hitHalfW * scale,
          hitY0: offsetY + p.hitY0 * scale,
          hitY1: offsetY + p.hitY1 * scale
        }));
        this.chartHitAreas = this.chartHitAreas || {};
        this.chartHitAreas[chartId] = {
          left: res[0].left,
          top: res[0].top,
          width: cssW,
          height: cssH,
          points: hitPoints
        };
      });
  },

  // ---------- 折线图升级版（与区间柱图同框架，柱子换为折线+点+面积） ----------
  // 公用：渲染 2 行日期 X 轴 — 上行星期，下行 MM-DD
  drawTwoLineDateLabel(ctx, label, x, plotB) {
    // 解析 "MM-DD（X）" → 提取 mm-dd 与 weekday
    const m = String(label || '').match(/(\d+)\D+(\d+)[^一-龥]*([一-龥])?/);
    let mmdd = label || '';
    let wk = '';
    if (m) {
      mmdd = `${String(m[1]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
      wk = m[3] || '';
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if (wk) {
      ctx.fillStyle = "#5a6b65";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(wk, x, plotB + 17);
      ctx.fillStyle = "#9aa8a2";
      ctx.font = "13px sans-serif";
      ctx.fillText(mmdd, x, plotB + 34);
    } else {
      ctx.fillStyle = "#5a6b65";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(mmdd, x, plotB + 22);
    }
  },

  drawHealthLineChart(opt) {
    const {
      selector, chartId, yMin, yMax, refLine, refLabel,
      avg14Label, avg14Value, series, avg14Day,
      greenIndices, redIndices, zones, annotations,
      lineColor, fillColor
    } = opt;

    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const cssW = res[0].width;
        const cssH = res[0].height;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cssW, cssH);
        if (!series || series.length < 1) return;

        const VB_W = 420, VB_H = 345;
        const scale = Math.min(cssW / VB_W, cssH / VB_H);
        const offsetX = (cssW - VB_W * scale) / 2;
        const offsetY = (cssH - VB_H * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        const plotL = 30, plotR = 380, plotT = 50, plotB = 290;
        const plotW = plotR - plotL;
        const plotH = plotB - plotT;
        const toY = (v) => plotB - ((v - yMin) / (yMax - yMin)) * plotH;
        const xCenters = [55, 105, 155, 205, 255, 305, 355];
        const n = Math.min(series.length, xCenters.length);

        // L1 背景
        const bg = ctx.createLinearGradient(0, 0, 0, VB_H);
        bg.addColorStop(0, "#F4FBF9");
        bg.addColorStop(1, "#ffffff");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, VB_W, VB_H);

        // L2 分区
        zones.forEach((z) => {
          ctx.globalAlpha = z.alpha || 0.4;
          ctx.fillStyle = z.color;
          const y1 = toY(z.from);
          const y2 = toY(z.to);
          ctx.fillRect(plotL, Math.min(y1, y2), plotW, Math.abs(y2 - y1));
        });
        ctx.globalAlpha = 1.0;

        // L3 网格
        ctx.strokeStyle = "rgba(170,170,170,0.18)";
        ctx.lineWidth = 0.6;
        ctx.setLineDash([3, 4]);
        const ySteps = 6;
        const yStepVal = (yMax - yMin) / ySteps;
        for (let i = 0; i <= ySteps; i++) {
          const y = toY(yMin + yStepVal * i);
          ctx.beginPath();
          ctx.moveTo(plotL, y);
          ctx.lineTo(plotR, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // L4 Y刻度
        ctx.fillStyle = "#8A978F";
        ctx.font = "13px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        [yMax, Math.round((yMax + yMin) / 2), yMin].forEach((v) => {
          ctx.fillText(`${v}`, plotL + 3, toY(v));
        });

        // L5 主体：面积 + 折线 + 数据点
        const points = [];
        for (let i = 0; i < n; i++) {
          const v = Number(series[i]);
          points.push({ x: xCenters[i], y: toY(v), index: i, value: v });
        }

        // 折线主体（Catmull-Rom → Bezier 平滑曲线，所有段都是光滑曲线）
        ctx.strokeStyle = lineColor || "#1F8A6F"; /* 折线 fallback 改品牌绿 */
        ctx.lineWidth = 2.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        if (points.length > 0) ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i - 1] || points[i];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + 2] || p2;
          // Catmull-Rom 张力系数 0.5（标准）
          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.stroke();

        // 数据点 + 见效日发光 + 异常点高亮 + 选中态突出
        const greenSet = new Set(greenIndices || []);
        const redSet = new Set(redIndices || []);
        const activeIdx = (this.data.activePointIndexByChart || {})[chartId];
        // 根据数据点数量自适应：>=20 小点、>=14 中点、否则原大小
        const ptCount = points.length;
        const sizeFactor = ptCount >= 20 ? 0.55 : (ptCount >= 14 ? 0.75 : 1.0);
        points.forEach((p) => {
          const isGreen = greenSet.has(p.index);
          const isRed = redSet.has(p.index);
          const isActive = activeIdx === p.index;
          const baseR = isActive ? 6 : (isGreen || isRed ? 5 : 4.2);
          const r = baseR * sizeFactor + (isActive ? 1.5 : 0);
          const ringColor = isRed ? "#C43A2C" : isGreen ? "#1F8A6F" : (lineColor || "#1F8A6F");
          // 白底圈（更厚以让点更显眼）
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 2 * sizeFactor, 0, Math.PI * 2);
          ctx.fill();
          // 圆点
          ctx.fillStyle = ringColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          // 绿日发光（仅在稀疏视图下显示）
          if (isGreen && sizeFactor > 0.7) {
            const halo = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 11);
            halo.addColorStop(0, "rgba(70, 199, 158, 0.55)");
            halo.addColorStop(1, "rgba(70, 199, 158, 0)");
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ringColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
          }
          // 选中态外圈
          if (isActive) {
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        // L6 14天均值（design-system chart-line：品牌深绿）
        if (avg14Day && avg14Day.length > 1) {
          ctx.strokeStyle = "#14443A";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([5, 4]);
          ctx.globalAlpha = 0.78;
          ctx.beginPath();
          const m = Math.min(avg14Day.length, n);
          for (let i = 0; i < m; i++) {
            const x = xCenters[i];
            const y = toY(Number(avg14Day[i]));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0;
          ctx.setLineDash([]);
        }

        // L7 同龄人线（design-system chart-ref：冷灰蓝）
        const refY = toY(refLine);
        ctx.strokeStyle = "#8A9BAA";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(plotL, refY);
        ctx.lineTo(plotR, refY);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([]);

        // L8 ⚠️ 警示
        points.forEach((p) => {
          if (redSet.has(p.index)) {
            ctx.font = "13px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#C43A2C"; // 警示色 design-system danger
            ctx.fillText("⚠", p.x, p.y - 14);
          }
        });

        // L9 & L10: 区间/参考线标签已移到图例区（hc-legend），画布内不再绘制

        // L11 气泡（仅稀疏视图下显示，避免月/全周期视图杂乱）
        if (annotations && annotations.length && points.length <= 10) {
          annotations.forEach((a) => {
            const point = points[a.index];
            if (!point) return;
            this.drawAnnotationBubble(ctx, {
              point: { ...point, hitY0: point.y, hitY1: point.y },
              title: a.title,
              sub: a.sub,
              emoji: a.emoji,
              bgColor: a.bgColor,
              anchorX: typeof a.anchorX === "number" ? a.anchorX : point.x,
              topY: 14,
              maxWidth: VB_W
            });
          });
        }

        // L11.5 选中态 Tooltip（深色气泡，显示数值 + 日期，三角尾指向数据点）
        if (typeof activeIdx === "number" && points[activeIdx]) {
          const ap = points[activeIdx];
          const dateLabels0 = this.data.heartChartDateLabels || [];
          const dateLbl = (dateLabels0[activeIdx] || `D${activeIdx + 1}`).replace(/（.*?）$/, "");
          const decimals = opt.decimals != null ? opt.decimals : (yMax - yMin <= 5 ? 1 : 0);
          const valStr = `${Number(ap.value).toFixed(decimals)}${opt.unit || ""}`;
          this.drawClickTooltip(ctx, ap.x, ap.y, valStr, dateLbl);
        }

        // L12 X 轴日期（2 行：星期在上，MM-DD 在下；密集时跳显）
        const dateLabels = this.data.heartChartDateLabels || [];
        const lblStep = Math.max(1, Math.ceil(n / 7));
        for (let i = 0; i < n; i++) {
          if (i % lblStep !== 0 && i !== n - 1) continue;
          this.drawTwoLineDateLabel(ctx, dateLabels[i] || `D${i + 1}`, xCenters[i], plotB);
        }

        // 命中区缓存
        const hitPoints = points.map((p) => ({
          ...p,
          x: offsetX + p.x * scale,
          y: offsetY + p.y * scale,
          label: dateLabels[p.index] || `D${p.index + 1}`,
          barHit: false,
          hitHalfW: 18 * scale,
          hitY0: offsetY + (p.y - 14) * scale,
          hitY1: offsetY + (p.y + 14) * scale
        }));
        this.chartHitAreas = this.chartHitAreas || {};
        this.chartHitAreas[chartId] = {
          left: res[0].left, top: res[0].top, width: cssW, height: cssH, points: hitPoints
        };
      });
  },

  drawHeartRateTrend() {
    this.drawHealthBandChart({
      selector: "#heartRateChart",
      chartId: "heartRate",
      yMin: 40,
      yMax: 100,
      refLine: 78,
      refLabel: "同龄人 78bpm",
      avg14Label: "14天 72bpm",
      avg14Value: 72,
      maxSeries: this.getVisibleSeries(this.data.heartRateSeries, "heartRate"),
      minSeries: this.getVisibleSeries(this.data.heartRateMinSeries, "heartRate"),
      avg14Day: this.getVisibleSeries(this.data.heartRate14DayAvg, "heartRate"),
      greenIndices: [2, 6],
      redIndices: [4],
      // 3 个分区：上 + 下亚健康都用淡珊瑚红，中间健康区淡绿，填满 40-100 全 Y 轴
      zones: [
        { from: 100, to: 75, color: "#F5C8BD", alpha: 0.45, chinese: "亚健康区", threshold: "> 75bpm", labelY: 88, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 75, to: 55, color: "#C7E8DC", alpha: 0.42, chinese: "健康区", threshold: "55-75bpm", labelY: 65, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 55, to: 40, color: "#F5C8BD", alpha: 0.45, chinese: "亚健康区", threshold: "< 55bpm", labelY: 48, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      // 参考线 78 在亚健康区下沿；14天 72 在健康区上沿
      refLabelY: 82,
      avgLabelY: 68,
      annotations: [
        { index: 2, anchorX: 130, title: "腹式呼吸·第2天", sub: "静息心率↓4bpm", emoji: "💨", bgColor: "#6c5ce7" },
        { index: 4, anchorX: 280, title: "规律早睡·第4天", sub: "心率稳定低位", emoji: "😴", bgColor: "#1d6855" }
      ]
    });
  },

  drawHrvTrend() {
    // 数据 18-128，收窄到 10-140
    this.drawHealthLineChart({
      selector: "#hrvChart",
      chartId: "hrv",
      yMin: 10, yMax: 140,
      unit: "ms", decimals: 0,
      refLine: 42,
      refLabel: "同龄人 42ms",
      avg14Label: "14天 65ms", avg14Value: 65,
      series: this.getVisibleSeries(this.data.hrvSeries, "hrv"),
      avg14Day: this.getVisibleSeries(this.data.hrv14DayAvg, "hrv"),
      lineColor: "#5b9ac9",
      greenIndices: [3, 6],
      redIndices: [1],
      zones: [
        { from: 140, to: 50, color: "#C7E8DC", alpha: 0.32, chinese: "健康区", threshold: ">50ms", labelY: 120, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 50, to: 10,  color: "#F5C8BD", alpha: 0.45, chinese: "亚健康", threshold: "<50", labelY: 30, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 42,
      avgLabelY: 78,
      annotations: [
        { index: 3, anchorX: 140, title: "腹式呼吸·第4天", sub: "HRV↑63ms", emoji: "💨", bgColor: "#1d8a5c" },
        { index: 5, anchorX: 270, title: "规律运动·第2天", sub: "自主神经增强", emoji: "🏃", bgColor: "#A0552D" }
      ]
    });
  },

  // 点击 Tooltip（深色气泡，数值 + 日期 + 三角尾巴指向数据点）
  drawClickTooltip(ctx, px, py, valueStr, dateStr) {
    ctx.font = "bold 13px sans-serif";
    const vw = ctx.measureText(valueStr).width;
    ctx.font = "13px sans-serif";
    const dw = ctx.measureText(dateStr).width;
    const padX = 10;
    const w = Math.max(54, Math.max(vw, dw) + padX * 2);
    const h = 40;
    const tail = 7;
    let placeAbove = py - h - tail - 4 >= 4;
    let y = placeAbove ? py - h - tail - 4 : py + tail + 4;
    let x = px - w / 2;
    if (x < 4) x = 4;
    if (x + w > 416) x = 416 - w;

    // 气泡背景
    ctx.fillStyle = "#14443A";
    this.roundedRectPath(ctx, x, y, w, h, 6);
    ctx.fill();
    // 三角尾
    ctx.fillStyle = "#14443A";
    ctx.beginPath();
    if (placeAbove) {
      ctx.moveTo(px - 6, y + h);
      ctx.lineTo(px + 6, y + h);
      ctx.lineTo(px, y + h + tail);
    } else {
      ctx.moveTo(px - 6, y);
      ctx.lineTo(px + 6, y);
      ctx.lineTo(px, y - tail);
    }
    ctx.closePath();
    ctx.fill();

    // 文字
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(valueStr, x + w / 2, y + 13);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "13px sans-serif";
    ctx.fillText(dateStr, x + w / 2, y + 28);
  },

  // 圆角矩形辅助
  roundedRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  },

  // 标注气泡（极简紧凑：高 28，固定在顶部留白区，斜虚线指向柱子）
  drawAnnotationBubble(ctx, { point, title, sub, emoji, bgColor, anchorX, topY, maxWidth }) {
    const boxH = sub ? 40 : 28;   // 双行加高
    const radius = 8;
    const iconR = 10;
    const iconCx_offset = 13;
    const textLeftPad = iconCx_offset + iconR + 6;

    // 测量文字
    ctx.font = "bold 12px sans-serif";
    const titleW = ctx.measureText(title).width;
    ctx.font = "11px sans-serif";
    const subW = sub ? ctx.measureText(sub).width : 0;
    const contentW = Math.max(titleW, subW);
    const boxW = Math.min(140, Math.max(88, textLeftPad + contentW + 10));

    // 气泡定位
    let x = anchorX - boxW / 2;
    let y = topY;
    if (x < 2) x = 2;
    if (x + boxW > maxWidth - 2) x = maxWidth - 2 - boxW;

    // 斜虚线：气泡底部中点 → 柱子顶部
    ctx.strokeStyle = bgColor;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const lineStartX = Math.max(x + 8, Math.min(x + boxW - 8, point.x));
    ctx.moveTo(lineStartX, y + boxH);
    ctx.lineTo(point.x, point.hitY0 - 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;

    // 气泡背景
    ctx.fillStyle = bgColor;
    this.roundedRectPath(ctx, x, y, boxW, boxH, radius);
    ctx.fill();

    // 左侧白色圆形图标 + emoji
    const iconCx = x + iconCx_offset;
    const iconCy = y + boxH / 2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.fill();
    if (emoji) {
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, iconCx, iconCy + 0.5);
    }

    // 文字 — 双行时上行 bold 标题 + 下行细体副标题，行距 14
    const textX = x + textLeftPad;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    if (sub) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(title, textX, y + 13);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "11px sans-serif";
      ctx.fillText(sub, textX, y + 28);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(title, textX, iconCy);
    }
  },

  // 竖排标签（中文逐字竖排 + 横排数字/单位，置于图表左/右外边距）
  drawVerticalZoneLabel(ctx, x, y, chinese, threshold, borderColor, textColor) {
    const charSize = 7.5;
    const charSpacing = 8.5;
    const thresholdSize = 7;
    const padX = 3;
    const padY = 3;

    ctx.font = `bold ${thresholdSize}px sans-serif`;
    const thresholdW = threshold ? ctx.measureText(threshold).width : 0;
    const chineseH = chinese.length * charSpacing;
    const boxW = Math.max(16, thresholdW + padX * 2);
    const boxH = chineseH + (threshold ? thresholdSize + 3 : 0) + padY * 2;

    // 白色不透明圆角背景
    ctx.fillStyle = "#ffffff";
    this.roundedRectPath(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, 4);
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    this.roundedRectPath(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, 4);
    ctx.stroke();

    // 竖排中文
    ctx.fillStyle = textColor;
    ctx.font = `bold ${charSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const chineseTop = y - boxH / 2 + padY + charSize / 2 + 1;
    for (let i = 0; i < chinese.length; i++) {
      ctx.fillText(chinese[i], x, chineseTop + i * charSpacing);
    }

    // 横排数字/单位（底部）
    if (threshold) {
      ctx.font = `bold ${thresholdSize}px sans-serif`;
      ctx.fillText(threshold, x, y + boxH / 2 - padY - thresholdSize / 2 + 0.5);
    }
  },

  // 绘制标签胶囊辅助函数
  drawLabelCapsule(ctx, x, y, text, borderColor, textColor, fontSize = 9, fontWeight = 400) {
    const padding = 5;
    ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
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
    // 数据 76-96，收窄到 65-100，去掉不健康区
    this.drawHealthLineChart({
      selector: "#heartIndexChart",
      chartId: "heartIndex",
      yMin: 65, yMax: 100,
      unit: "分", decimals: 0,
      refLine: 75,
      refLabel: "同龄人 75分",
      avg14Label: "14天 92分", avg14Value: 92,
      series: this.getVisibleSeries(this.data.heartIndexSeries, "heartIndex"),
      avg14Day: this.getVisibleSeries(this.data.heartIndexAvg14, "heartIndex"),
      lineColor: "#5b9ac9",
      greenIndices: [5],
      redIndices: [],
      zones: [
        { from: 100, to: 80, color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: ">80", labelY: 92, borderColor: "#7FCBA3", textColor: "#0F6E56" },
        { from: 80,  to: 65, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "60-80", labelY: 72, borderColor: "#E5A99B", textColor: "#A14530" }
      ],
      refLabelY: 73,
      avgLabelY: 97,
      annotations: [
        { index: 5, anchorX: 280, title: "心率稳定·第3天", sub: "指数 ↑ 3 分", emoji: "❤️", bgColor: "#1d8a5c" }
      ]
    });
  },

  // 睡眠声音图表 — 升级为 drawHealthLineChart，与心脏/呼吸折线图同模板
  drawSnoreTrend() {
    this.drawHealthLineChart({
      selector: "#snoreChart",
      chartId: "snore",
      yMin: 0, yMax: 20,
      unit: "次", decimals: 0,
      refLine: 5,
      refLabel: "同龄人 5次",
      avg14Label: "14天 4次", avg14Value: 4,
      series: this.getVisibleSeries(this.data.snoreSeries, "snore"),
      avg14Day: this.getVisibleSeries(this.data.snoreAvg14, "snore"),
      lineColor: "#5b9ac9",
      greenIndices: [5, 6],
      redIndices: [2],
      zones: [
        { from: 20, to: 5, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "5-20", labelY: 12, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 5,  to: 0, color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: "<5", labelY: 2.5, borderColor: "#7FCBA3", textColor: "#0F6E56" }
      ],
      refLabelY: 3,
      avgLabelY: 7,
      annotations: [
        { index: 2, anchorX: 130, title: "饮酒晚餐·警示", sub: "鼾声 6 次", emoji: "🍷", bgColor: "#712B13" },
        { index: 5, anchorX: 270, title: "侧卧睡眠·第3天", sub: "鼾声减少", emoji: "🛌", bgColor: "#0F6E56" }
      ]
    });
  },

  drawSleeptalkTrend() {
    this.drawHealthLineChart({
      selector: "#sleeptalkChart",
      chartId: "sleeptalk",
      yMin: 0, yMax: 10,
      unit: "次", decimals: 0,
      refLine: 3,
      refLabel: "同龄人 3次",
      avg14Label: "14天 2次", avg14Value: 2,
      series: this.getVisibleSeries(this.data.sleeptalkSeries, "sleeptalk"),
      avg14Day: this.getVisibleSeries(this.data.sleeptalkAvg14, "sleeptalk"),
      lineColor: "#5b9ac9",
      greenIndices: [1, 4],
      redIndices: [],
      zones: [
        { from: 10, to: 3, color: "#F5C8BD", alpha: 0.4, chinese: "亚健康", threshold: "3-10", labelY: 6.5, borderColor: "#E5A99B", textColor: "#A14530" },
        { from: 3,  to: 0, color: "#C7E8DC", alpha: 0.4, chinese: "健康区", threshold: "<3", labelY: 1.5, borderColor: "#7FCBA3", textColor: "#0F6E56" }
      ],
      refLabelY: 1.8,
      avgLabelY: 4,
      annotations: [
        { index: 4, anchorX: 230, title: "睡前放松·第2天", sub: "梦话减少", emoji: "🧘", bgColor: "#0F6E56" }
      ]
    });
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
          ctx.font = "13px sans-serif";
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
          ctx.font = "13px sans-serif";
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
          ctx.font = "13px sans-serif";
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