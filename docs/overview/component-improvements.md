# Components Improvements 组件未来优化建议

## 目标
本文档聚焦当前 `src/components` 组件体系的务实优化方向，重点不是“理想化重写”，而是：

1. 哪些问题最值得先改
2. 该怎么分阶段改
3. 改完能带来什么收益

原则：

- 优先做高复用、高收益、低风险的改造
- 优先抽公共能力，减少重复实现
- 优先收敛隐式约定和弱类型
- 不为了“组件库化”而过度设计

## 总体判断
当前组件体系已经有一批可复用的业务基础件，尤其是：

- `ProTable`
- `ProForm`
- `FormUpload`
- `PageTabs`
- `KeepAlive`

但也存在比较明显的共性问题：

- 上传、预览、远程搜索、弹窗表格等能力有重复实现
- 一些组件同时承担 UI、请求、状态、业务规则 4 类职责
- 类型定义不够精确，`any` 偏多
- 某些组件已经具备“平台能力”雏形，但接口还不够稳定

## 优先级建议
### P0：优先立即优化
| 方向 | 价值 | 风险 | 建议 |
| --- | --- | --- | --- |
| `ProTable` 配置和类型收敛 | 很高 | 中 | 作为列表页基础设施，优先稳定 API |
| 上传体系合并 | 很高 | 中 | 合并 `FormUpload` 和 `UploadDrawer` 的重复逻辑 |
| 远程搜索选择统一 | 高 | 低 | 统一 `SearchInput` 相关协议与返回值 |
| 弱类型治理 | 高 | 低 | 优先清理 `any`、回调参数不清、返回值不一致的问题 |

### P1：中期优化
| 方向 | 价值 | 风险 | 建议 |
| --- | --- | --- | --- |
| `ProForm` 能力标准化 | 高 | 中 | 形成统一字段配置协议 |
| 弹窗型业务组件拆层 | 中 | 中 | `Contract`、`ImportModal`、`LogModal` 等做 UI 与业务分离 |
| 页面级组件职责收敛 | 中 | 低 | `NavHeader`、`PageTabs`、`SideMenu` 做布局层与逻辑层拆分 |

### P2：后续逐步优化
| 方向 | 价值 | 风险 | 建议 |
| --- | --- | --- | --- |
| 轻量组件统一风格 | 中 | 低 | `FooterButton`、`ConfimModal`、`NavFooter` 等做命名和 API 一致化 |
| 组件测试补齐 | 中 | 中 | 优先给基础设施组件补测试 |
| 文档与示例体系升级 | 中 | 低 | 后续补完整示例、边界场景和最佳实践 |

## 分方向建议
## 1. ProTable：从“强能力组件”升级成“稳定基础设施”
### 当前问题
- 职责太多：搜索、表格、树筛选、页配置、字段权限、汇总、状态 Tabs 全揉在一起
- 内部依赖较多隐式约定：如 `pageName`、字段权限结构、搜索字段名拼接规则
- 类型定义虽然有基础，但对业务方来说仍不够直观
- 配置层次较深，新接入成本偏高

### 务实优化点
1. 先冻结对外 API，再做内部整理。
2. 把 `search`、`table`、`toolsBar`、`tree`、`footer` 的结构定义单独拆到公共类型文件。
3. 明确 `onSearch` 标准返回结构，至少统一为：

```ts
type ProTableResult<T = any> = {
  list: T[]
  total: number
  statusSummary?: Record<string, any>
  summary?: Record<string, any>
  searchData?: Record<string, any>
}
```

4. 把“页配置能力”改成可插拔，而不是写死在主组件内部。
5. 把“字段权限过滤”做成预处理函数或 hook，避免主流程里混太多权限逻辑。
6. 逐步拆成：
   - `useProTableSearch`
   - `useProTablePageConfig`
   - `useProTablePermission`
   - `useProTableLayout`

### 收益
- 新页面接入更稳定
- 类型提示更清晰
- 后续修改某一能力时，不容易牵一发动全身

