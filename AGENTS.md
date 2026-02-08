# AGENTS.md - Codebase Guide for AI Agents

## Build, Lint, and Test Commands

```bash
# Development
pnpm dev              # Start dev server (runs db-init first)
pnpm build            # Build for production
pnpm start            # Start production server

# Quality
pnpm lint             # Run ESLint
pnpm test             # Run all Vitest tests
pnpm test -- <file>   # Run specific test file (e.g., pnpm test -- index.test.ts)

# Database
pnpm db:test          # Test database connection
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes (use with caution)
pnpm studio           # Open Drizzle Studio

# Add -P or --production flag to any command for production environment
# Example: pnpm db:test -P
```

## Code Style Guidelines

### Import Organization

**Order**: External dependencies → Internal modules → Local files

```typescript
// 1. External dependencies (React, Next.js, libraries)
import { useState, useRef } from 'react'
import { redirect } from 'next/navigation'
import { Button, cn } from '@heroui/react'
import { useRequest } from 'ahooks'

// 2. Internal modules (@/ aliases)
import { actDeleteUserBookmark, actFindUserBookmarks } from '@/actions'
import { ClientIcon, EmptyListPlaceholder } from '@/components'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { runAction } from '@/utils/client'

// 3. Types and enums
import type { SelectBookmark } from '@/controllers'
import { IconNames, PageRoutes } from '@cfg'

// 4. Component imports (if multiple components in one file)
import UserHomeBody from './components/UserHomeBody'
```

**Absolute imports only**: Use `@/` alias for all internal imports. Never use relative imports like `../../utils`.

### Formatting (Prettier)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```

- 2 spaces indentation
- No semicolons
- Single quotes
- 100 character line limit

### TypeScript Configuration

- **Strict mode**: Enabled
- **Module resolution**: `bundler`
- **Path aliases**: `@/*` → `./src/*`, `@cfg` → `./app.config.ts`
- **Never suppress errors**: No `as any`, `@ts-ignore`, or `@ts-expect-error`

### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Components | PascalCase | `BookmarkListPage`, `UserHomeBody` |
| Functions | camelCase | `parseWebsite`, `getPinyin`, `to()` |
| Variables | camelCase | `const isUserSpace = ...` |
| Constants | UPPER_SNAKE_CASE | `const PAGESIZE = 20` |
| Types/Interfaces | PascalCase | `type UserId = string`, `interface ActionResult` |
| Enums | PascalCase | `enum UploadStatus` |
| File names | PascalCase for components, camelCase for utilities | `BookmarkListPage.tsx`, `index.ts`, `utils.ts` |

### File Structure Patterns

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Route groups
│   ├── admin/             # Admin pages
│   ├── user/              # User pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layouts
├── components/            # React components
│   ├── ui/               # UI primitives (HeroUI)
│   ├── re-export/        # Re-exported components
│   └── [Feature]/        # Feature components
├── actions/              # Server actions
│   ├── items/           # Individual action files
│   ├── make-action.ts   # Action wrapper
│   └── index.ts         # Exports
├── controllers/          # Business logic
│   ├── [Feature].controller.ts
│   └── schemas.ts       # Zod schemas
├── lib/                 # Library code (auth, AI, etc.)
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── db/                  # Database (Drizzle ORM)
```

### Server Actions Pattern

**Always use `makeAction` wrapper** for server actions:

```typescript
import { auth } from '@/lib/auth'
import { makeAction, makeActionInput } from '@/actions/make-action'
import { z } from 'zod'

// Define schema
const schema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
})

// Define handler
async function analyzeWebsite(input: z.infer<typeof schema>) {
  // Handler logic here
  // Use 'throw new Error()' for errors
  return { result: 'success' }
}

// Create action
export const aiAnalyzeWebsiteInput = makeActionInput({
  handler: analyzeWebsite,
  schema,
  guard: 'user', // false | 'user' | 'admin'
  name: 'analyzeWebsite', // For debugging
})

// Export action
export const aiAnalyzeWebsite = makeAction(analyzeWebsite, { schema })
```

**Return format**: `{ error: { msg: string } | undefined, data: T | undefined }`

### Error Handling

**Controller/Handler Layer**: Throw `Error` with Chinese messages

```typescript
throw new Error('邮箱已被注册使用')
throw new Error('书签已不存在')
```

**Database Layer**: Errors wrapped in `SqlXError` with parsing logic

**Utility**: Use `to()` function for promise error handling

```typescript
import { to } from '@/utils'

