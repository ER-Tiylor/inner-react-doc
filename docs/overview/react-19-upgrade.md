# React 19 升级事项

## 背景

截至 **2026 年 5 月 17 日**：

- 文档站已经运行在 `react@19.2.6`、`react-dom@19.2.6`
- BMS 当前仍使用 `react@18.2.0`、`react-dom@18.2.0`
- BMS 还依赖 `antd@5.20.0`、`react-router-dom@6.21.1`、`zustand@4.4.7`、`react-activation@0.12.4`、`vite-plugin-qiankun@1.0.15`

因此这份文档的目标不是“立即升级”，而是给后续升级提供一份面向组件体系的检查清单和改造建议。

## 结论先行

### 建议的总体策略

1. **不要直接从 18.2 跳 19**，先升到 `18.3`
2. 在 `18.3` 阶段先消除所有 React 19 相关 warning
3. 单独验证第三方依赖兼容性，尤其是：
   - `antd`
   - `react-router-dom`
   - `zustand`
   - `react-activation`
   - `vite-plugin-qiankun`
4. 先挑 1 到 2 个子应用试点，再推广到所有子应用

### 为什么先升 18.3

React 官方明确建议先升级到 `18.3`。`18.3` 与 `18.2` 基本一致，但会提前暴露 React 19 的弃用告警，有利于提前清理问题，而不是把兼容问题堆到大版本升级当天。

## React 19 对 BMS 最重要的影响

### 1. 需要确保启用了新的 JSX Transform

React 官方指出，React 19 要求使用新的 JSX Transform，因为 `ref as a prop` 和 JSX 性能优化依赖这套转换链路。

对 BMS 来说，这一项要重点检查：

- Vite + `@vitejs/plugin-react` 是否已经走新 transform
- 是否还有旧脚手架或旧包编译出来的代码仍依赖旧 transform
- monorepo / 公共包如果有独立构建，也要单独确认

### 2. 一批旧 API 在 React 19 中已经移除

重点关注：

- `ReactDOM.render` -> `createRoot`
- `ReactDOM.hydrate` -> `hydrateRoot`
- `unmountComponentAtNode` -> `root.unmount()`
- `ReactDOM.findDOMNode` -> DOM `ref`
- `react-dom/test-utils` 中除 `act` 外的工具均已移除
- `act` 应从 `react` 导入，而不是从 `react-dom/test-utils` 导入

对 BMS 的判断：

- 主应用入口如果仍然使用旧 root API，需要优先替换
- 自定义弹窗、表格、输入组件如果历史上有 `findDOMNode` 用法，需要逐个 grep
- 测试体系如果后续补测试，应该直接按 React 19 方式组织，不再围绕旧 `test-utils`

### 3. 错误处理行为有变化

React 19 不再像旧版本那样在 render 报错时重复 rethrow；未被 Error Boundary 捕获的错误会上报到 `window.reportError`，被 Error Boundary 捕获的错误会走 `console.error`。

这对 BMS 的直接影响：

- `ErrorBoundary` 的行为需要重新验证
- 依赖“重复抛错”或特定日志格式的监控逻辑，需要复核
- 如果接入了埋点或错误采集，建议在试点应用中专门做一次异常链路回归

## 对现有组件体系的影响与机会

### KeepAlive：React 19 是否有原生替代？

**有部分能力可参考，但不能简单等价替换。**

React 19 官方提供了 `<Activity>`：

- 可以在隐藏 UI 时保留子树状态
- React 会把隐藏内容用 `display: none` 隐藏
- 隐藏时会清理子树的 Effects，但保留状态，以便后续恢复

这和 BMS 当前 `KeepAlive` 的重叠点主要是：

- 隐藏后恢复状态
- 避免普通条件渲染导致的彻底卸载

但 BMS 当前 `KeepAlive` 基于 `react-activation`，它还承担了更多“页面缓存系统”职责：

- 基于路由生成缓存标识
- 多标签页缓存实例管理
- 同路由旧实例清理
- 标签关闭时同步删缓存
- 与微前端全局状态联动做缓存回收

因此判断是：

- `<Activity>` **可以替代“局部 UI 隐藏并保留状态”这类场景**
- `<Activity>` **不能直接替代当前基于路由和标签体系的 KeepAlive 机制**

更现实的建议：

1. 不要把 `KeepAlive` 升级与 React 19 升级绑成一次大重构
2. 先保持 `react-activation` 方案，重点验证它在 React 19 下是否稳定
3. 后续如果要治理，可把场景拆成两类：
   - 页面级缓存：继续评估 `react-activation` 或自研缓存策略
   - 局部区域隐藏恢复：可以评估 `<Activity>`

### ProForm / ImportModal / 各类提交表单：可以关注原生 Actions

React 19 引入了：

- `useActionState`
- `useOptimistic`
- `<form action={fn}>`
- `useFormStatus`

它们主要解决的是：