## 2. ProForm：把“配置驱动”进一步标准化
### 当前问题
- `ProForm` 和 `ProFormCard` 的配置结构不完全一致
- `viewMode` 依赖子组件自行支持，约定多于约束
- `component` 支持直接元素和函数两种方式，灵活但也提高了理解成本
- `viewTextFun`、`hiddenFun`、`dependencies` 的联动模式可用，但还不够统一

### 务实优化点
1. 统一普通表单与卡片表单的字段协议，减少两套类型。
2. 增加更明确的字段层配置，例如：

```ts
type ProFieldConfig = {
  name: string
  label: string
  type: 'input' | 'select' | 'date' | 'custom'
  componentProps?: Record<string, any>
  formItemProps?: FormItemProps
  hidden?: boolean | ((form: FormInstance) => boolean)
  viewRender?: (form: FormInstance) => React.ReactNode
}
```

3. 对高频字段类型先提供内建渲染，减少业务层重复写 `<Input />`、`<Select />`。
4. 明确“查看模式协议”，约定所有自定义业务输入组件统一接受 `viewMode`。
5. 补一个“异步详情回填最佳实践”，避免各页面自己乱写 `getDetails`。

### 收益
- 表单配置更统一
- 低代码感更强
- 业务页面的表单搭建效率更高

## 3. 上传体系：合并 `FormUpload` 和 `UploadDrawer`
### 当前问题
- 两个组件都实现了：
  - 文件类型校验
  - 文件大小校验
  - 获取上传 URL
  - 私有文件临时 URL 转换
  - 图片/PDF 预览
  - 下载逻辑
- 重复代码明显
- `UploadDrawer` 的类型和真实回调值不完全一致

### 务实优化点
1. 抽一个上传核心 hook，例如：

```ts
useUploadFiles({
  isPublic,
  fileProps,
  initialFiles,
})
```

2. 再抽一个公共文件预览能力：
   - `useFilePreview`
   - `FilePreviewTrigger`

3. 页面内表单上传保留 `FormUpload`
4. 抽屉场景保留 `UploadDrawer`
5. 两者只保留 UI 差异，不再各自维护上传逻辑
6. 统一 `onChange` / `onConfirm` 输出协议，建议统一为：

```ts
type UploadValue = {
  fileName: string
  fileUrl: string
}[]
```

如需兼容历史接口，再额外提供一个 `valueMode: 'url[]' | 'file[]'`

### 收益
- 明显减少重复代码
- 上传类 bug 修一次即可全局受益
- 后续扩展 Office 预览、视频预览也更容易

## 4. SearchInput：升级成通用远程选择器
### 当前问题
- 目前更像“远程搜索 Select”，但配置约定较隐式
- `other.key`、`other.labelName` 的含义不够直观
- `watch`、`isEditTableUse`、`defaultValue` 等字段存在但没形成清晰协议
- 请求参数默认使用 `name`，业务耦合明显

### 务实优化点
1. 把组件升级为通用协议，例如：

```ts
type RemoteSelectProps<T = any> = {
  request: (keyword: string, extra?: any) => Promise<T[]>
  valueKey?: keyof T
  labelKey?: keyof T
  keywordKey?: string
  value?: any
  onChange?: (value: any, option: T | T[]) => void
}
```

2. 如果短期不重构，至少把 `other` 重命名为更清晰的字段，比如：
   - `valueField`
   - `labelField`
   - `keywordField`

3. 明确 `labelInValue` 的使用建议。
4. 增加“依赖字段变化时重新拉取”的正式能力，而不是仅保留 `watch` 这种弱约定。

### 收益
- 更适合多业务线复用
- 更容易替换后端接口格式
- 能减少“这个组件到底该怎么传参数”的理解成本

## 5. 页面级导航组件：减少布局层和业务层耦合
### 涉及组件
- `NavHeader`
- `PageTabs`
- `SideMenu`
- `KeepAlive`

### 当前问题
- 页面布局、权限、主题、路由、缓存清理有较强耦合
- 一部分逻辑写在 UI 组件内部，后续迁移布局成本高

### 务实优化点
1. 将页面框架逻辑尽量抽成 hooks：
   - `useHeaderActions`
   - `usePageTabs`
   - `useSideMenuItems`
   - `useKeepAliveTabs`

