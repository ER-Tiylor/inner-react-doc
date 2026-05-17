# NavFooter 页脚

## 介绍
`NavFooter` 是一个简单的页面底部文案组件，用于在布局底部展示版权或说明信息。

## 何时使用
适用于后台系统布局页底部的统一页脚区域。

## 代码演示
```tsx
import NavFooter from '@/components/NavFooter'

export default function Demo() {
  return <NavFooter />
}
```


## API
### Props
无

### Callback Props
无

### Children
无

### Ref
无

## 数据结构
无

## Design Token
无

## Accessibility
组件仅渲染一段静态文本，当前源码未添加额外无障碍属性。

## FAQ
页脚内容是否支持自定义？

当前源码中页脚文案写死在组件内部，不支持通过 `props` 自定义。

