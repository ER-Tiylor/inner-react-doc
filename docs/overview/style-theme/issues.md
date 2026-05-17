# 样式现状问题盘点

## 结论概览

BMS 当前的样式问题不在于“技术选型错了”，而在于**同一个体系里缺少清晰的分层规则**。

从现状看，问题主要集中在四类：

1. 主题入口不唯一
2. token、全局覆盖、局部覆盖混用
3. 基础控件协议已经形成，但没有被正式抽象
4. 未来多公司定制没有明确边界

## 高优先级问题

### 1. 根级主题与局部主题同时存在，来源不唯一

当前现象：

- `src/App.tsx` 已经通过根级 `ConfigProvider` 注入全局主题
- `ProForm`、`ProFormCard`、`PageTabs` 等组件内部又各自包了一层 `ConfigProvider`

代表位置：

- `src/App.tsx`
- `src/components/ProForm/index.tsx`
- `src/components/ProForm/ProFormCard/index.tsx`
- `src/components/PageTabs/index.tsx`

问题：

- 同一个视觉问题可能同时在根主题和组件内部被定义
- 未来想换主题时，很难判断最终样式从哪里生效
- 不利于后续抽基础包或 Pro 包

建议优先级：最高

### 2. 全局样式承担了部分组件协议职责

当前现象：

- `src/styles/theme.less` 里不仅有 reset 和 scrollbar
- 还直接定义了表格空值 `--`、表单控件宽度等行为性规则

代表位置：

- `src/styles/theme.less`

问题：

- 这些规则本质上已经不是“全局样式”，而是组件协议
- 如果以后组件抽包，这些行为会丢在业务仓库里
- 会导致组件行为依赖隐式全局样式

建议优先级：最高

### 3. `viewMode` 已经是基础协议，但样式和行为仍分散在各控件里

当前现象：

- `Input`、`Select`、`DatePicker` 等控件都在处理 `viewMode`
- `ProForm` / `ProFormCard` 也在通过 cloneElement 注入 `viewMode`
- 但查看态的文字颜色、空值展示、边框保留规则并没有一套正式规范

代表位置：

- `src/antd/Input/index.tsx`
- `src/antd/Select/index.tsx`
- `src/antd/DatePicker/index.tsx`
- `src/components/ProForm/index.tsx`

问题：

- 只读展示协议已经形成，但还停留在“实现习惯”层
- 后续新增控件很容易出现不一致
- 这会直接影响基础包治理

建议优先级：最高

### 4. 颜色与视觉常量存在硬编码分散

当前现象：

- `src/config/theme.ts` 有主色和组件 token
- `src/styles/theme.less` 有 CSS 变量
- `PageTabs`、`createStyles`、`module.less` 里又有大量写死的灰度值、背景色、边框色

代表位置：

- `src/config/theme.ts`
- `src/styles/theme.less`
- `src/components/PageTabs/index.tsx`
- `src/components/ProTable/*`

问题：

- 品牌色、灰度、中性色没有真正收口
- 后续不同公司定制时，无法只改一层配置

建议优先级：最高

## 中优先级问题

### 5. `theme.less` 与 token 层职责交叉

当前现象：

- 有些样式更适合交给 token
- 但当前仍在全局 less 里兜底

问题：

- token 调整后，可能被全局 CSS 覆盖掉
- 主题变更链路不清晰

建议优先级：中

### 6. `createStyles` 与 `module.less` 的边界没有规范

当前现象：

- 页面层、组件层都在使用 `createStyles`
- 同时大量组件又保留 `module.less`

问题：

- 新代码很难判断应该用哪一种
- 长期看会继续形成两套平行样式习惯

建议优先级：中

### 7. 导航与页签类组件的视觉规则没有沉淀成语义 token

当前现象：

- `PageTabs` 的卡片背景、边框、文字色写在局部 token 和局部样式中
- `SideMenu`、`NavHeader` 等导航类组件也在各自定义风格

问题：

- 导航体系未来很难统一品牌化
- 改一个品牌风格时，需要逐个组件找硬编码值

建议优先级：中

### 8. 表格视觉协议不完整

当前现象：

- `Table.headerBg` 已在 token 中配置
- 但表格滚动条、空值展示、局部表格样式仍散落在全局 less 与组件层中

问题：

- 表格是一套高频基础设施，协议越晚统一，后面成本越高

建议优先级：中

## 低优先级问题

### 9. 内联样式仍然较多

当前现象：

- `ProForm`、`PageTabs` 等组件中仍有不少直接写在 JSX 里的样式

问题：

- 不利于主题统一与样式复用
- 但短期不会成为最大的治理阻碍

建议优先级：低

### 10. 暗黑模式变量还比较薄

当前现象：

- `theme.less` 中只定义了少量 dark 变量
- 与 antd token 的暗色体系没有形成完整映射

问题：

- 暗黑模式目前更像局部适配，不像完整主题体系

建议优先级：低

## 推荐整改顺序

### 第一批

- 统一主题主入口
- 审核局部 `ConfigProvider`
- 收拢 `viewMode` 协议
- 收拢空值展示规则

### 第二批

- 收拢颜色与语义 token
- 收窄 `theme.less` 职责
- 统一 `createStyles` 与 `module.less` 的使用边界

### 第三批

- 治理 `PageTabs`、`ProTable` 这类高复用组件的视觉协议
- 为未来品牌预设和多公司定制做结构准备

## 一句话判断

当前最值得优先处理的不是“样式写得不够漂亮”，而是：

- 主题来源不唯一
- 协议散落在全局样式和局部组件里
- token 与覆盖边界不清

只要先把这三件事收住，后面的多主题和包化才有稳定基础。