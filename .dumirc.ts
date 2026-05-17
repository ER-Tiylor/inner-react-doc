import { defineConfig } from 'dumi';
// import { defineThemeConfig } from '@antv/dumi-theme-antv';

const componentSidebar = [
  {
    title: '组件导航',
    children: [
      { title: '组件总览', link: '/components' },
    ],
  },
  {
    title: '基础能力',
    children: [
      { title: 'Auth', link: '/components/foundation/auth' },
      { title: 'ErrorBoundary', link: '/components/foundation/error-boundary' },
      { title: 'FooterButton', link: '/components/foundation/footer-button' },
      { title: 'FormDigitRange', link: '/components/foundation/form-digit-range' },
    ],
  },
  {
    title: '表单与上传',
    children: [
      { title: 'ProForm', link: '/components/form/pro-form' },
      { title: 'FormUpload', link: '/components/form/form-upload' },
      { title: 'UploadDrawer', link: '/components/form/upload-drawer' },
    ],
  },
  {
    title: '数据展示与选择',
    children: [
      { title: 'ProTable', link: '/components/data-display/pro-table' },
      { title: 'SearchInput', link: '/components/data-display/search-input' },
      { title: 'SearchTree', link: '/components/data-display/search-tree' },
      { title: 'PDFViewer', link: '/components/data-display/pdf-viewer' },
    ],
  },
  {
    title: '布局与导航',
    children: [
      { title: 'NavHeader', link: '/components/layout/nav-header' },
      { title: 'NavFooter', link: '/components/layout/nav-footer' },
      { title: 'PageTabs', link: '/components/layout/page-tabs' },
      { title: 'SideMenu', link: '/components/layout/side-menu' },
      { title: 'KeepAlive', link: '/components/layout/keep-alive' },
    ],
  },
  {
    title: '反馈与状态',
    children: [
      { title: 'ConfimModal', link: '/components/feedback/confim-modal' },
    ],
  },
  {
    title: '业务组件',
    children: [
      { title: 'Address', link: '/components/business/address' },
      { title: 'Contract', link: '/components/business/contract' },
      { title: 'FlowModal', link: '/components/business/flow-modal' },
      { title: 'ImportModal', link: '/components/business/import-modal' },
      { title: 'LogModal', link: '/components/business/log-modal' },
    ],
  },
  {
    title: '其他组件',
    children: [
      { title: 'EditTable', link: '/components/misc/edit-table' },
      { title: 'SearchTable', link: '/components/misc/search-table' },
    ],
  },
];

export default defineConfig({
  // themeConfig: defineThemeConfig({
  //   name: 'BMS Components Docs',
  //   nav: [
  //     { title: '首页', link: '/' },
  //     { title: '组件总览', link: '/components' },
  //     { title: '组件评估', link: '/overview' },
  //     { title: '组件治理', link: '/governance' },
  //   ],
  //   sidebar: {
  //     '/components': componentSidebar,
  //     '/components/business': componentSidebar,
  //     '/components/foundation': componentSidebar,
  //     '/components/form': componentSidebar,
  //     '/components/data-display': componentSidebar,
  //     '/components/layout': componentSidebar,
  //     '/components/feedback': componentSidebar,
  //     '/components/misc': componentSidebar,
  //     '/overview': [
  //       {
  //         title: '组件评估',
  //         children: [
  //           { title: '评估总览', link: '/overview' },
  //           { title: '组件综合评估', link: '/overview/component-summary' },
  //           { title: '组件严格复评', link: '/overview/component-summary-strict' },
  //           { title: '组件未来优化建议', link: '/overview/component-improvements' },
  //         ],
  //       },
  //     ],
  //     '/governance': [
  //       {
  //         title: '组件治理',
  //         children: [
  //           { title: '治理总览', link: '/governance' },
  //           { title: 'npm 包候选清单', link: '/governance/npm-package-candidates' },
  //         ],
  //       },
  //     ],
  //   },
  // }),
  //  name: 'BMS Components Docs',
  //   nav: [
  //     { title: '首页', link: '/' },
  //     { title: '组件总览', link: '/components' },
  //     { title: '组件评估', link: '/overview' },
  //     { title: '组件治理', link: '/governance' },
  //   ],
  //   sidebar: {
  //     '/components': componentSidebar,
  //     '/components/business': componentSidebar,
  //     '/components/foundation': componentSidebar,
  //     '/components/form': componentSidebar,
  //     '/components/data-display': componentSidebar,
  //     '/components/layout': componentSidebar,
  //     '/components/feedback': componentSidebar,
  //     '/components/misc': componentSidebar,
  //     '/overview': [
  //       {
  //         title: '组件评估',
  //         children: [
  //           { title: '评估总览', link: '/overview' },
  //           { title: '组件综合评估', link: '/overview/component-summary' },
  //           { title: '组件严格复评', link: '/overview/component-summary-strict' },
  //           { title: '组件未来优化建议', link: '/overview/component-improvements' },
  //         ],
  //       },
  //     ],
  //     '/governance': [
  //       {
  //         title: '组件治理',
  //         children: [
  //           { title: '治理总览', link: '/governance' },
  //           { title: 'npm 包候选清单', link: '/governance/npm-package-candidates' },
  //         ],
  //       },
  //     ],
  //   },

});
