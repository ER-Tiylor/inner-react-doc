---
title: FormDigitRange
---

# FormDigitRange

## 介绍

`FormDigitRange` 是一个数值范围输入组件，由两个 `InputNumber` 组成，支持最小值、最大值联动校正和表单受控用法。

## 何时使用

适用于表单中录入数值区间，例如重量范围、金额范围、数量范围等场景。

## API

### Props

| 属性名         | 说明                                             | 类型                                       | 默认值                 |
| -------------- | ------------------------------------------------ | ------------------------------------------ | ---------------------- |
| `value`        | 当前范围值                                       | `(number \| undefined)[]`                  | `[]`                   |
| `onChange`     | 范围值变化回调                                   | `(value: (number \| undefined)[]) => void` | 无                     |
| `separator`    | 中间分隔符                                       | `string`                                   | `'~'`                  |
| `separatorGap` | 分隔符与输入框之间的间距                         | `number`                                   | `10`                   |
| `placeholder`  | 左右输入框占位文案                               | `[string, string]`                         | `['最小值', '最大值']` |
| `suffix`       | 范围后缀文本                                     | `string`                                   | 无                     |
| `fieldProps`   | 透传给内部 `InputNumber` 的配置，如 `min`、`max` | `any`                                      | 无                     |

### Callback Props

| 属性名     | 说明                                     | 回调参数                           |
| ---------- | ---------------------------------------- | ---------------------------------- |
| `onChange` | 任一输入框失焦后触发，返回校正后的范围值 | `(value: (number \| undefined)[])` |

### Children

无

### Ref

无

## 数据结构

```ts
type ValuePair = (number | undefined)[];

type FormDigitRangeProps = {
  value?: ValuePair;
  onChange?: (value: ValuePair) => void;
  separator?: string;
  separatorGap?: number;
  placeholder?: [string, string];
  suffix?: string;
  fieldProps?: any;
};
```

组件会在失焦时做如下处理：

```ts
1. 将输入值转成整数
2. 按 `fieldProps.min` / `fieldProps.max` 截断
3. 若最小值大于最大值，自动交换位置
```

## 代码演示

```ts
import { useState } from 'react';
import FormDigitRange from '@/components/FormDigitRange';

export default function Demo() {
  const [value, setValue] = useState<[number | undefined, number | undefined]>([
    10, 100,
  ]);

  return (
    <FormDigitRange
      value={value}
      onChange={setValue}
      suffix="kg"
      fieldProps={{ min: 0, max: 9999 }}
    />
  );
}
```

## Design Token

无

## Accessibility

组件基于两个 `InputNumber` 组合实现，基础键盘输入和焦点能力依赖底层组件；当前源码未增加额外无障碍属性。

## FAQ

如果最小值输入得比最大值大，会怎样？

组件会在失焦时自动交换两个值，保证返回结果始终符合最小值在前、最大值在后的顺序。
