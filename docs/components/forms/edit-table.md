# EditTable 可编辑表格

## 介绍
`EditTable` 是一个可编辑表格组件，基于 `Table` 和 `Form` 封装，支持单元格内编辑、必填校验、增删行、批量删除以及通过 `ref` 获取表格数据。

## 何时使用
适用于表单中需要录入多行明细数据，并要求直接在表格内完成编辑和校验的场景。

## 代码演示
```tsx
import { useRef } from 'react'
import EditTable from '@/components/EditTable'

export default function Demo() {
  const editTableRef = useRef()

  const defaultColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      editable: true,
      required: true,
      type: 'input',
    },
    {
      title: '数量',
      dataIndex: 'count',
      editable: true,
      type: 'inputNumber',
    },
  ]

  return (
    <EditTable
      editTableRef={editTableRef}
      defaultColumns={defaultColumns}
      data={[{ id: 1, name: '测试项', count: 2 }]}
      selection
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `editTableRef` | 组件实例引用，用于调用内部方法 | `React.MutableRefObject<EditTableRef \| undefined>` | 无 |
| `defaultColumns` | 表格列配置 | `EditTableColumns[]` | 无 |
| `data` | 表格数据源 | `any[]` | 无 |
| `toolsBar` | 左上角工具栏配置 | `IHeaderTools` | 无 |
| `selection` | 是否开启行选择 | `boolean` | `false` |
| `rowKey` | 行唯一键字段 | `string` | `'id'` |
| `table` | 透传给内部 `Table` 的配置 | `TableProps` | 无 |

### Callback Props
无

### Children
无

### Ref
| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `getEditTableData` | 获取当前表格数据；传入 `submit` 时会执行必填校验并清理前端生成的临时 `id` | `(type?: string)` | `any[]` |
| `handleAdd` | 新增一行空数据 | 无 | `void` |
| `handleDelete` | 删除指定行 | `(id: string \| number)` | `void` |
| `handleDeleteBatch` | 批量删除已勾选行 | 无 | `React.Key[]` |

## 数据结构
```ts
type EditTableColumns = {
  title: React.ReactNode | string
  dataIndex: string
  required?: boolean
  editable?: boolean
  type?: string
  formProps?: object
  rest?: any
  resetFieldName?: string[]
}

type IHeaderTools = {
  leftToolbar?: React.ReactNode[]
}

type EditTableRef = {
  getEditTableData: (type?: string) => void
  handleDelete: (params?: any) => void
  handleAdd: () => void
  handleDeleteBatch: () => void
}
```

`type` 在当前实现中支持：

```ts
'input' | 'inputNumber' | 'select' | 'searchInput' | 'dateRange' | 'date'
```

## Design Token
无

## Accessibility
组件主要依赖底层 `Table`、`Form`、`Input`、`Select`、`DatePicker` 的可访问性能力；当前源码未看到额外的无障碍增强配置。

## FAQ
如何拿到编辑后的表格数据？

通过 `editTableRef.current?.getEditTableData()` 获取；如果用于提交，建议调用 `getEditTableData('submit')`，这样会先执行必填校验。

