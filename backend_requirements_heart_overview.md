# 话好眠 · 每日页 · 心脏健康总览板块 需求文档

> **板块定位**：每日页顶部「心脏健康总览」卡片。固定 9 项心肺风险评估 + 3 条今日打卡建议。
>
> **本文档范围**：仅算法（9 项风险判定 + 建议推荐逻辑）+ 建议库，不含 UI 字段表（UI 字段在板块总文档里写）。
>
> **关联代码**：`miniprogram/pages/daily/index.wxml` L54-L174、`index.js` L222-L446。

---

## 1. 9 项风险总览

**固定 9 项**，不动态增减。每项每日产出一个 `status ∈ {red, yellow, green}` 和一句话 summary。

| # | 风险名 | 紧急度 | 主要输入指标 | 默认状态(健康人) |
|---|---|---|---|---|
| R1 | 高血压风险 | 慢 | 静息心率、HRV、心率回落、14 天均值心率 | 🟢 |
| R2 | 心脏负荷评估 | 慢 | 静息心率、HRV、翻身次数、深睡比例 | 🟢 |
| R3 | 心电图异常 | 急 | ECG events、HRV、QT 间期 | 🟢 |
| R4 | 睡眠呼吸暂停风险 | 急·慢 | AHI、最长暂停、鼾声次数、最长鼾声 | 🟢 |
| R5 | 房颤风险评估 | 急·慢 | P 波识别、R-R 变异系数、突发心率事件 | 🟢 |
| R6 | 冠心病风险 | 急·慢 | ST 段、T 波形态、夜间心率回落 | 🟢 |
| R7 | 房室传导异常 | 急·慢 | PR 间期、QRS 时限、最低心率、长 R-R | 🟢 |
| R8 | 室性早搏风险 | 急·慢 | PVC 频次、PAC 频次、成对/连发、R on T | 🟢 |
| R9 | 慢阻肺风险 | 慢 | 呼吸频率均值/范围、节律变异、夜间咳嗽 | 🟢 |

> **数据来源依赖**：R3/R5/R6/R7/R8 全部依赖厂家 ECG 结构化字段。**若厂家只给波形而无 events**，这 5 项需后端自建信号处理，否则只能恒返 🟢，失去筛查意义。

---

## 2. 9 项风险算法（统一格式）

> **判定原则**：每项给出 3 档阈值表。同一风险中**满足任一红线 = 红**，**满足任一黄线 = 黄**，**全部健康 = 绿**。
>
> **降级保护**：若关键指标缺失（如该夜未采到 ECG），该项返回 `status: "unknown"`，UI 显示 "数据不足"。

### R1 高血压风险

**输入字段**（5 项）：

| 字段 | 来源 | 说明 |
|---|---|---|
| `restingHR` | 当夜整夜最低 HR（持续 5 分钟以上的最低值） | bpm |
| `hrv` | 当夜 SDNN | ms |
| `hrDipping` | (入睡时 HR - 最低 HR) / 入睡时 HR × 100% | % |
| `hr14dAvg` | 14 天均值心率 | bpm |
| `hrAvgNight` | 当夜均值心率 | bpm |

**判定阈值**：

| 状态 | 触发条件（满足任一即触发） |
|---|---|
| 🔴 红 | `restingHR ≥ 75` 持续 ≥7 天连续 ｜ `hrv < 20 且 hrDipping < 5%` |
| 🟡 黄 | `70 ≤ restingHR < 75` ｜ `20 ≤ hrv < 30` ｜ `5% ≤ hrDipping < 10%` |
| 🟢 绿 | `restingHR < 70 且 hrv ≥ 30 且 hrDipping ≥ 10%` |

**输出 summary 模板**：

| 状态 | 模板 |
|---|---|
| 🔴 红 | "静息心率持续 {{restingHR}} bpm + HRV 显著偏低，长期血压负荷高" |
| 🟡 黄 | "静息心率接近上限 + HRV 偏低，提示长期血压负荷" |
| 🟢 绿 | "心率回落 {{hrDipping}}% 良好，未见血压负荷信号" |

