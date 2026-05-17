---
title: UploadDrawer
---

# UploadDrawer

## 介绍

`UploadDrawer` 是一个抽屉式附件上传组件，支持文件回显、私有/公共文件上传、图片与 PDF 预览、下载，以及确认后统一返回文件地址数组。

## 何时使用

适用于业务详情页、审批页、附件管理场景中，以抽屉方式维护附件列表的需求。

## API

### Props

| 属性名        | 说明                                              | 类型                                       | 默认值   |
| ------------- | ------------------------------------------------- | ------------------------------------------ | -------- |
| `drawerType`  | 抽屉模式，影响是否可上传/删除以及是否显示底部按钮 | `string`                                   | 无       |
| `title`       | 抽屉标题                                          | `string`                                   | `'附件'` |
| `files`       | 回显用的文件 URL 数组                             | `string[]`                                 | 无       |
| `visible`     | 控制抽屉显示状态                                  | `boolean`                                  | 无       |
| `onClose`     | 关闭抽屉回调                                      | `() => void`                               | 无       |
| `onConfirm`   | 点击确认后的回调                                  | `(data: IFiles) => void`                   | 无       |
| `uploadProps` | 透传给内部 `Upload` 的配置                        | `UploadProps`                              | 无       |
| `isPublic`    | 是否上传到公共文件桶                              | `boolean`                                  | 无       |
| `fileProps`   | 文件类型和大小限制配置                            | `{ fileType?: string; fileSize?: number }` | 无       |

### Callback Props

| 属性名      | 说明                                             | 回调参数 |
| ----------- | ------------------------------------------------ | -------- |
| `onClose`   | 关闭抽屉时触发                                   | 无       |
| `onConfirm` | 点击确认按钮时触发，返回上传后的真实文件地址数组 | `(data)` |

### Children

无

### Ref

无

## 数据结构

```ts
type IFiles = { fileName: string; fileUrl: string }[];
```

当前源码中 `onConfirm` 实际上传回的是：

```ts
string[]
```

也就是：

```ts
fileList.filter((item) => item.realUrl).map((item) => item.realUrl);
```

因此从实现上看，更接近“文件真实地址数组”而不是严格的 `IFiles` 结构。

上传相关接口复用自 `FormUpload`：

```ts
getUploadUrl(params);
getTempUrl({ fileUrlList });
```

## 代码演示

```ts
import { useState } from 'react';
import UploadDrawer from '@/components/UploadDrawer';

export default function Demo() {
  const [visible, setVisible] = useState(false);

  return (
    <UploadDrawer
      drawerType="edit"
      visible={visible}
      files={[]}
      onClose={() => setVisible(false)}
      onConfirm={(data) => {
        console.log(data);
      }}
      fileProps={{
        fileType: 'pdf,jpg,jpeg,png',
        fileSize: 5,
      }}
    />
  );
}
```

查看模式：

```ts
<UploadDrawer
  drawerType="view"
  visible={visible}
  files={['https://example.com/a.pdf']]}
  onClose={() => setVisible(false)}
/>
```

## Design Token

无

## Accessibility

组件基于 `Drawer`、`Upload` 和预览弹窗实现，基础键盘交互与焦点能力依赖底层组件；当前源码未看到额外无障碍增强属性。

## FAQ

`drawerType="view"` 时有什么区别？

查看模式下不会展示上传入口、不会显示删除图标，也不会渲染底部“确定/取消”操作区，只保留附件查看和下载能力。
