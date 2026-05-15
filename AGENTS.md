# AI 智能体开发指南

## 项目概览

BMM（Bookmark Manager）是一个基于 Next.js 16 的全栈 TypeScript 应用，支持用户管理、分享和浏览书签，并集成 AI 功能（网站分析、标签推荐等）。

## 核心原则

- **奥卡姆剃刀**：选择能解决问题的最简单方案
- **如无必要，勿增实体**：不添加不需要的代码/功能
- **英文思考，中文回复**：保持清晰简洁
- **及时抛出用户指令中不合理的部分**：避免执行错误的操作
- 为了更好的完成任务，务必参考 [karpathy-guidelines](./.agents/skills/karpathy-guidelines/SKILL.md)


## 常用命令

```bash
pnpm dev              # 开发服务器（自动运行 db-init）
pnpm build            # 生产构建
pnpm start            # 生产服务器

pnpm lint             # ESLint
pnpm test             # 全部测试
pnpm test -- <file>   # 指定测试文件

pnpm db:test          # 测试数据库连接
pnpm db:migrate       # 执行迁移
pnpm db:push          # 推送 schema 变更（谨慎使用）
pnpm studio           # Drizzle Studio

# 生产环境：添加 -P 或 --production 参数
```

## 代码风格

### 导入顺序

外部依赖 → 内部模块（`@/`）→ 类型 → 组件

- 仅使用绝对导入（`@/*` → `src/*`，`@cfg` → `app.config.ts`）

### 格式化（Prettier）

- 2 空格缩进，无分号，单引号，100 字符行宽
- 代码修改完成后不要主动格式化，提交前再运行

### TypeScript

- Strict mode 已启用，禁止 `as any`、`@ts-ignore`

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `BookmarkListPage` |
| 函数/变量 | camelCase | `parseWebsite`, `isUserSpace` |
| 常量 | UPPER_SNAKE_CASE | `const PAGESIZE = 20` |
| 类型/接口 | PascalCase | `type UserId` |
| 文件 | 组件 PascalCase，工具 camelCase | `BookmarkListPage.tsx`, `utils.ts` |

### 目录结构

```
src/
├── app/              # Next.js App Router
├── components/       # 组件（ui/、re-export/、功能模块/）
├── actions/          # Server actions（items/ 放具体逻辑）
├── controllers/      # 业务逻辑 + schemas
├── lib/              # 工具库（auth、AI 等）
├── utils/            # 辅助函数
├── hooks/            # 自定义 hooks
└── db/               # Drizzle ORM
```

## Actions 模块

`src/actions/index.ts` 仅作导出入口，业务逻辑放在 `src/actions/items/`。

Server actions 必须使用 `makeAction` 包装：

```typescript
export const actDeleteBookmark = makeAction(
  deleteBookmarkSchema,
  'admin', // 角色守卫：false | 'user' | 'admin'
  async (input, userId) => { /* 逻辑 */ }
)
```

## 错误处理

**Controller/Handler**：抛出带中文消息的 `Error`

**异步操作**：使用 `to()` 代替 try-catch

```typescript
import { to } from '@/utils'
const [error, data] = await to(someAsyncFunction())
```

**客户端调用**：使用 `runAction`

```typescript
import { runAction } from '@/utils/client'
const res = await runAction(actDeleteUserBookmark({ id: 1 }), {
  okMsg: '操作成功',
  onOk: refresh,
})
```

## 组件结构

- 服务端组件为默认，客户端组件文件后缀为 `ClientPage`
- 客户端组件使用 `runAction` 调用 server actions

## 数据库

Drizzle ORM，支持 SQLite 和 PostgreSQL。

```typescript
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

await db.insert(schema.users).values({ name: 'John' })
const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) })
await db.update(schema.users).set({ name: 'Jane' }).where(eq(schema.users.id, userId))
```

## 设计系统

所有涉及 UI、样式、配色、排版、图标、动效、响应式布局的任务，必须参考 [DESIGN.md](./DESIGN.md)。

## 备注

- 包管理器：pnpm（必需）
- Node 版本：>=24.0.0
- 语言：错误消息和 UI 文案使用中文
