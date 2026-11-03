# 定位、地图与扫码

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.location.getCurrentPosition()` | 获取一次设备当前位置 | `Promise<{latitude,longitude}>` | 已实现 |
| `native.map.openNavigation()` | 用外部地图应用导航到目的地 | `Promise<void>` | 已实现 |
| `native.scanner.scanCode()` | 打开原生扫码页并读取一个二维码 | `Promise<{code}>` | 已实现 |

## `native.location.getCurrentPosition()`

**功能行为：** 获取设备当前的一次性定位，可能触发系统定位授权。成功后返回当前经纬度；调用结束后不会持续追踪位置，持续轨迹场景应使用专门的定位能力。

```ts
getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
}>
```

```js
const { latitude, longitude } = await native.location.getCurrentPosition();
```

定位权限被拒绝时抛出 `PERMISSION_DENIED`，定位服务或定位 SDK 失败时抛出 `NATIVE_ERROR`。

## `native.map.openNavigation()`

**功能行为：** 将目的地坐标交给设备上的地图应用并拉起导航。Android 和 iOS 都提供**高德地图 / 百度地图**两个选项，以驾车模式打开；未安装对应地图时提示并引导下载。用户会进入外部地图界面；该 API 不在 H5 内绘制地图，也不持续返回导航进度。

```ts
openNavigation(options: {
  latitude: number;
  longitude: number;
  destinationName?: string;
}): Promise<void>
```

```js
await native.map.openNavigation({
  latitude: 39.9,
  longitude: 116.4,
  destinationName: '目的地',
});
```

经纬度必须能转换为有效数字。Promise resolve 表示参数已交给地图应用，不表示路线规划成功、用户开始导航或已经到达。

## `native.scanner.scanCode()`

**功能行为：** 打开原生二维码扫描页面，读取到一个有效二维码后关闭扫描页并返回文本内容。当前能力是单次二维码扫描，不用于连续扫码或文档扫描。

```ts
scanCode(): Promise<{ code: string }>
```

```js
try {
  const { code } = await native.scanner.scanCode();
  console.log(code);
} catch (error) {
  if (error.code === 'USER_CANCELLED') return;
  throw error;
}
```

用户主动退出扫描页时抛出 `USER_CANCELLED`；相机权限被拒绝时抛出 `PERMISSION_DENIED`。
