# FlowModal 审批流程弹窗

## 介绍
`FlowModal` 是一个审批流程抽屉组件，用于查询指定单据的审批节点，并通过时间轴形式展示当前流程状态。

## 何时使用
适用于业务单据详情页、列表操作区等需要查看审批流节点、审批人和审批时间的场景。

## 代码演示
```tsx
import { useState } from 'react'
import FlowModal from '@/components/FlowModal/Index'

export default function Demo() {
  const [open, setOpen] = useState(false)

  return (
    <FlowModal
      open={open}
      params={{
        orderNo: 'ORDER_001',
        approvalTypeCode: 'contract_approve',
      }}
      onCloseModal={() => setOpen(false)}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `open` | 控制抽屉显示状态 | `boolean` | 无 |
| `params` | 查询审批流程所需参数 | `{ orderNo: string \| number \| undefined; approvalTypeCode: string }` | 无 |
| `onCloseModal` | 关闭抽屉时触发 | `any` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onCloseModal` | 关闭抽屉时触发 | 无 |

### Children
无

### Ref
无

## 数据结构
审批节点数据结构如下：

```ts
interface INodeType {
  nodeName: string
  approvalUserId: number
  approvalUser: string
  approvalDepartId: number
  approvalDepartName: string
  approvalTime: string
  approvalUserList: {
    approvalUserId: number
    approvalUser: string
  }[]
  businessGroupVO: {
    businessGroupCode: string
    businessGroupName: string
  }
  approvalNo: string
  orderNo: string
  createTime: string
  createId: number
  createName: string
  approvalTypeCode: string
  approvalTypeName: string
  approvalStatus: number
}
```

组件请求接口时会额外补充：

```ts
{
  ...params,
  orderSource: 'bms'
}
```

## Design Token
无

## Accessibility
组件基于 `Drawer` 和 `Timeline` 实现，基础键盘交互与焦点管理依赖底层组件；当前源码未看到额外的无障碍增强属性。

## FAQ
为什么有些节点显示已审批，有些只显示可审批人？

源码中如果节点存在 `approvalUser`，会按已处理节点展示审批人、审批结果和审批时间；如果没有实际审批人但存在 `approvalUserList`，则按待处理节点展示可审批人员列表。

