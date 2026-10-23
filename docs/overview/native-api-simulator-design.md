# 原生能力交互模拟器设计

编写日期：2026-10-22

本文评估在文档站中增加一个 App 外壳和“原生能力调试”页面，用浏览器模拟部分 JS-Bridge API 行为。本文只确定目标、边界和实现方案，不包含模拟器代码。

## 结论

这个功能可行，首版难度为 **中等**。当前文档站已经使用 Rspress、MDX 和 React，也有可直接嵌入文档的 React 演示组件，因此不需要新建站点或引入第二套运行环境。

真正需要控制的不是手机外壳样式，而是模拟结果的可信度。推荐建设“契约级模拟器”：它按照公开 API 的参数、Promise、返回值和错误码模拟交互，让开发者理解调用过程；它不模拟 Android/iOS 的真实权限、第三方 SDK、系统页面和网络环境，也不能替代真机验收。

首版建议只覆盖 6～8 个具有代表性的 API。若一开始追求与真实 App 调试页完全同构、运行原 H5 产物并覆盖全部 Native 行为，复杂度会从中等升到较高，而且文档站会与具体项目产生不必要的耦合。

## 目标

模拟器应帮助开发者快速回答以下问题：

1. 这个 API 会触发什么界面或用户动作？
2. 应该传入什么参数？
3. Promise 何时 resolve 或 reject？
4. 成功结果、用户取消、权限拒绝和超时分别长什么样？
5. “指令已派发”和“业务操作已完成”有什么区别？

它同时承担文档示例、API 行为教学和前端流程预演三种用途，但不承担原生实现验收。

## 不做的事情

- 不调用真实定位、相机、相册、文件选择器、拨号和地图应用。
- 不向真实服务上传文件，也不请求业务接口。
- 不模拟具体项目的品牌、域名、Cookie、页面名称或内部 Bridge action。
- 不宣称 Mock 成功等于 Android 或 iOS 已实现、已授权或已验证。
- 不直接嵌入某个业务 H5 的构建产物作为公共文档的一部分。

## 推荐的展示形式

### 页面布局

桌面端使用左右布局：

```text
┌────────────────── App 外壳 ──────────────────┐  ┌──── 调用控制台 ────┐
│  原生能力调试                                 │  │ API 与功能说明      │
│                                              │  │ 参数编辑器           │
│  运行环境：Web Mock                          │  │ 模拟场景             │
│                                              │  │ 成功 / 取消 / 拒绝…  │
│  定位、地图与扫码                            │  │                      │
│  获取当前位置                                │  │ 调用代码             │
│  native.location.getCurrentPosition() [调用] │  │ Promise 结果         │
│                                              │  │                      │
│  调用日志                                    │  │                      │
└──────────────────────────────────────────────┘  └──────────────────────┘
```

移动端改为上下布局，App 外壳不强制保持固定手机尺寸，避免在手机浏览器里形成“双重手机边框”。

### App 外壳

外壳建议使用 CSS 绘制圆角、状态栏、安全区和底部手势条，不使用整张手机截图。CSS 外壳更容易适配明暗主题、窄屏和高分屏，也不会引入设备品牌版权或与某一机型绑定。

外壳内部采用中性的公共 SDK 视觉，不复刻具体业务 App 的品牌色、导航文案和数据。顶部始终显示醒目的 `Web Mock` 标识。

### 调试页面

模拟页面可以沿用真实调试页的有效交互模型：

- 按能力分类展示方法。
- 每项先显示功能行为，再显示完整 API 名称。
- 参数可编辑，并在调用前校验 JSON。
- 调用后记录时间、耗时、状态、参数和结果。
- 状态明确区分“等待结果”“成功”“已派发”“失败”“超时”。
- 危险操作使用明显样式，但在 Web 中只模拟页面状态，不执行真实退出或关闭。

## 推荐技术方案

### 方案 A：React 契约模拟器，推荐

在文档站的 `playground` 目录新增 React 组件，由 MDX 页面直接引入：

```tsx
import NativeCapabilityPlayground from '../../../playground/native-capabilities/preview';

<NativeCapabilityPlayground />
```

模拟器只依赖一个能力目录和一个 Mock Runtime：

```text
MDX 文档页
  → NativeCapabilityPlayground
    → Capability Catalog：名称、说明、参数、场景、结果
    → Mock Runtime：延迟、resolve、reject、事件推送
    → Phone Shell：调试页视觉和用户交互
    → Call Log：参数、结果、错误与耗时
```

优点：

