# 原生能力与 JS API 总体设计

编写日期：2026-10-22

本文讨论 H5 页面运行在 Android / iOS 壳中，通过 JavaScript 调用原生能力的总体设计。开头的“当前设计规范”是公共 JS-Bridge 的开发基线；后续章节解释设计依据和未来演进方向。

本文不是当前 SDK 的能力清单，也不表示这些接口已经实现。所有 `native.*` 示例都是建议接口；它们不是某个框架的现成 API。真实框架的做法与本文建议分别说明。

推荐的总体方向是：**按能力分模块；一次性操作使用 Promise；持续通知使用事件订阅；长任务使用任务对象；底层 Bridge 统一处理通信、调用生命周期和诊断信息。**

公共 SDK 采用模块化正式 API。实际开放能力、`ready()` 语义、错误码和当前状态以 [JS-Bridge 接入与能力总览](/components/js-bridge/) 为准。本文中的完整分类仍是后续扩展设计，不代表当前均已实现。

## 当前设计规范

### 范围和目标

本阶段冻结分类、命名、异步模型、错误模型、兼容策略和开发流程，不新增原生能力。目标是让新增 API 在进入编码前就能回答：它属于哪个模块、是否真需要 Native、如何完成或取消、返回什么、失败如何表达、旧版本如何兼容。

这两份文档的职责固定如下：

| 文档 | 职责 |
| --- | --- |
| 本文 | 总体架构、分类目录和开发规范，包含尚未实现的扩展方向 |
| [JS-Bridge 接入与能力总览](/components/js-bridge/) | 当前 SDK 的真实能力、状态、参数、返回值和已知限制 |

代码与能力清单不一致时视为缺陷；未来设计尚未实现时，不得因为本文出现了示例名称就宣称能力可用。

### 分层架构

```text
H5 业务页面
  → JS 公共 API：native.<module>.<method>(options)
  → JS Bridge 适配层：ready、请求匹配、超时、错误归一化
  → Native action 分发层：白名单、参数校验、未知 action 回调
  → 能力实现层：相机、定位、文件、存储等
  → 系统 API / 第三方 SDK / 项目服务适配器
```

各层只承担自己的职责：

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| H5 业务页面 | 业务流程、表单回填、页面提示 | 直接拼 Bridge 协议、判断原始 `status` |
| JS 公共 API | 模块化命名、参数预校验、Promise；已发布接口需要时承载兼容别名 | Android/iOS 实现细节 |
| JS Bridge 适配层 | 就绪、超时、单次完成保护、错误对象 | 业务 Toast、业务重试 |
| Native 分发层 | action 白名单、分派、统一兜底错误 | 在一个 `when` 中堆积完整能力实现 |
| 能力实现层 | 权限、生命周期、线程、资源释放、结果转换 | H5 页面业务状态 |
| 服务适配器 | 项目后端或专有 SDK 协议 | 暴露服务端历史字段污染公共 API |

### 分类目录

分类是公共 API 的稳定命名空间。已开放状态以能力清单为准；“保留”只确定归属，不创建空方法。

