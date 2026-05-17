---
title: NavHeader
---

# NavHeader

## 介绍

`NavHeader` 是应用顶栏组件，负责展示站点 Logo、标题、当前登录用户信息，以及退出登录等顶部操作。

## 何时使用

适用于后台管理系统或业务中台的整体布局头部区域。

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

组件依赖以下外部状态和能力：

```ts
useUserStore().userInfo;
useAppStore().setDark;
useNavigate();
LStorage;
```

右上角下拉菜单当前包含：

```ts
[
  {
    key: 'logout',
    label: '退出登录',
  },
];
```

此外，目录下还提供了辅助组件 `BreadCrumb`，用于根据路由和菜单树生成面包屑：

```ts
findTreeNode(pathname, menuList, []);
```

## 代码演示

```ts
import NavHeader from '@/components/NavHeader';

export default function Demo() {
  return <NavHeader />;
}
```

## Design Token

组件样式中使用了以下主题变量：

| Token             | 说明       |
| ----------------- | ---------- |
| `--dark-bg-color` | 顶栏背景色 |
| `--dark-color`    | 顶栏文字色 |

## Accessibility

组件包含可点击 Logo、用户下拉菜单和按钮，基础交互能力依赖底层组件；当前源码未看到额外的 `aria-*` 定义。

## FAQ

点击头像下拉里的“退出登录”会做什么？

组件会移除本地 `token`，然后跳转到登录页，并将当前页面地址作为 `callback` 参数带过去。
