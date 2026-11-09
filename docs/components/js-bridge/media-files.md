# 图片与文件

图片和文件能力包括保存图片、选择并上传，以及在 App 内原生预览 PDF。选择上传由 Native 负责打开系统界面、读取内容并上传到宿主配置的服务；PDF 预览由 Native 下载到应用私有缓存后打开，不向 H5 暴露本地文件路径。

| API | 功能行为 | 返回形式 | 状态 |
| --- | --- | --- | --- |
| `native.media.saveImageToAlbum()` | 将 Base64 图片保存到系统相册 | `Promise<void>` | 已实现（双端，待真机回归） |
| `native.media.chooseAndUploadImages()` | 从相册或相机选择图片并上传 | `Promise<{images:Array}>` | 已实现（双端，待真机回归） |
| `native.file.chooseAndUploadFiles()` | 从系统文件选择器选取文件并上传 | `Promise<{files:Array}>` | 已实现（双端） |
| `native.file.uploadBase64File()` | 上传 Base64 内容，适合手写签名等无本地路径的场景 | `Promise<UploadedFile>` | 已实现（双端，待真机回归） |
| `native.file.previewPdf()` | 在 App 内打开原生 PDF 分页预览 | `Promise<{cacheHit,fileSize}>` | 已实现（双端，待真机回归） |
| `native.file.clearPdfCache()` | 清空全部 PDF 缓存 | `Promise<{deletedFiles,freedBytes}>` | 已实现（双端） |

宿主上传适配器负责注入认证信息，业务页面不应自行拼接宿主认证字段。

## `native.media.saveImageToAlbum()`

**功能行为：** 将 H5 提供的 Base64 图片解码为 PNG 文件并写入设备系统相册。系统可能请求相册或媒体写入权限；它适合保存二维码、回执等已在页面中生成的图片。

```ts
saveImageToAlbum(options: {
  image: string;
  name: string;
}): Promise<void>
```

```js
await native.media.saveImageToAlbum({
  image: 'data:image/png;base64,...',
  name: 'receipt.png',
});
```

`image` 接受纯 Base64 或 data URL，`name` 必须是非空字符串。Promise resolve 表示 Native 已确认写入成功；权限拒绝时抛出 `PERMISSION_DENIED`。

## `native.media.chooseAndUploadImages()`

**功能行为：** 打开系统相册或相机，让用户选择图片，随后由 Native 直接上传，并一次性返回已上传图片的信息。该 API 不暴露中间本地路径，也不需要业务页面再次调用上传方法。

```ts
chooseAndUploadImages(options?: {
  source?: 'album' | 'camera';
}): Promise<{ images: UploadedFile[] }>
```

`source` 默认是 `'album'`；需要直接拍照时显式传入 `'camera'`。

```js
const { images } = await native.media.chooseAndUploadImages();
const cameraResult = await native.media.chooseAndUploadImages({ source: 'camera' });
```

Promise resolve 表示所选图片已经上传并得到标准化结果。用户未选择就退出时抛出 `USER_CANCELLED`，图片或相机权限被拒绝时抛出 `PERMISSION_DENIED`。

## `native.file.chooseAndUploadFiles()`

**功能行为：** 打开系统文件选择器，让用户选取文件，随后由 Native 读取并上传，最后返回已上传文件的信息。该能力适合附件、凭证等通用文件，不需要业务页面申请广泛的存储权限。

```ts
chooseAndUploadFiles(): Promise<{ files: UploadedFile[] }>
```

```js
try {
  const { files } = await native.file.chooseAndUploadFiles();
  console.log(files);
} catch (error) {
  if (error.code === 'USER_CANCELLED') return;
  throw error;
}
```

Promise resolve 表示文件已经上传并得到标准化结果。用户未选择就退出时抛出 `USER_CANCELLED`，读取或上传失败时 Promise 会 reject 对应错误。

## `native.file.uploadBase64File()`

**功能行为：** 上传 H5 已经生成的 Base64 内容，典型场景是 `canvas` 导出的手写签名、图表截图等没有本地文件路径的图片。Native 负责解码、写入临时文件、申请预签名地址并完成上传，因此不受 WebView 以 `file://` 加载时的跨域限制；业务页面不需要自行请求上传地址，也不需要执行 PUT。整个过程没有系统界面和用户交互。

```ts
uploadBase64File(options: {
  data: string;
  fileName: string;
  mimeType?: string;
  bucketType?: number;
}): Promise<UploadedFile>;
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `data` | `string` | 是 | 纯 Base64 或 data URL（`data:image/png;base64,...`），兼容 URL-safe 编码 |
| `fileName` | `string` | 是 | 带后缀的文件名，如 `signature_1720000000.png`；Native 会去掉路径和非法字符 |
| `mimeType` | `string` | 否 | `fileName` 不含后缀时用于补全，如 `image/png` |
| `bucketType` | `number` | 否 | `1` 私有桶、`2` 公有桶，默认 `2` |

```js
import { native } from '@/utils/js-bridge';

// canvasBase64 可以是 'data:image/png;base64,...'，也可以是纯 Base64
const file = await native.file.uploadBase64File({
  data: canvasBase64,
  fileName: `signature_${Date.now()}.png`,
  mimeType: 'image/png',
});

