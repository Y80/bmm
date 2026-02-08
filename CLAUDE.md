# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Principles

- **Occam's Razor**: Choose the simplest solution that solves the problem
- **No Unnecessary Entities**: Don't add code/features that aren't needed
- **Think in English, Answer in Chinese**: Maintain clarity while being concise

## Project Overview

BMM (Bookmark Manager) is a full-stack TypeScript application built with Next.js 16.0.10 (App Router) that allows users to manage, share, and explore bookmarks with AI-powered features.

## Common Development Commands

```bash
# Development (automatically runs db-init)
pnpm dev              # Start development server on http://localhost:3000

# Building and Production
pnpm build            # Build for production (runs db-init with production flag)
pnpm start            # Start production server (runs db-init with production flag)

# Code Quality
pnpm lint             # Run ESLint
pnpm test             # Run all Vitest tests
pnpm test -- <file>   # Run specific test file (e.g., pnpm test -- index.test.ts)

# Database Operations
pnpm db:test          # Test database connection
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes (dangerous - may lose data)
pnpm studio           # Open Drizzle Studio for database management

# Environment Flags
# Add -P or --production to any command for production environment
# Example: pnpm db:test -P
```

## High-Level Architecture

### Authentication System
- **NextAuth v5 (Beta)** with dual provider support:
  - GitHub OAuth (`/src/lib/auth/github-provider.ts`)
  - Credentials (email/password) (`/src/lib/auth/credentials-provider.ts`)
- **Role-based access**: `user` and `admin` roles stored in JWT
- **First user becomes admin** automatically
- Use `getAuthedUserId()` helper for server-side authentication checks

### Database Architecture
- **ORM**: Drizzle with multi-database support (SQLite/PostgreSQL)
- **Schema separation**: Different schemas for SQLite (`/src/db/sqlite/`) and PostgreSQL (`/src/db/postgres/`)
- **Key tables**:
  - User-scoped: `userTags`, `userBookmarks` with many-to-many relationships
  - Public: `publicBookmarks`, `publicTags` (admin-managed)
  - Auth: Standard NextAuth tables
- **Many-to-many patterns**: Bookmark↔Tags, Tags↔Tags (related tags)

### AI Integration
- **OpenAI-compatible APIs**: Any provider supporting OpenAI format
- **Key functions** (`/src/lib/ai/index.ts`):
  - `analyzeWebsite()`: Extracts title, description, favicon, suggests tags
  - `analyzeRelatedTags()`: Finds semantic tag relationships, suggests theme colors
- **Environment variables**: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`

### Code Organization Patterns

#### Import Order
```typescript
// 1. External dependencies
import { useState } from 'react'
// 2. Internal modules (@/ aliases)
import { actDeleteUserBookmark } from '@/actions'
// 3. Types and enums
import type { SelectBookmark } from '@/controllers'
// 4. Component imports
import UserHomeBody from './components/UserHomeBody'
```

#### Server Actions Pattern
All server actions use the `makeAction` utility (`/src/utils/server-actions.ts`):
- Automatic Zod validation
- Role-based guards (`false` | `'user'` | `'admin'`)
- Standardized error handling
- Automatic redirects for auth failures

Example:
```typescript
export const actDeleteBookmark = makeAction(
  deleteBookmarkSchema,
  'admin',  // role guard
  async (input, userId) => {
    // action logic
  }
)
```

#### Component Structure
- **Server components**: Default, fetch initial data
- **Client components**: Suffixed with "ClientPage", manage interactivity
- **Context providers**: `/src/components/providers` for global state

### Key Technical Decisions

1. **No client state management**: React Context + server state via actions
2. **Type safety**: Extensive Zod schemas, TypeScript strict mode
3. **Path aliases**: `@/*` maps to `src/*`, `@cfg` maps to `app.config.ts`
4. **Code style**: 2 spaces, no semicolons, single quotes (enforced by Prettier)
5. **Chinese support**: Pinyin fields for tag search, Chinese AI prompts

### Development Tips

1. **Always use absolute imports** with `@/` alias, never relative paths
2. **Check authentication** in server actions using the role guard parameter
3. **AI features** require `OPENAI_API_KEY` and compatible API configuration
4. **Database changes**: Use migrations, avoid `db:push` in development
5. **Testing**: Run specific tests with `pnpm test -- <filename>`
6. **Production flag**: Use `-P` for production environment variables

### Common Tasks

**Adding a new server action**:
1. Create Zod schema in `/src/controllers/schemas/`
2. Implement action in `/src/actions/`
3. Use `makeAction` with appropriate role guard
4. Import in client components and call via `runAction`

**Working with bookmarks**:
- User bookmarks: Use `userBookmarks` table, scoped to userId
- Public bookmarks: Use `publicBookmarks` table, admin-managed
- Search: Use `keywordSearch()` helper, supports pinyin and partial matches

**AI features**:
- Website analysis: Calls `analyzeWebsite()` with URL
- Tag relations: Calls `analyzeRelatedTags()` for semantic grouping
- Debug: Enable `AI_DEBUG=1` in environment variables