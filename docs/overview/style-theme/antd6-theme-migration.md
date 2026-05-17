# Ant Design 6 主题与样式前瞻

## 背景

截至 **2026 年 5 月 17 日**：

- BMS 当前仍使用 ntd@5.20.0
- 当前样式体系已经同时混用了 token、全局 less、局部 ConfigProvider、module.less、ntd-style
- 官方已经提供了 Ant Design **v5 到 v6** 的迁移文档，且 v6 的样式体系相较 v5 更进一步靠近 **CSS Variables + Token + 语义化样式入口**

这意味着：

- BMS 现在不一定要立刻升级到 antd 6
- 但样式治理如果继续按 v5 的“混合覆盖”方式扩散，后面升级成本会明显更高

这篇文档的目标不是写迁移细节，而是回答：

1. antd 6 的样式与主题方向和 antd 5 相比发生了什么变化
2. 这些变化对 BMS 当前的样式治理有什么影响
3. 现在应该为未来升级预留哪些边界

## 先说结论

对 BMS 而言，最重要的不是“提前写 antd 6 代码”，而是现在就按 antd 6 更友好的方式治理样式。

一句话总结：

- 少依赖组件内部 DOM 结构覆盖
- 少依赖全局 less 直接改 antd 内部类名
- 多依赖 token、语义 token、styles / classNames 一类官方方向
- 把基础控件层的样式协议显式化

## 官方变化中，对 BMS 最重要的点

## 1. v6 默认使用 CSS Variables，并只支持现代浏览器

官方迁移文档明确说明：

- antd 6 仅支持现代浏览器
- 默认使用 CSS Variables
- 不再支持 IE

这对 BMS 的意义：

- 如果你们未来升级到 v6，主题切换、token 驱动、品牌预设能力会更自然
- 但前提是当前样式体系不要继续大量依赖“硬编码颜色 + 内部类名覆盖”

对治理的启发：

- 现在就应该把“主题”理解成 token 和变量体系
- 不要再把 less 变量或全局选择器覆盖当成长期主方案

## 2. v6 对很多组件的 DOM 结构做了调整

官方迁移文档明确提醒：

- v6 对大量组件 DOM 结构进行了升级和优化
- 如果项目存在针对组件内部 DOM 节点的自定义样式，升级后需要手动检查并调整

这对 BMS 的影响非常直接，因为当前项目里确实存在这些风险：

- 全局 	heme.less 覆盖
- module.less 中的 :global
- createStyles 中针对 antd 内部结构的选择器
- PageTabs、ProTable 等高复用组件里的结构性覆盖

结论：

- **凡是依赖 antd 内部 DOM 结构的覆盖，未来都是升级高风险点**
- 当前就应该把这类覆盖识别出来，并尽量往 token、语义 token、组件受控样式入口迁移

## 3. v6 更强调 styles / classNames 等语义化样式入口

从迁移文档可以看到很多 API 的变化方向是一致的：

- popupStyle 逐步迁移到 styles.popup.root
- dropdownClassName / popupClassName 逐步迁移到 classNames.popup.root
- odyStyle / headStyle / maskStyle 等逐步迁移到 styles.xxx

这说明官方在推动一种更稳定的样式覆盖方式：

- 不鼓励到处拼内部类名
- 更鼓励通过官方暴露的语义样式入口做覆盖

这对 BMS 的治理启发非常重要：

- 以后新增基础控件、Pro 组件时，优先考虑是否能暴露受控的样式入口
- 不要把“去页面里写一段覆盖 CSS”当成默认扩展方式

## 4. v6 继续加强 token 驱动，而不是回到 less 变量时代

官方 v6 的 CSS 相关文章说明：

- v6 在更多场景里利用 CSS 变量减少重复样式
- 样式会更多地由变量与 token 驱动，而不是大量重复生成组合样式

这和 BMS 当前治理目标是一致的：

- 品牌色
- 页面背景
- 表格头背景
- 查看态文字色
- 空值展示色
- 页签背景

这些都应该逐步收敛成：

- 全局 token
- 语义 token
- 组件协议

而不是继续散落在：

- 	heme.less
- 组件内部硬编码色值
- 页面局部样式

## 5. 升级不仅是视觉问题，也是 API 风格迁移

从官方迁移文档可以看到，很多旧属性虽然还能用，但已经进入弃用路径，例如：

- dropdownStyle -> styles.popup.root
- dropdownClassName -> classNames.popup.root
- popupStyle -> styles.popup.root
- odyStyle -> styles.body
- maskStyle -> styles.mask
- ordered -> ariant
- onDropdownVisibleChange -> onOpenChange

这对 BMS 的意义不是“今天就改完”，而是：

- **以后新增代码不要继续沿着旧写法扩散**
- 样式治理时应该顺便把这些 API 方向记在脑子里

## 对 BMS 当前体系的直接影响

## 1. src/antd 基础控件层必须成为主题治理桥梁

