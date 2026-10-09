# 场景组合与示例

前提：[子应用接入](./app-integration) 已完成。下面展示如何组合已有能力；接口的完整参数统一查 [原子能力与 API](./atomic-capabilities)，不在每个场景重复定义。

![五类场景的能力组合与结果边界](/ai/scenario-composition.svg)

<a href="/ai/scenario-composition.svg" target="_blank" rel="noreferrer">打开大图</a>

## 场景速查

| 场景 | 能力组合 | 当前落点 |
| --- | --- | --- |
| 当前页只读咨询 | chat target + context + 开窗 | TMS 车辆检查详情等页面 |
| 点击业务记录立即解读 | chat target + 新会话 + 数据快照 + 自动首句 | BMS 计费协议列表 |
| 文字或附件填表 | form target + 字段描述 + 候选/联动 + 预览确认 | BMS 规则等已接入表单 |
| 多表单与自定义明细一起填写 | 多种来源 + 一个 target + 字段扩展 | BMS 条件树、阶梯明细 |
| 解读后跳页继续填写 | 会话快照 + 页面目录 + 等待表单 + 重读字段 | 已有平台能力，目标页必须逐页接入和验收 |

已有页面是接法参考，不是可以直接复制到任何应用的业务模板。自动化程度由数据、字段覆盖、页面状态及模型实际工具选择共同决定。

## 场景一：当前页只读咨询

适合解释页面含义或已经提供的数据，不修改表单。

![页面说明与业务数据使用不同通道](/ai/qa-channels.svg)

下面片段放在现有页面组件内，`ready/detailId` 来自页面状态：

```tsx
const targetId = useAssistantConfig([], {
  title: '业务详情 · 咨询', enabled: ready, kind: 'chat',
  questions: ['说明当前页面可以咨询的内容'],
  context: {
    description: '只读咨询口径',
    value: () => ({ instruction: '依据已提供数据回答；没有依据时说明缺失，不执行填写。' }),
  },
}, `consult-${detailId}`)

<AssistantButton targetId={targetId} ghost={false} newSession>
  咨询 Agent
</AssistantButton>
```

上述 API 从 `@/assistantBinding` 导入。页面负责稳定的实体/实例标识、可用状态和受控解释规则。只开窗不会自动读取详情接口；要解释完整记录时接场景二的数据能力。

**验收**：实体不串、缺失数据不猜测、chat 目标不能写表单；受控事实变化后使用 notifyAssistant 通知更新。

## 场景二：点击记录立即解读

适合列表的“AI 解读”按钮。核心不是把列表行塞进提示词，而是通过页面接口读取所需详情。

![业务数据加载与首句发送顺序](/ai/data-lifecycle.svg)

先注册场景一的只读目标，再在业务按钮事件中组合：

```tsx
openAssistant(targetId, {
  newSession: true,
  initialMessage: { text: '请解读这条协议，说明关键条款和待核对事项', autoSend: true },
  initialData: {
    type: 'billingProtocol',
    load: signal => loadFullProtocolDetail(selectedRow, liability, signal),
  },
})
```

`loadFullProtocolDetail` 是页面自己的函数，不是 SDK 方法；`selectedRow/liability` 是页面业务参数。读取详情及必要明细，复用已有认证与筛选范围。列表摘要不能冒充完整记录。

