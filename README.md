# BMM: 书签管理器

一个书签管理器，最大的特点是以标签对书签进行归类、索引、管理。

## TODO

- 页面配色优化
- 网站在不同网络环境下的可用性检测
- 根据打开喜欢展示“最近打开”
- CSS 变量：https://www.pollen.style/

## 部署

1. 推到 GitHub 中 master 分支

## 代码风格

Vue 中的函数式组件形如：

```js
function MyComponent(props, { slots, emit, attrs }) {
  // ...
}
```

函数式组件可以接受 props，但是如果同时有 state，那么每次 props 发生变化时，函数式组件都会重新执行（初始化），因此 state 无法保留之前的状态，而是会被初始化。

这和 React 的函数式组件很不一样。

React 中的 hook 如 `useState()` `useEffect()` 可以通过 React 的 runtime 记录、比较同一个组件在不同的生命周期里的状态、依赖。而 Vue 却不是这样的。
这也是 Vue 的 composition API 和 React 的 hook API 最主要的区别！

因此为了统一、易于拓展，该项目里定义组件统一使用 `defineComponent()`.

### 插槽

如果 slot 用到了 doge，如 default、header、footer，使用如下 `v-slots`:

```jsx
<Component
  v-slots={{
    header: () => <h1>大标题</h1>,
    default: () => <p>正文内容</p>,
    footer: () => <span>额外说明</span>,
  }}
/>
```

## Naive-UI

### 该组件库的样式实现方式：

1. 外层组件上的 style 里定义需要用到的 CSS 变量
2. 内容元素、边框元素、动效元素 通过 `var()` 引用 CSS 变量

### 优点：

1. 通过 <NConfiguration themeOverride={} /> 覆盖内部所有组件的样式
2. 可以动态的更改样式
3. 可以通过只修改一处，就修改该组件的整体样式。如按钮的文本和块边框的颜色是一致的，那么只需修改一个文本颜色就行

### 缺点：

1. 定义的 theme 接口只允许部分样式属性
2. 伪元素样式不方便定义
