# BMM 设计系统

BMM 是一个面向收藏、整理、检索和后台维护的书签管理工具。界面应当像一张安静、可靠、可长期停留的工作台：内容密度高但不压迫，视觉有品质但不抢戏，操作路径清楚，状态反馈及时。

本文档用于指导新页面、组件抽取和样式调整。默认优先遵循现有技术栈：Next.js App Router、HeroUI v2、Tailwind CSS v4、Iconify、next-themes。

## 设计方向

### 关键词

- **内容优先**：书签标题、网址、标签、状态和操作是第一层信息。
- **安静精致**：使用细边框、半透明表面、轻量层次和克制动效营造品质感。
- **工具属性**：后台、列表、表单和筛选区域应高效、可扫描、可重复操作。
- **主题一致**：浅色与深色模式必须同时可读、可用、可信。
- **少即是准**：装饰只服务于空间分层、品牌识别或状态表达。

### 视觉气质

BMM 的默认界面气质是 **清透的实用主义**。它可以有轻微玻璃质感、柔和边框和细腻过渡，但不做营销式大卡片堆叠，不做过度插画，不做紫蓝渐变铺满页面，不让装饰元素稀释信息。

适合：

- 半透明表面叠在浅灰或深蓝黑背景上
- 低饱和中性色搭配少量品牌色
- 明确的列表、表格、工具栏和表单结构
- 小范围的图标、状态色、徽标和焦点环

避免：

- 大面积单色系渐变背景
- 装饰性光斑、漂浮圆球、无意义纹理
- 为普通操作添加夸张动画
- 把后台工具做成落地页或宣传页
- 页面区域套页面区域式的“卡片套卡片”

## 设计原则

### 1. 信息层级先于装饰

用户需要快速判断“这是什么、状态如何、我能做什么”。每个页面先确定主要任务，再决定视觉层级。

```text
优先：页面标题、主要操作、当前筛选、结果列表、状态提示
克制：背景纹理、阴影、装饰图形、非必要插图
```

### 2. 组件应该拥有合理边界

抽取共享 UI 组件时，如果调用方没有业务控制需求，应把数据获取和本地 UI 状态收进组件内部，只暴露真正的集成输入和事件。

适合由组件内部拥有：

- 下拉面板开关状态
- 搜索关键字、防抖和加载态
- 图标探测、分页、局部错误提示
- 仅影响组件自身的表单草稿

适合暴露给调用方：

- 初始值、受控值或提交结果
- 权限、空间类型、业务实体 ID
- 成功、取消、删除、选择等业务事件
- 需要被页面 URL 或全局状态表达的筛选条件

### 3. 一致性比局部惊艳重要

同类元素必须有稳定的视觉语言：按钮、输入框、卡片、列表项、空状态、危险操作和加载状态都应遵循统一模式。

```text
使用已有 HeroUI v2 组件
复用项目封装组件
复用 IconNames 中的图标类名
优先组合 Tailwind 工具类
仅在确有产品价值时创建新的视觉模式
```

### 4. 桌面完整，移动可读

BMM 的核心体验以桌面端为主，移动端保证核心内容浏览、搜索、编辑和提交可用。

```text
desktop >= 960px：完整工具栏、多列布局、批量操作、悬停反馈
tablet 650-959px：保留主要操作，收拢次级工具
mobile < 650px：内容优先，导航简化，触控区域不小于 44px
```

### 5. 明暗主题同等重要

任何新增 UI 都必须同时检查浅色和深色模式。不要只在一个主题里调到“看起来不错”。

```tsx
className="border-slate-200/70 bg-white/58 text-slate-900 dark:border-white/10 dark:bg-content1/62 dark:text-white"
```

## 色彩系统