context 可规定解释顺序、先读取会话数据、缺失时说明；完整数据由模型调用 `get_conversation_data` 取得。自动发送等待数据就绪，读取失败可重试。计费协议类解读还会在每条事务规则展开末尾给出「AI录入Prompt」复制卡片，卡片文本由页面拼装、粘贴进规则表单助手即可填入（见 [原子能力](./atomic-capabilities#录入-prompt-复制卡片ai_fill_prompt-位置标记)）。

当前快照只在内存中，不是实时订阅；刷新后不能承诺恢复。当前序列化数据上限 240000 个字符，超限会报错，不要静默截掉关键条款。

**验收**：成功、失败重试、连点、换记录和取消读取都不重复发首句、不串数据。参考 BMS `frontend/src/views/pricingrules/costprotocol/index.tsx`。

## 场景三：文字或附件填写表单

适合用户描述要求，或上传文件后整理页面字段。

```tsx
const targetId = useAssistantConfig([{ formRef: formref, groups: formItem }], {
  title: '规则 · 新增',
  enabled: visible && editable && ready,
  questions: ['根据我提供的信息整理填写预览'],
  fields: {
    costInfoId: { type: 'select' },
    // 页面已有候选声明时复用；联动字段按真实函数补 apply。
  },
}, `rule-${instanceKey}`)

<AssistantButton targetId={targetId} />
```

变量来自原页面；示例字段不能直接照搬到其他表单。普通字段由原控件推导，复杂字段通过 [字段扩展](./atomic-capabilities#字段扩展能力) 补齐。候选匹配仍执行原页面范围。

流程为读取真实字段 → 模型整理输入 → 前端生成预览 → 用户修订/确认 → 页面写入与联动。文件先由后端提取正文；解析、语义理解、字段映射和页面写入是不同步骤，context 不能补回未提取的内容。

解释 context 应记录有适用条件的映射。例如“按趟收费”与页面周期的关系，而非对所有文件默认“周期否”。案例 ID、金额和日期不得作为通用默认值。

**验收**：原文依据、候选结果、预览问题、真实控件、原页面试算分别检查。确认填入不等于保存。参考 BMS `Rules/EditRule/` 的条件、阶梯和 context 模块。

## 场景四：同页多个来源共同填写

一项任务同时包含主表单、编辑表格和自定义状态时，用一个 target 接入。

![多个来源合成一个目标](/ai/form-sources.svg)

```tsx
const targetId = useAssistantConfig([
  { formRef: formref, groups: formItem },
  { tableRef, columns, rowKey: 'rowId', name: 'details', label: '明细' },
  { read: readPageState, write: writePageState },
], {
  title: '业务单据', enabled: ready, questions: [],
  fields: pageFields,
}, instanceKey)
```

这些引用都需要页面实现。表格必须支持同步读取；PageSource 的自定义字段需要 register/label/type，列表解析由 resolve 负责。多来源字段不要无意重名，明确字段归属。

`resolve` 要确定，确认时可能重新执行。UI 随机行键在写入阶段生成，回读时使用 fromFormValue 去除不参与逻辑比较的 UI 字段。

**验收**：主表和明细的写入归属正确；上下游同批填写、异步联动、清空和回读行为符合原页面。复杂业务规则仍留在原业务代码中。

## 场景五：解读后跳页继续填写

适合“先解读已有记录，再打开新建页整理新内容”。来源数据保存在会话，目标页面提供自己的字段能力。

![跨页连续操作](/ai/navigation-handoff.svg)

组合顺序：

1. 场景二取得当前会话业务快照。
2. 模型用 get_system_pages 找到真实目标路径。
3. 用 open_page 的 waitFor=form 等待目标唯一、激活、字段就绪。
4. 再读取目标表单，将源数据映射为目标逻辑字段。
5. 生成新预览，由用户确认。

页面负责目标可用状态和字段初始化；目录接法见 [子应用接入](./app-integration)。固定解释规则可以引导模型使用该顺序，但不是一个保证执行的工作流引擎。

来源页卸载后已读取数据可继续使用；不能沿用来源页 target、字段 key 或旧草稿。当前等待上限 15 秒；不会自动打开尚未注册的抽屉。任意 query 拼接、无权限页面、用户中途切线程均需验证。

**验收**：从源记录到目标控件完整走一遍，确认源数据正确、目标字段重新读取、来源页未被误写；再测超时和取消。

## 如何组合自己的场景

先回答下面几个问题，再选择能力，不必先找一个完全相同的现成案例。

| 决策 | 可选组合 |
| --- | --- |
| 只解释还是要写入？ | chat target / form target |
| 数据从哪里来？ | 用户消息、附件、当前表单、initialData 快照或已有后端业务工具 |
| 是否隔离上一轮讨论？ | 沿用会话 / newSession |
| 用户先编辑首句吗？ | 仅预填 / autoSend |
| 是否需要页面变更同步？ | context + notify；业务快照则重新读取 |
| 是否跨页？ | 页面目录 + 导航等待 + 目标字段重读 |
| 页面是否已经能表达目标内容？ | 能则补字段适配；不能则先解决原页面业务能力 |

例如“查看异常明细后生成整改草稿”可以组合数据快照、解释规则、目标页导航与填表预览。**这是组合思路，不代表该业务已完成接入**：仍需实现数据读取、接入整改字段并做业务验收。

现有参数和字段能力能表达的需求，留在页面配置；需要新的外部查询或浏览器动作时，再由维护者新增工具。不要通过提示词虚构不存在的工具，也不要复制一套原页面业务逻辑。