const [error, data] = await to(someAsyncFunction())
if (error) {
  // Handle error
}
```

**Client Layer**: Use `runAction` wrapper for action results

```typescript
import { runAction } from '@/utils/client'

const res = await runAction(action({ id: 1 }), {
  okMsg: '操作成功',
  onOk: (data) => console.log(data),
})

if (res.ok) {
  // Success
} else {
  // Error shown as toast automatically
}
```

### Type Definitions

**Global types** in `global.d.ts`:

```typescript
// Database types inferred from schema
type UserId = (typeof schema.users.$inferSelect)['id']
type TagId = (typeof schema.publicTags.$inferSelect)['id']
type BookmarkId = (typeof schema.publicBookmarks.$inferSelect)['id']

// Shared types
type SelectTag = SelectPublicTag
type SelectBookmark = SelectPublicBookmark
```

**Zod Integration**: Use Zod for validation and type inference

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type Input = z.infer<typeof schema>
```

### Component Structure

```typescript
'use client' // For client components

// Imports
import { useState } from 'react'

// Constants
const PAGESIZE = 20
const SORTERS = [...]

// Types
type BookmarkListPageProps = {
  tags: SelectTag[]
  totalBookmarks: number
}

// Component
export default function BookmarkListPage(props: BookmarkListPageProps) {
  // Hooks
  const [state, setState] = useState(...)

  // Handlers
  function handleRemove(item: SelectBookmark) { ... }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Client Components

**Always add `'use client'` directive** at top of file for client components.

**Use `runAction` utility** for calling server actions from client:

```typescript
import { runAction } from '@/utils/client'
import { actDeleteUserBookmark } from '@/actions'

async function onDelete(item: SelectBookmark) {
  await runAction(actDeleteUserBookmark({ id: item.id }), {
    okMsg: '书签已删除',
    onOk: refresh,
  })
}
```

### Environment Variables

**Required**: `DB_CONNECTION_URL`, `DB_DRIVER` (postgresql | sqlite)

**Optional**: `AUTH_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AI_*`

**Loading**: Environment variables loaded via `scripts/utils.mjs` before server starts.

### Testing

**Framework**: Vitest

**Pattern**:
```typescript
import { describe, expect, it, test } from 'vitest'

describe('FeatureName', () => {
  test('should do something', () => {
    expect(1 + 2).toBe(3)
  })

  it('alternative test syntax', () => {
    expect(true).toBe(true)
  })
})
```

**Run single test**:
```bash
pnpm test -- index.test.ts
```

### Database

**ORM**: Drizzle ORM

**Migration**:
- `pnpm db:migrate` - Create migrations
- `pnpm db:push` - Push schema directly (use with caution)

**Query patterns**:
```typescript
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// Insert
await db.insert(schema.users).values({ name: 'John' })

// Select
const user = await db.query.users.findFirst({
  where: eq(schema.users.id, userId),
})

// Update
await db.update(schema.users)
  .set({ name: 'Jane' })
  .where(eq(schema.users.id, userId))
```

## Key Utilities

### `to()` - Promise Error Handling
```typescript
const [error, data] = await to(promise)
if (error) { /* handle */ }
```

### `runAction()` - Server Action Wrapper
```typescript
const res = await runAction(action(args), {
  okMsg: 'Success message',
  onOk: (data) => { /* success callback */ },
})
```

### `pageSpace()` - Route Detection
```typescript
const { isAdmin, isUser } = pageSpace('auto')
```

### `isValidUrl()` / `robustUrl()` - URL Validation
```typescript
if (isValidUrl(url)) { /* valid */ }
const fixedUrl = robustUrl(url) // Adds http/https if needed
```

## Additional Notes

- **Package manager**: pnpm (required)
- **Node version**: >=24.0.0
- **Language**: Chinese error messages and UI text
- **Database**: Supports SQLite (default) and PostgreSQL
- **AI Integration**: OpenAI-compatible APIs supported via env vars
- **Auth**: NextAuth v5 with GitHub OAuth and credentials
- **Output mode**: `standalone` for Docker/serverless deployment