2. UI 组件只负责渲染，不直接承担太多业务行为。
3. 给标签页、缓存、菜单权限形成一套统一协议，避免不同组件各自理解路由。

### 收益
- 页面布局层更清晰
- 后续切换 UI 框架或重新设计外壳成本更低

## 6. 业务弹窗组件：拆成“容器 + 展示”
### 涉及组件
- `Contract`
- `FlowModal`
- `ImportModal`
- `LogModal`
- `ConfimModal`

### 当前问题
- 很多组件同时包含：
  - 接口调用
  - 数据格式处理
  - 弹窗/抽屉 UI
  - 业务规则
- 这类组件在当前项目内好用，但不利于长期演化

### 务实优化点
1. 将数据请求和格式处理尽量外提。
2. UI 组件只接收：
   - `open`
   - `loading`
   - `dataSource`
   - `onSubmit`
   - `onCancel`
3. 对重业务组件保留容器层，例如：
   - `ContractSelectorContainer`
   - `ContractSelectorModal`

### 收益
- 更容易单测
- 更容易更换数据源
- 业务逻辑和展示逻辑边界更清楚

## 7. 命名、类型和一致性治理
### 当前问题
- 个别组件命名存在历史问题，如 `ConfimModal`
- 回调命名与实际返回值不完全一致
- 有些地方声明 `any`，有些地方已经有类型但没继续下沉

### 务实优化点
1. 统一命名：
   - `ConfimModal` -> `ConfirmModal`
2. 统一常见 props：
   - `visible` / `open`
   - `onCancel` / `onClose`
   - `onSubmit` / `onConfirm`
3. 统一回调返回值类型，避免 README 和实现不一致。
4. 给高频基础组件补齐导出类型：
   - `Props`
   - `Value`
   - `Ref`
   - `Result`

### 收益
- 降低认知切换成本
- 文档和代码更一致
- 组件体系更像一个稳定平台

## 8. 优先补测试的组件
建议优先补测试而不是平均分配：

### 第一优先级
- `ProTable`
- `ProForm`
- `FormUpload`
- `UploadDrawer`
- `PageTabs`

### 第二优先级
- `SearchInput`
- `KeepAlive`
- `ImportModal`
- `Contract`

### 建议测试内容
- 配置渲染是否正确
- 回调参数是否符合预期
- 查看模式/编辑模式切换
- 上传与预览流程
- 标签关闭与缓存清理联动

## 分阶段落地建议
## 第一阶段：1 到 2 周
- 修正文档和代码中的命名不一致
- 统一高频组件的 props 命名
- 清理明显的 `any`
- 修复 `UploadDrawer` 类型与返回值不一致问题
- 为 `SearchInput`、`FormUpload`、`UploadDrawer` 补最小类型

## 第二阶段：2 到 4 周
- 抽上传核心 hook
- 整理 `ProTable` 类型定义与对外协议
- 统一 `ProForm` / `ProFormCard` 配置结构
- 给 `PageTabs` / `KeepAlive` 拆 hooks

## 第三阶段：4 周以后
- 逐步拆业务弹窗为容器层与展示层
- 补自动化测试
- 补更完整的文档、示例和最佳实践

## 建议避免的事情
- 不建议现在整体推翻重写 `ProTable` 或 `ProForm`
- 不建议一开始就做大而全组件平台
- 不建议在没有统一协议前继续复制上传、选择、弹窗类逻辑
- 不建议先做视觉重构，应该先做能力收敛和 API 稳定

## 最务实的 5 个动作
如果只能做 5 件事，建议按这个顺序：

1. 合并上传核心逻辑，统一 `FormUpload` 和 `UploadDrawer`
2. 收敛 `ProTable` 类型和返回协议
3. 统一 `ProForm` / `ProFormCard` 字段配置结构
4. 把 `SearchInput` 升级成更清晰的远程选择协议
5. 统一命名、回调和 `open/visible` 一类基础约定

## 结论
这个组件体系当前最有价值的，不是“再多做一些组件”，而是：

- 稳住已有高价值组件的对外协议
- 抽掉重复实现
- 降低组件之间的隐式耦合

如果按这个方向推进，后续组件库会从“项目内可用”逐步升级为“长期可维护、可演进的业务基础设施”。

