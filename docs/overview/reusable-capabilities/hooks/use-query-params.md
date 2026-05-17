# useQueryParams

路径：`src/hooks/useQueryParams.ts`

## 定位

`useQueryParams` 用于统一处理页面 URL 查询参数的读取，适合列表页、详情页、筛选页等需要从地址栏恢复页面状态的场景。

## 真实签名

```ts
function useQueryParams(): Record<string, string>
```

它当前只负责“读取并展开查询参数”，本身不提供回写能力。

## 如何使用

### 示例 1：在编辑页读取 `id`

这类写法在 BMS 中已经有真实使用。

```tsx
import useQueryParams from '@/hooks/useQueryParams'

const EditModule = () => {
  const { id } = useQueryParams()

  useEffect(() => {
    if (id) {
      fetchDetail(id)
    }
  }, [id])

  return <div />
}
```

适合场景：

- 编辑页通过 `?id=123` 打开
- 详情页通过 URL 恢复主键
- 从列表跳转后按查询参数拉详情

### 示例 2：在列表页读取多个查询参数

```tsx
import useQueryParams from '@/hooks/useQueryParams'

const ListPage = () => {
  const query = useQueryParams()

  useEffect(() => {
    loadList({
      tenantId: query.tenantId,
      statementId: query.statementId,
      tab: query.tab,
    })
  }, [query.tenantId, query.statementId, query.tab])

  return <div />
}
```

## 适合使用的场景

- 列表页筛选条件需要从 URL 恢复
- 分页、Tab、详情页定位参数需要和地址栏同步
- 页面刷新后，希望通过 URL 恢复当前视图状态

## 不适合使用的场景

- 只在当前组件局部有效、没有必要暴露到 URL 的临时状态
- 数据量较大或结构复杂，不适合直接序列化到查询参数的状态
- 对隐私或安全敏感、不应暴露在地址栏中的数据

## 适用边界

`useQueryParams` 当前是一个轻量读取 Hook，不负责：

- 参数类型转换
- 参数默认值兜底
- URL 参数回写
- 参数合法性校验

如果页面依赖数字、布尔值或数组，建议在页面层自己补一层解析。