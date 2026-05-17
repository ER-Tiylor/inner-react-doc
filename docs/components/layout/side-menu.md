# SideMenu 侧边菜单

## 介绍
`SideMenu` 是应用左侧菜单组件，会根据路由菜单树和当前用户权限生成可点击的侧边导航。

## 何时使用
适用于后台系统主布局中的左侧导航菜单区域。

## 代码演示
```tsx
import SideMenu from '@/components/SideMenu'

export default function Demo() {
  return <SideMenu />
}
```


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
组件依赖以下外部数据：

```ts
useRouteLoaderData('layout') => { menuList }
useUserStore().userInfo.privilegeList
```

内部处理流程大致为：

```ts
1. 过滤 hideInMenu 的菜单项
2. 调用 getTreeMenuData(menuList, privilegeList)
3. 生成 antd Menu 所需 items
4. 点击菜单后执行 navigate(key)
```

菜单树节点结构依赖路由类型 `IMenuColumn`，当前 README 不再重复展开。

## Design Token
无

## Accessibility
组件基于 `Menu` 实现，基础键盘导航和选中态能力依赖底层组件；当前源码未看到额外无障碍增强属性。

## FAQ
为什么有些路由配置没有显示在菜单里？

组件会先过滤 `hideInMenu` 为真的节点，再结合当前用户 `privilegeList` 做权限筛选，因此隐藏菜单项或无权限节点不会展示。

