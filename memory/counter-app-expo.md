---
name: counter-app-expo
description: 计数器应用项目概况 — Expo RN 跨平台计数器
metadata:
  type: project
---

# CounterAppExpo

基于 React Native + Expo SDK 54 的跨平台计数器应用，Android / Web 双端。

**路径**: `C:\Users\suming\Desktop\Projects\完整项目\CounterAppExpo`
**GitHub**: https://github.com/sumingdashuaige/counter-app
**Expo 账户**: suming6666
**项目 ID**: 56403cf9-04ac-47d2-9604-e9d2c2d9c644

## 功能

- +1 / -1 短按，长按快速计数（80ms setInterval）
- 清零/保存历史记录（count ≠ 0 时存）
- 历史记录页：恢复（写回计数 → 删记录 → 跳首页）、删除
- AsyncStorage 持久化（counter_value + counter_history）
- 深色模式跟随系统
- 启动图 lp.jpg + cover

## 结构

- `app/(tabs)/index.tsx` — 主页计数器逻辑
- `app/(tabs)/history.tsx` — 历史记录页
- `app/(tabs)/_layout.tsx` — Tab 导航（主页、历史）
- `app/_layout.tsx` — 根布局
- `constants/theme.ts` — 主题色
- `components/ui/icon-symbol.tsx` — SF Symbols → Material Icons 映射

## 历史记录排序

存储始终旧→新，显示反转（最新在上）。saveList 写入前反转回旧→新。

## 构建

```bash
eas build --platform android --profile preview
```

**Why:** 快速了解项目结构、功能、技术栈，下次接手不用重新探索。
