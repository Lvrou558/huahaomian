# 话好眠 · 每日页 算法集

> **本文件定位**：「每日」tab 页面所有算法规则的集中地，供后端工程师实现参考。
>
> **与需求文档关系**：本文件只写**算法本身**（输入、阈值、计算、输出）。UI 字段表、接口设计、存储设计在对应的 `backend_requirements_*.md` 需求文档中。
>
> **页面板块映射**（与 wxml/js 文件对齐）：
>
> | 板块 | 详细需求文档 | 本文件算法章节 |
> |---|---|---|
> | 心脏健康总览（顶部 9 项风险 + 今日打卡） | `backend_requirements_heart_overview.md` | §1 §2 |
> | 心脏具体数据（指数 + 核心指标 + 心率图 + ECG） | `backend_requirements_heart.md` | §3 §4 §5 |
> | 呼吸健康 | 待写 | §6（占位）|
> | 睡眠健康 | 待写 | §7（占位）|
> | 声音监测 | 待写 | §8（占位）|

---

## 目录

- [§1 9 项心脏疾病风险判定](#1-9-项心脏疾病风险判定)
- [§2 今日打卡推荐算法](#2-今日打卡推荐算法)
- [§3 心脏健康指数 (0-100)](#3-心脏健康指数-0-100)
- [§4 4 项核心心脏指标等级文案](#4-4-项核心心脏指标等级文案)
- [§5 心率/心动图 文字解读模板](#5-心率心动图-文字解读模板)
- [§6 呼吸健康（待补充）](#6-呼吸健康待补充)
- [§7 睡眠健康（待补充）](#7-睡眠健康待补充)
- [§8 声音监测（待补充）](#8-声音监测待补充)
- [§9 折叠态状态徽章状态机](#9-折叠态状态徽章状态机)

---

## §1 9 项心脏疾病风险判定

> **来源**：`backend_requirements_heart_overview.md §2`
>
> **判定原则**：每项 3 档阈值。同一风险中**满足任一红线 = 红**，**满足任一黄线 = 黄**，**全部健康 = 绿**。
>
> **降级保护**：关键指标缺失 → `status = "unknown"`。

### §1.1 风险总览

| # | 风险名 | 主要输入 |
|---|---|---|
| R1 | 高血压风险 | 静息心率、HRV、心率回落、14d 均值 |
| R2 | 心脏负荷评估 | 静息心率、HRV、翻身次数、深睡比例 |
| R3 | 心电图异常 | ECG events、HRV、QT 间期 |
| R4 | 睡眠呼吸暂停风险 | AHI、最长暂停、鼾声次数/最长鼾声 |
| R5 | 房颤风险评估 | P 波识别、R-R 变异系数、突发心率事件 |
| R6 | 冠心病风险 | ST 段、T 波形态、心率回落 |
| R7 | 房室传导异常 | PR 间期、QRS 时限、最低心率、长 R-R |
| R8 | 室性早搏风险 | PVC/PAC 频次、成对连发、R on T |
| R9 | 慢阻肺风险 | 呼吸频率均值/范围、节律变异、咳嗽 |

### §1.2 R1 高血压风险

**输入**：

| 字段 | 含义 | 单位 |
|---|---|---|
| `restingHR` | 整夜最低 HR（持续 5 分钟以上） | bpm |
| `hrv` | SDNN | ms |
| `hrDipping` | (入睡时 HR - 最低 HR) / 入睡时 HR × 100 | % |
| `hr14dAvg` | 14 天均值心率 | bpm |

**阈值**：

| 状态 | 触发条件（满足任一） |
|---|---|
| 🔴 红 | `restingHR ≥ 75` 持续 ≥7 天连续 ｜ `hrv < 20 且 hrDipping < 5%` |
| 🟡 黄 | `70 ≤ restingHR < 75` ｜ `20 ≤ hrv < 30` ｜ `5% ≤ hrDipping < 10%` |
| 🟢 绿 | `restingHR < 70 且 hrv ≥ 30 且 hrDipping ≥ 10%` |

### §1.3 R2 心脏负荷评估

| 输入 | 含义 |
|---|---|
| `restingHR`, `hrv` | 同 R1 |
| `turnoverCount` | 整夜翻身次数 |
| `deepRatio` | 深睡占比 % |
| `ahi` | 呼吸暂停指数（跨模块）|

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `restingHR > 75 且 hrv < 20 且 turnoverCount > 100` |
| 🟡 黄 | `restingHR > 70` ｜ `hrv < 30` ｜ `turnoverCount > 60` ｜ `deepRatio < 15%` |
| 🟢 绿 | 均健康 |

### §1.4 R3 心电图异常

| 输入 | 含义 |
|---|---|
| `ecgEvents` | 数组：`["st_elevation"\|"st_depression"\|"early_beat"\|"missed_beat"\|"long_rr"\|"vt"\|"r_on_t"]` |
| `hrv` | SDNN ms |
| `qtInterval` | QT 间期 ms |
| `pvcPerHour` | 室性早搏频次（与 R8 共用） |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `ecgEvents 含 st_elevation/vt/r_on_t/long_rr` ｜ `qtInterval > 450` |
| 🟡 黄 | `20 ≤ hrv < 30` ｜ `1 ≤ pvcPerHour ≤ 10` ｜ `qtInterval ∈ [430,450]` |
| 🟢 绿 | `ecgEvents = [] 且 hrv ≥ 30 且 qtInterval < 430` |

### §1.5 R4 睡眠呼吸暂停风险

| 输入 | 含义 |
|---|---|
| `ahi` | 呼吸暂停指数 次/h |
| `apneaMaxSec` | 最长单次暂停秒数 |
| `snoreCount` | 鼾声次数 |
| `snoreMaxSec` | 最长鼾声秒数 |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `ahi ≥ 15` ｜ `apneaMaxSec > 30` |
| 🟡 黄 | `5 ≤ ahi < 15` ｜ `10 < apneaMaxSec ≤ 30` ｜ `snoreCount ≥ 3` ｜ `snoreMaxSec > 10` |
| 🟢 绿 | `ahi < 5 且 apneaMaxSec ≤ 10 且 snoreCount < 3` |

### §1.6 R5 房颤风险评估

| 输入 | 含义 |
|---|---|
| `pWavePresent` | `clear`/`weak`/`absent` |
| `rrCv` | R-R 间期变异系数 % |
| `hrSurgeCount` | 突发心率事件数（>120bpm 持续 ≥30s） |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `pWavePresent = absent 且 rrCv > 20% 且 hrSurgeCount ≥ 1` |
| 🟡 黄 | `pWavePresent = weak` ｜ `12% < rrCv ≤ 20%` ｜ `hrSurgeCount ≥ 1` |
| 🟢 绿 | `pWavePresent = clear 且 rrCv ≤ 12% 且 hrSurgeCount = 0` |

### §1.7 R6 冠心病风险

| 输入 | 含义 |
|---|---|
| `stDeviationMv` | ST 段最值偏移 mV |
| `stEventDurationSec` | ST 偏移持续秒 |
| `tWaveShape` | `upright`/`flat`/`inverted` |
| `hrDipping` | 同 R1 |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `stDeviationMv ≥ 0.1mV 且 duration ≥ 60s` ｜ `stDeviationMv ≤ -0.05mV 且 duration ≥ 60s` |
| 🟡 黄 | `tWaveShape ∈ {flat, inverted}` ｜ `hrDipping < 10%` |
| 🟢 绿 | `ST ∈ (-0.05, 0.1)mV 且 T 直立 且 hrDipping ≥ 10%` |

### §1.8 R7 房室传导异常

| 输入 | 含义 |
|---|---|
| `prInterval` | PR 间期 ms |
| `qrsDuration` | QRS 时限 ms |
| `hrMin` | 整夜最低心率 |
| `longRrCount` | >2s 长 R-R 次数 |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `qrsDuration ≥ 120` ｜ `longRrCount ≥ 1` |
| 🟡 黄 | `prInterval > 200` ｜ `hrMin < 45` |
| 🟢 绿 | `PR ∈ [120,200] 且 QRS < 120 且 hrMin ≥ 50 且 longRrCount = 0` |

### §1.9 R8 室性早搏风险

| 输入 | 含义 |
|---|---|
| `pvcPerHour` | 室性早搏 次/h |
| `pacPerHour` | 房性早搏 次/h |
| `coupletPresent` | 是否成对/连发室早 |
| `rOnTPresent` | 是否 R on T |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `pvcPerHour > 10` ｜ `coupletPresent` ｜ `rOnTPresent` |
| 🟡 黄 | `1 ≤ pvcPerHour ≤ 10` ｜ `pacPerHour > 5` |
| 🟢 绿 | `pvcPerHour = 0 且 pacPerHour ≤ 5 且 无成对/R on T` |

### §1.10 R9 慢阻肺风险

| 输入 | 含义 |
|---|---|
| `breathAvg`, `breathMin`, `breathMax` | 夜间呼吸频率均值/范围 次/分 |
| `breathCv` | 节律变异系数 % |
| `coughCount` | 夜间咳嗽次数 |

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `breathAvg < 10` ｜ `breathAvg > 25` ｜ `coughCount ≥ 5` |
| 🟡 黄 | `breathMin < 12` ｜ `breathMax > 20` ｜ `breathCv > 20%` ｜ `3 ≤ coughCount < 5` |
| 🟢 绿 | `12 ≤ breathAvg ≤ 20 且 breathCv ≤ 20% 且 coughCount < 3` |

### §1.11 统一输出格式

```json
{
  "id": "R1",
  "name": "高血压风险",
  "status": "yellow",
  "summary": "静息心率接近上限 + HRV 偏低，提示长期血压负荷",
  "diseaseTags": ["原发性高血压", "继发性高血压", "..."],
  "dataPoints": [
    { "label": "静息心率",  "value": "69bpm", "ref": "警戒 >70 持续", "status": "border" },
    { "label": "HRV (SDNN)", "value": "33ms", "ref": "正常 >50ms", "status": "low" },
    { "label": "夜间心率回落", "value": "20%", "ref": "正常 ≥10%", "status": "ok" },
    { "label": "14 天均值心率", "value": "70bpm", "ref": "健康 60-70", "status": "ok" }
  ],
  "suggestionIds": ["s01", "s02", "s03", "s04"]
}
```

---

## §2 今日打卡推荐算法

> **来源**：`backend_requirements_heart_overview.md §4 §5`

### §2.1 建议库（20 条）

| ID | 建议 | 副标题 | emoji | 时段 | 维度 | 关联风险 |
|---|---|---|---|---|---|---|
| s01 | 饭后散步 15 分钟 | 降低静息心率 | 🚶 | 白天 | 运动 | R1, R2 |
| s02 | 每日盐摄入 <5g | 约一啤酒瓶盖 | 🧂 | 全天 | 饮食 | R1, R2 |
| s03 | 每周 3 次 30 分钟有氧 | 快走/游泳/骑行 | 🏃 | 白天 | 运动 | R1, R2, R6 |
| s04 | 早晚血压日记 | 目标 <130/80 mmHg | 📒 | 全天 | 监测 | R1, R6 |
| s05 | 戒烟限酒 | 每周酒精 <100g | 🚭 | 全天 | 行为 | R3, R6, R8 |
| s06 | 下午 3 点后不喝咖啡/浓茶 | 稳定夜间心率 | ☕ | 白天 | 行为 | R3, R8 |
| s07 | 23:00 前入睡 | 避免熬夜诱发心律失常 | 🛏️ | 晚上 | 睡眠 | R3, R5, R8 |
| s08 | 每年体检含心电+颈动脉超声 | 早期发现冠心病 | 🏥 | 年度 | 监测 | R5, R6 |
| s09 | 低脂饮食 | 红肉 <2 次/周 | 🥗 | 全天 | 饮食 | R1, R6 |
| s10 | 心悸/胸闷立即记录 | 帮助医生回溯 | 📝 | 突发 | 监测 | R3, R5, R6 |
| s11 | 侧卧位睡姿 | 减 30-50% 暂停事件 | 😴 | 晚上 | 睡眠 | R4 |
| s12 | 睡前 3 小时不喝酒 | 避免气道塌陷 | 🚱 | 晚上 | 行为 | R4 |
| s13 | 控制体重 BMI<24 | 减少颈围 | ⚖️ | 全天 | 行为 | R2, R4 |
| s14 | 床头抬高 10-15 cm | 减轻气道阻塞 | 🛌 | 晚上 | 环境 | R4 |
| s15 | 睡前 5 分钟腹式呼吸 | 吸 4·屏 4·呼 6 | 🌬️ | 晚上 | 行为 | R2, R3, R5 |
| s16 | 每日冥想 10 分钟 | 降低交感张力 | 🧘 | 白天 | 行为 | R1, R3 |
| s17 | 晨光晒太阳 20 分钟 | 调节生物钟 | ☀️ | 白天 | 行为 | R2, R5 |
| s18 | 卧室湿度 40-60% + 通风 | 保护气道黏膜 | 💨 | 晚上 | 环境 | R4, R9 |
| s19 | 远离二手烟/雾霾戴口罩 | 长期保护气道 | 😷 | 全天 | 环境 | R9 |
| s20 | 睡前 1 小时关闭电子设备 | 减少蓝光 | 📵 | 晚上 | 睡眠 | R2, R7 |

### §2.2 打分公式

```
score(s) = riskScore(s) × fatigueFactor(s) × engagementBonus
```

**riskScore**：关联风险加权累加

| 关联风险状态 | 加分 |
|---|---|
| 🔴 red | +5 |
| 🟡 yellow | +2 |
| 🟢 green | +0.3 |
| ⚪ unknown | 0 |

**fatigueFactor**：避免最近重复

| 最近 7 天推过次数 | 系数 |
|---|---|
| 0 | 1.0 |
| 1 | 0.8 |
| 2 | 0.5 |
| ≥3 | 0.2 |

**engagementBonus**：高完成率奖励

| 30 天完成率 | 系数 |
|---|---|
| ≥60% | 1.2 |
| <60% / 新用户 | 1.0 |

### §2.3 Top-3 选择约束（按顺序应用）

| # | 约束 |
|---|---|
| 1 | 按 score 降序得候选池 |
| 2 | 同维度去重（饮食/运动/行为/睡眠/监测/环境 各最多 1 条） |
| 3 | 时段多样性（至少覆盖 2 个不同时段） |
| 4 | 突发类（s10）仅当关联风险有红/黄才入池 |
| 5 | 年度类（s08）每月最多推 1 次 |
| 6 | 不足 3 条用冷启动列表补齐 |

### §2.4 冷启动

```
新用户首次 / 完全无风险触发 → [s15 腹式呼吸, s01 饭后散步, s06 不喝咖啡]
```

### §2.5 伪代码

```javascript
function recommendDailyCheckins(userId, today) {
  const risks = getRiskAssessments(userId, today);
  const recent7d = getRecentSuggestions(userId, 7);
  const completionRate = getCompletionRate(userId, 30);
  const bonus = completionRate >= 0.6 ? 1.2 : 1.0;

  const scored = SUGGESTION_LIB.map(s => {
    const riskScore = s.relatedRisks.reduce((sum, rid) => {
      const r = risks.find(x => x.id === rid);
      return sum + ({ red:5, yellow:2, green:0.3, unknown:0 }[r.status]);
    }, 0);
    const recentCount = recent7d.filter(id => id === s.id).length;
    const fatigue = [1.0, 0.8, 0.5, 0.2, 0.2][Math.min(recentCount, 4)];
    return { ...s, score: riskScore * fatigue * bonus };
  });

  const eligible = scored.filter(s => {
    if (s.timing === '突发')
      return s.relatedRisks.some(rid =>
        ['red','yellow'].includes(risks.find(x => x.id === rid).status));
    if (s.timing === '年度') return !pushedThisMonth(userId, s.id);
    return true;
  });

  eligible.sort((a, b) => b.score - a.score);
  const picked = [];
  const usedDimensions = new Set();
  const usedTimings = new Set();
  for (const s of eligible) {
    if (picked.length >= 3) break;
    if (usedDimensions.has(s.dimension)) continue;
    picked.push(s);
    usedDimensions.add(s.dimension);
    usedTimings.add(s.timing);
  }

  if (usedTimings.size < 2 && picked.length === 3) {
    const swap = eligible.find(s => !picked.includes(s) && !usedTimings.has(s.timing));
    if (swap) picked[2] = swap;
  }

  if (picked.length < 3) {
    const fb = ['s15','s01','s06']
      .filter(id => !picked.find(s => s.id === id))
      .map(id => SUGGESTION_LIB.find(s => s.id === id));
    picked.push(...fb.slice(0, 3 - picked.length));
  }
  return picked.slice(0, 3);
}
```

---

## §3 心脏健康指数 (0-100)

> **来源**：`backend_requirements_heart.md §4.1`

### §3.1 计算公式

```
heartIndex = 100
  - HRV_penalty       (上限 25)
  - restingHR_penalty (上限 20)
  - AHI_penalty       (上限 15)
  - rhythm_penalty    (上限 25)
  - ECG_event_penalty (上限 15)
```

### §3.2 各惩罚项规则

| 惩罚项 | 测量字段 | 0 分阈值（健康）| 满分阈值（高危） | 计算方式 | 上限 |
|---|---|---|---|---|---|
| HRV 惩罚 | SDNN (ms) | ≥50 | <20 | 线性插值 | 25 |
| 静息心率惩罚 | 整夜最低 HR (bpm) | <60 | >75 | 线性插值 | 20 |
| AHI 惩罚 | 呼吸暂停指数 | <5 | >30 | 阶梯：<5→0；5-15→5；15-30→10；>30→15 | 15 |
| 节律惩罚 | RR 变异系数 % | <5% | >12% | 线性插值 | 25 |
| ECG 事件惩罚 | events 数量 | 0 | 多项 | 每项 +3 | 15 |

### §3.3 等级判定

| value | level | levelLabel |
|---|---|---|
| ≥85 | excellent | 优秀 |
| 60-84 | normal | 正常 |
| <60 | needsAttention | 需要关注 |

### §3.4 伪代码

```javascript
function calcHeartIndex(input) {
  // HRV 惩罚
  const hrvPen = input.hrv >= 50 ? 0
               : input.hrv < 20  ? 25
               : 25 * (50 - input.hrv) / 30;

  // 静息心率惩罚
  const hrPen  = input.restingHR < 60 ? 0
               : input.restingHR > 75 ? 20
               : 20 * (input.restingHR - 60) / 15;

  // AHI 惩罚（阶梯）
  const ahiPen = input.ahi < 5  ? 0
               : input.ahi < 15 ? 5
               : input.ahi < 30 ? 10 : 15;

  // 节律惩罚
  const rrPen  = input.rrCv <= 5  ? 0
               : input.rrCv >= 12 ? 25
               : 25 * (input.rrCv - 5) / 7;

  // ECG 事件惩罚
  const ecgPen = Math.min(15, input.ecgEvents.length * 3);

  const value = Math.max(0, Math.round(100 - hrvPen - hrPen - ahiPen - rrPen - ecgPen));
  const level = value >= 85 ? 'excellent'
              : value >= 60 ? 'normal' : 'needsAttention';
  const levelLabel = { excellent: '优秀', normal: '正常', needsAttention: '需要关注' }[level];
  return { value, level, levelLabel };
}
```

> ❓ **待医学顾问审核**：权重 25/20/15/25/15 是否合理；阈值是否按年龄/性别分层。

### §3.5 指针位置算法

> **触发位置**：心脏健康指数渐变条上的圆点指针 + 顶部等级徽章。
>
> **图中示例**：value≈78-88 → 指针落在蓝色「优秀」端 → 等级标签 ✅ 优秀。

#### 输入

| 字段 | 类型 | 含义 |
|---|---|---|
| `value` | int | §3.1 算出的心脏健康指数 0-100 |

#### 公式

```
pointerLeftPercent = value           // 直接用分数作百分比
```

#### 视觉区间对照（渐变条从左到右）

| value 范围 | 渐变条视觉区域 | 等级文案 |
|---|---|---|
| 0-30 | 红色端「需要关注」 | needsAttention / "需要关注" |
| 30-60 | 红→粉渐变 | needsAttention / "需要关注" |
| 60-75 | 粉→白渐变 | normal / "正常" |
| 75-85 | 白→浅蓝渐变 | normal / "正常" |
| 85-100 | 蓝色端「优秀」 | excellent / "优秀" |

> 等级文案与渐变条视觉**解耦**：等级由 §3.3 阈值（85/60）决定，指针位置纯按 value%。

### §3.6 接口输出结构

```json
{
  "value": 78,
  "level": "normal",
  "levelLabel": "正常",
  "pointerLeftPercent": 78
}
```

前端 wxml 写法（已存在）：

```html
<view class="hi-pointer" style="left: {{heartIndexValue}}%;"></view>
<view class="status-pill normal mini">
  <text class="pill-text">{{heartIndexLevel}}</text>
</view>
```

---

## §4 4 项核心心脏指标等级文案

> **触发位置**：心脏健康指数下方 2×2 指标卡，每张卡显示 `label / value / level`。
>
> **图中示例**：
> - 心率范围 65-72次/分 → "夜间平稳"
> - HRV 33 → "恢复中等偏好"
> - 平均心率 69bpm → "参考45-70bpm"
> - rMSSD 892ms → "参考600-1200ms"
>
> **顺序固定**：`[心率范围, HRV, 平均心率, rMSSD]`，与 wxml `heartCards` 一致。

### §4.1 心率范围 hrRange

#### 输入

| 字段 | 类型 | 含义 | 单位 |
|---|---|---|---|
| `hrMin` | int | 整夜最低心率 | bpm |
| `hrMax` | int | 整夜最高心率 | bpm |

#### 算法

```
rangeWidth = hrMax - hrMin
```

| rangeWidth | level 文案 |
|---|---|
| ≤15 | "夜间平稳" |
| 16-25 | "波动正常" |
| >25 | "波动较大" |

> **异常兜底**：`hrMin<40` 或 `hrMax>110` → level = "波动异常"

#### 输出

```json
{ "key":"hrRange", "label":"心率范围", "value":"65-72次/分", "level":"夜间平稳" }
```

### §4.2 HRV（SDNN）

#### 输入

| 字段 | 类型 | 含义 | 单位 |
|---|---|---|---|
| `hrv` | int | 整夜 SDNN | ms |

#### 算法

| hrv | level 文案 |
|---|---|
| ≥50 | "状态优秀" |
| 30-49 | "恢复中等偏好" ← 图中例（33）|
| 20-29 | "偏低需关注" |
| <20 | "显著偏低" |

#### 输出

```json
{ "key":"hrv", "label":"HRV值", "value":"33", "level":"恢复中等偏好" }
```

### §4.3 平均心率 hrAvg

#### 输入

| 字段 | 类型 | 含义 | 单位 |
|---|---|---|---|
| `hrAvg` | int | 整夜平均心率 | bpm |

#### 算法（参考区间固定为 45-70bpm）

| hrAvg | level 文案 |
|---|---|
| 45-70 | "参考45-70bpm" ← 图中例（69）|
| 40-44 或 71-80 | "略超参考" |
| <40 或 >80 | "显著超出" |

#### 输出

```json
{ "key":"hrAvg", "label":"平均心率", "value":"69bpm", "level":"参考45-70bpm" }
```

### §4.4 rMSSD

#### 输入

| 字段 | 类型 | 含义 | 单位 |
|---|---|---|---|
| `rmssd` | int | rMSSD | ms |

#### 算法（参考区间待医学顾问确认；当前按 mock 数据口径 600-1200ms）

| rmssd | level 文案 |
|---|---|
| 600-1200 | "参考600-1200ms" ← 图中例（892）|
| <600 或 >1200 | "超出参考" |

#### 输出

```json
{ "key":"rmssd", "label":"rMSSD", "value":"892ms", "level":"参考600-1200ms" }
```

> ❓ rMSSD 单位口径未定（mock 892ms vs 临床 15-50ms），上表是按 mock 口径的临时规则，单位确认后需重写。

### §4.5 统一伪代码

```javascript
function genHeartCardsLevel(input) {
  // §4.1 心率范围
  const w = input.hrMax - input.hrMin;
  const hrRangeLevel = (input.hrMin < 40 || input.hrMax > 110) ? '波动异常'
                     : w <= 15 ? '夜间平稳'
                     : w <= 25 ? '波动正常' : '波动较大';

  // §4.2 HRV
  const hrvLevel = input.hrv >= 50 ? '状态优秀'
                 : input.hrv >= 30 ? '恢复中等偏好'
                 : input.hrv >= 20 ? '偏低需关注' : '显著偏低';

  // §4.3 平均心率
  const a = input.hrAvg;
  const hrAvgLevel = (a >= 45 && a <= 70) ? '参考45-70bpm'
                   : (a >= 40 && a <= 80) ? '略超参考' : '显著超出';

  // §4.4 rMSSD
  const r = input.rmssd;
  const rmssdLevel = (r >= 600 && r <= 1200) ? '参考600-1200ms' : '超出参考';

  return [
    { key:'hrRange', label:'心率范围', value:`${input.hrMin}-${input.hrMax}次/分`, level: hrRangeLevel },
    { key:'hrv',     label:'HRV值',   value:`${input.hrv}`,                       level: hrvLevel },
    { key:'hrAvg',   label:'平均心率', value:`${a}bpm`,                            level: hrAvgLevel },
    { key:'rmssd',   label:'rMSSD',   value:`${r}ms`,                             level: rmssdLevel }
  ];
}
```

---

## §5 心率/心动图 文字解读模板

> **来源**：`backend_requirements_heart.md §5`

### §5.1 输出数据结构

```json
"analysis": {
  "headline": {
    "template": "...含{{var}}和{{term:xxx}}的句子...",
    "vars": { "var1": "value1" }
  },
  "bullets": [
    { "text": "...", "vars": {...} }
  ]
}
```

### §5.2 占位符渲染规则

| 占位符 | 前端渲染 |
|---|---|
| `{{var}}` | `<text class="bold">value</text>` 加粗 |
| `{{baseline}}` | `<text class="baseline-pill">value</text>` 胶囊样式 |
| `{{term:xxx}}` | `<text class="tooltip-term" data-term="xxx">` 可点击 |

### §5.3 心率解读 headline 模板池

| 维度 | 触发条件 | 输出 |
|---|---|---|
| matchVerb | `|avgHR - baselineMid| ≤ 3` | "基本吻合" |
| matchVerb | 4-8 | "略有偏移" |
| matchVerb | >8 | "明显偏离" |
| tone | min/max 全在 baseline & HRV≥30 | "良好" |
| tone | 部分越界 | "中等" |
| tone | 多项越界 | "需改善" |

### §5.4 心动图解读模板池

| 触发条件 | headline | bullets |
|---|---|---|
| events 为空 | "心电波形形态规整，「R波」清晰锐利…" | P-QRS-T 协调；R-R 间期变异正常 |
| 仅偶发早搏 | "心电波形整体规整，检出 {{n}} 次早搏…" | 早搏类型 + 风险描述 |
| 高危事件 | "检测到 {{event}}，建议心内科复诊。" | 异常细节 + 风险 + 建议 |

### §5.5 术语 tooltip 词典

| term | definition |
|---|---|
| 交感神经 | 兴奋时心率上升，抑制时心率下降，主要调节睡眠时的心脏活动 |
| R波 | 心搏中最高的尖峰，反映心室收缩力量 |
| pqrst | 心电周期的三个波群：P 波(心房收缩) / QRS 波群(心室收缩) / T 波(心室复极) |
| 窦性心律 | 由窦房结主导的正常心跳节律 |
| rr间期 | 两次心跳之间的时间间隔 |

### §5.6 实现要点

- 模板表存数据库 / 配置中心，可热更
- 算法服务输入：当夜指标 + ECG events → 输出：模板 ID + 变量值
- 前端只做字符串替换 + 术语渲染，**不做医学判断**

---

## §6 呼吸健康

### 完成进度
- [x] §6.1 呼吸健康指数 (0-100) 计算 + 指针位置
- [x] §6.2 呼吸暂停文字解读生成
- [x] §6.3 呼吸频率文字解读生成
- [ ] §6.4 呼吸折叠态状态徽章状态机

---

### §6.1 呼吸健康指数 (0-100) 计算 + 指针位置

> **触发位置**：呼吸健康卡顶部渐变条 + 等级徽章。
>
> **图中示例**：指针指向「优秀」端，等级标签 ✅ 优秀。

#### §6.1.1 输入

| 字段 | 类型 | 含义 | 单位 |
|---|---|---|---|
| `ahi` | float | 呼吸暂停指数 | 次/h |
| `apneaMaxSec` | int | 最长单次暂停 | 秒 |
| `breathAvg` | float | 夜间平均呼吸频率 | 次/分 |
| `breathCv` | float | 呼吸节律变异系数 | % |
| `apneaInDeepRatio` | float | 暂停事件落在深睡阶段的占比 | % |

#### §6.1.2 公式

```
breathIndex = 100 - AHI惩罚 - 最长暂停惩罚 - 呼吸频率惩罚 - 节律惩罚 - 深睡影响惩罚
```

| 惩罚项 | 测量字段 | 计算 | 上限 |
|---|---|---|---|
| AHI 惩罚 | `ahi` | <5→0；5-15→线性 0-25；15-30→25-30；≥30→35 | 35 |
| 最长暂停惩罚 | `apneaMaxSec` | <10→0；10-30→线性 0-15；30-60→15-25；>60→25 | 25 |
| 呼吸频率惩罚 | `breathAvg` | 12-20→0；8-12 或 20-25→线性 0-15；<8 或 >25→20 | 20 |
| 节律惩罚 | `breathCv` | <10%→0；10-20%→线性 0-7；>20%→10 | 10 |
| 深睡影响惩罚 | `apneaInDeepRatio` | <20%→0；20-50%→线性 0-7；>50%→10 | 10 |

#### §6.1.3 等级判定 + 指针位置

| value | level | levelLabel | 指针视觉位置 |
|---|---|---|---|
| ≥85 | excellent | "优秀" | 蓝色端（右侧 85%-100%） |
| 60-84 | normal | "正常" | 中段（60%-85%） |
| <60 | needsAttention | "需要关注" | 红色端（0%-60%） |

**指针位置公式**：`pointerLeftPercent = breathIndex`（直接用分数当百分比，0% 在左 100% 在右）。

#### §6.1.4 伪代码

```javascript
function calcBreathIndex(input) {
  const lerp = (x, x0, x1, y0, y1) => y0 + (y1 - y0) * (x - x0) / (x1 - x0);

  const ahiPen = input.ahi < 5  ? 0
               : input.ahi < 15 ? lerp(input.ahi, 5, 15, 0, 25)
               : input.ahi < 30 ? lerp(input.ahi, 15, 30, 25, 30)
                                : 35;

  const maxPen = input.apneaMaxSec < 10  ? 0
               : input.apneaMaxSec <= 30 ? lerp(input.apneaMaxSec, 10, 30, 0, 15)
               : input.apneaMaxSec <= 60 ? lerp(input.apneaMaxSec, 30, 60, 15, 25)
                                         : 25;

  let ratePen = 0;
  if (input.breathAvg >= 12 && input.breathAvg <= 20)      ratePen = 0;
  else if (input.breathAvg >= 8 && input.breathAvg < 12)   ratePen = lerp(input.breathAvg, 12, 8, 0, 15);
  else if (input.breathAvg > 20 && input.breathAvg <= 25)  ratePen = lerp(input.breathAvg, 20, 25, 0, 15);
  else                                                      ratePen = 20;

  const cvPen = input.breathCv < 10  ? 0
              : input.breathCv <= 20 ? lerp(input.breathCv, 10, 20, 0, 7) : 10;

  const dsPen = input.apneaInDeepRatio < 20  ? 0
              : input.apneaInDeepRatio <= 50 ? lerp(input.apneaInDeepRatio, 20, 50, 0, 7) : 10;

  const value = Math.max(0, Math.round(100 - ahiPen - maxPen - ratePen - cvPen - dsPen));
  const level = value >= 85 ? 'excellent' : value >= 60 ? 'normal' : 'needsAttention';
  const levelLabel = { excellent: '优秀', normal: '正常', needsAttention: '需要关注' }[level];
  return { value, level, levelLabel, pointerLeftPercent: value };
}
```

#### §6.1.5 输出

```json
{
  "value": 88,
  "level": "excellent",
  "levelLabel": "优秀",
  "pointerLeftPercent": 88
}
```

---

### §6.2 呼吸暂停文字解读生成

> **触发位置**：呼吸暂停三项统计卡下方的浅橙色 `analysis-box`。
>
> **图中示例**：
> - headline: 「夜间共记录到 **5次** 呼吸暂停事件，最长持续 **17秒**。」
> - bullet 1: 「同龄健康人群夜间平均呼吸暂停次数为 **3-8 次**，你处于正常区间，AHI 指数约为 1.0，属于轻微范围。」
> - bullet 2: 「最长 17 秒已超过 10 秒观察阈值，单次不构成风险，但若连续 ≥3 天出现 ≥15 秒事件，建议关注睡姿与是否存在轻度气道阻塞。」
> - bullet 3: 「暂停事件未集中出现在深睡阶段，对夜间心脏负荷影响有限，整体呼吸健康表现良好。」

#### §6.2.1 输入

| 字段 | 类型 | 含义 |
|---|---|---|
| `apneaCount` | int | 整夜暂停次数 |
| `apneaMaxSec` | int | 最长暂停秒数 |
| `ahi` | float | AHI 次/h |
| `userAgeGroup` | string | 用户年龄段：`youth`/`adult`/`mid`/`senior` |
| `apneaInDeepRatio` | float | 暂停在深睡占比 % |
| `consecutiveSevereDays` | int | 最近连续出现 ≥15s 暂停事件的天数 |

**同龄人参考区间**（次/夜）：

| 年龄段 | peerRange |
|---|---|
| youth (18-30) | 2-6 |
| adult (30-50) | 3-8 |
| mid (50-65) | 4-10 |
| senior (65+) | 5-12 |

#### §6.2.2 headline 模板（固定结构）

```
"夜间共记录到 {{apneaCount}}次 呼吸暂停事件，最长持续 {{apneaMaxSec}}秒。"
```

#### §6.2.3 bullet 1 模板池（同龄对比 + AHI 分级）

| 触发条件 | 模板 |
|---|---|
| `apneaCount ∈ peerRange 且 ahi<5` | "同龄健康人群夜间平均呼吸暂停次数为 {{peerMin}}-{{peerMax}} 次，你处于正常区间，AHI 指数约为 {{ahi}}，属于轻微范围。" |
| `apneaCount > peerMax 且 ahi<5` | "你 {{apneaCount}} 次略高于同龄健康均值（{{peerMin}}-{{peerMax}} 次），但 AHI {{ahi}} 仍在健康范围。" |
| `5 ≤ ahi < 15` | "AHI {{ahi}} 次/小时已进入轻度呼吸暂停综合征范围，建议密切关注。" |
| `ahi ≥ 15` | "AHI {{ahi}} 次/小时达到中度以上，强烈建议尽快进行睡眠监测确诊。" |

#### §6.2.4 bullet 2 模板池（最长事件 + 连续严重天数）

| 触发条件（自上而下首条命中）| 模板 |
|---|---|
| `consecutiveSevereDays ≥ 3` | "已连续 {{consecutiveSevereDays}} 天出现 ≥15 秒暂停事件，建议尽快进行睡眠监测（PSG/HSAT）。" |
| `apneaMaxSec > 60` | "最长 {{apneaMaxSec}} 秒超过 60 秒高危线，强烈建议睡眠专科排查 OSAS。" |
| `30 < apneaMaxSec ≤ 60` | "最长 {{apneaMaxSec}} 秒超过 30 秒，建议关注睡姿与气道，并尽快进行睡眠监测。" |
| `10 < apneaMaxSec ≤ 30` | "最长 {{apneaMaxSec}} 秒已超过 10 秒观察阈值，单次不构成风险，但若连续 ≥3 天出现 ≥15 秒事件，建议关注睡姿与是否存在轻度气道阻塞。" |
| `apneaMaxSec ≤ 10` | "最长 {{apneaMaxSec}} 秒在 10 秒观察阈值内，未达到风险线。" |

#### §6.2.5 bullet 3 模板池（深睡影响）

| 触发条件 | 模板 |
|---|---|
| `apneaInDeepRatio < 20%` | "暂停事件未集中出现在深睡阶段，对夜间心脏负荷影响有限，整体呼吸健康表现良好。" |
| `20% ≤ apneaInDeepRatio ≤ 50%` | "约 {{ratio}}% 的暂停事件出现在深睡阶段，可能轻度影响心脏夜间恢复。" |
| `apneaInDeepRatio > 50%` | "{{ratio}}% 的暂停事件集中在深睡阶段，对心脏负荷影响较大，建议改善睡眠姿态。" |

#### §6.2.6 实现位置

| 项 | 路径 |
|---|---|
| 算法文件 | `miniprogram/utils/breath_apnea_analysis.js`（新建） |
| 调用入口 | `miniprogram/pages/daily/index.js` |
| 写入字段 | `data.breathApneaAnalysis = { headline, bullets[3] }` |
| wxml 位置 | `pages/daily/index.wxml` L392-L410 |

---

### §6.3 呼吸频率文字解读生成

> **触发位置**：呼吸频率折线图下方的浅蓝色 `analysis-box`。
>
> **图中示例**：
> - headline: 「整夜呼吸频率维持在 **12-19 次/分钟**，平均 **16 次**，处于健康成人参考区间（12-20次/分钟）。」
> - bullet 1: 「曲线整体平稳，未见骤升骤降，提示夜间呼吸节律稳定，气道通畅度良好。」
> - bullet 2: 「凌晨 3-4 点与 7 点出现两次轻度波动，与睡眠周期切换吻合，属于正常生理反应。」

#### §6.3.1 输入

| 字段 | 类型 | 含义 |
|---|---|---|
| `breathSeries` | float[] | 整夜呼吸频率序列（与 wxml `breathingSeries` 对齐，100 点） |
| `breathMin`, `breathMax` | float | 序列最值 |
| `breathAvg` | float | 序列均值 |
| `breathCv` | float | 节律变异系数 % |
| `seriesTimeBase` | string | 序列起点时刻（如 "23:00"） |
| `phaseTransitions` | `{time, fromStage, toStage}[]` | 睡眠周期切换时刻列表 |

#### §6.3.2 headline 模板池

| 触发条件 | 模板 |
|---|---|
| `breathMin ≥ 12 且 breathMax ≤ 20` | "整夜呼吸频率维持在 {{min}}-{{max}} 次/分钟，平均 {{avg}} 次，处于健康成人参考区间（12-20次/分钟）。" |
| `breathAvg ∈ [12,20] 且 (breathMin<12 或 breathMax>20)` | "整夜呼吸频率在 {{min}}-{{max}} 次/分钟波动，平均 {{avg}} 次，部分时段超出健康参考区间（12-20次/分钟）。" |
| `breathAvg < 10 或 breathAvg > 25` | "整夜呼吸频率平均 {{avg}} 次/分钟，超出健康成人参考区间（12-20次/分钟），建议关注。" |

#### §6.3.3 bullet 1 模板池（曲线平稳性）

**预计算**：`spikeCount = 序列中相邻差值 >5 次/分 的点数`

| 触发条件 | 模板 |
|---|---|
| `breathCv < 10% 且 spikeCount = 0` | "曲线整体平稳，未见骤升骤降，提示夜间呼吸节律稳定，气道通畅度良好。" |
| `10% ≤ breathCv < 20% 或 1 ≤ spikeCount ≤ 3` | "曲线整体稳定，有少量轻度波动，节律基本规律。" |
| `breathCv ≥ 20% 或 spikeCount > 3` | "曲线存在多次波动，节律不规则，建议关注气道状态。" |

#### §6.3.4 bullet 2 模板池（波动事件关联）

**预计算步骤**：

1. 滑动窗口（5 个点）检测均值偏离 >3 次/分 的连续区间 → `fluctuationEvents[]`
2. 每个 `event` 取中点时刻 `eventTime`
3. 对每个 `event`，判定是否在某次 `phaseTransition.time ± 10 分钟` 内 → `alignedWithPhase = true/false`
4. 汇总：`alignedCount`、`unalignedCount`

| 触发条件 | 模板 |
|---|---|
| `fluctuationEvents.length = 0` | "全夜呼吸节律均匀，无明显波动事件。" |
| `length ∈ [1,2] 且 alignedCount = length` | "凌晨 {{time1}}{{ ' 与 ' + time2}} 出现{{n中文}}次轻度波动，与睡眠周期切换吻合，属于正常生理反应。" |
| `length ∈ [1,2] 且 unalignedCount ≥ 1` | "凌晨 {{time1}} 出现轻度波动，未与睡眠周期对齐，可能与短暂觉醒有关。" |
| `length ≥ 3` | "整夜出现 {{n}} 次明显波动，建议关注是否存在间歇性气道阻塞。" |

#### §6.3.5 时间格式化

`time` 字段取自 `eventTime`，格式："凌晨 3-4 点" / "凌晨 7 点"，规则：

| eventTime 小时 | 显示 |
|---|---|
| 0-5 | "凌晨 X 点" |
| 5-8 | "清晨 X 点" |
| 跨度 ≥30 分钟 | "凌晨 X-Y 点" |

#### §6.3.6 实现位置

| 项 | 路径 |
|---|---|
| 算法文件 | `miniprogram/utils/breath_rate_analysis.js`（新建） |
| 调用入口 | `miniprogram/pages/daily/index.js` |
| 写入字段 | `data.breathRateAnalysis = { headline, bullets[2] }` |
| wxml 位置 | `pages/daily/index.wxml` L430-L444 |

---

## §7 睡眠健康

### 完成进度
- [ ] §7.1 身体恢复度评分算法
- [ ] §7.2 精神恢复度评分算法
- [ ] §7.3 睡眠循环划分算法
- [ ] §7.4 各循环累计恢复百分比
- [x] §7.5 睡眠分期摘要文案（phaseSummary）
- [x] §7.6 今晚建议入睡 / 起床时间推算
- [ ] §7.7 核心睡眠 5 项等级文案
- [x] §7.8 体动健康文案生成（翻身率 + 集中时段）
- [ ] §7.9 睡眠折叠态状态徽章状态机

---

### §7.5 睡眠分期摘要文案（phaseSummary）

> **触发位置**：每日页面 → 睡眠健康展开 → 🛏️ 睡眠分期标题下方的灰色描述文字。
>
> **示例输出**：`整夜分期节律清晰，深睡与梦境切换有序，恢复效率稳定。`

#### §7.5.1 输入

| 字段 | 类型 | 含义 |
|---|---|---|
| `cyclesCount` | int | 整夜识别出的完整睡眠周期数（每周期含浅睡+深睡+REM） |
| `cycleDurationStdMin` | float | 各周期时长的标准差（min） |
| `abnormalTransitionsCount` | int | 异常切换次数（如深睡→清醒、入睡→REM 等违反正常周期顺序） |
| `deepRatio` | float | 深睡占比 % |
| `remRatio` | float | REM 占比 % |

#### §7.5.2 三分项打分

##### A. 节律分项 `rhythmTag`

```
if cyclesCount ∈ [4, 6] && cycleDurationStdMin < 20:
    rhythmTag = "清晰"
elif cyclesCount ∈ [3, 7] && cycleDurationStdMin < 30:
    rhythmTag = "基本规律"
else:
    rhythmTag = "紊乱"
```

##### B. 切换分项 `transitionTag`

```
if abnormalTransitionsCount == 0:
    transitionTag = "有序"
elif abnormalTransitionsCount <= 2:
    transitionTag = "基本有序"
else:
    transitionTag = "紊乱"
```

##### C. 恢复分项 `recoveryTag`

```
if deepRatio >= 18 && remRatio >= 20:
    recoveryTag = "稳定"
elif deepRatio >= 15 || remRatio >= 15:
    recoveryTag = "中等"
else:
    recoveryTag = "偏低"
```

#### §7.5.3 文案拼装

```
phaseSummary = `整夜分期节律${rhythmTag}，深睡与梦境切换${transitionTag}，恢复效率${recoveryTag}。`
```

#### §7.5.4 输出示例

| 数据状态 | rhythmTag | transitionTag | recoveryTag | 输出 |
|---|---|---|---|---|
| 健康成人 | 清晰 | 有序 | 稳定 | 整夜分期节律清晰，深睡与梦境切换有序，恢复效率稳定。 |
| 轻度片段化 | 基本规律 | 基本有序 | 中等 | 整夜分期节律基本规律，深睡与梦境切换基本有序，恢复效率中等。 |
| 严重失衡 | 紊乱 | 紊乱 | 偏低 | 整夜分期节律紊乱，深睡与梦境切换紊乱，恢复效率偏低。 |

#### §7.5.5 伪代码

```javascript
function buildPhaseSummary({
  cyclesCount, cycleDurationStdMin, abnormalTransitionsCount,
  deepRatio, remRatio
}) {
  const rhythmTag = (cyclesCount >= 4 && cyclesCount <= 6 && cycleDurationStdMin < 20) ? '清晰'
                  : (cyclesCount >= 3 && cyclesCount <= 7 && cycleDurationStdMin < 30) ? '基本规律'
                  : '紊乱';

  const transitionTag = abnormalTransitionsCount === 0 ? '有序'
                      : abnormalTransitionsCount <= 2  ? '基本有序'
                      : '紊乱';

  const recoveryTag = (deepRatio >= 18 && remRatio >= 20) ? '稳定'
                    : (deepRatio >= 15 || remRatio >= 15) ? '中等'
                    : '偏低';

  return `整夜分期节律${rhythmTag}，深睡与梦境切换${transitionTag}，恢复效率${recoveryTag}。`;
}
```

#### §7.5.6 实现位置

- 文件：`miniprogram/utils/sleep_phase_summary.js`（新建）
- 调用入口：`miniprogram/pages/daily/index.js` 的 `computeNightlyHeadline` 或专门的 `computePhaseSummary`
- 输出字段：`data.phaseSummary`

---

### §7.6 今晚建议入睡 / 起床时间推算

> **触发位置**：每日页面 → 睡眠健康展开 → 今晚医学建议 2 项卡片（🌙 建议今晚入睡 + ☀️ 建议明早起床）。
>
> **示例输出**：`建议今晚入睡 22:50（比昨晚提前 25 分钟）`+`建议明早起床 06:30（保证 7h40m 优质睡眠）`

#### §7.6.1 输入数据

**A. 历史睡眠数据（过去 14 天）**

| 字段 | 单位 | 说明 |
|---|---|---|
| `bedTime[i]` | HH:MM | 第 i 天的上床时间 |
| `sleepOnset[i]` | HH:MM | 入睡时间 |
| `wakeTime[i]` | HH:MM | 起床时间 |
| `sleepLatency[i]` | min | 入睡时长 |
| `sleepDuration[i]` | min | 实际睡眠时长 |

**B. 用户档案**

| 字段 | 说明 |
|---|---|
| `age` | 年龄（决定基础睡眠时长） |
| `isWorkdayTomorrow` | 明天是否工作日 |
| `idealWakeTime` | 用户设置的理想起床时间（可选） |

**C. 当日健康风险**（与 §1 的 9 项联动）

| 风险 ID | 状态 | 影响 |
|---|---|---|
| `heart-failure` | yellow/red | 增加目标睡眠时长 |
| `hypertensive-heart-disease` | yellow | 增加目标睡眠时长 |
| `osas` | yellow/red | 增加目标睡眠时长 |
| `scd` | yellow | 增加目标睡眠时长 |

**D. 昨夜实际数据**

| 字段 | 用途 |
|---|---|
| `lastBedTime` | 用于计算调整幅度文案"提前/延后 X 分钟" |
| `lastSleepDuration` | 用于判断是否在补觉 |

#### §7.6.2 输出

```json
{
  "recommendedBedtime": "22:50",
  "recommendedWake": "06:30",
  "recommendedDuration": 460,
  "durationText": "7h40m",
  "deltaFromYesterday": -25,
  "deltaText": "比昨晚提前 25 分钟",
  "wakeText": "保证 7h40m 优质睡眠"
}
```

#### §7.6.3 算法流程（5 步）

##### Step 1 — 计算"目标睡眠时长" `target_duration`

**A. 年龄基准**

| 年龄段 | 基准 (min) |
|---|---|
| 13-17 | 540 (9h) |
| 18-25 | 480 (8h) |
| 26-64 | 450 (7.5h) |
| ≥65 | 420 (7h) |

**B. 健康风险加权**（单日上限 +90min）

| 风险类型 | 加权 (min) |
|---|---|
| 心力衰竭风险 yellow | +30 |
| 心力衰竭风险 red | +45 |
| 高血压风险 yellow | +20 |
| OSAS 风险 yellow | +20 |
| OSAS 风险 red | +30 |
| 心源性猝死预警 yellow | +20 |
| HRV (SDNN) <30ms | +15 |

**C. 睡眠债务补偿**（单日上限 +60min）

```
debt = Σ(过去7天: max(0, 年龄基准 - actualSleepDuration[i]))
debtCompensation = min(60, debt / 7)
```

**D. 对齐到 90 分钟睡眠周期**

```
raw = ageBaseline + healthAdjust + debtCompensation
cycles = round(raw / 90)
cyclesClamped = max(4, min(6, cycles))   // 限制在 4-6 周期之间
targetDuration = cyclesClamped * 90
```

##### Step 2 — 计算推荐起床时间 `recommendedWake`

```
1. 若用户设置了 idealWakeTime → 直接使用
2. 否则取过去 7 天起床时间中位数（工作日/周末分别算）
3. 健康窗口：05:30 - 09:00
4. 若中位数 >09:00：渐进调整，每天最多提前 15min（不低于 09:00）
5. 若中位数 <05:30：调到 05:30（避免极早起）
```

##### Step 3 — 反推推荐入睡时间 `recommendedBedtime`

```
sleepLatency = clamp(median(过去7天入睡时长), 15, 45)  // 15-45 min
sleepOnset   = recommendedWake - targetDuration
bedtime      = sleepOnset - sleepLatency
```

##### Step 4 — 渐进调整（防一夜剧烈改变）

```
delta = recommendedBedtime - lastBedTime（处理跨日）
MAX_SHIFT = 30 min
if abs(delta) > MAX_SHIFT:
    recommendedBedtime = lastBedTime + sign(delta) * MAX_SHIFT
```

##### Step 5 — 文案生成

```
delta = recommendedBedtime - lastBedTime（min）

if delta < -5: deltaText = `比昨晚提前 ${-delta} 分钟`
elif delta > 5: deltaText = `比昨晚延后 ${delta} 分钟`
else:           deltaText = '与昨晚作息一致'

duration = recommendedWake - recommendedBedtime - sleepLatency
durationText = `${Math.floor(duration/60)}h${duration%60}m`
wakeText = `保证 ${durationText} 优质睡眠`
```

#### §7.6.4 完整调用伪代码

```javascript
function recommendTonight(user, history, risks, lastNight) {
  // Step 1: 目标睡眠时长
  const ageBase = ({ '<18': 540, '<26': 480, '<65': 450, '>=65': 420 })[ageBracket(user.age)];
  const healthAdd = Math.min(90, sumHealthAdjust(risks));
  const debtComp = Math.min(60, calcSleepDebt(history, ageBase) / 7);
  const raw = ageBase + healthAdd + debtComp;
  const cycles = Math.max(4, Math.min(6, Math.round(raw / 90)));
  const targetDuration = cycles * 90;

  // Step 2: 起床时间
  let wake;
  if (user.idealWakeTime) wake = user.idealWakeTime;
  else {
    const filtered = history.filter(d => d.isWorkday === user.isWorkdayTomorrow);
    let medianWake = median(filtered.map(d => timeToMin(d.wakeTime)));
    if (medianWake > 9 * 60)  medianWake = Math.max(9 * 60, medianWake - 15);
    if (medianWake < 5.5*60)  medianWake = 5.5 * 60;
    wake = minToTime(medianWake);
  }

  // Step 3: 反推入睡时间
  const latency = Math.max(15, Math.min(45, median(history.slice(0,7).map(d => d.sleepLatency))));
  let bedtime = minToTime((timeToMin(wake) - targetDuration - latency + 1440) % 1440);

  // Step 4: 渐进限制
  bedtime = applyGradualShift(bedtime, lastNight.bedTime, 30);

  // Step 5: 文案
  const deltaMin = timeDelta(bedtime, lastNight.bedTime);
  const durationText = formatDuration(targetDuration);
  return {
    recommendedBedtime: bedtime,
    recommendedWake: wake,
    recommendedDuration: targetDuration,
    durationText,
    deltaFromYesterday: deltaMin,
    deltaText: deltaMin < -5 ? `比昨晚提前 ${-deltaMin} 分钟`
             : deltaMin > 5  ? `比昨晚延后 ${deltaMin} 分钟`
             : '与昨晚作息一致',
    wakeText: `保证 ${durationText} 优质睡眠`
  };
}
```

#### §7.6.5 异常情况处理

| 场景 | 处理 |
|---|---|
| 历史数据 <3 天 | 跳过中位数，冷启动默认 23:00 / 07:00 |
| 用户昨晚熬夜到 02:00 后 | 当天起床可延后 30min（补觉）；明日恢复正常 |
| 跨日（推荐入睡 ≥24:00） | 显示为 `次日 0X:XX` 并标"过晚" |
| 用户长期晨型（≤05:00 起床） | 不强制晚起，提示"建议午间补觉 15-20 分钟" |
| 用户长期夜型（≥10:00 起床） | 渐进调整，每天提前 ≤15min |
| 健康风险为 red 重度 | 推荐时长额外 +15min |

#### §7.6.6 测试用例

| # | 场景 | 输入 | 期望输出 |
|---|---|---|---|
| 1 | 健康年轻 | 19 岁，无风险，平均上床 23:15、起床 07:30 | 起床 07:30，入睡 23:00，"比昨晚提前 15 分钟" |
| 2 | 心衰风险中老年 | 62 岁，心衰 yellow，平均上床 23:00、起床 06:00 | 目标 450min，受渐进限制入睡 22:30 |
| 3 | 累积睡眠债务 | 35 岁，平均仅 6h | 目标 450+60=510min ≈8.5h |
| 4 | 夜型用户 | 28 岁，平均上床 02:00、起床 10:30 | 渐进，目标起床 10:15、入睡 01:15 |

#### §7.6.7 实现位置

- 文件：`miniprogram/utils/sleep_recommendation.js`（新建）+ `miniprogram/utils/time_utils.js`
- 调用入口：`miniprogram/pages/daily/index.js`
- 输出字段：`data.sleepSuggestions[].value` + `data.sleepSuggestions[].sub`

#### §7.6.8 参考文献

- National Sleep Foundation: Recommended Sleep Times by Age (2015)
- AASM/SRS Consensus: Recommended Amount of Sleep for a Healthy Adult (Watson et al., 2015)
- Walker, M. (2017). *Why We Sleep*. 睡眠周期 90 分钟模型
- Trinder J et al. (2001). Autonomic activity during human sleep（HRV ↔ 睡眠质量）

---

### §7.8 体动健康文案生成（翻身率 + 集中时段）

> **触发位置**：每日页面 → 睡眠健康展开 → 🏃 体动健康标题下方的灰色描述文字。
>
> **示例输出**：`体动与翻身节律整体稳定，后半夜翻身略有增加`
>
> **判断维度**：① 翻身率高低（数量层面）+ ② 翻身集中时段（时间分布层面），两维度独立判定后拼成一句话。

#### §7.8.1 输入

| 字段 | 类型 | 含义 | 来源 |
|---|---|---|---|
| `turnoverCount` | int | 整夜翻身总次数 | 厂家接口 |
| `turnoverSeries` | int[] | 翻身时间序列（按时段分桶，如 48 段 × 10min/段，与 wxml 的 `turnoverSeries` 长度一致） | 厂家接口 |
| `sleepDurationHr` | float | 睡眠总时长（小时） | 睡眠分期算法输出 |

#### §7.8.2 维度 ①：翻身率分级（rateLabel）

`turnoverRate = turnoverCount / sleepDurationHr`（单位：次/h）

| 等级 | 阈值 | rateLabel |
|---|---|---|
| 稳定 | <8 次/h | "稳定" |
| 整体稳定 | 8 ≤ rate < 15 | "整体稳定" |
| 偏多 | 15 ≤ rate < 25 | "偏多" |
| 频繁 | ≥25 次/h | "频繁" |

> 健康成人参考：整夜翻身 20-60 次（≈8h），约 2.5-7.5 次/h；本算法把 8/15/25 作为分级线，留出余量。

#### §7.8.3 维度 ②：翻身集中时段（distributionLabel）

把睡眠时长三等分，统计每段翻身占比：

| 段 | 定义 |
|---|---|
| `upperRatio` | 前 1/3 时段翻身数 / `turnoverCount` |
| `midRatio` | 中 1/3 时段翻身数 / `turnoverCount` |
| `lowerRatio` | 后 1/3 时段翻身数 / `turnoverCount` |

判定规则（**自上而下**首条命中即采用）：

| # | 触发条件 | distributionLabel |
|---|---|---|
| 1 | 各段 ∈ [25%, 45%] | "整夜均匀" |
| 2 | `upperRatio + lowerRatio ≥ 70% 且 midRatio < 20%` | "深睡期较稳定，两端略多" |
| 3 | `upperRatio ≥ 50%` | "前半夜翻身较多" |
| 4 | `lowerRatio ≥ 50%` | "后半夜翻身略有增加" |
| 5 | `midRatio ≥ 50%` | "中段翻身较密集" |
| 6 | 默认（未命中以上） | "分布较均匀" |

#### §7.8.4 文案拼装

```
movementSummary = "体动与翻身节律" + rateLabel + "，" + distributionLabel
```

示例：

| 输入 | rateLabel | distributionLabel | 输出 |
|---|---|---|---|
| 12 次 / 8h，后半夜 60% | 整体稳定 | 后半夜翻身略有增加 | "体动与翻身节律整体稳定，后半夜翻身略有增加" ← 图中例子 |
| 5 次 / 8h，均匀 | 稳定 | 整夜均匀 | "体动与翻身节律稳定，整夜均匀" |
| 18 次 / 7h，前半夜 55% | 偏多 | 前半夜翻身较多 | "体动与翻身节律偏多，前半夜翻身较多" |
| 30 次 / 6h，分散 | 频繁 | 分布较均匀 | "体动与翻身节律频繁，分布较均匀" |
| 10 次 / 8h，两端 75% 中段 15% | 整体稳定 | 深睡期较稳定，两端略多 | "体动与翻身节律整体稳定，深睡期较稳定，两端略多" |

#### §7.8.5 伪代码

```javascript
function genMovementSummary(turnoverCount, turnoverSeries, sleepDurationHr) {
  // 维度 ①：翻身率
  const rate = turnoverCount / sleepDurationHr;
  const rateLabel = rate < 8  ? '稳定'
                  : rate < 15 ? '整体稳定'
                  : rate < 25 ? '偏多'
                              : '频繁';

  // 维度 ②：三段统计
  const n = turnoverSeries.length;
  const third = Math.floor(n / 3);
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const upper = sum(turnoverSeries.slice(0, third));
  const mid   = sum(turnoverSeries.slice(third, 2 * third));
  const lower = sum(turnoverSeries.slice(2 * third));
  const total = upper + mid + lower || 1;       // 防 0
  const uR = upper / total, mR = mid / total, lR = lower / total;

  let distributionLabel;
  if (uR >= 0.25 && uR <= 0.45 &&
      mR >= 0.25 && mR <= 0.45 &&
      lR >= 0.25 && lR <= 0.45)              distributionLabel = '整夜均匀';
  else if (uR + lR >= 0.7 && mR < 0.2)       distributionLabel = '深睡期较稳定，两端略多';
  else if (uR >= 0.5)                        distributionLabel = '前半夜翻身较多';
  else if (lR >= 0.5)                        distributionLabel = '后半夜翻身略有增加';
  else if (mR >= 0.5)                        distributionLabel = '中段翻身较密集';
  else                                       distributionLabel = '分布较均匀';

  return `体动与翻身节律${rateLabel}，${distributionLabel}`;
}
```

#### §7.8.6 实现位置

| 项 | 路径 |
|---|---|
| 算法文件 | `miniprogram/utils/movement_summary.js`（新建） |
| 调用入口 | `miniprogram/pages/daily/index.js` → `onLoad` 或 `onShow` |
| 写入字段 | `data.sectionSummaries.movement`（建议新增）；wxml 中 `<view class="sub-title">{{sectionSummaries.movement}}</view>` |
| 当前 wxml 位置 | `pages/daily/index.wxml` L580 |

#### §7.8.7 边界处理

| 场景 | 处理 |
|---|---|
| `turnoverCount = 0` | rateLabel = "稳定"；distributionLabel = "无翻身记录"；返回 "体动与翻身节律稳定，无翻身记录" |
| `sleepDurationHr < 1` | 返回 "数据不足，未生成体动摘要" |
| `turnoverSeries.length < 3` | 跳过维度 ②，仅返回 `"体动与翻身节律" + rateLabel` |
| `total = 0`（series 全 0 但 count > 0） | 维度 ② 退化为 "分布较均匀" |

---

## §8 声音监测（待补充）

待写入：
- [ ] 鼾声/梦话/咳嗽 本地识别模型规格
- [ ] 鼾声严重程度分级（次数+最长时长+占比）
- [ ] 噪音峰值/平均分贝计算窗口
- [ ] 睡眠影响占比算法（声音事件与睡眠分期切换的关联分析）
- [ ] 声音&睡眠联动趋势图数据生成规则
- [ ] 声音折叠态状态徽章状态机

---

## §9 折叠态状态徽章状态机

> 各模块折叠态显示的 ✅/⚠️/🔸 徽章统一状态机。

### §9.1 心脏具体数据

> **触发位置**：心率数据卡标题右侧、心动图卡标题右侧的 `status-pill` 徽章。
>
> **图中示例**：两个徽章均显示 ✅ 未见异常（normal 状态）。

#### §9.1.1 心率数据徽章（hrChart.status）

**输入**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `hrAvg` | int | 整夜平均心率 bpm |
| `hrMax` | int | 整夜最高心率 bpm |
| `hrSurgeDurationMin` | float | 超过 120 bpm 的持续时长（分钟） |
| `hrv` | int | SDNN ms |
| `baselineMin`, `baselineMax` | int | 用户设定的夜间心率参考范围 bpm |

**判定（自上而下首条命中）**：

| status | label | 触发条件 |
|---|---|---|
| risk | "异常" | `hrSurgeDurationMin ≥ 5`（连续超 120bpm ≥5min） |
| warning | "需关注" | `hrAvg > baselineMax + 10` ｜ `hrAvg < baselineMin - 10` ｜ `hrv < 20` |
| normal | "未见异常" | 全部健康（`hrAvg ∈ [baselineMin-10, baselineMax+10]` 且 `hrv ≥ 20` 且 `hrSurgeDurationMin < 5`） ← 图中例 |

#### §9.1.2 心动图徽章（ecg.status）

**输入**：

| 字段 | 类型 | 含义 |
|---|---|---|
| `ecgEvents` | string[] | 异常事件数组（来自厂家 / 我方信号处理） |
| `pvcPerHour` | int | 室性早搏频次/h |

**事件分级**：

| 级别 | 包含事件 |
|---|---|
| 高危（risk） | `st_elevation` / `vt`（室速） / `r_on_t` / `long_rr`（停搏 >2s） |
| 低危（warning） | `early_beat` / `missed_beat`（偶发早搏漏搏） |

**判定（自上而下首条命中）**：

| status | label | 触发条件 |
|---|---|---|
| risk | "需复诊" | `ecgEvents` 含任一高危事件 |
| warning | "偶有早搏" | `ecgEvents` 仅含低危事件 ｜ `1 ≤ pvcPerHour ≤ 10` |
| normal | "未见异常" | `ecgEvents = []` 且 `pvcPerHour = 0` ← 图中例 |
| unknown | "数据不足" | ECG 未采集到或时长 <30s |

#### §9.1.3 折叠态主卡的整体染色（可选）

主卡折叠态在状态行同时显示两个徽章。主卡整体颜色（如顶部色条）取**两者中严重度较高**：

```
mainStatus = max(hrChart.status, ecg.status)
// 严重度：risk > warning > normal > unknown
```

#### §9.1.4 统一伪代码

```javascript
function genHeartBadges(input) {
  // 心率徽章
  let hrStatus, hrLabel;
  if (input.hrSurgeDurationMin >= 5) {
    hrStatus = 'risk'; hrLabel = '异常';
  } else if (input.hrAvg > input.baselineMax + 10
          || input.hrAvg < input.baselineMin - 10
          || input.hrv < 20) {
    hrStatus = 'warning'; hrLabel = '需关注';
  } else {
    hrStatus = 'normal'; hrLabel = '未见异常';
  }

  // 心动图徽章
  const HIGH = ['st_elevation','vt','r_on_t','long_rr'];
  const LOW  = ['early_beat','missed_beat'];
  let ecgStatus, ecgLabel;
  if (!input.ecgEvents) {
    ecgStatus = 'unknown'; ecgLabel = '数据不足';
  } else if (input.ecgEvents.some(e => HIGH.includes(e))) {
    ecgStatus = 'risk'; ecgLabel = '需复诊';
  } else if (input.ecgEvents.some(e => LOW.includes(e))
          || (input.pvcPerHour >= 1 && input.pvcPerHour <= 10)) {
    ecgStatus = 'warning'; ecgLabel = '偶有早搏';
  } else {
    ecgStatus = 'normal'; ecgLabel = '未见异常';
  }

  return {
    hrChart: { status: hrStatus, label: hrLabel },
    ecg:     { status: ecgStatus, label: ecgLabel }
  };
}
```

### §9.2 呼吸健康 / 睡眠健康 / 声音监测

> 待补充，统一采用 normal/warning/risk 三档 + 简短 label。

### §9.3 颜色映射

| status | UI 样式 class |
|---|---|
| normal | `status-pill normal` ✅ 绿 |
| warning | `status-pill warning` ⚠️ 黄 |
| risk | `status-pill orange` 🔸 橙/红 |
| unknown | `status-pill gray` 灰（"数据不足"）|

---

## 待决策开放问题汇总

| # | 章节 | 问题 |
|---|---|---|
| Q1 | §1 | R3/R5/R6/R7/R8 强依赖厂家 ECG events，若不提供这 5 项是否恒返 unknown? |
| Q2 | §1 | 9 项阈值是否按年龄/性别/既往病史分层？ |
| Q3 | §2 | 建议库是否允许用户屏蔽某条？ |
| Q4 | §2 | 红色风险是否弹窗+推送强提醒？ |
| Q5 | §3 | 心脏健康指数权重 25/20/15/25/15 是否合理？ |
| Q6 | §4 | rMSSD 单位口径（mock 892ms vs 临床 15-50ms）？ |
| Q7 | §5 | 文字解读走 LLM 还是模板池？ |

---

## 修订记录

| 日期 | 版本 | 内容 | 责任人 |
|---|---|---|---|
| 2026-05-31 | v0.1 | 初始版本：心脏健康总览 §1 §2 + 心脏具体数据 §3 §4 §5 + §9 心脏部分 | — |
