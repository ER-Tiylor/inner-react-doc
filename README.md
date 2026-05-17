# React Components Internal Docs

这是一个基于 Rspress 的内部组件文档站点，用于承载通用 React 组件的说明文档、示例演示和后续治理规划。

## 目录结构

```txt
inner-react-doc/
├─ docs/                    # 文档内容：md/mdx、导航、静态资源
├─ playground/              # 演示运行区
│  ├─ components/           # 从组件仓库同步过来的真实组件源码
│  ├─ antd/                 # 演示运行所需的最小 antd 包装层
│  ├─ demos/                # 每个组件的 demo 入口与示例页面
│  ├─ providers/            # ConfigProvider、状态注入、上下文包装
│  ├─ mocks/                # demo 假数据、假接口、静态样例
│  ├─ styles/               # demo 专用样式与全局样式
│  └─ utils/                # demo 公共工具函数
├─ doc_build/               # 构建产物
├─ rspress.config.ts        # Rspress 配置
└─ package.json
```

## 设计原则

- `docs/` 只放文档内容，不混入运行源码。
- `playground/` 只负责示例演示，不直接承担正式业务代码职责。
- `components/` 与 `antd/` 先采用最小搬运策略，只引入 demo 真正需要的文件。
- `demos/` 优先按组件维度组织，避免示例散落在文档目录中。

## 推荐的 Demo 落地方式

以 `FormDigitRange` 为第一个 demo 时，建议按下面的方式组织：

```txt
playground/
├─ components/
│  └─ FormDigitRange/
├─ antd/
│  ├─ Col/
│  ├─ InputNumber/
│  └─ Row/
├─ demos/
│  └─ form-digit-range/
│     ├─ basic.tsx
│     └─ view-mode.tsx
└─ styles/
   └─ demo.css
```

这样可以把“真实组件源码”和“演示入口”分开：
- 组件源码更新时，只需要同步 `playground/components/`。
- demo 变化时，只需要调整 `playground/demos/`。
- 文档页里引用 demo，也不会和 Markdown 内容目录冲突。

## Setup

Install the dependencies（node >= 22.22.2）:

```bash
npm install
```

## Get started

Start the dev server:

```bash
npm run dev
```

Build the website for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```