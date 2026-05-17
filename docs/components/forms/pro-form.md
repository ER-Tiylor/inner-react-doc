# ProForm 业务表单

## 介绍
`ProForm` 是一个配置驱动的业务表单组件，封装了表单项布局、查看模式、依赖联动显示、详情回填、统一提交重置按钮等能力。目录下还提供了 `ProFormCard`，用于按卡片分组渲染表单。

## 何时使用
适用于新增、编辑、复制、查看详情等业务表单页面，尤其是需要通过配置数组快速生成表单结构的场景。

## 代码演示
### ProForm 基础用法
```tsx
import { useRef } from 'react'
import { Input, Select } from '@/antd'
import ProForm from '@/components/ProForm'

export default function Demo() {
  const formref = useRef()

  return (
    <ProForm
      form={{
        formref,
        type: 'create',
        onSubmit: values => {
          console.log(values)
        },
      }}
      formItem={[
        {
          itemProps: {
            name: 'name',
            label: '名称',
            rules: [{ required: true, message: '请输入名称' }],
          },
          component: <Input />,
        },
        {
          itemProps: {
            name: 'status',
            label: '状态',
          },
          component: <Select options={[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]} />,
        },
      ]}
    />
  )
}
```

### ProForm 联动显示
```tsx
import { Input, Select } from '@/antd'
import ProForm from '@/components/ProForm'

export default function Demo() {
  return (
    <ProForm
      form={{
        type: 'create',
        onSubmit: values => console.log(values),
      }}
      formItem={[
        {
          itemProps: {
            name: 'type',
            label: '类型',
          },
          component: <Select options={[{ label: '普通', value: 'normal' }, { label: '其他', value: 'other' }]} />,
        },
        {
          itemProps: {
            name: 'remark',
            label: '备注',
            dependencies: ['type'],
          },
          component: <Input />,
          hiddenFun: form => form.getFieldValue('type') !== 'other',
        },
      ]}
    />
  )
}
```

### ProFormCard 分组用法
```tsx
import { Input } from '@/antd'
import ProFormCard from '@/components/ProForm/ProFormCard'

export default function Demo() {
  return (
    <ProFormCard
      form={{
        type: 'edit',
        onSubmit: values => console.log(values),
      }}
      formItem={[
        {
          title: '基础信息',
          children: [
            {
              itemProps: {
                name: 'name',
                label: '名称',
              },
              component: <Input />,
            },
          ],
        },
        {
          title: '扩展信息',
          children: [
            {
              itemProps: {
                name: 'remark',
                label: '备注',
              },
              component: <Input.TextArea />,
            },
          ],
        },
      ]}
    />
  )
}
```


## API
### Props
| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `form` | 表单整体配置 | `IProForm['form']` | 无 |
| `formItem` | 表单项配置数组 | `IFormItemProps[]` | 无 |
| `btnProps` | 底部按钮文案与附加按钮配置 | `{ okText?: string; resetText?: string; otherBtn?: ReactNode[] }` | 无 |
| `btnShow` | 是否展示默认按钮区 | `boolean` | `true` |
| `showBtnReset` | 是否展示重置按钮 | `boolean` | `true` |
| `rowStyles` | 无 | `any` | 无 |

### Callback Props
| 属性名 | 说明 | 回调参数 |
| --- | --- | --- |
| `form.onSubmit` | 点击提交并校验通过后触发 | `(values: any)` |
| `form.getDetails` | 非新增模式下初始化详情数据 | `(form: FormInstance)` |

### Children
无

### Ref
通过 `form.formref` 暴露以下能力：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| `form` | antd 表单实例 | 无 | `FormInstance` |
| `onSubmit` | 触发表单校验和提交 | 无 | `void` |

