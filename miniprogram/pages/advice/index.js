Page({
  data: {
    // 今日打卡进度
    progress: {
      done: 2,
      total: 5,
      hint: "数据关联分析进行中"
    },

    // 风险提示（顺序：心脏 > 呼吸 > 睡眠）
    riskCards: [
      {
        id: "hrv-low",
        severityKey: "warn",
        severityIcon: "🟡",
        title: "HRV 持续偏低（可改善）",
        dataItems: [
          { label: "你的 14 天均值", value: "33 ms" },
          { label: "健康参考", value: ">50 ms" },
          { label: "同龄人均值", value: "42 ms" },
          { label: "趋势", value: "近 7 天有 5 天进入亚健康区间" }
        ],
        longTermIntro: "HRV 反映自主神经调节能力。若连续 3 个月未改善，研究显示可能关联：",
        longTermBullets: [
          "心血管疾病风险升高（冠心病、心律失常）",
          "慢性疲劳与免疫力下降",
          "焦虑、抑郁等情绪问题风险增加"
        ],
        source: "American Heart Association",
        linkTarget: { module: "heart", metric: "hrv", label: "HRV 心率变异性" },
        expanded: true
      },
      {
        id: "apnea-borderline",
        severityKey: "warn",
        severityIcon: "🟡",
        title: "呼吸暂停时长偶有超标（轻度）",
        dataItems: [
          { label: "本周最长暂停", value: "13 秒" },
          { label: "健康阈值", value: "<10 秒" },
          { label: "AHI 指数", value: "1.0 次/小时（健康）" },
          { label: "趋势", value: "近 7 天 2 天峰值超过 10 秒" }
        ],
        longTermIntro: "气道阻塞偶发但 AHI 仍正常。若发展为中重度睡眠呼吸暂停，长期可能：",
        longTermBullets: [
          "夜间血氧反复下降，加重心脏负担",
          "次日嗜睡、注意力下降",
          "增加高血压、卒中风险"
        ],
        source: "AHI 国际诊断标准 (AASM)",
        linkTarget: { module: "breath", metric: "apnea", label: "最长呼吸暂停时长" },
        expanded: false
      },
      {
        id: "sleep-onset",
        severityKey: "info",
        severityIcon: "🔵",
        title: "入睡耗时偏长（轻度）",
        dataItems: [
          { label: "你的近 7 天均值", value: "31 min" },
          { label: "健康参考", value: "<20 min" },
          { label: "同龄人均值", value: "18 min" },
          { label: "趋势", value: "近 7 天有 3 天 >40 min" }
        ],
        longTermIntro: "入睡潜伏期长会压缩有效睡眠时间。长期未改善可能：",
        longTermBullets: [
          "总睡眠时长不足，影响身体修复",
          "次日疲劳、情绪波动加剧",
          "增加慢性失眠风险"
        ],
        source: "National Sleep Foundation",
        linkTarget: { module: "sleep", metric: "prep", label: "入睡准备时长" },
        expanded: false
      }
    ],

    // 今日打卡（日间 3 条 + 夜间 2 条）
    checkInGroups: [
      {
        key: "day",
        icon: "🌞",
        title: "日间",
        items: [
          {
            id: "walk-after-meal",
            emoji: "🚶",
            title: "饭后散步 10 分钟",
            sub: "促进代谢，降低静息心率",
            checked: true,
            loggedNote: "已记录·将关联今晚至次日心率数据",
            riskRelation: "针对夜间静息心率偏高",
            expectedBenefit: "执行 7 天后静息心率平均降低 3-5 bpm（基于人群研究）"
          },
          {
            id: "moderate-exercise",
            emoji: "🏃",
            title: "中等强度运动 20 分钟",
            sub: "提升心肺适应性，增加 HRV",
            checked: true,
            loggedNote: "已记录·将关联今晚至次日心率数据",
            riskRelation: "针对 HRV 持续偏低",
            expectedBenefit: "执行 7 天后 HRV 平均提升 8-12 ms（基于你的打卡历史）"
          },
          {
            id: "no-caffeine",
            emoji: "☕",
            title: "下午 2 点后不喝咖啡 / 浓茶",
            sub: "避免咖啡因干扰夜间心率",
            checked: false,
            loggedNote: "",
            riskRelation: "针对入睡耗时偏长",
            expectedBenefit: "戒断午后咖啡因 5 天后入睡时间平均缩短 8-10 min"
          }
        ]
      },
      {
        key: "night",
        icon: "🌙",
        title: "夜间",
        items: [
          {
            id: "diaphragm-breath",
            emoji: "🌬️",
            title: "睡前 5 分钟腹式呼吸",
            sub: "吸 4 秒·屏 4 秒·呼 6 秒",
            checked: false,
            loggedNote: "",
            riskRelation: "针对 HRV 偏低 + 入睡耗时偏长",
            expectedBenefit: "执行 7 天后 HRV 平均提升 10-15 ms（基于通用研究）"
          },
          {
            id: "early-sleep",
            emoji: "😴",
            title: "23:00 前入睡",
            sub: "规律作息，稳定夜间基础心率",
            checked: false,
            loggedNote: "",
            riskRelation: "针对夜间心率波动",
            expectedBenefit: "连续 7 天 23 点前入睡，次日心率均值平均低 4 bpm"
          }
        ]
      }
    ]
  },

  onLoad() {
    this.refreshProgress();
  },

  refreshProgress() {
    let done = 0;
    let total = 0;
    (this.data.checkInGroups || []).forEach((g) => {
      (g.items || []).forEach((it) => {
        total += 1;
        if (it.checked) done += 1;
      });
    });
    this.setData({
      "progress.done": done,
      "progress.total": total
    });
  },

  toggleRiskCard(e) {
    const id = e.currentTarget.dataset.id;
    const next = (this.data.riskCards || []).map((card) =>
      card.id === id ? { ...card, expanded: !card.expanded } : card
    );
    this.setData({ riskCards: next });
  },

  toggleCheckIn(e) {
    const { gkey, id } = e.currentTarget.dataset;
    const next = (this.data.checkInGroups || []).map((g) => {
      if (g.key !== gkey) return g;
      return {
        ...g,
        items: g.items.map((it) =>
          it.id === id ? { ...it, checked: !it.checked } : it
        )
      };
    });
    this.setData({ checkInGroups: next }, () => this.refreshProgress());
  },

  onTapRiskEvidence(e) {
    const module = e.currentTarget.dataset.module;
    const metric = e.currentTarget.dataset.metric;
    if (!module || !metric) return;
    wx.setStorageSync("longterm-focus-target", { module, metric, ts: Date.now() });
    wx.switchTab({ url: "/pages/longterm/index" });
  }
});
