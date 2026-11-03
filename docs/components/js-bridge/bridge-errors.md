# 就绪、异步与错误

## `native.bridge.ready()`

**功能行为：** 等待 App 宿主完成 Bridge 注入，并返回宿主创建 WebView 时注入的初始化数据。它只判断基础调用通道是否可用，不检查某个具体原生能力是否已实现，也不代表用户已授予定位、相机等权限。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.bridge.ready()` | 等待 Bridge 可调用并读取 WebView 初始化数据 | `Promise<BridgeInitData>` | 已验证 |

```ts
interface BridgeInitData {
  /** 页面顶部需要避让的状态栏高度，当前按 CSS px 使用。 */
  statusBarHeight?: number;
  /** 页面底部需要避让的安全距离；没有底部安全区时为 0。 */
  screenSafeBottom?: number;
  /** 不同宿主可追加字段，调用方应忽略不认识的字段。 */
  [key: string]: unknown;
}
```

返回值是初始化数据对象，不带 `{status, result}` 包装，也不是页面 URL/Event 携带的 `pageData`。浏览器替代实现或未提供初始化数据的旧宿主可能返回 `{}`，直接读取字段时应提供默认值。

普通业务 API 会在内部自动等待 Bridge 就绪，因此无需在每次调用前手动执行 `ready()`：

```js
const position = await native.location.getCurrentPosition();
```

只有启动阶段需要读取初始化数据，或需要区分“Bridge 未注入”和“具体能力失败”时，才单独调用：

```js
try {
  const initData = await native.bridge.ready();
  const statusBarHeight = Number(initData.statusBarHeight) || 0;
  console.log(statusBarHeight);
} catch (error) {
  if (error.code === 'READY_TIMEOUT') {
    // 页面不在 App 宿主内，或者宿主没有完成 Bridge 注入。
  }
}
```

当前 SDK 默认等待 Bridge 就绪的上限为 10 秒，超时抛出 `READY_TIMEOUT`。普通 API 已在内部调用 `ready()`，只有应用启动时读取布局初始化数据，或需要单独诊断 Bridge 是否注入时才需要显式调用。

## 异步模型

### 单次结果

定位、扫码、选择上传等能力会等待一次原生结果。Native 返回成功状态时 Promise resolve 业务数据，失败时 reject `NativeBridgeError`。

```js
try {
  const { code } = await native.scanner.scanCode();
  console.log(code);
} catch (error) {
  if (error.code === 'USER_CANCELLED') return;
  throw error;
}
```

### 指令型能力

退出应用、打开浏览器、Toast、拨号、导航和打开设置等操作也返回 Promise，但 resolve 通常只表示 Bridge 已就绪且指令已派发。它不代表外部页面加载成功、电话接通或用户完成设置。

### 持续事件

事件监听会返回可释放的订阅对象，回调可能执行多次。页面或组件销毁时应调用 `remove()`。

```js
const subscription = await native.events.addListener('refreshPage', payload => {
  console.log(payload);
});

await subscription.remove();
```

## 错误模型

所有 Promise API 使用同一错误结构。业务逻辑使用稳定的 `error.code` 判断，不依赖可能变化的中文错误文案。

```ts
interface NativeBridgeError extends Error {
  code: string;
  message: string;
  action?: string;
  details?: unknown;
  cause?: unknown;
}
```

| 错误码 | 含义 |
| --- | --- |
| `INVALID_ARGUMENT` | JS 入参缺失或类型不正确 |
| `UNSUPPORTED` | 当前宿主或 App 版本不支持该能力 |
| `BRIDGE_UNAVAILABLE` | Bridge 不存在或调用失败 |
| `READY_TIMEOUT` | 等待宿主 Bridge 就绪超时 |
| `TIMEOUT` | action 已派发，但没有按时收到 Native 回调 |
| `BUSY` | 相同的独占能力正在执行 |
| `USER_CANCELLED` | 用户取消选择或操作 |
| `PERMISSION_DENIED` | 用户拒绝权限 |
| `NETWORK_ERROR` | Native 网络请求或文件下载失败 |
| `FILE_TOO_LARGE` | 受控文件超过 Native 允许的大小上限 |
| `INVALID_PDF` | 内容不是有效 PDF，或 PDF 损坏、加密而无法打开 |
| `NATIVE_ERROR` | 无法进一步分类的原生错误 |

Android 与 iOS 使用同一套错误码和 Promise 语义；业务代码按 `error.code` 判断，不要依赖具体平台的错误文案。

```js
import { native, isNativeBridgeError, NATIVE_ERROR_CODE } from '@/utils/js-bridge';

try {
  await native.media.chooseAndUploadImages();
} catch (error) {
  if (isNativeBridgeError(error) && error.code === NATIVE_ERROR_CODE.USER_CANCELLED) return;
  throw error;
}
```
