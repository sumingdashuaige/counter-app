# 快速开始指南 - EAS Build

## 一句话总结

这是一个使用 Expo 开发的计数器应用，您可以通过 EAS Build 云编译服务在线生成 APK，无需本地安装任何编译工具。

---

## 最快的编译方式（10 分钟）

### 1. 前置准备

确保您已安装：
- ✅ **Node.js** (版本 16+) - https://nodejs.org/
- ✅ **Expo 账户** - https://expo.dev/ (免费注册)

### 2. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 3. 初始化项目

```bash
cd CounterApp
eas init
```

按照提示：
- 选择您的 Expo 账户
- 输入项目 ID（或使用默认值）
- 确认配置

### 4. 登录 Expo

```bash
eas login
```

输入您的 Expo 账户邮箱和密码。

### 5. 生成 APK

```bash
eas build --platform android --profile preview
```

等待构建完成（通常需要 5-15 分钟）。

### 6. 下载 APK

构建完成后，您会看到下载链接：

```
✅ Build finished
📱 Download APK: https://...
```

点击链接下载 APK 文件。

### 7. 安装到手机

**方式 A: USB 连接**
```bash
adb install path/to/app.apk
```

**方式 B: 直接传输**
- 将 APK 复制到手机
- 点击 APK 文件安装

---

## 应用功能

| 功能 | 说明 |
|------|------|
| 显示区域 | 显示当前计数值（初始为 0） |
| +1 按钮 | 点击后计数加 1 |
| 清零按钮 | 点击后计数重置为 0 |
| 数据保存 | 自动保存到设备，关闭应用后数据不丢失 |
| 响应速度 | 极快的按钮响应 |

---

## 常见问题

**Q: 需要安装 Android SDK 吗？**
A: 不需要！EAS Build 在云端编译，您只需要 Node.js 和 Expo 账户。

**Q: 编译需要多长时间？**
A: 通常 5-15 分钟，取决于服务器负载。

**Q: APK 文件有多大？**
A: 约 30-50MB。

**Q: 可以修改应用吗？**
A: 可以，编辑 `App.tsx` 文件，然后重新运行构建命令。

**Q: 可以上传到 Google Play Store 吗？**
A: 可以，生成发布版 APK 后上传即可。

---

## 详细指南

如需更详细的说明，请参考 **EAS_BUILD_GUIDE.md** 文件。

---

## 项目源代码

- **主应用代码**: `App.tsx`
- **应用配置**: `app.json`
- **EAS 配置**: `eas.json`
- **项目配置**: `package.json`

---

## 获取帮助

- **Expo 官方文档**: https://docs.expo.dev/
- **EAS Build 文档**: https://docs.expo.dev/build/introduction/
- **问题排查**: 查看 EAS_BUILD_GUIDE.md 中的"常见问题解决"部分
