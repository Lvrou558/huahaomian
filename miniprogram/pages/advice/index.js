Page({
  data: {
    overviewRisk: {
      level: "中度",
      summary: "入睡偏慢 + 夜间中断较多"
    },
    riskGroups: [
      {
        id: "mild",
        levelKey: "mild",
        level: "轻度",
        triggerReason: "作息波动存在，但整体睡眠结构仍在可接受区间。",
        factors: ["上床时间", "闹钟时间"],
        source: { module: "sleep", metric: "duration", label: "睡眠时长趋势" },
        expanded: false
      },
      {
        id: "moderate",
        levelKey: "moderate",
        level: "中度",
        triggerReason: "入睡准备时长偏高，且呼吸暂停时长超过观察阈值。",
        factors: ["手机", "兴奋", "进食"],
        source: { module: "breath", metric: "apnea", label: "最长呼吸暂停时长" },
        expanded: true
      },
      {
        id: "severe",
        levelKey: "severe",
        level: "重度",
        triggerReason: "当前无重度风险触发，建议持续观察环境干扰波动。",
        factors: ["声音", "光", "温度"],
        source: { module: "sound", metric: "noiseImpact", label: "噪音睡眠影响占比" },
        expanded: false
      }
    ],
    prioritizedActions: [],
    upgradeReminder: "若连续7天无改善，建议进一步评估。",
    heartHealthIntro:
      "基于您本次夜间心脏监测数据，整体表现优秀，以下为轻微可关注点。",
    heartRisks: [
      {
        title: "夜间心率小幅波动",
        detail:
          "偶发短暂升高（峰值约 69 次/分），仍在常见参考范围（约 40–70 次/分）内，或与翻身、浅睡、梦境相关。"
      },
      {
        title: "最低心率偏低但可接受",
        detail:
          "夜间最低约 55 次/分，属成年人夜间偏低但合理水平，建议结合长期趋势观察是否持续下探。"
      },
      {
        title: "单日难以定基线",
        detail:
          "单次夜间数据不足以代表心脏健康基线，建议连续监测 7 天以上再对照趋势判断。"
      }
    ],
    heartAdviceBlocks: [
      {
        heading: "1. 维持节律与运动习惯",
        bullets: [
          "固定入睡与起床时间，每日作息波动尽量控制在 30 分钟内。",
          "保持每周约 150 分钟中等强度有氧，睡前 2 小时内避免剧烈运动。"
        ]
      },
      {
        heading: "2. 稳夜间心率",
        bullets: [
          "睡前 5–10 分钟腹式呼吸（吸 4 秒—屏 4 秒—呼 6 秒），帮助降低交感神经兴奋。",
          "卧室温度约 18–22℃、湿度约 50–60%，减少因冷热不适引起的心率起伏。"
        ]
      },
      {
        heading: "3. 长期监测与就医",
        bullets: [
          "连续记录夜间心率与 HRV，按月查看心脏健康指数趋势。",
          "若夜间心率持续低于 40 或高于 90 次/分超过约 15 分钟且伴头晕、心慌，次日及时就医；胸闷、胸痛、呼吸困难等请立即拨打 120。"
        ]
      }
    ]
  },

  onLoad() {
    this.refreshPrioritizedActions();
  },

  getLevelWeight(level) {
    const map = { 轻度: 1, 中度: 2, 重度: 3 };
    return map[level] || 1;
  },

  getAdvicePool() {
    return [
      { id: "sleep-phone", text: "睡前30分钟停止刷手机，避免蓝光与信息刺激。", tags: ["手机", "兴奋"] },
      { id: "sleep-time", text: "今晚上床时间固定在23:15前后，不再临时后移。", tags: ["上床时间"] },
      { id: "wake-alarm", text: "闹钟固定且不反复贪睡，起床时间控制在7:00-7:30。", tags: ["闹钟时间"] },
      { id: "meal-gap", text: "晚餐与入睡至少间隔3小时，减少胃肠负担。", tags: ["进食"] },
      { id: "water-limit", text: "睡前1小时减少集中饮水，避免夜醒。", tags: ["饮水"] },
      { id: "noise-control", text: "睡前做一次降噪检查：关窗、关闭提示音、必要时耳塞。", tags: ["声音"] },
      { id: "light-control", text: "拉好遮光帘，关闭强光源，仅保留低亮度夜灯。", tags: ["光"] },
      { id: "temp-control", text: "卧室温度维持在24-26°C，体感微凉更利于入睡。", tags: ["温度"] }
    ];
  },

  refreshPrioritizedActions() {
    const factorScore = {};
    (this.data.riskGroups || []).forEach((group) => {
      const weight = this.getLevelWeight(group.level);
      (group.factors || []).forEach((factor) => {
        factorScore[factor] = (factorScore[factor] || 0) + weight;
      });
    });

    const ranked = this.getAdvicePool()
      .map((advice) => {
        const score = (advice.tags || []).reduce((acc, tag) => acc + (factorScore[tag] || 0), 0);
        return { ...advice, score, checked: false };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    this.setData({
      prioritizedActions: ranked.slice(0, 2)
    });
  },

  toggleRiskGroup(e) {
    const id = e.currentTarget.dataset.id;
    const next = (this.data.riskGroups || []).map((group) =>
      group.id === id ? { ...group, expanded: !group.expanded } : group
    );
    this.setData({ riskGroups: next });
  },

  toggleAdviceCheck(e) {
    const id = e.currentTarget.dataset.id;
    const next = (this.data.prioritizedActions || []).map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    this.setData({ prioritizedActions: next });
  },

  onTapRiskEvidence(e) {
    const module = e.currentTarget.dataset.module;
    const metric = e.currentTarget.dataset.metric;
    if (!module || !metric) return;
    wx.setStorageSync("longterm-focus-target", { module, metric, ts: Date.now() });
    wx.switchTab({ url: "/pages/longterm/index" });
  }
});