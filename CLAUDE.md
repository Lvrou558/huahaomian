# 话好眠 — 睡眠健康微信小程序

## 项目概览

**话好眠**是一款基于微信云开发的睡眠健康监测小程序，提供每日睡眠报告、长期趋势分析、睡眠建议与用户中心功能。

- AppID: `wx399b0d556538592e`
- 小程序根目录: `miniprogram/`
- 云函数根目录: `cloudfunctions/`
- 微信基础库版本: 2.20.1

## 页面结构

| 路径 | Tab 标题 | 功能 |
|---|---|---|
| `pages/daily/index` | 每日 | 当日睡眠详情报告（睡眠分期、呼吸、心率、体动、声音） |
| `pages/longterm/index` | 长期 | 多维度睡眠趋势折线图 |
| `pages/advice/index` | 建议 | 睡眠风险评估与改善建议 |
| `pages/my/index` | 我的 | 用户中心 |
| `pages/temple/index` | — | 导航辅助页（从每日页跳转） |

## 技术要点

### 图表渲染
所有图表使用 **微信 Canvas 2D API** 原生绘制，无第三方图表库：
- `wx.createSelectorQuery()` → `.fields({ node: true, size: true })` 获取 canvas node
- 必须在 `onReady()` 之后才能绘制（DOM 已就绪）
- 需支持 DPR 缩放：`canvas.width = width * dpr; ctx.scale(dpr, dpr)`
- Toggle 显示/隐藏面板后需在回调中重新调用对应 draw 函数

### 云函数
`cloudfunctions/quickstartFunctions/index.js` 使用 `wx-server-sdk`，以 `event.type` 字段作为路由分发：
- `getOpenId` / `getMiniProgramCode` / `createCollection`
- `selectRecord` / `updateRecord` / `insertRecord` / `deleteRecord`（操作 `sales` 集合，示例数据）

### 数据状态
当前页面数据**全部为硬编码 mock 数据**，尚未接入真实设备或云数据库。

## 视觉规范

- 主题色（选中/强调）：`#1F8A6F`
- Tab/文字次要色：`#7B928C`
- 页面背景：`#F4FBF9`
- Tab bar 背景：`#FFFFFF`，边框样式：`white`
- 深睡颜色：`#00a6a0`，浅睡：`#71bfd1`，REM：`#b15dff`，清醒：`#cfd9e8`

## 代码规范

- 缩进：2 个空格（insertSpaces）
- 语言：JavaScript（ES6+），无 TypeScript
- 小程序端**不使用** npm 包（`nodeModules: false`）
- 注释语言：中文

## 常用命令

```bash
# 上传云函数（需安装微信开发者工具 CLI）
bash uploadCloudFunction.sh
```

在**微信开发者工具**中打开项目根目录进行开发与预览。
