# EAS Build 使用指南 - 计数器应用

## 概述

这是使用 **Expo EAS Build** 云编译服务为计数器应用生成 APK 文件的完整指南。EAS Build 是 Expo 提供的云编译服务，您无需在本地安装 Android SDK，只需上传代码即可自动生成 APK。

---

## 优势

✅ **无需本地配置** - 不需要安装 Android SDK、Java JDK 或 Gradle
✅ **云端编译** - 在 Expo 的服务器上编译，速度快且稳定
✅ **自动管理** - 自动处理签名、版本管理等复杂配置
✅ **跨平台** - 支持 Android、iOS 等多个平台
✅ **简单易用** - 只需几个命令即可生成 APK

---

## 前置要求

### 1. Node.js 和 npm
- **最低版本**: Node.js 16
- **推荐版本**: Node.js 18 或更高
- **下载地址**: https://nodejs.org/

**验证安装**:
```bash
node --version
npm --version
```

### 2. Expo 账户
- **注册地址**: https://expo.dev/
- **免费账户**: 可以使用所有 EAS Build 功能

### 3. EAS CLI
将在后续步骤中安装

---

## 步骤 1: 注册 Expo 账户

1. 访问 https://expo.dev/
2. 点击"Sign Up"注册新账户
3. 填写邮箱、用户名和密码
4. 验证邮箱地址
5. 完成注册

---

## 步骤 2: 安装 EAS CLI

在项目目录中运行以下命令安装 EAS CLI：

```bash
npm install -g eas-cli
```

**验证安装**:
```bash
eas --version
```

---

## 步骤 3: 初始化 EAS 项目

在项目目录中运行：

```bash
cd CounterAppExpo
eas init
```

系统会提示：
1. **选择 Expo 账户** - 选择您刚注册的账户
2. **输入项目 ID** - 可以使用默认值或自定义
3. **确认配置** - 确认后会自动更新 `app.json` 和 `eas.json`

---

## 步骤 4: 登录 Expo 账户

```bash
eas login
```

输入您的 Expo 账户邮箱和密码。

**验证登录**:
```bash
eas whoami
```

应该显示您的用户名。

---

## 步骤 5: 生成 APK 文件

### 方式 A: 快速生成（推荐用于测试）

```bash
eas build --platform android --profile preview
```

这会生成一个调试版 APK，可以直接在手机上安装。

### 方式 B: 生成发布版 APK

```bash
eas build --platform android --profile production
```

这会生成一个签名的发布版 APK，可以上传到 Google Play Store。

### 方式 C: 使用自定义配置

编辑 `eas.json` 文件，添加自定义构建配置，然后运行：

```bash
eas build --platform android --profile your-profile-name
```

---

## 步骤 6: 监控构建进度

构建开始后，您可以：

1. **在终端中查看进度**：
   ```bash
   eas build --platform android --profile preview --wait
   ```

2. **在网页上查看**：
   - 访问 https://expo.dev/
   - 登录您的账户
   - 在"Builds"标签页查看构建历史和状态

3. **获取构建链接**：
   - 构建完成后，EAS 会提供一个下载链接
   - 您可以直接从链接下载 APK

---

## 步骤 7: 下载和安装 APK

### 方式 A: 从终端下载

构建完成后，EAS 会在终端中显示下载链接：

```bash
✅ Build finished
📱 Download APK: https://...
```

复制链接，在浏览器中打开即可下载。

### 方式 B: 从 Expo 网站下载

1. 访问 https://expo.dev/
2. 登录您的账户
3. 进入"Builds"标签页
4. 找到您的构建
5. 点击"Download"下载 APK

### 方式 C: 直接安装到手机

如果您的手机已连接到电脑：

```bash
adb install path/to/downloaded.apk
```

---

## 安装 APK 到手机

### 方式 1: USB 连接（推荐）

1. **启用开发者模式**:
   - 打开设置 → 关于手机
   - 连续点击"构建号"7 次
   - 返回设置，找到"开发者选项"
   - 启用"USB 调试"

2. **连接设备**:
   - 用 USB 线连接手机到电脑
   - 在手机上选择"允许 USB 调试"