---

### R2 心脏负荷评估

**输入字段**：

| 字段 | 来源 |
|---|---|
| `restingHR` | 同 R1 |
| `hrv` | 同 R1 |
| `turnoverCount` | 整夜翻身次数 |
| `deepRatio` | 深睡占比 % |
| `ahi` | 呼吸暂停指数（跨模块） |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `restingHR > 75 且 hrv < 20 且 turnoverCount > 100` |
| 🟡 黄 | `restingHR > 70` ｜ `hrv < 30` ｜ `turnoverCount > 60` ｜ `deepRatio < 15%` |
| 🟢 绿 | 均健康 |

**summary**：

| 状态 | 模板 |
|---|---|
| 🟡 黄 | "夜间负荷偏高 + HRV 偏低 + 睡眠片段化" |
| 🟢 绿 | "心脏负荷在合理区间，恢复充分" |

---

### R3 心电图异常

**输入字段**：

| 字段 | 来源 |
|---|---|
| `ecgEvents` | 异常事件数组：`["st_elevation"\|"st_depression"\|"early_beat"\|"missed_beat"\|"long_rr"\|"vt"\|"r_on_t"]` |
| `hrv` | 同 R1 |
| `qtInterval` | QT 间期 ms |
| `pvcPerHour` | 室性早搏频次（与 R8 共用） |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `ecgEvents 含 st_elevation/vt/r_on_t/long_rr` ｜ `qtInterval > 450ms` |
| 🟡 黄 | `20 ≤ hrv < 30` ｜ `1 ≤ pvcPerHour ≤ 10` ｜ `qtInterval ∈ [430, 450]` |
| 🟢 绿 | `ecgEvents = []` 且 `hrv ≥ 30` 且 `qtInterval < 430` |

---

### R4 睡眠呼吸暂停风险

**输入字段**：

| 字段 | 来源 |
|---|---|
| `ahi` | 呼吸暂停指数 |
| `apneaMaxSec` | 最长单次暂停秒数 |
| `snoreCount` | 鼾声次数 |
| `snoreMaxSec` | 最长鼾声秒数 |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `ahi ≥ 15` ｜ `apneaMaxSec > 30` |
| 🟡 黄 | `5 ≤ ahi < 15` ｜ `10 < apneaMaxSec ≤ 30` ｜ `snoreCount ≥ 3` ｜ `snoreMaxSec > 10` |
| 🟢 绿 | `ahi < 5 且 apneaMaxSec ≤ 10 且 snoreCount < 3` |

---

### R5 房颤风险评估

**输入字段**：

| 字段 | 来源 |
|---|---|
| `pWavePresent` | P 波是否清晰：`clear`/`weak`/`absent` |
| `rrCv` | R-R 间期变异系数 % |
| `hrSurgeCount` | 突发心率事件数（>120bpm 持续 ≥30s 的次数） |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `pWavePresent = absent` 且 `rrCv > 20%` 且 `hrSurgeCount ≥ 1` |
| 🟡 黄 | `pWavePresent = weak` ｜ `12% < rrCv ≤ 20%` ｜ `hrSurgeCount ≥ 1` |
| 🟢 绿 | `pWavePresent = clear 且 rrCv ≤ 12% 且 hrSurgeCount = 0` |

---

### R6 冠心病风险

**输入字段**：

| 字段 | 来源 |
|---|---|
| `stDeviationMv` | ST 段偏移 mV（正抬高/负压低，整夜最值） |
| `stEventDurationSec` | ST 偏移持续时间秒 |
| `tWaveShape` | T 波形态：`upright`/`flat`/`inverted` |
| `hrDipping` | 同 R1 |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `stDeviationMv ≥ 0.1mV 且 stEventDurationSec ≥ 60` ｜ `stDeviationMv ≤ -0.05mV 且 stEventDurationSec ≥ 60` |
| 🟡 黄 | `tWaveShape ∈ {flat, inverted}` ｜ `hrDipping < 10%` |
| 🟢 绿 | `stDeviationMv 在 (-0.05, 0.1)mV 且 tWaveShape = upright 且 hrDipping ≥ 10%` |

