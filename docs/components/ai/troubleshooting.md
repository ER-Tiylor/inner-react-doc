# 联调与排障

先确定问题发生在哪一步，再修改对应层。不要用不断增加 context 代替定位。

![从目标、字段、工具输入到业务验收的排障顺序](/ai/debug-checkpoints.svg)

<a href="/ai/debug-checkpoints.svg" target="_blank" rel="noreferrer">打开大图</a>

## 按链路检查

| 现象 | 先检查 |
| --- | --- |
| 没有助手入口 | PASS 助手加载、业务应用是否收到协议 v2 客户端 |
| 提示没有表单 | `enabled`、当前路由、页面激活状态、target 是否唯一 |
| 缺少字段 | 原 formItem 形状、控件推导、页面 fields、register 字段的 label/type |
| 候选匹配失败 | 原页面下拉是否也能查到、筛选参数、名称重复、ID/code 是否混用 |
| 字段在页面可用但预览不写入 | blocked/hidden、联动是否提供 apply、目标候选准备是否完整 |
| 预览正确但联动没执行 | apply 是否复用了原页面函数，值形状是否经过转换 |
| 一直读到旧页面信息 | 页面是否 notify、是否用了旧 target/草稿、keep-alive 激活是否正确 |
| 业务解读只有名称没有明细 | initialData 是否读全、快照是否 ready、是否调用数据工具 |
| 解读正文缺失只剩录入卡片 | 解读 Prompt 版本与前端标记渲染是否匹配；标记应独占一行，放表格/代码块内不生效 |
| 录入卡片显示不出文本 | 当前会话看快照是否 ready、snapshotId 是否匹配；历史卡片点「恢复录入文本」分页查找，仍无则历史未保存，重新发起解读 |
| 生成了公式但漏基础字段 | 查看 prepare_form_fill 的实际 values；再区分模型未提交与候选失败 |
| 跳转了但不能填写 | 目标表单是否唯一、激活、初始化完成；是否 waitFor=form |
| 想填表却进入其他场景 | 真实 L1 工具路由、后端提示与页面 context 是否冲突 |
| 历史里出现多张修订表 | 查看替代关系和 baseDraftId，不能只按标题合并 |
| 重进页面仍是上一次的会话 | 入口是否传了 `sessionKey`（`useAssistantSession`）、本轮结束时是否 `resetSession()`；KeepAlive 下"关页面"不等于组件销毁，key 不会自己换 |
| 第二次点入口不重发、像没反应 | 设计如此：`initialMessage.once` 已消费后只开窗；要重跑先 `resetSession()` 再点，或在对话里手动发同一句 |
| 首句没自动发出 | `once` 是否同时配了 `sessionKey` + 非空 `text` + `autoSend:true`；准备阶段关窗/改输入会取消本次发送，再点入口可重试 |
| 同一页第二个入口点了没反应 | 两个入口是否各用自己的 `useAssistantSession`；共用一份 `sessionKey` 时，第二个入口会因"首句已消费"而只开窗不发送 |

## 一次联调保留什么

记录页面模式、context 版本、字段描述、模型工具输入、工具返回的问题、确认后实际页面值。涉及文件时还要核对后端实际提取正文，不能只看本地 PDF 阅读器。

定位填写问题时，最有用的是这三个结果：

1. `get_current_form_context`：助手当时能看到什么。
2. `prepare_form_fill`：模型实际提交了什么，哪些项目失败。
3. 确认后的页面值：联动、控件形状和回读是否一致。

页面校验、后端试算和业务提交结果单独检查。前端回读通过不等于计算正确。

## 修改职责

| 需求 | 修改位置 |
| --- | --- |
| 单页字段、候选、联动、解释规则 | 业务页面及页面字段辅助模块 |
| 多页面复用的控件识别 | 本应用 adapter，经应用维护者核对 |
| 通用字段描述与 hook 行为 | assistantBinding 共享代码，统一评审和同步 |
| 预览、会话、通用工具 | ai-agents 前端 |
| 页面目录、应用加载、桥接 | PASS 前端 |
| 模型路由、文件提取、场景查询 | L1/L3 后端 |

## 本组文档的核对来源

路径相对于各仓库根目录，不作为站点内链接。文档和源码不一致时，以当前源码及实际运行结果为准。

- BMS：`frontend/src/assistantBinding/README.md`、`index.tsx`、`describeFields.ts`、`adapter.ts`；计费协议列表与规则页面。
- PASS 文档：`docs/ai-assistant-architecture.md`、`assistant-form-integration.md`、`assistant-form-hooks.md`、`assistant-form-ownership.md`。
- PASS 源码：`frontend/src/ai/assistantBridgeProtocol.ts`、`ai/components/AssistantSlot.tsx`、`microapps/specs.ts`、`microapps/pageManifest.ts`。
- ai-agents 前端：`frontend/src/components/Assistant/` 下的 `ChatSession.tsx`、`store.ts`、`assistantBridgeProtocol.ts`、`navigation.ts`、`formReady.ts`、`conversationData.ts`、`fill.ts`、`Preview.tsx`、`fillPromptCard.tsx`、`inlineFillPrompt.ts`、`fillPromptHistory.ts`；会话生命周期设计见 `docs/2026-10-12-assistant-session-lifecycle-design.md`。
- ai-agents 后端：`java-agents/l1-agent/build.gradle`、L1 系统提示、文件解析和上下文注入代码。

核对日期：2026-10-12。这里说明当前能力与接入方式，不把历史设计中的计划项当成已支持能力。

### 首问清单不符合预期

先检查当前页面的 `pageQuestions`（兼容旧 `questions`），再检查当前子应用的 `appQuestions`。只取第一份非空清单，不叠加；只有两层都为空才选择全局表单或通用清单。若子应用首问不生效，确认 PASS 和 AI 前端已更新，并在应用挂载时把配置传给 `connectAssistant`。