## 数据结构
### 1. `ProForm` 简化结构
```ts
type IProForm = {
  form: FormProps & {
    formref?: MutableRefObject<IFormRef | undefined>
    rowProps?: RowProps
    type?: 'create' | 'edit' | 'view' | 'copy'
    onSubmit?: Function
    getDetails?: (form: FormInstance) => void
  }
  formItem: IFormItemProps[]
  btnProps?: {
    okText?: string
    resetText?: string
    otherBtn?: React.ReactNode[]
  }
  btnShow?: boolean
  showBtnReset?: boolean
  rowStyles?: any
}
```

### 2. `ProForm` 单个表单项结构
```ts
type IFormItemProps = {
  itemProps: FormItemProps
  component: React.ReactElement | ((form: FormInstance) => React.ReactElement)
  hiddenFun?: (form: FormInstance) => boolean
  viewTextFun?: Function
  colProps?: ColProps
  hidden?: boolean
  divide?: {
    title?: string
    style?: React.CSSProperties
  }
}
```

说明：

```ts
itemProps   => 直接透传给 Form.Item
component   => 真正渲染的输入组件，也可以是接收 form 的函数
hiddenFun   => 配合 dependencies 动态隐藏当前项
viewTextFun => 查看模式下自定义展示文本
colProps    => 当前表单项所在 Col 的布局
hidden      => 静态隐藏
divide      => 用于插入分隔标题或占位块，而不是一个真实字段
```

### 3. `form.type` 的行为
```ts
create => 新建
edit   => 编辑
copy   => 复制
view   => 查看
```

关键差异：

```ts
1. 非 create 模式会自动调用 getDetails(form)
2. view 模式下会给子组件注入 viewMode: true
3. view 模式下文本颜色被调整为可读状态
4. view 模式下默认按钮区不会展示
```

### 4. `component` 的两种写法
直接传元素：

```tsx
{
  itemProps: { name: 'name', label: '名称' },
  component: <Input />
}
```

传函数以读取当前表单实例：

```tsx
{
  itemProps: { name: 'customerId', label: '客户' },
  component: form => (
    <Select
      options={[]}
      onChange={() => {
        console.log(form.getFieldValue('customerId'))
      }}
    />
  )
}
```

### 5. 联动隐藏的简化写法
如果某项依赖其他字段显示，通常这样配：

```ts
{
  itemProps: {
    name: 'reason',
    label: '原因',
    dependencies: ['status'],
  },
  component: <Input.TextArea />,
  hiddenFun: form => form.getFieldValue('status') !== 'reject',
}
```

### 6. `divide` 分隔项
`divide` 不是字段，而是一个占位分隔配置：

```ts
{
  divide: {
    title: '基础信息',
  }
}
```

或：

```ts
{
  divide: {
    style: { height: 12 }
  }
}
```

### 7. `ProFormCard` 的分组卡片结构
目录下的 `ProFormCard` 使用另一套配置结构，适用于分组卡片表单：

```ts
type ProFormCardItem = {
  title: string
  hiddenInForm?: boolean
  children: {
    itemProps: FormItemProps
    component: React.ReactElement | Function
    hiddenFun?: (form: FormInstance) => boolean
    viewTextFun?: Function
    colProps?: ColProps
    hidden?: boolean
  }[]
}
```

也就是说：

```ts
ProForm      => 一维数组 formItem
ProFormCard  => 二维分组数组 formItem，每组一个 Card
```

## Design Token
无

## Accessibility
组件建立在 antd `Form` 体系之上，基础标签关联、键盘焦点和校验提示能力依赖底层组件；当前源码未看到额外统一无障碍扩展。

## FAQ
查看模式为什么有些组件还能正常显示内容？

因为组件在 `view` 模式下会优先调用 `viewTextFun`，否则给子组件注入 `viewMode: true`，前提是子组件自身支持这个只读展示约定。

为什么 `getDetails` 里拿到的是 `form` 实例而不是直接传数据？

这套封装希望把详情回填逻辑交给业务方自行控制，业务方可以在 `getDetails(form)` 内决定何时请求接口、如何 `setFieldsValue`，灵活性更高。

