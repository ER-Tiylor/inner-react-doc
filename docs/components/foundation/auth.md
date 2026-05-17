# Auth 权限控制

## 介绍
`Auth` 是一个权限渲染组件，根据当前用户权限码决定是否展示子内容。

## 何时使用
适用于按钮、操作区块、页面片段等需要按权限控制显示与隐藏的场景。

## 代码演示
```tsx
import Auth from '@/components/Auth'

export default function Demo() {
  return (
    <Auth authCode="contract:create">
      <button>新增合同</button>
    </Auth>
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `authCode` | 权限码；为空时默认展示内容 | `string` | 无 |
| `children` | 需要受权限控制的内容 | `any` | 无 |

### Callback Props
无

### Children
| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `children` | 有权限时渲染的内容 | `ReactNode` |

### Ref
无

## 数据结构
组件依赖用户态中的权限列表：

```ts
type PrivilegeList = string[]
```

逻辑规则如下：

```ts
!authCode || privilegeList?.includes(authCode)
```

## Design Token
无

## Accessibility
`Auth` 本身不产生额外语义结构，仅决定是否渲染子节点；无障碍表现取决于传入的子内容。

## FAQ
没有权限时会渲染什么？

组件会返回空节点，不展示任何内容。

