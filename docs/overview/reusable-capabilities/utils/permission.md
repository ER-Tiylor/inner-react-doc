# permission

路径：`src/utils/permission.ts`

## 定位

`permission` 这一组工具主要处理路由、菜单、权限树的查找、过滤与组织，是布局层、导航层和权限接入层的重要基础能力。

## 主要导出

```ts
getMenuPath(list, result?)
getTreeMenuData(list, privilegeList)
searchLocalRoute(path, routes)
searchApiRoute(path, routes)
findTreeNode(path, menus, result)
```

## 如何使用

### 示例 1：把菜单树转成侧边栏可渲染结构

这就是 `SideMenu` 当前的典型用法。

```tsx
import { getTreeMenuData } from '@/utils/permission'

const temp = filterMenuData(menuList)
const treeMenuList = getTreeMenuData(temp, userInfo.privilegeList)
setItems(treeMenuList)
```

这个方法会做两件事：

- 按 `auth` 过滤掉当前用户无权限的菜单
- 把后端菜单树转换成前端 `Menu` 可消费的 `items`

### 示例 2：根据当前路径匹配本地路由

这就是布局层常见写法。

```tsx
import { searchLocalRoute } from '@/utils/permission'
import router from '@/router'

const route = searchLocalRoute(pathname, router)
```

适合根据当前路径拿到路由元信息，例如页面标题、缓存配置、权限配置。

### 示例 3：根据当前路径查菜单链路做面包屑

```tsx
import { findTreeNode } from '@/utils/permission'

const menuPath = findTreeNode(pathname, menuList, [])
```

返回值通常是一条从根节点到当前页面的菜单路径，可直接用于面包屑展示。

## 适合使用的场景

- 根据权限树生成菜单结构
- 根据当前路径匹配本地路由或服务端路由数据
- 在标签页、导航栏、侧边栏中复用同一套路由解析逻辑
- 页面或布局需要做节点查找、路径推导、菜单生成

## 不适合使用的场景

- 只有单页面、没有权限树和菜单树概念的小型工具页
- 权限模型与当前 BMS 体系完全不同的应用
- 页面临时性的展示开关判断

## 适用边界

这些工具解决的是树结构处理与查找问题，不负责：

- 权限接口请求
- 登录态校验
- 按钮级权限的最终渲染策略
- 路由守卫与页面跳转时机控制