3. **安装 APK**:
   ```bash
   adb install path/to/app.apk
   ```

### 方式 2: 直接传输 APK

1. 将下载的 APK 文件复制到手机
2. 在手机上打开文件管理器，找到 APK 文件
3. 点击 APK 文件进行安装
4. 按照提示完成安装

### 方式 3: 扫描二维码

某些情况下，EAS 会生成一个二维码，您可以用手机扫描直接安装。

---

## 常见问题解决

### 问题 1: "eas login 失败"

**解决方案**:
- 确保您已注册 Expo 账户
- 检查网络连接
- 尝试重新登录：
  ```bash
  eas logout
  eas login
  ```

### 问题 2: "项目初始化失败"

**解决方案**:
- 确保在项目根目录运行 `eas init`
- 检查 `app.json` 和 `eas.json` 文件是否存在
- 删除这两个文件，重新运行 `eas init`

### 问题 3: "构建失败"

**解决方案**:
- 查看构建日志，了解具体错误
- 常见原因：
  - 依赖版本不兼容
  - 代码有语法错误
  - 配置文件格式错误
- 修复问题后重新构建

### 问题 4: "APK 下载链接过期"

**解决方案**:
- 下载链接有有效期（通常 7 天）
- 如果链接过期，可以重新构建或从 Expo 网站重新下载

### 问题 5: "手机无法识别 APK"

**解决方案**:
- 确保下载的文件确实是 APK 格式
- 检查文件大小（应该是 30-60MB）
- 尝试重新下载
- 确保手机允许安装来自未知来源的应用

---

## 自定义构建配置

### 修改应用名称

编辑 `app.json`：

```json
{
  "expo": {
    "name": "我的计数器",
    "slug": "my-counter-app"
  }
}
```

### 修改应用包名

编辑 `app.json`：

```json
{
  "expo": {
    "android": {
      "package": "com.mycompany.counterapp"
    }
  }
}
```

### 修改应用版本

编辑 `app.json`：

```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

修改后，重新运行构建命令即可应用更改。

---

## 项目文件说明

| 文件 | 说明 |
|------|------|
| `app/(tabs)/index.tsx` | 主页面（计数器逻辑） |
| `app/(tabs)/history.tsx` | 历史记录页 |
| `app.json` | Expo 应用配置 |
| `eas.json` | EAS Build 配置 |
| `package.json` | 项目依赖和脚本 |
| `index.js` | 应用入口 |
| `assets/` | 应用图标和启动屏幕 |

---

## 代码说明

### 数据持久化

应用使用 `AsyncStorage` 将计数值和历史记录保存到设备本地存储：

```typescript
// 保存计数值并更新状态
const save = async (value: number) => {
  setCount(value);
  await AsyncStorage.setItem(STORAGE_KEY, value.toString());
};

// 清零并保存历史记录（count 不为 0 时记录）
const clearAndRecord = async () => {
  if (count !== 0) {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.push({ id: Date.now().toString(), count, time: new Date().toISOString() });
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  save(0);
};
```

### 长按连续计数

通过 `setInterval` 每 80ms 执行一次加减，松手时清除定时器：

```typescript
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

const startLongPress = (delta: number) => {
  setCount((prev) => {
    const newCount = prev + delta;
    AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
    return newCount;
  });
  intervalRef.current = setInterval(() => {
    setCount((prev) => {
      const newCount = prev + delta;
      AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
      return newCount;
    });
  }, 80);
};

const handlePressOut = () => {
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
```

---

## 下一步

1. **自定义应用**: 修改 `app/(tabs)/index.tsx` 中的样式或功能
2. **发布到 Play Store**: 使用签名的发布版 APK 上传到 Google Play Store
3. **持续更新**: 修改代码后，重新运行构建命令生成新版本

---

## 获取帮助

- **Expo 官方文档**: https://docs.expo.dev/
- **EAS Build 文档**: https://docs.expo.dev/build/introduction/
- **Expo 社区**: https://forums.expo.dev/
- **GitHub Issues**: https://github.com/expo/expo/issues

---

## 许可证

MIT License - 自由使用和修改
