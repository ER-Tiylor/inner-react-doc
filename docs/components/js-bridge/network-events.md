# 网络与事件

## `native.http.request()`

**功能行为：** 通过 App 宿主的原生网络层发起一次 HTTP 请求，并返回宿主解析后的响应数据。它适合必须复用宿主认证、原生网络 SDK 或系统代理配置的接口；普通 H5 接口仍应优先使用应用已有的网络层。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.http.request()` | 由原生网络层发起 GET 或 POST 请求 | `Promise<HTTP 响应数据>` | 已验证 |

```ts
request(options: {
  url: string;
  method?: 'GET' | 'POST';
  data?: unknown;
  contentType?: string;
}): Promise<unknown>
```

```js
const result = await native.http.request({
  url: '/example/path',
  method: 'POST',
  data: { id: '1' },
});
```

`url` 必须是非空字符串。当前只支持 GET 和 POST；其他方法抛出 `UNSUPPORTED`，不会静默退化成 GET。认证信息由宿主网络适配器按配置注入。Promise resolve 表示请求成功并得到响应数据，网络代理失败时抛出 `NETWORK_ERROR`。

Android 与 iOS 走同一个 `sendRequest` 协议：`httpMethod` 区分 GET/POST，成功条件为原生返回有效状态且 HTTP 状态码为 `200`，响应体按 JSON 解析。

## Events

Events 用于接收 Native 在未来某个时间主动推送的数据，例如宿主状态变化或跨页面通知。一次订阅的回调可以执行多次，页面销毁时必须释放订阅。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.events.addListener()` | 注册一个持续事件监听器 | `Promise<Subscription>` | 基础设施 |
| `native.events.removeListener()` | 按事件名移除监听器 | `Promise<void>` | 基础设施 |

公共包当前只提供统一注册和释放机制，不预置具体业务事件。宿主新增事件前必须定义事件名称、数据结构、触发时机与生命周期。

### `native.events.addListener()`

**功能行为：** 为指定事件名注册回调。Native 每次触发该事件时都会把 payload 传给回调；Promise resolve 后返回的订阅对象代表本次注册。

```js
const subscription = await native.events.addListener('refreshPage', payload => {
  console.log(payload);
});
```

事件名不能是空字符串，listener 必须是函数。

### `native.events.removeListener()`

**功能行为：** 按事件名移除宿主中的持续监听，阻止该事件继续调用页面回调。页面或组件卸载时必须释放不再使用的监听，否则可能产生重复响应并让相关对象无法回收。

通常应优先调用订阅对象的 `remove()`，这样可以让注册与释放保持同一所有者。重复调用 `remove()` 是安全的。

```js
await subscription.remove();
```

也可以直接按事件名释放：

```js
await native.events.removeListener('refreshPage');
```

Promise resolve 表示移除指令已经完成。
