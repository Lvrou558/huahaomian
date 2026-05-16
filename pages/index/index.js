Page({
  data: {
    expanded: false,
    detailExpanded: {
      heartRate: false,
      breathing: false,
      noise: false
    },
    deviceConnected: true,
    dataSynced: true,
    summary: {
      score: 87,
      efficiency: 92,
      duration: "8h36m",
      qualityLabel: "睡得不错",
      statusText: "比近7天平均提升 6 分，深睡时长也在改善。"
    },
    metrics: [
      { key: "sleep", label: "睡眠时长", value: "8h36m", subValue: "总长", trend: "+32分钟", trendUp: true },
      { key: "deep", label: "深睡时长", value: "3.6h", subValue: "占比42%", trend: "+22分钟", trendUp: true },
      { key: "efficiency", label: "睡眠效率", value: "92%", subValue: "优秀", trend: "+4%", trendUp: true },
      { key: "heartRate", label: "睡眠心率", value: "56", subValue: "bpm", trend: "-3bpm", trendUp: true }
    ],
    stages: [
      { name: "清醒", duration: "45分钟", color: "#FFB74D", percent: 9 },
      { name: "REM", duration: "1h52m", color: "#81D4FA", percent: 22 },
      { name: "浅睡", duration: "3h08m", color: "#4DD0E1", percent: 36 },
      { name: "深睡", duration: "2h51m", color: "#26A69A", percent: 33 }
    ],
    heartRateData: [62, 58, 55, 54, 53, 52, 54, 56, 58, 60, 58, 56, 54, 53, 52, 51, 52, 54, 56, 58],
    breathingData: [14, 13, 12, 12, 11, 11, 12, 13, 14, 15, 14, 13, 12, 11, 11, 10, 11, 12, 13, 14],
    tips: [
      "你最近的深睡连续性在改善，生物钟越来越稳定了。",
      "建议今晚保持23:00前入睡，深睡占比通常能提升5-8%。"
    ]
  },

  onReady() {
    this.drawSleepWaveform();
    this.drawHeartRateChart();
    this.drawBreathingChart();
  },

  toggleExpand() {
    this.setData({
      expanded: !this.data.expanded
    });
  },

  toggleDetail(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`detailExpanded.${key}`]: !this.data.detailExpanded[key]
    }, () => {
      if (key === 'heartRate' && this.data.detailExpanded.heartRate) {
        setTimeout(() => this.drawHeartRateChart(), 100);
      }
      if (key === 'breathing' && this.data.detailExpanded.breathing) {
        setTimeout(() => this.drawBreathingChart(), 100);
      }
    });
  },

  drawSleepWaveform() {
    const query = wx.createSelectorQuery();
    query.select('#sleepWaveform')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const width = res[0].width;
        const height = res[0].height;

        ctx.clearRect(0, 0, width, height);

        const stages = [
          { start: 0, end: 0.05, color: '#FFB74D', name: '清醒' },
          { start: 0.05, end: 0.15, color: '#81D4FA', name: 'REM' },
          { start: 0.15, end: 0.40, color: '#4DD0E1', name: '浅睡' },
          { start: 0.40, end: 0.65, color: '#26A69A', name: '深睡' },
          { start: 0.65, end: 0.75, color: '#4DD0E1', name: '浅睡' },
          { start: 0.75, end: 0.85, color: '#26A69A', name: '深睡' },
          { start: 0.85, end: 0.95, color: '#4DD0E1', name: '浅睡' },
          { start: 0.95, end: 1, color: '#FFB74D', name: '清醒' }
        ];

        stages.forEach(stage => {
          ctx.fillStyle = stage.color;
          ctx.fillRect(
            stage.start * width,
            height * 0.15,
            (stage.end - stage.start) * width,
            height * 0.6
          );
        });

        ctx.strokeStyle = '#4D92AD';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= width; i += 2) {
          const x = i;
          const y = height * 0.5 + Math.sin(i * 0.02) * height * 0.15 * (1 + Math.sin(i * 0.005));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#E8F5E9';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.35);
        ctx.lineTo(width, height * 0.35);
        ctx.moveTo(0, height * 0.65);
        ctx.lineTo(width, height * 0.65);
        ctx.stroke();
        ctx.setLineDash([]);
      });
  },

  drawHeartRateChart() {
    const query = wx.createSelectorQuery();
    query.select('#heartRateChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const width = res[0].width;
        const height = res[0].height;
        const data = this.data.heartRateData;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#E57373';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((val - 45) / 20) * height * 0.8 - height * 0.1;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.strokeStyle = '#E0E0E0';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.3);
        ctx.lineTo(width, height * 0.3);
        ctx.stroke();
        ctx.setLineDash([]);
      });
  },

  drawBreathingChart() {
    const query = wx.createSelectorQuery();
    query.select('#breathingChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const width = res[0].width;
        const height = res[0].height;
        const data = this.data.breathingData;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#4DB6AC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((val - 8) / 8) * height * 0.8 - height * 0.1;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.strokeStyle = '#E0E0E0';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        ctx.lineTo(width, height * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
      });
  }
});
