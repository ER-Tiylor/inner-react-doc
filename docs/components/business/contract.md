---
title: Contract
---

# Contract

## 介绍

`Contract` 是一个合同选择组件，提供输入框加弹窗的交互方式，支持查询合同列表、查看合同子记录并完成单项选择。

## 何时使用

适用于表单中关联选择合同信息，并需要从远程列表中筛选、查看后回填合同数据的场景。

## API

### Props

| 属性名     | 说明                                     | 类型                  | 默认值 |
| ---------- | ---------------------------------------- | --------------------- | ------ |
| `value`    | 当前合同值，通常包含合同编号及子记录信息 | `any`                 | 无     |
| `onChange` | 选中合同后回填数据的方法                 | `(data: any) => void` | 无     |
| `viewMode` | 是否只读；只读时不展示“选择合同”按钮     | `boolean`             | 无     |

### Callback Props

| 属性名     | 说明                 | 回调参数      |
| ---------- | -------------------- | ------------- |
| `onChange` | 选择合同并确认后触发 | `(data: any)` |

### Children

无

### Ref

无

## 数据结构

当前源码未单独定义类型，按实际使用可整理为如下结构：

```ts
type ContractValue = {
  id?: string | number;
  contcode?: string;
  basename?: string;
  oursubject?: string;
  partysubject?: string;
  sealplanreftab?: ContractSealPlan[];
  [key: string]: any;
};

type ContractSealPlan = {
  signCode?: React.Key;
  oursign?: string;
  othersign?: string;
  signdate?: string;
  effectdate?: string;
  enddate?: string;
  remark?: string;
  contrealamount?: string | number;
  contrealamounttype?: string;
  exchangerate?: string | number;
  [key: string]: any;
};
```

最终回填时，组件会将主合同数据与所选子记录合并后返回。

## 代码演示

```ts
import { useState } from 'react';
import Contract from '@/components/Contract';

export default function Demo() {
  const [value, setValue] = useState();

  return (
    <Contract
      value={value}
      onChange={(data) => {
        setValue(data);
        console.log(data);
      }}
    />
  );
}
```

## Design Token

无

## Accessibility

组件交互主要依赖 `Input`、`Button`、`Modal` 与表格组件；当前源码未看到额外的无障碍增强配置。

## FAQ

为什么会弹出两层弹窗？

第一层用于检索和选择主合同，第二层用于从该合同的 `sealplanreftab` 中继续选择具体子记录，最终合并后回填。