params.signature = file.objectName; // 提交表单时保存稳定的服务端标识
```

`bucketType` 默认使用公有桶（`2`），返回的 `tempURL` 可以直接预览；如果所选存储桶策略要求私有桶，显式传入 `1`，后续预览需要先向后端换取临时地址。

Promise resolve 表示文件已经上传成功，返回值是单个 `UploadedFile`，不会像图片、文件选择上传那样再包一层 `images` 或 `files`。`data` 为空或不是合法 Base64 时抛出 `INVALID_ARGUMENT`；解码后超过 5 MB 时抛出 `FILE_TOO_LARGE`；预签名或 PUT 失败时抛出 `NATIVE_ERROR`。

该 API 没有用户交互，不受 `BUSY` 限制，可以并发调用；手写签名等小文件不需要展示上传进度。

## `native.file.previewPdf()`

**功能行为：** 下载一个可访问的 PDF 地址，并在 App 内打开原生只读预览页。预览页支持左右分页、当前页码、双指缩放、放大后拖动和双击切换缩放倍率。它适合合同、回执、单据和附件等只读预览场景。

Android 宿主使用系统 `PdfRenderer` 渲染；iOS 使用系统内置的 `PDFKit`（`PDFView`），支持双指缩放、放大后拖动、横向翻页、页码和双击缩放。两端都不引入第三方 PDF 引擎。文件只写入应用私有缓存，不申请外部存储权限，也不会把本地文件路径返回给 H5。

```ts
previewPdf(options: {
  url: string;
  title?: string;
  fileName?: string;
}): Promise<{
  cacheHit: boolean;
  fileSize: number;
}>
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 是 | 当前可访问的 `http` 或 `https` PDF 地址；临时 URL 必须仍在有效期内 |
| `title` | `string` | 否 | 原生预览页标题；未传时显示“PDF 预览” |
| `fileName` | `string` | 否 | 文件展示名称，也可在未传 `title` 时作为标题 |

最常见的用法是预览上传结果中的临时地址：

```js
import { native } from '@/utils/js-bridge';

const { files } = await native.file.chooseAndUploadFiles({
  accept: ['pdf'],
});

const pdf = files[0];
const result = await native.file.previewPdf({
  url: pdf.tempURL,
  title: '运输合同',
  fileName: 'contract.pdf',
});
console.log(result.cacheHit, result.fileSize);
```

也可以直接预览后端返回的地址：

```js
try {
  await native.file.previewPdf({
    url: detail.pdfUrl,
    title: detail.pdfName || '附件预览',
  });
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    // 引导用户下载或在其他应用中打开。
    return;
  }
  if (error.code === 'INVALID_PDF') {
    // 地址返回的内容不是 PDF，或文件损坏、加密而无法打开。
    return;
  }
  throw error;
}
```

### 成功语义

Promise resolve 表示 Native 已命中缓存或完成下载和基础格式校验，并已打开原生预览页。返回值中的 `cacheHit` 表示本次是否跳过下载，`fileSize` 是 PDF 字节数。它不等待用户关闭预览页，也不表示所有页面已经提前渲染完成。

### 限制与缓存

- 单个 PDF 最大 100 MB。
- Native 内部将完整 URL 作为缓存键；相同 URL 在有效期内直接复用，开发者无需传入或管理缓存标识。
- 缓存从首次下载起最多保留 24 小时；命中时更新最近访问时间，用于 LRU 淘汰。
- App 启动以及后续下载时会清理缓存，最多保留 10 个文件、合计最多 300 MB。
- PDF 解析失败时立即删除对应缓存，避免重复命中坏文件。
- API 35 以下暂不支持带密码或受保护的 PDF。
- 同一时间已有 PDF 正在下载时，新的调用会抛出 `BUSY`。

下载、校验或系统渲染失败时，原生页面会显示具体原因。原始 URL 仍可访问时，页面提供“使用浏览器打开”作为降级入口。外部浏览器通常不共享 App 登录态，因此该入口更适合预签名或公开 URL。

## `native.file.clearPdfCache()`

**功能行为：** 删除 App 私有目录中的全部 PDF 缓存。它适合设置页中的缓存管理，也可在调试时验证首次下载、缓存命中和清空后的重新下载。

```ts
clearPdfCache(): Promise<{
  deletedFiles: number;
  freedBytes: number;
}>
```

```js
const result = await native.file.clearPdfCache();
console.log(`已删除 ${result.deletedFiles} 个文件，释放 ${result.freedBytes} 字节`);
```

清理成功后，即使没有缓存，也会 resolve 并返回 `0`。如果 PDF 正在下载，调用会 reject `BUSY`，避免清理任务与文件写入发生竞争。
### 在原生能力调试页验证

1. 点击“清空 PDF 缓存”，确认返回的 `deletedFiles` 和 `freedBytes`。
2. 第一次点击“预览 PDF”，返回的 `cacheHit` 应为 `false`。
3. 返回调试页，再次用相同 URL 预览，`cacheHit` 应为 `true`，且不会再次下载。
4. 再次清空缓存后预览，`cacheHit` 应恢复为 `false`。

| 错误码 | 触发条件 |
| --- | --- |
| `INVALID_ARGUMENT` | `url` 缺失、格式错误或协议不受支持 |
| `BUSY` | 已有 PDF 下载任务正在执行 |
| `NETWORK_ERROR` | 下载超时、网络失败或服务器返回非成功状态 |
| `FILE_TOO_LARGE` | 文件超过 100 MB |
| `INVALID_PDF` | 内容不是 PDF，或文件损坏、加密而无法打开 |
| `NATIVE_ERROR` | 无法进一步分类的原生打开或渲染错误 |

## 上传结果

图片结果位于 `images`，文件结果位于 `files`；`native.file.uploadBase64File()` 直接返回单个上传项。每个上传项至少包含以下公共字段：

```ts
interface UploadedFile {
  objectName: string; // 服务端存储标识
  tempURL: string;    // 临时预览地址，可能具有有效期
  [key: string]: unknown;
}
```

业务持久化时应保存服务端要求的稳定标识；不要假设 `tempURL` 永久有效。
