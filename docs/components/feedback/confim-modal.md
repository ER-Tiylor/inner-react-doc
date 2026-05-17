# ConfimModal 确认弹窗

## 介绍
> 命名说明
>
> 当前源码目录和组件名使用的是 `ConfimModal`。这是历史命名，语义上更合理的名字应为 `ConfirmModal`。本页保留源码名称，避免和实际代码引用脱节。
`ConfimModal` 是一个轻量确认弹窗组件，用于在提交前二次确认当前操作。

## 何时使用
适用于保存、提交等关键操作前，需要用户再次确认的场景。

## 代码演示
```tsx
import { useState } from 'react'
import ConfimModal from '@/components/ConfimModal'

export default function Demo() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>打开确认框</button>
      <ConfimModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSubmit={() => {
          console.log('submit')
        }}
      />
    </>
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `isModalOpen` | 控制弹窗显示状态 | `boolean` | 无 |
| `setIsModalOpen` | 更新弹窗显示状态的方法 | `React.Dispatch<React.SetStateAction<boolean>>` | 无 |
| `onSubmit` | 点击确认后的提交方法 | `any` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onSubmit` | 点击弹窗确认按钮时触发 | 无 |
| `setIsModalOpen` | 点击取消按钮时触发关闭 | `false` |

### Children
无

### Ref
无

## 数据结构
无

## Design Token
组件样式中使用了以下设计变量：

| Token | 说明 |
| --- | --- |
| `--modal-color-info` | 图标颜色 |

## Accessibility
组件基于 `Modal` 实现，基础焦点管理与键盘关闭能力依赖底层弹窗组件；当前源码未额外定义 `aria-*` 属性。

## FAQ
确认文案是否支持自定义？

当前源码中确认提示文案写死在组件内部，不支持通过 `props` 自定义。