你们当前的 src/antd 已经不只是 re-export，它在承载：

- iewMode
- 空值展示
- 一些统一 placeholder
- 一些基础显示协议

如果未来要兼容 antd 6，更合理的方向是：

- 基础控件层继续保留
- 但它要从“薄封装 + 零散覆盖”升级成“协议明确的主题桥梁”

也就是说：

- 上层消费的是 BMS 自己的控件协议
- 底层再去适配 antd 5 / antd 6 的差异

这是比让业务页面直接面对 antd 升级更稳的路线。

## 2. ProForm / ProTable 不能继续大量依赖局部样式硬编码

因为这类高复用组件一旦形成大量局部覆盖：

- 后续升级 antd 6 时会出现 DOM、token、局部样式三方冲突
- 未来做 npm 包时也会把样式债务一起打包出去

所以从现在开始，更推荐：

- ProForm 把查看态、字段间距、表单结构样式更多收敛为协议
- ProTable 把表格头、筛选区、Tabs、工具栏等样式更多收敛为 token 或语义变量

## 3. 全局 less 的职责要继续收窄

因为 antd 6 更靠近变量驱动与官方样式入口，BMS 如果还把大量规则放在全局 less 里，会越来越逆向：

- 当前能跑
- 未来越升越难

所以建议保持这条原则：

- 全局 less 只保留 reset、scrollbar、少量兜底兼容
- 组件视觉主逻辑逐步迁移到 token / 语义 token / 组件受控样式入口

## 当前就应该做的前瞻准备

## 1. 先按 token 思维治理，而不是按 less 思维治理

即使你现在还在 antd 5，也建议：

- 优先考虑 token
- 其次考虑语义 token
- 再考虑组件局部样式
- 最后才是全局覆盖

这会让未来从 v5 到 v6 的迁移自然很多。

## 2. 识别并标记“高风险覆盖点”

高风险覆盖点主要是：

- 依赖 antd 内部 DOM 层级的 CSS
- 依赖具体内部类名的 :global 覆盖
- 局部 ConfigProvider 中写死视觉常量
- 组件内部和页面内部重复定义同一视觉规则

这些位置不一定现在就全部改，但至少要先被识别出来。

## 3. 建立 BMS 自己的语义 token 层

未来多公司定制和 antd 6 迁移其实都依赖这层。

建议继续沿着这个方向建设：

- 	ableHeaderBg
- pageTabsBg
- ormViewTextColor
- emptyValueColor
- layoutContentBg
- containerBorderColor

组件以后依赖这些名字，而不是依赖某个硬编码色值。

## 4. 基础控件层为未来版本差异做隔离

最理想的状态不是业务应用直接承受 antd 升级冲击，而是：

- 业务页面调用 src/antd 或未来的基础控件包
- 基础控件层内部适配 antd 的版本差异

这样以后哪怕从 antd 5 升到 antd 6：

- 主要修改集中在基础层和高复用组件层
- 页面层受到的影响会小很多

## 对未来多公司定制的关系

antd 6 默认 CSS Variables 这件事，对“多公司定制”其实是利好。

因为它天然更适合做：

- 品牌预设
- 动态 token
- 语义化主题切换

但前提是 BMS 现在不能继续把颜色、背景、边框、状态样式散落在各处。

所以对你当前目标来说，最重要的不是马上做多公司主题系统，而是先保证未来能做：

1. 品牌预设层
2. 语义 token 层
3. 组件协议层
4. 少量品牌级扩展覆盖层

## 推荐结论

如果要给 BMS 当前团队一个最简洁的方向建议，我会这样说：

- **短期**：继续留在 antd 5，但按 antd 6 更友好的方式治理样式
- **中期**：把基础控件层、Pro 组件层的主题协议收敛
- **长期**：再评估 antd 6 升级与多公司主题能力建设

换句话说：

- 现在先治理规则
- 不急着先升级版本
- 但规则必须按未来版本友好的方向设计

## 建议新增的前瞻检查项

后续每次样式治理或组件重构时，可以顺手多问四个问题：

1. 这段样式是 token 能解决，还是只能靠结构覆盖？
2. 这段覆盖是否依赖 antd 内部 DOM？
3. 这段规则应该属于基础控件层、Pro 组件层，还是页面层？
4. 如果未来换品牌主题，这里是否需要重写？

只要这四个问题持续被问，BMS 的样式体系就会越来越接近可升级、可定制、可包化的状态。

## 参考资料

- Ant Design 官方迁移文档：v5 到 v6
  https://ant.design/docs/react/migration-v6-cn/
- Ant Design 官方博客：v6 的一些 CSS 琐事
  https://ant.design/docs/blog/css-tricks-cn/
- Ant Design 官方文档：Use Token
  https://ant.design/docs/react/demo/use-token/
- Ant Design 官方文档：ConfigProvider
  https://ant.design/components/config-provider-cn/