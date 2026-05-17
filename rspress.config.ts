import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  lang: 'zh-CN',
  globalStyles: path.join(__dirname, 'docs/styles/overrides.css'),
  title: '组件文档',
  description: '通用 React 组件文档站点',
  icon: '/site-icon.svg',
  logo: {
    light: '/site-nav-logo.svg',
    dark: '/site-nav-logo.svg',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/ER-Tiylor/inner-react-doc',
      },
    ],
    footer: {
      message:
        '<div style="text-align:center;max-width:960px;margin:0 auto;color:var(--rp-c-text-3);">' +
        'React 组件文档站点 | 面向多个子应用共享的内部组件文档入口 | ' +
        '<a href="/components/">组件文档</a> | ' +
        '<a href="/overview/component-improvements">治理规划</a>' +
        '</div>',
    },
  },
});