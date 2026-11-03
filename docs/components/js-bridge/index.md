# JS-Bridge

JS-Bridge 为运行在 App WebView 中的 H5 页面提供原生能力。业务代码通过统一的 `native` 对象调用这些能力，并使用 Promise 接收结果或错误。

## 平台支持

同一套 API 同时支持 **Android** 和 **iOS**。两端共用同一份 `src/utils/js-bridge` 封装和同一套 action 协议，业务代码不需要区分平台。

| 项 | 版本 / 说明 |
| --- | --- |
| JS 封装 | `sf-bridge@1.2.0-beta.1` + 项目内 `src/utils/js-bridge` |
| Android 壳 | 河北交投货主 `1.0.1`（`com.sfic.hbjthuozhu`） |
| iOS 壳 | 河北交投货主 `1.0.0`（`com.sfic.hbjthuozhu`） |
| iOS 原生 Bridge | `lib-ios-webplugin218 2.1.3` |
| Android 原生 Bridge | `lib-android-websdk`（随壳工程版本） |

> 能力由 App 壳实现，不在 H5 包内。低于上述版本的壳可能不支持本文列出的全部能力；调用未知 action 会返回 `UNSUPPORTED` 或 `NATIVE_ERROR`。

### 平台差异

除下表外，其余 API 的入参、回调结构和错误码在 Android / iOS 上保持一致。

| API | Android | iOS |
| --- | --- | --- |
| `native.app.exitApp()` | 结束当前任务栈 | 按 Apple 规范无操作，Promise 正常 resolve，但不会退出 App |
| `native.device.getInfo()` | H5 层用 `uni.getSystemInfoSync()` 兜底；`os`/版本/屏幕准确，`model` 通常准确 | 同左；`model` 只能得到 `iPhone` / `iPad` 这类泛化值 |
| `native.map.openNavigation()` | 高德地图 / 百度地图 | 高德地图 / 百度地图 |
| `native.file.previewPdf()` | 系统 `PdfRenderer` 预览 | `PDFKit` 预览，支持缩放、横向翻页、页码、双击缩放 |
| `native.ocr.recognizeDocument()` | 占位，返回 `{}` | 同左 |
| WebView 返回上一页 | 系统返回手势 / 返回键，走 `webView.goBack()` | 屏幕左边缘右滑，走 WKWebView 历史返回 |

## 如何阅读 API 文档

每个 API 会先说明它解决什么问题、会触发什么用户交互，以及 Promise 成功时真正代表什么；随后再列出调用方式、参数、返回值和错误。调用前不要只根据方法名推断行为，尤其要留意“指令已派发”和“操作已完成”的区别。

| 分类 | 能力范围 |
| --- | --- |
| [就绪、异步与错误](./bridge-errors) | Bridge 初始化、Promise 语义、错误模型 |
| [应用、WebView 与交互](./app-container-ui) | 退出应用、关闭页面、外部浏览器、弹窗、Toast、拨号 |
| [存储与系统](./storage-system) | 持久化数据、通知状态、系统设置 |
| [定位、地图与扫码](./location-maps-scanner) | 单次定位、外部导航、二维码扫描 |
| [图片与文件](./media-files) | 保存图片、选择并上传图片或文件、原生预览 PDF |
| [OCR 识别](./recognition) | 证件类型约定与 OCR 占位能力 |
| [网络与事件](./network-events) | 原生网络代理、持续事件订阅 |

## 基本用法

普通 API 会在内部等待 Bridge 就绪，无需在每次调用前执行 `native.bridge.ready()`。

```js
import { native } from '@/utils/js-bridge';

const { latitude, longitude } = await native.location.getCurrentPosition();
```
