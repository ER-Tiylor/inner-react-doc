# SearchTree 树选择

## 介绍
`SearchTree` 是一个带关键字过滤能力的树选择组件，支持远程加载树数据、字段映射、默认首项选中和节点选择回调。

## 何时使用
适用于左侧目录树、组织树、分类树、区域树等需要先筛选再选择节点的场景。

## 代码演示
```tsx
import SearchTree from '@/components/SearchTree'

export default function Demo() {
  return (
    <SearchTree
      requestUrl="/api/category/tree"
      requestMethod="get"
      defaultSelectFirst
      onSelect={selectedKeys => {
        console.log(selectedKeys)
      }}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `requestParams` | 请求附加参数 | `any` | 无 |
| `requestUrl` | 树数据接口地址 | `string` | 无 |
| `requestMethod` | 请求方法 | `'get' \| 'post'` | `'get'` |
| `fieldName` | 指定树节点 code/name 字段映射 | `{ code: string; name: string }` | 无 |
| `defaultSelectFirst` | 是否默认选中第一项 | `boolean` | 无 |
| `onSelect` | 选中节点回调 | `(selectedKeys: React.Key[]) => void` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onSelect` | 选择叶子节点时触发 | `(selectedKeys: React.Key[])` |

### Children
无

### Ref
无

## 数据结构
```ts
type SearchTreeProps = {
  requestParams?: any
  requestUrl: string
  requestMethod?: 'get' | 'post'
  fieldName?: {
    code: string
    name: string
  }
  defaultSelectFirst?: boolean
  onSelect?: (selectedKeys: React.Key[]) => void
}
```

树数据格式要求默认是：

```ts
{
  code: string
  name: string
  children?: []
}
```

如果接口字段不同，可以通过 `fieldName` 指定映射：

```ts
fieldName: {
  code: 'id',
  name: 'label'
}
```

组件内部会将数据格式化为：

```ts
item.key = item[fieldName.code]
item.title = item[fieldName.name]
```

并支持关键字高亮过滤。

## Design Token
无

## Accessibility
组件由 `Input` 和 `Tree` 组成，基础键盘与焦点能力依赖底层组件；当前源码未看到额外无障碍增强属性。

## FAQ
为什么父节点不能选中？

源码会把带 `children` 的节点设置为 `selectable: false`，因此只有叶子节点可被真正选中。

