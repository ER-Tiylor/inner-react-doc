---
title: ErrorBoundary
---

# ErrorBoundary

## 介绍

`ErrorBoundary` 是一个 React 错误边界组件，用于捕获其子组件树中的渲染异常，并展示统一的异常兜底页面。

## 何时使用

适用于页面级或模块级容器外层，用来防止子组件运行时异常直接导致整块页面白屏。

## API

### Props

| 属性名     | 说明                     | 类型        | 默认值 |
| ---------- | ------------------------ | ----------- | ------ |
| `children` | 需要被错误边界包裹的内容 | `ReactNode` | 无     |

### Callback Props

无

### Children

| 名称       | 说明             | 类型        |
| ---------- | ---------------- | ----------- |
| `children` | 被包裹的组件内容 | `ReactNode` |

### Ref

无

## 数据结构

组件内部维护以下状态：

```ts
type State = {
  hasError: boolean;
};
```

当子树抛出错误时，会通过 `getDerivedStateFromError` 将 `hasError` 设为 `true`，并在 `componentDidCatch` 中打印错误信息。

## 代码演示

```ts
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Demo() {
  return (
    <ErrorBoundary>
      <YourPage />
    </ErrorBoundary>
  );
}
```

## Design Token

无

## Accessibility

当前兜底页主要由图标、文本和按钮组成，具备基础可读性；源码中未额外补充 `aria-*` 属性或更细粒度的无障碍提示。

## FAQ

发生异常后组件会做什么？

组件会渲染统一错误页，并提供“刷新”按钮，点击后执行 `window.location.reload()` 重新加载页面。
