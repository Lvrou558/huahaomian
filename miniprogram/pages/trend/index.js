Page({
  data: {
    period: "7",
    windowStart: 0,
    windowSize: 7,
    visibleLabels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    longLabels: ["首次使用", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "当前"],
    expanded: {
      sleep: false,
      breath: false,
      heart: false,
      sound: false
    },
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
    structureSeries: [
      { deep: 2.1, rem: 1.8, light: 3.6 },
      { deep: 2.3, rem: 1.9, light: 3.8 },
      { deep: 2.0, rem: 1.7, light: 4.1 },
      { deep: 2.5, rem: 2.0, light: 3.7 },
      { deep: 2.8, rem: 1.9, light: 3.7 },
      { deep: 2.6, rem: 1.8, light: 3.7 },
      { deep: 2.7, rem: 2.1, light: 3.5 }
    ],
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
    hrvSeries: {
      "7": [45, 48, 46, 50, 47, 52, 49],
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

  onReady() {
    this.resetWindowByPeriod();
    this.renderAll();
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
      this.renderAll();
    });
  },

  panLeft() {
    const total = this.getPeriodLength();
    if (total <= this.data.windowSize) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 3));
    const next = Math.max(0, this.data.windowStart - step);
    if (next === this.data.windowStart) return;
    this.setData({ windowStart: next }, () => {
      this.updateVisibleLabels();
      this.renderAll();
    });
  },

  panRight() {
    const total = this.getPeriodLength();
    if (total <= this.data.windowSize) return;
    const step = Math.max(1, Math.floor(this.data.windowSize / 3));
    const maxStart = Math.max(0, total - this.data.windowSize);
    const next = Math.min(maxStart, this.data.windowStart + step);
    if (next === this.data.windowStart) return;
    this.setData({ windowStart: next }, () => {
      this.updateVisibleLabels();
      this.renderAll();
    });
  },

  zoomIn() {
    const total = this.getPeriodLength();
    const minSize = Math.min(7, total);
    if (this.data.windowSize <= minSize) return;
    const nextSize = Math.max(minSize, this.data.windowSize - 2);
    const center = this.data.windowStart + Math.floor(this.data.windowSize / 2);
    let nextStart = center - Math.floor(nextSize / 2);
    const maxStart = Math.max(0, total - nextSize);
    nextStart = Math.max(0, Math.min(maxStart, nextStart));
    this.setData({ windowSize: nextSize, windowStart: nextStart }, () => {
      this.updateVisibleLabels();
      this.renderAll();
    });
  },

  zoomOut() {
    const total = this.getPeriodLength();
    if (this.data.windowSize >= total) return;
    const nextSize = Math.min(total, this.data.windowSize + 2);
    const center = this.data.windowStart + Math.floor(this.data.windowSize / 2);
    let nextStart = center - Math.floor(nextSize / 2);
    const maxStart = Math.max(0, total - nextSize);
    nextStart = Math.max(0, Math.min(maxStart, nextStart));
    this.setData({ windowSize: nextSize, windowStart: nextStart }, () => {
      this.updateVisibleLabels();
      this.renderAll();
    });
  },

  getPeriodLength() {
    return this.data.durationSeries[this.data.period].length;
  },

  resetWindowByPeriod() {
    const total = this.getPeriodLength();
    const size = Math.min(7, total);
    const start = Math.max(0, total - size);
    this.setData({ windowSize: size, windowStart: start });
    this.updateVisibleLabels();
  },

  updateVisibleLabels() {
    const total = this.getPeriodLength();
    const start = this.data.windowStart;
    const size = this.data.windowSize;
    let labels = [];
    if (total <= 7) {
      labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"].slice(0, size);
    } else {
      labels = Array.from({ length: size }).map((_, i) => `D${start + i + 1}`);
    }
    this.setData({ visibleLabels: labels });
  },

  getVisibleSeries(map) {
    const all = map[this.data.period];
    const start = this.data.windowStart;
    return all.slice(start, start + this.data.windowSize);
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

  // 通用折线绘制方法
  drawLine(selector, data, yMin, yMax, ref, color, fill, refLabel, isWarning = false) {
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

        const toY = (v) => height - ((v - yMin) / (yMax - yMin)) * height * 0.78 - height * 0.11;
        const refY = toY(ref);

        // 健康参考线/警戒线
        ctx.strokeStyle = isWarning ? "#ffcdd2" : "#d8e7e2";
        ctx.lineWidth = 1.5;
        ctx.setLineDash(isWarning ? [3, 3] : [5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, refY);
        ctx.lineTo(width - 80, refY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 参考线标签
        ctx.fillStyle = isWarning ? "#e57373" : "#7da89b";
        ctx.font = "18rpx sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(refLabel || (isWarning ? `健康警戒线(${ref})` : `健康参考线(${ref})`), width - 78, refY + 4);

        // Y轴刻度
        ctx.fillStyle = "#8aa39c";
        ctx.textAlign = "right";
        [yMax, ref, yMin].forEach((v) => {
          const y = toY(v);
          ctx.fillText(String(v), 30, y + 4);
        });

        if (fill) {
          ctx.beginPath();
          data.forEach((v, i) => {
            const x = 40 + (i / (data.length - 1)) * (width - 50);
            const y = toY(v);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.lineTo(width - 10, height - 12);
          ctx.lineTo(40, height - 12);
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        data.forEach((v, i) => {
          const x = 40 + (i / (data.length - 1)) * (width - 50);
          const y = toY(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // 数据点
        ctx.fillStyle = color;
        data.forEach((v, i) => {
          const x = 40 + (i / (data.length - 1)) * (width - 50);
          const y = toY(v);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });
  },

  // 睡眠趋势图表
  drawDurationTrend() {
    this.drawLine(
      "#durationChart",
      this.getVisibleSeries(this.data.durationSeries),
      6, 10, 7,
      "#26A69A",
      "rgba(38,166,154,0.12)",
      "健康参考线(7-9h)"
    );
  },

  drawEfficiencyTrend() {
    this.drawLine(
      "#efficiencyChart",
      this.getVisibleSeries(this.data.efficiencySeries),
      70, 100, 80,
      "#4f9fd2",
      null,
      "健康参考线(80%)"
    );
  },

  drawPrepTrend() {
    this.drawLine(
      "#prepChart",
      this.getVisibleSeries(this.data.prepSeries),
      0, 50, 20,
      "#f2a65b",
      null,
      "健康参考线(20min)"
    );
  },

  drawDeepTrend() {
    this.drawLine(
      "#deepChart",
      this.getVisibleSeries(this.data.deepSeries),
      10, 30, 20,
      "#5e87cf",
      null,
      "健康参考线(15%)"
    );
  },

  // 呼吸健康图表
  drawBreathRateTrend() {
    this.drawLine(
      "#breathRateChart",
      this.getVisibleSeries(this.data.breathRateSeries),
      0, 25, 15,
      "#26A69A",
      null,
      "健康参考线(12-20次/分)"
    );
  },

  drawAhiTrend() {
    this.drawLine(
      "#ahiChart",
      this.getVisibleSeries(this.data.ahiSeries),
      0, 10, 5,
      "#ef5350",
      null,
      "健康警戒线(5次/小时)",
      true
    );
  },

  drawApneaTrend() {
    this.drawLine(
      "#apneaChart",
      this.getVisibleSeries(this.data.apneaSeries),
      0, 30, 10,
      "#ef5350",
      null,
      "健康警戒线(10秒)",
      true
    );
  },

  // 心肺健康图表
  drawHeartRateTrend() {
    this.drawLine(
      "#heartRateChart",
      this.getVisibleSeries(this.data.heartRateSeries),
      40, 100, 60,
      "#ec407a",
      null,
      "健康参考线(45-70bpm)"
    );
  },

  drawHrvTrend() {
    this.drawLine(
      "#hrvChart",
      this.getVisibleSeries(this.data.hrvSeries),
      0, 150, 100,
      "#ab47bc",
      null,
      "健康参考线(30-100)"
    );
  },

  drawHeartIndexTrend() {
    this.drawLine(
      "#heartIndexChart",
      this.getVisibleSeries(this.data.heartIndexSeries),
      0, 100, 80,
      "#7e57c2",
      null,
      "健康参考线(80分)"
    );
  },

  // 睡眠声音图表
  drawNoiseTrend() {
    this.drawLine(
      "#noiseChart",
      this.getVisibleSeries(this.data.noiseSeries),
      0, 60, 35,
      "#ffa726",
      null,
      "健康参考线(35分贝)"
    );
  },

  drawSnoreTrend() {
    this.drawLine(
      "#snoreChart",
      this.getVisibleSeries(this.data.snoreSeries),
      0, 20, 5,
      "#ff7043",
      null,
      "健康警戒线(5次)"
    );
  },

  drawNoiseImpactTrend() {
    this.drawLine(
      "#noiseImpactChart",
      this.getVisibleSeries(this.data.noiseImpactSeries),
      0, 50, 15,
      "#8d6e63",
      null,
      "健康警戒线(15%)"
    );
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

        const days = this.data.windowSize;
        const barWidth = (width - 60) / days * 0.7;
        const spacing = (width - 60) / days;
        const leftPad = 50;

        // 垂直时间轴标签 (08:00 -> 00:00 -> 22:00)
        ctx.fillStyle = "#7a9a92";
        ctx.font = "18rpx sans-serif";
        ctx.textAlign = "right";
        const timeLabels = ["08:00", "00:00", "22:00"];
        const timePositions = [0.15, 0.5, 0.75];
        timeLabels.forEach((t, i) => {
          const y = 20 + timePositions[i] * (height - 40);
          ctx.fillText(t, leftPad - 8, y + 4);
          // 微弱网格线
          ctx.strokeStyle = "#e8f0ed";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(leftPad, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        });

        // 水平分隔线
        ctx.strokeStyle = "#d0e0dc";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftPad, height - 10);
        ctx.lineTo(width, height - 10);
        ctx.stroke();

        // 健康早起窗口 (07:00-08:00) 参考区域
        const wakeY = height * 0.12;
        ctx.fillStyle = "rgba(38, 166, 154, 0.08)";
        ctx.fillRect(leftPad, wakeY - 10, width - leftPad, 20);
        ctx.fillStyle = "#5c8d82";
        ctx.font = "18rpx sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("──────── 健康早起窗口 07:00-08:00 ────────", leftPad + (width - leftPad) / 2, wakeY + 4);

        // 健康早睡窗口 (22:30-23:30) 参考区域
        const sleepY = height * 0.72;
        ctx.fillStyle = "rgba(38, 166, 154, 0.08)";
        ctx.fillRect(leftPad, sleepY - 10, width - leftPad, 20);
        ctx.fillStyle = "#5c8d82";
        ctx.fillText("──────── 健康早睡窗口 22:30-23:30 ────────", leftPad + (width - leftPad) / 2, sleepY + 4);

        // K线柱体 (睡眠结构)
        for (let i = 0; i < days; i += 1) {
          const day = this.data.structureSeries[i % this.data.structureSeries.length];
          const x = leftPad + i * spacing + (spacing - barWidth) / 2;
          const maxBarH = height * 0.5;
          const scale = maxBarH / 10;

          let currentY = height - 25;

          // 浅睡 (底部) - 浅青色
          const lightH = day.light * scale;
          ctx.fillStyle = "#b2dfdb";
          ctx.fillRect(x, currentY - lightH, barWidth, lightH);
          currentY -= lightH;

          // REM - 蓝色
          const remH = day.rem * scale;
          ctx.fillStyle = "#4fc3f7";
          ctx.fillRect(x, currentY - remH, barWidth, remH);
          currentY -= remH;

          // 深睡 (顶部) - 深青色
          const deepH = day.deep * scale;
          ctx.fillStyle = "#26a69a";
          ctx.fillRect(x, currentY - deepH, barWidth, deepH);

          // 顶点标记
          ctx.fillStyle = "#f2b261";
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, currentY - deepH - 3, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
  }
});