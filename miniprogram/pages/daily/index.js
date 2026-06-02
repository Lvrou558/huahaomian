Page({
  data: {
    isMember: false,  // 会员状态（onShow 同步自 globalData.member）
    paywall: { visible: false, icon: '', title: '', sub: '', features: [] },
    // 日期相关 — weekDays 现在动态生成，每个含 short(中文)/date(日号)/dateObj
    weekDays: [
      { short: '日', date: '', dateStr: '' },
      { short: '一', date: '', dateStr: '' },
      { short: '二', date: '', dateStr: '' },
      { short: '三', date: '', dateStr: '' },
      { short: '四', date: '', dateStr: '' },
      { short: '五', date: '', dateStr: '' },
      { short: '六', date: '', dateStr: '' }
    ],
    selectedDay: 0,
    currentWeekDay: '日',
    currentDateRange: '',
    currentDate: '',
    showCalendarModal: false,
    calendarYearMonth: '',
    calendarYear: 2026,
    calendarMonth: 4, // 0-indexed
    calendarDays: [],
    
    showAdvanced: false,
    showBreathing: false,
    showHeart: false,  // "心脏具体数据"板块（折线图 + ECG），默认折叠
    showMovement: false,
    showSleepHealth: false,
    showSleepPhase: false,
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
    // 恢复程度分数 — 由 buildSleepCycles + computeRecoveryScores 动态计算
    recoveryScores: {
      body: { score: 0, label: '', status: '' },
      mind: { score: 0, label: '', status: '' }
    },
    // 各板块副标题文案（动态根据 7 项核心指标生成）
    sectionSummaries: {
      sleep: '',
      heart: '',
      breath: '',
      sound: ''
    },
    // 7 项核心指标和健康阈值（用于规则化 headline 判定）
    coreHealthMetrics: {
      duration: { value: 8.6, healthy: [7, 9], label: '睡眠时长' },
      efficiency: { value: 87, healthy: [85, 100], label: '睡眠效率' },
      deepRatio: { value: 18, healthy: [15, 25], label: '深睡比例' },
      hrAvg: { value: 65, healthy: [45, 70], label: '夜间心率' },
      hrv: { value: 33, healthy: [50, 200], label: 'HRV' },
      ahi: { value: 1.0, healthy: [0, 5], label: 'AHI' },
      apneaMax: { value: 17, healthy: [0, 10], label: '最长呼吸暂停' }
    },
    // 核心睡眠数据（昨晚 5 项事实，新顺序）
    coreSleepMetrics: [
      { label: '上床时间', value: '23:15', unit: '' },
      { label: '入睡时长', value: '28',    unit: 'min' },
      { label: '入睡时间', value: '23:43', unit: '' },
      { label: '起床时间', value: '07:51', unit: '' },
      { label: '睡眠时长', value: '7h33m', unit: '' }
    ],
    // 今晚医学建议（2 项）— 基于成人 7.5h 睡眠、23:00 前入睡推荐
    sleepSuggestions: [
      { icon: '🌙', label: '建议今晚入睡', value: '22:50', sub: '比昨晚提前 25 分钟' },
      { icon: '☀️', label: '建议明早起床', value: '06:30', sub: '保证 7h40m 优质睡眠' }
    ],
    // 今日建议打卡（3 条最相关·当日可执行）
    // 今日心脏打卡 3 项 — 高度关联心脏健康、用户当日可执行
    todayCheckIns: [
      {
        id: 'after-meal-walk',
        emoji: '🚶',
        title: '饭后散步 15 分钟',
        sub: '降低静息心率（针对夜间平均心率偏高）',
        checked: false
      },
      {
        id: 'diaphragm-breath',
        emoji: '🌬️',
        title: '睡前 5 分钟腹式呼吸',
        sub: '吸 4 秒·屏 4 秒·呼 6 秒（直接提升 HRV）',
        checked: false
      },
      {
        id: 'no-afternoon-caffeine',
        emoji: '☕',
        title: '下午 3 点后不喝咖啡 / 浓茶',
        sub: '稳定夜间心率，避免自主神经过度活跃',
        checked: false
      }
    ],
    // 睡眠评价（保留兼容旧代码）
    sleepEvaluation: '昨晚睡眠超稳，深睡充足，心肺全程平稳。',
    sleepWins: [],
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
    // 整夜分期占比：基于 437min 总时长（35+91+230+81）
    phaseLegend: [
      { key: "awake", label: "清醒时间", duration: "0小时35分钟", pct: "8.0%", color: "#cfd9e8" },
      { key: "dream", label: "梦",       duration: "1小时31分钟", pct: "20.8%", color: "#b15dff" },
      { key: "light", label: "浅睡眠",   duration: "3小时50分钟", pct: "52.6%", color: "#71bfd1" },
      { key: "deep",  label: "深度睡眠", duration: "1小时21分钟", pct: "18.5%", color: "#00a6a0" }
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
    breathAvgRate: 16,
    breathRateRangeText: "12-19",
    breathHealthValue: 82,
    breathHealthLabel: "优秀",
    breathApneaStats: {
      count: 5,
      longest: 17,
      average: 12
    },
    breathTimeTicks: ["01:00", "03:00", "05:00", "07:00", "09:00"],
    heartCards: [
      { label: "心率范围", value: "65-72次/分", level: "夜间平稳" },
      { label: "HRV值", value: "33", level: "恢复中等偏好" },
      { label: "平均心率", value: "69bpm", level: "参考45-70bpm" },
      { label: "rMSSD", value: "892ms", level: "参考600-1200ms" }
    ],
    breathingSeries: [
      17.0, 17.2, 16.8, 17.4, 18.0, 17.2, 16.4, 16.8, 17.6, 18.2, 17.4, 16.6,
      15.8, 14.6, 15.4, 16.2, 17.0, 16.4, 15.8, 15.4, 16.0, 16.6, 16.2, 15.6,
      15.0, 14.4, 13.8, 14.4, 15.6, 17.0, 16.4, 15.8, 16.2, 16.8, 17.4, 16.2,
      14.6, 13.0, 11.8, 12.6, 14.4, 16.2, 17.8, 19.0, 18.4, 17.0, 16.0, 15.4,
      14.8, 14.0, 14.6, 15.4, 16.0, 16.6, 16.2, 15.6, 15.0, 15.6, 16.4, 17.0,
      16.6, 16.0, 15.4, 14.8, 14.4, 15.0, 15.8, 17.0, 18.4, 19.0, 18.2, 17.0,
      16.4, 17.2, 18.6, 17.8, 16.4, 15.2, 15.8, 16.6, 17.0, 16.4, 15.6, 14.8,
      14.0, 13.2, 12.4, 11.8, 12.2, 13.4, 14.8, 15.6, 16.0, 15.2, 13.8, 12.4,
      11.8, 12.0, 11.6, 12.0
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

    // 心 + 肺疾病风险 9 个子项目（7 心脏 + 2 呼吸；纯疾病名；红 > 黄置顶；绿色折叠为 normalRisks 一卡）
    cardiacRisks: [
      // ① 房颤 — 急·慢 — 🟢
      {
        id: 'afib',
        category: '房颤风险评估',
        status: 'green',
        level: 'info',
        icon: '🟢',
        title: '房颤风险评估',
        acuteChronic: '急·慢',
        summary: '节律均匀、P 波清晰，未见房颤波形',
        diseaseTags: ['阵发性房颤', '持续性房颤', '永久性房颤', '心房扑动', '阵发性室上速', '缺血性脑卒中', '心源性栓塞', '左心耳血栓', '认知功能下降'],
        assessment: 'ECG 各导联 P 波清晰可辨，R-R 间期均匀（变异系数 <5%），夜间心率 55-69bpm 平稳无突发剧烈波动，未见房颤典型的"绝对不齐"模式。≥65 岁人群房颤患病率 5-10%，是头号心源性卒中病因（房颤患者卒中风险是常人 5 倍）。【急性发作触发因素】饮酒（尤其大量饮酒后24h内，即"假日心脏综合征"）、咖啡因/浓茶过量、强烈情绪应激、过度疲劳、感冒发热、电解质紊乱（低钾低镁）、甲亢；【预防突发】限酒（女性 <1 杯/日、男性 <2 杯/日）、保证 7 小时睡眠、控制基础病（高血压/糖尿病/睡眠呼吸暂停）、定期监测电解质，突发心悸/胸闷需立即停止活动并就医。',
        dataPoints: [
          { label: 'P 波', value: '清晰', ref: '正常存在', status: 'ok' },
          { label: 'R-R 间期变异系数', value: '<5%', ref: '正常 <12%', status: 'ok' },
          { label: '夜间心率波动', value: '平稳', ref: '无突发剧烈波动', status: 'ok' }
        ],
        suggestions: [
          '限酒：女性每日 <1 杯、男性 <2 杯（远离"假日心脏综合征"）',
          '保证 7 小时优质睡眠，避免过度疲劳',
          '出现突发心悸、胸闷、晕厥立即就医排查',
          '≥65 岁建议每年做一次 24h Holter 筛查'
        ],
        linkText: '查看心率长期趋势',
        linkTarget: { module: 'heart', metric: 'heartRate' },
        expanded: false
      },

      // ② 冠心病 — 急·慢 — 🟢
      {
        id: 'cad',
        category: '冠心病风险',
        status: 'green',
        level: 'info',
        icon: '🟢',
        title: '冠心病风险',
        acuteChronic: '急·慢',
        summary: 'ST 段平直、T 波直立，夜间心率正常回落',
        diseaseTags: ['稳定型心绞痛', '不稳定型心绞痛', '急性心肌梗死', '陈旧性心梗', '无症状心肌缺血', '变异型心绞痛', '冠状动脉痉挛', '心肌桥', 'X 综合征', '冠脉慢血流'],
        assessment: 'ECG ST 段平直无抬高/压低，T 波直立形态正常；夜间心率从入睡时 69bpm 平稳回落至 55bpm（回落幅度 20%），符合健康人应答规律，未见缺血型电信号。冠心病是中老年人头号死因。【慢性进展识别数据】持续 ST 段轻度改变、夜间心率回落 <10%（非杓型）、HRV 持续偏低、晨起心率突升均提示冠脉狭窄逐步加重，定期监测可早 6-12 个月发现；【急性事件触发因素】寒冷天气（清晨血压心率高峰）、剧烈运动（尤其突然用力）、情绪激动、暴饮暴食、感染发热、便秘用力；【预防突发】低盐低脂饮食、严格控制血压血脂血糖、每周 ≥150 分钟中等强度有氧、避免清晨剧烈活动、寒冷天气注意保暖，胸痛持续 >15 分钟必须拨打 120。',
        dataPoints: [
          { label: 'ST 段', value: '平直', ref: '无抬高/压低', status: 'ok' },
          { label: 'T 波形态', value: '直立', ref: '形态正常', status: 'ok' },
          { label: '夜间心率回落', value: '20%', ref: '正常 ≥10%（杓型）', status: 'ok' }
        ],
        suggestions: [
          '低盐低脂饮食 + 每周 ≥150 分钟中等强度有氧',
          '严格控制血压、血脂、血糖三高',
          '寒冷天气注意保暖，避免清晨剧烈活动',
          '出现持续胸痛 >15 分钟立即拨打 120',
          '≥45 岁建议每年体检包含心电图、血脂、颈动脉超声'
        ],
        linkText: '查看心动图长期趋势',
        linkTarget: { module: 'heart', metric: 'ecg' },
        expanded: false
      },

      // ③ 高血压性心脏病 — 慢 — 🟡（早期信号）
      {
        id: 'hypertensive-heart-disease',
        category: '高血压风险',
        status: 'yellow',
        level: 'warning',
        icon: '🟡',
        title: '高血压风险',
        acuteChronic: '慢',
        summary: '静息心率接近上限 + HRV 偏低，提示长期血压负荷',
        diseaseTags: ['原发性高血压', '继发性高血压', '高血压性心脏病', '左心室肥厚', '高血压性肾损害', '高血压脑病', '主动脉夹层', '高血压急症', '隐匿性高血压', '白大衣高血压'],
        assessment: '夜间静息心率 69bpm 接近正常上限（70bpm 边缘），HRV (SDNN) 33ms 显著低于健康参考 >50ms——两项信号组合提示交感神经长期处于优势状态，是高血压性心脏病的典型早期表现。中国 ≥18 岁高血压患病率达 27.5%，但知晓率仅 51%。【慢性早期识别数据】静息心率持续 >70bpm、夜间心率不下降（non-dipping，正常应回落 ≥10%）、HRV 显著降低、晨峰血压升高，长期未控将导致左心室代偿性肥厚，最终发展为心力衰竭；【提前干预方案】① 减盐至每日 <5g（约一啤酒瓶盖），② 规律有氧运动（快走 30 分钟/天，每周 5 天），③ 控制体重 BMI <24，④ 限酒戒烟，⑤ 家庭血压计每日早晚测量记录 7 天均值，目标 <130/80mmHg。',
        dataPoints: [
          { label: '静息心率', value: '69bpm', ref: '警戒 >70 持续', status: 'border' },
          { label: 'HRV (SDNN)', value: '33ms', ref: '正常 >50ms', status: 'low' },
          { label: '夜间心率回落', value: '20%', ref: '正常 ≥10%（杓型）', status: 'ok' },
          { label: '14天均值心率', value: '70bpm', ref: '健康 60-70bpm', status: 'border' }
        ],
        suggestions: [
          '减盐至每日 <5g（约一啤酒瓶盖）',
          '规律有氧运动：快走 30 分钟/天，每周 5 天',
          '控制体重 BMI <24，限酒戒烟',
          '家庭血压计每日早晚测量，目标 <130/80mmHg',
          '每年体检包含血脂、血糖、肾功能'
        ],
        linkText: '查看心率与 HRV 长期趋势',
        linkTarget: { module: 'heart', metric: 'heartRate' },
        expanded: false
      },

      // ④ 心力衰竭 — 慢（可急性失代偿）— 🟡
      {
        id: 'heart-failure',
        category: '心脏负荷评估',
        status: 'yellow',
        level: 'warning',
        icon: '🟡',
        title: '心脏负荷评估',
        acuteChronic: '慢',
        summary: '夜间负荷偏高 + HRV 偏低 + 睡眠片段化',
        diseaseTags: ['慢性心力衰竭', '射血分数保留型心衰 (HFpEF)', '射血分数降低型心衰 (HFrEF)', '舒张性心力衰竭', '收缩性心力衰竭', '左心衰竭', '右心衰竭', '全心衰竭', '急性心衰失代偿', '扩张型心肌病', '肥厚型心肌病'],
        assessment: '静息心率 69bpm 边缘 + HRV (SDNN) 33ms 偏低 + 夜间翻身 93 次（远超正常 <60）+ 深睡比例 18% 处于下限——多维度信号提示心脏整夜未能充分"降压休息"，长期可向心力衰竭进展。心衰是高血压、冠心病、糖尿病的共同终点，5 年生存率约 50%。【慢性识别数据】静息心率持续 >75bpm、HRV (SDNN) 持续 <50ms、夜间翻身 >80 次、深睡 <15%、夜间呼吸频率升高、AHI 升高——这些信号组合可提前 6-12 个月预警心衰；【提前干预方案】低盐 <5g/日 + 限液（夜间饮水 <300ml）+ 耐受范围内有氧（快走/游泳）+ 严格控制基础病；【急性失代偿触发因素】肺部感染（最常见，占 50%）、输液过快、随意停药、过度劳累、心律失常、高盐饮食/电解质紊乱；出现夜间呼吸困难需端坐呼吸、双下肢凹陷性水肿、3 天内体重突增 >2kg、运动耐量明显下降需立即就医。',
        dataPoints: [
          { label: '静息心率', value: '69bpm', ref: '警戒 >75bpm', status: 'border' },
          { label: 'HRV (SDNN)', value: '33ms', ref: '正常 >50ms', status: 'low' },
          { label: '夜间翻身', value: '93次', ref: '正常 <60次', status: 'high' },
          { label: '深睡比例', value: '18%', ref: '健康 18-25%', status: 'border' },
          { label: 'AHI', value: '1.0次/h', ref: '正常 <5', status: 'ok' }
        ],
        suggestions: [
          '低盐 <5g/日、限液（夜间饮水 <300ml）',
          '耐受范围内规律有氧：快走、游泳',
          '严格控制血压、血糖、血脂等基础病',
          '每日固定时间称体重，3 天内突增 >2kg 立即就医',
          '出现夜间气促、端坐呼吸、下肢水肿立即就医'
        ],
        linkText: '查看心率与 HRV 长期趋势',
        linkTarget: { module: 'heart', metric: 'heartRate' },
        expanded: false
      },

      // ⑤ 心源性猝死 — 急 — 🟡
      {
        id: 'scd',
        category: '心电图异常',
        status: 'yellow',
        level: 'warning',
        icon: '🟡',
        title: '心电图异常',
        acuteChronic: '急',
        summary: 'HRV 偏低但未达高危阈值，未见恶性心律失常信号',
        diseaseTags: ['心源性猝死 (SCD)', '室性心动过速 (VT)', '心室颤动 (VF)', '长 QT 综合征', 'Brugada 综合征', '儿茶酚胺敏感性室速 (CPVT)', '早期复极综合征', '致心律失常性右室心肌病 (ARVC)', '心脏停搏', 'Wolff-Parkinson-White 综合征'],
        assessment: 'HRV (SDNN) 33ms 位于 20-50ms 轻度区间，未达 <20ms 高危阈值。本夜未检测到室性早搏、QT 间期正常、无长 R-R 间期。HRV 极低 (<20ms) 是公认的 SCD 独立预测因子，其预测价值与心衰射血分数相当。中国心源性猝死每年发生约 54.4 万例，约 80% 发生在院外。【急性触发因素】① 急性心肌缺血（最常见，约 80% SCD 由急性冠脉事件引发），② 电解质紊乱（低钾 <3.5、低镁），③ 剧烈情绪/运动应激（尤其突然剧烈活动），④ 长 QT 药物（部分抗生素如红霉素/氟喹诺酮、抗抑郁药、抗心律失常药），⑤ 过度疲劳/熬夜，⑥ 酒精过量；【预防突发】严格控制冠心病基础病、避免清晨/寒冷天气剧烈运动、定期复查电解质、服用新药前查询是否延长 QT、戒烟限酒、保证 7h 睡眠；既往心脏病者建议家中常备 AED 并学习心肺复苏（CPR）。',
        dataPoints: [
          { label: 'HRV (SDNN)', value: '33ms', ref: '高危 <20ms（🟡 偏低）', status: 'border' },
          { label: '室性早搏密度', value: '0次/h', ref: '高危 >10次/h', status: 'ok' },
          { label: 'QT 间期', value: '正常范围', ref: '正常 <450ms', status: 'ok' },
          { label: '长 R-R 间期', value: '未见', ref: '无突发停搏', status: 'ok' }
        ],
        suggestions: [
          '严格控制冠心病、高血压、糖尿病等基础病',
          '避免清晨/寒冷天气剧烈运动，避免突然用力',
          '定期复查电解质，警惕低钾低镁',
          '服用新药前查询是否延长 QT 间期',
          '既往心脏病者建议家中常备 AED 并学习 CPR'
        ],
        linkText: '查看 HRV 长期趋势',
        linkTarget: { module: 'heart', metric: 'hrv' },
        expanded: false
      },

      // ⑥ 房室传导阻滞 — 急·慢 — 🟢
      {
        id: 'av-block',
        category: '房室传导异常',
        status: 'green',
        level: 'info',
        icon: '🟢',
        title: '房室传导异常',
        acuteChronic: '急·慢',
        summary: 'PR 间期正常、无漏搏、未见长间歇',
        diseaseTags: ['一度房室传导阻滞', '二度 I 型（Mobitz I/文氏阻滞）', '二度 II 型（Mobitz II）', '三度（完全性）房室传导阻滞', '病态窦房结综合征 (SSS)', '左束支阻滞 (LBBB)', '右束支阻滞 (RBBB)', '双分支/三分支阻滞', 'Stokes-Adams 综合征', '窦性停搏', '快慢综合征', '心脏神经反射性晕厥'],
        assessment: 'PR 间期在正常范围（120-200ms），QRS 时限正常（<120ms，可排除束支阻滞），整夜未见漏搏、停搏、长 R-R 间期（>2s）。夜间最低心率 55bpm 在生理性窦性心动过缓范围内（运动员、老年人常见）。≥65 岁人群传导系统退化常见，及时发现可避免晕厥与心源性猝死。【慢性进展识别数据】PR 间期持续延长（>200ms）、夜间最低心率 <40bpm 持续、间歇性漏搏、QRS 增宽——这些信号提示传导系统逐渐退化；【急性触发因素】① 急性下壁心肌梗死（影响房室结血供），② 急性心肌炎（病毒性最常见），③ 高钾血症（血钾 >6.0），④ 迷走神经张力突增（剧烈呕吐、用力排便、剧烈疼痛刺激），⑤ 药物过量（洋地黄、β受体阻滞剂、地尔硫卓/维拉帕米），⑥ 莱姆病；【预防突发】既往传导异常者避免迷走刺激（避免暴力排便、突然冷水浴）、谨慎使用减慢心率药物、定期监测血钾、出现头晕黑朦及时就医（可能为完全性阻滞前兆，需要起搏器）。',
        dataPoints: [
          { label: 'PR 间期', value: '正常范围', ref: '120-200ms', status: 'ok' },
          { label: 'QRS 时限', value: '正常', ref: '<120ms', status: 'ok' },
          { label: '夜间最低心率', value: '55bpm', ref: '正常 ≥50bpm', status: 'ok' },
          { label: '长 R-R 间期', value: '未见', ref: '无 >2s 停搏', status: 'ok' }
        ],
        suggestions: [
          '出现头晕、黑朦、晕厥立即心电图检查',
          '定期复查血钾、肝肾功能',
          '心率持续 <50bpm 或停搏 >3s 需起搏器评估',
          '老年人避免暴力排便、突然冷水浴等迷走刺激',
          '服用减慢心率药物（β受体阻滞剂等）需监测'
        ],
        linkText: '查看心率长期趋势',
        linkTarget: { module: 'heart', metric: 'heartRate' },
        expanded: false
      },

      // ⑦ 室性早搏 — 急·慢 — 🟢
      {
        id: 'pvc',
        category: '室性早搏风险',
        status: 'green',
        level: 'info',
        icon: '🟢',
        title: '室性早搏风险',
        acuteChronic: '急·慢',
        summary: '本夜未检测到室性早搏与心律不齐',
        diseaseTags: ['室性早搏 (PVC)', '房性早搏 (PAC)', '室性二联律', '室性三联律', '成对室早 (Couplet)', '短阵室速 (NSVT)', 'R on T 现象', 'Lown II-V 级室早', '室性早搏诱发心肌病', '右室流出道室早', '左室特发性室早', '运动诱发室早', '交界性早搏'],
        assessment: '整夜 ECG 未检测到室性早搏（PVC）、房性早搏（PAC）或心律不齐，QRS 波形态稳定一致。偶发早搏在健康人群中常见（24h <100 次属正常），但每小时 >10 次（Lown II 级以上）或出现成对/连发、R on T 现象需警惕。【急性触发因素】① 咖啡因/浓茶/可乐过量，② 酒精（尤其暴饮），③ 吸烟、二手烟，④ 情绪激动/焦虑，⑤ 过度疲劳/熬夜，⑥ 电解质紊乱（缺钾缺镁最常见），⑦ 感冒发热，⑧ 甲状腺功能亢进，⑨ 严重贫血；【慢性识别数据】每小时室早 >10 次（Lown II 级以上）、成对/连发、R on T 现象、运动诱发增多——频发室早可诱发短阵室速、心室颤动甚至猝死，长期还可导致室早诱发性心肌病（24h 室早 >2 万次需积极干预）；【预防突发】限制咖啡因 <300mg/日（约 3 杯咖啡）、戒烟限酒、避免熬夜、定期复查电解质、控制甲亢/贫血等基础病。',
        dataPoints: [
          { label: '室性早搏频次', value: '0次/h', ref: '警戒 >10次/h（Lown II 级）', status: 'ok' },
          { label: '房性早搏频次', value: '0次/h', ref: '正常 <5次/h', status: 'ok' },
          { label: '成对/连发室早', value: '未见', ref: '高危信号', status: 'ok' },
          { label: 'R on T 现象', value: '未见', ref: '极高危', status: 'ok' }
        ],
        suggestions: [
          '限制咖啡因 <300mg/日（约 3 杯咖啡）',
          '戒烟限酒、避免熬夜',
          '定期复查血钾、血镁、甲状腺功能',
          '频发早搏合并心悸/晕厥需 24h Holter 定量',
          '24h 室早 >2 万次或合并心衰建议消融术评估'
        ],
        linkText: '查看心动图长期趋势',
        linkTarget: { module: 'heart', metric: 'ecg' },
        expanded: false
      },

      // ⑧ 阻塞性睡眠呼吸暂停综合征 — 急·慢 — 🟡
      {
        id: 'osas',
        category: '睡眠呼吸暂停风险',
        status: 'yellow',
        level: 'warning',
        icon: '🟡',
        title: '睡眠呼吸暂停风险',
        acuteChronic: '急·慢',
        summary: '单次暂停超阈值 + 鼾声频发，需关注上气道阻塞',
        diseaseTags: ['阻塞性睡眠呼吸暂停 (OSAS)', '中枢性睡眠呼吸暂停 (CSA)', '混合型睡眠呼吸暂停', '上气道阻力综合征', '睡眠相关低通气', '夜间低氧血症', '继发高血压', '继发房颤', '夜间心绞痛', '卒中', '2型糖尿病', '认知功能下降', '痴呆', '日间嗜睡综合征'],
        assessment: 'AHI 1.0 次/h 仍在健康区（<5），但最长呼吸暂停 17 秒已超过 10 秒观察阈值，鼾声 5 次中最长持续 18 秒——双重信号提示轻度上气道阻塞。≥50 岁人群 OSAS 患病率 20-30%，且 80% 未确诊。【慢性识别数据】持续 AHI >5（轻度）、>15（中度）、>30（重度），最长暂停 >10 秒，夜间血氧 <90%，频繁鼾声 >10 次/夜——长期未控将继发高血压（80% 难治性高血压合并 OSAS）、房颤（风险增 4 倍）、心梗、卒中、糖尿病、认知障碍；【急性触发因素】饮酒（尤其睡前 3 小时内）、镇静催眠类药物、仰卧位睡眠、感冒鼻塞、超重；【预防突发与慢性进展】侧卧睡姿（可减少 30-50% 暂停事件）、控制体重（BMI <24，颈围 <40cm）、戒酒戒烟、睡前避免镇静药物，中重度 OSAS 需 CPAP 持续正压通气治疗。',
        dataPoints: [
          { label: 'AHI', value: '1.0次/h', ref: '轻度 5-15 / 中度 15-30 / 重度 >30', status: 'ok' },
          { label: '最长呼吸暂停', value: '17秒', ref: '阈值 ≤10秒', status: 'high' },
          { label: '鼾声次数', value: '5次/夜', ref: '正常 <3次', status: 'high' },
          { label: '最长鼾声', value: '18秒', ref: '正常 <10秒', status: 'high' }
        ],
        suggestions: [
          '侧卧睡姿替代仰卧，可减少 30-50% 暂停事件',
          '睡前 3 小时避免饮酒、镇静类药物',
          '控制体重 BMI <24，颈围 <40cm',
          '连续 ≥3 天暂停 >15 秒建议睡眠监测 (PSG/HSAT)',
          '中重度 OSAS 需 CPAP 持续正压通气治疗'
        ],
        linkText: '查看呼吸暂停与鼾声趋势',
        linkTarget: { module: 'breath', metric: 'apnea' },
        expanded: false
      },

      // ⑨ 慢性阻塞性肺疾病 — 慢 — 🟢
      {
        id: 'copd',
        category: '慢阻肺风险',
        status: 'green',
        level: 'info',
        icon: '🟢',
        title: '慢阻肺风险',
        acuteChronic: '慢',
        summary: '呼吸节律稳定、无夜间咳嗽',
        diseaseTags: ['慢性阻塞性肺疾病 (COPD)', '慢性支气管炎', '肺气肿', '咳嗽变异性哮喘', '过敏性哮喘', '嗜酸性粒细胞性哮喘', '支气管扩张', '间质性肺病早期', '肺源性心脏病', '吸烟相关肺损伤', '尘肺早期'],
        assessment: '夜间呼吸频率维持在 12-19 次/分（平均 16 次），处于健康成人区间；节律平稳无明显不齐。整夜无咳嗽事件记录、无呼气延长信号——未见慢阻肺早期信号。中老年 COPD 患病率 13%，≥40 岁人群 13.7%，吸烟人群更高（约 25%），早期 GOLD 1 级可逆。【慢性识别数据】夜间呼吸频率持续 >20 次/分（慢性呼吸代偿）、呼吸节律不规则（通气功能受损）、夜间咳嗽 >3 次（气道炎症活跃）、清晨咳嗽咳痰超过 3 个月持续 2 年（慢性支气管炎临床诊断标准），呼气延长信号、夜间血氧波动——这些信号可早 5-10 年识别 COPD；【提前干预方案】① 戒烟（最重要，可逆转早期病变），② 避免雾霾天外出/室内空气净化，③ 每年接种流感疫苗、每 5 年接种肺炎疫苗，④ 规律呼吸训练（缩唇呼吸 + 腹式呼吸），⑤ ≥40 岁吸烟者每年做肺功能检查（FEV1/FVC）；【急性加重触发因素】呼吸道感染（占 70%，细菌/病毒）、空气污染、吸入冷空气，出现痰量增多/痰色变黄、气促加重需立即就医。',
        dataPoints: [
          { label: '夜间呼吸频率', value: '12-19次/分', ref: '正常 12-20', status: 'ok' },
          { label: '平均呼吸', value: '16次/分', ref: '正常 12-20', status: 'ok' },
          { label: '呼吸节律', value: '稳定', ref: '无明显不齐', status: 'ok' },
          { label: '夜间咳嗽', value: '0次', ref: '正常 <3次', status: 'ok' }
        ],
        suggestions: [
          '戒烟（最重要，可逆转早期 COPD）',
          '避免雾霾天外出，室内可使用空气净化器',
          '每年接种流感疫苗，每 5 年接种肺炎疫苗',
          '规律呼吸训练：缩唇呼吸 + 腹式呼吸',
          '≥40 岁吸烟者每年做肺功能检查（FEV1/FVC）'
        ],
        linkText: '查看呼吸频率长期趋势',
        linkTarget: { module: 'breath', metric: 'breathRate' },
        expanded: false
      }
    ],
    // 排序后的两个子集（onLoad 计算填入）
    criticalRisks: [],   // red + yellow，按红→黄排序
    normalRisks: [],     // 全部 green
    showNormalGroup: false,  // 默认折叠绿色聚合卡
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
      unit: "次/分钟",
      yMin: 5,
      yMax: 25,
      horizontalTicks: 5,
      showVerticalGrid: false,
      smooth: false,
      lineWidth: 3.0,
      fillUnder: true,
      fillColor: "rgba(88, 199, 245, 0.15)",
      gridColor: "rgba(222, 236, 235, 0.95)",
      tickColor: "#2f343c",
      lineColor: "#58c7f5"
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
    // 声音监测 8 项（用户指定顺序，鼾声/梦话/咳嗽 3 项可点击查看录音）
    soundCards: [
      { key: "snore",    label: "鼾声总次数",   value: "5次",   level: "轻度频发", tappable: true },
      { key: "sleeptalk",label: "梦话总次数",   value: "2次",   level: "-",        tappable: true },
      { key: "cough",    label: "咳嗽声总次数", value: "0次",   level: "无异常",   tappable: true },
      { key: "impact",   label: "睡眠影响占比", value: "12%",   level: "影响较低", tappable: false },
      { key: "snoreMax", label: "最长鼾声时长", value: "18秒",  level: "需关注",   tappable: false },
      { key: "noiseDur", label: "噪音干扰时长", value: "8分钟", level: "正常范围", tappable: false },
      { key: "noiseAvg", label: "环境平均噪音", value: "32分贝", level: "超安静",  tappable: false },
      { key: "noisePeak",label: "峰值噪音",     value: "62分贝", level: "轻度干扰", tappable: false }
    ],

    // 声音录音详情弹窗
    soundDetailModal: {
      visible: false,
      title: '',
      recordings: []  // [{time, durationSec, label}]
    },
    // 各类别的录音列表（mock 数据，等接入硬件 API 后替换）
    soundRecordings: {
      snore: [
        { time: '00:42', durationSec: 12, label: '鼾声' },
        { time: '01:18', durationSec: 8,  label: '鼾声' },
        { time: '02:35', durationSec: 18, label: '鼾声（最长）' },
        { time: '04:11', durationSec: 6,  label: '鼾声' },
        { time: '05:47', durationSec: 9,  label: '鼾声' }
      ],
      sleeptalk: [
        { time: '03:14', durationSec: 4, label: '梦话片段' },
        { time: '06:22', durationSec: 3, label: '梦话片段' }
      ],
      cough: []
    }
  },

  onLoad() {
    this.initDateData();
    this.updateDynamicTimeAxis();
    const cycles = this.buildSleepCycles();
    const recovery = this.computeRecoveryScores(cycles);
    const sectionSummaries = this.computeNightlyHeadline();
    const { criticalRisks, normalRisks } = this.splitCardiacRisks(this.data.cardiacRisks);
    this.setData({
      sleepCycles: cycles,
      recoveryScores: recovery,
      sectionSummaries,
      criticalRisks,
      normalRisks
    });
  },

  // 把 cardiacRisks 拆成「红+黄（红置顶）」和「绿色」两组
  splitCardiacRisks(risks) {
    const order = { red: 0, yellow: 1, green: 2 };
    const sorted = (risks || []).slice().sort((a, b) => {
      const oa = order[a.status] !== undefined ? order[a.status] : 9;
      const ob = order[b.status] !== undefined ? order[b.status] : 9;
      return oa - ob;
    });
    return {
      criticalRisks: sorted.filter((r) => r.status === 'red' || r.status === 'yellow'),
      normalRisks: sorted.filter((r) => r.status === 'green')
    };
  },

  // 根据 7 项核心指标动态生成各板块副标题（睡眠 / 心脏 / 呼吸 / 声音）
  computeNightlyHeadline() {
    const m = this.data.coreHealthMetrics;

    // 把 8.6h 转成 8h36m 格式
    const hourToHm = (h) => {
      const total = Math.round(h * 60);
      return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, '0')}m`;
    };
    const durationStr = hourToHm(m.duration.value);

    const sleep =
      (m.duration.value >= 7 && m.duration.value <= 9 && m.efficiency.value >= 85)
        ? `睡眠时长 ${durationStr}、效率 ${m.efficiency.value}%，结构完整，深睡比例 ${m.deepRatio.value}% 处于健康区间，整夜分期节律清晰，身体恢复充分。`
        : `睡眠时长 ${durationStr}、效率 ${m.efficiency.value}%，深睡比例 ${m.deepRatio.value}%。${m.duration.value < 7 ? '总时长偏短，' : ''}${m.efficiency.value < 85 ? '卧床效率有改善空间，' : ''}建议关注作息规律。`;

    const heart =
      (m.hrAvg.value >= 45 && m.hrAvg.value <= 70 && m.hrv.value >= 50)
        ? `夜间平均心率 ${m.hrAvg.value} bpm 处于最优范围，HRV ${m.hrv.value} ms 自主神经调节良好，心脏整夜处于充分休息状态。`
        : `夜间平均心率 ${m.hrAvg.value} bpm${m.hrAvg.value > 70 ? '（略高于 45-70 最优范围）' : ''}，HRV ${m.hrv.value} ms${m.hrv.value < 50 ? '（低于健康参考 >50ms，提示自主神经调节偏弱）' : ''}。心脏恢复力有提升空间，建议持续关注压力管理与睡眠质量。`;

    const breath =
      (m.ahi.value < 5 && m.apneaMax.value < 10)
        ? `呼吸节律平稳，AHI ${m.ahi.value} 次/小时、最长呼吸暂停 ${m.apneaMax.value} 秒均在健康区内，气道通畅。`
        : `AHI ${m.ahi.value} 次/小时${m.ahi.value < 5 ? '（健康）' : '（轻度异常）'}，最长呼吸暂停 ${m.apneaMax.value} 秒${m.apneaMax.value >= 10 ? '（超过 10 秒观察阈值，单次不构成风险，若连续多日出现需关注）' : ''}。整体呼吸暂停事件未集中于深睡阶段，对心脏负荷影响有限。`;

    // 声音监测总结（基于本地 mock：低环境噪音、3 次轻度鼾声、2 次咳嗽）
    const sound = `整夜环境噪音平均 32 分贝，处于安静范围；轻度鼾声 3 次、咳嗽 2 次，未对睡眠周期造成中断，对心脏负荷影响极小。`;

    return { sleep, heart, breath, sound };
  },

  // 根据睡眠分期周期 + HRV 计算身体/精神恢复度
  // 身体恢复 = 最后一周期累计身体恢复（深睡主管身体修复）
  // 精神恢复 = (最后一周期累计精神恢复 × 0.6) + (HRV 健康度 × 0.4)
  //   HRV 健康度：>=50 计 100，30-50 线性插值，<30 计 0
  computeRecoveryScores(cycles) {
    if (!cycles || cycles.length === 0) {
      return {
        body: { score: 0, label: '恢复不足', status: '数据不足' },
        mind: { score: 0, label: '恢复不足', status: '数据不足' }
      };
    }
    const last = cycles[cycles.length - 1];
    const bodyScore = Math.round(last.bodyRecovery || 0);

    // 精神恢复：REM 占比 60% + HRV 健康度 40%
    const remBase = last.mindRecovery || 0;
    const hrv = (this.data.coreHealthMetrics && this.data.coreHealthMetrics.hrv && this.data.coreHealthMetrics.hrv.value) || 33;
    const hrvHealth = hrv >= 50 ? 100 : (hrv <= 30 ? 0 : Math.round((hrv - 30) / 20 * 100));
    const mindScore = Math.round(remBase * 0.6 + hrvHealth * 0.4);

    const labelFor = (s) => {
      if (s >= 95) return '完美恢复';
      if (s >= 85) return '充分恢复';
      if (s >= 70) return '良好恢复';
      if (s >= 55) return '部分恢复';
      return '恢复不足';
    };
    const statusFor = (s) => {
      if (s >= 85) return '睡的超稳';
      if (s >= 70) return '基本满足';
      return '需要补觉';
    };
    return {
      body: { score: bodyScore, label: labelFor(bodyScore), status: statusFor(bodyScore) },
      mind: { score: mindScore, label: labelFor(mindScore), status: statusFor(mindScore) }
    };
  },

  onShow() {
    // 同步会员状态（用户在我的页订阅后，回到每日页要立即反映）
    const app = getApp();
    const m = (app && app.globalData && app.globalData.member) || { isMember: false };
    this.setData({ isMember: !!m.isMember });
  },

  onReady() {
    // 心脏板块默认展开
    this.drawHeartTrendChart();
    this.drawEcgChart();
    this.drawIndexGaugeMini();
    // 其余板块默认折叠，canvas 不渲染时 selector 返回空会静默跳过
    this.drawSleepCycle();
    this.drawMovementTrend();
    this.drawBreathingTrend();
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

  // 格式化日期为 yyyy-mm-dd
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 计算给定日期所在周（周日为起点）的 7 个日期对象，用于 week-selector 展示
  buildWeekDays(targetDate) {
    const weekDay = targetDate.getDay(); // 0=日, 1=一, ..., 6=六
    const sunday = new Date(targetDate);
    sunday.setDate(targetDate.getDate() - weekDay);
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      arr.push({
        short: labels[i],
        date: d.getDate(),
        dateStr: this.formatDate(d)
      });
    }
    return arr;
  },

  // 切换到指定 Date（统一入口，处理所有联动更新）
  applyDate(dateObj) {
    const weekDay = dateObj.getDay();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    const y = dateObj.getFullYear();
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    this.setData({
      selectedDay: weekDay,
      currentWeekDay: labels[weekDay],
      currentDate: this.formatDate(dateObj),
      currentDateRange: `${m}月${d}日`,
      currentDateLabel: `${m}月${d}日`,  // 用于「昨晚总览」右上角徽章
      weekDays: this.buildWeekDays(dateObj),
      // 同步日历弹窗的年月
      calendarYear: y,
      calendarMonth: dateObj.getMonth(),
      calendarYearMonth: `${y}年${String(m).padStart(2, '0')}月`,
      calendarDays: this.generateCalendarDays(y, dateObj.getMonth())
    });
  },

  initDateData() {
    const now = new Date();
    this.applyDate(now);
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
        hasData: date <= today
      });
    }
    return days;
  },

  // 选择星期 — 修复：以当前 currentDate 为锚点，定位到所在周对应的星期几
  selectDay(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.weekDays[index];
    if (!item || !item.dateStr) return;
    const newDate = new Date(item.dateStr + 'T00:00:00');
    this.applyDate(newDate);
  },

  // 显示日历弹窗
  showCalendar() {
    this.setData({ showCalendarModal: true });
  },

  // 日历切换月份（不关闭弹窗）
  prevCalendarMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth -= 1;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear -= 1;
    }
    this.setData({
      calendarYear,
      calendarMonth,
      calendarYearMonth: `${calendarYear}年${String(calendarMonth + 1).padStart(2, '0')}月`,
      calendarDays: this.generateCalendarDays(calendarYear, calendarMonth)
    });
  },

  nextCalendarMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth += 1;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear += 1;
    }
    this.setData({
      calendarYear,
      calendarMonth,
      calendarYearMonth: `${calendarYear}年${String(calendarMonth + 1).padStart(2, '0')}月`,
      calendarDays: this.generateCalendarDays(calendarYear, calendarMonth)
    });
  },

  // 隐藏日历弹窗
  hideCalendar() {
    this.setData({ showCalendarModal: false });
  },

  // 选择日历日期 — 修复：使用日历当前展示的年月，而不是 now 的年月
  selectCalendarDay(e) {
    const day = e.currentTarget.dataset.day;
    const year = this.data.calendarYear;
    const month = this.data.calendarMonth;
    const selectedDate = new Date(year, month, day);
    this.applyDate(selectedDate);
    this.setData({ showCalendarModal: false });
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

  // 检查是否会员
  isMember() {
    const app = getApp();
    return !!(app && app.globalData && app.globalData.member && app.globalData.member.isMember);
  },

  // 打开声音录音弹窗（非会员触发付费弹窗）
  openSoundDetail(e) {
    const key = e.currentTarget.dataset.key;
    const card = (this.data.soundCards || []).find((c) => c.key === key);
    if (!card || !card.tappable) return;
    if (!this.isMember()) {
      this.openSoundPaywall();
      return;
    }
    const recordings = this.data.soundRecordings[key] || [];
    this.setData({
      soundDetailModal: {
        visible: true,
        title: `${card.label}（${card.value}）`,
        recordings
      }
    });
  },

  // ===== 声音付费弹窗 =====
  openSoundPaywall() {
    this.setData({
      paywall: {
        visible: true,
        icon: '🔊',
        title: '解锁睡眠声音监测',
        sub: '听见昨晚发生的一切',
        features: [
          { icon: '🎙️', title: '鼾声 / 梦话 / 咳嗽 录音回放', sub: '每条事件可点击试听，标注准确发生时间' },
          { icon: '🌙', title: '整夜声音事件详细记录', sub: '8 项核心指标 + 联动趋势图' },
          { icon: '📈', title: '长期声音趋势', sub: '鼾声 / 梦话 30 天 / 全周期频次变化，看到改善' }
        ]
      }
    });
  },
  closePaywall() {
    this.setData({ 'paywall.visible': false });
  },
  paywallTrial() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: true, planType: 'trial',
      trialStartAt: now, expireAt: now + 7 * 86400000, autoRenew: true,
      nextPlanAfterTrial: 'monthly'
    });
    this.setData({ 'paywall.visible': false, isMember: true });
    wx.showToast({ title: '7 天免费试用已开启，结束后将按月付 ¥19.9 自动续费', icon: 'none', duration: 2500 });
  },
  paywallSubscribeYearly() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: false, planType: 'yearly',
      trialStartAt: 0, expireAt: now + 365 * 86400000, autoRenew: true
    });
    this.setData({ 'paywall.visible': false, isMember: true });
    wx.showToast({ title: '订阅成功', icon: 'success' });
  },
  paywallSubscribeMonthly() {
    const app = getApp();
    const now = Date.now();
    app.saveMemberState({
      isMember: true, isTrial: false, planType: 'monthly',
      trialStartAt: 0, expireAt: now + 30 * 86400000, autoRenew: true
    });
    this.setData({ 'paywall.visible': false, isMember: true });
    wx.showToast({ title: '订阅成功', icon: 'success' });
  },
  closeSoundDetail() {
    this.setData({ 'soundDetailModal.visible': false });
  },
  playSoundClip(e) {
    const time = e.currentTarget.dataset.time;
    wx.showToast({ title: `播放 ${time} 录音（接入 API 后启用）`, icon: 'none' });
  },

  // 切换风险卡展开/收起（同步更新源数据 + 两个子列表）
  toggleCardiacRisk(e) {
    const id = e.currentTarget.dataset.id;
    const cardiacRisks = (this.data.cardiacRisks || []).map((r) =>
      r.id === id ? { ...r, expanded: !r.expanded } : r
    );
    const { criticalRisks, normalRisks } = this.splitCardiacRisks(cardiacRisks);
    this.setData({ cardiacRisks, criticalRisks, normalRisks });
  },

  // 切换"正常项目"聚合卡的展开/收起
  toggleNormalGroup() {
    this.setData({ showNormalGroup: !this.data.showNormalGroup });
  },

  // 点击风险卡里的"查看长期趋势"链接，跳转长期页对应指标
  gotoRiskTrend(e) {
    const id = e.currentTarget.dataset.id;
    const risk = (this.data.cardiacRisks || []).find((r) => r.id === id);
    if (!risk || !risk.linkTarget) return;
    wx.setStorageSync('longterm-focus-target', {
      module: risk.linkTarget.module,
      metric: risk.linkTarget.metric,
      ts: Date.now()
    });
    wx.switchTab({ url: '/pages/longterm/index' });
  },

  toggleTodayCheckIn(e) {
    const id = e.currentTarget.dataset.id;
    const next = (this.data.todayCheckIns || []).map((it) =>
      it.id === id ? { ...it, checked: !it.checked } : it
    );
    this.setData({ todayCheckIns: next });
    // 记录到打卡历史，供长期页 annotation 使用
    const history = wx.getStorageSync('checkin-history') || [];
    history.push({ id, date: this.data.currentDate, ts: Date.now() });
    wx.setStorageSync('checkin-history', history);
  },

  // 跳转长期页睡眠效率板块
  goLongtermEfficiency() {
    wx.setStorageSync('longterm-focus-target', {
      module: 'sleep', metric: 'efficiency', ts: Date.now()
    });
    wx.switchTab({ url: '/pages/longterm/index' });
  },

  toggleSleepHealth() {
    this.setData(
      { showSleepHealth: !this.data.showSleepHealth },
      () => {
        if (this.data.showSleepHealth) {
          // 睡眠健康展开时绘制睡眠分期 + 体动趋势
          this.drawSleepCycle();
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
    // 非会员点开启时弹付费弹窗
    if (!this.isMember()) {
      this.openSoundPaywall();
      return;
    }
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
          ctx.font = "13px sans-serif";
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