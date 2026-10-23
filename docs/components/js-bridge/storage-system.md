# 存储与系统

## Storage

Storage 把少量数据持久化到 App 宿主中，数据不会随着当前 WebView 关闭而自动消失。字符串和 JSON 对象使用不同的方法，避免业务代码自行猜测序列化格式。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.storage.set()` | 写入或覆盖一个字符串值 | `Promise<void>` | 已实现 |
| `native.storage.get()` | 读取一个字符串值 | `Promise<{key,value}>` | 已实现 |
| `native.storage.mergeObject()` | 合并并保存对象的第一层字段 | `Promise<void>` | 已实现 |
| `native.storage.getObject()` | 读取并解析一个对象 | `Promise<object>` | 已实现 |
| `native.storage.removeObjectFields()` | 删除已保存对象的指定字段 | `Promise<void>` | 已实现 |

### `native.storage.set()`

**功能行为：** 以 `key` 为标识保存一个字符串值；相同 `key` 再次写入时会覆盖原值。适合保存跨页面仍需读取的轻量字符串数据。

```js
await native.storage.set({ key: 'companyId', value: 'company-001' });
```

`key` 必须是非空字符串，`value` 只能是字符串、`null` 或 `undefined`。

### `native.storage.get()`

**功能行为：** 读取 `key` 对应的字符串值，并连同原始 `key` 一起返回。业务代码应处理未保存或空值的情况。

```js
const { value } = await native.storage.get({ key: 'companyId' });
```

### `native.storage.mergeObject()`

**功能行为：** 将传入对象的第一层字段合并到已保存的 JSON 对象中。已有但本次未传入的第一层字段会保留；同名字段会被覆盖。该方法不会递归深合并嵌套对象。

```js
await native.storage.mergeObject({
  key: 'draft',
  value: { step: 2, plateNumber: '示例车牌' },
});
```

### `native.storage.getObject()`

**功能行为：** 读取并解析 `key` 对应的 JSON 对象，省去业务代码手动执行 `JSON.parse`。没有有效对象数据时返回空对象。

```js
const draft = await native.storage.getObject({ key: 'draft' });
```

### `native.storage.removeObjectFields()`

**功能行为：** 从已保存的 JSON 对象中删除指定的第一层字段，其余字段保持不变。传入空数组会清空整个对象内容。

```js
await native.storage.removeObjectFields({
  key: 'draft',
  keys: ['plateNumber'],
});
```

## System

System API 用于读取操作系统级状态或跳转到系统设置，不负责替用户修改系统配置。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.system.getNotificationSettings()` | 查询当前 App 的通知是否开启 | `Promise<{enabled:boolean}>` | 已实现 |
| `native.system.openAppSettings()` | 打开当前 App 的系统设置页 | `Promise<void>` | 已实现 |

### `native.system.getNotificationSettings()`

**功能行为：** 查询操作系统中当前 App 的通知开关状态。它只读取状态，不会申请通知权限，也不会自动打开设置页。

```js
const { enabled } = await native.system.getNotificationSettings();
```

返回的 `enabled` 为 `true` 时表示当前可发送系统通知，为 `false` 时表示通知被关闭或不可用。

### `native.system.openAppSettings()`

**功能行为：** 打开操作系统中当前 App 的详情设置页，供用户手动调整通知、权限等配置。

```js
await native.system.openAppSettings();
```

Promise resolve 只表示设置页打开指令已派发，不表示用户修改了设置。用户返回 App 后，应再次查询所需状态。
