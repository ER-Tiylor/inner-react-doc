# 原子能力与 API

本章是统一查阅入口。先区分三件事，本章也按这三类组织：

| 分类 | 谁在用 | 在哪定义 | 本章位置 |
| --- | --- | --- | --- |
| **页面代码可调用的 API** | 业务页面代码直接调用 | 业务应用 `@/assistantBinding`（函数、Hook、组件、配置） | [1. 子应用 AI 相关 API](#1-子应用-ai-相关-api) |
| **模型可调用的前端工具** | 大模型在对话中发起，浏览器执行 | 助手应用 `ai-agents/frontend`（CopilotKit `useFrontendTool` 注册） | [2. 模型前端工具](#2-模型前端工具) |
| **平台维护者扩展** | 跨应用新增能力时 | PASS 桥、助手前端、L1/L3 后端 | [3. 公共 AI 能力维护扩展](#3-公共-ai-能力维护扩展) |

页面 API 可以组合使用；工具调用顺序由模型和工具约束共同决定，不是页面中的固定工作流配置。

![页面 API、模型工具、助手前端与业务页面的能力分层](/ai/capability-layers.svg)

<a href="/ai/capability-layers.svg" target="_blank" rel="noreferrer">打开大图</a>

## 能力速查

只查“用什么、在哪写”；每项的完整参数看正文对应小节。

| 需要做什么 | 谁提供（载体） | 怎么写 | 当前边界 |
| --- | --- | --- | --- |
| 打开助手 | `@/assistantBinding` 的函数 `openAssistant`，或组件 `AssistantButton` | `openAssistant(targetId?)` | 打开共享窗口，不是创建第二个独立窗口 |
| 发起新一轮会话 | `openAssistant` 的 `options.newSession`；`AssistantButton` 的 `newSession` 属性 | `openAssistant(targetId, { newSession: true })` | 未使用的空会话可能复用 |
| 预填输入框 | `openAssistant` 的 `options.initialMessage.text` | `initialMessage: { text: '…' }` | 默认不发送 |
| 开窗后自动发送首句 | `openAssistant` 的 `options.initialMessage.autoSend` | `initialMessage: { text: '…', autoSend: true }` | 等待会话与所带数据就绪，发送一次 |
| 直接调用通用发送接口 | **没有这样的页面 API**；发送是助手前端内部实现，未对业务侧暴露 | — | 不等于助手内部没有发送实现 |
| 注册只读或可填页面 | Hook `useAssistantConfig` / `useAssistantForm` | 返回 `targetId` | 需要已连接宿主客户端 |
| 注入解释规则与页面事实 | Hook 配置项 `config.context` | `{ description, value }` | 完整业务正文使用数据快照通道 |
| 通知上下文变化 | 函数 `notifyAssistant()` | `notifyAssistant()` | 不是上传一份新业务快照 |
| 提供完整业务数据 | `openAssistant` 的 `options.initialData` | `{ type, load }` | 当前会话内存快照，不是实时订阅 |
| 扩展字段解析与联动 | Hook 配置项 `config.fields` | 字段 key → Partial&lt;IField&gt; | 复用原页面业务逻辑 |
| 取得候选原始行 | 函数 `rawRow(url, value)` | `rawRow(url, optionValue)` | 只读缓存，不发请求 |
| 查页面、跳页面、生成预览 | 模型前端工具，见[2. 模型前端工具](#2-模型前端工具) | 由模型调用 | 普通页面不直接调用工具 handler |

## 1. 子应用 AI 相关 API

以下全部从业务应用的 `@/assistantBinding` 导入：`connectAssistant`、`openAssistant`、`notifyAssistant`、`rawRow` 是普通函数；`useAssistantConfig`、`useAssistantForm` 是 Hook；`AssistantButton` 是 React 组件；`IAssistantConfig` 等是供 TypeScript 使用的类型。命名（2026-10-09）：注册 Hook 新名 `useAssistantConfig`，纯类型统一加 `I` 前缀；旧名（`useAssistantForms`、`AssistantFormConfig` 等）保留为兼容别名，存量页面不必改，新页面用新名，下文示例均已用新名。没有有效宿主连接时，开窗和通知不会执行；它们不返回业务执行结果。

```ts
// 运行时 API：函数、Hook、组件，都从这里导入
import {
  connectAssistant, openAssistant, notifyAssistant, rawRow,
  useAssistantConfig, useAssistantForm, AssistantButton,
} from '@/assistantBinding'

// 类型标注（可选）：配置类型在 describeFields 模块
import type {
  IAssistantConfig, IOpenOptions, IField,
} from '@/assistantBinding/describeFields'
```

### connectAssistant（函数）：连接宿主

**作用**：在子应用生命周期里接上 PASS 注入的助手客户端。只建立连接，不注册业务页面、不打开窗口。完整接法见 [子应用接入](./app-integration)。

```ts
connectAssistant(next?: BusinessClient): () => void
```

`next` 是 qiankun 注入的 `props.assistant`，要求协议 v2。返回断开函数，在子应用卸载时调用。

**示例**：

```tsx
// main.tsx 生命周期片段(完整接法见子应用接入)
import { connectAssistant } from '@/assistantBinding'

let disconnectAssistant = () => {}
mount(props => {
  disconnectAssistant = connectAssistant(props.assistant)
  render(props) // 本应用已有的渲染方法
})
unmount(() => {
  instance.unmount()
  disconnectAssistant()
})
```

### openAssistant（函数）：开窗并设置本次意图

**作用**：打开共享助手窗口，并声明这一轮的意图——是否新会话、首句是否自动发送、是否附带业务数据快照。业务按钮（如列表“AI 解读”）调用它。

```ts
openAssistant(targetId?: string, options?: IOpenOptions): void

interface IOpenOptions {
  newSession?: boolean
  initialMessage?: { text: string; autoSend?: boolean }
  initialData?: {
    type: string
    load: (signal?: AbortSignal) => Promise<unknown>
  }
}
```

| 参数 | 必填 | 默认/行为 |
| --- | --- | --- |
| `targetId` | 否 | 页面 hook 返回的目标 ID；多个目标时应显式传入 |
| `newSession` | 否 | 默认沿用当前会话；true 时已使用的会话换新，空会话可复用 |
| `initialMessage.text` | 提供 initialMessage 时必填 | 已生成的字符串；空白文本不会作为有效首句 |
| `initialMessage.autoSend` | 否 | 默认 false，仅预填；true 时就绪后发送一次 |
| `initialData.type` | 提供 initialData 时必填 | 业务数据类型标识，如 billingProtocol |
| `initialData.load` | 提供 initialData 时必填 | 前端读取函数，返回可 JSON 序列化的数据；失败应抛错 |

**示例**：

```tsx
import { openAssistant } from '@/assistantBinding'

// 以下均在按钮点击事件中调用
openAssistant(targetId) // 只开窗
openAssistant(targetId, { newSession: true }) // 新一轮咨询
openAssistant(targetId, {
  initialMessage: { text: '请整理当前表单', autoSend: false },
}) // 仅预填
openAssistant(targetId, {
  newSession: true,
  initialMessage: { text: '请解读这条记录', autoSend: true },
  initialData: { type: 'order', load: signal => loadOrderDetail(recordId, signal) },
}) // 页面实现 loadOrderDetail，并按自己的请求库处理 signal
```

**开窗、新会话、自动发送是三个独立选项。** 当前没有公开“再创建一个独立助手窗口”“后台无窗口发送任意消息”或指定窗口形态的页面参数。不要调用助手内部 store 来绕过公开接口。

自动发送会等待会话初始化和所带数据读取完成；用户编辑首句、关闭窗口或切换目标/会话等行为可能取消尚未执行的发送。不要将此接口当作保证执行的后台任务队列。

### useAssistantConfig（Hook）：注册一个页面目标

**作用**：把当前页面的一张或多张表单/明细登记给助手，返回 `targetId` 供开窗入口使用。页面组件内调用。

```ts
useAssistantConfig(
  sources: AssistantSource[],
  config: IAssistantConfig,
  instanceId?: string,
): string
```

`sources` 可以包含多张表单和明细，但共同组成一个目标。`instanceId` 用来区分同路由的多个页面实例，应稳定，不要每次渲染重新生成。

**示例**：

```tsx
import { useAssistantConfig } from '@/assistantBinding'

// 页面组件内;formRef/groups/visible 都来自原页面已有状态
const targetId = useAssistantConfig(
  [{ formRef, groups: formItem }],
  {
    title: '规则 · 新增',
    enabled: visible,
    questions: ['根据我提供的信息整理填写预览'],
  },
  `rule-${recordId}`,
)
```

### useAssistantForm（Hook）：单表单简写

**作用**：与 `useAssistantConfig` 完全同一个能力，只是单张 FormRef 表单时不用自己包 `sources` 数组。

```ts
useAssistantForm(formRef, groups, config, instanceId?): string
```

等价于 `useAssistantConfig([{ formRef, groups }], config, instanceId)`。`formRef` 使用本应用的表单实例类型，`groups` 是原页面传给表单的字段配置。

**示例**：

```tsx
import { useAssistantForm } from '@/assistantBinding'

const targetId = useAssistantForm(formRef, formItem, {
  title: '单据 · 新增',
  enabled: ready,
  questions: [],
})
```

### notifyAssistant（函数）：通知页面能力变化

**作用**：页面受控事实或能力变化后，通知桥重发快照，使助手重新读取 context。`context.value` 写成函数并不自动订阅数据变化。

```ts
notifyAssistant(): void
```

**示例**：

```tsx
import { notifyAssistant } from '@/assistantBinding'

// 页面组件内
useEffect(() => { notifyAssistant() }, [pageMode, dataVersion])
```

上例中的依赖由页面选择；不要在每次无关渲染时反复通知。

### rawRow（函数）：取得候选原始行

**作用**：读取候选请求缓存的原始行，方便原页面联动使用候选附带的地址等信息。

```ts
rawRow(url: string, value: unknown): Record<string, unknown> | undefined
```

它不会发请求；只有对应下拉经过 `ensureOptions` 加载后才可能命中。不要把它当详情查询接口。

**示例**：

```ts
import { rawRow } from '@/assistantBinding'

// 在字段 apply/联动里取候选附带的其他信息,如选中客户后带出地址
const candidate = rawRow('/web/customer/list', values.customerCode)
if (candidate?.address) form.setFieldValue('address', candidate.address)
```

### AssistantButton（组件）：页面内的开窗入口

**作用**：放在页面上的助手按钮，点击即 `openAssistant`。

| 属性 | 类型 | 默认值/用途 |
| --- | --- | --- |
| `targetId` | string | 可选，显式指定目标 |
| `ghost` | boolean | true；纯问答入口通常设 false |
| `newSession` | boolean | false；沿用当前会话 |
| `children` | ReactNode | “AI 智能填写” |

**示例**：

```tsx
import { AssistantButton } from '@/assistantBinding'

// targetId 来自本页 useAssistantConfig/useAssistantForm 的返回值
<AssistantButton targetId={targetId} ghost={false} newSession>
  咨询 Agent
</AssistantButton>
```

当前组件没有 `initialMessage/initialData` 属性。需要带首句、带数据时，用页面自己的按钮调用 `openAssistant`。

### IAssistantConfig（类型）：Hook 的页面配置

`useAssistantConfig` / `useAssistantForm` 的第二个参数。

| 配置 | 类型 | 要求与含义 |
| --- | --- | --- |
| `title` | string | 必填，目标和预览标题 |
| `enabled` | boolean | 必填，真实可用时才注册，抽屉关闭或数据未就绪时关闭 |
| `questions` | string[] | 必填，可传空数组；展示给用户的建议提问，不是系统提示 |
| `kind` | form / chat | 默认 form；chat 为只读咨询 |
| `context` | `{ description, value }` | 可选；value 是对象或返回对象的函数 |
| `defaults` | Record | 可选；补充页面认可的默认值，不等于原文识别结果 |
| `fields` | 字段 key → Partial&lt;IField&gt; | 可选，补充或覆盖字段描述 |

context 进入系统上下文，适合代码维护的规则和受控页面事实。用户可编辑正文、完整合同和记录数据走 `initialData`，通过工具结果供模型引用。固定指令与运行数据不要混为一段提示。

### 通道选择：什么信息走哪条通道

| 要传的内容 | 通道 | 原因 |
| --- | --- | --- |
| 跨记录稳定成立的页面事实和解读口径 | Hook 的 `config.context` | 桥快照在激活/notify 时重发，会话全程生效；用户手动开窗也读得到 |
| 这一次想问什么 | `openAssistant` 的 `initialMessage` | 成为会话首句用户消息，进入历史 |
| 本条记录的完整业务数据 | `openAssistant` 的 `initialData` | 每次点击单独读取，进会话快照，模型用 `get_conversation_data` 取 |
| 展示给用户的快捷提问 | `config.questions` | 只是界面建议，不进提示词 |

context 不放进开窗意图：开窗只发生一次，页面能力事实却被模型持续读取。表达“能力”放注册通道，表达“这一次”放 `IOpenOptions`。

“点击记录解读”的最小组合——页面没有表单，hook 这一遍仍是必需的，它是口径的落点：

```tsx
// 注册页面解读能力:口径跨记录稳定,放 context;来源为空 + kind chat
const targetId = useAssistantConfig([], {
  title: '计费协议 · AI 解读', enabled: ready, kind: 'chat', questions: [],
  context: { description: '解读口径', value: () => ({ instruction: '先取会话数据,缺失时说明,不猜测。' }) },
}, 'protocol-interpret')

// 点击某条记录:数据与首句每次不同,放开窗意图
openAssistant(targetId, {
  newSession: true,
  initialMessage: { text: '请解读这条协议，说明关键条款和待核对事项', autoSend: true },
  initialData: { type: 'billingProtocol', load: signal => loadDetail(recordId, signal) },
})
```

### context 与会话快照（get_conversation_data）：两条注入通道的本质差异

两条通道不是“内容多少”的区别，是**到达模型的方式不同**，所以不能互相替代：

| 维度 | `config.context` | `initialData` → `get_conversation_data` |
| --- | --- | --- |
| 到达方式 | 后端每轮对话前拼进**系统提示词**，模型必然看到，不需要任何动作 | 存进前端**会话内存快照**，模型必须**主动调用** `get_conversation_data` 才拿得到 |
| 新鲜度 | 活的——`value` 函数在页面激活/`notifyAssistant()` 时重新执行、重发快照，跨会话持续生效 | 定格的——开窗那一刻由 `load` 读一次定稿，notify 不更新；换记录要重新开窗带新快照 |
| 绑定对象 | 绑**页面 target**：该 target 激活期间任何会话都读得到，用户手动开窗也生效 | 绑**一次会话**：与 threadId/snapshotId 绑定，别的会话读不到 |
| 容量 | 占系统提示词，只放口径/受控事实（百字到千字级） | 面向完整业务数据，序列化上限 240000 字符，超限报错不产半份快照 |
| 失败形态 | 页面事实变了没 notify → 读到旧口径 | `load` 抛错可重试；模型没调工具 → 正文只有名称没有明细 |

所以解读场景要两条一起用：**口径放 context**（“先取会话数据，缺失时说明，不猜测”这类跨记录稳定的指令），**数据放快照**（这条记录的完整明细）。把完整数据塞 context 会撑爆系统提示词，把口径只写在 `initialMessage` 里则只有首句那轮有效。

其余几条数据入口同样各管一段，不要混用：

| 入口 | 内容 | 特点 |
| --- | --- | --- |
| `get_current_form_context` | 页面表单的**实时**字段、候选、当前值 | 每次现取，是“填写现场”；与快照（后端业务数据）互补，不能拿它当详情查询 |
| 用户消息 / 对话内附件 | 用户自己输入的文字、上传的文件 | 进会话历史；附件由后端提取正文，解析失败或内容缺失不是页面 API 能兜的 |
| `initialMessage` | 这一次要问什么 | 一次性用户消息，进历史；不是持续生效的系统提示 |
| `config.questions` | 界面建议提问 | 只展示给用户，**不进提示词**，模型看不到 |

### 浮窗、target、会话、快照：对象关系与生命周期

这条链上共有四层对象，各活各的，排障时先确认问题在哪一层：

| 对象 | 粒度 | 创建 | 失效/销毁 |
| --- | --- | --- | --- |
| **助手浮窗** | 全平台共享一个（PASS 宿主） | 宿主加载助手 | 关窗只是隐藏，不销毁会话；没有“再开一个独立窗口”的 API |
| **target（targetId）** | 一个页面注册目标 | Hook 注册且 `enabled=true` | `enabled` 转 false 即不注册；页面组件卸载注销；keep-alive 切走的路由**不再是当前 target**，切回时由宿主重放快照 |
| **会话（threadId）** | 浮窗里的一条对话线 | 开窗时初始化 | `newSession: true` 开窗时换新一条（当前会话还没聊过会复用，连点不多出空会话）；历史消息由后端持久化，跨刷新可查 |
| **业务数据快照（snapshotId）** | 一次带 `initialData` 的开窗 | `load` 完成、会话初始化后定稿 | 重新开窗带新数据即换快照；只存前端内存，刷新丢失（历史卡片从已落库的数据工具结果恢复）；切会话/关加载窗会取消未完成的 `load` |

绑定关系：**浮窗 → 当前会话 → 当前快照**是一条线；**target → context** 是另一条线（context 绑 target 现取，与哪条会话无关）。几条常见误区：

1. **关窗 ≠ 结束会话。** 再次开窗沿用上一条会话；要隔离上一轮讨论，才用 `newSession`。
2. **切路由 / 换页面不换会话。** 会话跟着浮窗，不跟路由。但模型能操作的 target 跟着“当前激活页面”走——填表填到一半跳去别的页面，写入通道就断了，这就是场景五要求“跳页后重读目标表单”的原因。
3. **换会话不影响页面 context，但使旧快照失效。** context 在每轮对话前按当前激活 target 重拼；旧会话的快照属于旧 threadId，新会话里 `get_conversation_data` 读不到——所以“点击记录解读”每次都重新开窗、现场 `load`。
4. **来源页卸载后，会话里已读的数据仍可继续用**（快照不随页面销毁），但**不能再回去写来源页**——target 没了，字段 key、旧草稿都不能沿用。
5. **同路由多个页面实例（keep-alive 多 tab）必须给可区分的 `instanceId`**，否则宿主报“重复实例”；页面上活着两个 target 时宿主选不中，每个开窗入口都要**显式传 `targetId`**。

### 三种页面数据来源：Hook 的 sources 参数

![多种来源合成一个填写目标](/ai/form-sources.svg)

| 来源 | 必需配置 | 读取/写入方式 |
| --- | --- | --- |
| FormRefSource | `formRef, groups` | 现有表单实例 |
| TableSource | `tableRef, columns, name, label`；`rowKey` 可选，默认 id | 同步 `getDataSync()` / `setData(rows)`，整体作为对象数组 |
| PageSource | `read, write` | 页面提供同步读取和字段路径写入 |

`PageSource.read(): Values`，`write(changes: { path: (string | number)[]; value: unknown }[]): void`。自定义字段需要在 fields 声明 `register: true`、`label`、`type`。读取不能返回 Promise。

### 字段扩展能力

`config.fields` 这部分供复杂表单使用。字段逻辑与原页面一致；普通控件能推导的内容无需重复配置。

| 配置 | 作用/参数 |
| --- | --- |
| `type` | text / number / select / date / dateRange / objectArray / unsupported |
| `register, label` | 注册非普通表单项的字段；register=true 时 label/type 必需 |
| `options` | `{ label: string, value: string \| number \| boolean }[]` |
| `lookup` | `{ url, method?: 'get' \| 'post', params?, valueKey?, labelKey? }`；候选请求复用页面客户端 |
| `multiple, required, blocked` | 多选、必填描述、不可写原因 |
| `resolve(input, values)` | 异步解析逻辑输入，返回目标值；同输入需确定输出 |
| `toFormValue(value, display?)` | 转为控件接受的值 |
| `fromFormValue(value)` | 回读时还原逻辑值 |
| `apply(value)` | 执行原页面联动，返回 void 或 Promise；参数为转换后的控件值 |
| `dependsOn` | 上游字段 key 数组 |
| `prepare(value)` | 返回 Promise&lt;{ options, reset }&gt;，准备目标候选及重置字段清单 |
| `hidden(values)` | 基于目标值判断是否隐藏 |
| `derive(value)` | 生成预览派生值，实际落表由页面联动完成 |
| `candidate(value, values)` | 高级配置：返回目标候选值对象，供引擎构造目标状态 |
| `commitLast` | 高级配置：将字段写入安排在后面，不替代依赖与校验 |
| `itemFields` | 对象数组的列描述，见下方 |

`lookup` 的参数和取值键要与页面实际下拉一致。候选无法唯一匹配时报告问题，不放宽租户、主体或权限来“匹配成功”。

`itemFields` 每列包含 `key, label`，可选 `aliases: string[]`、`format: 'text' | 'date' | 'dateRange'`、`optionsFrom: 'dropdown'`。列 key 对应解析后的数据，列描述本身不会替你完成对象数组的业务解析。

## 2. 模型前端工具

以下工具由助手前端（`ai-agents/frontend`）通过 CopilotKit `useFrontendTool` 注册给 L1 模型，**不是业务页面需要自行调用的 JS 方法**。工具是全量注册的，“该不该调”由模型按描述决定，页面状态不满足时由工具自身返回 `{ error }` 兜住——不能只看工具请求完成就宣称业务成功。

| 工具 | 功能简述 | 用途 | 输入参数 | 主要输出与边界 |
| --- | --- | --- | --- | --- |
| `get_conversation_data` | 读本次会话的业务数据快照 | 读取业务入口（`openAssistant` 的 `initialData.load`）为当前会话提供的完整数据快照；解读业务数据前模型的第一个动作 | `{}` | snapshotId、type、payload；仅读取当前入口快照，不查任意接口 |
| `get_current_form_context` | 读当前页面真实字段与值 | 读取当前页面目标真实存在的字段、类型、候选、当前值和默认值；每次填写或修改前必先调用，模型只能用返回的字段 key | `{}` | targetId、title、fields、values、defaults；目标缺失或 chat 模式返回错误 |
| `prepare_form_fill` | 生成填写预览 | 把模型整理的字段值交前端解析候选、生成确认预览；**仅预览，写入由用户点确认** | `{ targetId: string, values: Record, baseDraftId?: string }` | 草稿 ID、预览行及可填数量；确认前复核页面与字段状态 |
| `get_system_pages` | 查可用页面目录 | 在系统页面目录中按关键字/应用/类型查注册页面；跳转前必须先查准确路径，不得编造 | `{ keyword?, appId?, kind?: 'create' \| 'edit' \| 'view' \| 'copy' \| 'other' }` | total、truncated、pages；最多返回 80 条 |
| `get_system_menu` | 页面目录的别名 | `get_system_pages` 的兼容别名，不带筛选 | `{}` | 同上，最多 80 条 |
| `open_page` | 打开指定页面 | 按目录返回的完整路径打开页面；要写表单时必须 `waitFor='form'` 等目标就绪 | `{ path: string, waitFor?: 'route' \| 'form' }` | 成功页面信息，form 模式还返回 targetId；默认 route |

修订预览时，`baseDraftId` 指向当前 ready 草稿，values 可只包含本轮修改。没有“模型直接确认填写”工具；普通填表不自动保存、审批或提交。

`open_page` 必须使用目录返回的路径。form 模式等待目标唯一、激活且字段就绪，当前超时 15 秒。它不会自动打开未注册的抽屉。当前助手按完整 path 匹配目录，带 query 的场景需单独验证，不能仅依据宿主支持参数导航就承诺可用。

### 图表展示能力：renderLineChart

**实现方式**：CopilotKit `useComponent` 注册的生成式 UI 组件（`ai-agents/frontend` `chart.tsx`）。模型判断需要画图时调用 `renderLineChart` 并把数据作为参数传入，前端用参数渲染组件——纯 SVG 手绘折线，不依赖任何图表库；数据完全来自模型，组件只负责画。参数在流式拼接过程中就可能渲染，缺字段时显示“折线图无数据”空态，不报错。

**支持的图表**：目前只有**多系列折线图**这一种（带数据点、图例、Y 轴刻度线和单位标注；配色 6 色循环）。不支持柱状、饼图、面积图、堆叠等；需要新类型时要由维护者在助手前端新增注册。

```ts
{
  title?: string                                        // 图表标题
  labels: string[]                                      // X 轴标签, 如 ["1月","2月"]
  unit?: string                                         // Y 轴单位说明, 如 "万元"
  series: { name: string; data: number[] }[]            // 一个或多个数据系列
}
```

每个数据系列长度应与 labels 一致。组件只画模型给的数据，不查询业务、不验证指标口径，也不写表单；数值口径（单位、系列名）以模型给出的为准。

### 录入 Prompt 复制卡片：AI_FILL_PROMPT 位置标记

**场景**：BMS 计费协议 AI 解读（事务协议）。每条事务规则展开末尾出现一张「AI录入Prompt」复制卡片；把卡片文本粘贴到新建协议规则表单的助手输入框，即可解析预览并填入该规则。

**实现方式**：录入文本不由模型生成——页面拼装函数（`yoohoo-bms/frontend` `interpretation/fillPrompt.ts`）逐字段拼成 `fillPrompts: { 规则ID: 文本 }` 放进会话快照；解读 Prompt（promptVersion 28）要求模型在每条规则展开结束后另起一行输出标记 `[[AI_FILL_PROMPT:<snapshotId>:<规则ID>]]`，只给路径、不复述文本。助手前端识别正文中的标记，将其原地替换为卡片（标题 +「查看内容」折叠预览 + 复制按钮）；代码块和表格单元格内的标记不生效，流式半截标记等补齐后再渲染。`snapshotId` 用于锁定本次快照，防止跨会话/跨记录错配。

**文本来源与历史恢复**：当前会话读内存快照；历史会话从已落库的 `get_conversation_data` 工具结果按对应工具调用恢复。结果在更早的分页时，卡片显示「恢复录入文本」按钮，由用户点击手动向前查找，打开历史不自动触发。找不到时提示历史未保存，从业务入口重新发起解读即可。

**边界**：卡片只负责展示和复制，不写表单；周期协议没有录入文本，不出卡片；旧 `renderFillPromptCard` 前端工具注册保留，仅用于回放存量历史消息。

## 3. 公共 AI 能力维护扩展

| 扩展 | 落点 |
| --- | --- |
| 新增普通业务场景 | 优先组合本章 API、context、字段与数据来源 |
| 新增浏览器执行动作 | ai-agents 前端注册工具，定义参数、结果、错误和目标校验 |
| 新增后端业务查询/场景 | L1/L3 工具与业务接口，沿原权限和业务约束接入 |
| 修改跨应用协议 | PASS 桥接类型/实现，配套同步助手和业务适配层 |

底层 `BusinessClient` 提供 `register(port)`（返回注销函数）、`notify()`、`open(targetId?, options?)`、`dispose()`；页面通常使用 hook 包装，不直接管理这些生命周期。助手侧 `AssistantClient` 提供快照订阅和 `getPort(id)`，不属于普通页面 API。

后端场景工具由 L1 装配和部署配置决定，本章的前端清单不能当成全部后端能力清单。新增工具后，还需验证 L1 实际路由与工具选择，注册成功不等于模型一定调用。
