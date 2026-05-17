# LogModal 日志查看弹窗

## 介绍
`LogModal` 是一个日志查看弹窗组件，基于 `Modal` 和 `ProTable` 封装，用于查询并展示业务操作日志列表。

## 何时使用
适用于详情页、列表页操作区中查看某条业务数据的新增、编辑、删除、审核、导入等历史操作记录。

## 代码演示
```tsx
import { useState } from 'react'
import LogModal from '@/components/LogModal'

export default function Demo() {
  const [visible, setVisible] = useState(false)

  return (
    <LogModal
      logModalProps={{
        visible,
        onCancel: () => setVisible(false),
        actions: '/api/log/list',
        logParam: {
          businessId: 1001,
          businessType: 'contract',
        },
      }}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `logModalProps` | 日志弹窗配置对象 | `ILogModalProps` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `logModalProps.onCancel` | 关闭弹窗时触发 | 无 |

### Children
无

### Ref
无

## 数据结构
```ts
interface ILogModalProps {
  visible: boolean
  onCancel?: () => void
  actions?: string
  logParam?: {
    businessId?: string | number
    customerId?: string | number
    businessType?: string | number
    system?: string | number
    id?: number
  }
}
```

日志列表项结构：

```ts
interface Logcolumns {
  actionType: string
  businessId: string
  businessType: string
  context: string
  createTime: string
  createUser: string
  id: number
  phone: string
  updateAfterContent: string
  updateBeforeContent: string
}
```

内置操作类型映射包括：新建、删除、编辑、禁用、启用、审核、提交、作废、导出、上传、冻结、解冻、撤销等。

## Design Token
无

## Accessibility
组件主要依赖 `Modal` 和表格组件的基础可访问性能力；当前源码未看到额外无障碍增强属性。

## FAQ
日志内容里为什么有时会显示下载链接？

源码会检测操作内容中是否包含“导入文件”，如果包含下载地址，会自动把对应内容渲染成可点击链接。

