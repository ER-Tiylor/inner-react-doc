# 组件文档

组件区按职责分成 6 组，优先建议从 `ProTable`、`ProForm`、`FormUpload`、`SearchInput` 这几类高复用组件开始阅读。

## 分组导航

### 基础能力
- [Auth 权限控制](/components/foundation/auth)
- [ErrorBoundary 错误边界](/components/foundation/error-boundary)
- [FooterButton 底部按钮](/components/foundation/footer-button)
- [FormDigitRange 数值范围输入](/components/foundation/form-digit-range)

### 表单与输入
- [ProForm 业务表单](/components/forms/pro-form)
- [FormUpload 表单上传](/components/forms/form-upload)
- [SearchInput 远程搜索](/components/forms/search-input)
- [Address 地址选择](/components/forms/address)
- [Contract 合同选择](/components/forms/contract)
- [EditTable 可编辑表格](/components/forms/edit-table)
- [SearchTable 搜索表格](/components/forms/search-table)

### 表格与筛选
- [ProTable 业务表格](/components/tables/pro-table)
- [SearchTree 树选择](/components/tables/search-tree)

### 布局与导航
- [NavHeader 顶部导航](/components/layout/nav-header)
- [NavFooter 页脚](/components/layout/nav-footer)
- [SideMenu 侧边菜单](/components/layout/side-menu)
- [PageTabs 页面标签栏](/components/layout/page-tabs)
- [KeepAlive 页面缓存](/components/layout/keep-alive)

### 弹窗与预览
- [ConfimModal 确认弹窗](/components/feedback/confim-modal)
- [FlowModal 审批流程弹窗](/components/feedback/flow-modal)
- [ImportModal 导入弹窗](/components/feedback/import-modal)
- [LogModal 日志查看弹窗](/components/feedback/log-modal)
- [UploadDrawer 附件上传抽屉](/components/feedback/upload-drawer)
- [PDFViewer PDF 预览](/components/feedback/pdf-viewer)

### AI

- [系统介绍与架构](/components/ai/)
- [子应用接入](/components/ai/app-integration)
- [原子能力与 API](/components/ai/atomic-capabilities)
- [场景组合与示例](/components/ai/scenarios)
- [联调与排障](/components/ai/troubleshooting)

## 命名说明

`ConfimModal` 保留了源码中的历史命名，站点里仍然按源码组件名展示。如果后续代码层统一修正为 `ConfirmModal`，文档目录和标题也建议同步调整。