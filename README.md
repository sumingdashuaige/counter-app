# CounterAppExpo 📱

一个基于 **React Native + Expo** 构建的跨平台计数器应用，支持 **iOS / Android / Web** 三端运行。

## 功能特性

- 🚀 **快速计数** — 短按 +1 / -1，长按连续快速计数（80ms 间隔），松手即停
- 💾 **数据持久化** — 基于 AsyncStorage 自动保存计数，重启后恢复上次数值
- 🌓 **深色模式** — 跟随系统主题自动切换亮色 / 暗色 UI
- 📱 **跨平台** — 一套代码运行于 iOS、Android 和 Web

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
- `i` — 连接 iOS 模拟器（仅 macOS）
- `w` — 浏览器直接打开 Web 版
- 手机安装 **Expo Go** 扫码即可

## 项目结构

```
.
├── app/              # Expo Router 页面
│   ├── (tabs)/       # Tab 导航页面
│   │   ├── index.tsx # 主页面（计数器逻辑）
│   │   └── _layout.tsx
│   ├── modal.tsx     # 模态窗口
│   └── _layout.tsx   # 根布局
├── components/       # 可复用组件
│   └── ui/           # UI 基础组件
├── hooks/            # 自定义 Hooks
├── constants/        # 常量与主题配置
├── assets/           # 静态资源
└── App.tsx           # （已废弃，由 Expo Router 接管入口）
```

## 构建发布

```bash
npx eas login
npx eas build --platform android
npx eas build --platform ios
```

详细构建指南请参考 [EAS_BUILD_GUIDE.md](./EAS_BUILD_GUIDE.md)。