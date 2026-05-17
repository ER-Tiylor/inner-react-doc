# ImportModal 导入弹窗

## 介绍
`ImportModal` 是一个导入弹窗组件，集成模板下载、拖拽上传、导入结果提示和错误明细展示能力。

## 何时使用
适用于批量导入 Excel/CSV 数据，并需要给用户提供标准模板下载和导入失败原因反馈的场景。

## 代码演示
```tsx
import { useState } from 'react'
import ImportModal from '@/components/ImportModal'

export default function Demo() {
  const [visible, setVisible] = useState(false)

  return (
    <ImportModal
      visible={visible}
      title="批量导入"
      templateType=".xlsx"
      action="/api/import"
      downloadUrl="/api/template"
      onCancel={() => setVisible(false)}
      onRefresh={() => {
        console.log('refresh')
      }}
      onSuccess={res => {
        console.log(res)
      }}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `visible` | 控制弹窗显示状态 | `boolean` | 无 |
| `template` | 模板下载地址 | `any` | 无 |
| `templateType` | 允许上传的模板类型 | `'.csv' \| '.xls' \| '.xlsx'` | 无 |
| `action` | 导入接口地址 | `string` | 无 |
| `onCancel` | 关闭弹窗方法 | `() => any` | 无 |
| `templateName` | 模板文件名 | `string` | 无 |
| `data` | 上传时附带的额外参数 | `object` | `{}` |
| `title` | 弹窗标题 | `string` | `'导入'` |
| `onRefresh` | 导入完成后触发，一般用于刷新列表 | `() => any` | `() => 0` |
| `onSuccess` | 导入成功后的结果回调 | `(res: any) => any` | 无 |
| `serverDownload` | 是否后端下载模板 | `boolean` | 无 |
| `downloadParams` | 下载模板时拼接到 URL 上的参数 | `object` | `{}` |
| `importParams` | 无 | `object` | 无 |
| `downloadUrl` | 下载地址 | `string` | `''` |
| `footer` | 无 | `React.ReactNode` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onCancel` | 关闭导入弹窗时触发 | 无 |
| `onRefresh` | 导入成功或返回错误结果后触发 | 无 |
| `onSuccess` | 导入成功后触发 | `file.response.data` |

### Children
无

### Ref
无

## 数据结构
```ts
interface IProps {
  visible: boolean
  template?: any
  templateType: '.csv' | '.xls' | '.xlsx'
  action: string
  onCancel: () => any
  templateName?: string
  data?: object
  title?: string
  onRefresh?: () => any
  onSuccess?: (res: any) => any
  serverDownload?: boolean
  downloadParams?: object
  importParams?: object
  downloadUrl?: string
  footer?: React.ReactNode
}
```

组件会校验上传文件后缀，仅允许：

```ts
['.csv', '.xls', '.xlsx']
```

## Design Token
无

## Accessibility
组件以 `Modal` 和 `Upload.Dragger` 为核心，基础键盘和焦点行为依赖底层组件；当前源码未额外补充无障碍属性。

## FAQ
导入失败时用户能看到什么？

如果接口返回 `errno !== 0`，组件会弹出“导入结果”弹窗，展示错误摘要和逐条错误明细。

