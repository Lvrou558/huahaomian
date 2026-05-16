Page({
  data: {
    showAdvanced: false,
    showBreathing: false,
    showHeart: false,
    monitorEnabled: false,
    summary: {
      bodyRecovery: 92,
      mindRecovery: 90,
      score: 87,
      duration: "8h36m"
    },
    cycleInfo: "整夜4次完整睡眠循环，深睡峰值在03:00-04:00，给身体充饱了电",
    breathingCards: [
      { label: "平均呼吸频率", value: "13次/分", level: "正常" },
      { label: "AHI暂停指数", value: "1.6次/小时", level: "优秀" },
      { label: "最长暂停时长", value: "13秒", level: "略超参考值" },
      { label: "总暂停次数", value: "3次", level: "正常" }
    ],
    heartCards: [
      { label: "心脏休息状态", value: "超充分", level: "给心脏放了假" },
      { label: "身体放松程度", value: "完全放松", level: "无多余焦虑" },
      { label: "心率平稳度", value: "全程稳稳的", level: "无异常波动" },
      { label: "整体健康评级", value: "优秀", level: "92分" }
    ],
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

  onReady() {
    this.drawSleepCycle();
    this.drawSimpleBars("#breathingTrend", "#46a38f");
    this.drawSimpleBars("#heartTrend", "#cf6161");
    this.drawSoundTrend();
  },

  toggleAdvanced() {
    this.setData(
      { showAdvanced: !this.data.showAdvanced },
      () => {
        if (this.data.showAdvanced) {
          this.drawSimpleBars("#breathingTrend", "#46a38f");
          this.drawSimpleBars("#heartTrend", "#cf6161");
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
          this.drawSimpleBars("#breathingTrend", "#46a38f");
        }
      }
    );
  },

  toggleHeart() {
    this.setData(
      { showHeart: !this.data.showHeart },
      () => {
        if (this.data.showHeart) {
          this.drawSimpleBars("#heartTrend", "#cf6161");
        }
      }
    );
  },

  enableMonitor() {
    this.setData({ monitorEnabled: true });
    wx.showToast({ title: "已开启", icon: "success" });
  },

  managePermission() {
    wx.showToast({ title: "请在系统设置中管理权限", icon: "none" });
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

        ctx.strokeStyle = "#56a3be";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= width; i += 2) {
          const y = height * 0.55 + Math.sin(i * 0.035) * 26 + Math.sin(i * 0.01) * 8;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();

        ctx.strokeStyle = "#d5e8e3";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        [0.2, 0.5, 0.78].forEach((r) => {
          ctx.beginPath();
          ctx.moveTo(0, height * r);
          ctx.lineTo(width, height * r);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      });
  },

  drawSimpleBars(selector, color) {
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

        const bars = 48;
        const bw = width / bars;
        for (let i = 0; i < bars; i += 1) {
          const h = 16 + Math.abs(Math.sin(i * 0.35)) * 24;
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
  }
});