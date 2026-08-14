# CounterAppExpo 📱

一个基于 **React Native + Expo** 构建的跨平台多计数器应用，支持 **Android / Web** 双端运行（v2.0.0 卡片墙版）。

## 功能特性

- 🃏 **多计数器卡片墙** — 任意多个计数器平铺展示，各自独立命名 / 数值 / 步长；卡片上直接 ± 快捷加减，点卡片进入全屏计数模式
- 🔢 **全屏计数模式** — 超大数字（自适应字号）+ 数值变化动画；短按 ± 一次、**长按 80ms 连加连减**（纯内存，零磁盘写入）；步长 chips 1/2/5/10/自定义；**自定义加数**（任意数，支持负数）；触觉反馈
- 📜 **历史记录** — 清零自动入史；历史页聚合展示所有计数器的记录（支持按计数器过滤），可恢复（写回数值并跳转）或删除
- 💾 **数据持久化** — 单 key 存储 + 500ms 防抖落盘 + 失焦强制 flush；**长按连加路径零持久化调用**；首次启动自动迁移 v1 旧数据（旧 key 保留兜底）
- 📤 **导入导出** — 一键导出全部数据为 JSON（Web 下载 / Android 分享面板），导入支持替换 / 合并，带 schema 校验
- 🌓 **主题三态** — 跟随系统 / 浅色 / 深色手动切换，即时生效、重启保持
- ↩️ **记住上次页面** — 退出 / 关闭后重启，自动回到上次浏览的页面（含全屏计数页）
- 🚀 **性能至上** — 卡片 memo 化 + FlatList 惰性渲染、等宽数字防抖动、reanimated worklet 动画（web 端 reduced-motion 自动降级）

## 架构说明

### 分层

- **纯逻辑层** `src/lib/`（可单测）：
  - `reducer.ts` — 计数器状态机（增删改复制 / 加减 / 步长 / 清零入史 / 恢复 / 导入合并 / 排序）
  - `migrate.ts` — v1 → v2 旧数据迁移（数值 / 标题 / 全部历史）
  - `io.ts` — 导入导出序列化与 schema 校验
  - `restore-route.ts` — 上次页面恢复决策
  - `theme.ts` / `dialogs.tsx`（跨端对话框）/ `platform-io.ts`（Web/原生导入导出分发）
- **状态层** `src/state/` — `app-provider.tsx`（useReducer + 防抖落盘 + 启动迁移 + 主题 + 路由快照）、`app-context.ts`（`useApp()`）
- **UI 层** `app/` + `src/components/`

### 数据流

```
用户操作（卡片 ± / 全屏页按钮 / 长按连加 80ms）
    ↓ dispatch(action)
countersReducer（纯函数，内存即时更新）
    ├─ UI 重渲染（memo 卡片最小化更新）
    └─ 500ms 防抖 → AsyncStorage.setItem(counters_v2)
    └─ 失焦 / 卸载 → 强制 flush
启动
    └─ 读 counters_v2 → 缺失/空则迁移 v1 旧 key → 无旧数据则建默认计数器
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.81 + Expo SDK 54 |
| 语言 | TypeScript |
| 路由 | Expo Router 6（文件系统路由）|
| 导航 | React Navigation (Bottom Tabs) |
| 持久化 | AsyncStorage（Web 端为 localStorage）|
| 动画 | React Native Reanimated 4 |
| 触觉 | expo-haptics |
| 文件 | expo-file-system / expo-sharing / expo-document-picker |
| 测试 | jest-expo + @testing-library/react-native（47 用例）|
| 构建 | EAS Build（APK）/ expo export（Web）|

## 快速开始

```bash
npm install
npm test          # 运行测试（47 用例）
npx expo start    # 开发服务器
npx expo start --web
```

- `a` — 连接 Android 模拟器
- `w` — 浏览器直接打开 Web 版

## 项目结构

```
.
├── app/                    # Expo Router 页面
│   ├── (tabs)/
│   │   ├── index.tsx       # 计数器卡片墙
│   │   ├── history.tsx     # 历史记录页（含导入导出/主题入口）
│   │   └── _layout.tsx     # Tab 导航
│   ├── counter/[id].tsx    # 全屏计数模式
│   └── _layout.tsx         # 根布局（AppProvider + 路由恢复）
├── src/
│   ├── lib/                # 纯逻辑层（reducer/migrate/io/restore-route/theme/dialogs/platform-io）
│   ├── state/              # AppProvider + useApp 上下文
│   ├── components/         # counter-card / new-counter-modal / toolbar-buttons
│   └── __tests__/          # 47 个单元/集成测试
├── docs/superpowers/       # 设计文档与实现计划
├── memory/                 # 项目记忆
└── dist/                   # Web 静态导出产物（不入库）
```

## 构建发布

### Android APK（EAS 云端构建）

```bash
npx eas login
npx eas build --platform android --profile preview
```

构建完成后返回 APK 下载链接，可直接安装。**升级安装请覆盖安装（勿卸载），数据自动继承**（同包名 `com.counterapp` + versionCode 递增）。

### Web 静态部署（如 Android 平板 + Cloudflare Tunnel）

```bash
npx expo export --platform web     # 产出 dist/
cd dist && python3 serve.py 8080   # 带 SPA fallback（深链不 404）
# 打包传输：tar -czf counter-web-v2-dist.tar.gz .
```

> ⚠️ 部署升级必须保持**同一域名/端口**（localStorage 按 origin 隔离）；打开前建议强刷一次（Ctrl+Shift+R）。

详细构建指南请参考 [EAS_BUILD_GUIDE.md](./EAS_BUILD_GUIDE.md)。
