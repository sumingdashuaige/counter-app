# 计数器 v2：卡片墙重构设计文档

- 日期：2026-08-14
- 状态：待用户审阅
- 范围：CounterAppExpo（Expo SDK 54 / RN 0.81 / expo-router 6）
- 目标：解决"功能太少太单调太简单"，定位为**不断演进的通用多计数器工具**

## 1. 背景与目标

现状：单计数器页面，±1/长按连加、清零存历史、历史记录页、标题编辑、深色模式。
痛点：一次只能看/用一个计数器；长按连加每 80ms 写一次 AsyncStorage（性能坑）；无备份能力。

用户已确认的方向（2026-08-14 访谈）：
1. **多计数器管理**：多个独立计数器，各自命名/步长/数值
2. **操作体验**：自定义步长、数字动画、触觉反馈、快速加减
3. **数据能力**：本地 JSON 导入导出（零后端）
4. **硬性约束：性能至上**
5. **原功能全部保留**：历史记录页（恢复/删除清零记录）、标题编辑、深色模式、长按连加连减
6. **排序**：按主流习惯——最近使用自动置顶（零维护）

## 2. 非目标（本期不做）

- 云同步 / 账号体系
- 统计图表 / 打卡日历（卡片字段已预留扩展位）
- 目标进度、完整主题定制系统（本期仅做深浅色手动切换）
- 多端实时同步

## 3. 数据模型与存储

### 3.1 模型

```ts
interface Counter {
  id: string;          // Date.now() + 随机后缀
  name: string;        // 默认 "计数器 N"
  value: number;       // 当前值
  step: number;        // 步长，默认 1，可选 1/2/5/10/自定义
  createdAt: number;   // 毫秒时间戳
  lastUsedAt: number;  // 最近使用时间（排序依据）
  history: ClearRecord[]; // 该计数器的清零记录（保留原功能）
}

interface ClearRecord {
  id: string;
  count: number;       // 清零前的值
  time: string;        // ISO 时间
}
```

### 3.2 存储策略（性能核心）

- **单 key 存储**：AsyncStorage 一个 key `counters_v2` 存全部（替换现有 `counter_value`/`counter_title`/`counter_history` 三个 key）；另设 `theme_mode` key（`'system' | 'light' | 'dark'`，默认 `'system'`）
- **一次性 I/O**：启动只读一次；写入路径 = 内存即时更新 + **500ms 防抖落盘** + 页面失焦/卸载时强制 flush
- **长按连加路径零持久化调用**：80ms 定时器只改内存，绝不触盘（当前代码最大性能坑）
- **首次启动自动迁移**：旧 `counter_value` → 第一个计数器（名为旧 `counter_title`，默认"计数器"）；旧 `counter_history` → 该计数器 history；迁移完成后清理旧 key

### 3.3 状态流

- `AppProvider`（useReducer）：持有 counters 数组 + 防抖 flush 逻辑
- 首页 FlatList 只读分发；全屏页通过 id 定位操作
- 写操作统一走 reducer action，落盘只在 flush 层发生

## 4. 页面结构（expo-router）

| 路由 | 页面 | 说明 |
|---|---|---|
| `app/(tabs)/index.tsx` | 计数器卡片墙 | FlatList 网格，惰性渲染 |
| `app/(tabs)/history.tsx` | 历史记录页（保留） | 展示**全部计数器**的清零记录（含计数器名），支持恢复/删除 |
| `app/(tabs)/_layout.tsx` | Tab 导航 | 主页 / 历史，不变 |
| `app/counter/[id].tsx` | 全屏计数模式 | 新路由 |
| `app/modal.tsx` | 新建/重命名弹窗（复用） | 或改用 inline Modal |

导入导出入口与主题切换：历史页顶栏按钮（或首页顶栏图标）。

## 4.1 主题手动切换

- 三态循环切换：**跟随系统 → 浅色 → 深色**（或三选一弹窗），选择持久化到 `theme_mode`
- 解析顺序：`theme_mode === 'system'` 时回退到系统 `useColorScheme()`；否则用手动值
- 实现：封装 `useAppTheme()` hook（现有 `hooks/use-color-scheme.ts` 扩展），返回 `isDark` + 当前主题模式，供所有页面/卡片统一取色
- 切换即时生效，无需重启；深色/浅色两套配色沿用现有 #111/#fff 体系，卡片阴影/描边同步适配

## 5. 首页：计数器卡片墙

- FlatList + numColumns（手机 2 列，平板/宽屏自适应 3-4 列），惰性渲染 + getItemLayout
- 卡片内容：名称（单行截断）+ 大数值（tabular-nums 等宽防抖动）+ **±按钮**（点击直接 ±step，不进全屏）
- 点卡片本体 → 全屏计数模式；长按卡片 → 快捷菜单（重命名/复制/删除/上移下移——排序虽为自动，菜单保留手动能力，删除需二次确认）
- 顶部 + 新建按钮；空状态引导文案
- 排序：`lastUsedAt` 降序（最近使用置顶），新建即置顶

## 6. 全屏计数模式（/counter/[id]）