- 提交中的 pending 状态
- 乐观更新
- 提交后的状态回传
- 表单动作与 UI 的联动

对 BMS 的意义不是“马上替换 antd Form”，而是：

- 后续对于轻表单或工具类表单，可以尝试减少自定义提交状态管理
- `ImportModal`、简单审批提交、轻量搜索提交等场景，可以研究是否能简化一部分内部状态逻辑
- `ProForm` 这种重配置、强业务的组件，短期内仍应以现有体系为主，不建议为了升级强行切架构

### NavHeader / 页面标题：可以关注原生 Document Metadata

React 19 原生支持在组件里渲染：

- `<title>`
- `<meta>`
- `<link>`

React 会自动把这些内容提升到 `<head>`。

这意味着：

- 对于简单页面标题更新，不一定非要依赖额外头部管理方案
- 对于详情页、列表页、文档页这类标题更新场景，可以考虑逐步简化

但官方也明确提示：

- 对于更复杂的路由级覆盖、继承和合并场景，元数据管理库仍然有价值

因此建议：

- 子应用里若只是简单改标题，可以试点原生 `<title>`
- 不要急着把所有现有头部管理方案一次性替换掉

### 自定义输入组件：可以逐步减少 `forwardRef`

React 19 中，函数组件已经支持把 `ref` 当普通 prop 使用；官方还说明 `forwardRef` 在未来会被弃用。

这对 BMS 的启发是：

- 后续新写的低层输入组件、包壳 antd 组件，可以优先按 `ref` prop 的方向设计
- 老组件不需要为了升级一次性全部改掉
- 但如果某些输入组件近期本来就要重构，可以顺手去掉 `forwardRef`

## 升级前必须检查的内容

### 应用入口与构建层

- `react` / `react-dom` 版本
- `@types/react` / `@types/react-dom` 版本
- JSX Transform 是否为新版本
- Vite / Babel / SWC / TS 编译链是否有旧配置残留

### 代码层 grep 建议

建议先全局检索：

```txt
ReactDOM.render
ReactDOM.hydrate
unmountComponentAtNode
findDOMNode
react-dom/test-utils
useFormState
forwardRef
SECRET_INTERNALS
```

其中：

- `useFormState` 在 React 19 中应迁移到 `useActionState`
- 任何依赖 React internals 的代码都需要优先移除

### 第三方依赖兼容性

升级时应逐个核查官方兼容说明或 issue：

- `antd@5.20.0`
- `react-router-dom@6.21.1`
- `zustand@4.4.7`
- `react-activation@0.12.4`
- `ahooks@3.7.8`
- `vite-plugin-qiankun@1.0.15`

其中优先级最高的是：

1. `react-activation`
2. `antd`
3. `vite-plugin-qiankun`

因为它们分别影响：

- 页面缓存
- UI 基础设施
- 微前端接入方式

## 推荐升级路径

### 阶段 1：预检查

- 升级到 `react@18.3`
- 修完全部 React 19 相关 warning
- 建立 grep 清单和问题台账

### 阶段 2：试点应用

选择 1 到 2 个复杂度中等的子应用试点：

- 不要先挑最核心结算应用
- 也不要挑完全没有组件复用的小应用
- 重点覆盖：表单、表格、标签页、KeepAlive、弹窗

### 阶段 3：组件基建回归

围绕以下组件做重点验证：

- `KeepAlive`
- `ProTable`
- `ProForm`
- `FormUpload`
- `SearchInput`
- `ErrorBoundary`

### 阶段 4：推广

- 先推广到相同技术栈的子应用
- 最后处理差异化最大的子应用
- 升级后统一补充 React 19 编码约定

## 不建议现在一起做的事

以下事项不建议和 React 19 升级绑在同一批次：

- 一次性重写 `KeepAlive`
- 顺手推进整套组件 npm 包化
- 同步做大规模样式体系重构
- 在升级过程中同时迁移全部头部元数据方案
- 因为 `<Activity>` 存在就立即替换 `react-activation`

React 版本升级的第一目标应该是：**稳定切换运行时，不引入大规模架构漂移。**

## 建议新增的升级任务卡

1. 补一份 React 18.3 预升级 checklist
2. 全局 grep React 19 移除 API
3. 验证 `react-activation` 与 React 19 的兼容性
4. 验证 `antd` 关键交互组件回归
5. 试点 `KeepAlive` 与 `ErrorBoundary` 异常链路
6. 评估 `Activity` 在局部隐藏场景下的可替代性
7. 评估简单表单是否适合引入 Actions
8. 建立 React 19 组件开发约定

## 参考资料

- React 19 Upgrade Guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- React 19 stable release: https://react.dev/blog/2024/12/05/react-19
- Activity reference: https://react.dev/reference/react/Activity
- forwardRef reference: https://react.dev/reference/react/forwardRef
- Legacy APIs removed in React 19: https://react.dev/reference/react/legacy