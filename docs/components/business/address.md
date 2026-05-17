---
title: Address
---

# Address

## 介绍

`Address` 是一个基于级联选择器的地址选择组件，用于按行政区划逐级选择地址数据，并在选择或回填时按需加载下级节点。

## 何时使用

适用于表单中选择省、市、区县等层级地址信息的场景。

## API

### Props

| 属性名       | 说明                                                        | 类型                                    | 默认值 |
| ------------ | ----------------------------------------------------------- | --------------------------------------- | ------ |
| `onChange`   | 地址变更时触发，返回拼接后的 `gisId` 字符串和地址名称字符串 | `(value: string, name: string) => void` | 无     |
| `value`      | 当前选中值，外层组件传入时通常为逗号分隔后的数组            | `any`                                   | 无     |
| `viewMode`   | 是否为只读模式                                              | `boolean`                               | 无     |
| `otherProps` | 透传给内部 `Cascader` 的配置项                              | `CascaderProps`                         | `{}`   |

### Callback Props

| 属性名     | 说明             | 回调参数                        |
| ---------- | ---------------- | ------------------------------- |
| `onChange` | 选择项变化时触发 | `(value: string, name: string)` |

### Children

无

### Ref

无

## 数据结构

```ts
interface IAddressOption {
  gisId?: number;
  name: string;
  children?: IAddressOption[];
  isLeaf?: boolean;
}

type IAddressValue = [string | number, string | number];
```

外层包装组件 `src/components/Address/index.tsx` 接收的 `value` 一般为逗号分隔字符串，例如：

```ts
'110000,110100,110101';
```

内部会拆分后传给 `Address` 组件。

## 代码演示

```ts
import Address from '@/components/Address';

export default function Demo() {
  return (
    <Address
      value={['110000', '110100', '110101']}
      onChange={(value, name) => {
        console.log(value, name);
      }}
      otherProps={{
        allowClear: true,
      }}
    />
  );
}
```

## Design Token

无

## Accessibility

组件基于 `Cascader` 实现，键盘交互和基础可访问性能力依赖底层组件；当前源码中未额外补充无障碍说明或属性。

## FAQ

`value` 为什么不是数组而是字符串？

该目录下的外层封装组件会把外部传入的逗号分隔字符串拆分成数组，再传给内部级联选择组件使用。
