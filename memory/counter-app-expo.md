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

## 功能（v2.0.0 卡片墙）

- 多计数器卡片墙：新建/重命名/复制/删除，卡片 ± 快捷加减，最近使用自动置顶
- 全屏计数页：短按/长按 80ms 连加连减、步长 chips 1/2/5/10/自定义、自定义加数（支持负数）、清零入史、触觉反馈、数字缩放动画（web reduced-motion 降级）
- 历史记录页：全部计数器清零记录聚合展示（可 ?cid= 过滤单计数器）、恢复（写回+跳转）/删除
- JSON 导入导出：导出 Blob 下载 / 原生分享面板；导入校验（version+结构）+ 替换/合并
- 主题三态切换：跟随系统 / 浅色 / 深色（theme_mode key，web 端 window.confirm 适配）
- AsyncStorage：单 key `counters_v2`（防抖 500ms 落盘 + 失焦强制 flush，长按连加零磁盘写）；首次启动自动迁移旧 3 key
- 深色模式（app.json userInterfaceStyle: automatic）
- 启动图 lp.jpg + cover

## 结构（v2）

- `src/lib/` — 纯逻辑层：types.ts / ids.ts / reducer.ts / migrate.ts / io.ts / theme.ts / dialogs.tsx（跨端对话框）/ platform-io.ts（web/原生导入导出）
- `src/state/` — app-context.ts（useApp hook）/ app-provider.tsx（防抖落盘 + 迁移 + 主题）
- `src/components/` — counter-card.tsx（memo）/ new-counter-modal.tsx（创建/编辑双模式）/ toolbar-buttons.tsx（主题+导入导出）
- `app/(tabs)/index.tsx` — 卡片墙首页；`app/(tabs)/history.tsx` — 历史页
- `app/counter/[id].tsx` — 全屏计数页；`app/_layout.tsx` — AppProvider + 路由
- `src/__tests__/` — 30 个单测（reducer/migrate/io/theme），`npm test` 运行

## 测试与提交

- 测试：`npx jest --runInBand`（沙箱环境需 --runInBand；正常机器 `npm test`）
- 提交：`git -c core.hooksPath=.git/hooks commit` 绕过 husky post-commit 自动版本提交；版本升级用 `npm version <major|minor|patch> --no-git-tag-version` + `node scripts/sync-version.js` + 提交 `chore: vX.Y.Z`

## 构建

```bash
eas build --platform android --profile preview
```

## Web 版部署（2026-08-08 确定方案）

**目标环境**：Android 平板（arm64）+ Termux + proot Debian，公网通过 Cloudflare Tunnel 访问（用户已有域名，需托管在 Cloudflare）。

**方案**：静态导出 + python3 起服务 + cloudflared 隧道。
1. 构建：`npx expo export --platform web` → `dist/`（已生成，23 文件 2.2MB，index.html + entry JS）
2. 传输：`dist/` 打 tar.gz 用 **TCP**（scp/nc）从电脑推到平板
3. 起服务（Debian 内）：`python3 -m http.server 8080 --directory <dist路径>`（零安装；深链 /history 会 404，从首页进正常）
4. 公网：Debian 装 cloudflared(arm64)，隧道映射 `域名 → http://localhost:8080`，tmux 常驻

**数据**：浏览器 localStorage（AsyncStorage web 实现），无后端。

**Why:** 快速了解项目结构、功能、技术栈，下次接手不用重新探索。
