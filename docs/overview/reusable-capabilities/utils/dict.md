# dict

路径：`src/utils/dict.ts`

## 定位

`dict` 负责把字典原始数据转换为页面和组件更容易消费的结构，是字典数据与 UI 组件之间的整形层。

## 真实导出

```ts
export const getDictDataToDropdown
export const getDictDataToSearch
```

## 如何使用

### 示例 1：转成下拉选项

```ts
import { getDictDataToDropdown } from '@/utils/dict'

const dictData = [
  {
    code: 'shuilv',
    children: [
      { code: '6', name: '6%' },
      { code: '9', name: '9%' },
    ],
  },
]

const dropdownMap = getDictDataToDropdown(dictData)

console.log(dropdownMap.shuilv)
// [
//   { value: '6', label: '6%' },
//   { value: '9', label: '9%' }
// ]
```

适合给 `Select`、树形下拉或级联选项直接消费。

### 示例 2：转成搜索枚举映射

```ts
import { getDictDataToSearch } from '@/utils/dict'

const searchMap = getDictDataToSearch(dictData)

console.log(searchMap.shuilv)
// {
//   '6': '6%',
//   '9': '9%'
// }
```

适合列表搜索区、表格枚举展示、状态码转中文文案这类场景。

## 建议搭配方式

推荐和 `useDataDict` 组合使用：

```ts
const { dictData } = useDataDict(['shuilv'], tenantId)
const [shuilv] = dictData
const dropdownMap = getDictDataToDropdown([
  { code: 'shuilv', children: shuilv },
])
```

## 适用边界

`dict` 负责数据整形，不负责：

- 字典数据的拉取
- 字典缓存刷新策略
- 页面是否展示某项的业务判断
- 多租户或多组织下的字典权限控制