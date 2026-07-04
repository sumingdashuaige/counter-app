# CounterAppExpo 📱

一个基于 **React Native + Expo** 构建的跨平台计数器应用，支持 **Android / Web** 双端运行。

## 功能特性

- 🚀 **快速计数** — 短按 +1 / -1，长按连续快速计数（80ms 间隔），松手即停
- 💾 **数据持久化** — 基于 AsyncStorage 自动保存计数，重启后恢复上次数值
- 📜 **历史记录** — 清零时自动保存当前数值，支持恢复（写回计数并删除记录）和单条删除
- 🌓 **深色模式** — 跟随系统主题自动切换亮色 / 暗色 UI

## 架构说明

### 数据流

```
用户交互（短按 / 长按）
    ↓
save() / startLongPress()
    ├─ setCount() 更新 React 状态 → UI 重渲染
    └─ AsyncStorage.setItem() 持久化计数
    ↓
清零时 → clearAndRecord()
    ├─ 读取 HISTORY_KEY → 追加记录
    ├─ AsyncStorage.setItem() 持久化历史
    └─ save(0) 重置计数
```

### 历史记录流

```
页面聚焦 → useFocusEffect
    ↓
AsyncStorage.getItem(HISTORY_KEY)
    ↓
JSON.parse + reverse()（最新在上）
    ↓
FlatList 渲染
    ↓
恢复 → 写回计数 + 删除记录 + 跳转首页
删除 → 过滤该条 + 重写存储（保持旧→新顺序）
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.81 + Expo SDK 54 |
| 语言 | TypeScript |
| 路由 | Expo Router（文件系统路由）|
| 导航 | React Navigation (Bottom Tabs) |
| 持久化 | AsyncStorage |
| 动画 | React Native Reanimated |
| 手势 | React Native Gesture Handler |
| 构建 | EAS Build |

## 快速开始

```bash
npm install
npx expo start
npx expo start --web
```

- `a` — 连接 Android 模拟器
- `i` — 连接 iOS 模拟器（未测试）
- `w` — 浏览器直接打开 Web 版

## 项目结构

```
.
├── app/                  # Expo Router 页面
│   ├── (tabs)/
│   │   ├── index.tsx     # 主页面（计数器逻辑）
│   │   ├── history.tsx   # 历史记录页
│   │   └── _layout.tsx   # Tab 导航布局
│   ├── modal.tsx         # 模态窗口
│   └── _layout.tsx       # 根布局
├── components/           # 可复用组件
│   └── ui/               # UI 基础组件（图标映射等）
├── hooks/                # 自定义 Hooks（主题色、深色模式）
├── constants/            # 常量与主题配置
├── assets/               # 静态资源（图标、启动图）
└── index.js              # 应用入口
```

## AI 协作开发

本项目全程采用 **Claude Code（vibe coding 模式）** 协作完成，体现了 AI 驱动的全栈开发流程：

### 协作方式

| 环节 | 实践 |
|------|------|
| **需求 → 设计** | 用自然语言描述想法，AI 分析后给出技术方案，确认后生成代码 |
| **代码生成** | 每轮通过 Prompt 描述一个功能点（计数器、持久化、历史记录、主题切换），AI 输出完整可运行代码 |
| **调试迭代** | 运行后发现 bug 直接描述现象，AI 定位根因并修复（如长按定时器残留、历史记录顺序反转） |
| **工具链** | 利用 Claude Code 的文件读写、搜索、git 操作等工具能力，在对话中完成全闭环 |
| **上下文管理** | 通过记忆文件记录项目结构和关键决策点，跨会话保持上下文连贯 |
| **版本控制** | 每个功能完成后通过 git 提交，commit message 自动生成 |

### 关键技术点

- **流式交互**：Claude Code 的流式输出实时展示代码生成过程，可随时中断、纠正方向
- **上下文窗口管理**：单会话完成一个功能模块后提交，新建会话继续下一模块，避免上下文膨胀
- **工具调用**：在开发过程中调用了文件编辑、代码搜索、命令行执行等多种工具，类似 function calling 的协作模式

## 构建发布

```bash
npx eas login
npx eas build --platform android --profile preview
```

构建完成后会返回 APK 下载链接，约 30-60MB，可直接安装到 Android 设备。

详细构建指南请参考 [EAS_BUILD_GUIDE.md](./EAS_BUILD_GUIDE.md)。
