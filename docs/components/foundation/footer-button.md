# FooterButton 底部按钮

## 介绍
`FooterButton` 是一个页面底部按钮容器组件，用于将操作按钮固定在页面底部右侧区域展示。

## 何时使用
适用于抽屉、详情页、表单页等需要将“提交”“取消”“保存”等操作固定在底部的场景。

## 代码演示
```tsx
import FooterButton from '@/components/FooterButton'
import { Button } from '@/antd'

export default function Demo() {
  return (
    <FooterButton>
      <Button>取消</Button>
      <Button type="primary">保存</Button>
    </FooterButton>
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `children` | 底部操作区内容 | `any` | 无 |

### Callback Props
无

### Children
| 名称 | 说明 | 类型 |
| --- | --- | --- |
| `children` | 渲染在底部操作栏中的按钮或其他内容 | `ReactNode` |

### Ref
无

## 数据结构
无

## Design Token
无

## Accessibility
组件本身主要负责布局，不提供额外语义；无障碍表现取决于传入的按钮或子内容。

## FAQ
按钮为什么固定在页面底部？

组件内部容器使用了 `position: absolute`、`bottom: 0` 和右对齐布局，目的是提供统一的底部操作区样式。