| 类别 | 模块名 | 当前范围 | 后续可扩展 |
| --- | --- | --- | --- |
| Bridge 基础 | `bridge` | 就绪 | 协议版本、能力握手、运行信息 |
| 应用 | `app` | 退出 App | 应用信息、启动上下文、前后台事件、深链 |
| 浏览器 | `browser` | 外部浏览器打开 URL | 应用内浏览器、打开方式与安全策略 |
| WebView | `webview` | 关闭当前 WebView | 打开容器、标题栏、页面结果 |
| UI | `ui` | 确认框、Toast | ActionSheet、触觉反馈、键盘、状态栏 |
| 设备 | `device` | 非敏感设备摘要、拨号 | 网络状态、电量；敏感标识单独评审 |
| 系统 | `system` | 通知设置、应用设置 | 剪贴板、分享、系统能力状态 |
| 存储 | `storage` | 字符串和普通 JSON | 安全存储、缓存配额与清理 |
| 媒体 | `media` | 图片上传、保存图片 | 拍照、图片选择、视频、压缩、预览 |
| 文件 | `file` | 文件选择并上传 | 文件元信息、打开、下载、受控 URI |
| 定位 | `location` | 单次定位 | 持续定位、服务状态 |
| 地图 | `map` | 外部地图导航 | 地点选择、原生地图组件 |
| 扫码 | `scanner` | 单次二维码扫描 | 条码、连续扫描、手电筒 |
| OCR | `ocr` | OCR 占位 API | 端侧文字识别、证件识别、服务端识别适配 |
| HTTP | `http` | Native GET/POST | 请求取消；普通 H5 请求仍优先使用 H5 网络层 |
| 事件 | `events` | 监听基础设施 | 只承载已登记的跨页面持续事件 |
| 权限 | `permissions` | 保留 | 查询、申请、跳转设置；能力执行时仍需二次检查 |
| 传输 | `transfer` | 保留 | 上传、下载、进度、取消和后台任务 |
| 通知 | `notifications` | 保留 | 推送注册、通知点击、本地通知、角标 |
| 身份认证 | `auth` | 保留 | 单点登录、生物识别、会话事件 |
| 外设 | `bluetooth` / `nfc` / `printer` | 保留 | 扫描、连接、读写、打印及资源释放 |
| 后台任务 | `background` | 保留 | 可恢复任务、状态查询、取消 |
| 诊断 | `diagnostics` | 保留 | 运行信息、调用追踪、脱敏日志导出 |

订单、运单、签收、电子签章等领域流程不进入上述通用层。确需原生 SDK 时，放入独立业务 SDK 或明确的 `business.<domain>` 模块，并单独维护权限和版本，不得伪装成设备通用能力。

### 公共 API 强制规范

1. 正式名称使用 `native.<module>.<method>(options)`，模块和方法均使用 `camelCase`，不带 `SDK`、`Manager`、`Util` 等实现后缀。
2. 使用稳定、常见且语义准确的动词。优先复用项目推荐词汇，但不设置封闭白名单；`scan`、`recognize`、`request`、`save`、`exit` 等在语义需要时必须使用。禁止 `do`、`handle`、`process`、`getData` 等不能说明行为的名称。
3. 模块名优先使用单数、稳定且容易检索的能力名称。以完整调用路径判断是否清晰，避免 `location.getLocation()`、`file.uploadFile()` 这类无意义重复；涉及退出应用、保存到相册、打开外部应用和申请权限时必须明确作用范围和后果。
4. 有参数的方法统一接收一个 `options` 对象；无参数方法直接调用，不强制传 `{}`。参数名必须反映当前真实数据类型，不得用 `filePath` 表示 Base64，也不得把“选择并上传”描述成纯上传。新增参数优先增加可选字段，不继续增加位置参数。
5. 单次调用统一返回 Promise。底层 callback 只存在于 Bridge 适配层，不暴露给业务页面。
6. 持续数据使用订阅，返回具有幂等 `remove()` 的句柄；长任务在确有进度和取消需求时使用任务对象。
7. Promise 成功值直接是业务数据或 `undefined`，失败统一 reject `NativeBridgeError`。业务层不读取 `{status,result}`。
8. 用户取消使用 `USER_CANCELLED`；权限拒绝使用 `PERMISSION_DENIED`；未知能力使用 `UNSUPPORTED`；独占资源冲突使用 `BUSY`。
9. 原生每次有结果调用必须且只能完成一次。成功、失败、取消、权限拒绝、参数错误和页面退出路径都要检查是否闭环。
10. 返回对象字段使用 `camelCase`。同一含义只定义一个正式字段；历史字段只在确有已发布调用时由适配层兼容，不扩散到新调用方。
11. 时间必须标明单位，坐标必须标明坐标系，文件必须说明是 URL、受控 URI、临时文件还是服务端对象标识。
12. 公共 API 不返回 Android `Bundle`、`Intent`、异常对象、文件绝对路径或第三方 SDK 原始类型。
13. 用户交互 API 使用适合交互的独立超时；超时只代表 JS 不再等待，不自动宣称原生任务已经停止。
14. 相机、扫码、文件选择等独占 UI 默认并发策略为拒绝后来的调用并返回 `BUSY`，不得覆盖前一个回调。

