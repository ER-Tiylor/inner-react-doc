# storage

路径：`src/utils/storage.ts`

## 定位

`storage` 用于统一访问 `localStorage` 与 `sessionStorage`，为多子应用提供更稳定的本地缓存读写入口。

## 真实导出

```ts
export const LStorage
export const SStorage
```

两者都支持：

- `setItem(key, value, expire)`
- `getItem(key, defaultValue)`
- `remove(key)`
- `clear()`

其中 `expire` 的单位是秒。

## 如何使用

### 示例 1：保存主题状态

这和 BMS 当前 `NavHeader` 中的实际用法一致。

```tsx
import { LStorage } from '@/utils/storage'

const handleThemeChange = (isDark: boolean) => {
  LStorage.setItem('isDark', isDark, null)
}

const initTheme = () => {
  const isDark = LStorage.getItem('isDark', false)
  applyTheme(isDark)
}
```

### 示例 2：保存带过期时间的数据

```ts
import { LStorage } from '@/utils/storage'

LStorage.setItem('token', 'mock-token', 60 * 60)

const token = LStorage.getItem('token', '')
```

上面这个例子里，`token` 会在 1 小时后失效；失效后再次读取会返回默认值，并自动删除旧缓存。

### 示例 3：退出登录时清理数据

```ts
import { LStorage } from '@/utils/storage'

const handleLogout = () => {
  LStorage.remove('token')
  LStorage.remove('user')
}
```

## 适合使用的场景

- 保存用户偏好配置，例如主题、表格列配置
- 保存轻量级登录态辅助信息
- 保存会话级临时状态

## 不适合使用的场景

- 敏感信息明文持久化
- 需要服务端可信的数据来源
- 频繁变化且体积较大的复杂对象

## 适用边界

`storage` 适合作为底层读写入口，但不等于完整缓存方案。它不负责：

- 数据加密
- 多标签页状态同步策略
- 缓存版本升级迁移
- 复杂业务对象生命周期管理

如果某类数据需要更强约束，建议在 `storage` 之上再包一层领域化封装。