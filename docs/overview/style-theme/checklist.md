# 样式治理执行清单

## 使用方式

这份清单不是新的策略文档，而是对 [样式与主题治理建议](./governance) 的执行拆解。

建议用途：

- 做当前 BMS 的样式现状盘点
- 做一轮主题与样式治理专项
- 作为后续基础包、Pro 组件包抽离前的检查表

## 一、先做现状盘点

### 1. 主题入口盘点

需要确认：

- 根级 `ConfigProvider` 是否是唯一主主题入口
- 当前全局 theme 配置是否集中在 `src/config/theme.ts`
- 是否存在多个组件内部自行定义主题 token

当前重点检查对象：

- `src/App.tsx`
- `src/config/theme.ts`
- `src/components/ProForm/index.tsx`
- `src/components/ProForm/ProFormCard/index.tsx`
- `src/components/PageTabs/index.tsx`

### 2. 样式技术手段盘点

需要盘点当前项目使用了哪些样式机制：

- 全局 less
- `module.less`
- `antd-style createStyles`
- `:global` 覆盖
- 内联样式
- token 配置

### 3. 全局覆盖盘点

重点确认：

- `src/styles/theme.less` 当前承担了哪些职责
- 是否有通过全局类名直接覆盖 antd 内部结构的样式
- 是否存在“应该放到 token，但现在写在全局 less 里”的规则

## 二、建立统一规则

### 4. 定义主题主入口

必须明确：

- 根级主题配置只能从一个入口下发
- 这个入口负责品牌色、全局 token、组件级统一 token
- 业务组件不能反向定义全局主题

建议规则：

- 主题主入口：`src/config/theme.ts`
- 根级注入位置：`src/App.tsx`

### 5. 定义语义 token 清单

第一阶段先建立最小集合：

- 主色
- 信息色
- 成功色
- 页面背景色
- 容器背景色
- 表格头背景色
- 页签背景色
- 查看态文字色
- 空值展示文字色
- 边框色
- 圆角
- 间距基础值

### 6. 定义覆盖优先级

建议统一约定：

1. 根级主题 token
2. 语义 token
3. 基础控件默认样式
4. 业务组件局部样式
5. 页面级临时覆盖
6. 全局兜底覆盖

## 三、约束不同样式手段的使用边界

### 7. `ConfigProvider` 使用白名单

建议首批审查：

- `ProForm`
- `ProFormCard`
- `PageTabs`
- `ProTable`

### 8. 全局 less 使用边界

建议只保留：

- reset
- scrollbar
- prefix 级兜底样式
- 少量 token 无法覆盖的兼容处理

### 9. `module.less` 使用边界

建议只承担：

- 页面局部布局
- 业务组件结构样式
- 低复用局部视觉处理

### 10. `createStyles` 使用边界

建议优先用于：

- 和 token 强相关的动态样式
- 需要 `prefixCls` 的组件封装
- 高复用组件内部样式

## 四、先治理最关键的基础能力

### 11. 统一 `viewMode` 展示协议

需要统一：

- 只读文字颜色
- 空值展示规则
- 日期、选择器、数字等控件的查看态表现
- 是否允许边框、图标、placeholder 保留

### 12. 统一空值展示规则

需要明确：

- 统一使用什么空值文案，例如 `--`
- 表单查看态、表格单元格、详情展示是否保持一致
- 空字符串、`null`、`undefined`、空数组如何处理

### 13. 统一表格头与列表容器样式来源

重点涉及：

- `ProTable`
- antd `Table`
- 页面级表格容器

### 14. 统一页签与导航类组件样式来源

重点涉及：

- `PageTabs`
- `SideMenu`
- `NavHeader`

## 五、为未来多公司定制预留能力

### 15. 设计品牌预设结构

建议至少预留：

- `defaultTheme`
- `companyATheme`
- `companyBTheme`

### 16. 设计语义 token 映射层

明确：

- 不同公司改的是语义 token，不是逐个组件样式
- 组件只消费统一语义 token

### 17. 预留品牌级扩展覆盖层

允许存在少量公司定制扩展样式，但不能取代主主题系统。

## 六、建议的执行顺序

### 第一阶段：规则收口

1. 盘点所有主题入口
2. 盘点所有全局覆盖
3. 建立语义 token 最小清单
4. 建立局部 `ConfigProvider` 白名单

### 第二阶段：基础控件试点

建议优先治理：

- `Input`
- `Select`
- `DatePicker`
- `InputNumber`
- `InputTextArea`
- `FormDigitRange`

### 第三阶段：高复用组件试点

建议优先治理：

- `ProForm`
- `ProFormCard`
- `PageTabs`
- `ProTable`

### 第四阶段：品牌预设准备

建议完成：

- 默认主题预设
- 语义 token 映射结构
- 少量品牌差异试验方案

## 七、验收标准

如果这一轮治理做完，至少应该看到这些变化：

- 团队知道全局主题入口在哪里
- 大多数样式问题能先判断归属层级
- 局部 `ConfigProvider` 数量可控
- 全局 less 职责明显收窄
- `viewMode` 和空值展示形成统一协议
- 未来多公司主题切换已经有明确技术边界