### action 与兼容策略

- `native.*` 是业务代码使用的公共 API；`action` 是现有 Bridge 内部兼容协议。两者不要求同名。
- 已发布 action 不因公共 API 重命名而删除。JS 正式 API负责映射到旧 action。
- 设计阶段且尚未发布的旧 JS 名称直接删除，不建立兼容层。
- 已发布且存在真实调用的旧 JS 名称才允许保留薄别名；别名只转调正式 API，不复制实现，也不获得新功能。
- 删除已发布别名必须先统计调用、给出迁移期，并与承载旧 H5 的最低 App 版本一起评审。
- 新增可选参数和返回字段属于兼容变更；修改字段类型、成功语义、默认行为或错误语义属于破坏性变更，应新增方法或能力版本。

### 新能力开发流程

1. **判定归属**：确认是通用 Native 能力、项目服务适配，还是纯 H5 / 业务能力。
2. **先写契约**：在能力清单中写正式名称、action、参数、结果、错误、权限、取消、并发、超时、生命周期和平台差异。
3. **确认兼容**：列出旧名称、旧字段、最低 App/H5 版本和降级行为。
4. **实现 Native**：参数在原生再次校验；耗时工作离开主线程；所有终态回调闭环。
5. **实现 JS 封装**：参数预校验、Promise/订阅转换、错误归一化；业务代码不得直调 action。
6. **补调试页**：使用正式 API，允许编辑参数，完整显示结果、错误码和耗时。
7. **联合验收**：至少验证成功、参数错误、用户取消、权限拒绝、重复调用、页面退出和不支持版本中适用的场景。
8. **同步文档**：只有真实代码、调试页和能力清单一致后，状态才能标为“已实现”；关键路径实际验收后才能标为“已验证”。

### Definition of Done

一个新能力同时满足以下条件才算完成：

- 正式 API、Native action 和责任模块已经确定；
- 参数和结果没有平台私有对象，字段含义、单位和空值语义明确；
- Promise、订阅或任务模型选择符合调用生命周期；
- 稳定错误码及全部终态已经实现；
- 并发、超时、权限和页面销毁行为有明确实现；
- 旧调用可继续工作，或已经完成版本化迁移；
- 调试页使用正式 API 覆盖关键路径；
- 当前能力文档已更新，并记录真实验证状态。

## 1. 业界常见方案

不同框架没有统一的原生能力 API 标准，但有一些可参考的模式。

| 方案 | 对外接口风格 | 可以借鉴的设计 |
| --- | --- | --- |
| Cordova | 经典 `cordova.exec` 使用成功、失败 callback | JS 调用分发到指定插件与方法 |
| Capacitor | 普通调用主要返回 Promise；重复数据可以使用 callback 或监听器 | 能力模块、类型定义、单次结果与持续结果分开 |
| React Native | 传统 Native Modules 支持 callback、Promise；原生通知通过事件传递 | 模块契约、事件定义、订阅释放 |

