# CounterAppExpo 📱

一个基于 **React Native + Expo** 构建的跨平台计数器应用，支持 **Android / Web** 双端运行。

## 功能特性

- 🚀 **快速计数** — 短按 +1 / -1，长按连续快速计数（80ms 间隔），松手即停
- 💾 **数据持久化** — 基于 AsyncStorage 自动保存计数，重启后恢复上次数值
- 📝 **自定义标题** — 点击标题可编辑，自定义计数器名称，保存到本地
- 📜 **历史记录** — 清零时自动保存标题和计数，支持恢复（写回计数+标题并删除记录）和单条删除
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
标题点击 → editing 模式
    ├─ TextInput 编辑标题
    └─ onBlur 保存到 AsyncStorage(TITLE_KEY)
    ↓
清零时 → clearAndRecord()
    ├─ 读取 HISTORY_KEY → 追加记录（含 title + count）
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
FlatList 渲染（显示 标题：计数）
    ↓
恢复 → 写回计数 + 写回标题 + 删除记录 + 跳转首页
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

## 构建发布（其实忽略了许多文件，估计不好构建，直接去Releases里下载apk就能用了）

```bash
npx eas login
npx eas build --platform android --profile preview
```

构建完成后会返回 APK 下载链接，约 30-60MB，可直接安装到 Android 设备。

详细构建指南请参考 [EAS_BUILD_GUIDE.md](./EAS_BUILD_GUIDE.md)。