色彩体系与 [HeroUI v2 Colors](https://v2.heroui.com/docs/customization/colors) 对齐。HeroUI v2 将默认颜色分为 **Common Colors** 与 **Semantic Colors**：Common Colors 跨主题保持一致，Semantic Colors 会随主题变化并承载语义。

### HeroUI v2 颜色结构

| 分组 | Token | 用途 |
| --- | --- | --- |
| Layout | `background`、`foreground`、`divider`、`focus` | 页面背景、文字、分割线、焦点态 |
| Content | `content1`、`content2`、`content3`、`content4` | 卡片、弹层、表面和嵌套表面 |
| Base | `default`、`primary`、`secondary`、`success`、`warning`、`danger` | 默认、品牌与状态语义 |
| Scales | `default-50` 到 `default-900` 等 | 每个语义色的色阶 |

### 项目使用规则

优先使用 HeroUI v2 语义色，不为单个页面硬编码一套独立色板。

| 语义 | 用途 |
| --- | --- |
| `background` | 页面底色 |
| `foreground` | 主要文字 |
| `divider` | 边框、分割线 |
| `focus` | 键盘焦点和强调焦点 |
| `content1` | 主要卡片、弹窗、浮层 |
| `content2` | 次级表面、工具栏、列表容器 |
| `content3` / `content4` | 更深层嵌套或选中表面 |
| `default` | 次级按钮、普通控件、弱强调 |
| `primary` | 主操作、当前选中、品牌强调 |
| `secondary` | 次级强调，谨慎使用 |
| `success` | 成功、已完成、已启用 |
| `warning` | 需要注意、部分失败、配置缺失 |
| `danger` | 删除、失败、不可恢复操作 |

### 使用示例

```tsx
className="border-divider bg-content1 text-foreground"
```

```tsx
className="bg-content2 text-default-600 hover:bg-content3"
```

```tsx
<Button color="primary">保存</Button>
<Button color="danger" variant="light">删除</Button>
```

### 自定义主题

HeroUI v2 的语义颜色应配置在 `heroui(...)` 插件选项中，而不是 Tailwind `theme.colors` 内。自定义色阶时使用 `50` 到 `900` 的完整范围，保持与 HeroUI token 结构一致。

```ts
heroui({
  themes: {
    light: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
      },
    },
  },
})
```

### CSS 变量

HeroUI v2 会为语义色生成 CSS 变量，默认前缀是 `--heroui`，格式为 `--heroui-colorname-shade`。只有在 Tailwind 工具类无法覆盖需求时才直接使用 CSS 变量。

```css
color: hsl(var(--heroui-foreground));
background: hsl(var(--heroui-content1));
border-color: hsl(var(--heroui-divider));
```

### Common Colors

HeroUI v2 的 Common Colors 类似 Tailwind 颜色，跨主题保持一致。默认不启用，避免与 Tailwind 颜色冲突；除非需要使用 HeroUI 提供的整套 common palette，否则不要开启 `addCommonColors`。

```ts
heroui({
  addCommonColors: true,
})
```

### 本项目的基础色约定

项目仍可保留少量稳定背景配置，但页面与组件优先使用 HeroUI 语义 token。

| 用途 | 推荐 | 说明 |
| --- | --- | --- |
| 页面背景 | `bg-background` 或 `Background.CLASS` | 全局页面底色 |
| 主要文字 | `text-foreground` | 标题与主要内容 |
| 次级文字 | `text-default-500` / `text-default-600` | 说明、元信息 |
| 分割线 | `border-divider` | 卡片、工具栏、列表边界 |
| 主表面 | `bg-content1` | 卡片、弹窗、浮层 |
| 次表面 | `bg-content2` | 工具栏、内嵌面板、列表容器 |

### 色彩使用规则

- 单页最多使用 1 个主强调色和 1 个状态强调色。
- 列表和后台页不要使用大面积高饱和背景，优先用 `content*` 与 `divider` 表达层级。
- 渐变只用于品牌点缀、AI 能力、欢迎页重点区域，不用于普通表单或列表背景。
- 状态不能只靠颜色表达，必须配合文字、图标或位置。
- 新增 UI 不直接使用 `red/green/yellow` 等 Tailwind 状态色，优先使用 `danger/success/warning`。

## 排版系统

### 字体

```css
/* 全局字体 */
font-family: 'Noto Sans SC', system-ui, -apple-system, sans-serif;
```

字体策略：

- 全局统一使用非衬线字体，不使用任何衬线字体。
- Logo、品牌文字、欢迎页标题也应沿用非衬线字体体系。
- 正文优先清晰稳定，不引入难读的展示字体。
- 不使用负字距作为常规风格；工具界面默认 `tracking-normal`。
- 不用视口宽度驱动字号。需要响应式时使用断点类调整，而不是 `vw` 字号。

### 字号层级

| 层级 | 推荐类名 | 用途 |
| --- | --- | --- |
| Page Title | `text-2xl font-semibold leading-tight` | 页面标题 |
| Section Title | `text-lg font-semibold leading-7` | 区块标题 |
| Card Title | `text-base font-semibold leading-6` | 卡片、列表项标题 |
| Body | `text-sm leading-6` / `text-base leading-7` | 正文、表单说明 |
| Meta | `text-xs leading-5` | 时间、URL、辅助信息 |
| Label | `text-xs font-medium leading-5` | 表单标签、状态标签 |

### 文案密度

- 后台与列表页使用紧凑标题，不使用首屏巨型 Hero 排版。
- 空状态文案不超过两行，主要动作紧跟其后。
- 按钮文字保持短促，优先“新建书签”“保存”“删除”“重试”。
- 错误消息和 UI 文案使用中文。

## 布局系统

### 页面结构

常规工作台页面从上到下建议为：

```text
页面标题 / 说明 / 主操作
筛选或工具栏
内容列表 / 表格 / 表单
分页 / 批量操作 / 辅助信息
```

页面宽度：

- 普通后台页使用 `AdminPageShell` 或现有页面壳层。
- 内容区域优先限制在可扫描范围内，不追求全屏铺满。
- 列表页在大屏可以增加信息列，但不要让单行文本过长。

### 间距

| Token | 值 | 用途 |
| --- | --- | --- |
| `space-1` | 4px | 图标和短文字 |
| `space-2` | 8px | 紧凑控件 |
| `space-3` | 12px | 表单项内部 |
| `space-4` | 16px | 普通组件内边距 |
| `space-5` | 20px | 卡片内边距 |
| `space-6` | 24px | 区块间距 |
| `space-8` | 32px | 页面主区块间距 |

### 圆角

BMM 现有页面存在较柔和的圆角语言，但新增工具型组件应优先克制。

| 场景 | 推荐 |
| --- | --- |
| 小按钮、输入框、标签 | `rounded-lg` 到 `rounded-xl` |
| 工具栏、分段控件、局部面板 | `rounded-xl` 到 `rounded-2xl` |
| 主要页面容器 | `rounded-2xl`，必要时 `rounded-[24px]` |
| 欢迎页、品牌展示容器 | 可使用 `rounded-[28px]` |

不要在密集列表和表格里默认使用 `rounded-3xl`。

### 表面与边框

推荐组合：

```tsx
className="border-divider/60 bg-white/58 backdrop-blur-xl dark:bg-content1/62"
```

内嵌区域：

```tsx
className="border-divider/60 bg-white/38 backdrop-blur-md dark:bg-default-100/5"
```

规则：

- 优先用背景差、边框和空间表达层级。
- 阴影只用于导航浮层、弹窗、悬浮卡片或需要脱离背景的容器。
- 避免多个高透明玻璃层互相嵌套，容易造成脏灰和可读性下降。

## 组件规范

### 按钮

- 主要操作使用 HeroUI v2 `Button` 的 `color="primary"`。
- 危险操作使用 `color="danger"`，并在批量或不可恢复操作中二次确认。
- 工具按钮优先使用图标加 tooltip；语义不清时使用图标加文字。
- 表格操作列中的纯图标按钮必须提供简短 tooltip，并保留可访问的 `aria-label`。
- 按钮内文字不得换行或溢出，移动端可以缩短文案。

### 表单

- 表单页优先使用单列布局，复杂设置可分区。
- 输入错误应出现在字段附近，并保留提交后的整体反馈。
- 保存按钮位置稳定，不因错误提示出现而大幅跳动。
- 长表单需要明确分组标题，不依赖视觉卡片堆叠制造分组。

### 列表与卡片

- 书签列表以标题、URL、标签、状态和操作为核心。
- 卡片可用于书签和标签等重复项，但页面区块不要伪装成卡片。
- 列表项 hover 可以轻微改变背景、边框或位移，避免夸张缩放。
- 批量选择、加载、空列表和错误态必须有明确视觉反馈。

### 导航

- 公共导航保持轻量透明，后台侧边栏保持稳定、可预测。
- 当前路由必须有清晰选中态。
- 外链入口使用外链图标。
- 移动端导航收拢时保留当前空间和主要操作入口。

### 空状态

空状态应回答三件事：

```text
当前没有什么
为什么可能没有
下一步能做什么
```

不要用大段解释，也不要只放一个图标。

## 图标系统

项目使用 Iconify，通过 `@iconify/tailwind` 集成。新增静态图标优先写入 `IconNames`，避免散落硬编码类名。

```tsx
import { IconNames } from '@cfg'

<span className={IconNames.Tabler.BOOKMARK} />
```

图标选择：

- Tabler：通用后台、操作、状态。
- Hugeicons：较大的导航或品牌化入口。
- Mdi：GitHub、Web 等明确品牌或常见概念。

图标尺寸：

- 按钮内：`text-base` 到 `text-lg`
- 列表项辅助：`text-sm` 到 `text-base`
- 空状态：`text-4xl` 到 `text-5xl`

## 动效系统

动效用于反馈，不用于炫技。

### 时长

| 场景 | 推荐 |
| --- | --- |
| 按钮、输入框反馈 | `duration-150` |
| 面板、卡片 hover | `duration-200` 到 `duration-300` |
| 弹窗、抽屉、空状态进入 | `duration-300` |
| 页面级强调 | `duration-500`，谨慎使用 |

### 属性

优先指定过渡属性，不默认使用 `transition-all`。

```tsx
className="transition-[background-color,border-color,box-shadow,transform] duration-200"
```

推荐动效：

- hover 背景和边框微调
- 加载图标旋转
- 弹层轻微淡入和位移
- 列表操作后的局部刷新反馈

避免：

- 大面积视差
- 长时间循环动画
- 列表项大幅缩放
- 会改变布局尺寸的 hover 效果

## 响应式规范

断点来自 `src/globals.css` 与 `tailwind.config.ts`：

```text
xs: 650px
sm: 960px
md: 1280px
lg: 1400px
xl: 1920px
```

移动端要求：

- 触控目标不小于 44px。
- 正文不小于 14px。
- 关键操作不只依赖 hover。
- 工具栏可以横向滚动，但主要操作必须可见。
- 表格在移动端应改为卡片、分组列表或隐藏低优先级列。

桌面端要求：

- 充分利用宽度展示筛选、批量操作和状态。
- hover 态、快捷入口、批量操作可以完整出现。
- 不让正文行宽无限增长。

## 主题与 Tailwind v4

### 主题 Provider

项目使用 `next-themes`：

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" forcedTheme={forceTheme}>
  {children}
</ThemeProvider>
```

### Tailwind v4 透明度

使用 Tailwind v4 的透明度语法：

```css
/* 推荐 */
bg-white/58
border-white/8
ring-sky-500/14

/* 避免新增 */
bg-white/[0.58]
border-white/[0.08]
```

### CSS 文件引用

如果在独立 CSS 文件中使用 Tailwind 或 HeroUI v2 原子类，需要在文件顶部引用全局样式：

```css
@reference "../globals.css";
```

## 代码落地规范

### 优先级

1. HeroUI v2 组件
2. 项目已有封装组件
3. Tailwind 工具类组合
4. 小而专注的新组件
5. 页面专属 CSS

### 新组件检查清单

新增或抽取 UI 组件前确认：

- 是否真的有复用场景。
- 调用方是否需要控制内部状态。
- 是否同时支持明暗主题。
- 是否有 loading、empty、error、disabled 状态。
- 移动端是否可读可点。
- 图标是否来自 `IconNames` 或合理的 Iconify 类名。
- 是否避免 `as any`、`@ts-ignore`、`@ts-expect-error`。

### ClassName 组织

复杂样式建议使用 `cn(...)` 分组：

```tsx
className={cn(
  'border-divider/60 rounded-2xl border bg-white/58 backdrop-blur-xl',
  'transition-[background-color,border-color,box-shadow] duration-200',
  'hover:bg-white/70 dark:bg-content1/62 dark:hover:bg-content1/72'
)}
```

### 何时自定义 CSS

只有在以下情况考虑自定义 CSS：

- Tailwind 无法表达的关键动画。
- 第三方组件内部结构需要稳定覆盖。
- 多处复用的复杂视觉效果。
- 需要定义项目级工具类。

不要为了少写几个 class 新增 CSS。

## 页面类型指南

### 公共首页 / 欢迎页

- 可以更有品牌感，但第一屏必须让用户看到 BMM 是书签管理工具。
- 主视觉应服务于产品，不使用抽象装饰替代真实功能感知。
- 标题简洁，说明文字解释价值，不把所有功能写进首屏。

### 用户书签页

- 搜索、标签、排序、批量操作的优先级高于装饰。
- 书签卡片应保证标题、URL 和标签可快速扫描。
- 失败检测、AI 分析、删除等操作需要清楚状态。

### 后台管理页

- 视觉更克制，强调效率。
- 操作区、筛选区、结果区边界清晰。
- 表格和列表优先稳定，不做大幅 hover 位移。

### 创建 / 编辑页

- 表单字段分组清楚，主要提交按钮稳定可见。
- AI 填充、图标探测、HTML 解析等增强能力应作为工具入口，而非打断主流程。
- 字段校验和服务端错误使用中文，错误位置贴近相关字段。

## 验收标准

提交 UI 相关改动前至少检查：

- 浅色和深色模式都可读。
- 桌面和移动断点无文字溢出、遮挡、错位。
- 主要交互有 loading、disabled、error 状态。
- 按钮、图标、输入框尺寸稳定，不因内容变化跳动。
- 页面没有无意义大卡片嵌套和装饰性光斑。
- 新增图标遵循 Iconify / `IconNames` 约定。
- 普通代码修改后不主动格式化；准备提交前按项目要求运行格式化。