---

### R7 房室传导异常

**输入字段**：

| 字段 | 来源 |
|---|---|
| `prInterval` | PR 间期 ms |
| `qrsDuration` | QRS 时限 ms |
| `hrMin` | 整夜最低心率 bpm |
| `longRrCount` | 长 R-R 间期（>2s 停搏）次数 |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `qrsDuration ≥ 120` ｜ `longRrCount ≥ 1` |
| 🟡 黄 | `prInterval > 200` ｜ `hrMin < 45` |
| 🟢 绿 | `prInterval ∈ [120, 200] 且 qrsDuration < 120 且 hrMin ≥ 50 且 longRrCount = 0` |

---

### R8 室性早搏风险

**输入字段**：

| 字段 | 来源 |
|---|---|
| `pvcPerHour` | 室性早搏频次/h |
| `pacPerHour` | 房性早搏频次/h |
| `coupletPresent` | 是否出现成对/连发室早 |
| `rOnTPresent` | 是否出现 R on T 现象 |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `pvcPerHour > 10`（Lown II 级以上） ｜ `coupletPresent = true` ｜ `rOnTPresent = true` |
| 🟡 黄 | `1 ≤ pvcPerHour ≤ 10` ｜ `pacPerHour > 5` |
| 🟢 绿 | `pvcPerHour = 0 且 pacPerHour ≤ 5 且 coupletPresent = false 且 rOnTPresent = false` |

---

### R9 慢阻肺风险

**输入字段**：

| 字段 | 来源 |
|---|---|
| `breathAvg` | 夜间平均呼吸频率 次/分 |
| `breathMin`, `breathMax` | 夜间呼吸频率范围 |
| `breathCv` | 呼吸节律变异系数 % |
| `coughCount` | 夜间咳嗽次数 |

**判定**：

| 状态 | 触发条件 |
|---|---|
| 🔴 红 | `breathAvg < 10` ｜ `breathAvg > 25` ｜ `coughCount ≥ 5` |
| 🟡 黄 | `breathMin < 12` ｜ `breathMax > 20` ｜ `breathCv > 20%` ｜ `3 ≤ coughCount < 5` |
| 🟢 绿 | `12 ≤ breathAvg ≤ 20 且 breathCv ≤ 20% 且 coughCount < 3` |

---

## 3. 风险输出格式（统一结构）

每项风险接口输出：

```json
{
  "id": "R1",
  "name": "高血压风险",
  "status": "yellow",           // red/yellow/green/unknown
  "summary": "静息心率接近上限 + HRV 偏低，提示长期血压负荷",
  "diseaseTags": ["原发性高血压", "继发性高血压", "高血压性心脏病", ...],
  "dataPoints": [               // 量化依据，4 行
    { "label": "静息心率", "value": "69bpm", "ref": "警戒 >70 持续", "status": "border" },
    { "label": "HRV (SDNN)", "value": "33ms", "ref": "正常 >50ms", "status": "low" },
    { "label": "夜间心率回落", "value": "20%", "ref": "正常 ≥10%（杓型）", "status": "ok" },
    { "label": "14 天均值心率", "value": "70bpm", "ref": "健康 60-70bpm", "status": "ok" }
  ],
  "suggestionIds": ["s01", "s02", "s03", "s04"]   // 该风险关联建议库 ID
}
```

**关联疾病标签**（diseaseTags）建议沉淀到配置表，按风险 ID 固定映射，前端展示前 4-6 个。

---

## 4. 建议库（20 条）

