# useDataDict

路径：`src/hooks/vision/dataDict.ts`

## 定位

`useDataDict` 用于统一消费系统内的字典数据，是 BMS 体系中的业务通用 Hook，主要解决页面对状态、枚举、选项字典的重复获取与重复转换问题。

## 真实返回值

```ts
const { dictData, getDictData } = useDataDict(fields, tenantId)
```

- `fields`：要取的字典编码数组
- `tenantId`：可选，传入后按指定租户取字典；不传时会走“公共字典 + 私有字典分组”逻辑
- `dictData`：按 `fields` 顺序返回的数组
- `getDictData`：手动重新拉取/重算字典数据的方法

## 如何使用

### 示例 1：单个字典直接给表单使用

这类写法在 BMS 中很常见。

```tsx
import { Select } from '@/antd'
import { useDataDict } from '@/hooks/vision/dataDict'
import { useUserStore } from '@/store/user'

const TaxForm = () => {
  const {
    userInfo: { tenantId },
  } = useUserStore()

  const {
    dictData: [SHUILV],
  } = useDataDict(['shuilv'], tenantId)

  return <Select options={SHUILV} />
}
```

`SHUILV` 里的每个选项已经带有 `label`、`value`、`resValue` 等字段，适合直接给下拉框用。

### 示例 2：多个字典按顺序解构

```tsx
const {
  dictData: [SHUILV, CAIWUZUZHI],
} = useDataDict(['shuilv', 'caiwuzuzhi'], tenantId)
```

注意这里返回值依赖 `fields` 顺序，解构时要保持一致。

### 示例 3：租户变化时手动刷新

```tsx
const { dictData, getDictData } = useDataDict(['shuilv'], tenantId)

useEffect(() => {
  if (tenantId) {
    getDictData(tenantId)
  }
}, [tenantId])
```

适合页面上租户切换后，需要立即重新计算字典数据的场景。

## 适合使用的场景

- 表单下拉项依赖统一字典
- 列表筛选项依赖统一字典
- 状态展示、标签展示依赖统一枚举来源
- 多个页面共享同一套字典定义

## 不适合使用的场景

- 页面只需要一次性写死的少量选项
- 字典来源并不走当前 store 或当前字典体系
- 页面希望完全独立于现有业务基础设施运行

## 适用边界

`useDataDict` 更适合作为平台内部通用 Hook，而不是完全独立的公共 npm Hook。它不负责：

- 页面独有临时枚举的组织
- 接口协议不一致时的页面级适配
- 字典字段定义混乱时的历史兼容清洗

如果字典源头本身不统一，这个 Hook 也无法单独解决治理问题。