- 与现有 Rspress、React 和 MDX 技术栈一致。
- 可以精确演示 Promise 和错误语义。
- 不依赖真实 App、业务 H5 构建和 Bridge 注入。
- 可按 API 逐步增加场景，适合公共文档长期维护。

限制：

- 调试页 UI 需要在 React 中重新表达一次。
- 如果能力目录手工维护，可能与真实 SDK 发生漂移，需要校验机制。

### 方案 B：iframe 加独立 H5 演示应用

单独构建一个移动端 H5，并在 iframe 中注入 Web Bridge Shim。它的视觉可以更接近真实 App 页面，也能独立部署。

这个方案适合未来演示复杂页面流程，首版不推荐。它会增加独立构建、路由、跨窗口通信、部署路径和版本同步成本；如果直接使用某个业务 H5，还会把项目配置和公共文档耦合在一起。

### 方案 C：直接复用现有 Vue 调试页

当前文档站使用 React，而现有调试页依赖 Vue、uni-app、全局样式变量和宿主运行环境。直接复用需要把 Vue/uni-app 产物作为独立应用嵌入，本质上仍会演变成方案 B。为了复用一页 UI 引入双框架和业务构建链，收益不足。

## 能力目录设计

所有可演示能力应由一个声明式目录驱动，不要在界面组件中逐项硬编码：

```ts
interface CapabilityDemo {
  id: string;
  category: string;
  api: string;
  title: string;
  description: string;
  mode: 'result' | 'dispatch' | 'subscription';
  defaultParams?: unknown;
  scenarios: MockScenario[];
}

interface MockScenario {
  id: string;
  label: string;
  delayMs?: number;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
}
```

能力目录同时驱动 App 外壳中的方法列表、右侧场景选择器和调用日志，避免三个区域分别维护同一份信息。

长期可将能力目录抽成与 JS SDK 一起发布的无运行时 JSON 或 TypeScript 元数据。文档站构建时校验 API 名称、参数示例和错误码，减少实现与文档漂移。首版可以先在文档站维护，但字段结构应为后续共享预留空间。

## Mock Runtime

Mock Runtime 应提供与公共 API 相同的调用体验，但实现保持纯浏览器化：

```ts
const mockNative = createMockNative({
  scenario: {
    'location.getCurrentPosition': 'success',
  },
});

const result = await mockNative.location.getCurrentPosition();
```

每个能力至少可以配置以下场景中的适用项：

| 场景 | 表现 |
| --- | --- |
| 成功 | 延迟后 resolve 文档约定的返回对象 |
| 已派发 | resolve `undefined`，日志标记为“已派发” |
| 用户取消 | reject `NativeBridgeError(USER_CANCELLED)` |
| 权限拒绝 | reject `NativeBridgeError(PERMISSION_DENIED)` |
| 不支持 | reject `NativeBridgeError(UNSUPPORTED)` |
| 超时 | 延迟到阈值后 reject `NativeBridgeError(TIMEOUT)` |
| 并发冲突 | 第二次独占调用 reject `NativeBridgeError(BUSY)` |

Mock 延迟应可见但不宜过长，推荐默认 300～800 ms。超时场景可以使用缩短后的演示时钟，并在界面中说明真实 SDK 的超时配置可能不同。

## 首批能力范围

首版不追求数量，优先覆盖不同异步模型和用户交互：

| API | 演示价值 | 建议场景 |
| --- | --- | --- |
| `native.bridge.ready()` | 解释自动等待和初始化数据 | 成功、就绪超时 |
| `native.ui.showConfirm()` | 展示正常取消不是异常 | 确认、取消 |
| `native.ui.showToast()` | 展示指令型 Promise | 已派发 |
| `native.location.getCurrentPosition()` | 展示权限和单次结果 | 成功、权限拒绝、定位失败 |
| `native.scanner.scanCode()` | 展示独占界面和用户取消 | 成功、取消、权限拒绝、BUSY |
| `native.media.chooseAndUploadImages()` | 展示组合能力 | 成功、取消、上传失败 |
| `native.storage.set/get()` | 展示有状态 Mock | 写入、读取、未命中 |
| `native.events.addListener()` | 展示持续结果和释放 | 订阅、触发、移除 |

`exitApp()`、`webview.close()`、拨号、外部浏览器和地图导航可以在后续加入。它们只应展示确认过程和“已派发”日志，不能真的离开文档页。文件上传和 Native HTTP 首版也不连接网络，只返回明确标记为模拟数据的结果。

## 交互细节

### 参数编辑

首版可用等宽字体的 JSON `textarea`，配合“恢复默认值”和调用前解析错误提示。暂不需要引入完整代码编辑器；Monaco 会显著增加包体和维护成本。

