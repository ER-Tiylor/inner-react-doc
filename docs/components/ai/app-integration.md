# 子应用接入

本章只做一次性的应用级接入。前提是子应用已经能在 PASS 中正常打开；AI 接入不替代 qiankun 应用注册。

![应用级接入步骤与各方职责](/ai/integration-steps.svg)

<a href="/ai/integration-steps.svg" target="_blank" rel="noreferrer">打开大图</a>

## 1. 检查基础条件

| 检查项 | 要求 |
| --- | --- |
| 应用注册 | PASS `src/config/qiankun.ts` 有正确的应用名和入口 |
| 宿主注入 | `src/microapps/specs.ts` 为业务应用提供 `props.assistant` |
| 页面路由 | 应用内路由与宿主 `/<appId><页面路由>` 一致，按现有平台 hash 路由接法核对 |
| 表单组件 | 明确 `formItem` 是扁平字段数组、分组数组，还是两者都有 |
| 请求封装 | 能复用本应用的请求、登录态及租户信息 |
| 页面缓存 | 核对 `react-activation` 与页面激活/失活行为 |

先选一个简单新增页试接，不要从复杂联合条件或多级联动页面开始。

## 2. 引入业务适配模块

在应用中建立 `src/assistantBinding/`：

| 文件 | 处理方式 |
| --- | --- |
| `index.tsx` | 使用维护者确认的当前共享版本，提供 hook、按钮和连接方法 |
| `describeFields.ts` | 使用同批共享版本，提供字段描述与所需协议类型 |
| `adapter.ts` | 按本应用调整类型路径、表单结构和自定义控件识别 |

参考 BMS、OMS、TMS 的现有模块，但不要默认不同仓库工作区版本已经同步。共享文件的修改要统一评审和同步；页面特殊需求优先放到页面 `fields`。

适配时重点核对：

- `IFormRef` 和表单项类型的真实导出路径。
- `flattenFormItems` 是否能正确展开本应用实际传入的表单项。
- `@/antd`、`SearchInput` 和 `request` 的接口是否匹配。
- 自定义控件不能推导时，优先在具体页面补 `type/lookup`。

不要把助手的 `fill.ts`、`dropdown.ts`、`store.ts` 拷进业务应用，也不要另建宿主桥接实现。

## 3. 在应用生命周期中连接

把下面两处加入现有 `main.tsx` 生命周期，保留原有渲染和清理逻辑：

```tsx
import { connectAssistant } from '@/assistantBinding'

let disconnectAssistant = () => {}

renderWithQiankun({
  mount(props) {
    disconnectAssistant = connectAssistant(props.assistant)
    render(props) // 本应用已有的渲染方法
  },
  unmount() {
    instance.unmount() // 本应用已有的 React 实例清理
    disconnectAssistant()
  },
})
```

这是生命周期片段，不是可替换整个入口文件的模板。没有宿主或协议版本不匹配时，当前连接方法会降级为空操作，业务页面应继续可用。

## 4. 接一个页面验证

按 [表单填写](./scenarios#场景三文字或附件填写表单) 注册一个简单表单，放置 `AssistantButton`。验证助手能读到该页字段，预览后点击确认能写入；原页面仍由用户提交。

需要只读问答时，按 [页面问答](./scenarios#场景一当前页只读咨询) 使用 `kind: 'chat'`，不用造一个空表单。

## 5. 按需补页面目录

只在当前页面使用助手，不必先发布隐藏页面清单。需要让助手主动找到隐藏的新建/编辑页时，按下面步骤发布 manifest。


当前页面目录来自两部分：权限菜单，以及显式接入的静态 `assistant-pages.json`。菜单之外的新建、编辑、查看页可以通过静态清单补充。

清单条目示例：

```json
[
  {
    "appId": "febms",
    "name": "新增计费协议",
    "path": "/febms/pricingrules/costprotocol/transaction/create",
    "kind": "create"
  }
]
```

示例路径必须对应实际路由，不要只改标题后复用。新应用接入隐藏页面目录时：

1. 从本应用真实路由生成清单，确认名称、应用前缀和页面类型。
2. 随前端静态资源发布 `assistant-pages.json`，验证部署入口可访问。
3. 由 PASS 维护者把应用加入 `frontend/src/microapps/pageManifest.ts` 的 `MANIFEST_APP_IDS`。
4. 在目标应用未挂载时查询目录，确认也能找到新页面。

截至本次核对，`MANIFEST_APP_IDS` 只有 `febms`。其他应用的隐藏页面并非自动接入。目录成员资格不代表权限，目标页面和接口仍执行原权限校验。


连续操作示例见 [场景组合](./scenarios#场景五解读后跳页继续填写)。

## 接入验收

- 当前页可读取、可预览、可确认，原业务保存流程正常。
- 切换页签后不会读写失活页面；返回后目标正确。
- 抽屉关闭后目标不再可用；同路由多实例互不串数据。
- 子应用卸载再挂载，不出现重复注册。
- 独立运行或助手不可用时，原业务页可使用。

完成这些后，新增具体功能通常只需要改页面配置。
