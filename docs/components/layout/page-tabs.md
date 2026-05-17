---
title: PageTabs
---

# PageTabs

## 介绍

`PageTabs` 是一个页面标签栏组件，用于根据当前路由动态生成顶部标签页，并支持切换、关闭、右键批量关闭以及联动 `KeepAlive` 缓存清理。

## 何时使用

适用于多标签工作台、后台系统页签式导航等需要在多个页面间快速切换并保留页面状态的场景。

## API

### Props

无

### Callback Props

无

### Children

无

### Ref

无

## 数据结构

内部标签项结构：

```ts
type ExtendedTab = {
  key?: string;
  label?: React.ReactNode;
  closable?: boolean;
  routeSearch?: string;
  routeHash?: string;
};
```

默认初始标签：

```ts
[
  {
    key: '/home',
    label: '首页',
    closable: false,
    routeSearch: '',
    routeHash: '',
  },
];
```

右键菜单项：

```ts
[
  { key: '1', label: '关闭左侧标签' },
  { key: '2', label: '关闭右侧标签' },
  { key: '3', label: '关闭其他标签' },
  { key: '4', label: '关闭全部标签' },
];
```

组件依赖：

```ts
searchApiRoute(pathname, menuList);
useDrop(); // 来自 KeepAlive/utils
useRouteLoaderData('layout');
```

## 代码演示

```ts
import PageTabs from '@/components/PageTabs';

export default function Demo() {
  return <PageTabs />;
}
```

## Design Token

组件通过 `ConfigProvider` 定制了 `Tabs` 主题：

| Token                    | 值        |
| ------------------------ | --------- |
| `Tabs.cardPadding`       | `0 16px`  |
| `Tabs.cardBg`            | `#F8F9FC` |
| `Tabs.cardGutter`        | `0`       |
| `token.borderRadius`     | `0`       |
| `token.colorBgContainer` | `#F8F9FC` |

## Accessibility

组件基于 `Tabs` 和 `Dropdown` 实现，基础键盘与焦点行为依赖底层组件；当前源码未看到额外无障碍增强属性。

## FAQ

关闭标签时为什么会联动清缓存？

组件在删除标签时会调用 `KeepAlive` 提供的 `dropAssignPage`，确保标签关闭后对应缓存页面一并释放，避免状态残留。
