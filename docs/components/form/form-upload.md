---
title: FormUpload
---

# FormUpload

## 介绍

`FormUpload` 是一个表单上传组件，支持文件类型和大小校验、私有/公共文件上传、模板下载、图片与 PDF 预览，以及上传完成后将文件地址数组回填到表单。

## 何时使用

适用于业务表单中的附件上传场景，尤其是需要上传到对象存储、回显已上传文件、下载模板或在查看模式下展示附件列表的场景。

## API

### Props

| 属性名         | 说明                                     | 类型                                       | 默认值 |
| -------------- | ---------------------------------------- | ------------------------------------------ | ------ |
| `tips`         | 上传提示信息                             | `ReactElement \| string`                   | 无     |
| `uploadProps`  | 透传给内部 `Upload` 的配置               | `UploadProps`                              | 无     |
| `viewMode`     | 是否为查看模式；查看模式下不展示上传按钮 | `boolean`                                  | 无     |
| `onChange`     | 上传结果变化回调，返回文件真实地址数组   | `(value: any) => void`                     | 无     |
| `value`        | 当前文件地址数组                         | `any`                                      | 无     |
| `isPublic`     | 是否上传到公共文件桶                     | `boolean`                                  | 无     |
| `template`     | 模板下载地址                             | `string`                                   | 无     |
| `templateName` | 模板下载文件名                           | `string`                                   | 无     |
| `fileProps`    | 文件类型与大小限制配置                   | `{ fileType?: string; fileSize?: number }` | 无     |

### Callback Props

| 属性名     | 说明                         | 回调参数   |
| ---------- | ---------------------------- | ---------- |
| `onChange` | 所有文件上传完成或清空时触发 | `string[]` |

### Children

无

### Ref

无

## 数据结构

```ts
type IProps = {
  tips?: ReactElement | string;
  uploadProps?: UploadProps;
  viewMode?: boolean;
  onChange?: (value: any) => void;
  value?: any;
  isPublic?: boolean;
  template?: string;
  templateName?: string;
  fileProps?: {
    fileType?: string;
    fileSize?: number;
  };
};
```

上传相关接口：

```ts
getUploadUrl(params) => POST /bsc/storage/common/getTempUploadUrl
getTempUrl({ fileUrlList }) => POST /bsc/storage/common/getTempUrl
```

`onChange` 回填的是文件真实地址数组，不是上传控件内部的 `fileList`。

## 代码演示

```ts
import { useState } from 'react';
import FormUpload from '@/components/FormUpload';

export default function Demo() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <FormUpload
      value={value}
      onChange={setValue}
      tips="支持 pdf、jpg、png，单个文件不超过 5MB"
      fileProps={{
        fileType: 'pdf,jpg,jpeg,png',
        fileSize: 5,
      }}
      template="/template/import-demo.xlsx"
      templateName="import-demo.xlsx"
    />
  );
}
```

## Design Token

无

## Accessibility

组件基于 `Upload`、`Button`、图片预览和 PDF 预览弹窗实现，基础交互能力依赖底层组件；当前源码未看到额外无障碍增强配置。

## FAQ

为什么 `value` 传入的是 URL 数组，而不是 `fileList`？

组件内部会根据 `value` 转换出上传控件需要的 `fileList`，但对外保持真实文件地址数组，便于表单存储和接口提交。
