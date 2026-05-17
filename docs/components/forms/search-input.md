# SearchInput 远程搜索

## 介绍
`SearchInput` 是一个远程搜索下拉组件，基于 `Select` 封装，支持输入关键字后异步请求选项、初始回显、`labelInValue` 场景以及查看模式文本展示。

## 何时使用
适用于表单中需要远程模糊搜索下拉数据的场景，例如客户、站点、主体、合同等关联对象选择。

## 代码演示
```tsx
import SearchInput from '@/components/SearchInput'

export default function Demo() {
  return (
    <SearchInput
      placeholder="请输入客户名称查询"
      url="/api/customer/search"
      params={{ status: 1 }}
      onChange={(value, option) => {
        console.log(value, option)
      }}
      other={{
        key: 'id',
        labelName: 'name',
      }}
    />
  )
}
```

`labelInValue` 场景：

```tsx
<SearchInput
  placeholder="请选择"
  url="/api/site/search"
  rest={{ labelInValue: true }}
/>
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `placeholder` | 占位文案 | `string` | 无 |
| `isFocusRequest` | 是否在获取焦点时请求一次完整列表 | `boolean` | `false` |
| `style` | 样式 | `React.CSSProperties` | 无 |
| `requestMethod` | 请求方法 | `string` | `'post'` |
| `url` | 查询接口地址 | `string` | `''` |
| `params` | 附加请求参数 | `any` | `{}` |
| `onChange` | 值变化回调 | `Function` | 无 |
| `onFocus` | 无 | `Function` | 无 |
| `rest` | 透传给内部 `Select` 的配置 | `SelectProps` | 无 |
| `defaultValue` | 无 | `any` | 无 |
| `watch` | 用于监听外部关联字段变化 | `number \| string` | 无 |
| `isEditTableUse` | 是否用于可编辑表格场景 | `boolean` | 无 |
| `other` | 字段映射配置 | `OtherProps` | 无 |
| `value` | 当前值 | `any` | 无 |
| `viewMode` | 查看模式 | `boolean` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onChange` | 选择项变化时触发 | `(newValue, option)` |

### Children
无

### Ref
无

## 数据结构
请求参数默认会把用户输入作为：

```ts
{
  ...params,
  name: keyword
}
```

如果配置了 `other.labelName`，则会改为：

```ts
{
  ...params,
  [other.labelName]: keyword
}
```

对外的核心配置结构：

```ts
type OtherProps = {
  key?: string
  labelName?: string
}

type SearchInputProps = {
  placeholder: string
  requestMethod?: string
  url?: string
  params?: any
  onChange?: Function
  rest?: SelectProps
  other?: OtherProps
  value?: any
  viewMode?: boolean
}
```

接口返回结果默认按以下字段转为下拉项：

```ts
{
  value: item.code,
  label: item.name,
  data: item
}
```

如果配置 `other.key` / `other.labelName`，则映射为：

```ts
{
  value: item[other.key],
  label: item[other.labelName],
  data: item
}
```

## Design Token
无

## Accessibility
组件基于 `Select` 实现，基础键盘交互与焦点行为依赖底层组件；当前源码未看到额外无障碍增强属性。

## FAQ
查看模式下为什么直接显示文本而不是下拉框？

如果开启 `viewMode` 且 `rest.labelInValue` 为 `true`，组件会直接把当前值中的 `label` 渲染成文本，适合详情查看场景。