> 每条建议是**当日可执行的具体动作**，配 ID、emoji、副标题、时段、关联风险、维度。
>
> 维度分类：饮食 / 运动 / 行为 / 睡眠 / 监测 / 环境。

| ID | 建议 | 副标题（执行细节） | emoji | 时段 | 维度 | 关联风险 |
|---|---|---|---|---|---|---|
| s01 | 饭后散步 15 分钟 | 降低静息心率 | 🚶 | 白天 | 运动 | R1, R2 |
| s02 | 每日盐摄入 <5g | 约一啤酒瓶盖 | 🧂 | 全天 | 饮食 | R1, R2 |
| s03 | 每周 3 次 30 分钟有氧 | 快走/游泳/骑行任选 | 🏃 | 白天 | 运动 | R1, R2, R6 |
| s04 | 早晚血压日记 | 目标 <130/80 mmHg | 📒 | 全天 | 监测 | R1, R6 |
| s05 | 戒烟限酒 | 每周酒精摄入 <100g | 🚭 | 全天 | 行为 | R3, R6, R8 |
| s06 | 下午 3 点后不喝咖啡/浓茶 | 稳定夜间心率 | ☕ | 白天 | 行为 | R3, R8 |
| s07 | 23:00 前入睡 | 避免熬夜诱发心律失常 | 🛏️ | 晚上 | 睡眠 | R3, R5, R8 |
| s08 | 每年体检含静息心电+颈动脉超声 | 早期发现冠心病 | 🏥 | 年度 | 监测 | R5, R6 |
| s09 | 低脂饮食 | 红肉 <2 次/周，多深海鱼 | 🥗 | 全天 | 饮食 | R1, R6 |
| s10 | 心悸/胸闷立即记录到 App | 帮助医生回溯诊断 | 📝 | 突发 | 监测 | R3, R5, R6 |
| s11 | 侧卧位睡姿 | 可减 30-50% 暂停事件 | 😴 | 晚上 | 睡眠 | R4 |
| s12 | 睡前 3 小时不喝酒 | 避免气道塌陷加重 | 🚱 | 晚上 | 行为 | R4 |
| s13 | 控制体重 BMI<24 | 减少颈围与心脏前负荷 | ⚖️ | 全天 | 行为 | R2, R4 |
| s14 | 床头抬高 10-15 cm | 减轻夜间气道阻塞 | 🛌 | 晚上 | 环境 | R4 |
| s15 | 睡前 5 分钟腹式呼吸 | 吸 4 秒·屏 4 秒·呼 6 秒 | 🌬️ | 晚上 | 行为 | R2, R3, R5 |
| s16 | 每日冥想 10 分钟 | 降低交感神经张力 | 🧘 | 白天 | 行为 | R1, R3 |
| s17 | 晨光晒太阳 20 分钟 | 调节生物钟 + 提升 HRV | ☀️ | 白天 | 行为 | R2, R5 |
| s18 | 卧室湿度 40-60% + 通风 | 保护气道黏膜 | 💨 | 晚上 | 环境 | R4, R9 |
| s19 | 远离二手烟/雾霾戴口罩 | 长期保护气道 | 😷 | 全天 | 环境 | R9 |
| s20 | 睡前 1 小时关闭电子设备 | 减少蓝光，加深深睡 | 📵 | 晚上 | 睡眠 | R2, R7 |

---

## 5. 推荐算法

### 5.1 输入

| 输入 | 来源 |
|---|---|
| 9 项风险 `status` | 当日风险评估结果 |
| 最近 7 天打卡推过的建议 ID | 用户打卡历史表 |
| 最近 30 天打卡完成率 | 用户打卡历史表 |
| 当前日期 | 系统时间 |

### 5.2 打分公式

对每条建议 `s` 计算：

```
score(s) = riskScore(s) × fatigueFactor(s) × engagementBonus
```

#### riskScore：风险权重累加

