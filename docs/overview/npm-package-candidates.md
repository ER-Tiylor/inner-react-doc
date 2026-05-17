# NPM 包治理与拆包建议

## 目标

这份文档回答三个问题：

1. BMS 当前哪些能力值得抽离为内部 npm 包
2. `src/antd` 这一层是否应该整体发布
3. 基础组件、Pro 组件、业务组件应该如何分层治理

## 结论先行

- 不建议把 `src/antd` 整个目录原样发布成一个 npm 包
- 建议从 `src/antd` 中筛出真正承载统一交互协议的基础控件，形成基础包
- `ProForm`、`ProTable` 这类高阶基础设施应单独治理，不和基础控件混成一个包
- 业务组件继续留在业务仓库

## 建议的四层结构

### 第一层：基础适配层

定位：基于 `antd` 的统一控件层，承载输入、只读、空值展示等约定。

适合纳入：

- `Input`
- `Select`
- `DatePicker`
- `InputNumber`
- `InputTextArea`
- `Checkbox`
- `Radio`
- `Switch`
- `Row`
- `Col`
- `FormDigitRange`

### 第二层：高阶 Pro 组件层

定位：面向中后台页面开发的基础设施。

适合纳入：

- `ProForm`
- `ProFormCard`
- `ProTable`
- `SearchInput`
- `SearchTree`

### 第三层：通用业务能力层

定位：仍有复用价值，但已带有明显业务语义。

可继续观察：

- `FormUpload`
- `UploadDrawer`
- `PDFViewer`
- `Auth`
- `ErrorBoundary`

### 第四层：应用壳与业务流程层

定位：强依赖当前应用上下文，不适合优先包化。

代表内容：

- `KeepAlive`
- `PageTabs`
- `SideMenu`
- `NavHeader`
- `NavFooter`
- `Address`
- `Contract`
- `FlowModal`
- `ImportModal`
- `LogModal`

## 对 `src/antd` 的判断

### 不建议整体发布

因为其中很多组件只是对 `antd` 的薄封装，例如：

- `Form`
- `Table`
- `Modal`
- `Upload`
- `Drawer`
- `Tabs`
- `Layout`
- `ConfigProvider`

这类内容发成包价值不高，但会增加同步 `antd` 版本的维护成本。

### 适合筛出进入基础包的部分

这类组件已经不只是 re-export，而是在承载统一协议：

- `Input`
- `Select`
- `DatePicker`
- `InputNumber`
- `InputTextArea`
- `Checkbox`
- `Radio`
- `Switch`
- `Row`
- `Col`
- `FormDigitRange`
- `const.ts` 中的空值展示常量
- 公共只读展示样式

共同特征：

- 有统一 placeholder
- 有 `viewMode` 只读展示协议
- 有统一空值展示，例如 `--`
- 服务的是整套表单展示体验

## 建议包名

### 基础控件包

候选包名：

- `@company/ui-base`
- `@company/form-controls`
- `@company/antd-adapter`

建议优先：`@company/ui-base`

### 表单基础设施包

- `@company/pro-form`
- `@company/form-engine`

建议优先：`@company/pro-form`

### 表格基础设施包

- `@company/pro-table`
- `@company/table-engine`

建议优先：`@company/pro-table`

### 轻量公共组件包

- `@company/ui-kit`
- `@company/common-components`

建议优先：`@company/ui-kit`

## 推荐的仓库结构草案

### 方案 A：按包拆分

```txt
packages/
  ui-base/
  pro-form/
  pro-table/
  ui-kit/
apps/
  docs/
```

### 方案 B：先做过渡

```txt
packages/
  ui-base/
  pro-components/
apps/
  docs/
```

这个方案更适合 BMS 当前阶段：

- `ui-base` 先承接 `src/antd` 中真正有协议价值的基础控件
- `pro-components` 先承接 `ProForm`、`ProTable` 和相关搜索组件
- 等协议稳定后再拆细

## 每个包的建议目录

### `@company/ui-base`

```txt
packages/ui-base/
  src/
    components/
      Input/
      Select/
      DatePicker/
      InputNumber/
      InputTextArea/
      Checkbox/
      Radio/
      Switch/
      Row/
      Col/
      FormDigitRange/
    constants/
      empty.ts
    styles/
      view-mode.css
    types/
    index.ts
  package.json
  tsconfig.json
  README.md
```

### `@company/pro-form`

```txt
packages/pro-form/
  src/
    ProForm/
    ProFormCard/
    field-types/
    hooks/
    types/
    index.ts
  package.json
  tsconfig.json
  README.md
```

### `@company/pro-table`

```txt
packages/pro-table/
  src/
    ProTable/
    SearchForm/
    SearchTree/
    SearchInput/
    toolbar/
    adapters/
    types/
    index.ts
  package.json
  tsconfig.json
  README.md
```

### `@company/ui-kit`

```txt
packages/ui-kit/
  src/
    Auth/
    ErrorBoundary/
    FooterButton/
    index.ts
  package.json
  tsconfig.json
  README.md
```

## 包之间的依赖方向

建议保持单向：

```txt
ui-base
  ↑
pro-form
  ↑
pro-table

ui-kit
  ↑
业务应用
```

## 抽包前的统一检查清单

### 1. 依赖清理

- 是否依赖当前项目的 `request`
- 是否依赖当前项目的 `store`
- 是否依赖当前项目的 `router`
- 是否依赖当前项目的全局主题或样式变量
- 是否依赖当前项目特有的字段结构

### 2. 协议收敛

- props 命名是否统一
- 回调参数是否稳定
- 返回值结构是否可预测
- 是否仍存在大量 `any`
- 是否存在多个历史模式并存

### 3. 复用边界

- 它在其他子应用里是否仍然成立
- 它是“平台能力”还是“页面顺手抽出来的局部组件”
- 是否有足够的复用收益覆盖维护成本

### 4. 文档与测试

- 是否有 README
- 是否有最小示例
- 是否有行为测试或最小交互验证
- 是否能在文档站中独立演示

## 最终建议

当前最务实的路线不是“把 BMS 公共组件整体搬成 npm 包”，而是：

1. 先建立一层小而稳的基础控件包
2. 再治理轻量公共组件
3. 最后单独推进 `ProForm`、`ProTable` 这类高阶基础设施
4. 业务组件继续留在业务仓库内收敛