- 超大数字 + 数值变化 150ms reanimated 缩放动画（worklet 线程化；web 端检测 prefers-reduced-motion 自动禁用）
- 大按钮 **−step / +step**：短按一次；长按 80ms 连加/连减（纯内存）
- 步长 chips：1 / 2 / 5 / 10 / 自定义（长按 chip 弹输入编辑步长）
- **自定义加数**：步长 chips 旁"自定义 +"按钮 → 弹窗数字键盘输入任意数（支持负数，如 -5；整数/小数均可）→ 确认后 `value += n`，一次生效；输入框默认聚焦、键盘类型 number-pad、回车即确认；Web 端同用 Modal + TextInput，行为一致；该操作不写入历史（历史仅记录清零）
- 触觉反馈：expo-haptics light impact（已装依赖；web 自动跳过）
- 清零按钮：Alert 二次确认 → 记录 ClearRecord 后归零
- 该计数器的历史记录入口（查看自己的清零记录，可恢复/删除——原功能保留）

## 7. 数据导入导出

- **导出**：全部计数器序列化 `counters-YYYYMMDD.json`（含 `{version: 1, counters: []}`）→ Web：Blob 下载；Android：expo-sharing 分享面板（新增依赖 `expo-file-system`、`expo-sharing`、`expo-document-picker`）
- **导入**：文件选择（Web input file / Android document-picker）→ schema 校验（version + counters 结构）→ 用户选择**替换**或**合并**；合并时 id 冲突自动换新 id
- 校验失败提示"文件格式不正确"，不动现有数据

## 8.1 Web 端适配专项

部署背景：静态导出（`npx expo export --platform web` → `dist/`），python3 http.server + Cloudflare Tunnel，目标 Android 平板浏览器访问。

| 能力 | Web 端方案 |
|---|---|
| 布局 | 卡片列数按容器宽度自适应：<360px 1 列 / 360-700px 2 列 / >700px 3-4 列（`useWindowDimensions` + FlatList numColumns 动态计算） |
| 长按连加 | 鼠标按住触发 `onLongPress`（RN Web 支持），按住拖动会取消——已用 `onPressOut` 停止定时器，行为一致 |
| 触觉反馈 | `expo-haptics` 在 web 为 no-op，直接调用无需分支（已确认） |
| 数字动画 | 检测 `matchMedia('(prefers-reduced-motion: reduce)')` 后禁用缩放动画，避免平板低帧率卡顿 |
| 导出 | Blob + `<a download>` 触发浏览器下载（平板浏览器同样可用，存到平板下载目录） |
| 导入 | `<input type="file">` 读 JSON（不依赖 document-picker，后者 web 支持有限） |
| 存储 | AsyncStorage web 实现 = localStorage（5MB 上限，计数器数据远小于此，无压力） |
| 深色模式 | `useColorScheme` web 端跟随系统媒体查询；手动 `theme_mode` 优先，行为一致 |
| 性能 | FlatList 惰性渲染在 web 同样生效；`getItemLayout` 需按实际列数/卡片高度计算（web 行高与原生一致） |

**已知限制（与现有一致，不新增）**：
1. 静态托管下直接访问 `/counter/[id]` 深链会 404（无 SPA fallback），但 App 内导航跳转正常——与现有 `/history` 深链 404 是同一问题，用户从首页进入即可
2. 浏览器 localStorage 与原生 AsyncStorage 互不共享（本地数据，无同步需求，可接受）
3. 导入选择文件后不校验大小，超大 JSON 会卡 UI——导入前用 `JSON.parse` + try/catch + 结构校验兜底

## 8. 性能专项清单（硬性要求）

1. 长按连加路径零持久化调用（防抖落盘）
2. 卡片 React.memo + 最小 props；FlatList 惰性渲染 + getItemLayout；keyExtractor 用 id
3. 全部静态样式 StyleSheet.create；动态条件样式对象 memo 化
4. 数字 tabular-nums 等宽防重排；动画仅数值变化触发一次
5. 启动单次读取；事件回调全部 useCallback 稳定引用
6. reanimated worklet 动画不阻塞 JS 线程；web 降级禁用动画
7. 防抖 flush：内存先行，500ms 合并写入；失焦强制写
8. 避免 inline 函数传给 memo 卡片（用 useCallback 包装 onPress）

## 9. 依赖变更

新增：`expo-file-system`、`expo-sharing`、`expo-document-picker`（均需 `npx expo install` 保证 SDK 版本匹配）
已有可用：expo-haptics、react-native-reanimated、@react-native-async-storage/async-storage

## 10. 验收标准

1. 可创建 ≥5 个计数器，各自独立命名/步长/数值，重启后数据完整
2. 长按连加 10 秒，卡顿/掉帧不明显（性能至上），且期间无持续磁盘写入（防抖生效）
3. 历史记录页与原功能一致：所有清零记录可见、可恢复、可删除；恢复跳转对应计数器
4. 导出 JSON → 清空数据 → 导入恢复，数据一致；合并模式 id 冲突不丢失
5. 深色模式正常；旧数据首次启动自动迁移且无残留旧 key
6. 数字变化动画流畅，web 端 reduced-motion 下无动画
7. 主题三态切换即时生效且重启后保持；"跟随系统"时随系统变化