```
riskScore(s) = Σ over r in s.关联风险:
    r.status == "red"    → +5
    r.status == "yellow" → +2
    r.status == "green"  → +0.3
    r.status == "unknown"→ +0
```

#### fatigueFactor：避免最近重复推

```
最近 7 天推过 0 次 → 1.0
最近 7 天推过 1 次 → 0.8
最近 7 天推过 2 次 → 0.5
最近 7 天推过 ≥3 次 → 0.2
```

#### engagementBonus：奖励高完成率用户

```
30 天打卡完成率 ≥ 60% → 1.2
30 天打卡完成率 < 60% → 1.0
新用户（无历史） → 1.0
```

### 5.3 选 Top-3 的约束规则（按顺序应用）

| # | 约束 | 说明 |
|---|---|---|
| 1 | 按 score 降序排序 | 取候选池 |
| 2 | 同维度去重 | 同一维度（饮食/运动/...）最多选 1 条 |
| 3 | 时段多样性 | 3 条至少覆盖 2 个不同时段（白天+晚上 优先） |
| 4 | 突发类只在有触发时推 | 时段=`突发` 的（如 s10）仅当关联风险有红/黄才进候选 |
| 5 | 年度类不入日推 | 时段=`年度` 的（s08）每月最多推 1 次 |
| 6 | 选完 3 条返回 | 不足 3 条用冷启动列表补齐 |

### 5.4 冷启动（新用户首次 / 完全无风险触发）

```
默认推：[s15 腹式呼吸, s01 饭后散步, s06 不喝咖啡]
```

理由：3 条均为低门槛、普适、无副作用，且覆盖晚/白天 2 个时段、行为/运动/饮食 3 个维度。

### 5.5 算法伪代码

```javascript
function recommendDailyCheckins(userId, today) {
  const risks = getRiskAssessments(userId, today);        // 9 项
  const recent7d = getRecentSuggestions(userId, 7);       // ID 列表
  const completionRate = getCompletionRate(userId, 30);
  const bonus = completionRate >= 0.6 ? 1.2 : 1.0;

  // 1. 全库打分
  const scored = SUGGESTION_LIB.map(s => {
    const riskScore = s.relatedRisks.reduce((sum, rid) => {
      const r = risks.find(x => x.id === rid);
      return sum + ({ red:5, yellow:2, green:0.3, unknown:0 }[r.status]);
    }, 0);

    const recentCount = recent7d.filter(id => id === s.id).length;
    const fatigue = [1.0, 0.8, 0.5, 0.2, 0.2][Math.min(recentCount, 4)];

    return { ...s, score: riskScore * fatigue * bonus };
  });

  // 2. 过滤突发/年度类
  const eligible = scored.filter(s => {
    if (s.timing === '突发') {
      return s.relatedRisks.some(rid => {
        const r = risks.find(x => x.id === rid);
        return r.status === 'red' || r.status === 'yellow';
      });
    }
    if (s.timing === '年度') {
      return !pushedThisMonth(userId, s.id);
    }
    return true;
  });

  // 3. 按 score 降序 + 同维度去重 + 时段多样性
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

  // 4. 时段多样性检查：若 3 条全集中在 1 个时段，替换最后 1 条
  if (usedTimings.size < 2 && picked.length === 3) {
    const otherTimingPool = eligible.filter(s =>
      !picked.includes(s) && !usedTimings.has(s.timing));
    if (otherTimingPool[0]) picked[2] = otherTimingPool[0];
  }

  // 5. 冷启动补齐
  if (picked.length < 3) {
    const fallback = ['s15', 's01', 's06']
      .filter(id => !picked.find(s => s.id === id))
      .map(id => SUGGESTION_LIB.find(s => s.id === id));
    picked.push(...fallback.slice(0, 3 - picked.length));
  }

  return picked.slice(0, 3);
}
```

---

## 6. 数据存储

