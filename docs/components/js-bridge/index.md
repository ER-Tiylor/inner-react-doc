# JS-Bridge

JS-Bridge 为运行在 App WebView 中的 H5 页面提供原生能力。业务代码通过统一的 `native` 对象调用这些能力，并使用 Promise 接收结果或错误。

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
