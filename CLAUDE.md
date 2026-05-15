# CLAUDE.md

此文件为 Claude Code 提供本项目的开发指南。

## 核心原则

- **奥卡姆剃刀**：选择能解决问题的最简单方案
- **如无必要，勿增实体**：不添加不需要的代码/功能
- **英文思考，中文回复**：保持清晰简洁

## 项目概览

BMM（Bookmark Manager）是一个基于 Next.js 16 的全栈 TypeScript 应用，支持用户管理、分享和浏览书签，并集成 AI 功能（网站分析、标签推荐等）。

## 常用命令

```bash
# 开发（自动运行 db-init）
pnpm dev              # 开发服务器 http://localhost:3000
pnpm build            # 生产构建
pnpm start            # 生产服务器

# 代码质量
pnpm lint             # ESLint 检查
pnpm test             # 运行全部 Vitest 测试
pnpm test -- <file>   # 运行指定测试文件

# 数据库
pnpm db:test          # 测试数据库连接
pnpm db:migrate       # 执行数据库迁移
pnpm db:push          # 推送 schema 变更（谨慎使用）
pnpm studio           # 打开 Drizzle Studio

# 生产环境：给任意命令加 -P 或 --production 参数
# 例如：pnpm db:test -P
```

## 代码规范

详见 [AGENTS.md](./AGENTS.md)，包含完整的代码风格、命名规范、TypeScript 配置、组件结构、数据库操作等完整指南。以下为关键要点：

### 导入顺序

```typescript
// 1. 外部依赖
import { useState } from 'react'
// 2. 内部模块（@/ 别名）
import { actDeleteUserBookmark } from '@/actions'
// 3. 类型和枚举
import type { SelectBookmark } from '@/controllers'
// 4. 组件
import UserHomeBody from './components/UserHomeBody'
```

- 全部使用绝对导入（`@/` → `src/*`，`@cfg` → `app.config.ts`），禁止相对路径
- 路径别名：`@/*` → `src/*`，`@cfg` → `app.config.ts`

### TypeScript

- Strict mode 已启用
- 禁止 `as any`、`@ts-ignore`、`@ts-expect-error`

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `BookmarkListPage` |
| 函数 | camelCase | `parseWebsite` |
| 变量 | camelCase | `const isUserSpace` |
| 常量 | UPPER_SNAKE_CASE | `const PAGESIZE = 20` |
| 类型/接口 | PascalCase | `type UserId`, `interface ActionResult` |
| 文件 | 组件用 PascalCase，工具用 camelCase | `BookmarkListPage.tsx`, `utils.ts` |

## 架构

### 认证系统

- NextAuth v5 (Beta)，双 Provider：GitHub OAuth + 账号密码
- 角色存储在 JWT 中：`user` 和 `admin`
- 首个注册用户自动成为 admin
- 服务端鉴权使用 `getAuthedUserId()` 辅助函数

### 数据库

- ORM：Drizzle，支持 SQLite/PostgreSQL
- Schema 分离：`src/db/sqlite/` 和 `src/db/postgres/`
- 用户数据：`userTags`、`userBookmarks`（多对多）
- 公开数据：`publicBookmarks`、`publicTags`（admin 管理）
- Auth：标准 NextAuth 表

### AI 集成

- 支持 OpenAI 兼容格式的任何 Provider
- Provider 配置在 admin 后台管理，存储在 `siteConfigs`
- `analyzeWebsite()`：提取标题、描述、favicon，推荐标签
- `analyzeRelatedTags()`：发现标签语义关系，推荐主题色

## 关键模式

### Server Actions

全部使用 `makeAction` 包装（`src/actions/make-action.ts`）：

- 自动 Zod 校验
- 角色守卫（`false` | `'user'` | `'admin'`）
- 统一错误处理
- 认证失败自动重定向

```typescript
export const actDeleteBookmark = makeAction(
  deleteBookmarkSchema,
  'admin', // 角色守卫
  async (input, userId) => {
    // 业务逻辑
  }
)
```

### Actions 模块边界

- `src/actions/index.ts` 仅作导出入口
- 业务逻辑放在 `src/actions/items/`
- 导出最终 action 到 `src/actions/index.ts`

### 异步错误处理

使用 `to()`（`@/utils`）代替 try-catch，返回 `[err, result]` 元组：

```typescript
import { to } from '@/utils'
const [error, data] = await to(someAsyncFunction())
if (error) { /* 处理错误 */ }
```

### 客户端调用 Server Action

使用 `runAction`（`@/utils/client`）：

```typescript
import { runAction } from '@/utils/client'
const res = await runAction(actDeleteUserBookmark({ id: 1 }), {
  okMsg: '操作成功',
  onOk: refresh,
})
if (res.ok) { /* 成功 */ }
// 错误自动 toast 展示
```

### 组件结构

- **服务端组件**：默认，负责获取初始数据
- **客户端组件**：文件后缀 `ClientPage`，管理交互
- **Context Providers**：`/src/components/providers` 管理全局状态

## 设计系统

详见 [DESIGN.md](./DESIGN.md)，包含配色令牌、排版间距、组件模式、图标系统等。

## 常见任务

**新增 Server Action**：
1. 在 `src/controllers/schemas/` 创建 Zod schema
2. 在 `src/actions/items/` 实现业务逻辑
3. 使用 `makeAction` 包装，设置角色守卫
4. 在 `src/actions/index.ts` 导出
5. 在客户端组件中使用 `runAction` 调用

**操作书签**：
- 用户书签：使用 `userBookmarks` 表，按 userId 隔离
- 公开书签：使用 `publicBookmarks` 表，admin 管理
- 搜索：使用 `keywordSearch()` 辅助函数，支持拼音和模糊匹配

**AI 功能**：
- 网站分析：调用 `analyzeWebsite()` 传入 URL
- 标签关系：调用 `analyzeRelatedTags()` 进行语义分组

## 开发提示

1. 始终使用 `@/` 绝对导入
2. Server actions 通过角色守卫参数检查权限
3. AI 功能需在 admin 后台配置活跃的 Provider
4. 数据库变更使用迁移，开发环境避免 `db:push`
5. 生产环境变量使用 `-P` 参数