| 表 | 关键字段 | 用途 |
|---|---|---|
| `heart_risks_daily` | openId, date, R1-R9 各自 status/dataPoints/summary | 每日风险评估快照 |
| `risk_disease_dict` | riskId, diseaseTags[] | 9 项风险关联疾病配置 |
| `suggestion_lib` | id, title, sub, emoji, timing, dimension, relatedRisks[], active | 20 条建议库（可后台增删） |
| `checkin_daily` | openId, date, recommendedIds[3], checkedIds[] | 用户每日打卡记录 |
| `risk_threshold_config` | riskId, thresholds(json), version | 9 项阈值参数化，便于医学顾问调整 |

---

## 7. 接口设计

### 7.1 `POST /daily/heart-overview`

请求：
```json
{ "openId": "oXXXX", "date": "2026-05-31" }
```

响应：
```json
{
  "code": 0,
  "data": {
    "date": "2026-05-31",
    "risks": [
      { "id":"R1", "name":"高血压风险", "status":"yellow", "summary":"...", "diseaseTags":[...], "dataPoints":[...], "suggestionIds":[...] },
      // ... R2 - R9
    ],
    "todayCheckIns": [
      { "id":"s01", "emoji":"🚶", "title":"饭后散步 15 分钟", "sub":"...", "checked":false },
      { "id":"s15", "emoji":"🌬️", "title":"睡前 5 分钟腹式呼吸", "sub":"...", "checked":false },
      { "id":"s06", "emoji":"☕", "title":"下午 3 点后不喝咖啡/浓茶", "sub":"...", "checked":false }
    ]
  }
}
```

### 7.2 `POST /daily/checkin/toggle`

请求：
```json
{ "openId":"oXXXX", "date":"2026-05-31", "suggestionId":"s01", "checked":true }
```

响应：
```json
{ "code":0, "data":{ "checkedIds":["s01"] } }
```

---

## 8. 待决策开放问题

| # | 问题 | 影响 | 决策方 |
|---|---|---|---|
| Q1 | R3/R5/R6/R7/R8 强依赖厂家 ECG events，若厂家不提供，5 项是否暂时恒返 unknown? | 这 5 项 UI 体验 | 厂家对接 + 产品 |
| Q2 | 红色风险是否需要弹窗强提醒 + 推送通知？ | 用户感受 + 推送频次 | 产品 |
| Q3 | 9 项阈值是否按年龄/性别/是否有既往病史分层？ | 算法复杂度 | 医学顾问 |
| Q4 | 建议库是否允许用户手动"屏蔽"某条（如不喝咖啡的人）？ | 推荐算法增加用户偏好维度 | 产品 |
| Q5 | 打卡完成后是否给即时反馈（心脏健康指数+0.5？连续天数勋章？）| 用户粘性 | 产品 |
| Q6 | 突发类建议（s10）是否改为常驻在风险卡内，而非进入今日打卡 | 推荐逻辑简化 | 产品 |
| Q7 | "正常项目"折叠卡里的绿色项排序逻辑：按 R5-R9 ID 顺序，还是按当晚指标好坏？ | UI 顺序 | 产品 |

---

## 9. 验收清单

| # | 验收项 |
|---|---|
| 1 | 接口固定返回 9 项风险，顺序与 §1 一致 |
| 2 | 9 项风险各自阈值与 §2 完全一致，可通过 mock 数据回归测试 |
| 3 | 每项 dataPoints 数量固定 4 项（与 wxml 渲染期望一致） |
| 4 | 推荐算法每日返回 3 条不同维度的建议 |
| 5 | 冷启动用户首次打开返回 [s15, s01, s06] |
| 6 | 关键指标缺失时返回 `unknown` 状态，UI 兜底"数据不足" |
| 7 | 同一建议 7 天内不会连续推 ≥3 次 |
| 8 | 打卡接口幂等（重复 toggle 不重复计数） |
| 9 | 阈值配置变更（`risk_threshold_config`）无需重启即可生效 |
