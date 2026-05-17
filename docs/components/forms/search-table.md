# SearchTable 搜索表格

## 介绍
`SearchTable` 当前是一个轻量搜索表单示例组件，封装了一个基础 `SearchForm` 壳层和查询、重置按钮区域。

## 何时使用
适用于需要快速搭建简单筛选表单的场景，或作为后续扩展搜索表格组件的基础模板。

## 代码演示
```tsx
import { Form, Input } from '@/antd'
import SearchForm from '@/components/SearchTable/SearchForm'

export default function Demo() {
  const [form] = Form.useForm()

  return (
    <SearchForm
      form={form}
      initalValues={{}}
      handleSubmit={() => {
        console.log(form.getFieldsValue())
      }}
      handleReset={() => {
        form.resetFields()
      }}
    >
      <Form.Item label="用户ID" name="id">
        <Input placeholder="请输入用户ID" />
      </Form.Item>
    </SearchForm>
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| 无 | 当前 `SearchTable` 入口组件未消费外部参数 | `ISearchTableProps` | 无 |

`SearchForm` 子组件 Props：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `form` | 表单实例 | `FormInstance<any>` | 无 |
| `initalValues` | 表单初始值 | `object` | 无 |
| `handleReset` | 重置回调 | `() => void` | 无 |
| `handleSubmit` | 查询回调 | `() => void` | 无 |
| `children` | 自定义表单项内容 | `React.ReactNode` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `handleSubmit` | 点击查询按钮时触发 | 无 |
| `handleReset` | 点击重置按钮时触发 | 无 |

### Children
| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `children` | 传入到 `SearchForm` 中的表单项 | `ReactNode` |

### Ref
无

## 数据结构
```ts
interface ISearchTableProps {}

interface ISearchFormProps {
  form: FormInstance<any>
  initalValues: object
  handleReset: () => void
  handleSubmit: () => void
  children: React.ReactNode
}
```

分页初始配置常量：

```ts
const initPageNum = {
  page: 1,
  pageSize: 10,
}
```

## Design Token
无

## Accessibility
组件基于 `Form` 和按钮组合实现，基础可访问性能力依赖底层组件；当前源码未看到额外无障碍增强配置。

## FAQ
为什么这个组件看起来能力很少？

因为当前仓库里的 `SearchTable` 实现本身就是一个较薄的模板封装，主要能力集中在 `SearchForm` 壳层和按钮区，尚未扩展成完整的表格查询容器。

