# ProTable 业务表格

## 介绍
`ProTable` 是一个面向业务页面的表格容器组件，封装了查询表单、列表表格、状态 Tabs、树筛选、导出、页配置、字段权限过滤和汇总栏等能力。

## 何时使用
适用于后台列表页、复杂检索页、带状态切换和列配置的业务表格页面。

## 代码演示
```tsx
import { useRef } from 'react'
import ProTable from '@/components/ProTable'

export default function Demo() {
  const girdRef = useRef()

  const handleSearch = async (params: any, pageInfo: any) => {
    console.log(params, pageInfo)
    return {
      list: [],
      total: 0,
      statusSummary: {
        allCount: 0,
        enabledCount: 0,
      },
      summary: {
        amount: 0,
        count: 0,
      },
    }
  }

  return (
    <ProTable
      pageName="contract_list"
      search={{
        searchFields: [
          {
            type: 'input',
            label: '合同编号',
            value: 'contcode',
          },
          {
            type: 'select',
            label: '状态',
            value: 'status',
            options: {
              1: '启用',
              0: '禁用',
            },
          },
          {
            type: 'dateRange',
            label: '创建时间',
            value: 'createTime',
          },
        ],
        onSearch: handleSearch,
      }}
      table={{
        girdRef,
        rowKey: 'id',
        columns: [
          { title: '合同编号', dataIndex: 'contcode', width: 180 },
          { title: '合同名称', dataIndex: 'basename', width: 220 },
          { title: '操作', dataIndex: 'action', width: 120 },
        ],
      }}
      toolsBar={{
        exportUrl: '/api/export',
        tabsConfig: {
          searchKey: 'status',
          defaultActiveKey: 'all',
          items: [
            { key: 'all', label: '全部', countKey: 'allCount' },
            { key: 'enabled', label: '启用', countKey: 'enabledCount' },
          ],
        },
      }}
      footer={{
        field: [
          { label: '总数量', value: 'count' },
          { label: '总金额', value: 'amount' },
        ],
      }}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `table` | 表格区域配置 | `ITableProps` | 无 |
| `search` | 搜索表单配置 | `ISearchFormProps` | 无 |
| `toolsBar` | 表头工具栏配置 | `IHeaderTools` | 无 |
| `otherChild` | 自定义子组件渲染区，开启后可替代默认 Table 渲染 | `{ child: ReactElement; visible: boolean }` | 无 |
| `styleData` | 搜索区、表格区样式配置 | `{ searchStyle?: object; tableStyle?: object }` | 无 |
| `tree` | 左侧树筛选配置 | `SearchTreeProps` | 无 |
| `pageName` | 页面配置标识，用于拉取页配置和字段权限 | `string` | `''` |
| `footer` | 表格底部汇总展示配置 | `{ summary?: string; field: { label: string; value: string \| number }[] }` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `search.onSearch` | 查询时触发，返回表格数据 | `(params: any, pageInfo?: { pageNum: number; pageSize: number })` |
| `toolsBar.rowSelectionConfig.handleCancelSelection` | 取消已选中项 | 无 |
| `pageConfigProps.resetPage` | 页面配置保存后刷新页面配置 | 无 |

### Children
无

### Ref
通过 `table.girdRef` 暴露以下能力：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `reload` | 按当前分页重新加载 | 无 | `void` |
| `reset` | 回到第一页并重新查询 | 无 | `void` |
| `canUpdateInfo` | 当前用户是否拥有页面字段配置更新权限 | 无 | `boolean` |
| `searchFormRef` | 内部搜索表单实例 | 无 | `FormInstance` |

## 数据结构
### 1. 顶层简化结构
```ts
type ProTableProps = {
  table: ITableProps
  search: ISearchFormProps
  toolsBar?: IHeaderTools
  otherChild?: {
    child: React.ReactElement
    visible: boolean
  }
  styleData?: {
    searchStyle?: object
    tableStyle?: object
  }
  tree?: SearchTreeProps
  pageName?: string
  footer?: {
    summary?: string
    field: { label: string; value: string | number }[]
  }
}
```

### 2. 查询结果结构
`search.onSearch` 需要返回的核心结果：

```ts
interface IResult {
  list?: any[]
  total?: number
  pages?: number
  statusSummary?: any
  summary?: any
  searchData?: any
}
```

最常用只需要：

```ts
{
  list: [],
  total: 0
}
```

### 3. `table` 简化配置
`table` 基于 antd `TableProps` 扩展，常用字段如下：

```ts
type ITableProps = TableProps & {
  girdRef: MutableRefObject<IGirdRef | undefined>
  onSearch?: any
  pageConfig?: PaginationProps
  notSelfAdaptionHeight?: boolean
}
```

常见写法：

```ts
table: {
  girdRef,
  columns,
  rowKey: 'id',
  pageConfig: {
    pageSize: 20,
  },
  scroll: {
    x: 1200,
  },
}
```

### 4. `search` 简化配置
搜索区核心结构：

```ts
type ISearchFormProps = {
  searchFields: ISearchFields[]
  onSearch: Function
  btnSpan?: number
  notFirstRequest?: boolean
  handleSrcollY?: Function
  hiddenOperation?: boolean
}
```

单个搜索项结构：

```ts
type ISearchFields = {
  type:
    | 'input'
    | 'digit'
    | 'select'
    | 'searchInput'
    | 'date'
    | 'dateRange'
    | 'dateTimeRange'
    | 'month'
    | 'monthRange'
    | 'year'
    | 'yearRange'
    | 'digitRange'
    | 'multipleInput'
    | 'other'
  label: string
  value: string
  initialValue?: any
  options?: Record<string | number, string | number>
  url?: string
  params?: Record<string, any>
  fieldProps?: any
  span?: number
  component?: any
  hidden?: boolean
}
```

搜索项 `type` 与渲染组件对应关系：

```ts
input           => Input
digit           => InputNumber
select          => Select
searchInput     => 远程搜索输入组件
date            => DatePicker
dateRange       => RangePicker
dateTimeRange   => 带时间 RangePicker
month           => 月选择
monthRange      => 月范围
year            => 年选择
yearRange       => 年范围
digitRange      => FormDigitRange
multipleInput   => MultipleInput
other           => 自定义 component
```

### 5. 搜索表单值格式化规则
内部会将表单字段名组装成：

```ts
`${value}==${type}`
```

再根据 `type` 自动格式化为接口参数，例如：

```ts
date          => 'YYYY-MM-DD'
month         => 'YYYY-MM'
year          => 'YYYY'
dateRange     => [startOfDay, endOfDay]
dateTimeRange => [startDateTime, endDateTime]
searchInput   => value.value 或 value[].map(item => item.value)
```

### 6. `toolsBar` 简化配置
```ts
type IHeaderTools = {
  exportUrl?: string
  exportParams?: any
  leftToolbar?: React.ReactNode[]
  rightToolbar?: React.ReactNode[]
  tabsConfig?: {
    items: {
      key: string
      label: string
      countKey: string
    }[]
    searchKey: string
    defaultActiveKey: string | number
  }
  rowSelectionConfig?: {
    total: number
    hideButton?: boolean
    handleCancelSelection: () => void
  }
}
```

说明：

```ts
exportUrl              => 顶部显示导出按钮
tabsConfig             => 顶部状态标签，切换时自动把 searchKey 注入查询参数
rowSelectionConfig     => 顶部显示“已选择 N 条数据”和取消选择按钮
leftToolbar/rightToolbar => 自定义操作按钮区
```

### 7. `tree` 简化配置
```ts
type SearchTreeProps = {
  initialTreeData?: any[]
  initialSelectKey?: string
  requestUrl?: string
  requestMethod?: string
  searchList?: any
  searchKey: string
  fieldName?: {
    code: string
    name: string
  }
  defaultSelectFirst?: boolean
}
```

说明：

```ts
requestUrl / requestMethod => 远程拉树数据
initialTreeData            => 本地树数据
searchKey                  => 选中树节点后注入查询参数的字段名
fieldName                  => 指定树节点 code/name 对应字段
```

### 8. `footer` 简化配置
```ts
footer: {
  summary?: 'summary' | string
  field: {
    label: string
    value: string | number
  }[]
}
```

会从接口结果的 `summary` 或指定字段里读取汇总数据。

### 9. `pageName` 能力
配置了 `pageName` 之后，组件会额外启用：

```ts
1. 字段权限过滤
2. 页面列/筛选项个性化配置
3. 固定列数量配置
4. 无字段权限时显示无权限页面
```

## Design Token
无

## Accessibility
组件组合了 `Form`、`Table`、`Tabs`、`Tree`、`Drawer` 等多种基础组件；可访问性主要依赖底层 antd 组件，当前源码未看到额外统一封装的无障碍增强属性。

## FAQ
为什么搜索字段名会变成 `xxx==dateRange` 这种形式？

这是内部为了区分字段类型并做统一格式化处理的约定。提交查询前会再还原成接口真正接收的字段名。

配置了 `pageName` 之后和没配有什么区别？

配置后会多出字段权限过滤、页面配置保存与恢复、固定列配置等能力；不配置时就是一个纯本地配置的业务表格容器。

