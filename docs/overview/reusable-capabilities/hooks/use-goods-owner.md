# useGoodsOwner

路径：`src/hooks/vision/goodsOwner.ts`

## 定位

`useGoodsOwner` 是面向当前 BMS 体系的业务通用 Hook，用于统一处理货主相关数据的获取、筛选和页面消费逻辑。

## 真实返回值

```ts
const { viewData, getConfigData } = useGoodsOwner(showFields)
```

其中 `showFields` 支持：

```ts
{
  goodsOwner?: boolean
  consignor?: boolean
  materialCategory?: boolean
}
```

`viewData` 当前包含：

- `customerMap`
- `goodsOwnerMap`
- `consignorMap`
- `materialCategoryMap`
- `initialConsignorId`
- `initialGoodsOwnerId`

## 如何使用

### 示例 1：只取货主下拉数据

这类写法在多个列表页里已经在用。

```tsx
import { Select } from '@/antd'
import { useGoodsOwner } from '@/hooks/vision/goodsOwner'

const ListPage = () => {
  const { viewData } = useGoodsOwner({ goodsOwner: true })

  return <Select options={viewData.goodsOwnerMap} />
}
```

### 示例 2：同时取货主和托运人

这类场景常见于协议编辑、结算申请编辑页。

```tsx
const { viewData, getConfigData } = useGoodsOwner({
  goodsOwner: true,
  consignor: true,
})

const handleTenantChange = (tenantId: number) => {
  getConfigData(tenantId)
}
```

当页面上切换租户、货主或主体时，可以主动调用 `getConfigData` 重新拉配置。

### 示例 3：利用默认值回填表单

BMS 里已经有类似写法。

```tsx
useEffect(() => {
  if (viewData.initialConsignorId) {
    form.setFieldValue('consignorIds', [viewData.initialConsignorId])
  }
}, [viewData.initialConsignorId])
```

如果当前结果里只有一个托运人或货主，这个 Hook 会给出默认值，页面可以直接回填。

## 适合使用的场景

- 表单、筛选区、详情页需要复用货主数据
- 多个页面都要处理当前用户可见货主范围
- 货主列表和当前登录态、权限态存在稳定关系

## 不适合使用的场景

- 完全没有货主概念的子应用
- 货主模型和当前体系不同的独立业务
- 页面只需要一次性的局部 mock 选项

## 适用边界

`useGoodsOwner` 不是纯底层 Hook，通常会依赖：

- 当前用户态
- 当前权限体系
- 当前 store 或既有业务服务

因此它适合在“同一套货主模型”的多个子应用中推广，但不适合：

- 被包装成完全通用的底层能力
- 直接抽成对外公共 npm 包
- 脱离现有业务约束独立运行