### 原生界面模拟

- `showConfirm`：在手机外壳内部显示模拟原生弹窗。
- `showToast`：在外壳内部显示短时 Toast。
- 定位：显示“正在定位”状态后返回模拟坐标。
- 扫码：显示简化扫码层，允许选择“扫描成功”或“取消”。
- 选择图片：展示通用的相册/相机选择层和上传进度，不展示真实用户文件。
- 系统设置、外部浏览器和地图：展示离开 App 的确认卡片和派发结果。

这些界面用于解释行为，不应冒充 Android 或 iOS 的像素级系统 UI。

### 代码与结果联动

右侧同步显示当前方法的调用代码。参数修改后，代码片段同步更新；调用完成后，结果面板显示与日志一致的 JSON 或标准错误对象。这样模拟器既是视觉演示，也是可复制的 API 示例生成器。

## 难点和控制方式

| 难点 | 风险 | 控制方式 |
| --- | --- | --- |
| 模拟结果被误认为真机结果 | 开发者跳过设备验证 | 始终显示 `Web Mock`，在日志 UI 标记模拟来源，文档写明验收边界；不污染 API 返回对象 |
| 文档与 SDK 漂移 | API 名称或字段过期 | 单一能力目录；后续由 SDK 导出元数据并做构建校验 |
| 真实调试页与文档演示重复维护 | 修改需要做两遍 | 复用契约和测试数据，不追求复用业务 UI 源码 |
| 手机外壳挤压文档布局 | 小屏不可用 | 桌面左右布局、移动端上下布局；移动端弱化外框 |
| Mock 场景越来越像业务测试平台 | 范围失控 | 只覆盖公共 API 的稳定行为，不加入业务表单和接口数据 |
| 上传、定位等能力难以真实模拟 | 演示失真 | 模拟交互与契约，不访问真实设备和服务 |

## 目录建议

```text
playground/native-capabilities/
  preview.tsx              # 文档页入口
  NativePhoneShell.tsx     # App 外壳
  NativeDebugPanel.tsx     # 能力列表与调用日志
  CapabilityConsole.tsx    # 参数、场景、代码和结果
  capabilityCatalog.ts     # 能力及场景元数据
  mockNative.ts            # Promise、错误和订阅模拟
  types.ts
  styles.css

docs/components/js-bridge/
  playground.mdx           # 后续交互演示页
```

本规划文档放在治理规划中；模拟器实现后，在 JS-Bridge 分类下新增“交互演示”页面，并从能力总览链接过去。不要把完整模拟器塞进每个 API 文档，单个 API 页面只按需嵌入小型示例或深链到模拟器中的对应能力。

## 分阶段实施

### 第一阶段：静态外壳与代表性 API

- 实现响应式 App 外壳、能力列表、参数编辑和调用日志。
- 接入 `ready`、确认框、Toast、定位、扫码和 Storage。
- 覆盖成功、取消、权限拒绝、超时和已派发状态。
- 在界面和结果中明确标记 Web Mock。

这一阶段可以验证整体体验，工作量主要在交互状态和视觉适配，风险可控。

### 第二阶段：组合能力与事件

- 增加选择并上传图片、事件订阅和并发冲突。
- 增加模拟上传进度、事件手动触发与释放状态。
- 将代码片段与参数编辑器联动。

### 第三阶段：契约同步

- 从公共 JS SDK 导出能力元数据或类型声明。
- 文档构建时校验能力名称、示例参数和标准错误码。
- 根据需要增加深链，使 API 文档能直接打开对应模拟场景。

## 验收标准

首版满足以下条件即可认为完成：

- 开发者无需阅读源码就能理解所演示 API 的功能和 Promise 语义。
- 桌面和手机浏览器均可操作，不产生横向溢出。
- 所有操作明确标识为 Mock，不发送真实业务请求。
- 成功、已派发、取消、权限拒绝和超时在视觉与日志中可区分。
- 示例 API 名称、参数、返回值和错误码与 JS-Bridge 文档一致。
- 页面刷新后不残留订阅、计时器或模拟任务。
- Rspress 构建通过，模拟器不会明显拖慢其他文档页的首屏加载。

## 工作量判断

只实现 App 外壳图片和静态页面很容易，但文档价值有限。推荐的首版需要处理可编辑参数、Mock Promise、原生交互层、错误场景、调用日志和响应式布局，因此属于中等工作量。

复杂度应停在“帮助理解契约和流程”这一层。只要不追求运行现有业务 H5、不连接真实服务、不复刻完整系统 UI，也不把它当作真机测试平台，这个方案可以稳定演进，并且适合当前文档站。
