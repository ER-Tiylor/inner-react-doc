# KeepAlive 页面缓存

## 介绍
`KeepAlive` 是一组基于 `react-activation` 的页面缓存封装，用于给路由页面提供缓存、按条件清理缓存以及在标签关闭时同步卸载缓存页面。

## 何时使用
适用于多标签页管理、列表详情往返、编辑页返回保留状态等需要页面级缓存的场景。

## 代码演示
```tsx
import KeepAlive from '@/components/KeepAlive'

export default function Demo() {
  return (
    <KeepAlive clearSameOther>
      <YourPage />
    </KeepAlive>
  )
}
```

如果在微前端环境下需要监听标签关闭并同步删除缓存：

```tsx
import DropAlive from '@/components/KeepAlive/DropAlive'

export default function Demo(props: any) {
  return <DropAlive onGlobalStateChange={props.onGlobalStateChange} />
}
```


## API
### Props
主导出组件 `KeepAlive` 的 Props：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 需要被缓存的页面内容 | `React.ReactNode` | 无 |
| `clearSameOther` | 是否清理同一路由名的其他缓存实例 | `boolean` | `false` |
| `autoFreeze` | 是否启用 `react-activation` 的自动冻结能力 | `boolean` | `false` |

`DropAlive` 的 Props：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `onGlobalStateChange` | 微前端全局状态监听函数 | `any` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onGlobalStateChange` | 监听全局状态变化并在标签关闭时清理缓存 | `(state, prev)` |

### Children
| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `children` | 被缓存的页面组件 | `ReactNode` |

### Ref
无

## 数据结构
核心常量：

```ts
enum TAB_TYPE {
  关闭当前 = '1',
  关闭其他 = '2',
  关闭所有 = '3',
}

const TYPE_ROUTER = ['copy', 'edit', 'view']
const MARK = '-#-'
```

主组件会基于当前 URL 生成缓存标识：

```ts
name = createAliveName()
id = createAliveId()
nameId = `${name}${MARK}${id}`
```

此外，工具函数还提供：

```ts
useDropKeepAlive()
useCreateAliveId()
useDrop()
createAliveName()
createAliveId()
isOptionRoute()
```

## Design Token
无

## Accessibility
该组件主要负责缓存控制，不直接产出可见交互界面；无障碍表现取决于被缓存页面本身。

## FAQ
`clearSameOther` 有什么作用？

开启后，如果当前页面与已有缓存页面属于同一路由名但缓存标识不同，组件会主动清理旧缓存，避免同类页面缓存实例堆积。

