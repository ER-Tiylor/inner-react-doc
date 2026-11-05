# 应用、WebView 与交互

这些 API 用于控制宿主页面或调用系统交互。它们中的多数属于“指令型能力”：Promise resolve 表示宿主已经接受并派发指令，不代表用户完成了后续操作。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.app.exitApp()` | 结束当前 App 任务中的页面 | `Promise<void>` | 已实现（iOS 无操作） |
| `native.browser.open()` | 用外部浏览器打开网址 | `Promise<void>` | 已实现 |
| `native.webview.close()` | 关闭当前原生 WebView 页面 | `Promise<void>` | 已实现 |
| `native.webview.clearCookie()` | 清空原生 Cookie 存储 | `Promise<void>` | 已实现 |
| `native.webview.restart()` | 丢弃当前页面与历史，重新加载 H5 入口页 | `Promise<void>` | 已实现 |
| `native.ui.showConfirm()` | 显示原生双按钮确认框 | `Promise<{confirmed:boolean}>` | 已实现 |
| `native.ui.showToast()` | 显示短时原生提示 | `Promise<void>` | 已实现 |
| `native.device.getInfo()` | 读取非敏感设备摘要 | `Promise<DeviceInfo>` | 已实现（H5 层兜底） |
| `native.device.makePhoneCall()` | 拉起系统拨号流程 | `Promise<void>` | 已实现 |

## `native.app.exitApp()`

**功能行为：** 结束当前 App 任务中的全部 Activity，使用户离开当前应用界面。它不会使用 `killProcess` 强制杀死系统进程。该操作会中断当前页面流程，适合明确的“退出应用”场景，调用前通常应先让用户确认。

```ts
exitApp(): Promise<void>
```

```js
await native.app.exitApp();
```

Promise resolve 表示退出指令已派发。调用后的页面逻辑不应再依赖继续执行。

> **平台差异**：Android 会结束当前任务栈；iOS 按 Apple 规范不提供程序化退出 App 的能力，调用会正常 resolve，但 App 不会退出。H5 不应把“退出 App”作为唯一兜底路径。

## `native.browser.open()`

**功能行为：** 把网址交给操作系统，并使用设备上的外部浏览器打开。用户会离开当前 WebView；它适合打开外部网页，不用于 App 内部路由跳转。

```ts
open(options: { url: string }): Promise<void>
```

```js
await native.browser.open({ url: 'https://example.com' });
```

`url` 必须是非空字符串。Promise resolve 只表示打开指令已派发，不表示目标页面加载成功。

## `native.webview.close()`

**功能行为：** 关闭承载当前 H5 的原生 WebView 页面并返回上一层原生界面。关闭后当前 JavaScript 上下文会被销毁，因此不要把它当成 H5 路由的 `history.back()`。

```ts
close(): Promise<void>
```

```js
await native.webview.close();
```

Promise resolve 表示关闭指令已派发；页面关闭后的异步任务不保证继续执行。

> **平台行为**：Android 的系统返回手势/返回键会优先执行 `webView.goBack()`；iOS 开启了 WKWebView 自带的左边缘滑动返回，有 WebView 历史时交互式返回，没有历史时手势不响应。

## `native.webview.clearCookie()`

**功能行为：** 清空原生代发请求使用的 Cookie 存储。H5 退出登录时清理 localStorage 和 H5 侧 Cookie，并不会清掉原生存储；旧登录态会被之后的原生请求继续携带。Android 清理 `CookieManager`，iOS 同时清理 `HTTPCookieStorage` 和 WKWebView 的 Cookie 存储。

```ts
clearCookie(): Promise<void>
```

```js
await native.webview.clearCookie();
```

Promise resolve 表示 Cookie 已经清空。该操作不跳转、不重载页面，也不清理 localStorage；H5 自己的登录态存储仍需由业务代码清理。

## `native.webview.restart()`

**功能行为：** 丢弃当前 WebView 的页面与历史，重新加载 H5 入口页。用于退出登录等需要把路由栈彻底清空的场景：`uni.reLaunch` 只能重置 uni-app 页面栈，清不掉 WebView 历史，用户仍可通过系统返回手势回到旧页面。调用后 H5 会从入口页重新启动，入口页再按业务状态路由（例如无登录态时进入登录页）。

```ts
restart(): Promise<void>
```

```js
// 退出登录：先清原生 Cookie，再重启 WebView
await native.webview.clearCookie();
native.webview.restart();
```

Promise resolve 只表示重启指令已派发。它属于终端操作：调用后当前页面会被重新加载，不要在其后继续执行 JS 或依赖未完成的异步任务。`restart()` 不清除 Cookie，需要清理登录态时先调用 `clearCookie()`。

> **实现说明**：Android 先 `clearHistory()`，再重新加载插件入口；iOS 没有 `clearHistory()` 公开 API，会重建一个 `WKWebView`（复用同一份配置，Bridge、Web 存储均延续）后加载入口页。两端对 H5 的可观察行为一致：页面回到入口、历史为空、返回手势可用。

## `native.ui.showConfirm()`

**功能行为：** 显示一个原生双按钮确认框，并等待用户选择。适合提交、删除、退出等需要用户明确确认的操作。用户点击取消属于正常结果，不会作为异常抛出。

```ts
showConfirm(options: {
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
}): Promise<{ confirmed: boolean }>
```

`title` 和 `content` 不能同时为空，按钮默认文案为“取消”和“确定”。

```js
const { confirmed } = await native.ui.showConfirm({
  title: '确认提交',
  content: '提交后将无法撤销',
  confirmText: '提交',
});

if (confirmed) {
  // 继续提交
}
```

## `native.ui.showToast()`

**功能行为：** 在原生界面短暂显示一条非阻塞提示，适合反馈“保存成功”等无需用户选择的信息。调用不会等待 Toast 显示结束。

```ts
showToast(options: { title: string; duration?: number }): Promise<void>
```

`title` 是提示内容；`duration` 单位为秒，默认 `1`，必须大于 `0`。

```js
await native.ui.showToast({ title: '保存成功', duration: 2 });
```

Promise resolve 表示显示指令已派发。

## `native.device.getInfo()`

**功能行为：** 读取宿主提供的设备平台、系统版本、型号和屏幕摘要，用于运行环境展示或兼容性判断。返回值不包含设备唯一标识，也不应用作用户身份或设备认证依据。

```ts
interface DeviceInfo {
  os?: string;
  systemVersion?: string;
  model?: string;
  screen?: string;
}

getInfo(): Promise<DeviceInfo>
```

```js
const device = await native.device.getInfo();
console.log(device.os, device.systemVersion, device.model);
```

字段是否有值取决于宿主和系统版本，业务代码应允许字段为空。

> **实现说明**：Android 和 iOS 壳注入的桥接 JS 目前都没有提供 `window.SFApp.device.getDeviceInfo`，因此 H5 封装层改用 `uni.getSystemInfoSync()` 兜底，两端都可正常返回。
> `os`、`systemVersion`、`screen` 准确；`model` 在 Android 上通常准确，iOS 的 UA 不含具体机型，只能得到 `iPhone` / `iPad` 这类泛化值。需要精准机型时再改回原生实现。

## `native.device.makePhoneCall()`

**功能行为：** 把电话号码交给系统并拉起拨号流程。系统可能继续展示拨号确认、权限提示或电话应用界面。

```ts
makePhoneCall(options: { phoneNumber: string }): Promise<void>
```

```js
await native.device.makePhoneCall({ phoneNumber: '10086' });
```

Promise resolve 只表示拨号流程已拉起，不表示用户已拨出、对方已接听或通话已完成。