参考：[Cordova 插件开发](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)、[Capacitor 方法类型](https://capacitorjs.com/docs/plugins/method-types)、[React Native 传统原生模块](https://reactnative.dev/docs/legacy/native-modules-android)、[React Native 原生事件](https://reactnative.dev/docs/next/the-new-architecture/native-modules-custom-events)。

React Native 的运行架构不同于 WebView 壳，适合借鉴模块与接口契约，不应直接照搬通信实现。上面的 React Native callback / Promise 对比引用的是其传统模块文档，不代表所有新架构接口都只能采用这种方式。

## 2. 原生能力分类

下面是一份建议目录，不要求一次全部实现。小型应用可以先放在同一个 SDK 中，仍保留模块边界；规模扩大后再按模块拆包。

| 分类 / 模块 | 常见原生能力 | 建议 API 示例 | 返回形式 |
| --- | --- | --- | --- |
| 桥接基础 `bridge` | 就绪、协议版本、能力检测 | `ready()`、`getCapabilities()` | Promise |
| 应用信息 `app` | App 版本、构建编号、启动参数、前后台状态、深链唤起 | `getInfo()`、`getLaunchContext()`、`onStateChange()` | Promise + 订阅 |
| WebView 与页面 `webview` | 打开/关闭 WebView、标题栏、原生返回键、页面结果传递 | `open()`、`close()`、`setTitle()` | Promise；页面结果可独立返回 |
| 设备与系统 `device` | 系统版本、设备型号、语言、屏幕、网络状态 | `getInfo()`、`network.getStatus()` | Promise + 订阅 |
| 权限 `permissions` | 查询授权、申请授权、打开应用设置页 | `check()`、`request()`、`openSettings()` | Promise |
| 定位 `location` | 单次定位、连续定位、定位服务状态 | `getCurrentPosition()`、`watchPosition()` | Promise + 订阅 |
| 地图 `map` | 打开外部地图导航、选择地点、原生地图组件 | `openNavigation()`、`pickLocation()` | Promise；组件事件 |
| 拍摄与媒体 `media` | 拍照、选择图片/视频、压缩、预览、保存相册 | `takePhoto()`、`pickImages()`、`compressImage()` | Promise |
| OCR `ocr` | 身份证、行驶证、驾驶证等文字识别 | `recognizeDocument()` | Promise |
| 扫码 `scanner` | 单次扫码、连续扫码、手电筒 | `scanCode()`、`startContinuousScan()` | Promise + 订阅 |
| 文件 `file` | 文件选择、读写、元信息、删除、打开文档 | `pick()`、`read()`、`stat()`、`open()` | Promise |
| 数据存储 `storage` | 普通键值存储、敏感数据存储、缓存管理 | `preferences.get()`、`secureStorage.set()` | Promise |
| 网络与传输 `http` / `transfer` | 原生 HTTP、上传、下载、取消、进度 | `request()`、`uploadFile()`、`downloadFile()` | Promise / 任务对象 |
| 系统交互 `system` | 剪贴板、分享、拨号、外部浏览器、打开其他 App | `clipboard.write()`、`share()`、`openDialer()` | Promise |
| 原生 UI `ui` | 弹窗、操作菜单、Toast、震动、状态栏、键盘 | `confirm()`、`showActionSheet()`、`haptic()` | Promise + 订阅 |
| 通知 `notifications` | 推送注册、本地通知、通知点击、角标 | `registerPush()`、`schedule()`、`onTap()` | Promise + 订阅 |
| 身份与认证 `auth` | 原生登录、单点登录、生物识别、会话状态 | `signIn()`、`authenticate()`、`onSessionChange()` | Promise + 订阅 |
| 外设 `bluetooth` / `nfc` / `printer` | 蓝牙扫描与连接、NFC、打印 | `scan()`、`connect()`、`print()` | Promise + 订阅 / 任务对象 |
| 后台任务 `background` | 可持久任务、后台上传、特定后台定位 | `schedule()`、`getTask()`、`cancel()` | Promise + 任务状态 |
| 运维诊断 `diagnostics` | 日志、调用追踪、运行版本、诊断导出 | `getRuntimeInfo()`、`exportLogs()` | Promise |

相机、文件、定位、网络、应用状态等按能力拆分的方式，可以参考 [Capacitor 官方插件目录](https://capacitorjs.com/docs/apis)。以上完整分类、模块名称与方法名称是本文建议，不是行业统一标准。

### 2.1 模块边界

- **H5 内部路由归前端路由器管理。** 跨 WebView、原生页面、外部 App 的跳转交给容器与系统能力。
- **选择图片、压缩图片、上传文件分别提供接口。** 业务层再组合成“上传凭证照片”等流程。
- **OCR 能力只负责采集、识别和返回结构化结果。** 证件类型、字段展示和业务表单回填由 H5 业务层处理；后端识别服务地址属于项目适配层。
- **普通存储、敏感存储和可清理缓存分开。** 不要把所有持久数据都叫缓存。
- **前台定位与后台轨迹分开。** 后者有独立的权限、任务状态和系统生命周期约束。
- **订单、运单、签收等通常放在业务 SDK。** 需要调用原生专有 SDK 的业务，再由独立业务原生模块承接。
- **按需求提供原生 HTTP。** 普通 H5 请求不必全部搬到原生；有宿主认证、原生网络 SDK、后台传输等需求时再采用。
- **后台能力必须说明平台限制。** 不承诺 App 退出后任意 JS 任务仍持续运行。
- **原生地图等嵌入式 UI 需要组件协议。** 除命令调用外，还要定义创建、布局、交互事件与销毁，不能仅靠一个 Promise 描述全部生命周期。

## 3. Promise、callback、事件如何选择

选择依据是结果的生命周期，而不是统一选某一种语法。

| 场景 | 推荐接口 | 原因 |
| --- | --- | --- |
| 查询设备信息、读取缓存、单次定位 | `Promise<T>` | 最终只有一个结果 |
| 写缓存、设置标题、打开浏览器 | `Promise<void>` 或明确结果对象 | 无返回数据也需要知道执行是否失败 |
| 网络变化、前后台切换、通知点击 | 事件订阅 | 原生主动、多次通知 |
| 连续定位、连续扫码 | 可停止的订阅 | 多次产生数据，并持有原生资源 |
| 上传、下载、长时间处理 | 任务对象 | 需要最终结果、进度与取消 |
| SDK 内已缓存的平台标识 | 同步属性或函数 | 不发生实时跨端调用 |

### 3.1 一次性操作：Promise

```ts
const position = await native.location.getCurrentPosition({
  accuracy: "high",
  timeoutMs: 10_000,
});

await native.storage.preferences.set({
  key: "selectedCompany",
  value: "company-001",
});
```

使用 `try/catch` 处理错误：

```ts
try {
  const result = await native.scanner.scanCode({
    formats: ["qrCode", "barCode"],
  });

  console.log(result.text);
} catch (error) {
  // 实际 SDK 应提供错误类型与类型判断函数。
  if (isNativeError(error) && error.code === "USER_CANCELLED") return;
  showError(error);
}
```

建议规则：

- 成功 resolve 业务结果，失败 reject 统一异常。
- 不要求调用方同时传 `success`、`fail`、`complete` 并处理 Promise。
- 需要兼容旧 callback 时，在适配层转换，不把两套使用方式扩散到全部新接口。
- 一次调用最多完成一次，重复结果或超时后的迟到结果由 SDK 丢弃并按需记录。

### 3.2 持续通知：订阅与释放

```ts
const subscription = await native.device.network.onChange((state) => {
  console.log(state.connected);
});

// 页面销毁时释放。
await subscription.remove();
```

callback 接收多次通知，外层 Promise 表示订阅是否建立成功，两者不冲突。

真实案例：Capacitor 的单次定位返回 `Promise<Position>`；持续定位使用 callback 并返回监听 ID，再调用 `clearWatch()` 停止。[定位 API](https://capacitorjs.com/docs/apis/geolocation)

建议统一规定：

- 建立订阅失败：外层 Promise reject。
- 建立后的运行错误：通过文档约定的错误事件或 `onError` 通知，不能再 reject 已完成的 Promise。
- `remove()` 幂等，重复释放不应造成异常状态。
- 页面销毁时，JS 监听与原生资源都要释放。
- 不让单个页面随意调用全局 `removeAllListeners()`，避免移除其他页面的监听。
- 区分仅取消事件接收与停止底层采集；连续定位等接口必须说明两者是否同时发生。
- 定义订阅建立过程中的事件如何缓冲，避免注册成功前产生的关键事件丢失。

### 3.3 长任务：任务对象

```ts
const task = native.transfer.upload({
  fileId: photo.fileId,
  destination: "attachment",
});

const unsubscribe = task.onProgress(({ transferred, total }) => {
  updateProgress(transferred, total);
});

try {
  const result = await task.result;
  console.log(result.fileId);
} finally {
  unsubscribe();
}
```

用户主动取消时调用：

```ts
await task.cancel();
```

建议契约：

```ts
interface Progress {
  transferred: number;
  total?: number; // 不是所有任务都能预先知道总量。
}

interface NativeTask<T> {
  id: string;
  result: Promise<T>;
  cancel(): Promise<void>;
  onProgress(listener: (progress: Progress) => void): () => void;
}
```

SDK 可以同步创建 JS 任务对象，原生启动过程仍然异步，启动失败通过 `result` reject。应缓存任务开始前的取消意图，处理“刚创建就取消”的情况。

任务契约还要定义：

- `cancel()` 成功代表取消请求已接受，还是任务已停止。
- 完成与取消同时发生时，采用哪个终态。
- 页面关闭后任务继续还是停止。
- 进度的频率与节流，避免高频事件堵塞 Bridge。
- 上传是否只完成传输，还是包含服务端业务确认。

不能仅在 JS 侧 reject，就宣称原生任务已经取消。Promise 超时也不自动意味着原生操作停止。

## 4. 底层 callback 与上层 Promise 可以共存

业务 API 返回 Promise，并不要求底层通信也原生支持 Promise。

```text
H5 业务页面
    ↓
有类型的 JS SDK：location.getCurrentPosition()
    ↓
Bridge：请求编号、序列化、超时、结果匹配
    ↓
原生方法分发器：注册表、调用校验、权限与来源检查
    ↓
Location / Camera / Files 等能力模块
    ↓
Android / iOS 系统 API 或第三方 SDK
```

一次调用的过程：

1. JS SDK 创建 Promise，保存对应的 `resolve/reject`，生成请求编号。
2. Bridge 将方法、参数、请求编号发给原生。
3. 原生校验请求并分发到能力模块。
4. 模块执行后，原生带着同一个请求编号返回结果。
5. JS SDK 找到对应 Promise，resolve 或 reject，然后清理记录。

业务层不需要知道底层回调名称、URL scheme、消息传输方式。

原生分发器不应同时承载所有能力的实现。避免每增加一个能力，就继续往同一个巨大的 `switch` / `when` 中添加完整业务流程。

## 5. 建议的通信协议

下面是自定义 Bridge 的协议示例，不是行业统一协议。

### 5.1 请求

```json
{
  "protocolVersion": 1,
  "sessionId": "webview-session-01",
  "requestId": "req-1001",
  "method": "location.getCurrent",
  "params": {
    "accuracy": "high",
    "timeoutMs": 10000
  }
}
```

### 5.2 成功响应

```json
{
  "sessionId": "webview-session-01",
  "requestId": "req-1001",
  "ok": true,
  "data": {
    "latitude": 39.9,
    "longitude": 116.4,
    "coordinateSystem": "WGS84",
    "accuracyMeters": 15
  }
}
```

### 5.3 失败响应

```json
{
  "sessionId": "webview-session-01",
  "requestId": "req-1001",
  "ok": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "未获得定位权限"
  }
}
```

SDK 解包后，业务层直接得到定位数据或异常，不必每次手动判断 `ok`。

### 5.4 事件

```json
{
  "sessionId": "webview-session-01",
  "subscriptionId": "sub-2001",
  "event": "network.changed",
  "data": {
    "connected": true,
    "connectionType": "wifi"
  }
}
```

事件使用独立的订阅编号，不混入一次性请求结果。

### 5.5 协议约束

- `requestId` 用于匹配单次请求，`subscriptionId` 用于匹配持续通知。
- `sessionId` 隔离不同 WebView 和重载前后的页面，防止结果送到错误页面；它不是调用者身份认证凭证。
- 参数与结果采用可序列化数据，不传函数、DOM 对象、循环引用对象。
- 大文件优先传受控文件标识或 URI，避免经 Bridge 反复传大段 Base64。
- 原生校验请求来源、方法白名单与参数，不能仅依赖 JS SDK 的校验。
- 不开放任意原生类名、方法名执行接口。
- 对消息大小、并发请求数、事件频率设置合理边界。

## 6. 每个 API 都应明确的契约

| 事项 | 建议规则 |
| --- | --- |
| 参数 | 使用 options 对象，明确必填、默认值、单位与范围 |
| 返回值 | 明确字段类型和空值语义；Android / iOS 不返回不同层次的 JSON |
| 时间和坐标 | 明确时间戳单位、时区、坐标系、精度单位 |
| 错误 | 稳定错误码；业务不依赖中文错误文案判断 |
| 用户取消 | 统一采用取消异常或取消结果，避免各接口随意选择 |
| 权限 | 查询不弹窗；申请显式触发；真正执行时原生仍检查授权 |
| 超时 | 区分原生操作超时与 Bridge 等待超时；用户交互不能套很短的统一超时 |
| 并发 | 相机、扫码等并发调用是排队、拒绝为 `BUSY`，还是支持并行 |
| 资源释放 | 页面关闭、WebView 销毁、取消订阅时分别清理什么 |
| 平台差异 | 不支持时明确返回 `UNSUPPORTED`，不假装成功 |
| 成功含义 | 打开拨号页不等于电话接通；打开分享面板不等于分享完成 |
| 重试 | 查询可按策略重试；有副作用的操作不能盲目自动重试 |

建议基础错误码：

```text
INVALID_ARGUMENT
UNSUPPORTED
PERMISSION_DENIED
USER_CANCELLED
TIMEOUT
BUSY
NETWORK_ERROR
NATIVE_ERROR
BRIDGE_UNAVAILABLE
```

能力模块可以增加专有错误码，例如定位服务关闭、文件不存在。原生错误细节可保留在诊断字段中，业务仍以稳定的跨平台错误码判断。

本文建议单次用户取消使用 `USER_CANCELLED`，不触发全局错误 Toast。对于确认弹窗，用户选择“否”属于正常选择，建议 resolve `{ confirmed: false }`，而非把所有否定选择都当成系统错误。

`openNavigation()` 的成功应定义成“已成功交给地图应用处理”，不能称作“导航完成”。类似规则也适用于打开设置页、拨号页、浏览器和分享面板。

## 7. 权限与能力检测

需要分清三件事：

| 检查项 | 含义 | 示例 |
| --- | --- | --- |
| 是否支持 | 宿主有没有这个方法或功能 | 当前 App 版本是否实现连续扫码 |
| 是否授权 | 用户有没有授予所需权限 | 是否允许定位 |
| 当前是否可用 | 设备或应用状态是否允许执行 | 定位服务是否开启、相机是否被占用 |

“支持定位”不等于“已授权”，也不等于“定位服务开启”。

权限可采用集中式 `permissions` 模块，也可提供 `location.checkPermissions()` 等模块级接口。项目内应保持一致；集中实现与模块封装可以共用同一原生权限管理器。

权限申请结果不宜只有布尔值，需根据平台能力表达已授权、拒绝、可申请、受限制、部分授权等状态，并说明跨平台映射。原生执行时还要再次检查，防止用户从设置页撤销权限后使用过期状态。

## 8. 生命周期与版本兼容

### 8.1 Bridge 就绪与能力握手

新 H5 插件可能运行在旧 App 上，因此需要能力握手，而不只根据 App 版本字符串猜测。

```ts
await native.bridge.ready();
const runtime = await native.bridge.getRuntimeInfo();

if (runtime.capabilities["scanner.scanCode"]) {
  await native.scanner.scanCode({});
}
```

`ready()` 只负责等待通道就绪，并返回宿主注入的 WebView 初始化数据。能力列表、协议版本和 App 版本属于后续 `getRuntimeInfo()`/`getCapabilities()` 的握手结果，不应混入 `ready()` 当前返回值。

建议握手结果包含：

- App 版本、构建编号、平台。
- Bridge 协议版本与 JS SDK 版本。
- 支持的能力与能力版本。
- 当前容器会话标识。

`ready()` 应幂等；SDK 应能识别已完成的就绪状态，避免仅监听一次事件而错过初始化时机。

新增可选字段通常可以兼容旧版本；修改已有字段含义、结果类型或成功语义，则需要版本化并保留迁移方案。

### 8.2 页面、容器与进程生命周期

- H5 页面卸载时，释放页面拥有的监听。
- WebView 销毁时，清理其待响应调用，释放相机、定位等资源。
- 前后台切换时，根据能力约定暂停、继续或终止任务。
- 原生 UI 操作在适当的 UI 线程执行，耗时 I/O 不阻塞 UI 线程。
- 不让原生异步任务长期持有已经销毁的页面或 Activity。

Promise 不能跨进程重启恢复。需要跨重启继续的任务，应持久化任务 ID 和状态，页面恢复后查询任务结果，而不是复活旧 Promise。

Capacitor 提供应用状态、深链和恢复结果事件，可作为生命周期设计参考。[App API](https://capacitorjs.com/docs/apis/app)

## 9. 调试、诊断与验证

原生能力 SDK 应具备统一诊断能力，不要求每个模块各自打印一套不一致的日志。

建议记录：

- 请求编号、会话编号、方法名。
- 开始时间、耗时、结束状态、稳定错误码。
- App 版本、构建编号、H5 插件版本、Bridge / SDK 版本。
- 需要时记录权限与设备服务状态，不记录敏感原始参数。

排查时能够区分：

1. JS 是否发出请求。
2. 原生是否收到并接受请求。
3. 能力模块是否执行完成。
4. 原生是否回传结果。
5. JS 是否找到对应调用并交付结果。

开发环境可以提供 Web 实现或 Mock，用来独立开发前端流程；Mock 应明确标识，不能把模拟成功当成真实原生能力验收。文档站交互模拟器的范围和实现建议见 [原生能力交互模拟器设计](/overview/native-api-simulator-design)。

真实设备验证除成功路径外，还应覆盖与能力有关的关键场景：拒绝权限、用户取消、页面退出、重复调用、超时、旧宿主不支持，以及长任务取消。

线上问题复现应记录具体 APK、H5 插件包及环境配置。仅说明“都是 1.0.0”通常不足以证明两个运行环境相同，可以结合构建编号或产物哈希确认。

## 10. 单个能力的文档模板

设计每个 API 时，可以使用下面的模板，避免只有一个方法名和几个参数。

```markdown
### location.getCurrent

- 用途：获取一次当前位置。
- 支持平台：Android / iOS，具体限制另列。
- 最低能力版本：1。
- 签名：getCurrent(options): Promise<Position>。
- 参数：类型、默认值、必填项、范围与单位。
- 返回值：字段类型、坐标系、精度单位、缓存数据标识。
- 权限：所需权限、是否主动申请、拒绝后的行为。
- 成功语义：拿到满足条件的位置数据。
- 错误码：授权拒绝、服务关闭、超时等。
- 超时：从何时计时、超时是否停止底层定位。
- 并发：多个调用能否共享定位结果。
- 生命周期：页面销毁后如何结束调用与释放资源。
- 平台差异：Android / iOS 的差异。
- 示例：成功、失败与取消处理。
```

## 11. 从零设计时建议采用的规则

1. JS SDK 使用 TypeScript，按能力模块提供接口。
2. 一次性调用使用 Promise，成功返回数据，失败抛统一异常。
3. 连续结果使用可释放订阅，长任务提供进度、结果和取消。
4. 原生维护方法注册表，各能力模块独立实现。
5. Bridge 统一负责请求匹配、序列化、超时、会话隔离和诊断。
6. 能力调用校验在原生落实，仅向受信任页面开放相应能力。
7. 能力检测、权限状态、当前可用状态分别表达。
8. 文档明确平台差异、最低版本、错误、取消与生命周期。
9. 业务组合放在业务 SDK，底层能力保持可复用。
10. 提供明确的 Mock / Web 实现，并保留真实设备验收。

这套设计可以在自有 Bridge 上实现，也可以参考成熟框架的插件接口。采用这些接口规则，不意味着必须迁移整个框架。

## 12. 参考资料

- [Cordova：插件开发与 cordova.exec](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)
- [Capacitor：方法类型](https://capacitorjs.com/docs/plugins/method-types)
- [Capacitor：插件目录](https://capacitorjs.com/docs/apis)
- [Capacitor：定位 API](https://capacitorjs.com/docs/apis/geolocation)
- [Capacitor：应用状态与生命周期 API](https://capacitorjs.com/docs/apis/app)
- [React Native：传统 Android 原生模块](https://reactnative.dev/docs/legacy/native-modules-android)
- [React Native：原生模块事件（Next 文档）](https://reactnative.dev/docs/next/the-new-architecture/native-modules-custom-events)

参考文档可能随框架版本更新。正式选型或实现时，应固定目标版本，再核对对应版本的接口与平台支持。
