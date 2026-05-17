# PDFViewer PDF 预览

## 介绍
`PDFViewer` 是一个 PDF 预览弹窗组件，会在弹窗中动态加载 `pdf.js`，通过 `canvas` 渲染 PDF 页面，并提供上一页、下一页和页码显示能力。

## 何时使用
适用于附件预览、合同预览、单据预览等需要在页面内直接查看 PDF 文件内容的场景。

## 代码演示
```tsx
import { useState } from 'react'
import PDFViewer from '@/components/PDFViewer'

export default function Demo() {
  const [visible, setVisible] = useState(false)

  return (
    <PDFViewer
      visible={visible}
      onClose={() => setVisible(false)}
      pdfTitle="合同预览"
      pdfUrl="https://example.com/demo.pdf"
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `visible` | 控制弹窗显示状态 | `boolean` | 无 |
| `onClose` | 关闭弹窗回调 | `() => void` | 无 |
| `pdfUrl` | PDF 文件地址 | `string` | 无 |
| `pdfTitle` | PDF 弹窗标题 | `string` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `onClose` | 点击关闭弹窗时触发 | 无 |

### Children
无

### Ref
无

## 数据结构
```ts
interface PDFViewerProps {
  visible: boolean
  onClose: () => void
  pdfUrl?: string
  pdfTitle?: string
}
```

组件内部维护的核心状态包括：

```ts
isLoading: boolean
error: string
pdfDoc: any
currentPage: number
totalPages: number
```

组件会在运行时加载：

```ts
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
```

## Design Token
无

## Accessibility
组件基于 `Modal`、按钮和 `canvas` 渲染实现，基础交互能力依赖底层组件；当前源码未看到针对 PDF 内容阅读的额外无障碍支持。

## FAQ
为什么打开预览时会有加载过程？

组件会先远程加载 `pdf.js`，再请求 PDF 文件、解析文档对象并渲染到 `canvas`，因此打开时会经历一次异步加载过程。

